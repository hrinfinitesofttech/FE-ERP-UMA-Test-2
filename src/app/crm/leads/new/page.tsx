'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../../context/ERPContext';
import { LeadSource, LeadStatus, PriorityLevel, Employee } from '../../../../types/crm';
import {
  ERPFormLayout,
  ERPFormSection,
  ERPFormGrid,
  ERPInput,
  ERPSelect,
  ERPSubTableCard,
} from '../../../../components/ui/ERPFormLayout';

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

  // Core Fields
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    whatsapp: '',
    altMobile: '',
    industry: '',
    productName: 'General Inquiry / Equipment Requirement',
    source: (querySource || 'direct') as LeadSource,
    priority: 'medium' as PriorityLevel,
    assignedSalesPersonId: defaultSalesPersonId,
  });

  useEffect(() => {
    if (!formData.assignedSalesPersonId && defaultSalesPersonId) {
      setFormData((prev) => ({ ...prev, assignedSalesPersonId: defaultSalesPersonId }));
    }
  }, [defaultSalesPersonId, formData.assignedSalesPersonId]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email regex
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
    if (field === 'mobile' || field === 'whatsapp' || field === 'altMobile') {
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
      const assignedPerson = allEmployees.find((emp) => emp.id === formData.assignedSalesPersonId);
      const assignedName = assignedPerson
        ? assignedPerson.name ||
          (assignedPerson as any).employeeName ||
          `${assignedPerson.firstName || ''} ${assignedPerson.lastName || ''}`.trim() ||
          'Pravin Patel'
        : 'Pravin Patel';

      const expo = exhibitions.find((ex) => ex.id === queryExpoId);

      await addLead({
        companyName: formData.companyName.trim(),
        contactPerson: formData.contactPerson.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim() || 'India',
        pincode: formData.pincode.trim(),
        whatsapp: formData.whatsapp.trim(),
        altMobile: formData.altMobile.trim(),
        industry: formData.industry.trim(),
        designation: '',
        machineType: '',
        productName: formData.productName.trim() || 'General Inquiry / Equipment Requirement',
        source: formData.source,
        priority: formData.priority,
        assignedSalesPersonId: formData.assignedSalesPersonId,
        assignedSalesPersonName: assignedName,
        exhibitionId: queryExpoId || undefined,
        exhibitionName: expo ? expo.expoName : queryExpoName || undefined,
        status: 'new' as LeadStatus,
        quantity: 1,
        capacity: '',
        application: '',
        requirementDescription: '',
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

  const sourceOptions = [
    { label: 'Direct Inward / Call', value: 'direct' },
    { label: 'Exhibition / Trade Fair', value: 'exhibition' },
    { label: 'Client Referral', value: 'referral' },
    { label: 'Website / Digital Inquiry', value: 'website' },
    { label: 'Indiamart / B2B Portal', value: 'indiamart' },
    { label: 'Other', value: 'other' },
  ];

  const priorityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Urgent', value: 'urgent' },
  ];

  const salesEmployeeOptions = allEmployees.map((emp) => ({
    label: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || emp.username,
    value: emp.id,
  }));

  const errorSummary =
    submitAttempted && Object.values(errors).some(Boolean)
      ? `Please correct ${Object.values(errors).filter(Boolean).length} validation error(s) before saving the lead.`
      : undefined;

  return (
    <ERPFormLayout
      breadcrumbs={['DASHBOARD', 'CRM', 'LEADS', 'CREATE']}
      actionTitle="CREATE"
      backHref="/crm/leads"
      onSubmit={handleSubmit}
      onSaveDraft={() => handleSubmit({ preventDefault: () => {} } as any)}
      isSubmitting={isSubmitting}
      submitLabel="Save & Register Lead"
      errorSummary={errorSummary}
    >
      {/* 1. Lead & Company Details */}
      <ERPFormSection number="1." title="Lead & Company Details" subtitle="Primary Prospect Profile">
        <ERPFormGrid>
          <ERPInput
            label="Company Name"
            required
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            placeholder="e.g. Reliance Industries Ltd."
            error={touched.companyName || submitAttempted ? errors.companyName : undefined}
          />

          <ERPInput
            label="Contact Person Name"
            required
            value={formData.contactPerson}
            onChange={(e) => handleInputChange('contactPerson', e.target.value)}
            placeholder="e.g. Rajesh Sharma"
            error={touched.contactPerson || submitAttempted ? errors.contactPerson : undefined}
          />

          <ERPInput
            label="Mobile Number"
            required
            value={formData.mobile}
            onChange={(e) => handleInputChange('mobile', e.target.value)}
            placeholder="10-digit mobile"
            prefix="+91"
            error={touched.mobile || submitAttempted ? errors.mobile : undefined}
          />

          <ERPInput
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="e.g. purchase@company.com"
            error={touched.email || submitAttempted ? errors.email : undefined}
          />

          <ERPSelect
            label="Lead Source"
            value={formData.source}
            onChange={(e) => setFormData((prev) => ({ ...prev, source: e.target.value as LeadSource }))}
            options={sourceOptions}
          />

          <ERPSelect
            label="Priority Level"
            value={formData.priority}
            onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value as PriorityLevel }))}
            options={priorityOptions}
          />

          <ERPSelect
            label="Assigned Sales Engineer"
            value={formData.assignedSalesPersonId}
            onChange={(e) => setFormData((prev) => ({ ...prev, assignedSalesPersonId: e.target.value }))}
            options={salesEmployeeOptions.length > 0 ? salesEmployeeOptions : [{ label: 'Pravin Patel', value: 'EMP-001' }]}
          />

          <ERPInput
            label="Product Requirement"
            value={formData.productName}
            onChange={(e) => handleInputChange('productName', e.target.value)}
            placeholder="e.g. 5000L Reactor / Mixing Tank"
          />
        </ERPFormGrid>
      </ERPFormSection>

      {/* 2. Basic Details Accordion */}
      <ERPFormSection
        number="2."
        title="Basic Details"
        subtitle="Address & Regional Details"
        isCollapsible
        defaultExpanded
      >
        <ERPFormGrid>
          <ERPInput
            label="Address Line"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Plot / Street / GIDC Industrial Area"
          />

          <ERPInput
            label="City"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="e.g. Vadodara / Ahmedabad"
          />

          <ERPInput
            label="State"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="e.g. Gujarat"
          />

          <ERPInput
            label="Country"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            placeholder="India"
          />

          <ERPInput
            label="Pincode"
            value={formData.pincode}
            onChange={(e) => handleInputChange('pincode', e.target.value)}
            placeholder="e.g. 390010"
          />

          <ERPInput
            label="WhatsApp Number"
            value={formData.whatsapp}
            onChange={(e) => handleInputChange('whatsapp', e.target.value)}
            placeholder="10-digit mobile"
            prefix="+91"
          />

          <ERPInput
            label="Alternate Mobile"
            value={formData.altMobile}
            onChange={(e) => handleInputChange('altMobile', e.target.value)}
            placeholder="Office landline or alternate contact"
          />

          <ERPInput
            label="Industry / Sector"
            value={formData.industry}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            placeholder="e.g. Pharmaceutical / Chemical / FMCG"
          />
        </ERPFormGrid>

        <div className="pt-2">
          <ERPSubTableCard
            title="Contact Directory & Key Personnel"
            isEmpty
            emptyText="Initial contact person configured above. Add additional key stakeholders anytime after lead registration."
          />
        </div>
      </ERPFormSection>
    </ERPFormLayout>
  );
}

export default function NewLeadPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500 font-semibold">Loading Lead Form...</div>}>
      <NewLeadForm />
    </Suspense>
  );
}
