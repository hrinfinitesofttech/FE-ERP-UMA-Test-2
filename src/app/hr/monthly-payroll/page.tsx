'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Calculator, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Download, FileText, Landmark, Search, Settings2, Undo2, Wallet, Pencil, Eye, Trash2,
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import { payrollApi, asList, money, errorText, downloadFile, currentPeriod, shiftPeriod, periodLabel } from '../../../lib/payrollApi';
import {
  card, inputCls, btn, btnPrimary, thCls, Loading, ErrorBanner, Modal, Field, usePaged, Pager, useSorted, SortTh, downloadCsv, localISO,
} from '../attendance/_parts/shared';

const TONE: Record<string, string> = { Draft: 'bg-amber-100 text-amber-800', Approved: 'bg-blue-100 text-blue-800', Paid: 'bg-emerald-100 text-emerald-800' };
const n = (v: any) => Number(v) || 0;

export default function MonthlyPayrollPage() {
  const [period, setPeriod] = useState(currentPeriod());
  const [rows, setRows] = useState<any[]>([]);
  const [ready, setReady] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('ALL');
  const [dept, setDept] = useState('ALL');
  const [view, setView] = useState<any>(null);
  const [adj, setAdj] = useState<any>(null);
  const [payFor, setPayFor] = useState<any>(null);   // record | 'ALL'
  const [showSettings, setShowSettings] = useState(false);
  const [result, setResult] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [list, rd, sm] = await Promise.all([payrollApi.list(period), payrollApi.readiness(period), payrollApi.summary(period)]);
      setRows(asList(list)); setReady(rd); setSummary(sm);
    } catch (e) { setError(errorText(e, 'Could not load payroll')); } finally { setLoading(false); }
  }, [period]);
  useEffect(() => { setResult(null); load(); }, [load]);

  const run = async (key: string, fn: () => Promise<any>, ok: (r: any) => string) => {
    setBusy(key);
    try { const r = await fn(); toast.success(ok(r)); await load(); return r; }
    catch (e) { toast.error(errorText(e)); } finally { setBusy(''); }
  };

  const calculate = async () => {
    const locked = rows.filter((r) => r.status !== 'Draft').length;
    if (ready && !ready.monthComplete && !confirm(`${periodLabel(period)} is not over yet. Days that have not happened are NOT paid in this draft.\n\nCalculate anyway?`)) return;
    setBusy('calc');
    try {
      const r: any = await payrollApi.calculate(period, false);
      setResult(r);
      toast.success(`${r.created} created, ${r.updated} recalculated${r.skipped.length ? `, ${r.skipped.length} skipped` : ''}${locked ? ` (${locked} locked)` : ''}`);
      await load();
    } catch (e) { toast.error(errorText(e)); } finally { setBusy(''); }
  };

  const depts = useMemo(() => Array.from(new Set(rows.map((r) => r.department).filter(Boolean))).sort(), [rows]);
  const filtered = useMemo(() => rows.filter((r) => {
    const t = q.trim().toLowerCase();
    return (status === 'ALL' || r.status === status) && (dept === 'ALL' || r.department === dept) &&
      (!t || [r.employeeName, r.employeeId, r.department, r.payrollNumber].some((x: string) => (x || '').toLowerCase().includes(t)));
  }), [rows, q, status, dept]);
  const { sorted, sortKey, sortDir, toggle } = useSorted(filtered, {
    name: (r) => r.employeeName, gross: (r) => n(r.grossEarnings), ded: (r) => n(r.totalDeductions), net: (r) => n(r.netSalary), lop: (r) => n(r.lossOfPayDays), status: (r) => r.status,
  }, 'name');
  const paged = usePaged(sorted, `${q}|${status}|${dept}|${period}|${sortKey}|${sortDir}`, 25);

  const drafts = rows.filter((r) => r.status === 'Draft').length;
  const approved = rows.filter((r) => r.status === 'Approved').length;
  const paid = rows.filter((r) => r.status === 'Paid').length;
  const negative = rows.filter((r) => n(r.netSalary) < 0).length;

  const registerCsv = () => downloadCsv(`payroll-register-${period}.csv`, [
    ['Employee ID', 'Name', 'Department', 'Calendar days', 'Paid days', 'LOP days', 'OT hours', 'Basic', 'HRA', 'Allowances', 'Overtime', 'Other earnings', 'Gross', 'PF', 'ESI', 'PT', 'TDS', 'Loan EMI', 'Other deductions', 'Total deductions', 'Reimbursement', 'Net pay', 'Employer PF', 'Employer ESI', 'CTC', 'Status'],
    ...rows.map((r) => [r.employeeId, r.employeeName, r.department, r.calendarDays, r.paidDays, r.lossOfPayDays, r.overtimeHours, r.basicSalary, r.hra, r.allowances, r.overtimeAmount, r.otherEarnings, r.grossEarnings, r.pfDeduction, r.esiDeduction, r.ptDeduction, r.tdsDeduction, r.loanAdvanceRecovery, r.otherDeductions, r.totalDeductions, r.reimbursementAmount, r.netSalary, r.employerPf, r.employerEsi, r.totalCtc, r.status]),
  ]);
  const dl = async (path: string, name: string) => { try { await downloadFile(path, name); } catch (e) { toast.error(errorText(e)); } };

  const steps = [
    { label: 'Calculate', done: rows.length > 0 }, { label: 'Review & adjust', done: rows.length > 0 && drafts === 0 },
    { label: 'Approve', done: rows.length > 0 && drafts === 0 }, { label: 'Pay', done: rows.length > 0 && approved === 0 && drafts === 0 },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 text-[color:var(--crm-text-primary)]">
      <div className={`${card} p-5 flex flex-wrap items-center justify-between gap-3`}>
        <div>
          <h1 className="text-xl font-extrabold flex items-center gap-2"><Calculator className="w-6 h-6 text-emerald-700" /> Monthly Payroll</h1>
          <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">Attendance + leave + overtime + salary structure − PF/ESI/PT/TDS − loan EMI = net pay</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className={btn} onClick={() => setPeriod(shiftPeriod(period, -1))} aria-label="Previous month"><ChevronLeft className="w-3.5 h-3.5" /></button>
          <input type="month" value={period} onChange={(e) => e.target.value && setPeriod(e.target.value)} className={inputCls} aria-label="Payroll month" />
          <button className={btn} onClick={() => setPeriod(shiftPeriod(period, 1))} aria-label="Next month"><ChevronRight className="w-3.5 h-3.5" /></button>
          <button className={btn} onClick={() => setShowSettings(true)}><Settings2 className="w-3.5 h-3.5" /> Rules</button>
          <button className={btnPrimary} onClick={calculate} disabled={busy === 'calc' || loading}><Calculator className="w-3.5 h-3.5" /> {busy === 'calc' ? 'Calculating…' : rows.length ? 'Recalculate drafts' : `Calculate ${periodLabel(period)}`}</button>
        </div>
      </div>

      <ol className="flex flex-wrap gap-2 text-[11px] font-bold">
        {steps.map((s, i) => <li key={s.label} className={`px-3 py-1.5 rounded-full border ${s.done ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200 text-slate-500'}`}>{i + 1}. {s.label}{s.done ? ' ✓' : ''}</li>)}
      </ol>

      {loading && !ready ? <Loading /> : error ? <ErrorBanner msg={error} retry={load} /> : (
        <>
          {ready && (
            <div className={`${card} p-4 space-y-2`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Before you calculate — checks for {ready.label}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 text-xs">
                <Check ok={ready.missingStructure.length === 0} text={`${ready.withStructure} of ${ready.activeEmployees} employees have a salary structure`}
                  action={ready.missingStructure.length ? <Link href="/hr/salary-structures" className="underline font-bold">Add {ready.missingStructure.length} missing</Link> : undefined}
                  detail={ready.missingStructure.slice(0, 4).map((m: any) => m.employeeName).join(', ') + (ready.missingStructure.length > 4 ? '…' : '')} />
                <Check ok={ready.monthComplete} warn text={ready.monthComplete ? 'Month is complete' : 'Month is not over — future days will be unpaid in a draft'} />
                <Check ok={ready.pendingLeaves === 0} warn text={`${ready.pendingLeaves} leave request(s) still pending`} action={ready.pendingLeaves ? <Link href="/hr/leave-approvals" className="underline font-bold">Review</Link> : undefined} />
                <Check ok={ready.pendingRegularizations === 0} warn text={`${ready.pendingRegularizations} attendance regularization(s) pending`} action={ready.pendingRegularizations ? <Link href="/hr/attendance" className="underline font-bold">Review</Link> : undefined} />
                <Check ok={ready.pendingOvertime === 0} warn text={`${ready.pendingOvertime} overtime request(s) pending (unapproved OT is not paid)`} action={ready.pendingOvertime ? <Link href="/hr/overtime" className="underline font-bold">Review</Link> : undefined} />
                <Check ok={ready.missingBankCount === 0} warn text={`${ready.missingBankCount} employee(s) without a bank account on their profile`} />
              </div>
            </div>
          )}

          {result && (result.skipped.length > 0 || result.warnings.length > 0) && (
            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-900 space-y-1">
              {result.warnings.map((w: string) => <div key={w}>⚠ {w}</div>)}
              {result.skipped.length > 0 && <div><b>{result.skipped.length} skipped:</b> {result.skipped.slice(0, 6).map((s: any) => `${s.employeeName} (${s.reason})`).join('; ')}{result.skipped.length > 6 ? '…' : ''}</div>}
            </div>
          )}

          {rows.length > 0 && summary && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Tile label="Employees" value={summary.headcount} sub={`${drafts} draft · ${approved} approved · ${paid} paid`} />
              <Tile label="Gross earnings" value={`₹ ${money(summary.gross, false)}`} />
              <Tile label="Deductions" value={`₹ ${money(summary.ded, false)}`} sub={`PF ${money(summary.pf, false)} · ESI ${money(summary.esi, false)} · PT ${money(summary.pt, false)}`} />
              <Tile label="Net payable" value={`₹ ${money(summary.net, false)}`} tone="good" />
              <Tile label="Employer cost" value={`₹ ${money(summary.ctc, false)}`} sub={`incl. PF ${money(summary.epf, false)} + ESI ${money(summary.eesi, false)}`} />
            </div>
          )}
          {negative > 0 && <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {negative} employee(s) have a negative net pay — fix their deductions/loan EMI before approving.</div>}

          <div className={`${card} p-3 flex flex-wrap items-center gap-2`}>
            <div className="relative"><Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search employee…" className={`${inputCls} pl-8 w-52`} aria-label="Search" /></div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls} aria-label="Status"><option value="ALL">All statuses</option><option>Draft</option><option>Approved</option><option>Paid</option></select>
            <select value={dept} onChange={(e) => setDept(e.target.value)} className={inputCls} aria-label="Department"><option value="ALL">All departments</option>{depts.map((d) => <option key={d}>{d}</option>)}</select>
            <div className="ml-auto flex flex-wrap gap-2">
              <button className={btn} disabled={!drafts || !!busy || negative > 0} title={negative ? 'Fix negative net pay first' : ''}
                onClick={() => confirm(`Approve all ${drafts} draft payslips of ${periodLabel(period)}?\nLoan balances will be reduced and the salary journal posted to Accounts.`) && run('apprall', () => payrollApi.approveMonth(period), (r) => `${r.approved} approved${r.failed.length ? `, ${r.failed.length} failed: ${r.failed[0].error}` : ''}`)}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve all drafts ({drafts})</button>
              <button className={btn} disabled={!approved || !!busy} onClick={() => setPayFor('ALL')}><Wallet className="w-3.5 h-3.5" /> Pay all approved ({approved})</button>
              <button className={btn} disabled={!approved && !paid} onClick={() => dl(`/payroll-records/payslips-zip/?period=${period}`, `payslips-${period}.zip`)}><FileText className="w-3.5 h-3.5" /> Payslips ZIP</button>
              <button className={btn} disabled={!approved && !paid} onClick={() => dl(`/payroll-records/bank-sheet/?period=${period}`, `bank-transfer-${period}.csv`)}><Landmark className="w-3.5 h-3.5" /> Bank sheet</button>
              <button className={btn} disabled={!rows.length} onClick={registerCsv}><Download className="w-3.5 h-3.5" /> Register CSV</button>
            </div>
          </div>

          <div className={`${card} overflow-hidden`}>
            {rows.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                <Calculator className="w-9 h-9 mx-auto text-slate-300" />
                <p className="font-bold text-slate-700">No payroll for {periodLabel(period)} yet</p>
                <p>Check the list above, then press “Calculate”. You can recalculate drafts as often as you like.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-xs">
                  <thead className="bg-slate-50 border-b border-[color:var(--crm-border-default)]">
                    <tr>
                      <SortTh label="Employee" k="name" {...{ sortKey, sortDir, toggle }} />
                      <th className={thCls}>Days</th>
                      <SortTh label="Gross" k="gross" {...{ sortKey, sortDir, toggle }} className="text-right" />
                      <SortTh label="Deductions" k="ded" {...{ sortKey, sortDir, toggle }} className="text-right" />
                      <SortTh label="Net pay" k="net" {...{ sortKey, sortDir, toggle }} className="text-right" />
                      <SortTh label="Status" k="status" {...{ sortKey, sortDir, toggle }} />
                      <th className={`${thCls} text-right`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--crm-border-default)]">
                    {paged.slice.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-2.5"><div className="font-bold text-slate-900">{r.employeeName}</div><div className="text-[11px] text-slate-400">{r.employeeId} · {r.department}</div>
                          {(r.calcNotes || []).length > 0 && <div className="text-[10px] text-amber-700 mt-0.5">⚠ {(r.calcNotes || []).length} note(s)</div>}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px]"><div className="text-emerald-700 font-semibold">Paid {n(r.paidDays)}/{n(r.calendarDays)}</div>{n(r.lossOfPayDays) > 0 && <div className="text-rose-600">LOP {n(r.lossOfPayDays)}</div>}{n(r.overtimeHours) > 0 && <div className="text-amber-700">OT {n(r.overtimeHours)}h</div>}</td>
                        <td className="px-4 py-2.5 text-right font-mono">{money(r.grossEarnings)}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-rose-700">{money(r.totalDeductions)}</td>
                        <td className={`px-4 py-2.5 text-right font-mono font-extrabold ${n(r.netSalary) < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{money(r.netSalary, false)}</td>
                        <td className="px-4 py-2.5"><span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${TONE[r.status] || 'bg-slate-100'}`}>{r.status}</span></td>
                        <td className="px-4 py-2.5 text-right whitespace-nowrap space-x-1">
                          <button className={btn} onClick={() => setView(r)} title="Breakdown"><Eye className="w-3.5 h-3.5" /></button>
                          {r.status === 'Draft' && <>
                            <button className={btn} onClick={() => setAdj({ ...r, oe: String(n(r.otherEarnings)), od: String(n(r.otherDeductions)), tds: String(n(r.tdsDeduction)), remarks: r.remarks || '' })} title="Adjust"><Pencil className="w-3.5 h-3.5" /></button>
                            <button className={btn} disabled={!!busy} onClick={() => run(`ap${r.id}`, () => payrollApi.approve(r.id), () => `${r.employeeName} approved`)}><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Approve</button>
                            <button className={btn} disabled={!!busy} onClick={() => confirm(`Delete the draft for ${r.employeeName}?`) && run(`rm${r.id}`, () => payrollApi.remove(r.id), () => 'Draft deleted')} title="Delete draft"><Trash2 className="w-3.5 h-3.5 text-rose-600" /></button>
                          </>}
                          {r.status === 'Approved' && <>
                            <button className={btn} disabled={!!busy} onClick={() => setPayFor(r)}><Wallet className="w-3.5 h-3.5 text-emerald-700" /> Pay</button>
                            <button className={btn} disabled={!!busy} onClick={() => confirm(`Reopen ${r.employeeName}? It returns to Draft and loan recovery is reversed.`) && run(`ro${r.id}`, () => payrollApi.reopen(r.id), () => 'Reopened as Draft')} title="Reopen"><Undo2 className="w-3.5 h-3.5" /></button>
                          </>}
                          {r.status !== 'Draft' && <button className={btn} onClick={() => dl(`/payroll-records/${r.id}/payslip-pdf/`, `payslip-${r.employeeId}-${period}.pdf`)} title="Download payslip PDF"><FileText className="w-3.5 h-3.5 text-blue-700" /></button>}
                        </td>
                      </tr>
                    ))}
                    {paged.slice.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-slate-400">No payslips match the filters.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
            <Pager p={paged} />
          </div>
        </>
      )}

      {view && <BreakdownModal r={view} onClose={() => setView(null)} />}
      {adj && <AdjustModal r={adj} onClose={() => setAdj(null)} onSaved={() => { setAdj(null); load(); }} />}
      {payFor && <PayModal target={payFor} period={period} count={approved} onClose={() => setPayFor(null)} onDone={() => { setPayFor(null); load(); }} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

function Tile({ label, value, sub, tone }: { label: string; value: React.ReactNode; sub?: string; tone?: 'good' }) {
  return (
    <div className={`${card} p-4`}>
      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`text-lg font-extrabold mt-1 font-mono ${tone === 'good' ? 'text-emerald-700' : ''}`}>{value}</div>
      {sub && <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function Check({ ok, warn, text, action, detail }: { ok: boolean; warn?: boolean; text: string; action?: React.ReactNode; detail?: string }) {
  const cls = ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : warn ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-rose-50 border-rose-200 text-rose-800';
  return (
    <div className={`p-2.5 rounded-xl border ${cls}`}>
      <div className="flex items-center gap-2">{ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}<span className="flex-1">{text}</span>{action}</div>
      {!ok && detail && <div className="text-[11px] mt-1 opacity-80">{detail}</div>}
    </div>
  );
}

function BreakdownModal({ r, onClose }: { r: any; onClose: () => void }) {
  const Row = ({ l, v, neg }: { l: string; v: any; neg?: boolean }) => (n(v) !== 0 ? <div className="flex justify-between py-1 border-b border-slate-100"><span>{l}</span><span className={`font-mono ${neg ? 'text-rose-700' : ''}`}>{money(v, false)}</span></div> : null);
  return (
    <Modal title={`${r.employeeName} — ${r.monthYear}`} onClose={onClose} wide>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-4">
        {[['Calendar days', r.calendarDays], ['Paid days', r.paidDays], ['LOP days', r.lossOfPayDays], ['Weekly offs', r.weeklyOffs], ['Holidays', r.holidays], ['Present', r.presentDays], ['Paid leave', r.leaveDays], ['Late days', r.lateDays]].map(([l, v]) => (
          <div key={String(l)} className="p-2 rounded-lg bg-slate-50 border border-slate-100"><div className="text-[10px] text-slate-500">{l}</div><div className="font-bold font-mono">{String(n(v))}</div></div>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-4 text-xs">
        <div><h4 className="font-bold mb-1 text-emerald-800">Earnings</h4>
          <Row l="Basic" v={r.basicSalary} /><Row l="HRA" v={r.hra} /><Row l="Conveyance" v={r.conveyanceAllowance} /><Row l="Medical" v={r.medicalAllowance} /><Row l="Special" v={r.specialAllowance} />
          {!n(r.conveyanceAllowance) && !n(r.medicalAllowance) && !n(r.specialAllowance) && <Row l="Allowances" v={r.allowances} />}
          <Row l="Overtime" v={r.overtimeAmount} /><Row l="Other earnings" v={r.otherEarnings} />
          <div className="flex justify-between py-1.5 font-bold"><span>Gross</span><span className="font-mono">{money(r.grossEarnings, false)}</span></div>
          <Row l="Reimbursements (not taxable)" v={r.reimbursementAmount} /></div>
        <div><h4 className="font-bold mb-1 text-rose-800">Deductions</h4>
          <Row l="Provident Fund" v={r.pfDeduction} neg /><Row l="ESI" v={r.esiDeduction} neg /><Row l="Professional Tax" v={r.ptDeduction} neg /><Row l="TDS" v={r.tdsDeduction} neg />
          <Row l="Loan / advance EMI" v={r.loanAdvanceRecovery} neg /><Row l="Other deductions" v={r.otherDeductions} neg />
          <div className="flex justify-between py-1.5 font-bold"><span>Total</span><span className="font-mono">{money(r.totalDeductions, false)}</span></div>
          <div className="flex justify-between py-2 mt-1 rounded-lg bg-emerald-50 px-2 font-extrabold text-emerald-800"><span>NET PAY</span><span className="font-mono">₹ {money(r.netSalary, false)}</span></div></div>
      </div>
      {n(r.lopDeduction) > 0 && <p className="text-[11px] text-slate-500 mt-3">Salary lost to LOP this month: ₹ {money(r.lopDeduction, false)}</p>}
      {(r.loanRecoveryDetail || []).length > 0 && <p className="text-[11px] text-slate-500 mt-1">Loans recovered: {(r.loanRecoveryDetail || []).map((l: any) => `${l.loanNumber} ₹${money(l.amount, false)}`).join(', ')}</p>}
      {r.remarks && <p className="text-[11px] mt-2"><b>Remarks:</b> {r.remarks}</p>}
      {(r.calcNotes || []).length > 0 && <ul className="mt-3 space-y-1 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">{(r.calcNotes || []).map((x: string) => <li key={x}>⚠ {x}</li>)}</ul>}
      <p className="text-[11px] text-slate-400 mt-3">Employer contribution (not deducted): PF ₹{money(r.employerPf, false)} · ESI ₹{money(r.employerEsi, false)} · CTC ₹{money(r.totalCtc, false)}</p>
    </Modal>
  );
}

function AdjustModal({ r, onClose, onSaved }: { r: any; onClose: () => void; onSaved: () => void }) {
  const [oe, setOe] = useState(r.oe), [od, setOd] = useState(r.od), [tds, setTds] = useState(r.tds), [remarks, setRemarks] = useState(r.remarks);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if ([oe, od, tds].some((v) => !isFinite(Number(v)) || Number(v) < 0)) return toast.error('Amounts must be zero or more');
    setBusy(true);
    try { await payrollApi.adjust(r.id, { otherEarnings: Number(oe), otherDeductions: Number(od), tdsDeduction: Number(tds), remarks }); toast.success('Adjustment saved — totals recalculated'); onSaved(); }
    catch (e) { toast.error(errorText(e)); } finally { setBusy(false); }
  };
  return (
    <Modal title={`Adjust — ${r.employeeName}`} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Other earnings (bonus, arrears) ₹"><input type="number" min={0} className={`${inputCls} w-full`} value={oe} onChange={(e) => setOe(e.target.value)} /></Field>
        <Field label="Other deductions (canteen, fines) ₹"><input type="number" min={0} className={`${inputCls} w-full`} value={od} onChange={(e) => setOd(e.target.value)} /></Field>
        <Field label="TDS this month ₹"><input type="number" min={0} className={`${inputCls} w-full`} value={tds} onChange={(e) => setTds(e.target.value)} /></Field>
        <Field label="Remarks (printed for HR reference)"><textarea rows={2} className={`${inputCls} w-full`} value={remarks} onChange={(e) => setRemarks(e.target.value)} /></Field>
        <p className="text-[11px] text-slate-500">PF/ESI/PT are recalculated on the new gross. Adjustments survive “Recalculate drafts”.</p>
        <div className="flex justify-end gap-2"><button className={btn} onClick={onClose}>Cancel</button><button className={btnPrimary} onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button></div>
      </div>
    </Modal>
  );
}

function PayModal({ target, period, count, onClose, onDone }: { target: any; period: string; count: number; onClose: () => void; onDone: () => void }) {
  const all = target === 'ALL';
  const [mode, setMode] = useState('Bank Transfer'), [ref, setRef] = useState(''), [date, setDate] = useState(localISO()), [bank, setBank] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    const body = { paidDate: date, paymentMode: mode, paymentRef: ref, bankLedger: bank };
    try {
      if (all) { const r: any = await payrollApi.markPaidMonth(period, body); toast.success(`${r.paid} salaries marked as paid`); }
      else { await payrollApi.markPaid(target.id, body); toast.success(`${target.employeeName} marked as paid`); }
      onDone();
    } catch (e) { toast.error(errorText(e)); } finally { setBusy(false); }
  };
  return (
    <Modal title={all ? `Pay all approved salaries (${count})` : `Pay ${target.employeeName} — ₹ ${money(target.netSalary, false)}`} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Payment date"><input type="date" max={localISO()} className={`${inputCls} w-full`} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Mode"><select className={`${inputCls} w-full`} value={mode} onChange={(e) => setMode(e.target.value)}>{['Bank Transfer', 'Cheque', 'UPI', 'Cash'].map((m) => <option key={m}>{m}</option>)}</select></Field>
        {mode !== 'Cash' && <Field label="Bank account used (ledger name, optional)"><input className={`${inputCls} w-full`} value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Bank Account (Main)" /></Field>}
        <Field label="Batch / UTR / cheque reference"><input className={`${inputCls} w-full`} value={ref} onChange={(e) => setRef(e.target.value)} /></Field>
        <p className="text-[11px] text-slate-500">Posts “Salary Payable → Bank/Cash” in Accounts. This cannot be undone from here.</p>
        <div className="flex justify-end gap-2"><button className={btn} onClick={onClose}>Cancel</button><button className={btnPrimary} onClick={submit} disabled={busy}>{busy ? 'Posting…' : 'Confirm payment'}</button></div>
      </div>
    </Modal>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const [s, setS] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { payrollApi.settings().then(setS).catch((e) => toast.error(errorText(e))); }, []);
  const set = (k: string, v: any) => setS((o: any) => ({ ...o, [k]: v }));
  const save = async () => {
    setBusy(true);
    try { const body = { ...s, ptSlabs: s.ptSlabs.map((x: any) => ({ upto: x.upto === '' || x.upto === null ? null : Number(x.upto), pt: Number(x.pt) })) }; setS(await payrollApi.saveSettings(body)); toast.success('Payroll rules saved (applies from the next calculation)'); onClose(); }
    catch (e) { toast.error(errorText(e)); } finally { setBusy(false); }
  };
  return (
    <Modal title="Payroll rules" onClose={onClose} wide>
      {!s ? <Loading /> : (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Salary days basis"><select className={`${inputCls} w-full`} value={s.daysBasis} onChange={(e) => set('daysBasis', e.target.value)}><option value="calendar">Calendar days of the month</option><option value="fixed26">Fixed 26 days (overtime rate)</option><option value="fixed30">Fixed 30 days (overtime rate)</option></select></Field>
            <Field label="Overtime multiplier (default)"><input type="number" step="0.25" className={`${inputCls} w-full`} value={s.otMultiplier} onChange={(e) => set('otMultiplier', e.target.value)} /></Field>
            <Field label="PF rate % (employee = employer)"><input type="number" step="0.01" className={`${inputCls} w-full`} value={s.pfRate} onChange={(e) => set('pfRate', e.target.value)} /></Field>
            <Field label="PF wage ceiling ₹ (0 = no cap)"><input type="number" className={`${inputCls} w-full`} value={s.pfWageCeiling} onChange={(e) => set('pfWageCeiling', e.target.value)} /></Field>
            <Field label="ESI employee %"><input type="number" step="0.01" className={`${inputCls} w-full`} value={s.esiEmployeeRate} onChange={(e) => set('esiEmployeeRate', e.target.value)} /></Field>
            <Field label="ESI employer %"><input type="number" step="0.01" className={`${inputCls} w-full`} value={s.esiEmployerRate} onChange={(e) => set('esiEmployerRate', e.target.value)} /></Field>
            <Field label="ESI applies up to gross ₹"><input type="number" className={`${inputCls} w-full`} value={s.esiGrossCeiling} onChange={(e) => set('esiGrossCeiling', e.target.value)} /></Field>
            <Field label="Shift hours per day"><input type="number" step="0.5" className={`${inputCls} w-full`} value={s.shiftHours} onChange={(e) => set('shiftHours', e.target.value)} /></Field>
          </div>
          <Field label="Leave names treated as unpaid (comma separated)"><input className={`${inputCls} w-full`} value={s.unpaidLeaveKeywords} onChange={(e) => set('unpaidLeaveKeywords', e.target.value)} /></Field>
          <div>
            <div className="font-bold text-slate-600 mb-1">Professional tax slabs (monthly gross → PT ₹)</div>
            {s.ptSlabs.map((sl: any, i: number) => (
              <div key={i} className="flex items-center gap-2 mb-1">
                <span className="w-16 text-slate-500">up to ₹</span>
                <input type="number" className={`${inputCls} w-28`} value={sl.upto ?? ''} placeholder="no limit" disabled={i === s.ptSlabs.length - 1} onChange={(e) => set('ptSlabs', s.ptSlabs.map((x: any, j: number) => (j === i ? { ...x, upto: e.target.value } : x)))} aria-label={`Slab ${i + 1} upper limit`} />
                <span className="text-slate-500">PT ₹</span>
                <input type="number" className={`${inputCls} w-24`} value={sl.pt} onChange={(e) => set('ptSlabs', s.ptSlabs.map((x: any, j: number) => (j === i ? { ...x, pt: e.target.value } : x)))} aria-label={`Slab ${i + 1} tax`} />
              </div>
            ))}
            <p className="text-[11px] text-slate-400">Default is the Gujarat slab for male employees. Check with your CA before changing.</p>
          </div>
          <div className="flex justify-end gap-2"><button className={btn} onClick={onClose}>Cancel</button><button className={btnPrimary} onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save rules'}</button></div>
        </div>
      )}
    </Modal>
  );
}
