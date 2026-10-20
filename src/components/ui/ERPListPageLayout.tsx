'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Download,
  Filter,
  Columns as ColumnsIcon,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Eye,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { sortByLatestDesc } from '@/lib/sortHelper';

export interface ERPColumn<T> {
  key: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  isCodeLink?: boolean;
  onCodeClick?: (item: T) => void;
  className?: string;
  hidden?: boolean;
}

export interface ERPListPageLayoutProps<T> {
  breadcrumbs: string[]; // e.g. ['DASHBOARD', 'PROCUREMENT', 'VENDOR MASTER']
  title?: string;
  data: T[];
  columns: ERPColumn<T>[];
  searchPlaceholder?: string;
  onAddNew?: () => void;
  addNewHref?: string;
  addNewLabel?: string;
  onExport?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  isLoading?: boolean;
  extraHeaderActions?: React.ReactNode;
  filterDrawerContent?: React.ReactNode;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  getRowKey?: (item: T, index: number) => string | number;
}

export function ERPListPageLayout<T extends Record<string, any>>({
  breadcrumbs,
  title,
  data,
  columns: initialColumns,
  searchPlaceholder = 'Search...',
  onAddNew,
  addNewHref,
  addNewLabel = 'Add New',
  onExport,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
  extraHeaderActions,
  filterDrawerContent,
  defaultPageSize = 50,
  pageSizeOptions = [10, 25, 50, 100],
  getRowKey,
}: ERPListPageLayoutProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [density, setDensity] = useState<'compact' | 'standard' | 'relaxed'>('standard');
  const [showDensityMenu, setShowDensityMenu] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Column visibility state
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    initialColumns.forEach((c) => {
      map[c.key] = !c.hidden;
    });
    return map;
  });

  const toggleColumn = (key: string) => {
    setVisibleColumnKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Sort descending by latest entry
  const sortedData = useMemo(() => sortByLatestDesc(data), [data]);

  // Filter records based on global search
  const filteredData = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return sortedData;
    return sortedData.filter((row) =>
      Object.values(row).some((val) => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [sortedData, searchQuery]);

  // Pagination calculation
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Default CSV Export
  const handleDefaultExport = () => {
    if (onExport) {
      onExport();
      return;
    }
    if (filteredData.length === 0) return;
    const activeCols = initialColumns.filter((c) => visibleColumnKeys[c.key] !== false);
    const headers = activeCols.map((c) => c.header).join(',');
    const rows = filteredData.map((row) =>
      activeCols
        .map((c) => {
          const val = c.accessorKey ? row[c.accessorKey] : '';
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `${breadcrumbs[breadcrumbs.length - 1]?.toLowerCase()?.replace(/\s+/g, '_') || 'export'}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Row padding classes based on density
  const rowPaddingClass =
    density === 'compact' ? 'py-1.5 px-3.5' : density === 'relaxed' ? 'py-4 px-4' : 'py-2.5 px-4';

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-[#334155] p-4 sm:p-6 space-y-4">
      {/* 1. Breadcrumb Bar */}
      <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-[#64748B]">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-[#CBD5E1]">/</span>}
              <span
                className={cn(
                  isLast
                    ? 'text-[#7C3AED] font-extrabold tracking-wide'
                    : 'text-[#64748B] hover:text-[#334155] transition'
                )}
              >
                {crumb}
              </span>
            </React.Fragment>
          );
        })}
      </div>

      {/* 2. Top Search & Primary Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition shadow-xs"
          />
        </div>

        {/* Right Action Icons: Filter Toggle, Add (+), Export */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {filterDrawerContent && (
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              title="Toggle Advanced Filters"
              className={cn(
                'p-2.5 rounded-lg border transition cursor-pointer text-xs font-semibold flex items-center justify-center',
                showFilterDrawer
                  ? 'bg-[#EDE9FE] border-[#C4B5FD] text-[#6D28D9]'
                  : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]'
              )}
            >
              {showFilterDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          {/* Add Button */}
          {addNewHref ? (
            <Link
              href={addNewHref}
              className="p-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg shadow-sm transition flex items-center justify-center cursor-pointer"
              title={addNewLabel}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </Link>
          ) : onAddNew ? (
            <button
              onClick={onAddNew}
              className="p-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg shadow-sm transition flex items-center justify-center cursor-pointer"
              title={addNewLabel}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          ) : null}

          {/* Export / Download Button */}
          <button
            onClick={handleDefaultExport}
            className="p-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg shadow-sm transition flex items-center justify-center cursor-pointer"
            title="Download CSV Export"
          >
            <Download className="w-4 h-4 stroke-[2.2]" />
          </button>

          {extraHeaderActions}
        </div>
      </div>

      {/* Advanced Filter Drawer (if active) */}
      {showFilterDrawer && filterDrawerContent && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs animate-in slide-in-from-top-2 duration-150">
          {filterDrawerContent}
        </div>
      )}

      {/* 3. Sub-Toolbar: Columns, Filters, Density */}
      <div className="flex items-center gap-2.5 relative z-20">
        {/* Columns Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowColumnMenu(!showColumnMenu);
              setShowDensityMenu(false);
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#DDD6FE] hover:border-[#7C3AED] rounded-lg text-xs font-semibold text-[#475569] shadow-2xs transition cursor-pointer"
          >
            <span className="font-mono text-[#7C3AED] tracking-tighter font-bold">|||</span>
            <span>Columns</span>
          </button>

          {showColumnMenu && (
            <div className="absolute left-0 top-full mt-1.5 w-56 bg-white border border-[#E2E8F0] rounded-xl shadow-lg p-2.5 z-30 space-y-1 text-xs">
              <div className="font-bold text-[11px] text-[#64748B] uppercase px-2 py-1 border-b border-[#F1F5F9]">
                Toggle Columns
              </div>
              <div className="max-h-60 overflow-y-auto space-y-0.5">
                {initialColumns.map((col) => {
                  const isVis = visibleColumnKeys[col.key] !== false;
                  return (
                    <label
                      key={col.key}
                      onClick={() => toggleColumn(col.key)}
                      className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[#F8FAFC] cursor-pointer text-[#334155]"
                    >
                      <span>{col.header}</span>
                      <div
                        className={cn(
                          'w-4 h-4 rounded border flex items-center justify-center transition',
                          isVis ? 'bg-[#7C3AED] border-[#7C3AED] text-white' : 'border-[#CBD5E1] bg-white'
                        )}
                      >
                        {isVis && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Filters Button */}
        {filterDrawerContent && (
          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#DDD6FE] hover:border-[#7C3AED] rounded-lg text-xs font-semibold text-[#475569] shadow-2xs transition cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Filters</span>
          </button>
        )}

        {/* Density Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowDensityMenu(!showDensityMenu);
              setShowColumnMenu(false);
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#DDD6FE] hover:border-[#7C3AED] rounded-lg text-xs font-semibold text-[#475569] shadow-2xs transition cursor-pointer"
          >
            <span className="font-bold text-[#7C3AED] text-sm leading-none">≡</span>
            <span>Density</span>
          </button>

          {showDensityMenu && (
            <div className="absolute left-0 top-full mt-1.5 w-36 bg-white border border-[#E2E8F0] rounded-xl shadow-lg p-1.5 z-30 space-y-0.5 text-xs">
              {(['compact', 'standard', 'relaxed'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setDensity(mode);
                    setShowDensityMenu(false);
                  }}
                  className={cn(
                    'w-full text-left px-2.5 py-1.5 rounded-lg font-medium capitalize flex items-center justify-between transition',
                    density === mode
                      ? 'bg-[#EDE9FE] text-[#7C3AED] font-bold'
                      : 'text-[#475569] hover:bg-[#F8FAFC]'
                  )}
                >
                  <span>{mode}</span>
                  {density === mode && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. High-Density Polished Data Grid */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto min-h-[350px] w-full">
          <table className="min-w-full w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="bg-[#F8FAFC] text-[#475569] font-bold border-b border-[#E2E8F0] uppercase tracking-wider text-[11px] sticky top-0 z-10">
              <tr>
                {initialColumns
                  .filter((col) => visibleColumnKeys[col.key] !== false)
                  .map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        'py-3 px-4 font-bold text-[#475569] whitespace-nowrap select-none',
                        col.className
                      )}
                    >
                      {col.header}
                    </th>
                  ))}
                {(onEdit || onDelete || onView) && (
                  <th className="py-3 px-4 font-bold text-[#475569] text-center whitespace-nowrap">
                    ACTIONS
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] bg-white">
              {isLoading && paginatedData.length === 0 ? (
                Array.from({ length: 8 }).map((_, rIdx) => (
                  <tr key={`skel-${rIdx}`}>
                    {initialColumns
                      .filter((col) => visibleColumnKeys[col.key] !== false)
                      .map((col, cIdx) => (
                        <td key={`skel-${rIdx}-${cIdx}`} className={cn(rowPaddingClass, 'whitespace-nowrap')}>
                          <div
                            className="h-3.5 bg-slate-200 rounded animate-pulse"
                            style={{
                              width: `${Math.max(35, Math.min(95, 40 + ((rIdx * 19 + cIdx * 31) % 55)))}%`,
                            }}
                          />
                        </td>
                      ))}
                    {(onEdit || onDelete || onView) && (
                      <td className={cn(rowPaddingClass, 'text-center')}>
                        <div className="h-4 w-12 bg-slate-200 rounded mx-auto animate-pulse" />
                      </td>
                    )}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      initialColumns.filter((c) => visibleColumnKeys[c.key] !== false).length +
                      (onEdit || onDelete || onView ? 1 : 0)
                    }
                    className="text-center py-16 text-[#94A3B8] whitespace-normal"
                  >
                    <p className="font-semibold text-sm text-[#334155]">No Records Found</p>
                    <p className="text-xs mt-1 text-[#94A3B8]">
                      {searchQuery
                        ? 'No records match your active search filter.'
                        : 'No entries registered yet. Click "+" to create the first record.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIdx) => {
                  const key = getRowKey ? getRowKey(row, rowIdx) : row.id || rowIdx;
                  return (
                    <tr
                      key={key}
                      className="hover:bg-[#F8FAFC] transition-colors duration-150 group"
                    >
                      {initialColumns
                        .filter((col) => visibleColumnKeys[col.key] !== false)
                        .map((col) => {
                          const value = col.accessorKey ? row[col.accessorKey] : undefined;
                          return (
                            <td
                              key={col.key}
                              className={cn(rowPaddingClass, 'text-[#334155] align-middle whitespace-nowrap', col.className)}
                            >
                              {col.cell ? (
                                col.cell(row, rowIdx)
                              ) : col.isCodeLink ? (
                                <button
                                  onClick={() => {
                                    if (col.onCodeClick) col.onCodeClick(row);
                                    else if (onEdit) onEdit(row);
                                    else if (onView) onView(row);
                                  }}
                                  className="text-[#2563EB] hover:text-[#1D4ED8] underline font-semibold cursor-pointer"
                                >
                                  {String(value ?? '-')}
                                </button>
                              ) : (
                                String(value ?? '-')
                              )}
                            </td>
                          );
                        })}

                      {/* Row Action Buttons */}
                      {(onEdit || onDelete || onView) && (
                        <td className={cn(rowPaddingClass, 'text-center align-middle whitespace-nowrap')}>
                          <div className="flex items-center justify-center gap-2">
                            {onView && (
                              <button
                                onClick={() => onView(row)}
                                title="View Details"
                                className="p-1 text-[#64748B] hover:text-[#7C3AED] transition cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            {onEdit && (
                              <button
                                onClick={() => onEdit(row)}
                                title="Edit Record"
                                className="p-1 text-[#475569] hover:text-[#7C3AED] transition cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(row)}
                                title="Delete Record"
                                className="p-1 text-[#64748B] hover:text-[#EF4444] transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Footer */}
        <div className="py-3 px-4 border-t border-[#E2E8F0] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
          <div className="flex items-center gap-4">
            {isLoading ? (
              <span className="flex items-center gap-2 text-xs text-[#7C3AED] font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading latest live records...</span>
              </span>
            ) : (
              <div className="text-xs text-[#64748B]">
                Total <span className="font-bold text-[#1E293B]">{totalRecords}</span> entries
              </div>
            )}

            {/* Rows Per Page */}
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#CBD5E1] rounded px-2 py-0.5 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#7C3AED] cursor-pointer"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Page Indicators & Arrows */}
          <div className="flex items-center gap-3">
            <span className="font-medium text-[#475569]">
              {totalRecords > 0 ? startIndex + 1 : 0}-{endIndex} of {totalRecords}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-[#E2E8F0] disabled:opacity-30 hover:bg-[#F1F5F9] text-[#64748B] transition cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 rounded border border-[#E2E8F0] disabled:opacity-30 hover:bg-[#F1F5F9] text-[#64748B] transition cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
