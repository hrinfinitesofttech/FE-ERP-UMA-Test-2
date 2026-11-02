'use client';

import React, { useState, useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Layers,
  Package,
  Building,
  Factory,
  Receipt,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  DollarSign,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  UserCheck,
  FileText,
  Truck,
} from 'lucide-react';

export default function ManagementDashboardPage() {
  const {
    activeRoleView,
    setActiveRoleView,
    customers,
    salesOrders,
    jobs,
    employees,
    centralAlerts,
    quotations,
    purchaseOrders,
    purchaseRequisitions,
    serviceRequests,
    salesInvoices,
    purchaseInvoices,
    dispatchOrders,
    workOrders,
  } = useERP();
  const [dateRange, setDateRange] = useState<string>('This Month');

  const rolesList = [
    'Super Admin',
    'CRM Manager',
    'Project Manager',
    'Purchase Manager',
    'Store Manager',
    'Production Manager',
    'Accounts Manager',
    'HR Manager',
    'Maintenance Manager',
  ];

  const kpis = useMemo(() => {
    const totalCustomers = customers?.length || 0;
    const totalJobs = jobs?.length || 0;
    const activeJobs = jobs?.filter((j: any) => j.status !== 'Delivered' && j.status !== 'Cancelled')?.length || 0;
    const pendingQuotations = quotations?.filter((q: any) => q.status === 'Draft' || q.status === 'Pending_Approval')?.length || 0;
    const confirmedOrders = salesOrders?.filter((s: any) => s.status === 'Confirmed' || s.status === 'Approved')?.length || 0;
    const pendingPurchase = purchaseRequisitions?.filter((p: any) => p.status === 'Pending' || p.status === 'Draft')?.length || 0;
    const activeWorkOrders = workOrders?.filter((w: any) => w.status !== 'Completed' && w.status !== 'Cancelled')?.length || 0;
    const pendingDispatch = dispatchOrders?.filter((d: any) => d.status === 'Draft' || d.status === 'Pending')?.length || 0;
    const totalEmployees = employees?.length || 0;
    const openServiceRequests = serviceRequests?.filter((s: any) => s.status !== 'Closed' && s.status !== 'Resolved')?.length || 0;

    const totalReceivables = (salesInvoices || [])
      .filter((inv: any) => inv.paymentStatus !== 'Paid')
      .reduce((sum: number, inv: any) => sum + (Number(inv.balanceAmount || inv.totalAmount) || 0), 0);

    const totalPayables = (purchaseInvoices || [])
      .filter((inv: any) => inv.paymentStatus !== 'Paid')
      .reduce((sum: number, inv: any) => sum + (Number(inv.balanceAmount || inv.totalAmount) || 0), 0);

    const monthlyRevenue = (salesInvoices || [])
      .reduce((sum: number, inv: any) => sum + (Number(inv.totalAmount) || 0), 0);

    return [
      { label: 'Total Customers', value: String(totalCustomers), change: 'Registered Clients', color: 'text-crm-brand-500' },
      { label: 'Active Projects / Jobs', value: String(activeJobs), change: `${totalJobs} Total Jobs`, color: 'text-crm-brand-500' },
      { label: 'Active Jobs', value: String(activeJobs), change: 'In Production Pipeline', color: 'text-amber-700' },
      { label: 'Pending Quotations', value: String(pendingQuotations), change: 'Awaiting Client Review', color: 'text-crm-brand-500' },
      { label: 'Confirmed Orders', value: String(confirmedOrders), change: `${salesOrders?.length || 0} Total Orders`, color: 'text-emerald-700' },
      { label: 'Pending Purchase PRs', value: String(pendingPurchase), change: `${purchaseOrders?.length || 0} Active POs`, color: 'text-rose-700' },
      { label: 'Production Work Orders', value: `${activeWorkOrders} WOs`, change: 'Shopfloor active', color: 'text-orange-700' },
      { label: 'WIP Jobs', value: `${activeJobs} Jobs`, change: 'In Fabrication', color: 'text-yellow-700' },
      { label: 'Completed Jobs', value: String(jobs?.filter((j: any) => j.status === 'Delivered' || j.status === 'Completed')?.length || 0), change: 'Delivered', color: 'text-green-700' },
      { label: 'Pending Dispatch', value: `${pendingDispatch} Units`, change: 'Logistics Ready', color: 'text-indigo-700' },
      { label: 'Outstanding Receivables', value: `₹${(totalReceivables / 100000).toFixed(2)} L`, change: 'Invoice Balances', color: 'text-rose-700' },
      { label: 'Outstanding Payables', value: `₹${(totalPayables / 100000).toFixed(2)} L`, change: 'Vendor Invoices', color: 'text-crm-brand-500' },
      { label: 'Total Sales Revenue', value: `₹${(monthlyRevenue / 100000).toFixed(2)} L`, change: 'Booked Turnover', color: 'text-emerald-700' },
      { label: 'Active Purchase Orders', value: String(purchaseOrders?.length || 0), change: 'Procurement Pipeline', color: 'text-amber-700' },
      { label: 'Total Employees', value: String(totalEmployees), change: 'Active Staff', color: 'text-pink-700' },
      { label: 'Open Service Requests', value: `${openServiceRequests} Requests`, change: 'Support Queue', color: 'text-red-700' },
      { label: 'System Alerts', value: String(centralAlerts?.length || 0), change: 'Live Notifications', color: 'text-teal-700' },
    ];
  }, [
    customers, salesOrders, jobs, employees, centralAlerts, quotations, purchaseOrders,
    purchaseRequisitions, serviceRequests, salesInvoices, purchaseInvoices, dispatchOrders, workOrders
  ]);

  const fmtInr = (n: number) => (n > 0 ? `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '₹0');
  const num = (v: any) => Number(v) || 0;

  const analytics = useMemo(() => {
    const quoteValue = (quotations || []).reduce((s: number, q: any) => s + num(q.grandTotal ?? q.totalAmount), 0);
    const soList = (salesOrders || []).filter((s: any) => s.status !== 'cancelled' && s.status !== 'draft');
    const soValue = soList.reduce((s: number, o: any) => s + num(o.orderValue ?? o.grandTotal), 0);
    const poValue = (purchaseOrders || []).reduce((s: number, p: any) => s + num(p.grandTotal), 0);
    const bySupplier = new Map<string, number>();
    (purchaseOrders || []).forEach((p: any) => bySupplier.set(p.supplierName || '—', (bySupplier.get(p.supplierName || '—') || 0) + num(p.grandTotal)));
    const top = Array.from(bySupplier.entries()).sort((a, b) => b[1] - a[1])[0];
    const sales = (salesInvoices || []) as any[];
    return {
      quoteCount: (quotations || []).length,
      quoteValue,
      soCount: soList.length,
      soValue,
      poCount: (purchaseOrders || []).length,
      poValue,
      pendingPr: (purchaseRequisitions || []).filter((p: any) => ['Pending', 'Draft', 'pending_approval', 'draft'].includes(p.status)).length,
      topSupplier: top ? { name: top[0], value: top[1] } : null,
      woTotal: (workOrders || []).length,
      woActive: (workOrders || []).filter((w: any) => !['Completed', 'Cancelled', 'Draft'].includes(w.status)).length,
      woDone: (workOrders || []).filter((w: any) => w.status === 'Completed').length,
      pendingDispatch: (dispatchOrders || []).filter((d: any) => ['Draft', 'Pending', 'Ready for Dispatch'].includes(d.status)).length,
      billed: sales.reduce((s, i) => s + num(i.grandTotal ?? i.totalAmount), 0),
      received: sales.reduce((s, i) => s + num(i.paidAmount), 0),
      vendorBills: (purchaseInvoices || []).reduce((s: number, i: any) => s + num(i.grandTotal ?? i.totalAmount), 0),
    };
  }, [quotations, salesOrders, purchaseOrders, purchaseRequisitions, workOrders, dispatchOrders, salesInvoices, purchaseInvoices]);

  return (
    <div className="p-6 space-y-6 bg-[color:var(--crm-bg-app)]  text-[color:var(--crm-text-secondary)] font-sans">
      {/* Top Header & Role View Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[color:var(--crm-border-default)] shadow-xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-crm-brand-600/10 border border-crm-brand-600/20 rounded-xl text-indigo-700">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[color:var(--crm-text-primary)] tracking-tight">Executive Management Dashboard</h1>
              <p className="text-xs text-[color:var(--crm-text-secondary)] font-medium mt-0.5">
                Central Strategic & Financial Command Center • Uma Techno Fab Manufacturing ERP
              </p>
            </div>
          </div>
        </div>

        {/* Role Selector & Date Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[color:var(--crm-bg-app)] px-3 py-2 rounded-xl border border-[color:var(--crm-border-default)] text-xs">
            <span className="text-[color:var(--crm-text-secondary)] font-semibold">Role Scope:</span>
            <select
              value={activeRoleView}
              onChange={(e) => setActiveRoleView(e.target.value)}
              className="bg-transparent text-indigo-700 font-bold outline-none cursor-pointer"
            >
              {rolesList.map((r) => (
                <option key={r} value={r} className="bg-white text-[color:var(--crm-text-secondary)]">
                  {r}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Role Active Alert Banner */}
      <div className="p-3.5 sm:p-4 bg-indigo-50/90 border border-indigo-200/80 rounded-2xl flex items-center justify-between text-xs text-indigo-950 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 border border-indigo-200/80 flex items-center justify-center flex-shrink-0 text-indigo-700">
            <UserCheck className="w-4 h-4" />
          </div>
          <span>Active Persona Scope: <strong className="text-indigo-950 font-bold">{activeRoleView}</strong>. KPIs and analytics panels are tailored for {activeRoleView} visibility level.</span>
        </div>
      </div>

      {/* Executive KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="p-4 bg-white border border-[color:var(--crm-border-default)] rounded-xl space-y-2 hover:border-[color:var(--crm-border-default)] transition shadow-lg">
            <span className="text-[10px] font-bold text-[color:var(--crm-text-secondary)] uppercase tracking-wider block truncate">{kpi.label}</span>
            <div className={`text-xl font-black font-mono ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[10px] text-[color:var(--crm-text-secondary)] font-medium truncate">{kpi.change}</div>
          </div>
        ))}
      </div>

      {/* Departmental Analytics Panels (all figures computed from live records) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales & Commercial */}
        <div className="p-6 bg-white border border-[color:var(--crm-border-default)] rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2 border-b border-[color:var(--crm-border-default)] pb-3">
            <TrendingUp className="w-4 h-4 text-emerald-700" /> Sales &amp; Quotation Conversion
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
              <span>Quotations issued</span>
              <span className="font-semibold text-[color:var(--crm-text-primary)]">{analytics.quoteCount} ({fmtInr(analytics.quoteValue)})</span>
            </div>
            <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
              <span>Sales orders booked</span>
              <span className="font-semibold text-emerald-700">{analytics.soCount} ({fmtInr(analytics.soValue)})</span>
            </div>
            <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
              <span>Quotation to order ratio</span>
              <span className="font-semibold text-[color:var(--crm-text-primary)]">{analytics.quoteCount > 0 ? `${Math.round((analytics.soCount / analytics.quoteCount) * 100)}%` : '—'}</span>
            </div>
          </div>
        </div>

        {/* Purchase */}
        <div className="p-6 bg-white border border-[color:var(--crm-border-default)] rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2 border-b border-[color:var(--crm-border-default)] pb-3">
            <Package className="w-4 h-4 text-crm-brand-500" /> Purchase &amp; Procurement
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
              <span>Purchase orders issued</span>
              <span className="font-semibold text-[color:var(--crm-text-primary)]">{analytics.poCount} ({fmtInr(analytics.poValue)})</span>
            </div>
            <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
              <span>Purchase requests pending</span>
              <span className="font-semibold text-[color:var(--crm-text-primary)]">{analytics.pendingPr}</span>
            </div>
            <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
              <span>Top supplier by value</span>
              <span className="font-semibold text-[color:var(--crm-text-primary)]">{analytics.topSupplier ? `${analytics.topSupplier.name} (${fmtInr(analytics.topSupplier.value)})` : '—'}</span>
            </div>
          </div>
        </div>

        {/* Production */}
        <div className="p-6 bg-white border border-[color:var(--crm-border-default)] rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2 border-b border-[color:var(--crm-border-default)] pb-3">
            <Factory className="w-4 h-4 text-crm-brand-600" /> Production
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
              <span>Work orders total</span>
              <span className="font-semibold text-[color:var(--crm-text-primary)]">{analytics.woTotal}</span>
            </div>
            <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
              <span>In progress</span>
              <span className="font-semibold text-amber-700">{analytics.woActive}</span>
            </div>
            <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
              <span>Completed</span>
              <span className="font-semibold text-emerald-700">{analytics.woDone}</span>
            </div>
            <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
              <span>Waiting for dispatch</span>
              <span className="font-semibold text-[color:var(--crm-text-primary)]">{analytics.pendingDispatch}</span>
            </div>
          </div>
        </div>

        {/* Finance */}
        <div className="p-6 bg-white border border-[color:var(--crm-border-default)] rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2 border-b border-[color:var(--crm-border-default)] pb-3">
            <Receipt className="w-4 h-4 text-teal-700" /> Billing &amp; Collections
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
              <span>Sales invoiced</span>
              <span className="font-semibold text-emerald-700">{fmtInr(analytics.billed)}</span>
            </div>
            <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
              <span>Received from customers</span>
              <span className="font-semibold text-[color:var(--crm-text-primary)]">{fmtInr(analytics.received)}</span>
            </div>
            <div className="flex justify-between text-[color:var(--crm-text-secondary)]">
              <span>Vendor bills</span>
              <span className="font-semibold text-rose-700">{fmtInr(analytics.vendorBills)}</span>
            </div>
            <div className="flex justify-between text-[color:var(--crm-text-secondary)] border-t border-[color:var(--crm-border-default)] pt-2 font-semibold">
              <span className="text-[color:var(--crm-text-primary)]">Invoiced minus vendor bills</span>
              <span className="text-[color:var(--crm-text-primary)]">{fmtInr(analytics.billed - analytics.vendorBills)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
