import React from 'react';
import { cn } from '../../utils/cn';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  wrap?: boolean;
  className?: string;
  as?: React.ElementType;
}

export const Stack: React.FC<StackProps> = ({
  direction = 'col',
  align,
  justify,
  gap = 'md',
  wrap = false,
  className,
  as: Component = 'div',
  children,
  ...props
}) => {
  const gapStyles = {
    none: 'gap-0',
    xs: 'gap-1',   // 4px
    sm: 'gap-2',   // 8px
    md: 'gap-4',   // 16px
    lg: 'gap-6',   // 24px
    xl: 'gap-8',   // 32px
    '2xl': 'gap-12', // 48px
    '3xl': 'gap-16', // 64px
    '4xl': 'gap-24', // 96px
  };

  return (
    <Component
      className={cn(
        'flex',
        direction === 'row' ? 'flex-row' : 'flex-col',
        wrap ? 'flex-wrap' : 'flex-nowrap',
        align === 'start' && 'items-start',
        align === 'center' && 'items-center',
        align === 'end' && 'items-end',
        align === 'stretch' && 'items-stretch',
        align === 'baseline' && 'items-baseline',
        justify === 'start' && 'justify-start',
        justify === 'center' && 'justify-center',
        justify === 'end' && 'justify-end',
        justify === 'between' && 'justify-between',
        justify === 'around' && 'justify-around',
        justify === 'evenly' && 'justify-evenly',
        gapStyles[gap],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
