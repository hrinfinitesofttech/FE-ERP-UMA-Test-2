'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { ScrapEntry, ScrapStatus } from '../../../types/store';
import { Trash2, Plus, AlertTriangle, Cpu, X } from 'lucide-react';
import { ERPListPageLayout } from '../../../components/ui/ERPListPageLayout';
import { toast } from '@/context/ToastContext';

export default function ScrapPage() {
  const { scrapEntries, addScrapEntry, itemMasters, warehouses, projectJobs } = useERP();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [itemId, setItemId] = useState(itemMasters[0]?.id || '');
  const [jobId, setJobId] = useState(projectJobs[0]?.id || projectJobs[0]?.jobNumber || '');
  const [qty, setQty] = useState(0);
  const [source, setSource] = useState<'Production Scrap' | 'Purchase Rejection' | 'Damaged Material' | 'Quality Rejection' | 'Expired Material' | 'Other'>('Production Scrap');
  const [reason, setReason] = useState('');
  const [val, setVal] = useState(0);

  const selectedItem = itemMasters.find((i) => i.id === itemId) || itemMasters[0];
  const selectedWh = warehouses[0] || null;

  const columns = [
    {
      key: 'scrapNumber',
      header: 'SCRAP ENTRY NO & DATE',
      isCodeLink: true,
      onCodeClick: (s: ScrapEntry) => toast.info(`Scrap Entry #${s.scrapNumber}`, `Reason: ${s.reason || 'N/A'} • Created By: ${s.createdBy || 'N/A'}`),
      cell: (s: ScrapEntry) => (
        <div>
          <div className="font-semibold text-[#7C3AED] hover:underline cursor-pointer">{s.scrapNumber}</div>
          <div className="text-[11px] text-gray-400">{s.entryDate}</div>
        </div>
      ),
    },
    {
      key: 'itemCode',
      header: 'ITEM CODE & NAME',
      cell: (s: ScrapEntry) => (
        <div>
          <div className="font-semibold text-gray-800">{s.itemCode}</div>
          <div className="text-[11px] text-gray-500">{s.itemName}</div>
        </div>
      ),
    },
    {
      key: 'source',
      header: 'SOURCE & PROJECT NO',
      cell: (s: ScrapEntry) => (
        <div>
          <div className="font-medium text-amber-700">{s.source}</div>
          <div className="text-[11px] text-gray-400 font-mono">{s.projectId || s.jobId || 'Shop Floor General'}</div>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'SCRAP QTY',
      cell: (s: ScrapEntry) => (
        <span className="font-mono font-semibold text-gray-800">
          {s.quantity?.toLocaleString('en-IN')} {s.uom}
        </span>
      ),
    },
    {
      key: 'estimatedValue',
      header: 'EST. VALUE (₹)',
      cell: (s: ScrapEntry) => (
        <span className="font-mono font-semibold text-emerald-700">
          ₹{s.estimatedValue?.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'warehouseName',
      header: 'SCRAP YARD & LOCATION',
      cell: (s: ScrapEntry) => (
        <div>
          <div className="text-gray-700">{s.warehouseName}</div>
          <div className="text-[11px] font-mono text-gray-400">{s.scrapLocation}</div>
        </div>
      ),
    },
    {
      key: 'disposalStatus',
      header: 'STATUS',
      cell: (s: ScrapEntry) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          {s.disposalStatus}
        </span>
      ),
    },
    {
      key: 'createdBy',
      header: 'CREATED BY',
      cell: (s: ScrapEntry) => (
        <span className="text-gray-600">{s.createdBy}</span>
      ),
    },
  ];

  const handleExport = () => {
    if (scrapEntries.length === 0) return;
    const headers = ['Scrap No', 'Date', 'Item Code', 'Item Name', 'Source', 'Job', 'Qty', 'UoM', 'Value (INR)', 'Warehouse', 'Location', 'Status'];
    const rows = scrapEntries.map((s) => [
      s.scrapNumber,
      s.entryDate,
      `"${s.itemCode}"`,
      `"${s.itemName}"`,
      `"${s.source}"`,
      `"${s.jobId || ''}"`,
      s.quantity,
      `"${s.uom}"`,
      s.estimatedValue,
      `"${s.warehouseName}"`,
      `"${s.scrapLocation}"`,
      `"${s.disposalStatus}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `scrap_register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !selectedWh) return;

    addScrapEntry({
      entryDate: new Date().toISOString().split('T')[0],
      itemId: selectedItem.id,
      itemCode: selectedItem.itemCode,
      itemName: selectedItem.itemName,
      quantity: qty,
      uom: selectedItem.uom,
      source,
      jobId,
      reason,
      warehouseId: selectedWh.id,
      warehouseName: selectedWh.warehouseName,
      scrapLocation: 'W5-ZS-B1-F1-S01',
      estimatedValue: val,
      disposalStatus: 'Moved to Scrap',
      remarks: 'Stored in SS scrap yard for quarterly auction sale',
      createdBy: 'Ramesh Bariya (Scrap Lead)',
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <ERPListPageLayout<ScrapEntry>
        breadcrumbs={['DASHBOARD', 'STORE', 'SCRAP & REJECTION REGISTER']}
        columns={columns}
        data={scrapEntries}
        addNewLabel="+ Add Scrap Entry"
        onAddNew={() => setIsModalOpen(true)}
        onExport={handleExport}
        searchPlaceholder="Search scrap entry no, item, reason..."
      />

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-yellow-400" />
                Add Scrap & Rejection Record
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Select Item *</label>
                  <select
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-yellow-500"
                  >
                    {itemMasters.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.itemCode} - {i.itemName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Target Job Number</label>
                  <select
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-yellow-500 font-mono"
                  >
                    {projectJobs.map((j) => (
                      <option key={j.id} value={j.jobNumber}>
                        {j.jobNumber} — {j.customerName ? `[${j.customerName}] ` : ''}{j.productName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Scrap Source</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-yellow-500"
                  >
                    <option value="Production Scrap">Production Scrap</option>
                    <option value="Purchase Rejection">Purchase Rejection</option>
                    <option value="Damaged Material">Damaged Material</option>
                    <option value="Quality Rejection">Quality Rejection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Quantity ({selectedItem?.uom})</label>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-yellow-400 font-bold focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Est. Scrap Value (₹)</label>
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => setVal(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Scrap Reason & Offcut Description</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] hover:bg-[#FAF7F2] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-yellow-600 text-[#211B17] hover:bg-yellow-500 text-xs font-semibold shadow-lg shadow-yellow-600/30"
                >
                  Confirm Scrap Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
