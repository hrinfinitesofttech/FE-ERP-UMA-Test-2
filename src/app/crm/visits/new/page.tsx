'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '../../../../context/ERPContext';
import { SiteVisit } from '../../../../types/crm';
import {
  MapPin,
  Calendar,
  Building2,
  User,
  Phone,
  FileText,
  ArrowLeft,
  Save,
  AlertCircle,
  Briefcase,
} from 'lucide-react';

function VisitFormContent() {
  const router = useRouter();
  const { addSiteVisit, leads, employees, availableEmployees } = useERP();

  const allStaff =
    availableEmployees && availableEmployees.length > 0
      ? availableEmployees
      : employees && employees.length > 0
      ? employees
      : [];

  const [leadId, setLeadId] = useState(leads[0]?.id || '');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [employeeId, setEmployeeId] = useState(allStaff[0]?.id || 'EMP-001');
  const [purpose, setPurpose] = useState('');
  const [discussionNotes, setDiscussionNotes] = useState('');
  const [requirementDetails, setRequirementDetails] = useState('');
  const [outcome, setOutcome] = useState<SiteVisit['outcome']>('positive');
  const [nextAction, setNextAction] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLeadChange = (id: string) => {
    setLeadId(id);
    const selected = leads.find((l) => l.id === id);
    if (selected) {
      setLocation(selected.address || selected.city || '');
      if (selected.productName && !purpose) {
        setPurpose(`Site inspection for ${selected.productName}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!purpose.trim()) {
      setFormError('Visit purpose is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedLead = leads.find((l) => l.id === leadId);
      const emp = allStaff.find((s) => s.id === employeeId) || allStaff[0];

      addSiteVisit({
        leadId: leadId || undefined,
        customerId: selectedLead?.id || 'LEAD-CUSTOMER',
        customerName: selectedLead?.companyName || 'Valued Lead Client',
        contactPerson: selectedLead?.contactPerson || 'N/A',
        contactMobile: selectedLead?.mobile || '',
        visitDate,
        location: location || selectedLead?.address || selectedLead?.city || 'Client Site',
        employeeId: emp?.id || '',
        employeeName: emp ? (emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()) : 'Sales Engineer',
        purpose: purpose.trim(),
        discussionNotes: discussionNotes.trim(),
        requirementDetails: requirementDetails.trim(),
        outcome,
        nextAction: nextAction.trim(),
        nextFollowUpDate: nextFollowUpDate || undefined,
      });

      router.push('/crm/visits');
    } catch (err: any) {
      setFormError(err.message || 'Failed to save site visit.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in">
      {/* Back Link */}
      <div>
        <Link
          href="/crm/visits"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#70665F] hover:text-[#211B17] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Site Visits</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
        <div className="flex items-start gap-3 border-b border-[#EBE3DB] pb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#211B17] tracking-tight">
              Log Technical Site Visit
            </h1>
            <p className="text-xs text-[#70665F] mt-1 leading-relaxed">
              Record on-site client inspections, physical plant dimensions, operating conditions, and meeting notes.
            </p>
          </div>
        </div>

        {formError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Client & Visit Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center justify-center">
                1
              </span>
              <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                Client & Visit Location
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Select Prospective Client (Lead) <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={leadId}
                  onChange={(e) => handleLeadChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-amber-600 transition"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.leadNo ? `${l.leadNo} - ` : ''}{l.companyName} ({l.contactPerson})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span>Visit Date <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="date"
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-mono text-[#211B17] focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Plant / Site Location Address
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Plot No 42, GIDC Estate, Ankleshwar"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Purpose & Notes */}
          <div className="space-y-4 pt-4 border-t border-[#EBE3DB]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                Visit Purpose, Engineering Observations & Discussion
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Visit Purpose <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Physical layout inspection for Reactor Vessel and Piping hookups"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Discussion Notes & Customer Inputs
                </label>
                <textarea
                  rows={4}
                  value={discussionNotes}
                  onChange={(e) => setDiscussionNotes(e.target.value)}
                  placeholder="Points discussed with plant manager, technical constraints, operating parameters..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-amber-600 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Requirement Details / Site Measurements
                </label>
                <textarea
                  rows={4}
                  value={requirementDetails}
                  onChange={(e) => setRequirementDetails(e.target.value)}
                  placeholder="Exact physical clearances, nozzle orientations, foundation dimensions..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-amber-600 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Visiting Engineer & Outcome */}
          <div className="space-y-4 pt-4 border-t border-[#EBE3DB]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center justify-center">
                3
              </span>
              <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                Engineer Assignment, Outcome & Next Action
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Visiting Sales Engineer
                </label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-amber-600"
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
                  Visit Outcome <span className="text-rose-500">*</span>
                </label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-amber-600"
                >
                  <option value="positive">Positive Progress</option>
                  <option value="order_expected">Order Expected Soon</option>
                  <option value="quotation_required">Quotation Required</option>
                  <option value="follow_up_required">Further Follow-up Required</option>
                  <option value="not_interested">Not Interested / Dropped</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Next Follow-up Due Date
                </label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-mono text-[#211B17] focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Next Action Items
                </label>
                <input
                  type="text"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="e.g. Prepare revised GA drawing and commercial quote by Friday"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#EBE3DB]">
            <Link
              href="/crm/visits"
              className="px-5 py-2.5 border border-[#EBE3DB] text-[#70665F] hover:bg-[#FAF7F2] rounded-xl font-bold transition text-xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold transition text-xs shadow-xs active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Log Site Visit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewSiteVisitPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#70665F]">Loading Site Visit Form...</div>}>
      <VisitFormContent />
    </Suspense>
  );
}
