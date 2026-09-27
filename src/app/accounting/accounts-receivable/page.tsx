'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { TrendingUp, Search, Clock, AlertTriangle, ArrowUpRight, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function AccountsReceivablePage() {
  const { receivableAging } = useERP();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = receivableAging.filter((r) => r.customerName?.toLowerCase().includes(searchTerm?.toLowerCase()));

  const totalAR = receivableAging.reduce((acc, r) => acc + r.totalOutstanding, 0);
  const total90Plus = receivableAging.reduce((acc, r) => acc + (r.days90Plus || 0), 0);

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#211B17]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[#EBE3DB]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">Accounts Receivable (AR) Aging Analysis</h1>
            <p className="text-xs text-[#70665F] mt-0.5">Customer Outstanding Matrix • 0-30, 31-60, 61-90, 90+ Days Aging Buckets</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-[#70665F]">Total Outstanding</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">₹{totalAR?.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#70665F]">Severe Overdue (&gt;90 Days)</div>
            <div className="text-lg font-bold text-rose-400 font-mono">₹{total90Plus?.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search customer name..."
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
              <th className="py-3.5 px-4">Customer Name</th>
              <th className="py-3.5 px-4 text-right text-emerald-400">0 - 30 Days</th>
              <th className="py-3.5 px-4 text-right text-crm-brand-500">31 - 60 Days</th>
              <th className="py-3.5 px-4 text-right text-amber-400">61 - 90 Days</th>
              <th className="py-3.5 px-4 text-right text-rose-400">&gt; 90 Days</th>
              <th className="py-3.5 px-4 text-right">Total Outstanding</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE3DB] font-mono">
            {filtered.map((r) => (
              <tr key={r.customerId} className="hover:bg-white/40 transition">
                <td className="py-3.5 px-4 font-sans font-bold text-[#211B17]">{r.customerName}</td>
                <td className="py-3.5 px-4 text-right text-emerald-400">₹{(r.days0to30 || r.days1_30 || r.current || 0)?.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-right text-crm-brand-500">₹{(r.days31to60 || r.days31_60 || 0)?.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-right text-amber-400">₹{(r.days61to90 || r.days61_90 || 0)?.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-right font-bold text-rose-400">₹{(r.days90Plus || 0)?.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-right font-bold text-[#211B17]">₹{r.totalOutstanding?.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-center font-sans">
                  <Link
                    href="/accounting/receipts"
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-[10px] font-semibold rounded-lg transition inline-flex items-center gap-1"
                  >
                    <span>Receipt</span>
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
