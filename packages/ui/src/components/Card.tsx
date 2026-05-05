import * as React from 'react';
import { cn } from '../lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

/**
 * Surface card for content blocks and panels.
 */
export function Card({ className, hover = false, ...props }: CardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'rounded-card border border-border bg-surface shadow-card transition-all duration-200',
        hover && 'hover:-translate-y-0.5 hover:shadow-card-hover',
        className,
      )}
      {...props}
    />
  );
}
