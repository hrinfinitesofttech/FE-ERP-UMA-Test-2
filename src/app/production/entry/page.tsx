'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { PlayCircle, Plus, CheckCircle2, AlertTriangle, Clock, Activity } from 'lucide-react';

export default function ProductionEntryPage() {
  const { productionEntries, workOrders, workCenters, recordProductionEntry, availableEmployees } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [selectedWo, setSelectedWo] = useState(workOrders[0]?.workOrderNumber || 'WO-2026-001-A');
  const [opName, setOpName] = useState('');
  const [wcName, setWcName] = useState(workCenters[0]?.workCenterName || '');
  const [operator, setOperator] = useState('');
  const [produced, setProduced] = useState<number | string>(1);
  const [rejected, setRejected] = useState<number | string>(0);
  const [rework, setRework] = useState<number | string>(0);
  const [scrap, setScrap] = useState<number | string>(0);
  const [downtime, setDowntime] = useState<number | string>(0);
  const [downtimeReason, setDowntimeReason] = useState('');

  const computedGood = Math.max(0, (Number(produced) || 0) - (Number(rejected) || 0) - (Number(scrap) || 0));

  // Close modal on ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opName.trim()) {
      alert('Operation Name is required and cannot be blank.');
      return;
    }
    if (!operator) {
      alert('Please select an Operator.');
      return;
    }
    const wo = workOrders.find((w) => w.workOrderNumber === selectedWo);

    recordProductionEntry({
      entryDate: new Date().toISOString().split('T')[0],
      jobId: wo?.jobId || 'PRJ-2026-0001',
      jobNumber: wo?.jobNumber || 'JOB-2026-001',
      workOrderNumber: selectedWo,
      productionOrderNumber: `PO-PROD-2026-001`,
      operationName: opName.trim(),
      workCenterName: wcName,
      machineName: 'SAW Automatic Manipulator M/C-01',
      operatorName: operator,
      startTime: '08:00 AM',
      endTime: '05:00 PM',
      plannedQuantity: 1,
      producedQuantity: Number(produced) || 0,
      rejectedQuantity: Number(rejected) || 0,
      reworkQuantity: Number(rework) || 0,
      scrapQuantity: Number(scrap) || 0,
      downtimeMinutes: Number(downtime) || 0,
      downtimeReason: downtimeReason || undefined,
      remarks: 'Recorded on shift completion.',
      createdBy: operator,
    });

    setShowModal(false);
    // Reset all fields for the next entry
    setOpName('');
    setProduced(1);
    setRejected(0);
    setRework(0);
    setScrap(0);
    setDowntime(0);
    setDowntimeReason('');
  };

  return (
    <div className="p-6 space-y-6 bg-[#090D1A]  text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-lime-500/10 text-lime-400 border border-lime-500/20">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
              Operator Production Entry Form
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-lime-500/20 text-lime-300 font-medium border border-lime-500/30">
                Formula Enforced
              </span>
            </h1>
            <p className="text-xs text-[#70665F]">
              Formula: Good Qty = Produced Qty - Rejected Qty - Scrap Qty
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-lime-600 to-emerald-600 font-bold text-[#211B17] text-xs shadow-lg hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4" /> Log Shift Production Entry
        </button>
      </div>

      {/* Production Entries Table */}
      <div className="p-5 rounded-2xl bg-white border border-[#EBE3DB] shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3">Entry #</th>
                <th className="p-3">Job & WO #</th>
                <th className="p-3">Operation & Bay</th>
                <th className="p-3">Operator</th>
                <th className="p-3 text-right">Produced Qty</th>
                <th className="p-3 text-right">Rejected</th>
                <th className="p-3 text-right">Scrap</th>
                <th className="p-3 text-right">Good Qty</th>
                <th className="p-3 text-right">Downtime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {productionEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3 font-mono font-bold text-lime-400">{entry.productionEntryNumber}</td>
                  <td className="p-3">
                    <div className="font-mono font-bold text-sky-400">{entry.jobNumber}</div>
                    <div className="font-mono text-indigo-300 text-[11px]">{entry.workOrderNumber}</div>
                  </td>
                  <td className="p-3 max-w-xs">
                    <div className="font-semibold text-[#211B17]">{entry.operationName}</div>
                    <div className="text-[11px] text-crm-brand- font-mono">{entry.workCenterName}</div>
                  </td>
                  <td className="p-3 font-medium text-[#544B45]">{entry.operatorName}</td>
                  <td className="p-3 text-right font-bold text-[#544B45]">{entry.producedQuantity}</td>
                  <td className="p-3 text-right font-mono text-rose-400">{entry.rejectedQuantity}</td>
                  <td className="p-3 text-right font-mono text-amber-400">{entry.scrapQuantity}</td>
                  <td className="p-3 text-right font-mono font-extrabold text-emerald-400 text-sm">
                    {entry.goodQuantity}
                  </td>
                  <td className="p-3 text-right font-mono text-[#70665F]">
                    {entry.downtimeMinutes > 0 ? `${entry.downtimeMinutes}m` : '0m'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-[#544B45] max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
          >
            <div className="flex justify-between items-center border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-bold text-[#211B17]">Log Shift Production Entry</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-[#70665F] hover:text-[#211B17] font-bold text-lg p-1 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Target Work Order *</label>
                <select
                  required
                  value={selectedWo}
                  onChange={(e) => setSelectedWo(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-lime-500 font-medium"
                >
                  {workOrders.map((w) => (
                    <option key={w.id} value={w.workOrderNumber}>
                      {w.workOrderNumber} — {w.jobNumber} ({w.productName.slice(0, 30)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">
                  Operation Name *
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  placeholder="e.g. CNC Plasma Cutting, SAW Welding, Dish Forming"
                  list="operationSuggestions"
                  value={opName}
                  onChange={(e) => setOpName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-lime-500 font-medium"
                />
                <datalist id="operationSuggestions">
                  <option value="CNC Plasma Cutting & Edge Prep" />
                  <option value="Plate Rolling & Shell Forming" />
                  <option value="Dish End Pressing & Crown Forming" />
                  <option value="Longitudinal SAW Automatic Welding" />
                  <option value="Circumferential Seam Welding" />
                  <option value="Nozzle Hole Drilling & Flange Fit-up" />
                  <option value="Limpet Coil Pitch Bending & Welding" />
                  <option value="Jacket Hydrostatic Pressure Testing" />
                  <option value="Post-Weld Heat Treatment (PWHT)" />
                  <option value="Internal Surface Pickling & Passivation" />
                  <option value="External Sand Blasting & Epoxy Primer" />
                  <option value="Final Assembly & FAT Clearance" />
                </datalist>
                {!opName.trim() && (
                  <span className="text-[11px] text-amber-600 mt-1 block">
                    ⚠️ Operation Name is required and cannot be empty.
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Work Center Bay</label>
                  <select
                    value={wcName}
                    onChange={(e) => setWcName(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-lime-500"
                  >
                    {workCenters.map((w) => (
                      <option key={w.id} value={w.workCenterName}>
                        {w.workCenterCode} - {w.workCenterName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Operator Name *</label>
                  <select
                    required
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-lime-500"
                  >
                    <option value="">Select Operator</option>
                    {availableEmployees.map((emp) => {
                      const name = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
                      return (
                        <option key={emp.id} value={name}>{name} — {emp.department || emp.departmentName || ''}</option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Quantities Grid with Auto Formula Calculation */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] space-y-3">
                <div className="text-xs font-bold text-amber-300 flex justify-between">
                  <span>Quantity Breakdown</span>
                  <span>Good Qty Formula Enforced</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <label className="block text-[10px] text-[#70665F] mb-1">Produced</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={produced}
                      onChange={(e) => setProduced(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1 text-[#544B45] text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-rose-400 mb-1">Rejected</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={rejected}
                      onChange={(e) => setRejected(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1 text-rose-300 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-amber-400 mb-1">Scrap</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={scrap}
                      onChange={(e) => setScrap(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1 text-amber-300 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-emerald-400 mb-1">Calculated Good</label>
                    <div className="w-full bg-emerald-500/20 border border-emerald-500/40 rounded-lg py-1 text-emerald-300 font-extrabold text-sm text-center">
                      {computedGood}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Downtime Minutes</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={downtime}
                    onChange={(e) => setDowntime(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-lime-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Downtime Reason (if any)</label>
                  <input
                    type="text"
                    value={downtimeReason}
                    onChange={(e) => setDowntimeReason(e.target.value)}
                    placeholder="e.g. Plasma nozzle replacement"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-lime-500"
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
                  className="px-4 py-2 rounded-xl bg-lime-600 font-bold text-[#211B17] hover:bg-lime-500 shadow-lg"
                >
                  Submit Production Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
