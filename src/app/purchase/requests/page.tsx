'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { RequestForQuotation, RFQItem, Supplier } from '../../../types/purchase';
import {
  FileText,
  Plus,
  Printer,
  Share2,
  Mail,
  Send,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  Phone,
  MessageSquare,
  Building,
  Package,
  ArrowRight,
  Sparkles,
  Layers,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

export default function PurchaseRequestsPage() {
  const router = useRouter();
  const {
    rfqs = [],
    addRFQ,
    updateRFQ,
    deleteRFQ,
    suppliers = [],
    purchaseRequisitions = [],
    currentUser,
    isInitialLoading,
  } = useERP();

  // Modals state
  const [selectedRequest, setSelectedRequest] = useState<RequestForQuotation | null>(null);
  const [isViewLetterOpen, setIsViewLetterOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ---------------------------------------------------------------------------
  // DEFAULT STANDARD TERMS (from Uma Technofab reference letter)
  // ---------------------------------------------------------------------------
  const defaultTerms = [
    'All are required to deliver material strictly along with required /applicable document as (1) Delivery Challan (2) Commercial invoice (Original +Duplicate) (3) Test & guarantee certificates etc.',
    'Please submit your challan & invoices in duplicate and in English only.',
    'No revision in rate shall be accepted without written confirmation.',
    'No packing, forwarding, delivery charges will be allowed unless specifically authorized by the company in writing.',
    'Material if rejected. It will be your duty to lift the material within one week from the date of rejection (GRN). We will not be responsible for such rejected material lying within our premises.',
  ];

  // ---------------------------------------------------------------------------
  // FORM STATE FOR CREATE / EDIT REQUEST
  // ---------------------------------------------------------------------------
  const [formData, setFormData] = useState({
    rfqNumber: `233-${new Date().getFullYear().toString().slice(-2)}/${(new Date().getFullYear() + 1).toString().slice(-2)}`,
    rfqDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
    selectedSupplierId: '',
    vendorName: 'CALICO METAL.',
    vendorAddress: '1/B/1, AFRICAWALA ESTATE, OPP-COMMET HOUSE\nKEVAL KANTA ROAD, RAKHIAL',
    vendorMobile: '9099911191',
    vendorEmail: '',
    vendorGstin: '24AABCC1234F1Z5',
    buyer: 'Uma Technofab.',
    surcharges: 'NIL',
    taxes: 'AS APPLICABLE.',
    shipTo: 'LOCAL',
    deliveryLocation: 'RAJPUR',
    pageNo: 'PAGE NO: 1 OF 1',
    subject: 'REQUIRE FOR SS 316 L HR PLATE & COIL JINDAL MAKE',
    specialNote: 'REQUIRE TC\nSEND A BEST RATE',
    terms: defaultTerms,
    items: [
      {
        id: '1',
        groupTitle: 'SS 316 L HR PLATE & COIL JINDAL MAKE',
        itemName: 'SS 316 L HR COIL',
        dimensions: '15000 MM WIDTH\n5 MM THK',
        specification: 'SS 316 L HR',
        thk: '5 MM',
        quantity: 5100,
        unitOfMeasure: 'KG',
        rate: 0,
        amount: 0,
      },
      {
        id: '2',
        groupTitle: 'SS 316 L HR PLATE',
        itemName: '1500 X 6000 X 4 MM',
        dimensions: '1500 X 6000 X 4 MM',
        specification: 'SS 316 L HR PLATE',
        thk: '4 MM',
        quantity: 600,
        unitOfMeasure: 'KG',
        rate: 0,
        amount: 0,
      },
      {
        id: '3',
        groupTitle: 'SS 316 L HR PLATE',
        itemName: '1500 X 6000 X 8 MM',
        dimensions: '1500 X 6000 X 8 MM',
        specification: 'SS 316 L HR PLATE',
        thk: '8 MM',
        quantity: 1200,
        unitOfMeasure: 'KG',
        rate: 0,
        amount: 0,
      },
    ] as any[],
  });

  // Handle Supplier Selection in Form (Auto-fill vendor details)
  const handleSupplierSelect = (suppId: string) => {
    const supp = suppliers.find((s) => s.id === suppId || s.vendorCode === suppId);
    if (supp) {
      const fullAddr = [
        supp.address,
        supp.city,
        supp.state ? `${supp.state} - ${supp.pinCode || ''}` : '',
      ].filter(Boolean).join('\n') || (supp.addresses && supp.addresses[0]?.addressLine) || '';

      setFormData((prev) => ({
        ...prev,
        selectedSupplierId: supp.id,
        vendorName: (supp.supplierName || supp.name || '').toUpperCase(),
        vendorAddress: fullAddr,
        vendorMobile: supp.mobile || supp.phone || (supp.contacts && supp.contacts[0]?.phone) || '',
        vendorEmail: supp.email || (supp.contacts && supp.contacts[0]?.email) || '',
        vendorGstin: supp.gstin || '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedSupplierId: suppId,
      }));
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingId(null);
    const yr = new Date().getFullYear();
    const nextReqNo = `${Math.floor(200 + rfqs.length * 5 + 1)}-${yr.toString().slice(-2)}/${(yr + 1).toString().slice(-2)}`;
    const firstSupplier = suppliers[0];

    let vName = 'CALICO METAL.';
    let vAddr = '1/B/1, AFRICAWALA ESTATE, OPP-COMMET HOUSE\nKEVAL KANTA ROAD, RAKHIAL';
    let vMob = '9099911191';
    let vEmail = '';
    let vGst = '24AABCC1234F1Z5';

    if (firstSupplier) {
      vName = (firstSupplier.supplierName || firstSupplier.name || '').toUpperCase();
      vAddr = [firstSupplier.address, firstSupplier.city, firstSupplier.state].filter(Boolean).join('\n');
      vMob = firstSupplier.mobile || firstSupplier.phone || '';
      vEmail = firstSupplier.email || '';
      vGst = firstSupplier.gstin || '';
    }

    setFormData({
      rfqNumber: nextReqNo,
      rfqDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
      selectedSupplierId: firstSupplier?.id || '',
      vendorName: vName,
      vendorAddress: vAddr,
      vendorMobile: vMob,
      vendorEmail: vEmail,
      vendorGstin: vGst,
      buyer: 'Uma Technofab.',
      surcharges: 'NIL',
      taxes: 'AS APPLICABLE.',
      shipTo: 'LOCAL',
      deliveryLocation: 'RAJPUR',
      pageNo: 'PAGE NO: 1 OF 1',
      subject: 'REQUIRE FOR SS 316 L HR PLATE & COIL JINDAL MAKE',
      specialNote: 'REQUIRE TC\nSEND A BEST RATE',
      terms: defaultTerms,
      items: [
        {
          id: `item-${Date.now()}-1`,
          groupTitle: 'SS 316 L HR PLATE & COIL JINDAL MAKE',
          itemName: 'SS 316 L HR COIL',
          dimensions: '15000 MM WIDTH\n5 MM THK',
          specification: 'SS 316 L HR',
          thk: '5 MM',
          quantity: 5100,
          unitOfMeasure: 'KG',
          rate: 0,
          amount: 0,
        },
        {
          id: `item-${Date.now()}-2`,
          groupTitle: 'SS 316 L HR PLATE',
          itemName: '1500 X 6000 X 4 MM',
          dimensions: '1500 X 6000 X 4 MM',
          specification: 'SS 316 L HR PLATE',
          thk: '4 MM',
          quantity: 600,
          unitOfMeasure: 'KG',
          rate: 0,
          amount: 0,
        },
        {
          id: `item-${Date.now()}-3`,
          groupTitle: 'SS 316 L HR PLATE',
          itemName: '1500 X 6000 X 8 MM',
          dimensions: '1500 X 6000 X 8 MM',
          specification: 'SS 316 L HR PLATE',
          thk: '8 MM',
          quantity: 1200,
          unitOfMeasure: 'KG',
          rate: 0,
          amount: 0,
        },
      ],
    });
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (req: RequestForQuotation) => {
    setEditingId(req.id);
    setFormData({
      rfqNumber: req.rfqNumber || '',
      rfqDate: req.rfqDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
      selectedSupplierId: req.supplierId || '',
      vendorName: req.supplierName || '',
      vendorAddress: req.supplierAddress || '',
      vendorMobile: req.supplierMobile || '',
      vendorEmail: req.supplierEmail || '',
      vendorGstin: req.supplierGstin || '',
      buyer: req.buyer || 'Uma Technofab.',
      surcharges: req.surcharges || 'NIL',
      taxes: req.taxes || 'AS APPLICABLE.',
      shipTo: req.shipTo || 'LOCAL',
      deliveryLocation: req.deliveryLocation || 'RAJPUR',
      pageNo: req.pageNo || 'PAGE NO: 1 OF 1',
      subject: req.subject || 'REQUIRE FOR SS 316 L HR PLATE & COIL JINDAL MAKE',
      specialNote: req.specialNote || 'REQUIRE TC\nSEND A BEST RATE',
      terms: req.terms && req.terms.length > 0 ? req.terms : defaultTerms,
      items: (req.items || []).map((itm, idx) => ({
        id: itm.id || `item-${idx + 1}`,
        groupTitle: itm.groupTitle || '',
        itemName: itm.itemName || itm.description || itm.materialName || '',
        dimensions: itm.dimensions || itm.size || itm.specification || '',
        specification: itm.specification || '',
        thk: itm.thk || '',
        quantity: Number(itm.quantity || itm.requiredQuantity || 1),
        unitOfMeasure: itm.unitOfMeasure || itm.unit || 'KG',
        rate: Number(itm.rate || 0),
        amount: Number(itm.amount || 0),
      })),
    });
    setIsFormModalOpen(true);
  };

  // Add Item Line
  const handleAddItem = () => {
    const nextIdx = formData.items.length + 1;
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `item-${Date.now()}-${nextIdx}`,
          groupTitle: prev.items[prev.items.length - 1]?.groupTitle || '',
          itemName: '',
          dimensions: '',
          specification: '',
          thk: '',
          quantity: 1,
          unitOfMeasure: 'KG',
          rate: 0,
          amount: 0,
        },
      ],
    }));
  };

  // Remove Item Line
  const handleRemoveItem = (id: string) => {
    if (formData.items.length <= 1) {
      alert('At least one material item is required.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((itm) => itm.id !== id),
    }));
  };

  // Update Item field
  const handleItemFieldChange = (id: string, field: string, val: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((itm) => (itm.id === id ? { ...itm, [field]: val } : itm)),
    }));
  };

  // Submit Save Create / Edit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendorName.trim()) {
      alert('Please enter Vendor / Supplier Name.');
      return;
    }
    if (formData.items.length === 0) {
      alert('Please add at least one material item.');
      return;
    }

    const payload: RequestForQuotation = {
      id: editingId || `REQ-${Date.now()}`,
      rfqNumber: formData.rfqNumber.trim() || `REQ-${Date.now().toString().slice(-4)}`,
      rfqDate: formData.rfqDate,
      supplierId: formData.selectedSupplierId,
      supplierName: formData.vendorName.trim(),
      supplierAddress: formData.vendorAddress.trim(),
      supplierMobile: formData.vendorMobile.trim(),
      supplierEmail: formData.vendorEmail.trim(),
      supplierGstin: formData.vendorGstin.trim(),
      buyer: formData.buyer,
      surcharges: formData.surcharges,
      taxes: formData.taxes,
      shipTo: formData.shipTo,
      deliveryLocation: formData.deliveryLocation,
      pageNo: formData.pageNo,
      subject: formData.subject.trim(),
      specialNote: formData.specialNote.trim(),
      terms: formData.terms,
      termsAndConditions: formData.terms.join('\n'),
      signatory: 'For, UMA TECHNOFAB.',
      status: 'Sent to Suppliers',
      items: formData.items.map((itm, idx) => ({
        id: itm.id || `item-${idx + 1}`,
        rfqId: editingId || `REQ-${Date.now()}`,
        groupTitle: itm.groupTitle || '',
        itemName: itm.itemName || `Item ${idx + 1}`,
        description: itm.itemName || '',
        dimensions: itm.dimensions || '',
        specification: itm.specification || '',
        thk: itm.thk || '',
        quantity: Number(itm.quantity) || 1,
        requiredQuantity: Number(itm.quantity) || 1,
        unitOfMeasure: itm.unitOfMeasure || 'KG',
        rate: Number(itm.rate) || 0,
        amount: Number(itm.amount) || 0,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      updateRFQ(editingId, payload);
      showToast(`Purchase Request ${payload.rfqNumber} updated successfully!`);
    } else {
      addRFQ(payload as any);
      showToast(`Purchase Request ${payload.rfqNumber} generated successfully!`);
    }

    setIsFormModalOpen(false);
  };

  // Open Letterhead View
  const handleOpenLetterView = (req: RequestForQuotation) => {
    setSelectedRequest(req);
    setIsViewLetterOpen(true);
  };

  // Delete Request
  const handleDeleteRequest = (req: RequestForQuotation) => {
    if (confirm(`Are you sure you want to delete Purchase Request "${req.rfqNumber}" for ${req.supplierName}?`)) {
      deleteRFQ(req.id);
      showToast(`Purchase Request ${req.rfqNumber} removed.`);
    }
  };

  // WhatsApp Share Helper
  const handleWhatsAppShare = (req: RequestForQuotation) => {
    const mob = (req.supplierMobile || '').replace(/\D/g, '');
    const cleanPhone = mob.startsWith('91') && mob.length === 12 ? mob : mob.length === 10 ? `91${mob}` : mob;

    const itemsSummary = (req.items || [])
      .map((itm, i) => `${i + 1}. ${itm.itemName} ${itm.dimensions ? `(${itm.dimensions})` : ''} - Qty: ${itm.quantity || itm.requiredQuantity} ${itm.unitOfMeasure || 'KG'}`)
      .join('\n');

    const msg = encodeURIComponent(
      `*UMA TECHNOFAB - PURCHASE REQUIREMENT*\n\n` +
      `*Req No:* ${req.rfqNumber}\n` +
      `*Date:* ${req.rfqDate}\n` +
      `*To:* ${req.supplierName}\n` +
      `*Subject:* ${req.subject || 'Material Requirement'}\n\n` +
      `*Requested Items:*\n${itemsSummary}\n\n` +
      `*Note:* ${req.specialNote || 'REQUIRE TC / PLEASE SEND YOUR BEST RATE'}\n` +
      `*Delivery:* ${req.deliveryLocation || 'Rajpur, Kadi, Mehsana'}\n\n` +
      `Kindly submit your best competitive quotation at the earliest.\n\n` +
      `Thank you,\n*UMA TECHNOFAB*\nSurvey No.1040/3, Village Rajpur, Mehsana Highway, Kadi.`
    );

    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(waUrl, '_blank');
  };

  // Email Share Helper
  const handleEmailShare = (req: RequestForQuotation) => {
    const subject = encodeURIComponent(`${req.rfqNumber} - ${req.subject || 'Material Purchase Requirement'} - Uma Technofab`);
    const itemsSummary = (req.items || [])
      .map((itm, i) => `${i + 1}. ${itm.itemName} | Specifications: ${itm.dimensions || '-'} | Quantity: ${itm.quantity || itm.requiredQuantity} ${itm.unitOfMeasure || 'KG'}`)
      .join('\n');

    const body = encodeURIComponent(
      `Dear ${req.supplierName || 'Valued Supplier'},\n\n` +
      `Please find our formal material purchase requirement details below:\n\n` +
      `Requisition No: ${req.rfqNumber}\n` +
      `Date: ${req.rfqDate}\n` +
      `Subject: ${req.subject || 'Material Requirement'}\n\n` +
      `Items Required:\n${itemsSummary}\n\n` +
      `Delivery Location: ${req.deliveryLocation || 'Uma Technofab, Rajpur, Mehsana Highway, Kadi'}\n` +
      `Requirements: Test Certificates (TC) Required with delivery.\n\n` +
      `Kindly reply with your best discounted rates, payment terms, and delivery lead time.\n\n` +
      `Thanking you,\n` +
      `Purchase Department\n` +
      `UMA TECHNOFAB\n` +
      `Mehsana Highway, Rajpur, Kadi\n` +
      `Mobile: 9925011676 / Email: umatechnofab@gmail.com`
    );

    window.open(`mailto:${req.supplierEmail || ''}?subject=${subject}&body=${body}`, '_blank');
  };

  // Print Letterhead Action
  const handlePrint = () => {
    window.print();
  };

  // Table Columns
  const columns: ERPColumn<RequestForQuotation>[] = [
    {
      key: 'rfqNumber',
      header: 'REQ. NO',
      isCodeLink: true,
      onCodeClick: handleOpenLetterView,
      cell: (r) => (
        <button
          onClick={() => handleOpenLetterView(r)}
          className="text-amber-800 hover:text-amber-950 font-mono font-bold text-xs underline cursor-pointer text-left"
        >
          {r.rfqNumber}
        </button>
      ),
    },
    {
      key: 'rfqDate',
      header: 'DATE',
      cell: (r) => (
        <span className="font-mono text-xs text-[#211B17] font-semibold">
          {r.rfqDate}
        </span>
      ),
    },
    {
      key: 'supplierName',
      header: 'SUPPLIER / VENDOR',
      cell: (r) => (
        <div>
          <span className="font-bold text-xs text-[#211B17] block">{r.supplierName}</span>
          <span className="text-[11px] text-[#70665F] font-mono flex items-center gap-1">
            {r.supplierMobile && <Phone className="w-3 h-3 text-emerald-600 inline" />}
            {r.supplierMobile || 'No contact phone'}
          </span>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'SUBJECT / REQUIREMENT',
      cell: (r) => (
        <div className="max-w-xs">
          <span className="font-semibold text-xs text-[#211B17] block truncate">
            {r.subject || 'Material Purchase Requirement'}
          </span>
          <span className="text-[11px] text-amber-700 font-medium block">
            {r.items?.length || 0} item lines requested
          </span>
        </div>
      ),
    },
    {
      key: 'totalWeight',
      header: 'TOTAL QTY',
      cell: (r) => {
        const total = (r.items || []).reduce((acc, itm) => acc + Number(itm.quantity || itm.requiredQuantity || 0), 0);
        const uom = r.items?.[0]?.unitOfMeasure || 'KG';
        return (
          <span className="font-mono font-bold text-xs text-[#211B17]">
            {total.toLocaleString()} {uom}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: (r) => (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
          {r.status || 'Sent to Supplier'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenLetterView(r)}
            title="View & Print Official Letterhead"
            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleWhatsAppShare(r)}
            title="Share directly on WhatsApp"
            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleEmailShare(r)}
            title="Send Email"
            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleOpenEditModal(r)}
            title="Edit Purchase Request"
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteRequest(r)}
            title="Delete Request"
            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Helper metrics
  const totalRequestsCount = rfqs.length;
  const totalItemLines = rfqs.reduce((sum, r) => sum + (r.items?.length || 0), 0);

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider block">
              Total Purchase Requests
            </span>
            <span className="text-2xl font-black text-[#211B17] font-mono mt-0.5 block">
              {totalRequestsCount}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">Inquiries sent to vendors</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider block">
              Total Material Lines
            </span>
            <span className="text-2xl font-black text-[#211B17] font-mono mt-0.5 block">
              {totalItemLines}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">Plates, Coils, Bought-out</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider block">
              Registered Suppliers
            </span>
            <span className="text-2xl font-black text-[#211B17] font-mono mt-0.5 block">
              {suppliers.length}
            </span>
            <span className="text-[11px] text-blue-700 font-medium">Active vendors in directory</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center border border-blue-200">
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main List Layout */}
      <ERPListPageLayout<RequestForQuotation>
        breadcrumbs={['DASHBOARD', 'PURCHASE', 'PURCHASE REQUESTS (REQUIRE / RFQ)']}
        data={rfqs}
        columns={columns}
        searchPlaceholder="Search requisition no, supplier, or subject..."
        addNewLabel="+ Create Purchase Request"
        onAddNew={handleOpenCreateModal}
        isLoading={isInitialLoading}
      />

      {/* ===================================================================== */}
      {/* MODAL 1: CREATE / EDIT PURCHASE REQUEST FORM */}
      {/* ===================================================================== */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-[#EBE3DB] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#211B17] text-sm">
                    {editingId ? 'Edit Purchase Request' : 'Create New Purchase Request (REQUIRE)'}
                  </h3>
                  <p className="text-[11px] text-[#70665F]">
                    Generates official inquiry letter matching Uma Technofab format
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white text-[#70665F] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitForm} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Row 1: Quick Select Supplier & Document Headers */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] space-y-3">
                <h4 className="font-bold text-[#211B17] text-xs flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-700" />
                  <span>Supplier / Vendor & Header Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                      Select Supplier from Master:
                    </label>
                    <select
                      value={formData.selectedSupplierId}
                      onChange={(e) => handleSupplierSelect(e.target.value)}
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs text-[#211B17] font-semibold focus:outline-none focus:border-amber-600"
                    >
                      <option value="">-- Custom Vendor / Type Manually --</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.supplierName || s.name} ({s.vendorCode || s.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                      Vendor / Company Name *:
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.vendorName}
                      onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                      placeholder="e.g. CALICO METAL."
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#211B17] focus:outline-none focus:border-amber-600 uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                      Vendor Mobile No (WhatsApp) *:
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.vendorMobile}
                      onChange={(e) => setFormData({ ...formData, vendorMobile: e.target.value })}
                      placeholder="e.g. 9099911191"
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-[#211B17] focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                      Vendor Full Address:
                    </label>
                    <textarea
                      rows={2}
                      value={formData.vendorAddress}
                      onChange={(e) => setFormData({ ...formData, vendorAddress: e.target.value })}
                      placeholder="1/B/1, AFRICAWALA ESTATE, OPP-COMMET HOUSE, KEVAL KANTA ROAD, RAKHIAL"
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                      Vendor Email (Optional):
                    </label>
                    <input
                      type="email"
                      value={formData.vendorEmail}
                      onChange={(e) => setFormData({ ...formData, vendorEmail: e.target.value })}
                      placeholder="sales@vendor.com"
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                {/* Document Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-[#EBE3DB]">
                  <div>
                    <label className="text-[10px] font-bold text-[#70665F] block mb-1">REQ. NO:</label>
                    <input
                      type="text"
                      value={formData.rfqNumber}
                      onChange={(e) => setFormData({ ...formData, rfqNumber: e.target.value })}
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1 text-xs font-mono font-bold text-amber-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#70665F] block mb-1">DATE:</label>
                    <input
                      type="text"
                      value={formData.rfqDate}
                      onChange={(e) => setFormData({ ...formData, rfqDate: e.target.value })}
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1 text-xs font-mono font-bold text-[#211B17]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#70665F] block mb-1">DELIVERY LOCATION:</label>
                    <input
                      type="text"
                      value={formData.deliveryLocation}
                      onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1 text-xs font-bold text-[#211B17]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#70665F] block mb-1">TAXES:</label>
                    <input
                      type="text"
                      value={formData.taxes}
                      onChange={(e) => setFormData({ ...formData, taxes: e.target.value })}
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1 text-xs font-bold text-[#211B17]"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Subject */}
              <div>
                <label className="text-[10px] font-bold text-[#70665F] block mb-1 uppercase tracking-wider">
                  Subject Line (વિષય) *:
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Sub:- REQUIRE FOR SS 316 L HR PLATE & COIL JINDAL MAKE"
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs font-bold text-[#211B17] focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Row 3: Material Requirement Items Builder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#211B17] text-xs flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-amber-700" />
                      <span>Material Lines to Quote ({formData.items.length})</span>
                    </h4>
                    <p className="text-[11px] text-[#70665F]">
                      Specify product description, dimensions, thickness, and required quantity
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-700" />
                    <span>Add Material Line</span>
                  </button>
                </div>

                <div className="border border-[#EBE3DB] rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead className="bg-[#FAF7F2] text-[10px] font-bold text-[#70665F] uppercase border-b border-[#EBE3DB]">
                      <tr>
                        <th className="p-2 w-10 text-center">SR.</th>
                        <th className="p-2 w-48">GROUP / CATEGORY TITLE</th>
                        <th className="p-2">DESCRIPTION OF ITEM(S)</th>
                        <th className="p-2 w-28 text-center">QTY</th>
                        <th className="p-2 w-20 text-center">UOM</th>
                        <th className="p-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE3DB] bg-white">
                      {formData.items.map((itm, idx) => (
                        <tr key={itm.id} className="hover:bg-[#FAF7F2]/50">
                          <td className="p-2 text-center font-mono font-bold text-[#70665F]">
                            {idx + 1}
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={itm.groupTitle || ''}
                              onChange={(e) => handleItemFieldChange(itm.id, 'groupTitle', e.target.value)}
                              placeholder="❖ SS 316 L HR PLATE"
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-600"
                            />
                          </td>
                          <td className="p-1.5">
                            <textarea
                              rows={2}
                              required
                              value={itm.itemName}
                              onChange={(e) => handleItemFieldChange(itm.id, 'itemName', e.target.value)}
                              placeholder="e.g. SS 316 L HR COIL 15000 MM WIDTH 5 MM THK"
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-2 py-1 text-xs font-bold text-[#211B17] focus:outline-none focus:border-amber-600"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              required
                              value={itm.quantity}
                              onChange={(e) => handleItemFieldChange(itm.id, 'quantity', Number(e.target.value))}
                              placeholder="5100"
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-2 py-1 text-xs font-mono font-bold text-center text-amber-900 focus:outline-none focus:border-amber-600"
                            />
                          </td>
                          <td className="p-1.5">
                            <select
                              value={itm.unitOfMeasure || 'KG'}
                              onChange={(e) => handleItemFieldChange(itm.id, 'unitOfMeasure', e.target.value)}
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-1 py-1 text-xs font-bold text-center text-[#211B17]"
                            >
                              <option value="KG">KG</option>
                              <option value="NOS">NOS</option>
                              <option value="MTR">MTR</option>
                              <option value="SET">SET</option>
                              <option value="TON">TON</option>
                            </select>
                          </td>
                          <td className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(itm.id)}
                              className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Row 4: Special Note & Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#EBE3DB]">
                <div>
                  <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                    Special Note / Instruction (પત્ર નીચે લખાતી નોંધ):
                  </label>
                  <textarea
                    rows={3}
                    value={formData.specialNote}
                    onChange={(e) => setFormData({ ...formData, specialNote: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-2.5 py-1.5 text-xs font-bold text-amber-950"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                    Signatory Authority:
                  </label>
                  <div className="p-3 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl space-y-1">
                    <span className="text-xs font-bold text-[#211B17] block">Thanking you we remain.</span>
                    <span className="text-xs font-extrabold text-amber-900 block">For, UMA TECHNOFAB.</span>
                    <span className="text-[11px] text-[#70665F] block">Authorized Purchase Representative</span>
                  </div>
                </div>
              </div>

              {/* Modal Submit Footer */}
              <div className="border-t border-[#EBE3DB] pt-3 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#EBE3DB] text-[#70665F] font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:brightness-110 text-white font-extrabold text-xs shadow-md shadow-amber-800/30 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingId ? 'Save Changes' : 'Generate & Save Purchase Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: AUTHENTIC SCANNED-STYLE DOCUMENT VIEWER (UMA TECHNOFAB LETTERHEAD) */}
      {/* ===================================================================== */}
      {isViewLetterOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-4xl w-full max-h-[96vh] flex flex-col overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            {/* Top Toolbar (Screen-only) */}
            <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs text-slate-100">
                  Official Purchase Request Letter Preview ({selectedRequest.rfqNumber})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => handleWhatsAppShare(selectedRequest)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send WhatsApp</span>
                </button>
                <button
                  onClick={() => handleEmailShare(selectedRequest)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>
                <button
                  onClick={() => setIsViewLetterOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Letterhead Container (Printable Paper Layout) */}
            <div className="p-8 overflow-y-auto flex-1 bg-white font-sans text-black selection:bg-amber-100 print:p-0 print:m-0">
              <div className="max-w-[760px] mx-auto border-2 border-slate-900 p-6 bg-white shadow-md print:shadow-none print:border-2 print:border-black">
                {/* 1. Header: Uma Technofab Letterhead */}
                <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-serif font-black tracking-tight text-black">
                      Uma Technofab
                    </h1>
                    <p className="text-[11px] leading-tight text-slate-800 mt-1 font-medium">
                      Survey No.1040/3 , Village Rajpur ,<br />
                      Mehsana Highway, Nr.Sandvik Tube Ta.Kadi,<br />
                      Dist : Mehsana<br />
                      Email:- umatechnofab@gmail.com<br />
                      G.S.T.NO:24AAEFU9027H1Z3
                    </p>
                  </div>
                  <div className="text-right text-[11px] font-medium leading-tight text-slate-800">
                    <p>Mobile No.:9925011676</p>
                    <p>Phone No. :02764 233976</p>
                  </div>
                </div>

                {/* 2. Document Title: REQUIRE */}
                <div className="text-center py-1 border-b-2 border-slate-900 bg-slate-50 font-black tracking-wider text-sm uppercase">
                  REQUIRE
                </div>

                {/* 3. Address & Document Details Grid */}
                <div className="grid grid-cols-2 border-b-2 border-slate-900 text-xs">
                  {/* Left: TO Address */}
                  <div className="p-2.5 border-r-2 border-slate-900 space-y-0.5">
                    <span className="font-bold text-[11px] block">TO,</span>
                    <span className="font-black text-xs block uppercase">{selectedRequest.supplierName}</span>
                    <p className="text-[11px] whitespace-pre-line text-slate-800">
                      {selectedRequest.supplierAddress || 'ADDRESS NOT SPECIFIED'}
                    </p>
                    {selectedRequest.supplierMobile && (
                      <p className="font-bold text-[11px] pt-1">
                        MOB:-{selectedRequest.supplierMobile}
                      </p>
                    )}
                  </div>

                  {/* Right: Metadata Grid Table */}
                  <div className="divide-y border-slate-900 text-[11px]">
                    <div className="grid grid-cols-2 divide-x border-slate-900">
                      <div className="p-1 font-bold">DATE: {selectedRequest.rfqDate}</div>
                      <div className="p-1 font-bold text-right">{selectedRequest.pageNo || 'PAGE NO: 1 OF 1'}</div>
                    </div>
                    <div className="grid grid-cols-2 divide-x border-slate-900">
                      <div className="p-1 font-bold">REQ.NO: {selectedRequest.rfqNumber}</div>
                      <div className="p-1 font-bold">SURCHARGES: {selectedRequest.surcharges || 'NIL'}</div>
                    </div>
                    <div className="grid grid-cols-2 divide-x border-slate-900">
                      <div className="p-1 font-bold">BUYER: {selectedRequest.buyer || 'Uma Technofab.'}</div>
                      <div className="p-1 font-bold">TAXES: {selectedRequest.taxes || 'AS APPLICABLE.'}</div>
                    </div>
                    <div className="grid grid-cols-2 divide-x border-slate-900">
                      <div className="p-1 font-bold">SHIP TO: {selectedRequest.shipTo || 'LOCAL'}</div>
                      <div className="p-1 font-bold">DELIVERY: {selectedRequest.deliveryLocation || 'RAJPUR'}</div>
                    </div>
                    <div className="p-1 font-bold col-span-2">
                      G.S.T.NO: 24AAEFU9027H1Z3
                    </div>
                  </div>
                </div>

                {/* 4. Subject Line */}
                <div className="p-2 border-b-2 border-slate-900 font-black text-xs uppercase bg-slate-50">
                  {selectedRequest.subject || 'Sub:- REQUIRE FOR SS 316 L HR PLATE & COIL JINDAL MAKE'}
                </div>

                {/* 5. Material Table */}
                <div className="border-b-2 border-slate-900">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-900 text-[11px] font-bold text-center">
                        <th className="p-1.5 w-10 border-r-2 border-slate-900">Sr.<br />No.</th>
                        <th className="p-1.5 border-r-2 border-slate-900 text-left">Description of item(s)</th>
                        <th className="p-1.5 w-24 border-r-2 border-slate-900">QTY.</th>
                        <th className="p-1.5 w-24 border-r-2 border-slate-900">Rate .Per<br />/Kg</th>
                        <th className="p-1.5 w-24">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 text-xs">
                      {selectedRequest.items?.map((item, idx) => (
                        <tr key={item.id || idx} className="align-top">
                          <td className="p-2 text-center font-bold border-r-2 border-slate-900">
                            {idx + 1}
                          </td>
                          <td className="p-2 border-r-2 border-slate-900">
                            {item.groupTitle && (
                              <div className="font-black text-xs mb-1 uppercase tracking-tight flex items-center gap-1">
                                <span>❖</span>
                                <span>{item.groupTitle}</span>
                              </div>
                            )}
                            <div className="font-bold uppercase text-[11px] pl-2 whitespace-pre-line">
                              [{idx + 1}] {item.itemName}
                            </div>
                            {item.dimensions && (
                              <div className="text-[11px] pl-6 text-slate-800 whitespace-pre-line font-medium">
                                {item.dimensions}
                              </div>
                            )}
                          </td>
                          <td className="p-2 text-center font-bold border-r-2 border-slate-900 whitespace-nowrap">
                            {Number(item.quantity || item.requiredQuantity).toLocaleString()} {item.unitOfMeasure || 'KG'}
                          </td>
                          <td className="p-2 text-center font-mono border-r-2 border-slate-900">
                            {item.rate && Number(item.rate) > 0 ? `₹ ${item.rate}` : ''}
                          </td>
                          <td className="p-2 text-right font-mono">
                            {item.amount && Number(item.amount) > 0 ? `₹ ${item.amount}` : ''}
                          </td>
                        </tr>
                      ))}

                      {/* Special Note Box inside Table */}
                      <tr>
                        <td className="p-2 border-r-2 border-slate-900"></td>
                        <td className="p-3 border-r-2 border-slate-900 font-black text-xs uppercase tracking-tight whitespace-pre-line">
                          {selectedRequest.specialNote || 'REQUIRE TC\nSEND A BEST RATE'}
                        </td>
                        <td className="p-2 border-r-2 border-slate-900"></td>
                        <td className="p-2 border-r-2 border-slate-900"></td>
                        <td className="p-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 6. Terms & Conditions and Signature Grid */}
                <div className="grid grid-cols-12 text-[10px] leading-tight">
                  {/* Left 8 columns: Terms */}
                  <div className="col-span-8 p-2 border-r-2 border-slate-900 space-y-1">
                    <span className="font-black text-[11px] underline block uppercase">
                      TERMS & CONDITIONS
                    </span>
                    <ol className="list-decimal pl-3 space-y-1 text-slate-900">
                      {(selectedRequest.terms && selectedRequest.terms.length > 0 ? selectedRequest.terms : defaultTerms).map((term, tIdx) => (
                        <li key={tIdx} className="leading-tight">
                          {term}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Right 4 columns: Authorized Signature */}
                  <div className="col-span-4 p-3 flex flex-col justify-between text-center min-h-[140px]">
                    <div className="font-bold text-xs pt-2">
                      Thanking you we remain.
                    </div>
                    <div>
                      <div className="font-black text-xs uppercase tracking-wider">
                        For,
                      </div>
                      <div className="font-black text-sm uppercase tracking-wide mt-0.5">
                        UMA TECHNOFAB.
                      </div>
                      <div className="text-[10px] text-slate-600 mt-4">
                        Authorized Signatory
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
