variable "environment" {
  description = "Environment name (e.g. dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name tag"
  type        = string
  default     = "forgecloud"
}

variable "repository_names" {
  description = "List of ECR repository names to create"
  type        = list(string)
  default     = ["forgecloud-apps", "sample-backend-service"]
}

variable "image_tag_mutability" {
  description = "The tag mutability setting for the repository (MUTABLE or IMMUTABLE)"
  type        = string
  default     = "MUTABLE"
}

variable "scan_on_push" {
  description = "Indicates whether images are scanned after being pushed to the repository"
  type        = bool
  default     = true
}

variable "untagged_image_retention_days" {
  description = "Number of days before untagged images are pruned"
  type        = number
  default     = 14
}

variable "tagged_image_max_count" {
  description = "Maximum number of tagged images to keep"
  type        = number
  default     = 30
}

variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
