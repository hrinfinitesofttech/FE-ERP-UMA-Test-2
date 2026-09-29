'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import { ProjectTask } from '../../../types/crm';
import { CheckSquare, Plus, Search, Filter, AlertTriangle, ArrowRight, X, Clock, CheckCircle2 } from 'lucide-react';

export default function TasksPage() {
  const { projectTasks, addProjectTask, updateProjectTask, deleteProjectTask, projectJobs, availableEmployees = [], can } = useERP();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectId, setProjectId] = useState('PRJ-2026-0001');
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('production');
  const [assignedTo, setAssignedTo] = useState(
    availableEmployees[0]
      ? `${availableEmployees[0].firstName || ''} ${availableEmployees[0].lastName || ''}`.trim() || availableEmployees[0].name || 'Bhavin Shah'
      : 'Bhavin Shah'
  );
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number>(40);
  const [dependentTaskId, setDependentTaskId] = useState('');
  const [errMsg, setErrMsg] = useState('');

  const filteredTasks = projectTasks.filter((t) => {
    if (selectedProjectId !== 'all' && t.projectId !== selectedProjectId) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery?.toLowerCase();
      return (
        t.taskNumber?.toLowerCase().includes(q) ||
        t.taskName?.toLowerCase().includes(q) ||
        t.jobNumber?.toLowerCase().includes(q) ||
        t.assignedTo?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = (task: ProjectTask, newStatus: ProjectTask['status']) => {
    try {
      setErrMsg('');
      updateProjectTask(task.id, { status: newStatus });
    } catch (err: any) {
      setErrMsg(err.message || 'Failed to update task status');
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const prj = projectJobs.find((p) => p.id === projectId) || projectJobs[0];

    addProjectTask({
      projectId: prj.id,
      projectNumber: prj.projectNumber,
      jobNumber: prj.jobNumber,
      taskName,
      description,
      department,
      assignedTo,
      priority,
      startDate,
      dueDate: dueDate || prj.deliveryDate,
      estimatedHours: Number(estimatedHours) || 10,
      actualHours: 0,
      status: 'assigned',
      completionPercent: 0,
      dependentTaskId: dependentTaskId || undefined,
    });

    setIsModalOpen(false);
    setTaskName('');
    setDescription('');
    setDependentTaskId('');
  };

  return (
    <div className="space-y-6 text-xs pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
              Task Dependency Engine
            </span>
          </div>
          <h1 className="text-lg font-black text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-600" />
            Project Task Management & Dependency Rules
          </h1>
          <p className="text-[#70665F] dark:text-[#70665F] mt-0.5">
            Tasks follow explicit dependency sequences (Design Approval → BOM → Material → Purchase → Production).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-[#211B17] font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {errMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0B1120] p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Task #, Name, Job #, Assignee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB]/80 rounded-xl text-xs font-semibold focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB]/80 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Projects</option>
            {projectJobs.map((p) => (
              <option key={p.id} value={p.id}>{p.projectNumber} ({p.jobNumber})</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB]/80 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Task Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting">Waiting</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((t) => {
          const depTask = projectTasks.find((pt) => pt.id === t.dependentTaskId);
          return (
            <div key={t.id} className="bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-md space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-crm-brand-700 dark:text-crm-brand-500 bg-crm-brand-600/10 px-2 py-0.5 rounded text-[11px] border border-crm-brand-600/20">
                    {t.taskNumber} • {t.jobNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                    t.priority === 'urgent' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {t.priority}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-sm">
                  {t.taskName}
                </h3>
                <p className="text-[#70665F] text-xs">{t.description}</p>

                {depTask && (
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-[11px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Prerequisite: <strong>{depTask.taskName}</strong> ({depTask.status})</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-[#EBE3DB] space-y-2">
                <div className="flex justify-between items-center text-[11px] text-[#70665F] font-mono">
                  <span>Assignee: <strong className="text-slate-800 dark:text-[#544B45]">{t.assignedTo}</strong></span>
                  <span>Hours: {t.actualHours}/{t.estimatedHours}h</span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-[#70665F] font-mono">
                  <span>Due: {formatDate(t.dueDate)}</span>
                  <span className="uppercase font-bold text-emerald-500">{t.department}</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t, e.target.value as any)}
                    className="flex-1 px-2.5 py-1.5 bg-slate-100 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-lg text-xs font-bold text-slate-800 dark:text-[#544B45] focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting">Waiting</option>
                    <option value="completed">Completed</option>
                  </select>

                  {can('project', 'tasks', 'delete') && (
                    <button
                      onClick={() => deleteProjectTask(t.id)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg text-xs font-bold"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-[#EBE3DB] bg-slate-50 dark:bg-white flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-sm flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-500" /> Create Project Task
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded text-[#70665F] hover:bg-slate-100 dark:hover:bg-[#FAF7F2]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4">
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
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Task Name *</label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="e.g. Shell Rolling & Hydrostatic Test"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specific scope, technical instructions or guidelines..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                  >
                    <option value="designer">Design & CAD</option>
                    <option value="purchase">Purchase</option>
                    <option value="store">Store</option>
                    <option value="production">Production</option>
                    <option value="maintenance">Maintenance/Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Assigned To (Employee) *</label>
                  <select
                    required
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Prerequisite Task (Dependency)</label>
                  <select
                    value={dependentTaskId}
                    onChange={(e) => setDependentTaskId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                  >
                    <option value="">-- No Dependency --</option>
                    {projectTasks.map((pt) => (
                      <option key={pt.id} value={pt.id}>{pt.taskNumber}: {pt.taskName}</option>
                    ))}
                  </select>
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
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
