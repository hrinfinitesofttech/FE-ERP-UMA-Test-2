'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    // Trigger the top laser progress bar on route change
    setNavigating(true);
    const timer = setTimeout(() => {
      setNavigating(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="relative w-full min-h-full">
      {/* 1. Sleek Top Laser Progress Bar (High-tech ERP Navigation Indicator) */}
      <div
        className={`absolute -top-3 sm:-top-5 md:-top-6 left-0 right-0 h-[2.5px] z-30 pointer-events-none transition-opacity duration-300 ${
          navigating ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`h-full bg-gradient-to-r from-crm-brand-700 via-crm-brand-500 to-crm-brand-400 shadow-[0_0_12px_var(--crm-brand-500)] ${
            navigating ? 'animate-route-progress' : 'w-0'
          }`}
        />
      </div>

      {/* 2. Fluid Enterprise Page Entrance Transition (Zero routing delay, 100% stable) */}
      <div key={pathname} className="w-full min-h-full animate-page-enter">
        {children}
      </div>
    </div>
  );
}

export default PageTransition;
