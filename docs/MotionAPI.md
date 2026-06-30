# Motion API

Sempre importe de `src/experience/motion/tokens` ou `src/experience/presets/presets.ts`.

## Tokens
- `duration`: `instant` (100ms), `fast` (250ms), `normal` (400ms), `slow` (800ms)
- `springs`: `springSoft`, `springHeavy`

## Presets Prontos
Para usar no Framer Motion (`motion.div`):
```tsx
import { fadeUp } from '../../experience/presets/presets';

<motion.div variants={fadeUp} initial="hidden" animate="visible" exit="exit" />
```
Lista de presets: `fadeIn`, `fadeUp`, `fadeDown`, `slideLeft`, `slideRight`, `staggerChildren`, `pageEnter`, `modalEnter`, `toastEnter`.
