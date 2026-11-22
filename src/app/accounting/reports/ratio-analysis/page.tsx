'use client';

import React, { useState } from 'react';
import { Gauge } from 'lucide-react';
import { accountsApi, currentFY, inr, downloadCSV } from '../../../../lib/accountsApi';
import { PageHeader, FYSelect, PrintBtn, CsvBtn, Loading, ErrorBox, useAsync, card, th, td, num, Stat } from '../../../../components/accounting/AccUI';

const GROUP_LABELS: [string, string][] = [
  ['working_capital', 'Working Capital'], ['cash_in_hand', 'Cash-in-hand'], ['bank_accounts', 'Bank Accounts'], ['bank_od', 'Bank OD A/c.'],
  ['sundry_debtors', 'Sundry Debtors'], ['sundry_creditors', 'Sundry Creditors'], ['sales_accounts', 'Sales Accounts'],
  ['purchase_accounts', 'Purchase Accounts'], ['stock_in_hand', 'Stock-in-hand'], ['nett_profit', 'Nett Profit'],
];

export default function RatioAnalysisPage() {
  const [fy, setFy] = useState(currentFY());
  const { data, loading, error, reload } = useAsync<any>(() => accountsApi.ratios(fy), [fy]);

  const fmt = (r: any) => (r.value === null || r.value === undefined ? 'n/a' : r.unit === ':1' ? `${r.value.toFixed(2)} : 1` : r.unit === '%' ? `${r.value.toFixed(2)} %` : r.unit === 'days' ? `${r.value.toFixed(0)} days` : `${r.value.toFixed(2)} x`);

  return (
    <div className="p-6 space-y-4 bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)]">
      <PageHeader icon={<Gauge className="w-6 h-6" />} title="Ratio Analysis" subtitle="Principal groups and principal financial ratios">
        <FYSelect value={fy} onChange={setFy} />
        <CsvBtn onClick={() => data && downloadCSV(`ratio-analysis-${fy}.csv`, [['Ratio', 'Value', 'Formula'], ...data.ratios.map((r: any) => [r.label, fmt(r), r.formula]), [], ['Principal Group', 'Amount'], ...GROUP_LABELS.map(([k, l]) => [l, data.principal_groups[k]])])} />
        <PrintBtn />
      </PageHeader>
      {loading ? <Loading /> : error ? <ErrorBox msg={error} retry={reload} /> : data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {GROUP_LABELS.map(([k, l]) => (
              <Stat key={k} label={l} value={`₹ ${inr(data.principal_groups[k], false)}`} tone={k === 'nett_profit' ? (data.principal_groups[k] >= 0 ? 'good' : 'bad') : 'neutral'} />
            ))}
          </div>
          <div className={card}>
            <div className="px-4 py-3 border-b border-[color:var(--crm-border-default)] text-xs font-bold">Principal Financial Ratios — F.Y. {data.financial_year}</div>
            <table className="w-full">
              <thead className="bg-[color:var(--crm-surface-subtle)]"><tr><th className={th}>Ratio</th><th className={`${th} text-right`}>Value</th><th className={th}>Basis</th></tr></thead>
              <tbody>
                {data.ratios.map((r: any) => (
                  <tr key={r.key} className="border-t border-[color:var(--crm-border-default)]/50">
                    <td className={`${td} font-semibold`}>{r.label}</td>
                    <td className={`${td} ${num} font-bold`}>{fmt(r)}</td>
                    <td className={`${td} text-[color:var(--crm-text-secondary)]`}>{r.formula}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="p-3 text-[11px] text-[color:var(--crm-text-secondary)]">“n/a” means the denominator is zero (e.g. no sales or no current liabilities booked yet).</p>
          </div>
        </>
      )}
    </div>
  );
}
