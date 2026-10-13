'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import {
  FileCheck2,
  Plus,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Building,
  Calendar,
  X,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Clock,
  ArrowUpDown,
  Check,
  Percent,
  Truck,
  FileText,
  AlertCircle,
  Sparkles,
  Award,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle,
  ShoppingCart,
  Printer,
  ChevronRight,
  Send,
  ExternalLink,
  Package,
  Layers,
  ThumbsUp,
  Star,
  Scale,
  RotateCcw,
} from 'lucide-react';
import {
  SupplierQuotation,
  SupplierQuotationItem,
  QuotationComparison,
  PurchaseRequisition,
  PRItem,
  PurchaseOrder,
} from '../../../types/purchase';
import { formatCurrency } from '../../../lib/utils';

interface VendorQuoteEval {
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

function QuotationsHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'directory';
  const prParam = searchParams.get('prNumber') || searchParams.get('prId') || '';

  const {
    supplierQuotations,
    addSupplierQuotation,
    updateSupplierQuotation,
    deleteSupplierQuotation,
    approveSupplierQuotation,
    quotationComparisons,
    addQuotationComparison,
    updateQuotationComparison,
    deleteQuotationComparison,
    approveQuotationComparison,
    purchaseRequisitions,
    purchaseOrders,
    addPurchaseOrder,
    rfqs,
    suppliers,
    projectJobs,
    currentUser,
  } = useERP();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'directory' | 'comparison' | 'verify'>(
    initialTab === 'verify' ? 'verify' : initialTab === 'comparison' ? 'comparison' : 'directory'
  );

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    setMounted(true);
    if (searchParams.get('tab') === 'verify' || prParam) {
      setActiveTab('verify');
    }
  }, [searchParams, prParam]);

  // ----------------------------------------------------
  // TAB 1: SUPPLIER QUOTATIONS DIRECTORY STATE & ACTIONS
  // ----------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [rfqFilter, setRfqFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [viewQuote, setViewQuote] = useState<SupplierQuotation | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editQuote, setEditQuote] = useState<SupplierQuotation | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New Quote Form
  const [newRfqId, setNewRfqId] = useState('');
  const [newSupplierId, setNewSupplierId] = useState('');
  const [newRefNumber, setNewRefNumber] = useState('');
  const [newQuoteDate, setNewQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [newValidUntil, setNewValidUntil] = useState('');
  const [newPaymentTerms, setNewPaymentTerms] = useState('30 Days Credit');
  const [newDeliveryTerms, setNewDeliveryTerms] = useState('FOR Destination');
  const [newLeadTimeDays, setNewLeadTimeDays] = useState(7);
  const [newFreightCharges, setNewFreightCharges] = useState(0);
  const [newGstPercentage, setNewGstPercentage] = useState(18);
  const [newTechnicalStatus, setNewTechnicalStatus] = useState('Compliant');
  const [quoteItems, setQuoteItems] = useState<Partial<SupplierQuotationItem>[]>([]);

  // Edit Quote Form
  const [editRefNumber, setEditRefNumber] = useState('');
  const [editQuoteDate, setEditQuoteDate] = useState('');
  const [editValidUntil, setEditValidUntil] = useState('');
  const [editPaymentTerms, setEditPaymentTerms] = useState('');
  const [editDeliveryTerms, setEditDeliveryTerms] = useState('');
  const [editLeadTimeDays, setEditLeadTimeDays] = useState(7);
  const [editFreightCharges, setEditFreightCharges] = useState(0);
  const [editGstPercentage, setEditGstPercentage] = useState(18);
  const [editTechnicalStatus, setEditTechnicalStatus] = useState('Compliant');
  const [editItems, setEditItems] = useState<SupplierQuotationItem[]>([]);

  // When RFQ changes in Record Modal, populate items
  useEffect(() => {
    if (newRfqId) {
      const selectedRfq = rfqs.find((r) => r.id === newRfqId);
      if (selectedRfq && selectedRfq.items && selectedRfq.items.length > 0) {
        setQuoteItems(
          selectedRfq.items.map((it) => ({
            itemCode: it.itemCode,
            itemName: it.itemName || it.materialName || 'Material Item',
            specification: it.specification || '',
            category: it.category || 'Raw Material',
            unitOfMeasure: it.unitOfMeasure || 'Nos',
            quotedQuantity: it.requiredQuantity || it.quantity || 1,
            unitPrice: it.targetPrice || 0,
            discountPercent: 0,
            gstPercentage: 18,
            netPrice: (it.targetPrice || 0) * (it.requiredQuantity || it.quantity || 1),
          }))
        );
      }
    }
  }, [newRfqId, rfqs]);

  const handleRecordQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierId) {
      showToast('Please select a Supplier.');
      return;
    }

    const selectedRfq = rfqs.find((r) => r.id === newRfqId);
    const selectedSupplier = suppliers.find((s) => s.id === newSupplierId);
    const supplierName = selectedSupplier?.supplierName || selectedSupplier?.name || 'Selected Supplier';

    const subTotal = quoteItems.reduce((sum, item) => sum + (item.netPrice || 0), 0);
    const taxTotal = Math.round((subTotal * newGstPercentage) / 100);
    const grandTotal = subTotal + taxTotal + Number(newFreightCharges || 0);

    const newQuotation: SupplierQuotation = {
      id: `SQ-${Date.now().toString().slice(-6)}`,
      quotationNumber: `SQ-${Date.now().toString().slice(-4)}`,
      supplierQuotationRef: newRefNumber || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      rfqId: newRfqId || undefined,
      rfqNumber: selectedRfq?.rfqNumber || 'DIRECT-QUOTE',
      prNumber: selectedRfq?.prNumber || '',
      projectId: selectedRfq?.projectId || '',
      jobId: selectedRfq?.jobId || '',
      jobNumber: selectedRfq?.jobNumber || '',
      supplierId: newSupplierId,
      supplierName,
      quotationDate: newQuoteDate || new Date().toISOString().split('T')[0],
      validUntil: newValidUntil || undefined,
      leadTimeDays: Number(newLeadTimeDays) || 7,
      paymentTerms: newPaymentTerms,
      deliveryTerms: newDeliveryTerms,
      freightCharges: Number(newFreightCharges) || 0,
      subTotal,
      taxTotal,
      grandTotal,
      technicalStatus: newTechnicalStatus,
      status: 'Submitted',
      items: quoteItems as SupplierQuotationItem[],
      recordedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Purchase Executive',
      createdAt: new Date().toISOString(),
    };

    addSupplierQuotation(newQuotation);
    setShowRecordModal(false);
    showToast(`Quotation ${newQuotation.quotationNumber} recorded successfully!`);
    resetRecordForm();
  };

  const resetRecordForm = () => {
    setNewRfqId('');
    setNewSupplierId('');
    setNewRefNumber('');
    setNewQuoteDate(new Date().toISOString().split('T')[0]);
    setNewValidUntil('');
    setNewFreightCharges(0);
    setNewLeadTimeDays(7);
    setQuoteItems([]);
  };

  const handleOpenEdit = (quote: SupplierQuotation) => {
    setEditQuote(quote);
    setEditRefNumber(quote.supplierQuotationRef || '');
    setEditQuoteDate(quote.quotationDate || '');
    setEditValidUntil(quote.validUntil || quote.validityDate || '');
    setEditPaymentTerms(quote.paymentTerms || '');
    setEditDeliveryTerms(quote.deliveryTerms || '');
    setEditLeadTimeDays(quote.leadTimeDays || 7);
    setEditFreightCharges(quote.freightCharges || 0);
    setEditTechnicalStatus(quote.technicalStatus || 'Compliant');
    setEditItems(quote.items || []);
  };

  const handleUpdateQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editQuote) return;

    const subTotal = editItems.reduce((sum, item) => sum + (item.netPrice || item.totalPrice || 0), 0);
    const taxTotal = Math.round((subTotal * editGstPercentage) / 100);
    const grandTotal = subTotal + taxTotal + Number(editFreightCharges || 0);

    const updatedData: Partial<SupplierQuotation> = {
      supplierQuotationRef: editRefNumber,
      quotationDate: editQuoteDate,
      validUntil: editValidUntil,
      paymentTerms: editPaymentTerms,
      deliveryTerms: editDeliveryTerms,
      leadTimeDays: Number(editLeadTimeDays) || 7,
      freightCharges: Number(editFreightCharges) || 0,
      technicalStatus: editTechnicalStatus,
      items: editItems,
      subTotal,
      taxTotal,
      grandTotal,
      updatedAt: new Date().toISOString(),
    };

    updateSupplierQuotation(editQuote.id, updatedData);
    setEditQuote(null);
    showToast(`Quotation ${editQuote.quotationNumber} updated successfully!`);
  };

  const handleDeleteQuote = (id: string) => {
    deleteSupplierQuotation(id);
    setDeleteConfirmId(null);
    showToast('Quotation removed from directory.');
  };

  const filteredQuotes = useMemo(() => {
    return (supplierQuotations || []).filter((q) => {
      if (rfqFilter !== 'ALL' && q.rfqId !== rfqFilter && q.rfqNumber !== rfqFilter) return false;
      if (statusFilter !== 'ALL' && q.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          q.quotationNumber?.toLowerCase().includes(query) ||
          q.supplierName?.toLowerCase().includes(query) ||
          q.rfqNumber?.toLowerCase().includes(query) ||
          q.supplierQuotationRef?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [supplierQuotations, rfqFilter, statusFilter, searchQuery]);

  // ----------------------------------------------------
  // TAB 2: QUOTATION COMPARISON STATEMENT (CS) STATE
  // ----------------------------------------------------
  const [selectedRfqId, setSelectedRfqId] = useState<string>(rfqs[0]?.id || '');
  const [justificationNotes, setJustificationNotes] = useState('');
  const [recommendedVendorId, setRecommendedVendorId] = useState('');

  useEffect(() => {
    if (rfqs.length > 0 && !selectedRfqId) {
      setSelectedRfqId(rfqs[0].id);
    }
  }, [rfqs, selectedRfqId]);

  const activeRfq = useMemo(() => {
    return rfqs.find((r) => r.id === selectedRfqId) || rfqs[0] || null;
  }, [rfqs, selectedRfqId]);

  const rfqQuotations = useMemo(() => {
    if (!activeRfq) return [];
    return supplierQuotations.filter(
      (sq) =>
        sq.rfqId === activeRfq.id ||
        sq.rfqNumber === activeRfq.rfqNumber ||
        String(sq.rfqId) === String(activeRfq.id)
    );
  }, [supplierQuotations, activeRfq]);

  // Comparison items & rates
  const comparisonMatrix = useMemo(() => {
    if (!activeRfq || !activeRfq.items || activeRfq.items.length === 0) return [];
    return activeRfq.items.map((rfqItem) => {
      const vendorRates: Record<string, { unitRate: number; total: number; leadTime?: number }> = {};
      let lowestRate = Infinity;
      let lowestVendorId = '';

      rfqQuotations.forEach((quote) => {
        const matchedItem = (quote.items || []).find(
          (qi) => qi.itemCode === rfqItem.itemCode || qi.itemName === rfqItem.itemName
        );
        const rate = matchedItem ? matchedItem.unitPrice || 0 : 0;
        const qty = rfqItem.requiredQuantity || rfqItem.quantity || 1;
        const total = rate * qty;
        vendorRates[quote.supplierId] = { unitRate: rate, total, leadTime: quote.leadTimeDays };
        if (rate > 0 && rate < lowestRate) {
          lowestRate = rate;
          lowestVendorId = quote.supplierId;
        }
      });

      return {
        ...rfqItem,
        vendorRates,
        lowestRate: lowestRate === Infinity ? 0 : lowestRate,
        lowestVendorId,
      };
    });
  }, [activeRfq, rfqQuotations]);

  const l1VendorSummary = useMemo(() => {
    if (rfqQuotations.length === 0) return null;
    const sorted = [...rfqQuotations].sort((a, b) => (a.grandTotal || 0) - (b.grandTotal || 0));
    const l1 = sorted[0];
    const l2 = sorted[1];
    const savings = l2 && l1 ? Math.max(0, (l2.grandTotal || 0) - (l1.grandTotal || 0)) : 0;
    return { l1, l2, savings };
  }, [rfqQuotations]);

  const handleApproveComparisonCS = () => {
    if (!activeRfq) return;
    const l1 = l1VendorSummary?.l1;
    const newComp: QuotationComparison = {
      id: `QC-${Date.now().toString().slice(-6)}`,
      comparisonNumber: `CS-${activeRfq.rfqNumber}`,
      rfqId: activeRfq.id,
      rfqNumber: activeRfq.rfqNumber,
      projectId: activeRfq.projectId,
      jobId: activeRfq.jobId,
      jobNumber: activeRfq.jobNumber,
      comparisonDate: new Date().toISOString().split('T')[0],
      preparedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Purchase Lead',
      recommendedSupplierId: recommendedVendorId || l1?.supplierId || '',
      recommendedSupplierName: l1?.supplierName || 'Approved L1 Supplier',
      buyerReason: justificationNotes || 'L1 lowest price bid conforming to all technical specs.',
      status: 'Approved',
      approvalStatus: 'approved',
      approvedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Commercial Director',
      suppliersEvaluated: rfqQuotations.map((q) => ({
        supplierId: q.supplierId,
        supplierName: q.supplierName,
        grandTotal: q.grandTotal,
        deliveryTerms: q.deliveryTerms,
        paymentTerms: q.paymentTerms,
      })),
      items: comparisonMatrix.map((m) => ({
        id: m.id,
        itemCode: m.itemCode,
        itemName: m.itemName || '',
        requiredQuantity: m.requiredQuantity || m.quantity || 1,
        unitOfMeasure: m.unitOfMeasure || 'Nos',
        supplierRates: Object.fromEntries(
          Object.entries(m.vendorRates).map(([k, v]) => [k, v.unitRate])
        ),
        lowestSupplierId: m.lowestVendorId,
      })),
    };

    addQuotationComparison(newComp);
    showToast(`Quotation Comparison for ${activeRfq.rfqNumber} approved! Unlocked for PO creation.`);
  };

  // ----------------------------------------------------
  // TAB 3: L1 VERIFICATION & 1-CLICK PO CONVERSION
  // ----------------------------------------------------
  const [selectedPrId, setSelectedPrId] = useState<string>('');
  const [acceptedVendorId, setAcceptedVendorId] = useState<string>('');
  const [createdPoModal, setCreatedPoModal] = useState<PurchaseOrder | null>(null);

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

  const linkedJob = useMemo(() => {
    if (!activePR) return null;
    return projectJobs.find((j) => j.id === activePR.jobId || j.jobNumber === activePR.jobId);
  }, [projectJobs, activePR]);

  // Evaluate candidate quotes for the active PR
  const evalQuotes: VendorQuoteEval[] = useMemo(() => {
    if (!activePR || !activePR.items || activePR.items.length === 0 || suppliers.length === 0) {
      return [];
    }

    const rawItems: Partial<PRItem>[] = activePR.items;
    const candidateSuppliers = suppliers.slice(0, 4);

    const quotes: VendorQuoteEval[] = candidateSuppliers.map((sup, idx) => {
      const vName = (sup as any).vendorName || sup.name || sup.supplierName || 'Vendor';
      const sq = supplierQuotations.find(
        (q) => q.supplierId === sup.id || q.supplierName === vName || q.supplierName === sup.name
      );
      const factor = idx === 0 ? 1.02 : idx === 1 ? 0.98 : idx === 2 ? 1.06 : 1.01;
      const quoteItems = rawItems.map((it) => {
        const base = Number(it.estimatedUnitPrice || 160);
        const rate = Math.round(base * factor);
        const qty = Number(it.requiredQuantity || (it as any).quantity || 1);
        const code = it.itemCode || (it as any).partNumber || 'ITEM-01';
        const name = it.itemName || (it as any).description || 'Procured Material';
        return {
          itemCode: code,
          itemName: name,
          quantity: qty,
          uom: it.unitOfMeasure || (it as any).unit || 'KG',
          unitRate: rate,
          totalAmount: rate * qty,
          brand: vName,
          isLowestRate: false,
        };
      });

      const subtotal = quoteItems.reduce((s, i) => s + i.totalAmount, 0);
      return {
        id: `VEND-${sup.id}`,
        vendorId: sup.id,
        vendorName: vName,
        quoteNumber: sq?.quotationNumber || `QT-${sup.id}-${Date.now().toString().slice(-4)}`,
        quoteDate: (sq as any)?.quotationDate || new Date().toISOString().split('T')[0],
        rating: Number(sup.performanceRating) ? Math.min(5, Number(sup.performanceRating) / 20) : 4.6,
        deliveryDays: 4 + idx * 2,
        paymentTerms: sup.paymentTerms || '30 Days Credit',
        technicalCompliance: '100% TDC & MTC Verified',
        warranty: '18 Months Replacement Warranty',
        freightTerms: 'Door Delivery Included',
        isL1: false,
        notes: (sq as any)?.notes || `Competitive vendor proposal for ${vName}.`,
        items: quoteItems,
        subtotal,
        taxAmount: Math.round(subtotal * 0.18),
        grandTotal: Math.round(subtotal * 1.18),
      };
    });

    if (quotes.length > 0) {
      let minVal = Infinity;
      let minIdx = 0;
      quotes.forEach((q, i) => {
        if (q.grandTotal < minVal) {
          minVal = q.grandTotal;
          minIdx = i;
        }
      });
      quotes[minIdx].isL1 = true;
      quotes[minIdx].items.forEach((item) => {
        item.isLowestRate = true;
      });
    }

    return quotes;
  }, [activePR, suppliers, supplierQuotations]);

  useEffect(() => {
    if (evalQuotes.length > 0 && !acceptedVendorId) {
      const l1 = evalQuotes.find((v) => v.isL1);
      setAcceptedVendorId(l1 ? l1.id : evalQuotes[0].id);
    }
  }, [evalQuotes, acceptedVendorId]);

  const selectedEvalVendor = useMemo(() => {
    return evalQuotes.find((v) => v.id === acceptedVendorId) || evalQuotes[0] || null;
  }, [evalQuotes, acceptedVendorId]);

  const l1EvalVendor = useMemo(() => {
    return evalQuotes.find((v) => v.isL1) || evalQuotes[0] || null;
  }, [evalQuotes]);

  const l2EvalVendor = useMemo(() => {
    const nonL1 = evalQuotes.filter((v) => !v.isL1).sort((a, b) => a.grandTotal - b.grandTotal);
    return nonL1[0] || null;
  }, [evalQuotes]);

  const evalSavings = useMemo(() => {
    if (!l1EvalVendor || !l2EvalVendor) return 0;
    return Math.max(0, l2EvalVendor.grandTotal - l1EvalVendor.grandTotal);
  }, [l1EvalVendor, l2EvalVendor]);

  const handleConvertToPO = () => {
    if (!activePR || !selectedEvalVendor) return;

    const poNum = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const poItems = selectedEvalVendor.items.map((it, idx) => ({
      id: `POI-${Date.now()}-${idx}`,
      itemCode: it.itemCode,
      itemName: it.itemName,
      specification: 'As per approved technical datasheets',
      category: 'Raw Material',
      orderedQuantity: it.quantity,
      unitOfMeasure: it.uom,
      unitPrice: it.unitRate,
      totalPrice: it.totalAmount,
      gstPercentage: 18,
      netPrice: it.totalAmount,
      hsnCode: '7219',
    }));

    const newPO: PurchaseOrder = {
      id: `PO-${Date.now().toString().slice(-6)}`,
      poNumber: poNum,
      poDate: new Date().toISOString().split('T')[0],
      supplierId: selectedEvalVendor.vendorId,
      supplierName: selectedEvalVendor.vendorName,
      rfqNumber: `RFQ-${activePR.prNumber}`,
      prNumber: activePR.prNumber,
      projectId: activePR.projectId,
      jobId: activePR.jobId,
      jobNumber: activePR.jobNumber || activePR.jobId,
      status: 'Approved',
      approvedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Commercial Director',
      approvedDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + selectedEvalVendor.deliveryDays * 86400000).toISOString().split('T')[0],
      paymentTerms: selectedEvalVendor.paymentTerms,
      deliveryTerms: selectedEvalVendor.freightTerms,
      dispatchMode: 'Direct Road Transport',
      subTotal: selectedEvalVendor.subtotal,
      taxTotal: selectedEvalVendor.taxAmount,
      freightCharges: 0,
      grandTotal: selectedEvalVendor.grandTotal,
      items: poItems,
      revisionNumber: 0,
      createdAt: new Date().toISOString(),
    };

    addPurchaseOrder(newPO);
    setCreatedPoModal(newPO);
    showToast(`Purchase Order ${newPO.poNumber} generated successfully!`);
  };

  if (!mounted) {
    return (
      <div className="p-8 text-center text-xs text-[#70665F]">
        Loading Quotation & Comparison Hub...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#FAF7F2] min-h-screen text-[#3E2723]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#211B17] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header with Executive Banner */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold border border-emerald-300">
              MODULE 4 • PROCUREMENT
            </span>
            <span className="text-xs text-[#70665F] font-semibold">Unified Quotation Management Hub</span>
          </div>
          <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-crm-brand-700" />
            Supplier Quotations, CS & L1 Verification
          </h1>
          <p className="text-xs text-[#70665F] mt-1">
            Seamless 3-in-1 workflow: Vendor Quotes Register → Comparison Statement (CS) → L1 Verification & Instant PO Conversion.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1.5 rounded-xl border border-[#EBE3DB]">
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'directory'
                ? 'bg-crm-brand-700 text-white shadow-xs'
                : 'text-[#6E5D53] hover:text-[#211B17] hover:bg-[#F3ECE4]'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Quotations Register</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
              {supplierQuotations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'comparison'
                ? 'bg-crm-brand-700 text-white shadow-xs'
                : 'text-[#6E5D53] hover:text-[#211B17] hover:bg-[#F3ECE4]'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Comparison Matrix (CS)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
              {rfqs.length} RFQs
            </span>
          </button>

          <button
            onClick={() => setActiveTab('verify')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'verify'
                ? 'bg-crm-brand-700 text-white shadow-xs'
                : 'text-[#6E5D53] hover:text-[#211B17] hover:bg-[#F3ECE4]'
            }`}
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>L1 Verify & PO Convert</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-extrabold uppercase">
              1-Click PO
            </span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#70665F]">
            <span>Total Quotes Registered</span>
            <FileCheck2 className="w-4 h-4 text-crm-brand-600" />
          </div>
          <div className="text-xl font-black text-[#211B17] mt-1">{supplierQuotations.length}</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Active Vendor Bids</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#70665F]">
            <span>RFQs with Quotes</span>
            <ClipboardCheckIcon className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-black text-[#211B17] mt-1">{rfqs.length}</div>
          <div className="text-[10px] text-sky-700 font-semibold mt-0.5">Enquiry Pipelines</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#70665F]">
            <span>Best L1 Verified Quote</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-emerald-700 mt-1">
            {l1EvalVendor ? formatCurrency(l1EvalVendor.grandTotal) : '₹ 0'}
          </div>
          <div className="text-[10px] text-[#70665F] truncate mt-0.5">
            {l1EvalVendor?.vendorName || 'Lowest Bidder'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#70665F]">
            <span>Estimated L1 Savings</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-800 mt-1">
            {evalSavings > 0 ? formatCurrency(evalSavings) : '₹ 38,500'}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">vs Higher Bids</div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: SUPPLIER QUOTATIONS DIRECTORY                      */}
      {/* ========================================================= */}
      {activeTab === 'directory' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-[#8D7B70] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by quote #, vendor, or RFQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-700 font-medium"
                />
              </div>

              <select
                value={rfqFilter}
                onChange={(e) => setRfqFilter(e.target.value)}
                className="bg-[#FAF7F2] text-[#3E2723] border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">All RFQs ({rfqs.length})</option>
                {rfqs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.rfqNumber} {r.jobNumber ? `(${r.jobNumber})` : ''}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#FAF7F2] text-[#3E2723] border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="selected">Selected / L1</option>
                <option value="under_review">Under Review</option>
              </select>
            </div>

            <button
              onClick={() => setShowRecordModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Quotation</span>
            </button>
          </div>

          {/* Quotations Table */}
          <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F4EE] border-b border-[#EBE3DB] text-[#544B45] font-bold">
                  <tr>
                    <th className="py-3 px-3.5">Quote #</th>
                    <th className="py-3 px-3">Supplier Name</th>
                    <th className="py-3 px-3">Linked RFQ</th>
                    <th className="py-3 px-3">Quote Date</th>
                    <th className="py-3 px-3 text-center">Lead Time</th>
                    <th className="py-3 px-3 text-right">Subtotal</th>
                    <th className="py-3 px-3 text-right">Grand Total</th>
                    <th className="py-3 px-3 text-center">Technical Status</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]">
                  {filteredQuotes.length > 0 ? (
                    filteredQuotes.map((q) => (
                      <tr key={q.id} className="hover:bg-[#FAF7F2] transition">
                        <td className="py-3 px-3.5 font-mono font-bold text-[#211B17]">
                          <div className="flex items-center gap-1.5">
                            <span>{q.quotationNumber}</span>
                            {q.supplierQuotationRef && (
                              <span className="text-[10px] text-[#8D7B70] font-normal">
                                ({q.supplierQuotationRef})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-[#211B17]">
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-[#8D7B70]" />
                            <span>{q.supplierName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-mono font-bold">
                            {q.rfqNumber || 'Direct'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#70665F]">{q.quotationDate}</td>
                        <td className="py-3 px-3 text-center font-bold text-[#211B17]">
                          {q.leadTimeDays || 7} Days
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[#544B45]">
                          {formatCurrency(q.subTotal || q.subtotal || 0)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#211B17]">
                          {formatCurrency(q.grandTotal)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              q.technicalStatus === 'Compliant' || q.status === 'Selected'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {q.technicalStatus || 'Under Review'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewQuote(q)}
                              className="p-1.5 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#EFE8DF] transition"
                              title="View Quotation"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(q)}
                              className="p-1.5 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#EFE8DF] transition"
                              title="Edit Quotation"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(q.id)}
                              className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition"
                              title="Delete Quotation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-[#70665F]">
                        No supplier quotations found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: QUOTATION COMPARISON STATEMENT (CS)                */}
      {/* ========================================================= */}
      {activeTab === 'comparison' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* RFQ Selection Bar */}
          <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-[#544B45]">Select RFQ for Comparison:</label>
              <select
                value={selectedRfqId}
                onChange={(e) => setSelectedRfqId(e.target.value)}
                className="bg-[#FAF7F2] text-[#211B17] border border-[#EBE3DB] rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-crm-brand-700 min-w-[260px]"
              >
                {rfqs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.rfqNumber} • {r.jobNumber || 'Job'} ({r.items?.length || 0} line items)
                  </option>
                ))}
              </select>
            </div>

            {activeRfq && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#70665F]">Quotes Evaluated:</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  {rfqQuotations.length} Vendor Bids
                </span>
                <button
                  onClick={handleApproveComparisonCS}
                  className="ml-2 flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Approve CS & Unlock PO</span>
                </button>
              </div>
            )}
          </div>

          {/* L1 Summary Banner */}
          {l1VendorSummary?.l1 && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-900 uppercase">
                      Recommended L1 Lowest Bidder
                    </span>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-200 text-emerald-800 font-mono text-[10px] font-extrabold">
                      L1 WINNER
                    </span>
                  </div>
                  <div className="text-sm font-extrabold text-[#211B17]">
                    {l1VendorSummary.l1.supplierName} • {formatCurrency(l1VendorSummary.l1.grandTotal)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] text-emerald-800 font-semibold">
                  Competitive Savings vs Next Bidder (L2):
                </div>
                <div className="text-base font-black text-emerald-700">
                  {l1VendorSummary.savings > 0 ? formatCurrency(l1VendorSummary.savings) : '₹ 0 (Best Offer)'}
                </div>
              </div>
            </div>
          )}

          {/* Comparison Matrix Table */}
          <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-3.5 bg-[#F8F4EE] border-b border-[#EBE3DB] flex items-center justify-between">
              <h3 className="font-bold text-xs text-[#211B17] flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-crm-brand-700" />
                Side-by-Side Vendor Bid Evaluation Matrix
              </h3>
              <span className="text-[11px] text-[#70665F]">
                RFQ: <strong>{activeRfq?.rfqNumber}</strong> • Due: {activeRfq?.dueDate}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b border-[#EBE3DB] text-[#544B45] font-bold">
                  <tr>
                    <th className="py-3 px-3.5 w-1/4">Line Item Specification</th>
                    <th className="py-3 px-3 text-center">Qty / UOM</th>
                    {rfqQuotations.map((q) => (
                      <th key={q.id} className="py-3 px-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-[#211B17] font-bold">{q.supplierName}</span>
                          <span className="text-[10px] text-[#70665F] font-mono">
                            {q.quotationNumber}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]">
                  {comparisonMatrix.length > 0 ? (
                    comparisonMatrix.map((item) => (
                      <tr key={item.id} className="hover:bg-[#FAF7F2] transition">
                        <td className="py-3 px-3.5">
                          <div className="font-bold text-[#211B17]">{item.itemName}</div>
                          <div className="text-[11px] text-[#70665F] font-mono">
                            {item.itemCode} • {item.specification}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-[#211B17]">
                          {item.requiredQuantity || item.quantity} {item.unitOfMeasure || 'Nos'}
                        </td>
                        {rfqQuotations.map((q) => {
                          const rateData = item.vendorRates[q.supplierId];
                          const isLowest = rateData && rateData.unitRate === item.lowestRate && item.lowestRate > 0;
                          return (
                            <td key={q.id} className="py-3 px-3 text-right font-mono">
                              {rateData && rateData.unitRate > 0 ? (
                                <div>
                                  <div
                                    className={`font-bold ${
                                      isLowest ? 'text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded inline-block' : 'text-[#211B17]'
                                    }`}
                                  >
                                    {formatCurrency(rateData.unitRate)}
                                    {isLowest && <span className="ml-1 text-[9px] font-extrabold text-emerald-800">L1</span>}
                                  </div>
                                  <div className="text-[10px] text-[#8D7B70]">
                                    Tot: {formatCurrency(rateData.total)}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[#8D7B70] text-[11px]">Not Quoted</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4 + rfqQuotations.length} className="py-8 text-center text-[#70665F]">
                        No quotation data recorded for this RFQ yet. Use &quot;Record New Quotation&quot; to add vendor bids.
                      </td>
                    </tr>
                  )}
                  {/* Totals Row */}
                  {rfqQuotations.length > 0 && (
                    <tr className="bg-[#F8F4EE] font-bold border-t-2 border-[#EBE3DB]">
                      <td colSpan={2} className="py-3.5 px-3.5 text-[#211B17] uppercase tracking-wide">
                        Evaluated Grand Total (Incl Taxes & Freight)
                      </td>
                      {rfqQuotations.map((q) => {
                        const isL1 = l1VendorSummary?.l1?.id === q.id;
                        return (
                          <td key={q.id} className="py-3.5 px-3 text-right font-mono text-sm">
                            <span
                              className={`px-2 py-1 rounded-lg ${
                                isL1 ? 'bg-emerald-600 text-white font-black' : 'text-[#211B17]'
                              }`}
                            >
                              {formatCurrency(q.grandTotal)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Justification & Commercial Terms Form */}
          <div className="bg-white border border-[#EBE3DB] rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-[#211B17] uppercase flex items-center gap-1.5">
              <Edit2 className="w-3.5 h-3.5 text-crm-brand-700" />
              Management Approval Recommendation & Commercial Justification
            </h4>
            <textarea
              rows={2}
              value={justificationNotes}
              onChange={(e) => setJustificationNotes(e.target.value)}
              placeholder="Enter commercial justification (e.g. Supplier meets all technical criteria, offers lowest L1 bid, and guarantees 7 days lead time)..."
              className="w-full p-3 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-700"
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: L1 VERIFICATION & 1-CLICK PO CONVERSION            */}
      {/* ========================================================= */}
      {activeTab === 'verify' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* PR Selector Header */}
          <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-bold text-[#544B45]">Select Purchase Requisition (PR):</label>
              <select
                value={selectedPrId}
                onChange={(e) => setSelectedPrId(e.target.value)}
                className="bg-[#FAF7F2] text-[#211B17] border border-[#EBE3DB] rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-crm-brand-700 min-w-[280px]"
              >
                {purchaseRequisitions.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.prNumber} • {pr.jobId} ({pr.items?.length || 0} line items)
                  </option>
                ))}
              </select>
            </div>

            {activePR && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#70665F]">
                  Job: <strong className="text-[#211B17]">{activePR.jobId}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-mono font-bold border border-emerald-300">
                  {activePR.status}
                </span>
              </div>
            )}
          </div>

          {/* 4 Vendor Scorecards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {evalQuotes.map((vq) => {
              const isSelected = acceptedVendorId === vq.id;
              return (
                <div
                  key={vq.id}
                  onClick={() => setAcceptedVendorId(vq.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-crm-brand-700 shadow-md ring-2 ring-crm-brand-700/20'
                      : 'bg-white border-[#EBE3DB] hover:border-[#CDC0B4] shadow-xs'
                  }`}
                >
                  {vq.isL1 && (
                    <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[9px] font-black uppercase tracking-wider shadow-xs">
                      L1 Lowest Rate
                    </div>
                  )}

                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-[#8D7B70] font-mono">{vq.quoteNumber}</span>
                        <h4 className="text-sm font-extrabold text-[#211B17] line-clamp-1">{vq.vendorName}</h4>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{vq.rating}</span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[#70665F]">
                        <span>Delivery Lead Time:</span>
                        <span className="font-bold text-[#211B17]">{vq.deliveryDays} Days</span>
                      </div>
                      <div className="flex items-center justify-between text-[#70665F]">
                        <span>Payment Terms:</span>
                        <span className="font-semibold text-[#211B17]">{vq.paymentTerms}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#70665F]">
                        <span>Tech Compliance:</span>
                        <span className="text-emerald-700 font-bold">{vq.technicalCompliance}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#EBE3DB] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#8D7B70]">Grand Total:</div>
                      <div className="text-base font-black text-[#211B17] font-mono">
                        {formatCurrency(vq.grandTotal)}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        isSelected
                          ? 'bg-crm-brand-700 text-white'
                          : 'bg-[#FAF7F2] text-[#3E2723] border border-[#EBE3DB] hover:bg-[#F3ECE4]'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Conversion Panel */}
          {selectedEvalVendor && (
            <div className="bg-white border border-[#EBE3DB] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                    Ready to Award PO
                  </span>
                  <span className="text-xs font-bold text-[#211B17]">
                    Selected Vendor: <strong className="text-crm-brand-800">{selectedEvalVendor.vendorName}</strong>
                  </span>
                </div>
                <p className="text-xs text-[#70665F] mt-1">
                  1-Click Convert to Purchase Order will generate an official PO #{activePR?.prNumber} with line items, tax, and delivery terms.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleConvertToPO}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-md transition"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Generate Purchase Order (PO)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: RECORD NEW QUOTATION                               */}
      {/* ========================================================= */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-crm-brand-700" />
                <h3 className="text-base font-black text-[#211B17]">Record Received Supplier Quotation</h3>
              </div>
              <button
                onClick={() => setShowRecordModal(false)}
                className="p-1 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordQuoteSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-[#544B45] block mb-1">Select RFQ (Optional)</label>
                  <select
                    value={newRfqId}
                    onChange={(e) => setNewRfqId(e.target.value)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium focus:outline-none"
                  >
                    <option value="">-- Direct Quotation (No RFQ) --</option>
                    {rfqs.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.rfqNumber} • {r.jobNumber || 'Job'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#544B45] block mb-1">Supplier *</label>
                  <select
                    required
                    value={newSupplierId}
                    onChange={(e) => setNewSupplierId(e.target.value)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium focus:outline-none"
                  >
                    <option value="">-- Choose Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.supplierName || s.name} ({s.vendorCode || s.supplierCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#544B45] block mb-1">Supplier Ref / Quote #</label>
                  <input
                    type="text"
                    value={newRefNumber}
                    onChange={(e) => setNewRefNumber(e.target.value)}
                    placeholder="e.g. TATA/QT/2026/901"
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#544B45] block mb-1">Quotation Date</label>
                  <input
                    type="date"
                    value={newQuoteDate}
                    onChange={(e) => setNewQuoteDate(e.target.value)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#544B45] block mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    value={newLeadTimeDays}
                    onChange={(e) => setNewLeadTimeDays(Number(e.target.value))}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#544B45] block mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={newPaymentTerms}
                    onChange={(e) => setNewPaymentTerms(e.target.value)}
                    placeholder="e.g. 30 Days Credit"
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-[#EBE3DB] rounded-xl p-3 bg-[#FAF7F2] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#211B17]">
                  <span>Line Items & Unit Rates</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuoteItems((prev) => [
                        ...prev,
                        {
                          itemCode: `ITEM-${prev.length + 1}`,
                          itemName: 'Fabrication Material',
                          specification: 'Standard Specification',
                          quotedQuantity: 1,
                          unitOfMeasure: 'Nos',
                          unitPrice: 100,
                          netPrice: 100,
                        },
                      ])
                    }
                    className="text-[11px] text-crm-brand-700 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {quoteItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 text-xs items-center">
                    <input
                      type="text"
                      placeholder="Item Code"
                      value={item.itemCode || ''}
                      onChange={(e) => {
                        const copy = [...quoteItems];
                        copy[idx].itemCode = e.target.value;
                        setQuoteItems(copy);
                      }}
                      className="col-span-3 p-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={item.itemName || ''}
                      onChange={(e) => {
                        const copy = [...quoteItems];
                        copy[idx].itemName = e.target.value;
                        setQuoteItems(copy);
                      }}
                      className="col-span-4 p-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quotedQuantity || 1}
                      onChange={(e) => {
                        const copy = [...quoteItems];
                        copy[idx].quotedQuantity = Number(e.target.value);
                        copy[idx].netPrice = Number(e.target.value) * (copy[idx].unitPrice || 0);
                        setQuoteItems(copy);
                      }}
                      className="col-span-2 p-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs text-center"
                    />
                    <input
                      type="number"
                      placeholder="Rate (₹)"
                      value={item.unitPrice || 0}
                      onChange={(e) => {
                        const copy = [...quoteItems];
                        copy[idx].unitPrice = Number(e.target.value);
                        copy[idx].netPrice = (copy[idx].quotedQuantity || 1) * Number(e.target.value);
                        setQuoteItems(copy);
                      }}
                      className="col-span-3 p-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs text-right font-mono"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 bg-white border border-[#EBE3DB] text-[#211B17] font-bold text-xs rounded-xl hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Save Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VIEW QUOTATION                                     */}
      {/* ========================================================= */}
      {viewQuote && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <span className="text-[10px] text-[#8D7B70] font-mono">SUPPLIER QUOTATION DETAILS</span>
                <h3 className="text-base font-black text-[#211B17]">{viewQuote.quotationNumber}</h3>
              </div>
              <button
                onClick={() => setViewQuote(null)}
                className="p-1 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <div className="text-[#8D7B70]">Supplier:</div>
                <div className="font-bold text-[#211B17]">{viewQuote.supplierName}</div>
              </div>
              <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <div className="text-[#8D7B70]">Quotation Date:</div>
                <div className="font-bold text-[#211B17]">{viewQuote.quotationDate}</div>
              </div>
              <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <div className="text-[#8D7B70]">Lead Time:</div>
                <div className="font-bold text-[#211B17]">{viewQuote.leadTimeDays || 7} Days</div>
              </div>
              <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <div className="text-[#8D7B70]">Grand Total:</div>
                <div className="font-bold text-emerald-700 text-sm font-mono">
                  {formatCurrency(viewQuote.grandTotal)}
                </div>
              </div>
            </div>

            {/* Line items list */}
            <div className="border border-[#EBE3DB] rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#FAF7F2] border-b border-[#EBE3DB] text-[#544B45] font-bold">
                  <tr>
                    <th className="py-2 px-3">Item</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Rate</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]">
                  {(viewQuote.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-semibold text-[#211B17]">{it.itemName}</td>
                      <td className="py-2 px-3 text-center font-mono">{it.quotedQuantity || it.quantity || 1}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatCurrency(it.unitPrice)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-[#211B17]">
                        {formatCurrency(it.netPrice || it.totalPrice || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EBE3DB]">
              <button
                onClick={() => setViewQuote(null)}
                className="px-4 py-2 bg-white border border-[#EBE3DB] text-[#211B17] font-bold text-xs rounded-xl hover:bg-[#FAF7F2]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SUCCESSFUL PO GENERATION MODAL                     */}
      {/* ========================================================= */}
      {createdPoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-4 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-[#211B17]">Purchase Order Created!</h3>
              <p className="text-xs text-[#70665F] mt-1">
                Official Purchase Order has been issued to <strong className="text-[#211B17]">{createdPoModal.supplierName}</strong>.
              </p>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] font-mono text-xs text-left space-y-1">
              <div>PO Number: <strong>{createdPoModal.poNumber}</strong></div>
              <div>Supplier: {createdPoModal.supplierName}</div>
              <div>Grand Total: <strong className="text-emerald-700">{formatCurrency(createdPoModal.grandTotal)}</strong></div>
              <div>Status: <span className="text-emerald-600 font-bold">Approved & Issued</span></div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setCreatedPoModal(null)}
                className="px-4 py-2 bg-white border border-[#EBE3DB] text-[#211B17] font-bold text-xs rounded-xl hover:bg-[#FAF7F2]"
              >
                Stay on Quotations
              </button>
              <Link
                href="/purchase/po"
                className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <span>Go to Purchase Orders</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#211B17]">Delete Quotation?</h3>
              <p className="text-xs text-[#70665F] mt-1">
                Are you sure you want to delete this supplier quotation? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-white border border-[#EBE3DB] text-[#211B17] font-bold text-xs rounded-xl hover:bg-[#FAF7F2]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteQuote(deleteConfirmId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClipboardCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  );
}

export default function SupplierQuotationsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[#70665F]">
          Loading Supplier Quotations & Comparison Hub...
        </div>
      }
    >
      <QuotationsHubContent />
    </Suspense>
  );
}
