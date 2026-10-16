'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '../../../../context/ERPContext';
import { LeadStatus } from '../../../../types/crm';
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  ArrowLeft,
  Save,
  Loader2,
  UserPlus,
} from 'lucide-react';

function NewLeadForm() {
  const router = useRouter();
  const { addLead, employees, availableEmployees } = useERP();

  const allEmployees =
    availableEmployees && availableEmployees.length > 0
      ? availableEmployees
      : employees && employees.length > 0
      ? employees
      : [];

  const defaultSalesPerson = allEmployees[0];
  const defaultSalesPersonId = defaultSalesPerson?.id || 'EMP-001';
  const defaultSalesPersonName =
    defaultSalesPerson?.name ||
    (defaultSalesPerson as any)?.employeeName ||
    `${defaultSalesPerson?.firstName || ''} ${defaultSalesPerson?.lastName || ''}`.trim() ||
    'Pravin Patel';

  // Exactly matching the 5 fields of erp-test-1.vercel.app/crm/leads/new
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

  // Email regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'companyName':
        if (!value || value.trim().length < 2) return 'Company Name is required (at least 2 characters).';
        return '';
      case 'contactPerson':
        if (!value || value.trim().length < 2) return 'Person Name (Contact Person) is required.';
        return '';
      case 'mobile': {
        if (!value || value.trim() === '') return 'Number (Mobile Contact) is required.';
        const clean = value.replace(/\D/g, '');
        if (clean.length !== 10) return 'Mobile contact must be exactly 10 digits.';
        return '';
      }
      case 'email':
        if (!value || value.trim() === '') return 'Email Address is required.';
        if (!emailRegex.test(value.trim())) return 'Invalid email format (e.g. name@company.com).';
        return '';
      case 'address':
        if (!value || value.trim().length < 3) return 'Address is required.';
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
    const aErr = validateField('address', formData.address);
    if (aErr) errs.address = aErr;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitAttempted(true);

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Derive city if provided in address, fallback to Vadodara
      let extractedCity = 'Vadodara';
      const addrParts = formData.address.split(',');
      if (addrParts.length > 1) {
        const potentialCity = addrParts[addrParts.length - 2].trim();
        if (potentialCity && potentialCity.length < 30) {
          extractedCity = potentialCity;
        }
      }

      await addLead({
        companyName: formData.companyName.trim(),
        contactPerson: formData.contactPerson.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: extractedCity,
        state: 'Gujarat',
        country: 'India',
        pincode: '',
        whatsapp: formData.mobile.trim(),
        altMobile: '',
        industry: 'Manufacturing / Engineering',
        designation: 'Contact Person / Representative',
        machineType: '',
        productName: 'General Inquiry / Process Equipment',
        source: 'phone',
        priority: 'medium',
        assignedSalesPersonId: defaultSalesPersonId,
        assignedSalesPersonName: defaultSalesPersonName,
        status: 'new' as LeadStatus,
        quantity: 1,
        capacity: '',
        application: '',
        requirementDescription: `New lead registered for ${formData.companyName.trim()} by ${formData.contactPerson.trim()}`,
        expectedDelivery: '',
        budget: 0,
        nextFollowUpDate: '',
        remarks: '',
      });

      router.push(`/crm/leads?tab=leads&created=${encodeURIComponent(formData.companyName.trim())}`);
    } catch (err: any) {
      console.error('Failed to create lead:', err);
      setIsSubmitting(false);
      setErrors((prev) => ({ ...prev, submit: err?.message || 'Failed to save lead in database. Please try again.' }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Back Link */}
      <div>
        <Link
          href="/crm/leads"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#70665F] hover:text-[#211B17] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Leads</span>
        </Link>
      </div>

      {/* Main Form Container Matching erp-test-1.vercel.app */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-[#EBE3DB] pb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FAF3EA] border border-[#E7DED5] flex items-center justify-center text-[#8C5229] shrink-0 mt-0.5">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#211B17] tracking-tight">
              New Customer Lead Registration
            </h1>
            <p className="text-xs text-[#70665F] mt-1 leading-relaxed">
              Capture prospective customer details (Company Name, Person Name, Mobile Number, Email, and Address).
            </p>
          </div>
        </div>

        {/* Global Error Banner if any */}
        {errors.submit && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
            {errors.submit}
          </div>
        )}

        {/* Section 1: Customer Lead Information */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FAF3EA] border border-[#E7DED5] text-[#8C5229] font-bold text-[11px] flex items-center justify-center">
                1
              </span>
              <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                Customer Lead Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Field 1: Company Name */}
              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A89F91]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    onBlur={() => handleBlur('companyName')}
                    placeholder="e.g. Industrial Enterprises Ltd."
                    className={`w-full pl-9 pr-3.5 py-2.5 bg-[#FAF7F2] border rounded-xl text-xs font-medium text-[#211B17] placeholder:text-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#75401F]/20 transition ${
                      touched.companyName && errors.companyName
                        ? 'border-rose-400 bg-rose-50/20'
                        : 'border-[#EBE3DB] focus:border-[#75401F]'
                    }`}
                  />
                </div>
                {touched.companyName && errors.companyName && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.companyName}</p>
                )}
              </div>

              {/* Field 2: Person Name (Contact Person) */}
              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Person Name (Contact Person) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A89F91]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    onBlur={() => handleBlur('contactPerson')}
                    placeholder="e.g. Harish Trivedi"
                    className={`w-full pl-9 pr-3.5 py-2.5 bg-[#FAF7F2] border rounded-xl text-xs font-medium text-[#211B17] placeholder:text-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#75401F]/20 transition ${
                      touched.contactPerson && errors.contactPerson
                        ? 'border-rose-400 bg-rose-50/20'
                        : 'border-[#EBE3DB] focus:border-[#75401F]'
                    }`}
                  />
                </div>
                {touched.contactPerson && errors.contactPerson && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.contactPerson}</p>
                )}
              </div>

              {/* Field 3: Number (Mobile Contact) */}
              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Number (Mobile Contact) <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[#EBE3DB] bg-[#F5ECE1] text-[#70665F] font-mono font-bold text-xs">
                    +91
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    onBlur={() => handleBlur('mobile')}
                    placeholder="9825012345"
                    className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] border rounded-r-xl text-xs font-mono font-bold text-[#211B17] placeholder:text-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#75401F]/20 transition ${
                      touched.mobile && errors.mobile
                        ? 'border-rose-400 bg-rose-50/20'
                        : 'border-[#EBE3DB] focus:border-[#75401F]'
                    }`}
                  />
                </div>
                {touched.mobile && errors.mobile && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.mobile}</p>
                )}
              </div>

              {/* Field 4: Email Address */}
              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A89F91]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="name@company.com"
                    className={`w-full pl-9 pr-3.5 py-2.5 bg-[#FAF7F2] border rounded-xl text-xs font-medium text-[#211B17] placeholder:text-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#75401F]/20 transition ${
                      touched.email && errors.email
                        ? 'border-rose-400 bg-rose-50/20'
                        : 'border-[#EBE3DB] focus:border-[#75401F]'
                    }`}
                  />
                </div>
                {touched.email && errors.email && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Field 5: Address */}
            <div>
              <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-center pointer-events-none text-[#A89F91]">
                  <MapPin className="w-4 h-4" />
                </div>
                <textarea
                  required
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  onBlur={() => handleBlur('address')}
                  placeholder="e.g. Plot No. 42, GIDC Industrial Estate, Makarpura, Vadodara, Gujarat - 390010"
                  className={`w-full pl-9 pr-3.5 py-2.5 bg-[#FAF7F2] border rounded-xl text-xs font-medium text-[#211B17] placeholder:text-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#75401F]/20 transition ${
                    touched.address && errors.address
                      ? 'border-rose-400 bg-rose-50/20'
                      : 'border-[#EBE3DB] focus:border-[#75401F]'
                  }`}
                />
              </div>
              {touched.address && errors.address && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBE3DB]">
            <Link
              href="/crm/leads"
              className="px-4 py-2.5 border border-[#EBE3DB] hover:bg-[#FAF7F2] text-[#4A3B32] rounded-xl font-bold text-xs transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#3E2723] hover:bg-[#2C1810] text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Lead...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save & Register Lead</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewLeadPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500 font-semibold">Loading Lead Form...</div>}>
      <NewLeadForm />
    </Suspense>
  );
}
