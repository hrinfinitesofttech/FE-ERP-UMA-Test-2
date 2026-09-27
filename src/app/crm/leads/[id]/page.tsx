'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '../../../../context/ERPContext';
import { StatusBadge } from '../../../../components/workflow/StatusBadge';
import { formatCurrency, formatDate } from '../../../../lib/utils';
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
} from 'lucide-react';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { leads, updateLead, convertLeadToCustomer, followUps, addFollowUp, siteVisits, addSiteVisit, quotations } = useERP();

  const leadId = String(params.id);
  const lead = leads.find((l) => l.id === leadId);

  const [activeTab, setActiveTab] = useState<'timeline' | 'followups' | 'visits' | 'quotations' | 'specs'>('timeline');
  const [newNote, setNewNote] = useState('');
  const [convertSuccess, setConvertSuccess] = useState('');

  // Follow-up quick modal
  const [showFlwModal, setShowFlwModal] = useState(false);
  const [flwType, setFlwType] = useState<'call' | 'whatsapp' | 'email' | 'meeting' | 'visit'>('call');
  const [flwDate, setFlwDate] = useState('2026-09-24');
  const [flwTime, setFlwTime] = useState('11:00 AM');
  const [flwPurpose, setFlwPurpose] = useState('');

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

  const handleConvert = () => {
    const res = convertLeadToCustomer(lead.id);
    setConvertSuccess(`Successfully converted to Customer: ${res.customer.companyName}!`);
    setTimeout(() => setConvertSuccess(''), 4000);
  };

  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    addFollowUp({
      leadOrCustomerId: lead.id,
      leadOrCustomerName: `${lead.companyName} (${lead.contactPerson})`,
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

  const relatedFollowUps = followUps.filter((f) => f.leadOrCustomerId === lead.id);
  const relatedVisits = siteVisits.filter((v) => v.customerId === lead.convertedCustomerId);
  const relatedQuotations = quotations.filter((q) => q.leadId === lead.id || (q.customerName && lead.companyName && q.customerName.includes(lead.companyName)));

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
            <button
              onClick={() => setShowFlwModal(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#FAF7F2] text-slate-800 dark:text-[#544B45] rounded-xl font-bold flex items-center gap-1.5 transition"
            >
              <PhoneCall className="w-4 h-4 text-amber-500" />
              <span>Schedule Follow-up</span>
            </button>

            {!lead.convertedCustomerId ? (
              <button
                onClick={handleConvert}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm"
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
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block">Converted to Customer & Enquiry</span>
                    <p className="text-emerald-600 text-[11px] mt-0.5">
                      Customer ID {lead.convertedCustomerId} • Opportunity created with 60% probability.
                    </p>
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
                href="/crm/quotations/new"
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
                  className="px-4 py-2 border rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold"
                >
                  Schedule Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
