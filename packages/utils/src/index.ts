export function formatDate(value: string | number | Date): string {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function percentage(value: number): string {
  return `${Math.round(clamp(value, 0, 100))}%`;
}
