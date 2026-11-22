/**
 * Accounts (ledger engine) API helpers. Reports are always fetched fresh (bypass cache) because they
 * depend on documents created from other departments (Sales, Purchase, Store).
 */
import { request } from './apiClient';

const qs = (p?: Record<string, any>) => {
  if (!p) return '';
  const e = Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== '');
  return e.length ? '?' + e.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&') : '';
};
/**
 * The backend renders JSON in camelCase (djangorestframework-camel-case). The Accounts pages use the
 * snake_case names the API models define, so convert response keys back (e.g. financialYear -> financial_year).
 * Keys without a lower->upper transition ("Pending", "Inflow") are left untouched.
 */
const snakeKey = (k: string) => k.replace(/([a-z0-9])([A-Z])/g, (_m, a, b) => `${a}_${b.toLowerCase()}`);
export function snakeize<T = any>(v: any): T {
  if (Array.isArray(v)) return v.map((x) => snakeize(x)) as any;
  if (v && typeof v === 'object') {
    const o: any = {};
    for (const [k, val] of Object.entries(v)) o[snakeKey(k)] = snakeize(val);
    return o;
  }
  return v;
}
const get = async <T = any>(url: string) => snakeize<T>(await request<any>(url, {}, true));
const send = async <T = any>(method: string, url: string, body?: any) =>
  snakeize<T>(await request<any>(url, { method, body: body === undefined ? undefined : JSON.stringify(body) }));

export const accountsApi = {
  status: () => get('/accounting/setup/status/'),
  seed: () => send('POST', '/accounting/setup/seed/', {}),
  rebuild: () => send('POST', '/accounting/setup/rebuild/', {}),

  groups: () => get<any[]>('/accounting/account-groups/'),
  ledgers: () => get<any[]>('/accounting/ledgers/'),
  createLedger: (d: any) => send('POST', '/accounting/ledgers/', d),
  updateLedger: (id: number, d: any) => send('PATCH', `/accounting/ledgers/${id}/`, d),
  deleteLedger: (id: number) => send('DELETE', `/accounting/ledgers/${id}/`),
  statement: (id: number, p?: { from?: string; to?: string }) => get(`/accounting/ledgers/${id}/statement/${qs(p)}`),
  dayBook: (p?: Record<string, any>) => get<any[]>(`/accounting/day-book/${qs(p)}`),

  vouchers: () => get<any[]>('/accounting/vouchers/'),
  createVoucher: (d: any) => send('POST', '/accounting/vouchers/', d),
  deleteVoucher: (id: number) => send('DELETE', `/accounting/vouchers/${id}/`),

  trialBalance: (fy?: string) => get(`/accounting/reports/trial-balance/${qs({ fy })}`),
  profitLoss: (fy?: string) => get(`/accounting/reports/profit-loss/${qs({ fy })}`),
  balanceSheet: (fy?: string) => get(`/accounting/reports/balance-sheet/${qs({ fy })}`),
  ratios: (fy?: string) => get(`/accounting/reports/ratio-analysis/${qs({ fy })}`),

  depreciationChart: (fy?: string) => get(`/accounting/depreciation-assets/chart/${qs({ fy })}`),
  updateDepAsset: (id: number, d: any) => send('PATCH', `/accounting/depreciation-assets/${id}/`, d),
  createDepAsset: (d: any) => send('POST', '/accounting/depreciation-assets/', d),
  postDepreciation: (fy: string) => send('POST', '/accounting/depreciation-assets/post-depreciation/', { financial_year: fy }),
  carryForward: (fy: string) => send('POST', '/accounting/depreciation-assets/carry-forward/', { financial_year: fy }),

  stockSummary: () => get('/accounting/stock-items/summary/'),
  updateStock: (id: number, d: any) => send('PATCH', `/accounting/stock-items/${id}/`, d),
  createStock: (d: any) => send('POST', '/accounting/stock-items/', d),
  syncStock: () => send('POST', '/accounting/stock-items/sync-from-store/', {}),

  paymentRequests: (p?: Record<string, any>) => get<any[]>(`/accounting/payment-requests/${qs(p)}`),
  paymentSummary: () => get('/accounting/payment-requests/summary/'),
  createPaymentRequest: (d: any) => send('POST', '/accounting/payment-requests/', d),
  approveRequest: (id: number) => send('POST', `/accounting/payment-requests/${id}/approve/`, {}),
  rejectRequest: (id: number, remarks?: string) => send('POST', `/accounting/payment-requests/${id}/reject/`, { remarks }),
  payRequest: (id: number, d: any) => send('POST', `/accounting/payment-requests/${id}/pay/`, d),
};

export const inr = (v: any, dash = true) => {
  const n = Number(v);
  if (!isFinite(n) || (dash && n === 0)) return dash ? '-' : '0.00';
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const errMsg = (e: any) => {
  const d = e?.data;
  if (d) {
    if (typeof d === 'string') return d;
    if (d.error) return String(d.error);
    if (d.detail) return String(d.detail);
    const first = Object.entries(d)[0];
    if (first) return `${first[0]}: ${Array.isArray(first[1]) ? (first[1] as any[]).join(' ') : first[1]}`;
  }
  return e?.message || 'Something went wrong';
};

export function downloadCSV(filename: string, rows: (string | number | null | undefined)[][]) {
  const esc = (v: any) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const blob = new Blob(['﻿' + rows.map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export const fyOptions = () => {
  const t = new Date();
  const y = t.getMonth() >= 3 ? t.getFullYear() : t.getFullYear() - 1;
  return [y + 1, y, y - 1, y - 2].map((s) => `${s}-${String(s + 1).slice(2)}`);
};
export const currentFY = () => fyOptions()[1];
