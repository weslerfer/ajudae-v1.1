# Providers Architectures

## ExperienceProvider
O provedor raiz que orquestra tudo. Ele embrulha toda a aplicação no App.tsx.

## OfflineProvider
Rastreia ativamente o `navigator.onLine` e a API `NetworkInformation`.
Exposição: `useOffline()`.
Estados: `online`, `offline`, `slow`.

## FeedbackProvider
Substitui chamadas caóticas a Toasts por um `executeAction`.
```tsx
const { executeAction } = useFeedback();
executeAction(async () => api.post(...), "Salvo com sucesso", "Erro ao salvar");
```
Pausa interações duplas automaticamente.

## CommandPaletteProvider
Rastreia a janela global (CTRL+K). Registre comandos das views locais nele via `useCommandPalette()`.
