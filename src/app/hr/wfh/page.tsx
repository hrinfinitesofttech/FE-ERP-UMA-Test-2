'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Compass, Plus, CheckCircle2, Clock, ShieldCheck, X } from 'lucide-react';

export default function WFHRemoteWorkPage() {
  const { wfhRequests, addWFHRequest, updateWFHRequestStatus, availableEmployees } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: availableEmployees[0]?.id || 'EMP-2026-001',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    numberOfDays: 1,
    reason: 'Client site audit and remote ERP implementation support.',
    workDescription: 'Finalizing GSTR-1 reconciliations and vendor PR clearance.',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = availableEmployees.find((e) => e.id === formData.employeeId);
    addWFHRequest({
      employeeId: formData.employeeId,
      employeeName: emp?.name || 'Staff Member',
      department: emp?.department || 'Production',
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      numberOfDays: Number(formData.numberOfDays),
      reason: formData.reason,
      workDescription: formData.workDescription,
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
            <Compass className="w-7 h-7 text-violet-400" />
            WFH / Remote Work Portal
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Work From Home Requests with Automated Daily Attendance Synchronization
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Apply for WFH
        </button>
      </div>

      {/* WFH Requests Table */}
      <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white/80 border-b border-[#EBE3DB] text-xs font-semibold text-[#70665F] uppercase tracking-wider">
                <th className="p-4">WFH Ref</th>
                <th className="p-4">Employee</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Work Description</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-[#3E2723]">
              {wfhRequests.map((req) => (
                <tr key={req.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-4 font-mono text-xs text-violet-400 font-bold">{req.wfhNumber}</td>
                  <td className="p-4">
                    <div className="font-bold text-[#211B17]">{req.employeeName}</div>
                    <div className="text-xs text-[#70665F]">{req.department}</div>
                  </td>
                  <td className="p-4 text-xs font-mono text-[#544B45]">
                    <div>{req.fromDate} to {req.toDate}</div>
                    <div className="text-violet-400 font-bold">{req.numberOfDays} Day(s)</div>
                  </td>
                  <td className="p-4 text-xs text-[#544B45] max-w-xs truncate">&quot;{req.workDescription}&quot;</td>
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
                        onClick={() => updateWFHRequestStatus(req.id, 'Approved')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-xs font-semibold rounded shadow transition"
                      >
                        Approve WFH
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
                <Compass className="w-5 h-5 text-violet-400" /> WFH Application Form
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
                  <label className="block text-[#70665F] mb-1">From Date</label>
                  <input
                    type="date"
                    value={formData.fromDate}
                    onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">To Date</label>
                  <input
                    type="date"
                    value={formData.toDate}
                    onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Work Deliverables Plan</label>
                <textarea
                  rows={2}
                  value={formData.workDescription}
                  onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white text-[#544B45] font-semibold rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-[#211B17] font-semibold rounded-lg">
                  Submit WFH Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
