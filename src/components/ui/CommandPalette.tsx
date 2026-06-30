import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import { useCommandPalette } from '../../providers/CommandPaletteProvider';
import { Icon } from './Icon';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { modalEnter } from '../../experience/presets/presets';

export const CommandPalette: React.FC = () => {
  const { isOpen, setIsOpen, commands } = useCommandPalette();

  // Group commands by section
  const sections = commands.reduce((acc, command) => {
    const section = command.section || 'Geral';
    if (!acc[section]) acc[section] = [];
    acc[section].push(command);
    return acc;
  }, {} as Record<string, typeof commands>);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                variants={modalEnter}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed top-[20%] left-[50%] z-50 w-full max-w-2xl translate-x-[-50%] overflow-hidden rounded-xl border border-white/10 bg-slate-900/90 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
              >
                <Command className="flex flex-col w-full h-full" label="Global Command Menu">
                  <div className="flex items-center px-4 border-b border-white/10">
                    <Icon name="solar:magnifer-linear" className="h-5 w-5 text-slate-400 shrink-0" />
                    <Command.Input 
                      placeholder="O que você precisa fazer?" 
                      className="w-full bg-transparent border-0 h-14 px-4 text-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-0" 
                    />
                    <div className="flex gap-1">
                       <kbd className="inline-flex items-center justify-center rounded border border-white/10 bg-white/5 px-2 py-1 text-xs font-mono font-medium text-slate-400">ESC</kbd>
                    </div>
                  </div>

                  <Command.List className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
                    <Command.Empty className="py-10 text-center text-slate-400">Nenhum resultado encontrado.</Command.Empty>

                    {Object.entries(sections).map(([section, items]) => (
                      <Command.Group 
                        key={section} 
                        heading={section}
                        className="px-2 py-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-slate-500 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest"
                      >
                        {items.map((cmd) => (
                          <Command.Item
                            key={cmd.id}
                            value={cmd.title}
                            onSelect={() => {
                              cmd.onSelect();
                              setIsOpen(false);
                            }}
                            className="flex cursor-pointer select-none items-center rounded-lg px-3 py-3 text-sm text-slate-300 aria-selected:bg-emerald-500/10 aria-selected:text-emerald-400 aria-selected:border-l-2 aria-selected:border-emerald-500 border-l-2 border-transparent transition-colors"
                          >
                            {cmd.icon && <Icon name={cmd.icon} className="h-4 w-4 mr-3 opacity-70" />}
                            <span className="flex-1">{cmd.title}</span>
                            {cmd.shortcut && (
                              <div className="flex items-center gap-1">
                                {cmd.shortcut.map(key => (
                                  <kbd key={key} className="inline-flex h-5 w-5 items-center justify-center rounded border border-white/10 bg-white/5 text-[10px] font-mono font-medium text-slate-400">
                                    {key}
                                  </kbd>
                                ))}
                              </div>
                            )}
                          </Command.Item>
                        ))}
                      </Command.Group>
                    ))}
                  </Command.List>
                </Command>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};
