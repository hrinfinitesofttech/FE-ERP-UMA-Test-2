'use client';

import React, { useEffect, useMemo, useState } from 'react';
import api from '@/lib/apiClient';
import { Badge, Card, CardHeader, Empty, MONTH_NAMES, Notice, asList, errMsg, fmtDate, inputCls } from '@/components/my/ui';

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function MonthGrid({ year, month, holidays }: { year: number; month: number; holidays: Map<string, any> }) {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7; // Monday-first
  const days = new Date(year, month + 1, 0).getDate();
  const todayIso = new Date().toISOString().slice(0, 10);
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];

  return (
    <Card className="p-3.5">
      <div className="text-xs font-bold mb-2 text-[color:var(--crm-text-primary)]">{MONTH_NAMES[month]}</div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[10.5px]">
        {DOW.map((d, i) => (
          <div key={i} className={`font-semibold ${i === 6 ? 'text-red-400' : 'text-[color:var(--crm-text-tertiary)]'}`}>{d}</div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const h = holidays.get(iso);
          const sunday = (lead + d - 1) % 7 === 6;
          const isToday = iso === todayIso;
          return (
            <div
              key={iso}
              title={h ? h.holidayName || h.holiday_name : sunday ? 'Weekly off' : undefined}
              className={[
                'mx-auto w-6 h-6 flex items-center justify-center rounded-full',
                h ? (h.isOptional ?? h.is_optional ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-[color:var(--crm-brand-700)] text-white font-bold') : sunday ? 'text-red-400' : '',
                isToday && !h ? 'ring-2 ring-[color:var(--crm-brand-600)]' : '',
              ].join(' ')}
            >
              {d}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function MyHolidaysPage() {
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.hr.holidays
      .list()
      .then((r) => setList(asList(r)))
      .catch((e) => setError(errMsg(e, 'Could not load holidays.')))
      .finally(() => setLoading(false));
  }, []);

  const inYear = useMemo(
    () =>
      list
        .filter((h) => String(h.holidayDate || h.holiday_date).startsWith(String(year)))
        .sort((a, b) => String(a.holidayDate || a.holiday_date).localeCompare(String(b.holidayDate || b.holiday_date))),
    [list, year]
  );
  const map = useMemo(() => {
    const m = new Map<string, any>();
    inYear.forEach((h) => m.set(String(h.holidayDate || h.holiday_date).slice(0, 10), h));
    return m;
  }, [inYear]);

  const todayIso = new Date().toISOString().slice(0, 10);
  const upcoming = list
    .filter((h) => String(h.holidayDate || h.holiday_date).slice(0, 10) >= todayIso)
    .sort((a, b) => String(a.holidayDate || a.holiday_date).localeCompare(String(b.holidayDate || b.holiday_date)))
    .slice(0, 3);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-40">
          <label htmlFor="hol-year" className="block text-xs font-semibold mb-1">Year</label>
          <select id="hol-year" className={inputCls} value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[thisYear - 1, thisYear, thisYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[color:var(--crm-text-secondary)]">
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[color:var(--crm-brand-700)]" /> Holiday</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-200" /> Optional</span>
          <span className="inline-flex items-center gap-1.5"><span className="text-red-400 font-bold">S</span> Weekly off (Sunday)</span>
        </div>
      </div>

      {error && <Notice kind="error">{error}</Notice>}

      {upcoming.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-3">
          {upcoming.map((h) => (
            <Card key={h.id} className="p-4">
              <div className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--crm-text-tertiary)]">Upcoming</div>
              <div className="mt-1 text-sm font-bold">{h.holidayName || h.holiday_name}</div>
              <div className="text-xs text-[color:var(--crm-text-secondary)]">{fmtDate(h.holidayDate || h.holiday_date)}</div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 12 }, (_, m) => (
          <MonthGrid key={m} year={year} month={m} holidays={map} />
        ))}
      </div>

      <Card>
        <CardHeader title={`Holiday List ${year}`} right={<Badge tone="blue">{inYear.length} holidays</Badge>} />
        {loading ? (
          <Empty>Loading…</Empty>
        ) : inYear.length === 0 ? (
          <Empty>No holidays have been added for {year}.</Empty>
        ) : (
          <div className="divide-y divide-[color:var(--crm-border-default)]">
            {inYear.map((h) => {
              const iso = String(h.holidayDate || h.holiday_date).slice(0, 10);
              const day = new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long' });
              return (
                <div key={h.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div>
                    <div className="font-semibold">{h.holidayName || h.holiday_name}</div>
                    <div className="text-xs text-[color:var(--crm-text-secondary)]">{fmtDate(iso)} · {day}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge tone={h.isOptional ?? h.is_optional ? 'amber' : 'green'}>{h.isOptional ?? h.is_optional ? 'Optional' : h.holidayType || h.holiday_type || 'Public Holiday'}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
