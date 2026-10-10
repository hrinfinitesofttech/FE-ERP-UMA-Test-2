'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '../../../../context/ERPContext';
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
} from 'lucide-react';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { leads, updateLead, deleteLead, convertLeadToCustomer, followUps, addFollowUp, siteVisits, addSiteVisit, quotations, employees, availableEmployees } = useERP();

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
  const [activeTab, setActiveTab] = useState<'timeline' | 'followups' | 'visits' | 'quotations' | 'specs'>('timeline');
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

  const handleOpenEdit = () => {
    setEditFormData({
      companyName: lead.companyName || '',
      industry: lead.industry || 'Speciality Chemicals',
      gstin: lead.gstin || '',
      website: lead.website || '',
      city: lead.city || 'Vadodara',
      state: lead.state || 'Gujarat',
      address: lead.address || '',
      contactPerson: lead.contactPerson || '',
      designation: lead.designation || 'Project Lead',
      mobile: lead.mobile || '',
      altMobile: lead.altMobile || '',
      email: lead.email || '',
      whatsapp: lead.whatsapp || '',
      productName: lead.productName || '',
      machineType: lead.machineType || 'Chemical Pressure Vessel / Reactor',
      quantity: lead.quantity || 1,
      capacity: lead.capacity || '',
      application: lead.application || '',
      requirementDescription: lead.requirementDescription || '',
      expectedDelivery: lead.expectedDelivery || '',
      budget: lead.budget ?? '',
      priority: lead.priority || 'high',
      source: lead.source || 'exhibition',
      assignedSalesPersonId: lead.assignedSalesPersonId || '',
      assignedSalesPersonName: lead.assignedSalesPersonName || '',
      status: lead.status || 'new',
      nextFollowUpDate: lead.nextFollowUpDate || '',
      remarks: lead.remarks || '',
    });
    setEditErrors({});
    setIsEditDirty(false);
    setShowEditModal(true);
  };

  const handleEditChange = (field: string, value: any) => {
    let cleanVal = value;
    if (field === 'mobile' || field === 'whatsapp' || field === 'altMobile') {
      cleanVal = String(value).replace(/\D/g, '').slice(0, 10);
    }
    if (field === 'gstin') {
      cleanVal = String(value).toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
    }
    setEditFormData((prev: Partial<Lead>) => ({ ...prev, [field]: cleanVal }));
    setIsEditDirty(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.companyName || !editFormData.contactPerson || !editFormData.mobile || !editFormData.productName) {
      alert('Please fill all required fields (Company, Contact Person, 10-digit Mobile, Product Title).');
      return;
    }

    const assignedPerson = allEmployees.find((emp) => emp.id === editFormData.assignedSalesPersonId);
    const assignedName = assignedPerson
      ? assignedPerson.name ||
        (assignedPerson as any).employeeName ||
        `${assignedPerson.firstName || ''} ${assignedPerson.lastName || ''}`.trim() ||
        editFormData.assignedSalesPersonName ||
        'Pravin Patel'
      : editFormData.assignedSalesPersonName || 'Pravin Patel';

    const updatePayload: Partial<Lead> = {
      ...editFormData,
      companyName: editFormData.companyName?.trim(),
      contactPerson: editFormData.contactPerson?.trim(),
      mobile: editFormData.mobile?.trim(),
      email: editFormData.email?.trim(),
      productName: editFormData.productName?.trim(),
      quantity: Number(editFormData.quantity) || 1,
      budget: Number(editFormData.budget) || 0,
      assignedSalesPersonName: assignedName,
    };

    updateLead(lead.id, updatePayload);
    setConvertSuccess(`Lead "${lead.leadNo}" details updated successfully!`);
    setShowEditModal(false);
    setIsEditDirty(false);
    setTimeout(() => setConvertSuccess(''), 4000);
  };

  const handleConfirmDelete = () => {
    deleteLead(lead.id);
    router.push('/crm/leads');
  };

  const handleConvert = () => {
    const res = convertLeadToCustomer(lead.id);
    setConvertSuccess(`Successfully converted to Customer: ${res.customer.companyName}! Redirecting to Create Quotation...`);
    setTimeout(() => {
      router.push(`/crm/quotations/new?leadId=${lead.id}&customerId=${res.customer.id}`);
    }, 1000);
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

  const relatedFollowUps = followUps.filter(
    (f) =>
      f.leadOrCustomerId === lead.id ||
      f.leadOrCustomerId === lead.leadNo ||
      (lead.leadNo && f.leadOrCustomerName && f.leadOrCustomerName.includes(lead.leadNo)) ||
      (lead.companyName && f.leadOrCustomerName && f.leadOrCustomerName.toLowerCase().includes(lead.companyName.toLowerCase()))
  );
  const relatedVisits = siteVisits.filter(
    (v) =>
      v.customerId === lead.convertedCustomerId ||
      v.customerId === lead.id ||
      v.customerId === lead.leadNo ||
      (lead.companyName && v.customerName && v.customerName.toLowerCase().includes(lead.companyName.toLowerCase()))
  );
  const relatedQuotations = quotations.filter(
    (q) =>
      q.leadId === lead.id ||
      q.leadId === lead.leadNo ||
      (q.customerName && lead.companyName && q.customerName.toLowerCase().includes(lead.companyName.toLowerCase()))
  );

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
                {lead.leadNo}
              </span>
              <StatusBadge status={lead.status as any} />
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#FAF7F2] font-mono text-[10px] uppercase font-bold text-slate-600 dark:text-[#70665F]">
                Source: {lead.source?.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-[#211B17] mt-1">{lead.companyName}</h1>
            <p className="text-[#70665F]">{lead.productName} • Quantity: {lead.quantity}</p>
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

            {!lead.convertedCustomerId ? (
              <button
                onClick={handleConvert}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Convert to Customer & Enquiry</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Converted Customer ({lead.convertedCustomerId})</span>
              </span>
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
            <span className="font-bold text-slate-800 dark:text-[#544B45]">{lead.contactPerson}</span>
            <span className="text-[#70665F] block">{lead.designation}</span>
          </div>
          <div>
            <span className="text-[#70665F] block">Phone & WhatsApp</span>
            <span className="font-bold text-slate-800 dark:text-[#544B45]">{lead.mobile}</span>
            <span className="text-[#70665F] block">{lead.email}</span>
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
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-[#EBE3DB] space-x-2 font-medium">
        {[
          { id: 'timeline', label: '360° Activity Timeline', icon: Clock },
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
              className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 transition ${
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
              if (isEditDirty && !window.confirm('You have unsaved changes. Are you sure you want to close?')) return;
              setShowEditModal(false);
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
                onClick={() => {
                  if (isEditDirty && !window.confirm('You have unsaved changes. Are you sure you want to close?')) return;
                  setShowEditModal(false);
                }}
                className="p-1.5 text-[#70665F] hover:text-[#211B17] hover:bg-white/60 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* SECTION 1: Company Details */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs text-[#75401F] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-4.5 h-4.5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-bold">1</span>
                  Company & Enterprise Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-6">
                    <label className="block text-[#544B45] font-semibold mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.companyName || ''}
                      onChange={(e) => handleEditChange('companyName', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] font-bold"
                    />
                  </div>
                  <div className="md:col-span-6">
                    <label className="block text-[#544B45] font-semibold mb-1">Industry Sector</label>
                    <input
                      type="text"
                      value={editFormData.industry || ''}
                      onChange={(e) => handleEditChange('industry', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[#544B45] font-semibold mb-1">GSTIN (15 Digits)</label>
                    <input
                      type="text"
                      maxLength={15}
                      value={editFormData.gstin || ''}
                      onChange={(e) => handleEditChange('gstin', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg font-mono uppercase text-[#211B17]"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[#544B45] font-semibold mb-1">Website URL</label>
                    <input
                      type="url"
                      value={editFormData.website || ''}
                      onChange={(e) => handleEditChange('website', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[#544B45] font-semibold mb-1">City & State</label>
                    <input
                      type="text"
                      value={editFormData.city || ''}
                      onChange={(e) => handleEditChange('city', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Contact Information */}
              <div className="space-y-3 pt-3 border-t border-[#EBE3DB]">
                <h3 className="font-bold text-xs text-[#75401F] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-4.5 h-4.5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-bold">2</span>
                  Contact Person Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-4">
                    <label className="block text-[#544B45] font-semibold mb-1">Contact Person Name *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.contactPerson || ''}
                      onChange={(e) => handleEditChange('contactPerson', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] font-semibold"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[#544B45] font-semibold mb-1">Designation</label>
                    <input
                      type="text"
                      value={editFormData.designation || ''}
                      onChange={(e) => handleEditChange('designation', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[#544B45] font-semibold mb-1">Mobile Contact (10 digits) *</label>
                    <input
                      type="text"
                      maxLength={10}
                      required
                      value={editFormData.mobile || ''}
                      onChange={(e) => handleEditChange('mobile', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg font-mono text-[#211B17]"
                    />
                  </div>
                  <div className="md:col-span-6">
                    <label className="block text-[#544B45] font-semibold mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={editFormData.email || ''}
                      onChange={(e) => handleEditChange('email', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                    />
                  </div>
                  <div className="md:col-span-6">
                    <label className="block text-[#544B45] font-semibold mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={editFormData.whatsapp || ''}
                      onChange={(e) => handleEditChange('whatsapp', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg font-mono text-[#211B17]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Technical Requirement */}
              <div className="space-y-3 pt-3 border-t border-[#EBE3DB]">
                <h3 className="font-bold text-xs text-[#75401F] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-4.5 h-4.5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-bold">3</span>
                  Machine & Equipment Technical Requirement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-8">
                    <label className="block text-[#544B45] font-semibold mb-1">Product / Machine Title *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.productName || ''}
                      onChange={(e) => handleEditChange('productName', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] font-bold"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[#544B45] font-semibold mb-1">Quantity *</label>
                    <input
                      type="number"
                      min={1}
                      value={editFormData.quantity ?? 1}
                      onChange={(e) => handleEditChange('quantity', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg font-mono text-[#211B17]"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[#544B45] font-semibold mb-1">Capacity / Dimensions</label>
                    <input
                      type="text"
                      value={editFormData.capacity || ''}
                      onChange={(e) => handleEditChange('capacity', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[#544B45] font-semibold mb-1">Target Delivery Date</label>
                    <input
                      type="date"
                      value={editFormData.expectedDelivery || ''}
                      onChange={(e) => handleEditChange('expectedDelivery', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg font-mono text-[#211B17]"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[#544B45] font-semibold mb-1">Estimated Budget (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={editFormData.budget ?? ''}
                      onChange={(e) => handleEditChange('budget', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg font-bold text-emerald-600"
                    />
                  </div>
                  <div className="md:col-span-12">
                    <label className="block text-[#544B45] font-semibold mb-1">Technical Scope & Description</label>
                    <textarea
                      rows={2}
                      value={editFormData.requirementDescription || ''}
                      onChange={(e) => handleEditChange('requirementDescription', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Status & Assignment */}
              <div className="space-y-3 pt-3 border-t border-[#EBE3DB]">
                <h3 className="font-bold text-xs text-[#75401F] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-4.5 h-4.5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-bold">4</span>
                  Sales Assignment & Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-3">
                    <label className="block text-[#544B45] font-semibold mb-1">Lead Source</label>
                    <select
                      value={editFormData.source || 'exhibition'}
                      onChange={(e) => handleEditChange('source', e.target.value as LeadSource)}
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

                  <div className="md:col-span-3">
                    <label className="block text-[#544B45] font-semibold mb-1">Assigned Sales Engineer</label>
                    <select
                      value={editFormData.assignedSalesPersonId || ''}
                      onChange={(e) => handleEditChange('assignedSalesPersonId', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                    >
                      {allEmployees.map((emp) => {
                        const name =
                          emp.name ||
                          (emp as any).employeeName ||
                          `${emp.firstName || ''} ${emp.lastName || ''}`.trim() ||
                          emp.id;
                        return (
                          <option key={emp.id} value={emp.id}>
                            {name}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[#544B45] font-semibold mb-1">Lead Status</label>
                    <select
                      value={editFormData.status || 'new'}
                      onChange={(e) => handleEditChange('status', e.target.value as LeadStatus)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] font-bold"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="requirement_received">Requirement Received</option>
                      <option value="quotation_sent">Quotation Sent</option>
                      <option value="won">Won Orders</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[#544B45] font-semibold mb-1">Next Follow-up Date</label>
                    <input
                      type="date"
                      value={editFormData.nextFollowUpDate || ''}
                      onChange={(e) => handleEditChange('nextFollowUpDate', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg font-mono text-[#211B17]"
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
