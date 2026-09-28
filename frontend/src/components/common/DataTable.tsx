import React, { useState, useMemo } from 'react';
import { Pagination } from './Pagination';
import { EmptyState } from './EmptyState';

export interface ColumnDef<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  width?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  filterComponent?: React.ReactNode;
  searchPlaceholder?: string;
  searchFilter?: (row: T, query: string) => boolean;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  pageSize?: number;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  title,
  subtitle,
  headerActions,
  filterComponent,
  searchPlaceholder,
  searchFilter,
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching the current filter criteria.',
  emptyAction,
  pageSize = 10,
  className = '',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColIndex, setSortColIndex] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Filter
  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || !searchFilter) return data;
    const q = searchQuery.toLowerCase().trim();
    return data.filter((row) => searchFilter(row, q));
  }, [data, searchQuery, searchFilter]);

  // Sort
  const sortedData = useMemo(() => {
    if (sortColIndex === null) return filteredData;
    const col = columns[sortColIndex];
    if (!col || !col.sortable) return filteredData;

    return [...filteredData].sort((a, b) => {
      let valA: any = col.sortValue
        ? col.sortValue(a)
        : typeof col.accessor === 'function'
        ? col.accessor(a)
        : a[col.accessor as keyof T];

      let valB: any = col.sortValue
        ? col.sortValue(b)
        : typeof col.accessor === 'function'
        ? col.accessor(b)
        : b[col.accessor as keyof T];

      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        const cmp = valA.localeCompare(valB);
        return sortDir === 'asc' ? cmp : -cmp;
      }

      return sortDir === 'asc' ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    });
  }, [filteredData, sortColIndex, sortDir, columns]);

  // Paginate
  const paginatedData = useMemo(() => {
    if (!pageSize) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (idx: number) => {
    if (!columns[idx].sortable) return;
    if (sortColIndex === idx) {
      if (sortDir === 'asc') setSortDir('desc');
      else {
        setSortColIndex(null);
        setSortDir('asc');
      }
    } else {
      setSortColIndex(idx);
      setSortDir('asc');
    }
  };

  return (
    <div className={`bg-white border border-slate-300 rounded-xs shadow-xs overflow-hidden ${className}`}>
      {/* Table Header Bar (Title, Search, Filters, Actions) */}
      {(title || searchFilter || filterComponent || headerActions) && (
        <div className="p-3 bg-slate-50 border-b border-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-bold text-slate-850 uppercase tracking-wide">{title}</h2>}
            {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {searchFilter && (
              <div className="relative min-w-[220px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={searchPlaceholder || 'Filter records...'}
                  className="w-full pl-8 pr-3 py-1 bg-white border border-slate-300 rounded-xs text-xs text-slate-800 placeholder-slate-400 focus:border-gov-navy focus:ring-1 focus:ring-gov-navy outline-none"
                />
                <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs pointer-events-none">
                  🔍
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1 text-slate-400 hover:text-slate-600 text-xs"
                    type="button"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {filterComponent}
            {headerActions}
          </div>
        </div>
      )}

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="gov-table">
          <thead>
            <tr>
              {columns.map((col, idx) => {
                const isSorted = sortColIndex === idx;
                return (
                  <th
                    key={idx}
                    style={{ width: col.width }}
                    onClick={() => handleSort(idx)}
                    className={`${col.headerClassName || ''} ${
                      col.sortable ? 'cursor-pointer hover:bg-slate-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-[10px] text-slate-500">
                          {isSorted ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-500">
                  <div className="inline-block animate-spin w-6 h-6 border-2 border-gov-navy border-t-transparent rounded-full mb-2" />
                  <div className="text-xs font-semibold">Retrieving records from metrology database...</div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr key={keyExtractor(row, rowIdx)}>
                  {columns.map((col, colIdx) => {
                    let cellContent: React.ReactNode = null;
                    if (typeof col.accessor === 'function') {
                      cellContent = col.accessor(row);
                    } else if (col.accessor) {
                      cellContent = row[col.accessor] as any;
                    }
                    return (
                      <td key={colIdx} className={col.className || ''}>
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination */}
      {!loading && sortedData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={sortedData.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
