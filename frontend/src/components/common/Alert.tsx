import React from 'react';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  type?: AlertType;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  let styleClasses = 'bg-blue-50 border-blue-300 text-blue-900';
  let icon = 'ℹ️';

  switch (type) {
    case 'success':
      styleClasses = 'bg-emerald-50 border-emerald-300 text-emerald-900';
      icon = '✓';
      break;
    case 'warning':
      styleClasses = 'bg-amber-50 border-amber-300 text-amber-900';
      icon = '⚠';
      break;
    case 'error':
      styleClasses = 'bg-rose-50 border-rose-300 text-rose-900';
      icon = '✕';
      break;
    case 'info':
    default:
      styleClasses = 'bg-blue-50 border-blue-300 text-blue-900';
      icon = 'ℹ';
      break;
  }

  return (
    <div
      role="alert"
      className={`border rounded-xs p-3 text-xs leading-relaxed flex items-start justify-between gap-3 ${styleClasses} ${className}`}
    >
      <div className="flex items-start space-x-2.5">
        <span className="font-bold select-none text-sm leading-none mt-0.5" aria-hidden="true">
          {icon}
        </span>
        <div>
          {title && <div className="font-bold text-xs uppercase tracking-wide mb-0.5">{title}</div>}
          <div className="text-slate-800">{children}</div>
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="text-slate-500 hover:text-slate-900 font-bold text-sm px-1.5 py-0.5 -mt-1 -mr-1"
          aria-label="Close notification"
        >
          ✕
        </button>
      )}
    </div>
  );
};
