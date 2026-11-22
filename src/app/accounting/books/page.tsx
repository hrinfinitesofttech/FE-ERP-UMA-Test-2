'use client';

import React from 'react';
import Link from 'next/link';
import { Landmark, Scale, TrendingUp, Building2, Gauge, Percent, Boxes, BookOpen, FilePlus2, ScrollText, HandCoins, AlertTriangle } from 'lucide-react';
import { accountsApi, inr } from '../../../lib/accountsApi';
import { PageHeader, Loading, ErrorBox, useAsync, card, Stat } from '../../../components/accounting/AccUI';

const LINKS = [
  { href: '/accounting/vouchers', icon: FilePlus2, t: 'Voucher Entry', d: 'Payment, Receipt, Journal, Contra' },
  { href: '/accounting/day-book', icon: ScrollText, t: 'Day Book / Ledger', d: 'All postings & ledger statements' },
  { href: '/accounting/ledgers', icon: BookOpen, t: 'Ledger Master', d: 'Accounts, groups, opening balances' },
  { href: '/accounting/payment-requests', icon: HandCoins, t: 'Payment Requests', d: 'Payables from Purchase & Store' },
  { href: '/accounting/reports/trial-balance', icon: Scale, t: 'Trial Balance', d: 'All ledgers Dr / Cr' },
  { href: '/accounting/reports/profit-loss', icon: TrendingUp, t: 'Profit & Loss A/c', d: 'Trading and P&L' },
  { href: '/accounting/reports/balance-sheet', icon: Building2, t: 'Balance Sheet', d: 'Liabilities and assets' },
  { href: '/accounting/reports/ratio-analysis', icon: Gauge, t: 'Ratio Analysis', d: 'Principal financial ratios' },
  { href: '/accounting/depreciation-chart', icon: Percent, t: 'Depreciation Chart', d: '36 assets, block-wise WDV' },
  { href: '/accounting/stock-summary', icon: Boxes, t: 'Stock Summary', d: 'Closing stock valuation' },
];

export default function BooksHubPage() {
  const { data, loading, error, reload } = useAsync<any>(async () => {
    const [st, ra, pr, pl] = await Promise.all([accountsApi.status(), accountsApi.ratios(), accountsApi.paymentSummary(), accountsApi.profitLoss()]);
    return { st, ra, pr, pl };
  }, []);
  const g = data?.ra?.principal_groups;
  return (
    <div className="p-6 space-y-4 bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)]">
      <PageHeader icon={<Landmark className="w-6 h-6" />} title="Books of Accounts" subtitle={`UMA Techno Fab — F.Y. ${data?.st?.financial_year || ''} — one place for the complete accounts`} />
      {loading ? <Loading /> : error ? <ErrorBox msg={error} retry={reload} /> : data && (
        <>
          {data.st.ledgers === 0 && (
            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Chart of accounts is not loaded yet. Open <Link className="underline font-semibold" href="/accounting/ledgers">Ledger Master</Link> → “Load UMA standard chart”.</div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Stat label="Sales" value={`₹ ${inr(g.sales_accounts, false)}`} />
            <Stat label="Nett Profit" value={`₹ ${inr(g.nett_profit, false)}`} tone={g.nett_profit >= 0 ? 'good' : 'bad'} />
            <Stat label="Sundry Debtors" value={`₹ ${inr(g.sundry_debtors, false)}`} />
            <Stat label="Sundry Creditors" value={`₹ ${inr(g.sundry_creditors, false)}`} />
            <Stat label="Pending payments" value={`${data.pr.Pending.count} · ₹ ${inr(data.pr.Pending.amount, false)}`} tone={data.pr.Pending.count ? 'bad' : 'neutral'} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={`${card} p-4 flex items-start gap-3 hover:border-blue-400 transition`}>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-700"><l.icon className="w-5 h-5" /></div>
                <div><div className="text-sm font-bold">{l.t}</div><div className="text-xs text-[color:var(--crm-text-secondary)]">{l.d}</div></div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
