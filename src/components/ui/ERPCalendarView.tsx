'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Filter,
  Plus,
  Eye,
  X,
  Sparkles,
  MapPin,
  User,
  Tag,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List,
  CalendarDays,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string; // 'YYYY-MM-DD'
  time?: string; // '10:30 AM'
  category?: string; // 'holiday' | 'followup' | 'task' | 'meeting' | 'inspection' | 'deadline'
  badgeColor?: string; // Tailwind class e.g. 'bg-emerald-50 text-emerald-800 border-emerald-200'
  dotColor?: string; // e.g. 'bg-emerald-500'
  description?: string;
  location?: string;
  person?: string;
  status?: string;
  raw?: any;
}

export interface ERPCalendarViewProps {
  events: CalendarEventItem[];
  title?: string;
  subtitle?: string;
  onSelectDate?: (dateStr: string) => void;
  onSelectEvent?: (event: CalendarEventItem) => void;
  onAddEvent?: (dateStr?: string) => void;
  addEventLabel?: string;
  initialDate?: Date;
  categories?: { key: string; label: string; color: string }[];
  className?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDateSafe(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  return new Date(dateStr);
}

export function ERPCalendarView({
  events = [],
  title = 'ERP Operational Calendar',
  subtitle,
  onSelectDate,
  onSelectEvent,
  onAddEvent,
  addEventLabel = 'Add Entry',
  initialDate,
  categories,
  className,
}: ERPCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(() => initialDate || new Date());
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedDayEvents, setSelectedDayEvents] = useState<{
    dateStr: string;
    events: CalendarEventItem[];
  } | null>(null);
  const [inspectorEvent, setInspectorEvent] = useState<CalendarEventItem | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  const todayStr = useMemo(() => toDateString(new Date()), []);

  // Filter events by active category
  const filteredEvents = useMemo(() => {
    if (activeCategory === 'all') return events;
    return events.filter(
      (ev) => (ev.category || 'default').toLowerCase() === activeCategory.toLowerCase()
    );
  }, [events, activeCategory]);

  // Map events by dateStr for instant lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEventItem[]>();
    filteredEvents.forEach((ev) => {
      const existing = map.get(ev.date) || [];
      existing.push(ev);
      map.set(ev.date, existing);
    });
    return map;
  }, [filteredEvents]);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Build Month Calendar Grid cells
  const monthCells = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: {
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      dayEvents: CalendarEventItem[];
    }[] = [];

    // 1. Previous month trailing
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const d = new Date(year, month - 1, dayNum);
      const str = toDateString(d);
      cells.push({
        dateStr: str,
        dayNum,
        isCurrentMonth: false,
        isToday: str === todayStr,
        dayEvents: eventsByDate.get(str) || [],
      });
    }

    // 2. Current month
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const d = new Date(year, month, day);
      const str = toDateString(d);
      cells.push({
        dateStr: str,
        dayNum: day,
        isCurrentMonth: true,
        isToday: str === todayStr,
        dayEvents: eventsByDate.get(str) || [],
      });
    }

    // 3. Next month leading
    const remaining = (cells.length % 7 === 0) ? 0 : 7 - (cells.length % 7);
    for (let day = 1; day <= remaining; day++) {
      const d = new Date(year, month + 1, day);
      const str = toDateString(d);
      cells.push({
        dateStr: str,
        dayNum: day,
        isCurrentMonth: false,
        isToday: str === todayStr,
        dayEvents: eventsByDate.get(str) || [],
      });
    }

    return cells;
  }, [currentDate, todayStr, eventsByDate]);

  // Agenda view: sorted upcoming events in current or upcoming months
  const agendaEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredEvents]);

  return (
    <div className={cn('bg-white border border-[#E5DDD4] rounded-2xl shadow-xs overflow-hidden flex flex-col', className)}>
      {/* 1. Header Toolbar */}
      <div className="p-4 sm:p-5 border-b border-[#E5DDD4] bg-[#FAF7F2] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title & Subtitle */}
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-crm-brand-100/70 border border-crm-brand-200/60 flex items-center justify-center text-crm-brand-700">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#211B17] tracking-tight flex items-center gap-2">
                <span>{title}</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-[#E5DDD4] text-[#70665F]">
                  {events.length} {events.length === 1 ? 'Event' : 'Events'}
                </span>
              </h2>
              {subtitle && <p className="text-xs text-[#70665F] mt-0.5">{subtitle}</p>}
            </div>
          </div>
        </div>

        {/* Month Navigation & Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Month / Year Navigator */}
          <div className="flex items-center bg-white border border-[#E5DDD4] rounded-xl p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={prevMonth}
              title="Previous Month"
              className="p-1.5 text-[#544B45] hover:text-crm-brand-800 hover:bg-[#FAF7F2] rounded-lg transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-bold text-xs sm:text-sm text-[#211B17] font-mono min-w-[140px] text-center select-none">
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              title="Next Month"
              className="p-1.5 text-[#544B45] hover:text-crm-brand-800 hover:bg-[#FAF7F2] rounded-lg transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Today Button */}
          <button
            type="button"
            onClick={goToToday}
            className="px-3 py-1.5 bg-white hover:bg-[#FAF7F2] border border-[#E5DDD4] rounded-xl text-xs font-bold text-[#4A3B32] transition shadow-2xs cursor-pointer"
          >
            Today
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-[#E5DDD4] rounded-xl p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer',
                viewMode === 'month'
                  ? 'bg-crm-brand-700 text-white shadow-xs'
                  : 'text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Month</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('agenda')}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer',
                viewMode === 'agenda'
                  ? 'bg-crm-brand-700 text-white shadow-xs'
                  : 'text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]'
              )}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Agenda</span>
            </button>
          </div>

          {/* Optional Add Event Button */}
          {onAddEvent && (
            <button
              type="button"
              onClick={() => onAddEvent()}
              className="px-3 py-1.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{addEventLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Optional Category Filters Bar */}
      {categories && categories.length > 0 && (
        <div className="px-5 py-2.5 bg-white border-b border-[#F0EAE1] flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-[#8D7B70] uppercase tracking-wider mr-1 shrink-0">
            Filter:
          </span>
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer shrink-0',
              activeCategory === 'all'
                ? 'bg-[#211B17] text-white shadow-2xs'
                : 'bg-[#FAF7F2] text-[#70665F] hover:text-[#211B17] hover:bg-[#EFE8DF]'
            )}
          >
            All Categories ({events.length})
          </button>
          {categories.map((cat) => {
            const count = events.filter(
              (e) => (e.category || 'default').toLowerCase() === cat.key.toLowerCase()
            ).length;
            const isSelected = activeCategory.toLowerCase() === cat.key.toLowerCase();
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0',
                  isSelected
                    ? 'bg-crm-brand-700 text-white shadow-2xs'
                    : 'bg-[#FAF7F2] text-[#70665F] hover:text-[#211B17] hover:bg-[#EFE8DF]'
                )}
              >
                <span className={cn('w-2 h-2 rounded-full', cat.color)} />
                <span>{cat.label}</span>
                <span className="opacity-75 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Main Calendar View Content */}
      {viewMode === 'month' ? (
        <div className="flex-1 flex flex-col">
          {/* Weekday Names Header Row */}
          <div className="grid grid-cols-7 border-b border-[#E5DDD4] bg-[#FDFCFB] text-center text-xs font-bold text-[#70665F] uppercase tracking-wider py-2.5">
            {WEEKDAY_SHORT.map((wd, i) => (
              <div key={wd} className={cn(i === 0 && 'text-amber-700 font-extrabold')}>
                <span className="hidden sm:inline">{WEEKDAY_NAMES[i]}</span>
                <span className="sm:hidden">{wd}</span>
              </div>
            ))}
          </div>

          {/* Month Day Cells Grid */}
          <div className="grid grid-cols-7 flex-1 divide-x divide-y divide-[#F0EAE1] bg-[#F5EFEB]/20">
            {monthCells.map((cell, idx) => {
              const hasEvents = cell.dayEvents.length > 0;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectDate?.(cell.dateStr);
                    if (hasEvents) {
                      setSelectedDayEvents({ dateStr: cell.dateStr, events: cell.dayEvents });
                    }
                  }}
                  className={cn(
                    'min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 transition-colors flex flex-col justify-between group cursor-pointer relative',
                    cell.isCurrentMonth ? 'bg-white hover:bg-[#FAF7F2]/60' : 'bg-[#FAF7F2]/40 text-slate-400',
                    cell.isToday && 'bg-amber-50/30'
                  )}
                >
                  {/* Top Bar of Cell: Day Number & Today Tag */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold transition',
                        cell.isToday
                          ? 'bg-crm-brand-700 text-white shadow-xs ring-2 ring-crm-brand-700/20'
                          : cell.isCurrentMonth
                          ? 'text-[#211B17] group-hover:text-crm-brand-800'
                          : 'text-[#B8ACA0]'
                      )}
                    >
                      {cell.dayNum}
                    </span>

                    {/* Today Pill */}
                    {cell.isToday && (
                      <span className="text-[9px] font-extrabold text-crm-brand-700 uppercase font-mono tracking-widest hidden sm:inline">
                        Today
                      </span>
                    )}

                    {/* Quick Add Button on Cell Hover */}
                    {onAddEvent && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddEvent(cell.dateStr);
                        }}
                        title={`Add entry for ${cell.dateStr}`}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#8D7B70] hover:text-crm-brand-800 hover:bg-white rounded transition shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Event Badges List inside Day */}
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[75px] sm:max-h-[85px]">
                    {cell.dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectorEvent(ev);
                          onSelectEvent?.(ev);
                        }}
                        className={cn(
                          'px-1.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold truncate transition cursor-pointer flex items-center gap-1 border shadow-2xs',
                          ev.badgeColor || 'bg-amber-50 text-amber-900 border-amber-200'
                        )}
                        title={ev.title}
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', ev.dotColor || 'bg-amber-600')} />
                        <span className="truncate">{ev.title}</span>
                      </div>
                    ))}

                    {/* Overflow Badge */}
                    {cell.dayEvents.length > 3 && (
                      <div className="text-[9.5px] font-mono font-bold text-crm-brand-700 hover:underline px-1 cursor-pointer">
                        +{cell.dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda / Timeline List View */
        <div className="p-4 sm:p-6 space-y-3 divide-y divide-[#F0EAE1]">
          {agendaEvents.length === 0 ? (
            <div className="text-center py-12 text-[#8D7B70]">
              <CalendarIcon className="w-10 h-10 mx-auto mb-2 text-[#C4B7AA]" />
              <p className="font-bold text-sm text-[#211B17]">No events scheduled</p>
              <p className="text-xs text-[#8D7B70] mt-0.5">
                There are no scheduled entries matching your active filter.
              </p>
            </div>
          ) : (
            agendaEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => {
                  setInspectorEvent(ev);
                  onSelectEvent?.(ev);
                }}
                className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF7F2]/60 p-3 rounded-xl transition cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#E5DDD4] flex flex-col items-center justify-center shrink-0 shadow-2xs">
                    <span className="text-[10px] font-bold text-[#8D7B70] uppercase font-mono">
                      {parseDateSafe(ev.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-base font-extrabold text-[#211B17] font-mono leading-none">
                      {parseDateSafe(ev.date).getDate()}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
                      <span>{ev.title}</span>
                      {ev.category && (
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                            ev.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                          )}
                        >
                          {ev.category}
                        </span>
                      )}
                    </h4>

                    {ev.description && (
                      <p className="text-xs text-[#70665F] mt-0.5 line-clamp-1">{ev.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-[#8D7B70] mt-1 font-mono">
                      {ev.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>{ev.time}</span>
                        </span>
                      )}
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>{ev.location}</span>
                        </span>
                      )}
                      {ev.person && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-blue-600" />
                          <span>{ev.person}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="self-end sm:self-center px-3 py-1.5 text-xs font-bold text-crm-brand-700 bg-white hover:bg-crm-brand-50 border border-[#E5DDD4] rounded-lg shadow-2xs transition"
                >
                  View Details
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. Event Detail Inspector Modal */}
      {inspectorEvent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5DDD4] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-[#FAF7F2] border-b border-[#E5DDD4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-crm-brand-700" />
                <h3 className="font-bold text-sm text-[#211B17]">Event Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectorEvent(null)}
                className="p-1 text-[#8D7B70] hover:text-[#211B17] hover:bg-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs">
              <div>
                <h4 className="text-base font-bold text-[#211B17]">{inspectorEvent.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-crm-brand-700 font-bold">
                    {parseDateSafe(inspectorEvent.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  {inspectorEvent.time && (
                    <span className="text-[#70665F] font-mono">• {inspectorEvent.time}</span>
                  )}
                </div>
              </div>

              {inspectorEvent.description && (
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB] text-[#544B45] leading-relaxed">
                  {inspectorEvent.description}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                {inspectorEvent.category && (
                  <div>
                    <span className="text-[#8D7B70] block text-[11px]">Category:</span>
                    <span className="font-semibold text-[#211B17]">{inspectorEvent.category}</span>
                  </div>
                )}
                {inspectorEvent.status && (
                  <div>
                    <span className="text-[#8D7B70] block text-[11px]">Status:</span>
                    <span className="font-semibold text-[#211B17]">{inspectorEvent.status}</span>
                  </div>
                )}
                {inspectorEvent.person && (
                  <div>
                    <span className="text-[#8D7B70] block text-[11px]">Assigned Staff:</span>
                    <span className="font-semibold text-[#211B17]">{inspectorEvent.person}</span>
                  </div>
                )}
                {inspectorEvent.location && (
                  <div>
                    <span className="text-[#8D7B70] block text-[11px]">Location / Venue:</span>
                    <span className="font-semibold text-[#211B17]">{inspectorEvent.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#FAF7F2] border-t border-[#E5DDD4] flex justify-end">
              <button
                type="button"
                onClick={() => setInspectorEvent(null)}
                className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ERPCalendarView;
