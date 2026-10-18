'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { StatusBadge } from '../../../components/workflow/StatusBadge';
import { ProjectPlanningRecord, PlannedTaskItem, ProjectJobMaster, MasterTask } from '../../../types/crm';
import { formatDate } from '../../../lib/utils';
import {
  Workflow,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  X,
  CheckSquare,
  Users,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Layers,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export default function ProjectPlanningPage() {
  const router = useRouter();
  const {
    projectPlanningRecords,
    saveProjectPlanningRecord,
    deleteProjectPlanningRecord,
    projectJobs,
    masterTasks,
    employees,
    availableEmployees,
    can,
  } = useERP();

  // Unified active staff list for assignees
  const staffList = useMemo(() => {
    const list = employees && employees.length > 0 ? employees : availableEmployees || [];
    return list.filter((e) => (e as any).status !== 'inactive' && (e as any).status !== 'suspended');
  }, [employees, availableEmployees]);

  // Mode: 'list' | 'form'
  const [mode, setMode] = useState<'list' | 'form'>('list');

  // Form State
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [taskList, setTaskList] = useState<PlannedTaskItem[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // View Modal State
  const [viewingRecord, setViewingRecord] = useState<ProjectPlanningRecord | null>(null);

  // Delete Confirmation Modal
  const [deletingRecord, setDeletingRecord] = useState<ProjectPlanningRecord | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Search & Filter for List
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Check URL query parameters for mode=create or mode=edit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      const qProjectId = params.get('projectId') || params.get('projectNumber');
      const qPlanId = params.get('id') || params.get('planId');

      if (urlMode === 'create') {
        setMode('form');
        setEditingRecordId(null);
        if (qProjectId) {
          setSelectedProjectId(qProjectId);
        }
      } else if (urlMode === 'edit' && qPlanId) {
        const found = projectPlanningRecords.find((r) => r.id === qPlanId);
        if (found) {
          handleOpenEdit(found);
        }
      }
    }
  }, [projectPlanningRecords]);

  // Projects that have NOT been planned yet (for the Create Planning dropdown)
  const availableProjectsForPlanning = useMemo(() => {
    return projectJobs.filter((p) => {
      // If currently editing, allow the project of the record being edited
      if (editingRecordId) {
        const currentRec = projectPlanningRecords.find((r) => r.id === editingRecordId);
        if (currentRec && (currentRec.projectId === p.id || currentRec.projectNumber === p.projectNumber)) {
          return true;
        }
      }
      const alreadyPlanned = projectPlanningRecords.some(
        (r) => r.projectId === p.id || r.projectNumber === p.projectNumber
      );
      return !alreadyPlanned;
    });
  }, [projectJobs, projectPlanningRecords, editingRecordId]);

  // Currently selected project in form
  const currentSelectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projectJobs.find((p) => p.id === selectedProjectId || p.projectNumber === selectedProjectId) || null;
  }, [selectedProjectId, projectJobs]);

  // Open Create Form
  const handleOpenCreateForm = () => {
    setMode('form');
    setEditingRecordId(null);
    setFormErrors({});
    if (availableProjectsForPlanning.length > 0) {
      setSelectedProjectId(availableProjectsForPlanning[0].id);
    } else {
      setSelectedProjectId('');
    }

    // Default first task
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const firstMaster = masterTasks[0];
    setTaskList([
      {
        id: `ROW-${Date.now()}-1`,
        masterTaskId: firstMaster?.id,
        taskName: firstMaster?.taskName || 'Design & 3D Modeling',
        assignedPersons: [],
        startDate: today,
        endDate: nextWeek,
        durationDays: 7,
        status: 'pending',
        progressPercent: 0,
        remarks: '',
      },
    ]);
  };

  // Open Edit Form
  const handleOpenEdit = (rec: ProjectPlanningRecord) => {
    setMode('form');
    setEditingRecordId(rec.id);
    setSelectedProjectId(rec.projectId);
    setTaskList(
      rec.tasks && rec.tasks.length > 0
        ? rec.tasks.map((t) => ({ ...t }))
        : [
            {
              id: `ROW-${Date.now()}-1`,
              taskName: masterTasks[0]?.taskName || 'Initial Stage',
              assignedPersons: [],
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
              durationDays: 7,
              status: 'pending',
              progressPercent: 0,
              remarks: '',
            },
          ]
    );
    setFormErrors({});
  };

  // Add Task Row
  const handleAddTaskRow = (templateTask?: MasterTask) => {
    const today = new Date().toISOString().split('T')[0];
    const days = templateTask?.estimatedDays || 5;
    const end = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

    const newRow: PlannedTaskItem = {
      id: `ROW-${Date.now()}-${taskList.length + 1}`,
      masterTaskId: templateTask?.id,
      taskName: templateTask?.taskName || (masterTasks[taskList.length % masterTasks.length]?.taskName || 'Production Stage'),
      assignedPersons: [],
      startDate: today,
      endDate: end,
      durationDays: days,
      status: 'pending',
      progressPercent: 0,
      remarks: '',
    };
    setTaskList((prev) => [...prev, newRow]);
  };

  // Remove Task Row
  const handleRemoveTaskRow = (rowId: string) => {
    if (taskList.length <= 1) {
      showToast('A project plan requires at least 1 task.');
      return;
    }
    setTaskList((prev) => prev.filter((t) => t.id !== rowId));
  };

  // Update Task Row Field
  const handleUpdateTaskField = (rowId: string, field: keyof PlannedTaskItem, value: any) => {
    setTaskList((prev) =>
      prev.map((t) => {
        if (t.id !== rowId) return t;

        const updated = { ...t, [field]: value };

        // If taskName changed from master tasks, update masterTaskId and duration
        if (field === 'taskName') {
          const matched = masterTasks.find((m) => m.taskName === value);
          if (matched) {
            updated.masterTaskId = matched.id;
            if (matched.estimatedDays && !t.durationDays) {
              updated.durationDays = matched.estimatedDays;
            }
          }
        }

        // Auto-calculate duration if dates change
        if (field === 'startDate' || field === 'endDate') {
          const s = field === 'startDate' ? value : t.startDate;
          const e = field === 'endDate' ? value : t.endDate;
          if (s && e) {
            const diff = Math.max(1, Math.round((new Date(e).getTime() - new Date(s).getTime()) / 86400000));
            updated.durationDays = diff;
          }
        }

        // Auto-update status if progress is changed
        if (field === 'progressPercent') {
          const pct = Number(value);
          if (pct >= 100) updated.status = 'completed';
          else if (pct > 0 && updated.status === 'pending') updated.status = 'in_progress';
        }

        return updated;
      })
    );
  };

  // Toggle Assigned Person on Task Row
  const handleToggleAssignee = (rowId: string, personName: string) => {
    setTaskList((prev) =>
      prev.map((t) => {
        if (t.id !== rowId) return t;
        const current = t.assignedPersons || [];
        const exists = current.includes(personName);
        const updatedAssignees = exists
          ? current.filter((p) => p !== personName)
          : [...current, personName];
        return { ...t, assignedPersons: updatedAssignees };
      })
    );
  };

  // Save Project Planning
  const handleSavePlanning = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!selectedProjectId) {
      errors.project = 'Please select a project to plan.';
    }

    if (!taskList || taskList.length === 0) {
      errors.tasks = 'Please add at least one task to the project plan.';
    } else {
      const hasEmptyTask = taskList.some((t) => !t.taskName || t.taskName.trim() === '');
      if (hasEmptyTask) {
        errors.tasks = 'All task rows must have a valid task name.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const prj = currentSelectedProject;
    if (!prj) {
      setFormErrors({ project: 'Selected project not found.' });
      return;
    }

    const saved = saveProjectPlanningRecord({
      id: editingRecordId || undefined,
      projectId: prj.id,
      projectNumber: prj.projectNumber,
      customerName: prj.customerName || 'Customer',
      productName: prj.productName || 'Process Equipment Scope',
      customerPoNumber: prj.customerPoNumber,
      deliveryDate: prj.deliveryDate,
      tasks: taskList,
      totalTasks: taskList.length,
      completedTasks: taskList.filter((t) => t.status === 'completed' || t.progressPercent === 100).length,
      overallProgress: 0,
      status: 'planned',
    });

    showToast(`Project Planning for ${saved.projectNumber} saved successfully!`);
    setMode('list');
    setEditingRecordId(null);
  };

  // Delete Record
  const handleConfirmDelete = () => {
    if (!deletingRecord) return;
    deleteProjectPlanningRecord(deletingRecord.id);
    showToast(`Project Planning ${deletingRecord.planningNumber} deleted successfully.`);
    setDeletingRecord(null);
  };

  // Filtered Planning List
  const filteredRecords = useMemo(() => {
    return projectPlanningRecords.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.projectNumber.toLowerCase().includes(q) ||
          r.planningNumber.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q) ||
          (r.customerPoNumber && r.customerPoNumber.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [projectPlanningRecords, statusFilter, searchQuery]);

  // Overall KPIs
  const totalPlannedProjects = projectPlanningRecords.length;
  const inProgressPlanning = projectPlanningRecords.filter((r) => r.status === 'in_progress').length;
  const completedPlanning = projectPlanningRecords.filter((r) => r.status === 'completed').length;
  const totalScheduledTasks = projectPlanningRecords.reduce((sum, r) => sum + (r.tasks?.length || 0), 0);

  // Table Columns for Planning List
  const columns: ERPColumn<ProjectPlanningRecord>[] = [
    {
      key: 'projectNumber',
      header: 'Project No',
      isCodeLink: true,
      onCodeClick: (r) => router.push(`/projects/${r.projectId}`),
      cell: (r) => (
        <div className="space-y-0.5">
          <span className="font-mono font-bold text-[#7C3AED] hover:underline cursor-pointer block text-xs">
            {r.projectNumber}
          </span>
          <span className="text-[10px] text-slate-500 font-mono block">Plan: {r.planningNumber}</span>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer & Scope',
      cell: (r) => (
        <div className="max-w-[240px] space-y-0.5">
          <span className="font-bold text-slate-900 block truncate text-xs">{r.customerName}</span>
          <span className="text-[11px] text-slate-600 block truncate">{r.productName}</span>
          {r.customerPoNumber && (
            <span className="text-[10px] text-slate-500 font-mono block">PO: {r.customerPoNumber}</span>
          )}
        </div>
      ),
    },
    {
      key: 'totalTasks',
      header: 'Planned Tasks',
      cell: (r) => {
        const total = r.tasks?.length || 0;
        const done = r.tasks?.filter((t) => t.status === 'completed' || t.progressPercent === 100).length || 0;
        return (
          <div className="space-y-1">
            <span className="font-semibold text-xs text-slate-800">
              {total} {total === 1 ? 'Task' : 'Tasks'}
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold block w-fit">
              {done} of {total} Done
            </span>
          </div>
        );
      },
    },
    {
      key: 'tasks',
      header: 'Assigned Team',
      cell: (r) => {
        const allAssigned = Array.from(
          new Set(r.tasks?.flatMap((t) => t.assignedPersons || []).filter(Boolean))
        );
        if (allAssigned.length === 0) {
          return <span className="text-slate-400 text-xs italic">Unassigned</span>;
        }
        return (
          <div className="flex flex-wrap items-center gap-1 max-w-[180px]">
            {allAssigned.slice(0, 3).map((person, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 truncate max-w-[80px]"
                title={person}
              >
                {person}
              </span>
            ))}
            {allAssigned.length > 3 && (
              <span className="text-[10px] text-slate-500 font-bold">+{allAssigned.length - 3}</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'deliveryDate',
      header: 'Timeline',
      cell: (r) => {
        const firstStart = r.tasks?.[0]?.startDate || '';
        const lastEnd = r.tasks?.[r.tasks.length - 1]?.endDate || r.deliveryDate || '';
        return (
          <div className="space-y-0.5 font-mono text-[11px]">
            <span className="text-slate-700 block font-semibold">{formatDate(firstStart)}</span>
            <span className="text-slate-500 text-[10px] block">to {formatDate(lastEnd)}</span>
          </div>
        );
      },
    },
    {
      key: 'overallProgress',
      header: 'Progress %',
      cell: (r) => {
        const pct = r.overallProgress || 0;
        return (
          <div className="w-24 space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-500 font-medium">Progress</span>
              <span className="font-bold text-[#7C3AED]">{pct}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  pct >= 100
                    ? 'bg-emerald-500'
                    : pct >= 50
                    ? 'bg-gradient-to-r from-[#7C3AED] to-emerald-500'
                    : 'bg-[#7C3AED]'
                }`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => <StatusBadge status={(r.status || 'planned') as any} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (r) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenEdit(r)}
            title="Edit Project Plan"
            className="p-1.5 text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewingRecord(r)}
            title="View Planning Tasks"
            className="p-1.5 text-crm-brand-700 hover:text-crm-brand-900 bg-crm-brand-50 hover:bg-crm-brand-100 border border-crm-brand-200 rounded-lg transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeletingRecord(r)}
            title="Delete Project Plan"
            className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#211B17] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[#EBE3DB]/20 text-xs animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: LIST VIEW                                                        */}
      {/* ========================================================================= */}
      {mode === 'list' && (
        <div className="space-y-4">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Planned Projects</span>
                <Workflow className="w-4 h-4 text-crm-brand-700" />
              </div>
              <div className="text-2xl font-black text-slate-900">{totalPlannedProjects}</div>
              <div className="text-xs text-slate-500">Active project schedules</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-600">{inProgressPlanning}</div>
              <div className="text-xs text-slate-500">Shopfloor operations active</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600">{completedPlanning}</div>
              <div className="text-xs text-slate-500">Delivered / fully executed</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Scheduled Tasks</span>
                <CheckSquare className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-600">{totalScheduledTasks}</div>
              <div className="text-xs text-slate-500">Across all planned projects</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="all">All Statuses ({totalPlannedProjects})</option>
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Standard ERP List View */}
          <ERPListPageLayout<ProjectPlanningRecord>
            breadcrumbs={['DASHBOARD', 'PROJECTS', 'PROJECT PLANNING']}
            columns={columns}
            data={filteredRecords}
            addNewLabel={can('project', 'projects', 'create') ? '+ New Project Planning' : undefined}
            onAddNew={can('project', 'projects', 'create') ? handleOpenCreateForm : undefined}
            searchPlaceholder="Search by Project #, Plan #, Customer, Scope..."
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: FORM VIEW (CREATE / EDIT PROJECT PLANNING)                       */}
      {/* ========================================================================= */}
      {mode === 'form' && (
        <form onSubmit={handleSavePlanning} className="space-y-4">
          {/* Header Card */}
          <div className="bg-white p-4 rounded-2xl border border-[#EBE3DB] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMode('list')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                title="Back to Planning List"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-crm-brand-700" />
                  <span>{editingRecordId ? `Edit Project Planning` : 'Create New Project Planning'}</span>
                </h2>
                <p className="text-xs text-[#70665F]">
                  Assign planned tasks, timelines, team members, and milestones for project execution.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('list')}
                className="px-4 py-2 bg-white border border-[#EBE3DB] hover:bg-slate-50 text-[#544B45] font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Project Planning</span>
              </button>
            </div>
          </div>

          {/* Form Error Banner */}
          {Object.keys(formErrors).length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Please correct the errors before saving:</span>
              </div>
              <ul className="list-disc pl-6 space-y-0.5">
                {Object.values(formErrors).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* STEP 1: SELECT PROJECT */}
          <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-xs font-bold text-[#211B17] uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-crm-brand-700" />
                <span>1. Select Project For Planning</span>
              </h3>
              <span className="text-[11px] font-mono text-[#7C3AED]">
                {availableProjectsForPlanning.length} Unplanned Projects Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#544B45] mb-1.5">
                  Select Project <span className="text-rose-500">*</span>
                </label>
                {availableProjectsForPlanning.length === 0 && !editingRecordId ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                    All existing projects already have project planning records created. You can create a new project first or edit an existing plan.
                  </div>
                ) : (
                  <select
                    value={selectedProjectId}
                    onChange={(e) => {
                      setSelectedProjectId(e.target.value);
                      setFormErrors({});
                    }}
                    disabled={Boolean(editingRecordId)}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-crm-brand-700 text-[#211B17]"
                  >
                    <option value="">-- Choose Project To Plan --</option>
                    {availableProjectsForPlanning.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.projectNumber} • {p.customerName} • {p.productName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Selected Project Info Preview */}
              {currentSelectedProject ? (
                <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#70665F] block text-[11px]">Customer / Client:</span>
                    <span className="font-bold text-[#211B17] block truncate">{currentSelectedProject.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block text-[11px]">Customer PO:</span>
                    <span className="font-mono text-crm-brand-700 font-bold block">{currentSelectedProject.customerPoNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block text-[11px]">Scope / Machine:</span>
                    <span className="font-semibold text-[#211B17] block truncate">{currentSelectedProject.productName}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block text-[11px]">Committed Delivery:</span>
                    <span className="font-mono text-[#544B45] font-semibold block">{formatDate(currentSelectedProject.deliveryDate)}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs flex items-center justify-center">
                  Select a project from the dropdown to view its customer & machine scope details.
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: PLANNED TASKS TABLE */}
          <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EBE3DB] pb-3">
              <div>
                <h3 className="text-xs font-bold text-[#211B17] uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-crm-brand-700" />
                  <span>2. Planned Tasks, Team Assignees & Timeline</span>
                </h3>
                <p className="text-[11px] text-[#70665F]">
                  Select tasks from Master Tasks library, assign responsible team member(s), and set target timelines.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddTaskRow()}
                  className="px-3.5 py-1.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Task</span>
                </button>
              </div>
            </div>

            {/* Tasks Dynamic Table */}
            <div className="overflow-x-auto border border-[#EBE3DB] rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#544B45] font-bold border-b border-[#EBE3DB]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 min-w-[220px]">Task / Operation (from Task Master)</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Assigned Person(s)</th>
                    <th className="py-2.5 px-3 min-w-[130px]">Start Date</th>
                    <th className="py-2.5 px-3 min-w-[130px]">End Date</th>
                    <th className="py-2.5 px-3 w-24 text-center">Days</th>
                    <th className="py-2.5 px-3 min-w-[120px]">Status</th>
                    <th className="py-2.5 px-3 min-w-[110px]">Progress %</th>
                    <th className="py-2.5 px-3 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]">
                  {taskList.map((task, idx) => (
                    <tr key={task.id} className="hover:bg-slate-50/70 transition">
                      {/* Sr No */}
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-500">
                        {idx + 1}
                      </td>

                      {/* Task Dropdown */}
                      <td className="py-2 px-3">
                        <select
                          value={task.taskName}
                          onChange={(e) => handleUpdateTaskField(task.id, 'taskName', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-semibold text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                        >
                          <option value="">-- Choose Master Task --</option>
                          {Array.from(new Set(masterTasks.map((m) => m.department || 'General'))).map((dept) => (
                            <optgroup key={dept} label={`📁 ${dept} Department`}>
                              {masterTasks
                                .filter((m) => (m.department || 'General') === dept)
                                .map((mt) => (
                                  <option key={mt.id} value={mt.taskName}>
                                    {mt.taskName} {mt.taskCode ? `[${mt.taskCode}]` : ''} ({mt.estimatedDays || 1}d)
                                  </option>
                                ))}
                            </optgroup>
                          ))}
                        </select>
                      </td>

                      {/* Multiple Assignees Selector */}
                      <td className="py-2 px-3">
                        <div className="space-y-1">
                          {/* Selected Badges */}
                          <div className="flex flex-wrap gap-1 min-h-[22px]">
                            {task.assignedPersons && task.assignedPersons.length > 0 ? (
                              task.assignedPersons.map((person, pIdx) => (
                                <span
                                  key={pIdx}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200"
                                >
                                  <span>{person}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleAssignee(task.id, person)}
                                    className="hover:text-rose-600 transition"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">No person assigned</span>
                            )}
                          </div>

                          {/* Quick Employee Selector Dropdown */}
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) handleToggleAssignee(task.id, e.target.value);
                            }}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700"
                          >
                            <option value="">+ Assign Employee...</option>
                            {staffList.map((emp) => {
                              const name =
                                (emp as any).name ||
                                (emp as any).employeeName ||
                                `${(emp as any).firstName || ''} ${(emp as any).lastName || ''}`.trim() ||
                                emp.id;
                              const isAssigned = task.assignedPersons?.includes(name);
                              return (
                                <option key={emp.id} value={name} disabled={isAssigned}>
                                  {isAssigned ? `✓ ${name}` : name} ({(emp as any).department || 'Staff'})
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </td>

                      {/* Start Date */}
                      <td className="py-2 px-3">
                        <input
                          type="date"
                          value={task.startDate}
                          onChange={(e) => handleUpdateTaskField(task.id, 'startDate', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-[#EBE3DB] rounded-lg font-mono text-xs text-[#211B17]"
                        />
                      </td>

                      {/* End Date */}
                      <td className="py-2 px-3">
                        <input
                          type="date"
                          value={task.endDate}
                          onChange={(e) => handleUpdateTaskField(task.id, 'endDate', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-[#EBE3DB] rounded-lg font-mono text-xs text-[#211B17]"
                        />
                      </td>

                      {/* Days count */}
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-100 text-slate-800 border border-slate-200">
                          {task.durationDays || 1}d
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2 px-3">
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateTaskField(task.id, 'status', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-[#EBE3DB] rounded-lg text-xs font-semibold text-[#211B17]"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="on_hold">On Hold</option>
                        </select>
                      </td>

                      {/* Progress % */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="5"
                            value={task.progressPercent}
                            onChange={(e) => handleUpdateTaskField(task.id, 'progressPercent', Number(e.target.value))}
                            className="w-16 px-2 py-1 bg-white border border-[#EBE3DB] rounded-lg font-mono font-bold text-xs text-center text-[#7C3AED]"
                          />
                          <span className="font-mono text-xs font-bold text-slate-500">%</span>
                        </div>
                      </td>

                      {/* Delete Row Button */}
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveTaskRow(task.id)}
                          title="Remove Task"
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Template Suggestions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Quick Add From Master:
                </span>
                {masterTasks.slice(0, 6).map((mt) => (
                  <button
                    key={mt.id}
                    type="button"
                    onClick={() => handleAddTaskRow(mt)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] font-semibold text-slate-700 transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>{mt.taskName}</span>
                  </button>
                ))}
              </div>
              <Link
                href="/projects/tasks"
                className="text-xs font-semibold text-crm-brand-700 hover:text-crm-brand-800 underline decoration-crm-brand-300 flex items-center gap-1"
              >
                <span>Manage Department Tasks Master →</span>
              </Link>
            </div>

            {/* Form Footer Save Button Bar */}
            <div className="p-4 border-t border-[#EBE3DB] bg-[#FAF7F2] -mx-5 -mb-5 rounded-b-2xl flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#544B45]">
                Total Tasks: <strong>{taskList.length}</strong> • Assigned Persons:{' '}
                <strong>
                  {Array.from(new Set(taskList.flatMap((t) => t.assignedPersons || []).filter(Boolean))).length}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="px-4 py-2 bg-white border border-[#EBE3DB] hover:bg-slate-50 text-[#544B45] font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Project Planning</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW PROJECT PLANNING DETAIL                                      */}
      {/* ========================================================================= */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-[#EBE3DB] bg-[#FAF7F2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-crm-brand-700" />
                <h3 className="font-bold text-[#211B17] text-sm">
                  Project Planning Details — {viewingRecord.projectNumber} ({viewingRecord.planningNumber})
                </h3>
              </div>
              <button
                onClick={() => setViewingRecord(null)}
                className="p-1 rounded-lg text-[#70665F] hover:bg-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Project Meta Card */}
              <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[#70665F] block text-[11px]">Customer:</span>
                  <span className="font-bold text-[#211B17] block">{viewingRecord.customerName}</span>
                </div>
                <div>
                  <span className="text-[#70665F] block text-[11px]">Machine Scope:</span>
                  <span className="font-semibold text-[#211B17] block truncate">{viewingRecord.productName}</span>
                </div>
                <div>
                  <span className="text-[#70665F] block text-[11px]">Customer PO:</span>
                  <span className="font-mono text-crm-brand-700 font-bold block">{viewingRecord.customerPoNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#70665F] block text-[11px]">Overall Progress:</span>
                  <span className="font-mono text-[#7C3AED] font-bold block">{viewingRecord.overallProgress || 0}%</span>
                </div>
              </div>

              {/* Tasks List Table */}
              <div className="border border-[#EBE3DB] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-[#544B45] font-bold border-b border-[#EBE3DB]">
                    <tr>
                      <th className="py-2 px-3 w-8 text-center">#</th>
                      <th className="py-2 px-3">Task Name</th>
                      <th className="py-2 px-3">Assigned Team</th>
                      <th className="py-2 px-3">Timeline</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 text-right">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE3DB]">
                    {viewingRecord.tasks?.map((t, idx) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-center font-mono text-slate-500 font-bold">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{t.taskName}</td>
                        <td className="py-2 px-3">
                          {t.assignedPersons && t.assignedPersons.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {t.assignedPersons.map((p, pIdx) => (
                                <span
                                  key={pIdx}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                          {formatDate(t.startDate)} → {formatDate(t.endDate)} ({t.durationDays || 1}d)
                        </td>
                        <td className="py-2 px-3">
                          <StatusBadge status={(t.status || 'pending') as any} />
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#7C3AED]">
                          {t.progressPercent || 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-[#EBE3DB] bg-[#FAF7F2] -mx-5 -mb-5 flex justify-end gap-2">
                <button
                  onClick={() => {
                    const rec = viewingRecord;
                    setViewingRecord(null);
                    handleOpenEdit(rec);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Edit This Plan
                </button>
                <button
                  onClick={() => setViewingRecord(null)}
                  className="px-4 py-2 bg-white border border-[#EBE3DB] hover:bg-slate-50 text-[#544B45] font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                               */}
      {/* ========================================================================= */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <Trash2 className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-[#211B17]">Delete Project Planning?</h3>
            <p className="text-xs text-[#70665F]">
              Are you sure you want to delete the planning schedule for{' '}
              <strong className="text-[#211B17]">{deletingRecord.projectNumber}</strong>? The project will become available for new planning.
            </p>
            <div className="pt-3 border-t border-[#EBE3DB] flex justify-center gap-3">
              <button
                onClick={() => setDeletingRecord(null)}
                className="px-4 py-2 bg-white border border-[#EBE3DB] text-[#544B45] font-semibold text-xs rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg shadow-md transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
