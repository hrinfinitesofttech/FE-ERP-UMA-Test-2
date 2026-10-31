'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Bug,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Tag,
  ChevronRight,
  ShieldAlert,
  X,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { BugTicket } from '../../../types/testing';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { toast } from '@/context/ToastContext';

export default function BugTrackerPage() {
  const { bugTickets, addBugTicket, updateBugTicketStatus } = useERP();

  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New Bug Form State
  const [moduleName, setModuleName] = useState<string>('Accounting');
  const [pageName, setPageName] = useState<string>('General Ledger');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [stepsToReproduce, setStepsToReproduce] = useState<string>('');
  const [expectedResult, setExpectedResult] = useState<string>('');
  const [actualResult, setActualResult] = useState<string>('');
  const [severity, setSeverity] = useState<BugTicket['severity']>('Medium');
  const [priority, setPriority] = useState<BugTicket['priority']>('Normal');
  const [assignedDeveloper, setAssignedDeveloper] = useState<string>('Antigravity AI Agent');

  const filteredBugs = bugTickets.filter((b) => {
    const matchesStatus = selectedStatus === 'All' || b.status === selectedStatus;
    const matchesSearch =

      !searchQuery?.trim() || (

      b.title?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      b.bugNo?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      b.module?.toLowerCase().includes(searchQuery?.toLowerCase())

    );
    return matchesStatus && matchesSearch;
  });

  const handleCreateBug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !stepsToReproduce) {
      toast.warning('Please fill in required fields (Title, Steps to reproduce)');
      return;
    }

    addBugTicket({
      module: moduleName,
      page: pageName,
      title,
      description,
      stepsToReproduce,
      expectedResult,
      actualResult,
      severity,
      priority,
      assignedDeveloper,
      status: 'Open',
    });

    setIsAddModalOpen(false);
    setTitle('');
    setDescription('');
    setStepsToReproduce('');
    setExpectedResult('');
    setActualResult('');
    toast.success('Technical defect report submitted successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-[#EBE3DB] p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              <Bug className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#211B17] tracking-wide">
                Internal ERP Defect & Bug Tracker
              </h1>
              <p className="text-xs text-[#70665F]">
                Log, prioritize, assign, and track technical issues & regression bugs across all 11 ERP modules
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-red-600/20"
        >
          <Plus className="w-4 h-4" />
          Report New Defect / Bug
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-[#EBE3DB] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#544B45] font-semibold flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#70665F]" /> Status:
            </span>
            <CustomSelect
              size="sm"
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              className="w-44"
              options={[
                { value: 'All', label: 'All Bug Statuses' },
                { value: 'Open', label: 'Open' },
                { value: 'In_Progress', label: 'In Progress' },
                { value: 'Fixed', label: 'Fixed' },
                { value: 'Retest', label: 'Retest' },
                { value: 'Closed', label: 'Closed' },
              ]}
            />
          </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search bug ticket or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF7F2] text-xs text-[#211B17] pl-9 pr-4 py-2 rounded-xl border border-[#EBE3DB] focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Bug List Table */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#EBE3DB] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#211B17]">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            Defect Registry ({filteredBugs.length} Tickets)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] text-[10px] font-semibold text-[#70665F] uppercase tracking-wider border-b border-[#EBE3DB]">
                <th className="py-3 px-4">Bug Ticket</th>
                <th className="py-3 px-4">Module & Page</th>
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-[#544B45]">
              {filteredBugs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#70665F]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Bug className="w-8 h-8 text-[#A8988C] opacity-50" />
                      <p className="font-semibold text-[#544B45]">No bug tickets recorded</p>
                      <p className="text-[11px] text-[#8C7A6F]">No defects match the selected filter or no technical bugs reported.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBugs.map((bug) => (
                  <tr key={bug.id} className="hover:bg-[#FAF7F2]/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-red-600">
                      <div>{bug.bugNo}</div>
                      <div className="text-[10px] text-[#70665F] font-normal">{bug.createdDate}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#FAF7F2] text-[#544B45] border border-[#EBE3DB] text-[10px] font-semibold">
                        {bug.module}
                      </span>
                      <div className="text-[10px] text-[#70665F] mt-0.5">{bug.page}</div>
                    </td>
                    <td className="py-3 px-4 space-y-0.5 max-w-sm">
                      <div className="font-semibold text-[#211B17]">{bug.title}</div>
                      <div className="text-[11px] text-[#70665F] leading-tight line-clamp-2">{bug.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-bold',
                          bug.severity === 'Critical' && 'bg-red-500/20 text-red-700 border border-red-500/40',
                          bug.severity === 'High' && 'bg-orange-500/20 text-orange-700 border border-orange-500/40',
                          bug.severity === 'Medium' && 'bg-amber-500/20 text-amber-700 border border-amber-500/40',
                          bug.severity === 'Low' && 'bg-[#FAF7F2] text-[#70665F]'
                        )}
                      >
                        {bug.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#544B45] font-medium">{bug.priority}</td>
                    <td className="py-3 px-4 text-[#70665F]">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-[#70665F]" />
                        <span>{bug.assignedDeveloper}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                          bug.status === 'Closed' && 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30',
                          bug.status === 'Fixed' && 'bg-[#FAF7F2] text-[#75401F] border border-[#D5CAC0]',
                          bug.status === 'In_Progress' && 'bg-amber-500/10 text-amber-700 border border-amber-500/30',
                          bug.status === 'Open' && 'bg-red-500/10 text-red-700 border border-red-500/30'
                        )}
                      >
                        {bug.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <select
                        value={bug.status}
                        onChange={(e) => updateBugTicketStatus(bug.id, e.target.value as any)}
                        className="bg-[#FAF7F2] text-[11px] text-[#544B45] px-2 py-1 rounded-lg border border-[#EBE3DB] focus:outline-none cursor-pointer min-h-[36px]"
                      >
                        <option value="Open">Open</option>
                        <option value="In_Progress">In Progress</option>
                        <option value="Fixed">Fixed</option>
                        <option value="Retest">Retest</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Bug Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateBug} className="bg-white border border-[#EBE3DB] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div className="font-bold text-[#211B17] text-sm flex items-center gap-2">
                <Bug className="w-4 h-4 text-red-400" />
                Report New Technical Defect
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <CustomSelect
                  label="ERP Module"
                  required
                  searchable
                  value={moduleName}
                  onChange={(val) => setModuleName(val)}
                  options={[
                    { value: 'Foundation', label: 'ERP Foundation' },
                    { value: 'CRM', label: 'CRM & Sales' },
                    { value: 'Project', label: 'Project & Job' },
                    { value: 'Design', label: 'Design & Engineering' },
                    { value: 'Purchase', label: 'Purchase & RFQ' },
                    { value: 'Store', label: 'Store & Warehouse' },
                    { value: 'Production', label: 'Production & Work Orders' },
                    { value: 'Accounting', label: 'Accounting & Finance' },
                    { value: 'HR', label: 'HR & Payroll' },
                    { value: 'Maintenance', label: 'Maintenance & Service' },
                    { value: 'Integration', label: 'Integration Layer' },
                  ]}
                />
              </div>

              <div>
                <label className="text-[#70665F] font-semibold">Affected Page Name *</label>
                <input
                  type="text"
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  placeholder="e.g. Expenses / Job 360"
                  className="w-full bg-[#FAF7F2] text-[#211B17] p-2.5 rounded-xl border border-[#EBE3DB] mt-1"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="text-[#70665F] font-semibold">Bug Summary Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of the issue..."
                  className="w-full bg-[#FAF7F2] text-[#211B17] p-2.5 rounded-xl border border-[#EBE3DB] mt-1"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="text-[#70665F] font-semibold">Steps to Reproduce *</label>
                <textarea
                  rows={2}
                  value={stepsToReproduce}
                  onChange={(e) => setStepsToReproduce(e.target.value)}
                  placeholder="1. Go to page... 2. Click button..."
                  className="w-full bg-[#FAF7F2] text-[#211B17] p-2 rounded-xl border border-[#EBE3DB] mt-1"
                  required
                />
              </div>

              <div>
                <CustomSelect
                  label="Severity"
                  value={severity}
                  onChange={(val) => setSeverity(val as any)}
                  options={[
                    { value: 'Critical', label: 'Critical' },
                    { value: 'High', label: 'High' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'Low', label: 'Low' },
                  ]}
                />
              </div>

              <div>
                <CustomSelect
                  label="Priority"
                  value={priority}
                  onChange={(val) => setPriority(val as any)}
                  options={[
                    { value: 'Urgent', label: 'Urgent' },
                    { value: 'High', label: 'High' },
                    { value: 'Normal', label: 'Normal' },
                    { value: 'Low', label: 'Low' },
                  ]}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#EBE3DB] pt-4">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#FAF7F2] text-[#544B45] rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-red-600/20"
              >
                Submit Defect Ticket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
