# ForgeCloud

> **Self-Service Cloud-Native Internal Developer Platform for Automated Deployment, Networking & Observability**

ForgeCloud is a self-service internal developer platform (IDP) that enables software engineers to create, configure, deploy, monitor, scale, and manage cloud-native applications through an intuitive web-based control plane. It abstracts complex infrastructure operations into automated workflows using Infrastructure as Code (IaC), containerization, Kubernetes, CI/CD pipelines, and declarative GitOps synchronization.

---

## Technology Stack

ForgeCloud uses a dedicated, modern cloud-native stack designed for modularity, observability, and explainability:

| Layer | Technology | Architectural Role |
|---|---|---|
| **Frontend** | React.js (JavaScript) | Single Page Application (SPA) developer control plane with 13 specialized routes |
| **Styling** | Vanilla CSS | Pure CSS3 custom design tokens (dark-mode theme, glassmorphism, responsive grid/flex) |
| **Backend API** | Python 3.10+ & FastAPI | High-performance ASGI control plane, Pydantic validation, and 16 canonical REST endpoints |
| **Database** | PostgreSQL & SQLAlchemy 2.0 | Relational database with `psycopg2-binary` driver and Alembic schema migrations |
| **Infrastructure as Code** | Terraform | Modular AWS infrastructure automation (VPC, IAM, EKS, ECR, Security Groups) |
| **Containers** | Docker | Hermetic multi-stage container packaging for frontend, backend, and applications |
| **Orchestration** | Kubernetes & Amazon EKS | Container runtime, rolling updates, health probes, and Horizontal Pod Autoscaling (HPA) |
| **Image Registry** | Amazon ECR | Private, secure container registry with immutable commit-SHA image tags |
| **CI/CD** | GitHub Actions | Automated linting, testing, Docker image building, and deployment manifest updates |
| **GitOps** | Argo CD | Declarative desired-state reconciliation between Git repositories and Kubernetes clusters |
| **Observability** | Prometheus & Grafana | Real-time metric collection, PromQL querying, and executive operational dashboards |
| **Tracing & Logging** | OpenTelemetry & CloudWatch | Distributed tracing across microservices and centralized cloud/platform log aggregation |

---

## Repository Architecture

The repository is organized into 10 decoupled modules separating concerns across presentation, control plane, data, infrastructure, and delivery:

```
forgecloud/
├── frontend/             # React.js SPA control plane (Vanilla CSS design system)
├── backend/              # FastAPI REST API control plane (Python 3.10+)
├── database/             # PostgreSQL migrations, SQLAlchemy schemas, seed data
├── terraform/            # Infrastructure as Code (modules for VPC, IAM, EKS, ECR)
├── kubernetes/           # Declarative K8s manifests (Deployments, Services, HPA, Probes)
├── argocd/               # GitOps Application custom resources and project definitions
├── monitoring/           # Prometheus alerts, Grafana dashboards, OpenTelemetry configs
├── .github/              # GitHub Actions CI/CD workflows (test, build, deploy)
└── docs/                 # Documentation, diagrams, reference specifications, and ADRs
```

---

## Documentation & Architecture Links

Complete design, analysis, and architecture specifications are maintained in `docs/`:

- **Project Analysis:** [docs/PROJECT_ANALYSIS.md](docs/PROJECT_ANALYSIS.md) — Architectural layer breakdown, requirements, and reference document mapping.
- **Master Implementation Plan:** [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) — Comprehensive 20-section master plan and verification criteria.
- **Architecture Decisions:** [docs/ARCHITECTURE_DECISIONS.md](docs/ARCHITECTURE_DECISIONS.md) — Formal Architecture Decision Records (ADR-001 through ADR-007).
- **Current Milestone Status:** [docs/CURRENT_STATUS.md](docs/CURRENT_STATUS.md) — Pre-flight milestone tracker and readiness assessments.
- **Source Reference Package:** [docs/reference/](docs/reference/) — 11 canonical PDF design specifications (`00` through `10`).

### Architecture Diagrams (Mermaid)

- **System Architecture:** [docs/diagrams/system-architecture.mmd](docs/diagrams/system-architecture.mmd)
- **Deployment & Rollback Flow:** [docs/diagrams/deployment-flow.mmd](docs/diagrams/deployment-flow.mmd)
- **VPC & Network Request Flow:** [docs/diagrams/network-flow.mmd](docs/diagrams/network-flow.mmd)
- **Database Entity-Relationship:** [docs/diagrams/er-diagram.mmd](docs/diagrams/er-diagram.mmd)

---

## 14-Phase Implementation Roadmap

Implementation follows a strictly sequential, phased development lifecycle:

| Phase | Phase Name | Status | Summary |
|---|---|---|---|
| **Phase 1** | **Foundation Setup** | **COMPLETE** | Repository scaffolding, base configs (`.gitignore`, `.env.example`, `README.md`), and environment templates. |
| **Phase 2** | **Database Schema & Migrations** | **COMPLETE** | PostgreSQL relational schema, SQLAlchemy 2.0 models, Alembic migrations, and automated test suite. |
| **Phase 3** | **Authentication & RBAC** | PLANNED | JWT tokens, password hashing (Argon2/Bcrypt), and role-based access control (`ADMIN`, `DEVELOPER`, `VIEWER`). |
| **Phase 4** | **Application Management & Dashboard** | PLANNED | Application lifecycle API endpoints and React 13-route frontend control plane. |
| **Phase 5** | **Docker Local Workflow** | PLANNED | Multi-stage Dockerfiles and `docker-compose.yml` for unified local stack development. |
| **Phase 6** | **Terraform AWS Infrastructure** | PLANNED | Modular Terraform IaC for VPC, IAM, ECR, and Amazon EKS cluster resources. |
| **Phase 7** | **Kubernetes Deployment & HPA** | PLANNED | Deployments, Services, Ingress, readiness/liveness probes, and Horizontal Pod Autoscaling. |
| **Phase 8** | **GitHub Actions CI/CD** | PLANNED | Automated testing, Docker image building, immutable tagging, and ECR publishing. |
| **Phase 9** | **Argo CD GitOps Engine** | PLANNED | Declarative GitOps synchronization and automated cluster state reconciliation. |
| **Phase 10** | **Observability Integration** | PLANNED | Prometheus metrics scraping, Grafana dashboards, OpenTelemetry tracing, and CloudWatch logs. |
| **Phase 11** | **Autoscaling & Rollback Workflows** | PLANNED | Dynamic scaling under load and automated rollback of unhealthy deployment releases. |
| **Phase 12** | **Failure Testing & Measurements** | PLANNED | Empirical reliability experiments: pod termination, failed release rollback, and traffic burst. |
| **Phase 13** | **Security Hardening** | PLANNED | Least-privilege IAM, Kubernetes NetworkPolicies, CORS whitelisting, and secrets management. |
| **Phase 14** | **Final Documentation & Verification** | PLANNED | Final system design report, updated diagrams, and end-to-end verification report. |

---

## Engineering Rules & Cloud Verification Notice

1. **Truth-in-Testing:** Per Project Rules 9 & 10, any cloud resource that has not been executed against a live AWS environment is explicitly marked:
   > **`NOT VERIFIED — REQUIRES AWS ENVIRONMENT`**
2. **Cost Control & Cloud Realism:** Core AWS container resources (Amazon EKS cluster control plane, NAT Gateways, and ALBs) are billable services without a Free Tier. Development occurs locally using Docker Compose and mock adapters to ensure $0 cloud costs during iterative development.
3. **Safety:** Destructive commands (`terraform destroy`, AWS resource deletion, database dropping) are never executed automatically.
