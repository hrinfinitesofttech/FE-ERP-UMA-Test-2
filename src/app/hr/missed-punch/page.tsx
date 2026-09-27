'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { AlertTriangle, Plus, CheckCircle2, Clock, X } from 'lucide-react';

export default function MissedPunchPage() {
  const { missedPunchRequests, addMissedPunchRequest, updateMissedPunchStatus, availableEmployees } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: availableEmployees[0]?.id || 'EMP-2026-001',
    date: new Date().toISOString().split('T')[0],
    missingPunchType: 'Check-Out' as const,
    requestedTime: '18:05',
    reason: 'Biometric terminal network failure at main gate during evening shift exit.',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = availableEmployees.find((e) => e.id === formData.employeeId);
    addMissedPunchRequest({
      employeeId: formData.employeeId,
      employeeName: emp?.name || 'Staff Member',
      date: formData.date,
      missingPunchType: formData.missingPunchType,
      requestedTime: formData.requestedTime,
      reason: formData.reason,
      reportingManager: 'Rajesh Patel',
    });
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-orange-400" />
            Missed Punch Request Portal
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Biometric Technical Fault Corrections & Gate Punch Override Approvals
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Submit Missed Punch
        </button>
      </div>

      {/* Missed Punch Table */}
      <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white/80 border-b border-[#EBE3DB] text-xs font-semibold text-[#70665F] uppercase tracking-wider">
                <th className="p-4">Req No.</th>
                <th className="p-4">Employee</th>
                <th className="p-4">Date</th>
                <th className="p-4">Punch Type & Time</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-[#3E2723]">
              {missedPunchRequests.map((req) => (
                <tr key={req.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-4 font-mono text-xs text-orange-400 font-bold">{req.requestNumber}</td>
                  <td className="p-4 font-bold text-[#211B17]">{req.employeeName}</td>
                  <td className="p-4 font-mono text-xs text-[#544B45]">{req.date}</td>
                  <td className="p-4 text-xs font-semibold text-sky-400">
                    {req.missingPunchType} @ {req.requestedTime}
                  </td>
                  <td className="p-4 text-xs text-[#544B45] max-w-xs truncate">&quot;{req.reason}&quot;</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        req.status === 'Approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : req.status === 'Pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {req.status === 'Pending' && (
                      <button
                        onClick={() => updateMissedPunchStatus(req.id, 'Approved')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-xs font-semibold rounded shadow transition"
                      >
                        Approve Punch
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" /> Submit Missed Punch Request
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
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
                  <label className="block text-[#70665F] mb-1">Punch Type</label>
                  <select
                    value={formData.missingPunchType}
                    onChange={(e) => setFormData({ ...formData, missingPunchType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  >
                    <option value="Check-In">Check-In</option>
                    <option value="Check-Out">Check-Out</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Requested Exact Time</label>
                <input
                  type="text"
                  placeholder="e.g. 18:05"
                  value={formData.requestedTime}
                  onChange={(e) => setFormData({ ...formData, requestedTime: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Reason</label>
                <textarea
                  rows={2}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white text-[#544B45] font-semibold rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-[#211B17] font-semibold rounded-lg">
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
