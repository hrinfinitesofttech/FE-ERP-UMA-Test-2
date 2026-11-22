'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, FileArchive, Printer, Search } from 'lucide-react';
import { useERP } from '../../../context/ERPContext';
import { printContent } from '../../../lib/printUtils';
import { toast } from '../../../context/ToastContext';
import { payrollApi, asList, money, errorText, downloadFile, currentPeriod, shiftPeriod, periodLabel } from '../../../lib/payrollApi';
import { card, inputCls, btn, btnPrimary, Loading, ErrorBanner } from '../attendance/_parts/shared';

const n = (v: any) => Number(v) || 0;

export default function PayslipsPage() {
  const { company, currentUser } = useERP() as any;
  const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' || currentUser?.roleName === 'Super Admin' || currentUser?.roleName === 'Admin';
  const [period, setPeriod] = useState(currentPeriod());
  const [rows, setRows] = useState<any[]>([]);
  const [sel, setSel] = useState<string>('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const list = asList(await payrollApi.list(period)).filter((r) => r.status !== 'Draft');
      setRows(list);
      setSel((cur) => (list.some((r) => r.id === cur) ? cur : list[0]?.id || ''));
    } catch (e) { setError(errorText(e, 'Could not load payslips')); } finally { setLoading(false); }
  }, [period]);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter((r) => !t || [r.employeeName, r.employeeId, r.department].some((x: string) => (x || '').toLowerCase().includes(t)));
  }, [rows, q]);
  const rec = rows.find((r) => r.id === sel);

  const dl = async (key: string, path: string, name: string) => {
    setBusy(key);
    try { await downloadFile(path, name); } catch (e) { toast.error(errorText(e)); } finally { setBusy(''); }
  };

  const earn: [string, any][] = rec ? [
    ['Basic Salary', rec.basicSalary], ['House Rent Allowance (HRA)', rec.hra],
    ...(n(rec.conveyanceAllowance) || n(rec.medicalAllowance) || n(rec.specialAllowance)
      ? ([['Conveyance Allowance', rec.conveyanceAllowance], ['Medical Allowance', rec.medicalAllowance], ['Special Allowance', rec.specialAllowance]] as [string, any][])
      : ([['Special & Other Allowances', rec.allowances]] as [string, any][])),
    ['Overtime', rec.overtimeAmount], ['Other Earnings', rec.otherEarnings], ['Reimbursements', rec.reimbursementAmount],
  ].filter(([l, v], i) => i === 0 || n(v) !== 0) as [string, any][] : [];
  const ded: [string, any][] = rec ? ([['Provident Fund (Employee)', rec.pfDeduction], ['ESI (Employee)', rec.esiDeduction], ['Professional Tax', rec.ptDeduction], ['Income Tax (TDS)', rec.tdsDeduction],
    ['Loan / Advance Recovery', rec.loanAdvanceRecovery], ['Other Deductions', rec.otherDeductions]] as [string, any][]).filter(([, v]) => n(v) !== 0) : [];
  const totalEarn = rec ? n(rec.grossEarnings) + n(rec.reimbursementAmount) : 0;
  const addr = [company?.address, company?.city, company?.state, company?.pincode].filter(Boolean).join(', ');

  return (
    <div className="p-4 md:p-6 space-y-4 text-[color:var(--crm-text-primary)]">
      <div className={`${card} p-5 flex flex-wrap items-center justify-between gap-3 print:hidden`}>
        <div>
          <h1 className="text-xl font-extrabold">Payslips</h1>
          <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">{isAdmin ? 'Approved and paid salary slips — download as PDF individually or all together.' : 'Your salary slips — available once HR approves the month.'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className={btn} onClick={() => setPeriod(shiftPeriod(period, -1))} aria-label="Previous month"><ChevronLeft className="w-3.5 h-3.5" /></button>
          <input type="month" value={period} onChange={(e) => e.target.value && setPeriod(e.target.value)} className={inputCls} aria-label="Month" />
          <button className={btn} onClick={() => setPeriod(shiftPeriod(period, 1))} aria-label="Next month"><ChevronRight className="w-3.5 h-3.5" /></button>
          {isAdmin && <button className={btn} disabled={!rows.length || !!busy} onClick={() => dl('zip', `/payroll-records/payslips-zip/?period=${period}`, `payslips-${period}.zip`)}><FileArchive className="w-3.5 h-3.5" /> {busy === 'zip' ? 'Preparing…' : `All PDFs (ZIP)`}</button>}
        </div>
      </div>

      {loading ? <Loading /> : error ? <ErrorBanner msg={error} retry={load} /> : rows.length === 0 ? (
        <div className={`${card} p-12 text-center text-xs text-slate-500`}>
          <p className="font-bold text-slate-700">No payslips for {periodLabel(period)}</p>
          <p className="mt-1">{isAdmin ? 'Payslips appear here after the month’s payroll is approved (HR → Monthly Payroll).' : 'Your payslip will appear here once HR approves this month’s salary.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4 items-start">
          {(isAdmin || rows.length > 1) && (
            <aside className={`${card} print:hidden`}>
              <div className="p-3 border-b border-[color:var(--crm-border-default)] relative">
                <Search className="w-3.5 h-3.5 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${rows.length} employees`} className={`${inputCls} w-full pl-8`} aria-label="Search payslips" />
              </div>
              <ul className="max-h-[70vh] overflow-y-auto p-2 space-y-1">
                {shown.map((r) => (
                  <li key={r.id}>
                    <button onClick={() => setSel(r.id)} className={`w-full text-left p-2.5 rounded-xl border cursor-pointer ${r.id === sel ? 'border-blue-500 bg-blue-50/60' : 'border-transparent hover:bg-slate-50'}`}>
                      <div className="text-xs font-bold truncate">{r.employeeName}</div>
                      <div className="flex justify-between text-[11px] text-slate-500"><span>{r.employeeId}</span><span className="font-mono">₹ {money(r.netSalary, false)}</span></div>
                    </button>
                  </li>
                ))}
                {shown.length === 0 && <li className="p-4 text-center text-xs text-slate-400">No match.</li>}
              </ul>
            </aside>
          )}

          {rec && (
            <section className="space-y-3 min-w-0">
              <div className="flex flex-wrap gap-2 print:hidden">
                <button className={btnPrimary} disabled={!!busy} onClick={() => dl('pdf', `/payroll-records/${rec.id}/payslip-pdf/`, `payslip-${rec.employeeId}-${period}.pdf`)}><Download className="w-3.5 h-3.5" /> {busy === 'pdf' ? 'Preparing…' : 'Download PDF'}</button>
                <button className={btn} onClick={() => printContent('printable-salary-payslip', { title: `Payslip_${rec.employeeName.replace(/\s+/g, '_')}_${rec.monthYear}` })}><Printer className="w-3.5 h-3.5" /> Print</button>
              </div>

              <div id="printable-salary-payslip" className="bg-white text-slate-900 rounded-2xl border border-slate-200 p-6 md:p-8 max-w-4xl space-y-5 print:border-0">
                <div className="flex justify-between items-start border-b-2 border-blue-700 pb-3 gap-4">
                  <div className="flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/uma-mark.png" alt="" className="w-11 h-11 object-contain shrink-0" />
                    <div>
                      <h2 className="text-xl font-black text-blue-800 tracking-tight">{company?.companyName || 'UMA TECHNO FAB'}</h2>
                      {addr && <p className="text-[11px] text-slate-600">{addr}</p>}
                      <p className="text-[11px] text-slate-600">{[company?.phone && `Ph: ${company.phone}`, company?.email, company?.gstin && `GSTIN: ${company.gstin}`].filter(Boolean).join(' | ')}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold">SALARY SLIP</div>
                    <div className="text-xs">For <b>{rec.monthYear}</b></div>
                    <div className="text-[10px] font-mono text-slate-500">Ref: {rec.payrollNumber}</div>
                  </div>
                </div>

                <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                  {[['Employee ID', rec.employeeId], ['Name', rec.employeeName], ['Department', rec.department], ['Designation', rec.designation], ['Date of joining', rec.joiningDate], ['PAN', rec.panNumber],
                    ['UAN (PF)', rec.uanNumber], ['ESI No.', rec.esiNumber], ['Bank', rec.bankName], ['Bank A/C', rec.bankAccountNo], ['IFSC', rec.bankIfsc], ['Calendar days', n(rec.calendarDays)], ['Paid days', n(rec.paidDays)], ['LOP days', n(rec.lossOfPayDays)]]
                    .map(([k, v]) => <div key={String(k)}><dt className="text-slate-500 text-[10px] font-semibold">{k}</dt><dd className="font-bold break-words">{v || '—'}</dd></div>)}
                </dl>

                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  <div className="border border-slate-300 rounded-xl overflow-hidden">
                    <div className="bg-slate-200 px-3 py-2 font-extrabold flex justify-between"><span>EARNINGS</span><span>₹</span></div>
                    <div className="p-3 space-y-1.5">{earn.map(([l, v]) => <div key={l} className="flex justify-between"><span>{l}</span><span className="font-mono">{money(v, false)}</span></div>)}
                      <div className="flex justify-between border-t border-slate-300 pt-2 font-extrabold"><span>Total Earnings</span><span className="font-mono">{money(totalEarn, false)}</span></div></div>
                  </div>
                  <div className="border border-slate-300 rounded-xl overflow-hidden">
                    <div className="bg-slate-200 px-3 py-2 font-extrabold flex justify-between"><span>DEDUCTIONS</span><span>₹</span></div>
                    <div className="p-3 space-y-1.5">{ded.length ? ded.map(([l, v]) => <div key={l} className="flex justify-between"><span>{l}</span><span className="font-mono">{money(v, false)}</span></div>) : <div className="text-slate-400">No deductions</div>}
                      <div className="flex justify-between border-t border-slate-300 pt-2 font-extrabold"><span>Total Deductions</span><span className="font-mono">{money(rec.totalDeductions, false)}</span></div></div>
                  </div>
                </div>

                <div className="flex justify-between items-center rounded-xl border-2 border-blue-700 bg-blue-50 px-4 py-3">
                  <span className="font-extrabold">NET PAY</span><span className="text-xl font-black font-mono">₹ {money(rec.netSalary, false)}</span>
                </div>
                {rec.status === 'Paid' && rec.paidDate && <p className="text-[11px] text-slate-600">Paid on {new Date(rec.paidDate).toLocaleDateString('en-IN')} via {rec.paymentMode || 'Bank Transfer'}{rec.paymentRef ? ` (Ref ${rec.paymentRef})` : ''}.</p>}
                <p className="text-[10px] text-slate-500">Employer contribution (not deducted): PF ₹{money(rec.employerPf, false)}, ESI ₹{money(rec.employerEsi, false)}. This is a computer-generated payslip and does not require a signature.</p>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
