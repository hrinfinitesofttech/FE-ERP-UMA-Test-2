'use client';

import React, { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { Supplier } from '../../../types/purchase';
import { formatDate } from '../../../lib/utils';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from '../../../context/ToastContext';

export default function SupplierMasterListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { suppliers, deleteSupplier, isInitialLoading } = useERP();

  const createdParam = searchParams?.get('created');
  const updatedParam = searchParams?.get('updated');

  const handleDelete = (s: Supplier) => {
    const name = s.supplierName || s.name || s.vendorCode;
    toast.confirm({
      title: 'Delete Vendor',
      message: `Are you sure you want to delete vendor "${name}"? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: () => {
        deleteSupplier(s.id);
        toast.success(`Vendor "${name}" deleted successfully.`);
      },
    });
  };

  const handleEdit = (s: Supplier) => {
    const targetId = s.id || s.vendorCode || s.supplierCode || '';
    if (targetId) {
      router.push(`/purchase/suppliers/${encodeURIComponent(targetId)}/edit`);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: string, type: 'vendor' | 'app' | 'doc' | 'general' = 'general') => {
    const s = (status || '').toLowerCase();

    if (s.includes('running') || s === 'approved' || s === 'active' || s === 'submit') {
      return (
        <span className="text-[11px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full border border-[#BBF7D0]">
          {status}
        </span>
      );
    }

    if (s.includes('review') || s === 'pending') {
      return (
        <span className="text-[11px] font-semibold text-[#D97706] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
          {status}
        </span>
      );
    }

    if (s.includes('black') || s === 'rejected' || s === 'inactive') {
      return (
        <span className="text-[11px] font-semibold text-[#DC2626] bg-[#FEE2E2] px-2.5 py-0.5 rounded-full border border-[#FECACA]">
          {status}
        </span>
      );
    }

    return (
      <span className="text-[11px] font-medium text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded">
        {status}
      </span>
    );
  };

  // Define exact columns matching Screenshot 1
  const columns: ERPColumn<Supplier>[] = [
    {
      key: 'vendorCode',
      header: 'VENDOR CODE',
      isCodeLink: true,
      onCodeClick: handleEdit,
      cell: (s) => {
        const code = s.vendorCode || s.supplierCode || s.id;
        return (
          <button
            onClick={() => handleEdit(s)}
            className="text-[#2563EB] hover:text-[#1D4ED8] underline font-semibold font-mono text-xs cursor-pointer text-left"
          >
            {code}
          </button>
        );
      },
    },
    {
      key: 'vendorName',
      header: 'VENDOR NAME',
      cell: (s) => (
        <span className="font-semibold text-[#1E293B]">
          {s.supplierName || s.name || '-'}
        </span>
      ),
    },
    {
      key: 'chequeName',
      header: 'VENDOR CHEQUE NAME',
      cell: (s) => (
        <span className="text-[#475569]">
          {s.chequeName || s.supplierName || s.name || '-'}
        </span>
      ),
    },
    {
      key: 'activity',
      header: 'VENDOR ACTIVITY',
      cell: (s) => (
        <span className="text-[#334155] font-medium">
          {s.activity || s.category || 'Purchase'}
        </span>
      ),
    },
    {
      key: 'vendorStatus',
      header: 'VENDOR STATUS',
      cell: (s) => {
        const vStatus = s.vendorStatus || (s.status === 'Approved' ? 'Running' : 'Under Review');
        return getStatusBadge(vStatus, 'vendor');
      },
    },
    {
      key: 'createdBy',
      header: 'CREATED BY',
      cell: (s) => (
        <span className="font-mono text-[#64748B] text-[11px]">
          {s.createdBy || 'darshit.admin'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'CREATED DATE',
      cell: (s) => {
        const d = s.createdAt ? new Date(s.createdAt) : new Date();
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return <span className="font-mono text-[#64748B] text-[11px]">{`${dd}/${mm}/${yyyy}`}</span>;
      },
    },
    {
      key: 'approvedBy',
      header: 'APPROVEUSER',
      cell: (s) => (
        <span className="font-mono text-[#64748B] text-[11px]">
          {s.approvedBy || s.createdBy || 'darshit.admin'}
        </span>
      ),
    },
    {
      key: 'appStatus',
      header: 'APP STATUS',
      cell: (s) => getStatusBadge(s.approvalStatus || 'Approved', 'app'),
    },
    {
      key: 'docStatus',
      header: 'DOC STATUS',
      cell: (s) => getStatusBadge(s.docStatus || 'Submit', 'doc'),
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: (s) => getStatusBadge(s.status === 'Approved' ? 'Active' : s.status || 'Active', 'general'),
    },
  ];

  return (
    <div className="flex flex-col space-y-2">
      {/* Success Notification Alert */}
      {createdParam && (
        <div className="mx-4 sm:mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Vendor &quot;{decodeURIComponent(createdParam)}&quot; registered successfully!</span>
        </div>
      )}

      {updatedParam && (
        <div className="mx-4 sm:mx-6 mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>Vendor &quot;{decodeURIComponent(updatedParam)}&quot; updated successfully!</span>
        </div>
      )}

      {/* Main List Layout matching Screenshot 1 */}
      <ERPListPageLayout<Supplier>
        breadcrumbs={['DASHBOARD', 'PROCUREMENT', 'VENDOR MASTER']}
        data={suppliers}
        columns={columns}
        searchPlaceholder="Search vendor code, name, city, gstin..."
        addNewHref="/purchase/suppliers/add"
        addNewLabel="Add Vendor Master"
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isInitialLoading}
        defaultPageSize={50}
        pageSizeOptions={[10, 25, 50, 100]}
        getRowKey={(s, i) => s.id || s.vendorCode || i}
      />
    </div>
  );
}
