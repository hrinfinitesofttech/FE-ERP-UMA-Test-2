'use client';

import React, { useState } from 'react';
import { Clock, User, ArrowRight, History, X } from 'lucide-react';
import { SingleFieldHistoryEntry } from '@/types/versioning';
import { formatDateTime } from '@/lib/utils';

export interface FieldHistoryTooltipProps {
  fieldName: string;
  fieldLabel: string;
  historyEntries?: SingleFieldHistoryEntry[];
  children?: React.ReactNode;
}

export function FieldHistoryTooltip({
  fieldName,
  fieldLabel,
  historyEntries = [],
  children,
}: FieldHistoryTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!historyEntries || historyEntries.length === 0) {
    return <>{children}</>;
  }

  return (
    <div className="relative inline-block group">
      <div className="flex items-center gap-1">
        {children}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title={`View edit history for ${fieldLabel}`}
          className="p-0.5 rounded text-slate-400 hover:text-crm-brand-700 hover:bg-crm-brand-50 transition"
        >
          <History className="w-3.5 h-3.5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 mt-1 w-72 bg-white dark:bg-white rounded-xl shadow-xl border border-slate-200 dark:border-[#EBE3DB] p-3 text-xs animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <History className="w-3.5 h-3.5 text-crm-brand-700" />
              <span>Edit History: {fieldLabel}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded hover:bg-slate-100 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-48 overflow-y-auto divide-y divide-slate-100">
            {historyEntries.map((entry) => (
              <div key={entry.id} className="pt-2 first:pt-0">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <User className="w-3 h-3 text-crm-brand-700" />
                    {entry.changedBy.userName}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDateTime(entry.changedAt)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[11px] bg-slate-50 p-1.5 rounded border border-slate-100">
                  <span className="text-rose-600 line-through truncate max-w-[80px]">
                    {String(entry.oldValue ?? 'Empty')}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="text-emerald-700 font-bold truncate max-w-[80px]">
                    {String(entry.newValue ?? 'Empty')}
                  </span>
                  <span className="ml-auto text-[9px] font-sans px-1 py-0.2 bg-slate-200 text-slate-700 rounded">
                    {entry.versionNumber}
                  </span>
                </div>

                {entry.reason && (
                  <p className="text-[10px] text-slate-500 italic mt-1 bg-amber-50/50 p-1 rounded">
                    &quot;{entry.reason}&quot;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
