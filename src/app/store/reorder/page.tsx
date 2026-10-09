'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Zap, AlertTriangle, Plus, Search, ShoppingCart, CheckCircle } from 'lucide-react';

export default function ReorderPage() {
  const { itemMasters, stockBalances, addPurchaseRequisition, projectJobs } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [generatedPRs, setGeneratedPRs] = useState<string[]>([]);

  // Find items where usable stock <= reorderLevel
  const lowStockItems = itemMasters.filter((item) => {
    const bal = stockBalances.find((s) => s.itemId === item.id);
    const usableQty = bal ? bal.usableQty : 0;
    const matchesSearch =

      !searchTerm?.trim() || (

      item.itemCode?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      item.itemName?.toLowerCase().includes(searchTerm?.toLowerCase())

    );
    return usableQty <= item.reorderLevel && matchesSearch;
  });

  const handleGeneratePR = (item: (typeof itemMasters)[0]) => {
    const suggestedQty = item.maximumStock - item.minimumStock;
    addPurchaseRequisition({
      prNumber: `PR-REORDER-${Date.now().toString().slice(-4)}`,
      projectId: projectJobs[0]?.projectId || '',
      jobId: projectJobs[0]?.id || '',
      jobNumber: projectJobs[0]?.jobNumber || '',
      requestedBy: 'Store Low Stock Auto-Reorder Engine',
      department: 'Store & Inventory',
      requisitionDate: new Date().toISOString().split('T')[0],
      requiredByDate: '2026-10-15',
      priority: 'Urgent',
      status: 'pending_approval',
      items: [
        {
          id: `pr-item-${Date.now().toString().slice(-4)}`,
          prId: '',
          itemCode: item.itemCode,
          itemName: item.itemName,
          specification: item.specification,
          category: item.category,
          requiredQuantity: suggestedQty,
          unitOfMeasure: item.uom,
          estimatedUnitPrice: item.standardCost,
          estimatedTotalPrice: suggestedQty * item.standardCost,
          remarks: 'Automated 1-Click PR trigger from Store Reorder Engine',
        },
      ],
      totalItems: 1,
      estimatedCost: suggestedQty * item.standardCost,
      remarks: `Automated PR generated for low stock item ${item.itemCode}`,
    });

    setGeneratedPRs((prev) => [...prev, item.id]);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono font-semibold">
              REORDER ALERTS
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Low Stock & Auto-Reorder Engine</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Automated reorder point trigger when <code className="font-mono text-red-400 font-bold bg-[#FAF7F2] px-1.5 py-0.5 rounded">Usable Stock ≤ Reorder Level</code> with 1-Click Purchase Requisition (PR) generation.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search low stock item code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-red-500"
          />
        </div>
        <div className="text-xs text-[#70665F] font-mono">
          Low Stock Items: <span className="text-red-400 font-extrabold text-sm">{lowStockItems.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/90 text-[#70665F] font-mono text-[11px] uppercase tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">Item Code & Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-right font-mono text-emerald-400">Usable Stock Qty</th>
                <th className="p-3.5 text-right font-mono text-red-400">Reorder Level</th>
                <th className="p-3.5 text-right font-mono">Safety Stock</th>
                <th className="p-3.5 text-right font-mono text-crm-brand-500">Suggested PR Qty</th>
                <th className="p-3.5 text-right font-mono text-[#211B17]">Estimated Cost (₹)</th>
                <th className="p-3.5 text-center">1-Click Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {lowStockItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-[#70665F]">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    All stock levels are optimal above safety reorder thresholds!
                  </td>
                </tr>
              ) : (
                lowStockItems.map((item) => {
                  const bal = stockBalances.find((s) => s.itemId === item.id);
                  const usable = bal ? bal.usableQty : 0;
                  const suggested = item.maximumStock - item.minimumStock;
                  const estCost = suggested * item.standardCost;
                  const isGenerated = generatedPRs.includes(item.id);

                  return (
                    <tr key={item.id} className="hover:bg-[#FAF7F2]/40 transition">
                      <td className="p-3.5 font-medium">
                        <div className="font-bold text-[#211B17] text-xs">{item.itemCode}</div>
                        <div className="text-[11px] text-[#70665F] mt-0.5">{item.itemName}</div>
                      </td>
                      <td className="p-3.5 text-[#544B45]">{item.category}</td>
                      <td className="p-3.5 text-right font-mono font-black text-rose-400 text-sm">
                        {usable?.toLocaleString('en-IN')} {item.uom}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-amber-400">
                        {item.reorderLevel?.toLocaleString('en-IN')} {item.uom}
                      </td>
                      <td className="p-3.5 text-right font-mono text-[#70665F]">
                        {item.safetyStock?.toLocaleString('en-IN')} {item.uom}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-crm-brand-500 text-sm">
                        {suggested?.toLocaleString('en-IN')} {item.uom}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-[#211B17]">
                        ₹{estCost?.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-center">
                        {isGenerated ? (
                          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 justify-center">
                            <CheckCircle className="w-3.5 h-3.5" />
                            PR Created
                          </span>
                        ) : (
                          <button
                            onClick={() => handleGeneratePR(item)}
                            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-[#211B17] text-xs font-bold shadow-md shadow-red-600/30 hover:brightness-110 transition flex items-center gap-1 mx-auto"
                          >
                            <Zap className="w-3.5 h-3.5 text-yellow-300" />
                            Generate PR
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
