# Experience Structure

A pasta `src/experience/` é o coração visual do aplicativo.

## Regras
1. **Zero animações hardcoded**: `duration: 0.3` é proibido nas Views. Use `motionTokens.duration.fast`.
2. **Separação estrita**: Se um componente brilha, o brilho não fica no componente, fica em um Hook ou HOC dentro de `src/experience/hooks/` ou `src/experience/effects/`.
3. **Motion Budget respeitado**: Excesso de animação diminui a performance. A Experience Engine consulta `useReducedMotion` para proteger a bateria de laptops.
