import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

export default function LogsPage() {
  return (
    <PlaceholderPage
      title="Platform & Workload Logs"
      phaseNumber="10"
      phaseName="CloudWatch & Centralized Logging"
      description="Centralized structured log streaming and indexing from container stdout/stderr, Amazon CloudWatch Logs, and Kubernetes control plane audit events."
      deliverables={[
        'FastAPI backend /api/logs query endpoint with level and timestamp filtering',
        'FluentBit daemonset forwarding container logs to Amazon CloudWatch',
        'Real-time streaming log viewer with full-text search',
        'Exportable log traces for incident post-mortems',
      ]}
      requiresAws={true}
    />
  );
}
