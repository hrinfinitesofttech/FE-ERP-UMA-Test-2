'use client';

import React, { useState, useEffect } from 'react';
import { useERP } from '../../../context/ERPContext';
import { GoodsReceiptNote, GRNStatus } from '../../../types/store';
import { PackageCheck, Plus, Search, Truck, FileText, CheckCircle, Clock, ShieldAlert, X } from 'lucide-react';

const DEFAULT_WAREHOUSES = [
  { id: 'wh-main', warehouseCode: 'WH-MAIN', warehouseName: 'Main Raw Material Warehouse (Bay 1 & 2)', address: 'Makarpura, Vadodara', warehouseType: 'Raw Material' as const, managerName: 'Ramesh Patel', contactPhone: '+91 98250 11223', contactEmail: 'store@umatechnofab.com', status: 'Active' as const },
  { id: 'wh-bought', warehouseCode: 'WH-BOUGHT', warehouseName: 'Bought-Out & Hardware Store (Bay 3)', address: 'Makarpura, Vadodara', warehouseType: 'Bought-Out' as const, managerName: 'Suresh Shah', contactPhone: '+91 98250 11224', contactEmail: 'boughtout@umatechnofab.com', status: 'Active' as const },
  { id: 'wh-fg', warehouseCode: 'WH-FG', warehouseName: 'Finished Goods & Dispatch Yard', address: 'Makarpura, Vadodara', warehouseType: 'Finished Goods' as const, managerName: 'Mahesh Joshi', contactPhone: '+91 98250 11225', contactEmail: 'dispatch@umatechnofab.com', status: 'Active' as const },
  { id: 'wh-cons', warehouseCode: 'WH-CONS', warehouseName: 'Consumables & Tools Crib', address: 'Makarpura, Vadodara', warehouseType: 'Consumable' as const, managerName: 'Amit Desai', contactPhone: '+91 98250 11226', contactEmail: 'tools@umatechnofab.com', status: 'Active' as const },
];

export default function GoodsReceiptPage() {
  const { goodsReceipts, addGRN, purchaseOrders, suppliers, warehouses, projectJobs } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const availableWarehouses = warehouses && warehouses.length > 0 ? warehouses : DEFAULT_WAREHOUSES;

  // Form State
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [poId, setPoId] = useState(purchaseOrders[0]?.id || '');
  const [dcNo, setDcNo] = useState('');
  const [invNo, setInvNo] = useState('');
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || availableWarehouses[0]?.id || 'wh-main');
  const [vehicleNo, setVehicleNo] = useState('');
  const [transporter, setTransporter] = useState('');
  const [remarks, setRemarks] = useState('');

  // Close modals on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const closeModal = () => {
    setIsModalOpen(false);
    setDcNo('');
    setInvNo('');
    setVehicleNo('');
    setTransporter('');
    setRemarks('');
  };

  const selectedSupplier = suppliers.find((s) => s.id === supplierId) || suppliers[0];
  const selectedPo = purchaseOrders.find((p) => p.id === poId) || purchaseOrders[0];
  const selectedWh = availableWarehouses.find((w) => w.id === warehouseId || w.warehouseCode === warehouseId) || availableWarehouses[0];

  const filtered = (goodsReceipts || []).filter((g) => {
    const grnNo = g.grnNumber || (g as any).grn_number || '';
    const supp = g.supplierName || (g as any).supplier_name || '';
    const poNo = g.poNumber || (g as any).po_number || '';
    const dcNoVal = g.deliveryChallanNumber || (g as any).challanNumber || (g as any).challan_number || '';
    const term = searchTerm?.toLowerCase() || '';
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

    const poValue = (selectedPo as any)?.totalAmount || (selectedPo as any)?.grandTotal || 638250;

    const grnItems: any[] = (selectedPo?.items || []).map((itm: any, idx: number) => ({
      id: `GRNITM-${Date.now().toString().slice(-4)}-${idx + 1}`,
      grnId: '',
      itemId: itm.itemId || itm.id || 'ITM-01',
      itemCode: itm.itemCode || 'RAW-MAT',
      itemName: itm.description || itm.itemName || 'Raw Material',
      poQuantity: itm.quantity || 1,
      receivedQuantity: itm.quantity || 1,
      acceptedQuantity: itm.quantity || 1,
      rejectedQuantity: 0,
      shortQuantity: 0,
      uom: itm.uom || 'Nos',
      unitPrice: itm.unitPrice || itm.unitRate || 1000,
      totalAmount: (itm.quantity || 1) * (itm.unitPrice || itm.unitRate || 1000),
      locationCode: 'WH-MAIN-BAY-01',
    }));

    addGRN({
      grnDate: new Date().toISOString().split('T')[0],
      supplierId: supp.id,
      supplierName: (supp as any).supplierName || (supp as any).name || 'Supplier',
      poId: selectedPo?.id || poId || '',
      poNumber: selectedPo?.poNumber || '',
      projectId: selectedPo && (selectedPo as any).projectId ? (selectedPo as any).projectId : '',
      jobId: selectedPo?.jobNumber || '',
      deliveryChallanNumber: dcNo || `DC-${Date.now().toString().slice(-5)}`,
      invoiceNumber: invNo || `INV-${Date.now().toString().slice(-5)}`,
      warehouseId: wh.id,
      warehouseName: wh.warehouseName || (wh as any).name || wh.id,
      receivedBy: 'Store Officer',
      vehicleNumber: vehicleNo || 'GJ-06-AX-4821',
      transporterName: transporter || 'VRL Logistics',
      status: 'Inspection Pending',
      totalReceivedValue: poValue,
      remarks,
      items: grnItems,
    });

    closeModal();
    setSuccessMessage('Goods Receipt Note (GRN) created successfully!');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-800 border border-amber-500/30 text-xs font-mono font-semibold">
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
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-700 text-white text-xs font-bold shadow-lg shadow-amber-700/30 hover:bg-amber-600 transition"
        >
          <Plus className="w-4 h-4" />
          Create New GRN
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search GRN no, supplier, PO no, DC no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-amber-600"
          />
        </div>
        <div className="text-xs text-[#70665F] font-mono">
          Total GRNs: <span className="text-[#211B17] font-bold">{filtered.length}</span>
        </div>
      </div>

      {/* GRN Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-mono text-[11px] uppercase tracking-wider border-b border-[#EBE3DB]">
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
                  const dateStr = g.grnDate || (g as any).date || (g as any).createdAt || '';
                  const suppName = g.supplierName || (g as any).supplier_name || '-';
                  const poNo = g.poNumber || (g as any).po_number || '-';
                  const job = g.jobId || 'General Stock';
                  const dc = g.deliveryChallanNumber || (g as any).challanNumber || (g as any).challan_number || '-';
                  const inv = g.invoiceNumber || (g as any).invoice_number || '-';
                  const wh = g.warehouseName || g.warehouseId || 'wh-main';
                  const veh = g.vehicleNumber || (g as any).vehicle_number || '-';
                  const trans = g.transporterName || (g as any).transporter_name || '-';
                  const totalVal = Number(
                    g.totalReceivedValue ??
                    (g.items && Array.isArray(g.items)
                      ? g.items.reduce((sum: number, itm: any) => sum + Number(itm.totalAmount || itm.amount || 0), 0)
                      : 638250)
                  ) || 638250;

                  return (
                    <tr key={g.id || grnNo} className="hover:bg-[#FAF7F2]/60 transition">
                      <td className="p-3.5 font-medium">
                        <div className="font-bold text-amber-800 text-xs font-mono">{grnNo}</div>
                        <div className="text-[10px] text-[#70665F] mt-0.5">{dateStr}</div>
                      </td>
                      <td className="p-3.5 font-bold text-[#211B17]">{suppName}</td>
                      <td className="p-3.5 font-mono text-[#544B45]">
                        <div className="text-amber-800 font-semibold">{poNo}</div>
                        <div className="text-[10px] text-amber-600 mt-0.5">{job}</div>
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
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : g.status === 'Inspection Pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-rose-50 text-rose-700 border-rose-300'
                          }`}
                        >
                          {g.status || 'Accepted'}
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
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={closeModal}
        >
          <div
            className="bg-white border border-[#EBE3DB] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-amber-700" />
                Inward Goods Receipt Note (GRN)
              </h2>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Supplier *</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-600"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.supplierName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Purchase Order (PO)</label>
                  <select
                    value={poId}
                    onChange={(e) => setPoId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-600 font-mono"
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
                  <label className="block font-semibold text-[#544B45] mb-1">Delivery Challan (DC) No.</label>
                  <input
                    type="text"
                    placeholder="e.g. DC-2026-991"
                    value={dcNo}
                    onChange={(e) => setDcNo(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Supplier Invoice No.</label>
                  <input
                    type="text"
                    placeholder="e.g. INV/JSL/26/10294"
                    value={invNo}
                    onChange={(e) => setInvNo(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Receiving Store *</label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-medium focus:outline-none focus:border-amber-600"
                  >
                    {availableWarehouses.map((w) => {
                      const wName = w.warehouseName || (w as any).name || (w as any).warehouse_name || w.warehouseCode || (w as any).warehouse_code || w.id;
                      return (
                        <option key={w.id || w.warehouseCode} value={w.id || w.warehouseCode}>
                          {wName}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Vehicle No.</label>
                  <input
                    type="text"
                    placeholder="e.g. GJ-06-AX-4821"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Transporter</label>
                  <input
                    type="text"
                    placeholder="e.g. VRL Logistics"
                    value={transporter}
                    onChange={(e) => setTransporter(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Inward Physical Inspection Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Material visually verified against packing list and test certificates."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] text-[#544B45] hover:bg-white text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-700 text-white hover:bg-amber-600 text-xs font-semibold shadow-lg shadow-amber-700/30 transition"
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
