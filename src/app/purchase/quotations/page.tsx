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
  const [newRfqId, setNewRfqId] = useState('');
  const [newSupplierId, setNewSupplierId] = useState('');
  const [newRefNumber, setNewRefNumber] = useState('');
  const [newQuoteDate, setNewQuoteDate] = useState('');
  const [newValidUntil, setNewValidUntil] = useState('');
  const [newFreightCharges, setNewFreightCharges] = useState(0);
  const [newGstPercentage, setNewGstPercentage] = useState(18);

  const [quoteItems, setQuoteItems] = useState<Partial<SupplierQuotationItem>[]>([]);

  // Initialize form defaults
  React.useEffect(() => {
    if (!newQuoteDate) {
      setNewQuoteDate(new Date().toISOString().split('T')[0]);
    }
    if (!newValidUntil) {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setNewValidUntil(d.toISOString().split('T')[0]);
    }
    if (!newRefNumber) {
      setNewRefNumber(`SQ-REF-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [newQuoteDate, newValidUntil, newRefNumber]);

  // Sync RFQ and Supplier dropdowns
  React.useEffect(() => {
    if (rfqs.length > 0 && !newRfqId) {
      setNewRfqId(rfqs[0].id);
    }
  }, [rfqs, newRfqId]);

  React.useEffect(() => {
    if (suppliers.length > 0 && !newSupplierId) {
      setNewSupplierId(suppliers[0].id);
    }
  }, [suppliers, newSupplierId]);

  // When RFQ changes, auto-populate line items from RFQ
  React.useEffect(() => {
    const activeRfq = rfqs.find(r => r.id === newRfqId) || rfqs[0];
    if (activeRfq && Array.isArray(activeRfq.items) && activeRfq.items.length > 0) {
      setQuoteItems(
        activeRfq.items.map((it: any) => {
          const qty = Number(it.requiredQuantity || it.required_quantity || 1);
          const price = Number(it.targetPrice || it.target_price || it.estimatedUnitPrice || 100);
          return {
            itemCode: it.itemCode || it.item_code || 'ITEM',
            itemName: it.itemName || it.item_name || 'Item',
            specification: it.specification || '',
            category: it.category || 'Raw Material',
            unitOfMeasure: it.unitOfMeasure || it.unit_of_measure || 'NOS',
            quotedQuantity: qty,
            unitPrice: price,
            totalPrice: qty * price,
            discountPercentage: 0,
            gstPercentage: 18,
            netPrice: qty * price * 1.18,
            leadTimeDays: 7,
            technicalCompliant: true,
          };
        })
      );
    } else if (quoteItems.length === 0) {
      setQuoteItems([
        {
          itemCode: 'ITEM-001',
          itemName: 'Quoted Item',
          specification: 'Standard Specification',
          category: 'Raw Material',
          unitOfMeasure: 'NOS',
          quotedQuantity: 10,
          unitPrice: 500,
          totalPrice: 5000,
          discountPercentage: 0,
          gstPercentage: 18,
          netPrice: 5900,
          leadTimeDays: 7,
          technicalCompliant: true,
        },
      ]);
    }
  }, [newRfqId, rfqs]);

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

  const handleItemChange = (idx: number, field: keyof SupplierQuotationItem, val: any) => {
    setQuoteItems(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      if (field === 'quotedQuantity' || field === 'unitPrice' || field === 'discountPercentage') {
        const qty = Number(updated[idx].quotedQuantity || 0);
        const price = Number(updated[idx].unitPrice || 0);
        const disc = Number(updated[idx].discountPercentage || 0);
        const lineSub = qty * price * (1 - disc / 100);
        updated[idx].totalPrice = lineSub;
        updated[idx].netPrice = lineSub * (1 + newGstPercentage / 100);
      }
      return updated;
    });
  };

  const handleRecordQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveRfqId = newRfqId || rfqs[0]?.id;
    const effectiveSupplierId = newSupplierId || suppliers[0]?.id;

    if (!effectiveRfqId) {
      alert('Please select a valid RFQ.');
      return;
    }
    if (!effectiveSupplierId) {
      alert('Please select a supplier.');
      return;
    }

    const rfqObj = rfqs.find(r => r.id === effectiveRfqId || r.rfqNumber === effectiveRfqId);
    const suppObj = suppliers.find(s => s.id === effectiveSupplierId);
    if (!rfqObj) {
      alert('Selected RFQ not found in database.');
      return;
    }
    if (!suppObj) {
      alert('Selected supplier not found in database.');
      return;
    }

    const formattedItems: SupplierQuotationItem[] = quoteItems.map((qi, idx) => {
      const qty = Number(qi.quotedQuantity || 1);
      const price = Number(qi.unitPrice || 0);
      const tot = qty * price;
      return {
        id: `SQI-${Date.now()}-${idx}`,
        quotationId: '',
        itemCode: qi.itemCode || 'ITEM-001',
        itemName: qi.itemName || 'Quoted Item',
        specification: qi.specification || '',
        category: (qi.category as any) || 'Raw Material',
        unitOfMeasure: qi.unitOfMeasure || 'NOS',
        quotedQuantity: qty,
        unitPrice: price,
        totalPrice: tot,
        discountPercentage: Number(qi.discountPercentage || 0),
        gstPercentage: newGstPercentage,
        netPrice: tot * (1 + newGstPercentage / 100),
        leadTimeDays: Number(qi.leadTimeDays || 7),
        technicalCompliant: qi.technicalCompliant ?? true,
        remarks: 'Quotation verified',
      };
    });

    const subTotal = formattedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxTotal = (subTotal * newGstPercentage) / 100;
    const grandTotal = subTotal + taxTotal + Number(newFreightCharges || 0);

    const newQuotation: SupplierQuotation = {
      id: `SQ-${Date.now()}`,
      quotationNumber: `SQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      rfqId: rfqObj.id,
      rfqNumber: rfqObj.rfqNumber,
      supplierId: suppObj.id,
      supplierName: suppObj.name,
      supplierQuotationRef: newRefNumber || `REF-${Date.now()}`,
      quotationDate: newQuoteDate,
      validityDate: newValidUntil,
      paymentTerms: suppObj.paymentTerms || '30 Days Credit',
      deliveryTerms: 'FOR Destination',
      leadTimeDays: 7,
      currency: 'INR',
      subTotal: subTotal,
      taxTotal: taxTotal,
      freightCharges: Number(newFreightCharges || 0),
      grandTotal: grandTotal,
      technicalStatus: 'Compliant',
      items: formattedItems,
      recordedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Purchase Admin',
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
        <div
          onClick={() => setShowRecordModal(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between">
              <h2 className="text-lg font-black text-[#211B17]">Record Received Supplier Quotation</h2>
              <button onClick={() => setShowRecordModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {rfqs.length === 0 ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#211B17] text-base">No RFQs Found in Database</h3>
                <p className="text-xs text-[#70665F] max-w-md mx-auto">
                  A Supplier Quotation requires an active RFQ (Request for Quotation) issued to vendors. Please create an RFQ first.
                </p>
                <div className="pt-2">
                  <a
                    href="/purchase/rfq"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    Go to RFQ Register →
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRecordQuoteSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#70665F] mb-1 font-semibold">Select RFQ *</label>
                    <select
                      value={newRfqId || rfqs[0]?.id || ''}
                      onChange={(e) => setNewRfqId(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                      required
                    >
                      {rfqs.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.rfqNumber || r.id} {r.jobId ? `(${r.jobId})` : ''} - {r.status || 'Active'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#70665F] mb-1 font-semibold">Select Bidding Supplier *</label>
                    <select
                      value={newSupplierId || suppliers[0]?.id || ''}
                      onChange={(e) => setNewSupplierId(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                      required
                    >
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#70665F] mb-1 font-semibold">Vendor Quotation Ref No *</label>
                    <input
                      type="text"
                      value={newRefNumber}
                      onChange={(e) => setNewRefNumber(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono focus:outline-none focus:border-crm-brand-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#70665F] mb-1 font-semibold">Quotation Date *</label>
                    <input
                      type="date"
                      value={newQuoteDate}
                      onChange={(e) => setNewQuoteDate(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono focus:outline-none focus:border-crm-brand-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#70665F] mb-1 font-semibold">Validity Date *</label>
                    <input
                      type="date"
                      value={newValidUntil}
                      onChange={(e) => setNewValidUntil(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono focus:outline-none focus:border-crm-brand-600"
                      required
                    />
                  </div>
                </div>

                {/* Quoted Line Items Table */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-[#211B17]">Quoted Line Items ({quoteItems.length})</span>
                    <span className="text-[10px] text-[#70665F]">Auto-loaded from selected RFQ</span>
                  </div>
                  <div className="border border-[#EBE3DB] rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#FAF7F2] text-[#70665F]">
                        <tr>
                          <th className="p-2.5">Item Name & Spec</th>
                          <th className="p-2.5 text-right w-24">Quoted Qty</th>
                          <th className="p-2.5 text-right w-28">Unit Rate (₹)</th>
                          <th className="p-2.5 text-right w-24">Disc %</th>
                          <th className="p-2.5 text-right w-32">Total (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EBE3DB]">
                        {quoteItems.map((it, idx) => (
                          <tr key={idx} className="bg-white">
                            <td className="p-2.5">
                              <div className="font-semibold text-[#211B17]">{it.itemName}</div>
                              <div className="text-[10px] text-[#70665F] font-mono">{it.itemCode} {it.specification ? `• ${it.specification}` : ''}</div>
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                value={it.quotedQuantity}
                                onChange={(e) => handleItemChange(idx, 'quotedQuantity', Number(e.target.value))}
                                className="w-20 bg-[#FAF7F2] border border-[#EBE3DB] p-1 rounded text-right font-mono text-[#211B17]"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                value={it.unitPrice}
                                onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                                className="w-24 bg-[#FAF7F2] border border-[#EBE3DB] p-1 rounded text-right font-mono text-[#211B17]"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                value={it.discountPercentage || 0}
                                onChange={(e) => handleItemChange(idx, 'discountPercentage', Number(e.target.value))}
                                className="w-16 bg-[#FAF7F2] border border-[#EBE3DB] p-1 rounded text-right font-mono text-[#211B17]"
                              />
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-emerald-600">
                              ₹{((it.quotedQuantity || 0) * (it.unitPrice || 0) * (1 - (it.discountPercentage || 0) / 100))?.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#70665F] mb-1 font-semibold">Freight Charges (₹)</label>
                    <input
                      type="number"
                      value={newFreightCharges}
                      onChange={(e) => setNewFreightCharges(Number(e.target.value))}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono focus:outline-none focus:border-crm-brand-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[#70665F] mb-1 font-semibold">GST Percentage (%)</label>
                    <select
                      value={newGstPercentage}
                      onChange={(e) => setNewGstPercentage(Number(e.target.value))}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                    >
                      <option value={0}>0% (Exempt)</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18% Standard</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-[#EBE3DB]">
                  <button type="button" onClick={() => setShowRecordModal(false)} className="px-4 py-2 bg-[#FAF7F2] text-[#211B17] font-bold rounded-xl hover:bg-stone-200 transition">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow transition">
                    Save Received Quotation
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
