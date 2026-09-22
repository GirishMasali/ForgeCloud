# ForgeCloud Master Implementation Plan

**Project:** ForgeCloud — Self-Service Cloud-Native Internal Developer Platform  
**Document Type:** Phased Engineering Implementation Plan  
**Design Baseline:** `docs/reference/` (00–10 PDF Documentation Package)  
**Status:** Planning Stage — Synchronized & Ready for Phase 1 (No application code written yet)

---

## 1. Current Workspace State

- **Directory:** `d:/ForgeCloud`
- **Repository Status:** Git repository initialized on branch `main` with 0 commits.
- **Existing Files & Assets:**
  - `.agents/rules/forgecloud.md` — ForgeCloud project rules and engineering guardrails.
  - `docs/reference/` — Contains 11 comprehensive PDF design specifications (`00` through `10`).
  - `docs/diagrams/` — Contains architectural Mermaid diagrams:
    - `system-architecture.mmd`
    - `deployment-flow.mmd`
    - `network-flow.mmd`
    - `er-diagram.mmd`
  - `docs/PROJECT_ANALYSIS.md` — Synchronized project and architectural analysis.
  - `docs/ARCHITECTURE_DECISIONS.md` — Formal Architecture Decision Records (ADRs).
  - `docs/CURRENT_STATUS.md` — Real-time milestone tracker and pre-flight state.
- **Local Host Tooling:**
  - **Python:** 3.10.11 installed and available.
  - **Node.js:** v22.14.0 installed and available.
  - **PowerShell Policy:** Local script execution policy restricts unbypassed `.ps1` execution. Node commands must be invoked via `cmd /c npm`, `npm.cmd`, or bypassed execution.
  - **Containerization / Cloud Tools:** `docker`, `terraform`, `kubectl`, and AWS CLI are not currently installed or exported in the host system PATH.
  - **AWS Credentials:** Not configured in the local workspace.
- **Rule Verification Status:**
  - Per Project Rules 9 & 10: AWS, EKS, ECR, Terraform, and live Kubernetes operations are classified as:
    > **`NOT VERIFIED — REQUIRES AWS ENVIRONMENT`**

---

## 2. Target Architecture

ForgeCloud implements a self-service, cloud-native control plane backed by decoupled architectural layers:

```
[ Developer / Platform Engineer ]
                |
                v (HTTPS)
+-----------------------------------------------------------+
|                   React Dashboard (SPA)                   |
| 13 Modular Routes / Vanilla CSS Design Tokens / Chart.js  |
+-----------------------------------------------------------+
                |
                v (REST + JWT Bearer)
+-----------------------------------------------------------+
|                   FastAPI Control Plane                   |
| 16 Endpoints / Pydantic Validation / Modular Services     |
+-----------------------------------------------------------+
        |                 |                   |
        v                 v                   v
+---------------+ +-----------------+ +---------------------+
|  PostgreSQL   | | Terraform Engine| |  GitHub Actions CI  |
| SQLAlchemy 2.0| | AWS VPC/EKS/ECR | |  Build & Push Image |
| psycopg2-bin  | |  Modular IaC    | |  to Amazon ECR      |
+---------------+ +-----------------+ +---------------------+
                          |                   |
                          v                   v
                  +-----------------------------------------+
                  |         GitOps Controller (Argo CD)     |
                  |    Reconciles Git State to EKS Cluster  |
                  +-----------------------------------------+
                                      |
                                      v
                  +-----------------------------------------+
                  |       Amazon EKS Cluster Runtime        |
                  |  Ingress -> Service -> Pods (HPA)       |
                  +-----------------------------------------+
                                      |
                                      v
                  +-----------------------------------------+
                  |        Observability & Telemetry        |
                  | Prometheus + Grafana + OTel + CloudWatch|
                  +-----------------------------------------+
```

---

## 3. Project Modules

The platform is partitioned into 10 decoupled modules matching the root repository structure:

```
forgecloud/
├── frontend/             # React.js SPA control plane (Vanilla CSS)
├── backend/              # FastAPI REST API control plane (Python 3.10+)
├── database/             # PostgreSQL migrations, SQLAlchemy schemas, seed data
├── terraform/            # Infrastructure as Code (VPC, IAM, EKS, ECR)
├── kubernetes/           # K8s manifests (Deployments, Services, Ingress, HPA, Probes)
├── argocd/               # GitOps Application manifests & project configs
├── monitoring/           # Prometheus alerts, Grafana dashboards, OpenTelemetry config
├── .github/              # GitHub Actions workflows (test, build, deploy)
└── docs/                 # Documentation, diagrams, verification reports
```

### Module Responsibilities:
1. **Authentication & RBAC:** User registration, password hashing (Argon2/Bcrypt), JWT token generation/validation, role enforcement (`ADMIN`, `DEVELOPER`, `VIEWER`).
2. **Application Management:** Application metadata CRUD, repository bindings, container runtime configuration, and environment isolation.
3. **Infrastructure Provisioning:** Declarative Terraform modules for AWS VPC, networking, IAM roles, EKS clusters, and ECR registries.
4. **Container Build & Registry:** Multi-stage Docker packaging, immutable semantic tagging (`git-SHA`), and Amazon ECR integration.
5. **Deployment Engine:** Release dispatching, state management (`PENDING` -> `BUILDING` -> `DEPLOYING` -> `RUNNING`), and rollback triggers.
6. **Networking:** VPC topology (public/private/isolated subnets), Application Load Balancers, Ingress routes, and Kubernetes NetworkPolicies.
7. **Autoscaling:** Horizontal Pod Autoscaler (HPA) rules scaling pods dynamically on CPU/memory utilization thresholds.
8. **Observability:** Telemetry ingestion via Prometheus, executive visualizations in Grafana, distributed tracing via OpenTelemetry, and log aggregation in CloudWatch.
9. **Rollback & Reliability:** Automated failure detection via readiness probes and one-click rollback to previous known-good deployment versions.
10. **Audit Logging:** Immutable audit ledger recording user ID, action, resource type, resource ID, and operational timestamps.

---

## 4. Development Phases

The implementation proceeds strictly through the 14 sequential phases defined in the reference specifications:

| Phase | Title | Scope & Key Deliverables |
|---|---|---|
| **Phase 1** | **Foundation Setup** | Initialize project directory layout (`frontend`, `backend`, `database`, `terraform`, `kubernetes`, `monitoring`, `argocd`, `.github`). Configure base configs (`package.json`, `pyproject.toml`, `.gitignore`, `.env.example`). |
| **Phase 2** | **Database Schema & Migrations** | Implement PostgreSQL schema using SQLAlchemy ORM and Alembic migrations. Define all 6 entities and indexes. |
| **Phase 3** | **Authentication & RBAC** | Implement JWT authentication, password hashing, user registration/login endpoints, and role-based access decorators in FastAPI. |
| **Phase 4** | **Application Management & Dashboard** | Build application lifecycle API endpoints (`/api/applications`) and construct the 13 React frontend views and navigation layout. |
| **Phase 5** | **Docker Local Workflow** | Create production-ready multi-stage Dockerfiles for frontend, backend, and sample app; build `docker-compose.yml` for unified local execution. |
| **Phase 6** | **Terraform AWS Infrastructure** | Author clean, modular Terraform IaC for VPC, subnets, route tables, IAM roles, ECR, and EKS cluster configuration. |
| **Phase 7** | **Kubernetes Deployment & HPA** | Author Kubernetes manifests: Deployments, Services, Ingress, ConfigMaps, Secrets, Liveness/Readiness probes, and HPA resources. |
| **Phase 8** | **GitHub Actions CI/CD** | Implement automated CI pipelines: `test.yml`, `build.yml`, and `deploy.yml` with ECR authentication and image tagging. |
| **Phase 9** | **Argo CD GitOps Engine** | Define declarative Argo CD Application manifests, sync policies, and automated reconciliation against Git repositories. |
| **Phase 10** | **Observability Integration** | Configure Prometheus scraping, Grafana dashboards, OpenTelemetry tracer instrumentation, and CloudWatch log handlers. |
| **Phase 11** | **Autoscaling & Rollback Workflows** | Implement automated rollback logic in FastAPI and verify HPA scaling thresholds under simulated workloads. |
| **Phase 12** | **Failure Testing & Measurements** | Execute the 3 required empirical reliability experiments: pod termination, failed release rollback, and traffic burst. |
| **Phase 13** | **Security Hardening** | Enforce CORS whitelisting, input sanitization, least-privilege IAM policies, Kubernetes NetworkPolicies, and secrets protection. |
| **Phase 14** | **Final Documentation & Verification** | Consolidate `README.md`, `docs/ForgeCloud_System_Design.md`, and produce `docs/FINAL_VERIFICATION_REPORT.md`. |

### Phase 1 Isolation Guardrail:
> [!IMPORTANT]
> **Phase 1 is strictly restricted to foundation scaffolding.** Later AWS, Kubernetes, Terraform provisioning, or CI/CD pipeline execution must **NOT** be implemented during Phase 1. All phases remain strictly sequential.

---

## 5. Dependencies

### Backend Dependencies (Python 3.10+)
- **Web Framework:** `fastapi`, `uvicorn[standard]`
- **Data Validation & Settings:** `pydantic`, `pydantic-settings`
- **Database & ORM:** `sqlalchemy>=2.0`, `psycopg2-binary`, `alembic`
- **Security & Authentication:** `python-jose[cryptography]`, `passlib[bcrypt]`, `bcrypt`
- **Telemetry & Tracing:** `opentelemetry-api`, `opentelemetry-sdk`, `opentelemetry-instrumentation-fastapi`, `prometheus-client`
- **Testing:** `pytest`, `pytest-asyncio`, `httpx`

### Frontend Dependencies (React 18+ / JavaScript)
- **Core:** `react`, `react-dom`
- **Routing:** `react-router-dom`
- **HTTP Client:** `axios`
- **Visualization:** `lucide-react` (icons), `chart.js` / `react-chartjs-2` (monitoring charts)
- **Styling:** **Vanilla CSS** with custom design tokens (dark mode, glassmorphism, responsive flex/grid layouts) — avoiding external utility CSS frameworks.
- **Build Tool:** `vite`

### DevOps & Infrastructure Tooling
- **Docker:** Engine 24+, Docker Compose v2+
- **Terraform:** HashiCorp Terraform 1.5+ (AWS Provider ~> 5.0)
- **Kubernetes:** `kubectl` 1.28+, Helm 3+
- **GitOps:** Argo CD v2.9+
- **Cloud:** AWS CLI v2 (`aws-cli`)

---

## 6. Local Development Strategy

To ensure zero developer friction and strict isolation:
1. **Mock & Dual-Mode Services:** The FastAPI backend will feature configurable service adapters. When running locally without active AWS credentials, the backend will operate against a local PostgreSQL instance (or SQLite for lightweight test runs) and provide simulated infrastructure responses while strictly labeling them as local mocks.
2. **Docker Compose Stack:** A single `docker-compose.yml` file will launch:
   - `postgres`: Relational database on port `5432` with preloaded seed users and mock applications.
   - `backend`: FastAPI service running with hot-reload on port `8000`.
   - `frontend`: Vite React dev server running on port `5173` with reverse proxying to backend.
3. **Environment Isolation:** Controlled exclusively via `.env.example` templates and `.env` files. Secrets are never checked into version control.

---

## 7. AWS Strategy & Cost Realities

- **Target Architecture:** Single-VPC deployment in region `us-east-1` (or user-selected region).
- **VPC Subnet Topology:**
  - 2 Public Subnets across 2 Availability Zones (`us-east-1a`, `us-east-1b`) for ALBs and NAT Gateways.
  - 2 Private Subnets across 2 AZs for EKS Worker Nodes and Application Pods.
  - 2 Isolated Subnets across 2 AZs for Database storage (RDS or stateful database).
- **AWS Cost Architecture & Cloud Realism:**
  - **No Free Tier for Core Cluster Resources:** Amazon EKS cluster control planes ($0.10/hour, ~$73/month), NAT Gateways (~$0.045/hour plus data processing fees), and Application Load Balancers are **billable paid AWS resources not covered by the AWS Free Tier**.
  - **Cost Mitigation Strategy:**
    1. Deploy minimal worker nodes (`t3.medium` instances, 2 nodes).
    2. Utilize a single NAT Gateway in development rather than multi-AZ NAT to reduce monthly standing charges by 50%.
    3. Keep cloud verification lifecycles concise; clusters are created only when testing requires live AWS verification.
    4. Provide documented manual cleanup procedures (`terraform destroy`). Per Rule 11, destructive commands are never run automatically.
    5. Rely on the local Docker Compose stack and mock adapters during all day-to-day feature development to incur $0 in cloud costs.
- **Verification Rule:**
  Per Project Rule 10, any AWS deployment component that cannot be run due to absent cloud credentials will be explicitly marked:  
  **`NOT VERIFIED — REQUIRES AWS ENVIRONMENT`**  
  No fabricated success logs will ever be generated.

---

## 8. Database Strategy

- **Database Engine:** PostgreSQL 15+.
- **ORM & Data Layer:** Synchronous SQLAlchemy 2.0 with declarative models, request-scoped sessions (`SessionLocal`), connection pooling (`QueuePool`), and the stable `psycopg2-binary` driver. Isolated unit tests can execute against standard SQLite.
- **Migration Framework:** Alembic for automated, versioned schema migrations (`database/alembic/`).
- **Data Integrity Constraints:**
  - Foreign key constraints between `applications` -> `users`, `deployments` -> `applications`, `infrastructure` -> `applications`, `deployment_events` -> `deployments`, and `audit_logs` -> `users`.
  - Check constraints on `role` (`ADMIN`, `DEVELOPER`, `VIEWER`) and `status` (`PENDING`, `BUILDING`, `DEPLOYING`, `RUNNING`, `FAILED`, `ROLLED_BACK`).
  - Unique constraints on `users.email` and `applications.name`.
  - Indexes on `users.email`, `applications.created_by`, `deployments.application_id`, and `audit_logs.timestamp`.

---

## 9. Backend Strategy

- **Architecture:** Layered Architecture following Clean Architecture principles:
  - `routers/`: REST endpoints validating input payloads via Pydantic schemas.
  - `services/`: Encapsulated domain logic (Authentication, Application lifecycle, Deployment dispatch, Infrastructure, Telemetry).
  - `models/`: SQLAlchemy database entities.
  - `schemas/`: Pydantic request and response transfer models.
  - `core/`: Application configuration (Pydantic `BaseSettings`), database session management, and security utilities.
- **Canonical API Surface (16 Endpoints):**
  1. `POST /api/auth/login` — Authenticate user and issue JWT
  2. `GET /api/users/me` — Return current authenticated user profile and role
  3. `GET /api/applications` — List all registered applications
  4. `POST /api/applications` — Register a new application
  5. `GET /api/applications/{id}` — Retrieve details of a specific application
  6. `PUT /api/applications/{id}` — Update configuration of a specific application
  7. `DELETE /api/applications/{id}` — Delete a specific application
  8. `POST /api/applications/{id}/deploy` — Trigger a deployment workflow
  9. `POST /api/applications/{id}/rollback` — Rollback application to a previous deployment
  10. `GET /api/applications/{id}/deployments` — Retrieve deployment history for an application
  11. `GET /api/infrastructure` — Retrieve infrastructure status
  12. `POST /api/infrastructure/provision` — Trigger infrastructure provisioning
  13. `GET /api/metrics` — Retrieve system and application monitoring metrics
  14. `GET /api/logs` — Retrieve application and platform logs
  15. `GET /api/health` — Retrieve system health status (API, DB, EKS, Registry)
  16. `GET /api/audit` — Retrieve platform audit log records

---

## 10. Frontend Strategy

- **Framework:** React 18+ Single Page Application created with Vite.
- **Styling Architecture:** **Vanilla CSS Design System** using custom CSS variables (dark-mode theme, glassmorphic cards, elevation shadows, responsive CSS Grid and Flexbox layouts). Adheres to Project Rule 3 by avoiding external utility CSS frameworks like Tailwind CSS.
- **Component Architecture:**
  - `layouts/`: Master layout with collapsible Sidebar, Header, User Menu, and breadcrumb navigation.
  - `pages/`: 13 specialized route views:
    - `/login`: Clean login form with JWT session persistence.
    - `/dashboard`: High-level operational overview (total apps, running/failed, CPU/memory, P95 latency, recent deployments, health indicators).
    - `/applications`: Application catalog with status indicators and search.
    - `/applications/create`: Application onboarding form (name, repo, branch, port, runtime).
    - `/applications/:id`: Application detail page with replica count, resource graphs, and action buttons (`Deploy`, `Rollback`, `Restart`).
    - `/applications/:id/deployments`: Historical deployment timeline with version status.
    - `/applications/:id/infrastructure`: Provisioned infrastructure status and parameters.
    - `/monitoring`: Cluster-wide metrics visualization (CPU, memory, latency, RPS).
    - `/logs`: Log viewer with search and filtering by level and timestamp.
    - `/infrastructure`: Platform-wide cloud infrastructure overview.
    - `/settings`: Environment and user profile preferences.
    - `/admin/users`: Role management (ADMIN only).
    - `/admin/audit`: Platform audit event stream (ADMIN only).
  - `components/`: Reusable UI elements (`StatusBadge`, `MetricCard`, `DeploymentTable`, `ApplicationForm`, `MetricsChart`, `ConfirmModal`).
  - `services/`: Axios API client instances with automatic JWT header injection and interceptors.

---

## 11. Docker Strategy

- **Hermetic Multi-Stage Builds:**
  - `frontend/Dockerfile`: Multi-stage build (Node build stage -> Nginx alpine production runtime).
  - `backend/Dockerfile`: Multi-stage build (Python wheel build stage -> non-root python-slim runtime).
- **Security Best Practices:**
  - Dedicated non-root users (`USER appuser`) inside containers.
  - Minimized layer count and no cached package indices.
  - `.dockerignore` files excluding `.git`, `node_modules`, `__pycache__`, `.env`, and local artifacts.

---

## 12. Kubernetes Strategy

- **Namespace Isolation:** Dedicated namespaces (`forgecloud-system` for control plane and `forgecloud-apps` for managed workloads).
- **Workload Definitions:**
  - `Deployment`: Enforces desired replica count, rolling update strategy (`maxSurge: 1`, `maxUnavailable: 0`).
  - `Service`: ClusterIP services providing stable internal DNS discovery.
  - `Ingress`: AWS Load Balancer Controller annotations mapping public traffic to services.
  - `ConfigMap` & `Secret`: Environment configuration decoupling without hardcoded credentials.
- **Reliability Probes:**
  - `readinessProbe`: HTTP GET `/healthz` ensuring traffic is only routed to ready pods.
  - `livenessProbe`: HTTP GET `/healthz` detecting deadlocks and restarting unhealthy pods.
- **Resource Management:** Strict `requests` (e.g., `100m` CPU, `128Mi` RAM) and `limits` (e.g., `500m` CPU, `512Mi` RAM) to enable deterministic scheduling.
- **HPA:** Targets 70% average CPU utilization, scaling replicas between 2 and 6.

---

## 13. CI/CD Strategy

- **Workflow Architecture (`.github/workflows/`):**
  1. `test.yml`: Triggered on pull requests and commits. Runs pytest, flake8, and npm test.
  2. `build.yml`: Triggered on merge to `main`. Authenticates to AWS via GitHub OIDC / Secrets, builds Docker container, tags with Git commit SHA and `latest`, and pushes to Amazon ECR.
  3. `deploy.yml`: Updates the declarative Kubernetes deployment manifest / Helm values file in the repository with the newly published image tag.
- **Traceability:** Releases use immutable image tags matching the exact Git commit SHA.

---

## 14. GitOps Strategy

- **Tool:** Argo CD.
- **Model:** Pull-based declarative GitOps.
- **Manifest Architecture:**
  - `argocd/applications/`: Contains Argo CD Application custom resources pointing to the application manifest directory.
  - Desired state is committed to Git; Argo CD continuously monitors the repository and synchronizes live cluster state.
- **Automated Rollback:** If a newly synchronized release fails health checks or crashes, rolling back in Git instantly prompts Argo CD to revert the cluster to the previous known-good deployment.

---

## 15. Observability Strategy

- **Four Golden Signals:**
  - **Latency:** Request duration and P95 latency tracked across API and application pods.
  - **Traffic:** Request rate (Requests Per Second) scraped via Prometheus.
  - **Errors:** HTTP 5xx error rate and container crash counts.
  - **Saturation:** Node and pod CPU/memory utilization against allocated limits.
- **Distributed Tracing:** OpenTelemetry SDK integrated into FastAPI backend to propagate trace and span contexts.
- **Centralized Logging:** JSON-structured logs captured from container stdout/stderr, streamable to CloudWatch and surfaced in ForgeCloud's `/logs` view.
- **Dashboards:** Pre-provisioned Grafana dashboard JSON models displaying cluster health, application metrics, and deployment frequency.

---

## 16. Security Strategy

- **Authentication & Authorization:** Secure JWT access tokens with configurable expiration (e.g. 60 minutes), Argon2/Bcrypt password hashing, and role checks on all mutating API endpoints.
- **AWS IAM Least Privilege:** Dedicated IAM roles for EKS cluster, node groups, and GitHub Actions CI runner with strictly scoped policies.
- **Secrets Management:** Secrets loaded exclusively via environment variables or Kubernetes Secrets. Zero plaintext credentials committed to version control.
- **Network Security:**
  - Private subnet isolation for application workloads.
  - Isolated database subnets accessible only by application worker nodes.
  - Kubernetes NetworkPolicies restricting inter-pod lateral movement.
  - CORS middleware configured with explicit allowed origins.
- **Audit Logging:** Every mutating administrative action is recorded immutably in `audit_logs` with timestamps, actor IDs, and IP metadata.

---

## 17. Testing Strategy

A multi-tiered testing hierarchy guarantees platform quality:
1. **Unit Testing:**
   - Backend: `pytest` tests validating Pydantic models, auth tokens, password hashing, and service layer logic.
   - Frontend: Component testing for UI elements and form validation.
2. **API Contract & Integration Testing:**
   - Integration tests using FastAPI `TestClient` verifying all 16 API endpoints across the 6 router domains, status codes, and error payloads.
   - Database integration tests executing actual migrations and relational queries against test database.
3. **End-to-End Workflow Testing:**
   - Automated scripts verifying the complete developer journey: Register -> Login -> Create App -> Trigger Deploy -> Verify Deployment Status.

---

## 18. Failure-Testing Strategy

Per reference specification `08_ForgeCloud_Observability_Security_Reliability.pdf`, ForgeCloud incorporates three empirical reliability experiments:

1. **Pod Termination & Self-Healing Experiment:**
   - **Procedure:** Execute `kubectl delete pod` on an active application replica.
   - **Expected Outcome:** Kubernetes Deployment controller immediately detects pod loss, provisions a replacement pod, verifies readiness probes, and returns replica count to target within `< 15 seconds`.
   - **Metrics Captured:** Pod recovery duration, cluster error rate, and application availability during failover.
2. **Faulty Release & Rollback Experiment:**
   - **Procedure:** Deploy an engineered container image with a broken readiness probe or failing entrypoint.
   - **Expected Outcome:** The deployment enters `FAILED` status, traffic routing to faulty pods is blocked, and rollback to the previous known-good deployment restores service.
   - **Metrics Captured:** Time to detect failure, rollback duration, and HTTP 5xx rate.
3. **Load-Induced Autoscaling Experiment:**
   - **Procedure:** Generate high concurrent request volume using a load testing tool (e.g. Apache Bench / Locust).
   - **Expected Outcome:** Pod CPU utilization exceeds the 70% threshold, triggering the Horizontal Pod Autoscaler (HPA) to scale pods from 2 to up to 6 replicas. When load subsides, HPA scales in gracefully.
   - **Metrics Captured:** P95 latency under load, replica scale-out curve, and stabilization time.

---

## 19. Risks & Mitigations

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| **AWS Cloud Costs** | Unintended cloud spending from paid services (EKS control plane, NAT, ALB). | Enforce minimal instance sizing (`t3.medium`), single NAT in dev, short cluster test durations, budget alerts, and documented manual teardown procedures. Rely on local Docker Compose mocks during development. |
| **Missing Local CLI Tools (`docker`, `terraform`, `kubectl`)** | Local validation commands fail in host environment. | Implement dual-mode mock adapters in FastAPI backend, allowing complete functional UI and API testing even prior to tool installation. |
| **Windows PowerShell Script Execution Restrictions** | `npm` or shell script invocation errors. | Standardize invocation using `cmd /c npm` or explicitly bypassed PowerShell execution policies. |
| **Configuration Drift between Git and Cluster** | Kubernetes resources out of sync with code. | Mandate Argo CD GitOps synchronization. No manual `kubectl apply` commands in production environments. |
| **Secret Exposure** | Leaked cloud keys or database credentials. | Strict use of `.env` files, `.gitignore`, AWS Secrets Manager / Kubernetes Secrets, and automated pre-commit scanning. |

---

## 20. Verification Criteria & Acceptance Protocol

Before any phase is marked complete, it must satisfy the following verification protocol:
1. **Build & Lint Verification:** Code must compile and pass static analysis without warnings or syntax errors.
2. **Automated Test Suite:** All unit and API integration tests must pass with 100% success rate.
3. **API Contract Verification:** Endpoints must return exact HTTP status codes and schemas defined in the reference documents.
4. **Cloud & Cluster Verification Notice:**
   - In environments where AWS credentials, EKS clusters, or Terraform runners are active, resources must be verified via actual command execution.
   - In environments lacking AWS credentials, all cloud-dependent functionality must be explicitly documented with:
     > **`NOT VERIFIED — REQUIRES AWS ENVIRONMENT`**
   - Fabrication of cloud deployment results is strictly prohibited.
5. **Documentation Synchronization:** Architectural diagrams, API specs, and implementation code must remain 100% synchronized at all times.
