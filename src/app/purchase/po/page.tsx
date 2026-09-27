'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Printer,
  Building,
  Calendar,
  X,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';
import { PurchaseOrder, POItem } from '../../../types/purchase';

export default function PurchaseOrderPage() {
  const { purchaseOrders, addPurchaseOrder, supplierQuotations, suppliers, projectJobs, currentUser } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');

  // Modals
  const [viewPO, setViewPO] = useState<PurchaseOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New PO Form
  const [selectedQuoteId, setSelectedQuoteId] = useState(supplierQuotations[0]?.id || 'SQ-001');
  const [newDeliveryDate, setNewDeliveryDate] = useState('2026-10-25');
  const [newPaymentTerms, setNewPaymentTerms] = useState('30 Days Credit after GRN');
  const [newSpecialInstructions, setNewSpecialInstructions] = useState('Test certificates (MTC) required along with material delivery.');

  const filteredPOs = purchaseOrders.filter(po => {
    if (statusFilter !== 'ALL' && po.status !== statusFilter) return false;
    if (projectFilter !== 'ALL' && po.projectId !== projectFilter) return false;
    if (searchQuery) {
      const q = searchQuery?.toLowerCase();
      return (
        po.poNumber?.toLowerCase().includes(q) ||
        po.supplierName?.toLowerCase().includes(q) ||
        po.jobId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sqObj = supplierQuotations.find(s => s.id === selectedQuoteId);
    if (!sqObj) return;

    const poItems: POItem[] = sqObj.items.map((it, idx) => ({
      id: `POI-${Date.now()}-${idx}`,
      poId: '',
      itemCode: it.itemCode,
      itemName: it.itemName,
      specification: it.specification,
      category: it.category,
      unitOfMeasure: it.unitOfMeasure,
      orderedQuantity: it.quotedQuantity,
      receivedQuantity: 0,
      unitPrice: it.unitPrice,
      totalPrice: it.totalPrice,
      gstPercentage: it.gstPercentage,
      netPrice: it.netPrice,
      hsnCode: '72085110',
      drawingNumber: 'DWG-JOB-001-REV01',
    }));

    const newPO: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      poNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      revisionNumber: 0,
      projectId: 'PRJ-2026-0001',
      jobId: 'JOB-2026-001',
      quotationId: sqObj.id,
      supplierId: sqObj.supplierId,
      supplierName: sqObj.supplierName,
      supplierGstin: '24AAAAA0000A1Z5',
      poDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: newDeliveryDate,
      paymentTerms: newPaymentTerms,
      deliveryTerms: 'FOR Destination (Uma Techno Fab GIDC Works)',
      dispatchMode: 'By Road Truck',
      currency: 'INR',
      subTotal: sqObj.subTotal || sqObj.subtotal || 0,
      taxTotal: sqObj.taxTotal || 0,
      freightCharges: sqObj.freightCharges || 0,
      grandTotal: sqObj.grandTotal,
      status: 'Submitted',
      items: poItems,
      approvalTier: 'Tier 1 - Executive',
      specialInstructions: newSpecialInstructions,
      createdBy: `${currentUser.firstName} ${currentUser.lastName}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addPurchaseOrder(newPO);
    setShowCreateModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBE3DB] print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
              PURCHASE ORDERS
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Purchase Orders (PO) Registry</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Official legally-binding purchase contracts with revision history log & Project + Job mapping.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          Create PO from Quotation
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#70665F]" />
            <input
              type="text"
              placeholder="Search PO No, Supplier, Job ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#70665F]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-xs text-[#211B17] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Submitted">Submitted (Pending Approval)</option>
              <option value="Approved">Approved</option>
              <option value="Ordered">Ordered / Sent</option>
              <option value="Partially Received">Partially Received</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#70665F]">
          Showing <span className="text-[#211B17] font-bold">{filteredPOs.length}</span> Purchase Orders
        </div>
      </div>

      {/* PO Table */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3">PO Number & Rev</th>
                <th className="p-3">Project & Job Reference</th>
                <th className="p-3">Supplier Name</th>
                <th className="p-3">PO Date</th>
                <th className="p-3">Expected Delivery</th>
                <th className="p-3 text-right">Grand Total (Inc GST)</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filteredPOs.map(po => (
                <tr key={po.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3 font-mono font-bold text-emerald-400">
                    {po.poNumber} <span className="text-[10px] text-[#70665F] font-normal">Rev-{po.revisionNumber}</span>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-amber-400">{po.jobId}</div>
                    <div className="text-[10px] text-[#70665F]">{po.projectId}</div>
                  </td>
                  <td className="p-3 font-semibold text-[#211B17]">{po.supplierName}</td>
                  <td className="p-3 text-[#544B45] font-mono text-[11px]">{po.poDate}</td>
                  <td className="p-3 font-mono text-amber-400 font-semibold text-[11px]">{po.expectedDeliveryDate}</td>
                  <td className="p-3 text-right font-mono font-extrabold text-emerald-400">
                    ₹{po.grandTotal?.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                      po.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      po.status === 'Partially Received' ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' :
                      po.status === 'Submitted' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-[#FAF7F2] text-[#70665F]'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setViewPO(po)}
                      className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#FAF7F2] text-[#544B45] hover:text-[#211B17] transition"
                      title="View & Print PO"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW PO PRINTABLE MODAL */}
      {viewPO && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl">
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between print:hidden">
              <div>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                  OFFICIAL PURCHASE ORDER
                </span>
                <h2 className="text-xl font-black text-[#211B17] mt-1">
                  {viewPO.poNumber} <span className="text-xs text-[#70665F] font-mono">Rev-{viewPO.revisionNumber}</span>
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#FAF7F2] text-[#211B17] font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print PO
                </button>
                <button onClick={() => setViewPO(null)} className="text-[#70665F] hover:text-[#211B17] p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
              {/* Company & Supplier Header */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <div>
                  <h3 className="font-extrabold text-[#211B17] text-sm">UMA TECHNO FAB</h3>
                  <p className="text-[#70665F] text-[11px] mt-0.5">
                    Plot No. 45, GIDC Industrial Estate, Odhav, Ahmedabad, Gujarat - 382415<br />
                    GSTIN: 24AAACU1234F1Z9 | Email: purchase@umatechnofab.com
                  </p>
                </div>
                <div>
                  <div className="text-[#70665F] font-semibold">Vendor / Supplier:</div>
                  <h4 className="font-bold text-emerald-400 text-sm">{viewPO.supplierName}</h4>
                  <p className="text-[#70665F] text-[11px] mt-0.5 font-mono">
                    GSTIN: {viewPO.supplierGstin}<br />
                    Payment Terms: {viewPO.paymentTerms}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="font-bold text-[#211B17] mb-2 uppercase tracking-wider">Ordered Material Specifications</h4>
                <div className="border border-[#EBE3DB] rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold">
                      <tr>
                        <th className="p-2.5">Item Code</th>
                        <th className="p-2.5">Item Description & HSN</th>
                        <th className="p-2.5 text-right">Qty</th>
                        <th className="p-2.5 text-right">Unit Rate</th>
                        <th className="p-2.5 text-right">Tax (GST)</th>
                        <th className="p-2.5 text-right">Net Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE3DB]">
                      {viewPO.items.map(it => (
                        <tr key={it.id}>
                          <td className="p-2.5 font-mono text-emerald-400">{it.itemCode}</td>
                          <td className="p-2.5 font-semibold text-[#211B17]">
                            {it.itemName}
                            <div className="text-[10px] text-[#70665F]">HSN: {it.hsnCode} | Spec: {it.specification}</div>
                          </td>
                          <td className="p-2.5 text-right font-mono">{it.orderedQuantity} {it.unitOfMeasure}</td>
                          <td className="p-2.5 text-right font-mono">₹{it.unitPrice}</td>
                          <td className="p-2.5 text-right font-mono text-[#70665F]">{it.gstPercentage}%</td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-400">₹{it.netPrice?.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Financial Summary */}
              <div className="flex justify-end">
                <div className="w-64 bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB] space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-[#70665F]">
                    <span>Subtotal:</span>
                    <span>₹{viewPO.subTotal?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#70665F]">
                    <span>Tax (GST Total):</span>
                    <span>₹{viewPO.taxTotal?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#70665F]">
                    <span>Freight Charges:</span>
                    <span>₹{viewPO.freightCharges?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-[#EBE3DB] flex justify-between font-extrabold text-[#211B17] text-sm">
                    <span>Grand Total:</span>
                    <span className="text-emerald-400">₹{viewPO.grandTotal?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FAF7F2] border-t border-[#EBE3DB] flex justify-end print:hidden">
              <button onClick={() => setViewPO(null)} className="px-4 py-2 bg-[#FAF7F2] text-[#211B17] font-bold rounded-xl">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PO MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl">
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between">
              <h2 className="text-lg font-black text-[#211B17]">Create Purchase Order (PO)</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePOSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Select Approved Supplier Quotation</label>
                <select
                  value={selectedQuoteId}
                  onChange={(e) => setSelectedQuoteId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                >
                  {supplierQuotations.map(sq => (
                    <option key={sq.id} value={sq.id}>
                      {sq.quotationNumber} - {sq.supplierName} (Total: ₹{sq.grandTotal?.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Expected Delivery Date at Works</label>
                <input
                  type="date"
                  value={newDeliveryDate}
                  onChange={(e) => setNewDeliveryDate(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={newPaymentTerms}
                  onChange={(e) => setNewPaymentTerms(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-semibold"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#EBE3DB]">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-[#FAF7F2] text-[#211B17] rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">
                  Generate Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
