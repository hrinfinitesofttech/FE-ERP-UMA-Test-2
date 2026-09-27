'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { DataTable, Column } from '../../../components/data/DataTable';
import { StatusBadge } from '../../../components/workflow/StatusBadge';
import { JobTraceabilityRecord } from '../../../types/erp';
import { formatDate } from '../../../lib/utils';
import { Cpu, Search, Briefcase, Eye, Layers, Wrench, ShieldCheck, Truck, DollarSign } from 'lucide-react';

export default function JobManagementPage() {
  const { jobs, openJobModal, projectJobs } = useERP();
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredJobs = jobs.filter((j) => {
    if (statusFilter !== 'all' && j.currentStatus !== statusFilter) return false;
    return true;
  });

  const columns: Column<JobTraceabilityRecord>[] = [
    {
      header: 'Job Number (MTO Key)',
      accessorKey: 'jobNumber',
      cell: (j) => (
        <button
          onClick={() => openJobModal(j.jobNumber)}
          className="font-mono font-bold text-crm-brand-700 dark:text-crm-brand-500 bg-crm-brand-600/10 px-2.5 py-1 rounded-lg border border-crm-brand-600/20 text-xs hover:bg-crm-brand-600/20 transition cursor-pointer"
        >
          {j.jobNumber}
        </button>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'customerName',
      cell: (j) => <span className="font-bold text-slate-900 dark:text-[#211B17]">{j.customerName}</span>,
    },
    {
      header: 'Machine / Equipment',
      cell: (j) => (
        <div className="max-w-xs">
          <span className="font-bold text-slate-800 dark:text-[#544B45] block truncate">{j.productName}</span>
          <span className="text-[10px] text-[#70665F] block truncate">{j.specification}</span>
        </div>
      ),
    },
    {
      header: 'Target Delivery',
      cell: (j) => <span className="font-mono text-slate-600 dark:text-[#544B45] text-[11px]">{formatDate(j.targetDeliveryDate)}</span>,
    },
    {
      header: 'Connected Traceability',
      cell: (j) => (
        <div className="text-[10px] font-mono space-y-0.5">
          <div className="text-[#70665F]">SO: {j.salesOrderId} | PO: {j.customerPoNumber}</div>
          <div className="text-crm-brand-600 font-bold">BOM: {j.linkedRecords.bomId}</div>
        </div>
      ),
    },
    {
      header: 'Progress',
      cell: (j) => (
        <div className="w-24">
          <div className="flex justify-between text-[10px] font-mono mb-1">
            <span className="text-[#70665F]">Progress</span>
            <span className="font-bold text-crm-brand-600">{j.progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-[#FAF7F2] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-crm-brand-700 to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${j.progressPercent}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (j) => <StatusBadge status={j.currentStatus} />,
    },
    {
      header: 'Actions',
      cell: (j) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openJobModal(j.jobNumber)}
            className="px-3 py-1.5 bg-crm-brand-700 hover:bg-crm-brand-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-crm-brand-700/30 transition cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>360° View</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 text-xs pb-10">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-600/10 text-crm-brand-600 font-mono text-[10px] font-bold uppercase tracking-wider border border-crm-brand-600/20">
              Manufacturing Job Registry
            </span>
          </div>
          <h1 className="text-lg font-black text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-crm-brand-700" />
            Make-to-Order (MTO) Job Management
          </h1>
          <p className="text-[#70665F] dark:text-[#70665F] mt-0.5">
            The Job Number is the single common identifier across CRM, Design, Purchase, Store, Production, QC, Dispatch, and Service.
          </p>
        </div>
      </div>

      {/* Jobs Table */}
      <DataTable
        title="360° Connected MTO Manufacturing Jobs"
        subtitle={`Total ${filteredJobs.length} Jobs active`}
        columns={columns}
        data={filteredJobs}
        searchPlaceholder="Search by Job #, Customer, Machine..."
        onRowClick={(j) => openJobModal(j.jobNumber)}
        filterComponent={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#FAF7F2] border border-[#E7DED5] rounded-full text-xs font-semibold focus:outline-none focus:border-[#75401F] text-[#211B17]"
          >
            <option value="all">All Job Statuses</option>
            <option value="planning">Planning</option>
            <option value="design">Design</option>
            <option value="production">Production</option>
            <option value="qc">QC</option>
            <option value="completed">Completed</option>
          </select>
        }
      />
    </div>
  );
}
