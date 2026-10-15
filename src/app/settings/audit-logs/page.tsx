'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { AuditLogEntry } from '../../../types/erp';
import { formatDateTime } from '../../../lib/utils';
import { Clock } from 'lucide-react';

export default function AuditLogsPage() {
  const { auditLogs } = useERP();
  const [selectedAction, setSelectedAction] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (selectedAction !== 'all' && log.action !== selectedAction) return false;
    return true;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'APPROVE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'REJECT':
      case 'DELETE':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'CREATE':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'UPDATE':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'LOGIN':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const columns: ERPColumn<AuditLogEntry>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      cell: (log) => (
        <div className="font-mono text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDateTime(log.timestamp)}</span>
        </div>
      ),
    },
    {
      key: 'userName',
      header: 'User & Role',
      cell: (log) => (
        <div>
          <span className="font-bold text-slate-900 block">{log.userName}</span>
          <span className="text-[10px] text-slate-500 uppercase font-mono">{log.role?.replace(/_/g, ' ')}</span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      cell: (log) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getActionBadge(log.action)}`}>
          {log.action}
        </span>
      ),
    },
    {
      key: 'module',
      header: 'Module & Page',
      cell: (log) => (
        <div>
          <span className="font-semibold text-slate-800 block">{log.module}</span>
          <span className="text-[11px] text-slate-500">{log.page}</span>
        </div>
      ),
    },
    {
      key: 'recordId',
      header: 'Target Record ID',
      cell: (log) => (
        <span className="font-mono font-bold text-[#7C3AED]">{log.recordId}</span>
      ),
    },
    {
      key: 'notes',
      header: 'Activity Log & Notes',
      cell: (log) => (
        <div className="max-w-xs truncate text-[11px] text-slate-600">
          {log.notes || log.newValue || log.oldValue || 'Action performed'}
        </div>
      ),
    },
  ];

  const actionsList = ['all', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN'] as const;

  return (
    <div className="space-y-4">
      {/* Action Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase px-1">Action:</span>
          {actionsList.map((act) => (
            <button
              key={act}
              type="button"
              onClick={() => setSelectedAction(act)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                selectedAction === act
                  ? 'bg-[#7C3AED] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* Main Shasvatm ERP Standard List View */}
      <ERPListPageLayout<AuditLogEntry>
        breadcrumbs={['DASHBOARD', 'SETTINGS', 'ENTERPRISE AUDIT TRAIL']}
        columns={columns}
        data={filteredLogs}
        onExport={() => {
          const csv = [
            ['Timestamp', 'User', 'Role', 'Action', 'Module', 'Page', 'Record ID', 'Notes'].join(','),
            ...filteredLogs.map(l => [
              `"${l.timestamp}"`,
              `"${(l.userName || '').replace(/"/g, '""')}"`,
              `"${l.role || ''}"`,
              `"${l.action || ''}"`,
              `"${l.module || ''}"`,
              `"${l.page || ''}"`,
              `"${l.recordId || ''}"`,
              `"${(l.notes || l.newValue || l.oldValue || '').replace(/"/g, '""')}"`
            ].join(','))
          ].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
          a.click();
        }}
        searchPlaceholder="Search audit records by user, target ID, module, remarks..."
      />
    </div>
  );
}
