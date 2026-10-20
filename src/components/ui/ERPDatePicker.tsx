'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface EventIndicator {
  date: string; // 'YYYY-MM-DD'
  color?: string; // hex or tailwind class
  title?: string;
  type?: 'holiday' | 'task' | 'meeting' | 'followup' | 'inspection' | 'deadline' | 'default';
}

export interface ERPDatePickerProps {
  value?: string; // 'YYYY-MM-DD'
  onChange?: (date: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  minDate?: string; // 'YYYY-MM-DD'
  maxDate?: string; // 'YYYY-MM-DD'
  className?: string;
  buttonClassName?: string;
  popoverClassName?: string;
  showShortcuts?: boolean;
  clearable?: boolean;
  events?: EventIndicator[];
  isDateDisabled?: (date: Date) => boolean;
  name?: string;
  id?: string;
  required?: boolean;
  align?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
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

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Format a date object to 'YYYY-MM-DD' in local time
function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse 'YYYY-MM-DD' safely without UTC timezone shift
function parseDateString(str?: string): Date | null {
  if (!str) return null;
  const parts = str.split('-');
  if (parts.length < 3) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);
  return isNaN(d.getTime()) ? null : d;
}

// Pretty formatting for user display: e.g. "17 Dec 2026"
function formatDisplayDate(dateStr?: string): string {
  const d = parseDateString(dateStr);
  if (!d) return '';
  const day = d.getDate();
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function ERPDatePicker({
  value,
  onChange,
  placeholder = 'Select date...',
  label,
  disabled = false,
  minDate,
  maxDate,
  className,
  buttonClassName,
  popoverClassName,
  showShortcuts = true,
  clearable = true,
  events = [],
  isDateDisabled,
  name,
  id,
  required = false,
  align = 'left',
  size = 'md',
}: ERPDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse current active value
  const selectedDate = useMemo(() => parseDateString(value), [value]);

  // Calendar View month & year (initialized from selectedDate or today)
  const [viewDate, setViewDate] = useState<Date>(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  });

  // Track month/year selector modal mode: 'days' | 'months' | 'years'
  const [selectorMode, setSelectorMode] = useState<'days' | 'months' | 'years'>('days');

  // Keep viewDate synced when value changes externally
  useEffect(() => {
    if (selectedDate) {
      setViewDate(new Date(selectedDate));
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectorMode('days');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSelectorMode('days');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelectDate = (dateStr: string) => {
    if (disabled) return;
    onChange?.(dateStr);
    setIsOpen(false);
    setSelectorMode('days');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange?.('');
  };

  // Quick preset shortcuts
  const applyPreset = (daysOffset: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysOffset);
    const dateStr = toDateString(target);
    onChange?.(dateStr);
    setViewDate(target);
    setIsOpen(false);
  };

  // Today string for comparison
  const todayStr = useMemo(() => toDateString(new Date()), []);

  // Compute 42 calendar grid cells (6 rows × 7 days)
  const calendarCells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isDisabled: boolean;
      events: EventIndicator[];
    }[] = [];

    // 1. Previous month trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const d = new Date(year, month - 1, dayNum);
      const str = toDateString(d);
      cells.push({
        dateStr: str,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: str === todayStr,
        isSelected: str === value,
        isDisabled:
          Boolean(minDate && str < minDate) ||
          Boolean(maxDate && str > maxDate) ||
          Boolean(isDateDisabled && isDateDisabled(d)),
        events: events.filter((ev) => ev.date === str),
      });
    }

    // 2. Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const d = new Date(year, month, day);
      const str = toDateString(d);
      cells.push({
        dateStr: str,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: str === todayStr,
        isSelected: str === value,
        isDisabled:
          Boolean(minDate && str < minDate) ||
          Boolean(maxDate && str > maxDate) ||
          Boolean(isDateDisabled && isDateDisabled(d)),
        events: events.filter((ev) => ev.date === str),
      });
    }

    // 3. Next month leading days (to fill 35 or 42 cells)
    const totalRemaining = 42 - cells.length;
    for (let day = 1; day <= totalRemaining; day++) {
      const d = new Date(year, month + 1, day);
      const str = toDateString(d);
      cells.push({
        dateStr: str,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: str === todayStr,
        isSelected: str === value,
        isDisabled:
          Boolean(minDate && str < minDate) ||
          Boolean(maxDate && str > maxDate) ||
          Boolean(isDateDisabled && isDateDisabled(d)),
        events: events.filter((ev) => ev.date === str),
      });
    }

    return cells;
  }, [viewDate, value, todayStr, minDate, maxDate, isDateDisabled, events]);

  // Year choices for year selector: +/- 10 years
  const yearOptions = useMemo(() => {
    const curYear = viewDate.getFullYear();
    const years: number[] = [];
    for (let y = curYear - 7; y <= curYear + 7; y++) {
      years.push(y);
    }
    return years;
  }, [viewDate]);

  // Size styling classes
  const sizeClasses = {
    sm: 'py-1 px-2.5 text-xs',
    md: 'py-1.5 px-3 text-xs',
    lg: 'py-2 px-3.5 text-sm',
  };

  return (
    <div className={cn('relative inline-block w-full', className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-[#544B45] mb-1 tracking-tight"
        >
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger Button Input */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={cn(
          'w-full flex items-center justify-between gap-2 bg-white border border-[#E5DDD4] rounded-lg transition-all duration-150 cursor-pointer select-none shadow-xs group',
          sizeClasses[size],
          isOpen
            ? 'border-crm-brand-700 ring-2 ring-crm-brand-700/20 bg-[#FDFCFB]'
            : 'hover:border-[#C4B7AA] hover:bg-[#FAF7F2]/50',
          disabled && 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200',
          buttonClassName
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon
            className={cn(
              'w-3.5 h-3.5 shrink-0 transition-colors',
              value ? 'text-crm-brand-700' : 'text-[#8D7B70] group-hover:text-crm-brand-700'
            )}
          />
          {value ? (
            <span className="font-semibold text-[#211B17] font-mono tracking-tight truncate whitespace-nowrap">
              {formatDisplayDate(value)}
            </span>
          ) : (
            <span className="text-[#8D7B70] text-xs truncate whitespace-nowrap">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {clearable && value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear date"
              className="p-0.5 text-[#A89F91] hover:text-[#544B45] hover:bg-slate-200/60 rounded transition cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown
            className={cn(
              'w-3 h-3 text-[#A89F91] transition-transform duration-200',
              isOpen && 'rotate-180 text-crm-brand-700'
            )}
          />
        </div>
      </div>

      {/* Hidden input to ensure native form compatibility */}
      <input type="hidden" name={name} id={id} value={value || ''} />

      {/* Modern Floating Calendar Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className={cn(
            'absolute z-50 mt-1.5 bg-white border border-[#E5DDD4] rounded-2xl shadow-2xl p-4 w-[320px] max-w-[92vw] text-xs font-sans animate-in fade-in zoom-in-95 duration-150',
            align === 'right' ? 'right-0' : 'left-0',
            popoverClassName
          )}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#F0EAE1]">
            {/* Month & Year Navigation / Quick Select */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setSelectorMode(selectorMode === 'months' ? 'days' : 'months')
                }
                className="px-2 py-1 rounded-lg font-bold text-sm text-[#211B17] hover:bg-[#FAF7F2] hover:text-crm-brand-800 transition flex items-center gap-1 cursor-pointer"
              >
                <span>{MONTH_NAMES[viewDate.getMonth()]}</span>
                <ChevronDown className="w-3 h-3 text-[#8D7B70]" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectorMode(selectorMode === 'years' ? 'days' : 'years')
                }
                className="px-2 py-1 rounded-lg font-bold text-sm font-mono text-[#544B45] hover:bg-[#FAF7F2] hover:text-crm-brand-800 transition flex items-center gap-1 cursor-pointer"
              >
                <span>{viewDate.getFullYear()}</span>
                <ChevronDown className="w-3 h-3 text-[#8D7B70]" />
              </button>
            </div>

            {/* Prev / Next Month Arrow Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Previous Month"
                className="p-1.5 text-[#70665F] hover:text-crm-brand-800 hover:bg-[#FAF7F2] rounded-lg border border-transparent hover:border-[#E5DDD4] transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                title="Next Month"
                className="p-1.5 text-[#70665F] hover:text-crm-brand-800 hover:bg-[#FAF7F2] rounded-lg border border-transparent hover:border-[#E5DDD4] transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Month Quick Grid Selector Mode */}
          {selectorMode === 'months' && (
            <div className="grid grid-cols-3 gap-2 py-2">
              {MONTH_NAMES.map((m, idx) => {
                const isSelected = viewDate.getMonth() === idx;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setViewDate(new Date(viewDate.getFullYear(), idx, 1));
                      setSelectorMode('days');
                    }}
                    className={cn(
                      'py-2 px-1 text-xs font-semibold rounded-xl transition text-center cursor-pointer',
                      isSelected
                        ? 'bg-crm-brand-700 text-white font-bold shadow-xs'
                        : 'text-[#4A3B32] hover:bg-[#FAF7F2] hover:text-crm-brand-800'
                    )}
                  >
                    {m.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Year Quick Grid Selector Mode */}
          {selectorMode === 'years' && (
            <div className="grid grid-cols-3 gap-2 py-2 max-h-[190px] overflow-y-auto">
              {yearOptions.map((yr) => {
                const isSelected = viewDate.getFullYear() === yr;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      setViewDate(new Date(yr, viewDate.getMonth(), 1));
                      setSelectorMode('days');
                    }}
                    className={cn(
                      'py-2 px-1 text-xs font-mono font-semibold rounded-xl transition text-center cursor-pointer',
                      isSelected
                        ? 'bg-crm-brand-700 text-white font-bold shadow-xs'
                        : 'text-[#4A3B32] hover:bg-[#FAF7F2] hover:text-crm-brand-800'
                    )}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
          )}

          {/* Standard Days Grid Mode */}
          {selectorMode === 'days' && (
            <>
              {/* Day of week header row */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {WEEKDAY_NAMES.map((wd, i) => (
                  <span
                    key={wd}
                    className={cn(
                      'text-[10px] font-bold font-mono py-1 select-none uppercase tracking-wider',
                      i === 0 ? 'text-amber-700' : 'text-[#8D7B70]'
                    )}
                  >
                    {wd}
                  </span>
                ))}
              </div>

              {/* Day numbers grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((cell, idx) => {
                  const hasEvents = cell.events.length > 0;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={cell.isDisabled}
                      onClick={() => handleSelectDate(cell.dateStr)}
                      className={cn(
                        'relative h-8 w-full rounded-xl flex flex-col items-center justify-center font-mono text-xs transition duration-150 select-none cursor-pointer',
                        cell.isDisabled &&
                          'opacity-25 cursor-not-allowed text-slate-400 hover:bg-transparent',
                        // Active / Selected state
                        cell.isSelected
                          ? 'bg-crm-brand-700 text-white font-bold shadow-sm ring-2 ring-crm-brand-700/30'
                          : // Today state (not selected)
                          cell.isToday
                          ? 'border border-crm-brand-600/60 font-bold text-crm-brand-800 bg-amber-50/50'
                          : // Current month vs other month
                          cell.isCurrentMonth
                          ? 'text-[#211B17] hover:bg-[#FAF7F2] hover:text-crm-brand-800'
                          : 'text-[#C4B7AA] hover:bg-slate-50'
                      )}
                    >
                      <span>{cell.dayNumber}</span>

                      {/* Event indicator micro-dots */}
                      {hasEvents && (
                        <div className="absolute bottom-1 flex items-center gap-0.5 justify-center">
                          {cell.events.slice(0, 3).map((ev, evIdx) => (
                            <span
                              key={evIdx}
                              className={cn(
                                'w-1 h-1 rounded-full',
                                cell.isSelected
                                  ? 'bg-white'
                                  : ev.color || 'bg-amber-600'
                              )}
                              title={ev.title || 'Event'}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Quick Shortcuts Bar (Today, Tomorrow, +3d, Clear) */}
          {showShortcuts && (
            <div className="mt-3 pt-2.5 border-t border-[#F0EAE1] flex items-center justify-between gap-1 text-[11px]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => applyPreset(0)}
                  className="px-2 py-0.5 rounded-md font-semibold bg-[#FAF7F2] hover:bg-[#F2ECE3] text-crm-brand-800 border border-[#E5DDD4] transition cursor-pointer"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(1)}
                  className="px-2 py-0.5 rounded-md font-semibold bg-[#FAF7F2] hover:bg-[#F2ECE3] text-crm-brand-800 border border-[#E5DDD4] transition cursor-pointer"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(7)}
                  className="px-2 py-0.5 rounded-md font-semibold bg-[#FAF7F2] hover:bg-[#F2ECE3] text-crm-brand-800 border border-[#E5DDD4] transition cursor-pointer"
                >
                  +1 Wk
                </button>
              </div>

              {value && clearable && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2 py-0.5 text-[#8D7B70] hover:text-rose-600 font-medium transition cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Export both names for convenience
export const CustomDatePicker = ERPDatePicker;
export default ERPDatePicker;
