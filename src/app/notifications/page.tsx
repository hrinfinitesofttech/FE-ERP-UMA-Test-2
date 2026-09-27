'use client';

import React from 'react';
import Link from 'next/link';
import { useERP } from '../../context/ERPContext';
import { formatDateTime } from '../../lib/utils';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Trash2,
  CheckCheck,
} from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useERP();

  return (
    <div className="max-w-4xl mx-auto space-y-4 text-xs pb-10">
      <div className="bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <Bell className="w-5 h-5 text-crm-brand-700" />
            Centralized Notifications & Action Center
          </h1>
          <p className="text-[#70665F] mt-0.5">
            Real-time alerts for lead assignments, quotation approvals, customer PO receipts, and project handovers.
          </p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#EBE3DB] hover:bg-slate-100 font-semibold flex items-center gap-1.5"
        >
          <CheckCheck className="w-4 h-4 text-crm-brand-700" />
          <span>Mark All Read</span>
        </button>
      </div>

      <div className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-[#EBE3DB]">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-[#70665F]">No active notifications.</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`p-4 hover:bg-slate-50/80 dark:hover:bg-[#FAF7F2]/50 transition flex items-start justify-between gap-4 cursor-pointer ${
                !notif.isRead ? 'bg-crm-brand-/40 dark:bg-crm-brand-/20' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {notif.type === 'alert' || notif.type === 'warning' ? (
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  ) : notif.type === 'success' ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-crm-brand- text-crm-brand-800 flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-[#211B17] text-xs">{notif.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#FAF7F2] font-mono text-[10px] uppercase font-bold text-[#70665F]">
                      {notif.department}
                    </span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-crm-brand-700 animate-pulse" />
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-[#544B45] text-xs">{notif.message}</p>
                  <span className="text-[10px] text-[#70665F] font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatDateTime(notif.timestamp)}
                  </span>
                </div>
              </div>

              {notif.linkUrl && (
                <Link
                  href={notif.linkUrl}
                  className="px-3 py-1.5 bg-crm-brand- hover:bg-crm-brand- text-crm-brand-800 rounded-lg font-bold text-xs flex items-center gap-1 whitespace-nowrap transition flex-shrink-0"
                >
                  <span>Open Record</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
