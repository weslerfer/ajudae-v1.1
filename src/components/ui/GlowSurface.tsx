import React, { useState } from 'react';
import { cn } from '../../utils/cn';

interface GlowSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: 'neon-blue' | 'neon-cyan' | 'neon-purple' | 'neon-green' | 'white';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  interactive?: boolean;
  className?: string;
  as?: React.ElementType;
}

export const GlowSurface: React.FC<GlowSurfaceProps> = ({
  glowColor = 'neon-blue',
  radius = '2xl',
  interactive = true,
  className,
  as: Component = 'div',
  children,
  ...props
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  const glowColorMap = {
    'neon-blue': 'rgba(0,240,255,0.4)',
    'neon-cyan': 'rgba(0,255,255,0.4)',
    'neon-purple': 'rgba(176,38,255,0.4)',
    'neon-green': 'rgba(0,255,157,0.4)',
    'white': 'rgba(255,255,255,0.3)',
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

  return (
    <Component
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative bg-[#0F172A] border border-white/5 transition-all duration-300',
        radiusStyles[radius],
        interactive && 'cursor-pointer hover:border-white/10 hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {/* Background radial gradient following mouse */}
      {interactive && (
        <div 
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColorMap[glowColor]}, transparent 40%)`
          }}
        />
      )}
      
      {/* Content wrapper to stay above glow */}
      <div className={cn("relative z-10 w-full h-full", radiusStyles[radius])}>
        {children}
      </div>
    </Component>
  );
};
