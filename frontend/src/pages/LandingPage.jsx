import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button, Badge, Card } from '../components/ui';
import '../styles/landing.css';
import {
  Boxes,
  Cpu,
  LineChart,
  ShieldCheck,
  Cloud,
  GitPullRequest,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
  Terminal,
  CheckCircle2,
  Server,
  Layers,
  Activity,
  Zap,
  Lock,
} from 'lucide-react';

const SIMULATOR_STAGES = [
  {
    id: 'register',
    stepNumber: '01',
    tabTitle: '1. Service Registry',
    headline: 'Standardized Service Catalog Registration',
    description: 'Declare application specifications, target Git repositories, default branches, and networking ports through self-service control plane APIs.',
    terminalCommand: 'forgectl apps register --name payments-worker --runtime dockerfile --port 8080',
    terminalOutput: [
      '✓ Validating application identifier slug: "payments-worker"',
      '✓ Verifying Git repository permissions and branch HEAD',
      '✓ Generating service DNS binding: payments-worker.forgecloud.internal',
      '✓ Registration complete. Application UUID: c8f3a9e1-5b72-4d39-b541-e129f',
    ],
    activeTag: 'Catalog Active',
  },
  {
    id: 'container',
    stepNumber: '02',
    tabTitle: '2. Container Engine',
    headline: 'Immutable Container Image Packaging',
    description: 'Standardized buildpacks compile source code into OCI-compliant container images tagged with immutable Git commit SHAs, published securely to Amazon ECR.',
    terminalCommand: 'forgectl build --app payments-worker --git-sha a7b91f4',
    terminalOutput: [
      '→ Inspecting runtime environment: Python 3.11 / Multi-stage Dockerfile',
      '→ Building container image with Layer Caching enabled',
      '✓ Container image built: 000000000000.dkr.ecr.us-east-1.amazonaws.com/payments-worker:a7b91f4',
      '✓ Vulnerability scan passed: 0 Critical / 0 High CVEs',
    ],
    activeTag: 'OCI Verified',
  },
  {
    id: 'gitops',
    stepNumber: '03',
    tabTitle: '3. GitOps Delivery',
    headline: 'Declarative Kubernetes Synchronization via Argo CD',
    description: 'Automated pull-based GitOps engine synchronizes desired Kubernetes manifests into Amazon EKS clusters, tracking rollout health and pod replica readiness.',
    terminalCommand: 'forgectl deploy --app payments-worker --env dev',
    terminalOutput: [
      '→ Generating Kubernetes Deployment & ClusterIP Service manifests',
      '→ Argo CD Application Sync triggered on cluster: forgecloud-dev-eks',
      '✓ Pod ReplicaSet updated: 3/3 pods RUNNING and Healthy',
      '✓ Ingress controller routing initialized at /payments',
    ],
    activeTag: 'GitOps Synced',
  },
  {
    id: 'telemetry',
    stepNumber: '04',
    tabTitle: '4. Continuous Telemetry',
    headline: 'Real-Time Observability & OpenTelemetry Tracing',
    description: 'Out-of-the-box Prometheus metrics, Grafana dashboards, and OpenTelemetry distributed tracing deliver full-stack visibility from day one.',
    terminalCommand: 'forgectl telemetry status --app payments-worker',
    terminalOutput: [
      '✓ Prometheus scraping enabled at /metrics (HTTP 200 OK)',
      '✓ Latency P95: 14.2ms | CPU: 12% | Memory: 142MB',
      '✓ OpenTelemetry traces streaming to collector',
      '✓ Platform health score: 99.98% operational',
    ],
    activeTag: 'Live Monitoring',
  },
];

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeStageId, setActiveStageId] = useState('register');

  const activeStage =
    SIMULATOR_STAGES.find((s) => s.id === activeStageId) || SIMULATOR_STAGES[0];

  return (
    <div className="landing-page">
      {/* Dynamic Ambient Glow Mesh & Subtle Grid */}
      <div className="landing-ambient-glow" aria-hidden="true" />
      <div className="landing-grid-bg" aria-hidden="true" />

      {/* Top Dynamic Navigation Bar */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-brand">
            <div className="brand-icon" aria-hidden="true">
              F
            </div>
            <span className="landing-brand-title">ForgeCloud</span>
          </Link>

          {/* Quick Nav Anchors */}
          <ul className="landing-nav-links">
            <li>
              <a href="#features" className="landing-nav-link">
                Platform Features
              </a>
            </li>
            <li>
              <a href="#simulator" className="landing-nav-link">
                Workflow Simulator
              </a>
            </li>
            <li>
              <a href="#architecture" className="landing-nav-link">
                Architecture
              </a>
            </li>
          </ul>

          {/* Actions & Session Awareness */}
          <div className="landing-nav-actions">
            <button
              type="button"
              className="btn btn-ghost btn-icon btn-sm"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {isAuthenticated ? (
              <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="sm" iconRight={ArrowRight}>
                  Launch Console
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="sm" iconRight={ArrowRight}>
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section (Single Focused Goal: Onboard / Convert) */}
      <section className="landing-hero">
        <div className="hero-pill-badge">
          <Sparkles size={14} aria-hidden="true" />
          <span>v0.1.0 Control Plane • Cloud-Native Developer Platform</span>
        </div>

        <h1 className="hero-headline">
          The Self-Service Cloud Platform for{' '}
          <span className="hero-headline-gradient">High-Velocity Engineering</span>
        </h1>

        <p className="hero-subtitle">
          Eliminate deployment bottlenecks and Kubernetes YAML fatigue.
          ForgeCloud empowers developers to register, package, and deploy containerized
          services to AWS with automated GitOps delivery and enterprise RBAC.
        </p>

        {/* Clear Call-To-Action conversion buttons */}
        <div className="hero-cta-group">
          {isAuthenticated ? (
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="lg" iconRight={ArrowRight}>
                Enter Control Plane Console
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Button
                  variant="primary"
                  size="lg"
                  iconRight={ArrowRight}
                  style={{
                    boxShadow: '0 0 20px var(--fc-primary-subtle)',
                    padding: '0.75rem 1.6rem',
                    fontSize: '1rem',
                  }}
                >
                  Start Building Free
                </Button>
              </Link>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button
                  variant="secondary"
                  size="lg"
                  style={{ padding: '0.75rem 1.4rem', fontSize: '1rem' }}
                >
                  Sign In to Existing Account
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="hero-proof-text">
          <CheckCircle2 size={14} color="var(--fc-status-success)" aria-hidden="true" />
          <span>Instant sandbox access • Zero credit card required • Enterprise ready</span>
        </div>
      </section>

      {/* Interactive Platform Simulator Showcase */}
      <section id="simulator" className="landing-simulator">
        <div className="simulator-window">
          {/* Window Header */}
          <div className="simulator-header">
            <div className="simulator-traffic-lights" aria-hidden="true">
              <span className="traffic-light red" />
              <span className="traffic-light yellow" />
              <span className="traffic-light green" />
            </div>

            {/* Interactive Tabs */}
            <div className="simulator-tabs" role="tablist">
              {SIMULATOR_STAGES.map((stage) => (
                <button
                  key={stage.id}
                  type="button"
                  role="tab"
                  aria-selected={activeStageId === stage.id}
                  className={`simulator-tab-btn ${
                    activeStageId === stage.id ? 'active' : ''
                  }`}
                  onClick={() => setActiveStageId(stage.id)}
                >
                  {stage.tabTitle}
                </button>
              ))}
            </div>

            <Badge variant="configured" style={{ fontSize: '0.65rem' }}>
              Interactive Engine
            </Badge>
          </div>

          {/* Window Body: Description & Live Terminal */}
          <div className="simulator-body">
            {/* Left: Explanatory Context */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--fc-space-3)' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--fc-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Stage {activeStage.stepNumber} of 04
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                {activeStage.headline}
              </h3>
              <p style={{ fontSize: 'var(--fc-font-size-small)', color: 'var(--fc-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {activeStage.description}
              </p>

              <div style={{ marginTop: 'var(--fc-space-2)' }}>
                <Badge variant="running">{activeStage.activeTag}</Badge>
              </div>
            </div>

            {/* Right: Live Interactive Terminal */}
            <div className="simulator-terminal">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: '0.75rem',
                  color: 'var(--fc-text-muted)',
                  fontSize: '0.7rem',
                  borderBottom: '1px solid var(--fc-border-subtle)',
                  paddingBottom: '0.4rem',
                }}
              >
                <Terminal size={12} aria-hidden="true" />
                <span>bash — control-plane-cli</span>
              </div>

              <div className="terminal-line" style={{ marginBottom: '0.5rem' }}>
                <span className="terminal-prompt">$</span>
                <span className="terminal-accent">{activeStage.terminalCommand}</span>
              </div>

              {activeStage.terminalOutput.map((line, idx) => (
                <div key={idx} style={{ color: 'var(--fc-text-secondary)', fontSize: '0.75rem' }}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Grid */}
      <section id="features" className="landing-features">
        <div className="section-header">
          <h2>Engineered for Developer Velocity</h2>
          <p>
            Standardized abstractions built on top of AWS, Kubernetes, and Terraform.
            Everything high-performing product engineering teams need.
          </p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper" aria-hidden="true">
              <Boxes size={20} />
            </div>
            <h3 className="feature-title">Self-Service Application Catalog</h3>
            <p className="feature-desc">
              Register microservices and containerized backends in seconds with standardized Git repository bindings and port definitions.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper" aria-hidden="true">
              <ShieldCheck size={20} />
            </div>
            <h3 className="feature-title">Enterprise RBAC & Security</h3>
            <p className="feature-desc">
              Enforce strict role-based access control across Administrators, Developers, and Viewers with zero hardcoded credentials.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper" aria-hidden="true">
              <Cpu size={20} />
            </div>
            <h3 className="feature-title">Declarative Infrastructure as Code</h3>
            <p className="feature-desc">
              All cloud resources are provisioned through structured Terraform configurations, ensuring full reproducibility and auditability.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper" aria-hidden="true">
              <Cloud size={20} />
            </div>
            <h3 className="feature-title">Kubernetes & Amazon EKS Native</h3>
            <p className="feature-desc">
              Native Amazon EKS cluster orchestrations and Amazon ECR registry publishing built for high availability and zero downtime.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper" aria-hidden="true">
              <GitPullRequest size={20} />
            </div>
            <h3 className="feature-title">Argo CD GitOps Delivery</h3>
            <p className="feature-desc">
              Automated pull-based continuous synchronization directly from Git commits to production Kubernetes namespaces.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper" aria-hidden="true">
              <LineChart size={20} />
            </div>
            <h3 className="feature-title">Full-Stack Observability</h3>
            <p className="feature-desc">
              Continuous operational metrics via Prometheus, Grafana visualizations, and OpenTelemetry distributed request tracing.
            </p>
          </div>
        </div>
      </section>

      {/* Platform Velocity Stats Strip */}
      <section id="architecture" className="landing-stats-strip">
        <div className="stats-grid">
          <div>
            <div className="stat-item-number">&lt; 30s</div>
            <div className="stat-item-label">Workload Provisioning</div>
          </div>
          <div>
            <div className="stat-item-number">100%</div>
            <div className="stat-item-label">Secret & Key Protection</div>
          </div>
          <div>
            <div className="stat-item-number">4 Runtimes</div>
            <div className="stat-item-label">Python, Node, Go, Dockerfile</div>
          </div>
          <div>
            <div className="stat-item-number">Phase 1–4</div>
            <div className="stat-item-label">Operational Architecture</div>
          </div>
        </div>
      </section>

      {/* High-Conversion Pre-Footer Call to Action Banner */}
      <section className="landing-cta-banner">
        <div className="cta-banner-box">
          <h2 className="cta-banner-title">
            Ready to eliminate deployment bottlenecks?
          </h2>
          <p className="cta-banner-desc">
            Experience cloud-native developer self-service without complexity.
            Sign up today or log in to manage your services.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--fc-space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
            {isAuthenticated ? (
              <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="lg" iconRight={ArrowRight}>
                  Return to Dashboard Console
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="lg" iconRight={ArrowRight}>
                    Create Your Account
                  </Button>
                </Link>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Button variant="secondary" size="lg">
                    Sign In to Existing Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--fc-space-3)' }}>
            <div className="brand-icon" style={{ width: 24, height: 24, fontSize: '0.8rem' }} aria-hidden="true">
              F
            </div>
            <span style={{ fontWeight: 600, color: 'var(--fc-text-primary)' }}>ForgeCloud</span>
            <span>• Self-Service Cloud-Native IDP</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--fc-space-4)' }}>
            <Badge variant="configured">Phase 4 Operational</Badge>
            <span>© {new Date().getFullYear()} ForgeCloud Platform.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
