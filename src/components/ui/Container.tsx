import React from 'react';
import { cn } from '../../utils/cn';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'fluid';
  padding?: boolean;
  className?: string;
  as?: React.ElementType;
}

export const Container: React.FC<ContainerProps> = ({
  size = 'xl',
  padding = true,
  className,
  as: Component = 'div',
  children,
  ...props
}) => {
  const sizeStyles = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-screen-2xl',
    fluid: 'w-full',
  };

  return (
    <Component
      className={cn(
        'mx-auto w-full',
        sizeStyles[size],
        padding && 'px-4 sm:px-6 md:px-8',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
