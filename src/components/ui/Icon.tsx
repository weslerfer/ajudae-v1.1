import React from 'react';
import { Icon as IconifyIcon } from '@iconify/react';
import { cn } from '../../utils/cn';

interface IconProps extends Omit<React.ComponentProps<typeof IconifyIcon>, 'icon'> {
  name: string; // The Iconify id, e.g., 'solar:home-smile-linear'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  color?: 'default' | 'active' | 'muted' | 'white' | 'success' | 'danger' | 'warning' | 'neon-blue';
  className?: string;
  glow?: boolean;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color = 'default',
  className,
  glow = false,
  ...props
}) => {
  const sizeStyles = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
    '3xl': 'w-12 h-12',
  };

  const colorStyles = {
    default: 'text-slate-400',
    active: 'text-white',
    muted: 'text-slate-600',
    white: 'text-white',
    success: 'text-neon-green',
    danger: 'text-red-400',
    warning: 'text-amber-400',
    'neon-blue': 'text-neon-blue',
  };

  const glowStyles = glow ? {
    'neon-blue': 'drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]',
    success: 'drop-shadow-[0_0_8px_rgba(0,255,157,0.6)]',
    danger: 'drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]',
    white: 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]',
    default: 'drop-shadow-[0_0_8px_rgba(148,163,184,0.3)]',
    active: 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]',
    muted: '',
    warning: 'drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
  } : {};

  return (
    <div className={cn('inline-flex items-center justify-center shrink-0', className)}>
      <IconifyIcon 
        icon={name} 
        className={cn(
          sizeStyles[size], 
          colorStyles[color],
          glow && (glowStyles as any)[color]
        )} 
        {...props} 
      />
    </div>
  );
};
