'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MaterialAvailabilityRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/production/mrp?tab=availability');
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-[color:var(--crm-text-tertiary)]">
      Redirecting to Material Planning & Availability Check...
    </div>
  );
}
