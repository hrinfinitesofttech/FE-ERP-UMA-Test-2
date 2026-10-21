'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../context/ERPContext';
import { DataTable, Column } from '../data/DataTable';
import { CustomSelect } from '../ui/CustomSelect';
import { StatusBadge } from '../workflow/StatusBadge';
import { Lead, LeadStatus, LeadSource, PriorityLevel, Employee } from '../../types/crm';
import { formatCurrency, formatDate } from '../../lib/utils';
import { toast } from '../../context/ToastContext';
import {
  UserPlus,
  FileText,
  Plus,
  ArrowUpRight,
  Filter,
  Phone,
  Calendar,
  Sparkles,
  CheckCircle2,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  TrendingUp,
  FileCheck2,
  Building,
  MapPin,
  Tag,
  Save,
  Loader2,
  Send,
  UserCheck,
  Eye,
} from 'lucide-react';

interface CRMMasterHubProps {
  defaultTab?: string;
}

export function CRMMasterHub({ defaultTab }: CRMMasterHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    leads,
    updateLead,
    deleteLead,
    convertLeadToCustomer,
    enquiries,
    quotations,
    employees,
    availableEmployees,
  } = useERP();

  const allEmployees: Employee[] =
    availableEmployees && availableEmployees.length > 0
      ? availableEmployees
      : employees && employees.length > 0
      ? employees
      : [];

  // Notification Banner
  const [successMsg, setSuccessMsg] = useState('');
  useEffect(() => {
    const createdLead = searchParams?.get('created');
    if (createdLead) {
      setSuccessMsg(`Lead "${decodeURIComponent(createdLead)}" registered successfully!`);
      const timer = setTimeout(() => setSuccessMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Mounted state for SSR hydration safety
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // --------------------------------------------------------------------------
  // LEADS STATE & ACTIONS
  // --------------------------------------------------------------------------
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');
  const [leadSourceFilter, setLeadSourceFilter] = useState<string>('all');
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editLeadData, setEditLeadData] = useState<Partial<Lead>>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper to sanitize lead ref display
  const getCleanRef = (lead: Lead) => {
    const ref = lead.leadNo || lead.id || '';
    if (!ref || ref.includes('__') || ref.length > 25) {
      return 'LEAD-REF';
    }
    return ref;
  };

  const filteredLeads = leads.filter((lead) => {
    if (!lead) return false;
    // Exclude corrupt ghost leads with empty id and leadNo
    if (!lead.id && !lead.leadNo) return false;
    if (leadStatusFilter !== 'all' && lead.status !== leadStatusFilter) return false;
    if (leadSourceFilter !== 'all' && lead.source !== leadSourceFilter) return false;
    return true;
  });

  const handleConvertLead = async (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = convertLeadToCustomer(leadId);
      setSuccessMsg(
        `Lead "${res.customer.companyName}" successfully converted to Customer "${res.customer.customerCode}"! Click [Send Quotation] to generate a quotation.`
      );
      setTimeout(() => setSuccessMsg(''), 8000);
    } catch (err) {
      console.error('Error converting lead:', err);
    }
  };

  const handleOpenEdit = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLead(lead);
    setEditLeadData({
      companyName: lead.companyName || '',
      contactPerson: lead.contactPerson || '',
      mobile: lead.mobile || '',
      email: lead.email || '',
      address: lead.address || '',
    });
  };

  const handleSaveEditLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    setIsSavingEdit(true);

    try {
      const payload: Partial<Lead> = {
        companyName: editLeadData.companyName?.trim(),
        contactPerson: editLeadData.contactPerson?.trim(),
        mobile: editLeadData.mobile?.trim(),
        email: editLeadData.email?.trim(),
        address: editLeadData.address?.trim(),
      };

      const targetId = editingLead.id || editingLead.leadNo;
      await updateLead(targetId, payload);
      setEditingLead(null);
      setSuccessMsg(`Lead "${payload.companyName || editingLead.companyName}" updated successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Failed to update lead:', err);
      toast.error('Failed to update lead: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingLead) return;
    setIsDeleting(true);
    try {
      const targetId = deletingLead.id || deletingLead.leadNo;
      await deleteLead(targetId);
      setSuccessMsg(`Lead "${deletingLead.companyName}" deleted successfully.`);
      setDeletingLead(null);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Failed to delete lead:', err);
      toast.error('Error deleting lead: ' + (err?.message || 'Server error'));
    } finally {
      setIsDeleting(false);
    }
  };

  // --------------------------------------------------------------------------
  // KPI CALCULATIONS
  // --------------------------------------------------------------------------
  const validLeads = leads.filter((l) => l && (l.id || l.leadNo));
  const totalLeads = validLeads.length;
  const activeLeads = validLeads.filter((l) => l.status !== 'won' && l.status !== 'lost').length;
  const wonLeads = validLeads.filter((l) => l.status === 'won').length;
  const totalPipelineBudget = validLeads.reduce((sum, l) => sum + (Number(l.budget) || 0), 0);
  const activePipelineBudget = validLeads
    .filter((l) => l.status !== 'won' && l.status !== 'lost')
    .reduce((sum, l) => sum + (Number(l.budget) || 0), 0);
  const totalQuotations = quotations.length;
  const activeQuotations = quotations.filter((q) => q.latestSummary?.status !== 'rejected').length;

  // --------------------------------------------------------------------------
  // TABLE COLUMNS CONFIGURATIONS (Client-Grade, Compact, Resilient Layout)
  // --------------------------------------------------------------------------
  const leadColumns: Column<Lead>[] = [
    {
      header: 'Lead Ref / Date',
      accessorKey: 'leadNo',
      className: 'w-[145px] whitespace-nowrap align-top',
      cell: (lead) => {
        const cleanRef = getCleanRef(lead);
        return (
          <div className="space-y-1">
            <span
              title={lead.leadNo || lead.id}
              className="font-mono font-bold text-xs text-[#75401F] bg-[#FAF3EA] border border-[#E7DED5] px-2.5 py-0.5 rounded-md inline-flex items-center gap-1 shadow-2xs"
            >
              <Tag className="w-3 h-3 text-[#A89F91]" />
              {cleanRef}
            </span>
            <div className="text-[11px] text-[#70665F] flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3 text-[#A89F91] shrink-0" />
              <span>{formatDate(lead.createdDate)}</span>
            </div>
            {lead.source && (
              <span className="inline-block text-[9px] uppercase font-bold tracking-wider text-[#8C5229] bg-[#F5E6D8] px-1.5 py-0.5 rounded border border-[#E7DED5]">
                {lead.source.replace('_', ' ')}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Company & Contact',
      className: 'min-w-[210px] max-w-[260px] align-top',
      cell: (lead) => (
        <div className="space-y-1">
          <Link
            href={`/crm/leads/${lead.id}`}
            onClick={(e) => e.stopPropagation()}
            className="font-bold text-xs text-slate-900 hover:text-[#75401F] transition flex items-center gap-1 group"
          >
            <Building className="w-3.5 h-3.5 text-[#8C5229] shrink-0" />
            <span className="truncate group-hover:underline" title={lead.companyName}>
              {lead.companyName}
            </span>
            <ArrowUpRight className="w-3 h-3 text-[#8C5229] opacity-0 group-hover:opacity-100 transition shrink-0" />
          </Link>

          <div className="flex items-center gap-1.5 text-[11px] text-[#544B45]">
            <span
              className={`font-medium truncate ${
                lead.contactPerson && lead.contactPerson !== 'Contact Person' && lead.contactPerson !== 'Contact'
                  ? 'text-[#211B17]'
                  : 'text-[#A89F91] italic'
              }`}
              title={lead.contactPerson}
            >
              {lead.contactPerson && lead.contactPerson !== 'Contact Person' && lead.contactPerson !== 'Contact'
                ? lead.contactPerson
                : 'Not specified'}
            </span>
            {lead.mobile && lead.mobile !== '9999999999' ? (
              <a
                href={`tel:${lead.mobile}`}
                onClick={(e) => e.stopPropagation()}
                title="Call Lead"
                className="font-mono text-[10px] text-[#75401F] hover:underline flex items-center gap-0.5 bg-[#FAF7F2] border border-[#EBE3DB] px-1.5 py-0.5 rounded shrink-0"
              >
                <Phone className="w-2.5 h-2.5 text-[#8C5229]" /> {lead.mobile}
              </a>
            ) : null}
          </div>

          {lead.address ? (
            <div className="text-[10px] text-[#8D827A] flex items-center gap-1" title={lead.address}>
              <MapPin className="w-2.5 h-2.5 text-[#A89F91] shrink-0" />
              <span className="truncate max-w-[200px]">{lead.address}</span>
            </div>
          ) : lead.city ? (
            <div className="text-[10px] text-[#8D827A] flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 text-[#A89F91] shrink-0" />
              <span className="truncate">{lead.city}{lead.state ? `, ${lead.state}` : ''}</span>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      className: 'w-[145px] whitespace-nowrap align-top',
      cell: (lead) => <StatusBadge status={lead.status as any} />,
    },
    {
      header: 'Actions',
      className: 'min-w-[170px] whitespace-nowrap text-right align-top',
      cell: (lead) => {
        const existingEnquiry = (enquiries || []).find(
          (enq) =>
            (enq.leadId && (enq.leadId === lead.id || enq.leadId === lead.leadNo)) ||
            (lead.convertedEnquiryId && (enq.id === lead.convertedEnquiryId || enq.enquiryNo === lead.convertedEnquiryId))
        );

        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Conditional Inquiry Action Button: View if already created, else Create */}
            {existingEnquiry ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/crm/enquiries/new?id=${encodeURIComponent(existingEnquiry.id || existingEnquiry.enquiryNo)}`);
                }}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                title={`View Technical Enquiry (${existingEnquiry.enquiryNo || existingEnquiry.id})`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Inquiry</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/crm/enquiries/new?leadId=${encodeURIComponent(lead.id || lead.leadNo)}`);
                }}
                className="px-2.5 py-1 bg-[#75401F] hover:bg-[#5C3218] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                title="Create Technical Enquiry for this Lead"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Inquiries</span>
              </button>
            )}

            {/* Quick Edit Button */}
            <button
              onClick={(e) => handleOpenEdit(lead, e)}
              title="Edit Lead Record"
              className="p-1.5 text-[#70665F] hover:text-[#75401F] hover:bg-[#FAF3EA] rounded-lg border border-[#E7DED5] transition cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            {/* Quick Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeletingLead(lead);
              }}
              title="Delete Lead Record"
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full space-y-3 sm:space-y-3.5 text-xs pb-10">
      {/* 1. TOP HEADER BANNER - COMPACT */}
      <div className="bg-gradient-to-r from-[#FAF3EA] via-[#F8EDE0] to-[#F1DFC9] px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl border border-[#E9DFD3] text-[#211B17] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="px-2 py-0.5 rounded-full bg-[#F5E6D8] text-[#8C5229] border border-[#E7DED5] font-mono text-[9px] font-bold uppercase tracking-wider">
              CRM Engine
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[9px] font-bold border border-emerald-200">
              Live Cloud Sync
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-extrabold text-[#211B17] tracking-tight">
            Leads Pipeline & Enquiries
          </h1>
        </div>

        {/* Global Quick Actions Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/crm/leads/new"
            className="px-3 py-1.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ New Lead</span>
          </Link>
          <Link
            href="/crm/quotations/new"
            className="px-3 py-1.5 bg-white hover:bg-[#FAF7F2] border border-[#E7DED5] text-slate-800 rounded-lg font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>+ New Quotation</span>
          </Link>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION TOAST */}
      {successMsg && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between gap-2 animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. OVERVIEW KPI CARDS - COMPACT & PROPORTIONAL */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-[#EBE3DB] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#70665F] uppercase tracking-wider">Prospective Leads</span>
            <div className="w-5 h-5 rounded bg-[#FAF3EA] flex items-center justify-center text-crm-brand-700">
              <UserPlus className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-1">
            <span suppressHydrationWarning className="text-lg font-extrabold text-[#211B17] font-mono">{totalLeads}</span>
            <span suppressHydrationWarning className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Pipe {formatCurrency(totalPipelineBudget)}
            </span>
          </div>
        </div>

        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-[#EBE3DB] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#70665F] uppercase tracking-wider">Active Pipeline</span>
            <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-1">
            <span suppressHydrationWarning className="text-lg font-extrabold text-blue-700 font-mono">{activeLeads}</span>
            <span suppressHydrationWarning className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              Active {formatCurrency(activePipelineBudget)}
            </span>
          </div>
        </div>

        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-[#EBE3DB] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#70665F] uppercase tracking-wider">Won & Converted</span>
            <div className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-1">
            <span suppressHydrationWarning className="text-lg font-extrabold text-emerald-700 font-mono">{wonLeads}</span>
            <span suppressHydrationWarning className="text-[10px] text-emerald-700 font-bold">
              {totalLeads > 0 ? `${Math.round((wonLeads / totalLeads) * 100)}%` : '0%'} Win
            </span>
          </div>
        </div>

        <Link
          href="/crm/quotations"
          className="bg-white px-3.5 py-2.5 rounded-xl border border-[#EBE3DB] hover:border-slate-300 transition-all hover:shadow-2xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#70665F] uppercase tracking-wider">Quotations</span>
            <div className="w-5 h-5 rounded bg-purple-50 flex items-center justify-center text-purple-700">
              <FileCheck2 className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-1">
            <span suppressHydrationWarning className="text-lg font-extrabold text-[#211B17] font-mono">{totalQuotations}</span>
            <span suppressHydrationWarning className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
              {activeQuotations} active
            </span>
          </div>
        </Link>
      </div>

      {/* 3. LEADS TABLE (CLIENT-READY, COMPACT & INTUITIVE) */}
      <div className="space-y-3">
        <DataTable
          title="Leads Directory"
          subtitle={`${filteredLeads.length} records`}
          columns={leadColumns}
          data={filteredLeads}
          searchPlaceholder="Search leads by company, machine, contact..."
          onRowClick={(lead) => router.push(`/crm/leads/${lead.id}`)}
          filterComponent={
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-36 sm:w-40">
                <CustomSelect
                  fullWidth={true}
                  size="sm"
                  value={leadStatusFilter}
                  onChange={(val) => setLeadStatusFilter(val)}
                >
                  <option value="all">All Statuses ({validLeads.length})</option>
                  <option value="new">New Lead</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="requirement_received">Requirement</option>
                  <option value="quotation_sent">Quotation Sent</option>
                  <option value="won">Won / Converted</option>
                  <option value="lost">Lost</option>
                </CustomSelect>
              </div>

              <div className="w-32 sm:w-36">
                <CustomSelect
                  fullWidth={true}
                  size="sm"
                  value={leadSourceFilter}
                  onChange={(val) => setLeadSourceFilter(val)}
                >
                  <option value="all">All Sources</option>
                  <option value="exhibition">Exhibition</option>
                  <option value="website">Website</option>
                  <option value="phone">Direct Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="referral">Referral</option>
                </CustomSelect>
              </div>
            </div>
          }
          actions={
            <Link
              href="/crm/leads/new"
              className="px-3 py-1 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-2xs whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> New Lead
            </Link>
          }
        />
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL 1: EDIT LEAD MODAL (FULL CRUD, ROBUST BACKEND SYNC)              */}
      {/* ---------------------------------------------------------------------- */}
      {editingLead && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAF3EA] border border-[#E7DED5] flex items-center justify-center text-[#8C5229]">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#211B17]">Edit Lead Details</h3>
                  <p className="text-[11px] text-[#70665F] font-mono">Ref: {getCleanRef(editingLead)}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingLead(null)}
                className="text-[#70665F] hover:text-[#211B17] p-1 rounded-lg hover:bg-[#FAF7F2]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditLead} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editLeadData.companyName || ''}
                  onChange={(e) => setEditLeadData((prev) => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-bold text-[#211B17] focus:outline-none focus:border-[#75401F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">
                    Contact Person <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editLeadData.contactPerson || ''}
                    onChange={(e) => setEditLeadData((prev) => ({ ...prev, contactPerson: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl focus:outline-none focus:border-[#75401F]"
                  />
                </div>
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={editLeadData.mobile || ''}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setEditLeadData((prev) => ({ ...prev, mobile: clean }));
                    }}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-mono focus:outline-none focus:border-[#75401F]"
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editLeadData.email || ''}
                  onChange={(e) => setEditLeadData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl focus:outline-none focus:border-[#75401F]"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={editLeadData.address || ''}
                  onChange={(e) => setEditLeadData((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl focus:outline-none focus:border-[#75401F]"
                  placeholder="e.g. Plot No. 42, GIDC Industrial Estate..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  disabled={isSavingEdit}
                  className="px-4 py-2 border border-[#EBE3DB] rounded-xl hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-xl font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL 2: DELETE CONFIRMATION MODAL                                     */}
      {/* ---------------------------------------------------------------------- */}
      {deletingLead && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-3 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-base text-[#211B17]">Delete Lead Record?</h4>
            <p className="text-xs text-[#70665F] leading-relaxed">
              Are you sure you want to permanently delete lead for <strong className="text-slate-900">{deletingLead.companyName}</strong> (Ref: {getCleanRef(deletingLead)})?
            </p>
            <p className="text-[10px] text-rose-600 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">
              This action cannot be undone and will remove the record from both local memory and the cloud database.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingLead(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-[#EBE3DB] rounded-xl font-semibold hover:bg-slate-50 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Lead</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
