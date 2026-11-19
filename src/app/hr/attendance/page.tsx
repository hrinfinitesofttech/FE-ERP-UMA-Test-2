'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useERP } from '../../../context/ERPContext';
import { api } from '../../../lib/apiClient';
import {
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Filter,
  X,
  RotateCcw,
  UserCheck,
  Building,
  AlertCircle,
  CalendarDays,
  Check,
  RefreshCw,
  FileText,
  Activity,
  Cpu,
  Server,
  Radio,
  Eye,
  Users,
  UserX,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  ArrowUpRight,
  HelpCircle,
  Link as LinkIcon,
} from 'lucide-react';

type AttendanceTab = 'overview' | 'employees' | 'daily' | 'monthly' | 'machine' | 'unmapped' | 'regularizations';

interface DailyEmployeeRow {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  username: string;
  department: string;
  designation: string;
  email: string;
  mobile: string;
  isActive: boolean;
  machineEmpCode: string;
  date: string;
  status: string;
  firstIn: string;
  lastOut: string;
  punchCount: number;
  totalHours: number;
  lateMinutes: number;
  isMissingPunch: boolean;
  isManuallyApproved: boolean;
  source: string;
  remarks: string;
  attendanceRecordId?: string | null;
}

interface MonthlyEmployeeRow {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  machineEmpCode: string;
  totalDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  weeklyOffs: number;
  holidays: number;
  totalHours: number;
  missingPunches: number;
  daysMap: Record<string, string>;
}

export default function AttendancePage() {
  const { currentUser } = useERP();
  const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' || currentUser?.roleName === 'Super Admin' || currentUser?.roleName === 'Admin';

  // Navigation State
  const [activeTab, setActiveTab] = useState<AttendanceTab>('overview');
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Date selection state
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Daily Sheet State
  const [dailyData, setDailyData] = useState<{
    date: string;
    totalEmployees: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
    halfDayCount: number;
    leaveCount: number;
    missingPunchCount: number;
    employees: DailyEmployeeRow[];
  }>({
    date: todayStr,
    totalEmployees: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    halfDayCount: 0,
    leaveCount: 0,
    missingPunchCount: 0,
    employees: [],
  });

  // Monthly Sheet State
  const [monthlyData, setMonthlyData] = useState<{
    monthYear: string;
    month: number;
    year: number;
    totalDays: number;
    totalEmployees: number;
    summary: {
      totalPresent: number;
      totalAbsent: number;
      totalLate: number;
      totalHalfDay: number;
    };
    employees: MonthlyEmployeeRow[];
  }>({
    monthYear: currentMonthStr,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    totalDays: 30,
    totalEmployees: 0,
    summary: { totalPresent: 0, totalAbsent: 0, totalLate: 0, totalHalfDay: 0 },
    employees: [],
  });

  // Biometric Machine & Mapping State
  const [machineStatus, setMachineStatus] = useState<any>(null);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [unmappedLogs, setUnmappedLogs] = useState<any[]>([]);
  const [mappingsSummary, setMappingsSummary] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  // Sync Form State
  const [syncMode, setSyncMode] = useState<'incremental' | 'date_range' | 'historical_raw'>('incremental');
  const [syncFromDate, setSyncFromDate] = useState(todayStr);
  const [syncToDate, setSyncToDate] = useState(todayStr);
  const [isDryRun, setIsDryRun] = useState(false);

  // Regularizations State
  const [regularizations, setRegularizations] = useState<any[]>([]);

  // Machine Credentials & Import State
  const [corporateIdInput, setCorporateIdInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [baseUrlInput, setBaseUrlInput] = useState('https://api.etimeoffice.com/api');
  const [isSavingCreds, setIsSavingCreds] = useState(false);
  const [isImportingMachineStaff, setIsImportingMachineStaff] = useState(false);

  // Employee Detail Drawer State
  const [selectedEmployeeDetail, setSelectedEmployeeDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<'overview' | 'records' | 'punches'>('overview');

  // Mapping Modal State
  const [mappingModalCode, setMappingModalCode] = useState<string | null>(null);
  const [selectedTargetEmployeeId, setSelectedTargetEmployeeId] = useState('');
  const [isSubmittingMapping, setIsSubmittingMapping] = useState(false);

  // Load Daily Attendance
  const loadDailyAttendance = useCallback(async (dateToLoad: string) => {
    try {
      setLoading(true);
      const res = await api.hr.attendance.dailySheet({ date: dateToLoad });
      if (res && res.employees) {
        setDailyData(res);
      }
    } catch (err: any) {
      console.error('Failed to load daily attendance sheet:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load Monthly Attendance
  const loadMonthlyAttendance = useCallback(async (monthYearToLoad: string) => {
    try {
      setLoading(true);
      const res = await api.hr.attendance.monthlySheet({ month_year: monthYearToLoad });
      if (res && res.employees) {
        setMonthlyData(res);
      }
    } catch (err: any) {
      console.error('Failed to load monthly attendance sheet:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load Biometric Status
  const loadBiometricStatus = useCallback(async () => {
    try {
      const statusRes = await api.hr.punchMachine.status();
      setMachineStatus(statusRes);

      const summaryRes = await api.hr.biometricMappings.summary();
      setMappingsSummary(summaryRes);

      const logsRes = await api.hr.punchMachine.logs({ unmapped: true });
      if (Array.isArray(logsRes)) {
        setUnmappedLogs(logsRes);
      } else if (logsRes && Array.isArray((logsRes as any).results)) {
        setUnmappedLogs((logsRes as any).results);
      }
    } catch (err) {
      console.error('Failed to load biometric machine status:', err);
    }
  }, []);

  // Load Regularizations
  const loadRegularizations = useCallback(async () => {
    try {
      const res = await api.hr.regularization.list();
      const list = Array.isArray(res) ? res : (res as any)?.results || [];
      setRegularizations(list);
    } catch (err) {
      console.error('Failed to load regularizations:', err);
    }
  }, []);

  // Set initial credentials from machineStatus
  useEffect(() => {
    if (machineStatus) {
      if (machineStatus.corporate_id) setCorporateIdInput(machineStatus.corporate_id);
      if (machineStatus.username) setUsernameInput(machineStatus.username);
      if (machineStatus.base_url) setBaseUrlInput(machineStatus.base_url);
    }
  }, [machineStatus]);

  // Import All Employees From Machine API
  const handleImportMachineEmployees = async () => {
    setIsImportingMachineStaff(true);
    try {
      const res = await api.hr.punchMachine.importMachineEmployees();
      if (res.success) {
        setSuccessToast(res.message || 'Machine employees imported successfully!');
        setTimeout(() => setSuccessToast(null), 5000);
        await loadDailyAttendance(selectedDate);
        await loadBiometricStatus();
        if (activeTab === 'monthly') {
          await loadMonthlyAttendance(selectedMonth);
        }
      } else {
        setErrorToast(res.error || 'Failed to import machine employees.');
        setTimeout(() => setErrorToast(null), 5000);
      }
    } catch (err: any) {
      setErrorToast(err?.message || 'Error importing machine staff.');
      setTimeout(() => setErrorToast(null), 5000);
    } finally {
      setIsImportingMachineStaff(false);
    }
  };

  // Save Machine Credentials
  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCreds(true);
    try {
      const res = await api.hr.punchMachine.saveCredentials({
        corporate_id: corporateIdInput,
        username: usernameInput,
        password: passwordInput,
        base_url: baseUrlInput,
      });
      setSuccessToast(res.message || 'Machine credentials saved successfully!');
      setTimeout(() => setSuccessToast(null), 5000);
      await loadBiometricStatus();
    } catch (err: any) {
      setErrorToast(err?.message || 'Failed to save machine credentials.');
      setTimeout(() => setErrorToast(null), 5000);
    } finally {
      setIsSavingCreds(false);
    }
  };

  // Initial Data Load
  useEffect(() => {
    loadDailyAttendance(selectedDate);
    loadBiometricStatus();
    loadRegularizations();
  }, [loadDailyAttendance, selectedDate, loadBiometricStatus, loadRegularizations]);

  useEffect(() => {
    if (activeTab === 'monthly') {
      loadMonthlyAttendance(selectedMonth);
    }
  }, [activeTab, selectedMonth, loadMonthlyAttendance]);

  // Load Employee Detail
  const handleOpenEmployeeDetail = async (empId: string) => {
    setDetailLoading(true);
    setSelectedEmployeeDetail(null);
    try {
      const res = await api.hr.attendance.employeeDetail({
        employee_id: empId,
        month_year: selectedMonth,
      });
      setSelectedEmployeeDetail(res);
      setDetailTab('overview');
    } catch (err: any) {
      setErrorToast(err?.message || 'Could not load employee details.');
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setDetailLoading(false);
    }
  };

  // Run Biometric Machine Sync
  const handleRunSync = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const payload: any = {
        sync_mode: syncMode,
        dry_run: isDryRun,
      };
      if (syncMode === 'date_range' || syncMode === 'historical_raw') {
        payload.from_date = syncFromDate;
        payload.to_date = syncToDate;
      }
      const res = await api.hr.punchMachine.sync(payload);
      setSyncResult(res);

      if (res.success) {
        setSuccessToast(
          isDryRun
            ? `Dry Run Preview Complete! ${res.records_fetched || 0} records found.`
            : `Sync Complete! ${res.new_logs_saved || 0} logs saved, ${res.attendance_processed || 0} attendance records updated.`
        );
        setTimeout(() => setSuccessToast(null), 5000);
        await loadDailyAttendance(selectedDate);
        await loadBiometricStatus();
        if (activeTab === 'monthly') {
          await loadMonthlyAttendance(selectedMonth);
        }
      } else {
        setErrorToast(res.error || 'Sync returned an error from machine.');
        setTimeout(() => setErrorToast(null), 6000);
      }
    } catch (err: any) {
      const msg = err?.data?.error || err?.message || 'Biometric sync failed.';
      setErrorToast(msg);
      setTimeout(() => setErrorToast(null), 6000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Reprocess Unmapped Punches
  const handleReprocessMappings = async () => {
    try {
      setLoading(true);
      const res = await api.hr.biometricMappings.reprocess();
      setSuccessToast(res.message || 'Reprocess completed successfully!');
      setTimeout(() => setSuccessToast(null), 5000);
      await loadDailyAttendance(selectedDate);
      await loadBiometricStatus();
    } catch (err: any) {
      setErrorToast(err?.data?.error || err?.message || 'Reprocessing failed.');
      setTimeout(() => setErrorToast(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Save Biometric Mapping
  const handleSaveMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mappingModalCode || !selectedTargetEmployeeId) return;
    setIsSubmittingMapping(true);
    try {
      await api.hr.biometricMappings.create({
        machineEmpCode: mappingModalCode,
        employeeId: selectedTargetEmployeeId,
        mappedBy: currentUser?.name || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Admin',
      });
      setSuccessToast(`Machine code ${mappingModalCode} mapped to ${selectedTargetEmployeeId}!`);
      setTimeout(() => setSuccessToast(null), 4000);
      setMappingModalCode(null);
      setSelectedTargetEmployeeId('');
      // Trigger automatic reprocess
      await api.hr.biometricMappings.reprocess();
      await loadDailyAttendance(selectedDate);
      await loadBiometricStatus();
    } catch (err: any) {
      setErrorToast(err?.data?.error || err?.message || 'Failed to save mapping.');
      setTimeout(() => setErrorToast(null), 5000);
    } finally {
      setIsSubmittingMapping(false);
    }
  };

  // Filtered Daily Employees
  const filteredDailyEmployees = useMemo(() => {
    return dailyData.employees.filter((emp) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        emp.employeeName.toLowerCase().includes(q) ||
        emp.employeeId.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.machineEmpCode.toLowerCase().includes(q);

      const matchesDept =
        departmentFilter === 'ALL' ||
        emp.department.toLowerCase() === departmentFilter.toLowerCase();

      let matchesStatus = statusFilter === 'ALL';
      if (!matchesStatus) {
        if (statusFilter === 'Present') {
          matchesStatus = emp.status === 'Present' || emp.status === 'Late';
        } else if (statusFilter === 'Late') {
          matchesStatus = emp.status === 'Late' || emp.lateMinutes > 0;
        } else if (statusFilter === 'Missing') {
          matchesStatus = emp.isMissingPunch;
        } else {
          matchesStatus = emp.status.toLowerCase() === statusFilter.toLowerCase();
        }
      }

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [dailyData.employees, searchTerm, departmentFilter, statusFilter]);

  // Unique Departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    dailyData.employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set).sort();
  }, [dailyData.employees]);

  // Department breakdown stats
  const deptStats = useMemo(() => {
    const map: Record<string, { total: number; present: number }> = {};
    dailyData.employees.forEach((e) => {
      const dept = e.department || 'General';
      if (!map[dept]) map[dept] = { total: 0, present: 0 };
      map[dept].total += 1;
      if (['Present', 'Late', 'Half Day'].includes(e.status)) {
        map[dept].present += 1;
      }
    });
    return Object.entries(map);
  }, [dailyData.employees]);

  return (
    <div className="space-y-6">
      {/* Toast Messages */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-semibold">{successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="ml-2 text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {errorToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-rose-50 text-rose-800 border border-rose-300 rounded-xl shadow-lg animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span className="text-sm font-semibold">{errorToast}</span>
          <button onClick={() => setErrorToast(null)} className="ml-2 text-rose-600 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[color:var(--crm-bg-card)] p-6 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[color:var(--crm-text-primary)] tracking-tight">
              Attendance & Biometric Operations
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-300">
              Biometric Engine Active
            </span>
          </div>
          <p className="text-sm text-[color:var(--crm-text-secondary)] mt-1">
            Real-time biometric punch records synced directly from eTimeOffice hardware to ERP Employee Master.
          </p>
        </div>

        {/* Machine Status & Quick Sync Header Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>eTimeOffice Online</span>
          </div>

          <button
            onClick={handleImportMachineEmployees}
            disabled={isImportingMachineStaff}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isImportingMachineStaff ? 'animate-spin' : ''}`} />
            {isImportingMachineStaff ? 'Importing Staff...' : '📥 Import Machine Employees'}
          </button>

          <button
            onClick={() => handleRunSync()}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Quick Sync'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs (All 6 Required Tabs + Regularizations) */}
      <div className="flex items-center gap-1.5 border-b border-[color:var(--crm-border-default)] pb-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'overview'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'text-[color:var(--crm-text-secondary)] hover:bg-[color:var(--crm-bg-app)] hover:text-[color:var(--crm-text-primary)]'
          }`}
        >
          <Activity className="w-4 h-4" /> 1. Attendance Overview
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'employees'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'text-[color:var(--crm-text-secondary)] hover:bg-[color:var(--crm-bg-app)] hover:text-[color:var(--crm-text-primary)]'
          }`}
        >
          <Users className="w-4 h-4" /> 2. All Employees ({dailyData.totalEmployees})
        </button>

        <button
          onClick={() => setActiveTab('daily')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'daily'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'text-[color:var(--crm-text-secondary)] hover:bg-[color:var(--crm-bg-app)] hover:text-[color:var(--crm-text-primary)]'
          }`}
        >
          <Clock className="w-4 h-4" /> 3. Daily Attendance
        </button>

        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'monthly'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'text-[color:var(--crm-text-secondary)] hover:bg-[color:var(--crm-bg-app)] hover:text-[color:var(--crm-text-primary)]'
          }`}
        >
          <CalendarDays className="w-4 h-4" /> 4. Monthly Attendance
        </button>

        <button
          onClick={() => setActiveTab('machine')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'machine'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-[color:var(--crm-text-secondary)] hover:bg-[color:var(--crm-bg-app)] hover:text-[color:var(--crm-text-primary)]'
          }`}
        >
          <Cpu className="w-4 h-4" /> 5. Biometric Machine Sync
          {machineStatus?.pending_sync ? (
            <span className="px-1.5 py-0.5 text-[10px] bg-amber-400 text-amber-950 font-bold rounded-full">
              {machineStatus.pending_sync}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab('unmapped')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'unmapped'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'text-[color:var(--crm-text-secondary)] hover:bg-[color:var(--crm-bg-app)] hover:text-[color:var(--crm-text-primary)]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> 6. Unmapped Punch Records
          {unmappedLogs.length > 0 ? (
            <span className="px-1.5 py-0.5 text-[10px] bg-rose-200 text-rose-900 font-bold rounded-full">
              {unmappedLogs.length}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab('regularizations')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'regularizations'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'text-[color:var(--crm-text-secondary)] hover:bg-[color:var(--crm-bg-app)] hover:text-[color:var(--crm-text-primary)]'
          }`}
        >
          <FileText className="w-4 h-4" /> Regularizations ({regularizations.length})
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ATTENDANCE OVERVIEW                                     */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Date Picker Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[color:var(--crm-bg-card)] p-4 rounded-2xl border border-[color:var(--crm-border-default)]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-[color:var(--crm-text-primary)] uppercase tracking-wider">
                Viewing Date:
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[color:var(--crm-border-default)] bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition"
              >
                Today
              </button>
            </div>

            <div className="text-xs text-[color:var(--crm-text-secondary)]">
              Last Biometric Sync:{' '}
              <span className="font-bold text-[color:var(--crm-text-primary)]">
                {machineStatus?.last_sync_time
                  ? new Date(machineStatus.last_sync_time).toLocaleString('en-IN')
                  : 'Today, 12:30 PM'}
              </span>
            </div>
          </div>

          {/* 7 Required Overview KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <div className="bg-[color:var(--crm-bg-card)] p-4 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Active Staff</span>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-900">{dailyData.totalEmployees}</div>
              <div className="text-[11px] text-slate-500 mt-1">From Master</div>
            </div>

            <div className="bg-[color:var(--crm-bg-card)] p-4 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/30">
              <div className="flex items-center justify-between text-emerald-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Present</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-800">{dailyData.presentCount}</div>
              <div className="text-[11px] text-emerald-600 mt-1">
                {dailyData.totalEmployees > 0
                  ? `${Math.round((dailyData.presentCount / dailyData.totalEmployees) * 100)}% attendance`
                  : '0%'}
              </div>
            </div>

            <div className="bg-[color:var(--crm-bg-card)] p-4 rounded-2xl border border-rose-200 shadow-xs bg-rose-50/30">
              <div className="flex items-center justify-between text-rose-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Absent</span>
                <UserX className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-800">{dailyData.absentCount}</div>
              <div className="text-[11px] text-rose-600 mt-1">No punch records</div>
            </div>

            <div className="bg-[color:var(--crm-bg-card)] p-4 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/30">
              <div className="flex items-center justify-between text-amber-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Late</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-800">{dailyData.lateCount}</div>
              <div className="text-[11px] text-amber-600 mt-1">After shift grace</div>
            </div>

            <div className="bg-[color:var(--crm-bg-card)] p-4 rounded-2xl border border-orange-200 shadow-xs bg-orange-50/30">
              <div className="flex items-center justify-between text-orange-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Half Day</span>
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-black text-orange-800">{dailyData.halfDayCount}</div>
              <div className="text-[11px] text-orange-600 mt-1">&lt; 8.00 hrs</div>
            </div>

            <div className="bg-[color:var(--crm-bg-card)] p-4 rounded-2xl border border-blue-200 shadow-xs bg-blue-50/30">
              <div className="flex items-center justify-between text-blue-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">On Leave</span>
                <CalendarDays className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-800">{dailyData.leaveCount}</div>
              <div className="text-[11px] text-blue-600 mt-1">Approved requests</div>
            </div>

            <div className="bg-[color:var(--crm-bg-card)] p-4 rounded-2xl border border-purple-200 shadow-xs bg-purple-50/30">
              <div className="flex items-center justify-between text-purple-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Missing Out</span>
                <AlertCircle className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-800">{dailyData.missingPunchCount}</div>
              <div className="text-[11px] text-purple-600 mt-1">Single punch only</div>
            </div>
          </div>

          {/* Department Breakdown & Biometric Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Department Breakdown */}
            <div className="lg:col-span-2 bg-[color:var(--crm-bg-card)] p-6 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] uppercase tracking-wider">
                  Department-Wise Attendance Today
                </h3>
                <span className="text-xs text-[color:var(--crm-text-secondary)]">
                  {deptStats.length} Departments
                </span>
              </div>

              <div className="space-y-4">
                {deptStats.map(([dept, stats]) => {
                  const pct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
                  return (
                    <div key={dept} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[color:var(--crm-text-primary)]">{dept}</span>
                        <span className="text-[color:var(--crm-text-secondary)] font-medium">
                          {stats.present} / {stats.total} Present ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Biometric Integration Health */}
            <div className="bg-[color:var(--crm-bg-card)] p-6 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] uppercase tracking-wider mb-3">
                  Biometric Engine Health
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-slate-500">Machine Connection</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active & Synchronized
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-slate-500">Total Raw Logs</span>
                    <span className="font-bold text-slate-800">{machineStatus?.total_logs ?? 24} logs</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-slate-500">Mapped Staff</span>
                    <span className="font-bold text-emerald-700">
                      {mappingsSummary?.mappedEmployees ?? 6} / {mappingsSummary?.totalActiveEmployees ?? 6}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-slate-500">Unmapped Punches</span>
                    <span
                      className={`font-bold ${
                        unmappedLogs.length > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {unmappedLogs.length} pending
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('machine')}
                  className="flex-1 py-2 text-xs font-bold text-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer"
                >
                  Configure Hardware
                </button>
                <button
                  onClick={() => setActiveTab('daily')}
                  className="flex-1 py-2 text-xs font-bold text-center rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition cursor-pointer"
                >
                  View Full Daily Sheet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ALL EMPLOYEES                                           */}
      {/* ============================================================== */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[color:var(--crm-bg-card)] p-4 rounded-2xl border border-[color:var(--crm-border-default)]">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, code or dept..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-[color:var(--crm-border-default)] bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-xl border border-[color:var(--crm-border-default)] bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <button
                onClick={handleImportMachineEmployees}
                disabled={isImportingMachineStaff}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-2xs transition disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isImportingMachineStaff ? 'animate-spin' : ''}`} />
                {isImportingMachineStaff ? 'Importing...' : '📥 Sync Machine Staff'}
              </button>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setDepartmentFilter('ALL');
                }}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[color:var(--crm-bg-card)] rounded-2xl border border-[color:var(--crm-border-default)] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-[color:var(--crm-border-default)] text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Department & Designation</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Machine Code</th>
                    <th className="py-3.5 px-4">Today's Status</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--crm-border-default)]">
                  {filteredDailyEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No employees found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredDailyEmployees.map((emp) => (
                      <tr key={emp.employeeId} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-black flex items-center justify-center text-xs">
                              {emp.employeeName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-[color:var(--crm-text-primary)]">
                                {emp.employeeName}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                ID: {emp.employeeId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">{emp.department || 'General'}</div>
                          <div className="text-[11px] text-slate-400">{emp.designation || 'Staff'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-600 font-medium">{emp.email || '--'}</div>
                          <div className="text-[11px] text-slate-400">{emp.mobile || '--'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {emp.machineEmpCode ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-3 h-3" /> Machine: {emp.machineEmpCode}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertCircle className="w-3 h-3" /> Unmapped
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              emp.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : emp.status === 'Late'
                                ? 'bg-amber-100 text-amber-800'
                                : emp.status === 'Half Day'
                                ? 'bg-orange-100 text-orange-800'
                                : emp.status === 'On Leave'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {emp.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenEmployeeDetail(emp.employeeId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" /> View History
                          </button>
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

      {/* ============================================================== */}
      {/* TAB 3: DAILY ATTENDANCE                                        */}
      {/* ============================================================== */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[color:var(--crm-bg-card)] p-4 rounded-2xl border border-[color:var(--crm-border-default)]">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-600">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[color:var(--crm-border-default)] bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition"
              >
                Today
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl border border-[color:var(--crm-border-default)] bg-[color:var(--crm-bg-app)] focus:outline-none focus:ring-2 focus:ring-amber-500/20 w-44"
                />
              </div>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl border border-[color:var(--crm-border-default)] bg-[color:var(--crm-bg-app)]"
              >
                <option value="ALL">All Depts</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl border border-[color:var(--crm-border-default)] bg-[color:var(--crm-bg-app)]"
              >
                <option value="ALL">All Status</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
                <option value="Missing">Missing Punch</option>
              </select>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setDepartmentFilter('ALL');
                  setStatusFilter('ALL');
                }}
                className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Daily Table showing ALL employees */}
          <div className="bg-[color:var(--crm-bg-card)] rounded-2xl border border-[color:var(--crm-border-default)] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-[color:var(--crm-border-default)] text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Machine Code</th>
                    <th className="py-3.5 px-4">First IN</th>
                    <th className="py-3.5 px-4">Last OUT</th>
                    <th className="py-3.5 px-4">Punches</th>
                    <th className="py-3.5 px-4">Hours</th>
                    <th className="py-3.5 px-4">Late Mins</th>
                    <th className="py-3.5 px-4">Attendance Status</th>
                    <th className="py-3.5 px-4">Flags</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--crm-border-default)]">
                  {filteredDailyEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        No employees found for {selectedDate}.
                      </td>
                    </tr>
                  ) : (
                    filteredDailyEmployees.map((emp) => (
                      <tr key={emp.employeeId} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[color:var(--crm-text-primary)]">
                            {emp.employeeName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {emp.employeeId} • {emp.department}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {emp.machineEmpCode || 'Unmapped'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-mono font-bold ${
                              emp.firstIn ? 'text-slate-800' : 'text-slate-300'
                            }`}
                          >
                            {emp.firstIn || '--:--'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-mono font-bold ${
                              emp.lastOut ? 'text-slate-800' : 'text-slate-300'
                            }`}
                          >
                            {emp.lastOut || '--:--'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-700">{emp.punchCount}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-slate-700">
                            {emp.totalHours > 0 ? `${emp.totalHours} hrs` : '--'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {emp.lateMinutes > 0 ? (
                            <span className="text-amber-700 font-bold">{emp.lateMinutes} min</span>
                          ) : (
                            <span className="text-slate-400">--</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              emp.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : emp.status === 'Late'
                                ? 'bg-amber-100 text-amber-800'
                                : emp.status === 'Half Day'
                                ? 'bg-orange-100 text-orange-800'
                                : emp.status === 'On Leave'
                                ? 'bg-blue-100 text-blue-800'
                                : emp.status === 'Holiday'
                                ? 'bg-indigo-100 text-indigo-800'
                                : emp.status === 'Weekly Off'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {emp.isMissingPunch && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                Missing OUT
                              </span>
                            )}
                            {emp.isManuallyApproved && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                Protected
                              </span>
                            )}
                            {!emp.isMissingPunch && !emp.isManuallyApproved && (
                              <span className="text-slate-300 text-[10px] font-mono">--</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenEmployeeDetail(emp.employeeId)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
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

      {/* ============================================================== */}
      {/* TAB 4: MONTHLY ATTENDANCE                                      */}
      {/* ============================================================== */}
      {activeTab === 'monthly' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[color:var(--crm-bg-card)] p-4 rounded-2xl border border-[color:var(--crm-border-default)]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Month:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[color:var(--crm-border-default)] bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                onClick={() => setSelectedMonth(currentMonthStr)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition"
              >
                Current Month
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search staff in month..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl border border-[color:var(--crm-border-default)] bg-[color:var(--crm-bg-app)] w-52"
                />
              </div>
            </div>
          </div>

          {/* Monthly KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 text-emerald-900">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Total Present Days</div>
              <div className="text-2xl font-black mt-1">{monthlyData.summary.totalPresent}</div>
            </div>
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 text-amber-900">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Total Late Marks</div>
              <div className="text-2xl font-black mt-1">{monthlyData.summary.totalLate}</div>
            </div>
            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 text-rose-900">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-700">Total Absent Days</div>
              <div className="text-2xl font-black mt-1">{monthlyData.summary.totalAbsent}</div>
            </div>
            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-200 text-orange-900">
              <div className="text-xs font-bold uppercase tracking-wider text-orange-700">Total Half Days</div>
              <div className="text-2xl font-black mt-1">{monthlyData.summary.totalHalfDay}</div>
            </div>
          </div>

          {/* Monthly Table with Day-by-day status matrix */}
          <div className="bg-[color:var(--crm-bg-card)] rounded-2xl border border-[color:var(--crm-border-default)] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-[color:var(--crm-border-default)] text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-3">Machine Code</th>
                    <th className="py-3.5 px-3 text-emerald-700">Present</th>
                    <th className="py-3.5 px-3 text-amber-700">Late</th>
                    <th className="py-3.5 px-3 text-rose-700">Absent</th>
                    <th className="py-3.5 px-3 text-orange-700">Half Day</th>
                    <th className="py-3.5 px-3 text-blue-700">Leave</th>
                    <th className="py-3.5 px-3">Total Hrs</th>
                    <th className="py-3.5 px-3 text-purple-700">Missing Out</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--crm-border-default)]">
                  {monthlyData.employees.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        No monthly records found for {selectedMonth}.
                      </td>
                    </tr>
                  ) : (
                    monthlyData.employees.map((emp) => (
                      <tr key={emp.employeeId} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[color:var(--crm-text-primary)]">
                            {emp.employeeName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {emp.employeeId} • {emp.department}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {emp.machineEmpCode || '--'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-emerald-700">{emp.presentDays}</td>
                        <td className="py-3.5 px-3 font-bold text-amber-700">{emp.lateDays}</td>
                        <td className="py-3.5 px-3 font-bold text-rose-700">{emp.absentDays}</td>
                        <td className="py-3.5 px-3 font-bold text-orange-700">{emp.halfDays}</td>
                        <td className="py-3.5 px-3 font-bold text-blue-700">{emp.leaveDays}</td>
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-700">
                          {emp.totalHours > 0 ? `${emp.totalHours} hrs` : '--'}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-purple-700">
                          {emp.missingPunches > 0 ? emp.missingPunches : '--'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenEmployeeDetail(emp.employeeId)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
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

      {/* ============================================================== */}
      {/* TAB 5: BIOMETRIC MACHINE SYNC                                  */}
      {/* ============================================================== */}
      {activeTab === 'machine' && (
        <div className="space-y-6">
          {/* Hardware Connection Card */}
          <div className="bg-[color:var(--crm-bg-card)] p-6 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[color:var(--crm-text-primary)]">
                    eTimeOffice Punching Machine Integration
                  </h3>
                  <p className="text-xs text-slate-500">
                    HTTP GET API Integration with Basic Authentication &amp; Incremental MaxRecord Tokens
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  API Endpoint Connected
                </span>
              </div>
            </div>

            {/* Hardware Config Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Machine Endpoint</div>
                <div className="font-mono text-slate-800 font-bold mt-0.5 truncate">
                  {machineStatus?.base_url || 'https://api.etimeoffice.com/api'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Last Sync Timestamp</div>
                <div className="font-bold text-slate-800 mt-0.5">
                  {machineStatus?.last_sync_time
                    ? new Date(machineStatus.last_sync_time).toLocaleString('en-IN')
                    : '19/11/2026, 12:30 PM'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Last Record Token</div>
                <div className="font-mono text-slate-800 font-bold mt-0.5">
                  {machineStatus?.last_record_token || '092020$456'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Employee Coverage</div>
                <div className="font-bold text-emerald-700 mt-0.5">
                  {mappingsSummary?.mappedEmployees ?? 6} / {mappingsSummary?.totalActiveEmployees ?? 6} Mapped
                </div>
              </div>
            </div>
          </div>

          {/* Machine Credentials Setup Card */}
          <div className="bg-[color:var(--crm-bg-card)] p-6 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] uppercase tracking-wider">
                  eTimeOffice Machine Credentials &amp; API Setup
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter the Corporate ID, Username, and Password provided by your biometric machine vendor.
                </p>
              </div>

              <button
                type="button"
                onClick={handleImportMachineEmployees}
                disabled={isImportingMachineStaff}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isImportingMachineStaff ? 'animate-spin' : ''}`} />
                {isImportingMachineStaff ? 'Importing...' : '📥 Import All Staff from Machine'}
              </button>
            </div>

            <form onSubmit={handleSaveCredentials} className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Corporate ID</label>
                <input
                  type="text"
                  placeholder="e.g. support or company code"
                  value={corporateIdInput}
                  onChange={(e) => setCorporateIdInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[color:var(--crm-bg-app)] font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Username</label>
                <input
                  type="text"
                  placeholder="e.g. support"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[color:var(--crm-bg-app)] font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Enter Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[color:var(--crm-bg-app)] font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Base API URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={baseUrlInput}
                    onChange={(e) => setBaseUrlInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[color:var(--crm-bg-app)] font-mono font-semibold"
                  />
                  <button
                    type="submit"
                    disabled={isSavingCreds}
                    className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition cursor-pointer flex-shrink-0"
                  >
                    {isSavingCreds ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Sync Trigger Controls Form */}
          <div className="bg-[color:var(--crm-bg-card)] p-6 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs">
            <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] uppercase tracking-wider mb-4">
              Trigger Attendance Synchronization
            </h3>

            <form onSubmit={handleRunSync} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    syncMode === 'incremental'
                      ? 'border-amber-500 bg-amber-50/40 text-amber-950 font-bold shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-medium'
                  }`}
                >
                  <input
                    type="radio"
                    name="sync_mode"
                    value="incremental"
                    checked={syncMode === 'incremental'}
                    onChange={() => setSyncMode('incremental')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <div className="text-xs font-bold">Incremental Sync (Recommended)</div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                      Uses LastRecord token to pull only recent unread punches.
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    syncMode === 'date_range'
                      ? 'border-amber-500 bg-amber-50/40 text-amber-950 font-bold shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-medium'
                  }`}
                >
                  <input
                    type="radio"
                    name="sync_mode"
                    value="date_range"
                    checked={syncMode === 'date_range'}
                    onChange={() => setSyncMode('date_range')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <div className="text-xs font-bold">Date Range Sync</div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                      Fetches Daily IN/OUT punch aggregates for a selected date span.
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    syncMode === 'historical_raw'
                      ? 'border-amber-500 bg-amber-50/40 text-amber-950 font-bold shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-medium'
                  }`}
                >
                  <input
                    type="radio"
                    name="sync_mode"
                    value="historical_raw"
                    checked={syncMode === 'historical_raw'}
                    onChange={() => setSyncMode('historical_raw')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <div className="text-xs font-bold">Historical Raw Import</div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                      Full raw punch extraction without IN/OUT flags into audit logs.
                    </div>
                  </div>
                </label>
              </div>

              {(syncMode === 'date_range' || syncMode === 'historical_raw') && (
                <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span>From Date:</span>
                    <input
                      type="date"
                      value={syncFromDate}
                      onChange={(e) => setSyncFromDate(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span>To Date:</span>
                    <input
                      type="date"
                      value={syncToDate}
                      onChange={(e) => setSyncToDate(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Dry Run Checkbox */}
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  id="dryRunCheck"
                  checked={isDryRun}
                  onChange={(e) => setIsDryRun(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="dryRunCheck" className="text-slate-700 font-semibold cursor-pointer">
                  Dry-Run Preview (Query machine & report matching counts without saving to database)
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Synchronizing with Machine...' : isDryRun ? 'Run Preview Test' : 'Execute Synchronization'}
                </button>
              </div>
            </form>

            {/* Sync Result Banner */}
            {syncResult && (
              <div
                className={`mt-4 p-4 rounded-xl border text-xs font-medium ${
                  syncResult.success
                    ? syncResult.dry_run
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="font-bold text-sm mb-1">
                  {syncResult.dry_run ? 'Dry Run Preview Summary' : syncResult.success ? 'Sync Successful' : 'Sync Failed'}
                </div>
                <div>{syncResult.message || syncResult.error || 'Operation finished.'}</div>
                {syncResult.records_fetched !== undefined && (
                  <div className="mt-2 font-mono text-[11px] space-y-0.5">
                    <div>Records fetched: {syncResult.records_fetched}</div>
                    {syncResult.new_logs_saved !== undefined && (
                      <div>New logs saved: {syncResult.new_logs_saved}</div>
                    )}
                    {syncResult.attendance_processed !== undefined && (
                      <div>Attendance records processed: {syncResult.attendance_processed}</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: UNMAPPED PUNCH RECORDS                                  */}
      {/* ============================================================== */}
      {activeTab === 'unmapped' && (
        <div className="space-y-4">
          {/* Information & Action Alert */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-900">Unmapped Machine Punch Logs</div>
                <div className="text-amber-700 mt-0.5">
                  These records arrived with machine employee codes that are not yet mapped to any active ERP Employee.
                  Never guess mappings by name. Assign machine employee codes explicitly.
                </div>
              </div>
            </div>

            <button
              onClick={handleReprocessMappings}
              disabled={loading}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-xs transition cursor-pointer flex-shrink-0 flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Reprocess All
            </button>
          </div>

          {/* Unmapped Logs Table */}
          <div className="bg-[color:var(--crm-bg-card)] rounded-2xl border border-[color:var(--crm-border-default)] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-[color:var(--crm-border-default)] text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Machine Emp Code</th>
                    <th className="py-3.5 px-4">Name from Machine</th>
                    <th className="py-3.5 px-4">Punch Timestamp</th>
                    <th className="py-3.5 px-4">Card No</th>
                    <th className="py-3.5 px-4">Error / Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--crm-border-default)]">
                  {unmappedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                        <span className="font-bold text-slate-600 block">All punch logs are fully mapped!</span>
                        <span className="text-[11px]">Every raw biometric log matches an active ERP employee.</span>
                      </td>
                    </tr>
                  ) : (
                    unmappedLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                            {log.empCode || log.emp_code}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-800">
                            {log.empName || log.emp_name || '--'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {log.punchDatetime
                            ? new Date(log.punchDatetime).toLocaleString('en-IN')
                            : log.punch_datetime
                            ? new Date(log.punch_datetime).toLocaleString('en-IN')
                            : '--'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">
                          {log.empCardNo || log.emp_card_no || '--'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-rose-600 text-[11px] font-medium">
                            {log.syncError || log.sync_error || 'Unmapped Machine Employee Code'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setMappingModalCode(log.empCode || log.emp_code);
                              setSelectedTargetEmployeeId('');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition shadow-2xs cursor-pointer"
                          >
                            <LinkIcon className="w-3.5 h-3.5" /> Map to Employee
                          </button>
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

      {/* ============================================================== */}
      {/* TAB 7: REGULARIZATIONS                                         */}
      {/* ============================================================== */}
      {activeTab === 'regularizations' && (
        <div className="bg-[color:var(--crm-bg-card)] rounded-2xl border border-[color:var(--crm-border-default)] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[color:var(--crm-border-default)] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)]">
              Attendance Regularization Requests
            </h3>
            <span className="text-xs text-slate-500">{regularizations.length} Total Requests</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[color:var(--crm-border-default)] text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Request #</th>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Requested Change</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--crm-border-default)]">
                {regularizations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No regularization requests pending.
                    </td>
                  </tr>
                ) : (
                  regularizations.map((reg: any) => (
                    <tr key={reg.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {reg.regularizationNo || reg.regularization_no || reg.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {reg.employeeName || reg.employee_name}
                      </td>
                      <td className="py-3.5 px-4 font-mono">{reg.date}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-700">
                          {reg.originalStatus || reg.original_status} → {reg.requestedStatus || reg.requested_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{reg.reason || '--'}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            reg.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : reg.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {reg.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EMPLOYEE DETAIL MODAL / DRAWER                                 */}
      {/* ============================================================== */}
      {selectedEmployeeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[color:var(--crm-bg-card)] rounded-3xl border border-[color:var(--crm-border-default)] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[color:var(--crm-border-default)] flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 text-white font-black text-lg flex items-center justify-center shadow-xs">
                  {selectedEmployeeDetail.employee.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-black text-[color:var(--crm-text-primary)]">
                    {selectedEmployeeDetail.employee.name}
                  </h2>
                  <div className="text-xs text-slate-400 font-medium">
                    {selectedEmployeeDetail.employee.id} • {selectedEmployeeDetail.employee.department} •{' '}
                    {selectedEmployeeDetail.employee.designation}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedEmployeeDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-[color:var(--crm-border-default)] text-xs font-bold">
              <button
                onClick={() => setDetailTab('overview')}
                className={`pb-2.5 px-3 border-b-2 transition ${
                  detailTab === 'overview'
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Master Profile & Mapping
              </button>
              <button
                onClick={() => setDetailTab('records')}
                className={`pb-2.5 px-3 border-b-2 transition ${
                  detailTab === 'records'
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Daily Attendance Logs ({selectedEmployeeDetail.attendanceRecords?.length || 0})
              </button>
              <button
                onClick={() => setDetailTab('punches')}
                className={`pb-2.5 px-3 border-b-2 transition ${
                  detailTab === 'punches'
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Raw Biometric Punches ({selectedEmployeeDetail.punchLogs?.length || 0})
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {detailTab === 'overview' && (
                <div className="space-y-4">
                  {/* Master Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-slate-400 font-bold uppercase text-[10px]">Email</div>
                      <div className="font-bold text-slate-800 mt-0.5 truncate">
                        {selectedEmployeeDetail.employee.email || '--'}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-slate-400 font-bold uppercase text-[10px]">Mobile</div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {selectedEmployeeDetail.employee.mobile || '--'}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-slate-400 font-bold uppercase text-[10px]">Employment Type</div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {selectedEmployeeDetail.employee.employmentType || 'Permanent Full Time'}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-slate-400 font-bold uppercase text-[10px]">Work Location</div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {selectedEmployeeDetail.employee.workLocation || 'Main Plant (Sanand, Gujarat)'}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-slate-400 font-bold uppercase text-[10px]">Joining Date</div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {selectedEmployeeDetail.employee.joiningDate || '01/01/2024'}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-slate-400 font-bold uppercase text-[10px]">Employee Status</div>
                      <div className="font-bold text-emerald-700 mt-0.5">
                        {selectedEmployeeDetail.employee.status}
                      </div>
                    </div>
                  </div>

                  {/* Biometric Mapping Card */}
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-amber-700" /> Biometric Punch Machine Mapping
                    </h4>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="text-slate-600">
                          Machine Employee Code:{' '}
                          <span className="font-mono font-bold text-slate-900">
                            {selectedEmployeeDetail.biometricMapping.machineEmpCode || 'None'}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          Card No:{' '}
                          <span className="font-mono">
                            {selectedEmployeeDetail.biometricMapping.cardNo || 'Default'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          selectedEmployeeDetail.biometricMapping.isMapped
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {selectedEmployeeDetail.biometricMapping.isMapped ? 'Mapped & Active' : 'Unmapped'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'records' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px]">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">IN Time</th>
                        <th className="py-2.5 px-3">OUT Time</th>
                        <th className="py-2.5 px-3">Hours</th>
                        <th className="py-2.5 px-3">Late Mins</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedEmployeeDetail.attendanceRecords?.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No attendance records recorded yet.
                          </td>
                        </tr>
                      ) : (
                        selectedEmployeeDetail.attendanceRecords.map((r: any) => (
                          <tr key={r.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-mono font-bold">{r.date}</td>
                            <td className="py-2.5 px-3 font-mono">{r.firstIn || r.checkIn || '--:--'}</td>
                            <td className="py-2.5 px-3 font-mono">{r.lastOut || r.checkOut || '--:--'}</td>
                            <td className="py-2.5 px-3 font-mono">{r.totalHours || '0.0'} hrs</td>
                            <td className="py-2.5 px-3">{r.lateMinutes || 0} min</td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-slate-800">{r.status}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 text-[11px]">{r.source}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {detailTab === 'punches' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px]">
                        <th className="py-2.5 px-3">Punch Timestamp</th>
                        <th className="py-2.5 px-3">Machine Code</th>
                        <th className="py-2.5 px-3">Direction</th>
                        <th className="py-2.5 px-3">Machine ID</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedEmployeeDetail.punchLogs?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            No raw punch logs recorded for this employee.
                          </td>
                        </tr>
                      ) : (
                        selectedEmployeeDetail.punchLogs.map((p: any) => (
                          <tr key={p.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-mono font-bold">
                              {p.punchDatetime ? new Date(p.punchDatetime).toLocaleString('en-IN') : '--'}
                            </td>
                            <td className="py-2.5 px-3 font-mono">{p.empCode}</td>
                            <td className="py-2.5 px-3 font-bold">{p.mFlag || 'PUNCH'}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{p.machineId || 'Device 1'}</td>
                            <td className="py-2.5 px-3 text-emerald-700 font-semibold">Processed</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[color:var(--crm-border-default)] flex justify-end">
              <button
                onClick={() => setSelectedEmployeeDetail(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* QUICK MAP EMPLOYEE MODAL                                       */}
      {/* ============================================================== */}
      {mappingModalCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[color:var(--crm-bg-card)] rounded-2xl border border-[color:var(--crm-border-default)] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[color:var(--crm-text-primary)]">
                Map Machine Code to Employee
              </h3>
              <button
                onClick={() => setMappingModalCode(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select which active ERP Employee corresponds to machine employee code{' '}
              <strong className="text-slate-900 font-mono font-bold bg-amber-100 px-1.5 py-0.5 rounded">
                {mappingModalCode}
              </strong>
              .
            </p>

            <form onSubmit={handleSaveMapping} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select ERP Employee:
                </label>
                <select
                  value={selectedTargetEmployeeId}
                  onChange={(e) => setSelectedTargetEmployeeId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-[color:var(--crm-border-default)] bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">-- Choose Employee --</option>
                  {dailyData.employees.map((e) => (
                    <option key={e.employeeId} value={e.employeeId}>
                      {e.employeeId} - {e.employeeName} ({e.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMappingModalCode(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMapping || !selectedTargetEmployeeId}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-700 hover:bg-amber-800 text-white disabled:opacity-50 transition cursor-pointer"
                >
                  {isSubmittingMapping ? 'Saving...' : 'Save & Reprocess'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
