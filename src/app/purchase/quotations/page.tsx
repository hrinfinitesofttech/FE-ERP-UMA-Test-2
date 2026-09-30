'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  FileCheck2,
  Plus,
  Search,
  Eye,
  CheckCircle2,
  DollarSign,
  Building,
  Calendar,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { SupplierQuotation, SupplierQuotationItem } from '../../../types/purchase';

export default function SupplierQuotationsPage() {
  const { supplierQuotations, addSupplierQuotation, rfqs, suppliers, currentUser } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [rfqFilter, setRfqFilter] = useState('ALL');

  // Modals
  const [viewQuote, setViewQuote] = useState<SupplierQuotation | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);

  // Form State
  const [newRfqId, setNewRfqId] = useState(rfqs[0]?.id || 'RFQ-001');
  const [newSupplierId, setNewSupplierId] = useState(suppliers[0]?.id || 'SUP-001');
  const [newRefNumber, setNewRefNumber] = useState(`SQ-REF-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newQuoteDate, setNewQuoteDate] = useState('2026-10-02');
  const [newValidUntil, setNewValidUntil] = useState('2026-11-02');
  const [newFreightCharges, setNewFreightCharges] = useState(5000);
  const [newGstPercentage, setNewGstPercentage] = useState(18);

  const [quoteItems, setQuoteItems] = useState<Partial<SupplierQuotationItem>[]>([
    {
      itemCode: 'RM-MS-12MM',
      itemName: 'IS 2062 Grade E250 MS Plate 12mm',
      specification: 'Size 2500x6000mm',
      category: 'Raw Material',
      unitOfMeasure: 'KG',
      quotedQuantity: 2500,
      unitPrice: 65,
      totalPrice: 162500,
      discountPercentage: 0,
      gstPercentage: 18,
      netPrice: 191750,
      leadTimeDays: 7,
      technicalCompliant: true,
    },
  ]);

  const filteredQuotes = supplierQuotations.filter(q => {
    if (rfqFilter !== 'ALL' && q.rfqId !== rfqFilter) return false;
    if (searchQuery) {
      const queryStr = searchQuery?.toLowerCase();
      return (
        q.quotationNumber?.toLowerCase().includes(queryStr) ||
        q.supplierName?.toLowerCase().includes(queryStr) ||
        q.supplierQuotationRef?.toLowerCase().includes(queryStr)
      );
    }
    return true;
  });

  const handleRecordQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rfqObj = rfqs.find(r => r.id === newRfqId);
    const suppObj = suppliers.find(s => s.id === newSupplierId);
    if (!rfqObj || !suppObj) return;

    const formattedItems: SupplierQuotationItem[] = quoteItems.map((qi, idx) => ({
      id: `SQI-${Date.now()}-${idx}`,
      quotationId: '',
      itemCode: qi.itemCode || 'ITEM-001',
      itemName: qi.itemName || 'Quoted Item',
      specification: qi.specification || '',
      category: (qi.category as any) || 'Raw Material',
      unitOfMeasure: qi.unitOfMeasure || 'NOS',
      quotedQuantity: Number(qi.quotedQuantity || 1),
      unitPrice: Number(qi.unitPrice || 0),
      totalPrice: Number(qi.quotedQuantity || 1) * Number(qi.unitPrice || 0),
      discountPercentage: 0,
      gstPercentage: newGstPercentage,
      netPrice: (Number(qi.quotedQuantity || 1) * Number(qi.unitPrice || 0)) * (1 + newGstPercentage / 100),
      leadTimeDays: Number(qi.leadTimeDays || 7),
      technicalCompliant: true,
      remarks: 'Comply with spec',
    }));

    const subTotal = formattedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxTotal = (subTotal * newGstPercentage) / 100;
    const grandTotal = subTotal + taxTotal + newFreightCharges;

    const newQuotation: SupplierQuotation = {
      id: `SQ-${Date.now()}`,
      quotationNumber: `SQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      rfqId: rfqObj.id,
      rfqNumber: rfqObj.rfqNumber,
      supplierId: suppObj.id,
      supplierName: suppObj.name,
      supplierQuotationRef: newRefNumber,
      quotationDate: newQuoteDate,
      validityDate: newValidUntil,
      paymentTerms: suppObj.paymentTerms,
      deliveryTerms: 'FOR Destination',
      leadTimeDays: 7,
      currency: 'INR',
      subTotal: subTotal,
      taxTotal: taxTotal,
      freightCharges: newFreightCharges,
      grandTotal: grandTotal,
      technicalStatus: 'Compliant',
      items: formattedItems,
      recordedBy: `${currentUser.firstName} ${currentUser.lastName}`,
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addSupplierQuotation(newQuotation);
    setShowRecordModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBE3DB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold border border-amber-500/30">
              SUPPLIER QUOTATIONS
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Supplier Quotations Register</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Recorded vendor price bids, lead times & technical compliance for evaluation.
          </p>
        </div>

        <button
          onClick={() => setShowRecordModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          Record Supplier Quotation
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#70665F]" />
            <input
              type="text"
              placeholder="Search Quotation No, Supplier, Ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-amber-500 w-64"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#70665F]">RFQ:</span>
            <select
              value={rfqFilter}
              onChange={(e) => setRfqFilter(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-xs text-[#211B17] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All RFQs</option>
              {rfqs.map(r => (
                <option key={r.id} value={r.id}>{r.rfqNumber} ({r.jobId})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-[#70665F]">
          Showing <span className="text-[#211B17] font-bold">{filteredQuotes.length}</span> received quotations
        </div>
      </div>

      {/* Quotations List Table */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3">Quotation ID & Ref</th>
                <th className="p-3">Supplier Name</th>
                <th className="p-3">RFQ Reference</th>
                <th className="p-3">Quote Date</th>
                <th className="p-3">Lead Time</th>
                <th className="p-3 text-right">Grand Total (Inc Tax)</th>
                <th className="p-3">Tech Compliance</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filteredQuotes.map(q => (
                <tr key={q.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3 font-mono font-bold text-amber-400">
                    {q.quotationNumber}
                    <div className="text-[10px] text-[#70665F]">{q.supplierQuotationRef}</div>
                  </td>
                  <td className="p-3 font-semibold text-[#211B17]">{q.supplierName}</td>
                  <td className="p-3 font-mono text-crm-brand-500">{q.rfqNumber}</td>
                  <td className="p-3 font-mono text-[#544B45] text-[11px]">{q.quotationDate}</td>
                  <td className="p-3 font-mono text-[#544B45]">{q.leadTimeDays} Days</td>
                  <td className="p-3 text-right font-mono font-extrabold text-emerald-400">
                    ₹{q.grandTotal?.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" /> {q.technicalStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setViewQuote(q)}
                      className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#FAF7F2] text-[#544B45] hover:text-[#211B17] transition"
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

      {/* VIEW QUOTE MODAL */}
      {viewQuote && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl">
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                  SUPPLIER QUOTATION
                </span>
                <h2 className="text-xl font-black text-[#211B17] mt-1">{viewQuote.quotationNumber}</h2>
              </div>
              <button onClick={() => setViewQuote(null)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-4 p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <div>
                  <div className="text-[#70665F]">Supplier:</div>
                  <div className="font-bold text-[#211B17]">{viewQuote.supplierName}</div>
                </div>
                <div>
                  <div className="text-[#70665F]">Subtotal:</div>
                  <div className="font-mono text-[#544B45]">₹{viewQuote.subTotal?.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[#70665F]">Tax (GST):</div>
                  <div className="font-mono text-[#544B45]">₹{viewQuote.taxTotal?.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[#70665F]">Grand Total:</div>
                  <div className="font-mono font-extrabold text-emerald-400">₹{viewQuote.grandTotal?.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#211B17] mb-2">Quoted Line Items</h4>
                <div className="border border-[#EBE3DB] rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF7F2] text-[#70665F]">
                      <tr>
                        <th className="p-2.5">Item Name</th>
                        <th className="p-2.5 text-right">Quoted Qty</th>
                        <th className="p-2.5 text-right">Unit Rate</th>
                        <th className="p-2.5 text-right">Total Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE3DB]">
                      {viewQuote.items.map(it => (
                        <tr key={it.id}>
                          <td className="p-2.5 font-semibold text-[#211B17]">{it.itemName}</td>
                          <td className="p-2.5 text-right font-mono">{it.quotedQuantity} {it.unitOfMeasure}</td>
                          <td className="p-2.5 text-right font-mono">₹{it.unitPrice}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-400">₹{it.totalPrice?.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FAF7F2] border-t border-[#EBE3DB] flex justify-end">
              <button onClick={() => setViewQuote(null)} className="px-4 py-2 bg-[#FAF7F2] text-[#211B17] font-bold rounded-xl">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD QUOTATION MODAL */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between">
              <h2 className="text-lg font-black text-[#211B17]">Record Received Supplier Quotation</h2>
              <button onClick={() => setShowRecordModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordQuoteSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#70665F] mb-1">Select RFQ</label>
                  <select
                    value={newRfqId || rfqs[0]?.id || ''}
                    onChange={(e) => setNewRfqId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                  >
                    {rfqs.length === 0 ? (
                      <option value="">No RFQs Available</option>
                    ) : (
                      rfqs.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.rfqNumber || r.id} {r.jobId ? `(${r.jobId})` : ''} - {r.status || 'Active'}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Select Bidding Supplier</label>
                  <select
                    value={newSupplierId}
                    onChange={(e) => setNewSupplierId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#70665F] mb-1">Vendor Quotation Ref No</label>
                  <input
                    type="text"
                    value={newRefNumber}
                    onChange={(e) => setNewRefNumber(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Quotation Date</label>
                  <input
                    type="date"
                    value={newQuoteDate}
                    onChange={(e) => setNewQuoteDate(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Validity Date</label>
                  <input
                    type="date"
                    value={newValidUntil}
                    onChange={(e) => setNewValidUntil(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#EBE3DB]">
                <button type="button" onClick={() => setShowRecordModal(false)} className="px-4 py-2 bg-[#FAF7F2] text-[#211B17] rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl">
                  Save Received Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
