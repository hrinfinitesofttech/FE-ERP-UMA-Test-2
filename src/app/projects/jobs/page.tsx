'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { StatusBadge } from '../../../components/workflow/StatusBadge';
import { JobTraceabilityRecord } from '../../../types/erp';
import { formatDate } from '../../../lib/utils';
import { Cpu } from 'lucide-react';

export default function JobManagementPage() {
  const { jobs, openJobModal, projectJobs } = useERP();
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredJobs = jobs.filter((j) => {
    if (statusFilter !== 'all' && j.currentStatus !== statusFilter) return false;
    return true;
  });

  const columns: ERPColumn<JobTraceabilityRecord>[] = [
    {
      key: 'jobNumber',
      header: 'Job Number (MTO Key)',
      isCodeLink: true,
      onCodeClick: (j) => openJobModal(j.jobNumber),
      cell: (j) => (
        <span className="font-mono font-bold text-[#7C3AED] hover:underline cursor-pointer">
          {j.jobNumber}
        </span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      cell: (j) => <span className="font-bold text-slate-900">{j.customerName}</span>,
    },
    {
      key: 'productName',
      header: 'Machine / Equipment',
      cell: (j) => (
        <div className="max-w-xs">
          <span className="font-bold text-slate-800 block truncate">{j.productName}</span>
          <span className="text-[10px] text-slate-500 block truncate">{j.specification}</span>
        </div>
      ),
    },
    {
      key: 'targetDeliveryDate',
      header: 'Target Delivery',
      cell: (j) => <span className="font-mono text-slate-600 text-[11px]">{formatDate(j.targetDeliveryDate)}</span>,
    },
    {
      key: 'linkedRecords',
      header: 'Connected Traceability',
      cell: (j) => (
        <div className="text-[10px] font-mono space-y-0.5">
          <div className="text-slate-500">SO: {j.salesOrderId} | PO: {j.customerPoNumber}</div>
          <div className="text-[#7C3AED] font-bold">BOM: {j.linkedRecords?.bomId || 'N/A'}</div>
        </div>
      ),
    },
    {
      key: 'progressPercent',
      header: 'Progress',
      cell: (j) => (
        <div className="w-24">
          <div className="flex justify-between text-[10px] font-mono mb-1">
            <span className="text-slate-500">Progress</span>
            <span className="font-bold text-[#7C3AED]">{j.progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#7C3AED] to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${j.progressPercent}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'currentStatus',
      header: 'Status',
      cell: (j) => <StatusBadge status={j.currentStatus} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (j) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => openJobModal(j.jobNumber)}
            className="px-2.5 py-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>360° View</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Status Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'planning', 'design', 'production', 'qc', 'completed'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#7C3AED] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Job Statuses' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Shasvatm ERP Standard List View */}
      <ERPListPageLayout<JobTraceabilityRecord>
        breadcrumbs={['DASHBOARD', 'PROJECTS', 'JOB CARDS & TRACEABILITY']}
        columns={columns}
        data={filteredJobs}
        onExport={() => {
          const csv = [
            ['Job Number', 'Customer', 'Product', 'Target Delivery', 'SO Number', 'Customer PO', 'Progress %', 'Status'].join(','),
            ...filteredJobs.map(j => [
              `"${j.jobNumber}"`,
              `"${(j.customerName || '').replace(/"/g, '""')}"`,
              `"${(j.productName || '').replace(/"/g, '""')}"`,
              j.targetDeliveryDate || '',
              `"${j.salesOrderId || ''}"`,
              `"${j.customerPoNumber || ''}"`,
              j.progressPercent || 0,
              j.currentStatus || ''
            ].join(','))
          ].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `mto_jobs_${new Date().toISOString().slice(0, 10)}.csv`;
          a.click();
        }}
        searchPlaceholder="Search by Job #, Customer, Machine, SO..."
      />
    </div>
  );
}
