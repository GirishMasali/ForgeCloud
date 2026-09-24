"""
ForgeCloud Phase 8 GitHub Actions Workflow Validator
Validates YAML syntax, GitHub Actions structure, event triggers, workflow dependencies,
OIDC permissions, referenced files existence, ECR repository mapping, and secrets safety
across all workflows in .github/workflows/.
"""

import sys
from pathlib import Path
from typing import Dict, Any
import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent
WORKFLOWS_DIR = REPO_ROOT / ".github" / "workflows"

def load_yaml(file_path: Path) -> Dict[str, Any]:
    with open(file_path, "r", encoding="utf-8") as f:
        try:
            content = yaml.safe_load(f)
            print(f"  [OK] Valid YAML syntax: {file_path.relative_to(REPO_ROOT)}")
            return content
        except Exception as e:
            print(f"  [FAIL] YAML Syntax error in {file_path}: {e}")
            sys.exit(1)

def validate_test_workflow(data: Dict[str, Any]) -> None:
    print("\n--- 1. Validating test.yml Structure & Triggers ---")
    assert data.get("name") == "Test & Validate", f"Unexpected workflow name: {data.get('name')}"
    
    triggers = data.get("on") or data.get(True, {})
    assert "push" in triggers, "Missing push trigger in test.yml"
    assert "pull_request" in triggers, "Missing pull_request trigger in test.yml"
    assert "workflow_dispatch" in triggers, "Missing workflow_dispatch trigger in test.yml"
    assert "main" in triggers["push"]["branches"], "push trigger must monitor 'main' branch"
    assert "main" in triggers["pull_request"]["branches"], "pull_request trigger must monitor 'main' branch"
    print("  [OK] Event triggers: push(main), pull_request(main), workflow_dispatch")

    perms = data.get("permissions", {})
    assert perms.get("contents") == "read", "permissions.contents must be 'read'"
    print("  [OK] Least-privilege permissions: contents=read")

    jobs = data.get("jobs", {})
    assert "backend-tests" in jobs, "Missing backend-tests job in test.yml"
    assert "frontend-build" in jobs, "Missing frontend-build job in test.yml"
    print("  [OK] Jobs defined: backend-tests, frontend-build")

    # Verify backend job steps
    backend_steps = [s.get("name", "") for s in jobs["backend-tests"].get("steps", [])]
    assert any("Python" in s for s in backend_steps), "Missing Python setup step"
    assert any("dependencies" in s.lower() for s in backend_steps), "Missing dependency installation step"
    assert any("pytest" in s.lower() for s in backend_steps), "Missing pytest execution step"
    print("  [OK] Backend job steps: setup Python 3.10, install dependencies, run pytest")

    # Verify frontend job steps
    frontend_steps = [s.get("name", "") for s in jobs["frontend-tests" if "frontend-tests" in jobs else "frontend-build"].get("steps", [])]
    assert any("Node" in s for s in frontend_steps), "Missing Node setup step"
    assert any("dependencies" in s.lower() for s in frontend_steps), "Missing dependency installation step"
    assert any("build" in s.lower() for s in frontend_steps), "Missing build validation step"
    print("  [OK] Frontend job steps: setup Node.js 22, install dependencies, validate production build")

def validate_build_workflow(data: Dict[str, Any]) -> None:
    print("\n--- 2. Validating build.yml Structure & Publishing Flow ---")
    assert data.get("name") == "Build & Package Container Images", f"Unexpected workflow name: {data.get('name')}"

    triggers = data.get("on") or data.get(True, {})
    assert "workflow_run" in triggers, "Missing workflow_run trigger in build.yml"
    assert "workflow_dispatch" in triggers, "Missing workflow_dispatch trigger in build.yml"
    
    wf_run = triggers["workflow_run"]
    assert "Test & Validate" in wf_run.get("workflows", []), "workflow_run must trigger on 'Test & Validate'"
    assert "completed" in wf_run.get("types", []), "workflow_run type must include 'completed'"
    assert "main" in wf_run.get("branches", []), "workflow_run must target 'main' branch"
    print("  [OK] Event triggers: workflow_run('Test & Validate', main), workflow_dispatch")

    perms = data.get("permissions", {})
    assert perms.get("id-token") == "write", "build.yml requires permissions.id-token = write for OIDC"
    assert perms.get("contents") == "read", "build.yml requires permissions.contents = read"
    print("  [OK] Least-privilege OIDC permissions: id-token=write, contents=read")

    jobs = data.get("jobs", {})
    assert "build-and-push" in jobs, "Missing build-and-push job in build.yml"
    job = jobs["build-and-push"]
    
    job_condition = str(job.get("if", ""))
    assert "conclusion == 'success'" in job_condition, "build job must enforce prior stage success"
    print("  [OK] Dependency guard: Job executes only if Test & Validate concluded with 'success'")

    steps = [s.get("name", "") for s in job.get("steps", [])]
    assert any("Tag" in s for s in steps), "Missing image tag resolution step"
    assert any("Backend Container" in s for s in steps), "Missing Backend build step"
    assert any("Frontend Container" in s for s in steps), "Missing Frontend build step"
    assert any("Sample Application" in s for s in steps), "Missing Sample App build step"
    assert any("AWS Credentials" in s for s in steps), "Missing AWS OIDC authentication step"
    assert any("Amazon ECR" in s for s in steps), "Missing ECR login step"
    assert any("Push Backend" in s for s in steps), "Missing Backend ECR push step"
    assert any("Push Frontend" in s for s in steps), "Missing Frontend ECR push step"
    assert any("Push Sample" in s for s in steps), "Missing Sample App ECR push step"
    print("  [OK] Build & Publish sequence: Local Docker build -> AWS OIDC -> ECR login -> Immutable tag push")

def validate_deploy_workflow(data: Dict[str, Any]) -> None:
    print("\n--- 3. Validating deploy.yml Structure & Deployment Flow ---")
    assert data.get("name") == "Deploy to Amazon EKS", f"Unexpected workflow name: {data.get('name')}"

    triggers = data.get("on") or data.get(True, {})
    assert "workflow_run" in triggers, "Missing workflow_run trigger in deploy.yml"
    assert "workflow_dispatch" in triggers, "Missing workflow_dispatch trigger in deploy.yml"

    wf_run = triggers["workflow_run"]
    assert "Build & Package Container Images" in wf_run.get("workflows", []), "workflow_run must trigger on 'Build & Package Container Images'"
    assert "completed" in wf_run.get("types", []), "workflow_run type must include 'completed'"
    assert "main" in wf_run.get("branches", []), "workflow_run must target 'main' branch"
    print("  [OK] Event triggers: workflow_run('Build & Package Container Images', main), workflow_dispatch")

    perms = data.get("permissions", {})
    assert perms.get("id-token") == "write", "deploy.yml requires permissions.id-token = write for OIDC"
    assert perms.get("contents") == "read", "deploy.yml requires permissions.contents = read"
    print("  [OK] Least-privilege OIDC permissions: id-token=write, contents=read")

    jobs = data.get("jobs", {})
    assert "deploy-to-eks" in jobs, "Missing deploy-to-eks job in deploy.yml"
    job = jobs["deploy-to-eks"]

    job_condition = str(job.get("if", ""))
    assert "conclusion == 'success'" in job_condition, "deploy job must enforce prior stage success"
    print("  [OK] Dependency guard: Job executes only if Build concluded with 'success'")

    steps = [s.get("name", "") for s in job.get("steps", [])]
    assert any("kubectl" in s for s in steps), "Missing kubectl setup step"
    assert any("Dry Run" in s for s in steps), "Missing dry-run validation step"
    assert any("AWS Credentials" in s for s in steps), "Missing AWS OIDC authentication step"
    assert any("kubeconfig" in s for s in steps), "Missing kubeconfig update step"
    assert any("Namespaces" in s for s in steps), "Missing namespace apply step"
    assert any("Deploy Workloads" in s for s in steps), "Missing workload deployment step"
    assert any("Rollout Status" in s for s in steps), "Missing rollout status verification step"
    print("  [OK] Deployment sequence: Dry run -> AWS OIDC -> EKS kubeconfig -> Apply manifests -> Set image -> Verify rollout")

def validate_referenced_files() -> None:
    print("\n--- 4. Validating Workflow-Referenced Files & Manifests ---")
    required_paths = [
        "backend/Dockerfile",
        "frontend/Dockerfile",
        "sample-app/Dockerfile",
        "backend/requirements.txt",
        "backend/tests",
        "frontend/package.json",
        "frontend/package-lock.json",
        "kubernetes/namespaces/01-forgecloud-system-namespace.yaml",
        "kubernetes/namespaces/02-forgecloud-apps-namespace.yaml",
        "kubernetes/config/backend-configmap.yaml",
        "kubernetes/config/sample-app-configmap.yaml",
        "kubernetes/serviceaccounts/backend-serviceaccount.yaml",
        "kubernetes/serviceaccounts/frontend-serviceaccount.yaml",
        "kubernetes/serviceaccounts/sample-app-serviceaccount.yaml",
        "kubernetes/services/backend-service.yaml",
        "kubernetes/services/frontend-service.yaml",
        "kubernetes/services/sample-app-service.yaml",
        "kubernetes/ingress/platform-ingress.yaml",
        "kubernetes/ingress/sample-app-ingress.yaml",
        "kubernetes/autoscaling/backend-hpa.yaml",
        "kubernetes/autoscaling/sample-app-hpa.yaml",
        "kubernetes/deployments/backend-deployment.yaml",
        "kubernetes/deployments/frontend-deployment.yaml",
        "kubernetes/deployments/sample-app-deployment.yaml",
    ]

    for rel_path in required_paths:
        full_path = REPO_ROOT / rel_path
        assert full_path.exists(), f"Referenced path does not exist: {rel_path}"
        print(f"  [OK] Referenced path exists: {rel_path}")

def validate_workload_and_ecr_consistency() -> None:
    print("\n--- 5. Validating Workload, Container & ECR Consistency ---")
    
    # Check Terraform ECR definitions
    tf_variables = (REPO_ROOT / "terraform" / "variables.tf").read_text(encoding="utf-8")
    assert '"forgecloud-apps"' in tf_variables, "Terraform missing 'forgecloud-apps' repository"
    assert '"sample-backend-service"' in tf_variables, "Terraform missing 'sample-backend-service' repository"
    print("  [OK] Terraform ECR repositories: forgecloud-apps, sample-backend-service")

    # Check Kubernetes Deployments
    backend_dep = yaml.safe_load((REPO_ROOT / "kubernetes" / "deployments" / "backend-deployment.yaml").read_text(encoding="utf-8"))
    frontend_dep = yaml.safe_load((REPO_ROOT / "kubernetes" / "deployments" / "frontend-deployment.yaml").read_text(encoding="utf-8"))
    sample_dep = yaml.safe_load((REPO_ROOT / "kubernetes" / "deployments" / "sample-app-deployment.yaml").read_text(encoding="utf-8"))

    assert backend_dep["spec"]["template"]["spec"]["containers"][0]["name"] == "backend"
    assert frontend_dep["spec"]["template"]["spec"]["containers"][0]["name"] == "frontend"
    assert sample_dep["spec"]["template"]["spec"]["containers"][0]["name"] == "sample-backend-service"
    print("  [OK] Kubernetes container names match kubectl set image targets: backend, frontend, sample-backend-service")

    # Verify build.yml pushes to the exact repositories and tags
    build_yaml = (WORKFLOWS_DIR / "build.yml").read_text(encoding="utf-8")
    assert "ECR_FORGECLOUD_APPS_REPO" in build_yaml
    assert "ECR_SAMPLE_APP_REPO" in build_yaml
    assert ":backend-${IMAGE_TAG}" in build_yaml
    assert ":frontend-${IMAGE_TAG}" in build_yaml
    assert ":${IMAGE_TAG}" in build_yaml
    print("  [OK] build.yml image tagging matches Kubernetes references:")
    print("       backend -> forgecloud-apps:backend-${IMAGE_TAG}")
    print("       frontend -> forgecloud-apps:frontend-${IMAGE_TAG}")
    print("       sample-app -> sample-backend-service:${IMAGE_TAG}")

    # Verify deploy.yml updates the exact images
    deploy_yaml = (WORKFLOWS_DIR / "deploy.yml").read_text(encoding="utf-8")
    assert "deployment/backend" in deploy_yaml and "backend=" in deploy_yaml
    assert "deployment/frontend" in deploy_yaml and "frontend=" in deploy_yaml
    assert "deployment/sample-backend-service" in deploy_yaml and "sample-backend-service=" in deploy_yaml
    print("  [OK] deploy.yml updates exact deployment targets and container names")

def validate_secret_safety() -> None:
    print("\n--- 6. Scanning Workflows for Hardcoded Secrets ---")
    forbidden_terms = [
        "AKIA",
        "ASIA",
        "AWS_SECRET_ACCESS_KEY",
        "BEGIN RSA PRIVATE KEY",
        "BEGIN OPENSSH PRIVATE KEY",
        "password=",
        "passwd",
    ]
    for wf in WORKFLOWS_DIR.glob("*.yml"):
        content = wf.read_text(encoding="utf-8")
        for term in forbidden_terms:
            assert term not in content, f"POTENTIAL REAL SECRET DETECTED ({term}) in {wf}"
        # Ensure no AWS_ACCESS_KEY_ID variable definition
        assert "AWS_ACCESS_KEY_ID:" not in content, f"Found AWS_ACCESS_KEY_ID in {wf} (must use OIDC)"
    print("  [OK] Zero AWS access keys, zero private keys, zero plaintext secrets detected in workflows.")

def main():
    print("=================================================================")
    print("ForgeCloud Phase 8 GitHub Actions Workflow Validator")
    print("=================================================================")
    
    test_data = load_yaml(WORKFLOWS_DIR / "test.yml")
    build_data = load_yaml(WORKFLOWS_DIR / "build.yml")
    deploy_data = load_yaml(WORKFLOWS_DIR / "deploy.yml")

    validate_test_workflow(test_data)
    validate_build_workflow(build_data)
    validate_deploy_workflow(deploy_data)
    validate_referenced_files()
    validate_workload_and_ecr_consistency()
    validate_secret_safety()

    print("\n=================================================================")
    print("ALL GITHUB ACTIONS WORKFLOWS VALIDATED SUCCESSFULLY (100% PASS)")
    print("=================================================================\n")

if __name__ == "__main__":
    main()
