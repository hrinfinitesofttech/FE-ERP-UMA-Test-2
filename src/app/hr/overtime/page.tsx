'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Zap, Plus, DollarSign, CheckCircle2, Clock, ShieldCheck, X } from 'lucide-react';

export default function OvertimeManagementPage() {
  const { overtimeRecords, addOvertimeRecord, updateOvertimeStatus, availableEmployees } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: availableEmployees[0]?.id || 'EMP-2026-001',
    date: new Date().toISOString().split('T')[0],
    regularHours: 8,
    overtimeHours: 4,
    reason: 'Urgent production dispatch for Tata Motors job order execution.',
    overtimeRateMultiplier: 1.5,
    hourlyBasicRate: 300,
  });

  const overtimeAmount = formData.overtimeHours * formData.hourlyBasicRate * formData.overtimeRateMultiplier;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = availableEmployees.find((e) => e.id === formData.employeeId);

    addOvertimeRecord({
      employeeId: formData.employeeId,
      employeeName: emp?.name || 'Staff Member',
      department: emp?.department || 'Production',
      date: formData.date,
      regularHours: Number(formData.regularHours),
      overtimeHours: Number(formData.overtimeHours),
      reason: formData.reason,
      overtimeRateMultiplier: Number(formData.overtimeRateMultiplier),
      overtimeAmount: overtimeAmount,
      approvedBy: 'Sanjay Shah (Production Supervisor)',
    });
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <Zap className="w-7 h-7 text-red-400" />
            Overtime (OT) Management & Payroll Integration
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Shop Floor Extra Work Hours Logging, Hourly Rate Multipliers (1.5x / 2.0x) & Automated Payroll Flow
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Log Overtime Record
        </button>
      </div>

      {/* Overtime Records Table */}
      <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white/80 border-b border-[#EBE3DB] text-xs font-semibold text-[#70665F] uppercase tracking-wider">
                <th className="p-4">OT Ref</th>
                <th className="p-4">Employee</th>
                <th className="p-4">Date & Dept</th>
                <th className="p-4">Hours Logged</th>
                <th className="p-4">Rate & Calculated Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-[#3E2723]">
              {overtimeRecords.map((ot) => (
                <tr key={ot.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-4 font-mono text-xs text-red-400 font-bold">{ot.overtimeNo}</td>
                  <td className="p-4">
                    <div className="font-bold text-[#211B17]">{ot.employeeName}</div>
                    <div className="text-xs text-[#70665F]">ID: {ot.employeeId}</div>
                  </td>
                  <td className="p-4 text-xs">
                    <div className="font-bold text-[#3E2723]">{ot.date}</div>
                    <div className="text-[#70665F]">{ot.department}</div>
                  </td>
                  <td className="p-4 text-xs font-semibold text-amber-400">
                    <div>Regular: {ot.regularHours} Hrs</div>
                    <div className="text-red-400 font-bold">OT: +{ot.overtimeHours} Hrs</div>
                  </td>
                  <td className="p-4 text-xs font-mono">
                    <div className="text-[#544B45]">Multiplier: {ot.overtimeRateMultiplier}x</div>
                    <div className="text-emerald-400 font-extrabold text-sm">₹{ot.overtimeAmount?.toLocaleString()}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        ot.status === 'Approved' || ot.status === 'Processed in Payroll'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {ot.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {ot.status === 'Pending' && (
                      <button
                        onClick={() => updateOvertimeStatus(ot.id, 'Approved')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-xs font-semibold rounded shadow transition"
                      >
                        Approve OT
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
                <Zap className="w-5 h-5 text-red-400" /> Log Overtime Entry
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
                  <label className="block text-[#70665F] mb-1">OT Hours Logged</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.overtimeHours}
                    onChange={(e) => setFormData({ ...formData, overtimeHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Rate Multiplier</label>
                  <select
                    value={formData.overtimeRateMultiplier}
                    onChange={(e) => setFormData({ ...formData, overtimeRateMultiplier: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  >
                    <option value={1.5}>1.5x (Weekday Overtime)</option>
                    <option value={2.0}>2.0x (Holiday / Night Overtime)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Calculated Amount</label>
                  <div className="text-base font-bold text-emerald-400 pt-1">₹{overtimeAmount?.toLocaleString()}</div>
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Overtime Justification</label>
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
                <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-500 text-[#211B17] font-semibold rounded-lg">
                  Save & Flow to Payroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
