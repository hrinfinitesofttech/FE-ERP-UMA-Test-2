'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '../../../../context/ERPContext';
import {
  ArrowLeft,
  UserPlus,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Save,
  Info,
} from 'lucide-react';
import { LeadSource, LeadStatus, PriorityLevel, Employee } from '../../../../types/crm';

function NewLeadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addLead, employees, availableEmployees, exhibitions } = useERP();

  const querySource = (searchParams.get('source') as LeadSource) || 'direct';
  const queryExpoId = searchParams.get('expoId') || searchParams.get('exhibitionId') || '';
  const queryExpoName = searchParams.get('expoName') || searchParams.get('exhibitionName') || '';

  const allEmployees: Employee[] =
    availableEmployees && availableEmployees.length > 0
      ? availableEmployees
      : employees && employees.length > 0
      ? employees
      : [];

  const salesEngineers = allEmployees.filter(
    (e) =>
      (e.departmentName && (e.departmentName.includes('CRM') || e.departmentName.includes('Sales') || e.departmentName.includes('Project'))) ||
      (e.department && (e.department.includes('CRM') || e.department.includes('Sales') || e.department.includes('Project')))
  );

  const defaultSalesPersonId = salesEngineers[0]?.id || allEmployees[0]?.id || '';

  // Requested 5 Fields: Company name, Contact person name, Mobile number, Email, Address
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    mobile: '',
    email: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email regex for valid standard emails (e.g. user@domain.com)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'companyName':
        if (!value || value.trim().length < 2) return 'Company name is required (at least 2 characters).';
        return '';
      case 'contactPerson':
        if (!value || value.trim().length < 2) return 'Contact person name is required (at least 2 characters).';
        return '';
      case 'mobile': {
        if (!value || value.trim() === '') return 'Mobile number is required.';
        const clean = value.replace(/\D/g, '');
        if (clean.length !== 10) return 'Mobile number must be exactly 10 digits.';
        return '';
      }
      case 'email':
        if (value && value.trim() !== '') {
          if (!emailRegex.test(value.trim())) return 'Invalid email format (e.g. name@company.com).';
        }
        return '';
      default:
        return '';
    }
  };

  const validateAll = () => {
    const errs: Record<string, string> = {};
    const cErr = validateField('companyName', formData.companyName);
    if (cErr) errs.companyName = cErr;
    const pErr = validateField('contactPerson', formData.contactPerson);
    if (pErr) errs.contactPerson = pErr;
    const mErr = validateField('mobile', formData.mobile);
    if (mErr) errs.mobile = mErr;
    const eErr = validateField('email', formData.email);
    if (eErr) errs.email = eErr;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (field: keyof typeof formData, rawVal: string) => {
    let sanitizedVal = rawVal;
    if (field === 'mobile') {
      sanitizedVal = rawVal.replace(/\D/g, '').slice(0, 10);
    }
    setFormData((prev) => ({ ...prev, [field]: sanitizedVal }));

    if (touched[field] || submitAttempted) {
      const err = validateField(field, sanitizedVal);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitAttempted(true);

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const assignedPerson = allEmployees.find((emp) => emp.id === defaultSalesPersonId);
      const assignedName = assignedPerson
        ? assignedPerson.name ||
          (assignedPerson as any).employeeName ||
          `${assignedPerson.firstName || ''} ${assignedPerson.lastName || ''}`.trim() ||
          'Pravin Patel'
        : 'Pravin Patel';

      const expo = exhibitions.find((ex) => ex.id === queryExpoId);

      addLead({
        companyName: formData.companyName.trim(),
        contactPerson: formData.contactPerson.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),

        // Default initial values for other fields (editable later via Update Lead)
        industry: '',
        website: '',
        gstin: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        designation: '',
        altMobile: '',
        whatsapp: '',
        productName: 'General Inquiry / Equipment Requirement',
        machineType: '',
        quantity: 1,
        capacity: '',
        application: '',
        requirementDescription: '',
        expectedDelivery: '',
        budget: 0,
        priority: 'medium' as PriorityLevel,
        source: querySource || ('direct' as LeadSource),
        exhibitionId: queryExpoId || undefined,
        exhibitionName: expo ? expo.expoName : queryExpoName || undefined,
        assignedSalesPersonId: defaultSalesPersonId,
        assignedSalesPersonName: assignedName,
        status: 'new' as LeadStatus,
        nextFollowUpDate: '',
        remarks: '',
      });

      router.push(`/crm/leads?tab=leads&created=${encodeURIComponent(formData.companyName.trim())}`);
    } catch (err) {
      console.error('Failed to create lead:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 text-xs pb-10">
      <Link
        href="/crm/leads"
        className="inline-flex items-center gap-1.5 text-crm-brand-700 hover:text-crm-brand-800 font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Leads
      </Link>

      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-6 shadow-sm space-y-6">
        {/* Header */}
        <div className="border-b border-[#EBE3DB] pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F5E6D8] text-[#8C5229] border border-[#E7DED5] font-mono text-[10px] font-bold uppercase tracking-wider">
              Quick Lead Creation
            </span>
          </div>
          <h1 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-crm-brand-700" />
            Add New Lead
          </h1>
          <p className="text-[#70665F] mt-1 text-xs">
            Enter initial prospect details below. Additional machinery specifications, budget, and follow-ups can be updated anytime after creation.
          </p>
        </div>

        {/* Global Validation Warning Banner */}
        {submitAttempted && Object.values(errors).some(Boolean) && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <div>
              <span className="font-bold block">
                Please correct the following {Object.values(errors).filter(Boolean).length} validation errors:
              </span>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-rose-600 font-medium">
                {Object.entries(errors)
                  .filter(([_, msg]) => Boolean(msg))
                  .map(([key, err], i) => (
                    <li key={i}>{err}</li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* 1. Company Name */}
          <div>
            <label className="block text-[#544B45] font-semibold mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#8C5229]" />
              <span>Company Name</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              onBlur={() => handleBlur('companyName')}
              placeholder="e.g. Reliance Industries Ltd. / ABC Pharma Machinery"
              className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] border ${
                errors.companyName && (touched.companyName || submitAttempted)
                  ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                  : 'border-[#EBE3DB]'
              } rounded-xl text-[#211B17] font-bold focus:outline-none focus:border-[#75401F]`}
            />
            {errors.companyName && (touched.companyName || submitAttempted) && (
              <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.companyName}
              </p>
            )}
          </div>

          {/* 2. Contact Person Name */}
          <div>
            <label className="block text-[#544B45] font-semibold mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#8C5229]" />
              <span>Contact Person Name</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.contactPerson}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
              onBlur={() => handleBlur('contactPerson')}
              placeholder="e.g. Rajesh Sharma / Harish Trivedi"
              className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] border ${
                errors.contactPerson && (touched.contactPerson || submitAttempted)
                  ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                  : 'border-[#EBE3DB]'
              } rounded-xl text-[#211B17] font-semibold focus:outline-none focus:border-[#75401F]`}
            />
            {errors.contactPerson && (touched.contactPerson || submitAttempted) && (
              <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.contactPerson}
              </p>
            )}
          </div>

          {/* 3. Mobile Number & 4. Email in a 2-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#544B45] font-semibold mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#8C5229]" />
                <span>Mobile Number</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={10}
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                onBlur={() => handleBlur('mobile')}
                placeholder="10-digit mobile (e.g. 9825012345)"
                className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] border ${
                  errors.mobile && (touched.mobile || submitAttempted)
                    ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                    : 'border-[#EBE3DB]'
                } rounded-xl font-mono text-[#211B17] focus:outline-none focus:border-[#75401F]`}
              />
              {errors.mobile && (touched.mobile || submitAttempted) && (
                <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.mobile}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[#544B45] font-semibold mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#8C5229]" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="e.g. purchase@company.com"
                className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] border ${
                  errors.email && (touched.email || submitAttempted)
                    ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                    : 'border-[#EBE3DB]'
                } rounded-xl text-[#211B17] focus:outline-none focus:border-[#75401F]`}
              />
              {errors.email && (touched.email || submitAttempted) && (
                <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* 5. Address */}
          <div>
            <label className="block text-[#544B45] font-semibold mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#8C5229]" />
              <span>Address</span>
            </label>
            <textarea
              rows={3}
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="e.g. Plot No. 42, GIDC Industrial Estate, Makarpura, Vadodara, Gujarat - 390010"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-[#75401F] leading-relaxed"
            />
          </div>

          {/* Note informing that other fields are updated later */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> All additional fields (Equipment requirement, machine capacity, budget, pipeline status, and follow-ups) can be filled when updating the lead.
            </span>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBE3DB]">
            <Link
              href="/crm/leads"
              className="px-4 py-2.5 border border-[#EBE3DB] text-[#70665F] hover:bg-[#FAF7F2] rounded-xl font-bold transition text-xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-xl font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer text-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Lead...' : 'Save & Register Lead'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewLeadPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#70665F]">Loading Lead Form...</div>}>
      <NewLeadForm />
    </Suspense>
  );
}
