'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Plus, Inbox, Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  timeoutSeconds?: number;
  onRetry?: () => void;
  className?: string;
}

export function LoadingState({
  message = 'Loading live data from server...',
  timeoutSeconds = 15,
  onRetry,
  className = '',
}: LoadingStateProps) {
  const [timedOut, setTimedOut] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const sec = Math.floor((Date.now() - start) / 1000);
      setElapsed(sec);
      if (sec >= timeoutSeconds) {
        setTimedOut(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeoutSeconds]);

  if (timedOut) {
    return (
      <ErrorState
        title="Loading Timeout"
        message={`The server took longer than ${timeoutSeconds}s to respond. You can retry the request.`}
        onRetry={() => {
          setTimedOut(false);
          setElapsed(0);
          onRetry?.();
        }}
        className={className}
      />
    );
  }

  return (
    <div className={`p-8 sm:p-12 text-center bg-white rounded-2xl border border-[#E7DED5] shadow-xs space-y-4 ${className}`}>
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#75401F]">
            <Loader2 className="w-6 h-6 animate-spin text-[#75401F]" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-[#211B17] text-sm tracking-tight">{message}</h3>
          <p className="text-[11px] text-[#70665F]">
            Fetching records... ({elapsed}s elapsed)
          </p>
        </div>
      </div>

      {/* Skeleton Preview Bars */}
      <div className="max-w-md mx-auto space-y-2 pt-2 opacity-75">
        <div className="h-3 bg-[#F4EFEA] rounded-full animate-pulse w-3/4 mx-auto" />
        <div className="h-3 bg-[#F4EFEA] rounded-full animate-pulse w-1/2 mx-auto" />
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function EmptyState({
  title = 'No Records Found',
  message = 'There are no active records in this directory or view.',
  actionLabel,
  actionHref,
  onAction,
  icon: Icon = Inbox,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`p-8 sm:p-12 text-center bg-white rounded-2xl border border-[#E7DED5] shadow-xs space-y-4 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#EBE3DB] text-[#70665F] flex items-center justify-center mx-auto shadow-2xs">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1 max-w-sm mx-auto">
        <h3 className="font-bold text-[#211B17] text-sm tracking-tight">{title}</h3>
        <p className="text-xs text-[#70665F] leading-relaxed">{message}</p>
      </div>

      {(actionLabel && (actionHref || onAction)) && (
        <div className="pt-2 flex justify-center">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 text-white text-xs font-bold transition shadow-xs cursor-pointer min-h-[40px]"
            >
              <Plus className="w-4 h-4" />
              <span>{actionLabel}</span>
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 text-white text-xs font-bold transition shadow-xs cursor-pointer min-h-[40px]"
            >
              <Plus className="w-4 h-4" />
              <span>{actionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Failed to Load Records',
  message = 'An unexpected error occurred while communicating with the API.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className={`p-8 sm:p-12 text-center bg-white rounded-2xl border border-rose-200 shadow-xs space-y-4 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1 max-w-sm mx-auto">
        <h3 className="font-bold text-[#211B17] text-sm tracking-tight">{title}</h3>
        <p className="text-xs text-rose-700 leading-relaxed">{message}</p>
      </div>

      {onRetry && (
        <div className="pt-2 flex justify-center">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#75401F] hover:bg-[#5C3218] text-white text-xs font-bold transition shadow-xs cursor-pointer min-h-[40px] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
            <span>{retrying ? 'Retrying...' : 'Retry Now'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
