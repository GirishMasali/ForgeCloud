import React from 'react';
import UIEmptyState from './ui/EmptyState';

/**
 * Backward-compatible EmptyState wrapper delegating to UI EmptyState primitive.
 */
export default function EmptyState(props) {
  return <UIEmptyState {...props} />;
}
