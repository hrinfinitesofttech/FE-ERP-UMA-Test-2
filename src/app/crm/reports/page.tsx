'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { DataTable, Column } from '../../../components/data/DataTable';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { TrendingUp, Download, Printer, Filter, Users, FileCheck2, Briefcase } from 'lucide-react';

export default function CRMReportsPage() {
  const { leads, quotations, salesOrders, opportunities, employees } = useERP();
  const [reportType, setReportType] = useState<'leads' | 'quotations' | 'orders' | 'salesperson'>('leads');
  const [selectedSource, setSelectedSource] = useState<string>('all');

  // Leads report
  const leadColumns: Column<any>[] = [
    { header: 'Lead #', accessorKey: 'leadNo' },
    { header: 'Company Name', accessorKey: 'companyName' },
    { header: 'Contact Person', accessorKey: 'contactPerson' },
    { header: 'Product Requirement', accessorKey: 'productName' },
    { header: 'Source', accessorKey: 'source' },
    { header: 'Assigned Sales Person', accessorKey: 'assignedSalesPersonName' },
    { header: 'Budget', cell: (l) => formatCurrency(l.budget || 0) },
    { header: 'Status', accessorKey: 'status' },
  ];

  // Quotations report
  const quotationColumns: Column<any>[] = [
    { header: 'Quotation #', accessorKey: 'quotationNumber' },
    { header: 'Active Rev', accessorKey: 'currentRevision' },
    { header: 'Customer', accessorKey: 'customerName' },
    { header: 'Equipment Scope', cell: (q) => q.latestSummary?.machineProduct || 'Process Equipment' },
    { header: 'Grand Total', cell: (q) => formatCurrency(q.latestSummary?.grandTotal || (q.revisions && q.revisions[q.revisions.length - 1]?.grandTotal) || 0) },
    { header: 'Quotation Date', cell: (q) => formatDate(q.date) },
    { header: 'Status', cell: (q) => (q.latestSummary?.status || 'draft')?.toUpperCase() },
  ];

  // Sales Orders report
  const orderColumns: Column<any>[] = [
    { header: 'Sales Order #', accessorKey: 'salesOrderNumber' },
    { header: 'Customer', accessorKey: 'customerName' },
    { header: 'Customer PO #', accessorKey: 'customerPoNumber' },
    { header: 'Total Value', cell: (o) => formatCurrency(o.orderValue) },
    { header: 'Delivery Date', cell: (o) => formatDate(o.deliveryDate) },
    { header: 'Job Number (MTO)', accessorKey: 'jobNumber' },
    { header: 'Status', accessorKey: 'status' },
  ];

  // Salesperson Performance report
  const salespersonData = employees
    .filter((e) => e.departmentName.includes('CRM') || e.departmentName.includes('Project'))
    .map((emp) => {
      const assignedLeads = leads.filter((l) => l.assignedSalesPersonId === emp.id || l.assignedSalesPersonName.includes(emp.firstName));
      const wonOrders = salesOrders.filter((so) => so.assignedProjectManager.includes(emp.firstName) || assignedLeads.some((l) => l.companyName === so.customerName));
      const totalWon = wonOrders.reduce((sum, o) => sum + o.orderValue, 0);

      return {
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        designation: emp.designation,
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
    { header: 'Won Revenue (INR)', cell: (s) => formatCurrency(s.wonRevenue) },
    { header: 'Conversion Rate', accessorKey: 'conversionRate' },
  ];

  return (
    <div className="space-y-4 text-xs pb-10">
      <div className="bg-white dark:bg-white p-5 rounded-xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-crm-brand-700" />
            CRM Commercial & Executive Reports
          </h1>
          <p className="text-[#70665F] mt-0.5">
            Exportable analytics for lead conversion, quotation success rates, and salesperson quarterly performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-xl font-bold text-slate-900 dark:text-[#211B17]"
          >
            <option value="leads">Lead Acquisition Report</option>
            <option value="quotations">Quotation Status Report</option>
            <option value="orders">Sales Order Revenue Report</option>
            <option value="salesperson">Salesperson Performance KPI</option>
          </select>
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
