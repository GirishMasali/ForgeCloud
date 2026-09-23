output "eks_cluster_role_arn" {
  description = "ARN of the EKS cluster control plane IAM role"
  value       = aws_iam_role.eks_cluster.arn
}

output "eks_cluster_role_name" {
  description = "Name of the EKS cluster control plane IAM role"
  value       = aws_iam_role.eks_cluster.name
}

output "eks_nodes_role_arn" {
  description = "ARN of the EKS worker nodes IAM role"
  value       = aws_iam_role.eks_nodes.arn
}

output "eks_nodes_role_name" {
  description = "Name of the EKS worker nodes IAM role"
  value       = aws_iam_role.eks_nodes.name
}

output "github_actions_role_arn" {
  description = "ARN of the GitHub Actions CI/CD IAM role"
  value       = aws_iam_role.github_actions.arn
}

output "github_actions_role_name" {
  description = "Name of the GitHub Actions CI/CD IAM role"
  value       = aws_iam_role.github_actions.name
}
