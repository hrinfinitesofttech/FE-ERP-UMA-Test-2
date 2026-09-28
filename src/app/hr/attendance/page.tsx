'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Clock, Plus, Search, CheckCircle2, AlertTriangle, Calendar, Filter, MapPin, Smartphone, Laptop, ShieldCheck, X } from 'lucide-react';
import { AttendanceStatusType } from '../../../types/hr';

export default function AttendancePage() {
  const { attendanceRecords, markAttendance, availableEmployees } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showPunchModal, setShowPunchModal] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: availableEmployees[0]?.id || 'EMP-2026-001',
    date: new Date().toISOString().split('T')[0],
    shiftName: 'General Day Shift (09:00 - 18:00)',
    checkIn: '09:05',
    checkOut: '18:10',
    status: 'Present' as AttendanceStatusType,
    source: 'Biometric System' as const,
    remarks: 'Regular shop floor punch',
  });

  const isHalfDayStatus = (s: string) =>
    ['Half Day', 'First Half', 'Second Half', 'First Half Leave', 'Second Half Leave'].includes(s);

  const filteredRecords = attendanceRecords.filter((a) => {
    const matchesSearch =
      a.employeeName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      a.department?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      a.date.includes(searchTerm);
    let matchesStatus = statusFilter === 'ALL';
    if (!matchesStatus) {
      if (statusFilter === 'Half Day') {
        matchesStatus = isHalfDayStatus(a.status);
      } else if (statusFilter === 'First Half') {
        matchesStatus = a.status === 'First Half' || a.status === 'First Half Leave';
      } else if (statusFilter === 'Second Half') {
        matchesStatus = a.status === 'Second Half' || a.status === 'Second Half Leave';
      } else {
        matchesStatus = a.status === statusFilter;
      }
    }
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalCount = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const halfDayCount = attendanceRecords.filter((a) => isHalfDayStatus(a.status)).length;
  const absentCount = attendanceRecords.filter((a) => a.status === 'Absent').length;
  const leaveCount = attendanceRecords.filter((a) => a.status === 'On Leave' || a.status === 'WFH').length;

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
      inTime = '09:00';
      outTime = '18:00';
    }
    setFormData({ ...formData, status: newStatus, checkIn: inTime, checkOut: outTime });
  };

  const handlePunchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = availableEmployees.find((e) => e.id === formData.employeeId);
    const calculatedHours = isHalfDayStatus(formData.status)
      ? 4.5
      : formData.status === 'Absent' || formData.status === 'On Leave'
      ? 0
      : 9.0;

    markAttendance({
      employeeId: formData.employeeId,
      employeeName: emp?.name || 'Staff Member',
      department: emp?.department || 'Production',
      date: formData.date,
      shiftName: formData.shiftName,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      totalHours: calculatedHours,
      lateMinutes: formData.status === 'Late' ? 15 : 0,
      earlyCheckoutMinutes: 0,
      overtimeHours: 0,
      status: formData.status,
      source: formData.source,
      remarks: formData.remarks,
    });
    setShowPunchModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <Clock className="w-7 h-7 text-crm-brand-500" />
            Daily Attendance Management & Biometric Log
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Real-Time Punch In/Out Logs, Late Coming Tracking, Overtime & Biometric Integration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPunchModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Manual Punch / Log Entry
          </button>
        </div>
      </div>

      {/* KPI Cards Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-3 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-[#70665F]">Total Entries</span>
          <span className="text-2xl font-extrabold text-[#211B17] mt-1">{totalCount}</span>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-emerald-600">Present (Full Day)</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1">{presentCount}</span>
        </div>
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-indigo-600">Half Day (First/Second)</span>
          <span className="text-2xl font-extrabold text-indigo-600 mt-1">{halfDayCount}</span>
        </div>
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-rose-600">Absent</span>
          <span className="text-2xl font-extrabold text-rose-600 mt-1">{absentCount}</span>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-semibold text-amber-600">On Leave / WFH</span>
          <span className="text-2xl font-extrabold text-amber-600 mt-1">{leaveCount}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search by employee name, department, date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#EBE3DB] rounded-lg text-sm text-[#3E2723] focus:outline-none focus:border-crm-brand-600"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-[#70665F]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#EBE3DB] rounded-lg px-3 py-2 text-sm text-[#3E2723] focus:outline-none focus:border-crm-brand-600 font-medium"
          >
            <option value="ALL">All Attendance Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
            <option value="Half Day">Half Day (All Half Days)</option>
            <option value="First Half">First Half (Morning)</option>
            <option value="Second Half">Second Half (Afternoon)</option>
            <option value="First Half Leave">First Half Leave</option>
            <option value="Second Half Leave">Second Half Leave</option>
            <option value="WFH">WFH</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white/80 border-b border-[#EBE3DB] text-xs font-semibold text-[#70665F] uppercase tracking-wider">
                <th className="p-4">Employee</th>
                <th className="p-4">Date & Shift</th>
                <th className="p-4">Check-In / Out</th>
                <th className="p-4">Work Hours & Late</th>
                <th className="p-4">Status</th>
                <th className="p-4">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-[#3E2723]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#70665F]">
                    No attendance records match the selected status filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#FAF7F2]/40 transition">
                    <td className="p-4">
                      <div className="font-bold text-[#211B17]">{rec.employeeName}</div>
                      <div className="text-xs text-[#70665F]">{rec.department}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-[#3E2723]">{rec.date}</div>
                      <div className="text-xs text-[#70665F]">{rec.shiftName}</div>
                    </td>
                    <td className="p-4 font-mono text-xs text-[#544B45]">
                      <div className="text-emerald-400 font-bold">In: {rec.checkIn || '--:--'}</div>
                      <div className="text-pink-400 font-bold">Out: {rec.checkOut || '--:--'}</div>
                    </td>
                    <td className="p-4 text-xs">
                      <div>Hours: <strong className="text-[#211B17]">{rec.totalHours} Hrs</strong></div>
                      {rec.lateMinutes > 0 && <div className="text-amber-400 font-semibold">Late: {rec.lateMinutes} Mins</div>}
                      {rec.overtimeHours > 0 && <div className="text-emerald-400 font-semibold">OT: {rec.overtimeHours} Hrs</div>}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          rec.status === 'Present'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : rec.status === 'Late'
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            : rec.status === 'Absent'
                            ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                            : rec.status === 'First Half' || rec.status === 'First Half Leave'
                            ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                            : rec.status === 'Second Half' || rec.status === 'Second Half Leave'
                            ? 'bg-sky-500/10 text-sky-600 border border-sky-500/20'
                            : rec.status === 'Half Day'
                            ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                            : 'bg-crm-brand-600/10 text-crm-brand-500 border border-crm-brand-600/20'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-[#70665F]">{rec.source}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showPunchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
                <Clock className="w-5 h-5 text-crm-brand-500" /> Manual Punch / Attendance Log
              </h2>
              <button onClick={() => setShowPunchModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePunchSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Select Employee</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                >
                  {availableEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleStatusChangeInModal(e.target.value as AttendanceStatusType)}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17] font-semibold"
                  >
                    <option value="Present">Present (Full Day)</option>
                    <option value="Late">Late</option>
                    <option value="Absent">Absent</option>
                    <option value="Half Day">Half Day</option>
                    <option value="First Half">First Half (Morning)</option>
                    <option value="Second Half">Second Half (Afternoon)</option>
                    <option value="First Half Leave">First Half Leave</option>
                    <option value="Second Half Leave">Second Half Leave</option>
                    <option value="WFH">WFH</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Check-In Time</label>
                  <input
                    type="text"
                    placeholder="09:00"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Check-Out Time</label>
                  <input
                    type="text"
                    placeholder="18:00"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17] font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button type="button" onClick={() => setShowPunchModal(false)} className="px-4 py-2 bg-white text-[#544B45] font-semibold rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-semibold rounded-lg">
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
