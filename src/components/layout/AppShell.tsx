'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { JobTraceabilityModal } from '../traceability/JobTraceabilityModal';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import { useERP } from '../../context/ERPContext';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

function isRouteAllowed(pathname: string, currentUser: any): boolean {
  if (!pathname || pathname === '/login' || pathname === '/forgot-password') {
    return true;
  }

  // Universal profile & notifications
  if (pathname === '/profile' || pathname === '/notifications') {
    return true;
  }

  // Universal employee self-service (Punches, Leaves, Assigned Tasks)
  if (
    pathname === '/hr/attendance' ||
    pathname === '/hr/leaves' ||
    pathname === '/projects/tasks'
  ) {
    return true;
  }

  const isSuperAdmin =
    currentUser?.roleType === 'super_admin' ||
    currentUser?.role_type === 'super_admin' ||
    currentUser?.roleName === 'Super Admin' ||
    currentUser?.role === 'Super Admin' ||
    currentUser?.username === 'admin';

  if (isSuperAdmin) {
    return true;
  }

  // Foundation & Admin routes: Strictly restricted to Super Admin unless explicitly granted
  const isFoundationRoute =
    pathname.startsWith('/users') ||
    pathname.startsWith('/roles') ||
    pathname.startsWith('/permissions') ||
    pathname.startsWith('/departments') ||
    pathname.startsWith('/settings');

  if (isFoundationRoute) {
    const assigned = currentUser?.assignedModules;
    if (Array.isArray(assigned)) {
      return assigned.some((m: string) => {
        const clean = (m || '').toLowerCase().trim();
        return clean === 'settings' || clean === 'foundation' || clean === 'admin' || clean === 'users';
      });
    }
    return false;
  }

  // Operational module detection from URL
  let requiredModule = '';
  if (pathname.startsWith('/crm')) requiredModule = 'crm';
  else if (pathname.startsWith('/projects')) requiredModule = 'projects';
  else if (pathname.startsWith('/designer') || pathname.startsWith('/design')) requiredModule = 'design';
  else if (pathname.startsWith('/purchase')) requiredModule = 'purchase';
  else if (pathname.startsWith('/store')) requiredModule = 'store';
  else if (pathname.startsWith('/production')) requiredModule = 'production';
  else if (pathname.startsWith('/quality')) requiredModule = 'quality';
  else if (pathname.startsWith('/maintenance')) requiredModule = 'maintenance';
  else if (pathname.startsWith('/accounting')) requiredModule = 'accounting';
  else if (pathname.startsWith('/hr')) requiredModule = 'hr';
  else if (pathname.startsWith('/integration')) requiredModule = 'integration';
  else if (pathname.startsWith('/testing')) requiredModule = 'testing';

  if (!requiredModule) {
    return true;
  }

  // Explicit restrictions override all
  const restrictions = currentUser?.explicitRestrictions || currentUser?.explicit_restrictions;
  if (Array.isArray(restrictions)) {
    const isRestricted = restrictions.some((r: string) => {
      const cleanR = String(r).toLowerCase().trim();
      return (
        cleanR === `${requiredModule}:*` ||
        cleanR === `${requiredModule}:view` ||
        cleanR === '*:*' ||
        cleanR === '*:view'
      );
    });
    if (isRestricted) return false;
  }

  // Check computed effective permissions from backend
  const effMods =
    currentUser?.effectivePermissions?.allowed_modules ||
    currentUser?.effective_permissions?.allowed_modules;
  if (Array.isArray(effMods) && effMods.length > 0) {
    return effMods.some((m: string) => {
      const cleanM = (m || '').toLowerCase().trim();
      return cleanM === requiredModule || cleanM.includes(requiredModule) || requiredModule.includes(cleanM);
    });
  }

  // Check assignedModules strictly
  if (currentUser?.assignedModules && Array.isArray(currentUser.assignedModules)) {
    if (currentUser.assignedModules.length > 0) {
      return currentUser.assignedModules.some((m: string) => {
        const cleanM = (m || '').toLowerCase().trim();
        if (requiredModule === 'accounting' && (cleanM === 'accounts' || cleanM === 'accounting' || cleanM === 'finance' || cleanM === 'accounts & finance')) return true;
        if (requiredModule === 'design' && (cleanM === 'designer' || cleanM === 'design' || cleanM === 'bom')) return true;
        if (requiredModule === 'projects' && (cleanM === 'project' || cleanM === 'projects' || cleanM === 'planning')) return true;
        if (requiredModule === 'quality' && (cleanM === 'qc' || cleanM === 'quality')) return true;
        if (requiredModule === 'store' && (cleanM === 'store' || cleanM === 'warehouse' || cleanM === 'inventory')) return true;
        if (requiredModule === 'purchase' && (cleanM === 'purchase' || cleanM === 'rfq')) return true;
        return cleanM === requiredModule || cleanM.includes(requiredModule) || requiredModule.includes(cleanM);
      });
    }
    return false;
  }

  // Fallback to department check if assignedModules is undefined
  const deptName = (currentUser?.department || currentUser?.departmentName || '').toLowerCase();
  return deptName.includes(requiredModule);
}

function getPrimaryHref(currentUser: any): string {
  const assigned = currentUser?.assignedModules;
  if (Array.isArray(assigned) && assigned.length > 0) {
    const first = (assigned[0] || '').toLowerCase().trim();
    if (first.includes('account') || first.includes('fin')) return '/accounting/sales-invoices';
    if (first.includes('crm') || first.includes('sales')) return '/crm/leads';
    if (first.includes('project')) return '/projects/list';
    if (first.includes('design')) return '/designer/bom';
    if (first.includes('purch')) return '/purchase/orders';
    if (first.includes('store') || first.includes('wareh')) return '/store/material-issue';
    if (first.includes('prod')) return '/production/work-orders';
  }
  return '/';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAuthenticated, isAuthReady } = useERP();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAuthPage = pathname === '/login' || pathname === '/forgot-password';

  // Strict Authentication Guard: ONLY redirect after client-side auth rehydration is confirmed ready
  useEffect(() => {
    if (isMounted && isAuthReady && !isAuthPage && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isMounted, isAuthReady, isAuthPage, isAuthenticated, router]);

  if (isAuthPage) {
    return (
      <div className="min-h-screen w-screen bg-bg-app text-text-primary flex items-center justify-center p-4 font-sans antialiased">
        {children}
      </div>
    );
  }

  // If session is still loading from browser storage, or user is unauthenticated, render splash screen
  if (!isMounted || !isAuthReady || !isAuthenticated) {
    return (
      <div className="min-h-screen w-screen bg-[#FAF7F2] flex flex-col items-center justify-center font-sans antialiased">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#E7DED5] shadow-lg flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#75401F] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-xs font-semibold text-[#75401F] tracking-wide">
            {!isAuthReady ? 'Verifying session...' : !isAuthenticated ? 'Redirecting to Login...' : 'Initializing UmaERP...'}
          </p>
        </div>
      </div>
    );
  }

  const allowed = isRouteAllowed(pathname, currentUser);
  const primaryHref = getPrimaryHref(currentUser);

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
            {allowed ? (
              children
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[500px]">
                <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-4 shadow-sm">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-extrabold text-[#211B17] mb-2">
                  Access Restricted
                </h2>
                <p className="text-sm text-[#70665F] max-w-md mb-6 leading-relaxed">
                  Your account does not have permission to access this page (<code className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-xs">{pathname}</code>). You can only access modules assigned to your role.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D5CAC0] bg-white text-xs font-bold text-[#4A3B32] hover:bg-[#FAF7F2] transition shadow-xs cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Go Back</span>
                  </button>
                  <button
                    onClick={() => router.push(primaryHref)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Home className="w-4 h-4" />
                    <span>Go to My Dashboard</span>
                  </button>
                </div>
              </div>
            )}
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
