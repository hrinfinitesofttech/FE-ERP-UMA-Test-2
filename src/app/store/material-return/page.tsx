'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { MaterialReturn, ReturnCondition } from '../../../types/store';
import { CornerUpLeft, Plus, Search, Cpu, CheckCircle, Printer, X, Eye, Layers, Warehouse, AlertCircle } from 'lucide-react';

function MaterialReturnContent() {
  const searchParams = useSearchParams();
  const { materialReturns, addMaterialReturn, projectJobs, itemMasters, warehouses, materialIssues, workOrders } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<MaterialReturn | null>(null);

  // Form State
  const defaultJob = projectJobs[0]?.jobNumber || projectJobs[0]?.id || '';
  const [jobId, setJobId] = useState(defaultJob);
  const [woNo, setWoNo] = useState('');
  const [issueNo, setIssueNo] = useState('');
  const [itemId, setItemId] = useState('');
  const [returnQty, setReturnQty] = useState<number | string>(10);
  const [condition, setCondition] = useState<ReturnCondition>('Usable');
  const [returnedBy, setReturnedBy] = useState('Raju Prajapati (Shop Floor Supervisor)');
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || 'WH-RM-01');
  const [remarks, setRemarks] = useState('Good usable plate offcut returned to raw material yard');

  // Handle URL Query Params (?jobNumber=...)
  useEffect(() => {
    const paramJob = searchParams.get('jobNumber');
    if (paramJob) {
      setJobId(paramJob);
      setIsModalOpen(true);
    }
  }, [searchParams]);

  // Find matching job object
  const selectedJob = useMemo(() => {
    return projectJobs.find((j) => j.jobNumber === jobId || j.id === jobId) || projectJobs[0];
  }, [projectJobs, jobId]);

  // Find material issues for this job
  const jobIssues = useMemo(() => {
    if (!jobId) return [];
    return materialIssues.filter(
      (m) => m.jobId === jobId || m.jobId === selectedJob?.jobNumber || m.jobId === selectedJob?.id
    );
  }, [materialIssues, jobId, selectedJob]);

  // Available issued items for this job
  const issuedItemsList = useMemo(() => {
    const items: Array<{ itemId: string; itemCode: string; itemName: string; uom: string; issuedQty: number; unitPrice: number }> = [];
    const seen = new Set<string>();

    jobIssues.forEach((issue) => {
      (issue.items || []).forEach((it) => {
        if (!seen.has(it.itemId)) {
          seen.add(it.itemId);
          items.push({
            itemId: it.itemId,
            itemCode: it.itemCode,
            itemName: it.itemName,
            uom: it.uom || 'Kg',
            issuedQty: Number(it.issuedQuantity || it.requiredQuantity || 500),
            unitPrice: Number(it.unitPrice || 185),
          });
        }
      });
    });

    // If no specific issues found for job, fallback to raw material plates/pipes from itemMasters
    if (items.length === 0) {
      return itemMasters.slice(0, 10).map((i) => ({
        itemId: i.id,
        itemCode: i.itemCode,
        itemName: i.itemName,
        uom: i.uom || 'Kg',
        issuedQty: 250,
        unitPrice: Number(i.standardCost || 185),
      }));
    }

    return items;
  }, [jobIssues, itemMasters]);

  // Auto-set first item when job changes
  useEffect(() => {
    if (issuedItemsList.length > 0 && (!itemId || !issuedItemsList.some((i) => i.itemId === itemId))) {
      setItemId(issuedItemsList[0].itemId);
    }
    if (jobIssues.length > 0 && !issueNo) {
      setIssueNo(jobIssues[0].issueNumber);
      setWoNo(jobIssues[0].workOrderNumber || '');
    }
  }, [issuedItemsList, jobIssues, itemId, issueNo]);

  const selectedItem = useMemo(() => {
    return issuedItemsList.find((i) => i.itemId === itemId) || issuedItemsList[0];
  }, [issuedItemsList, itemId]);

  const selectedWh = useMemo(() => {
    return warehouses.find((w) => w.id === warehouseId) || warehouses[0];
  }, [warehouses, warehouseId]);

  const filtered = useMemo(() => {
    return materialReturns.filter((r) => {
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;
      const rNo = (r.returnNumber || (r as any).return_number || '').toLowerCase();
      const jId = (r.jobId || (r as any).job_number || (r as any).jobNumber || '').toLowerCase();
      const retBy = (r.returnedBy || (r as any).returned_by || '').toLowerCase();
      const whName = (r.warehouseName || (r as any).warehouse_name || '').toLowerCase();
      return rNo.includes(term) || jId.includes(term) || retBy.includes(term) || whName.includes(term);
    });
  }, [materialReturns, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !selectedWh) return;

    const numReturnQty = Number(returnQty) || 0;
    if (numReturnQty <= 0) {
      alert('Please enter a valid return quantity greater than 0.');
      return;
    }

    const unitPrice = selectedItem.unitPrice || 185;
    const calculatedValue = numReturnQty * unitPrice;
    const issuedQty = selectedItem.issuedQty || 500;
    const usedQty = Math.max(0, issuedQty - numReturnQty);

    addMaterialReturn({
      returnDate: new Date().toISOString().split('T')[0],
      projectId: selectedJob?.id || 'PRJ-2026-0001',
      jobId: selectedJob?.jobNumber || jobId,
      workOrderNumber: woNo || `WO-2026-${Date.now().toString().slice(-4)}`,
      materialIssueNumber: issueNo || `ISS-2026-${Date.now().toString().slice(-4)}`,
      warehouseId: selectedWh.id,
      warehouseName: selectedWh.warehouseName,
      returnedBy: returnedBy.trim() || 'Shop Floor Supervisor',
      receivedBy: 'Hitesh Rawal (Store Head)',
      totalReturnValue: calculatedValue,
      remarks: remarks || `Returned ${numReturnQty} ${selectedItem.uom} ${condition} material back to store stock`,
      items: [
        {
          id: `ret-item-${Date.now().toString().slice(-4)}`,
          returnId: '',
          itemId: selectedItem.itemId,
          itemCode: selectedItem.itemCode,
          itemName: selectedItem.itemName,
          issuedQuantity: issuedQty,
          usedQuantity: usedQty,
          returnQuantity: numReturnQty,
          uom: selectedItem.uom,
          condition,
          unitPrice,
          totalReturnValue: calculatedValue,
          locationCode: 'W1-ZA-R1-S1-B01',
          remarks: remarks || 'Usable offcut marked for flange/bracket fabrication',
        },
      ],
    });

    setIsModalOpen(false);
    setReturnQty(10);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#FAF7F2] min-h-screen text-[#544B45]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-700 border border-amber-200">
            <CornerUpLeft className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-bold">
                UNUSED MATERIAL & OFFCUT INWARD
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#211B17] tracking-tight mt-1">
              Material Return to Store Portal
            </h1>
            <p className="text-[#70665F] text-xs mt-1">
              Return unconsumed plates, offcut pieces & bought-outs back into warehouse usable stock matrix.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#8B2500] hover:bg-[#701E00] text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Material Return Slip</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C827A]" />
          <input
            type="text"
            placeholder="Search return slip #, job #, returned by..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl text-xs text-[#211B17] placeholder-[#8C827A] focus:outline-hidden focus:border-[#8B2500]"
          />
        </div>
        <div className="text-xs text-[#70665F] font-mono">
          Return Slips: <span className="text-[#211B17] font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* Return Slips Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-bold text-[10px] uppercase tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">Return Slip No & Date</th>
                <th className="p-3.5">Job No & Issue Slip</th>
                <th className="p-3.5">Returned By</th>
                <th className="p-3.5">Receiving Warehouse</th>
                <th className="p-3.5 text-right">Returned Value (₹)</th>
                <th className="p-3.5">Store Receiver</th>
                <th className="p-3.5">Condition</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#8C827A]">
                    No material return slips recorded. Click &quot;Create Material Return Slip&quot; above to log returned items.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const retNo = r.returnNumber || (r as any).return_number || r.id;
                  const retDate = r.returnDate || (r as any).return_date || new Date().toISOString().split('T')[0];
                  const jobCode = r.jobId || (r as any).job_number || (r as any).jobNumber || '—';
                  const issueSlip = r.materialIssueNumber || (r as any).material_issue_number || '—';
                  const retBy = r.returnedBy || '—';
                  const whName = r.warehouseName || 'Raw Material Yard';
                  const retVal = Number(r.totalReturnValue ?? 0);
                  const recBy = r.receivedBy || 'Store Incharge';
                  const firstItem = r.items?.[0];

                  return (
                    <tr key={r.id} className="hover:bg-[#FAF7F2]/60 transition">
                      <td className="p-3.5 font-medium">
                        <div className="font-bold text-[#8B2500] text-xs font-mono">{retNo}</div>
                        <div className="text-[10px] text-[#70665F] mt-0.5">{retDate}</div>
                      </td>
                      <td className="p-3.5 font-mono">
                        <div className="font-bold text-[#211B17] text-xs flex items-center gap-1">
                          <Cpu className="w-3.5 h-3.5 text-[#8B2500]" />
                          {jobCode}
                        </div>
                        <div className="text-[10px] text-[#70665F] mt-0.5">Issue: {issueSlip}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-[#211B17]">{retBy}</td>
                      <td className="p-3.5 text-[#544B45]">{whName}</td>
                      <td className="p-3.5 text-right font-mono font-black text-emerald-800 text-sm">
                        ₹{retVal.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-[#544B45]">{recBy}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          {firstItem?.condition || 'Usable Offcut'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedVoucher(r)}
                          className="p-1.5 hover:bg-[#FAF7F2] rounded-lg text-[#8B2500] transition cursor-pointer"
                          title="View Official Return Slip"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Return Slip Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <h2 className="text-base font-black text-[#211B17] flex items-center gap-2">
                  <CornerUpLeft className="w-5 h-5 text-amber-600" />
                  Return Material & Offcuts to Store
                </h2>
                <p className="text-[11px] text-[#70665F]">
                  Re-inwards unconsumed raw materials back into warehouse stock
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8C827A] hover:text-[#211B17] text-base p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Job selection */}
              <div>
                <label className="block text-[#70665F] font-bold mb-1">Target Job / Project *</label>
                <select
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-mono font-bold"
                >
                  {projectJobs.map((j) => (
                    <option key={j.id} value={j.jobNumber}>
                      {j.jobNumber} — {j.customerName ? `[${j.customerName}] ` : ''}{j.productName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Material Issue Slip Reference */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-bold mb-1">Material Issue Ref</label>
                  {jobIssues.length > 0 ? (
                    <select
                      value={issueNo}
                      onChange={(e) => setIssueNo(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-mono"
                    >
                      {jobIssues.map((iss) => (
                        <option key={iss.id} value={iss.issueNumber}>
                          {iss.issueNumber} ({iss.items?.length || 1} items)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. ISS-2026-0012"
                      value={issueNo}
                      onChange={(e) => setIssueNo(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-mono"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-[#70665F] font-bold mb-1">Work Order Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. WO-2026-0001"
                    value={woNo}
                    onChange={(e) => setWoNo(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-mono"
                  />
                </div>
              </div>

              {/* Item Selection from Actual Issued Items */}
              <div>
                <label className="block text-[#70665F] font-bold mb-1">Select Item to Return *</label>
                <select
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-bold"
                >
                  {issuedItemsList.map((i) => (
                    <option key={i.itemId} value={i.itemId}>
                      {i.itemCode} - {i.itemName} (Issued: {i.issuedQty} {i.uom})
                    </option>
                  ))}
                </select>
              </div>

              {/* Return Condition & Receiving Warehouse */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-bold mb-1">Return Condition *</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ReturnCondition)}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-semibold"
                  >
                    <option value="Usable">Usable Full Material (100% Inward)</option>
                    <option value="Reusable">Reusable Offcut (Plate / Pipe Nipple)</option>
                    <option value="Damaged">Damaged / Needs Straightening</option>
                    <option value="Scrap">Scrap Yard Disposition</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] font-bold mb-1">Receiving Warehouse *</label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-semibold"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.warehouseName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity & Returned By */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-bold mb-1">
                    Return Quantity ({selectedItem?.uom || 'Kg'}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={returnQty}
                    onChange={(e) => setReturnQty(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#8B2500] font-black text-sm font-mono"
                  />
                  {selectedItem && (
                    <div className="text-[10px] text-[#70665F] mt-1">
                      Rate: ₹{selectedItem.unitPrice}/uom • Est Value: ₹{(Number(returnQty || 0) * (selectedItem.unitPrice || 185)).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[#70665F] font-bold mb-1">Returned By (Supervisor) *</label>
                  <input
                    type="text"
                    required
                    value={returnedBy}
                    onChange={(e) => setReturnedBy(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-semibold"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-[#70665F] font-bold mb-1">Remarks / Offcut Description</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Shell plate offcut 1200mm x 800mm x 25mm thickness marked with heat no"
                  className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17]"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8B2500] hover:bg-[#701E00] text-white font-bold shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Inward to Store Stock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Voucher Preview Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-bold">
                  OFFICIAL MATERIAL RETURN SLIP
                </span>
                <h3 className="text-xl font-black text-[#8B2500] font-mono mt-1">
                  {selectedVoucher.returnNumber || selectedVoucher.id}
                </h3>
              </div>
              <button onClick={() => setSelectedVoucher(null)} className="p-1 rounded-lg text-[#8C827A] hover:bg-[#FAF7F2]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DCD3] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#70665F]">Job Number:</span>
                <span className="font-mono font-bold text-[#211B17]">{selectedVoucher.jobId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#70665F]">Material Issue Ref:</span>
                <span className="font-mono font-bold text-[#8B2500]">{selectedVoucher.materialIssueNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#70665F]">Warehouse Credited:</span>
                <span className="font-semibold text-[#211B17]">{selectedVoucher.warehouseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#70665F]">Returned By:</span>
                <span className="font-bold text-[#211B17]">{selectedVoucher.returnedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#70665F]">Store Receiver:</span>
                <span className="font-bold text-[#211B17]">{selectedVoucher.receivedBy}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E5DCD3]">
                <span className="font-bold text-[#211B17]">Returned Value Inwarded:</span>
                <span className="font-mono font-black text-emerald-800 text-base">
                  ₹{Number(selectedVoucher.totalReturnValue || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE8DF] text-[#211B17] text-xs font-bold border border-[#E5DCD3] flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#8B2500]" />
                <span>Print Return Slip</span>
              </button>
              <button
                onClick={() => setSelectedVoucher(null)}
                className="px-4 py-2 rounded-xl bg-[#8B2500] hover:bg-[#701E00] text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MaterialReturnPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-stone-500 font-semibold bg-[#FAF7F2] min-h-screen flex items-center justify-center">
        Loading Material Return Portal...
      </div>
    }>
      <MaterialReturnContent />
    </Suspense>
  );
}
