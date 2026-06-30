import React, { createContext, useContext, useState } from 'react';
import { useToast } from '../components/ui/useToast';

interface FeedbackContextProps {
  executeAction: <T>(action: () => Promise<T>, successMessage?: string, errorMessage?: string) => Promise<T | undefined>;
  isGlobalLoading: boolean;
}

const FeedbackContext = createContext<FeedbackContextProps>({
  executeAction: async () => undefined,
  isGlobalLoading: false,
});

export const useFeedback = () => useContext(FeedbackContext);

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [activeActions, setActiveActions] = useState(0);

  const executeAction = async <T,>(
    action: () => Promise<T>,
    successMessage?: string,
    errorMessage = 'Ocorreu um erro inesperado.'
  ): Promise<T | undefined> => {
    setActiveActions((prev) => prev + 1);
    
    try {
      const result = await action();
      
      if (successMessage) {
        toast({
          title: 'Sucesso',
          description: successMessage,
          variant: 'success',
        });
      }
      
      return result;
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error?.message || errorMessage,
        variant: 'error',
      });
      return undefined;
    } finally {
      setActiveActions((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <FeedbackContext.Provider value={{ executeAction, isGlobalLoading: activeActions > 0 }}>
      {children}
    </FeedbackContext.Provider>
  );
};
