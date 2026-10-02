'use client';

import React, { useState, useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Calendar, Plus, Clock, AlertTriangle, CheckCircle2, UserCheck, Search, ChevronRight } from 'lucide-react';

export default function ProductionSchedulePage() {
  const {
    productionSchedules,
    workCenters,
    manufacturingJobs,
    projectJobs,
    workOrders,
    routingOperations,
    availableEmployees,
    addProductionSchedule,
    openJobModal
  } = useERP();

  const [showModal, setShowModal] = useState(false);

  // Derive all unique jobs
  const allJobs = useMemo(() => {
    const map = new Map<string, string>();
    (manufacturingJobs || []).forEach((j) => {
      if (j.jobNumber) map.set(j.jobNumber, j.productName ? `${j.jobNumber} — ${j.productName}` : j.jobNumber);
    });
    (projectJobs || []).forEach((j) => {
      const pName = j.productName || j.projectName;
      if (j.jobNumber && !map.has(j.jobNumber)) map.set(j.jobNumber, pName ? `${j.jobNumber} — ${pName}` : j.jobNumber);
    });
    (workOrders || []).forEach((w) => {
      if (w.jobNumber && !map.has(w.jobNumber)) map.set(w.jobNumber, w.productName ? `${w.jobNumber} — ${w.productName}` : w.jobNumber);
    });
    if (map.size === 0) {
      map.set('JOB-2026-001', 'JOB-2026-001 — Reactor Vessel 50KL');
    }
    return Array.from(map.entries()).map(([num, label]) => ({ jobNumber: num, label }));
  }, [manufacturingJobs, projectJobs, workOrders]);

  const [jobNumber, setJobNumber] = useState(allJobs[0]?.jobNumber || 'JOB-2026-001');

  // Filter work orders based on selected job number
  const filteredWorkOrders = useMemo(() => {
    if (!jobNumber) return workOrders;
    const matching = workOrders.filter((w) => w.jobNumber === jobNumber);
    return matching.length > 0 ? matching : workOrders;
  }, [workOrders, jobNumber]);

  const [woNum, setWoNum] = useState(filteredWorkOrders[0]?.workOrderNumber || 'WO-2026-001-A');
  const [opName, setOpName] = useState('Limpet Jacket TIG Welding');
  const [wcCode, setWcCode] = useState(workCenters[0]?.workCenterCode || 'WC-WELD');
  const [operator, setOperator] = useState(availableEmployees[0]?.name || 'Suresh Patel');
  const [start, setStart] = useState(new Date().toISOString().split('T')[0]);
  const [end, setEnd] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  // Handle job change
  const handleJobChange = (selectedJob: string) => {
    setJobNumber(selectedJob);
    const matchingWO = workOrders.find((w) => w.jobNumber === selectedJob);
    if (matchingWO) {
      setWoNum(matchingWO.workOrderNumber);
    }
  };

  // Handle work order change
  const handleWoChange = (selectedWoNum: string) => {
    setWoNum(selectedWoNum);
    const matchingWO = workOrders.find((w) => w.workOrderNumber === selectedWoNum);
    if (matchingWO && matchingWO.jobNumber) {
      setJobNumber(matchingWO.jobNumber);
    }
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const wc = workCenters.find((w) => w.workCenterCode === wcCode);
    const wo = workOrders.find((w) => w.workOrderNumber === woNum);

    addProductionSchedule({
      scheduleNumber: `SCH-${Date.now().toString().slice(-6)}`,
      jobId: wo?.jobId || 'PRJ-2026-0001',
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
    alert('Production Schedule slot reserved successfully!');
  };

  return (
    <div className="p-6 space-y-6 bg-[#090D1A] text-[#544B45]">
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
          onClick={() => {
            if (allJobs.length > 0 && !jobNumber) {
              setJobNumber(allJobs[0].jobNumber);
            }
            if (filteredWorkOrders.length > 0 && !woNum) {
              setWoNum(filteredWorkOrders[0].workOrderNumber);
            }
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 font-bold text-white text-xs shadow-lg hover:brightness-110 transition"
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
              {productionSchedules.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#70665F]">
                    No production schedules found in database. Click &quot;Schedule Operation Slot&quot; to reserve a new machine slot.
                  </td>
                </tr>
              ) : (
                productionSchedules.map((sch) => (
                  <tr key={sch.id} className="hover:bg-[#FAF7F2]/40 transition">
                    <td className="p-3 font-mono font-bold text-pink-500">{sch.scheduleNumber}</td>
                    <td className="p-3 font-mono text-sky-600">{sch.jobNumber}</td>
                    <td className="p-3 font-mono text-indigo-600">{sch.workOrderNumber}</td>
                    <td className="p-3 font-semibold text-[#211B17] max-w-xs">{sch.operationName}</td>
                    <td className="p-3 font-mono text-[#544B45]">{sch.workCenterCode} - {sch.workCenterName?.slice(0, 20)}</td>
                    <td className="p-3 font-medium text-[#544B45]">{sch.assignedOperator}</td>
                    <td className="p-3 text-[#544B45] font-mono text-[11px]">
                      {sch.plannedStart} → {sch.plannedEnd}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          sch.status === 'In Progress'
                            ? 'bg-blue-500/20 text-blue-700 border-blue-500/30'
                            : sch.status === 'Completed'
                            ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30'
                            : sch.status === 'Delayed'
                            ? 'bg-rose-500/20 text-rose-700 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-700 border-amber-500/30'
                        }`}
                      >
                        {sch.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => openJobModal(sch.jobNumber)}
                        className="px-2.5 py-1 rounded bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300 text-[11px] font-bold transition"
                      >
                        360° Trace
                      </button>
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-[#544B45]">
            <div className="flex justify-between items-center border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-bold text-[#211B17]">Schedule Operation Slot</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-[#70665F] hover:text-[#211B17] font-bold text-lg p-1 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Job Number *</label>
                  <select
                    required
                    value={jobNumber}
                    onChange={(e) => handleJobChange(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-pink-500 font-medium"
                  >
                    {allJobs.map((j) => (
                      <option key={j.jobNumber} value={j.jobNumber}>
                        {j.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Work Order # *</label>
                  <select
                    required
                    value={woNum}
                    onChange={(e) => handleWoChange(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-pink-500 font-medium"
                  >
                    {filteredWorkOrders.map((w) => (
                      <option key={w.id || w.workOrderNumber} value={w.workOrderNumber}>
                        {w.workOrderNumber} ({w.productName ? w.productName.slice(0, 20) : w.jobNumber})
                      </option>
                    ))}
                    {filteredWorkOrders.length === 0 && (
                      <option value="WO-2026-001-A">WO-2026-001-A (Default)</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Operation Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Limpet Jacket TIG Welding, Dish End Forming"
                  list="scheduleOpSuggestions"
                  value={opName}
                  onChange={(e) => setOpName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-pink-500 font-medium"
                />
                <datalist id="scheduleOpSuggestions">
                  {(routingOperations || []).map((ro) => (
                    <option key={ro.id} value={ro.operationName} />
                  ))}
                  <option value="CNC Plasma Cutting & Edge Prep" />
                  <option value="Plate Rolling & Shell Forming" />
                  <option value="Dish End Pressing & Crown Forming" />
                  <option value="Longitudinal SAW Automatic Welding" />
                  <option value="Circumferential Seam Welding" />
                  <option value="Limpet Jacket TIG Welding" />
                  <option value="Jacket Hydrostatic Pressure Testing" />
                  <option value="Final Assembly & FAT Clearance" />
                </datalist>
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
                      <option key={w.id || w.workCenterCode} value={w.workCenterCode}>
                        {w.workCenterCode} - {w.workCenterName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Assigned Operator *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter or select operator"
                    list="operatorSuggestions"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-pink-500 font-medium"
                  />
                  <datalist id="operatorSuggestions">
                    {(availableEmployees || []).map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} ({emp.department})
                      </option>
                    ))}
                    <option value="Suresh Patel" />
                    <option value="Jayesh Parmar" />
                    <option value="Mahesh Bariya" />
                    <option value="Ramesh Vaghela" />
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Planned Start Date</label>
                  <input
                    type="date"
                    required
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Planned End Date</label>
                  <input
                    type="date"
                    required
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
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-600 font-bold text-white hover:bg-pink-500 shadow-lg"
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
