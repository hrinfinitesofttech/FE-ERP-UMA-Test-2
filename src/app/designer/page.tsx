'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DesignerPage() {
  const router = useRouter();

  useEffect(() => {
    router?.replace('/designer/dashboard');
  }, [router]);

  return (
    <div className="bg-[#FAF7F2] flex items-center justify-center">
      <div className="flex items-center gap-3 text-crm-brand-500 font-medium">
        <div className="w-5 h-5 border-2 border-crm-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Redirecting to Designer Dashboard...</span>
      </div>
    </div>
  );
}
