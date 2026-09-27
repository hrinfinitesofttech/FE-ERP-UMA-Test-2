'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import { Users, Plus, Building, Search, X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function DepartmentAssignmentsPage() {
  const { departmentAssignments, assignDepartment, projectJobs, availableEmployees, departments } = useERP();
  const [selectedProjectId, setSelectedProjectId] = useState('PRJ-2026-0001');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dept, setDept] = useState('designer');
  const [manager, setManager] = useState('Dharmesh Joshi');
  const [employee, setEmployee] = useState('Dharmesh Joshi');
  const [responsibility, setResponsibility] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');

  const activeAssignments = departmentAssignments.filter(
    (da) => da.projectId === selectedProjectId || da.jobNumber === projectJobs.find((p) => p.id === selectedProjectId)?.jobNumber
  );

  const activeProject = projectJobs.find((p) => p.id === selectedProjectId) || projectJobs[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responsibility.trim()) return;

    assignDepartment({
      projectId: activeProject.id,
      projectNumber: activeProject.projectNumber,
      jobNumber: activeProject.jobNumber,
      department: dept,
      manager,
      assignedEmployee: employee,
      responsibility,
      startDate,
      dueDate: dueDate || activeProject.deliveryDate,
      status: 'in_progress',
      priority,
    });

    setIsModalOpen(false);
    setResponsibility('');
  };

  return (
    <div className="space-y-6 text-xs pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-600/10 text-crm-brand-600 font-mono text-[10px] font-bold uppercase tracking-wider border border-crm-brand-600/20">
              Department Coordination
            </span>
          </div>
          <h1 className="text-lg font-black text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <Users className="w-5 h-5 text-crm-brand-600" />
            Department Assignments & Responsibilities
          </h1>
          <p className="text-[#70665F] dark:text-[#70665F] mt-0.5">
            Assign accountability across all 9 core manufacturing & support departments for each project.
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
            <Plus className="w-4 h-4" /> Assign Department
          </button>
        </div>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeAssignments.map((da) => (
          <div key={da.id} className="bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-md space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-crm-brand-600 bg-crm-brand-600/10 px-2 py-0.5 rounded border border-crm-brand-600/20">
                  {da.department} Department
                </span>
                <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-sm mt-1">
                  Manager: {da.manager}
                </h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                da.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-crm-brand-600/10 text-crm-brand-600 border-crm-brand-600/20'
              }`}>
                {da.status}
              </span>
            </div>

            <p className="text-slate-600 dark:text-[#544B45] text-xs bg-slate-50 dark:bg-white p-2.5 rounded-xl border border-slate-200 dark:border-[#EBE3DB]">
              <strong>Responsibility:</strong> {da.responsibility}
            </p>

            <div className="text-[11px] text-[#70665F] space-y-1 font-mono">
              <div>Assigned Employee: <strong className="text-slate-800 dark:text-[#544B45]">{da.assignedEmployee}</strong></div>
              <div>Start Date: {formatDate(da.startDate)}</div>
              <div>Due Date: {formatDate(da.dueDate)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ASSIGN DEPARTMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-[#EBE3DB] bg-slate-50 dark:bg-white flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-crm-brand-600" /> Assign Department & Employee
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded text-[#70665F] hover:bg-slate-100 dark:hover:bg-[#FAF7F2]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Select Department *</label>
                <select
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                >
                  <option value="crm">CRM & Commercial</option>
                  <option value="project">Project Management</option>
                  <option value="designer">Designer & Engineering</option>
                  <option value="purchase">Purchase & Procurement</option>
                  <option value="store">Store & Inventory</option>
                  <option value="production">Production & Plant</option>
                  <option value="accounting">Accounting & Finance</option>
                  <option value="maintenance">Maintenance & Service</option>
                  <option value="hr">HR & Payroll</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Department Manager *</label>
                  <input
                    type="text"
                    value={manager}
                    onChange={(e) => setManager(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Assigned Employee *</label>
                  <input
                    type="text"
                    value={employee}
                    onChange={(e) => setEmployee(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Responsibility Scope *</label>
                <textarea
                  rows={3}
                  value={responsibility}
                  onChange={(e) => setResponsibility(e.target.value)}
                  placeholder="Define department deliverables, scope and checkpoints..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
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
                  className="px-4 py-2 bg-crm-brand-700 text-white font-bold rounded-xl"
                >
                  Assign Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
