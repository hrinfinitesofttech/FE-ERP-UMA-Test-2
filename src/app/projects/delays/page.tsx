'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import { ProjectDelay, DelayReason } from '../../../types/crm';
import { Clock, Plus, Search, AlertTriangle, ArrowRight, X, Calendar } from 'lucide-react';

export default function ProjectDelaysPage() {
  const { projectDelays, addProjectDelay, projectJobs } = useERP();
  const [selectedProjectId, setSelectedProjectId] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectId, setProjectId] = useState('PRJ-2026-0001');
  const [delayReason, setDelayReason] = useState<DelayReason>('Customer Approval');
  const [department, setDepartment] = useState('crm');
  const [taskName, setTaskName] = useState('GA Drawing Approval');
  const [delayDays, setDelayDays] = useState<number>(3);
  const [responsiblePerson, setResponsiblePerson] = useState('Customer Representative');
  const [impact, setImpact] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');

  const filteredDelays = projectDelays.filter((d) => {
    if (selectedProjectId !== 'all' && d.projectId !== selectedProjectId) return false;
    return true;
  });

  const handleLogDelay = (e: React.FormEvent) => {
    e.preventDefault();
    const prj = projectJobs.find((p) => p.id === projectId) || projectJobs[0] || {
      id: projectId || 'PRJ-2026-0001',
      projectNumber: 'PRJ-2026-0001',
      jobNumber: 'JOB-2026-0001',
      deliveryDate: new Date().toISOString().split('T')[0],
    };

    const baseDateStr = (prj as any).deliveryDate || (prj as any).targetDeliveryDate || (prj as any).target_delivery_date || new Date().toISOString().split('T')[0];
    let orig = new Date(baseDateStr);
    if (isNaN(orig.getTime())) orig = new Date();
    orig.setDate(orig.getDate() + (Number(delayDays) || 3));
    const expDateStr = orig.toISOString().split('T')[0];

    addProjectDelay({
      projectId: prj.id,
      projectNumber: prj.projectNumber,
      jobNumber: prj.jobNumber,
      delayReason,
      department,
      taskName,
      startDate: new Date().toISOString().split('T')[0],
      delayDays: Number(delayDays) || 1,
      responsiblePerson: responsiblePerson.trim() || 'Project Coordinator',
      impact: impact.trim() || `${delayDays} days schedule shift in manufacturing queue.`,
      correctiveAction: correctiveAction.trim() || 'Fast-track subsequent assembly station.',
      status: 'open',
      originalDeliveryDate: baseDateStr,
      expectedDeliveryDate: expDateStr,
    });

    setIsModalOpen(false);
    setImpact('');
    setCorrectiveAction('');
  };

  return (
    <div className="space-y-6 text-xs pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-mono text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
              Schedule Risk Mitigation
            </span>
          </div>
          <h1 className="text-lg font-black text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Project Delay & Delivery Shift Tracker
          </h1>
          <p className="text-[#70665F] dark:text-[#70665F] mt-0.5">
            Log schedule delays, calculate Revised Expected Delivery Dates, and track corrective actions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-600/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Log Delay Record
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

      {/* Delays List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDelays.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-[#70665F] space-y-2">
            <Clock className="w-10 h-10 text-amber-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No project delay records logged</h4>
            <p className="text-xs text-slate-500">All manufacturing projects are currently operating on schedule.</p>
          </div>
        ) : (
          filteredDelays.map((del) => (
            <div key={del.id} className="bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-[11px] border border-amber-500/20">
                  {del.delayNo} • {del.jobNumber}
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 font-mono font-bold text-[10px] border border-rose-500/20">
                  +{del.delayDays} Days Delay
                </span>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">
                Reason: {del.delayReason} (Dept: {del.department})
              </h3>

              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/40 space-y-1.5 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-[#70665F]">Original Target:</span>
                  <span className="line-through text-[#70665F]">{formatDate(del.originalDeliveryDate)}</span>
                </div>
                <div className="flex justify-between font-mono font-bold text-rose-600 dark:text-rose-400">
                  <span>Revised Expected Delivery:</span>
                  <span>{formatDate(del.expectedDeliveryDate)}</span>
                </div>
              </div>

              <div className="text-xs space-y-1 text-slate-600 dark:text-[#544B45]">
                <div><strong>Impact:</strong> {del.impact}</div>
                <div><strong>Corrective Action:</strong> {del.correctiveAction}</div>
                <div className="text-[10px] text-[#70665F] font-mono pt-1">Responsible: {del.responsiblePerson}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* LOG DELAY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-[#EBE3DB] bg-slate-50 dark:bg-white flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> Log Project Delay Record
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded text-[#70665F] hover:bg-slate-100 dark:hover:bg-[#FAF7F2]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogDelay} className="p-5 space-y-4">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Delay Reason</label>
                  <select
                    value={delayReason}
                    onChange={(e) => setDelayReason(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                  >
                    <option value="Customer Approval">Customer Approval</option>
                    <option value="Design Delay">Design Delay</option>
                    <option value="Material Delay">Material Delay</option>
                    <option value="Supplier Delay">Supplier Delay</option>
                    <option value="Production Delay">Production Delay</option>
                    <option value="Quality Issue">Quality Issue</option>
                    <option value="Machine Breakdown">Machine Breakdown</option>
                    <option value="Resource Issue">Resource Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Delay Days (+)</label>
                  <input
                    type="number"
                    min={1}
                    value={delayDays}
                    onChange={(e) => setDelayDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Responsible Person / Vendor</label>
                <input
                  type="text"
                  value={responsiblePerson}
                  onChange={(e) => setResponsiblePerson(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Impact & Corrective Action</label>
                <textarea
                  rows={2}
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  placeholder="Steps taken to recover lost time..."
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl"
                >
                  Submit Delay Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
