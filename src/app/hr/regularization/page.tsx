'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { RotateCcw, Plus, CheckCircle2, Clock, ShieldCheck, X } from 'lucide-react';

export default function AttendanceRegularizationPage() {
  const { attendanceRegularizations, addAttendanceRegularization, updateAttendanceRegularizationStatus, availableEmployees } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: availableEmployees[0]?.id || 'EMP-2026-001',
    date: new Date().toISOString().split('T')[0],
    originalStatus: 'Absent' as const,
    requestedStatus: 'Present' as const,
    correctedCheckIn: '09:00',
    correctedCheckOut: '18:00',
    reason: 'Official site visit to Client Tata Motors plant during morning shift.',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = availableEmployees.find((e) => e.id === formData.employeeId);

    addAttendanceRegularization({
      employeeId: formData.employeeId,
      employeeName: emp?.name || 'Staff Member',
      date: formData.date,
      originalStatus: formData.originalStatus,
      requestedStatus: formData.requestedStatus,
      originalCheckIn: '--:--',
      originalCheckOut: '--:--',
      correctedCheckIn: formData.correctedCheckIn,
      correctedCheckOut: formData.correctedCheckOut,
      reason: formData.reason,
    });
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[color:var(--crm-text-primary)] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[color:var(--crm-border-default)] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--crm-text-primary)] tracking-tight flex items-center gap-2">
            <RotateCcw className="w-7 h-7 text-crm-brand-600" />
            Attendance Regularization & Audit Trail
          </h1>
          <p className="text-sm text-[color:var(--crm-text-secondary)] mt-1">
            Attendance Correction Workflow preserving original raw punch audit history (Employee -&gt; Manager -&gt; HR)
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-[color:var(--crm-text-primary)] font-semibold text-sm rounded-lg shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Request Regularization
        </button>
      </div>

      {/* Regularizations Table */}
      <div className="bg-white/80 border border-[#E2E7EF]/60 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white/80 border-b border-[color:var(--crm-border-default)] text-xs font-semibold text-[color:var(--crm-text-secondary)] uppercase tracking-wider">
                <th className="p-4">Reg No.</th>
                <th className="p-4">Employee</th>
                <th className="p-4">Date</th>
                <th className="p-4">Original vs Corrected</th>
                <th className="p-4">Timings</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--crm-border-default)] text-[color:var(--crm-text-primary)]">
              {attendanceRegularizations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[color:var(--crm-text-secondary)]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Clock className="w-8 h-8 text-[color:var(--crm-text-tertiary)] opacity-50" />
                      <p className="font-semibold text-[color:var(--crm-text-secondary)]">No attendance regularizations</p>
                      <p className="text-[11px] text-[color:var(--crm-text-tertiary)]">Zero pending shift adjustments or biometric punch corrections.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                attendanceRegularizations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-[#F4F6FA]/40 transition">
                    <td className="p-4 font-mono text-xs text-amber-600 font-bold">{reg.regularizationNo}</td>
                    <td className="p-4 font-bold text-[color:var(--crm-text-primary)]">{reg.employeeName}</td>
                    <td className="p-4 font-mono text-xs text-[color:var(--crm-text-secondary)]">{reg.date}</td>
                    <td className="p-4 text-xs">
                      <div className="text-rose-500 line-through">Orig: {reg.originalStatus}</div>
                      <div className="text-emerald-600 font-bold">New: {reg.requestedStatus}</div>
                    </td>
                    <td className="p-4 text-xs font-mono text-[color:var(--crm-text-secondary)]">
                      <div>In: {reg.correctedCheckIn}</div>
                      <div>Out: {reg.correctedCheckOut}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          reg.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : reg.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        }`}
                      >
                        {reg.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {reg.status === 'Pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => updateAttendanceRegularizationStatus(reg.id, 'Approved')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded shadow transition min-h-[36px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateAttendanceRegularizationStatus(reg.id, 'Rejected')}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded shadow transition min-h-[36px]"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[color:var(--crm-border-default)] pb-3">
              <h2 className="text-lg font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-crm-brand-600" /> Submit Attendance Regularization
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[color:var(--crm-text-secondary)] hover:text-[color:var(--crm-text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[color:var(--crm-text-secondary)] mb-1">Select Employee</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-[color:var(--crm-text-primary)]"
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
                  <label className="block text-[color:var(--crm-text-secondary)] mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-[color:var(--crm-text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[color:var(--crm-text-secondary)] mb-1">Requested Status</label>
                  <select
                    value={formData.requestedStatus}
                    onChange={(e) => setFormData({ ...formData, requestedStatus: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-[color:var(--crm-text-primary)]"
                  >
                    <option value="Present">Present</option>
                    <option value="Half Day">Half Day</option>
                    <option value="First Half">First Half (Morning)</option>
                    <option value="Second Half">Second Half (Afternoon)</option>
                    <option value="WFH">WFH</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[color:var(--crm-text-secondary)] mb-1">Corrected Check-In</label>
                  <input
                    type="text"
                    placeholder="09:00"
                    value={formData.correctedCheckIn}
                    onChange={(e) => setFormData({ ...formData, correctedCheckIn: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-[color:var(--crm-text-primary)] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[color:var(--crm-text-secondary)] mb-1">Corrected Check-Out</label>
                  <input
                    type="text"
                    placeholder="18:00"
                    value={formData.correctedCheckOut}
                    onChange={(e) => setFormData({ ...formData, correctedCheckOut: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-[color:var(--crm-text-primary)] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[color:var(--crm-text-secondary)] mb-1">Reason for Regularization</label>
                <textarea
                  rows={2}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[color:var(--crm-border-default)] rounded-lg text-[color:var(--crm-text-primary)]"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-[color:var(--crm-border-default)] flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white text-[color:var(--crm-text-secondary)] font-semibold rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-[color:var(--crm-text-primary)] font-semibold rounded-lg">
                  Submit Regularization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
