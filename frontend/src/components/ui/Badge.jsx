import React from 'react';

/**
 * Reusable Badge Primitive
 * Semantic status and categorization tags.
 */
export default function Badge({
  children,
  variant,
  status,
  pulse = false,
  className = '',
  ...props
}) {
  const rawStatus = (variant || status || children || 'neutral').toString().toLowerCase();

  let resolvedVariant = 'badge-neutral';
  let shouldPulse = pulse;

  if (['running', 'healthy', 'success', 'provisioned', 'active', 'online'].includes(rawStatus)) {
    resolvedVariant = 'badge-running';
  } else if (['failed', 'error', 'danger', 'destroyed', 'crashed'].includes(rawStatus)) {
    resolvedVariant = 'badge-failed';
  } else if (['pending', 'building', 'deploying', 'warning', 'queued'].includes(rawStatus)) {
    resolvedVariant = 'badge-deploying';
    shouldPulse = pulse !== false; // Auto-pulse deploying/building unless disabled
  } else if (['rolled_back', 'rollback', 'orange'].includes(rawStatus)) {
    resolvedVariant = 'badge-rolled_back';
  } else if (['info', 'phase', 'scheduled'].includes(rawStatus)) {
    resolvedVariant = 'badge-info';
  }

  const content = children || status || variant;

  return (
    <span className={`badge ${resolvedVariant} ${className}`.trim()} {...props}>
      <span className={`badge-dot ${shouldPulse ? 'pulse' : ''}`} aria-hidden="true" />
      <span>{content}</span>
    </span>
  );
}
