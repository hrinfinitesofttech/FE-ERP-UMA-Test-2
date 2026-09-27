'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { CustomerChangeRequest } from '../../../types/crm';
import { RotateCcw, Plus, Search, CheckCircle2, XCircle, Clock, X, AlertTriangle, FileText } from 'lucide-react';

export default function CustomerChangeRequestsPage() {
  const { changeRequests, addCustomerChangeRequest, approveChangeRequest, projectJobs, can } = useERP();
  const [selectedProjectId, setSelectedProjectId] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectId, setProjectId] = useState('PRJ-2026-0001');
  const [requestedBy, setRequestedBy] = useState('Customer Representative');
  const [changeDescription, setChangeDescription] = useState('');
  const [reason, setReason] = useState('');
  const [designImpact, setDesignImpact] = useState('');
  const [materialImpact, setMaterialImpact] = useState('');
  const [costImpact, setCostImpact] = useState<number>(0);
  const [timelineImpactDays, setTimelineImpactDays] = useState<number>(0);

  const filteredCRs = changeRequests.filter((cr) => {
    if (selectedProjectId !== 'all' && cr.projectId !== selectedProjectId) return false;
    return true;
  });

  const handleCreateCR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeDescription.trim()) return;

    const prj = projectJobs.find((p) => p.id === projectId) || projectJobs[0];

    addCustomerChangeRequest({
      projectId: prj.id,
      projectNumber: prj.projectNumber,
      jobNumber: prj.jobNumber,
      customerName: prj.customerName,
      requestedBy,
      changeDescription,
      reason,
      designImpact: designImpact || 'CAD re-calculation required',
      materialImpact: materialImpact || 'Revised BOM component specs',
      costImpact: Number(costImpact) || 0,
      timelineImpactDays: Number(timelineImpactDays) || 0,
    });

    setIsModalOpen(false);
    setChangeDescription('');
    setReason('');
  };

  return (
    <div className="space-y-6 text-xs pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-500 font-mono text-[10px] font-bold uppercase tracking-wider border border-pink-500/20">
              MTO Change Governance
            </span>
          </div>
          <h1 className="text-lg font-black text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-pink-500" />
            Customer Specification Change Requests
          </h1>
          <p className="text-[#70665F] dark:text-[#70665F] mt-0.5">
            Controlled revision control for design, material, cost, and timeline modifications requested after order confirmation.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-[#211B17] font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-pink-600/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Change Request
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0B1120] p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] flex items-center justify-between gap-3">
        <span className="font-bold text-slate-700 dark:text-[#544B45]">Filter by Project:</span>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB]/80 rounded-xl text-xs font-semibold focus:outline-none"
        >
          <option value="all">All Projects</option>
          {projectJobs.map((p) => (
            <option key={p.id} value={p.id}>{p.projectNumber} ({p.jobNumber}) • {p.customerName}</option>
          ))}
        </select>
      </div>

      {/* Change Requests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCRs.map((cr) => (
          <div key={cr.id} className="bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-pink-200 dark:border-pink-900/50 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-pink-600 dark:text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded text-[11px] border border-pink-500/20">
                {cr.changeRequestNo} • {cr.jobNumber}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                cr.approvalStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}>
                {cr.approvalStatus}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">{cr.customerName}</h3>
              <div className="text-[11px] text-[#70665F] font-mono">Requested by: {cr.requestedBy} ({formatDate(cr.requestDate)})</div>
            </div>

            <p className="text-slate-700 dark:text-[#544B45] text-xs bg-slate-50 dark:bg-white p-2.5 rounded-xl border border-slate-200 dark:border-[#EBE3DB]">
              <strong>Modification Scope:</strong> {cr.changeDescription}
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono p-2.5 bg-pink-50/50 dark:bg-pink-950/20 rounded-xl border border-pink-200/50 dark:border-pink-900/40">
              <div>Cost Impact: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(cr.costImpact)}</strong></div>
              <div>Timeline Impact: <strong className="text-rose-500">+{cr.timelineImpactDays} Days</strong></div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-[#EBE3DB] flex items-center justify-between">
              <div className="text-[10px] text-[#70665F] font-mono">
                {cr.approvedBy ? `Approved by ${cr.approvedBy} on ${cr.approvedDate}` : 'Awaiting Review'}
              </div>

              {cr.approvalStatus === 'requested' && can('project', 'projects', 'approve') && (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => approveChangeRequest(cr.id, 'approved')}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => approveChangeRequest(cr.id, 'rejected')}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* NEW CHANGE REQUEST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-[#EBE3DB] bg-slate-50 dark:bg-white flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-pink-500" /> Create Customer Change Request
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded text-[#70665F] hover:bg-slate-100 dark:hover:bg-[#FAF7F2]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCR} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Target Project *</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                >
                  {projectJobs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectNumber} ({p.jobNumber}) • {p.customerName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Requested By (Customer Person)</label>
                <input
                  type="text"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Change Specification Description *</label>
                <textarea
                  rows={2}
                  value={changeDescription}
                  onChange={(e) => setChangeDescription(e.target.value)}
                  placeholder="Detail requested modifications (e.g. Upgrade agitator motor, change vessel nozzle flanges)..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Cost Impact (₹)</label>
                  <input
                    type="number"
                    value={costImpact}
                    onChange={(e) => setCostImpact(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Timeline Impact (Days)</label>
                  <input
                    type="number"
                    value={timelineImpactDays}
                    onChange={(e) => setTimelineImpactDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-[#EBE3DB] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-[#FAF7F2] text-slate-700 dark:text-[#544B45] font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-[#211B17] font-bold rounded-xl"
                >
                  Submit Change Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
