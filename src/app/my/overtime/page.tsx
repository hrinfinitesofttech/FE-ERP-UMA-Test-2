'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useERP } from '@/context/ERPContext';
import api from '@/lib/apiClient';
import { Badge, Card, CardHeader, Empty, Field, Notice, Stat, asList, btnPrimary, errMsg, fmtDate, inputCls, recentMonths, statusTone } from '@/components/my/ui';

const today = () => new Date().toISOString().slice(0, 10);

export default function MyOvertimePage() {
  const { currentUser } = useERP();
  const empId = currentUser?.id as string | undefined;
  const months = useMemo(() => recentMonths(6), []);
  const [monthKey, setMonthKey] = useState(months[0].key);

  const [records, setRecords] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [date, setDate] = useState(today());
  const [hours, setHours] = useState('1');
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    if (!empId) return;
    setLoading(true);
    try {
      const [a, o] = await Promise.all([
        api.get(`/attendance-records/?employee_id=${encodeURIComponent(empId)}`),
        api.hr.overtimeRecords.list(),
      ]);
      setRecords(asList(a));
      setRequests(asList(o).filter((x: any) => (x.employeeId || x.employee_id) === empId));
    } catch (e) {
      setError(errMsg(e, 'Could not load overtime data.'));
    } finally {
      setLoading(false);
    }
  }, [empId]);

  useEffect(() => {
    load();
  }, [load]);

  const monthRecords = records
    .filter((r) => String(r.date).startsWith(monthKey) && Number(r.overtimeHours ?? 0) > 0)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const monthReq = requests.filter((r) => String(r.date).startsWith(monthKey));
  const detected = monthRecords.reduce((a, r) => a + Number(r.overtimeHours || 0), 0);
  const approved = monthReq.filter((r) => r.status === 'Approved').reduce((a, r) => a + Number(r.overtimeHours ?? r.overtime_hours ?? 0), 0);
  const pending = monthReq.filter((r) => r.status === 'Pending').reduce((a, r) => a + Number(r.overtimeHours ?? r.overtime_hours ?? 0), 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const h = Number(hours);
    if (!date || date > today()) return setError('Choose a valid date (not in the future).');
    if (!(h > 0) || h > 12) return setError('Overtime hours must be between 0 and 12.');
    if (reason.trim().length < 3) return setError('Please enter the work done during overtime.');
    if (requests.some((r) => r.date === date && r.status !== 'Rejected')) {
      return setError('You already have an overtime request for this date.');
    }
    const no = `OT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    setSaving(true);
    try {
      await api.hr.overtimeRecords.create({
        id: no,
        overtime_no: no,
        employee_id: empId,
        employee_name: currentUser?.name,
        department: (currentUser as any)?.departmentName || (currentUser as any)?.department || 'General',
        date,
        regular_hours: 8,
        overtime_hours: h,
        reason: reason.trim(),
        status: 'Pending',
      });
      setSuccess('Overtime request submitted for approval.');
      setReason('');
      await load();
    } catch (err) {
      setError(errMsg(err, 'Could not submit overtime request.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="w-full sm:w-64">
        <label htmlFor="ot-month" className="block text-xs font-semibold mb-1">Month</label>
        <select id="ot-month" value={monthKey} onChange={(e) => setMonthKey(e.target.value)} className={inputCls}>
          {months.map((m) => (
            <option key={m.key} value={m.key}>{m.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Stat label="Detected from punches" value={`${detected.toFixed(2)} h`} tone="blue" sub="Hours beyond shift, from biometric" />
        <Stat label="Approved" value={`${approved.toFixed(2)} h`} tone="green" />
        <Stat label="Awaiting approval" value={`${pending.toFixed(2)} h`} tone="amber" />
      </div>

      {error && <Notice kind="error">{error}</Notice>}

      <div className="grid lg:grid-cols-[380px_1fr] gap-5 items-start">
        <Card>
          <CardHeader title="Request Overtime" hint="Only approved overtime is paid" />
          <form onSubmit={submit} className="p-5 space-y-3.5">
            {success && <Notice kind="success">{success}</Notice>}
            <Field label="Date">
              <input type="date" max={today()} className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Overtime hours" hint="Hours worked beyond your regular shift">
              <input type="number" step="0.25" min="0.25" max="12" className={inputCls} value={hours} onChange={(e) => setHours(e.target.value)} />
            </Field>
            <Field label="Work done">
              <textarea rows={3} className={`${inputCls} h-auto py-2`} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="What did you work on?" />
            </Field>
            <button type="submit" disabled={saving} className={`${btnPrimary} w-full`}>
              {saving ? 'Submitting…' : 'Submit Overtime Request'}
            </button>
          </form>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="My Overtime Requests" />
            {loading ? (
              <Empty>Loading…</Empty>
            ) : monthReq.length === 0 ? (
              <Empty>No overtime requests in this month.</Empty>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-[color:var(--crm-text-tertiary)] bg-[color:var(--crm-surface-subtle)]">
                      <th className="px-4 py-2.5">No.</th>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5 text-right">Hours</th>
                      <th className="px-4 py-2.5">Reason</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthReq.map((r) => (
                      <tr key={r.id} className="border-t border-[color:var(--crm-border-default)] align-top">
                        <td className="px-4 py-2.5 font-mono">{r.overtimeNo || r.overtime_no}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap">{fmtDate(r.date)}</td>
                        <td className="px-4 py-2.5 text-right font-mono">{Number(r.overtimeHours ?? r.overtime_hours ?? 0).toFixed(2)}</td>
                        <td className="px-4 py-2.5 max-w-[220px]">{r.reason}</td>
                        <td className="px-4 py-2.5"><Badge tone={statusTone(r.status)}>{r.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Overtime Detected from Punches" hint="Calculated automatically from your biometric IN/OUT" />
            {monthRecords.length === 0 ? (
              <Empty>No extra hours detected this month.</Empty>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <tbody>
                    {monthRecords.map((r) => (
                      <tr key={r.id} className="border-t first:border-t-0 border-[color:var(--crm-border-default)]">
                        <td className="px-4 py-2.5 whitespace-nowrap">{fmtDate(String(r.date))}</td>
                        <td className="px-4 py-2.5 font-mono">{r.firstIn || r.checkIn || '—'} → {r.lastOut || r.checkOut || '—'}</td>
                        <td className="px-4 py-2.5 text-right font-mono">{Number(r.overtimeHours).toFixed(2)} h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
