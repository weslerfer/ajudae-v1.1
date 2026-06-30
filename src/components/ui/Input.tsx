import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, rightElement, ...props }, ref) => {
    return (
      <div className="relative w-full group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-emerald-400 z-10 pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-xl bg-slate-900/50 px-4 py-2 text-sm text-slate-100 transition-all duration-300',
            'border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]',
            'placeholder:text-slate-500',
            'focus-visible:outline-none focus-visible:border-emerald-500/50 focus-visible:bg-slate-900 focus-visible:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_0_15px_rgba(16,185,129,0.15)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-11',
            rightElement && 'pr-12',
            error && 'border-red-500/50 focus-visible:border-red-500/50 focus-visible:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_0_15px_rgba(239,68,68,0.15)]',
            className
          )}
          ref={ref}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 z-10 flex items-center justify-center">
            {rightElement}
          </div>
        )}
        
        {/* Animated bottom border highlight on focus to simulate a high-tech instrument */}
        <div className="absolute bottom-0 left-1/2 w-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent -translate-x-1/2 transition-all duration-300 opacity-0 group-focus-within:w-[80%] group-focus-within:opacity-100 pointer-events-none" />

        {error && (
          <span className="absolute -bottom-6 left-1 text-xs text-red-400 animate-in fade-in slide-in-from-top-1 font-medium">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
