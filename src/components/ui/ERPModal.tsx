'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ERPModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';

export interface ERPModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  size?: ERPModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  backdropDismiss?: boolean;
  showCloseButton?: boolean;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  id?: string;
}

const SIZE_CLASSES: Record<ERPModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  '2xl': 'max-w-4xl',
  '3xl': 'max-w-5xl',
  '4xl': 'max-w-6xl',
  '5xl': 'max-w-7xl',
  full: 'max-w-[96vw]',
};

export function ERPModal({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  icon,
  size = 'xl',
  children,
  footer,
  backdropDismiss = true,
  showCloseButton = true,
  className,
  bodyClassName,
  headerClassName,
  id,
}: ERPModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('erp-modal-open');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove('erp-modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const modalMarkup = (
    <div
      id={id ? `${id}-backdrop` : undefined}
      data-erp-modal="true"
      className="erp-modal-backdrop fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150 overflow-y-auto"
      onClick={(e) => {
        if (backdropDismiss && e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        id={id}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'erp-modal-dialog relative w-full bg-white border border-[#E7DED5] rounded-2xl md:rounded-3xl shadow-2xl flex flex-col my-auto max-h-[92dvh] overflow-hidden animate-in zoom-in-95 duration-150',
          SIZE_CLASSES[size] || 'max-w-3xl',
          className
        )}
      >
        {/* Header (if title or close button provided) */}
        {(title || showCloseButton) && (
          <div
            className={cn(
              'px-5 sm:px-6 py-4 border-b border-[#E7DED5] bg-gradient-to-r from-[#FAF7F2] via-[#FAF3EA] to-[#F8EDE0] flex items-center justify-between gap-4 flex-shrink-0',
              headerClassName
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              {icon && (
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E5DDD0] text-crm-brand-700 flex items-center justify-center shadow-xs flex-shrink-0">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {typeof title === 'string' ? (
                    <h3 className="text-base font-extrabold text-[#211B17] tracking-tight truncate">
                      {title}
                    </h3>
                  ) : (
                    title
                  )}
                  {badge}
                </div>
                {subtitle && (
                  <p className="text-xs text-[#70665F] mt-0.5 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl text-[#70665F] hover:text-[#211B17] hover:bg-white border border-transparent hover:border-[#E7DED5] transition cursor-pointer flex-shrink-0"
                title="Close modal (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Body */}
        <div
          className={cn(
            'flex-1 overflow-y-auto p-5 sm:p-6 text-xs text-[#211B17] scrollbar-thin',
            bodyClassName
          )}
        >
          {children}
        </div>

        {/* Optional Sticky Footer */}
        {footer && (
          <div className="px-5 sm:px-6 py-3.5 bg-[#FAF7F2] border-t border-[#E7DED5] flex items-center justify-end gap-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalMarkup, document.body)
    : null;
}

export default ERPModal;
