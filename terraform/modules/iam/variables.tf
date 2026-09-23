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

variable "github_repo" {
  description = "GitHub repository for OIDC trust relationship (e.g. owner/repo)"
  type        = string
  default     = "GirishMasali/ForgeCloud"
}

variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
