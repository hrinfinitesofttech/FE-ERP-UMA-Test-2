'use client';

import React, { useState } from 'react';
import { HandCoins, Plus } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import { accountsApi, inr, errMsg } from '../../../lib/accountsApi';
import { PageHeader, Loading, ErrorBox, useAsync, card, th, td, num, btnPrimary, btnGhost, inputCls, Modal, Field, Stat, StatusPill } from '../../../components/accounting/AccUI';

export default function PaymentRequestsPage() {
  const [status, setStatus] = useState('');
  const { data, loading, error, reload } = useAsync<{ rows: any[]; summary: any }>(
    async () => { const [rows, summary] = await Promise.all([accountsApi.paymentRequests(status ? { status } : undefined), accountsApi.paymentSummary()]); return { rows, summary }; }, [status]);
  const [pay, setPay] = useState<any>(null);
  const [payForm, setPayForm] = useState({ amount: '', payment_mode: 'Bank Transfer', bank_name: '', reference_number: '', payment_date: new Date().toISOString().slice(0, 10) });
  const [neu, setNeu] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const act = async (fn: () => Promise<any>, ok: string) => {
    setBusy(true);
    try { await fn(); toast.success(ok); reload(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const openPay = (r: any) => { setPay(r); setPayForm((f) => ({ ...f, amount: String(r.balance) })); };
  const doPay = async () => {
    await act(() => accountsApi.payRequest(pay.id, { ...payForm, amount: payForm.amount }), 'Payment posted to ledger');
    setPay(null);
  };
  const create = async () => {
    if (!neu.supplier_name?.trim() || !(Number(neu.amount) > 0)) return toast.error('Supplier and a positive amount are required');
    await act(() => accountsApi.createPaymentRequest({ ...neu, source_type: neu.po_number ? 'PO Advance' : 'Manual', due_date: neu.due_date || null }), 'Payment request raised');
    setNeu(null);
  };

  const S = data?.summary;
  return (
    <div className="p-6 space-y-4 bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)]">
      <PageHeader icon={<HandCoins className="w-6 h-6" />} title="Payment Requests" subtitle="Payables raised automatically from Store (GRN) and Purchase bills — Accounts approves and pays; the department sees the status">
        <button className={btnPrimary} onClick={() => setNeu({ supplier_name: '', amount: '', department: 'Purchase', po_number: '', description: '', priority: 'Normal', due_date: '' })}><Plus className="w-3.5 h-3.5" /> New request</button>
      </PageHeader>
      {loading ? <Loading /> : error ? <ErrorBox msg={error} retry={reload} /> : data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['Pending', 'Approved', 'Paid', 'Rejected'] as const).map((s) => (
              <button key={s} onClick={() => setStatus(status === s ? '' : s)} className={`text-left cursor-pointer rounded-2xl ${status === s ? 'ring-2 ring-blue-500' : ''}`}>
                <Stat label={`${s} (${S[s].count})`} value={`₹ ${inr(S[s].amount, false)}`} tone={s === 'Pending' ? 'bad' : s === 'Paid' ? 'good' : 'neutral'} />
              </button>
            ))}
          </div>
          <div className={card}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-[color:var(--crm-surface-subtle)]"><tr><th className={th}>Request</th><th className={th}>From</th><th className={th}>Supplier</th><th className={th}>Reference</th><th className={th}>Due</th><th className={`${th} text-right`}>Amount</th><th className={`${th} text-right`}>Paid</th><th className={th}>Status</th><th className={th}></th></tr></thead>
                <tbody>
                  {data.rows.map((r) => (
                    <tr key={r.id} className="border-t border-[color:var(--crm-border-default)]/50">
                      <td className={`${td} font-mono`}>{r.request_no}</td>
                      <td className={td}>{r.department}<div className="text-[10px] text-[color:var(--crm-text-secondary)]">{r.source_type}</div></td>
                      <td className={td}>{r.supplier_name}</td>
                      <td className={td}>{r.source_ref}{r.po_number ? <div className="text-[10px] text-[color:var(--crm-text-secondary)]">PO {r.po_number}</div> : null}</td>
                      <td className={td}>{r.due_date || '-'}</td>
                      <td className={`${td} ${num}`}>{inr(r.amount)}</td><td className={`${td} ${num}`}>{inr(r.paid_amount)}</td>
                      <td className={td}><StatusPill s={r.status} /></td>
                      <td className={`${td} whitespace-nowrap`}>
                        {r.status === 'Pending' && <><button disabled={busy} className="text-blue-700 underline mr-3 cursor-pointer" onClick={() => act(() => accountsApi.approveRequest(r.id), 'Approved')}>Approve</button><button disabled={busy} className="text-red-600 underline mr-3 cursor-pointer" onClick={() => { const m = prompt('Reason for rejection?'); if (m !== null) act(() => accountsApi.rejectRequest(r.id, m), 'Rejected'); }}>Reject</button></>}
                        {(r.status === 'Pending' || r.status === 'Approved') && <button disabled={busy} className="text-emerald-700 font-semibold underline cursor-pointer" onClick={() => openPay(r)}>Pay</button>}
                      </td>
                    </tr>
                  ))}
                  {!data.rows.length && <tr><td colSpan={9} className={`${td} text-center text-[color:var(--crm-text-secondary)]`}>No payment requests{status ? ` with status ${status}` : ''}.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      {pay && (
        <Modal title={`Pay ${pay.request_no} — ${pay.supplier_name}`} onClose={() => setPay(null)}>
          <div className="space-y-3">
            <p className="text-xs">Outstanding: <b>₹{inr(pay.balance, false)}</b></p>
            <Field label="Amount (₹)"><input type="number" min={0} step="0.01" className={inputCls} value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} /></Field>
            <Field label="Payment date"><input type="date" className={inputCls} value={payForm.payment_date} onChange={(e) => setPayForm({ ...payForm, payment_date: e.target.value })} /></Field>
            <Field label="Mode"><select className={inputCls} value={payForm.payment_mode} onChange={(e) => setPayForm({ ...payForm, payment_mode: e.target.value })}>{['Bank Transfer', 'Cheque', 'UPI', 'Cash'].map((m) => <option key={m}>{m}</option>)}</select></Field>
            {payForm.payment_mode !== 'Cash' && <Field label="Bank account (ledger name, optional)"><input className={inputCls} value={payForm.bank_name} onChange={(e) => setPayForm({ ...payForm, bank_name: e.target.value })} placeholder="Bank Account (Main)" /></Field>}
            <Field label="Reference / UTR / Cheque no."><input className={inputCls} value={payForm.reference_number} onChange={(e) => setPayForm({ ...payForm, reference_number: e.target.value })} /></Field>
            <button className={btnPrimary} onClick={doPay} disabled={busy}>Confirm payment</button>
          </div>
        </Modal>
      )}
      {neu && (
        <Modal title="New payment request" onClose={() => setNeu(null)}>
          <div className="space-y-3">
            <Field label="Supplier / payee"><input className={inputCls} value={neu.supplier_name} onChange={(e) => setNeu({ ...neu, supplier_name: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount (₹)"><input type="number" min={0} step="0.01" className={inputCls} value={neu.amount} onChange={(e) => setNeu({ ...neu, amount: e.target.value })} /></Field>
              <Field label="Due date"><input type="date" className={inputCls} value={neu.due_date} onChange={(e) => setNeu({ ...neu, due_date: e.target.value })} /></Field>
              <Field label="PO number (optional)"><input className={inputCls} value={neu.po_number} onChange={(e) => setNeu({ ...neu, po_number: e.target.value })} /></Field>
              <Field label="Priority"><select className={inputCls} value={neu.priority} onChange={(e) => setNeu({ ...neu, priority: e.target.value })}>{['Low', 'Normal', 'High', 'Urgent'].map((p) => <option key={p}>{p}</option>)}</select></Field>
            </div>
            <Field label="Requesting department"><select className={inputCls} value={neu.department} onChange={(e) => setNeu({ ...neu, department: e.target.value })}>{['Purchase', 'Store', 'Production', 'Maintenance', 'HR', 'Projects', 'Other'].map((d) => <option key={d}>{d}</option>)}</select></Field>
            <Field label="Description"><textarea rows={2} className={inputCls} value={neu.description} onChange={(e) => setNeu({ ...neu, description: e.target.value })} /></Field>
            <button className={btnPrimary} onClick={create} disabled={busy}>Raise request</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
