'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { payrollApi, money, errorText, currentPeriod, shiftPeriod, periodLabel } from '../../../lib/payrollApi';
import { card, inputCls, btn, thCls, Loading, ErrorBanner } from '../attendance/_parts/shared';

export default function PayrollDashboardPage() {
  const [period, setPeriod] = useState(currentPeriod());
  const [sum, setSum] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const [s, t] = await Promise.all([payrollApi.summary(period), payrollApi.trend()]); setSum(s); setTrend(t); }
    catch (e) { setError(errorText(e)); } finally { setLoading(false); }
  }, [period]);
  useEffect(() => { load(); }, [load]);

  const statuses = sum ? Object.entries(sum.byStatus || {}) as [string, any][] : [];
  const tiles = sum ? [
    ['Employees paid', sum.headcount, ''], ['Gross payroll', `₹ ${money(sum.gross, false)}`, ''], ['Net disbursement', `₹ ${money(sum.net, false)}`, 'text-emerald-700'],
    ['Employer cost (CTC)', `₹ ${money(sum.ctc, false)}`, ''], ['Statutory payable', `₹ ${money(n(sum.pf) + n(sum.epf) + n(sum.esi) + n(sum.eesi) + n(sum.pt) + n(sum.tds), false)}`, 'text-amber-700'], ['Loan recovered', `₹ ${money(sum.loan, false)}`, ''],
  ] : [];
  function n(v: any) { return Number(v) || 0; }

  return (
    <div className="p-4 md:p-6 space-y-4 text-[color:var(--crm-text-primary)]">
      <div className={`${card} p-5 flex flex-wrap items-center justify-between gap-3`}>
        <div><h1 className="text-xl font-extrabold">Payroll Dashboard</h1><p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">Live from the processed payroll — {periodLabel(period)}</p></div>
        <div className="flex items-center gap-2">
          <button className={btn} onClick={() => setPeriod(shiftPeriod(period, -1))} aria-label="Previous month"><ChevronLeft className="w-3.5 h-3.5" /></button>
          <input type="month" value={period} onChange={(e) => e.target.value && setPeriod(e.target.value)} className={inputCls} aria-label="Month" />
          <button className={btn} onClick={() => setPeriod(shiftPeriod(period, 1))} aria-label="Next month"><ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {loading ? <Loading /> : error ? <ErrorBanner msg={error} retry={load} /> : (
        <>
          {sum.headcount === 0 ? (
            <div className={`${card} p-10 text-center text-xs text-slate-500`}>No payroll processed for {periodLabel(period)}. <Link className="underline font-bold" href="/hr/monthly-payroll">Run payroll</Link></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {tiles.map(([l, v, c]) => <div key={String(l)} className={`${card} p-4`}><div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{l}</div><div className={`text-lg font-extrabold font-mono mt-1 ${c}`}>{String(v)}</div></div>)}
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {statuses.map(([s, v]) => <span key={s} className="px-3 py-1.5 rounded-full bg-white border border-slate-200 font-bold">{s}: {v.count} · ₹ {money(v.net, false)}</span>)}
              </div>
            </>
          )}

          <div className="grid lg:grid-cols-2 gap-4">
            <div className={`${card} p-4`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">Last 6 months</h3>
              {trend.length === 0 ? <p className="text-xs text-slate-400 py-10 text-center">No history yet.</p> : (
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={trend.map((t) => ({ ...t, label: t.period.slice(2).replace('-', '/') }))} margin={{ left: 0, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" fontSize={11} />
                      <YAxis fontSize={11} tickFormatter={(v) => (v >= 100000 ? `${(v / 100000).toFixed(1)}L` : `${Math.round(v / 1000)}k`)} />
                      <Tooltip formatter={(v: any) => `₹ ${money(v, false)}`} />
                      <Legend />
                      <Bar dataKey="gross" name="Gross" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="net" name="Net pay" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className={card}>
              <div className="p-4 border-b border-[color:var(--crm-border-default)]"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Department-wise salary</h3></div>
              <table className="w-full text-xs">
                <thead className="bg-slate-50"><tr><th className={thCls}>Department</th><th className={`${thCls} text-right`}>Staff</th><th className={`${thCls} text-right`}>Gross</th><th className={`${thCls} text-right`}>Net</th></tr></thead>
                <tbody className="divide-y divide-[color:var(--crm-border-default)]">
                  {(sum?.byDepartment || []).map((d: any) => <tr key={d.department}><td className="px-4 py-2 font-medium">{d.department}</td><td className="px-4 text-right">{d.headcount}</td><td className="px-4 text-right font-mono">{money(d.gross)}</td><td className="px-4 text-right font-mono font-bold">{money(d.net)}</td></tr>)}
                  {!(sum?.byDepartment || []).length && <tr><td colSpan={4} className="p-8 text-center text-slate-400">No data.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {[['/hr/salary-structures', 'Salary structures'], ['/hr/monthly-payroll', 'Monthly payroll'], ['/hr/payroll-approvals', 'Approvals'], ['/hr/payslips', 'Payslips'], ['/hr/advances', 'Advances & loans'], ['/hr/overtime', 'Overtime']].map(([h, l]) => <Link key={h} href={h} className="px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold hover:bg-slate-50">{l}</Link>)}
          </div>
        </>
      )}
    </div>
  );
}
