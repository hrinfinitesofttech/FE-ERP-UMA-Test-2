'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { 
  Coins, Plus, Search, Landmark, CheckCircle2, 
  ArrowUpRight, Download, Filter, Eye, Printer, 
  FileSpreadsheet, Calendar, User, ShieldCheck, X,
  FileText, ArrowRight, AlertCircle, CreditCard, Wallet, Sparkles, Trash2, Zap
} from 'lucide-react';
import { BankAccount, SalesInvoice } from '../../../types/accounting';
import { toast } from '../../../context/ToastContext';
import { printContent } from '@/lib/printUtils';

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

function CustomerReceiptsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customerReceipts, addCustomerReceipt, deleteCustomerReceipt, customers, salesInvoices, bankAccounts } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [filterMode, setFilterMode] = useState('ALL');

  const activeBankAccounts: BankAccount[] = bankAccounts || [];

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentMode, setPaymentMode] = useState<any>('NEFT');
  const [bankAccountId, setBankAccountId] = useState('');
  const [amountPaid, setAmountPaid] = useState<number | string>('');
  const [referenceNo, setReferenceNo] = useState('');
  const [receiptDate, setReceiptDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Handle URL query parameters when navigating from Sales Invoice (e.g. ?customerId=...&invoiceId=...)
  useEffect(() => {
    const paramCustomerId = searchParams.get('customerId');
    const paramInvoiceId = searchParams.get('invoiceId');

    if (paramCustomerId || paramInvoiceId) {
      if (paramCustomerId) setCustomerId(paramCustomerId);
      if (paramInvoiceId) setInvoiceNumber(paramInvoiceId);
      if (activeBankAccounts.length > 0) setBankAccountId(activeBankAccounts[0].id);

      // Auto-fill amount from invoice if available
      if (paramInvoiceId) {
        const targetInv = salesInvoices.find(
          (inv) => inv.invoiceNumber === paramInvoiceId || inv.id === paramInvoiceId || (inv as any).invoice_number === paramInvoiceId
        );
        if (targetInv) {
          const grandTotal = Number(targetInv.grandTotal ?? (targetInv as any).grand_total ?? 0);
          const paid = Number(targetInv.paidAmount ?? (targetInv as any).paid_amount ?? 0);
          const due = Math.max(0, grandTotal - paid);
          setAmountPaid(due > 0 ? due : grandTotal);
          setNotes(`Payment against Tax Invoice ${targetInv.invoiceNumber}`);
        }
      }

      setReferenceNo(`UTR-${Date.now().toString().slice(-6)}`);
      setReceiptDate(new Date().toISOString().split('T')[0]);
      setIsModalOpen(true);
    }
  }, [searchParams, salesInvoices, activeBankAccounts]);

  // Invoices filtered by selected Customer
  const customerInvoices = useMemo(() => {
    if (!customerId) return [];
    return salesInvoices.filter((inv) => {
      if (inv.customerId && inv.customerId === customerId) return true;
      const cust = customers.find((c) => c.id === customerId);
      if (cust && inv.customerName && cust.companyName && inv.customerName.toLowerCase() === cust.companyName.toLowerCase()) {
        return true;
      }
      return false;
    });
  }, [customerId, salesInvoices, customers]);

  // Selected Invoice Object & calculations
  const selectedInvoice = useMemo(() => {
    if (!invoiceNumber || invoiceNumber === 'DIRECT_ADVANCE' || invoiceNumber === 'Direct Advance Payment') {
      return null;
    }
    return salesInvoices.find(
      (inv) => inv.invoiceNumber === invoiceNumber || inv.id === invoiceNumber || (inv as any).invoice_number === invoiceNumber
    ) || null;
  }, [invoiceNumber, salesInvoices]);

  const invoiceStats = useMemo(() => {
    if (!selectedInvoice) return null;
    const grandTotal = Number(selectedInvoice.grandTotal ?? (selectedInvoice as any).grand_total ?? 0);
    const paidAmount = Number(selectedInvoice.paidAmount ?? (selectedInvoice as any).paid_amount ?? 0);
    const outstandingDue = Math.max(0, grandTotal - paidAmount);
    return { grandTotal, paidAmount, outstandingDue };
  }, [selectedInvoice]);

  // When customer changes in modal, auto-select first invoice or direct advance
  const handleCustomerChange = (newCustId: string) => {
    setCustomerId(newCustId);
    const filteredInvs = salesInvoices.filter((inv) => {
      if (inv.customerId && inv.customerId === newCustId) return true;
      const cust = customers.find((c) => c.id === newCustId);
      return !!(cust && inv.customerName && cust.companyName && inv.customerName.toLowerCase() === cust.companyName.toLowerCase());
    });

    if (filteredInvs.length > 0) {
      const firstInv = filteredInvs[0];
      setInvoiceNumber(firstInv.invoiceNumber || firstInv.id);
      const grandTotal = Number(firstInv.grandTotal ?? (firstInv as any).grand_total ?? 0);
      const paid = Number(firstInv.paidAmount ?? (firstInv as any).paid_amount ?? 0);
      const due = Math.max(0, grandTotal - paid);
      setAmountPaid(due > 0 ? due : grandTotal);
      setNotes(`Payment against Tax Invoice ${firstInv.invoiceNumber}`);
    } else {
      setInvoiceNumber('DIRECT_ADVANCE');
      setAmountPaid('');
      setNotes('Direct Advance Payment (On Account)');
    }
  };

  // When invoice selection changes
  const handleInvoiceChange = (invNo: string) => {
    setInvoiceNumber(invNo);
    if (!invNo || invNo === 'DIRECT_ADVANCE') {
      setNotes('Direct Advance / On Account Payment');
      return;
    }
    const inv = salesInvoices.find((i) => i.invoiceNumber === invNo || i.id === invNo || (i as any).invoice_number === invNo);
    if (inv) {
      const grandTotal = Number(inv.grandTotal ?? (inv as any).grand_total ?? 0);
      const paid = Number(inv.paidAmount ?? (inv as any).paid_amount ?? 0);
      const due = Math.max(0, grandTotal - paid);
      setAmountPaid(due > 0 ? due : grandTotal);
      setNotes(`Payment against Tax Invoice ${inv.invoiceNumber}`);
    }
  };

  // Quick 1-click button to settle entire pending balance
  const handleFillFullDue = () => {
    if (invoiceStats) {
      setAmountPaid(invoiceStats.outstandingDue);
    }
  };

  // Open modal manually
  const handleOpenNewModal = () => {
    const defaultCustId = customers[0]?.id || '';
    setCustomerId(defaultCustId);
    handleCustomerChange(defaultCustId);
    if (activeBankAccounts.length > 0) setBankAccountId(activeBankAccounts[0].id);
    setReferenceNo(`UTR-${Date.now().toString().slice(-6)}`);
    setReceiptDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  // Quick KPIs
  const totalReceived = customerReceipts.reduce((sum, r) => sum + (Number(r.amountPaid || r.amount) || 0), 0);
  const paidInvoicesCount = salesInvoices.filter((inv) => inv.paymentStatus === 'Paid').length;
  const unpaidInvoicesCount = salesInvoices.filter((inv) => !inv.paymentStatus || inv.paymentStatus === 'Unpaid' || inv.paymentStatus === 'Partially Paid').length;

  const filtered = customerReceipts.filter((r) => {
    const q = (searchTerm || '').trim().toLowerCase();
    const matchesSearch = !q || 
      (r.receiptNumber || '').toLowerCase().includes(q) ||
      (r.customerName || '').toLowerCase().includes(q) ||
      (r.referenceNumber || '').toLowerCase().includes(q) ||
      (r.salesInvoiceNumber || '').toLowerCase().includes(q);

    const matchesMode = filterMode === 'ALL' || r.paymentMode === filterMode;
    return matchesSearch && matchesMode;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId) || customers[0];
    if (!cust) {
      toast.warning('Please select a valid customer.');
      return;
    }

    const bank = activeBankAccounts.find((b) => b.id === bankAccountId) || activeBankAccounts[0];
    if (!bank) {
      toast.warning('Please select a valid bank account.');
      return;
    }

    const numAmount = Number(amountPaid);
    if (!numAmount || numAmount <= 0) {
      toast.warning('Please enter a valid received amount greater than 0.');
      return;
    }

    const finalInvoiceNumber = (!invoiceNumber || invoiceNumber === 'DIRECT_ADVANCE') ? 'Direct Advance Payment' : invoiceNumber;

    try {
      addCustomerReceipt({
        receiptDate: receiptDate || new Date().toISOString().split('T')[0],
        customerId: cust.id,
        customerName: cust.companyName || (cust as any).customerName || (cust as any).name || 'Customer',
        salesInvoiceNumber: finalInvoiceNumber,
        paymentMode,
        bankAccountId: bank.id,
        bankName: bank.bankName,
        amountPaid: numAmount,
        referenceNumber: referenceNo || `UTR-${Date.now().toString().slice(-8)}`,
        status: 'Received',
        remarks: notes || `Payment received & reconciled against ${finalInvoiceNumber}`,
        createdBy: 'Accounts Team',
      });

      setIsModalOpen(false);
      setAmountPaid('');
      setReferenceNo('');
      setNotes('');
      toast.success(`Customer receipt recorded successfully!`);
    } catch (err) {
      console.error('Error recording customer receipt:', err);
      toast.error('Failed to record receipt. Please check details.');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[color:var(--crm-bg-app)] min-h-screen text-[color:var(--crm-text-primary)]">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-800">
            <Coins className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[color:var(--crm-text-primary)] tracking-tight">Customer Payment Receipts</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                Live AR Inward Portal
              </span>
            </div>
            <p className="text-xs text-[color:var(--crm-text-secondary)] mt-1">
              Automated Sales Tax Invoice Reconciliation • Real-time Customer Ledger Updates • Instant Payment Vouchers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push('/accounting/sales-invoices')}
            className="flex items-center gap-1.5 bg-[color:var(--crm-bg-app)] hover:bg-[color:var(--crm-surface-subtle)] text-[color:var(--crm-text-secondary)] text-xs font-bold px-3.5 py-2.5 rounded-xl border border-[color:var(--crm-border-default)] transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[color:var(--crm-brand-700)]" />
            <span>View Sales Invoices</span>
          </button>
          <button
            onClick={handleOpenNewModal}
            className="flex items-center gap-2 bg-[color:var(--crm-brand-700)] hover:bg-[#1B3489] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Customer Receipt</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[color:var(--crm-text-secondary)] uppercase">Total Inward Collected</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2 font-mono">
            ₹{totalReceived.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-[#68789E] mt-1 font-medium">Reconciled to company bank accounts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[color:var(--crm-text-secondary)] uppercase">Receipts Issued</span>
            <div className="p-2 bg-[color:var(--crm-bg-app)] rounded-lg text-[color:var(--crm-brand-700)]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[color:var(--crm-text-primary)] mt-2 font-mono">
            {customerReceipts.length}
          </div>
          <p className="text-[11px] text-[#68789E] mt-1 font-medium">Official payment vouchers created</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[color:var(--crm-text-secondary)] uppercase">Invoices Paid</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2 font-mono">
            {paidInvoicesCount}
          </div>
          <p className="text-[11px] text-[#68789E] mt-1 font-medium">Fully settled sales tax invoices</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[color:var(--crm-text-secondary)] uppercase">Invoices Pending Due</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2 font-mono">
            {unpaidInvoicesCount}
          </div>
          <p className="text-[11px] text-[#68789E] mt-1 font-medium">Awaiting customer collection</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#68789E]" />
          <input
            type="text"
            placeholder="Search receipt no, customer name, invoice number, or UTR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl pl-9 pr-4 py-2 text-xs text-[color:var(--crm-text-primary)] focus:outline-hidden focus:border-[color:var(--crm-brand-700)]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'NEFT', 'RTGS', 'UPI', 'Cheque', 'Cash'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterMode === mode
                  ? 'bg-[color:var(--crm-brand-700)] text-white shadow-xs'
                  : 'bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-secondary)] hover:bg-[color:var(--crm-surface-subtle)]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl border border-[color:var(--crm-border-default)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[color:var(--crm-text-secondary)]">
            <thead className="bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-secondary)] uppercase font-bold text-[10px] tracking-wider border-b border-[color:var(--crm-border-default)]">
              <tr>
                <th className="py-3.5 px-4">Receipt No</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Reconciled Invoice</th>
                <th className="py-3.5 px-4">Mode & Bank</th>
                <th className="py-3.5 px-4">UTR / Trans Ref</th>
                <th className="py-3.5 px-4 text-right">Amount Received</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--crm-border-default)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#68789E]">
                    <Coins className="w-8 h-8 mx-auto mb-2 text-[#A7B1C7] opacity-50" />
                    <p className="font-semibold text-sm">No Customer Receipts found</p>
                    <p className="text-xs text-[#68789E] mt-1">Click &quot;Record Customer Receipt&quot; to log an inward payment against an invoice.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const recDate = r.receiptDate || r.date || '-';
                  const bank = r.bankName || r.bankCashAccountName || 'Current Bank Account';
                  const amt = Number(r.amountPaid ?? r.amount ?? 0);

                  return (
                    <tr key={r.id} className="hover:bg-[#F4F6FA]/60 transition">
                      <td className="py-3.5 px-4 font-bold text-[color:var(--crm-brand-700)] font-mono">
                        {r.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4 text-[color:var(--crm-text-secondary)] font-mono">
                        {recDate}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[color:var(--crm-text-primary)]">
                        {r.customerName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[color:var(--crm-text-secondary)]">
                        <span className="px-2 py-0.5 rounded bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] text-[11px] font-bold text-[color:var(--crm-brand-700)]">
                          {r.salesInvoiceNumber || 'Direct Payment'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[color:var(--crm-text-primary)] flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-[#68789E]" />
                          {r.paymentMode}
                        </div>
                        <div className="text-[11px] text-[color:var(--crm-text-secondary)]">{bank}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[color:var(--crm-text-secondary)]">
                        {r.referenceNumber || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-800 font-mono text-sm">
                        ₹{amt.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {r.status || 'Received'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedReceipt(r)}
                            className="p-1.5 hover:bg-[color:var(--crm-bg-app)] rounded-lg text-[color:var(--crm-brand-700)] hover:text-[#1B3489] transition cursor-pointer"
                            title="View Official Receipt Voucher"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              toast.confirm({
                                title: 'Delete Receipt Voucher',
                                message: `Are you sure you want to delete receipt ${r.receiptNumber}? This will reverse the customer invoice payment and deduct ₹${Number(r.amountPaid || r.amount || 0).toLocaleString('en-IN')} from the bank account.`,
                                confirmText: 'Yes, Delete',
                                cancelText: 'Cancel',
                                variant: 'danger',
                                onConfirm: () => {
                                  deleteCustomerReceipt?.(r.id);
                                  toast.success(`Receipt voucher ${r.receiptNumber} deleted.`);
                                },
                              });
                            }}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Delete Receipt"
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

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[color:var(--crm-border-default)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-800">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[color:var(--crm-text-primary)]">Record Customer Inward Payment</h3>
                  <p className="text-[11px] text-[color:var(--crm-text-secondary)]">Settle Sales Tax Invoices & update customer balance</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#68789E] hover:bg-[color:var(--crm-bg-app)] hover:text-[color:var(--crm-text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Date & Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[color:var(--crm-text-secondary)] font-bold mb-1">Receipt Date *</label>
                  <input
                    type="date"
                    required
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                    className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)] font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[color:var(--crm-text-secondary)] font-bold mb-1">Payment Mode *</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)] font-bold"
                  >
                    <option value="NEFT">NEFT (Electronic Transfer)</option>
                    <option value="RTGS">RTGS (High Value Transfer)</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Cheque">Bank Cheque / Draft</option>
                    <option value="Cash">Cash Deposit</option>
                  </select>
                </div>
              </div>

              {/* Customer Selection */}
              <div>
                <label className="block text-[color:var(--crm-text-secondary)] font-bold mb-1">Customer / Client *</label>
                <select
                  value={customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)] font-bold text-sm"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName || (c as any).name} • GST: {c.gstin || 'Unregistered'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sales Invoice Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[color:var(--crm-text-secondary)] font-bold">
                    Select Sales Tax Invoice to Settle *
                  </label>
                  <span className="text-[11px] text-[color:var(--crm-brand-700)] font-semibold">
                    {customerInvoices.length} Invoices Found for this Customer
                  </span>
                </div>
                <select
                  value={invoiceNumber}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2.5 text-[color:var(--crm-text-primary)] font-mono font-bold"
                >
                  <option value="DIRECT_ADVANCE">-- Direct Advance Payment / On Account (No Invoice) --</option>
                  {customerInvoices.map((inv) => {
                    const total = Number(inv.grandTotal ?? (inv as any).grand_total ?? 0);
                    const paid = Number(inv.paidAmount ?? (inv as any).paid_amount ?? 0);
                    const due = Math.max(0, total - paid);
                    const statusText = due === 0 ? 'Fully Paid' : paid > 0 ? `Partially Paid (Due: ₹${due.toLocaleString('en-IN')})` : `Unpaid (Due: ₹${due.toLocaleString('en-IN')})`;
                    return (
                      <option key={inv.id || inv.invoiceNumber} value={inv.invoiceNumber || inv.id}>
                        {inv.invoiceNumber} | Total: ₹{total.toLocaleString('en-IN')} | {statusText}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Invoice Breakdown Card (When an Invoice is selected) */}
              {selectedInvoice && invoiceStats && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50/60 p-3.5 rounded-xl border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                      Invoice Details: <span className="font-mono">{selectedInvoice.invoiceNumber}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      invoiceStats.outstandingDue === 0 ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {invoiceStats.outstandingDue === 0 ? 'Fully Settled' : `Pending Due: ₹${invoiceStats.outstandingDue.toLocaleString('en-IN')}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                      <div className="text-[10px] text-[color:var(--crm-text-secondary)] font-medium">Grand Total</div>
                      <div className="font-mono font-bold text-[color:var(--crm-text-primary)] text-xs">
                        ₹{invoiceStats.grandTotal.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                      <div className="text-[10px] text-[color:var(--crm-text-secondary)] font-medium">Already Paid</div>
                      <div className="font-mono font-bold text-emerald-700 text-xs">
                        ₹{invoiceStats.paidAmount.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                      <div className="text-[10px] text-[color:var(--crm-text-secondary)] font-medium">Balance Due</div>
                      <div className="font-mono font-black text-[color:var(--crm-brand-700)] text-xs">
                        ₹{invoiceStats.outstandingDue.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {invoiceStats.outstandingDue > 0 && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleFillFullDue}
                        className="text-[11px] font-bold text-[color:var(--crm-brand-700)] hover:text-[#1B3489] bg-white px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs hover:bg-amber-50 cursor-pointer flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-crm-brand-600" />
                        <span>Settle Full Balance (₹{invoiceStats.outstandingDue.toLocaleString('en-IN')})</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Bank Account & Transaction Reference */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[color:var(--crm-text-secondary)] font-bold mb-1">Receiving Bank Account *</label>
                  <select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)] font-semibold"
                  >
                    {activeBankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} - A/C {b.accountNumber ? b.accountNumber.slice(-4) : 'Current'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[color:var(--crm-text-secondary)] font-bold mb-1">UTR / Bank Transaction Ref *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UTR-98765432"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)] font-mono font-bold"
                  />
                </div>
              </div>

              {/* Amount Paid */}
              <div>
                <label className="block text-[color:var(--crm-text-secondary)] font-bold mb-1">Amount Received (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-[color:var(--crm-text-secondary)]">₹</span>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500000"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl pl-8 pr-4 py-2.5 text-[color:var(--crm-text-primary)] font-mono font-black text-base"
                  />
                </div>
                {amountPaid !== '' && Number(amountPaid) > 0 && (
                  <p className="text-[11px] text-[color:var(--crm-text-secondary)] mt-1 italic font-serif">
                    {numberToIndianWords(Number(amountPaid))}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[color:var(--crm-text-secondary)] font-bold mb-1">Narration / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Cleared payment via NEFT against Tax Invoice..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)]"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-[color:var(--crm-border-default)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[color:var(--crm-bg-app)] hover:bg-[color:var(--crm-surface-subtle)] text-[color:var(--crm-text-secondary)] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[color:var(--crm-brand-700)] hover:bg-[#1B3489] text-white font-bold shadow-xs active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Reconcile Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Voucher Preview & Print Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div id="printable-receipt-voucher" className="bg-white border border-[color:var(--crm-border-default)] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[color:var(--crm-border-default)] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#68789E] tracking-wider">Official Bank Inward Voucher</span>
                <h3 className="text-xl font-black text-[color:var(--crm-brand-700)] font-mono">{selectedReceipt.receiptNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 rounded-lg text-[#68789E] hover:bg-[color:var(--crm-bg-app)] hover:text-[color:var(--crm-text-primary)] cursor-pointer print:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Voucher Sheet */}
            <div className="bg-[color:var(--crm-bg-app)] p-5 rounded-xl space-y-3.5 text-xs border border-[color:var(--crm-border-default)]">
              <div className="flex items-center justify-between border-b border-[color:var(--crm-border-default)] pb-2">
                <div>
                  <div className="font-black text-sm text-[color:var(--crm-text-primary)]">UMA ENGINEERING WORKS</div>
                  <div className="text-[10px] text-[color:var(--crm-text-secondary)]">GSTIN: 24AAAFU1234F1Z5 • Ahmedabad, Gujarat</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[color:var(--crm-text-secondary)]">Voucher Date</div>
                  <div className="font-mono font-bold text-[color:var(--crm-text-primary)]">{selectedReceipt.receiptDate || selectedReceipt.date}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[color:var(--crm-text-secondary)]">Customer Name:</span>
                  <span className="font-bold text-[color:var(--crm-text-primary)]">{selectedReceipt.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--crm-text-secondary)]">Reconciled Sales Invoice:</span>
                  <span className="font-mono font-bold text-[color:var(--crm-brand-700)] bg-white px-2 py-0.5 rounded border border-[color:var(--crm-border-default)]">
                    {selectedReceipt.salesInvoiceNumber || 'Direct Payment'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--crm-text-secondary)]">Payment Mode:</span>
                  <span className="font-bold text-[color:var(--crm-text-primary)]">{selectedReceipt.paymentMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--crm-text-secondary)]">Credited To Bank:</span>
                  <span className="font-bold text-[color:var(--crm-text-primary)]">{selectedReceipt.bankName || 'HDFC Bank - Current'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--crm-text-secondary)]">Bank UTR / Ref No:</span>
                  <span className="font-mono font-bold text-[color:var(--crm-text-primary)]">{selectedReceipt.referenceNumber}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[color:var(--crm-border-default)]">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-[color:var(--crm-text-primary)]">Amount Received:</span>
                  <span className="font-mono font-black text-emerald-800 text-lg">
                    ₹{Number(selectedReceipt.amountPaid || selectedReceipt.amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-[11px] text-[color:var(--crm-text-secondary)] italic mt-1 font-serif">
                  {numberToIndianWords(Number(selectedReceipt.amountPaid || selectedReceipt.amount || 0))}
                </div>
              </div>

              <div className="pt-3 border-t border-[color:var(--crm-border-default)] flex justify-between items-center text-[10px] text-[#68789E]">
                <span>Status: <strong className="text-emerald-700">Reconciled in AR Ledger</strong></span>
                <span>Authorized Signatory</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 print:hidden">
              <button
                onClick={() => printContent('printable-receipt-voucher', { title: `Receipt_${selectedReceipt.receiptNumber}` })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[color:var(--crm-bg-app)] hover:bg-[color:var(--crm-surface-subtle)] text-[color:var(--crm-text-primary)] font-semibold text-xs border border-[color:var(--crm-border-default)] cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[color:var(--crm-brand-700)]" />
                <span>Print Voucher</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl bg-[color:var(--crm-brand-700)] hover:bg-[#1B3489] text-white font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerReceiptsPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-stone-500 font-semibold bg-[color:var(--crm-bg-app)] min-h-screen flex items-center justify-center">
        Loading Customer Receipts...
      </div>
    }>
      <CustomerReceiptsContent />
    </Suspense>
  );
}
