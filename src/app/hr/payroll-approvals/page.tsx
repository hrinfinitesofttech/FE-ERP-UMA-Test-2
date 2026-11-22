'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronLeft, ChevronRight, ShieldCheck, Undo2 } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import { payrollApi, asList, money, errorText, currentPeriod, shiftPeriod, periodLabel } from '../../../lib/payrollApi';
import { card, inputCls, btn, btnPrimary, thCls, Loading, ErrorBanner } from '../attendance/_parts/shared';

const n = (v: any) => Number(v) || 0;

export default function PayrollApprovalPage() {
  const [period, setPeriod] = useState(currentPeriod());
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setRows(asList(await payrollApi.list(period))); } catch (e) { setError(errorText(e)); } finally { setLoading(false); }
  }, [period]);
  useEffect(() => { load(); }, [load]);

  const act = async (key: string, fn: () => Promise<any>, ok: string) => {
    setBusy(key);
    try { await fn(); toast.success(ok); await load(); } catch (e) { toast.error(errorText(e)); } finally { setBusy(''); }
  };

  const drafts = rows.filter((r) => r.status === 'Draft');
  const approved = rows.filter((r) => r.status === 'Approved');
  const paid = rows.filter((r) => r.status === 'Paid');
  const sum = (l: any[]) => l.reduce((a, r) => a + n(r.netSalary), 0);
  const blocked = drafts.filter((r) => n(r.netSalary) < 0).length;

  const Table = ({ list, actions }: { list: any[]; actions: (r: any) => React.ReactNode }) => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-xs">
        <thead className="bg-slate-50 border-b border-[color:var(--crm-border-default)]"><tr><th className={thCls}>Employee</th><th className={thCls}>Paid days</th><th className={`${thCls} text-right`}>Gross</th><th className={`${thCls} text-right`}>Net</th><th className={`${thCls} text-right`}></th></tr></thead>
        <tbody className="divide-y divide-[color:var(--crm-border-default)]">
          {list.map((r) => (
            <tr key={r.id}><td className="px-4 py-2.5"><div className="font-bold">{r.employeeName}</div><div className="text-[11px] text-slate-400">{r.employeeId} · {r.department}</div></td>
              <td className="px-4 font-mono">{n(r.paidDays)}/{n(r.calendarDays)}{n(r.lossOfPayDays) > 0 && <span className="text-rose-600"> · LOP {n(r.lossOfPayDays)}</span>}</td>
              <td className="px-4 text-right font-mono">{money(r.grossEarnings)}</td>
              <td className={`px-4 text-right font-mono font-bold ${n(r.netSalary) < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{money(r.netSalary, false)}</td>
              <td className="px-4 text-right whitespace-nowrap">{actions(r)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-4 text-[color:var(--crm-text-primary)]">
      <div className={`${card} p-5 flex flex-wrap items-center justify-between gap-3`}>
        <div>
          <h1 className="text-xl font-extrabold flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-emerald-700" /> Payroll Approval</h1>
          <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">Approving locks the payslip, reduces loan balances and posts the salary journal to Accounts. Details and adjustments are in <Link href="/hr/monthly-payroll" className="underline font-bold">Monthly Payroll</Link>.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className={btn} onClick={() => setPeriod(shiftPeriod(period, -1))} aria-label="Previous month"><ChevronLeft className="w-3.5 h-3.5" /></button>
          <input type="month" value={period} onChange={(e) => e.target.value && setPeriod(e.target.value)} className={inputCls} aria-label="Month" />
          <button className={btn} onClick={() => setPeriod(shiftPeriod(period, 1))} aria-label="Next month"><ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {loading ? <Loading /> : error ? <ErrorBanner msg={error} retry={load} /> : rows.length === 0 ? (
        <div className={`${card} p-12 text-center text-xs text-slate-500`}><p className="font-bold text-slate-700">No payroll for {periodLabel(period)}</p><p className="mt-1">Run the calculation first in Monthly Payroll.</p></div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[['Awaiting approval', drafts.length, sum(drafts), 'text-amber-700'], ['Approved — to pay', approved.length, sum(approved), 'text-blue-700'], ['Paid', paid.length, sum(paid), 'text-emerald-700']].map(([l, c, a, t]) => (
              <div key={String(l)} className={`${card} p-4`}><div className="text-[10px] font-bold uppercase text-slate-500">{l}</div><div className={`text-2xl font-black ${t}`}>{String(c)}</div><div className="text-xs font-mono text-slate-500">₹ {money(a, false)}</div></div>
            ))}
          </div>

          <div className={card}>
            <div className="p-4 border-b border-[color:var(--crm-border-default)] flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold">Awaiting approval ({drafts.length})</h2>
              <button className={btnPrimary} disabled={!drafts.length || !!busy || blocked > 0} title={blocked ? 'Some payslips have negative net pay' : ''}
                onClick={() => confirm(`Approve all ${drafts.length} payslips of ${periodLabel(period)}?`) && act('all', () => payrollApi.approveMonth(period), 'All drafts approved')}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve all</button>
            </div>
            {blocked > 0 && <div className="m-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">{blocked} payslip(s) have negative net pay and cannot be approved. Adjust them in Monthly Payroll.</div>}
            {drafts.length === 0 ? <p className="p-8 text-center text-xs text-slate-400">Nothing waiting for approval.</p> :
              <Table list={drafts} actions={(r) => <button className={btn} disabled={!!busy || n(r.netSalary) < 0} onClick={() => act(r.id, () => payrollApi.approve(r.id), `${r.employeeName} approved`)}><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Approve</button>} />}
          </div>

          <div className={card}>
            <div className="p-4 border-b border-[color:var(--crm-border-default)]"><h2 className="text-sm font-bold">Approved, not yet paid ({approved.length})</h2></div>
            {approved.length === 0 ? <p className="p-8 text-center text-xs text-slate-400">No approved payslips waiting for payment.</p> :
              <Table list={approved} actions={(r) => <button className={btn} disabled={!!busy} onClick={() => confirm(`Reopen ${r.employeeName}? Loan recovery is reversed and the payslip returns to Draft.`) && act(`ro${r.id}`, () => payrollApi.reopen(r.id), 'Reopened as Draft')}><Undo2 className="w-3.5 h-3.5" /> Reopen</button>} />}
          </div>
        </>
      )}
    </div>
  );
}
