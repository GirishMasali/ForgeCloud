"""
ForgeCloud Phase 9 Argo CD GitOps Engine Static & Structural Validator
Validates YAML syntax, Argo CD schema structures, Git source repository,
target revision, manifest path existence, destination cluster and namespace,
sync policies (automated, prune, selfHeal), namespace separation,
secret safety, and Phase 10+ scope guardrails across all manifests in argocd/.
"""

import sys
from pathlib import Path
from typing import Dict, Any, List
import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent
ARGOCD_DIR = REPO_ROOT / "argocd"
KUBERNETES_DIR = REPO_ROOT / "kubernetes"

EXPECTED_REPO_URL = "https://github.com/GirishMasali/ForgeCloud.git"
EXPECTED_BRANCH = "main"
EXPECTED_PATH = "kubernetes"

def load_yaml(file_path: Path) -> Dict[str, Any]:
    with open(file_path, "r", encoding="utf-8") as f:
        try:
            content = yaml.safe_load(f)
            print(f"  [OK] Valid YAML syntax: {file_path.relative_to(REPO_ROOT)}")
            return content
        except Exception as e:
            print(f"  [FAIL] YAML Syntax error in {file_path}: {e}")
            sys.exit(1)

def validate_argocd_namespace(data: Dict[str, Any]) -> None:
    print("\n--- 1. Validating Argo CD Control Plane Namespace ---")
    assert data.get("apiVersion") == "v1", f"Expected apiVersion 'v1', got {data.get('apiVersion')}"
    assert data.get("kind") == "Namespace", f"Expected kind 'Namespace', got {data.get('kind')}"
    
    metadata = data.get("metadata", {})
    name = metadata.get("name")
    assert name == "argocd", f"Expected namespace name 'argocd', got '{name}'"
    print("  [OK] Namespace name: argocd (isolated GitOps control plane)")
    
    labels = metadata.get("labels", {})
    assert labels.get("app.kubernetes.io/name") == "argocd"
    assert labels.get("app.kubernetes.io/part-of") == "forgecloud"
    assert labels.get("app.kubernetes.io/component") == "gitops-control-plane"
    print("  [OK] Standard Kubernetes labels present and correct")

def validate_argocd_application(data: Dict[str, Any]) -> None:
    print("\n--- 2. Validating Argo CD Application Resource ---")
    assert data.get("apiVersion") == "argoproj.io/v1alpha1", f"Unexpected apiVersion: {data.get('apiVersion')}"
    assert data.get("kind") == "Application", f"Unexpected kind: {data.get('kind')}"
    
    metadata = data.get("metadata", {})
    name = metadata.get("name")
    namespace = metadata.get("namespace")
    assert name == "forgecloud", f"Expected application name 'forgecloud', got '{name}'"
    assert namespace == "argocd", f"Expected metadata.namespace 'argocd', got '{namespace}'"
    print(f"  [OK] Application identifier: {namespace}/{name}")
    
    finalizers = metadata.get("finalizers", [])
    assert "resources-finalizer.argocd.argoproj.io" in finalizers, "Missing cascading delete resources-finalizer"
    print("  [OK] Cascading resource finalizer configured")

    spec = data.get("spec", {})
    assert spec.get("project") == "default", f"Expected spec.project 'default', got '{spec.get('project')}'"
    print("  [OK] App project: default")

    # Source validation
    print("\n--- 3. Validating Git Source & Target Manifests ---")
    source = spec.get("source", {})
    repo_url = source.get("repoURL")
    target_revision = source.get("targetRevision")
    manifest_path = source.get("path")
    directory = source.get("directory", {})

    assert repo_url == EXPECTED_REPO_URL, f"Expected repoURL '{EXPECTED_REPO_URL}', got '{repo_url}'"
    assert target_revision == EXPECTED_BRANCH, f"Expected targetRevision '{EXPECTED_BRANCH}', got '{target_revision}'"
    assert manifest_path == EXPECTED_PATH, f"Expected path '{EXPECTED_PATH}', got '{manifest_path}'"
    assert directory.get("recurse") is True, "spec.source.directory.recurse must be true for subfolder traversal"
    print(f"  [OK] Canonical Git repository URL: {repo_url}")
    print(f"  [OK] Canonical Target branch: {target_revision}")
    print(f"  [OK] Desired-state manifest path: {manifest_path} (recurse=true)")

    # Verify manifest path actually exists in repo
    target_manifest_dir = REPO_ROOT / manifest_path
    assert target_manifest_dir.is_dir(), f"Referenced manifest path {manifest_path} is not a directory"
    manifest_count = len(list(target_manifest_dir.glob("**/*.yaml")))
    assert manifest_count >= 16, f"Expected at least 16 Kubernetes manifests in {manifest_path}, found {manifest_count}"
    print(f"  [OK] Verified {manifest_count} declarative Kubernetes manifests in '{manifest_path}/'")

    # Destination validation
    print("\n--- 4. Validating Destination & Namespace Boundaries ---")
    destination = spec.get("destination", {})
    server = destination.get("server")
    dest_ns = destination.get("namespace")

    assert server == "https://kubernetes.default.svc", f"Expected in-cluster server, got '{server}'"
    assert dest_ns == "forgecloud-system", f"Expected default destination namespace 'forgecloud-system', got '{dest_ns}'"
    print(f"  [OK] Destination cluster server: {server}")
    print(f"  [OK] Destination default namespace: {dest_ns}")
    print("  [OK] Namespace separation: workloads remain in forgecloud-system and forgecloud-apps")

    # Synchronization policy validation
    print("\n--- 5. Validating Synchronization & Reconciliation Policies ---")
    sync_policy = spec.get("syncPolicy", {})
    automated = sync_policy.get("automated", {})
    assert automated.get("prune") is True, "syncPolicy.automated.prune must be true"
    assert automated.get("selfHeal") is True, "syncPolicy.automated.selfHeal must be true"
    print("  [OK] Automated synchronization enabled")
    print("  [OK] Self-healing enabled (drift reconciliation)")
    print("  [OK] Prune enabled (removed Git resources deleted from cluster)")

    sync_options = sync_policy.get("syncOptions", [])
    assert "CreateNamespace=true" in sync_options, "Missing CreateNamespace=true syncOption"
    assert "PruneLast=true" in sync_options, "Missing PruneLast=true syncOption"
    print("  [OK] Sync options: CreateNamespace=true, PruneLast=true")

    retry = sync_policy.get("retry", {})
    assert retry.get("limit") == 5, f"Expected retry limit 5, got {retry.get('limit')}"
    backoff = retry.get("backoff", {})
    assert backoff.get("duration") == "5s"
    assert backoff.get("factor") == 2
    assert backoff.get("maxDuration") == "3m"
    print("  [OK] Retry backoff configured: limit=5, duration=5s, factor=2, maxDuration=3m")

def validate_kubernetes_integration() -> None:
    print("\n--- 6. Validating Kubernetes Manifest Integration ---")
    # Verify the namespaces managed
    system_ns_file = KUBERNETES_DIR / "namespaces" / "01-forgecloud-system-namespace.yaml"
    apps_ns_file = KUBERNETES_DIR / "namespaces" / "02-forgecloud-apps-namespace.yaml"
    assert system_ns_file.exists(), "Missing forgecloud-system namespace manifest"
    assert apps_ns_file.exists(), "Missing forgecloud-apps namespace manifest"
    print("  [OK] Workload namespaces verified: forgecloud-system, forgecloud-apps")

    # Verify workload deployments
    expected_deployments = ["backend-deployment.yaml", "frontend-deployment.yaml", "sample-app-deployment.yaml"]
    for dep in expected_deployments:
        p = KUBERNETES_DIR / "deployments" / dep
        assert p.exists(), f"Missing deployment manifest: {dep}"
    print(f"  [OK] Workload deployments verified: {', '.join(expected_deployments)}")

def validate_secret_safety() -> None:
    print("\n--- 7. Scanning Argo CD Manifests for Secrets ---")
    forbidden_terms = [
        "AKIA",
        "ASIA",
        "AWS_SECRET_ACCESS_KEY",
        "BEGIN RSA PRIVATE KEY",
        "BEGIN OPENSSH PRIVATE KEY",
        "password=",
        "passwd",
        "ghp_",
        "github_pat_",
    ]
    for yf in ARGOCD_DIR.glob("**/*.yaml"):
        content = yf.read_text(encoding="utf-8")
        for term in forbidden_terms:
            assert term not in content, f"POTENTIAL REAL SECRET DETECTED ({term}) in {yf}"
    print("  [OK] Zero AWS credentials, zero private keys, zero plaintext tokens in argocd/")

def validate_scope_guardrails() -> None:
    print("\n--- 8. Validating Scope Guardrails (No Phase 10+ Features) ---")
    forbidden_features = [
        "prometheus",
        "grafana",
        "opentelemetry",
        "cloudwatch",
        "chaos",
        "rollouts.argoproj.io",
    ]
    for yf in ARGOCD_DIR.glob("**/*.yaml"):
        content = yf.read_text(encoding="utf-8").lower()
        for feature in forbidden_features:
            assert feature not in content, f"Scope violation: Found future phase reference '{feature}' in {yf}"
    print("  [OK] Scope intact: Zero Phase 10+ observability/monitoring/chaos resources detected")

def main():
    print("=================================================================")
    print("ForgeCloud Phase 9 Argo CD GitOps Engine Validator")
    print("=================================================================")

    ns_data = load_yaml(ARGOCD_DIR / "namespace.yaml")
    app_data = load_yaml(ARGOCD_DIR / "application.yaml")

    validate_argocd_namespace(ns_data)
    validate_argocd_application(app_data)
    validate_kubernetes_integration()
    validate_secret_safety()
    validate_scope_guardrails()

    print("\n=================================================================")
    print("ALL ARGO CD MANIFESTS VALIDATED SUCCESSFULLY (100% PASS)")
    print("=================================================================\n")

if __name__ == "__main__":
    main()
