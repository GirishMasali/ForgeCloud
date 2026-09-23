variable "aws_region" {
  description = "The target AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name tag and naming prefix"
  type        = string
  default     = "forgecloud"
}

# ------------------------------------------------------------------------------
# VPC Networking Variables
# ------------------------------------------------------------------------------
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones to distribute subnets across"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

variable "isolated_subnet_cidrs" {
  description = "CIDR blocks for isolated subnets"
  type        = list(string)
  default     = ["10.0.100.0/24", "10.0.200.0/24"]
}

variable "single_nat_gateway" {
  description = "If true, provision a single NAT Gateway shared across private subnets to reduce AWS costs (ADR-004)"
  type        = bool
  default     = true
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access the external Application Load Balancer"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# ------------------------------------------------------------------------------
# IAM Variables
# ------------------------------------------------------------------------------
variable "github_repo" {
  description = "GitHub repository (owner/repo) allowed for GitHub Actions OIDC federation"
  type        = string
  default     = "GirishMasali/ForgeCloud"
}

# ------------------------------------------------------------------------------
# ECR Variables
# ------------------------------------------------------------------------------
variable "ecr_repository_names" {
  description = "List of ECR repository names to create"
  type        = list(string)
  default     = ["forgecloud-apps", "sample-backend-service"]
}

# ------------------------------------------------------------------------------
# EKS Variables
# ------------------------------------------------------------------------------
variable "kubernetes_version" {
  description = "Target Kubernetes version for the EKS control plane"
  type        = string
  default     = "1.30"
}

variable "eks_instance_types" {
  description = "EC2 instance types for the EKS managed node group"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "eks_capacity_type" {
  description = "Capacity type for EKS nodes (ON_DEMAND or SPOT)"
  type        = string
  default     = "ON_DEMAND"
}

variable "eks_desired_size" {
  description = "Desired number of worker nodes"
  type        = number
  default     = 2
}

variable "eks_min_size" {
  description = "Minimum number of worker nodes"
  type        = number
  default     = 1
}

variable "eks_max_size" {
  description = "Maximum number of worker nodes"
  type        = number
  default     = 4
}

variable "eks_disk_size" {
  description = "Root disk size in GiB for worker nodes"
  type        = number
  default     = 20
}

variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
