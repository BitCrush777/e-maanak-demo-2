import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  badge,
  className = '',
}) => {
  return (
    <div className={`border-b border-slate-300 pb-4 mb-6 ${className}`}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-gov-navy tracking-tight">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>

          {description && (
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap flex-shrink-0 mt-2 sm:mt-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
