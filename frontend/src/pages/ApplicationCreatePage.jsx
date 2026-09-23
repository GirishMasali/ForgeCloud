import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationService } from '../services/applicationService';
import ApplicationForm from '../components/ApplicationForm';
import { Card, Button } from '../components/ui';
import { ArrowLeft, AlertCircle, ShieldAlert } from 'lucide-react';

export default function ApplicationCreatePage() {
  const { isDeveloper, role } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isDeveloper) {
    return (
      <Card style={{ maxWidth: '520px', margin: '3rem auto', textAlign: 'center' }}>
        <div style={{ color: 'var(--fc-status-danger)', marginBottom: 'var(--fc-space-3)' }}>
          <ShieldAlert size={40} style={{ margin: '0 auto' }} aria-hidden="true" />
        </div>
        <h2>Permission Denied</h2>
        <p style={{ margin: 'var(--fc-space-4) 0', color: 'var(--fc-text-secondary)' }}>
          Your active role (<strong style={{ color: 'var(--fc-text-primary)' }}>{role || 'VIEWER'}</strong>) does not have permission to register new platform applications.
        </p>
        <Link to="/applications" style={{ textDecoration: 'none' }}>
          <Button variant="secondary">
            Return to Applications Catalog
          </Button>
        </Link>
      </Card>
    );
  }

  const handleSubmit = async (formData) => {
    setError(null);
    setIsLoading(true);
    try {
      const created = await applicationService.createApplication(formData);
      navigate(`/applications/${created.id}`);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string'
        ? detail
        : 'Failed to register application. An application with this identifier may already exist.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--fc-space-6)' }}>
      {/* Header with back navigation */}
      <div className="page-header">
        <div className="page-header-title">
          <div style={{ marginBottom: 'var(--fc-space-2)' }}>
            <Link to="/applications" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm" icon={ArrowLeft}>
                Back to Applications
              </Button>
            </Link>
          </div>
          <h1>Register New Application</h1>
          <p>Configure repository binding, networking, and container runtime for your platform service.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert" style={{ maxWidth: '680px' }}>
          <AlertCircle size={16} aria-hidden="true" style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <Card style={{ maxWidth: '680px' }}>
        <ApplicationForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/applications')}
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
}
