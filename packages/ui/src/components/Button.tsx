import * as React from 'react';
import { cn } from '../lib/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'ai-gradient';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

/**
 * Primary action button for the SkillGap UI library.
 */
export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps): React.JSX.Element {
  const base =
    'inline-flex items-center justify-center rounded-card font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50';
  const variants = {
    primary: 'bg-primary text-white shadow-card hover:bg-primary-dark hover:shadow-card-hover',
    secondary: 'bg-white text-text-primary border border-border shadow-card hover:shadow-card-hover',
    ghost: 'bg-transparent text-text-primary hover:bg-primary-light',
    danger: 'bg-error text-white shadow-card hover:shadow-card-hover',
    'ai-gradient': 'bg-gradient-to-r from-ai-purple to-ai-cyan text-white shadow-card hover:shadow-card-hover',
  };
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {children}
    </button>
  );
}
