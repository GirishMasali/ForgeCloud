import React from 'react';
import { MetricCard as UIMetricCard } from './ui/Card';

/**
 * Backward-compatible MetricCard wrapper delegating to UI Card primitive.
 */
export default function MetricCard(props) {
  return <UIMetricCard {...props} />;
}
