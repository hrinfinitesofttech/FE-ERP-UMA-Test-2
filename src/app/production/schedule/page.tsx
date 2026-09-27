'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Calendar, Plus, Clock, AlertTriangle, CheckCircle2, UserCheck, Search, ChevronRight } from 'lucide-react';

export default function ProductionSchedulePage() {
  const { productionSchedules, workCenters, addProductionSchedule, openJobModal } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [jobNumber, setJobNumber] = useState('JOB-2026-001');
  const [woNum, setWoNum] = useState('WO-2026-001-A');
  const [opName, setOpName] = useState('Limpet Jacket TIG Welding');
  const [wcCode, setWcCode] = useState('WC-WELD');
  const [operator, setOperator] = useState('Suresh Patel');
  const [start, setStart] = useState('2026-09-24');
  const [end, setEnd] = useState('2026-09-30');

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const wc = workCenters.find((w) => w.workCenterCode === wcCode);

    addProductionSchedule({
      scheduleNumber: `SCH-${Date.now().toString().slice(-4)}`,
      jobId: 'PRJ-2026-0001',
      jobNumber,
      workOrderNumber: woNum,
      operationName: opName,
      workCenterCode: wcCode,
      workCenterName: wc?.workCenterName || 'Fabrication Bay',
      machineName: wc?.machineName || 'SAW Machine',
      assignedOperator: operator,
      plannedStart: start,
      plannedEnd: end,
      delayHours: 0,
      status: 'Scheduled',
    });

    setShowModal(false);
    alert('Production Schedule slot reserved!');
  };

  return (
    <div className="p-6 space-y-6 bg-[#090D1A]  text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
              Visual Production Schedule
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-medium border border-pink-500/30">
                Gantt Timeline
              </span>
            </h1>
            <p className="text-xs text-[#70665F]">
              Shop Floor Machine Slotting, Work Center Loading & Operator Allocation Timeline
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 font-bold text-[#211B17] text-xs shadow-lg hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4" /> Schedule Operation Slot
        </button>
      </div>

      {/* Schedule Timeline Grid */}
      <div className="p-5 rounded-2xl bg-white border border-[#EBE3DB] shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3">Schedule #</th>
                <th className="p-3">Job Number</th>
                <th className="p-3">Work Order #</th>
                <th className="p-3">Operation Name</th>
                <th className="p-3">Work Center Bay</th>
                <th className="p-3">Assigned Operator</th>
                <th className="p-3">Planned Schedule</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {productionSchedules.map((sch) => (
                <tr key={sch.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3 font-mono font-bold text-pink-400">{sch.scheduleNumber}</td>
                  <td className="p-3 font-mono text-sky-300">{sch.jobNumber}</td>
                  <td className="p-3 font-mono text-indigo-300">{sch.workOrderNumber}</td>
                  <td className="p-3 font-semibold text-[#211B17] max-w-xs">{sch.operationName}</td>
                  <td className="p-3 font-mono text-crm-brand-">{sch.workCenterCode} - {sch.workCenterName.slice(0, 20)}</td>
                  <td className="p-3 font-medium text-[#544B45]">{sch.assignedOperator}</td>
                  <td className="p-3 text-[#544B45] font-mono text-[11px]">
                    {sch.plannedStart} → {sch.plannedEnd}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        sch.status === 'In Progress'
                          ? 'bg-crm-brand-600/20 text-crm-brand- border-crm-brand-600/30'
                          : sch.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : sch.status === 'Delayed'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {sch.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => openJobModal(sch.jobNumber)}
                      className="px-2.5 py-1 rounded bg-crm-brand-700/20 text-crm-brand- hover:bg-crm-brand-700/30 border border-crm-brand-600/30 text-[11px] font-bold transition"
                    >
                      360° Trace
                    </button>
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
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-[#544B45]">
            <div className="flex justify-between items-center border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-bold text-[#211B17]">Schedule Operation Slot</h3>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17] font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Job Number</label>
                  <input
                    type="text"
                    required
                    value={jobNumber}
                    onChange={(e) => setJobNumber(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Work Order #</label>
                  <input
                    type="text"
                    required
                    value={woNum}
                    onChange={(e) => setWoNum(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Operation Name</label>
                <input
                  type="text"
                  required
                  value={opName}
                  onChange={(e) => setOpName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Work Center</label>
                  <select
                    value={wcCode}
                    onChange={(e) => setWcCode(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-pink-500"
                  >
                    {workCenters.map((w) => (
                      <option key={w.id} value={w.workCenterCode}>
                        {w.workCenterCode} - {w.workCenterName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Assigned Operator</label>
                  <input
                    type="text"
                    required
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Planned Start</label>
                  <input
                    type="date"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Planned End</label>
                  <input
                    type="date"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] font-medium hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-600 font-bold text-[#211B17] hover:bg-pink-500 shadow-lg"
                >
                  Reserve Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
