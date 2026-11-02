'use client';

import React, { useState, useRef } from 'react';
import { Search, Download, Printer, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useERP } from '@/context/ERPContext';
import { printContent } from '@/lib/printUtils';

import { sortByLatestDesc } from '@/lib/sortHelper';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  exportValue?: (item: T) => string | number;
  className?: string;
}

interface DataTableProps<T> {
  title?: string;
  subtitle?: string;
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  searchPlaceholder?: string;
  filterComponent?: React.ReactNode;
  actions?: React.ReactNode;
  pageSizeDefault?: number;
  pageSizeOptions?: number[];
  isLoading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  title,
  subtitle,
  columns,
  data,
  onRowClick,
  searchPlaceholder = 'Search records...',
  filterComponent,
  actions,
  pageSizeDefault = 10,
  pageSizeOptions = [10, 20, 30, 50, 100],
  isLoading: propIsLoading,
}: DataTableProps<T>) {
  let contextLoading = false;
  try {
    const erp = useERP();
    contextLoading = erp.isInitialLoading;
  } catch (_) {}

  const isLoading = propIsLoading !== undefined ? propIsLoading : contextLoading;
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeDefault);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const prevDataLengthRef = React.useRef(data.length);
  React.useEffect(() => {
    if (data.length > prevDataLengthRef.current) {
      setCurrentPage(1);
    }
    prevDataLengthRef.current = data.length;
  }, [data.length]);

  // Sort records descending by latest entry (ORDER BY 1 DESC)
  const sortedData = React.useMemo(() => sortByLatestDesc(data), [data]);

  // Filter rows based on search query
  const filteredData = sortedData.filter((row) => {
    const query = (searchQuery || '').trim().toLowerCase();
    if (!query) return true;
    return Object.values(row).some((val) => {
      if (val === null || val === undefined) return false;
      return String(val)?.toLowerCase().includes(query);
    });
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const exportCSV = () => {
    if (data.length === 0) return;
    const headers = columns.map((c) => c.header).join(',');
    const rows = filteredData.map((row) =>
      columns
        .map((c) => {
          let val: any = '';
          if (c.exportValue) {
            val = c.exportValue(row);
          } else if (c.accessorKey) {
            val = row[c.accessorKey];
          }
          return `"${String(val ?? '')?.replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${(title || 'export')?.toLowerCase()?.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (tableContainerRef.current) {
      printContent(tableContainerRef.current, {
        title: title ? `${title.replace(/\s+/g, '_')}_Report` : 'ERP_Table_Report',
      });
    } else {
      window.print();
    }
  };

  return (
    <div ref={tableContainerRef} className="bg-white rounded-xl border border-[color:var(--crm-border-default)] shadow-2xs overflow-hidden flex flex-col transition-all">
      {/* Header & Controls Toolbar */}
      <div className="px-3.5 py-2.5 sm:py-3 border-b border-[color:var(--crm-border-default)] flex flex-wrap items-center justify-between gap-2.5 bg-[color:var(--crm-bg-app)]">
        {(title || subtitle || (isLoading && data.length === 0)) ? (
          <div className="shrink-0">
            {title && <h3 className="text-xs sm:text-sm font-bold text-[color:var(--crm-text-primary)] tracking-tight">{title}</h3>}
            {isLoading && data.length === 0 ? (
              <p className="text-[11px] text-amber-800 flex items-center gap-1.5 mt-0.5 font-medium">
                <Loader2 className="w-3 h-3 animate-spin text-crm-brand-600" />
                <span>Loading live ERP records...</span>
              </p>
            ) : (
              subtitle && <p className="text-[11px] text-[color:var(--crm-text-secondary)] mt-0.5">{subtitle}</p>
            )}
          </div>
        ) : null}

        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto ml-auto print:hidden">
          {/* Search Box */}
          <div className="relative w-full sm:w-56 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--crm-text-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-3 py-2 min-h-[40px] text-xs bg-white border border-[color:var(--crm-border-default)] rounded-xl text-[color:var(--crm-text-primary)] placeholder:text-[color:var(--crm-text-tertiary)] focus:outline-none focus:border-[color:var(--crm-brand-700)] transition shadow-2xs"
            />
          </div>

          {filterComponent}

          {/* Quick Toolbar buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={exportCSV}
              title="Export to CSV"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 text-[color:var(--crm-text-secondary)] hover:text-[color:var(--crm-text-primary)] hover:bg-white rounded-xl border border-[color:var(--crm-border-default)] transition cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              title="Print Table"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 text-[color:var(--crm-text-secondary)] hover:text-[color:var(--crm-text-primary)] hover:bg-white rounded-xl border border-[color:var(--crm-border-default)] transition cursor-pointer shadow-2xs"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

          {actions}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto min-h-[240px] w-full">
        <table className="min-w-full w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-secondary)] font-bold border-b border-[color:var(--crm-border-default)] uppercase tracking-wider sticky top-0 z-10 text-[10px]">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={cn('py-3.5 px-4 font-bold text-[color:var(--crm-text-secondary)] whitespace-nowrap select-none', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFE4EE]">
            {isLoading && paginatedData.length === 0 ? (
              Array.from({ length: 6 }).map((_, rIdx) => (
                <tr key={`skel-row-${rIdx}`}>
                  {columns.map((col, cIdx) => (
                    <td key={`skel-col-${cIdx}`} className="py-4 px-4 whitespace-nowrap">
                      <div
                        className="h-3.5 rounded-md animate-shimmer"
                        style={{ width: `${Math.max(30, Math.min(95, 45 + ((rIdx * 23 + cIdx * 37) % 50)))}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-[color:var(--crm-text-tertiary)] whitespace-normal">
                  <p className="font-semibold text-xs text-[color:var(--crm-text-primary)]">No matching records found.</p>
                  <p className="text-[11px] mt-1 text-[color:var(--crm-text-tertiary)]">Try adjusting your search criteria or filters.</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    'transition-colors duration-150',
                    onRowClick
                      ? 'cursor-pointer hover:bg-[color:var(--crm-bg-app)]'
                      : 'hover:bg-[#F4F6FA]/80'
                  )}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={cn('py-3 px-4 text-[color:var(--crm-text-primary)] font-medium align-middle whitespace-nowrap', col.className)}>
                      {col.cell ? col.cell(row) : col.accessorKey ? String(row[col.accessorKey] ?? '-') : '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-[color:var(--crm-border-default)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[color:var(--crm-text-secondary)] bg-[color:var(--crm-bg-app)] print:hidden">
        <div className="flex items-center gap-4">
          {isLoading && filteredData.length === 0 ? (
            <span className="flex items-center gap-2 text-xs text-[color:var(--crm-text-secondary)]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[color:var(--crm-brand-700)]" />
              <span>Connecting to live cloud records...</span>
            </span>
          ) : (
            <div>
              Showing <span className="font-bold text-[color:var(--crm-text-primary)]">{filteredData.length > 0 ? startIndex + 1 : 0}</span> to{' '}
              <span className="font-bold text-[color:var(--crm-text-primary)]">{Math.min(startIndex + pageSize, filteredData.length)}</span> of{' '}
              <span className="font-bold text-[color:var(--crm-text-primary)]">{filteredData.length}</span> records
            </div>
          )}

          {/* Rows per page selector */}
          <div className="flex items-center gap-1.5 text-xs text-[color:var(--crm-text-secondary)]">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-[color:var(--crm-border-default)] rounded-lg px-2.5 py-1.5 min-h-[38px] text-xs font-semibold text-[color:var(--crm-text-primary)] focus:outline-none focus:border-[color:var(--crm-brand-700)]"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 rounded-lg border border-[color:var(--crm-border-default)] disabled:opacity-30 hover:bg-white text-[color:var(--crm-text-secondary)] transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-[color:var(--crm-text-primary)] px-2 font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 rounded-lg border border-[color:var(--crm-border-default)] disabled:opacity-30 hover:bg-white text-[color:var(--crm-text-secondary)] transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
