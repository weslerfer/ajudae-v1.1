import React from 'react';
import { Skeleton } from './Skeleton';
import { Surface } from './Surface';
import { cn } from '../../utils/cn';

export const TableSkeleton = ({ rows = 5, className }: { rows?: number; className?: string }) => (
  <div className={cn("w-full space-y-4", className)}>
    <div className="flex gap-4 border-b border-white/10 pb-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-6 w-1/4" />
      <Skeleton className="h-6 w-1/4" />
      <Skeleton className="h-6 w-1/6" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 py-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-5 w-1/6" />
      </div>
    ))}
  </div>
);

export const ChartSkeleton = ({ className }: { className?: string }) => (
  <Surface className={cn("p-6 flex flex-col h-[300px]", className)}>
    <div className="flex justify-between items-center mb-6">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-8 w-24 rounded-full" />
    </div>
    <div className="flex-1 w-full flex items-end gap-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="flex-1 rounded-t-sm rounded-b-none" 
          style={{ height: `${Math.max(20, Math.random() * 100)}%` }} 
        />
      ))}
    </div>
  </Surface>
);

export const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
    <Skeleton className="col-span-1 md:col-span-12 h-40" />
    <Skeleton className="col-span-1 md:col-span-3 h-32" />
    <Skeleton className="col-span-1 md:col-span-3 h-32" />
    <Skeleton className="col-span-1 md:col-span-3 h-32" />
    <Skeleton className="col-span-1 md:col-span-3 h-32" />
    
    <ChartSkeleton className="col-span-1 md:col-span-8 h-[400px]" />
    <Surface className="col-span-1 md:col-span-4 p-6">
      <Skeleton className="h-6 w-1/2 mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </Surface>
  </div>
);
