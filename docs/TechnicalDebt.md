# Technical Debt (Dívidas Técnicas)

## 1. Duplicação de Componentes (Foundation vs Monolith)
- `src/components/Sidebar.tsx` x `src/components/ui/Sidebar.tsx`
O arquivo `components/Sidebar.tsx` é a versão antiga (acoplada a lógicas de roteamento). Ele precisa ser inteiramente substituído pelo `components/ui/Sidebar.tsx`, com a injeção correta de estado no nível do `AppShell.tsx`.
- `src/components/ActionModal.tsx` x `src/components/ui/Modal.tsx`
O `ActionModal` tem lógica customizada local que precisa ser absorvida pelos padrões do Design System através de `Modal` puro.

## 2. Hardcoded Motion em Views
Ainda identificamos chamadas independentes ao `framer-motion` dentro da camada de negócios:
- `Dashboard.tsx`
- `HeroWidget.tsx`
- `QuickActions.tsx`
- `AdminGrupos.tsx`

**Correção Exigida**: Todas essas importações devem ser substituídas pelos Motion Presets (ex: `fadeUp`, `staggerChildren`) de `src/experience/presets.ts`.

## 3. Lógica de UI massiva no App.tsx
`App.tsx` não deveria conhecer formulários de Login, nem variáveis `regNome`, `regCpf`, `authLoading`.
**Correção**: Extrair a tela de Auth para um `/views/Auth/` próprio e deixar o App apenas como orquestrador do roteador primário.

## 4. Otimização de Imagens (ThreeJS & Blur)
Não há um controle que desarme blurs em massa ou elementos do Dashboard pesado se o dispositivo móvel entrar em renderização.
