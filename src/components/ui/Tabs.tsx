import React, { useState } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { motion } from 'motion/react';
import { cn } from '../../utils/cn';

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900/50 p-1 text-slate-400 border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] backdrop-blur-md',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

// To enable Shared Layout Animation via Framer Motion, we need a custom wrapper around Trigger
export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & { activeLayoutId?: string }
>(({ className, activeLayoutId = 'activeTab', children, value, ...props }, ref) => {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      value={value}
      className={cn(
        'relative inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-white',
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {/* 
        This div only renders its motion properties when the trigger is active, 
        managed internally by Radix's data-[state=active] combined with conditional rendering 
        if we pass the active state down. Since Radix doesn't pass 'active' as a prop directly to our component,
        we use CSS for the background if we don't want to wire up a complex context, 
        BUT the user explicitly requested Shared Layout Animation (Framer Motion). 
        To do this cleanly in Radix, we can use a small CSS trick or read context.
        Actually, the best way in React is to wrap the List/Triggers in a custom component that knows the active value,
        but we can also just render the layoutId on ALL triggers, and hide it via CSS when NOT data-[state=active],
        or better: since Framer Motion layoutId needs to only exist on the active element to animate between them...
      */}
      {/* We'll handle the motion layout id in a higher level wrapper below, or assume standard usage */}
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 ring-offset-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// --- HIGHER LEVEL COMPONENT FOR ANIMATED TABS ---
export interface AnimatedTabProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface AnimatedTabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  tabs: AnimatedTabProps[];
  activeLayoutId?: string;
}

export function AnimatedTabs({ tabs, activeLayoutId = 'activeTab', defaultValue, onValueChange, className, ...props }: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value);

  const handleValueChange = (val: string) => {
    setActiveTab(val);
    if (onValueChange) onValueChange(val);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleValueChange} className={className} {...props}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              'relative inline-flex items-center justify-center whitespace-nowrap rounded-xl px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50',
              activeTab === tab.value ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <div className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </div>
            {activeTab === tab.value && (
              <motion.div
                layoutId={activeLayoutId}
                className="absolute inset-0 z-0 rounded-xl bg-slate-800 shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </TabsPrimitive.Trigger>
        ))}
      </TabsList>
      {/* Content should be passed as children outside or inside */}
    </Tabs>
  );
}
