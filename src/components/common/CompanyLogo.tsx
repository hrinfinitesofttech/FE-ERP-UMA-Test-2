'use client';

import React from 'react';

export interface CompanyLogoProps {
  /** 'full' (logo + text), 'mark' (iconic U-roof mark), 'badge' (logo inside white/frosted rounded badge) */
  variant?: 'full' | 'mark' | 'badge';
  /** Preset height sizes: 'xs' (24px), 'sm' (32px), 'md' (40px), 'lg' (56px), 'xl' (80px) */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Optional extra classes */
  className?: string;
  /** Custom alt text */
  alt?: string;
  /** If true, displays companion title and tagline beside mark */
  showTagline?: boolean;
}

const SIZE_MAP = {
  xs: { h: 'h-6', markSize: 'w-6 h-6', imgHeight: 24 },
  sm: { h: 'h-8', markSize: 'w-8 h-8', imgHeight: 32 },
  md: { h: 'h-10', markSize: 'w-10 h-10', imgHeight: 40 },
  lg: { h: 'h-14', markSize: 'w-14 h-14', imgHeight: 56 },
  xl: { h: 'h-20', markSize: 'w-20 h-20', imgHeight: 80 },
};

export function CompanyLogo({
  variant = 'full',
  size = 'md',
  className = '',
  alt = 'Uma Techno Fab',
  showTagline = false,
}: CompanyLogoProps) {
  const currentSize = SIZE_MAP[size] || SIZE_MAP.md;

  if (variant === 'mark') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/uma-mark.png"
          alt={alt}
          className={`${currentSize.markSize} object-contain shrink-0 drop-shadow-xs select-none`}
          loading="eager"
        />
        {showTagline && (
          <div className="leading-tight truncate">
            <span className="font-extrabold text-[#18417D] tracking-wide text-xs block">
              UMA TECHNO FAB
            </span>
            <span className="text-[10px] text-[#F37A20] font-semibold tracking-tight block">
              Manufacturing ERP
            </span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center justify-center p-2 rounded-2xl bg-white/95 border border-[#E7DED5] shadow-xs backdrop-blur-xs ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/uma-logo.png"
          alt={alt}
          className={`${currentSize.h} w-auto object-contain select-none`}
          loading="eager"
        />
      </div>
    );
  }

  // Default 'full' variant
  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/uma-logo.png"
        alt={alt}
        className={`${currentSize.h} w-auto object-contain select-none`}
        loading="eager"
      />
    </div>
  );
}

export default CompanyLogo;
