'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import {
  Cpu,
  ShieldCheck,
  Truck,
  Plus,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Box,
  Layers,
  Search,
  Filter,
  Building,
  RefreshCw,
  Clock,
  ChevronRight,
  ArrowRight,
  X,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

function MRPContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'mrp';

  const {
    mrpRequirements = [],
    workOrders = [],
    materialIssues = [],
    itemMasters = [],
    addPurchaseRequisition,
    releaseWorkOrder,
    addMaterialIssue,
    openJobModal,
    currentUser,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'mrp' | 'availability' | 'issue'>(
    initialTab === 'availability' ? 'availability' : initialTab === 'issue' ? 'issue' : 'mrp'
  );

  const [selectedJob, setSelectedJob] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Issue modal fields
  const [issueWo, setIssueWo] = useState('');
  const [issueItemCode, setIssueItemCode] = useState('');
  const [issueQty, setIssueQty] = useState(1);
  const [issueRequestedBy, setIssueRequestedBy] = useState('');
  const [issueLocation, setIssueLocation] = useState('Bin-A1');
  const [issueRemarks, setIssueRemarks] = useState('');

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'availability' || t === 'issue' || t === 'mrp') {
      setActiveTab(t);
    }
  }, [searchParams]);

  // Derived filters
  const filteredMrp = (mrpRequirements || []).filter((m) => {
    const matchesJob = selectedJob === 'All' || !selectedJob || m.jobNumber === selectedJob;
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      m.itemCode?.toLowerCase().includes(q) ||
      m.itemName?.toLowerCase().includes(q) ||
      m.jobNumber?.toLowerCase().includes(q);
    return matchesJob && matchesSearch;
  });

  const selectedWo = (workOrders || []).find((w) => w.jobNumber === selectedJob) || workOrders[0];
  const woItems = (mrpRequirements || []).filter((m) => selectedJob === 'All' || m.jobNumber === selectedJob);

  const availableCount = woItems.filter((i) => (i.netRequirementQty || 0) <= 0).length;
  const shortageCount = woItems.filter((i) => (i.netRequirementQty || 0) > 0).length;
  const isFullyAvailable = shortageCount === 0;

  const filteredIssues = (materialIssues || []).filter((iss) => {
    const jobIdentifier = (iss as any).jobNumber || iss.jobId;
    const matchesJob = selectedJob === 'All' || !selectedJob || jobIdentifier === selectedJob;
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      iss.workOrderNumber?.toLowerCase().includes(q) ||
      jobIdentifier?.toLowerCase().includes(q) ||
      iss.requestedBy?.toLowerCase().includes(q);
    return matchesJob && matchesSearch;
  });

  // Action: Push PR
  const handlePushPR = (mrpId: string) => {
    const item = mrpRequirements.find((m) => m.id === mrpId);
    if (!item) return;

    addPurchaseRequisition({
      prNumber: `PR-MRP-${Date.now().toString().slice(-4)}`,
      requestedBy: currentUser?.name || 'MRP Engine',
      department: 'Production & Shop Floor',
      requisitionDate: new Date().toISOString().split('T')[0],
      requiredByDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
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
          specification: item.category || 'Raw Material',
          category: item.category || 'Material',
          requiredQuantity: item.netRequirementQty,
          unitOfMeasure: item.uom,
          estimatedUnitPrice: item.unitCost || 100,
          estimatedTotalPrice: (item.unitCost || 100) * item.netRequirementQty,
          remarks: 'Auto-triggered by MRP calculation engine',
        },
      ],
      totalItems: 1,
      estimatedCost: (item.unitCost || 100) * item.netRequirementQty,
      status: 'pending_approval',
    });

    alert(`Purchase Requisition created for ${item.itemName} (${item.netRequirementQty} ${item.uom})! Transferred to Purchase.`);
  };

  // Action: Issue Submit
  const handleCreateIssueSlip = (e: React.FormEvent) => {
    e.preventDefault();
    const wo = workOrders.find((w) => w.workOrderNumber === issueWo) || workOrders[0];
    const item = itemMasters.find((i) => i.itemCode === issueItemCode) || itemMasters[0];

    addMaterialIssue({
      issueDate: new Date().toISOString().split('T')[0],
      projectId: wo?.projectId || 'PRJ-2026-0001',
      jobId: wo?.jobId || 'PRJ-2026-0001',
      workOrderNumber: issueWo || wo?.workOrderNumber || 'WO-001',
      bomNumber: 'BOM-2026-001',
      bomRevision: wo?.bomRevision || 'Rev-01',
      productionStage: 'Fabrication & Welding',
      requestedBy: issueRequestedBy || currentUser?.name || 'Production Supervisor',
      issuedBy: 'Store Supervisor',
      warehouseId: 'WH-001',
      warehouseName: 'Raw Material Yard & Plate Store',
      items: [
        {
          id: `ISSITEM-${Date.now()}`,
          issueId: `ISS-${Date.now()}`,
          itemId: item?.id || 'ITEM-001',
          itemCode: issueItemCode || item?.itemCode || 'ITM-01',
          itemName: item?.itemName || 'Fabrication Material',
          requiredQuantity: issueQty,
          reservedQuantity: issueQty,
          issuedQuantity: issueQty,
          uom: item?.uom || 'Kg',
          unitPrice: item?.standardCost || 250,
          totalCost: (item?.standardCost || 250) * issueQty,
          locationCode: issueLocation,
        },
      ],
      totalIssueValue: (item?.standardCost || 250) * issueQty,
      remarks: issueRemarks || 'Issued for shop floor production execution.',
      status: 'Fully Issued',
    });

    setShowIssueModal(false);
    setIssueRemarks('');
    alert('Material Request Slip created successfully!');
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Card */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 border border-amber-500/20 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[#211B17] tracking-tight">
                Material Planning & Issue Hub (MRP)
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                Unified MRP & Issue Engine
              </span>
            </div>
            <p className="text-xs text-[#70665F] mt-0.5">
              Net Material Calculations, Stock Readiness Clearance, & Physical Store Issue Slips.
            </p>
          </div>
        </div>

        {/* Global Job Selector & Search */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-xs text-[#544B45]">
            <span className="text-[11px] text-[#8D7B70] font-semibold">Job Filter:</span>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="bg-transparent font-bold text-[#211B17] focus:outline-none cursor-pointer"
            >
              <option value="All">All Active Jobs</option>
              {Array.from(new Set((mrpRequirements || []).map((m) => m.jobNumber).filter(Boolean))).map((jb) => (
                <option key={jb} value={jb}>
                  {jb}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8D7B70]" />
            <input
              type="text"
              placeholder="Search items or codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-700"
            />
          </div>

          {activeTab === 'issue' && (
            <button
              onClick={() => {
                if (workOrders.length > 0 && !issueWo) setIssueWo(workOrders[0].workOrderNumber);
                if (itemMasters.length > 0 && !issueItemCode) setIssueItemCode(itemMasters[0].itemCode);
                setShowIssueModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Issue Slip</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Unified KPI Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#8D7B70] block">Total BOM Items Tracked</span>
          <span className="text-xl font-extrabold text-[#211B17] mt-0.5 block">{woItems.length} Items</span>
          <span className="text-[10px] text-crm-brand-600 font-bold">In Active Production</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#8D7B70] block">Stock Ready Items</span>
          <span className="text-xl font-extrabold text-emerald-700 mt-0.5 block">{availableCount} Covered</span>
          <span className="text-[10px] text-emerald-600 font-medium">Ready for allocation</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#8D7B70] block">Material Shortages</span>
          <span className={cn('text-xl font-extrabold mt-0.5 block', shortageCount > 0 ? 'text-amber-700' : 'text-emerald-700')}>
            {shortageCount} Shortages
          </span>
          <span className="text-[10px] text-[#8D7B70] font-medium">Requires Purchase Requisition</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#8D7B70] block">Store Issue Slips</span>
          <span className="text-xl font-extrabold text-[#211B17] mt-0.5 block">{materialIssues.length} Slips</span>
          <span className="text-[10px] text-blue-600 font-medium">Physical Shop Deliveries</span>
        </div>
      </div>

      {/* 3. Three-Tab Navigation Hub */}
      <div className="flex items-center gap-2 border-b border-[#EBE3DB] pb-2">
        <button
          onClick={() => setActiveTab('mrp')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer',
            activeTab === 'mrp'
              ? 'bg-crm-brand-700 hover:bg-crm-brand-800 text-white shadow-xs'
              : 'bg-white border border-[#EBE3DB] text-[#544B45] hover:bg-[#FAF7F2]'
          )}
        >
          <Cpu className="w-4 h-4" />
          <span>1. Material Requirement (MRP Engine)</span>
          <span
            className={cn(
              'px-1.5 py-0.2 rounded-full text-[10px] font-mono',
              activeTab === 'mrp' ? 'bg-white/20 text-white' : 'bg-[#EFE8DF] text-crm-brand-800'
            )}
          >
            {filteredMrp.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('availability')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer',
            activeTab === 'availability'
              ? 'bg-crm-brand-700 hover:bg-crm-brand-800 text-white shadow-xs'
              : 'bg-white border border-[#EBE3DB] text-[#544B45] hover:bg-[#FAF7F2]'
          )}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>2. Stock Availability Check</span>
          <span
            className={cn(
              'px-1.5 py-0.2 rounded-full text-[10px] font-mono',
              activeTab === 'availability' ? 'bg-white/20 text-white' : 'bg-[#EFE8DF] text-crm-brand-800'
            )}
          >
            {isFullyAvailable ? 'Ready' : `${shortageCount} Short`}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('issue')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer',
            activeTab === 'issue'
              ? 'bg-crm-brand-700 hover:bg-crm-brand-800 text-white shadow-xs'
              : 'bg-white border border-[#EBE3DB] text-[#544B45] hover:bg-[#FAF7F2]'
          )}
        >
          <Truck className="w-4 h-4" />
          <span>3. Material Request & Store Issue Slips</span>
          <span
            className={cn(
              'px-1.5 py-0.2 rounded-full text-[10px] font-mono',
              activeTab === 'issue' ? 'bg-white/20 text-white' : 'bg-[#EFE8DF] text-crm-brand-800'
            )}
          >
            {filteredIssues.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MRP ENGINE TABLE                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'mrp' && (
        <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#EBE3DB] bg-[#FAF7F2]/60 flex items-center justify-between">
            <div className="text-xs text-[#70665F]">
              <span className="font-bold text-[#211B17]">MRP Net Formula:</span> Net Req Qty = Required Qty - (Available Stock - Reserved) - Open PO Qty
            </div>
            <div className="text-xs text-[#8D7B70]">
              Showing <span className="font-bold text-[#211B17]">{filteredMrp.length}</span> calculation rows
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#544B45]">
              <thead className="bg-[#FAF7F2] text-[#70665F] font-bold uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
                <tr>
                  <th className="p-3.5">Job Number</th>
                  <th className="p-3.5">Item Code & Name</th>
                  <th className="p-3.5 text-right">Required Qty</th>
                  <th className="p-3.5 text-right">Available Stock</th>
                  <th className="p-3.5 text-right">Reserved Stock</th>
                  <th className="p-3.5 text-right">Open PO Qty</th>
                  <th className="p-3.5 text-right">Net Req Qty</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Procurement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE3DB]">
                {filteredMrp.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-[#8D7B70]">
                      No MRP items matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredMrp.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAF7F2]/60 transition">
                      <td className="p-3.5 font-mono font-bold text-crm-brand-700">{item.jobNumber}</td>
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-[#211B17]">{item.itemCode}</div>
                        <div className="text-[11px] text-[#70665F] font-medium">{item.itemName}</div>
                      </td>
                      <td className="p-3.5 text-right font-bold text-[#211B17]">
                        {item.requiredQuantity} {item.uom}
                      </td>
                      <td className="p-3.5 text-right font-mono text-emerald-700 font-semibold">
                        {item.availableStockQty} {item.uom}
                      </td>
                      <td className="p-3.5 text-right font-mono text-amber-700">
                        {item.reservedStockQty} {item.uom}
                      </td>
                      <td className="p-3.5 text-right font-mono text-blue-700">
                        {item.openPoQty} {item.uom}
                      </td>
                      <td className="p-3.5 text-right font-mono font-extrabold text-sm">
                        <span className={item.netRequirementQty > 0 ? 'text-amber-800' : 'text-emerald-700'}>
                          {item.netRequirementQty} {item.uom}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
                            item.materialStatus === 'Available'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-900 border-amber-200'
                          )}
                        >
                          {item.materialStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {item.netRequirementQty > 0 ? (
                          <button
                            onClick={() => handlePushPR(item.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition text-[11px] shadow-2xs cursor-pointer ml-auto"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Push to PR</span>
                          </button>
                        ) : (
                          <span className="text-emerald-700 text-[11px] font-bold flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Covered
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MATERIAL AVAILABILITY CHECK                                        */}
      {/* ========================================================================= */}
      {activeTab === 'availability' && (
        <div className="space-y-4">
          {/* Readiness Banner */}
          <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#8D7B70]">Selected Work Order:</span>
                <span className="font-mono font-bold text-sm text-[#211B17]">
                  {selectedWo?.workOrderNumber || 'WO-001'} ({selectedWo?.jobNumber || selectedJob})
                </span>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-md text-[10px] font-bold border',
                    isFullyAvailable
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  )}
                >
                  {isFullyAvailable ? 'Fully Cleared / Stock Ready' : `${shortageCount} Shortages Remaining`}
                </span>
              </div>
              <p className="text-xs text-[#70665F]">
                Verify physical store inventory before authorizing work order release to shop floor operators.
              </p>
            </div>

            {selectedWo && (
              <button
                onClick={() => {
                  releaseWorkOrder(selectedWo.id);
                  alert(`Work Order ${selectedWo.workOrderNumber} authorized and released to shop floor!`);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Authorize Work Order Release</span>
              </button>
            )}
          </div>

          {/* Checklist Table */}
          <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#EBE3DB] bg-[#FAF7F2]/60">
              <h3 className="text-xs font-bold text-[#211B17] flex items-center gap-2">
                <Box className="w-4 h-4 text-emerald-700" />
                BOM Material Stock Checklist
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#544B45]">
                <thead className="bg-[#FAF7F2] text-[#70665F] font-bold uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
                  <tr>
                    <th className="p-3.5">Item Code & Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-right">Required Qty</th>
                    <th className="p-3.5 text-right">Physical Stock</th>
                    <th className="p-3.5 text-right">Shortage</th>
                    <th className="p-3.5">Availability Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]">
                  {woItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#8D7B70]">
                        No BOM items registered for this job.
                      </td>
                    </tr>
                  ) : (
                    woItems.map((itm) => {
                      const isReady = (itm.netRequirementQty || 0) <= 0;
                      return (
                        <tr key={itm.id} className="hover:bg-[#FAF7F2]/60 transition">
                          <td className="p-3.5">
                            <div className="font-mono font-bold text-[#211B17]">{itm.itemCode}</div>
                            <div className="text-[11px] text-[#70665F]">{itm.itemName}</div>
                          </td>
                          <td className="p-3.5 font-medium">{itm.category || 'Raw Material'}</td>
                          <td className="p-3.5 text-right font-bold text-[#211B17]">
                            {itm.requiredQuantity} {itm.uom}
                          </td>
                          <td className="p-3.5 text-right font-mono font-semibold text-emerald-700">
                            {itm.availableStockQty} {itm.uom}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold">
                            <span className={itm.netRequirementQty > 0 ? 'text-amber-800' : 'text-emerald-700'}>
                              {itm.netRequirementQty > 0 ? `${itm.netRequirementQty} ${itm.uom}` : 'Nil'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
                                isReady
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-50 text-amber-900 border-amber-200'
                              )}
                            >
                              {isReady ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 100% Ready
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-3 h-3 text-amber-600" /> Shortage
                                </>
                              )}
                            </span>
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
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MATERIAL REQUEST & ISSUE SLIPS                                     */}
      {/* ========================================================================= */}
      {activeTab === 'issue' && (
        <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#EBE3DB] bg-[#FAF7F2]/60 flex items-center justify-between">
            <div className="text-xs text-[#70665F]">
              <span className="font-bold text-[#211B17]">Store-Production Interface:</span> Material Requisitions & Approved Physical Store Issue Slips.
            </div>
            <button
              onClick={() => {
                if (workOrders.length > 0 && !issueWo) setIssueWo(workOrders[0].workOrderNumber);
                if (itemMasters.length > 0 && !issueItemCode) setIssueItemCode(itemMasters[0].itemCode);
                setShowIssueModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Request Slip</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#544B45]">
              <thead className="bg-[#FAF7F2] text-[#70665F] font-bold uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
                <tr>
                  <th className="p-3.5">Issue Slip #</th>
                  <th className="p-3.5">Job / WO #</th>
                  <th className="p-3.5">Stage / Department</th>
                  <th className="p-3.5">Requested By</th>
                  <th className="p-3.5">Issued From Store</th>
                  <th className="p-3.5">Items Summary</th>
                  <th className="p-3.5 text-right">Value (₹)</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE3DB]">
                {filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[#8D7B70]">
                      No material issue slips recorded yet. Click &quot;+ New Issue Slip&quot; to raise a requisition.
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map((iss) => (
                    <tr key={iss.id} className="hover:bg-[#FAF7F2]/60 transition">
                      <td className="p-3.5 font-mono font-bold text-crm-brand-700">{iss.issueNumber || iss.id}</td>
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-[#211B17]">{iss.workOrderNumber}</div>
                        <div className="text-[11px] text-[#70665F] font-mono">{(iss as any).jobNumber || iss.jobId}</div>
                      </td>
                      <td className="p-3.5 font-medium">{iss.productionStage || 'Assembly & Welding'}</td>
                      <td className="p-3.5 font-medium">{iss.requestedBy}</td>
                      <td className="p-3.5 text-[#70665F] text-[11px]">{iss.warehouseName || 'Raw Material Store'}</td>
                      <td className="p-3.5">
                        {iss.items && iss.items.length > 0 ? (
                          <div>
                            <span className="font-bold text-[#211B17]">{iss.items[0].itemName}</span>
                            <span className="text-[11px] text-[#8D7B70] block">
                              {iss.items[0].issuedQuantity} {iss.items[0].uom}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#8D7B70]">1 Line Item</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-[#211B17]">
                        ₹{(iss.totalIssueValue || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {iss.status || 'Fully Issued'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE MATERIAL ISSUE SLIP                                         */}
      {/* ========================================================================= */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#EBE3DB] shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-crm-brand-700" />
                <h3 className="font-bold text-base text-[#211B17]">New Material Requisition & Issue Slip</h3>
              </div>
              <button
                onClick={() => setShowIssueModal(false)}
                className="p-1 rounded-lg text-[#8D7B70] hover:bg-[#FAF7F2] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIssueSlip} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#544B45] mb-1">Target Work Order</label>
                <select
                  value={issueWo}
                  onChange={(e) => setIssueWo(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] font-semibold focus:outline-none focus:border-crm-brand-700"
                >
                  {workOrders.map((w) => (
                    <option key={w.id} value={w.workOrderNumber}>
                      {w.workOrderNumber} - {w.productName} ({w.jobNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#544B45] mb-1">Item Required from Store</label>
                <select
                  value={issueItemCode}
                  onChange={(e) => setIssueItemCode(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] font-semibold focus:outline-none focus:border-crm-brand-700"
                >
                  {itemMasters.map((i) => (
                    <option key={i.id} value={i.itemCode}>
                      {i.itemCode} - {i.itemName} ({i.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#544B45] mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={issueQty}
                    onChange={(e) => setIssueQty(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] font-mono font-bold focus:outline-none focus:border-crm-brand-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#544B45] mb-1">Store Bin / Location</label>
                  <input
                    type="text"
                    value={issueLocation}
                    onChange={(e) => setIssueLocation(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#544B45] mb-1">Requested By (Supervisor / Operator)</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Patel (Fabrication Incharge)"
                  value={issueRequestedBy}
                  onChange={(e) => setIssueRequestedBy(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#544B45] mb-1">Remarks / Operation Stage</label>
                <input
                  type="text"
                  placeholder="e.g. Required for Shell Rolling and Flange fitment"
                  value={issueRemarks}
                  onChange={(e) => setIssueRemarks(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#D5CAC0] bg-white text-xs font-bold text-[#544B45] hover:bg-[#FAF7F2] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Create & Issue Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MRPPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#8D7B70]">Loading MRP Hub...</div>}>
      <MRPContent />
    </Suspense>
  );
}
