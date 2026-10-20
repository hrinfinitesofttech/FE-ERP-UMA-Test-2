'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { 
  Banknote, Plus, Search, Landmark, CheckCircle2, 
  ArrowDownRight, Download, Filter, Eye, Printer, 
  FileSpreadsheet, Calendar, User, ShieldCheck, X,
  FileText, ArrowRight, AlertCircle, CreditCard, Wallet, Sparkles, Building, Trash2
} from 'lucide-react';
import { BankAccount, PurchaseInvoice } from '../../../types/accounting';
import { toast } from '../../../context/ToastContext';

function numberToIndianWords(num: number): string {
  if (!num || isNaN(num) || num <= 0) return 'Zero Rupees Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
  };

  let n = Math.floor(Math.abs(num));
  let str = '';
  
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const hundred = Math.floor(n / 100);
  const rem = n % 100;

  if (crore) str += inWords(crore) + ' Crore ';
  if (lakh) str += inWords(lakh) + ' Lakh ';
  if (thousand) str += inWords(thousand) + ' Thousand ';
  if (hundred) str += inWords(hundred) + ' Hundred ';
  if (rem) str += (str ? 'and ' : '') + inWords(rem) + ' ';

  return (str.trim() || 'Zero') + ' Rupees Only';
}

function SupplierPaymentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supplierPayments, addSupplierPayment, deleteSupplierPayment, suppliers, purchaseInvoices, bankAccounts } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [filterMode, setFilterMode] = useState('ALL');

  const activeBankAccounts: BankAccount[] = bankAccounts || [];

  // Form State
  const [supplierId, setSupplierId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentMode, setPaymentMode] = useState<any>('RTGS');
  const [bankAccountId, setBankAccountId] = useState('');
  const [amountPaid, setAmountPaid] = useState<number | string>('');
  const [referenceNo, setReferenceNo] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');

  // Handle URL query parameters when navigating from Purchase Invoice (e.g. ?supplierId=...&invoiceNo=...&amount=...)
  useEffect(() => {
    const paramSupplierId = searchParams.get('supplierId');
    const paramInvoiceNo = searchParams.get('invoiceNo');
    const paramAmount = searchParams.get('amount');

    if (paramSupplierId || paramInvoiceNo || paramAmount) {
      if (paramSupplierId) setSupplierId(paramSupplierId);
      if (paramInvoiceNo) setInvoiceNumber(paramInvoiceNo);
      if (paramAmount) setAmountPaid(Number(paramAmount) || '');
      if (activeBankAccounts.length > 0 && !bankAccountId) {
        setBankAccountId(activeBankAccounts[0].id);
      }
      setReferenceNo(`UTR-${Date.now().toString().slice(-8)}`);
      setIsModalOpen(true);
    }
  }, [searchParams, activeBankAccounts]);

  // Set defaults on modal open
  const handleOpenModal = () => {
    const defaultSupp = suppliers[0]?.id || '';
    const defaultBank = activeBankAccounts[0]?.id || '';
    setSupplierId(defaultSupp);
    setBankAccountId(defaultBank);
    setInvoiceNumber('');
    setAmountPaid('');
    setReferenceNo(`UTR-${Date.now().toString().slice(-8)}`);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setRemarks('Vendor invoice payment via bank transfer');
    setIsModalOpen(true);
  };

  // When supplier changes, auto-fill pending purchase invoices
  const pendingInvoicesForSupplier = useMemo(() => {
    if (!supplierId) return [];
    return purchaseInvoices.filter(
      (inv) =>
        (inv.supplierId === supplierId || (inv as any).supplier_id === supplierId) &&
        inv.paymentStatus !== 'Paid'
    );
  }, [supplierId, purchaseInvoices]);

  const handleSupplierChange = (newSuppId: string) => {
    setSupplierId(newSuppId);
    const pending = purchaseInvoices.filter(
      (inv) =>
        (inv.supplierId === newSuppId || (inv as any).supplier_id === newSuppId) &&
        inv.paymentStatus !== 'Paid'
    );
    if (pending.length > 0) {
      const first = pending[0];
      setInvoiceNumber(first.invoiceNumber || first.id);
      const grandTotal = Number(first.grandTotal ?? (first as any).grand_total ?? 0);
      const paid = Number(first.paidAmount ?? (first as any).paid_amount ?? 0);
      const due = Math.max(0, grandTotal - paid);
      setAmountPaid(due > 0 ? due : grandTotal);
    } else {
      setInvoiceNumber('Direct Payment');
      setAmountPaid('');
    }
  };

  const handleInvoiceChange = (newInvNo: string) => {
    setInvoiceNumber(newInvNo);
    const matched = purchaseInvoices.find(
      (inv) => inv.invoiceNumber === newInvNo || inv.id === newInvNo
    );
    if (matched) {
      const grandTotal = Number(matched.grandTotal ?? (matched as any).grand_total ?? 0);
      const paid = Number(matched.paidAmount ?? (matched as any).paid_amount ?? 0);
      const due = Math.max(0, grandTotal - paid);
      setAmountPaid(due > 0 ? due : grandTotal);
    }
  };

  const filtered = useMemo(() => {
    return supplierPayments.filter((p) => {
      const q = (searchTerm || '').trim().toLowerCase();
      const pNo = (p.paymentNumber || '').toLowerCase();
      const suppName = (p.supplierName || '').toLowerCase();
      const refNo = (p.referenceNumber || '').toLowerCase();
      const invNo = (p.purchaseInvoiceNumber || '').toLowerCase();
      const matchesSearch = !q || pNo.includes(q) || suppName.includes(q) || refNo.includes(q) || invNo.includes(q);

      const mode = (p.paymentMode || '').toUpperCase();
      const matchesMode =
        filterMode === 'ALL' ||
        (filterMode === 'RTGS' && (mode.includes('RTGS') || mode.includes('NEFT'))) ||
        (filterMode === 'CHEQUE' && mode.includes('CHEQUE')) ||
        (filterMode === 'UPI' && mode.includes('UPI')) ||
        (filterMode === 'CASH' && mode.includes('CASH'));

      return matchesSearch && matchesMode;
    });
  }, [supplierPayments, searchTerm, filterMode]);

  // Aggregate Metrics
  const totalAmountDisbursed = useMemo(() => {
    return supplierPayments.reduce((acc, p) => acc + (Number(p.amountPaid ?? p.amount ?? 0)), 0);
  }, [supplierPayments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supp = suppliers.find((s) => s.id === supplierId) || suppliers[0] || {
      id: 'SUPP-001',
      supplierName: 'General Supplier',
    };

    const bank = activeBankAccounts.find((b) => b.id === bankAccountId) || activeBankAccounts[0] || {
      id: 'BANK-01',
      bankName: 'State Bank of India',
      accountNumber: '33445566778',
    };

    const finalAmount = Number(amountPaid) || 0;
    if (finalAmount <= 0) {
      toast.warning('Please enter a valid payment amount greater than zero.');
      return;
    }

    try {
      addSupplierPayment({
        paymentDate: paymentDate || new Date().toISOString().split('T')[0],
        supplierId: supp.id,
        supplierName: supp.supplierName || (supp as any).name || 'Supplier',
        purchaseInvoiceNumber: invoiceNumber || 'Direct Payment',
        paymentMode,
        bankAccountId: bank.id,
        bankName: bank.bankName,
        amountPaid: finalAmount,
        referenceNumber: referenceNo || `UTR-${Date.now().toString().slice(-8)}`,
        status: 'Paid',
        remarks: remarks || 'Vendor bill disbursement',
        createdBy: 'Admin',
      });

      setIsModalOpen(false);
      setAmountPaid('');
      setReferenceNo('');
    } catch (err) {
      console.error('Error recording supplier payment:', err);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#211B17]">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200">
            <Banknote className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-0.5">
              ACCOUNTING &amp; FINANCE / ACCOUNTS PAYABLE
            </div>
            <h1 className="text-xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
              <span>Supplier Payment Vouchers</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-300 font-mono">
                {supplierPayments.length} Disbursed
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time AP Outflow • Direct Bank Debit • Automatic Purchase Bill &amp; Vendor Ledger Settlement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push('/accounting/purchase-invoices')}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Purchase Bills</span>
          </button>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-[#211B17] hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-rose-400" />
            <span>+ Make Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-[#EBE3DB] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Disbursed</span>
            <Wallet className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 font-mono">
            ₹{totalAmountDisbursed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400">Total vendor bill payments</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#EBE3DB] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Vouchers</span>
            <FileSpreadsheet className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-[#211B17] font-mono">
            {supplierPayments.length}
          </div>
          <div className="text-[11px] text-slate-400">Payment vouchers generated</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#EBE3DB] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Source Banks</span>
            <Landmark className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 font-mono">
            {activeBankAccounts.length}
          </div>
          <div className="text-[11px] text-slate-400">Active bank accounts connected</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#EBE3DB] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Vendors Settled</span>
            <Building className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {new Set(supplierPayments.map((p) => p.supplierId)).size}
          </div>
          <div className="text-[11px] text-slate-400">Unique suppliers paid</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#EBE3DB] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search payment no, supplier, UTR, bill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {['ALL', 'RTGS', 'CHEQUE', 'UPI', 'CASH'].map((m) => (
            <button
              key={m}
              onClick={() => setFilterMode(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                filterMode === m
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m === 'ALL' ? 'All Modes' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Vouchers Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-black text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="py-3 px-4">PAYMENT NO</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">SUPPLIER</th>
                <th className="py-3 px-4">PURCHASE BILL</th>
                <th className="py-3 px-4">MODE &amp; BANK</th>
                <th className="py-3 px-4">UTR / REF NO</th>
                <th className="py-3 px-4 text-right">AMOUNT PAID</th>
                <th className="py-3 px-4 text-center">STATUS</th>
                <th className="py-3 px-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-sans">
                    <Banknote className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-sm">No payment vouchers found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click '+ Make Payment' to record your first supplier payment.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const payDate = p.paymentDate || p.date || '-';
                  const bank = p.bankName || p.bankCashAccountName || 'HDFC Bank';
                  const amt = Number(p.amountPaid ?? p.amount ?? 0);

                  return (
                    <tr key={p.id} className="hover:bg-amber-50/20 transition group">
                      <td className="py-3 px-4 font-bold text-rose-700 flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5 text-rose-500" />
                        <span>{p.paymentNumber}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-sans">{payDate}</td>
                      <td className="py-3 px-4 font-sans font-bold text-slate-900">
                        {p.supplierName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold">
                          {p.purchaseInvoiceNumber || 'Direct Payment'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-700">
                        <span className="font-semibold">{p.paymentMode}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">({bank})</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">{p.referenceNumber || 'N/A'}</td>
                      <td className="py-3 px-4 text-right font-black text-rose-700 text-sm">
                        ₹{amt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Paid</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedPayment(p)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="View / Print Payment Voucher"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              toast.confirm({
                                title: 'Delete Payment Voucher',
                                message: `Are you sure you want to delete payment ${p.paymentNumber}? This will reverse the purchase bill payment and refund ₹${Number(p.amountPaid || p.amount || 0).toLocaleString('en-IN')} back to the bank.`,
                                confirmText: 'Yes, Delete',
                                cancelText: 'Cancel',
                                variant: 'danger',
                                onConfirm: () => {
                                  deleteSupplierPayment?.(p.id);
                                  toast.success(`Payment voucher ${p.paymentNumber} deleted.`);
                                },
                              });
                            }}
                            className="p-1 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg transition cursor-pointer"
                            title="Delete Payment Voucher"
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

        {/* Table Footer */}
        <div className="p-3 bg-slate-50 border-t border-[#EBE3DB] text-xs text-slate-500 flex items-center justify-between">
          <span>Showing <strong>{filtered.length}</strong> of <strong>{supplierPayments.length}</strong> payment vouchers</span>
          <span className="font-mono text-[11px]">Auto-reconciled with Vendor Ledgers</span>
        </div>
      </div>

      {/* MAKE PAYMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-[#211B17] text-white p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold">Record Supplier Payment Voucher</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Supplier / Vendor <span className="text-rose-500">*</span>
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-rose-500"
                  required
                >
                  <option value="" disabled>-- Select Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.supplierName || s.name || (s as any).companyName || 'Supplier'} ({s.vendorCode || s.supplierCode || s.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Linked Purchase Bill / Invoice Ref
                </label>
                <select
                  value={invoiceNumber}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Direct Payment">Direct Payment (Advance / Non-Bill)</option>
                  {pendingInvoicesForSupplier.map((inv) => {
                    const grandTotal = Number(inv.grandTotal ?? (inv as any).grand_total ?? 0);
                    const paid = Number(inv.paidAmount ?? (inv as any).paid_amount ?? 0);
                    const due = Math.max(0, grandTotal - paid);
                    return (
                      <option key={inv.id} value={inv.invoiceNumber || inv.id}>
                        {inv.invoiceNumber || inv.id} — Due: ₹{due.toLocaleString('en-IN')} (Total: ₹{grandTotal.toLocaleString('en-IN')})
                      </option>
                    );
                  })}
                </select>
                {pendingInvoicesForSupplier.length > 0 && (
                  <p className="text-[10px] text-amber-700 mt-1">
                    * Found {pendingInvoicesForSupplier.length} pending bill(s) for this supplier.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="RTGS">RTGS / NEFT</option>
                    <option value="Cheque">Bank Cheque</option>
                    <option value="UPI">UPI / Net Banking</option>
                    <option value="Cash">Cash Voucher</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Source Bank / Cash A/c</label>
                  <select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-rose-500"
                  >
                    {activeBankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} (Bal: ₹{Number(b.currentBalance || 0).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Amount Paid (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="0.00"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-rose-500 text-sm"
                  />
                  {Number(amountPaid) > 0 && (
                    <span className="text-[10px] text-slate-500 block mt-0.5 italic">
                      {numberToIndianWords(Number(amountPaid))}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  UTR / Cheque / Bank Reference No <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR-9988776655"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono uppercase focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Remarks / Note</label>
                <input
                  type="text"
                  placeholder="Optional notes for vendor ledger"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs active:scale-95 transition"
                >
                  Disburse Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / PRINT PAYMENT VOUCHER MODAL */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white border-2 border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden p-6 space-y-5">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-slate-800 text-sm">Official Bank Payment Voucher</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Voucher Content */}
            <div className="border border-slate-300 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between border-b pb-3 border-slate-200">
                <div>
                  <h2 className="text-base font-black tracking-wider text-slate-900 uppercase">
                    UMA TECHNO FAB PRIVATE LIMITED
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    Plot No. 42, GIDC Industrial Estate, Odhav, Ahmedabad, Gujarat - 382415
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    GSTIN: 24AAACU1234F1Z9 • PAN: AAACU1234F
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black uppercase text-rose-700 font-mono tracking-wider bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                    PAYMENT VOUCHER
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-900 mt-1">
                    {selectedPayment.paymentNumber}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    DATE: {selectedPayment.paymentDate || selectedPayment.date}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">PAID TO (SUPPLIER):</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedPayment.supplierName}</div>
                  <div className="text-slate-500 text-[11px]">Vendor Code: {selectedPayment.supplierId}</div>
                  <div className="text-slate-500 text-[11px]">Purchase Bill: {selectedPayment.purchaseInvoiceNumber || 'Advance'}</div>
                </div>

                <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">BANK / PAYMENT DETAILS:</span>
                  <div className="font-bold text-slate-900">{selectedPayment.paymentMode}</div>
                  <div className="text-slate-600 text-[11px]">Disbursed From: {selectedPayment.bankName || 'Main Bank Account'}</div>
                  <div className="font-mono text-slate-700 text-[11px]">UTR / Ref: {selectedPayment.referenceNumber}</div>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-800">AMOUNT PAID:</span>
                  <div className="text-2xl font-black text-rose-900 font-mono">
                    ₹{Number(selectedPayment.amountPaid ?? selectedPayment.amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-rose-800 font-serif italic mt-0.5">
                    {numberToIndianWords(Number(selectedPayment.amountPaid ?? selectedPayment.amount ?? 0))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>STATUS: PAID</span>
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-3 gap-4 text-center text-[10px] font-bold text-slate-500">
                <div className="border-t border-slate-300 pt-2">
                  PREPARED BY
                </div>
                <div className="border-t border-slate-300 pt-2">
                  CHECKED BY (ACCOUNTANT)
                </div>
                <div className="border-t border-slate-300 pt-2">
                  AUTHORIZED SIGNATORY
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SupplierPaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 text-xs">
          Loading Supplier Payments...
        </div>
      }
    >
      <SupplierPaymentsContent />
    </Suspense>
  );
}
