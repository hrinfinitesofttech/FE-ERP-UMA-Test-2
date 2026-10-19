'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import ProductionSupervisorTasksPage from '../supervisor-tasks/page';

export default function ProductionTasksAliasPage() {
  return <ProductionSupervisorTasksPage />;
}
