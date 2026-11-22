'use client';

import React from 'react';

/** Shown in the content area while the data a page needs is still loading. */
export function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading data"
      className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4"
    >
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-[3px] border-[color:var(--crm-border-default)]" />
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[color:var(--crm-brand-700)] border-r-[#F37A20] animate-spin motion-reduce:animate-none" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/uma-mark.png" alt="" className="w-7 h-7 object-contain" />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-[color:var(--crm-text-primary)]">Loading data…</p>
        <p className="text-xs text-[color:var(--crm-text-secondary)] mt-0.5">Fetching the latest records</p>
      </div>
      <div className="w-full max-w-md space-y-2 px-6 opacity-60" aria-hidden>
        <div className="h-2.5 rounded-full bg-[color:var(--crm-border-default)] animate-pulse motion-reduce:animate-none" />
        <div className="h-2.5 w-5/6 rounded-full bg-[color:var(--crm-border-default)] animate-pulse motion-reduce:animate-none" />
        <div className="h-2.5 w-2/3 rounded-full bg-[color:var(--crm-border-default)] animate-pulse motion-reduce:animate-none" />
      </div>
    </div>
  );
}
