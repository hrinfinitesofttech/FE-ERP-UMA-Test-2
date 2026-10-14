'use client';

import React, { useState, useEffect } from 'react';
import { useERP } from '../../../context/ERPContext';
import { DataTable, Column } from '../../../components/data/DataTable';
import { SiteVisit } from '../../../types/crm';
import { formatDate } from '../../../lib/utils';
import {
  MapPin,
  Plus,
  CheckCircle2,
  Eye,
  Edit2,
  Trash2,
  Building,
  User,
  Phone,
  Calendar,
  FileText,
  Clock,
  Search,
  Filter,
  X,
  Check,
} from 'lucide-react';

export default function VisitsPage() {
  const { siteVisits, addSiteVisit, updateSiteVisit, deleteSiteVisit, customers, leads, enquiries, employees } = useERP();

  const [showModal, setShowModal] = useState(false);
  const [viewingVisit, setViewingVisit] = useState<SiteVisit | null>(null);
  const [editingVisit, setEditingVisit] = useState<SiteVisit | null>(null);

  const [leadId, setLeadId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [discussionNotes, setDiscussionNotes] = useState('');
  const [requirementDetails, setRequirementDetails] = useState('');
  const [outcome, setOutcome] = useState<SiteVisit['outcome']>('positive');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedLead = leads.find((l) => l.id === leadId);
    const emp = employees[0];

    addSiteVisit({
      leadId: leadId || undefined,
      customerId: selectedLead?.id || 'LEAD-CUSTOMER',
      customerName: selectedLead?.companyName || 'Valued Lead Client',
      contactPerson: selectedLead?.contactPerson || 'N/A',
      contactMobile: selectedLead?.mobile || '',
      visitDate: new Date().toISOString().split('T')[0],
      location: selectedLead?.address || selectedLead?.city || 'Client Site',
      employeeId: emp?.id || '',
      employeeName: emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : 'Sales Engineer',
      purpose,
      discussionNotes,
      requirementDetails,
      outcome,
      nextAction: '',
    });

    // Reset form
    setLeadId('');
    setPurpose('');
    setDiscussionNotes('');
    setRequirementDetails('');
    setOutcome('positive');
    setShowModal(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVisit) return;

    updateSiteVisit(editingVisit.id, {
      ...editingVisit,
    });

    setEditingVisit(null);
  };

  const getOutcomeBadge = (out: SiteVisit['outcome']) => {
    switch (out) {
      case 'positive':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">Positive Progress</span>;
      case 'order_expected':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">Order Expected</span>;
      case 'quotation_required':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">Quotation Required</span>;
      case 'follow_up_required':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">Follow-Up Required</span>;
      case 'not_interested':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">Not Interested</span>;
      default:
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-gray-50 text-gray-700 border border-gray-200">{out}</span>;
    }
  };

  const columns: Column<SiteVisit>[] = [
    {
      header: 'Visit #',
      accessorKey: 'visitNo',
      cell: (v) => <span className="font-mono font-bold text-crm-brand-700">{v.visitNo}</span>,
    },
    {
      header: 'Customer & Contact',
      cell: (v) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-[#211B17] block">{v.customerName}</span>
          <span className="text-[11px] text-[#70665F]">
            {v.contactPerson} {v.contactMobile ? `• ${v.contactMobile}` : ''}
          </span>
        </div>
      ),
    },
    {
      header: 'Visit Date & Location',
      cell: (v) => (
        <div>
          <span className="font-mono font-bold text-slate-800 dark:text-[#544B45] block">{formatDate(v.visitDate)}</span>
          <span className="text-[10px] text-[#70665F]">{v.location}</span>
        </div>
      ),
    },
    {
      header: 'Purpose & Observations',
      cell: (v) => (
        <div className="max-w-xs">
          <span className="font-semibold text-slate-800 dark:text-[#544B45] block truncate">{v.purpose}</span>
          <span className="text-[10px] text-[#70665F] block truncate">{v.discussionNotes}</span>
        </div>
      ),
    },
    {
      header: 'Visiting Engineer',
      accessorKey: 'employeeName',
      cell: (v) => <span className="font-semibold text-slate-800">{v.employeeName}</span>,
    },
    {
      header: 'Outcome',
      cell: (v) => getOutcomeBadge(v.outcome),
    },
    {
      header: 'Next Action',
      accessorKey: 'nextAction',
      cell: (v) => (
        <div>
          <span className="text-[11px] text-slate-700 dark:text-[#544B45] block">{v.nextAction || 'N/A'}</span>
          {v.nextFollowUpDate && (
            <span className="text-[10px] text-[#70665F] font-mono block">Follow-up: {formatDate(v.nextFollowUpDate)}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      cell: (v) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewingVisit(v)}
            title="View Full Visit Report"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-[#70665F] hover:text-[#211B17] transition"
          >
            <Eye className="w-3.5 h-3.5 text-pink-600" />
          </button>
          <button
            onClick={() => setEditingVisit({ ...v })}
            title="Edit Visit Details"
            className="p-1.5 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-amber-700 transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete visit record "${v.visitNo}"?`)) {
                deleteSiteVisit(v.id);
              }
            }}
            title="Delete Visit"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-[#70665F] hover:text-rose-600 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 text-xs pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-crm-brand-700" />
            Client Site Visits & Field Engineering Reports
          </h1>
          <p className="text-[#70665F] mt-0.5">
            Record plant measurement inspections, civil foundation checks, technical discussions, and field engineering surveys.
          </p>
        </div>

        <button
          onClick={() => {
            if (leads.length > 0 && !leadId) {
              setLeadId(leads[0].id);
            }
            setShowModal(true);
          }}
          className="px-4 py-2.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-xl font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log Site Visit</span>
        </button>
      </div>

      {/* Main Data Table */}
      <DataTable
        title="Client Plant & Site Visits Log"
        subtitle={`Total ${siteVisits.length} Recorded Site Inspections`}
        columns={columns}
        data={siteVisits}
        searchPlaceholder="Search visits by customer, location, engineer or notes..."
      />

      {/* LOG SITE VISIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-white border border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE3DB]">
              <h3 className="text-base font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-crm-brand-700" />
                Log Site Visit Report
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              {/* Select lead */}
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">
                  Select Lead *
                </label>
                <select
                  required
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg font-semibold text-[#211B17] focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                >
                  <option value="">-- Select Lead --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.companyName} {l.contactPerson ? `(${l.contactPerson})` : ''} - {l.leadNo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Visit Purpose */}
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">
                  Visit Purpose *
                </label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Technical site inspection & layout survey"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                />
              </div>

              {/* Discussion Details */}
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">
                  Discussion Details
                </label>
                <textarea
                  rows={3}
                  value={discussionNotes}
                  onChange={(e) => setDiscussionNotes(e.target.value)}
                  placeholder="Enter discussion details, minutes of meeting, observations..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                />
              </div>

              {/* Technical Requirement */}
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">
                  Technical Requirement
                </label>
                <textarea
                  rows={3}
                  value={requirementDetails}
                  onChange={(e) => setRequirementDetails(e.target.value)}
                  placeholder="Enter machinery requirements, plant specifications, parameters..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                />
              </div>

              {/* Business Outcome (Dropdown) */}
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">
                  Business Outcome *
                </label>
                <select
                  required
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as SiteVisit['outcome'])}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg font-bold text-[#211B17] focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
                >
                  <option value="positive">Positive Progress</option>
                  <option value="order_expected">Order Expected</option>
                  <option value="quotation_required">Quotation Required</option>
                  <option value="follow_up_required">Follow-up Required</option>
                  <option value="not_interested">Not Interested</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#EBE3DB] rounded-lg font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold shadow-sm"
                >
                  Save Site Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SITE VISIT REPORT MODAL */}
      {viewingVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE3DB]">
              <div>
                <h3 className="text-base font-bold text-slate-900">Site Visit Report: {viewingVisit.visitNo}</h3>
                <p className="text-[11px] text-[#70665F]">{viewingVisit.customerName}</p>
              </div>
              <button onClick={() => setViewingVisit(null)} className="text-[#70665F] hover:text-[#211B17] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <div>
                  <span className="text-[#70665F] block text-[10px]">Contact Person</span>
                  <span className="font-bold text-slate-900">{viewingVisit.contactPerson} ({viewingVisit.contactMobile || 'N/A'})</span>
                </div>
                <div>
                  <span className="text-[#70665F] block text-[10px]">Visiting Engineer</span>
                  <span className="font-bold text-slate-900">{viewingVisit.employeeName}</span>
                </div>
                <div>
                  <span className="text-[#70665F] block text-[10px]">Visit Date</span>
                  <span className="font-mono font-bold text-slate-900">{formatDate(viewingVisit.visitDate)}</span>
                </div>
                <div>
                  <span className="text-[#70665F] block text-[10px]">Location</span>
                  <span className="font-bold text-slate-900">{viewingVisit.location}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-0.5">Purpose of Visit</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">{viewingVisit.purpose}</p>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-0.5">Discussion Details & Observations</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                  {viewingVisit.discussionNotes || 'No notes entered.'}
                </p>
              </div>

              {viewingVisit.requirementDetails && (
                <div>
                  <span className="font-bold text-slate-800 block mb-0.5">Customer Requirements</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {viewingVisit.requirementDetails}
                  </p>
                </div>
              )}

              {/* Technical Measurements & Utility Conditions */}
              {(viewingVisit.siteMeasurements || viewingVisit.operatingConditions) && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-[11px]">
                  <strong className="block text-slate-800 font-semibold">Technical Site Inspection Findings:</strong>
                  {viewingVisit.siteMeasurements && (
                    <div>
                      <span className="text-[#70665F] block text-[10px]">Site Measurements / Clearances</span>
                      <p className="text-slate-800 font-mono">{viewingVisit.siteMeasurements}</p>
                    </div>
                  )}
                  {viewingVisit.operatingConditions && (
                    <div>
                      <span className="text-[#70665F] block text-[10px]">Plant Utilities & Operating Conditions</span>
                      <p className="text-slate-800 font-mono">{viewingVisit.operatingConditions}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-[#70665F] block text-[10px] mb-1">Outcome Status</span>
                  {getOutcomeBadge(viewingVisit.outcome)}
                </div>
                <div>
                  <span className="text-[#70665F] block text-[10px] mb-1">Next Action</span>
                  <span className="font-semibold text-slate-900 block">{viewingVisit.nextAction || 'None'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#EBE3DB]">
              <button
                onClick={() => setViewingVisit(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SITE VISIT MODAL */}
      {editingVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE3DB]">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-amber-600" />
                  Edit Site Visit: {editingVisit.visitNo}
                </h3>
                <p className="text-[11px] text-[#70665F]">{editingVisit.customerName}</p>
              </div>
              <button onClick={() => setEditingVisit(null)} className="text-[#70665F] hover:text-[#211B17] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Lead</label>
                <select
                  value={editingVisit.leadId || ''}
                  onChange={(e) => {
                    const l = leads.find((x) => x.id === e.target.value);
                    setEditingVisit({
                      ...editingVisit,
                      leadId: e.target.value,
                      customerName: l?.companyName || editingVisit.customerName,
                      contactPerson: l?.contactPerson || editingVisit.contactPerson,
                      contactMobile: l?.mobile || editingVisit.contactMobile,
                      location: l?.address || l?.city || editingVisit.location,
                    });
                  }}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg font-semibold text-[#211B17]"
                >
                  <option value="">-- {editingVisit.customerName} --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.companyName} {l.contactPerson ? `(${l.contactPerson})` : ''} - {l.leadNo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Visit Purpose *</label>
                <input
                  type="text"
                  required
                  value={editingVisit.purpose}
                  onChange={(e) => setEditingVisit({ ...editingVisit, purpose: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Discussion Details</label>
                <textarea
                  rows={3}
                  value={editingVisit.discussionNotes}
                  onChange={(e) => setEditingVisit({ ...editingVisit, discussionNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Technical Requirement</label>
                <textarea
                  rows={3}
                  value={editingVisit.requirementDetails || ''}
                  onChange={(e) => setEditingVisit({ ...editingVisit, requirementDetails: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Business Outcome</label>
                <select
                  value={editingVisit.outcome}
                  onChange={(e) => setEditingVisit({ ...editingVisit, outcome: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg font-bold text-[#211B17]"
                >
                  <option value="positive">Positive Progress</option>
                  <option value="order_expected">Order Expected</option>
                  <option value="quotation_required">Quotation Required</option>
                  <option value="follow_up_required">Follow-up Required</option>
                  <option value="not_interested">Not Interested</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setEditingVisit(null)}
                  className="px-4 py-2 border rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
