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

export default function PurchaseReturnsPage() {
  const { purchaseReturns, purchaseOrders, suppliers, addPurchaseReturn, currentUser } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [selectedPoId, setSelectedPoId] = useState(purchaseOrders[0]?.id || 'PO-001');
  const [newReturnDate, setNewReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [newReason, setNewReason] = useState('QC Inspection Failure - Dimensional Out of Tolerance');
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

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBE3DB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-mono font-bold border border-orange-500/30">
              PURCHASE RETURNS (RTV)
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Purchase Returns & Debit Notes Manager</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Return to Vendor (RTV) tracking for rejected materials, QC non-conformance & debit note integration.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-[#211B17] font-bold text-xs rounded-xl shadow-lg shadow-orange-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          Create Purchase Return Note
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search Return No, PO No, Supplier, Debit Note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-orange-500 w-72"
          />
        </div>

        <div className="text-xs text-[#70665F]">
          Showing <span className="text-[#211B17] font-bold">{filteredReturns.length}</span> return notes
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3">Return Note No</th>
                <th className="p-3">Debit Note Ref</th>
                <th className="p-3">PO Number</th>
                <th className="p-3">Supplier Name</th>
                <th className="p-3">Return Date</th>
                <th className="p-3">Action Requested</th>
                <th className="p-3 text-right">Return Value</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filteredReturns.map(r => (
                <tr key={r.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3 font-mono font-bold text-orange-400">{r.returnNumber}</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">{r.debitNoteNumber}</td>
                  <td className="p-3 font-mono text-sky-400">{r.poNumber}</td>
                  <td className="p-3 font-semibold text-[#211B17]">{r.supplierName}</td>
                  <td className="p-3 text-[#544B45] font-mono text-[11px]">{r.returnDate}</td>
                  <td className="p-3 font-semibold text-[#211B17]">{r.actionRequested}</td>
                  <td className="p-3 text-right font-mono font-extrabold text-amber-400">
                    ₹{r.totalReturnAmount?.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-semibold border border-orange-500/30">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                <label className="block text-[#70665F] mb-1">Select Purchase Order</label>
                <select
                  value={selectedPoId}
                  onChange={(e) => setSelectedPoId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                >
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
