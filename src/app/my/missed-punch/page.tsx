'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useERP } from '@/context/ERPContext';
import api from '@/lib/apiClient';
import { Badge, Card, CardHeader, Empty, Field, Notice, asList, btnPrimary, errMsg, fmtDate, inputCls, statusTone } from '@/components/my/ui';

const today = () => new Date().toISOString().slice(0, 10);

export default function MyMissedPunchPage() {
  const { currentUser } = useERP();
  const empId = currentUser?.id as string | undefined;

  const [requests, setRequests] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [date, setDate] = useState(today());
  const [type, setType] = useState<'Check-In' | 'Check-Out'>('Check-Out');
  const [time, setTime] = useState('18:00');
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    if (!empId) return;
    setLoading(true);
    try {
      const [m, a] = await Promise.all([
        api.hr.missedPunches.list(),
        api.get(`/attendance-records/?employee_id=${encodeURIComponent(empId)}`),
      ]);
      setRequests(asList(m).filter((x: any) => (x.employeeId || x.employee_id) === empId));
      setRecords(asList(a));
    } catch (e) {
      setError(errMsg(e, 'Could not load missed punch data.'));
    } finally {
      setLoading(false);
    }
  }, [empId]);

  useEffect(() => {
    load();
  }, [load]);

  // Days (last 45) with a check-in but no check-out → one-click suggestions
  const suggestions = useMemo(() => {
    const t = today();
    const cutoff = new Date(Date.now() - 45 * 86400000).toISOString().slice(0, 10);
    const pending = new Set(requests.filter((r) => r.status === 'Pending').map((r) => `${r.date}|${r.missingPunchType || r.missing_punch_type}`));
    return records
      .filter((r) => {
        const d = String(r.date).slice(0, 10);
        return d < t && d >= cutoff && (r.firstIn || r.checkIn) && !(r.lastOut || r.checkOut) && !pending.has(`${d}|Check-Out`);
      })
      .map((r) => String(r.date).slice(0, 10))
      .sort()
      .reverse();
  }, [records, requests]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!date) return setError('Please choose the date.');
    if (date > today()) return setError('You cannot request a missed punch for a future date.');
    if (!/^\d{2}:\d{2}$/.test(time)) return setError('Please enter the time you actually punched / left.');
    if (reason.trim().length < 3) return setError('Please enter a reason.');
    if (requests.some((r) => r.status === 'Pending' && r.date === date && (r.missingPunchType || r.missing_punch_type) === type)) {
      return setError(`You already have a pending ${type} request for this date.`);
    }

    const no = `MP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    setSaving(true);
    try {
      await api.hr.missedPunches.create({
        id: no,
        request_number: no,
        employee_id: empId,
        employee_name: currentUser?.name,
        date,
        missing_punch_type: type,
        requested_time: time,
        reason: reason.trim(),
        reporting_manager: (currentUser as any)?.reportingManagerName || '',
        status: 'Pending',
      });
      setSuccess('Missed punch request sent. Attendance will update once your manager approves it.');
      setReason('');
      await load();
    } catch (err) {
      setError(errMsg(err, 'Could not submit request.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-5 items-start">
      <Card>
        <CardHeader title="Request Missed Punch" hint="Forgot to punch in or out? Tell us the correct time." />
        <form onSubmit={submit} className="p-5 space-y-3.5">
          {error && <Notice kind="error">{error}</Notice>}
          {success && <Notice kind="success">{success}</Notice>}

          {suggestions.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-[color:var(--crm-text-secondary)] mb-1.5">Days with no check-out:</div>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.slice(0, 8).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => { setDate(d); setType('Check-Out'); }}
                    className={`h-7 px-2.5 rounded-full text-[11px] font-semibold border cursor-pointer ${date === d && type === 'Check-Out' ? 'bg-[color:var(--crm-brand-700)] text-white border-transparent' : 'bg-white border-[color:var(--crm-border-strong)] hover:bg-[color:var(--crm-surface-subtle)]'}`}
                  >
                    {fmtDate(d)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Field label="Date">
            <input type="date" max={today()} className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Missed punch">
              <select className={inputCls} value={type} onChange={(e) => setType(e.target.value as any)}>
                <option>Check-In</option>
                <option>Check-Out</option>
              </select>
            </Field>
            <Field label="Correct time">
              <input type="time" className={inputCls} value={time} onChange={(e) => setTime(e.target.value)} />
            </Field>
          </div>
          <Field label="Reason">
            <textarea rows={3} className={`${inputCls} h-auto py-2`} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Forgot to punch out at 7:00 PM" />
          </Field>
          <button type="submit" disabled={saving} className={`${btnPrimary} w-full`}>
            {saving ? 'Sending…' : 'Send Request'}
          </button>
        </form>
      </Card>

      <Card>
        <CardHeader title="My Missed Punch Requests" />
        {loading ? (
          <Empty>Loading…</Empty>
        ) : requests.length === 0 ? (
          <Empty>No missed punch requests yet.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-[color:var(--crm-text-tertiary)] bg-[color:var(--crm-surface-subtle)]">
                  <th className="px-4 py-2.5">No.</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Punch</th>
                  <th className="px-4 py-2.5">Time</th>
                  <th className="px-4 py-2.5">Reason</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-t border-[color:var(--crm-border-default)] align-top">
                    <td className="px-4 py-2.5 font-mono">{r.requestNumber || r.request_number}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{fmtDate(r.date)}</td>
                    <td className="px-4 py-2.5">{r.missingPunchType || r.missing_punch_type}</td>
                    <td className="px-4 py-2.5 font-mono">{r.requestedTime || r.requested_time}</td>
                    <td className="px-4 py-2.5 max-w-[220px]">{r.reason}</td>
                    <td className="px-4 py-2.5"><Badge tone={statusTone(r.status)}>{r.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
