'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useERP } from '../context/ERPContext';
import { api } from '../lib/apiClient';
import {
  FileText,
  FileCheck,
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
  ArrowUpRight,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Flame,
  Eye,
  HardHat,
  Gauge,
  CheckCheck,
  CircleDot,
  Wrench,
  PackageCheck,
  ChevronDown,
  ExternalLink,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { cn } from '../lib/utils';
import { CustomSelect } from '../components/ui/CustomSelect';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const {
    currentUser,
    projectJobs = [],
    salesOrders = [],
    manufacturingJobs = [],
    attendanceRecords = [],
    leaveBalances = [],
    leaveRequests = [],
    projectTasks = [],
    updateProjectTask,
    checkInAttendance,
    checkOutAttendance,
    jobs = [],
    openJobModal,
    customerPOs = [],
    quotations = [],
    workOrders = [],
    qcInspections = [],
    workCenters = [],
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
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'fy'>('month');

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
  const openCustomerPOs = useMemo(() => {
    return (customerPOs || []).filter((po) => {
      const st = String(po.status || '').toLowerCase();
      return st !== 'cancelled' && st !== 'completed';
    });
  }, [customerPOs]);

  const openCustomerPOValue = useMemo(() => {
    return openCustomerPOs.reduce((sum, po) => sum + (Number(po.poAmount) || 0), 0);
  }, [openCustomerPOs]);

  const openQuotations = useMemo(() => {
    return (quotations || []).filter((q) => {
      const st = String(q.latestSummary?.status || (q as any).status || '').toLowerCase();
      return st !== 'rejected' && st !== 'lost';
    });
  }, [quotations]);

  const openQuotationValue = useMemo(() => {
    return openQuotations.reduce((sum, q) => {
      const val = Number(
        q.latestSummary?.grandTotal ||
        (q.revisions && q.revisions[q.revisions.length - 1]?.grandTotal) ||
        (q as any).grand_total ||
        (q as any).totalAmount ||
        0
      );
      return sum + val;
    }, 0);
  }, [openQuotations]);

  const openOrdersCount = openCustomerPOs.length + openQuotations.length;

  const activeBacklog = useMemo(() => {
    const sum = openCustomerPOValue + openQuotationValue;
    if (sum > 0) return sum;
    const soSum = salesOrders.reduce((acc, so) => acc + (Number(so.orderValue) || 0), 0);
    if (soSum > 0) return soSum;
    return projectJobs.reduce((acc, pj) => acc + (Number(pj.orderValue) || 0), 0);
  }, [openCustomerPOValue, openQuotationValue, salesOrders, projectJobs]);

  const activeFloorCount =
    manufacturingJobs.length > 0
      ? manufacturingJobs.length
      : (workOrders.length > 0 ? workOrders.length : projectJobs.length);

  const inFabCount = projectJobs.filter((p) => {
    const stg = ((p.currentStage || (p as any).stage || p.status || '') as string)?.toLowerCase();
    return stg.includes('fab') || stg.includes('prod') || stg.includes('weld');
  }).length;

  const inPlanningCount = projectJobs.filter((p) => {
    const stg = ((p.currentStage || (p as any).stage || p.status || '') as string)?.toLowerCase();
    return stg.includes('plan') || stg.includes('design') || stg.includes('bom');
  }).length;

  const inQcCount = projectJobs.filter((p) => {
    const stg = ((p.currentStage || (p as any).stage || p.status || '') as string)?.toLowerCase();
    return stg.includes('qual') || stg.includes('qc') || stg.includes('test') || stg.includes('inspect');
  }).length;

  const readyDispatchCount = projectJobs.filter((p) => {
    const stg = ((p.currentStage || (p as any).stage || p.status || '') as string)?.toLowerCase();
    return stg.includes('store') || stg.includes('dispatch') || stg.includes('ready') || stg.includes('deliv');
  }).length;

  const highPriorityJobs = projectJobs.filter(
    (p) => p.priority === 'urgent' || p.priority === 'high'
  );
  const delayedJobs = projectJobs.filter((p) => (p.status as string) === 'delayed');

  // Real QC metrics computed from live database records
  const qualityMetrics = useMemo(() => {
    if (!qcInspections || qcInspections.length === 0) return null;
    const passed = qcInspections.filter((qc) => {
      const st = String(qc.qcResult || '').toLowerCase();
      return st === 'pass' || st === 'passed' || st === 'approved' || st === 'accepted';
    }).length;
    const rate = Math.round((passed / qcInspections.length) * 100);
    return { rate, passed, total: qcInspections.length };
  }, [qcInspections]);

  // Production Health based on live delayed jobs and floor state
  const productionHealth = useMemo(() => {
    if (activeFloorCount === 0 && projectJobs.length === 0) return '—';
    if (delayedJobs.length > 0) return `${delayedJobs.length} Delayed`;
    return 'Optimal';
  }, [activeFloorCount, projectJobs.length, delayedJobs.length]);

  // SLA On-time Compliance
  const slaComplianceRate = useMemo(() => {
    if (projectJobs.length === 0) return null;
    const onTime = projectJobs.length - delayedJobs.length;
    return Math.round((onTime / projectJobs.length) * 100);
  }, [projectJobs.length, delayedJobs.length]);

  // Bay Capacity utilization
  const bayCapacityPercent = useMemo(() => {
    if (workCenters.length > 0 && activeFloorCount > 0) {
      return Math.min(100, Math.round((activeFloorCount / workCenters.length) * 100));
    }
    if (activeFloorCount > 0) return Math.min(100, activeFloorCount * 25);
    return null;
  }, [workCenters.length, activeFloorCount]);

  // Dynamic Jobs mapped directly from API
  const jobsData = useMemo(() => {
    return projectJobs.map((job) => {
      const rawStage = (
        (job.currentStage || (job as any).stage || job.status || 'PLANNING') as string
      )?.toUpperCase();

      let stageBadge = 'bg-amber-50 text-amber-700 border-amber-200/80';
      let stageDot = 'bg-amber-500';
      if (rawStage.includes('PROD') || rawStage.includes('FAB') || rawStage.includes('WELD')) {
        stageBadge = 'bg-sky-50 text-sky-700 border-sky-200/80';
        stageDot = 'bg-sky-500';
      } else if (
        rawStage.includes('QUAL') ||
        rawStage.includes('QC') ||
        rawStage.includes('INSPECT')
      ) {
        stageBadge = 'bg-purple-50 text-purple-700 border-purple-200/80';
        stageDot = 'bg-purple-500';
      } else if (rawStage.includes('STORE') || rawStage.includes('PURCHASE') || rawStage.includes('DISPATCH')) {
        stageBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
        stageDot = 'bg-emerald-500';
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
        numericValue: Number(job.orderValue) || 0,
        value: `₹ ${(Number(job.orderValue) || 0)?.toLocaleString('en-IN')}`,
        dispatch: job.deliveryDate || (job as any).targetDeliveryDate || 'TBD',
        progress: Number(job.progressPercent) || 0,
        stage: rawStage,
        stageBadge,
        stageDot,
        originalJob: job,
      };
    });
  }, [projectJobs]);

  const filteredJobs = useMemo(() => {
    return jobsData.filter((job) => {
      const matchesStage =
        stageFilter === 'All' ||
        job.stage.includes(stageFilter.toUpperCase()) ||
        (stageFilter === 'FAB' && (job.stage.includes('FAB') || job.stage.includes('PROD') || job.stage.includes('WELD'))) ||
        (stageFilter === 'QUAL' && (job.stage.includes('QUAL') || job.stage.includes('QC') || job.stage.includes('INSPECT')));
      const matchesSearch =
        !searchQuery?.trim() ||
        job.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.equipment?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStage && matchesSearch;
    });
  }, [jobsData, stageFilter, searchQuery]);

  // Stage Filter Counts
  const stageCounts = useMemo(() => {
    return {
      all: jobsData.length,
      planning: jobsData.filter((j) => j.stage.includes('PLAN')).length,
      fab: jobsData.filter((j) => j.stage.includes('FAB') || j.stage.includes('PROD') || j.stage.includes('WELD')).length,
      qual: jobsData.filter((j) => j.stage.includes('QUAL') || j.stage.includes('QC') || j.stage.includes('INSPECT')).length,
      ready: jobsData.filter((j) => j.stage.includes('STORE') || j.stage.includes('DISPATCH') || j.stage.includes('READY')).length,
    };
  }, [jobsData]);

  // Monthly order inflow vs completed orders — computed from real Sales Orders (last 6 months)
  const monthlyPipelineData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, month: d.toLocaleString('en-IN', { month: 'short', year: '2-digit' }), orders: 0, delivered: 0 };
    });
    const bucket = (dateStr?: string) => months.find((m) => (dateStr || '').slice(0, 7) === m.key);
    (salesOrders || []).forEach((so: any) => {
      if (so.status === 'cancelled' || so.status === 'draft') return;
      const value = Number(so.orderValue ?? so.grandTotal ?? 0) || 0;
      const inflow = bucket(so.orderDate);
      if (inflow) inflow.orders += value;
      if (so.status === 'completed') {
        const done = bucket(so.deliveryDate || so.orderDate);
        if (done) done.delivered += value;
      }
    });
    return months;
  }, [salesOrders]);

  // Stage Distribution Donut Data (real counts only)
  const stageDistributionData = useMemo(() => {
    const rows = [
      { name: 'Planning & BOM', value: inPlanningCount || 0, color: '#2A4FD6' },
      { name: 'Fabrication & Welding', value: inFabCount || 0, color: '#0E9AC0' },
      { name: 'QC & Testing', value: inQcCount || 0, color: '#D68A22' },
      { name: 'Ready for Dispatch', value: readyDispatchCount || 0, color: '#169B62' },
    ];
    const total = rows.reduce((sum, r) => sum + r.value, 0);
    return rows.map((r) => ({ ...r, pct: total > 0 ? Math.round((r.value / total) * 100) : 0 }));
  }, [inPlanningCount, inFabCount, inQcCount, readyDispatchCount]);
  const stageTotal = stageDistributionData.reduce((sum, r) => sum + r.value, 0);
  const flowTotals = monthlyPipelineData.reduce((t, m) => ({ orders: t.orders + m.orders, delivered: t.delivered + m.delivered }), { orders: 0, delivered: 0 });
  const hasFlowData = flowTotals.orders > 0 || flowTotals.delivered > 0;
  const fmtInrCompact = (n: number) => {
    if (!n) return '₹0';
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2).replace(/\.?0+$/, '') + ' Cr';
    if (n >= 100000) return '₹' + (n / 100000).toFixed(2).replace(/\.?0+$/, '') + ' L';
    if (n >= 1000) return '₹' + (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return '₹' + Math.round(n);
  };

  if (!mounted) {
    return null;
  }

  // Greeting based on hour
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  // Handle opening 360 Job Traceability
  const handleOpenTraceability = (job: any) => {
    if (openJobModal) {
      const match =
        jobs.find((j) => j.jobNumber === job.id || (j as any).id === job.id) ||
        job.originalJob || {
          jobNumber: job.id,
          productName: job.equipment,
          customerName: job.customer,
          currentStatus: job.stage,
        };
      openJobModal(match);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-300 pb-10">
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE COMMAND HEADER & CONTEXT BAR                                */}
      {/* ========================================================================= */}
      <div className="bg-white/95 backdrop-blur-md border border-[color:var(--crm-border-default)] rounded-2xl px-4 py-3 sm:px-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute opacity-75" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 relative" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-[color:var(--crm-text-primary)] tracking-tight">
                UMA TECHNO FAB
              </span>
            </div>
            <p className="text-[11px] text-[color:var(--crm-text-secondary)] hidden sm:block">
              Logged in as <strong className="text-[color:var(--crm-text-primary)]">{currentUser?.name || currentUser?.username}</strong> • {currentUser?.designation || currentUser?.roleName || 'Executive Admin'}
            </p>
          </div>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between md:justify-end">
          {/* View Switcher Pill */}
          {isSuperAdminOrAdmin && (
            <div className="flex items-center bg-[#F7F2EC] p-1 rounded-xl border border-[color:var(--crm-border-default)]">
              <button
                onClick={() => setViewMode('executive')}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                  viewMode === 'executive'
                    ? 'bg-[color:var(--crm-brand-700)] text-white shadow-xs'
                    : 'text-[#4B5876] hover:text-[color:var(--crm-text-primary)]'
                )}
              >
                <Factory className="w-3.5 h-3.5" />
                <span>Executive Command</span>
              </button>
              <button
                onClick={() => setViewMode('employee')}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                  viewMode === 'employee'
                    ? 'bg-[color:var(--crm-brand-700)] text-white shadow-xs'
                    : 'text-[#4B5876] hover:text-[color:var(--crm-text-primary)]'
                )}
              >
                <User className="w-3.5 h-3.5" />
                <span>My Workspace</span>
              </button>
            </div>
          )}

          {/* Quick Create Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/crm/leads"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-strong)] text-[color:var(--crm-text-primary)] text-xs font-bold transition shadow-2xs flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-crm-brand-600" />
              <span className="hidden sm:inline">New</span> Lead
            </Link>
            <Link
              href="/projects/planning"
              className="px-3 py-1.5 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Job Order</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXECUTIVE MANUFACTURING VIEW                                           */}
      {/* ========================================================================= */}
      {viewMode === 'executive' ? (
        <div className="space-y-4 md:space-y-6">
          {/* A. WELCOME + QUICK ACTIONS (live data only) */}
          <div className="rounded-2xl bg-white border border-[color:var(--crm-border-default)] p-5 sm:p-6 shadow-xs text-[color:var(--crm-text-primary)]">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[color:var(--crm-text-primary)]">
                  Welcome back, {(currentUser?.name || currentUser?.username || 'there').split(' ')[0]}
                </h1>
                <p className="text-sm text-[color:var(--crm-text-secondary)]">Here is what is happening across your factory today.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 text-sm">
                <div>
                  <span className="text-xs text-[color:var(--crm-text-secondary)] block">Open order value</span>
                  <strong className="text-base font-semibold text-[color:var(--crm-text-primary)]" suppressHydrationWarning>
                    {activeBacklog > 0 ? `₹ ${activeBacklog.toLocaleString('en-IN')}` : '—'}
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-[color:var(--crm-text-secondary)] block">Jobs on shop floor</span>
                  <strong className="text-base font-semibold text-[color:var(--crm-text-primary)]">{activeFloorCount > 0 ? activeFloorCount : '—'}</strong>
                </div>
                <div>
                  <span className="text-xs text-[color:var(--crm-text-secondary)] block">QC pass rate</span>
                  <strong className="text-base font-semibold text-emerald-700">{qualityMetrics ? `${qualityMetrics.rate}%` : '—'}</strong>
                </div>
                <div>
                  <span className="text-xs text-[color:var(--crm-text-secondary)] block">Production status</span>
                  <strong
                    className={cn(
                      'text-base font-semibold',
                      productionHealth === 'Optimal' ? 'text-emerald-700' : productionHealth.includes('Delayed') ? 'text-amber-700' : 'text-[color:var(--crm-text-secondary)]'
                    )}
                  >
                    {productionHealth === 'Optimal' || productionHealth.includes('Delayed') ? productionHealth : '—'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-[color:var(--crm-border-default)]">
              <span className="text-xs font-semibold text-[color:var(--crm-text-secondary)] block mb-2.5">Quick actions</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { href: '/crm/leads', label: 'New Lead' },
                  { href: '/crm/quotations', label: 'Quotations' },
                  { href: '/crm/customer-po', label: 'Customer POs' },
                  { href: '/projects/planning', label: 'Project Planning' },
                  { href: '/purchase/requests', label: 'Purchase Requests' },
                  { href: '/store/material-issue', label: 'Material Issue' },
                  { href: '/production/work-orders', label: 'Work Orders' },
                  { href: '/integration/job-360', label: 'Job 360°' },
                ].map((a) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    prefetch={false}
                    className="px-3.5 py-2 rounded-lg bg-[color:var(--crm-bg-app)] hover:bg-[#E0E5EF] border border-[color:var(--crm-border-default)] text-[color:var(--crm-text-primary)] text-sm font-medium transition"
                  >
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* B. HIGH-IMPACT METRIC KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Active Order Backlog */}
            <div className="group relative overflow-hidden bg-white border border-[color:var(--crm-border-default)] hover:border-amber-400/60 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[color:var(--crm-text-secondary)] uppercase tracking-wider block">
                    Active Order Backlog
                  </span>
                  <div className="text-2xl font-black text-[color:var(--crm-text-primary)] font-mono tracking-tight" suppressHydrationWarning>
                    {activeBacklog > 0 ? `₹ ${activeBacklog.toLocaleString('en-IN')}` : '₹ —'}
                  </div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-crm-brand-50 text-crm-brand-700 border border-crm-brand-100 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[color:var(--crm-surface-subtle)] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>{openOrdersCount > 0 ? `${openOrdersCount} Active Orders` : '—'}</span>
                  </span>
                  <span className="text-[color:var(--crm-text-secondary)] font-semibold text-[11px]">
                    {salesOrders.length > 0 ? `${salesOrders.length} Sales Orders` : '—'}
                  </span>
                </div>
                {/* Pipeline Attainment Meter */}
                <div className="w-full bg-[#D8DDEA] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-crm-brand-500 to-crm-brand-700 h-1.5 rounded-full" style={{ width: activeBacklog > 0 ? '100%' : '0%' }} />
                </div>
                <div className="text-[10px] text-[color:var(--crm-text-tertiary)] flex items-center justify-between font-mono">
                  <span>Open Pipeline</span>
                  <span>{openOrdersCount > 0 ? `${openQuotations.length} Quotes • ${openCustomerPOs.length} POs` : '—'}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Shop Floor Equipment & WIP */}
            <div className="group relative overflow-hidden bg-white border border-[color:var(--crm-border-default)] hover:border-sky-400/60 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[color:var(--crm-text-secondary)] uppercase tracking-wider block">
                    Shop Floor WIP
                  </span>
                  <div className="text-2xl font-black text-[color:var(--crm-text-primary)] font-mono tracking-tight">
                    {activeFloorCount > 0 ? `${activeFloorCount} ${activeFloorCount === 1 ? 'Job' : 'Equipment'}` : '—'}
                  </div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-crm-brand-50 text-crm-brand-700 border border-crm-brand-100 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Factory className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[color:var(--crm-surface-subtle)] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sky-700 font-bold flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" />
                    <span>{inFabCount > 0 ? `${inFabCount} in Fabrication` : '—'}</span>
                  </span>
                  <span className="text-[color:var(--crm-text-secondary)] font-semibold text-[11px]">
                    {inPlanningCount > 0 ? `${inPlanningCount} in Engineering` : '—'}
                  </span>
                </div>
                <div className="w-full bg-[#D8DDEA] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-500 to-blue-600 h-1.5 rounded-full" style={{ width: `${bayCapacityPercent ?? 0}%` }} />
                </div>
                <div className="text-[10px] text-[color:var(--crm-text-tertiary)] flex items-center justify-between font-mono">
                  <span>Bay Capacity Utilization</span>
                  <span>{bayCapacityPercent !== null ? `${bayCapacityPercent}% Capacity` : 'Available'}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Priority Expedites & Delivery Watchlist */}
            <div className="group relative overflow-hidden bg-white border border-[color:var(--crm-border-default)] hover:border-rose-400/60 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[color:var(--crm-text-secondary)] uppercase tracking-wider block">
                    Expedite Watchlist
                  </span>
                  <div className="text-2xl font-black text-[#D9383A] font-mono tracking-tight">
                    {highPriorityJobs.length > 0 ? `${highPriorityJobs.length} Urgent Jobs` : '—'}
                  </div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-crm-brand-50 text-crm-brand-700 border border-crm-brand-100 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[color:var(--crm-surface-subtle)] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-rose-700 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>{highPriorityJobs.length > 0 ? `${highPriorityJobs.length} Priority` : '—'}</span>
                  </span>
                  <span className="text-amber-700 font-semibold text-[11px] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-crm-brand-600" />
                    <span>{delayedJobs.length > 0 ? `${delayedJobs.length} Delayed` : '0 Delayed'}</span>
                  </span>
                </div>
                <div className="w-full bg-[#D8DDEA] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1.5 rounded-full" style={{ width: `${slaComplianceRate ?? 0}%` }} />
                </div>
                <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-between font-mono">
                  <span>On-Time SLA Track</span>
                  <span>{slaComplianceRate !== null ? `${slaComplianceRate}% Compliance` : '—'}</span>
                </div>
              </div>
            </div>

            {/* Card 4: Quality & ISO 9001 Compliance */}
            <div className="group relative overflow-hidden bg-white border border-[color:var(--crm-border-default)] hover:border-emerald-400/60 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[color:var(--crm-text-secondary)] uppercase tracking-wider block">
                    Quality & Compliance
                  </span>
                  <div className="text-2xl font-black text-[#169B62] font-mono tracking-tight">
                    {qualityMetrics ? `${qualityMetrics.rate}% Pass` : '—'}
                  </div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-crm-brand-50 text-crm-brand-700 border border-crm-brand-100 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[color:var(--crm-surface-subtle)] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{qualityMetrics ? `${qualityMetrics.passed} Passed` : '—'}</span>
                  </span>
                  <span className="text-[color:var(--crm-text-secondary)] font-semibold text-[11px]">
                    {qualityMetrics ? `${qualityMetrics.total - qualityMetrics.passed} Holds` : 'No QC records'}
                  </span>
                </div>
                <div className="w-full bg-[#D8DDEA] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-1.5 rounded-full" style={{ width: `${qualityMetrics ? qualityMetrics.rate : 0}%` }} />
                </div>
                <div className="text-[10px] text-[color:var(--crm-text-tertiary)] flex items-center justify-between font-mono">
                  <span>ASME Sec VIII / ISO</span>
                  <span>{qualityMetrics ? 'Inspected Standard' : '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* C. ANALYTICS: order flow + shop-floor stage mix (live data) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
            {/* Chart 1: Order inflow vs completed orders */}
            <div className="lg:col-span-2 bg-white border border-[color:var(--crm-border-default)] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[color:var(--crm-text-primary)]">Orders: booked vs completed</h3>
                  <p className="text-sm text-[color:var(--crm-text-secondary)] mt-0.5">Last 6 months, by order value</p>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[color:var(--crm-text-secondary)]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2A4FD6]" /> Booked
                    </div>
                    <div className="text-lg font-bold text-[color:var(--crm-text-primary)] mt-0.5">{fmtInrCompact(flowTotals.orders)}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[color:var(--crm-text-secondary)]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#169B62]" /> Completed
                    </div>
                    <div className="text-lg font-bold text-[color:var(--crm-text-primary)] mt-0.5">{fmtInrCompact(flowTotals.delivered)}</div>
                  </div>
                </div>
              </div>

              {!hasFlowData ? (
                <div className="flex-1 min-h-[18rem] mt-4 rounded-xl border border-dashed border-[color:var(--crm-border-strong)] bg-[color:var(--crm-bg-app)] flex flex-col items-center justify-center text-center px-6">
                  <div className="w-14 h-14 rounded-2xl bg-crm-brand-50 flex items-center justify-center mb-3">
                    <BarChart3 className="w-7 h-7 text-crm-brand-600" />
                  </div>
                  <p className="text-base font-semibold text-[color:var(--crm-text-primary)]">No orders in the last 6 months</p>
                  <p className="text-sm text-[color:var(--crm-text-secondary)] mt-1 max-w-sm">
                    Once sales orders are confirmed, monthly booked and completed values will be charted here.
                  </p>
                  <Link
                    href="/crm/customer-po"
                    className="mt-4 px-4 py-2 rounded-lg bg-crm-brand-700 hover:bg-crm-brand-800 text-white text-sm font-semibold transition"
                  >
                    Go to Customer POs
                  </Link>
                </div>
              ) : (
              <div className="relative flex-1 min-h-[18rem] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyPipelineData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradBooked" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2A4FD6" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#2A4FD6" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="gradDone" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#169B62" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#169B62" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#E2E7EF" strokeDasharray="4 4" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#7A8699', fontSize: 12 }} dy={8} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={56}
                      tick={{ fill: '#7A8699', fontSize: 12 }}
                      tickFormatter={(v) => fmtInrCompact(Number(v))}
                      domain={hasFlowData ? [0, 'auto'] : [0, 100]}
                      tickCount={5}
                    />
                    <Tooltip
                      cursor={{ stroke: '#CBD3E0', strokeWidth: 1 }}
                      content={({ active, payload, label }: any) =>
                        active && payload?.length ? (
                          <div className="rounded-xl border border-[color:var(--crm-border-default)] bg-white px-3.5 py-2.5 shadow-lg text-sm">
                            <div className="font-semibold text-[color:var(--crm-text-primary)] mb-1.5">{label}</div>
                            {payload.map((p: any) => (
                              <div key={p.dataKey} className="flex items-center justify-between gap-6">
                                <span className="flex items-center gap-1.5 text-[color:var(--crm-text-secondary)]">
                                  <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                                  {p.dataKey === 'orders' ? 'Booked' : 'Completed'}
                                </span>
                                <span className="font-semibold text-[color:var(--crm-text-primary)]">{fmtInrCompact(Number(p.value))}</span>
                              </div>
                            ))}
                          </div>
                        ) : null
                      }
                    />
                    <Area type="monotone" dataKey="orders" stroke="#2A4FD6" strokeWidth={2.5} fill="url(#gradBooked)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
                    <Area type="monotone" dataKey="delivered" stroke="#169B62" strokeWidth={2.5} fill="url(#gradDone)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
                  </AreaChart>
                </ResponsiveContainer>

              </div>
              )}
            </div>

            {/* Chart 2: Shop-floor stage distribution */}
            <div className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[color:var(--crm-text-primary)]">Jobs by stage</h3>
                  <p className="text-sm text-[color:var(--crm-text-secondary)] mt-0.5">Active equipment on the shop floor</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[color:var(--crm-surface-subtle)] text-xs font-semibold text-[color:var(--crm-text-secondary)] whitespace-nowrap">
                  {stageTotal} active
                </span>
              </div>

              <div className="relative h-52 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stageTotal > 0 ? stageDistributionData : [{ name: 'No active jobs', value: 1, color: '#E2E7EF', pct: 0 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={66}
                      outerRadius={90}
                      paddingAngle={stageTotal > 0 ? 3 : 0}
                      cornerRadius={stageTotal > 0 ? 6 : 0}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={stageTotal > 0}
                    >
                      {(stageTotal > 0 ? stageDistributionData : [{ name: 'No active jobs', value: 1, color: '#E2E7EF', pct: 0 }]).map((entry, index) => (
                        <Cell key={`donut-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    {stageTotal > 0 && (
                      <Tooltip
                        content={({ active, payload }: any) =>
                          active && payload?.length ? (
                            <div className="rounded-xl border border-[color:var(--crm-border-default)] bg-white px-3 py-2 shadow-lg text-sm">
                              <span className="font-semibold text-[color:var(--crm-text-primary)]">{payload[0].name}</span>
                              <span className="text-[color:var(--crm-text-secondary)]"> · {payload[0].value} job(s)</span>
                            </div>
                          ) : null
                        }
                      />
                    )}
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-[color:var(--crm-text-primary)] leading-none">{stageTotal}</span>
                  <span className="text-xs font-medium text-[color:var(--crm-text-secondary)] mt-1">
                    {stageTotal === 0 ? 'No active jobs' : stageTotal === 1 ? 'Active job' : 'Active jobs'}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {stageDistributionData.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-[color:var(--crm-text-primary)] font-medium min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="truncate">{item.name}</span>
                      </span>
                      <span className="font-semibold text-[color:var(--crm-text-primary)] ml-2 flex-shrink-0">
                        {item.value}
                        <span className="text-[color:var(--crm-text-tertiary)] font-normal"> · {item.pct}%</span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[color:var(--crm-surface-subtle)] mt-1.5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* D. DEPARTMENT OPERATIONAL TICKER STRIP */}
          <div className="bg-gradient-to-r from-[color:var(--crm-brand-50)] via-[#EDF1FA] to-[#E3EAF8] border border-[#D4DAE8] rounded-2xl p-4 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-crm-brand-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--crm-text-primary)]">
                  Department Velocity Pipeline:
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 flex-1 md:max-w-4xl text-xs">
                <Link href="/crm/enquiries" className="bg-white/80 hover:bg-white p-2 rounded-xl border border-[color:var(--crm-border-default)] transition flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[color:var(--crm-text-secondary)] block">1. Commercial</span>
                    <strong className="text-[11px] text-[color:var(--crm-text-primary)]">Active Leads</strong>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[color:var(--crm-text-tertiary)]" />
                </Link>
                <Link href="/designer/bom" className="bg-white/80 hover:bg-white p-2 rounded-xl border border-[color:var(--crm-border-default)] transition flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[color:var(--crm-text-secondary)] block">2. Engineering</span>
                    <strong className="text-[11px] text-[color:var(--crm-text-primary)]">CAD & BOMs</strong>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[color:var(--crm-text-tertiary)]" />
                </Link>
                <Link href="/store/stock" prefetch={false} className="bg-white/80 hover:bg-white p-2 rounded-xl border border-[color:var(--crm-border-default)] transition flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[color:var(--crm-text-secondary)] block">3. Materials</span>
                    <strong className="text-[11px] text-[color:var(--crm-text-primary)]">Stock Matrix</strong>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[color:var(--crm-text-tertiary)]" />
                </Link>
                <Link href="/production/planning" className="bg-white/80 hover:bg-white p-2 rounded-xl border border-[color:var(--crm-border-default)] transition flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[color:var(--crm-text-secondary)] block">4. Fabrication</span>
                    <strong className="text-[11px] text-[color:var(--crm-text-primary)]">Shop Bays</strong>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[color:var(--crm-text-tertiary)]" />
                </Link>
                <Link href="/dispatch/gate-pass" prefetch={false} className="bg-white/80 hover:bg-white p-2 rounded-xl border border-[color:var(--crm-border-default)] transition flex items-center justify-between col-span-2 sm:col-span-1">
                  <div>
                    <span className="text-[10px] text-[color:var(--crm-text-secondary)] block">5. Logistics</span>
                    <strong className="text-[11px] text-[color:var(--crm-text-primary)]">Gate Passes</strong>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[color:var(--crm-text-tertiary)]" />
                </Link>
              </div>
            </div>
          </div>

          {/* E. REDESIGNED PRODUCTION STAGE JOBS TABLE */}
          <div className="bg-white border border-[color:var(--crm-border-default)] rounded-3xl shadow-xs overflow-hidden">
            {/* Table Control Header */}
            <div className="p-5 sm:p-6 border-b border-[color:var(--crm-border-default)] space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-base sm:text-lg font-black text-[color:var(--crm-text-primary)] tracking-tight">
                      Production Stage Jobs (Live API Pipeline)
                    </h3>
                  </div>
                  <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">
                    Real-time synchronization across MTO equipment fabrication milestones
                  </p>
                </div>

                {/* Search & Actions */}
                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--crm-text-tertiary)]" />
                    <input
                      type="text"
                      placeholder="Search Job ID, Customer, Equipment..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl pl-9 pr-3 py-2 text-xs text-[color:var(--crm-text-primary)] placeholder-[color:var(--crm-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-crm-brand-700/20 focus:border-crm-brand-700 transition"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[color:var(--crm-text-tertiary)] hover:text-[color:var(--crm-text-primary)] transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <Link
                    href="/integration/traceability"
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-strong)] text-[color:var(--crm-text-primary)] text-xs font-bold transition shadow-2xs flex items-center gap-1.5 flex-shrink-0"
                  >
                    <Layers className="w-3.5 h-3.5 text-crm-brand-700" />
                    <span>360° Matrix</span>
                  </Link>
                </div>
              </div>

              {/* Interactive Stage Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
                {[
                  { id: 'All', label: 'All Stages', count: stageCounts.all },
                  { id: 'PLANNING', label: 'Planning & Engineering', count: stageCounts.planning },
                  { id: 'FAB', label: 'Fabrication & Welding', count: stageCounts.fab },
                  { id: 'QUAL', label: 'Quality & Testing', count: stageCounts.qual },
                  { id: 'READY', label: 'Ready for Dispatch', count: stageCounts.ready },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStageFilter(tab.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border',
                      stageFilter === tab.id
                        ? 'bg-[color:var(--crm-brand-700)] text-white border-[color:var(--crm-brand-700)] shadow-xs'
                        : 'bg-[color:var(--crm-bg-app)] text-[#4B5876] border-[color:var(--crm-border-default)] hover:bg-[color:var(--crm-surface-subtle)] hover:text-[color:var(--crm-text-primary)]'
                    )}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        'px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold',
                        stageFilter === tab.id ? 'bg-white/20 text-white' : 'bg-white text-[color:var(--crm-text-secondary)] border border-[#CDD2DF]'
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto w-full">
              <table className="min-w-full w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-secondary)] font-bold border-b border-[color:var(--crm-border-default)] uppercase tracking-wider text-[10px] font-mono whitespace-nowrap">
                  <tr>
                    <th className="py-3 px-4 whitespace-nowrap">Job ID</th>
                    <th className="py-3 px-4 whitespace-nowrap">Customer & PO Reference</th>
                    <th className="py-3 px-4 whitespace-nowrap">Equipment Specs</th>
                    <th className="py-3 px-4 whitespace-nowrap">Commercial Value</th>
                    <th className="py-3 px-4 whitespace-nowrap">Target Dispatch</th>
                    <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">Milestone Progress</th>
                    <th className="py-3 px-4 whitespace-nowrap">Stage</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--crm-surface-subtle)] whitespace-nowrap">
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[color:var(--crm-text-secondary)]">
                        <div className="w-12 h-12 rounded-2xl bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] flex items-center justify-center mx-auto mb-3 text-[color:var(--crm-text-tertiary)]">
                          <Box className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-sm text-[color:var(--crm-text-primary)]">No active jobs found</div>
                        <p className="text-xs text-[color:var(--crm-text-tertiary)] mt-1">
                          No fabrication jobs match the stage filter &quot;{stageFilter}&quot; or search query.
                        </p>
                        <button
                          onClick={() => {
                            setStageFilter('All');
                            setSearchQuery('');
                          }}
                          className="mt-3 px-3 py-1.5 bg-[color:var(--crm-bg-app)] hover:bg-white border border-[color:var(--crm-border-strong)] rounded-lg text-xs font-bold text-[color:var(--crm-text-primary)] transition"
                        >
                          Clear Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map((job) => (
                      <tr
                        key={job.id}
                        className="hover:bg-[#F4F6FA]/80 transition-colors group"
                      >
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenTraceability(job)}
                            className="font-mono font-bold text-crm-brand-700 hover:text-crm-brand-800 hover:underline flex items-center gap-1.5 text-left cursor-pointer whitespace-nowrap"
                          >
                            <span>{job.id}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                          <span className="text-[10px] text-[color:var(--crm-text-tertiary)] font-mono block whitespace-nowrap">MTO Machine</span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-[color:var(--crm-text-primary)] whitespace-nowrap">{job.customer}</div>
                          <div className="text-[10px] text-[color:var(--crm-text-secondary)] font-mono mt-0.5 inline-block px-1.5 py-0.5 rounded bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] whitespace-nowrap">
                            {job.poRef}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-medium text-[color:var(--crm-text-primary)] flex items-center gap-1.5 whitespace-nowrap">
                            <Box className="w-3.5 h-3.5 text-crm-brand-600 flex-shrink-0" />
                            <span>{job.equipment}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[color:var(--crm-text-primary)] text-xs whitespace-nowrap">
                          {job.value}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-[color:var(--crm-text-secondary)] font-medium text-xs whitespace-nowrap">
                            <Calendar className="w-3.5 h-3.5 text-[color:var(--crm-text-tertiary)]" />
                            <span>{job.dispatch}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">
                          <div className="flex items-center justify-between text-[10px] font-mono text-[color:var(--crm-text-secondary)] mb-1 whitespace-nowrap">
                            <span>Stage Completed</span>
                            <span className="font-bold text-[color:var(--crm-text-primary)]">{job.progress}%</span>
                          </div>
                          <div className="w-full bg-[#D8DDEA] rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-crm-brand-500 via-sky-500 to-emerald-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={cn(
                              'px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider inline-flex items-center gap-1.5 border shadow-2xs whitespace-nowrap shrink-0',
                              job.stageBadge
                            )}
                          >
                            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', job.stageDot)} />
                            <span>{job.stage}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenTraceability(job)}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-crm-brand-50 border border-[#CDD2DF] text-crm-brand-700 hover:text-crm-brand-800 text-[11px] font-bold transition shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>360° Trace</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Summary Stats */}
            <div className="p-4 bg-[color:var(--crm-bg-app)] border-t border-[color:var(--crm-border-default)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[color:var(--crm-text-secondary)]">
              <div className="flex items-center gap-2">
                <span>Showing <strong>{filteredJobs.length}</strong> of <strong>{jobsData.length}</strong> active jobs in pipeline</span>
              </div>
              <div className="flex items-center gap-4 font-mono text-[11px]">
                <span>Total Filtered Value: <strong className="text-[color:var(--crm-text-primary)]">₹ {filteredJobs.reduce((sum, j) => sum + j.numericValue, 0).toLocaleString('en-IN')}</strong></span>
                <Link
                  href="/projects/planning"
                  className="text-crm-brand-700 hover:underline font-bold inline-flex items-center gap-1"
                >
                  Full Gantt Planning <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 3. REDESIGNED PERSONAL WORKSPACE VIEW (Employee Self-Service)              */
        /* ========================================================================= */
        <div className="space-y-4 md:space-y-6">
          {/* Welcome Banner & Identity Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[color:var(--crm-brand-50)] via-[#EDF1FA] to-[#E3EAF8] border border-[#D4DAE8] p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold text-[color:var(--crm-brand-600)] tracking-widest uppercase font-mono">
                    {currentUser?.departmentName || currentUser?.department || 'Department Staff'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-100 text-crm-brand-800 text-[10px] font-bold border border-crm-brand-200">
                    {currentUser?.roleType === 'department_manager'
                      ? 'MANAGER ACCESS'
                      : currentUser?.roleType === 'super_admin'
                      ? 'SUPER ADMIN'
                      : 'EMPLOYEE'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[color:var(--crm-text-primary)] tracking-tight leading-snug">
                  {greeting}, {currentUser?.firstName || currentUser?.name || 'Team Member'}!
                </h1>
                <p className="text-xs text-[#4D5A78] leading-relaxed">
                  Designation: <span className="font-semibold text-[color:var(--crm-text-primary)]">{currentUser?.designation || currentUser?.roleName || 'Staff Member'}</span> • Location: <span className="font-semibold text-[color:var(--crm-text-primary)]">{currentUser?.workLocation || 'Main Plant & Works'}</span> • ID: <span className="font-mono font-bold text-crm-brand-700">{currentUser?.id || 'EMP-101'}</span>
                </p>
              </div>

              {/* Live Digital Clock Widget */}
              <div className="bg-white/90 backdrop-blur-md border border-[color:var(--crm-border-default)] rounded-2xl px-5 py-3.5 shadow-xs text-right min-w-[210px]">
                <div className="text-[11px] font-bold text-[color:var(--crm-text-tertiary)] uppercase tracking-wider">
                  {todayFormatted}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[color:var(--crm-text-primary)] font-mono tracking-tight mt-0.5">
                  {currentTime || '09:00:00 AM'}
                </div>
                <div className="text-[10px] font-semibold text-emerald-700 flex items-center justify-end gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  IST (UTC +5:30) • LIVE SYNC
                </div>
              </div>
            </div>
          </div>

          {/* Punch Feedback Banner */}
          {punchFeedback && (
            <div
              className={cn(
                'p-4 rounded-2xl border text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-1 shadow-xs',
                punchFeedback.isError
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              )}
            >
              <span>{punchFeedback.msg}</span>
              <button
                type="button"
                onClick={() => setPunchFeedback(null)}
                className="p-0.5 opacity-70 hover:opacity-100 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Interactive Attendance & Leave Center */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Widget 1: Live Web Punch */}
            <div className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[color:var(--crm-surface-subtle)]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-crm-brand-50 text-crm-brand-700 border border-crm-brand-200/60 flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[color:var(--crm-text-primary)]">Daily Web Punch</h3>
                      <p className="text-[10px] text-[color:var(--crm-text-tertiary)]">Shift: 09:00 AM - 06:00 PM</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-full text-[10px] font-bold border',
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
                  <div className="bg-[color:var(--crm-bg-app)] p-3 rounded-xl border border-[color:var(--crm-border-default)]">
                    <span className="text-[10px] text-[color:var(--crm-text-tertiary)] block font-medium">In Time</span>
                    <span className="text-sm font-bold font-mono text-[color:var(--crm-text-primary)]">
                      {todayAttendance?.checkIn || '--:--'}
                    </span>
                  </div>
                  <div className="bg-[color:var(--crm-bg-app)] p-3 rounded-xl border border-[color:var(--crm-border-default)]">
                    <span className="text-[10px] text-[color:var(--crm-text-tertiary)] block font-medium">Out Time</span>
                    <span className="text-sm font-bold font-mono text-[color:var(--crm-text-primary)]">
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
                  <div className="text-center py-2.5 bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>You have completed both punches for today.</span>
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

            {/* Widget 2: Monthly Attendance & Hours */}
            <div className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[color:var(--crm-surface-subtle)]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-crm-brand-50 text-crm-brand-700 border border-crm-brand-100 flex items-center justify-center font-bold">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[color:var(--crm-text-primary)]">Monthly Attendance</h3>
                      <p className="text-[10px] text-[color:var(--crm-text-tertiary)]">{dashboardData?.monthlySummary?.month || 'Current Month'}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[color:var(--crm-text-primary)] bg-[color:var(--crm-bg-app)] px-2 py-0.5 rounded border border-[color:var(--crm-border-default)]">
                    {dashboardData?.monthlySummary?.attendanceRate ? `${dashboardData.monthlySummary.attendanceRate}%` : '100% Rate'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 my-4">
                  <div className="bg-[color:var(--crm-bg-app)] p-2.5 rounded-xl border border-[color:var(--crm-border-default)] text-center">
                    <span className="text-[10px] text-[color:var(--crm-text-tertiary)] block">Present</span>
                    <span className="text-sm font-black text-emerald-700 font-mono">
                      {dashboardData?.monthlySummary?.presentDays !== undefined ? `${dashboardData.monthlySummary.presentDays}d` : '0 Days'}
                    </span>
                  </div>
                  <div className="bg-[color:var(--crm-bg-app)] p-2.5 rounded-xl border border-[color:var(--crm-border-default)] text-center">
                    <span className="text-[10px] text-[color:var(--crm-text-tertiary)] block">Late</span>
                    <span className="text-sm font-black text-amber-700 font-mono">
                      {dashboardData?.monthlySummary?.lateDays !== undefined ? `${dashboardData.monthlySummary.lateDays}d` : '0 Days'}
                    </span>
                  </div>
                  <div className="bg-[color:var(--crm-bg-app)] p-2.5 rounded-xl border border-[color:var(--crm-border-default)] text-center">
                    <span className="text-[10px] text-[color:var(--crm-text-tertiary)] block">Total Hours</span>
                    <span className="text-sm font-black text-crm-brand-700 font-mono">
                      {dashboardData?.monthlySummary?.totalHours !== undefined ? `${dashboardData.monthlySummary.totalHours}h` : '0.0h'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[color:var(--crm-surface-subtle)] flex items-center justify-between text-xs">
                <span className="text-[color:var(--crm-text-tertiary)]">Total Working Days: 26</span>
                <Link href="/hr/regularization" className="text-crm-brand-700 font-bold hover:underline">
                  Regularize Punch
                </Link>
              </div>
            </div>

            {/* Widget 3: Leave Balances & Fast Apply */}
            <div className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[color:var(--crm-surface-subtle)]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-crm-brand-50 text-crm-brand-700 border border-crm-brand-100 flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[color:var(--crm-text-primary)]">Leave Balances</h3>
                      <p className="text-[10px] text-[color:var(--crm-text-tertiary)]">Annual Entitlement FY 26-27</p>
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
                    <div key={b.id || idx} className="bg-[color:var(--crm-bg-app)] p-2.5 rounded-xl border border-[color:var(--crm-border-default)] text-center">
                      <span className="text-[10px] text-[color:var(--crm-text-tertiary)] block truncate">{b.leaveCode || b.leave_code}</span>
                      <span className="text-sm font-black text-[color:var(--crm-text-primary)] font-mono">
                        {b.availableBalance !== undefined ? b.availableBalance : b.available_balance} Left
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[color:var(--crm-surface-subtle)] flex items-center justify-between text-xs">
                <span className="text-[color:var(--crm-text-tertiary)]">
                  Pending Approval: {dashboardData?.pendingLeaves ? dashboardData.pendingLeaves.length : 0}
                </span>
                <Link href="/hr/leaves" className="text-crm-brand-700 font-bold hover:underline">
                  My Applications
                </Link>
              </div>
            </div>
          </div>

          {/* Assigned Department Tasks & Workflow Items */}
          <div className="bg-white border border-[color:var(--crm-border-default)] rounded-3xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[color:var(--crm-surface-subtle)]">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-crm-brand-700" />
                  My Assigned Tasks & Action Items
                </h2>
                <p className="text-xs text-[color:var(--crm-text-tertiary)]">
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
              <div className="py-10 text-center text-xs text-[color:var(--crm-text-tertiary)] bg-[color:var(--crm-bg-app)] rounded-2xl border border-[color:var(--crm-border-default)]">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="font-bold text-[color:var(--crm-text-primary)]">All caught up! No pending tasks assigned.</div>
                <p className="text-[11px] mt-0.5">
                  Tasks assigned to your profile by your manager will show up here automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {myAssignedTasks.map((t: any) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl border border-[color:var(--crm-border-default)] bg-[#F4F6FA]/60 hover:bg-white transition-all flex flex-col justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold text-[color:var(--crm-brand-600)] uppercase">
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
                      <h4 className="text-xs font-bold text-[color:var(--crm-text-primary)] line-clamp-1">
                        {t.taskName || t.title}
                      </h4>
                      <p className="text-[10px] text-[color:var(--crm-text-secondary)] mt-0.5 line-clamp-2">
                        {t.description || 'Execution in progress per department milestone requirements.'}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[color:var(--crm-border-default)]">
                      <div className="flex items-center justify-between text-[10px] text-[color:var(--crm-text-secondary)]">
                        <span>Due: <strong className="text-[color:var(--crm-text-primary)]">{t.dueDate || 'TBD'}</strong></span>
                        <span className="font-mono font-bold text-[color:var(--crm-text-primary)]">{t.progressPercent || 0}%</span>
                      </div>
                      <div className="w-full bg-[#D0D6E5] h-1.5 rounded-full overflow-hidden">
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
                              className="px-2 py-0.5 text-[9px] font-bold rounded bg-white hover:bg-slate-100 border border-[#CDD2DF] text-[color:var(--crm-text-secondary)] cursor-pointer"
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                        <button
                          disabled={updatingTaskId === t.id}
                          onClick={() => handleUpdateTaskProgress(t.id, 100)}
                          className="px-2.5 py-0.5 text-[9px] font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1 cursor-pointer"
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

          {/* Department Quick Launch Center */}
          <div className="bg-white border border-[color:var(--crm-border-default)] rounded-3xl p-5 sm:p-6 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[color:var(--crm-text-secondary)] mb-3 flex items-center gap-2">
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
                  className="p-3.5 rounded-2xl bg-[color:var(--crm-bg-app)] hover:bg-[color:var(--crm-surface-subtle)] border border-[color:var(--crm-border-default)] text-center transition group shadow-2xs"
                >
                  <div className="w-10 h-10 mx-auto rounded-xl bg-crm-brand-50 text-crm-brand-700 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
                    {sc.icon === 'Play' ? <Play className="w-4 h-4" /> :
                     sc.icon === 'ShoppingCart' ? <ShoppingCart className="w-4 h-4" /> :
                     sc.icon === 'Box' ? <Box className="w-4 h-4" /> :
                     sc.icon === 'Palette' ? <Palette className="w-4 h-4" /> :
                     sc.icon === 'Users' ? <Users className="w-4 h-4" /> :
                     sc.icon === 'CheckSquare' ? <CheckSquare className="w-4 h-4" /> :
                     sc.icon === 'Landmark' ? <Landmark className="w-4 h-4" /> :
                     <Factory className="w-4 h-4" />}
                  </div>
                  <div className="text-xs font-bold text-[color:var(--crm-text-primary)] truncate">{sc.label}</div>
                  <div className="text-[10px] text-[color:var(--crm-text-tertiary)] capitalize">{sc.module}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
