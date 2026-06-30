# Experience Hooks

Hooks criados para injetar microinterações.

- `useHoverGlow`: Retorna um Ref. Aplica `--x` e `--y` no movimento do mouse. O componente pai usa um radial gradient lendo essas variáveis para brilhar no cursor.
- `useMagnetic`: Atrai o componente em direção ao cursor como um ímã. Útil para botões primários.
- `useReducedMotion`: Wrapper nativo para rastrear se o usuário tem aversão a animações no SO.
- `usePageTransition`: Retorna qual é a view em foco e orquestra o pequeno delay antes da saída do router.
