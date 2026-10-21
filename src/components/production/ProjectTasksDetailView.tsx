'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useERP } from '../../context/ERPContext';
import { ProjectPlanningRecord, PlannedTaskItem, TaskProgressLog } from '../../types/crm';
import { formatDate } from '../../lib/utils';
import {
  Factory,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Calendar,
  Layers,
  ArrowLeft,
  Search,
  Filter,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Briefcase,
  Activity,
  Workflow,
  CheckSquare,
  Send,
  Edit3,
  Save,
  MapPin,
  X,
  History,
} from 'lucide-react';

const QUICK_WORK_DONE_PRESETS = [
  'Plate Cutting & Beveling Complete (Cutting Done)',
  'Shell Rolling & Bending Work Completed (Rolling & Bending)',
  'Joint Fit-up & Tack Pass Cleared (Fit-up & Tack Pass)',
  'Root & Final Seam Welding Done (Full Penetration Welding)',
  'Dressing & Surface Grinding Complete (Grinding & Surface Clean)',
  'Nozzle & Flange Fitment Complete (Nozzle / Flange Fitted)',
  'Hydro & NDT Quality Test Cleared (Hydro / NDT Cleared)',
  'Mechanical Assembly Complete (Final Assembly Done)',
];

const QUICK_STAGE_PRESETS = [
  'Bay 1 - CNC Plasma / Laser Bay',
  'Bay 2 - Plate Rolling & Hydraulic Press',
  'Bay 3 - Fabrication & Tack Fitment',
  'Bay 4 - SAW / MIG Welding Station',
  'Bay 5 - Machine Shop / Lathe & VMC',
  'Bay 6 - Sand Blasting & Painting',
  'QC Inspection Bay - Cleared for FAT',
];

interface ProjectTasksDetailViewProps {
  planId: string;
}

export function ProjectTasksDetailView({ planId }: ProjectTasksDetailViewProps) {
  const router = useRouter();
  const {
    projectPlanningRecords,
    updateProjectPlanningTaskStatus,
    updateProjectPlanningTaskSupervisorProgress,
    dispatchProjectPlanningToDepartments,
    employees,
    availableEmployees,
  } = useERP();

  // Find target plan by ID, project number, or planning number
  const currentPlan = useMemo(() => {
    if (!planId) return null;
    const clean = planId.trim().toLowerCase();
    return (
      projectPlanningRecords.find(
        (r) =>
          r.id.toLowerCase() === clean ||
          r.projectNumber.toLowerCase() === clean ||
          r.planningNumber.toLowerCase() === clean ||
          r.projectNumber.toLowerCase().replace(/[^a-z0-9]/g, '') === clean.replace(/[^a-z0-9]/g, '')
      ) || null
    );
  }, [projectPlanningRecords, planId]);

  // Active staff list
  const staffList = useMemo(() => {
    const list = employees && employees.length > 0 ? employees : availableEmployees || [];
    return list.filter((e) => (e as any).status !== 'inactive' && (e as any).status !== 'suspended');
  }, [employees, availableEmployees]);

  // Toast Notifications
  const [toastMessage, setToastMessage] = useState<{ title: string; text: string } | null>(null);
  const showToast = (title: string, text: string) => {
    setToastMessage({ title, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Local Task Filters
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'all' | 'in_progress' | 'completed' | 'pending'>('all');

  // Supervisor Modal State
  const [activeModalData, setActiveModalData] = useState<{
    planId: string;
    projectNumber: string;
    customerName: string;
    productName: string;
    task: PlannedTaskItem;
  } | null>(null);

  const [modalStatus, setModalStatus] = useState<'pending' | 'in_progress' | 'completed' | 'on_hold'>('in_progress');
  const [modalProgress, setModalProgress] = useState<number>(25);
  const [modalWorkDone, setModalWorkDone] = useState<string>('');
  const [modalStage, setModalStage] = useState<string>('');
  const [modalBay, setModalBay] = useState<string>('');
  const [modalSupervisor, setModalSupervisor] = useState<string>('');
  const [modalNotes, setModalNotes] = useState<string>('');

  const handleOpenSupervisorModal = (task: PlannedTaskItem) => {
    if (!currentPlan) return;
    setActiveModalData({
      planId: currentPlan.id,
      projectNumber: currentPlan.projectNumber,
      customerName: currentPlan.customerName,
      productName: currentPlan.productName,
      task,
    });
    setModalStatus((task.status as any) || 'in_progress');
    setModalProgress(task.progressPercent || (task.status === 'completed' ? 100 : 25));
    setModalWorkDone(task.workDoneDetails || '');
    setModalStage(task.stageReached || '');
    setModalBay(task.workstationOrBay || '');
    setModalSupervisor(task.supervisorName || task.assignedPersons?.[0] || 'Shopfloor Supervisor');
    setModalNotes(task.remarks || '');
  };

  const handleQuickPercent = (task: PlannedTaskItem, pct: number) => {
    if (!currentPlan) return;
    const isFinished = pct >= 100;
    updateProjectPlanningTaskSupervisorProgress(currentPlan.id, task.id, {
      progressPercent: pct,
      status: isFinished ? 'completed' : 'in_progress',
      workDoneDetails: isFinished ? 'Operation 100% Completed' : `Progress at ${pct}%`,
      stageReached: isFinished ? 'Final Inspection Ready' : task.stageReached || 'Active Shop Floor Bay',
      supervisorName: task.supervisorName || 'Shopfloor Supervisor',
    });

    showToast(
      isFinished ? 'Operation Completed' : 'Progress Updated',
      `"${task.taskName}" set to ${pct}%.`
    );
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalData) return;

    const is100 = modalProgress >= 100 || modalStatus === 'completed';
    const finalPct = is100 ? 100 : modalProgress;
    const finalStatus: 'pending' | 'in_progress' | 'completed' | 'on_hold' = is100 ? 'completed' : modalStatus;

    updateProjectPlanningTaskSupervisorProgress(activeModalData.planId, activeModalData.task.id, {
      status: finalStatus,
      progressPercent: finalPct,
      workDoneDetails: modalWorkDone || (is100 ? 'Operation 100% Completed' : 'Work In Progress'),
      stageReached: modalStage || 'Shopfloor Bay',
      workstationOrBay: modalBay,
      supervisorName: modalSupervisor || 'Shopfloor Supervisor',
      notes: modalNotes,
    });

    showToast(
      is100 ? 'Operation 100% Complete' : 'Supervisor Log Saved',
      `Progress details updated for "${activeModalData.task.taskName}".`
    );

    setActiveModalData(null);
  };

  const handleDispatchPlan = (id: string, projectNumber: string) => {
    dispatchProjectPlanningToDepartments(id);
    showToast('Plan Dispatched', `Project ${projectNumber} sent to Production, Design, Store & Purchase departments.`);
  };

  const handleStartTask = (taskId: string, taskName: string) => {
    if (!currentPlan) return;
    updateProjectPlanningTaskStatus(currentPlan.id, taskId, 'in_progress', 25);
    showToast('Task Started', `Operation "${taskName}" is now In-Progress.`);
  };

  const handleCompleteTask = (taskId: string, taskName: string) => {
    if (!currentPlan) return;
    updateProjectPlanningTaskStatus(currentPlan.id, taskId, 'completed', 100);

    const taskIndex = currentPlan.tasks.findIndex((t) => t.id === taskId);
    const nextTask = currentPlan.tasks[taskIndex + 1];
    const isLast = taskIndex === currentPlan.tasks.length - 1;

    showToast(
      isLast ? 'All Tasks Finished' : 'Task Completed',
      isLast
        ? `All operations completed for ${currentPlan.projectNumber}!`
        : `"${taskName}" completed. Next operation "${nextTask?.taskName || 'Next Operation'}" is ready to start!`
    );
  };

  const handleReopenTask = (taskId: string, taskName: string) => {
    if (!currentPlan) return;
    updateProjectPlanningTaskStatus(currentPlan.id, taskId, 'in_progress', 50);
    showToast('Task Reopened', `Operation "${taskName}" reopened for adjustment.`);
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (!currentPlan?.tasks) return [];
    return currentPlan.tasks.filter((t) => {
      // Status filter
      if (taskStatusFilter !== 'all') {
        const isDone = t.status === 'completed' || (t.progressPercent || 0) >= 100;
        const isInProg = t.status === 'in_progress' && !isDone;
        const isPend = !isDone && !isInProg;
        if (taskStatusFilter === 'completed' && !isDone) return false;
        if (taskStatusFilter === 'in_progress' && !isInProg) return false;
        if (taskStatusFilter === 'pending' && !isPend) return false;
      }

      // Search Query
      if (taskSearchQuery.trim()) {
        const q = taskSearchQuery.toLowerCase().trim();
        const match =
          t.taskName.toLowerCase().includes(q) ||
          (t.department && t.department.toLowerCase().includes(q)) ||
          (t.masterTaskId && t.masterTaskId.toLowerCase().includes(q)) ||
          (t.stageReached && t.stageReached.toLowerCase().includes(q)) ||
          (t.workstationOrBay && t.workstationOrBay.toLowerCase().includes(q)) ||
          (t.workDoneDetails && t.workDoneDetails.toLowerCase().includes(q)) ||
          (t.assignedPersons || []).some((p) => p.toLowerCase().includes(q)) ||
          (t.supervisorName && t.supervisorName.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [currentPlan, taskStatusFilter, taskSearchQuery]);

  if (!currentPlan) {
    return (
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <button
            onClick={() => router.push('/production/planning')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Production Planning</span>
          </button>
        </div>

        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Workflow className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-lg font-bold text-slate-800">Project Plan Not Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            The project planning record with identifier <strong>"{planId}"</strong> could not be located in the system.
          </p>
          <div className="pt-2">
            <Link
              href="/production/planning"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-black transition"
            >
              <span>Return to Production Planning</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = currentPlan.tasks?.filter((t) => t.status === 'completed' || (t.progressPercent || 0) >= 100).length || 0;
  const inProgressCount = currentPlan.tasks?.filter((t) => t.status === 'in_progress' && (t.progressPercent || 0) < 100).length || 0;
  const totalCount = currentPlan.tasks?.length || 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#211B17] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[#EBE3DB]/20 text-xs animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="font-bold text-emerald-300">{toastMessage.title}</div>
            <div className="text-slate-300 text-[11px]">{toastMessage.text}</div>
          </div>
        </div>
      )}

      {/* Top Header & Back Navigation Bar */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
          DASHBOARD / PRODUCTION &amp; SHOP FLOOR / PRODUCTION PLANNING / {currentPlan.projectNumber}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/production/planning')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>← Back to Production Planning</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
                {currentPlan.projectNumber}
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                {currentPlan.planningNumber}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Dispatch / Send button */}
            <button
              type="button"
              onClick={() => handleDispatchPlan(currentPlan.id, currentPlan.projectNumber)}
              className={`px-3.5 py-2 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 ${
                currentPlan.isDispatched
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{currentPlan.isDispatched ? 'Resend to Departments' : 'Send to Departments'}</span>
            </button>

            <Link
              href={`/projects/planning?mode=edit&id=${currentPlan.id}`}
              className="px-3.5 py-2 bg-white border border-[#EBE3DB] hover:bg-slate-50 text-xs font-bold text-slate-700 rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-purple-700" />
              <span>Edit in Master Planning</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Project Overview Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  (currentPlan.overallProgress || 0) >= 100
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : (currentPlan.overallProgress || 0) > 0
                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                {(currentPlan.overallProgress || 0) >= 100
                  ? 'Completed Project'
                  : (currentPlan.overallProgress || 0) > 0
                  ? 'Active Shop Floor Production'
                  : 'Planned Schedule'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Created: {formatDate(currentPlan.createdAt)}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#211B17]">
              {currentPlan.customerName}
            </h1>
            <p className="text-xs font-medium text-slate-600">
              {currentPlan.productName}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
              <div>
                Customer PO: <strong className="font-mono text-purple-700">{currentPlan.customerPoNumber || 'N/A'}</strong>
              </div>
              <div>•</div>
              <div>
                Delivery Date: <strong>{formatDate(currentPlan.deliveryDate)}</strong>
              </div>
              <div>•</div>
              <div>
                Total Operations: <strong>{totalCount} Tasks</strong>
              </div>
            </div>
          </div>

          {/* Big Progress Meter */}
          <div className="bg-[#FAF7F2] p-4.5 rounded-xl border border-[#EBE3DB] min-w-[260px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#544B45]">Overall Project Progress</span>
              <span className="text-xl font-black text-[#7C3AED] font-mono">
                {currentPlan.overallProgress || 0}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (currentPlan.overallProgress || 0) >= 100
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-[#7C3AED] to-emerald-500'
                }`}
                style={{ width: `${Math.min(currentPlan.overallProgress || 0, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>
                {completedCount} of {totalCount} Tasks Completed
              </span>
              <span className="font-bold text-emerald-700">
                {(currentPlan.overallProgress || 0) >= 100 ? '100% Done' : `${inProgressCount} Active`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Execution Board */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Header & Local Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
          <div>
            <h2 className="text-base font-black text-[#211B17] flex items-center gap-2">
              <Workflow className="w-5 h-5 text-amber-600" />
              <span>Project Operations &amp; Tasks Board</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sequential list of planned shopfloor operations for <strong>{currentPlan.projectNumber}</strong>. Update progress, stage reached, and work details.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks, bay, team..."
                value={taskSearchQuery}
                onChange={(e) => setTaskSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#211B17]"
              />
            </div>

            <select
              value={taskStatusFilter}
              onChange={(e) => setTaskStatusFilter(e.target.value as any)}
              className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#211B17]"
            >
              <option value="all">All Tasks ({totalCount})</option>
              <option value="in_progress">In Progress ({inProgressCount})</option>
              <option value="completed">Completed ({completedCount})</option>
              <option value="pending">Pending ({totalCount - completedCount - inProgressCount})</option>
            </select>
          </div>
        </div>

        {/* List of Tasks */}
        {!filteredTasks || filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-[#FAF7F2] rounded-xl border border-dashed border-slate-200">
            <p className="text-sm font-semibold text-slate-600">
              {taskSearchQuery ? 'No tasks matched your search query.' : 'No tasks have been planned for this project yet.'}
            </p>
            {taskSearchQuery ? (
              <button
                onClick={() => setTaskSearchQuery('')}
                className="mt-2 text-xs font-bold text-amber-700 hover:underline"
              >
                Clear search
              </button>
            ) : (
              <Link
                href={`/projects/planning?mode=edit&id=${currentPlan.id}`}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 text-white font-bold rounded-xl text-xs hover:bg-purple-800 transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span>+ Add Tasks in Project Planning</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task: PlannedTaskItem, idx: number) => {
              const isCompleted = task.status === 'completed' || (task.progressPercent || 0) >= 100;
              const isInProgress = task.status === 'in_progress' && !isCompleted;

              return (
                <div
                  key={task.id || idx}
                  className={`p-4 rounded-xl border transition-all ${
                    isCompleted
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : isInProgress
                      ? 'bg-blue-50/50 border-blue-300 shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-[#FAF7F2] border-[#EBE3DB]'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Task Number & Title */}
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isInProgress
                            ? 'bg-blue-600 text-white animate-pulse'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-[#211B17]">
                            {task.taskName}
                          </span>
                          {task.department && (
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                              {task.department}
                            </span>
                          )}
                          {task.masterTaskId && (
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                              Code: {task.masterTaskId}
                            </span>
                          )}
                          {isInProgress && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
                              <Activity className="w-3 h-3 text-blue-600 animate-spin" />
                              Active Stage
                            </span>
                          )}
                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-700" />
                              100% Completed
                            </span>
                          )}
                        </div>

                        {/* Supervisor Stage Reached & Work Done Banner */}
                        {(task.stageReached || task.workDoneDetails || task.supervisorName) && (
                          <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2 text-xs text-[#211B17] space-y-0.5">
                            <div className="flex flex-wrap items-center gap-3">
                              {task.supervisorName && (
                                <span className="font-bold text-slate-800 flex items-center gap-1">
                                  <Users className="w-3 h-3 text-amber-600" />
                                  {task.supervisorName}
                                </span>
                              )}
                              {task.stageReached && (
                                <span className="text-amber-900 font-semibold flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-amber-600" />
                                  {task.stageReached} {task.workstationOrBay ? `(${task.workstationOrBay})` : ''}
                                </span>
                              )}
                            </div>
                            {task.workDoneDetails && (
                              <div className="text-slate-700 italic text-[11px]">
                                "{task.workDoneDetails}"
                              </div>
                            )}
                          </div>
                        )}

                        {/* Task Metadata: Who & When */}
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 pt-0.5">
                          {/* Assigned Persons */}
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-purple-600" />
                            <span className="text-slate-500 text-[11px]">Team:</span>
                            {task.assignedPersons && task.assignedPersons.length > 0 ? (
                              <div className="flex flex-wrap items-center gap-1">
                                {task.assignedPersons.map((p, pIdx) => (
                                  <span
                                    key={pIdx}
                                    className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-purple-50 text-purple-900 border border-purple-200"
                                  >
                                    {p}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="italic text-slate-400">Not Assigned</span>
                            )}
                          </div>

                          {/* Timeline */}
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-slate-500">Timeline:</span>
                            <strong className="text-slate-800">{formatDate(task.startDate)}</strong>
                            <span className="text-slate-400">to</span>
                            <strong className="text-slate-800">{formatDate(task.endDate)}</strong>
                            {task.durationDays ? (
                              <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold font-sans">
                                {task.durationDays} Days
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Execution & Supervisor Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2 lg:pt-0">
                      {/* Progress Meter with Quick Select */}
                      <div className="space-y-1 w-full sm:w-44">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[11px] text-slate-500">Progress:</span>
                          <span className={`font-bold ${isCompleted ? 'text-emerald-700' : 'text-[#7C3AED]'}`}>
                            {task.progressPercent || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(task.progressPercent || 0, 100)}%` }}
                          />
                        </div>

                        {/* Quick percentage buttons */}
                        <div className="flex items-center justify-between gap-1 pt-1">
                          {[25, 50, 75, 100].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => handleQuickPercent(task, pct)}
                              className={`px-1.5 py-0.5 text-[10px] font-bold rounded border transition cursor-pointer ${
                                (task.progressPercent || 0) === pct
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Supervisor Detail Fill Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenSupervisorModal(task)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1 cursor-pointer"
                        title="Open Supervisor Progress Log Modal"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Update Details</span>
                      </button>

                      {/* Primary Action Button */}
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <button
                            type="button"
                            onClick={() => handleReopenTask(task.id, task.taskName)}
                            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
                            title="Reopen this task for adjustments"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                            <span>Reopen</span>
                          </button>
                        ) : isInProgress ? (
                          <button
                            type="button"
                            onClick={() => handleCompleteTask(task.id, task.taskName)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Check className="w-4 h-4" />
                            <span>Mark 100% Complete</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartTask(task.id, task.taskName)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Start Work</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Supervisor Progress Update Modal */}
      {activeModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="bg-[#211B17] text-white p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <Factory className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Supervisor Progress Log</span>
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Project: <strong className="text-amber-400 font-mono">{activeModalData.projectNumber}</strong> • {activeModalData.customerName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalData(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Task Info Pill */}
            <div className="bg-amber-50/70 border-b border-amber-200 p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-slate-500 text-[11px]">Operation / Task:</span>
                <div className="font-black text-[#211B17] text-sm">{activeModalData.task.taskName}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                  {activeModalData.task.department || 'Production'}
                </span>
                <span className="font-mono text-xs text-slate-600">
                  Target: {formatDate(activeModalData.task.endDate)}
                </span>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveModal} className="p-5 space-y-4 text-xs">
              {/* Field 1: Progress Slider + Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>Operation Progress:</span>
                    <span className="font-mono text-sm text-purple-700">{modalProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={modalProgress}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setModalProgress(val);
                      if (val >= 100) setModalStatus('completed');
                      else if (val > 0) setModalStatus('in_progress');
                    }}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between gap-1 pt-1">
                    {[0, 25, 50, 75, 100].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setModalProgress(p);
                          if (p >= 100) setModalStatus('completed');
                          else if (p > 0) setModalStatus('in_progress');
                        }}
                        className={`px-2 py-1 text-[10px] font-bold rounded border cursor-pointer ${
                          modalProgress === p
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Task Status:</label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as 'pending' | 'in_progress' | 'completed' | 'on_hold')}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#211B17]"
                  >
                    <option value="pending">Pending / Not Started</option>
                    <option value="in_progress">In Progress (Active Work)</option>
                    <option value="completed">Completed (100% Finished)</option>
                    <option value="on_hold">On Hold (Material / Drawing Delay)</option>
                  </select>
                  <span className="text-[10px] text-slate-400">
                    Auto changes to "Completed" when progress reaches 100%.
                  </span>
                </div>
              </div>

              {/* Field 2: Quick Presets for Work Done Details */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">
                  Work Done Details (1-Tap Quick Shop Floor Presets):
                </label>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {QUICK_WORK_DONE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setModalWorkDone(preset)}
                      className="px-2 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 rounded-lg border border-slate-200 transition cursor-pointer text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={2}
                  value={modalWorkDone}
                  onChange={(e) => setModalWorkDone(e.target.value)}
                  placeholder="Enter detailed description of what was completed on the shopfloor..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#211B17]"
                />
              </div>

              {/* Field 3: Stage Reached & Bay Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    Stage Reached:
                  </label>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {QUICK_STAGE_PRESETS.slice(0, 4).map((stage, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => {
                          setModalStage(stage);
                          setModalBay(stage.split('-')[0].trim());
                        }}
                        className="px-1.5 py-0.5 text-[9.5px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-200 cursor-pointer"
                      >
                        {stage.split('-')[0].trim()}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={modalStage}
                    onChange={(e) => setModalStage(e.target.value)}
                    placeholder="e.g. Bay 3 - Shell Rolling & Tack Fitment"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#211B17]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    Workstation / Machine / Bay:
                  </label>
                  <input
                    type="text"
                    value={modalBay}
                    onChange={(e) => setModalBay(e.target.value)}
                    placeholder="e.g. Bay 2, Machine #04, Plasma Table"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#211B17]"
                  />
                  <span className="text-[10px] text-slate-400">
                    Identify specific shopfloor location or machine assigned
                  </span>
                </div>
              </div>

              {/* Field 4: Supervisor Name & Remarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    Supervisor Name:
                  </label>
                  <select
                    value={modalSupervisor}
                    onChange={(e) => setModalSupervisor(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#211B17]"
                  >
                    <option value="">-- Choose Supervisor --</option>
                    {staffList.map((emp) => {
                      const name =
                        (emp as any).name ||
                        (emp as any).employeeName ||
                        `${(emp as any).firstName || ''} ${(emp as any).lastName || ''}`.trim() ||
                        emp.id;
                      return (
                        <option key={emp.id} value={name}>
                          {name} ({(emp as any).department || 'Shopfloor'})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    Notes / Bottleneck:
                  </label>
                  <input
                    type="text"
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="Any material delay, drawing question, or instruction..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#211B17]"
                  />
                </div>
              </div>

              {/* Previous History / Logs */}
              {activeModalData.task.progressLogs && activeModalData.task.progressLogs.length > 0 && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px]">
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>Previous Update History</span>
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {activeModalData.task.progressLogs.map((log: TaskProgressLog) => (
                      <div
                        key={log.id}
                        className="p-2 bg-white rounded-lg border border-slate-100 text-[11px] flex items-start justify-between gap-2"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{log.supervisorName}:</span>{' '}
                          <span className="text-slate-600">{log.workDoneDetails || 'Updated'}</span>
                          {log.stageReached && (
                            <span className="text-amber-800 font-mono block text-[10px]">
                              Stage: {log.stageReached} {log.workstationOrBay ? `(${log.workstationOrBay})` : ''}
                            </span>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-bold font-mono text-purple-700">{log.progressPercent}%</span>
                          <span className="text-[9.5px] text-slate-400 block">{formatDate(log.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveModalData(null)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Progress</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
