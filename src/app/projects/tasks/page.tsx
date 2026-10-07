'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import { ProjectTask } from '../../../types/crm';
import { deduplicatePlanningStages, convertPlanningStagesToTasks } from '../../../lib/projectPlanningHelper';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  Clock,
  CheckCircle2,
  User,
  Users,
  Layers,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Building,
  Calendar,
  Sliders,
  Check,
  Percent,
  LayoutList,
  LayoutGrid,
  ChevronRight,
  Briefcase,
  ArrowUpDown,
  Tag,
} from 'lucide-react';

export default function TasksPage() {
  const {
    projectTasks,
    projectPlanningStages,
    addProjectTask,
    updateProjectTask,
    deleteProjectTask,
    projectJobs,
    availableEmployees = [],
    can,
    generateDefaultPlanningStages,
  } = useERP();

  // Support pre-selecting project from query param if available
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qId = params.get('id') || params.get('projectId') || params.get('job');
      if (qId && projectJobs.some((p) => p.id === qId || p.projectNumber === qId || p.jobNumber === qId)) {
        const found = projectJobs.find((p) => p.id === qId || p.projectNumber === qId || p.jobNumber === qId);
        return found ? found.id : qId;
      }
    }
    return null; // Start with Project/Job selection view as requested!
  });

  // View Mode: 'list' (List View - default) or 'grid' (Card View)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Master Project View Filters
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('all');

  // Detail Task View Filters
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal State for custom task creation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProjectId, setModalProjectId] = useState(projectJobs[0]?.id || 'PRJ-2026-0001');
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
  const [successToast, setSuccessToast] = useState('');

  // Active Selected Project
  const activeProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projectJobs.find((p) => p.id === selectedProjectId || p.projectNumber === selectedProjectId || p.jobNumber === selectedProjectId) || null;
  }, [projectJobs, selectedProjectId]);

  // Filtered Projects for Master View
  const filteredProjects = useMemo(() => {
    return projectJobs.filter((p) => {
      if (projectStatusFilter !== 'all' && p.status !== projectStatusFilter) return false;
      if (projectSearchQuery.trim()) {
        const q = projectSearchQuery.toLowerCase();
        return (
          p.projectNumber?.toLowerCase().includes(q) ||
          p.jobNumber?.toLowerCase().includes(q) ||
          p.customerName?.toLowerCase().includes(q) ||
          p.productName?.toLowerCase().includes(q) ||
          p.projectManager?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [projectJobs, projectSearchQuery, projectStatusFilter]);

  // Synchronized helper to get tasks for a project strictly reflecting its active planning stages
  const getTasksForProject = useCallback(
    (prj: any): ProjectTask[] => {
      if (!prj) return [];

      const stagesForPrj = deduplicatePlanningStages(
        projectPlanningStages.filter(
          (s) =>
            s.projectId === prj.id ||
            s.projectId === prj.projectNumber ||
            (s.jobNumber && (s.jobNumber === prj.jobNumber || s.jobNumber === prj.id)) ||
            ((s as any).projectNumber && ((s as any).projectNumber === prj.projectNumber || (s as any).projectNumber === prj.id))
        )
      );

      const rawPrjTasks = projectTasks.filter(
        (t) =>
          t.projectId === prj.id ||
          t.projectId === prj.projectNumber ||
          (t.projectNumber && (t.projectNumber === prj.projectNumber || t.projectNumber === prj.id)) ||
          (t.jobNumber && (t.jobNumber === prj.jobNumber || t.jobNumber === prj.id))
      );

      if (stagesForPrj.length > 0) {
        const activeStageIdSet = new Set(stagesForPrj.map((s) => s.id.toLowerCase()));

        // Keep manual (custom) tasks created by user
        const manualTasks = rawPrjTasks.filter(
          (t) => !t.id.toLowerCase().startsWith('tsk-stg-') && !t.id.toLowerCase().startsWith('tsk-stage-')
        );

        // Keep stage tasks whose stage still exists in stagesForPrj
        const validStageTasks = rawPrjTasks.filter((t) => {
          const isStageTask = t.id.toLowerCase().startsWith('tsk-stg-') || t.id.toLowerCase().startsWith('tsk-stage-');
          if (!isStageTask) return false;
          const strippedId = t.id.toLowerCase().replace(/^tsk-/, '');
          if (activeStageIdSet.has(strippedId)) return true;
          // Also match by exact stage name if IDs have subtle variations
          return stagesForPrj.some((s) => s.stageName?.trim().toLowerCase() === t.taskName?.trim().toLowerCase());
        });

        // If some active stages don't have a task in validStageTasks, convert them
        const converted = convertPlanningStagesToTasks(stagesForPrj, prj);
        const existingIds = new Set(validStageTasks.map((t) => t.id.toLowerCase()));
        const existingNames = new Set(validStageTasks.map((t) => t.taskName?.trim().toLowerCase()));

        const missingTasks = converted.filter(
          (ct) => !existingIds.has(ct.id.toLowerCase()) && !existingNames.has(ct.taskName?.trim().toLowerCase())
        );

        return [...validStageTasks, ...missingTasks, ...manualTasks];
      }

      return rawPrjTasks;
    },
    [projectPlanningStages, projectTasks]
  );

  // Tasks for the Active Project
  const currentProjectTasks = useMemo(() => {
    if (!activeProject) return [];
    return getTasksForProject(activeProject);
  }, [activeProject, getTasksForProject]);

  // Filtered Tasks for Detail View
  const filteredTasks = useMemo(() => {
    return currentProjectTasks.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (departmentFilter !== 'all') {
        const d = (t.department || '').toLowerCase();
        const df = departmentFilter.toLowerCase();
        if (df === 'designer' && !d.includes('design') && !d.includes('cad')) return false;
        if (df === 'production' && !d.includes('prod') && !d.includes('fab') && !d.includes('weld')) return false;
        if (df === 'store' && !d.includes('store') && !d.includes('paint') && !d.includes('color')) return false;
        if (df === 'quality' && !d.includes('qual') && !d.includes('qc') && !d.includes('test')) return false;
      }
      if (taskSearchQuery.trim()) {
        const q = taskSearchQuery.toLowerCase();
        return (
          t.taskNumber?.toLowerCase().includes(q) ||
          t.taskName?.toLowerCase().includes(q) ||
          t.jobNumber?.toLowerCase().includes(q) ||
          t.assignedTo?.toLowerCase().includes(q) ||
          t.department?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [currentProjectTasks, statusFilter, priorityFilter, departmentFilter, taskSearchQuery]);

  // Metrics for active project
  const totalCount = currentProjectTasks.length;
  const completedCount = currentProjectTasks.filter((t) => t.status === 'completed' || t.completionPercent === 100).length;
  const inProgressCount = currentProjectTasks.filter((t) => t.status === 'in_progress').length;
  const pendingCount = currentProjectTasks.filter((t) => t.status === 'pending' || t.status === 'assigned').length;
  const waitingCount = currentProjectTasks.filter((t) => t.status === 'waiting' || t.status === 'cancelled').length;
  const overallAvgProgress = totalCount > 0 ? Math.round(currentProjectTasks.reduce((acc, t) => acc + (t.completionPercent || 0), 0) / totalCount) : (activeProject?.progressPercent || 0);

  const handleStatusChange = (task: ProjectTask, newStatus: ProjectTask['status']) => {
    try {
      setErrMsg('');
      const updates: Partial<ProjectTask> = { status: newStatus };
      if (newStatus === 'completed') {
        updates.completionPercent = 100;
      } else if (newStatus === 'in_progress' && (task.completionPercent || 0) === 0) {
        updates.completionPercent = 50;
      } else if (newStatus === 'pending') {
        updates.completionPercent = 0;
      }
      updateProjectTask(task.id, updates);
      setSuccessToast(`Task status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err: any) {
      setErrMsg(err.message || 'Failed to update task status');
    }
  };

  const handleProgressChange = (task: ProjectTask, newPercent: number) => {
    try {
      setErrMsg('');
      const clamped = Math.max(0, Math.min(100, newPercent));
      const updates: Partial<ProjectTask> = {
        completionPercent: clamped,
        status: clamped === 100 ? 'completed' : clamped > 0 ? 'in_progress' : 'pending',
      };
      updateProjectTask(task.id, updates);
      setSuccessToast(`Progress updated to ${clamped}%`);
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err: any) {
      setErrMsg(err.message || 'Failed to update progress');
    }
  };

  const handleAssigneeChange = (task: ProjectTask, newAssignee: string) => {
    try {
      setErrMsg('');
      updateProjectTask(task.id, { assignedTo: newAssignee });
      setSuccessToast(`Assigned to ${newAssignee}`);
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err: any) {
      setErrMsg(err.message || 'Failed to update assignee');
    }
  };

  const handleSyncPlanningStages = (prjId: string) => {
    if (!prjId) return;
    setIsSyncing(true);
    const prj = projectJobs.find((p) => p.id === prjId || p.projectNumber === prjId || p.jobNumber === prjId);
    if (prj) {
      const stages = projectPlanningStages.filter(
        (s) =>
          s.projectId === prj.id ||
          s.projectId === prj.projectNumber ||
          s.jobNumber === prj.jobNumber
      );
      if (stages.length === 0) {
        generateDefaultPlanningStages(prj.id);
      }
    }
    setTimeout(() => {
      setIsSyncing(false);
      setSuccessToast('Planning Stages synchronized into Tasks successfully!');
      setTimeout(() => setSuccessToast(''), 3500);
    }, 600);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const prj = projectJobs.find((p) => p.id === modalProjectId) || projectJobs[0];

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
      estimatedHours: Number(estimatedHours) || 40,
      actualHours: 0,
      status: 'assigned',
      completionPercent: 0,
      dependentTaskId: dependentTaskId || undefined,
    });

    setIsModalOpen(false);
    setTaskName('');
    setDescription('');
    setDependentTaskId('');
    setSuccessToast('New task added successfully!');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  return (
    <div className="space-y-6 text-xs pb-16">
      {/* Toast and Error Notifications */}
      {errMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errMsg}</span>
          </div>
          <button onClick={() => setErrMsg('')} className="p-1 hover:bg-rose-100 rounded cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successToast && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MASTER VIEW: SELECT PROJECT / JOB                                          */}
      {/* ========================================================================= */}
      {!activeProject ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Banner */}
          <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                  Step 1: Select Project / Job
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold">
                  Project & Job Tasks
                </span>
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-[#211B17] flex items-center gap-2">
                <Layers className="w-6 h-6 text-emerald-600" />
                Project Job Selection for Task Execution
              </h1>
              <p className="text-[#70665F] mt-1 text-xs max-w-2xl">
                Click on any project or job card to view its execution stages (Design, Cutting, Welding, Painting), assignees, and live progress percentage.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (projectJobs[0]) setModalProjectId(projectJobs[0].id);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar for Projects */}
          <div className="bg-white dark:bg-[#0B1120] p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by Job #, Project #, Customer, Equipment / Product, Manager..."
                value={projectSearchQuery}
                onChange={(e) => setProjectSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#70665F]">Status:</span>
              <select
                value={projectStatusFilter}
                onChange={(e) => setProjectStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="all">All Projects ({projectJobs.length})</option>
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Grid of Project / Job Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((prj) => {
              const prjTasks = getTasksForProject(prj);
              const prjCompleted = prjTasks.filter((t) => t.status === 'completed' || t.completionPercent === 100).length;
              const prjInProgress = prjTasks.filter((t) => t.status === 'in_progress').length;
              const prjPending = prjTasks.filter((t) => t.status === 'pending' || t.status === 'assigned').length;
              const calcProgress = prjTasks.length > 0
                ? Math.round(prjTasks.reduce((acc, t) => acc + (t.completionPercent || 0), 0) / prjTasks.length)
                : (prj.progressPercent || 0);

              return (
                <div
                  key={prj.id}
                  onClick={() => setSelectedProjectId(prj.id)}
                  className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-[#EBE3DB] hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg transition-all duration-200 p-5 flex flex-col justify-between space-y-4 cursor-pointer group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Job Number & Project Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition">
                        {prj.jobNumber}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/10">
                        {prj.projectNumber}
                      </span>
                    </div>

                    {/* Customer & Product Details */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-[#70665F] font-semibold mb-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{prj.customerName || 'Reliance Industries'}</span>
                      </div>
                      <h3 className="font-black text-slate-900 dark:text-[#211B17] text-base leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        {prj.productName}
                      </h3>
                      {prj.specification && (
                        <p className="text-[11px] text-[#70665F] mt-1 line-clamp-1">{prj.specification}</p>
                      )}
                    </div>

                    {/* Manager & Delivery Date */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-[#EBE3DB]/60 text-[11px] text-[#70665F]">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate font-semibold">{prj.projectManager || 'Bhavin Shah'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="font-mono font-bold text-slate-700 dark:text-[#211B17]">{formatDate(prj.deliveryDate)}</span>
                      </div>
                    </div>

                    {/* Tasks Summary Breakdown */}
                    <div className="p-2.5 bg-slate-50 dark:bg-[#FAF7F2] rounded-xl border border-slate-200/80 dark:border-[#EBE3DB] space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#70665F]">
                        <span>Tasks Breakdown</span>
                        <span className="font-mono text-emerald-600">{prjTasks.length} Planning Tasks</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-emerald-600">{prjCompleted} Done</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-blue-600">{prjInProgress} In Progress</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-amber-600">{prjPending} Pending</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-[#70665F]">Work Completed:</span>
                        <strong className="font-mono font-black text-emerald-600 text-xs">{calcProgress}%</strong>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${calcProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Click to Open Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      className="w-full py-2.5 px-4 bg-slate-100 group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-teal-600 text-slate-800 group-hover:text-white font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-[#EBE3DB] group-hover:border-transparent shadow-sm"
                    >
                      <span>View Tasks List</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* DETAIL VIEW: TASKS LIST FOR THE SELECTED PROJECT / JOB                    */
        /* ========================================================================= */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Back Navigation & Breadcrumb */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setSelectedProjectId(null)}
              className="px-3.5 py-2 bg-white dark:bg-[#0B1120] hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-[#211B17] font-bold rounded-xl border border-slate-200 dark:border-[#EBE3DB] flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600" />
              <span>← All Projects / Jobs</span>
            </button>

            {/* View Mode Toggle: List vs Grid */}
            <div className="flex items-center gap-1 bg-white dark:bg-[#0B1120] p-1 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer text-xs ${
                  viewMode === 'list'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer text-xs ${
                  viewMode === 'grid'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Card View</span>
              </button>
            </div>
          </div>

          {/* Active Job Header Card */}
          <div className="bg-white dark:bg-[#0B1120] p-6 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-0.5 rounded-xl border border-emerald-500/20">
                    {activeProject.jobNumber}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-lg border border-slate-200">
                    {activeProject.projectNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold">
                    Planning Stages • Auto-Synced
                  </span>
                </div>
                <h1 className="text-xl font-black text-slate-900 dark:text-[#211B17]">
                  {activeProject.productName}
                </h1>
                <p className="text-xs text-[#70665F] flex items-center gap-3 flex-wrap">
                  <span>Customer: <strong className="text-slate-800 dark:text-[#211B17]">{activeProject.customerName || 'Standard Client'}</strong></span>
                  <span>•</span>
                  <span>PM: <strong className="text-emerald-600 font-bold">{activeProject.projectManager || 'Bhavin Shah'}</strong></span>
                  <span>•</span>
                  <span>Target Delivery: <strong className="text-slate-800 dark:text-[#211B17] font-mono">{formatDate(activeProject.deliveryDate)}</strong></span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleSyncPlanningStages(activeProject.id)}
                  disabled={isSyncing}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-[#211B17] font-bold rounded-xl flex items-center gap-2 transition cursor-pointer border border-slate-300 dark:border-[#EBE3DB]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
                  Re-Sync Planning Stages
                </button>

                <Link
                  href={`/projects/planning?id=${activeProject.id}`}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-bold rounded-xl flex items-center gap-1.5 transition border border-blue-200 dark:border-blue-900/50"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Planning Matrix
                </Link>

                <button
                  onClick={() => {
                    setModalProjectId(activeProject.id);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 dark:border-[#EBE3DB]/60">
              <div className="p-3 bg-slate-50 dark:bg-[#FAF7F2] rounded-xl border border-slate-200/70 dark:border-[#EBE3DB]">
                <span className="text-[10px] font-bold text-[#70665F] uppercase block">Total Steps / Tasks</span>
                <span className="text-lg font-black text-slate-900 dark:text-[#211B17]">{totalCount}</span>
                <span className="text-[10px] text-slate-500 ml-1">steps</span>
              </div>

              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/70 dark:border-emerald-900/40">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">Completed</span>
                <span className="text-lg font-black text-emerald-600">{completedCount}</span>
                <span className="text-[10px] text-emerald-600/80 ml-1">({totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%)</span>
              </div>

              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-200/70 dark:border-blue-900/40">
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase block">In Progress</span>
                <span className="text-lg font-black text-blue-600">{inProgressCount}</span>
                <span className="text-[10px] text-blue-600/80 ml-1">active</span>
              </div>

              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200/70 dark:border-amber-900/40">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase block">Pending</span>
                <span className="text-lg font-black text-amber-600">{pendingCount}</span>
                <span className="text-[10px] text-amber-600/80 ml-1">queued</span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Overall Work %</span>
                  <span className="font-mono font-black text-emerald-600 text-sm">{overallAvgProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${overallAvgProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filters Bar for Tasks */}
          <div className="bg-white dark:bg-[#0B1120] p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] space-y-3 shadow-sm">
            {/* Department Quick Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#70665F] uppercase mr-1">Steps:</span>
              {[
                { id: 'all', label: 'All Steps' },
                { id: 'designer', label: 'Design' },
                { id: 'production', label: 'Fabrication & Welding' },
                { id: 'store', label: 'Painting & Coating' },
                { id: 'quality', label: 'Quality & Testing (QC)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDepartmentFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    departmentFilter === tab.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-[#544B45]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-[#EBE3DB]/60">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search tasks by Name, Assignee, Department..."
                  value={taskSearchQuery}
                  onChange={(e) => setTaskSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="all">All Statuses ({totalCount})</option>
                  <option value="completed">Completed ({completedCount})</option>
                  <option value="in_progress">In Progress ({inProgressCount})</option>
                  <option value="pending">Pending ({pendingCount})</option>
                  <option value="waiting">Waiting / Delayed ({waitingCount})</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TASKS VIEW: LIST VIEW                                                       */}
          {/* ========================================================================= */}
          {viewMode === 'list' ? (
            <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#FAF7F2] border-b border-slate-200 dark:border-[#EBE3DB] text-[#70665F] font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-4 w-16 text-center">Step #</th>
                      <th className="py-3.5 px-4 min-w-[280px]">Task / Operation Name</th>
                      <th className="py-3.5 px-4 min-w-[120px]">Department</th>
                      <th className="py-3.5 px-4 min-w-[190px]">Assigned Person</th>
                      <th className="py-3.5 px-4 min-w-[180px]">Work Done %</th>
                      <th className="py-3.5 px-4 min-w-[150px]">Status</th>
                      <th className="py-3.5 px-4 min-w-[130px]">Due Date</th>
                      {can('project', 'tasks', 'delete') && <th className="py-3.5 px-3 w-16 text-center">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#EBE3DB]/60">
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-[#70665F]">
                          <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <span className="font-bold block">No tasks match your filter criteria.</span>
                          <span className="text-[11px]">Click "Re-Sync 16 Stages" to re-generate the full 16-step execution plan.</span>
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((t, idx) => {
                        const depTask = projectTasks.find((pt) => pt.id === t.dependentTaskId);
                        const isCompleted = t.status === 'completed' || t.completionPercent === 100;
                        const isInProgress = t.status === 'in_progress';
                        const isDelayed = t.status === 'waiting' || t.status === 'cancelled';

                        const stepNumMatch = t.taskNumber?.match(/\d+/);
                        const stepNum = stepNumMatch ? parseInt(stepNumMatch[0], 10) : idx + 1;

                        return (
                          <tr
                            key={t.id}
                            className={`hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors ${
                              isCompleted
                                ? 'bg-emerald-50/20 dark:bg-emerald-950/10'
                                : isInProgress
                                ? 'bg-blue-50/20 dark:bg-blue-950/10'
                                : ''
                            }`}
                          >
                            {/* Step # */}
                            <td className="py-3 px-4 text-center">
                              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md text-[10px] border border-emerald-500/20">
                                #{String(stepNum).padStart(2, '0')}
                              </span>
                            </td>

                            {/* Task Name & Description */}
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 dark:text-[#211B17] text-xs">
                                    {t.taskName}
                                  </span>
                                  {t.priority === 'urgent' && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                      Urgent
                                    </span>
                                  )}
                                </div>
                                {t.description && (
                                  <p className="text-[11px] text-[#70665F] line-clamp-1">{t.description}</p>
                                )}
                                {depTask && (
                                  <div className="inline-flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded border border-amber-200">
                                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                    <span>Prereq: {depTask.taskName} ({depTask.status})</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Department */}
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-[#544B45] border border-slate-200 dark:border-white/10">
                                {t.department}
                              </span>
                            </td>

                            {/* Assigned Person */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0 border border-emerald-500/20">
                                  <User className="w-3 h-3" />
                                </div>
                                <div className="min-w-0">
                                  <strong className="text-slate-800 dark:text-[#211B17] text-xs block truncate">
                                    {t.assignedTo || 'Unassigned'}
                                  </strong>
                                </div>
                              </div>
                            </td>

                            {/* Work Progress % & Quick Buttons */}
                            <td className="py-3 px-4">
                              <div className="space-y-1 w-44">
                                <div className="flex justify-between items-center text-[11px]">
                                  <strong className={`font-mono ${isCompleted ? 'text-emerald-600 font-bold' : 'text-slate-800 dark:text-[#211B17]'}`}>
                                    {t.completionPercent || 0}%
                                  </strong>
                                  <span className="text-[10px] text-slate-400">{t.actualHours || 0}/{t.estimatedHours || 40}h</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-600">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-500'
                                    }`}
                                    style={{ width: `${t.completionPercent || 0}%` }}
                                  />
                                </div>
                                <div className="flex items-center gap-1 pt-0.5">
                                  {[0, 25, 50, 75, 100].map((pct) => (
                                    <button
                                      key={pct}
                                      onClick={() => handleProgressChange(t, pct)}
                                      className={`flex-1 py-0.5 rounded text-[8px] font-mono font-bold transition cursor-pointer ${
                                        (t.completionPercent || 0) === pct
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-[#544B45]'
                                      }`}
                                    >
                                      {pct}%
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </td>

                            {/* Status Selector */}
                            <td className="py-3 px-4">
                              <select
                                value={t.status}
                                onChange={(e) => handleStatusChange(t, e.target.value as any)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition focus:outline-none border ${
                                  isCompleted
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                    : isInProgress
                                    ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                                    : isDelayed
                                    ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                                    : 'bg-slate-100 dark:bg-[#FAF7F2] text-slate-800 dark:text-[#544B45] border-slate-300 dark:border-[#EBE3DB]'
                                }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="assigned">Assigned</option>
                                <option value="in_progress">In Progress</option>
                                <option value="waiting">Waiting / Delayed</option>
                                <option value="completed">Completed (100%)</option>
                              </select>
                            </td>

                            {/* Due Date */}
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-700 dark:text-[#544B45]">
                              {formatDate(t.dueDate)}
                            </td>

                            {/* Actions */}
                            {can('project', 'tasks', 'delete') && (
                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={() => deleteProjectTask(t.id)}
                                  className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition cursor-pointer"
                                  title="Delete Task"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* TASKS VIEW: GRID / CARD VIEW                                              */
            /* ========================================================================= */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((t, idx) => {
                const depTask = projectTasks.find((pt) => pt.id === t.dependentTaskId);
                const isCompleted = t.status === 'completed' || t.completionPercent === 100;
                const isInProgress = t.status === 'in_progress';
                const isDelayed = t.status === 'waiting' || t.status === 'cancelled';

                const stepNumMatch = t.taskNumber?.match(/\d+/);
                const stepNum = stepNumMatch ? parseInt(stepNumMatch[0], 10) : idx + 1;

                return (
                  <div
                    key={t.id}
                    className={`bg-white dark:bg-[#0B1120] p-5 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between space-y-3.5 ${
                      isCompleted
                        ? 'border-emerald-300/80 dark:border-emerald-800/40 bg-gradient-to-b from-emerald-50/20 to-white dark:to-[#0B1120]'
                        : isInProgress
                        ? 'border-blue-300/80 dark:border-blue-800/40 ring-1 ring-blue-500/20'
                        : 'border-slate-200 dark:border-[#EBE3DB]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 rounded-full text-[10px] border border-emerald-500/20">
                          Step #{String(stepNum).padStart(2, '0')} of 16
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-[#70665F] font-bold">
                            {t.jobNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                              t.priority === 'urgent'
                                ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                : t.priority === 'high'
                                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-sm leading-snug">
                        {t.taskName}
                      </h3>

                      {t.description && (
                        <p className="text-[#70665F] text-[11px] leading-relaxed line-clamp-2">
                          {t.description}
                        </p>
                      )}

                      {depTask && (
                        <div
                          className={`p-2 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 border ${
                            depTask.status === 'completed'
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200'
                              : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">
                            Prerequisite: <strong>{depTask.taskName}</strong> ({depTask.status})
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-[#EBE3DB]/60">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0 border border-emerald-500/20">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <span className="text-[10px] text-[#70665F] block font-semibold">Assigned Person:</span>
                            <strong className="text-slate-800 dark:text-[#211B17] text-xs truncate block">
                              {t.assignedTo || 'Unassigned'}
                            </strong>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#FAF7F2] text-slate-700 dark:text-[#544B45] border border-slate-200">
                          {t.department}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-semibold text-[#70665F]">Work Done:</span>
                          <strong className={`font-mono font-bold ${isCompleted ? 'text-emerald-600' : 'text-slate-800 dark:text-[#211B17]'}`}>
                            {t.completionPercent || 0}%
                          </strong>
                        </div>

                        <div className="w-full bg-slate-100 dark:bg-slate-700/60 h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-600/50">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-500'
                            }`}
                            style={{ width: `${t.completionPercent || 0}%` }}
                          />
                        </div>

                        <div className="flex items-center gap-1 pt-0.5">
                          {[0, 25, 50, 75, 100].map((pct) => (
                            <button
                              key={pct}
                              onClick={() => handleProgressChange(t, pct)}
                              className={`flex-1 py-0.5 rounded text-[9px] font-mono font-bold transition cursor-pointer ${
                                (t.completionPercent || 0) === pct
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-[#544B45]'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-[#70665F] font-mono pt-1">
                        <span>Due: <strong className="text-slate-700 dark:text-[#544B45]">{formatDate(t.dueDate)}</strong></span>
                        <span>Est: {t.estimatedHours || 40}h</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-[#EBE3DB]/60 flex items-center justify-between gap-2">
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t, e.target.value as any)}
                        className={`flex-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition focus:outline-none border ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            : isInProgress
                            ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                            : isDelayed
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                            : 'bg-slate-100 dark:bg-[#FAF7F2] text-slate-800 dark:text-[#544B45] border-slate-300 dark:border-[#EBE3DB]'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="waiting">Waiting / Delayed</option>
                        <option value="completed">Completed (100%)</option>
                      </select>

                      {can('project', 'tasks', 'delete') && (
                        <button
                          onClick={() => deleteProjectTask(t.id)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-lg text-xs font-bold transition cursor-pointer"
                          title="Delete Task"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-[#EBE3DB] bg-slate-50 dark:bg-white/5 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-sm flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-500" /> Create Project Task
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded text-[#70665F] hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Target Project *</label>
                <select
                  value={modalProjectId}
                  onChange={(e) => setModalProjectId(e.target.value)}
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
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Task / Step Name *</label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="e.g. Design CAD Drawings / Shell Fit-up Welding / Epoxy Painting"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Description & Deliverables</label>
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
                    <option value="designer">Design & Engineering</option>
                    <option value="production">Production & Fabrication</option>
                    <option value="store">Store & Painting</option>
                    <option value="purchase">Purchase</option>
                    <option value="maintenance">Maintenance / Site Service</option>
                    <option value="crm">CRM & Sales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Assigned Person *</label>
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
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Prerequisite Task</label>
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
                  className="px-4 py-2 bg-slate-200 dark:bg-[#FAF7F2] text-slate-700 dark:text-[#544B45] font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
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
