import React from 'react';
import { DepartmentShortcuts } from '@/components/dashboard/DepartmentShortcuts';

/** Adds the department's quick shortcuts above the dashboard. */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DepartmentShortcuts moduleId="accounting" />
      {children}
    </>
  );
}
