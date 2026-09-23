# ==============================================================================
# ForgeCloud - Root Terraform Outputs (Phase 6)
# ==============================================================================

# ------------------------------------------------------------------------------
# VPC Networking Outputs
# ------------------------------------------------------------------------------
output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = module.vpc.private_subnet_ids
}

output "isolated_subnet_ids" {
  description = "List of isolated subnet IDs (Database tier)"
  value       = module.vpc.isolated_subnet_ids
}

output "nat_public_ips" {
  description = "List of public IPs assigned to the NAT Gateways"
  value       = module.vpc.nat_public_ips
}

# ------------------------------------------------------------------------------
# Security Group Outputs
# ------------------------------------------------------------------------------
output "alb_security_group_id" {
  description = "Security group ID for the external Application Load Balancer"
  value       = module.networking.alb_security_group_id
}

output "eks_cluster_security_group_id" {
  description = "Security group ID for the EKS cluster control plane"
  value       = module.networking.eks_cluster_security_group_id
}

output "eks_nodes_security_group_id" {
  description = "Security group ID for the EKS worker nodes"
  value       = module.networking.eks_nodes_security_group_id
}

output "database_security_group_id" {
  description = "Security group ID for the isolated PostgreSQL database"
  value       = module.networking.database_security_group_id
}

# ------------------------------------------------------------------------------
# IAM Outputs
# ------------------------------------------------------------------------------
output "eks_cluster_role_arn" {
  description = "IAM role ARN for the EKS cluster control plane"
  value       = module.iam.eks_cluster_role_arn
}

output "eks_nodes_role_arn" {
  description = "IAM role ARN for the EKS managed node group"
  value       = module.iam.eks_nodes_role_arn
}

output "github_actions_role_arn" {
  description = "IAM role ARN for GitHub Actions CI/CD workflows"
  value       = module.iam.github_actions_role_arn
}

# ------------------------------------------------------------------------------
# ECR Outputs
# ------------------------------------------------------------------------------
output "ecr_repository_urls" {
  description = "Map of ECR repository names to their repository URLs"
  value       = module.ecr.repository_urls
}

output "ecr_repository_arns" {
  description = "Map of ECR repository names to their ARNs"
  value       = module.ecr.repository_arns
}

# ------------------------------------------------------------------------------
# EKS Outputs
# ------------------------------------------------------------------------------
output "eks_cluster_id" {
  description = "The ID of the EKS cluster"
  value       = module.eks.cluster_id
}

output "eks_cluster_name" {
  description = "The name of the EKS cluster"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "API server endpoint URL for the EKS cluster"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data for the cluster"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "eks_cluster_version" {
  description = "The Kubernetes version of the EKS cluster"
  value       = module.eks.cluster_version
}

output "eks_oidc_provider_arn" {
  description = "IAM OIDC provider ARN for IAM Roles for Service Accounts (IRSA)"
  value       = module.eks.oidc_provider_arn
}

output "eks_oidc_provider_url" {
  description = "Issuer URL of the OIDC provider"
  value       = module.eks.oidc_provider_url
}

output "eks_node_group_arn" {
  description = "ARN of the managed worker node group"
  value       = module.eks.node_group_arn
}
