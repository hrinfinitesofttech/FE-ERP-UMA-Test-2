'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MaintenancePartsReturnRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/maintenance/spare-parts?tab=return');
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-[#8D7B70]">
      Redirecting to Service Parts Return to Store Hub...
    </div>
  );
}
