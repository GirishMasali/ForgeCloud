import React from 'react';
import Badge from './ui/Badge';

/**
 * Backward-compatible StatusBadge wrapper delegating to UI Badge primitive.
 */
export default function StatusBadge({ status = 'UNKNOWN', ...props }) {
  return <Badge status={status} {...props} />;
}
