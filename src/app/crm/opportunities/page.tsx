'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { DataTable, Column } from '../../../components/data/DataTable';
import { Opportunity } from '../../../types/crm';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Award, Plus, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function OpportunitiesPage() {
  const { opportunities, updateOpportunity } = useERP();
  const [selectedStage, setSelectedStage] = useState<string>('all');

  const filteredOpps = opportunities.filter((o) => {
    if (selectedStage !== 'all' && o.stage !== selectedStage) return false;
    return true;
  });

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'won':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'lost':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'negotiation':
      case 'customer_approval':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'quotation':
        return 'bg-crm-brand- text-crm-brand- border-crm-brand-';
      default:
        return 'bg-crm-brand- text-crm-brand- border-crm-brand-';
    }
  };

  const columns: Column<Opportunity>[] = [
    {
      header: 'Opp No.',
      accessorKey: 'opportunityNo',
      cell: (o) => <span className="font-mono font-bold text-crm-brand-700">{o.opportunityNo}</span>,
    },
    {
      header: 'Customer',
      accessorKey: 'customerName',
      cell: (o) => <span className="font-bold text-slate-900 dark:text-[#211B17]">{o.customerName}</span>,
    },
    {
      header: 'Equipment / Machine Scope',
      accessorKey: 'machineProduct',
    },
    {
      header: 'Deal Value',
      cell: (o) => <span className="font-bold text-emerald-600 font-mono">{formatCurrency(o.estimatedValue)}</span>,
    },
    {
      header: 'Win Probability',
      cell: (o) => (
        <div className="w-24">
          <div className="flex justify-between text-[10px] font-mono mb-0.5">
            <span>{o.probability}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-crm-brand-700 h-full rounded-full" style={{ width: `${o.probability}%` }} />
          </div>
        </div>
      ),
    },
    {
      header: 'Sales Stage',
      cell: (o) => (
        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase border ${getStageBadge(o.stage)}`}>
          {o.stage?.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Expected Close',
      cell: (o) => <span className="text-[#70665F] font-mono">{formatDate(o.expectedClosingDate)}</span>,
    },
    {
      header: 'Sales Engineer',
      accessorKey: 'salesPersonName',
    },
  ];

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <Award className="w-5 h-5 text-crm-brand-700" />
            Opportunities & Deal Pipeline Management
          </h1>
          <p className="text-[#70665F] mt-0.5">
            Stage-by-stage deal tracking from technical qualification to customer closing.
          </p>
        </div>
      </div>

      <DataTable
        title="Active Sales Pipeline Deals"
        columns={columns}
        data={filteredOpps}
        filterComponent={
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-[#FAF7F2] border rounded-lg"
          >
            <option value="all">All Stages</option>
            <option value="qualification">Qualification</option>
            <option value="requirement">Requirement Analysis</option>
            <option value="technical_discussion">Technical Review</option>
            <option value="quotation">Quotation Ready</option>
            <option value="negotiation">Negotiation</option>
            <option value="won">Won Deals</option>
            <option value="lost">Lost Deals</option>
          </select>
        }
      />
    </div>
  );
}
