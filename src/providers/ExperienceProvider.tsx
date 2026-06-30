import React from 'react';
import { OfflineProvider } from './OfflineProvider';
import { CommandPaletteProvider } from './CommandPaletteProvider';
import { FeedbackProvider } from './FeedbackProvider';

export const ExperienceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <OfflineProvider>
      <FeedbackProvider>
        <CommandPaletteProvider>
          {children}
        </CommandPaletteProvider>
      </FeedbackProvider>
    </OfflineProvider>
  );
};
