'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { BOMHeader, BOMItem } from '../../../types/designer';
import { PurchaseRequisition, PRItem } from '../../../types/purchase';
import { formatCurrency } from '../../../lib/utils';
import {
  FileSpreadsheet, CheckCircle2, AlertTriangle, Send, ArrowRight, ExternalLink, Search, Package,
  Truck, X, Download, CircleDashed, ClipboardList, Layers, ArrowLeft, ChevronRight,
} from 'lucide-react';

type ItemStatus = 'IN_STOCK' | 'PARTIAL' | 'SHORTAGE';

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
  usableStock: number;
  shortageQty: number;
  estimatedRate: number;
  shortageValue: number;
  isAvailable: boolean;
  status: ItemStatus;
  coverage: number; // 0..100
  warehouseName?: string;
  locationBin?: string;
  existingPrNumber?: string;
}

const low = (v: any) => String(v ?? '').trim().toLowerCase();
const num = (v: number) => (Number.isInteger(v) ? v.toString() : v.toFixed(2));

const STATUS_UI: Record<ItemStatus, { label: string; pill: string; bar: string; row: string }> = {
  IN_STOCK: { label: 'In stock', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500', row: '' },
  PARTIAL: { label: 'Partial', pill: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-500', row: 'bg-amber-50/30' },
  SHORTAGE: { label: 'Missing', pill: 'bg-rose-50 text-rose-700 border-rose-200', bar: 'bg-rose-500', row: 'bg-rose-50/30' },
};

function BOMMaterialVerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { boms, stockBalances, goodsReceipts, itemMasters, purchaseRequisitions, addPurchaseRequisition, projectJobs, currentUser } = useERP();

  const [mounted, setMounted] = useState(false);
  const [selectedBomId, setSelectedBomId] = useState('');
  const [bomSearch, setBomSearch] = useState('');
  const [listFilter, setListFilter] = useState<'ALL' | 'SHORT' | 'READY'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ItemStatus>('ALL');
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const [showPRModal, setShowPRModal] = useState(false);
  const [selectedItemsForPR, setSelectedItemsForPR] = useState<VerifiedMaterialItem[]>([]);
  const [prPriority, setPrPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('High');
  const [prRequiredDate, setPrRequiredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [prRemarks, setPrRemarks] = useState('');
  const [successToast, setSuccessToast] = useState<{ msg: string; prNumber?: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    const paramBom = searchParams.get('bom');
    if (!paramBom) { setSelectedBomId(''); return; }
    const found = boms.find((b) => b.id === paramBom || b.bomNumber === paramBom || b.jobNumber === paramBom || b.projectId === paramBom);
    setSelectedBomId(found ? found.id : '');
  }, [boms, searchParams]);

  const openBom = (id: string) => { setSuccessToast(null); router.push(`/store/bom-verification?bom=${encodeURIComponent(id)}`); };
  const backToList = () => { setSuccessToast(null); router.push('/store/bom-verification'); };

  // Project shown instead of the job number
  const projectOf = (b: BOMHeader) =>
    projectJobs.find((p) => p.id === b.projectId || p.projectNumber === b.projectId || p.jobNumber === b.jobNumber);
  const projectNameOf = (b: BOMHeader) => {
    const p: any = projectOf(b);
    return p?.projectName || p?.productName || b.machineName || (b as any).bomName || b.projectId || 'Project';
  };

  const currentBOM: BOMHeader | undefined = useMemo(
    () => boms.find((b) => b.id === selectedBomId || b.bomNumber === selectedBomId) || undefined,
    [boms, selectedBomId]
  );

  const currentProject = useMemo(() => {
    if (!currentBOM) return undefined;
    return projectJobs.find((p) => p.id === currentBOM.projectId || p.projectNumber === currentBOM.projectId || p.jobNumber === currentBOM.jobNumber);
  }, [currentBOM, projectJobs]);

  // ---- lower-cased lookup indexes (built once, reused for every BOM) ----
  const index = useMemo(() => {
    const stock = (stockBalances || []).map((s: any) => ({
      s, code: low(s.itemCode || s.item_code), name: low(String(s.itemName || s.item_name || '').split(' (')[0]),
    }));
    const masters = (itemMasters || []).map((m: any) => ({
      m, code: low(m.itemCode || m.id), name: low(m.itemName), desc: low(m.description || m.specification),
    }));
    const grnItems = (goodsReceipts || [])
      .filter((g: any) => g.status === 'Accepted' || g.status === 'Received' || g.directInward)
      .flatMap((g: any) => g.items || [])
      .map((gi: any) => ({
        code: low(gi.itemCode || gi.partNumber), name: low(String(gi.itemName || gi.description || '').split(' (')[0]),
        qty: Number(gi.acceptedQuantity || gi.acceptedQty || gi.receivedQuantity || gi.receivedQty || gi.quantity || gi.poQuantity || 0),
      }));
    return { stock, masters, grnItems };
  }, [stockBalances, itemMasters, goodsReceipts]);

  const verifyBom = React.useCallback((bom: BOMHeader): VerifiedMaterialItem[] => {
    if (!bom || !bom.items) return [];
    return bom.items.map((bomItem: BOMItem, i: number) => {
      const pNum = low(bomItem.partNumber || (bomItem as any).part_number);
      const iName = low(bomItem.itemName || (bomItem as any).partName || (bomItem as any).part_name);
      const iDesc = low(bomItem.description || bomItem.specification);

      const ms = index.stock.find(({ code, name }) =>
        (pNum && (code === pNum || code.includes(pNum) || pNum.includes(code))) ||
        (iName && (name === iName || name.includes(iName) || iName.includes(name))) ||
        (iDesc && (name.includes(iDesc) || iDesc.includes(name))))?.s as any;
      const mm = index.masters.find(({ code, name, desc }) =>
        (pNum && (code === pNum || pNum.includes(code) || code.includes(pNum))) ||
        (iName && (name === iName || name.includes(iName) || iName.includes(name))) ||
        (iName && desc && (desc.includes(iName) || iName.includes(desc))) ||
        (iDesc && (name.includes(iDesc) || iDesc.includes(name))))?.m as any;

      const baseStock = ms ? Number(ms.usableQty ?? (ms.availableQty - (ms.reservedQty || 0))) : 0;
      const mCode = low(mm?.itemCode);
      const sCode = low(ms?.itemCode);
      const grnQty = index.grnItems
        .filter(({ code, name }) =>
          (pNum && (code === pNum || code.includes(pNum) || pNum.includes(code))) ||
          (mCode && code === mCode) || (sCode && code === sCode) ||
          (iName && (name === iName || name.includes(iName) || iName.includes(name))) ||
          (iDesc && (name.includes(iDesc) || iDesc.includes(name))))
        .reduce((a, g) => a + g.qty, 0);

      const usableStock = Math.max(0, baseStock, grnQty, Number(mm?.currentStock ?? 0));
      const requiredQty = Number(bomItem.quantity || 1);
      const isAvailable = usableStock >= requiredQty;
      const shortageQty = isAvailable ? 0 : Math.max(0, requiredQty - usableStock);
      const estimatedRate = Number(bomItem.estimatedRate || mm?.defaultPurchaseRate || ms?.averageRate || 150);

      const existingPr = (purchaseRequisitions || []).find((pr) => {
        const sameJob = pr.jobId === bom.jobNumber || pr.projectId === bom.projectId || pr.bomId === bom.bomNumber || pr.bomId === bom.id;
        return sameJob && (pr.items || []).some((it) => low(it.itemCode) === pNum || low(it.itemName) === iName);
      });

      const status: ItemStatus = isAvailable ? 'IN_STOCK' : usableStock > 0 ? 'PARTIAL' : 'SHORTAGE';
      return {
        id: bomItem.id || `VERIF-${i + 1}`,
        itemNo: bomItem.itemNo || i + 1,
        partNumber: bomItem.partNumber || `PART-${i + 1}`,
        itemName: bomItem.itemName || 'Engineering Component',
        description: bomItem.description || bomItem.specification || '',
        specification: bomItem.specification || bomItem.material || '',
        category: (bomItem.itemType as any) || (bomItem.item_type as any) || 'Raw Material',
        unit: bomItem.unit || 'NOS',
        requiredQty, usableStock, shortageQty, estimatedRate,
        shortageValue: shortageQty * estimatedRate,
        isAvailable, status,
        coverage: Math.min(100, Math.round((usableStock / Math.max(requiredQty, 0.0001)) * 100)),
        warehouseName: ms?.warehouseName || 'Main Store',
        locationBin: ms?.locationCode || mm?.defaultLocationBin || '-',
        existingPrNumber: isAvailable ? undefined : existingPr?.prNumber,
      };
    });
  }, [index, purchaseRequisitions]);

  const verifiedItems = useMemo(() => (currentBOM ? verifyBom(currentBOM) : []), [currentBOM, verifyBom]);

  // Readiness for every BOM (left rail)
  const bomSummaries = useMemo(() => {
    const out: Record<string, { total: number; ready: number; pct: number; partial: number; missing: number; shortageValue: number }> = {};
    boms.forEach((b) => {
      const items = b.id === currentBOM?.id ? verifiedItems : verifyBom(b);
      const ready = items.filter((i) => i.isAvailable).length;
      out[b.id] = {
        total: items.length,
        ready,
        pct: items.length ? Math.round((ready / items.length) * 100) : 0,
        partial: items.filter((i) => i.status === 'PARTIAL').length,
        missing: items.filter((i) => i.status === 'SHORTAGE').length,
        shortageValue: items.filter((i) => !i.isAvailable).reduce((a, i) => a + i.shortageValue, 0),
      };
    });
    return out;
  }, [boms, currentBOM, verifiedItems, verifyBom]);

  const railBoms = useMemo(() => {
    const q = bomSearch.trim().toLowerCase();
    return boms
      .filter((b) => {
        const p: any = projectOf(b);
        return !q || [b.bomNumber, b.machineName, (b as any).bomName, p?.projectName, p?.productName, p?.customerName, p?.projectNumber]
          .some((x) => low(x).includes(q));
      })
      .filter((b) => {
        const s = bomSummaries[b.id];
        if (!s || listFilter === 'ALL') return true;
        return listFilter === 'READY' ? s.total > 0 && s.ready === s.total : s.ready < s.total;
      })
      // projects with the most missing material first
      .sort((a, b) => (bomSummaries[b.id]?.missing || 0) - (bomSummaries[a.id]?.missing || 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boms, bomSearch, listFilter, bomSummaries, projectJobs]);

  const filteredItems = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return verifiedItems.filter((it) =>
      (!q || it.partNumber.toLowerCase().includes(q) || it.itemName.toLowerCase().includes(q) || it.specification.toLowerCase().includes(q)) &&
      (statusFilter === 'ALL' || it.status === statusFilter));
  }, [verifiedItems, searchTerm, statusFilter]);

  const total = verifiedItems.length;
  const cnt = (s: ItemStatus) => verifiedItems.filter((i) => i.status === s).length;
  const inStock = cnt('IN_STOCK'), partial = cnt('PARTIAL'), missing = cnt('SHORTAGE');
  const shortageItems = verifiedItems.filter((i) => !i.isAvailable);
  const shortageValue = shortageItems.reduce((a, i) => a + i.shortageValue, 0);
  const readiness = total ? Math.round((inStock / total) * 100) : 0;

  // reset selection when BOM changes
  useEffect(() => { setPicked(new Set()); setStatusFilter('ALL'); setSearchTerm(''); }, [selectedBomId]);

  const pickable = filteredItems.filter((i) => !i.isAvailable && !i.existingPrNumber);
  const allPicked = pickable.length > 0 && pickable.every((i) => picked.has(i.id));
  const toggle = (id: string) => setPicked((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setPicked(allPicked ? new Set() : new Set(pickable.map((i) => i.id)));

  const openPR = (items: VerifiedMaterialItem[]) => {
    if (!items.length) return;
    setSelectedItemsForPR(items);
    setPrRemarks(items.length === 1
      ? `Procurement request for ${items[0].itemName} (${items[0].partNumber}) for project ${currentBOM ? projectNameOf(currentBOM) : ''}. Deficit: ${items[0].shortageQty} ${items[0].unit}.`
      : `Auto-generated PR from Store BOM Verification for project ${currentBOM ? projectNameOf(currentBOM) : ''}. Procure ${items.length} shortage items for shop-floor production readiness.`);
    setShowPRModal(true);
  };

  const handleConfirmSubmitPR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBOM || selectedItemsForPR.length === 0) return;
    const prNumber = `PR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const prId = `PR-${Date.now()}`;
    const formattedPRItems: PRItem[] = selectedItemsForPR.map((it, idx) => ({
      id: `PRITEM-${Date.now()}-${idx + 1}`, prId, itemCode: it.partNumber, itemName: it.itemName, specification: it.specification,
      category: it.category, unitOfMeasure: it.unit, requiredQuantity: it.shortageQty, estimatedUnitPrice: it.estimatedRate,
      estimatedTotalPrice: it.shortageValue, requiredByDate: prRequiredDate, bomReference: currentBOM.bomNumber,
      remarks: `Shortage from Store Verification. Available: ${it.usableStock}, Required: ${it.requiredQty}`,
    }));
    const totalCost = formattedPRItems.reduce((a, it) => a + it.estimatedTotalPrice, 0);
    const today = new Date().toISOString().split('T')[0];
    const newPR: PurchaseRequisition = {
      id: prId, prNumber, prDate: today, requisitionDate: today, projectId: currentBOM.projectId, jobId: currentBOM.jobNumber,
      jobNumber: currentBOM.jobNumber, customerName: currentProject?.customerName || currentBOM.machineName || 'Client Project',
      bomId: currentBOM.bomNumber || currentBOM.id, bomNumber: currentBOM.bomNumber, bomRevision: currentBOM.revision || 'REV-01',
      requestedBy: currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Store Manager' : 'Store & Inventory Manager',
      department: 'Store & Warehouse / Material Planning', requiredDate: prRequiredDate, requiredByDate: prRequiredDate,
      priority: prPriority, status: 'Submitted', items: formattedPRItems, totalItems: formattedPRItems.length,
      estimatedCost: totalCost, remarks: prRemarks, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    addPurchaseRequisition(newPR);
    setSuccessToast({ msg: `${prNumber} created with ${formattedPRItems.length} item(s) — sent to the PR Register for approval.`, prNumber });
    setPicked(new Set());
    setShowPRModal(false);
  };

  const exportCsv = () => {
    const esc = (v: any) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const rows = [['#', 'Part No', 'Item', 'Category', 'Unit', 'Required', 'In Store', 'Shortage', 'Status', 'Location'],
      ...filteredItems.map((i) => [i.itemNo, i.partNumber, i.itemName, i.category, i.unit, i.requiredQty, i.usableStock, i.shortageQty, STATUS_UI[i.status].label, i.locationBin])];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + rows.map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }));
    a.download = `bom-verification-${currentBOM?.bomNumber || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (!mounted) return null;

  const chip = (key: 'ALL' | ItemStatus, label: string, n: number, cls: string) => (
    <button key={key} onClick={() => setStatusFilter(key)}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${statusFilter === key ? 'ring-2 ring-offset-1 ring-blue-500' : ''} ${cls}`}>
      {label} <span className="font-mono">{n}</span>
    </button>
  );

  return (
    <div className="p-4 md:p-6 space-y-5 text-[color:var(--crm-text-primary)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white"><ClipboardList className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">BOM Material Check</h1>
            <p className="text-xs text-[color:var(--crm-text-secondary)]">Compare each BOM with Store stock — raise a Purchase Requisition for what is missing.</p>
          </div>
        </div>
        <Link href="/purchase/requisition" className="px-3.5 py-2 rounded-xl bg-white border border-[color:var(--crm-border-default)] text-xs font-semibold flex items-center gap-1.5 hover:bg-[color:var(--crm-surface-subtle)]">
          PR Register <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-600" /><span><b>Requisition created.</b> {successToast.msg}</span></div>
          <div className="flex items-center gap-2">
            <Link href="/purchase/requisition" className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1">Open PR Register <ArrowRight className="w-3.5 h-3.5" /></Link>
            <button onClick={() => setSuccessToast(null)} className="p-1 cursor-pointer" aria-label="Dismiss"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {boms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[color:var(--crm-border-default)] p-12 text-center space-y-2">
          <Layers className="w-10 h-10 mx-auto text-[color:var(--crm-text-tertiary)]" />
          <h3 className="text-sm font-bold">No BOMs available yet</h3>
          <p className="text-xs text-[color:var(--crm-text-secondary)] max-w-md mx-auto">BOMs are created by the Designer &amp; Engineering team and show up here automatically. If you expected some, refresh the page or check your access.</p>
          <Link href="/designer" className="inline-block mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold">Go to Designer</Link>
        </div>
      ) : !currentBOM ? (
        /* ================= LIST PAGE: one row per project ================= */
        <div className="bg-white rounded-2xl border border-[color:var(--crm-border-default)] overflow-hidden">
          <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--crm-border-default)]">
            <div>
              <h2 className="text-sm font-bold">Projects ({railBoms.length})</h2>
              <p className="text-xs text-[color:var(--crm-text-secondary)]">Select a project to check its BOM material against store stock.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {([['ALL', 'All'], ['SHORT', 'Material missing'], ['READY', 'Fully available']] as const).map(([k, label]) => (
                <button key={k} onClick={() => setListFilter(k)} aria-pressed={listFilter === k}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${listFilter === k ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-[color:var(--crm-border-default)] hover:bg-[color:var(--crm-surface-subtle)]'}`}>
                  {label}
                </button>
              ))}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[color:var(--crm-text-secondary)]" />
                <input value={bomSearch} onChange={(e) => setBomSearch(e.target.value)} placeholder="Search project / customer / BOM"
                  aria-label="Search projects"
                  className="w-64 max-w-full pl-8 pr-2 py-2 rounded-lg text-xs bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] focus:outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-[color:var(--crm-text-secondary)] bg-[color:var(--crm-surface-subtle)]">
                  <th className="px-4 py-2.5">#</th>
                  <th className="px-4 py-2.5">Project</th>
                  <th className="px-4 py-2.5">Customer</th>
                  <th className="px-4 py-2.5">BOM</th>
                  <th className="px-4 py-2.5 text-right">Items</th>
                  <th className="px-4 py-2.5 text-right">In stock</th>
                  <th className="px-4 py-2.5 text-right">Partial</th>
                  <th className="px-4 py-2.5 text-right">Missing</th>
                  <th className="px-4 py-2.5">Readiness</th>
                  <th className="px-4 py-2.5 text-right">Shortage value</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {railBoms.map((b, idx) => {
                  const s = bomSummaries[b.id] || { total: 0, ready: 0, pct: 0, partial: 0, missing: 0, shortageValue: 0 };
                  const p: any = projectOf(b);
                  const tone = s.pct === 100 ? 'bg-emerald-500' : s.pct >= 50 ? 'bg-amber-500' : 'bg-rose-500';
                  return (
                    <tr key={b.id} onClick={() => openBom(b.id)}
                      className="border-t border-[color:var(--crm-border-default)] hover:bg-blue-50/40 cursor-pointer">
                      <td className="px-4 py-3 text-[color:var(--crm-text-secondary)]">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-[13px] text-[color:var(--crm-text-primary)]">{projectNameOf(b)}</div>
                        {b.machineName && b.machineName !== projectNameOf(b) && (
                          <div className="text-[11px] text-[color:var(--crm-text-secondary)]">{b.machineName}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">{p?.customerName || '—'}</td>
                      <td className="px-4 py-3 font-mono text-blue-700 font-semibold">{b.bomNumber} <span className="text-[color:var(--crm-text-tertiary)]">{b.revision || 'REV-01'}</span></td>
                      <td className="px-4 py-3 text-right font-mono">{s.total}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-700">{s.ready}</td>
                      <td className="px-4 py-3 text-right font-mono text-amber-700">{s.partial}</td>
                      <td className="px-4 py-3 text-right font-mono text-rose-700 font-bold">{s.missing}</td>
                      <td className="px-4 py-3 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full ${tone}`} style={{ width: `${s.pct}%` }} /></div>
                          <span className="font-mono font-bold w-9 text-right">{s.pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{s.shortageValue > 0 ? formatCurrency(s.shortageValue) : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={(e) => { e.stopPropagation(); openBom(b.id); }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer">
                          Check material <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {railBoms.length === 0 && (
                  <tr><td colSpan={11} className="p-8 text-center text-[color:var(--crm-text-secondary)]">No project matches your search / filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        ) : (
        /* ================= DETAIL PAGE: BOM material check of one project ================= */
        <div className="space-y-4">
          <button onClick={backToList}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[color:var(--crm-border-default)] text-xs font-semibold hover:bg-[color:var(--crm-surface-subtle)] cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" /> All projects
          </button>
          {/* Workspace */}
          <section className="space-y-4 min-w-0">
            {currentBOM && (
              <div className="bg-white rounded-2xl border border-[color:var(--crm-border-default)] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-extrabold text-blue-700">{currentBOM.bomNumber}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold">{currentBOM.revision || 'REV-01'}</span>
                    </div>
                    <h2 className="text-lg font-bold mt-0.5 truncate">{projectNameOf(currentBOM)}</h2>
                    <p className="text-xs text-[color:var(--crm-text-secondary)]">
                      {[currentProject?.customerName ? `Customer: ${currentProject.customerName}` : '', currentBOM.machineName && currentBOM.machineName !== projectNameOf(currentBOM) ? `Machine: ${currentBOM.machineName}` : '']
                        .filter(Boolean).join(' · ') || 'Make-to-order project'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {total > 0 && shortageItems.length === 0 ? (
                      <Link href={`/store/material-issue?jobId=${currentBOM.jobNumber}&bomId=${currentBOM.bomNumber}`}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Issue all to shop floor <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <button onClick={() => openPR(shortageItems.filter((i) => !i.existingPrNumber))} disabled={shortageItems.filter((i) => !i.existingPrNumber).length === 0}
                        className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer">
                        <Send className="w-4 h-4" /> Send all shortages to PR
                        <span className="px-1.5 rounded-full bg-white/90 text-rose-700 font-mono text-[10px]">{shortageItems.filter((i) => !i.existingPrNumber).length}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
                  <div>
                    <div className="flex items-end justify-between mb-1.5">
                      <span className="text-xs font-semibold">Production readiness</span>
                      <span className="text-sm font-extrabold font-mono">{readiness}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex">
                      <div className="bg-emerald-500" style={{ width: `${total ? (inStock / total) * 100 : 0}%` }} />
                      <div className="bg-amber-400" style={{ width: `${total ? (partial / total) * 100 : 0}%` }} />
                      <div className="bg-rose-500" style={{ width: `${total ? (missing / total) * 100 : 0}%` }} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-[color:var(--crm-text-secondary)]">
                      <span><i className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />In stock {inStock}</span>
                      <span><i className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1" />Partial {partial}</span>
                      <span><i className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1" />Missing {missing}</span>
                      <span>Total {total}</span>
                    </div>
                  </div>
                  <div className="md:text-right md:pl-6 md:border-l border-[color:var(--crm-border-default)]">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--crm-text-secondary)]">Est. shortage value</div>
                    <div className={`text-xl font-extrabold font-mono ${shortageValue > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{formatCurrency(shortageValue)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="bg-white rounded-2xl border border-[color:var(--crm-border-default)] p-3 flex flex-wrap items-center gap-3">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--crm-text-secondary)]" />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search part no, item, spec…"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex flex-wrap gap-2">
                {chip('ALL', 'All', total, 'bg-white border-slate-200 text-slate-700')}
                {chip('IN_STOCK', 'In stock', inStock, 'bg-emerald-50 border-emerald-200 text-emerald-700')}
                {chip('PARTIAL', 'Partial', partial, 'bg-amber-50 border-amber-200 text-amber-700')}
                {chip('SHORTAGE', 'Missing', missing, 'bg-rose-50 border-rose-200 text-rose-700')}
              </div>
              <button onClick={exportCsv} disabled={!filteredItems.length}
                className="ml-auto px-3 py-2 rounded-xl border border-[color:var(--crm-border-default)] text-xs font-semibold flex items-center gap-1.5 hover:bg-[color:var(--crm-surface-subtle)] disabled:opacity-50 cursor-pointer">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>

            {/* Items table */}
            <div className="bg-white rounded-2xl border border-[color:var(--crm-border-default)] overflow-x-auto">
              {filteredItems.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <Package className="w-9 h-9 mx-auto text-[color:var(--crm-text-tertiary)]" />
                  <h4 className="text-sm font-bold">{total === 0 ? 'This BOM has no items' : 'No items match your filter'}</h4>
                  <p className="text-xs text-[color:var(--crm-text-secondary)]">{total === 0 ? 'Ask Designer & Engineering to add items to this BOM.' : 'Clear the search or choose another status.'}</p>
                  {total > 0 && <button onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }} className="text-xs text-blue-700 underline cursor-pointer">Clear filters</button>}
                </div>
              ) : (
                <table className="w-full min-w-[900px] text-xs">
                  <thead className="bg-[color:var(--crm-surface-subtle)] sticky top-0 z-10">
                    <tr className="text-left text-[10px] font-bold uppercase tracking-wide text-[color:var(--crm-text-secondary)]">
                      <th className="px-3 py-2.5 w-9">
                        <input type="checkbox" checked={allPicked} onChange={toggleAll} disabled={!pickable.length} aria-label="Select all shortages" />
                      </th>
                      <th className="px-3 py-2.5 w-10">#</th>
                      <th className="px-3 py-2.5">Item</th>
                      <th className="px-3 py-2.5 text-right">Required</th>
                      <th className="px-3 py-2.5 text-right">In store</th>
                      <th className="px-3 py-2.5 w-40">Coverage</th>
                      <th className="px-3 py-2.5 text-right">Shortage</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((it) => {
                      const ui = STATUS_UI[it.status];
                      const canPick = !it.isAvailable && !it.existingPrNumber;
                      return (
                        <tr key={it.id} className={`border-t border-[color:var(--crm-border-default)]/60 ${ui.row} ${picked.has(it.id) ? 'outline outline-1 outline-blue-400 -outline-offset-1' : ''}`}>
                          <td className="px-3 py-2.5">{canPick && <input type="checkbox" checked={picked.has(it.id)} onChange={() => toggle(it.id)} aria-label={`Select ${it.itemName}`} />}</td>
                          <td className="px-3 py-2.5 text-[color:var(--crm-text-secondary)] font-mono">{it.itemNo}</td>
                          <td className="px-3 py-2.5 max-w-[360px]">
                            <div className="font-semibold truncate" title={it.itemName}>{it.itemName}</div>
                            <div className="text-[10px] text-[color:var(--crm-text-secondary)] font-mono truncate">{it.partNumber} · {it.category}{it.specification ? ` · ${it.specification}` : ''}</div>
                            <div className="text-[10px] text-[color:var(--crm-text-tertiary)]">Bin {it.locationBin} · {it.warehouseName}</div>
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono">{num(it.requiredQty)} <span className="text-[10px] text-[color:var(--crm-text-secondary)]">{it.unit}</span></td>
                          <td className="px-3 py-2.5 text-right font-mono font-semibold">{num(it.usableStock)}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full ${ui.bar}`} style={{ width: `${it.coverage}%` }} /></div>
                              <span className="w-9 text-right font-mono text-[10px] text-[color:var(--crm-text-secondary)]">{it.coverage}%</span>
                            </div>
                          </td>
                          <td className={`px-3 py-2.5 text-right font-mono ${it.shortageQty > 0 ? 'text-rose-700 font-bold' : 'text-[color:var(--crm-text-tertiary)]'}`}>{it.shortageQty > 0 ? `-${num(it.shortageQty)}` : '0'}</td>
                          <td className="px-3 py-2.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${ui.pill}`}>
                              {it.status === 'IN_STOCK' ? <CheckCircle2 className="w-3 h-3" /> : it.status === 'PARTIAL' ? <CircleDashed className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                              {ui.label}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right whitespace-nowrap">
                            {it.isAvailable ? (
                              <Link href={`/store/material-issue?jobId=${currentBOM?.jobNumber}&bomId=${currentBOM?.bomNumber}&itemId=${it.partNumber}`} className="text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1">Issue <ArrowRight className="w-3 h-3" /></Link>
                            ) : it.existingPrNumber ? (
                              <Link href="/purchase/requisition" className="text-blue-700 font-semibold hover:underline inline-flex items-center gap-1" title="PR already raised">{it.existingPrNumber} <ExternalLink className="w-3 h-3" /></Link>
                            ) : (
                              <button onClick={() => openPR([it])} className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"><Send className="w-3 h-3" /> Send to PR</button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Selection bar */}
            {picked.size > 0 && (
              <div className="sticky bottom-3 z-20 mx-auto max-w-xl bg-slate-900 text-white rounded-2xl shadow-xl px-4 py-3 flex items-center justify-between gap-3">
                <span className="text-xs"><b>{picked.size}</b> item{picked.size > 1 ? 's' : ''} selected · {formatCurrency(verifiedItems.filter((i) => picked.has(i.id)).reduce((a, i) => a + i.shortageValue, 0))}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPicked(new Set())} className="text-xs underline text-slate-300 cursor-pointer">Clear</button>
                  <button onClick={() => openPR(verifiedItems.filter((i) => picked.has(i.id)))} className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer"><Send className="w-3.5 h-3.5" /> Send to PR</button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* PR modal */}
      {showPRModal && (
        <div onClick={() => setShowPRModal(false)} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl text-xs">
            <div className="flex items-start justify-between p-5 border-b border-[color:var(--crm-border-default)]">
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2"><Send className="w-4 h-4 text-rose-600" /> Create Purchase Requisition</h3>
                <p className="text-[11px] text-[color:var(--crm-text-secondary)] mt-0.5">For BOM <b className="font-mono">{currentBOM?.bomNumber}</b> · Project <b>{currentBOM ? projectNameOf(currentBOM) : ''}</b></p>
              </div>
              <button type="button" onClick={() => setShowPRModal(false)} className="p-1 cursor-pointer" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleConfirmSubmitPR} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block"><span className="font-semibold block mb-1">Priority *</span>
                  <select value={prPriority} onChange={(e) => setPrPriority(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-[color:var(--crm-border-default)] bg-white font-semibold">
                    <option value="Urgent">Urgent (production critical)</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
                  </select></label>
                <label className="block"><span className="font-semibold block mb-1">Required by *</span>
                  <input type="date" required value={prRequiredDate} onChange={(e) => setPrRequiredDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[color:var(--crm-border-default)] font-mono" /></label>
              </div>
              <div className="border border-[color:var(--crm-border-default)] rounded-xl overflow-hidden">
                <div className="max-h-56 overflow-auto">
                  <table className="w-full text-[11px]">
                    <thead className="bg-[color:var(--crm-surface-subtle)] sticky top-0"><tr className="text-left uppercase text-[10px] text-[color:var(--crm-text-secondary)]"><th className="p-2">Item</th><th className="p-2 text-right">Shortage</th><th className="p-2 text-right">Est. value</th></tr></thead>
                    <tbody>
                      {selectedItemsForPR.map((it) => (
                        <tr key={it.id} className="border-t border-[color:var(--crm-border-default)]/60">
                          <td className="p-2"><div className="font-semibold">{it.itemName}</div><div className="font-mono text-[10px] text-[color:var(--crm-text-secondary)]">{it.partNumber}</div></td>
                          <td className="p-2 text-right font-mono font-bold text-rose-700">{num(it.shortageQty)} {it.unit}</td>
                          <td className="p-2 text-right font-mono">{formatCurrency(it.shortageValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between px-3 py-2 bg-[color:var(--crm-surface-subtle)] font-bold">
                  <span>{selectedItemsForPR.length} item(s)</span><span className="font-mono">{formatCurrency(selectedItemsForPR.reduce((a, i) => a + i.shortageValue, 0))}</span>
                </div>
              </div>
              <label className="block"><span className="font-semibold block mb-1">Notes / justification</span>
                <textarea rows={2} value={prRemarks} onChange={(e) => setPrRemarks(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[color:var(--crm-border-default)]" /></label>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowPRModal(false)} className="px-4 py-2 rounded-xl border border-[color:var(--crm-border-default)] font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 cursor-pointer"><Send className="w-3.5 h-3.5" /> Create requisition</button>
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
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-[color:var(--crm-text-secondary)]">Loading BOM check…</div>}>
      <BOMMaterialVerificationContent />
    </React.Suspense>
  );
}
