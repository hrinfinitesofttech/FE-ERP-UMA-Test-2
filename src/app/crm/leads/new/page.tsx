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
    expectedDelivery: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: '' as number | string,
    priority: 'high' as PriorityLevel,

    // 4. CRM
    source: 'exhibition' as LeadSource,
    assignedSalesPersonId: defaultSalesPersonId,
    status: 'new' as LeadStatus,
    nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    remarks: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Field Level Validation
  const validate = () => {
    const errs: Record<string, string> = {};

    // 1. Company validations
    if (!formData.companyName || formData.companyName.trim().length < 2) {
      errs.companyName = 'Company name is required (at least 2 characters).';
    }

    if (formData.gstin && formData.gstin.trim()) {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(formData.gstin.trim().toUpperCase())) {
        errs.gstin = 'Invalid GSTIN format. E.g. 24AAACX0000X1Z1 (15 characters).';
      }
    }

    if (formData.website && formData.website.trim()) {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (!urlPattern.test(formData.website.trim())) {
        errs.website = 'Invalid website URL format (e.g. https://example.com).';
      }
    }

    if (!formData.city || formData.city.trim().length < 2) {
      errs.city = 'City & State is required.';
    }

    // 2. Contact validations
    if (!formData.contactPerson || formData.contactPerson.trim().length < 2) {
      errs.contactPerson = 'Contact person name is required (at least 2 characters).';
    }

    if (!formData.mobile || formData.mobile.trim() === '') {
      errs.mobile = 'Mobile contact number is required.';
    } else {
      const cleanMobile = formData.mobile.replace(/[\s+-]/g, '');
      if (cleanMobile.length < 10 || cleanMobile.length > 15 || !/^\d+$/.test(cleanMobile)) {
        errs.mobile = 'Please enter a valid 10-digit mobile number.';
      }
    }

    if (!formData.email || formData.email.trim() === '') {
      errs.email = 'Email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errs.email = 'Please enter a valid email address (e.g. contact@company.com).';
      }
    }

    if (formData.whatsapp && formData.whatsapp.trim()) {
      const cleanWa = formData.whatsapp.replace(/[\s+-]/g, '');
      if (cleanWa.length < 10 || cleanWa.length > 15 || !/^\d+$/.test(cleanWa)) {
        errs.whatsapp = 'Please enter a valid WhatsApp number (10-15 digits).';
      }
    }

    // 3. Requirement validations
    if (!formData.productName || formData.productName.trim().length < 3) {
      errs.productName = 'Product / Machine title is required (at least 3 characters).';
    }

    if (formData.quantity === '' || Number(formData.quantity) < 1) {
      errs.quantity = 'Quantity must be at least 1.';
    }

    if (formData.budget !== '' && Number(formData.budget) < 0) {
      errs.budget = 'Estimated budget cannot be negative.';
    }

    if (!formData.expectedDelivery || formData.expectedDelivery.trim() === '') {
      errs.expectedDelivery = 'Target delivery date is required.';
    }

    // 4. Sales Person
    if (!formData.assignedSalesPersonId) {
      errs.assignedSalesPersonId = 'Please assign a sales engineer.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!validate()) {
      // Scroll to the first error
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

    router.push(`/crm/leads/${created.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 text-xs pb-10">
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
        {submitAttempted && Object.keys(errors).length > 0 && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <div>
              <span className="font-bold block">Please fix the following {Object.keys(errors).length} errors before submitting:</span>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-rose-600">
                {Object.values(errors).map((err, i) => (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div data-invalid={Boolean(errors.companyName && (touched.companyName || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => {
                    setFormData({ ...formData, companyName: e.target.value });
                    if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: '' }));
                  }}
                  onBlur={() => handleBlur('companyName')}
                  placeholder="e.g. Industrial Enterprises Ltd."
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border ${
                    errors.companyName && (touched.companyName || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-lg text-[#211B17] font-bold`}
                />
                {errors.companyName && (touched.companyName || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.companyName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Industry Sector</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g. Chemicals / Pharma / Heavy Engineering"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div data-invalid={Boolean(errors.gstin && (touched.gstin || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => {
                    setFormData({ ...formData, gstin: e.target.value.toUpperCase() });
                    if (errors.gstin) setErrors((prev) => ({ ...prev, gstin: '' }));
                  }}
                  onBlur={() => handleBlur('gstin')}
                  placeholder="24AAACX0000X1Z1"
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border ${
                    errors.gstin && (touched.gstin || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-lg font-mono uppercase text-[#211B17]`}
                />
                {errors.gstin && (touched.gstin || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.gstin}
                  </p>
                )}
              </div>
              <div data-invalid={Boolean(errors.website && (touched.website || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">Website URL</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => {
                    setFormData({ ...formData, website: e.target.value });
                    if (errors.website) setErrors((prev) => ({ ...prev, website: '' }));
                  }}
                  onBlur={() => handleBlur('website')}
                  placeholder="https://example.com"
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border ${
                    errors.website && (touched.website || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-lg text-[#211B17]`}
                />
                {errors.website && (touched.website || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.website}
                  </p>
                )}
              </div>
              <div data-invalid={Boolean(errors.city && (touched.city || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">
                  City & State <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => {
                    setFormData({ ...formData, city: e.target.value });
                    if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
                  }}
                  onBlur={() => handleBlur('city')}
                  placeholder="e.g. Vadodara, Gujarat"
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border ${
                    errors.city && (touched.city || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-lg text-[#211B17]`}
                />
                {errors.city && (touched.city || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.city}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: CONTACT */}
          <div className="space-y-3 pt-3 border-t border-[#EBE3DB]">
            <h3 className="font-bold text-sm text-[#544B45] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-crm-brand-50 text-crm-brand-700 flex items-center justify-center text-[10px] font-bold border border-crm-brand-200">
                2
              </span>
              Contact Person Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div data-invalid={Boolean(errors.contactPerson && (touched.contactPerson || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Contact Person Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => {
                    setFormData({ ...formData, contactPerson: e.target.value });
                    if (errors.contactPerson) setErrors((prev) => ({ ...prev, contactPerson: '' }));
                  }}
                  onBlur={() => handleBlur('contactPerson')}
                  placeholder="e.g. Harish Trivedi"
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border ${
                    errors.contactPerson && (touched.contactPerson || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-lg text-[#211B17] font-semibold`}
                />
                {errors.contactPerson && (touched.contactPerson || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.contactPerson}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Head of Capex / Purchase Manager"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>
              <div data-invalid={Boolean(errors.mobile && (touched.mobile || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Mobile Contact <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => {
                    setFormData({ ...formData, mobile: e.target.value });
                    if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: '' }));
                  }}
                  onBlur={() => handleBlur('mobile')}
                  placeholder="+91 98250 XXXXX"
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border ${
                    errors.mobile && (touched.mobile || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-lg text-[#211B17] font-mono`}
                />
                {errors.mobile && (touched.mobile || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.mobile}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div data-invalid={Boolean(errors.email && (touched.email || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  onBlur={() => handleBlur('email')}
                  placeholder="contact@company.com"
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border ${
                    errors.email && (touched.email || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-lg text-[#211B17]`}
                />
                {errors.email && (touched.email || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>
              <div data-invalid={Boolean(errors.whatsapp && (touched.whatsapp || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => {
                    setFormData({ ...formData, whatsapp: e.target.value });
                    if (errors.whatsapp) setErrors((prev) => ({ ...prev, whatsapp: '' }));
                  }}
                  onBlur={() => handleBlur('whatsapp')}
                  placeholder="+91 98250 XXXXX"
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border ${
                    errors.whatsapp && (touched.whatsapp || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-lg text-[#211B17] font-mono`}
                />
                {errors.whatsapp && (touched.whatsapp || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.whatsapp}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: MACHINE / EQUIPMENT REQUIREMENT */}
          <div className="space-y-3 pt-3 border-t border-[#EBE3DB]">
            <h3 className="font-bold text-sm text-[#544B45] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-crm-brand-50 text-crm-brand-700 flex items-center justify-center text-[10px] font-bold border border-crm-brand-200">
                3
              </span>
              Machine & Equipment Technical Requirement
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                className="sm:col-span-2"
                data-invalid={Boolean(errors.productName && (touched.productName || submitAttempted))}
              >
                <label className="block text-[#544B45] font-semibold mb-1">
                  Product / Machine Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => {
                    setFormData({ ...formData, productName: e.target.value });
                    if (errors.productName) setErrors((prev) => ({ ...prev, productName: '' }));
                  }}
                  onBlur={() => handleBlur('productName')}
                  placeholder="e.g. 10 KL SS 316L Chemical Reactor Vessel with Limpet Jacket"
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border ${
                    errors.productName && (touched.productName || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-lg font-bold text-[#211B17]`}
                />
                {errors.productName && (touched.productName || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.productName}
                  </p>
                )}
              </div>
              <div data-invalid={Boolean(errors.quantity && (touched.quantity || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="1"
                  value={formData.quantity}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      quantity: e.target.value === '' ? '' : Number(e.target.value),
                    });
                    if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: '' }));
                  }}
                  onBlur={() => handleBlur('quantity')}
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border ${
                    errors.quantity && (touched.quantity || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-lg font-mono text-[#211B17]`}
                />
                {errors.quantity && (touched.quantity || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.quantity}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Capacity / Dimensions</label>
                <input
                  type="text"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="e.g. 10,000 Litres / 150 Kg"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>
              <div data-invalid={Boolean(errors.expectedDelivery && (touched.expectedDelivery || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Target Delivery Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.expectedDelivery}
                  onChange={(e) => {
                    setFormData({ ...formData, expectedDelivery: e.target.value });
                    if (errors.expectedDelivery) setErrors((prev) => ({ ...prev, expectedDelivery: '' }));
                  }}
                  onBlur={() => handleBlur('expectedDelivery')}
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border ${
                    errors.expectedDelivery && (touched.expectedDelivery || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-lg text-[#211B17]`}
                />
                {errors.expectedDelivery && (touched.expectedDelivery || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.expectedDelivery}
                  </p>
                )}
              </div>
              <div data-invalid={Boolean(errors.budget && (touched.budget || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">Estimated Budget (₹)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.budget}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      budget: e.target.value === '' ? '' : Number(e.target.value),
                    });
                    if (errors.budget) setErrors((prev) => ({ ...prev, budget: '' }));
                  }}
                  onBlur={() => handleBlur('budget')}
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border ${
                    errors.budget && (touched.budget || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-lg font-bold text-emerald-600`}
                />
                {errors.budget && (touched.budget || submitAttempted) && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.budget}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[#544B45] font-semibold mb-1">Technical Scope & Description</label>
              <textarea
                rows={3}
                value={formData.requirementDescription}
                onChange={(e) => setFormData({ ...formData, requirementDescription: e.target.value })}
                placeholder="Pressure ratings, material of construction (SS304/SS316/Hastelloy), testing requirements (Hydro/Radiography), cGMP standards..."
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
              />
            </div>
          </div>

          {/* SECTION 4: CRM & ASSIGNMENT */}
          <div className="space-y-3 pt-3 border-t border-[#EBE3DB]">
            <h3 className="font-bold text-sm text-[#544B45] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-crm-brand-50 text-crm-brand-700 flex items-center justify-center text-[10px] font-bold border border-crm-brand-200">
                4
              </span>
              Lead Source & Sales Assignment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Lead Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] font-semibold"
                >
                  <option value="exhibition">Exhibition / Expo</option>
                  <option value="website">Website Inquiry</option>
                  <option value="phone">Direct Phone Call</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="referral">Referral</option>
                  <option value="existing_customer">Existing Customer</option>
                </select>
              </div>

              <div data-invalid={Boolean(errors.assignedSalesPersonId && (touched.assignedSalesPersonId || submitAttempted))}>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Assigned Sales Engineer <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.assignedSalesPersonId}
                  onChange={(e) => {
                    setFormData({ ...formData, assignedSalesPersonId: e.target.value });
                    if (errors.assignedSalesPersonId) setErrors((prev) => ({ ...prev, assignedSalesPersonId: '' }));
                  }}
                  className={`w-full px-3 py-2 bg-[#FAF7F2] border ${
                    errors.assignedSalesPersonId && (touched.assignedSalesPersonId || submitAttempted)
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                      : 'border-[#EBE3DB]'
                  } rounded-lg text-[#211B17] font-medium`}
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
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.assignedSalesPersonId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] font-bold"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">URGENT Fast-Track</option>
                </select>
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Next Follow-up Date</label>
                <input
                  type="date"
                  value={formData.nextFollowUpDate}
                  onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] font-mono"
                />
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
