# RC1.6 — LOADING AUDIT

## Metodologia
Validação da remoção completa de "Spinners legados", uso de Skeletons, Suspend, Overlays progressivos e Shimmers, em conformidade com a Experience Engine.

## Auditoria

### 1. Initial Load e Suspense (Score: 8/10)
- O `App.tsx` lida com o boot via estado genérico (`<div className="animate-spin" />`). 
- **Problema Crítico:** Isso viola a diretriz "Nenhum Spinner legado poderá permanecer". Devemos substituir por uma tela de SplashScreen corporativa (Logotipo + Pulse ou progress-bar minimalista).

### 2. View Loaders (Score: 7.5/10)
- Em `AdminStats`, o carregamento renderiza um ícone `RefreshCw` rodando no meio da tela. Isso quebra a linguagem de UX avançada exigida.
- **Solução (Plano):** Refatorar para utilizar `<Grid cols={...}><SkeletonCard /></Grid>` simulando o layout que está por vir (Skeleton screens).

### 3. Action Loaders (Toasters) (Score: 10/10)
- Durante a execução de promises pelo `FeedbackProvider`, toda a UI entra em `isGlobalLoading`, e botões recebem estado disabled ("Processando..."). Excelente arquitetura preventiva.

## Diagnóstico Geral
- **Nota Global Loading:** 8.5 / 10
- As infraestruturas globais de ação estão perfeitas. O carregamento estático inicial das Views (Fetching) peca ao usar Spinners isolados, exigindo padronização para Skeletons visuais.
