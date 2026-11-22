'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, FileCheck2, Fingerprint, Timer, CalendarDays, Banknote } from 'lucide-react';
import { useERP } from '@/context/ERPContext';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/my/attendance', label: 'Attendance', Icon: Clock },
  { href: '/my/leaves', label: 'Leave', Icon: FileCheck2 },
  { href: '/my/missed-punch', label: 'Missed Punch', Icon: Fingerprint },
  { href: '/my/overtime', label: 'Overtime', Icon: Timer },
  { href: '/my/holidays', label: 'Holidays', Icon: CalendarDays },
  { href: '/my/payslips', label: 'Salary Slips', Icon: Banknote },
];

export default function MyWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const { currentUser } = useERP();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[color:var(--crm-text-primary)]">My Workspace</h1>
          <p className="text-xs text-[color:var(--crm-text-secondary)]">
            {currentUser?.name || 'Employee'}
            {currentUser?.id ? ` · ${currentUser.id}` : ''} — only your own records are shown here.
          </p>
        </div>
      </div>

      <nav aria-label="My Workspace sections" className="flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 h-9 rounded-xl text-xs font-semibold whitespace-nowrap border transition',
                active
                  ? 'bg-[color:var(--crm-brand-700)] text-white border-transparent shadow-sm'
                  : 'bg-white text-[#4B5876] border-[color:var(--crm-border-default)] hover:bg-[color:var(--crm-surface-subtle)]'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
