# ForgeCloud Architecture Decision Records (ADRs)

**Project:** ForgeCloud — Self-Service Cloud-Native Internal Developer Platform  
**Document Type:** Formal Architectural Decisions  
**Design Baseline:** `docs/reference/` (PDF Design Package 00–10)  
**Status:** Approved & Synchronized  

---

## Index of Architectural Decisions

- [ADR-001: Frontend Styling Architecture & Framework Selection](#adr-001-frontend-styling-architecture--framework-selection)
- [ADR-002: Database Access Layer & PostgreSQL Driver Standard](#adr-002-database-access-layer--postgresql-driver-standard)
- [ADR-003: Canonical REST API Surface & Endpoint Inventory](#adr-003-canonical-rest-api-surface--endpoint-inventory)
- [ADR-004: AWS Cost Realism & Infrastructure Footprint](#adr-004-aws-cost-realism--infrastructure-footprint)
- [ADR-005: 14 Sequential Development Phases & Phase 1 Scoping](#adr-005-14-sequential-development-phases--phase-1-scoping)
- [ADR-006: Truth-in-Testing & Cloud Verification Notice](#adr-006-truth-in-testing--cloud-verification-notice)
- [ADR-007: Dual-Mode Service Architecture for Local Development](#adr-007-dual-mode-service-architecture-for-local-development)

---

## ADR-001: Frontend Styling Architecture & Framework Selection

### Status: Approved

### Context:
The reference document `02_ForgeCloud_Frontend_Design.pdf` specifies React.js, JavaScript, REST API integration, and Charts/UI components. Project Rule 3 strictly forbids introducing unnecessary technologies, and general web engineering rules mandate Vanilla CSS for maximum design control, explicitly avoiding Tailwind CSS unless explicitly requested.

### Decision:
ForgeCloud will implement a **pure Vanilla CSS Design System** located in `frontend/src/styles/`:
1. Use standard CSS3 custom properties (`variables.css`) for theme tokens: curated dark-mode backgrounds, glowing accent gradients, glassmorphism (`backdrop-filter`), elevation shadows, and status colors (running, failed, pending).
2. Utilize native CSS Grid and Flexbox for responsive dashboard layouts.
3. Remove all references to Tailwind CSS across the planning and architectural documentation.

### Consequences:
- **Positive:** Zero third-party CSS compilation overhead, no utility framework lock-in, faster build times with Vite, clean maintainable CSS adhering to Project Rule 3.
- **Negative:** Component styles must be authored using organized CSS modules or stylesheets rather than inline utility classes.

---

## ADR-002: Database Access Layer & PostgreSQL Driver Standard

### Status: Approved

### Context:
The planning documents initially exhibited an ambiguity between "asynchronous/declarative mapping" and the `psycopg2-binary` driver. In Python, `psycopg2-binary` is synchronous; async SQLAlchemy requires `asyncpg`. Additionally, Alembic schema migrations natively run synchronous operations.

### Decision:
Standardize on **SQLAlchemy 2.0 with synchronous declarative mapping and `psycopg2-binary`**:
1. Use standard synchronous connection pooling via `QueuePool`.
2. Session lifecycle managed cleanly via FastAPI dependency injection:
   ```python
   def get_db():
       db = SessionLocal()
       try:
           yield db
       finally:
           db.close()
   ```
3. Alembic migrations operate against the same synchronous engine and `psycopg2-binary` driver.
4. For isolated local unit tests, SQLAlchemy will support an in-memory or file-based SQLite database with zero external prerequisites.

### Consequences:
- **Positive:** Eliminates dual-driver confusion, ensures 100% compatibility with Alembic, provides the simplest, most stable, and most explainable architecture (Project Rules 15 & 16).
- **Negative:** Endpoints performing database operations run via standard FastAPI threadpool workers rather than pure async coroutines (completely standard for I/O bound database interactions).

---

## ADR-003: Canonical REST API Surface & Endpoint Inventory

### Status: Approved

### Context:
An inconsistency was detected in earlier draft documentation where an integration test reference mentioned "12 API endpoints", while the actual API surface defined in `03_ForgeCloud_Backend_API_Design.pdf` contained 16 endpoints.

### Decision:
The canonical API surface is strictly verified and documented as **16 endpoints** partitioned across 6 router modules:

| Router | Method | Endpoint | Purpose |
|---|---|---|---|
| **Auth** | `POST` | `/api/auth/login` | Authenticate user credentials and issue JWT Bearer token |
| **Users** | `GET` | `/api/users/me` | Return authenticated user identity, email, and assigned RBAC role |
| **Applications** | `GET` | `/api/applications` | List all registered applications with summary status |
| **Applications** | `POST` | `/api/applications` | Register a new application definition |
| **Applications** | `GET` | `/api/applications/{id}` | Retrieve specific application configuration, health, and status |
| **Applications** | `PUT` | `/api/applications/{id}` | Update application repository, port, branch, or runtime settings |
| **Applications** | `DELETE` | `/api/applications/{id}` | Remove an application and disassociate associated metadata |
| **Deployments** | `POST` | `/api/applications/{id}/deploy` | Trigger build and deployment workflow for application |
| **Deployments** | `POST` | `/api/applications/{id}/rollback` | Trigger rollback to the previous known-good deployment version |
| **Deployments** | `GET` | `/api/applications/{id}/deployments` | Retrieve chronological deployment release history |
| **Infrastructure** | `GET` | `/api/infrastructure` | Query cloud infrastructure status and cluster parameters |
| **Infrastructure** | `POST` | `/api/infrastructure/provision` | Trigger declarative Terraform provisioning of AWS infrastructure |
| **Monitoring** | `GET` | `/api/metrics` | Return real-time CPU, memory, P95 latency, and throughput metrics |
| **Logs** | `GET` | `/api/logs` | Query structured platform and container application logs |
| **Health** | `GET` | `/api/health` | Return overall platform health across API, DB, EKS, and Registry |
| **Audit** | `GET` | `/api/audit` | Query immutable security and administrative audit event records |

### Consequences:
- **Positive:** Guarantees 1:1 synchronization between backend implementation, frontend service consumers, and automated integration test coverage.

---

## ADR-004: AWS Cost Realism & Infrastructure Footprint

### Status: Approved

### Context:
Educational and demonstration cloud platforms must balance real cloud architecture against billing realities. It is critical never to claim or imply that AWS container infrastructure is covered by the AWS Free Tier.

### Decision:
1. **Fact-Based Cloud Cost Architecture:**
   - Amazon EKS cluster control plane ($0.10/hour, ~$73/month) has **no Free Tier**.
   - AWS NAT Gateways (~$0.045/hour plus data transit) have **no Free Tier**.
   - AWS Application Load Balancers (ALB) incur hourly and LCU charges with **no permanent Free Tier**.
2. **Cost Minimization & Teardown Guardrails:**
   - EKS Managed Node Groups will use `t3.medium` instances (2 nodes minimum).
   - The development environment VPC uses a **single NAT Gateway** rather than multi-AZ NAT, reducing monthly standing charges by 50%.
   - EKS clusters are treated as test infrastructure and should be created on-demand for live verification rather than running 24/7.
   - Comprehensive teardown instructions (`terraform destroy`) must be documented.
   - Per Project Rule 11, `terraform destroy` will never be run automatically.
   - Initial application and API development occurs 100% locally via Docker Compose and mock adapters, incurring $0 cloud costs.

### Consequences:
- **Positive:** Prevents unexpected cloud bills, provides realistic cloud engineering education, and satisfies Project Rule 16.

---

## ADR-005: 14 Sequential Development Phases & Phase 1 Scoping

### Status: Approved

### Context:
To avoid uncontrolled monolithic code generation, reference document `10_ForgeCloud_Antigravity_SuperPrompt.pdf` prescribes 14 sequential implementation phases. Strict boundary enforcement is required to prevent premature implementation of later cloud or Kubernetes steps during early phases.

### Decision:
1. The 14 phases must remain strictly sequential:
   - Phase 1: React + FastAPI + PostgreSQL + Docker foundation.
   - Phase 2: Database schema and migrations.
   - Phase 3: Authentication and RBAC.
   - Phase 4: Application management and dashboard.
   - Phase 5: Docker local workflow.
   - Phase 6: Terraform AWS VPC/IAM/EKS/ECR.
   - Phase 7: Kubernetes deployments, services, ingress, probes and HPA.
   - Phase 8: GitHub Actions and ECR.
   - Phase 9: Argo CD GitOps.
   - Phase 10: Prometheus, Grafana, OpenTelemetry and CloudWatch.
   - Phase 11: Autoscaling and rollback.
   - Phase 12: Failure testing and measurements.
   - Phase 13: Security hardening.
   - Phase 14: Final documentation, diagrams and verification.
2. **Phase 1 Scoping Rule:**
   Phase 1 is strictly restricted to foundation repository setup, base directory layout, root `.gitignore`, `.env.example`, `backend/pyproject.toml`, `frontend/package.json`, and initial configuration.
   **NO Terraform provisioning, NO live AWS calls, NO Kubernetes manifest application, and NO CI/CD pipeline execution will occur during Phase 1.**

### Consequences:
- **Positive:** Prevents code chaos, maintains high testability, and allows progressive verification at each step.

---

## ADR-006: Truth-in-Testing & Cloud Verification Notice

### Status: Approved

### Context:
Per Project Rules 9 and 10:
- Rule 9: "Never claim AWS, EKS, ECR, Terraform or Kubernetes functionality has been verified unless it was actually executed and verified."
- Rule 10: "If something requires AWS but AWS has not been configured, state: `NOT VERIFIED — REQUIRES AWS ENVIRONMENT`"

### Decision:
Every document, test suite, and status report will strictly adhere to truth-in-testing:
1. When local tests pass (e.g. pytest, npm test, sqlite/postgres local DB), report them as verified locally.
2. Any component that targets AWS (Terraform execution, EKS deployment, ECR push, CloudWatch logs, Argo CD on EKS) that has not been executed against live AWS infrastructure will be prominently labeled:
   > **`NOT VERIFIED — REQUIRES AWS ENVIRONMENT`**
3. Fabricated or simulated cloud deployment metrics will never be presented as actual cloud results (Rule 7).

### Consequences:
- **Positive:** Complete engineering integrity, preventing false claims of cloud verification.

---

## ADR-007: Dual-Mode Service Architecture for Local Development

### Status: Approved

### Context:
Developers working locally without immediate AWS credentials or without Docker installed must still be able to run, develop, and test the FastAPI backend and React frontend.

### Decision:
The FastAPI backend service layer (`backend/app/services/`) will feature dual-mode adapter interfaces:
1. **Local/Mock Mode (Default when `AWS_REGION` or credentials absent):**
   - Application lifecycle and deployment state transitions simulate progress (`PENDING` -> `BUILDING` -> `DEPLOYING` -> `RUNNING`).
   - Infrastructure provisioning records simulated state changes in PostgreSQL without calling AWS APIs.
   - Metrics and logs endpoints return structured synthetic operational data, clearly identified as local test telemetry.
2. **Live Cloud Mode (Active when AWS credentials and EKS cluster are configured):**
   - Interacts with AWS Boto3, Terraform CLI, and Kubernetes API.
   - Pulls real CloudWatch logs and Prometheus metrics.

### Consequences:
- **Positive:** Full functionality of the 13 frontend screens and 16 backend API endpoints can be exercised and verified locally on day one without cloud costs or external blockers.
