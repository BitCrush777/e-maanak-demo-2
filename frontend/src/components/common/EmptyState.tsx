import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
  className = '',
}) => {
  return (
    <div
      className={`border border-dashed border-slate-300 bg-slate-50/50 rounded-xs p-8 text-center my-4 ${className}`}
    >
      <div className="max-w-md mx-auto">
        <div className="text-slate-400 mb-2 flex justify-center text-2xl" aria-hidden="true">
          {icon || (
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          )}
        </div>

        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>

        {description && (
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
        )}

        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
};
