'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
import { ERPListPageLayout } from '../../../components/ui/ERPListPageLayout';

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
  const [newTerms, setNewTerms] = useState('');

  // Sync defaults when modal opens or purchaseRequisitions loads
  React.useEffect(() => {
    if (purchaseRequisitions.length > 0 && !newPrId) {
      setNewPrId(purchaseRequisitions[0].id);
    }
  }, [purchaseRequisitions, newPrId]);

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

  const columns = [
    {
      key: 'rfqNumber',
      header: 'RFQ NUMBER',
      isCodeLink: true,
      onCodeClick: (rfq: RequestForQuotations) => setViewRFQ(rfq),
      cell: (rfq: RequestForQuotations) => (
        <span className="font-semibold text-[#7C3AED] hover:underline cursor-pointer">{rfq.rfqNumber}</span>
      ),
    },
    {
      key: 'jobId',
      header: 'PR & JOB REFERENCE',
      cell: (rfq: RequestForQuotations) => (
        <div>
          <div className="font-semibold text-gray-800">{rfq.jobId}</div>
          <div className="text-[11px] text-gray-400">PR Ref: {rfq.prNumber}</div>
        </div>
      ),
    },
    {
      key: 'rfqDate',
      header: 'ISSUE DATE',
      cell: (rfq: RequestForQuotations) => <span className="text-gray-600 font-mono text-[11px]">{rfq.rfqDate}</span>,
    },
    {
      key: 'dueDate',
      header: 'DUE DATE',
      cell: (rfq: RequestForQuotations) => <span className="font-semibold text-amber-700 font-mono text-[11px]">{rfq.dueDate}</span>,
    },
    {
      key: 'invitedSuppliers',
      header: 'INVITED SUPPLIERS',
      cell: (rfq: RequestForQuotations) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {rfq.invitedSuppliers.map((s, idx) => (
            <span
              key={idx}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                s.quotationReceived
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              {s.supplierName}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'quotesRecv',
      header: 'QUOTES RECV',
      cell: (rfq: RequestForQuotations) => {
        const receivedCount = rfq.invitedSuppliers.filter(s => s.quotationReceived).length;
        return (
          <span className="font-mono font-semibold text-gray-800">
            {receivedCount} / {rfq.invitedSuppliers.length}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: (rfq: RequestForQuotations) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
            rfq.status === 'Sent to Suppliers'
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : rfq.status === 'Quotation Received'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-gray-50 text-gray-700 border-gray-200'
          }`}
        >
          {rfq.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'ACTION',
      cell: (rfq: RequestForQuotations) => (
        <button
          onClick={() => setViewRFQ(rfq)}
          className="p-1 hover:bg-purple-50 rounded text-gray-500 hover:text-[#7C3AED] transition cursor-pointer"
          title="View RFQ"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const handleExport = () => {
    if (rfqs.length === 0) return;
    const headers = ['RFQ No', 'Job ID', 'PR Ref', 'Issue Date', 'Due Date', 'Suppliers Count', 'Quotes Recv', 'Status'];
    const rows = rfqs.map((r) => [
      r.rfqNumber,
      `"${r.jobId}"`,
      `"${r.prNumber}"`,
      r.rfqDate,
      r.dueDate,
      r.invitedSuppliers.length,
      r.invitedSuppliers.filter(s => s.quotationReceived).length,
      `"${r.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rfqs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <ERPListPageLayout<RequestForQuotations>
        breadcrumbs={['DASHBOARD', 'PURCHASE', 'REQUEST FOR QUOTATIONS (RFQ)']}
        columns={columns}
        data={rfqs}
        addNewLabel="+ Create New RFQ"
        onAddNew={() => setShowCreateModal(true)}
        onExport={handleExport}
        searchPlaceholder="Search RFQ No, PR No, Job ID..."
      />

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
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-xl text-xs flex items-center justify-between">
                      <span>No suppliers found. Please register suppliers in Supplier Master.</span>
                      <Link href="/purchase/suppliers" className="font-bold underline text-amber-800 hover:text-amber-900 ml-2">
                        Open Supplier Master →
                      </Link>
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
                    placeholder="e.g. FOR Destination Price including GST 18%, Payment 30 Days Credit, Delivery within 2 weeks..."
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
