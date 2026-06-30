export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    display: 'Outfit, system-ui, sans-serif',
  },
  fontSize: {
    xs: 'text-xs', // 0.75rem
    sm: 'text-sm', // 0.875rem
    base: 'text-base', // 1rem
    lg: 'text-lg', // 1.125rem
    xl: 'text-xl', // 1.25rem
    '2xl': 'text-2xl', // 1.5rem
    '3xl': 'text-3xl', // 1.875rem
    '4xl': 'text-4xl', // 2.25rem
    '5xl': 'text-5xl', // 3rem
    '6xl': 'text-6xl', // 3.75rem
  },
  fontWeight: {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  },
  lineHeight: {
    none: 'leading-none',
    tight: 'leading-tight',
    snug: 'leading-snug',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  },
  letterSpacing: {
    tighter: 'tracking-tighter',
    tight: 'tracking-tight',
    normal: 'tracking-normal',
    wide: 'tracking-wide',
    wider: 'tracking-wider',
    widest: 'tracking-widest',
  },
  // Specific Use Cases
  display: 'font-display font-bold tracking-tight text-text-primary',
  heading: 'font-display font-semibold tracking-tight text-text-primary',
  title: 'font-sans font-semibold text-text-primary',
  subtitle: 'font-sans font-medium text-text-secondary',
  body: 'font-sans font-normal text-text-secondary leading-relaxed',
  caption: 'font-sans font-normal text-text-muted text-xs uppercase tracking-wider',
  overline: 'font-mono font-medium text-neon-blue text-xs uppercase tracking-widest',
  financial: 'font-mono font-bold tracking-tighter',
};
