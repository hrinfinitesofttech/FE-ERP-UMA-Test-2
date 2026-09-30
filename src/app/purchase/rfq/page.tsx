'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  ClipboardList,
  Plus,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  Send,
  Building,
  Calendar,
  X,
} from 'lucide-react';
import { RequestForQuotations, RFQItem } from '../../../types/purchase';

export default function RFQPage() {
  const { rfqs, addRFQ, purchaseRequisitions, suppliers, projectJobs, currentUser } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [viewRFQ, setViewRFQ] = useState<RequestForQuotations | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New RFQ Form
  const [newPrId, setNewPrId] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newSelectedSuppliers, setNewSelectedSuppliers] = useState<string[]>([]);
  const [newTerms, setNewTerms] = useState('FOR Destination Price including GST 18%, Payment 30 Days Credit');

  // Sync defaults when modal opens or purchaseRequisitions loads
  React.useEffect(() => {
    if (purchaseRequisitions.length > 0 && !newPrId) {
      setNewPrId(purchaseRequisitions[0].id);
    }
  }, [purchaseRequisitions, newPrId]);

  React.useEffect(() => {
    if (suppliers.length > 0 && newSelectedSuppliers.length === 0) {
      setNewSelectedSuppliers(suppliers.slice(0, 2).map(s => s.id));
    }
  }, [suppliers, newSelectedSuppliers]);

  // Set default due date (10 days from now)
  React.useEffect(() => {
    if (!newDueDate) {
      const d = new Date();
      d.setDate(d.getDate() + 10);
      setNewDueDate(d.toISOString().split('T')[0]);
    }
  }, [newDueDate]);

  const filteredRFQs = rfqs.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery?.toLowerCase();
      return (
        r.rfqNumber?.toLowerCase().includes(q) ||
        r.jobId?.toLowerCase().includes(q) ||
        r.prNumber?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleSupplier = (supId: string) => {
    setNewSelectedSuppliers(prev =>
      prev.includes(supId) ? prev.filter(id => id !== supId) : [...prev, supId]
    );
  };

  const handleCreateRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    const effectivePrId = newPrId || purchaseRequisitions[0]?.id;
    if (!effectivePrId) {
      alert('Please select a valid Purchase Requisition.');
      return;
    }
    const prObj = purchaseRequisitions.find(p => p.id === effectivePrId || p.prNumber === effectivePrId);
    if (!prObj) {
      alert('Selected Purchase Requisition not found in database.');
      return;
    }

    const invitedList = suppliers
      .filter(s => newSelectedSuppliers.includes(s.id))
      .map(s => ({
        supplierId: s.id,
        supplierName: s.name,
        email: s.email,
        quotationReceived: false,
      }));

    const prItems = Array.isArray(prObj.items) ? prObj.items : [];
    const rfqItems: RFQItem[] = prItems.map((pi: any, idx: number) => ({
      id: `RFQI-${Date.now()}-${idx}`,
      rfqId: '',
      itemCode: pi.itemCode || pi.item_code || 'ITEM',
      itemName: pi.itemName || pi.item_name || 'Item',
      specification: pi.specification || '',
      category: pi.category || 'Raw Material',
      unitOfMeasure: pi.unitOfMeasure || pi.unit_of_measure || 'NOS',
      requiredQuantity: Number(pi.requiredQuantity || pi.required_quantity || 1),
      drawingNumber: pi.drawingNumber || pi.drawing_number || '',
      targetPrice: Number(pi.estimatedUnitPrice || pi.estimated_unit_price || 0),
    }));

    const newRFQ: RequestForQuotations = {
      id: `RFQ-${Date.now()}`,
      rfqNumber: `RFQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      prId: prObj.id,
      prNumber: prObj.prNumber,
      projectId: prObj.projectId,
      jobId: prObj.jobId,
      rfqDate: new Date().toISOString().split('T')[0],
      dueDate: newDueDate,
      status: 'Sent to Suppliers',
      invitedSuppliers: invitedList,
      items: rfqItems,
      termsAndConditions: newTerms,
      issuedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Purchase Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addRFQ(newRFQ);
    setShowCreateModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBE3DB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-600/20 text-crm-brand-500 text-xs font-mono font-bold border border-crm-brand-600/30">
              RFQ MANAGEMENT
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Request for Quotation (RFQ) Register</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Issue digital RFQs to multiple verified suppliers for competitive quotation comparison.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-crm-brand-700/30 transition"
        >
          <Plus className="w-4 h-4" />
          Create New RFQ
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#70665F]" />
            <input
              type="text"
              placeholder="Search RFQ No, PR No, Job ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-600 w-64"
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
              <option value="Draft">Draft</option>
              <option value="Sent to Suppliers">Sent to Suppliers</option>
              <option value="Quotation Received">Quotation Received</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#70665F]">
          Showing <span className="text-[#211B17] font-bold">{filteredRFQs.length}</span> RFQs
        </div>
      </div>

      {/* RFQ List Table */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3">RFQ Number</th>
                <th className="p-3">PR & Job Reference</th>
                <th className="p-3">Issue Date</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Invited Suppliers</th>
                <th className="p-3 text-center">Quotes Recv</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filteredRFQs.map(rfq => {
                const receivedCount = rfq.invitedSuppliers.filter(s => s.quotationReceived).length;

                return (
                  <tr key={rfq.id} className="hover:bg-[#FAF7F2]/40 transition">
                    <td className="p-3 font-mono font-bold text-crm-brand-500">{rfq.rfqNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-amber-400">{rfq.jobId}</div>
                      <div className="text-[10px] text-[#70665F]">PR Ref: {rfq.prNumber}</div>
                    </td>
                    <td className="p-3 text-[#544B45] font-mono text-[11px]">{rfq.rfqDate}</td>
                    <td className="p-3 font-mono text-amber-400 font-semibold text-[11px]">{rfq.dueDate}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {rfq.invitedSuppliers.map((s, idx) => (
                          <span
                            key={idx}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                              s.quotationReceived
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-[#FAF7F2] text-[#70665F]'
                            }`}
                          >
                            {s.supplierName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-[#211B17]">
                      {receivedCount} / {rfq.invitedSuppliers.length}
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        rfq.status === 'Sent to Suppliers' ? 'bg-crm-brand-600/20 text-crm-brand- border-crm-brand-600/30' :
                        rfq.status === 'Quotation Received' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-[#FAF7F2] text-[#70665F]'
                      }`}>
                        {rfq.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setViewRFQ(rfq)}
                        className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#FAF7F2] text-[#544B45] hover:text-[#211B17] transition"
                        title="View RFQ"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW RFQ MODAL */}
      {viewRFQ && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl">
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono bg-crm-brand-600/20 text-crm-brand- px-2 py-0.5 rounded font-bold">
                  RFQ DETAILS
                </span>
                <h2 className="text-xl font-black text-[#211B17] mt-1">{viewRFQ.rfqNumber}</h2>
              </div>
              <button onClick={() => setViewRFQ(null)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-4 p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <div>
                  <div className="text-[#70665F]">Job Reference:</div>
                  <div className="font-bold text-amber-400">{viewRFQ.jobId}</div>
                </div>
                <div>
                  <div className="text-[#70665F]">Due Date:</div>
                  <div className="font-bold text-amber-400 font-mono">{viewRFQ.dueDate}</div>
                </div>
                <div>
                  <div className="text-[#70665F]">Issued By:</div>
                  <div className="font-semibold text-[#211B17]">{viewRFQ.issuedBy}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#211B17] mb-2">Requested Line Items</h4>
                <div className="border border-[#EBE3DB] rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF7F2] text-[#70665F]">
                      <tr>
                        <th className="p-2.5">Item Code</th>
                        <th className="p-2.5">Item Name & Spec</th>
                        <th className="p-2.5 text-right">Required Qty</th>
                        <th className="p-2.5 text-right">Target Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE3DB]">
                      {viewRFQ.items.map(it => (
                        <tr key={it.id}>
                          <td className="p-2.5 font-mono text-crm-brand-500">{it.itemCode}</td>
                          <td className="p-2.5 font-semibold text-[#211B17]">{it.itemName} ({it.specification})</td>
                          <td className="p-2.5 text-right font-mono text-[#211B17]">{it.requiredQuantity} {it.unitOfMeasure}</td>
                          <td className="p-2.5 text-right font-mono text-emerald-400">₹{it.targetPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FAF7F2] border-t border-[#EBE3DB] flex justify-end">
              <button onClick={() => setViewRFQ(null)} className="px-4 py-2 bg-[#FAF7F2] text-[#211B17] font-bold rounded-xl">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE RFQ MODAL */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between">
              <h2 className="text-lg font-black text-[#211B17]">Create & Issue Request for Quotation (RFQ)</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {purchaseRequisitions.length === 0 ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#211B17] text-base">No Purchase Requisitions Available</h3>
                <p className="text-xs text-[#70665F] max-w-md mx-auto">
                  An RFQ requires an existing Purchase Requisition (PR) saved in the database. Please create and save a Purchase Requisition first.
                </p>
                <div className="pt-2">
                  <a
                    href="/purchase/requisition"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    Go to Purchase Requisitions →
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateRFQ} className="p-6 space-y-4 text-xs overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#70665F] mb-1 font-semibold">Select Purchase Requisition *</label>
                    <select
                      value={newPrId}
                      onChange={(e) => setNewPrId(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                      required
                    >
                      {purchaseRequisitions.map(pr => (
                        <option key={pr.id} value={pr.id}>
                          {pr.prNumber} - {pr.jobId} ({Array.isArray(pr.items) ? pr.items.length : pr.totalItems || 0} items)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#70665F] mb-1 font-semibold">RFQ Response Due Date *</label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono focus:outline-none focus:border-crm-brand-600"
                      required
                    >
                    </input>
                  </div>
                </div>

                {/* Selected PR Items Preview */}
                {(() => {
                  const selPR = purchaseRequisitions.find(p => p.id === newPrId) || purchaseRequisitions[0];
                  if (!selPR || !selPR.items || selPR.items.length === 0) return null;
                  return (
                    <div className="p-3 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl space-y-2">
                      <div className="text-[11px] font-bold text-[#211B17] flex items-center justify-between">
                        <span>Items from {selPR.prNumber} ({selPR.items.length} items):</span>
                        <span className="font-mono text-amber-500">Est. Total: ₹{selPR.estimatedCost?.toLocaleString('en-IN') || 0}</span>
                      </div>
                      <div className="max-h-28 overflow-y-auto space-y-1">
                        {selPR.items.map((it: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded border border-[#EBE3DB]/60">
                            <span className="font-semibold text-[#211B17]">{it.itemName || it.itemCode}</span>
                            <span className="font-mono text-[#70665F]">{it.requiredQuantity} {it.unitOfMeasure}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div>
                  <label className="block text-[#70665F] mb-2 font-bold">Select Suppliers to Invite for Quote *</label>
                  {suppliers.length === 0 ? (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl text-xs">
                      No suppliers found. Please register suppliers in Supplier Master.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-3 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl">
                      {suppliers.map(sup => (
                        <label key={sup.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer transition">
                          <input
                            type="checkbox"
                            checked={newSelectedSuppliers.includes(sup.id)}
                            onChange={() => toggleSupplier(sup.id)}
                            className="rounded bg-white text-crm-brand-600"
                          />
                          <span className="text-[#211B17] font-medium truncate">{sup.name}</span>
                          <span className="text-[10px] text-[#70665F] flex-shrink-0">({sup.category})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[#70665F] mb-1 font-semibold">Commercial Terms & Guidelines</label>
                  <textarea
                    value={newTerms}
                    onChange={(e) => setNewTerms(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] h-16 focus:outline-none focus:border-crm-brand-600"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-[#EBE3DB]">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-[#FAF7F2] text-[#211B17] font-bold rounded-xl hover:bg-stone-200 transition">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-white font-bold rounded-xl flex items-center gap-1.5 shadow transition">
                    <Send className="w-3.5 h-3.5" /> Issue RFQ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
