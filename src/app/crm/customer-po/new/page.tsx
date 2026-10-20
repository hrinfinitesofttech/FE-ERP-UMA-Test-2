'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '@/context/ERPContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/context/ToastContext';
import {
  ArrowLeft,
  Briefcase,
  Sparkles,
  Upload,
  CheckCircle2,
} from 'lucide-react';

function CustomerPOFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { quotations, customers, addCustomerPO, updateQuotationStatus } = useERP();

  const prefillQuotationId = searchParams.get('quotationId') || '';
  const prefillCustomerId = searchParams.get('customerId') || '';

  const [selectedQuotationId, setSelectedQuotationId] = useState(prefillQuotationId);
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d.toISOString().split('T')[0];
  });
  const [customerId, setCustomerId] = useState(prefillCustomerId);
  const [customerName, setCustomerName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [poAmount, setPoAmount] = useState<number | string>(0);
  const [paymentTerms, setPaymentTerms] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [remarks, setRemarks] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');

  // Find matched quotation
  const matchedQuotation = quotations.find(
    (q) => q.id === selectedQuotationId || q.quotationNumber === selectedQuotationId
  );
  const latestRev = matchedQuotation?.revisions?.[matchedQuotation.revisions.length - 1];

  // Auto-fill from Quotation
  useEffect(() => {
    if (matchedQuotation) {
      const qSummary = matchedQuotation.latestSummary;
      const rev = latestRev;
      const cust = customers.find(
        (c) =>
          c.id === matchedQuotation.customerId ||
          c.companyName.toLowerCase() === matchedQuotation.customerName.toLowerCase()
      );

      setCustomerId(matchedQuotation.customerId || cust?.id || `cust-${matchedQuotation.id}`);
      setCustomerName(matchedQuotation.customerName || cust?.companyName || '');
      setContactPerson(matchedQuotation.contactPerson || cust?.contactPerson || '');
      setContactMobile(matchedQuotation.contactMobile || cust?.mobile || '');
      setContactEmail(matchedQuotation.contactEmail || cust?.email || '');

      const grandTotal = rev?.grandTotal || qSummary?.grandTotal || 0;
      setPoAmount(grandTotal);

      if (rev?.paymentTerms) {
        setPaymentTerms(rev.paymentTerms);
      } else if (!paymentTerms) {
        setPaymentTerms('30% Advance with order, 70% against proforma invoice before dispatch');
      }

      if (rev?.deliveryTime) {
        setDeliveryLocation(rev.deliveryTime);
      }

      if (rev?.scopeOfSupply || rev?.technicalSpecs) {
        setRemarks(
          `Scope: ${rev.scopeOfSupply || ''}${rev.technicalSpecs ? `\nSpecs: ${rev.technicalSpecs}` : ''}`
        );
      }
    }
  }, [matchedQuotation, latestRev, customers]);

  // Handle manual customer change if no quotation selected
  const handleCustomerChange = (newCustId: string) => {
    setCustomerId(newCustId);
    const c = customers.find((cust) => cust.id === newCustId);
    if (c) {
      setCustomerName(c.companyName);
      setContactPerson(c.contactPerson);
      setContactMobile(c.mobile);
      setContactEmail(c.email);
      if (c.paymentTerms) setPaymentTerms(c.paymentTerms);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!poNumber.trim()) {
      toast.warning('Required Field', 'Please enter a valid Customer Purchase Order Number.');
      return;
    }

    const finalCustName = customerName || matchedQuotation?.customerName || 'Valued Customer';

    const newPO = addCustomerPO({
      poNumber: poNumber.trim(),
      poDate,
      customerId: customerId || matchedQuotation?.customerId || 'CUST-DIRECT',
      customerName: finalCustName,
      quotationId: matchedQuotation?.id || '',
      quotationNumber: matchedQuotation
        ? `${matchedQuotation.quotationNumber} (${latestRev?.revisionNumber || 'Rev-00'})`
        : 'Direct PO',
      poAmount: Number(poAmount) || 0,
      paymentTerms: paymentTerms || 'Standard Payment Terms',
      deliveryDate: deliveryDate || '2026-11-30',
      status: 'received',
      remarks:
        remarks ||
        `Customer PO ${poNumber.trim()} registered for ${finalCustName} under quotation ${matchedQuotation?.quotationNumber || 'Direct'}.`,
      attachmentUrl: attachedFileName || undefined,
    });

    if (matchedQuotation) {
      updateQuotationStatus(
        matchedQuotation.id,
        latestRev?.revisionNumber || 'Rev-00',
        'approved'
      );
    }

    toast.success('Customer PO Created', `PO ${poNumber.trim()} registered successfully.`);
    router.push('/crm/customer-po');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 text-xs pb-10">
      <Link
        href="/crm/customer-po"
        className="inline-flex items-center gap-1.5 text-crm-brand-700 hover:underline font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Customer Purchase Orders
      </Link>

      <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl p-6 shadow-sm space-y-6">
        {/* Header Title */}
        <div className="border-b border-slate-100 dark:border-[#EBE3DB] pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-crm-brand-700" />
              Register Customer Purchase Order (Inward PO)
            </h1>
            <p className="text-[#70665F] mt-0.5">
              Record accepted client purchase order, link formal sales quotation, and capture confirmed order value.
            </p>
          </div>
          <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold rounded-lg text-xs">
            STATUS: RECEIVED
          </span>
        </div>

        {/* Linked Quotation Autofill Banner */}
        {matchedQuotation && (
          <div className="p-3.5 bg-gradient-to-r from-purple-50 via-[#FAF7F2] to-emerald-50 border border-purple-200 rounded-xl flex items-center justify-between text-slate-800 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  Auto-filled from Quotation: <span className="font-mono text-purple-800 font-extrabold">{matchedQuotation.quotationNumber}</span> ({latestRev?.revisionNumber || 'Rev-00'}) — {matchedQuotation.customerName}
                </span>
                <span className="text-[11px] text-[#70665F]">
                  Equipment Scope: <strong className="text-slate-800">{latestRev?.items?.[0]?.productName || matchedQuotation.latestSummary?.machineProduct}</strong> • Contact: {matchedQuotation.contactPerson}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#70665F] block">Quotation Value</span>
              <span className="font-mono font-bold text-emerald-700 text-xs">
                {formatCurrency(latestRev?.grandTotal || matchedQuotation.latestSummary?.grandTotal || 0)}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* QUOTATION SELECTOR */}
          <div className="p-4 bg-slate-50 dark:bg-[#FAF7F2]/50 border border-slate-200 dark:border-[#EBE3DB] rounded-xl space-y-2">
            <label className="block text-slate-700 dark:text-[#544B45] font-bold">
              Link Commercial Quotation (Recommended)
            </label>
            <select
              value={selectedQuotationId}
              onChange={(e) => setSelectedQuotationId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-white border rounded-lg font-medium text-slate-900 text-xs"
            >
              <option value="">-- Direct Customer PO (Without Quotation) --</option>
              {quotations.map((q) => {
                const lastRev = q.revisions?.[q.revisions.length - 1];
                const amt = lastRev?.grandTotal || q.latestSummary?.grandTotal || 0;
                const prod = lastRev?.items?.[0]?.productName || q.latestSummary?.machineProduct || 'Machine';
                return (
                  <option key={q.id} value={q.id}>
                    {q.quotationNumber} — {q.customerName} — {prod} ({formatCurrency(amt)})
                  </option>
                );
              })}
            </select>
            <p className="text-[11px] text-[#70665F]">
              Selecting a quotation will automatically populate customer details, line items, and confirmed total amount.
            </p>
          </div>

          {/* PO MANDATORY DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-[#544B45] font-bold mb-1">
                Customer PO Number *
              </label>
              <input
                type="text"
                required
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="e.g. PO/ADC/2026/894"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-mono font-bold text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-[#544B45] font-bold mb-1">
                PO Date *
              </label>
              <input
                type="date"
                required
                value={poDate}
                onChange={(e) => setPoDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-[#544B45] font-bold mb-1">
                Confirmed PO Amount (₹ Incl. Taxes) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-mono font-bold">₹</span>
                <input
                  type="number"
                  required
                  min={0}
                  value={poAmount}
                  onChange={(e) => setPoAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg font-mono font-bold text-emerald-700 text-xs"
                />
              </div>
            </div>
          </div>

          {/* ATTACH CUSTOMER PO DOCUMENT */}
          <div className="pt-2 border-t border-slate-100 dark:border-[#EBE3DB]">
            <label className="block text-slate-700 dark:text-[#544B45] font-bold mb-1">
              Attach Customer PO Document (PDF / Scan)
            </label>
            <div className="p-4 border-2 border-dashed border-[#E7DED5] rounded-xl text-center bg-slate-50/50 dark:bg-[#FAF7F2]/40 space-y-2">
              <Upload className="w-5 h-5 mx-auto text-slate-400" />
              <span className="block text-slate-600 font-semibold text-xs">
                {attachedFileName ? (
                  <span className="text-emerald-700 font-bold font-mono inline-flex items-center gap-1.5 justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Attached: {attachedFileName}</span>
                  </span>
                ) : (
                  'Upload scanned Customer Purchase Order file'
                )}
              </span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAttachedFileName(file.name);
                  }
                }}
                className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-crm-brand-50 file:text-crm-brand-700 hover:file:bg-crm-brand-100"
              />
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-[#EBE3DB]">
            <Link
              href="/crm/customer-po"
              className="px-4 py-2 border rounded-lg hover:bg-slate-100 font-semibold text-xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-xl font-bold shadow-md transition cursor-pointer active:scale-95 text-xs"
            >
              Save & Register Customer PO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewCustomerPOPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#70665F]">Loading Customer PO registration form...</div>}>
      <CustomerPOFormContent />
    </Suspense>
  );
}
