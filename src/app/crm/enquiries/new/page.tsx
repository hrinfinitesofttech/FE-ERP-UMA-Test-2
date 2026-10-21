'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
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
  const [quantity, setQuantity] = useState<number | ''>('');
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

        // Find linked lead by leadId, convertedEnquiryId, or company name
        let linkedLead = enq.leadId ? leads.find((l) => l.id === enq.leadId || l.leadNo === enq.leadId) : null;
        if (!linkedLead) {
          linkedLead = leads.find((l) => l.convertedEnquiryId === enq.id || l.convertedEnquiryId === enq.enquiryNo) || null;
        }
        if (!linkedLead && enq.customerName && enq.customerName !== 'Valued Customer') {
          linkedLead = leads.find((l) => l.companyName && l.companyName.toLowerCase() === enq.customerName.toLowerCase()) || null;
        }

        // Find linked customer
        const linkedCust = enq.customerId
          ? customers.find((c) => c.id === enq.customerId || c.customerCode === enq.customerId)
          : customers.find((c) => enq.customerName && c.companyName && c.companyName.toLowerCase() === enq.customerName.toLowerCase());

        const effectiveLeadId = enq.leadId || linkedLead?.id || '';
        const effectiveCustId = enq.customerId || linkedCust?.id || '';

        if (effectiveLeadId) {
          setSelectedLeadId(effectiveLeadId);
          setSelectedEntityVal(`lead:${effectiveLeadId}`);
        } else if (effectiveCustId) {
          setSelectedEntityVal(`cust:${effectiveCustId}`);
        }

        const resolvedCustomerName =
          (enq.customerName && enq.customerName !== 'Valued Customer' ? enq.customerName : '') ||
          linkedLead?.companyName ||
          linkedCust?.companyName ||
          enq.customerName ||
          '';

        setCustomerName(resolvedCustomerName);
        setCustomerEmail(enq.customerEmail || linkedLead?.email || linkedCust?.email || '');
        setContactPerson(
          enq.contactPerson ||
          (linkedLead?.contactPerson && linkedLead.contactPerson !== 'Contact Person' && linkedLead.contactPerson !== 'Contact' ? linkedLead.contactPerson : '') ||
          linkedCust?.contactPerson ||
          ''
        );
        setContactMobile(
          enq.contactMobile ||
          (linkedLead?.mobile && linkedLead.mobile !== '9999999999' ? linkedLead.mobile : '') ||
          linkedCust?.mobile ||
          ''
        );

        // Resolved product name
        const resolvedProd =
          (enq.machineProduct && enq.machineProduct !== 'Process Equipment' ? enq.machineProduct : '') ||
          (linkedLead?.productName && linkedLead.productName !== 'Process Equipment' ? linkedLead.productName : '') ||
          enq.machineProduct ||
          linkedLead?.productName ||
          '';
        setMachineProduct(resolvedProd);
        setQuantity(enq.quantity || linkedLead?.quantity || 1);

        // Resolved requirements and specs
        const resolvedReq =
          (enq.specification && enq.specification !== 'Customer Requirement' ? enq.specification : '') ||
          (enq.requirement && enq.requirement !== 'Customer Requirement' ? enq.requirement : '') ||
          linkedLead?.requirementDescription ||
          enq.specification ||
          enq.requirement ||
          '';
        setRequirement(resolvedReq);

        setExpectedDelivery(enq.expectedDelivery || linkedLead?.expectedDelivery || '');
        setAssignedPersonId(enq.assignedPersonId || linkedLead?.assignedSalesPersonId || allStaff[0]?.id || 'EMP-001');
        setStatus(enq.status || 'new');
      }
    }
  }, [editId, enquiries, leads, customers]);

  // Filter leads: ONLY show leads whose Enquiry has NOT been created yet (or is currently being edited)
  const availableLeads = useMemo(() => {
    const leadsWithEnquiry = new Set<string>();
    (enquiries || []).forEach((e) => {
      if (e.leadId) {
        // If editing this existing enquiry, keep its linked lead available
        if (existingEnquiry && (e.id === existingEnquiry.id || e.enquiryNo === existingEnquiry.enquiryNo)) {
          return;
        }
        leadsWithEnquiry.add(String(e.leadId).trim());
      }
    });

    return (leads || []).filter((l) => {
      const id = String(l.id || '').trim();
      const no = String(l.leadNo || '').trim();

      // Keep currently selected lead visible in dropdown ALWAYS
      if (selectedLeadId && (id === selectedLeadId || no === selectedLeadId)) {
        return true;
      }
      // If editing an existing enquiry that is linked to this lead, keep it visible
      if (
        existingEnquiry &&
        (l.convertedEnquiryId === existingEnquiry.id ||
          l.convertedEnquiryId === existingEnquiry.enquiryNo ||
          l.id === existingEnquiry.leadId ||
          l.leadNo === existingEnquiry.leadId)
      ) {
        return true;
      }

      const hasEnquiry = (id && leadsWithEnquiry.has(id)) || (no && leadsWithEnquiry.has(no)) || Boolean(l.convertedEnquiryId);
      return !hasEnquiry;
    });
  }, [leads, enquiries, existingEnquiry, selectedLeadId]);

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
      if (!existingEnquiry) {
        setMachineProduct('');
        setQuantity('');
      }
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

        // Only pre-fill product if user genuinely entered a real custom product
        const rawProd = (lead.productName || lead.machineType || '').trim();
        const isDummy =
          !rawProd ||
          rawProd === 'Industrial Process Equipment' ||
          rawProd === 'Equipment' ||
          rawProd === 'Process Equipment';

        if (!isDummy) {
          setMachineProduct(rawProd);
        } else if (!existingEnquiry) {
          setMachineProduct('');
        }

        // Only pre-fill quantity if specified (> 0)
        if (lead.quantity && Number(lead.quantity) > 0) {
          setQuantity(Number(lead.quantity));
        } else if (!existingEnquiry) {
          setQuantity('');
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Lead / Customer Selection Dropdown */}
          <div>
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
              <optgroup label="Active Sales Leads (Pending Technical Enquiry)">
                {availableLeads.length === 0 ? (
                  <option disabled value="">(No pending leads - all leads have enquiries)</option>
                ) : (
                  availableLeads.map((l) => (
                    <option key={`lead:${l.id}`} value={`lead:${l.id}`}>
                      [Lead] {l.leadNo ? `${l.leadNo} - ` : ''}{l.companyName} ({l.contactPerson || 'Contact'})
                    </option>
                  ))
                )}
              </optgroup>
              <optgroup label="Existing Customers">
                {customers.map((c) => (
                  <option key={`cust:${c.id}`} value={`cust:${c.id}`}>
                    [Customer] {c.customerCode ? `${c.customerCode} - ` : ''}{c.companyName} ({c.contactPerson || 'Account'})
                  </option>
                ))}
              </optgroup>
              {selectedEntityVal.startsWith('lead:') && !availableLeads.some((l) => `lead:${l.id}` === selectedEntityVal || `lead:${l.leadNo}` === selectedEntityVal) && (
                <option value={selectedEntityVal}>
                  [Lead] {customerName || selectedEntityVal.replace('lead:', '')}
                </option>
              )}
              {selectedEntityVal.startsWith('cust:') && !customers.some((c) => `cust:${c.id}` === selectedEntityVal || `cust:${c.customerCode}` === selectedEntityVal) && (
                <option value={selectedEntityVal}>
                  [Customer] {customerName || selectedEntityVal.replace('cust:', '')}
                </option>
              )}
            </select>

            {/* Selected Lead / Customer Summary Chip */}
            {customerName && (
              <div className="mt-2 p-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#211B17]">{customerName}</span>
                  {contactPerson && (
                    <span className="text-[11px] text-[#70665F]">({contactPerson})</span>
                  )}
                </div>
                {contactMobile && (
                  <span className="text-[11px] font-mono text-[#8C5229] font-semibold">{contactMobile}</span>
                )}
              </div>
            )}
          </div>

          {/* 2. Equipment / Product Name & Quantity */}
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
                placeholder="Enter quantity"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-mono font-bold text-[#211B17] focus:outline-none focus:border-[#75401F]"
              />
            </div>
          </div>

          {/* 3. Technical Specifications & Scope Description */}
          <div>
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

          {/* 4. Target Delivery Date */}
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

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBE3DB]">
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
