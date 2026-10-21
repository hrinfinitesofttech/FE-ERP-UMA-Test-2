'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '../../../../context/ERPContext';
import { api } from '../../../../lib/apiClient';
import { formatCurrency, formatDate } from '../../../../lib/utils';
import {
  ArrowLeft,
  Building,
  Phone,
  Mail,
  FileCheck2,
  Briefcase,
  Layers,
  MapPin,
  Clock,
  IndianRupee,
  ShieldCheck,
  Users,
  Landmark,
  FileText,
  Truck,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';

export default function Customer360Page() {
  const params = useParams();
  const { customers, quotations, salesOrders, projectJobs, leads, siteVisits } = useERP();

  const customerId = String(params.id);
  const customer = customers.find((c) => c.id === customerId);

  const [activeTab, setActiveTab] = useState<'orders' | 'quotations' | 'projects' | 'visits' | 'contacts' | 'details'>('orders');
  const [extraContacts, setExtraContacts] = useState<any[]>([]);

  useEffect(() => {
    if (customer?.id) {
      api.crm.contacts.list(true).then((res) => {
        if (Array.isArray(res)) {
          const matched = res.filter((c: any) => c.customerId === customer.id || c.customer_id === customer.id);
          setExtraContacts(matched);
        }
      }).catch(() => {});
    }
  }, [customer?.id]);

  const relatedQuotations = useMemo(
    () => (customer ? quotations.filter((q) => q.customerId === customer.id || q.customerName.includes(customer.companyName)) : []),
    [customer, quotations]
  );
  const relatedSalesOrders = useMemo(
    () => (customer ? salesOrders.filter((s) => s.customerId === customer.id || s.customerName.includes(customer.companyName)) : []),
    [customer, salesOrders]
  );
  const relatedProjects = useMemo(
    () => (customer ? projectJobs.filter((p) => p.customerId === customer.id || p.customerName.includes(customer.companyName)) : []),
    [customer, projectJobs]
  );
  const relatedVisits = useMemo(
    () => (customer ? siteVisits.filter((v) => v.customerId === customer.id || v.customerName.includes(customer.companyName)) : []),
    [customer, siteVisits]
  );

  const combinedContacts = useMemo(() => {
    if (!customer) return [];
    const list: any[] = [];
    const seen = new Set<string>();

    if (customer.contactPerson) {
      list.push({
        id: `primary-${customer.id}`,
        name: customer.contactPerson,
        designation: customer.designation || 'Primary Contact',
        department: 'Management',
        mobile: customer.mobile,
        whatsapp: customer.whatsapp,
        email: customer.email,
        isPrimary: true,
      });
      seen.add(`${customer.contactPerson}-${customer.mobile}`);
    }

    if (Array.isArray((customer as any).contacts)) {
      (customer as any).contacts.forEach((c: any) => {
        const key = `${c.name}-${c.mobile}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push(c);
        }
      });
    }

    extraContacts.forEach((c: any) => {
      const key = `${c.name}-${c.mobile}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push(c);
      }
    });

    return list;
  }, [customer, extraContacts]);

  if (!customer) {
    return (
      <div className="p-8 text-center text-[#70665F] text-xs">
        <p>Customer account not found.</p>
        <Link href="/crm/customers" className="text-crm-brand-700 font-bold underline mt-2 block">
          Return to Customer Directory
        </Link>
      </div>
    );
  }

  const totalBusinessValue = relatedSalesOrders.reduce((sum, so) => sum + so.orderValue, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-4 text-xs pb-10">
      <Link href="/crm/customers" className="inline-flex items-center gap-1.5 text-crm-brand-700 hover:underline font-semibold">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Customers Master
      </Link>

      {/* Top 360° Header */}
      <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-sm bg-crm-brand-700 text-white px-2.5 py-0.5 rounded-lg shadow-sm">
                {customer.customerCode}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono text-[10px] font-bold uppercase border border-amber-300">
                {customer.category} Account
              </span>
              <span className="text-[#70665F] font-mono">GST: {customer.gstin || 'N/A'}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#211B17] mt-1">{customer.companyName}</h1>
            <p className="text-[#70665F]">{customer.industry} • Account Manager: {customer.assignedSalesPerson || 'Sales Team'}</p>
          </div>

          <div className="bg-slate-50 dark:bg-[#FAF7F2] p-3.5 rounded-xl border border-slate-200 dark:border-[#EBE3DB] text-right">
            <span className="text-[10px] text-[#70665F] font-semibold uppercase block">Total Lifetime Orders</span>
            <span className="text-base font-extrabold text-emerald-600 block">{formatCurrency(totalBusinessValue)}</span>
            <span className="text-[10px] text-[#70665F] block">{relatedSalesOrders.length} Confirmed Projects</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-[#EBE3DB] text-[11px]">
          <div>
            <span className="text-[#70665F] block">Primary Contact</span>
            <span className="font-bold text-slate-800 dark:text-[#544B45]">{customer.contactPerson}</span>
            <span className="text-[#70665F] block">{customer.designation}</span>
          </div>
          <div>
            <span className="text-[#70665F] block">Contact Info</span>
            <span className="font-bold text-slate-800 dark:text-[#544B45]">{customer.mobile}</span>
            <span className="text-[#70665F] block">{customer.email || 'No email registered'}</span>
          </div>
          <div>
            <span className="text-[#70665F] block">Payment Terms</span>
            <span className="font-semibold text-slate-700 dark:text-[#544B45]">{customer.paymentTerms}</span>
            {Boolean(customer.creditPeriodDays) && (
              <span className="text-[#70665F] block text-[10px]">{customer.creditPeriodDays} Days Credit Period</span>
            )}
          </div>
          <div>
            <span className="text-[#70665F] block">Credit Limit</span>
            <span className="font-mono font-bold text-slate-800 dark:text-[#544B45]">{formatCurrency(customer.creditLimit)}</span>
            <span className="text-[#70665F] block text-[10px] capitalize">Status: {(customer as any).status || 'Active'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#EBE3DB] space-x-2 font-medium overflow-x-auto">
        {[
          { id: 'orders', label: `Sales Orders (${relatedSalesOrders.length})`, icon: Layers },
          { id: 'projects', label: `MTO Projects (${relatedProjects.length})`, icon: Briefcase },
          { id: 'quotations', label: `Quotations (${relatedQuotations.length})`, icon: FileCheck2 },
          { id: 'visits', label: `Site Visits (${relatedVisits.length})`, icon: MapPin },
          { id: 'contacts', label: `Contacts (${combinedContacts.length})`, icon: Users },
          { id: 'details', label: `Banking & Tax Info`, icon: Landmark },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-crm-brand-700 text-crm-brand-700 font-bold'
                  : 'border-transparent text-[#70665F] hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl p-5 shadow-sm space-y-3">
        {activeTab === 'orders' && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Customer Sales Orders History</h3>
            {relatedSalesOrders.length === 0 ? (
              <p className="text-slate-500 py-4 text-center">No sales orders registered yet.</p>
            ) : (
              relatedSalesOrders.map((so) => (
                <div key={so.id} className="p-3.5 bg-slate-50 dark:bg-[#FAF7F2]/60 rounded-xl border flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-crm-brand-700">{so.salesOrderNumber}</span>
                      <span className="text-[#70665F] font-mono text-[10px]">PO: {so.customerPoNumber}</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-[#211B17] block mt-0.5">{so.items[0]?.productName}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 block">{formatCurrency(so.orderValue)}</span>
                    <span className="font-mono text-[10px] text-crm-brand-700">Job #: {so.jobNumber || 'Assigned'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Active Manufacturing Jobs</h3>
            {relatedProjects.length === 0 ? (
              <p className="text-slate-500 py-4 text-center">No active projects found.</p>
            ) : (
              relatedProjects.map((p) => (
                <div key={p.id} className="p-3.5 bg-slate-50 dark:bg-[#FAF7F2]/60 rounded-xl border flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-crm-brand-700 block">{p.projectNumber} • {p.jobNumber}</span>
                    <span className="font-semibold text-slate-800 dark:text-[#544B45] block">{p.productName}</span>
                    <span className="text-[10px] text-[#70665F]">Lead: {p.projectManager} • Delivery: {formatDate(p.deliveryDate)}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded uppercase font-mono text-[10px] font-bold bg-purple-100 text-purple-800">
                      {p.status}
                    </span>
                    <span className="block font-bold text-slate-700 dark:text-[#544B45] mt-1">{p.progressPercent}% Complete</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'quotations' && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Historical Quotations & Revisions</h3>
            {relatedQuotations.length === 0 ? (
              <p className="text-slate-500 py-4 text-center">No quotations created yet.</p>
            ) : (
              relatedQuotations.map((q) => (
                <div key={q.id} className="p-3.5 bg-slate-50 dark:bg-[#FAF7F2]/60 rounded-xl border flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-crm-brand-700">{q.quotationNumber} ({q.currentRevision})</span>
                    <span className="text-[#70665F] text-[11px] block">{q.latestSummary?.machineProduct || 'Process Equipment'}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 block">{formatCurrency(q.latestSummary?.grandTotal || (q.revisions && q.revisions[q.revisions.length - 1]?.grandTotal) || 0)}</span>
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                      {q.latestSummary?.status || 'draft'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'visits' && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Plant & Site Visits Record</h3>
            {relatedVisits.length === 0 ? (
              <p className="text-slate-500 py-4 text-center">No site visits logged for this customer.</p>
            ) : (
              relatedVisits.map((v) => (
                <div key={v.id} className="p-3.5 bg-slate-50 dark:bg-[#FAF7F2]/60 rounded-xl border">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-[#211B17]">{v.purpose}</span>
                    <span className="text-[#70665F] font-mono text-[10px]">{v.visitDate}</span>
                  </div>
                  <p className="text-[#70665F] text-[11px] mt-1">{v.discussionNotes}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-[#70665F] font-medium">
                    <span>Location: {v.location}</span>
                    <span className="uppercase font-bold text-emerald-600">Outcome: {v.outcome}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Associated Customer Contacts</h3>
              <span className="text-slate-500 text-[11px]">{combinedContacts.length} Contact(s) Registered</span>
            </div>
            {combinedContacts.length === 0 ? (
              <p className="text-slate-500 py-4 text-center">No contact persons registered yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {combinedContacts.map((c, idx) => (
                  <div key={c.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{c.name}</span>
                      {c.isPrimary && (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-600 block">{c.designation || 'Staff'} {c.department ? `• ${c.department}` : ''}</span>
                    <div className="text-[11px] text-slate-700 flex flex-col gap-0.5 pt-1">
                      {c.mobile && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {c.mobile}</span>}
                      {c.email && <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {c.email}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45]">Statutory, Banking & Logistics Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Statutory & Tax */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-xs pb-1 border-b border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-crm-brand-700" />
                  <span>Statutory & Tax Compliance</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">GSTIN</span>
                    <span className="font-mono font-bold text-slate-800">{customer.gstin || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">PAN</span>
                    <span className="font-mono font-bold text-slate-800">{customer.pan || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">TAN</span>
                    <span className="font-mono font-semibold text-slate-800">{customer.tan || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">MSME Registration #</span>
                    <span className="font-mono font-semibold text-slate-800">{customer.msmeNumber || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Tax Category</span>
                    <span className="font-medium text-slate-800 capitalize">{customer.taxCategory || 'Regular (Default)'}</span>
                  </div>
                </div>
              </div>

              {/* Banking Details */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-xs pb-1 border-b border-slate-200">
                  <Landmark className="w-4 h-4 text-emerald-600" />
                  <span>Banking & Financial Accounts</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Bank Name</span>
                    <span className="font-semibold text-slate-800">{customer.bankName || 'Not Set'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Account Number</span>
                    <span className="font-mono font-bold text-slate-800">{customer.bankAccountNo || 'Not Set'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Account Holder Name</span>
                    <span className="font-semibold text-slate-800">{customer.bankAccountName || customer.companyName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">IFSC Code</span>
                    <span className="font-mono font-bold text-slate-800">{customer.bankIfsc || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Branch Name</span>
                    <span className="font-medium text-slate-800">{customer.bankBranch || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Commercial Terms */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-xs pb-1 border-b border-slate-200">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Commercial & Credit Terms</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Payment Terms</span>
                    <span className="font-semibold text-slate-800">{customer.paymentTerms || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Credit Period (Days)</span>
                    <span className="font-mono font-bold text-slate-800">{customer.creditPeriodDays ?? 30} Days</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Credit Limit</span>
                    <span className="font-mono font-bold text-emerald-600">{formatCurrency(customer.creditLimit)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Currency</span>
                    <span className="font-semibold text-slate-800">{customer.currency || 'INR (₹)'}</span>
                  </div>
                </div>
              </div>

              {/* Logistics & Dispatch Instructions */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-xs pb-1 border-b border-slate-200">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>Logistics & Project Requirements</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Nearest Port / Railway</span>
                    <span className="font-medium text-slate-800">{customer.nearestPortRailway || 'Not Specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Billing Address</span>
                    <span className="text-slate-700">{customer.billingAddress || 'N/A'}, {customer.city} {customer.state} {customer.pincode}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Shipping Address</span>
                    <span className="text-slate-700">{customer.shippingAddress || customer.billingAddress || 'N/A'}</span>
                  </div>
                  {customer.inspectionRequirements && (
                    <div>
                      <span className="text-slate-500 block">Inspection Requirements</span>
                      <span className="text-slate-700">{customer.inspectionRequirements}</span>
                    </div>
                  )}
                  {customer.specialInstructions && (
                    <div>
                      <span className="text-slate-500 block">Special Instructions</span>
                      <span className="text-slate-700">{customer.specialInstructions}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
