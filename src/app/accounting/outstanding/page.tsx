'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { AlertTriangle, Bell, Mail, PhoneCall, CheckCircle2, Search, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function OutstandingRemindersPage() {
  const { salesInvoices, sendNotification } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [sentReminders, setSentReminders] = useState<string[]>([]);

  const overdueInvoices = salesInvoices.filter((inv) => inv.paymentStatus !== 'Paid');

  const filtered = overdueInvoices.filter(
    (inv) =>

      !searchTerm?.trim() ||

      inv.invoiceNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      inv.customerName?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const handleSendReminder = (invNumber: string, customerName: string) => {
    sendNotification({
      title: `Payment Overdue Reminder: ${invNumber}`,
      message: `Automated payment collection reminder sent to ${customerName} for overdue invoice ${invNumber}.`,
      type: 'warning',
      department: 'accounting',
      linkUrl: `/accounting/sales-invoices`,
      priority: 'high',
    });

    setSentReminders((prev) => [...prev, invNumber]);
  };

  return (
    <div className="p-6 space-y-6 bg-[color:var(--crm-bg-app)]  text-[color:var(--crm-text-primary)]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[color:var(--crm-border-default)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[color:var(--crm-text-primary)]">Outstanding Payment Reminders & Collection Portal</h1>
            <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">Automated Customer Follow-Up • Overdue Invoice Tracking & Multi-Channel Alerts</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-[color:var(--crm-text-secondary)]">Total Overdue Amount</div>
          <div className="text-lg font-bold text-amber-600 font-mono">
            ₹{overdueInvoices.reduce((acc, i) => acc + Math.max(0, Number(i.grandTotal || 0) - Number(i.paidAmount || 0)), 0)?.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[color:var(--crm-border-default)]">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--crm-text-secondary)]" />
          <input
            type="text"
            placeholder="Search invoice or customer..."
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
              <th className="py-3.5 px-4">Invoice Number</th>
              <th className="py-3.5 px-4">Customer Name</th>
              <th className="py-3.5 px-4">Invoice Date</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4 text-right">Overdue Amount</th>
              <th className="py-3.5 px-4 text-center">Collection Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--crm-border-default)] font-mono">
            {filtered.map((inv) => {
              const isReminded = sentReminders.includes(inv.invoiceNumber);
              const due = Math.max(0, Number(inv.grandTotal || 0) - Number(inv.paidAmount || 0));

              return (
                <tr key={inv.id} className="hover:bg-white/40 transition">
                  <td className="py-3.5 px-4 font-bold text-amber-700">{inv.invoiceNumber}</td>
                  <td className="py-3.5 px-4 font-sans font-semibold text-[color:var(--crm-text-primary)]">{inv.customerName}</td>
                  <td className="py-3.5 px-4 font-sans text-[color:var(--crm-text-secondary)]">{inv.invoiceDate}</td>
                  <td className="py-3.5 px-4 text-rose-500 font-sans font-semibold">{inv.dueDate}</td>
                  <td className="py-3.5 px-4 text-right font-black text-rose-700">₹{due.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 text-center font-sans">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleSendReminder(inv.invoiceNumber, inv.customerName)}
                        disabled={isReminded}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 ${
                          isReminded ? 'bg-slate-100 text-[color:var(--crm-text-secondary)] cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500 text-white font-bold'
                        }`}
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>{isReminded ? 'Reminder Sent' : 'Send Reminder'}</span>
                      </button>
                      <Link
                        href={`/accounting/customer-receipts?customerId=${encodeURIComponent(inv.customerId || '')}&invoiceId=${encodeURIComponent(inv.invoiceNumber || inv.id)}`}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition inline-flex items-center gap-1"
                      >
                        <span>Collect</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
