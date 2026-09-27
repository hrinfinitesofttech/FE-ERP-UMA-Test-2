'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import { ProjectMilestone } from '../../../types/crm';
import { Flag, CheckCircle2, Clock, AlertTriangle, Plus, X } from 'lucide-react';

export default function MilestonesPage() {
  const { projectMilestones, addProjectMilestone, updateProjectMilestone, projectJobs } = useERP();
  const [selectedProjectId, setSelectedProjectId] = useState('PRJ-2026-0001');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [milestoneName, setMilestoneName] = useState('Production Completed');
  const [plannedDate, setPlannedDate] = useState(new Date().toISOString().split('T')[0]);
  const [owner, setOwner] = useState('Bhavin Shah');
  const [remarks, setRemarks] = useState('');

  const activeMilestones = projectMilestones.filter(
    (m) => m.projectId === selectedProjectId || m.jobNumber === projectJobs.find((p) => p.id === selectedProjectId)?.jobNumber
  );

  const activeProject = projectJobs.find((p) => p.id === selectedProjectId) || projectJobs[0];

  const handleStatusChange = (id: string, newStatus: ProjectMilestone['status']) => {
    updateProjectMilestone(id, {
      status: newStatus,
      actualDate: newStatus === 'achieved' ? new Date().toISOString().split('T')[0] : undefined,
    });
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneName.trim()) return;

    addProjectMilestone({
      milestoneName,
      projectId: activeProject.id,
      projectNumber: activeProject.projectNumber,
      jobNumber: activeProject.jobNumber,
      plannedDate,
      owner,
      status: 'pending',
      remarks,
    });

    setIsModalOpen(false);
    setMilestoneName('');
    setRemarks('');
  };

  return (
    <div className="space-y-6 text-xs pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-600/10 text-crm-brand-600 font-mono text-[10px] font-bold uppercase tracking-wider border border-crm-brand-600/20">
              Critical Control Checkpoints
            </span>
          </div>
          <h1 className="text-lg font-black text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <Flag className="w-5 h-5 text-crm-brand-600" />
            Project Milestones Tracking
          </h1>
          <p className="text-[#70665F] dark:text-[#70665F] mt-0.5">
            Monitor key manufacturing checkpoints from Order Confirmation to Final Delivery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-xl text-xs font-bold focus:outline-none"
          >
            {projectJobs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectNumber} ({p.jobNumber}) • {p.customerName}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-crm-brand-700/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Milestone
          </button>
        </div>
      </div>

      {/* Milestones List Card */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-md overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-[#EBE3DB] flex justify-between items-center bg-slate-50 dark:bg-white">
          <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">Project Checkpoint Progression</h3>
          <span className="text-[11px] text-[#70665F] font-mono">Achieved {activeMilestones.filter((m) => m.status === 'achieved').length} of {activeMilestones.length}</span>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-[#EBE3DB]">
          {activeMilestones.map((m) => (
            <div key={m.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-white transition">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow-sm ${
                  m.status === 'achieved' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-[#FAF7F2] text-[#70665F]'
                }`}>
                  <Flag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">{m.milestoneName}</h4>
                  <div className="text-[11px] text-[#70665F]">Owner: {m.owner} {m.remarks ? `• ${m.remarks}` : ''}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right text-[11px] font-mono">
                  <div className="text-[#70665F]">Planned: {m.plannedDate}</div>
                  {m.actualDate && <div className="text-emerald-500 font-bold">Achieved: {m.actualDate}</div>}
                </div>

                <select
                  value={m.status}
                  onChange={(e) => handleStatusChange(m.id, e.target.value as any)}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold text-slate-700 dark:text-[#544B45] focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="achieved">Achieved</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD MILESTONE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-[#EBE3DB] bg-slate-50 dark:bg-white flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-sm flex items-center gap-2">
                <Flag className="w-4 h-4 text-crm-brand-600" /> Create Milestone Checkpoint
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded text-[#70665F] hover:bg-slate-100 dark:hover:bg-[#FAF7F2]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Milestone Name *</label>
                <select
                  value={milestoneName}
                  onChange={(e) => setMilestoneName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                >
                  <option value="Order Confirmed">Order Confirmed</option>
                  <option value="Design Approved">Design Approved</option>
                  <option value="BOM Approved">BOM Approved</option>
                  <option value="Material Available">Material Available</option>
                  <option value="Production Started">Production Started</option>
                  <option value="Production Completed">Production Completed</option>
                  <option value="QC Approved">QC Approved</option>
                  <option value="Dispatch">Dispatch</option>
                  <option value="Installation">Installation</option>
                  <option value="Final Completion">Final Completion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Planned Target Date *</label>
                <input
                  type="date"
                  value={plannedDate}
                  onChange={(e) => setPlannedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Owner / Responsible Lead</label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Remarks</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                />
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
                  className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-white font-bold rounded-xl"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
