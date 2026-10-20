'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  Check,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Activity,
  Workflow,
  Eye,
  CheckSquare,
  HelpCircle,
  Send,
  Edit3,
  Save,
  MapPin,
  Sliders,
  X,
  History,
  ClipboardList,
} from 'lucide-react';

// Common shopfloor quick presets for 1-tap supervisor updates
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

interface ProductionTaskRow {
  planId: string;
  projectNumber: string;
  planningNumber: string;
  customerName: string;
  productName: string;
  customerPoNumber?: string;
  deliveryDate?: string;
  isDispatched?: boolean;
  planStatus: string;
  task: PlannedTaskItem;
  taskIndex: number;
  totalPlanTasks: number;
}

export interface ProductionPlanningHubProps {
  initialTab?: 'planning' | 'supervisor';
}

function ProductionPlanningHubContent({ initialTab = 'planning' }: ProductionPlanningHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    projectPlanningRecords,
    updateProjectPlanningTaskStatus,
    updateProjectPlanningTaskSupervisorProgress,
    dispatchProjectPlanningToDepartments,
    employees,
    availableEmployees,
    isInitialLoading,
  } = useERP();

  // Active staff list for supervisor selection
  const staffList = useMemo(() => {
    const list = employees && employees.length > 0 ? employees : availableEmployees || [];
    return list.filter((e) => (e as any).status !== 'inactive' && (e as any).status !== 'suspended');
  }, [employees, availableEmployees]);

  // Main navigation tab: 'planning' (projects list) | 'supervisor' (unified supervisor operations hub) | 'project-tasks' (individual project detailed board)
  const [activeTab, setActiveTab] = useState<'planning' | 'supervisor' | 'project-tasks'>(() => {
    const paramTab = searchParams.get('tab');
    if (paramTab === 'supervisor' || initialTab === 'supervisor') return 'supervisor';
    const paramProj = searchParams.get('projectId') || searchParams.get('id');
    if (paramProj) return 'project-tasks';
    return 'planning';
  });

  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
    return searchParams.get('projectId') || searchParams.get('id') || '';
  });

  // Handle URL changes
  useEffect(() => {
    const paramTab = searchParams.get('tab');
    const paramProj = searchParams.get('projectId') || searchParams.get('id');
    if (paramProj) {
      setSelectedPlanId(paramProj);
      setActiveTab('project-tasks');
    } else if (paramTab === 'supervisor') {
      setActiveTab('supervisor');
    }
  }, [searchParams]);

  // Toast Notifications
  const [toastMessage, setToastMessage] = useState<{ title: string; text: string } | null>(null);
  const showToast = (title: string, text: string) => {
    setToastMessage({ title, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // --- PLANNING TAB FILTERS ---
  const [planningSearchQuery, setPlanningSearchQuery] = useState<string>('');
  const [planningStatusFilter, setPlanningStatusFilter] = useState<'all' | 'in_progress' | 'completed' | 'planned'>('all');

  // --- SUPERVISOR TAB FILTERS ---
  const [supervisorProjectFilter, setSupervisorProjectFilter] = useState<string>('all');
  const [supervisorStatusFilter, setSupervisorStatusFilter] = useState<string>('all');
  const [supervisorDeptTab, setSupervisorDeptTab] = useState<'production' | 'all'>('production');
  const [supervisorSearchQuery, setSupervisorSearchQuery] = useState<string>('');
  const [supervisorEmployeeFilter, setSupervisorEmployeeFilter] = useState<string>('all');

  // --- SUPERVISOR PROGRESS MODAL STATE ---
  const [activeModalData, setActiveModalData] = useState<{
    planId: string;
    projectNumber: string;
    customerName: string;
    productName: string;
    task: PlannedTaskItem;
  } | null>(null);

  const [modalStatus, setModalStatus] = useState<'pending' | 'in_progress' | 'completed' | 'on_hold'>('in_progress');
  const [modalProgress, setModalProgress] = useState<number>(50);
  const [modalWorkDone, setModalWorkDone] = useState<string>('');
  const [modalStage, setModalStage] = useState<string>('');
  const [modalBay, setModalBay] = useState<string>('');
  const [modalSupervisor, setModalSupervisor] = useState<string>('');
  const [modalNotes, setModalNotes] = useState<string>('');

  // Dispatch Plan to All Departments
  const handleDispatchPlan = (planId: string, projNo: string) => {
    const res = dispatchProjectPlanningToDepartments(planId);
    if (res.success) {
      showToast(
        '🚀 Plan Dispatched to Departments!',
        `Tasks for ${projNo} sent to ${res.dispatchedDepartments.join(', ')}. Audio alerts & department pages updated!`
      );
    }
  };

  // Currently Selected Project Record for Single Project Task Execution
  const currentPlan = useMemo(() => {
    if (!selectedPlanId) return projectPlanningRecords[0] || null;
    return (
      projectPlanningRecords.find((r) => r.id === selectedPlanId || r.projectId === selectedPlanId || r.projectNumber === selectedPlanId) ||
      projectPlanningRecords[0] ||
      null
    );
  }, [projectPlanningRecords, selectedPlanId]);

  // Filtered Project Plans for Planning Tab Table
  const filteredProjectPlans = useMemo(() => {
    return projectPlanningRecords.filter((plan) => {
      const q = planningSearchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        plan.planningNumber.toLowerCase().includes(q) ||
        plan.projectNumber.toLowerCase().includes(q) ||
        plan.customerName.toLowerCase().includes(q) ||
        plan.productName.toLowerCase().includes(q) ||
        (plan.customerPoNumber && plan.customerPoNumber.toLowerCase().includes(q));

      const matchStatus =
        planningStatusFilter === 'all' ||
        (planningStatusFilter === 'in_progress' && plan.status === 'in_progress') ||
        (planningStatusFilter === 'completed' && plan.status === 'completed') ||
        (planningStatusFilter === 'planned' && (plan.status === 'planned' || plan.status === 'draft'));

      return matchSearch && matchStatus;
    });
  }, [projectPlanningRecords, planningSearchQuery, planningStatusFilter]);

  // Flattened Tasks Across All Plans for Supervisor Tab
  const allFlattenedTasks = useMemo(() => {
    const rows: ProductionTaskRow[] = [];
    projectPlanningRecords.forEach((plan) => {
      (plan.tasks || []).forEach((task, idx) => {
        rows.push({
          planId: plan.id,
          projectNumber: plan.projectNumber,
          planningNumber: plan.planningNumber,
          customerName: plan.customerName,
          productName: plan.productName,
          customerPoNumber: plan.customerPoNumber,
          deliveryDate: plan.deliveryDate,
          isDispatched: plan.isDispatched,
          planStatus: plan.status,
          task,
          taskIndex: idx,
          totalPlanTasks: plan.tasks?.length || 0,
        });
      });
    });
    return rows;
  }, [projectPlanningRecords]);

  // Filtered Tasks for Supervisor Tab
  const filteredSupervisorTasks = useMemo(() => {
    return allFlattenedTasks.filter((item) => {
      // Department filter
      if (supervisorDeptTab === 'production') {
        const d = (item.task.department || '').toLowerCase();
        const t = (item.task.taskName || '').toLowerCase();
        const isProd =
          d === 'production' ||
          (!item.task.department &&
            !t.includes('design') &&
            !t.includes('drawing') &&
            !t.includes('purchase') &&
            !t.includes('store') &&
            !t.includes('accounting'));
        if (!isProd) return false;
      }

      // Project filter
      if (supervisorProjectFilter !== 'all') {
        if (item.planId !== supervisorProjectFilter && item.projectNumber !== supervisorProjectFilter) {
          return false;
        }
      }

      // Status filter
      if (supervisorStatusFilter !== 'all') {
        if (supervisorStatusFilter === 'completed' && item.task.status !== 'completed' && item.task.progressPercent < 100) return false;
        if (supervisorStatusFilter === 'in_progress' && (item.task.status !== 'in_progress' || item.task.progressPercent >= 100)) return false;
        if (supervisorStatusFilter === 'pending' && (item.task.status !== 'pending' || item.task.progressPercent > 0)) return false;
        if (supervisorStatusFilter === 'on_hold' && item.task.status !== 'on_hold') return false;
      }

      // Supervisor filter
      if (supervisorEmployeeFilter !== 'all') {
        const matchesAssignee = (item.task.assignedPersons || []).includes(supervisorEmployeeFilter);
        const matchesSupervisor = item.task.supervisorName === supervisorEmployeeFilter;
        if (!matchesAssignee && !matchesSupervisor) return false;
      }

      // Search Query
      if (supervisorSearchQuery.trim()) {
        const q = supervisorSearchQuery.toLowerCase().trim();
        const match =
          item.task.taskName.toLowerCase().includes(q) ||
          item.projectNumber.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.productName.toLowerCase().includes(q) ||
          (item.task.workDoneDetails && item.task.workDoneDetails.toLowerCase().includes(q)) ||
          (item.task.stageReached && item.task.stageReached.toLowerCase().includes(q)) ||
          (item.task.workstationOrBay && item.task.workstationOrBay.toLowerCase().includes(q)) ||
          (item.task.assignedPersons || []).some((p) => p.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [allFlattenedTasks, supervisorDeptTab, supervisorProjectFilter, supervisorStatusFilter, supervisorEmployeeFilter, supervisorSearchQuery]);

  // Overall KPI Metrics for Project Planning
  const planningMetrics = useMemo(() => {
    const totalProjects = projectPlanningRecords.length;
    const completedProjects = projectPlanningRecords.filter((r) => r.status === 'completed' || r.overallProgress >= 100).length;
    const inProgressProjects = projectPlanningRecords.filter((r) => r.status === 'in_progress').length;
    const plannedProjects = projectPlanningRecords.filter((r) => r.status === 'planned' || r.status === 'draft').length;

    const allTasks = projectPlanningRecords.flatMap((r) => r.tasks || []);
    const totalTasks = allTasks.length;
    const doneTasks = allTasks.filter((t) => t.status === 'completed' || t.progressPercent === 100).length;

    return {
      totalProjects,
      completedProjects,
      inProgressProjects,
      plannedProjects,
      totalTasks,
      doneTasks,
    };
  }, [projectPlanningRecords]);

  // KPI Metrics for Supervisor Operations
  const supervisorMetrics = useMemo(() => {
    const prodTasks = allFlattenedTasks.filter((item) => {
      const d = (item.task.department || '').toLowerCase();
      const t = (item.task.taskName || '').toLowerCase();
      return (
        d === 'production' ||
        (!item.task.department &&
          !t.includes('design') &&
          !t.includes('drawing') &&
          !t.includes('purchase') &&
          !t.includes('store') &&
          !t.includes('accounting'))
      );
    });

    const total = prodTasks.length;
    const completed = prodTasks.filter((t) => t.task.status === 'completed' || t.task.progressPercent >= 100).length;
    const inProgress = prodTasks.filter((t) => t.task.status === 'in_progress' && t.task.progressPercent < 100).length;
    const pending = prodTasks.filter((t) => (t.task.status === 'pending' || !t.task.status) && t.task.progressPercent === 0).length;
    const avgPct = total > 0 ? Math.round(prodTasks.reduce((acc, curr) => acc + (curr.task.progressPercent || 0), 0) / total) : 0;

    return { total, completed, inProgress, pending, avgPct };
  }, [allFlattenedTasks]);

  // Open Project Tasks View
  const handleOpenProjectTasks = (plan: ProjectPlanningRecord) => {
    setSelectedPlanId(plan.id);
    setActiveTab('project-tasks');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Supervisor Modal
  const handleOpenSupervisorModal = (
    planId: string,
    projectNumber: string,
    customerName: string,
    productName: string,
    task: PlannedTaskItem
  ) => {
    setActiveModalData({
      planId,
      projectNumber,
      customerName,
      productName,
      task,
    });
    setModalStatus(task.status || 'in_progress');
    setModalProgress(task.progressPercent || (task.status === 'completed' ? 100 : 25));
    setModalWorkDone(task.workDoneDetails || '');
    setModalStage(task.stageReached || '');
    setModalBay(task.workstationOrBay || '');
    setModalSupervisor(task.supervisorName || task.assignedPersons?.[0] || 'Shopfloor Supervisor');
    setModalNotes(task.remarks || '');
  };

  // Quick 1-click update from Supervisor Table
  const handleQuickPercent = (planId: string, projectNumber: string, task: PlannedTaskItem, pct: number) => {
    const isFinished = pct >= 100;
    updateProjectPlanningTaskSupervisorProgress(planId, task.id, {
      progressPercent: pct,
      status: isFinished ? 'completed' : 'in_progress',
      workDoneDetails: isFinished ? 'Operation 100% Completed' : `Progress at ${pct}%`,
      stageReached: isFinished ? 'Final Inspection Ready' : task.stageReached || 'Active Shop Floor Bay',
      supervisorName: task.supervisorName || 'Shopfloor Supervisor',
    });

    showToast(
      isFinished ? '🎉 Operation Completed!' : '✓ Progress Updated',
      `"${task.taskName}" for ${projectNumber} set to ${pct}%.`
    );
  };

  // Submit Supervisor Modal
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalData) return;

    const is100 = modalProgress >= 100 || modalStatus === 'completed';
    const finalPct = is100 ? 100 : modalProgress;
    const finalStatus = is100 ? 'completed' : modalStatus;

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
      is100 ? '🎉 Operation 100% Complete!' : '✓ Supervisor Log Saved',
      `Progress details updated for "${activeModalData.task.taskName}" (${activeModalData.projectNumber}).`
    );

    setActiveModalData(null);
  };

  // Project Tasks: Start task (set to 25% or in_progress)
  const handleStartTask = (taskId: string, taskName: string) => {
    if (!currentPlan) return;
    updateProjectPlanningTaskStatus(currentPlan.id, taskId, 'in_progress', 25);
    showToast('Task Started', `Operation "${taskName}" is now In-Progress.`);
  };

  // Project Tasks: Complete task (100%)
  const handleCompleteTask = (taskId: string, taskName: string) => {
    if (!currentPlan) return;
    updateProjectPlanningTaskStatus(currentPlan.id, taskId, 'completed', 100);

    const taskIndex = currentPlan.tasks.findIndex((t) => t.id === taskId);
    const nextTask = currentPlan.tasks[taskIndex + 1];
    const isLast = taskIndex === currentPlan.tasks.length - 1;

    showToast(
      isLast ? '🎉 All Tasks Finished!' : '✓ Task Completed',
      isLast
        ? `All operations completed for ${currentPlan.projectNumber}!`
        : `"${taskName}" completed. Next operation "${nextTask?.taskName || 'Next Operation'}" is ready to start!`
    );
  };

  // Project Tasks: Reopen task
  const handleReopenTask = (taskId: string, taskName: string) => {
    if (!currentPlan) return;
    updateProjectPlanningTaskStatus(currentPlan.id, taskId, 'in_progress', 50);
    showToast('Task Reopened', `Operation "${taskName}" has been reopened for adjustment.`);
  };

  return (
    <div className="space-y-4">
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

      {/* Top Header & Integrated View Switcher */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-0.5">
              DASHBOARD / PRODUCTION &amp; SHOP FLOOR / UNIFIED PLANNING &amp; SUPERVISOR HUB
            </div>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2.5">
              <Factory className="w-6 h-6 text-amber-600" />
              <span>Production Planning &amp; Supervisor Hub</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                Unified Hub
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              All production planning and supervisor activities unified in one single workspace. View project master plans or log shopfloor progress in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/production/worker-daily-routine"
              className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Worker Daily Routine</span>
            </Link>
            <Link
              href="/projects/planning"
              className="px-3.5 py-2 bg-white border border-[#EBE3DB] hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
              <span>Master Project Planning</span>
            </Link>
          </div>
        </div>

        {/* Unified Tab Switcher */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
          <button
            onClick={() => setActiveTab('planning')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'planning'
                ? 'bg-[#211B17] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Workflow className={`w-4 h-4 ${activeTab === 'planning' ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>Project Planning</span>
            <span
              className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'planning' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {planningMetrics.totalProjects}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('supervisor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'supervisor'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Factory className="w-4 h-4" />
            <span>Supervisor Tasks Hub</span>
            <span
              className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'supervisor' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {supervisorMetrics.total}
            </span>
          </button>

          {currentPlan && (
            <button
              onClick={() => setActiveTab('project-tasks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'project-tasks'
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Project Operations: {currentPlan.projectNumber}</span>
              <span
                className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'project-tasks' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
                }`}
              >
                {currentPlan.tasks?.length || 0} Tasks
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PROJECT PLANNING VIEW                                              */}
      {/* ========================================================================= */}
      {activeTab === 'planning' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Planned Projects</span>
                <Briefcase className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-[#211B17]">{planningMetrics.totalProjects}</div>
              <div className="text-[11px] text-slate-500">Total Projects in Pipeline</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-blue-600">
                <span className="text-xs font-semibold uppercase tracking-wider">In Production</span>
                <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
              </div>
              <div className="text-2xl font-black text-blue-700">{planningMetrics.inProgressProjects}</div>
              <div className="text-[11px] text-slate-500">Active Shop Floor Work</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700">{planningMetrics.completedProjects}</div>
              <div className="text-[11px] text-slate-500">100% Finished Projects</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-purple-600">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Tasks Done</span>
                <CheckSquare className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-700">
                {planningMetrics.doneTasks}{' '}
                <span className="text-sm font-semibold text-slate-400">/ {planningMetrics.totalTasks}</span>
              </div>
              <div className="text-[11px] text-slate-500">Shop Floor Operations Done</div>
            </div>
          </div>

          {/* Search Bar & Status Filter */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Project #, Plan #, Customer, Scope..."
                value={planningSearchQuery}
                onChange={(e) => setPlanningSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#211B17]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Status:</span>
              </div>
              <select
                value={planningStatusFilter}
                onChange={(e) => setPlanningStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#211B17]"
              >
                <option value="all">All Projects ({projectPlanningRecords.length})</option>
                <option value="in_progress">In Production ({planningMetrics.inProgressProjects})</option>
                <option value="completed">Completed ({planningMetrics.completedProjects})</option>
                <option value="planned">Planned ({planningMetrics.plannedProjects})</option>
              </select>
            </div>
          </div>

          {/* Table Container: Projects List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4 min-w-[140px]">Project No</th>
                    <th className="py-3 px-4 min-w-[240px]">Customer &amp; Scope</th>
                    <th className="py-3 px-4 min-w-[120px]">Planned Tasks</th>
                    <th className="py-3 px-4 min-w-[200px]">Assigned Team</th>
                    <th className="py-3 px-4 min-w-[140px]">Timeline</th>
                    <th className="py-3 px-4 min-w-[130px]">Progress %</th>
                    <th className="py-3 px-4 min-w-[100px]">Status</th>
                    <th className="py-3 px-4 w-40 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProjectPlans.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Workflow className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600 text-sm">No project plans found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {planningSearchQuery
                            ? 'Try clearing your search query.'
                            : 'Create a project planning record in Project Planning to get started.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredProjectPlans.map((r) => {
                      const totalTasks = r.tasks?.length || 0;
                      const doneTasks = r.tasks?.filter((t) => t.status === 'completed' || t.progressPercent === 100).length || 0;
                      const allAssigned = Array.from(
                        new Set(r.tasks?.flatMap((t) => t.assignedPersons || []).filter(Boolean))
                      );
                      const pct = r.overallProgress || 0;
                      const firstStart = r.tasks?.[0]?.startDate || '';
                      const lastEnd = r.tasks?.[r.tasks.length - 1]?.endDate || r.deliveryDate || '';

                      return (
                        <tr
                          key={r.id}
                          onClick={() => handleOpenProjectTasks(r)}
                          className="hover:bg-amber-50/40 transition cursor-pointer group"
                        >
                          {/* Project No & Plan No */}
                          <td className="py-3.5 px-4 font-mono">
                            <div className="font-bold text-[#7C3AED] group-hover:underline flex items-center gap-1">
                              <span>{r.projectNumber}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Plan: {r.planningNumber}
                            </div>
                          </td>

                          {/* Customer & Scope */}
                          <td className="py-3.5 px-4">
                            <div className="max-w-[240px]">
                              <span className="font-bold text-slate-900 block truncate text-xs">
                                {r.customerName}
                              </span>
                              <span className="text-[11px] text-slate-600 block truncate mt-0.5">
                                {r.productName}
                              </span>
                              {r.customerPoNumber && (
                                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                  PO: {r.customerPoNumber}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Planned Tasks */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span className="font-semibold text-xs text-slate-800 block">
                                {totalTasks} {totalTasks === 1 ? 'Task' : 'Tasks'}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded border font-semibold inline-block ${
                                  doneTasks === totalTasks && totalTasks > 0
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : doneTasks > 0
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                              >
                                {doneTasks} of {totalTasks} Done
                              </span>
                            </div>
                          </td>

                          {/* Assigned Team */}
                          <td className="py-3.5 px-4">
                            {allAssigned.length === 0 ? (
                              <span className="text-slate-400 text-xs italic">Unassigned</span>
                            ) : (
                              <div className="flex flex-wrap items-center gap-1 max-w-[220px]">
                                {allAssigned.slice(0, 3).map((person, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 truncate max-w-[100px]"
                                    title={person}
                                  >
                                    {person}
                                  </span>
                                ))}
                                {allAssigned.length > 3 && (
                                  <span className="text-[10px] text-slate-500 font-bold px-1.5 py-0.5 bg-slate-100 rounded">
                                    +{allAssigned.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Timeline */}
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            <span className="text-slate-700 block font-semibold">{formatDate(firstStart)}</span>
                            <span className="text-slate-500 text-[10px] block">to {formatDate(lastEnd)}</span>
                          </td>

                          {/* Progress % */}
                          <td className="py-3.5 px-4">
                            <div className="w-28 space-y-1">
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
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold inline-flex items-center gap-1 border ${
                                r.status === 'completed' || pct >= 100
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : r.status === 'in_progress' || pct > 0
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {r.status === 'completed' || pct >= 100 ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Completed</span>
                                </>
                              ) : r.status === 'in_progress' || pct > 0 ? (
                                <>
                                  <Activity className="w-3 h-3 text-blue-600" />
                                  <span>In Production</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Planned</span>
                                </>
                              )}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              {r.isDispatched ? (
                                <button
                                  type="button"
                                  onClick={() => handleDispatchPlan(r.id, r.projectNumber)}
                                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-lg text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                                  title="Plan is already dispatched to departments. Click to re-notify."
                                >
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Sent ✓</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleDispatchPlan(r.id, r.projectNumber)}
                                  className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-lg text-[11px] transition shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer animate-pulse"
                                  title="Send and notify all departments for execution"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Send</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenProjectTasks(r)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-[11px] transition shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer"
                              >
                                <span>Tasks</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Count */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <div>
                Showing <strong>{filteredProjectPlans.length}</strong> of <strong>{projectPlanningRecords.length}</strong> planned projects
              </div>
              <div className="text-[11px] text-slate-400">
                Click any project row to open operations and supervisor logs
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SUPERVISOR TASK HUB                                                */}
      {/* ========================================================================= */}
      {activeTab === 'supervisor' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* KPI Cards Banner */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Total Operations</span>
                <Layers className="w-4 h-4 text-slate-600" />
              </div>
              <div className="text-2xl font-black text-[#211B17]">{supervisorMetrics.total}</div>
              <div className="text-[11px] text-slate-500">Shopfloor Tasks Scheduled</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-blue-600">
                <span className="text-[11px] font-semibold uppercase tracking-wider">In Progress</span>
                <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
              </div>
              <div className="text-2xl font-black text-blue-700">{supervisorMetrics.inProgress}</div>
              <div className="text-[11px] text-slate-500">Active Fabrication Bays</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-amber-600">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Pending / Queued</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-700">{supervisorMetrics.pending}</div>
              <div className="text-[11px] text-slate-500">Awaiting Preceding Stages</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-[11px] font-semibold uppercase tracking-wider">100% Finished</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700">{supervisorMetrics.completed}</div>
              <div className="text-[11px] text-slate-500">Cleared for Next Steps</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-purple-600">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Completion</span>
                <CheckSquare className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-700">{supervisorMetrics.avgPct}%</div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${supervisorMetrics.avgPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Undispatched Plans Alert */}
          {projectPlanningRecords.some((p) => !p.isDispatched) && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-[#211B17]">
                    New Plans Waiting to be Sent to Departments
                  </div>
                  <div className="text-[11px] text-slate-600">
                    You have {projectPlanningRecords.filter((p) => !p.isDispatched).length} plan(s) created. Click "Send" to notify Production, Design, Store, and Purchase departments with real-time audio chimes!
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {projectPlanningRecords
                  .filter((p) => !p.isDispatched)
                  .slice(0, 2)
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleDispatchPlan(p.id, p.projectNumber)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send {p.projectNumber}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Supervisor Tabs, Search & Filters Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Department Scope Tab Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
                <button
                  onClick={() => setSupervisorDeptTab('production')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    supervisorDeptTab === 'production'
                      ? 'bg-white text-[#211B17] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Factory className="w-3.5 h-3.5 text-amber-600" />
                  <span>Production Tasks Only</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-mono">
                    {supervisorMetrics.total}
                  </span>
                </button>
                <button
                  onClick={() => setSupervisorDeptTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    supervisorDeptTab === 'all'
                      ? 'bg-white text-[#211B17] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <span>All Departments Cross-View</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
                    {allFlattenedTasks.length}
                  </span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Task, Project #, Customer, Bay..."
                  value={supervisorSearchQuery}
                  onChange={(e) => setSupervisorSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#211B17]"
                />
              </div>
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 text-xs">
              {/* Project Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Project:</span>
                <select
                  value={supervisorProjectFilter}
                  onChange={(e) => setSupervisorProjectFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 text-[#211B17]"
                >
                  <option value="all">All Projects ({projectPlanningRecords.length})</option>
                  {projectPlanningRecords.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectNumber} • {p.customerName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Status:</span>
                <select
                  value={supervisorStatusFilter}
                  onChange={(e) => setSupervisorStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 text-[#211B17]"
                >
                  <option value="all">All Statuses</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending">Pending</option>
                  <option value="completed">100% Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>

              {/* Supervisor Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Supervisor / Team:</span>
                <select
                  value={supervisorEmployeeFilter}
                  onChange={(e) => setSupervisorEmployeeFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 text-[#211B17]"
                >
                  <option value="all">All Supervisors</option>
                  {staffList.map((emp) => {
                    const name =
                      (emp as any).name ||
                      (emp as any).employeeName ||
                      `${(emp as any).firstName || ''} ${(emp as any).lastName || ''}`.trim() ||
                      emp.id;
                    return (
                      <option key={emp.id} value={name}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Clear Filters */}
              {(supervisorProjectFilter !== 'all' ||
                supervisorStatusFilter !== 'all' ||
                supervisorEmployeeFilter !== 'all' ||
                supervisorSearchQuery) && (
                <button
                  onClick={() => {
                    setSupervisorProjectFilter('all');
                    setSupervisorStatusFilter('all');
                    setSupervisorEmployeeFilter('all');
                    setSupervisorSearchQuery('');
                  }}
                  className="text-xs text-rose-600 hover:underline font-semibold ml-auto cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Main Supervisor Task Execution Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-3.5 w-12 text-center">#</th>
                    <th className="py-3 px-4 min-w-[200px]">Project &amp; Client</th>
                    <th className="py-3 px-4 min-w-[220px]">Task / Operation Name</th>
                    <th className="py-3 px-4 min-w-[180px]">Supervisor / Assigned</th>
                    <th className="py-3 px-4 min-w-[180px]">Stage / Bay Reached</th>
                    <th className="py-3 px-4 min-w-[220px]">Work Done Details</th>
                    <th className="py-3 px-4 min-w-[130px]">Timeline</th>
                    <th className="py-3 px-4 min-w-[140px]">Progress %</th>
                    <th className="py-3 px-4 min-w-[100px]">Status</th>
                    <th className="py-3 px-4 w-44 text-center">Supervisor Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSupervisorTasks.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-14 text-center text-slate-400">
                        <Factory className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600 text-sm">No tasks found matching current filters</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Check your search query or dispatch a project plan from Project Planning.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredSupervisorTasks.map((row, idx) => {
                      const t = row.task;
                      const isDone = t.status === 'completed' || t.progressPercent >= 100;
                      const isInProgress = t.status === 'in_progress' && !isDone;

                      return (
                        <tr
                          key={`${row.planId}-${t.id || idx}`}
                          className={`hover:bg-amber-50/30 transition group ${
                            isDone ? 'bg-emerald-50/20' : isInProgress ? 'bg-blue-50/20' : ''
                          }`}
                        >
                          {/* Sr No */}
                          <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-400">
                            {idx + 1}
                          </td>

                          {/* Project & Client */}
                          <td className="py-3 px-4 font-mono">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedPlanId(row.planId);
                                  setActiveTab('project-tasks');
                                }}
                                className="font-bold text-[#7C3AED] hover:underline block text-xs cursor-pointer text-left"
                              >
                                {row.projectNumber}
                              </button>
                              {row.isDispatched ? (
                                <span className="text-[9.5px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  ✓ Sent
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleDispatchPlan(row.planId, row.projectNumber)}
                                  className="text-[9.5px] px-1.5 py-0.2 rounded font-sans font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300 cursor-pointer flex items-center gap-0.5"
                                  title="Click to dispatch notifications to departments"
                                >
                                  <Send className="w-2.5 h-2.5" />
                                  <span>Send</span>
                                </button>
                              )}
                            </div>
                            <div className="font-sans font-bold text-slate-900 text-[11px] truncate max-w-[180px] mt-0.5">
                              {row.customerName}
                            </div>
                            <div className="font-sans text-[10.5px] text-slate-500 truncate max-w-[180px]">
                              {row.productName}
                            </div>
                          </td>

                          {/* Task Name */}
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              <div className="font-bold text-xs text-[#211B17] flex items-center gap-1.5">
                                <span>{t.taskName}</span>
                                {t.department && (
                                  <span className="text-[9.5px] px-1.5 py-0.2 rounded font-mono bg-purple-50 text-purple-700 border border-purple-200">
                                    {t.department}
                                  </span>
                                )}
                              </div>
                              {t.masterTaskId && (
                                <div className="text-[10px] font-mono text-slate-400">
                                  Code: {t.masterTaskId}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Supervisor / Assigned */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              {t.supervisorName ? (
                                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                                  <Users className="w-3 h-3 text-amber-600 flex-shrink-0" />
                                  <span className="truncate max-w-[160px]">{t.supervisorName}</span>
                                </div>
                              ) : null}

                              {t.assignedPersons && t.assignedPersons.length > 0 ? (
                                <div className="flex flex-wrap items-center gap-1">
                                  {t.assignedPersons.map((p, pIdx) => (
                                    <span
                                      key={pIdx}
                                      className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[90px]"
                                      title={p}
                                    >
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">No team assigned</span>
                              )}
                            </div>
                          </td>

                          {/* Stage Reached */}
                          <td className="py-3 px-4">
                            {t.stageReached || t.workstationOrBay ? (
                              <div className="space-y-0.5">
                                {t.stageReached && (
                                  <div className="font-bold text-xs text-amber-900 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-amber-600 flex-shrink-0" />
                                    <span className="truncate max-w-[170px]">{t.stageReached}</span>
                                  </div>
                                )}
                                {t.workstationOrBay && (
                                  <div className="text-[10px] font-mono text-slate-500">
                                    Bay: {t.workstationOrBay}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  handleOpenSupervisorModal(row.planId, row.projectNumber, row.customerName, row.productName, t)
                                }
                                className="text-[11px] text-amber-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <span>+ Record Stage</span>
                              </button>
                            )}
                          </td>

                          {/* Work Done Details */}
                          <td className="py-3 px-4">
                            {t.workDoneDetails ? (
                              <div className="space-y-0.5">
                                <span className="text-[11px] text-slate-800 font-semibold block line-clamp-2" title={t.workDoneDetails}>
                                  "{t.workDoneDetails}"
                                </span>
                                {t.lastUpdatedDate && (
                                  <span className="text-[9.5px] text-slate-400 block font-mono">
                                    Updated: {formatDate(t.lastUpdatedDate)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  handleOpenSupervisorModal(row.planId, row.projectNumber, row.customerName, row.productName, t)
                                }
                                className="text-[11px] text-slate-400 hover:text-amber-700 italic cursor-pointer"
                              >
                                + Record Details (Click to fill)
                              </button>
                            )}
                          </td>

                          {/* Timeline */}
                          <td className="py-3 px-4 font-mono text-[11px]">
                            <span className="text-slate-800 font-semibold block">{formatDate(t.startDate)}</span>
                            <span className="text-slate-500 text-[10px] block">to {formatDate(t.endDate)}</span>
                          </td>

                          {/* Progress % with quick buttons */}
                          <td className="py-3 px-4">
                            <div className="w-28 space-y-1">
                              <div className="flex justify-between text-[10px] font-mono">
                                <span className="text-slate-500">Done</span>
                                <span className={`font-bold ${isDone ? 'text-emerald-700' : 'text-[#7C3AED]'}`}>
                                  {t.progressPercent || 0}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-amber-500'
                                  }`}
                                  style={{ width: `${Math.min(t.progressPercent || 0, 100)}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between gap-1 pt-0.5">
                                {[25, 50, 75, 100].map((pct) => (
                                  <button
                                    key={pct}
                                    type="button"
                                    onClick={() => handleQuickPercent(row.planId, row.projectNumber, t, pct)}
                                    className={`px-1.5 py-0.2 text-[9.5px] font-bold rounded border transition cursor-pointer ${
                                      (t.progressPercent || 0) === pct
                                        ? 'bg-amber-600 text-white border-amber-600'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {pct}%
                                  </button>
                                ))}
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border ${
                                isDone
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : isInProgress
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              {isDone ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>100% Done</span>
                                </>
                              ) : isInProgress ? (
                                <>
                                  <Activity className="w-3 h-3 text-blue-600" />
                                  <span>In Progress</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Pending</span>
                                </>
                              )}
                            </span>
                          </td>

                          {/* Primary Supervisor Action Button */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenSupervisorModal(row.planId, row.projectNumber, row.customerName, row.productName, t)
                              }
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 mx-auto active:scale-95 cursor-pointer w-full"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Update Details</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <div>
                Showing <strong>{filteredSupervisorTasks.length}</strong> shopfloor operations across active projects
              </div>
              <div className="text-[11px] text-slate-400">
                Click <strong>"Update Details"</strong> to record work done details and bay location
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PROJECT TASKS EXECUTION VIEW (SPECIFIC PROJECT OPERATIONS BOARD)   */}
      {/* ========================================================================= */}
      {activeTab === 'project-tasks' && currentPlan && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Back Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setActiveTab('planning')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to Projects List</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
                {currentPlan.projectNumber}
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                {currentPlan.planningNumber}
              </span>

              {/* Send to Departments Button */}
              <button
                type="button"
                onClick={() => handleDispatchPlan(currentPlan.id, currentPlan.projectNumber)}
                className={`px-3 py-1.5 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 ${
                  currentPlan.isDispatched
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {currentPlan.isDispatched ? 'Resend to Departments' : 'Send to Departments'}
                </span>
              </button>

              <button
                onClick={() => {
                  setSupervisorProjectFilter(currentPlan.id);
                  setActiveTab('supervisor');
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <Factory className="w-3.5 h-3.5" />
                <span>Filter in Supervisor Hub</span>
              </button>

              <Link
                href={`/projects/planning?mode=edit&id=${currentPlan.id}`}
                className="px-3 py-1.5 bg-white border border-[#EBE3DB] hover:bg-slate-50 text-xs font-bold text-slate-700 rounded-xl transition flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5 text-purple-700" />
                <span>Edit in Project Planning</span>
              </Link>
            </div>
          </div>

          {/* Project Details Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                    Active Production Project
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Created: {formatDate(currentPlan.createdAt)}
                  </span>
                </div>
                <h2 className="text-xl font-black text-[#211B17]">
                  {currentPlan.customerName} — {currentPlan.productName}
                </h2>
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
                    Total Operations:{' '}
                    <strong>{currentPlan.tasks?.length || 0} Tasks</strong>
                  </div>
                </div>
              </div>

              {/* Big Progress Meter */}
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB] min-w-[240px] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#544B45]">Overall Progress</span>
                  <span className="text-lg font-black text-[#7C3AED] font-mono">
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
                    {currentPlan.tasks?.filter((t) => t.status === 'completed' || t.progressPercent === 100).length || 0} of {currentPlan.tasks?.length || 0} Tasks Completed
                  </span>
                  <span className="font-bold text-emerald-700">
                    {(currentPlan.overallProgress || 0) >= 100 ? '✓ Complete' : 'In Progress'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Planned Tasks Schedule & Execution Pipeline */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-[#211B17] flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-amber-600" />
                  <span>Shop Floor Operations &amp; Supervisor Action Board</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sequential list of planned operations. Click <strong>"Update Details"</strong> on any task to record stage reached and work done, or mark 100% complete.
                </p>
              </div>

              <div className="text-xs font-semibold text-slate-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Real-time synced with Supervisor &amp; Project Planning</span>
              </div>
            </div>

            {/* List of Tasks */}
            {!currentPlan.tasks || currentPlan.tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-[#FAF7F2] rounded-xl border border-dashed border-slate-200">
                <p className="text-sm font-semibold text-slate-600">No tasks have been planned for this project yet.</p>
                <Link
                  href={`/projects/planning?mode=edit&id=${currentPlan.id}`}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 text-white font-bold rounded-xl text-xs hover:bg-purple-800 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Tasks in Project Planning</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {currentPlan.tasks.map((task: PlannedTaskItem, idx: number) => {
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
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  ✓ 100% Completed
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
                              {[25, 50, 75].map((pct) => (
                                <button
                                  key={pct}
                                  type="button"
                                  onClick={() => handleQuickPercent(currentPlan.id, currentPlan.projectNumber, task, pct)}
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded border transition cursor-pointer ${
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
                            onClick={() =>
                              handleOpenSupervisorModal(
                                currentPlan.id,
                                currentPlan.projectNumber,
                                currentPlan.customerName,
                                currentPlan.productName,
                                task
                              )
                            }
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
                                <span>100% Complete ✓</span>
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUPERVISOR PROGRESS UPDATE MODAL                                          */}
      {/* ========================================================================= */}
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
                {/* Progress % */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">
                      Progress (%):
                    </label>
                    <span className="text-base font-black font-mono text-[#7C3AED]">
                      {modalProgress}%
                    </span>
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
                      else if (val > 0 && modalStatus === 'pending') setModalStatus('in_progress');
                    }}
                    className="w-full accent-amber-600 cursor-pointer"
                  />

                  {/* Quick percentage buttons */}
                  <div className="flex items-center justify-between gap-1 pt-1">
                    {[10, 25, 50, 75, 90, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => {
                          setModalProgress(pct);
                          if (pct >= 100) setModalStatus('completed');
                          else if (pct > 0 && modalStatus === 'pending') setModalStatus('in_progress');
                        }}
                        className={`px-2 py-1 text-[10px] font-bold rounded border transition cursor-pointer ${
                          modalProgress === pct
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">
                    Current Status:
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setModalStatus(val);
                      if (val === 'completed') setModalProgress(100);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#211B17]"
                  >
                    <option value="in_progress">🟡 In Progress</option>
                    <option value="completed">🟢 100% Completed</option>
                    <option value="pending">⚪ Pending</option>
                    <option value="on_hold">🔴 On Hold</option>
                  </select>
                  <div className="text-[11px] text-slate-500 pt-1">
                    {modalStatus === 'completed'
                      ? '✓ Setting to 100% will automatically unlock the next sequential operation.'
                      : 'Real-time updates shopfloor board and master plan.'}
                  </div>
                </div>
              </div>

              {/* Field 2: Work Done Details */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-amber-600" />
                    <span>Work Done / Output Completed Details</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10.5px] text-slate-400">Describe work completed</span>
                </div>

                <textarea
                  rows={2}
                  value={modalWorkDone}
                  onChange={(e) => setModalWorkDone(e.target.value)}
                  placeholder="e.g. 8 of 10 nozzles fitted, root welding completed, and DP test cleared..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#211B17]"
                />

                {/* Quick Suggestion Chips */}
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick Select:</span>
                  {QUICK_WORK_DONE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setModalWorkDone(preset)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 rounded-md text-[10.5px] transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 3: Stage Reached & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    Current Stage / Milestone Reached:
                  </label>
                  <input
                    type="text"
                    value={modalStage}
                    onChange={(e) => setModalStage(e.target.value)}
                    placeholder="e.g. Bay 3 - Sub-assembly stage"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#211B17]"
                  />

                  {/* Quick Stage chips */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    {QUICK_STAGE_PRESETS.slice(0, 4).map((stg, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => setModalStage(stg)}
                        className="px-1.5 py-0.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 rounded text-[10px] text-slate-600 transition cursor-pointer"
                      >
                        {stg}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    Workstation / Bay No:
                  </label>
                  <input
                    type="text"
                    value={modalBay}
                    onChange={(e) => setModalBay(e.target.value)}
                    placeholder="e.g. Bay 2 / Machine #4"
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

export function ProductionPlanningHub({ initialTab = 'planning' }: ProductionPlanningHubProps) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Factory className="w-4 h-4 text-amber-600 animate-spin" />
          <span>Loading Production Planning &amp; Supervisor Hub...</span>
        </div>
      }
    >
      <ProductionPlanningHubContent initialTab={initialTab} />
    </Suspense>
  );
}
