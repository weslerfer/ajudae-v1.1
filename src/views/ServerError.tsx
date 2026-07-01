import React from 'react';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { EmptyState } from '../components/ui/EmptyState';

export default function ServerError({ onRetry }: { onRetry?: () => void }) {
  return (
    <Section className="pt-24 pb-24 h-full flex flex-col justify-center items-center">
      <Container>
        <EmptyState 
          icon="solar:danger-triangle-bold-duotone"
          title="Erro de Servidor"
          description="Encontramos um problema inesperado ao processar sua solicitação."
          actionLabel={onRetry ? "Tentar Novamente" : "Recarregar Página"}
          onAction={onRetry ? onRetry : () => window.location.reload()}
        />
      </Container>
    </Section>
  );
}
