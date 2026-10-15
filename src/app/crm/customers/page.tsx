'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { Customer } from '../../../types/crm';
import { formatCurrency } from '../../../lib/utils';
import { CheckCircle2 } from 'lucide-react';

export default function CustomerMasterListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customers, deleteCustomer, isInitialLoading } = useERP();

  const createdParam = searchParams?.get('created');
  const updatedParam = searchParams?.get('updated');

  const handleEdit = (c: Customer) => {
    const targetId = c.id || c.customerCode || '';
    if (targetId) {
      router.push(`/crm/customers/${encodeURIComponent(targetId)}/edit`);
    }
  };

  const handleDelete = (c: Customer) => {
    if (confirm(`Are you sure you want to delete customer "${c.companyName}"? This action cannot be undone.`)) {
      if (deleteCustomer) {
        deleteCustomer(c.id);
      }
    }
  };

  const columns: ERPColumn<Customer>[] = [
    {
      key: 'customerCode',
      header: 'CUSTOMER CODE',
      isCodeLink: true,
      onCodeClick: handleEdit,
      cell: (c) => (
        <button
          onClick={() => handleEdit(c)}
          className="text-[#2563EB] hover:text-[#1D4ED8] underline font-bold font-mono text-xs cursor-pointer text-left"
        >
          {c.customerCode || c.id}
        </button>
      ),
    },
    {
      key: 'companyName',
      header: 'COMPANY / CLIENT NAME',
      cell: (c) => (
        <div>
          <span className="font-semibold text-[#1E293B] block">{c.companyName}</span>
          <span className="text-[11px] text-[#64748B]">{c.industry || 'Manufacturing'}</span>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'CONTACT PERSON',
      cell: (c) => (
        <div>
          <span className="text-[#334155] font-medium block">{c.contactPerson}</span>
          <span className="text-[11px] text-[#64748B]">
            {c.mobile ? c.mobile : ''} {c.email ? `• ${c.email}` : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'city',
      header: 'CITY & STATE',
      cell: (c) => (
        <span className="text-[#334155]">
          {c.city || 'Vadodara'}, {c.state || 'Gujarat'}
        </span>
      ),
    },
    {
      key: 'gstin',
      header: 'GSTIN',
      cell: (c) => (
        <span className="font-mono text-[#475569] text-[11px]">
          {c.gstin || '-'}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'TIER CATEGORY',
      cell: (c) => {
        const cat = (c.category || 'standard').toLowerCase();
        const colors: Record<string, string> = {
          platinum: 'bg-purple-100 text-purple-800 border-purple-200',
          gold: 'bg-amber-100 text-amber-800 border-amber-200',
          silver: 'bg-slate-100 text-slate-800 border-slate-200',
          standard: 'bg-blue-100 text-blue-800 border-blue-200',
        };
        return (
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
              colors[cat] || colors.standard
            }`}
          >
            {c.category || 'Standard'}
          </span>
        );
      },
    },
    {
      key: 'creditLimit',
      header: 'CREDIT LIMIT',
      cell: (c) => (
        <span className="font-mono font-semibold text-[#1E293B]">
          {formatCurrency(c.creditLimit || 0)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: () => (
        <span className="text-[11px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full border border-[#BBF7D0]">
          Active
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-2">
      {createdParam && (
        <div className="mx-4 sm:mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Customer &quot;{decodeURIComponent(createdParam)}&quot; registered successfully!</span>
        </div>
      )}

      {updatedParam && (
        <div className="mx-4 sm:mx-6 mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>Customer &quot;{decodeURIComponent(updatedParam)}&quot; updated successfully!</span>
        </div>
      )}

      <ERPListPageLayout<Customer>
        breadcrumbs={['DASHBOARD', 'CRM', 'CUSTOMER MASTER']}
        data={customers}
        columns={columns}
        searchPlaceholder="Search customer code, company, city, contact or GSTIN..."
        addNewHref="/crm/customers/add"
        addNewLabel="Add Customer"
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isInitialLoading}
        defaultPageSize={50}
        pageSizeOptions={[10, 25, 50, 100]}
        getRowKey={(c, i) => c.id || c.customerCode || i}
      />
    </div>
  );
}
