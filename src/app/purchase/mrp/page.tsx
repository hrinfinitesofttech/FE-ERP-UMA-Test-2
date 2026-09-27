'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Cpu,
  RefreshCw,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  Layers,
  Box,
  ShoppingCart,
  CheckSquare,
} from 'lucide-react';
import { MaterialRequirement } from '../../../types/purchase';

export default function MRPPage() {
  const { materialRequirements, addPurchaseRequisition, projectJobs, currentUser } = useERP();
  const [selectedJob, setSelectedJob] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [shortageOnly, setShortageOnly] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [generatedPRSuccess, setGeneratedPRSuccess] = useState<string | null>(null);

  // Filtered requirements
  const filteredRequirements = materialRequirements.filter(item => {
    if (selectedJob !== 'ALL' && item.jobId !== selectedJob) return false;
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    if (shortageOnly && item.shortageQuantity <= 0) return false;
    if (searchQuery) {
      const q = searchQuery?.toLowerCase();
      return (
        item.itemName?.toLowerCase().includes(q) ||
        item.partNumber?.toLowerCase().includes(q) ||
        item.jobId?.toLowerCase().includes(q) ||
        item.bomId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredRequirements.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredRequirements.map(item => item.id));
    }
  };

  // Generate PR for selected shortage items
  const handleGeneratePR = () => {
    if (selectedItems.length === 0) return;

    const itemsToPR = materialRequirements.filter(item => selectedItems.includes(item.id));
    const firstItem = itemsToPR[0];

    const prItems = itemsToPR.map((item, idx) => ({
      id: `PRI-GEN-${Date.now()}-${idx}`,
      prId: '',
      itemCode: item.partNumber,
      itemName: item.itemName,
      specification: item.specification,
      category: item.category,
      unitOfMeasure: item.unitOfMeasure,
      requiredQuantity: item.shortageQuantity,
      estimatedUnitPrice: 1200, // mock est
      estimatedTotalPrice: item.shortageQuantity * 1200,
      requiredByDate: item.requiredByDate,
      drawingNumber: item.drawingNumber,
      bomReference: `${item.bomId} Rev-${item.bomRevision}`,
      remarks: 'Auto-generated from MRP Shortage Engine',
    }));

    const totalEst = prItems.reduce((sum, item) => sum + item.estimatedTotalPrice, 0);

    const newPR = {
      id: `PR-${Date.now()}`,
      prNumber: `PR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      projectId: firstItem.projectId,
      jobId: firstItem.jobId,
      bomId: firstItem.bomId,
      bomRevision: firstItem.bomRevision,
      requisitionDate: new Date().toISOString().split('T')[0],
      requiredByDate: firstItem.requiredByDate,
      priority: 'High' as const,
      requestedBy: `${currentUser.firstName} ${currentUser.lastName}`,
      department: 'Purchase',
      status: 'Submitted' as const,
      items: prItems,
      totalItems: prItems.length,
      estimatedCost: totalEst,
      remarks: `Generated via MRP calculation for ${firstItem.jobId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addPurchaseRequisition(newPR);
    setGeneratedPRSuccess(`PR generated successfully: ${newPR.prNumber} with ${prItems.length} items!`);
    setSelectedItems([]);
    setTimeout(() => setGeneratedPRSuccess(null), 6000);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBE3DB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold border border-amber-500/30">
              MRP ENGINE
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Material Requirement Planning (MRP)</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Automated shortage calculation logic: <code className="text-amber-300 font-mono">Shortage = Required Quantity - Available Stock - On-Order POs</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedItems.length > 0 && (
            <button
              onClick={handleGeneratePR}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-crm-brand-700 to-crm-brand-700 hover:from-crm-brand-600 hover:to-crm-brand-600 text-[#211B17] font-bold text-xs rounded-xl shadow-lg shadow-crm-brand-700/30 transition animate-pulse"
            >
              <ShoppingCart className="w-4 h-4" />
              Generate Purchase Requisition ({selectedItems.length} items)
            </button>
          )}
        </div>
      </div>

      {/* PR Creation Banner Notification */}
      {generatedPRSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-300 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{generatedPRSuccess}</span>
          </div>
          <a href="/purchase/requisition" className="underline font-bold text-emerald-400">
            View in PR Register →
          </a>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#70665F]" />
            <input
              type="text"
              placeholder="Search item, part no, job..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-600 w-56"
            />
          </div>

          {/* Job Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#70665F]">Job:</span>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-xs text-[#211B17] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Jobs</option>
              {projectJobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.jobNumber} ({job.productName})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#70665F]">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-xs text-[#211B17] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Raw Material">Raw Material</option>
              <option value="Bought-out Item">Bought-out Item</option>
              <option value="Standard Component">Standard Component</option>
              <option value="Electrical">Electrical</option>
              <option value="Hardware">Hardware</option>
            </select>
          </div>

          {/* Shortage Only Checkbox */}
          <label className="flex items-center gap-2 text-xs text-[#544B45] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={shortageOnly}
              onChange={(e) => setShortageOnly(e.target.checked)}
              className="rounded bg-[#FAF7F2] border-[#EBE3DB] text-amber-500 focus:ring-amber-500"
            />
            <span className="font-semibold text-amber-400">Show Shortages Only (Quantity &gt; 0)</span>
          </label>
        </div>

        <div className="text-xs text-[#70665F]">
          Showing <span className="text-[#211B17] font-bold">{filteredRequirements.length}</span> material lines
        </div>
      </div>

      {/* MRP Results Table */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredRequirements.length && filteredRequirements.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded bg-white border-[#EBE3DB] text-crm-brand-600 focus:ring-crm-brand-600 cursor-pointer"
                  />
                </th>
                <th className="p-3">Job Number & BOM Ref</th>
                <th className="p-3">Part No & Item Name</th>
                <th className="p-3">Specification</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Required (A)</th>
                <th className="p-3 text-right text-emerald-400">Available (B)</th>
                <th className="p-3 text-right text-sky-400">On Order (C)</th>
                <th className="p-3 text-right text-amber-400">Shortage (A - B - C)</th>
                <th className="p-3">Required By</th>
                <th className="p-3">PR Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filteredRequirements.length > 0 ? (
                filteredRequirements.map(item => {
                  const isSelected = selectedItems.includes(item.id);
                  const isShort = item.shortageQuantity > 0;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#FAF7F2]/50 transition ${
                        isSelected ? 'bg-crm-brand-/30' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        {isShort ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectItem(item.id)}
                            className="rounded bg-white border-[#EBE3DB] text-crm-brand-600 focus:ring-crm-brand-600 cursor-pointer"
                          />
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="p-3 font-mono">
                        <div className="font-bold text-amber-400">{item.jobId}</div>
                        <div className="text-[10px] text-[#70665F]">
                          {item.bomId} <span className="text-[#70665F]">Rev-{item.bomRevision}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-[#211B17]">{item.itemName}</div>
                        <div className="font-mono text-[10px] text-[#70665F]">{item.partNumber}</div>
                      </td>
                      <td className="p-3 text-[#70665F] truncate max-w-[160px]" title={item.specification}>
                        {item.specification}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-[#FAF7F2] text-[#544B45] text-[10px] font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#211B17]">
                        {item.requiredQuantity} {item.unitOfMeasure}
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-400">
                        {item.availableStock} {item.unitOfMeasure}
                      </td>
                      <td className="p-3 text-right font-mono text-sky-400">
                        {item.onOrderQuantity} {item.unitOfMeasure}
                      </td>
                      <td className="p-3 text-right font-mono font-bold">
                        {isShort ? (
                          <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                            {item.shortageQuantity} {item.unitOfMeasure}
                          </span>
                        ) : (
                          <span className="text-emerald-400">0 (Fully Covered)</span>
                        )}
                      </td>
                      <td className="p-3 text-[#544B45] font-mono text-[11px]">{item.requiredByDate}</td>
                      <td className="p-3">
                        {item.procurementStatus === 'PR Created' ? (
                          <span className="px-2 py-0.5 rounded-full bg-crm-brand-600/20 text-crm-brand- text-[10px] font-semibold border border-crm-brand-600/30 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> PR Raised
                          </span>
                        ) : isShort ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" /> Action Needed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#70665F] text-[10px]">
                            Available
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-[#70665F]">
                    No material requirements found for selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
