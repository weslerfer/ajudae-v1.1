import React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Icon } from './Icon';
import { cn } from '../../utils/cn';

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-5 w-5 shrink-0 rounded-md border border-white/20 bg-slate-900/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-300',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 data-[state=checked]:shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      'hover:border-emerald-500/50 hover:bg-slate-800',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center text-slate-950')}
    >
      <Icon name="solar:check-read-bold" className="w-3.5 h-3.5" color="active" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
