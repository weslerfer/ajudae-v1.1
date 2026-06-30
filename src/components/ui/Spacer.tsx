import React from 'react';
import { cn } from '../../utils/cn';

interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  horizontal?: boolean;
  className?: string;
}

export const Spacer: React.FC<SpacerProps> = ({
  size,
  horizontal = false,
  className,
  ...props
}) => {
  const sizes = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
    '4xl': 96,
    '5xl': 128,
  };

  const value = sizes[size];

  return (
    <div
      className={cn('flex-none pointer-events-none', className)}
      style={{
        width: horizontal ? value : undefined,
        height: !horizontal ? value : undefined,
        minWidth: horizontal ? value : undefined,
        minHeight: !horizontal ? value : undefined,
      }}
      aria-hidden="true"
      {...props}
    />
  );
};
