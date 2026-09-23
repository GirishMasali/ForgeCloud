import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

export default function InfrastructurePage() {
  return (
    <PlaceholderPage
      title="Cloud Infrastructure Topology"
      phaseNumber="6"
      phaseName="Terraform AWS Infrastructure"
      description="Declarative infrastructure-as-code management covering AWS VPC topology (public/private/isolated subnets), Amazon EKS cluster control plane, managed node groups, and Amazon ECR registries."
      deliverables={[
        'Modular Terraform configurations (/terraform/modules)',
        'VPC segmentation: Public (ALB), Private (EKS Nodes), Isolated (PostgreSQL)',
        'EKS Cluster control plane and managed node group orchestration',
        'Backend /api/infrastructure and /api/infrastructure/provision endpoints',
      ]}
      requiresAws={true}
    />
  );
}
