'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { JobTraceabilityModal } from '../traceability/JobTraceabilityModal';
import { GlobalSearchModal } from '../search/GlobalSearchModal';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/forgot-password';

  if (isAuthPage) {
    return (
      <div className="min-h-screen w-screen bg-bg-app text-text-primary flex items-center justify-center p-4 font-sans antialiased">
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F4EFEA] text-text-primary font-sans antialiased p-1.5 sm:p-2.5 md:p-3 flex flex-col">
      {/* Outer Luxury Floating Canvas Frame */}
      <div className="flex-1 flex overflow-hidden h-full bg-white rounded-2xl md:rounded-3xl border border-[#E6DDD2] shadow-[0_10px_35px_rgba(62,39,35,0.06)] relative">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#FCFAF7]">
          <Topbar />

          <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 scrollbar-thin bg-[#FCFAF7]">
            {children}
          </main>
        </div>
      </div>

      {/* 360° Job Traceability Modal Dialog */}
      <JobTraceabilityModal />

      {/* Global Search Dialog (Ctrl+K) */}
      <GlobalSearchModal />
    </div>
  );
}
