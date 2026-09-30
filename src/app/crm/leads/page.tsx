'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { DataTable, Column } from '../../../components/data/DataTable';
import { StatusBadge } from '../../../components/workflow/StatusBadge';
import { Lead, LeadSource, LeadStatus, PriorityLevel } from '../../../types/crm';
import { formatCurrency, formatDate } from '../../../lib/utils';
import {
  UserPlus,
  ArrowUpRight,
  Filter,
  Phone,
  Mail,
  Building,
  Calendar,
  Sparkles,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';

export default function LeadsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { leads, updateLead, deleteLead, convertLeadToCustomer, employees, availableEmployees } = useERP();

  const allEmployees =
    availableEmployees && availableEmployees.length > 0
      ? availableEmployees
      : employees && employees.length > 0
      ? employees
      : [];

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [successMsg, setSuccessMsg] = useState('');

  // Editing state
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Lead>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editTouched, setEditTouched] = useState<Record<string, boolean>>({});
  const [isEditDirty, setIsEditDirty] = useState(false);

  // Deleting state
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);

  // Today date
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const createdLead = searchParams?.get('created');
    if (createdLead) {
      setSuccessMsg(`Lead "${decodeURIComponent(createdLead)}" registered successfully!`);
      const timer = setTimeout(() => setSuccessMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const filteredLeads = leads.filter((lead) => {
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
    if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false;
    return true;
  });

  const handleConvert = (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = convertLeadToCustomer(leadId);
    setSuccessMsg(`Converted to Customer "${res.customer.companyName}" & Enquiry "${res.enquiry?.enquiryNo}"`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead);
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
    setEditTouched({});
    setIsEditDirty(false);
  };

  const handleEditChange = (field: string, value: any) => {
    let cleanVal = value;
    if (field === 'mobile' || field === 'whatsapp' || field === 'altMobile') {
      cleanVal = String(value).replace(/\D/g, '').slice(0, 10);
    }
    if (field === 'gstin') {
      cleanVal = String(value).toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
    }

    setEditFormData((prev) => ({ ...prev, [field]: cleanVal }));
    setIsEditDirty(true);

    if (editTouched[field]) {
      validateEditField(field, cleanVal);
    }
  };

  const validateEditField = (field: string, value: any) => {
    let err = '';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    switch (field) {
      case 'companyName':
        if (!value || String(value).trim().length < 2) err = 'Company name is required.';
        break;
      case 'contactPerson':
        if (!value || String(value).trim().length < 2) err = 'Contact person name is required.';
        break;
      case 'mobile':
        if (!value || String(value).replace(/\D/g, '').length !== 10) err = 'Mobile must be 10 digits.';
        break;
      case 'email':
        if (!value || !emailRegex.test(String(value).trim())) err = 'Valid email is required.';
        break;
      case 'productName':
        if (!value || String(value).trim().length < 3) err = 'Product requirement is required.';
        break;
      case 'quantity':
        if (value === '' || Number(value) < 1) err = 'Quantity must be at least 1.';
        break;
      case 'gstin':
        if (value && String(value).trim() && !gstinRegex.test(String(value).trim().toUpperCase())) {
          err = 'Invalid GSTIN (15 chars).';
        }
        break;
      default:
        break;
    }

    setEditErrors((prev) => ({ ...prev, [field]: err }));
    return !err;
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    // Validate key fields
    const fieldsToValidate = ['companyName', 'contactPerson', 'mobile', 'email', 'productName', 'quantity'];
    const newErrs: Record<string, string> = {};
    fieldsToValidate.forEach((f) => {
      const val = (editFormData as any)[f];
      validateEditField(f, val);
      if (!val || (f === 'mobile' && String(val).replace(/\D/g, '').length !== 10)) {
        newErrs[f] = 'Required or invalid format';
      }
    });

    if (Object.keys(newErrs).length > 0) {
      setEditErrors((prev) => ({ ...prev, ...newErrs }));
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

    updateLead(editingLead.id, updatePayload);
    setSuccessMsg(`Lead "${editingLead.leadNo}" updated successfully!`);
    setEditingLead(null);
    setIsEditDirty(false);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleCloseEdit = () => {
    if (isEditDirty) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        return;
      }
    }
    setEditingLead(null);
    setIsEditDirty(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingLead) return;
    const leadNo = deletingLead.leadNo || deletingLead.id;
    deleteLead(deletingLead.id);
    setSuccessMsg(`Lead "${leadNo}" has been deleted successfully.`);
    setDeletingLead(null);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const columns: Column<Lead>[] = [
    {
      header: 'LEAD NO.',
      accessorKey: 'leadNo',
      cell: (lead) => (
        <span className="font-mono font-bold text-[#0E91B2] bg-[#E0F2FE] px-2.5 py-1 rounded-lg border border-[#BAE6FD] text-xs whitespace-nowrap inline-block">
          {lead.leadNo}
        </span>
      ),
    },
    {
      header: 'COMPANY & CONTACT',
      cell: (lead) => (
        <div className="min-w-[180px]">
          <span className="font-bold text-[#211B17] block">{lead.companyName}</span>
          <span className="text-[11px] text-[#70665F] flex items-center gap-1">
            {lead.contactPerson} ({lead.designation || 'Contact'})
          </span>
        </div>
      ),
    },
    {
      header: 'EQUIPMENT / MACHINE REQUIREMENT',
      cell: (lead) => (
        <div className="max-w-xs">
          <span className="font-bold text-[#544B45] block truncate">{lead.productName}</span>
          <span className="text-[11px] text-[#70665F] block truncate font-mono">Qty: {lead.quantity} • {lead.capacity || 'Custom Spec'}</span>
        </div>
      ),
    },
    {
      header: 'EST. BUDGET',
      cell: (lead) => (
        <span className="font-bold text-[#211B17] font-mono whitespace-nowrap">
          {lead.budget ? formatCurrency(lead.budget) : 'TBD'}
        </span>
      ),
    },
    {
      header: 'ASSIGNED SALES PERSON',
      cell: (lead) => (
        <span className="font-bold text-[#544B45] whitespace-nowrap">{lead.assignedSalesPersonName || '-'}</span>
      ),
    },
    {
      header: 'LEAD SOURCE',
      cell: (lead) => (
        <span className="px-2 py-0.5 rounded-md bg-[#FAF0E6] text-[#75401F] font-mono text-[10px] font-bold uppercase border border-[#E7DED5] whitespace-nowrap">
          {lead.source?.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'LEAD STATUS',
      cell: (lead) => <div className="whitespace-nowrap"><StatusBadge status={lead.status as any} /></div>,
    },
    {
      header: 'NEXT FOLLOW-UP',
      cell: (lead) => (
        <span className="text-[#70665F] font-mono text-[11px] whitespace-nowrap">
          {lead.nextFollowUpDate ? formatDate(lead.nextFollowUpDate) : '-'}
        </span>
      ),
    },
    {
      header: 'ACTIONS',
      cell: (lead) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
          {/* Edit / Update Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(lead);
            }}
            title="Update / Edit Lead"
            className="px-2.5 py-1 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border border-[#FCD34D] rounded-lg font-bold text-xs inline-flex items-center gap-1 transition shadow-2xs cursor-pointer"
          >
            <Pencil className="w-3 h-3" />
            <span>Update</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeletingLead(lead);
            }}
            title="Delete Lead"
            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs inline-flex items-center gap-1 transition shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </button>

          {/* 360 View */}
          <Link
            href={`/crm/leads/${lead.id}`}
            className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#F3ECE4] text-[#75401F] border border-[#E7DED5] rounded-lg font-bold text-xs inline-flex items-center gap-1 transition shadow-2xs cursor-pointer"
          >
            <span>360°</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>

          {/* Convert to Customer */}
          {!lead.convertedCustomerId && (
            <button
              onClick={(e) => handleConvert(lead.id, e)}
              title="Convert to Customer Master"
              className="px-2.5 py-1 bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#15803D] border border-[#86EFAC] rounded-lg font-bold text-xs transition cursor-pointer"
            >
              Convert
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 text-xs pb-10">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#FAF3EA] via-[#F8EDE0] to-[#F1DFC9] p-5 sm:p-6 rounded-2xl border border-[#E9DFD3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs text-[#211B17]">
        <div>
          <h1 className="text-lg font-black text-[#211B17] flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAF0E6] text-[#75401F] flex items-center justify-center border border-[#E7DED5] shadow-xs">
              <UserPlus className="w-4.5 h-4.5" />
            </div>
            Leads & Enquiry Acquisition Management
          </h1>
          <p className="text-[#70665F] mt-1 text-xs">
            Capture, qualify, update, and manage commercial enquiries from Exhibitions, Inbound calls, WhatsApp, and Website.
          </p>
        </div>

        <Link
          href="/crm/leads/new"
          className="px-4 py-2.5 bg-[#3E2723] hover:bg-[#2C1810] text-white rounded-xl font-bold transition flex items-center gap-2 shadow-xs cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Lead</span>
        </Link>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-2xl font-bold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Leads Data Table */}
      <DataTable
        title="Active CRM Leads Master Register"
        subtitle={`Total ${filteredLeads.length} Registered Commercial Enquiries`}
        columns={columns}
        data={filteredLeads}
        onRowClick={(lead) => router.push(`/crm/leads/${lead.id}`)}
        searchPlaceholder="Search Company, Contact, Product requirement, Lead #..."
        filterComponent={
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB]/80 rounded-xl text-xs font-bold text-slate-700 dark:text-[#544B45] focus:outline-none"
            >
              <option value="all">All Lead Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="requirement_received">Requirement Received</option>
              <option value="quotation_sent">Quotation Sent</option>
              <option value="won">Won Orders</option>
              <option value="lost">Lost</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB]/80 rounded-xl text-xs font-bold text-slate-700 dark:text-[#544B45] focus:outline-none"
            >
              <option value="all">All Sources</option>
              <option value="website">Website</option>
              <option value="exhibition">Exhibition / Expo</option>
              <option value="referral">Referral</option>
              <option value="existing_customer">Existing Customer</option>
              <option value="whatsapp">WhatsApp / Phone</option>
            </select>
          </div>
        }
      />

      {/* EDIT / UPDATE LEAD MODAL */}
      {editingLead && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseEdit();
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
                    <span>Update Lead: {editingLead.leadNo}</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-white/80 border border-[#E7DED5] text-[#75401F]">
                      {editingLead.companyName}
                    </span>
                  </h2>
                  <p className="text-[#70665F] text-[11px] mt-0.5">
                    Modify lead details, specifications, commercial budget, status, or sales assignment.
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseEdit}
                className="p-1.5 text-[#70665F] hover:text-[#211B17] hover:bg-white/60 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
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
                      value={editFormData.companyName || ''}
                      onChange={(e) => handleEditChange('companyName', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] font-bold"
                    />
                    {editErrors.companyName && <p className="text-rose-500 text-[10px] mt-1">{editErrors.companyName}</p>}
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
                      value={editFormData.contactPerson || ''}
                      onChange={(e) => handleEditChange('contactPerson', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] font-semibold"
                    />
                    {editErrors.contactPerson && <p className="text-rose-500 text-[10px] mt-1">{editErrors.contactPerson}</p>}
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
                      value={editFormData.mobile || ''}
                      onChange={(e) => handleEditChange('mobile', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg font-mono text-[#211B17]"
                    />
                    {editErrors.mobile && <p className="text-rose-500 text-[10px] mt-1">{editErrors.mobile}</p>}
                  </div>
                  <div className="md:col-span-6">
                    <label className="block text-[#544B45] font-semibold mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={editFormData.email || ''}
                      onChange={(e) => handleEditChange('email', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                    />
                    {editErrors.email && <p className="text-rose-500 text-[10px] mt-1">{editErrors.email}</p>}
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
                      value={editFormData.productName || ''}
                      onChange={(e) => handleEditChange('productName', e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] font-bold"
                    />
                    {editErrors.productName && <p className="text-rose-500 text-[10px] mt-1">{editErrors.productName}</p>}
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
                      placeholder="e.g. 10 KL / 2000 mm"
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
                  onClick={handleCloseEdit}
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
      {deletingLead && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingLead(null);
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
                <span className="font-mono font-bold text-rose-600">{deletingLead.leadNo}</span> (
                <span className="font-bold text-[#211B17]">{deletingLead.companyName}</span>)?
              </p>
              <p className="text-[11px] text-[#8D827A] pt-1">
                Requirement: {deletingLead.productName} • This action cannot be reversed.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingLead(null)}
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
