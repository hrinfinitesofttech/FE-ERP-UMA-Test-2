'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import { ProjectTask } from '../../../types/crm';
import { deduplicatePlanningStages, convertPlanningStagesToTasks } from '../../../lib/projectPlanningHelper';
import api from '../../../lib/apiClient';
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
  Kanban,
  ChevronRight,
  Briefcase,
  ArrowUpDown,
  Tag,
  MessageSquare,
  Lock,
  Play,
  Send,
  RotateCcw,
  Pause,
  AlertCircle,
} from 'lucide-react';

export default function TasksPage() {
  const {
    projectTasks: contextTasks = [],
    projectPlanningStages,
    addProjectTask,
    updateProjectTask,
    deleteProjectTask,
    projectJobs,
    availableEmployees = [],
    can,
    currentUser,
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
    return null;
  });

  // View Mode: 'list' | 'grid' | 'kanban'
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('kanban');

  // Master Project View Filters
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('all');

  // Detail Task View Filters
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isSyncing, setIsSyncing] = useState(false);

  // Live Backend Tasks State
  const [liveTasks, setLiveTasks] = useState<any[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  // Modal State for custom task creation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProjectId, setModalProjectId] = useState(projectJobs[0]?.id || 'PRJ-2026-0001');
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('production');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number>(40);
  const [dependentTaskId, setDependentTaskId] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Review Modal State
  const [reviewModalTask, setReviewModalTask] = useState<any | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'request_revision'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');

  // Progress Update Modal State
  const [progressModalTask, setProgressModalTask] = useState<any | null>(null);
  const [progressPercentInput, setProgressPercentInput] = useState<number>(0);
  const [actualHoursInput, setActualHoursInput] = useState<number>(0);
  const [progressRemarksInput, setProgressRemarksInput] = useState<string>('');

  // Submit for Review Modal State
  const [submitModalTask, setSubmitModalTask] = useState<any | null>(null);
  const [submitRemarks, setSubmitRemarks] = useState('');

  // User Role Check (Manager vs Regular Assignee)
  const isManager = useMemo(() => {
    const role = (currentUser?.role || '').toLowerCase();
    return (
      role.includes('admin') ||
      role.includes('manager') ||
      role.includes('head') ||
      role.includes('lead') ||
      can('project', 'tasks', 'edit')
    );
  }, [currentUser, can]);

  // Load Live Tasks from Backend
  const loadTasksFromBackend = useCallback(async () => {
    setIsLoadingLive(true);
    try {
      const data = await api.projects.listTasks();
      if (Array.isArray(data)) {
        const mapped = data.map((t: any) => ({
          id: t.id,
          taskNumber: t.task_number || t.taskNumber || t.id,
          projectId: t.project || t.project_id || t.projectId,
          projectNumber: t.project_number || t.projectNumber,
          jobNumber: t.job_number || t.jobNumber,
          taskName: t.task_name || t.taskName || t.title,
          description: t.description || '',
          department: t.department || 'production',
          assignedTo: t.assigned_to_name || t.assignedTo || 'Unassigned',
          assignedToId: t.assigned_to || t.assignedToId,
          priority: t.priority || 'medium',
          startDate: t.start_date || t.startDate,
          dueDate: t.due_date || t.dueDate,
          estimatedHours: Number(t.estimated_hours ?? t.estimatedHours ?? 40),
          actualHours: Number(t.actual_hours ?? t.actualHours ?? 0),
          status: t.status || 'assigned',
          completionPercent: Number(t.progress_percent ?? t.completionPercent ?? 0),
          checklist: t.checklist || [],
          remarks: t.remarks || '',
          reviewNotes: t.review_notes || t.reviewNotes || '',
        }));
        setLiveTasks(mapped);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoadingLive(false);
    }
  }, []);

  useEffect(() => {
    loadTasksFromBackend();
  }, [loadTasksFromBackend]);

  // Active Selected Project
  const activeProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return (
      projectJobs.find(
        (p) => p.id === selectedProjectId || p.projectNumber === selectedProjectId || p.jobNumber === selectedProjectId
      ) || null
    );
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

  // All Tasks combined (live + context fallback)
  const allAvailableTasks = liveTasks.length > 0 ? liveTasks : contextTasks;

  // Synchronized helper to get tasks for a project
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

      const rawPrjTasks = allAvailableTasks.filter(
        (t) =>
          t.projectId === prj.id ||
          t.projectId === prj.projectNumber ||
          (t.projectNumber && (t.projectNumber === prj.projectNumber || t.projectNumber === prj.id)) ||
          (t.jobNumber && (t.jobNumber === prj.jobNumber || t.jobNumber === prj.id))
      );

      if (stagesForPrj.length > 0 && liveTasks.length === 0) {
        const activeStageIdSet = new Set(stagesForPrj.map((s) => s.id.toLowerCase()));

        const manualTasks = rawPrjTasks.filter(
          (t) => !t.id.toLowerCase().startsWith('tsk-stg-') && !t.id.toLowerCase().startsWith('tsk-stage-')
        );

        const validStageTasks = rawPrjTasks.filter((t) => {
          const isStageTask = t.id.toLowerCase().startsWith('tsk-stg-') || t.id.toLowerCase().startsWith('tsk-stage-');
          if (!isStageTask) return false;
          const strippedId = t.id.toLowerCase().replace(/^tsk-/, '');
          if (activeStageIdSet.has(strippedId)) return true;
          return stagesForPrj.some((s) => s.stageName?.trim().toLowerCase() === t.taskName?.trim().toLowerCase());
        });

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
    [projectPlanningStages, allAvailableTasks, liveTasks.length]
  );

  // Tasks for the Active Project
  const currentProjectTasks = useMemo(() => {
    if (!activeProject) return [];
    return getTasksForProject(activeProject);
  }, [activeProject, getTasksForProject]);

  // Filtered Tasks for Detail View
  const filteredTasks = useMemo(() => {
    return currentProjectTasks.filter((t) => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'in_progress') {
          if (t.status !== 'in_progress' && t.status !== 'accepted') return false;
        } else if (t.status !== statusFilter) {
          return false;
        }
      }
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
  const completedCount = currentProjectTasks.filter(
    (t) => t.status === 'completed' || t.completionPercent === 100
  ).length;
  const inProgressCount = currentProjectTasks.filter(
    (t) => t.status === 'in_progress' || t.status === 'accepted'
  ).length;
  const reviewCount = currentProjectTasks.filter(
    (t) => t.status === 'submitted_for_review' || t.status === 'review'
  ).length;
  const pendingCount = currentProjectTasks.filter(
    (t) => t.status === 'pending' || t.status === 'assigned'
  ).length;

  // Workflow Handlers
  const handleAcceptTask = async (task: any) => {
    try {
      await api.projects.acceptTask(task.id);
      setSuccessToast(`Task "${task.taskName}" accepted! Status updated to Accepted.`);
      setTimeout(() => setSuccessToast(''), 3500);
      await loadTasksFromBackend();
    } catch (err: any) {
      updateProjectTask(task.id, { status: 'accepted' });
      setSuccessToast(`Task "${task.taskName}" accepted!`);
      setTimeout(() => setSuccessToast(''), 3500);
    }
  };

  const handleStartTask = async (task: any) => {
    try {
      await api.projects.startTask(task.id);
      setSuccessToast(`Task "${task.taskName}" started! Status is now In Progress.`);
      setTimeout(() => setSuccessToast(''), 3500);
      await loadTasksFromBackend();
    } catch (err: any) {
      updateProjectTask(task.id, { status: 'in_progress', completionPercent: 10 });
      setSuccessToast(`Task "${task.taskName}" started.`);
      setTimeout(() => setSuccessToast(''), 3500);
    }
  };

  const handleOpenProgressModal = (task: any) => {
    setProgressModalTask(task);
    setProgressPercentInput(task.completionPercent || 0);
    setActualHoursInput(task.actualHours || 0);
    setProgressRemarksInput(task.remarks || '');
  };

  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressModalTask) return;
    const clampedPct = Math.max(0, Math.min(100, progressPercentInput));
    try {
      await api.projects.updateTaskProgress(progressModalTask.id, {
        progress_percent: clampedPct,
        actual_hours: actualHoursInput,
        remarks: progressRemarksInput.trim(),
      });
      setSuccessToast(`Progress updated to ${clampedPct}% (${actualHoursInput}h).`);
      setTimeout(() => setSuccessToast(''), 3500);
      setProgressModalTask(null);
      await loadTasksFromBackend();
    } catch {
      updateProjectTask(progressModalTask.id, {
        completionPercent: clampedPct,
        actualHours: actualHoursInput,
        remarks: progressRemarksInput.trim(),
      });
      setProgressModalTask(null);
      setSuccessToast(`Progress updated locally.`);
      setTimeout(() => setSuccessToast(''), 3500);
    }
  };

  const handleOpenSubmitReview = (task: any) => {
    setSubmitModalTask(task);
    setSubmitRemarks('');
  };

  const handleSubmitForReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitModalTask) return;
    try {
      await api.projects.submitTaskForReview(submitModalTask.id, {
        remarks: submitRemarks.trim(),
      });
      setSuccessToast(`Task "${submitModalTask.taskName}" submitted to manager for review.`);
      setTimeout(() => setSuccessToast(''), 3500);
      setSubmitModalTask(null);
      await loadTasksFromBackend();
    } catch (err: any) {
      setErrMsg(err?.data?.error || err?.message || 'Failed to submit task for review');
    }
  };

  const handleOpenReviewModal = (task: any) => {
    setReviewModalTask(task);
    setReviewAction('approve');
    setReviewNotes('');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalTask) return;
    if (reviewAction === 'request_revision' && !reviewNotes.trim()) {
      setErrMsg('Please enter specific revision notes to help the assignee improve their work.');
      return;
    }
    try {
      await api.projects.reviewTask(reviewModalTask.id, {
        action: reviewAction,
        reviewNotes: reviewNotes.trim(),
      });
      const actText = reviewAction === 'approve' ? 'Approved & Completed' : 'Revision Requested';
      setSuccessToast(`Task review recorded: ${actText}!`);
      setTimeout(() => setSuccessToast(''), 3500);
      setReviewModalTask(null);
      await loadTasksFromBackend();
    } catch (err: any) {
      setErrMsg(err?.data?.error || err?.message || 'Failed to submit review');
    }
  };

  const handleHoldTask = async (task: any) => {
    try {
      await api.projects.holdTask(task.id);
      setSuccessToast(`Task placed On Hold.`);
      setTimeout(() => setSuccessToast(''), 3500);
      await loadTasksFromBackend();
    } catch {
      updateProjectTask(task.id, { status: 'waiting' });
    }
  };

  const handleCancelTask = async (task: any) => {
    if (!window.confirm(`Are you sure you want to cancel task "${task.taskName}"?`)) return;
    try {
      await api.projects.cancelTask(task.id);
      setSuccessToast(`Task Cancelled.`);
      setTimeout(() => setSuccessToast(''), 3500);
      await loadTasksFromBackend();
    } catch {
      updateProjectTask(task.id, { status: 'cancelled' });
    }
  };

  const handleSyncPlanningStages = (prjId: string) => {
    if (!prjId) return;
    setIsSyncing(true);
    const prj = projectJobs.find((p) => p.id === prjId || p.projectNumber === prjId || p.jobNumber === prjId);
    if (prj) {
      const stages = projectPlanningStages.filter(
        (s) => s.projectId === prj.id || s.projectId === prj.projectNumber || s.jobNumber === prj.jobNumber
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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const prj = projectJobs.find((p) => p.id === modalProjectId) || projectJobs[0];

    try {
      await api.projects.createTask({
        project_id: prj.id,
        project_number: prj.projectNumber,
        job_number: prj.jobNumber,
        task_name: taskName,
        description,
        department,
        assigned_to_name: assignedTo,
        priority,
        start_date: startDate,
        due_date: dueDate || prj.deliveryDate,
        estimated_hours: Number(estimatedHours) || 40,
        status: 'assigned',
      });
      await loadTasksFromBackend();
    } catch {
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
    }

    setIsModalOpen(false);
    setTaskName('');
    setDescription('');
    setDependentTaskId('');
    setSuccessToast('New project task created successfully!');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Group tasks for Kanban columns
  const kanbanColumns = useMemo(() => {
    return [
      {
        id: 'assigned',
        title: 'Assigned',
        color: 'border-slate-300 bg-slate-50/70',
        tasks: filteredTasks.filter((t) => t.status === 'assigned' || t.status === 'pending'),
      },
      {
        id: 'in_progress',
        title: 'Accepted & In Progress',
        color: 'border-blue-300 bg-blue-50/50',
        tasks: filteredTasks.filter((t) => t.status === 'in_progress' || t.status === 'accepted'),
      },
      {
        id: 'submitted_for_review',
        title: 'Submitted for Review',
        color: 'border-amber-300 bg-amber-50/50',
        tasks: filteredTasks.filter((t) => t.status === 'submitted_for_review' || t.status === 'review'),
      },
      {
        id: 'revision_or_hold',
        title: 'Revision Required / On Hold',
        color: 'border-rose-300 bg-rose-50/40',
        tasks: filteredTasks.filter(
          (t) => t.status === 'revision_required' || t.status === 'waiting' || t.status === 'on_hold'
        ),
      },
      {
        id: 'completed',
        title: 'Completed',
        color: 'border-emerald-300 bg-emerald-50/50',
        tasks: filteredTasks.filter((t) => t.status === 'completed' || t.completionPercent === 100),
      },
    ];
  }, [filteredTasks]);

  const isOverdue = (dueDateStr?: string, status?: string) => {
    if (!dueDateStr || status === 'completed') return false;
    const due = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  return (
    <div className="space-y-6 text-xs pb-16">
      {/* Toast and Error Notifications */}
      {errMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-semibold">{errMsg}</span>
          </div>
          <button onClick={() => setErrMsg('')} className="p-1 hover:bg-rose-100 rounded cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-bold">{successToast}</span>
        </div>
      )}

      {/* MASTER VIEW: SELECT PROJECT / JOB */}
      {!activeProject ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                  Step 1: Select Project / Job
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">
                  Task Management & Workflow
                </span>
              </div>
              <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-6 h-6 text-emerald-600" />
                Project Execution & Task Lifecycle Management
              </h1>
              <p className="text-[#70665F] mt-1 text-xs max-w-2xl">
                Select a project to manage task transitions: Assigned &rarr; Accepted &rarr; In Progress &rarr; Submitted for Review &rarr; Manager Approval &rarr; Completed.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (projectJobs[0]) setModalProjectId(projectJobs[0].id);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar for Projects */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by Job #, Project #, Customer, Equipment / Product, Manager..."
                value={projectSearchQuery}
                onChange={(e) => setProjectSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#70665F]">Status:</span>
              <select
                value={projectStatusFilter}
                onChange={(e) => setProjectStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
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
              const calcProgress =
                prjTasks.length > 0
                  ? Math.round(prjTasks.reduce((acc, t) => acc + (t.completionPercent || 0), 0) / prjTasks.length)
                  : prj.progressPercent || 0;

              return (
                <div
                  key={prj.id}
                  onClick={() => setSelectedProjectId(prj.id)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between space-y-4 cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-black text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition">
                        {prj.jobNumber}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {prj.projectNumber}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-[#70665F] font-semibold mb-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{prj.customerName || 'Customer'}</span>
                      </div>
                      <h3 className="font-black text-slate-900 text-base leading-snug group-hover:text-emerald-600 transition">
                        {prj.productName}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-[#70665F]">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{prj.projectManager || 'Manager'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(prj.deliveryDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#70665F]">Tasks Progress</span>
                      <strong className="font-mono text-emerald-700 font-bold">{calcProgress}%</strong>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${calcProgress}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#70665F] pt-1">
                      <span>{prjTasks.length} Operations</span>
                      <span className="text-emerald-700 font-bold">{prjCompleted} Completed</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* DETAIL VIEW: PROJECT TASKS & WORKFLOW */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Active Project Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedProjectId(null)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-1 text-[11px] transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Project List
                </button>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {activeProject.jobNumber}
                </span>
                <span className="font-mono text-slate-500 text-[11px]">{activeProject.projectNumber}</span>
              </div>
              <h2 className="text-lg font-black text-slate-900">{activeProject.productName}</h2>
              <div className="text-[11px] text-[#70665F] flex items-center gap-3">
                <span>Customer: <strong>{activeProject.customerName}</strong></span>
                <span>Manager: <strong>{activeProject.projectManager}</strong></span>
                <span>Delivery: <strong>{formatDate(activeProject.deliveryDate)}</strong></span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                    viewMode === 'kanban' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Kanban Board View"
                >
                  <Kanban className="w-3.5 h-3.5" /> Kanban
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                    viewMode === 'list' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Table List View"
                >
                  <LayoutList className="w-3.5 h-3.5" /> List
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Cards
                </button>
              </div>

              <button
                onClick={() => handleSyncPlanningStages(activeProject.id)}
                disabled={isSyncing}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                Re-Sync Stages
              </button>

              <button
                onClick={() => {
                  setModalProjectId(activeProject.id);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-[#70665F]">Total Tasks</span>
              <div className="text-xl font-black text-slate-900 mt-1">{totalCount}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-700">Assigned</span>
              <div className="text-xl font-black text-slate-800 mt-1">{pendingCount}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-blue-800">In Progress</span>
              <div className="text-xl font-black text-blue-700 mt-1">{inProgressCount}</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-amber-800">Under Review</span>
              <div className="text-xl font-black text-amber-700 mt-1">{reviewCount}</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-emerald-800">Completed</span>
              <div className="text-xl font-black text-emerald-700 mt-1">{completedCount}</div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tasks by operation name, assignee, remarks..."
                value={taskSearchQuery}
                onChange={(e) => setTaskSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                <option value="all">All Statuses</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="submitted_for_review">Submitted for Review</option>
                <option value="revision_required">Revision Required</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* VIEW MODE 1: KANBAN BOARD */}
          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
              {kanbanColumns.map((col) => (
                <div key={col.id} className={`rounded-2xl border p-3.5 space-y-3 min-h-[500px] flex flex-col ${col.color}`}>
                  <div className="flex items-center justify-between border-b border-black/5 pb-2">
                    <span className="font-extrabold text-xs text-slate-800 tracking-tight">{col.title}</span>
                    <span className="font-mono font-bold text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      {col.tasks.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
                    {col.tasks.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-[#70665F] italic">No tasks in this stage</div>
                    ) : (
                      col.tasks.map((task) => {
                        const overdue = isOverdue(task.dueDate, task.status);
                        const isSelfAssigned = task.assignedTo === currentUser?.name || task.assignedToId === currentUser?.id;

                        return (
                          <div
                            key={task.id}
                            className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-2.5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                  {task.department}
                                </span>
                                {overdue && (
                                  <span className="font-mono text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 animate-pulse">
                                    Overdue
                                  </span>
                                )}
                                <span
                                  className={`font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                    task.priority === 'urgent'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : task.priority === 'high'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-slate-50 text-slate-600'
                                  }`}
                                >
                                  {task.priority}
                                </span>
                              </div>

                              <h4 className="font-extrabold text-xs text-slate-900 leading-snug">{task.taskName}</h4>

                              {task.description && (
                                <p className="text-[11px] text-[#70665F] line-clamp-2">{task.description}</p>
                              )}

                              {/* Manager Revision Notes Warning Box */}
                              {task.status === 'revision_required' && task.reviewNotes && (
                                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[10px] text-rose-800 space-y-0.5">
                                  <div className="font-bold flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 text-rose-600" /> Manager Revision Notes:
                                  </div>
                                  <div className="italic">&ldquo;{task.reviewNotes}&rdquo;</div>
                                </div>
                              )}
                            </div>

                            {/* Assignee & Progress */}
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                              <div className="flex items-center justify-between text-[11px]">
                                <div className="flex items-center gap-1.5 text-slate-800 font-semibold truncate">
                                  <User className="w-3 h-3 text-slate-400" />
                                  <span className="truncate">{task.assignedTo || 'Unassigned'}</span>
                                </div>
                                <span className="font-mono text-[10px] text-[#70665F]">{task.dueDate ? formatDate(task.dueDate) : '--'}</span>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-[#70665F]">Work Progress</span>
                                  <strong className="font-mono font-bold text-emerald-700">{task.completionPercent || 0}%</strong>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-emerald-500 h-full rounded-full transition-all"
                                    style={{ width: `${task.completionPercent || 0}%` }}
                                  />
                                </div>
                              </div>

                              {/* Action Buttons depending on status */}
                              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                                {/* If Assigned -> Accept */}
                                {(task.status === 'assigned' || task.status === 'pending') && (
                                  <button
                                    onClick={() => handleAcceptTask(task)}
                                    className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                                  >
                                    <Check className="w-3 h-3" /> Accept Task
                                  </button>
                                )}

                                {/* If Accepted -> Start */}
                                {task.status === 'accepted' && (
                                  <button
                                    onClick={() => handleStartTask(task)}
                                    className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                                  >
                                    <Play className="w-3 h-3" /> Start Execution
                                  </button>
                                )}

                                {/* If In Progress or Revision Required */}
                                {(task.status === 'in_progress' || task.status === 'revision_required') && (
                                  <>
                                    <button
                                      onClick={() => handleOpenProgressModal(task)}
                                      className="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[10px] flex items-center gap-1 transition cursor-pointer"
                                    >
                                      <Percent className="w-3 h-3" /> Progress
                                    </button>
                                    <button
                                      onClick={() => handleOpenSubmitReview(task)}
                                      className="flex-1 py-1 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                                    >
                                      <Send className="w-3 h-3" /> Submit for Review
                                    </button>
                                  </>
                                )}

                                {/* If Submitted for Review -> Manager Review Modal */}
                                {(task.status === 'submitted_for_review' || task.status === 'review') && (
                                  <button
                                    onClick={() => handleOpenReviewModal(task)}
                                    className="flex-1 py-1 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                                  >
                                    <MessageSquare className="w-3 h-3" /> Review Task
                                  </button>
                                )}

                                {/* Quick options for Manager: Hold / Cancel */}
                                {isManager && task.status !== 'completed' && (
                                  <button
                                    onClick={() => handleHoldTask(task)}
                                    className="p-1 hover:bg-slate-100 text-slate-500 rounded transition cursor-pointer"
                                    title="Put on Hold"
                                  >
                                    <Pause className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW MODE 2: TABLE LIST VIEW */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[#70665F] font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Task Operation</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Assigned To</th>
                      <th className="py-3 px-4">Progress %</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4 text-right">Workflow Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTasks.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{t.taskName}</div>
                          <div className="text-[10px] text-[#70665F]">{t.taskNumber || t.id}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold uppercase text-[10px] text-slate-700">
                          {t.department}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{t.assignedTo || 'Unassigned'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-700">{t.completionPercent || 0}%</span>
                            <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${t.completionPercent || 0}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              t.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : t.status === 'submitted_for_review'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : t.status === 'in_progress'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : t.status === 'revision_required'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {t.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          {formatDate(t.dueDate)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {(t.status === 'assigned' || t.status === 'pending') && (
                              <button
                                onClick={() => handleAcceptTask(t)}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] transition cursor-pointer"
                              >
                                Accept
                              </button>
                            )}
                            {t.status === 'accepted' && (
                              <button
                                onClick={() => handleStartTask(t)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition cursor-pointer"
                              >
                                Start
                              </button>
                            )}
                            {(t.status === 'in_progress' || t.status === 'revision_required') && (
                              <>
                                <button
                                  onClick={() => handleOpenProgressModal(t)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[10px] transition cursor-pointer"
                                >
                                  Progress
                                </button>
                                <button
                                  onClick={() => handleOpenSubmitReview(t)}
                                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[10px] transition cursor-pointer"
                                >
                                  Submit Review
                                </button>
                              </>
                            )}
                            {(t.status === 'submitted_for_review' || t.status === 'review') && (
                              <button
                                onClick={() => handleOpenReviewModal(t)}
                                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[10px] transition cursor-pointer"
                              >
                                Review
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: CARD GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <div key={task.id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {task.department}
                    </span>
                    <span
                      className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        task.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : task.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {task.status?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900">{task.taskName}</h4>

                  {task.description && <p className="text-xs text-[#70665F] line-clamp-2">{task.description}</p>}

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#70665F]">Assigned: <strong>{task.assignedTo || 'Unassigned'}</strong></span>
                      <span className="font-mono font-bold text-emerald-700">{task.completionPercent || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${task.completionPercent || 0}%` }} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-[#70665F] font-mono">Due: {formatDate(task.dueDate)}</span>
                    <div className="flex items-center gap-1.5">
                      {(task.status === 'assigned' || task.status === 'pending') && (
                        <button
                          onClick={() => handleAcceptTask(task)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                        >
                          Accept
                        </button>
                      )}
                      {task.status === 'in_progress' && (
                        <button
                          onClick={() => handleOpenSubmitReview(task)}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                        >
                          Submit
                        </button>
                      )}
                      {task.status === 'submitted_for_review' && (
                        <button
                          onClick={() => handleOpenReviewModal(task)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CREATE TASK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" /> Create Project Task
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded text-[#70665F] hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Project *</label>
                <select
                  value={modalProjectId}
                  onChange={(e) => setModalProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  {projectJobs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectNumber} ({p.jobNumber}) • {p.customerName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Tank Shell Rolling, TIG Root Welding..."
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="designer">Designer / CAD</option>
                    <option value="production">Production</option>
                    <option value="store">Store</option>
                    <option value="quality">Quality / QC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assignee</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="">-- Choose Staff Member --</option>
                    {availableEmployees.map((emp) => (
                      <option key={emp.id} value={emp.name || (emp as any).firstName}>
                        {emp.name || (emp as any).firstName} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Task specifications, drawing sheet numbers, acceptance criteria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PROGRESS & HOURS UPDATE */}
      {progressModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Update Task Progress</h3>
                <p className="text-xs text-[#70665F] truncate">{progressModalTask.taskName}</p>
              </div>
              <button onClick={() => setProgressModalTask(null)} className="p-1 hover:bg-slate-100 rounded cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProgress} className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Completion Percentage</label>
                  <span className="font-mono font-bold text-emerald-700 text-sm">{progressPercentInput}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progressPercentInput}
                  onChange={(e) => setProgressPercentInput(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Actual Hours Spent</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={actualHoursInput}
                  onChange={(e) => setActualHoursInput(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Execution Remarks / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Completed welding root pass, waiting for NDT inspection..."
                  value={progressRemarksInput}
                  onChange={(e) => setProgressRemarksInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProgressModalTask(null)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SUBMIT TASK FOR MANAGER REVIEW */}
      {submitModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Submit Task for Review</h3>
                  <p className="text-xs text-[#70665F] truncate">{submitModalTask.taskName}</p>
                </div>
              </div>
              <button onClick={() => setSubmitModalTask(null)} className="p-1 hover:bg-slate-100 rounded cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForReview} className="space-y-3.5 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                Submitting this task marks your work as ready for manager verification. The task will be locked from further edits until reviewed.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks for Reporting Manager</label>
                <textarea
                  rows={3}
                  placeholder="Completed operation per drawing rev 2; all dimensional tolerances verified..."
                  value={submitRemarks}
                  onChange={(e) => setSubmitRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubmitModalTask(null)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Submit for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: MANAGER REVIEW & FEEDBACK */}
      {reviewModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Manager Quality Review</h3>
                  <p className="text-xs text-[#70665F] truncate">{reviewModalTask.taskName}</p>
                </div>
              </div>
              <button onClick={() => setReviewModalTask(null)} className="p-1 hover:bg-slate-100 rounded cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-2">Review Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      reviewAction === 'approve'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="revAction"
                      checked={reviewAction === 'approve'}
                      onChange={() => setReviewAction('approve')}
                      className="accent-emerald-600"
                    />
                    <span>Approve & Complete</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      reviewAction === 'request_revision'
                        ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="revAction"
                      checked={reviewAction === 'request_revision'}
                      onChange={() => setReviewAction('request_revision')}
                      className="accent-rose-600"
                    />
                    <span>Request Revision</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {reviewAction === 'request_revision' ? (
                    <span className="text-rose-700 font-bold">Mandatory Revision Notes *</span>
                  ) : (
                    'Manager Feedback (Optional)'
                  )}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    reviewAction === 'request_revision'
                      ? 'Specify what needs revision (e.g. weld seam undercut observed, clean grinder marks)...'
                      : 'Excellent workmanship, fully meets specifications.'
                  }
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-purple-600"
                  required={reviewAction === 'request_revision'}
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewModalTask(null)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white font-bold rounded-xl shadow-xs cursor-pointer ${
                    reviewAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
