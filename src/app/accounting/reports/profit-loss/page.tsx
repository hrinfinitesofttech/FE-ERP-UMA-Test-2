'use client';

import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { accountsApi, currentFY, inr, downloadCSV } from '../../../../lib/accountsApi';
import { PageHeader, FYSelect, PrintBtn, CsvBtn, Loading, ErrorBox, useAsync, card, td, num, CompanyHeader } from '../../../../components/accounting/AccUI';

type Row = { label: string; amount: number; sub?: boolean; bold?: boolean; items?: { name: string; amount: number }[] };

function Side({ title, rows, total }: { title: string; rows: Row[]; total: number }) {
  return (
    <div className="flex-1 min-w-[320px]">
      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wide bg-[color:var(--crm-surface-subtle)]">{title}</div>
      <table className="w-full">
        <tbody>
          {rows.filter((r) => r.amount !== 0 || r.bold).map((r, i) => (
            <React.Fragment key={i}>
              <tr className="border-t border-[color:var(--crm-border-default)]/50">
                <td className={`${td} ${r.bold ? 'font-bold' : ''}`}>{r.label}</td>
                <td className={`${td} ${num} ${r.bold ? 'font-bold' : ''}`}>{inr(r.amount)}</td>
              </tr>
              {r.items?.filter((x) => x.amount !== 0).map((x) => (
                <tr key={x.name}><td className={`${td} pl-8 text-[color:var(--crm-text-secondary)]`}>{x.name}</td><td className={`${td} ${num} text-[color:var(--crm-text-secondary)]`}>{inr(x.amount)}</td></tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
        <tfoot><tr className="border-t-2 border-[color:var(--crm-text-primary)]"><td className={`${td} font-extrabold`}>Total</td><td className={`${td} ${num} font-extrabold`}>{inr(total, false)}</td></tr></tfoot>
      </table>
    </div>
  );
}

export default function ProfitLossPage() {
  const [fy, setFy] = useState(currentFY());
  const [detail, setDetail] = useState(true);
  const { data, loading, error, reload } = useAsync<any>(() => accountsApi.profitLoss(fy), [fy]);

  const t = data?.trading, p = data?.pl;
  const trDr: Row[] = t && [
    { label: 'Opening Stock', amount: t.dr.opening_stock },
    { label: 'Purchase Accounts', amount: t.dr.purchase, items: detail ? t.dr.purchase_items : [] },
    { label: 'Direct Expenses', amount: t.dr.direct_expenses, items: detail ? t.dr.direct_expense_items : [] },
    { label: 'Gross Profit c/o', amount: t.dr.gross_profit, bold: true },
  ];
  const trCr: Row[] = t && [
    { label: 'Sales Accounts', amount: t.cr.sales, items: detail ? t.cr.sales_items : [] },
    { label: 'Direct Incomes', amount: t.cr.direct_incomes, items: detail ? t.cr.direct_income_items : [] },
    { label: 'Closing Stock', amount: t.cr.closing_stock },
    { label: 'Gross Loss c/o', amount: t.cr.gross_loss, bold: true },
  ];
  const plDr: Row[] = p && [
    { label: 'Gross Loss b/f', amount: p.dr.gross_loss_bf },
    { label: 'Indirect Expenses', amount: p.dr.indirect_expenses, items: detail ? p.dr.indirect_expense_items : [] },
    { label: 'Nett Profit', amount: p.dr.nett_profit, bold: true },
  ];
  const plCr: Row[] = p && [
    { label: 'Gross Profit b/f', amount: p.cr.gross_profit_bf },
    { label: 'Indirect Incomes', amount: p.cr.indirect_incomes, items: detail ? p.cr.indirect_income_items : [] },
    { label: 'Nett Loss', amount: p.cr.nett_loss, bold: true },
  ];
  const plTotal = p ? Math.max(p.dr.indirect_expenses + p.dr.gross_loss_bf + p.dr.nett_profit, p.cr.gross_profit_bf + p.cr.indirect_incomes + p.cr.nett_loss) : 0;

  const exportCsv = () => {
    if (!data) return;
    downloadCSV(`profit-loss-${fy}.csv`, [
      ['Section', 'Particulars', 'Amount'],
      ...trDr.map((r) => ['Trading Dr', r.label, r.amount]), ...trCr.map((r) => ['Trading Cr', r.label, r.amount]),
      ...plDr.map((r) => ['P&L Dr', r.label, r.amount]), ...plCr.map((r) => ['P&L Cr', r.label, r.amount]),
    ]);
  };

  return (
    <div className="p-6 space-y-4 bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)]">
      <PageHeader icon={<TrendingUp className="w-6 h-6" />} title="Profit & Loss A/c" subtitle="Trading Account and Profit & Loss Account (live from ledgers)">
        <FYSelect value={fy} onChange={setFy} />
        <label className="text-xs flex items-center gap-1.5"><input type="checkbox" checked={detail} onChange={(e) => setDetail(e.target.checked)} /> Show ledger detail</label>
        <CsvBtn onClick={exportCsv} /><PrintBtn />
      </PageHeader>
      {loading ? <Loading /> : error ? <ErrorBox msg={error} retry={reload} /> : data && (
        <>
          <div className={card}>
            <CompanyHeader title="TRADING ACCOUNT" sub={`${data.from} to ${data.to}`} />
            <div className="flex flex-wrap divide-x divide-[color:var(--crm-border-default)]">
              <Side title="Dr. (Particulars)" rows={trDr} total={t.dr.total} />
              <Side title="Cr. (Particulars)" rows={trCr} total={t.cr.total} />
            </div>
          </div>
          <div className={card}>
            <CompanyHeader title="PROFIT & LOSS ACCOUNT" sub={`${data.from} to ${data.to}`} />
            <div className="flex flex-wrap divide-x divide-[color:var(--crm-border-default)]">
              <Side title="Dr. (Particulars)" rows={plDr} total={plTotal} />
              <Side title="Cr. (Particulars)" rows={plCr} total={plTotal} />
            </div>
            <div className="p-3 text-xs border-t border-[color:var(--crm-border-default)]">
              Gross Profit ₹{inr(data.summary.gross_profit, false)} &nbsp;|&nbsp; Nett {data.summary.nett_profit >= 0 ? 'Profit' : 'Loss'} ₹{inr(Math.abs(data.summary.nett_profit), false)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
