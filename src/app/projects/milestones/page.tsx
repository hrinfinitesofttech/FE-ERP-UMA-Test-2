'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import { ProjectMilestone } from '../../../types/crm';
import { Flag, CheckCircle2, Clock, AlertTriangle, Plus, X, Calendar, UserCheck, ShieldCheck } from 'lucide-react';

export default function MilestonesPage() {
  const { projectMilestones, addProjectMilestone, updateProjectMilestone, projectJobs, availableEmployees = [] } = useERP();
  const [selectedProjectId, setSelectedProjectId] = useState(projectJobs[0]?.id || 'PRJ-2026-0001');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [milestoneName, setMilestoneName] = useState('Production Completed');
  const [plannedDate, setPlannedDate] = useState(new Date().toISOString().split('T')[0]);
  const [owner, setOwner] = useState(
    availableEmployees[0]
      ? `${availableEmployees[0].firstName || ''} ${availableEmployees[0].lastName || ''}`.trim() || availableEmployees[0].name || 'Bhavin Shah'
      : 'Bhavin Shah'
  );
  const [remarks, setRemarks] = useState('');

  const activeProject = projectJobs.find((p) => p.id === selectedProjectId) || projectJobs[0];

  const activeMilestones = projectMilestones.filter(
    (m) =>
      m.projectId === selectedProjectId ||
      (activeProject && m.jobNumber === activeProject.jobNumber) ||
      (activeProject && m.projectNumber === activeProject.projectNumber)
  );

  const handleStatusChange = (id: string, newStatus: ProjectMilestone['status']) => {
    updateProjectMilestone(id, {
      status: newStatus,
      actualDate: (newStatus as string) === 'achieved' || (newStatus as string) === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
    });
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneName.trim()) return;

    addProjectMilestone({
      milestoneName,
      projectId: activeProject?.id || 'PRJ-2026-0001',
      projectNumber: activeProject?.projectNumber || 'PRJ-2026-0001',
      jobNumber: activeProject?.jobNumber || 'JOB-2026-0001',
      plannedDate,
      owner: owner || 'Bhavin Shah',
      status: 'pending',
      remarks,
    });

    setIsModalOpen(false);
    setMilestoneName('Production Completed');
    setRemarks('');
  };

  const achievedCount = activeMilestones.filter((m) => (m.status as string) === 'achieved' || (m.status as string) === 'completed').length;

  return (
    <div className="space-y-6 text-xs pb-12">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#5C3A21] border border-[#EBE3DB] font-mono text-[10px] font-bold uppercase tracking-wider">
              Critical Control Checkpoints
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <div className="p-2 bg-[#FAF7F2] text-[#5C3A21] rounded-xl border border-[#EBE3DB]">
              <Flag className="w-5 h-5" />
            </div>
            Project Milestones & Gate Reviews
          </h1>
          <p className="text-[#70665F] mt-1 text-xs">
            Monitor key make-to-order manufacturing checkpoints from Order Confirmation to Final Inspection & Dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
          >
            {projectJobs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectNumber} ({p.jobNumber}) • {p.customerName}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#3E2723] hover:bg-[#2C1810] text-white font-bold rounded-xl flex items-center gap-2 shadow-xs transition cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4" /> Add Milestone
          </button>
        </div>
      </div>

      {/* Milestones List Card */}
      <div className="bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-xs">Project Checkpoint Progression</h3>
            <p className="text-[11px] text-[#70665F]">Target Project: {activeProject?.projectNumber} ({activeProject?.jobNumber})</p>
          </div>
          <span className="text-[11px] text-[#5C3A21] font-mono font-bold bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#EBE3DB]">
            Achieved {achievedCount} of {activeMilestones.length} Gates
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {activeMilestones.map((m) => {
            const isAchieved = (m.status as string) === 'achieved' || (m.status as string) === 'completed';
            const mName = m.milestoneName || (m as any).title || (m as any).name || 'Manufacturing Checkpoint';
            const mOwner = m.owner || (m as any).responsiblePerson || (m as any).assigned_employee_name || 'Bhavin Shah';
            const mPlanned = m.plannedDate || (m as any).target_date || (m as any).targetDate || '2026-11-20';

            return (
              <div key={m.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-xs ${
                    isAchieved ? 'bg-emerald-500 text-white' : 'bg-[#FAF7F2] text-[#5C3A21] border border-[#EBE3DB]'
                  }`}>
                    {isAchieved ? <CheckCircle2 className="w-5 h-5" /> : <Flag className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      {mName}
                      {(m as any).milestone_code && (
                        <span className="font-mono text-[10px] text-[#70665F] bg-slate-100 px-1.5 py-0.5 rounded">
                          {(m as any).milestone_code}
                        </span>
                      )}
                    </h4>
                    <div className="text-[11px] text-[#70665F] flex items-center gap-1.5 mt-0.5">
                      <span>Owner: <strong className="text-slate-800">{mOwner}</strong></span>
                      {m.remarks && <span>• {m.remarks}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-[11px] font-mono">
                    <div className="text-[#70665F]">Planned: <strong className="text-slate-800">{formatDate(mPlanned)}</strong></div>
                    {m.actualDate && <div className="text-emerald-700 font-bold">Achieved: {formatDate(m.actualDate)}</div>}
                  </div>

                  <select
                    value={m.status || 'pending'}
                    onChange={(e) => handleStatusChange(m.id, e.target.value as any)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="achieved">Achieved / Completed</option>
                    <option value="delayed">Delayed</option>
                    <option value="in_progress">In Progress</option>
                  </select>
                </div>
              </div>
            );
          })}

          {activeMilestones.length === 0 && (
            <div className="p-10 text-center text-[#70665F] space-y-2">
              <Flag className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800">No milestones configured for this project</h4>
              <p className="text-xs">Click &ldquo;Add Milestone&rdquo; above to create critical production gates.</p>
            </div>
          )}
        </div>
      </div>

      {/* ADD MILESTONE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Flag className="w-4 h-4 text-[#5C3A21]" /> Create Milestone Checkpoint
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded text-[#70665F] hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Project</label>
                <div className="p-2.5 bg-slate-50 border rounded-xl font-bold text-slate-800">
                  {activeProject?.projectNumber} ({activeProject?.jobNumber}) • {activeProject?.customerName}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Milestone Name *</label>
                <select
                  value={milestoneName}
                  onChange={(e) => setMilestoneName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="Order Confirmed & Kickoff">Order Confirmed & Kickoff</option>
                  <option value="Customer Design Approval (GA)">Customer Design Approval (GA)</option>
                  <option value="BOM & Raw Material Arrival">BOM & Raw Material Arrival</option>
                  <option value="Shell Rolling & Long-Seam Welded">Shell Rolling & Long-Seam Welded</option>
                  <option value="Fabrication Completed">Fabrication Completed</option>
                  <option value="Hydro Test & NDT Inspection Cleared">Hydro Test & NDT Inspection Cleared</option>
                  <option value="Surface Painting & Mirror Polishing">Surface Painting & Mirror Polishing</option>
                  <option value="Customer Final Inspection (FAT)">Customer Final Inspection (FAT)</option>
                  <option value="Dispatch Handover & Invoiced">Dispatch Handover & Invoiced</option>
                  <option value="Final Site Handover">Final Site Handover</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Planned Target Date *</label>
                <input
                  type="date"
                  required
                  value={plannedDate}
                  onChange={(e) => setPlannedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Owner / Responsible Lead</label>
                <select
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  {availableEmployees.map((emp) => {
                    const empName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || emp.id;
                    const empDept = emp.department || emp.departmentName || 'Staff';
                    return (
                      <option key={emp.id} value={empName}>
                        {empName} ({empDept})
                      </option>
                    );
                  })}
                  {availableEmployees.length === 0 && (
                    <>
                      <option value="Bhavin Shah">Bhavin Shah (Production)</option>
                      <option value="Dharmesh Joshi">Dharmesh Joshi (Design)</option>
                      <option value="Pravin Patel">Pravin Patel (CRM)</option>
                      <option value="Ketan Patel">Ketan Patel (QA)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Remarks / Quality Criteria</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Gate pass conditions, hydro test pressure, NDT criteria..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3E2723] hover:bg-[#2C1810] text-white font-bold rounded-xl shadow-xs"
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
