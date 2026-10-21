'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ProjectTasksDetailView } from '../../../../components/production/ProjectTasksDetailView';

export default function ProductionProjectTasksPage() {
  const params = useParams();
  const rawId = params?.id;
  const planId = Array.isArray(rawId) ? rawId[0] : rawId || '';
  const decodedId = decodeURIComponent(planId);

  return <ProjectTasksDetailView planId={decodedId} />;
}
