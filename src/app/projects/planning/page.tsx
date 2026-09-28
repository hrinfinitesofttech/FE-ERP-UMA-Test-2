'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import { ProjectPlanningStage, PlanningStageAssignee } from '../../../types/crm';
import { movePlanningStage } from '../../../lib/projectPlanningHelper';
import {
  Workflow,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Edit,
  Save,
  Plus,
  Building,
  User,
  Calendar,
  Sparkles,
  Search,
  Filter,
  Trash2,
  X,
  RotateCcw,
  Check,
  ArrowRight,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  Users,
  CheckSquare,
  Square,
  FileCheck2,
  Tag,
  ArrowUpDown,
} from 'lucide-react';

export default function ProjectPlanningPage() {
  const {
    projectPlanningStages,
    updatePlanningStage,
    generateDefaultPlanningStages,
    addPlanningStage,
    deletePlanningStage,
    reorderPlanningStages,
    markPlanningStageCompleted,
    projectJobs,
    availableEmployees,
    currentUser,
  } = useERP();

  // Support pre-selecting project from query param if available
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qId = params.get('id') || params.get('projectId');
      if (qId && projectJobs.some((p) => p.id === qId || p.projectNumber === qId)) {
        return qId;
      }
    }
    return projectJobs[0]?.id || 'PRJ-2026-0001';
  });

  // Ensure selectedProjectId is valid if projectJobs loads/changes
  useEffect(() => {
    if (projectJobs.length > 0 && !projectJobs.some((p) => p.id === selectedProjectId)) {
      setSelectedProjectId(projectJobs[0].id);
    }
  }, [projectJobs, selectedProjectId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<ProjectPlanningStage | null>(null);
  const [quickCompleteModalStage, setQuickCompleteModalStage] = useState<ProjectPlanningStage | null>(null);

  // Form Fields
  const [formStageName, setFormStageName] = useState('');
  const [formDept, setFormDept] = useState('production');
  const [formPlannedStart, setFormPlannedStart] = useState('');
  const [formPlannedEnd, setFormPlannedEnd] = useState('');
  const [formActualStart, setFormActualStart] = useState('');
  const [formActualEnd, setFormActualEnd] = useState('');
  const [formStatus, setFormStatus] = useState<ProjectPlanningStage['status']>('pending');
  const [formProgress, setFormProgress] = useState<number>(0);
  const [formRemarks, setFormRemarks] = useState('');
  const [formDeliverables, setFormDeliverables] = useState('');

  // Multi-Assignees Form State
  const [selectedAssignees, setSelectedAssignees] = useState<PlanningStageAssignee[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeDeptFilter, setEmployeeDeptFilter] = useState('all');

  // Quick Handover / Completion Notes
  const [completionNotes, setCompletionNotes] = useState('');

  // Active Project & Stages
  const activeProject =
    projectJobs.find((p) => p.id === selectedProjectId) ||
    projectJobs.find((p) => p.projectNumber === selectedProjectId) ||
    projectJobs[0];

  const activeStages = useMemo(() => {
    if (!activeProject) return [];
    return projectPlanningStages.filter(
      (s) => s.projectId === activeProject.id || s.jobNumber === activeProject.jobNumber
    );
  }, [projectPlanningStages, activeProject]);

  // Filtered Stages
  const filteredStages = useMemo(() => {
    return activeStages.filter((stage) => {
      if (statusFilter !== 'all' && stage.status !== statusFilter) return false;
      if (deptFilter !== 'all' && stage.responsibleDepartment?.toLowerCase() !== deptFilter?.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery?.toLowerCase();
        const hasEmpMatch =
          stage.assignedEmployees?.some((e) => e.name?.toLowerCase().includes(q)) ||
          stage.responsibleEmployee?.toLowerCase().includes(q);

        return (
          stage.stageName?.toLowerCase().includes(q) ||
          stage.responsibleDepartment?.toLowerCase().includes(q) ||
          hasEmpMatch ||
          (stage.remarks && stage.remarks?.toLowerCase().includes(q)) ||
          (stage.deliverables && stage.deliverables?.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [activeStages, statusFilter, deptFilter, searchQuery]);

  // Stage Metrics
  const completedStagesCount = activeStages.filter((s) => s.status === 'completed').length;
  const inProgressStagesCount = activeStages.filter((s) => s.status === 'in_progress').length;
  const pendingStagesCount = activeStages.filter((s) => s.status === 'pending').length;
  const delayedStagesCount = activeStages.filter((s) => s.status === 'delayed').length;

  const handleStatusChange = (id: string, newStatus: ProjectPlanningStage['status']) => {
    const isComp = newStatus === 'completed';
    updatePlanningStage(id, {
      status: newStatus,
      progressPercent: isComp ? 100 : newStatus === 'in_progress' ? 50 : 0,
      actualStart: newStatus !== 'pending' ? new Date().toISOString().split('T')[0] : undefined,
      actualEnd: isComp ? new Date().toISOString().split('T')[0] : undefined,
    });
  };

  const handleGenerateStages = (prjId: string) => {
    if (!prjId) return;
    if (activeStages.length > 0) {
      if (!window.confirm('This will reset planning stages to the standard 16-stage MTO matrix. Do you want to continue?')) {
        return;
      }
    }
    generateDefaultPlanningStages(prjId);
  };

  const handleOpenAddModal = () => {
    const nextNum = activeStages.length + 1;
    setFormStageName(`Stage ${nextNum}: `);
    setFormDept('production');
    setFormPlannedStart(activeProject?.startDate || new Date().toISOString().split('T')[0]);
    setFormPlannedEnd(activeProject?.deliveryDate || new Date().toISOString().split('T')[0]);
    setFormActualStart('');
    setFormActualEnd('');
    setFormStatus('pending');
    setFormProgress(0);
    setFormRemarks('');
    setFormDeliverables('');

    // Pre-assign Project Manager
    if (activeProject?.projectManager) {
      setSelectedAssignees([
        {
          id: 'EMP-PM',
          name: activeProject.projectManager,
          role: 'Project Manager',
          department: 'Project',
        },
      ]);
    } else {
      setSelectedAssignees([]);
    }

    setEmployeeSearch('');
    setEmployeeDeptFilter('all');
    setIsAddModalOpen(true);
  };

  const handleSaveNewStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStageName || !formStageName.trim()) {
      alert('Please enter a Stage Name before clicking Create Stage.');
      return;
    }

    const prjId = activeProject?.id || selectedProjectId || projectJobs[0]?.id || 'PRJ-2026-0001';
    const jobNo = activeProject?.jobNumber || projectJobs[0]?.jobNumber || 'JOB-2026-0001';
    const startDate = formPlannedStart || activeProject?.startDate || new Date().toISOString().split('T')[0];
    const endDate = formPlannedEnd || activeProject?.deliveryDate || new Date().toISOString().split('T')[0];

    const employeeNames = selectedAssignees.map((a) => a.name).join(', ') || 'Unassigned';
    const employeeIds = selectedAssignees.map((a) => a.id);

    addPlanningStage({
      stageNumber: activeStages.length + 1,
      stageName: formStageName.trim(),
      projectId: prjId,
      jobNumber: jobNo,
      plannedStart: startDate,
      plannedEnd: endDate,
      actualStart: formActualStart || undefined,
      actualEnd: formActualEnd || undefined,
      responsibleDepartment: formDept,
      responsibleEmployee: employeeNames,
      assignedEmployeeIds: employeeIds,
      assignedEmployees: selectedAssignees,
      status: formStatus,
      progressPercent: formProgress,
      remarks: formRemarks.trim() || undefined,
      deliverables: formDeliverables.trim() || undefined,
    });

    setIsAddModalOpen(false);
  };

  const handleOpenEditModal = (stage: ProjectPlanningStage) => {
    setEditingStage(stage);
    setFormStageName(stage.stageName);
    setFormDept(stage.responsibleDepartment);
    setFormPlannedStart(stage.plannedStart);
    setFormPlannedEnd(stage.plannedEnd);
    setFormActualStart(stage.actualStart || '');
    setFormActualEnd(stage.actualEnd || '');
    setFormStatus(stage.status);
    setFormProgress(stage.progressPercent);
    setFormRemarks(stage.remarks || '');
    setFormDeliverables(stage.deliverables || '');

    // Initialize assignees
    if (stage.assignedEmployees && stage.assignedEmployees.length > 0) {
      setSelectedAssignees([...stage.assignedEmployees]);
    } else if (stage.responsibleEmployee) {
      // Split comma separated string if legacy
      const names = stage.responsibleEmployee.split(',').map((n) => n.trim());
      const converted: PlanningStageAssignee[] = names.map((name, idx) => ({
        id: `EMP-${idx + 1}`,
        name,
        department: stage.responsibleDepartment,
      }));
      setSelectedAssignees(converted);
    } else {
      setSelectedAssignees([]);
    }

    setEmployeeSearch('');
    setEmployeeDeptFilter('all');
  };

  const handleSaveEditStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStage) return;

    const employeeNames = selectedAssignees.map((a) => a.name).join(', ') || 'Unassigned';
    const employeeIds = selectedAssignees.map((a) => a.id);

    updatePlanningStage(editingStage.id, {
      stageName: formStageName.trim(),
      responsibleDepartment: formDept,
      responsibleEmployee: employeeNames,
      assignedEmployeeIds: employeeIds,
      assignedEmployees: selectedAssignees,
      plannedStart: formPlannedStart,
      plannedEnd: formPlannedEnd,
      actualStart: formActualStart || undefined,
      actualEnd: formActualEnd || undefined,
      status: formStatus,
      progressPercent: formProgress,
      remarks: formRemarks.trim() || undefined,
      deliverables: formDeliverables.trim() || undefined,
    });

    setEditingStage(null);
  };

  const handleDeleteStage = (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to remove "${name}" from this project plan? Remaining stages will be re-numbered sequentially.`
      )
    ) {
      deletePlanningStage(id);
    }
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    if (!activeProject) return;
    const reordered = movePlanningStage(activeStages, index, direction);
    reorderPlanningStages(activeProject.id, reordered);
  };

  const handleConfirmQuickComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCompleteModalStage) return;

    const user = `${currentUser.firstName} ${currentUser.lastName}`;
    markPlanningStageCompleted(
      quickCompleteModalStage.id,
      user,
      completionNotes.trim() || quickCompleteModalStage.remarks
    );

    setQuickCompleteModalStage(null);
    setCompletionNotes('');
  };

  // Toggle Employee Selection for Multi-Assignees
  const toggleAssignee = (emp: { id: string; firstName: string; lastName: string; designation?: string; departmentName?: string }) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.trim();
    const isAlreadySelected = selectedAssignees.some(
      (a) => a.id === emp.id || a.name?.toLowerCase() === fullName?.toLowerCase()
    );

    if (isAlreadySelected) {
      setSelectedAssignees((prev) =>
        prev.filter((a) => a.id !== emp.id && a.name?.toLowerCase() !== fullName?.toLowerCase())
      );
    } else {
      setSelectedAssignees((prev) => [
        ...prev,
        {
          id: emp.id,
          name: fullName,
          role: emp.designation || 'Specialist',
          department: emp.departmentName || 'Operations',
        },
      ]);
    }
  };

  const removeAssignee = (id: string) => {
    setSelectedAssignees((prev) => prev.filter((a) => a.id !== id));
  };

  // Department Badges
  const getDeptBadge = (dept: string) => {
    const d = (dept || '')?.toUpperCase();
    if (d.includes('CRM') || d.includes('SALES')) return 'bg-sky-50 text-sky-700 border-sky-200';
    if (d.includes('PROJECT')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (d.includes('DESIGN') || d.includes('ENG')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (d.includes('PURCHASE')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (d.includes('STORE')) return 'bg-orange-50 text-orange-800 border-orange-200';
    if (d.includes('PRODUCTION')) return 'bg-rose-50 text-rose-800 border-rose-200';
    if (d.includes('QC') || d.includes('QUALITY')) return 'bg-teal-50 text-teal-800 border-teal-200';
    if (d.includes('MAINT') || d.includes('SITE')) return 'bg-crm-brand- text-crm-brand- border-crm-brand-';
    return 'bg-[#FAF7F2] text-[#70665F] border-[#E7DED5]';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in_progress':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'delayed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-[#FAF7F2] text-[#70665F] border-[#E7DED5]';
    }
  };

  const getProgressBarColor = (status: string, percent: number) => {
    if (status === 'completed' || percent === 100) return 'bg-emerald-600';
    if (status === 'delayed') return 'bg-rose-500';
    if (status === 'in_progress') return 'bg-[#75401F]';
    return 'bg-[#D7CCC8]';
  };

  // Filter available employees for selector
  const filteredEmployeesList = useMemo(() => {
    return availableEmployees.filter((emp) => {
      if (employeeDeptFilter !== 'all') {
        const d = (emp.departmentName || '')?.toLowerCase();
        if (!d.includes(employeeDeptFilter?.toLowerCase())) return false;
      }
      if (employeeSearch.trim()) {
        const q = employeeSearch?.toLowerCase();
        const fullName = `${emp.firstName} ${emp.lastName}`?.toLowerCase();
        return (
          fullName.includes(q) ||
          (emp.designation && emp.designation?.toLowerCase().includes(q)) ||
          (emp.departmentName && emp.departmentName?.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [availableEmployees, employeeDeptFilter, employeeSearch]);

  return (
    <div className="space-y-5 text-xs pb-12">
      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E7DED5] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full bg-[#FAF3EA] text-[#75401F] font-mono text-[10px] font-bold uppercase tracking-wider border border-[#E7DED5]">
              MTO Stage Governance & Multi-User Planning
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#211B17] flex items-center gap-2.5">
            <Workflow className="w-6 h-6 text-[#75401F]" />
            Project Execution & Planning Matrix
          </h1>
          <p className="text-[#70665F] mt-1 leading-relaxed">
            Customize execution stages, assign multiple users/engineers per stage, and track departmental handover.
          </p>
        </div>

        {/* Project Selector & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FAF7F2] p-2 rounded-xl border border-[#E7DED5] shadow-xs">
            <span className="text-[#70665F] font-bold pl-1 whitespace-nowrap">Select Project:</span>
            <select
              value={activeProject?.id || selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#E7DED5] rounded-lg text-xs font-bold text-[#211B17] focus:outline-none focus:border-[#75401F] cursor-pointer shadow-xs max-w-xs sm:max-w-md truncate"
            >
              {projectJobs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectNumber} ({p.jobNumber}) • {p.customerName}
                </option>
              ))}
            </select>
          </div>

          {activeProject && (
            <button
              onClick={() => handleGenerateStages(activeProject.id)}
              title="Reset or load 16 standard execution stages"
              className="px-3 py-2 bg-white hover:bg-[#FAF7F2] text-[#75401F] border border-[#E7DED5] rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#75401F]" />
              <span className="hidden sm:inline">Load 16 MTO Template</span>
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 bg-[#75401F] hover:bg-[#5C3318] text-[#211B17] rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Stage</span>
          </button>
        </div>
      </div>

      {/* Project Summary Banner - High Contrast Luxury Espresso Hero Card */}
      {activeProject && (
        <div className="bg-[#2D1810] text-[#211B17] p-5 sm:p-6 rounded-2xl border border-[#4E2B1E] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
          {/* Ambient warm gradient glow */}
          <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-[#75401F]/30 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3E2723] border border-[#5C3322] text-[#F3C49F] text-xs font-semibold tracking-wide shadow-xs">
              <Building className="w-3.5 h-3.5 text-[#F3C49F]" />
              <span>{activeProject.customerName}</span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-[#211B17] tracking-tight">
              {activeProject.productName}
            </h2>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#D7CCC8] font-mono pt-1">
              <span className="inline-flex items-center gap-1.5 bg-[#23120B] px-3 py-1 rounded-lg border border-[#4E2B1E]">
                <span className="text-[#A1887F]">Job:</span>
                <span className="font-bold text-[#211B17]">{activeProject.jobNumber}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#23120B] px-3 py-1 rounded-lg border border-[#4E2B1E]">
                <User className="w-3.5 h-3.5 text-[#FFE0B2]" />
                <span className="text-[#A1887F]">PM:</span>
                <span className="font-bold text-[#FFE0B2]">{activeProject.projectManager}</span>
              </span>
              <span
                className="inline-flex items-center gap-1.5 bg-[#23120B] px-3 py-1 rounded-lg border border-[#4E2B1E]"
                suppressHydrationWarning
              >
                <Calendar className="w-3.5 h-3.5 text-[#81C784]" />
                <span className="text-[#A1887F]">Target:</span>
                <span className="font-bold text-[#81C784]">{formatDate(activeProject.deliveryDate)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#23120B] px-3 py-1 rounded-lg border border-[#4E2B1E]">
                <Layers className="w-3.5 h-3.5 text-[#FFD54F]" />
                <span className="text-[#A1887F]">Active Stages:</span>
                <span className="font-bold text-[#FFD54F]">{activeStages.length} Stages</span>
              </span>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-5 bg-[#23120B] px-5 py-4 rounded-xl border border-[#4E2B1E] self-stretch md:self-auto justify-between md:justify-end shadow-xs">
            <div className="text-left md:text-right">
              <span className="text-[10px] uppercase font-bold text-[#A1887F] tracking-wider block">
                Overall Progress
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-[#FFB74D] font-mono">
                  {activeProject.progressPercent}%
                </span>
                <span className="text-[10px] text-[#A1887F]">done</span>
              </div>
            </div>

            <div className="w-28 sm:w-36">
              <div className="w-full bg-[#3E2723] h-2.5 rounded-full overflow-hidden border border-[#5C3322]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] via-[#EAB308] to-[#10B981] transition-all duration-500"
                  style={{ width: `${activeProject.progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-[#D7CCC8] text-right block mt-1.5 font-mono">
                {completedStagesCount} / {activeStages.length} Completed
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Department Filter Tabs */}
      {activeStages.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {[
            { id: 'all', label: 'All Departments' },
            { id: 'crm', label: 'CRM & Sales' },
            { id: 'project', label: 'Project Mgmt' },
            { id: 'designer', label: 'Engineering & Design' },
            { id: 'store', label: 'Store & Inventory' },
            { id: 'purchase', label: 'Purchase & Procurement' },
            { id: 'production', label: 'Production & Shop Floor' },
            { id: 'maintenance', label: 'Site Erection & Commissioning' },
          ].map((tab) => {
            const isActive = deptFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setDeptFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer text-xs ${
                  isActive
                    ? 'bg-[#75401F] text-[#211B17] shadow-xs'
                    : 'bg-white hover:bg-[#FAF7F2] text-[#70665F] border border-[#E7DED5]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Quick Stage Status Metrics */}
      {activeStages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-[#E7DED5] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] font-bold text-[#70665F] uppercase tracking-wider block">Completed</span>
              <span className="text-lg font-black text-emerald-700 font-mono">{completedStagesCount}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E7DED5] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] font-bold text-[#70665F] uppercase tracking-wider block">In Progress</span>
              <span className="text-lg font-black text-amber-700 font-mono">{inProgressStagesCount}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E7DED5] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] font-bold text-[#70665F] uppercase tracking-wider block">Pending</span>
              <span className="text-lg font-black text-[#70665F] font-mono">{pendingStagesCount}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-50 text-[#70665F] flex items-center justify-center border border-slate-200">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E7DED5] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] font-bold text-[#70665F] uppercase tracking-wider block">Delayed / Risk</span>
              <span className="text-lg font-black text-rose-700 font-mono">{delayedStagesCount}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Main Execution Stages Table */}
      <div className="bg-white rounded-2xl border border-[#E7DED5] shadow-xs overflow-hidden">
        {/* Table Header Bar */}
        <div className="p-4 border-b border-[#E7DED5] flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-[#FAF7F2]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#75401F]" />
            <h3 className="font-bold text-[#211B17] text-xs">
              Project Execution Workflow Plan
            </h3>
            <span className="px-2 py-0.5 rounded-md bg-[#FAF3EA] text-[#75401F] font-mono text-[10px] font-bold border border-[#E7DED5]">
              Total {activeStages.length} Stages
            </span>
          </div>

          {/* Search & Filter Bar */}
          {activeStages.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#70665F]" />
                <input
                  type="text"
                  placeholder="Search stage, employee, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-[#E7DED5] rounded-lg text-xs text-[#211B17] placeholder:text-[#70665F]/60 focus:outline-none focus:border-[#75401F]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-[#E7DED5] rounded-lg text-xs font-semibold text-[#211B17] focus:outline-none focus:border-[#75401F] cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>
          )}
        </div>

        {/* Empty State when no stages exist for selected project */}
        {activeStages.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-[#FAF7F2]/40 m-4 sm:m-6 rounded-2xl border-2 border-dashed border-[#E7DED5] space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF3EA] text-[#75401F] flex items-center justify-center mx-auto shadow-xs border border-[#E7DED5]">
              <Sparkles className="w-8 h-8 text-[#75401F]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-black text-[#211B17]">
                No Planning Stages Configured for {activeProject?.projectNumber}
              </h3>
              <p className="text-xs text-[#70665F] max-w-lg mx-auto leading-relaxed">
                Initialize the execution matrix to generate standard stages with calculated timeline dates targeted for {formatDate(activeProject?.deliveryDate)}, or create custom stages with multiple employee assignments.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleGenerateStages(activeProject?.id)}
                className="px-5 py-2.5 bg-[#75401F] hover:bg-[#5C3318] text-[#211B17] rounded-xl font-bold flex items-center gap-2 shadow-md shadow-[#75401F]/20 transition cursor-pointer text-xs active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-[#F3C49F]" />
                ⚡ Load 16-Stage Standard MTO Template
              </button>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2.5 bg-white hover:bg-[#FAF7F2] text-[#211B17] border border-[#E7DED5] rounded-xl font-bold flex items-center gap-2 transition cursor-pointer text-xs"
              >
                <Plus className="w-4 h-4 text-[#75401F]" />
                Add Custom Stage
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#70665F] font-bold border-b border-[#E7DED5]">
                <tr>
                  <th className="p-3.5 w-16 text-center whitespace-nowrap">Order</th>
                  <th className="p-3.5 whitespace-nowrap">Stage Details</th>
                  <th className="p-3.5 whitespace-nowrap">Department</th>
                  <th className="p-3.5 whitespace-nowrap">Assigned Team / Assignees</th>
                  <th className="p-3.5 whitespace-nowrap">Planned Schedule</th>
                  <th className="p-3.5 whitespace-nowrap">Actual Dates</th>
                  <th className="p-3.5 whitespace-nowrap">Progress</th>
                  <th className="p-3.5 whitespace-nowrap">Status</th>
                  <th className="p-3.5 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DED5]">
                {filteredStages.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-[#70665F]">
                      No stages match the search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStages.map((stage, idx) => {
                    const assigneesList = stage.assignedEmployees || [];
                    const isDone = stage.status === 'completed';

                    return (
                      <tr key={stage.id} className="hover:bg-[#FAF7F2]/60 transition">
                        {/* Order & Reordering buttons */}
                        <td className="p-3.5 whitespace-nowrap align-middle text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="font-mono font-black text-[#211B17] w-6">
                              #{stage.stageNumber}
                            </span>
                            <div className="flex flex-col gap-0.5">
                              <button
                                onClick={() => handleMoveStage(idx, 'up')}
                                disabled={idx === 0}
                                title="Move Stage Up"
                                className="p-0.5 hover:bg-white rounded text-[#70665F] hover:text-[#75401F] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleMoveStage(idx, 'down')}
                                disabled={idx === activeStages.length - 1}
                                title="Move Stage Down"
                                className="p-0.5 hover:bg-white rounded text-[#70665F] hover:text-[#75401F] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Stage Name & Deliverables */}
                        <td className="p-3.5 align-middle min-w-[200px]">
                          <span className="font-bold text-[#211B17] text-xs block">{stage.stageName}</span>
                          {stage.deliverables && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#75401F] font-semibold mt-0.5">
                              <FileCheck2 className="w-3 h-3 text-[#75401F]" />
                              {stage.deliverables}
                            </span>
                          )}
                          {stage.remarks && (
                            <span className="text-[10px] text-[#70665F] font-normal truncate max-w-xs block mt-0.5">
                              {stage.remarks}
                            </span>
                          )}
                        </td>

                        {/* Department Badge */}
                        <td className="p-3.5 whitespace-nowrap align-middle">
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase border ${getDeptBadge(
                              stage.responsibleDepartment
                            )}`}
                          >
                            {stage.responsibleDepartment}
                          </span>
                        </td>

                        {/* Multiple Assignees Display */}
                        <td className="p-3.5 align-middle min-w-[220px]">
                          {assigneesList.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              {assigneesList.map((a, aIdx) => (
                                <span
                                  key={a.id || aIdx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#4A3E39] border border-[#E7DED5] text-[10px] font-semibold"
                                  title={`${a.name} (${a.role || a.department || 'Team'})`}
                                >
                                  <div className="w-3.5 h-3.5 rounded-full bg-[#75401F] text-[#211B17] text-[8px] font-black flex items-center justify-center">
                                    {a.name.slice(0, 1)?.toUpperCase()}
                                  </div>
                                  <span className="truncate max-w-[120px]">{a.name}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="font-semibold text-[#4A3E39]">
                              {stage.responsibleEmployee || 'Unassigned'}
                            </span>
                          )}
                        </td>

                        {/* Planned Dates */}
                        <td
                          className="p-3.5 font-mono text-[11px] text-[#70665F] whitespace-nowrap align-middle"
                          suppressHydrationWarning
                        >
                          {formatDate(stage.plannedStart)} → {formatDate(stage.plannedEnd)}
                        </td>

                        {/* Actual Dates & Completed By */}
                        <td
                          className="p-3.5 font-mono text-[11px] text-[#70665F] whitespace-nowrap align-middle"
                          suppressHydrationWarning
                        >
                          <div>
                            {stage.actualStart ? formatDate(stage.actualStart) : '-'} →{' '}
                            {stage.actualEnd ? formatDate(stage.actualEnd) : '-'}
                          </div>
                          {stage.completedBy && (
                            <span className="text-[9px] text-emerald-700 font-sans block mt-0.5">
                              Done by: {stage.completedBy}
                            </span>
                          )}
                        </td>

                        {/* Progress */}
                        <td className="p-3.5 whitespace-nowrap align-middle">
                          <div className="w-24">
                            <div className="flex justify-between text-[10px] font-mono mb-1">
                              <span className="font-bold text-[#211B17]">{stage.progressPercent}%</span>
                            </div>
                            <div className="w-full bg-[#E7DED5] h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor(
                                  stage.status,
                                  stage.progressPercent
                                )}`}
                                style={{ width: `${stage.progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status Dropdown */}
                        <td className="p-3.5 whitespace-nowrap align-middle">
                          <select
                            value={stage.status}
                            onChange={(e) => handleStatusChange(stage.id, e.target.value as any)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border focus:outline-none cursor-pointer transition ${getStatusBadge(
                              stage.status
                            )}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="delayed">Delayed</option>
                          </select>
                        </td>

                        {/* Action Buttons */}
                        <td className="p-3.5 whitespace-nowrap align-middle text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Fast "Mark Completed" Button */}
                            {!isDone ? (
                              <button
                                onClick={() => {
                                  setQuickCompleteModalStage(stage);
                                  setCompletionNotes(stage.remarks || '');
                                }}
                                title="Department Handover: Mark this stage Completed"
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                              >
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Mark Done</span>
                              </button>
                            ) : (
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Done
                              </span>
                            )}

                            {/* Edit Stage */}
                            <button
                              onClick={() => handleOpenEditModal(stage)}
                              title="Edit Stage & Assignees"
                              className="p-1.5 hover:bg-white text-[#70665F] hover:text-[#75401F] rounded-lg border border-transparent hover:border-[#E7DED5] transition cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Stage */}
                            <button
                              onClick={() => handleDeleteStage(stage.id, stage.stageName)}
                              title="Remove Stage (Auto-renumbers remaining)"
                              className="p-1.5 hover:bg-rose-50 text-[#70665F] hover:text-rose-600 rounded-lg border border-transparent hover:border-rose-200 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        )}
      </div>

      {/* Modal: Quick Handover / Mark Stage Completed */}
      {quickCompleteModalStage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E7DED5] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#E7DED5] flex items-center justify-between bg-emerald-50">
              <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Department Stage Completion
              </h3>
              <button
                onClick={() => setQuickCompleteModalStage(null)}
                className="p-1 text-[#70665F] hover:text-[#211B17] rounded-lg hover:bg-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmQuickComplete} className="p-5 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-[#70665F] uppercase tracking-wider block">
                  Stage to Complete
                </span>
                <p className="text-sm font-black text-[#211B17] mt-0.5">
                  #{quickCompleteModalStage.stageNumber}: {quickCompleteModalStage.stageName}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getDeptBadge(quickCompleteModalStage.responsibleDepartment)}`}>
                    {quickCompleteModalStage.responsibleDepartment}
                  </span>
                  <span className="text-xs text-[#70665F]">
                    Team: {quickCompleteModalStage.responsibleEmployee}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4A3E39] mb-1">
                  Completion / Handover Remarks
                </label>
                <textarea
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g. GA Drawing approved by client. Ready for BOM explosion and Purchase requisition..."
                  className="w-full px-3 py-2 bg-white border border-[#E7DED5] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <ShieldCheck className="w-4 h-4" /> Handover Confirmation
                </div>
                <p>
                  Marking completed will set Progress to 100%, record today's actual date, and update the project's overall completion percentage.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7DED5]">
                <button
                  type="button"
                  onClick={() => setQuickCompleteModalStage(null)}
                  className="px-4 py-2 bg-[#FAF7F2] hover:bg-slate-100 text-[#4A3E39] rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Check className="w-4 h-4" />
                  Confirm Completion & Handover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add or Edit Custom Planning Stage with Multi-Assignees */}
      {(isAddModalOpen || editingStage) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E7DED5] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="sticky top-0 z-10 p-4 border-b border-[#E7DED5] flex items-center justify-between bg-[#FAF7F2]">
              <h3 className="font-bold text-[#211B17] text-sm flex items-center gap-2">
                {editingStage ? (
                  <>
                    <Edit className="w-4 h-4 text-[#75401F]" />
                    Edit Stage #{editingStage.stageNumber}: {editingStage.stageName}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-[#75401F]" />
                    Add Custom Planning Stage
                  </>
                )}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStage(null);
                }}
                className="p-1 text-[#70665F] hover:text-[#211B17] rounded-lg hover:bg-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={editingStage ? handleSaveEditStage : handleSaveNewStage}
              className="p-5 sm:p-6 space-y-4"
            >
              {/* Target Project Selection */}
              <div>
                <label className="block text-[11px] font-bold text-[#4A3E39] mb-1">
                  Target Project <span className="text-rose-500">*</span>
                </label>
                {projectJobs.length > 0 ? (
                  <select
                    value={activeProject?.id || selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E7DED5] rounded-xl text-xs font-bold text-[#211B17] focus:outline-none focus:border-[#75401F]"
                  >
                    {projectJobs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.projectNumber} ({p.jobNumber}) • {p.customerName} - {p.productName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="px-3 py-2 bg-[#FAF3EA] border border-[#E7DED5] rounded-xl text-xs text-[#75401F] font-semibold">
                    Default Project (PRJ-2026-0001) will be assigned.
                  </div>
                )}
              </div>

              {/* Stage Name */}
              <div>
                <label className="block text-[11px] font-bold text-[#4A3E39] mb-1">
                  Stage Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formStageName}
                  onChange={(e) => setFormStageName(e.target.value)}
                  placeholder="e.g. Stage 3: Design CAD 3D & GA Drawings"
                  className="w-full px-3 py-2 bg-white border border-[#E7DED5] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-[#75401F]"
                />
              </div>

              {/* Department & Deliverables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A3E39] mb-1">
                    Responsible Department
                  </label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E7DED5] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-[#75401F]"
                  >
                    <option value="crm">CRM & Sales</option>
                    <option value="project">Project Management</option>
                    <option value="designer">Engineering & Design</option>
                    <option value="purchase">Purchase & Procurement</option>
                    <option value="store">Store & Inventory</option>
                    <option value="production">Production & Fabrication</option>
                    <option value="maintenance">Maintenance & Site Erection</option>
                    <option value="accounting">Accounting & Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4A3E39] mb-1">
                    Key Deliverables / Milestone Document
                  </label>
                  <input
                    type="text"
                    value={formDeliverables}
                    onChange={(e) => setFormDeliverables(e.target.value)}
                    placeholder="e.g. Approved GA Drawing Rev-01"
                    className="w-full px-3 py-2 bg-white border border-[#E7DED5] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-[#75401F]"
                  />
                </div>
              </div>

              {/* MULTI-ASSIGNEES SELECTOR SECTION */}
              <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E7DED5] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#211B17]">
                    <Users className="w-4 h-4 text-[#75401F]" />
                    <span>Assign Team Members / Employees (Multiple Users)</span>
                  </div>
                  <span className="text-[10px] text-[#70665F] font-semibold">
                    {selectedAssignees.length} Selected
                  </span>
                </div>

                {/* Selected Assignees Chips */}
                {selectedAssignees.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-lg border border-[#E7DED5] min-h-[38px] items-center">
                    {selectedAssignees.map((a) => (
                      <span
                        key={a.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF3EA] text-[#75401F] border border-[#E7DED5] text-[11px] font-bold"
                      >
                        <span>{a.name}</span>
                        {a.role && <span className="text-[9px] text-[#70665F] font-normal">({a.role})</span>}
                        <button
                          type="button"
                          onClick={() => removeAssignee(a.id)}
                          className="hover:text-rose-600 rounded p-0.5 transition cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#70665F] italic">
                    No employees assigned yet. Select one or more users from the list below:
                  </p>
                )}

                {/* Employee Filter & Search */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#70665F]" />
                    <input
                      type="text"
                      placeholder="Search employees by name, role or designation..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-[#E7DED5] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-[#75401F]"
                    />
                  </div>
                  <select
                    value={employeeDeptFilter}
                    onChange={(e) => setEmployeeDeptFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-[#E7DED5] rounded-lg text-xs font-semibold text-[#211B17] focus:outline-none focus:border-[#75401F] cursor-pointer"
                  >
                    <option value="all">All Departments</option>
                    <option value="project">Project</option>
                    <option value="design">Design</option>
                    <option value="production">Production</option>
                    <option value="store">Store</option>
                    <option value="purchase">Purchase</option>
                    <option value="crm">CRM</option>
                    <option value="quality">Quality</option>
                  </select>
                </div>

                {/* Scrollable Checkbox List of Available Employees */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1 bg-white rounded-lg border border-[#E7DED5] scrollbar-thin">
                  {filteredEmployeesList.map((emp) => {
                    const fullName = `${emp.firstName} ${emp.lastName}`.trim();
                    const isChecked = selectedAssignees.some(
                      (a) => a.id === emp.id || a.name?.toLowerCase() === fullName?.toLowerCase()
                    );

                    return (
                      <div
                        key={emp.id}
                        onClick={() => toggleAssignee(emp)}
                        className={`flex items-center justify-between p-2 rounded-lg border transition cursor-pointer select-none ${
                          isChecked
                            ? 'bg-[#FAF3EA] border-[#75401F]/40 text-[#75401F]'
                            : 'hover:bg-slate-50 border-transparent text-[#4A3E39]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isChecked ? 'bg-[#75401F] border-[#75401F] text-[#211B17]' : 'border-[#E7DED5] bg-white'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="font-bold text-xs block leading-tight">{fullName}</span>
                            <span className="text-[10px] text-[#70665F] block leading-tight">
                              {emp.designation || emp.roleName} • {emp.departmentName}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Schedule Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A3E39] mb-1">
                    Planned Start Date
                  </label>
                  <input
                    type="date"
                    value={formPlannedStart}
                    onChange={(e) => setFormPlannedStart(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E7DED5] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-[#75401F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A3E39] mb-1">
                    Planned End Date
                  </label>
                  <input
                    type="date"
                    value={formPlannedEnd}
                    onChange={(e) => setFormPlannedEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E7DED5] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-[#75401F]"
                  />
                </div>
              </div>

              {/* Actual Dates (for editing) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A3E39] mb-1">
                    Actual Start Date
                  </label>
                  <input
                    type="date"
                    value={formActualStart}
                    onChange={(e) => setFormActualStart(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E7DED5] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-[#75401F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4A3E39] mb-1">
                    Actual End Date
                  </label>
                  <input
                    type="date"
                    value={formActualEnd}
                    onChange={(e) => setFormActualEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E7DED5] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-[#75401F]"
                  />
                </div>
              </div>

              {/* Status & Progress Slider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A3E39] mb-1">Stage Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => {
                      const newSt = e.target.value as any;
                      setFormStatus(newSt);
                      if (newSt === 'completed') setFormProgress(100);
                      else if (newSt === 'pending') setFormProgress(0);
                      else if (newSt === 'in_progress' && formProgress === 0) setFormProgress(50);
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#E7DED5] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-[#75401F]"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4A3E39] mb-1">
                    Progress Percentage: <span className="font-mono font-black text-[#75401F]">{formProgress}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={formProgress}
                    onChange={(e) => setFormProgress(Number(e.target.value))}
                    className="w-full accent-[#75401F] mt-2 cursor-pointer"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-[11px] font-bold text-[#4A3E39] mb-1">
                  Scope Details / Department Handover Remarks
                </label>
                <textarea
                  rows={2}
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  placeholder="Specific requirements, notes, drawing revisions or deliverables..."
                  className="w-full px-3 py-2 bg-white border border-[#E7DED5] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-[#75401F]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7DED5]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStage(null);
                  }}
                  className="px-4 py-2 bg-[#FAF7F2] hover:bg-slate-100 text-[#4A3E39] rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#75401F] hover:bg-[#5C3318] text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingStage ? 'Save Changes' : 'Create Stage'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
