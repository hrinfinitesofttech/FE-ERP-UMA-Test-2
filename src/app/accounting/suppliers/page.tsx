'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Building, Search, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function SupplierLedgersPage() {
  const { suppliers, purchaseInvoices, supplierPayments } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'with_activity' | 'all'>('all');

  const supplierStats = suppliers.map((supp) => {
    const suppInvoices = purchaseInvoices.filter((i) => i.supplierId === supp.id || i.supplierName === supp.supplierName);
    const totalBilled = suppInvoices.reduce((a, b) => a + (Number(b.grandTotal) || 0), 0);
    const suppPays = supplierPayments.filter((p) => p.supplierId === supp.id || p.supplierName === supp.supplierName);
    const totalPaid = suppPays.reduce((a, b) => a + (Number(b.amountPaid ?? (b as any).amount) || 0), 0);
    const outstanding = Math.max(0, totalBilled - totalPaid);
    const hasActivity = totalBilled > 0 || outstanding > 0;
    return {
      ...supp,
      totalBilled,
      totalPaid,
      outstanding,
      hasActivity,
    };
  });

  const activeCount = supplierStats.filter((s) => s.hasActivity).length;

  const filteredSuppliers = supplierStats.filter((s) => {
    const matchesSearch =

      !searchTerm?.trim() || (

      (s.supplierName || (s as any).name || '')?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      (s.supplierCode || (s as any).code || '')?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      s.gstin?.toLowerCase().includes(searchTerm?.toLowerCase())

    );
    const matchesFilter = filterMode === 'all' || s.hasActivity;
    return matchesSearch && matchesFilter;
  });

  const totalPayables = purchaseInvoices.reduce(
    (acc, inv) => acc + (inv.paymentStatus !== 'Paid' ? (Number(inv.grandTotal) || 0) : 0),
    0
  );

  return (
    <div className="p-6 space-y-6 bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[color:var(--crm-border-default)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-crm-brand-600/20 rounded-xl text-indigo-700">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[color:var(--crm-text-primary)]">Supplier Financial Ledgers (AP)</h1>
            <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">Integrated with Purchase Master • Live Purchase Invoices & Payment Ledger</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-[color:var(--crm-text-secondary)]">Total Supplier Payables</div>
          <div className="text-lg font-bold text-indigo-600 font-mono">
            ₹{totalPayables.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--crm-text-secondary)]" />
          <input
            type="text"
            placeholder="Search supplier, code or GSTIN..."
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
            All Accounts ({supplierStats.length})
          </button>
        </div>
      </div>

      {filteredSuppliers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[color:var(--crm-border-default)] text-center space-y-2">
          <p className="font-semibold text-xs text-[color:var(--crm-text-secondary)]">No supplier accounts found with active transactions</p>
          <p className="text-[11px] text-[color:var(--crm-text-secondary)]">
            Click &quot;All Accounts&quot; to view registered suppliers with zero current balance.
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
          {filteredSuppliers.map((supp) => (
            <div key={supp.id} className="bg-white p-5 rounded-2xl border border-[color:var(--crm-border-default)] space-y-4 hover:border-crm-brand-600/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-500">{supp.supplierCode || (supp as any).code}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-crm-brand-600/20 text-indigo-600 font-semibold">{(supp.category || (supp as any).supplierType || 'Supplier')?.toUpperCase()}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)]">{supp.supplierName || (supp as any).name}</h3>
                <div className="text-[11px] text-[color:var(--crm-text-secondary)] mt-1 flex items-center gap-1 font-mono">
                  <span>GSTIN: {supp.gstin || 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-[#F4F6FA]/60 p-3 rounded-xl border border-[color:var(--crm-border-default)] font-mono">
                <div>
                  <div className="text-[10px] text-[color:var(--crm-text-secondary)]">Total Invoiced</div>
                  <div className="text-[color:var(--crm-text-primary)] font-bold">₹{supp.totalBilled.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[color:var(--crm-text-secondary)]">Payable Balance</div>
                  <div className={`font-bold ${supp.outstanding > 0 ? 'text-indigo-600' : 'text-emerald-600'}`}>
                    ₹{supp.outstanding.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[color:var(--crm-border-default)]">
                <div className="text-[color:var(--crm-text-secondary)]">Terms: {supp.paymentTerms || '30 Days'}</div>
                <Link href="/accounting/payments" className="text-indigo-600 hover:underline font-semibold flex items-center gap-1">
                  <span>Pay Vendor</span>
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
