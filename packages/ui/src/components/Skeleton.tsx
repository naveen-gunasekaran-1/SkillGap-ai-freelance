import * as React from 'react';
import { cn } from '../lib/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: 'text' | 'card' | 'avatar' | 'bar';
}

/**
 * Shimmer placeholder used during async loading states.
 */
export function Skeleton({ className, shape = 'card', ...props }: SkeletonProps): React.JSX.Element {
  const shapes = {
    text: 'h-4 w-full rounded-md',
    card: 'h-24 w-full rounded-card',
    avatar: 'h-10 w-10 rounded-full',
    bar: 'h-2 w-full rounded-full',
  };

  return <div className={cn('animate-pulse bg-border/70', shapes[shape], className)} {...props} />;
}
