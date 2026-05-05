import * as React from 'react';
import { cn } from '../lib/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'ai' | 'neutral';
}

/**
 * Status badge used across job, application, and notification screens.
 */
export function Badge({ className, variant = 'neutral', ...props }: BadgeProps): React.JSX.Element {
  const variants = {
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    info: 'bg-primary-light text-primary-dark',
    ai: 'bg-gradient-to-r from-ai-purple to-ai-cyan text-white',
    neutral: 'bg-border text-text-secondary',
  };

  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', variants[variant], className)} {...props} />;
}
