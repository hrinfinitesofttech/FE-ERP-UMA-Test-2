'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  FileText,
  DollarSign,
  AlertCircle,
  Filter,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';

export default function ApprovalCenterPage() {
  const { centralApprovals, approveCentralItem, rejectCentralItem, currentUser } = useERP();
  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState<string>('');

  const categories = [
    'all',
    'Quotation',
    'Purchase Order',
    'BOM',
    'Leave',
    'Invoice',
    'Sales Order',
    'Material Issue',
    'Production Hold',
  ];

  const filteredApprovals = centralApprovals.filter((app) => {
    const matchesTab = app.status === activeTab;
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesTab && matchesCategory;
  });

  const handleApprove = (id: string) => {
    approveCentralItem(id, `${currentUser.firstName} ${currentUser.lastName} (${currentUser.roleName})`);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectingId && rejectRemarks.trim()) {
      rejectCentralItem(rejectingId, rejectRemarks);
      setRejectingId(null);
      setRejectRemarks('');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[color:var(--crm-bg-app)]  text-[color:var(--crm-text-secondary)] font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[color:var(--crm-text-primary)] tracking-tight">Central ERP Approval Inbox</h1>
              <p className="text-xs text-[color:var(--crm-text-secondary)] font-medium mt-0.5">
                Unified Governance & Sign-Off Center for Quotations, POs, BOMs, Invoices, Leaves & Adjustments
              </p>
            </div>
          </div>
        </div>

        {/* Tab Status Buttons */}
        <div className="flex items-center gap-2 bg-[color:var(--crm-bg-app)] p-1.5 rounded-xl border border-[color:var(--crm-border-default)]">
          {(['Pending', 'Approved', 'Rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === tab
                  ? tab === 'Pending'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : tab === 'Approved'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-rose-600 text-white shadow-md'
                  : 'text-[color:var(--crm-text-secondary)] hover:text-[color:var(--crm-text-primary)]'
              }`}
            >
              {tab} ({centralApprovals.filter((a) => a.status === tab).length})
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin p-1 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)]">
        <span className="text-xs text-[color:var(--crm-text-secondary)] font-semibold px-3">Filter Category:</span>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
              selectedCategory === c ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/40' : 'text-[color:var(--crm-text-secondary)] hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.length === 0 ? (
          <div className="p-12 text-center bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-2xl space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
            <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)]">No {activeTab} Approvals Found</h3>
            <p className="text-xs text-[color:var(--crm-text-secondary)]">All requests in this category have been processed.</p>
          </div>
        ) : (
          filteredApprovals.map((app) => (
            <div
              key={app.id}
              className="p-6 bg-white border border-[color:var(--crm-border-default)] hover:border-[color:var(--crm-border-default)] rounded-2xl space-y-4 shadow-xl transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[color:var(--crm-border-default)] pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 text-xs font-bold border border-emerald-500/20">
                    {app.category}
                  </span>
                  <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)]">{app.title}</h3>
                  <span className="text-xs font-mono text-crm-brand-500">({app.recordNumber})</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  {app.amount && <span className="font-bold text-emerald-700">Amount: ₹{app.amount?.toLocaleString()}</span>}
                  <span className="text-[color:var(--crm-text-secondary)]">Job: <strong className="text-[color:var(--crm-text-primary)]">{app.relatedJobNumber}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[color:var(--crm-text-secondary)]">
                <div>
                  <span className="text-[color:var(--crm-text-secondary)] block">Requester:</span>
                  <span className="font-semibold text-[color:var(--crm-text-primary)]">{app.requesterName} ({app.requesterRole})</span>
                </div>
                <div>
                  <span className="text-[color:var(--crm-text-secondary)] block">Date & Urgency:</span>
                  <span className="font-semibold text-amber-700">{app.requestDate} • {app.urgency} Urgency</span>
                </div>
                <div>
                  <span className="text-[color:var(--crm-text-secondary)] block">Remarks / Context:</span>
                  <span className="text-[color:var(--crm-text-secondary)]">{app.remarks}</span>
                </div>
              </div>

              {/* Action Buttons for Pending */}
              {app.status === 'Pending' && (
                <div className="flex justify-end gap-3 pt-2 border-t border-[color:var(--crm-border-default)]">
                  <button
                    onClick={() => setRejectingId(app.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl border border-rose-200 shadow-xs transition cursor-pointer"
                  >
                    <X className="w-4 h-4" /> Reject Request
                  </button>
                  <button
                    onClick={() => handleApprove(app.id)}
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    <Check className="w-4 h-4" /> Approve Now
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reject Remarks Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-[color:var(--crm-bg-app)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRejectSubmit} className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-rose-700 flex items-center gap-2">
              <XCircle className="w-5 h-5" /> Reject Approval Request ({rejectingId})
            </h3>
            <p className="text-xs text-[color:var(--crm-text-secondary)]">Please state the official reason for rejection:</p>
            <textarea
              required
              rows={3}
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              placeholder="e.g. Budget limit exceeded, requires revision..."
              className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl p-3 text-xs text-[color:var(--crm-text-secondary)] focus:border-rose-500 outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 text-xs text-[color:var(--crm-text-secondary)] hover:text-[color:var(--crm-text-primary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
