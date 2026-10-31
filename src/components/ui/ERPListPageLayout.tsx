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
          const val = c.accessorKey ? row[c.accessorKey] : (row as any)[c.key];
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
    <div className="flex flex-col text-slate-700 space-y-3">
      {/* 1. Breadcrumb Bar */}
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-300 font-normal">/</span>}
              <span
                className={cn(
                  isLast
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-800 transition'
                )}
              >
                {crumb}
              </span>
            </React.Fragment>
          );
        })}
      </div>

      {/* 2. Top Search, Filters & Primary Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 min-h-[40px] bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#204354] focus:border-[#204354] transition shadow-2xs"
          />
        </div>

        {/* Right Action Icons: Filter Toggle, Add (+), Export */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {filterDrawerContent && (
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              title="Toggle Advanced Filters"
              className={cn(
                'px-3.5 py-2 min-h-[40px] rounded-xl border transition cursor-pointer text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs',
                showFilterDrawer
                  ? 'bg-slate-100 border-slate-300 text-slate-900'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              )}
            >
              <Filter className="w-3.5 h-3.5 text-slate-600" />
              <span>Filters</span>
              {showFilterDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Add Button */}
          {addNewHref ? (
            <Link
              href={addNewHref}
              className="px-4 py-2 min-h-[40px] min-w-[40px] bg-[#204354] hover:bg-[#183442] active:bg-[#122733] text-white rounded-xl text-xs font-semibold shadow-2xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
              title={addNewLabel}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">{addNewLabel}</span>
            </Link>
          ) : onAddNew ? (
            <button
              onClick={onAddNew}
              className="px-4 py-2 min-h-[40px] min-w-[40px] bg-[#204354] hover:bg-[#183442] active:bg-[#122733] text-white rounded-xl text-xs font-semibold shadow-2xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
              title={addNewLabel}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">{addNewLabel}</span>
            </button>
          ) : null}

          {/* Export / Download Button */}
          <button
            onClick={handleDefaultExport}
            className="px-3.5 py-2 min-h-[40px] min-w-[40px] bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
            title="Download CSV Export"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {extraHeaderActions}
        </div>
      </div>

      {/* Advanced Filter Drawer (if active) */}
      {showFilterDrawer && filterDrawerContent && (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs animate-in slide-in-from-top-2 duration-150">
          {filterDrawerContent}
        </div>
      )}

      {/* 3. Sub-Toolbar: Columns, Filters, Density */}
      <div className="flex items-center gap-2 relative z-20">
        {/* Columns Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowColumnMenu(!showColumnMenu);
              setShowDensityMenu(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 shadow-2xs transition cursor-pointer"
          >
            <ColumnsIcon className="w-4 h-4 text-slate-500" />
            <span>Columns</span>
          </button>

          {showColumnMenu && (
            <div className="absolute left-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-30 space-y-1 text-xs">
              <div className="font-bold text-[10px] text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-100">
                Toggle Columns
              </div>
              <div className="max-h-60 overflow-y-auto space-y-0.5">
                {initialColumns.map((col) => {
                  const isVis = visibleColumnKeys[col.key] !== false;
                  return (
                    <label
                      key={col.key}
                      onClick={() => toggleColumn(col.key)}
                      className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-700"
                    >
                      <span>{col.header}</span>
                      <div
                        className={cn(
                          'w-4 h-4 rounded border flex items-center justify-center transition',
                          isVis ? 'bg-[#204354] border-[#204354] text-white' : 'border-slate-300 bg-white'
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

        {/* Density Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowDensityMenu(!showDensityMenu);
              setShowColumnMenu(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 shadow-2xs transition cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span>Density</span>
          </button>

          {showDensityMenu && (
            <div className="absolute left-0 top-full mt-1.5 w-36 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-30 space-y-0.5 text-xs">
              {(['compact', 'standard', 'relaxed'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setDensity(mode);
                    setShowDensityMenu(false);
                  }}
                  className={cn(
                    'w-full text-left px-2.5 py-1.5 rounded-lg font-medium capitalize flex items-center justify-between transition cursor-pointer',
                    density === mode
                      ? 'bg-slate-100 text-[#204354] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <span>{mode}</span>
                  {density === mode && <Check className="w-3.5 h-3.5 text-[#204354]" />}
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
                          const value = col.accessorKey
                            ? row[col.accessorKey]
                            : (row as any)[col.key];
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
                          <div className="flex items-center justify-center gap-1.5">
                            {onView && (
                              <button
                                onClick={() => onView(row)}
                                title="View Details"
                                className="min-w-[38px] min-h-[38px] p-2 flex items-center justify-center text-[#64748B] hover:text-[#7C3AED] hover:bg-purple-50 rounded-lg transition cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            {onEdit && (
                              <button
                                onClick={() => onEdit(row)}
                                title="Edit Record"
                                className="min-w-[38px] min-h-[38px] p-2 flex items-center justify-center text-[#475569] hover:text-[#7C3AED] hover:bg-purple-50 rounded-lg transition cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(row)}
                                title="Delete Record"
                                className="min-w-[38px] min-h-[38px] p-2 flex items-center justify-center text-[#64748B] hover:text-[#EF4444] hover:bg-rose-50 rounded-lg transition cursor-pointer"
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
                className="bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 min-h-[38px] text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#7C3AED] cursor-pointer"
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

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="min-w-[40px] min-h-[40px] p-2 flex items-center justify-center rounded-lg border border-[#E2E8F0] disabled:opacity-30 hover:bg-[#F1F5F9] text-[#64748B] transition cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="min-w-[40px] min-h-[40px] p-2 flex items-center justify-center rounded-lg border border-[#E2E8F0] disabled:opacity-30 hover:bg-[#F1F5F9] text-[#64748B] transition cursor-pointer"
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
