'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { ProjectPlanningRecord, PlannedTaskItem, TaskProgressLog } from '../../../types/crm';
import { formatDate } from '../../../lib/utils';
import {
  CheckSquare,
  Factory,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  ArrowRight,
  Edit3,
  Save,
  RotateCcw,
  Sparkles,
  Plus,
  Users,
  Calendar,
  ChevronRight,
  Sliders,
  Building2,
  ExternalLink,
  Eye,
  Send,
  MessageSquare,
  Activity,
  Workflow,
  Check,
  Play,
  Layers,
  FileText,
  MapPin,
  Flame,
  ArrowUpRight,
  X,
  History,
  ClipboardList,
} from 'lucide-react';

// Common shopfloor quick presets in Gujarati & English for 1-tap supervisor updates
const QUICK_WORK_DONE_PRESETS = [
  'પ્લેટ કટિંગ અને બેવલિંગ પૂર્ણ (Cutting Done)',
  'શેલ રોલિંગ અને બેન્ડિંગ કામ પૂરું (Rolling & Bending)',
  'જોઈન્ટ ફિટ-અપ અને ટાંકા પાસ (Fit-up & Tack Pass)',
  'રૂટ અને ફાઇનલ સીમ વેલ્ડિંગ પૂર્ણ (Full Penetration Welding)',
  'ડ્રેસિંગ અને ગ્રાઇન્ડિંગ પૂરું (Grinding & Surface Clean)',
  'નોઝલ અને ફ્લેંજ ફિટમેન્ટ કમ્પ્લીટ (Nozzle / Flange Fitted)',
  'હાઇડ્રો અને એનડીટી ટેસ્ટ પાસ (Hydro / NDT Cleared)',
  'મિકેનિકલ એસેમ્બલી કમ્પ્લીટ (Final Assembly Done)',
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

export default function ProductionSupervisorTasksPage() {
  const {
    projectPlanningRecords,
    updateProjectPlanningTaskSupervisorProgress,
    dispatchProjectPlanningToDepartments,
    employees,
    availableEmployees,
  } = useERP();

  // Active staff list for supervisor selection
  const staffList = useMemo(() => {
    const list = employees && employees.length > 0 ? employees : availableEmployees || [];
    return list.filter((e) => (e as any).status !== 'inactive' && (e as any).status !== 'suspended');
  }, [employees, availableEmployees]);

  // Filters & Search
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentTab, setDepartmentTab] = useState<'production' | 'all'>('production');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [supervisorFilter, setSupervisorFilter] = useState<string>('all');

  // Supervisor Progress Modal State
  const [activeModalData, setActiveModalData] = useState<{
    planId: string;
    projectNumber: string;
    customerName: string;
    productName: string;
    task: PlannedTaskItem;
  } | null>(null);

  // Form Fields inside Supervisor Modal
  const [modalStatus, setModalStatus] = useState<'pending' | 'in_progress' | 'completed' | 'on_hold'>('in_progress');
  const [modalProgress, setModalProgress] = useState<number>(50);
  const [modalWorkDone, setModalWorkDone] = useState<string>('');
  const [modalStage, setModalStage] = useState<string>('');
  const [modalBay, setModalBay] = useState<string>('');
  const [modalSupervisor, setModalSupervisor] = useState<string>('');
  const [modalNotes, setModalNotes] = useState<string>('');

  // Quick Toast Notification
  const [toastMessage, setToastMessage] = useState<{ title: string; text: string } | null>(null);
  const showToast = (title: string, text: string) => {
    setToastMessage({ title, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Flatten tasks across all project plans
  const allFlattenedTasks = useMemo(() => {
    const rows: ProductionTaskRow[] = [];
    projectPlanningRecords.forEach((plan) => {
      (plan.tasks || []).forEach((task, idx) => {
        const dept = (task.department || '').toLowerCase();
        const tName = (task.taskName || '').toLowerCase();

        const isProdTask =
          dept === 'production' ||
          (!task.department &&
            !tName.includes('design') &&
            !tName.includes('cad') &&
            !tName.includes('purchase') &&
            !tName.includes('store') &&
            !tName.includes('accounting'));

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

  // Filtered Tasks according to Tab & Controls
  const filteredTasks = useMemo(() => {
    return allFlattenedTasks.filter((item) => {
      // Department filter
      if (departmentTab === 'production') {
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
      if (selectedProjectFilter !== 'all') {
        if (item.planId !== selectedProjectFilter && item.projectNumber !== selectedProjectFilter) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'completed' && item.task.status !== 'completed' && item.task.progressPercent < 100) return false;
        if (statusFilter === 'in_progress' && (item.task.status !== 'in_progress' || item.task.progressPercent >= 100)) return false;
        if (statusFilter === 'pending' && (item.task.status !== 'pending' || item.task.progressPercent > 0)) return false;
        if (statusFilter === 'on_hold' && item.task.status !== 'on_hold') return false;
      }

      // Supervisor filter
      if (supervisorFilter !== 'all') {
        const matchesAssignee = (item.task.assignedPersons || []).includes(supervisorFilter);
        const matchesSupervisor = item.task.supervisorName === supervisorFilter;
        if (!matchesAssignee && !matchesSupervisor) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
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
  }, [allFlattenedTasks, departmentTab, selectedProjectFilter, statusFilter, supervisorFilter, searchQuery]);

  // Overall Metrics
  const metrics = useMemo(() => {
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

  // Open Supervisor Modal
  const handleOpenSupervisorModal = (row: ProductionTaskRow) => {
    setActiveModalData({
      planId: row.planId,
      projectNumber: row.projectNumber,
      customerName: row.customerName,
      productName: row.productName,
      task: row.task,
    });
    setModalStatus(row.task.status || 'in_progress');
    setModalProgress(row.task.progressPercent || (row.task.status === 'completed' ? 100 : 25));
    setModalWorkDone(row.task.workDoneDetails || '');
    setModalStage(row.task.stageReached || '');
    setModalBay(row.task.workstationOrBay || '');
    setModalSupervisor(row.task.supervisorName || row.task.assignedPersons?.[0] || 'Mahesh Parmar (Supervisor)');
    setModalNotes(row.task.remarks || '');
  };

  // Quick 1-click update
  const handleQuickPercent = (row: ProductionTaskRow, pct: number) => {
    const isFinished = pct >= 100;
    updateProjectPlanningTaskSupervisorProgress(row.planId, row.task.id, {
      progressPercent: pct,
      status: isFinished ? 'completed' : 'in_progress',
      workDoneDetails: isFinished ? 'ઓપરેશન ૧૦૦% પૂર્ણ થયું (100% Completed)' : `કામ ${pct}% સુધી પહોંચ્યું`,
      stageReached: isFinished ? 'Final Inspection Ready' : row.task.stageReached || 'Active Shop Floor Bay',
      supervisorName: row.task.supervisorName || 'Shopfloor Supervisor',
    });

    showToast(
      isFinished ? '🎉 Operation Completed!' : '✓ Progress Updated',
      `"${row.task.taskName}" for ${row.projectNumber} set to ${pct}%.`
    );
  };

  // Submit Modal
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalData) return;

    const is100 = modalProgress >= 100 || modalStatus === 'completed';
    const finalPct = is100 ? 100 : modalProgress;
    const finalStatus = is100 ? 'completed' : modalStatus;

    updateProjectPlanningTaskSupervisorProgress(activeModalData.planId, activeModalData.task.id, {
      status: finalStatus,
      progressPercent: finalPct,
      workDoneDetails: modalWorkDone || (is100 ? 'ઓપરેશન ૧૦૦% પૂર્ણ' : 'કામ ચાલુ છે'),
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

  // Dispatch Action from Banner
  const handleDispatchPlan = (planId: string, projNo: string) => {
    const res = dispatchProjectPlanningToDepartments(planId);
    if (res.success) {
      showToast(
        '🚀 Dispatched to Departments!',
        `Plan for ${projNo} dispatched to ${res.dispatchedDepartments.join(', ')}. Audio alerts & department notifications sent!`
      );
    }
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

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-0.5">
            DASHBOARD / PRODUCTION &amp; SHOP FLOOR / SUPERVISOR OPERATIONS
          </div>
          <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2.5">
            <Factory className="w-6 h-6 text-amber-600" />
            <span>Production Supervisor Task Hub</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
              સુપરવાઇઝર ટાસ્ક
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dedicated shopfloor supervisor workspace. Update daily progress, milestones reached ("આ એટલે પહોંચ્યો"), work details ("આનું કામ આટલું થયું"), and complete operations sequentially.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/production/worker-daily-routine"
            className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Worker Daily Routine (વર્કર ડાયરી)</span>
          </Link>
          <Link
            href="/production/planning"
            className="px-3.5 py-2 bg-white border border-[#EBE3DB] hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
          >
            <Workflow className="w-3.5 h-3.5 text-amber-600" />
            <span>Project Planning View</span>
          </Link>
          <Link
            href="/projects/planning"
            className="px-3.5 py-2 bg-white border border-[#EBE3DB] hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
            <span>Master Planning</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Operations</span>
            <Layers className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-[#211B17]">{metrics.total}</div>
          <div className="text-[11px] text-slate-500">Shopfloor Tasks Scheduled</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider">In Progress</span>
            <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-blue-700">{metrics.inProgress}</div>
          <div className="text-[11px] text-slate-500">Active Fabrication Bays</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending / Queued</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{metrics.pending}</div>
          <div className="text-[11px] text-slate-500">Awaiting Preceding Stages</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider">100% Finished</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{metrics.completed}</div>
          <div className="text-[11px] text-slate-500">Cleared for Next Steps</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Completion</span>
            <CheckSquare className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700">{metrics.avgPct}%</div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-purple-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${metrics.avgPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Undispatched Plans Alert (If any plans need sending) */}
      {projectPlanningRecords.some((p) => !p.isDispatched) && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-[#211B17]">
                New Plans Waiting to be Sent to Departments (ડિપાર્ટમેન્ટ્સને સેન્ડ કરો)
              </div>
              <div className="text-[11px] text-slate-600">
                You have {projectPlanningRecords.filter((p) => !p.isDispatched).length} plan(s) created. Click "Send" on any project below to notify Production, Design, Store, and Purchase departments with real-time audio chimes!
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

      {/* Tabs, Search & Filters Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        {/* Top bar: Department Tabs & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Department Scope Tab Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setDepartmentTab('production')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                departmentTab === 'production'
                  ? 'bg-white text-[#211B17] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Factory className="w-3.5 h-3.5 text-amber-600" />
              <span>Production Tasks Only</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-mono">
                {metrics.total}
              </span>
            </button>
            <button
              onClick={() => setDepartmentTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                departmentTab === 'all'
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 text-[#211B17]"
            >
              <option value="all">All Statuses</option>
              <option value="in_progress">In Progress (સક્રિય કામ)</option>
              <option value="pending">Pending (બાકી)</option>
              <option value="completed">100% Completed (પૂર્ણ)</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          {/* Supervisor Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Supervisor / Team:</span>
            <select
              value={supervisorFilter}
              onChange={(e) => setSupervisorFilter(e.target.value)}
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
          {(selectedProjectFilter !== 'all' || statusFilter !== 'all' || supervisorFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedProjectFilter('all');
                setStatusFilter('all');
                setSupervisorFilter('all');
                setSearchQuery('');
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
                <th className="py-3 px-4 min-w-[180px]">આ એટલે પહોંચ્યો (Current Stage / Bay)</th>
                <th className="py-3 px-4 min-w-[220px]">આનું કામ આટલું થયું (Work Done Details)</th>
                <th className="py-3 px-4 min-w-[130px]">Timeline</th>
                <th className="py-3 px-4 min-w-[140px]">Progress %</th>
                <th className="py-3 px-4 min-w-[100px]">Status</th>
                <th className="py-3 px-4 w-44 text-center">Supervisor Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
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
                filteredTasks.map((row, idx) => {
                  const t = row.task;
                  const isDone = t.status === 'completed' || t.progressPercent >= 100;
                  const isInProgress = t.status === 'in_progress' && !isDone;
                  const isPending = !isDone && !isInProgress;

                  return (
                    <tr
                      key={`${row.planId}-${t.id || idx}`}
                      className={`hover:bg-amber-50/30 transition group ${
                        isDone ? 'bg-emerald-50/20' : isInProgress ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      {/* Sr No & Sequence */}
                      <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Project & Client */}
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/projects/planning?mode=edit&id=${row.planId}`}
                            className="font-bold text-[#7C3AED] hover:underline block text-xs"
                          >
                            {row.projectNumber}
                          </Link>
                          {row.isDispatched ? (
                            <span className="text-[9.5px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Dispatched
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

                      {/* Current Stage / Location (આ એટલે પહોંચ્યો) */}
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
                            onClick={() => handleOpenSupervisorModal(row)}
                            className="text-[11px] text-amber-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <span>+ સ્ટેજ નોંધો</span>
                          </button>
                        )}
                      </td>

                      {/* Work Done Details (આનું કામ આટલું થયું) */}
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
                            onClick={() => handleOpenSupervisorModal(row)}
                            className="text-[11px] text-slate-400 hover:text-amber-700 italic cursor-pointer"
                          >
                            + વિગત લખો (Click to fill)
                          </button>
                        )}
                      </td>

                      {/* Timeline */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="text-slate-800 font-semibold block">{formatDate(t.startDate)}</span>
                        <span className="text-slate-500 text-[10px] block">to {formatDate(t.endDate)}</span>
                      </td>

                      {/* Progress % */}
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
                          {/* Quick % buttons */}
                          <div className="flex items-center justify-between gap-1 pt-0.5">
                            {[25, 50, 75, 100].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => handleQuickPercent(row, pct)}
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

                      {/* Status Badge */}
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
                          onClick={() => handleOpenSupervisorModal(row)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 mx-auto active:scale-95 cursor-pointer w-full"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>ડીટેલ ફીલ કરો</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <div>
            Showing <strong>{filteredTasks.length}</strong> shopfloor operations across active projects
          </div>
          <div className="text-[11px] text-slate-400">
            Click <strong>"ડીટેલ ફીલ કરો"</strong> to update work completed and advance stage
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUPERVISOR PROGRESS UPDATE MODAL (ડીટેલ ફીલ કરવા માટેનું મોડલ)              */}
      {/* ========================================================================= */}
      {activeModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#EBE3DB] w-full max-w-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="bg-[#211B17] text-white p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <Factory className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>સુપરવાઇઝર પ્રગતિ અપડેટ (Supervisor Progress Log)</span>
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
                      પ્રગતિ ટકાવારી (Progress %):
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
                    કાર્ય સ્થિતિ (Current Status):
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
                    <option value="in_progress">🟡 In Progress (કામ ચાલુ છે)</option>
                    <option value="completed">🟢 100% Completed (પૂર્ણ થયું)</option>
                    <option value="pending">⚪ Pending (હજુ શરૂ નથી થયું)</option>
                    <option value="on_hold">🔴 On Hold (અટકાવેલું)</option>
                  </select>
                  <div className="text-[11px] text-slate-500 pt-1">
                    {modalStatus === 'completed'
                      ? '✓ Setting to 100% will automatically unlock the next sequential operation.'
                      : 'Real-time updates shopfloor board and master plan.'}
                  </div>
                </div>
              </div>

              {/* Field 2: "આનું કામ આટલું થયું" (Work Done Details) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-amber-600" />
                    <span>આનું કામ આટલું થયું (Work Done / Output Completed)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10.5px] text-slate-400">વિગતવાર વર્ણન લખો</span>
                </div>

                <textarea
                  rows={2}
                  value={modalWorkDone}
                  onChange={(e) => setModalWorkDone(e.target.value)}
                  placeholder="દા.ત. 10 માંથી 8 નોઝલ ફિટ થઈ ગયા, રૂટ વેલ્ડિંગ પૂરું થયું અને ડીપી ટેસ્ટ પાસ..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#211B17]"
                />

                {/* Quick Suggestion Chips */}
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1">ક્વિક સિલેક્ટ:</span>
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

              {/* Field 3: "આ એટલે પહોંચ્યો" (Stage Reached & Location) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    આ એટલે પહોંચ્યો (Current Stage / Milestone Reached):
                  </label>
                  <input
                    type="text"
                    value={modalStage}
                    onChange={(e) => setModalStage(e.target.value)}
                    placeholder="દા.ત. Bay 3 - Sub-assembly stage"
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
                    શોપફ્લોર બે / મશીન નંબર (Workstation / Bay No):
                  </label>
                  <input
                    type="text"
                    value={modalBay}
                    onChange={(e) => setModalBay(e.target.value)}
                    placeholder="દા.ત. Bay 2 / Machine #4"
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
                    સુપરવાઇઝરનું નામ (Supervisor Name):
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
                    ખાસ નોંધ / સમસ્યા (Notes / Bottleneck):
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
                    <span>અગાઉનો ઇતિહાસ (Previous Update History)</span>
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
                  <span>પ્રગતિ સેવ કરો (Save Progress)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
