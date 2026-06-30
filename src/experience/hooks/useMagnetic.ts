import { useEffect, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

export const useMagnetic = (
  intensity: number = 0.5,
  spring: boolean = true
) => {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion) return;

    let hoverTarget: HTMLElement | null = null;
    let isHovered = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovered) return;
      
      const { clientX, clientY } = e;
      const { height, width, left, top } = element.getBoundingClientRect();
      const middleX = clientX - (left + width / 2);
      const middleY = clientY - (top + height / 2);

      element.style.transform = `translate(${middleX * intensity}px, ${middleY * intensity}px)`;
    };

    const handleMouseEnter = () => {
      isHovered = true;
      if (spring) {
        element.style.transition = 'transform 0.1s ease-out';
      }
    };

    const handleMouseLeave = () => {
      isHovered = false;
      element.style.transform = 'translate(0px, 0px)';
      if (spring) {
        element.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      }
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [intensity, spring, prefersReducedMotion]);

  return ref;
};
