'use client';

import React, { Suspense } from 'react';
import DispatchPage from '../dispatch/page';

export default function DeliveryChallanRoutePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[color:var(--crm-text-tertiary)]">Loading Delivery Challan...</div>}>
      <DispatchPage />
    </Suspense>
  );
}
