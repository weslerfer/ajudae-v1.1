// Exposes same values as motion.ts but structured for direct Framer Motion consumption
export const easing = {
  // Framer motion easing arrays
  easeOutExpo: [0.16, 1, 0.3, 1],
  easeOutQuart: [0.25, 1, 0.5, 1],
  easeOutBack: [0.34, 1.56, 0.64, 1],
  easeInOutCirc: [0.85, 0, 0.15, 1],
  elastic: [0.68, -0.55, 0.26, 1.55],
  spring: { type: "spring", stiffness: 300, damping: 24 },
  springBouncy: { type: "spring", stiffness: 400, damping: 10 },
};
