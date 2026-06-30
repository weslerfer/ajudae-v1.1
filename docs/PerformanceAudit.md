# RC1.9 — PERFORMANCE AUDIT

## Metodologia
Inspeção estática da arquitetura de re-renderização do React (v18+), Bundle size estimation (Vite/Rollup) e gargalos de animação (Framer Motion / CSS transitions).

## Auditoria

### 1. Motion e GPU (Score: 9/10)
- Efeitos visuais como Blur e Glow (`bg-emerald-500/10 blur-[120px]`) foram envelopados em `pointer-events-none transform` absolutos, não provocando Reflow ou Repaint constantes. 
- Transições de `fadeUp` dependem de `transform` e `opacity`, que são offloaded para GPU perfeitamente a 60 FPS.

### 2. Re-renderizações (React State) (Score: 7/10)
- **Problema Crítico:** `<Dashboard />` e `<AdminSaques />` reconstroem listas pesadas e invocam a API diretamente dentro de hooks (`useEffect`) sem cache layer estrito (como SWR ou React Query). 
- `<AdminQueue />` lida com `Set<string>` no estado para seleção de massa. Atualizações no Set clonado provocam re-renderização total da tabela de filas.
- Faltam abstrações de `React.memo` nos cards filhos (ex: `<LinhaFila />`). Em filas com 500 saques pendentes, o clique num checkbox pode travar a main thread do navegador.

### 3. Code Splitting (Score: 6/10)
- O `App.tsx` atual importa todas as Views sincronamente (ex: `import { AdminStats } from './views/AdminStats'`). 
- Isso derruba o Lighthouse inicial. É compulsório implementar `React.lazy` e `<Suspense>` no roteamento do AppShell.

## Diagnóstico Geral
- **Nota Global Performance:** 7.3 / 10
- Necessário inserir *Lazy Loading* nas rotas e *Memoization* estrita nas listagens pesadas de governança administrativa.
