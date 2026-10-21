'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useERP } from '@/context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '@/components/ui/ERPListPageLayout';
import { CustomerPO } from '@/types/crm';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/context/ToastContext';
import {
  Briefcase,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  Edit3,
  Trash2,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  ExternalLink,
  Calendar,
  Building,
  DollarSign,
  Download,
  AlertTriangle,
  Paperclip,
  Plus,
} from 'lucide-react';

export default function CustomerPOPage() {
  const router = useRouter();
  const { customerPOs, updateCustomerPO, deleteCustomerPO, quotations, customers } = useERP();

  // Modals state
  const [viewingPO, setViewingPO] = useState<CustomerPO | null>(null);
  const [editingPO, setEditingPO] = useState<CustomerPO | null>(null);
  const [uploadPO, setUploadPO] = useState<CustomerPO | null>(null);
  const [deletingPO, setDeletingPO] = useState<CustomerPO | null>(null);

  // Edit form state
  const [editPoNumber, setEditPoNumber] = useState('');
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editPoAmount, setEditPoAmount] = useState<number | string>(0);
  const [editPoDate, setEditPoDate] = useState('');
  const [editDeliveryDate, setEditDeliveryDate] = useState('');
  const [editPaymentTerms, setEditPaymentTerms] = useState('');
  const [editStatus, setEditStatus] = useState<string>('received');
  const [editScopeOfWork, setEditScopeOfWork] = useState('');
  const [editRemarks, setEditRemarks] = useState('');

  // Upload modal state
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string; size?: string; type?: string; uploadedAt?: string }>>([]);
  const [manualUrl, setManualUrl] = useState('');
  const [manualName, setManualName] = useState('');

  // Open Edit Modal
  const handleOpenEdit = (po: CustomerPO) => {
    setEditingPO(po);
    setEditPoNumber(po.poNumber || '');
    setEditCustomerName(po.customerName || '');
    setEditPoAmount(po.poAmount || (po as any).po_value || 0);
    setEditPoDate(po.poDate || '');
    setEditDeliveryDate(po.deliveryDate || '');
    setEditPaymentTerms(po.paymentTerms || '');
    // Normalize status away from legacy sales order
    let st = po.status;
    if (st === 'sales_order_created' || st === 'converted_to_so') {
      st = 'verified';
    }
    setEditStatus(st || 'received');
    setEditScopeOfWork(po.scopeOfWork || (po as any).scope_of_work || '');
    setEditRemarks(po.remarks || '');
  };

  // Submit Edit Modal
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPO) return;
    if (!editPoNumber.trim()) {
      toast.error('PO Number is required');
      return;
    }

    try {
      await updateCustomerPO(editingPO.id, {
        poNumber: editPoNumber.trim(),
        customerName: editCustomerName.trim() || editingPO.customerName,
        poAmount: Number(editPoAmount) || 0,
        poDate: editPoDate,
        deliveryDate: editDeliveryDate,
        paymentTerms: editPaymentTerms,
        status: editStatus,
        scopeOfWork: editScopeOfWork,
        remarks: editRemarks,
      });
      toast.success('Customer PO updated successfully');
      setEditingPO(null);
    } catch {
      toast.error('Failed to update Customer PO');
    }
  };

  // Open Upload Modal
  const handleOpenUpload = (po: CustomerPO) => {
    setUploadPO(po);
    setManualUrl('');
    setManualName('');
    const existing = po.attachments || [];
    if (existing.length === 0 && po.attachmentUrl) {
      setUploadedFiles([
        {
          name: 'Customer PO Document',
          url: po.attachmentUrl,
          type: po.attachmentUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? 'image' : 'pdf',
          uploadedAt: new Date().toLocaleDateString(),
        },
      ]);
    } else {
      setUploadedFiles(existing);
    }
  };

  // Handle local file selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const isImg = file.type.startsWith('image/');
      reader.onload = () => {
        const url = reader.result as string;
        const newAttachment = {
          name: file.name,
          url,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: isImg ? 'image' : 'pdf',
          uploadedAt: new Date().toLocaleDateString(),
        };
        setUploadedFiles((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
    // reset input
    e.target.value = '';
  };

  // Add manual URL
  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    const isImg = manualUrl.match(/\.(jpg|jpeg|png|webp|gif)($|\?)/i);
    const newAttachment = {
      name: manualName.trim() || 'Attached File / Drawing',
      url: manualUrl.trim(),
      type: isImg ? 'image' : 'pdf',
      uploadedAt: new Date().toLocaleDateString(),
    };
    setUploadedFiles((prev) => [...prev, newAttachment]);
    setManualUrl('');
    setManualName('');
  };

  // Remove single uploaded attachment
  const handleRemoveAttachment = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Save attachments to PO
  const handleSaveAttachments = async () => {
    if (!uploadPO) return;
    try {
      const firstUrl = uploadedFiles[0]?.url || '';
      await updateCustomerPO(uploadPO.id, {
        attachments: uploadedFiles,
        attachmentUrl: firstUrl,
      });
      toast.success('Files & images saved successfully');
      setUploadPO(null);
    } catch {
      toast.error('Failed to save attachments');
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingPO) return;
    try {
      await deleteCustomerPO(deletingPO.id);
      toast.success(`Customer PO ${deletingPO.poNumber} deleted`);
      setDeletingPO(null);
    } catch {
      toast.error('Failed to delete Customer PO');
    }
  };

  // Export CSV without Sales Order reference
  const handleExportCSV = () => {
    const csv = [
      'Customer PO #,Customer,Ref Quotation,PO Value,PO Date,Target Delivery,Status,Payment Terms,Remarks',
      ...customerPOs.map((po) => {
        const val = Number(po.poAmount || (po as any).po_value || (po as any).poValue || 0);
        let st = po.status || 'Received';
        if (st === 'sales_order_created' || st === 'converted_to_so') st = 'Verified';
        return `"${po.poNumber}","${po.customerName}","${po.quotationNumber || po.quotationId || 'Direct'}","${val}","${po.poDate || ''}","${po.deliveryDate || ''}","${st}","${po.paymentTerms || ''}","${po.remarks || ''}"`;
      }),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Customer_POs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Normalize status helper
  const getStatusBadge = (status?: string) => {
    const s = (status || 'received').toLowerCase();
    if (s === 'verified' || s === 'sales_order_created' || s === 'converted_to_so') {
      return (
        <span className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          Verified &amp; Accepted
        </span>
      );
    }
    if (s === 'in_planning' || s === 'planning') {
      return (
        <span className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300 inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          In Planning
        </span>
      );
    }
    if (s === 'in_production' || s === 'production') {
      return (
        <span className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300 inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
          In Production
        </span>
      );
    }
    if (s === 'completed') {
      return (
        <span className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-300 inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
          Completed
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
          Cancelled
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
        Received (Under Review)
      </span>
    );
  };

  const columns: ERPColumn<CustomerPO>[] = [
    {
      key: 'poNumber',
      header: 'CUSTOMER PO #',
      isCodeLink: true,
      onCodeClick: (po) => setViewingPO(po),
      cell: (po) => (
        <button
          onClick={() => setViewingPO(po)}
          className="font-mono font-bold text-[#3E2723] hover:text-amber-800 bg-[#FAF7F2] hover:bg-[#EBE3DB] px-2.5 py-1 rounded-lg border border-[#E8DFD3] text-xs whitespace-nowrap inline-flex items-center gap-1.5 transition text-left cursor-pointer"
        >
          <span>{po.poNumber}</span>
          {(po.attachments?.length || po.attachmentUrl) && (
            <span title="Has attachments">
              <Paperclip className="w-3 h-3 text-amber-700" />
            </span>
          )}
        </button>
      ),
    },
    {
      key: 'customerName',
      header: 'CUSTOMER & QUOTATION REF',
      cell: (po) => (
        <div className="min-w-[190px]">
          <span className="font-bold text-slate-900 text-xs block">{po.customerName}</span>
          {po.quotationId ? (
            <Link
              href={`/crm/quotations/${po.quotationId}`}
              className="text-[11px] text-amber-800 hover:text-amber-900 hover:underline font-mono inline-flex items-center gap-0.5 mt-0.5"
            >
              <span>Ref Quotation: {po.quotationNumber || po.quotationId}</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          ) : (
            <span className="text-[11px] text-slate-500 font-mono block mt-0.5">Ref: Direct Customer PO</span>
          )}
        </div>
      ),
    },
    {
      key: 'poValue',
      header: 'PO VALUE',
      cell: (po) => (
        <span className="font-bold text-emerald-700 font-mono text-xs whitespace-nowrap inline-block">
          {formatCurrency(Number(po.poAmount || (po as any).po_value || (po as any).poValue || 0))}
        </span>
      ),
    },
    {
      key: 'dates',
      header: 'PO DATE & TARGET DELIVERY',
      cell: (po) => (
        <div className="font-mono text-slate-700 text-[11px] whitespace-nowrap">
          <span className="block font-semibold">Date: {formatDate(po.poDate)}</span>
          <span className="block text-[10px] text-slate-500">Delivery: {formatDate(po.deliveryDate)}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: (po) => getStatusBadge(po.status),
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      cell: (po) => (
        <div className="whitespace-nowrap flex items-center gap-1.5">
          {/* 1. View Button */}
          <button
            type="button"
            onClick={() => setViewingPO(po)}
            className="p-1.5 text-slate-700 hover:text-[#3E2723] hover:bg-[#EFE8DF] rounded-lg transition border border-transparent hover:border-[#D7CCC8] cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* 2. Edit Button */}
          <button
            type="button"
            onClick={() => handleOpenEdit(po)}
            className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition border border-transparent hover:border-blue-200 cursor-pointer"
            title="Edit Customer PO"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* 3. Upload Files & Image Button */}
          <button
            type="button"
            onClick={() => handleOpenUpload(po)}
            className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition border border-transparent hover:border-emerald-200 cursor-pointer relative"
            title="Upload Files & Image"
          >
            <UploadCloud className="w-4 h-4" />
            {(po.attachments?.length || po.attachmentUrl) ? (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
            ) : null}
          </button>

          {/* 4. Delete Button */}
          <button
            type="button"
            onClick={() => setDeletingPO(po)}
            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition border border-transparent hover:border-rose-200 cursor-pointer"
            title="Delete Customer PO"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <ERPListPageLayout<CustomerPO>
        breadcrumbs={['DASHBOARD', 'CRM & SALES', 'CUSTOMER PURCHASE ORDERS']}
        title="Customer Purchase Orders (Inward Verification)"
        columns={columns}
        data={customerPOs}
        searchPlaceholder="Search customer PO #, customer, or quotation ref..."
        addNewHref="/crm/customer-po/new"
        addNewLabel="Register Customer PO"
        onExport={handleExportCSV}
      />

      {/* ============================================================ */}
      {/* 1. VIEW PO DETAILS MODAL */}
      {/* ============================================================ */}
      {viewingPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#3E2723] text-white rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900">
                    Customer PO Details: <span className="font-mono text-amber-800">{viewingPO.poNumber}</span>
                  </h3>
                  <div className="text-xs text-stone-500">Registered ID: {viewingPO.id}</div>
                </div>
              </div>
              <button
                onClick={() => setViewingPO(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-stone-700">
              {/* Quick Status Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-500 font-semibold">Current Lifecycle Status:</span>
                <div>{getStatusBadge(viewingPO.status)}</div>
              </div>

              {/* Grid 2-col Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 p-3 rounded-xl border border-stone-200 bg-white">
                  <span className="text-[11px] font-bold text-stone-500 uppercase">Customer Name</span>
                  <div className="font-bold text-stone-900 text-sm">{viewingPO.customerName}</div>
                  {viewingPO.customerId && (
                    <div className="text-[11px] text-stone-400 font-mono">ID: {viewingPO.customerId}</div>
                  )}
                </div>

                <div className="space-y-1 p-3 rounded-xl border border-stone-200 bg-white">
                  <span className="text-[11px] font-bold text-stone-500 uppercase">PO Amount / Value</span>
                  <div className="font-bold text-emerald-700 text-base font-mono">
                    {formatCurrency(Number(viewingPO.poAmount || (viewingPO as any).po_value || 0))}
                  </div>
                </div>

                <div className="space-y-1 p-3 rounded-xl border border-stone-200 bg-white">
                  <span className="text-[11px] font-bold text-stone-500 uppercase">PO Date</span>
                  <div className="font-semibold text-stone-800 font-mono">{formatDate(viewingPO.poDate)}</div>
                </div>

                <div className="space-y-1 p-3 rounded-xl border border-stone-200 bg-white">
                  <span className="text-[11px] font-bold text-stone-500 uppercase">Target Delivery Date</span>
                  <div className="font-semibold text-stone-800 font-mono">{formatDate(viewingPO.deliveryDate)}</div>
                </div>
              </div>

              {/* Linked Quotation */}
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-900 uppercase block">Linked Quotation Reference</span>
                  <span className="font-mono text-stone-800 text-xs">
                    {viewingPO.quotationNumber || viewingPO.quotationId || 'Direct Customer PO (No Quotation)'}
                  </span>
                </div>
                {viewingPO.quotationId && (
                  <Link
                    href={`/crm/quotations/${viewingPO.quotationId}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition"
                  >
                    <span>View Quotation</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* Payment Terms */}
              {viewingPO.paymentTerms && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-stone-500 uppercase">Commercial &amp; Payment Terms</span>
                  <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 leading-relaxed">
                    {viewingPO.paymentTerms}
                  </div>
                </div>
              )}

              {/* Scope of Work */}
              {(viewingPO.scopeOfWork || (viewingPO as any).scope_of_work) && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-stone-500 uppercase">Scope of Work &amp; Equipment Description</span>
                  <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 whitespace-pre-wrap leading-relaxed font-mono text-[11px]">
                    {viewingPO.scopeOfWork || (viewingPO as any).scope_of_work}
                  </div>
                </div>
              )}

              {/* Remarks */}
              {viewingPO.remarks && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-stone-500 uppercase">Internal Remarks</span>
                  <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-700">
                    {viewingPO.remarks}
                  </div>
                </div>
              )}

              {/* Attached Files & Images */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-700 uppercase flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-stone-500" /> Attached Documents &amp; Images
                  </span>
                  <button
                    onClick={() => {
                      const po = viewingPO;
                      setViewingPO(null);
                      handleOpenUpload(po);
                    }}
                    className="text-amber-800 hover:underline text-[11px] font-bold inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add / Manage Files
                  </button>
                </div>

                {(!viewingPO.attachments || viewingPO.attachments.length === 0) && !viewingPO.attachmentUrl ? (
                  <div className="text-center py-4 bg-stone-50 border border-dashed border-stone-300 rounded-xl text-stone-400">
                    No files or images attached to this Customer PO yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {(viewingPO.attachments || [
                      {
                        name: 'PO Document',
                        url: viewingPO.attachmentUrl || '',
                        type: viewingPO.attachmentUrl?.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? 'image' : 'pdf',
                      },
                    ]).map((att, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-stone-200 bg-white flex items-center justify-between gap-2 shadow-xs"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {att.type === 'image' || att.url?.startsWith('data:image/') ? (
                            <img src={att.url} alt={att.name} className="w-8 h-8 rounded-lg object-cover border border-stone-200" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <span className="font-semibold text-stone-800 block truncate text-xs" title={att.name}>
                              {att.name}
                            </span>
                            {att.size && <span className="text-[10px] text-stone-400 block">{att.size}</span>}
                          </div>
                        </div>
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={att.name}
                          className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition"
                          title="Open / Download"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  const po = viewingPO;
                  setViewingPO(null);
                  handleOpenEdit(po);
                }}
                className="px-4 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-xs transition inline-flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" /> Edit PO
              </button>
              <button
                type="button"
                onClick={() => setViewingPO(null)}
                className="px-4 py-2 rounded-xl bg-[#3E2723] text-white hover:bg-[#2E1D19] font-semibold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. EDIT CUSTOMER PO MODAL */}
      {/* ============================================================ */}
      {editingPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600 text-white rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900">Edit Customer PO</h3>
                  <div className="text-xs text-stone-500 font-mono">{editingPO.id}</div>
                </div>
              </div>
              <button
                onClick={() => setEditingPO(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Customer PO Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editPoNumber}
                    onChange={(e) => setEditPoNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600 font-mono"
                    placeholder="e.g. PO/2026/014"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={editCustomerName}
                    onChange={(e) => setEditCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600"
                    placeholder="Customer Company Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">PO Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPoAmount}
                    onChange={(e) => setEditPoAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Lifecycle Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600 font-semibold text-xs"
                  >
                    <option value="received">Received (Under Review)</option>
                    <option value="verified">Verified &amp; Accepted</option>
                    <option value="in_planning">In Planning &amp; Design</option>
                    <option value="in_production">In Production</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">PO Date</label>
                  <input
                    type="date"
                    value={editPoDate}
                    onChange={(e) => setEditPoDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Target Delivery Date</label>
                  <input
                    type="date"
                    value={editDeliveryDate}
                    onChange={(e) => setEditDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={editPaymentTerms}
                  onChange={(e) => setEditPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600"
                  placeholder="e.g. 30% Advance, 70% against dispatch"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Scope of Work</label>
                <textarea
                  rows={2}
                  value={editScopeOfWork}
                  onChange={(e) => setEditScopeOfWork(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600"
                  placeholder="Equipment description, specifications, or scope of supply..."
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Internal Remarks</label>
                <textarea
                  rows={2}
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-600"
                  placeholder="Any additional notes or conditions..."
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPO(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-xs transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. UPLOAD FILES & IMAGES MODAL */}
      {/* ============================================================ */}
      {uploadPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-600 text-white rounded-xl">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900">Upload Files &amp; Image</h3>
                  <div className="text-xs text-stone-500 font-mono">Customer PO: {uploadPO.poNumber}</div>
                </div>
              </div>
              <button
                onClick={() => setUploadPO(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Drag & Drop File Picker */}
              <div className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-stone-50/50 hover:bg-emerald-50/30 transition cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.doc,.docx,.dwg,.dxf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="space-y-1.5">
                  <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-bold text-stone-800 text-sm">Choose files or drop them here</div>
                  <div className="text-stone-500 text-[11px]">
                    Supports PO scans, Engineering drawings, PDFs, and Images (JPG, PNG, WEBP)
                  </div>
                </div>
              </div>

              {/* Or manual link */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <span className="text-[11px] font-bold text-stone-600 uppercase">Or Add External File Link / Cloud URL</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Document Title (e.g. Approved Drawing)"
                    className="w-1/3 px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 text-xs"
                  />
                  <input
                    type="url"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="https://... URL"
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualUrl}
                    className="px-3 py-2 bg-stone-800 text-white rounded-xl font-semibold hover:bg-stone-900 transition text-xs shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Uploaded List */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <span className="text-[11px] font-bold text-stone-700 uppercase flex items-center justify-between">
                  <span>Current Attached Files ({uploadedFiles.length})</span>
                </span>

                {uploadedFiles.length === 0 ? (
                  <div className="text-center py-4 text-stone-400 bg-stone-50 rounded-xl border border-stone-200">
                    No files attached yet.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {uploadedFiles.map((f, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl border border-stone-200 bg-white flex items-center justify-between gap-2 shadow-xs"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {f.type === 'image' || f.url?.startsWith('data:image/') ? (
                            <img src={f.url} alt={f.name} className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <span className="font-semibold text-stone-800 block truncate text-xs" title={f.name}>
                              {f.name}
                            </span>
                            <span className="text-[10px] text-stone-400 block">{f.size || f.uploadedAt || 'Uploaded'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition"
                            title="Open Link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(i)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            title="Remove File"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUploadPO(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 font-semibold transition text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAttachments}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-xs transition text-xs inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Attachments
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. DELETE CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {deletingPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-stone-200 overflow-hidden">
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-900">Delete Customer Purchase Order?</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Are you sure you want to permanently delete Customer PO{' '}
                <strong className="text-stone-800 font-mono">{deletingPO.poNumber}</strong> for{' '}
                <strong className="text-stone-800">{deletingPO.customerName}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDeletingPO(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 font-semibold shadow-xs transition inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete PO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
