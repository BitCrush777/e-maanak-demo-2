import React from 'react';

export type StatusType =
  | 'VALID'
  | 'VERIFIED'
  | 'PENDING_VERIFICATION'
  | 'UNDER_REVIEW'
  | 'SUBMITTED'
  | 'CERTIFICATE_ISSUED'
  | 'REJECTED'
  | 'FAILED'
  | 'EXPIRED'
  | 'REVOKED'
  | 'REGISTERED'
  | 'SYNCED'
  | 'PENDING_SYNC'
  | 'CONFLICT'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', className = '' }) => {
  const norm = (status || '').toUpperCase().trim();

  let colorClasses = 'bg-slate-100 text-slate-800 border-slate-300';
  let indicator = '●';

  switch (norm) {
    case 'VALID':
    case 'VERIFIED':
    case 'CERTIFICATE_ISSUED':
    case 'SYNCED':
    case 'COMPLETED':
    case 'PASS':
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-400';
      indicator = '✓';
      break;

    case 'PENDING_VERIFICATION':
    case 'UNDER_REVIEW':
    case 'SUBMITTED':
    case 'PENDING_SYNC':
    case 'SCHEDULED':
      colorClasses = 'bg-amber-50 text-amber-900 border-amber-400';
      indicator = '⏳';
      break;

    case 'REGISTERED':
      colorClasses = 'bg-blue-50 text-blue-900 border-blue-400';
      indicator = '●';
      break;

    case 'EXPIRED':
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-400';
      indicator = '⚠';
      break;

    case 'REVOKED':
    case 'REJECTED':
    case 'FAILED':
    case 'FAIL':
    case 'CONFLICT':
      colorClasses = 'bg-rose-50 text-rose-800 border-rose-400';
      indicator = '✕';
      break;

    default:
      colorClasses = 'bg-slate-100 text-slate-800 border-slate-300';
      indicator = '●';
      break;
  }

  const label = norm.replace(/_/g, ' ');
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10.5px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center space-x-1 border font-medium font-mono rounded-xs uppercase tracking-tight select-none ${sizeClasses} ${colorClasses} ${className}`}
      title={`Status: ${label}`}
    >
      <span className="text-[10px] leading-none" aria-hidden="true">
        {indicator}
      </span>
      <span>{label}</span>
    </span>
  );
};
