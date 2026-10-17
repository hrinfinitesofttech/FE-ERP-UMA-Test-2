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
  Plus,
  X,
  CalendarPlus,
} from 'lucide-react';

function FollowUpFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramEnquiryId = searchParams.get('enquiryId');
  const paramLeadId = searchParams.get('leadId');
  const paramCustomerId = searchParams.get('customerId');

  const {
    followUps,
    addFollowUp,
    updateLead,
    leads,
    customers,
    enquiries,
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

  // Selected Record State (unified without Target Entity Type dropdown)
  const [selectedRecordKey, setSelectedRecordKey] = useState<string>('');
  const [selectedEntityInfo, setSelectedEntityInfo] = useState<{
    type: 'lead' | 'enquiry' | 'customer';
    id: string;
    name: string;
    contactPerson: string;
    mobile: string;
    product?: string;
  } | null>(null);

  // Main follow-up schedule fields
  const [followUpType, setFollowUpType] = useState<'call' | 'whatsapp' | 'email' | 'meeting' | 'visit'>('call');
  const [scheduledDate, setScheduledDate] = useState(todayStr);
  const [scheduledTime, setScheduledTime] = useState('11:00');
  const [productItem, setProductItem] = useState('');
  const [purpose, setPurpose] = useState('');
  const [interestStatus, setInterestStatus] = useState<'interested' | 'not_interested' | 'in_discussion'>('interested');
  const [notes, setNotes] = useState('');

  // Next Follow-up (by default clear and hidden)
  const [hasScheduleNext, setHasScheduleNext] = useState(false);
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [nextFollowUpTime, setNextFollowUpTime] = useState('');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle record selection (lead, enquiry, or customer)
  const handleRecordSelect = (val: string) => {
    setSelectedRecordKey(val);
    if (!val) {
      setSelectedEntityInfo(null);
      setProductItem('');
      setPurpose('');
      return;
    }

    const [type, id] = val.split(':');

    if (type === 'enquiry') {
      const enq = enquiries.find((e) => e.id === id || e.enquiryNo === id);
      if (enq) {
        setSelectedEntityInfo({
          type: 'enquiry',
          id: enq.id,
          name: enq.customerName,
          contactPerson: enq.contactPerson || '',
          mobile: enq.contactMobile || '',
          product: enq.machineProduct,
        });
        setProductItem(enq.machineProduct || '');
        setPurpose(`Inquiry follow-up for ${enq.machineProduct}`);
      }
    } else if (type === 'lead') {
      const lead = leads.find((l) => l.id === id || l.leadNo === id);
      if (lead) {
        const enq = enquiries.find((e) => e.leadId === id || e.customerName === lead.companyName);
        const prod = enq?.machineProduct || lead.productName || lead.machineType || '';
        setSelectedEntityInfo({
          type: 'lead',
          id: lead.id,
          name: lead.companyName,
          contactPerson: lead.contactPerson || '',
          mobile: lead.mobile || '',
          product: prod,
        });
        setProductItem(prod);
        setPurpose(prod ? `Follow-up regarding ${prod}` : `Follow-up with ${lead.contactPerson || lead.companyName}`);
      }
    } else if (type === 'customer') {
      const cust = customers.find((c) => c.id === id || c.customerCode === id);
      if (cust) {
        setSelectedEntityInfo({
          type: 'customer',
          id: cust.id,
          name: cust.companyName,
          contactPerson: cust.contactPerson || '',
          mobile: cust.mobile || '',
        });
        setPurpose(`Account relationship follow-up with ${cust.companyName}`);
      }
    }
  };

  // Pre-fill from URL parameters (e.g. from Enquiries page or Leads page)
  useEffect(() => {
    if (paramEnquiryId) {
      const enq = enquiries.find((e) => e.id === paramEnquiryId || e.enquiryNo === paramEnquiryId);
      if (enq) {
        handleRecordSelect(`enquiry:${enq.id}`);
        return;
      }
    }
    if (paramLeadId) {
      const lead = leads.find((l) => l.id === paramLeadId || l.leadNo === paramLeadId);
      if (lead) {
        handleRecordSelect(`lead:${lead.id}`);
        return;
      }
    }
    if (paramCustomerId) {
      const cust = customers.find((c) => c.id === paramCustomerId || c.customerCode === paramCustomerId);
      if (cust) {
        handleRecordSelect(`customer:${cust.id}`);
        return;
      }
    }
    // Default to first lead if available
    if (!selectedRecordKey && leads.length > 0) {
      handleRecordSelect(`lead:${leads[0].id}`);
    }
  }, [paramEnquiryId, paramLeadId, paramCustomerId, enquiries, leads]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedRecordKey || !selectedEntityInfo) {
      setFormError('Please select a Customer or Lead.');
      return;
    }

    if (!purpose.trim()) {
      setFormError('Discussion purpose is required.');
      return;
    }

    if (!scheduledDate) {
      setFormError('Follow-up date is required.');
      return;
    }

    if (hasScheduleNext) {
      if (!nextFollowUpDate) {
        setFormError('Please select the Next Follow-up Date or remove the next follow-up section.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Default sales engineer automatically in background without showing the field
      const assignedToId = allStaff[0]?.id || 'EMP-001';
      const assignedStaff = allStaff.find((s) => s.id === assignedToId);
      const assignedName = assignedStaff
        ? assignedStaff.name || `${assignedStaff.firstName || ''} ${assignedStaff.lastName || ''}`.trim()
        : 'Sales Team';

      // Format time with AM/PM
      let timeDisplay = scheduledTime || '11:00 AM';
      if (scheduledTime && scheduledTime.includes(':')) {
        const [h, m] = scheduledTime.split(':');
        const hour = parseInt(h, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        timeDisplay = `${hour12}:${m} ${ampm}`;
      }

      // Format next follow-up time
      let nextTimeDisplay: string | undefined = undefined;
      if (nextFollowUpTime && nextFollowUpTime.includes(':')) {
        const [nh, nm] = nextFollowUpTime.split(':');
        const nhour = parseInt(nh, 10);
        const nampm = nhour >= 12 ? 'PM' : 'AM';
        const nhour12 = nhour % 12 || 12;
        nextTimeDisplay = `${nhour12}:${nm} ${nampm}`;
      }

      const entityType = selectedEntityInfo.type;
      const targetName = `${selectedEntityInfo.name}${selectedEntityInfo.contactPerson ? ` (${selectedEntityInfo.contactPerson})` : ''}`;
      const enquiryId = entityType === 'enquiry' ? selectedEntityInfo.id : undefined;

      // 1. Create main follow-up record
      const newFollowUpItem: FollowUp = {
        id: `FU-${Date.now()}`,
        followUpNo: `FLW-2026-${Math.floor(100 + Math.random() * 900)}`,
        leadOrCustomerId: selectedEntityInfo.id,
        leadOrCustomerName: targetName,
        entityType,
        enquiryId,
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
        nextFollowUpDate: hasScheduleNext && nextFollowUpDate ? nextFollowUpDate : undefined,
        nextFollowUpTime: hasScheduleNext && nextTimeDisplay ? nextTimeDisplay : undefined,
        status: 'pending',
      };

      addFollowUp(newFollowUpItem);

      // 2. If Next Follow-up was added, update lead and schedule the upcoming follow-up
      if (hasScheduleNext && nextFollowUpDate) {
        // Update linked lead if applicable
        if (entityType === 'lead') {
          try {
            updateLead(selectedEntityInfo.id, { nextFollowUpDate });
          } catch (_) {}
        } else if (entityType === 'enquiry') {
          const enq = enquiries.find((e) => e.id === selectedEntityInfo.id);
          if (enq?.leadId) {
            try {
              updateLead(enq.leadId, { nextFollowUpDate });
            } catch (_) {}
          }
        }

        // Also schedule the upcoming follow-up entry
        addFollowUp({
          leadOrCustomerId: selectedEntityInfo.id,
          leadOrCustomerName: targetName,
          entityType,
          enquiryId,
          type: followUpType,
          assignedToId,
          assignedToName: assignedName,
          date: nextFollowUpDate,
          time: nextTimeDisplay || '11:00 AM',
          priority: 'medium',
          purpose: `Next Follow-up: ${purpose.trim()}`,
          notes: notes ? `Scheduled next discussion. Prior notes: ${notes.trim()}` : 'Scheduled next discussion.',
          interestStatus,
          productItem: productItem.trim() || undefined,
          status: 'pending',
        });
      }

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
          {/* Section 1: Customer / Lead Selection (No Target Entity Type dropdown) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center justify-center">
                1
              </span>
              <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                Select Customer / Lead (કસ્ટમર / લીડ પસંદ કરો)
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-700" />
                <span>Select Customer / Lead <span className="text-rose-500">*</span></span>
              </label>
              <select
                required
                value={selectedRecordKey}
                onChange={(e) => handleRecordSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-purple-600 transition"
              >
                <option value="">-- Select Customer / Lead / Inquiry --</option>
                {leads.length > 0 && (
                  <optgroup label="Prospective Leads (લીડ્સ)">
                    {leads.map((l) => (
                      <option key={`lead-${l.id}`} value={`lead:${l.id}`}>
                        {l.leadNo ? `${l.leadNo} - ` : ''}{l.companyName} ({l.contactPerson || 'Lead'})
                      </option>
                    ))}
                  </optgroup>
                )}
                {enquiries.length > 0 && (
                  <optgroup label="Technical Inquiries (ઇન્કવાયરી RFQ)">
                    {enquiries.map((en) => (
                      <option key={`enq-${en.id}`} value={`enquiry:${en.id}`}>
                        {en.enquiryNo || en.id} - {en.customerName} ({en.machineProduct})
                      </option>
                    ))}
                  </optgroup>
                )}
                {customers.length > 0 && (
                  <optgroup label="Registered Customers (ગ્રાહકો)">
                    {customers.map((c) => (
                      <option key={`cust-${c.id}`} value={`customer:${c.id}`}>
                        {c.companyName} ({c.customerCode || 'CUST'}) - {c.contactPerson || 'Customer'}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>

              {/* Selection Summary Pill */}
              {selectedEntityInfo && (
                <div className="mt-2.5 p-3 bg-purple-50/60 border border-purple-200/80 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                    <div>
                      <strong className="text-purple-950 font-bold">{selectedEntityInfo.name}</strong>
                      {selectedEntityInfo.contactPerson && (
                        <span className="text-purple-700 ml-1.5 font-medium">
                          • Contact: {selectedEntityInfo.contactPerson}
                        </span>
                      )}
                      {selectedEntityInfo.mobile && (
                        <span className="text-slate-600 ml-1.5 font-mono">
                          ({selectedEntityInfo.mobile})
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedEntityInfo.product && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-purple-800 border border-purple-200 shadow-2xs">
                      {selectedEntityInfo.product}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Channel, Schedule Date & Time */}
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

          {/* Section 3: Product / Item & Discussion Purpose */}
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

          {/* Section 4: Client Interest Status & Notes (NO Assigned Sales Engineer) */}
          <div className="space-y-4 pt-4 border-t border-[#EBE3DB]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center justify-center">
                4
              </span>
              <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                Client Interest Status & Discussion Notes
              </h2>
            </div>

            <div className="space-y-4">
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

              <div>
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

          {/* Section 5: Next Follow-up (By default CLEAR with explicit Add button) */}
          <div className="space-y-4 pt-4 border-t border-[#EBE3DB]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center justify-center">
                  5
                </span>
                <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                  Next Follow-up (નેક્સ્ટ ફોલોઅપ)
                </h2>
              </div>

              {!hasScheduleNext && (
                <button
                  type="button"
                  onClick={() => {
                    setHasScheduleNext(true);
                    setNextFollowUpDate('');
                    setNextFollowUpTime('');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Next Follow-up (નેક્સ્ટ ફોલોઅપ એડ કરો)</span>
                </button>
              )}
            </div>

            {/* If not enabled: Show clear default message */}
            {!hasScheduleNext ? (
              <div className="p-4 bg-[#FAF7F2] border border-dashed border-[#EBE3DB] rounded-xl flex items-center justify-between text-xs text-[#70665F]">
                <div className="flex items-center gap-2">
                  <CalendarPlus className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>બાય ડિફોલ્ટ નેક્સ્ટ ફોલોઅપ ક્લિયર છે. જો બીજી તારીખ/સમય સેટ કરવો હોય તો ઉપર આપેલા બટન પર ક્લિક કરો.</span>
                </div>
              </div>
            ) : (
              /* If enabled: Show Date AND Time fields (initially clear/blank) with option to remove */
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-purple-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-700" />
                    <span className="text-xs font-bold text-purple-950">
                      Schedule Next Follow-up (તારીખ અને સમય સેટ કરો)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setHasScheduleNext(false);
                      setNextFollowUpDate('');
                      setNextFollowUpTime('');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>Cancel / Clear (રીમુવ કરો)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Next Date */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#4A3B32] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-700" />
                        <span>Next Follow-up Date <span className="text-rose-500">*</span></span>
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() + 2);
                            setNextFollowUpDate(d.toISOString().split('T')[0]);
                          }}
                          className="px-2 py-0.5 text-[10px] font-bold bg-white text-purple-700 border border-purple-200 rounded hover:bg-purple-100 transition shadow-2xs cursor-pointer"
                        >
                          +2D
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() + 7);
                            setNextFollowUpDate(d.toISOString().split('T')[0]);
                          }}
                          className="px-2 py-0.5 text-[10px] font-bold bg-white text-purple-700 border border-purple-200 rounded hover:bg-purple-100 transition shadow-2xs cursor-pointer"
                        >
                          +7D
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() + 15);
                            setNextFollowUpDate(d.toISOString().split('T')[0]);
                          }}
                          className="px-2 py-0.5 text-[10px] font-bold bg-white text-purple-700 border border-purple-200 rounded hover:bg-purple-100 transition shadow-2xs cursor-pointer"
                        >
                          +15D
                        </button>
                      </div>
                    </div>
                    <input
                      type="date"
                      required={hasScheduleNext}
                      value={nextFollowUpDate}
                      onChange={(e) => setNextFollowUpDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-mono text-[#211B17] focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Next Time */}
                  <div>
                    <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-purple-700" />
                      <span>Next Follow-up Time (Clock)</span>
                    </label>
                    <input
                      type="time"
                      value={nextFollowUpTime}
                      onChange={(e) => setNextFollowUpTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-mono text-[#211B17] focus:outline-none focus:border-purple-600 cursor-pointer"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-purple-900 font-medium">
                  • આ નેક્સ્ટ ફોલોઅપ સેવ થવાથી આપોઆપ લીડમાં નેક્સ્ટ ડેટ અપડેટ થશે અને અપકમિંગ લિસ્ટમાં પણ જોવા મળશે.
                </p>
              </div>
            )}
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
              <span>{isSubmitting ? 'Scheduling...' : 'Schedule Follow-up'}</span>
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
