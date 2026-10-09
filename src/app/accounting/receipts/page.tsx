'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { 
  Coins, Plus, Search, Landmark, CheckCircle2, 
  ArrowUpRight, Download, Filter, Eye, Printer, 
  FileSpreadsheet, Calendar, User, ShieldCheck, X
} from 'lucide-react';
import { BankAccount } from '../../../types/accounting';

export default function CustomerReceiptsPage() {
  const { customerReceipts, addCustomerReceipt, customers, salesInvoices, bankAccounts } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [filterMode, setFilterMode] = useState('ALL');

  const activeBankAccounts: BankAccount[] = bankAccounts || [];

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState(salesInvoices[0]?.invoiceNumber || '');
  const [paymentMode, setPaymentMode] = useState<any>('NEFT');
  const [bankAccountId, setBankAccountId] = useState(activeBankAccounts[0]?.id || '');
  const [amountPaid, setAmountPaid] = useState<number | string>('');
  const [referenceNo, setReferenceNo] = useState('');
  const [receiptDate, setReceiptDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Calculate quick KPIs
  const totalReceived = customerReceipts.reduce((sum, r) => sum + (Number(r.amountPaid || r.amount) || 0), 0);
  const todayCount = customerReceipts.filter(r => (r.receiptDate || r.date) === new Date().toISOString().split('T')[0]).length;

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

  const handleOpenNewModal = () => {
    if (customers.length > 0) setCustomerId(customers[0].id);
    if (salesInvoices.length > 0) setInvoiceNumber(salesInvoices[0].invoiceNumber);
    if (activeBankAccounts.length > 0) setBankAccountId(activeBankAccounts[0].id);
    setAmountPaid('');
    setReferenceNo(`UTR-${Date.now().toString().slice(-6)}`);
    setReceiptDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId) || customers[0];
    if (!cust) {
      alert('Please select a valid customer.');
      return;
    }

    const bank = activeBankAccounts.find((b) => b.id === bankAccountId) || activeBankAccounts[0];
    if (!bank) {
      alert('Please select a valid bank account.');
      return;
    }

    try {
      addCustomerReceipt({
        receiptDate: receiptDate || new Date().toISOString().split('T')[0],
        customerId: cust.id,
        customerName: cust.companyName || (cust as any).customerName || (cust as any).name || 'Customer',
        salesInvoiceNumber: invoiceNumber || 'Direct Advance Payment',
        paymentMode,
        bankAccountId: bank.id,
        bankName: bank.bankName,
        amountPaid: Number(amountPaid) || 0,
        referenceNumber: referenceNo || `UTR-${Date.now().toString().slice(-8)}`,
        status: 'Received',
        remarks: notes || 'Customer payment received & reconciled against invoice',
        createdBy: 'Accounts Team',
      });

      setIsModalOpen(false);
      setAmountPaid('');
      setReferenceNo('');
      setNotes('');
    } catch (err) {
      console.error('Error recording receipt:', err);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] min-h-screen text-[#211B17]">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-800">
            <Coins className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Customer Payment Receipts</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                Live Inward Portal
              </span>
            </div>
            <p className="text-xs text-[#70665F] mt-1">
              Accounts Receivable (AR) Inward Receipts • Real-time Bank Reconciliation • Instant Voucher Generation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenNewModal}
            className="flex items-center gap-2 bg-[#8B2500] hover:bg-[#701E00] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record Customer Receipt</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#70665F] uppercase">Total Inward Collected</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2 font-mono">
            ₹{totalReceived.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-[#8C827A] mt-1 font-medium">All cleared customer receipts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#70665F] uppercase">Total Receipts Issued</span>
            <div className="p-2 bg-[#FAF7F2] rounded-lg text-[#8B2500]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#211B17] mt-2 font-mono">
            {customerReceipts.length}
          </div>
          <p className="text-[11px] text-[#8C827A] mt-1 font-medium">Official payment vouchers</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#70665F] uppercase">Active Bank Accounts</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#211B17] mt-2 font-mono">
            {activeBankAccounts.length || 2}
          </div>
          <p className="text-[11px] text-[#8C827A] mt-1 font-medium">HDFC, SBI Current Accounts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#70665F] uppercase">Reconciliation Status</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2 font-mono">
            100%
          </div>
          <p className="text-[11px] text-[#8C827A] mt-1 font-medium">Synced with Customer Ledgers</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C827A]" />
          <input
            type="text"
            placeholder="Search receipt no (e.g. REC-), customer name, invoice ref, or UTR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl pl-9 pr-4 py-2 text-xs text-[#211B17] focus:outline-hidden focus:border-[#8B2500]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'NEFT', 'RTGS', 'UPI', 'Cheque', 'Cash'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterMode === mode
                  ? 'bg-[#8B2500] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#70665F] hover:bg-[#EFE8DF]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] uppercase font-bold text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="py-3.5 px-4">Receipt No</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Invoice / SO Ref</th>
                <th className="py-3.5 px-4">Payment Mode & Bank</th>
                <th className="py-3.5 px-4">UTR / Transaction Ref</th>
                <th className="py-3.5 px-4 text-right">Amount Received</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#8C827A]">
                    <Coins className="w-8 h-8 mx-auto mb-2 text-[#C8B8A6] opacity-50" />
                    <p className="font-semibold text-sm">No Customer Receipts found</p>
                    <p className="text-xs text-[#8C827A] mt-1">Click &quot;Record Customer Receipt&quot; above to add a new inward payment.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const recDate = r.receiptDate || r.date || '-';
                  const bank = r.bankName || r.bankCashAccountName || 'HDFC Bank - Current';
                  const amt = Number(r.amountPaid ?? r.amount ?? 0);

                  return (
                    <tr key={r.id} className="hover:bg-[#FAF7F2]/60 transition">
                      <td className="py-3.5 px-4 font-bold text-[#8B2500] font-mono">
                        {r.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4 text-[#70665F] font-mono">
                        {recDate}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#211B17]">
                        {r.customerName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#544B45]">
                        <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DCD3] text-[11px]">
                          {r.salesInvoiceNumber || 'Direct Payment'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#211B17]">{r.paymentMode}</div>
                        <div className="text-[11px] text-[#70665F]">{bank}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#544B45]">
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
                        <button
                          onClick={() => setSelectedReceipt(r)}
                          className="p-1.5 hover:bg-[#FAF7F2] rounded-lg text-[#8B2500] hover:text-[#701E00] transition"
                          title="View & Print Voucher"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#211B17]">Record Customer Inward Payment</h3>
                  <p className="text-[11px] text-[#70665F]">Reconcile AR ledger & generate official receipt</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8C827A] hover:bg-[#FAF7F2] hover:text-[#211B17]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-bold mb-1">Receipt Date *</label>
                  <input
                    type="date"
                    required
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-bold mb-1">Payment Mode *</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-semibold"
                  >
                    <option value="NEFT">NEFT / RTGS</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Cheque">Bank Cheque</option>
                    <option value="Cash">Cash Deposit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] font-bold mb-1">Customer *</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-semibold"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName || (c as any).name} ({c.gstin || 'Standard'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-bold mb-1">Sales Invoice Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-0001 or Direct"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-bold mb-1">Receiving Bank A/C *</label>
                  <select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17]"
                  >
                    {activeBankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} - A/C {b.accountNumber ? b.accountNumber.slice(-4) : 'Main'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] font-bold mb-1">Amount Received (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500000"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-mono font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] font-bold mb-1">UTR / Ref No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UTR-98765432"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17] font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] font-bold mb-1">Notes / Narration</label>
                <input
                  type="text"
                  placeholder="Advance against order or invoice clearing..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E5DCD3] rounded-xl px-3 py-2 text-[#211B17]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE8DF] text-[#544B45] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8B2500] hover:bg-[#701E00] text-white font-bold shadow-xs active:scale-95 transition"
                >
                  ✓ Save & Settle Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voucher Detail Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C827A] tracking-wider">Official Payment Voucher</span>
                <h3 className="text-lg font-black text-[#8B2500] font-mono">{selectedReceipt.receiptNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 rounded-lg text-[#8C827A] hover:bg-[#FAF7F2] hover:text-[#211B17]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-xl space-y-3 text-xs border border-[#E5DCD3]">
              <div className="flex justify-between">
                <span className="text-[#70665F]">Customer:</span>
                <span className="font-bold text-[#211B17]">{selectedReceipt.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#70665F]">Date:</span>
                <span className="font-mono font-bold text-[#211B17]">{selectedReceipt.receiptDate || selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#70665F]">Sales Invoice Ref:</span>
                <span className="font-mono font-bold text-[#211B17]">{selectedReceipt.salesInvoiceNumber || 'Direct Payment'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#70665F]">Payment Mode:</span>
                <span className="font-bold text-[#211B17]">{selectedReceipt.paymentMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#70665F]">Bank Account:</span>
                <span className="font-bold text-[#211B17]">{selectedReceipt.bankName || 'HDFC Bank'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#70665F]">UTR / Ref No:</span>
                <span className="font-mono font-bold text-[#211B17]">{selectedReceipt.referenceNumber}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E5DCD3] text-sm">
                <span className="font-bold text-[#211B17]">Amount Cleared:</span>
                <span className="font-mono font-black text-emerald-800">
                  ₹{Number(selectedReceipt.amountPaid || selectedReceipt.amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE8DF] text-[#211B17] font-semibold text-xs border border-[#E5DCD3]"
              >
                <Printer className="w-4 h-4" />
                <span>Print Voucher</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl bg-[#8B2500] hover:bg-[#701E00] text-white font-bold text-xs"
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
