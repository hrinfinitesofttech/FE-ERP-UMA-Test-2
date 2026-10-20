'use client';

import React, { useState, useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Calculator, Plus, Search, FileText, Download, CheckCircle2, Landmark, Check, AlertCircle, Printer, X } from 'lucide-react';
import { toast } from '../../../context/ToastContext';

export default function TDSCompliancePage() {
  const { tdsMasters, purchaseInvoices, bankAccounts, updateBankAccount } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState(bankAccounts[0]?.id || '');
  const [bsrCode, setBsrCode] = useState('0210045');
  const [challanNo, setChallanNo] = useState(`CH-${Math.floor(10000 + Math.random() * 90000)}`);
  const [paidChallans, setPaidChallans] = useState<{ id: string; bsrCode: string; challanNo: string; amount: number; date: string; bankName: string }[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_tdsChallans');
        if (stored) return JSON.parse(stored);
      } catch (_) {}
    }
    return [];
  });
  const [toastMessage, setToastMessage] = useState('');

  // Real TDS Deductions from Vendor Bills
  const billsWithTDS = useMemo(() => {
    return (purchaseInvoices || []).filter((inv) => {
      const tds = Number(inv.tdsAmount ?? inv.tdsDeducted ?? 0);
      return tds > 0;
    });
  }, [purchaseInvoices]);

  const totalTDSDeducted = useMemo(() => {
    return billsWithTDS.reduce((acc, inv) => acc + Number(inv.tdsAmount ?? inv.tdsDeducted ?? 0), 0);
  }, [billsWithTDS]);

  const totalTdsDeposited = useMemo(() => {
    return paidChallans.reduce((acc, c) => acc + Number(c.amount || 0), 0);
  }, [paidChallans]);

  const pendingTdsDeposit = Math.max(0, totalTDSDeducted - totalTdsDeposited);

  const filteredBills = useMemo(() => {
    return billsWithTDS.filter(
      (inv) =>
        !searchTerm.trim() ||
        inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.vendorInvoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.tdsSection?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [billsWithTDS, searchTerm]);

  const handlePayChallan = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingTdsDeposit <= 0) {
      toast.warning('No pending TDS to deposit to Government!');
      return;
    }

    const bank = bankAccounts.find((b) => b.id === selectedBankId) || bankAccounts[0];
    const newChallan = {
      id: `CHALLAN-${Date.now()}`,
      bsrCode,
      challanNo,
      amount: pendingTdsDeposit,
      date: new Date().toISOString().split('T')[0],
      bankName: bank?.bankName || 'HDFC Bank',
    };

    const updatedChallans = [newChallan, ...paidChallans];
    setPaidChallans(updatedChallans);
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('UMA_ERP_tdsChallans', JSON.stringify(updatedChallans)); } catch (_) {}
    }

    // Deduct from Bank Account
    if (bank) {
      updateBankAccount(bank.id, {
        currentBalance: Math.max(0, Number(bank.currentBalance || 0) - pendingTdsDeposit),
      });
    }

    setIsChallanModalOpen(false);
    toast.success(`Challan 281 generated and ₹${pendingTdsDeposit.toLocaleString('en-IN')} deposited to Govt.`);
    setToastMessage(`Challan 281 generated and ₹${pendingTdsDeposit.toLocaleString('en-IN')} deposited to Govt.`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] min-h-screen text-[#211B17]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-[#211B17] text-white px-5 py-3 rounded-xl shadow-2xl border border-white/10 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/20 rounded-xl text-violet-600">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">TDS Compliance & Form 26Q Register</h1>
            <p className="text-xs text-[#70665F] mt-0.5">Tax Deducted at Source • Section 194C (Subcontracting), 194J (Professional), 194Q (Goods), 194I (Rent)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-[#EBE3DB] text-[#211B17] font-semibold text-xs px-4 py-2.5 rounded-xl transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Form 26Q</span>
          </button>
          <button
            onClick={() => setIsChallanModalOpen(true)}
            disabled={pendingTdsDeposit <= 0}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <Landmark className="w-4 h-4" />
            <span>Pay TDS via Challan 281</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-sm space-y-2">
          <span className="text-xs text-[#70665F] uppercase font-semibold">Total TDS Deducted</span>
          <div className="text-2xl font-bold text-violet-600 font-mono">₹{totalTDSDeducted.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-[#70665F]">{billsWithTDS.length} Vendor Bills with TDS withholding</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-sm space-y-2">
          <span className="text-xs text-[#70665F] uppercase font-semibold">TDS Deposited to Govt</span>
          <div className="text-2xl font-bold text-emerald-600 font-mono">₹{totalTdsDeposited.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-emerald-600 font-semibold">{paidChallans.length} Challan 281 OLTAS receipts</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-sm space-y-2">
          <span className="text-xs text-[#70665F] uppercase font-semibold">Pending TDS Deposit</span>
          <div className="text-2xl font-bold text-amber-600 font-mono">₹{pendingTdsDeposit.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-[#70665F]">Due by 7th of next calendar month</div>
        </div>
      </div>

      {/* TDS Section Rates Master */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {tdsMasters.map((t) => (
          <div key={t.id} className="bg-white p-4 rounded-xl border border-[#EBE3DB] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-violet-600">Section {t.sectionCode}</span>
              <span className="px-2 py-0.5 rounded bg-violet-100 text-violet-700 text-[10px] font-bold font-mono">{t.rate}% Rate</span>
            </div>
            <h3 className="text-xs font-bold text-[#211B17] truncate">{t.description}</h3>
            <div className="text-[11px] text-[#70665F]">Threshold Limit: ₹{t.thresholdLimit?.toLocaleString('en-IN')}</div>
          </div>
        ))}
      </div>

      {/* Table of Bills with TDS Deductions */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-sm font-bold text-[#211B17]">Vendor Bills Subject to TDS Withholding</h2>
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
            <input
              type="text"
              placeholder="Search vendor, invoice or section..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#3E2723]"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#EBE3DB]">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2]/80 text-[#70665F] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="py-3.5 px-4">ERP Invoice</th>
                <th className="py-3.5 px-4">Vendor Bill No</th>
                <th className="py-3.5 px-4">Supplier Name</th>
                <th className="py-3.5 px-4">TDS Section</th>
                <th className="py-3.5 px-4 text-right">Taxable Base</th>
                <th className="py-3.5 px-4 text-right">Rate</th>
                <th className="py-3.5 px-4 text-right">TDS Deducted ₹</th>
                <th className="py-3.5 px-4 text-center">Form 26Q Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] font-mono">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#70665F] font-sans">
                    No vendor bills with TDS deductions recorded yet.
                  </td>
                </tr>
              ) : (
                filteredBills.map((inv) => (
                  <tr key={inv.id} className="hover:bg-amber-50/20 transition">
                    <td className="py-3 px-4 font-bold text-indigo-600">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 text-[#3E2723]">{inv.vendorInvoiceNumber || '-'}</td>
                    <td className="py-3 px-4 font-sans font-semibold text-[#3E2723]">{inv.supplierName}</td>
                    <td className="py-3 px-4 text-violet-600 font-sans">Sec {inv.tdsSection || '194C'}</td>
                    <td className="py-3 px-4 text-right text-[#544B45]">₹{Number(inv.subTotal ?? inv.subtotal ?? inv.taxableAmount ?? 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-[#70665F]">{inv.tdsRate ?? 2}%</td>
                    <td className="py-3 px-4 text-right font-bold text-violet-600">₹{Number(inv.tdsAmount ?? inv.tdsDeducted ?? 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-700 font-semibold">Included in 26Q</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Challan 281 Deposit History */}
      {paidChallans.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-sm overflow-hidden p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#211B17]">Challan ITNS-281 Government Payment Register</h2>
          <div className="overflow-x-auto rounded-xl border border-[#EBE3DB]">
            <table className="w-full text-left text-xs text-[#544B45]">
              <thead className="bg-[#FAF7F2]/80 text-[#70665F] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EBE3DB]">
                <tr>
                  <th className="py-3 px-4">Challan No</th>
                  <th className="py-3 px-4">BSR Code</th>
                  <th className="py-3 px-4">Debit Bank</th>
                  <th className="py-3 px-4">Deposit Date</th>
                  <th className="py-3 px-4 text-right">Amount Deposited ₹</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE3DB] font-mono">
                {paidChallans.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 px-4 font-bold text-emerald-600">{c.challanNo}</td>
                    <td className="py-3 px-4 text-[#70665F]">{c.bsrCode}</td>
                    <td className="py-3 px-4 font-sans text-[#3E2723]">{c.bankName}</td>
                    <td className="py-3 px-4 text-[#70665F]">{c.date}</td>
                    <td className="py-3 px-4 text-right font-bold text-[#211B17]">₹{Number(c.amount).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">CIN Verified</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Challan 281 Payment Modal */}
      {isChallanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-[#EBE3DB] w-full max-w-md shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE3DB]">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-violet-600" />
                <h3 className="text-base font-bold text-[#211B17]">Pay TDS via Challan 281</h3>
              </div>
              <button onClick={() => setIsChallanModalOpen(false)} className="text-[#70665F] hover:text-[#211B17] p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePayChallan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#70665F] mb-1">Select Bank Account to Debit</label>
                <select
                  value={selectedBankId}
                  onChange={(e) => setSelectedBankId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} ({b.accountNumber}) - Bal: ₹{Number(b.currentBalance || 0).toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#70665F] mb-1">7-Digit BSR Code</label>
                  <input
                    type="text"
                    required
                    value={bsrCode}
                    onChange={(e) => setBsrCode(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs font-mono text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#70665F] mb-1">Challan Serial No</label>
                  <input
                    type="text"
                    required
                    value={challanNo}
                    onChange={(e) => setChallanNo(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs font-mono text-[#211B17]"
                  />
                </div>
              </div>

              <div className="p-4 bg-violet-50 rounded-xl border border-violet-100 space-y-1">
                <div className="text-xs text-violet-700 font-medium">TDS Deposit Amount:</div>
                <div className="text-2xl font-bold font-mono text-violet-900">₹{pendingTdsDeposit.toLocaleString('en-IN')}</div>
                <div className="text-[11px] text-violet-600">Major Head: 0021 (Companies) / Minor Head: 200 (TDS Regular)</div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChallanModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#70665F] hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition shadow-sm"
                >
                  Confirm & Debit Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
