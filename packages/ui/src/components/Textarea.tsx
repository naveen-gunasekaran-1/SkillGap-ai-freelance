import * as React from 'react';
import { cn } from '../lib/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Multiline text area with accessible label and error handling.
 */
export function Textarea({ label, error, helperText, id, className, ...props }: TextareaProps): React.JSX.Element {
  const textareaId = id ?? React.useId();

  return (
    <label className="block space-y-1.5" htmlFor={textareaId}>
      {label ? <span className="text-sm font-medium text-text-primary">{label}</span> : null}
      <textarea
        id={textareaId}
        className={cn(
          'min-h-28 w-full rounded-card border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-light',
          error && 'border-error focus:border-error focus:ring-error/20',
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
        {...props}
      />
      {error ? <p id={`${textareaId}-error`} className="text-sm text-error">{error}</p> : null}
      {helperText && !error ? <p id={`${textareaId}-helper`} className="text-sm text-text-secondary">{helperText}</p> : null}
    </label>
  );
}
