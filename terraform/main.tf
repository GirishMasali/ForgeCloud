# ==============================================================================
# ForgeCloud - Root Terraform Configuration (Phase 6)
# ==============================================================================

locals {
  cluster_name = "${var.project_name}-${var.environment}-cluster"
}

# ------------------------------------------------------------------------------
# Module 1: VPC and Core Networking
# ------------------------------------------------------------------------------
module "vpc" {
  source = "./modules/vpc"

  project_name          = var.project_name
  environment           = var.environment
  cluster_name          = local.cluster_name
  vpc_cidr              = var.vpc_cidr
  availability_zones    = var.availability_zones
  public_subnet_cidrs   = var.public_subnet_cidrs
  private_subnet_cidrs  = var.private_subnet_cidrs
  isolated_subnet_cidrs = var.isolated_subnet_cidrs
  single_nat_gateway    = var.single_nat_gateway
  tags                  = var.tags
}

# ------------------------------------------------------------------------------
# Module 2: Security Groups
# ------------------------------------------------------------------------------
module "networking" {
  source = "./modules/networking"

  project_name        = var.project_name
  environment         = var.environment
  vpc_id              = module.vpc.vpc_id
  allowed_cidr_blocks = var.allowed_cidr_blocks
  tags                = var.tags
}

# ------------------------------------------------------------------------------
# Module 3: IAM Roles and Policies
# ------------------------------------------------------------------------------
module "iam" {
  source = "./modules/iam"

  project_name = var.project_name
  environment  = var.environment
  github_repo  = var.github_repo
  tags         = var.tags
}

# ------------------------------------------------------------------------------
# Module 4: Amazon ECR Container Registries
# ------------------------------------------------------------------------------
module "ecr" {
  source = "./modules/ecr"

  project_name     = var.project_name
  environment      = var.environment
  repository_names = var.ecr_repository_names
  tags             = var.tags
}

# ------------------------------------------------------------------------------
# Module 5: Amazon EKS Managed Kubernetes Cluster
# ------------------------------------------------------------------------------
module "eks" {
  source = "./modules/eks"

  project_name              = var.project_name
  environment               = var.environment
  kubernetes_version        = var.kubernetes_version
  vpc_id                    = module.vpc.vpc_id
  subnet_ids                = concat(module.vpc.public_subnet_ids, module.vpc.private_subnet_ids)
  private_subnet_ids        = module.vpc.private_subnet_ids
  cluster_role_arn          = module.iam.eks_cluster_role_arn
  node_role_arn             = module.iam.eks_nodes_role_arn
  cluster_security_group_id = module.networking.eks_cluster_security_group_id
  instance_types            = var.eks_instance_types
  capacity_type             = var.eks_capacity_type
  desired_size              = var.eks_desired_size
  min_size                  = var.eks_min_size
  max_size                  = var.eks_max_size
  disk_size                 = var.eks_disk_size
  tags                      = var.tags
}
