'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Calendar, Plus, Users, Building, Layers, CheckCircle2, Filter, X } from 'lucide-react';

export default function ShiftRosterPage() {
  const { shiftRosters, addShiftRoster, availableEmployees, shiftMasters, departments } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: availableEmployees[0]?.id || 'EMP-2026-001',
    date: new Date().toISOString().split('T')[0],
    shiftId: shiftMasters[0]?.id || 'SHIFT-01',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = availableEmployees.find((e) => e.id === formData.employeeId);
    const shf = shiftMasters.find((s) => s.id === formData.shiftId);

    addShiftRoster({
      employeeId: formData.employeeId,
      employeeName: emp?.name || 'Staff Employee',
      department: emp?.department || 'Production',
      date: formData.date,
      shiftId: formData.shiftId,
      shiftName: shf?.shiftName || 'General Shift',
      assignedBy: 'Shop Floor Planning Head',
    });
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <Calendar className="w-7 h-7 text-indigo-400" />
            Shift Roster & Worker Allocation
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Weekly / Monthly Shift Scheduling across Production Cells, Assembly Lines, Maintenance & Office
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Assign Shift Roster
        </button>
      </div>

      {/* Roster Table */}
      <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white/80 border-b border-[#EBE3DB] text-xs font-semibold text-[#70665F] uppercase tracking-wider">
                <th className="p-4">Roster Ref</th>
                <th className="p-4">Employee</th>
                <th className="p-4">Department</th>
                <th className="p-4">Assigned Date</th>
                <th className="p-4">Shift Assigned</th>
                <th className="p-4">Planner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-[#3E2723]">
              {shiftRosters.map((rst) => (
                <tr key={rst.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-4 font-mono text-xs text-indigo-400 font-bold">{rst.id}</td>
                  <td className="p-4">
                    <div className="font-bold text-[#211B17]">{rst.employeeName}</div>
                    <div className="text-xs text-[#70665F]">ID: {rst.employeeId}</div>
                  </td>
                  <td className="p-4 text-xs font-semibold text-[#544B45]">{rst.department}</td>
                  <td className="p-4 font-mono text-xs text-amber-400">{rst.date}</td>
                  <td className="p-4 font-semibold text-sky-400">{rst.shiftName}</td>
                  <td className="p-4 text-xs text-[#70665F]">{rst.assignedBy}</td>
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
                <Calendar className="w-5 h-5 text-indigo-400" /> Assign Shift Roster
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

              <div>
                <label className="block text-[#70665F] mb-1">Shift Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                />
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Select Shift Master</label>
                <select
                  value={formData.shiftId}
                  onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                >
                  {shiftMasters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.shiftName} ({s.startTime} - {s.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white text-[#544B45] font-semibold rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] font-semibold rounded-lg">
                  Assign Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
