'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Cpu, RefreshCw, ShoppingCart, CheckCircle2, AlertTriangle, ShieldCheck, Box, Search } from 'lucide-react';

export default function MRPPage() {
  const { mrpRequirements, addPurchaseRequisition, openJobModal } = useERP();
  const [selectedJob, setSelectedJob] = useState('');

  const filteredMrp = mrpRequirements.filter((m) => m.jobNumber === selectedJob || selectedJob === 'All');

  const handlePushPR = (mrpId: string) => {
    const item = mrpRequirements.find((m) => m.id === mrpId);
    if (!item) return;

    addPurchaseRequisition({
      prNumber: `PR-MRP-${Date.now().toString().slice(-4)}`,
      requestedBy: 'MRP Calculation Engine (Automated)',
      department: 'Production & Shop Floor',
      requisitionDate: new Date().toISOString().split('T')[0],
      requiredByDate: '2026-10-15',
      projectId: item.jobId,
      jobId: item.jobId,
      jobNumber: item.jobNumber,
      priority: 'High',
      reason: `MRP Net Requirement fulfillment for Job ${item.jobNumber}`,
      items: [
        {
          id: `PRITEM-${Date.now()}`,
          itemCode: item.itemCode,
          itemName: item.itemName,
          specification: item.category,
          category: item.category,
          requiredQuantity: item.netRequirementQty,
          unitOfMeasure: item.uom,
          estimatedUnitPrice: item.unitCost,
          estimatedTotalPrice: item.unitCost * item.netRequirementQty,
          remarks: 'Auto-triggered by MRP calculation engine',
        },
      ],
      totalItems: 1,
      estimatedCost: item.unitCost * item.netRequirementQty,
      status: 'pending_approval',
    });

    alert(`Purchase Requisition PR-MRP created for ${item.itemName} (${item.netRequirementQty} ${item.uom})! Transferred to Purchase Module.`);
  };

  return (
    <div className="p-6 space-y-6 bg-[#090D1A]  text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
              Material Requirement Planning (MRP) Engine
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-medium border border-yellow-500/30">
                Automated Inventory Calculation
              </span>
            </h1>
            <p className="text-xs text-[#70665F]">
              Formula: Net Req Qty = Required Qty - (Available Stock - Reserved) - Open PO Qty
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#544B45] focus:outline-none focus:border-yellow-500"
          >
            <option value="All">All Jobs MRP</option>
            <option value="">Select Job</option>
            <option value="JOB-2026-002">JOB-2026-002 - Fluid Bed Dryer</option>
          </select>
        </div>
      </div>

      {/* MRP Table */}
      <div className="p-5 rounded-2xl bg-white border border-[#EBE3DB] shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3">Job Number</th>
                <th className="p-3">Item Code & Name</th>
                <th className="p-3 text-right">Required Qty</th>
                <th className="p-3 text-right">Available Stock</th>
                <th className="p-3 text-right">Reserved Stock</th>
                <th className="p-3 text-right">Open PO Qty</th>
                <th className="p-3 text-right">Net Req Qty</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filteredMrp.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-3 font-mono font-bold text-sky-400">{item.jobNumber}</td>
                  <td className="p-3">
                    <div className="font-mono font-bold text-yellow-300">{item.itemCode}</div>
                    <div className="font-semibold text-[#211B17]">{item.itemName}</div>
                  </td>
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
                  <td className="p-3 text-right font-mono font-extrabold text-amber-300 text-sm">
                    {item.netRequirementQty} {item.uom}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.materialStatus === 'Available'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : item.materialStatus === 'Purchase Required'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {item.materialStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {item.netRequirementQty > 0 ? (
                      <button
                        onClick={() => handlePushPR(item.id)}
                        className="px-2.5 py-1 rounded bg-gradient-to-r from-amber-600 to-orange-600 text-[#211B17] font-bold hover:brightness-110 shadow transition text-[11px] flex items-center gap-1 ml-auto"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Push to PR
                      </button>
                    ) : (
                      <span className="text-emerald-400 text-[11px] font-bold">Stock Covered</span>
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
