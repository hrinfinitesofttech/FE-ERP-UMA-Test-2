'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Trash2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { cn } from '../lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

export interface ConfirmModalOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
  confirm: (options: ConfirmModalOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Standalone global reference for non-React contexts or direct module calls
let globalAddToast: ((type: ToastType, message: string, title?: string, duration?: number) => void) | null = null;
let globalConfirmModal: ((options: ConfirmModalOptions) => void) | null = null;

export const toast = {
  success: (message: string, title?: string, duration?: number) => {
    if (globalAddToast) globalAddToast('success', message, title, duration);
  },
  error: (message: string, title?: string, duration?: number) => {
    if (globalAddToast) globalAddToast('error', message, title, duration);
  },
  warning: (message: string, title?: string, duration?: number) => {
    if (globalAddToast) globalAddToast('warning', message, title, duration);
  },
  info: (message: string, title?: string, duration?: number) => {
    if (globalAddToast) globalAddToast('info', message, title, duration);
  },
  confirm: (options: ConfirmModalOptions) => {
    if (globalConfirmModal) globalConfirmModal(options);
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmModalOptions | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, title?: string, duration: number = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = { id, type, message, title, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string, duration?: number) => addToast('success', message, title, duration),
    [addToast]
  );
  const error = useCallback(
    (message: string, title?: string, duration?: number) => addToast('error', message, title, duration),
    [addToast]
  );
  const warning = useCallback(
    (message: string, title?: string, duration?: number) => addToast('warning', message, title, duration),
    [addToast]
  );
  const info = useCallback(
    (message: string, title?: string, duration?: number) => addToast('info', message, title, duration),
    [addToast]
  );

  const openConfirm = useCallback((options: ConfirmModalOptions) => {
    setConfirmState(options);
  }, []);

  // Register global singletons
  useEffect(() => {
    globalAddToast = addToast;
    globalConfirmModal = openConfirm;

    // Intercept native window.alert so any browser alert becomes a sleek Toast notification!
    if (typeof window !== 'undefined') {
      const nativeAlert = window.alert;
      window.alert = (msg?: any) => {
        const text = String(msg ?? '');
        if (text.toLowerCase().includes('error') || text.toLowerCase().includes('failed')) {
          error(text, 'System Notice');
        } else if (text.toLowerCase().includes('success') || text.toLowerCase().includes('saved') || text.toLowerCase().includes('created')) {
          success(text, 'Success');
        } else if (text.toLowerCase().includes('please') || text.toLowerCase().includes('required') || text.toLowerCase().includes('warning')) {
          warning(text, 'Validation Alert');
        } else {
          info(text, 'Notification');
        }
      };

      return () => {
        window.alert = nativeAlert;
        globalAddToast = null;
        globalConfirmModal = null;
      };
    }
  }, [addToast, openConfirm, success, error, warning, info]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
        confirm: openConfirm,
      }}
    >
      {children}

      {/* Floating Toast Notification Stack (Top-Right) */}
      <div
        role="region"
        aria-label="Notifications"
        className="fixed top-4 right-4 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none"
      >
        {toasts.map((item) => {
          const isSuccess = item.type === 'success';
          const isError = item.type === 'error';
          const isWarning = item.type === 'warning';
          const isInfo = item.type === 'info';

          return (
            <div
              key={item.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-top-3',
                isSuccess && 'bg-emerald-50/95 border-emerald-200 text-emerald-950',
                isError && 'bg-rose-50/95 border-rose-200 text-rose-950',
                isWarning && 'bg-amber-50/95 border-amber-200 text-amber-950',
                isInfo && 'bg-[#FAF7F2]/95 border-[#E6DDD2] text-[#211B17]'
              )}
            >
              <div
                className={cn(
                  'shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5',
                  isSuccess && 'bg-emerald-100 text-emerald-700',
                  isError && 'bg-rose-100 text-rose-700',
                  isWarning && 'bg-amber-100 text-amber-700',
                  isInfo && 'bg-crm-brand-100 text-crm-brand-800'
                )}
              >
                {isSuccess && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
                {isError && <AlertCircle className="w-4 h-4 stroke-[2.5]" />}
                {isWarning && <AlertTriangle className="w-4 h-4 stroke-[2.5]" />}
                {isInfo && <Info className="w-4 h-4 stroke-[2.5]" />}
              </div>

              <div className="flex-1 min-w-0 pr-1">
                {item.title && (
                  <h4 className="text-xs font-bold leading-tight mb-0.5">
                    {item.title}
                  </h4>
                )}
                <p className="text-xs font-medium leading-relaxed break-words whitespace-pre-line opacity-90">
                  {item.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-black/5 transition cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Modern Confirmation Dialog Modal */}
      {confirmState && (
        <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150 relative text-left"
            role="alertdialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
                  confirmState.variant === 'danger' || !confirmState.variant
                    ? 'bg-rose-100 text-rose-600'
                    : confirmState.variant === 'warning'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-crm-brand-100 text-crm-brand-700'
                )}
              >
                {confirmState.variant === 'warning' ? (
                  <AlertTriangle className="w-6 h-6 stroke-[2]" />
                ) : confirmState.variant === 'info' ? (
                  <HelpCircle className="w-6 h-6 stroke-[2]" />
                ) : (
                  <Trash2 className="w-6 h-6 stroke-[2]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-stone-900 leading-snug">
                  {confirmState.title || 'Confirm Action'}
                </h3>
                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed break-words">
                  {confirmState.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  if (confirmState.onCancel) confirmState.onCancel();
                  setConfirmState(null);
                }}
                className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 transition cursor-pointer"
              >
                {confirmState.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmState.onConfirm();
                  setConfirmState(null);
                }}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-semibold text-white transition shadow-sm cursor-pointer',
                  confirmState.variant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : confirmState.variant === 'info'
                    ? 'bg-crm-brand-700 hover:bg-crm-brand-800'
                    : 'bg-rose-600 hover:bg-rose-700'
                )}
              >
                {confirmState.confirmText || 'Yes, Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
