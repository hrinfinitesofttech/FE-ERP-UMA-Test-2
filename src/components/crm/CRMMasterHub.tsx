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
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);

  const filteredLeads = leads.filter((lead) => {
    if (leadStatusFilter !== 'all' && lead.status !== leadStatusFilter) return false;
    if (leadSourceFilter !== 'all' && lead.source !== leadSourceFilter) return false;
    return true;
  });

  const handleConvertLead = (leadId: string, e: React.MouseEvent) => {
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

  const handleSaveEditLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    updateLead(editingLead.id, editLeadData);
    setEditingLead(null);
    setSuccessMsg(`Lead "${editLeadData.companyName || editingLead.companyName}" updated successfully.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // --------------------------------------------------------------------------
  // KPI CALCULATIONS
  // --------------------------------------------------------------------------
  const totalLeads = leads.length;
  const activeLeads = leads.filter((l) => l.status !== 'won' && l.status !== 'lost').length;
  const wonLeads = leads.filter((l) => l.status === 'won').length;
  const totalPipelineBudget = leads.reduce((sum, l) => sum + (Number(l.budget) || 0), 0);
  const activePipelineBudget = leads
    .filter((l) => l.status !== 'won' && l.status !== 'lost')
    .reduce((sum, l) => sum + (Number(l.budget) || 0), 0);
  const totalQuotations = quotations.length;
  const activeQuotations = quotations.filter((q) => q.latestSummary?.status !== 'rejected').length;

  // --------------------------------------------------------------------------
  // TABLE COLUMNS CONFIGURATIONS
  // --------------------------------------------------------------------------
  const leadColumns: Column<Lead>[] = [
    {
      header: 'Lead Ref / Date',
      accessorKey: 'leadNo',
      cell: (lead) => (
        <div>
          <span className="font-mono font-bold text-crm-brand-700 bg-crm-brand-50 px-2 py-0.5 rounded border border-crm-brand-200 block w-fit">
            {lead.leadNo || lead.id}
          </span>
          <span className="text-[10px] text-[#70665F] mt-0.5 block flex items-center gap-1 font-mono">
            <Calendar className="w-3 h-3 text-[#A89F91]" />
            {formatDate(lead.createdDate)}
          </span>
        </div>
      ),
    },
    {
      header: 'Company & Contact',
      cell: (lead) => (
        <div className="space-y-0.5">
          <Link
            href={`/crm/leads/${lead.id}`}
            className="font-bold text-slate-900 hover:text-crm-brand-700 transition flex items-center gap-1"
          >
            <span>{lead.companyName}</span>
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </Link>
          <div className="flex items-center gap-2 text-[11px] text-[#70665F]">
            <span className="font-medium">{lead.contactPerson}</span>
            {lead.mobile && (
              <span className="flex items-center gap-0.5 font-mono text-[10px] text-[#544B45]">
                <Phone className="w-2.5 h-2.5 text-[#A89F91]" /> {lead.mobile}
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#70665F] block">{lead.city || 'Vadodara, Gujarat'}</span>
        </div>
      ),
    },
    {
      header: 'Machine Requirement',
      cell: (lead) => (
        <div className="max-w-xs">
          <span className="font-semibold text-slate-800 block truncate">{lead.productName}</span>
          <div className="flex items-center gap-2 text-[10px] text-[#70665F] mt-0.5 font-mono">
            <span>Qty: <strong className="text-slate-800">{lead.quantity || 1}</strong></span>
            {lead.capacity && <span>Cap: {lead.capacity}</span>}
          </div>
        </div>
      ),
    },
    {
      header: 'Budget (₹)',
      accessorKey: 'budget',
      cell: (lead) => (
        <span className="font-mono font-bold text-emerald-700">
          {lead.budget ? formatCurrency(lead.budget) : '₹0'}
        </span>
      ),
    },
    {
      header: 'Priority',
      accessorKey: 'priority',
      cell: (lead) => {
        const p = lead.priority || 'medium';
        const colors: Record<string, string> = {
          urgent: 'bg-rose-100 text-rose-800 border-rose-200',
          high: 'bg-amber-100 text-amber-800 border-amber-200',
          medium: 'bg-blue-100 text-blue-800 border-blue-200',
          low: 'bg-slate-100 text-slate-700 border-slate-200',
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${colors[p]}`}>
            {p}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (lead) => <StatusBadge status={lead.status as any} />,
    },
    {
      header: 'Sales Engineer',
      accessorKey: 'assignedSalesPersonName',
      cell: (lead) => (
        <span className="text-xs text-[#544B45] font-medium">{lead.assignedSalesPersonName || 'Pravin Patel'}</span>
      ),
    },
    {
      header: 'Actions',
      cell: (lead) => {
        const isConverted = lead.status === 'won' || !!lead.convertedCustomerId;
        return (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {!isConverted ? (
              <button
                onClick={(e) => handleConvertLead(lead.id, e)}
                title="Convert Lead to Customer Account"
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded text-[10px] font-bold transition flex items-center gap-1 shadow-xs cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3" /> Convert
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold flex items-center gap-1 whitespace-nowrap">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Converted
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/crm/quotations/new?leadId=${lead.id}&customerId=${lead.convertedCustomerId || ''}`);
                  }}
                  title="Send formal Quotation for this converted lead"
                  className="px-2.5 py-1 bg-crm-brand-700 hover:bg-crm-brand-800 active:scale-95 text-white rounded text-[10px] font-bold transition flex items-center gap-1 shadow-xs cursor-pointer whitespace-nowrap"
                >
                  <FileText className="w-3 h-3" /> Send Quotation
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setEditingLead(lead);
                setEditLeadData({ ...lead });
              }}
              title="Edit Lead"
              className="p-1 text-[#70665F] hover:text-slate-900 hover:bg-[#FAF7F2] rounded border border-transparent hover:border-[#EBE3DB]"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeletingLead(lead)}
              title="Delete Lead"
              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200"
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
              Live Synced
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#211B17] tracking-tight">
            Leads Management
          </h1>
          <p className="text-[#6F6156] text-xs mt-1 max-w-2xl leading-relaxed">
            Manage prospective machinery leads, track pipeline values, and convert directly into commercial quotations.
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
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">
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

      {/* 3. LEADS TABLE (DIRECT VIEW, NO TABS) */}
      <div className="space-y-4">
        <DataTable
          columns={leadColumns}
          data={filteredLeads}
          searchPlaceholder="Search leads by company, machine, contact..."
          onRowClick={(lead) => router.push(`/crm/leads/${lead.id}`)}
          filterComponent={
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={leadStatusFilter}
                onChange={(e) => setLeadStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-xs font-semibold text-[#544B45]"
              >
                <option value="all">All Statuses ({leads.length})</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="won">Won / Converted</option>
                <option value="lost">Lost</option>
              </select>

              <select
                value={leadSourceFilter}
                onChange={(e) => setLeadSourceFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-xs font-semibold text-[#544B45]"
              >
                <option value="all">All Sources</option>
                <option value="exhibition">Exhibition</option>
                <option value="website">Website</option>
                <option value="phone">Direct Phone</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="referral">Referral</option>
              </select>
            </div>
          }
          actions={
            <Link
              href="/crm/leads/new"
              className="px-3 py-1.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> New Lead
            </Link>
          }
        />
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL 1: EDIT LEAD MODAL                                               */}
      {/* ---------------------------------------------------------------------- */}
      {editingLead && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-lg w-full p-6 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3 mb-4">
              <h3 className="font-bold text-sm text-[#211B17] flex items-center gap-2">
                <Pencil className="w-4 h-4 text-crm-brand-700" />
                Edit Lead: {editingLead.leadNo || editingLead.id}
              </h3>
              <button onClick={() => setEditingLead(null)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditLead} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={editLeadData.companyName || ''}
                  onChange={(e) => setEditLeadData((prev) => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={editLeadData.contactPerson || ''}
                    onChange={(e) => setEditLeadData((prev) => ({ ...prev, contactPerson: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Mobile</label>
                  <input
                    type="text"
                    value={editLeadData.mobile || ''}
                    onChange={(e) => setEditLeadData((prev) => ({ ...prev, mobile: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Machine / Product</label>
                <input
                  type="text"
                  value={editLeadData.productName || ''}
                  onChange={(e) => setEditLeadData((prev) => ({ ...prev, productName: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={editLeadData.quantity || 1}
                    onChange={(e) => setEditLeadData((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Budget (₹)</label>
                  <input
                    type="number"
                    value={editLeadData.budget || 0}
                    onChange={(e) => setEditLeadData((prev) => ({ ...prev, budget: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Status</label>
                  <select
                    value={editLeadData.status || 'new'}
                    onChange={(e) => setEditLeadData((prev) => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-semibold"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="won">Won / Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 border border-[#EBE3DB] rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold shadow-xs transition"
                >
                  Save Changes
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
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-sm w-full p-5 shadow-xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#211B17]">Delete Lead Record?</h4>
            <p className="text-[11px] text-[#70665F]">
              Are you sure you want to delete lead for <strong>{deletingLead.companyName}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingLead(null)}
                className="px-4 py-1.5 border border-[#EBE3DB] rounded-lg font-semibold hover:bg-slate-50 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteLead(deletingLead.id);
                  setDeletingLead(null);
                  setSuccessMsg('Lead record deleted successfully.');
                  setTimeout(() => setSuccessMsg(''), 4000);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
