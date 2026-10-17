'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProjectPlanningPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/projects/planning?mode=create');
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-slate-500">
      Loading Project Planning Form...
    </div>
  );
}
