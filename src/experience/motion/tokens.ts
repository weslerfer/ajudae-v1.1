/**
 * Motion Tokens globais do AJUDAAE.
 * Nenhuma View ou Componente pode utilizar tempos hardcoded.
 */

// Durações oficiais em segundos (Framer Motion utiliza segundos)
export const duration = {
  instant: 0.1,
  fast: 0.25,
  normal: 0.4,
  slow: 0.8,
  ultraSlow: 1.5,
};

// Curvas (Easings) oficiais
export const easings = {
  easeOutExpo: [0.16, 1, 0.3, 1] as any,
  easeOutCirc: [0.075, 0.82, 0.165, 1] as any,
  easeOutQuint: [0.22, 1, 0.36, 1] as any,
  easeInOut: [0.65, 0, 0.35, 1] as any,
  linear: [0, 0, 1, 1] as any,
};

// Configurações Spring oficiais
export const springs = {
  springSoft: {
    type: "spring" as any,
    bounce: 0.2,
    duration: duration.normal,
  },
  springHeavy: {
    type: "spring" as any,
    bounce: 0.4,
    duration: duration.slow,
  },
  springElastic: {
    type: "spring" as any,
    stiffness: 400,
    damping: 15,
  }
};

export const motionTokens = {
  duration,
  easings,
  springs,
};
