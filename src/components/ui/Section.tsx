import React from 'react';
import { cn } from '../../utils/cn';
import { Container } from './Container';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'fluid';
  noContainer?: boolean;
  className?: string;
  containerClassName?: string;
}

export const Section: React.FC<SectionProps> = ({
  spacing = 'none',
  containerSize = 'xl',
  noContainer = false,
  className,
  containerClassName,
  children,
  ...props
}) => {
  const spacingStyles = {
    none: 'py-0',
    sm: 'py-8 md:py-12',
    md: 'py-12 md:py-16',
    lg: 'py-16 md:py-24',
    xl: 'py-24 md:py-32',
  };

  const content = noContainer ? (
    children
  ) : (
    <Container size={containerSize} className={containerClassName}>
      {children}
    </Container>
  );

  return (
    <section
      className={cn(spacingStyles[spacing], 'relative', className)}
      {...props}
    >
      {content}
    </section>
  );
};
