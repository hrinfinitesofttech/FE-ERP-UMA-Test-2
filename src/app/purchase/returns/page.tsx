'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  CornerUpLeft,
  Plus,
  Search,
  Eye,
  Building,
  Calendar,
  X,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { PurchaseReturn, PurchaseReturnItem } from '../../../types/purchase';
import { ERPListPageLayout } from '../../../components/ui/ERPListPageLayout';

export default function PurchaseReturnsPage() {
  const { purchaseReturns, purchaseOrders, suppliers, addPurchaseReturn, currentUser } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [selectedPoId, setSelectedPoId] = useState('');
  const [newReturnDate, setNewReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [newReason, setNewReason] = useState('');
  const [newActionType, setNewActionType] = useState<'Replacement' | 'Debit Note' | 'Credit Note'>('Debit Note');

  const filteredReturns = purchaseReturns.filter(r => {
    if (searchQuery) {
      const q = searchQuery?.toLowerCase();
      return (
        r.returnNumber?.toLowerCase().includes(q) ||
        r.poNumber?.toLowerCase().includes(q) ||
        r.supplierName?.toLowerCase().includes(q) ||
        r.debitNoteNumber?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoId) {
      alert('Please select a Purchase Order.');
      return;
    }
    const poObj = purchaseOrders.find(p => p.id === selectedPoId);
    if (!poObj) return;

    const returnItems: PurchaseReturnItem[] = poObj.items.map((it, idx) => ({
      id: `PRI-${Date.now()}-${idx}`,
      returnId: '',
      itemCode: it.itemCode,
      itemName: it.itemName,
      specification: it.specification,
      unitOfMeasure: it.unitOfMeasure,
      returnedQuantity: 10,
      unitPrice: it.unitPrice || it.rate || 0,
      totalRefundPrice: 10 * (it.unitPrice || it.rate || 0),
      rejectionReason: newReason,
    }));

    const totalVal = returnItems.reduce((sum, item) => sum + item.totalRefundPrice, 0);

    const newReturn: PurchaseReturn = {
      id: `PRT-${Date.now()}`,
      returnNumber: `RTV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      poId: poObj.id,
      poNumber: poObj.poNumber,
      supplierId: poObj.supplierId,
      supplierName: poObj.supplierName,
      returnDate: newReturnDate,
      debitNoteNumber: `DN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      totalReturnAmount: totalVal,
      reasonForReturn: newReason,
      status: 'Debit Note Issued',
      actionRequested: newActionType,
      items: returnItems,
      createdBy: `${currentUser.firstName} ${currentUser.lastName}`,
      createdAt: new Date().toISOString(),
    };

    addPurchaseReturn(newReturn);
    setShowAddModal(false);
  };

  const columns = [
    {
      key: 'returnNumber',
      header: 'RETURN NOTE NO',
      isCodeLink: true,
      onCodeClick: (r: PurchaseReturn) =>
        alert(`Purchase Return: ${r.returnNumber}\nSupplier: ${r.supplierName}\nPO Ref: ${r.poNumber}\nDebit Note: ${r.debitNoteNumber}\nReason: ${r.reasonForReturn || 'N/A'}`),
      cell: (r: PurchaseReturn) => (
        <span className="font-semibold text-[#7C3AED] hover:underline cursor-pointer">{r.returnNumber}</span>
      ),
    },
    {
      key: 'debitNoteNumber',
      header: 'DEBIT NOTE REF',
      cell: (r: PurchaseReturn) => (
        <span className="font-mono font-semibold text-emerald-700">{r.debitNoteNumber}</span>
      ),
    },
    {
      key: 'poNumber',
      header: 'PO NUMBER',
      cell: (r: PurchaseReturn) => (
        <span className="font-mono font-semibold text-gray-800">{r.poNumber}</span>
      ),
    },
    {
      key: 'supplierName',
      header: 'SUPPLIER NAME',
      cell: (r: PurchaseReturn) => (
        <span className="font-semibold text-gray-900">{r.supplierName}</span>
      ),
    },
    {
      key: 'returnDate',
      header: 'RETURN DATE',
      cell: (r: PurchaseReturn) => <span className="text-gray-600 font-mono text-[11px]">{r.returnDate}</span>,
    },
    {
      key: 'actionRequested',
      header: 'ACTION REQUESTED',
      cell: (r: PurchaseReturn) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
          {r.actionRequested}
        </span>
      ),
    },
    {
      key: 'totalReturnAmount',
      header: 'RETURN VALUE (₹)',
      cell: (r: PurchaseReturn) => (
        <span className="font-mono font-bold text-gray-900">
          ₹{r.totalReturnAmount?.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: (r: PurchaseReturn) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          {r.status}
        </span>
      ),
    },
  ];

  const handleExport = () => {
    if (purchaseReturns.length === 0) return;
    const headers = ['Return Note No', 'Debit Note Ref', 'PO Number', 'Supplier', 'Return Date', 'Action', 'Value (INR)', 'Status'];
    const rows = purchaseReturns.map((r) => [
      r.returnNumber,
      `"${r.debitNoteNumber}"`,
      `"${r.poNumber}"`,
      `"${r.supplierName}"`,
      r.returnDate,
      `"${r.actionRequested}"`,
      r.totalReturnAmount,
      `"${r.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `purchase_returns_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <ERPListPageLayout<PurchaseReturn>
        breadcrumbs={['DASHBOARD', 'PURCHASE', 'PURCHASE RETURNS & DEBIT NOTES']}
        columns={columns}
        data={purchaseReturns}
        addNewLabel="+ Create Purchase Return Note"
        onAddNew={() => setShowAddModal(true)}
        onExport={handleExport}
        searchPlaceholder="Search Return No, PO No, Supplier, Debit Note..."
      />

      {/* CREATE RETURN MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between">
              <h2 className="text-lg font-black text-[#211B17]">Create Purchase Return & Debit Note</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReturnSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Select Purchase Order *</label>
                <select
                  value={selectedPoId}
                  onChange={(e) => setSelectedPoId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                  required
                >
                  <option value="">-- Select Purchase Order --</option>
                  {purchaseOrders.map(p => (
                    <option key={p.id} value={p.id}>{p.poNumber} - {p.supplierName} ({p.jobId})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#70665F] mb-1">Return Date</label>
                  <input
                    type="date"
                    value={newReturnDate}
                    onChange={(e) => setNewReturnDate(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Action Requested</label>
                  <select
                    value={newActionType}
                    onChange={(e) => setNewActionType(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                  >
                    <option value="Debit Note">Debit Note Issue</option>
                    <option value="Replacement">Replacement Material Required</option>
                    <option value="Credit Note">Credit Note from Supplier</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">QC Rejection Reason</label>
                <textarea
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="e.g. QC Inspection Failure - Dimensional Out of Tolerance"
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] h-20"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#EBE3DB]">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-[#FAF7F2] text-[#211B17] rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-[#211B17] font-bold rounded-xl">
                  Issue Purchase Return & Debit Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
