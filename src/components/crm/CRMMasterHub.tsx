'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../context/ERPContext';
import { DataTable, Column } from '../data/DataTable';
import { StatusBadge } from '../workflow/StatusBadge';
import { Lead, LeadStatus, LeadSource, PriorityLevel, Employee } from '../../types/crm';
import { formatCurrency, formatDate } from '../../lib/utils';
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
  ClipboardList,
  Building,
  MapPin,
  Tag,
  Save,
  Loader2,
  Send,
  UserCheck,
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
    convertLeadToEnquiry,
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

  const handleConvertToEnquiry = async (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const enq = await convertLeadToEnquiry(leadId);
      setSuccessMsg(
        `Lead successfully converted to Enquiry "${enq.enquiryNo}"! Ready for technical review or quotation generation.`
      );
      setTimeout(() => setSuccessMsg(''), 8000);
    } catch (err) {
      console.error('Error converting lead to enquiry:', err);
    }
  };

  const handleOpenEdit = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLead(lead);
    setEditLeadData({
      companyName: lead.companyName || '',
      contactPerson: lead.contactPerson || '',
      mobile: lead.mobile || '',
      altMobile: lead.altMobile || '',
      email: lead.email || '',
      city: lead.city || 'Vadodara',
      state: lead.state || 'Gujarat',
      productName: lead.productName || '',
      machineType: lead.machineType || '',
      quantity: lead.quantity || 1,
      capacity: lead.capacity || '',
      budget: lead.budget || 0,
      priority: lead.priority || 'medium',
      status: lead.status || 'new',
      assignedSalesPersonId: lead.assignedSalesPersonId || '',
      assignedSalesPersonName: lead.assignedSalesPersonName || 'Pravin Patel',
      remarks: lead.remarks || '',
    });
  };

  const handleSaveEditLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    setIsSavingEdit(true);

    try {
      const assignedPerson = allEmployees.find((emp) => emp.id === editLeadData.assignedSalesPersonId);
      const assignedName = assignedPerson
        ? assignedPerson.name ||
          (assignedPerson as any).employeeName ||
          `${assignedPerson.firstName || ''} ${assignedPerson.lastName || ''}`.trim() ||
          editLeadData.assignedSalesPersonName ||
          'Pravin Patel'
        : editLeadData.assignedSalesPersonName || 'Pravin Patel';

      const payload: Partial<Lead> = {
        ...editLeadData,
        companyName: editLeadData.companyName?.trim(),
        contactPerson: editLeadData.contactPerson?.trim(),
        mobile: editLeadData.mobile?.trim(),
        productName: editLeadData.productName?.trim(),
        quantity: Number(editLeadData.quantity) || 1,
        budget: Number(editLeadData.budget) || 0,
        assignedSalesPersonName: assignedName,
      };

      const targetId = editingLead.id || editingLead.leadNo;
      await updateLead(targetId, payload);
      setEditingLead(null);
      setSuccessMsg(`Lead "${payload.companyName || editingLead.companyName}" updated successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Failed to update lead:', err);
      alert('Error updating lead: ' + (err?.message || 'Server error'));
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
      alert('Error deleting lead: ' + (err?.message || 'Server error'));
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
            <span className="font-medium truncate" title={lead.contactPerson}>
              {lead.contactPerson || 'Contact'}
            </span>
            {lead.mobile && (
              <a
                href={`tel:${lead.mobile}`}
                onClick={(e) => e.stopPropagation()}
                title="Call Lead"
                className="font-mono text-[10px] text-[#75401F] hover:underline flex items-center gap-0.5 bg-[#FAF7F2] border border-[#EBE3DB] px-1.5 py-0.5 rounded shrink-0"
              >
                <Phone className="w-2.5 h-2.5 text-[#8C5229]" /> {lead.mobile}
              </a>
            )}
          </div>

          <div className="text-[10px] text-[#8D827A] flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 text-[#A89F91] shrink-0" />
            <span className="truncate">{lead.city || 'Vadodara'}, {lead.state || 'Gujarat'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Machine Requirement',
      className: 'min-w-[220px] max-w-[280px] align-top',
      cell: (lead) => (
        <div className="space-y-1">
          <span
            className="font-semibold text-xs text-[#211B17] line-clamp-2 leading-snug block"
            title={lead.productName}
          >
            {lead.productName}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono font-medium bg-[#FAF7F2] border border-[#EBE3DB] px-1.5 py-0.5 rounded text-[#544B45]">
              Qty: <strong className="text-slate-900">{lead.quantity || 1}</strong>
            </span>
            {lead.capacity && (
              <span className="text-[10px] font-mono text-[#70665F] bg-[#FAF7F2] border border-[#EBE3DB] px-1.5 py-0.5 rounded truncate max-w-[130px]" title={lead.capacity}>
                Cap: {lead.capacity}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Commercial & Priority',
      accessorKey: 'budget',
      className: 'w-[130px] whitespace-nowrap align-top',
      cell: (lead) => {
        const p = lead.priority || 'medium';
        const colors: Record<string, string> = {
          urgent: 'bg-rose-50 text-rose-800 border-rose-200',
          high: 'bg-amber-50 text-amber-800 border-amber-200',
          medium: 'bg-blue-50 text-blue-800 border-blue-200',
          low: 'bg-slate-100 text-slate-700 border-slate-200',
        };
        return (
          <div className="space-y-1">
            <span className="font-mono font-extrabold text-xs text-emerald-800 block">
              {lead.budget ? formatCurrency(lead.budget) : '₹0'}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold border uppercase tracking-wider inline-block ${colors[p]}`}>
              {p}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      className: 'w-[145px] whitespace-nowrap align-top',
      cell: (lead) => <StatusBadge status={lead.status as any} />,
    },
    {
      header: 'Sales Engineer',
      accessorKey: 'assignedSalesPersonName',
      className: 'w-[135px] whitespace-nowrap align-top',
      cell: (lead) => {
        const name = lead.assignedSalesPersonName || 'Sales Team';
        const initials = name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'SE';
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-[#FAF3EA] border border-[#E7DED5] text-[#8C5229] font-bold text-[9px] flex items-center justify-center shrink-0">
              {initials}
            </div>
            <span className="text-xs text-[#211B17] font-medium truncate max-w-[100px]" title={name}>
              {name}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      className: 'w-[185px] whitespace-nowrap text-right align-top',
      cell: (lead) => {
        const isConverted = lead.status === 'won' || !!lead.convertedCustomerId;
        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Primary Action Button */}
            {!lead.convertedEnquiryId ? (
              <button
                onClick={(e) => handleConvertToEnquiry(lead.id, e)}
                title="Convert Lead to Technical Enquiry (RFQ)"
                className="px-2 py-1 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer whitespace-nowrap"
              >
                <ClipboardList className="w-3 h-3" /> + Enquiry
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push('/crm/enquiries');
                }}
                title={`Linked to Enquiry ${lead.convertedEnquiryId}`}
                className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300 text-[10px] font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3 text-amber-600" /> {lead.convertedEnquiryId}
              </button>
            )}

            {!isConverted ? (
              <button
                onClick={(e) => handleConvertLead(lead.id, e)}
                title="Convert Lead to Customer Account"
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3" /> Convert
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/crm/quotations/new?leadId=${lead.id}&customerId=${lead.convertedCustomerId || ''}&enquiryId=${lead.convertedEnquiryId || ''}`);
                }}
                title="Send formal Quotation for this converted lead"
                className="px-2 py-1 bg-crm-brand-700 hover:bg-crm-brand-800 active:scale-95 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer whitespace-nowrap"
              >
                <FileText className="w-3 h-3" /> Quote
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
    <div className="w-full space-y-4 md:space-y-5 text-xs pb-12">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#FAF3EA] via-[#F8EDE0] to-[#F1DFC9] p-5 sm:p-6 rounded-2xl border border-[#E9DFD3] text-[#211B17] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F5E6D8] text-[#8C5229] border border-[#E7DED5] font-mono text-[10px] font-bold uppercase tracking-wider">
              CRM Engine
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              Live Cloud Sync
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#211B17] tracking-tight">
            Leads Management
          </h1>
          <p className="text-[#6F6156] text-xs mt-1 max-w-2xl leading-relaxed">
            Manage prospective industrial machinery leads, track pipeline values, and convert inquiries into commercial quotations.
          </p>
        </div>

        {/* Global Quick Actions Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/crm/leads/new"
            className="px-3.5 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ New Lead</span>
          </Link>
          <Link
            href="/crm/quotations/new"
            className="px-3.5 py-2 bg-white hover:bg-[#FAF7F2] border border-[#E7DED5] text-slate-800 rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>+ New Quotation</span>
          </Link>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION TOAST */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between gap-2 animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. OVERVIEW KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider">Prospective Leads</span>
            <UserPlus className="w-4 h-4 text-crm-brand-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span suppressHydrationWarning className="text-2xl font-extrabold text-[#211B17] font-mono">{totalLeads}</span>
            <span suppressHydrationWarning className="text-[10px] text-emerald-600 font-bold">Total</span>
          </div>
          <p suppressHydrationWarning className="text-[10px] text-[#70665F] mt-1 font-mono">
            Pipeline: {formatCurrency(totalPipelineBudget)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider">Active In Pipeline</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span suppressHydrationWarning className="text-2xl font-extrabold text-blue-700 font-mono">{activeLeads}</span>
            <span suppressHydrationWarning className="text-[10px] text-[#70665F] font-bold">In Discussion</span>
          </div>
          <p suppressHydrationWarning className="text-[10px] text-[#70665F] mt-1 font-mono">
            Active: {formatCurrency(activePipelineBudget)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider">Won & Converted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span suppressHydrationWarning className="text-2xl font-extrabold text-emerald-700 font-mono">{wonLeads}</span>
            <span suppressHydrationWarning className="text-[10px] text-emerald-700 font-bold">
              ({totalLeads > 0 ? `${Math.round((wonLeads / totalLeads) * 100)}%` : '0%'} Win Rate)
            </span>
          </div>
          <p className="text-[10px] text-[#70665F] mt-1">Ready for Quotation & Order</p>
        </div>

        <Link
          href="/crm/quotations"
          className="bg-white p-4 rounded-xl border border-[#EBE3DB] hover:border-slate-300 transition-all hover:shadow-xs"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider">Commercial Quotations</span>
            <FileCheck2 className="w-4 h-4 text-crm-brand-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span suppressHydrationWarning className="text-2xl font-extrabold text-[#211B17] font-mono">{totalQuotations}</span>
            <span suppressHydrationWarning className="text-[10px] text-crm-brand-700 font-bold">({activeQuotations} active)</span>
          </div>
          <p className="text-[10px] text-[#70665F] mt-1">Estimations & customer proposals</p>
        </Link>
      </div>

      {/* 3. LEADS TABLE (CLIENT-READY, NO HORIZONTAL CUT-OFF) */}
      <div className="space-y-4">
        <DataTable
          columns={leadColumns}
          data={filteredLeads}
          searchPlaceholder="Search leads by company, machine, contact, city..."
          onRowClick={(lead) => router.push(`/crm/leads/${lead.id}`)}
          filterComponent={
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={leadStatusFilter}
                onChange={(e) => setLeadStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-xs font-semibold text-[#544B45] focus:outline-none focus:border-[#75401F]"
              >
                <option value="all">All Statuses ({validLeads.length})</option>
                <option value="new">New Lead</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="requirement_received">Requirement Received</option>
                <option value="quotation_sent">Quotation Sent</option>
                <option value="won">Won / Converted</option>
                <option value="lost">Lost</option>
              </select>

              <select
                value={leadSourceFilter}
                onChange={(e) => setLeadSourceFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-xs font-semibold text-[#544B45] focus:outline-none focus:border-[#75401F]"
              >
                <option value="all">All Sources</option>
                <option value="exhibition">Exhibition / Trade Show</option>
                <option value="website">Website Inquiry</option>
                <option value="phone">Direct Phone</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="referral">Client Referral</option>
              </select>
            </div>
          }
          actions={
            <Link
              href="/crm/leads/new"
              className="px-3 py-1.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-2xs"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editLeadData.email || ''}
                    onChange={(e) => setEditLeadData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl focus:outline-none focus:border-[#75401F]"
                  />
                </div>
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">City / Location</label>
                  <input
                    type="text"
                    value={editLeadData.city || ''}
                    onChange={(e) => setEditLeadData((prev) => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl focus:outline-none focus:border-[#75401F]"
                    placeholder="e.g. Vadodara, Ahmedabad"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Machine / Equipment Required <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editLeadData.productName || ''}
                  onChange={(e) => setEditLeadData((prev) => ({ ...prev, productName: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-semibold text-[#211B17] focus:outline-none focus:border-[#75401F]"
                  placeholder="e.g. 15 KL Hastelloy Reactor Vessel with Limpet Coil"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={editLeadData.quantity || 1}
                    onChange={(e) => setEditLeadData((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-mono focus:outline-none focus:border-[#75401F]"
                  />
                </div>
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Capacity</label>
                  <input
                    type="text"
                    value={editLeadData.capacity || ''}
                    onChange={(e) => setEditLeadData((prev) => ({ ...prev, capacity: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-mono focus:outline-none focus:border-[#75401F]"
                    placeholder="e.g. 15 KL"
                  />
                </div>
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Budget (₹)</label>
                  <input
                    type="number"
                    value={editLeadData.budget || 0}
                    onChange={(e) => setEditLeadData((prev) => ({ ...prev, budget: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-mono font-bold text-emerald-700 focus:outline-none focus:border-[#75401F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Priority</label>
                  <select
                    value={editLeadData.priority || 'medium'}
                    onChange={(e) => setEditLeadData((prev) => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-semibold focus:outline-none focus:border-[#75401F]"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Status</label>
                  <select
                    value={editLeadData.status || 'new'}
                    onChange={(e) => setEditLeadData((prev) => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-semibold focus:outline-none focus:border-[#75401F]"
                  >
                    <option value="new">New Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="requirement_received">Requirement Received</option>
                    <option value="quotation_sent">Quotation Sent</option>
                    <option value="won">Won / Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Sales Engineer</label>
                  <select
                    value={editLeadData.assignedSalesPersonId || ''}
                    onChange={(e) => {
                      const empId = e.target.value;
                      const emp = allEmployees.find((m) => m.id === empId);
                      setEditLeadData((prev) => ({
                        ...prev,
                        assignedSalesPersonId: empId,
                        assignedSalesPersonName: emp ? (emp.name || (emp as any).employeeName || 'Pravin Patel') : 'Pravin Patel',
                      }));
                    }}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-semibold focus:outline-none focus:border-[#75401F]"
                  >
                    <option value="">-- Assign Engineer --</option>
                    {allEmployees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name || (emp as any).employeeName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Remarks / Technical Notes</label>
                <textarea
                  rows={2}
                  value={editLeadData.remarks || ''}
                  onChange={(e) => setEditLeadData((prev) => ({ ...prev, remarks: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl focus:outline-none focus:border-[#75401F]"
                  placeholder="Additional client requirements, operating conditions..."
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
