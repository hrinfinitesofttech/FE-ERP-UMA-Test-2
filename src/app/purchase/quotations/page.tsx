'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import {
  FileCheck2,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Building,
  Calendar,
  X,
  Trash2,
  PlusCircle,
  AlertCircle,
  Truck,
  IndianRupee,
  FileText,
  DollarSign,
  PhoneCall,
  ArrowRight,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Edit,
  Send,
  HelpCircle,
} from 'lucide-react';
import { SupplierQuotation, SupplierQuotationItem } from '../../../types/purchase';
import { formatCurrency } from '../../../lib/utils';

export default function SupplierQuotationsPage() {
  const router = useRouter();
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

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewQuote, setViewQuote] = useState<SupplierQuotation | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State for New Supplier Quotation
  const [selectedRfqId, setSelectedRfqId] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [quotationRef, setQuotationRef] = useState('');
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [leadTimeDays, setLeadTimeDays] = useState(7);
  const [paymentTerms, setPaymentTerms] = useState('30 Days Credit');
  const [deliveryTerms, setDeliveryTerms] = useState('FOR Rajpur Works');
  
  // Dynamic Additional Charges (e.g. Delivery Charges, Packaging Charges)
  const [additionalCharges, setAdditionalCharges] = useState<
    Array<{ id: string; name: string; amount: number }>
  >([]);

  const handleAddCharge = () => {
    setAdditionalCharges((prev) => [
      ...prev,
      { id: `chg-${Date.now()}-${prev.length + 1}`, name: '', amount: 0 },
    ]);
  };

  const handleRemoveCharge = (id: string) => {
    setAdditionalCharges((prev) => prev.filter((c) => c.id !== id));
  };

  const handleChargeChange = (id: string, field: 'name' | 'amount', value: any) => {
    setAdditionalCharges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const [technicalStatus, setTechnicalStatus] = useState('Compliant');
  const [remarks, setRemarks] = useState('');

  // Quotation Line Items
  const [quoteItems, setQuoteItems] = useState<SupplierQuotationItem[]>([
    {
      id: `sqi-${Date.now()}-1`,
      itemCode: 'ITEM-01',
      itemName: '',
      specification: '',
      unit: 'KG',
      unitOfMeasure: 'KG',
      quotedQuantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      taxPercent: 18,
      gstPercentage: 18,
      netPrice: 0,
      leadTimeDays: 7,
      brandMake: '',
      technicalCompliant: true,
    },
  ]);

  // When user selects an RFQ, auto-populate supplier & items
  const handleSelectRfq = (rfqId: string) => {
    setSelectedRfqId(rfqId);
    const rfq = rfqs.find((r) => r.id === rfqId || r.rfqNumber === rfqId);
    if (rfq) {
      if (rfq.supplierId) {
        setSelectedSupplierId(rfq.supplierId);
        setSupplierName(rfq.supplierName || '');
      } else if (rfq.supplierName) {
        setSupplierName(rfq.supplierName);
        const matched = suppliers.find(
          (s) => s.name?.toLowerCase() === rfq.supplierName?.toLowerCase()
        );
        if (matched) setSelectedSupplierId(matched.id);
      }

      if (rfq.items && rfq.items.length > 0) {
        const mappedItems: SupplierQuotationItem[] = rfq.items.map((it, idx) => {
          const qty = it.quantity || it.requiredQuantity || 1;
          const rate = 0; // Default to 0 so the user enters the quoted rate manually
          const total = 0;
          const net = 0;
          return {
            id: `sqi-${Date.now()}-${idx + 1}`,
            itemCode: it.itemCode || `ITEM-0${idx + 1}`,
            itemName: it.itemName || it.materialName || it.description || 'Material Item',
            specification: it.specification || it.dimensions || `${it.thk ? it.thk + ' THK' : ''}`,
            unit: it.unit || it.unitOfMeasure || 'KG',
            unitOfMeasure: it.unitOfMeasure || it.unit || 'KG',
            quotedQuantity: qty,
            unitPrice: rate,
            totalPrice: total,
            taxPercent: 18,
            gstPercentage: 18,
            netPrice: net,
            leadTimeDays: 7,
            brandMake: '',
            technicalCompliant: true,
          };
        });
        setQuoteItems(mappedItems);
      }
    }
  };

  const handleSelectSupplier = (suppId: string) => {
    setSelectedSupplierId(suppId);
    const s = suppliers.find((sp) => sp.id === suppId);
    if (s) {
      setSupplierName(s.name);
    }
  };

  // Calculations for Create Modal
  const subTotalCalculated = useMemo(() => {
    return quoteItems.reduce((acc, it) => acc + (Number(it.totalPrice) || 0), 0);
  }, [quoteItems]);

  const taxTotalCalculated = useMemo(() => {
    return subTotalCalculated * 0.18;
  }, [subTotalCalculated]);

  const totalAdditionalCharges = useMemo(() => {
    return additionalCharges.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  }, [additionalCharges]);

  const grandTotalCalculated = useMemo(() => {
    return subTotalCalculated + taxTotalCalculated + totalAdditionalCharges;
  }, [subTotalCalculated, taxTotalCalculated, totalAdditionalCharges]);

  // Update item field
  const updateQuoteItem = (
    index: number,
    field: keyof SupplierQuotationItem,
    val: any
  ) => {
    setQuoteItems((prev) => {
      const copy = [...prev];
      const cur = { ...copy[index], [field]: val };

      const qty = Number(cur.quotedQuantity) || 0;
      const rate = Number(cur.unitPrice) || 0;
      const total = qty * rate;
      const taxRate = Number(cur.gstPercentage ?? cur.taxPercent ?? 18);
      const taxAmount = (total * taxRate) / 100;

      cur.totalPrice = total;
      cur.netPrice = total + taxAmount;
      copy[index] = cur;
      return copy;
    });
  };

  const addQuoteItem = () => {
    const newItem: SupplierQuotationItem = {
      id: `sqi-${Date.now()}-${quoteItems.length + 1}`,
      itemCode: `ITEM-0${quoteItems.length + 1}`,
      itemName: '',
      specification: '',
      unit: 'KG',
      unitOfMeasure: 'KG',
      quotedQuantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      taxPercent: 18,
      gstPercentage: 18,
      netPrice: 0,
      leadTimeDays: 7,
      brandMake: '',
      technicalCompliant: true,
    };
    setQuoteItems([...quoteItems, newItem]);
  };

  const removeQuoteItem = (index: number) => {
    if (quoteItems.length <= 1) return;
    setQuoteItems(quoteItems.filter((_, idx) => idx !== index));
  };

  // Save New Quotation
  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotationRef.trim()) {
      alert('Please enter Vendor Quotation Reference number.');
      return;
    }
    if (!supplierName.trim()) {
      alert('Please select or specify a Supplier.');
      return;
    }

    const nextNumber = `SQ-${new Date().getFullYear()}-${String(
      supplierQuotations.length + 1
    ).padStart(4, '0')}`;

    const newQuotation: Omit<SupplierQuotation, 'id'> = {
      quotationNumber: nextNumber,
      supplierQuotationRef: quotationRef.trim(),
      supplierQuotationNumber: quotationRef.trim(),
      rfqId: selectedRfqId || undefined,
      rfqNumber:
        rfqs.find((r) => r.id === selectedRfqId)?.rfqNumber || selectedRfqId || 'DIRECT',
      supplierId: selectedSupplierId || 'SUPP-DIRECT',
      supplierName: supplierName.trim(),
      quotationDate: quotationDate || new Date().toISOString().split('T')[0],
      validUntil: validUntil || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      validityDate: validUntil || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      paymentTerms: paymentTerms || '30 Days Credit',
      deliveryTerms: deliveryTerms || 'FOR Rajpur Works',
      leadTimeDays: Number(leadTimeDays) || 7,
      freightCharges: 0,
      packingCharges: 0,
      otherCharges: totalAdditionalCharges,
      additionalCharges: additionalCharges.filter((c) => c.name.trim() !== '' || c.amount > 0),
      gstTaxRate: 18,
      subTotal: subTotalCalculated,
      subtotal: subTotalCalculated,
      taxTotal: taxTotalCalculated,
      grandTotal: grandTotalCalculated,
      technicalStatus,
      status: 'submitted',
      recordedBy: currentUser?.name || 'Purchase Executive',
      items: quoteItems,
      createdAt: new Date().toISOString(),
    };

    addSupplierQuotation(newQuotation);
    setShowCreateModal(false);

    // Reset Form
    setQuotationRef('');
    setSelectedRfqId('');
    setSelectedSupplierId('');
    setSupplierName('');
    setAdditionalCharges([]);
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('select') || s.includes('approv')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3" /> Selected / Approved
        </span>
      );
    }
    if (s.includes('review')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <Clock className="w-3 h-3" /> Under Review
        </span>
      );
    }
    if (s.includes('reject')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
          <X className="w-3 h-3" /> Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
        <FileText className="w-3 h-3" /> Received / Submitted
      </span>
    );
  };

  // Convert to PO Handler
  const handleConvertToPO = (quote: SupplierQuotation) => {
    // Approve quote
    approveSupplierQuotation(quote.id, currentUser?.name || 'Purchase Manager');
    // Navigate to PO creation with this quotation selected
    router.push(`/purchase/po?quoteId=${encodeURIComponent(quote.id)}`);
  };

  // Filtered Quotations
  const filteredQuotations = useMemo(() => {
    return supplierQuotations.filter((sq) => {
      const matchesSearch =
        searchQuery === '' ||
        sq.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sq.supplierQuotationRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sq.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sq.rfqNumber?.toLowerCase().includes(searchQuery.toLowerCase());

      const status = (sq.status || '').toLowerCase();
      let matchesStatus = true;
      if (statusFilter === 'APPROVED') {
        matchesStatus = status.includes('select') || status.includes('approv');
      } else if (statusFilter === 'REVIEW') {
        matchesStatus = status.includes('review');
      } else if (statusFilter === 'SUBMITTED') {
        matchesStatus = status.includes('submitted') || status.includes('received');
      }

      return matchesSearch && matchesStatus;
    });
  }, [supplierQuotations, searchQuery, statusFilter]);

  // Stats
  const totalCount = supplierQuotations.length;
  const underReviewCount = supplierQuotations.filter((q) =>
    (q.status || '').toLowerCase().includes('review')
  ).length;
  const approvedCount = supplierQuotations.filter(
    (q) =>
      (q.status || '').toLowerCase().includes('approv') ||
      (q.status || '').toLowerCase().includes('select')
  ).length;
  const totalValue = supplierQuotations.reduce(
    (acc, q) => acc + (Number(q.grandTotal) || 0),
    0
  );

  // Table Columns
  const columns: ERPColumn<SupplierQuotation>[] = [
    {
      key: 'quotationNumber',
      header: 'QUOTE REF / ERP NO',
      cell: (sq) => (
        <div>
          <div className="font-extrabold text-[#211B17] font-mono text-xs flex items-center gap-1.5">
            <span>{sq.supplierQuotationRef || sq.quotationNumber}</span>
          </div>
          <div className="text-[10px] text-[#8D7B70] font-mono">
            ERP: {sq.quotationNumber}
          </div>
        </div>
      ),
    },
    {
      key: 'supplierName',
      header: 'SUPPLIER / VENDOR',
      cell: (sq) => {
        const supp = suppliers.find(
          (s) =>
            s.id === sq.supplierId ||
            s.name?.toLowerCase() === sq.supplierName?.toLowerCase()
        );
        const phone = supp?.mobile || supp?.phone || '';
        return (
          <div>
            <div className="font-bold text-[#211B17] text-xs flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-crm-brand-700 flex-shrink-0" />
              <span>{sq.supplierName}</span>
            </div>
            {phone && (
              <div className="text-[10px] text-[#8D7B70] flex items-center gap-2 mt-0.5">
                <span>Mob: {phone}</span>
                <a
                  href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageSquare className="w-2.5 h-2.5" /> WhatsApp
                </a>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'rfqNumber',
      header: 'LINKED RFQ (REQUIRE)',
      cell: (sq) => (
        <div>
          {sq.rfqNumber && sq.rfqNumber !== 'DIRECT' ? (
            <Link
              href="/purchase/requests"
              className="font-mono text-xs font-bold text-sky-700 hover:underline flex items-center gap-1"
            >
              <span>{sq.rfqNumber}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          ) : (
            <span className="text-xs text-[#8D7B70] italic">Direct Quote</span>
          )}
          <div className="text-[10px] text-[#8D7B70]">
            Date: {sq.quotationDate}
          </div>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'ITEMS & LEAD TIME',
      cell: (sq) => (
        <div className="text-xs">
          <div className="font-semibold text-[#211B17]">
            {(sq.items || []).length} Items Quoted
          </div>
          <div className="text-[10px] text-[#8D7B70] flex items-center gap-1">
            <Truck className="w-3 h-3 text-amber-700" />
            <span>Lead: {sq.leadTimeDays || 7} Days</span>
          </div>
        </div>
      ),
    },
    {
      key: 'grandTotal',
      header: 'TOTAL AMOUNT',
      cell: (sq) => (
        <div className="text-right">
          <div className="font-extrabold text-[#211B17] font-mono text-xs">
            {formatCurrency(sq.grandTotal || 0)}
          </div>
          <div className="text-[10px] text-[#8D7B70]">
            +GST ({formatCurrency(sq.taxTotal || 0)})
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: (sq) => getStatusBadge(sq.status),
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      cell: (sq) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setViewQuote(sq)}
            className="p-1.5 text-[#544B45] hover:text-[#211B17] hover:bg-[#FAF7F2] rounded-lg transition"
            title="View Quotation Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Quick Convert to PO */}
          {!(sq.status || '').toLowerCase().includes('select') && (
            <button
              onClick={() => handleConvertToPO(sq)}
              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition"
              title="Select & Convert to Official PO"
            >
              <span>Approve & PO</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={() => setDeleteConfirmId(sq.id)}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Delete Quotation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider block">
              Total Quotations
            </span>
            <span className="text-2xl font-black text-[#211B17] font-mono mt-0.5 block">
              {totalCount}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">Received from vendors</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider block">
              Under Review
            </span>
            <span className="text-2xl font-black text-[#211B17] font-mono mt-0.5 block">
              {underReviewCount}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">Comparing rates</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider block">
              Selected / Approved
            </span>
            <span className="text-2xl font-black text-emerald-700 font-mono mt-0.5 block">
              {approvedCount}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">Ready for PO</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider block">
              Total Quoted Value
            </span>
            <span className="text-xl font-black text-[#211B17] font-mono mt-0.5 block">
              {formatCurrency(totalValue)}
            </span>
            <span className="text-[11px] text-sky-700 font-medium">Cumulated value</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center border border-sky-200">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main List Layout */}
      <ERPListPageLayout<SupplierQuotation>
        breadcrumbs={['DASHBOARD', 'PURCHASE', 'SUPPLIER QUOTATIONS & RATE ENTRIES']}
        data={filteredQuotations}
        columns={columns}
        searchPlaceholder="Search vendor, quote ref, RFQ no..."
        addNewLabel="+ Record Supplier Quotation"
        onAddNew={() => setShowCreateModal(true)}
        getRowKey={(sq, idx) => sq.id || idx}
      />
      {/* ========================================================= */}
      {/* MODAL: RECORD / CREATE SUPPLIER QUOTATION                 */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE3DB] bg-[#FAF7F2]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-crm-brand-100 rounded-xl text-crm-brand-800">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#211B17]">
                    Record Vendor Quotation Entry
                  </h3>
                  <p className="text-xs text-[#8D7B70]">
                    Link to Purchase Request (RFQ) or record direct supplier quotation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveQuotation} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Top Row: Link to RFQ & Supplier */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#544B45] mb-1">
                    Link RFQ / Purchase Request
                  </label>
                  <select
                    value={selectedRfqId}
                    onChange={(e) => handleSelectRfq(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                  >
                    <option value="">-- Direct Quotation (No RFQ) --</option>
                    {rfqs.map((rfq) => (
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
                    value={selectedSupplierId}
                    onChange={(e) => handleSelectSupplier(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                  >
                    <option value="">-- Choose Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.city ? `(${s.city})` : ''}
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
                    required
                    value={quotationRef}
                    onChange={(e) => setQuotationRef(e.target.value)}
                    placeholder="e.g. QTN-2026-904"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                  />
                </div>
              </div>



              {/* Line Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-[#211B17] uppercase tracking-wider">
                    Quoted Material Items & Rates
                  </h4>
                  <button
                    type="button"
                    onClick={addQuoteItem}
                    className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#EFE8DF] text-crm-brand-700 text-xs font-bold rounded-lg border border-[#EBE3DB] flex items-center gap-1 transition"
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
                        <th className="py-2 px-3 w-24 text-right">Quoted Qty</th>
                        <th className="py-2 px-3 w-28 text-right">Unit Rate (₹)</th>
                        <th className="py-2 px-3 w-28 text-right">Total (₹)</th>
                        <th className="py-2 px-3 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE3DB]">
                      {quoteItems.map((it, idx) => (
                        <tr key={it.id || idx}>
                          <td className="py-2 px-3 font-mono text-[#8D7B70]">{idx + 1}</td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              required
                              value={it.itemName}
                              onChange={(e) => updateQuoteItem(idx, 'itemName', e.target.value)}
                              placeholder="e.g. SS 316 L HR PLATE"
                              className="w-full p-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-semibold focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={it.specification}
                              onChange={(e) => updateQuoteItem(idx, 'specification', e.target.value)}
                              placeholder="12MM THK - Jindal Make"
                              className="w-full p-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={it.unit || 'KG'}
                              onChange={(e) => {
                                updateQuoteItem(idx, 'unit', e.target.value);
                                updateQuoteItem(idx, 'unitOfMeasure', e.target.value);
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
                              value={it.quotedQuantity === 0 ? '' : it.quotedQuantity}
                              onChange={(e) => {
                                const val =
                                  e.target.value === '' ? 0 : parseFloat(e.target.value);
                                updateQuoteItem(idx, 'quotedQuantity', isNaN(val) ? 0 : val);
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
                                updateQuoteItem(idx, 'unitPrice', isNaN(val) ? 0 : val);
                              }}
                              placeholder="0"
                              className="w-full p-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-mono text-right font-bold text-emerald-800 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-[#211B17]">
                            {formatCurrency(it.totalPrice || 0)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {quoteItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeQuoteItem(idx)}
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

              {/* Other Charges & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-extrabold text-[#211B17] uppercase tracking-wider">
                      Additional Charges
                    </h5>
                    <button
                      type="button"
                      onClick={handleAddCharge}
                      className="px-2.5 py-1 bg-white hover:bg-[#EFE8DF] text-crm-brand-700 text-xs font-bold rounded-lg border border-[#EBE3DB] flex items-center gap-1 transition shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Additional Charge
                    </button>
                  </div>

                  {additionalCharges.length === 0 ? (
                    <div className="py-3 px-3 bg-white/70 border border-dashed border-[#D5C7B8] rounded-xl text-center text-xs text-[#8D7B70]">
                      No additional charges added. Click <span className="font-bold text-crm-brand-700">+ Add Additional Charge</span> to add Delivery, Packaging, etc.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {additionalCharges.map((charge) => (
                        <div
                          key={charge.id}
                          className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#EBE3DB]"
                        >
                          <div className="flex-1">
                            <input
                              type="text"
                              value={charge.name}
                              onChange={(e) =>
                                handleChargeChange(charge.id, 'name', e.target.value)
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
                                handleChargeChange(charge.id, 'amount', isNaN(val) ? 0 : val);
                              }}
                              placeholder="0"
                              className="w-full p-1.5 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-xs font-mono font-bold text-right text-emerald-800 focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCharge(charge.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            title="Remove Charge"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="text-[#8D7B70] block mb-1">Delivery Terms</label>
                    <input
                      type="text"
                      value={deliveryTerms}
                      onChange={(e) => setDeliveryTerms(e.target.value)}
                      placeholder="e.g. Ex-Works / FOR Rajpur"
                      className="w-full p-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Calculation Summary */}
                <div className="space-y-1.5 text-xs text-right border-l border-[#EBE3DB] pl-4">
                  <div className="flex justify-between text-[#8D7B70]">
                    <span>Material Subtotal:</span>
                    <span className="font-mono font-bold text-[#211B17]">
                      {formatCurrency(subTotalCalculated)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#8D7B70]">
                    <span>GST (18%):</span>
                    <span className="font-mono text-[#211B17]">
                      {formatCurrency(taxTotalCalculated)}
                    </span>
                  </div>
                  {additionalCharges.map((c) => {
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
                      {formatCurrency(grandTotalCalculated)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
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
                  className="px-5 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Save Quotation Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VIEW QUOTATION DETAILS                             */}
      {/* ========================================================= */}
      {viewQuote && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE3DB] bg-[#FAF7F2]">
              <div>
                <span className="text-[10px] text-[#8D7B70] font-mono">SUPPLIER QUOTATION</span>
                <h3 className="text-base font-black text-[#211B17]">
                  {viewQuote.supplierQuotationRef || viewQuote.quotationNumber}
                </h3>
              </div>
              <button
                onClick={() => setViewQuote(null)}
                className="p-1 rounded-lg text-[#70665F] hover:text-[#211B17] hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                  <div className="text-[#8D7B70]">Supplier:</div>
                  <div className="font-bold text-[#211B17] mt-0.5">{viewQuote.supplierName}</div>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                  <div className="text-[#8D7B70]">Quote Date:</div>
                  <div className="font-bold text-[#211B17] mt-0.5">{viewQuote.quotationDate}</div>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                  <div className="text-[#8D7B70]">Linked RFQ:</div>
                  <div className="font-bold text-sky-700 font-mono mt-0.5">
                    {viewQuote.rfqNumber || 'DIRECT'}
                  </div>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                  <div className="text-[#8D7B70]">Lead Time:</div>
                  <div className="font-bold text-[#211B17] mt-0.5">
                    {viewQuote.leadTimeDays || 7} Days
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-[#EBE3DB] rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[#FAF7F2] border-b border-[#EBE3DB] text-[#544B45] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Item / Description</th>
                      <th className="py-2.5 px-3">Specification</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE3DB]">
                    {(viewQuote.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-bold text-[#211B17]">{it.itemName}</td>
                        <td className="py-2.5 px-3 text-[#70665F]">{it.specification || '-'}</td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          {it.quotedQuantity || it.quantity || 1} {it.unit || 'KG'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-800 font-bold">
                          {formatCurrency(it.unitPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#211B17]">
                          {formatCurrency(it.totalPrice || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Commercial Terms */}
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#8D7B70]">Payment Terms:</span>
                  <span className="font-bold text-[#211B17]">{viewQuote.paymentTerms || '30 Days'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8D7B70]">Delivery Terms:</span>
                  <span className="font-bold text-[#211B17]">{viewQuote.deliveryTerms || 'FOR Factory'}</span>
                </div>
                {viewQuote.additionalCharges && viewQuote.additionalCharges.length > 0 ? (
                  viewQuote.additionalCharges.map((ac, idx) => (
                    <div key={ac.id || idx} className="flex justify-between">
                      <span className="text-[#8D7B70]">{ac.name || 'Additional Charge'}:</span>
                      <span className="font-bold text-[#211B17] font-mono">{formatCurrency(ac.amount)}</span>
                    </div>
                  ))
                ) : (
                  <>
                    {(viewQuote.otherCharges || 0) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[#8D7B70]">Other Charges:</span>
                        <span className="font-bold text-[#211B17] font-mono">{formatCurrency(viewQuote.otherCharges || 0)}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between pt-1 border-t border-[#EBE3DB]">
                  <span className="text-sm font-black text-[#211B17]">Grand Total (incl. Taxes):</span>
                  <span className="text-sm font-black text-emerald-800 font-mono">
                    {formatCurrency(viewQuote.grandTotal)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#EBE3DB]">
                <button
                  onClick={() => setViewQuote(null)}
                  className="px-4 py-2 border border-[#EBE3DB] text-[#211B17] font-bold text-xs rounded-xl hover:bg-[#FAF7F2]"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    handleConvertToPO(viewQuote);
                    setViewQuote(null);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Select Offer & Generate Purchase Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION                                       */}
      {/* ========================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-sm w-full p-5 space-y-4">
            <h4 className="text-sm font-black text-[#211B17]">Delete Supplier Quotation?</h4>
            <p className="text-xs text-[#8D7B70]">
              Are you sure you want to delete this quotation entry? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 border border-[#EBE3DB] text-[#211B17] font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteSupplierQuotation(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
