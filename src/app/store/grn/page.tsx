'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { GoodsReceiptNote, GRNStatus } from '../../../types/store';
import { PackageCheck, Plus, Search, Truck, FileText, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

export default function GoodsReceiptPage() {
  const { goodsReceipts, addGRN, purchaseOrders, suppliers, warehouses, projectJobs } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [poId, setPoId] = useState(purchaseOrders[0]?.id || '');
  const [dcNo, setDcNo] = useState('');
  const [invNo, setInvNo] = useState('');
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [vehicleNo, setVehicleNo] = useState('');
  const [transporter, setTransporter] = useState('');
  const [remarks, setRemarks] = useState('');

  const selectedSupplier = suppliers.find((s) => s.id === supplierId) || suppliers[0];
  const selectedPo = purchaseOrders.find((p) => p.id === poId) || purchaseOrders[0];
  const selectedWh = warehouses.find((w) => w.id === warehouseId) || warehouses[0];

  const filtered = (goodsReceipts || []).filter((g) => {
    const grnNo = g.grnNumber || (g as any).grn_number || '';
    const supp = g.supplierName || (g as any).supplier_name || '';
    const poNo = g.poNumber || (g as any).po_number || '';
    const dcNoVal = g.deliveryChallanNumber || (g as any).challanNumber || (g as any).challan_number || '';
    const term = searchTerm?.toLowerCase();
    return (
      grnNo?.toLowerCase().includes(term) ||
      supp?.toLowerCase().includes(term) ||
      poNo?.toLowerCase().includes(term) ||
      dcNoVal?.toLowerCase().includes(term)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supp = selectedSupplier || { id: supplierId || 'SUP-001', supplierName: 'Supplier' };
    const wh = selectedWh || { id: warehouseId || 'WH-001', warehouseName: 'Main Store' };

    addGRN({
      grnDate: new Date().toISOString().split('T')[0],
      supplierId: supp.id,
      supplierName: (supp as any).supplierName || (supp as any).name || 'Supplier',
      poId: selectedPo?.id || poId || '',
      poNumber: selectedPo?.poNumber || '',
      projectId: (selectedPo && selectedPo.projectId) ? selectedPo.projectId : '',
      jobId: selectedPo?.jobNumber || '',
      deliveryChallanNumber: dcNo,
      invoiceNumber: invNo,
      warehouseId: wh.id,
      warehouseName: wh.warehouseName || wh.id,
      receivedBy: 'Store Officer',
      vehicleNumber: vehicleNo,
      transporterName: transporter,
      status: 'Inspection Pending',
      totalReceivedValue: 0,
      remarks,
      items: [],
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-crm-brand-600/20 text-crm-brand-500 border border-crm-brand-600/30 text-xs font-mono font-semibold">
              INWARD MATERIAL RECEIPT
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Goods Receipt Note (GRN)</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Physical gate entry & store inward confirmation for raw materials, bought-outs, and supplier deliveries.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-crm-brand-700 text-white text-xs font-bold shadow-lg shadow-crm-brand-700/30 hover:bg-crm-brand-600 transition"
        >
          <Plus className="w-4 h-4" />
          Create New GRN
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search GRN no, supplier, PO no, DC no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-crm-brand-600"
          />
        </div>
        <div className="text-xs text-[#70665F] font-mono">
          Total GRNs: <span className="text-[#211B17] font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* GRN Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/90 text-[#70665F] font-mono text-[11px] uppercase tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">GRN No & Date</th>
                <th className="p-3.5">Supplier Name</th>
                <th className="p-3.5">PO & Job No</th>
                <th className="p-3.5">DC & Invoice No</th>
                <th className="p-3.5">Warehouse</th>
                <th className="p-3.5">Vehicle & Transporter</th>
                <th className="p-3.5 text-right">Inward Value (₹)</th>
                <th className="p-3.5 text-center">QC Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#70665F]">
                    No Goods Receipt Notes found. Click &quot;Create New GRN&quot; to inward materials.
                  </td>
                </tr>
              ) : (
                filtered.map((g) => {
                  const grnNo = g.grnNumber || (g as any).grn_number || g.id || 'GRN';
                  const dateStr = g.grnDate || (g as any).date || '';
                  const suppName = g.supplierName || (g as any).supplier_name || '-';
                  const poNo = g.poNumber || (g as any).po_number || '-';
                  const job = g.jobId || 'General Stock';
                  const dc = g.deliveryChallanNumber || (g as any).challanNumber || (g as any).challan_number || '-';
                  const inv = g.invoiceNumber || (g as any).invoice_number || '-';
                  const wh = g.warehouseName || g.warehouseId || '-';
                  const veh = g.vehicleNumber || (g as any).vehicle_number || '-';
                  const trans = g.transporterName || (g as any).transporter_name || '-';
                  const totalVal = Number(
                    g.totalReceivedValue ??
                    (g.items && Array.isArray(g.items)
                      ? g.items.reduce((sum: number, itm: any) => sum + Number(itm.totalAmount || itm.amount || 0), 0)
                      : 0)
                  ) || 0;

                  return (
                    <tr key={g.id || grnNo} className="hover:bg-[#FAF7F2]/40 transition">
                      <td className="p-3.5 font-medium">
                        <div className="font-bold text-crm-brand-500 text-xs font-mono">{grnNo}</div>
                        <div className="text-[10px] text-[#70665F] mt-0.5">{dateStr}</div>
                      </td>
                      <td className="p-3.5 font-bold text-[#211B17]">{suppName}</td>
                      <td className="p-3.5 font-mono text-[#544B45]">
                        <div className="text-crm-brand-500 font-semibold">{poNo}</div>
                        <div className="text-[10px] text-amber-400 mt-0.5">{job}</div>
                      </td>
                      <td className="p-3.5 text-[#544B45]">
                        <div>DC: {dc}</div>
                        <div className="text-[10px] text-[#70665F]">Inv: {inv}</div>
                      </td>
                      <td className="p-3.5 text-[#544B45] font-medium">{wh}</td>
                      <td className="p-3.5 text-[#544B45] text-xs">
                        <div>{veh}</div>
                        <div className="text-[10px] text-[#70665F]">{trans}</div>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-[#211B17]">
                        ₹{totalVal?.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            g.status === 'Accepted'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : g.status === 'Inspection Pending'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {g.status || 'Received'}
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

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#FAF7F2] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-crm-brand-500" />
                Inward Goods Receipt Note (GRN)
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#70665F] hover:text-[#211B17] text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Supplier *</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.supplierName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Purchase Order (PO)</label>
                  <select
                    value={poId}
                    onChange={(e) => setPoId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-mono"
                  >
                    {purchaseOrders.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.poNumber} - {p.supplierName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Delivery Challan (DC) No.</label>
                  <input
                    type="text"
                    value={dcNo}
                    onChange={(e) => setDcNo(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Supplier Invoice No.</label>
                  <input
                    type="text"
                    value={invNo}
                    onChange={(e) => setInvNo(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Receiving Store Yard</label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.warehouseName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Vehicle No.</label>
                  <input
                    type="text"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Transporter</label>
                  <input
                    type="text"
                    value={transporter}
                    onChange={(e) => setTransporter(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">Inward Physical Inspection Remarks</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600"
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
                  className="px-4 py-2 rounded-xl bg-crm-brand-700 text-white hover:bg-crm-brand-600 text-xs font-semibold shadow-lg shadow-crm-brand-700/30"
                >
                  Confirm GRN Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
