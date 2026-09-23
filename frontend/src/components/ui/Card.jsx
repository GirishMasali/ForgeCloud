import React from 'react';

/**
 * Reusable Card Primitive and Compound Subcomponents
 */
export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div className={`card ${hover ? 'card-hover' : ''} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`card-header ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', as: Component = 'h3', ...props }) {
  return (
    <Component className={`card-title ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`card-description ${className}`.trim()} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`card-footer ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

/**
 * Standardized Metric / KPI Card
 */
export function MetricCard({
  label,
  value,
  icon: Icon,
  subtext,
  badge,
  className = '',
  ...props
}) {
  return (
    <div className={`metric-card ${className}`.trim()} {...props}>
      <div className="metric-card-top">
        <span className="metric-card-label">{label}</span>
        {badge || (Icon && (
          <div className="metric-card-icon">
            <Icon size={18} aria-hidden="true" />
          </div>
        ))}
      </div>
      <div className="metric-card-value">{value}</div>
      {subtext && <div className="metric-card-subtext">{subtext}</div>}
    </div>
  );
}

export default Card;
