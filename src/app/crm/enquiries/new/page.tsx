'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '../../../../context/ERPContext';
import { Enquiry } from '../../../../types/crm';
import {
  FileText,
  Building2,
  User,
  Phone,
  Mail,
  Calendar,
  Layers,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Sparkles,
} from 'lucide-react';

function EnquiryFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const leadIdParam = searchParams.get('leadId');

  const {
    enquiries,
    addEnquiry,
    updateEnquiry,
    leads,
    customers,
    currentUser,
    employees,
    availableEmployees,
  } = useERP();

  const allStaff =
    availableEmployees && availableEmployees.length > 0
      ? availableEmployees
      : employees && employees.length > 0
      ? employees
      : [];

  const [selectedEntityVal, setSelectedEntityVal] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [machineProduct, setMachineProduct] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [requirement, setRequirement] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [assignedPersonId, setAssignedPersonId] = useState(allStaff[0]?.id || 'EMP-001');
  const [status, setStatus] = useState<Enquiry['status']>('new');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingEnquiry, setExistingEnquiry] = useState<Enquiry | null>(null);

  // Load enquiry if editing
  useEffect(() => {
    if (editId) {
      const enq = enquiries.find((e) => e.id === editId || e.enquiryNo === editId);
      if (enq) {
        setExistingEnquiry(enq);
        setCustomerName(enq.customerName || '');
        setCustomerEmail(enq.customerEmail || '');
        setContactPerson(enq.contactPerson || '');
        setContactMobile(enq.contactMobile || '');
        setMachineProduct(enq.machineProduct || '');
        setQuantity(enq.quantity || 1);
        setRequirement(enq.requirement || enq.specification || '');
        setExpectedDelivery(enq.expectedDelivery || '');
        setAssignedPersonId(enq.assignedPersonId || allStaff[0]?.id || 'EMP-001');
        setStatus(enq.status || 'new');
        if (enq.leadId) {
          setSelectedLeadId(enq.leadId);
          setSelectedEntityVal(`lead:${enq.leadId}`);
        }
      }
    }
  }, [editId, enquiries]);

  // Pre-select lead if passed in URL query param
  useEffect(() => {
    if (!editId && leadIdParam && leads.length > 0) {
      handleEntitySelect(`lead:${leadIdParam}`);
    }
  }, [editId, leadIdParam, leads]);

  // Handle lead or customer selection
  const handleEntitySelect = (val: string) => {
    setSelectedEntityVal(val);
    if (!val) {
      setSelectedLeadId('');
      setCustomerName('');
      setCustomerEmail('');
      setContactPerson('');
      setContactMobile('');
      return;
    }

    if (val.startsWith('lead:')) {
      const id = val.replace('lead:', '');
      const lead = leads.find((l) => l.id === id || l.leadNo === id);
      if (lead) {
        setSelectedLeadId(lead.id);
        setSelectedEntityVal(`lead:${lead.id}`);
        setCustomerName(lead.companyName || '');
        setCustomerEmail(lead.email || '');
        setContactPerson(
          lead.contactPerson && lead.contactPerson !== 'Contact Person' && lead.contactPerson !== 'Contact'
            ? lead.contactPerson
            : ''
        );
        setContactMobile(lead.mobile && lead.mobile !== '9999999999' ? lead.mobile : '');
        if ((lead.productName || lead.machineType) && !machineProduct) {
          setMachineProduct(lead.productName || lead.machineType || '');
        }
        if (lead.quantity) {
          setQuantity(lead.quantity);
        }
      } else {
        setSelectedLeadId(id);
      }
    } else if (val.startsWith('cust:')) {
      const id = val.replace('cust:', '');
      setSelectedLeadId('');
      const cust = customers.find((c) => c.id === id || c.customerCode === id);
      if (cust) {
        setCustomerName(cust.companyName || '');
        setCustomerEmail(cust.email || '');
        setContactPerson(
          cust.contactPerson && cust.contactPerson !== 'Contact Person' && cust.contactPerson !== 'Contact'
            ? cust.contactPerson
            : ''
        );
        setContactMobile(cust.mobile && cust.mobile !== '9999999999' ? cust.mobile : '');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('Please select or specify a Customer / Lead.');
      return;
    }
    if (!machineProduct.trim()) {
      setFormError('Product Name / Equipment is required.');
      return;
    }
    const numQty = typeof quantity === 'number' ? quantity : parseInt(String(quantity), 10);
    if (!quantity || isNaN(numQty) || numQty < 1) {
      setFormError('Quantity must be at least 1.');
      return;
    }

    setIsSubmitting(true);

    try {
      const assigned = allStaff.find((s) => s.id === assignedPersonId);
      const assignedName = assigned
        ? assigned.name || `${assigned.firstName || ''} ${assigned.lastName || ''}`.trim()
        : currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Pravin Patel';

      if (existingEnquiry) {
        updateEnquiry(existingEnquiry.id, {
          leadId: selectedLeadId || existingEnquiry.leadId || undefined,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || existingEnquiry.customerEmail,
          contactPerson: contactPerson.trim() || existingEnquiry.contactPerson,
          contactMobile: contactMobile.trim() || existingEnquiry.contactMobile,
          machineProduct: machineProduct.trim(),
          quantity: numQty,
          requirement: requirement.trim() || `Enquiry for ${machineProduct.trim()}`,
          specification: requirement.trim(),
          expectedDelivery,
          assignedPersonId,
          assignedPersonName: assignedName,
          status,
        });
      } else {
        addEnquiry({
          leadId: selectedLeadId || undefined,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || '',
          contactPerson: contactPerson.trim() || '',
          contactMobile: contactMobile.trim() || '',
          machineProduct: machineProduct.trim(),
          quantity: numQty,
          requirement: requirement.trim() || `Enquiry for ${machineProduct.trim()}`,
          specification: requirement.trim(),
          expectedDelivery,
          assignedPersonId,
          assignedPersonName: assignedName,
          status: status || 'new',
        });
      }

      router.push('/crm/enquiries');
    } catch (err: any) {
      setFormError(err.message || 'Failed to save technical enquiry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in">
      {/* Back Link */}
      <div>
        <Link
          href="/crm/enquiries"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#70665F] hover:text-[#211B17] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Technical Enquiries</span>
        </Link>
      </div>

      {/* Main Form Container */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-[#EBE3DB] pb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FAF3EA] border border-[#E7DED5] flex items-center justify-center text-[#8C5229] shrink-0 mt-0.5">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#211B17] tracking-tight">
              {existingEnquiry ? `Edit Technical Enquiry (${existingEnquiry.enquiryNo || existingEnquiry.id})` : 'Register New Technical Enquiry'}
            </h1>
            <p className="text-xs text-[#70665F] mt-1 leading-relaxed">
              Capture comprehensive customer RFQ requirements, technical specifications, and delivery target.
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
          {/* Section 1: Customer & Contact Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FAF3EA] border border-[#E7DED5] text-[#8C5229] font-bold text-[11px] flex items-center justify-center">
                1
              </span>
              <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                Customer & Contact Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#8C5229]" />
                  <span>Select Customer Account or Sales Lead <span className="text-rose-500">*</span></span>
                </label>
                <select
                  required
                  value={selectedEntityVal}
                  onChange={(e) => handleEntitySelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-[#75401F] focus:ring-2 focus:ring-[#75401F]/15 transition"
                >
                  <option value="">-- Choose from Leads or Registered Customers --</option>
                  <optgroup label="📋 Active Sales Leads">
                    {leads.map((l) => (
                      <option key={`lead:${l.id}`} value={`lead:${l.id}`}>
                        [Lead] {l.leadNo ? `${l.leadNo} - ` : ''}{l.companyName} ({l.contactPerson || 'Contact'})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🏢 Existing Customers">
                    {customers.map((c) => (
                      <option key={`cust:${c.id}`} value={`cust:${c.id}`}>
                        [Customer] {c.customerCode ? `${c.customerCode} - ` : ''}{c.companyName} ({c.contactPerson || 'Account'})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Customer / Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Reliance Industries Ltd."
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium text-[#211B17] focus:outline-none focus:border-[#75401F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium text-[#211B17] focus:outline-none focus:border-[#75401F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Contact Mobile Number
                </label>
                <input
                  type="text"
                  value={contactMobile}
                  onChange={(e) => setContactMobile(e.target.value)}
                  placeholder="e.g. 9825012345"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-mono text-[#211B17] focus:outline-none focus:border-[#75401F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Contact Email Address
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. procurement@reliance.com"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium text-[#211B17] focus:outline-none focus:border-[#75401F]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Product & Technical Requirements */}
          <div className="space-y-4 pt-4 border-t border-[#EBE3DB]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FAF3EA] border border-[#E7DED5] text-[#8C5229] font-bold text-[11px] flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                Product & Technical Requirements
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#8C5229]" />
                  <span>Equipment / Product Name <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={machineProduct}
                  onChange={(e) => setMachineProduct(e.target.value)}
                  placeholder="e.g. Stainless Steel SS316 Reaction Vessel"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-[#75401F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') setQuantity('');
                    else {
                      const n = parseInt(val, 10);
                      setQuantity(isNaN(n) ? '' : n);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-mono font-bold text-[#211B17] focus:outline-none focus:border-[#75401F]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Technical Specifications & Scope Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  placeholder="Enter detailed technical specs: capacity, pressure rating, material grade, design standards, test requirements..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-[#75401F] leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Timeline & Status */}
          <div className="space-y-4 pt-4 border-t border-[#EBE3DB]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FAF3EA] border border-[#E7DED5] text-[#8C5229] font-bold text-[11px] flex items-center justify-center">
                3
              </span>
              <h2 className="text-sm font-bold text-[#211B17] tracking-wide">
                Target Date & Status
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#8C5229]" />
                  <span>Target Delivery Date</span>
                </label>
                <input
                  type="date"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-mono text-[#211B17] focus:outline-none focus:border-[#75401F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                  Enquiry Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-[#75401F]"
                >
                  <option value="new">New / Fresh Enquiry</option>
                  <option value="under_review">Under Review</option>
                  <option value="requirement_pending">Requirement Clarification Pending</option>
                  <option value="technical_review">Technical Evaluation</option>
                  <option value="quotation_ready">Quotation Ready</option>
                  <option value="quotation_sent">Quotation Dispatched</option>
                  <option value="converted">Converted to Sales Order</option>
                  <option value="closed">Closed / Dropped</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#EBE3DB]">
            <Link
              href="/crm/enquiries"
              className="px-5 py-2.5 border border-[#EBE3DB] text-[#70665F] hover:bg-[#FAF7F2] rounded-xl font-bold transition text-xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#3E2723] hover:bg-[#2C1810] text-white rounded-xl font-bold transition text-xs shadow-xs active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{existingEnquiry ? 'Save Changes' : 'Create Technical Enquiry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewEnquiryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#70665F]">Loading Enquiry Form...</div>}>
      <EnquiryFormContent />
    </Suspense>
  );
}
