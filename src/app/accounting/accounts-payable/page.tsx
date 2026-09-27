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
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#211B17]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[#EBE3DB]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-crm-brand-600/20 rounded-xl text-indigo-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">Accounts Payable (AP) Vendor Aging Analysis</h1>
            <p className="text-xs text-[#70665F] mt-0.5">Supplier Outstanding Matrix • 0-30, 31-60, 61-90, 90+ Days Payment Buckets</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-[#70665F]">Total Vendor Payables</div>
          <div className="text-lg font-bold text-indigo-400 font-mono">₹{totalAP?.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search supplier name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#3E2723]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden">
        <table className="w-full text-left text-xs text-[#544B45]">
          <thead className="bg-[#FAF7F2]/80 text-[#70665F] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EBE3DB]">
            <tr>
              <th className="py-3.5 px-4">Supplier Name</th>
              <th className="py-3.5 px-4 text-right text-emerald-400">0 - 30 Days</th>
              <th className="py-3.5 px-4 text-right text-crm-brand-500">31 - 60 Days</th>
              <th className="py-3.5 px-4 text-right text-amber-400">61 - 90 Days</th>
              <th className="py-3.5 px-4 text-right text-rose-400">&gt; 90 Days</th>
              <th className="py-3.5 px-4 text-right">Total Payable</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE3DB] font-mono">
            {filtered.map((p) => (
              <tr key={p.supplierId} className="hover:bg-white/40 transition">
                <td className="py-3.5 px-4 font-sans font-bold text-[#211B17]">{p.supplierName}</td>
                <td className="py-3.5 px-4 text-right text-emerald-400">₹{(p.days0to30 || p.days1_30 || p.current || 0)?.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-right text-crm-brand-500">₹{(p.days31to60 || p.days31_60 || 0)?.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-right text-amber-400">₹{(p.days61to90 || p.days61_90 || 0)?.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-right font-bold text-rose-400">₹{(p.days90Plus || 0)?.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-right font-bold text-[#211B17]">₹{p.totalOutstanding?.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-center font-sans">
                  <Link
                    href="/accounting/payments"
                    className="px-2.5 py-1 bg-crm-brand-700 hover:bg-crm-brand-600 text-[#211B17] text-[10px] font-semibold rounded-lg transition inline-flex items-center gap-1"
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
