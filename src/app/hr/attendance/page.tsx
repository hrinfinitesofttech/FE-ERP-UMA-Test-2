'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
} from 'lucide-react';
import { AttendanceStatusType, AttendanceRecord } from '../../../types/hr';

export default function AttendancePage() {
  const {
    attendanceRecords = [],
    markAttendance,
    availableEmployees = [],
    departments = [],
    currentUser,
  } = useERP();

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

  // Update live clock
  useEffect(() => {
    setCurrentTimeStr(getSystemTime());
    const interval = setInterval(() => {
      setCurrentTimeStr(getSystemTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isHalfDayStatus = (s: string) =>
    ['Half Day', 'First Half', 'Second Half', 'First Half Leave', 'Second Half Leave'].includes(s);

  // Multi-Filter Synchronization
  const filteredRecords = useMemo(() => {
    return (attendanceRecords || []).filter((a) => {
      const q = (searchTerm || '').trim().toLowerCase();
      const matchesSearch =
        !q ||
        (a.employeeName || '').toLowerCase().includes(q) ||
        (a.employeeId || '').toLowerCase().includes(q) ||
        (a.department || '').toLowerCase().includes(q);

      const matchesDate = !selectedDate || a.date === selectedDate;
      const matchesEmployee = selectedEmployeeId === 'ALL' || a.employeeId === selectedEmployeeId;
      const matchesDept = selectedDepartment === 'ALL' || (a.department || '').toLowerCase() === selectedDepartment.toLowerCase();

      let matchesStatus = statusFilter === 'ALL';
      if (!matchesStatus) {
        if (statusFilter === 'Half Day') {
          matchesStatus = isHalfDayStatus(a.status);
        } else if (statusFilter === 'Late') {
          matchesStatus = a.status === 'Late' || Number(a.lateMinutes || 0) > 0;
        } else if (statusFilter === 'On Leave') {
          matchesStatus = a.status === 'On Leave' || a.status === 'WFH';
        } else {
          matchesStatus = a.status.toLowerCase() === statusFilter.toLowerCase();
        }
      }

      return matchesSearch && matchesDate && matchesEmployee && matchesDept && matchesStatus;
    });
  }, [attendanceRecords, searchTerm, selectedDate, selectedEmployeeId, selectedDepartment, statusFilter]);

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
  const totalCount = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const halfDayCount = attendanceRecords.filter((a) => isHalfDayStatus(a.status)).length;
  const absentCount = attendanceRecords.filter((a) => a.status === 'Absent').length;
  const leaveCount = attendanceRecords.filter((a) => a.status === 'On Leave' || a.status === 'WFH').length;

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

  const handlePunchSubmit = (e: React.FormEvent) => {
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

    setShowPunchModal(false);
    setSuccessToast(`Attendance logged for ${empName} (${punchSource} • ${formData.checkIn}).`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FDFBF9] min-h-screen text-[#211B17]">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-100" />
          <span className="font-semibold text-sm">{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-700">
              <Clock className="w-6 h-6" />
            </div>
            Daily Attendance Management & Biometric Log
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Real-Time Punch In/Out Logs, Late Coming Tracking, Overtime & Biometric Integration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenPunchModal}
            className="flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white font-semibold text-sm rounded-lg shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Manual Punch / Log Entry
          </button>
        </div>
      </div>

      {/* KPI Cards Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white border border-[#EBE3DB] rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-[#70665F] uppercase tracking-wider">Total Entries</span>
          <span className="text-2xl font-black text-[#211B17] mt-1">{totalCount}</span>
        </div>
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Present (Full Day)</span>
          <span className="text-2xl font-black text-emerald-700 mt-1">{presentCount}</span>
        </div>
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">Half Day</span>
          <span className="text-2xl font-black text-indigo-700 mt-1">{halfDayCount}</span>
        </div>
        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Absent</span>
          <span className="text-2xl font-black text-rose-700 mt-1">{absentCount}</span>
        </div>
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">On Leave / WFH</span>
          <span className="text-2xl font-black text-amber-700 mt-1">{leaveCount}</span>
        </div>
      </div>

      {/* Multi-Filter Bar */}
      <div className="bg-white border border-[#EBE3DB] rounded-xl p-4 shadow-sm space-y-3">
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
                Showing <strong>{filteredRecords.length}</strong> of {attendanceRecords.length} attendance records
              </span>
            </div>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#544B45] font-semibold rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Attendance Log Table */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-12 text-center space-y-3 shadow-sm">
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
              className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white font-semibold text-xs rounded-lg shadow transition"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-sm">
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
                className="text-[#70665F] hover:text-[#211B17] p-1.5 rounded-lg hover:bg-[#F5EFEB] transition"
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
                  className="w-4 h-4 rounded text-amber-700 focus:ring-amber-600"
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
                  className="px-4 py-2.5 bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#544B45] font-semibold text-xs rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-700 hover:bg-amber-600 text-white font-semibold text-xs rounded-lg shadow-md transition flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" /> Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
