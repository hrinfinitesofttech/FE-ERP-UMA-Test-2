'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { SupplierQuotation, SupplierQuotationItem } from '../../../types/purchase';

export default function SupplierQuotationsPage() {
  const {
    supplierQuotations,
    addSupplierQuotation,
    updateSupplierQuotation,
    deleteSupplierQuotation,
    approveSupplierQuotation,
    rfqs,
    suppliers,
    projectJobs,
    currentUser,
  } = useERP();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rfqFilter, setRfqFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [viewQuote, setViewQuote] = useState<SupplierQuotation | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editQuote, setEditQuote] = useState<SupplierQuotation | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State (Record New)
  const [newRfqId, setNewRfqId] = useState('');
  const [newSupplierId, setNewSupplierId] = useState('');
  const [newRefNumber, setNewRefNumber] = useState('');
  const [newQuoteDate, setNewQuoteDate] = useState('');
  const [newValidUntil, setNewValidUntil] = useState('');
  const [newPaymentTerms, setNewPaymentTerms] = useState('30 Days Credit');
  const [newDeliveryTerms, setNewDeliveryTerms] = useState('FOR Destination');
  const [newLeadTimeDays, setNewLeadTimeDays] = useState(7);
  const [newFreightCharges, setNewFreightCharges] = useState(0);
  const [newGstPercentage, setNewGstPercentage] = useState(18);
  const [newTechnicalStatus, setNewTechnicalStatus] = useState('Compliant');
  const [quoteItems, setQuoteItems] = useState<Partial<SupplierQuotationItem>[]>([]);

  // Form State (Editing)
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper to get Customer Name and Product Name linked to an RFQ
  const getRfqJobDetails = useMemo(() => {
    return (rfqIdOrNum: string) => {
      const rfq = rfqs.find(
        (r) =>
          r.id === rfqIdOrNum ||
          r.rfqNumber === rfqIdOrNum ||
          String(r.id) === String(rfqIdOrNum)
      );
      if (!rfq) return null;
      const job = projectJobs.find(
        (j) =>
          j.id === rfq.jobId ||
          j.jobNumber === rfq.jobId ||
          j.jobCode === rfq.jobId
      );
      return {
        rfq,
        job,
        customerName: job?.customerName || 'Standard Procurement',
        productName: job?.productName || 'Industrial Equipment',
      };
    };
  }, [rfqs, projectJobs]);

  // Initialize form defaults for Record modal
  const initRecordForm = () => {
    const today = new Date().toISOString().split('T')[0];
    const valid = new Date();
    valid.setDate(valid.getDate() + 30);

    const defaultRfq = rfqs[0]?.id || '';
    const defaultSupp = suppliers[0]?.id || '';

    setNewRfqId(defaultRfq);
    setNewSupplierId(defaultSupp);
    setNewQuoteDate(today);
    setNewValidUntil(valid.toISOString().split('T')[0]);
    setNewRefNumber(`SQ-REF-${Math.floor(1000 + Math.random() * 9000)}`);
    setNewPaymentTerms('30 Days Credit');
    setNewDeliveryTerms('FOR Destination');
    setNewLeadTimeDays(7);
    setNewFreightCharges(0);
    setNewGstPercentage(18);
    setNewTechnicalStatus('Compliant');

    // Populate initial items from default RFQ
    const activeRfq = rfqs.find((r) => r.id === defaultRfq) || rfqs[0];
    if (activeRfq && Array.isArray(activeRfq.items) && activeRfq.items.length > 0) {
      setQuoteItems(
        activeRfq.items.map((it: any, idx: number) => {
          const qty = Number(it.requiredQuantity || it.required_quantity || 1);
          const price = Number(it.targetPrice || it.target_price || it.estimatedUnitPrice || 100);
          return {
            id: `SQI-NEW-${idx}`,
            itemCode: it.itemCode || it.item_code || `ITEM-${idx + 1}`,
            itemName: it.itemName || it.item_name || 'Standard Item',
            specification: it.specification || '',
            category: it.category || 'Raw Material',
            unitOfMeasure: it.unitOfMeasure || it.unit_of_measure || 'NOS',
            quotedQuantity: qty,
            unitPrice: price,
            totalPrice: qty * price,
            discountPercentage: 0,
            gstPercentage: 18,
            netPrice: qty * price * 1.18,
            leadTimeDays: 7,
            technicalCompliant: true,
          };
        })
      );
    } else {
      setQuoteItems([
        {
          id: 'SQI-NEW-0',
          itemCode: 'ITEM-001',
          itemName: 'Raw Material Plate / Pipe',
          specification: 'Standard Specification IS 2062',
          category: 'Raw Material',
          unitOfMeasure: 'NOS',
          quotedQuantity: 10,
          unitPrice: 500,
          totalPrice: 5000,
          discountPercentage: 0,
          gstPercentage: 18,
          netPrice: 5900,
          leadTimeDays: 7,
          technicalCompliant: true,
        },
      ]);
    }
  };

  // Sync line items when RFQ changes in Record modal
  const handleRfqChange = (selectedRfqId: string) => {
    setNewRfqId(selectedRfqId);
    const activeRfq = rfqs.find((r) => r.id === selectedRfqId || r.rfqNumber === selectedRfqId);
    if (activeRfq && Array.isArray(activeRfq.items) && activeRfq.items.length > 0) {
      setQuoteItems(
        activeRfq.items.map((it: any, idx: number) => {
          const qty = Number(it.requiredQuantity || it.required_quantity || 1);
          const price = Number(it.targetPrice || it.target_price || it.estimatedUnitPrice || 100);
          return {
            id: `SQI-${Date.now()}-${idx}`,
            itemCode: it.itemCode || it.item_code || `ITEM-${idx + 1}`,
            itemName: it.itemName || it.item_name || 'Item',
            specification: it.specification || '',
            category: it.category || 'Raw Material',
            unitOfMeasure: it.unitOfMeasure || it.unit_of_measure || 'NOS',
            quotedQuantity: qty,
            unitPrice: price,
            totalPrice: qty * price,
            discountPercentage: 0,
            gstPercentage: newGstPercentage,
            netPrice: qty * price * (1 + newGstPercentage / 100),
            leadTimeDays: 7,
            technicalCompliant: true,
          };
        })
      );
    }
  };

  // Item change handler for Record modal
  const handleItemChange = (idx: number, field: keyof SupplierQuotationItem, val: any) => {
    setQuoteItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      const qty = Number(updated[idx].quotedQuantity || 0);
      const price = Number(updated[idx].unitPrice || 0);
      const disc = Number(updated[idx].discountPercentage || 0);
      const lineSub = qty * price * (1 - disc / 100);
      updated[idx].totalPrice = lineSub;
      updated[idx].netPrice = lineSub * (1 + newGstPercentage / 100);
      return updated;
    });
  };

  // Add Item Row (Record modal)
  const handleAddItemRow = () => {
    setQuoteItems((prev) => [
      ...prev,
      {
        id: `SQI-${Date.now()}-${prev.length}`,
        itemCode: `ITEM-${String(prev.length + 1).padStart(3, '0')}`,
        itemName: 'New Quoted Item',
        specification: 'Standard Grade',
        category: 'Raw Material',
        unitOfMeasure: 'NOS',
        quotedQuantity: 1,
        unitPrice: 100,
        totalPrice: 100,
        discountPercentage: 0,
        gstPercentage: newGstPercentage,
        netPrice: 100 * (1 + newGstPercentage / 100),
        leadTimeDays: 7,
        technicalCompliant: true,
      },
    ]);
  };

  // Remove Item Row (Record modal)
  const handleRemoveItemRow = (idx: number) => {
    if (quoteItems.length <= 1) {
      alert('At least one item is required in the quotation.');
      return;
    }
    setQuoteItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit Handler for Record Quotation
  const handleRecordQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const effectiveRfqId = newRfqId || rfqs[0]?.id || 'RFQ-DEFAULT';
    const effectiveSupplierId = newSupplierId || suppliers[0]?.id || 'SUP-DEFAULT';

    const rfqObj = rfqs.find(
      (r) =>
        r.id === effectiveRfqId ||
        r.rfqNumber === effectiveRfqId ||
        String(r.id) === String(effectiveRfqId)
    );

    const suppObj = suppliers.find(
      (s) =>
        s.id === effectiveSupplierId ||
        String(s.id) === String(effectiveSupplierId) ||
        s.name === effectiveSupplierId
    );

    const rfqNumber = rfqObj ? rfqObj.rfqNumber || rfqObj.id : effectiveRfqId;
    const supplierName = suppObj ? suppObj.name : 'Registered Supplier';
    const supplierId = suppObj ? suppObj.id : effectiveSupplierId;

    const formattedItems: SupplierQuotationItem[] = quoteItems.map((qi, idx) => {
      const qty = Number(qi.quotedQuantity || 1);
      const price = Number(qi.unitPrice || 0);
      const disc = Number(qi.discountPercentage || 0);
      const tot = qty * price * (1 - disc / 100);
      return {
        id: qi.id || `SQI-${Date.now()}-${idx}`,
        quotationId: '',
        itemCode: qi.itemCode || `ITEM-${idx + 1}`,
        itemName: qi.itemName || 'Quoted Item',
        specification: qi.specification || '',
        category: (qi.category as any) || 'Raw Material',
        unitOfMeasure: qi.unitOfMeasure || 'NOS',
        quotedQuantity: qty,
        unitPrice: price,
        totalPrice: tot,
        discountPercentage: disc,
        gstPercentage: newGstPercentage,
        netPrice: tot * (1 + newGstPercentage / 100),
        leadTimeDays: Number(qi.leadTimeDays || newLeadTimeDays || 7),
        technicalCompliant: qi.technicalCompliant ?? true,
        remarks: qi.remarks || 'Quotation verified',
      };
    });

    const subTotal = formattedItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const taxTotal = (subTotal * Number(newGstPercentage || 0)) / 100;
    const grandTotal = subTotal + taxTotal + Number(newFreightCharges || 0);

    const quotationId = `SQ-${Date.now()}`;
    const generatedQuoteNumber = `SQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newQuotation: SupplierQuotation = {
      id: quotationId,
      quotationNumber: generatedQuoteNumber,
      rfqId: rfqObj?.id || effectiveRfqId,
      rfqNumber: rfqNumber,
      supplierId: supplierId,
      supplierName: supplierName,
      supplierQuotationRef: newRefNumber || `REF-${Date.now()}`,
      quotationDate: newQuoteDate || new Date().toISOString().split('T')[0],
      validityDate: newValidUntil || '',
      validUntil: newValidUntil || '',
      paymentTerms: newPaymentTerms || suppObj?.paymentTerms || '30 Days Credit',
      deliveryTerms: newDeliveryTerms || 'FOR Destination',
      leadTimeDays: Number(newLeadTimeDays || 7),
      currency: 'INR',
      subTotal: Math.round(subTotal),
      taxTotal: Math.round(taxTotal),
      freightCharges: Number(newFreightCharges || 0),
      grandTotal: Math.round(grandTotal),
      technicalStatus: newTechnicalStatus,
      items: formattedItems,
      recordedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Purchase Officer',
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addSupplierQuotation(newQuotation);
    setShowRecordModal(false);
    showToast(`✓ Supplier Quotation ${generatedQuoteNumber} created and saved successfully!`);
  };

  // Open Edit Modal
  const handleOpenEdit = (quote: SupplierQuotation) => {
    setEditQuote(quote);
    setEditRefNumber(quote.supplierQuotationRef || '');
    setEditQuoteDate(quote.quotationDate || '');
    setEditValidUntil(quote.validityDate || quote.validUntil || '');
    setEditPaymentTerms(quote.paymentTerms || '30 Days Credit');
    setEditDeliveryTerms(quote.deliveryTerms || 'FOR Destination');
    setEditLeadTimeDays(quote.leadTimeDays || 7);
    setEditFreightCharges(quote.freightCharges || 0);
    setEditGstPercentage(quote.items?.[0]?.gstPercentage || 18);
    setEditTechnicalStatus(quote.technicalStatus || 'Compliant');
    setEditItems(quote.items || []);
  };

  // Edit Item Change Handler
  const handleEditItemChange = (idx: number, field: keyof SupplierQuotationItem, val: any) => {
    setEditItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      const qty = Number(updated[idx].quotedQuantity || 0);
      const price = Number(updated[idx].unitPrice || 0);
      const disc = Number(updated[idx].discountPercentage || 0);
      const lineSub = qty * price * (1 - disc / 100);
      updated[idx].totalPrice = lineSub;
      updated[idx].netPrice = lineSub * (1 + editGstPercentage / 100);
      return updated;
    });
  };

  // Edit Add Item Row
  const handleEditAddItemRow = () => {
    setEditItems((prev) => [
      ...prev,
      {
        id: `SQI-${Date.now()}-${prev.length}`,
        quotationId: editQuote?.id,
        itemCode: `ITEM-${String(prev.length + 1).padStart(3, '0')}`,
        itemName: 'Additional Item',
        specification: 'Standard Grade',
        category: 'Raw Material',
        unitOfMeasure: 'NOS',
        quotedQuantity: 1,
        unitPrice: 100,
        totalPrice: 100,
        discountPercentage: 0,
        gstPercentage: editGstPercentage,
        netPrice: 100 * (1 + editGstPercentage / 100),
        leadTimeDays: 7,
        technicalCompliant: true,
      },
    ]);
  };

  // Edit Remove Item Row
  const handleEditRemoveItemRow = (idx: number) => {
    if (editItems.length <= 1) {
      alert('At least one item is required in the quotation.');
      return;
    }
    setEditItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit Handler for Edit Quotation
  const handleEditQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editQuote) return;

    const formattedItems = editItems.map((qi, idx) => {
      const qty = Number(qi.quotedQuantity || 1);
      const price = Number(qi.unitPrice || 0);
      const disc = Number(qi.discountPercentage || 0);
      const tot = qty * price * (1 - disc / 100);
      return {
        ...qi,
        id: qi.id || `SQI-${Date.now()}-${idx}`,
        quotedQuantity: qty,
        unitPrice: price,
        totalPrice: tot,
        discountPercentage: disc,
        gstPercentage: editGstPercentage,
        netPrice: tot * (1 + editGstPercentage / 100),
      };
    });

    const subTotal = formattedItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const taxTotal = (subTotal * Number(editGstPercentage || 0)) / 100;
    const grandTotal = subTotal + taxTotal + Number(editFreightCharges || 0);

    const updatedData: Partial<SupplierQuotation> = {
      supplierQuotationRef: editRefNumber,
      quotationDate: editQuoteDate,
      validityDate: editValidUntil,
      validUntil: editValidUntil,
      paymentTerms: editPaymentTerms,
      deliveryTerms: editDeliveryTerms,
      leadTimeDays: Number(editLeadTimeDays),
      freightCharges: Number(editFreightCharges),
      subTotal: Math.round(subTotal),
      taxTotal: Math.round(taxTotal),
      grandTotal: Math.round(grandTotal),
      technicalStatus: editTechnicalStatus,
      items: formattedItems,
    };

    updateSupplierQuotation(editQuote.id, updatedData);
    setEditQuote(null);
    showToast(`✓ Supplier Quotation ${editQuote.quotationNumber} updated successfully!`);
  };

  // Delete Handler
  const handleDeleteConfirm = () => {
    if (!deleteConfirmId) return;
    deleteSupplierQuotation(deleteConfirmId);
    setDeleteConfirmId(null);
    if (viewQuote?.id === deleteConfirmId) setViewQuote(null);
    showToast('✓ Supplier Quotation deleted successfully.');
  };

  // Quick Approve Handler
  const handleQuickApprove = (quote: SupplierQuotation) => {
    const approver = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Purchase Manager';
    approveSupplierQuotation(quote.id, approver);
    showToast(`✓ Quotation ${quote.quotationNumber} Approved!`);
  };

  // Filtered List
  const filteredQuotes = useMemo(() => {
    return supplierQuotations.filter((q) => {
      if (rfqFilter !== 'ALL' && q.rfqId !== rfqFilter && q.rfqNumber !== rfqFilter) return false;
      if (statusFilter !== 'ALL' && q.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (searchQuery) {
        const queryStr = searchQuery.toLowerCase();
        return (
          q.quotationNumber?.toLowerCase().includes(queryStr) ||
          q.supplierName?.toLowerCase().includes(queryStr) ||
          q.supplierQuotationRef?.toLowerCase().includes(queryStr) ||
          q.rfqNumber?.toLowerCase().includes(queryStr)
        );
      }
      return true;
    });
  }, [supplierQuotations, rfqFilter, statusFilter, searchQuery]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = supplierQuotations.length;
    const totalVal = supplierQuotations.reduce((acc, q) => acc + (q.grandTotal || 0), 0);
    const compliant = supplierQuotations.filter((q) => q.technicalStatus?.toLowerCase() === 'compliant').length;
    const avgLead = total > 0 ? Math.round(supplierQuotations.reduce((acc, q) => acc + (q.leadTimeDays || 7), 0) / total) : 0;
    return { total, totalVal, compliant, avgLead };
  }, [supplierQuotations]);

  if (!mounted) {
    return (
      <div className="p-6 space-y-6 bg-[#FAF7F2] min-h-screen text-[#544B45]">
        <div className="flex items-center justify-between pb-4 border-b border-[#EBE3DB]">
          <h1 className="text-2xl font-black text-[#211B17]">Supplier Quotations Register</h1>
        </div>
        <div className="p-12 text-center text-sm text-[#70665F]">Loading Supplier Quotations...</div>
      </div>
    );
  }

  // Active form calculations for record modal
  const recordSubTotal = quoteItems.reduce(
    (sum, it) =>
      sum +
      Number(it.quotedQuantity || 0) *
        Number(it.unitPrice || 0) *
        (1 - Number(it.discountPercentage || 0) / 100),
    0
  );
  const recordTaxTotal = (recordSubTotal * Number(newGstPercentage || 0)) / 100;
  const recordGrandTotal = recordSubTotal + recordTaxTotal + Number(newFreightCharges || 0);

  // Active form calculations for edit modal
  const editSubTotal = editItems.reduce(
    (sum, it) =>
      sum +
      Number(it.quotedQuantity || 0) *
        Number(it.unitPrice || 0) *
        (1 - Number(it.discountPercentage || 0) / 100),
    0
  );
  const editTaxTotal = (editSubTotal * Number(editGstPercentage || 0)) / 100;
  const editGrandTotal = editSubTotal + editTaxTotal + Number(editFreightCharges || 0);

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-2xl animate-fade-in border border-emerald-400 font-medium text-xs">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBE3DB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 text-xs font-mono font-bold border border-amber-500/30">
              PURCHASE MODULE
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Supplier Quotations Register</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Record received vendor price bids, lead times & technical compliance for RFQs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              initRecordForm();
              setShowRecordModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Supplier Quotation
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EBE3DB] p-4 rounded-2xl shadow-sm">
          <div className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider">Total Received</div>
          <div className="text-2xl font-black text-[#211B17] mt-1">{stats.total}</div>
          <div className="text-[10px] text-amber-600 mt-0.5 font-medium">Bids in Database</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-2xl shadow-sm">
          <div className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider">Total Quoted Value</div>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
            ₹{stats.totalVal >= 100000 ? (stats.totalVal / 100000).toFixed(2) + ' L' : stats.totalVal.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-[#70665F] mt-0.5">Cumulative Quotations</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-2xl shadow-sm">
          <div className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider">Tech Compliant</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{stats.compliant}</div>
          <div className="text-[10px] text-blue-600 mt-0.5 font-medium">Passed Specs</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-2xl shadow-sm">
          <div className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider">Avg Lead Time</div>
          <div className="text-2xl font-black text-purple-700 mt-1 font-mono">{stats.avgLead} Days</div>
          <div className="text-[10px] text-purple-600 mt-0.5 font-medium">Delivery Speed</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#70665F]" />
            <input
              type="text"
              placeholder="Search Quotation No, Supplier, Ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-amber-500 w-64"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#70665F] font-semibold">RFQ:</span>
            <select
              value={rfqFilter}
              onChange={(e) => setRfqFilter(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-xs text-[#211B17] focus:outline-none cursor-pointer max-w-[280px]"
            >
              <option value="ALL">All RFQs</option>
              {rfqs.map((r) => {
                const details = getRfqJobDetails(r.id);
                return (
                  <option key={r.id} value={r.id}>
                    {r.rfqNumber || r.id} — [{details?.customerName || 'Customer'}]
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#70665F] font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-xs text-[#211B17] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Under Review">Under Review</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#70665F]">
          Showing <span className="text-[#211B17] font-bold">{filteredQuotes.length}</span> received quotations
        </div>
      </div>

      {/* Quotations List Table */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3">Quotation ID & Ref</th>
                <th className="p-3">Supplier Name</th>
                <th className="p-3">RFQ & Customer Reference</th>
                <th className="p-3">Quote Date</th>
                <th className="p-3">Lead Time</th>
                <th className="p-3 text-right">Grand Total (Inc Tax)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#70665F]">
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-[#70665F]/40 mb-2" />
                    No supplier quotations match the current filter.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => {
                  const details = getRfqJobDetails(q.rfqId || q.rfqNumber);
                  const isApproved = q.status?.toLowerCase() === 'approved';
                  return (
                    <tr key={q.id} className="hover:bg-[#FAF7F2]/60 transition">
                      <td className="p-3 font-mono font-bold text-amber-700">
                        {q.quotationNumber}
                        <div className="text-[10px] text-[#70665F] font-normal">{q.supplierQuotationRef}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-[#211B17]">{q.supplierName}</div>
                        <div className="text-[10px] text-[#70665F]">{q.paymentTerms || '30 Days Credit'}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono font-bold text-blue-700">{q.rfqNumber}</div>
                        <div className="text-[10px] text-stone-600 font-medium">
                          {details ? `[${details.customerName}] ${details.productName}` : 'Standard Job'}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[#544B45] text-[11px]">{q.quotationDate}</td>
                      <td className="p-3 font-mono text-[#544B45]">{q.leadTimeDays} Days</td>
                      <td className="p-3 text-right font-mono font-black text-emerald-700 text-sm">
                        ₹{(q.grandTotal || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isApproved
                              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-700 border-amber-500/30'
                          }`}
                        >
                          {isApproved ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {q.status || 'Submitted'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isApproved && (
                            <button
                              title="Approve Quotation"
                              onClick={() => handleQuickApprove(q)}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            title="View Details"
                            onClick={() => setViewQuote(q)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#544B45] hover:text-[#211B17] transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Edit Quotation"
                            onClick={() => handleOpenEdit(q)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-amber-700 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete Quotation"
                            onClick={() => setDeleteConfirmId(q.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* VIEW QUOTE MODAL */}
      {viewQuote && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-800 px-2 py-0.5 rounded font-bold">
                  SUPPLIER QUOTATION DETAILS
                </span>
                <h2 className="text-xl font-black text-[#211B17] mt-1">{viewQuote.quotationNumber}</h2>
                <div className="text-xs text-[#70665F] font-mono">Ref: {viewQuote.supplierQuotationRef}</div>
              </div>
              <button onClick={() => setViewQuote(null)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <div>
                  <div className="text-[#70665F]">Supplier:</div>
                  <div className="font-bold text-[#211B17] text-sm">{viewQuote.supplierName}</div>
                </div>
                <div>
                  <div className="text-[#70665F]">RFQ Ref:</div>
                  <div className="font-bold font-mono text-blue-700">{viewQuote.rfqNumber}</div>
                </div>
                <div>
                  <div className="text-[#70665F]">Quote Date:</div>
                  <div className="font-mono text-[#544B45]">{viewQuote.quotationDate}</div>
                </div>
                <div>
                  <div className="text-[#70665F]">Validity Date:</div>
                  <div className="font-mono text-[#544B45]">{viewQuote.validityDate || viewQuote.validUntil || '30 Days'}</div>
                </div>
                <div>
                  <div className="text-[#70665F]">Lead Time:</div>
                  <div className="font-bold text-[#211B17]">{viewQuote.leadTimeDays} Days</div>
                </div>
                <div>
                  <div className="text-[#70665F]">Payment Terms:</div>
                  <div className="font-medium text-[#211B17]">{viewQuote.paymentTerms || '30 Days Credit'}</div>
                </div>
                <div>
                  <div className="text-[#70665F]">Delivery Terms:</div>
                  <div className="font-medium text-[#211B17]">{viewQuote.deliveryTerms || 'FOR Destination'}</div>
                </div>
                <div>
                  <div className="text-[#70665F]">Technical Status:</div>
                  <div className="font-bold text-emerald-700">{viewQuote.technicalStatus || 'Compliant'}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#211B17] mb-2">Quoted Line Items</h4>
                <div className="border border-[#EBE3DB] rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF7F2] text-[#70665F]">
                      <tr>
                        <th className="p-2.5">Item Name & Spec</th>
                        <th className="p-2.5 text-right">Quoted Qty</th>
                        <th className="p-2.5 text-right">Unit Rate (₹)</th>
                        <th className="p-2.5 text-right">Disc %</th>
                        <th className="p-2.5 text-right">Line Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE3DB]">
                      {(viewQuote.items || []).map((it, idx) => (
                        <tr key={it.id || idx}>
                          <td className="p-2.5">
                            <div className="font-semibold text-[#211B17]">{it.itemName}</div>
                            <div className="text-[10px] text-[#70665F] font-mono">
                              {it.itemCode} {it.specification ? `• ${it.specification}` : ''}
                            </div>
                          </td>
                          <td className="p-2.5 text-right font-mono font-medium">
                            {it.quotedQuantity || it.quantity} {it.unitOfMeasure || 'NOS'}
                          </td>
                          <td className="p-2.5 text-right font-mono">₹{(it.unitPrice || 0).toLocaleString('en-IN')}</td>
                          <td className="p-2.5 text-right font-mono">{it.discountPercentage || 0}%</td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                            ₹{(it.totalPrice || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#70665F]">
                    <span>Subtotal:</span>
                    <span className="font-mono text-[#211B17]">₹{(viewQuote.subTotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#70665F]">
                    <span>GST Tax:</span>
                    <span className="font-mono text-[#211B17]">₹{(viewQuote.taxTotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#70665F]">
                    <span>Freight Charges:</span>
                    <span className="font-mono text-[#211B17]">₹{(viewQuote.freightCharges || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-[#EBE3DB] pt-1.5 flex justify-between font-black text-[#211B17]">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-700 text-sm">₹{(viewQuote.grandTotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FAF7F2] border-t border-[#EBE3DB] flex items-center justify-between">
              <div className="text-[11px] text-[#70665F]">
                Recorded by: <span className="font-semibold text-[#211B17]">{viewQuote.recordedBy || 'Purchase Team'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const q = viewQuote;
                    setViewQuote(null);
                    handleOpenEdit(q);
                  }}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-[#211B17] font-bold rounded-xl transition"
                >
                  Edit Quotation
                </button>
                <button
                  onClick={() => setViewQuote(null)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECORD NEW QUOTATION MODAL */}
      {showRecordModal && (
        <div
          onClick={() => setShowRecordModal(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-[#211B17]">Record Received Supplier Quotation</h2>
                <p className="text-xs text-[#70665F]">Enter received vendor quotation details, pricing, and item rates.</p>
              </div>
              <button onClick={() => setShowRecordModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordQuoteSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#70665F] mb-1 font-semibold">Select RFQ *</label>
                  <select
                    value={newRfqId}
                    onChange={(e) => handleRfqChange(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-medium focus:outline-none focus:border-amber-500"
                    required
                  >
                    {rfqs.length === 0 ? (
                      <option value="RFQ-MANUAL">General / Ad-hoc Quotation</option>
                    ) : (
                      rfqs.map((r) => {
                        const details = getRfqJobDetails(r.id);
                        return (
                          <option key={r.id} value={r.id}>
                            {r.rfqNumber || r.id} — [{details?.customerName || 'Customer'}] {details?.productName || ''}
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[#70665F] mb-1 font-semibold">Select Bidding Supplier *</label>
                  <select
                    value={newSupplierId}
                    onChange={(e) => setNewSupplierId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-medium focus:outline-none focus:border-amber-500"
                    required
                  >
                    {suppliers.length === 0 ? (
                      <option value="SUP-GENERAL">Standard Vendor</option>
                    ) : (
                      suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.category || 'Vendor'})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#70665F] mb-1 font-semibold">Vendor Quotation Ref No *</label>
                  <input
                    type="text"
                    value={newRefNumber}
                    onChange={(e) => setNewRefNumber(e.target.value)}
                    placeholder="e.g. SQ-REF-4481"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1 font-semibold">Quotation Date *</label>
                  <input
                    type="date"
                    value={newQuoteDate}
                    onChange={(e) => setNewQuoteDate(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1 font-semibold">Validity Date *</label>
                  <input
                    type="date"
                    value={newValidUntil}
                    onChange={(e) => setNewValidUntil(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#70665F] mb-1 font-semibold">Delivery Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={newLeadTimeDays}
                    onChange={(e) => setNewLeadTimeDays(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1 font-semibold">Payment Terms</label>
                  <input
                    type="text"
                    value={newPaymentTerms}
                    onChange={(e) => setNewPaymentTerms(e.target.value)}
                    placeholder="e.g. 30 Days Credit"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1 font-semibold">Technical Compliance</label>
                  <select
                    value={newTechnicalStatus}
                    onChange={(e) => setNewTechnicalStatus(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] focus:outline-none focus:border-amber-500"
                  >
                    <option value="Compliant">Compliant</option>
                    <option value="Partially Compliant">Partially Compliant</option>
                    <option value="Deviation Noted">Deviation Noted</option>
                  </select>
                </div>
              </div>

              {/* Quoted Line Items Table */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#211B17]">Quoted Line Items ({quoteItems.length})</span>
                    <span className="text-[11px] text-[#70665F] ml-2">Edit unit rates and quantities as per vendor bid</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 font-bold text-[11px] rounded-lg hover:bg-amber-100 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item Row
                  </button>
                </div>

                <div className="border border-[#EBE3DB] rounded-xl overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF7F2] text-[#70665F]">
                      <tr>
                        <th className="p-2.5">Item Name & Spec</th>
                        <th className="p-2.5 text-right w-24">Quoted Qty</th>
                        <th className="p-2.5 text-right w-28">Unit Rate (₹)</th>
                        <th className="p-2.5 text-right w-20">Disc %</th>
                        <th className="p-2.5 text-right w-28">Line Total (₹)</th>
                        <th className="p-2.5 text-center w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE3DB]">
                      {quoteItems.map((it, idx) => {
                        const lineTot =
                          Number(it.quotedQuantity || 0) *
                          Number(it.unitPrice || 0) *
                          (1 - Number(it.discountPercentage || 0) / 100);
                        return (
                          <tr key={it.id || idx} className="bg-white">
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={it.itemName || ''}
                                onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                                placeholder="Item Description"
                                className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-1 rounded text-xs font-semibold text-[#211B17] mb-1"
                              />
                              <input
                                type="text"
                                value={it.specification || ''}
                                onChange={(e) => handleItemChange(idx, 'specification', e.target.value)}
                                placeholder="Specification (Grade, Make, Size)"
                                className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-1 rounded text-[10px] text-[#70665F] font-mono"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                min="1"
                                value={it.quotedQuantity}
                                onChange={(e) => handleItemChange(idx, 'quotedQuantity', Number(e.target.value))}
                                className="w-20 bg-[#FAF7F2] border border-[#EBE3DB] p-1.5 rounded text-right font-mono text-[#211B17]"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                min="0"
                                value={it.unitPrice}
                                onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                                className="w-24 bg-[#FAF7F2] border border-[#EBE3DB] p-1.5 rounded text-right font-mono text-[#211B17]"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={it.discountPercentage || 0}
                                onChange={(e) => handleItemChange(idx, 'discountPercentage', Number(e.target.value))}
                                className="w-16 bg-[#FAF7F2] border border-[#EBE3DB] p-1.5 rounded text-right font-mono text-[#211B17]"
                              />
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                              ₹{Math.round(lineTot).toLocaleString('en-IN')}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItemRow(idx)}
                                className="p-1 rounded text-rose-500 hover:bg-rose-50 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Freight, GST & Total Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[#70665F] mb-1 font-semibold">Freight & Transport Charges (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={newFreightCharges}
                      onChange={(e) => setNewFreightCharges(Number(e.target.value))}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[#70665F] mb-1 font-semibold">GST Tax Rate (%)</label>
                    <select
                      value={newGstPercentage}
                      onChange={(e) => setNewGstPercentage(Number(e.target.value))}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>0% (Exempt)</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18% Standard</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-1.5 flex flex-col justify-center">
                  <div className="flex justify-between text-[#70665F]">
                    <span>Subtotal:</span>
                    <span className="font-mono text-[#211B17] font-bold">₹{Math.round(recordSubTotal).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#70665F]">
                    <span>GST ({newGstPercentage}%):</span>
                    <span className="font-mono text-[#211B17]">₹{Math.round(recordTaxTotal).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#70665F]">
                    <span>Freight:</span>
                    <span className="font-mono text-[#211B17]">₹{Number(newFreightCharges || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-[#EBE3DB] pt-1.5 flex justify-between font-black text-[#211B17] text-sm">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-700 font-black">₹{Math.round(recordGrandTotal).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 bg-[#FAF7F2] text-[#211B17] font-bold rounded-xl hover:bg-stone-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 transition cursor-pointer"
                >
                  Save Received Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT QUOTATION MODAL */}
      {editQuote && (
        <div
          onClick={() => setEditQuote(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-800 px-2 py-0.5 rounded font-bold">
                  EDIT QUOTATION
                </span>
                <h2 className="text-lg font-black text-[#211B17] mt-1">{editQuote.quotationNumber}</h2>
                <div className="text-xs text-[#70665F]">Supplier: {editQuote.supplierName} | RFQ: {editQuote.rfqNumber}</div>
              </div>
              <button onClick={() => setEditQuote(null)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditQuoteSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#70665F] mb-1 font-semibold">Vendor Quotation Ref No *</label>
                  <input
                    type="text"
                    value={editRefNumber}
                    onChange={(e) => setEditRefNumber(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1 font-semibold">Quotation Date *</label>
                  <input
                    type="date"
                    value={editQuoteDate}
                    onChange={(e) => setEditQuoteDate(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1 font-semibold">Validity Date *</label>
                  <input
                    type="date"
                    value={editValidUntil}
                    onChange={(e) => setEditValidUntil(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#70665F] mb-1 font-semibold">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={editLeadTimeDays}
                    onChange={(e) => setEditLeadTimeDays(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1 font-semibold">Payment Terms</label>
                  <input
                    type="text"
                    value={editPaymentTerms}
                    onChange={(e) => setEditPaymentTerms(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1 font-semibold">Technical Compliance</label>
                  <select
                    value={editTechnicalStatus}
                    onChange={(e) => setEditTechnicalStatus(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] focus:outline-none focus:border-amber-500"
                  >
                    <option value="Compliant">Compliant</option>
                    <option value="Partially Compliant">Partially Compliant</option>
                    <option value="Deviation Noted">Deviation Noted</option>
                  </select>
                </div>
              </div>

              {/* Items in Edit Modal */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#211B17]">Quoted Line Items ({editItems.length})</span>
                  <button
                    type="button"
                    onClick={handleEditAddItemRow}
                    className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 font-bold text-[11px] rounded-lg hover:bg-amber-100 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item Row
                  </button>
                </div>

                <div className="border border-[#EBE3DB] rounded-xl overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF7F2] text-[#70665F]">
                      <tr>
                        <th className="p-2.5">Item Name & Spec</th>
                        <th className="p-2.5 text-right w-24">Quoted Qty</th>
                        <th className="p-2.5 text-right w-28">Unit Rate (₹)</th>
                        <th className="p-2.5 text-right w-20">Disc %</th>
                        <th className="p-2.5 text-right w-28">Line Total (₹)</th>
                        <th className="p-2.5 text-center w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE3DB]">
                      {editItems.map((it, idx) => {
                        const lineTot =
                          Number(it.quotedQuantity || 0) *
                          Number(it.unitPrice || 0) *
                          (1 - Number(it.discountPercentage || 0) / 100);
                        return (
                          <tr key={it.id || idx} className="bg-white">
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={it.itemName || ''}
                                onChange={(e) => handleEditItemChange(idx, 'itemName', e.target.value)}
                                className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-1 rounded text-xs font-semibold text-[#211B17] mb-1"
                              />
                              <input
                                type="text"
                                value={it.specification || ''}
                                onChange={(e) => handleEditItemChange(idx, 'specification', e.target.value)}
                                className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-1 rounded text-[10px] text-[#70665F] font-mono"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                min="1"
                                value={it.quotedQuantity}
                                onChange={(e) => handleEditItemChange(idx, 'quotedQuantity', Number(e.target.value))}
                                className="w-20 bg-[#FAF7F2] border border-[#EBE3DB] p-1.5 rounded text-right font-mono text-[#211B17]"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                min="0"
                                value={it.unitPrice}
                                onChange={(e) => handleEditItemChange(idx, 'unitPrice', Number(e.target.value))}
                                className="w-24 bg-[#FAF7F2] border border-[#EBE3DB] p-1.5 rounded text-right font-mono text-[#211B17]"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={it.discountPercentage || 0}
                                onChange={(e) => handleEditItemChange(idx, 'discountPercentage', Number(e.target.value))}
                                className="w-16 bg-[#FAF7F2] border border-[#EBE3DB] p-1.5 rounded text-right font-mono text-[#211B17]"
                              />
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                              ₹{Math.round(lineTot).toLocaleString('en-IN')}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleEditRemoveItemRow(idx)}
                                className="p-1 rounded text-rose-500 hover:bg-rose-50 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation in Edit Modal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[#70665F] mb-1 font-semibold">Freight & Transport Charges (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={editFreightCharges}
                      onChange={(e) => setEditFreightCharges(Number(e.target.value))}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[#70665F] mb-1 font-semibold">GST Tax Rate (%)</label>
                    <select
                      value={editGstPercentage}
                      onChange={(e) => setEditGstPercentage(Number(e.target.value))}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>0% (Exempt)</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18% Standard</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-1.5 flex flex-col justify-center">
                  <div className="flex justify-between text-[#70665F]">
                    <span>Subtotal:</span>
                    <span className="font-mono text-[#211B17] font-bold">₹{Math.round(editSubTotal).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#70665F]">
                    <span>GST ({editGstPercentage}%):</span>
                    <span className="font-mono text-[#211B17]">₹{Math.round(editTaxTotal).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#70665F]">
                    <span>Freight:</span>
                    <span className="font-mono text-[#211B17]">₹{Number(editFreightCharges || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-[#EBE3DB] pt-1.5 flex justify-between font-black text-[#211B17] text-sm">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-700 font-black">₹{Math.round(editGrandTotal).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setEditQuote(null)}
                  className="px-4 py-2 bg-[#FAF7F2] text-[#211B17] font-bold rounded-xl hover:bg-stone-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#211B17]">Delete Supplier Quotation?</h3>
              <p className="text-xs text-[#70665F] mt-1">
                Are you sure you want to delete this quotation record? This action will remove the quotation and cannot be undone.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[#211B17] font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
