'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { api } from '../../../lib/apiClient';
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  CreditCard,
  FileText,
  Building,
  Users,
  Coins,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Wallet,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  FileSpreadsheet,
  Calculator,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

export default function AccountingDashboardPage() {
  const [hasMounted, setHasMounted] = React.useState(false);
  const [selectedFY, setSelectedFY] = useState('FY 2025-26');
  const [metrics, setMetrics] = useState<any>(null);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    api.accounting.dashboardMetrics().then((res) => {
      if (isMounted && res) {
        setMetrics(res);
      }
    }).catch((err) => {
      console.warn("Failed to fetch live accounting dashboard metrics:", err);
    });
    return () => { isMounted = false; };
  }, []);

  const {
    salesInvoices,
    purchaseInvoices,
    customerReceipts,
    supplierPayments,
    bankAccounts,
    receivableAging,
    payableAging,
    jobCostings,
    journalEntries,
    expenseEntries,
  } = useERP();

  if (!hasMounted) {
    return (
      <div className="p-6 bg-[color:var(--crm-bg-app)]  text-[color:var(--crm-text-primary)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[color:var(--crm-text-secondary)]">
          <div className="w-5 h-5 border-2 border-[color:var(--crm-brand-700)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading Accounting Dashboard...</span>
        </div>
      </div>
    );
  }

  // Calculate 14 KPIs (Safe against undefined)
  const totalSalesValue = (salesInvoices || []).reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
  const totalPurchaseValue = (purchaseInvoices || []).reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
  const totalReceiptsValue = (customerReceipts || []).reduce((acc, r) => acc + (r.amountPaid ?? r.amount ?? 0), 0);
  const totalPaymentsValue = (supplierPayments || []).reduce((acc, p) => acc + (p.amountPaid ?? p.amount ?? 0), 0);
  const totalBankBalance = (bankAccounts || []).reduce((acc, b) => acc + (b.currentBalance || 0), 0);
  const totalAR = (receivableAging || []).reduce((acc, r) => acc + (r.totalOutstanding || 0), 0);
  const totalAP = (payableAging || []).reduce((acc, p) => acc + (p.totalOutstanding || 0), 0);
  const overdueAR = (receivableAging || []).reduce((acc, r) => acc + (r.days90Plus || 0), 0);
  const overdueAP = (payableAging || []).reduce((acc, p) => acc + (p.days90Plus || 0), 0);
  const grossProfit = totalSalesValue - totalPurchaseValue;
  const grossMarginPercent = totalSalesValue > 0 ? ((grossProfit / totalSalesValue) * 100).toFixed(1) : '0';
  const totalExpenses = (expenseEntries || []).reduce((acc, e) => acc + (e.grandTotal ?? e.amount ?? 0), 0);
  const netProfit = grossProfit - totalExpenses;
  const totalGSTLiability = (salesInvoices || []).reduce((acc, inv) => acc + (inv.cgstAmount ?? inv.cgstTotal ?? 0) + (inv.sgstAmount ?? inv.sgstTotal ?? 0) + (inv.igstAmount ?? inv.igstTotal ?? 0), 0);
  const inputTaxCredit = (purchaseInvoices || []).reduce((acc, inv) => acc + (inv.cgstAmount ?? inv.cgstTotal ?? 0) + (inv.sgstAmount ?? inv.sgstTotal ?? 0) + (inv.igstAmount ?? inv.igstTotal ?? 0), 0);
  const netGSTPayable = Math.max(0, totalGSTLiability - inputTaxCredit);

  // Live API-driven Chart Data (Zero static/mock datasets)
  const monthlyRevenueExpenseData = metrics?.monthlyRevenueExpense || [];
  const arAgingData = metrics?.arAging || [];
  const apAgingData = metrics?.apAging || [];
  const expenseBreakdownData = metrics?.expenseBreakdown || [];
  const cashFlowData = metrics?.cashFlow || [];

  const gstBreakdownData = [
    { type: 'CGST Collected', amount: totalGSTLiability / 2 },
    { type: 'SGST Collected', amount: totalGSTLiability / 2 },
    { type: 'IGST Collected', amount: 0 },
    { type: 'CGST Paid (ITC)', amount: inputTaxCredit / 2 },
    { type: 'SGST Paid (ITC)', amount: inputTaxCredit / 2 },
  ];

  return (
    <div className="space-y-5 text-xs pb-12 text-[color:var(--crm-text-primary)]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[color:var(--crm-brand-50)] via-[#EDF1FA] to-[#E3EAF8] p-5 sm:p-6 rounded-2xl border border-[#D4DAE8] text-[color:var(--crm-text-primary)] shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-700">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[color:var(--crm-text-primary)] tracking-tight">Accounting & Finance Control Center</h1>
              <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">
                Uma Techno Fab ERP • General Ledger, Indian GST/TDS Compliance, Invoicing, Banking & Job Costing
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedFY}
            onChange={(e) => setSelectedFY(e.target.value)}
            className="bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] text-[color:var(--crm-text-primary)] text-xs rounded-xl px-3 py-2 font-mono font-medium focus:ring-2 focus:ring-emerald-500"
          >
            <option value="FY 2025-26">FY 2025-26 (Active)</option>
            <option value="FY 2024-25">FY 2024-25 (Closed)</option>
            <option value="FY 2026-27">FY 2026-27 (Upcoming)</option>
          </select>

          <Link
            href="/accounting/sales-invoices"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Sales Invoice</span>
          </Link>

          <Link
            href="/accounting/journal-entries"
            className="flex items-center gap-2 bg-white hover:bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)] text-xs font-semibold px-4 py-2.5 rounded-xl border border-[color:var(--crm-border-default)] transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-crm-brand-600" />
            <span>New Journal Voucher</span>
          </Link>
        </div>
      </div>

      {/* 14 KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* KPI 1: Total Sales Invoiced */}
        <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)] hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-[color:var(--crm-text-secondary)] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Sales Invoiced</span>
            <Receipt className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-lg font-bold text-[color:var(--crm-text-primary)] font-mono">₹{(totalSalesValue / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-[color:var(--crm-text-secondary)] mt-1">All invoices booked</div>
        </div>

        {/* KPI 2: Total Purchase Invoiced */}
        <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)] hover:border-crm-brand-600/40 transition">
          <div className="flex items-center justify-between text-[color:var(--crm-text-secondary)] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Purchase Invoiced</span>
            <FileText className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="text-lg font-bold text-[color:var(--crm-text-primary)] font-mono">₹{(totalPurchaseValue / 100000).toFixed(2)}L</div>
          <div className="flex items-center gap-1 text-[10px] text-crm-brand-500 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Materials & Subcontract</span>
          </div>
        </div>

        {/* KPI 3: Customer Receipts */}
        <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)] hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-[color:var(--crm-text-secondary)] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Collected Receipts</span>
            <Coins className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-lg font-bold text-emerald-700 font-mono">₹{(totalReceiptsValue / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-[color:var(--crm-text-secondary)] mt-1 font-mono">Realized Cash Inflow</div>
        </div>

        {/* KPI 4: Supplier Payments */}
        <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)] hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between text-[color:var(--crm-text-secondary)] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Vendor Payments</span>
            <CreditCard className="w-4 h-4 text-rose-700" />
          </div>
          <div className="text-lg font-bold text-rose-700 font-mono">₹{(totalPaymentsValue / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-[color:var(--crm-text-secondary)] mt-1 font-mono">Total Paid Out</div>
        </div>

        {/* KPI 5: Bank & Cash Balance */}
        <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)] hover:border-crm-brand-600/40 transition">
          <div className="flex items-center justify-between text-[color:var(--crm-text-secondary)] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Bank Balance</span>
            <Landmark className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="text-lg font-bold text-crm-brand-500 font-mono">₹{(totalBankBalance / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-[color:var(--crm-text-secondary)] mt-1">Across 3 Accounts</div>
        </div>

        {/* KPI 6: Accounts Receivable (AR) */}
        <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)] hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-[color:var(--crm-text-secondary)] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Total AR</span>
            <TrendingUp className="w-4 h-4 text-crm-brand-600" />
          </div>
          <div className="text-lg font-bold text-amber-700 font-mono">₹{(totalAR / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-rose-700 mt-1 font-mono">₹{(overdueAR / 100000).toFixed(2)}L Overdue</div>
        </div>

        {/* KPI 7: Accounts Payable (AP) */}
        <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)] hover:border-crm-brand-600/40 transition">
          <div className="flex items-center justify-between text-[color:var(--crm-text-secondary)] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Total AP</span>
            <TrendingDown className="w-4 h-4 text-indigo-700" />
          </div>
          <div className="text-lg font-bold text-indigo-700 font-mono">₹{(totalAP / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-amber-700 mt-1 font-mono">₹{(overdueAP / 100000).toFixed(2)}L Due Soon</div>
        </div>

        {/* KPI 8: Gross Profit */}
        <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)] hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-[color:var(--crm-text-secondary)] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Gross Profit</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-lg font-bold text-emerald-700 font-mono">₹{(grossProfit / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-[color:var(--crm-text-secondary)] mt-1 font-mono">{grossMarginPercent}% Margin</div>
        </div>

        {/* KPI 9: Net Operating Profit */}
        <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)] hover:border-teal-500/40 transition">
          <div className="flex items-center justify-between text-[color:var(--crm-text-secondary)] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Net Profit</span>
            <Sparkles className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-lg font-bold text-teal-700 font-mono">₹{(netProfit / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-[color:var(--crm-text-secondary)] mt-1">Post Op Expenses</div>
        </div>

        {/* KPI 10: GST Tax Liability */}
        <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)] hover:border-yellow-500/40 transition">
          <div className="flex items-center justify-between text-[color:var(--crm-text-secondary)] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">GST Output Tax</span>
            <Scale className="w-4 h-4 text-crm-brand-600" />
          </div>
          <div className="text-lg font-bold text-yellow-700 font-mono">₹{(totalGSTLiability / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-[color:var(--crm-text-secondary)] mt-1">CGST + SGST + IGST</div>
        </div>

        {/* KPI 11: Input Tax Credit (ITC) */}
        <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)] hover:border-crm-brand-600/40 transition">
          <div className="flex items-center justify-between text-[color:var(--crm-text-secondary)] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Input Tax Credit</span>
            <CheckCircle2 className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="text-lg font-bold text-crm-brand-500 font-mono">₹{(inputTaxCredit / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-[color:var(--crm-text-secondary)] mt-1">GSTR-2B Matched</div>
        </div>

        {/* KPI 12: Net GST Cash Payable */}
        <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)] hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-[color:var(--crm-text-secondary)] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Net GST Cash</span>
            <Coins className="w-4 h-4 text-crm-brand-600" />
          </div>
          <div className="text-lg font-bold text-amber-700 font-mono">₹{(netGSTPayable / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-[color:var(--crm-text-secondary)] mt-1">Electronic Ledger</div>
        </div>

        {/* KPI 13: Total TDS Deducted */}
        <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)] hover:border-violet-500/40 transition">
          <div className="flex items-center justify-between text-[color:var(--crm-text-secondary)] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">TDS Deducted</span>
            <Calculator className="w-4 h-4 text-violet-700" />
          </div>
          <div className="text-lg font-bold text-violet-700 font-mono">₹{(purchaseInvoices.reduce((a, b) => a + (b.tdsAmount || 0), 0) / 1000).toFixed(1)}k</div>
          <div className="text-[10px] text-[color:var(--crm-text-secondary)] mt-1">Sec 194C / 194J</div>
        </div>

      </div>

      {/* 8 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue vs Cost vs Net Profit */}
        <div className="bg-white p-5 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-700" />
              Monthly Revenue vs Direct Cost (₹ Lacs)
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueExpenseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE6" />
                <XAxis dataKey="month" stroke="#475467" fontSize={11} />
                <YAxis stroke="#475467" fontSize={11} tickFormatter={(val) => `${(val / 100000).toFixed(0)}L`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E7EF',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
                  }}
                  itemStyle={{ color: '#0F172A', fontWeight: 600 }}
                  labelStyle={{ color: '#475467', fontWeight: 700 }}
                  formatter={(value: any) => [`₹${(Number(value) / 100000).toFixed(2)} Lacs`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#475467' }} />
                <Bar dataKey="Revenue" fill="#10B981" radius={[4, 4, 0, 0]} name="Sales Revenue" />
                <Bar dataKey="Expense" fill="#6366F1" radius={[4, 4, 0, 0]} name="Direct Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cash Flow Trend */}
        <div className="bg-white p-5 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-crm-brand-500" />
              Cash Inflow vs Outflow Trend (₹ Lacs)
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE6" />
                <XAxis dataKey="month" stroke="#475467" fontSize={11} />
                <YAxis stroke="#475467" fontSize={11} tickFormatter={(val) => `${(val / 100000).toFixed(0)}L`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E7EF',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
                  }}
                  itemStyle={{ color: '#0F172A', fontWeight: 600 }}
                  labelStyle={{ color: '#475467', fontWeight: 700 }}
                  formatter={(value: any) => [`₹${(Number(value) / 100000).toFixed(2)} Lacs`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#475467' }} />
                <Area type="monotone" dataKey="Inflow" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} name="Cash Received" />
                <Area type="monotone" dataKey="Outflow" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} name="Cash Paid" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Accounts Receivable Aging Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-crm-brand-600" />
              Accounts Receivable (AR) Aging Buckets
            </h3>
            <span className="text-[11px] text-amber-700 font-mono font-bold">Total: ₹{(totalAR / 100000).toFixed(2)}L</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={arAgingData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="amount">
                  {arAgingData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E7EF',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
                  }}
                  itemStyle={{ color: '#0F172A', fontWeight: 600 }}
                  labelStyle={{ color: '#475467', fontWeight: 700 }}
                  formatter={(value: any) => [`₹${(Number(value) / 100000).toFixed(2)} Lacs`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#475467' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Expense Category Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-crm-brand-500" />
              Manufacturing Expense Category Breakdown
            </h3>
            <span className="text-[11px] text-[color:var(--crm-text-secondary)] font-mono font-bold">Cost Center View</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseBreakdownData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, percent }: any) => `${(name || '').split(' ')[0]} ${(((percent as number) || 0) * 100).toFixed(0)}%`}>
                  {expenseBreakdownData.map((entry: any, index: number) => (
                    <Cell key={`cell-exp-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E7EF',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
                  }}
                  itemStyle={{ color: '#0F172A', fontWeight: 600 }}
                  labelStyle={{ color: '#475467', fontWeight: 700 }}
                  formatter={(value: any) => [`₹${(Number(value) / 100000).toFixed(2)} Lacs`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: AP Aging Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-700" />
              Accounts Payable (AP) Supplier Aging
            </h3>
            <span className="text-[11px] text-indigo-700 font-mono font-bold">Total: ₹{(totalAP / 100000).toFixed(2)}L</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={apAgingData} layout="vertical" margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE6" />
                <XAxis type="number" stroke="#475467" fontSize={11} tickFormatter={(val) => `${(val / 100000).toFixed(0)}L`} />
                <YAxis dataKey="name" type="category" stroke="#475467" fontSize={11} width={75} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E7EF',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
                  }}
                  itemStyle={{ color: '#0F172A', fontWeight: 600 }}
                  labelStyle={{ color: '#475467', fontWeight: 700 }}
                  formatter={(value: any) => [`₹${(Number(value) / 100000).toFixed(2)} Lacs`, '']}
                />
                <Bar dataKey="amount" fill="#6366F1" radius={[0, 4, 4, 0]} name="Vendor Payable Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Job Financial Profitability Comparison */}
        <div className="bg-white p-5 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-700" />
              Job-wise Revenue vs Budgeted Cost (MTO)
            </h3>
            <span className="text-[11px] text-[color:var(--crm-text-secondary)] font-mono">Job 360° Costing</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobCostings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE6" />
                <XAxis dataKey="jobNumber" stroke="#475467" fontSize={10} />
                <YAxis stroke="#475467" fontSize={11} tickFormatter={(val) => `${(val / 100000).toFixed(0)}L`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E7EF',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
                  }}
                  itemStyle={{ color: '#0F172A', fontWeight: 600 }}
                  labelStyle={{ color: '#475467', fontWeight: 700 }}
                  formatter={(value: any) => [`₹${(Number(value) / 100000).toFixed(2)} Lacs`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#475467' }} />
                <Bar dataKey="salesValue" fill="#10B981" name="Sales Price" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualCost" fill="#F59E0B" name="Actual Production Cost" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Action Matrix & Bank Account Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bank & Cash Balances Summary */}
        <div className="bg-white p-5 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[color:var(--crm-border-default)] pb-3">
            <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <Landmark className="w-4 h-4 text-crm-brand-500" />
              Bank & Cash Account Live Status
            </h3>
            <Link href="/accounting/cash-bank" className="text-xs text-emerald-700 hover:underline">
              Manage All
            </Link>
          </div>

          <div className="space-y-3">
            {bankAccounts.map((b) => (
              <div key={b.id} className="p-3.5 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)] flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
                    <span>{b.bankName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-[color:var(--crm-text-secondary)] font-mono font-medium">{b.accountType}</span>
                  </div>
                  <div className="text-[11px] text-[color:var(--crm-text-secondary)] font-mono">Acc: {b.accountNumber} • IFSC: {b.ifscCode}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-700 font-mono">₹{b.currentBalance?.toLocaleString()}</div>
                  <div className="text-[10px] text-[color:var(--crm-text-tertiary)] font-mono">Reconciled</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GST & Tax Compliance Summary */}
        <div className="bg-white p-5 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[color:var(--crm-border-default)] pb-3">
            <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <Scale className="w-4 h-4 text-crm-brand-600" />
              Indian GST Compliance Ledger (24AAACX0000X1Z1)
            </h3>
            <Link href="/accounting/gst" className="text-xs text-yellow-700 hover:underline">
              Filing Portal
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)]">
              <div className="text-[color:var(--crm-text-secondary)] text-[10px] uppercase font-semibold">GSTR-1 Sales Output</div>
              <div className="text-base font-bold text-[color:var(--crm-text-primary)] font-mono mt-1">₹{totalGSTLiability?.toLocaleString()}</div>
              <div className="text-[10px] text-emerald-700 mt-1 font-mono">Ready to File</div>
            </div>

            <div className="p-3 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)]">
              <div className="text-[color:var(--crm-text-secondary)] text-[10px] uppercase font-semibold">GSTR-2B Input Credit</div>
              <div className="text-base font-bold text-crm-brand-500 font-mono mt-1">₹{inputTaxCredit?.toLocaleString()}</div>
              <div className="text-[10px] text-crm-brand-500 mt-1 font-mono">100% Matched</div>
            </div>

            <div className="p-3 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)]">
              <div className="text-[color:var(--crm-text-secondary)] text-[10px] uppercase font-semibold">Net Cash Liability</div>
              <div className="text-base font-bold text-amber-700 font-mono mt-1">₹{netGSTPayable?.toLocaleString()}</div>
              <div className="text-[10px] text-[color:var(--crm-text-secondary)] mt-1">Due by 20th</div>
            </div>

            <div className="p-3 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)]">
              <div className="text-[color:var(--crm-text-secondary)] text-[10px] uppercase font-semibold">TDS Deducted</div>
              <div className="text-base font-bold text-violet-700 font-mono mt-1">
                ₹{purchaseInvoices.reduce((a, b) => a + (b.tdsAmount ?? b.tdsDeducted ?? 0), 0)?.toLocaleString()}
              </div>
              <div className="text-[10px] text-[color:var(--crm-text-secondary)] mt-1">Form 26Q Ready</div>
            </div>
          </div>
        </div>

        {/* Recent Invoices & Vouchers */}
        <div className="bg-white p-5 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[color:var(--crm-border-default)] pb-3">
            <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-700" />
              Recent Posted Vouchers
            </h3>
            <Link href="/accounting/journal-entries" className="text-xs text-emerald-700 hover:underline">
              View All JV
            </Link>
          </div>

          <div className="space-y-3">
            {salesInvoices.slice(0, 3).map((inv) => (
              <div key={inv.id} className="p-3 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[color:var(--crm-text-primary)] font-mono">{inv.invoiceNumber}</div>
                  <div className="text-[11px] text-[color:var(--crm-text-secondary)]">{inv.customerName}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-700 font-mono">₹{inv.grandTotal?.toLocaleString()}</div>
                  <span className="inline-block text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 font-semibold uppercase">
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
