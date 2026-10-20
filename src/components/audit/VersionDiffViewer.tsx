'use client';

import React, { useState, useMemo } from 'react';
import {
  GitCommit,
  GitCompare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  PlusCircle,
  MinusCircle,
  Edit3,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  Layers,
  X,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  DocumentVersionMetadata,
  VersionComparisonResult,
  FieldDiff,
  LineItemDiff,
} from '@/types/versioning';
import { compareRevisions } from '@/lib/versionDiff';

export interface VersionDiffViewerProps {
  title?: string;
  subtitle?: string;
  versions: { meta: DocumentVersionMetadata; data: any }[];
  currentVersionIndex?: number;
  onRestoreVersion?: (version: DocumentVersionMetadata) => void;
  onClose?: () => void;
}

export function VersionDiffViewer({
  title = 'Version History & Data Diff',
  subtitle = 'Compare changes across releases, line items, and financial values',
  versions,
  currentVersionIndex,
  onRestoreVersion,
  onClose,
}: VersionDiffViewerProps) {
  // Sort latest first
  const sortedVersions = useMemo(() => {
    return [...versions].sort((a, b) => b.meta.versionIndex - a.meta.versionIndex);
  }, [versions]);

  // Default selection: compare newest version with immediately preceding version
  const [targetIdx, setTargetIdx] = useState<number>(0);
  const [sourceIdx, setSourceIdx] = useState<number>(() =>
    sortedVersions.length > 1 ? 1 : 0
  );

  const [activeTab, setActiveTab] = useState<'UNIFIED' | 'LINE_ITEMS' | 'FIELDS'>('UNIFIED');

  const versionSource = sortedVersions[sourceIdx] || sortedVersions[0];
  const versionTarget = sortedVersions[targetIdx] || sortedVersions[0];

  // Compute diff dynamically using engine
  const diffResult: VersionComparisonResult = useMemo(() => {
    return compareRevisions(versionSource, versionTarget, {
      itemsKey: 'items',
      itemIdentityKey: 'id',
    });
  }, [versionSource, versionTarget]);

  const { macroDiff, fieldDiffs, lineItemDiffs } = diffResult;
  const lineItems = lineItemDiffs[0]?.items || [];
  const lineItemSummary = lineItemDiffs[0]?.summary || { added: 0, removed: 0, modified: 0, unchanged: 0 };

  const formatFieldValue = (val: any, type: FieldDiff['type']) => {
    if (val === null || val === undefined || val === '') return <span className="text-slate-400 italic">None</span>;
    if (type === 'CURRENCY') return <span className="font-mono font-semibold">{formatCurrency(Number(val))}</span>;
    if (type === 'BOOLEAN') return val ? 'Yes' : 'No';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-[#EBE3DB] bg-gradient-to-r from-slate-50 to-white dark:from-[#FAF7F2] dark:to-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-crm-brand-50 border border-crm-brand-200 flex items-center justify-center text-crm-brand-700">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
              {title}
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-normal">
                {versions.length} versions recorded
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#70665F]">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRestoreVersion && versionSource && (
            <button
              onClick={() => onRestoreVersion(versionSource.meta)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore {versionSource.meta.versionNumber}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Version Selector Bar (Level 1: Macro Comparison Controls) */}
      <div className="px-6 py-3.5 bg-slate-100/70 dark:bg-[#F5F0E9] border-b border-slate-200 dark:border-[#EBE3DB] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Baseline Version (A) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-[#70665F]">Base:</span>
            <select
              value={sourceIdx}
              onChange={(e) => setSourceIdx(Number(e.target.value))}
              aria-label="Select base version"
              className="text-xs font-medium bg-white dark:bg-white border border-slate-300 dark:border-[#D9CFC4] rounded-lg px-2.5 py-1.5 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-crm-brand-500"
            >
              {sortedVersions.map((v, idx) => (
                <option key={v.meta.id || idx} value={idx}>
                  {v.meta.versionNumber} • {v.meta.label || v.meta.status} ({v.meta.createdAt.split('T')[0]})
                </option>
              ))}
            </select>
          </div>

          <div className="text-slate-400">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Compared Target Version (B) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-[#70665F]">Compared To:</span>
            <select
              value={targetIdx}
              onChange={(e) => setTargetIdx(Number(e.target.value))}
              aria-label="Select compared version"
              className="text-xs font-medium bg-white dark:bg-white border border-slate-300 dark:border-[#D9CFC4] rounded-lg px-2.5 py-1.5 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-crm-brand-500"
            >
              {sortedVersions.map((v, idx) => (
                <option key={v.meta.id || idx} value={idx}>
                  {v.meta.versionNumber} • {v.meta.label || v.meta.status} ({v.meta.createdAt.split('T')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center bg-white dark:bg-white p-1 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
          <button
            onClick={() => setActiveTab('UNIFIED')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              activeTab === 'UNIFIED'
                ? 'bg-crm-brand-700 text-white shadow'
                : 'text-slate-600 dark:text-[#70665F] hover:bg-slate-50'
            }`}
          >
            Unified Overview
          </button>
          <button
            onClick={() => setActiveTab('LINE_ITEMS')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'LINE_ITEMS'
                ? 'bg-crm-brand-700 text-white shadow'
                : 'text-slate-600 dark:text-[#70665F] hover:bg-slate-50'
            }`}
          >
            Line Items ({lineItemSummary.added + lineItemSummary.removed + lineItemSummary.modified})
          </button>
          <button
            onClick={() => setActiveTab('FIELDS')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              activeTab === 'FIELDS'
                ? 'bg-crm-brand-700 text-white shadow'
                : 'text-slate-600 dark:text-[#70665F] hover:bg-slate-50'
            }`}
          >
            Header Fields ({fieldDiffs.length})
          </button>
        </div>
      </div>

      {/* Level 1: Macro Financial & Delta Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-6 bg-slate-50/50 dark:bg-[#FAF7F2]/50 border-b border-slate-200 dark:border-[#EBE3DB]">
        {/* Net Financial Impact */}
        <div className="bg-white dark:bg-white p-3.5 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Financial Impact
          </span>
          {macroDiff.financialDifference ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-slate-900 font-mono">
                  {formatCurrency(macroDiff.financialDifference.newAmount)}
                </span>
                <span
                  className={`text-xs font-semibold flex items-center gap-0.5 ${
                    macroDiff.financialDifference.diffAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {macroDiff.financialDifference.diffAmount >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {macroDiff.financialDifference.diffAmount >= 0 ? '+' : ''}
                  {formatCurrency(macroDiff.financialDifference.diffAmount)}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                Was {formatCurrency(macroDiff.financialDifference.oldAmount)} (
                {macroDiff.financialDifference.percentageChange.toFixed(1)}%)
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-500">No monetary fields</span>
          )}
        </div>

        {/* Status Evolution */}
        <div className="bg-white dark:bg-white p-3.5 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Status Transition
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
              {macroDiff.oldStatus}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-crm-brand-50 text-crm-brand-800 border border-crm-brand-200">
              {macroDiff.newStatus}
            </span>
          </div>
        </div>

        {/* Line Items Summary (Meso) */}
        <div className="bg-white dark:bg-white p-3.5 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Line Items Diff
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-1.5 py-0.5 text-[11px] font-bold rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <PlusCircle className="w-3 h-3" /> +{lineItemSummary.added}
            </span>
            <span className="px-1.5 py-0.5 text-[11px] font-bold rounded bg-rose-100 text-rose-800 flex items-center gap-1">
              <MinusCircle className="w-3 h-3" /> -{lineItemSummary.removed}
            </span>
            <span className="px-1.5 py-0.5 text-[11px] font-bold rounded bg-amber-100 text-amber-800 flex items-center gap-1">
              <Edit3 className="w-3 h-3" /> ~{lineItemSummary.modified}
            </span>
          </div>
        </div>

        {/* Author & Timestamp (Audit Context) */}
        <div className="bg-white dark:bg-white p-3.5 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Revision Author
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
            <User className="w-3.5 h-3.5 text-crm-brand-700" />
            <span>{versionTarget.meta.createdBy.userName}</span>
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
            <Calendar className="w-3 h-3" /> {versionTarget.meta.createdAt.replace('T', ' ').substring(0, 16)}
          </span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* TAB 1: UNIFIED OVERVIEW */}
        {activeTab === 'UNIFIED' && (
          <div className="space-y-6">
            {/* Header Fields Changed */}
            {fieldDiffs.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-crm-brand-700" /> Modified Attributes ({fieldDiffs.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fieldDiffs.map((diff) => (
                    <div
                      key={diff.path}
                      className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 dark:bg-amber-50/20 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-800">{diff.fieldLabel}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          {diff.category || 'attribute'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex-1 p-2 rounded bg-rose-50 border border-rose-200 text-rose-800 line-through">
                          {formatFieldValue(diff.oldValue, diff.type)}
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div className="flex-1 p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                          {formatFieldValue(diff.newValue, diff.type)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Line Items Table Diff Preview */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-crm-brand-700" /> Items & Bill of Materials ({lineItems.length})
              </h3>
              <div className="border border-slate-200 dark:border-[#EBE3DB] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-[#FAF7F2] text-slate-700 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="p-3 w-28">Status</th>
                      <th className="p-3">Item / Description</th>
                      <th className="p-3 text-right">Quantity</th>
                      <th className="p-3 text-right">Rate (₹)</th>
                      <th className="p-3 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lineItems.map((item) => {
                      const isAdded = item.diffType === 'ADDED';
                      const isRemoved = item.diffType === 'REMOVED';
                      const isModified = item.diffType === 'MODIFIED';

                      const rowBg = isAdded
                        ? 'bg-emerald-50/70 hover:bg-emerald-100/50'
                        : isRemoved
                        ? 'bg-rose-50/70 hover:bg-rose-100/50 opacity-75'
                        : isModified
                        ? 'bg-amber-50/70 hover:bg-amber-100/50'
                        : 'hover:bg-slate-50';

                      const displayItem = item.newItem || item.oldItem || {};

                      return (
                        <tr key={item.id} className={`${rowBg} transition`}>
                          <td className="p-3">
                            {isAdded && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-max">
                                <PlusCircle className="w-3 h-3" /> Added
                              </span>
                            )}
                            {isRemoved && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 w-max">
                                <MinusCircle className="w-3 h-3" /> Removed
                              </span>
                            )}
                            {isModified && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 w-max">
                                <Edit3 className="w-3 h-3" /> Modified
                              </span>
                            )}
                            {!isAdded && !isRemoved && !isModified && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-100">
                                Unchanged
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-medium text-slate-900">
                            {displayItem.productName || displayItem.itemName || item.keyIdentifier}
                            {displayItem.description && (
                              <p className="text-[11px] text-slate-500 font-normal">{displayItem.description}</p>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono">
                            {isModified && item.oldItem?.quantity !== item.newItem?.quantity ? (
                              <span className="flex items-center justify-end gap-1.5">
                                <del className="text-rose-600">{item.oldItem?.quantity}</del>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <ins className="text-emerald-700 font-bold no-underline">{item.newItem?.quantity}</ins>
                              </span>
                            ) : (
                              displayItem.quantity || '—'
                            )}
                          </td>
                          <td className="p-3 text-right font-mono">
                            {isModified && item.oldItem?.rate !== item.newItem?.rate ? (
                              <span className="flex items-center justify-end gap-1.5">
                                <del className="text-rose-600">{formatCurrency(item.oldItem?.rate)}</del>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <ins className="text-emerald-700 font-bold no-underline">{formatCurrency(item.newItem?.rate)}</ins>
                              </span>
                            ) : (
                              formatCurrency(displayItem.rate || 0)
                            )}
                          </td>
                          <td className="p-3 text-right font-mono font-semibold">
                            {isModified && item.oldItem?.amount !== item.newItem?.amount ? (
                              <span className="flex items-center justify-end gap-1.5">
                                <del className="text-rose-600 font-normal">{formatCurrency(item.oldItem?.amount)}</del>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <ins className="text-emerald-700 font-bold no-underline">{formatCurrency(item.newItem?.amount)}</ins>
                              </span>
                            ) : (
                              formatCurrency(displayItem.amount || 0)
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LINE ITEMS FULL VIEW */}
        {activeTab === 'LINE_ITEMS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Showing all line items with change indicators</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Added ({lineItemSummary.added})
                </span>
                <span className="flex items-center gap-1 text-rose-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Removed ({lineItemSummary.removed})
                </span>
                <span className="flex items-center gap-1 text-amber-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Modified ({lineItemSummary.modified})
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {lineItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition ${
                    item.diffType === 'ADDED'
                      ? 'border-emerald-300 bg-emerald-50/50'
                      : item.diffType === 'REMOVED'
                      ? 'border-rose-300 bg-rose-50/50'
                      : item.diffType === 'MODIFIED'
                      ? 'border-amber-300 bg-amber-50/50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{item.keyIdentifier}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase">
                        {item.diffType}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {formatCurrency(item.newItem?.amount || item.oldItem?.amount || 0)}
                    </span>
                  </div>

                  {item.fieldChanges && item.fieldChanges.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs pt-2 border-t border-amber-200/60">
                      {item.fieldChanges.map((fc) => (
                        <div key={fc.path} className="p-2 bg-white rounded-lg border border-amber-200">
                          <span className="text-[10px] font-bold text-slate-500 block">{fc.fieldLabel}</span>
                          <div className="flex items-center gap-1.5 font-mono text-[11px] mt-0.5">
                            <span className="text-rose-600 line-through">{String(fc.oldValue)}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className="text-emerald-700 font-bold">{String(fc.newValue)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: HEADER FIELDS */}
        {activeTab === 'FIELDS' && (
          <div className="space-y-3">
            {fieldDiffs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No header field differences between these two versions.
              </div>
            ) : (
              fieldDiffs.map((diff) => (
                <div key={diff.path} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{diff.fieldLabel}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">Field: {diff.path}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 line-through">
                      {formatFieldValue(diff.oldValue, diff.type)}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <div className="text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-bold">
                      {formatFieldValue(diff.newValue, diff.type)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Milestone Tag */}
      <div className="px-6 py-3 border-t border-slate-200 dark:border-[#EBE3DB] bg-slate-50 dark:bg-[#FAF7F2] flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <GitCommit className="w-3.5 h-3.5 text-crm-brand-700" />
          <span>
            Target: <strong>{versionTarget.meta.versionNumber}</strong> • Base: <strong>{versionSource.meta.versionNumber}</strong>
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">
          Generated via UMA ERP Diff Engine (RFC 6902 Compliant)
        </span>
      </div>
    </div>
  );
}
