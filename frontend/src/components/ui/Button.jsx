import React from 'react';

/**
 * Reusable Button Primitive
 * Variants: primary, secondary, destructive, ghost
 * Sizes: sm, md, lg, icon
 */
export default function Button({
  children,
  variant = 'secondary',
  size = 'md',
  type = 'button',
  isLoading = false,
  loadingText,
  disabled = false,
  className = '',
  icon: Icon,
  iconRight: IconRight,
  onClick,
  ...props
}) {
  const variantClass = variant === 'destructive' || variant === 'danger'
    ? 'btn-destructive'
    : `btn-${variant}`;

  const sizeClass = size === 'icon' ? 'btn-icon' : `btn-${size}`;
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="btn-spinner" aria-hidden="true" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 14 : 16} aria-hidden="true" />}
          {children}
          {IconRight && <IconRight size={size === 'sm' ? 14 : 16} aria-hidden="true" />}
        </>
      )}
    </button>
  );
}
