'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useERP } from '@/context/ERPContext';
import { DataTable, Column } from '@/components/data/DataTable';
import { SalesOrder } from '@/types/crm';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Layers, Briefcase, CheckCircle2, ArrowRight, Sparkles, Zap } from 'lucide-react';

export default function SalesOrdersPage() {
  const router = useRouter();
  const { salesOrders, createProjectFromSalesOrder } = useERP();
  const [successInfo, setSuccessInfo] = useState<{ prj: string; job: string } | null>(null);

  const handleCreateProject = (soId: string) => {
    const newPrj = createProjectFromSalesOrder(soId);
    setSuccessInfo({ prj: newPrj.projectNumber, job: newPrj.jobNumber });
    setTimeout(() => {
      router.push('/projects');
    }, 1800);
  };

  const columns: Column<SalesOrder>[] = [
    {
      header: 'SALES ORDER #',
      accessorKey: 'salesOrderNumber',
      cell: (so) => (
        <span className="font-mono font-bold text-[#0E91B2] bg-[#E0F2FE] px-2.5 py-1 rounded-lg border border-[#BAE6FD] text-xs whitespace-nowrap inline-block">
          {so.salesOrderNumber}
        </span>
      ),
    },
    {
      header: 'CUSTOMER & PO REFERENCE',
      cell: (so) => (
        <div className="min-w-[180px]">
          <span className="font-bold text-[#211B17] block">{so.customerName}</span>
          <span className="text-[11px] text-[#70665F] font-mono">PO: {so.customerPoNumber}</span>
        </div>
      ),
    },
    {
      header: 'EQUIPMENT SCOPE',
      cell: (so) => (
        <span className="font-semibold text-[#544B45] block max-w-sm truncate">
          {so.items?.[0]?.productName || (so as any).machineProduct || (so as any).machine_product || 'Custom Manufacturing Machine'}
        </span>
      ),
    },
    {
      header: 'TOTAL ORDER VALUE',
      cell: (so) => <span className="font-mono font-bold text-[#169B62] text-xs whitespace-nowrap inline-block">{formatCurrency(Number(so.orderValue) || Number((so as any).grand_total) || Number((so as any).total_amount) || 0)}</span>,
    },
    {
      header: 'DELIVERY TARGET',
      cell: (so) => <span className="text-[#70665F] font-mono text-[11px] whitespace-nowrap inline-block">{formatDate(so.deliveryDate || (so as any).target_delivery_date || (so as any).delivery_date)}</span>,
    },
    {
      header: 'MTO INTEGRATION STATUS',
      cell: (so) => (
        <div className="whitespace-nowrap">
          {so.jobNumber ? (
            <span className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
              Linked Job: {so.jobNumber}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
              Awaiting Job Creation
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'ACTIONS (CRM → PROJECT)',
      cell: (so) => (
        <div className="whitespace-nowrap">
          {so.jobNumber ? (
            <span className="font-mono font-bold text-[#70665F] text-xs flex items-center gap-1">
              <span>{so.projectId}</span>
            </span>
          ) : (
            <button
              onClick={() => handleCreateProject(so.id)}
              className="px-3.5 py-1.5 bg-[#3E2723] hover:bg-[#2C1810] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Create Project / Job</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 text-xs pb-10">
      <div className="bg-gradient-to-r from-[#FAF3EA] via-[#F8EDE0] to-[#F1DFC9] p-5 sm:p-6 rounded-2xl border border-[#E9DFD3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs text-[#211B17]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0E6] text-[#75401F] font-mono text-[10px] font-bold uppercase tracking-wider border border-[#E7DED5]">
              CRM → Project Handover Hub
            </span>
          </div>
          <h1 className="text-lg font-black text-[#211B17] flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAF0E6] text-[#75401F] flex items-center justify-center border border-[#E7DED5] shadow-xs">
              <Layers className="w-4.5 h-4.5" />
            </div>
            Confirmed Sales Orders Master
          </h1>
          <p className="text-[#70665F] mt-1 text-xs">
            Approved client contracts initiating engineering jobs, BOM release, and shop floor procurement. Click &ldquo;Create Project / Job&rdquo; to instantly generate linked Project (`PRJ-2026-XXXX`) and Shop Floor Job Number (`JOB-2026-XXXX`).
          </p>
        </div>
      </div>

      {successInfo && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl font-bold flex items-center justify-between shadow-md animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="text-[#211B17] text-sm">CRM → Project Integration Triggered Successfully!</span>
              <p className="text-[11px] font-normal text-emerald-300 mt-0.5">
                Created Project: <strong>{successInfo.prj}</strong> | Master Job Number: <strong>{successInfo.job}</strong>. Redirecting to Shop Floor Projects...
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-emerald-400 animate-pulse" />
        </div>
      )}

      <DataTable
        title="Active Sales Orders Register"
        subtitle="Make-to-Order contracts ready for Shop Floor Engineering and Fabrication"
        columns={columns}
        data={salesOrders}
      />
    </div>
  );
}
