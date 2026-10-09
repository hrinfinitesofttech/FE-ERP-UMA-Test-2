'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Building,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const STANDARD_FAB_STAGES = [
  '1. Plate Cutting & CNC Edge Prep',
  '2. Shell Plate Rolling & Forming',
  '3. Longitudinal SAW Automatic Welding',
  '4. Circumferential Seam Auto Welding',
  '5. Dish End Crown & Petal Fitting',
  '6. Nozzle Hole Drilling & Flange Fit-up',
  '7. Limpet Coil Pitch Bending & Welding',
  '8. Post-Weld Heat Treatment (PWHT) & Grinding',
  '9. Final Assembly & Ready for QC',
];

function ProductionEntryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // Form State
  const defaultWo = workOrders[0]?.workOrderNumber || '';
  const defaultWc = workCenters[0]?.workCenterName || 'Fabrication & Rolling Bay 01';

  const [selectedWo, setSelectedWo] = useState(defaultWo);
  const [opName, setOpName] = useState(STANDARD_FAB_STAGES[1]);
  const [wcName, setWcName] = useState(defaultWc);
  const [machineName, setMachineName] = useState('Heavy 3-Roll Plate Bending M/C (40mm)');
  const [operator, setOperator] = useState('Mahesh Solanki (Machine Operator)');
  const [shiftType, setShiftType] = useState<'Day Shift' | 'Night Shift'>('Day Shift');
  const [shiftHours, setShiftHours] = useState<number | string>(8.5);
  const [produced, setProduced] = useState<number | string>(1);
  const [rejected, setRejected] = useState<number | string>(0);
  const [rework, setRework] = useState<number | string>(0);
  const [scrap, setScrap] = useState<number | string>(0);
  const [downtime, setDowntime] = useState<number | string>(0);
  const [downtimeReason, setDowntimeReason] = useState('');
  const [remarks, setRemarks] = useState('Shift fabrication target completed within tolerance.');

  const computedGood = Math.max(
    0,
    (Number(produced) || 0) - (Number(rejected) || 0) - (Number(scrap) || 0)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle URL query parameters (e.g. ?woNumber=WO-2026-0001)
  useEffect(() => {
    const paramWo = searchParams.get('woNumber');
    if (paramWo) {
      const match = workOrders.find((w) => w.workOrderNumber === paramWo || w.id === paramWo);
      if (match) {
        setSelectedWo(match.workOrderNumber);
        setShowModal(true);
      }
    }
  }, [searchParams, workOrders]);

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
    setOpName(STANDARD_FAB_STAGES[1]);
    setWcName(workCenters[0]?.workCenterName || 'Fabrication & Rolling Bay 01');
    setMachineName('Heavy 3-Roll Plate Bending M/C (40mm)');
    setOperator(
      availableEmployees[0]?.name ||
        `${availableEmployees[0]?.firstName || 'Mahesh'} ${availableEmployees[0]?.lastName || 'Solanki'}`.trim() ||
        'Mahesh Solanki (Machine Operator)'
    );
    setShiftType('Day Shift');
    setShiftHours(8.5);
    setProduced(1);
    setRejected(0);
    setRework(0);
    setScrap(0);
    setDowntime(0);
    setDowntimeReason('');
    setRemarks('Shift fabrication target completed within tolerance.');
    setShowModal(true);
  };

  const openEditModal = (entry: ProductionEntry) => {
    setEditingEntry(entry);
    setSelectedWo(entry.workOrderNumber || defaultWo);
    setOpName(entry.operationName || '');
    setWcName(entry.workCenterName || defaultWc);
    setMachineName(entry.machineName || 'SAW Automatic Manipulator M/C-01');
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
    const matchedJob = projectJobs?.find((j) => j.jobNumber === matchedWo?.jobNumber || j.id === matchedWo?.jobId);

    const entryPayload = {
      entryDate: new Date().toISOString().split('T')[0],
      jobId: matchedWo?.jobId || matchedJob?.id || 'PRJ-2026-0001',
      jobNumber: matchedWo?.jobNumber || matchedJob?.jobNumber || '',
      workOrderNumber: selectedWo,
      productionOrderNumber: `PO-PROD-${new Date().getFullYear()}-001`,
      operationName: opName.trim(),
      workCenterName: wcName || defaultWc,
      machineName: machineName || 'Heavy Plate Rolling M/C',
      operatorName: finalOperator,
      startTime: shiftType === 'Day Shift' ? '08:00 AM' : '08:00 PM',
      endTime: shiftType === 'Day Shift' ? '05:00 PM' : '05:00 AM',
      plannedQuantity: matchedWo?.productionQuantity || 1,
      producedQuantity: Number(produced) || 0,
      rejectedQuantity: Number(rejected) || 0,
      reworkQuantity: Number(rework) || 0,
      scrapQuantity: Number(scrap) || 0,
      downtimeMinutes: Number(downtime) || 0,
      downtimeReason: downtimeReason || undefined,
      remarks: remarks || `Logged in ${shiftType} (${shiftHours} Hrs).`,
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
    <div className="p-4 sm:p-6 space-y-6 bg-[#FAF7F2] text-[#544B45]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700 border border-emerald-100">
            <PlayCircle className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono font-bold border border-emerald-200">
                SHOP FLOOR EXECUTION
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-lime-50 text-lime-800 font-bold border border-lime-200">
                WIP Auto-Sync
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#211B17] tracking-tight mt-1">
              Operator Production Entry Portal
            </h1>
            <p className="text-xs text-[#70665F]">
              Shift Hours & Machine Logging • Formula-enforced: <b className="text-emerald-700 font-mono">Good = Produced - Rejected - Scrap</b>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push('/production/wip')}
            className="flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-[#EFE8DF] text-[#544B45] text-xs font-bold px-3.5 py-2.5 rounded-xl border border-[#E5DCD3] transition cursor-pointer"
          >
            <Layers className="w-4 h-4 text-indigo-700" />
            <span>View WIP Matrix</span>
          </button>
          <button
            onClick={() => router.push('/production/completion')}
            className="flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-[#EFE8DF] text-[#544B45] text-xs font-bold px-3.5 py-2.5 rounded-xl border border-[#E5DCD3] transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>QC Clearance</span>
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B2500] hover:bg-[#701E00] text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Log Shift Entry
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="text-[11px] font-bold text-[#70665F] uppercase">Shift Entries Logged</div>
          <div className="text-2xl font-black text-[#211B17] font-mono mt-1">{totalEntriesCount}</div>
          <div className="text-[11px] text-[#70665F] mt-0.5">Live shop floor database</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase">Good Output Produced</div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">{totalGoodQty} Units</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Advanced to next stage</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="text-[11px] font-bold text-rose-700 uppercase">Rejected & Scrap</div>
          <div className="text-2xl font-black text-rose-700 font-mono mt-1">{totalRejectedQty} Units</div>
          <div className="text-[11px] text-rose-600 mt-0.5">Defect / Offcut</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="text-[11px] font-bold text-amber-700 uppercase">Recorded Downtime</div>
          <div className="text-2xl font-black text-amber-700 font-mono mt-1">{totalDowntime} Min</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Tooling / Maintenance delay</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
            <input
              type="text"
              placeholder="Search entry #, job #, WO, operator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] placeholder-[#70665F] focus:outline-hidden focus:border-[#8B2500]"
            />
          </div>

          <select
            value={filterWo}
            onChange={(e) => setFilterWo(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-hidden focus:border-[#8B2500] font-mono"
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
      <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] uppercase font-bold text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="py-3 px-4">Entry # & Date</th>
                <th className="py-3 px-4">Job & WO #</th>
                <th className="py-3 px-4">Fabrication Stage / Operation</th>
                <th className="py-3 px-4">Machine & Bay</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4 text-center">Good / Produced</th>
                <th className="py-3 px-4 text-center">Downtime</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#8C827A]">
                    <PlayCircle className="w-8 h-8 mx-auto mb-2 text-[#C8B8A6] opacity-50" />
                    <p className="font-semibold text-sm">No production entries recorded yet</p>
                    <p className="text-xs text-[#8C827A] mt-1">Click &quot;Log Shift Entry&quot; to log daily shift operator work.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#FAF7F2]/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#8B2500]">{entry.productionEntryNumber}</div>
                      <div className="text-[10px] text-[#70665F] mt-0.5">{entry.entryDate}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#211B17] flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-[#8B2500]" />
                        {entry.jobNumber}
                      </div>
                      <div className="text-[11px] font-mono text-[#70665F]">{entry.workOrderNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#211B17] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E5DCD3]">
                        {entry.operationName}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#211B17]">{entry.machineName || 'Bay Equipment'}</div>
                      <div className="text-[10px] text-[#70665F]">{entry.workCenterName}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#211B17]">
                      {entry.operatorName}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-black text-emerald-800 text-sm">
                        {entry.goodQuantity}
                      </span>
                      <span className="text-[#8C827A] text-[11px]"> / {entry.producedQuantity} Units</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {entry.downtimeMinutes > 0 ? (
                        <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {entry.downtimeMinutes}m
                        </span>
                      ) : (
                        <span className="text-[#8C827A]">0m</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewVoucher(entry)}
                          className="p-1.5 hover:bg-[#FAF7F2] rounded-lg text-emerald-800 transition cursor-pointer"
                          title="View Official Shift Log Slip"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(entry)}
                          className="p-1.5 hover:bg-[#FAF7F2] rounded-lg text-blue-700 transition cursor-pointer"
                          title="Edit Entry"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id, entry.productionEntryNumber)}
                          className="p-1.5 hover:bg-[#FAF7F2] rounded-lg text-rose-700 transition cursor-pointer"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Record Shift Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl text-[#544B45] max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#EBE3DB] pb-3">
              <div>
                <h3 className="text-base font-black text-[#211B17] flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-emerald-700" />
                  {editingEntry ? 'Edit Production Entry' : 'Log Shift Production Entry'}
                </h3>
                <p className="text-[11px] text-[#70665F]">
                  Updates live shop floor WIP matrix & fabrication completion %
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-[#8C827A] hover:text-[#211B17] font-bold text-lg p-1 rounded-lg hover:bg-[#FAF7F2] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Target Work Order */}
              <div>
                <label className="block font-bold text-[#70665F] mb-1">Select Work Order & Job *</label>
                <select
                  required
                  value={selectedWo}
                  onChange={(e) => setSelectedWo(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-mono font-bold"
                >
                  {workOrders.map((w) => (
                    <option key={w.id} value={w.workOrderNumber}>
                      {w.workOrderNumber} — {w.jobNumber} | {w.productName ? w.productName.slice(0, 32) : 'Equipment'} ({w.customerName || 'Client'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fabrication Stage */}
              <div>
                <label className="block font-bold text-[#70665F] mb-1">
                  Fabrication Stage / Operation Name *
                </label>
                <select
                  required
                  value={opName}
                  onChange={(e) => setOpName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-bold text-xs"
                >
                  {STANDARD_FAB_STAGES.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg}
                    </option>
                  ))}
                  <option value="Limpet Coil Pitch Bending & Welding">7. Limpet Coil Pitch Bending & Welding</option>
                  <option value="Internal Pickling & Passivation">8. Internal Pickling & Passivation</option>
                  <option value="Final Hydro Pressure Test & FAT">9. Final Hydro Pressure Test & FAT</option>
                </select>
              </div>

              {/* Work Center & Machine */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#70665F] mb-1">Work Center Bay *</label>
                  <select
                    value={wcName}
                    onChange={(e) => setWcName(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-semibold"
                  >
                    <option value="Fabrication & Rolling Bay 01">WC-FAB-01 - Fabrication & Rolling Bay 01</option>
                    <option value="SAW & TIG Welding Bay 02">WC-WELD-02 - SAW & TIG Welding Bay 02</option>
                    <option value="Heavy Machining & Flange Bay 03">WC-MACH-03 - Heavy Machining & Flange Bay 03</option>
                    <option value="Sandblasting & Painting Bay 04">WC-SURF-04 - Sandblasting & Painting Bay 04</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#70665F] mb-1">Machine / Equipment Used</label>
                  <input
                    type="text"
                    value={machineName}
                    onChange={(e) => setMachineName(e.target.value)}
                    placeholder="e.g. 40mm Plate Rolling M/C"
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17]"
                  />
                </div>
              </div>

              {/* Shift, Hours & Operator */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#70665F] mb-1">Shift Type</label>
                  <select
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-bold"
                  >
                    <option value="Day Shift">Day Shift (08 AM - 05 PM)</option>
                    <option value="Night Shift">Night Shift (08 PM - 05 AM)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#70665F] mb-1">Shift Hours Worked</label>
                  <input
                    type="number"
                    step="0.5"
                    value={shiftHours}
                    onChange={(e) => setShiftHours(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#70665F] mb-1">Operator *</label>
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-semibold"
                  >
                    <option value="Mahesh Solanki (Machine Operator)">Mahesh Solanki (Machine Operator)</option>
                    <option value="Ketan Parmar (Sr. SAW Welder)">Ketan Parmar (Sr. SAW Welder)</option>
                    <option value="Dinesh Vaghela (Fitter & Rigger)">Dinesh Vaghela (Fitter & Rigger)</option>
                    <option value="Suresh Rathod (CNC Plasma Operator)">Suresh Rathod (CNC Plasma Operator)</option>
                    {availableEmployees.map((emp) => (
                      <option key={emp.id} value={emp.name || emp.firstName}>
                        {emp.name || emp.firstName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantities Grid with Auto Formula Calculation */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DCD3] space-y-2">
                <div className="text-xs font-bold text-[#211B17] flex justify-between">
                  <span>Output Quantity Breakdown</span>
                  <span className="text-emerald-800 font-mono text-[11px]">Good = Produced - Rejected - Scrap</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <label className="block text-[10px] font-bold text-[#70665F] mb-1">Produced</label>
                    <input
                      type="number"
                      min="0"
                      value={produced}
                      onChange={(e) => setProduced(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white border border-[#E5DCD3] rounded-lg px-2 py-1.5 text-[#211B17] text-center font-bold font-mono focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-rose-700 mb-1">Rejected</label>
                    <input
                      type="number"
                      min="0"
                      value={rejected}
                      onChange={(e) => setRejected(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white border border-[#E5DCD3] rounded-lg px-2 py-1.5 text-rose-700 text-center font-bold font-mono focus:border-rose-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-amber-700 mb-1">Scrap</label>
                    <input
                      type="number"
                      min="0"
                      value={scrap}
                      onChange={(e) => setScrap(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white border border-[#E5DCD3] rounded-lg px-2 py-1.5 text-amber-700 text-center font-bold font-mono focus:border-amber-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-800 mb-1">Calculated Good</label>
                    <div className="w-full bg-emerald-50 border border-emerald-300 rounded-lg py-1.5 text-emerald-900 font-black text-sm text-center font-mono">
                      {computedGood}
                    </div>
                  </div>
                </div>
              </div>

              {/* Downtime */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#70665F] mb-1">Downtime (Minutes)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={downtime}
                    onChange={(e) => setDowntime(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#70665F] mb-1">Downtime Reason</label>
                  <input
                    type="text"
                    value={downtimeReason}
                    onChange={(e) => setDowntimeReason(e.target.value)}
                    placeholder="e.g. Electrode replacement / Fit-up alignment"
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17]"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block font-bold text-[#70665F] mb-1">Remarks / Shift Notes</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex justify-end gap-2 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] font-semibold hover:bg-[#EBE3DB] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8B2500] hover:bg-[#701E00] font-bold text-white shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingEntry ? 'Update Entry' : 'Log Shift Entry & Sync WIP'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Shift Log Slip Preview Modal */}
      {viewVoucher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[10px] font-bold">
                  OFFICIAL PRODUCTION SHIFT VOUCHER
                </span>
                <h3 className="text-xl font-black text-[#8B2500] font-mono mt-1">
                  {viewVoucher.productionEntryNumber || viewVoucher.id}
                </h3>
              </div>
              <button
                onClick={() => setViewVoucher(null)}
                className="p-1 rounded-lg text-[#8C827A] hover:bg-[#FAF7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5DCD3] space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#70665F]">Job Number:</span>
                <span className="font-mono font-bold text-[#211B17]">{viewVoucher.jobNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#70665F]">Work Order:</span>
                <span className="font-mono font-bold text-[#8B2500]">{viewVoucher.workOrderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#70665F]">Stage / Operation:</span>
                <span className="font-bold text-[#211B17]">{viewVoucher.operationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#70665F]">Machine & Bay:</span>
                <span className="font-semibold text-[#211B17]">{viewVoucher.machineName || 'Bay Equipment'} ({viewVoucher.workCenterName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#70665F]">Operator Name:</span>
                <span className="font-bold text-[#211B17]">{viewVoucher.operatorName}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E5DCD3]">
                <span className="font-bold text-[#211B17]">Good Output Cleared:</span>
                <span className="font-mono font-black text-emerald-800 text-base">{viewVoucher.goodQuantity} Units</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE8DF] text-[#211B17] text-xs font-bold border border-[#E5DCD3] flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#8B2500]" />
                <span>Print Slip</span>
              </button>
              <button
                onClick={() => setViewVoucher(null)}
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

export default function ProductionEntryPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-stone-500 font-semibold bg-[#FAF7F2] min-h-screen flex items-center justify-center">
        Loading Production Entry Portal...
      </div>
    }>
      <ProductionEntryContent />
    </Suspense>
  );
}
