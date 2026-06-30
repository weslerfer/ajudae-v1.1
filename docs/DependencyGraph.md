# Dependency Graph

```mermaid
graph TD
    %% Camada Global (Entry)
    App[App.tsx] --> Providers
    App --> AppShell

    %% Camada de Serviços (Providers)
    subgraph Providers [Experience & Global Services]
        ExperienceProvider --> OfflineProvider
        ExperienceProvider --> FeedbackProvider
        ExperienceProvider --> CommandPaletteProvider
    end

    %% Camada de Orquestração Visual (App Shell)
    subgraph Shell [App Shell]
        AppShell --> CommandPalette
        AppShell --> Sidebar[components/Sidebar.tsx - LEGACY]
        AppShell --> Navbar
        AppShell --> GlobalProgressBar
    end

    %% Camada Foundation (UI)
    subgraph Foundation [Design System UI]
        CommandPalette --> Dialog(Radix UI Dialog)
        Toast --> ToastPrimitives(Radix UI Toast)
        Navbar --> Typography
        Navbar --> Icon
        Sidebar --> Icon
        Sidebar --> Typography
        Button --> Slot(Radix Slot)
    end

    %% Camada de Engine
    subgraph Experience [Experience Engine]
        presets(presets.ts)
        tokens(tokens.ts)
        hooks(Hooks: useMagnetic, useHoverGlow)
    end

    %% Dependências das Views
    App --> Views
    Views[Views e.g. Dashboard, AdminGrupos] --> Foundation
    Views --> Experience
```

## Análise de Acoplamento
- O `AppShell` ainda depende da `Sidebar.tsx` **legada** (acoplamento incorreto).
- O `App.tsx` possui acoplamento forte com formulários de autenticação.
- Nenhuma dependência circular detectada.
