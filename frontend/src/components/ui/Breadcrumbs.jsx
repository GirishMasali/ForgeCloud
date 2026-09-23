import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Reusable Breadcrumbs Primitive
 * Can accept custom items or auto-derive breadcrumbs from route path.
 */
export default function Breadcrumbs({ items, className = '' }) {
  const location = useLocation();

  let breadcrumbItems = items;

  if (!breadcrumbItems) {
    const pathParts = location.pathname.split('/').filter(Boolean);
    breadcrumbItems = [
      { label: 'ForgeCloud', href: '/dashboard' },
      ...pathParts.map((part, index) => {
        const href = `/${pathParts.slice(0, index + 1).join('/')}`;
        // Clean display text (e.g., capitalize, replace hyphens)
        const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
        return { label, href };
      }),
    ];
  }

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={`header-breadcrumbs ${className}`.trim()}>
      <ol style={{ display: 'flex', alignItems: 'center', listStyle: 'none', margin: 0, padding: 0, gap: '0.4rem' }}>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li key={item.href || index} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              {index > 0 && (
                <ChevronRight size={13} className="breadcrumb-separator" aria-hidden="true" />
              )}
              {isLast ? (
                <span className="breadcrumb-current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.href} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
