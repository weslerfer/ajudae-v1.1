import React from 'react';
import { Typography } from './Typography';
import { Stack } from './Stack';
import { Icon } from './Icon';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'solar:ghost-smile-bold-duotone',
  title,
  description,
  actionLabel,
  onAction,
  className
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 text-center rounded-3xl border border-dashed border-white/10 bg-slate-900/30',
      className
    )}>
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20">
        <Icon name={icon} size="3xl" color="success" glow />
      </div>
      
      <Stack gap="sm" align="center" className="max-w-md mb-8">
        <Typography variant="h4">{title}</Typography>
        <Typography variant="body" color="secondary">{description}</Typography>
      </Stack>

      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
