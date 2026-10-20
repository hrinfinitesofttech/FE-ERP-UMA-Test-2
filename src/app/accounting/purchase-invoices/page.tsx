'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { PurchaseInvoice } from '../../../types/accounting';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { toast } from '../../../context/ToastContext';
import { FileText, Search, Plus, Filter, CheckCircle2, Clock, Eye, Download, Building, ShieldCheck, Scale } from 'lucide-react';

export default function PurchaseInvoicesPage() {
  const router = useRouter();
  const { purchaseInvoices, addPurchaseInvoice, postPurchaseInvoice, suppliers, goodsReceipts, purchaseOrders } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [vendorInvoiceNumber, setVendorInvoiceNumber] = useState('');
  const [poNumber, setPoNumber] = useState(purchaseOrders[0]?.poNumber || '');
  const [grnNumber, setGrnNumber] = useState(goodsReceipts[0]?.grnNumber || '');
  const [subTotal, setSubTotal] = useState<number | string>('');
  const [taxRate, setTaxRate] = useState<number | string>(18);
  const [tdsSection, setTdsSection] = useState('194C');
  const [tdsRate, setTdsRate] = useState<number | string>(2);

  const filteredInvoices = (purchaseInvoices || []).filter((inv) => {
    const matchesSearch =

      !searchTerm?.trim() || (

      (inv.invoiceNumber || '')?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      (inv.supplierName || '')?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      (inv.vendorInvoiceNumber || inv.supplierInvoiceNumber || '')?.toLowerCase().includes(searchTerm?.toLowerCase())

    );
    const matchesStatus = selectedStatus === 'All' || inv.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePurchaseInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const supp = suppliers.find((s) => s.id === supplierId) || suppliers[0];

    const numSubTotal = Number(subTotal) || 0;
    const numTaxRate = Number(taxRate) || 0;
    const numTdsRate = Number(tdsRate) || 0;

    const taxAmount = (numSubTotal * numTaxRate) / 100;
    const cgstAmount = taxAmount / 2;
    const sgstAmount = taxAmount / 2;
    const igstAmount = 0;

    const tdsAmount = (numSubTotal * numTdsRate) / 100;
    const grandTotal = numSubTotal + taxAmount - tdsAmount;

    addPurchaseInvoice({
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '2026-10-30',
      supplierId: supp.id,
      supplierName: supp.supplierName || (supp as any).name || 'Unknown Supplier',
      supplierGstin: supp.gstin || '',
      vendorInvoiceNumber,
      poNumber,
      grnNumber,
      jobNumber: (purchaseOrders.find((p) => p.poNumber === poNumber || p.id === poNumber) as any)?.jobId || '',
      projectId: (purchaseOrders.find((p) => p.poNumber === poNumber || p.id === poNumber) as any)?.projectId || '',
      items: [
        {
          id: 'PITEM-1',
          description: 'Special Alloy Structural Steel Beams & Plates',
          hsnSac: '7208',
          quantity: 25,
          unitPrice: 58000,
          taxRate: numTaxRate,
          taxAmount,
          totalAmount: numSubTotal + taxAmount,
        },
      ],
      subTotal: numSubTotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      taxTotal: taxAmount,
      tdsSection,
      tdsRate: numTdsRate,
      tdsAmount,
      grandTotal,
      status: 'Pending_Posting',
      paymentStatus: 'Unpaid',
      createdBy: 'Rajesh Patel',
    });

    setIsModalOpen(false);
    setSubTotal('');
  };

  const invoiceColumns: ERPColumn<PurchaseInvoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'ERP PINV NO',
      isCodeLink: true,
      onCodeClick: (inv) => toast.info(`Purchase Invoice: ${inv.invoiceNumber}\nSupplier: ${inv.supplierName}\nAmount: ₹${Number(inv.grandTotal || 0).toLocaleString('en-IN')}`),
    },
    {
      key: 'vendorInvoiceNumber',
      header: 'VENDOR BILL NO',
      cell: (inv) => (
        <span className="font-mono text-xs font-semibold text-slate-800">
          {inv.vendorInvoiceNumber || (inv as any).supplierInvoiceNumber || (inv as any).vendor_invoice_number || '-'}
        </span>
      ),
    },
    {
      key: 'supplierName',
      header: 'SUPPLIER',
      cell: (inv) => (
        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{inv.supplierName || (inv as any).supplier_name}</span>
        </div>
      ),
    },
    {
      key: 'poGrn',
      header: 'PO / GRN',
      cell: (inv) => (
        <div className="text-xs font-mono text-slate-600">
          <span>{inv.poNumber || (inv as any).po_number || '-'}</span>
          {inv.grnNumber && <span className="text-slate-400"> / {inv.grnNumber}</span>}
        </div>
      ),
    },
    {
      key: 'subTotal',
      header: 'TAXABLE SUBTOTAL',
      cell: (inv) => {
        const cgst = Number((inv as any).cgst_amount || inv.cgstAmount || 0);
        const sgst = Number((inv as any).sgst_amount || inv.sgstAmount || 0);
        const igst = Number((inv as any).igst_amount || inv.igstAmount || 0);
        const items = inv.items || [];
        const itemsTax = items.reduce((s: number, it: any) => s + Number(it.taxAmount || 0), 0);
        const taxTotal = Number(inv.taxTotal || (cgst + sgst + igst) || itemsTax || 0);
        const grandTotal = Number(inv.grandTotal ?? (inv as any).grand_total ?? 0);
        const rawSubTotal = Number(inv.subTotal ?? inv.subtotal ?? (inv as any).taxable_amount ?? inv.taxableAmount ?? 0);
        const itemsTotal = items.reduce((s: number, it: any) => s + Number(it.totalAmount || 0), 0);
        const subTotal = rawSubTotal > 0 ? rawSubTotal : (itemsTotal > 0 && taxTotal > 0 ? itemsTotal - taxTotal : (grandTotal > 0 && taxTotal > 0 ? grandTotal - taxTotal : grandTotal / 1.18));
        return (
          <span className="font-mono text-xs text-slate-700">
            ₹{Math.round(subTotal).toLocaleString('en-IN')}
          </span>
        );
      },
    },
    {
      key: 'taxTotal',
      header: 'ITC TAX',
      cell: (inv) => {
        const cgst = Number((inv as any).cgst_amount || inv.cgstAmount || 0);
        const sgst = Number((inv as any).sgst_amount || inv.sgstAmount || 0);
        const igst = Number((inv as any).igst_amount || inv.igstAmount || 0);
        const items = inv.items || [];
        const itemsTax = items.reduce((s: number, it: any) => s + Number(it.taxAmount || 0), 0);
        const taxTotal = Number(inv.taxTotal || (cgst + sgst + igst) || itemsTax || 0);
        return (
          <span className="font-mono text-xs font-semibold text-emerald-700">
            ₹{Math.round(taxTotal).toLocaleString('en-IN')}
          </span>
        );
      },
    },
    {
      key: 'tds',
      header: 'TDS (194C)',
      cell: (inv) => {
        const tds = Number(inv.tdsAmount ?? inv.tdsDeducted ?? (inv as any).tds_amount ?? 0);
        return (
          <span className="font-mono text-xs text-purple-700">
            ₹{Math.round(tds).toLocaleString('en-IN')}
          </span>
        );
      },
    },
    {
      key: 'grandTotal',
      header: 'NET PAYABLE',
      cell: (inv) => {
        const grandTotal = Number(inv.grandTotal ?? (inv as any).grand_total ?? 0);
        return (
          <span className="font-mono text-xs font-black text-slate-900">
            ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      key: 'paymentStatus',
      header: 'PAYMENT',
      cell: (inv) => {
        const grandTotal = Number(inv.grandTotal ?? (inv as any).grand_total ?? 0);
        const paid = Number(inv.paidAmount ?? (inv as any).paid_amount ?? 0);
        const due = Math.max(0, grandTotal - paid);
        const isPaid = inv.paymentStatus === 'Paid' || (due === 0 && grandTotal > 0);
        const isPartial = inv.paymentStatus === 'Partially Paid' || (paid > 0 && due > 0);

        return (
          <div className="space-y-0.5">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                isPaid
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isPartial
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {isPaid ? 'Paid' : isPartial ? 'Partially Paid' : 'Unpaid'}
            </span>
            {due > 0 && (
              <div className="text-[10px] text-slate-500 font-mono">
                Due: ₹{Math.round(due).toLocaleString('en-IN')}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'POSTING',
      cell: (inv) => {
        const isPosted = inv.status === 'Posted' || (inv.status as string)?.toLowerCase() === 'posted';
        return (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
              isPosted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {isPosted ? 'Posted' : 'Pending_Posting'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      cell: (inv) => {
        const isPosted = inv.status === 'Posted' || (inv.status as string)?.toLowerCase() === 'posted';
        const grandTotal = Number(inv.grandTotal ?? (inv as any).grand_total ?? 0);
        const paid = Number(inv.paidAmount ?? (inv as any).paid_amount ?? 0);
        const due = Math.max(0, grandTotal - paid);
        const isPaid = inv.paymentStatus === 'Paid' || (due === 0 && grandTotal > 0);

        return (
          <div className="flex items-center gap-1.5">
            {!isPosted && (
              <button
                type="button"
                onClick={() => postPurchaseInvoice(inv.id || inv.invoiceNumber || (inv as any).invoice_number)}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold rounded-lg transition shadow-xs cursor-pointer"
              >
                Post
              </button>
            )}
            {!isPaid && (
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/accounting/payments?supplierId=${encodeURIComponent(inv.supplierId || '')}&invoiceNo=${encodeURIComponent(
                      inv.invoiceNumber || inv.id || ''
                    )}&amount=${due}`
                  )
                }
                className="px-2.5 py-1 bg-[#211B17] hover:bg-black text-white text-[10px] font-bold rounded-lg transition shadow-xs cursor-pointer"
              >
                Pay Bill
              </button>
            )}
            {isPaid && (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[10px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Status Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status:</span>
          {['All', 'Pending_Posting', 'Posted'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedStatus === st
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-bold text-slate-800">{filteredInvoices.length}</span> Purchase Bills
        </div>
      </div>

      <ERPListPageLayout<PurchaseInvoice>
        breadcrumbs={['DASHBOARD', 'ACCOUNTS & FINANCE', 'PURCHASE BILLS & ITC']}
        title="Purchase Invoices & Input Tax Credit (ITC)"
        columns={invoiceColumns}
        data={filteredInvoices}
        searchPlaceholder="Search invoice no, vendor bill no, supplier..."
        addNewLabel="New Purchase Invoice"
        onAddNew={() => setIsModalOpen(true)}
        onExport={() => {
          const csv = [
            'ERP PINV No,Vendor Bill No,Supplier,PO,GRN,Net Payable,Status',
            ...filteredInvoices.map(
              inv => `"${inv.invoiceNumber}","${inv.vendorInvoiceNumber || ''}","${inv.supplierName || ''}","${inv.poNumber || ''}","${inv.grnNumber || ''}","${inv.grandTotal || 0}","${inv.status}"`
            )
          ].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `purchase_invoices_${new Date().toISOString().slice(0, 10)}.csv`;
          a.click();
        }}
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#211B17] border-b border-[#EBE3DB] pb-3">Book Purchase Invoice</h3>
            <form onSubmit={handleCreatePurchaseInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Supplier</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.supplierName} ({s.gstin})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Vendor Invoice / Bill No</label>
                  <input
                    type="text"
                    required
                    value={vendorInvoiceNumber}
                    onChange={(e) => setVendorInvoiceNumber(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">PO Number</label>
                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Taxable Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={subTotal}
                    onChange={(e) => setSubTotal(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">GST Rate (%)</label>
                  <input
                    type="number"
                    placeholder="18"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">TDS Section</label>
                  <select
                    value={tdsSection}
                    onChange={(e) => setTdsSection(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723]"
                  >
                    <option value="194C">194C - Subcontracting (2%)</option>
                    <option value="194J">194J - Professional Fee (10%)</option>
                    <option value="194Q">194Q - Purchase of Goods (0.1%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">TDS Rate (%)</label>
                  <input
                    type="number"
                    placeholder="2"
                    value={tdsRate}
                    onChange={(e) => setTdsRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#3E2723] font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-white text-[#544B45]">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-crm-brand-700 text-[#211B17] font-semibold">
                  Save Purchase Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
