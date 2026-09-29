'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { DataTable, Column } from '../../../components/data/DataTable';
import { formatCurrency, formatDate } from '../../../lib/utils';
import {
  TrendingUp,
  Download,
  Printer,
  Filter,
  Users,
  FileCheck2,
  Briefcase,
  Layers,
  Award,
  DollarSign,
  PieChart
} from 'lucide-react';

export default function CRMReportsPage() {
  const { leads = [], quotations = [], salesOrders = [], opportunities = [], employees = [] } = useERP();
  const [reportType, setReportType] = useState<'leads' | 'quotations' | 'orders' | 'salesperson'>('leads');

  // Leads report
  const leadColumns: Column<any>[] = [
    {
      header: 'Lead #',
      cell: (l) => <span className="font-mono font-bold text-sky-700">{l?.leadNo || l?.id || '-'}</span>,
    },
    {
      header: 'Company Name',
      cell: (l) => <span className="font-bold text-slate-900">{l?.companyName || '-'}</span>,
    },
    {
      header: 'Contact Person',
      cell: (l) => <span>{l?.contactPerson || '-'}</span>,
    },
    {
      header: 'Product Requirement',
      cell: (l) => <span>{l?.productName || l?.requirementDescription || 'Process Equipment'}</span>,
    },
    {
      header: 'Source',
      cell: (l) => (
        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] uppercase">
          {l?.source || 'Direct'}
        </span>
      ),
    },
    {
      header: 'Assigned Sales Person',
      cell: (l) => <span>{l?.assignedSalesPersonName || 'Unassigned'}</span>,
    },
    {
      header: 'Budget',
      cell: (l) => <span className="font-mono font-bold">{formatCurrency(Number(l?.budget) || 0)}</span>,
    },
    {
      header: 'Status',
      cell: (l) => {
        const s = String(l?.status || 'new').toLowerCase();
        const color =
          s === 'won' || s === 'converted'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : s === 'lost'
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : 'bg-amber-50 text-amber-700 border-amber-200';
        return (
          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase font-mono ${color}`}>
            {s}
          </span>
        );
      },
    },
  ];

  // Quotations report
  const quotationColumns: Column<any>[] = [
    {
      header: 'Quotation #',
      cell: (q) => <span className="font-mono font-bold text-purple-700">{q?.quotationNumber || q?.id || '-'}</span>,
    },
    {
      header: 'Active Rev',
      cell: (q) => (
        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[11px] font-bold">
          {q?.currentRevision || 'Rev-00'}
        </span>
      ),
    },
    {
      header: 'Customer',
      cell: (q) => <span className="font-bold text-slate-900">{q?.customerName || '-'}</span>,
    },
    {
      header: 'Equipment Scope',
      cell: (q) => (
        <span className="text-slate-700">
          {q?.latestSummary?.machineProduct ||
            (Array.isArray(q?.revisions) && q.revisions[0]?.items?.[0]?.productName) ||
            q?.machineProduct ||
            'Custom Heavy Engineering Equipment'}
        </span>
      ),
    },
    {
      header: 'Grand Total',
      cell: (q) => {
        const total =
          Number(q?.latestSummary?.grandTotal) ||
          Number(Array.isArray(q?.revisions) && q.revisions[q.revisions.length - 1]?.grandTotal) ||
          Number(q?.grandTotal) ||
          Number(q?.totalAmount) ||
          0;
        return <span className="font-mono font-bold text-[#169B62]">{formatCurrency(total)}</span>;
      },
    },
    {
      header: 'Quotation Date',
      cell: (q) => <span className="font-mono text-slate-600">{formatDate(q?.date || q?.createdDate || q?.createdAt)}</span>,
    },
    {
      header: 'Status',
      cell: (q) => {
        const s = String(q?.latestSummary?.status || (Array.isArray(q?.revisions) && q.revisions[q.revisions.length - 1]?.status) || q?.status || 'draft').toLowerCase();
        return (
          <span className="px-2.5 py-0.5 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-[10px] font-bold uppercase font-mono">
            {s}
          </span>
        );
      },
    },
  ];

  // Sales Orders report
  const orderColumns: Column<any>[] = [
    {
      header: 'Sales Order #',
      cell: (o) => (
        <span className="font-mono font-bold text-[#0E91B2] bg-[#E0F2FE] px-2 py-0.5 rounded border border-[#BAE6FD] text-xs">
          {o?.salesOrderNumber || o?.sales_order_number || o?.id || '-'}
        </span>
      ),
    },
    {
      header: 'Customer',
      cell: (o) => <span className="font-bold text-slate-900">{o?.customerName || o?.customer_name || '-'}</span>,
    },
    {
      header: 'Customer PO #',
      cell: (o) => <span className="font-mono text-slate-700">{o?.customerPoNumber || o?.customer_po_number || '-'}</span>,
    },
    {
      header: 'Total Value',
      cell: (o) => {
        const val = Number(o?.orderValue) || Number(o?.grand_total) || Number(o?.total_amount) || 0;
        return <span className="font-mono font-bold text-[#169B62]">{formatCurrency(val)}</span>;
      },
    },
    {
      header: 'Delivery Date',
      cell: (o) => <span className="font-mono text-slate-600">{formatDate(o?.deliveryDate || o?.target_delivery_date || o?.targetDeliveryDate)}</span>,
    },
    {
      header: 'Job Number (MTO)',
      cell: (o) => {
        const job = o?.jobNumber || o?.job_number;
        return job ? (
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold text-[11px]">
            {job}
          </span>
        ) : (
          <span className="text-slate-400 font-mono text-[11px]">-</span>
        );
      },
    },
    {
      header: 'Status',
      cell: (o) => (
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] font-bold uppercase">
          {o?.status || 'confirmed'}
        </span>
      ),
    },
  ];

  // Salesperson Performance report
  const salespersonData = (employees || [])
    .filter((e) => {
      const dept = String(e?.departmentName || (e as any)?.department_name || (e as any)?.department || '').toLowerCase();
      const desig = String(e?.designation || '').toLowerCase();
      return (
        dept.includes('crm') ||
        dept.includes('sales') ||
        dept.includes('project') ||
        desig.includes('sales') ||
        desig.includes('commercial') ||
        desig.includes('manager')
      );
    })
    .map((emp) => {
      const fName = String(emp?.firstName || (emp as any)?.first_name || '').trim();
      const lName = String(emp?.lastName || (emp as any)?.last_name || '').trim();
      const fullName = `${fName} ${lName}`.trim() || String((emp as any)?.name || emp?.id || 'Staff');

      const assignedLeads = (leads || []).filter((l) => {
        if (!l) return false;
        if (l.assignedSalesPersonId && l.assignedSalesPersonId === emp.id) return true;
        if (fName && l.assignedSalesPersonName && String(l.assignedSalesPersonName).toLowerCase().includes(fName.toLowerCase())) return true;
        return false;
      });

      const wonOrders = (salesOrders || []).filter((so) => {
        if (!so) return false;
        if (fName && so.assignedProjectManager && String(so.assignedProjectManager).toLowerCase().includes(fName.toLowerCase())) return true;
        if (assignedLeads.some((l) => l.companyName && so.customerName && String(l.companyName).toLowerCase() === String(so.customerName).toLowerCase())) return true;
        return false;
      });

      const totalWon = wonOrders.reduce((sum, o) => {
        const val = Number(o?.orderValue) || Number((o as any)?.grand_total) || Number((o as any)?.total_amount) || 0;
        return sum + val;
      }, 0);

      return {
        id: emp.id,
        name: fullName,
        designation: emp?.designation || 'Sales Engineer',
        totalLeads: assignedLeads.length,
        wonOrders: wonOrders.length,
        wonRevenue: totalWon,
        conversionRate: assignedLeads.length > 0 ? `${Math.round((wonOrders.length / assignedLeads.length) * 100)}%` : '0%',
      };
    });

  const salespersonColumns: Column<any>[] = [
    { header: 'Sales Engineer', accessorKey: 'name' },
    { header: 'Designation', accessorKey: 'designation' },
    { header: 'Assigned Leads', accessorKey: 'totalLeads' },
    { header: 'Orders Won', accessorKey: 'wonOrders' },
    { header: 'Won Revenue (INR)', cell: (s) => <span className="font-mono font-bold text-[#169B62]">{formatCurrency(s.wonRevenue)}</span> },
    { header: 'Conversion Rate', accessorKey: 'conversionRate' },
  ];

  // Totals
  const totalLeadsCount = leads.length;
  const totalQuotationsCount = quotations.length;
  const totalOrdersValue = salesOrders.reduce((sum, o) => sum + (Number(o?.orderValue) || Number((o as any)?.grand_total) || Number((o as any)?.total_amount) || 0), 0);

  return (
    <div className="space-y-5 text-xs pb-10">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="p-2 bg-[#FAF7F2] rounded-xl text-[#5C3A21] border border-[#EBE3DB]">
              <TrendingUp className="w-5 h-5" />
            </div>
            CRM Commercial & Executive Reports
          </h1>
          <p className="text-[#70665F] mt-1 text-xs">
            Exportable analytics for lead acquisition, quotation win rates, and salesperson quarterly performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#5C3A21]"
          >
            <option value="leads">Lead Acquisition Report ({totalLeadsCount})</option>
            <option value="quotations">Quotation Status Report ({totalQuotationsCount})</option>
            <option value="orders">Sales Order Revenue Report ({salesOrders.length})</option>
            <option value="salesperson">Salesperson Performance KPI ({salespersonData.length})</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-[#70665F] font-medium uppercase tracking-wider">Total Leads in Pipeline</p>
            <h3 className="text-lg font-bold text-slate-900">{totalLeadsCount} Inquiries</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-[#70665F] font-medium uppercase tracking-wider">Quotations Released</p>
            <h3 className="text-lg font-bold text-slate-900">{totalQuotationsCount} Quotes</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-[#70665F] font-medium uppercase tracking-wider">Confirmed Order Book Value</p>
            <h3 className="text-lg font-bold text-emerald-700">{formatCurrency(totalOrdersValue)}</h3>
          </div>
        </div>
      </div>

      {reportType === 'leads' && (
        <DataTable
          title="Lead Generation & Source Analytics"
          columns={leadColumns}
          data={leads}
        />
      )}

      {reportType === 'quotations' && (
        <DataTable
          title="Quotations Register & Revision Audit"
          columns={quotationColumns}
          data={quotations}
        />
      )}

      {reportType === 'orders' && (
        <DataTable
          title="Sales Orders & Manufacturing Backlog"
          columns={orderColumns}
          data={salesOrders}
        />
      )}

      {reportType === 'salesperson' && (
        <DataTable
          title="Sales Engineer Performance & Conversion Matrix"
          columns={salespersonColumns}
          data={salespersonData}
        />
      )}
    </div>
  );
}
