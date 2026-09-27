'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '../../../../context/ERPContext';
import { StatusBadge } from '../../../../components/workflow/StatusBadge';
import { formatCurrency, formatDate } from '../../../../lib/utils';
import {
  ArrowLeft,
  Printer,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Plus,
  Send,
  Building,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { QuotationRevision } from '../../../../types/crm';

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { quotations, addQuotationRevision, updateQuotationStatus, currentUser, addCustomerPO } = useERP();

  const quotationId = String(params.id);
  const quotation = quotations.find((q) => q.id === quotationId);

  const [selectedRevNum, setSelectedRevNum] = useState<string>(quotation?.currentRevision || 'Rev-00');
  const [showRevModal, setShowRevModal] = useState(false);
  const [showPoModal, setShowPoModal] = useState(false);
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState('2026-09-24');
  const [actionMsg, setActionMsg] = useState('');

  if (!quotation) {
    return (
      <div className="p-8 text-center text-[#70665F] text-xs">
        <p>Quotation not found ({quotationId}).</p>
        <Link href="/crm/quotations" className="text-crm-brand-700 font-bold underline mt-2 block">
          Return to Quotations
        </Link>
      </div>
    );
  }

  const currentRev = quotation.revisions.find((r) => r.revisionNumber === selectedRevNum) || quotation.revisions[quotation.revisions.length - 1];

  const handleApprove = () => {
    updateQuotationStatus(quotation.id, currentRev.revisionNumber, 'approved');
    setActionMsg(`Quotation revision ${currentRev.revisionNumber} officially APPROVED.`);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleSendToCustomer = () => {
    updateQuotationStatus(quotation.id, currentRev.revisionNumber, 'sent');
    setActionMsg(`Quotation revision ${currentRev.revisionNumber} sent to client.`);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleCustomerAccept = () => {
    updateQuotationStatus(quotation.id, currentRev.revisionNumber, 'accepted');
    setShowPoModal(true);
  };

  const handleCreateCustomerPO = (e: React.FormEvent) => {
    e.preventDefault();
    const createdPo = addCustomerPO({
      poNumber: poNumber || `PO/${quotation.customerName.slice(0, 4)?.toUpperCase()}/${Date.now().toString().slice(-4)}`,
      poDate,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      quotationId: quotation.id,
      quotationNumber: `${quotation.quotationNumber} (${currentRev.revisionNumber})`,
      poAmount: currentRev.grandTotal,
      paymentTerms: currentRev.paymentTerms,
      deliveryDate: '2026-11-30',
      status: 'received',
      remarks: 'Customer accepted quotation and issued formal purchase order.',
    });
    setShowPoModal(false);
    router.push('/crm/customer-po');
  };

  const handleCreateNextRevision = () => {
    const nextRevIndex = quotation.revisions.length;
    const nextRevNum = `Rev-0${nextRevIndex}`;

    const newRev: QuotationRevision = {
      ...currentRev,
      revisionNumber: nextRevNum,
      date: new Date().toISOString().split('T')[0],
      preparedBy: `${currentUser.firstName} ${currentUser.lastName}`,
      status: 'draft',
      approvedBy: undefined,
    };

    addQuotationRevision(quotation.id, newRev);
    setSelectedRevNum(nextRevNum);
    setActionMsg(`Created new editable revision: ${nextRevNum}`);
    setTimeout(() => setActionMsg(''), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 text-xs pb-10">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/crm/quotations" className="inline-flex items-center gap-1.5 text-crm-brand-700 hover:underline font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Quotations Master
        </Link>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#FAF7F2] text-slate-700 dark:text-[#544B45] rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Quotation Sheet</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold print:hidden">
          ✓ {actionMsg}
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl p-6 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-base bg-crm-brand-700 text-white px-2.5 py-0.5 rounded-lg">
                {quotation.quotationNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-crm-brand- text-crm-brand- font-mono font-bold">
                {currentRev.revisionNumber}
              </span>
              <StatusBadge status={currentRev.status as any} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#211B17] mt-1">{quotation.customerName}</h1>
            <p className="text-[#70665F]">Contact: {quotation.contactPerson} • {quotation.contactMobile}</p>
          </div>

          <div className="bg-slate-50 dark:bg-[#FAF7F2] p-3.5 rounded-xl border border-slate-200 dark:border-[#EBE3DB] text-right">
            <span className="text-[10px] text-[#70665F] font-semibold uppercase block">Grand Total Value</span>
            <span className="text-lg font-black text-emerald-600 block">{formatCurrency(currentRev.grandTotal)}</span>
            <span className="text-[10px] text-[#70665F]">Valid Until: {formatDate(quotation.validUntil)}</span>
          </div>
        </div>

        {/* Action Controls Strip */}
        <div className="pt-3 border-t border-slate-100 dark:border-[#EBE3DB] flex flex-wrap items-center justify-between gap-3">
          {/* Revision Selector */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 dark:text-[#70665F]">View Revision:</span>
            <div className="flex items-center gap-1">
              {quotation.revisions.map((rev) => (
                <button
                  key={rev.revisionNumber}
                  onClick={() => setSelectedRevNum(rev.revisionNumber)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs transition ${
                    selectedRevNum === rev.revisionNumber
                      ? 'bg-[#3E2723] text-white shadow-xs'
                      : 'bg-[#FAF7F2] border border-[#E7DED5] text-[#70665F] hover:bg-[#F3ECE4]'
                  }`}
                >
                  {rev.revisionNumber}
                </button>
              ))}
            </div>
            <button
              onClick={handleCreateNextRevision}
              className="px-2.5 py-1 bg-[#FAF0E6] text-[#75401F] hover:bg-[#F3ECE4] rounded-lg font-bold text-xs flex items-center gap-1 border border-[#E7DED5] transition cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Create Next Rev</span>
            </button>
          </div>

          {/* Workflow Status Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {currentRev.status === 'draft' && (
              <button
                onClick={handleApprove}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Proposal</span>
              </button>
            )}

            {currentRev.status === 'approved' && (
              <button
                onClick={handleSendToCustomer}
                className="px-3.5 py-1.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch to Customer</span>
              </button>
            )}

            {(currentRev.status === 'sent' || currentRev.status === 'negotiation' || currentRev.status === 'approved') && (
              <button
                onClick={handleCustomerAccept}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Customer Accepted (Receive PO)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quotation Document Sheet Preview (Formal Letterhead) */}
      <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl p-6 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0 print:m-0">
        {/* Letterhead Header */}
        <div className="flex justify-between items-start border-b-2 border-[#EBE3DB] dark:border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-[#211B17]">UMA TECHNO FAB PVT. LTD.</h2>
            <p className="text-[#70665F] text-[11px]">Plot No. 48/B, GIDC Industrial Estate, Makarpura, Vadodara - 390010</p>
            <span className="text-[10px] text-[#70665F] font-mono">GSTIN: 24AABCU9821R1ZX • PAN: AABCU9821R</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold font-mono text-crm-brand-700 block">{quotation.quotationNumber}</span>
            <span className="font-mono text-crm-brand-800 font-bold">{currentRev.revisionNumber}</span>
            <span className="text-[#70665F] text-[11px] block mt-0.5">Date: {formatDate(currentRev.date)}</span>
          </div>
        </div>

        {/* Customer Box */}
        <div className="p-3 bg-slate-50 dark:bg-[#FAF7F2]/60 rounded-xl grid grid-cols-2 gap-3 text-[11px]">
          <div>
            <span className="text-[#70665F] block font-semibold">Quotation Addressed To:</span>
            <strong className="text-slate-900 dark:text-[#211B17] block text-xs">{quotation.customerName}</strong>
            <span className="text-slate-600 dark:text-[#544B45] block">Attn: {quotation.contactPerson}</span>
            <span className="text-[#70665F] block">{quotation.contactEmail}</span>
          </div>
          <div className="text-right">
            <span className="text-[#70665F] block font-semibold">Prepared By:</span>
            <strong className="text-slate-900 dark:text-[#211B17] block">{currentRev.preparedBy}</strong>
            <span className="text-[#70665F] block">Validity: {formatDate(quotation.validUntil)}</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Bill of Quantities & Pricing</h3>
          <table className="w-full text-left border-collapse border border-slate-200 dark:border-[#EBE3DB]">
            <thead className="bg-slate-100 dark:bg-[#FAF7F2] text-slate-700 dark:text-[#544B45] font-bold text-[11px]">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Equipment Description</th>
                <th className="p-2 border text-center">Qty</th>
                <th className="p-2 border text-right">Unit Rate (₹)</th>
                <th className="p-2 border text-right">GST %</th>
                <th className="p-2 border text-right">Total Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#EBE3DB] text-[11px]">
              {currentRev.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-2 border text-center font-mono">{idx + 1}</td>
                  <td className="p-2 border">
                    <strong className="block text-slate-900 dark:text-[#211B17]">{item.productName}</strong>
                    <span className="text-[#70665F] text-[10px]">{item.description}</span>
                  </td>
                  <td className="p-2 border text-center font-mono font-bold">{item.quantity} {item.unit}</td>
                  <td className="p-2 border text-right font-mono">{formatCurrency(item.rate)}</td>
                  <td className="p-2 border text-right font-mono">{item.taxPercent}%</td>
                  <td className="p-2 border text-right font-mono font-bold text-slate-900 dark:text-[#211B17]">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 dark:bg-[#FAF7F2]/60 font-bold text-[11px]">
              <tr>
                <td colSpan={5} className="p-2 border text-right">Taxable Subtotal:</td>
                <td className="p-2 border text-right font-mono">{formatCurrency(currentRev.subTotal)}</td>
              </tr>
              <tr>
                <td colSpan={5} className="p-2 border text-right">Applicable GST Taxes:</td>
                <td className="p-2 border text-right font-mono">{formatCurrency(currentRev.taxAmount)}</td>
              </tr>
              <tr className="bg-slate-100 dark:bg-[#FAF7F2] text-xs">
                <td colSpan={5} className="p-2 border text-right font-black">Grand Total (INR):</td>
                <td className="p-2 border text-right font-mono font-black text-emerald-600">
                  {formatCurrency(currentRev.grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Commercial Terms */}
        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-[#EBE3DB] text-[11px]">
          <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Commercial Terms & Scope</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-[#FAF7F2]/40 rounded-xl border">
              <strong className="block mb-1 text-slate-800 dark:text-[#544B45]">Technical Scope & Codes:</strong>
              <p className="text-slate-600 dark:text-[#70665F]">{currentRev.technicalSpecs}</p>
              <strong className="block mt-2 mb-1 text-slate-800 dark:text-[#544B45]">Scope of Supply:</strong>
              <p className="text-slate-600 dark:text-[#70665F]">{currentRev.scopeOfSupply}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-[#FAF7F2]/40 rounded-xl border">
              <strong className="block mb-1 text-slate-800 dark:text-[#544B45]">Payment Terms:</strong>
              <p className="text-slate-600 dark:text-[#70665F]">{currentRev.paymentTerms}</p>
              <strong className="block mt-2 mb-1 text-slate-800 dark:text-[#544B45]">Delivery & Warranty:</strong>
              <p className="text-slate-600 dark:text-[#70665F]">Delivery: {currentRev.deliveryTime} • Warranty: {currentRev.warranty}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer PO Inward Modal */}
      {showPoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm">
          <div className="bg-white dark:bg-white border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#211B17]">Customer PO Inward Receipt</h3>
            <p className="text-[#70665F]">
              Customer has accepted {quotation.quotationNumber} ({currentRev.revisionNumber}). Record their formal purchase order.
            </p>
            <form onSubmit={handleCreateCustomerPO} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Customer PO Number *</label>
                <input
                  type="text"
                  required
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="e.g. PO/ABC/2026/89"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">PO Date</label>
                <input
                  type="date"
                  value={poDate}
                  onChange={(e) => setPoDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Confirmed PO Amount (₹)</label>
                <input
                  type="text"
                  disabled
                  value={formatCurrency(currentRev.grandTotal)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-[#FAF7F2] border rounded-lg font-mono font-bold text-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPoModal(false)}
                  className="px-4 py-2 border rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Confirm & Inward PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
