import { motionTokens } from '../motion/tokens';
import { TargetAndTransition, Variant } from 'motion/react';

/**
 * Presets de Animação do AJUDAAE.
 * Estes presets devem ser consumidos via atributos 'variants', 'initial', 'animate', 'exit'.
 */

// 1. Fades
export const fadeIn: Record<string, Variant> = {
  hidden: { opacity: 0, filter: 'blur(4px)' },
  visible: { 
    opacity: 1, 
    filter: 'blur(0px)',
    transition: { duration: motionTokens.duration.normal, ease: motionTokens.easings.easeOutExpo }
  },
  exit: { 
    opacity: 0, 
    filter: 'blur(4px)',
    transition: { duration: motionTokens.duration.fast, ease: motionTokens.easings.easeOutExpo }
  }
};

// 2. Slides com Fade (Geralmente para entradas de páginas e blocos grandes)
export const fadeUp: Record<string, Variant> = {
  hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { ...motionTokens.springs.springSoft }
  },
  exit: { 
    opacity: 0, 
    y: 10, 
    filter: 'blur(2px)',
    transition: { duration: motionTokens.duration.fast, ease: motionTokens.easings.easeOutExpo }
  }
};

export const fadeDown: Record<string, Variant> = {
  hidden: { opacity: 0, y: -30, filter: 'blur(4px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { ...motionTokens.springs.springSoft }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    filter: 'blur(2px)',
    transition: { duration: motionTokens.duration.fast, ease: motionTokens.easings.easeOutExpo }
  }
};

export const slideLeft: Record<string, Variant> = {
  hidden: { opacity: 0, x: 30, filter: 'blur(4px)' },
  visible: { 
    opacity: 1, 
    x: 0, 
    filter: 'blur(0px)',
    transition: { ...motionTokens.springs.springSoft }
  },
  exit: { 
    opacity: 0, 
    x: -10, 
    filter: 'blur(2px)',
    transition: { duration: motionTokens.duration.fast }
  }
};

export const slideRight: Record<string, Variant> = {
  hidden: { opacity: 0, x: -30, filter: 'blur(4px)' },
  visible: { 
    opacity: 1, 
    x: 0, 
    filter: 'blur(0px)',
    transition: { ...motionTokens.springs.springSoft }
  },
  exit: { 
    opacity: 0, 
    x: 10, 
    filter: 'blur(2px)',
    transition: { duration: motionTokens.duration.fast }
  }
};

// 3. Stagger (Orquestrador de lista)
export const staggerChildren = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

// 4. View / Page Transitions
export const pageEnter: Record<string, Variant> = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: motionTokens.duration.normal, ease: motionTokens.easings.easeOutExpo }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    transition: { duration: motionTokens.duration.fast, ease: motionTokens.easings.easeOutQuint }
  }
};

// 5. Modals / Overlays
export const modalEnter: Record<string, Variant> = {
  hidden: { opacity: 0, scale: 0.95, y: 10, filter: 'blur(4px)' },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { ...motionTokens.springs.springSoft }
  },
  exit: { 
    opacity: 0, 
    scale: 0.98, 
    y: -5, 
    filter: 'blur(2px)',
    transition: { duration: motionTokens.duration.fast, ease: motionTokens.easings.easeOutExpo }
  }
};

// 6. Toasts
export const toastEnter: Record<string, Variant> = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { ...motionTokens.springs.springSoft }
  },
  exit: { 
    opacity: 0, 
    y: 10, 
    scale: 0.95, 
    transition: { duration: motionTokens.duration.fast }
  }
};
