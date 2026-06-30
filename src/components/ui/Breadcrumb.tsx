import React from 'react';
import { Icon } from './Icon';
import { cn } from '../../utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className, ...props }) => {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex', className)} {...props}>
      <ol className="flex items-center space-x-2 text-sm text-slate-400">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.label} className="flex items-center">
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="flex items-center transition-colors hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-950 rounded"
                >
                  {item.icon && <Icon name={item.icon} className="mr-1.5 h-4 w-4" />}
                  {item.label}
                </a>
              ) : (
                <span className={cn('flex items-center', isLast ? 'text-slate-100 font-semibold' : '')}>
                  {item.icon && <Icon name={item.icon} className="mr-1.5 h-4 w-4" />}
                  {item.label}
                </span>
              )}

              {!isLast && (
                <Icon name="solar:alt-arrow-right-linear" className="mx-2 h-4 w-4 text-slate-600" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
