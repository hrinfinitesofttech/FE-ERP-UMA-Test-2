import React from 'react';
import { DepartmentShortcuts } from '@/components/dashboard/DepartmentShortcuts';
import { HrInsights } from '@/components/dashboard/HrInsights';

/** HR dashboard: quick shortcuts and analytics charts above the existing summary. */
export default function HrDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DepartmentShortcuts moduleId="hr" />
      <HrInsights />
      {children}
    </>
  );
}
