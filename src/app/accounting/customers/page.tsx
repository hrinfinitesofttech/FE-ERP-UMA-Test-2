'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Users, Search, DollarSign, FileText, ArrowUpRight, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function CustomerLedgersPage() {
  const { customers, salesInvoices, customerReceipts } = useERP();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.companyName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      c.customerCode?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      c.gstin?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#FAF7F2]  text-[#211B17]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[#EBE3DB]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-crm-brand-600/20 rounded-xl text-crm-brand-500">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#211B17]">Customer Financial Ledgers (AR)</h1>
            <p className="text-xs text-[#70665F] mt-0.5">Integrated with CRM Master • Live Invoiced Revenue & Collection Status</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-[#70665F]">Total Customer Receivables</div>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            ₹
            {salesInvoices
              .reduce((acc, inv) => acc + (inv.paymentStatus !== 'Paid' ? inv.grandTotal : 0), 0)
              ?.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#EBE3DB]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search customer, code or GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#3E2723]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          const custInvoices = salesInvoices.filter((i) => i.customerId === cust.id || i.customerName === cust.companyName);
          const totalInvoiced = custInvoices.reduce((a, b) => a + (b.grandTotal || 0), 0);
          const custReceipts = customerReceipts.filter((r) => r.customerId === cust.id || r.customerName === cust.companyName);
          const totalPaid = custReceipts.reduce((a, b) => a + (b.amountPaid ?? b.amount ?? 0), 0);
          const outstanding = Math.max(0, totalInvoiced - totalPaid);

          return (
            <div key={cust.id} className="bg-white p-5 rounded-2xl border border-[#EBE3DB] space-y-4 hover:border-crm-brand-600/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-crm-brand-500">{cust.customerCode}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-crm-brand-600/20 text-crm-brand- font-semibold">{cust.category?.toUpperCase()}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#211B17]">{cust.companyName}</h3>
                <div className="text-[11px] text-[#70665F] mt-1 flex items-center gap-1 font-mono">
                  <span>GSTIN: {cust.gstin || 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF7F2]/60 p-3 rounded-xl border border-[#EBE3DB] font-mono">
                <div>
                  <div className="text-[10px] text-[#70665F]">Total Billed</div>
                  <div className="text-[#3E2723] font-bold">₹{totalInvoiced?.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#70665F]">Outstanding</div>
                  <div className={`font-bold ${outstanding > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    ₹{outstanding?.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#EBE3DB]">
                <div className="text-[#70665F]">Credit Limit: ₹{(cust.creditLimit || 0)?.toLocaleString()}</div>
                <Link href="/accounting/receipts" className="text-emerald-400 hover:underline font-semibold flex items-center gap-1">
                  <span>Record Payment</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
