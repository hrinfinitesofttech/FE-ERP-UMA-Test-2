'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '../../../../context/ERPContext';
import {
  Calendar,
  Building2,
  MapPin,
  ArrowLeft,
  Save,
  AlertCircle,
  Sparkles,
  Users,
  Layers,
  FileText,
  DollarSign,
} from 'lucide-react';
import { ERPDatePicker } from '../../../../components/ui/ERPDatePicker';

function ExhibitionFormContent() {
  const router = useRouter();
  const { addExhibition, employees, availableEmployees } = useERP();

  const allStaff =
    availableEmployees && availableEmployees.length > 0
      ? availableEmployees
      : employees && employees.length > 0
      ? employees
      : [];

  const [expoName, setExpoName] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stallNumber, setStallNumber] = useState('');
  const [budget, setBudget] = useState<number | ''>(0);
  const [assignedTeam, setAssignedTeam] = useState<string[]>([]);
  const [productsDisplayed, setProductsDisplayed] = useState('');
  const [notes, setNotes] = useState('');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!expoName.trim()) {
      setFormError('Exhibition / Event Name is required.');
      return;
    }
    if (!location.trim()) {
      setFormError('Venue & City location is required.');
      return;
    }
    if (!startDate) {
      setFormError('Please select the Start Date.');
      return;
    }
    if (!endDate) {
      setFormError('Please select the End Date.');
      return;
    }
    if (endDate < startDate) {
      setFormError('End Date cannot be before Start Date.');
      return;
    }

    setIsSubmitting(true);

    try {
      addExhibition({
        expoName: expoName.trim(),
        organizer: '',
        location: location.trim(),
        startDate,
        endDate,
        stallNumber: stallNumber.trim() || 'TBD',
        contactPerson: '',
        budget: typeof budget === 'number' ? budget : 0,
        assignedTeam,
        productsDisplayed: productsDisplayed.trim(),
        notes: notes.trim(),
        totalContacts: 0,
        qualifiedLeads: 0,
        quotationsSent: 0,
        convertedCustomers: 0,
      });

      router.push('/crm/exhibitions');
    } catch (err: any) {
      setFormError(err.message || 'Failed to register exhibition.');
      setIsSubmitting(false);
    }
  };

  const toggleStaff = (id: string) => {
    setAssignedTeam((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in">
      {/* Back Link */}
      <div>
        <Link
          href="/crm/exhibitions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#70665F] hover:text-[#211B17] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Exhibitions & Expos</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
        <div className="flex items-start gap-3 border-b border-[#EBE3DB] pb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#211B17] tracking-tight">
              Register New Trade Exhibition / Expo
            </h1>
            <p className="text-xs text-[#70665F] mt-1 leading-relaxed">
              Plan corporate stall participation, marketing budget, displayed products, and sales team delegation.
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
          {/* Section 1: Event Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[11px] flex items-center justify-center">
                1
              </span>
              <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                Exhibition Event & Venue Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Exhibition / Expo Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={expoName}
                  onChange={(e) => setExpoName(e.target.value)}
                  placeholder="e.g. ChemTech World Expo 2026 / ENGIMACH / PLASTINDIA"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Venue & City <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Helipad Exhibition Centre, Gandhinagar, Gujarat"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Stall & Dates */}
          <div className="space-y-4 pt-4 border-t border-[#EBE3DB]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[11px] flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                Stall Allocation & Schedule
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Start Date <span className="text-rose-500">*</span></span>
                </label>
                <ERPDatePicker
                  value={startDate}
                  placeholder="Select Date"
                  onChange={(val) => {
                    setStartDate(val);
                    if (formError) setFormError('');
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>End Date <span className="text-rose-500">*</span></span>
                </label>
                <ERPDatePicker
                  minDate={startDate || undefined}
                  value={endDate}
                  placeholder="Select Date"
                  onChange={(val) => {
                    setEndDate(val);
                    if (formError) setFormError('');
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Stall / Booth Number
                </label>
                <input
                  type="text"
                  value={stallNumber}
                  onChange={(e) => setStallNumber(e.target.value)}
                  placeholder="e.g. Hall 4 / Booth B-18"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-mono font-bold text-[#211B17] focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                <span>Allocated Budget (₹) <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={budget}
                onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-mono font-bold text-[#211B17] focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Section 3: Products & Delegation */}
          <div className="space-y-4 pt-4 border-t border-[#EBE3DB]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[11px] flex items-center justify-center">
                3
              </span>
              <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                Displayed Products & Team Assignment
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Products / Equipment Displayed</span>
              </label>
              <input
                type="text"
                value={productsDisplayed}
                onChange={(e) => setProductsDisplayed(e.target.value)}
                placeholder="e.g. SS316 Reaction Vessels, Heat Exchangers, Storage Tanks, Pilot Plants"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-indigo-600"
              />
            </div>

            {/* Team Selection */}
            {allStaff.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Select Delegated Team Members</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl">
                  {allStaff.map((staff) => {
                    const isChecked = assignedTeam.includes(staff.id);
                    const nameStr =
                      staff.name ||
                      `${staff.firstName || ''} ${staff.lastName || ''}`.trim() ||
                      staff.id;
                    return (
                      <label
                        key={staff.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition select-none ${
                          isChecked
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleStaff(staff.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                        />
                        <span className="truncate">{nameStr}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Notes & Strategy Guidelines</span>
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Target visitor industries, brochure distribution, special offers, booth setup guidelines..."
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-indigo-600 leading-relaxed"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#EBE3DB]">
            <Link
              href="/crm/exhibitions"
              className="px-5 py-2.5 border border-[#EBE3DB] text-[#70665F] hover:bg-[#FAF7F2] rounded-xl font-bold transition text-xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white rounded-xl font-bold transition text-xs shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering...' : 'Register Exhibition'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewExhibitionPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs font-bold text-slate-500">
          Loading Exhibition Registration Form...
        </div>
      }
    >
      <ExhibitionFormContent />
    </Suspense>
  );
}
