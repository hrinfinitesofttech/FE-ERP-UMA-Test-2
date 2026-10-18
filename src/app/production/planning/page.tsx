'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { ProjectPlanningRecord, PlannedTaskItem } from '../../../types/crm';
import { formatDate } from '../../../lib/utils';
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
} from 'lucide-react';

export default function ProductionPlanningPage() {
  const router = useRouter();
  const {
    projectPlanningRecords,
    updateProjectPlanningTaskStatus,
    isInitialLoading,
  } = useERP();

  // Mode: 'list' (all projects table) | 'project-tasks' (detailed task execution board for selected project)
  const [mode, setMode] = useState<'list' | 'project-tasks'>('list');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  // Search & Status Filter for the Project List Table
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed' | 'planned'>('all');

  // Quick Toast Notification
  const [toastMessage, setToastMessage] = useState<{ title: string; text: string } | null>(null);
  const showToast = (title: string, text: string) => {
    setToastMessage({ title, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Currently Selected Project Record for Task Execution
  const currentPlan = useMemo(() => {
    if (!selectedPlanId) return projectPlanningRecords[0] || null;
    return projectPlanningRecords.find((r) => r.id === selectedPlanId || r.projectId === selectedPlanId) || projectPlanningRecords[0] || null;
  }, [projectPlanningRecords, selectedPlanId]);

  // Filtered Project Plans for List Table
  const filteredProjectPlans = useMemo(() => {
    return projectPlanningRecords.filter((plan) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        plan.planningNumber.toLowerCase().includes(q) ||
        plan.projectNumber.toLowerCase().includes(q) ||
        plan.customerName.toLowerCase().includes(q) ||
        plan.productName.toLowerCase().includes(q) ||
        (plan.customerPoNumber && plan.customerPoNumber.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'in_progress' && plan.status === 'in_progress') ||
        (statusFilter === 'completed' && plan.status === 'completed') ||
        (statusFilter === 'planned' && (plan.status === 'planned' || plan.status === 'draft'));

      return matchSearch && matchStatus;
    });
  }, [projectPlanningRecords, searchQuery, statusFilter]);

  // Overall KPI Metrics
  const metrics = useMemo(() => {
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

  // Open Project Tasks Execution View
  const handleOpenProjectTasks = (plan: ProjectPlanningRecord) => {
    setSelectedPlanId(plan.id);
    setMode('project-tasks');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Supervisor Action: Start a task (set to 25% or in_progress)
  const handleStartTask = (taskId: string, taskName: string) => {
    if (!currentPlan) return;
    updateProjectPlanningTaskStatus(currentPlan.id, taskId, 'in_progress', 25);
    showToast('Task Started', `Operation "${taskName}" is now In-Progress.`);
  };

  // Supervisor Action: Update task progress percent (25%, 50%, 75%, 100%)
  const handleUpdateTaskPercent = (taskId: string, taskName: string, pct: number) => {
    if (!currentPlan) return;
    if (pct >= 100) {
      handleCompleteTask(taskId, taskName);
    } else {
      updateProjectPlanningTaskStatus(currentPlan.id, taskId, 'in_progress', pct);
      showToast('Progress Updated', `"${taskName}" progress set to ${pct}%.`);
    }
  };

  // Supervisor Action: Complete task (100% and advance next task)
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

  // Supervisor Action: Reopen a completed task
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
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="font-bold text-emerald-300">{toastMessage.title}</div>
            <div className="text-slate-300 text-[11px]">{toastMessage.text}</div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: PROJECTS PLANNING LIST TABLE (DEFAULT VIEW LIKE PROJECT PLANNING) */}
      {/* ========================================================================= */}
      {mode === 'list' && (
        <div className="space-y-4">
          {/* Header & Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div>
              <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-0.5">
                DASHBOARD / PRODUCTION &amp; SHOP FLOOR / PRODUCTION PLANNING
              </div>
              <h1 className="text-2xl font-black text-[#211B17] tracking-tight">
                Production Planning &amp; Operations
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                List of planned manufacturing projects. Click any project to view tasks and execute operations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/projects/planning"
                className="px-3.5 py-2 bg-white border border-[#EBE3DB] hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-crm-brand-700" />
                <span>Go to Project Planning</span>
              </Link>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Planned Projects</span>
                <Briefcase className="w-4 h-4 text-crm-brand-700" />
              </div>
              <div className="text-2xl font-black text-[#211B17]">{metrics.totalProjects}</div>
              <div className="text-[11px] text-slate-500">Total Projects in Pipeline</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-blue-600">
                <span className="text-xs font-semibold uppercase tracking-wider">In Production</span>
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-700">{metrics.inProgressProjects}</div>
              <div className="text-[11px] text-slate-500">Active Shop Floor Work</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700">{metrics.completedProjects}</div>
              <div className="text-[11px] text-slate-500">100% Finished Projects</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-purple-600">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Tasks Done</span>
                <CheckSquare className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-700">
                {metrics.doneTasks} <span className="text-sm font-semibold text-slate-400">/ {metrics.totalTasks}</span>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-brand-700 text-[#211B17]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Status:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crm-brand-700 text-[#211B17]"
              >
                <option value="all">All Projects ({projectPlanningRecords.length})</option>
                <option value="in_progress">In Production ({metrics.inProgressProjects})</option>
                <option value="completed">Completed ({metrics.completedProjects})</option>
                <option value="planned">Planned ({metrics.plannedProjects})</option>
              </select>
            </div>
          </div>

          {/* Table Container (Matching Image 2 Exactly) */}
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
                    <th className="py-3 px-4 w-32 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProjectPlans.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Workflow className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600 text-sm">No project plans found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {searchQuery
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

                          {/* Action Button */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleOpenProjectTasks(r)}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-1.5 mx-auto active:scale-95 cursor-pointer"
                            >
                              <span>View Tasks</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
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
                Click any project row to open and execute shop floor tasks
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: PROJECT TASKS EXECUTION VIEW (WHEN USER CLICKS ON A PROJECT)      */}
      {/* ========================================================================= */}
      {mode === 'project-tasks' && currentPlan && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Back Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EBE3DB] shadow-xs">
            <button
              onClick={() => setMode('list')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to All Projects</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
                {currentPlan.projectNumber}
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                {currentPlan.planningNumber}
              </span>
              <Link
                href={`/projects/planning?mode=edit&id=${currentPlan.id}`}
                className="px-3 py-1.5 bg-white border border-[#EBE3DB] hover:bg-slate-50 text-xs font-bold text-slate-700 rounded-xl transition flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5 text-crm-brand-700" />
                <span>Edit in Project Planning</span>
              </Link>
            </div>
          </div>

          {/* Project Details Banner */}
          <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs">
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
                    Customer PO: <strong className="font-mono text-crm-brand-700">{currentPlan.customerPoNumber || 'N/A'}</strong>
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
          <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EBE3DB] pb-3">
              <div>
                <h3 className="text-base font-black text-[#211B17] flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-amber-600" />
                  <span>Shop Floor Operations &amp; Task Execution</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sequential list of planned operations with assigned personnel and timelines. Mark <strong>100% Complete</strong> when finished to advance to the next operation.
                </p>
              </div>

              <div className="text-xs font-semibold text-slate-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                ⚡ Real-time synced with Project Planning
              </div>
            </div>

            {/* List of Tasks */}
            {!currentPlan.tasks || currentPlan.tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-[#FAF7F2] rounded-xl border border-dashed border-slate-200">
                <p className="text-sm font-semibold text-slate-600">No tasks have been planned for this project yet.</p>
                <Link
                  href={`/projects/planning?mode=edit&id=${currentPlan.id}`}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-crm-brand-700 text-white font-bold rounded-xl text-xs hover:bg-crm-brand-800 transition"
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
                  const isPending = !isCompleted && !isInProgress;

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
                              {task.masterTaskId && (
                                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                                  {task.masterTaskId}
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

                            {/* Task Metadata: Who & When */}
                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 pt-1">
                              {/* Assigned Persons */}
                              <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-purple-600" />
                                <span className="text-slate-500 text-[11px]">Assigned To:</span>
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

                              {task.remarks && (
                                <div className="text-[11px] text-slate-500 italic">
                                  "{task.remarks}"
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Execution & Progress Controls */}
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
                                  onClick={() => handleUpdateTaskPercent(task.id, task.taskName, pct)}
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
    </div>
  );
}
