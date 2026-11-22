'use client';

import React, { useMemo, useState } from 'react';
import { FilePlus2, Plus, Trash2 } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import { accountsApi, inr, errMsg } from '../../../lib/accountsApi';
import { PageHeader, Loading, ErrorBox, useAsync, card, th, td, num, btnPrimary, btnGhost, inputCls, Field } from '../../../components/accounting/AccUI';

type Line = { ledger_id: string; debit: string; credit: string; narration: string };
const TYPES = ['Payment', 'Receipt', 'Journal', 'Contra'] as const;
const today = () => new Date().toISOString().slice(0, 10);
const blank = (): Line => ({ ledger_id: '', debit: '', credit: '', narration: '' });

export default function VoucherEntryPage() {
  const { data, loading, error, reload } = useAsync<{ ledgers: any[]; vouchers: any[] }>(
    async () => { const [ledgers, vouchers] = await Promise.all([accountsApi.ledgers(), accountsApi.vouchers()]); return { ledgers, vouchers }; }, []);
  const [type, setType] = useState<(typeof TYPES)[number]>('Payment');
  const [date, setDate] = useState(today());
  const [reference, setReference] = useState('');
  const [narration, setNarration] = useState('');
  const [account, setAccount] = useState('');           // Payment/Receipt: cash/bank ledger
  const [lines, setLines] = useState<Line[]>([blank(), blank()]);
  const [busy, setBusy] = useState(false);

  const ledgers = data?.ledgers || [];
  const simple = type === 'Payment' || type === 'Receipt';
  const cashBank = useMemo(() => ledgers.filter((l) => ['Cash-in-hand', 'Bank Accounts'].includes(l.group_name)), [ledgers]);
  const active = ledgers.filter((l) => l.status === 'Active');

  const amountOf = (l: Line) => Number(simple ? l.debit : l.debit) || 0;
  const totalDr = lines.reduce((a, l) => a + (Number(l.debit) || 0), 0);
  const totalCr = lines.reduce((a, l) => a + (Number(l.credit) || 0), 0);
  const simpleTotal = lines.reduce((a, l) => a + amountOf(l), 0);

  const reset = () => { setLines([blank(), blank()]); setNarration(''); setReference(''); };
  const setLine = (i: number, k: keyof Line, v: string) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, [k]: v } : l)));
  const onType = (t: (typeof TYPES)[number]) => { setType(t); reset(); setAccount(''); };

  const submit = async () => {
    let payload: Line[];
    if (simple) {
      if (!account) return toast.error(`Select the ${type === 'Payment' ? 'paid-from' : 'received-in'} cash/bank account`);
      const used = lines.filter((l) => l.ledger_id && Number(l.debit) > 0);
      if (!used.length) return toast.error('Add at least one account line with an amount');
      const total = used.reduce((a, l) => a + Number(l.debit), 0);
      payload = type === 'Payment'
        ? [...used.map((l) => ({ ledger_id: l.ledger_id, debit: l.debit, credit: '0', narration: l.narration })), { ledger_id: account, debit: '0', credit: String(total), narration: '' }]
        : [{ ledger_id: account, debit: String(total), credit: '0', narration: '' }, ...used.map((l) => ({ ledger_id: l.ledger_id, debit: '0', credit: l.debit, narration: l.narration }))];
    } else {
      payload = lines.filter((l) => l.ledger_id && (Number(l.debit) > 0 || Number(l.credit) > 0)).map((l) => ({ ...l, debit: l.debit || '0', credit: l.credit || '0' }));
      if (payload.length < 2) return toast.error('At least two ledger lines are required');
      if (Math.abs(totalDr - totalCr) > 0.004) return toast.error(`Not balanced: Dr ${inr(totalDr, false)} ≠ Cr ${inr(totalCr, false)}`);
    }
    setBusy(true);
    try {
      await accountsApi.createVoucher({ voucher_type: type, voucher_date: date, reference, narration, lines: payload.map((l) => ({ ...l, ledger_id: Number(l.ledger_id) })) });
      toast.success(`${type} voucher posted`); reset(); reload();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const del = async (id: number) => {
    if (!confirm('Delete this voucher and reverse its ledger postings?')) return;
    try { await accountsApi.deleteVoucher(id); toast.success('Voucher deleted'); reload(); } catch (e) { toast.error(errMsg(e)); }
  };

  const LedgerSelect = ({ value, onChange, list }: { value: string; onChange: (v: string) => void; list: any[] }) => (
    <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} aria-label="Ledger">
      <option value="">Select ledger…</option>
      {list.map((l) => <option key={l.id} value={l.id}>{l.name}  ({l.group_name})</option>)}
    </select>
  );

  return (
    <div className="p-6 space-y-4 bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)]">
      <PageHeader icon={<FilePlus2 className="w-6 h-6" />} title="Voucher Entry" subtitle="Payment, Receipt, Journal and Contra vouchers — every entry posts double-entry to the ledger instantly" />
      {loading ? <Loading /> : error ? <ErrorBox msg={error} retry={reload} /> : (
        <>
          <div className={`${card} p-5 space-y-4`}>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => <button key={t} onClick={() => onType(t)} className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border ${type === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-[color:var(--crm-border-default)]'}`}>{t}</button>)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Date"><input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
              <Field label="Reference / Cheque / UTR"><input className={inputCls} value={reference} onChange={(e) => setReference(e.target.value)} /></Field>
              {simple && <Field label={type === 'Payment' ? 'Paid from (Cash / Bank)' : 'Received in (Cash / Bank)'}><LedgerSelect value={account} onChange={setAccount} list={cashBank} /></Field>}
            </div>
            <table className="w-full">
              <thead className="bg-[color:var(--crm-surface-subtle)]"><tr>
                <th className={th}>{simple ? 'Particulars (account)' : 'Ledger'}</th>
                {simple ? <th className={`${th} text-right w-40`}>Amount (₹)</th> : <><th className={`${th} text-right w-36`}>Debit (₹)</th><th className={`${th} text-right w-36`}>Credit (₹)</th></>}
                <th className={th}>Line narration</th><th className="w-8" />
              </tr></thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={i} className="border-t border-[color:var(--crm-border-default)]/50">
                    <td className="p-1"><LedgerSelect value={l.ledger_id} onChange={(v) => setLine(i, 'ledger_id', v)} list={active} /></td>
                    <td className="p-1"><input type="number" min={0} step="0.01" className={`${inputCls} text-right font-mono`} value={l.debit} onChange={(e) => setLine(i, 'debit', e.target.value)} aria-label="Debit" /></td>
                    {!simple && <td className="p-1"><input type="number" min={0} step="0.01" className={`${inputCls} text-right font-mono`} value={l.credit} onChange={(e) => setLine(i, 'credit', e.target.value)} aria-label="Credit" /></td>}
                    <td className="p-1"><input className={inputCls} value={l.narration} onChange={(e) => setLine(i, 'narration', e.target.value)} /></td>
                    <td className="p-1">{lines.length > 2 && <button onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))} className="text-red-600 cursor-pointer" aria-label="Remove line"><Trash2 className="w-4 h-4" /></button>}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr className="border-t-2 border-[color:var(--crm-text-primary)] font-bold">
                <td className={td}><button className={btnGhost} onClick={() => setLines((ls) => [...ls, blank()])}><Plus className="w-3.5 h-3.5" /> Add line</button></td>
                {simple ? <td className={`${td} ${num}`}>{inr(simpleTotal, false)}</td> : <><td className={`${td} ${num}`}>{inr(totalDr, false)}</td><td className={`${td} ${num} ${Math.abs(totalDr - totalCr) > 0.004 ? 'text-red-600' : 'text-emerald-700'}`}>{inr(totalCr, false)}</td></>}
                <td colSpan={2} className={`${td} text-xs font-normal`}>{!simple && (Math.abs(totalDr - totalCr) > 0.004 ? `Difference ₹${inr(Math.abs(totalDr - totalCr), false)}` : totalDr > 0 ? 'Balanced ✓' : '')}</td>
              </tr></tfoot>
            </table>
            <Field label="Narration"><textarea className={inputCls} rows={2} value={narration} onChange={(e) => setNarration(e.target.value)} /></Field>
            <button className={btnPrimary} onClick={submit} disabled={busy}>{busy ? 'Posting…' : `Post ${type} voucher`}</button>
          </div>

          <div className={card}>
            <div className="px-4 py-3 border-b border-[color:var(--crm-border-default)] text-xs font-bold">Recent vouchers</div>
            <table className="w-full">
              <thead className="bg-[color:var(--crm-surface-subtle)]"><tr><th className={th}>Voucher</th><th className={th}>Type</th><th className={th}>Date</th><th className={th}>Narration</th><th className={`${th} text-right`}>Amount</th><th /></tr></thead>
              <tbody>
                {(data?.vouchers || []).slice(0, 30).map((v) => (
                  <tr key={v.id} className="border-t border-[color:var(--crm-border-default)]/50">
                    <td className={`${td} font-mono`}>{v.voucher_no}</td><td className={td}>{v.voucher_type}</td><td className={td}>{v.voucher_date}</td>
                    <td className={td}>{v.narration}</td><td className={`${td} ${num}`}>{inr(v.total_amount)}</td>
                    <td className={td}>{!String(v.voucher_no).startsWith('DEP-') && <button onClick={() => del(v.id)} className="text-red-600 cursor-pointer" aria-label="Delete voucher"><Trash2 className="w-4 h-4" /></button>}</td>
                  </tr>
                ))}
                {!data?.vouchers?.length && <tr><td colSpan={6} className={`${td} text-center text-[color:var(--crm-text-secondary)]`}>No manual vouchers yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
