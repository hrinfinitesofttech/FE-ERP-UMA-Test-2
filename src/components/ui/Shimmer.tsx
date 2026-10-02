'use client';

import React from 'react';
import { cn } from '../../lib/utils';

export function ShimmerBox({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl animate-shimmer',
        className
      )}
    />
  );
}

export function ShimmerBadge({ className }: { className?: string }) {
  return <div className={cn('h-5 w-16 rounded-full animate-shimmer', className)} />;
}

export function ShimmerText({
  rows = 3,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2.5', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-3.5 rounded-md animate-shimmer"
          style={{ width: `${85 - (i % 3) * 15}%` }}
        />
      ))}
    </div>
  );
}

export function ShimmerStats({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 bg-white border border-[#E7DED5] rounded-2xl space-y-3 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 rounded-md animate-shimmer" />
            <div className="h-7 w-7 rounded-xl animate-shimmer" />
          </div>
          <div className="h-7 w-28 rounded-lg animate-shimmer" />
          <div className="h-2.5 w-36 rounded-md animate-shimmer" />
        </div>
      ))}
    </div>
  );
}

export function ShimmerCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-5 bg-white border border-[#E7DED5] rounded-2xl shadow-xs space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-4 w-36 rounded-md animate-shimmer" />
          <div className="h-3 w-48 rounded-md animate-shimmer" />
        </div>
        <div className="h-8 w-24 rounded-full animate-shimmer" />
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 w-full rounded-md animate-shimmer" />
        <div className="h-3 w-5/6 rounded-md animate-shimmer" />
        <div className="h-3 w-3/4 rounded-md animate-shimmer" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-6 w-20 rounded-md animate-shimmer" />
        <div className="h-6 w-20 rounded-md animate-shimmer" />
      </div>
    </div>
  );
}

export function ShimmerTable({
  columns = 6,
  rows = 6,
  title,
  subtitle,
  className,
}: {
  columns?: number;
  rows?: number;
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn('bg-white rounded-2xl border border-[#E7DED5] shadow-xs overflow-hidden flex flex-col', className)}>
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-[#E7DED5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 bg-[#FAF7F2]">
        <div className="space-y-1.5">
          {title ? (
            <h3 className="text-sm font-bold text-[#211B17]">{title}</h3>
          ) : (
            <div className="h-4 w-44 rounded-md animate-shimmer" />
          )}
          {subtitle ? (
            <p className="text-xs text-[#70665F]">{subtitle}</p>
          ) : (
            <div className="h-3 w-64 rounded-md animate-shimmer" />
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="h-8 w-48 rounded-full animate-shimmer" />
          <div className="h-8 w-8 rounded-full animate-shimmer" />
          <div className="h-8 w-24 rounded-xl animate-shimmer" />
        </div>
      </div>

      {/* Table rows */}
      <div className="overflow-x-auto min-h-[240px]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF7F2] border-b border-[#E7DED5]">
            <tr>
              {Array.from({ length: columns }).map((_, cIdx) => (
                <th key={cIdx} className="py-3 px-4">
                  <div className="h-3 w-20 rounded-md animate-shimmer" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFE8DE]">
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx}>
                {Array.from({ length: columns }).map((_, cIdx) => (
                  <td key={cIdx} className="py-4 px-4">
                    <div
                      className="h-3.5 rounded-md animate-shimmer"
                      style={{
                        width: `${Math.max(35, Math.min(95, 45 + ((rIdx * 23 + cIdx * 37) % 50)))}%`,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer bar */}
      <div className="p-3.5 border-t border-[#E7DED5] flex items-center justify-between bg-[#FAF7F2]">
        <div className="h-3 w-36 rounded-md animate-shimmer" />
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md animate-shimmer" />
          <div className="h-3 w-20 rounded-md animate-shimmer" />
          <div className="h-6 w-6 rounded-md animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function ShimmerForm({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-[#E7DED5] p-6 shadow-xs space-y-6', className)}>
      <div className="space-y-2 border-b border-[#E7DED5] pb-4">
        <div className="h-5 w-48 rounded-md animate-shimmer" />
        <div className="h-3.5 w-72 rounded-md animate-shimmer" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-24 rounded-md animate-shimmer" />
            <div className="h-9 w-full rounded-xl animate-shimmer" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-[#E7DED5]">
        <div className="h-9 w-20 rounded-xl animate-shimmer" />
        <div className="h-9 w-28 rounded-xl animate-shimmer" />
      </div>
    </div>
  );
}

export function PageLoadingSkeleton({
  title,
  subtitle,
  statsCount = 4,
  tableCols = 6,
  tableRows = 6,
}: {
  title?: string;
  subtitle?: string;
  statsCount?: number;
  tableCols?: number;
  tableRows?: number;
}) {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#E7DED5] shadow-xs">
        <div className="space-y-1.5">
          {title ? (
            <h1 className="text-2xl font-bold text-[#211B17] tracking-tight">{title}</h1>
          ) : (
            <div className="h-7 w-56 rounded-lg animate-shimmer" />
          )}
          {subtitle ? (
            <p className="text-xs text-[#70665F]">{subtitle}</p>
          ) : (
            <div className="h-3.5 w-80 rounded-md animate-shimmer" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 rounded-xl animate-shimmer" />
          <div className="h-9 w-32 rounded-xl animate-shimmer" />
        </div>
      </div>

      {/* Stats Skeleton */}
      {statsCount > 0 && <ShimmerStats count={statsCount} />}

      {/* Table Skeleton */}
      <ShimmerTable columns={tableCols} rows={tableRows} />
    </div>
  );
}
