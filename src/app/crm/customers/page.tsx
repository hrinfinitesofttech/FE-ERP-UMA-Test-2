'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/crm/leads');
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-[#70665F]">
      Redirecting to Leads Management...
    </div>
  );
}
