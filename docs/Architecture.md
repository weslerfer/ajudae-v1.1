# AJUDAAE Architecture

A arquitetura do AJUDAAE divide-se nas seguintes camadas:

1. **Design System & Foundation (`src/components/ui/`)**: Contém os blocos construtivos puros. Eles são estilizados com Tailwind e seguem estritamente a *Visual Language*.
2. **Experience Engine (`src/experience/`)**: Contém toda a física e emoção do app. Animações, transições de tela, brilhos, efeitos magnéticos, reduções de framerate e otimizações.
3. **Providers (`src/providers/`)**: Serviços globais sem renderização visual acoplada (Offline, Feedback, Command Palette, etc.).
4. **Views (`src/views/`)**: A camada de negócio. Apenas junta os componentes visuais, conecta na API/Supabase, e orquestra a lógica funcional. Não deve conter `framer-motion` bruto.
