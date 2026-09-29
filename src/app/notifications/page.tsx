'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useERP } from '../../context/ERPContext';
import { formatDateTime } from '../../lib/utils';
import { DepartmentType, NotificationItem } from '../../types/erp';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Trash2,
  CheckCheck,
  Filter,
  Calendar,
  Search,
  PlusCircle,
  Download,
  Archive,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  ShieldAlert,
} from 'lucide-react';

const MONTH_NAMES = [
  { value: 'ALL', label: 'All Months' },
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export default function NotificationsPage() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    sendNotification,
  } = useERP();

  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'UNREAD' | 'READ' | 'HIGH_PRIORITY'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeViewTab, setActiveViewTab] = useState<'timeline' | 'monthly_archive'>('timeline');

  // New Notification / Broadcast Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newDept, setNewDept] = useState<DepartmentType>('crm');
  const [newType, setNewType] = useState<'info' | 'warning' | 'success' | 'alert'>('info');
  const [newPriority, setNewPriority] = useState<'normal' | 'high'>('normal');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Extract all unique years present in notifications
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    notifications.forEach((n) => {
      if (n.timestamp) {
        const y = new Date(n.timestamp).getFullYear().toString();
        if (y && !isNaN(Number(y))) years.add(y);
      }
    });
    // Ensure 2026 and 2025 are present
    years.add('2026');
    years.add('2025');
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [notifications]);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      const date = new Date(notif.timestamp);
      const notifYear = date.getFullYear().toString();
      const notifMonth = String(date.getMonth() + 1).padStart(2, '0');

      // Year filter
      if (selectedYear !== 'ALL' && notifYear !== selectedYear) return false;

      // Month filter
      if (selectedMonth !== 'ALL' && notifMonth !== selectedMonth) return false;

      // Department filter
      if (selectedDept !== 'ALL' && notif.department !== selectedDept) return false;

      // Type filter
      if (selectedType !== 'ALL' && notif.type !== selectedType) return false;

      // Status / Priority filter
      if (selectedStatus === 'UNREAD' && notif.isRead) return false;
      if (selectedStatus === 'READ' && !notif.isRead) return false;
      if (selectedStatus === 'HIGH_PRIORITY' && notif.priority !== 'high') return false;

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = notif.title?.toLowerCase().includes(q);
        const matchMessage = notif.message?.toLowerCase().includes(q);
        const matchDept = notif.department?.toLowerCase().includes(q);
        if (!matchTitle && !matchMessage && !matchDept) return false;
      }

      return true;
    });
  }, [notifications, selectedYear, selectedMonth, selectedDept, selectedType, selectedStatus, searchQuery]);

  // Group notifications by Month-Year for Timeline and Archive summaries
  const groupedByMonth = useMemo(() => {
    const groups: { [key: string]: { label: string; year: string; month: string; items: NotificationItem[] } } = {};

    filteredNotifications.forEach((notif) => {
      const d = new Date(notif.timestamp);
      const year = d.getFullYear().toString();
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const monthLabel = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      const key = `${year}-${monthNum}`;

      if (!groups[key]) {
        groups[key] = { label: monthLabel, year, month: monthNum, items: [] };
      }
      groups[key].items.push(notif);
    });

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredNotifications]);

  // Archive stats summary per year & month across entire database
  const monthlyStats = useMemo(() => {
    const map = new Map<string, { year: string; month: string; monthName: string; total: number; unread: number; highPriority: number }>();
    notifications.forEach((n) => {
      const d = new Date(n.timestamp);
      const y = d.getFullYear().toString();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const mName = d.toLocaleString('en-US', { month: 'long' });
      const key = `${y}-${m}`;

      if (!map.has(key)) {
        map.set(key, { year: y, month: m, monthName: mName, total: 0, unread: 0, highPriority: 0 });
      }
      const entry = map.get(key)!;
      entry.total += 1;
      if (!n.isRead) entry.unread += 1;
      if (n.priority === 'high') entry.highPriority += 1;
    });

    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [notifications]);

  // Total counts
  const unreadTotal = notifications.filter((n) => !n.isRead).length;
  const highPriorityTotal = notifications.filter((n) => n.priority === 'high').length;
  const currentYearTotal = notifications.filter((n) => new Date(n.timestamp).getFullYear() === 2026).length;

  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    sendNotification({
      title: newTitle.trim(),
      message: newMessage.trim(),
      department: newDept,
      type: newType,
      priority: newPriority,
      linkUrl: newLinkUrl.trim() || undefined,
    });

    setNewTitle('');
    setNewMessage('');
    setNewLinkUrl('');
    setShowAddModal(false);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredNotifications, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `UMA_ERP_Notifications_${selectedYear}_${selectedMonth}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 text-xs pb-16">
      {/* Top Banner & Header */}
      <div className="bg-white dark:bg-white p-6 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#9B4A1B]/10 flex items-center justify-center text-[#9B4A1B]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-[#211B17]">
                Centralized Notifications & Multi-Year Archive
              </h1>
              <p className="text-[#70665F] mt-0.5 text-xs">
                Real-time saved system alerts, monthly historical archives, and event tracking across all ERP modules.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#9B4A1B] text-white hover:bg-[#803C15] font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Alert</span>
          </button>

          <button
            onClick={markAllNotificationsRead}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#EBE3DB] bg-[#FAF7F2] hover:bg-slate-100 font-bold text-slate-800 flex items-center gap-1.5 transition"
            title="Mark all notifications as read"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark All Read</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-[#EBE3DB] hover:bg-slate-50 text-[#70665F] font-semibold flex items-center gap-1.5 transition"
            title="Export filtered records"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Metric Quick Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-2xs">
          <div className="flex items-center justify-between text-[#70665F]">
            <span className="font-semibold">Total Saved</span>
            <Archive className="w-4 h-4 text-[#9B4A1B]" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{notifications.length}</div>
          <div className="text-[10px] text-[#70665F] mt-0.5">Persisted in local database</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-2xs">
          <div className="flex items-center justify-between text-[#70665F]">
            <span className="font-semibold">Unread Alerts</span>
            <Bell className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-600 mt-1">{unreadTotal}</div>
          <div className="text-[10px] text-[#70665F] mt-0.5">Pending user review</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-2xs">
          <div className="flex items-center justify-between text-[#70665F]">
            <span className="font-semibold">High Priority</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-xl font-black text-red-600 mt-1">{highPriorityTotal}</div>
          <div className="text-[10px] text-[#70665F] mt-0.5">Critical operations & POs</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] shadow-2xs">
          <div className="flex items-center justify-between text-[#70665F]">
            <span className="font-semibold">Year 2026 Archive</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-blue-700 mt-1">{currentYearTotal}</div>
          <div className="text-[10px] text-[#70665F] mt-0.5">Current fiscal records</div>
        </div>
      </div>

      {/* Main Filter & View Bar */}
      <div className="bg-white dark:bg-white p-4 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm space-y-3.5">
        {/* Row 1: Search and Main Selectors */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notifications by title, details or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-[#EBE3DB] bg-[#FAF7F2] focus:bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9B4A1B]"
            />
          </div>

          {/* Year Selector */}
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <span className="text-[#70665F] font-semibold flex items-center gap-1 whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5" /> Year:
            </span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-[#EBE3DB] bg-[#FAF7F2] font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#9B4A1B] cursor-pointer w-full md:w-auto"
            >
              <option value="ALL">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Year {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <span className="text-[#70665F] font-semibold whitespace-nowrap">Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-[#EBE3DB] bg-[#FAF7F2] font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#9B4A1B] cursor-pointer w-full md:w-auto"
            >
              {MONTH_NAMES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <span className="text-[#70665F] font-semibold whitespace-nowrap">Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-[#EBE3DB] bg-[#FAF7F2] font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#9B4A1B] cursor-pointer w-full md:w-auto uppercase"
            >
              <option value="ALL">All Departments</option>
              <option value="crm">CRM & Sales</option>
              <option value="engineering">Engineering & CAD</option>
              <option value="store">Store & Warehouse</option>
              <option value="production">Production</option>
              <option value="quality">Quality (QC)</option>
              <option value="maintenance">Maintenance</option>
              <option value="accounts">Accounts & Finance</option>
              <option value="hr">HR & Payroll</option>
              <option value="management">Foundation & Admin</option>
            </select>
          </div>
        </div>

        {/* Row 2: Status Pills & View Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-[#EBE3DB]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#70665F] font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Status:
            </span>
            {(
              [
                { id: 'ALL', label: `All (${filteredNotifications.length})` },
                { id: 'UNREAD', label: `Unread (${notifications.filter((n) => !n.isRead).length})` },
                { id: 'READ', label: `Read (${notifications.filter((n) => n.isRead).length})` },
                { id: 'HIGH_PRIORITY', label: `High Priority (${notifications.filter((n) => n.priority === 'high').length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                  selectedStatus === tab.id
                    ? 'bg-[#9B4A1B] text-white shadow-2xs'
                    : 'bg-[#FAF7F2] text-[#70665F] hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Tab Toggle */}
          <div className="flex items-center bg-[#FAF7F2] p-1 rounded-xl border border-slate-200 dark:border-[#EBE3DB]">
            <button
              onClick={() => setActiveViewTab('timeline')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                activeViewTab === 'timeline'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-[#70665F] hover:text-slate-900'
              }`}
            >
              Timeline Feed
            </button>
            <button
              onClick={() => setActiveViewTab('monthly_archive')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                activeViewTab === 'monthly_archive'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-[#70665F] hover:text-slate-900'
              }`}
            >
              Monthly Archive Overview
            </button>
          </div>
        </div>
      </div>

      {/* MONTHLY ARCHIVE SUMMARY VIEW */}
      {activeViewTab === 'monthly_archive' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Archive className="w-4 h-4 text-[#9B4A1B]" />
              Historical Saved Notifications by Month & Year
            </h2>
            <p className="text-[#70665F] text-xs mb-4">
              Click any month card below to immediately filter and view all saved notifications for that specific monthly period.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {monthlyStats.map(([key, stat]) => (
                <div
                  key={key}
                  onClick={() => {
                    setSelectedYear(stat.year);
                    setSelectedMonth(stat.month);
                    setActiveViewTab('timeline');
                  }}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    selectedYear === stat.year && selectedMonth === stat.month
                      ? 'border-[#9B4A1B] bg-[#9B4A1B]/5 ring-1 ring-[#9B4A1B]'
                      : 'border-slate-200 hover:border-[#9B4A1B]/50 hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      {stat.monthName} {stat.year}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#9B4A1B]/10 text-[#9B4A1B] font-mono text-[10px] font-bold">
                      {stat.total} Alerts
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-3 text-[11px] text-[#70665F]">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      {stat.unread} Unread
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      {stat.highPriority} High Priority
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION FEED TIMELINE VIEW */}
      {activeViewTab === 'timeline' && (
        <div className="space-y-4">
          {groupedByMonth.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] p-12 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#70665F] flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">No notifications found</h3>
              <p className="text-[#70665F] mt-1 max-w-sm mx-auto">
                No saved notifications match your current filter ({selectedYear !== 'ALL' ? `Year: ${selectedYear}` : 'All Years'}
                {selectedMonth !== 'ALL' ? `, Month: ${selectedMonth}` : ''}).
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setSelectedYear('ALL');
                    setSelectedMonth('ALL');
                    setSelectedDept('ALL');
                    setSelectedStatus('ALL');
                    setSearchQuery('');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#FAF7F2] border border-slate-200 font-bold hover:bg-slate-100 text-slate-800"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          ) : (
            groupedByMonth.map(([key, group]) => (
              <div
                key={key}
                className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-sm overflow-hidden"
              >
                {/* Month Group Header */}
                <div className="bg-[#FAF7F2] px-5 py-3 border-b border-slate-200 dark:border-[#EBE3DB] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#9B4A1B]" />
                    <span className="font-bold text-slate-900 text-xs tracking-wide uppercase">
                      {group.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[#70665F] font-mono text-[10px] font-bold">
                      {group.items.length} notifications
                    </span>
                  </div>

                  <span className="text-[10px] text-[#70665F] font-mono">
                    Year {group.year} Archive
                  </span>
                </div>

                {/* Notifications in this month */}
                <div className="divide-y divide-slate-100 dark:divide-[#EBE3DB]">
                  {group.items.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4.5 hover:bg-slate-50/80 dark:hover:bg-[#FAF7F2]/60 transition flex flex-col sm:flex-row items-start justify-between gap-4 ${
                        !notif.isRead ? 'bg-[#9B4A1B]/[0.03]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3.5 flex-1">
                        {/* Icon based on notification type */}
                        <div className="mt-0.5 flex-shrink-0">
                          {notif.type === 'alert' || notif.type === 'warning' ? (
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                          ) : notif.type === 'success' ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          ) : notif.priority === 'high' ? (
                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
                              <ShieldAlert className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#9B4A1B]/10 text-[#9B4A1B] flex items-center justify-center">
                              <Bell className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        {/* Text & Meta */}
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">
                              {notif.title}
                            </span>

                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#FAF7F2] font-mono text-[10px] uppercase font-bold text-[#70665F]">
                              {notif.department}
                            </span>

                            {notif.priority === 'high' && (
                              <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-bold text-[10px] uppercase">
                                Urgent
                              </span>
                            )}

                            {!notif.isRead ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-bold">
                                <span className="w-2 h-2 rounded-full bg-[#9B4A1B] animate-pulse" />
                                New
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                Read
                              </span>
                            )}
                          </div>

                          <p className="text-slate-600 dark:text-[#544B45] text-xs leading-relaxed">
                            {notif.message}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[10px] text-[#70665F] font-mono">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {formatDateTime(notif.timestamp)}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>ID: {notif.id}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                        {notif.linkUrl && (
                          <Link
                            href={notif.linkUrl}
                            onClick={() => markNotificationRead(notif.id)}
                            className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#9B4A1B] hover:text-white text-[#9B4A1B] border border-[#EBE3DB] rounded-lg font-bold text-[11px] flex items-center gap-1 whitespace-nowrap transition cursor-pointer"
                          >
                            <span>Open Record</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        <button
                          onClick={() => markNotificationRead(notif.id)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-[#EBE3DB] hover:bg-slate-100 text-[#70665F] transition"
                          title={notif.isRead ? 'Already read' : 'Mark as read'}
                        >
                          <CheckCheck className={`w-3.5 h-3.5 ${notif.isRead ? 'text-slate-300' : 'text-emerald-600'}`} />
                        </button>

                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-[#EBE3DB] hover:bg-red-50 hover:border-red-200 text-[#70665F] hover:text-red-600 transition"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CREATE BROADCAST / NEW ALERT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#FAF7F2]">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#9B4A1B]" />
                <h3 className="font-bold text-slate-900 text-sm">Create New Notification / Operational Alert</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center text-[#70665F]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBroadcast} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alert Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hydro-test cleared for Job 2026-042"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9B4A1B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message Details *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Full description of the notification..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9B4A1B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value as DepartmentType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9B4A1B]"
                  >
                    <option value="crm">CRM & Sales</option>
                    <option value="engineering">Engineering</option>
                    <option value="store">Store & Warehouse</option>
                    <option value="production">Production</option>
                    <option value="quality">Quality (QC)</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="accounts">Accounts & Finance</option>
                    <option value="hr">HR & Payroll</option>
                    <option value="management">Foundation & Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alert Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9B4A1B]"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="alert">Alert / Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9B4A1B]"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High / Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Record Link (Optional)</label>
                  <input
                    type="text"
                    placeholder="/crm/leads or /production/jobs"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9B4A1B]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#9B4A1B] text-white hover:bg-[#803C15] font-bold text-xs shadow-sm"
                >
                  Publish & Save Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
