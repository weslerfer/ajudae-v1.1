# RC1.8 — ACCESSIBILITY AUDIT

## Metodologia
Validação de marcação ARIA, Tab Order, Focus rings, e contraste institucional.

## Auditoria

### 1. Contrast & Visão Visual (Score: 9/10)
- A paleta Slate combinada com textos `white` e `slate-400` oferecem contraste legível no Modo Escuro (WCAG AA). 
- **Ponto de Atenção:** Textos `slate-500` com peso "normal" em tamanho `[9px]` ou `[10px]` podem sofrer rejeição (WCAG falho) por usuários de baixa visão. Devem ser escalados minimamente ou engrossados (font-bold).

### 2. Tab Order e Focus Navigation (Score: 7/10)
- Faltam tab-indexes manuais ou garantias de captura de focus nos Modais (Focus Trap). 
- Botões interativos em `<GlassSurface />` não possuem `aria-label` explícito (ex: Botão "X" de fechar drawer, botão de toggle no `Configuracoes.tsx`).
- O Toggle switch implementado manualmente não suporta atalhos do teclado (Enter/Space) perfeitamente para acessibilidade de leitores.

### 3. Screen Readers (Score: 6/10)
- `<AdminQueue />` renderiza dados intensos (Mass Action). A falta de tabelas com scope="col" ou listas marcadas (ARIA lists) faz com que leitores de tela leiam um fluxo caótico de divs.

## Diagnóstico Geral
- **Nota Global Acessibilidade:** 7.3 / 10
- Requer inserção maciça de `aria-labels` nos botões sem texto (só com ícones) e foco apropriado (Focus Trap).
