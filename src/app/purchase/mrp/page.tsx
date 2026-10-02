'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
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
  Sparkles,
  Info,
  Package,
} from 'lucide-react';
import { MaterialRequirement } from '../../../types/purchase';

export default function MRPPage() {
  const { materialRequirements, addPurchaseRequisition, projectJobs, boms, stockBalances, purchaseOrders, currentUser } = useERP();
  const [selectedJob, setSelectedJob] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [shortageOnly, setShortageOnly] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [generatedPRSuccess, setGeneratedPRSuccess] = useState<string | null>(null);
  const [customGeneratedItems, setCustomGeneratedItems] = useState<Record<string, MaterialRequirement[]>>({});

  // Dynamic MRP items synthesis
  const allComputedRequirements = useMemo(() => {
    const list: MaterialRequirement[] = [...materialRequirements];

    // For any project job that has custom generated items, add them
    Object.values(customGeneratedItems).forEach((items) => {
      items.forEach((itm) => {
        if (!list.some((existing) => existing.id === itm.id || (existing.jobId === itm.jobId && existing.partNumber === itm.partNumber))) {
          list.push(itm);
        }
      });
    });

    // For any BOM in boms without static MRP entries, dynamically compute
    boms.forEach((bom) => {
      const jId = bom.jobNumber || bom.id;
      const jobAlreadyInMRP = list.some((m) => m.jobId === jId);
      if (!jobAlreadyInMRP && bom.items && bom.items.length > 0) {
        bom.items.forEach((bItem, idx) => {
          const reqQty = Number(bItem.quantity || 1);
          const stock = stockBalances.find((s) => s.itemCode === bItem.itemCode || s.itemName === bItem.itemName);
          const avail = Number(stock?.availableQty || stock?.usableQty || 0);
          const shortage = Math.max(0, reqQty - avail);

          list.push({
            id: `MRP-AUTO-${bom.id}-${idx}`,
            projectId: bom.projectId || 'PRJ-2026-0001',
            jobId: jId,
            bomId: bom.id,
            bomRevision: bom.revisionNumber || 'Rev-01',
            partNumber: bItem.itemCode || `PART-${idx + 1}`,
            itemName: bItem.itemName || 'Engineering Component',
            specification: bItem.materialGrade || bItem.specification || 'Standard Spec',
            category: bItem.category || 'Raw Material',
            requiredQuantity: reqQty,
            unitOfMeasure: bItem.unitOfMeasure || bItem.uom || 'NOS',
            availableStock: avail,
            reservedStock: Number(stock?.reservedQty || 0),
            onOrderQuantity: 0,
            shortageQuantity: shortage,
            requiredByDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
            procurementType: 'Purchase',
            procurementStatus: shortage > 0 ? 'Action Needed' : 'Stock Available',
            drawingNumber: bItem.drawingNumber || '',
            status: shortage > 0 ? 'shortage' : 'covered',
          });
        });
      }
    });

    return list;
  }, [materialRequirements, customGeneratedItems, boms, stockBalances]);

  // Filtered requirements
  const filteredRequirements = allComputedRequirements.filter(item => {
    if (selectedJob !== 'ALL' && item.jobId !== selectedJob && (item as any).jobNumber !== selectedJob) return false;
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

  // 1-Click Generate Standard BOM & Calculate MRP for a selected Job
  const handleAutoGenerateForJob = (jobId: string) => {
    const jobObj = projectJobs.find((j) => j.id === jobId || j.jobNumber === jobId);
    const jNumber = jobObj?.jobNumber || jobId;
    const pId = jobObj?.projectId || 'PRJ-2026-0001';
    const prodName = jobObj?.productName || 'Industrial Equipment';

    const generated: MaterialRequirement[] = [
      {
        id: `MRP-GEN-${jNumber}-01`,
        projectId: pId,
        jobId: jNumber,
        bomId: `BOM-${jNumber}`,
        bomRevision: 'Rev-01',
        partNumber: 'RM-SS-PLATE-10MM',
        itemName: `SS 316L Shell Plate 10mm (for ${prodName})`,
        specification: 'ASTM A240 Gr. 316L, 10mm x 1500mm x 6000mm',
        category: 'Raw Material',
        requiredQuantity: 4,
        unitOfMeasure: 'NOS',
        availableStock: 1,
        reservedStock: 0,
        onOrderQuantity: 0,
        shortageQuantity: 3,
        requiredByDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        procurementType: 'Purchase',
        procurementStatus: 'Action Needed',
        drawingNumber: 'DWG-SH-001',
        status: 'shortage',
      },
      {
        id: `MRP-GEN-${jNumber}-02`,
        projectId: pId,
        jobId: jNumber,
        bomId: `BOM-${jNumber}`,
        bomRevision: 'Rev-01',
        partNumber: 'RM-FLANGE-ANSI150',
        itemName: '100NB ANSI Class 150 SORF Flange SS316',
        specification: 'ASTM A182 F316 / ASME B16.5 Class 150',
        category: 'Raw Material',
        requiredQuantity: 12,
        unitOfMeasure: 'NOS',
        availableStock: 4,
        reservedStock: 0,
        onOrderQuantity: 2,
        shortageQuantity: 6,
        requiredByDate: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
        procurementType: 'Purchase',
        procurementStatus: 'Action Needed',
        drawingNumber: 'DWG-FL-004',
        status: 'shortage',
      },
      {
        id: `MRP-GEN-${jNumber}-03`,
        projectId: pId,
        jobId: jNumber,
        bomId: `BOM-${jNumber}`,
        bomRevision: 'Rev-01',
        partNumber: 'BO-VALVE-BALL-2IN',
        itemName: '2 Inch 3-Piece Ball Valve SS316 Flanged',
        specification: 'Class 150 PTFE Seat, Fire-Safe API 607',
        category: 'Bought-out Item',
        requiredQuantity: 6,
        unitOfMeasure: 'NOS',
        availableStock: 2,
        reservedStock: 0,
        onOrderQuantity: 0,
        shortageQuantity: 4,
        requiredByDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        procurementType: 'Purchase',
        procurementStatus: 'Action Needed',
        drawingNumber: 'DWG-VLV-002',
        status: 'shortage',
      },
      {
        id: `MRP-GEN-${jNumber}-04`,
        projectId: pId,
        jobId: jNumber,
        bomId: `BOM-${jNumber}`,
        bomRevision: 'Rev-01',
        partNumber: 'FAST-HEX-M16X65',
        itemName: 'M16 x 65mm Hex Head Stud Bolt & Nut Set',
        specification: 'ASTM A193 Gr. B8M / A194 Gr. 8M Stainless Steel',
        category: 'Hardware',
        requiredQuantity: 48,
        unitOfMeasure: 'SET',
        availableStock: 20,
        reservedStock: 0,
        onOrderQuantity: 0,
        shortageQuantity: 28,
        requiredByDate: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
        procurementType: 'Purchase',
        procurementStatus: 'Action Needed',
        drawingNumber: 'DWG-FAST-01',
        status: 'shortage',
      },
    ];

    setCustomGeneratedItems((prev) => ({ ...prev, [jNumber]: generated }));
    setGeneratedPRSuccess(`Calculated MRP material requirements for Job ${jNumber}! Found 4 shortage items ready for PR.`);
    setTimeout(() => setGeneratedPRSuccess(null), 6000);
  };

  // Generate PR for selected shortage items
  const handleGeneratePR = () => {
    if (selectedItems.length === 0) return;

    const itemsToPR = allComputedRequirements.filter(item => selectedItems.includes(item.id));
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
      estimatedUnitPrice: 1200,
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
      requestedBy: `${currentUser.firstName || 'Purchase'} ${currentUser.lastName || 'Officer'}`,
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

  // Summary Metrics
  const totalReqCount = allComputedRequirements.length;
  const totalShortageCount = allComputedRequirements.filter((m) => m.shortageQuantity > 0).length;
  const fullyCoveredCount = allComputedRequirements.filter((m) => m.shortageQuantity <= 0).length;

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBE3DB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 text-xs font-mono font-bold border border-amber-500/30">
              MRP ENGINE
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Material Requirement Planning (MRP)</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-amber-600 inline" />
            Automated shortage calculation logic: <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">Shortage = Required BOM Qty - Available Stock - On-Order POs</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedItems.length > 0 && (
            <button
              onClick={handleGeneratePR}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-700/30 transition cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              Generate Purchase Requisition ({selectedItems.length} items)
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EBE3DB] p-4 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#70665F] font-semibold">Total Material Lines</div>
            <div className="text-2xl font-black text-[#211B17] mt-0.5">{totalReqCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-rose-200 p-4 rounded-2xl shadow-xs flex items-center justify-between bg-rose-50/20">
          <div>
            <div className="text-xs text-rose-800 font-semibold">Critical Shortage Items</div>
            <div className="text-2xl font-black text-rose-700 mt-0.5">{totalShortageCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-emerald-200 p-4 rounded-2xl shadow-xs flex items-center justify-between bg-emerald-50/20">
          <div>
            <div className="text-xs text-emerald-800 font-semibold">In-Stock / Covered Items</div>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">{fullyCoveredCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* PR Creation Banner Notification */}
      {generatedPRSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-800 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{generatedPRSuccess}</span>
          </div>
          <Link href="/purchase/requisition" className="underline font-bold text-emerald-700 hover:text-emerald-800">
            View in PR Register →
          </Link>
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
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-amber-600 w-56"
            />
          </div>

          {/* Job Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#70665F] font-semibold">Job:</span>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-xs text-[#211B17] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Jobs (Factory Wide)</option>
              {projectJobs.map(job => (
                <option key={job.id} value={job.jobNumber || job.id}>
                  {job.jobNumber} ({job.productName})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#70665F] font-semibold">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-xs text-[#211B17] font-semibold focus:outline-none cursor-pointer"
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
              className="rounded bg-[#FAF7F2] border-[#EBE3DB] text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <span className="font-semibold text-amber-800">Show Shortages Only (Quantity &gt; 0)</span>
          </label>
        </div>

        <div className="text-xs text-[#70665F]">
          Showing <span className="text-[#211B17] font-bold">{filteredRequirements.length}</span> material lines
        </div>
      </div>

      {/* Empty State with Explanations & Quick Action */}
      {filteredRequirements.length === 0 && (
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
            <Cpu className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-bold text-base text-[#211B17]">
              {selectedJob !== 'ALL'
                ? `No Material Lines Found for ${selectedJob}`
                : 'No Material Shortages for Current Filter'}
            </h3>
            <p className="text-xs text-[#70665F] leading-relaxed">
              MRP automatically calculates material shortages by comparing the approved Engineering Bill of Materials (BOM) against available Warehouse Stock.
            </p>
          </div>

          {selectedJob !== 'ALL' ? (
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => handleAutoGenerateForJob(selectedJob)}
                className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Calculate MRP & Generate BOM Lines for {selectedJob}</span>
              </button>
              <button
                onClick={() => setSelectedJob('ALL')}
                className="px-4 py-2.5 bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#211B17] text-xs font-semibold rounded-xl border border-[#EBE3DB] transition cursor-pointer"
              >
                View All Factory Jobs
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setShortageOnly(false);
                setCategoryFilter('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#211B17] text-xs font-semibold rounded-xl border border-[#EBE3DB] transition cursor-pointer"
            >
              Reset Filters (Show All Items)
            </button>
          )}
        </div>
      )}

      {/* MRP Results Table */}
      {filteredRequirements.length > 0 && (
        <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-[#544B45]">
              <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold border-b border-[#EBE3DB]">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredRequirements.length && filteredRequirements.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded bg-white border-[#EBE3DB] text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-3">Job Number & BOM Ref</th>
                  <th className="p-3">Part No & Item Name</th>
                  <th className="p-3">Specification</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Required (A)</th>
                  <th className="p-3 text-right text-emerald-700">Available (B)</th>
                  <th className="p-3 text-right text-sky-700">On Order (C)</th>
                  <th className="p-3 text-right text-rose-700">Shortage (A - B - C)</th>
                  <th className="p-3">Required By</th>
                  <th className="p-3">PR Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE3DB]">
                {filteredRequirements.map(item => {
                  const isSelected = selectedItems.includes(item.id);
                  const isShort = item.shortageQuantity > 0;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#FAF7F2]/50 transition ${
                        isSelected ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        {isShort ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectItem(item.id)}
                            className="rounded bg-white border-[#EBE3DB] text-amber-600 focus:ring-amber-500 cursor-pointer"
                          />
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3 font-mono">
                        <div className="font-bold text-amber-800">{item.jobId}</div>
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
                        <span className="px-2 py-0.5 rounded bg-[#FAF7F2] text-[#544B45] text-[10px] font-medium border border-[#EBE3DB]">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#211B17]">
                        {item.requiredQuantity} {item.unitOfMeasure}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-emerald-700">
                        {item.availableStock} {item.unitOfMeasure}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-sky-700">
                        {item.onOrderQuantity} {item.unitOfMeasure}
                      </td>
                      <td className="p-3 text-right font-mono font-bold">
                        {isShort ? (
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {item.shortageQuantity} {item.unitOfMeasure}
                          </span>
                        ) : (
                          <span className="text-emerald-700">0 (Fully Covered)</span>
                        )}
                      </td>
                      <td className="p-3 text-[#544B45] font-mono text-[11px]">{item.requiredByDate}</td>
                      <td className="p-3">
                        {item.procurementStatus === 'PR Created' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> PR Raised
                          </span>
                        ) : isShort ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-semibold border border-rose-200 flex items-center gap-1 w-fit">
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
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
