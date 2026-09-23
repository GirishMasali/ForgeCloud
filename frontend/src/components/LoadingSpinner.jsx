import React from 'react';

export default function LoadingSpinner({ message = 'Loading...', size = 'md' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        gap: '1rem',
      }}
    >
      <div className={`spinner ${size === 'lg' ? 'spinner-lg' : ''}`} />
      {message && (
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {message}
        </span>
      )}
    </div>
  );
}
