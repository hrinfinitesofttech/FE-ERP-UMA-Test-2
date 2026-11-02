'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Users, Search, ArrowUpRight, Filter } from 'lucide-react';
import Link from 'next/link';

export default function CustomerLedgersPage() {
  const { customers, salesInvoices, customerReceipts } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'with_activity' | 'all'>('with_activity');

  const customerStats = customers.map((cust) => {
    const custInvoices = salesInvoices.filter((i) => i.customerId === cust.id || i.customerName === cust.companyName);
    const totalInvoiced = custInvoices.reduce((a, b) => a + (Number(b.grandTotal) || 0), 0);
    const custReceipts = customerReceipts.filter((r) => r.customerId === cust.id || r.customerName === cust.companyName);
    const totalPaid = custReceipts.reduce((a, b) => a + (Number(b.amountPaid ?? (b as any).amount) || 0), 0);
    const outstanding = Math.max(0, totalInvoiced - totalPaid);
    const hasActivity = totalInvoiced > 0 || outstanding > 0;
    return {
      ...cust,
      totalInvoiced,
      totalPaid,
      outstanding,
      hasActivity,
    };
  });

  const activeCount = customerStats.filter((c) => c.hasActivity).length;

  const filteredCustomers = customerStats.filter((c) => {
    const matchesSearch =

      !searchTerm?.trim() || (

      c.companyName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      c.customerCode?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      c.gstin?.toLowerCase().includes(searchTerm?.toLowerCase())

    );
    const matchesFilter = filterMode === 'all' || c.hasActivity;
    return matchesSearch && matchesFilter;
  });

  const totalReceivables = salesInvoices.reduce(
    (acc, inv) => acc + (inv.paymentStatus !== 'Paid' ? (Number(inv.grandTotal) || 0) : 0),
    0
  );

  return (
    <div className="p-6 space-y-6 bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[color:var(--crm-border-default)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-crm-brand-600/20 rounded-xl text-crm-brand-500">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[color:var(--crm-text-primary)]">Customer Financial Ledgers (AR)</h1>
            <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">Integrated with CRM Master • Live Invoiced Revenue & Collection Status</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-[color:var(--crm-text-secondary)]">Total Customer Receivables</div>
          <div className="text-lg font-bold text-emerald-600 font-mono">
            ₹{totalReceivables.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--crm-text-secondary)]" />
          <input
            type="text"
            placeholder="Search customer, code or GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl pl-9 pr-4 py-2 text-xs text-[color:var(--crm-text-primary)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterMode('with_activity')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterMode === 'with_activity'
                ? 'bg-[color:var(--crm-text-primary)] text-white shadow-xs'
                : 'bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-secondary)] border border-[color:var(--crm-border-default)] hover:bg-white'
            }`}
          >
            With Activity ({activeCount})
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterMode === 'all'
                ? 'bg-[color:var(--crm-text-primary)] text-white shadow-xs'
                : 'bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-secondary)] border border-[color:var(--crm-border-default)] hover:bg-white'
            }`}
          >
            All Accounts ({customerStats.length})
          </button>
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[color:var(--crm-border-default)] text-center space-y-2">
          <p className="font-semibold text-xs text-[color:var(--crm-text-secondary)]">No customer accounts found with active transactions</p>
          <p className="text-[11px] text-[color:var(--crm-text-secondary)]">
            Click &quot;All Accounts&quot; to view registered customers with zero current balance.
          </p>
          <button
            onClick={() => setFilterMode('all')}
            className="mt-2 px-3.5 py-1.5 rounded-xl bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] text-xs font-bold text-[color:var(--crm-text-primary)] hover:bg-white"
          >
            View All Accounts
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => (
            <div key={cust.id} className="bg-white p-5 rounded-2xl border border-[color:var(--crm-border-default)] space-y-4 hover:border-crm-brand-600/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-crm-brand-500">{cust.customerCode}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-crm-brand-600/20 text-crm-brand- font-semibold">{cust.category?.toUpperCase() || 'STANDARD'}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)]">{cust.companyName}</h3>
                <div className="text-[11px] text-[color:var(--crm-text-secondary)] mt-1 flex items-center gap-1 font-mono">
                  <span>GSTIN: {cust.gstin || 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-[#F4F6FA]/60 p-3 rounded-xl border border-[color:var(--crm-border-default)] font-mono">
                <div>
                  <div className="text-[10px] text-[color:var(--crm-text-secondary)]">Total Billed</div>
                  <div className="text-[color:var(--crm-text-primary)] font-bold">₹{cust.totalInvoiced.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[color:var(--crm-text-secondary)]">Outstanding</div>
                  <div className={`font-bold ${cust.outstanding > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    ₹{cust.outstanding.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[color:var(--crm-border-default)]">
                <div className="text-[color:var(--crm-text-secondary)]">Credit Limit: ₹{(Number(cust.creditLimit) || 0).toLocaleString('en-IN')}</div>
                <Link href="/accounting/receipts" className="text-emerald-600 hover:underline font-semibold flex items-center gap-1">
                  <span>Record Payment</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
