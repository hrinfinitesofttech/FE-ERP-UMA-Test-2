'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { ShieldCheck, PlayCircle, CheckCircle2, AlertTriangle, Box, Search, ArrowRight } from 'lucide-react';

export default function MaterialAvailabilityPage() {
  const { workOrders, mrpRequirements, releaseWorkOrder, openJobModal } = useERP();
  const [selectedJob, setSelectedJob] = useState('JOB-2026-001');

  const selectedWo = workOrders.find((w) => w.jobNumber === selectedJob) || workOrders[0];
  const items = mrpRequirements.filter((m) => m.jobNumber === selectedJob);

  const availableCount = items.filter((i) => i.netRequirementQty <= 0).length;
  const shortageCount = items.filter((i) => i.netRequirementQty > 0).length;

  const isFullyAvailable = shortageCount === 0;

  return (
    <div className="p-6 space-y-6 bg-[#090D1A]  text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
              Material Availability Verification
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-medium border border-teal-500/30">
                Pre-Release Clearance
              </span>
            </h1>
            <p className="text-xs text-[#70665F]">
              Verify Store Physical Stock & Approved Allocations Before Releasing Work Order to Shop Floor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#544B45] focus:outline-none focus:border-teal-500"
          >
            <option value="JOB-2026-001">JOB-2026-001 - Heavy SS Reactor</option>
            <option value="JOB-2026-002">JOB-2026-002 - Fluid Bed Dryer</option>
          </select>

          {selectedWo && selectedWo.status !== 'Released' && (
            <button
              onClick={() => {
                releaseWorkOrder(selectedWo.id);
                alert(`Work Order ${selectedWo.workOrderNumber} released to shop floor!`);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 font-bold text-[#211B17] text-xs shadow-lg hover:brightness-110 transition flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4" /> Authorize Work Order Release
            </button>
          )}
        </div>
      </div>

      {/* Summary Box */}
      <div className="p-5 rounded-2xl bg-white border border-[#EBE3DB] shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <span className="text-[#70665F] block text-xs">Job Number</span>
          <span className="font-mono font-bold text-sky-400 text-lg">{selectedWo?.jobNumber}</span>
        </div>
        <div>
          <span className="text-[#70665F] block text-xs">Work Order</span>
          <span className="font-mono font-bold text-indigo-400 text-lg">{selectedWo?.workOrderNumber}</span>
        </div>
        <div>
          <span className="text-[#70665F] block text-xs">Overall Material Clearance</span>
          <span
            className={`font-bold text-sm px-2.5 py-0.5 rounded border inline-block mt-1 ${
              isFullyAvailable
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}
          >
            {isFullyAvailable ? 'Fully Cleared / Stock Ready' : 'Partially Available'}
          </span>
        </div>
        <div>
          <span className="text-[#70665F] block text-xs">Items Ready vs Shortage</span>
          <span className="font-bold text-[#544B45] text-sm">
            <span className="text-emerald-400">{availableCount} Ready</span> /{' '}
            <span className="text-rose-400">{shortageCount} Shortage</span>
          </span>
        </div>
      </div>

      {/* Item Checklist Table */}
      <div className="p-5 rounded-2xl bg-white border border-[#EBE3DB] shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
          <Box className="w-4 h-4 text-teal-400" /> Bill of Materials Item Stock Checklist
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3">Item Code</th>
                <th className="p-3">Item Description</th>
                <th className="p-3 text-right">BOM Required Qty</th>
                <th className="p-3 text-right">Physical Stock</th>
                <th className="p-3 text-right">Reserved Qty</th>
                <th className="p-3 text-right">Open PO Qty</th>
                <th className="p-3 text-right">Shortage Qty</th>
                <th className="p-3">Clearance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3 font-mono font-bold text-teal-300">{item.itemCode}</td>
                  <td className="p-3 font-semibold text-[#211B17]">{item.itemName}</td>
                  <td className="p-3 text-right font-bold text-[#544B45]">
                    {item.requiredQuantity} {item.uom}
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-400">
                    {item.availableStockQty} {item.uom}
                  </td>
                  <td className="p-3 text-right font-mono text-rose-400">
                    {item.reservedStockQty} {item.uom}
                  </td>
                  <td className="p-3 text-right font-mono text-indigo-400">
                    {item.openPoQty} {item.uom}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-amber-300">
                    {item.netRequirementQty > 0 ? `${item.netRequirementQty} ${item.uom}` : '0'}
                  </td>
                  <td className="p-3">
                    {item.netRequirementQty <= 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> Available
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" /> Shortage
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
