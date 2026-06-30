# RC1.3 — MOTION AUDIT

## Metodologia
Validação de toda a camada de interação (Framer Motion) com base no Motion Budget (exigido desde a Experience Engine).
A regra de ouro: *Animações devem orientar, confirmar ou explicar. Jamais exagerar.*

## Auditoria de Interações

### 1. Page Transitions (Score: 10/10)
- `fadeUp` foi padronizado na `<AuthScreen />` e nas trocas de view principais do `<AppShell />`.
- Não existem recarregamentos brutos ou flash de tela branca (FOUC).

### 2. Micro-Interações (Score: 9/10)
- **Hover & Focus:** Presentes nos botões e no `<Input />`. O anel de foco verde-esmeralda é claro e cumpre papel orientativo e de acessibilidade.
- **Toggle Switch:** O toggle customizado de Configurações possui animação exata de deslocamento `translate-x-1` para `translate-x-7`, servindo perfeitamente ao papel de *confirmar*.

### 3. Modais e Drawers (Score: 8/10)
- A abertura de Modais via Framer Motion está excelente.
- O Progressive Drawer (no `AdminQueue`) utiliza CSS transitions puros.
- **Problema Médio:** A troca de expansão do Drawer pode dar "pulos" de layout (layout shift) se o conteúdo demorar para carregar (ex: imagem de perfil não cacheada). É aconselhável usar `AnimatePresence` com `layout` nestes expansores.

### 4. Feedbacks Visuais (Toasts e Suspense) (Score: 8/10)
- `<Toaster />` possui as curvas corretas.

## Diagnóstico Geral de Motion
- **Nota Global Motion:** 8.7 / 10
- Nenhuma animação fútil, ausência completa de Parallax desnecessários. Motion focado no contexto do negócio.
