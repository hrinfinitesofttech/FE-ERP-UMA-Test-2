'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import { ProductionEntry } from '../../../types/production';
import {
  PlayCircle,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  Printer,
  X,
  Layers,
  Cpu,
  User,
  ShieldCheck,
} from 'lucide-react';

export default function ProductionEntryPage() {
  const {
    productionEntries,
    workOrders,
    workCenters,
    recordProductionEntry,
    updateProductionEntry,
    deleteProductionEntry,
    availableEmployees,
    projectJobs,
    openJobModal,
  } = useERP();

  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWo, setFilterWo] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ProductionEntry | null>(null);
  const [viewVoucher, setViewVoucher] = useState<ProductionEntry | null>(null);
  const [isManualOperator, setIsManualOperator] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form State
  const defaultWo = workOrders[0]?.workOrderNumber || '';
  const defaultWc = workCenters[0]?.workCenterName || 'Fabrication & Rolling Bay 01';

  const [selectedWo, setSelectedWo] = useState(defaultWo);
  const [opName, setOpName] = useState('Plate Rolling & Shell Forming');
  const [wcName, setWcName] = useState(defaultWc);
  const [operator, setOperator] = useState('Mahesh Solanki (Machine Operator)');
  const [produced, setProduced] = useState<number | string>(10);
  const [rejected, setRejected] = useState<number | string>(0);
  const [rework, setRework] = useState<number | string>(0);
  const [scrap, setScrap] = useState<number | string>(0);
  const [downtime, setDowntime] = useState<number | string>(0);
  const [downtimeReason, setDowntimeReason] = useState('');
  const [remarks, setRemarks] = useState('Completed shift target without defects.');

  const computedGood = Math.max(
    0,
    (Number(produced) || 0) - (Number(rejected) || 0) - (Number(scrap) || 0)
  );

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
        setEditingEntry(null);
        setViewVoucher(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openCreateModal = () => {
    setEditingEntry(null);
    setSelectedWo(workOrders[0]?.workOrderNumber || '');
    setOpName('Plate Rolling & Shell Forming');
    setWcName(workCenters[0]?.workCenterName || 'Fabrication & Rolling Bay 01');
    setOperator(
      availableEmployees[0]?.name ||
        `${availableEmployees[0]?.firstName || 'Mahesh'} ${availableEmployees[0]?.lastName || 'Solanki'}`.trim() ||
        'Mahesh Solanki (Machine Operator)'
    );
    setProduced(10);
    setRejected(0);
    setRework(0);
    setScrap(0);
    setDowntime(0);
    setDowntimeReason('');
    setRemarks('Completed shift target without defects.');
    setShowModal(true);
  };

  const openEditModal = (entry: ProductionEntry) => {
    setEditingEntry(entry);
    setSelectedWo(entry.workOrderNumber || defaultWo);
    setOpName(entry.operationName || '');
    setWcName(entry.workCenterName || defaultWc);
    setOperator(entry.operatorName || '');
    setProduced(entry.producedQuantity || 0);
    setRejected(entry.rejectedQuantity || 0);
    setRework(entry.reworkQuantity || 0);
    setScrap(entry.scrapQuantity || 0);
    setDowntime(entry.downtimeMinutes || 0);
    setDowntimeReason(entry.downtimeReason || '');
    setRemarks(entry.remarks || '');
    setShowModal(true);
  };

  const handleDelete = (id: string, entryNo: string) => {
    if (confirm(`Are you sure you want to delete production entry ${entryNo}?`)) {
      if (deleteProductionEntry) {
        deleteProductionEntry(id);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opName.trim()) {
      alert('Operation Name is required and cannot be blank.');
      return;
    }
    const finalOperator = operator.trim() || 'Mahesh Solanki (Machine Operator)';
    const matchedWo = workOrders.find((w) => w.workOrderNumber === selectedWo);
    const matchedJob = projectJobs?.find((j) => j.jobNumber === matchedWo?.jobNumber);

    const entryPayload = {
      entryDate: new Date().toISOString().split('T')[0],
      jobId: matchedWo?.jobId || matchedJob?.id || 'PRJ-2026-0001',
      jobNumber: matchedWo?.jobNumber || matchedJob?.jobNumber || '',
      workOrderNumber: selectedWo,
      productionOrderNumber: `PO-PROD-${new Date().getFullYear()}-001`,
      operationName: opName.trim(),
      workCenterName: wcName || defaultWc,
      machineName: 'SAW Automatic Manipulator M/C-01',
      operatorName: finalOperator,
      startTime: '08:00 AM',
      endTime: '05:00 PM',
      plannedQuantity: 10,
      producedQuantity: Number(produced) || 0,
      rejectedQuantity: Number(rejected) || 0,
      reworkQuantity: Number(rework) || 0,
      scrapQuantity: Number(scrap) || 0,
      downtimeMinutes: Number(downtime) || 0,
      downtimeReason: downtimeReason || undefined,
      remarks: remarks || 'Recorded on shift completion.',
      createdBy: finalOperator,
    };

    if (editingEntry) {
      if (updateProductionEntry) {
        updateProductionEntry(editingEntry.id, entryPayload);
      }
    } else {
      recordProductionEntry(entryPayload);
    }

    setShowModal(false);
    setEditingEntry(null);
  };

  // Filtered entries
  const filtered = useMemo(() => {
    return productionEntries.filter((entry) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        entry.productionEntryNumber?.toLowerCase().includes(q) ||
        entry.jobNumber?.toLowerCase().includes(q) ||
        entry.workOrderNumber?.toLowerCase().includes(q) ||
        entry.operationName?.toLowerCase().includes(q) ||
        entry.operatorName?.toLowerCase().includes(q) ||
        entry.workCenterName?.toLowerCase().includes(q);

      const matchesWo = filterWo === 'ALL' || entry.workOrderNumber === filterWo;
      return matchesSearch && matchesWo;
    });
  }, [productionEntries, searchTerm, filterWo]);

  // Metrics
  const totalEntriesCount = productionEntries.length;
  const totalProducedQty = productionEntries.reduce((sum, e) => sum + Number(e.producedQuantity || 0), 0);
  const totalGoodQty = productionEntries.reduce((sum, e) => sum + Number(e.goodQuantity || 0), 0);
  const totalRejectedQty = productionEntries.reduce((sum, e) => sum + Number(e.rejectedQuantity || 0), 0);
  const totalDowntime = productionEntries.reduce((sum, e) => sum + Number(e.downtimeMinutes || 0), 0);

  if (!mounted) {
    return (
      <div className="p-6 bg-[#FAF7F2] min-h-screen text-[#544B45] flex items-center justify-center">
        <div className="text-xs font-mono text-[#70665F]">Loading Production Entries...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#FAF7F2] text-[#544B45]" suppressHydrationWarning>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-800 font-mono font-bold border border-emerald-500/20">
                SHOP FLOOR EXECUTION
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-lime-500/20 text-lime-800 font-bold border border-lime-500/30">
                Formula Enforced
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#211B17] tracking-tight mt-1">
              Operator Production Entry Form
            </h1>
            <p className="text-xs text-[#70665F]">
              Formula: <b className="text-emerald-700 font-mono">Good Qty = Produced Qty - Rejected Qty - Scrap Qty</b>
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> Log Shift Production Entry
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
          <div className="text-[11px] font-bold text-[#70665F] uppercase">Shift Entries</div>
          <div className="text-2xl font-black text-[#211B17] font-mono mt-1">{totalEntriesCount}</div>
          <div className="text-[11px] text-[#70665F] mt-0.5">Logged in database</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
          <div className="text-[11px] font-bold text-emerald-700 uppercase">Good Output Produced</div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">{totalGoodQty} Units</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">QC Passed Quality</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
          <div className="text-[11px] font-bold text-rose-700 uppercase">Rejected & Scrap</div>
          <div className="text-2xl font-black text-rose-700 font-mono mt-1">{totalRejectedQty} Units</div>
          <div className="text-[11px] text-rose-600 mt-0.5">Defect / Offcut</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
          <div className="text-[11px] font-bold text-amber-700 uppercase">Recorded Downtime</div>
          <div className="text-2xl font-black text-amber-700 font-mono mt-1">{totalDowntime} Min</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Maintenance / Tooling</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
            <input
              type="text"
              placeholder="Search entry #, job #, WO, operator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] placeholder-[#70665F] focus:outline-none focus:border-emerald-600"
            />
          </div>

          <select
            value={filterWo}
            onChange={(e) => setFilterWo(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none focus:border-emerald-600 font-mono"
          >
            <option value="ALL">All Work Orders</option>
            {workOrders.map((w) => (
              <option key={`filter-wo-${w.id}`} value={w.workOrderNumber}>
                {w.workOrderNumber} ({w.jobNumber})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-[#70665F] font-mono">
          Showing <span className="text-[#211B17] font-bold">{filtered.length}</span> of{' '}
          <span className="text-[#211B17] font-bold">{productionEntries.length}</span> Entries
        </div>
      </div>

      {/* Production Entries Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-mono uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">Entry # & Date</th>
                <th className="p-3.5">Job & Work Order</th>
                <th className="p-3.5">Operation & Bay</th>
                <th className="p-3.5">Operator Name</th>
                <th className="p-3.5 text-right">Produced</th>
                <th className="p-3.5 text-right text-rose-700">Rejected</th>
                <th className="p-3.5 text-right text-amber-700">Scrap</th>
                <th className="p-3.5 text-right text-emerald-800">Good Qty</th>
                <th className="p-3.5 text-right">Downtime</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-[#70665F]">
                    No shift production entries recorded yet in database. Click &quot;Log Shift Production Entry&quot; to submit an operator entry.
                  </td>
                </tr>
              ) : (
                filtered.map((entry, idx) => (
                  <tr key={`${entry.id || 'pentry'}-${idx}`} className="hover:bg-[#FAF7F2]/60 transition">
                    <td className="p-3.5 font-medium">
                      <div className="font-mono font-bold text-emerald-700">{entry.productionEntryNumber || entry.id}</div>
                      <div className="text-[10px] text-[#70665F] mt-0.5">{entry.entryDate || '2026-10-04'}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-sky-700 flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-sky-600" />
                        {entry.jobNumber}
                      </div>
                      <div className="font-mono text-indigo-700 text-[11px] mt-0.5">{entry.workOrderNumber}</div>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <div className="font-semibold text-[#211B17]">{entry.operationName}</div>
                      <div className="text-[11px] text-[#70665F] font-mono mt-0.5">{entry.workCenterName}</div>
                    </td>
                    <td className="p-3.5 font-medium text-[#211B17]">{entry.operatorName}</td>
                    <td className="p-3.5 text-right font-bold text-[#211B17] font-mono">{entry.producedQuantity}</td>
                    <td className="p-3.5 text-right font-mono text-rose-700 font-bold">{entry.rejectedQuantity}</td>
                    <td className="p-3.5 text-right font-mono text-amber-700 font-bold">{entry.scrapQuantity}</td>
                    <td className="p-3.5 text-right font-mono font-extrabold text-emerald-800 text-sm">
                      {entry.goodQuantity}
                    </td>
                    <td className="p-3.5 text-right font-mono text-[#70665F]">
                      {entry.downtimeMinutes > 0 ? `${entry.downtimeMinutes}m` : '0m'}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewVoucher(entry)}
                          className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-emerald-50 text-emerald-800 border border-[#EBE3DB] hover:border-emerald-300 transition"
                          title="View Shift Voucher"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(entry)}
                          className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-sky-50 text-sky-800 border border-[#EBE3DB] hover:border-sky-300 transition"
                          title="Edit Entry"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id, entry.productionEntryNumber || entry.id)}
                          className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-rose-50 text-rose-700 border border-[#EBE3DB] hover:border-rose-300 transition"
                          title="Delete Entry"
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

      {/* Entry Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-[#544B45] max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
          >
            <div className="flex justify-between items-center border-b border-[#EBE3DB] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-emerald-700" />
                  {editingEntry ? 'Edit Shift Production Entry' : 'Log Shift Production Entry'}
                </h3>
                <p className="text-[11px] text-[#70665F]">
                  Formula-enforced real-time shop floor entry.
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
                <label className="block font-semibold text-[#70665F] mb-1">Target Work Order *</label>
                <select
                  required
                  value={selectedWo}
                  onChange={(e) => setSelectedWo(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-600 font-mono font-medium"
                >
                  {workOrders.length > 0 ? (
                    workOrders.map((w) => (
                      <option key={w.id} value={w.workOrderNumber}>
                        {w.workOrderNumber} — {w.jobNumber} ({w.productName ? w.productName.slice(0, 30) : 'Chemical Equipment'})
                      </option>
                    ))
                  ) : (
                    <option value="">Select Work Order</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#70665F] mb-1">
                  Operation Name *
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  placeholder="e.g. CNC Plasma Cutting, SAW Welding, Dish Forming"
                  list="operationSuggestions"
                  value={opName}
                  onChange={(e) => setOpName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-600 font-medium"
                />
                <datalist id="operationSuggestions">
                  <option value="CNC Plasma Cutting & Edge Prep" />
                  <option value="Plate Rolling & Shell Forming" />
                  <option value="Dish End Pressing & Crown Forming" />
                  <option value="Longitudinal SAW Automatic Welding" />
                  <option value="Circumferential Seam Welding" />
                  <option value="Nozzle Hole Drilling & Flange Fit-up" />
                  <option value="Limpet Coil Pitch Bending & Welding" />
                  <option value="Jacket Hydrostatic Pressure Testing" />
                  <option value="Post-Weld Heat Treatment (PWHT)" />
                  <option value="Internal Surface Pickling & Passivation" />
                  <option value="External Sand Blasting & Epoxy Primer" />
                  <option value="Final Assembly & FAT Clearance" />
                </datalist>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Work Center Bay</label>
                  <select
                    value={wcName}
                    onChange={(e) => setWcName(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-600"
                  >
                    {workCenters.length > 0 ? (
                      workCenters.map((w) => (
                        <option key={w.id} value={w.workCenterName}>
                          {w.workCenterCode} - {w.workCenterName}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Fabrication & Rolling Bay 01">WC-FAB-01 - Fabrication & Rolling Bay 01</option>
                        <option value="SAW & TIG Welding Bay 02">WC-WELD-02 - SAW & TIG Welding Bay 02</option>
                        <option value="Heavy Machining & Flange Bay 03">WC-MACH-03 - Heavy Machining & Flange Bay 03</option>
                        <option value="Sandblasting & Painting Bay 04">WC-SURF-04 - Sandblasting & Painting Bay 04</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-[#70665F]">Operator Name *</label>
                    <button
                      type="button"
                      onClick={() => setIsManualOperator(!isManualOperator)}
                      className="text-[10px] text-emerald-700 font-bold hover:underline"
                    >
                      {isManualOperator ? 'Select from list' : '+ Enter custom'}
                    </button>
                  </div>

                  {isManualOperator ? (
                    <input
                      type="text"
                      required
                      value={operator}
                      placeholder="e.g. Mahesh Solanki"
                      onChange={(e) => setOperator(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-600"
                    />
                  ) : (
                    <select
                      required
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-600"
                    >
                      <option value="Mahesh Solanki (Machine Operator)">Mahesh Solanki (Machine Operator)</option>
                      <option value="Ketan Parmar (Sr. SAW Welder)">Ketan Parmar (Sr. SAW Welder)</option>
                      <option value="Dinesh Vaghela (Fitter & Rigger)">Dinesh Vaghela (Fitter & Rigger)</option>
                      <option value="Suresh Rathod (CNC Plasma Operator)">Suresh Rathod (CNC Plasma Operator)</option>
                      {availableEmployees.map((emp) => {
                        const name = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
                        return (
                          <option key={emp.id} value={name}>
                            {name} — {emp.department || emp.departmentName || 'Shop Floor'}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
              </div>

              {/* Quantities Grid with Auto Formula Calculation */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] space-y-3">
                <div className="text-xs font-bold text-[#211B17] flex justify-between">
                  <span>Quantity Breakdown</span>
                  <span className="text-emerald-700 font-mono">Good Qty Auto Formula</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <label className="block text-[10px] font-bold text-[#70665F] mb-1">Produced</label>
                    <input
                      type="number"
                      min="0"
                      value={produced}
                      onChange={(e) => setProduced(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1.5 text-[#211B17] text-center font-bold font-mono focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-rose-700 mb-1">Rejected</label>
                    <input
                      type="number"
                      min="0"
                      value={rejected}
                      onChange={(e) => setRejected(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1.5 text-rose-700 text-center font-bold font-mono focus:border-rose-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-amber-700 mb-1">Scrap</label>
                    <input
                      type="number"
                      min="0"
                      value={scrap}
                      onChange={(e) => setScrap(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1.5 text-amber-700 text-center font-bold font-mono focus:border-amber-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-800 mb-1">Calculated Good</label>
                    <div className="w-full bg-emerald-50 border border-emerald-300 rounded-lg py-1.5 text-emerald-800 font-black text-sm text-center font-mono">
                      {computedGood}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Downtime Minutes</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={downtime}
                    onChange={(e) => setDowntime(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#70665F] mb-1">Downtime Reason (if any)</label>
                  <input
                    type="text"
                    value={downtimeReason}
                    onChange={(e) => setDowntimeReason(e.target.value)}
                    placeholder="e.g. SAW electrode replacement"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-600"
                  />
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
                  className="px-5 py-2 rounded-xl bg-emerald-700 font-bold text-white hover:bg-emerald-800 shadow-lg shadow-emerald-700/20 transition active:scale-95"
                >
                  {editingEntry ? 'Update Entry' : 'Submit Production Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voucher Modal */}
      {viewVoucher && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-800 font-mono text-[10px] font-bold">
                  SHIFT PRODUCTION LOG SLIP
                </span>
                <h3 className="text-lg font-black text-[#211B17] mt-1">
                  {viewVoucher.productionEntryNumber || viewVoucher.id}
                </h3>
                <p className="text-xs text-[#70665F]">
                  Job: <span className="font-bold text-[#211B17]">{viewVoucher.jobNumber}</span> • WO:{' '}
                  <span className="font-bold text-[#211B17]">{viewVoucher.workOrderNumber}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-emerald-50 text-emerald-800 border border-[#EBE3DB] text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button
                  onClick={() => setViewVoucher(null)}
                  className="p-2 rounded-xl text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB] text-xs">
              <div>
                <span className="text-[10px] text-[#70665F] uppercase font-bold block">Operation</span>
                <span className="font-bold text-[#211B17]">{viewVoucher.operationName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] uppercase font-bold block">Work Center Bay</span>
                <span className="font-semibold text-[#211B17]">{viewVoucher.workCenterName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] uppercase font-bold block">Operator</span>
                <span className="font-semibold text-[#211B17]">{viewVoucher.operatorName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] uppercase font-bold block">Downtime</span>
                <span className="font-mono font-bold text-amber-700">
                  {viewVoucher.downtimeMinutes ? `${viewVoucher.downtimeMinutes} Min` : '0 Min'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 grid grid-cols-4 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-[#70665F] uppercase block">Total Produced</span>
                <span className="text-lg font-bold text-[#211B17] font-mono">{viewVoucher.producedQuantity}</span>
              </div>
              <div>
                <span className="text-[10px] text-rose-700 uppercase block">Rejected</span>
                <span className="text-lg font-bold text-rose-700 font-mono">{viewVoucher.rejectedQuantity}</span>
              </div>
              <div>
                <span className="text-[10px] text-amber-700 uppercase block">Scrap</span>
                <span className="text-lg font-bold text-amber-700 font-mono">{viewVoucher.scrapQuantity}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-800 uppercase font-bold block">Good Output</span>
                <span className="text-xl font-black text-emerald-800 font-mono">{viewVoucher.goodQuantity}</span>
              </div>
            </div>

            {viewVoucher.downtimeReason && (
              <div className="text-xs p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <span className="font-bold text-[#70665F]">Downtime Reason:</span> {viewVoucher.downtimeReason}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewVoucher(null)}
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
