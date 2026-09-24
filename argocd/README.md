# ForgeCloud Argo CD GitOps Engine Layer (Phase 9)

This directory contains the declarative Argo CD GitOps manifests and validation tooling implementing Phase 9 of the ForgeCloud platform architecture.

---

## 1. Directory Structure

```text
argocd/
├── namespace.yaml           # Dedicated namespace manifest for Argo CD control plane (argocd)
├── application.yaml         # Declarative Argo CD Application managing ForgeCloud workloads
├── validate_argocd.py       # Automated static, structural & GitOps integration validator
└── README.md                # GitOps architecture, configuration and reconciliation documentation
```

---

## 2. GitOps Architecture & Reconciliation Flow

ForgeCloud employs Git as the single source of truth for all Kubernetes desired-state configurations:

```text
Developer Push / Merge to 'main'
              |
              v
   Canonical Git Repository (main)
   (https://github.com/GirishMasali/ForgeCloud.git)
              |
      +-------+-------+
      |               |
      v               v
GitHub Actions      Argo CD Engine (in-cluster)
(CI/Docker/ECR)      (Control Plane in 'argocd' namespace)
                      |
                      | 1. Continuously polls Git 'main' branch
                      | 2. Detects drift or state changes
                      | 3. Reconciles desired state to live state
                      v
             Kubernetes API Server (https://kubernetes.default.svc)
                      |
        +-------------+-------------+
        |                           |
        v                           v
forgecloud-system namespace   forgecloud-apps namespace
  - backend (FastAPI)           - sample-backend-service
  - frontend (React SPA)
```

---

## 3. Argo CD Application Specification

The root application resource is defined declaratively in `argocd/application.yaml`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: forgecloud
  namespace: argocd
  labels:
    app.kubernetes.io/name: forgecloud
    app.kubernetes.io/part-of: forgecloud
    app.kubernetes.io/component: gitops-application
    app.kubernetes.io/managed-by: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/GirishMasali/ForgeCloud.git
    targetRevision: main
    path: kubernetes
    directory:
      recurse: true
  destination:
    server: https://kubernetes.default.svc
    namespace: forgecloud-system
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
      - PruneLast=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

### Key Configuration Elements:
- **`apiVersion: argoproj.io/v1alpha1` & `kind: Application`**: Standard Custom Resource Definition for Argo CD applications.
- **`metadata.finalizers`**: Includes `resources-finalizer.argocd.argoproj.io` to ensure clean cascading deletion of managed Kubernetes resources if the application is removed.
- **`spec.project: default`**: References the standard Argo CD AppProject with default cluster and namespace authorizations.
- **`spec.source`**:
  - `repoURL`: `https://github.com/GirishMasali/ForgeCloud.git` (canonical project repository).
  - `targetRevision`: `main` (canonical production release branch).
  - `path`: `kubernetes` (directory containing all declarative Kubernetes manifests).
  - `directory.recurse`: `true` (enables recursive traversal across all Phase 7 subdirectories: `namespaces/`, `config/`, `secrets/`, `serviceaccounts/`, `deployments/`, `services/`, `ingress/`, `autoscaling/`).
- **`spec.destination`**:
  - `server`: `https://kubernetes.default.svc` (in-cluster Kubernetes API server).
  - `namespace`: `forgecloud-system` (default fallback namespace; individual manifests specify their explicit target namespace).
- **`spec.syncPolicy`**:
  - `automated.prune: true`: Automatically removes Kubernetes resources from the cluster when their manifests are deleted from Git.
  - `automated.selfHeal: true`: Automatically detects configuration drift in the live cluster and forces live state back into alignment with Git desired state.
  - `syncOptions`:
    - `CreateNamespace=true`: Automatically creates target namespaces if they do not already exist.
    - `PruneLast=true`: Ensures that pruned resources are deleted only after all newly added or modified resources are healthy, preventing service disruption.
  - `retry`: Exponential backoff retry mechanism (5 attempts starting at 5s, doubling up to a maximum duration of 3m) to handle transient API or network disruptions.

---

## 4. Namespace Architecture & Separation of Concerns

Argo CD enforces strict operational boundaries across cluster namespaces:

| Namespace | Role | Contents | Managed By |
|---|---|---|---|
| **`argocd`** | GitOps Control Plane | Argo CD server, repo-server, application-controller, Redis, notifications | Manifest: `argocd/namespace.yaml` |
| **`forgecloud-system`** | Platform Core Workloads | `backend` (FastAPI), `frontend` (React Nginx), Ingress, ConfigMaps, HPAs | Argo CD Application (`kubernetes/`) |
| **`forgecloud-apps`** | User & Sample Applications | `sample-backend-service`, Ingress, ConfigMaps, HPAs | Argo CD Application (`kubernetes/`) |

> **Security Rule**: The Argo CD control plane resides strictly within the `argocd` namespace. Platform application workloads and developer tenant workloads never share a namespace with the GitOps engine.

---

## 5. Integration with Phase 7 Kubernetes Layer

Argo CD does not duplicate or modify existing manifests. It directly tracks the complete declarative suite established in Phase 7 (`kubernetes/`):

- **Namespaces:** `01-forgecloud-system-namespace.yaml`, `02-forgecloud-apps-namespace.yaml`
- **Configurations:** `backend-configmap.yaml`, `sample-app-configmap.yaml`
- **Secrets:** `backend-secret.yaml` (safe placeholders)
- **ServiceAccounts:** `backend-serviceaccount.yaml`, `frontend-serviceaccount.yaml`, `sample-app-serviceaccount.yaml`
- **Deployments:** `backend-deployment.yaml`, `frontend-deployment.yaml`, `sample-app-deployment.yaml`
- **Services:** `backend-service.yaml`, `frontend-service.yaml`, `sample-app-service.yaml`
- **Ingresses:** `platform-ingress.yaml`, `sample-app-ingress.yaml`
- **Autoscaling:** `backend-hpa.yaml`, `sample-app-hpa.yaml`

---

## 6. Integration with Phase 8 GitHub Actions CI/CD & Deployment Authority

### The Source-of-Truth Architectural Boundary
A foundational principle of GitOps is that there must be **exactly one authoritative deployment mechanism** for the target cluster:

- **Potential Source-of-Truth Conflict:** In Phase 8, `.github/workflows/deploy.yml` directly updated live deployments using `kubectl set image` upon every push. If GitHub Actions mutates live pod images in the cluster while Argo CD enforces Git as the desired state (`selfHeal: true`), Argo CD detects the live cluster image as configuration drift and immediately reconciles it back to the state declared in Git. This creates a destructive dual-authority conflict.
- **Architectural Resolution:** Normal production delivery follows a clean, decoupled boundary:
  ```text
  GitHub Repository
         |
         +--> GitHub Actions (CI & Image Publishing)
         |      - test.yml: Unit tests & frontend production build
         |      - build.yml: Hermetic Docker builds & ECR publishing (immutable Git SHA tags)
         |
         +--> Git Desired Kubernetes State (kubernetes/)
                |
                v
         Argo CD GitOps Engine
                |
                v
         Amazon EKS Cluster
  ```
- **Role of `deploy.yml`:** `.github/workflows/deploy.yml` is retained without redesign for:
  1. Initial cluster bootstrapping prior to Argo CD control plane installation.
  2. Manual emergency deployments or operational diagnostics via `workflow_dispatch`.
  3. Optional direct CI deployment mode via repository variable (`ENABLE_DIRECT_DEPLOY = 'true'`).
  By default, automated direct deployment after `build.yml` is disabled, ensuring that GitHub Actions does NOT continuously mutate the cluster behind Argo CD's back. Normal continuous reconciliation flows exclusively through Argo CD.

---

## 7. Argo CD Installation Boundary

It is important to distinguish between **GitOps configuration manifests** and the **Argo CD control plane software**:

1. **What is defined in this repository (`argocd/`):**
   - `argocd/namespace.yaml`: Declares the dedicated, isolated `argocd` namespace.
   - `argocd/application.yaml`: Declares the root Argo CD `Application` custom resource configuring Git repository tracking, destination cluster, and sync policies.
2. **What is NOT bundled in this repository:**
   - The upstream Argo CD controller, API server, repository server, Redis cache, and Custom Resource Definitions (CRDs such as `applications.argoproj.io`) are NOT authored here.
   - In a production rollout, the Argo CD software is installed into the `argocd` namespace using the official upstream manifests (e.g., `kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml`) or the official Helm chart during infrastructure bootstrapping.
3. **Live Status:**
   - Actual installation and execution of the Argo CD control plane in Amazon EKS remains:
     **`NOT VERIFIED — REQUIRES AWS ENVIRONMENT`**

---

## 8. Static Validation

Phase 9 manifests are validated locally using `argocd/validate_argocd.py`:

```bash
python argocd/validate_argocd.py
```

The validator verifies:
- YAML syntax of all files in `argocd/`.
- Schema validity of the `Application` and `Namespace` manifests.
- Correct Git repository URL, target branch (`main`), and recursive path (`kubernetes`).
- Existence and integrity of all referenced Phase 7 Kubernetes manifests.
- Destination server and namespace boundaries.
- Sync policy correctness (`automated`, `prune`, `selfHeal`, retry backoff).
- Zero committed secrets or credentials.
- Zero premature Phase 10+ resources (no Prometheus/Grafana/OTel).

---

## 9. AWS Verification Status

Because AWS infrastructure is not currently connected in this local environment:

* Argo CD control plane installation into live EKS: **NOT VERIFIED - REQUIRES AWS ENVIRONMENT**
* Live synchronization against GitHub: **NOT VERIFIED - REQUIRES AWS ENVIRONMENT**
* Live drift detection & self-healing: **NOT VERIFIED - REQUIRES AWS ENVIRONMENT**
* Live resource pruning: **NOT VERIFIED - REQUIRES AWS ENVIRONMENT**
