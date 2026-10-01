'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useERP } from '@/context/ERPContext';
import { DataTable, Column } from '@/components/data/DataTable';
import { CustomerPO } from '@/types/crm';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Briefcase, Layers, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function CustomerPOPage() {
  const router = useRouter();
  const { customerPOs, convertCustomerPOToSalesOrder } = useERP();
  const [successMsg, setSuccessMsg] = useState('');

  const handleCreateSalesOrder = (poId: string) => {
    const newSO = convertCustomerPOToSalesOrder(poId);
    setSuccessMsg(`Generated Sales Order ${newSO.salesOrderNumber} from PO.`);
    setTimeout(() => {
      setSuccessMsg('');
      router.push('/crm/sales-orders');
    }, 1500);
  };

  const columns: Column<CustomerPO>[] = [
    {
      header: 'CUSTOMER PO #',
      accessorKey: 'poNumber',
      cell: (po) => (
        <span className="font-mono font-bold text-[#0E91B2] bg-[#E0F2FE] px-2.5 py-1 rounded-lg border border-[#BAE6FD] text-xs">
          {po.poNumber}
        </span>
      ),
    },
    {
      header: 'CUSTOMER',
      cell: (po) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-[#211B17] block">{po.customerName}</span>
          {po.quotationId ? (
            <Link
              href={`/crm/quotations/${po.quotationId}`}
              className="text-[11px] text-[#70665F] hover:text-[#0E91B2] hover:underline font-mono inline-flex items-center gap-0.5"
            >
              <span>Ref Quotation: {po.quotationNumber || po.quotationId}</span>
            </Link>
          ) : (
            <span className="text-[11px] text-[#70665F] font-mono">Ref Quotation: {po.quotationNumber || 'Direct PO'}</span>
          )}
        </div>
      ),
    },
    {
      header: 'PO VALUE',
      cell: (po) => (
        <span className="font-bold text-emerald-600 font-mono text-xs">
          {formatCurrency(Number(po.poAmount || (po as any).po_value || (po as any).poValue || 0))}
        </span>
      ),
    },
    {
      header: 'PO DATE & TARGET DELIVERY',
      cell: (po) => (
        <div className="font-mono text-slate-600 dark:text-[#70665F] text-[11px]">
          <span className="block">Date: {formatDate(po.poDate)}</span>
          <span className="block text-[10px] text-[#70665F]">Delivery: {formatDate(po.deliveryDate)}</span>
        </div>
      ),
    },
    {
      header: 'STATUS',
      cell: (po) => {
        const isConverted = po.status === 'sales_order_created' || po.status === 'converted_to_so';
        return (
          <span
            className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider inline-block ${
              isConverted
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            {isConverted ? 'Sales Order Created' : 'Received (Ready to Process)'}
          </span>
        );
      },
    },
    {
      header: 'ACTIONS',
      cell: (po) => {
        const isConverted = po.status === 'sales_order_created' || po.status === 'converted_to_so';
        const soNumber = po.salesOrderId || (po as any).convertedSoId || (po as any).converted_so_id;
        return (
          <div>
            {isConverted ? (
              <Link
                href="/crm/sales-orders"
                className="font-mono font-bold text-crm-brand-700 hover:underline text-xs inline-flex items-center gap-1 bg-[#FAF0E6] px-2.5 py-1 rounded-lg border border-[#E7DED5]"
              >
                <span>SO: {soNumber || 'View SO'}</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            ) : (
              <button
                onClick={() => handleCreateSalesOrder(po.id)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Create Sales Order</span>
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-crm-brand-700" />
            Customer Purchase Orders (Inward Verification)
          </h1>
          <p className="text-[#70665F] mt-0.5">
            Confirmed customer POs received against accepted quotations. Click &ldquo;Create Sales Order&rdquo; to proceed.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <DataTable
        title="Customer Purchase Orders Register"
        columns={columns}
        data={customerPOs}
      />
    </div>
  );
}
