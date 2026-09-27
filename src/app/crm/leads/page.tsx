'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { DataTable, Column } from '../../../components/data/DataTable';
import { StatusBadge } from '../../../components/workflow/StatusBadge';
import { Lead } from '../../../types/crm';
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
} from 'lucide-react';

export default function LeadsListPage() {
  const router = useRouter();
  const { leads, convertLeadToCustomer } = useERP();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [successMsg, setSuccessMsg] = useState('');

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
            {lead.contactPerson} ({lead.designation})
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
        <span className="font-bold text-[#544B45] whitespace-nowrap">{lead.assignedSalesPersonName}</span>
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
          <Link
            href={`/crm/leads/${lead.id}`}
            className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#F3ECE4] text-[#75401F] border border-[#E7DED5] rounded-lg font-bold text-xs inline-flex items-center gap-1 transition shadow-2xs cursor-pointer"
          >
            <span>360° View</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
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
            Capture and qualify commercial enquiries from Exhibitions, Inbound calls, WhatsApp, and Website.
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
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl font-bold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
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
    </div>
  );
}
