import React from 'react';

/**
 * Reusable Table Primitive and Compound Subcomponents
 */
export function TableContainer({ children, className = '', ...props }) {
  return (
    <div className={`table-container ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function Table({ children, className = '', ...props }) {
  return (
    <table className={`data-table ${className}`.trim()} {...props}>
      {children}
    </table>
  );
}

export function TableHeader({ children, className = '', ...props }) {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '', ...props }) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = '', ...props }) {
  return (
    <tr className={className} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '', align = 'left', ...props }) {
  return (
    <th style={{ textAlign: align }} className={className} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '', align = 'left', ...props }) {
  return (
    <td style={{ textAlign: align }} className={className} {...props}>
      {children}
    </td>
  );
}

export default Table;
