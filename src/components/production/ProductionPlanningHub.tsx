'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../context/ERPContext';
import { ProjectPlanningRecord } from '../../types/crm';
import { formatDate } from '../../lib/utils';
import {
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  Filter,
  Check,
  ExternalLink,
  Briefcase,
  Activity,
  Workflow,
  CheckSquare,
  Send,
  ClipboardList,
} from 'lucide-react';

export interface ProductionPlanningHubProps {
  initialTab?: 'planning';
}

function ProductionPlanningHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    projectPlanningRecords,
    dispatchProjectPlanningToDepartments,
  } = useERP();

  // If projectId or id is in query params, navigate to dedicated page
  useEffect(() => {
    const paramProj = searchParams.get('projectId') || searchParams.get('id');
    if (paramProj) {
      router.push(`/production/planning/${encodeURIComponent(paramProj)}`);
    }
  }, [searchParams, router]);

  // Toast Notifications
  const [toastMessage, setToastMessage] = useState<{ title: string; text: string } | null>(null);
  const showToast = (title: string, text: string) => {
    setToastMessage({ title, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // --- PLANNING FILTERS ---
  const [planningSearchQuery, setPlanningSearchQuery] = useState<string>('');
  const [planningStatusFilter, setPlanningStatusFilter] = useState<'all' | 'in_progress' | 'completed' | 'planned'>('all');

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

  // Filtered Project Plans
  const filteredProjectPlans = useMemo(() => {
    return projectPlanningRecords.filter((r) => {
      if (planningStatusFilter !== 'all') {
        if (planningStatusFilter === 'completed' && r.status !== 'completed' && r.overallProgress < 100) return false;
        if (planningStatusFilter === 'in_progress' && (r.status !== 'in_progress' || r.overallProgress >= 100)) return false;
        if (planningStatusFilter === 'planned' && r.status !== 'planned' && r.status !== 'draft') return false;
      }

      if (planningSearchQuery.trim()) {
        const q = planningSearchQuery.toLowerCase().trim();
        const match =
          r.projectNumber.toLowerCase().includes(q) ||
          r.planningNumber.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q) ||
          (r.customerPoNumber && r.customerPoNumber.toLowerCase().includes(q)) ||
          (r.tasks && r.tasks.some((t) => t.taskName.toLowerCase().includes(q)));
        if (!match) return false;
      }

      return true;
    });
  }, [projectPlanningRecords, planningStatusFilter, planningSearchQuery]);

  // Dispatch / Notify departments
  const handleDispatchPlan = (id: string, projectNumber: string) => {
    dispatchProjectPlanningToDepartments(id);
    showToast('Plan Dispatched', `Project ${projectNumber} sent to Production, Design, Store & Purchase departments.`);
  };

  // Open dedicated Project Tasks Page
  const handleOpenProjectTasks = (plan: ProjectPlanningRecord) => {
    router.push(`/production/planning/${encodeURIComponent(plan.id)}`);
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

      {/* Top Header - Single Clean Page */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-0.5">
              DASHBOARD / PRODUCTION &amp; SHOP FLOOR / PRODUCTION PLANNING
            </div>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2.5">
              <Compass className="w-6 h-6 text-amber-600" />
              <span>Production Planning</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                Live Pipeline
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Master project production schedules, stage progress tracking, and shop floor operations pipeline. Click any project to open its dedicated tasks board.
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
      </div>

      {/* Main Project Planning Content */}
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
                          : 'Create a project planning record in Master Project Planning to get started.'}
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
                                <span>Dispatched</span>
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
              Click any project row to open its dedicated operations and tasks board
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductionPlanningHub({ initialTab = 'planning' }: ProductionPlanningHubProps) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Compass className="w-4 h-4 text-amber-600 animate-spin" />
          <span>Loading Production Planning...</span>
        </div>
      }
    >
      <ProductionPlanningHubContent />
    </Suspense>
  );
}
