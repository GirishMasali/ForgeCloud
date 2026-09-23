import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Key, Terminal } from 'lucide-react';

export default function SettingsPage() {
  const { user, role, isAdmin, isDeveloper } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '800px' }}>
      <div className="page-header">
        <div className="page-header-title">
          <h1>User Preferences & Profile</h1>
          <p>Active developer identity and platform permission settings.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <User size={18} color="var(--accent-cyan)" />
            <h2 className="card-title">Identity Profile</h2>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <span className="form-hint">Full Name</span>
              <div style={{ fontWeight: 600, fontSize: '1rem', marginTop: '0.2rem' }}>
                {user?.name || 'Anonymous User'}
              </div>
            </div>

            <div>
              <span className="form-hint">Email Address</span>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {user?.email || 'N/A'}
              </div>
            </div>

            <div>
              <span className="form-hint">Assigned RBAC Role</span>
              <div style={{ marginTop: '0.2rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    background: isAdmin
                      ? 'rgba(244, 63, 94, 0.15)'
                      : isDeveloper
                      ? 'rgba(0, 210, 255, 0.15)'
                      : 'rgba(245, 158, 11, 0.15)',
                    color: isAdmin ? '#f43f5e' : isDeveloper ? 'var(--accent-cyan)' : 'var(--color-warning)',
                    border: '1px solid currentColor',
                  }}
                >
                  {role || 'VIEWER'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <span className="form-hint">User Identifier (UUID)</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {user?.id || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Shield size={18} color="var(--accent-purple)" />
            <h2 className="card-title">Role Privileges Matrix</h2>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Operation</th>
                <th>ADMIN</th>
                <th>DEVELOPER</th>
                <th>VIEWER</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>List & View Applications</td>
                <td style={{ color: 'var(--color-success)' }}>Granted</td>
                <td style={{ color: 'var(--color-success)' }}>Granted</td>
                <td style={{ color: 'var(--color-success)' }}>Granted</td>
              </tr>
              <tr>
                <td>Create Applications</td>
                <td style={{ color: 'var(--color-success)' }}>Granted</td>
                <td style={{ color: 'var(--color-success)' }}>Granted</td>
                <td style={{ color: 'var(--color-danger)' }}>Denied</td>
              </tr>
              <tr>
                <td>Update Applications</td>
                <td style={{ color: 'var(--color-success)' }}>Granted</td>
                <td style={{ color: 'var(--color-success)' }}>Granted</td>
                <td style={{ color: 'var(--color-danger)' }}>Denied</td>
              </tr>
              <tr>
                <td>Delete Applications</td>
                <td style={{ color: 'var(--color-success)' }}>Granted</td>
                <td style={{ color: 'var(--color-success)' }}>Granted</td>
                <td style={{ color: 'var(--color-danger)' }}>Denied</td>
              </tr>
              <tr>
                <td>User Management & Audit Logs</td>
                <td style={{ color: 'var(--color-success)' }}>Granted</td>
                <td style={{ color: 'var(--color-danger)' }}>Denied</td>
                <td style={{ color: 'var(--color-danger)' }}>Denied</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
