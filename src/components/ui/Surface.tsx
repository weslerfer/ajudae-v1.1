import React from 'react';
import { cn } from '../../utils/cn';

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  depth?: 0 | 1 | 2 | 3 | 4 | 5;
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  interactive?: boolean;
  className?: string;
  as?: React.ElementType;
}

export const Surface: React.FC<SurfaceProps> = ({
  depth = 1,
  radius = '2xl',
  interactive = false,
  className,
  as: Component = 'div',
  children,
  ...props
}) => {
  const depthStyles = {
    0: 'bg-background',
    1: 'bg-[#090B12]',
    2: 'bg-[#0F172A] shadow-sm border border-white/5',
    3: 'bg-[#0F172A] shadow-md border border-white/10',
    4: 'bg-[#151E32] shadow-lg border border-white/15',
    5: 'bg-[#1E293B] shadow-xl border border-white/20',
  };

  const radiusStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  };

  const interactiveStyles = interactive 
    ? 'transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/20 hover:shadow-lg hover:shadow-black/50 cursor-pointer'
    : '';

  return (
    <Component
      className={cn(
        depthStyles[depth],
        radiusStyles[radius],
        interactiveStyles,
        'relative overflow-hidden', // Ensures inner glows/borders don't bleed
        className
      )}
      {...props}
    >
      {/* Subtle top highlight for premium feel (simulating light source) */}
      {depth > 1 && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      )}
      {children}
    </Component>
  );
};
