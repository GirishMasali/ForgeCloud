import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';
import { LogIn, AlertCircle, Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const errs = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errs.email = 'Work email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
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
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      // User-friendly error mapping (never leak raw stack traces or internal backend errors)
      const status = err.response?.status;
      if (status === 401 || status === 400) {
        setError('Invalid work email or password. Please verify your credentials.');
      } else if (status >= 500) {
        setError('The control plane is temporarily unavailable. Please try again shortly.');
      } else {
        setError('Unable to authenticate. Please check your network connection.');
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
          maxWidth: '400px',
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

        {/* ForgeCloud Logo & Wordmark Header */}
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
            Internal Developer Platform
          </p>
        </div>

        {/* Auth Card */}
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
              Sign in to your account
            </h2>
            <p
              style={{
                fontSize: 'var(--fc-font-size-small)',
                color: 'var(--fc-text-muted)',
                marginTop: '0.25rem',
                margin: 0,
              }}
            >
              Enter your corporate credentials to access the control plane.
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
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Work Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-email"
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
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: null }));
                    }
                  }}
                  required
                  autoFocus
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

            {/* Password Field */}
            <div className="form-group" style={{ marginBottom: 'var(--fc-space-6)' }}>
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{
                    paddingLeft: '2.25rem',
                    paddingRight: '2.5rem',
                    borderColor: fieldErrors.password ? 'var(--fc-status-danger)' : undefined,
                  }}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: null }));
                    }
                  }}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
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
                  tabIndex={0}
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

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              loadingText="Authenticating..."
              disabled={isLoading}
              icon={LogIn}
              style={{ width: '100%' }}
            >
              Sign In to Platform
            </Button>
          </form>

          {/* New Account Link */}
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
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--fc-primary)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Footer Metadata */}
        <div
          style={{
            marginTop: 'var(--fc-space-6)',
            fontSize: 'var(--fc-font-size-caption)',
            color: 'var(--fc-text-muted)',
            textAlign: 'center',
          }}
        >
          Control Plane v0.1.0 • Phase 4 Architecture
        </div>
      </div>
    </div>
  );
}
