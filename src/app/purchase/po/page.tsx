'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { PurchaseOrder, POItem } from '../../../types/purchase';

export default function PurchaseOrderPage() {
  const {
    purchaseOrders,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    approvePurchaseOrder,
    supplierQuotations,
    suppliers,
    projectJobs,
    currentUser,
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');

  // Modals
  const [viewPO, setViewPO] = useState<PurchaseOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mode: 'from_quotation' | 'direct'
  const [createMode, setCreateMode] = useState<'from_quotation' | 'direct'>(
    supplierQuotations && supplierQuotations.length > 0 ? 'from_quotation' : 'direct'
  );

  // From Quotation State
  const [selectedQuoteId, setSelectedQuoteId] = useState(supplierQuotations[0]?.id || '');

  // Direct Entry State
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [directJobId, setDirectJobId] = useState(projectJobs[0]?.id || projectJobs[0]?.jobNumber || '');
  const [directProjectId, setDirectProjectId] = useState(projectJobs[0]?.projectId || '');

  // Common PO fields
  const [newDeliveryDate, setNewDeliveryDate] = useState('2026-10-25');
  const [newPaymentTerms, setNewPaymentTerms] = useState('30 Days Credit after GRN');
  const [newDeliveryTerms, setNewDeliveryTerms] = useState('FOR Destination (Uma Techno Fab GIDC Works)');
  const [newDispatchMode, setNewDispatchMode] = useState('By Road Truck');
  const [newSpecialInstructions, setNewSpecialInstructions] = useState('Test certificates (MTC) required along with material delivery.');

  // Direct Items State
  const [directItems, setDirectItems] = useState<Array<{
    itemCode: string;
    itemName: string;
    specification: string;
    category: string;
    unitOfMeasure: string;
    orderedQuantity: number;
    unitPrice: number;
    gstPercentage: number;
  }>>([
    {
      itemCode: 'RM-MS-PL-12',
      itemName: 'IS 2062 E250 Mild Steel Plate 12mm',
      specification: 'Grade E250 BR/BO with Mill TC',
      category: 'Raw Material',
      unitOfMeasure: 'KG',
      orderedQuantity: 500,
      unitPrice: 62,
      gstPercentage: 18,
    }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddDirectItem = () => {
    setDirectItems(prev => [
      ...prev,
      {
        itemCode: `ITM-${Date.now().toString().slice(-4)}`,
        itemName: '',
        specification: '',
        category: 'Raw Material',
        unitOfMeasure: 'NOS',
        orderedQuantity: 1,
        unitPrice: 0,
        gstPercentage: 18,
      }
    ]);
  };

  const handleRemoveDirectItem = (index: number) => {
    if (directItems.length <= 1) return;
    setDirectItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleDirectItemChange = (index: number, field: string, value: any) => {
    setDirectItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Calculations for Direct PO
  const calculateDirectTotals = () => {
    let subTotal = 0;
    let taxTotal = 0;
    directItems.forEach(it => {
      const lineNet = Number(it.orderedQuantity || 0) * Number(it.unitPrice || 0);
      const lineTax = (lineNet * Number(it.gstPercentage || 0)) / 100;
      subTotal += lineNet;
      taxTotal += lineTax;
    });
    return {
      subTotal,
      taxTotal,
      grandTotal: subTotal + taxTotal,
    };
  };

  const filteredPOs = purchaseOrders.filter(po => {
    const pStatus = (po.status || '').toLowerCase();
    const fStatus = statusFilter.toLowerCase();
    if (statusFilter !== 'ALL' && pStatus !== fStatus) return false;
    if (projectFilter !== 'ALL' && po.projectId !== projectFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const poNum = (po.poNumber || '').toLowerCase();
      const sName = (po.supplierName || '').toLowerCase();
      const jId = (po.jobId || (po as any).job_code || '').toLowerCase();
      return poNum.includes(q) || sName.includes(q) || jId.includes(q);
    }
    return true;
  });

  // KPI calculations
  const totalPOValue = purchaseOrders.reduce((acc, p) => acc + (Number(p.grandTotal || (p as any).totalAmount || 0)), 0);
  const pendingCount = purchaseOrders.filter(p => {
    const s = (p.status || '').toLowerCase();
    return s === 'submitted' || s === 'pending approval' || s === 'pending_approval' || s === 'draft';
  }).length;
  const approvedCount = purchaseOrders.filter(p => {
    const s = (p.status || '').toLowerCase();
    return s === 'approved' || s === 'ordered' || s === 'completed' || s === 'partially received';
  }).length;

  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (createMode === 'from_quotation') {
      const sqObj = supplierQuotations.find(s => s.id === selectedQuoteId) || supplierQuotations[0];
      if (!sqObj) {
        showToast('Please create or select an approved Supplier Quotation first, or use Direct PO creation.');
        return;
      }

      const poItems: POItem[] = (sqObj.items || []).map((it, idx) => ({
        id: `POI-${Date.now()}-${idx}`,
        poId: '',
        itemCode: it.itemCode || `ITM-${idx + 1}`,
        itemName: it.itemName || 'Material Item',
        specification: it.specification || '',
        category: it.category || 'Raw Material',
        unitOfMeasure: it.unitOfMeasure || 'NOS',
        orderedQuantity: it.quotedQuantity || (it as any).quantity || 1,
        receivedQuantity: 0,
        unitPrice: it.unitPrice || (it as any).rate || 0,
        totalPrice: it.totalPrice || ((it.quotedQuantity || 1) * (it.unitPrice || 0)),
        gstPercentage: it.gstPercentage || (it as any).gst || 18,
        netPrice: it.netPrice || ((it.quotedQuantity || 1) * (it.unitPrice || 0) * (1 + (it.gstPercentage || 18) / 100)),
        hsnCode: (it as any).hsnCode || '72085110',
        drawingNumber: (it as any).drawingNumber || 'DWG-REV01',
      }));

      const newPO: PurchaseOrder = {
        id: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        poNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        revisionNumber: 0,
        projectId: sqObj.projectId || '',
        jobId: sqObj.jobId || '',
        quotationId: sqObj.id,
        supplierId: sqObj.supplierId || '',
        supplierName: sqObj.supplierName || 'Supplier',
        supplierGstin: (sqObj as any).supplierGstin || '',
        poDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: newDeliveryDate,
        paymentTerms: newPaymentTerms,
        deliveryTerms: newDeliveryTerms,
        dispatchMode: newDispatchMode,
        currency: 'INR',
        subTotal: sqObj.subTotal || sqObj.subtotal || 0,
        taxTotal: sqObj.taxTotal || 0,
        freightCharges: sqObj.freightCharges || 0,
        grandTotal: sqObj.grandTotal || (sqObj.subTotal || 0) + (sqObj.taxTotal || 0),
        status: 'Submitted',
        items: poItems,
        approvalTier: 'Tier 1 - Executive',
        specialInstructions: newSpecialInstructions,
        createdBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Super Admin',
      };

      addPurchaseOrder(newPO);
      showToast(`✅ Purchase Order ${newPO.poNumber} created and saved to database successfully!`);
      setShowCreateModal(false);
    } else {
      // Direct Mode
      const supplierObj = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];
      const supplierName = supplierObj ? (supplierObj.name || supplierObj.supplierName || (supplierObj as any).vendorName || 'Supplier') : '';
      const supplierGstin = supplierObj?.gstin || '';
      const supplierId = supplierObj?.id || '';

      const totals = calculateDirectTotals();
      const poItems: POItem[] = directItems.map((it, idx) => {
        const lineTotal = Number(it.orderedQuantity || 0) * Number(it.unitPrice || 0);
        const lineTax = (lineTotal * Number(it.gstPercentage || 0)) / 100;
        return {
          id: `POI-${Date.now()}-${idx}`,
          poId: '',
          itemCode: it.itemCode || `ITM-${idx + 1}`,
          itemName: it.itemName || 'Material Item',
          specification: it.specification || '',
          category: it.category || 'Raw Material',
          unitOfMeasure: it.unitOfMeasure || 'NOS',
          orderedQuantity: Number(it.orderedQuantity || 1),
          receivedQuantity: 0,
          unitPrice: Number(it.unitPrice || 0),
          totalPrice: lineTotal,
          gstPercentage: Number(it.gstPercentage || 18),
          netPrice: lineTotal + lineTax,
          hsnCode: '72085110',
          drawingNumber: 'DWG-REV01',
        };
      });

      const poCode = `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newPO: PurchaseOrder = {
        id: poCode,
        poNumber: poCode,
        revisionNumber: 0,
        projectId: directProjectId || '',
        jobId: directJobId || '',
        supplierId: supplierId,
        supplierName: supplierName,
        supplierGstin: supplierGstin,
        poDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: newDeliveryDate,
        paymentTerms: newPaymentTerms,
        deliveryTerms: newDeliveryTerms,
        dispatchMode: newDispatchMode,
        currency: 'INR',
        subTotal: totals.subTotal,
        taxTotal: totals.taxTotal,
        freightCharges: 0,
        grandTotal: totals.grandTotal,
        status: 'Submitted',
        items: poItems,
        approvalTier: 'Tier 1 - Executive',
        specialInstructions: newSpecialInstructions,
        createdBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Super Admin',
      };

      addPurchaseOrder(newPO);
      showToast(`✅ Purchase Order ${newPO.poNumber} created and saved to database successfully!`);
      setShowCreateModal(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#544B45] min-h-screen">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EBE3DB] print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 text-xs font-mono font-bold border border-emerald-500/30">
              PURCHASE ORDERS
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Purchase Orders (PO) Registry</h1>
          </div>
          <p className="text-[#70665F] text-xs mt-1">
            Official legally-binding purchase contracts with database persistence, revision history log & Project + Job mapping.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            + Create Purchase Order
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white p-4 rounded-2xl border border-[#EBE3DB] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-[#70665F]">Total Purchase Orders</div>
            <div className="text-2xl font-black text-[#211B17] mt-1">{purchaseOrders.length}</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EBE3DB] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-[#70665F]">Committed PO Value</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">₹{totalPOValue.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EBE3DB] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-[#70665F]">Pending Approval</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EBE3DB] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-[#70665F]">Approved / Active</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{approvedCount}</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 print:hidden shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#70665F]" />
            <input
              type="text"
              placeholder="Search PO No, Supplier, Job ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#211B17] focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#70665F]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Submitted">Submitted (Pending Approval)</option>
              <option value="Approved">Approved</option>
              <option value="Ordered">Ordered / Sent</option>
              <option value="Partially Received">Partially Received</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#70665F]">
          Showing <span className="text-[#211B17] font-bold">{filteredPOs.length}</span> of <span className="font-bold">{purchaseOrders.length}</span> Purchase Orders
        </div>
      </div>

      {/* PO Table */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">PO Number & Rev</th>
                <th className="p-3.5">Project & Job Reference</th>
                <th className="p-3.5">Supplier Name</th>
                <th className="p-3.5">PO Date</th>
                <th className="p-3.5">Expected Delivery</th>
                <th className="p-3.5 text-right">Grand Total (Inc GST)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#70665F]">
                    <ShoppingCart className="w-10 h-10 mx-auto text-[#70665F]/40 mb-2" />
                    <p className="font-semibold text-sm">No Purchase Orders Found</p>
                    <p className="text-[11px] mt-1">Click "+ Create Purchase Order" to generate a new PO.</p>
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po) => {
                  const statusNormalized = (po.status || 'Submitted').toLowerCase();
                  return (
                    <tr key={po.id} className="hover:bg-[#FAF7F2]/60 transition">
                      <td className="p-3.5 font-mono font-bold text-emerald-600">
                        {po.poNumber} <span className="text-[10px] text-[#70665F] font-normal">({typeof po.revisionNumber === 'number' ? `Rev-${po.revisionNumber}` : (po.revisionNumber || 'Rev-00')})</span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-amber-600">{po.jobId || (po as any).job_code || '—'}</div>
                        <div className="text-[10px] text-[#70665F]">{po.projectId || (po as any).project_id || '—'}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-[#211B17]">{po.supplierName || 'Supplier'}</td>
                      <td className="p-3.5 text-[#544B45] font-mono text-[11px]">{po.poDate || (po as any).date || '-'}</td>
                      <td className="p-3.5 font-mono text-amber-600 font-semibold text-[11px]">
                        {po.expectedDeliveryDate || (po as any).deliveryDate || (po as any).delivery_date || '-'}
                      </td>
                      <td className="p-3.5 text-right font-mono font-extrabold text-emerald-600 text-sm">
                        ₹{(Number(po.grandTotal || (po as any).totalAmount || 0)).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            statusNormalized === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              : statusNormalized === 'partially received' || statusNormalized === 'partially_received'
                              ? 'bg-sky-500/10 text-sky-600 border-sky-500/30'
                              : statusNormalized === 'completed'
                              ? 'bg-purple-500/10 text-purple-600 border-purple-500/30'
                              : statusNormalized === 'submitted' || statusNormalized === 'pending approval' || statusNormalized === 'pending_approval' || statusNormalized === 'draft'
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                          }`}
                        >
                          {po.status || 'Submitted'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {statusNormalized === 'submitted' && (
                            <button
                              onClick={() => {
                                approvePurchaseOrder(po.id, currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Super Admin');
                                showToast(`Approved PO ${po.poNumber}`);
                              }}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                              title="Approve PO"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setViewPO(po)}
                            className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EBE3DB] text-[#211B17] transition"
                            title="View & Print Official PO"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete PO ${po.poNumber}?`)) {
                                deletePurchaseOrder(po.id);
                                showToast(`Deleted PO ${po.poNumber}`);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-rose-50 text-[#70665F] hover:text-rose-600 transition"
                            title="Delete PO"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* VIEW PO PRINTABLE MODAL */}
      {viewPO && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl">
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between print:hidden">
              <div>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-700 px-2 py-0.5 rounded font-bold">
                  OFFICIAL PURCHASE ORDER
                </span>
                <h2 className="text-xl font-black text-[#211B17] mt-1">
                  {viewPO.poNumber} <span className="text-xs text-[#70665F] font-mono">({typeof viewPO.revisionNumber === 'number' ? `Rev-${viewPO.revisionNumber}` : (viewPO.revisionNumber || 'Rev-00')})</span>
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" /> Print PO
                </button>
                <button onClick={() => setViewPO(null)} className="text-[#70665F] hover:text-[#211B17] p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
              {/* Company & Supplier Header */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <div>
                  <h3 className="font-extrabold text-[#211B17] text-sm">UMA TECHNO FAB</h3>
                  <p className="text-[#70665F] text-[11px] mt-0.5">
                    Plot No. 45, GIDC Industrial Estate, Odhav, Ahmedabad, Gujarat - 382415<br />
                    GSTIN: 24AAACU1234F1Z9 | Email: purchase@umatechnofab.com
                  </p>
                  <div className="mt-2 text-[11px] text-[#70665F]">
                    <span className="font-semibold text-[#211B17]">PO Date:</span> {viewPO.poDate || (viewPO as any).date}<br />
                    <span className="font-semibold text-[#211B17]">Project Ref:</span> {viewPO.projectId || '—'} | <span className="font-semibold text-[#211B17]">Job:</span> {viewPO.jobId || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[#70665F] font-semibold">Vendor / Supplier:</div>
                  <h4 className="font-bold text-emerald-600 text-sm">{viewPO.supplierName}</h4>
                  <p className="text-[#70665F] text-[11px] mt-0.5 font-mono">
                    GSTIN: {viewPO.supplierGstin || '24AAAAA0000A1Z5'}<br />
                    Payment Terms: {viewPO.paymentTerms || '30 Days Credit after GRN'}<br />
                    Delivery: {viewPO.expectedDeliveryDate || (viewPO as any).deliveryDate}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="font-bold text-[#211B17] mb-2 uppercase tracking-wider">Ordered Material Specifications</h4>
                <div className="border border-[#EBE3DB] rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF7F2] text-[#70665F] font-semibold">
                      <tr>
                        <th className="p-2.5">Item Code</th>
                        <th className="p-2.5">Item Description & HSN</th>
                        <th className="p-2.5 text-right">Qty</th>
                        <th className="p-2.5 text-right">Unit Rate</th>
                        <th className="p-2.5 text-right">Tax (GST)</th>
                        <th className="p-2.5 text-right">Net Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE3DB]">
                      {viewPO.items && viewPO.items.length > 0 ? (
                        viewPO.items.map((it, idx) => (
                          <tr key={it.id || idx}>
                            <td className="p-2.5 font-mono text-emerald-600">{it.itemCode}</td>
                            <td className="p-2.5 font-semibold text-[#211B17]">
                              {it.itemName}
                              <div className="text-[10px] text-[#70665F]">HSN: {it.hsnCode || '72085110'} | Spec: {it.specification || '-'}</div>
                            </td>
                            <td className="p-2.5 text-right font-mono">{it.orderedQuantity || (it as any).quantity || 1} {it.unitOfMeasure || 'NOS'}</td>
                            <td className="p-2.5 text-right font-mono">₹{(it.unitPrice || (it as any).rate || 0).toLocaleString('en-IN')}</td>
                            <td className="p-2.5 text-right font-mono text-[#70665F]">{it.gstPercentage || 18}%</td>
                            <td className="p-2.5 text-right font-mono font-bold text-emerald-600">
                              ₹{(Number(it.netPrice || it.totalPrice || 0)).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-3 text-center text-[#70665F]">No line items defined</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Terms & Special Instructions */}
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] space-y-1">
                <div className="font-bold text-[#211B17]">Terms & Conditions:</div>
                <p className="text-[11px] text-[#70665F]">
                  1. Delivery Terms: {viewPO.deliveryTerms || 'FOR Destination (Uma Techno Fab Works)'}<br />
                  2. Dispatch Mode: {viewPO.dispatchMode || 'By Road Truck'}<br />
                  3. Special Instructions: {viewPO.specialInstructions || 'Test certificates (MTC) required along with material delivery.'}
                </p>
              </div>

              {/* Total Financial Summary */}
              <div className="flex justify-end">
                <div className="w-64 bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB] space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-[#70665F]">
                    <span>Subtotal:</span>
                    <span>₹{(Number(viewPO.subTotal || 0)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#70665F]">
                    <span>Tax (GST Total):</span>
                    <span>₹{(Number(viewPO.taxTotal || (viewPO as any).taxAmount || 0)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#70665F]">
                    <span>Freight Charges:</span>
                    <span>₹{(Number(viewPO.freightCharges || 0)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-[#EBE3DB] flex justify-between font-extrabold text-[#211B17] text-sm">
                    <span>Grand Total:</span>
                    <span className="text-emerald-600">₹{(Number(viewPO.grandTotal || (viewPO as any).totalAmount || 0)).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FAF7F2] border-t border-[#EBE3DB] flex justify-end print:hidden">
              <button onClick={() => setViewPO(null)} className="px-4 py-2 bg-white border border-[#EBE3DB] text-[#211B17] font-bold rounded-xl hover:bg-[#FAF7F2]">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PO MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-5 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-700 px-2 py-0.5 rounded font-bold">
                  NEW PURCHASE ORDER
                </span>
                <h2 className="text-lg font-black text-[#211B17] mt-1">Create Purchase Order (PO)</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="px-6 pt-4 flex gap-3 border-b border-[#EBE3DB] pb-3 bg-white">
              <button
                type="button"
                onClick={() => setCreateMode('from_quotation')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  createMode === 'from_quotation' ? 'bg-emerald-600 text-white shadow' : 'bg-[#FAF7F2] text-[#70665F] hover:text-[#211B17]'
                }`}
              >
                From Approved Quotation ({supplierQuotations.length})
              </button>
              <button
                type="button"
                onClick={() => setCreateMode('direct')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  createMode === 'direct' ? 'bg-emerald-600 text-white shadow' : 'bg-[#FAF7F2] text-[#70665F] hover:text-[#211B17]'
                }`}
              >
                Direct PO Creation
              </button>
            </div>

            <form onSubmit={handleCreatePOSubmit} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {createMode === 'from_quotation' ? (
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Select Approved Supplier Quotation</label>
                  {supplierQuotations.length === 0 ? (
                    <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
                      No supplier quotations found. Switch to <b>Direct PO Creation</b> above to create a PO directly.
                    </div>
                  ) : (
                    <select
                      value={selectedQuoteId || supplierQuotations[0]?.id}
                      onChange={(e) => setSelectedQuoteId(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2.5 rounded-xl text-[#211B17] focus:outline-none focus:border-emerald-500"
                    >
                      {supplierQuotations.map((sq) => (
                        <option key={sq.id} value={sq.id}>
                          {sq.quotationNumber || sq.id} - {sq.supplierName} (Total: ₹{(Number(sq.grandTotal || sq.subTotal || 0)).toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                /* Direct PO Configuration */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[#70665F] font-semibold mb-1">Select Supplier</label>
                      <select
                        value={selectedSupplierId || suppliers[0]?.id}
                        onChange={(e) => setSelectedSupplierId(e.target.value)}
                        className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] focus:outline-none focus:border-emerald-500"
                      >
                        {suppliers.length > 0 ? (
                          suppliers.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name || s.supplierName} ({s.vendorCode || s.id})
                            </option>
                          ))
                        ) : (
                          <option value="">No suppliers available</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#70665F] font-semibold mb-1">Job ID Reference</label>
                      <input
                        type="text"
                        value={directJobId}
                        onChange={(e) => setDirectJobId(e.target.value)}
                        placeholder="e.g. JOB-2026-001"
                        className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[#70665F] font-semibold mb-1">Project ID Reference</label>
                      <input
                        type="text"
                        value={directProjectId}
                        onChange={(e) => setDirectProjectId(e.target.value)}
                        placeholder="PRJ-2026-0001"
                        className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Line Items Builder */}
                  <div className="border border-[#EBE3DB] rounded-xl p-3 bg-[#FAF7F2]/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#211B17] text-xs uppercase">PO Line Items</h4>
                      <button
                        type="button"
                        onClick={handleAddDirectItem}
                        className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold hover:underline"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Add Item
                      </button>
                    </div>

                    {directItems.map((item, idx) => (
                      <div key={idx} className="p-3 bg-white border border-[#EBE3DB] rounded-xl space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <div>
                            <label className="text-[10px] text-[#70665F]">Item Code</label>
                            <input
                              type="text"
                              value={item.itemCode}
                              onChange={(e) => handleDirectItemChange(idx, 'itemCode', e.target.value)}
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-1.5 rounded-lg text-xs font-mono"
                              required
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[10px] text-[#70665F]">Item Name / Description</label>
                            <input
                              type="text"
                              value={item.itemName}
                              onChange={(e) => handleDirectItemChange(idx, 'itemName', e.target.value)}
                              placeholder="e.g. Mild Steel Plate 12mm"
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-1.5 rounded-lg text-xs"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[#70665F]">Specification</label>
                            <input
                              type="text"
                              value={item.specification}
                              onChange={(e) => handleDirectItemChange(idx, 'specification', e.target.value)}
                              placeholder="Grade E250"
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-1.5 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
                          <div>
                            <label className="text-[10px] text-[#70665F]">Qty</label>
                            <input
                              type="number"
                              value={item.orderedQuantity}
                              onChange={(e) => handleDirectItemChange(idx, 'orderedQuantity', Number(e.target.value))}
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-1.5 rounded-lg text-xs font-mono"
                              min="1"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[#70665F]">UOM</label>
                            <input
                              type="text"
                              value={item.unitOfMeasure}
                              onChange={(e) => handleDirectItemChange(idx, 'unitOfMeasure', e.target.value)}
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-1.5 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[#70665F]">Unit Rate (₹)</label>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleDirectItemChange(idx, 'unitPrice', Number(e.target.value))}
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-1.5 rounded-lg text-xs font-mono"
                              min="0"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[#70665F]">GST (%)</label>
                            <input
                              type="number"
                              value={item.gstPercentage}
                              onChange={(e) => handleDirectItemChange(idx, 'gstPercentage', Number(e.target.value))}
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-1.5 rounded-lg text-xs font-mono"
                            />
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs font-bold text-emerald-600 font-mono">
                              ₹{(Number(item.orderedQuantity || 0) * Number(item.unitPrice || 0) * (1 + Number(item.gstPercentage || 18) / 100)).toLocaleString('en-IN')}
                            </span>
                            {directItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveDirectItem(idx)}
                                className="text-rose-500 hover:text-rose-700 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end p-2 bg-white rounded-xl border border-[#EBE3DB] font-mono text-xs font-bold text-[#211B17]">
                      Direct PO Total: ₹{calculateDirectTotals().grandTotal.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery & Payment Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={newDeliveryDate}
                    onChange={(e) => setNewDeliveryDate(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17] font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#70665F] font-semibold mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={newPaymentTerms}
                    onChange={(e) => setNewPaymentTerms(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] font-semibold mb-1">Special Instructions & Quality Requisites</label>
                <textarea
                  rows={2}
                  value={newSpecialInstructions}
                  onChange={(e) => setNewSpecialInstructions(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] p-2 rounded-xl text-[#211B17]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-white border border-[#EBE3DB] text-[#211B17] rounded-xl hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition active:scale-95"
                >
                  Generate & Save PO to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
