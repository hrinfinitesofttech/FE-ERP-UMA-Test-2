'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { UserCheck, Building, Phone, Mail, MapPin, Receipt, Layers, Briefcase, FileText, Download } from 'lucide-react';

export default function Customer360Page() {
  const { customer360List } = useERP();
  const [selectedCustId, setSelectedCustId] = useState<string>('CUST-2026-0001');

  const customer = customer360List.find((c) => c.customerId === selectedCustId) || customer360List[0];

  if (!customer) {
    return (
      <div className="p-8 text-center bg-slate-950 min-h-screen text-slate-400">
        <h2 className="text-xl font-bold text-white mb-2">Customer 360° Profile</h2>
        <p>No customer records available or loading live data from API...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-100 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">{customer.customerName}</h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Consolidated Customer 360° Profile • GST: {customer.gstNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Select */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold">Select Customer:</span>
            <select
              value={selectedCustId}
              onChange={(e) => setSelectedCustId(e.target.value)}
              className="bg-transparent text-blue-400 font-bold outline-none cursor-pointer"
            >
              {customer360List.map((c) => (
                <option key={c.customerId} value={c.customerId} className="bg-slate-900 text-slate-200">
                  {c.customerName} ({c.customerCode})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-slate-400 font-sans block text-[10px]">Total Order Bookings</span>
          <div className="text-lg font-bold text-emerald-400">₹{customer.totalOrderValue.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-slate-400 font-sans block text-[10px]">Total Invoiced</span>
          <div className="text-lg font-bold text-white">₹{customer.totalInvoiced.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-slate-400 font-sans block text-[10px]">Outstanding Receivable</span>
          <div className="text-lg font-bold text-rose-400">₹{customer.outstandingReceivable.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-slate-400 font-sans block text-[10px]">Approved Credit Limit</span>
          <div className="text-lg font-bold text-cyan-400">₹{customer.creditLimit.toLocaleString()}</div>
        </div>
      </div>

      {/* Customer Contact & Address Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-400" /> Contact Person & Communication
          </h3>
          <div className="space-y-2 text-slate-300">
            <div>Contact Person: <strong className="text-white">{customer.contactPerson}</strong></div>
            <div>Email Address: <span className="text-cyan-400">{customer.email}</span></div>
            <div>Phone / Mobile: <span className="text-slate-200">{customer.phone}</span></div>
            <div>Location City: <span className="text-slate-200">{customer.city}</span></div>
          </div>
        </div>

        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" /> Active MTO Manufacturing Jobs
          </h3>
          <div className="space-y-2">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-cyan-400">JOB-2026-001</span>
                <p className="text-[10px] text-slate-400">10 KL Heavy SS 316L Chemical Reactor Vessel</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">In Production</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
