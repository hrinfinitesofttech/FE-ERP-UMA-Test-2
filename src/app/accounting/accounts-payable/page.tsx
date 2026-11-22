'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Clock, Search, Building, ArrowUpRight, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function AccountsPayablePage() {
  const { payableAging } = useERP();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = payableAging.filter((p) => p.supplierName?.toLowerCase().includes(searchTerm?.toLowerCase()));

  const totalAP = payableAging.reduce((acc, p) => acc + p.totalOutstanding, 0);

  return (
    <div className="p-6 space-y-6 bg-[color:var(--crm-bg-app)]  text-[color:var(--crm-text-primary)]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[color:var(--crm-border-default)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-crm-brand-600/20 rounded-xl text-indigo-700">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[color:var(--crm-text-primary)]">Accounts Payable (AP) Vendor Aging Analysis</h1>
            <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">Supplier Outstanding Matrix • 0-30, 31-60, 61-90, 90+ Days Payment Buckets</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-[color:var(--crm-text-secondary)]">Total Vendor Payables</div>
          <div className="text-lg font-bold text-indigo-700 font-mono">₹{totalAP?.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--crm-text-secondary)]" />
          <input
            type="text"
            placeholder="Search supplier name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl pl-9 pr-4 py-2 text-xs text-[color:var(--crm-text-primary)]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[color:var(--crm-border-default)] overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-xs text-[color:var(--crm-text-secondary)]">
          <thead className="bg-[#F4F6FA]/80 text-[color:var(--crm-text-secondary)] uppercase font-semibold text-[10px] tracking-wider border-b border-[color:var(--crm-border-default)]">
            <tr>
              <th className="py-3.5 px-4">Supplier Name</th>
              <th className="py-3.5 px-4 text-right text-emerald-700">0 - 30 Days</th>
              <th className="py-3.5 px-4 text-right text-crm-brand-500">31 - 60 Days</th>
              <th className="py-3.5 px-4 text-right text-amber-700">61 - 90 Days</th>
              <th className="py-3.5 px-4 text-right text-rose-700">&gt; 90 Days</th>
              <th className="py-3.5 px-4 text-right">Total Payable</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--crm-border-default)] font-mono">
            {filtered.map((p) => (
              <tr key={p.supplierId} className="hover:bg-white/40 transition">
                <td className="py-3.5 px-4 font-sans font-bold text-[color:var(--crm-text-primary)]">{p.supplierName}</td>
                <td className="py-3.5 px-4 text-right text-emerald-700">₹{(p.days0to30 || p.days1_30 || p.current || 0)?.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-right text-crm-brand-500">₹{(p.days31to60 || p.days31_60 || 0)?.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-right text-amber-700">₹{(p.days61to90 || p.days61_90 || 0)?.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-right font-bold text-rose-700">₹{(p.days90Plus || 0)?.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-right font-bold text-[color:var(--crm-text-primary)]">₹{p.totalOutstanding?.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-center font-sans">
                  <Link
                    href="/accounting/payments"
                    className="px-2.5 py-1 bg-crm-brand-700 hover:bg-crm-brand-600 text-[color:var(--crm-text-primary)] text-[10px] font-semibold rounded-lg transition inline-flex items-center gap-1"
                  >
                    <span>Pay Vendor</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
