import * as React from 'react';
import { cn } from '../lib/cn';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
}

/**
 * Accessible select input with label, helper text, and error state.
 */
export function Select({ label, error, helperText, options, id, className, children, ...props }: SelectProps): React.JSX.Element {
  const selectId = id ?? React.useId();

  return (
    <label className="block space-y-1.5" htmlFor={selectId}>
      {label ? <span className="text-sm font-medium text-text-primary">{label}</span> : null}
      <select
        id={selectId}
        className={cn(
          'w-full rounded-card border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-light',
          error && 'border-error focus:border-error focus:ring-error/20',
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      {error ? <p id={`${selectId}-error`} className="text-sm text-error">{error}</p> : null}
      {helperText && !error ? <p id={`${selectId}-helper`} className="text-sm text-text-secondary">{helperText}</p> : null}
    </label>
  );
}
