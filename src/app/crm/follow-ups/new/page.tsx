'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '../../../../context/ERPContext';
import { FollowUp } from '../../../../types/crm';
import {
  Calendar,
  Clock,
  User,
  Phone,
  PhoneCall,
  MessageSquare,
  Building2,
  FileText,
  Layers,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

function FollowUpFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramEnquiryId = searchParams.get('enquiryId');
  const paramLeadId = searchParams.get('leadId');
  const paramQuotationId = searchParams.get('quotationId');
  const paramCustomerId = searchParams.get('customerId');

  const {
    followUps,
    addFollowUp,
    leads,
    customers,
    enquiries,
    quotations,
    employees,
    availableEmployees,
  } = useERP();

  const allStaff =
    availableEmployees && availableEmployees.length > 0
      ? availableEmployees
      : employees && employees.length > 0
      ? employees
      : [];

  const todayStr = new Date().toISOString().split('T')[0];

  const [targetType, setTargetType] = useState<'lead' | 'enquiry' | 'quotation' | 'customer'>('lead');
  const [targetId, setTargetId] = useState('');
  const [followUpType, setFollowUpType] = useState<'call' | 'whatsapp' | 'email' | 'meeting' | 'visit'>('call');
  const [scheduledDate, setScheduledDate] = useState(todayStr);
  const [scheduledTime, setScheduledTime] = useState('11:00');
  const [productItem, setProductItem] = useState('');
  const [purpose, setPurpose] = useState('');
  const [assignedToId, setAssignedToId] = useState(allStaff[0]?.id || 'EMP-001');
  const [interestStatus, setInterestStatus] = useState<'interested' | 'not_interested' | 'in_discussion'>('interested');
  const [notes, setNotes] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync selected target details
  const applyTarget = (type: 'lead' | 'enquiry' | 'quotation' | 'customer', id: string) => {
    setTargetType(type);
    setTargetId(id);

    if (type === 'enquiry') {
      const enq = enquiries.find((e) => e.id === id || e.enquiryNo === id);
      if (enq) {
        setProductItem(enq.machineProduct || '');
        setPurpose(`Inquiry follow-up for ${enq.machineProduct}`);
        if (enq.assignedPersonId) {
          setAssignedToId(enq.assignedPersonId);
        }
      }
    } else if (type === 'lead') {
      const lead = leads.find((l) => l.id === id || l.leadNo === id);
      const enq = enquiries.find((e) => e.leadId === id || (lead && e.customerName === lead.companyName));
      if (enq) {
        setProductItem(enq.machineProduct || '');
        setPurpose(`Follow-up on inquiry for ${enq.machineProduct}`);
      } else if (lead?.productName || lead?.machineType) {
        const prod = lead.productName || lead.machineType || '';
        setProductItem(prod);
        setPurpose(`Discussion regarding ${prod}`);
      } else if (lead) {
        setPurpose(`Discussion with ${lead.contactPerson || lead.companyName}`);
      }
    } else if (type === 'quotation') {
      const quot = quotations.find((q) => q.id === id || q.quotationNumber === id);
      if (quot) {
        setProductItem(
          quot.latestSummary?.machineProduct ||
          quot.revisions?.[0]?.items?.[0]?.description ||
          ''
        );
        setPurpose(`Proposal commercial follow-up for Quote ${quot.quotationNumber}`);
      }
    } else if (type === 'customer') {
      const cust = customers.find((c) => c.id === id || c.customerCode === id);
      if (cust) {
        setPurpose(`Account relationship follow-up with ${cust.companyName}`);
      }
    }
  };

  // Pre-fill from query params or initial defaults
  useEffect(() => {
    if (paramEnquiryId) {
      applyTarget('enquiry', paramEnquiryId);
    } else if (paramLeadId) {
      applyTarget('lead', paramLeadId);
    } else if (paramQuotationId) {
      applyTarget('quotation', paramQuotationId);
    } else if (paramCustomerId) {
      applyTarget('customer', paramCustomerId);
    } else if (leads.length > 0 && !targetId) {
      applyTarget('lead', leads[0].id);
    }
  }, [paramEnquiryId, paramLeadId, paramQuotationId, paramCustomerId, enquiries, leads]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!purpose.trim()) {
      setFormError('Discussion purpose is required.');
      return;
    }

    if (!scheduledDate) {
      setFormError('Follow-up date is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      let targetName = 'Client';
      let customerId: string | undefined;
      let leadId: string | undefined;
      let enquiryId: string | undefined;
      let quotationId: string | undefined;

      if (targetType === 'lead') {
        const selectedLead = leads.find((l) => l.id === targetId) || leads[0];
        targetName = selectedLead ? `${selectedLead.companyName} (${selectedLead.contactPerson})` : 'New Lead';
        leadId = selectedLead?.id;
      } else if (targetType === 'enquiry') {
        const selectedEnq = enquiries.find((en) => en.id === targetId || en.enquiryNo === targetId) || enquiries[0];
        targetName = selectedEnq ? `${selectedEnq.customerName} - ${selectedEnq.enquiryNo || selectedEnq.machineProduct}` : 'Technical Inquiry';
        enquiryId = selectedEnq?.id;
      } else if (targetType === 'quotation') {
        const selectedQuot = quotations.find((q) => q.id === targetId || q.quotationNumber === targetId) || quotations[0];
        targetName = selectedQuot ? `${selectedQuot.customerName} (${selectedQuot.quotationNumber})` : 'Formal Quotation';
        quotationId = selectedQuot?.id;
      } else {
        const selectedCust = customers.find((c) => c.id === targetId || c.customerCode === targetId) || customers[0];
        targetName = selectedCust ? `${selectedCust.companyName} (${selectedCust.contactPerson})` : 'Customer';
        customerId = selectedCust?.id;
      }

      const assignedStaff = allStaff.find((s) => s.id === assignedToId);
      const assignedName = assignedStaff
        ? assignedStaff.name || `${assignedStaff.firstName || ''} ${assignedStaff.lastName || ''}`.trim()
        : 'Sales Team';

      const entityRecordId = (targetType === 'lead' ? leadId : targetType === 'enquiry' ? enquiryId : targetType === 'quotation' ? quotationId : customerId) || 'ID-001';

      let timeDisplay = scheduledTime || '11:00 AM';
      if (scheduledTime && scheduledTime.includes(':')) {
        const [h, m] = scheduledTime.split(':');
        const hour = parseInt(h, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        timeDisplay = `${hour12}:${m} ${ampm}`;
      }

      const newFollowUpItem: FollowUp = {
        id: `FU-${Date.now()}`,
        followUpNo: `FLW-2026-${Math.floor(100 + Math.random() * 900)}`,
        leadOrCustomerId: entityRecordId,
        leadOrCustomerName: targetName,
        entityType: targetType,
        enquiryId,
        quotationId,
        type: followUpType,
        assignedToId,
        assignedToName: assignedName,
        date: scheduledDate,
        time: timeDisplay,
        priority: 'medium',
        purpose: purpose.trim(),
        notes: notes.trim(),
        interestStatus,
        productItem: productItem.trim() || undefined,
        nextFollowUpDate: nextFollowUpDate || undefined,
        status: 'pending',
      };

      addFollowUp(newFollowUpItem);
      router.push('/crm/follow-ups');
    } catch (err: any) {
      setFormError(err.message || 'Failed to schedule follow-up.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in">
      {/* Back Link */}
      <div>
        <Link
          href="/crm/follow-ups"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#70665F] hover:text-[#211B17] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Follow-ups Register</span>
        </Link>
      </div>

      {/* Main Form Container */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-[#EBE3DB] pb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0 mt-0.5">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#211B17] tracking-tight">
              Schedule Client Follow-up
            </h1>
            <p className="text-xs text-[#70665F] mt-1 leading-relaxed">
              Plan and log upcoming customer calls, technical discussions, and commercial negotiations.
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {formError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Target Entity & Account Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center justify-center">
                1
              </span>
              <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                Target Entity & Customer Account
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Target Entity Type
                </label>
                <select
                  value={targetType}
                  onChange={(e) => {
                    const type = e.target.value as 'lead' | 'enquiry' | 'quotation' | 'customer';
                    let defaultId = '';
                    if (type === 'lead') defaultId = leads[0]?.id || '';
                    else if (type === 'enquiry') defaultId = enquiries[0]?.id || '';
                    else if (type === 'quotation') defaultId = quotations[0]?.id || '';
                    else defaultId = customers[0]?.id || '';
                    applyTarget(type, defaultId);
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-purple-600 transition"
                >
                  <option value="lead">Sales Lead</option>
                  <option value="enquiry">Technical Inquiry (RFQ)</option>
                  <option value="quotation">Formal Commercial Quotation</option>
                  <option value="customer">Existing Customer Account</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Select Linked Record <span className="text-rose-500">*</span>
                </label>
                <select
                  value={targetId}
                  onChange={(e) => applyTarget(targetType, e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-purple-600 transition"
                >
                  {targetType === 'lead' &&
                    leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.leadNo ? `${l.leadNo} - ` : ''}{l.companyName} ({l.contactPerson || 'Lead'})
                      </option>
                    ))}
                  {targetType === 'enquiry' &&
                    enquiries.map((en) => (
                      <option key={en.id} value={en.id}>
                        {en.enquiryNo || en.id} - {en.customerName} ({en.machineProduct})
                      </option>
                    ))}
                  {targetType === 'quotation' &&
                    quotations.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.quotationNumber} - {q.customerName}
                      </option>
                    ))}
                  {targetType === 'customer' &&
                    customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.customerCode})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Channel, Date & Time */}
          <div className="space-y-4 pt-4 border-t border-[#EBE3DB]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                Channel, Schedule Date & Time
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Channel
                </label>
                <select
                  value={followUpType}
                  onChange={(e) => setFollowUpType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-purple-600 transition"
                >
                  <option value="call">Phone Call (ટેલિફોનિક વાતચીત)</option>
                  <option value="whatsapp">WhatsApp Message</option>
                  <option value="meeting">In-Person Meeting</option>
                  <option value="visit">Client Site Visit</option>
                  <option value="email">Official Email</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-700" />
                  <span>Scheduled Date <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-mono text-[#211B17] focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-700" />
                  <span>Time (Clock) <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="time"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-mono text-[#211B17] focus:outline-none focus:border-purple-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Product & Purpose */}
          <div className="space-y-4 pt-4 border-t border-[#EBE3DB]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center justify-center">
                3
              </span>
              <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                Product / Item & Discussion Purpose
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-purple-700" />
                  <span>Product / Equipment Item (ઓટોમેટીક ઇન્કવાયરી માંથી)</span>
                </label>
                <input
                  type="text"
                  value={productItem}
                  onChange={(e) => setProductItem(e.target.value)}
                  placeholder="e.g. Stainless Steel SS316 Reaction Vessel"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium text-[#211B17] focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Discussion Purpose <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Commercial negotiation and technical query resolution"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Assignment & Status */}
          <div className="space-y-4 pt-4 border-t border-[#EBE3DB]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center justify-center">
                4
              </span>
              <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                Sales Engineer & Client Interest Status
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Assigned Sales Engineer
                </label>
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-purple-600"
                >
                  {allStaff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim()} ({s.department || s.departmentName || 'CRM'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Client Status (ઇન્ટરેસ્ટેડ / નોટ ઇન્ટરેસ્ટેડ) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={interestStatus}
                  onChange={(e) => setInterestStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-purple-600"
                >
                  <option value="interested">Interested (ઇન્ટરેસ્ટેડ)</option>
                  <option value="in_discussion">In Discussion / Follow-up Needed (ચર્ચા ચાલુ છે)</option>
                  <option value="not_interested">Not Interested (નોટ ઇન્ટરેસ્ટેડ)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Notes / Instructions
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional context, customer feedback, points to cover..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-purple-600 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Next Follow-up Planning */}
          <div className="space-y-4 pt-4 border-t border-[#EBE3DB]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center justify-center">
                5
              </span>
              <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                Next Follow-up Due Date (નેક્સ્ટ ફોલોઅપ)
              </h2>
            </div>

            <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-700" />
                  <span>Next Follow-up Due Date</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 2);
                      setNextFollowUpDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-2.5 py-1 text-xs font-bold bg-white text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition shadow-2xs cursor-pointer"
                  >
                    +2 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      setNextFollowUpDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-2.5 py-1 text-xs font-bold bg-white text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition shadow-2xs cursor-pointer"
                  >
                    +7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 15);
                      setNextFollowUpDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-2.5 py-1 text-xs font-bold bg-white text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition shadow-2xs cursor-pointer"
                  >
                    +15 Days
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-mono text-[#211B17] focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#EBE3DB]">
            <Link
              href="/crm/follow-ups"
              className="px-5 py-2.5 border border-[#EBE3DB] text-[#70665F] hover:bg-[#FAF7F2] rounded-xl font-bold transition text-xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold transition text-xs shadow-xs active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Schedule Follow-up</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewFollowUpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#70665F]">Loading Follow-up Form...</div>}>
      <FollowUpFormContent />
    </Suspense>
  );
}
