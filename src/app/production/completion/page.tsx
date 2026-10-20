'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { InProcessInspectionRow, InspectionReportDoc, ProductionCompletion } from '../../../types/production';
import { formatDate } from '../../../lib/utils';
import { printContent } from '../../../lib/printUtils';
import {
  CheckCircle2,
  ShieldCheck,
  PackageCheck,
  AlertCircle,
  Plus,
  Printer,
  X,
  Eye,
  FileText,
  Search,
  Filter,
  Factory,
  ChevronRight,
  Sparkles,
  Award,
  Building,
  RotateCcw,
  Check,
  Calendar,
  Layers,
  Save,
  Trash2,
  Truck,
  ArrowLeft,
} from 'lucide-react';

// Default standard 9-stage inspection rows matching the physical sheet (Doc no.: F - QAS - 02)
const DEFAULT_INSPECTION_ROWS: InProcessInspectionRow[] = [
  {
    processName: 'Cutting',
    parameters: 'Length, Width & Thickness',
    testingMethod: 'Measure Tape & Vernier Caliper',
    requirements: 'As per dwg. 5THK x 7860 x 5500 mm / 4THK x 2516 x 2516 mm / ISMC 100x50 - 5012',
    actual: 'OK',
    remarks: '',
  },
  {
    processName: 'Grinding',
    parameters: 'Finishing',
    testingMethod: 'Visual',
    requirements: 'Ok / not ok',
    actual: 'OK',
    remarks: '',
  },
  {
    processName: 'Bending',
    parameters: 'ID , OD',
    testingMethod: 'Measure Tape & Gauge',
    requirements: 'As per dwg 5THK x 7860 x 5500 / 4THK x 2516 x 2516 / ISMC 100x50 - 5012',
    actual: 'OK',
    remarks: '',
  },
  {
    processName: 'Taking (Fit-up & Tack)',
    parameters: 'Dimensions',
    testingMethod: 'Measure Tape',
    requirements: 'As per dwg Tank shell, Top, Cone, Channel',
    actual: 'OK',
    remarks: '',
  },
  {
    processName: 'Welding',
    parameters: 'Leakage',
    testingMethod: 'DP Test & X Ray & Hydraulic test (As Per customer Req.)',
    requirements: 'Normal storage water - No Leakage, Time 9:00 to 11:00',
    actual: 'OK',
    remarks: 'No Leakage',
  },
  {
    processName: 'Welding',
    parameters: 'Finishing',
    testingMethod: 'Visual',
    requirements: 'OK',
    actual: 'OK',
    remarks: '',
  },
  {
    processName: 'Final Grinding',
    parameters: 'Finishing',
    testingMethod: 'Visual',
    requirements: 'Ok / not ok',
    actual: 'OK',
    remarks: '',
  },
  {
    processName: 'Sand Blasting',
    parameters: 'Corazon (Surface Profile)',
    testingMethod: 'Visual',
    requirements: 'Ok / not ok',
    actual: 'No Req',
    remarks: '',
  },
  {
    processName: 'Painting',
    parameters: 'Color Shade',
    testingMethod: 'Visual',
    requirements: 'Ok / not ok',
    actual: 'No Req But MS Plates Primer Paint',
    remarks: '',
  },
];

// Initial mock completions for demonstration if storage is empty
const INITIAL_MOCK_COMPLETIONS: ProductionCompletion[] = [
  {
    id: 'COMP-2026-001',
    completionNumber: 'QC-2026-001',
    completionDate: '2026-05-08',
    jobId: 'PRJ-2026-001',
    jobNumber: 'UTF-26-46 B',
    workOrderNumber: 'UTF-26-46 B',
    customerName: 'Ananth Chem',
    productName: '25 KL Vertical Tank',
    completedQuantity: 1,
    rejectedQuantity: 0,
    reworkQuantity: 0,
    scrapQuantity: 0,
    completedBy: 'Rohit (QC Inspector)',
    qcStatus: 'Passed',
    docNo: 'F - QAS - 02',
    inspectionBy: 'Rohit',
    remarks: 'Normal storage water - No Leakage observed. Primer paint applied on MS plates.',
    inspectionRows: DEFAULT_INSPECTION_ROWS,
    inspectionReport: {
      docNo: 'F - QAS - 02',
      reportTitle: 'In process cum final inspection report',
      companyName: 'UMA TECHNO FAB',
      customerName: 'Ananth Chem',
      item: '25 KL Vertical Tank',
      workOrderOrJobNo: 'UTF-26-46 B',
      qty: '1 Nos',
      date: '2026-05-08',
      inspectionRows: DEFAULT_INSPECTION_ROWS,
      inspectionBy: 'Rohit',
      finalStatus: 'Approved',
    },
  },
];

function ProductionCompletionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    projectJobs,
    projectPlanningRecords,
    productionCompletions,
    completeWorkOrder,
    addFinishedGoods,
  } = useERP();

  // Completed / Inspection Records List (Persisted in localStorage)
  const [completions, setCompletions] = useState<ProductionCompletion[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('UMA_ERP_inspectionReports');
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return productionCompletions && productionCompletions.length > 0 ? productionCompletions : INITIAL_MOCK_COMPLETIONS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('UMA_ERP_inspectionReports', JSON.stringify(completions));
      } catch (_) {}
    }
  }, [completions]);

  // Mode: 'list' (Table list) | 'create' (FULL PAGE QC INSPECTION ENTRY FORM)
  const [mode, setMode] = useState<'list' | 'create'>(() => {
    const urlMode = searchParams.get('mode');
    const urlAction = searchParams.get('action');
    return urlMode === 'new' || urlAction === 'new' || urlMode === 'create' ? 'create' : 'list';
  });

  // Watch URL changes
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    const urlAction = searchParams.get('action');
    if (urlMode === 'new' || urlAction === 'new' || urlMode === 'create') {
      setMode('create');
    }
  }, [searchParams]);

  // Modal for Viewing/Printing Certificate
  const [viewingReport, setViewingReport] = useState<ProductionCompletion | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Passed' | 'Failed' | 'Pending'>('all');

  // Form Fields for Full Page QC Inspection Entry (Doc no.: F - QAS - 02)
  const [formCustomerName, setFormCustomerName] = useState('Ananth Chem');
  const [formItem, setFormItem] = useState('25 KL Vertical Tank');
  const [formWorkOrderNo, setFormWorkOrderNo] = useState('UTF-26-46 B');
  const [formQty, setFormQty] = useState('1 Nos');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formInspectionBy, setFormInspectionBy] = useState('Rohit (QC Inspector)');
  const [formStatus, setFormStatus] = useState<'Passed' | 'Failed' | 'Pending'>('Passed');
  const [formRemarks, setFormRemarks] = useState('');
  const [formInspectionRows, setFormInspectionRows] = useState<InProcessInspectionRow[]>(
    DEFAULT_INSPECTION_ROWS.map((r) => ({ ...r }))
  );

  // Quick Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // When project/job is selected from dropdown, auto-fill form
  const handleSelectProject = (projId: string) => {
    const prj = projectJobs.find((p) => p.id === projId || p.projectNumber === projId);
    if (prj) {
      setFormWorkOrderNo(prj.jobNumber || prj.projectNumber || 'UTF-2026');
      setFormCustomerName(prj.customerName || 'Customer');
      setFormItem(prj.productName || 'Process Equipment');
      setFormQty(`${prj.quantity || 1} Nos`);
    } else {
      const plan = projectPlanningRecords.find((p) => p.id === projId || p.projectNumber === projId);
      if (plan) {
        setFormWorkOrderNo(plan.projectNumber);
        setFormCustomerName(plan.customerName);
        setFormItem(plan.productName);
        setFormQty('1 Nos');
      }
    }
  };

  // Open Full-Page Create Mode
  const handleOpenCreateFullPage = () => {
    setMode('create');
    setFormInspectionRows(DEFAULT_INSPECTION_ROWS.map((r) => ({ ...r })));
    setFormDate(new Date().toISOString().split('T')[0]);
    if (projectJobs.length > 0) {
      const first = projectJobs[0];
      setFormWorkOrderNo(first.jobNumber || first.projectNumber);
      setFormCustomerName(first.customerName);
      setFormItem(first.productName);
      setFormQty(`${first.quantity || 1} Nos`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close Full-Page Create Mode
  const handleCancelCreate = () => {
    setMode('list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update a specific inspection row in form
  const handleUpdateInspectionRow = (
    index: number,
    field: keyof InProcessInspectionRow,
    value: string
  ) => {
    setFormInspectionRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  // Add custom inspection row
  const handleAddCustomRow = () => {
    setFormInspectionRows((prev) => [
      ...prev,
      {
        processName: 'Special Inspection',
        parameters: 'Specification Check',
        testingMethod: 'Visual / Gauge',
        requirements: 'As per customer drawing',
        actual: 'OK',
        remarks: '',
      },
    ]);
  };

  // Remove inspection row
  const handleRemoveRow = (index: number) => {
    if (formInspectionRows.length <= 1) return;
    setFormInspectionRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit and Save Inspection Report
  const handleSaveInspectionReport = (e: React.FormEvent) => {
    e.preventDefault();

    const certId = `QC-2026-${Date.now().toString().slice(-4)}`;
    const newReportDoc: InspectionReportDoc = {
      docNo: 'F - QAS - 02',
      reportTitle: 'In process cum final inspection report',
      companyName: 'UMA TECHNO FAB',
      customerName: formCustomerName,
      item: formItem,
      workOrderOrJobNo: formWorkOrderNo,
      qty: formQty,
      date: formDate,
      inspectionRows: formInspectionRows,
      inspectionBy: formInspectionBy,
      finalStatus: formStatus === 'Passed' ? 'Approved' : 'Rejected',
    };

    const newRecord: ProductionCompletion = {
      id: `COMP-${Date.now()}`,
      completionNumber: certId,
      completionDate: formDate,
      jobId: formWorkOrderNo,
      jobNumber: formWorkOrderNo,
      workOrderNumber: formWorkOrderNo,
      customerName: formCustomerName,
      productName: formItem,
      completedQuantity: parseInt(formQty, 10) || 1,
      rejectedQuantity: 0,
      reworkQuantity: 0,
      scrapQuantity: 0,
      completedBy: formInspectionBy,
      qcStatus: formStatus,
      docNo: 'F - QAS - 02',
      inspectionBy: formInspectionBy,
      remarks: formRemarks || 'Inspection cleared as per Doc no.: F - QAS - 02 specifications.',
      inspectionRows: formInspectionRows,
      inspectionReport: newReportDoc,
    };

    setCompletions((prev) => [newRecord, ...prev]);

    // Add to Finished Goods automatically if Passed
    if (formStatus === 'Passed') {
      addFinishedGoods({
        jobId: formWorkOrderNo,
        jobNumber: formWorkOrderNo,
        workOrderNumber: formWorkOrderNo,
        productionOrderNumber: formWorkOrderNo,
        productName: formItem,
        specification: `Inspection F-QAS-02 Certified: ${formCustomerName}`,
        quantity: parseInt(formQty, 10) || 1,
        uom: 'NOS',
        warehouseId: 'WH-FG-01',
        warehouseName: 'Finished Goods Bay',
        locationBin: 'Bay 4 (Dispatch Inspection Cleared)',
        completionDate: formDate,
        qcStatus: 'QC Passed',
        status: 'Production Complete',
      });
    }

    setMode('list');
    showToast(`Inspection Report ${certId} (F - QAS - 02) created & saved!`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered List
  const filteredCompletions = useMemo(() => {
    return completions.filter((c) => {
      if (statusFilter !== 'all' && c.qcStatus !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (c.completionNumber && c.completionNumber.toLowerCase().includes(q)) ||
          (c.jobNumber && c.jobNumber.toLowerCase().includes(q)) ||
          (c.customerName && c.customerName.toLowerCase().includes(q)) ||
          (c.productName && c.productName.toLowerCase().includes(q)) ||
          (c.inspectionBy && c.inspectionBy.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [completions, statusFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#211B17] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[#EBE3DB]/20 text-xs animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: FULL PAGE NEW QC INSPECTION REPORT                                */}
      {/* ========================================================================= */}
      {mode === 'create' ? (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Top Bar with Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={handleCancelCreate}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to QC Clearance List</span>
            </button>

            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1.5 bg-amber-100 text-amber-900 rounded-xl text-xs font-mono font-bold border border-amber-300">
                Doc no.: F - QAS - 02
              </span>
              <button
                type="button"
                onClick={handleCancelCreate}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Form Container (Full Width & Spacious Card) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Report Document Header (Exact reproduction of letterhead) */}
            <div className="bg-[#211B17] text-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold font-serif text-lg flex-shrink-0">
                  UMA
                </div>
                <div>
                  <div className="text-[11px] text-amber-400 font-mono tracking-widest uppercase font-bold">
                    UMA TECHNO FAB — QUALITY ASSURANCE SYSTEM
                  </div>
                  <h2 className="text-lg font-black text-white uppercase tracking-wider font-mono">
                    In process cum final inspection report
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    New QC Inspection Entry Form (Cutting, Bending, Tacking, Welding, Grinding, Blasting, Painting)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1.5 bg-white/10 rounded-xl text-xs font-mono font-bold text-amber-300 border border-white/20">
                  Doc no.: F - QAS - 02
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveInspectionReport} className="p-6 space-y-6 text-xs">
              {/* Quick Fill from Existing Projects Dropdown */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      Quick Fill from Active Manufacturing Projects:
                    </span>
                    <span className="text-[11px] text-slate-600">
                      Select an existing project or work order to instantly populate Customer, Item, and Job Number.
                    </span>
                  </div>
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleSelectProject(e.target.value);
                  }}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 text-[#211B17] min-w-[260px]"
                >
                  <option value="">-- Choose Existing Project to Pre-fill --</option>
                  {projectJobs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.jobNumber || p.projectNumber} • {p.customerName} • {p.productName}
                    </option>
                  ))}
                  {projectPlanningRecords.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.projectNumber} • {plan.customerName}
                    </option>
                  ))}
                </select>
              </div>

              {/* TOP HEADER FIELDS (Customer, Job, Date, Item, Qty) */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-slate-600" />
                  <span>Equipment &amp; Job Metadata</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Customer Name */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      Customer Name: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formCustomerName}
                      onChange={(e) => setFormCustomerName(e.target.value)}
                      placeholder="e.g. Ananth Chem"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Work order / Job No */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      Work order No. / Job No: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formWorkOrderNo}
                      onChange={(e) => setFormWorkOrderNo(e.target.value)}
                      placeholder="e.g. UTF-26-46 B"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      Inspection Date: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Item / Product */}
                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-800 mb-1.5">
                      Item (Equipment Name / Specification): <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formItem}
                      onChange={(e) => setFormItem(e.target.value)}
                      placeholder="e.g. 25 KL Vertical Tank"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      Qty: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formQty}
                      onChange={(e) => setFormQty(e.target.value)}
                      placeholder="e.g. 1 Nos"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* INSPECTION TABLE (EXACT 5 COLUMNS FROM USER PHOTO) - FULL WIDTH */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-black text-slate-900 uppercase text-xs tracking-wider flex items-center gap-1.5">
                      <span>Inspection Parameters &amp; Test Matrix</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        (As per Doc no.: F - QAS - 02)
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Standard shopfloor testing stages. You can edit actual findings, testing methods, and add custom stages.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomRow}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer w-fit"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Custom Inspection Stage</span>
                  </button>
                </div>

                <div className="border border-slate-300 rounded-2xl overflow-x-auto shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 font-black text-slate-900 uppercase text-[11px]">
                        <th className="p-3 w-32 border-r border-slate-300">Process</th>
                        <th className="p-3 min-w-[180px] border-r border-slate-300">
                          In process Parameters
                        </th>
                        <th className="p-3 min-w-[200px] border-r border-slate-300">
                          Testing Method
                        </th>
                        <th className="p-3 min-w-[260px] border-r border-slate-300">
                          Requirements (Drawing / Spec)
                        </th>
                        <th className="p-3 w-40 border-r border-slate-300">Actual Result</th>
                        <th className="p-3 min-w-[140px] border-r border-slate-300">Remarks</th>
                        <th className="p-3 w-12 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {formInspectionRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/20">
                          {/* 1. Process */}
                          <td className="p-2.5 border-r border-slate-300 align-top">
                            <input
                              type="text"
                              value={row.processName}
                              onChange={(e) =>
                                handleUpdateInspectionRow(idx, 'processName', e.target.value)
                              }
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 text-xs focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>

                          {/* 2. In Process Parameters */}
                          <td className="p-2.5 border-r border-slate-300 align-top">
                            <input
                              type="text"
                              value={row.parameters}
                              onChange={(e) =>
                                handleUpdateInspectionRow(idx, 'parameters', e.target.value)
                              }
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>

                          {/* 3. Testing Method */}
                          <td className="p-2.5 border-r border-slate-300 align-top">
                            <input
                              type="text"
                              value={row.testingMethod}
                              onChange={(e) =>
                                handleUpdateInspectionRow(idx, 'testingMethod', e.target.value)
                              }
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>

                          {/* 4. Requirements */}
                          <td className="p-2.5 border-r border-slate-300 align-top">
                            <textarea
                              rows={2}
                              value={row.requirements}
                              onChange={(e) =>
                                handleUpdateInspectionRow(idx, 'requirements', e.target.value)
                              }
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>

                          {/* 5. Actual */}
                          <td className="p-2.5 border-r border-slate-300 align-top">
                            <select
                              value={row.actual}
                              onChange={(e) =>
                                handleUpdateInspectionRow(idx, 'actual', e.target.value)
                              }
                              className={`w-full p-1.5 font-bold rounded-lg border text-xs focus:ring-1 focus:ring-emerald-500 ${
                                row.actual === 'OK'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-white text-slate-800 border-slate-200'
                              }`}
                            >
                              <option value="OK">OK</option>
                              <option value="No Req">No Req</option>
                              <option value="No Req But MS Plates Primer Paint">
                                Primer Paint OK
                              </option>
                              <option value="Deviation Approved">Deviation</option>
                              <option value="Not OK">Not OK</option>
                            </select>
                          </td>

                          {/* 6. Remarks */}
                          <td className="p-2.5 border-r border-slate-300 align-top">
                            <input
                              type="text"
                              value={row.remarks || ''}
                              onChange={(e) =>
                                handleUpdateInspectionRow(idx, 'remarks', e.target.value)
                              }
                              placeholder="Notes"
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>

                          {/* 7. Action */}
                          <td className="p-2.5 text-center align-top">
                            {formInspectionRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                                title="Remove row"
                              >
                                <Trash2 className="w-4 h-4 mx-auto" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FOOTER SIGN-OFF: INSPECTION BY, STATUS & REMARKS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Inspection By (Inspector Signature): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formInspectionBy}
                    onChange={(e) => setFormInspectionBy(e.target.value)}
                    placeholder="e.g. Rohit (QC Inspector)"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Final Quality Clearance Status:
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Passed">Approved &amp; Cleared for Dispatch</option>
                    <option value="Pending">Pending Inspection / Clearance</option>
                    <option value="Failed">Rejected / Rework Required</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Overall QC Remarks:
                  </label>
                  <input
                    type="text"
                    value={formRemarks}
                    onChange={(e) => setFormRemarks(e.target.value)}
                    placeholder="e.g. Normal water test passed. Ready for dispatch."
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* ACTION BUTTONS (BOTTOM) */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCancelCreate}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer text-xs"
                >
                  Cancel &amp; Return to List
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95 text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Inspection Report (F - QAS - 02)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 2: LIST VIEW (COMPLETION & QC CLEARANCE TABLE)                      */
        /* ========================================================================= */
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* HEADER & ACTIONS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div>
              <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-0.5">
                DASHBOARD / PRODUCTION &amp; SHOP FLOOR / COMPLETION &amp; QC CLEARANCE
              </div>
              <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <span>In Process Cum Final Inspection &amp; QC Clearance</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 font-mono">
                  Doc no.: F - QAS - 02
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Quality Assurance standard inspection reports (Cutting, Bending, Tacking, Welding, Grinding, Blasting, Painting). Certified before dispatch.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenCreateFullPage}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ New QC Inspection Entry</span>
              </button>
              <Link
                href="/production/dispatch"
                className="px-3.5 py-2 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
              >
                <Truck className="w-3.5 h-3.5 text-amber-700" />
                <span>Delivery Challans</span>
              </Link>
              <Link
                href="/production/planning"
                className="px-3.5 py-2 bg-white border border-[#EBE3DB] hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
              >
                <Factory className="w-3.5 h-3.5 text-amber-600" />
                <span>Production Planning</span>
              </Link>
            </div>
          </div>

          {/* KPI METRIC CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Total QC Reports</span>
                <FileText className="w-4 h-4 text-slate-600" />
              </div>
              <div className="text-2xl font-black text-[#211B17]">{completions.length}</div>
              <div className="text-[11px] text-slate-500">Inspection Reports Logged</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-[11px] font-semibold uppercase tracking-wider">QC Passed / Cleared</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700">
                {completions.filter((c) => c.qcStatus === 'Passed').length}
              </div>
              <div className="text-[11px] text-slate-500">Cleared for Dispatch</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-amber-600">
                <span className="text-[11px] font-semibold uppercase tracking-wider">QC Standard Form</span>
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-mono font-black text-[#211B17]">F - QAS - 02</div>
              <div className="text-[11px] text-slate-500">UMA TECHNO FAB Standard</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-blue-600">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Inspection Stages</span>
                <Layers className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-700">9 Stages</div>
              <div className="text-[11px] text-slate-500">Cutting to Primer Paint</div>
            </div>
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by QC #, Job #, Customer, Equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-[#211B17]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Status:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-[#211B17]"
              >
                <option value="all">All Statuses ({completions.length})</option>
                <option value="Passed">Passed / Cleared</option>
                <option value="Pending">Pending Inspection</option>
                <option value="Failed">Rejected / Rework</option>
              </select>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4 min-w-[130px]">Certificate No</th>
                    <th className="py-3 px-4 min-w-[140px]">Work Order / Job</th>
                    <th className="py-3 px-4 min-w-[200px]">Customer &amp; Equipment</th>
                    <th className="py-3 px-4 min-w-[90px]">Qty</th>
                    <th className="py-3 px-4 min-w-[110px]">Date</th>
                    <th className="py-3 px-4 min-w-[150px]">Inspector</th>
                    <th className="py-3 px-4 min-w-[100px]">QC Status</th>
                    <th className="py-3 px-4 w-44 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCompletions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600 text-sm">No QC inspection reports found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Click "+ New QC Inspection Entry" to log a standard inspection sheet (F - QAS - 02).
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCompletions.map((row) => (
                      <tr key={row.id} className="hover:bg-amber-50/30 transition group">
                        {/* Certificate / Completion No */}
                        <td className="py-3 px-4 font-mono">
                          <span className="font-bold text-emerald-800 block text-xs">
                            {row.completionNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Doc: {row.docNo || 'F - QAS - 02'}
                          </span>
                        </td>

                        {/* Work order / Job */}
                        <td className="py-3 px-4 font-mono font-bold text-purple-700">
                          {row.workOrderNumber || row.jobNumber}
                        </td>

                        {/* Customer & Equipment */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block truncate max-w-[220px]">
                            {row.customerName}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate max-w-[220px]">
                            {row.productName}
                          </span>
                        </td>

                        {/* Qty */}
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {row.completedQuantity} Nos
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {formatDate(row.completionDate)}
                        </td>

                        {/* Inspector */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 block truncate max-w-[140px]">
                            {row.inspectionBy || row.completedBy}
                          </span>
                        </td>

                        {/* QC Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold inline-flex items-center gap-1 border ${
                              row.qcStatus === 'Passed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : row.qcStatus === 'Pending'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            {row.qcStatus === 'Passed' ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Passed</span>
                              </>
                            ) : row.qcStatus === 'Pending' ? (
                              <span>Pending</span>
                            ) : (
                              <span>Rejected</span>
                            )}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewingReport(row)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                              title="View & Print Certificate"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View / Print</span>
                            </button>
                            {row.qcStatus === 'Passed' && (
                              <Link
                                href={`/production/dispatch?fromQC=${encodeURIComponent(row.completionNumber)}&customer=${encodeURIComponent(row.customerName || '')}&item=${encodeURIComponent(row.productName || '')}&qty=${row.completedQuantity || 1}&job=${encodeURIComponent(row.jobNumber || '')}`}
                                className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                                title="Issue Delivery Challan for this cleared item"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Dispatch</span>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <div>
                Showing <strong>{filteredCompletions.length}</strong> of <strong>{completions.length}</strong> QC inspection reports
              </div>
              <div className="text-[11px] text-slate-400">
                Official Document standard: <strong>F - QAS - 02</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VIEW & PRINT INSPECTION REPORT (EXACT REPLICA OF PHYSICAL SHEET)  */}
      {/* ========================================================================= */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-black w-full max-w-4xl overflow-hidden my-4 print:m-0 print:border-none print:shadow-none">
            {/* Action Bar (Hidden in Print) */}
            <div className="bg-[#211B17] text-white p-3.5 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs">Official Inspection Certificate Preview</span>
              </div>

              <div className="flex items-center gap-2">
                {viewingReport.qcStatus === 'Passed' && (
                  <Link
                    href={`/production/dispatch?fromQC=${encodeURIComponent(viewingReport.completionNumber)}&customer=${encodeURIComponent(viewingReport.customerName || '')}&item=${encodeURIComponent(viewingReport.productName || '')}&qty=${viewingReport.completedQuantity || 1}&job=${encodeURIComponent(viewingReport.jobNumber || '')}`}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Issue Delivery Challan</span>
                  </Link>
                )}
                <button
                  onClick={() => printContent('printable-qc-certificate', { title: viewingReport ? `QC_${viewingReport.completionNumber}` : 'QC_Certificate' })}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setViewingReport(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE REPORT DOCUMENT BODY (EXACT LAYOUT OF USER'S ATTACHED IMAGE) */}
            <div id="printable-qc-certificate" className="p-8 text-black font-sans space-y-4 print:p-0 bg-white">
              {/* Report Header Table */}
              <div className="border-2 border-black">
                <div className="grid grid-cols-4 border-b-2 border-black text-center items-center py-2">
                  {/* Logo Column */}
                  <div className="p-2 border-r-2 border-black flex items-center justify-center">
                    <div className="text-xl font-black tracking-tighter text-slate-900 font-serif">
                      UMA
                    </div>
                  </div>

                  {/* Company & Document Title Column */}
                  <div className="col-span-2 p-2 border-r-2 border-black">
                    <h2 className="text-sm font-black uppercase tracking-wider font-mono">
                      UMA TECHNO FAB
                    </h2>
                    <h3 className="text-xs font-serif italic font-bold">
                      In process cum final inspection report
                    </h3>
                  </div>

                  {/* Doc No Column */}
                  <div className="p-2 text-right pr-4 font-mono">
                    <div className="text-[10px] text-slate-600">Doc no.:</div>
                    <div className="text-sm font-black">F - QAS - 02</div>
                  </div>
                </div>

                {/* Metadata Fields Grid */}
                <div className="grid grid-cols-2 text-xs border-b border-black">
                  <div className="p-2 border-r border-black flex items-center justify-between">
                    <span className="font-bold">Customer Name:</span>
                    <span className="font-serif italic font-bold text-sm">
                      {viewingReport.customerName}
                    </span>
                  </div>
                  <div className="p-2 flex items-center justify-between">
                    <span className="font-bold">Work order No.:</span>
                    <span className="font-mono font-bold text-sm">
                      {viewingReport.workOrderNumber || viewingReport.jobNumber}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 text-xs">
                  <div className="p-2 border-r border-black flex items-center justify-between">
                    <span className="font-bold">Item:</span>
                    <span className="font-bold">{viewingReport.productName}</span>
                  </div>
                  <div className="p-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span>Qty: <strong>{viewingReport.completedQuantity} Nos</strong></span>
                    </div>
                    <div>
                      <span>Date: <strong>{formatDate(viewingReport.completionDate)}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* In Process Inspection Table */}
              <div className="border-2 border-black overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-black font-black uppercase text-[11px] bg-slate-100 print:bg-transparent">
                      <th className="p-2 border-r-2 border-black w-24">Process</th>
                      <th className="p-2 border-r-2 border-black w-40">In process Parameters</th>
                      <th className="p-2 border-r-2 border-black w-44">Testing Method</th>
                      <th className="p-2 border-r-2 border-black">Requirements</th>
                      <th className="p-2 border-r-2 border-black w-24 text-center">Actual</th>
                      <th className="p-2 w-24">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {(viewingReport.inspectionRows && viewingReport.inspectionRows.length > 0
                      ? viewingReport.inspectionRows
                      : DEFAULT_INSPECTION_ROWS
                    ).map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-black">
                        <td className="p-2 border-r-2 border-black font-bold align-top">
                          {row.processName}
                        </td>
                        <td className="p-2 border-r-2 border-black align-top">
                          {row.parameters}
                        </td>
                        <td className="p-2 border-r-2 border-black align-top font-sans">
                          {row.testingMethod}
                        </td>
                        <td className="p-2 border-r-2 border-black align-top font-mono text-[11px]">
                          {row.requirements}
                        </td>
                        <td className="p-2 border-r-2 border-black align-top font-bold text-center">
                          {row.actual}
                        </td>
                        <td className="p-2 align-top text-[11px] italic">
                          {row.remarks || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Inspection Footer & Sign-off Block */}
              <div className="border-2 border-black p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold block">Inspection By :-</span>
                  <div className="font-serif italic font-bold text-base mt-2 underline">
                    {viewingReport.inspectionBy || viewingReport.completedBy}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Date: {formatDate(viewingReport.completionDate)}
                  </div>
                </div>

                {/* Official Stamp */}
                <div className="border-2 border-emerald-700 text-emerald-800 p-2 rounded-lg text-center font-mono font-black text-xs">
                  <div>UMA TECHNO FAB</div>
                  <div className="text-sm">QC APPROVED</div>
                  <div className="text-[9px]">CLEARED FOR DISPATCH</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductionCompletionPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 animate-spin" />
          <span>Loading QC Clearance &amp; Inspection Reports...</span>
        </div>
      }
    >
      <ProductionCompletionContent />
    </Suspense>
  );
}
