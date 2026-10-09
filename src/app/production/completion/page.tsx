'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { 
  CheckCircle2, ShieldCheck, PackageCheck, AlertCircle, AlertTriangle, Plus, 
  ChevronRight, Printer, X, Eye, FileText, Cpu, Building, Award, Sparkles, Filter, Search
} from 'lucide-react';
import { ProductionCompletion, WorkOrder } from '../../../types/production';

function WorkOrderCompletionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { workOrders, completeWorkOrder, addFinishedGoods, openJobModal, productionCompletions } = useERP();

  const [showModal, setShowModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotification, setSuccessNotification] = useState<{
    woNumber: string;
    productName: string;
    certNo: string;
    serialNo: string;
  } | null>(null);

  // Form State
  const [selectedWo, setSelectedWo] = useState('');
  const [completedQty, setCompletedQty] = useState(1);
  const [completedBy, setCompletedBy] = useState('Bhavin Shah (Production Manager)');
  const [qcInspector, setQcInspector] = useState('Ramesh Patel (Lead NDT Level-II Inspector)');

  // QC Testing Specifics
  const [hydroDesignPressure, setHydroDesignPressure] = useState('6.0 Bar');
  const [hydroTestPressure, setHydroTestPressure] = useState('9.0 Bar (1.5x Design)');
  const [hydroHoldingDuration, setHydroHoldingDuration] = useState('60 Minutes');
  const [hydroStatus, setHydroStatus] = useState<'Passed' | 'Failed'>('Passed');

  const [dpWeldsInspected, setDpWeldsInspected] = useState('100% Long Seam, Circ Seam & Nozzle Neck Welds');
  const [dpObservation, setDpObservation] = useState('Nil Cracks, Zero Porosity, Clean Uniform Penetration');
  const [dpStatus, setDpStatus] = useState<'Accepted' | 'Defects Found'>('Accepted');

  const [dimensionReportNo, setDimensionReportNo] = useState(() => `QC-DIM-2026-${Date.now().toString().slice(-4)}`);
  const [dimensionStatus, setDimensionStatus] = useState<'Within ASME Tolerance (±2mm)' | 'Deviation Approved'>('Within ASME Tolerance (±2mm)');

  const [equipmentSerialNo, setEquipmentSerialNo] = useState(() => `UTF-EQ-2026-${Date.now().toString().slice(-4)}`);
  const [warehouseLocation, setWarehouseLocation] = useState('Finished Goods Bay 4 (Dispatch Gate)');
  const [remarks, setRemarks] = useState('Final manufacturing sign-off completed. Hydro testing and DP clearance certified.');

  const handledParamWoRef = useRef<string | null>(null);

  const handleWoChange = (woNumber: string) => {
    setSelectedWo(woNumber);
    const wo = workOrders.find((w) => w.workOrderNumber === woNumber);
    if (wo) {
      setCompletedQty(wo.productionQuantity || 1);
      setEquipmentSerialNo(`UTF-${wo.jobNumber?.replace('JOB-', '') || 'EQ'}-${Date.now().toString().slice(-4)}`);
      // Dynamically extract design pressure if specified in product description
      const match = wo.productName?.match(/(\d+(\.\d+)?)\s*Bar/i);
      if (match) {
        setHydroDesignPressure(`${match[1]} Bar`);
        setHydroTestPressure(`${(Number(match[1]) * 1.5).toFixed(1)} Bar (1.5x Design)`);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    // Clear query parameter from URL so it doesn't re-trigger on state changes
    if (searchParams.get('woNumber')) {
      router.replace('/production/completion');
    }
  };

  // Pre-fill from query param (?woNumber=...)
  useEffect(() => {
    const paramWo = searchParams.get('woNumber');
    if (paramWo) {
      if (handledParamWoRef.current !== paramWo) {
        handledParamWoRef.current = paramWo;
        handleWoChange(paramWo);
        setShowModal(true);
      }
    } else {
      handledParamWoRef.current = null;
      if (workOrders.length > 0 && !selectedWo) {
        const pendingWo = workOrders.find((w) => w.status !== 'Completed') || workOrders[0];
        if (pendingWo) {
          handleWoChange(pendingWo.workOrderNumber);
        }
      }
    }
  }, [searchParams, workOrders, selectedWo]);

  // Matching Work Order
  const currentWo = useMemo(() => {
    return workOrders.find((w) => w.workOrderNumber === selectedWo) || workOrders[0];
  }, [workOrders, selectedWo]);

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWo) {
      alert('Please select a valid work order.');
      return;
    }

    if (currentWo.status === 'Completed') {
      alert(`Work Order ${currentWo.workOrderNumber} is already completed and transferred to Finished Goods Warehouse.`);
      closeModal();
      return;
    }

    // Critical QC Guard: Block completion if Hydro or DP test failed
    if (hydroStatus === 'Failed' || dpStatus === 'Defects Found') {
      alert('QUALITY CLEARANCE REJECTED: Equipment failed Hydrostatic Pressure Test or NDT DP inspection. You cannot clear this work order or transfer to Finished Goods. Please log a Rework Order.');
      return;
    }

    setIsSubmitting(true);
    try {
      const certNo = `QC-CERT-2026-${Date.now().toString().slice(-5)}`;

      // 1. Mark Work Order Completed & Log QC Clearance
      completeWorkOrder({
        completionDate: new Date().toISOString().split('T')[0],
        jobId: currentWo.jobId || 'PRJ-2026-0001',
        jobNumber: currentWo.jobNumber || '',
        workOrderNumber: currentWo.workOrderNumber,
        productName: currentWo.productName || 'Industrial Process Equipment',
        completedQuantity: Number(completedQty) || 1,
        rejectedQuantity: 0,
        reworkQuantity: 0,
        scrapQuantity: 0,
        completedBy,
        qcStatus: 'Passed',
        remarks,
        // QC Tests
        hydroTestPressure: `${hydroDesignPressure} / ${hydroTestPressure} (${hydroHoldingDuration})`,
        hydroHoldingDuration,
        hydroTestStatus: hydroStatus,
        dpTestJoints: `${dpWeldsInspected} - ${dpObservation}`,
        dpTestStatus: dpStatus,
        dimensionReportNo,
        dimensionStatus,
        qcInspectorName: qcInspector,
        certificateNumber: certNo,
        equipmentSerialNumber: equipmentSerialNo,
      });

      // 2. Automatically transfer to Finished Goods Warehouse Master
      addFinishedGoods({
        jobId: currentWo.jobId || 'PRJ-2026-0001',
        jobNumber: currentWo.jobNumber || '',
        workOrderNumber: currentWo.workOrderNumber,
        productionOrderNumber: 'PO-PROD-2026-001',
        productName: currentWo.productName || 'Industrial Process Equipment',
        specification: `Hydro Tested @ ${hydroTestPressure}, DP Cleared by ${qcInspector}`,
        quantity: Number(completedQty) || 1,
        uom: currentWo.uom || 'Unit',
        serialNumber: equipmentSerialNo,
        batchNumber: `HEAT-MTC-${Date.now().toString().slice(-4)}`,
        warehouseId: 'WH-FG-01',
        warehouseName: warehouseLocation,
        locationBin: 'Bay-04-ReadyYard',
        completionDate: new Date().toISOString().split('T')[0],
        qcStatus: 'QC Passed',
        status: 'Ready for Dispatch',
      });

      closeModal();
      setSuccessNotification({
        woNumber: currentWo.workOrderNumber,
        productName: currentWo.productName || 'Industrial Process Equipment',
        certNo,
        serialNo: equipmentSerialNo,
      });
      alert(`✅ SUCCESS: Work Order ${currentWo.workOrderNumber} has been certified and transferred to Finished Goods Warehouse! Certificate #${certNo}`);
    } catch (err: any) {
      console.error(err);
      alert('Failed to complete work order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Work Orders
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((wo) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        wo.workOrderNumber?.toLowerCase().includes(q) ||
        wo.jobNumber?.toLowerCase().includes(q) ||
        wo.productName?.toLowerCase().includes(q) ||
        wo.customerName?.toLowerCase().includes(q)
      );
    });
  }, [workOrders, searchTerm]);

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#FAF7F2] min-h-screen text-[#544B45]">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                FINAL STAGE CLEARANCE
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight mt-1">
              Work Order Completion & QC Clearance
            </h1>
            <p className="text-xs text-[#70665F]">
              Hydrostatic Pressure Testing • DP Dye Penetrant Inspection • Dimensional Check • Finished Goods Handover
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push('/production/finished-goods')}
            className="flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-[#EFE8DF] text-[#544B45] text-xs font-bold px-3.5 py-2.5 rounded-xl border border-[#E5DCD3] transition cursor-pointer"
          >
            <PackageCheck className="w-4 h-4 text-sky-700" />
            <span>View Finished Goods Warehouse</span>
          </button>
          <button
            onClick={() => {
              const pendingWo = workOrders.find((w) => w.status !== 'Completed') || workOrders[0];
              if (pendingWo) {
                handleWoChange(pendingWo.workOrderNumber);
              }
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-[#8B2500] hover:bg-[#701E00] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Sign-Off Work Order & QC</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successNotification && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-2">
                <span>Work Order {successNotification.woNumber} Successfully Certified & Transferred!</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-200 text-emerald-900 font-mono">
                  Cert: {successNotification.certNo}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                {successNotification.productName} • Serial: <span className="font-mono font-bold">{successNotification.serialNo}</span> • Now available in Finished Goods Warehouse.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => router.push('/production/finished-goods')}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 transition active:scale-95"
            >
              <PackageCheck className="w-4 h-4" />
              <span>View in Finished Goods →</span>
            </button>
            <button
              onClick={() => setSuccessNotification(null)}
              className="p-2 text-emerald-700 hover:text-emerald-900 rounded-lg hover:bg-emerald-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#70665F] uppercase">Active Work Orders</span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-700">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#211B17] mt-2 font-mono">
            {workOrders.length}
          </div>
          <p className="text-[11px] text-[#8C827A] mt-1 font-medium">In fabrication queue</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#70665F] uppercase">Completed & Cleared</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2 font-mono">
            {workOrders.filter((w) => w.status === 'Completed').length}
          </div>
          <p className="text-[11px] text-[#8C827A] mt-1 font-medium">100% FAT, Hydro & QC passed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#70665F] uppercase">Awaiting QC Handover</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2 font-mono">
            {workOrders.filter((w) => w.status !== 'Completed').length}
          </div>
          <p className="text-[11px] text-[#8C827A] mt-1 font-medium">Ready for pressure testing sign-off</p>
        </div>
      </div>

      {/* Work Orders Handover Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#EBE3DB] flex items-center justify-between">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C827A]" />
            <input
              type="text"
              placeholder="Search WO #, Job #, Product Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl pl-9 pr-4 py-2 text-xs text-[#211B17] focus:outline-hidden focus:border-[#8B2500]"
            />
          </div>
          <div className="text-xs text-[#70665F] font-mono">
            Showing <strong className="text-[#211B17]">{filteredWorkOrders.length}</strong> Work Orders
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-bold uppercase text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="py-3 px-4">Work Order #</th>
                <th className="py-3 px-4">Job Number</th>
                <th className="py-3 px-4">Equipment / Product Name</th>
                <th className="py-3 px-4 text-right">Qty</th>
                <th className="py-3 px-4">Target Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filteredWorkOrders.map((wo) => {
                const isCompleted = wo.status === 'Completed';

                return (
                  <tr key={wo.id} className="hover:bg-[#FAF7F2]/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#8B2500]">{wo.workOrderNumber}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#211B17]">
                      <div className="flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-[#8B2500]" />
                        {wo.jobNumber}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#211B17] max-w-xs">{wo.productName}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#211B17]">
                      {wo.productionQuantity} {wo.uom}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#70665F]">{wo.plannedEndDate}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        }`}
                      >
                        {wo.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!isCompleted ? (
                        <button
                          onClick={() => {
                            handleWoChange(wo.workOrderNumber);
                            setShowModal(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#8B2500] hover:bg-[#701E00] text-white text-xs font-bold transition shadow-xs flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>QC Sign-Off & Transfer</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-800 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>Transferred to FG</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* QC Clearance & Sign-off Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#EBE3DB] pb-3">
              <div>
                <h3 className="text-base font-black text-[#211B17] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  Official Work Order Completion & Quality Clearance
                </h3>
                <p className="text-[11px] text-[#70665F]">
                  Hydro Pressure Testing, DP Dye Penetrant and Finished Goods Registration
                </p>
              </div>
              <button onClick={closeModal} className="text-[#8C827A] hover:text-[#211B17] text-base p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              {/* Work Order Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#70665F] mb-1">Target Work Order *</label>
                  <select
                    value={selectedWo}
                    onChange={(e) => handleWoChange(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-mono font-bold"
                  >
                    {workOrders.map((w) => (
                      <option key={w.id} value={w.workOrderNumber}>
                        {w.workOrderNumber} — {w.status === 'Completed' ? '✓ Completed' : 'Pending QC'} — {w.jobNumber} ({w.productName ? w.productName.slice(0, 22) : 'Equipment'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#70665F] mb-1">Quantity Cleared *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={completedQty}
                    onChange={(e) => setCompletedQty(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-mono font-bold"
                  />
                </div>
              </div>

              {/* TEST 1: Hydrostatic Pressure Test Section */}
              <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-950 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-4 h-4 text-sky-700" />
                    1. Hydrostatic Pressure Testing Inspection
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
                    ASME Sec VIII Div 1
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-sky-900 mb-0.5">Design Pressure</label>
                    <input
                      type="text"
                      value={hydroDesignPressure}
                      onChange={(e) => setHydroDesignPressure(e.target.value)}
                      className="w-full bg-white border border-sky-200 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold text-[#211B17]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-sky-900 mb-0.5">Hydro Test Pressure (1.5x)</label>
                    <input
                      type="text"
                      value={hydroTestPressure}
                      onChange={(e) => setHydroTestPressure(e.target.value)}
                      className="w-full bg-white border border-sky-200 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold text-[#8B2500]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-sky-900 mb-0.5">Holding Duration</label>
                    <input
                      type="text"
                      value={hydroHoldingDuration}
                      onChange={(e) => setHydroHoldingDuration(e.target.value)}
                      className="w-full bg-white border border-sky-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#211B17]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#70665F]">Pressure hold outcome:</span>
                  <select
                    value={hydroStatus}
                    onChange={(e) => setHydroStatus(e.target.value as any)}
                    className={`px-2.5 py-1 rounded text-xs font-bold border cursor-pointer ${
                      hydroStatus === 'Passed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-red-50 text-red-800 border-red-300 font-black'
                    }`}
                  >
                    <option value="Passed">✓ Hydro Test Passed (Zero Drop)</option>
                    <option value="Failed">❌ Hydro Test Failed (Pressure Drop / Leak)</option>
                  </select>
                </div>
              </div>

              {/* TEST 2: DP (Dye Penetrant / NDT) Inspection */}
              <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-950 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-purple-700" />
                    2. Liquid Dye Penetrant (DP / NDT) Testing
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                    ISO 3452-1 / ASME Sec V
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-purple-900 mb-0.5">Welds Joint Coverage</label>
                    <input
                      type="text"
                      value={dpWeldsInspected}
                      onChange={(e) => setDpWeldsInspected(e.target.value)}
                      className="w-full bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 text-xs text-[#211B17]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-purple-900 mb-0.5">Visual & Penetrant Observation</label>
                    <input
                      type="text"
                      value={dpObservation}
                      onChange={(e) => setDpObservation(e.target.value)}
                      className="w-full bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 text-xs text-[#211B17]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#70665F]">Liquid Penetrant observation:</span>
                  <select
                    value={dpStatus}
                    onChange={(e) => setDpStatus(e.target.value as any)}
                    className={`px-2.5 py-1 rounded text-xs font-bold border cursor-pointer ${
                      dpStatus === 'Accepted'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-red-50 text-red-800 border-red-300 font-black'
                    }`}
                  >
                    <option value="Accepted">✓ DP Accepted (Nil Surface Defects)</option>
                    <option value="Defects Found">❌ Defects Found (Cracks / Porosity Detected)</option>
                  </select>
                </div>
              </div>

              {/* TEST 3: Dimensional Check & Equipment Tagging */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#70665F] mb-1">Dimension Inspection Report #</label>
                  <input
                    type="text"
                    value={dimensionReportNo}
                    onChange={(e) => setDimensionReportNo(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#70665F] mb-1">Equipment Serial / Tag No *</label>
                  <input
                    type="text"
                    required
                    value={equipmentSerialNo}
                    onChange={(e) => setEquipmentSerialNo(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#8B2500] font-mono font-bold"
                  />
                </div>
              </div>

              {/* Inspectors & Destination Warehouse */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#70665F] mb-1">Lead Quality Inspector *</label>
                  <input
                    type="text"
                    required
                    value={qcInspector}
                    onChange={(e) => setQcInspector(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#70665F] mb-1">Transfer to Warehouse Bay *</label>
                  <input
                    type="text"
                    required
                    value={warehouseLocation}
                    onChange={(e) => setWarehouseLocation(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-semibold"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block font-bold text-[#70665F] mb-1">Clearance Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17]"
                />
              </div>

              {/* Quality Rejection Enforcement Banner */}
              {(hydroStatus === 'Failed' || dpStatus === 'Defects Found') && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-2.5 animate-in fade-in">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-xs">QUALITY REJECTION ENFORCED: Work Order Clearance Blocked</div>
                    <p className="text-[11px] text-red-700 leading-relaxed">
                      Equipment failed mandatory quality testing ({hydroStatus === 'Failed' ? 'Hydrostatic Pressure Test' : ''}
                      {hydroStatus === 'Failed' && dpStatus === 'Defects Found' ? ' and ' : ''}
                      {dpStatus === 'Defects Found' ? 'Liquid Dye Penetrant NDT Inspection' : ''}). This equipment CANNOT be cleared as Finished Goods. You must route it for rework.
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push(`/production/rework?woNumber=${selectedWo}`)}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] cursor-pointer"
                    >
                      <span>Route to Rework Order →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Already Completed Status Banner */}
              {currentWo?.status === 'Completed' && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-xs text-emerald-950">
                      WORK ORDER ALREADY COMPLETED & TRANSFERRED
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Work Order <strong>{currentWo.workOrderNumber}</strong> ({currentWo.productName}) has already been certified and transferred to Finished Goods Warehouse.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          closeModal();
                          router.push('/production/finished-goods');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] cursor-pointer flex items-center gap-1"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>View in Finished Goods Warehouse →</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] font-semibold cursor-pointer hover:bg-[#EFE8DF] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || hydroStatus === 'Failed' || dpStatus === 'Defects Found' || currentWo?.status === 'Completed'}
                  className={`px-5 py-2 rounded-xl text-white font-bold shadow-xs transition active:scale-95 flex items-center gap-1.5 ${
                    isSubmitting || hydroStatus === 'Failed' || dpStatus === 'Defects Found' || currentWo?.status === 'Completed'
                      ? 'bg-stone-300 cursor-not-allowed opacity-60 text-stone-600'
                      : 'bg-[#8B2500] hover:bg-[#701E00] cursor-pointer'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Processing & Certifying...'
                      : currentWo?.status === 'Completed'
                      ? '✓ Already Completed & Transferred'
                      : 'Certify & Transfer to Finished Goods'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkOrderCompletionPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-stone-500 font-semibold bg-[#FAF7F2] min-h-screen flex items-center justify-center">
        Loading Work Order Completion & QC Clearance...
      </div>
    }>
      <WorkOrderCompletionContent />
    </Suspense>
  );
}
