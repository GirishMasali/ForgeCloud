import React, { useState, useEffect } from 'react';
import { Button } from './ui';
import { AlertCircle } from 'lucide-react';

const RUNTIME_OPTIONS = [
  { value: 'dockerfile', label: 'Dockerfile (Container Native)' },
  { value: 'python', label: 'Python 3.10+ (FastAPI / Flask)' },
  { value: 'nodejs', label: 'Node.js 18+ (Express / React)' },
  { value: 'golang', label: 'Go 1.21+ (Gin / Chi)' },
];

export default function ApplicationForm({
  initialData = {},
  isEdit = false,
  onSubmit,
  onCancel,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    repository_url: initialData.repository_url || '',
    branch: initialData.branch || 'main',
    port: initialData.port || 8000,
    runtime: initialData.runtime || 'dockerfile',
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const validate = (data) => {
    const errs = {};

    if (!data.name.trim()) {
      errs.name = 'Application name is required';
    } else if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(data.name.trim())) {
      errs.name = 'Name must start with an alphanumeric character and contain only letters, numbers, _, -, .';
    }

    if (!data.repository_url.trim()) {
      errs.repository_url = 'Repository URL is required';
    }

    const portNum = Number(data.port);
    if (!portNum || portNum < 1 || portNum > 65535) {
      errs.port = 'Port must be an integer between 1 and 65535';
    }

    return errs;
  };

  useEffect(() => {
    setErrors(validate(formData));
  }, [formData]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'port' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const isFormValid = Object.keys(errors).length === 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentErrors = validate(formData);
    setErrors(currentErrors);
    setTouched({
      name: true,
      repository_url: true,
      branch: true,
      port: true,
      runtime: true,
    });

    if (Object.keys(currentErrors).length === 0 && !isLoading) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: '640px' }}>
      {/* Application Name */}
      <div className="form-group">
        <label className="form-label" htmlFor="app-name">
          <span>
            Application Identifier <span className="required">*</span>
          </span>
        </label>
        <input
          id="app-name"
          name="name"
          type="text"
          className="form-input"
          style={{
            borderColor: touched.name && errors.name ? 'var(--fc-status-danger)' : undefined,
          }}
          placeholder="e.g. payments-api"
          value={formData.name}
          onChange={handleChange}
          onBlur={() => handleBlur('name')}
          disabled={isLoading}
          required
          aria-invalid={Boolean(touched.name && errors.name)}
          aria-describedby={touched.name && errors.name ? 'app-name-error' : 'app-name-hint'}
        />
        {touched.name && errors.name ? (
          <span id="app-name-error" className="form-error">
            <AlertCircle size={13} aria-hidden="true" />
            <span>{errors.name}</span>
          </span>
        ) : (
          <span id="app-name-hint" className="form-hint">
            Unique identifier used for DNS, routes, and Kubernetes service naming.
          </span>
        )}
      </div>

      {/* Repository URL */}
      <div className="form-group">
        <label className="form-label" htmlFor="app-repository">
          <span>
            Git Repository URL <span className="required">*</span>
          </span>
        </label>
        <input
          id="app-repository"
          name="repository_url"
          type="text"
          className="form-input"
          style={{
            borderColor: touched.repository_url && errors.repository_url ? 'var(--fc-status-danger)' : undefined,
          }}
          placeholder="https://github.com/organization/repo.git"
          value={formData.repository_url}
          onChange={handleChange}
          onBlur={() => handleBlur('repository_url')}
          disabled={isLoading}
          required
          aria-invalid={Boolean(touched.repository_url && errors.repository_url)}
          aria-describedby={touched.repository_url && errors.repository_url ? 'app-repo-error' : 'app-repo-hint'}
        />
        {touched.repository_url && errors.repository_url ? (
          <span id="app-repo-error" className="form-error">
            <AlertCircle size={13} aria-hidden="true" />
            <span>{errors.repository_url}</span>
          </span>
        ) : (
          <span id="app-repo-hint" className="form-hint">
            HTTPS or SSH Git clone URL containing the application source.
          </span>
        )}
      </div>

      {/* Target Branch and Container Port */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--fc-space-4)' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="app-branch">
            Target Branch
          </label>
          <input
            id="app-branch"
            name="branch"
            type="text"
            className="form-input"
            placeholder="main"
            value={formData.branch}
            onChange={handleChange}
            disabled={isLoading}
          />
          <span className="form-hint">Default branch for deployments.</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="app-port">
            <span>
              Container Port <span className="required">*</span>
            </span>
          </label>
          <input
            id="app-port"
            name="port"
            type="number"
            className="form-input"
            style={{
              borderColor: touched.port && errors.port ? 'var(--fc-status-danger)' : undefined,
            }}
            placeholder="8000"
            value={formData.port}
            onChange={handleChange}
            onBlur={() => handleBlur('port')}
            disabled={isLoading}
            required
            aria-invalid={Boolean(touched.port && errors.port)}
            aria-describedby={touched.port && errors.port ? 'app-port-error' : undefined}
          />
          {touched.port && errors.port ? (
            <span id="app-port-error" className="form-error">
              <AlertCircle size={13} aria-hidden="true" />
              <span>{errors.port}</span>
            </span>
          ) : (
            <span className="form-hint">TCP port exposed by the container.</span>
          )}
        </div>
      </div>

      {/* Runtime Platform */}
      <div className="form-group">
        <label className="form-label" htmlFor="app-runtime">
          Runtime Platform
        </label>
        <select
          id="app-runtime"
          name="runtime"
          className="form-select"
          value={formData.runtime}
          onChange={handleChange}
          disabled={isLoading}
        >
          {RUNTIME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="form-hint">Specifies how ForgeCloud packages and builds the container image.</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--fc-space-3)', marginTop: 'var(--fc-space-6)' }}>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          loadingText="Saving..."
          disabled={!isFormValid || isLoading}
        >
          {isEdit ? 'Update Application' : 'Register Application'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
