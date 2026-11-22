'use client';

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { useERP } from '@/context/ERPContext';
import api from '@/lib/apiClient';
import { printContent } from '@/lib/printUtils';
import { Badge, Card, CardHeader, Empty, Notice, asList, btnGhost, btnPrimary, errMsg, statusTone } from '@/components/my/ui';

const inr = (v: any) =>
  `₹ ${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const n = (r: any, camel: string, snake: string) => r?.[camel] ?? r?.[snake] ?? 0;

export default function MyPayslipsPage() {
  const { currentUser, company } = useERP() as any;
  const empId = currentUser?.id as string | undefined;
  const [slips, setSlips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<any | null>(null);

  useEffect(() => {
    if (!empId) return;
    api.hr.payroll
      .list()
      .then((r) =>
        setSlips(
          asList(r)
            // own slips only; drafts are not visible to employees
            .filter((x: any) => (x.employeeId || x.employee_id) === empId && (x.status || 'Draft') !== 'Draft')
            .sort((a: any, b: any) => String(b.processedDate || b.processed_date || '').localeCompare(String(a.processedDate || a.processed_date || '')))
        )
      )
      .catch((e) => setError(errMsg(e, 'Could not load salary slips.')))
      .finally(() => setLoading(false));
  }, [empId]);

  const earnings = (s: any) => [
    ['Basic Salary', n(s, 'basicSalary', 'basic_salary')],
    ['HRA', s.hra],
    ['Allowances', s.allowances],
    ['Overtime', n(s, 'overtimeAmount', 'overtime_amount')],
  ];
  const deductions = (s: any) => [
    ['Provident Fund', n(s, 'pfDeduction', 'pf_deduction')],
    ['ESI', n(s, 'esiDeduction', 'esi_deduction')],
    ['Professional Tax', n(s, 'ptDeduction', 'pt_deduction')],
    ['TDS', n(s, 'tdsDeduction', 'tds_deduction')],
    ['Loan / Advance Recovery', n(s, 'loanAdvanceRecovery', 'loan_advance_recovery')],
    ['Other Deductions', n(s, 'otherDeductions', 'other_deductions')],
  ];

  return (
    <div className="space-y-5">
      {error && <Notice kind="error">{error}</Notice>}

      <Card>
        <CardHeader title="My Salary Slips" hint="Slips appear here after payroll is processed" />
        {loading ? (
          <Empty>Loading…</Empty>
        ) : slips.length === 0 ? (
          <Empty>No salary slips are available yet.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-[color:var(--crm-text-tertiary)] bg-[color:var(--crm-surface-subtle)]">
                  <th className="px-4 py-2.5">Month</th>
                  <th className="px-4 py-2.5 text-right">Present days</th>
                  <th className="px-4 py-2.5 text-right">Gross</th>
                  <th className="px-4 py-2.5 text-right">Deductions</th>
                  <th className="px-4 py-2.5 text-right">Net pay</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {slips.map((s) => (
                  <tr key={s.id} className="border-t border-[color:var(--crm-border-default)]">
                    <td className="px-4 py-2.5 font-semibold">{s.monthYear || s.month_year}</td>
                    <td className="px-4 py-2.5 text-right">{Number(n(s, 'presentDays', 'present_days'))} / {Number(n(s, 'workingDays', 'working_days'))}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{inr(n(s, 'grossEarnings', 'gross_earnings'))}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{inr(n(s, 'totalDeductions', 'total_deductions'))}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold">{inr(n(s, 'netSalary', 'net_salary'))}</td>
                    <td className="px-4 py-2.5"><Badge tone={statusTone(s.status)}>{s.status}</Badge></td>
                    <td className="px-4 py-2.5 text-right">
                      <button className={btnGhost} onClick={() => setOpen(s)}>
                        <Download className="w-3.5 h-3.5" /> View / Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Salary slip">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl my-6">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <div className="text-sm font-bold">Salary Slip — {open.monthYear || open.month_year}</div>
              <div className="flex items-center gap-2">
                <button className={btnPrimary} onClick={() => printContent('payslip-print', { title: `Salary Slip ${open.monthYear || open.month_year}`, orientation: 'portrait' })}>
                  <Download className="w-4 h-4" /> Download / Print PDF
                </button>
                <button aria-label="Close" className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer" onClick={() => setOpen(null)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div id="payslip-print" className="p-7 text-[13px] text-slate-900 bg-white">
              <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
                <div className="text-lg font-extrabold tracking-wide">{company?.name || 'UMA TECHNO FAB PRIVATE LIMITED'}</div>
                <div className="text-xs text-slate-600">Salary Slip for {open.monthYear || open.month_year}</div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mb-4 text-xs">
                <div><span className="text-slate-500">Employee:</span> <strong>{open.employeeName || open.employee_name}</strong></div>
                <div><span className="text-slate-500">Employee ID:</span> <strong>{open.employeeId || open.employee_id}</strong></div>
                <div><span className="text-slate-500">Department:</span> {open.department}</div>
                <div><span className="text-slate-500">Designation:</span> {open.designation}</div>
                <div><span className="text-slate-500">Working days:</span> {Number(n(open, 'workingDays', 'working_days'))}</div>
                <div><span className="text-slate-500">Present days:</span> {Number(n(open, 'presentDays', 'present_days'))}</div>
                <div><span className="text-slate-500">Leave days:</span> {Number(n(open, 'leaveDays', 'leave_days'))}</div>
                <div><span className="text-slate-500">Loss of pay days:</span> {Number(n(open, 'lossOfPayDays', 'loss_of_pay_days'))}</div>
                <div><span className="text-slate-500">Overtime hours:</span> {Number(n(open, 'overtimeHours', 'overtime_hours'))}</div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <div className="font-bold text-xs uppercase border-b border-slate-300 pb-1 mb-1.5">Earnings</div>
                  {earnings(open).map(([l, v]) => (
                    <div key={l as string} className="flex justify-between py-0.5 text-xs"><span>{l}</span><span className="font-mono">{inr(v)}</span></div>
                  ))}
                  <div className="flex justify-between border-t border-slate-300 mt-1.5 pt-1 font-bold text-xs"><span>Gross Earnings</span><span className="font-mono">{inr(n(open, 'grossEarnings', 'gross_earnings'))}</span></div>
                </div>
                <div>
                  <div className="font-bold text-xs uppercase border-b border-slate-300 pb-1 mb-1.5">Deductions</div>
                  {deductions(open).map(([l, v]) => (
                    <div key={l as string} className="flex justify-between py-0.5 text-xs"><span>{l}</span><span className="font-mono">{inr(v)}</span></div>
                  ))}
                  <div className="flex justify-between border-t border-slate-300 mt-1.5 pt-1 font-bold text-xs"><span>Total Deductions</span><span className="font-mono">{inr(n(open, 'totalDeductions', 'total_deductions'))}</span></div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-lg border-2 border-slate-800 px-4 py-3">
                <span className="font-extrabold text-sm uppercase">Net Pay</span>
                <span className="font-extrabold text-lg font-mono">{inr(n(open, 'netSalary', 'net_salary'))}</span>
              </div>
              <div className="mt-6 text-[10px] text-slate-500 text-center">This is a computer-generated salary slip and does not require a signature.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
