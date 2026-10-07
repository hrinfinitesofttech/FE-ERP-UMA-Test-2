'use client';

import React, { Suspense } from 'react';
import { CRMMasterHub } from '../../../components/crm/CRMMasterHub';

export default function CustomersListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#70665F]">Loading Customers Master...</div>}>
      <CRMMasterHub defaultTab="customers" />
    </Suspense>
  );
}
