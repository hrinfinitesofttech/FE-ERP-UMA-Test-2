'use client';

import React, { useMemo, useState } from 'react';
import { Scale, CheckCircle2, AlertTriangle } from 'lucide-react';
import { accountsApi, currentFY, inr, downloadCSV } from '../../../../lib/accountsApi';
import { PageHeader, FYSelect, PrintBtn, CsvBtn, Loading, ErrorBox, useAsync, card, th, td, num, CompanyHeader } from '../../../../components/accounting/AccUI';

const SECTIONS: { title: string; top: string[] }[] = [
  { title: 'Capital, Loans & Liabilities', top: ['Capital Account', 'Profit & Loss A/c', 'Loans (Liability)', 'Current Liabilities'] },
  { title: 'Assets & Investments', top: ['Fixed Assets', 'Investments', 'Current Assets'] },
  { title: 'Sales & Purchase Accounts', top: ['Sales Accounts', 'Purchase Accounts'] },
  { title: 'Incomes', top: ['Direct Incomes', 'Indirect Incomes'] },
  { title: 'Direct Expenses', top: ['Direct Expenses'] },
  { title: 'Indirect Expenses', top: ['Indirect Expenses'] },
];

export default function TrialBalancePage() {
  const [fy, setFy] = useState(currentFY());
  const [hideZero, setHideZero] = useState(true);
  const { data, loading, error, reload } = useAsync<any>(() => accountsApi.trialBalance(fy), [fy]);

  const sections = useMemo(() => {
    if (!data) return [];
    return SECTIONS.map((s) => {
      const lines = data.lines.filter((l: any) => s.top.includes(l.top_group) && (!hideZero || l.closing_dr || l.closing_cr || l.debit || l.credit));
      const groups: Record<string, any[]> = {};
      lines.forEach((l: any) => {
        const key = l.path.length > 1 ? l.path.slice(0, 2).join(' › ') : l.path[0];
        (groups[key] = groups[key] || []).push(l);
      });
      return { ...s, groups, dr: lines.reduce((a: number, l: any) => a + l.closing_dr, 0), cr: lines.reduce((a: number, l: any) => a + l.closing_cr, 0) };
    });
  }, [data, hideZero]);

  const exportCsv = () => {
    if (!data) return;
    downloadCSV(`trial-balance-${fy}.csv`, [
      ['Group', 'Ledger', 'Debit', 'Credit', 'Closing Dr', 'Closing Cr'],
      ...data.lines.map((l: any) => [l.group, l.ledger, l.debit, l.credit, l.closing_dr, l.closing_cr]),
      ['', 'TOTAL', '', '', data.total_dr, data.total_cr],
    ]);
  };

  return (
    <div className="p-6 space-y-4 bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)]">
      <PageHeader icon={<Scale className="w-6 h-6" />} title="Trial Balance" subtitle="All ledgers with closing Dr / Cr balances (Opening Stock included, Closing Stock excluded)">
        <FYSelect value={fy} onChange={setFy} />
        <label className="text-xs flex items-center gap-1.5"><input type="checkbox" checked={hideZero} onChange={(e) => setHideZero(e.target.checked)} /> Hide zero ledgers</label>
        <CsvBtn onClick={exportCsv} /><PrintBtn />
      </PageHeader>
      {loading ? <Loading /> : error ? <ErrorBox msg={error} retry={reload} /> : data && (
        <div className={card}>
          <CompanyHeader title="TRIAL BALANCE" sub={`${data.from} to ${data.to}`} />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[color:var(--crm-surface-subtle)]">
                <tr><th className={th}>Particulars</th><th className={`${th} text-right`}>Debit (Period)</th><th className={`${th} text-right`}>Credit (Period)</th><th className={`${th} text-right`}>Closing Dr</th><th className={`${th} text-right`}>Closing Cr</th></tr>
              </thead>
              <tbody>
                {sections.map((s) => (
                  <React.Fragment key={s.title}>
                    <tr className="bg-blue-50/60"><td colSpan={3} className={`${td} font-bold`}>{s.title}</td><td className={`${td} ${num} font-bold`}>{inr(s.dr)}</td><td className={`${td} ${num} font-bold`}>{inr(s.cr)}</td></tr>
                    {Object.entries(s.groups).map(([g, ls]) => (
                      <React.Fragment key={g}>
                        <tr><td colSpan={5} className={`${td} font-semibold text-[color:var(--crm-text-secondary)] pl-4`}>{g}</td></tr>
                        {ls.map((l: any) => (
                          <tr key={l.ledger_id} className="border-t border-[color:var(--crm-border-default)]/50">
                            <td className={`${td} pl-8`}>{l.ledger}</td>
                            <td className={`${td} ${num}`}>{inr(l.debit)}</td><td className={`${td} ${num}`}>{inr(l.credit)}</td>
                            <td className={`${td} ${num}`}>{inr(l.closing_dr)}</td><td className={`${td} ${num}`}>{inr(l.closing_cr)}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[color:var(--crm-text-primary)] bg-[color:var(--crm-surface-subtle)]">
                  <td className={`${td} font-extrabold`} colSpan={3}>TOTAL</td>
                  <td className={`${td} ${num} font-extrabold`}>{inr(data.total_dr, false)}</td>
                  <td className={`${td} ${num} font-extrabold`}>{inr(data.total_cr, false)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className={`p-3 text-xs flex items-center gap-2 ${data.is_balanced ? 'text-emerald-700' : 'text-red-600'}`}>
            {data.is_balanced ? <><CheckCircle2 className="w-4 h-4" /> Trial balance is tallied (Dr = Cr).</> : <><AlertTriangle className="w-4 h-4" /> Difference of ₹{inr(data.difference, false)} — check opening balances (Dr/Cr).</>}
          </div>
        </div>
      )}
    </div>
  );
}
