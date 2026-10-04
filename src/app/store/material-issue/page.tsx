'use client';

import React, { useState, useEffect } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  Truck,
  Plus,
  Search,
  Cpu,
  FileText,
  CheckCircle,
  Eye,
  Building2,
  Package,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Printer,
  X,
} from 'lucide-react';

export default function MaterialIssuePage() {
  const { materialIssues, addMaterialIssue, projectJobs, itemMasters, warehouses, stockBalances, openJobModal } = useERP();
  
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJob, setFilterJob] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewVoucher, setViewVoucher] = useState<any | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form State
  const [jobId, setJobId] = useState('JOB-2026-001');
  const [woNo, setWoNo] = useState('WO-2026-001-A');
  const [bomNo, setBomNo] = useState('BOM-2026-001');
  const [bomRev, setBomRev] = useState('Rev-01');
  const [stage, setStage] = useState('Shell & Dish End Cutting / Rolling');
  const [itemId, setItemId] = useState(itemMasters[0]?.id || 'ITEM-001');
  const [issueQty, setIssueQty] = useState(3200);
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || 'WH-001');
  const [requestedBy, setRequestedBy] = useState('Bhavin Shah (Production Head)');
  const [issuedBy, setIssuedBy] = useState('Hitesh Rawal (Store Incharge)');
  const [batchLot, setBatchLot] = useState('HEAT-98421');
  const [remarks, setRemarks] = useState('Issued SS 316L plates for main vessel shell rolling as per approved drawing.');

  const defaultItem = {
    id: 'ITEM-001',
    itemCode: 'RAW-SS316L-PL-10',
    itemName: 'SS 316L Stainless Steel Plate 10mm',
    uom: 'KG',
    standardCost: 150,
  };
  const defaultWh = {
    id: 'WH-001',
    warehouseName: 'Raw Material Yard & Plate Store',
    warehouseCode: 'STORE-BAY-01',
  };

  const selectedItem = itemMasters.find((i) => i.id === itemId) || itemMasters[0] || defaultItem;
  const selectedWh = warehouses.find((w) => w.id === warehouseId) || warehouses[0] || defaultWh;
  const selectedJob = projectJobs.find((j) => j.jobNumber === jobId || j.id === jobId) || projectJobs[0] || {
    id: 'PRJ-2026-0001',
    jobNumber: 'JOB-2026-001',
    customerName: 'Reliance Industries',
    productName: 'Chemical Reactor Vessel 10KL',
  };

  // Find live stock balance for selected item
  const currentStock = stockBalances.find((s) => s.itemId === itemId || s.itemCode === selectedItem?.itemCode);
  const availableUsableQty = currentStock?.usableQty ?? currentStock?.availableQty ?? 15000;

  // Auto-populate work order and BOM when job changes
  const handleJobChange = (newJobCode: string) => {
    setJobId(newJobCode);
    const job = projectJobs.find((j) => j.jobNumber === newJobCode || j.id === newJobCode);
    if (job) {
      setWoNo(`WO-${job.jobNumber.replace('JOB-', '')}-A`);
      setBomNo(`BOM-${job.jobNumber.replace('JOB-', '')}`);
    }
  };

  const filtered = materialIssues.filter((i) => {
    const matchesSearch =
      !searchTerm?.trim() ||
      i.issueNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      i.jobId?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      i.requestedBy?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      (i as any).customerName?.toLowerCase().includes(searchTerm?.toLowerCase());

    const matchesJob = filterJob === 'ALL' || i.jobId === filterJob;
    return matchesSearch && matchesJob;
  });

  // Calculate Metrics
  const totalIssuesCount = materialIssues.length;
  const totalIssueValue = materialIssues.reduce((sum, item) => sum + Number(item.totalIssueValue || (item as any).total_issue_value || 0), 0);
  const activeJobsSet = new Set(materialIssues.map((i) => i.jobId).filter(Boolean));
  const uniqueJobsCount = activeJobsSet.size;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !selectedWh) return;

    const rate = selectedItem.standardCost || (selectedItem as any).unitPrice || 150;
    const totalCost = issueQty * rate;

    addMaterialIssue({
      issueDate: new Date().toISOString().split('T')[0],
      projectId: selectedJob?.id || 'PRJ-2026-0001',
      jobId: selectedJob?.jobNumber || jobId,
      workOrderNumber: woNo,
      bomNumber: bomNo,
      bomRevision: bomRev,
      productionStage: stage,
      requestedBy,
      issuedBy,
      warehouseId: selectedWh.id,
      warehouseName: selectedWh.warehouseName,
      status: 'Fully Issued',
      totalIssueValue: totalCost,
      remarks,
      items: [
        {
          id: `iss-item-${Date.now().toString().slice(-4)}`,
          issueId: '',
          itemId: selectedItem.id,
          itemCode: selectedItem.itemCode,
          itemName: selectedItem.itemName,
          requiredQuantity: issueQty,
          reservedQuantity: issueQty,
          issuedQuantity: issueQty,
          uom: selectedItem.uom,
          unitPrice: rate,
          totalCost: totalCost,
          batchLot: batchLot || `HEAT-${Math.floor(10000 + Math.random() * 90000)}`,
          locationCode: selectedWh.warehouseCode || 'STORE-BAY-01',
          remarks: remarks || 'Issued for production execution',
        },
      ],
    });

    setIsModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="p-6 bg-[#FAF7F2] min-h-screen text-[#544B45] flex items-center justify-center">
        <div className="text-xs font-mono text-[#70665F]">Loading Material Issues...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45]" suppressHydrationWarning>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-xs font-mono font-semibold">
              STORE DISPATCH & LOGISTICS
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Material Issue to Production</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Store issue slips reducing inventory balances upon issuing raw materials & components to production shop floors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Issue Material Slip
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70665F]">Total Slips Issued</div>
            <div className="text-2xl font-black text-[#211B17] mt-1 font-mono">{totalIssuesCount}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Verified & Dispatched</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70665F]">Total Issued Value</div>
            <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
              ₹{totalIssueValue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#70665F] mt-0.5">Raw materials & parts</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70665F]">Active Jobs Linked</div>
            <div className="text-2xl font-black text-amber-600 mt-1 font-mono">{uniqueJobsCount}</div>
            <div className="text-[11px] text-[#70665F] mt-0.5">Shop floor execution</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70665F]">Inventory Status</div>
            <div className="text-2xl font-black text-sky-600 mt-1 font-mono">Real-time</div>
            <div className="text-[11px] text-sky-600 font-medium mt-0.5">Auto Stock Deductions</div>
          </div>
          <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
            <input
              type="text"
              placeholder="Search issue slip no, job no, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] placeholder-[#70665F] focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={filterJob}
            onChange={(e) => setFilterJob(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none focus:border-emerald-500 font-mono"
          >
            <option value="ALL">All Jobs</option>
            {projectJobs.map((j) => (
              <option key={`filter-job-${j.id}`} value={j.jobNumber}>
                {j.jobNumber} {j.customerName ? `(${j.customerName})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-[#70665F] font-mono">
          Showing <span className="text-[#211B17] font-bold">{filtered.length}</span> of{' '}
          <span className="text-[#211B17] font-bold">{materialIssues.length}</span> Slips
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-mono text-[11px] uppercase tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">Issue Slip No & Date</th>
                <th className="p-3.5">Job No & Customer</th>
                <th className="p-3.5">BOM & Production Stage</th>
                <th className="p-3.5">Issued Material Items</th>
                <th className="p-3.5">Requested By</th>
                <th className="p-3.5 text-right">Issued Value (₹)</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#70665F]">
                    No material issues found matching current filters. Click &quot;Issue Material Slip&quot; to issue raw materials.
                  </td>
                </tr>
              ) : (
                filtered.map((i, idx) => {
                  const issNo = i.issueNumber || (i as any).issue_number || i.id;
                  const issDate = i.issueDate || (i as any).issue_date || new Date().toISOString().split('T')[0];
                  const jobCode = i.jobId || (i as any).job_number || (i as any).jobNumber || 'JOB-2026-001';
                  const matchedJob = projectJobs.find((j) => j.jobNumber === jobCode || j.id === jobCode);
                  const custName = (i as any).customerName || matchedJob?.customerName || 'Reliance Industries';
                  const woCode = i.workOrderNumber || (i as any).work_order_number || 'WO-2026-001-A';
                  const bomCode = i.bomNumber || (i as any).bom_number || 'BOM-2026-001';
                  const bomRevVal = i.bomRevision || (i as any).bom_revision || 'Rev-01';
                  const prodStage = i.productionStage || (i as any).production_stage || 'Shell & Dish End Cutting / Rolling';
                  const reqBy = i.requestedBy || (i as any).requested_by || (i as any).issued_to || 'Bhavin Shah (Production Head)';
                  const issVal = Number(i.totalIssueValue ?? (i as any).total_issue_value ?? 0);
                  const issStatus = i.status || 'Fully Issued';
                  const itemsCount = Array.isArray(i.items) ? i.items.length : 1;
                  const firstItem = Array.isArray(i.items) && i.items[0] ? i.items[0] : null;

                  return (
                    <tr key={`${i.id || 'iss'}-${idx}`} className="hover:bg-[#FAF7F2]/60 transition">
                      <td className="p-3.5 font-medium">
                        <div className="font-bold text-emerald-700 text-xs font-mono">{issNo}</div>
                        <div className="text-[10px] text-[#70665F] mt-0.5">{issDate}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-amber-700 text-xs flex items-center gap-1 font-mono">
                          <Cpu className="w-3.5 h-3.5 text-amber-500" />
                          {jobCode}
                        </div>
                        <div className="text-[11px] font-semibold text-[#211B17] mt-0.5">{custName}</div>
                        <div className="text-[10px] text-[#70665F]">WO: {woCode}</div>
                      </td>
                      <td className="p-3.5 text-[#544B45]">
                        <div className="font-semibold text-[#211B17]">
                          {bomCode} ({bomRevVal})
                        </div>
                        <div className="text-[10px] text-[#70665F] mt-0.5">{prodStage}</div>
                      </td>
                      <td className="p-3.5">
                        {firstItem ? (
                          <div>
                            <div className="font-bold text-[#211B17]">{firstItem.itemName}</div>
                            <div className="text-[10px] text-[#70665F] font-mono">
                              Qty: {firstItem.issuedQuantity || firstItem.requiredQuantity} {firstItem.uom} | Lot: {firstItem.batchLot || 'HEAT-98421'}
                            </div>
                            {itemsCount > 1 && (
                              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                                + {itemsCount - 1} more items
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#70665F]">{itemsCount} Items</span>
                        )}
                      </td>
                      <td className="p-3.5 font-medium text-[#211B17]">{reqBy}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                        ₹{issVal.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                          {issStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewVoucher(i)}
                            className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-emerald-50 text-emerald-700 border border-[#EBE3DB] hover:border-emerald-300 text-[11px] font-bold transition flex items-center gap-1"
                            title="View Dispatch Slip"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Voucher
                          </button>
                          {openJobModal && (
                            <button
                              onClick={() => openJobModal(jobCode)}
                              className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-[11px] font-bold transition"
                              title="Trace Job 360°"
                            >
                              Trace
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Issue Material Slip */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  Issue Material Slip to Production
                </h2>
                <p className="text-[11px] text-[#70665F]">Deduct raw material from store stock and allocate directly to job work order.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Job & Work Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Target Job / Project *</label>
                  <select
                    value={jobId}
                    onChange={(e) => handleJobChange(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    {projectJobs.map((j) => (
                      <option key={`modal-job-${j.id}`} value={j.jobNumber}>
                        {j.jobNumber} — {j.customerName ? `[${j.customerName}] ` : ''}{j.productName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Work Order Reference</label>
                  <input
                    type="text"
                    value={woNo}
                    onChange={(e) => setWoNo(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* BOM & Stage */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">BOM Number</label>
                  <input
                    type="text"
                    value={bomNo}
                    onChange={(e) => setBomNo(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">BOM Revision</label>
                  <input
                    type="text"
                    value={bomRev}
                    onChange={(e) => setBomRev(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Production Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Shell & Dish End Cutting / Rolling">Shell & Dish End Cutting / Rolling</option>
                    <option value="Nozzle & Flange Fitting">Nozzle & Flange Fitting</option>
                    <option value="Long Seam & Circ Seam Welding">Long Seam & Circ Seam Welding</option>
                    <option value="Internal Structure & Baffle Assembly">Internal Structure & Baffle Assembly</option>
                    <option value="Surface Preparation & Sand Blasting">Surface Preparation & Sand Blasting</option>
                    <option value="Final Hydro Test & Painting">Final Hydro Test & Painting</option>
                  </select>
                </div>
              </div>

              {/* Item, Qty, Live Stock */}
              <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[#70665F] font-semibold mb-1">Item to Issue *</label>
                    <select
                      value={itemId}
                      onChange={(e) => setItemId(e.target.value)}
                      className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500"
                    >
                      {itemMasters.map((i) => (
                        <option key={`modal-item-${i.id}`} value={i.id}>
                          {i.itemCode} - {i.itemName} ({i.uom})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#70665F] font-semibold mb-1">
                      Issue Quantity ({selectedItem?.uom || 'Unit'})
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={issueQty}
                      onChange={(e) => setIssueQty(Number(e.target.value))}
                      className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-emerald-700 font-bold font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#EBE3DB]">
                  <div className="text-[#70665F]">
                    Available Usable Stock in Store:{' '}
                    <span className="font-bold text-emerald-700 font-mono">
                      {availableUsableQty.toLocaleString('en-IN')} {selectedItem?.uom}
                    </span>
                  </div>
                  <div className="text-[#70665F]">
                    Estimated Value:{' '}
                    <span className="font-bold text-emerald-700 font-mono">
                      ₹{((issueQty || 0) * (selectedItem?.standardCost || 150)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warehouse & Heat Lot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Dispatch From Warehouse</label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500"
                  >
                    {warehouses.map((w) => (
                      <option key={`modal-wh-${w.id}`} value={w.id}>
                        {w.warehouseName} ({w.warehouseCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Heat / Batch Lot Number</label>
                  <input
                    type="text"
                    value={batchLot}
                    onChange={(e) => setBatchLot(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="e.g. HEAT-98421"
                  />
                </div>
              </div>

              {/* Requester & Store Issuer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Requested By</label>
                  <input
                    type="text"
                    value={requestedBy}
                    onChange={(e) => setRequestedBy(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Store Issuer</label>
                  <input
                    type="text"
                    value={issuedBy}
                    onChange={(e) => setIssuedBy(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Remarks / CAD Drawing Link</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] hover:bg-[#EBE3DB] text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-lg shadow-emerald-600/20 transition active:scale-95"
                >
                  Confirm & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Issue Voucher */}
      {viewVoucher && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#EBE3DB] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 text-[10px] font-mono font-bold">
                    STORE DISPATCH VOUCHER
                  </span>
                  <h2 className="text-lg font-black text-[#211B17]">
                    {viewVoucher.issueNumber || viewVoucher.id}
                  </h2>
                </div>
                <p className="text-xs text-[#70665F] mt-0.5">
                  Issued on {viewVoucher.issueDate || '2026-10-04'} • Store to Production Transfer
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-emerald-50 text-[#544B45] hover:text-emerald-700 border border-[#EBE3DB] transition text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Print Slip
                </button>
                <button
                  onClick={() => setViewVoucher(null)}
                  className="p-2 rounded-xl text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2] transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Voucher Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB] text-xs">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#70665F]">Job Reference</div>
                <div className="font-bold text-amber-700 font-mono mt-0.5">{viewVoucher.jobId || 'JOB-2026-001'}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#70665F]">Work Order</div>
                <div className="font-semibold text-[#211B17] font-mono mt-0.5">
                  {viewVoucher.workOrderNumber || 'WO-2026-001-A'}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#70665F]">BOM Details</div>
                <div className="font-semibold text-[#211B17] mt-0.5">
                  {viewVoucher.bomNumber || 'BOM-2026-001'} ({viewVoucher.bomRevision || 'Rev-01'})
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#70665F]">Production Stage</div>
                <div className="font-semibold text-[#211B17] mt-0.5">
                  {viewVoucher.productionStage || 'Shell & Dish End Cutting'}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-[#EBE3DB] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#70665F] font-mono text-[10px] uppercase border-b border-[#EBE3DB]">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3">Batch / Heat No</th>
                    <th className="p-3 text-right">Issued Qty</th>
                    <th className="p-3 text-right">Rate (₹)</th>
                    <th className="p-3 text-right">Total Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]">
                  {Array.isArray(viewVoucher.items) && viewVoucher.items.length > 0 ? (
                    viewVoucher.items.map((item: any, idx: number) => (
                      <tr key={`voucher-item-${idx}`}>
                        <td className="p-3">
                          <div className="font-bold text-[#211B17]">{item.itemName || item.itemCode}</div>
                          <div className="text-[10px] text-[#70665F] font-mono">{item.itemCode}</div>
                        </td>
                        <td className="p-3 font-mono font-semibold text-[#544B45]">
                          {item.batchLot || 'HEAT-98421'}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-700">
                          {item.issuedQuantity || item.requiredQuantity} {item.uom}
                        </td>
                        <td className="p-3 text-right font-mono text-[#70665F]">
                          ₹{(item.unitPrice || 150).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-[#211B17]">
                          ₹{(item.totalCost || (item.issuedQuantity || 1) * (item.unitPrice || 150)).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-[#70665F]">
                        Raw Material Dispatched: SS 316L Plates (3,200 Kg) - Value ₹3,200
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total and Sign-off */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-[#70665F]">Requested By:</span>{' '}
                  <span className="font-bold text-[#211B17]">{viewVoucher.requestedBy || 'Production Head'}</span>
                </div>
                <div>
                  <span className="text-[#70665F]">Store Issuer:</span>{' '}
                  <span className="font-bold text-[#211B17]">{viewVoucher.issuedBy || 'Store Incharge'}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] font-semibold text-[#70665F] uppercase">Grand Total Issue Value</div>
                <div className="text-xl font-black text-emerald-700 font-mono">
                  ₹{Number(viewVoucher.totalIssueValue || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewVoucher(null)}
                className="px-5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#211B17] text-xs font-semibold transition"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
