'use client';

import React, { useState, useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import { BankAccount } from '../../../types/accounting';
import {
  Landmark,
  Plus,
  Search,
  CheckCircle2,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Filter,
  CreditCard,
  Building2,
  Wallet,
  Clock,
  Trash2,
  Edit2,
  Copy,
  Check,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  X,
  LayoutGrid,
  List
} from 'lucide-react';

export default function CashBankPage() {
  const {
    bankAccounts,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    customerReceipts = [],
    supplierPayments = [],
    expenseEntries = [],
    contraEntries = [],
  } = useERP();

  // Navigation & View states
  const [activeTab, setActiveTab] = useState<'accounts' | 'cashflow' | 'transactions'>('accounts');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [bankName, setBankName] = useState('HDFC Bank Ltd');
  const [accountName, setAccountName] = useState('HDFC Current Account - Operations');
  const [accountNumber, setAccountNumber] = useState('50200088921045');
  const [accountType, setAccountType] = useState<string>('Current');
  const [ifscCode, setIfscCode] = useState('HDFC0000123');
  const [branchName, setBranchName] = useState('Makarpura GIDC, Vadodara');
  const [glAccountCode, setGlAccountCode] = useState('1010');
  const [openingBalance, setOpeningBalance] = useState<string | number>('2500000');
  const [currentBalance, setCurrentBalance] = useState<string | number>('2500000');

  // Handle Copy to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Add Modal with fresh defaults
  const handleOpenAddModal = () => {
    setBankName('');
    setAccountName('');
    setAccountNumber('');
    setAccountType('Current');
    setIfscCode('');
    setBranchName('');
    setGlAccountCode(`10${bankAccounts.length + 1}0`);
    setOpeningBalance('');
    setCurrentBalance('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (b: BankAccount) => {
    setEditingAccount(b);
    setBankName(b.bankName || '');
    setAccountName(b.accountName || b.bankName || '');
    setAccountNumber(b.accountNumber || '');
    setAccountType(b.accountType || 'Current');
    setIfscCode(b.ifscCode || '');
    setBranchName(b.branchName || b.branch || '');
    setGlAccountCode(b.glAccountCode || '');
    setOpeningBalance(b.openingBalance ?? 0);
    setCurrentBalance(b.currentBalance ?? b.openingBalance ?? 0);
  };

  // Submit Add
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const openBal = openingBalance === '' ? 0 : Number(openingBalance);
    addBankAccount({
      bankName: bankName.trim(),
      accountName: accountName.trim() || bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountType,
      ifscCode: ifscCode.trim(),
      branchName: branchName.trim(),
      branch: branchName.trim(),
      glAccountCode: glAccountCode.trim() || '1010',
      openingBalance: openBal,
      status: 'Active',
      isActive: true,
    });
    setIsAddModalOpen(false);
  };

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    updateBankAccount(editingAccount.id, {
      bankName: bankName.trim(),
      accountName: accountName.trim() || bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountType,
      ifscCode: ifscCode.trim(),
      branchName: branchName.trim(),
      branch: branchName.trim(),
      glAccountCode: glAccountCode.trim(),
      openingBalance: Number(openingBalance) || 0,
      currentBalance: Number(currentBalance) || 0,
    });
    setEditingAccount(null);
  };

  // Filtered Bank Accounts
  const filteredAccounts = useMemo(() => {
    const list = bankAccounts || [];
    return list.filter((b) => {
      const q = (searchTerm || '').toLowerCase();
      const bName = (b.bankName || '').toLowerCase();
      const aName = (b.accountName || '').toLowerCase();
      const aNum = (b.accountNumber || '').toLowerCase();
      const ifsc = (b.ifscCode || '').toLowerCase();
      const gl = (b.glAccountCode || '').toLowerCase();
      const brName = (b.branchName || '').toLowerCase();
      const br = (b.branch || '').toLowerCase();

      const matchesSearch =
        !q ||
        bName.includes(q) ||
        aName.includes(q) ||
        aNum.includes(q) ||
        ifsc.includes(q) ||
        gl.includes(q) ||
        brName.includes(q) ||
        br.includes(q);

      const matchesType = typeFilter === 'all' || b.accountType === typeFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'Active' && (b.status === 'Active' || b.isActive)) ||
        (statusFilter === 'Inactive' && (b.status === 'Inactive' || b.isActive === false));

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [bankAccounts, searchTerm, typeFilter, statusFilter]);

  // Total Treasury Metrics
  const metrics = useMemo(() => {
    const list = bankAccounts || [];
    const totalLiquidity = list.reduce((acc, b) => acc + (Number(b.currentBalance) || 0), 0);
    const bankTotal = list
      .filter((b) => b.accountType !== 'Cash')
      .reduce((acc, b) => acc + (Number(b.currentBalance) || 0), 0);
    const cashTotal = list
      .filter((b) => b.accountType === 'Cash')
      .reduce((acc, b) => acc + (Number(b.currentBalance) || 0), 0);

    const totalReceiptsInflow = (customerReceipts || []).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const totalPaymentsOutflow = (supplierPayments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalExpensesOutflow = (expenseEntries || []).reduce((sum, e) => sum + (Number(e.grandTotal || e.subTotal) || 0), 0);
    const totalOutflow = totalPaymentsOutflow + totalExpensesOutflow;
    const netCashflow = totalReceiptsInflow - totalOutflow;

    return {
      totalLiquidity,
      bankTotal,
      cashTotal,
      totalReceiptsInflow,
      totalPaymentsOutflow,
      totalExpensesOutflow,
      totalOutflow,
      netCashflow,
      accountCount: list.length,
    };
  }, [bankAccounts, customerReceipts, supplierPayments, expenseEntries]);

  // Unified Transactions Feed (Receipts + Payments + Expenses + Contra)
  const unifiedTransactions = useMemo(() => {
    const list: Array<{
      id: string;
      date: string;
      type: 'Receipt' | 'Payment' | 'Expense' | 'Contra';
      title: string;
      account: string;
      refNumber: string;
      inflow: number;
      outflow: number;
      status: string;
    }> = [];

    // Receipts
    (customerReceipts || []).forEach((r) => {
      list.push({
        id: `REC-${r.id}`,
        date: r.receiptDate || '2026-09-28',
        type: 'Receipt',
        title: `Customer Receipt: ${r.customerName || 'Direct Inflow'}`,
        account: r.bankCashAccountName || r.bankAccountId || 'Primary Bank',
        refNumber: r.receiptNumber || r.id,
        inflow: Number(r.amount) || 0,
        outflow: 0,
        status: r.status || 'Received',
      });
    });

    // Supplier Payments
    (supplierPayments || []).forEach((p) => {
      list.push({
        id: `PAY-${p.id}`,
        date: p.paymentDate || '2026-09-28',
        type: 'Payment',
        title: `Vendor Payment: ${p.supplierName || 'Vendor'}`,
        account: p.bankCashAccountName || p.bankAccountId || 'Primary Bank',
        refNumber: p.paymentNumber || p.id,
        inflow: 0,
        outflow: Number(p.amount) || 0,
        status: p.status || 'Paid',
      });
    });

    // Expense Entries
    (expenseEntries || []).forEach((e) => {
      list.push({
        id: `EXP-${e.id}`,
        date: e.expenseDate || '2026-09-28',
        type: 'Expense',
        title: `Expense: ${e.category || 'Operational'} (${e.claimedBy || e.vendorName || 'Staff'})`,
        account: e.bankCashAccountName || 'Operations Cash/Bank',
        refNumber: e.expenseNumber || e.id,
        inflow: 0,
        outflow: Number(e.grandTotal || e.subTotal) || 0,
        status: e.status || 'Approved',
      });
    });

    // Contra Entries
    (contraEntries || []).forEach((c) => {
      list.push({
        id: `CTR-${c.id}`,
        date: c.contraDate || '2026-09-28',
        type: 'Contra',
        title: `Transfer: ${c.fromAccountName} ➔ ${c.toAccountName}`,
        account: `${c.fromAccountName} / ${c.toAccountName}`,
        refNumber: c.contraNumber || c.id,
        inflow: Number(c.amount) || 0,
        outflow: Number(c.amount) || 0,
        status: c.status || 'Posted',
      });
    });

    return list.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [customerReceipts, supplierPayments, expenseEntries, contraEntries]);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen text-[#211B17]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 rounded-2xl text-teal-600 border border-teal-100">
            <Landmark className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight">Cash &amp; Bank Accounts Master</h1>
            <p className="text-xs text-[#70665F] mt-0.5">
              Manage Bank Accounts, Petty Cash Vaults, Live General Ledger Balances &amp; Real-time Cashflow
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-semibold text-[#70665F]">Total Treasury Liquidity</div>
            <div className="text-2xl font-black text-teal-700 font-mono">₹{metrics.totalLiquidity.toLocaleString()}</div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bank Account</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-[#EBE3DB] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#70665F]">Bank Balances</p>
            <p className="text-xl font-bold text-gray-900 mt-1 font-mono">₹{metrics.bankTotal.toLocaleString()}</p>
            <p className="text-[11px] text-teal-600 font-medium mt-0.5">{bankAccounts.filter(b => b.accountType !== 'Cash').length} Accounts</p>
          </div>
          <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#EBE3DB] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#70665F]">Petty Cash Vaults</p>
            <p className="text-xl font-bold text-gray-900 mt-1 font-mono">₹{metrics.cashTotal.toLocaleString()}</p>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">{bankAccounts.filter(b => b.accountType === 'Cash').length} Registers</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#EBE3DB] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#70665F]">Operating Inflow</p>
            <p className="text-xl font-bold text-emerald-600 mt-1 font-mono">+₹{metrics.totalReceiptsInflow.toLocaleString()}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">From Customer Receipts</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#EBE3DB] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#70665F]">Operating Outflow</p>
            <p className="text-xl font-bold text-rose-600 mt-1 font-mono">-₹{metrics.totalOutflow.toLocaleString()}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Payments &amp; Expenses</p>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'accounts'
                ? 'border-teal-600 text-teal-700 bg-white rounded-t-lg'
                : 'border-transparent text-[#70665F] hover:text-gray-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Bank &amp; Cash Accounts Table ({bankAccounts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cashflow')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'cashflow'
                ? 'border-teal-600 text-teal-700 bg-white rounded-t-lg'
                : 'border-transparent text-[#70665F] hover:text-gray-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Cash Flow Statement &amp; Breakdown</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'transactions'
                ? 'border-teal-600 text-teal-700 bg-white rounded-t-lg'
                : 'border-transparent text-[#70665F] hover:text-gray-900'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Bank &amp; Cash Transactions Ledger ({unifiedTransactions.length})</span>
          </button>
        </div>

        {activeTab === 'accounts' && (
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'table' ? 'bg-white shadow text-teal-700' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'cards' ? 'bg-white shadow text-teal-700' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: ACCOUNTS MASTER (TABLE / CARDS) */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-[#EBE3DB] shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Bank, A/c Number, IFSC, GL Code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 font-medium focus:outline-none"
              >
                <option value="all">All Account Types</option>
                <option value="Current">Current Account</option>
                <option value="Savings">Savings Account</option>
                <option value="Cash_Credit">Cash Credit (CC)</option>
                <option value="Overdraft">Overdraft (OD)</option>
                <option value="Cash">Cash Vault</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 font-medium focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Table View */}
          {viewMode === 'table' ? (
            <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-gray-200 text-[#70665F] uppercase font-bold tracking-wider">
                      <th className="py-3.5 px-4">GL Code</th>
                      <th className="py-3.5 px-4">Bank / Account Name</th>
                      <th className="py-3.5 px-4">Account Number</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">IFSC / Branch</th>
                      <th className="py-3.5 px-4 text-right">Opening Balance</th>
                      <th className="py-3.5 px-4 text-right">Current Ledger Balance</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAccounts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-gray-400">
                          <Landmark className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          No bank accounts or cash registers found.
                        </td>
                      </tr>
                    ) : (
                      filteredAccounts.map((b) => (
                        <tr key={b.id} className="hover:bg-teal-50/20 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-teal-700">
                            {b.glAccountCode || b.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-gray-900">{b.bankName}</div>
                            {b.accountName && b.accountName !== b.bankName && (
                              <div className="text-[11px] text-gray-500 truncate max-w-xs">{b.accountName}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-gray-800">{b.accountNumber}</span>
                              <button
                                onClick={() => handleCopy(b.accountNumber, b.id)}
                                className="text-gray-400 hover:text-teal-600"
                                title="Copy Account Number"
                              >
                                {copiedId === b.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                b.accountType === 'Cash'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : b.accountType === 'Cash_Credit' || b.accountType === 'Overdraft'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-teal-50 text-teal-700 border-teal-200'
                              }`}
                            >
                              {b.accountType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">
                            <div className="font-mono text-[11px]">{b.ifscCode || 'N/A'}</div>
                            <div className="text-[11px] text-gray-500 truncate max-w-xs">{b.branchName || b.branch || '-'}</div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-gray-600">
                            ₹{Number(b.openingBalance || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-teal-700 text-sm">
                            ₹{Number(b.currentBalance || b.openingBalance || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEditModal(b)}
                                className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                                title="Edit Account"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(b.id)}
                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAccounts.map((b) => (
                <div
                  key={b.id}
                  className="bg-white p-6 rounded-2xl border border-[#EBE3DB] space-y-4 hover:border-teal-300 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      GL Acc: {b.glAccountCode || b.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        b.accountType === 'Cash'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-teal-50 text-teal-700 border-teal-200'
                      }`}
                    >
                      {b.accountType}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#211B17]">{b.bankName}</h3>
                    {b.accountName && b.accountName !== b.bankName && (
                      <p className="text-xs text-gray-500 mt-0.5">{b.accountName}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1 font-mono text-xs text-gray-700">
                      <span>Acc: {b.accountNumber}</span>
                      <button
                        onClick={() => handleCopy(b.accountNumber, b.id)}
                        className="text-gray-400 hover:text-teal-600"
                      >
                        {copiedId === b.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-[#70665F] mt-1">
                      IFSC: <span className="font-mono">{b.ifscCode || 'N/A'}</span> • Branch: {b.branchName || b.branch || '-'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-[#EBE3DB] flex items-center justify-between">
                    <span className="text-xs text-[#70665F] font-semibold">Current Ledger Balance</span>
                    <span className="text-lg font-bold text-teal-700 font-mono">
                      ₹{Number(b.currentBalance || b.openingBalance || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#70665F] border-t border-[#EBE3DB] pt-3">
                    <span>Opening: ₹{Number(b.openingBalance || 0).toLocaleString()}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(b)}
                        className="p-1 text-gray-400 hover:text-teal-600 rounded"
                        title="Edit Account"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(b.id)}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded"
                        title="Delete Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CASH FLOW STATEMENT & BREAKDOWN */}
      {activeTab === 'cashflow' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Operating Inflows */}
            <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <h3 className="font-bold text-emerald-800 text-sm flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  Operating Cash Inflows
                </h3>
                <span className="text-xs font-bold font-mono text-emerald-700">
                  ₹{metrics.totalReceiptsInflow.toLocaleString()}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-700">
                  <span>Customer Sales Receipts:</span>
                  <span className="font-mono font-semibold">₹{metrics.totalReceiptsInflow.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Other Income / Rebates:</span>
                  <span className="font-mono font-semibold">₹0</span>
                </div>
              </div>
            </div>

            {/* Operating Outflows */}
            <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                <h3 className="font-bold text-rose-800 text-sm flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-rose-600" />
                  Operating Cash Outflows
                </h3>
                <span className="text-xs font-bold font-mono text-rose-700">
                  -₹{metrics.totalOutflow.toLocaleString()}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-700">
                  <span>Supplier / Vendor Payments:</span>
                  <span className="font-mono font-semibold">₹{metrics.totalPaymentsOutflow.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Operational &amp; Plant Expenses:</span>
                  <span className="font-mono font-semibold">₹{metrics.totalExpensesOutflow.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Net Cashflow Summary */}
            <div className="bg-teal-50 rounded-2xl border border-teal-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-teal-200 pb-3">
                  <h3 className="font-bold text-teal-900 text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                    Net Operating Cash Flow
                  </h3>
                  <span className={`text-xs font-bold font-mono ${metrics.netCashflow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {metrics.netCashflow >= 0 ? '+' : ''}₹{metrics.netCashflow.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-teal-800 mt-3">
                  Operating Inflows minus Vendor Payments &amp; General Expenses across all active bank and vault ledgers.
                </p>
              </div>

              <div className="pt-3 border-t border-teal-200 flex justify-between items-center text-xs">
                <span className="font-semibold text-teal-900">Total Liquid Treasury:</span>
                <span className="font-black font-mono text-base text-teal-900">₹{metrics.totalLiquidity.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Cashflow Breakdown by Bank Account Table */}
          <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Treasury Liquidity Allocation by Account</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-gray-200">
                <thead>
                  <tr className="bg-slate-50 text-gray-600 font-bold uppercase">
                    <th className="py-2.5 px-3">Account Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Opening (₹)</th>
                    <th className="py-2.5 px-3 text-right">Current Balance (₹)</th>
                    <th className="py-2.5 px-3 text-right">% of Liquidity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bankAccounts.map((b) => {
                    const balance = Number(b.currentBalance || b.openingBalance || 0);
                    const pct = metrics.totalLiquidity > 0 ? ((balance / metrics.totalLiquidity) * 100).toFixed(1) : '0';
                    return (
                      <tr key={b.id}>
                        <td className="py-2.5 px-3 font-semibold text-gray-900">{b.bankName}</td>
                        <td className="py-2.5 px-3 text-gray-600">{b.accountType}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-gray-600">₹{Number(b.openingBalance || 0).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-700">₹{balance.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-gray-700">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSACTIONS & RUNNING LEDGER */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-teal-600" />
              Live Cash &amp; Bank Ledger Transactions
            </h3>
            <span className="text-xs text-gray-500">Auto-synced with Receipts, Payments, Expenses &amp; Contra Vouchers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-100">
              <thead>
                <tr className="bg-slate-50 text-gray-600 font-bold uppercase">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Voucher / Ref</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Account Linked</th>
                  <th className="py-3 px-4 text-right">Inflow (₹)</th>
                  <th className="py-3 px-4 text-right">Outflow (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {unifiedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      No transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  unifiedTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-gray-600">{tx.date}</td>
                      <td className="py-3 px-4 font-mono font-bold text-teal-700">{tx.refNumber}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            tx.type === 'Receipt'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : tx.type === 'Payment'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : tx.type === 'Expense'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{tx.title}</td>
                      <td className="py-3 px-4 text-gray-600">{tx.account}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600">
                        {tx.inflow > 0 ? `+₹${tx.inflow.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-rose-600">
                        {tx.outflow > 0 ? `-₹${tx.outflow.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Bank Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Landmark className="w-5 h-5 text-teal-600" /> Register Bank Account / Cash Vault
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Bank / Institution Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC Bank Ltd"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Account Display Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Operations Current A/c"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Account Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50200088921045"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Account Type *</label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none font-medium"
                  >
                    <option value="Current">Current Account</option>
                    <option value="Savings">Savings Account</option>
                    <option value="Cash_Credit">Cash Credit (CC)</option>
                    <option value="Overdraft">Overdraft (OD)</option>
                    <option value="Cash">Cash Vault / Petty Cash</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">IFSC Code</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC0000123"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-mono uppercase focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">GL Account Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 1010"
                    value={glAccountCode}
                    onChange={(e) => setGlAccountCode(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Branch Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Makarpura GIDC, Vadodara"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Opening Balance (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Bank Account Modal */}
      {editingAccount && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-teal-600" /> Edit Bank Account ({editingAccount.id})
              </h3>
              <button onClick={() => setEditingAccount(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Bank / Institution Name</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Account Display Name</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Account Number</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Account Type</label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none font-medium"
                  >
                    <option value="Current">Current Account</option>
                    <option value="Savings">Savings Account</option>
                    <option value="Cash_Credit">Cash Credit (CC)</option>
                    <option value="Overdraft">Overdraft (OD)</option>
                    <option value="Cash">Cash Vault / Petty Cash</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-mono uppercase focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">GL Account Code</label>
                  <input
                    type="text"
                    value={glAccountCode}
                    onChange={(e) => setGlAccountCode(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Opening Balance (₹)</label>
                  <input
                    type="number"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Current Ledger Balance (₹)</label>
                  <input
                    type="number"
                    value={currentBalance}
                    onChange={(e) => setCurrentBalance(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Branch Name</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm"
                >
                  Update Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-gray-200">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-gray-600">
              Are you sure you want to delete bank account <strong className="text-gray-900">{deleteConfirmId}</strong>? This will remove it from the master list and treasury calculations.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteBankAccount(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-sm"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
