import * as React from 'react';
import { cn } from '../lib/cn';

export interface SkillTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  severity?: 'critical' | 'partial' | 'match';
}

/**
 * Pill tag for skills with severity-aware color treatment.
 */
export function SkillTag({ className, severity = 'match', ...props }: SkillTagProps): React.JSX.Element {
  const variants = {
    critical: 'bg-error/10 text-error',
    partial: 'bg-warning/10 text-warning',
    match: 'bg-success/10 text-success',
  };

  return <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-sm font-medium', variants[severity], className)} {...props} />;
}
