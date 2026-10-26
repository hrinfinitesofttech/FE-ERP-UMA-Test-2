'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '../../../../context/ERPContext';
import { toast } from '@/context/ToastContext';
import { StatusBadge } from '../../../../components/workflow/StatusBadge';
import { formatCurrency, formatDate } from '../../../../lib/utils';
import { Lead, LeadSource, LeadStatus } from '../../../../types/crm';
import {
  ArrowLeft,
  Building,
  Phone,
  Mail,
  Calendar,
  Wrench,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle2,
  PhoneCall,
  MapPin,
  FileCheck2,
  Plus,
  Send,
  Pencil,
  Trash2,
  X,
  Save,
  ClipboardList,
} from 'lucide-react';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { customers, leads, updateLead, deleteLead, convertLeadToCustomer, convertLeadToEnquiry, enquiries, addEnquiry, followUps, addFollowUp, siteVisits, addSiteVisit, quotations, employees, availableEmployees } = useERP();

  const allEmployees =
    availableEmployees && availableEmployees.length > 0
      ? availableEmployees
      : employees && employees.length > 0
      ? employees
      : [];

  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const leadId = decodeURIComponent(String(rawId || '')).trim();

  // 1. Context search
  let lead = leads.find(
    (l) =>
      l.id?.toLowerCase() === leadId.toLowerCase() ||
      l.leadNo?.toLowerCase() === leadId.toLowerCase() ||
      String(l.id) === leadId ||
      String(l.leadNo) === leadId
  );

  // 2. Immediate localStorage fallback if context update is in-flight
  if (!lead && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('UMA_ERP_leads');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          lead = parsed.find(
            (l: any) =>
              l.id?.toLowerCase() === leadId.toLowerCase() ||
              l.leadNo?.toLowerCase() === leadId.toLowerCase() ||
              String(l.id) === leadId ||
              String(l.leadNo) === leadId
          );
        }
      }
    } catch (_) {}
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const [activeTab, setActiveTab] = useState<'timeline' | 'enquiries' | 'followups' | 'visits' | 'quotations' | 'specs'>('timeline');
  const [newNote, setNewNote] = useState('');
  const [convertSuccess, setConvertSuccess] = useState('');

  // Follow-up quick modal
  const [showFlwModal, setShowFlwModal] = useState(false);
  const [flwType, setFlwType] = useState<'call' | 'whatsapp' | 'email' | 'meeting' | 'visit'>('call');
  const [flwDate, setFlwDate] = useState(todayStr);
  const [flwTime, setFlwTime] = useState('11:00 AM');
  const [flwPurpose, setFlwPurpose] = useState('');

  // Edit Lead Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Lead>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isEditDirty, setIsEditDirty] = useState(false);

  // Delete Lead Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!lead) {
    return (
      <div className="p-8 text-center text-[#70665F] text-xs">
        <p>Lead not found ({leadId}).</p>
        <Link href="/crm/leads" className="text-crm-brand-700 font-bold underline mt-2 block">
          Return to Leads
        </Link>
      </div>
    );
  }

  const relatedEnquiries = enquiries.filter(
    (e) =>
      e.leadId === lead.id ||
      e.leadId === lead.leadNo ||
      e.id === lead.convertedEnquiryId ||
      (e.customerName && lead.companyName && lead.companyName !== 'Valued Customer' && e.customerName.toLowerCase() === lead.companyName.toLowerCase()) ||
      (lead.mobile && ((e as any).mobile || (e as any).contactMobile) && lead.mobile === ((e as any).mobile || (e as any).contactMobile))
  );
  const relatedFollowUps = followUps.filter(
    (f) =>
      f.leadOrCustomerId === lead.id ||
      f.leadOrCustomerId === lead.leadNo ||
      (lead.leadNo && f.leadOrCustomerName && f.leadOrCustomerName.includes(lead.leadNo)) ||
      (lead.companyName && lead.companyName !== 'Valued Customer' && f.leadOrCustomerName && f.leadOrCustomerName.toLowerCase().includes(lead.companyName.toLowerCase()))
  );
  const relatedVisits = siteVisits.filter(
    (v) =>
      v.customerId === lead.convertedCustomerId ||
      v.customerId === lead.id ||
      v.customerId === lead.leadNo ||
      (lead.companyName && lead.companyName !== 'Valued Customer' && v.customerName && v.customerName.toLowerCase().includes(lead.companyName.toLowerCase()))
  );
  const relatedQuotations = quotations.filter(
    (q) =>
      q.leadId === lead.id ||
      q.leadId === lead.leadNo ||
      (lead.convertedEnquiryId && q.enquiryId === lead.convertedEnquiryId) ||
      (q.customerName && lead.companyName && lead.companyName !== 'Valued Customer' && q.customerName.toLowerCase().includes(lead.companyName.toLowerCase())) ||
      (lead.mobile && (q as any).mobile && lead.mobile === (q as any).mobile)
  );

  const linkedCustomer = (customers || []).find(
    (c) =>
      c.id === lead.convertedCustomerId ||
      (c as any).linkedLeadId === lead.id ||
      (c as any).linkedLeadId === lead.leadNo ||
      (c.companyName && lead.companyName && lead.companyName !== 'Valued Customer' && c.companyName.toLowerCase() === lead.companyName.toLowerCase())
  );

  // Auto-resolve real company name & contact person from linked Quotations / Enquiries if lead has placeholder
  const resolvedCompanyName =
    lead.companyName && lead.companyName !== 'Valued Customer'
      ? lead.companyName
      : relatedQuotations[0]?.customerName || relatedEnquiries[0]?.customerName || linkedCustomer?.companyName || lead.companyName || 'Valued Customer';

  const resolvedContactPerson =
    lead.contactPerson && lead.contactPerson !== 'Contact Person' && lead.contactPerson !== 'Contact'
      ? lead.contactPerson
      : (relatedQuotations[0] as any)?.contactPerson || (relatedEnquiries[0] as any)?.contactPerson || linkedCustomer?.contactPerson || lead.contactPerson || '';

  const resolvedMobile =
    lead.mobile && lead.mobile !== '9999999999'
      ? lead.mobile
      : (lead as any).phone ||
        (lead as any).contactMobile ||
        (lead as any).contact_mobile ||
        (lead as any).contactNumber ||
        (lead as any).mobileNo ||
        (lead as any).altMobile ||
        (relatedQuotations[0] as any)?.contactMobile ||
        (relatedQuotations[0] as any)?.mobile ||
        (relatedEnquiries[0] as any)?.contactMobile ||
        (relatedEnquiries[0] as any)?.mobile ||
        linkedCustomer?.mobile ||
        '';

  const resolvedAddress =
    lead.address && lead.address.trim()
      ? lead.address
      : (lead as any).billingAddress ||
        (lead as any).billing_address ||
        (lead as any).shippingAddress ||
        (lead as any).shipping_address ||
        (relatedEnquiries[0] as any)?.address ||
        (relatedEnquiries[0] as any)?.billingAddress ||
        (relatedQuotations[0] as any)?.deliveryAddress ||
        (relatedQuotations[0] as any)?.billingAddress ||
        linkedCustomer?.billingAddress ||
        linkedCustomer?.shippingAddress ||
        [lead.city, lead.state, lead.pincode].filter(Boolean).join(', ') ||
        '';

  const resolvedEmail =
    lead.email && lead.email.trim()
      ? lead.email
      : (relatedQuotations[0] as any)?.contactEmail ||
        (relatedEnquiries[0] as any)?.customerEmail ||
        (relatedEnquiries[0] as any)?.email ||
        linkedCustomer?.email ||
        '';

  const resolvedProductName =
    lead.productName && lead.productName !== 'Process Equipment' && lead.productName !== 'Industrial Process Equipment'
      ? lead.productName
      : (relatedQuotations[0] as any)?.machineProduct || (relatedEnquiries[0] as any)?.machineProduct || (relatedQuotations[0] as any)?.items?.[0]?.description || lead.productName || '';

  const resolvedQuantity =
    lead.quantity && lead.quantity > 0
      ? lead.quantity
      : (relatedQuotations[0] as any)?.quantity || ((relatedQuotations[0] as any)?.items?.[0]?.quantity as number) || (relatedEnquiries[0] as any)?.quantity || lead.quantity || 0;

  const handleOpenEdit = () => {
    setEditFormData({
      companyName: lead.companyName && lead.companyName !== 'Valued Customer' ? lead.companyName : (resolvedCompanyName || ''),
      contactPerson: lead.contactPerson && lead.contactPerson !== 'Contact Person' && lead.contactPerson !== 'Contact' ? lead.contactPerson : (resolvedContactPerson || ''),
      mobile: resolvedMobile || lead.mobile || '',
      email: resolvedEmail || lead.email || '',
      address: resolvedAddress || lead.address || '',
      city: lead.city || '',
      state: lead.state || '',
      pincode: lead.pincode || '',
      productName: lead.productName && lead.productName !== 'Process Equipment' && lead.productName !== 'Industrial Process Equipment' ? lead.productName : (resolvedProductName || ''),
      machineType: lead.machineType || '',
      quantity: lead.quantity || resolvedQuantity || 1,
      budget: lead.budget || 0,
      expectedDelivery: lead.expectedDelivery || '',
      status: lead.status || 'new',
      priority: lead.priority || 'medium',
      source: lead.source || 'website',
      assignedSalesPersonId: lead.assignedSalesPersonId || allEmployees[0]?.id || '',
      assignedSalesPersonName: lead.assignedSalesPersonName || allEmployees[0]?.name || '',
      requirementDescription: lead.requirementDescription || '',
    });
    setEditErrors({});
    setIsEditDirty(false);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    if (isEditDirty) {
      toast.confirm({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to close without saving?',
        confirmText: 'Discard & Close',
        cancelText: 'Keep Editing',
        variant: 'warning',
        onConfirm: () => {
          setShowEditModal(false);
          setIsEditDirty(false);
        },
      });
      return;
    }
    setShowEditModal(false);
  };

  const handleEditChange = (field: string, value: any) => {
    let cleanVal = value;
    if (field === 'mobile') {
      cleanVal = String(value).replace(/\D/g, '').slice(0, 10);
    }
    setEditFormData((prev: Partial<Lead>) => ({ ...prev, [field]: cleanVal }));
    setIsEditDirty(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.companyName || !editFormData.contactPerson || !editFormData.mobile) {
      toast.warning('Required Fields Missing', 'Please fill all required fields (Company Name, Contact Person, 10-digit Mobile).');
      return;
    }

    const assignedEmp = allEmployees.find((emp) => emp.id === editFormData.assignedSalesPersonId);
    const updatePayload: Partial<Lead> = {
      companyName: editFormData.companyName?.trim(),
      contactPerson: editFormData.contactPerson?.trim(),
      mobile: editFormData.mobile?.trim(),
      email: editFormData.email?.trim(),
      address: editFormData.address?.trim(),
      city: editFormData.city?.trim() || '',
      state: editFormData.state?.trim() || '',
      pincode: editFormData.pincode?.trim() || '',
      productName: editFormData.productName?.trim() || '',
      machineType: editFormData.machineType?.trim() || '',
      quantity: Number(editFormData.quantity) || 1,
      budget: Number(editFormData.budget) || 0,
      expectedDelivery: editFormData.expectedDelivery || '',
      status: (editFormData.status as any) || 'new',
      priority: (editFormData.priority as any) || 'medium',
      source: (editFormData.source as any) || 'website',
      assignedSalesPersonId: editFormData.assignedSalesPersonId || '',
      assignedSalesPersonName: assignedEmp?.name || (assignedEmp as any)?.employeeName || editFormData.assignedSalesPersonName || lead.assignedSalesPersonName || '',
      requirementDescription: editFormData.requirementDescription?.trim() || '',
    };

    const targetId = lead.id || lead.leadNo;
    await updateLead(targetId, updatePayload);
    setConvertSuccess(`Lead "${lead.leadNo || targetId}" details updated successfully!`);
    setShowEditModal(false);
    setIsEditDirty(false);
    setTimeout(() => setConvertSuccess(''), 4000);
  };

  const handleConfirmDelete = async () => {
    const targetId = lead.id || lead.leadNo;
    await deleteLead(targetId);
    router.push('/crm/leads');
  };

  const handleConvert = () => {
    const res = convertLeadToCustomer(lead.id);
    setConvertSuccess(`Successfully converted to Customer: ${res.customer.companyName}! Redirecting to Create Quotation...`);
    setTimeout(() => {
      router.push(`/crm/quotations/new?leadId=${lead.id}&customerId=${res.customer.id}`);
    }, 1000);
  };

  const handleConvertToEnquiry = async () => {
    try {
      const enq = await convertLeadToEnquiry(lead.id);
      setConvertSuccess(`Successfully generated Technical Enquiry: ${enq.enquiryNo}!`);
      setTimeout(() => setConvertSuccess(''), 5000);
    } catch (err: any) {
      console.error('Error generating enquiry:', err);
    }
  };

  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    addFollowUp({
      leadOrCustomerId: lead.leadNo || lead.id,
      leadOrCustomerName: `${lead.companyName} (${lead.contactPerson || lead.leadNo})`,
      entityType: 'lead',
      type: flwType,
      assignedToId: lead.assignedSalesPersonId,
      assignedToName: lead.assignedSalesPersonName,
      date: flwDate,
      time: flwTime,
      priority: 'high',
      purpose: flwPurpose,
      notes: 'Scheduled from 360° Lead View',
      status: 'pending',
    });
    setFlwPurpose('');
    setShowFlwModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 text-xs pb-10">
      <Link href="/crm/leads" className="inline-flex items-center gap-1.5 text-crm-brand-700 hover:underline font-semibold">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Leads Master
      </Link>

      {/* Top 360° Profile Header */}
      <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-sm bg-crm-brand-700 text-white px-2.5 py-0.5 rounded-lg shadow-sm">
                {lead.leadNo && !lead.leadNo.includes('__') && lead.leadNo.length <= 25 ? lead.leadNo : (lead.id && !lead.id.includes('__') && lead.id.length <= 25 ? lead.id : 'LEAD-REF')}
              </span>
              <StatusBadge status={lead.status as any} />
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#FAF7F2] font-mono text-[10px] uppercase font-bold text-slate-600 dark:text-[#70665F]">
                Source: {lead.source?.replace('_', ' ')}
              </span>
              {lead.exhibitionName && (
                <Link
                  href="/crm/exhibitions"
                  className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[10px] uppercase font-bold hover:bg-amber-100 transition"
                  title="View linked Trade Show / Exhibition"
                >
                  Expo: {lead.exhibitionName}
                </Link>
              )}
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-[#211B17] mt-1">{resolvedCompanyName}</h1>
            <p className="text-[#70665F]">{resolvedProductName} • Quantity: {resolvedQuantity}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Update / Edit Button */}
            <button
              onClick={handleOpenEdit}
              className="px-3.5 py-2 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border border-[#FCD34D] rounded-xl font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
              <span>Update Lead</span>
            </button>

            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>

            <button
              onClick={() => setShowFlwModal(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#FAF7F2] text-slate-800 dark:text-[#544B45] rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-amber-500" />
              <span>Schedule Follow-up</span>
            </button>

            {!lead.convertedEnquiryId ? (
              <button
                onClick={handleConvertToEnquiry}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                title="Convert this lead into a formal Technical Enquiry (RFQ)"
              >
                <ClipboardList className="w-4 h-4" />
                <span>+ Convert to Enquiry (RFQ)</span>
              </button>
            ) : (
              <Link
                href="/crm/enquiries"
                className="px-3 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 font-bold flex items-center gap-1 text-xs"
                title="View linked Technical Enquiry"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Enquiry: {lead.convertedEnquiryId}</span>
              </Link>
            )}

            {!lead.convertedCustomerId ? (
              <button
                onClick={handleConvert}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Convert to Customer & Send Quotation</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Converted Customer ({lead.convertedCustomerId})</span>
                </span>
                <button
                  onClick={() => router.push(`/crm/quotations/new?leadId=${lead.id}&customerId=${lead.convertedCustomerId || ''}&enquiryId=${lead.convertedEnquiryId || ''}`)}
                  className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Send Quotation</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {convertSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold">
            {convertSuccess}
          </div>
        )}

        {/* Quick Contact & Requirement Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-[#EBE3DB] text-[11px]">
          <div>
            <span className="text-[#70665F] block">Contact Person</span>
            <span className="font-bold text-slate-800 dark:text-[#544B45]">{resolvedContactPerson || '-'}</span>
            <span className="text-[#70665F] block">{lead.designation}</span>
          </div>
          <div>
            <span className="text-[#70665F] block">Phone & WhatsApp</span>
            <span className="font-bold text-slate-800 dark:text-[#544B45]">{resolvedMobile || lead.mobile || '-'}</span>
            <span className="text-[#70665F] block">{resolvedEmail || lead.email || '-'}</span>
          </div>
          <div>
            <span className="text-[#70665F] block">Budget & Target Delivery</span>
            <span className="font-bold text-emerald-600">{lead.budget ? formatCurrency(lead.budget) : 'TBD'}</span>
            <span className="text-[#70665F] block">Delivery: {formatDate(lead.expectedDelivery)}</span>
          </div>
          <div>
            <span className="text-[#70665F] block">Sales Engineer</span>
            <span className="font-bold text-crm-brand-700">{lead.assignedSalesPersonName}</span>
            <span className="text-[#70665F] block">Priority: {lead.priority?.toUpperCase()}</span>
          </div>
        </div>

        {(resolvedAddress || lead.address) && (
          <div className="pt-2.5 border-t border-slate-100 dark:border-[#EBE3DB] text-[11px] flex items-center gap-1.5 text-[#544B45]">
            <MapPin className="w-3.5 h-3.5 text-[#8C5229] shrink-0" />
            <span className="font-semibold text-[#70665F]">Address:</span>
            <span>{resolvedAddress || lead.address}</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-[#EBE3DB] space-x-2 font-medium overflow-x-auto">
        {[
          { id: 'timeline', label: '360° Activity Timeline', icon: Clock },
          { id: 'enquiries', label: `Inquiries (${relatedEnquiries.length})`, icon: ClipboardList },
          { id: 'followups', label: `Follow-ups (${relatedFollowUps.length})`, icon: PhoneCall },
          { id: 'visits', label: `Site Visits (${relatedVisits.length})`, icon: MapPin },
          { id: 'quotations', label: `Quotations (${relatedQuotations.length})`, icon: FileCheck2 },
          { id: 'specs', label: 'Technical Scope & Notes', icon: Wrench },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-crm-brand-700 text-crm-brand-700 font-bold'
                  : 'border-transparent text-[#70665F] hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Body */}
      <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl p-5 shadow-sm space-y-4">
        {activeTab === 'enquiries' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Technical Inquiries (RFQs)</h3>
                <p className="text-[11px] text-[#70665F]">Formal engineering requirements and machine specifications linked to this lead.</p>
              </div>
              <button
                onClick={handleConvertToEnquiry}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer text-xs"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>+ Create Technical Inquiry</span>
              </button>
            </div>

            {relatedEnquiries.length === 0 ? (
              <div className="p-8 text-center text-[#70665F] bg-[#FAF7F2]/50 rounded-xl border border-dashed border-[#EBE3DB]">
                <p className="font-medium">No formal inquiries registered for this lead yet.</p>
                <p className="text-[11px] mt-1">Click &ldquo;+ Create Technical Inquiry&rdquo; above to generate a machine specification RFQ.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {relatedEnquiries.map((enq) => (
                  <div key={enq.id} className="p-4 bg-slate-50 dark:bg-[#FAF7F2]/60 rounded-xl border border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                          {enq.enquiryNo || enq.id}
                        </span>
                        <StatusBadge status={enq.status as any} />
                        {enq.expectedDelivery && (
                          <span className="text-[10px] text-[#70665F] font-mono">
                            Target Delivery: {formatDate(enq.expectedDelivery)}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-sm text-slate-900 dark:text-[#211B17] block">
                        {enq.machineProduct} (Qty: {enq.quantity || 1})
                      </span>
                      {enq.specification && (
                        <p className="text-[#70665F] text-[11px]">{enq.specification}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/crm/quotations/new?leadId=${lead.id}&enquiryId=${enq.id}&customerId=${lead.convertedCustomerId || ''}`}
                        className="px-3 py-1.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-xs"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Create Quotation</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Live 360° Lead Activity Trail</h3>
            <div className="relative pl-8 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-[#FAF7F2]">
              <div className="relative">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-crm-brand-700 ring-4 ring-crm-brand-" />
                <div className="bg-slate-50 dark:bg-[#FAF7F2]/60 p-3 rounded-xl border border-slate-100 dark:border-[#EBE3DB]">
                  <div className="flex items-center justify-between text-[10px] text-[#70665F] font-mono">
                    <span>{lead.createdDate}</span>
                    <span>System Event</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-[#211B17] block mt-0.5">Lead Registered in System</span>
                  <p className="text-[#70665F] text-[11px] mt-0.5">
                    Assigned to {lead.assignedSalesPersonName} from channel &ldquo;{lead.source}&rdquo;.
                  </p>
                </div>
              </div>

              {lead.convertedCustomerId && (
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 block">Converted to Customer</span>
                      <p className="text-emerald-600 text-[11px] mt-0.5">
                        Customer ID {lead.convertedCustomerId} • Ready for Quotation
                      </p>
                    </div>
                    <Link
                      href={`/crm/quotations/new?leadId=${lead.id}&customerId=${lead.convertedCustomerId}`}
                      className="px-3 py-1.5 bg-[#8B2500] hover:bg-[#701E00] text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer whitespace-nowrap"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Send Quotation</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'followups' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Scheduled Follow-ups & Call Logs</h3>
              <button
                onClick={() => setShowFlwModal(true)}
                className="px-3 py-1.5 bg-[#3E2723] hover:bg-[#2C1810] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Follow-up</span>
              </button>
            </div>
            {relatedFollowUps.length === 0 ? (
              <p className="text-[#70665F] text-center py-6">No follow-ups recorded yet.</p>
            ) : (
              relatedFollowUps.map((f) => (
                <div key={f.id} className="p-3 bg-slate-50 dark:bg-[#FAF7F2]/60 rounded-xl border flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-[#544B45] block">{f.purpose}</span>
                    <span className="text-[10px] text-[#70665F] block">Date: {f.date} at {f.time} • Type: {f.type?.toUpperCase()}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                    {f.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'quotations' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Linked Commercial Quotations</h3>
              <Link
                href={`/crm/quotations/new?customerId=${lead.convertedCustomerId || ''}&enquiryId=${lead.convertedEnquiryId || ''}&leadId=${lead.id || lead.leadNo}`}
                className="px-3 py-1.5 bg-[#3E2723] hover:bg-[#2C1810] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Quotation</span>
              </Link>
            </div>
            {relatedQuotations.length === 0 ? (
              <p className="text-[#70665F] text-center py-6">No quotations generated for this lead yet.</p>
            ) : (
              relatedQuotations.map((q) => (
                <div key={q.id} className="p-3 bg-slate-50 dark:bg-[#FAF7F2]/60 rounded-xl border flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-crm-brand-700 block">{q.quotationNumber} ({q.currentRevision})</span>
                    <span className="text-[#70665F] text-[10px]">{q.latestSummary?.machineProduct || 'Process Equipment'}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 block">{formatCurrency(q.latestSummary?.grandTotal || (q.revisions && q.revisions[q.revisions.length - 1]?.grandTotal) || 0)}</span>
                    <span className="text-[10px] uppercase font-bold text-crm-brand-700">{q.latestSummary?.status || 'draft'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Technical Scope & Customer Specifications</h3>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#FAF7F2]/60 border border-slate-100 dark:border-[#EBE3DB] text-slate-700 dark:text-[#544B45] whitespace-pre-wrap leading-relaxed">
              {lead.requirementDescription || 'No detailed scope added yet.'}
            </div>
          </div>
        )}
      </div>

      {/* Schedule Follow-up Modal */}
      {showFlwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm">
          <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl shadow-xl w-full max-w-md p-6 text-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#211B17]">Schedule Follow-up for {lead.companyName}</h3>
            <form onSubmit={handleAddFollowUp} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Follow-up Type</label>
                  <select
                    value={flwType}
                    onChange={(e) => setFlwType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  >
                    <option value="call">Phone Call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="meeting">Personal Meeting</option>
                    <option value="visit">Site Visit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={flwDate}
                    onChange={(e) => setFlwDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Time</label>
                <input
                  type="text"
                  value={flwTime}
                  onChange={(e) => setFlwTime(e.target.value)}
                  placeholder="e.g. 03:30 PM"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Purpose / Discussion Agenda *</label>
                <textarea
                  rows={3}
                  required
                  value={flwPurpose}
                  onChange={(e) => setFlwPurpose(e.target.value)}
                  placeholder="Discuss revised proposal terms..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowFlwModal(false)}
                  className="px-4 py-2 border rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold cursor-pointer"
                >
                  Schedule Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT / UPDATE LEAD MODAL */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseEditModal();
            }
          }}
        >
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#FAF3EA] to-[#F1DFC9] p-5 border-b border-[#EBE3DB] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shadow-xs">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                    <span>Update Lead: {lead.leadNo}</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-white/80 border border-[#E7DED5] text-[#75401F]">
                      {lead.companyName}
                    </span>
                  </h2>
                  <p className="text-[#70665F] text-[11px] mt-0.5">
                    Modify lead details, machine specifications, budget, or sales assignment.
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseEditModal}
                className="p-1.5 text-[#70665F] hover:text-[#211B17] hover:bg-white/60 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.companyName || ''}
                    onChange={(e) => handleEditChange('companyName', e.target.value)}
                    placeholder="e.g. Industrial Enterprises Ltd."
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-bold text-[#211B17] focus:outline-none focus:ring-2 focus:ring-[#75401F]/20 focus:border-[#75401F]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                      Person Name (Contact Person) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.contactPerson || ''}
                      onChange={(e) => handleEditChange('contactPerson', e.target.value)}
                      placeholder="e.g. Harish Trivedi"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium text-[#211B17] focus:outline-none focus:ring-2 focus:ring-[#75401F]/20 focus:border-[#75401F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                      Number (Mobile Contact) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={editFormData.mobile || ''}
                      onChange={(e) => handleEditChange('mobile', e.target.value)}
                      placeholder="9825012345"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-mono font-bold text-[#211B17] focus:outline-none focus:ring-2 focus:ring-[#75401F]/20 focus:border-[#75401F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.email || ''}
                    onChange={(e) => handleEditChange('email', e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium text-[#211B17] focus:outline-none focus:ring-2 focus:ring-[#75401F]/20 focus:border-[#75401F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3B32] mb-1.5">
                    Address <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editFormData.address || ''}
                    onChange={(e) => handleEditChange('address', e.target.value)}
                    placeholder="e.g. Plot No. 42, GIDC Industrial Estate..."
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium text-[#211B17] focus:outline-none focus:ring-2 focus:ring-[#75401F]/20 focus:border-[#75401F]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#4A3B32] mb-1">City</label>
                    <input
                      type="text"
                      value={editFormData.city || ''}
                      onChange={(e) => handleEditChange('city', e.target.value)}
                      placeholder="e.g. Vadodara"
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium text-[#211B17] focus:outline-none focus:border-[#75401F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#4A3B32] mb-1">State</label>
                    <input
                      type="text"
                      value={editFormData.state || ''}
                      onChange={(e) => handleEditChange('state', e.target.value)}
                      placeholder="e.g. Gujarat"
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium text-[#211B17] focus:outline-none focus:border-[#75401F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#4A3B32] mb-1">Pincode</label>
                    <input
                      type="text"
                      value={editFormData.pincode || ''}
                      onChange={(e) => handleEditChange('pincode', e.target.value)}
                      placeholder="e.g. 390010"
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium text-[#211B17] focus:outline-none focus:border-[#75401F]"
                    />
                  </div>
                </div>

                <div className="border-t border-[#EBE3DB] pt-3">
                  <h4 className="text-xs font-bold text-[#8C5229] mb-2 uppercase tracking-wide">Product & Requirement Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-bold text-[#4A3B32] mb-1">Product Name</label>
                      <input
                        type="text"
                        value={editFormData.productName || ''}
                        onChange={(e) => handleEditChange('productName', e.target.value)}
                        placeholder="e.g. Rotary Vacuum Paddle Dryer"
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium text-[#211B17] focus:outline-none focus:border-[#75401F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4A3B32] mb-1">Machine Type</label>
                      <input
                        type="text"
                        value={editFormData.machineType || ''}
                        onChange={(e) => handleEditChange('machineType', e.target.value)}
                        placeholder="e.g. Chemical Process Equipment"
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium text-[#211B17] focus:outline-none focus:border-[#75401F]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-bold text-[#4A3B32] mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={editFormData.quantity !== undefined ? editFormData.quantity : 1}
                        onChange={(e) => handleEditChange('quantity', e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium text-[#211B17] focus:outline-none focus:border-[#75401F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4A3B32] mb-1">Budget (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={editFormData.budget !== undefined ? editFormData.budget : 0}
                        onChange={(e) => handleEditChange('budget', e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium text-[#211B17] focus:outline-none focus:border-[#75401F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4A3B32] mb-1">Expected Delivery</label>
                      <input
                        type="date"
                        value={editFormData.expectedDelivery || ''}
                        onChange={(e) => handleEditChange('expectedDelivery', e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium text-[#211B17] focus:outline-none focus:border-[#75401F]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-bold text-[#4A3B32] mb-1">Status</label>
                      <select
                        value={editFormData.status || 'new'}
                        onChange={(e) => handleEditChange('status', e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-[#75401F]"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="requirement_received">Requirement Received</option>
                        <option value="quotation_pending">Quotation Pending</option>
                        <option value="quotation_sent">Quotation Sent</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                        <option value="on_hold">On Hold</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4A3B32] mb-1">Priority</label>
                      <select
                        value={editFormData.priority || 'medium'}
                        onChange={(e) => handleEditChange('priority', e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-[#75401F]"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4A3B32] mb-1">Assigned Sales Engineer</label>
                      <select
                        value={editFormData.assignedSalesPersonId || ''}
                        onChange={(e) => handleEditChange('assignedSalesPersonId', e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium text-[#211B17] focus:outline-none focus:border-[#75401F]"
                      >
                        <option value="">Select Sales Engineer</option>
                        {allEmployees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name || (emp as any).employeeName || emp.id}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A3B32] mb-1">Requirement Description / Notes</label>
                    <textarea
                      rows={2}
                      value={editFormData.requirementDescription || ''}
                      onChange={(e) => handleEditChange('requirementDescription', e.target.value)}
                      placeholder="Specifications, client requirements or notes..."
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium text-[#211B17] focus:outline-none focus:border-[#75401F]"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-[#EBE3DB] rounded-xl hover:bg-slate-100 font-semibold text-[#544B45] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#75401F] hover:bg-[#5C3218] text-white rounded-xl font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Update & Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteModal(false);
          }}
        >
          <div className="bg-white border border-rose-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#211B17]">Delete CRM Lead?</h3>
              <p className="text-[#70665F] text-xs">
                Are you sure you want to permanently delete lead{' '}
                <span className="font-mono font-bold text-rose-600">{lead.leadNo}</span> (
                <span className="font-bold text-[#211B17]">{lead.companyName}</span>)?
              </p>
              <p className="text-[11px] text-[#8D827A] pt-1">
                Requirement: {lead.productName} • This will permanently remove the lead and redirect to Leads list.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 border border-[#EBE3DB] rounded-xl hover:bg-slate-100 font-semibold text-[#544B45] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
