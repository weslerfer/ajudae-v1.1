# Refactoring Roadmap (Pré-Sprint 7)

Antes de desenvolvermos o sistema de transações, precisamos limpar as dívidas levantadas nesta auditoria, nesta ordem:

1. **Lazy Loading no App.tsx**
   - Substituir os imports fixos por `React.lazy()` e adicionar `<Suspense>` no interior do `AppShell` com o `GlobalProgressBar` atuando como loader de rota.
   - Extrair formulário de Auth e estados `regNome`, etc., para uma nova página `/views/Auth/AuthScreen.tsx`.

2. **Remoção da Sidebar Legada**
   - Adaptar os itens e lógica de navegação presentes em `src/components/Sidebar.tsx` e unificar ao Foundation em `src/components/ui/Sidebar.tsx`.
   - Excluir o arquivo antigo.

3. **Substituição de ActionModal.tsx**
   - Todo o uso legatário de modais ser migrado para `src/components/ui/Modal.tsx`.

4. **Limpeza de Motion e Estilos Hardcoded**
   - Varredura nos componentes `Dashboard`, `HeroWidget`, `AdminGrupos` trocando `motion/react` por `presets.ts`.

Concluindo este roadmap, o Sprint 7 poderá focar exclusivamente nas Views do Produto.
