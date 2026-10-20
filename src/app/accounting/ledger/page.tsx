'use client';

import React, { useState, useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  BookOpen,
  Calendar,
  Search,
  Filter,
  Download,
  Printer,
  ArrowUpRight,
  ArrowDownLeft,
  Building,
  CheckCircle2,
  FileSpreadsheet,
  Coins,
  CreditCard,
  Landmark,
  Scale
} from 'lucide-react';
import { printContent } from '@/lib/printUtils';
import { ChartOfAccount } from '../../../types/accounting';

interface LedgerRow {
  id: string;
  date: string;
  voucherNumber: string;
  voucherType: string;
  particulars: string;
  narration: string;
  debit: number;
  credit: number;
  runningBalance?: number;
  balanceType?: 'Dr' | 'Cr';
}

export default function GeneralLedgerPage() {
  const {
    chartOfAccounts,
    salesInvoices,
    customerReceipts,
    purchaseInvoices,
    supplierPayments,
    journalEntries,
    contraEntries,
    expenseEntries,
    bankAccounts,
    customers,
    suppliers,
  } = useERP();

  // Selected Account State
  const [selectedAccountId, setSelectedAccountId] = useState<string>(() => {
    return chartOfAccounts[0]?.id || 'ACC-1010';
  });

  // Date Range Filters
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1); // 1st of current month
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Find the selected account details
  const selectedAccount = useMemo(() => {
    return (
      chartOfAccounts.find((a) => a.id === selectedAccountId || a.accountCode === selectedAccountId) ||
      chartOfAccounts[0] || {
        id: 'ACC-1010',
        accountCode: '1010',
        accountName: 'Cash on Hand',
        accountType: 'Asset',
        openingBalance: 50000,
        normalBalance: 'Debit',
      }
    );
  }, [selectedAccountId, chartOfAccounts]);

  // Aggregate All Transactions dynamically for the chosen account
  const ledgerEntries = useMemo(() => {
    const rows: LedgerRow[] = [];
    const accCode = selectedAccount.accountCode?.toLowerCase();
    const accName = selectedAccount.accountName?.toLowerCase();
    const accType = selectedAccount.accountType?.toLowerCase();

    // 1. Check Sales Invoices (Debits Customer/Debtors, Credits Sales/Revenue, Credits GST Output)
    (salesInvoices || []).forEach((inv) => {
      const invTotal = Number(inv.grandTotal ?? (inv as any).grand_total ?? 0);
      const isSalesAccount = accName.includes('sales') || accName.includes('revenue') || accCode.includes('4000');
      const isDebtorAccount = accName.includes('receivable') || accName.includes('debtor') || inv.customerId === selectedAccountId || (inv.customerName?.toLowerCase() === accName);
      const isTaxAccount = (accName.includes('gst') || accName.includes('tax')) && accName.includes('output');

      if (isDebtorAccount) {
        rows.push({
          id: `SI-DR-${inv.id}`,
          date: inv.invoiceDate || '',
          voucherNumber: inv.invoiceNumber || inv.id,
          voucherType: 'Sales Invoice',
          particulars: 'To Sales Revenue Account',
          narration: `Tax Invoice for ${inv.customerName} (Job: ${inv.jobNumber || 'MTO'})`,
          debit: invTotal,
          credit: 0,
        });
      } else if (isSalesAccount) {
        const taxable = Number(inv.subTotal ?? (inv as any).taxable_amount ?? invTotal / 1.18);
        rows.push({
          id: `SI-CR-${inv.id}`,
          date: inv.invoiceDate || '',
          voucherNumber: inv.invoiceNumber || inv.id,
          voucherType: 'Sales Invoice',
          particulars: `By ${inv.customerName}`,
          narration: `Taxable sales of heavy fabricated products`,
          debit: 0,
          credit: taxable,
        });
      } else if (isTaxAccount) {
        const tax = Number(inv.taxTotal ?? (invTotal - Number(inv.subTotal || 0)));
        if (tax > 0) {
          rows.push({
            id: `SI-TAX-${inv.id}`,
            date: inv.invoiceDate || '',
            voucherNumber: inv.invoiceNumber || inv.id,
            voucherType: 'Sales Invoice',
            particulars: `By Output GST on ${inv.customerName}`,
            narration: `Output CGST/SGST/IGST collected`,
            debit: 0,
            credit: tax,
          });
        }
      }
    });

    // 2. Check Customer Receipts (Debits Bank/Cash, Credits Customer/Debtors)
    (customerReceipts || []).forEach((rec) => {
      const recAmt = Number(rec.amountPaid ?? rec.amount ?? 0);
      const isBankMatch = rec.bankAccountId === selectedAccountId || (rec.bankName && accName.includes(rec.bankName.toLowerCase()));
      const isDebtorAccount = accName.includes('receivable') || accName.includes('debtor') || rec.customerId === selectedAccountId || (rec.customerName?.toLowerCase() === accName);

      if (isBankMatch) {
        rows.push({
          id: `RCT-DR-${rec.id}`,
          date: rec.receiptDate || (rec as any).date || '',
          voucherNumber: rec.receiptNumber || rec.id,
          voucherType: 'Customer Receipt',
          particulars: `To ${rec.customerName}`,
          narration: `Received via ${rec.paymentMode} (Ref: ${rec.referenceNumber || 'N/A'})`,
          debit: recAmt,
          credit: 0,
        });
      } else if (isDebtorAccount) {
        rows.push({
          id: `RCT-CR-${rec.id}`,
          date: rec.receiptDate || (rec as any).date || '',
          voucherNumber: rec.receiptNumber || rec.id,
          voucherType: 'Customer Receipt',
          particulars: `By ${rec.bankName || 'Bank / Cash Account'}`,
          narration: `Settlement for ${rec.salesInvoiceNumber || 'Direct Payment'}`,
          debit: 0,
          credit: recAmt,
        });
      }
    });

    // 3. Check Purchase Invoices (Debits Expense/Inventory & Input Tax, Credits Supplier/Creditor)
    (purchaseInvoices || []).forEach((inv) => {
      const grandTotal = Number(inv.grandTotal ?? (inv as any).grand_total ?? 0);
      const isCreditorAccount = accName.includes('payable') || accName.includes('creditor') || inv.supplierId === selectedAccountId || (inv.supplierName?.toLowerCase() === accName);
      const isPurchaseAccount = accName.includes('purchase') || accName.includes('raw material') || accCode.includes('5000');
      const isTaxAccount = (accName.includes('gst') || accName.includes('tax')) && (accName.includes('input') || accName.includes('itc'));

      if (isCreditorAccount) {
        rows.push({
          id: `PI-CR-${inv.id}`,
          date: inv.invoiceDate || '',
          voucherNumber: inv.invoiceNumber || inv.id,
          voucherType: 'Purchase Bill',
          particulars: `By Raw Material Purchases`,
          narration: `Purchase from ${inv.supplierName} (Vendor Bill: ${inv.vendorInvoiceNumber || 'N/A'})`,
          debit: 0,
          credit: grandTotal,
        });
      } else if (isPurchaseAccount) {
        const taxable = Number(inv.subTotal ?? (inv as any).taxable_amount ?? grandTotal / 1.18);
        rows.push({
          id: `PI-DR-${inv.id}`,
          date: inv.invoiceDate || '',
          voucherNumber: inv.invoiceNumber || inv.id,
          voucherType: 'Purchase Bill',
          particulars: `To ${inv.supplierName}`,
          narration: `Inward materials from PO: ${inv.poNumber || 'Direct'}`,
          debit: taxable,
          credit: 0,
        });
      } else if (isTaxAccount) {
        const tax = Number((inv as any).cgst_amount || 0) + Number((inv as any).sgst_amount || 0) + Number((inv as any).igst_amount || 0);
        if (tax > 0) {
          rows.push({
            id: `PI-TAX-${inv.id}`,
            date: inv.invoiceDate || '',
            voucherNumber: inv.invoiceNumber || inv.id,
            voucherType: 'Purchase Bill',
            particulars: `To Input Tax Credit on ${inv.supplierName}`,
            narration: `Eligible GSTR-2B Input Tax Credit`,
            debit: tax,
            credit: 0,
          });
        }
      }
    });

    // 4. Check Supplier Payments (Debits Supplier/Creditor, Credits Bank/Cash)
    (supplierPayments || []).forEach((pay) => {
      const payAmt = Number(pay.amountPaid ?? pay.amount ?? 0);
      const isBankMatch = pay.bankAccountId === selectedAccountId || (pay.bankName && accName.includes(pay.bankName.toLowerCase()));
      const isCreditorAccount = accName.includes('payable') || accName.includes('creditor') || pay.supplierId === selectedAccountId || (pay.supplierName?.toLowerCase() === accName);

      if (isCreditorAccount) {
        rows.push({
          id: `PAY-DR-${pay.id}`,
          date: pay.paymentDate || (pay as any).date || '',
          voucherNumber: pay.paymentNumber || pay.id,
          voucherType: 'Supplier Payment',
          particulars: `To ${pay.bankName || 'Bank Account'}`,
          narration: `Payment for ${pay.purchaseInvoiceNumber || 'Direct Bill'} via ${pay.paymentMode} (UTR: ${pay.referenceNumber})`,
          debit: payAmt,
          credit: 0,
        });
      } else if (isBankMatch) {
        rows.push({
          id: `PAY-CR-${pay.id}`,
          date: pay.paymentDate || (pay as any).date || '',
          voucherNumber: pay.paymentNumber || pay.id,
          voucherType: 'Supplier Payment',
          particulars: `By ${pay.supplierName}`,
          narration: `Outward bank transfer (UTR: ${pay.referenceNumber})`,
          debit: 0,
          credit: payAmt,
        });
      }
    });

    // 5. Check Journal Entries
    (journalEntries || []).forEach((jv) => {
      const lines = jv.lines || [];
      lines.forEach((l: any, idx: number) => {
        const lineAccId = l.accountId || l.account_id;
        const lineAccCode = (l.accountCode || l.account_code || '').toLowerCase();
        const lineAccName = (l.accountName || l.account_name || '').toLowerCase();

        if (lineAccId === selectedAccountId || lineAccCode === accCode || lineAccName === accName) {
          rows.push({
            id: `JV-${jv.id}-${idx}`,
            date: jv.journalDate || (jv as any).date || '',
            voucherNumber: jv.journalNumber || jv.id,
            voucherType: 'Journal Entry',
            particulars: l.debitAmount > 0 ? 'To ' + (jv.narration || 'Journal Adjustment') : 'By ' + (jv.narration || 'Journal Adjustment'),
            narration: jv.narration || 'General Journal Voucher adjustment',
            debit: Number(l.debitAmount || 0),
            credit: Number(l.creditAmount || 0),
          });
        }
      });
    });

    // 6. Check Contra Entries (Bank to Bank, Cash to Bank, Bank to Cash)
    (contraEntries || []).forEach((c) => {
      const contraAmt = Number(c.amount || 0);
      const isFrom = c.fromAccountId === selectedAccountId || (c.fromAccountName && accName.includes(c.fromAccountName.toLowerCase()));
      const isTo = c.toAccountId === selectedAccountId || (c.toAccountName && accName.includes(c.toAccountName.toLowerCase()));

      if (isTo) {
        rows.push({
          id: `CNT-DR-${c.id}`,
          date: c.contraDate || '',
          voucherNumber: c.contraNumber || c.id,
          voucherType: 'Contra Voucher',
          particulars: `To ${c.fromAccountName}`,
          narration: c.narration || `Contra Transfer: Received into ${c.toAccountName}`,
          debit: contraAmt,
          credit: 0,
        });
      } else if (isFrom) {
        rows.push({
          id: `CNT-CR-${c.id}`,
          date: c.contraDate || '',
          voucherNumber: c.contraNumber || c.id,
          voucherType: 'Contra Voucher',
          particulars: `By ${c.toAccountName}`,
          narration: c.narration || `Contra Transfer: Disbursed to ${c.toAccountName}`,
          debit: 0,
          credit: contraAmt,
        });
      }
    });

    // 7. Check Factory & Office Expenses
    (expenseEntries || []).forEach((exp) => {
      const expAmt = Number(exp.grandTotal ?? exp.amount ?? 0);
      const isExpenseMatch = accName.includes(exp.category?.toLowerCase() || 'expense') || accName.includes('expense');
      const isBankMatch = (exp.bankCashAccountName && accName.includes(exp.bankCashAccountName.toLowerCase())) || (exp.paymentMode === 'Bank_Transfer' && accName.includes('bank'));

      if (isExpenseMatch) {
        rows.push({
          id: `EXP-DR-${exp.id}`,
          date: exp.expenseDate || '',
          voucherNumber: exp.expenseNumber || exp.id,
          voucherType: 'Expense Entry',
          particulars: `To ${exp.paymentMode} (${exp.vendorName || exp.claimedBy})`,
          narration: exp.description || `Factory operational expense: ${exp.category}`,
          debit: expAmt,
          credit: 0,
        });
      } else if (isBankMatch) {
        rows.push({
          id: `EXP-CR-${exp.id}`,
          date: exp.expenseDate || '',
          voucherNumber: exp.expenseNumber || exp.id,
          voucherType: 'Expense Entry',
          particulars: `By ${exp.category} (${exp.vendorName || 'Vendor'})`,
          narration: exp.description || `Outflow for operational expenses`,
          debit: 0,
          credit: expAmt,
        });
      }
    });

    // Sort chronologically
    rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate Running Balance
    const initialOpening = Number(selectedAccount.openingBalance || 0);
    const isNormalDebit = selectedAccount.accountType === 'Asset' || selectedAccount.accountType === 'Expense';

    let current = isNormalDebit ? initialOpening : -initialOpening;

    return rows.map((r) => {
      if (isNormalDebit) {
        current = current + r.debit - r.credit;
      } else {
        current = current + r.credit - r.debit;
      }
      return {
        ...r,
        runningBalance: Math.abs(current),
        balanceType: current >= 0 ? (isNormalDebit ? 'Dr' : 'Cr') : (isNormalDebit ? 'Cr' : 'Dr'),
      };
    });
  }, [
    selectedAccount,
    selectedAccountId,
    salesInvoices,
    customerReceipts,
    purchaseInvoices,
    supplierPayments,
    journalEntries,
    contraEntries,
    expenseEntries,
  ]);

  // Date filtered rows
  const filteredRows = useMemo(() => {
    return ledgerEntries.filter((r) => {
      const rowDate = r.date;
      const matchesFrom = !fromDate || !rowDate || rowDate >= fromDate;
      const matchesTo = !toDate || !rowDate || rowDate <= toDate;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        r.voucherNumber.toLowerCase().includes(q) ||
        r.particulars.toLowerCase().includes(q) ||
        r.narration.toLowerCase().includes(q) ||
        r.voucherType.toLowerCase().includes(q);

      return matchesFrom && matchesTo && matchesQuery;
    });
  }, [ledgerEntries, fromDate, toDate, searchQuery]);

  // Totals for the Period
  const periodDebitTotal = filteredRows.reduce((sum, r) => sum + r.debit, 0);
  const periodCreditTotal = filteredRows.reduce((sum, r) => sum + r.credit, 0);
  const closingBalance =
    filteredRows.length > 0
      ? filteredRows[filteredRows.length - 1].runningBalance || 0
      : Number(selectedAccount.openingBalance || 0);
  const closingType =
    filteredRows.length > 0
      ? filteredRows[filteredRows.length - 1].balanceType || 'Dr'
      : (selectedAccount.accountType === 'Asset' || selectedAccount.accountType === 'Expense' ? 'Dr' : 'Cr');

  // Quick Date Setters
  const setQuickDate = (type: 'this_month' | 'last_month' | 'fy' | 'all') => {
    const today = new Date();
    if (type === 'this_month') {
      const first = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      setFromDate(first);
      setToDate(today.toISOString().split('T')[0]);
    } else if (type === 'last_month') {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
      const last = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
      setFromDate(first);
      setToDate(last);
    } else if (type === 'fy') {
      setFromDate('2025-04-01');
      setToDate('2026-03-31');
    } else if (type === 'all') {
      setFromDate('');
      setToDate('');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2] text-[#211B17]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-0.5">
              ACCOUNTING &amp; FINANCE / GENERAL LEDGER (ખાતાવહી)
            </div>
            <h1 className="text-xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
              <span>Account Ledger Book</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300 font-mono">
                {selectedAccount.accountCode}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              General Ledger Account Statements • Double-Entry Audit Trail • Live Debit, Credit &amp; Running Balance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => printContent('printable-ledger-report', { title: `Ledger_${selectedAccount.accountCode}_${selectedAccount.accountName}` })}
            className="px-3.5 py-2.5 bg-white border border-[#EBE3DB] hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Ledger</span>
          </button>
        </div>
      </div>

      {/* Account & Date Selection Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#EBE3DB] shadow-xs space-y-4 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Account Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Ledger Account / Party:
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <optgroup label="Chart of Accounts">
                {chartOfAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.accountCode} — {a.accountName} ({a.accountType})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Customers (Debtors)">
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    CUST: {c.companyName || (c as any).name} ({c.id})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Suppliers (Creditors)">
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    SUPP: {s.supplierName || (s as any).name} ({s.id})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Date Range Picker */}
          <div className="col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Statement Period:
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs">
                <span className="text-slate-400 font-semibold">From:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-transparent font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs">
                <span className="text-slate-400 font-semibold">To:</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-transparent font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 ml-auto">
                <button
                  type="button"
                  onClick={() => setQuickDate('this_month')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  This Month
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('last_month')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  Last Month
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('fy')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  FY 2025-26
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('all')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  All Time
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info & Balance Summary Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-[#EBE3DB] shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Opening Balance
          </div>
          <div className="text-xl font-black font-mono text-slate-900">
            ₹{Number(selectedAccount.openingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            <span className="text-xs font-bold text-slate-500 ml-1">
              {selectedAccount.normalBalance || (selectedAccount.accountType === 'Asset' || selectedAccount.accountType === 'Expense' ? 'Dr' : 'Cr')}
            </span>
          </div>
          <div className="text-[10px] text-slate-400">As of starting period</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#EBE3DB] shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
            Total Debits (Dr)
          </div>
          <div className="text-xl font-black font-mono text-emerald-700">
            ₹{periodDebitTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400">Total inward / debited</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#EBE3DB] shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
            Total Credits (Cr)
          </div>
          <div className="text-xl font-black font-mono text-rose-700">
            ₹{periodCreditTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400">Total outward / credited</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#EBE3DB] shadow-xs space-y-1 bg-amber-50/20">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
            Closing Balance
          </div>
          <div className="text-xl font-black font-mono text-amber-900">
            ₹{closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            <span className="text-xs font-bold text-amber-800 ml-1">
              {closingType}
            </span>
          </div>
          <div className="text-[10px] text-amber-700 font-semibold">Net Account Standing</div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-md overflow-hidden">
        {/* Printable Letterhead Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              STATEMENT OF ACCOUNT: {selectedAccount.accountName?.toUpperCase()} ({selectedAccount.accountCode})
            </h2>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              PERIOD: {fromDate || 'Start'} to {toDate || 'Today'} • Account Type: {selectedAccount.accountType}
            </div>
          </div>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search in ledger entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-black uppercase text-[10px] tracking-wider border-b border-slate-300">
                <th className="py-3 px-3.5 w-24">DATE</th>
                <th className="py-3 px-3.5 w-32">VOUCHER NO</th>
                <th className="py-3 px-3.5 w-28">TYPE</th>
                <th className="py-3 px-4 min-w-[220px]">PARTICULARS</th>
                <th className="py-3 px-4 min-w-[200px]">NARRATION / JOB</th>
                <th className="py-3 px-4 text-right w-28">DEBIT (₹)</th>
                <th className="py-3 px-4 text-right w-28">CREDIT (₹)</th>
                <th className="py-3 px-4 text-right w-36">RUNNING BAL (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {/* Opening Balance Row */}
              <tr className="bg-slate-50/70 font-semibold text-slate-600">
                <td className="py-2.5 px-3.5 font-sans">{fromDate || '01/04/2025'}</td>
                <td className="py-2.5 px-3.5 text-slate-400">-</td>
                <td className="py-2.5 px-3.5">
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px]">Opening</span>
                </td>
                <td className="py-2.5 px-4 font-bold text-slate-800 font-sans">
                  To Opening Balance Brought Forward
                </td>
                <td className="py-2.5 px-4 font-sans text-slate-500 text-[11px]">
                  Brought forward from previous books
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-800">
                  {selectedAccount.normalBalance === 'Debit' ? Number(selectedAccount.openingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-800">
                  {selectedAccount.normalBalance === 'Credit' ? Number(selectedAccount.openingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                </td>
                <td className="py-2.5 px-4 text-right font-black text-slate-900">
                  ₹{Number(selectedAccount.openingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} {selectedAccount.normalBalance === 'Credit' ? 'Cr' : 'Dr'}
                </td>
              </tr>

              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-sm">No transactions found for this account</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try widening your date range or selecting another account.</p>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-amber-50/30 transition">
                    <td className="py-2.5 px-3.5 font-sans text-slate-700">{row.date}</td>
                    <td className="py-2.5 px-3.5 font-bold text-amber-900">{row.voucherNumber}</td>
                    <td className="py-2.5 px-3.5 font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                        {row.voucherType}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-sans font-bold text-slate-900">{row.particulars}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-500 text-[11px] truncate max-w-[240px]" title={row.narration}>
                      {row.narration}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-700">
                      {row.debit > 0 ? row.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-rose-700">
                      {row.credit > 0 ? row.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-black text-slate-900">
                      ₹{row.runningBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}{' '}
                      <span className="text-[10px] font-bold text-slate-500">{row.balanceType}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Totals Footer Row */}
            <tfoot>
              <tr className="bg-slate-100 border-t-2 border-slate-800 font-bold text-slate-900 text-xs">
                <td colSpan={5} className="py-3 px-4 text-right font-sans uppercase tracking-wider">
                  Total for the Period:
                </td>
                <td className="py-3 px-4 text-right font-mono font-black text-emerald-800">
                  ₹{periodDebitTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right font-mono font-black text-rose-800">
                  ₹{periodCreditTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right font-mono font-black text-amber-900">
                  ₹{closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} {closingType}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-1">
          <div>
            Total Entries: <strong>{filteredRows.length}</strong> • Reconciled with Double-Entry Journal Book
          </div>
          <div className="font-mono text-[10px] text-slate-400">
            Certified by UMA TECHNO FAB PRIVATE LIMITED — Accounts Department
          </div>
        </div>
      </div>
    </div>
  );
}
