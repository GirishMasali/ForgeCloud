import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner message="Authenticating session..." size="lg" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return (
      <div style={{ padding: '3rem 1.5rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ color: 'var(--color-danger)' }}>
            <ShieldAlert size={48} />
          </div>
          <h2>403 — Access Denied</h2>
          <p>
            Your current role (<strong style={{ color: 'var(--text-primary)' }}>{user?.role}</strong>) does not
            have permission to access this resource.
          </p>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Required role: {allowedRoles.join(' or ')}
          </div>
        </div>
      </div>
    );
  }

  return children;
}
