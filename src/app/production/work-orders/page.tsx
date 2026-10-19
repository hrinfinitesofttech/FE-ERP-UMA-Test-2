'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkOrdersRemovedPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/production/planning');
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-slate-500">
      Work Orders page has been removed. Redirecting to Production Planning...
    </div>
  );
}
