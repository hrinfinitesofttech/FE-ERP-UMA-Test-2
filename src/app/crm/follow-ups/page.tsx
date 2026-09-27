'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { DataTable, Column } from '../../../components/data/DataTable';
import { FollowUp } from '../../../types/crm';
import { formatDate } from '../../../lib/utils';
import { PhoneCall, CheckCircle2, Clock, AlertTriangle, MessageSquare, Plus } from 'lucide-react';

export default function FollowUpsPage() {
  const { followUps, completeFollowUp, addFollowUp, customers, leads, employees } = useERP();
  const [viewFilter, setViewFilter] = useState<'all' | 'today' | 'overdue'>('today');
  const [showModal, setShowModal] = useState(false);
  const [completeModalId, setCompleteModalId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('2026-09-30');

  const todayStr = '2026-09-23';

  const filteredFollowUps = followUps.filter((f) => {
    if (viewFilter === 'today') return f.date === todayStr && f.status === 'pending';
    if (viewFilter === 'overdue') return f.date < todayStr && f.status === 'pending';
    return true;
  });

  const handleComplete = (id: string) => {
    completeFollowUp(id, completionNotes || 'Discussion completed successfully.', nextFollowUpDate);
    setCompleteModalId(null);
    setCompletionNotes('');
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
            onClick={() => setCompleteModalId(f.id)}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1"
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
            className={`px-3 py-1.5 rounded-lg font-bold ${
              viewFilter === 'today' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Today&apos;s Follow-ups
          </button>
          <button
            onClick={() => setViewFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg font-bold ${
              viewFilter === 'overdue' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Overdue
          </button>
          <button
            onClick={() => setViewFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold ${
              viewFilter === 'all' ? 'bg-crm-brand-700 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            All Follow-ups
          </button>
        </div>
      </div>

      <DataTable
        title={viewFilter === 'today' ? "Today's Follow-up Schedule" : viewFilter === 'overdue' ? 'Overdue Follow-ups' : 'All Follow-up Records'}
        columns={columns}
        data={filteredFollowUps}
      />

      {/* Completion Modal */}
      {completeModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm">
          <div className="bg-white dark:bg-white border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#211B17]">Log Follow-up Outcome</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Discussion Summary / Outcome *</label>
                <textarea
                  rows={3}
                  required
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Customer agreed on delivery timeline, requested revised commercial terms..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Schedule Next Action Date</label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompleteModalId(null)}
                  className="px-4 py-2 border rounded-lg font-semibold"
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
