import React from 'react';
import { ConfirmModal as UIConfirmModal } from './ui/Modal';

/**
 * Backward-compatible ConfirmModal wrapper delegating to UI Modal primitive.
 */
export default function ConfirmModal(props) {
  return <UIConfirmModal {...props} />;
}
