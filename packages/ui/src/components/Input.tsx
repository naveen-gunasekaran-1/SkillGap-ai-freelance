import * as React from 'react';
import { cn } from '../lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

/**
 * Text input with label, helper text, icon support, and inline error state.
 */
export function Input({ label, error, helperText, icon, id, className, ...props }: InputProps): React.JSX.Element {
  const inputId = id ?? React.useId();

  return (
    <label className="block space-y-1.5" htmlFor={inputId}>
      {label ? <span className="text-sm font-medium text-text-primary">{label}</span> : null}
      <div className="relative">
        {icon ? <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-text-secondary">{icon}</span> : null}
        <input
          id={inputId}
          className={cn(
            'w-full rounded-card border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-light',
            icon && 'pl-10',
            error && 'border-error focus:border-error focus:ring-error/20',
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
      </div>
      {error ? <p id={`${inputId}-error`} className="text-sm text-error">{error}</p> : null}
      {helperText && !error ? <p id={`${inputId}-helper`} className="text-sm text-text-secondary">{helperText}</p> : null}
    </label>
  );
}
