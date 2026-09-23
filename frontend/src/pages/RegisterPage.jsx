import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';
import { UserPlus, AlertCircle, Eye, EyeOff, Lock, Mail, User, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DEVELOPER');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      errs.name = 'Full name is required';
    }

    if (!trimmedEmail) {
      errs.email = 'Work email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      await register(name.trim(), email.trim(), password, role);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (err.response?.status === 400) {
        setError('An account with this email address already exists.');
      } else {
        setError('Unable to register account. Please check your network connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--fc-bg-page)',
        padding: 'var(--fc-space-4)',
      }}
    >
      <div
        style={{
          maxWidth: '420px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Back Link to Landing */}
        <div style={{ alignSelf: 'flex-start', marginBottom: 'var(--fc-space-4)' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--fc-space-6)' }}>
          <div
            className="brand-icon"
            style={{
              width: 44,
              height: 44,
              margin: '0 auto var(--fc-space-3)',
              fontSize: '1.25rem',
            }}
            aria-hidden="true"
          >
            F
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              marginBottom: '0.25rem',
            }}
          >
            ForgeCloud
          </h1>
          <p
            style={{
              fontSize: 'var(--fc-font-size-small)',
              color: 'var(--fc-text-secondary)',
              margin: 0,
            }}
          >
            Create your developer account
          </p>
        </div>

        {/* Register Card */}
        <div
          className="card"
          style={{
            width: '100%',
            padding: 'var(--fc-space-8) var(--fc-space-6)',
            boxShadow: 'var(--fc-shadow-elevated)',
            border: '1px solid var(--fc-border-medium)',
          }}
        >
          <div style={{ marginBottom: 'var(--fc-space-6)', textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>
              Get started with ForgeCloud
            </h2>
            <p
              style={{
                fontSize: 'var(--fc-font-size-small)',
                color: 'var(--fc-text-muted)',
                marginTop: '0.25rem',
                margin: 0,
              }}
            >
              Instant sandbox provisioning with full control plane access.
            </p>
          </div>

          {error && (
            <div
              className="alert alert-danger animate-fade-in"
              role="alert"
              aria-live="polite"
              style={{ marginBottom: 'var(--fc-space-5)' }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">
                Full Name <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="register-name"
                  type="text"
                  className="form-input"
                  style={{
                    paddingLeft: '2.25rem',
                    borderColor: fieldErrors.name ? 'var(--fc-status-danger)' : undefined,
                  }}
                  placeholder="Jane Developer"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: null }));
                  }}
                  required
                  autoFocus
                  disabled={isLoading}
                  autoComplete="name"
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                />
                <User
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--fc-text-muted)',
                    pointerEvents: 'none',
                  }}
                  aria-hidden="true"
                />
              </div>
              {fieldErrors.name && (
                <span id="name-error" className="form-error">
                  {fieldErrors.name}
                </span>
              )}
            </div>

            {/* Work Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-email">
                Work Email <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="register-email"
                  type="email"
                  className="form-input"
                  style={{
                    paddingLeft: '2.25rem',
                    borderColor: fieldErrors.email ? 'var(--fc-status-danger)' : undefined,
                  }}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: null }));
                  }}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                />
                <Mail
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--fc-text-muted)',
                    pointerEvents: 'none',
                  }}
                  aria-hidden="true"
                />
              </div>
              {fieldErrors.email && (
                <span id="email-error" className="form-error">
                  {fieldErrors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-password">
                Password <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{
                    paddingLeft: '2.25rem',
                    paddingRight: '2.5rem',
                    borderColor: fieldErrors.password ? 'var(--fc-status-danger)' : undefined,
                  }}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: null }));
                  }}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                />
                <Lock
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--fc-text-muted)',
                    pointerEvents: 'none',
                  }}
                  aria-hidden="true"
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-icon btn-sm"
                  style={{
                    position: 'absolute',
                    right: '0.35rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--fc-text-muted)',
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span id="password-error" className="form-error">
                  {fieldErrors.password}
                </span>
              )}
            </div>

            {/* Role Preference */}
            <div className="form-group" style={{ marginBottom: 'var(--fc-space-6)' }}>
              <label className="form-label" htmlFor="register-role">
                Primary Platform Role
              </label>
              <select
                id="register-role"
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoading}
              >
                <option value="DEVELOPER">Developer (Service Registration & Operations)</option>
                <option value="VIEWER">Viewer (Read-Only Metrics & Observability)</option>
              </select>
              <span className="form-hint">Administrators can grant elevated permissions in Settings.</span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              loadingText="Creating account..."
              disabled={isLoading}
              icon={UserPlus}
              style={{ width: '100%' }}
            >
              Create Account
            </Button>
          </form>

          {/* Existing Account Link */}
          <div
            style={{
              marginTop: 'var(--fc-space-6)',
              paddingTop: 'var(--fc-space-4)',
              borderTop: '1px solid var(--fc-border-subtle)',
              textAlign: 'center',
              fontSize: 'var(--fc-font-size-small)',
              color: 'var(--fc-text-muted)',
            }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--fc-primary)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
