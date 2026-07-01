import React from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  active = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-slate-800/50',
        className
      )}
      {...props}
    >
      {/* 
        Instead of just a pulsing gray block, we add a subtle moving shimmer 
        gradient over it to simulate data processing and provide a premium OS feel.
      */}
      {active && (
        <div className="absolute inset-0 -translate-x-full motion-safe:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      )}
    </div>
  );
};
