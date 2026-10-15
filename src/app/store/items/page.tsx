'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { ItemMaster } from '../../../types/store';
import { formatCurrency } from '../../../lib/utils';
import { CheckCircle2 } from 'lucide-react';

export default function ItemMasterListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { itemMasters, deleteItemMaster, isInitialLoading } = useERP();

  const createdParam = searchParams?.get('created');
  const updatedParam = searchParams?.get('updated');

  const handleEdit = (item: ItemMaster) => {
    const targetId = item.id || item.itemCode || '';
    if (targetId) {
      router.push(`/store/items/${encodeURIComponent(targetId)}/edit`);
    }
  };

  const handleDelete = (item: ItemMaster) => {
    if (confirm(`Are you sure you want to delete item "${item.itemName}" (${item.itemCode})? This action cannot be undone.`)) {
      if (deleteItemMaster) {
        deleteItemMaster(item.id);
      }
    }
  };

  const columns: ERPColumn<ItemMaster>[] = [
    {
      key: 'itemCode',
      header: 'ITEM CODE',
      isCodeLink: true,
      onCodeClick: handleEdit,
      cell: (item) => (
        <button
          onClick={() => handleEdit(item)}
          className="text-[#2563EB] hover:text-[#1D4ED8] underline font-bold font-mono text-xs cursor-pointer text-left"
        >
          {item.itemCode || item.id}
        </button>
      ),
    },
    {
      key: 'itemName',
      header: 'ITEM NAME & SPECIFICATION',
      cell: (item) => (
        <div className="max-w-xs">
          <span className="font-semibold text-[#1E293B] block truncate">{item.itemName}</span>
          <span className="text-[11px] text-[#64748B] block truncate">
            {item.specification || item.description || item.brandMake || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'CATEGORY',
      cell: (item) => (
        <span className="text-[#334155] font-medium">
          {item.category || 'General Store'}
        </span>
      ),
    },
    {
      key: 'itemType',
      header: 'ITEM TYPE',
      cell: (item) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]">
          {item.itemType || 'Raw Material'}
        </span>
      ),
    },
    {
      key: 'uom',
      header: 'UOM',
      cell: (item) => (
        <span className="font-mono font-bold text-[#475569]">
          {item.uom || 'Nos'}
        </span>
      ),
    },
    {
      key: 'hsnSac',
      header: 'HSN / SAC',
      cell: (item) => (
        <span className="font-mono text-[#64748B] text-[11px]">
          {item.hsnSac || '72193200'}
        </span>
      ),
    },
    {
      key: 'reorderLevel',
      header: 'REORDER LEVEL',
      cell: (item) => (
        <span className="font-mono font-semibold text-[#D97706]">
          {Number(item.reorderLevel || 0).toLocaleString()} {item.uom}
        </span>
      ),
    },
    {
      key: 'standardCost',
      header: 'STANDARD COST',
      cell: (item) => (
        <span className="font-mono font-semibold text-[#1E293B]">
          {formatCurrency(item.standardCost || item.defaultPurchaseRate || 0)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: (item) => (
        <span className="text-[11px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full border border-[#BBF7D0]">
          {item.status || 'Active'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-2">
      {createdParam && (
        <div className="mx-4 sm:mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Item &quot;{decodeURIComponent(createdParam)}&quot; created successfully!</span>
        </div>
      )}

      {updatedParam && (
        <div className="mx-4 sm:mx-6 mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>Item &quot;{decodeURIComponent(updatedParam)}&quot; updated successfully!</span>
        </div>
      )}

      <ERPListPageLayout<ItemMaster>
        breadcrumbs={['DASHBOARD', 'STORE', 'ITEM MASTER']}
        data={itemMasters}
        columns={columns}
        searchPlaceholder="Search item code, description, specification or category..."
        addNewHref="/store/items/add"
        addNewLabel="Add Item Master"
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isInitialLoading}
        defaultPageSize={50}
        pageSizeOptions={[10, 25, 50, 100]}
        getRowKey={(item, i) => item.id || item.itemCode || i}
      />
    </div>
  );
}
