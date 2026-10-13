'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MaterialIssueRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/production/mrp?tab=issue');
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-[#8D7B70]">
      Redirecting to Material Planning & Issue Request Hub...
    </div>
  );
}
