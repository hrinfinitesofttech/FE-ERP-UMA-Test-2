'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { DesignTask } from '../../../types/designer';
import {
  Compass,
  Plus,
  Search,
  CheckSquare,
  Clock,
  User,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

export default function DesignPlanningPage() {
  const { designTasks, addDesignTask, updateDesignTask, designJobs } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New task form state
  const [selectedDesignJobId, setSelectedDesignJobId] = useState('');
  const [taskName, setTaskName] = useState('');
  const [designer, setDesigner] = useState('Dharmesh Joshi');
  const [estimatedHours, setEstimatedHours] = useState(16);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Close modal with ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDesignJobId('');
    setTaskName('');
    setDesigner('Dharmesh Joshi');
    setEstimatedHours(16);
    setStartDate('');
    setDueDate('');
  };

  const filteredTasks = designTasks.filter((t) => {
    const matchSearch =
      t.taskName?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      t.jobNumber?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      (t.designer && t.designer?.toLowerCase().includes(searchQuery?.toLowerCase()));
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const desJob = designJobs.find((j) => j.id === selectedDesignJobId);
    if (!desJob) return;

    addDesignTask({
      designJobId: desJob.id,
      projectId: desJob.projectId,
      jobNumber: desJob.jobNumber,
      taskName,
      customerName: desJob.customerName,
      machineName: desJob.productName,
      designer,
      startDate: startDate || new Date().toISOString().split('T')[0],
      targetDate: dueDate || desJob.requiredDate,
      dueDate: dueDate || desJob.requiredDate,
      priority: 'high',
      estimatedHours: Number(estimatedHours),
      actualHours: 0,
      status: 'pending',
      progressPercent: 0,
    });

    closeModal();
  };

  return (
    <div className="p-6 space-y-6  text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-600/20 text-indigo-400 border border-crm-brand-600/30 text-xs font-mono font-bold">
              MODULE 3.3
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
              <Compass className="w-7 h-7 text-indigo-400" />
              Design Planning & Engineering Task Management
            </h1>
          </div>
          <p className="text-xs text-[#70665F] mt-1">
            Task Scheduling, Designer Assignment, Stage Planning & Work Hours Tracking
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] text-xs font-bold shadow-lg shadow-crm-brand-700/30 transition"
        >
          <Plus className="w-4 h-4" />
          Assign Design Task
        </button>
      </div>

      {/* Control Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#EBE3DB] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search Task Name, Job #, Designer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-[#EBE3DB] text-xs text-[#211B17] placeholder-slate-500 focus:outline-none focus:border-crm-brand-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-600"
        >
          <option value="all">All Task Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((t) => (
          <div
            key={t.id}
            className="p-4 rounded-2xl bg-white border border-[#EBE3DB] hover:border-crm-brand-600/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
          >
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-indigo-400">{t.id}</span>
                <span className="font-mono text-xs text-amber-400 font-bold">[{t.jobNumber}]</span>
                <span className="px-2 py-0.5 rounded bg-white text-[#544B45] font-mono text-[10px] uppercase">
                  {t.priority}
                </span>
              </div>
              <h4 className="font-extrabold text-[#211B17] text-sm truncate">{t.taskName}</h4>
              <div className="flex items-center gap-4 text-xs text-[#70665F] font-mono">
                <span>Designer: <strong className="text-[#3E2723]">{t.designer}</strong></span>
                <span>Due: <strong className="text-amber-400">{t.dueDate}</strong></span>
                <span>Est: <strong className="text-crm-brand-500">{t.estimatedHours} hrs</strong></span>
              </div>
            </div>

            {/* Progress Bar & Status Update */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="w-32 space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-[#70665F]">
                  <span>Progress</span>
                  <span className="font-bold text-[#211B17]">{t.progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-crm-brand-600 rounded-full transition-all"
                    style={{ width: `${t.progressPercent}%` }}
                  />
                </div>
              </div>

              {t.status !== 'completed' ? (
                <button
                  onClick={() =>
                    updateDesignTask(t.id, {
                      status: 'completed',
                      progressPercent: 100,
                      actualHours: t.estimatedHours,
                    })
                  }
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-[#211B17] border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Complete
                </button>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Completed
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#EBE3DB] space-y-3 shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#211B17]">No Design Tasks Found</h3>
            <p className="text-xs text-[#70665F] max-w-md mx-auto">
              {searchQuery
                ? `No engineering tasks matched "${searchQuery}".`
                : 'There are currently no engineering design tasks assigned.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal: Create Task */}
      {isModalOpen && (
        <div
          onClick={closeModal}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-6 text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-extrabold text-[#211B17] flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                Assign New Engineering Task
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-[#70665F] hover:text-[#211B17]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-[#544B45] font-bold block mb-1">Select Design Job *</label>
                <select
                  required
                  value={selectedDesignJobId}
                  onChange={(e) => setSelectedDesignJobId(e.target.value)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                >
                  <option value="">-- Choose Job --</option>
                  {designJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.designJobNumber} ({j.jobNumber}) - {j.productName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#544B45] font-bold block mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete ASME Vessel Wall Thickness Calculations"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                />
              </div>

              <div>
                <label className="text-[#544B45] font-bold block mb-1">Assigned Designer *</label>
                <select
                  value={designer}
                  onChange={(e) => setDesigner(e.target.value)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                >
                  <option value="Dharmesh Joshi">Dharmesh Joshi</option>
                  <option value="Ketan Patel">Ketan Patel</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white text-[#544B45] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-bold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
