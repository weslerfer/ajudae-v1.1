import React from 'react';
import { cn } from '../../utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="relative w-full group">
        <textarea
          className={cn(
            'flex min-h-[100px] w-full rounded-xl bg-slate-900/50 px-4 py-3 text-sm text-slate-100 transition-all duration-300 resize-y',
            'border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]',
            'placeholder:text-slate-500',
            'focus-visible:outline-none focus-visible:border-emerald-500/50 focus-visible:bg-slate-900 focus-visible:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_0_15px_rgba(16,185,129,0.15)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500/50 focus-visible:border-red-500/50 focus-visible:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_0_15px_rgba(239,68,68,0.15)]',
            className
          )}
          ref={ref}
          {...props}
        />
        
        {/* Animated bottom border highlight on focus to simulate a high-tech instrument */}
        <div className="absolute bottom-2 left-1/2 w-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent -translate-x-1/2 transition-all duration-300 opacity-0 group-focus-within:w-[80%] group-focus-within:opacity-100 pointer-events-none" />

        {error && (
          <span className="absolute -bottom-6 left-1 text-xs text-red-400 animate-in fade-in slide-in-from-top-1 font-medium">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
