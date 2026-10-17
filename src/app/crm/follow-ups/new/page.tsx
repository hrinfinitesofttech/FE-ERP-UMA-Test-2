'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '../../../../context/ERPContext';
import { FollowUp } from '../../../../types/crm';
import {
  Calendar,
  Clock,
  PhoneCall,
  Building2,
  FileText,
  Layers,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  MapPin,
  CalendarPlus,
  Compass,
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
    addSiteVisit,
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

  // Current Slide / Step (1 or 2)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // --- Step 1: Schedule & Record Selection ---
  const [selectedRecordKey, setSelectedRecordKey] = useState<string>('');
  const [selectedEntityInfo, setSelectedEntityInfo] = useState<{
    type: 'lead' | 'enquiry' | 'customer';
    id: string;
    name: string;
    contactPerson: string;
    mobile: string;
    address?: string;
    product?: string;
  } | null>(null);

  const [followUpType, setFollowUpType] = useState<'call' | 'whatsapp' | 'email' | 'meeting' | 'visit'>('call');
  const [scheduledDate, setScheduledDate] = useState(todayStr);
  const [scheduledTime, setScheduledTime] = useState('11:00');
  const [productItem, setProductItem] = useState('');

  // --- Step 2: Discussion, Outcome, Next Follow-up & Site Visit ---
  const [purpose, setPurpose] = useState('');
  const [interestStatus, setInterestStatus] = useState<'interested' | 'not_interested' | 'in_discussion'>('interested');
  const [notes, setNotes] = useState('');

  // Next Follow-up toggle and fields (default clear)
  const [hasScheduleNext, setHasScheduleNext] = useState(false);
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [nextFollowUpTime, setNextFollowUpTime] = useState('');

  // Site Visit toggle and fields (default clear)
  const [hasScheduleVisit, setHasScheduleVisit] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('14:00');
  const [visitLocation, setVisitLocation] = useState('');
  const [visitPurpose, setVisitPurpose] = useState('');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle record selection
  const handleRecordSelect = (val: string) => {
    setSelectedRecordKey(val);
    if (!val) {
      setSelectedEntityInfo(null);
      setProductItem('');
      setPurpose('');
      setVisitLocation('');
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
          address: lead.address || lead.city || '',
          product: prod,
        });
        setProductItem(prod);
        setPurpose(prod ? `Follow-up regarding ${prod}` : `Follow-up with ${lead.contactPerson || lead.companyName}`);
        if (lead.address || lead.city) {
          setVisitLocation(lead.address ? `${lead.address}, ${lead.city || ''}` : lead.city || '');
        }
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
          address: cust.billingAddress || cust.city || '',
        });
        setPurpose(`Account relationship follow-up with ${cust.companyName}`);
        if (cust.billingAddress || cust.city) {
          setVisitLocation(cust.billingAddress ? `${cust.billingAddress}, ${cust.city || ''}` : cust.city || '');
        }
      }
    }
  };

  // Pre-fill from URL params
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
    if (!selectedRecordKey && leads.length > 0) {
      handleRecordSelect(`lead:${leads[0].id}`);
    }
  }, [paramEnquiryId, paramLeadId, paramCustomerId, enquiries, leads]);

  // Validation before going to Step 2
  const handleProceedToStep2 = () => {
    setFormError('');
    if (!selectedRecordKey || !selectedEntityInfo) {
      setFormError('કૃપા કરીને કસ્ટમર અથવા લીડ પસંદ કરો.');
      return;
    }
    if (!scheduledDate) {
      setFormError('કૃપા કરીને ફોલોઅપ તારીખ પસંદ કરો.');
      return;
    }
    if (!scheduledTime) {
      setFormError('કૃપા કરીને ફોલોઅપ સમય પસંદ કરો.');
      return;
    }
    setCurrentStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedRecordKey || !selectedEntityInfo) {
      setFormError('કૃપા કરીને કસ્ટમર અથવા લીડ પસંદ કરો.');
      setCurrentStep(1);
      return;
    }

    if (!purpose.trim()) {
      setFormError('Discussion purpose (વાતચીતનો હેતુ) લખવો જરૂરી છે.');
      return;
    }

    if (hasScheduleNext && !nextFollowUpDate) {
      setFormError('કૃપા કરીને નેક્સ્ટ ફોલોઅપની તારીખ પસંદ કરો અથવા કેન્સલ કરો.');
      return;
    }

    if (hasScheduleVisit && !visitDate) {
      setFormError('કૃપા કરીને સાઇટ વિઝિટની તારીખ પસંદ કરો અથવા કેન્સલ કરો.');
      return;
    }

    setIsSubmitting(true);

    try {
      const assignedToId = allStaff[0]?.id || 'EMP-001';
      const assignedStaff = allStaff.find((s) => s.id === assignedToId);
      const assignedName = assignedStaff
        ? assignedStaff.name || `${assignedStaff.firstName || ''} ${assignedStaff.lastName || ''}`.trim()
        : 'Sales Team';

      // Format current follow-up time
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

      // 1. Create main Follow-up Record
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

      // 2. If Next Follow-up enabled, update lead and create upcoming follow-up entry
      if (hasScheduleNext && nextFollowUpDate) {
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

      // 3. If Site Visit enabled from Follow-up ("ચેક કરવા આવો")
      if (hasScheduleVisit && visitDate) {
        let visitTimeDisplay = visitTime || '14:00';
        if (visitTime && visitTime.includes(':')) {
          const [vh, vm] = visitTime.split(':');
          const vhour = parseInt(vh, 10);
          const vampm = vhour >= 12 ? 'PM' : 'AM';
          const vhour12 = vhour % 12 || 12;
          visitTimeDisplay = `${vhour12}:${vm} ${vampm}`;
        }

        addSiteVisit({
          customerId: selectedEntityInfo.id,
          customerName: selectedEntityInfo.name,
          leadId: entityType === 'lead' ? selectedEntityInfo.id : undefined,
          enquiryId,
          contactPerson: selectedEntityInfo.contactPerson,
          contactMobile: selectedEntityInfo.mobile,
          visitDate,
          location: visitLocation.trim() || selectedEntityInfo.address || 'Client Site',
          employeeId: assignedToId,
          employeeName: assignedName,
          purpose: visitPurpose.trim() || `Site Inspection for ${productItem || selectedEntityInfo.name}`,
          discussionNotes: `Scheduled from follow-up: ${purpose.trim()} (${visitTimeDisplay})`,
          requirementDetails: productItem ? `Equipment: ${productItem}` : '',
          outcome: 'positive',
          nextAction: 'Site survey and measurements',
        });
      }

      router.push('/crm/follow-ups');
    } catch (err: any) {
      setFormError(err.message || 'Failed to schedule follow-up.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in">
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

      {/* Main Container */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header with Title and 2-Step Stepper */}
        <div className="border-b border-[#EBE3DB] pb-6 space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0 mt-0.5">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#211B17] tracking-tight">
                  Schedule Client Follow-up
                </h1>
                <p className="text-xs text-[#70665F] mt-1 leading-relaxed">
                  2-સ્લાઇડ ફોર્મ: સ્લાઇડ ૧ માં શેડ્યુલ & કસ્ટમર, સ્લાઇડ ૨ માં વાતચીત, પરિણામ અને સાઇટ વિઝિટ.
                </p>
              </div>
            </div>

            {/* Stepper Pill Indicators */}
            <div className="flex items-center gap-2 bg-[#FAF7F2] p-1.5 rounded-xl border border-[#EBE3DB]">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  currentStep === 1
                    ? 'bg-purple-700 text-white shadow-2xs'
                    : 'text-[#70665F] hover:text-[#211B17]'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 text-center text-[10px] flex items-center justify-center">
                  1
                </span>
                <span>સ્લાઇડ ૧: શેડ્યુલ & કસ્ટમર</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToStep2}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  currentStep === 2
                    ? 'bg-purple-700 text-white shadow-2xs'
                    : 'text-[#70665F] hover:text-[#211B17]'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 text-center text-[10px] flex items-center justify-center">
                  2
                </span>
                <span>સ્લાઇડ ૨: વાતચીત & વિઝિટ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {formError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ========================================================
              SLIDE 1: SCHEDULE & CUSTOMER SELECTION
             ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Customer / Enquiry Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                    Select Customer / Lead / Technical Enquiry
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-purple-700" />
                    <span>Select Customer / Lead (કસ્ટમર / લીડ પસંદ કરો) <span className="text-rose-500">*</span></span>
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

                  {/* Summary Card for Selected Lead/Enquiry */}
                  {selectedEntityInfo && (
                    <div className="mt-3 p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                        <div>
                          <strong className="text-purple-950 font-bold">{selectedEntityInfo.name}</strong>
                          {selectedEntityInfo.contactPerson && (
                            <span className="text-purple-800 ml-1.5 font-medium">
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
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-purple-900 border border-purple-200 shadow-2xs">
                          આઇટમ: {selectedEntityInfo.product}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Product / Equipment Item */}
              <div className="space-y-3 pt-3 border-t border-[#EBE3DB]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center justify-center">
                    2
                  </span>
                  <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                    Product / Equipment Item (પ્રોડક્ટ વિગત)
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-700" />
                    <span>Product / Equipment Name (ઇન્કવાયરી માંથી ઓટોમેટિક આવશે)</span>
                  </label>
                  <input
                    type="text"
                    value={productItem}
                    onChange={(e) => setProductItem(e.target.value)}
                    placeholder="e.g. Stainless Steel SS316 Reaction Vessel"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium text-[#211B17] focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Channel, Date & Time (Clock) */}
              <div className="space-y-3 pt-3 border-t border-[#EBE3DB]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center justify-center">
                    3
                  </span>
                  <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                    Channel, Date & Time (તારીખ અને સમય)
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

              {/* Step 1 Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-[#EBE3DB]">
                <Link
                  href="/crm/follow-ups"
                  className="px-5 py-2.5 border border-[#EBE3DB] text-[#70665F] hover:bg-[#FAF7F2] rounded-xl font-bold transition text-xs"
                >
                  Cancel
                </Link>
                <button
                  type="button"
                  onClick={handleProceedToStep2}
                  className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold transition text-xs shadow-xs active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>સ્લાઇડ ૨: વાતચીત, પરિણામ & વિઝિટ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              SLIDE 2: DISCUSSION, OUTCOME, NEXT FOLLOW-UP & SITE VISIT
             ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Quick Summary Banner of Step 1 */}
              <div className="p-3 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
                <div>
                  <span className="text-[#70665F]">કસ્ટમર / પ્રોડક્ટ: </span>
                  <strong className="text-[#211B17]">{selectedEntityInfo?.name}</strong>
                  {productItem && <span className="text-purple-700 ml-1.5 font-bold">({productItem})</span>}
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-600 font-bold">{scheduledDate}</span>
                  <span className="text-purple-700 font-bold">{scheduledTime}</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-[11px] text-purple-700 underline font-sans ml-1"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Discussion Purpose & Status */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center justify-center">
                    4
                  </span>
                  <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                    Discussion Details & Client Status (વાતચીત અને પરિણામ)
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                      Discussion Purpose (ચર્ચાનો હેતુ / શું વાતચીત થઈ) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="e.g. Price negotiation, technical parameters approval, delivery timeline"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-purple-600"
                    />
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

                  <div>
                    <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                      Notes / Instructions (વિગતવાર વાતચીતની નોંધ)
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Customer requirements, special conditions, discussion summary..."
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-purple-600 leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Next Follow-up Section (With explicit Add button, Clear default) */}
              <div className="space-y-3 pt-3 border-t border-[#EBE3DB]">
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Next Follow-up (નેક્સ્ટ ફોલોઅપ એડ કરો)</span>
                    </button>
                  )}
                </div>

                {!hasScheduleNext ? (
                  <div className="p-3 bg-[#FAF7F2] border border-dashed border-[#EBE3DB] rounded-xl text-xs text-[#70665F] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarPlus className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>નેક્સ્ટ ફોલોઅપ ક્લિયર છે. જો ફરી વાત કરવાની હોય તો ઉપરના બટનથી એડ કરો.</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                      <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-purple-700" />
                        Next Follow-up Due Date & Time
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setHasScheduleNext(false);
                          setNextFollowUpDate('');
                          setNextFollowUpTime('');
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200"
                      >
                        ✕ Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-[#4A3B32]">
                            Next Date <span className="text-rose-500">*</span>
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const d = new Date();
                                d.setDate(d.getDate() + 2);
                                setNextFollowUpDate(d.toISOString().split('T')[0]);
                              }}
                              className="px-2 py-0.5 text-[10px] font-bold bg-white text-purple-700 border border-purple-200 rounded"
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
                              className="px-2 py-0.5 text-[10px] font-bold bg-white text-purple-700 border border-purple-200 rounded"
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
                              className="px-2 py-0.5 text-[10px] font-bold bg-white text-purple-700 border border-purple-200 rounded"
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
                          className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-mono text-[#211B17]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#4A3B32] mb-1">
                          Next Time (Clock)
                        </label>
                        <input
                          type="time"
                          value={nextFollowUpTime}
                          onChange={(e) => setNextFollowUpTime(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-mono text-[#211B17] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Site Visit Section ("તમે ચેક કરવા આવો") */}
              <div className="space-y-3 pt-3 border-t border-[#EBE3DB]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center">
                      6
                    </span>
                    <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                      Site Visit Required? (સાઇટ વિઝિટ શિડ્યુલ કરો)
                    </h2>
                  </div>

                  {!hasScheduleVisit && (
                    <button
                      type="button"
                      onClick={() => {
                        setHasScheduleVisit(true);
                        setVisitDate(todayStr);
                        if (!visitLocation && selectedEntityInfo?.address) {
                          setVisitLocation(selectedEntityInfo.address);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>+ Schedule Site Visit (સાઇટ વિઝિટ એડ કરો)</span>
                    </button>
                  )}
                </div>

                {!hasScheduleVisit ? (
                  <div className="p-3 bg-[#FAF7F2] border border-dashed border-[#EBE3DB] rounded-xl text-xs text-[#70665F] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>જો ક્લાયન્ટે કહ્યું હોય કે &quot;તમે ચેક કરવા આવો&quot;, તો અહીંથી સાઇટ વિઝિટ એડ કરી શકો છો.</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-700" />
                        Planned Site Visit Details (સાઇટ મુલાકાત)
                      </span>
                      <button
                        type="button"
                        onClick={() => setHasScheduleVisit(false)}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200"
                      >
                        ✕ Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#4A3B32] mb-1">
                          Planned Visit Date <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="date"
                          required={hasScheduleVisit}
                          min={todayStr}
                          value={visitDate}
                          onChange={(e) => setVisitDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-mono text-[#211B17]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#4A3B32] mb-1">
                          Visit Time (Clock)
                        </label>
                        <input
                          type="time"
                          value={visitTime}
                          onChange={(e) => setVisitTime(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-mono text-[#211B17] cursor-pointer"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-[#4A3B32] mb-1">
                          Site / Factory Location & Address
                        </label>
                        <input
                          type="text"
                          value={visitLocation}
                          onChange={(e) => setVisitLocation(e.target.value)}
                          placeholder="e.g. Plot 42, GIDC Phase 2, Vatva, Ahmedabad"
                          className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs text-[#211B17]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-[#4A3B32] mb-1">
                          Site Inspection Purpose
                        </label>
                        <input
                          type="text"
                          value={visitPurpose}
                          onChange={(e) => setVisitPurpose(e.target.value)}
                          placeholder="e.g. Reactor layout verification and nozzle orientation measurements"
                          className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs text-[#211B17]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Navigation Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 border border-[#EBE3DB] text-[#70665F] hover:bg-[#FAF7F2] rounded-xl font-bold transition text-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← સ્લાઇડ ૧ પર પાછા જાઓ</span>
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    href="/crm/follow-ups"
                    className="px-4 py-2.5 border border-[#EBE3DB] text-[#70665F] hover:bg-[#FAF7F2] rounded-xl font-bold transition text-xs"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold transition text-xs shadow-xs active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSubmitting ? 'Saving...' : 'Save & Schedule Follow-up'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
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
