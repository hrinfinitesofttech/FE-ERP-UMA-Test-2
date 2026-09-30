'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '../../../../context/ERPContext';
import {
  ArrowLeft,
  UserPlus,
  Building,
  Phone,
  Wrench,
  Shield,
  AlertCircle,
  CheckCircle2,
  Calendar,
  DollarSign,
  Layers,
  Mail,
  Smartphone,
  Hash,
} from 'lucide-react';
import { LeadSource, LeadStatus, PriorityLevel } from '../../../../types/crm';

export default function NewLeadPage() {
  const router = useRouter();
  const { addLead, employees, availableEmployees } = useERP();

  const allEmployees =
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

  const defaultSalesPersonId = salesEngineers[0]?.id || allEmployees[0]?.id || 'EMP-003';

  // Current today date in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultFollowUp = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const defaultDelivery = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    // 1. Company
    companyName: '',
    industry: 'Speciality Chemicals',
    website: '',
    gstin: '',
    address: '',
    city: 'Vadodara',
    state: 'Gujarat',
    country: 'India',
    pincode: '390010',

    // 2. Contact
    contactPerson: '',
    designation: 'Project Lead',
    mobile: '',
    altMobile: '',
    email: '',
    whatsapp: '',

    // 3. Requirement
    productName: '',
    machineType: 'Chemical Pressure Vessel / Reactor',
    quantity: 1 as number | string,
    capacity: '',
    application: '',
    requirementDescription: '',
    expectedDelivery: defaultDelivery,
    budget: '' as number | string,
    priority: 'high' as PriorityLevel,

    // 4. CRM
    source: 'exhibition' as LeadSource,
    assignedSalesPersonId: defaultSalesPersonId,
    status: 'new' as LeadStatus,
    nextFollowUpDate: defaultFollowUp,
    remarks: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Email regex for valid standard emails (e.g. user@domain.com)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // GSTIN 15-character format
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  // Validate single field
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'companyName':
        if (!value || value.trim().length < 2) return 'Company name is required (at least 2 characters).';
        return '';
      case 'city':
        if (!value || value.trim().length < 2) return 'City & State is required.';
        return '';
      case 'gstin':
        if (value && value.trim()) {
          if (!gstinRegex.test(value.trim().toUpperCase())) {
            return 'Invalid GSTIN (Must be 15 chars, e.g. 24AAACX0000X1Z1).';
          }
        }
        return '';
      case 'website':
        if (value && value.trim()) {
          const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
          if (!urlPattern.test(value.trim())) return 'Invalid URL (e.g. https://example.com).';
        }
        return '';
      case 'contactPerson':
        if (!value || value.trim().length < 2) return 'Contact person name is required (at least 2 characters).';
        return '';
      case 'mobile': {
        if (!value || value.trim() === '') return 'Mobile contact number is required.';
        const clean = value.replace(/\D/g, '');
        if (clean.length !== 10) return 'Mobile number must be exactly 10 digits (digits only).';
        return '';
      }
      case 'email':
        if (!value || value.trim() === '') return 'Email address is required.';
        if (!emailRegex.test(value.trim())) return 'Invalid email format (Must contain "@" and domain, e.g. name@company.com).';
        return '';
      case 'whatsapp':
        if (value && value.trim()) {
          const clean = value.replace(/\D/g, '');
          if (clean.length !== 10) return 'WhatsApp number must be 10 digits.';
        }
        return '';
      case 'productName':
        if (!value || value.trim().length < 3) return 'Product / Machine title is required (at least 3 characters).';
        return '';
      case 'quantity':
        if (value === '' || Number(value) < 1) return 'Quantity must be at least 1.';
        return '';
      case 'expectedDelivery':
        if (!value || value.trim() === '') return 'Target delivery date is required.';
        if (value < todayStr) return 'Target delivery date cannot be in the past.';
        return '';
      case 'nextFollowUpDate':
        if (!value || value.trim() === '') return 'Follow-up date is required.';
        if (value < todayStr) return 'Follow-up date cannot be in the past (Must be today or future).';
        return '';
      case 'budget':
        if (value !== '' && Number(value) < 0) return 'Estimated budget cannot be negative.';
        return '';
      case 'assignedSalesPersonId':
        if (!value) return 'Please assign a sales engineer.';
        return '';
      default:
        return '';
    }
  };

  // Full validation
  const validateAll = () => {
    const errs: Record<string, string> = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, (formData as any)[key]);
      if (err) errs[key] = err;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (field: string, rawVal: any) => {
    let sanitizedVal = rawVal;

    // Mobile & WhatsApp: strictly allow digits only, max 10 chars
    if (field === 'mobile' || field === 'whatsapp' || field === 'altMobile') {
      sanitizedVal = rawVal.replace(/\D/g, '').slice(0, 10);
    }
    // GSTIN: uppercase alphanumeric only, max 15 chars
    if (field === 'gstin') {
      sanitizedVal = rawVal.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
    }

    setFormData((prev) => ({ ...prev, [field]: sanitizedVal }));

    // Instant validation on type if field was touched or submit was attempted
    if (touched[field] || submitAttempted) {
      const err = validateField(field, sanitizedVal);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, (formData as any)[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!validateAll()) {
      const firstErrorField = document.querySelector('[data-invalid="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const assignedPerson = allEmployees.find((emp) => emp.id === formData.assignedSalesPersonId);
    const assignedName = assignedPerson
      ? assignedPerson.name ||
        (assignedPerson as any).employeeName ||
        `${assignedPerson.firstName || ''} ${assignedPerson.lastName || ''}`.trim() ||
        'Pravin Patel'
      : 'Pravin Patel';

    const created = addLead({
      ...formData,
      companyName: formData.companyName.trim(),
      contactPerson: formData.contactPerson.trim(),
      mobile: formData.mobile.trim(),
      email: formData.email.trim(),
      productName: formData.productName.trim(),
      quantity: Number(formData.quantity) || 1,
      budget: Number(formData.budget) || 0,
      assignedSalesPersonName: assignedName,
    });

    router.push('/crm/leads');
  };

  return (
    <div className="w-full space-y-4 text-xs pb-10">
      <Link
        href="/crm/leads"
        className="inline-flex items-center gap-1.5 text-crm-brand-700 hover:text-crm-brand-800 font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Leads
      </Link>

      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-6 shadow-sm space-y-6">
        <div className="border-b border-[#EBE3DB] pb-4">
          <h1 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-crm-brand-700" />
            New Customer Lead & Technical Inquiry Registration
          </h1>
          <p className="text-[#70665F] mt-0.5">
            Capture prospective customer requirement, machine specifications, commercial budget, and sales assignment.
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

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* SECTION 1: COMPANY */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#544B45] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-crm-brand-50 text-crm-brand-700 flex items-center justify-center text-[10px] font-bold border border-crm-brand-200">
                1
              </span>
              Company & Enterprise Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6" data-invalid={Boolean(errors.companyName && (touched.companyName || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  onBlur={() => handleBlur('companyName')}
                  placeholder="e.g. Industrial Enterprises Ltd."
                  className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] border ${
                    errors.companyName && (touched.companyName || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-xl text-[#211B17] font-bold`}
                />
                {errors.companyName && (touched.companyName || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.companyName}
                  </p>
                )}
              </div>
              <div className="md:col-span-6">
                <label className="block text-[#544B45] font-semibold mb-1">Industry Sector</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  placeholder="e.g. Speciality Chemicals / Pharma / Heavy Engineering"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17]"
                />
              </div>

              <div className="md:col-span-4" data-invalid={Boolean(errors.gstin && (touched.gstin || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">GSTIN Number (15 digits)</label>
                <input
                  type="text"
                  maxLength={15}
                  value={formData.gstin}
                  onChange={(e) => handleInputChange('gstin', e.target.value)}
                  onBlur={() => handleBlur('gstin')}
                  placeholder="24AAACX0000X1Z1"
                  className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] border ${
                    errors.gstin && (touched.gstin || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-xl font-mono uppercase text-[#211B17]`}
                />
                {errors.gstin && (touched.gstin || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.gstin}
                  </p>
                )}
              </div>

              <div className="md:col-span-4" data-invalid={Boolean(errors.website && (touched.website || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">Website URL</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  onBlur={() => handleBlur('website')}
                  placeholder="https://example.com"
                  className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] border ${
                    errors.website && (touched.website || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-xl text-[#211B17]`}
                />
                {errors.website && (touched.website || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.website}
                  </p>
                )}
              </div>

              <div className="md:col-span-4" data-invalid={Boolean(errors.city && (touched.city || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">
                  City & State <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  onBlur={() => handleBlur('city')}
                  placeholder="e.g. Vadodara, Gujarat"
                  className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] border ${
                    errors.city && (touched.city || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-xl text-[#211B17]`}
                />
                {errors.city && (touched.city || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.city}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: CONTACT */}
          <div className="space-y-3 pt-4 border-t border-[#EBE3DB]">
            <h3 className="font-bold text-sm text-[#544B45] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-crm-brand-50 text-crm-brand-700 flex items-center justify-center text-[10px] font-bold border border-crm-brand-200">
                2
              </span>
              Contact Person Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4" data-invalid={Boolean(errors.contactPerson && (touched.contactPerson || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Contact Person Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  onBlur={() => handleBlur('contactPerson')}
                  placeholder="e.g. Harish Trivedi"
                  className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] border ${
                    errors.contactPerson && (touched.contactPerson || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-xl text-[#211B17] font-semibold`}
                />
                {errors.contactPerson && (touched.contactPerson || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.contactPerson}
                  </p>
                )}
              </div>

              <div className="md:col-span-4">
                <label className="block text-[#544B45] font-semibold mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  placeholder="e.g. Project Lead / Purchase Head"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17]"
                />
              </div>

              <div className="md:col-span-4" data-invalid={Boolean(errors.mobile && (touched.mobile || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Mobile Contact (10 digits) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-mono text-[#70665F] font-bold">+91</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    onBlur={() => handleBlur('mobile')}
                    placeholder="9825012345"
                    className={`w-full pl-11 pr-3.5 py-2.5 bg-[#FAF7F2] border ${
                      errors.mobile && (touched.mobile || submitAttempted)
                        ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                        : 'border-[#EBE3DB]'
                    } rounded-xl text-[#211B17] font-mono font-semibold tracking-wider`}
                  />
                </div>
                {errors.mobile && (touched.mobile || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.mobile}
                  </p>
                )}
              </div>

              <div className="md:col-span-6" data-invalid={Boolean(errors.email && (touched.email || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#70665F] absolute left-3 top-3" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="name@company.com"
                    className={`w-full pl-9 pr-3.5 py-2.5 bg-[#FAF7F2] border ${
                      errors.email && (touched.email || submitAttempted)
                        ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                        : 'border-[#EBE3DB]'
                    } rounded-xl text-[#211B17] font-medium`}
                  />
                </div>
                {errors.email && (touched.email || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.email}
                  </p>
                )}
              </div>

              <div className="md:col-span-6" data-invalid={Boolean(errors.whatsapp && (touched.whatsapp || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">WhatsApp Number (10 digits)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-mono text-[#70665F] font-bold">+91</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    onBlur={() => handleBlur('whatsapp')}
                    placeholder="9825012345"
                    className={`w-full pl-11 pr-3.5 py-2.5 bg-[#FAF7F2] border ${
                      errors.whatsapp && (touched.whatsapp || submitAttempted)
                        ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                        : 'border-[#EBE3DB]'
                    } rounded-xl text-[#211B17] font-mono font-semibold tracking-wider`}
                  />
                </div>
                {errors.whatsapp && (touched.whatsapp || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.whatsapp}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: MACHINE / EQUIPMENT REQUIREMENT */}
          <div className="space-y-3 pt-4 border-t border-[#EBE3DB]">
            <h3 className="font-bold text-sm text-[#544B45] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-crm-brand-50 text-crm-brand-700 flex items-center justify-center text-[10px] font-bold border border-crm-brand-200">
                3
              </span>
              Machine & Equipment Technical Requirement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div
                className="md:col-span-8"
                data-invalid={Boolean(errors.productName && (touched.productName || submitAttempted))}
              >
                <label className="block text-[#544B45] font-semibold mb-1">
                  Product / Machine Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  onBlur={() => handleBlur('productName')}
                  placeholder="e.g. 10 KL SS 316L Chemical Reactor Vessel with Limpet Jacket"
                  className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] border ${
                    errors.productName && (touched.productName || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-xl font-bold text-[#211B17]`}
                />
                {errors.productName && (touched.productName || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.productName}
                  </p>
                )}
              </div>

              <div className="md:col-span-4" data-invalid={Boolean(errors.quantity && (touched.quantity || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                  onBlur={() => handleBlur('quantity')}
                  className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] border ${
                    errors.quantity && (touched.quantity || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-xl font-mono text-[#211B17]`}
                />
                {errors.quantity && (touched.quantity || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.quantity}
                  </p>
                )}
              </div>

              <div className="md:col-span-4">
                <label className="block text-[#544B45] font-semibold mb-1">Capacity / Dimensions</label>
                <input
                  type="text"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', e.target.value)}
                  placeholder="e.g. 10,000 Litres / 150 Kg / 2000 mm Dia"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17]"
                />
              </div>

              <div className="md:col-span-4" data-invalid={Boolean(errors.expectedDelivery && (touched.expectedDelivery || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Target Delivery Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={formData.expectedDelivery}
                  onChange={(e) => handleInputChange('expectedDelivery', e.target.value)}
                  onBlur={() => handleBlur('expectedDelivery')}
                  className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] border ${
                    errors.expectedDelivery && (touched.expectedDelivery || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-xl text-[#211B17] font-mono`}
                />
                {errors.expectedDelivery && (touched.expectedDelivery || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.expectedDelivery}
                  </p>
                )}
              </div>

              <div className="md:col-span-4" data-invalid={Boolean(errors.budget && (touched.budget || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">Estimated Budget (₹)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value === '' ? '' : Number(e.target.value))}
                  onBlur={() => handleBlur('budget')}
                  className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] border ${
                    errors.budget && (touched.budget || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-xl font-bold text-emerald-600`}
                />
                {errors.budget && (touched.budget || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.budget}
                  </p>
                )}
              </div>

              <div className="md:col-span-12">
                <label className="block text-[#544B45] font-semibold mb-1">Technical Scope & Description</label>
                <textarea
                  rows={3}
                  value={formData.requirementDescription}
                  onChange={(e) => handleInputChange('requirementDescription', e.target.value)}
                  placeholder="Pressure ratings, material of construction (SS304/SS316/Hastelloy), testing requirements (Hydro/Radiography), cGMP standards..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: CRM & ASSIGNMENT */}
          <div className="space-y-3 pt-4 border-t border-[#EBE3DB]">
            <h3 className="font-bold text-sm text-[#544B45] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-crm-brand-50 text-crm-brand-700 flex items-center justify-center text-[10px] font-bold border border-crm-brand-200">
                4
              </span>
              Lead Source & Sales Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <label className="block text-[#544B45] font-semibold mb-1">Lead Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] font-semibold"
                >
                  <option value="exhibition">Exhibition / Expo</option>
                  <option value="website">Website Inquiry</option>
                  <option value="phone">Direct Phone Call</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="referral">Referral</option>
                  <option value="existing_customer">Existing Customer</option>
                </select>
              </div>

              <div className="md:col-span-3" data-invalid={Boolean(errors.assignedSalesPersonId && (touched.assignedSalesPersonId || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Assigned Sales Engineer <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.assignedSalesPersonId}
                  onChange={(e) => handleInputChange('assignedSalesPersonId', e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] border ${
                    errors.assignedSalesPersonId && (touched.assignedSalesPersonId || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-xl text-[#211B17] font-medium`}
                >
                  {allEmployees.map((emp) => {
                    const name =
                      emp.name ||
                      (emp as any).employeeName ||
                      `${emp.firstName || ''} ${emp.lastName || ''}`.trim() ||
                      emp.id;
                    const dept = emp.department || (emp as any).departmentName || 'CRM';
                    return (
                      <option key={emp.id} value={emp.id}>
                        {name} ({dept})
                      </option>
                    );
                  })}
                </select>
                {errors.assignedSalesPersonId && (touched.assignedSalesPersonId || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.assignedSalesPersonId}
                  </p>
                )}
              </div>

              <div className="md:col-span-3">
                <label className="block text-[#544B45] font-semibold mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] font-bold"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">URGENT Fast-Track</option>
                </select>
              </div>

              <div className="md:col-span-3" data-invalid={Boolean(errors.nextFollowUpDate && (touched.nextFollowUpDate || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Next Follow-up Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={formData.nextFollowUpDate}
                  onChange={(e) => handleInputChange('nextFollowUpDate', e.target.value)}
                  onBlur={() => handleBlur('nextFollowUpDate')}
                  className={`w-full px-3.5 py-2.5 bg-[#FAF7F2] border ${
                    errors.nextFollowUpDate && (touched.nextFollowUpDate || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-xl text-[#211B17] font-mono`}
                />
                {errors.nextFollowUpDate && (touched.nextFollowUpDate || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> {errors.nextFollowUpDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#EBE3DB]">
            <Link
              href="/crm/leads"
              className="px-4 py-2 border border-[#EBE3DB] rounded-lg hover:bg-slate-50 font-semibold text-[#544B45] transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-xl font-bold shadow-md transition transform active:scale-95"
            >
              Register & Save Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
