'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { DataTable, Column } from '../../../components/data/DataTable';
import { StatusBadge } from '../../../components/workflow/StatusBadge';
import { Quotation } from '../../../types/crm';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { FileCheck2, Plus, ArrowUpRight, Sparkles, Layers } from 'lucide-react';

export default function QuotationsListPage() {
  const router = useRouter();
  const { quotations } = useERP();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getSummary = (q: Quotation) => {
    if (q.latestSummary) return q.latestSummary;
    const revs = q.revisions || [];
    const lastRev = revs[revs.length - 1];
    return {
      machineProduct: lastRev?.items?.[0]?.productName || 'Process Equipment',
      grandTotal: lastRev?.grandTotal || 0,
      status: lastRev?.status || 'draft',
    };
  };

  const filteredQuotations = quotations.filter((q) => {
    const summary = getSummary(q);
    if (statusFilter !== 'all' && summary.status !== statusFilter) return false;
    return true;
  });

  const columns: Column<Quotation>[] = [
    {
      header: 'QUOTATION #',
      accessorKey: 'quotationNumber',
      exportValue: (q) => q.quotationNumber,
      cell: (q) => (
        <span className="font-mono font-bold text-[#0E91B2] bg-[#E0F2FE] px-2.5 py-1 rounded-lg border border-[#BAE6FD] text-xs whitespace-nowrap inline-block">
          {q.quotationNumber}
        </span>
      ),
    },
    {
      header: 'ACTIVE REVISION',
      exportValue: (q) => `${q.currentRevision || 'Rev-00'} (${(q.revisions || []).length} Revs)`,
      cell: (q) => (
        <span className="px-2.5 py-1 rounded-lg bg-[#FAF0E6] text-[#75401F] font-mono text-[10px] font-bold border border-[#E7DED5] whitespace-nowrap inline-block">
          {q.currentRevision || 'Rev-00'} ({(q.revisions || []).length} Revs)
        </span>
      ),
    },
    {
      header: 'CUSTOMER & CONTACT',
      exportValue: (q) => `${q.customerName || 'N/A'} (${q.contactPerson || 'No Contact'})`,
      cell: (q) => (
        <div className="min-w-[180px]">
          <span className="font-bold text-[#211B17] block">{q.customerName || 'N/A'}</span>
          <span className="text-[11px] text-[#70665F]">{q.contactPerson || '-'}</span>
        </div>
      ),
    },
    {
      header: 'EQUIPMENT SCOPE',
      exportValue: (q) => getSummary(q).machineProduct,
      cell: (q) => {
        const summary = getSummary(q);
        return (
          <span className="font-semibold text-[#544B45] block max-w-sm truncate" title={summary.machineProduct}>
            {summary.machineProduct}
          </span>
        );
      },
    },
    {
      header: 'GRAND TOTAL (INR)',
      exportValue: (q) => getSummary(q).grandTotal,
      cell: (q) => {
        const summary = getSummary(q);
        return (
          <span className="font-bold text-[#169B62] font-mono text-xs whitespace-nowrap inline-block">
            {formatCurrency(summary.grandTotal)}
          </span>
        );
      },
    },
    {
      header: 'DATE',
      exportValue: (q) => q.date,
      cell: (q) => <span className="text-[#70665F] font-mono text-[11px] whitespace-nowrap inline-block">{formatDate(q.date)}</span>,
    },
    {
      header: 'STATUS',
      exportValue: (q) => getSummary(q).status?.toUpperCase(),
      cell: (q) => {
        const summary = getSummary(q);
        return <div className="whitespace-nowrap"><StatusBadge status={summary.status as any} /></div>;
      },
    },
    {
      header: 'ACTIONS',
      exportValue: () => '',
      cell: (q) => (
        <Link
          href={`/crm/quotations/${q.id}`}
          className="px-3 py-1 bg-[#FAF7F2] hover:bg-[#F3ECE4] text-[#75401F] border border-[#E7DED5] rounded-lg font-bold text-xs inline-flex items-center gap-1 transition shadow-2xs whitespace-nowrap cursor-pointer"
        >
          <span>View / Revs</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-5 text-xs pb-10">
      <div className="bg-gradient-to-r from-[#FAF3EA] via-[#F8EDE0] to-[#F1DFC9] p-5 sm:p-6 rounded-2xl border border-[#E9DFD3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-lg font-black text-[#211B17] flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAF0E6] text-[#75401F] flex items-center justify-center border border-[#E7DED5] shadow-xs">
              <FileCheck2 className="w-4.5 h-4.5" />
            </div>
            Engineering Quotations & Multi-Revision Master
          </h1>
          <p className="text-[#70665F] mt-1 text-xs">
            Prepare technical & commercial proposals with revision control (Rev-00, Rev-01), BOM pricing, and approval workflows.
          </p>
        </div>

        <Link
          href="/crm/quotations/new"
          className="px-4 py-2.5 bg-[#3E2723] hover:bg-[#2C1810] text-white rounded-xl font-bold transition flex items-center gap-2 shadow-xs cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quotation</span>
        </Link>
      </div>

      <DataTable
        title="Active Quotations Register & Version Audit"
        columns={columns}
        data={filteredQuotations}
        onRowClick={(q) => router.push(`/crm/quotations/${q.id}`)}
        filterComponent={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB]/80 rounded-xl text-xs font-bold text-slate-700 dark:text-[#544B45] focus:outline-none"
          >
            <option value="all">All Quotation Statuses</option>
            <option value="draft">Draft</option>
            <option value="internal_review">Internal Review</option>
            <option value="approved">Approved by Manager</option>
            <option value="sent">Sent to Customer</option>
            <option value="accepted">Customer Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        }
      />
    </div>
  );
}
