'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import { FinishedGoodsItem } from '../../../types/production';
import {
  PackageCheck,
  Plus,
  ShieldCheck,
  Truck,
  Building,
  Search,
  ChevronRight,
  Printer,
  Eye,
  Edit,
  Trash2,
  X,
  Layers,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ArrowUpRight,
} from 'lucide-react';

export default function FinishedGoodsPage() {
  const {
    finishedGoods,
    workOrders,
    workCenters,
    projectJobs,
    addFinishedGoods,
    updateFinishedGoods,
    deleteFinishedGoods,
    openJobModal,
    isInitialLoading,
  } = useERP();

  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingFg, setEditingFg] = useState<FinishedGoodsItem | null>(null);
  const [viewCertificate, setViewCertificate] = useState<FinishedGoodsItem | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form State for Inwarding FG
  const defaultWo = workOrders[0]?.workOrderNumber || 'WO-2026-001-A';
  const defaultJob = workOrders[0]?.jobNumber || 'JOB-2026-001';
  const defaultProduct = workOrders[0]?.productName || 'Heavy SS 316L Chemical Reactor Vessel (10 KL)';

  const [selectedWo, setSelectedWo] = useState(defaultWo);
  const [productName, setProductName] = useState(defaultProduct);
  const [specification, setSpecification] = useState('SS 316L Limpet Coil, 10 KL, 6 Bar Design Pressure');
  const [serialNumber, setSerialNumber] = useState('UTF-CR-2026-001');
  const [batchNumber, setBatchNumber] = useState('HEAT-SS316-9921');
  const [warehouseName, setWarehouseName] = useState('Finished Goods Bay 4 (Dispatch Gate)');
  const [locationBin, setLocationBin] = useState('Bin-FG-01');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [uom, setUom] = useState('Unit');
  const [qcStatus, setQcStatus] = useState<'QC Passed' | 'QC Pending' | 'QC Failed'>('QC Passed');
  const [dispatchStatus, setDispatchStatus] = useState<FinishedGoodsItem['status']>('Ready for Dispatch');

  // Close modals on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
        setEditingFg(null);
        setViewCertificate(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleWoChange = (woNumber: string) => {
    setSelectedWo(woNumber);
    const wo = workOrders.find((w) => w.workOrderNumber === woNumber);
    if (wo) {
      setProductName(wo.productName || 'Custom Fabricated Process Equipment');
    }
  };

  const openCreateModal = () => {
    setEditingFg(null);
    const wo = workOrders[0];
    setSelectedWo(wo?.workOrderNumber || 'WO-2026-001-A');
    setProductName(wo?.productName || 'Heavy SS 316L Chemical Reactor Vessel (10 KL)');
    setSpecification('SS 316L Limpet Coil, 10 KL, 6 Bar Design Pressure');
    setSerialNumber(`UTF-SER-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`);
    setBatchNumber(`HEAT-SS-${Date.now().toString().slice(-4)}`);
    setWarehouseName('Finished Goods Bay 4 (Dispatch Gate)');
    setLocationBin('Bin-FG-01');
    setQuantity(1);
    setUom('Unit');
    setQcStatus('QC Passed');
    setDispatchStatus('Ready for Dispatch');
    setShowModal(true);
  };

  const openEditModal = (fg: FinishedGoodsItem) => {
    setEditingFg(fg);
    setSelectedWo(fg.workOrderNumber);
    setProductName(fg.productName);
    setSpecification(fg.specification || '');
    setSerialNumber(fg.serialNumber || '');
    setBatchNumber(fg.batchNumber || '');
    setWarehouseName(fg.warehouseName);
    setLocationBin(fg.locationBin);
    setQuantity(fg.quantity);
    setUom(fg.uom);
    setQcStatus(fg.qcStatus);
    setDispatchStatus(fg.status);
    setShowModal(true);
  };

  const handleDelete = (id: string, fgNo: string) => {
    if (confirm(`Are you sure you want to delete Finished Goods record ${fgNo}?`)) {
      if (deleteFinishedGoods) {
        deleteFinishedGoods(id);
      }
    }
  };

  const toggleDispatchStatus = (fg: FinishedGoodsItem) => {
    if (!updateFinishedGoods) return;
    const newStatus: FinishedGoodsItem['status'] =
      fg.status === 'Ready for Dispatch' ? 'Dispatched' : 'Ready for Dispatch';
    updateFinishedGoods(fg.id, { status: newStatus });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedWo = workOrders.find((w) => w.workOrderNumber === selectedWo);
    const matchedJob = projectJobs.find((j) => j.jobNumber === matchedWo?.jobNumber);

    const payload = {
      jobId: matchedWo?.jobId || matchedJob?.id || 'JOB-2026-001',
      jobNumber: matchedWo?.jobNumber || matchedJob?.jobNumber || 'JOB-2026-001',
      workOrderNumber: selectedWo,
      productionOrderNumber: `PO-PROD-${new Date().getFullYear()}-001`,
      productName: productName.trim(),
      specification: specification.trim(),
      quantity: Number(quantity) || 1,
      uom: uom || 'Unit',
      serialNumber: serialNumber.trim() || undefined,
      batchNumber: batchNumber.trim() || undefined,
      warehouseId: 'WH-FG-01',
      warehouseName: warehouseName,
      locationBin: locationBin.trim() || 'Bin-FG-01',
      completionDate: new Date().toISOString().split('T')[0],
      qcStatus: qcStatus,
      status: dispatchStatus,
    };

    if (editingFg) {
      if (updateFinishedGoods) {
        updateFinishedGoods(editingFg.id, payload);
      }
    } else {
      addFinishedGoods(payload);
    }

    setShowModal(false);
    setEditingFg(null);
  };

  // Filtered Finished Goods
  const filtered = useMemo(() => {
    return finishedGoods.filter((fg) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        fg.finishedGoodsNumber?.toLowerCase().includes(q) ||
        fg.jobNumber?.toLowerCase().includes(q) ||
        fg.workOrderNumber?.toLowerCase().includes(q) ||
        fg.productName?.toLowerCase().includes(q) ||
        fg.serialNumber?.toLowerCase().includes(q) ||
        fg.locationBin?.toLowerCase().includes(q) ||
        fg.warehouseName?.toLowerCase().includes(q);

      const matchesWarehouse = filterWarehouse === 'ALL' || fg.warehouseName === filterWarehouse;
      const matchesStatus = filterStatus === 'ALL' || fg.status === filterStatus;

      return matchesSearch && matchesWarehouse && matchesStatus;
    });
  }, [finishedGoods, searchTerm, filterWarehouse, filterStatus]);

  // Unique Warehouses
  const warehousesList = useMemo(() => {
    const set = new Set<string>();
    finishedGoods.forEach((fg) => {
      if (fg.warehouseName) set.add(fg.warehouseName);
    });
    return Array.from(set);
  }, [finishedGoods]);

  // Metrics
  const totalUnits = finishedGoods.reduce((sum, fg) => sum + Number(fg.quantity || 0), 0);
  const readyForDispatchCount = finishedGoods.filter((fg) => fg.status === 'Ready for Dispatch').length;
  const qcPassedCount = finishedGoods.filter((fg) => fg.qcStatus === 'QC Passed').length;
  const dispatchedCount = finishedGoods.filter((fg) => fg.status === 'Dispatched').length;

  if (!mounted) {
    return (
      <div className="p-6 bg-[#FAF7F2] min-h-screen text-[#544B45] flex items-center justify-center">
        <div className="text-xs font-mono text-[#70665F]">Loading Finished Goods Warehouse...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#FAF7F2] text-[#544B45]" suppressHydrationWarning>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-700 border border-sky-500/20">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-800 font-mono font-bold border border-sky-500/20">
                DISPATCH WAREHOUSE
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 font-bold border border-emerald-500/30">
                Ready for Dispatch
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#211B17] tracking-tight mt-1">
              Finished Goods Warehouse Master
            </h1>
            <p className="text-xs text-[#70665F]">
              Completed Customer Machine Assembly Units Stored in Dispatch Warehouse Bays & Yard Locations
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-700 text-white font-bold text-xs shadow-lg shadow-sky-700/20 hover:bg-sky-800 transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> Inward Finished Goods
        </button>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
          <div className="text-[11px] font-bold text-[#70665F] uppercase">Total FG Assemblies</div>
          <div className="text-2xl font-black text-[#211B17] font-mono mt-1">{totalUnits.toFixed(2)}</div>
          <div className="text-[11px] text-[#70665F] mt-0.5">{finishedGoods.length} Recorded Units</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
          <div className="text-[11px] font-bold text-emerald-700 uppercase">Ready For Dispatch</div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">{readyForDispatchCount} Units</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Cleared for Customer Shipping</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
          <div className="text-[11px] font-bold text-sky-700 uppercase">QC Cleared Passed</div>
          <div className="text-2xl font-black text-sky-700 font-mono mt-1">{qcPassedCount} Units</div>
          <div className="text-[11px] text-sky-600 mt-0.5">100% FAT & Hydro Cleared</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
          <div className="text-[11px] font-bold text-indigo-700 uppercase">Dispatched to Site</div>
          <div className="text-2xl font-black text-indigo-700 font-mono mt-1">{dispatchedCount} Units</div>
          <div className="text-[11px] text-indigo-600 mt-0.5">En route / Site Handover</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
            <input
              type="text"
              placeholder="Search FG #, Job #, WO, Product, Bin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] placeholder-[#70665F] focus:outline-none focus:border-sky-600"
            />
          </div>

          <select
            value={filterWarehouse}
            onChange={(e) => setFilterWarehouse(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none focus:border-sky-600"
          >
            <option value="ALL">All Warehouse Bays</option>
            {warehousesList.map((wh) => (
              <option key={wh} value={wh}>
                {wh}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none focus:border-sky-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="Ready for Dispatch">Ready for Dispatch</option>
            <option value="Dispatched">Dispatched</option>
            <option value="In Stock">In Stock</option>
          </select>
        </div>

        <div className="text-xs text-[#70665F] font-mono">
          Showing <span className="text-[#211B17] font-bold">{filtered.length}</span> of{' '}
          <span className="text-[#211B17] font-bold">{finishedGoods.length}</span> Assemblies
        </div>
      </div>

      {/* Finished Goods Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-mono uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">FG Number & Date</th>
                <th className="p-3.5">Job & Work Order #</th>
                <th className="p-3.5">Machine / Product Name</th>
                <th className="p-3.5">Warehouse & Bin</th>
                <th className="p-3.5 text-right">Quantity</th>
                <th className="p-3.5 text-center">QC Clearance</th>
                <th className="p-3.5 text-center">Dispatch Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {isInitialLoading && finishedGoods.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`shimmer-fg-${i}`} className="border-b border-[#EBE3DB]">
                    <td className="p-3.5"><div className="h-4 w-28 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="p-3.5 space-y-1">
                      <div className="h-3.5 w-20 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                    </td>
                    <td className="p-3.5"><div className="h-4 w-48 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="p-3.5 space-y-1">
                      <div className="h-3.5 w-32 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                    </td>
                    <td className="p-3.5 text-right"><div className="h-4 w-12 ml-auto bg-gray-200 rounded animate-pulse" /></td>
                    <td className="p-3.5 text-center"><div className="h-5 w-20 mx-auto bg-gray-200 rounded-full animate-pulse" /></td>
                    <td className="p-3.5 text-center"><div className="h-5 w-24 mx-auto bg-gray-200 rounded-full animate-pulse" /></td>
                    <td className="p-3.5 text-right"><div className="h-6 w-20 ml-auto bg-gray-200 rounded-lg animate-pulse" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#70665F]">
                    No finished goods matching your filter. Click &quot;Inward Finished Goods&quot; to register completed equipment.
                  </td>
                </tr>
              ) : (
                filtered.map((fg) => (
                  <tr key={fg.id} className="hover:bg-[#FAF7F2]/60 transition">
                    <td className="p-3.5 font-medium">
                      <div className="font-mono font-bold text-sky-700">{fg.finishedGoodsNumber}</div>
                      <div className="text-[10px] text-[#70665F] mt-0.5">{fg.completionDate || '2026-10-02'}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-emerald-700 flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                        {fg.jobNumber}
                      </div>
                      <div className="font-mono text-indigo-700 text-[11px] mt-0.5">{fg.workOrderNumber}</div>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <div className="font-semibold text-[#211B17]">{fg.productName}</div>
                      {fg.serialNumber && (
                        <div className="text-[10px] text-[#70665F] font-mono mt-0.5">
                          S/N: <span className="text-[#211B17] font-bold">{fg.serialNumber}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-[#211B17]">{fg.warehouseName}</div>
                      <div className="text-[11px] font-mono text-emerald-700 mt-0.5">{fg.locationBin}</div>
                    </td>
                    <td className="p-3.5 text-right font-bold text-[#211B17] font-mono text-sm">
                      {fg.quantity} {fg.uom}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3 text-emerald-700" />
                        {fg.qcStatus || 'QC Passed'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => toggleDispatchStatus(fg)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
                          fg.status === 'Dispatched'
                            ? 'bg-indigo-500/15 text-indigo-800 border-indigo-500/30 hover:bg-indigo-500/25'
                            : 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30 hover:bg-emerald-500/25'
                        }`}
                      >
                        <Truck className="w-3 h-3" />
                        {fg.status || 'Ready for Dispatch'}
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openJobModal(fg.jobNumber)}
                          className="px-2 py-1 rounded-lg bg-[#FAF7F2] hover:bg-sky-50 text-sky-800 border border-[#EBE3DB] hover:border-sky-300 text-[11px] font-bold transition flex items-center gap-1"
                          title="360° Traceability"
                        >
                          360° Trace
                        </button>
                        <button
                          onClick={() => setViewCertificate(fg)}
                          className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-emerald-50 text-emerald-800 border border-[#EBE3DB] hover:border-emerald-300 transition"
                          title="View FG Passport & Inspection Slip"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(fg)}
                          className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-sky-50 text-sky-800 border border-[#EBE3DB] hover:border-sky-300 transition"
                          title="Edit FG Details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(fg.id, fg.finishedGoodsNumber)}
                          className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-rose-50 text-rose-700 border border-[#EBE3DB] hover:border-rose-300 transition"
                          title="Delete Finished Goods"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inward / Edit Finished Goods Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl text-[#544B45] max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
          >
            <div className="flex justify-between items-center border-b border-[#EBE3DB] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-sky-700" />
                  {editingFg ? 'Edit Finished Goods Record' : 'Inward Finished Goods to Dispatch Bay'}
                </h3>
                <p className="text-[11px] text-[#70665F]">
                  Store completed assembly units with inspection clearance and bin assignments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-[#70665F] hover:text-[#211B17] font-bold text-lg p-1 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#70665F] mb-1">Source Work Order *</label>
                <select
                  required
                  value={selectedWo}
                  onChange={(e) => handleWoChange(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-sky-600 font-mono font-medium"
                >
                  {workOrders.length > 0 ? (
                    workOrders.map((w) => (
                      <option key={w.id} value={w.workOrderNumber}>
                        {w.workOrderNumber} — {w.jobNumber} ({w.productName ? w.productName.slice(0, 35) : 'Process Equipment'})
                      </option>
                    ))
                  ) : (
                    <option value="WO-2026-001-A">WO-2026-001-A — JOB-2026-001 (Chemical Reactor Vessel 10KL)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#70665F] mb-1">Product / Machine Name *</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Heavy SS 316L Chemical Reactor Vessel (10 KL)"
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-sky-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#70665F] mb-1">Specification / Engineering Grade</label>
                <input
                  type="text"
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                  placeholder="e.g. SS 316L Limpet Coil, 10 KL, 6 Bar Design Pressure"
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-sky-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Equipment Serial Number</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. UTF-CR-2026-001"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-sky-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Batch / Heat Number</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="e.g. HEAT-SS316-9921"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-sky-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Warehouse Bay Location *</label>
                  <select
                    value={warehouseName}
                    onChange={(e) => setWarehouseName(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-sky-600"
                  >
                    <option value="Finished Goods Bay 4 (Dispatch Gate)">Finished Goods Bay 4 (Dispatch Gate)</option>
                    <option value="Finished Goods Yard & Dispatch Dock">Finished Goods Yard & Dispatch Dock</option>
                    <option value="Heavy Assembly Bay 03">Heavy Assembly Bay 03</option>
                    <option value="Export Packaging & Crating Yard">Export Packaging & Crating Yard</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Bin / Bay Slot *</label>
                  <input
                    type="text"
                    required
                    value={locationBin}
                    onChange={(e) => setLocationBin(e.target.value)}
                    placeholder="e.g. Bin-FG-01, FG-DOCK-B1"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-sky-600 font-mono font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-sky-600 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">UOM</label>
                  <select
                    value={uom}
                    onChange={(e) => setUom(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-sky-600 font-mono"
                  >
                    <option value="Unit">Unit</option>
                    <option value="Nos">Nos</option>
                    <option value="Set">Set</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">QC Clearance</label>
                  <select
                    value={qcStatus}
                    onChange={(e) => setQcStatus(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-sky-600 font-bold"
                  >
                    <option value="QC Passed">QC Passed</option>
                    <option value="QC Pending">QC Pending</option>
                    <option value="QC Failed">QC Failed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Dispatch Status</label>
                  <select
                    value={dispatchStatus}
                    onChange={(e) => setDispatchStatus(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-sky-600 font-bold"
                  >
                    <option value="Ready for Dispatch">Ready for Dispatch</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="In Stock">In Stock</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] font-semibold hover:bg-[#EBE3DB] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-700 font-bold text-white hover:bg-sky-800 shadow-lg shadow-sky-700/20 transition active:scale-95"
                >
                  {editingFg ? 'Update Record' : 'Inward to FG Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Finished Goods Inspection & Dispatch Passport Modal */}
      {viewCertificate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-sky-500/15 text-sky-800 font-mono text-[10px] font-bold">
                  FINISHED GOODS QUALITY PASSPORT & DISPATCH SLIP
                </span>
                <h3 className="text-lg font-black text-[#211B17] mt-1">
                  {viewCertificate.finishedGoodsNumber}
                </h3>
                <p className="text-xs text-[#70665F]">
                  Job: <span className="font-bold text-[#211B17]">{viewCertificate.jobNumber}</span> • WO:{' '}
                  <span className="font-bold text-[#211B17]">{viewCertificate.workOrderNumber}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-sky-50 text-sky-800 border border-[#EBE3DB] text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Print Slip
                </button>
                <button
                  onClick={() => setViewCertificate(null)}
                  className="p-2 rounded-xl text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-200 space-y-2">
              <div className="text-sm font-black text-[#211B17]">{viewCertificate.productName}</div>
              {viewCertificate.specification && (
                <div className="text-xs text-[#544B45]">
                  <span className="font-bold text-[#70665F]">Spec:</span> {viewCertificate.specification}
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-xs font-mono pt-1">
                {viewCertificate.serialNumber && (
                  <div>
                    <span className="text-[#70665F]">Serial #:</span>{' '}
                    <span className="font-bold text-[#211B17]">{viewCertificate.serialNumber}</span>
                  </div>
                )}
                {viewCertificate.batchNumber && (
                  <div>
                    <span className="text-[#70665F]">Heat/Batch #:</span>{' '}
                    <span className="font-bold text-[#211B17]">{viewCertificate.batchNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB] text-xs">
              <div>
                <span className="text-[10px] text-[#70665F] uppercase font-bold block">Warehouse</span>
                <span className="font-bold text-[#211B17]">{viewCertificate.warehouseName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] uppercase font-bold block">Bay / Bin</span>
                <span className="font-mono font-bold text-sky-700">{viewCertificate.locationBin}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] uppercase font-bold block">Quantity</span>
                <span className="font-mono font-black text-emerald-800 text-sm">
                  {viewCertificate.quantity} {viewCertificate.uom}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] uppercase font-bold block">QC Clearance</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {viewCertificate.qcStatus}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#EBE3DB] text-xs">
              <div className="flex items-center gap-2">
                <QrCode className="w-8 h-8 text-[#211B17]" />
                <div>
                  <div className="font-mono font-bold text-[#211B17]">{viewCertificate.finishedGoodsNumber}</div>
                  <div className="text-[10px] text-[#70665F]">UMA Techno Fab Quality & Dispatch Release Certified</div>
                </div>
              </div>

              <button
                onClick={() => {
                  setViewCertificate(null);
                  openJobModal(viewCertificate.jobNumber);
                }}
                className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-300 font-bold flex items-center gap-1 hover:bg-sky-100 transition"
              >
                View 360° Trace <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewCertificate(null)}
                className="px-5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#211B17] text-xs font-semibold"
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
