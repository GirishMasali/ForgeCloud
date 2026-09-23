import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import LoadingSpinner from '../components/LoadingSpinner';
import PlaceholderPage from '../components/PlaceholderPage';
import { ArrowLeft } from 'lucide-react';

export default function ApplicationInfrastructurePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadApp() {
      try {
        const data = await applicationService.getApplication(id);
        setApplication(data);
      } catch {
        // Handled gracefully
      } finally {
        setIsLoading(false);
      }
    }
    loadApp();
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner message="Loading infrastructure parameters..." size="lg" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => navigate(`/applications/${id}`)}
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.2rem 0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to {application?.name || 'Application'}</span>
        </button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: '1.5rem' }}>
        <Link
          to={`/applications/${id}`}
          style={{
            padding: '0.65rem 0.25rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}
        >
          Overview & Config
        </Link>
        <Link
          to={`/applications/${id}/deployments`}
          style={{
            padding: '0.65rem 0.25rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}
        >
          Deployments Timeline
        </Link>
        <Link
          to={`/applications/${id}/infrastructure`}
          style={{
            padding: '0.65rem 0.25rem',
            color: 'var(--accent-cyan)',
            fontWeight: 600,
            borderBottom: '2px solid var(--accent-cyan)',
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}
        >
          Infrastructure
        </Link>
      </div>

      <PlaceholderPage
        title={`Infrastructure — ${application?.name || 'Application'}`}
        phaseNumber="6"
        phaseName="Terraform AWS Infrastructure"
        description="Dedicated cloud infrastructure provisioning for this application, including VPC subnets, dedicated IAM roles, ECR repository mapping, and cluster service discovery."
        deliverables={[
          'Declarative Terraform module instantiation for application',
          'Amazon ECR repository provisioning with vulnerability scanning',
          'AWS IAM least-privilege service account role (IRSA)',
          'Automated infrastructure state tracking in PostgreSQL',
        ]}
        requiresAws={true}
      />
    </div>
  );
}
