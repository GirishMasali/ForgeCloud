import React from 'react';
import { Layers, AlertCircle, Calendar } from 'lucide-react';

export default function PlaceholderPage({
  title,
  phaseNumber,
  phaseName,
  description,
  deliverables = [],
  requiresAws = false,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div className="page-header-title">
          <h1>{title}</h1>
          <p>ForgeCloud Control Plane Roadmap</p>
        </div>
      </div>

      <div className="roadmap-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span className="roadmap-phase-badge">
            <Calendar size={14} style={{ display: 'inline', marginRight: 4 }} />
            Phase {phaseNumber}: {phaseName}
          </span>
          {requiresAws && (
            <span className="roadmap-notice">
              <AlertCircle size={14} style={{ display: 'inline', marginRight: 4 }} />
              NOT VERIFIED — REQUIRES AWS ENVIRONMENT
            </span>
          )}
        </div>

        <div style={{ maxWidth: '580px', margin: '0.75rem 0' }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Feature Integration Scheduled for Phase {phaseNumber}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {description}
          </p>
        </div>

        {deliverables.length > 0 && (
          <div
            style={{
              textAlign: 'left',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem 1.5rem',
              maxWidth: '520px',
              width: '100%',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Planned Deliverables
            </div>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {deliverables.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
