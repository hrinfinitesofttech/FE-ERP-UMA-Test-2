'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '../../../../context/ERPContext';
import { toast } from '@/context/ToastContext';
import { api } from '../../../../lib/apiClient';
import { StatusBadge } from '../../../../components/workflow/StatusBadge';
import { formatCurrency, formatDate } from '../../../../lib/utils';
import { printContent } from '@/lib/printUtils';
import {
  ArrowLeft,
  Printer,
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Plus,
  Send,
  Building,
  Calendar,
  Layers,
  Sparkles,
  PhoneCall,
  MessageSquare,
  Mail,
  Loader2,
  FileDown,
  FileText,
} from 'lucide-react';
import { QuotationRevision } from '../../../../types/crm';

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { quotations, leads, enquiries, customers, addQuotationRevision, updateQuotationStatus, currentUser, addCustomerPO, addFollowUp } = useERP();

  const quotationId = String(params.id);
  const quotation = quotations.find((q) => q.id === quotationId);

  // Link lead, enquiry, customer to automatically discover contact email
  const linkedLead = leads.find(
    (l) =>
      (quotation?.leadId && (l.id === quotation.leadId || l.leadNo === quotation.leadId)) ||
      (quotation?.customerName && l.companyName?.toLowerCase().trim() === quotation.customerName?.toLowerCase().trim())
  );
  const linkedEnquiry = enquiries.find(
    (e) => quotation?.enquiryId && (e.id === quotation.enquiryId || e.enquiryNo === quotation.enquiryId)
  );
  const linkedCustomer = customers.find(
    (c) => quotation?.customerId && (c.id === quotation.customerId || c.customerCode === quotation.customerId)
  );

  const resolvedEmail = String(
    quotation?.contactEmail ||
    linkedLead?.email ||
    linkedEnquiry?.customerEmail ||
    linkedCustomer?.email ||
    ''
  ).trim();

  const [selectedRevNum, setSelectedRevNum] = useState<string>(quotation?.currentRevision || 'Rev-00');
  const [showRevModal, setShowRevModal] = useState(false);
  const [showPoModal, setShowPoModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d.toISOString().split('T')[0];
  });
  const [remarks, setRemarks] = useState('');
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error' | 'info', message: string, duration = 6000) => {
    setActionFeedback({ type, message });
    if (duration > 0) {
      setTimeout(() => setActionFeedback(null), duration);
    }
  };

  // Quotation Follow-up Modal State
  const [showFlwModal, setShowFlwModal] = useState(false);
  const [flwDate, setFlwDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [flwTime, setFlwTime] = useState('11:30 AM');
  const [flwPurpose, setFlwPurpose] = useState('');
  const [flwChannel, setFlwChannel] = useState<'call' | 'whatsapp' | 'email' | 'meeting'>('call');

  const setQuickFlwDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFlwDate(d.toISOString().split('T')[0]);
  };

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
    showFeedback('success', `Quotation revision ${currentRev.revisionNumber} officially APPROVED.`);
  };

  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleSendEmailQuotation = async (customEmail?: string) => {
    const recipient = String(customEmail || targetEmail || resolvedEmail || quotation?.contactEmail || '').trim();
    if (!recipient) {
      setTargetEmail('');
      setShowEmailModal(true);
      return;
    }

    setIsSendingEmail(true);
    showFeedback('info', `Dispatching quotation proposal to ${recipient}...`, 0);

    try {
      // Dispatch email via Django backend SMTP endpoint with active revision details
      const quoAny = quotation as any;
      const enrichedQuotation = {
        ...quotation,
        contactEmail: recipient,
        currentRevision: currentRev?.revisionNumber || quotation.currentRevision || 'Rev-00',
        items: currentRev?.items || quoAny.items || [],
        subtotal: currentRev?.subTotal ?? (currentRev as any)?.subtotal ?? quoAny.subtotal ?? 0,
        taxAmount: currentRev?.taxAmount ?? quoAny.taxAmount ?? 0,
        grandTotal: currentRev?.grandTotal ?? quoAny.grandTotal ?? 0,
        machineProduct: currentRev?.items?.[0]?.productName || quoAny.machineProduct || '',
      };

      // Ensure quotation record in context and DB is permanently saved with this email
      if (quotation && quotation.contactEmail !== recipient) {
        quotation.contactEmail = recipient;
        api.crm.quotations.update(quotation.id, { contactEmail: recipient }).catch(() => {});
      }

      const res = await api.crm.quotations.sendEmail(quotation.id, recipient, enrichedQuotation);

      setShowEmailModal(false);

      if (res && res.success === false) {
        showFeedback(
          'error',
          `Quotation updated with ${recipient}, but SMTP dispatch reported: ${res.error || 'Server SMTP transport unavailable'}.`,
          10000
        );
      } else {
        // Update quotation status to sent in local context
        updateQuotationStatus(quotation.id, currentRev.revisionNumber, 'sent');
        const pdfNotice = res?.pdfFilename ? ` with attached official PDF (${res.pdfFilename})` : ' with attached official PDF';
        showFeedback('success', `Quotation ${quotation.quotationNumber} (${currentRev.revisionNumber}) email successfully sent to ${recipient}${pdfNotice}!`, 7000);
      }
    } catch (err: any) {
      console.warn('Backend email dispatch notice:', err);
      const errDetail = err?.data?.error || err?.message || 'SMTP server error.';
      showFeedback('error', `Email sending error: ${errDetail}`, 10000);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await api.crm.quotations.downloadPdf(
        quotation.id,
        currentRev.revisionNumber,
        `Quotation_${quotation.quotationNumber}_${currentRev.revisionNumber}.pdf`
      );
      toast.success('PDF Downloaded', `Official PDF for ${quotation.quotationNumber} (${currentRev.revisionNumber}) downloaded.`);
    } catch (err: any) {
      console.warn('PDF download fallback to direct window open:', err);
      const directUrl = api.crm.quotations.getPdfUrl(quotation.id, currentRev.revisionNumber);
      window.open(directUrl, '_blank');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleCustomerAccept = () => {
    updateQuotationStatus(quotation.id, currentRev.revisionNumber, 'accepted');
    setShowPoModal(true);
  };

  const handleCreateCustomerPO = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPoNumber = poNumber.trim() || `PO/${quotation.customerName.slice(0, 4)?.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'GEN'}/${Date.now().toString().slice(-4)}`;
    addCustomerPO({
      poNumber: cleanPoNumber,
      poDate: poDate || new Date().toISOString().split('T')[0],
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      quotationId: quotation.id,
      quotationNumber: `${quotation.quotationNumber} (${currentRev.revisionNumber})`,
      poAmount: currentRev.grandTotal,
      paymentTerms: currentRev.paymentTerms || '30 Days Credit',
      deliveryDate: deliveryDate || '2026-11-30',
      status: 'received',
      remarks: remarks || `Customer accepted quotation ${quotation.quotationNumber} (${currentRev.revisionNumber}) and issued formal purchase order.`,
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
    showFeedback('info', `Created new editable revision: ${nextRevNum}`, 4000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 text-xs pb-10">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/crm/quotations" className="inline-flex items-center gap-1.5 text-crm-brand-700 hover:underline font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Quotations Master
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="px-3 py-1.5 bg-[#FAF0E6] hover:bg-[#F3ECE4] text-[#75401F] border border-[#E7DED5] rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition active:scale-95"
            title="Download official letterhead PDF matching quotation format"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span>Download PDF</span>
          </button>
          <button
            onClick={() => printContent('printable-quotation-sheet', { title: `Quotation_${quotation.quotationNumber}_${currentRev.revisionNumber}` })}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#FAF7F2] text-slate-700 dark:text-[#544B45] rounded-lg font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Quotation Sheet</span>
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div
          className={`p-3.5 rounded-xl font-semibold print:hidden flex items-start gap-2.5 border transition-all ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : actionFeedback.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-sm'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : actionFeedback.type === 'error' ? (
              <XCircle className="w-4 h-4 text-rose-600" />
            ) : (
              <Info className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <div className="flex-1 text-xs leading-relaxed">
            {actionFeedback.message}
          </div>
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

          {/* Direct Action Buttons (Always directly visible) */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* 1. Send Email Quotation (Directly Visible) */}
            <button
              onClick={() => {
                setTargetEmail(quotation.contactEmail || resolvedEmail);
                setShowEmailModal(true);
              }}
              disabled={isSendingEmail}
              className="px-3.5 py-1.5 bg-crm-brand-700 hover:bg-crm-brand-800 disabled:opacity-60 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer text-xs"
              title={`Send Quotation via Email to ${quotation.contactEmail || resolvedEmail || quotation.customerName}`}
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending Email...</span>
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  <span>{currentRev.status === 'sent' ? 'Resend Email' : 'Send Email Quotation'}</span>
                </>
              )}
            </button>

            {/* 2. Customer PO (Directly Available) */}
            <button
              onClick={() => {
                if (currentRev.status !== 'accepted') {
                  updateQuotationStatus(quotation.id, currentRev.revisionNumber, 'accepted');
                }
                setShowPoModal(true);
              }}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm text-xs cursor-pointer transition active:scale-95"
              title="Record Customer Purchase Order (PO)"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Customer PO</span>
            </button>

            {/* 3. WhatsApp Direct Share (Directly Available) */}
            <a
              href={
                quotation.contactMobile
                  ? `https://wa.me/91${quotation.contactMobile.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                      `Dear ${quotation.contactPerson || quotation.customerName},\n\nGreetings from UMA Techno Fab Pvt. Ltd.\n\nPlease find details for Quotation ${quotation.quotationNumber} (${currentRev.revisionNumber}) for ${formatCurrency(currentRev.grandTotal)}.\nValidity: ${formatDate(quotation.validUntil)}.\n\nKindly review and let us know your feedback.`
                    )}`
                  : `https://wa.me/?text=${encodeURIComponent(
                      `Dear ${quotation.contactPerson || quotation.customerName},\n\nGreetings from UMA Techno Fab Pvt. Ltd.\n\nPlease find details for Quotation ${quotation.quotationNumber} (${currentRev.revisionNumber}) for ${formatCurrency(currentRev.grandTotal)}.\nValidity: ${formatDate(quotation.validUntil)}.\n\nKindly review and let us know your feedback.`
                    )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              title={
                quotation.contactMobile
                  ? `Share quotation via WhatsApp (+91 ${quotation.contactMobile.slice(-10)})`
                  : 'Share quotation via WhatsApp'
              }
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm text-xs cursor-pointer transition active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Quote</span>
            </a>

            {/* 4. Schedule Follow-up (Directly Available) */}
            <button
              onClick={() => {
                setFlwPurpose(`Quotation follow-up for ${quotation.quotationNumber} (${currentRev.revisionNumber})`);
                setShowFlwModal(true);
              }}
              className="px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#F3ECE4] text-[#75401F] border border-[#E7DED5] rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-2xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Schedule Follow-up</span>
            </button>

            {currentRev.status === 'accepted' && (
              <Link
                href="/crm/customer-po"
                className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3ECE4] text-[#75401F] border border-[#E7DED5] rounded-lg font-bold text-xs flex items-center gap-1 transition"
              >
                <span>View PO Register</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Quotation Document Sheet Preview (Formal Letterhead) */}
      <div id="printable-quotation-sheet" className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl p-6 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0 print:m-0">
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
            <span className="text-slate-600 dark:text-[#544B45] block">Attn: {quotation.contactPerson || linkedLead?.contactPerson || 'Purchase Head'}</span>
            <div className="mt-0.5">
              {quotation.contactEmail || resolvedEmail ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-600 font-medium font-mono text-xs">
                  <Mail className="w-3 h-3" />
                  {quotation.contactEmail || resolvedEmail}
                  {!quotation.contactEmail && linkedLead?.email && (
                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1 rounded font-sans">from Lead</span>
                  )}
                </span>
              ) : (
                <span className="text-amber-600 text-[10px] flex items-center gap-1">
                  <Mail className="w-3 h-3" /> No email linked
                </span>
              )}
            </div>
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

        {/* Commercial Terms & Scope removed per user request */}
      </div>

      {/* Customer PO Inward Modal */}
      {showPoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-white border border-[#E7DED5] rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#211B17]">Customer PO Inward Receipt</h3>
            <p className="text-[#70665F]">
              Customer has accepted {quotation.quotationNumber} ({currentRev.revisionNumber}). Record their formal purchase order.
            </p>
            <form onSubmit={handleCreateCustomerPO} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Customer PO Number *</label>
                <input
                  type="text"
                  required
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="e.g. PO/ADC/2026/9999"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-[#E7DED5] rounded-lg font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">PO Date</label>
                  <input
                    type="date"
                    value={poDate}
                    onChange={(e) => setPoDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-[#E7DED5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Target Delivery Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-[#E7DED5] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Confirmed PO Amount (₹)</label>
                <input
                  type="text"
                  disabled
                  value={formatCurrency(currentRev.grandTotal)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-[#FAF7F2] border border-[#E7DED5] rounded-lg font-mono font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Remarks / Scope Notes</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Special terms, site location or instructions..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-[#E7DED5] rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPoModal(false)}
                  className="px-4 py-2 border border-[#E7DED5] rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Confirm & Inward PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Schedule Quotation Follow-up Modal */}
      {showFlwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-white border border-[#E7DED5] rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-crm-brand-700" />
              Schedule Quotation Follow-up
            </h3>
            <p className="text-[#70665F] text-xs">
              Keep track of client feedback and next steps for {quotation.quotationNumber} ({currentRev.revisionNumber}).
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addFollowUp({
                  leadOrCustomerId: quotation.id,
                  leadOrCustomerName: `${quotation.customerName} (${quotation.quotationNumber})`,
                  entityType: 'quotation',
                  quotationId: quotation.id,
                  type: flwChannel,
                  assignedToId: currentUser?.id || 'EMP-001',
                  assignedToName: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Sales Team',
                  date: flwDate,
                  time: flwTime,
                  priority: 'high',
                  purpose: flwPurpose || `Follow-up on quotation ${quotation.quotationNumber}`,
                  notes: `Commercial follow-up for ${formatCurrency(currentRev.grandTotal)}`,
                  status: 'pending',
                });
                setShowFlwModal(false);
                showFeedback('success', `Scheduled next follow-up on ${formatDate(flwDate)}.`);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Quick Date Presets</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickFlwDate(2)}
                    className="flex-1 py-1 px-2 rounded-lg bg-[#FAF7F2] hover:bg-[#F3ECE4] text-[#75401F] font-bold border border-[#E7DED5] text-center"
                  >
                    In 2 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickFlwDate(7)}
                    className="flex-1 py-1 px-2 rounded-lg bg-[#FAF7F2] hover:bg-[#F3ECE4] text-[#75401F] font-bold border border-[#E7DED5] text-center"
                  >
                    In 7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickFlwDate(15)}
                    className="flex-1 py-1 px-2 rounded-lg bg-[#FAF7F2] hover:bg-[#F3ECE4] text-[#75401F] font-bold border border-[#E7DED5] text-center"
                  >
                    In 15 Days
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Follow-up Due Date *</label>
                  <input
                    type="date"
                    required
                    value={flwDate}
                    onChange={(e) => setFlwDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DED5] rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Channel</label>
                  <select
                    value={flwChannel}
                    onChange={(e) => setFlwChannel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DED5] rounded-lg"
                  >
                    <option value="call">Phone Call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="meeting">In-Person Meeting</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Discussion Purpose / Next Action *</label>
                <input
                  type="text"
                  required
                  value={flwPurpose}
                  onChange={(e) => setFlwPurpose(e.target.value)}
                  placeholder="e.g. Call client purchase head to review Limpet jacket specs"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E7DED5] rounded-lg font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E7DED5]">
                <button
                  type="button"
                  onClick={() => setShowFlwModal(false)}
                  className="px-4 py-2 border border-[#E7DED5] rounded-lg font-semibold text-[#544B45]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Save in Follow-up Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Quotation Send Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#2C241F] rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-[#E7DED5]">
            <div className="flex items-center justify-between border-b border-[#E7DED5] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-crm-brand-50 text-crm-brand-700 flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#211B17] dark:text-white">
                    Send Commercial Quotation Proposal
                  </h3>
                  <p className="text-[11px] text-[#70665F]">
                    Dispatches formal quotation with attached engineering PDF.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="text-[#70665F] hover:text-[#211B17] text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendEmailQuotation(targetEmail);
              }}
              className="space-y-4 text-xs"
            >
              <div className="p-3 bg-[#FAF7F2] dark:bg-[#1f1915] rounded-xl border border-[#E7DED5] space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#70665F]">Customer:</span>
                  <strong className="text-[#211B17] dark:text-white font-bold">{quotation.customerName}</strong>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#70665F]">Quotation Reference:</span>
                  <span className="font-mono font-bold text-crm-brand-700">{quotation.quotationNumber} ({currentRev.revisionNumber})</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#70665F]">PDF Attachment:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">Quotation_{quotation.quotationNumber}_{currentRev.revisionNumber}.pdf</span>
                </div>
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1 flex items-center justify-between">
                  <span>Recipient Customer / Lead Email ID <span className="text-rose-500">*</span></span>
                  {linkedLead?.email && targetEmail === linkedLead.email && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                      ✓ Auto-populated from Lead ({linkedLead.leadNo})
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#70665F] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    placeholder="Enter customer email address"
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] dark:bg-[#1f1915] border border-[#E7DED5] rounded-lg font-mono text-sm font-semibold text-[#211B17] dark:text-white focus:outline-none focus:border-crm-brand-700"
                  />
                </div>
                <p className="text-[10px] text-[#70665F] mt-1">
                  The quotation details and official generated PDF proposal will be dispatched to this email address.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E7DED5]">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  disabled={isSendingEmail}
                  className="px-4 py-2 border border-[#E7DED5] rounded-lg font-semibold text-[#544B45] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail || !targetEmail.trim()}
                  className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 disabled:opacity-60 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Email Proposal...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Commercial Proposal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
