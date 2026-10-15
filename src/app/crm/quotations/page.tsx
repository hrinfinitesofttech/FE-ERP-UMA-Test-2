'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { StatusBadge } from '../../../components/workflow/StatusBadge';
import { Quotation } from '../../../types/crm';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { FileCheck2, ArrowUpRight, Filter } from 'lucide-react';

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

  const filteredQuotations = useMemo(() => {
    const list = quotations.filter((q) => {
      const summary = getSummary(q);
      if (statusFilter !== 'all' && summary.status !== statusFilter) return false;
      return true;
    });

    const seenNumbers = new Set<string>();
    const seenSemantic = new Set<string>();
    return list.filter((q) => {
      const qNo = String(q.quotationNumber || q.id || '').trim();
      if (!qNo || seenNumbers.has(qNo)) return false;
      seenNumbers.add(qNo);

      const summary = getSummary(q);
      const cust = (q.customerName || '').toLowerCase().trim();
      const prod = (summary.machineProduct || '').toLowerCase().trim();
      const amt = Math.round(Number(summary.grandTotal) || 0);

      if (cust && cust !== 'customer' && prod && prod !== 'process equipment' && amt > 0) {
        const semKey = `${cust}__${prod}__${amt}`;
        if (seenSemantic.has(semKey)) return false;
        seenSemantic.add(semKey);
      }
      return true;
    });
  }, [quotations, statusFilter]);

  const columns: ERPColumn<Quotation>[] = [
    {
      key: 'quotationNumber',
      header: 'QUOTATION #',
      isCodeLink: true,
      onCodeClick: (q) => router.push(`/crm/quotations/${q.id}`),
      cell: (q) => (
        <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-xs whitespace-nowrap inline-block">
          {q.quotationNumber}
        </span>
      ),
    },
    {
      key: 'currentRevision',
      header: 'ACTIVE REVISION',
      cell: (q) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200 whitespace-nowrap inline-block">
          {q.currentRevision || 'Rev-00'} ({(q.revisions || []).length} Revs)
        </span>
      ),
    },
    {
      key: 'customerName',
      header: 'CUSTOMER & CONTACT',
      cell: (q) => (
        <div className="min-w-[170px]">
          <span className="font-bold text-slate-800 block text-xs">{q.customerName || 'N/A'}</span>
          <span className="text-[11px] text-slate-500">{q.contactPerson || '-'}</span>
        </div>
      ),
    },
    {
      key: 'machineProduct',
      header: 'EQUIPMENT SCOPE',
      cell: (q) => {
        const summary = getSummary(q);
        return (
          <span className="font-medium text-slate-700 block max-w-xs truncate text-xs" title={summary.machineProduct}>
            {summary.machineProduct}
          </span>
        );
      },
    },
    {
      key: 'grandTotal',
      header: 'GRAND TOTAL (INR)',
      cell: (q) => {
        const summary = getSummary(q);
        return (
          <span className="font-bold text-emerald-700 font-mono text-xs whitespace-nowrap inline-block">
            {formatCurrency(summary.grandTotal)}
          </span>
        );
      },
    },
    {
      key: 'date',
      header: 'DATE',
      cell: (q) => (
        <span className="text-slate-500 font-mono text-[11px] whitespace-nowrap inline-block">
          {formatDate(q.date)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: (q) => {
        const summary = getSummary(q);
        return (
          <div className="whitespace-nowrap">
            <StatusBadge status={summary.status as any} />
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      cell: (q) => (
        <Link
          href={`/crm/quotations/${q.id}`}
          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition shadow-2xs whitespace-nowrap cursor-pointer"
        >
          <span>View / Revs</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

  const handleExportCSV = () => {
    const csv = [
      'Quotation No,Revision,Customer,Contact,Equipment Scope,Grand Total,Date,Status',
      ...filteredQuotations.map((q) => {
        const summary = getSummary(q);
        return `"${q.quotationNumber}","${q.currentRevision || 'Rev-00'}","${q.customerName || ''}","${q.contactPerson || ''}","${summary.machineProduct}","${summary.grandTotal}","${q.date}","${summary.status}"`;
      }),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Quotations_Register_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status:</span>
          {[
            { id: 'all', label: 'All Quotations' },
            { id: 'draft', label: 'Draft' },
            { id: 'internal_review', label: 'Internal Review' },
            { id: 'approved', label: 'Approved' },
            { id: 'sent', label: 'Sent to Customer' },
            { id: 'accepted', label: 'Accepted' },
            { id: 'rejected', label: 'Rejected' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-bold text-slate-800">{filteredQuotations.length}</span> quotations
        </div>
      </div>

      <ERPListPageLayout<Quotation>
        breadcrumbs={['DASHBOARD', 'CRM & SALES', 'QUOTATIONS']}
        title="Engineering Quotations & Revision Register"
        columns={columns}
        data={filteredQuotations}
        searchPlaceholder="Search quotation number, customer name, or equipment..."
        addNewLabel="New Quotation"
        addNewHref="/crm/quotations/new"
        onExport={handleExportCSV}
      />
    </div>
  );
}
