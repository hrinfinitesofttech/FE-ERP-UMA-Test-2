'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
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

  React.useEffect(() => {
    setHasMounted(true);
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

  const [selectedFY, setSelectedFY] = useState('FY 2025-26');

  if (!hasMounted) {
    return (
      <div className="p-6 bg-[#FAF7F2]  text-[#211B17] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#70665F]">
          <div className="w-5 h-5 border-2 border-[#75401F] border-t-transparent rounded-full animate-spin" />
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

  // Recharts Mock Data
  const monthlyRevenueExpenseData = [
    { month: 'Apr', Revenue: 14500000, Expense: 9800000, Profit: 4700000 },
    { month: 'May', Revenue: 16800000, Expense: 11200000, Profit: 5600000 },
    { month: 'Jun', Revenue: 18200000, Expense: 12400000, Profit: 5800000 },
    { month: 'Jul', Revenue: 15900000, Expense: 10500000, Profit: 5400000 },
    { month: 'Aug', Revenue: 21000000, Expense: 13800000, Profit: 7200000 },
    { month: 'Sep', Revenue: 24500000, Expense: 15600000, Profit: 8900000 },
  ];

  const arAgingData = [
    { name: '0-30 Days', amount: 14200000, color: '#10B981' },
    { name: '31-60 Days', amount: 8500000, color: '#3B82F6' },
    { name: '61-90 Days', amount: 4100000, color: '#F59E0B' },
    { name: '90+ Days', amount: 2800000, color: '#EF4444' },
  ];

  const apAgingData = [
    { name: '0-30 Days', amount: 9400000, color: '#10B981' },
    { name: '31-60 Days', amount: 5200000, color: '#3B82F6' },
    { name: '61-90 Days', amount: 2100000, color: '#F59E0B' },
    { name: '90+ Days', amount: 1100000, color: '#EF4444' },
  ];

  const expenseBreakdownData = [
    { name: 'Raw Material & Components', value: 42500000, color: '#3B82F6' },
    { name: 'Direct Labour & Subcontract', value: 14800000, color: '#10B981' },
    { name: 'Power & Fuel', value: 5200000, color: '#F59E0B' },
    { name: 'Factory Overheads', value: 3900000, color: '#8B5CF6' },
    { name: 'Admin & Logistics', value: 2400000, color: '#EC4899' },
  ];

  const cashFlowData = [
    { month: 'Apr', Inflow: 13800000, Outflow: 10200000, NetBalance: 3600000 },
    { month: 'May', Inflow: 15900000, Outflow: 11800000, NetBalance: 4100000 },
    { month: 'Jun', Inflow: 17400000, Outflow: 12900000, NetBalance: 4500000 },
    { month: 'Jul', Inflow: 16200000, Outflow: 11100000, NetBalance: 5100000 },
    { month: 'Aug', Inflow: 20500000, Outflow: 14200000, NetBalance: 6300000 },
    { month: 'Sep', Inflow: 23800000, Outflow: 16100000, NetBalance: 7700000 },
  ];

  const gstBreakdownData = [
    { type: 'CGST Collected', amount: totalGSTLiability / 2 },
    { type: 'SGST Collected', amount: totalGSTLiability / 2 },
    { type: 'IGST Collected', amount: 0 },
    { type: 'CGST Paid (ITC)', amount: inputTaxCredit / 2 },
    { type: 'SGST Paid (ITC)', amount: inputTaxCredit / 2 },
  ];

  return (
    <div className="space-y-5 text-xs pb-12 text-[#211B17]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#FAF3EA] via-[#F8EDE0] to-[#F1DFC9] p-5 sm:p-6 rounded-2xl border border-[#E9DFD3] text-[#211B17] shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#211B17] tracking-tight">Accounting & Finance Control Center</h1>
              <p className="text-xs text-[#70665F] mt-0.5">
                Uma Techno Fab ERP • General Ledger, Indian GST/TDS Compliance, Invoicing, Banking & Job Costing
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedFY}
            onChange={(e) => setSelectedFY(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EBE3DB] text-[#3E2723] text-xs rounded-xl px-3 py-2 font-mono font-medium focus:ring-2 focus:ring-emerald-500"
          >
            <option value="FY 2025-26">FY 2025-26 (Active)</option>
            <option value="FY 2024-25">FY 2024-25 (Closed)</option>
            <option value="FY 2026-27">FY 2026-27 (Upcoming)</option>
          </select>

          <Link
            href="/accounting/sales-invoices"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Sales Invoice</span>
          </Link>

          <Link
            href="/accounting/journal-entries"
            className="flex items-center gap-2 bg-white hover:bg-[#FAF7F2] text-[#3E2723] text-xs font-semibold px-4 py-2.5 rounded-xl border border-[#EBE3DB] transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>New Journal Voucher</span>
          </Link>
        </div>
      </div>

      {/* 14 KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* KPI 1: Total Sales Invoiced */}
        <div className="bg-white p-4 rounded-xl border border-[#E7DED5] hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Sales Invoiced</span>
            <Receipt className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-[#211B17] font-mono">₹{(totalSalesValue / 100000).toFixed(2)}L</div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+14.2% vs last month</span>
          </div>
        </div>

        {/* KPI 2: Total Purchase Invoiced */}
        <div className="bg-white p-4 rounded-xl border border-[#E7DED5] hover:border-crm-brand-600/40 transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Purchase Invoiced</span>
            <FileText className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="text-lg font-bold text-[#211B17] font-mono">₹{(totalPurchaseValue / 100000).toFixed(2)}L</div>
          <div className="flex items-center gap-1 text-[10px] text-crm-brand-500 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Materials & Subcontract</span>
          </div>
        </div>

        {/* KPI 3: Customer Receipts */}
        <div className="bg-white p-4 rounded-xl border border-[#E7DED5] hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Collected Receipts</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">₹{(totalReceiptsValue / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-[#70665F] mt-1 font-mono">Realized Cash Inflow</div>
        </div>

        {/* KPI 4: Supplier Payments */}
        <div className="bg-white p-4 rounded-xl border border-[#E7DED5] hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Vendor Payments</span>
            <CreditCard className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg font-bold text-rose-400 font-mono">₹{(totalPaymentsValue / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-[#70665F] mt-1 font-mono">Total Paid Out</div>
        </div>

        {/* KPI 5: Bank & Cash Balance */}
        <div className="bg-white p-4 rounded-xl border border-[#E7DED5] hover:border-crm-brand-600/40 transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Bank Balance</span>
            <Landmark className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="text-lg font-bold text-crm-brand-500 font-mono">₹{(totalBankBalance / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-[#70665F] mt-1">Across 3 Accounts</div>
        </div>

        {/* KPI 6: Accounts Receivable (AR) */}
        <div className="bg-white p-4 rounded-xl border border-[#E7DED5] hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Total AR</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-400 font-mono">₹{(totalAR / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-rose-400 mt-1 font-mono">₹{(overdueAR / 100000).toFixed(2)}L Overdue</div>
        </div>

        {/* KPI 7: Accounts Payable (AP) */}
        <div className="bg-white p-4 rounded-xl border border-[#E7DED5] hover:border-crm-brand-600/40 transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Total AP</span>
            <TrendingDown className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-indigo-400 font-mono">₹{(totalAP / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-amber-400 mt-1 font-mono">₹{(overdueAP / 100000).toFixed(2)}L Due Soon</div>
        </div>

        {/* KPI 8: Gross Profit */}
        <div className="bg-white p-4 rounded-xl border border-[#E7DED5] hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Gross Profit</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">₹{(grossProfit / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-[#70665F] mt-1 font-mono">{grossMarginPercent}% Margin</div>
        </div>

        {/* KPI 9: Net Operating Profit */}
        <div className="bg-white p-4 rounded-xl border border-[#E7DED5] hover:border-teal-500/40 transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Net Profit</span>
            <Sparkles className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-lg font-bold text-teal-400 font-mono">₹{(netProfit / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-[#70665F] mt-1">Post Op Expenses</div>
        </div>

        {/* KPI 10: GST Tax Liability */}
        <div className="bg-white p-4 rounded-xl border border-[#E7DED5] hover:border-yellow-500/40 transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">GST Output Tax</span>
            <Scale className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-lg font-bold text-yellow-400 font-mono">₹{(totalGSTLiability / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-[#70665F] mt-1">CGST + SGST + IGST</div>
        </div>

        {/* KPI 11: Input Tax Credit (ITC) */}
        <div className="bg-white p-4 rounded-xl border border-[#E7DED5] hover:border-crm-brand-600/40 transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Input Tax Credit</span>
            <CheckCircle2 className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="text-lg font-bold text-crm-brand-500 font-mono">₹{(inputTaxCredit / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-[#70665F] mt-1">GSTR-2B Matched</div>
        </div>

        {/* KPI 12: Net GST Cash Payable */}
        <div className="bg-white p-4 rounded-xl border border-[#E7DED5] hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Net GST Cash</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-400 font-mono">₹{(netGSTPayable / 100000).toFixed(2)}L</div>
          <div className="text-[10px] text-[#70665F] mt-1">Electronic Ledger</div>
        </div>

        {/* KPI 13: Total TDS Deducted */}
        <div className="bg-white p-4 rounded-xl border border-[#E7DED5] hover:border-violet-500/40 transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">TDS Deducted</span>
            <Calculator className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-lg font-bold text-violet-400 font-mono">₹{(purchaseInvoices.reduce((a, b) => a + (b.tdsAmount || 0), 0) / 1000).toFixed(1)}k</div>
          <div className="text-[10px] text-[#70665F] mt-1">Sec 194C / 194J</div>
        </div>

        {/* KPI 14: Job Margin Average */}
        <div className="bg-white p-4 rounded-xl border border-[#E7DED5] hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-[#70665F] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Job Margin Avg</span>
            <Briefcase className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">31.4%</div>
          <div className="text-[10px] text-[#70665F] mt-1">Across Active Jobs</div>
        </div>
      </div>

      {/* 8 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue vs Cost vs Net Profit */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7DED5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Monthly Revenue vs Direct Cost (₹ Lacs)
            </h3>
            <span className="text-[11px] text-[#70665F] font-mono">Apr 2025 - Sep 2025</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueExpenseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `${(val / 100000).toFixed(0)}L`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: any) => [`₹${(Number(value) / 100000).toFixed(2)} Lacs`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Revenue" fill="#10B981" radius={[4, 4, 0, 0]} name="Sales Revenue" />
                <Bar dataKey="Expense" fill="#6366F1" radius={[4, 4, 0, 0]} name="Direct Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cash Flow Trend */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7DED5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-crm-brand-500" />
              Cash Inflow vs Outflow Trend (₹ Lacs)
            </h3>
            <span className="text-[11px] text-[#70665F] font-mono">Net Liquidity Surge</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `${(val / 100000).toFixed(0)}L`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: any) => [`₹${(Number(value) / 100000).toFixed(2)} Lacs`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="Inflow" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} name="Cash Received" />
                <Area type="monotone" dataKey="Outflow" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} name="Cash Paid" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Accounts Receivable Aging Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7DED5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Accounts Receivable (AR) Aging Buckets
            </h3>
            <span className="text-[11px] text-amber-400 font-mono font-bold">Total: ₹{(totalAR / 100000).toFixed(2)}L</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={arAgingData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="amount">
                  {arAgingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: any) => [`₹${(Number(value) / 100000).toFixed(2)} Lacs`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Expense Category Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7DED5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-crm-brand-500" />
              Manufacturing Expense Category Breakdown
            </h3>
            <span className="text-[11px] text-[#70665F] font-mono font-bold">Cost Center View</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseBreakdownData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, percent }) => `${name.split(' ')[0]} ${((percent || 0) * 100).toFixed(0)}%`}>
                  {expenseBreakdownData.map((entry, index) => (
                    <Cell key={`cell-exp-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: any) => [`₹${(Number(value) / 100000).toFixed(2)} Lacs`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: AP Aging Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7DED5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-400" />
              Accounts Payable (AP) Supplier Aging
            </h3>
            <span className="text-[11px] text-indigo-400 font-mono font-bold">Total: ₹{(totalAP / 100000).toFixed(2)}L</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={apAgingData} layout="vertical" margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" stroke="#64748B" fontSize={11} tickFormatter={(val) => `${(val / 100000).toFixed(0)}L`} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} width={75} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: any) => [`₹${(Number(value) / 100000).toFixed(2)} Lacs`, '']}
                />
                <Bar dataKey="amount" fill="#6366F1" radius={[0, 4, 4, 0]} name="Vendor Payable Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Job Financial Profitability Comparison */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7DED5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              Job-wise Revenue vs Budgeted Cost (MTO)
            </h3>
            <span className="text-[11px] text-[#70665F] font-mono">Job 360° Costing</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobCostings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="jobNumber" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `${(val / 100000).toFixed(0)}L`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: any) => [`₹${(Number(value) / 100000).toFixed(2)} Lacs`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
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
        <div className="bg-white p-5 rounded-2xl border border-[#E7DED5] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E7DED5] pb-3">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <Landmark className="w-4 h-4 text-crm-brand-500" />
              Bank & Cash Account Live Status
            </h3>
            <Link href="/accounting/cash-bank" className="text-xs text-emerald-400 hover:underline">
              Manage All
            </Link>
          </div>

          <div className="space-y-3">
            {bankAccounts.map((b) => (
              <div key={b.id} className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E7DED5] flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[#211B17] flex items-center gap-2">
                    <span>{b.bankName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-[#544B45] font-mono font-medium">{b.accountType}</span>
                  </div>
                  <div className="text-[11px] text-[#70665F] font-mono">Acc: {b.accountNumber} • IFSC: {b.ifscCode}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400 font-mono">₹{b.currentBalance?.toLocaleString()}</div>
                  <div className="text-[10px] text-[#8D827A] font-mono">Reconciled</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GST & Tax Compliance Summary */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7DED5] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E7DED5] pb-3">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <Scale className="w-4 h-4 text-yellow-400" />
              Indian GST Compliance Ledger (24AAACX0000X1Z1)
            </h3>
            <Link href="/accounting/gst" className="text-xs text-yellow-400 hover:underline">
              Filing Portal
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E7DED5]">
              <div className="text-[#70665F] text-[10px] uppercase font-semibold">GSTR-1 Sales Output</div>
              <div className="text-base font-bold text-[#211B17] font-mono mt-1">₹{totalGSTLiability?.toLocaleString()}</div>
              <div className="text-[10px] text-emerald-400 mt-1 font-mono">Ready to File</div>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E7DED5]">
              <div className="text-[#70665F] text-[10px] uppercase font-semibold">GSTR-2B Input Credit</div>
              <div className="text-base font-bold text-crm-brand-500 font-mono mt-1">₹{inputTaxCredit?.toLocaleString()}</div>
              <div className="text-[10px] text-crm-brand-500 mt-1 font-mono">100% Matched</div>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E7DED5]">
              <div className="text-[#70665F] text-[10px] uppercase font-semibold">Net Cash Liability</div>
              <div className="text-base font-bold text-amber-400 font-mono mt-1">₹{netGSTPayable?.toLocaleString()}</div>
              <div className="text-[10px] text-[#70665F] mt-1">Due by 20th</div>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E7DED5]">
              <div className="text-[#70665F] text-[10px] uppercase font-semibold">TDS Deducted</div>
              <div className="text-base font-bold text-violet-400 font-mono mt-1">
                ₹{purchaseInvoices.reduce((a, b) => a + (b.tdsAmount ?? b.tdsDeducted ?? 0), 0)?.toLocaleString()}
              </div>
              <div className="text-[10px] text-[#70665F] mt-1">Form 26Q Ready</div>
            </div>
          </div>
        </div>

        {/* Recent Invoices & Vouchers */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7DED5] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E7DED5] pb-3">
            <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Recent Posted Vouchers
            </h3>
            <Link href="/accounting/journal-entries" className="text-xs text-emerald-400 hover:underline">
              View All JV
            </Link>
          </div>

          <div className="space-y-3">
            {salesInvoices.slice(0, 3).map((inv) => (
              <div key={inv.id} className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E7DED5] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#211B17] font-mono">{inv.invoiceNumber}</div>
                  <div className="text-[11px] text-[#70665F]">{inv.customerName}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400 font-mono">₹{inv.grandTotal?.toLocaleString()}</div>
                  <span className="inline-block text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase">
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
