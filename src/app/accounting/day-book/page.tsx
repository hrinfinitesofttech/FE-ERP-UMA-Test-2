'use client';

import React, { useEffect, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { accountsApi, inr, errMsg, downloadCSV } from '../../../lib/accountsApi';
import { toast } from '../../../context/ToastContext';
import { PageHeader, CsvBtn, PrintBtn, Loading, ErrorBox, useAsync, card, th, td, num, inputCls, btnPrimary, CompanyHeader } from '../../../components/accounting/AccUI';

const iso = (d: Date) => d.toISOString().slice(0, 10);
const fyStart = () => { const t = new Date(); return iso(new Date(t.getMonth() >= 3 ? t.getFullYear() : t.getFullYear() - 1, 3, 1)); };

export default function DayBookPage() {
  const [mode, setMode] = useState<'daybook' | 'ledger'>('daybook');
  const [from, setFrom] = useState(fyStart());
  const [to, setTo] = useState(iso(new Date()));
  const [ledgerId, setLedgerId] = useState('');
  const [vt, setVt] = useState('');
  const [q, setQ] = useState('');
  const ledgers = useAsync<any[]>(() => accountsApi.ledgers(), []);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true); setError('');
    try {
      if (mode === 'ledger') {
        if (!ledgerId) { setResult(null); setLoading(false); return; }
        setResult(await accountsApi.statement(Number(ledgerId), { from, to }));
      } else setResult(await accountsApi.dayBook({ from, to, voucher_type: vt, q }));
    } catch (e) { setError(errMsg(e)); toast.error(errMsg(e)); } finally { setLoading(false); }
  };
  useEffect(() => { setResult(null); if (mode === 'daybook') run(); /* eslint-disable-next-line */ }, [mode]);

  const exportCsv = () => {
    if (!result) return;
    if (mode === 'ledger') downloadCSV(`ledger-${result.ledger.name}.csv`, [['Date', 'Voucher', 'Type', 'Particulars', 'Debit', 'Credit', 'Balance'], ...result.rows.map((r: any) => [r.date, r.voucher_no, r.voucher_type, r.particulars, r.debit, r.credit, `${r.balance} ${r.balance_type}`])]);
    else downloadCSV('day-book.csv', [['Date', 'Voucher', 'Type', 'Ledger', 'Debit', 'Credit', 'Narration'], ...result.map((r: any) => [r.voucher_date, r.voucher_no, r.voucher_type, r.ledger_name, r.debit, r.credit, r.narration])]);
  };

  return (
    <div className="p-6 space-y-4 bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)]">
      <PageHeader icon={<ScrollText className="w-6 h-6" />} title="Day Book & Ledger Statement" subtitle="Every posting from all departments, or the running statement of one ledger">
        <CsvBtn onClick={exportCsv} /><PrintBtn />
      </PageHeader>
      <div className={`${card} p-4 flex flex-wrap items-end gap-3 print:hidden`}>
        <div className="flex rounded-xl overflow-hidden border border-[color:var(--crm-border-default)]">
          {(['daybook', 'ledger'] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={`px-3 py-2 text-xs font-semibold cursor-pointer ${mode === m ? 'bg-blue-600 text-white' : 'bg-white'}`}>{m === 'daybook' ? 'Day Book' : 'Ledger Statement'}</button>)}
        </div>
        <label className="text-xs">From<input type="date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label className="text-xs">To<input type="date" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} /></label>
        {mode === 'ledger' ? (
          <label className="text-xs min-w-[260px]">Ledger
            <select className={inputCls} value={ledgerId} onChange={(e) => setLedgerId(e.target.value)}>
              <option value="">Select ledger…</option>{(ledgers.data || []).map((l) => <option key={l.id} value={l.id}>{l.name} ({l.group_name})</option>)}
            </select>
          </label>
        ) : (
          <>
            <label className="text-xs">Voucher type
              <select className={inputCls} value={vt} onChange={(e) => setVt(e.target.value)}><option value="">All</option>{['Sales', 'Purchase', 'Receipt', 'Payment', 'Journal', 'Contra', 'Credit Note', 'Debit Note'].map((t) => <option key={t}>{t}</option>)}</select>
            </label>
            <label className="text-xs">Search<input className={inputCls} value={q} onChange={(e) => setQ(e.target.value)} placeholder="voucher / ledger / narration" /></label>
          </>
        )}
        <button className={btnPrimary} onClick={run}>Show</button>
      </div>

      {loading ? <Loading /> : error ? <ErrorBox msg={error} retry={run} /> : mode === 'ledger' && !result ? (
        <div className={`${card} p-8 text-center text-xs text-[color:var(--crm-text-secondary)]`}>Choose a ledger and press Show.</div>
      ) : mode === 'ledger' && result ? (
        <div className={card}>
          <CompanyHeader title={`LEDGER ACCOUNT — ${result.ledger.name}`} sub={`${result.from} to ${result.to}`} />
          <table className="w-full">
            <thead className="bg-[color:var(--crm-surface-subtle)]"><tr><th className={th}>Date</th><th className={th}>Voucher</th><th className={th}>Type</th><th className={th}>Particulars</th><th className={`${th} text-right`}>Debit</th><th className={`${th} text-right`}>Credit</th><th className={`${th} text-right`}>Balance</th></tr></thead>
            <tbody>
              <tr className="bg-blue-50/50 font-semibold"><td className={td} colSpan={6}>Opening balance</td><td className={`${td} ${num}`}>{inr(result.opening, false)} {result.opening_type}</td></tr>
              {result.rows.map((r: any, i: number) => (
                <tr key={i} className="border-t border-[color:var(--crm-border-default)]/50"><td className={td}>{r.date}</td><td className={`${td} font-mono`}>{r.voucher_no}</td><td className={td}>{r.voucher_type}</td><td className={td}>{r.particulars}</td>
                  <td className={`${td} ${num}`}>{inr(r.debit)}</td><td className={`${td} ${num}`}>{inr(r.credit)}</td><td className={`${td} ${num}`}>{inr(r.balance, false)} {r.balance_type}</td></tr>
              ))}
              <tr className="border-t-2 border-[color:var(--crm-text-primary)] font-extrabold"><td className={td} colSpan={4}>Total / Closing</td><td className={`${td} ${num}`}>{inr(result.total_debit, false)}</td><td className={`${td} ${num}`}>{inr(result.total_credit, false)}</td><td className={`${td} ${num}`}>{inr(result.closing, false)} {result.closing_type}</td></tr>
            </tbody>
          </table>
        </div>
      ) : mode === 'daybook' && Array.isArray(result) ? (
        <div className={card}>
          <CompanyHeader title="DAY BOOK" sub={`${from} to ${to}${result.length >= 1000 ? ' (latest 1000 lines)' : ''}`} />
          <table className="w-full">
            <thead className="bg-[color:var(--crm-surface-subtle)]"><tr><th className={th}>Date</th><th className={th}>Voucher</th><th className={th}>Type</th><th className={th}>Ledger</th><th className={`${th} text-right`}>Debit</th><th className={`${th} text-right`}>Credit</th><th className={th}>Narration</th></tr></thead>
            <tbody>
              {result.map((r: any) => (
                <tr key={r.id} className="border-t border-[color:var(--crm-border-default)]/50"><td className={td}>{r.voucher_date}</td><td className={`${td} font-mono`}>{r.voucher_no}</td><td className={td}>{r.voucher_type}</td><td className={td}>{r.ledger_name}</td>
                  <td className={`${td} ${num}`}>{inr(r.debit)}</td><td className={`${td} ${num}`}>{inr(r.credit)}</td><td className={`${td} text-[color:var(--crm-text-secondary)]`}>{r.narration}</td></tr>
              ))}
              {!result.length && <tr><td colSpan={7} className={`${td} text-center`}>No entries in this period.</td></tr>}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
