'use client';

import React, { Suspense } from 'react';
import { CRMMasterHub } from '../../../components/crm/CRMMasterHub';

export default function LeadsListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[color:var(--crm-text-secondary)]">Loading CRM Master Hub...</div>}>
      <CRMMasterHub defaultTab="leads" />
    </Suspense>
  );
}
