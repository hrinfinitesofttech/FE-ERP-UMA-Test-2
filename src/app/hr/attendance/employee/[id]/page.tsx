'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/apiClient';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Printer,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  CalendarDays,
  User,
  Building,
  Briefcase,
  MapPin,
  Cpu,
  Fingerprint,
  ChevronRight,
  Info,
  SlidersHorizontal,
  X
} from 'lucide-react';

export default function EmployeeAttendanceDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Employee ID from URL route
  const employeeId = (params?.id as string) || searchParams?.get('employeeId') || '';

  // Core Data States
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Current Date Helper (default Nov 2026 or actual date)
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-12

  // Filter States
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [startDate, setStartDate] = useState<string>(() => {
    const y = currentYear;
    const m = String(currentMonth).padStart(2, '0');
    return `${y}-${m}-01`;
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const y = currentYear;
    const m = currentMonth;
    const lastDay = new Date(y, m, 0).getDate();
    return `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  });

  const [activePreset, setActivePreset] = useState<string>('this_month');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRawPunchDate, setSelectedRawPunchDate] = useState<string | null>(null);

  // Fetch Attendance Details
  const loadEmployeeAttendance = useCallback(
    async (fromD?: string, toD?: string) => {
      if (!employeeId) return;
      try {
        setLoading(true);
        setError('');
        const res = await api.hr.attendance.employeeDetail({
          employee_id: employeeId,
          from_date: fromD || startDate,
          to_date: toD || endDate,
        });

        if (res && res.employee) {
          setData(res);
        } else {
          setError(res?.error || 'Failed to retrieve employee attendance record.');
        }
      } catch (err: any) {
        console.error('Error loading employee attendance:', err);
        setError(err?.message || 'Could not connect to ERP server.');
      } finally {
        setLoading(false);
      }
    },
    [employeeId, startDate, endDate]
  );

  useEffect(() => {
    loadEmployeeAttendance();
  }, [loadEmployeeAttendance]);

  // Preset Handlers
  const handleApplyPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth(); // 0-based

    let fromStr = '';
    let toStr = '';

    if (presetKey === 'today') {
      const d = String(now.getDate()).padStart(2, '0');
      const mStr = String(now.getMonth() + 1).padStart(2, '0');
      fromStr = `${y}-${mStr}-${d}`;
      toStr = fromStr;
    } else if (presetKey === 'yesterday') {
      const yest = new Date(now);
      yest.setDate(yest.getDate() - 1);
      const d = String(yest.getDate()).padStart(2, '0');
      const mStr = String(yest.getMonth() + 1).padStart(2, '0');
      fromStr = `${yest.getFullYear()}-${mStr}-${d}`;
      toStr = fromStr;
    } else if (presetKey === 'this_week') {
      const first = now.getDate() - now.getDay();
      const firstDay = new Date(now.setDate(first));
      const lastDay = new Date(now.setDate(first + 6));
      fromStr = firstDay.toISOString().split('T')[0];
      toStr = lastDay.toISOString().split('T')[0];
    } else if (presetKey === 'this_month') {
      const mStr = String(m + 1).padStart(2, '0');
      const last = new Date(y, m + 1, 0).getDate();
      fromStr = `${y}-${mStr}-01`;
      toStr = `${y}-${mStr}-${String(last).padStart(2, '0')}`;
      setSelectedMonth(m + 1);
      setSelectedYear(y);
    } else if (presetKey === 'last_month') {
      const prevM = m === 0 ? 11 : m - 1;
      const prevY = m === 0 ? y - 1 : y;
      const mStr = String(prevM + 1).padStart(2, '0');
      const last = new Date(prevY, prevM + 1, 0).getDate();
      fromStr = `${prevY}-${mStr}-01`;
      toStr = `${prevY}-${mStr}-${String(last).padStart(2, '0')}`;
      setSelectedMonth(prevM + 1);
      setSelectedYear(prevY);
    } else if (presetKey === 'oct_2026') {
      fromStr = `2026-10-01`;
      toStr = `2026-10-31`;
      setSelectedMonth(10);
      setSelectedYear(2026);
    } else if (presetKey === 'nov_2026') {
      fromStr = `2026-11-01`;
      toStr = `2026-11-30`;
      setSelectedMonth(11);
      setSelectedYear(2026);
    } else if (presetKey === 'last_30_days') {
      const past30 = new Date(now);
      past30.setDate(past30.getDate() - 30);
      fromStr = past30.toISOString().split('T')[0];
      toStr = now.toISOString().split('T')[0];
    }

    if (fromStr && toStr) {
      setStartDate(fromStr);
      setEndDate(toStr);
      loadEmployeeAttendance(fromStr, toStr);
    }
  };

  // Month / Year Change
  const handleMonthYearChange = (m: number, yr: number) => {
    setSelectedMonth(m);
    setSelectedYear(yr);
    setActivePreset('custom');
    const mStr = String(m).padStart(2, '0');
    const lastDay = new Date(yr, m, 0).getDate();
    const fromStr = `${yr}-${mStr}-01`;
    const toStr = `${yr}-${mStr}-${String(lastDay).padStart(2, '0')}`;
    setStartDate(fromStr);
    setEndDate(toStr);
    loadEmployeeAttendance(fromStr, toStr);
  };

  // Filtered Days
  const filteredDays = useMemo(() => {
    if (!data?.days) return [];
    return data.days.filter((day: any) => {
      // Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'MISSING') {
          if (!day.isMissingPunch) return false;
        } else if (statusFilter === 'LATE') {
          if (day.status !== 'Late' && (day.lateMinutes || 0) <= 0) return false;
        } else if (day.status !== statusFilter) {
          return false;
        }
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDate = day.date?.toLowerCase().includes(q) || day.dateFormatted?.toLowerCase().includes(q);
        const matchDay = day.dayName?.toLowerCase().includes(q);
        const matchRemarks = day.remarks?.toLowerCase().includes(q);
        const matchStatus = day.status?.toLowerCase().includes(q);
        if (!matchDate && !matchDay && !matchRemarks && !matchStatus) return false;
      }

      return true;
    });
  }, [data?.days, statusFilter, searchQuery]);

  // Raw Punches for Selected Date
  const rawPunchesForSelectedDate = useMemo(() => {
    if (!selectedRawPunchDate || !data?.punchLogs) return [];
    return data.punchLogs.filter((p: any) => {
      const pDate = p.punch_date || p.punchDate || '';
      return pDate === selectedRawPunchDate || pDate.includes(selectedRawPunchDate);
    });
  }, [selectedRawPunchDate, data?.punchLogs]);

  // Export to CSV Function
  const handleExportCSV = () => {
    if (!data || !filteredDays.length) return;
    const emp = data.employee;
    const period = data.period;

    const headers = [
      'Date',
      'Day',
      'Shift',
      'First IN',
      'Last OUT',
      'Punch Count',
      'Total Hours',
      'Late Minutes',
      'Overtime Hours',
      'Attendance Status',
      'Remarks',
      'Source'
    ];

    const rows = filteredDays.map((d: any) => [
      d.dateFormatted || d.date,
      d.dayName,
      `"${d.shift}"`,
      d.firstIn || '--:--',
      d.lastOut || '--:--',
      d.punchCount || 0,
      d.totalHours || 0,
      d.lateMinutes || 0,
      d.overtimeHours || 0,
      `"${d.status}"`,
      `"${d.remarks || ''}"`,
      `"${d.source || ''}"`
    ]);

    const metadata = [
      ['UMA TECHNO FAB MANUFACTURING ERP — EMPLOYEE ATTENDANCE STATEMENT'],
      ['Employee Name:', `"${emp.name}"`, 'Employee Code:', emp.id],
      ['Department:', `"${emp.department}"`, 'Designation:', `"${emp.designation}"`],
      ['Reporting Period:', `${period.fromDate} to ${period.toDate}`],
      ['Generated On:', new Date().toLocaleString()],
      [],
      headers
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      metadata.map((row: any[]) => row.join(',')).join('\n') +
      '\n' +
      rows.map((row: any[]) => row.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Attendance_${emp.name.replace(/\s+/g, '_')}_${period.fromDate}_to_${period.toDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 print:p-0 print:m-0 print:max-w-none">
      {/* ============================================================== */}
      {/* 1. TOP NAVIGATION & BACK BUTTON (Hidden on Print)               */}
      {/* ============================================================== */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link
          href="/hr/attendance"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs transition"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Attendance Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadEmployeeAttendance()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PRINT-ONLY COMPANY HEADER (Visible on Print)                   */}
      {/* ============================================================== */}
      <div className="hidden print:block border-b-2 border-slate-800 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">UMA TECHNO FAB</h1>
            <p className="text-xs text-slate-500 font-medium">
              Precision Engineering &amp; Fabrication Solutions • Vadodara, Gujarat
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm font-black uppercase tracking-wider text-amber-800 block">
              Official Attendance Statement
            </span>
            <span className="text-xs text-slate-500">
              Period: {data?.period?.fromDate} to {data?.period?.toDate}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. EMPLOYEE PROFILE HEADER CARD                                */}
      {/* ============================================================== */}
      {data?.employee && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Avatar + Identification */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white font-black text-2xl flex items-center justify-center shadow-md border-2 border-amber-200 shrink-0">
                {data.employee.name?.charAt(0) || 'U'}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-black text-slate-900">{data.employee.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {data.employee.status}
                  </span>
                  {data.biometricMapping?.machineEmpCode ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                      <Fingerprint className="w-3 h-3 text-blue-600" />
                      Machine Code: {data.biometricMapping.machineEmpCode}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      Unmapped Biometric
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                  <span className="font-semibold text-slate-700">ID: {data.employee.id}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <Building className="w-3.5 h-3.5 text-slate-400" /> {data.employee.department || 'General'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {data.employee.designation || 'Staff'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                  <span>
                    Shift: <strong className="text-slate-700">{data.employee.shiftName}</strong> ({data.employee.shiftStartTime} - {data.employee.shiftEndTime})
                  </span>
                  <span>•</span>
                  <span>
                    Joined: <strong className="text-slate-700">{data.employee.joiningDate || '01/01/2024'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Manager: <strong className="text-slate-700">{data.employee.reportingManager || 'Management'}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Selected Period Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-center min-w-[220px]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Attendance Period
              </span>
              <span className="text-base font-black text-slate-900 mt-0.5">
                {new Date(data.period.fromDate).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}{' '}
                —{' '}
                {new Date(data.period.toDate).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span className="text-xs text-amber-700 font-semibold mt-1">
                {data.period.totalCalendarDays} Total Days Selected
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. ADVANCED DATE & ATTENDANCE FILTERS (Hidden on Print)        */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-700" />
            <h3 className="text-sm font-bold text-slate-900">Attendance Period &amp; Custom Filters</h3>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleApplyPreset('this_month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activePreset === 'this_month'
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              This Month
            </button>

            <button
              onClick={() => handleApplyPreset('last_month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activePreset === 'last_month'
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Last Month
            </button>

            <button
              onClick={() => handleApplyPreset('oct_2026')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activePreset === 'oct_2026'
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              October 2026
            </button>

            <button
              onClick={() => handleApplyPreset('nov_2026')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activePreset === 'nov_2026'
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              November 2026
            </button>

            <button
              onClick={() => handleApplyPreset('last_30_days')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activePreset === 'last_30_days'
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Last 30 Days
            </button>

            <button
              onClick={() => handleApplyPreset('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activePreset === 'today'
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Today
            </button>
          </div>
        </div>

        {/* Detailed Controls: Month/Year Dropdowns, Custom Range Inputs, Status Filter, Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1 text-xs">
          {/* Month Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Select Month</label>
            <select
              value={selectedMonth}
              onChange={e => handleMonthYearChange(Number(e.target.value), selectedYear)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value={1}>January</option>
              <option value={2}>February</option>
              <option value={3}>March</option>
              <option value={4}>April</option>
              <option value={5}>May</option>
              <option value={6}>June</option>
              <option value={7}>July</option>
              <option value={8}>August</option>
              <option value={9}>September</option>
              <option value={10}>October</option>
              <option value={11}>November</option>
              <option value={12}>December</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => {
                setStartDate(e.target.value);
                setActivePreset('custom');
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e => {
                setEndDate(e.target.value);
                setActivePreset('custom');
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Attendance Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="Present">Present Only</option>
              <option value="Absent">Absent Only</option>
              <option value="LATE">Late Coming Only</option>
              <option value="Half Day">Half Day Only</option>
              <option value="On Leave">On Leave Only</option>
              <option value="Weekly Off">Weekly Off (Sunday)</option>
              <option value="Holiday">Holidays</option>
              <option value="MISSING">Missing IN/OUT Punches</option>
            </select>
          </div>

          {/* Apply Filter Button */}
          <div className="flex items-end">
            <button
              onClick={() => loadEmployeeAttendance(startDate, endDate)}
              disabled={loading}
              className="w-full px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer h-[38px]"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{loading ? 'Loading...' : 'Apply Date Range'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. SUMMARY KPI METRIC CARDS                                    */}
      {/* ============================================================== */}
      {data?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Calendar Days
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {data.summary.totalDays}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {data.summary.workingDays} Working Days
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
              Present Days
            </span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {data.summary.presentDays}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">On-Duty Punched</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs bg-rose-50/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block">
              Absent Days
            </span>
            <span className="text-2xl font-black text-rose-700 mt-1 block">
              {data.summary.absentDays}
            </span>
            <span className="text-[11px] text-rose-600 font-medium">Zero Punch Recorded</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
              Late Coming
            </span>
            <span className="text-2xl font-black text-amber-700 mt-1 block">
              {data.summary.lateDays}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">Beyond Grace Period</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs bg-blue-50/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
              Weekly Offs &amp; Leaves
            </span>
            <span className="text-2xl font-black text-blue-700 mt-1 block">
              {data.summary.weeklyOffDays + data.summary.leaveDays}
            </span>
            <span className="text-[11px] text-blue-600 font-medium">
              {data.summary.weeklyOffDays} Sundays • {data.summary.leaveDays} Leaves
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs bg-purple-50/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 block">
              Total Hours Worked
            </span>
            <span className="text-2xl font-black text-purple-800 mt-1 block">
              {data.summary.totalWorkingHours}
            </span>
            <span className="text-[11px] text-purple-600 font-medium">
              {data.summary.totalOvertimeHours} hrs Overtime
            </span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. DAY-BY-DAY ATTENDANCE LOGS TABLE                            */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls (Search & Counter) */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Daily Punch Records ({filteredDays.length} Days)
            </h3>
            {statusFilter !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Filtered: {statusFilter}
              </span>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search date, status, remarks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Day</th>
                <th className="py-3.5 px-4">Shift Details</th>
                <th className="py-3.5 px-4">First IN</th>
                <th className="py-3.5 px-4">Last OUT</th>
                <th className="py-3.5 px-4">Punches</th>
                <th className="py-3.5 px-4">Work Hours</th>
                <th className="py-3.5 px-4">Late Mins</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Remarks / Notes</th>
                <th className="py-3.5 px-4 text-right print:hidden">Raw Punches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredDays.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span className="font-bold text-slate-600 block">No attendance records found</span>
                    <span className="text-[11px]">Try adjusting your date range or status filters.</span>
                  </td>
                </tr>
              ) : (
                filteredDays.map((day: any) => {
                  const isPresent = day.status === 'Present';
                  const isLate = day.status === 'Late' || day.lateMinutes > 0;
                  const isAbsent = day.status === 'Absent';
                  const isLeave = day.isLeave || day.status.includes('Leave');
                  const isWeeklyOff = day.isWeeklyOff || day.status === 'Weekly Off';
                  const isHoliday = day.isHoliday || day.status === 'Holiday';

                  return (
                    <tr
                      key={day.date}
                      className={`hover:bg-slate-50/70 transition ${
                        isWeeklyOff ? 'bg-slate-50/40 text-slate-500' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {day.dateFormatted || day.date}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{day.dayName}</td>
                      <td className="py-3 px-4">
                        <span className="text-slate-600 font-medium text-[11px] block">{day.shift}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {day.shiftStartTime} - {day.shiftEndTime}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {day.firstIn ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                            {day.firstIn}
                          </span>
                        ) : (
                          <span className="text-slate-400">--:--</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {day.lastOut ? (
                          <span className="text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                            {day.lastOut}
                          </span>
                        ) : (
                          <span className="text-slate-400">--:--</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                          {day.punchCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {day.totalHours > 0 ? `${day.totalHours} hrs` : '--'}
                      </td>
                      <td className="py-3 px-4">
                        {day.lateMinutes > 0 ? (
                          <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[11px]">
                            +{day.lateMinutes} m
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isPresent && !isLate
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : isLate
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : isLeave
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : isWeeklyOff
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : isHoliday
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {day.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {day.remarks || (isWeeklyOff ? 'Sunday' : '--')}
                        {day.isMissingPunch && (
                          <span className="text-rose-600 font-bold block text-[10px] mt-0.5">
                            ⚠️ Missing Checkout Punch
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right print:hidden">
                        <button
                          onClick={() => setSelectedRawPunchDate(day.date)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition cursor-pointer"
                        >
                          View Logs
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 6. RAW BIOMETRIC PUNCH LOGS MODAL                              */}
      {/* ============================================================== */}
      {selectedRawPunchDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Raw Biometric Punches
                </h3>
                <p className="text-xs text-slate-500 font-mono">Date: {selectedRawPunchDate}</p>
              </div>
              <button
                onClick={() => setSelectedRawPunchDate(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {rawPunchesForSelectedDate.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No individual raw punch logs recorded on the hardware for this date.
                </div>
              ) : (
                rawPunchesForSelectedDate.map((p: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900 block">
                        {p.punch_datetime || p.punchDatetime || 'Timestamp N/A'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Device ID: {p.machine_id || p.machineId || 'Main Biometric Device'}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        (p.m_flag || p.punchDirection) === 'IN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {p.m_flag || p.punchDirection || 'PUNCH'}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRawPunchDate(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. PRINT-ONLY FOOTER SIGNATURES (Visible on Print)             */}
      {/* ============================================================== */}
      <div className="hidden print:block pt-12 mt-12 border-t border-slate-300 text-xs">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="border-b border-slate-400 h-12 mb-2" />
            <span className="font-bold text-slate-800">Employee Signature</span>
          </div>
          <div>
            <div className="border-b border-slate-400 h-12 mb-2" />
            <span className="font-bold text-slate-800">HR / Department Head</span>
          </div>
          <div>
            <div className="border-b border-slate-400 h-12 mb-2" />
            <span className="font-bold text-slate-800">Authorised Signatory</span>
          </div>
        </div>
      </div>
    </div>
  );
}
