import React from 'react';
import { cn } from '../../utils/cn';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'subtitle' | 'caption' | 'overline' | 'financial';
  color?: 'primary' | 'secondary' | 'muted' | 'neon-blue' | 'neon-cyan' | 'neon-purple' | 'neon-green' | 'danger' | 'success';
  align?: 'left' | 'center' | 'right';
  className?: string;
  as?: React.ElementType;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'primary',
  align = 'left',
  className,
  as,
  children,
  ...props
}) => {
  const variantStyles = {
    display: 'font-display font-bold text-5xl md:text-6xl lg:text-7xl tracking-tighter',
    h1: 'font-display font-bold text-4xl md:text-5xl tracking-tight',
    h2: 'font-display font-semibold text-3xl md:text-4xl tracking-tight',
    h3: 'font-display font-semibold text-2xl md:text-3xl tracking-tight',
    h4: 'font-sans font-semibold text-xl tracking-tight',
    h5: 'font-sans font-semibold text-lg tracking-tight',
    h6: 'font-sans font-medium text-base tracking-tight',
    subtitle: 'font-sans font-medium text-lg leading-relaxed',
    body: 'font-sans font-normal text-base leading-relaxed',
    caption: 'font-sans font-normal text-xs uppercase tracking-wider',
    overline: 'font-mono font-medium text-xs uppercase tracking-widest',
    financial: 'font-mono font-bold text-4xl tracking-tighter',
  };

  const colorStyles = {
    primary: 'text-white',
    secondary: 'text-slate-400',
    muted: 'text-slate-500',
    'neon-blue': 'text-neon-blue drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]',
    'neon-cyan': 'text-neon-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]',
    'neon-purple': 'text-neon-purple drop-shadow-[0_0_8px_rgba(176,38,255,0.5)]',
    'neon-green': 'text-neon-green drop-shadow-[0_0_8px_rgba(0,255,157,0.5)]',
    danger: 'text-red-400',
    success: 'text-emerald-400',
  };

  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const defaultTags = {
    display: 'h1',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    subtitle: 'p',
    body: 'p',
    caption: 'span',
    overline: 'span',
    financial: 'span',
  };

  const Component = as || defaultTags[variant] || 'p';

  return (
    <Component
      className={cn(
        variantStyles[variant],
        colorStyles[color],
        alignStyles[align],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
