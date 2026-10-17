'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '../../../../context/ERPContext';
import { SiteVisit } from '../../../../types/crm';
import {
  MapPin,
  Calendar,
  Clock,
  Building2,
  FileText,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  CalendarPlus,
  Briefcase,
  Layers,
} from 'lucide-react';

function VisitFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramLeadId = searchParams.get('leadId');
  const paramCustomerId = searchParams.get('customerId');
  const paramEnquiryId = searchParams.get('enquiryId');

  const {
    siteVisits,
    addSiteVisit,
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

  // 2-Step Stepper State
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // --- Step 1: Site Visit Scheduling ---
  const [selectedRecordKey, setSelectedRecordKey] = useState<string>('');
  const [selectedEntityInfo, setSelectedEntityInfo] = useState<{
    type: 'lead' | 'enquiry' | 'customer';
    id: string;
    name: string;
    contactPerson: string;
    mobile: string;
    address: string;
    product?: string;
  } | null>(null);

  const [visitDate, setVisitDate] = useState(todayStr);
  const [visitTime, setVisitTime] = useState('11:00');
  const [location, setLocation] = useState('');
  const [employeeId, setEmployeeId] = useState(allStaff[0]?.id || 'EMP-001');

  // --- Step 2: Visit Findings, Technical Requirements & Next Follow-up ---
  const [purpose, setPurpose] = useState('');
  const [discussionNotes, setDiscussionNotes] = useState('');
  const [requirementDetails, setRequirementDetails] = useState('');
  const [outcome, setOutcome] = useState<SiteVisit['outcome']>('positive');

  // Next Follow-up Schedule (default clear)
  const [hasScheduleNext, setHasScheduleNext] = useState(false);
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [nextFollowUpTime, setNextFollowUpTime] = useState('');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Record Selection Handler
  const handleRecordSelect = (val: string) => {
    setSelectedRecordKey(val);
    if (!val) {
      setSelectedEntityInfo(null);
      setLocation('');
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
          address: 'Client Manufacturing Plant',
          product: enq.machineProduct,
        });
        setLocation('Client Manufacturing Plant');
        setPurpose(`Technical site survey for ${enq.machineProduct}`);
      }
    } else if (type === 'lead') {
      const lead = leads.find((l) => l.id === id || l.leadNo === id);
      if (lead) {
        const enq = enquiries.find((e) => e.leadId === id || e.customerName === lead.companyName);
        const prod = enq?.machineProduct || lead.productName || lead.machineType || '';
        const addr = lead.address ? `${lead.address}, ${lead.city || ''}` : lead.city || 'Client Site';
        setSelectedEntityInfo({
          type: 'lead',
          id: lead.id,
          name: lead.companyName,
          contactPerson: lead.contactPerson || '',
          mobile: lead.mobile || '',
          address: addr,
          product: prod,
        });
        setLocation(addr);
        setPurpose(prod ? `Site inspection & measurement for ${prod}` : `Site inspection at ${lead.companyName}`);
      }
    } else if (type === 'customer') {
      const cust = customers.find((c) => c.id === id || c.customerCode === id);
      if (cust) {
        const addr = cust.billingAddress ? `${cust.billingAddress}, ${cust.city || ''}` : cust.city || 'Customer Plant';
        setSelectedEntityInfo({
          type: 'customer',
          id: cust.id,
          name: cust.companyName,
          contactPerson: cust.contactPerson || '',
          mobile: cust.mobile || '',
          address: addr,
        });
        setLocation(addr);
        setPurpose(`Plant visit & equipment layout verification at ${cust.companyName}`);
      }
    }
  };

  // Pre-fill from query params
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
  }, [paramEnquiryId, paramLeadId, paramCustomerId, enquiries, leads]);

  // Validation before proceeding to Step 2
  const handleProceedToStep2 = () => {
    setFormError('');
    if (!selectedRecordKey || !selectedEntityInfo) {
      setFormError('Please select a Customer or Lead.');
      return;
    }
    if (!visitDate) {
      setFormError('Please select the site visit date.');
      return;
    }
    if (!location.trim()) {
      setFormError('Please enter the site location / address.');
      return;
    }
    setCurrentStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedRecordKey || !selectedEntityInfo) {
      setFormError('Please select a Customer or Lead.');
      setCurrentStep(1);
      return;
    }

    if (!purpose.trim()) {
      setFormError('Visit purpose is required.');
      return;
    }

    if (hasScheduleNext && !nextFollowUpDate) {
      setFormError('Please select the next follow-up date or cancel.');
      return;
    }

    setIsSubmitting(true);

    try {
      const emp = allStaff.find((s) => s.id === employeeId) || allStaff[0];
      const empName = emp ? (emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()) : 'Sales Engineer';

      const entityType = selectedEntityInfo.type;
      const targetName = `${selectedEntityInfo.name}${selectedEntityInfo.contactPerson ? ` (${selectedEntityInfo.contactPerson})` : ''}`;
      const enquiryId = entityType === 'enquiry' ? selectedEntityInfo.id : undefined;

      // 1. Add Site Visit
      addSiteVisit({
        leadId: entityType === 'lead' ? selectedEntityInfo.id : undefined,
        customerId: selectedEntityInfo.id,
        customerName: selectedEntityInfo.name,
        enquiryId,
        contactPerson: selectedEntityInfo.contactPerson || 'N/A',
        contactMobile: selectedEntityInfo.mobile || '',
        visitDate,
        location: location.trim() || 'Client Site',
        employeeId: emp?.id || '',
        employeeName: empName,
        purpose: purpose.trim(),
        discussionNotes: discussionNotes.trim(),
        requirementDetails: requirementDetails.trim(),
        outcome,
        nextAction: hasScheduleNext && nextFollowUpDate ? `Next Follow-up on ${nextFollowUpDate}` : '',
        nextFollowUpDate: hasScheduleNext && nextFollowUpDate ? nextFollowUpDate : undefined,
      });

      // 2. If Next Follow-up is scheduled from site visit, automatically create follow-up entry
      if (hasScheduleNext && nextFollowUpDate) {
        let nextTimeDisplay = '11:00 AM';
        if (nextFollowUpTime && nextFollowUpTime.includes(':')) {
          const [nh, nm] = nextFollowUpTime.split(':');
          const nhour = parseInt(nh, 10);
          const nampm = nhour >= 12 ? 'PM' : 'AM';
          const nhour12 = nhour % 12 || 12;
          nextTimeDisplay = `${nhour12}:${nm} ${nampm}`;
        }

        // Add to Follow-ups system so it shows in Upcoming list
        addFollowUp({
          leadOrCustomerId: selectedEntityInfo.id,
          leadOrCustomerName: targetName,
          entityType,
          enquiryId,
          type: 'call',
          assignedToId: emp?.id || 'EMP-001',
          assignedToName: empName,
          date: nextFollowUpDate,
          time: nextTimeDisplay,
          priority: 'high',
          purpose: `Site Visit Follow-up: ${purpose.trim()}`,
          notes: `Post-visit follow-up after site inspection at ${location.trim()}. Findings: ${discussionNotes.trim()}`,
          interestStatus: outcome === 'positive' || outcome === 'order_expected' ? 'interested' : 'in_discussion',
          productItem: selectedEntityInfo.product,
          status: 'pending',
        });

        // Also update lead's next follow-up date
        if (entityType === 'lead') {
          try {
            updateLead(selectedEntityInfo.id, { nextFollowUpDate });
          } catch (_) {}
        }
      }

      router.push('/crm/visits');
    } catch (err: any) {
      setFormError(err.message || 'Failed to save site visit report.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in">
      {/* Back Link */}
      <div>
        <Link
          href="/crm/visits"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#70665F] hover:text-[#211B17] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Site Visits Log</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header with Title and Stepper */}
        <div className="border-b border-[#EBE3DB] pb-6 space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#211B17] tracking-tight">
                  Log Site Visit Report
                </h1>
                <p className="text-xs text-[#70665F] mt-1 leading-relaxed">
                  2-Slide Form: Slide 1 for Visit Schedule & Site Details, Slide 2 for Visit Report & Next Follow-up.
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
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-[#70665F] hover:text-[#211B17]'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 text-center text-[10px] flex items-center justify-center">
                  1
                </span>
                <span>Slide 1: Schedule & Site</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToStep2}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  currentStep === 2
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-[#70665F] hover:text-[#211B17]'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 text-center text-[10px] flex items-center justify-center">
                  2
                </span>
                <span>Slide 2: Visit Report & Follow-up</span>
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
              SLIDE 1: VISIT SCHEDULE & SITE LOCATION
             ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Select Customer / Lead */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                    Select Customer / Lead / Factory Site
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Select Customer / Lead <span className="text-rose-500">*</span></span>
                  </label>
                  <select
                    required
                    value={selectedRecordKey}
                    onChange={(e) => handleRecordSelect(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-emerald-600 transition"
                  >
                    <option value="">-- Select Customer / Lead / Plant Site --</option>
                    {leads.length > 0 && (
                      <optgroup label="Prospective Leads">
                        {leads.map((l) => (
                          <option key={`lead-${l.id}`} value={`lead:${l.id}`}>
                            {l.leadNo ? `${l.leadNo} - ` : ''}{l.companyName} ({l.contactPerson || 'Lead'})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {enquiries.length > 0 && (
                      <optgroup label="Technical Inquiries (RFQ)">
                        {enquiries.map((en) => (
                          <option key={`enq-${en.id}`} value={`enquiry:${en.id}`}>
                            {en.enquiryNo || en.id} - {en.customerName} ({en.machineProduct})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {customers.length > 0 && (
                      <optgroup label="Registered Customers">
                        {customers.map((c) => (
                          <option key={`cust-${c.id}`} value={`customer:${c.id}`}>
                            {c.companyName} ({c.customerCode || 'CUST'}) - {c.contactPerson || 'Customer'}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>

                  {/* Summary Card for Selected Lead */}
                  {selectedEntityInfo && (
                    <div className="mt-3 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <div>
                          <strong className="text-emerald-950 font-bold">{selectedEntityInfo.name}</strong>
                          {selectedEntityInfo.contactPerson && (
                            <span className="text-emerald-800 ml-1.5 font-medium">
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
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-emerald-900 border border-emerald-200 shadow-2xs">
                          Item: {selectedEntityInfo.product}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Date, Time & Site Location */}
              <div className="space-y-3 pt-3 border-t border-[#EBE3DB]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center">
                    2
                  </span>
                  <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                    Planned Visit Schedule & Factory Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Planned Visit Date <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="date"
                      required
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-mono text-[#211B17] focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Visit Time (Clock)</span>
                    </label>
                    <input
                      type="time"
                      value={visitTime}
                      onChange={(e) => setVisitTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-mono text-[#211B17] focus:outline-none focus:border-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Site / Factory Location & Address <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Plot No. 18, GIDC Estate, Vatva, Ahmedabad, Gujarat"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium text-[#211B17] focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Delegated Sales / Site Engineer</span>
                    </label>
                    <select
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-emerald-600"
                    >
                      {allStaff.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim()} ({s.department || s.departmentName || 'Field Team'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-[#EBE3DB]">
                <Link
                  href="/crm/visits"
                  className="px-5 py-2.5 border border-[#EBE3DB] text-[#70665F] hover:bg-[#FAF7F2] rounded-xl font-bold transition text-xs"
                >
                  Cancel
                </Link>
                <button
                  type="button"
                  onClick={handleProceedToStep2}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition text-xs shadow-xs active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>Slide 2: Visit Report & Follow-up</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              SLIDE 2: VISIT REPORT, REQUIREMENTS & NEXT FOLLOW-UP
             ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Step 1 Summary Banner */}
              <div className="p-3 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
                <div>
                  <span className="text-[#70665F]">Site / Customer: </span>
                  <strong className="text-[#211B17]">{selectedEntityInfo?.name}</strong>
                  <span className="text-emerald-700 ml-1.5 font-bold">• {location}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-600 font-bold">{visitDate}</span>
                  <span className="text-emerald-700 font-bold">{visitTime}</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-[11px] text-emerald-700 underline font-sans ml-1"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Purpose, Observations & Technical Requirements */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center">
                    3
                  </span>
                  <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                    Visit Purpose & Technical Observations
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                      Visit Purpose <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="e.g. Technical site survey, tank foundation measurements, piping line check"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                      Discussion Summary & Field Observations
                    </label>
                    <textarea
                      rows={3}
                      value={discussionNotes}
                      onChange={(e) => setDiscussionNotes(e.target.value)}
                      placeholder="Discussed with plant head. Space available for equipment. Utility lines verified..."
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-emerald-600 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Site Technical Requirements</span>
                    </label>
                    <textarea
                      rows={2}
                      value={requirementDetails}
                      onChange={(e) => setRequirementDetails(e.target.value)}
                      placeholder="Dimensions: 2200mm diameter x 3500mm height, SS316L material, 16 bar test pressure required, flameproof motor..."
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-emerald-600 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                      Business Outcome / Status <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={outcome}
                      onChange={(e) => setOutcome(e.target.value as SiteVisit['outcome'])}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-emerald-600"
                    >
                      <option value="positive">Positive Progress</option>
                      <option value="order_expected">Order Expected</option>
                      <option value="quotation_required">Quotation Required</option>
                      <option value="follow_up_required">Follow-up Required</option>
                      <option value="not_interested">Not Interested</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Next Follow-up Schedule (Auto-syncs into Follow-ups list!) */}
              <div className="space-y-3 pt-3 border-t border-[#EBE3DB]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center">
                      4
                    </span>
                    <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                      Next Follow-up Due Date & Time
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Next Follow-up</span>
                    </button>
                  )}
                </div>

                {!hasScheduleNext ? (
                  <div className="p-3 bg-[#FAF7F2] border border-dashed border-[#EBE3DB] rounded-xl text-xs text-[#70665F] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarPlus className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Next follow-up is not scheduled. Click above to schedule an upcoming discussion date & time.</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-300 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-emerald-700" />
                        Next Follow-up Schedule
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setHasScheduleNext(false);
                          setNextFollowUpDate('');
                          setNextFollowUpTime('');
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 cursor-pointer"
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
                              className="px-2 py-0.5 text-[10px] font-bold bg-white text-emerald-800 border border-emerald-300 rounded cursor-pointer"
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
                              className="px-2 py-0.5 text-[10px] font-bold bg-white text-emerald-800 border border-emerald-300 rounded cursor-pointer"
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
                              className="px-2 py-0.5 text-[10px] font-bold bg-white text-emerald-800 border border-emerald-300 rounded cursor-pointer"
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
                          className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-mono text-[#211B17]"
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
                          className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-mono text-[#211B17] cursor-pointer"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-emerald-900 font-medium">
                      • Scheduling next follow-up automatically creates an entry in the Follow-ups Register and updates the lead.
                    </p>
                  </div>
                )}
              </div>

              {/* Form Navigation Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 border border-[#EBE3DB] text-[#70665F] hover:bg-[#FAF7F2] rounded-xl font-bold transition text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Back to Slide 1</span>
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    href="/crm/visits"
                    className="px-4 py-2.5 border border-[#EBE3DB] text-[#70665F] hover:bg-[#FAF7F2] rounded-xl font-bold transition text-xs"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition text-xs shadow-xs active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSubmitting ? 'Saving...' : 'Save Site Visit Record'}</span>
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

export default function NewVisitPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#70665F]">Loading Site Visit Form...</div>}>
      <VisitFormContent />
    </Suspense>
  );
}
