import * as React from 'react';

export interface ProgressBarProps {
  value: number;
  label?: string;
  showPercent?: boolean;
}

/**
 * Animated horizontal progress bar with optional label and percentage.
 */
export function ProgressBar({ value, label, showPercent = true }: ProgressBarProps): React.JSX.Element {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="space-y-2">
      {label ? <div className="flex items-center justify-between text-sm text-text-secondary"><span>{label}</span><span>{showPercent ? `${safeValue}%` : null}</span></div> : null}
      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}
