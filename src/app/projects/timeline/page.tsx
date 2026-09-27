'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import { Clock, Calendar, CheckCircle2, AlertTriangle, Layers, Flag, Users, Cpu } from 'lucide-react';

export default function ProjectTimelinePage() {
  const { projectTasks, projectMilestones, projectJobs } = useERP();
  const [selectedProjectId, setSelectedProjectId] = useState('PRJ-2026-0001');

  const activeProject = projectJobs.find((p) => p.id === selectedProjectId) || projectJobs[0];

  const tasks = projectTasks.filter((t) => t.projectId === activeProject.id || t.jobNumber === activeProject.jobNumber);
  const milestones = projectMilestones.filter((m) => m.projectId === activeProject.id || m.jobNumber === activeProject.jobNumber);

  const statusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'achieved':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold uppercase text-[10px]">Status: Completed</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded bg-crm-brand-600/10 text-crm-brand-600 border border-crm-brand-600/20 font-bold uppercase text-[10px]">Status: In Progress</span>;
      case 'delayed':
        return <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold uppercase text-[10px]">Status: Delayed</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-500/10 text-[#70665F] border border-slate-500/20 font-bold uppercase text-[10px]">Status: Pending</span>;
    }
  };

  return (
    <div className="space-y-6 text-xs pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 font-mono text-[10px] font-bold uppercase tracking-wider border border-orange-500/20">
              Gantt & Schedule Visualizer
            </span>
          </div>
          <h1 className="text-lg font-black text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Visual Project Gantt Timeline
          </h1>
          <p className="text-[#70665F] dark:text-[#70665F] mt-0.5">
            Graphical schedule showing tasks, milestones, department assignments, and dependency chains.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#70665F] font-bold">Select Project:</span>
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
        </div>
      </div>

      {/* Project Summary Banner */}
      {activeProject && (
        <div className="bg-white text-[#211B17] p-4 rounded-xl border border-[#EBE3DB] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-xs font-bold text-amber-400">{activeProject.customerName}</div>
            <div className="text-sm font-black">{activeProject.productName}</div>
            <div className="text-[11px] text-[#70665F] font-mono mt-0.5">
              Start: {formatDate(activeProject.startDate)} | Target Delivery: {formatDate(activeProject.deliveryDate)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-[#70665F] block">Overall Progress</span>
              <span className="text-base font-black text-emerald-400 font-mono">{activeProject.progressPercent}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Visual Gantt Chart Representation */}
      <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-md p-5 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#EBE3DB] pb-3">
          <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">Tasks Timeline & Progress Bars</h3>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-crm-brand-600" /> In Progress</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-[#FAF7F2]" /> Pending</span>
          </div>
        </div>

        {/* Task Timeline Rows */}
        <div className="space-y-4">
          {tasks.map((task) => {
            const depTask = projectTasks.find((pt) => pt.id === task.dependentTaskId);
            return (
              <div key={task.id} className="p-4 bg-slate-50 dark:bg-white rounded-xl border border-slate-200 dark:border-[#EBE3DB] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-crm-brand-700 dark:text-crm-brand-500 text-xs">{task.taskNumber}</span>
                      <h4 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">{task.taskName}</h4>
                      {statusBadge(task.status)}
                    </div>
                    <div className="text-[11px] text-[#70665F] mt-0.5">
                      Dept: <span className="uppercase font-mono text-crm-brand-500 font-bold">{task.department}</span> | Assignee: <strong className="text-[#544B45]">{task.assignedTo}</strong>
                    </div>
                  </div>

                  <div className="text-right text-[11px] font-mono text-[#70665F]">
                    <div>{task.startDate} → {task.dueDate}</div>
                    <div className="font-bold text-crm-brand-500">{task.completionPercent}% Completed</div>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="w-full bg-slate-200 dark:bg-[#FAF7F2] h-3 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      task.status === 'completed' ? 'bg-emerald-500' : task.status === 'in_progress' ? 'bg-crm-brand-600' : 'bg-slate-400'
                    }`}
                    style={{ width: `${task.completionPercent}%` }}
                  />
                </div>

                {depTask && (
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono pt-1">
                    ↳ Prerequisite Task: {depTask.taskNumber} ({depTask.taskName}) — Status: {depTask.status}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Milestones Schedule Section */}
        <div className="pt-4 border-t border-slate-200 dark:border-[#EBE3DB] space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs flex items-center gap-2">
            <Flag className="w-4 h-4 text-crm-brand-600" /> Key Milestones Timeline
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {milestones.map((m) => (
              <div key={m.id} className="p-3 bg-slate-50 dark:bg-[#FAF7F2] rounded-xl border border-slate-200 dark:border-[#EBE3DB] space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <strong className="text-slate-900 dark:text-[#211B17]">{m.milestoneName}</strong>
                  {statusBadge(m.status)}
                </div>
                <div className="text-[10px] text-[#70665F] font-mono">Target: {m.plannedDate}</div>
                <div className="text-[10px] text-[#70665F]">Owner: {m.owner}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
