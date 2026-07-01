import React from 'react';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { EmptyState } from '../components/ui/EmptyState';

export default function NotFound({ onNavigate }: { onNavigate: (view: string) => void }) {
  return (
    <Section className="pt-24 pb-24 h-full flex flex-col justify-center items-center">
      <Container>
        <EmptyState 
          icon="solar:magnifer-bug-bold-duotone"
          title="Página Não Encontrada"
          description="A página que você está procurando não existe ou foi movida."
          actionLabel="Voltar ao Início"
          onAction={() => onNavigate('dashboard')}
        />
      </Container>
    </Section>
  );
}
