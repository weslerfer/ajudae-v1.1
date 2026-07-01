import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Section } from './Section';
import { Container } from './Container';
import { EmptyState } from './EmptyState';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Section className="h-full min-h-[100dvh] md:min-h-screen flex items-center justify-center pt-24 pb-24 bg-slate-950">
          <Container>
            <EmptyState 
              icon="solar:shield-warning-bold-duotone"
              title="Erro Inesperado"
              description={this.state.error?.message || "Ocorreu um erro crítico ao renderizar esta interface."}
              actionLabel="Tentar Novamente"
              onAction={() => {
                this.setState({ hasError: false });
                if (this.props.onReset) this.props.onReset();
                else window.location.reload();
              }}
            />
          </Container>
        </Section>
      );
    }

    return this.props.children;
  }
}
