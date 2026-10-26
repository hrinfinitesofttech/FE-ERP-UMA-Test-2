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
    quotations,
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

  // Load enquiry if editing with complete data healing from linked quotations/leads/customers
  useEffect(() => {
    if (editId) {
      const enq = enquiries.find((e) => e.id === editId || e.enquiryNo === editId);
      if (enq) {
        setExistingEnquiry(enq);

        // Cross-resolve from linked Quotation, Lead, or Customer if dummy or empty
        const q = (quotations || []).find(
          (item) => item.enquiryId === enq.id || item.enquiryId === enq.enquiryNo || (enq.quotationId && item.id === enq.quotationId)
        );
        const targetLeadId = enq.leadId || q?.leadId;
        const l = (leads || []).find((item) => item.id === targetLeadId || item.leadNo === targetLeadId);
        const c = (customers || []).find((item) => item.id === enq.customerId || item.customerCode === enq.customerId);

        let cName = enq.customerName;
        if (!cName || cName === 'Valued Customer') {
          cName = q?.customerName || l?.companyName || c?.companyName || '';
        }
        setCustomerName(cName);

        let cPerson = enq.contactPerson;
        if (!cPerson || cPerson === 'N/A' || cPerson === 'Contact Person' || cPerson === 'Contact') {
          cPerson = q?.contactPerson || l?.contactPerson || c?.contactPerson || '';
        }
        setContactPerson(cPerson);

        let cMobile = enq.contactMobile;
        if (!cMobile || cMobile === '9999999999') {
          cMobile = q?.contactMobile || l?.mobile || c?.mobile || '';
        }
        setContactMobile(cMobile);

        let cEmail = enq.customerEmail;
        if (!cEmail) {
          cEmail = q?.contactEmail || l?.email || c?.email || '';
        }
        setCustomerEmail(cEmail);

        let mProd = enq.machineProduct;
        if (!mProd || mProd === 'Process Equipment') {
          mProd = (q as any)?.machineProduct || q?.latestSummary?.machineProduct || l?.productName || '';
        }
        setMachineProduct(mProd);

        setQuantity(enq.quantity || 1);

        // Technical requirement / specification
        let req = enq.requirement || '';
        let spec = enq.specification || '';
        if ((req === 'Customer Requirement' || !req) && spec && spec !== 'Customer Requirement') {
          req = spec;
        } else if ((!spec || spec === 'Customer Requirement') && req && req !== 'Customer Requirement') {
          spec = req;
        }
        setRequirement(req || spec || '');

        // Expected delivery date formatted YYYY-MM-DD
        if (enq.expectedDelivery) {
          const dStr = String(enq.expectedDelivery).slice(0, 10);
          setExpectedDelivery(dStr);
        } else {
          setExpectedDelivery('');
        }

        setAssignedPersonId(enq.assignedPersonId || allStaff[0]?.id || 'EMP-001');
        setStatus(enq.status || 'new');

        if (targetLeadId) {
          setSelectedLeadId(targetLeadId);
          setSelectedEntityVal(`lead:${targetLeadId}`);
        } else if (enq.customerId) {
          setSelectedEntityVal(`cust:${enq.customerId}`);
        }
      }
    }
  }, [editId, enquiries, quotations, leads, customers]);

  // Filter leads: show all relevant leads
  const availableLeads = useMemo(() => {
    return leads || [];
  }, [leads]);

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
      return;
    }

    if (val.startsWith('lead:')) {
      const id = val.replace('lead:', '');
      const lead = leads.find((l) => l.id === id || l.leadNo === id);
      if (lead) {
        setSelectedLeadId(lead.id);
        setSelectedEntityVal(`lead:${lead.id}`);
        if (lead.companyName && lead.companyName !== 'Valued Customer') {
          setCustomerName(lead.companyName);
        }
        if (lead.email) {
          setCustomerEmail(lead.email);
        }
        if (lead.contactPerson && lead.contactPerson !== 'Contact Person' && lead.contactPerson !== 'Contact') {
          setContactPerson(lead.contactPerson);
        }
        if (lead.mobile && lead.mobile !== '9999999999') {
          setContactMobile(lead.mobile);
        }

        const rawProd = (lead.productName || lead.machineType || '').trim();
        const isDummy =
          !rawProd ||
          rawProd === 'Industrial Process Equipment' ||
          rawProd === 'Equipment' ||
          rawProd === 'Process Equipment';

        if (!isDummy) {
          setMachineProduct(rawProd);
        }

        if (lead.quantity && Number(lead.quantity) > 0) {
          setQuantity(Number(lead.quantity));
        }

        if (lead.requirementDescription) {
          setRequirement(lead.requirementDescription);
        }
      } else {
        setSelectedLeadId(id);
      }
    } else if (val.startsWith('cust:')) {
      const id = val.replace('cust:', '');
      setSelectedLeadId('');
      const cust = customers.find((c) => c.id === id || c.customerCode === id);
      if (cust) {
        if (cust.companyName) setCustomerName(cust.companyName);
        if (cust.email) setCustomerEmail(cust.email);
        if (cust.contactPerson && cust.contactPerson !== 'Contact Person' && cust.contactPerson !== 'Contact') {
          setContactPerson(cust.contactPerson);
        }
        if (cust.mobile && cust.mobile !== '9999999999') {
          setContactMobile(cust.mobile);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('Customer / Account Name is required.');
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
          customerEmail: customerEmail.trim(),
          contactPerson: contactPerson.trim(),
          contactMobile: contactMobile.trim(),
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
          customerEmail: customerEmail.trim(),
          contactPerson: contactPerson.trim(),
          contactMobile: contactMobile.trim(),
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Customer & Contact Information */}
          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-purple-700" />
                <span>Customer & Contact Information</span>
              </span>
              <span className="text-[10px] text-slate-400">All fields fully editable</span>
            </div>

            {/* Quick Auto-fill from Leads or Registered Customers */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Auto-fill from Sales Lead or Customer (Optional)
              </label>
              <select
                value={selectedEntityVal}
                onChange={(e) => handleEntitySelect(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15 transition"
              >
                <option value="">-- Select from Leads or Customers to Auto-fill --</option>
                <optgroup label="Sales Leads">
                  {availableLeads.map((l) => (
                    <option key={`lead:${l.id}`} value={`lead:${l.id}`}>
                      [Lead] {l.leadNo ? `${l.leadNo} - ` : ''}{l.companyName} ({l.contactPerson || 'Contact'})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Registered Customers">
                  {customers.map((c) => (
                    <option key={`cust:${c.id}`} value={`cust:${c.id}`}>
                      [Customer] {c.customerCode ? `${c.customerCode} - ` : ''}{c.companyName} ({c.contactPerson || 'Account'})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Explicit Editable Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Customer / Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Nirghos Chemicals Pvt Ltd"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Ramesh Shah"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Mobile / Phone Number
                </label>
                <input
                  type="text"
                  value={contactMobile}
                  onChange={(e) => setContactMobile(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. ramesh@nirghos.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Product & Scope Details */}
          <div className="p-4 bg-purple-50/40 border border-purple-200/70 rounded-xl space-y-4">
            <div className="border-b border-purple-200/60 pb-2.5">
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-700" />
                <span>Equipment & Technical Scope</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Equipment / Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={machineProduct}
                  onChange={(e) => setMachineProduct(e.target.value)}
                  placeholder="e.g. Belt Conveyor System / Storage Tank"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
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
                  placeholder="e.g. 1"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600"
                >
                  <option value="new">New / Fresh</option>
                  <option value="under_review">Under Review</option>
                  <option value="technical_review">Technical Review</option>
                  <option value="quotation_ready">Quotation Ready</option>
                  <option value="quotation_sent">Quotation Sent</option>
                  <option value="converted">Converted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Technical Specifications & Scope Description */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Technical Specifications & Scope Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={6}
                required
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder="Enter comprehensive technical specifications, belt width, thickness, capacity, operating speed, material grade, design standards, testing criteria..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-600 leading-relaxed"
              />
            </div>

            {/* Target Delivery Date & Assigned Engineer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-700" />
                  <span>Target Delivery Date</span>
                </label>
                <input
                  type="date"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-purple-700" />
                  <span>Assigned Sales / Technical Engineer</span>
                </label>
                <select
                  value={assignedPersonId}
                  onChange={(e) => setAssignedPersonId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600"
                >
                  {allStaff.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name || `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || staff.id} ({staff.designation || staff.role || 'Sales'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
