import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CommandItemDef {
  id: string;
  title: string;
  icon?: string;
  section?: string;
  onSelect: () => void;
  shortcut?: string[];
}

interface CommandContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  commands: CommandItemDef[];
  registerCommand: (command: CommandItemDef) => void;
  unregisterCommand: (id: string) => void;
}

const CommandContext = createContext<CommandContextProps>({
  isOpen: false,
  setIsOpen: () => {},
  commands: [],
  registerCommand: () => {},
  unregisterCommand: () => {},
});

export const useCommandPalette = () => useContext(CommandContext);

export const CommandPaletteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [commands, setCommands] = useState<CommandItemDef[]>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const registerCommand = (command: CommandItemDef) => {
    setCommands((prev) => {
      if (prev.find((c) => c.id === command.id)) return prev;
      return [...prev, command];
    });
  };

  const unregisterCommand = (id: string) => {
    setCommands((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <CommandContext.Provider value={{ isOpen, setIsOpen, commands, registerCommand, unregisterCommand }}>
      {children}
    </CommandContext.Provider>
  );
};
