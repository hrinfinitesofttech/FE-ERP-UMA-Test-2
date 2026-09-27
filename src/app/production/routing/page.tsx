'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { GitBranch, Plus, ShieldCheck, Clock, Wrench, ChevronRight } from 'lucide-react';

export default function RoutingOperationsPage() {
  const { routingOperations, workCenters, addRoutingOperation } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [opName, setOpName] = useState('');
  const [wcCode, setWcCode] = useState('WC-CUT');
  const [setupMins, setSetupMins] = useState(30);
  const [procMins, setProcMins] = useState(120);
  const [operator, setOperator] = useState('Ramesh Vaghela');
  const [qcReq, setQcReq] = useState(true);

  const handleAddOp = (e: React.FormEvent) => {
    e.preventDefault();
    const targetWc = workCenters.find((w) => w.workCenterCode === wcCode);
    const seq = (routingOperations.length + 1) * 10;

    addRoutingOperation({
      operationNumber: seq,
      operationName: opName,
      sequence: routingOperations.length + 1,
      workCenterCode: wcCode,
      workCenterName: targetWc?.workCenterName || 'Default Bay',
      machineName: targetWc?.machineName || 'Machinery',
      department: 'Production',
      plannedSetupMinutes: setupMins,
      plannedProcessingMinutes: procMins,
      totalPlannedMinutes: setupMins + procMins,
      assignedOperator: operator,
      qcRequired: qcReq,
      instructions: 'Standard shop floor operating procedure.',
      status: 'Ready',
    });

    setShowModal(false);
    setOpName('');
    alert('Routing operation added!');
  };

  return (
    <div className="p-6 space-y-6 bg-[#090D1A]  text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-crm-brand-600/10 text-crm-brand-500 border border-crm-brand-600/20">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
              Routing & Operations Sequence
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-crm-brand-600/20 text-crm-brand- font-medium border border-crm-brand-600/30">
                14-Step MTO Workflow
              </span>
            </h1>
            <p className="text-xs text-[#70665F]">
              Standard Operation Sequence for Machine Fabrication, Machining, Assembly & Testing
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-crm-brand-700 to-crm-brand-700 font-bold text-[#211B17] text-xs shadow-lg hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4" /> Add Operation Step
        </button>
      </div>

      {/* Routing Table */}
      <div className="p-5 rounded-2xl bg-white border border-[#EBE3DB] shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3">Seq #</th>
                <th className="p-3">Operation Name</th>
                <th className="p-3">Work Center Bay</th>
                <th className="p-3">Machine Number</th>
                <th className="p-3 text-right">Setup Mins</th>
                <th className="p-3 text-right">Processing Mins</th>
                <th className="p-3 text-right">Total Planned</th>
                <th className="p-3">Lead Technician</th>
                <th className="p-3">QC Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {routingOperations.map((op) => (
                <tr key={op.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3 font-mono font-bold text-crm-brand-500">{op.operationNumber}</td>
                  <td className="p-3 font-semibold text-[#211B17] max-w-xs">{op.operationName}</td>
                  <td className="p-3 font-mono text-crm-brand-">{op.workCenterCode} - {op.workCenterName.slice(0, 20)}</td>
                  <td className="p-3 text-[#70665F] font-mono text-[11px]">{op.machineName}</td>
                  <td className="p-3 text-right font-mono text-[#544B45]">{op.plannedSetupMinutes} mins</td>
                  <td className="p-3 text-right font-mono text-[#544B45]">{op.plannedProcessingMinutes} mins</td>
                  <td className="p-3 text-right font-mono font-bold text-amber-300">
                    {Math.round(op.totalPlannedMinutes / 60)} hrs ({op.totalPlannedMinutes}m)
                  </td>
                  <td className="p-3 font-medium text-[#544B45]">{op.assignedOperator}</td>
                  <td className="p-3">
                    {op.qcRequired ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3" /> Mandatory QC
                      </span>
                    ) : (
                      <span className="text-[#70665F] text-[10px]">Standard</span>
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
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-[#544B45]">
            <div className="flex justify-between items-center border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-bold text-[#211B17]">Add Operation Step</h3>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17] font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddOp} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Operation Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g.limpet coil welding & hydraulic test..."
                  value={opName}
                  onChange={(e) => setOpName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-crm-brand-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Work Center Code</label>
                <select
                  value={wcCode}
                  onChange={(e) => setWcCode(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-crm-brand-600"
                >
                  {workCenters.map((w) => (
                    <option key={w.id} value={w.workCenterCode}>
                      {w.workCenterCode} - {w.workCenterName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Setup Mins</label>
                  <input
                    type="number"
                    value={setupMins}
                    onChange={(e) => setSetupMins(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-crm-brand-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Processing Mins</label>
                  <input
                    type="number"
                    value={procMins}
                    onChange={(e) => setProcMins(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-crm-brand-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Assigned Lead Technician</label>
                <input
                  type="text"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-crm-brand-600"
                />
              </div>

              <label className="flex items-center gap-2 text-[#544B45]">
                <input
                  type="checkbox"
                  checked={qcReq}
                  onChange={(e) => setQcReq(e.target.checked)}
                  className="rounded border-[#EBE3DB] text-crm-brand-600"
                />
                Mandatory QC Inspection Required after this operation
              </label>

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
                  className="px-4 py-2 rounded-xl bg-crm-brand-700 font-bold text-white hover:bg-crm-brand-600 shadow-lg"
                >
                  Save Operation Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
