# ForgeCloud GitHub Actions CI/CD Layer (Phase 8)

This directory contains the GitHub Actions workflows and validation tooling implementing Phase 8 of the ForgeCloud platform architecture.

---

## 1. Directory Structure

```text
.github/
├── workflows/
│   ├── test.yml                 # Automated testing & frontend build validation
│   ├── build.yml                # Docker hermetic builds, AWS OIDC & ECR publishing
│   └── deploy.yml               # Declarative deployment to Amazon EKS using kubectl
├── validate_workflows.py        # Automated static & structural workflow validator
└── README.md                    # Architecture and workflow documentation
```

---

## 2. CI/CD Architecture & Workflow Pipeline

The pipeline implements an automated, secure delivery flow with strict dependency barriers:

```text
Developer Push / PR
        |
        v
+-------------------------------+
|  1. test.yml                  |
|  - Python 3.10 Pytest (60/60) |
|  - Node.js 22 Vite Build      |
+-------------------------------+
        | (success on main)
        v
+-------------------------------+
|  2. build.yml                 |
|  - Hermetic Docker builds     |
|  - AWS OIDC Authentication    |
|  - Amazon ECR Login           |
|  - Immutable Git SHA Tagging  |
|  - ECR Image Push             |
+-------------------------------+
        | (success on main)
        v
+-------------------------------+
|  3. deploy.yml                |
|  - Client-side Dry Run        |
|  - AWS OIDC Authentication    |
|  - Amazon EKS kubeconfig      |
|  - Apply K8s Manifests        |
|  - Update Workload Images     |
|  - Verify Rollout Status      |
+-------------------------------+
```

---

## 3. Workflow Specifications

### 1. `test.yml` (Test & Validate)
- **Triggers:** `push` (branch: `main`), `pull_request` (branch: `main`), `workflow_dispatch`.
- **Permissions:** `contents: read` (least privilege).
- **Jobs:**
  - `backend-tests`: Configures Python 3.10, installs `backend/requirements.txt`, and executes the complete 60-test pytest suite.
  - `frontend-build`: Configures Node.js 22, installs frontend dependencies, and executes `npm run build` validating production Vite bundle compilation.
- **Failure Barrier:** Any failure halts the pipeline and prevents downstream release packaging.

### 2. `build.yml` (Build & Package Container Images)
- **Triggers:** `workflow_run` (triggered upon `Test & Validate` completion on `main`), `workflow_dispatch` (optional custom `image_tag`).
- **Permissions:** `id-token: write` (for AWS STS OIDC federation), `contents: read`.
- **Execution Condition:** `github.event.workflow_run.conclusion == 'success'` (or `workflow_dispatch`).
- **Jobs:**
  - `build-and-push`:
    1. Resolves immutable release image tag from Git commit SHA (`${{ github.event.workflow_run.head_sha || github.sha }}`).
    2. Builds local Docker images using existing Phase 5 Dockerfiles (`backend/Dockerfile`, `frontend/Dockerfile`, `sample-app/Dockerfile`).
    3. Authenticates to AWS via GitHub Actions OIDC (`aws-actions/configure-aws-credentials@v4`) using the IAM role provisioned in Phase 6 (`terraform/modules/iam/`).
    4. Authenticates to Amazon ECR (`aws-actions/amazon-ecr-login@v2`).
    5. Tags and pushes immutable SHA and `latest` tags to ECR repositories.

### 3. `deploy.yml` (Deploy to Amazon EKS)
- **Triggers:** `workflow_run` (triggered upon `Build & Package Container Images` completion on `main`), `workflow_dispatch` (optional custom `image_tag`).
- **Permissions:** `id-token: write`, `contents: read`.
- **Execution Condition:** `github.event.workflow_run.conclusion == 'success'` (or `workflow_dispatch`).
- **Jobs:**
  - `deploy-to-eks`:
    1. Resolves deployment image tag matching the build artifact commit SHA.
    2. Validates declarative manifests via client-side dry-run (`kubectl apply --dry-run=client -R -f kubernetes/`).
    3. Authenticates to AWS via OIDC and updates cluster kubeconfig (`aws eks update-kubeconfig`).
    4. Applies foundational manifests (`namespaces/`, `config/`, `serviceaccounts/`, `services/`, `ingress/`, `autoscaling/`).
    5. Deploys Phase 7 workloads (`deployments/`) and updates container images using `kubectl set image` with the immutable commit SHA tag.
    6. Monitors rollout completion via `kubectl rollout status` with 180s timeout.

---

## 4. Workload, Dockerfile & ECR Mapping

| Workload | Component | Dockerfile | ECR Repository | Immutable Image Tag | Additional Tag | Kubernetes Target |
|---|---|---|---|---|---|---|
| **backend** | FastAPI Control Plane | `backend/Dockerfile` | `forgecloud-apps` | `backend-${COMMIT_SHA}` | `backend-latest` | `deployment/backend` (`forgecloud-system`) |
| **frontend** | React Nginx SPA | `frontend/Dockerfile` | `forgecloud-apps` | `frontend-${COMMIT_SHA}` | `frontend-latest` | `deployment/frontend` (`forgecloud-system`) |
| **sample-app** | Sample Microservice | `sample-app/Dockerfile` | `sample-backend-service` | `${COMMIT_SHA}` | `latest` | `deployment/sample-backend-service` (`forgecloud-apps`) |

---

## 5. Security & Authentication Model

1. **GitHub OIDC Federation:**
   - Workflows authenticate to AWS using OpenID Connect (OIDC) through `aws-actions/configure-aws-credentials@v4` with audience `sts.amazonaws.com`.
   - **Zero long-lived credentials:** No `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` are stored or used in the repository.
   - IAM role assumption is constrained by the trust policy in `terraform/modules/iam/` restricting access to `repo:GirishMasali/ForgeCloud:*`.
2. **Least Privilege Permissions:**
   - `test.yml`: `contents: read`.
   - `build.yml` & `deploy.yml`: strictly `id-token: write` and `contents: read`.
3. **Secret Isolation:**
   - Production database credentials and JWT signing keys are managed securely in EKS without committing secrets to version control.

---

## 6. Local Validation

Workflows are statically and structurally verified without requiring live AWS or cluster connectivity:

```powershell
python .github/validate_workflows.py
```

---

## 7. Cloud Verification Notice

Per Project Rule 10:
> **`NOT VERIFIED — REQUIRES AWS ENVIRONMENT`**

All live AWS interactions (OIDC role assumption, ECR push, EKS kubeconfig updates, and live pod deployments) require an active AWS cloud environment and are classified as `NOT VERIFIED — REQUIRES AWS ENVIRONMENT`.
