import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

export default function MonitoringPage() {
  return (
    <PlaceholderPage
      title="Cluster & Application Observability"
      phaseNumber="10"
      phaseName="Observability Integration"
      description="Unified platform observability dashboards tracking the Four Golden Signals (Latency, Traffic, Errors, Saturation) across all managed application workloads and EKS cluster nodes."
      deliverables={[
        'Prometheus scraping of application /metrics endpoints',
        'Grafana executive dashboards for CPU, memory, and P95 latency',
        'OpenTelemetry distributed tracing for end-to-end request visualization',
        'Threshold-based alerting and automated anomaly detection',
      ]}
      requiresAws={true}
    />
  );
}
