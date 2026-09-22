---
trigger: always_on
---

# ForgeCloud Project Rules

ForgeCloud is a self-service cloud-native internal developer platform.

Primary cloud:
AWS

Frontend:
React.js + JavaScript

Backend:
Python + FastAPI

Database:
PostgreSQL

Infrastructure:
Terraform

Containers:
Docker

Orchestration:
Kubernetes + Amazon EKS

Registry:
Amazon ECR

CI/CD:
GitHub Actions

GitOps:
Argo CD

Observability:
Prometheus + Grafana + OpenTelemetry + CloudWatch

==================================================

PROJECT RULES

1. Use docs/reference/ as the design baseline.

2. Do not silently change the architecture.

3. Do not introduce unnecessary technologies.

4. Never hard-code credentials, passwords, API keys,
AWS keys or other secrets.

5. Use environment variables for configuration.

6. Separate frontend, backend, database, infrastructure,
Kubernetes and monitoring concerns.

7. Do not create fake production metrics when real APIs
are available.

8. Every implementation must be tested.

9. Never claim AWS, EKS, ECR, Terraform or Kubernetes
functionality has been verified unless it was actually
executed and verified.

10. If something requires AWS but AWS has not been configured,
state:

NOT VERIFIED — REQUIRES AWS ENVIRONMENT

11. Never automatically run destructive commands such as:

terraform destroy
database deletion
AWS resource deletion

12. Before major changes:
- inspect existing files
- create a plan
- implement
- test
- verify
- document

13. Architecture diagrams must match the actual implementation.

14. Documentation must remain synchronized with the implementation.

15. Prefer simple, modular and understandable code.

16. The developer must be able to explain every major technology
and architectural decision.