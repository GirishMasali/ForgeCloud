output "vpc_id" {
  description = "The ID of the dev VPC"
  value       = module.forgecloud.vpc_id
}

output "eks_cluster_name" {
  description = "The name of the dev EKS cluster"
  value       = module.forgecloud.eks_cluster_name
}

output "eks_cluster_endpoint" {
  description = "The endpoint of the dev EKS cluster"
  value       = module.forgecloud.eks_cluster_endpoint
}

output "ecr_repository_urls" {
  description = "ECR repository URLs in dev"
  value       = module.forgecloud.ecr_repository_urls
}

output "alb_security_group_id" {
  description = "Dev ALB security group ID"
  value       = module.forgecloud.alb_security_group_id
}
