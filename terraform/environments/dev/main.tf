module "forgecloud" {
  source = "../../"

  aws_region         = var.aws_region
  environment        = "dev"
  project_name       = var.project_name
  single_nat_gateway = true
  eks_instance_types = var.eks_instance_types
  eks_desired_size   = var.eks_desired_size
  eks_min_size       = var.eks_min_size
  eks_max_size       = var.eks_max_size
  tags               = var.tags
}
