variable "aws_region" {
  description = "AWS region for dev deployment"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name tag and prefix"
  type        = string
  default     = "forgecloud"
}

variable "eks_instance_types" {
  description = "Instance types for dev EKS worker nodes"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "eks_desired_size" {
  description = "Desired number of worker nodes in dev"
  type        = number
  default     = 2
}

variable "eks_min_size" {
  description = "Minimum number of worker nodes in dev"
  type        = number
  default     = 1
}

variable "eks_max_size" {
  description = "Maximum number of worker nodes in dev"
  type        = number
  default     = 3
}

variable "tags" {
  description = "Additional tags for dev resources"
  type        = map(string)
  default = {
    Environment = "dev"
    CostCenter  = "Engineering-Dev"
  }
}
