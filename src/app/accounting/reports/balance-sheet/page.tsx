'use client';

import React, { useState } from 'react';
import { Building2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { accountsApi, currentFY, inr, downloadCSV } from '../../../../lib/accountsApi';
import { PageHeader, FYSelect, PrintBtn, CsvBtn, Loading, ErrorBox, useAsync, card, td, num, CompanyHeader } from '../../../../components/accounting/AccUI';

const Head = ({ label, amount }: { label: string; amount?: number }) => (
  <tr className="bg-blue-50/60"><td className={`${td} font-bold`}>{label}</td><td className={`${td} ${num} font-bold`}>{amount === undefined ? '' : inr(amount)}</td></tr>
);
const Item = ({ label, amount, indent = 1 }: { label: string; amount: number; indent?: number }) => (
  <tr className="border-t border-[color:var(--crm-border-default)]/40"><td className={td} style={{ paddingLeft: 12 + indent * 14 }}>{label}</td><td className={`${td} ${num}`}>{inr(amount)}</td></tr>
);

export default function BalanceSheetPage() {
  const [fy, setFy] = useState(currentFY());
  const { data, loading, error, reload } = useAsync<any>(() => accountsApi.balanceSheet(fy), [fy]);
  const L = data?.liabilities, A = data?.assets;

  const exportCsv = () => {
    if (!data) return;
    const rows: any[][] = [['Side', 'Group', 'Particulars', 'Amount']];
    const pushItems = (side: string, grp: string, items: any[]) => items.forEach((i) => rows.push([side, grp, i.name, i.amount]));
    pushItems('Liabilities', 'Capital Account', L.capital_account.items);
    pushItems('Liabilities', 'Loans (Liability)', L.loans.items);
    pushItems('Liabilities', 'Current Liabilities', L.current_liabilities.items);
    rows.push(['Liabilities', 'Profit & Loss A/c', 'Opening Balance', L.profit_loss.opening_balance], ['Liabilities', 'Profit & Loss A/c', 'Current Period', L.profit_loss.current_period]);
    pushItems('Assets', 'Fixed Assets', A.fixed_assets.items);
    pushItems('Assets', 'Investments', A.investments.items);
    rows.push(['Assets', 'Current Assets', 'Closing Stock', A.current_assets.closing_stock]);
    A.current_assets.groups.forEach((g: any) => pushItems('Assets', g.name, g.items));
    rows.push(['', '', 'Total Liabilities', L.total], ['', '', 'Total Assets', A.total]);
    downloadCSV(`balance-sheet-${fy}.csv`, rows);
  };

  return (
    <div className="p-6 space-y-4 bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)]">
      <PageHeader icon={<Building2 className="w-6 h-6" />} title="Balance Sheet" subtitle="Capital, loans & liabilities against fixed assets, investments & current assets">
        <FYSelect value={fy} onChange={setFy} /><CsvBtn onClick={exportCsv} /><PrintBtn />
      </PageHeader>
      {loading ? <Loading /> : error ? <ErrorBox msg={error} retry={reload} /> : data && (
        <div className={card}>
          <CompanyHeader title="BALANCE SHEET" sub={`as on ${data.as_on}`} />
          <div className="flex flex-wrap divide-x divide-[color:var(--crm-border-default)]">
            <div className="flex-1 min-w-[320px]">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wide bg-[color:var(--crm-surface-subtle)]">Liabilities</div>
              <table className="w-full"><tbody>
                <Head label="Capital Account" amount={L.capital_account.total} />
                {L.capital_account.items.map((i: any) => <Item key={i.name} label={i.name} amount={i.amount} />)}
                <Head label="Loans (Liability)" amount={L.loans.total} />
                {L.loans.items.map((i: any) => <Item key={i.name} label={i.name} amount={i.amount} />)}
                <Head label="Current Liabilities" amount={L.current_liabilities.total} />
                {L.current_liabilities.items.filter((i: any) => i.amount !== 0).map((i: any) => <Item key={i.name} label={`${i.name}`} amount={i.amount} />)}
                <Head label="Profit & Loss A/c" amount={L.profit_loss.total} />
                <Item label="Opening Balance" amount={L.profit_loss.opening_balance} />
                <Item label="Current Period" amount={L.profit_loss.current_period} />
                {L.difference_in_books > 0 && <Head label="Difference in Opening Balances" amount={L.difference_in_books} />}
              </tbody>
              <tfoot><tr className="border-t-2 border-[color:var(--crm-text-primary)]"><td className={`${td} font-extrabold`}>Total</td><td className={`${td} ${num} font-extrabold`}>{inr(L.total, false)}</td></tr></tfoot></table>
            </div>
            <div className="flex-1 min-w-[320px]">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wide bg-[color:var(--crm-surface-subtle)]">Assets</div>
              <table className="w-full"><tbody>
                <Head label="Fixed Assets" amount={A.fixed_assets.total} />
                {A.fixed_assets.items.map((i: any) => <Item key={i.name} label={i.name} amount={i.amount} />)}
                <Head label="Investments" amount={A.investments.total} />
                {A.investments.items.map((i: any) => <Item key={i.name} label={i.name} amount={i.amount} />)}
                <Head label="Current Assets" amount={A.current_assets.total} />
                <Item label="Closing Stock" amount={A.current_assets.closing_stock} />
                {A.current_assets.groups.map((g: any) => (
                  <React.Fragment key={g.name}>
                    <Item label={g.name} amount={g.total} />
                    {g.items.filter((i: any) => i.amount !== 0 && i.name !== g.name).map((i: any) => <Item key={i.name} label={i.name} amount={i.amount} indent={2} />)}
                  </React.Fragment>
                ))}
                {A.difference_in_books > 0 && <Head label="Difference in Opening Balances" amount={A.difference_in_books} />}
              </tbody>
              <tfoot><tr className="border-t-2 border-[color:var(--crm-text-primary)]"><td className={`${td} font-extrabold`}>Total</td><td className={`${td} ${num} font-extrabold`}>{inr(A.total, false)}</td></tr></tfoot></table>
            </div>
          </div>
          <div className={`p-3 text-xs flex items-center gap-2 ${data.is_balanced ? 'text-emerald-700' : 'text-amber-700'}`}>
            {data.is_balanced ? <><CheckCircle2 className="w-4 h-4" /> Balance sheet tallies.</> : <><AlertTriangle className="w-4 h-4" /> Opening balances do not tally — a “Difference in Opening Balances” line has been added. Fix opening Dr/Cr in Ledger Master.</>}
          </div>
        </div>
      )}
    </div>
  );
}
