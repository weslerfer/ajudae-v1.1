import React from 'react';
import { cn } from '../../utils/cn';

interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: 'subtle' | 'base' | 'premium';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  interactive?: boolean;
  className?: string;
  as?: React.ElementType;
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  intensity = 'base',
  radius = '2xl',
  interactive = false,
  className,
  as: Component = 'div',
  children,
  ...props
}) => {
  const intensityStyles = {
    subtle: 'bg-white/5 backdrop-blur-sm border border-transparent',
    base: 'bg-white/5 backdrop-blur-md border border-white/10 shadow-xl',
    premium: 'bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_20px_40px_rgba(0,0,0,0.4)]',
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
    ? 'transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] cursor-pointer'
    : '';

  return (
    <Component
      className={cn(
        intensityStyles[intensity],
        radiusStyles[radius],
        interactiveStyles,
        'relative overflow-hidden',
        className
      )}
      {...props}
    >
      {/* Light sweep effect on hover if interactive */}
      {interactive && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[150%] hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none" />
      )}
      {children}
    </Component>
  );
};
