import * as React from 'react';

export interface MatchScoreProps {
  value: number;
  size?: number;
}

/**
 * Circular match score indicator used on jobs and gap report screens.
 */
export function MatchScore({ value, size = 72 }: MatchScoreProps): React.JSX.Element {
  const safeValue = Math.max(0, Math.min(100, value));
  const color = safeValue < 40 ? '#EF4444' : safeValue <= 70 ? '#F59E0B' : '#10B981';
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="inline-flex items-center justify-center" aria-label={`Match score ${safeValue}%`}>
      <svg width={size} height={size} role="img" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="absolute text-sm font-semibold text-text-primary">{safeValue}%</span>
    </div>
  );
}
