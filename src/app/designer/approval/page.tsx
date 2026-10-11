'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DesignApprovalPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/designer/jobs');
  }, [router]);

  return (
    <div className="p-8 text-center text-sm text-[#70665F]">
      Redirecting to Design Jobs...
    </div>
  );
}
