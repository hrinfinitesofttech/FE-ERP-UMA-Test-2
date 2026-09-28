'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import { DowntimeRecord } from '../../../types/maintenance';
import { Clock, Plus, Search, Filter, AlertTriangle, Layers, X, CheckCircle2 } from 'lucide-react';

export default function DowntimeTrackingPage() {
  const { downtimeRecords, addDowntimeRecord } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    machineId: 'AST-105',
    machineName: 'Robotic MIG Welding Cell (6-Axis Fanuc)',
    workCenter: 'WC-WELD-03',
    jobId: 'JOB-2026-002',
    jobNumber: 'JOB-2026-002',
    productionOrderNumber: 'PO-WELD-9901',
    startTime: '2026-09-24 10:00 AM',
    endTime: '2026-09-24 12:30 PM',
    durationHours: 2.5,
    reason: 'Machine Breakdown' as const,
    breakdownNumber: 'BD-2026-001',
    maintenanceType: 'Emergency Repair',
    technicianName: 'Vikram Solanki',
    remarks: 'Fanuc J3 battery replacement.',
  });

  const filteredDowntime = downtimeRecords.filter((d) =>

    !searchTerm?.trim() ||

    d.downtimeNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    d.machineName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    d.reason?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
    (d.jobNumber && d.jobNumber?.toLowerCase().includes(searchTerm?.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDowntimeRecord(formData);
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#FAF7F2] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-mono text-xs font-bold">
              PRODUCTION & WORK CENTER IMPACT
            </span>
            <span className="text-xs text-[#70665F]">Integrated with Module 6 Production</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#211B17] mt-1 flex items-center gap-2">
            <Clock className="w-6 h-6 text-red-500" />
            Machine Downtime Tracking
          </h1>
          <p className="text-xs text-[#70665F]">
            Log and analyze machine stoppage duration, work center impact, breakdown linkages, and production delays.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-md shadow-red-600/30"
        >
          <Plus className="w-4 h-4" />
          Log Machine Downtime
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search downtime no, machine, job or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-[#FAF7F2] text-slate-600 dark:text-[#70665F] uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-[#EBE3DB]">
                <th className="py-3.5 px-4">Downtime Ref</th>
                <th className="py-3.5 px-4">Machine & Work Center</th>
                <th className="py-3.5 px-4">Job & Prod Order</th>
                <th className="py-3.5 px-4">Start / End Time</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Stoppage Reason</th>
                <th className="py-3.5 px-4">Technician</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#EBE3DB]">
              {filteredDowntime.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-[#FAF7F2]/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-red-600 dark:text-red-400">
                    {d.downtimeNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-[#211B17]">{d.machineName}</div>
                    <div className="text-[10px] text-[#70665F] font-mono">WC: {d.workCenter}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <div className="text-crm-brand-700 font-bold">{d.jobNumber || 'N/A'}</div>
                    <div className="text-[10px] text-[#70665F]">PO: {d.productionOrderNumber || 'N/A'}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-[#544B45]">
                    {d.startTime} - {d.endTime}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-red-600 font-mono text-sm">
                    {d.durationHours} Hours
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded bg-red-500/10 text-red-600 font-bold text-[10px]">
                      {d.reason}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-[#544B45]">
                    {d.technicianName || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm">
          <div className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-2xl w-full max-w-xl overflow-hidden text-xs">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-500" /> Log Machine Stoppage Downtime
              </h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block font-semibold mb-1">Machine Name</label>
                <input
                  type="text"
                  required
                  value={formData.machineName}
                  onChange={(e) => setFormData({ ...formData, machineName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Downtime Duration (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.durationHours}
                  onChange={(e) => setFormData({ ...formData, durationHours: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold">Post Downtime Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
