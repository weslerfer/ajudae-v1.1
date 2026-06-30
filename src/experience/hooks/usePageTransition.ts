import { useState, useEffect } from 'react';

/**
 * Nota: Como o sistema atual usa estado local para rotas ('currentView'),
 * este hook serve como base arquitetural. Quando migrar para react-router,
 * basta descomentar o useLocation.
 */
export const usePageTransition = (currentView: string) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [view, setView] = useState(currentView);

  useEffect(() => {
    if (view !== currentView) {
      setIsTransitioning(true);
      
      // Simula o tempo de transição / carregamento
      const timer = setTimeout(() => {
        setView(currentView);
        setIsTransitioning(false);
      }, 400); // tempo de saída da view antiga

      return () => clearTimeout(timer);
    }
  }, [currentView, view]);

  return { activeView: view, isTransitioning };
};
