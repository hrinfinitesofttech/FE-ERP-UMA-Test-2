'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { FileCheck2, Plus, Calendar, CheckCircle2, Clock, Filter, X, ShieldAlert, Sparkles, Layers } from 'lucide-react';
import { LeaveType } from '../../../types/hr';

const DEFAULT_LEAVE_TYPES: LeaveType[] = [
  {
    id: 'LT-01',
    leaveCode: 'CL',
    leaveName: 'Casual Leave (CL)',
    annualQuota: 12,
    monthlyAccrual: 1,
    carryForwardAllowed: false,
    maxConsecutiveDays: 3,
    halfDayAllowed: true,
    attachmentRequired: false,
    status: 'Active',
  },
  {
    id: 'LT-02',
    leaveCode: 'SL',
    leaveName: 'Sick Leave (SL)',
    annualQuota: 12,
    monthlyAccrual: 1,
    carryForwardAllowed: true,
    maxConsecutiveDays: 7,
    halfDayAllowed: true,
    attachmentRequired: true,
    status: 'Active',
  },
  {
    id: 'LT-03',
    leaveCode: 'EL',
    leaveName: 'Earned / Privilege Leave (EL)',
    annualQuota: 18,
    monthlyAccrual: 1.5,
    carryForwardAllowed: true,
    maxConsecutiveDays: 15,
    halfDayAllowed: true,
    attachmentRequired: false,
    status: 'Active',
  },
  {
    id: 'LT-04',
    leaveCode: 'CO',
    leaveName: 'Compensatory Off (Comp-Off)',
    annualQuota: 6,
    monthlyAccrual: 0.5,
    carryForwardAllowed: false,
    maxConsecutiveDays: 2,
    halfDayAllowed: true,
    attachmentRequired: false,
    status: 'Active',
  },
  {
    id: 'LT-05',
    leaveCode: 'ML',
    leaveName: 'Maternity / Paternity Leave',
    annualQuota: 90,
    monthlyAccrual: 0,
    carryForwardAllowed: false,
    maxConsecutiveDays: 90,
    halfDayAllowed: false,
    attachmentRequired: true,
    status: 'Active',
  },
];

export default function LeaveManagementPage() {
  const { leaveTypes = [], leaveRequests = [], addLeaveRequest, addLeaveType, availableEmployees = [] } = useERP();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);

  const activeLeaveTypes: LeaveType[] =
    leaveTypes && leaveTypes.length > 0 ? leaveTypes : DEFAULT_LEAVE_TYPES;

  // Apply Leave Form
  const [formData, setFormData] = useState({
    employeeId: availableEmployees[0]?.id || 'EMP-2026-001',
    leaveTypeId: activeLeaveTypes[0]?.id || 'LT-01',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    durationOption: 'Full Day' as 'Full Day' | 'First Half' | 'Second Half' | 'Half Day',
    reason: 'Family function in hometown.',
  });

  // Admin New Leave Type Form
  const [newTypeData, setNewTypeData] = useState({
    leaveName: '',
    leaveCode: '',
    annualQuota: 12,
    monthlyAccrual: 1,
    maxConsecutiveDays: 5,
    carryForwardAllowed: false,
    halfDayAllowed: true,
    attachmentRequired: false,
  });

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = availableEmployees.find((e) => e.id === formData.employeeId);
    const lt = activeLeaveTypes.find((l) => l.id === formData.leaveTypeId) || activeLeaveTypes[0];
    const isHalf = formData.durationOption !== 'Full Day';
    const numDays = isHalf ? 0.5 : 1;

    addLeaveRequest({
      employeeId: formData.employeeId,
      employeeName: emp?.name || (emp as any)?.employeeName || 'Staff Member',
      department: emp?.department || 'Production',
      leaveTypeId: lt.id,
      leaveName: lt.leaveName || 'Casual Leave',
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      numberOfDays: numDays,
      isHalfDay: isHalf,
      halfDayType: isHalf ? (formData.durationOption as any) : 'Full Day',
      reason: formData.reason,
      reportingManager: 'Rajesh Patel (Department Head)',
    });
    setShowApplyModal(false);
  };

  const handleCreateLeaveType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeData.leaveName || !newTypeData.leaveCode) return;

    if (addLeaveType) {
      addLeaveType({
        leaveName: newTypeData.leaveName,
        leaveCode: newTypeData.leaveCode.toUpperCase(),
        annualQuota: Number(newTypeData.annualQuota) || 12,
        monthlyAccrual: Number(newTypeData.monthlyAccrual) || 1,
        maxConsecutiveDays: Number(newTypeData.maxConsecutiveDays) || 5,
        carryForwardAllowed: Boolean(newTypeData.carryForwardAllowed),
        halfDayAllowed: Boolean(newTypeData.halfDayAllowed),
        attachmentRequired: Boolean(newTypeData.attachmentRequired),
        status: 'Active',
      });
    }
    setShowAddTypeModal(false);
    setNewTypeData({
      leaveName: '',
      leaveCode: '',
      annualQuota: 12,
      monthlyAccrual: 1,
      maxConsecutiveDays: 5,
      carryForwardAllowed: false,
      halfDayAllowed: true,
      attachmentRequired: false,
    });
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#211B17]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
              <FileCheck2 className="w-6 h-6" />
            </div>
            Leave Policy Master & Application Portal
          </h1>
          <p className="text-xs text-[#70665F] mt-1">
            Configurable Leave Rules (CL, SL, EL, Comp-Off), Monthly Accruals & Half-Day Application Tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Admin Side: Add Leave Type Button */}
          <button
            onClick={() => setShowAddTypeModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            <Layers className="w-4 h-4 text-amber-600" /> + Add Leave Type (Admin)
          </button>

          {/* User Side: Apply for Leave Button */}
          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Apply for Leave
          </button>
        </div>
      </div>

      {/* Leave Type Quota Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#70665F] uppercase tracking-wider">
            Active Leave Quotas & Rules ({activeLeaveTypes.length})
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeLeaveTypes.map((lt) => (
            <div key={lt.id} className="bg-white border border-[#EBE3DB] rounded-2xl p-4 space-y-3 shadow-xs hover:border-emerald-300 transition">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {lt.leaveCode}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#544B45] text-[11px] font-semibold border border-[#EBE3DB]">
                  Quota: {lt.annualQuota} Days/Yr
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#211B17]">{lt.leaveName}</h3>
                <p className="text-[11px] text-[#70665F] mt-0.5">
                  Max {lt.maxConsecutiveDays || 3} days stretch • {lt.halfDayAllowed ? 'Half-day allowed' : 'Full-day only'}
                </p>
              </div>
              <div className="text-xs text-[#70665F] space-y-1 pt-2 border-t border-[#EBE3DB]/60">
                <div className="flex justify-between">
                  <span>Accrual Rate:</span>
                  <strong className="text-[#3E2723]">{lt.monthlyAccrual} day / mo</strong>
                </div>
                <div className="flex justify-between">
                  <span>Carry Forward:</span>
                  {lt.carryForwardAllowed ? (
                    <span className="text-emerald-600 font-semibold">Allowed</span>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave Requests Log */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#EBE3DB] font-bold text-sm text-[#211B17] flex items-center justify-between">
          <span>Employee Leave Applications</span>
          <span className="text-xs text-[#70665F]">Total Requests: {leaveRequests.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#EBE3DB] text-[11px] font-semibold text-[#70665F] uppercase tracking-wider">
                <th className="p-3.5 px-4">Leave No.</th>
                <th className="p-3.5 px-4">Employee</th>
                <th className="p-3.5 px-4">Leave Type</th>
                <th className="p-3.5 px-4">Dates & Duration</th>
                <th className="p-3.5 px-4">Reason</th>
                <th className="p-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-[#3E2723]">
              {leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#70665F]">
                    No leave applications found. Click &quot;Apply for Leave&quot; above to submit one.
                  </td>
                </tr>
              ) : (
                leaveRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#FAF7F2]/60 transition">
                    <td className="p-3.5 px-4 font-mono text-xs text-emerald-600 font-bold">{req.leaveNumber}</td>
                    <td className="p-3.5 px-4">
                      <div className="font-bold text-[#211B17]">{req.employeeName}</div>
                      <div className="text-[11px] text-[#70665F]">{req.department}</div>
                    </td>
                    <td className="p-3.5 px-4 font-semibold text-[#3E2723]">{req.leaveName}</td>
                    <td className="p-3.5 px-4">
                      <div className="text-[#544B45] font-mono">{req.fromDate} to {req.toDate}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-emerald-700 font-bold">{req.numberOfDays} Day(s)</span>
                        {req.isHalfDay && (
                          <span className="px-2 py-0.2 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {req.halfDayType || 'Half Day'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 px-4 text-[#70665F] max-w-xs truncate">&quot;{req.reason}&quot;</td>
                    <td className="p-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          req.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Side: Apply for Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" /> Apply for Employee Leave
              </h2>
              <button onClick={() => setShowApplyModal(false)} className="text-[#70665F] hover:text-[#211B17] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1 font-medium">Select Employee</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17]"
                >
                  {availableEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name || (e as any).employeeName} ({e.department || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1 font-medium">Leave Type</label>
                <select
                  value={formData.leaveTypeId}
                  onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] font-semibold"
                >
                  {activeLeaveTypes.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.leaveName} ({l.leaveCode}) • Quota: {l.annualQuota} Days/Yr
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1 font-medium">Leave Duration / Half Day Option</label>
                <select
                  value={formData.durationOption}
                  onChange={(e) => setFormData({ ...formData, durationOption: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] font-medium"
                >
                  <option value="Full Day">Full Day (1 Day)</option>
                  <option value="First Half">First Half Leave (0.5 Day - 09:00 to 13:30)</option>
                  <option value="Second Half">Second Half Leave (0.5 Day - 13:30 to 18:00)</option>
                  <option value="Half Day">Half Day Leave (0.5 Day)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1 font-medium">From Date</label>
                  <input
                    type="date"
                    value={formData.fromDate}
                    onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1 font-medium">To Date</label>
                  <input
                    type="date"
                    value={formData.toDate}
                    onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1 font-medium">Reason for Leave</label>
                <textarea
                  rows={2}
                  value={formData.reason}
                  placeholder="Enter reason for leave..."
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17]"
                  required
                ></textarea>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 bg-white border border-[#EBE3DB] text-[#544B45] font-semibold rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
                >
                  Submit Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Side: Add New Leave Type Modal */}
      {showAddTypeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-600" /> Add New Leave Type (Admin Policy)
                </h2>
                <p className="text-[11px] text-[#70665F]">Create custom company leave rules & yearly quotas</p>
              </div>
              <button onClick={() => setShowAddTypeModal(false)} className="text-[#70665F] hover:text-[#211B17] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLeaveType} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[#70665F] mb-1 font-medium">Leave Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Festival Leave, Marriage Leave"
                    value={newTypeData.leaveName}
                    onChange={(e) => setNewTypeData({ ...newTypeData, leaveName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#70665F] mb-1 font-medium">Leave Code (2-4 letters)</label>
                  <input
                    type="text"
                    placeholder="e.g. FL, ML"
                    value={newTypeData.leaveCode}
                    onChange={(e) => setNewTypeData({ ...newTypeData, leaveCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#70665F] mb-1 font-medium">Annual Quota (Days/Year)</label>
                  <input
                    type="number"
                    min="1"
                    value={newTypeData.annualQuota}
                    onChange={(e) => setNewTypeData({ ...newTypeData, annualQuota: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1 font-medium">Monthly Accrual (Days)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newTypeData.monthlyAccrual}
                    onChange={(e) => setNewTypeData({ ...newTypeData, monthlyAccrual: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17]"
                  />
                </div>

                <div>
                  <label className="block text-[#70665F] mb-1 font-medium">Max Consecutive Days</label>
                  <input
                    type="number"
                    value={newTypeData.maxConsecutiveDays}
                    onChange={(e) => setNewTypeData({ ...newTypeData, maxConsecutiveDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17]"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#EBE3DB]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTypeData.halfDayAllowed}
                    onChange={(e) => setNewTypeData({ ...newTypeData, halfDayAllowed: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[#3E2723]">Allow Half Day Applications</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTypeData.carryForwardAllowed}
                    onChange={(e) => setNewTypeData({ ...newTypeData, carryForwardAllowed: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[#3E2723]">Allow Year-End Carry Forward</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTypeData.attachmentRequired}
                    onChange={(e) => setNewTypeData({ ...newTypeData, attachmentRequired: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[#3E2723]">Require Doctor Note / Document Attachment</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddTypeModal(false)}
                  className="px-4 py-2 bg-white border border-[#EBE3DB] text-[#544B45] font-semibold rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Leave Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

