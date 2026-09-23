import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

export default function AdminUsersPage() {
  return (
    <PlaceholderPage
      title="User Directory & Role Administration"
      phaseNumber="3 / 4"
      phaseName="Identity & Access Governance"
      description="Administrative user directory management. Role assignments (ADMIN, DEVELOPER, VIEWER) and credential revocation interfaces."
      deliverables={[
        'List all registered platform users across roles',
        'Dynamically update user roles (ADMIN, DEVELOPER, VIEWER)',
        'Administrative password resets and session revocations',
        'Integration with enterprise SSO and OIDC identity providers',
      ]}
      requiresAws={false}
    />
  );
}
