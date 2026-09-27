'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { DataTable, Column } from '../../../components/data/DataTable';
import { AuditLogEntry } from '../../../types/erp';
import { formatDateTime } from '../../../lib/utils';
import { History, Shield, Clock, User, Filter } from 'lucide-react';

export default function AuditLogsPage() {
  const { auditLogs } = useERP();
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (selectedAction !== 'all' && log.action !== selectedAction) return false;
    if (selectedModule !== 'all' && !log.module?.toLowerCase().includes(selectedModule?.toLowerCase())) return false;
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
        return 'bg-crm-brand- text-crm-brand- border-crm-brand-';
      case 'UPDATE':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'LOGIN':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const columns: Column<AuditLogEntry>[] = [
    {
      header: 'Timestamp',
      cell: (log) => (
        <div className="font-mono text-[#70665F] flex items-center gap-1.5 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-[#70665F]" />
          <span>{formatDateTime(log.timestamp)}</span>
        </div>
      ),
    },
    {
      header: 'User & Role',
      cell: (log) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-[#211B17] block">{log.userName}</span>
          <span className="text-[10px] text-[#70665F] uppercase font-mono">{log.role?.replace('_', ' ')}</span>
        </div>
      ),
    },
    {
      header: 'Action',
      cell: (log) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getActionBadge(log.action)}`}>
          {log.action}
        </span>
      ),
    },
    {
      header: 'Module & Page',
      cell: (log) => (
        <div>
          <span className="font-semibold text-slate-800 dark:text-[#544B45] block">{log.module}</span>
          <span className="text-[11px] text-[#70665F]">{log.page}</span>
        </div>
      ),
    },
    {
      header: 'Target Record ID',
      cell: (log) => (
        <span className="font-mono font-bold text-crm-brand-700 dark:text-crm-brand-500">{log.recordId}</span>
      ),
    },
    {
      header: 'Activity Log & Notes',
      cell: (log) => (
        <div className="max-w-xs truncate text-[11px] text-slate-600 dark:text-[#70665F]">
          {log.notes || log.newValue || log.oldValue || 'Action performed'}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <h1 className="text-lg font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
          <History className="w-5 h-5 text-crm-brand-700" />
          Immutable Enterprise Audit Log Trail
        </h1>
        <p className="text-[#70665F] mt-0.5">
          Read-only audit record tracking CREATE, UPDATE, DELETE, APPROVE, REJECT, and LOGIN activities.
        </p>
      </div>

      <DataTable
        title="System Event Trail"
        subtitle={`Total ${filteredLogs.length} Logged Audit Events`}
        columns={columns}
        data={filteredLogs}
        filterComponent={
          <div className="flex items-center gap-2">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-[#FAF7F2] border rounded-lg"
            >
              <option value="all">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="APPROVE">APPROVE</option>
              <option value="REJECT">REJECT</option>
              <option value="DELETE">DELETE</option>
              <option value="LOGIN">LOGIN</option>
            </select>
          </div>
        }
      />
    </div>
  );
}
