'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import { ProjectIssue, IssueType } from '../../../types/crm';
import { AlertTriangle, Plus, Search, CheckCircle2, Clock, X, ShieldAlert } from 'lucide-react';

export default function ProjectIssuesPage() {
  const { projectIssues, addProjectIssue, resolveProjectIssue, projectJobs } = useERP();
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectId, setProjectId] = useState('PRJ-2026-0001');
  const [department, setDepartment] = useState('production');
  const [issueType, setIssueType] = useState<IssueType>('Quality Issue');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [assignedTo, setAssignedTo] = useState('Bhavin Shah');
  const [dueDate, setDueDate] = useState('');

  const [resolveModalId, setResolveModalId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const filteredIssues = projectIssues.filter((i) => {
    if (selectedProjectId !== 'all' && i.projectId !== selectedProjectId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery?.toLowerCase();
      return (
        i.issueNo?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.jobNumber?.toLowerCase().includes(q) ||
        i.issueType?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const prj = projectJobs.find((p) => p.id === projectId) || projectJobs[0];

    addProjectIssue({
      projectId: prj.id,
      projectNumber: prj.projectNumber,
      jobNumber: prj.jobNumber,
      department,
      issueType,
      description,
      priority,
      reportedBy: 'Bhavin Shah',
      assignedTo,
      dueDate: dueDate || prj.deliveryDate,
      status: 'open',
    });

    setIsModalOpen(false);
    setDescription('');
  };

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalId || !resolutionText.trim()) return;
    resolveProjectIssue(resolveModalId, resolutionText);
    setResolveModalId(null);
    setResolutionText('');
  };

  return (
    <div className="space-y-6 text-xs pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-mono text-[10px] font-bold uppercase tracking-wider border border-rose-500/20">
              Risk & Bottleneck Control
            </span>
          </div>
          <h1 className="text-lg font-black text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            Project Issues & Quality Ticket Management
          </h1>
          <p className="text-[#70665F] dark:text-[#70665F] mt-0.5">
            Log and resolve design issues, material delays, quality non-conformances, and supplier bottlenecks.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Report Issue
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0B1120] p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search issues by #, description, type, job #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB]/80 rounded-xl text-xs font-semibold focus:outline-none"
          />
        </div>

        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB]/80 rounded-xl text-xs font-semibold focus:outline-none"
        >
          <option value="all">All Projects</option>
          {projectJobs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.projectNumber} ({p.jobNumber}) — {p.customerName ? `[${p.customerName}] ` : ''}{p.productName}
            </option>
          ))}
        </select>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIssues.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-[#70665F] space-y-2">
            <AlertTriangle className="w-10 h-10 text-rose-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No project issues or defects reported</h4>
            <p className="text-xs text-slate-500">All shop floor stations and design deliverables are operating without open non-conformances.</p>
          </div>
        ) : (
          filteredIssues.map((iss) => (
            <div key={iss.id} className="bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-md space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded text-[11px] border border-rose-500/20">
                    {iss.issueNo} • {iss.jobNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                    iss.status === 'resolved' || iss.status === 'closed'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {iss.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs">
                  [{iss.issueType}] in {iss.department} Dept
                </h3>
                <p className="text-slate-600 dark:text-[#70665F] text-xs bg-slate-50 dark:bg-white p-2.5 rounded-xl border border-slate-200 dark:border-[#EBE3DB]">
                  {iss.description}
                </p>

                {iss.resolution && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs">
                    <strong>Resolution:</strong> {iss.resolution}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-[#EBE3DB] flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#70665F]">Assigned: {iss.assignedTo}</span>
                {iss.status !== 'resolved' && iss.status !== 'closed' && (
                  <button
                    onClick={() => {
                      setResolveModalId(iss.id);
                      setResolutionText('');
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
                  >
                    Resolve Issue
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* REPORT ISSUE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-[#EBE3DB] bg-slate-50 dark:bg-white flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" /> Report Project Issue
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded text-[#70665F] hover:bg-slate-100 dark:hover:bg-[#FAF7F2]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="p-5 space-y-4">
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
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Issue Category</label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                  >
                    <option value="Design Issue">Design Issue</option>
                    <option value="Material Issue">Material Issue</option>
                    <option value="Purchase Delay">Purchase Delay</option>
                    <option value="Production Issue">Production Issue</option>
                    <option value="Quality Issue">Quality Issue</option>
                    <option value="Customer Change">Customer Change</option>
                    <option value="Supplier Delay">Supplier Delay</option>
                    <option value="Machine Issue">Machine Issue</option>
                    <option value="Documentation Issue">Documentation Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                  >
                    <option value="designer">Design</option>
                    <option value="purchase">Purchase</option>
                    <option value="store">Store</option>
                    <option value="production">Production</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Issue Description *</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the issue, impact on manufacturing, and immediate action needed..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Assigned Person</label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
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
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl"
                >
                  Submit Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE ISSUE MODAL */}
      {resolveModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-sm">Resolve Issue</h3>
            <form onSubmit={handleResolve} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Corrective Resolution Notes *</label>
                <textarea
                  rows={3}
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="Describe resolution action taken..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-xl text-xs"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setResolveModalId(null)} className="px-4 py-2 bg-slate-200 dark:bg-[#FAF7F2] text-slate-700 dark:text-[#544B45] font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl">Confirm Resolution</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
