'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  ArrowUp,
  Plus,
  Trash2,
  Pencil,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ERPFormSectionProps {
  number?: string | number; // e.g. "1." or "2."
  title: string; // e.g. "Vendor Details"
  subtitle?: string;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
}

export function ERPFormSection({
  number,
  title,
  subtitle,
  isCollapsible = false,
  defaultExpanded = true,
  rightAction,
  children,
}: ERPFormSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden transition-all">
      {/* Section Header */}
      <div
        onClick={() => isCollapsible && setIsExpanded(!isExpanded)}
        className={cn(
          'p-4 sm:p-5 flex items-center justify-between border-b border-[#F1F5F9] select-none',
          isCollapsible && 'cursor-pointer hover:bg-[#F8FAFC]'
        )}
      >
        <div className="flex items-center gap-2">
          {number && <span className="text-sm font-extrabold text-[#1E293B]">{number}</span>}
          <h2 className="text-sm font-bold text-[#1E293B] tracking-tight">{title}</h2>
          {subtitle && <span className="text-xs text-[#94A3B8] font-normal">({subtitle})</span>}
        </div>

        <div className="flex items-center gap-3">
          {rightAction && <div onClick={(e) => e.stopPropagation()}>{rightAction}</div>}
          {isCollapsible && (
            <button
              type="button"
              className="p-1 text-[#64748B] hover:text-[#1E293B] rounded transition"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Section Body */}
      {(!isCollapsible || isExpanded) && (
        <div className="p-4 sm:p-6 space-y-4 animate-in slide-in-from-top-1 duration-150">
          {children}
        </div>
      )}
    </div>
  );
}

// 4-Column Responsive Grid container
export function ERPFormGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5', className)}>
      {children}
    </div>
  );
}

// Standard Form Input
export function ERPInput({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  error,
  className,
  name,
  prefix,
}: {
  label: string;
  required?: boolean;
  value: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  name?: string;
  prefix?: React.ReactNode;
}) {
  return (
    <div className={cn('flex flex-col space-y-1', className)}>
      <label className="text-[11.5px] font-semibold text-[#475569] flex items-center gap-0.5">
        <span>{label}</span>
        {required && <span className="text-rose-500 font-bold">*</span>}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <div className="absolute left-3 text-xs text-[#64748B] pointer-events-none font-medium">
            {prefix}
          </div>
        )}
        <input
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder || `Enter ${label}`}
          className={cn(
            'w-full py-2 px-3 text-xs bg-white border rounded-lg text-[#1E293B] placeholder:text-[#94A3B8] transition shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]',
            prefix ? 'pl-8' : '',
            disabled ? 'bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed border-[#E2E8F0]' : 'border-[#CBD5E1]',
            error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200' : ''
          )}
        />
      </div>
      {error && <span className="text-[10.5px] text-rose-500 font-medium">{error}</span>}
    </div>
  );
}

// Standard Form Select
export function ERPSelect({
  label,
  required,
  value,
  onChange,
  options,
  disabled = false,
  error,
  className,
  name,
  prefix,
}: {
  label: string;
  required?: boolean;
  value: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string | number }[];
  disabled?: boolean;
  error?: string;
  className?: string;
  name?: string;
  prefix?: React.ReactNode;
}) {
  return (
    <div className={cn('flex flex-col space-y-1', className)}>
      <label className="text-[11.5px] font-semibold text-[#475569] flex items-center gap-0.5">
        <span>{label}</span>
        {required && <span className="text-rose-500 font-bold">*</span>}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <div className="absolute left-3 text-xs text-[#64748B] pointer-events-none font-medium">
            {prefix}
          </div>
        )}
        <select
          name={name}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            'w-full py-2 px-3 text-xs bg-white border rounded-lg text-[#1E293B] transition shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] cursor-pointer appearance-none pr-8',
            prefix ? 'pl-8' : '',
            disabled ? 'bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed border-[#E2E8F0]' : 'border-[#CBD5E1]',
            error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200' : ''
          )}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 absolute right-3 text-[#94A3B8] pointer-events-none" />
      </div>
      {error && <span className="text-[10.5px] text-rose-500 font-medium">{error}</span>}
    </div>
  );
}

// Standard Form Checkbox
export function ERPCheckbox({
  label,
  checked,
  onChange,
  disabled = false,
  className,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label
      className={cn(
        'flex items-center gap-2.5 text-xs font-semibold text-[#334155] cursor-pointer select-none py-2',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded text-[#7C3AED] focus:ring-[#7C3AED]/30 border-[#CBD5E1] accent-[#7C3AED] cursor-pointer"
      />
      <span>{label}</span>
    </label>
  );
}

// Sub-table card for Address Details / Contact Details matching Screenshot 2
export interface ERPSubTableCardProps {
  title: string; // e.g. "Address Details"
  onAdd?: () => void;
  addLabel?: string; // e.g. "+ Add Address"
  isEmpty?: boolean;
  emptyText?: string;
  children?: React.ReactNode;
}

export function ERPSubTableCard({
  title,
  onAdd,
  addLabel = '+ Add Record',
  isEmpty = false,
  emptyText = 'No Records Found',
  children,
}: ERPSubTableCardProps) {
  return (
    <div className="bg-[#FAF7F2]/30 border border-[#E2E8F0] rounded-xl overflow-hidden shadow-2xs">
      <div className="py-2.5 px-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#1E293B]">{title}</h3>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1 cursor-pointer transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{addLabel}</span>
          </button>
        )}
      </div>

      <div className="p-4">
        {isEmpty ? (
          <div className="py-8 text-center text-[#94A3B8] font-semibold text-xs">
            {emptyText}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// Full Form View Layout
export interface ERPFormLayoutProps {
  breadcrumbs: string[]; // e.g. ['DASHBOARD', 'PROCUREMENT', 'VENDOR MASTER', 'CREATE']
  actionTitle?: 'CREATE' | 'UPDATE' | 'VIEW' | string;
  backHref?: string;
  onCancel?: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onSaveDraft?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  errorSummary?: string;
  successMessage?: string;
  children: React.ReactNode;
}

export function ERPFormLayout({
  breadcrumbs,
  actionTitle = 'CREATE',
  backHref,
  onCancel,
  onSubmit,
  onSaveDraft,
  isSubmitting = false,
  submitLabel = 'Submit & Save',
  errorSummary,
  successMessage,
  children,
}: ERPFormLayoutProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col min-h-screen bg-[#F8FAFC] text-[#334155] p-4 sm:p-6 space-y-5 relative pb-28"
    >
      {/* 1. Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-[#64748B]">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-[#CBD5E1]">/</span>}
                <span
                  className={cn(
                    isLast
                      ? 'text-[#7C3AED] font-extrabold tracking-wide'
                      : 'text-[#64748B] hover:text-[#334155] transition'
                  )}
                >
                  {crumb}
                </span>
              </React.Fragment>
            );
          })}
        </div>

        {backHref && (
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#7C3AED] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to List</span>
          </Link>
        )}
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorSummary && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorSummary}</span>
        </div>
      )}

      {/* Form Content Sections */}
      <div className="space-y-5">{children}</div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] py-3.5 px-6 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          {backHref ? (
            <Link
              href={backHref}
              className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] rounded-lg transition"
            >
              Cancel
            </Link>
          ) : onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
          ) : null}

          {onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-[#475569] bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-lg transition shadow-2xs cursor-pointer"
            >
              Save as Draft
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{submitLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Floating Scroll to Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        className="fixed bottom-20 right-6 z-40 p-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer flex items-center justify-center"
        title="Scroll to Top"
      >
        <ArrowUp className="w-4 h-4 stroke-[2.5]" />
      </button>
    </form>
  );
}
