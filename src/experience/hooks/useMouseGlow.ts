import { useEffect, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Cria um brilho radial que segue o cursor dentro do elemento.
 */
export const useMouseGlow = (glowColor: string = 'rgba(255,255,255,0.05)') => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      element.style.setProperty('--mouse-x', `${x}px`);
      element.style.setProperty('--mouse-y', `${y}px`);
      
      // Inject CSS Variable for a standard background radial gradient
      element.style.background = `radial-gradient(circle at var(--mouse-x) var(--mouse-y), ${glowColor} 0%, transparent 80%)`;
    };

    const handleMouseLeave = () => {
      element.style.background = 'transparent';
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [glowColor, prefersReducedMotion]);

  return ref;
};
