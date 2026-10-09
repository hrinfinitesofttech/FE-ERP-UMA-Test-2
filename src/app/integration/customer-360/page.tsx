'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { UserCheck, Building, Phone, Mail, MapPin, Receipt, Layers, Briefcase, FileText, Download } from 'lucide-react';

export default function Customer360Page() {
  const { customer360List, projectJobs } = useERP();
  const [selectedCustId, setSelectedCustId] = useState<string>(customer360List[0]?.customerId || '');

  const customer = customer360List.find((c) => c.customerId === selectedCustId) || customer360List[0];

  if (!customer) {
    return (
      <div className="p-8 text-center bg-[#FAF7F2]  text-[#70665F]">
        <h2 className="text-xl font-bold text-[#211B17] mb-2">Customer 360° Profile</h2>
        <p>No customer records available or loading live data from API...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#544B45] font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE3DB] shadow-xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-crm-brand-600/10 border border-crm-brand-600/20 rounded-xl text-crm-brand-500">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#211B17] tracking-tight">{customer.customerName}</h1>
              <p className="text-xs text-[#70665F] font-medium mt-0.5">
                Consolidated Customer 360° Profile • GST: {customer.gstNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Select */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FAF7F2] px-3 py-2 rounded-xl border border-[#EBE3DB] text-xs">
            <span className="text-[#70665F] font-semibold">Select Customer:</span>
            <select
              value={selectedCustId}
              onChange={(e) => setSelectedCustId(e.target.value)}
              className="bg-transparent text-crm-brand-500 font-bold outline-none cursor-pointer"
            >
              {customer360List.map((c) => (
                <option key={c.customerId} value={c.customerId} className="bg-white text-[#544B45]">
                  {c.customerName} ({c.customerCode})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 bg-white border border-[#EBE3DB] rounded-xl">
          <span className="text-[#70665F] font-sans block text-[10px]">Total Order Bookings</span>
          <div className="text-lg font-bold text-emerald-400">₹{customer.totalOrderValue?.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-white border border-[#EBE3DB] rounded-xl">
          <span className="text-[#70665F] font-sans block text-[10px]">Total Invoiced</span>
          <div className="text-lg font-bold text-[#211B17]">₹{customer.totalInvoiced?.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-white border border-[#EBE3DB] rounded-xl">
          <span className="text-[#70665F] font-sans block text-[10px]">Outstanding Receivable</span>
          <div className="text-lg font-bold text-rose-400">₹{customer.outstandingReceivable?.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-white border border-[#EBE3DB] rounded-xl">
          <span className="text-[#70665F] font-sans block text-[10px]">Approved Credit Limit</span>
          <div className="text-lg font-bold text-crm-brand-500">₹{customer.creditLimit?.toLocaleString()}</div>
        </div>
      </div>

      {/* Customer Contact & Address Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="p-6 bg-white border border-[#EBE3DB] rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
            <Building className="w-4 h-4 text-crm-brand-500" /> Contact Person & Communication
          </h3>
          <div className="space-y-2 text-[#544B45]">
            <div>Contact Person: <strong className="text-[#211B17]">{customer.contactPerson}</strong></div>
            <div>Email Address: <span className="text-crm-brand-500">{customer.email}</span></div>
            <div>Phone / Mobile: <span className="text-[#544B45]">{customer.phone}</span></div>
            <div>Location City: <span className="text-[#544B45]">{customer.city}</span></div>
          </div>
        </div>

        <div className="p-6 bg-white border border-[#EBE3DB] rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" /> Active MTO Manufacturing Jobs
          </h3>
          <div className="space-y-2">
            {projectJobs.filter(j => j.customerId === customer.customerId || j.customerName === customer.customerName).length > 0 ? (
              projectJobs.filter(j => j.customerId === customer.customerId || j.customerName === customer.customerName).map(j => (
                <div key={j.id} className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] flex justify-between items-center">
                  <div>
                    <span className="font-bold text-crm-brand-500">{j.jobNumber}</span>
                    <p className="text-[10px] text-[#70665F]">{j.productName}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 font-bold text-[10px]">{j.status}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#70665F]">No active manufacturing jobs for this customer.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
