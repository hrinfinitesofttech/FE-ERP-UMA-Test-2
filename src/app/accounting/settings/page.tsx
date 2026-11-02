'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Settings, Lock, CheckCircle2, ShieldCheck, AlertCircle, Calendar } from 'lucide-react';

export default function AccountingSettingsPage() {
  const { financialYears, closeFinancialYear } = useERP();
  const [lockDate, setLockDate] = useState('2026-03-31');

  return (
    <div className="p-6 space-y-6 bg-[color:var(--crm-bg-app)]  text-[color:var(--crm-text-primary)]">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-[color:var(--crm-border-default)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-500/20 rounded-xl text-[color:var(--crm-text-secondary)]">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[color:var(--crm-text-primary)]">Accounting Settings & Financial Year Close</h1>
            <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">Financial Year Management, Posting Lock Dates & Statutory System Controls</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Year Close Control */}
        <div className="bg-white p-6 rounded-2xl border border-[color:var(--crm-border-default)] space-y-4">
          <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2 border-b border-[color:var(--crm-border-default)] pb-3">
            <Calendar className="w-4 h-4 text-emerald-700" />
            Indian Financial Years (01-Apr to 31-Mar)
          </h3>

          <div className="space-y-3">
            {financialYears.map((fy) => (
              <div key={fy.id} className="p-4 bg-[color:var(--crm-bg-app)] rounded-xl border border-[color:var(--crm-border-default)] flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[color:var(--crm-text-primary)] font-mono">{fy.fyCode}</div>
                  <div className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">
                    {fy.startDate} to {fy.endDate}
                  </div>
                </div>

                <div>
                  {fy.status === 'Active' ? (
                    <button
                      onClick={() => closeFinancialYear(fy.id, 'Super Admin')}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      Close Year
                    </button>
                  ) : (
                    <span className="px-3 py-1 rounded bg-white text-[color:var(--crm-text-secondary)] text-xs font-semibold">Closed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lock Date Controls */}
        <div className="bg-white p-6 rounded-2xl border border-[color:var(--crm-border-default)] space-y-4">
          <h3 className="text-sm font-bold text-[color:var(--crm-text-primary)] flex items-center gap-2 border-b border-[color:var(--crm-border-default)] pb-3">
            <Lock className="w-4 h-4 text-crm-brand-600" />
            Posting Lock Date Controls
          </h3>

          <div className="space-y-3 text-xs">
            <p className="text-[color:var(--crm-text-secondary)]">
              Prevent back-dated voucher creation or edits prior to the specified lock date to comply with GST and Tax Audit rules.
            </p>

            <div>
              <label className="block text-[color:var(--crm-text-secondary)] mb-1">Accounting Lock Date</label>
              <input
                type="date"
                value={lockDate}
                onChange={(e) => setLockDate(e.target.value)}
                className="w-full bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl px-3 py-2 text-[color:var(--crm-text-primary)] font-mono"
              />
            </div>

            <button className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition">
              Save Lock Date Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
