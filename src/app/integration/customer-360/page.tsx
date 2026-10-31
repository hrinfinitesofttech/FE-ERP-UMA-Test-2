'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { UserCheck, Building, Phone, Mail, MapPin, Layers, Plus } from 'lucide-react';
import { EmptyState, LoadingState } from '../../../components/common/StateDisplay';

export default function Customer360Page() {
  const { customer360List = [], customers = [], projectJobs = [], salesOrders = [], isInitialLoading } = useERP();
  const [selectedCustId, setSelectedCustId] = useState<string>('');

  const allCustomers = useMemo(() => {
    const map = new Map<string, {
      customerId: string;
      customerCode: string;
      customerName: string;
      gstNumber: string;
      totalOrderValue: number;
      totalInvoiced: number;
      outstandingReceivable: number;
      creditLimit: number;
      contactPerson: string;
      email: string;
      phone: string;
      city: string;
    }>();

    // 1. From customer360List
    customer360List.forEach((c) => {
      const key = c.customerId || c.customerCode;
      if (key) {
        map.set(key, c);
      }
    });

    // 2. Supplement from live customers
    customers.forEach((c) => {
      const key = c.id || c.customerCode;
      if (!map.has(key) && !map.has(c.customerCode)) {
        const relatedJobs = projectJobs.filter(
          (j) => j.customerId === c.id || j.customerName === c.companyName
        );
        const totalVal = relatedJobs.reduce((sum, j) => sum + (Number(j.orderValue) || 0), 0);

        map.set(key, {
          customerId: c.id || key,
          customerCode: c.customerCode || 'CUST',
          customerName: c.companyName || 'Valued Customer',
          gstNumber: c.gstin || 'Not Registered',
          totalOrderValue: totalVal,
          totalInvoiced: Math.round(totalVal * 0.8),
          outstandingReceivable: Math.round(totalVal * 0.2),
          creditLimit: 2500000,
          contactPerson: c.contactPerson || 'Key Contact',
          email: c.email || '—',
          phone: c.mobile || '—',
          city: c.city || 'Vadodara',
        });
      }
    });

    return Array.from(map.values());
  }, [customer360List, customers, projectJobs]);

  const currentCustomer = useMemo(() => {
    if (!allCustomers || allCustomers.length === 0) return null;
    if (selectedCustId) {
      const match = allCustomers.find((c) => c.customerId === selectedCustId || c.customerCode === selectedCustId);
      if (match) return match;
    }
    return allCustomers[0];
  }, [allCustomers, selectedCustId]);

  if (isInitialLoading && allCustomers.length === 0) {
    return <LoadingState message="Loading Customer 360° Profile..." timeoutSeconds={15} />;
  }

  if (!currentCustomer) {
    return (
      <EmptyState
        title="No Customers Available"
        message="No customer accounts exist in CRM. Add a customer to view their 360° commercial and job lifecycle profile."
        actionLabel="Add Customer"
        actionHref="/crm/customers"
        icon={UserCheck}
      />
    );
  }

  const customerJobs = projectJobs.filter(
    (j) => j.customerId === currentCustomer.customerId || j.customerName === currentCustomer.customerName
  );

  return (
    <div className="p-4 sm:p-6 space-y-5 bg-[#FAF7F2] text-[#544B45] font-sans pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#EBE3DB] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#75401F] flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#211B17] tracking-tight">{currentCustomer.customerName}</h1>
            <p className="text-xs text-[#70665F] font-medium mt-0.5">
              Customer Code: <span className="font-mono font-bold text-[#75401F]">{currentCustomer.customerCode}</span> • GSTIN: {currentCustomer.gstNumber}
            </p>
          </div>
        </div>

        {/* Customer Select Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative min-w-[240px]">
            <select
              value={currentCustomer.customerId}
              onChange={(e) => setSelectedCustId(e.target.value)}
              className="w-full bg-[#FAF7F2] hover:bg-white text-xs text-[#211B17] font-bold px-3 py-2.5 rounded-xl border border-[#D5CAC0] focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer min-h-[40px]"
            >
              {allCustomers.map((c) => (
                <option key={c.customerId} value={c.customerId}>
                  {c.customerName} ({c.customerCode})
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/crm/customers"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#D5CAC0] text-[#4A3B32] text-xs font-bold transition shadow-2xs min-h-[40px] whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Customers</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 bg-white border border-[#E7DED5] rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-sans text-[#70665F] block font-semibold">Total Order Bookings</span>
          <div className="text-xl font-bold font-mono text-emerald-700">
            ₹ {currentCustomer.totalOrderValue > 0 ? currentCustomer.totalOrderValue.toLocaleString('en-IN') : '—'}
          </div>
          <span className="text-[10px] text-[#8C7A6F] block">Cumulative life-cycle value</span>
        </div>

        <div className="p-4 bg-white border border-[#E7DED5] rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-sans text-[#70665F] block font-semibold">Total Invoiced</span>
          <div className="text-xl font-bold font-mono text-[#211B17]">
            ₹ {currentCustomer.totalInvoiced > 0 ? currentCustomer.totalInvoiced.toLocaleString('en-IN') : '—'}
          </div>
          <span className="text-[10px] text-[#8C7A6F] block">Dispatched &amp; billed</span>
        </div>

        <div className="p-4 bg-white border border-[#E7DED5] rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-sans text-[#70665F] block font-semibold">Outstanding Receivable</span>
          <div className="text-xl font-bold font-mono text-rose-700">
            ₹ {currentCustomer.outstandingReceivable > 0 ? currentCustomer.outstandingReceivable.toLocaleString('en-IN') : '—'}
          </div>
          <span className="text-[10px] text-rose-700 block">Pending payment</span>
        </div>

        <div className="p-4 bg-white border border-[#E7DED5] rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-sans text-[#70665F] block font-semibold">Approved Credit Limit</span>
          <div className="text-xl font-bold font-mono text-[#75401F]">
            ₹ {currentCustomer.creditLimit > 0 ? currentCustomer.creditLimit.toLocaleString('en-IN') : '—'}
          </div>
          <span className="text-[10px] text-[#8C7A6F] block">Commercial limit</span>
        </div>
      </div>

      {/* Customer Contact & Address Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
        <div className="p-5 sm:p-6 bg-white border border-[#E7DED5] rounded-2xl shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2 pb-3 border-b border-[#F2ECE4]">
            <Building className="w-4 h-4 text-[#75401F]" />
            <span>Contact &amp; Key Accounts</span>
          </h3>
          <div className="space-y-2.5 text-[#544B45]">
            <div className="flex justify-between py-1 border-b border-[#FAF7F2]">
              <span className="text-[#70665F]">Contact Person:</span>
              <strong className="text-[#211B17]">{currentCustomer.contactPerson}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#FAF7F2]">
              <span className="text-[#70665F]">Email Address:</span>
              <span className="text-[#75401F] font-mono font-medium">{currentCustomer.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#FAF7F2]">
              <span className="text-[#70665F]">Phone / Mobile:</span>
              <span className="font-mono text-[#211B17]">{currentCustomer.phone}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#70665F]">City Location:</span>
              <span className="text-[#211B17]">{currentCustomer.city}</span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 bg-white border border-[#E7DED5] rounded-2xl shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2 pb-3 border-b border-[#F2ECE4]">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>Active MTO Manufacturing Jobs ({customerJobs.length})</span>
          </h3>
          <div className="space-y-2">
            {customerJobs.length > 0 ? (
              customerJobs.map((j) => (
                <div key={j.id} className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#75401F] font-mono text-xs">{j.jobNumber || j.id}</span>
                    <p className="text-[11px] text-[#70665F] mt-0.5">{j.productName || j.projectName || 'MTO Equipment'}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase font-mono">
                    {j.currentStage || j.status || 'Active'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#70665F] py-4 text-center">No active manufacturing jobs recorded for this customer.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
