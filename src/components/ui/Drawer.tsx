import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Icon } from './Icon';
import { cn } from '../../utils/cn';

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerPortal = DialogPrimitive.Portal;
export const DrawerClose = DialogPrimitive.Close;

export const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
    ref={ref}
  />
));
DrawerOverlay.displayName = DialogPrimitive.Overlay.displayName;

export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: 'left' | 'right' | 'top' | 'bottom' }
>(({ side = 'right', className, children, ...props }, ref) => {
  const sideVariants = {
    top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
    bottom: 'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
    left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
    right: 'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
  };

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-50 gap-4 bg-slate-900/98 lg:bg-slate-900/95 lg:backdrop-blur-2xl p-6 pb-8 sm:pb-6 shadow-2xl lg:shadow-[0_0_60px_rgba(0,0,0,0.7)] border-white/10 transition ease-in-out data-[state=closed]:duration-200 data-[state=open]:duration-300',
          sideVariants[side],
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 z-[-1] bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-2 opacity-70 ring-offset-slate-950 transition-opacity hover:opacity-100 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-white/10">
          <Icon name="solar:close-circle-bold" className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DrawerPortal>
  );
});
DrawerContent.displayName = DialogPrimitive.Content.displayName;

export const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-left', className)} {...props} />
);
DrawerHeader.displayName = 'DrawerHeader';

export const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t border-white/10 mt-auto', className)} {...props} />
);
DrawerFooter.displayName = 'DrawerFooter';

export const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-xl font-display font-bold text-white', className)} {...props} />
));
DrawerTitle.displayName = DialogPrimitive.Title.displayName;

export const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-sm text-slate-400', className)} {...props} />
));
DrawerDescription.displayName = DialogPrimitive.Description.displayName;
