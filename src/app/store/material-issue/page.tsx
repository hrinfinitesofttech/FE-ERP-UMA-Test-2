'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import {
  Truck,
  Plus,
  Search,
  Cpu,
  FileText,
  CheckCircle,
  Eye,
  Building2,
  Package,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Printer,
  X,
  Loader2,
  Trash2,
  Sparkles,
} from 'lucide-react';

export interface IssueLineItem {
  lineId: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  uom: string;
  bomReqQty: number;
  issueQty: number;
  unitPrice: number;
  batchLot: string;
}

function MaterialIssueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobParam = searchParams.get('jobId') || '';
  const bomParam = searchParams.get('bomId') || '';
  const itemParam = searchParams.get('itemId') || '';

  const {
    materialIssues,
    addMaterialIssue,
    projectJobs,
    itemMasters,
    warehouses,
    stockBalances,
    boms,
    purchaseRequisitions,
    openJobModal,
  } = useERP();

  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJob, setFilterJob] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasDismissedParam, setHasDismissedParam] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewVoucher, setViewVoucher] = useState<any | null>(null);

  // Form State
  const [jobId, setJobId] = useState(projectJobs[0]?.jobNumber || projectJobs[0]?.id || '');
  const [woNo, setWoNo] = useState('');
  const [bomNo, setBomNo] = useState('');
  const [bomRev, setBomRev] = useState('Rev-01');
  const [stage, setStage] = useState('Shell & Dish End Cutting / Rolling');
  const [issueLines, setIssueLines] = useState<IssueLineItem[]>([]);
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [requestedBy, setRequestedBy] = useState('');
  const [issuedBy, setIssuedBy] = useState('');
  const [batchLot, setBatchLot] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showAllCatalog, setShowAllCatalog] = useState(false);

  // Find all BOMs belonging to current Job / Project
  const availableJobBoms = useMemo(() => {
    if (!boms || boms.length === 0 || !jobId) return [];
    const cleanJob = String(jobId || '').trim().toLowerCase();
    const matchedJob = projectJobs.find(
      (j) => j.jobNumber?.toLowerCase() === cleanJob || j.id?.toLowerCase() === cleanJob
    );
    const pjProj = String(matchedJob?.id || (matchedJob as any)?.projectId || '').trim().toLowerCase();

    return boms.filter((b) => {
      const bJob = String(b.jobNumber || (b as any).job_number || '').trim().toLowerCase();
      const bProj = String(b.projectId || (b as any).project_id || '').trim().toLowerCase();
      const bId = String(b.id || '').trim().toLowerCase();

      return (
        (bJob && (bJob === cleanJob || bJob.includes(cleanJob))) ||
        (bProj && (bProj === cleanJob || (pjProj && bProj === pjProj))) ||
        bId === cleanJob
      );
    });
  }, [boms, jobId, projectJobs]);

  // Find currently active BOM
  const currentJobBom = useMemo(() => {
    if (!boms || boms.length === 0) return null;
    const cleanBom = String(bomNo || '').trim().toLowerCase();
    if (cleanBom) {
      const found = boms.find((b) => {
        const bBom = String(b.bomNumber || (b as any).bom_number || '').trim().toLowerCase();
        const bId = String(b.id || '').trim().toLowerCase();
        return bBom === cleanBom || bId === cleanBom;
      });
      if (found) return found;
    }
    return availableJobBoms[0] || null;
  }, [boms, bomNo, availableJobBoms]);

  // Find PRs matching current job
  const jobPRs = useMemo(() => {
    if (!purchaseRequisitions || purchaseRequisitions.length === 0 || !jobId) return [];
    const cleanJob = String(jobId || '').trim().toLowerCase();
    return purchaseRequisitions.filter((pr) => {
      const prJob = String(pr.jobNumber || pr.jobId || '').trim().toLowerCase();
      return prJob === cleanJob;
    });
  }, [purchaseRequisitions, jobId]);

  // Compute items allocated to this Job / BOM
  const jobAllocatedItems = useMemo(() => {
    if (showAllCatalog) return itemMasters;

    const bomItems = currentJobBom?.items || [];
    const prItems = jobPRs.flatMap((pr) => pr.items || []);

    if (!jobId || (bomItems.length === 0 && prItems.length === 0)) {
      return itemMasters;
    }

    const targetCodes = new Set<string>();
    const targetNames = new Set<string>();

    bomItems.forEach((bi: any) => {
      const code = String(bi.partNumber || bi.itemCode || bi.itemNumber || '').trim().toLowerCase();
      if (code) targetCodes.add(code);
      const name = String(bi.itemName || bi.partName || '').trim().toLowerCase();
      if (name) targetNames.add(name);
    });

    prItems.forEach((pi: any) => {
      const code = String(pi.itemCode || (pi as any).item_code || '').trim().toLowerCase();
      if (code) targetCodes.add(code);
      const name = String(pi.itemName || (pi as any).item_name || '').trim().toLowerCase();
      if (name) targetNames.add(name);
    });

    const matched: typeof itemMasters = [];
    const addedKeys = new Set<string>();

    // 1. Match from itemMasters
    itemMasters.forEach((im) => {
      const code = String(im.itemCode || '').trim().toLowerCase();
      const id = String(im.id || '').trim().toLowerCase();
      const name = String(im.itemName || '').trim().toLowerCase();

      const isMatch =
        targetCodes.has(code) ||
        targetCodes.has(id) ||
        targetNames.has(name) ||
        Array.from(targetNames).some((tn) => tn && (name.includes(tn) || tn.includes(name)));

      if (isMatch && !addedKeys.has(im.id)) {
        addedKeys.add(im.id);
        matched.push(im);
      }
    });

    // 2. If an item is declared in BOM but not yet in itemMasters, include dynamically
    bomItems.forEach((bi: any) => {
      const code = String(bi.partNumber || bi.itemCode || bi.itemNumber || '').trim();
      const name = String(bi.itemName || bi.partName || code).trim();
      const key = code || name;

      const alreadyAdded = matched.some(
        (m) =>
          (code && m.itemCode?.toLowerCase() === code.toLowerCase()) ||
          (name && m.itemName?.toLowerCase() === name.toLowerCase())
      );

      if (!alreadyAdded && key) {
        matched.push({
          id: bi.id || `bom-${code || key}`,
          itemCode: code || 'BOM-ITEM',
          itemName: name,
          itemType: bi.itemType || 'Raw Material',
          category: 'BOM Material',
          subCategory: '',
          description: bi.description || bi.specification || '',
          specification: bi.specification || '',
          drawingNumber: '',
          brandMake: bi.makeBrand || '',
          hsnSac: '7219',
          gstRate: 18.0,
          uom: bi.unit || 'KG',
          minimumStock: 0,
          maximumStock: 0,
          reorderLevel: 0,
          unitCost: bi.rate || bi.estimatedRate || bi.unitCost || 150,
          standardCost: bi.rate || bi.estimatedRate || bi.unitCost || 150,
          status: 'Active',
          createdAt: '',
          updatedAt: '',
        } as any);
      }
    });

    return matched.length > 0 ? matched : itemMasters;
  }, [showAllCatalog, currentJobBom, jobPRs, jobId, itemMasters]);

  useEffect(() => {
    setMounted(true);
    if (jobParam && !hasDismissedParam) {
      setJobId(jobParam);
      if (bomParam) {
        setBomNo(bomParam);
      } else {
        const matchingB = boms.find(
          (b) => b.jobNumber === jobParam || (b as any).job_number === jobParam || b.id === jobParam || b.projectId === jobParam
        );
        if (matchingB) {
          setBomNo(matchingB.bomNumber || (matchingB as any).bom_number || matchingB.id);
          if (matchingB.activeRevision || matchingB.revision) {
            setBomRev(matchingB.activeRevision || matchingB.revision);
          }
        }
      }
      setWoNo(`WO-${jobParam.replace('JOB-', '')}-A`);
      setIsModalOpen(true);
    }
  }, [jobParam, bomParam, boms, hasDismissedParam]);

  // Auto-sync BOM number and revision when job or availableJobBoms change
  useEffect(() => {
    if (availableJobBoms.length > 0) {
      const exists = availableJobBoms.some(
        (b) => (b.bomNumber && b.bomNumber === bomNo) || ((b as any).bom_number && (b as any).bom_number === bomNo) || b.id === bomNo
      );
      if (!exists) {
        const first = availableJobBoms[0];
        const newNo = first.bomNumber || (first as any).bom_number || first.id;
        setBomNo(newNo);
        if (first.activeRevision || first.revision) {
          setBomRev(first.activeRevision || first.revision);
        }
      }
    } else if (jobId && !bomNo) {
      setBomNo(`BOM-${jobId.replace('JOB-', '')}`);
    }
  }, [availableJobBoms, jobId, bomNo]);

  // Helper to convert an item into an IssueLineItem
  const makeLineFromItem = (item: any, customLot = ''): IssueLineItem => {
    const bomMatch = currentJobBom?.items?.find((bi: any) =>
      (bi.partNumber && (bi.partNumber === item.itemCode || bi.partNumber === item.id)) ||
      (bi.itemCode && (bi.itemCode === item.itemCode || bi.itemCode === item.id)) ||
      (bi.itemName && item.itemName && bi.itemName.trim().toLowerCase() === item.itemName.trim().toLowerCase())
    );
    const reqQty = Number(bomMatch?.quantity || bomMatch?.qty || 1);
    const rate = Number(item.standardCost || (item as any).unitPrice || item.defaultPurchaseRate || 150);

    return {
      lineId: `line-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      itemId: item.id,
      itemCode: item.itemCode || 'ITEM',
      itemName: item.itemName || 'Material Item',
      uom: item.uom || 'KG',
      bomReqQty: reqQty,
      issueQty: reqQty,
      unitPrice: rate,
      batchLot: customLot || batchLot || `HEAT-${Math.floor(10000 + Math.random() * 90000)}`,
    };
  };

  // Keep issueLines initialized with jobAllocatedItems
  useEffect(() => {
    if (jobAllocatedItems.length > 0) {
      setIssueLines((prev) => {
        if (prev.length === 0) {
          return [makeLineFromItem(jobAllocatedItems[0])];
        }
        const hasValid = prev.some((l) =>
          jobAllocatedItems.some((a) => a.id === l.itemId || a.itemCode === l.itemCode)
        );
        if (!hasValid) {
          return [makeLineFromItem(jobAllocatedItems[0])];
        }
        return prev;
      });
    }
  }, [jobAllocatedItems, currentJobBom]);

  const handleAddLine = () => {
    if (jobAllocatedItems.length === 0) return;
    const unadded = jobAllocatedItems.find(
      (a) => !issueLines.some((l) => l.itemId === a.id || l.itemCode === a.itemCode)
    );
    const itemToAdd = unadded || jobAllocatedItems[0];
    setIssueLines((prev) => [...prev, makeLineFromItem(itemToAdd)]);
  };

  const handleLoadAllBomItems = () => {
    if (jobAllocatedItems.length === 0) return;
    setIssueLines(jobAllocatedItems.map((itm) => makeLineFromItem(itm)));
  };

  const handleRemoveLine = (lineId: string) => {
    if (issueLines.length <= 1) return;
    setIssueLines((prev) => prev.filter((l) => l.lineId !== lineId));
  };

  const handleLineItemChange = (lineId: string, newItemId: string) => {
    const item =
      jobAllocatedItems.find((i) => i.id === newItemId || i.itemCode === newItemId) ||
      itemMasters.find((i) => i.id === newItemId || i.itemCode === newItemId);
    if (!item) return;

    const bomMatch = currentJobBom?.items?.find((bi: any) =>
      (bi.partNumber && (bi.partNumber === item.itemCode || bi.partNumber === item.id)) ||
      (bi.itemCode && (bi.itemCode === item.itemCode || bi.itemCode === item.id)) ||
      (bi.itemName && item.itemName && bi.itemName.trim().toLowerCase() === item.itemName.trim().toLowerCase())
    );
    const reqQty = Number(bomMatch?.quantity || bomMatch?.qty || 1);
    const rate = Number(item.standardCost || (item as any).unitPrice || item.defaultPurchaseRate || 150);

    setIssueLines((prev) =>
      prev.map((l) =>
        l.lineId === lineId
          ? {
              ...l,
              itemId: item.id,
              itemCode: item.itemCode || 'ITEM',
              itemName: item.itemName || 'Material Item',
              uom: item.uom || 'KG',
              bomReqQty: reqQty,
              issueQty: reqQty,
              unitPrice: rate,
            }
          : l
      )
    );
  };

  const handleLineQtyChange = (lineId: string, qty: number) => {
    setIssueLines((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, issueQty: Math.max(0, qty) } : l))
    );
  };

  const handleLineLotChange = (lineId: string, lot: string) => {
    setIssueLines((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, batchLot: lot } : l))
    );
  };

  const getItemUsableStock = (itemIdOrCode: string) => {
    const stock = stockBalances.find(
      (s) => s.itemId === itemIdOrCode || s.itemCode?.toLowerCase() === itemIdOrCode?.toLowerCase()
    );
    return stock?.usableQty ?? stock?.availableQty ?? 0;
  };

  const selectedWh = warehouses.find((w) => w.id === warehouseId) || warehouses[0] || null;
  const selectedJob = projectJobs.find((j) => j.jobNumber === jobId || j.id === jobId) || projectJobs[0] || null;

  // Auto-populate work order and BOM when job changes
  const handleJobChange = (newJobCode: string) => {
    setJobId(newJobCode);
    const job = projectJobs.find((j) => j.jobNumber === newJobCode || j.id === newJobCode);
    if (job) {
      setWoNo(`WO-${job.jobNumber.replace('JOB-', '')}-A`);
      const matchedB = boms.find(
        (b) =>
          b.jobNumber === job.jobNumber ||
          (b as any).job_number === job.jobNumber ||
          b.projectId === job.id ||
          b.projectId === (job as any).projectId
      );
      if (matchedB) {
        setBomNo(matchedB.bomNumber || (matchedB as any).bom_number || `BOM-${job.jobNumber.replace('JOB-', '')}`);
        if (matchedB.activeRevision || matchedB.revision) {
          setBomRev(matchedB.activeRevision || matchedB.revision);
        }
      } else {
        setBomNo(`BOM-${job.jobNumber.replace('JOB-', '')}`);
      }
    }
  };

  const handleBomChange = (selectedBomNo: string) => {
    setBomNo(selectedBomNo);
    const targetBom = boms.find(
      (b) => b.bomNumber === selectedBomNo || (b as any).bom_number === selectedBomNo || b.id === selectedBomNo
    );
    if (targetBom) {
      if (targetBom.activeRevision || targetBom.revision) {
        setBomRev(targetBom.activeRevision || targetBom.revision);
      }
    }
  };

  const totalIssueSlipQty = issueLines.reduce((sum, l) => sum + (Number(l.issueQty) || 0), 0);
  const totalIssueSlipValue = issueLines.reduce((sum, l) => sum + (Number(l.issueQty) || 0) * (l.unitPrice || 150), 0);

  const filtered = materialIssues.filter((i) => {
    const matchesSearch =
      !searchTerm?.trim() ||
      i.issueNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      i.jobId?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      i.requestedBy?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      (i as any).customerName?.toLowerCase().includes(searchTerm?.toLowerCase());

    const matchesJob = filterJob === 'ALL' || i.jobId === filterJob;
    return matchesSearch && matchesJob;
  });

  // Calculate Metrics
  const totalIssuesCount = materialIssues.length;
  const totalIssueValue = materialIssues.reduce((sum, item) => sum + Number(item.totalIssueValue || (item as any).total_issue_value || 0), 0);
  const activeJobsSet = new Set(materialIssues.map((i) => i.jobId).filter(Boolean));
  const uniqueJobsCount = activeJobsSet.size;

  const closeModal = () => {
    setHasDismissedParam(true);
    setIsModalOpen(false);
    if (jobParam || bomParam || itemParam) {
      router.replace('/store/material-issue');
    }
  };

  const openNewModal = () => {
    setHasDismissedParam(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (issueLines.length === 0 || !selectedWh) return;

    const validLines = issueLines.filter((l) => Number(l.issueQty) > 0);
    if (validLines.length === 0) {
      alert('Please enter an issue quantity greater than 0 for at least one item.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addMaterialIssue({
        issueDate: new Date().toISOString().split('T')[0],
        projectId: selectedJob?.id || 'PRJ-2026-0001',
        jobId: selectedJob?.jobNumber || jobId,
        workOrderNumber: woNo,
        bomNumber: bomNo,
        bomRevision: bomRev,
        productionStage: stage,
        requestedBy,
        issuedBy,
        warehouseId: selectedWh.id,
        warehouseName: selectedWh.warehouseName,
        status: 'Fully Issued',
        totalIssueValue: totalIssueSlipValue,
        remarks,
        items: validLines.map((line) => ({
          id: `iss-item-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6)}`,
          issueId: '',
          itemId: line.itemId,
          itemCode: line.itemCode,
          itemName: line.itemName,
          requiredQuantity: line.bomReqQty || line.issueQty,
          reservedQuantity: line.issueQty,
          issuedQuantity: line.issueQty,
          uom: line.uom,
          unitPrice: line.unitPrice,
          totalCost: line.issueQty * line.unitPrice,
          batchLot: line.batchLot || batchLot || `HEAT-${Math.floor(10000 + Math.random() * 90000)}`,
          locationCode: selectedWh.warehouseCode || 'STORE-BAY-01',
          remarks: remarks || `Issued for ${stage}`,
        })),
      });

      setSuccessMessage(`Material issue slip successfully created & stock deducted for ${validLines.length} item(s) on Job ${selectedJob?.jobNumber || jobId}!`);
      setHasDismissedParam(true);
      setIsModalOpen(false);
      router.replace('/store/material-issue');

      setTimeout(() => {
        setSuccessMessage(null);
      }, 6000);
    } catch (err: any) {
      console.error('Error creating material issue:', err);
      alert(`Error creating material issue: ${err.message || 'Please check input data'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="p-6 bg-[#FAF7F2] min-h-screen text-[#544B45] flex items-center justify-center">
        <div className="text-xs font-mono text-[#70665F]">Loading Material Issues...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45]" suppressHydrationWarning>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-xs font-mono font-semibold">
              STORE DISPATCH & LOGISTICS
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Material Issue to Production</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Store issue slips reducing inventory balances upon issuing raw materials & components to production shop floors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openNewModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Issue Material Slip
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-xs font-medium animate-in fade-in duration-200 shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 p-1 rounded-lg hover:bg-emerald-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70665F]">Total Slips Issued</div>
            <div className="text-2xl font-black text-[#211B17] mt-1 font-mono">{totalIssuesCount}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Verified & Dispatched</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70665F]">Total Issued Value</div>
            <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
              ₹{totalIssueValue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#70665F] mt-0.5">Raw materials & parts</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70665F]">Active Jobs Linked</div>
            <div className="text-2xl font-black text-amber-600 mt-1 font-mono">{uniqueJobsCount}</div>
            <div className="text-[11px] text-[#70665F] mt-0.5">Shop floor execution</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#70665F]">Inventory Status</div>
            <div className="text-2xl font-black text-sky-600 mt-1 font-mono">Real-time</div>
            <div className="text-[11px] text-sky-600 font-medium mt-0.5">Auto Stock Deductions</div>
          </div>
          <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
            <input
              type="text"
              placeholder="Search issue slip no, job no, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] placeholder-[#70665F] focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={filterJob}
            onChange={(e) => setFilterJob(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none focus:border-emerald-500 font-mono"
          >
            <option value="ALL">All Jobs</option>
            {projectJobs.map((j) => (
              <option key={`filter-job-${j.id}`} value={j.jobNumber}>
                {j.jobNumber} {j.customerName ? `(${j.customerName})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-[#70665F] font-mono">
          Showing <span className="text-[#211B17] font-bold">{filtered.length}</span> of{' '}
          <span className="text-[#211B17] font-bold">{materialIssues.length}</span> Slips
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-mono text-[11px] uppercase tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">Issue Slip No & Date</th>
                <th className="p-3.5">Job No & Customer</th>
                <th className="p-3.5">BOM & Production Stage</th>
                <th className="p-3.5">Issued Material Items</th>
                <th className="p-3.5">Requested By</th>
                <th className="p-3.5 text-right">Issued Value (₹)</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#70665F]">
                    No material issues found matching current filters. Click &quot;Issue Material Slip&quot; to issue raw materials.
                  </td>
                </tr>
              ) : (
                filtered.map((i, idx) => {
                  const issNo = i.issueNumber || (i as any).issue_number || i.id;
                  const issDate = i.issueDate || (i as any).issue_date || new Date().toISOString().split('T')[0];
                  const jobCode = i.jobId || (i as any).job_number || (i as any).jobNumber || '—';
                  const matchedJob = projectJobs.find((j) => j.jobNumber === jobCode || j.id === jobCode);
                  const custName = (i as any).customerName || matchedJob?.customerName || '—';
                  const woCode = i.workOrderNumber || (i as any).work_order_number || '—';
                  const bomCode = i.bomNumber || (i as any).bom_number || '—';
                  const bomRevVal = i.bomRevision || (i as any).bom_revision || '—';
                  const prodStage = i.productionStage || (i as any).production_stage || 'Shell & Dish End Cutting / Rolling';
                  const reqBy = i.requestedBy || (i as any).requested_by || (i as any).issued_to || '—';
                  const issVal = Number(i.totalIssueValue ?? (i as any).total_issue_value ?? 0);
                  const issStatus = i.status || 'Fully Issued';
                  const itemsCount = Array.isArray(i.items) ? i.items.length : 1;
                  const firstItem = Array.isArray(i.items) && i.items[0] ? i.items[0] : null;

                  return (
                    <tr key={`${i.id || 'iss'}-${idx}`} className="hover:bg-[#FAF7F2]/60 transition">
                      <td className="p-3.5 font-medium">
                        <div className="font-bold text-emerald-700 text-xs font-mono">{issNo}</div>
                        <div className="text-[10px] text-[#70665F] mt-0.5">{issDate}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-amber-700 text-xs flex items-center gap-1 font-mono">
                          <Cpu className="w-3.5 h-3.5 text-amber-500" />
                          {jobCode}
                        </div>
                        <div className="text-[11px] font-semibold text-[#211B17] mt-0.5">{custName}</div>
                        <div className="text-[10px] text-[#70665F]">WO: {woCode}</div>
                      </td>
                      <td className="p-3.5 text-[#544B45]">
                        <div className="font-semibold text-[#211B17]">
                          {bomCode} ({bomRevVal})
                        </div>
                        <div className="text-[10px] text-[#70665F] mt-0.5">{prodStage}</div>
                      </td>
                      <td className="p-3.5">
                        {firstItem ? (
                          <div>
                            <div className="font-bold text-[#211B17]">{firstItem.itemName}</div>
                            <div className="text-[10px] text-[#70665F] font-mono">
                              Qty: {firstItem.issuedQuantity || firstItem.requiredQuantity} {firstItem.uom} | Lot: {firstItem.batchLot || 'HEAT-98421'}
                            </div>
                            {itemsCount > 1 && (
                              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                                + {itemsCount - 1} more items
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#70665F]">{itemsCount} Items</span>
                        )}
                      </td>
                      <td className="p-3.5 font-medium text-[#211B17]">{reqBy}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                        ₹{issVal.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                          {issStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewVoucher(i)}
                            className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-emerald-50 text-emerald-700 border border-[#EBE3DB] hover:border-emerald-300 text-[11px] font-bold transition flex items-center gap-1"
                            title="View Dispatch Slip"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Voucher
                          </button>
                          {openJobModal && (
                            <button
                              onClick={() => openJobModal(jobCode)}
                              className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-[11px] font-bold transition"
                              title="Trace Job 360°"
                            >
                              Trace
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Issue Material Slip */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  Issue Material Slip to Production
                </h2>
                <p className="text-[11px] text-[#70665F]">Deduct raw material from store stock and allocate directly to job work order.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Job & Work Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Target Job / Project *</label>
                  <select
                    value={jobId}
                    onChange={(e) => handleJobChange(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    {!projectJobs.some((j) => j.jobNumber === jobId || j.id === jobId) && (
                      <option value={jobId}>{jobId}</option>
                    )}
                    {projectJobs.map((j) => (
                      <option key={`modal-job-${j.id}`} value={j.jobNumber}>
                        {j.jobNumber} — {j.customerName ? `[${j.customerName}] ` : ''}{j.productName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Work Order Reference</label>
                  <input
                    type="text"
                    value={woNo}
                    onChange={(e) => setWoNo(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* BOM & Stage */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[#70665F] font-semibold">BOM Number *</label>
                    <span className="text-[10px] text-emerald-700 font-mono font-medium">
                      {availableJobBoms.length} BOM{availableJobBoms.length !== 1 ? 's' : ''} Linked
                    </span>
                  </div>
                  <select
                    value={bomNo}
                    onChange={(e) => handleBomChange(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500 font-mono font-medium"
                  >
                    {availableJobBoms.map((b) => {
                      const bCode = b.bomNumber || (b as any).bom_number || b.id;
                      const bRev = b.activeRevision || b.revision ? ` (${b.activeRevision || b.revision})` : '';
                      const bProd = b.productName ? ` — ${b.productName}` : '';
                      return (
                        <option key={`bom-sel-${b.id}`} value={bCode}>
                          {bCode}{bRev}{bProd}
                        </option>
                      );
                    })}
                    {availableJobBoms.length === 0 && (
                      <option value={bomNo || `BOM-${jobId.replace('JOB-', '')}`}>
                        {bomNo || `BOM-${jobId.replace('JOB-', '')}`} (Default BOM)
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">BOM Revision</label>
                  <input
                    type="text"
                    value={bomRev}
                    onChange={(e) => setBomRev(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Production Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Shell & Dish End Cutting / Rolling">Shell & Dish End Cutting / Rolling</option>
                    <option value="Nozzle & Flange Fitting">Nozzle & Flange Fitting</option>
                    <option value="Long Seam & Circ Seam Welding">Long Seam & Circ Seam Welding</option>
                    <option value="Internal Structure & Baffle Assembly">Internal Structure & Baffle Assembly</option>
                    <option value="Surface Preparation & Sand Blasting">Surface Preparation & Sand Blasting</option>
                    <option value="Final Hydro Test & Painting">Final Hydro Test & Painting</option>
                  </select>
                </div>
              </div>

              {/* Multi-Item Issue Table Section */}
              <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-3">
                {/* Header of Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#211B17] text-xs flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      Items to Issue ({issueLines.length} Item{issueLines.length !== 1 ? 's' : ''} in Slip)
                    </span>
                    {currentJobBom && !showAllCatalog && (
                      <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                        BOM: {currentJobBom.bomNumber || bomNo} ({jobAllocatedItems.length} Allocated)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {jobAllocatedItems.length > 1 && (
                      <button
                        type="button"
                        onClick={handleLoadAllBomItems}
                        className="text-xs text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 cursor-pointer"
                        title="Load all items from this BOM into the slip"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        + Load All BOM Items ({jobAllocatedItems.length})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowAllCatalog(!showAllCatalog)}
                      className="text-xs text-[#70665F] underline hover:text-[#211B17] font-semibold cursor-pointer"
                    >
                      {showAllCatalog ? 'Filter to Job BOM Only' : 'Show All Store Catalog'}
                    </button>
                  </div>
                </div>

                {/* Table of items */}
                <div className="border border-[#EBE3DB] rounded-xl overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F6F1EC] text-[#70665F] font-mono text-[10px] uppercase border-b border-[#EBE3DB]">
                      <tr>
                        <th className="p-2.5 pl-3">Item to Issue *</th>
                        <th className="p-2.5 text-center w-28">Store Stock</th>
                        <th className="p-2.5 text-center w-32">Issue Qty *</th>
                        <th className="p-2.5 w-36">Heat / Batch Lot</th>
                        <th className="p-2.5 text-right w-24">Est. Value (₹)</th>
                        <th className="p-2.5 pr-3 text-center w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE3DB]">
                      {issueLines.map((line) => {
                        const stockQty = getItemUsableStock(line.itemCode || line.itemId);
                        const isStockLow = stockQty < Number(line.issueQty);
                        const lineVal = (Number(line.issueQty) || 0) * (line.unitPrice || 150);

                        return (
                          <tr key={line.lineId} className="hover:bg-[#FAF7F2]/50 transition">
                            {/* Item Select */}
                            <td className="p-2 pl-3">
                              <select
                                value={line.itemId}
                                onChange={(e) => handleLineItemChange(line.lineId, e.target.value)}
                                className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-[#211B17] font-medium focus:outline-none focus:border-emerald-500 text-xs"
                              >
                                {!jobAllocatedItems.some((i) => i.id === line.itemId || i.itemCode === line.itemCode) && (
                                  <option value={line.itemId}>
                                    {line.itemCode} - {line.itemName} ({line.uom})
                                  </option>
                                )}
                                {jobAllocatedItems.map((itm) => {
                                  const bomMatch = currentJobBom?.items?.find((bi: any) =>
                                    (bi.partNumber && (bi.partNumber === itm.itemCode || bi.partNumber === itm.id)) ||
                                    (bi.itemCode && (bi.itemCode === itm.itemCode || bi.itemCode === itm.id)) ||
                                    (bi.itemName && itm.itemName && bi.itemName.trim().toLowerCase() === itm.itemName.trim().toLowerCase())
                                  );
                                  const reqText = bomMatch ? ` [BOM Req: ${bomMatch.quantity || bomMatch.qty} ${bomMatch.unit || itm.uom}]` : '';

                                  return (
                                    <option key={`row-${line.lineId}-itm-${itm.id}`} value={itm.id}>
                                      {itm.itemCode} - {itm.itemName} ({itm.uom}){reqText}
                                    </option>
                                  );
                                })}
                              </select>
                            </td>

                            {/* Stock in Store */}
                            <td className="p-2 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                  stockQty > 0
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {stockQty.toLocaleString('en-IN')} {line.uom}
                              </span>
                              {isStockLow && stockQty > 0 && (
                                <div className="text-[9px] text-amber-600 mt-0.5 font-medium">Exceeds stock</div>
                              )}
                            </td>

                            {/* Issue Qty */}
                            <td className="p-2">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0.01"
                                  step="any"
                                  value={line.issueQty}
                                  onChange={(e) => handleLineQtyChange(line.lineId, Number(e.target.value))}
                                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-emerald-700 font-bold font-mono text-right focus:outline-none focus:border-emerald-500 text-xs"
                                />
                                <span className="text-[10px] text-[#70665F] font-mono shrink-0">{line.uom}</span>
                              </div>
                            </td>

                            {/* Heat / Batch Lot */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={line.batchLot}
                                onChange={(e) => handleLineLotChange(line.lineId, e.target.value)}
                                placeholder="e.g. HEAT-98421"
                                className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-[#211B17] font-mono focus:outline-none focus:border-emerald-500 text-xs"
                              />
                            </td>

                            {/* Value */}
                            <td className="p-2 text-right font-mono font-bold text-[#211B17]">
                              ₹{lineVal.toLocaleString('en-IN')}
                            </td>

                            {/* Remove */}
                            <td className="p-2 pr-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveLine(line.lineId)}
                                disabled={issueLines.length <= 1}
                                className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-20 disabled:hover:bg-transparent transition cursor-pointer"
                                title={issueLines.length <= 1 ? 'Minimum 1 item required' : 'Remove item'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add Row Button & Grand Total summary */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Add Another Material Item
                  </button>

                  <div className="flex items-center gap-4 text-xs font-medium text-[#70665F]">
                    <div>
                      Items: <span className="font-bold text-[#211B17] font-mono">{issueLines.length}</span>
                    </div>
                    <div>
                      Total Qty: <span className="font-bold text-emerald-700 font-mono">{totalIssueSlipQty.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      Grand Total Value:{' '}
                      <span className="font-bold text-emerald-700 font-mono text-sm">
                        ₹{totalIssueSlipValue.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warehouse & Heat Lot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Dispatch From Warehouse</label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500"
                  >
                    {!warehouses.some((w) => w.id === warehouseId) && (
                      <option value={warehouseId}>
                        {selectedWh?.warehouseName || warehouseId}
                      </option>
                    )}
                    {warehouses.map((w) => (
                      <option key={`modal-wh-${w.id}`} value={w.id}>
                        {w.warehouseName} ({w.warehouseCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Heat / Batch Lot Number</label>
                  <input
                    type="text"
                    value={batchLot}
                    onChange={(e) => setBatchLot(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="e.g. HEAT-98421"
                  />
                </div>
              </div>

              {/* Requester & Store Issuer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Requested By</label>
                  <input
                    type="text"
                    value={requestedBy}
                    onChange={(e) => setRequestedBy(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Store Issuer</label>
                  <input
                    type="text"
                    value={issuedBy}
                    onChange={(e) => setIssuedBy(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Remarks / CAD Drawing Link</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] hover:bg-[#EBE3DB] text-xs font-semibold transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-lg shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving & Deducting Stock...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Confirm & Deduct Stock</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Issue Voucher */}
      {viewVoucher && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#EBE3DB] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 text-[10px] font-mono font-bold">
                    STORE DISPATCH VOUCHER
                  </span>
                  <h2 className="text-lg font-black text-[#211B17]">
                    {viewVoucher.issueNumber || viewVoucher.id}
                  </h2>
                </div>
                <p className="text-xs text-[#70665F] mt-0.5">
                  Issued on {viewVoucher.issueDate || '2026-10-04'} • Store to Production Transfer
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-emerald-50 text-[#544B45] hover:text-emerald-700 border border-[#EBE3DB] transition text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Print Slip
                </button>
                <button
                  onClick={() => setViewVoucher(null)}
                  className="p-2 rounded-xl text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2] transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Voucher Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB] text-xs">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#70665F]">Job Reference</div>
                <div className="font-bold text-amber-700 font-mono mt-0.5">{viewVoucher.jobId || '—'}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#70665F]">Work Order</div>
                <div className="font-semibold text-[#211B17] font-mono mt-0.5">
                  {viewVoucher.workOrderNumber || '—'}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#70665F]">BOM Details</div>
                <div className="font-semibold text-[#211B17] mt-0.5">
                  {viewVoucher.bomNumber || '—'} ({viewVoucher.bomRevision || 'Rev-01'})
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#70665F]">Production Stage</div>
                <div className="font-semibold text-[#211B17] mt-0.5">
                  {viewVoucher.productionStage || 'Shell & Dish End Cutting'}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-[#EBE3DB] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#70665F] font-mono text-[10px] uppercase border-b border-[#EBE3DB]">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3">Batch / Heat No</th>
                    <th className="p-3 text-right">Issued Qty</th>
                    <th className="p-3 text-right">Rate (₹)</th>
                    <th className="p-3 text-right">Total Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]">
                  {Array.isArray(viewVoucher.items) && viewVoucher.items.length > 0 ? (
                    viewVoucher.items.map((item: any, idx: number) => (
                      <tr key={`voucher-item-${idx}`}>
                        <td className="p-3">
                          <div className="font-bold text-[#211B17]">{item.itemName || item.itemCode}</div>
                          <div className="text-[10px] text-[#70665F] font-mono">{item.itemCode}</div>
                        </td>
                        <td className="p-3 font-mono font-semibold text-[#544B45]">
                          {item.batchLot || 'HEAT-98421'}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-700">
                          {item.issuedQuantity || item.requiredQuantity} {item.uom}
                        </td>
                        <td className="p-3 text-right font-mono text-[#70665F]">
                          ₹{(item.unitPrice || 150).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-[#211B17]">
                          ₹{(item.totalCost || (item.issuedQuantity || 1) * (item.unitPrice || 150)).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-[#70665F]">
                        Raw Material Dispatched: SS 316L Plates (3,200 Kg) - Value ₹3,200
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total and Sign-off */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-[#70665F]">Requested By:</span>{' '}
                  <span className="font-bold text-[#211B17]">{viewVoucher.requestedBy || 'Production Head'}</span>
                </div>
                <div>
                  <span className="text-[#70665F]">Store Issuer:</span>{' '}
                  <span className="font-bold text-[#211B17]">{viewVoucher.issuedBy || 'Store Incharge'}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] font-semibold text-[#70665F] uppercase">Grand Total Issue Value</div>
                <div className="text-xl font-black text-emerald-700 font-mono">
                  ₹{Number(viewVoucher.totalIssueValue || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewVoucher(null)}
                className="px-5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#211B17] text-xs font-semibold transition"
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

export default function MaterialIssuePage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-[#70665F]">Loading Material Issue...</div>}>
      <MaterialIssueContent />
    </React.Suspense>
  );
}
