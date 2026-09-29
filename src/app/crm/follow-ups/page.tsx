'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { DataTable, Column } from '../../../components/data/DataTable';
import { FollowUp } from '../../../types/crm';
import { formatDate } from '../../../lib/utils';
import { PhoneCall, CheckCircle2, Clock, AlertTriangle, MessageSquare, Plus, X, AlertCircle, Calendar } from 'lucide-react';

export default function FollowUpsPage() {
  const { followUps, completeFollowUp, addFollowUp, customers, leads, employees, availableEmployees } = useERP();
  const [viewFilter, setViewFilter] = useState<'all' | 'today' | 'overdue'>('all');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [completeModalId, setCompleteModalId] = useState<string | null>(null);
  
  // Completion modal form state
  const [completionNotes, setCompletionNotes] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [completeError, setCompleteError] = useState('');

  // Counts
  const todayCount = followUps.filter((f) => f.date === todayStr && f.status === 'pending').length;
  const overdueCount = followUps.filter((f) => f.date < todayStr && f.status === 'pending').length;
  const allCount = followUps.length;

  // Add Follow-up form state
  const allStaff = availableEmployees && availableEmployees.length > 0 ? availableEmployees : employees || [];
  const [targetType, setTargetType] = useState<'lead' | 'customer'>('lead');
  const [targetId, setTargetId] = useState(leads[0]?.id || '');
  const [followUpType, setFollowUpType] = useState<'call' | 'email' | 'meeting' | 'whatsapp' | 'visit'>('call');
  const [scheduledDate, setScheduledDate] = useState(todayStr);
  const [scheduledTime, setScheduledTime] = useState('11:00 AM');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [assignedToId, setAssignedToId] = useState(allStaff[0]?.id || 'EMP-001');
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  const filteredFollowUps = followUps.filter((f) => {
    if (viewFilter === 'today') return f.date === todayStr && f.status === 'pending';
    if (viewFilter === 'overdue') return f.date < todayStr && f.status === 'pending';
    return true;
  });

  const handleComplete = (id: string) => {
    if (!completionNotes.trim()) {
      setCompleteError('Discussion outcome / summary is required.');
      return;
    }
    if (nextFollowUpDate && nextFollowUpDate < todayStr) {
      setCompleteError('Next follow-up date cannot be in the past.');
      return;
    }

    completeFollowUp(id, completionNotes.trim(), nextFollowUpDate);
    setCompleteModalId(null);
    setCompletionNotes('');
    setCompleteError('');
  };

  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!purpose.trim()) {
      errs.purpose = 'Discussion purpose is required.';
    }

    if (!scheduledDate) {
      errs.scheduledDate = 'Scheduled date is required.';
    } else if (scheduledDate < todayStr) {
      errs.scheduledDate = 'Follow-up date cannot be in the past.';
    }

    if (Object.keys(errs).length > 0) {
      setAddErrors(errs);
      return;
    }

    let targetName = 'Client';
    let customerId: string | undefined;
    let leadId: string | undefined;

    if (targetType === 'lead') {
      const selectedLead = leads.find((l) => l.id === targetId) || leads[0];
      targetName = selectedLead ? `${selectedLead.companyName} (${selectedLead.contactPerson})` : 'New Lead';
      leadId = selectedLead?.id;
    } else {
      const selectedCust = customers.find((c) => c.id === targetId) || customers[0];
      targetName = selectedCust ? `${selectedCust.companyName} (${selectedCust.contactPerson})` : 'Customer';
      customerId = selectedCust?.id;
    }

    const assignedStaff = allStaff.find((s) => s.id === assignedToId);
    const assignedName = assignedStaff ? (assignedStaff.name || `${assignedStaff.firstName || ''} ${assignedStaff.lastName || ''}`.trim()) : 'Sales Team';

    const newFollowUpItem: FollowUp = {
      id: `FU-${Date.now()}`,
      followUpNo: `FLW-2026-${Math.floor(100 + Math.random() * 900)}`,
      leadOrCustomerId: (targetType === 'lead' ? leadId : customerId) || 'ID-001',
      leadOrCustomerName: targetName,
      entityType: targetType,
      type: followUpType,
      assignedToId,
      assignedToName: assignedName,
      date: scheduledDate,
      time: scheduledTime,
      priority: 'medium',
      purpose: purpose.trim(),
      notes: notes.trim(),
      status: 'pending',
    };

    addFollowUp(newFollowUpItem);
    setShowAddModal(false);
    setPurpose('');
    setNotes('');
    setAddErrors({});
  };

  const columns: Column<FollowUp>[] = [
    {
      header: 'Follow-up #',
      accessorKey: 'followUpNo',
      cell: (f) => <span className="font-mono font-bold text-crm-brand-700">{f.followUpNo}</span>,
    },
    {
      header: 'Lead / Customer',
      accessorKey: 'leadOrCustomerName',
      cell: (f) => <span className="font-bold text-slate-900 dark:text-[#211B17]">{f.leadOrCustomerName}</span>,
    },
    {
      header: 'Type',
      cell: (f) => (
        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
          {f.type}
        </span>
      ),
    },
    {
      header: 'Scheduled Date & Time',
      cell: (f) => (
        <div className="font-mono">
          <span className="font-semibold block">{formatDate(f.date)}</span>
          <span className="text-[10px] text-[#70665F]">{f.time}</span>
        </div>
      ),
    },
    {
      header: 'Discussion Purpose & Notes',
      cell: (f) => (
        <div className="max-w-xs">
          <span className="font-medium text-slate-800 dark:text-[#544B45] block truncate">{f.purpose}</span>
          <span className="text-[10px] text-[#70665F] block truncate">{f.notes}</span>
        </div>
      ),
    },
    {
      header: 'Assigned To',
      accessorKey: 'assignedToName',
    },
    {
      header: 'Status',
      cell: (f) => (
        <span
          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
            f.status === 'completed'
              ? 'bg-emerald-100 text-emerald-800'
              : f.date < todayStr
              ? 'bg-rose-100 text-rose-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {f.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (f) =>
        f.status === 'pending' ? (
          <button
            onClick={() => {
              setCompleteModalId(f.id);
              setCompletionNotes('');
              setCompleteError('');
            }}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark Done</span>
          </button>
        ) : (
          <span className="text-[11px] text-[#70665F] font-mono">Completed</span>
        ),
    },
  ];

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-crm-brand-700" />
            Follow-up & Communication Management
          </h1>
          <p className="text-[#70665F] mt-0.5">
            Call logs, WhatsApp interactions, and client meeting schedules with automated alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewFilter('today')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              viewFilter === 'today' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Today&apos;s Follow-ups</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${viewFilter === 'today' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'}`}>
              {todayCount}
            </span>
          </button>
          <button
            onClick={() => setViewFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              viewFilter === 'overdue' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Overdue</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${viewFilter === 'overdue' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-900'}`}>
              {overdueCount}
            </span>
          </button>
          <button
            onClick={() => setViewFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              viewFilter === 'all' ? 'bg-crm-brand-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>All Follow-ups</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${viewFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-900'}`}>
              {allCount}
            </span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-[#3E2723] hover:bg-[#2C1810] text-white rounded-lg font-bold flex items-center gap-1 shadow-xs cursor-pointer ml-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Follow-up</span>
          </button>
        </div>
      </div>

      <DataTable
        title={viewFilter === 'today' ? "Today's Follow-up Schedule" : viewFilter === 'overdue' ? 'Overdue Follow-ups' : 'All Follow-up Records'}
        columns={columns}
        data={filteredFollowUps}
      />

      {/* SCHEDULE NEW FOLLOW-UP MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-crm-brand-700" />
                Schedule New Client Follow-up
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFollowUp} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Target Type</label>
                  <select
                    value={targetType}
                    onChange={(e) => {
                      const type = e.target.value as 'lead' | 'customer';
                      setTargetType(type);
                      setTargetId(type === 'lead' ? (leads[0]?.id || '') : (customers[0]?.id || ''));
                    }}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17]"
                  >
                    <option value="lead">Sales Lead</option>
                    <option value="customer">Existing Customer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Select Account</label>
                  <select
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17]"
                  >
                    {targetType === 'lead'
                      ? leads.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.companyName} - {l.contactPerson}
                          </option>
                        ))
                      : customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.companyName} ({c.customerCode})
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Follow-up Type</label>
                  <select
                    value={followUpType}
                    onChange={(e) => setFollowUpType(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17]"
                  >
                    <option value="call">Phone Call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="meeting">In-Person Meeting</option>
                    <option value="visit">Site Visit</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Date (No Past Dates) *</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={scheduledDate}
                    onChange={(e) => {
                      setScheduledDate(e.target.value);
                      if (addErrors.scheduledDate) setAddErrors(prev => ({ ...prev, scheduledDate: '' }));
                    }}
                    className={`w-full bg-[#FAF7F2] border rounded-lg px-3 py-2 text-[#211B17] font-mono ${
                      addErrors.scheduledDate ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                    }`}
                  />
                  {addErrors.scheduledDate && (
                    <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {addErrors.scheduledDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Time</label>
                  <input
                    type="text"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    placeholder="11:00 AM"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Discussion Purpose *</label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => {
                    setPurpose(e.target.value);
                    if (addErrors.purpose) setAddErrors(prev => ({ ...prev, purpose: '' }));
                  }}
                  placeholder="e.g. Commercial negotiation on Reactor Vessel Qty 2"
                  className={`w-full bg-[#FAF7F2] border rounded-lg px-3 py-2 text-[#211B17] font-semibold ${
                    addErrors.purpose ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                  }`}
                />
                {addErrors.purpose && (
                  <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {addErrors.purpose}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Assigned Sales Engineer</label>
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17]"
                >
                  {allStaff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim()} ({s.department || s.departmentName || 'CRM'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional context or background points for the discussion..."
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg font-semibold text-[#544B45]"
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

      {/* COMPLETION MODAL */}
      {completeModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Log Follow-up Outcome
              </h3>
              <button onClick={() => setCompleteModalId(null)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {completeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{completeError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Discussion Summary / Outcome *</label>
                <textarea
                  rows={3}
                  required
                  value={completionNotes}
                  onChange={(e) => {
                    setCompletionNotes(e.target.value);
                    if (completeError) setCompleteError('');
                  }}
                  placeholder="Customer agreed on delivery timeline, requested revised commercial terms..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Schedule Next Action Date (Cannot be past date)</label>
                <input
                  type="date"
                  min={todayStr}
                  value={nextFollowUpDate}
                  onChange={(e) => {
                    setNextFollowUpDate(e.target.value);
                    if (completeError) setCompleteError('');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompleteModalId(null)}
                  className="px-4 py-2 border rounded-lg font-semibold text-[#544B45]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleComplete(completeModalId)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Save & Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
