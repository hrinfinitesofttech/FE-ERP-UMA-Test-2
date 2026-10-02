'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { QCInspection, QCResult, GoodsReceiptNote } from '../../../types/store';
import {
  ShieldCheck,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  ClipboardList,
  Filter,
  CheckCircle2,
  Package,
  Layers,
} from 'lucide-react';

export default function QualityInspectionPage() {
  const { qcInspections, approveQCInspection, addQCInspection, goodsReceipts } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'inspections' | 'pending_grns'>('inspections');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Pass' | 'Fail' | 'Conditional Approval'>('All');
  const [selectedInspection, setSelectedInspection] = useState<QCInspection | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Modal State
  const [inspectorName, setInspectorName] = useState('Suresh Patel (Sr. QC Lead)');
  const [result, setResult] = useState<QCResult>('Pass');
  const [acceptedQty, setAcceptedQty] = useState(0);
  const [rejectedQty, setRejectedQty] = useState(0);
  const [actualSpec, setActualSpec] = useState('');
  const [parameters, setParameters] = useState('Spectro PMI Chemical, Ultrasonic Flaw Check, Dimension Verification');
  const [remarks, setRemarks] = useState('');

  // New Inspection Form State
  const [newGrnId, setNewGrnId] = useState('');
  const [newItemCode, setNewItemCode] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newSupplier, setNewSupplier] = useState('');
  const [newJobId, setNewJobId] = useState('');
  const [newSampleQty, setNewSampleQty] = useState(1);

  // Directly use live database/API inspections from ERPContext
  const allInspections = useMemo(() => {
    return qcInspections || [];
  }, [qcInspections]);

  // All GRNs with Inspection Pending status
  const pendingGrns = useMemo(() => {
    return (goodsReceipts || []).filter(
      (g) => g.status === 'Inspection Pending' || !g.status || g.status === 'Received'
    );
  }, [goodsReceipts]);

  // Find if searchTerm matches a GRN in goodsReceipts
  const matchedPendingGrn = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const term = searchTerm.trim().toLowerCase();
    const grn = (goodsReceipts || []).find((g) => {
      const gNo = (g.grnNumber || (g as any).grn_number || g.id || '').toLowerCase();
      return gNo === term || gNo.includes(term);
    });
    return grn || null;
  }, [searchTerm, goodsReceipts]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const grnParam = params.get('grn');
      if (grnParam) {
        setSearchTerm(grnParam);
        // If there's an existing inspection for this GRN, auto-select it, else if GRN exists, open modal
        const existing = (qcInspections || []).find((q) => q.grnNumber === grnParam || q.grnId === grnParam);
        if (existing) {
          openInspectionModal(existing);
        } else {
          const targetGrn = (goodsReceipts || []).find((g) => g.grnNumber === grnParam || g.id === grnParam);
          if (targetGrn) {
            handleStartInspectionForGrn(targetGrn);
          }
        }
      }
    }
  }, [goodsReceipts, qcInspections]);

  const filtered = useMemo(() => {
    return allInspections.filter((q) => {
      const inspNo = q.inspectionNumber || (q as any).inspection_number || q.id || '';
      const itmName = q.itemName || (q as any).item_name || ((q as any).items && (q as any).items[0]?.itemName) || '';
      const itmCode = q.itemCode || (q as any).item_code || ((q as any).items && (q as any).items[0]?.itemCode) || '';
      const supp = q.supplierName || (q as any).supplier_name || '';
      const grnNo = q.grnNumber || (q as any).grn_number || '';
      const term = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !term ||
        inspNo.toLowerCase().includes(term) ||
        itmName.toLowerCase().includes(term) ||
        itmCode.toLowerCase().includes(term) ||
        supp.toLowerCase().includes(term) ||
        grnNo.toLowerCase().includes(term);

      const qResult = (q.qcResult as string) || (q as any).overall_result || 'Pending';
      const matchesStatus =
        statusFilter === 'All'
          ? true
          : statusFilter === 'Pending'
          ? qResult === 'Pending' || (q as any).status === 'Inspection Pending'
          : qResult === (statusFilter as string);

      return matchesSearch && matchesStatus;
    });
  }, [allInspections, searchTerm, statusFilter]);

  const openInspectionModal = (q: QCInspection) => {
    setSelectedInspection(q);
    const sample = Number(q.sampleQuantity || 1);
    const acc = Number(q.acceptedQuantity ?? sample);
    const rej = Number(q.rejectedQuantity ?? 0);
    setInspectorName(q.inspectorName || 'Suresh Patel (Sr. QC Lead)');
    setResult((q.qcResult as QCResult) || 'Pass');
    setAcceptedQty(acc > 0 ? acc : sample);
    setRejectedQty(rej);
    setActualSpec(q.actualSpecification || 'Chemical PMI & Visual inspection verified OK.');
    setParameters(q.inspectionParameters || 'Spectro PMI Chemical, Ultrasonic Flaw Check, Dimension Verification');
    setRemarks(q.remarks || 'Test certificates verified matching Heat No.');
  };

  const handleStartInspectionForGrn = (grn: GoodsReceiptNote) => {
    const firstItem = grn.items?.[0];
    const sample = Number(firstItem?.receivedQuantity || firstItem?.poQuantity || 1);
    const qcNumber = `QC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const tempQc: QCInspection = {
      id: qcNumber,
      inspectionNumber: qcNumber,
      inspectionDate: new Date().toISOString().split('T')[0],
      grnId: grn.grnNumber || grn.id,
      grnNumber: grn.grnNumber || grn.id,
      itemId: firstItem?.itemId || firstItem?.id || 'ITM-001',
      itemCode: firstItem?.itemCode || 'RAW-MAT',
      itemName: firstItem?.itemName || 'Inward Material',
      jobId: grn.jobId || 'General Stock',
      supplierName: grn.supplierName || 'Supplier',
      requiredSpecification: 'Standard Technical Delivery Conditions (TDC)',
      actualSpecification: 'Inspected OK as per ASTM standard',
      inspectionParameters: 'Spectro PMI Chemical, Ultrasonic Flaw Check, Dimension Verification',
      sampleQuantity: sample,
      acceptedQuantity: sample,
      rejectedQuantity: 0,
      qcResult: 'Pass',
      inspectorName: 'Suresh Patel (Sr. QC Lead)',
      remarks: 'Clearance verified on physical inward arrival.',
    };

    const existing = allInspections.find((q) => q.grnNumber === grn.grnNumber || q.grnId === grn.id);
    if (existing) {
      openInspectionModal(existing);
    } else {
      addQCInspection(tempQc);
      openInspectionModal(tempQc);
    }
  };

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInspection) return;

    approveQCInspection(
      selectedInspection.id,
      inspectorName,
      result,
      acceptedQty,
      rejectedQty,
      remarks,
      actualSpec,
      parameters
    );

    setSelectedInspection(null);
    setToastMessage(`QC Inspection ${selectedInspection.inspectionNumber} cleared with result: ${result}!`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const stats = useMemo(() => {
    const total = allInspections.length;
    const passed = allInspections.filter((q) => q.qcResult === 'Pass').length;
    const failed = allInspections.filter((q) => q.qcResult === 'Fail').length;
    const pending = (pendingGrns.length) + allInspections.filter((q) => (q.qcResult as any) === 'Pending' || (q.acceptedQuantity === 0 && q.rejectedQuantity === 0)).length;
    return { total, passed, failed, pending };
  }, [allInspections, pendingGrns]);

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] min-h-screen text-[#544B45]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-800 border border-amber-500/30 text-xs font-mono font-semibold">
              QUALITY ASSURANCE
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Quality Inspection Manager</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Spectro PMI chemical analysis, ultrasonic flaw detection, thickness verification, and pass/fail store quarantine clearance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/store/grn"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#EBE3DB] text-[#211B17] hover:bg-[#FAF7F2] text-xs font-bold transition shadow-xs"
          >
            <Package className="w-4 h-4 text-amber-800" />
            <span>Store GRN Inward</span>
          </Link>
          <button
            id="create-qc-button"
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-lg shadow-amber-700/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create QC Inspection</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="text-[11px] font-medium text-[#70665F]">Total Inspections Done</div>
          <div className="text-2xl font-black text-[#211B17] mt-1 font-mono">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="text-[11px] font-medium text-amber-700 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Pending Clearance
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1 font-mono">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Passed (Usable Stock)
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">{stats.passed}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="text-[11px] font-medium text-rose-700 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Rejected (Quarantine)
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1 font-mono">{stats.failed}</div>
        </div>
      </div>

      {/* Action Banner if GRN is searched */}
      {matchedPendingGrn && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-700 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#211B17]">
                GRN Ready for Quality Check: <span className="font-mono text-amber-900 font-black">{matchedPendingGrn.grnNumber || matchedPendingGrn.id}</span>
              </div>
              <div className="text-xs text-amber-900 mt-0.5">
                Supplier: <strong>{matchedPendingGrn.supplierName}</strong> | Items: <strong>{matchedPendingGrn.items?.[0]?.itemCode || 'Raw Material'} - {matchedPendingGrn.items?.[0]?.itemName || ''}</strong> (Qty: {matchedPendingGrn.items?.[0]?.receivedQuantity || 1})
              </div>
            </div>
          </div>
          <button
            onClick={() => handleStartInspectionForGrn(matchedPendingGrn)}
            className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition shrink-0 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Perform QC For This GRN</span>
          </button>
        </div>
      )}

      {/* Pending GRNs Inward Section if any */}
      {pendingGrns.length > 0 && !searchTerm && (
        <div className="bg-white rounded-2xl border border-amber-200 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700" />
              <h2 className="text-xs font-bold text-[#211B17] uppercase tracking-wider">
                Inward GRNs Awaiting Quality Clearance ({pendingGrns.length})
              </h2>
            </div>
            <span className="text-[11px] text-[#70665F]">Click &apos;Perform QC&apos; to inspect</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingGrns.map((g) => {
              const grnNum = g.grnNumber || g.id;
              const firstItm = g.items?.[0];
              return (
                <div
                  key={g.id || grnNum}
                  className="bg-[#FAF7F2] border border-[#EBE3DB] hover:border-amber-400 p-3.5 rounded-xl flex flex-col justify-between gap-3 transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-800 text-xs">{grnNum}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                        Pending QC
                      </span>
                    </div>
                    <div className="font-bold text-[#211B17] text-xs mt-1 truncate">
                      {firstItm?.itemCode || 'Material'} - {firstItm?.itemName || 'Inward Goods'}
                    </div>
                    <div className="text-[11px] text-[#70665F] mt-0.5">
                      Supplier: <strong>{g.supplierName}</strong> | Qty: <strong>{firstItm?.receivedQuantity || 1}</strong>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartInspectionForGrn(g)}
                    className="w-full py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Perform QC Now</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter & Status Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search QC no, GRN no, item code, supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-amber-600"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Pending', 'Pass', 'Fail', 'Conditional Approval'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                statusFilter === tab
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#544B45] hover:bg-[#EBE3DB]/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* QC List Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-mono text-[11px] uppercase tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">Inspection No & Date</th>
                <th className="p-3.5">GRN & Job No</th>
                <th className="p-3.5">Item Code & Name</th>
                <th className="p-3.5">Supplier Name</th>
                <th className="p-3.5 text-right">Sample Qty</th>
                <th className="p-3.5 text-right">Accepted Qty</th>
                <th className="p-3.5 text-right">Rejected Qty</th>
                <th className="p-3.5 text-center">QC Result</th>
                <th className="p-3.5">Inspector Lead</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-10 text-center text-[#70665F]">
                    <div className="max-w-md mx-auto space-y-3">
                      <ClipboardList className="w-9 h-9 mx-auto text-amber-700/60" />
                      <div className="font-bold text-sm text-[#211B17]">No Quality Inspections found</div>
                      <p className="text-xs text-[#70665F]">
                        {searchTerm ? `No inspection found matching "${searchTerm}".` : 'No inspection records in database.'}
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        {matchedPendingGrn ? (
                          <button
                            onClick={() => handleStartInspectionForGrn(matchedPendingGrn)}
                            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Perform QC For {matchedPendingGrn.grnNumber || matchedPendingGrn.id}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setIsNewModalOpen(true)}
                            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>+ Create New QC Inspection</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((q) => {
                  const inspNo = q.inspectionNumber || (q as any).inspection_number || q.id || 'QC';
                  const dateStr = q.inspectionDate || (q as any).inspection_date || '';
                  const grnNo = q.grnNumber || (q as any).grn_number || '-';
                  const job = q.jobId || 'General Stock';
                  const itmCode = q.itemCode || (q as any).item_code || '-';
                  const itmName = q.itemName || (q as any).item_name || '-';
                  const suppName = q.supplierName || (q as any).supplier_name || '-';
                  const smpQty = Number(q.sampleQuantity ?? 1);
                  const accQty = Number(q.acceptedQuantity ?? 0);
                  const rejQty = Number(q.rejectedQuantity ?? 0);
                  const qcRes = (q.qcResult as string) || (q as any).overall_result || 'Pending';
                  const inspLead = q.inspectorName || (q as any).inspector || 'Unassigned';

                  const isPending = qcRes === 'Pending' || (accQty === 0 && rejQty === 0);

                  return (
                    <tr key={q.id || inspNo} className="hover:bg-[#FAF7F2]/60 transition">
                      <td className="p-3.5 font-medium">
                        <div className="font-bold text-amber-800 text-xs font-mono">{inspNo}</div>
                        <div className="text-[10px] text-[#70665F] mt-0.5">{dateStr}</div>
                      </td>
                      <td className="p-3.5 font-mono text-[#544B45]">
                        <div className="text-amber-800 font-semibold">{grnNo}</div>
                        <div className="text-[10px] text-amber-600 mt-0.5">{job}</div>
                      </td>
                      <td className="p-3.5 font-medium">
                        <div className="font-bold text-[#211B17] text-xs">{itmCode}</div>
                        <div className="text-[11px] text-[#70665F] mt-0.5">{itmName}</div>
                      </td>
                      <td className="p-3.5 font-bold text-[#211B17]">{suppName}</td>
                      <td className="p-3.5 text-right font-mono text-[#544B45]">{smpQty.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                        {accQty?.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-rose-700">
                        {rejQty?.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                            qcRes === 'Pass'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : qcRes === 'Fail'
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : qcRes === 'Conditional Approval'
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                          }`}
                        >
                          {qcRes === 'Pass' && <CheckCircle className="w-3 h-3" />}
                          {qcRes === 'Fail' && <XCircle className="w-3 h-3" />}
                          {qcRes === 'Conditional Approval' && <AlertTriangle className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          <span>{qcRes}</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-[#544B45] text-xs">{inspLead}</td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => openInspectionModal(q)}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{isPending ? 'Perform QC' : 'Update QC'}</span>
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

      {/* Update / Perform QC Modal */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
                Perform Quality Inspection Clearance
              </h2>
              <button
                onClick={() => setSelectedInspection(null)}
                className="p-1 rounded-lg text-[#70665F] hover:bg-[#FAF7F2] hover:text-[#211B17] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApprove} className="space-y-4 text-xs">
              {/* Item Details Box */}
              <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EBE3DB] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-amber-800 font-bold">{selectedInspection.inspectionNumber}</span>
                  <span className="text-[11px] text-[#70665F]">GRN: <strong className="text-[#211B17]">{selectedInspection.grnNumber}</strong></span>
                </div>
                <div className="font-bold text-[#211B17] text-sm">
                  {selectedInspection.itemCode} - {selectedInspection.itemName}
                </div>
                <div className="text-[11px] text-[#70665F] flex flex-wrap gap-x-4 gap-y-1">
                  <span>Supplier: <strong>{selectedInspection.supplierName}</strong></span>
                  <span>Job: <strong>{selectedInspection.jobId || 'General Stock'}</strong></span>
                  <span>Sample / Received Qty: <strong>{selectedInspection.sampleQuantity}</strong></span>
                </div>
              </div>

              {/* Inspector Lead Name */}
              <div>
                <label className="block font-semibold text-[#211B17] mb-1">Inspector Lead Name</label>
                <input
                  type="text"
                  required
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-600 font-medium"
                />
              </div>

              {/* QC Decision */}
              <div>
                <label className="block font-semibold text-[#211B17] mb-1">QC Decision Result</label>
                <select
                  value={result}
                  onChange={(e) => {
                    const res = e.target.value as QCResult;
                    setResult(res);
                    const total = Number(selectedInspection.sampleQuantity || 1);
                    if (res === 'Pass') {
                      setAcceptedQty(total);
                      setRejectedQty(0);
                    } else if (res === 'Fail') {
                      setAcceptedQty(0);
                      setRejectedQty(total);
                    }
                  }}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-semibold focus:outline-none focus:border-amber-600"
                >
                  <option value="Pass">Pass (100% Usable Stock - Sync to Store Inventory)</option>
                  <option value="Fail">Fail (Rejected - Move to Quarantine / Scrap Yard)</option>
                  <option value="Conditional Approval">Conditional Approval (Derated / Concession Use)</option>
                </select>
              </div>

              {/* Accepted vs Rejected Quantities */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-emerald-800">Accepted Quantity</label>
                    <button
                      type="button"
                      onClick={() => {
                        const total = Number(selectedInspection.sampleQuantity || 1);
                        setAcceptedQty(total);
                        setRejectedQty(0);
                      }}
                      className="text-[10px] text-emerald-700 underline font-semibold cursor-pointer"
                    >
                      Accept All
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    required
                    value={acceptedQty}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setAcceptedQty(val);
                      const total = Number(selectedInspection.sampleQuantity || 1);
                      if (val <= total) {
                        setRejectedQty(total - val);
                      }
                    }}
                    className="w-full bg-[#FAF7F2] border border-emerald-300 rounded-xl px-3 py-2 text-emerald-800 font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-rose-800">Rejected Quantity</label>
                    <button
                      type="button"
                      onClick={() => {
                        const total = Number(selectedInspection.sampleQuantity || 1);
                        setAcceptedQty(0);
                        setRejectedQty(total);
                      }}
                      className="text-[10px] text-rose-700 underline font-semibold cursor-pointer"
                    >
                      Reject All
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    required
                    value={rejectedQty}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setRejectedQty(val);
                      const total = Number(selectedInspection.sampleQuantity || 1);
                      if (val <= total) {
                        setAcceptedQty(total - val);
                      }
                    }}
                    className="w-full bg-[#FAF7F2] border border-rose-300 rounded-xl px-3 py-2 text-rose-800 font-bold focus:outline-none focus:border-rose-600"
                  />
                </div>
              </div>

              {/* Inspection Parameters & Observations */}
              <div>
                <label className="block font-semibold text-[#211B17] mb-1">Inspection Parameters & Test Standards</label>
                <input
                  type="text"
                  value={parameters}
                  onChange={(e) => setParameters(e.target.value)}
                  placeholder="e.g. Spectro PMI Chemical, Ultrasonic Flaw Check, Dimension verification"
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#211B17] mb-1">Actual Specification / Lab Observations</label>
                <input
                  type="text"
                  value={actualSpec}
                  onChange={(e) => setActualSpec(e.target.value)}
                  placeholder="e.g. Ultrasonic thickness 8.05 mm, PMI Ni 10.2%, Mo 2.1%"
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#211B17] mb-1">Remarks & MTC Verification Notes</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Verified Heat No against Mill Test Certificate. Passed visual inspection."
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setSelectedInspection(null)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] hover:bg-[#EBE3DB] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-lg shadow-amber-700/30 transition cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Inspection Clearance</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Inspection Entry Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-700" />
                Create New QC Inspection Entry
              </h2>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-lg text-[#70665F] hover:bg-[#FAF7F2] hover:text-[#211B17] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const selectedGrn = (goodsReceipts || []).find((g) => g.grnNumber === newGrnId || g.id === newGrnId);
                const firstItem = selectedGrn?.items?.[0];
                const finalCode = newItemCode || firstItem?.itemCode || 'BO-MOT-001';
                const finalName = newItemName || firstItem?.itemName || 'Flameproof Motor';
                const finalSupp = newSupplier || selectedGrn?.supplierName || 'ABB India Limited';
                const finalJob = newJobId || selectedGrn?.jobId || 'JOB-2026-001';
                const finalSample = Number(newSampleQty || firstItem?.receivedQuantity || 1);

                const newQc: Omit<QCInspection, 'id' | 'inspectionNumber'> = {
                  inspectionDate: new Date().toISOString().split('T')[0],
                  grnId: newGrnId || selectedGrn?.grnNumber || 'GRN-2026-0002',
                  grnNumber: newGrnId || selectedGrn?.grnNumber || 'GRN-2026-0002',
                  itemId: firstItem?.itemId || 'ITM-001',
                  itemCode: finalCode,
                  itemName: finalName,
                  jobId: finalJob,
                  supplierName: finalSupp,
                  requiredSpecification: 'Standard Engineering TDC Specification',
                  actualSpecification: 'Awaiting inspection measurement',
                  inspectionParameters: 'Spectro PMI Chemical, Ultrasonic Flaw Check, Dimension Verification',
                  sampleQuantity: finalSample,
                  acceptedQuantity: 0,
                  rejectedQuantity: 0,
                  qcResult: 'Pending' as any,
                  inspectorName: 'Suresh Patel (Sr. QC Lead)',
                  remarks: 'Created manually for pending inward batch.',
                };

                addQCInspection(newQc);
                setIsNewModalOpen(false);
                setToastMessage('New QC Inspection entry created successfully!');
                setTimeout(() => setToastMessage(''), 4000);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-semibold text-[#211B17] mb-1">Select Inward GRN</label>
                <select
                  value={newGrnId}
                  onChange={(e) => {
                    const gId = e.target.value;
                    setNewGrnId(gId);
                    const grn = (goodsReceipts || []).find((g) => g.grnNumber === gId || g.id === gId);
                    if (grn) {
                      setNewSupplier(grn.supplierName);
                      setNewJobId(grn.jobId || 'General Stock');
                      const itm = grn.items?.[0];
                      if (itm) {
                        setNewItemCode(itm.itemCode);
                        setNewItemName(itm.itemName);
                        setNewSampleQty(Number(itm.receivedQuantity || 1));
                      }
                    }
                  }}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] font-semibold focus:outline-none focus:border-amber-600"
                >
                  <option value="">-- Choose from Inward GRNs --</option>
                  {(goodsReceipts || []).map((g) => (
                    <option key={g.id || g.grnNumber} value={g.grnNumber || g.id}>
                      {g.grnNumber || g.id} - {g.supplierName} ({g.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#211B17] mb-1">Item Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BO-MOT-001"
                    value={newItemCode}
                    onChange={(e) => setNewItemCode(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#211B17] mb-1">Sample Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newSampleQty}
                    onChange={(e) => setNewSampleQty(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#211B17] mb-1">Item Description / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flameproof Electric Induction Motor (15 HP)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#211B17] mb-1">Supplier Name</label>
                  <input
                    type="text"
                    placeholder="e.g. ABB India Limited"
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#211B17] mb-1">Project Job No</label>
                  <input
                    type="text"
                    placeholder="e.g. JOB-2026-001"
                    value={newJobId}
                    onChange={(e) => setNewJobId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] hover:bg-[#EBE3DB] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-lg shadow-amber-700/30 transition cursor-pointer"
                >
                  Create Inspection Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
