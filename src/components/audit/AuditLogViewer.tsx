'use client';

import React from 'react';
import { useERP } from '../../context/ERPContext';
import { Shield, Clock, ArrowRight, User } from 'lucide-react';
import { formatDateTime } from '../../lib/utils';

export function AuditLogViewer() {
  const { auditLogs } = useERP();

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'APPROVE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'REJECT':
      case 'DELETE':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'CREATE':
        return 'bg-crm-brand- text-crm-brand- border-crm-brand-';
      case 'UPDATE':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'LOGIN':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="bg-white dark:bg-white rounded-xl border border-slate-200 dark:border-[color:var(--crm-border-default)] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-[color:var(--crm-border-default)] flex items-center justify-between bg-slate-50/60 dark:bg-[color:var(--crm-bg-app)]">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-crm-brand-700" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-[color:var(--crm-text-primary)]">Live Enterprise Audit Log</h3>
        </div>
        <span className="text-[11px] font-mono text-[color:var(--crm-text-secondary)]">Immutable Trail</span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-[color:var(--crm-border-default)] max-h-80 overflow-y-auto text-xs">
        {auditLogs.map((log) => (
          <div key={log.id} className="p-3 hover:bg-slate-50/60 dark:hover:bg-[#F4F6FA]/40 transition">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getActionBadge(log.action)}`}>
                  {log.action}
                </span>
                <span className="font-semibold text-slate-800 dark:text-[color:var(--crm-text-secondary)]">{log.module} • {log.page}</span>
              </div>
              <span className="text-[10px] text-[color:var(--crm-text-secondary)] font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatDateTime(log.timestamp)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-[color:var(--crm-text-secondary)]">
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-[color:var(--crm-text-secondary)]" />
                <span className="font-medium text-slate-700 dark:text-[color:var(--crm-text-secondary)]">{log.userName}</span>
                <span className="text-[10px] text-[color:var(--crm-text-secondary)]">({log.role?.replace('_', ' ')})</span>
              </div>
              <span className="font-mono text-crm-brand-700 dark:text-crm-brand-500">{log.recordId}</span>
            </div>

            {log.notes && (
              <div className="mt-1 text-[11px] text-[color:var(--crm-text-secondary)] bg-slate-50 dark:bg-[#F4F6FA]/60 p-1.5 rounded border border-slate-100 dark:border-[color:var(--crm-border-default)]">
                {log.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
