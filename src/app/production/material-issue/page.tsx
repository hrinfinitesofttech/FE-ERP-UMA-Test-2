'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Truck, Plus, CheckCircle2, Clock, Box, Building, Search } from 'lucide-react';

export default function ProductionMaterialIssuePage() {
  const { materialIssues, addMaterialIssue, workOrders, itemMasters, openJobModal } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [selectedWo, setSelectedWo] = useState(workOrders[0]?.workOrderNumber || 'WO-2026-001-A');
  const [selectedItemCode, setSelectedItemCode] = useState(itemMasters[0]?.itemCode || 'RM-PLATE-316L-01');
  const [qty, setQty] = useState(10);
  const [issuedTo, setIssuedTo] = useState('Ramesh Vaghela (Fabrication)');

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wo = workOrders.find((w) => w.workOrderNumber === selectedWo);
    const item = itemMasters.find((i) => i.itemCode === selectedItemCode);

    addMaterialIssue({
      issueDate: new Date().toISOString().split('T')[0],
      projectId: wo?.projectId || 'PRJ-2026-0001',
      jobId: wo?.jobId || 'PRJ-2026-0001',
      workOrderNumber: selectedWo,
      bomNumber: 'BOM-2026-001',
      bomRevision: wo?.bomRevision || 'Rev-01',
      productionStage: 'Fabrication & Welding',
      requestedBy: issuedTo,
      issuedBy: 'Store Supervisor',
      warehouseId: 'WH-001',
      warehouseName: 'Raw Material Yard & Plate Store',
      items: [
        {
          id: `ISSITEM-${Date.now()}`,
          issueId: `ISS-${Date.now()}`,
          itemId: item?.id || 'ITEM-001',
          itemCode: selectedItemCode,
          itemName: item?.itemName || 'SS 316L Plate 12mm',
          requiredQuantity: qty,
          reservedQuantity: qty,
          issuedQuantity: qty,
          uom: item?.uom || 'Kg',
          unitPrice: item?.standardCost || 320,
          totalCost: (item?.standardCost || 320) * qty,
          locationCode: 'Bin-A1',
        },
      ],
      totalIssueValue: (item?.standardCost || 320) * qty,
      remarks: 'Issued for vessel shell fabrication.',
      status: 'Fully Issued',
    });

    setShowModal(false);
    alert('Material Issue Slip created & saved to Database successfully!');
  };

  return (
    <div className="p-6 space-y-6 bg-[#090D1A] text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight flex items-center gap-2">
              Production Material Request & Store Issue
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                Store-Production Interface
              </span>
            </h1>
            <p className="text-xs text-[#70665F]">
              Material Requisitions & Physical Stock Issue Slips for Work Order Operations
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (workOrders.length > 0 && !selectedWo) setSelectedWo(workOrders[0].workOrderNumber);
            if (itemMasters.length > 0 && !selectedItemCode) setSelectedItemCode(itemMasters[0].itemCode);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white text-xs shadow-lg hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4" /> Create Material Request Slip
        </button>
      </div>

      {/* Material Issue Slips Table */}
      <div className="p-5 rounded-2xl bg-white border border-[#EBE3DB] shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3">Issue Slip #</th>
                <th className="p-3">Job Number</th>
                <th className="p-3">Work Order #</th>
                <th className="p-3">Issued To</th>
                <th className="p-3">Warehouse Source</th>
                <th className="p-3 text-right">Total Items</th>
                <th className="p-3 text-right">Total Value</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {materialIssues.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#70665F]">
                    No material request / issue records found in database. Click &quot;Create Material Request Slip&quot; to issue raw materials.
                  </td>
                </tr>
              ) : (
                materialIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-[#FAF7F2]/40 transition">
                    <td className="p-3 font-mono font-bold text-emerald-500">{issue.issueNumber}</td>
                    <td className="p-3 font-mono text-sky-600">{issue.jobId || 'N/A'}</td>
                    <td className="p-3 font-mono text-indigo-600">{issue.workOrderNumber || 'N/A'}</td>
                    <td className="p-3 text-[#211B17] font-medium">{issue.requestedBy}</td>
                    <td className="p-3 text-[#70665F]">{issue.warehouseName}</td>
                    <td className="p-3 text-right font-bold text-[#544B45]">{Array.isArray(issue.items) ? issue.items.length : 1}</td>
                    <td className="p-3 text-right font-bold text-emerald-600 font-mono">
                      ₹{issue.totalIssueValue?.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 border border-emerald-500/30">
                        {issue.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {issue.jobId && (
                        <button
                          onClick={() => openJobModal(issue.jobId)}
                          className="px-2.5 py-1 rounded bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300 text-[11px] font-bold transition"
                        >
                          360° Trace
                        </button>
                      )}
                    </td>
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
              <h3 className="text-base font-bold text-[#211B17]">Create Material Issue Slip</h3>
              <button onClick={() => setShowModal(false)} className="text-[#70665F] hover:text-[#211B17] font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Target Work Order</label>
                <select
                  value={selectedWo}
                  onChange={(e) => setSelectedWo(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-emerald-500"
                >
                  {workOrders.map((w) => (
                    <option key={w.id || w.workOrderNumber} value={w.workOrderNumber}>
                      {w.workOrderNumber} — {w.jobNumber}
                    </option>
                  ))}
                  {workOrders.length === 0 && (
                    <option value="WO-2026-001-A">WO-2026-001-A (General)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Select Raw Material / Item</label>
                <select
                  value={selectedItemCode}
                  onChange={(e) => setSelectedItemCode(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-emerald-500"
                >
                  {itemMasters.map((i) => (
                    <option key={i.id || i.itemCode} value={i.itemCode}>
                      {i.itemCode} — {i.itemName} ({i.uom})
                    </option>
                  ))}
                  {itemMasters.length === 0 && (
                    <option value="RM-PLATE-316L-01">RM-PLATE-316L-01 — SS 316L Plate 12mm</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Issue Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Issued To Employee</label>
                  <input
                    type="text"
                    required
                    value={issuedTo}
                    onChange={(e) => setIssuedTo(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#544B45] focus:outline-none focus:border-emerald-500"
                  />
                </div>
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
                  className="px-4 py-2 rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-500 shadow-lg"
                >
                  Post Material Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
