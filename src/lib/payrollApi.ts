/** Payroll API (fields are camelCase because the backend renders camelCase). */
import { request, API_BASE_URL } from './apiClient';

const get = <T = any>(url: string) => request<T>(url, {}, true);
const post = <T = any>(url: string, body?: any) => request<T>(url, { method: 'POST', body: JSON.stringify(body || {}) });

export const payrollApi = {
  employeesWithStructure: () => get<any[]>('/salary-structures/employees/'),
  bulkSaveStructures: (rows: any[]) => post<{ saved: number; errors: { row: number; employeeId?: string; error: string }[] }>('/salary-structures/bulk-save/', { rows }),

  readiness: (period: string) => get(`/payroll-records/readiness/?period=${period}`),
  list: (period: string) => get<any[]>(`/payroll-records/?period_ym=${period}&page_size=500`),
  calculate: (period: string, dryRun = false) => post('/payroll-records/calculate/', { period, dryRun }),
  adjust: (id: string, body: any) => post(`/payroll-records/${id}/adjust/`, body),
  approve: (id: string) => post(`/payroll-records/${id}/approve/`),
  approveMonth: (period: string) => post('/payroll-records/approve-month/', { period }),
  reopen: (id: string) => post(`/payroll-records/${id}/reopen/`),
  remove: (id: string) => request<any>(`/payroll-records/${id}/`, { method: 'DELETE' }),
  markPaid: (id: string, body: any) => post(`/payroll-records/${id}/mark-paid/`, body),
  markPaidMonth: (period: string, body: any) => post('/payroll-records/mark-paid-month/', { period, ...body }),
  summary: (period: string) => get(`/payroll-records/summary/?period=${period}`),
  trend: () => get<any[]>('/payroll-records/trend/'),
  settings: () => get('/payroll-records/settings/'),
  saveSettings: (body: any) => post('/payroll-records/settings/', body),
};

export const asList = (r: any): any[] => (Array.isArray(r) ? r : r?.results || []);

export const money = (v: any, dash = true) => {
  const n = Number(v);
  if (!isFinite(n) || (dash && n === 0)) return dash ? '—' : '0.00';
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const errorText = (e: any, fallback = 'Something went wrong') => {
  const d = e?.data;
  if (d) {
    if (typeof d === 'string') return d;
    if (d.error) return String(d.error);
    if (d.detail) return String(d.detail);
  }
  return e?.message || fallback;
};

/** Download a file endpoint (PDF / ZIP / CSV) with the logged-in user's token. */
export async function downloadFile(path: string, fallbackName: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) {
    let msg = `Download failed (${res.status})`;
    try { const j = await res.json(); msg = j.error || j.detail || msg; } catch { /* not json */ }
    throw new Error(msg);
  }
  const cd = res.headers.get('Content-Disposition') || '';
  const name = /filename="?([^";]+)"?/.exec(cd)?.[1] || fallbackName;
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export const currentPeriod = () => {
  const d = new Date();
  // default to the month that has just finished (payroll is normally run after month end)
  const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
};
export const shiftPeriod = (p: string, n: number) => {
  const [y, m] = p.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
export const periodLabel = (p: string) => {
  const [y, m] = p.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};
