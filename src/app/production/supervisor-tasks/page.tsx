'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductionSupervisorTasksPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/production/planning');
  }, [router]);

  return null;
}
