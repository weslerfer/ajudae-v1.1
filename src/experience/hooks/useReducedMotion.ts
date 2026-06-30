import { useReducedMotion as useFramerReducedMotion } from 'motion/react';

/**
 * Hook global para respeitar a preferência de acessibilidade do usuário.
 * Pausa animações não essenciais se o sistema pedir.
 */
export const useReducedMotion = () => {
  const shouldReduceMotion = useFramerReducedMotion();
  return shouldReduceMotion ?? false;
};
