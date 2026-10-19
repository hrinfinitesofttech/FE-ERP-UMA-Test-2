'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { AuditLogEntry } from '../../../types/erp';
import { formatDateTime } from '../../../lib/utils';
import { Clock } from 'lucide-react';
import { VersionDiffViewer } from '../../../components/audit/VersionDiffViewer';

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

  const [viewMode, setViewMode] = useState<'RAW_LOGS' | 'VERSION_DIFF'>('RAW_LOGS');

  // Sample production revision data demonstrating Level 1, Level 2, Level 3 diffs
  const SAMPLE_REVISIONS = [
    {
      meta: {
        id: 'rev-00',
        versionNumber: 'Rev-00 (Initial Quote)',
        versionIndex: 1,
        label: 'Initial Draft Created',
        createdAt: '2026-10-10T10:30:00Z',
        createdBy: { userId: 'u1', userName: 'Rajesh Sharma', role: 'Sales Executive' },
        isMilestone: true,
        status: 'draft',
      },
      data: {
        grandTotal: 450000,
        subTotal: 381356,
        taxAmount: 68644,
        paymentTerms: '100% Advance Payment',
        deliveryTime: '4 Weeks from PO',
        warranty: '12 Months standard warranty',
        status: 'draft',
        items: [
          { id: 'item-1', productName: 'SS304 Reactor Vessel 500L', quantity: 2, rate: 150000, amount: 300000 },
          { id: 'item-2', productName: 'Teflon Mechanical Seal 45mm', quantity: 2, rate: 25000, amount: 50000 },
          { id: 'item-3', productName: 'Digital Pressure Transmitter', quantity: 2, rate: 15678, amount: 31356 },
        ],
      },
    },
    {
      meta: {
        id: 'rev-01',
        versionNumber: 'Rev-01 (Client Review)',
        versionIndex: 2,
        label: 'Added Spares & Updated Terms',
        createdAt: '2026-10-14T14:15:00Z',
        createdBy: { userId: 'u2', userName: 'Pooja Verma', role: 'Sales Manager' },
        isMilestone: true,
        status: 'internal_review',
      },
      data: {
        grandTotal: 520000,
        subTotal: 440678,
        taxAmount: 79322,
        paymentTerms: '50% Advance, 50% Against Proforma',
        deliveryTime: '5 Weeks from PO',
        warranty: '18 Months comprehensive warranty',
        status: 'internal_review',
        items: [
          { id: 'item-1', productName: 'SS304 Reactor Vessel 500L', quantity: 2, rate: 145000, amount: 290000 },
          { id: 'item-2', productName: 'Teflon Mechanical Seal 45mm', quantity: 4, rate: 25000, amount: 100000 },
          { id: 'item-4', productName: 'Flange Gasket Kit High Temp', quantity: 10, rate: 5067, amount: 50678 },
        ],
      },
    },
    {
      meta: {
        id: 'rev-02',
        versionNumber: 'Rev-02 (Final Approved)',
        versionIndex: 3,
        label: 'Approved by Management',
        createdAt: '2026-10-18T16:45:00Z',
        createdBy: { userId: 'u3', userName: 'Anil Mehta', role: 'Director' },
        isMilestone: true,
        status: 'approved',
      },
      data: {
        grandTotal: 510000,
        subTotal: 432203,
        taxAmount: 77797,
        paymentTerms: '30% Advance, 70% Net 30 Days',
        deliveryTime: '4-5 Weeks',
        warranty: '24 Months extended warranty',
        status: 'approved',
        items: [
          { id: 'item-1', productName: 'SS304 Reactor Vessel 500L', quantity: 2, rate: 145000, amount: 290000 },
          { id: 'item-2', productName: 'Teflon Mechanical Seal 45mm', quantity: 4, rate: 23000, amount: 92000 },
          { id: 'item-4', productName: 'Flange Gasket Kit High Temp', quantity: 10, rate: 5020, amount: 50203 },
        ],
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Mode Switcher */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('RAW_LOGS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'RAW_LOGS'
                ? 'bg-crm-brand-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Raw Audit Log Entries
          </button>
          <button
            type="button"
            onClick={() => setViewMode('VERSION_DIFF')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'VERSION_DIFF'
                ? 'bg-crm-brand-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Revision Comparator & Visual Diff</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 font-mono">
              Figma / Sheets UI
            </span>
          </button>
        </div>

        {viewMode === 'RAW_LOGS' && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase px-1">Action:</span>
            {actionsList.map((act) => (
              <button
                key={act}
                type="button"
                onClick={() => setSelectedAction(act)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                  selectedAction === act
                    ? 'bg-crm-brand-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {act}
              </button>
            ))}
          </div>
        )}
      </div>

      {viewMode === 'VERSION_DIFF' ? (
        <VersionDiffViewer
          title="Quotation & Order Revision Comparator"
          subtitle="Multi-level comparison: Financial macros, line item tables, and field-level deltas (Level 1 to 3)"
          versions={SAMPLE_REVISIONS}
        />
      ) : (
        /* Main Shasvatm ERP Standard List View */
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
      )}
    </div>
  );
}
