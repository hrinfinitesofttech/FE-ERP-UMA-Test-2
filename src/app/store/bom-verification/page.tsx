'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { BOMHeader, BOMItem } from '../../../types/designer';
import { StockBalance } from '../../../types/store';
import { PurchaseRequisition, PRItem } from '../../../types/purchase';
import { formatCurrency } from '../../../lib/utils';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Send,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  Package,
  Layers,
  Box,
  Clock,
  Printer,
  FileCheck,
  RefreshCw,
  ShoppingCart,
  X,
  Plus,
  Truck,
  Check,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

interface VerifiedMaterialItem {
  id: string;
  itemNo: number;
  partNumber: string;
  itemName: string;
  description: string;
  specification: string;
  category: string;
  unit: string;
  requiredQty: number;
  availableStock: number;
  usableStock: number;
  shortageQty: number;
  estimatedRate: number;
  shortageValue: number;
  isAvailable: boolean;
  status: 'IN_STOCK' | 'SHORTAGE';
  warehouseName?: string;
  locationBin?: string;
  existingPrNumber?: string;
}

function BOMMaterialVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    boms,
    stockBalances,
    goodsReceipts,
    itemMasters,
    purchaseRequisitions,
    addPurchaseRequisition,
    projectJobs,
    currentUser,
  } = useERP();

  const [mounted, setMounted] = useState(false);
  const [selectedBomId, setSelectedBomId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_STOCK' | 'SHORTAGE'>('ALL');

  // PR Modal State
  const [showPRModal, setShowPRModal] = useState(false);
  const [selectedItemsForPR, setSelectedItemsForPR] = useState<VerifiedMaterialItem[]>([]);
  const [prPriority, setPrPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('High');
  const [prRequiredDate, setPrRequiredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [prRemarks, setPrRemarks] = useState('');

  // Notification Banner
  const [successToast, setSuccessToast] = useState<{
    msg: string;
    prNumber?: string;
  } | null>(null);

  // Set default BOM
  useEffect(() => {
    setMounted(true);
    const paramBom = searchParams.get('bom');
    if (paramBom) {
      const found = boms.find(
        (b) =>
          b.id === paramBom ||
          b.bomNumber === paramBom ||
          b.jobNumber === paramBom ||
          b.projectId === paramBom
      );
      if (found) {
        setSelectedBomId(found.id);
        return;
      }
    }
    if (boms && boms.length > 0) {
      setSelectedBomId(boms[0].id);
    }
  }, [boms, searchParams]);

  // Active Selected BOM
  const currentBOM: BOMHeader | undefined = useMemo(() => {
    return boms.find((b) => b.id === selectedBomId || b.bomNumber === selectedBomId) || boms[0];
  }, [boms, selectedBomId]);

  // Project Job reference
  const currentProject = useMemo(() => {
    if (!currentBOM) return undefined;
    return projectJobs.find(
      (p) =>
        p.id === currentBOM.projectId ||
        p.projectNumber === currentBOM.projectId ||
        p.jobNumber === currentBOM.jobNumber
    );
  }, [currentBOM, projectJobs]);

  // Smart Matching: Compare BOM Items with Store StockBalances, GoodsReceipts & ItemMasters
  const verifiedItems: VerifiedMaterialItem[] = useMemo(() => {
    if (!currentBOM || !currentBOM.items) return [];

    return currentBOM.items.map((bomItem: BOMItem, index: number) => {
      const pNum = (bomItem.partNumber || '').trim().toLowerCase();
      const iName = (bomItem.itemName || '').trim().toLowerCase();

      // Find stock balance matching partNumber or itemCode or itemName
      const matchedStock = stockBalances.find((s) => {
        const sCode = (s.itemCode || (s as any).item_code || '').trim().toLowerCase();
        const sName = (s.itemName || (s as any).item_name || '').split(' (')[0].trim().toLowerCase();
        return (
          (pNum && sCode === pNum) ||
          (pNum && (sCode.includes(pNum) || pNum.includes(sCode))) ||
          (iName && sName === iName) ||
          (iName && (sName.includes(iName) || iName.includes(sName)))
        );
      });

      // Match item master for specs / defaults / current stock
      const matchedMaster = itemMasters.find(
        (m) =>
          (m.itemCode && (m.itemCode.toLowerCase() === pNum || pNum.includes(m.itemCode.toLowerCase()))) ||
          (m.itemName && (m.itemName.toLowerCase() === iName || iName.includes(m.itemName.toLowerCase())))
      );

      // Usable / available stock from stock balances
      const baseStock = matchedStock
        ? Number(matchedStock.usableQty ?? (matchedStock.availableQty - (matchedStock.reservedQty || 0)))
        : 0;

      // Inwarded quantity from accepted GRNs matching partNumber or itemName
      const grnInwardQty = (goodsReceipts || [])
        .filter((g) => g.status === 'Accepted' || (g as any).directInward)
        .flatMap((g) => g.items || [])
        .filter((gitm: any) => {
          const gCode = (gitm.itemCode || gitm.partNumber || '').trim().toLowerCase();
          const gName = (gitm.itemName || gitm.description || '').split(' (')[0].trim().toLowerCase();
          return (
            (pNum && (gCode === pNum || gCode.includes(pNum) || pNum.includes(gCode))) ||
            (iName && (gName === iName || gName.includes(iName) || iName.includes(gName)))
          );
        })
        .reduce((sum: number, gitm: any) => sum + Number(gitm.acceptedQuantity || gitm.acceptedQty || gitm.receivedQuantity || gitm.receivedQty || gitm.quantity || gitm.poQuantity || 0), 0);

      // Effective available stock
      const availableStock = Math.max(baseStock, grnInwardQty, matchedMaster?.currentStock || 0);
      const usableStock = Math.max(0, availableStock);
      const requiredQty = Number(bomItem.quantity || 1);

      // Status check: Is fully in stock?
      const isAvailable = usableStock >= requiredQty;
      const shortageQty = isAvailable ? 0 : requiredQty - usableStock;
      const estimatedRate = Number(
        bomItem.estimatedRate || matchedMaster?.defaultPurchaseRate || matchedStock?.averageRate || 150
      );
      const shortageValue = shortageQty * estimatedRate;

      // Check if a PR is already raised for this job/bom & item
      const existingPr = (purchaseRequisitions || []).find((pr) => {
        const matchesJob =
          pr.jobId === currentBOM.jobNumber ||
          pr.projectId === currentBOM.projectId ||
          pr.bomId === currentBOM.bomNumber ||
          pr.bomId === currentBOM.id;
        if (!matchesJob) return false;
        return (pr.items || []).some(
          (it) =>
            it.itemCode?.toLowerCase() === pNum ||
            it.itemName?.toLowerCase() === iName
        );
      });

      return {
        id: bomItem.id || `VERIF-${index + 1}`,
        itemNo: bomItem.itemNo || index + 1,
        partNumber: bomItem.partNumber || `PART-${index + 1}`,
        itemName: bomItem.itemName || 'Engineering Component',
        description: bomItem.description || bomItem.specification || 'As per approved design drawing',
        specification: bomItem.specification || bomItem.material || 'Standard Fabrication Grade',
        category: (bomItem.itemType as any) || (bomItem.item_type as any) || 'Raw Material',
        unit: bomItem.unit || 'NOS',
        requiredQty,
        availableStock,
        usableStock,
        shortageQty,
        estimatedRate,
        shortageValue,
        isAvailable,
        status: isAvailable ? 'IN_STOCK' : 'SHORTAGE',
        warehouseName: matchedStock?.warehouseName || 'Main Store (Makarpura)',
        locationBin: matchedStock?.locationCode || (matchedMaster?.defaultLocationBin || 'BIN-01'),
        existingPrNumber: existingPr?.prNumber,
      };
    });
  }, [currentBOM, stockBalances, goodsReceipts, itemMasters, purchaseRequisitions]);

  // Filtered List
  const filteredItems = useMemo(() => {
    return verifiedItems.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.partNumber.toLowerCase().includes(q) ||
        item.itemName.toLowerCase().includes(q) ||
        item.specification.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'IN_STOCK' && item.isAvailable) ||
        (statusFilter === 'SHORTAGE' && !item.isAvailable);

      return matchSearch && matchStatus;
    });
  }, [verifiedItems, searchTerm, statusFilter]);

  // Metrics
  const totalBOMItems = verifiedItems.length;
  const inStockItemsCount = verifiedItems.filter((i) => i.isAvailable).length;
  const shortageItemsCount = verifiedItems.filter((i) => !i.isAvailable).length;
  const totalShortageValuation = verifiedItems
    .filter((i) => !i.isAvailable)
    .reduce((sum, i) => sum + i.shortageValue, 0);
  const readinessPercent = totalBOMItems > 0 ? Math.round((inStockItemsCount / totalBOMItems) * 100) : 0;

  // Open PR Modal for all shortage items
  const handleOpenPRModalForAllShortage = () => {
    const shortageItems = verifiedItems.filter((i) => !i.isAvailable);
    if (shortageItems.length === 0) return;
    setSelectedItemsForPR(shortageItems);
    setPrRemarks(
      `Auto-generated PR from Store BOM Verification for ${currentBOM?.machineName || currentBOM?.jobNumber}. Procure ${shortageItems.length} shortage items for shop-floor production readiness.`
    );
    setShowPRModal(true);
  };

  // Open PR Modal for single shortage item ("Send to PR")
  const handleOpenPRModalForSingle = (item: VerifiedMaterialItem) => {
    setSelectedItemsForPR([item]);
    setPrRemarks(
      `Procurement request for ${item.itemName} (${item.partNumber}) for Job ${currentBOM?.jobNumber}. Deficit: ${item.shortageQty} ${item.unit}.`
    );
    setShowPRModal(true);
  };

  // Execute PR Submission into Purchase Requisition (PR) Register
  const handleConfirmSubmitPR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBOM || selectedItemsForPR.length === 0) return;

    const prNumber = `PR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const prId = `PR-${Date.now()}`;

    const formattedPRItems: PRItem[] = selectedItemsForPR.map((it, idx) => ({
      id: `PRITEM-${Date.now()}-${idx + 1}`,
      prId: prId,
      itemCode: it.partNumber,
      itemName: it.itemName,
      specification: it.specification,
      category: it.category,
      unitOfMeasure: it.unit,
      requiredQuantity: it.shortageQty,
      estimatedUnitPrice: it.estimatedRate,
      estimatedTotalPrice: it.shortageValue,
      requiredByDate: prRequiredDate,
      bomReference: currentBOM.bomNumber,
      remarks: `Shortage from Store Verification. Available: ${it.usableStock}, Required: ${it.requiredQty}`,
    }));

    const totalCost = formattedPRItems.reduce((acc, it) => acc + it.estimatedTotalPrice, 0);

    const newPR: PurchaseRequisition = {
      id: prId,
      prNumber: prNumber,
      prDate: new Date().toISOString().split('T')[0],
      requisitionDate: new Date().toISOString().split('T')[0],
      projectId: currentBOM.projectId,
      jobId: currentBOM.jobNumber,
      jobNumber: currentBOM.jobNumber,
      customerName: currentProject?.customerName || currentBOM.machineName || 'Client Project',
      bomId: currentBOM.bomNumber || currentBOM.id,
      bomNumber: currentBOM.bomNumber,
      bomRevision: currentBOM.revision || 'REV-01',
      requestedBy: currentUser
        ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Store Manager'
        : 'Store & Inventory Manager',
      department: 'Store & Warehouse / Material Planning',
      requiredDate: prRequiredDate,
      requiredByDate: prRequiredDate,
      priority: prPriority,
      status: 'Submitted',
      items: formattedPRItems,
      totalItems: formattedPRItems.length,
      estimatedCost: totalCost,
      remarks: prRemarks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save into Context & localStorage & sync to DRF backend
    addPurchaseRequisition(newPR);

    setSuccessToast({
      msg: `Purchase Requisition "${prNumber}" generated with ${formattedPRItems.length} shortage items! Successfully sent to Purchase Requisition (PR) Register for approval.`,
      prNumber: prNumber,
    });

    setShowPRModal(false);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="p-6 space-y-6 text-[#211B17]">
      {/* 1. TOP HEADER & BOM SELECTOR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-crm-brand-100 text-crm-brand-800 border border-crm-brand-200 text-xs font-mono font-bold">
              STORE & STOCK VERIFICATION
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Live Stock Matcher
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#211B17] tracking-tight mt-1.5 flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-crm-brand-700" />
            BOM Material Verification & Stock Check
          </h1>
          <p className="text-xs text-[#70665F] mt-1 max-w-3xl leading-relaxed">
            Verify Bill of Materials (BOM) against available Store Inventory. Items in stock show with a{' '}
            <strong className="text-emerald-700">Green Checkmark</strong>, while out-of-stock items show with a{' '}
            <strong className="text-rose-700">Red Border</strong> and can be sent to the{' '}
            <strong className="text-crm-brand-800">Purchase Requisition (PR) Register</strong> with 1 click.
          </p>
        </div>

        {/* BOM Selector Dropdown */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-[#EBE3DB] shadow-sm">
          <label className="text-xs font-bold text-[#544B45] whitespace-nowrap pl-1">Select BOM:</label>
          <select
            value={selectedBomId}
            onChange={(e) => {
              setSelectedBomId(e.target.value);
              setSuccessToast(null);
            }}
            className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs font-bold text-[#211B17] focus:outline-none focus:border-crm-brand-600 cursor-pointer min-w-[260px]"
          >
            {boms.map((bom) => (
              <option key={bom.id} value={bom.id}>
                {bom.bomNumber} — [{bom.jobNumber}] {bom.machineName || bom.bomName || 'BOM Plan'} ({bom.items?.length || 0} Items)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. SUCCESS TOAST WITH DIRECT LINK TO PURCHASE REQUISITION (PR) REGISTER */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <span className="font-extrabold text-sm block text-emerald-900">Purchase Requisition Generated!</span>
              <p className="text-emerald-800 text-xs mt-0.5">{successToast.msg}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/purchase/requisition"
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <span>Go to Purchase Requisition (PR) Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setSuccessToast(null)}
              className="p-1.5 text-emerald-700 hover:text-emerald-900 rounded-lg hover:bg-emerald-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. CURRENT BOM SUMMARY CARD & METRICS */}
      {currentBOM && (
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#EBE3DB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-crm-brand-100 border border-crm-brand-200 flex items-center justify-center text-crm-brand-700 font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-crm-brand-700 text-base">{currentBOM.bomNumber}</span>
                  <span className="px-2 py-0.5 rounded-full bg-crm-brand-100 text-crm-brand-800 font-mono text-[10px] font-bold">
                    {currentBOM.revision || 'REV-01'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                    Job: {currentBOM.jobNumber}
                  </span>
                </div>
                <h3 className="font-extrabold text-[#211B17] text-sm mt-0.5">
                  {currentBOM.machineName || currentBOM.bomName || 'Engineered Make-to-Order Equipment'}
                </h3>
              </div>
            </div>

            {/* Bulk Action: Send Shortage to PR */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenPRModalForAllShortage}
                disabled={shortageItemsCount === 0}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-sm cursor-pointer ${
                  shortageItemsCount > 0
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 active:scale-95'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
                title={
                  shortageItemsCount > 0
                    ? `Send ${shortageItemsCount} Shortage Items to Purchase Requisition (PR) Register`
                    : 'All items are fully in stock! No requisition required.'
                }
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Shortage to Purchase Requisition (PR)</span>
                {shortageItemsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white text-rose-700 font-mono text-[10px] font-black">
                    {shortageItemsCount}
                  </span>
                )}
              </button>

              <Link
                href="/purchase/requisition"
                className="px-3.5 py-2.5 bg-white hover:bg-[#FAF7F2] border border-[#EBE3DB] text-[#544B45] hover:text-[#211B17] rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-2xs"
                title="View existing requisitions in Purchase module"
              >
                <span>PR Register</span>
                <ExternalLink className="w-3.5 h-3.5 text-crm-brand-700" />
              </Link>
            </div>
          </div>

          {/* 100% READINESS / ALL IN STOCK BANNER */}
          {shortageItemsCount === 0 && totalBOMItems > 0 && (
            <div className="p-4 rounded-2xl bg-emerald-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 border border-emerald-700 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-300 shrink-0" />
                <div>
                  <h4 className="font-black text-sm text-emerald-100">
                    🎉 All {totalBOMItems} Items 100% In Stock in Store Room!
                  </h4>
                  <p className="text-xs text-white/90 mt-0.5">
                    Previously shortage items have arrived via GRN. All materials are ready. Proceed to Material Issue to dispatch to production floor.
                  </p>
                </div>
              </div>

              <Link
                href={`/store/material-issue?jobId=${currentBOM?.jobNumber}&bomId=${currentBOM?.bomNumber}`}
                className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5 shrink-0"
              >
                <span>Proceed to Material Issue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* 4 KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {/* Total BOM Items */}
            <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
              <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider block">Total BOM Items</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#211B17] font-mono">{totalBOMItems}</span>
                <span className="text-xs text-[#70665F]">Items</span>
              </div>
              <span className="text-[10px] text-[#70665F] block mt-0.5">Required for Machine Assembly</span>
            </div>

            {/* In-Stock Items (GREEN) */}
            <div className="p-3.5 bg-emerald-50/70 rounded-xl border-2 border-emerald-300">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider">In-Stock (Available)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-800 font-mono">{inStockItemsCount}</span>
                <span className="text-xs text-emerald-700 font-bold">Items</span>
              </div>
              <span className="text-[10px] text-emerald-800 font-bold block mt-0.5">
                Ready in Store
              </span>
            </div>

            {/* Shortage / Out of Stock (RED) */}
            <div className="p-3.5 bg-rose-50/80 rounded-xl border-2 border-rose-400">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-rose-900 uppercase tracking-wider">Shortage (Missing)</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-rose-800 font-mono">{shortageItemsCount}</span>
                <span className="text-xs text-rose-700 font-bold">Items</span>
              </div>
              <span className="text-[10px] text-rose-800 font-bold block mt-0.5">
                Needs Procurement
              </span>
            </div>

            {/* Readiness Rate & Est Shortage Cost */}
            <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
              <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider block">Shop Readiness Rate</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-crm-brand-800 font-mono">{readinessPercent}%</span>
                <span className="text-xs text-[#70665F]">Ready</span>
              </div>
              <span className="text-[10px] text-[#70665F] font-mono block mt-0.5">
                Shortage Value: <strong className="text-rose-700">{formatCurrency(totalShortageValuation)}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 100% IN-STOCK ACTION BANNER: Issue Material to Production */}
      {totalBOMItems > 0 && shortageItemsCount === 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-800 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border border-emerald-600 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="text-sm font-black text-emerald-100 flex items-center gap-2">
                <span>100% Materials Verified in Store</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase">
                  Ready for Production
                </span>
              </div>
              <p className="text-xs text-white/90 mt-0.5">
                All parts and hardware for Job <strong>{currentBOM?.jobNumber || 'JOB-2026-0070'}</strong> are available in stock. You can now issue material to the fabrication shop floor and start manufacturing!
              </p>
            </div>
          </div>
          <Link
            href={`/store/material-issue?jobId=${currentBOM?.jobNumber || 'JOB-2026-0070'}&bomId=${currentBOM?.bomNumber || ''}`}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 text-xs font-black shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Truck className="w-4 h-4 text-emerald-700" />
            <span>Issue Material to Shop Floor</span>
            <ArrowRight className="w-4 h-4 text-emerald-700" />
          </Link>
        </div>
      )}

      {/* 4. FILTER BAR & SEARCH */}
      <div className="p-4 rounded-2xl bg-white border border-[#EBE3DB] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search Part #, Item Name, Specs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#EBE3DB] text-xs text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-crm-brand-600"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-crm-brand-700 text-white shadow-xs'
                : 'bg-[#FAF7F2] text-[#544B45] hover:bg-[#EFE8DF]'
            }`}
          >
            All Items ({verifiedItems.length})
          </button>
          <button
            onClick={() => setStatusFilter('IN_STOCK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              statusFilter === 'IN_STOCK'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>In Stock ({inStockItemsCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('SHORTAGE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              statusFilter === 'SHORTAGE'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Shortage / Out of Stock ({shortageItemsCount})</span>
          </button>
        </div>
      </div>

      {/* 5. VERIFIED MATERIAL ITEMS LIST (CARDS & TABLE) */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#EBE3DB] space-y-2">
            <Package className="w-10 h-10 text-[#A89F91] mx-auto" />
            <h4 className="text-sm font-bold text-[#211B17]">No BOM items found for this selection</h4>
            <p className="text-xs text-[#70665F]">Try clearing the search query or select another BOM.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isRedBorder = !item.isAvailable;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl transition-all duration-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  isRedBorder
                    ? 'border-2 border-rose-400 bg-rose-50/50 hover:bg-rose-50/70 shadow-rose-100'
                    : 'border-2 border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/60 shadow-emerald-100'
                }`}
              >
                {/* Item Details */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5 ${
                      isRedBorder
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    #{item.itemNo}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-[#211B17] bg-white px-2 py-0.5 rounded border border-[#EBE3DB]">
                        {item.partNumber}
                      </span>
                      <span className="font-extrabold text-sm text-[#211B17]">{item.itemName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white text-[#70665F] border border-[#EBE3DB] text-[10px] font-semibold">
                        {item.category}
                      </span>
                    </div>

                    <p className="text-xs text-[#544B45] font-medium leading-relaxed">{item.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-[#70665F] font-mono">
                      <span>Spec: <strong className="text-[#3E2723]">{item.specification}</strong></span>
                      <span>•</span>
                      <span>Location: <strong className="text-[#3E2723]">{item.locationBin}</strong> ({item.warehouseName})</span>
                    </div>
                  </div>
                </div>

                {/* Stock Comparison Matrix & Visual Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 self-stretch lg:self-auto justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-[#EBE3DB]">
                  {/* Quantity Breakdown */}
                  <div className="grid grid-cols-3 gap-3 text-center min-w-[240px]">
                    <div className="bg-white p-2 rounded-xl border border-[#EBE3DB]">
                      <span className="text-[10px] text-[#70665F] block font-bold uppercase">Required Qty</span>
                      <span className="font-mono font-black text-sm text-[#211B17]">
                        {item.requiredQty} {item.unit}
                      </span>
                    </div>

                    <div
                      className={`p-2 rounded-xl border ${
                        item.isAvailable
                          ? 'bg-emerald-100/60 border-emerald-300 text-emerald-900'
                          : 'bg-white border-[#EBE3DB] text-[#544B45]'
                      }`}
                    >
                      <span className="text-[10px] block font-bold uppercase">Store Stock</span>
                      <span className="font-mono font-black text-sm">
                        {item.usableStock} {item.unit}
                      </span>
                    </div>

                    <div
                      className={`p-2 rounded-xl border ${
                        isRedBorder
                          ? 'bg-rose-100/80 border-rose-300 text-rose-900'
                          : 'bg-white border-[#EBE3DB] text-slate-400'
                      }`}
                    >
                      <span className="text-[10px] block font-bold uppercase">Shortage</span>
                      <span className="font-mono font-black text-sm">
                        {item.shortageQty > 0 ? `-${item.shortageQty} ${item.unit}` : '0'}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator & Action */}
                  <div className="flex flex-col sm:items-end justify-center gap-1.5 min-w-[190px]">
                    {item.isAvailable ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black shadow-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>AVAILABLE IN STOCK</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 border border-rose-400 text-rose-950 text-xs font-black shadow-xs">
                        <AlertTriangle className="w-4 h-4 text-rose-700" />
                        <span>OUT OF STOCK / DEFICIT</span>
                      </div>
                    )}

                    {/* Action Button */}
                    <div>
                      {item.isAvailable ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> In Store
                          </span>
                          <Link
                            href={`/store/material-issue?jobId=${currentBOM?.jobNumber || 'JOB-2026-0070'}&bomId=${currentBOM?.bomNumber || ''}&itemId=${item.partNumber}`}
                            className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                            title="Issue this item to shop floor for manufacturing"
                          >
                            <span>Issue Material</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ) : item.existingPrNumber ? (
                        <Link
                          href="/purchase/requisition"
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 text-[11px] font-bold flex items-center gap-1"
                          title="View PR in Purchase Requisition Register"
                        >
                          <span>PR Raised: {item.existingPrNumber}</span>
                          <ExternalLink className="w-3 h-3 text-blue-600" />
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleOpenPRModalForSingle(item)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                          title="Generate Purchase Requisition for this shortage item"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send to PR</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 6. MODAL: PURCHASE REQUISITION CREATION CONFIRMATION */}
      {showPRModal && (
        <div
          onClick={() => setShowPRModal(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl space-y-4 p-6 text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono text-[10px] font-bold">
                  STORE REQUISITION GENERATOR
                </span>
                <h3 className="text-base font-extrabold text-[#211B17] mt-1 flex items-center gap-2">
                  <Send className="w-5 h-5 text-rose-600" />
                  Send Shortage Items to Purchase Requisition (PR) Register
                </h3>
                <p className="text-[#70665F] text-[11px] mt-0.5">
                  Generate an official Purchase Requisition mapped to Job{' '}
                  <strong className="text-[#211B17] font-mono">{currentBOM?.jobNumber}</strong> and Project{' '}
                  <strong className="text-[#211B17] font-mono">{currentBOM?.projectId}</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPRModal(false)}
                className="text-[#70665F] hover:text-[#211B17] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSubmitPR} className="space-y-4">
              {/* Target Project & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FAF7F2] p-3 rounded-xl border border-[#EBE3DB]">
                <div>
                  <label className="text-[#70665F] font-bold text-[10px] block mb-0.5">JOB / PROJECT REF</label>
                  <span className="font-mono font-bold text-xs text-[#211B17]">{currentBOM?.jobNumber}</span>
                  <span className="text-[10px] text-[#70665F] block">({currentBOM?.projectId})</span>
                </div>
                <div>
                  <label className="text-[#70665F] font-bold text-[10px] block mb-0.5">BOM REFERENCE</label>
                  <span className="font-mono font-bold text-xs text-crm-brand-700">{currentBOM?.bomNumber}</span>
                  <span className="text-[10px] text-[#70665F] block">{currentBOM?.revision || 'REV-01'}</span>
                </div>
                <div>
                  <label className="text-[#70665F] font-bold text-[10px] block mb-0.5">PRIORITY LEVEL *</label>
                  <select
                    value={prPriority}
                    onChange={(e) => setPrPriority(e.target.value as any)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1 text-xs font-bold text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                  >
                    <option value="Urgent">Urgent (Production Critical)</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Target Required By Date */}
              <div>
                <label className="text-[#544B45] font-bold block mb-1">Target Procurement Date (Required by Date) *</label>
                <input
                  type="date"
                  required
                  value={prRequiredDate}
                  onChange={(e) => setPrRequiredDate(e.target.value)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-mono"
                />
              </div>

              {/* Shortage Items List to be added to PR */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#211B17] text-xs">
                    Items to Requisition ({selectedItemsForPR.length}):
                  </span>
                  <span className="font-mono font-bold text-xs text-rose-700">
                    Est. Total: {formatCurrency(selectedItemsForPR.reduce((acc, i) => acc + i.shortageValue, 0))}
                  </span>
                </div>

                <div className="border border-[#EBE3DB] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#FAF7F2] border-b border-[#EBE3DB] text-[#70665F] uppercase font-mono">
                      <tr>
                        <th className="p-2">Item Code</th>
                        <th className="p-2">Item Name</th>
                        <th className="p-2 text-right">Shortage Qty</th>
                        <th className="p-2 text-right">Est Rate</th>
                        <th className="p-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE3DB]">
                      {selectedItemsForPR.map((it) => (
                        <tr key={it.id} className="hover:bg-rose-50/30">
                          <td className="p-2 font-mono font-bold text-[#211B17]">{it.partNumber}</td>
                          <td className="p-2 font-medium text-[#211B17]">{it.itemName}</td>
                          <td className="p-2 text-right font-mono font-bold text-rose-700">
                            {it.shortageQty} {it.unit}
                          </td>
                          <td className="p-2 text-right font-mono text-[#544B45]">{formatCurrency(it.estimatedRate)}</td>
                          <td className="p-2 text-right font-mono font-bold text-[#211B17]">
                            {formatCurrency(it.shortageValue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="text-[#544B45] font-bold block mb-1">Requisition Notes & Justification</label>
                <textarea
                  rows={2}
                  value={prRemarks}
                  onChange={(e) => setPrRemarks(e.target.value)}
                  placeholder="Justification for purchase requisition, supplier references, or urgent shop floor requirements..."
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] placeholder-slate-400 focus:outline-none focus:border-crm-brand-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowPRModal(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#EBE3DB] text-[#544B45] font-bold hover:bg-[#FAF7F2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-md shadow-rose-600/20 cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Purchase Requisition (PR) Register</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BOMMaterialVerificationPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-[#70665F]">Loading BOM Verification...</div>}>
      <BOMMaterialVerificationContent />
    </React.Suspense>
  );
}
