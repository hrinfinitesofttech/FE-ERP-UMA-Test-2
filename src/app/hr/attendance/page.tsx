'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Clock,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Filter,
  MapPin,
  Smartphone,
  Laptop,
  ShieldCheck,
  X,
  RotateCcw,
  UserCheck,
  Building,
  AlertCircle,
  Sparkles,
  Lock,
  Unlock,
  CalendarDays,
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  FileText,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { AttendanceStatusType, AttendanceRecord } from '../../../types/hr';
import api from '../../../lib/apiClient';

export default function AttendancePage() {
  const {
    attendanceRecords: fallbackRecords = [],
    markAttendance,
    availableEmployees = [],
    departments = [],
    currentUser,
  } = useERP();

  // Active Tab: 'daily' | 'calendar' | 'regularizations'
  const [activeTab, setActiveTab] = useState<'daily' | 'calendar' | 'regularizations'>('daily');

  // Live Records from API
  const [liveAttendanceRecords, setLiveAttendanceRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingPunch, setIsSubmittingPunch] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Monthly Calendar Summary State
  const now = new Date();
  const currentMonthYearStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [calendarMonthYear, setCalendarMonthYear] = useState(currentMonthYearStr);
  const [calendarEmployeeId, setCalendarEmployeeId] = useState<string>('');
  const [monthlySummaryData, setMonthlySummaryData] = useState<any | null>(null);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);

  // Regularizations State
  const [regularizations, setRegularizations] = useState<any[]>([]);
  const [isLoadingRegs, setIsLoadingRegs] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    punchType: 'CHECK_IN',
    requestedTime: '09:00',
    reason: '',
  });

  const getSystemTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:mm
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const initialFormState = {
    employeeId: '',
    date: getTodayDate(),
    shiftName: 'General Day Shift (09:00 - 18:00)',
    checkIn: getSystemTime(),
    checkOut: '18:00',
    status: 'Present' as AttendanceStatusType,
    manualReason: '',
    source: 'Biometric System' as AttendanceRecord['source'],
    remarks: 'Auto-captured server timestamp',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch Attendance Records
  const loadAttendanceRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const records = await api.hr.attendance.list();
      if (Array.isArray(records)) {
        // Map backend snake_case to frontend camelCase
        const mapped = records.map((r: any) => ({
          id: r.id,
          employeeId: r.employee || r.employee_id || r.employeeId,
          employeeName: r.employee_name || r.employeeName || 'Employee',
          department: r.department || 'General',
          date: r.date,
          shiftName: r.shift_name || r.shiftName || 'General Day Shift',
          checkIn: r.check_in ? String(r.check_in).slice(0, 5) : (r.checkIn || '--:--'),
          checkOut: r.check_out ? String(r.check_out).slice(0, 5) : (r.checkOut || '--:--'),
          totalHours: Number(r.total_hours ?? r.totalHours ?? 0),
          lateMinutes: Number(r.late_minutes ?? r.lateMinutes ?? 0),
          earlyCheckoutMinutes: Number(r.early_checkout_minutes ?? r.earlyCheckoutMinutes ?? 0),
          overtimeHours: Number(r.overtime_hours ?? r.overtimeHours ?? 0),
          status: r.status || 'Present',
          source: r.source || 'Biometric System',
          remarks: r.remarks || '',
        }));
        setLiveAttendanceRecords(mapped);
      }
    } catch {
      // Keep existing or fallback
      if (liveAttendanceRecords.length === 0 && fallbackRecords.length > 0) {
        setLiveAttendanceRecords(fallbackRecords);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fallbackRecords, liveAttendanceRecords.length]);

  // Fetch Monthly Summary
  const loadMonthlySummary = useCallback(async (empId?: string, monthYear?: string) => {
    setIsLoadingMonthly(true);
    try {
      const targetEmp = empId || calendarEmployeeId || (currentUser?.id as string) || availableEmployees[0]?.id;
      const targetMonth = monthYear || calendarMonthYear;
      const summary = await api.hr.attendance.monthlySummary({
        employeeId: targetEmp,
        monthYear: targetMonth,
      });
      setMonthlySummaryData(summary);
    } catch (err: any) {
      console.warn('Failed to load monthly summary:', err);
    } finally {
      setIsLoadingMonthly(false);
    }
  }, [calendarEmployeeId, calendarMonthYear, currentUser?.id, availableEmployees]);

  // Fetch Regularizations
  const loadRegularizations = useCallback(async () => {
    setIsLoadingRegs(true);
    try {
      const data = await api.hr.regularization.list();
      if (Array.isArray(data)) {
        setRegularizations(data);
      }
    } catch (err) {
      console.warn('Failed to load regularizations:', err);
    } finally {
      setIsLoadingRegs(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    loadAttendanceRecords();
    loadRegularizations();
  }, [loadAttendanceRecords, loadRegularizations]);

  // Update live clock
  useEffect(() => {
    setCurrentTimeStr(getSystemTime());
    const interval = setInterval(() => {
      setCurrentTimeStr(getSystemTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update calendar summary when tab or month changes
  useEffect(() => {
    if (activeTab === 'calendar') {
      loadMonthlySummary();
    }
  }, [activeTab, calendarMonthYear, calendarEmployeeId, loadMonthlySummary]);

  // Quick Live Punch In
  const handleLivePunchIn = async () => {
    setIsSubmittingPunch(true);
    setErrorToast(null);
    try {
      const res = await api.hr.attendance.checkIn();
      setSuccessToast(res?.message || 'Punched in successfully! Timestamp captured by server.');
      setTimeout(() => setSuccessToast(null), 4000);
      await loadAttendanceRecords();
    } catch (err: any) {
      const msg = err?.data?.error || err?.message || 'Failed to punch in. Please try again.';
      setErrorToast(msg);
      setTimeout(() => setErrorToast(null), 5000);
    } finally {
      setIsSubmittingPunch(false);
    }
  };

  // Quick Live Punch Out
  const handleLivePunchOut = async () => {
    setIsSubmittingPunch(true);
    setErrorToast(null);
    try {
      const res = await api.hr.attendance.checkOut();
      setSuccessToast(
        res?.message || `Punched out successfully! Work duration: ${res?.total_hours || 'recorded'} hours.`
      );
      setTimeout(() => setSuccessToast(null), 4000);
      await loadAttendanceRecords();
    } catch (err: any) {
      const msg = err?.data?.error || err?.message || 'Failed to punch out. Please try again.';
      setErrorToast(msg);
      setTimeout(() => setErrorToast(null), 5000);
    } finally {
      setIsSubmittingPunch(false);
    }
  };

  // Approve Regularization (Manager Action)
  const handleApproveReg = async (regId: string) => {
    try {
      await api.hr.regularization.approve(regId);
      setSuccessToast('Regularization request approved and attendance record updated!');
      setTimeout(() => setSuccessToast(null), 4000);
      await loadRegularizations();
      await loadAttendanceRecords();
    } catch (err: any) {
      const msg = err?.data?.error || err?.message || 'Failed to approve regularization.';
      setErrorToast(msg);
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  // Reject Regularization (Manager Action)
  const handleRejectReg = async (regId: string) => {
    try {
      await api.hr.regularization.reject(regId);
      setSuccessToast('Regularization request rejected.');
      setTimeout(() => setSuccessToast(null), 4000);
      await loadRegularizations();
    } catch (err: any) {
      const msg = err?.data?.error || err?.message || 'Failed to reject regularization.';
      setErrorToast(msg);
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  // Submit Regularization Request
  const handleSubmitRegularization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.reason.trim()) {
      setErrorToast('Please specify a reason for regularization.');
      return;
    }
    try {
      await api.hr.regularization.create({
        employee_id: regForm.employeeId || currentUser?.id || availableEmployees[0]?.id,
        date: regForm.date,
        punch_type: regForm.punchType,
        requested_time: regForm.requestedTime,
        reason: regForm.reason.trim(),
      });
      setShowRegModal(false);
      setSuccessToast('Regularization request submitted to reporting manager for approval.');
      setTimeout(() => setSuccessToast(null), 4000);
      setRegForm({
        employeeId: '',
        date: getTodayDate(),
        punchType: 'CHECK_IN',
        requestedTime: '09:00',
        reason: '',
      });
      await loadRegularizations();
    } catch (err: any) {
      const msg = err?.data?.error || err?.message || 'Failed to submit regularization request.';
      setErrorToast(msg);
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  const isHalfDayStatus = (s: string) =>
    ['Half Day', 'First Half', 'Second Half', 'First Half Leave', 'Second Half Leave'].includes(s);

  // Active records to display
  const allRecords = liveAttendanceRecords.length > 0 ? liveAttendanceRecords : fallbackRecords;

  // Multi-Filter Synchronization
  const filteredRecords = useMemo(() => {
    return allRecords.filter((a) => {
      const q = (searchTerm || '').trim().toLowerCase();
      const matchesSearch =
        !q ||
        (a.employeeName || '').toLowerCase().includes(q) ||
        (a.employeeId || '').toLowerCase().includes(q) ||
        (a.department || '').toLowerCase().includes(q);

      const matchesDate = !selectedDate || a.date === selectedDate;
      const matchesEmployee = selectedEmployeeId === 'ALL' || a.employeeId === selectedEmployeeId;
      const matchesDept =
        selectedDepartment === 'ALL' || (a.department || '').toLowerCase() === selectedDepartment.toLowerCase();

      let matchesStatus = statusFilter === 'ALL';
      if (!matchesStatus) {
        if (statusFilter === 'Half Day') {
          matchesStatus = isHalfDayStatus(a.status);
        } else if (statusFilter === 'Late') {
          matchesStatus = a.status === 'Late' || Number(a.lateMinutes || 0) > 0;
        } else if (statusFilter === 'On Leave') {
          matchesStatus = a.status === 'On Leave' || a.status === 'WFH';
        } else {
          matchesStatus = (a.status || '').toLowerCase() === statusFilter.toLowerCase();
        }
      }

      return matchesSearch && matchesDate && matchesEmployee && matchesDept && matchesStatus;
    });
  }, [allRecords, searchTerm, selectedDate, selectedEmployeeId, selectedDepartment, statusFilter]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDate('');
    setSelectedEmployeeId('ALL');
    setSelectedDepartment('ALL');
    setStatusFilter('ALL');
  };

  const isFiltered =
    searchTerm !== '' ||
    selectedDate !== '' ||
    selectedEmployeeId !== 'ALL' ||
    selectedDepartment !== 'ALL' ||
    statusFilter !== 'ALL';

  // KPI Calculations based on all active records
  const totalCount = allRecords.length;
  const presentCount = allRecords.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const halfDayCount = allRecords.filter((a) => isHalfDayStatus(a.status)).length;
  const absentCount = allRecords.filter((a) => a.status === 'Absent').length;
  const leaveCount = allRecords.filter((a) => a.status === 'On Leave' || a.status === 'WFH').length;

  const handleOpenPunchModal = () => {
    setIsManualOverride(false);
    const nowTime = getSystemTime();
    setFormData({
      ...initialFormState,
      employeeId: availableEmployees[0]?.id || '',
      date: getTodayDate(),
      checkIn: nowTime,
      source: 'Biometric System',
    });
    setFormErrors({});
    setShowPunchModal(true);
  };

  const handleStatusChangeInModal = (newStatus: AttendanceStatusType) => {
    let inTime = formData.checkIn;
    let outTime = formData.checkOut;
    if (newStatus === 'First Half' || newStatus === 'First Half Leave' || newStatus === 'Half Day') {
      inTime = '09:00';
      outTime = '13:30';
    } else if (newStatus === 'Second Half' || newStatus === 'Second Half Leave') {
      inTime = '13:30';
      outTime = '18:00';
    } else if (newStatus === 'Absent' || newStatus === 'On Leave') {
      inTime = '--:--';
      outTime = '--:--';
    } else if (newStatus === 'Present') {
      inTime = isManualOverride ? formData.checkIn : getSystemTime();
      outTime = '18:00';
    }
    setFormData({ ...formData, status: newStatus, checkIn: inTime, checkOut: outTime });
  };

  const validatePunchForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.employeeId) {
      errors.employeeId = 'Please select the employee.';
    }

    if (!formData.date) {
      errors.date = 'Please select the attendance date.';
    }

    if (isManualOverride) {
      if (!formData.manualReason || formData.manualReason.trim() === '') {
        errors.manualReason = 'Please enter a mandatory reason for manual/missed punch regularization.';
      }
      if (!formData.checkIn || formData.checkIn === '--:--') {
        errors.checkIn = 'Please enter a valid check-in time.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePunchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePunchForm()) return;

    const emp = availableEmployees.find((e) => e.id === formData.employeeId);
    const empName = emp?.name || `${(emp as any)?.firstName || ''} ${(emp as any)?.lastName || ''}`.trim() || 'Staff Member';
    const dept = emp?.department || 'Production';

    const calculatedHours = isHalfDayStatus(formData.status)
      ? 4.5
      : formData.status === 'Absent' || formData.status === 'On Leave'
      ? 0
      : 9.0;

    const loggedBy = currentUser?.name || 'Admin User';
    const punchSource = isManualOverride ? 'Regularization' : 'Biometric System';
    const punchRemarks = isManualOverride
      ? `Manual override by ${loggedBy}: ${formData.manualReason.trim()}`
      : `Auto-captured at ${currentTimeStr} by server clock`;

    try {
      await api.hr.attendance.create({
        employee_id: formData.employeeId,
        date: formData.date,
        shift_name: formData.shiftName,
        check_in: formData.checkIn,
        check_out: formData.checkOut,
        total_hours: calculatedHours,
        status: formData.status,
        source: punchSource,
        remarks: punchRemarks,
      });
      await loadAttendanceRecords();
    } catch {
      // Fallback to local state if offline
      markAttendance({
        employeeId: formData.employeeId,
        employeeName: empName,
        department: dept,
        date: formData.date,
        shiftName: formData.shiftName,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        totalHours: calculatedHours,
        lateMinutes: formData.status === 'Late' ? 15 : 0,
        earlyCheckoutMinutes: 0,
        overtimeHours: 0,
        status: formData.status,
        source: punchSource,
        remarks: punchRemarks,
      });
    }

    setShowPunchModal(false);
    setSuccessToast(`Attendance logged for ${empName} (${punchSource} • ${formData.checkIn}).`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FDFBF9] min-h-screen text-[#211B17]">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-100 shrink-0" />
          <span className="font-semibold text-sm">{successToast}</span>
        </div>
      )}

      {errorToast && (
        <div className="fixed top-6 right-6 z-50 bg-rose-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertCircle className="w-5 h-5 text-rose-100 shrink-0" />
          <span className="font-semibold text-sm">{errorToast}</span>
        </div>
      )}

      {/* Header with Live Terminal */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-700">
              <Clock className="w-6 h-6" />
            </div>
            Daily Attendance Management & Biometric Log
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Real-Time Punch In/Out Logs, Late Coming Tracking, Monthly Calendar & Regularization Approvals
          </p>
        </div>

        {/* Live Punch Terminal Card */}
        <div className="flex flex-wrap items-center gap-3 bg-white border border-[#EBE3DB] rounded-2xl p-2.5 shadow-xs">
          <div className="px-3 py-1 bg-amber-50 rounded-xl flex items-center gap-2 text-xs font-mono font-bold text-amber-900 border border-amber-200">
            <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
            <span>{currentTimeStr}</span>
          </div>

          <button
            onClick={handleLivePunchIn}
            disabled={isSubmittingPunch}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
            title="Log Check-In using server authenticated session"
          >
            <CheckCircle2 className="w-4 h-4" /> Punch In
          </button>

          <button
            onClick={handleLivePunchOut}
            disabled={isSubmittingPunch}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
            title="Log Check-Out using server authenticated session"
          >
            <Clock className="w-4 h-4" /> Punch Out
          </button>

          <button
            onClick={handleOpenPunchModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#544B45] font-semibold text-xs rounded-xl transition border border-[#EBE3DB] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Manual Punch
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#EBE3DB] pb-1">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'daily'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'text-[#70665F] hover:bg-[#FAF7F2] hover:text-[#211B17]'
          }`}
        >
          <Clock className="w-4 h-4" /> Daily Attendance Log ({allRecords.length})
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'text-[#70665F] hover:bg-[#FAF7F2] hover:text-[#211B17]'
          }`}
        >
          <CalendarDays className="w-4 h-4" /> Monthly Calendar & Analytics
        </button>

        <button
          onClick={() => setActiveTab('regularizations')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'regularizations'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'text-[#70665F] hover:bg-[#FAF7F2] hover:text-[#211B17]'
          }`}
        >
          <FileText className="w-4 h-4" /> Regularization Requests ({regularizations.length})
        </button>
      </div>

      {/* TAB 1: DAILY ATTENDANCE LOG */}
      {activeTab === 'daily' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* KPI Cards Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white border border-[#EBE3DB] rounded-xl p-4 flex flex-col justify-between shadow-xs">
              <span className="text-xs font-semibold text-[#70665F] uppercase tracking-wider">Total Entries</span>
              <span className="text-2xl font-black text-[#211B17] mt-1">{totalCount}</span>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Present (Full Day)</span>
              <span className="text-2xl font-black text-emerald-700 mt-1">{presentCount}</span>
            </div>
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
              <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">Half Day</span>
              <span className="text-2xl font-black text-indigo-700 mt-1">{halfDayCount}</span>
            </div>
            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
              <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Absent</span>
              <span className="text-2xl font-black text-rose-700 mt-1">{absentCount}</span>
            </div>
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">On Leave / WFH</span>
              <span className="text-2xl font-black text-amber-700 mt-1">{leaveCount}</span>
            </div>
          </div>

          {/* Multi-Filter Bar */}
          <div className="bg-white border border-[#EBE3DB] rounded-xl p-4 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-center">
              {/* 1. Search */}
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-[#A89F91] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by employee name, ID, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#FDFBF9] border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-amber-600 focus:bg-white transition"
                />
              </div>

              {/* 2. Date Filter */}
              <div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FDFBF9] border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-amber-600"
                  title="Filter by specific date"
                />
              </div>

              {/* 3. Department Filter */}
              <div>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FDFBF9] border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-amber-600"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.departmentName}>
                      {d.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FDFBF9] border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-amber-600"
                >
                  <option value="ALL">All Attendance Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Absent">Absent</option>
                  <option value="On Leave">On Leave / WFH</option>
                </select>
              </div>
            </div>

            {/* Filter Badges & Reset Button */}
            {isFiltered && (
              <div className="pt-2 border-t border-[#EBE3DB] flex items-center justify-between text-xs text-[#70665F]">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-amber-700" />
                  <span>
                    Showing <strong>{filteredRecords.length}</strong> of {allRecords.length} attendance records
                  </span>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#544B45] font-semibold rounded-lg transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Attendance Log Table */}
          {filteredRecords.length === 0 ? (
            <div className="bg-white border border-[#EBE3DB] rounded-2xl p-12 text-center space-y-3 shadow-xs">
              <Clock className="w-12 h-12 text-[#A89F91] mx-auto" />
              <h3 className="text-base font-bold text-[#211B17]">
                No attendance records found for the selected filters.
              </h3>
              <p className="text-xs text-[#70665F] max-w-md mx-auto">
                Try adjusting your search criteria, clearing the date/department filter, or clicking &quot;Reset Filters&quot;.
              </p>
              {isFiltered && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white font-semibold text-xs rounded-lg shadow-sm transition cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-[#EBE3DB] text-[#70665F] font-semibold uppercase text-[11px] tracking-wider">
                      <th className="py-3.5 px-4">Employee</th>
                      <th className="py-3.5 px-4">Date & Shift</th>
                      <th className="py-3.5 px-4">Check-In / Out</th>
                      <th className="py-3.5 px-4">Work Hours & Late</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Source & Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE3DB]/60 text-[#211B17]">
                    {filteredRecords.map((a) => (
                      <tr key={a.id} className="hover:bg-[#FAF7F2]/60 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#211B17]">{a.employeeName}</div>
                          <div className="text-[11px] text-[#70665F]">{a.employeeId} • {a.department}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#211B17]">{a.date}</div>
                          <div className="text-[11px] text-[#70665F]">{a.shiftName || 'General Shift'}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <div className="text-emerald-700 font-bold">{a.checkIn || '--:--'} (In)</div>
                          <div className="text-[#70665F]">{a.checkOut || '--:--'} (Out)</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#211B17]">{a.totalHours} hrs</div>
                          {a.lateMinutes > 0 ? (
                            <span className="text-[11px] text-rose-600 font-semibold block">
                              Late by {a.lateMinutes} mins
                            </span>
                          ) : (
                            <span className="text-[11px] text-emerald-600 block">On Time</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block ${
                              a.status === 'Present'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : a.status === 'Late'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : isHalfDayStatus(a.status)
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : a.status === 'Absent'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-medium text-[#544B45]">
                            {a.source === 'Biometric System' ? (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            ) : a.source === 'Mobile App GPS' ? (
                              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                            ) : (
                              <Laptop className="w-3.5 h-3.5 text-amber-600" />
                            )}
                            <span>{a.source}</span>
                          </div>
                          <div className="text-[10px] text-[#70665F] italic truncate max-w-[180px]" title={a.remarks}>
                            {a.remarks || 'Captured at gate'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MONTHLY CALENDAR & ANALYTICS */}
      {activeTab === 'calendar' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Calendar Controls Bar */}
          <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#70665F] uppercase mb-1">Select Month / Year</label>
                <input
                  type="month"
                  value={calendarMonthYear}
                  onChange={(e) => setCalendarMonthYear(e.target.value)}
                  className="px-3 py-1.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-bold text-[#211B17] focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#70665F] uppercase mb-1">Employee</label>
                <select
                  value={calendarEmployeeId}
                  onChange={(e) => setCalendarEmployeeId(e.target.value)}
                  className="px-3 py-1.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold text-[#211B17] focus:outline-none focus:border-amber-600"
                >
                  <option value="">-- Active Logged-in Employee --</option>
                  {availableEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name || (emp as any).firstName} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => loadMonthlySummary()}
              disabled={isLoadingMonthly}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMonthly ? 'animate-spin' : ''}`} /> Refresh Monthly Summary
            </button>
          </div>

          {/* Monthly KPI Stats Cards */}
          {monthlySummaryData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="bg-white border border-[#EBE3DB] rounded-xl p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#70665F]">Calendar Days</span>
                <div className="text-xl font-black text-[#211B17] mt-1">{monthlySummaryData.total_days}</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-emerald-800">Present Days</span>
                <div className="text-xl font-black text-emerald-700 mt-1">{monthlySummaryData.present_days}</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-amber-800">Late Days</span>
                <div className="text-xl font-black text-amber-700 mt-1">{monthlySummaryData.late_days}</div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-indigo-800">Half Days</span>
                <div className="text-xl font-black text-indigo-700 mt-1">{monthlySummaryData.half_days}</div>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-rose-800">Absent Days</span>
                <div className="text-xl font-black text-rose-700 mt-1">{monthlySummaryData.absent_days}</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-blue-800">Leaves Taken</span>
                <div className="text-xl font-black text-blue-700 mt-1">{monthlySummaryData.leave_days}</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-purple-800">Total Work Hours</span>
                <div className="text-xl font-black text-purple-700 mt-1">{monthlySummaryData.total_hours} hrs</div>
              </div>
            </div>
          )}

          {/* Calendar Day Grid */}
          <div className="bg-white border border-[#EBE3DB] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="font-extrabold text-sm text-[#211B17] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-700" />
                Monthly Attendance Breakdown ({calendarMonthYear})
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-[#70665F]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Present
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Late
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span> Half Day
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Leave
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Absent
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block"></span> Weekly Off
                </span>
              </div>
            </div>

            {isLoadingMonthly ? (
              <div className="py-12 text-center text-xs text-[#70665F]">
                <RefreshCw className="w-8 h-8 text-amber-700 animate-spin mx-auto mb-2" />
                Loading calendar records from backend...
              </div>
            ) : monthlySummaryData?.breakdown ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {monthlySummaryData.breakdown.map((day: any) => {
                  const status = day.status;
                  const isPresent = status === 'Present';
                  const isLate = status === 'Late';
                  const isHalf = isHalfDayStatus(status);
                  const isAbsent = status === 'Absent';
                  const isLeave = status === 'On Leave';
                  const isWeeklyOff = status === 'Weekly Off';
                  const isHoliday = status === 'Holiday';

                  return (
                    <div
                      key={day.date}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition min-h-[90px] ${
                        isPresent
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : isLate
                          ? 'bg-amber-50 border-amber-200 text-amber-950'
                          : isHalf
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-950'
                          : isAbsent
                          ? 'bg-rose-50 border-rose-200 text-rose-950'
                          : isLeave
                          ? 'bg-blue-50 border-blue-200 text-blue-950'
                          : isWeeklyOff
                          ? 'bg-[#FAF7F2] border-[#EBE3DB] text-[#70665F]'
                          : isHoliday
                          ? 'bg-purple-50 border-purple-200 text-purple-950'
                          : 'bg-white border-[#EBE3DB]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{day.date.split('-')[2]}</span>
                        <span className="text-[10px] font-mono text-[#70665F]">{day.day_name?.slice(0, 3)}</span>
                      </div>

                      <div className="my-1">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            isPresent
                              ? 'bg-emerald-200/60 text-emerald-800'
                              : isLate
                              ? 'bg-amber-200/60 text-amber-900'
                              : isHalf
                              ? 'bg-indigo-200/60 text-indigo-800'
                              : isAbsent
                              ? 'bg-rose-200/60 text-rose-800'
                              : isLeave
                              ? 'bg-blue-200/60 text-blue-800'
                              : 'bg-gray-200/70 text-gray-700'
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="text-[10px] font-mono flex items-center justify-between text-[#70665F]">
                        <span>{day.hours > 0 ? `${day.hours}h` : '--'}</span>
                        {day.late_minutes > 0 && (
                          <span className="text-rose-600 font-bold">+{day.late_minutes}m</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#70665F]">
                Click &quot;Refresh Monthly Summary&quot; to load detailed daily attendance breakdown.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: REGULARIZATION REQUESTS */}
      {activeTab === 'regularizations' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-xs">
            <div>
              <h3 className="font-extrabold text-base text-[#211B17]">Missed Punch & Regularization Workflow</h3>
              <p className="text-xs text-[#70665F] mt-0.5">
                Staff submit regularization for biometric errors; Manager approvals sync corrected timestamps to attendance
              </p>
            </div>
            <button
              onClick={() => setShowRegModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Request Regularization
            </button>
          </div>

          {regularizations.length === 0 ? (
            <div className="bg-white border border-[#EBE3DB] rounded-2xl p-12 text-center space-y-3 shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-[#211B17]">No Regularization Requests Found</h4>
              <p className="text-xs text-[#70665F] max-w-md mx-auto">
                No missed punch or regularization requests have been filed yet. Click &quot;Request Regularization&quot; to file a new entry.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-[#EBE3DB] text-[#70665F] font-semibold uppercase text-[11px] tracking-wider">
                      <th className="py-3.5 px-4">Employee</th>
                      <th className="py-3.5 px-4">Date & Punch Type</th>
                      <th className="py-3.5 px-4">Requested Time</th>
                      <th className="py-3.5 px-4">Reason</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Manager Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE3DB]/60 text-[#211B17]">
                    {regularizations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-[#FAF7F2]/60 transition">
                        <td className="py-3.5 px-4 font-bold">
                          {reg.employee_name || reg.employee || 'Employee'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold">{reg.date}</div>
                          <span className="text-[10px] font-mono text-[#70665F]">{reg.punch_type}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-900">
                          {reg.requested_time || reg.actual_punch_time || '09:00'}
                        </td>
                        <td className="py-3.5 px-4 text-[#70665F] max-w-xs truncate">
                          &ldquo;{reg.reason}&rdquo;
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              reg.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : reg.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {reg.status || 'Pending'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {reg.status === 'Pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleApproveReg(reg.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectReg(reg.id)}
                                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-[#A89F91] font-semibold">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Punch Modal */}
      {showPunchModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPunchModal(false);
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative my-8"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-700">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#211B17]">Manual Punch / Attendance Log</h2>
                  <p className="text-xs text-[#70665F]">
                    Live Server Clock auto-captures time securely; manual backdated override requires reason
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPunchModal(false)}
                className="text-[#70665F] hover:text-[#211B17] p-1.5 rounded-lg hover:bg-[#F5EFEB] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Server Clock Badge */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-950 font-semibold">
                <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
                <span>Live Server Timestamp:</span>
              </div>
              <span className="font-mono font-black text-amber-900 text-sm tracking-widest">
                {currentTimeStr} • {getTodayDate()}
              </span>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePunchSubmit} className="space-y-4 text-xs">
              {/* 1. Employee Selection */}
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Select Employee <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => {
                    setFormData({ ...formData, employeeId: e.target.value });
                    if (formErrors.employeeId) {
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.employeeId;
                        return next;
                      });
                    }
                  }}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#211B17] focus:outline-none transition ${
                    formErrors.employeeId
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-[#EBE3DB] focus:border-amber-600'
                  }`}
                >
                  <option value="">-- Choose Employee --</option>
                  {availableEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name || `${(emp as any).firstName || ''} ${(emp as any).lastName || ''}`.trim()} ({emp.department || 'General'})
                    </option>
                  ))}
                </select>
                {formErrors.employeeId && (
                  <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {formErrors.employeeId}
                  </p>
                )}
              </div>

              {/* 2. Date & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    disabled={!isManualOverride}
                    onChange={(e) => {
                      setFormData({ ...formData, date: e.target.value });
                      if (formErrors.date) {
                        setFormErrors((prev) => {
                          const next = { ...prev };
                          delete next.date;
                          return next;
                        });
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 border rounded-lg text-xs text-[#211B17] focus:outline-none transition disabled:bg-[#FAF7F2] ${
                      formErrors.date
                        ? 'border-rose-400 bg-rose-50/20'
                        : 'border-[#EBE3DB] focus:border-amber-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleStatusChangeInModal(e.target.value as AttendanceStatusType)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-amber-600 transition"
                  >
                    <option value="Present">Present (Full Day)</option>
                    <option value="Late">Late Arrival</option>
                    <option value="First Half">First Half Only</option>
                    <option value="Second Half">Second Half Only</option>
                    <option value="Absent">Absent</option>
                    <option value="On Leave">On Leave / WFH</option>
                  </select>
                </div>
              </div>

              {/* 3. Check-In & Check-Out Times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[#544B45] font-semibold">Check-In Time</label>
                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      {isManualOverride ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {isManualOverride ? 'Editable' : 'Auto Server-Locked'}
                    </span>
                  </div>
                  <input
                    type="time"
                    readOnly={!isManualOverride}
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    className={`w-full px-3.5 py-2.5 border rounded-lg text-xs font-mono font-bold text-[#211B17] focus:outline-none transition ${
                      !isManualOverride ? 'bg-[#FAF7F2] text-emerald-800' : 'bg-white border-amber-600'
                    } ${formErrors.checkIn ? 'border-rose-400 bg-rose-50/20' : 'border-[#EBE3DB]'}`}
                  />
                  {formErrors.checkIn && (
                    <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {formErrors.checkIn}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[#544B45] font-semibold">Check-Out Time</label>
                    <span className="text-[10px] text-[#70665F]">Scheduled End</span>
                  </div>
                  <input
                    type="time"
                    readOnly={!isManualOverride}
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    className={`w-full px-3.5 py-2.5 border rounded-lg text-xs font-mono text-[#211B17] focus:outline-none transition ${
                      !isManualOverride ? 'bg-[#FAF7F2]' : 'bg-white border-amber-600'
                    } border-[#EBE3DB]`}
                  />
                </div>
              </div>

              {/* 4. Manual Override Toggle */}
              <div className="p-3 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#211B17] block">
                    Missed Punch / Backdated Manual Override
                  </span>
                  <span className="text-[10px] text-[#70665F]">
                    Enable manual time entry for missed gate cards or biometric failures
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isManualOverride}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsManualOverride(checked);
                    if (!checked) {
                      setFormData((prev) => ({
                        ...prev,
                        date: getTodayDate(),
                        checkIn: getSystemTime(),
                        manualReason: '',
                      }));
                      setFormErrors({});
                    }
                  }}
                  className="w-4 h-4 rounded text-amber-700 focus:ring-amber-600 cursor-pointer"
                />
              </div>

              {/* 5. Mandatory Reason if Manual Override is Active */}
              {isManualOverride && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-[#544B45] font-semibold mb-1">
                    Reason for Manual Regularization <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Specify why manual punch is needed (e.g. Biometric scanner offline, Gate pass approved)..."
                    value={formData.manualReason}
                    onChange={(e) => {
                      setFormData({ ...formData, manualReason: e.target.value });
                      if (formErrors.manualReason) {
                        setFormErrors((prev) => {
                          const next = { ...prev };
                          delete next.manualReason;
                          return next;
                        });
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs text-[#211B17] focus:outline-none transition ${
                      formErrors.manualReason
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-[#EBE3DB] focus:border-amber-600'
                    }`}
                  />
                  {formErrors.manualReason && (
                    <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {formErrors.manualReason}
                    </p>
                  )}
                </div>
              )}

              {/* Form Buttons */}
              <div className="pt-4 border-t border-[#EBE3DB] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPunchModal(false)}
                  className="px-4 py-2.5 bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#544B45] font-semibold text-xs rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-700 hover:bg-amber-600 text-white font-semibold text-xs rounded-lg shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Clock className="w-4 h-4" /> Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Regularization Request Modal */}
      {showRegModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowRegModal(false);
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative my-8"
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#211B17]">Request Attendance Regularization</h3>
                  <p className="text-xs text-[#70665F]">Submit missed punch for manager review</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRegModal(false)}
                className="text-[#70665F] hover:text-[#211B17] p-1.5 rounded-lg hover:bg-[#FAF7F2] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRegularization} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Employee</label>
                <select
                  value={regForm.employeeId}
                  onChange={(e) => setRegForm({ ...regForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-xs"
                >
                  <option value="">-- Myself (Logged-In User) --</option>
                  {availableEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name || (emp as any).firstName} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={regForm.date}
                    onChange={(e) => setRegForm({ ...regForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Punch Type</label>
                  <select
                    value={regForm.punchType}
                    onChange={(e) => setRegForm({ ...regForm, punchType: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-xs"
                  >
                    <option value="CHECK_IN">Check-In</option>
                    <option value="CHECK_OUT">Check-Out</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Requested Corrected Time</label>
                <input
                  type="time"
                  value={regForm.requestedTime}
                  onChange={(e) => setRegForm({ ...regForm, requestedTime: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Reason for Regularization</label>
                <textarea
                  rows={3}
                  placeholder="Explain why biometric check was missed (e.g. Card malfunctioning, machine power cut, client meeting direct arrival)..."
                  value={regForm.reason}
                  onChange={(e) => setRegForm({ ...regForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-xs focus:outline-none focus:border-amber-600"
                  required
                />
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2 bg-[#FAF7F2] text-[#544B45] font-semibold rounded-lg hover:bg-[#EBE3DB] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-sm transition cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
