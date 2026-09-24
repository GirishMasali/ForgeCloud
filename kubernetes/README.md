# ForgeCloud Kubernetes Declarative Deployment Layer (Phase 7)

This directory contains the declarative Kubernetes manifests for the ForgeCloud platform and sample application workloads, implementing Phase 7 of the platform architecture.

---

## 1. Directory Structure

The manifests are organized with strict separation of concerns:

```
kubernetes/
├── namespaces/                  # Kubernetes namespace definitions
│   ├── 01-forgecloud-system-namespace.yaml  # Control plane namespace (backend, frontend)
│   └── 02-forgecloud-apps-namespace.yaml    # User applications namespace (sample-app)
├── config/                      # Non-sensitive ConfigMaps
│   ├── backend-configmap.yaml               # Backend configuration
│   └── sample-app-configmap.yaml            # Sample application configuration
├── secrets/                     # Safe Secret templates (zero committed secrets)
│   └── backend-secret.yaml                  # Safe database & JWT secret placeholder template
├── serviceaccounts/             # Least-privilege ServiceAccounts
│   ├── backend-serviceaccount.yaml          # Backend ServiceAccount (token automount disabled)
│   ├── frontend-serviceaccount.yaml         # Frontend ServiceAccount (token automount disabled)
│   └── sample-app-serviceaccount.yaml       # Sample app ServiceAccount (token automount disabled)
├── deployments/                 # Deployment workloads (rolling updates, probes, resources)
│   ├── backend-deployment.yaml              # FastAPI control plane (port 8000, 2 replicas)
│   ├── frontend-deployment.yaml             # React Nginx SPA (port 80, 2 replicas)
│   └── sample-app-deployment.yaml           # Sample microservice (port 8080, 2 replicas)
├── services/                    # ClusterIP Services for internal networking
│   ├── backend-service.yaml                 # Backend service (port 8000)
│   ├── frontend-service.yaml                # Frontend service (port 80)
│   └── sample-app-service.yaml              # Sample app service (port 8080)
├── ingress/                     # AWS ALB Ingress configurations
│   ├── platform-ingress.yaml                # Routes / and /api to frontend & backend
│   └── sample-app-ingress.yaml              # Routes / to sample-backend-service
└── autoscaling/                 # Horizontal Pod Autoscalers (autoscaling/v2)
    ├── backend-hpa.yaml                     # Backend HPA (min: 2, max: 6, CPU: 70%)
    └── sample-app-hpa.yaml                  # Sample app HPA (min: 2, max: 6, CPU: 70%)
```

---

## 2. Workload & Image Mapping

| Workload | Namespace | Replicas | Port | Container Image Reference |
|---|---|---|---|---|
| **backend** | `forgecloud-system` | 2 (HPA: 2–6) | 8000 | `000000000000.dkr.ecr.us-east-1.amazonaws.com/forgecloud-apps:backend-latest` |
| **frontend** | `forgecloud-system` | 2 | 80 | `000000000000.dkr.ecr.us-east-1.amazonaws.com/forgecloud-apps:frontend-latest` |
| **sample-backend-service** | `forgecloud-apps` | 2 (HPA: 2–6) | 8080 | `000000000000.dkr.ecr.us-east-1.amazonaws.com/sample-backend-service:v1.0.0` |

---

## 3. Health Probes Configuration

All probes reuse the verified Phase 5 container health endpoints:

| Workload | Probe Type | HTTP Path | Port | Initial Delay | Period | Timeout | Failure Threshold |
|---|---|---|---|---|---|---|---|
| **backend** | Readiness | `/api/health` | 8000 | 5s | 10s | 5s | 3 |
| **backend** | Liveness | `/api/health` | 8000 | 15s | 15s | 5s | 3 |
| **frontend** | Readiness | `/healthz` | 80 | 3s | 10s | 3s | 3 |
| **frontend** | Liveness | `/healthz` | 80 | 10s | 15s | 3s | 3 |
| **sample-app** | Readiness | `/health` | 8080 | 5s | 10s | 3s | 3 |
| **sample-app** | Liveness | `/health` | 8080 | 15s | 15s | 3s | 3 |

---

## 4. Resource Allocation & Limits

Resources are configured to fit within AWS EKS `t3.medium` worker nodes (2 vCPUs, 4 GiB RAM):

| Workload | CPU Request | CPU Limit | Memory Request | Memory Limit |
|---|---|---|---|---|
| **backend** | `100m` | `500m` | `128Mi` | `512Mi` |
| **frontend** | `50m` | `200m` | `64Mi` | `256Mi` |
| **sample-app** | `100m` | `500m` | `128Mi` | `512Mi` |

---

## 5. Horizontal Pod Autoscaler (HPA)

Autoscaling is implemented using the `autoscaling/v2` API version:

- **Target Workloads:** `backend` (control plane) and `sample-backend-service` (managed app).
- **Scale Target:** `Deployment`
- **Min Replicas:** `2`
- **Max Replicas:** `6`
- **Target Metric:** Average CPU utilization threshold of `70%`.

---

## 6. Service & Ingress Routing

- **Services:** All services use `ClusterIP` for stable internal cluster discovery without exposing pods directly.
  - `frontend` in `forgecloud-system`: port `80` -> targetPort `80`.
  - `backend` in `forgecloud-system`: port `8000` -> targetPort `8000`. (Allows Nginx proxy `http://backend:8000/api/` resolution).
  - `sample-backend-service` in `forgecloud-apps`: port `8080` -> targetPort `8080`.
- **Ingress:** Configured with AWS Load Balancer Controller annotations:
  - `platform-ingress` (`forgecloud-system`):
    - Path `/api` (Prefix) -> `backend:8000`
    - Path `/` (Prefix) -> `frontend:80`
  - `sample-app-ingress` (`forgecloud-apps`):
    - Path `/` (Prefix) -> `sample-backend-service:8080`

---

## 7. Security & RBAC Guardrails

- **ServiceAccounts:** Dedicated minimal ServiceAccounts (`backend-sa`, `frontend-sa`, `sample-app-sa`).
- **Token Automount:** `automountServiceAccountToken: false` on all ServiceAccounts to prevent unintended in-cluster API privilege exposure.
- **RBAC:** Zero unnecessary `ClusterRole` or `ClusterRoleBinding` resources.
- **Pod Security:** `runAsNonRoot: true`, `runAsUser: 10001`, `allowPrivilegeEscalation: false`, and `capabilities.drop: ["ALL"]` where supported.
- **Secrets Management:** `backend-secret.yaml` provides safe template placeholders; zero credentials, AWS keys, or production passwords are committed to version control.

---

## 8. Local Validation

Manifests can be validated locally using `kubectl` client-side dry run without requiring an active cluster:

```bash
kubectl apply --dry-run=client -R -f kubernetes/
```
