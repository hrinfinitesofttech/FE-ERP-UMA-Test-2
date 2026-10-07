'use client';

import React, { useState } from 'react';
import { Search, Download, Printer, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useERP } from '@/context/ERPContext';

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
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E7DED5] shadow-xs overflow-hidden flex flex-col transition-all">
      {/* Header & Controls Toolbar */}
      <div className="p-4 sm:p-5 border-b border-[#E7DED5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 bg-[#FAF7F2]">
        <div>
          {title && <h3 className="text-sm font-bold text-[#211B17] tracking-tight">{title}</h3>}
          {isLoading && data.length === 0 ? (
            <p className="text-xs text-amber-800 flex items-center gap-1.5 mt-0.5 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-800" />
              <span>Loading live ERP records from cloud database...</span>
            </p>
          ) : (
            subtitle && <p className="text-xs text-[#70665F] mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto print:hidden">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8D827A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-white border border-[#E7DED5] rounded-full text-[#211B17] placeholder:text-[#8D827A] focus:outline-none focus:border-[#75401F] transition shadow-xs"
            />
          </div>

          {filterComponent}

          {/* Quick Toolbar buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={exportCSV}
              title="Export to CSV"
              className="p-1.5 text-[#70665F] hover:text-[#211B17] hover:bg-white rounded-full border border-[#E7DED5] transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handlePrint}
              title="Print Table"
              className="p-1.5 text-[#70665F] hover:text-[#211B17] hover:bg-white rounded-full border border-[#E7DED5] transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>

          {actions}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto min-h-[240px]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF7F2] text-[#70665F] font-bold border-b border-[#E7DED5] uppercase tracking-wider sticky top-0 z-10 text-[10px]">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={cn('py-3 px-4 font-bold whitespace-nowrap', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFE8DE]">
            {isLoading && paginatedData.length === 0 ? (
              Array.from({ length: 6 }).map((_, rIdx) => (
                <tr key={`skel-row-${rIdx}`}>
                  {columns.map((col, cIdx) => (
                    <td key={`skel-col-${cIdx}`} className="py-4 px-4">
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
                <td colSpan={columns.length} className="text-center py-12 text-[#8D827A]">
                  <p className="font-semibold text-xs text-[#211B17]">No matching records found.</p>
                  <p className="text-[11px] mt-1 text-[#8D827A]">Try adjusting your search criteria or filters.</p>
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
                      ? 'cursor-pointer hover:bg-[#FAF7F2]'
                      : 'hover:bg-[#FAF7F2]/80'
                  )}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={cn('py-3.5 px-4 text-[#211B17] font-medium align-middle whitespace-nowrap', col.className)}>
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
      <div className="p-3.5 border-t border-[#E7DED5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#70665F] bg-[#FAF7F2] print:hidden">
        <div className="flex items-center gap-4">
          {isLoading && filteredData.length === 0 ? (
            <span className="flex items-center gap-2 text-xs text-[#70665F]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#75401F]" />
              <span>Connecting to live cloud records...</span>
            </span>
          ) : (
            <div>
              Showing <span className="font-bold text-[#211B17]">{filteredData.length > 0 ? startIndex + 1 : 0}</span> to{' '}
              <span className="font-bold text-[#211B17]">{Math.min(startIndex + pageSize, filteredData.length)}</span> of{' '}
              <span className="font-bold text-[#211B17]">{filteredData.length}</span> records
            </div>
          )}

          {/* Rows per page selector */}
          <div className="flex items-center gap-1.5 text-xs text-[#70665F]">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-[#E7DED5] rounded px-2 py-0.5 text-xs font-semibold text-[#211B17] focus:outline-none focus:border-[#75401F]"
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
            className="p-1.5 rounded-lg border border-[#E7DED5] disabled:opacity-30 hover:bg-white text-[#70665F] transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-[#211B17] px-2 font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-[#E7DED5] disabled:opacity-30 hover:bg-white text-[#70665F] transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
