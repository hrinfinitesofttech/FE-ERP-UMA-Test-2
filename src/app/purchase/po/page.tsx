'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Printer,
  Building,
  Calendar,
  X,
  ShieldCheck,
  FileCheck2,
  Trash2,
  PlusCircle,
  AlertCircle,
  Truck,
  IndianRupee,
  FileText,
  DollarSign,
  PhoneCall,
  History,
  RotateCcw,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  Send,
  Check,
  Sparkles,
  MessageSquare,
  Mail,
} from 'lucide-react';
import { PurchaseOrder, POItem, PORevision, PurchaseFollowUp } from '../../../types/purchase';
import { formatCurrency } from '../../../lib/utils';

function PurchaseOrdersHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'orders';

  const {
    purchaseOrders,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    approvePurchaseOrder,
    poRevisions,
    purchaseFollowUps,
    addPurchaseFollowUp,
    supplierQuotations,
    suppliers,
    projectJobs,
    rfqs,
    currentUser,
  } = useERP();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'approvals' | 'followup'>(
    initialTab === 'approvals' ? 'approvals' : initialTab === 'followup' ? 'followup' : 'orders'
  );

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    setMounted(true);
    if (searchParams.get('tab') === 'approvals') {
      setActiveTab('approvals');
    } else if (searchParams.get('tab') === 'followup') {
      setActiveTab('followup');
    }
    const qId = searchParams.get('quoteId');
    if (qId) {
      setCreateMode('from_quotation');
      setSelectedQuoteId(qId);
      setShowCreateModal(true);
    }
  }, [searchParams]);

  // ----------------------------------------------------
  // TAB 1: PURCHASE ORDERS MASTER STATE & ACTIONS
  // ----------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');

  const [viewPO, setViewPO] = useState<PurchaseOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Mode: 'from_quotation' | 'direct'
  const [createMode, setCreateMode] = useState<'from_quotation' | 'direct'>(
    supplierQuotations && supplierQuotations.length > 0 ? 'from_quotation' : 'direct'
  );

  // From Quotation State
  const [selectedQuoteId, setSelectedQuoteId] = useState(supplierQuotations[0]?.id || '');

  // Direct Entry State (matching Vendor Quotation Entry fields)
  const [selectedRfqId, setSelectedRfqId] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [quotationRef, setQuotationRef] = useState('');
  const [directJobId, setDirectJobId] = useState('');

  // Common PO fields
  const [newDeliveryDate, setNewDeliveryDate] = useState(
    new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
  );
  const [newPaymentTerms, setNewPaymentTerms] = useState('30 Days Credit');
  const [newDeliveryTerms, setNewDeliveryTerms] = useState('FOR Rajpur Works');
  const [newDispatchMode, setNewDispatchMode] = useState('Road Transport');
  const [newSpecialInstructions, setNewSpecialInstructions] = useState('');

  // Direct Items State (matching Vendor Quotation Entry line items)
  const [directItems, setDirectItems] = useState<
    Array<{
      id: string;
      itemCode: string;
      itemName: string;
      specification: string;
      unit: string;
      unitOfMeasure: string;
      orderedQuantity: number;
      unitPrice: number;
      totalPrice: number;
      gstPercentage: number;
    }>
  >([
    {
      id: `poi-${Date.now()}-1`,
      itemCode: 'ITEM-01',
      itemName: '',
      specification: '',
      unit: 'KG',
      unitOfMeasure: 'KG',
      orderedQuantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      gstPercentage: 18,
    },
  ]);

  const updateDirectItem = (index: number, field: string, val: any) => {
    setDirectItems((prev) => {
      const copy = [...prev];
      const cur = { ...copy[index], [field]: val };
      const qty = Number(cur.orderedQuantity) || 0;
      const rate = Number(cur.unitPrice) || 0;
      cur.totalPrice = qty * rate;
      copy[index] = cur;
      return copy;
    });
  };

  const handleAddDirectItem = () => {
    setDirectItems((prev) => [
      ...prev,
      {
        id: `poi-${Date.now()}-${prev.length + 1}`,
        itemCode: `ITEM-0${prev.length + 1}`,
        itemName: '',
        specification: '',
        unit: 'KG',
        unitOfMeasure: 'KG',
        orderedQuantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        gstPercentage: 18,
      },
    ]);
  };

  const handleRemoveDirectItem = (index: number) => {
    if (directItems.length <= 1) return;
    setDirectItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Dynamic Additional Charges for Direct PO
  const [directAdditionalCharges, setDirectAdditionalCharges] = useState<
    Array<{ id: string; name: string; amount: number }>
  >([]);

  const handleAddDirectCharge = () => {
    setDirectAdditionalCharges((prev) => [
      ...prev,
      { id: `po-chg-${Date.now()}-${prev.length + 1}`, name: '', amount: 0 },
    ]);
  };

  const handleRemoveDirectCharge = (id: string) => {
    setDirectAdditionalCharges((prev) => prev.filter((c) => c.id !== id));
  };

  const handleDirectChargeChange = (id: string, field: 'name' | 'amount', value: any) => {
    setDirectAdditionalCharges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // Auto-populate when RFQ is selected in Direct Mode
  const handleSelectRfqForDirect = (rfqId: string) => {
    setSelectedRfqId(rfqId);
    const rfq = rfqs?.find((r) => r.id === rfqId || r.rfqNumber === rfqId);
    if (rfq) {
      if (rfq.supplierId) {
        setSelectedSupplierId(rfq.supplierId);
      } else if (rfq.supplierName) {
        const matched = suppliers.find(
          (s) => (s.name || s.supplierName)?.toLowerCase() === rfq.supplierName?.toLowerCase()
        );
        if (matched) setSelectedSupplierId(matched.id);
      }
      if (rfq.projectId || rfq.jobNumber) {
        setDirectJobId(rfq.projectId || rfq.jobNumber || '');
      }
      if (rfq.items && rfq.items.length > 0) {
        const mapped = rfq.items.map((it, idx) => ({
          id: `poi-${Date.now()}-${idx + 1}`,
          itemCode: it.itemCode || `ITEM-0${idx + 1}`,
          itemName: it.itemName || it.materialName || it.description || 'Material Item',
          specification: it.specification || it.dimensions || `${it.thk ? it.thk + ' THK' : ''}`,
          unit: it.unit || it.unitOfMeasure || 'KG',
          unitOfMeasure: it.unitOfMeasure || it.unit || 'KG',
          orderedQuantity: it.quantity || it.requiredQuantity || 1,
          unitPrice: 0,
          totalPrice: 0,
          gstPercentage: 18,
        }));
        setDirectItems(mapped);
      }
    }
  };

  // Calculations for Direct PO
  const directSubTotal = useMemo(() => {
    return directItems.reduce((acc, it) => acc + (Number(it.totalPrice) || 0), 0);
  }, [directItems]);

  const directTaxTotal = useMemo(() => {
    return directSubTotal * 0.18;
  }, [directSubTotal]);

  const directAdditionalTotal = useMemo(() => {
    return directAdditionalCharges.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
  }, [directAdditionalCharges]);

  const directGrandTotal = useMemo(() => {
    return directSubTotal + directTaxTotal + directAdditionalTotal;
  }, [directSubTotal, directTaxTotal, directAdditionalTotal]);

  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const poNum = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (createMode === 'from_quotation') {
      const quote = supplierQuotations.find((q) => q.id === selectedQuoteId);
      if (!quote) {
        showToast('Please select a valid supplier quotation.');
        return;
      }

      const poItems: POItem[] = (quote.items || []).map((it, idx) => ({
        id: `POI-${Date.now()}-${idx}`,
        itemCode: it.itemCode,
        itemName: it.itemName,
        specification: it.specification || '',
        category: it.category || 'Raw Material',
        orderedQuantity: it.quotedQuantity || it.quantity || 1,
        unitOfMeasure: it.unitOfMeasure || 'Nos',
        unitPrice: it.unitPrice,
        totalPrice: (it.quotedQuantity || it.quantity || 1) * it.unitPrice,
        gstPercentage: it.gstPercentage || 18,
        netPrice: (it.quotedQuantity || it.quantity || 1) * it.unitPrice,
        hsnCode: '7219',
      }));

      const newPO: PurchaseOrder = {
        id: `PO-${Date.now().toString().slice(-6)}`,
        poNumber: poNum,
        poDate: new Date().toISOString().split('T')[0],
        supplierId: quote.supplierId,
        supplierName: quote.supplierName,
        quotationId: quote.id,
        supplierQuotationNumber: quote.quotationNumber,
        rfqNumber: quote.rfqNumber,
        prNumber: quote.prNumber,
        projectId: quote.projectId || '',
        jobId: quote.jobId || directJobId || 'JOB-2026-001',
        jobNumber: quote.jobNumber || quote.jobId || directJobId || 'JOB-2026-001',
        status: 'Submitted',
        expectedDeliveryDate: newDeliveryDate,
        paymentTerms: newPaymentTerms || quote.paymentTerms || '30 Days Credit',
        deliveryTerms: newDeliveryTerms || quote.deliveryTerms || 'FOR Destination',
        dispatchMode: newDispatchMode,
        specialInstructions: newSpecialInstructions,
        subTotal: quote.subTotal || quote.subtotal || 0,
        taxTotal: quote.taxTotal || 0,
        freightCharges: 0,
        otherCharges: quote.otherCharges || 0,
        additionalCharges: quote.additionalCharges || [],
        grandTotal: quote.grandTotal,
        items: poItems,
        revisionNumber: 0,
        createdAt: new Date().toISOString(),
      };

      addPurchaseOrder(newPO);
      setShowCreateModal(false);
      showToast(`Purchase Order ${newPO.poNumber} created and sent for approval!`);
    } else {
      if (!selectedSupplierId) {
        showToast('Please select a supplier.');
        return;
      }
      const sup = suppliers.find((s) => s.id === selectedSupplierId);
      const supplierName = sup?.supplierName || sup?.name || 'Selected Supplier';

      const poItems: POItem[] = directItems.map((it, idx) => {
        const qty = Number(it.orderedQuantity) || 0;
        const rate = Number(it.unitPrice) || 0;
        const itemTotal = qty * rate;
        return {
          id: `POI-${Date.now()}-${idx}`,
          itemCode: it.itemCode || `ITEM-0${idx + 1}`,
          itemName: it.itemName || 'Material Item',
          specification: it.specification || '',
          category: 'Raw Material',
          orderedQuantity: qty,
          unitOfMeasure: it.unit || it.unitOfMeasure || 'KG',
          unitPrice: rate,
          totalPrice: itemTotal,
          gstPercentage: it.gstPercentage || 18,
          netPrice: itemTotal,
          hsnCode: '7219',
        };
      });

      const selectedProj = (projectJobs || []).find(
        (p) => (p.projectNumber || p.id) === directJobId || p.id === directJobId
      );
      const projDisplay = selectedProj?.projectNumber || directJobId || 'GENERAL';

      const newPO: PurchaseOrder = {
        id: `PO-${Date.now().toString().slice(-6)}`,
        poNumber: poNum,
        poDate: new Date().toISOString().split('T')[0],
        supplierId: selectedSupplierId,
        supplierName,
        quotationId: undefined,
        supplierQuotationNumber: quotationRef.trim() || undefined,
        rfqNumber: selectedRfqId || undefined,
        projectId: projDisplay,
        jobId: projDisplay,
        jobNumber: projDisplay,
        status: 'Submitted',
        expectedDeliveryDate: newDeliveryDate,
        paymentTerms: newPaymentTerms || '30 Days Credit',
        deliveryTerms: newDeliveryTerms || 'FOR Rajpur Works',
        dispatchMode: newDispatchMode,
        specialInstructions: newSpecialInstructions,
        subTotal: directSubTotal,
        taxTotal: directTaxTotal,
        freightCharges: 0,
        otherCharges: directAdditionalTotal,
        additionalCharges: directAdditionalCharges.filter((c) => c.name.trim() !== '' || c.amount > 0),
        grandTotal: directGrandTotal,
        items: poItems,
        revisionNumber: 0,
        createdAt: new Date().toISOString(),
      };

      addPurchaseOrder(newPO);
      setShowCreateModal(false);
      showToast(`Purchase Order ${newPO.poNumber} created successfully!`);

      // Reset Direct Form
      setSelectedRfqId('');
      setSelectedSupplierId('');
      setQuotationRef('');
      setDirectJobId('');
      setDirectAdditionalCharges([]);
    }
  };

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      if (statusFilter !== 'ALL' && po.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (projectFilter !== 'ALL' && po.jobId !== projectFilter && po.jobNumber !== projectFilter) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          po.poNumber?.toLowerCase().includes(q) ||
          po.supplierName?.toLowerCase().includes(q) ||
          po.jobId?.toLowerCase().includes(q) ||
          po.jobNumber?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [purchaseOrders, statusFilter, projectFilter, searchQuery]);

  // ----------------------------------------------------
  // TAB 2: PO APPROVAL & REVISIONS QUEUE STATE
  // ----------------------------------------------------
  const [approvalTab, setApprovalTab] = useState<'pending' | 'revisions'>('pending');

  const pendingPOs = useMemo(() => {
    return purchaseOrders.filter(
      (po) =>
        po.status === 'Submitted' ||
        po.status === 'Pending Approval' ||
        po.status === 'Draft' ||
        po.status === 'draft' ||
        po.status === 'pending_approval'
    );
  }, [purchaseOrders]);

  const approvedPOs = useMemo(() => {
    return purchaseOrders.filter(
      (po) =>
        po.status === 'Approved' ||
        po.status === 'Ordered' ||
        po.status === 'Partially Received' ||
        po.status === 'Completed' ||
        po.status === 'approved'
    );
  }, [purchaseOrders]);

  const handleApprovePO = (poId: string) => {
    const approverName = currentUser
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : 'Commercial Director';
    approvePurchaseOrder(poId, approverName);
    showToast(`PO ${poId} approved and released to supplier!`);
  };

  // ----------------------------------------------------
  // TAB 3: DELIVERY EXPEDITING & FOLLOW-UP STATE
  // ----------------------------------------------------
  const [showAddFollowupModal, setShowAddFollowupModal] = useState(false);
  const [selectedFollowupPoId, setSelectedFollowupPoId] = useState(purchaseOrders[0]?.id || '');
  const [newFollowUpDate, setNewFollowUpDate] = useState(new Date().toISOString().split('T')[0]);
  const [newContactedPerson, setNewContactedPerson] = useState('');
  const [newCommChannel, setNewCommChannel] = useState<'Phone' | 'Email' | 'WhatsApp' | 'Site Visit'>('Phone');
  const [newCommitmentDate, setNewCommitmentDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [newDelayRisk, setNewDelayRisk] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [newRemarks, setNewRemarks] = useState('');

  const handleAddFollowupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const poObj = purchaseOrders.find((p) => p.id === selectedFollowupPoId);
    if (!poObj) return;

    const newFU: PurchaseFollowUp = {
      id: `PFU-${Date.now()}`,
      poId: poObj.id,
      poNumber: poObj.poNumber,
      supplierId: poObj.supplierId,
      supplierName: poObj.supplierName,
      followUpDate: newFollowUpDate,
      contactedPerson: newContactedPerson || 'Dispatch Head',
      communicationChannel: newCommChannel,
      supplierCommitmentDate: newCommitmentDate,
      delayRisk: newDelayRisk,
      followUpBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Purchase Expeditor',
      remarks: newRemarks || 'Spoke regarding fabrication status and dispatch timeline.',
      nextFollowUpDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    addPurchaseFollowUp(newFU);
    setShowAddFollowupModal(false);
    showToast(`Follow-up logged for ${poObj.poNumber}!`);
  };

  // Overall KPIs
  const totalPOValue = useMemo(() => {
    return purchaseOrders.reduce((sum, p) => sum + (p.grandTotal || 0), 0);
  }, [purchaseOrders]);

  if (!mounted) {
    return (
      <div className="p-8 text-center text-xs text-[#70665F]">
        Loading Purchase Orders & Approvals Command Center...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#FAF7F2] min-h-screen text-[#3E2723]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#211B17] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-crm-brand-100 text-crm-brand-800 font-mono text-[11px] font-bold border border-crm-brand-300">
              MODULE 4 • PURCHASE
            </span>
            <span className="text-xs text-[#70665F] font-semibold">Orders, Approvals & Expediting Command Center</span>
          </div>
          <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-crm-brand-700" />
            Purchase Orders & Approvals Hub
          </h1>
          <p className="text-xs text-[#70665F] mt-1">
            Official purchase orders release, 3-tier management approval control matrix, and supplier expediting tracker.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1.5 rounded-xl border border-[#EBE3DB]">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-crm-brand-700 hover:bg-crm-brand-800 text-white shadow-xs'
                : 'text-[#6E5D53] hover:text-[#211B17] hover:bg-[#F3ECE4]'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>All Purchase Orders</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
              {purchaseOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'approvals'
                ? 'bg-crm-brand-700 hover:bg-crm-brand-800 text-white shadow-xs'
                : 'text-[#6E5D53] hover:text-[#211B17] hover:bg-[#F3ECE4]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Approval Queue</span>
            {pendingPOs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-mono font-extrabold animate-pulse">
                {pendingPOs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('followup')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'followup'
                ? 'bg-crm-brand-700 hover:bg-crm-brand-800 text-white shadow-xs'
                : 'text-[#6E5D53] hover:text-[#211B17] hover:bg-[#F3ECE4]'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Follow-up & Expediting</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
              {purchaseFollowUps.length}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#70665F]">
            <span>Total Issued POs</span>
            <ShoppingCart className="w-4 h-4 text-crm-brand-700" />
          </div>
          <div className="text-xl font-black text-[#211B17] mt-1">{purchaseOrders.length}</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Procurement Orders</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#70665F]">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600 mt-1">{pendingPOs.length}</div>
          <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Awaiting Director Sign-off</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#70665F]">
            <span>Total Committed Value</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-[#211B17] mt-1">{formatCurrency(totalPOValue)}</div>
          <div className="text-[10px] text-[#70665F] mt-0.5">Total Value Across All POs</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#70665F]">
            <span>Active Follow-up Logs</span>
            <Truck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-black text-sky-700 mt-1">{purchaseFollowUps.length}</div>
          <div className="text-[10px] text-sky-800 font-semibold mt-0.5">Supplier Expediting Records</div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ALL PURCHASE ORDERS MASTER                         */}
      {/* ========================================================= */}
      {activeTab === 'orders' && (() => {
        const poColumns: ERPColumn<PurchaseOrder>[] = [
          {
            key: 'poNumber',
            header: 'PO NUMBER',
            isCodeLink: true,
            onCodeClick: (po) => setViewPO(po),
          },
          {
            key: 'poDate',
            header: 'DATE',
            cell: (po) => (
              <span className="text-xs text-slate-600 font-mono">
                {po.poDate || po.createdAt?.slice(0, 10)}
              </span>
            ),
          },
          {
            key: 'supplierName',
            header: 'SUPPLIER NAME',
            cell: (po) => (
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{po.supplierName}</span>
              </div>
            ),
          },
          {
            key: 'project',
            header: 'PROJECT',
            cell: (po) => (
              <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-mono font-bold">
                {po.projectId || po.jobNumber || po.jobId || 'Direct'}
              </span>
            ),
          },
          {
            key: 'expectedDeliveryDate',
            header: 'DELIVERY DATE',
            cell: (po) => (
              <span className="font-semibold text-slate-700 text-xs">
                {po.expectedDeliveryDate || '10 Days'}
              </span>
            ),
          },
          {
            key: 'items',
            header: 'ITEMS',
            cell: (po) => (
              <span className="font-mono text-xs font-bold text-slate-700">
                {po.items?.length || 1}
              </span>
            ),
          },
          {
            key: 'grandTotal',
            header: 'GRAND TOTAL',
            cell: (po) => (
              <span className="font-mono font-black text-slate-900 text-xs">
                {formatCurrency(po.grandTotal)}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'APPROVAL STATUS',
            cell: (po) => (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  po.status === 'Approved' || po.status === 'Ordered' || po.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {po.status}
              </span>
            ),
          },
          {
            key: 'actions',
            header: 'ACTIONS',
            cell: (po) => (
              <div className="flex items-center justify-end gap-1.5">
                <button
                  onClick={() => setViewPO(po)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                  title="View PO Details"
                >
                  <Eye className="w-3.5 h-3.5 text-purple-600" />
                </button>
                {po.status === 'Submitted' && (
                  <button
                    onClick={() => handleApprovePO(po.id)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-xs transition cursor-pointer"
                    title="Approve PO"
                  >
                    Approve
                  </button>
                )}
                <button
                  onClick={() => setDeleteConfirmId(po.id)}
                  className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition cursor-pointer"
                  title="Delete PO"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ),
          },
        ];

        return (
          <div className="space-y-4">
            {/* Filter Sub-bar */}
            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Filter className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Submitted">Submitted (Pending)</option>
                  <option value="Ordered">Ordered / Dispatched</option>
                  <option value="Completed">Completed</option>
                </select>

                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-2">Job:</span>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="ALL">All Jobs ({projectJobs.length})</option>
                  {projectJobs.map((j) => (
                    <option key={j.id} value={j.jobNumber || j.id}>
                      {j.jobNumber} • {j.productName?.slice(0, 20)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-xs text-slate-500">
                Showing <span className="font-bold text-slate-800">{filteredPOs.length}</span> Purchase Orders
              </div>
            </div>

            <ERPListPageLayout<PurchaseOrder>
              breadcrumbs={['DASHBOARD', 'PURCHASE & RFQ', 'PURCHASE ORDERS']}
              title="All Purchase Orders"
              columns={poColumns}
              data={filteredPOs}
              searchPlaceholder="Search by PO #, supplier, or job..."
              addNewLabel="Create Purchase Order"
              onAddNew={() => setShowCreateModal(true)}
              onExport={() => {
                const csv = [
                  'PO Number,Date,Supplier,Job,Delivery Date,Items,Grand Total,Status',
                  ...filteredPOs.map(
                    po => `"${po.poNumber}","${po.poDate || ''}","${po.supplierName}","${po.jobNumber || ''}","${po.expectedDeliveryDate || ''}","${po.items?.length || 1}","${po.grandTotal}","${po.status}"`
                  )
                ].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `purchase_orders_${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
              }}
            />
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* TAB 2: PO APPROVAL & REVISIONS QUEUE                      */}
      {/* ========================================================= */}
      {activeTab === 'approvals' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Header matrix indicator */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
                <h3 className="font-extrabold text-sm text-[#211B17]">
                  3-Tier Management Approval Control Matrix
                </h3>
              </div>
              <p className="text-xs text-[#70665F] mt-0.5">
                Executive Creation → Department Manager Review → Commercial Director Final Authorization.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-amber-200 text-xs">
              <button
                onClick={() => setApprovalTab('pending')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  approvalTab === 'pending'
                    ? 'bg-crm-brand-700 hover:bg-crm-brand-800 text-white shadow-xs'
                    : 'text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]'
                }`}
              >
                Pending Approvals ({pendingPOs.length})
              </button>
              <button
                onClick={() => setApprovalTab('revisions')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  approvalTab === 'revisions'
                    ? 'bg-crm-brand-700 hover:bg-crm-brand-800 text-white shadow-xs'
                    : 'text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]'
                }`}
              >
                Revision Audit Logs ({poRevisions.length})
              </button>
            </div>
          </div>

          {approvalTab === 'pending' ? (
            <div className="space-y-3">
              {pendingPOs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingPOs.map((po) => (
                    <div
                      key={po.id}
                      className="bg-white border border-[#EBE3DB] rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {po.poNumber}
                            </span>
                            <h4 className="text-sm font-extrabold text-[#211B17] mt-1.5">{po.supplierName}</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-[#8D7B70]">Total Value:</span>
                            <div className="text-base font-black text-emerald-700 font-mono">
                              {formatCurrency(po.grandTotal)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#EBE3DB] text-xs">
                          <div>
                            <span className="text-[#8D7B70]">Project Reference:</span>
                            <div className="font-bold text-[#211B17]">{po.projectId || po.jobNumber || po.jobId}</div>
                          </div>
                          <div>
                            <span className="text-[#8D7B70]">Required Delivery:</span>
                            <div className="font-bold text-[#211B17]">{po.expectedDeliveryDate || 'Within 10 Days'}</div>
                          </div>
                          <div>
                            <span className="text-[#8D7B70]">Payment Terms:</span>
                            <div className="font-semibold text-[#211B17]">{po.paymentTerms || '30 Days Credit'}</div>
                          </div>
                          <div>
                            <span className="text-[#8D7B70]">Line Items:</span>
                            <div className="font-semibold text-[#211B17]">{po.items?.length || 1} Products</div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#EBE3DB] flex items-center justify-between">
                        <button
                          onClick={() => setViewPO(po)}
                          className="text-xs font-bold text-[#70665F] hover:text-[#211B17] flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Full PO</span>
                        </button>
                        <button
                          onClick={() => handleApprovePO(po.id)}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Authorize & Release PO</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-[#EBE3DB] rounded-2xl p-8 text-center text-[#70665F] space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-bold text-sm text-[#211B17]">All Purchase Orders Approved</div>
                  <p className="text-xs">There are no purchase orders awaiting authorization at this moment.</p>
                </div>
              )}
            </div>
          ) : (
            /* Revisions Tab */
            <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xs">
              <div className="p-3.5 bg-[#F8F4EE] border-b border-[#EBE3DB]">
                <h4 className="font-bold text-xs text-[#211B17] flex items-center gap-1.5">
                  <History className="w-4 h-4 text-crm-brand-700" />
                  Immutable Purchase Order Revision History
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-[#EBE3DB] text-[#544B45] font-bold">
                    <tr>
                      <th className="py-3 px-3.5">PO Number</th>
                      <th className="py-3 px-3 text-center">Revision #</th>
                      <th className="py-3 px-3">Revised Date</th>
                      <th className="py-3 px-3">Authorized By</th>
                      <th className="py-3 px-3">Reason for Revision</th>
                      <th className="py-3 px-3.5 text-right">Revised Grand Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE3DB]">
                    {poRevisions.length > 0 ? (
                      poRevisions.map((rev) => (
                        <tr key={rev.id} className="hover:bg-[#FAF7F2] transition">
                          <td className="py-3 px-3.5 font-mono font-bold text-[#211B17]">{rev.poNumber}</td>
                          <td className="py-3 px-3 text-center font-bold text-amber-700">Rev {rev.revisionNumber}</td>
                          <td className="py-3 px-3 text-[#70665F]">{rev.revisionDate || rev.revisedDate}</td>
                          <td className="py-3 px-3 font-semibold text-[#211B17]">{rev.revisedBy}</td>
                          <td className="py-3 px-3 text-[#544B45]">{rev.reasonForRevision || rev.reason}</td>
                          <td className="py-3 px-3.5 text-right font-mono font-black text-emerald-700">
                            {formatCurrency(rev.revisedGrandTotal || rev.newGrandTotal || 0)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#70665F]">
                          No revisions have been recorded yet. All POs are on original revision 0.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: DELIVERY EXPEDITING & FOLLOW-UP                    */}
      {/* ========================================================= */}
      {activeTab === 'followup' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#211B17] flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-sky-600" />
                Supplier Delivery Expediting & Follow-up Logs
              </h3>
              <p className="text-xs text-[#70665F] mt-0.5">
                Proactive vendor tracking, commitment dates, logistics contacts, and delay risk logging.
              </p>
            </div>

            <button
              onClick={() => setShowAddFollowupModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Log Supplier Follow-up</span>
            </button>
          </div>

          {/* Follow-up Table */}
          <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F4EE] border-b border-[#EBE3DB] text-[#544B45] font-bold">
                  <tr>
                    <th className="py-3 px-3.5">PO Number</th>
                    <th className="py-3 px-3">Supplier Name</th>
                    <th className="py-3 px-3">Follow-up Date</th>
                    <th className="py-3 px-3">Contact Person</th>
                    <th className="py-3 px-3 text-center">Channel</th>
                    <th className="py-3 px-3 text-center">Commitment Date</th>
                    <th className="py-3 px-3 text-center">Delay Risk</th>
                    <th className="py-3 px-3.5">Remarks / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]">
                  {purchaseFollowUps.length > 0 ? (
                    purchaseFollowUps.map((fu) => (
                      <tr key={fu.id} className="hover:bg-[#FAF7F2] transition">
                        <td className="py-3 px-3.5 font-mono font-bold text-[#211B17]">{fu.poNumber}</td>
                        <td className="py-3 px-3 font-semibold text-[#211B17]">{fu.supplierName}</td>
                        <td className="py-3 px-3 text-[#70665F]">{fu.followUpDate}</td>
                        <td className="py-3 px-3 font-medium text-[#211B17]">{fu.contactedPerson}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#EBE3DB] font-semibold text-[10px]">
                            {fu.communicationChannel || fu.mode || 'Phone'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-[#211B17]">
                          {fu.supplierCommitmentDate || fu.expectedDelivery || 'On Schedule'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              fu.delayRisk === 'Low'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : fu.delayRisk === 'Medium'
                                ? 'bg-sky-100 text-sky-800 border-sky-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            {fu.delayRisk || 'Normal'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-[#544B45]">{fu.remarks}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#70665F]">
                        No expediting logs recorded yet. Click &quot;Log Supplier Follow-up&quot; to track supplier deliveries.
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
      {/* MODAL: CREATE PURCHASE ORDER                              */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE3DB] bg-[#FAF7F2]">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-crm-brand-700" />
                <h3 className="text-base font-black text-[#211B17]">Create Purchase Order (PO)</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#EFE8DF] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="px-6 py-3 border-b border-[#EBE3DB] bg-white">
              <div className="flex items-center gap-2 bg-[#FAF7F2] p-1 rounded-xl border border-[#EBE3DB] text-xs max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setCreateMode('from_quotation')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                    createMode === 'from_quotation'
                      ? 'bg-crm-brand-700 text-white shadow-xs'
                      : 'text-[#70665F] hover:text-[#211B17]'
                  }`}
                >
                  From Approved Quotation ({supplierQuotations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCreateMode('direct')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                    createMode === 'direct'
                      ? 'bg-crm-brand-700 text-white shadow-xs'
                      : 'text-[#70665F] hover:text-[#211B17]'
                  }`}
                >
                  Direct Manual Entry
                </button>
              </div>
            </div>

            <form onSubmit={handleCreatePOSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {createMode === 'from_quotation' ? (
                <div className="space-y-4">
                  <div>
                    <label className="font-bold text-[#544B45] block mb-1">Select Supplier Quotation *</label>
                    <select
                      value={selectedQuoteId}
                      onChange={(e) => setSelectedQuoteId(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                    >
                      {supplierQuotations.map((sq) => (
                        <option key={sq.id} value={sq.id}>
                          {sq.quotationNumber} • {sq.supplierName} • {formatCurrency(sq.grandTotal)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(() => {
                    const q = supplierQuotations.find((sq) => sq.id === selectedQuoteId);
                    if (!q) return null;
                    return (
                      <div className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl p-4 space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-[#8D7B70] block">Supplier:</span>
                            <span className="font-bold text-[#211B17]">{q.supplierName}</span>
                          </div>
                          <div>
                            <span className="text-[#8D7B70] block">Quotation Ref:</span>
                            <span className="font-bold text-[#211B17] font-mono">{q.supplierQuotationRef || q.quotationNumber}</span>
                          </div>
                          <div>
                            <span className="text-[#8D7B70] block">Linked RFQ:</span>
                            <span className="font-bold text-sky-700 font-mono">{q.rfqNumber || 'DIRECT'}</span>
                          </div>
                          <div>
                            <span className="text-[#8D7B70] block">Total Items:</span>
                            <span className="font-bold text-[#211B17]">{q.items?.length || 0} Materials</span>
                          </div>
                        </div>

                        <div className="border border-[#EBE3DB] rounded-xl overflow-hidden bg-white">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAF7F2] border-b border-[#EBE3DB] font-bold text-[#544B45]">
                              <tr>
                                <th className="py-2 px-3">Item / Description</th>
                                <th className="py-2 px-3">Specification</th>
                                <th className="py-2 px-3 text-center">Qty</th>
                                <th className="py-2 px-3 text-right">Unit Rate</th>
                                <th className="py-2 px-3 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EBE3DB]">
                              {(q.items || []).map((it, idx) => (
                                <tr key={idx}>
                                  <td className="py-2 px-3 font-bold text-[#211B17]">{it.itemName}</td>
                                  <td className="py-2 px-3 text-[#70665F]">{it.specification || '-'}</td>
                                  <td className="py-2 px-3 text-center font-mono">{it.quotedQuantity || it.quantity || 1} {it.unit || 'KG'}</td>
                                  <td className="py-2 px-3 text-right font-mono text-emerald-800 font-bold">{formatCurrency(it.unitPrice)}</td>
                                  <td className="py-2 px-3 text-right font-mono font-bold text-[#211B17]">{formatCurrency(it.totalPrice || 0)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-[#EBE3DB]">
                          <span className="font-bold text-[#544B45]">Grand Total (incl. Taxes & Charges):</span>
                          <span className="text-base font-black text-emerald-800 font-mono">{formatCurrency(q.grandTotal)}</span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-[#544B45] block mb-1">Delivery Due Date</label>
                      <input
                        type="date"
                        value={newDeliveryDate}
                        onChange={(e) => setNewDeliveryDate(e.target.value)}
                        className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#544B45] block mb-1">Payment Terms</label>
                      <input
                        type="text"
                        value={newPaymentTerms}
                        onChange={(e) => setNewPaymentTerms(e.target.value)}
                        className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#544B45] block mb-1">Delivery Terms</label>
                      <input
                        type="text"
                        value={newDeliveryTerms}
                        onChange={(e) => setNewDeliveryTerms(e.target.value)}
                        className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Direct Manual Entry (Matching Vendor Quotation Entry Exactly) */
                <>
                  {/* Top Row: Link RFQ, Supplier, Quote Ref, Linked Project */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#544B45] mb-1">
                        Link RFQ / Purchase Request
                      </label>
                      <select
                        value={selectedRfqId}
                        onChange={(e) => handleSelectRfqForDirect(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                      >
                        <option value="">-- Direct PO (No RFQ) --</option>
                        {rfqs?.map((rfq) => (
                          <option key={rfq.id} value={rfq.id}>
                            {rfq.rfqNumber} • {rfq.supplierName || 'General Vendor'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#544B45] mb-1">
                        Select Supplier / Vendor *
                      </label>
                      <select
                        required
                        value={selectedSupplierId}
                        onChange={(e) => setSelectedSupplierId(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                      >
                        <option value="">-- Choose Supplier --</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.supplierName || s.name} {s.city ? `(${s.city})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#544B45] mb-1">
                        Vendor Quote Reference No *
                      </label>
                      <input
                        type="text"
                        value={quotationRef}
                        onChange={(e) => setQuotationRef(e.target.value)}
                        placeholder="e.g. QTN-2026-904"
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#544B45] mb-1">
                        Linked Project
                      </label>
                      <select
                        value={directJobId}
                        onChange={(e) => setDirectJobId(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                      >
                        <option value="">-- Choose Project --</option>
                        {(projectJobs || []).map((p) => (
                          <option key={p.id} value={p.projectNumber || p.id}>
                            {p.projectNumber || p.id} • {p.projectName?.slice(0, 25)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-[#211B17] uppercase tracking-wider">
                        PO Material Items & Rates
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddDirectItem}
                        className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#EFE8DF] text-crm-brand-700 text-xs font-bold rounded-lg border border-[#EBE3DB] flex items-center gap-1 transition shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Material Line
                      </button>
                    </div>

                    <div className="border border-[#EBE3DB] rounded-xl overflow-x-auto">
                      <table className="w-full text-left text-xs min-w-[700px]">
                        <thead className="bg-[#FAF7F2] border-b border-[#EBE3DB] text-[#544B45] font-bold">
                          <tr>
                            <th className="py-2 px-3 w-10">#</th>
                            <th className="py-2 px-3">Item Name / Material</th>
                            <th className="py-2 px-3">Specification / Make</th>
                            <th className="py-2 px-3 w-20 text-center">Unit</th>
                            <th className="py-2 px-3 w-24 text-right">Quantity</th>
                            <th className="py-2 px-3 w-28 text-right">Unit Rate (₹)</th>
                            <th className="py-2 px-3 w-28 text-right">Total (₹)</th>
                            <th className="py-2 px-3 w-12 text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EBE3DB]">
                          {directItems.map((it, idx) => (
                            <tr key={it.id || idx}>
                              <td className="py-2 px-3 font-mono text-[#8D7B70]">{idx + 1}</td>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  required
                                  value={it.itemName}
                                  onChange={(e) => updateDirectItem(idx, 'itemName', e.target.value)}
                                  placeholder="e.g. SS 316 L HR PLATE"
                                  className="w-full p-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-semibold focus:outline-none"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={it.specification}
                                  onChange={(e) => updateDirectItem(idx, 'specification', e.target.value)}
                                  placeholder="12MM THK - Jindal Make"
                                  className="w-full p-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs focus:outline-none"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <select
                                  value={it.unit || 'KG'}
                                  onChange={(e) => {
                                    updateDirectItem(idx, 'unit', e.target.value);
                                    updateDirectItem(idx, 'unitOfMeasure', e.target.value);
                                  }}
                                  className="w-full p-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-semibold focus:outline-none text-center"
                                >
                                  <option value="KG">KG</option>
                                  <option value="NOS">NOS</option>
                                  <option value="MTR">MTR</option>
                                  <option value="SET">SET</option>
                                  <option value="TON">TON</option>
                                  <option value="PKT">PKT</option>
                                </select>
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  min="0.1"
                                  step="any"
                                  value={it.orderedQuantity === 0 ? '' : it.orderedQuantity}
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === '' ? 0 : parseFloat(e.target.value);
                                    updateDirectItem(idx, 'orderedQuantity', isNaN(val) ? 0 : val);
                                  }}
                                  placeholder="0"
                                  className="w-full p-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-mono text-right focus:outline-none"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={it.unitPrice === 0 ? '' : it.unitPrice}
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === '' ? 0 : parseFloat(e.target.value);
                                    updateDirectItem(idx, 'unitPrice', isNaN(val) ? 0 : val);
                                  }}
                                  placeholder="0"
                                  className="w-full p-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-mono text-right font-bold text-emerald-800 focus:outline-none"
                                />
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-[#211B17]">
                                {formatCurrency(it.totalPrice || 0)}
                              </td>
                              <td className="py-2 px-3 text-center">
                                {directItems.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDirectItem(idx)}
                                    className="p-1 text-rose-500 hover:text-rose-700 rounded transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Additional Charges / Terms & Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB]">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-extrabold text-[#211B17] uppercase tracking-wider">
                          Additional Charges
                        </h5>
                        <button
                          type="button"
                          onClick={handleAddDirectCharge}
                          className="px-2.5 py-1 bg-white hover:bg-[#EFE8DF] text-crm-brand-700 text-xs font-bold rounded-lg border border-[#EBE3DB] flex items-center gap-1 transition shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Additional Charge
                        </button>
                      </div>

                      {directAdditionalCharges.length === 0 ? (
                        <div className="py-3 px-3 bg-white/70 border border-dashed border-[#D5C7B8] rounded-xl text-center text-xs text-[#8D7B70]">
                          No additional charges added. Click <span className="font-bold text-crm-brand-700">+ Add Additional Charge</span> to add Delivery, Packaging, etc.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {directAdditionalCharges.map((charge) => (
                            <div
                              key={charge.id}
                              className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#EBE3DB]"
                            >
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={charge.name}
                                  onChange={(e) =>
                                    handleDirectChargeChange(charge.id, 'name', e.target.value)
                                  }
                                  placeholder="Charge Name (e.g. Delivery / Packaging)"
                                  className="w-full p-1.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                                />
                              </div>
                              <div className="w-28">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={charge.amount === 0 ? '' : charge.amount}
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === '' ? 0 : parseFloat(e.target.value);
                                    handleDirectChargeChange(charge.id, 'amount', isNaN(val) ? 0 : val);
                                  }}
                                  placeholder="0"
                                  className="w-full p-1.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-xs font-mono font-bold text-right text-emerald-800 focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveDirectCharge(charge.id)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                                title="Remove Charge"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[#8D7B70] block mb-1">Delivery Terms</label>
                          <input
                            type="text"
                            value={newDeliveryTerms}
                            onChange={(e) => setNewDeliveryTerms(e.target.value)}
                            placeholder="e.g. FOR Rajpur Works"
                            className="w-full p-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[#8D7B70] block mb-1">Delivery Due Date</label>
                          <input
                            type="date"
                            value={newDeliveryDate}
                            onChange={(e) => setNewDeliveryDate(e.target.value)}
                            className="w-full p-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Calculation Summary */}
                    <div className="space-y-1.5 text-xs text-right border-l border-[#EBE3DB] pl-4">
                      <div className="flex justify-between text-[#8D7B70]">
                        <span>Material Subtotal:</span>
                        <span className="font-mono font-bold text-[#211B17]">
                          {formatCurrency(directSubTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#8D7B70]">
                        <span>GST (18%):</span>
                        <span className="font-mono text-[#211B17]">
                          {formatCurrency(directTaxTotal)}
                        </span>
                      </div>
                      {directAdditionalCharges.map((c) => {
                        const amt = Number(c.amount) || 0;
                        if (amt <= 0 && !c.name.trim()) return null;
                        return (
                          <div key={c.id} className="flex justify-between text-[#8D7B70]">
                            <span className="truncate pr-2">{c.name || 'Additional Charge'}:</span>
                            <span className="font-mono text-[#211B17]">
                              {formatCurrency(amt)}
                            </span>
                          </div>
                        );
                      })}
                      <div className="pt-2 border-t border-[#EBE3DB] flex justify-between items-center">
                        <span className="font-black text-sm text-[#211B17]">Grand Total:</span>
                        <span className="font-black text-base text-emerald-800 font-mono">
                          {formatCurrency(directGrandTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#EBE3DB] text-[#211B17] font-bold text-xs rounded-xl hover:bg-[#FAF7F2] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VIEW PURCHASE ORDER OFFICIAL LETTERHEAD            */}
      {/* ========================================================= */}
      {viewPO && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-4xl w-full max-h-[96vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-[#EBE3DB] bg-[#FAF7F2] print:hidden">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-[#211B17] font-mono tracking-wider">
                  OFFICIAL PURCHASE ORDER: {viewPO.poNumber}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {viewPO.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Print button */}
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#EFE8DF] text-[#211B17] font-bold text-xs rounded-xl border border-[#EBE3DB] flex items-center gap-1.5 transition"
                  title="Print to PDF / Paper"
                >
                  <Printer className="w-3.5 h-3.5 text-crm-brand-700" />
                  <span>Print / PDF</span>
                </button>

                {/* WhatsApp Share */}
                {(() => {
                  const supp = suppliers.find(
                    (s) =>
                      s.id === viewPO.supplierId ||
                      s.name?.toLowerCase() === viewPO.supplierName?.toLowerCase()
                  );
                  const phone = supp?.mobile || supp?.phone || '';
                  const cleanPhone = phone.replace(/[^0-9]/g, '');
                  const waText = encodeURIComponent(
                    `*UMA TECHNOFAB - PURCHASE ORDER*\n\nDear ${viewPO.supplierName},\n\nPlease find Purchase Order Ref: *${viewPO.poNumber}* dated ${viewPO.poDate} for Job *${viewPO.jobNumber || viewPO.jobId}*.\nTotal Order Value: ₹${(viewPO.grandTotal || 0).toLocaleString('en-IN')}.\n\nPlease acknowledge receipt and confirm delivery schedule.\n\nThank you,\nUMA TECHNOFAB\nMo: 9925011676`
                  );
                  return (
                    <a
                      href={
                        cleanPhone
                          ? `https://wa.me/${cleanPhone}?text=${waText}`
                          : `https://wa.me/?text=${waText}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition"
                      title="Share directly to Vendor WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp PO</span>
                    </a>
                  );
                })()}

                {/* Email Share */}
                {(() => {
                  const supp = suppliers.find(
                    (s) =>
                      s.id === viewPO.supplierId ||
                      s.name?.toLowerCase() === viewPO.supplierName?.toLowerCase()
                  );
                  const email = supp?.email || '';
                  const subject = encodeURIComponent(
                    `Purchase Order ${viewPO.poNumber} - Uma Technofab`
                  );
                  const body = encodeURIComponent(
                    `Dear ${viewPO.supplierName},\n\nPlease find our official Purchase Order details below:\n\nPO Number: ${viewPO.poNumber}\nPO Date: ${viewPO.poDate}\nDelivery Terms: ${viewPO.deliveryTerms || 'FOR Rajpur'}\nPayment Terms: ${viewPO.paymentTerms || '30 Days'}\nGrand Total: INR ${(viewPO.grandTotal || 0).toLocaleString('en-IN')}\n\nKindly send acknowledgement and material test certificates (TC).\n\nBest Regards,\nUMA TECHNOFAB\nRajpur, Mehsana Highway, Ta. Kadi, Dist: Mehsana\nPh: 9925011676`
                  );
                  return (
                    <a
                      href={`mailto:${email}?subject=${subject}&body=${body}`}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition"
                      title="Send via Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email PO</span>
                    </a>
                  );
                })()}

                <button
                  onClick={() => setViewPO(null)}
                  className="p-1.5 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#EFE8DF] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Letterhead Document Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F4EFEA] print:p-0 print:bg-white">
              <div className="bg-white border-2 border-black max-w-3xl mx-auto p-6 sm:p-8 shadow-md text-black font-sans leading-tight">
                {/* 1. COMPANY HEADER */}
                <div className="border-b-2 border-black pb-3 text-center">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 mb-1">
                    <span>Mobile : 9925011676</span>
                    <span>Phone : 02764 233976</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-black uppercase font-serif">
                    Uma Technofab
                  </h1>
                  <p className="text-xs sm:text-[13px] font-semibold text-gray-800 mt-1">
                    Survey No. 1040/3, Village Rajpur, Mehsana Highway, Nr. Sandvik Tube,
                  </p>
                  <p className="text-xs sm:text-[13px] font-semibold text-gray-800">
                    Ta. Kadi, Dist: Mehsana.
                  </p>
                  <p className="text-[11px] font-bold text-gray-700 mt-0.5">
                    Email : umatechnofab@gmail.com
                  </p>
                </div>

                {/* 2. DOCUMENT TITLE */}
                <div className="py-2 text-center border-b-2 border-black">
                  <span className="text-lg font-black tracking-widest uppercase underline">
                    PURCHASE ORDER
                  </span>
                </div>

                {/* 3. TWO-COLUMN BOX (VENDOR & PO DETAILS) */}
                {(() => {
                  const supp = suppliers.find(
                    (s) =>
                      s.id === viewPO.supplierId ||
                      s.name?.toLowerCase() === viewPO.supplierName?.toLowerCase()
                  );
                  return (
                    <div className="grid grid-cols-2 border-b-2 border-black text-xs font-semibold">
                      {/* Left Box: Vendor Information */}
                      <div className="p-3 border-r-2 border-black space-y-1">
                        <div className="font-bold text-gray-600">TO,</div>
                        <div className="font-extrabold text-sm uppercase text-black">
                          {viewPO.supplierName}
                        </div>
                        <div className="text-gray-800 text-[11.5px] leading-snug">
                          {supp?.address || 'AHMEDABAD / GUJARAT'}
                        </div>
                        <div className="font-bold text-black pt-1">
                          MOB:- {supp?.mobile || supp?.phone || '-'}
                        </div>
                        {supp?.gstin && (
                          <div className="font-bold text-gray-800 text-[11px]">
                            GSTIN: {supp.gstin}
                          </div>
                        )}
                      </div>

                      {/* Right Box: PO Reference Grid */}
                      <div className="p-2.5 divide-y divide-black/40 text-[11px]">
                        <div className="flex justify-between py-0.5">
                          <span className="font-bold">DATE:</span>
                          <span className="font-extrabold">{viewPO.poDate}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="font-bold">P.O. NO:</span>
                          <span className="font-black text-xs font-mono">{viewPO.poNumber}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="font-bold">PROJECT:</span>
                          <span className="font-bold">{viewPO.projectId || viewPO.jobNumber || viewPO.jobId || 'GENERAL'}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="font-bold">BUYER:</span>
                          <span className="font-bold">Uma Technofab.</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="font-bold">SURCHARGES:</span>
                          <span className="font-bold">NIL</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="font-bold">TAXES:</span>
                          <span className="font-bold">18% GST (AS APPLICABLE)</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="font-bold">PAYMENT:</span>
                          <span className="font-bold">{viewPO.paymentTerms || '30 Days Credit'}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="font-bold">DELIVERY:</span>
                          <span className="font-bold">{viewPO.deliveryTerms || 'RAJPUR WORKS'}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="font-bold">G.S.T.NO:</span>
                          <span className="font-extrabold font-mono">24AAEFU9027H1Z3</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 4. SUBJECT LINE */}
                <div className="px-3 py-2 border-b-2 border-black text-xs font-black uppercase tracking-wide">
                  Sub:- PURCHASE ORDER FOR {viewPO.items?.[0]?.itemName || 'FABRICATION MATERIALS'} (JOB: {viewPO.jobNumber || viewPO.jobId || 'WORKS'})
                </div>

                {/* 5. ITEM TABLE */}
                <div className="border-b-2 border-black">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b-2 border-black text-center font-black uppercase text-[11px] bg-gray-50">
                        <th className="border-r-2 border-black py-2 px-1.5 w-12">Sr. No.</th>
                        <th className="border-r-2 border-black py-2 px-3 text-left">
                          Description of item(s)
                        </th>
                        <th className="border-r-2 border-black py-2 px-2 w-20">QTY.</th>
                        <th className="border-r-2 border-black py-2 px-2 w-28 text-right">
                          Rate .Per /Kg (₹)
                        </th>
                        <th className="py-2 px-3 w-28 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Optional Group Title */}
                      <tr className="border-b border-black/40 bg-gray-100 font-black">
                        <td className="border-r-2 border-black py-1 px-1.5 text-center">❖</td>
                        <td colSpan={4} className="py-1 px-3 uppercase tracking-wider text-[11px]">
                          FABRICATION MATERIALS & COMPONENTS
                        </td>
                      </tr>

                      {/* Items */}
                      {(viewPO.items || []).map((it, idx) => (
                        <tr key={idx} className="border-b border-black/40">
                          <td className="border-r-2 border-black py-2 px-1.5 text-center font-bold">
                            {idx + 1}
                          </td>
                          <td className="border-r-2 border-black py-2 px-3 font-semibold">
                            <div className="font-bold text-black">{it.itemName}</div>
                            {it.specification && (
                              <div className="text-[11px] text-gray-700 mt-0.5">
                                {it.specification}
                              </div>
                            )}
                          </td>
                          <td className="border-r-2 border-black py-2 px-2 text-center font-mono font-bold">
                            {it.orderedQuantity || it.quantity || 1} {it.unit || 'KG'}
                          </td>
                          <td className="border-r-2 border-black py-2 px-2 text-right font-mono font-semibold">
                            {formatCurrency(it.unitPrice)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold">
                            {formatCurrency(it.totalPrice || it.netPrice || 0)}
                          </td>
                        </tr>
                      ))}

                      {/* Special Note Box inside table */}
                      <tr className="border-b-2 border-black bg-amber-50">
                        <td className="border-r-2 border-black"></td>
                        <td colSpan={4} className="py-2 px-3 font-black text-xs text-red-700 tracking-wider">
                          MANDATORY: REQUIRE TC (TEST CERTIFICATE) & INVOICE COPY WITH MATERIAL SUPPLY.
                        </td>
                      </tr>

                      {/* Calculations / Summary */}
                      <tr className="border-b border-black/30 font-bold">
                        <td colSpan={3} className="border-r-2 border-black py-1.5 px-3 text-right">
                          SUBTOTAL:
                        </td>
                        <td colSpan={2} className="py-1.5 px-3 text-right font-mono font-bold">
                          {formatCurrency(viewPO.subTotal || viewPO.subtotal || 0)}
                        </td>
                      </tr>
                      {viewPO.taxTotal && viewPO.taxTotal > 0 && (
                        <tr className="border-b border-black/30 font-bold">
                          <td colSpan={3} className="border-r-2 border-black py-1.5 px-3 text-right">
                            GST (18%):
                          </td>
                          <td colSpan={2} className="py-1.5 px-3 text-right font-mono font-bold">
                            {formatCurrency(viewPO.taxTotal)}
                          </td>
                        </tr>
                      )}
                      {viewPO.additionalCharges && viewPO.additionalCharges.length > 0 ? (
                        viewPO.additionalCharges.map((ac, idx) => (
                          <tr key={ac.id || idx} className="border-b border-black/30 font-bold">
                            <td colSpan={3} className="border-r-2 border-black py-1.5 px-3 text-right uppercase">
                              {ac.name || 'ADDITIONAL CHARGE'}:
                            </td>
                            <td colSpan={2} className="py-1.5 px-3 text-right font-mono font-bold">
                              {formatCurrency(ac.amount)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <>
                          {viewPO.otherCharges && viewPO.otherCharges > 0 && (
                            <tr className="border-b border-black/30 font-bold">
                              <td colSpan={3} className="border-r-2 border-black py-1.5 px-3 text-right uppercase">
                                OTHER CHARGES:
                              </td>
                              <td colSpan={2} className="py-1.5 px-3 text-right font-mono font-bold">
                                {formatCurrency(viewPO.otherCharges)}
                              </td>
                            </tr>
                          )}
                          {viewPO.freightCharges && viewPO.freightCharges > 0 && (
                            <tr className="border-b border-black/30 font-bold">
                              <td colSpan={3} className="border-r-2 border-black py-1.5 px-3 text-right">
                                FREIGHT:
                              </td>
                              <td colSpan={2} className="py-1.5 px-3 text-right font-mono font-bold">
                                {formatCurrency(viewPO.freightCharges)}
                              </td>
                            </tr>
                          )}
                        </>
                      )}
                      <tr className="font-black bg-gray-50 text-sm">
                        <td colSpan={3} className="border-r-2 border-black py-2 px-3 text-right uppercase">
                          GRAND TOTAL (₹):
                        </td>
                        <td colSpan={2} className="py-2 px-3 text-right font-mono font-black text-base">
                          {formatCurrency(viewPO.grandTotal)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 6. TERMS & CONDITIONS */}
                <div className="py-3 border-b-2 border-black text-[11px] font-medium leading-relaxed space-y-1">
                  <div className="font-black underline uppercase text-xs mb-1">
                    TERMS & CONDITIONS:
                  </div>
                  <div>1. <strong>Test Certificate:</strong> Material Test Certificate (TC) must accompany every dispatch without fail.</div>
                  <div>2. <strong>Delivery:</strong> Material must be delivered at our Rajpur works within committed lead time.</div>
                  <div>3. <strong>Payment Terms:</strong> {viewPO.paymentTerms || '30 Days Credit against approved GRN & TC verification.'}</div>
                  <div>4. <strong>Inspection & Rejection:</strong> Material subject to factory inspection. Any defective or off-spec material will be returned at supplier cost.</div>
                  <div>5. <strong>Jurisdiction:</strong> All disputes subject to Kadi / Mehsana jurisdiction only.</div>
                </div>

                {/* 7. SIGNATURE BLOCK */}
                <div className="pt-6 flex justify-between items-end text-xs font-bold">
                  <div>
                    <div className="border-t border-black/60 pt-1 text-center w-36">
                      Prepared By
                    </div>
                  </div>
                  <div>
                    <div className="text-right mb-10 font-black">
                      For, UMA TECHNOFAB
                    </div>
                    <div className="border-t border-black/60 pt-1 text-center w-48">
                      Authorized Signatory
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Close */}
            <div className="flex items-center justify-end px-6 py-3 border-t border-[#EBE3DB] bg-[#FAF7F2] print:hidden">
              <button
                onClick={() => setViewPO(null)}
                className="px-4 py-2 bg-white border border-[#EBE3DB] text-[#211B17] font-bold text-xs rounded-xl hover:bg-[#FAF7F2] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: LOG SUPPLIER FOLLOW-UP                             */}
      {/* ========================================================= */}
      {showAddFollowupModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-black text-[#211B17]">Log Supplier Follow-up</h3>
              </div>
              <button
                onClick={() => setShowAddFollowupModal(false)}
                className="p-1 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFollowupSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#544B45] block mb-1">Select Purchase Order *</label>
                <select
                  value={selectedFollowupPoId}
                  onChange={(e) => setSelectedFollowupPoId(e.target.value)}
                  className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none"
                >
                  {purchaseOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.poNumber} • {po.supplierName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#544B45] block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newContactedPerson}
                    onChange={(e) => setNewContactedPerson(e.target.value)}
                    placeholder="e.g. Sales / Dispatch Mgr"
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#544B45] block mb-1">Channel</label>
                  <select
                    value={newCommChannel}
                    onChange={(e) => setNewCommChannel(e.target.value as any)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="Phone">Phone Call</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Site Visit">Site Visit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#544B45] block mb-1">Commitment Date</label>
                  <input
                    type="date"
                    value={newCommitmentDate}
                    onChange={(e) => setNewCommitmentDate(e.target.value)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#544B45] block mb-1">Delay Risk</label>
                  <select
                    value={newDelayRisk}
                    onChange={(e) => setNewDelayRisk(e.target.value as any)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="Low">Low (On Schedule)</option>
                    <option value="Medium">Medium (3-5 Days)</option>
                    <option value="High">High (Risk of Delay)</option>
                    <option value="Critical">Critical Shortage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#544B45] block mb-1">Remarks / Minutes</label>
                <textarea
                  rows={2}
                  value={newRemarks}
                  onChange={(e) => setNewRemarks(e.target.value)}
                  placeholder="Details of discussion, dispatch LR number, or fabrication status..."
                  className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowAddFollowupModal(false)}
                  className="px-4 py-2 bg-white border border-[#EBE3DB] text-[#211B17] font-bold text-xs rounded-xl hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#211B17]">Delete Purchase Order?</h3>
              <p className="text-xs text-[#70665F] mt-1">
                Are you sure you want to delete this purchase order? This action cannot be undone.
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
                onClick={() => {
                  deletePurchaseOrder(deleteConfirmId);
                  setDeleteConfirmId(null);
                  showToast('Purchase Order removed.');
                }}
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

export default function PurchaseOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[#70665F]">
          Loading Purchase Orders & Approvals Command Center...
        </div>
      }
    >
      <PurchaseOrdersHubContent />
    </Suspense>
  );
}
