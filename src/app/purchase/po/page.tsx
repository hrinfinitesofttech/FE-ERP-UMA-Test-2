'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
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

  // Direct Entry State
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [directJobId, setDirectJobId] = useState('');

  // Common PO fields
  const [newDeliveryDate, setNewDeliveryDate] = useState(
    new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
  );
  const [newPaymentTerms, setNewPaymentTerms] = useState('30 Days Credit');
  const [newDeliveryTerms, setNewDeliveryTerms] = useState('FOR Factory Gate');
  const [newDispatchMode, setNewDispatchMode] = useState('Road Transport');
  const [newSpecialInstructions, setNewSpecialInstructions] = useState('');

  // Direct Items State
  const [directItems, setDirectItems] = useState<
    Array<{
      itemCode: string;
      itemName: string;
      specification: string;
      category: string;
      unitOfMeasure: string;
      orderedQuantity: number;
      unitPrice: number;
      gstPercentage: number;
    }>
  >([
    {
      itemCode: 'MAT-SS316-PL',
      itemName: 'SS 316L 12mm Shell Plate',
      specification: 'ASTM A240 Grade 316L Mill Finish',
      category: 'Raw Material',
      unitOfMeasure: 'KG',
      orderedQuantity: 1500,
      unitPrice: 285,
      gstPercentage: 18,
    },
  ]);

  const handleAddDirectItem = () => {
    setDirectItems((prev) => [
      ...prev,
      {
        itemCode: `ITEM-${prev.length + 1}`,
        itemName: 'Fasteners / Raw Material',
        specification: 'Standard Specification',
        category: 'Raw Material',
        unitOfMeasure: 'NOS',
        orderedQuantity: 10,
        unitPrice: 150,
        gstPercentage: 18,
      },
    ]);
  };

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
        const itemTotal = it.orderedQuantity * it.unitPrice;
        return {
          id: `POI-${Date.now()}-${idx}`,
          itemCode: it.itemCode,
          itemName: it.itemName,
          specification: it.specification,
          category: it.category,
          orderedQuantity: it.orderedQuantity,
          unitOfMeasure: it.unitOfMeasure,
          unitPrice: it.unitPrice,
          totalPrice: itemTotal,
          gstPercentage: it.gstPercentage,
          netPrice: itemTotal,
          hsnCode: '7219',
        };
      });

      const subTotal = poItems.reduce((sum, item) => sum + item.netPrice, 0);
      const taxTotal = Math.round(subTotal * 0.18);
      const grandTotal = subTotal + taxTotal;

      const newPO: PurchaseOrder = {
        id: `PO-${Date.now().toString().slice(-6)}`,
        poNumber: poNum,
        poDate: new Date().toISOString().split('T')[0],
        supplierId: selectedSupplierId,
        supplierName,
        jobId: directJobId || 'JOB-2026-001',
        jobNumber: directJobId || 'JOB-2026-001',
        status: 'Submitted',
        expectedDeliveryDate: newDeliveryDate,
        paymentTerms: newPaymentTerms,
        deliveryTerms: newDeliveryTerms,
        dispatchMode: newDispatchMode,
        specialInstructions: newSpecialInstructions,
        subTotal,
        taxTotal,
        freightCharges: 0,
        grandTotal,
        items: poItems,
        revisionNumber: 0,
        createdAt: new Date().toISOString(),
      };

      addPurchaseOrder(newPO);
      setShowCreateModal(false);
      showToast(`Purchase Order ${newPO.poNumber} created successfully!`);
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
                ? 'bg-crm-brand-700 text-white shadow-xs'
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
                ? 'bg-crm-brand-700 text-white shadow-xs'
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
                ? 'bg-crm-brand-700 text-white shadow-xs'
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
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-[#8D7B70] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by PO #, supplier, or job..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-700 font-medium"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#FAF7F2] text-[#3E2723] border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Submitted">Submitted (Pending)</option>
                <option value="Ordered">Ordered / Dispatched</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="bg-[#FAF7F2] text-[#3E2723] border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">All Jobs ({projectJobs.length})</option>
                {projectJobs.map((j) => (
                  <option key={j.id} value={j.jobNumber || j.id}>
                    {j.jobNumber} • {j.productName?.slice(0, 20)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Purchase Order</span>
            </button>
          </div>

          {/* Orders Table */}
          <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F4EE] border-b border-[#EBE3DB] text-[#544B45] font-bold">
                  <tr>
                    <th className="py-3 px-3.5">PO Number</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Supplier Name</th>
                    <th className="py-3 px-3">Job / Project</th>
                    <th className="py-3 px-3 text-center">Delivery Date</th>
                    <th className="py-3 px-3 text-center">Items</th>
                    <th className="py-3 px-3 text-right">Grand Total</th>
                    <th className="py-3 px-3 text-center">Approval Status</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]">
                  {filteredPOs.length > 0 ? (
                    filteredPOs.map((po) => (
                      <tr key={po.id} className="hover:bg-[#FAF7F2] transition">
                        <td className="py-3 px-3.5 font-mono font-bold text-[#211B17]">
                          <div className="flex items-center gap-1.5">
                            <span>{po.poNumber}</span>
                            {po.revisionNumber && po.revisionNumber > 0 ? (
                              <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-bold">
                                Rev {po.revisionNumber}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[#70665F]">{po.poDate || po.createdAt?.slice(0, 10)}</td>
                        <td className="py-3 px-3 font-semibold text-[#211B17]">
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-[#8D7B70]" />
                            <span>{po.supplierName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-mono font-bold">
                            {po.jobNumber || po.jobId || 'Direct'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-[#211B17]">
                          {po.expectedDeliveryDate || '10 Days'}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-[#544B45]">
                          {po.items?.length || 1}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-[#211B17]">
                          {formatCurrency(po.grandTotal)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              po.status === 'Approved' || po.status === 'Ordered' || po.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {po.status}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewPO(po)}
                              className="p-1.5 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#EFE8DF] transition"
                              title="View PO Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {po.status === 'Submitted' && (
                              <button
                                onClick={() => handleApprovePO(po.id)}
                                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-xs transition"
                                title="Approve PO"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteConfirmId(po.id)}
                              className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition"
                              title="Delete PO"
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
                        No purchase orders found matching criteria.
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
                    ? 'bg-crm-brand-700 text-white shadow-xs'
                    : 'text-[#70665F] hover:text-[#211B17]'
                }`}
              >
                Pending Approvals ({pendingPOs.length})
              </button>
              <button
                onClick={() => setApprovalTab('revisions')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  approvalTab === 'revisions'
                    ? 'bg-crm-brand-700 text-white shadow-xs'
                    : 'text-[#70665F] hover:text-[#211B17]'
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
                            <span className="text-[#8D7B70]">Job / Project:</span>
                            <div className="font-bold text-[#211B17]">{po.jobNumber || po.jobId}</div>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-crm-brand-700" />
                <h3 className="text-base font-black text-[#211B17]">Create Purchase Order (PO)</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2 bg-[#FAF7F2] p-1 rounded-xl border border-[#EBE3DB] text-xs">
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

            <form onSubmit={handleCreatePOSubmit} className="space-y-4 text-xs">
              {createMode === 'from_quotation' ? (
                <div>
                  <label className="font-bold text-[#544B45] block mb-1">Select Supplier Quotation *</label>
                  <select
                    value={selectedQuoteId}
                    onChange={(e) => setSelectedQuoteId(e.target.value)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    {supplierQuotations.map((sq) => (
                      <option key={sq.id} value={sq.id}>
                        {sq.quotationNumber} • {sq.supplierName} • {formatCurrency(sq.grandTotal)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#544B45] block mb-1">Supplier *</label>
                    <select
                      required
                      value={selectedSupplierId}
                      onChange={(e) => setSelectedSupplierId(e.target.value)}
                      className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none"
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
                    <label className="font-bold text-[#544B45] block mb-1">Linked Job / Project</label>
                    <select
                      value={directJobId}
                      onChange={(e) => setDirectJobId(e.target.value)}
                      className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      {projectJobs.map((j) => (
                        <option key={j.id} value={j.jobNumber || j.id}>
                          {j.jobNumber} • {j.productName?.slice(0, 20)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#544B45] block mb-1">Delivery Due Date</label>
                  <input
                    type="date"
                    value={newDeliveryDate}
                    onChange={(e) => setNewDeliveryDate(e.target.value)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#544B45] block mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={newPaymentTerms}
                    onChange={(e) => setNewPaymentTerms(e.target.value)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#544B45] block mb-1">Delivery Terms</label>
                  <input
                    type="text"
                    value={newDeliveryTerms}
                    onChange={(e) => setNewDeliveryTerms(e.target.value)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              {createMode === 'direct' && (
                <div className="border border-[#EBE3DB] rounded-xl p-3 bg-[#FAF7F2] space-y-2">
                  <div className="flex items-center justify-between font-bold text-[#211B17]">
                    <span>PO Line Items</span>
                    <button
                      type="button"
                      onClick={handleAddDirectItem}
                      className="text-[11px] text-crm-brand-700 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  {directItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Item Code"
                        value={item.itemCode}
                        onChange={(e) => {
                          const c = [...directItems];
                          c[idx].itemCode = e.target.value;
                          setDirectItems(c);
                        }}
                        className="col-span-3 p-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Item Name"
                        value={item.itemName}
                        onChange={(e) => {
                          const c = [...directItems];
                          c[idx].itemName = e.target.value;
                          setDirectItems(c);
                        }}
                        className="col-span-4 p-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.orderedQuantity}
                        onChange={(e) => {
                          const c = [...directItems];
                          c[idx].orderedQuantity = Number(e.target.value);
                          setDirectItems(c);
                        }}
                        className="col-span-2 p-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs text-center"
                      />
                      <input
                        type="number"
                        placeholder="Rate"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const c = [...directItems];
                          c[idx].unitPrice = Number(e.target.value);
                          setDirectItems(c);
                        }}
                        className="col-span-3 p-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs text-right font-mono"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-white border border-[#EBE3DB] text-[#211B17] font-bold text-xs rounded-xl hover:bg-[#FAF7F2]"
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
      {/* MODAL: VIEW PURCHASE ORDER DETAILS                        */}
      {/* ========================================================= */}
      {viewPO && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <span className="text-[10px] text-[#8D7B70] font-mono">OFFICIAL PURCHASE ORDER</span>
                <h3 className="text-base font-black text-[#211B17]">{viewPO.poNumber}</h3>
              </div>
              <button
                onClick={() => setViewPO(null)}
                className="p-1 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <div className="text-[#8D7B70]">Vendor:</div>
                <div className="font-bold text-[#211B17]">{viewPO.supplierName}</div>
              </div>
              <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <div className="text-[#8D7B70]">PO Date:</div>
                <div className="font-bold text-[#211B17]">{viewPO.poDate}</div>
              </div>
              <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <div className="text-[#8D7B70]">Job Code:</div>
                <div className="font-bold text-[#211B17]">{viewPO.jobNumber || viewPO.jobId}</div>
              </div>
              <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <div className="text-[#8D7B70]">Grand Total:</div>
                <div className="font-bold text-emerald-700 text-sm font-mono">
                  {formatCurrency(viewPO.grandTotal)}
                </div>
              </div>
            </div>

            {/* Line items table */}
            <div className="border border-[#EBE3DB] rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#FAF7F2] border-b border-[#EBE3DB] text-[#544B45] font-bold">
                  <tr>
                    <th className="py-2 px-3">Item Name</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Rate</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]">
                  {(viewPO.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-semibold text-[#211B17]">{it.itemName}</td>
                      <td className="py-2 px-3 text-center font-mono">{it.orderedQuantity || it.quantity || 1}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatCurrency(it.unitPrice)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-[#211B17]">
                        {formatCurrency(it.totalPrice || it.netPrice || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EBE3DB]">
              <button
                onClick={() => setViewPO(null)}
                className="px-4 py-2 bg-white border border-[#EBE3DB] text-[#211B17] font-bold text-xs rounded-xl hover:bg-[#FAF7F2]"
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
