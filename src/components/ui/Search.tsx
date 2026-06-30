import React from 'react';
import { Input, InputProps } from './Input';
import { Icon } from './Icon';
import { cn } from '../../utils/cn';

export interface SearchProps extends Omit<InputProps, 'icon'> {
  shortcut?: string; // e.g. "⌘K"
}

export const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({ className, shortcut, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="search"
        placeholder="Pesquisar..."
        icon={<Icon name="solar:magnifer-linear" className="w-5 h-5" />}
        rightElement={
          shortcut ? (
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100">
              <span className="text-xs">⌘</span>{shortcut.replace('⌘', '')}
            </kbd>
          ) : undefined
        }
        className={cn(
          'bg-slate-900/40 hover:bg-slate-900/60 transition-colors backdrop-blur-md border-white/5',
          className
        )}
        {...props}
      />
    );
  }
);
Search.displayName = 'Search';
