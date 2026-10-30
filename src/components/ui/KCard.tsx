'use client';

import React from 'react';
import { cn } from '../../lib/utils';

export interface KCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  color?: 'default' | 'blue' | 'amber' | 'emerald' | 'purple' | 'rose' | 'teal';
  active?: boolean;
  onClick?: () => void;
  badge?: React.ReactNode;
  className?: string;
}

const colorStyles = {
  default: {
    iconBg: 'bg-slate-100 text-slate-600',
    valueColor: 'text-slate-900',
    activeBorder: 'border-slate-800 ring-1 ring-slate-800',
  },
  blue: {
    iconBg: 'bg-blue-50 text-blue-600',
    valueColor: 'text-blue-700',
    activeBorder: 'border-blue-600 ring-1 ring-blue-600 bg-blue-50/20',
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-600',
    valueColor: 'text-amber-700',
    activeBorder: 'border-amber-600 ring-1 ring-amber-600 bg-amber-50/20',
  },
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-600',
    valueColor: 'text-emerald-700',
    activeBorder: 'border-emerald-600 ring-1 ring-emerald-600 bg-emerald-50/20',
  },
  purple: {
    iconBg: 'bg-purple-50 text-purple-600',
    valueColor: 'text-purple-700',
    activeBorder: 'border-purple-600 ring-1 ring-purple-600 bg-purple-50/20',
  },
  rose: {
    iconBg: 'bg-rose-50 text-rose-600',
    valueColor: 'text-rose-700',
    activeBorder: 'border-rose-600 ring-1 ring-rose-600 bg-rose-50/20',
  },
  teal: {
    iconBg: 'bg-teal-50 text-[#204354]',
    valueColor: 'text-[#204354]',
    activeBorder: 'border-[#204354] ring-1 ring-[#204354] bg-teal-50/20',
  },
};

export function KCard({
  title,
  value,
  subtext,
  icon,
  color = 'default',
  active = false,
  onClick,
  badge,
  className,
}: KCardProps) {
  const c = colorStyles[color] || colorStyles.default;
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={cn(
        'bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs transition-all duration-150',
        isClickable && 'cursor-pointer hover:border-slate-300 hover:shadow-xs active:scale-[0.99]',
        active ? c.activeBorder : '',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider truncate">
          {title}
        </span>
        {icon && (
          <div
            className={cn(
              'w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs',
              c.iconBg
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className={cn('text-xl font-black tracking-tight leading-tight', c.valueColor)}>
          {value}
        </div>
        {badge}
      </div>

      {subtext && (
        <div className="text-[10.5px] text-slate-400 font-medium truncate mt-0.5">
          {subtext}
        </div>
      )}
    </div>
  );
}

// Alias for convenience
export const KPICard = KCard;
