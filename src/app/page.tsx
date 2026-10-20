'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useERP } from '../context/ERPContext';
import { api } from '../lib/apiClient';
import {
  FileText,
  Users,
  AlertTriangle,
  ShieldCheck,
  Search,
  Filter,
  User,
  Share2,
  Layers,
  Clock,
  CheckCircle2,
  Calendar,
  Briefcase,
  Building,
  ArrowRight,
  ChevronRight,
  Play,
  Square,
  CheckSquare,
  Zap,
  TrendingUp,
  Box,
  Factory,
  ShoppingCart,
  Palette,
  Landmark,
  AlertCircle,
  Award,
  Sparkles,
  MapPin,
  Check,
  Percent,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CustomSelect } from '../components/ui/CustomSelect';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const {
    currentUser,
    projectJobs,
    salesOrders,
    manufacturingJobs,
    attendanceRecords,
    leaveBalances,
    leaveRequests,
    projectTasks = [],
    updateProjectTask,
    checkInAttendance,
    checkOutAttendance,
  } = useERP();

  const isSuperAdmin =
    currentUser?.roleType === 'super_admin' ||
    currentUser?.roleName === 'Super Admin' ||
    currentUser?.username === 'admin' ||
    currentUser?.username === 'rajesh.admin';

  const hasOperationsAccess =
    isSuperAdmin ||
    (Array.isArray(currentUser?.assignedModules) &&
      currentUser.assignedModules.some((m) =>
        ['production', 'projects', 'crm', 'purchase', 'store'].includes((m || '').toLowerCase())
      ));

  const isSuperAdminOrAdmin = isSuperAdmin || (currentUser?.roleType === 'admin' && hasOperationsAccess);

  const [viewMode, setViewMode] = useState<'executive' | 'employee'>('executive');
  const [stageFilter, setStageFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Live Digital Clock
  const [currentTime, setCurrentTime] = useState<string>('');
  useEffect(() => {
    setMounted(true);
    if (!hasOperationsAccess || currentUser?.roleType === 'employee') {
      setViewMode('employee');
    }
  }, [currentUser, hasOperationsAccess]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // Today's Date String
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  // Live Backend Employee Dashboard State
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setDashboardLoading(true);
      const data = await api.hr.employeeDashboard(currentUser?.id);
      if (data && (data.profile || data.todayAttendance)) {
        setDashboardData(data);
      }
    } catch (err) {
      console.warn('Failed to load employee dashboard from backend API:', err);
    } finally {
      setDashboardLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchDashboard();
    }
  }, [currentUser?.id, fetchDashboard]);

  // Today's Attendance Record for Current User (Prefer Live API Data)
  const todayAttendance = useMemo(() => {
    if (dashboardData?.todayAttendance) {
      return {
        checkIn: dashboardData.todayAttendance.checkIn,
        checkOut: dashboardData.todayAttendance.checkOut,
        status: dashboardData.todayAttendance.status,
        totalHours: dashboardData.todayAttendance.totalHours,
        lateMinutes: dashboardData.todayAttendance.lateMinutes,
        shiftName: dashboardData.todayAttendance.shiftName,
        canCheckIn: dashboardData.todayAttendance.canCheckIn,
        canCheckOut: dashboardData.todayAttendance.canCheckOut,
      };
    }
    return attendanceRecords.find(
      (a) =>
        (a.employeeId === currentUser?.id ||
          a.employeeName === currentUser?.name ||
          (currentUser?.firstName && a.employeeName?.includes(currentUser.firstName))) &&
        a.date === todayDateStr
    );
  }, [dashboardData, attendanceRecords, currentUser, todayDateStr]);

  // Attendance Punch State
  const [punchLoading, setPunchLoading] = useState(false);
  const [punchFeedback, setPunchFeedback] = useState<{ msg: string; isError?: boolean } | null>(null);

  const handlePunchIn = async () => {
    setPunchLoading(true);
    setPunchFeedback(null);
    try {
      const res = await api.hr.attendance.checkIn();
      setPunchFeedback({ msg: res.message || 'Punched In Successfully!' });
      await fetchDashboard();
      if (checkInAttendance) {
        checkInAttendance({
          employeeId: currentUser?.id,
          employeeName: currentUser?.name,
          department: currentUser?.departmentName || currentUser?.department,
          shiftName: 'General Day Shift (09:00 - 18:00)',
        }).catch?.(() => {});
      }
    } catch (err: any) {
      const errMsg = err?.data?.error || err?.message || 'Failed to record punch in. Please try again.';
      setPunchFeedback({ msg: errMsg, isError: true });
    } finally {
      setPunchLoading(false);
      setTimeout(() => setPunchFeedback(null), 5000);
    }
  };

  const handlePunchOut = async () => {
    setPunchLoading(true);
    setPunchFeedback(null);
    try {
      const res = await api.hr.attendance.checkOut();
      const hrs = res.record?.total_hours !== undefined ? ` (${res.record.total_hours} hrs logged)` : '';
      setPunchFeedback({ msg: (res.message || 'Punched Out Successfully!') + hrs });
      await fetchDashboard();
      if (checkOutAttendance) {
        checkOutAttendance({ employeeId: currentUser?.id }).catch?.(() => {});
      }
    } catch (err: any) {
      const errMsg = err?.data?.error || err?.message || 'Failed to record punch out. Please try again.';
      setPunchFeedback({ msg: errMsg, isError: true });
    } finally {
      setPunchLoading(false);
      setTimeout(() => setPunchFeedback(null), 5000);
    }
  };

  // Filter My Tasks (Prefer Live API Data)
  const myAssignedTasks = useMemo(() => {
    if (dashboardData?.tasksSummary?.recentTasks && dashboardData.tasksSummary.recentTasks.length > 0) {
      return dashboardData.tasksSummary.recentTasks.map((t: any) => ({
        id: t.id,
        projectNumber: t.taskNumber,
        taskName: t.title,
        title: t.title,
        priority: t.priority,
        status: t.status,
        progressPercent: t.progressPercent,
        dueDate: t.dueDate,
        isOverdue: t.isOverdue,
      }));
    }
    if (!projectTasks || projectTasks.length === 0) return [];
    return projectTasks.filter((t) => {
      const matchId = t.assignedTo && (t.assignedTo === currentUser?.id || t.assignedTo === currentUser?.username);
      const matchName =
        t.assignedToName &&
        currentUser?.name &&
        t.assignedToName.toLowerCase().includes(currentUser.name.toLowerCase());
      return matchId || matchName;
    });
  }, [dashboardData, projectTasks, currentUser]);

  // Task Progress Updating State
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const handleUpdateTaskProgress = async (taskId: string, newPercent: number) => {
    setUpdatingTaskId(taskId);
    try {
      if (newPercent >= 100) {
        await api.projects.submitTaskForReview(taskId, { remarks: 'Submitted stage progress to 100%' });
      } else {
        await api.projects.updateTaskProgress(taskId, { progress_percent: newPercent, status: 'In Progress' });
      }
      await fetchDashboard();
      const nextStatus = newPercent >= 100 ? 'Submitted for Review' : newPercent > 0 ? 'In Progress' : 'Assigned';
      if (updateProjectTask) {
        updateProjectTask(taskId, { progressPercent: newPercent, status: nextStatus });
      }
    } catch (err: any) {
      console.warn('Failed to update task progress on backend:', err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Dynamic KPIs derived 100% from live backend API state
  const activeBacklog =
    salesOrders.length > 0
      ? salesOrders.reduce((sum, so) => sum + (Number(so.orderValue) || 0), 0)
      : projectJobs.reduce((sum, pj) => sum + (Number(pj.orderValue) || 0), 0);

  const activeFloorCount =
    manufacturingJobs.length > 0 ? manufacturingJobs.length : projectJobs.length;

  const inFabCount = projectJobs.filter((p) => {
    const stg = ((p.currentStage || (p as any).stage || p.status || '') as string)?.toLowerCase();
    return stg.includes('fab') || stg.includes('prod') || stg.includes('weld');
  }).length;

  const highPriorityJobs = projectJobs.filter(
    (p) => p.priority === 'urgent' || p.priority === 'high'
  );
  const delayedJobs = projectJobs.filter((p) => (p.status as string) === 'delayed');

  // Dynamic Jobs mapped directly from API
  const jobsData = projectJobs.map((job) => {
    const rawStage = (
      (job.currentStage || (job as any).stage || job.status || 'PLANNING') as string
    )?.toUpperCase();

    let stageBadge = 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
    if (rawStage.includes('PROD') || rawStage.includes('FAB') || rawStage.includes('WELD')) {
      stageBadge = 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]';
    } else if (
      rawStage.includes('QUAL') ||
      rawStage.includes('QC') ||
      rawStage.includes('INSPECT')
    ) {
      stageBadge = 'bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]';
    } else if (rawStage.includes('STORE') || rawStage.includes('PURCHASE')) {
      stageBadge = 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]';
    }

    return {
      id: job.jobNumber || job.projectNumber || job.id,
      customer: job.customerName || 'Direct Customer',
      poRef: job.customerPoNumber
        ? `PO: ${job.customerPoNumber}`
        : job.salesOrderNumber
        ? `SO: ${job.salesOrderNumber}`
        : 'Direct Order',
      equipment: job.productName || job.projectName || 'MTO Equipment',
      value: `₹ ${(Number(job.orderValue) || 0)?.toLocaleString('en-IN')}`,
      dispatch: job.deliveryDate || (job as any).targetDeliveryDate || 'TBD',
      progress: Number(job.progressPercent) || 0,
      stage: rawStage,
      stageBadge,
    };
  });

  const filteredJobs = jobsData.filter((job) => {
    const matchesStage = stageFilter === 'All' || job.stage.includes(stageFilter?.toUpperCase());
    const matchesSearch =
      !searchQuery?.trim() ||
      job.id?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      job.customer?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      job.equipment?.toLowerCase().includes(searchQuery?.toLowerCase());
    return matchesStage && matchesSearch;
  });

  if (!mounted) {
    return null;
  }

  // Greeting based on hour
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Top Bar Switcher (Visible to Admins or Any user wishing to inspect both views) */}
      <div className="flex items-center justify-between gap-3 bg-white border border-[#E7DED5] rounded-xl px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-[#3E2723]">
            Uma ERP • Department Workspace
          </span>
          <span className="text-[11px] font-semibold text-[#8C7A6F] hidden sm:inline">
            | Logged in as: {currentUser?.name || currentUser?.username} ({currentUser?.roleName || currentUser?.roleType || 'Staff'})
          </span>
        </div>

        {isSuperAdminOrAdmin && (
          <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-lg border border-[#E7DED5]">
            <button
              onClick={() => setViewMode('executive')}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5',
                viewMode === 'executive'
                  ? 'bg-crm-brand-700 text-white shadow-xs'
                  : 'text-[#6E5D53] hover:text-[#211B17]'
              )}
            >
              <Factory className="w-3.5 h-3.5" />
              <span>Executive ERP</span>
            </button>
            <button
              onClick={() => setViewMode('employee')}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5',
                viewMode === 'employee'
                  ? 'bg-crm-brand-700 text-white shadow-xs'
                  : 'text-[#6E5D53] hover:text-[#211B17]'
              )}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Workspace</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. EMPLOYEE PERSONAL WORKSPACE VIEW                                      */}
      {/* ========================================================================= */}
      {viewMode === 'employee' ? (
        <div className="space-y-4 md:space-y-5">
          {/* A. Welcome Banner & Identity Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FAF3EA] via-[#F8EDE0] to-[#F1DFC9] border border-[#E9DFD3] p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold text-[#9C6538] tracking-widest uppercase font-mono">
                    {currentUser?.departmentName || currentUser?.department || 'Department Staff'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-crm-brand-100 text-crm-brand-800 text-[10px] font-bold border border-crm-brand-200">
                    {currentUser?.roleType === 'department_manager'
                      ? 'MANAGER ACCESS'
                      : currentUser?.roleType === 'super_admin'
                      ? 'SUPER ADMIN'
                      : 'EMPLOYEE'}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-[26px] font-extrabold text-[#211B17] tracking-tight leading-snug">
                  {greeting}, {currentUser?.firstName || currentUser?.name || 'Team Member'}!
                </h1>
                <p className="text-xs text-[#6F6156] leading-relaxed">
                  Designation: <span className="font-semibold text-[#211B17]">{currentUser?.designation || currentUser?.roleName || 'Staff Member'}</span> • Location: <span className="font-semibold text-[#211B17]">{currentUser?.workLocation || 'Main Plant & Works'}</span> • ID: <span className="font-mono font-bold text-crm-brand-700">{currentUser?.id || 'EMP-101'}</span>
                </p>
              </div>

              {/* Live Digital Clock Widget */}
              <div className="bg-white/85 backdrop-blur-xs border border-[#E7DED5] rounded-xl px-5 py-3 shadow-xs text-right min-w-[200px]">
                <div className="text-[11px] font-bold text-[#8C7A6F] uppercase tracking-wider">
                  {todayFormatted}
                </div>
                <div className="text-2xl font-black text-[#211B17] font-mono tracking-tight mt-0.5">
                  {currentTime || '09:00:00 AM'}
                </div>
                <div className="text-[10px] font-semibold text-emerald-700 flex items-center justify-end gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  IST (UTC +5:30)
                </div>
              </div>
            </div>
          </div>

          {/* Feedback banner */}
          {punchFeedback && (
            <div
              className={cn(
                'p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-1',
                punchFeedback.isError
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              )}
            >
              <span>{punchFeedback.msg}</span>
              <button onClick={() => setPunchFeedback(null)} className="text-xs font-bold opacity-70 hover:opacity-100">
                ✕
              </button>
            </div>
          )}

          {/* B. Core Interactive Widgets (Attendance Punch + Monthly Balances) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Widget 1: Live Web Punch (Check-in / Check-out) */}
            <div className="bg-white border border-[#E7DED5] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE4]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-crm-brand-50 text-crm-brand-700 flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#211B17]">Daily Web Punch</h3>
                      <p className="text-[10px] text-[#8C7A6F]">Shift: 09:00 AM - 06:00 PM</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                      todayAttendance?.checkOut
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : todayAttendance?.checkIn
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    )}
                  >
                    {todayAttendance?.checkOut
                      ? 'Shift Completed'
                      : todayAttendance?.checkIn
                      ? 'Checked In'
                      : 'Not Punched Today'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EBE3DB]">
                    <span className="text-[10px] text-[#8C7A6F] block font-medium">In Time</span>
                    <span className="text-xs font-bold font-mono text-[#211B17]">
                      {todayAttendance?.checkIn || '--:--'}
                    </span>
                  </div>
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EBE3DB]">
                    <span className="text-[10px] text-[#8C7A6F] block font-medium">Out Time</span>
                    <span className="text-xs font-bold font-mono text-[#211B17]">
                      {todayAttendance?.checkOut || '--:--'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {!todayAttendance?.checkIn ? (
                  <button
                    disabled={punchLoading}
                    onClick={handlePunchIn}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{punchLoading ? 'Recording...' : 'Punch In (Start Shift)'}</span>
                  </button>
                ) : !todayAttendance?.checkOut ? (
                  <button
                    disabled={punchLoading}
                    onClick={handlePunchOut}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>{punchLoading ? 'Recording...' : 'Punch Out (End Shift)'}</span>
                  </button>
                ) : (
                  <div className="text-center py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold border border-slate-200">
                    ✓ You have completed both punches for today.
                  </div>
                )}
                <div className="text-right">
                  <Link
                    href="/hr/attendance"
                    className="text-[11px] text-crm-brand-700 hover:underline font-bold inline-flex items-center gap-1"
                  >
                    View Attendance History <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Widget 2: Monthly Attendance & Overtime */}
            <div className="bg-white border border-[#E7DED5] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE4]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#211B17]">Monthly Attendance Record</h3>
                      <p className="text-[10px] text-[#8C7A6F]">{dashboardData?.monthlySummary?.month || 'Current Month'}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#211B17]">
                    {dashboardData?.monthlySummary?.attendanceRate ? `${dashboardData.monthlySummary.attendanceRate}%` : '100%'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 my-4">
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EBE3DB] text-center">
                    <span className="text-[10px] text-[#8C7A6F] block">Present</span>
                    <span className="text-sm font-black text-emerald-700 font-mono">
                      {dashboardData?.monthlySummary?.presentDays !== undefined ? `${dashboardData.monthlySummary.presentDays} Days` : '0 Days'}
                    </span>
                  </div>
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EBE3DB] text-center">
                    <span className="text-[10px] text-[#8C7A6F] block">Late</span>
                    <span className="text-sm font-black text-amber-700 font-mono">
                      {dashboardData?.monthlySummary?.lateDays !== undefined ? `${dashboardData.monthlySummary.lateDays} Days` : '0 Days'}
                    </span>
                  </div>
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EBE3DB] text-center">
                    <span className="text-[10px] text-[#8C7A6F] block">Total Hours</span>
                    <span className="text-sm font-black text-crm-brand-700 font-mono">
                      {dashboardData?.monthlySummary?.totalHours !== undefined ? `${dashboardData.monthlySummary.totalHours}h` : '0.0h'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F2ECE4] flex items-center justify-between text-xs">
                <span className="text-[#8C7A6F]">Total Working Days: 26</span>
                <Link href="/hr/regularization" className="text-crm-brand-700 font-bold hover:underline">
                  Regularize Punch
                </Link>
              </div>
            </div>

            {/* Widget 3: Leave Balances & Fast Apply */}
            <div className="bg-white border border-[#E7DED5] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE4]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#211B17]">Leave Balances</h3>
                      <p className="text-[10px] text-[#8C7A6F]">Annual Entitlement FY 26-27</p>
                    </div>
                  </div>
                  <Link
                    href="/hr/leaves"
                    className="px-2.5 py-1 bg-crm-brand-700 hover:bg-crm-brand-800 text-white text-[11px] font-bold rounded-lg transition"
                  >
                    Apply Leave
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-2.5 my-4">
                  {(dashboardData?.leaveBalances && dashboardData.leaveBalances.length > 0
                    ? dashboardData.leaveBalances.slice(0, 3)
                    : [
                        { leaveCode: 'CL', leaveName: 'Casual', availableBalance: 12 },
                        { leaveCode: 'SL', leaveName: 'Sick', availableBalance: 10 },
                        { leaveCode: 'EL', leaveName: 'Earned', availableBalance: 18 },
                      ]
                  ).map((b: any, idx: number) => (
                    <div key={b.id || idx} className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EBE3DB] text-center">
                      <span className="text-[10px] text-[#8C7A6F] block truncate">{b.leaveCode || b.leave_code}</span>
                      <span className="text-sm font-black text-[#211B17] font-mono">
                        {b.availableBalance !== undefined ? b.availableBalance : b.available_balance} Left
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#F2ECE4] flex items-center justify-between text-xs">
                <span className="text-[#8C7A6F]">
                  Pending Approval: {dashboardData?.pendingLeaves ? dashboardData.pendingLeaves.length : 0}
                </span>
                <Link href="/hr/leaves" className="text-crm-brand-700 font-bold hover:underline">
                  My Applications
                </Link>
              </div>
            </div>
          </div>

          {/* C. My Assigned Department Tasks & Workflow Items */}
          <div className="bg-white border border-[#E7DED5] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F2ECE4]">
              <div>
                <h2 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-crm-brand-700" />
                  My Assigned Tasks & Action Items
                </h2>
                <p className="text-xs text-[#8C7A6F]">
                  Department responsibilities assigned to you from live ERP projects
                </p>
              </div>
              <Link
                href="/projects/planning"
                className="text-xs font-bold text-crm-brand-700 hover:underline flex items-center gap-1"
              >
                Project Planning <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {myAssignedTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8C7A6F] bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="font-bold text-[#211B17]">All caught up! No pending tasks assigned.</div>
                <p className="text-[11px] mt-0.5">
                  Tasks assigned to your profile by your manager will show up here automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {myAssignedTasks.map((t: any) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-[#E7DED5] bg-[#FAF7F2]/60 hover:bg-white transition-all flex flex-col justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold text-[#9C6538] uppercase">
                          {t.projectNumber || 'JOB-TASK'}
                        </span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[9px] font-bold uppercase',
                            t.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-800'
                              : t.priority === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          )}
                        >
                          {t.priority || 'NORMAL'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#211B17] line-clamp-1">
                        {t.taskName || t.title}
                      </h4>
                      <p className="text-[10px] text-[#70665F] mt-0.5 line-clamp-2">
                        {t.description || 'Execution in progress per department milestone requirements.'}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#EBE3DB]">
                      <div className="flex items-center justify-between text-[10px] text-[#70665F]">
                        <span>Due: <strong className="text-[#211B17]">{t.dueDate || 'TBD'}</strong></span>
                        <span className="font-mono font-bold text-[#211B17]">{t.progressPercent || 0}%</span>
                      </div>
                      <div className="w-full bg-[#E5DDD0] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-crm-brand-700 h-1.5 rounded-full transition-all"
                          style={{ width: `${t.progressPercent || 0}%` }}
                        />
                      </div>

                      {/* Quick progress update pills */}
                      <div className="flex items-center justify-between gap-1 pt-1">
                        <div className="flex gap-1">
                          {[25, 50, 75].map((pct) => (
                            <button
                              key={pct}
                              disabled={updatingTaskId === t.id}
                              onClick={() => handleUpdateTaskProgress(t.id, pct)}
                              className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-white hover:bg-slate-100 border border-[#E0D7CC] text-[#544B45]"
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                        <button
                          disabled={updatingTaskId === t.id}
                          onClick={() => handleUpdateTaskProgress(t.id, 100)}
                          className="px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1"
                        >
                          <Check className="w-2.5 h-2.5" /> Done
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* D. Department Quick Launch Center */}
          <div className="bg-white border border-[#E7DED5] rounded-2xl p-5 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#70665F] mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-crm-brand-700" />
              Authorized Module Shortcuts & Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(dashboardData?.moduleShortcuts && dashboardData.moduleShortcuts.length > 0
                ? dashboardData.moduleShortcuts
                : [
                    { module: 'production', label: 'Production Planning', href: '/production/planning', icon: 'Factory' },
                    { module: 'projects', label: 'Project Planning', href: '/projects/planning', icon: 'Workflow' },
                    { module: 'store', label: 'Stock Matrix', href: '/store/stock', icon: 'Box' },
                    { module: 'designer', label: 'Designer BOM', href: '/designer/bom', icon: 'Palette' },
                    { module: 'purchase', label: 'Indent / PR', href: '/purchase/requisition', icon: 'ShoppingCart' },
                    { module: 'hr', label: 'My Attendance', href: '/hr/attendance', icon: 'Clock' },
                  ]
              ).map((sc: any, idx: number) => (
                <Link
                  key={sc.module || idx}
                  href={sc.href}
                  className="p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F3ECE4] border border-[#EBE3DB] text-center transition group"
                >
                  <div className="w-9 h-9 mx-auto rounded-lg bg-crm-brand-50 text-crm-brand-700 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
                    {sc.icon === 'Play' ? <Play className="w-4 h-4" /> :
                     sc.icon === 'ShoppingCart' ? <ShoppingCart className="w-4 h-4" /> :
                     sc.icon === 'Box' ? <Box className="w-4 h-4" /> :
                     sc.icon === 'Palette' ? <Palette className="w-4 h-4" /> :
                     sc.icon === 'Users' ? <Users className="w-4 h-4" /> :
                     sc.icon === 'CheckSquare' ? <CheckSquare className="w-4 h-4" /> :
                     sc.icon === 'Landmark' ? <Landmark className="w-4 h-4" /> :
                     <Factory className="w-4 h-4" />}
                  </div>
                  <div className="text-xs font-bold text-[#211B17] truncate">{sc.label}</div>
                  <div className="text-[10px] text-[#8C7A6F] capitalize">{sc.module}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. EXECUTIVE MANUFACTURING ERP KPI & 360° JOB VIEW                        */
        /* ========================================================================= */
        <div className="space-y-4 md:space-y-5">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FAF3EA] via-[#F8EDE0] to-[#F1DFC9] border border-[#E9DFD3] p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
              <div className="space-y-1.5 max-w-2xl">
                <span className="text-[11px] font-bold text-[#9C6538] tracking-widest uppercase font-mono">
                  MANUFACTURING ERP
                </span>
                <h1 className="text-xl sm:text-2xl md:text-[26px] font-extrabold text-[#211B17] tracking-tight leading-snug">
                  Commercial Operations & 360° Job Traceability
                </h1>
                <p className="text-xs text-[#6F6156] leading-relaxed max-w-xl">
                  Unified control center for Customer Enquiries, Multi-Revision Quotations, Approved Customer POs, and Shop Floor Job Orders.
                </p>
              </div>

              {/* Right Visual Image Overlay Card */}
              <div className="w-full md:w-96 h-28 rounded-xl bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center border border-[#E5DDD0] relative overflow-hidden flex items-end p-3.5 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                <div className="relative z-10 text-white">
                  <div className="text-xs font-bold leading-tight drop-shadow-sm">Precision Manufacturing</div>
                  <div className="text-[10px] text-amber-200/90 font-medium">Real-Time API Sync</div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Metric KPI Cards - 100% Dynamic from Live API */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4">
            {/* Card 1: Active Order Backlog */}
            <div className="bg-white border border-[#E7DED5] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(62,39,35,0.04)] hover:border-[#D5CAC0] transition-all flex flex-col justify-between min-h-[115px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F6E7D8] flex items-center justify-center text-[#8C5229] flex-shrink-0 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-[#70665F] font-semibold">Active Order Backlog</div>
                  <div className="text-xl font-bold text-[#211B17] font-mono tracking-tight truncate" suppressHydrationWarning>
                    ₹ {activeBacklog?.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#F2ECE4] text-[11px] text-[#169B62] font-semibold flex items-center gap-1">
                <span>{salesOrders.length} Sales Orders</span>
                <span className="text-[#8D827A] font-normal">• Live from API</span>
              </div>
            </div>

            {/* Card 2: Shop Floor Machines */}
            <div className="bg-white border border-[#E7DED5] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(62,39,35,0.04)] hover:border-[#D5CAC0] transition-all flex flex-col justify-between min-h-[115px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EFE8DE] flex items-center justify-center text-[#695A4E] flex-shrink-0 shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-[#70665F] font-semibold">Shop Floor Jobs</div>
                  <div className="text-xl font-bold text-[#211B17] font-mono tracking-tight truncate">
                    {activeFloorCount} {activeFloorCount === 1 ? 'Job' : 'Equipment'}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#F2ECE4] text-[11px] text-[#70665F] flex items-center gap-1 font-medium">
                <span>⚙️ {inFabCount} in Fabrication</span>
              </div>
            </div>

            {/* Card 3: Critical Expedite */}
            <div className="bg-white border border-[#E7DED5] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(62,39,35,0.04)] hover:border-[#D5CAC0] transition-all flex flex-col justify-between min-h-[115px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FCE8E8] flex items-center justify-center text-[#D9383A] flex-shrink-0 shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-[#70665F] font-semibold">Critical Expedite</div>
                  <div className="text-xl font-bold text-[#D9383A] font-mono tracking-tight truncate">
                    {highPriorityJobs.length} High Priority
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#F2ECE4] text-[11px] text-[#D9383A] font-medium flex items-center gap-2">
                <span>⚠️ {highPriorityJobs.length} Priority</span>
                <span>🚨 {delayedJobs.length} Delayed</span>
              </div>
            </div>

            {/* Card 4: Quality & ISO Compliance */}
            <div className="bg-white border border-[#E7DED5] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(62,39,35,0.04)] hover:border-[#D5CAC0] transition-all flex flex-col justify-between min-h-[115px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E0F5EB] flex items-center justify-center text-[#169B62] flex-shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-[#70665F] font-semibold">Quality & ISO Compliance</div>
                  <div className="text-xl font-bold text-[#169B62] font-mono tracking-tight truncate">
                    {projectJobs.length > 0
                      ? `${Math.round(
                          projectJobs.reduce((acc, p) => acc + (p.progressPercent || 0), 0) /
                            projectJobs.length
                        )}%`
                      : '100%'}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#F2ECE4] text-[11px] text-[#70665F] flex items-center gap-1 font-medium">
                <span>✓ QA Inspection Passed</span>
              </div>
            </div>
          </div>

          {/* Jobs Table Section */}
          <div className="bg-white border border-[#E7DED5] rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E7DED5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#211B17]">
                  Production Stage Jobs (Live API Pipeline)
                </h3>
                <p className="text-xs text-[#70665F]">
                  Real-time synchronization across MTO equipment fabrication milestones
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8D827A]" />
                  <input
                    type="text"
                    placeholder="Search Job, Client, Equipment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#211B17] placeholder-[#8D827A] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                  />
                </div>

                <CustomSelect
                  value={stageFilter}
                  onChange={(val) => setStageFilter(val)}
                  buttonClassName="rounded-xl px-3 py-1.5 text-xs font-semibold"
                >
                  <option value="All">All Stages</option>
                  <option value="PLANNING">Planning</option>
                  <option value="FAB">Fabrication</option>
                  <option value="PROD">Production</option>
                  <option value="QUAL">Quality</option>
                </CustomSelect>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#70665F] font-bold border-b border-[#EBE3DB] uppercase tracking-wider text-[10.5px]">
                  <tr>
                    <th className="py-3 px-4">Job ID</th>
                    <th className="py-3 px-4">Customer & PO</th>
                    <th className="py-3 px-4">Equipment Specs</th>
                    <th className="py-3 px-4">Value</th>
                    <th className="py-3 px-4">Target Dispatch</th>
                    <th className="py-3 px-4">Progress</th>
                    <th className="py-3 px-4 text-right">Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2ECE4]">
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#70665F]">
                        No active jobs found matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-crm-brand-700">
                          {job.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#211B17]">{job.customer}</div>
                          <div className="text-[11px] text-[#70665F] font-mono">{job.poRef}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#211B17]">
                          {job.equipment}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#211B17]">
                          {job.value}
                        </td>
                        <td className="py-3.5 px-4 text-[#544B45] font-medium">
                          {job.dispatch}
                        </td>
                        <td className="py-3.5 px-4 min-w-[140px]">
                          <div className="flex items-center justify-between text-[10px] font-mono text-[#70665F] mb-1">
                            <span>Progress</span>
                            <span className="font-bold text-[#211B17]">{job.progress}%</span>
                          </div>
                          <div className="w-full bg-[#EAE2D8] rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#0E91B2] to-[#169B62] h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={cn(
                              'px-3 py-1 rounded-full text-[10px] font-bold tracking-wider inline-block border',
                              job.stageBadge
                            )}
                          >
                            {job.stage}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
