'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MaterialIssueRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/production/mrp?tab=issue');
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-[color:var(--crm-text-tertiary)]">
      Redirecting to Material Planning & Issue Request Hub...
    </div>
  );
}
