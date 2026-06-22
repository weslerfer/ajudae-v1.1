import React, { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside React Tree:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-200 p-6 font-sans antialiased">
          <div className="max-w-md w-full bg-slate-900 border border-slate-900 rounded-3xl p-6 space-y-4 text-center shadow-xl">
            <div className="w-14 h-14 bg-red-500/10 text-red-500 border border-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-xl">
              ⚠️
            </div>
            <h2 className="text-base font-bold text-white">Oops! Erro de Carregamento</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Não foi possível renderizar a tela. Isso geralmente é resolvido recarregando o app ou limpando os cookies de sessão.
            </p>
            <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-left max-h-32 overflow-y-auto">
              <code className="text-[10px] font-mono text-red-400 block whitespace-pre-wrap">
                {this.state.error?.toString()}
              </code>
            </div>
            <button
              onClick={() => {
                try {
                  localStorage.clear();
                } catch (e) {}
                window.location.reload();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Limpar dados e Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
