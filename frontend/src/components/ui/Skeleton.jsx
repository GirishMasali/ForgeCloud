import React from 'react';

/**
 * Reusable Skeleton Loader Primitive
 * Provides shimmer loading states matching actual content shape.
 */
export function Skeleton({
  width,
  height,
  borderRadius,
  className = '',
  variant = 'rect', // 'text', 'circle', 'rect'
  style = {},
  ...props
}) {
  const variantClass = variant === 'circle'
    ? 'skeleton-circle'
    : variant === 'text'
    ? 'skeleton-text'
    : 'skeleton-rect';

  const inlineStyles = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1rem' : undefined),
    borderRadius: borderRadius || undefined,
    ...style,
  };

  return (
    <div
      className={`skeleton ${variantClass} ${className}`.trim()}
      style={inlineStyles}
      aria-hidden="true"
      {...props}
    />
  );
}

/**
 * Skeleton Placeholder for Metric KPI Cards
 */
export function SkeletonStatGrid({ count = 4 }) {
  return (
    <div className="metric-grid" aria-label="Loading platform metrics" role="status">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="metric-card" style={{ gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width="45%" height="12px" />
            <Skeleton width="20px" height="20px" variant="circle" />
          </div>
          <Skeleton width="60%" height="28px" />
          <Skeleton width="75%" height="12px" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton Placeholder for Data Table Rows
 */
export function SkeletonTableRows({ rows = 5, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} aria-hidden="true">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c}>
              <Skeleton
                width={c === 0 ? '60%' : c === cols - 1 ? '40px' : '75%'}
                height="14px"
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/**
 * Skeleton Placeholder for Generic Card Content
 */
export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`card ${className}`.trim()} aria-hidden="true">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <Skeleton width="40%" height="20px" />
        <Skeleton width="60px" height="18px" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} width={`${90 - i * 15}%`} height="14px" />
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
