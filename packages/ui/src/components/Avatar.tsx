import * as React from 'react';
import { cn } from '../lib/cn';

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Avatar with image fallback initials when no image is available.
 */
export function Avatar({ name, size = 'md', className, alt, ...props }: AvatarProps): React.JSX.Element {
  const [hasImage, setHasImage] = React.useState(Boolean(props.src));
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  if (hasImage && props.src) {
    return (
      <img
        {...props}
        alt={alt ?? name}
        className={cn('rounded-full object-cover', sizes[size], className)}
        onError={() => setHasImage(false)}
      />
    );
  }

  return (
    <div className={cn('inline-flex items-center justify-center rounded-full bg-primary-light font-semibold text-primary-dark', sizes[size], className)} aria-label={name}>
      {initials || 'U'}
    </div>
  );
}
