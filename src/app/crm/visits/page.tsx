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
  const { siteVisits, addSiteVisit, updateSiteVisit, deleteSiteVisit, customers, leads, employees } = useERP();

  const [showModal, setShowModal] = useState(false);
  const [viewingVisit, setViewingVisit] = useState<SiteVisit | null>(null);
  const [editingVisit, setEditingVisit] = useState<SiteVisit | null>(null);

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [customerName, setCustomerName] = useState(customers[0]?.companyName || '');
  const [contactPerson, setContactPerson] = useState(customers[0]?.contactPerson || '');
  const [contactMobile, setContactMobile] = useState(customers[0]?.mobile || '');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState(customers[0]?.city || 'Client Plant Site');
  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
  const [purpose, setPurpose] = useState('');
  const [discussionNotes, setDiscussionNotes] = useState('');
  const [requirementDetails, setRequirementDetails] = useState('');
  const [outcome, setOutcome] = useState<SiteVisit['outcome']>('positive');
  const [nextAction, setNextAction] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');

  // Auto-fill when customer changes in modal
  const handleCustomerChange = (cId: string) => {
    setCustomerId(cId);
    const foundCust = customers.find((c) => c.id === cId);
    if (foundCust) {
      setCustomerName(foundCust.companyName);
      setContactPerson(foundCust.contactPerson || '');
      setContactMobile(foundCust.mobile || foundCust.whatsapp || '');
      setLocation(`${foundCust.city || ''}, ${foundCust.state || ''}`.trim() || 'Client Site');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId);
    const emp = employees.find((e) => e.id === employeeId);

    addSiteVisit({
      customerId,
      customerName: cust?.companyName || customerName || 'Valued Customer',
      contactPerson,
      contactMobile,
      visitDate,
      location,
      employeeId,
      employeeName: emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : 'Sales Engineer',
      purpose,
      discussionNotes,
      requirementDetails,
      outcome,
      nextAction,
      nextFollowUpDate: nextFollowUpDate || undefined,
    });

    // Reset form
    setPurpose('');
    setDiscussionNotes('');
    setRequirementDetails('');
    setNextAction('');
    setNextFollowUpDate('');
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
            if (customers.length > 0 && !customerId) {
              handleCustomerChange(customers[0].id);
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

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Customer / Client *</label>
                  <select
                    value={customerId}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg font-semibold text-[#211B17]"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Visiting Engineer *</label>
                  <select
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.designation || 'Engineer'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Harish Trivedi"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Contact Mobile</label>
                  <input
                    type="tel"
                    value={contactMobile}
                    onChange={(e) => setContactMobile(e.target.value)}
                    placeholder="+91 98250 XXXXX"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Visit Date *</label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Location / Plant Address *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Dahej Plant 2, Bay 4"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Visit Purpose *</label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Foundation civil layout & nozzle orientation check"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Discussion Details & Observations</label>
                <textarea
                  rows={2}
                  value={discussionNotes}
                  onChange={(e) => setDiscussionNotes(e.target.value)}
                  placeholder="Technical findings, crane reach, foundation pad measurements..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Customer Technical Requirements</label>
                <textarea
                  rows={2}
                  value={requirementDetails}
                  onChange={(e) => setRequirementDetails(e.target.value)}
                  placeholder="Special client modifications or statutory requirements..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Business Outcome</label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg font-bold text-[#211B17]"
                  >
                    <option value="positive">Positive Progress</option>
                    <option value="order_expected">Order Expected</option>
                    <option value="quotation_required">Quotation Required</option>
                    <option value="follow_up_required">Follow-up Required</option>
                    <option value="not_interested">Not Interested</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Next Follow-Up Date</label>
                  <input
                    type="date"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Next Action Plan</label>
                <input
                  type="text"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="e.g. Update GA drawing Rev 02 and submit revised BOM"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
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
                  Save & Sync Visit
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

            <form onSubmit={handleUpdate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={editingVisit.contactPerson}
                    onChange={(e) => setEditingVisit({ ...editingVisit, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Mobile</label>
                  <input
                    type="tel"
                    value={editingVisit.contactMobile}
                    onChange={(e) => setEditingVisit({ ...editingVisit, contactMobile: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Visit Date</label>
                  <input
                    type="date"
                    required
                    value={editingVisit.visitDate}
                    onChange={(e) => setEditingVisit({ ...editingVisit, visitDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={editingVisit.location}
                    onChange={(e) => setEditingVisit({ ...editingVisit, location: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Purpose</label>
                <input
                  type="text"
                  required
                  value={editingVisit.purpose}
                  onChange={(e) => setEditingVisit({ ...editingVisit, purpose: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Discussion Details & Observations</label>
                <textarea
                  rows={2}
                  value={editingVisit.discussionNotes}
                  onChange={(e) => setEditingVisit({ ...editingVisit, discussionNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Outcome</label>
                  <select
                    value={editingVisit.outcome}
                    onChange={(e) => setEditingVisit({ ...editingVisit, outcome: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg font-bold"
                  >
                    <option value="positive">Positive Progress</option>
                    <option value="order_expected">Order Expected</option>
                    <option value="quotation_required">Quotation Required</option>
                    <option value="follow_up_required">Follow-up Required</option>
                    <option value="not_interested">Not Interested</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Next Follow-Up Date</label>
                  <input
                    type="date"
                    value={editingVisit.nextFollowUpDate || ''}
                    onChange={(e) => setEditingVisit({ ...editingVisit, nextFollowUpDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Next Action</label>
                <input
                  type="text"
                  value={editingVisit.nextAction}
                  onChange={(e) => setEditingVisit({ ...editingVisit, nextAction: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg"
                />
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
