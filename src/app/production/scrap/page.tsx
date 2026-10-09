'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { AlertTriangle, Plus, DollarSign, Box, UserCheck } from 'lucide-react';
import { ProductionScrapType } from '../../../types/production';

export default function ProductionScrapPage() {
  const { productionScraps, workOrders, availableEmployees, addProductionScrap, isInitialLoading } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [selectedWo, setSelectedWo] = useState(workOrders[0]?.workOrderNumber || '');
  const [materialName, setMaterialName] = useState('SS 316L Offcut Plates & Plasma Skeleton Scrap');
  const [scrapType, setScrapType] = useState<ProductionScrapType>('Cutting Scrap');
  const [qty, setQty] = useState(45);
  const [estimatedValue, setEstimatedValue] = useState(25200);
  const [operator, setOperator] = useState(availableEmployees[0]?.name || 'Mahesh Bariya');

  const handleAddScrap = (e: React.FormEvent) => {
    e.preventDefault();
    const wo = workOrders.find((w) => w.workOrderNumber === selectedWo);

    addProductionScrap({
      entryDate: new Date().toISOString().split('T')[0],
      jobId: wo?.jobId || 'PRJ-2026-0001',
      jobNumber: wo?.jobNumber || '',
      workOrderNumber: selectedWo,
      productionOrderNumber: `PO-PROD-${Date.now().toString().slice(-4)}`,
      operationName: 'Plasma & Laser Offcut Recovery',
      materialCode: 'RM-SCRAP-SS316L',
      materialName,
      quantity: Number(qty) || 0,
      uom: 'Kg',
      reason: 'Standard CNC nested sheet offcut metal skeleton',
      scrapType,
      operatorName: operator,
      estimatedValue: Number(estimatedValue) || 0,
    });

    setShowModal(false);
    alert(`Production scrap saved to Database successfully! Estimated recovery value: ₹${estimatedValue}`);
  };

  return (
    <div className="p-6 space-y-6 bg-[#090D1A] text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
              Production Scrap & Rejection Tracker
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-medium border border-rose-500/30">
                Material Loss Control
              </span>
            </h1>
            <p className="text-xs text-[#70665F]">
              Log Raw Material Offcuts, Machining Turnings, Metal Skeletons & Scrap Financial Value
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (workOrders.length > 0 && !selectedWo) setSelectedWo(workOrders[0].workOrderNumber);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 font-bold text-white text-xs shadow-lg hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4" /> Log Production Scrap
        </button>
      </div>

      {/* Scrap Entries Table */}
      <div className="p-5 rounded-2xl bg-white border border-[#EBE3DB] shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3">Scrap Entry #</th>
                <th className="p-3">Job & WO #</th>
                <th className="p-3">Material Description</th>
                <th className="p-3">Scrap Type</th>
                <th className="p-3 text-right">Quantity</th>
                <th className="p-3 text-right">Scrap Value (₹)</th>
                <th className="p-3">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {isInitialLoading && productionScraps.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`shimmer-scrap-${i}`} className="border-b border-[#EBE3DB]">
                    <td className="p-3"><div className="h-4 w-28 rounded animate-shimmer" /></td>
                    <td className="p-3 space-y-1">
                      <div className="h-3.5 w-20 rounded animate-shimmer" />
                      <div className="h-3 w-16 rounded animate-shimmer" />
                    </td>
                    <td className="p-3"><div className="h-4 w-44 rounded animate-shimmer" /></td>
                    <td className="p-3"><div className="h-5 w-20 rounded-full animate-shimmer" /></td>
                    <td className="p-3 text-right"><div className="h-4 w-12 ml-auto rounded animate-shimmer" /></td>
                    <td className="p-3 text-right"><div className="h-4 w-16 ml-auto rounded animate-shimmer" /></td>
                    <td className="p-3"><div className="h-4 w-24 rounded animate-shimmer" /></td>
                  </tr>
                ))
              ) : productionScraps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#70665F]">
                    No production scrap entries recorded yet in database. Click &quot;Log Production Scrap&quot; to log scrap materials.
                  </td>
                </tr>
              ) : (
                productionScraps.map((scrap) => (
                  <tr key={scrap.id} className="hover:bg-[#FAF7F2]/40 transition">
                    <td className="p-3 font-mono font-bold text-rose-600">{scrap.scrapNumber}</td>
                    <td className="p-3">
                      <div className="font-mono font-bold text-sky-600">{scrap.jobNumber}</div>
                      <div className="font-mono text-indigo-600 text-[11px]">{scrap.workOrderNumber}</div>
                    </td>
                    <td className="p-3 font-semibold text-[#211B17] max-w-xs">{scrap.materialName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-700 text-[10px] font-bold border border-blue-500/30">
                        {scrap.scrapType}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-[#544B45]">
                      {scrap.quantity} {scrap.uom}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-rose-600">
                      ₹{scrap.estimatedValue?.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 font-medium text-[#544B45]">{scrap.operatorName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-[#544B45]">
            <div className="flex justify-between items-center border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-bold text-[#211B17]">Log Production Scrap</h3>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17] font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddScrap} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Target Work Order</label>
                <select
                  value={selectedWo}
                  onChange={(e) => setSelectedWo(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-rose-500"
                >
                  {workOrders.map((w) => (
                    <option key={w.id || w.workOrderNumber} value={w.workOrderNumber}>
                      {w.workOrderNumber} — {w.jobNumber}
                    </option>
                  ))}
                  {workOrders.length === 0 && (
                    <option value="">Select Work Order</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Material Description</label>
                <input
                  type="text"
                  required
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Scrap Type</label>
                <select
                  value={scrapType}
                  onChange={(e) => setScrapType(e.target.value as any)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-rose-500"
                >
                  <option value="Cutting Scrap">Cutting Scrap (Offcuts & Skeletons)</option>
                  <option value="Welding Scrap">Welding Scrap (Stub ends & Slag)</option>
                  <option value="Machining Scrap">Machining Scrap (Chips & Turnings)</option>
                  <option value="Damaged Material">Damaged Material</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Scrap Weight (Kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Est. Recovery Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Operator Name</label>
                <input
                  type="text"
                  required
                  list="scrapOperatorSuggestions"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-rose-500"
                />
                <datalist id="scrapOperatorSuggestions">
                  {(availableEmployees || []).map((emp) => (
                    <option key={emp.id} value={emp.name} />
                  ))}
                  <option value="Mahesh Bariya" />
                  <option value="Suresh Patel" />
                  <option value="Jayesh Parmar" />
                </datalist>
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
                  className="px-4 py-2 rounded-xl bg-rose-600 font-bold text-white hover:bg-rose-500 shadow-lg"
                >
                  Log Scrap Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
