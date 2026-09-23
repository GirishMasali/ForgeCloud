import React, { useEffect, useRef, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from './Button';

/**
 * Reusable Accessible Modal Primitive
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = '520px',
  className = '',
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element to restore focus on close
    const previousActiveElement = document.activeElement;

    // Handle Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    // Auto-focus modal dialog or first interactive element
    if (modalRef.current) {
      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement && previousActiveElement.focus) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={`modal-dialog ${className}`.trim()}
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-desc' : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            {title && <h3 id="modal-title" className="modal-title">{title}</h3>}
            {description && <p id="modal-desc" className="card-description">{description}</p>}
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon btn-sm"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

/**
 * Standard Confirmation Modal
 * Supports typed confirmation string (e.g. typing application name to delete).
 */
export function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
  confirmTypedText, // If provided, user must type this exact text to enable confirm
  confirmInputLabel,
}) {
  const [typedValue, setTypedValue] = useState('');

  // Reset typed value whenever modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTypedValue('');
    }
  }, [isOpen]);

  const isConfirmDisabled = isLoading || (
    confirmTypedText ? typedValue.trim() !== confirmTypedText.trim() : false
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onCancel}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isDestructive && (
            <AlertTriangle size={18} color="var(--fc-status-danger)" aria-hidden="true" />
          )}
          <span>{title}</span>
        </div>
      }
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isConfirmDisabled}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ margin: 0, color: 'var(--fc-text-secondary)', lineHeight: 1.5 }}>
          {message}
        </p>

        {confirmTypedText && (
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="confirm-typed-input">
              {confirmInputLabel || (
                <span>
                  Please type <strong style={{ color: 'var(--fc-text-primary)' }}>{confirmTypedText}</strong> to confirm:
                </span>
              )}
            </label>
            <input
              id="confirm-typed-input"
              type="text"
              className="form-input"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              placeholder={confirmTypedText}
              autoFocus
              disabled={isLoading}
              autoComplete="off"
            />
          </div>
        )}
      </div>
    </Modal>
  );
}

export default Modal;
