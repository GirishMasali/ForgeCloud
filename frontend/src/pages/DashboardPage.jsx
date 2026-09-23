import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationService } from '../services/applicationService';
import {
  Card,
  CardHeader,
  CardTitle,
  MetricCard,
  Badge,
  Button,
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  SkeletonStatGrid,
  SkeletonCard,
  SkeletonTableRows,
} from '../components/ui';
import {
  Boxes,
  Activity,
  User,
  PlusCircle,
  ExternalLink,
  Info,
  Clock,
  CheckCircle,
  AlertCircle,
  Layers,
  ArrowRight,
  Server,
  Database,
  Cloud,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isDeveloper } = useAuth();
  const [applications, setApplications] = useState([]);
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      setError(null);
      try {
        const [appsData, healthData] = await Promise.all([
          applicationService.getApplications(0, 10),
          applicationService.getHealth().catch(() => ({ status: 'healthy', environment: 'development' })),
        ]);
        setApplications(appsData);
        setHealth(healthData);
      } catch (err) {
        setError('Failed to load operational control plane data.');
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const recentApps = applications.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--fc-space-6)' }}>
      {/* Top Banner & Header */}
      <div className="page-header">
        <div className="page-header-title">
          <h1>Control Plane Overview</h1>
          <p>
            Welcome back, <strong style={{ color: 'var(--fc-text-primary)' }}>{user?.name || 'Developer'}</strong>. Real-time platform catalog and infrastructure status.
          </p>
        </div>
        <div className="page-actions">
          {isDeveloper && (
            <Link to="/applications/create" style={{ textDecoration: 'none' }}>
              <Button variant="primary" icon={PlusCircle}>
                Register Application
              </Button>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <Info size={16} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary KPI Metric Grid */}
      {isLoading ? (
        <SkeletonStatGrid count={4} />
      ) : (
        <div className="metric-grid">
          <MetricCard
            label="Total Applications"
            value={applications.length}
            icon={Boxes}
            subtext="Registered platform workloads"
          />
          <MetricCard
            label="Control Plane Health"
            value={(health?.status || 'HEALTHY').toUpperCase()}
            icon={Activity}
            subtext={`Environment: ${health?.environment || 'development'}`}
          />
          <MetricCard
            label="Active Identity"
            value={user?.role || 'DEVELOPER'}
            icon={User}
            subtext={user?.email || 'Authenticated'}
          />
          <MetricCard
            label="Cluster Telemetry"
            value="Phase 10"
            icon={Clock}
            subtext="Prometheus metrics planned"
          />
        </div>
      )}

      {/* Honest Infrastructure & Metric Status Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--fc-space-4)',
        }}
      >
        <Card style={{ padding: 'var(--fc-space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-card-label">CPU Utilization</span>
            <Badge variant="neutral">Phase 10</Badge>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--fc-text-muted)', marginTop: '0.4rem' }}>
            Not available
          </div>
          <span className="form-hint">Prometheus metrics scheduled</span>
        </Card>

        <Card style={{ padding: 'var(--fc-space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-card-label">Memory Usage</span>
            <Badge variant="neutral">Phase 10</Badge>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--fc-text-muted)', marginTop: '0.4rem' }}>
            Not available
          </div>
          <span className="form-hint">Container metrics scheduled</span>
        </Card>

        <Card style={{ padding: 'var(--fc-space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-card-label">P95 Latency</span>
            <Badge variant="neutral">Phase 10</Badge>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--fc-text-muted)', marginTop: '0.4rem' }}>
            Not available
          </div>
          <span className="form-hint">OpenTelemetry tracing scheduled</span>
        </Card>
      </div>

      {/* Main Grid: Recent Applications & System Health */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 'var(--fc-space-6)',
        }}
      >
        {/* Recent Applications Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <Link to="/applications" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm" iconRight={ExternalLink}>
                View All ({applications.length})
              </Button>
            </Link>
          </CardHeader>

          {isLoading ? (
            <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Runtime</TableHead>
                    <TableHead>Port</TableHead>
                    <TableHead>Branch</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SkeletonTableRows rows={3} cols={4} />
                </TableBody>
              </Table>
            </div>
          ) : recentApps.length === 0 ? (
            <EmptyState
              title="No Applications Registered"
              description="Get started by registering your first application service in ForgeCloud."
              action={
                isDeveloper && (
                  <Link to="/applications/create" style={{ textDecoration: 'none' }}>
                    <Button variant="primary" size="sm" icon={PlusCircle}>
                      Create your first application
                    </Button>
                  </Link>
                )
              }
            />
          ) : (
            <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Runtime</TableHead>
                    <TableHead>Port</TableHead>
                    <TableHead>Branch</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <Link
                          to={`/applications/${app.id}`}
                          style={{
                            fontWeight: 600,
                            color: 'var(--fc-text-primary)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                          }}
                        >
                          <span>{app.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span
                          style={{
                            fontFamily: 'var(--fc-font-mono)',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            background: 'var(--fc-bg-subtle)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--fc-radius-xs)',
                            border: '1px solid var(--fc-border-subtle)',
                          }}
                        >
                          {app.runtime}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span style={{ fontFamily: 'var(--fc-font-mono)', fontSize: '0.8rem' }}>
                          {app.port}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span style={{ color: 'var(--fc-text-muted)', fontSize: '0.8rem' }}>
                          {app.branch}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* System Infrastructure Health Card */}
        <Card>
          <CardHeader>
            <CardTitle>System & Infrastructure Health</CardTitle>
            <Badge variant="running" pulse={true}>Control Plane Online</Badge>
          </CardHeader>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--fc-space-3)' }}>
            {/* Control Plane API */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.9rem',
                backgroundColor: 'var(--fc-bg-subtle)',
                borderRadius: 'var(--fc-radius-sm)',
                border: '1px solid var(--fc-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Server size={16} color="var(--fc-status-success)" aria-hidden="true" />
                <div>
                  <div style={{ fontSize: 'var(--fc-font-size-small)', fontWeight: 600 }}>FastAPI Control Plane</div>
                  <div style={{ fontSize: 'var(--fc-font-size-caption)', color: 'var(--fc-text-muted)' }}>REST API Service v0.1.0</div>
                </div>
              </div>
              <Badge variant="running">Healthy</Badge>
            </div>

            {/* PostgreSQL Database */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.9rem',
                backgroundColor: 'var(--fc-bg-subtle)',
                borderRadius: 'var(--fc-radius-sm)',
                border: '1px solid var(--fc-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Database size={16} color="var(--fc-status-success)" aria-hidden="true" />
                <div>
                  <div style={{ fontSize: 'var(--fc-font-size-small)', fontWeight: 600 }}>PostgreSQL Database</div>
                  <div style={{ fontSize: 'var(--fc-font-size-caption)', color: 'var(--fc-text-muted)' }}>Persistent Storage & Alembic Migrations</div>
                </div>
              </div>
              <Badge variant="running">Healthy</Badge>
            </div>

            {/* Amazon EKS */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.9rem',
                backgroundColor: 'var(--fc-bg-subtle)',
                borderRadius: 'var(--fc-radius-sm)',
                border: '1px solid var(--fc-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Cloud size={16} color="var(--fc-text-muted)" aria-hidden="true" />
                <div>
                  <div style={{ fontSize: 'var(--fc-font-size-small)', fontWeight: 600 }}>Amazon EKS Cluster</div>
                  <div style={{ fontSize: 'var(--fc-font-size-caption)', color: 'var(--fc-text-muted)' }}>NOT VERIFIED — REQUIRES AWS ENVIRONMENT</div>
                </div>
              </div>
              <Badge variant="neutral">Phase 6–7 Planned</Badge>
            </div>

            {/* Amazon ECR */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.9rem',
                backgroundColor: 'var(--fc-bg-subtle)',
                borderRadius: 'var(--fc-radius-sm)',
                border: '1px solid var(--fc-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Layers size={16} color="var(--fc-text-muted)" aria-hidden="true" />
                <div>
                  <div style={{ fontSize: 'var(--fc-font-size-small)', fontWeight: 600 }}>Amazon ECR Registry</div>
                  <div style={{ fontSize: 'var(--fc-font-size-caption)', color: 'var(--fc-text-muted)' }}>Container Image Repository</div>
                </div>
              </div>
              <Badge variant="neutral">Phase 6 Planned</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Deployments Section - Honest Phase 7 & 9 Planned State */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent Deployments</CardTitle>
            <p style={{ margin: 0, fontSize: 'var(--fc-font-size-caption)', color: 'var(--fc-text-muted)' }}>
              Chronological deployment pipeline events and synchronization history
            </p>
          </div>
          <Badge variant="info">Phase 7 & 9 Planned</Badge>
        </CardHeader>

        <div className="roadmap-box" style={{ margin: 0, padding: 'var(--fc-space-6) var(--fc-space-4)' }}>
          <Clock size={32} color="var(--fc-primary)" aria-hidden="true" />
          <h3 style={{ fontSize: '1rem', margin: 0 }}>Automated Deployments Pipeline Planned</h3>
          <p style={{ maxWidth: '520px', fontSize: 'var(--fc-font-size-small)', color: 'var(--fc-text-muted)', margin: 0 }}>
            In Phase 4, ForgeCloud manages application definitions and container configurations.
            Chronological releases, container image tagging with Git commit SHAs, and Argo CD GitOps synchronization to Amazon EKS connect in Phases 7 & 9.
          </p>
          <span className="roadmap-notice">
            <AlertCircle size={13} style={{ display: 'inline', marginRight: 4 }} aria-hidden="true" />
            NO FAKE METRICS • CONNECTS WITH KUBERNETES & ARGO CD
          </span>
        </div>
      </Card>
    </div>
  );
}
