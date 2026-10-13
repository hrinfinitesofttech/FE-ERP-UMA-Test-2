'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MaintenancePartsIssueRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/maintenance/spare-parts?tab=issue');
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-[#8D7B70]">
      Redirecting to Service Parts Issue Requisitions Hub...
    </div>
  );
}
