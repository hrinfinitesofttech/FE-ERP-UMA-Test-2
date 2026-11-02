'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DesignerPage() {
  const router = useRouter();

  useEffect(() => {
    router?.replace('/designer/jobs');
  }, [router]);

  return (
    <div className="bg-[color:var(--crm-bg-app)] flex items-center justify-center">
      <div className="flex items-center gap-3 text-crm-brand-500 font-medium">
        <div className="w-5 h-5 border-2 border-crm-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Redirecting to Design Jobs...</span>
      </div>
    </div>
  );
}
