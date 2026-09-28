import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  className = '',
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems <= pageSize) {
    return (
      <div className={`flex items-center justify-between text-xs text-slate-500 py-2.5 px-3 bg-slate-50 border-t border-slate-200 ${className}`}>
        <span>Showing {totalItems} record{totalItems === 1 ? '' : 's'}</span>
        <span className="font-mono text-[11px]">Page 1 of 1</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 py-2.5 px-3 bg-slate-50 border-t border-slate-200 ${className}`}
    >
      <div>
        Showing <span className="font-semibold text-slate-850">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-850">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-850">{totalItems}</span> records
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          type="button"
          className="px-2.5 py-1 border border-slate-300 bg-white rounded-xs text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition"
        >
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          // If totalPages > 7, can condense, but for small pagination 1..totalPages
          if (
            totalPages > 7 &&
            p !== 1 &&
            p !== totalPages &&
            Math.abs(p - currentPage) > 1
          ) {
            if (p === 2 || p === totalPages - 1) {
              return (
                <span key={p} className="px-1 text-slate-400 select-none">
                  ...
                </span>
              );
            }
            return null;
          }

          const isCurrent = p === currentPage;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              type="button"
              aria-current={isCurrent ? 'page' : undefined}
              className={`px-2.5 py-1 border text-xs font-semibold rounded-xs transition ${
                isCurrent
                  ? 'bg-gov-navy text-white border-gov-navy'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          type="button"
          className="px-2.5 py-1 border border-slate-300 bg-white rounded-xs text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};
