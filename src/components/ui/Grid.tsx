import React from 'react';
import { cn } from '../../utils/cn';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  as?: React.ElementType;
}

export const Grid: React.FC<GridProps> = ({
  cols = 1,
  gap = 'md',
  className,
  as: Component = 'div',
  children,
  ...props
}) => {
  const colsStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    12: 'grid-cols-4 md:grid-cols-8 lg:grid-cols-12',
  };

  const gapStyles = {
    none: 'gap-0',
    xs: 'gap-1',   // 4px
    sm: 'gap-2',   // 8px
    md: 'gap-4',   // 16px
    lg: 'gap-6',   // 24px
    xl: 'gap-8',   // 32px
    '2xl': 'gap-12', // 48px
    '3xl': 'gap-16', // 64px
  };

  return (
    <Component
      className={cn(
        'grid',
        colsStyles[cols],
        gapStyles[gap],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
