'use client';

import React from 'react';
import { Plus, X } from 'lucide-react';

export const MAX_EXTRA_CONTACTS = 10;

const digits10 = (v: string) => String(v || '').replace(/\D/g, '').slice(0, 10);

/** Clean the extra numbers: digits only, no blanks, no duplicates, never the primary number again. */
export function cleanExtraContacts(list: string[] | undefined, primary = ''): string[] {
  const out: string[] = [];
  for (const raw of list || []) {
    const n = digits10(raw);
    if (n && n !== primary && !out.includes(n)) out.push(n);
  }
  return out;
}

/** Returns an error message, or '' when every filled extra number is valid. */
export function validateExtraContacts(list: string[] | undefined, primary = ''): string {
  const seen = new Set<string>(primary ? [primary] : []);
  for (const raw of list || []) {
    const n = digits10(raw);
    if (!n) continue;
    if (n.length !== 10) return 'Every additional contact number must be exactly 10 digits.';
    if (seen.has(n)) return 'The same contact number is added more than once.';
    seen.add(n);
  }
  return '';
}

/** The "+" button that sits next to the main contact number field. */
export function AddContactButton({
  count,
  onAdd,
  disabled,
}: {
  count: number;
  onAdd: () => void;
  disabled?: boolean;
}) {
  const full = count >= MAX_EXTRA_CONTACTS;
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={disabled || full}
      title={full ? `Maximum ${MAX_EXTRA_CONTACTS} additional numbers` : 'Add another contact number'}
      aria-label="Add another contact number"
      className="flex-shrink-0 ml-2 w-10 rounded-xl bg-[color:var(--crm-brand-700)] text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
    >
      <Plus className="w-4 h-4" />
    </button>
  );
}

/** Extra contact number rows (each with a remove button). */
export function ExtraContactRows({
  value,
  onChange,
  primary = '',
}: {
  value: string[];
  onChange: (next: string[]) => void;
  primary?: string;
}) {
  if (!value || value.length === 0) return null;

  const update = (i: number, v: string) => onChange(value.map((x, idx) => (idx === i ? digits10(v) : x)));
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2 mt-2">
      {value.map((num, i) => {
        const n = digits10(num);
        const dup = !!n && (n === primary || value.findIndex((x) => digits10(x) === n) !== i);
        const bad = !!n && n.length !== 10;
        return (
          <div key={i}>
            <div className="relative flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[color:var(--crm-border-default)] bg-[#E5E9F1] text-[color:var(--crm-text-secondary)] font-mono font-bold text-xs">
                +91
              </span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={num}
                autoFocus={i === value.length - 1 && !num}
                onChange={(e) => update(i, e.target.value)}
                placeholder={`Additional contact ${i + 1}`}
                className={`w-full px-3.5 py-2.5 bg-[color:var(--crm-bg-app)] border rounded-r-xl text-xs font-mono font-bold text-[color:var(--crm-text-primary)] placeholder:text-[color:var(--crm-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#1F3FB0]/20 transition ${
                  bad || dup ? 'border-rose-400 bg-rose-50/20' : 'border-[color:var(--crm-border-default)] focus:border-[color:var(--crm-brand-700)]'
                }`}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                title="Remove this number"
                aria-label="Remove this number"
                className="flex-shrink-0 ml-2 w-10 rounded-xl border border-[color:var(--crm-border-default)] text-rose-600 flex items-center justify-center hover:bg-rose-50 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {bad && <p className="text-[11px] text-rose-600 mt-1 font-medium">Must be exactly 10 digits.</p>}
            {dup && !bad && <p className="text-[11px] text-rose-600 mt-1 font-medium">This number is already added.</p>}
          </div>
        );
      })}
    </div>
  );
}
