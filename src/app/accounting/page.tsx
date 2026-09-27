'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountingIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router?.replace('/accounting/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex items-center gap-3 text-[#70665F]">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading Accounting & Finance Dashboard...</span>
      </div>
    </div>
  );
}
