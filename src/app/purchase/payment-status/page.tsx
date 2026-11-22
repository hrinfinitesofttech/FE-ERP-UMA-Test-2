'use client';

import React, { useMemo, useState } from 'react';
import { Wallet } from 'lucide-react';
import { accountsApi, inr } from '../../../lib/accountsApi';
import { PageHeader, Loading, ErrorBox, useAsync, card, th, td, num, inputCls, Stat, StatusPill } from '../../../components/accounting/AccUI';

/** Read-only view for Purchase / Store: what Accounts has done with the payables they raised. */
export default function PurchasePaymentStatusPage() {
  const { data, loading, error, reload } = useAsync<any[]>(() => accountsApi.paymentRequests(), []);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  const rows = useMemo(() => (data || []).filter((r) =>
    (!status || r.status === status) &&
    (!q || [r.supplier_name, r.po_number, r.source_ref, r.request_no].some((x) => (x || '').toLowerCase().includes(q.toLowerCase())))), [data, q, status]);
  const tot = (s: string) => (data || []).filter((r) => r.status === s).reduce((a, r) => a + Number(r.balance ?? r.amount), 0);

  return (
    <div className="p-6 space-y-4 bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)]">
      <PageHeader icon={<Wallet className="w-6 h-6" />} title="Supplier Payment Status" subtitle="Live status of supplier payables from Accounts — GRN received, bill booked, approved, paid" />
      {loading ? <Loading /> : error ? <ErrorBox msg={error} retry={reload} /> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Awaiting approval" value={`₹ ${inr(tot('Pending'), false)}`} tone="bad" />
            <Stat label="Approved, to be paid" value={`₹ ${inr(tot('Approved'), false)}`} />
            <Stat label="Paid" value={(data || []).filter((r) => r.status === 'Paid').length} tone="good" />
            <Stat label="Rejected" value={(data || []).filter((r) => r.status === 'Rejected').length} />
          </div>
          <div className="flex gap-2">
            <input className={`${inputCls} max-w-xs`} placeholder="Search supplier / PO / bill…" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className={`${inputCls} !w-auto`} value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All</option>{['Pending', 'Approved', 'Paid', 'Rejected'].map((s) => <option key={s}>{s}</option>)}</select>
          </div>
          <div className={card}>
            <div className="overflow-x-auto"><table className="w-full min-w-[800px]">
              <thead className="bg-[color:var(--crm-surface-subtle)]"><tr><th className={th}>Supplier</th><th className={th}>PO</th><th className={th}>GRN / Bill</th><th className={th}>Due</th><th className={`${th} text-right`}>Amount</th><th className={`${th} text-right`}>Paid</th><th className={th}>Status</th><th className={th}>Payment ref</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-[color:var(--crm-border-default)]/50">
                    <td className={td}>{r.supplier_name}</td><td className={td}>{r.po_number || '-'}</td><td className={td}>{r.source_ref}<div className="text-[10px] text-[color:var(--crm-text-secondary)]">{r.source_type}</div></td>
                    <td className={td}>{r.due_date || '-'}</td><td className={`${td} ${num}`}>{inr(r.amount)}</td><td className={`${td} ${num}`}>{inr(r.paid_amount)}</td>
                    <td className={td}><StatusPill s={r.status} />{r.status === 'Rejected' && r.remarks ? <div className="text-[10px] text-red-600 mt-1">{r.remarks}</div> : null}</td>
                    <td className={`${td} font-mono`}>{r.payment_number || '-'}</td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={8} className={`${td} text-center text-[color:var(--crm-text-secondary)]`}>Nothing to show.</td></tr>}
              </tbody>
            </table></div>
          </div>
        </>
      )}
    </div>
  );
}
