'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useERP } from '@/context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '@/components/ui/ERPListPageLayout';
import { CustomerPO } from '@/types/crm';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Briefcase, Layers, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function CustomerPOPage() {
  const router = useRouter();
  const { customerPOs, convertCustomerPOToSalesOrder } = useERP();
  const [successMsg, setSuccessMsg] = useState('');

  const handleCreateSalesOrder = (poId: string) => {
    const newSO = convertCustomerPOToSalesOrder(poId);
    setSuccessMsg(`Generated Sales Order ${newSO.salesOrderNumber} from Customer PO.`);
    setTimeout(() => {
      setSuccessMsg('');
    }, 2500);
  };

  const handleExportCSV = () => {
    const csv = [
      'Customer PO #,Customer,Ref Quotation,PO Value,PO Date,Target Delivery,Status,Sales Order #',
      ...customerPOs.map((po) => {
        const val = Number(po.poAmount || (po as any).po_value || (po as any).poValue || 0);
        const isConverted = po.status === 'sales_order_created' || po.status === 'converted_to_so';
        const soNumber = po.salesOrderId || (po as any).convertedSoId || (po as any).converted_so_id || '';
        return `"${po.poNumber}","${po.customerName}","${po.quotationNumber || po.quotationId || 'Direct'}","${val}","${po.poDate || ''}","${po.deliveryDate || ''}","${isConverted ? 'Sales Order Created' : 'Received'}","${soNumber}"`;
      }),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Customer_POs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const columns: ERPColumn<CustomerPO>[] = [
    {
      key: 'poNumber',
      header: 'CUSTOMER PO #',
      isCodeLink: true,
      onCodeClick: (po) => {
        if (po.quotationId) {
          router.push(`/crm/quotations/${po.quotationId}`);
        }
      },
      cell: (po) => (
        <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-xs whitespace-nowrap inline-block">
          {po.poNumber}
        </span>
      ),
    },
    {
      key: 'customerName',
      header: 'CUSTOMER & QUOTATION REF',
      cell: (po) => (
        <div className="min-w-[180px]">
          <span className="font-bold text-slate-800 text-xs block">{po.customerName}</span>
          {po.quotationId ? (
            <Link
              href={`/crm/quotations/${po.quotationId}`}
              className="text-[11px] text-purple-700 hover:underline font-mono inline-flex items-center gap-0.5"
            >
              <span>Ref Quotation: {po.quotationNumber || po.quotationId}</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          ) : (
            <span className="text-[11px] text-slate-500 font-mono">Ref Quotation: {po.quotationNumber || 'Direct PO'}</span>
          )}
        </div>
      ),
    },
    {
      key: 'poValue',
      header: 'PO VALUE',
      cell: (po) => (
        <span className="font-bold text-emerald-700 font-mono text-xs whitespace-nowrap inline-block">
          {formatCurrency(Number(po.poAmount || (po as any).po_value || (po as any).poValue || 0))}
        </span>
      ),
    },
    {
      key: 'dates',
      header: 'PO DATE & TARGET DELIVERY',
      cell: (po) => (
        <div className="font-mono text-slate-600 text-[11px] whitespace-nowrap">
          <span className="block">Date: {formatDate(po.poDate)}</span>
          <span className="block text-[10px] text-slate-500">Delivery: {formatDate(po.deliveryDate)}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: (po) => {
        const isConverted = po.status === 'sales_order_created' || po.status === 'converted_to_so';
        return (
          <span
            className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider inline-block ${
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
      key: 'actions',
      header: 'ACTIONS',
      cell: (po) => {
        const isConverted = po.status === 'sales_order_created' || po.status === 'converted_to_so';
        const soNumber = po.salesOrderId || (po as any).convertedSoId || (po as any).converted_so_id;
        return (
          <div className="whitespace-nowrap flex items-center gap-1.5">
            {isConverted ? (
              <span className="font-mono font-bold text-purple-700 text-xs inline-flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                <span>SO: {soNumber || 'Generated'}</span>
              </span>
            ) : (
              <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                Received (Pending SO)
              </span>
            )}
            {po.quotationId && (
              <Link
                href={`/crm/quotations/${po.quotationId}`}
                className="p-1 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded transition"
                title="View Linked Quotation"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs">{successMsg}</span>
        </div>
      )}

      <ERPListPageLayout<CustomerPO>
        breadcrumbs={['DASHBOARD', 'CRM & SALES', 'CUSTOMER PURCHASE ORDERS']}
        title="Customer Purchase Orders (Inward Verification)"
        columns={columns}
        data={customerPOs}
        searchPlaceholder="Search customer PO #, customer, or quotation ref..."
        addNewHref="/crm/customer-po/new"
        addNewLabel="Register Customer PO"
        onExport={handleExportCSV}
      />
    </div>
  );
}
