import React from 'react';
import { FolderGit2 } from 'lucide-react';

/**
 * Reusable EmptyState Primitive
 */
export default function EmptyState({
  icon: Icon = FolderGit2,
  title = 'No Items Found',
  description = 'Get started by creating your first entry.',
  action,
  className = '',
  ...props
}) {
  return (
    <div className={`empty-state ${className}`.trim()} {...props}>
      <div className="empty-icon-wrapper" aria-hidden="true">
        <Icon size={24} />
      </div>
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-desc">{description}</p>}
      {action && <div style={{ marginTop: 'var(--fc-space-2)' }}>{action}</div>}
    </div>
  );
}
