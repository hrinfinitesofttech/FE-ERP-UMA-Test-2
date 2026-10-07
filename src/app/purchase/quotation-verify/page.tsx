'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { PurchaseRequisition, PRItem, PurchaseOrder } from '../../../types/purchase';
import { formatCurrency } from '../../../lib/utils';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Award,
  Building,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Plus,
  Info,
  CheckCircle,
  Truck,
  FileCheck2,
  ShoppingCart,
  Printer,
  ChevronRight,
  Clock,
  Send,
  ExternalLink,
  Package,
  Layers,
  ThumbsUp,
  X,
  Star,
  FileText,
  BadgePercent,
  Check,
} from 'lucide-react';

interface VendorQuote {
  id: string;
  vendorId: string;
  vendorName: string;
  quoteNumber: string;
  quoteDate: string;
  rating: number;
  deliveryDays: number;
  paymentTerms: string;
  technicalCompliance: string;
  warranty: string;
  freightTerms: string;
  isL1: boolean;
  notes: string;
  items: {
    itemCode: string;
    itemName: string;
    quantity: number;
    uom: string;
    unitRate: number;
    totalAmount: number;
    brand: string;
    isLowestRate: boolean;
  }[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
}

export default function VendorQuotationVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prParam = searchParams.get('prNumber') || searchParams.get('prId') || '';

  const {
    purchaseRequisitions,
    purchaseOrders,
    addPurchaseOrder,
    projectJobs,
    currentUser,
  } = useERP();

  const [mounted, setMounted] = useState(false);
  const [selectedPrId, setSelectedPrId] = useState<string>('');
  const [acceptedVendorId, setAcceptedVendorId] = useState<string>('VEND-JSL');
  const [showPOModal, setShowPOModal] = useState(false);
  const [poCreatedSuccess, setPoCreatedSuccess] = useState<PurchaseOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync selected PR from URL param or default
  useEffect(() => {
    if (purchaseRequisitions.length > 0) {
      if (prParam) {
        const found = purchaseRequisitions.find(
          (p) => p.prNumber === prParam || p.id === prParam
        );
        if (found) {
          setSelectedPrId(found.id);
          return;
        }
      }
      if (!selectedPrId) {
        setSelectedPrId(purchaseRequisitions[0].id);
      }
    }
  }, [purchaseRequisitions, prParam, selectedPrId]);

  const activePR = useMemo(() => {
    if (!selectedPrId && purchaseRequisitions.length > 0) {
      return purchaseRequisitions[0];
    }
    return (
      purchaseRequisitions.find((p) => p.id === selectedPrId || p.prNumber === selectedPrId) ||
      purchaseRequisitions[0] ||
      null
    );
  }, [purchaseRequisitions, selectedPrId]);

  // Linked Job
  const linkedJob = useMemo(() => {
    if (!activePR) return null;
    return projectJobs.find(
      (j) => j.id === activePR.jobId || j.jobNumber === activePR.jobId
    );
  }, [projectJobs, activePR]);

  // Generate 4 Vendor Quotations for the active PR's items
  const vendorQuotes: VendorQuote[] = useMemo(() => {
    const rawItems: Partial<PRItem>[] = (activePR && activePR.items && activePR.items.length > 0)
      ? activePR.items
      : [
          {
            itemCode: 'RAW-SS316L-04',
            itemName: 'Stainless Steel Plate 316L 10mm (TDC Compliant)',
            requiredQuantity: 4,
            unitOfMeasure: 'KG',
            estimatedUnitPrice: 150,
          },
          {
            itemCode: 'BO-FLG-300NB',
            itemName: 'SORF Flange 300 NB Class 150 ASTM A105',
            requiredQuantity: 2,
            unitOfMeasure: 'NOS',
            estimatedUnitPrice: 4200,
          },
        ];

    // Vendor 1: Tata Steel BSL Ltd
    const tataItems = rawItems.map((it) => {
      const base = Number(it.estimatedUnitPrice || 150);
      const rate = Math.round(base * 1.02); // ~+2%
      const qty = Number(it.requiredQuantity || (it as any).quantity || 1);
      const code = it.itemCode || (it as any).partNumber || 'ITEM-01';
      const name = it.itemName || (it as any).description || 'Raw Material';
      return {
        itemCode: code,
        partNumber: code,
        itemName: name,
        quantity: qty,
        uom: it.unitOfMeasure || (it as any).unit || 'KG',
        unitRate: rate,
        totalAmount: rate * qty,
        brand: 'TATA Steel (Khopoli)',
        isLowestRate: false,
      };
    });
    const tataSub = tataItems.reduce((s, i) => s + i.totalAmount, 0);

    // Vendor 2: Jindal Stainless Limited (Lowest L1)
    const jindalItems = rawItems.map((it) => {
      const base = Number(it.estimatedUnitPrice || 150);
      const rate = Math.round(base * 0.96); // ~-4% lowest
      const qty = Number(it.requiredQuantity || (it as any).quantity || 1);
      const code = it.itemCode || (it as any).partNumber || 'ITEM-01';
      const name = it.itemName || (it as any).description || 'Raw Material';
      return {
        itemCode: code,
        partNumber: code,
        itemName: name,
        quantity: qty,
        uom: it.unitOfMeasure || (it as any).unit || 'KG',
        unitRate: rate,
        totalAmount: rate * qty,
        brand: 'Jindal Stainless (Prime TDC)',
        isLowestRate: true,
      };
    });
    const jindalSub = jindalItems.reduce((s, i) => s + i.totalAmount, 0);

    // Vendor 3: Apex Fasteners & Flanges
    const apexItems = rawItems.map((it) => {
      const base = Number(it.estimatedUnitPrice || 150);
      const rate = Math.round(base * 1.05); // ~+5%
      const qty = Number(it.requiredQuantity || (it as any).quantity || 1);
      const code = it.itemCode || (it as any).partNumber || 'ITEM-01';
      const name = it.itemName || (it as any).description || 'Raw Material';
      return {
        itemCode: code,
        partNumber: code,
        itemName: name,
        quantity: qty,
        uom: it.unitOfMeasure || (it as any).unit || 'KG',
        unitRate: rate,
        totalAmount: rate * qty,
        brand: 'Apex Heavy Duty',
        isLowestRate: false,
      };
    });
    const apexSub = apexItems.reduce((s, i) => s + i.totalAmount, 0);

    // Vendor 4: Steel Authority of India (SAIL)
    const sailItems = rawItems.map((it) => {
      const base = Number(it.estimatedUnitPrice || 150);
      const rate = Math.round(base * 1.01); // ~+1%
      const qty = Number(it.requiredQuantity || (it as any).quantity || 1);
      const code = it.itemCode || (it as any).partNumber || 'ITEM-01';
      const name = it.itemName || (it as any).description || 'Raw Material';
      return {
        itemCode: code,
        partNumber: code,
        itemName: name,
        quantity: qty,
        uom: it.unitOfMeasure || (it as any).unit || 'KG',
        unitRate: rate,
        totalAmount: rate * qty,
        brand: 'SAIL Bhilai Standard',
        isLowestRate: false,
      };
    });
    const sailSub = sailItems.reduce((s, i) => s + i.totalAmount, 0);

    return [
      {
        id: 'VEND-TATA',
        vendorId: 'SUP-001',
        vendorName: 'Tata Steel BSL Limited',
        quoteNumber: `QT-TATA-${Date.now().toString().slice(-4)}`,
        quoteDate: '2026-10-05',
        rating: 4.9,
        deliveryDays: 3,
        paymentTerms: '30 Days Credit',
        technicalCompliance: '100% TDC Compliant (MTC 3.1 Attached)',
        warranty: '18 Months Guarantee',
        freightTerms: 'Included in Base Price',
        isL1: false,
        notes: 'Mill test certificates and ultrasonic test reports will be supplied.',
        items: tataItems,
        subtotal: tataSub,
        taxAmount: Math.round(tataSub * 0.18),
        grandTotal: Math.round(tataSub * 1.18),
      },
      {
        id: 'VEND-JSL',
        vendorId: 'SUP-002',
        vendorName: 'Jindal Stainless Limited',
        quoteNumber: `QT-JSL-${Date.now().toString().slice(-4)}`,
        quoteDate: '2026-10-05',
        rating: 4.8,
        deliveryDays: 4,
        paymentTerms: '45 Days Credit (Best Credit Terms)',
        technicalCompliance: '100% TDC & ASME Compliant (Prime Quality)',
        warranty: '24 Months Guarantee',
        freightTerms: 'Door Delivery to Sanand Store Included',
        isL1: true,
        notes: 'Official L1 Lowest Bidder. Stock available in Ahmedabad regional warehouse for immediate dispatch.',
        items: jindalItems,
        subtotal: jindalSub,
        taxAmount: Math.round(jindalSub * 0.18),
        grandTotal: Math.round(jindalSub * 1.18),
      },
      {
        id: 'VEND-APX',
        vendorId: 'SUP-003',
        vendorName: 'Apex Fasteners & Flanges Pvt Ltd',
        quoteNumber: `QT-APX-${Date.now().toString().slice(-4)}`,
        quoteDate: '2026-10-05',
        rating: 4.7,
        deliveryDays: 2,
        paymentTerms: '15 Days Credit',
        technicalCompliance: '98% Specification Met (Standard Stock)',
        warranty: '12 Months Guarantee',
        freightTerms: 'Express Freight Extra @ ₹1,500',
        isL1: false,
        notes: 'Fastest 48-Hour delivery guarantee if order placed before 4 PM.',
        items: apexItems,
        subtotal: apexSub,
        taxAmount: Math.round(apexSub * 0.18),
        grandTotal: Math.round(apexSub * 1.18),
      },
      {
        id: 'VEND-SAIL',
        vendorId: 'SUP-004',
        vendorName: 'Steel Authority of India Ltd (SAIL)',
        quoteNumber: `QT-SAIL-${Date.now().toString().slice(-4)}`,
        quoteDate: '2026-10-04',
        rating: 4.6,
        deliveryDays: 5,
        paymentTerms: '30 Days Credit',
        technicalCompliance: '100% Standard PSU Grade (IS 2062)',
        warranty: 'Standard Mill Warranty',
        freightTerms: 'Ex-Yard Baroda Depot',
        isL1: false,
        notes: 'Government approved PSU make. Dispatch subject to yard gate clearance.',
        items: sailItems,
        subtotal: sailSub,
        taxAmount: Math.round(sailSub * 0.18),
        grandTotal: Math.round(sailSub * 1.18),
      },
    ];
  }, [activePR]);

  const selectedVendorQuote = useMemo(() => {
    return vendorQuotes.find((v) => v.id === acceptedVendorId) || vendorQuotes[1];
  }, [vendorQuotes, acceptedVendorId]);

  const lowestVendor = useMemo(() => {
    return [...vendorQuotes].sort((a, b) => a.grandTotal - b.grandTotal)[0];
  }, [vendorQuotes]);

  const highestVendor = useMemo(() => {
    return [...vendorQuotes].sort((a, b) => b.grandTotal - a.grandTotal)[0];
  }, [vendorQuotes]);

  const totalSavings = useMemo(() => {
    if (!highestVendor || !lowestVendor) return 0;
    return highestVendor.grandTotal - lowestVendor.grandTotal;
  }, [highestVendor, lowestVendor]);

  const savingsPercent = useMemo(() => {
    if (!highestVendor || highestVendor.grandTotal === 0) return 0;
    return ((totalSavings / highestVendor.grandTotal) * 100).toFixed(1);
  }, [totalSavings, highestVendor]);

  // Check if a PO already exists for this PR
  const existingPO = useMemo(() => {
    if (!activePR) return null;
    return purchaseOrders.find(
      (po) =>
        (po as any).prNumber === activePR.prNumber ||
        po.jobId === activePR.jobId ||
        po.projectId === activePR.projectId
    );
  }, [purchaseOrders, activePR]);

  // Handle PO Generation
  const handleConfirmAndSendPO = () => {
    if (!activePR || !selectedVendorQuote) return;

    const poNumber = `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`;

    const poItems = selectedVendorQuote.items.map((it, idx) => ({
      id: `POI-${Date.now().toString().slice(-4)}-${idx + 1}`,
      poId: poNumber,
      itemCode: it.itemCode,
      partNumber: it.itemCode,
      itemName: it.itemName,
      description: `${it.itemName} (${it.brand})`,
      category: 'Raw Material' as any,
      quantity: it.quantity,
      uom: it.uom,
      unitPrice: it.unitRate,
      unitRate: it.unitRate,
      totalAmount: it.totalAmount,
      totalPrice: it.totalAmount,
      deliveryDate: new Date(Date.now() + selectedVendorQuote.deliveryDays * 86400000).toISOString().split('T')[0],
      notes: `Quoted in ${selectedVendorQuote.quoteNumber}`,
    }));

    const newPO: any = {
      id: poNumber,
      poNumber: poNumber,
      prNumber: activePR.prNumber,
      projectId: activePR.projectId || 'PRJ-2026-0001',
      jobId: activePR.jobId || 'JOB-2026-0067',
      jobNumber: activePR.jobId || 'JOB-2026-0067',
      supplierId: selectedVendorQuote.vendorId,
      supplierName: selectedVendorQuote.vendorName,
      supplierGstin: '24AAACJ1284Q1ZS',
      poDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + selectedVendorQuote.deliveryDays * 86400000).toISOString().split('T')[0],
      paymentTerms: selectedVendorQuote.paymentTerms,
      status: 'Submitted',
      items: poItems,
      subTotal: selectedVendorQuote.subtotal,
      taxTotal: selectedVendorQuote.taxAmount,
      grandTotal: selectedVendorQuote.grandTotal,
      remarks: `Purchase Order issued against L1 Approved Quotation ${selectedVendorQuote.quoteNumber} for PR ${activePR.prNumber}.`,
    };

    addPurchaseOrder(newPO);
    setPoCreatedSuccess(newPO);
    setShowPOModal(false);
    setToastMessage(`Purchase Order ${poNumber} generated and sent to ${selectedVendorQuote.vendorName}!`);
  };

  if (!mounted) {
    return (
      <div className="p-6 bg-[#FAF7F2] min-h-screen text-[#544B45] flex items-center justify-center">
        <div className="text-xs font-mono text-[#70665F]">Loading Vendor Quotation Verification...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl bg-emerald-800 text-white shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-200 border border-emerald-600">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <div className="text-xs font-semibold">{toastMessage}</div>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-800 border border-amber-500/20 text-xs font-mono font-bold">
              VENDOR QUOTATION VERIFICATION
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              L1 Comparative Evaluation
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#211B17] tracking-tight mt-1">
            Vendor Quotation Verification
          </h1>
          <p className="text-[#70665F] text-xs mt-1">
            Compare quotes from 4 vendors for PR shortage materials, verify rates & quality, accept L1 vendor, and dispatch Purchase Order (PO).
          </p>
        </div>

        {/* PR Selector Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] font-bold text-[#70665F] block">Select Purchase Requisition:</span>
            <select
              value={selectedPrId}
              onChange={(e) => setSelectedPrId(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-xs font-bold text-[#211B17] focus:outline-none focus:border-amber-600 cursor-pointer shadow-xs"
            >
              {purchaseRequisitions.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.prNumber} — {pr.jobId} ({pr.items?.length || 0} items)
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/purchase/requisition"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] text-[#211B17] hover:bg-[#F3ECE4] text-xs font-semibold transition"
          >
            <FileText className="w-3.5 h-3.5 text-[#8D7B70]" />
            PR Register
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between text-[#8D7B70] text-xs">
            <span>Requisition Ref</span>
            <FileSpreadsheet className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-base font-black text-[#211B17] mt-1 font-mono">{activePR?.prNumber || 'PR-2026-4469'}</div>
          <div className="text-[11px] text-amber-800 font-semibold mt-0.5">{activePR?.jobId || 'JOB-2026-0067'}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between text-[#8D7B70] text-xs">
            <span>Shortage Materials</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-base font-black text-[#211B17] mt-1">
            {activePR?.items?.length || 2} Line Items
          </div>
          <div className="text-[11px] text-[#70665F] mt-0.5">Awaiting Procurement</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between text-[#8D7B70] text-xs">
            <span>Quotes Received</span>
            <Building className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-black text-emerald-800 mt-1">4 of 4 Vendors</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">100% Response Received</div>
        </div>

        <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold">
            <span>Lowest Price (L1)</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-black text-emerald-900 mt-1 font-mono">
            {formatCurrency(lowestVendor?.grandTotal || 0)}
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-0.5 truncate">
            {lowestVendor?.vendorName}
          </div>
        </div>

        <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold">
            <span>Cost Savings</span>
            <BadgePercent className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-base font-black text-amber-900 mt-1 font-mono">
            {formatCurrency(totalSavings)}
          </div>
          <div className="text-[11px] text-amber-800 font-bold mt-0.5">
            {savingsPercent}% vs Highest Bid
          </div>
        </div>
      </div>

      {/* PO Created Success Banner */}
      {poCreatedSuccess && (
        <div className="bg-emerald-900 text-white p-5 rounded-2xl border border-emerald-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-extrabold text-sm uppercase tracking-wide text-emerald-300">
                Purchase Order Successfully Dispatched
              </span>
            </div>
            <div className="text-sm font-bold">
              PO Number <span className="font-mono text-emerald-200 underline">{poCreatedSuccess.poNumber}</span> sent to <span className="text-amber-300">{poCreatedSuccess.supplierName}</span> for ₹{poCreatedSuccess.grandTotal?.toLocaleString('en-IN')}.
            </div>
            <div className="text-xs text-emerald-200/90">
              When the vendor dispatches the items to your factory gate, inward them directly in Store GRN to turn your BOM verification items from Red to Green!
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/store/grn?poNumber=${poCreatedSuccess.poNumber}`}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2 shrink-0"
            >
              <Package className="w-4 h-4" />
              Go to Store GRN
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* 4 VENDORS COMPARATIVE EVALUATION CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-700" />
            <h2 className="text-sm font-black text-[#211B17] uppercase tracking-wide">
              Vendor Quotation Comparative Cards (4 Vendors)
            </h2>
          </div>
          <span className="text-xs text-[#70665F]">
            Selected Vendor: <strong className="text-amber-800">{selectedVendorQuote.vendorName}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {vendorQuotes.map((vendor) => {
            const isSelected = acceptedVendorId === vendor.id;
            return (
              <div
                key={vendor.id}
                onClick={() => setAcceptedVendorId(vendor.id)}
                className={`rounded-2xl p-5 border transition-all cursor-pointer relative flex flex-col justify-between shadow-xs ${
                  vendor.isL1
                    ? isSelected
                      ? 'bg-emerald-50/90 border-2 border-emerald-600 shadow-md ring-2 ring-emerald-600/20'
                      : 'bg-emerald-50/50 border-2 border-emerald-500/70 hover:border-emerald-600'
                    : isSelected
                    ? 'bg-white border-2 border-amber-600 shadow-md ring-2 ring-amber-600/20'
                    : 'bg-white border border-[#EBE3DB] hover:border-amber-400'
                }`}
              >
                {/* L1 Badge */}
                {vendor.isL1 && (
                  <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    L1 LOWEST PRICE
                  </div>
                )}

                <div>
                  {/* Vendor Top info */}
                  <div className="flex items-start justify-between gap-2 mt-1">
                    <div>
                      <div className="text-[10px] font-mono text-[#8D7B70] uppercase">{vendor.quoteNumber}</div>
                      <h3 className="text-sm font-bold text-[#211B17] mt-0.5 leading-snug">{vendor.vendorName}</h3>
                    </div>
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#FAF7F2] border border-[#EBE3DB] text-[10px] font-bold text-amber-700">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {vendor.rating}
                    </div>
                  </div>

                  {/* Price Banner */}
                  <div className="my-4 p-3 rounded-xl bg-white/90 border border-[#EBE3DB]">
                    <div className="text-[10px] text-[#70665F] uppercase font-bold">Total Quoted Value (incl. GST)</div>
                    <div className="text-xl font-black text-[#211B17] font-mono mt-0.5">
                      {formatCurrency(vendor.grandTotal)}
                    </div>
                    <div className="text-[10px] text-[#8D7B70] mt-0.5">
                      Subtotal: {formatCurrency(vendor.subtotal)} + GST: {formatCurrency(vendor.taxAmount)}
                    </div>
                  </div>

                  {/* Highlights list */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#70665F] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#8D7B70]" />
                        Delivery:
                      </span>
                      <span className={`font-bold ${vendor.deliveryDays <= 2 ? 'text-blue-700 font-extrabold' : 'text-[#211B17]'}`}>
                        {vendor.deliveryDays} Days {vendor.deliveryDays <= 2 && '(Fastest)'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#70665F] flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-[#8D7B70]" />
                        Payment:
                      </span>
                      <span className="font-semibold text-[#211B17] text-[11px] truncate max-w-[140px]" title={vendor.paymentTerms}>
                        {vendor.paymentTerms}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-1 pt-1 border-t border-[#EBE3DB]/60">
                      <span className="text-[#70665F] text-[11px]">Compliance:</span>
                      <span className="font-bold text-emerald-700 text-[11px] text-right">
                        {vendor.technicalCompliance}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selection & Approve Button */}
                <div className="mt-5 pt-3 border-t border-[#EBE3DB]">
                  {isSelected ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPOModal(true);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition"
                    >
                      <Check className="w-4 h-4" />
                      Approve & Generate PO
                    </button>
                  ) : (
                    <button
                      onClick={() => setAcceptedVendorId(vendor.id)}
                      className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#F3ECE4] border border-[#EBE3DB] text-[#211B17] text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      Select Quote
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED ITEM-BY-ITEM COMPARISON TABLE */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#EBE3DB] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-amber-700" />
            <h3 className="text-xs font-bold text-[#211B17] uppercase tracking-wider">
              Item-Wise Price & Brand Comparison Matrix
            </h3>
          </div>
          <span className="text-[11px] text-[#70665F]">
            Green cells indicate lowest quoted unit rate (L1)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-bold border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3">Item Code & Specification</th>
                <th className="p-3 text-center">Req Qty</th>
                <th className="p-3">Tata Steel</th>
                <th className="p-3 bg-emerald-50/70 border-x border-emerald-200">
                  <div className="flex items-center gap-1 text-emerald-900 font-extrabold">
                    <span>Jindal Stainless</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[9px]">L1</span>
                  </div>
                </th>
                <th className="p-3">Apex Fasteners</th>
                <th className="p-3">SAIL (Govt)</th>
                <th className="p-3 text-right">L1 Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {vendorQuotes[0]?.items?.map((it, idx) => {
                const tataRate = vendorQuotes[0]?.items[idx]?.unitRate || 0;
                const jindalRate = vendorQuotes[1]?.items[idx]?.unitRate || 0;
                const apexRate = vendorQuotes[2]?.items[idx]?.unitRate || 0;
                const sailRate = vendorQuotes[3]?.items[idx]?.unitRate || 0;

                const maxRate = Math.max(tataRate, apexRate, sailRate);
                const itemSaving = (maxRate - jindalRate) * it.quantity;

                return (
                  <tr key={it.itemCode} className="hover:bg-[#FAF7F2]/50 transition">
                    <td className="p-3">
                      <div className="font-bold text-[#211B17]">{it.itemName}</div>
                      <div className="text-[10px] font-mono text-[#70665F] mt-0.5">{it.itemCode}</div>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-[#211B17]">
                      {it.quantity} {it.uom}
                    </td>

                    {/* Tata */}
                    <td className="p-3 font-mono">
                      <div className="font-bold text-[#211B17]">₹{tataRate} /{it.uom}</div>
                      <div className="text-[10px] text-[#70665F]">Total: ₹{tataRate * it.quantity}</div>
                    </td>

                    {/* Jindal (L1) */}
                    <td className="p-3 font-mono bg-emerald-50/70 border-x border-emerald-200">
                      <div className="font-black text-emerald-800 flex items-center gap-1">
                        <span>₹{jindalRate} /{it.uom}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold">Total: ₹{jindalRate * it.quantity}</div>
                    </td>

                    {/* Apex */}
                    <td className="p-3 font-mono">
                      <div className="font-bold text-[#211B17]">₹{apexRate} /{it.uom}</div>
                      <div className="text-[10px] text-[#70665F]">Total: ₹{apexRate * it.quantity}</div>
                    </td>

                    {/* SAIL */}
                    <td className="p-3 font-mono">
                      <div className="font-bold text-[#211B17]">₹{sailRate} /{it.uom}</div>
                      <div className="text-[10px] text-[#70665F]">Total: ₹{sailRate * it.quantity}</div>
                    </td>

                    {/* Savings */}
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">
                      +₹{itemSaving.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#EBE3DB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-[#70665F]">
            Recommended Winner: <strong className="text-emerald-800">{lowestVendor.vendorName}</strong> ({lowestVendor.quoteNumber}) saving <strong className="text-emerald-800">₹{totalSavings.toLocaleString('en-IN')}</strong>.
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setAcceptedVendorId(lowestVendor.id);
                setShowPOModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Issue PO to {selectedVendorQuote.vendorName}
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRM PURCHASE ORDER (PO) MODAL */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-800 px-2 py-0.5 rounded font-bold">
                  STEP 3: ISSUE PURCHASE ORDER (PO)
                </span>
                <h2 className="text-base font-bold text-[#211B17] mt-1">
                  Confirm & Send PO to <span className="text-amber-800">{selectedVendorQuote.vendorName}</span>
                </h2>
              </div>
              <button
                onClick={() => setShowPOModal(false)}
                className="p-1 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <span className="text-[#70665F] block text-[10px] uppercase font-bold">Project / Job</span>
                <span className="font-bold text-amber-800 text-sm mt-0.5 block">{activePR?.jobId || 'JOB-2026-0067'}</span>
                <span className="text-[10px] text-[#70665F]">{activePR?.projectId || 'PRJ-2026-0001'}</span>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <span className="text-[#70665F] block text-[10px] uppercase font-bold">Quote Reference</span>
                <span className="font-mono font-bold text-[#211B17] text-sm mt-0.5 block">{selectedVendorQuote.quoteNumber}</span>
                <span className="text-[10px] text-emerald-700 font-bold">{selectedVendorQuote.isL1 ? 'L1 Lowest Price' : 'Selected Vendor'}</span>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <span className="text-[#70665F] block text-[10px] uppercase font-bold">Delivery Timeline</span>
                <span className="font-bold text-[#211B17] text-sm mt-0.5 block">{selectedVendorQuote.deliveryDays} Days</span>
                <span className="text-[10px] text-[#70665F]">Direct Factory Gate Delivery</span>
              </div>
            </div>

            {/* Line Items Preview */}
            <div className="border border-[#EBE3DB] rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left text-[#544B45]">
                <thead className="bg-[#FAF7F2] text-[#70665F] font-bold">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Agreed Rate</th>
                    <th className="p-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]">
                  {selectedVendorQuote.items.map((it) => (
                    <tr key={it.itemCode}>
                      <td className="p-2.5">
                        <div className="font-bold text-[#211B17]">{it.itemName}</div>
                        <div className="text-[10px] text-[#70665F]">{it.brand}</div>
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-[#211B17]">
                        {it.quantity} {it.uom}
                      </td>
                      <td className="p-2.5 text-right font-mono text-[#544B45]">₹{it.unitRate}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-[#211B17]">
                        ₹{it.totalAmount?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#FAF7F2] font-bold text-xs">
                    <td colSpan={3} className="p-2.5 text-right text-[#70665F]">
                      Subtotal + 18% GST:
                    </td>
                    <td className="p-2.5 text-right font-mono font-black text-emerald-800 text-sm">
                      {formatCurrency(selectedVendorQuote.grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <strong>Terms:</strong> {selectedVendorQuote.paymentTerms}. Goods must be inspected upon gate arrival against PO specifications.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EBE3DB]">
              <button
                type="button"
                onClick={() => setShowPOModal(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#EBE3DB] text-[#211B17] text-xs font-bold hover:bg-[#FAF7F2]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAndSendPO}
                className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-black shadow-md flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                Confirm & Send PO to {selectedVendorQuote.vendorName}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
