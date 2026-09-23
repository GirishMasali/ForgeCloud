import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationService } from '../services/applicationService';
import {
  Card,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  ConfirmModal,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  SkeletonCard,
} from '../components/ui';
import ApplicationForm from '../components/ApplicationForm';
import {
  ArrowLeft,
  GitBranch,
  Globe,
  Trash2,
  Edit,
  Play,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Clock,
  CheckCircle,
  Server,
  Layers,
  Terminal,
} from 'lucide-react';

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDeveloper } = useAuth();

  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Active Tab State: 'overview' | 'deployments' | 'infrastructure'
  const [activeTab, setActiveTab] = useState('overview');

  const fetchApplication = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await applicationService.getApplication(id);
      setApplication(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Application not found. It may have been removed from the control plane.');
      } else {
        setError('Unable to fetch application metadata from the control plane.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleUpdate = async (formData) => {
    setEditError(null);
    setEditLoading(true);
    try {
      const updated = await applicationService.updateApplication(id, formData);
      setApplication(updated);
      setIsEditModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update application configuration.';
      setEditError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await applicationService.deleteApplication(id);
      setIsDeleteModalOpen(false);
      navigate('/applications');
    } catch (err) {
      setError('Failed to delete application. Please try again.');
      setIsDeleteModalOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--fc-space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: '40%' }}>
            <SkeletonCard lines={2} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--fc-space-6)' }}>
          <SkeletonCard lines={4} />
          <SkeletonCard lines={4} />
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <Card style={{ maxWidth: '580px', margin: '3rem auto', textAlign: 'center' }}>
        <div style={{ color: 'var(--fc-status-danger)', marginBottom: 'var(--fc-space-3)' }}>
          <AlertCircle size={44} style={{ margin: '0 auto' }} aria-hidden="true" />
        </div>
        <h2>{error || 'Application Not Found'}</h2>
        <p style={{ margin: 'var(--fc-space-4) 0', color: 'var(--fc-text-secondary)' }}>
          The requested application ID ({id}) could not be resolved from the control plane database.
        </p>
        <Link to="/applications" style={{ textDecoration: 'none' }}>
          <Button variant="secondary" icon={ArrowLeft}>
            Return to Applications Catalog
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--fc-space-6)' }}>
      {/* Header with Navigation, Title, and Actions */}
      <div className="page-header">
        <div className="page-header-title">
          <div style={{ marginBottom: 'var(--fc-space-2)' }}>
            <Link to="/applications" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm" icon={ArrowLeft}>
                Back to Catalog
              </Button>
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--fc-space-3)', flexWrap: 'wrap' }}>
            <h1>{application.name}</h1>
            <Badge variant="configured">Configured</Badge>
          </div>
          <p style={{ fontFamily: 'var(--fc-font-mono)', fontSize: '0.75rem', color: 'var(--fc-text-muted)' }}>
            UUID: {application.id}
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="page-actions">
          {isDeveloper && (
            <>
              <Button
                variant="secondary"
                icon={Edit}
                onClick={() => {
                  setEditError(null);
                  setIsEditModalOpen(true);
                }}
              >
                Edit Config
              </Button>
              <Button
                variant="destructive"
                icon={Trash2}
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Delete Application
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--fc-border-subtle)',
          gap: 'var(--fc-space-6)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '0.65rem 0.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'overview' ? '2px solid var(--fc-primary)' : '2px solid transparent',
            color: activeTab === 'overview' ? 'var(--fc-primary)' : 'var(--fc-text-secondary)',
            fontWeight: activeTab === 'overview' ? 600 : 500,
            fontSize: 'var(--fc-font-size-small)',
            cursor: 'pointer',
            transition: 'all var(--fc-transition-fast)',
          }}
        >
          Overview & Specification
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('deployments')}
          style={{
            padding: '0.65rem 0.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'deployments' ? '2px solid var(--fc-primary)' : '2px solid transparent',
            color: activeTab === 'deployments' ? 'var(--fc-primary)' : 'var(--fc-text-secondary)',
            fontWeight: activeTab === 'deployments' ? 600 : 500,
            fontSize: 'var(--fc-font-size-small)',
            cursor: 'pointer',
            transition: 'all var(--fc-transition-fast)',
          }}
        >
          Deployment History
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('infrastructure')}
          style={{
            padding: '0.65rem 0.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'infrastructure' ? '2px solid var(--fc-primary)' : '2px solid transparent',
            color: activeTab === 'infrastructure' ? 'var(--fc-primary)' : 'var(--fc-text-secondary)',
            fontWeight: activeTab === 'infrastructure' ? 600 : 500,
            fontSize: 'var(--fc-font-size-small)',
            cursor: 'pointer',
            transition: 'all var(--fc-transition-fast)',
          }}
        >
          Infrastructure Binding
        </button>
      </div>

      {/* Tab 1: Overview & Specification */}
      {activeTab === 'overview' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 'var(--fc-space-6)',
          }}
        >
          {/* Workload Specification Card */}
          <Card>
            <CardHeader>
              <CardTitle>Workload Specification</CardTitle>
              <Badge variant="info">{application.runtime}</Badge>
            </CardHeader>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--fc-space-4)' }}>
              <div>
                <span className="form-hint">Source Git Repository</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <Globe size={15} color="var(--fc-primary)" aria-hidden="true" />
                  <a
                    href={application.repository_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ wordBreak: 'break-all', fontSize: 'var(--fc-font-size-body)' }}
                  >
                    {application.repository_url}
                  </a>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--fc-space-4)' }}>
                <div>
                  <span className="form-hint">Target Branch</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <GitBranch size={15} color="var(--fc-text-secondary)" aria-hidden="true" />
                    <span style={{ fontWeight: 500, fontSize: 'var(--fc-font-size-body)' }}>
                      {application.branch}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="form-hint">Container Port</span>
                  <div style={{ marginTop: '0.25rem' }}>
                    <span style={{ fontFamily: 'var(--fc-font-mono)', fontWeight: 600, fontSize: '0.95rem' }}>
                      {application.port}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--fc-border-subtle)', paddingTop: 'var(--fc-space-4)' }}>
                <span className="form-hint">Service Metadata</span>
                <div style={{ fontSize: 'var(--fc-font-size-caption)', color: 'var(--fc-text-secondary)', marginTop: '0.25rem' }}>
                  Created by User UUID: <code style={{ color: 'var(--fc-text-muted)' }}>{application.created_by}</code>
                </div>
                <div style={{ fontSize: 'var(--fc-font-size-caption)', color: 'var(--fc-text-muted)', marginTop: '0.25rem' }}>
                  Registered on {new Date(application.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          </Card>

          {/* Release Operations (Strictly Real - No Fake Actions) */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Release & Workload Controls</CardTitle>
                <p style={{ margin: 0, fontSize: 'var(--fc-font-size-caption)', color: 'var(--fc-text-muted)' }}>
                  Workload execution lifecycle
                </p>
              </div>
              <Badge variant="warning">Phases 7–11 Scheduled</Badge>
            </CardHeader>

            <p style={{ fontSize: 'var(--fc-font-size-small)', color: 'var(--fc-text-secondary)', marginBottom: 'var(--fc-space-4)' }}>
              In Phase 4, the application definition is active in the control plane.
              Automated container builds, ECR publishing, and Argo CD GitOps deployments connect in Phases 5–9.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--fc-space-3)' }}>
              <Button
                variant="secondary"
                disabled
                icon={Play}
                style={{ justifyContent: 'flex-start' }}
              >
                <span>Deploy Workload (Scheduled: Phase 7/9)</span>
              </Button>

              <Button
                variant="secondary"
                disabled
                icon={RotateCcw}
                style={{ justifyContent: 'flex-start' }}
              >
                <span>Rollback Release (Scheduled: Phase 11)</span>
              </Button>

              <Button
                variant="secondary"
                disabled
                icon={RefreshCw}
                style={{ justifyContent: 'flex-start' }}
              >
                <span>Restart Workload (Scheduled: Phase 7)</span>
              </Button>
            </div>

            <div
              style={{
                marginTop: 'var(--fc-space-4)',
                padding: 'var(--fc-space-3)',
                borderRadius: 'var(--fc-radius-xs)',
                backgroundColor: 'var(--fc-bg-subtle)',
                border: '1px solid var(--fc-border-subtle)',
                fontSize: '0.725rem',
                color: 'var(--fc-text-muted)',
              }}
            >
              <strong>Data Integrity Guarantee:</strong> ForgeCloud does not execute fake mock actions. Operations require active Kubernetes / Argo CD controller APIs.
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Deployment History (Reusing Table and Badge Primitives) */}
      {activeTab === 'deployments' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Deployment History</CardTitle>
              <p style={{ margin: 0, fontSize: 'var(--fc-font-size-caption)', color: 'var(--fc-text-muted)' }}>
                Immutable releases dispatched for {application.name}
              </p>
            </div>
            <Badge variant="neutral">No Deployments Yet</Badge>
          </CardHeader>

          <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Release ID</TableHead>
                  <TableHead>Commit SHA</TableHead>
                  <TableHead>Image Tag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Triggered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} style={{ textAlign: 'center', padding: 'var(--fc-space-8)' }}>
                    <div style={{ color: 'var(--fc-text-muted)', fontSize: 'var(--fc-font-size-small)' }}>
                      <Clock size={28} style={{ margin: '0 auto var(--fc-space-2)' }} aria-hidden="true" />
                      <p style={{ margin: 0, fontWeight: 500, color: 'var(--fc-text-primary)' }}>
                        No deployments recorded in Phase 4
                      </p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: 'var(--fc-font-size-caption)' }}>
                        Deployment telemetry will populate upon integration of Amazon EKS and Argo CD (Phases 7 & 9).
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Tab 3: Infrastructure Binding */}
      {activeTab === 'infrastructure' && (
        <Card>
          <CardHeader>
            <CardTitle>Cloud Infrastructure Bindings</CardTitle>
            <Badge variant="neutral">AWS Environment Required</Badge>
          </CardHeader>

          <div className="roadmap-box" style={{ margin: 0, padding: 'var(--fc-space-8)' }}>
            <Server size={32} color="var(--fc-primary)" aria-hidden="true" />
            <h3 style={{ margin: 0 }}>AWS VPC, EKS & ECR Bindings</h3>
            <p style={{ maxWidth: '540px', fontSize: 'var(--fc-font-size-small)', color: 'var(--fc-text-muted)', margin: 0 }}>
              Workload infrastructure is managed via Terraform and Kubernetes manifests.
              AWS VPC routing, Amazon ECR repository provisioning, and EKS Service/Ingress bindings connect in Phases 6 & 7.
            </p>
            <span className="roadmap-notice">
              NOT VERIFIED — REQUIRES AWS ENVIRONMENT (PHASE 6)
            </span>
          </div>
        </Card>
      )}

      {/* Edit Modal Dialog */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit ${application.name}`}
        description="Update repository binding, target branch, port, or container runtime."
      >
        {editError && (
          <div className="alert alert-danger" role="alert" style={{ marginBottom: 'var(--fc-space-4)' }}>
            <AlertCircle size={16} aria-hidden="true" />
            <span>{editError}</span>
          </div>
        )}
        <ApplicationForm
          initialData={application}
          isEdit={true}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={editLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal (Requires Exact Name Verification) */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Application"
        message={`Are you sure you want to permanently delete application "${application.name}"? This operation cannot be undone and removes all configuration metadata from ForgeCloud.`}
        confirmText="Permanently Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={deleteLoading}
        confirmTypedText={application.name}
        confirmInputLabel={
          <span>
            To confirm deletion, please type <strong style={{ color: 'var(--fc-status-danger)' }}>{application.name}</strong>:
          </span>
        }
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
