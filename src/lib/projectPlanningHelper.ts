import { ProjectJobMaster, ProjectPlanningStage, ProjectMilestone, DepartmentAssignment, PlanningStageAssignee, ProjectTask, TaskStatus } from '../types/crm';

export interface StageTemplate {
  num: number;
  name: string;
  dept: string;
  defaultEmployee: string;
  defaultAssignees: PlanningStageAssignee[];
  startPct: number;
  endPct: number;
  defaultStatus: ProjectPlanningStage['status'];
  defaultProgress: number;
  description: string;
}

export const STANDARD_16_STAGES: StageTemplate[] = [
  {
    num: 1,
    name: 'Order Confirmation & Kickoff',
    dept: 'crm',
    defaultEmployee: 'Pravin Patel, Amit Sharma',
    defaultAssignees: [
      { id: 'EMP-001', name: 'Pravin Patel', role: 'Sales Head', department: 'CRM' },
      { id: 'EMP-002', name: 'Amit Sharma', role: 'Order Coordinator', department: 'CRM' },
    ],
    startPct: 0.0,
    endPct: 0.02,
    defaultStatus: 'pending',
    defaultProgress: 0,
    description: 'Sales Order confirmed, commercial terms agreed, customer PO received and internal kickoff.',
  },
  {
    num: 2,
    name: 'Project Creation & Job Allocation',
    dept: 'project',
    defaultEmployee: 'Bhavin Shah',
    defaultAssignees: [
      { id: 'EMP-003', name: 'Bhavin Shah', role: 'Project Manager', department: 'Project' },
    ],
    startPct: 0.0,
    endPct: 0.04,
    defaultStatus: 'pending',
    defaultProgress: 0,
    description: 'Job Number and Project File created. PM, Design lead and Shop supervisor assigned.',
  },
  {
    num: 3,
    name: 'Design CAD 3D & GA Drawings (Engineering Design)',
    dept: 'designer',
    defaultEmployee: 'Dharmesh Joshi, Ketan Patel',
    defaultAssignees: [
      { id: 'EMP-004', name: 'Dharmesh Joshi', role: 'Lead CAD Engineer', department: 'Engineering' },
      { id: 'EMP-005', name: 'Ketan Patel', role: 'Design Reviewer', department: 'Engineering' },
    ],
    startPct: 0.04,
    endPct: 0.16,
    defaultStatus: 'pending',
    defaultProgress: 0,
    description: 'Mechanical 3D modeling, General Arrangement (GA) drawing and nozzle orientation details.',
  },
  {
    num: 4,
    name: 'Customer Design Approval & Sign-off',
    dept: 'designer',
    defaultEmployee: 'Dharmesh Joshi, Pravin Patel',
    defaultAssignees: [
      { id: 'EMP-004', name: 'Dharmesh Joshi', role: 'Lead CAD Engineer', department: 'Engineering' },
      { id: 'EMP-001', name: 'Pravin Patel', role: 'Customer Liaison', department: 'CRM' },
    ],
    startPct: 0.16,
    endPct: 0.22,
    defaultStatus: 'pending',
    defaultProgress: 0,
    description: 'GA Drawing submitted to customer engineering for official approval and revision lock.',
  },
  {
    num: 5,
    name: 'BOM Finalization & Indent Release',
    dept: 'designer',
    defaultEmployee: 'Dharmesh Joshi, Vikram Solanki',
    defaultAssignees: [
      { id: 'EMP-004', name: 'Dharmesh Joshi', role: 'Lead CAD Engineer', department: 'Engineering' },
      { id: 'EMP-006', name: 'Vikram Solanki', role: 'Purchase Head', department: 'Purchase' },
    ],
    startPct: 0.22,
    endPct: 0.3,
    defaultStatus: 'pending',
    defaultProgress: 0,
    description: 'BOM exploded into raw plates, forgings, pipes, fasteners and bought-out components.',
  },
  {
    num: 6,
    name: 'Material Planning & Stock Reservation',
    dept: 'store',
    defaultEmployee: 'Store Manager, Rajesh Parmar',
    defaultAssignees: [
      { id: 'EMP-007', name: 'Store Manager', role: 'Inventory Lead', department: 'Store' },
      { id: 'EMP-008', name: 'Rajesh Parmar', role: 'Store Keeper', department: 'Store' },
    ],
    startPct: 0.3,
    endPct: 0.35,
    defaultStatus: 'pending',
    defaultProgress: 0,
    description: 'Warehouse inventory check, stock reservation, and purchase requisition trigger.',
  },
  {
    num: 7,
    name: 'Purchase Requisitions & Supplier POs',
    dept: 'purchase',
    defaultEmployee: 'Vikram Solanki',
    defaultAssignees: [
      { id: 'EMP-006', name: 'Vikram Solanki', role: 'Purchase Manager', department: 'Purchase' },
    ],
    startPct: 0.35,
    endPct: 0.45,
    defaultStatus: 'pending',
    defaultProgress: 0,
    description: 'Supplier quotations, commercial comparison, PO release for steel plates, motors & seals.',
  },
  {
    num: 8,
    name: 'Material Receipt & GRN Inspection',
    dept: 'store',
    defaultEmployee: 'Store Manager, Ketan Patel',
    defaultAssignees: [
      { id: 'EMP-007', name: 'Store Manager', role: 'Store In-charge', department: 'Store' },
      { id: 'EMP-005', name: 'Ketan Patel', role: 'QC Inspector', department: 'Quality' },
    ],
    startPct: 0.45,
    endPct: 0.55,
    defaultStatus: 'pending',
    defaultProgress: 0,
    description: 'Material arrival, Mill Test Certificate (MTC) verification, and GRN inward clearance.',
  },
  {
    num: 9,
    name: 'Production Planning & Routing Card (CNC Cutting & WPS)',
    dept: 'production',
    defaultEmployee: 'Bhavin Shah, Suresh Chauhan',
    defaultAssignees: [
      { id: 'EMP-003', name: 'Bhavin Shah', role: 'Project Manager', department: 'Project' },
      { id: 'EMP-009', name: 'Suresh Chauhan', role: 'Shop Floor Supervisor', department: 'Production' },
    ],
    startPct: 0.55,
    endPct: 0.58,
    defaultStatus: 'pending',
    defaultProgress: 0,
    description: 'Fabrication bay allocation, CNC cutting plans, plate nesting and welding procedure specification (WPS).',
  },
  {
    num: 10,
    name: 'Shop Floor Fabrication & Assembly (Cutting, Fit-up & Welding)',
    dept: 'production',
    defaultEmployee: 'Bhavin Shah, Suresh Chauhan',
    defaultAssignees: [
      { id: 'EMP-003', name: 'Bhavin Shah', role: 'Fabrication Head', department: 'Production' },
      { id: 'EMP-009', name: 'Suresh Chauhan', role: 'Welding Supervisor', department: 'Production' },
    ],
    startPct: 0.58,
    endPct: 0.78,
    defaultStatus: 'pending',
    defaultProgress: 0,
    description: 'Rolling, shell fit-up, dish end welding, nozzle attachment, internal lining and structure fabrication.',
  },
  {
    num: 11,
    name: 'QC Inspection & Hydro/Load Testing',
    dept: 'production',
    defaultEmployee: 'Ketan Patel, Mahendra Solanki',
    defaultAssignees: [
      { id: 'EMP-005', name: 'Ketan Patel', role: 'QC Manager', department: 'Quality' },
      { id: 'EMP-010', name: 'Mahendra Solanki', role: 'NDT Level II Inspector', department: 'Quality' },
    ],
    startPct: 0.78,
    endPct: 0.84,
    defaultStatus: 'pending',
    defaultProgress: 0,
    description: 'DPT/Radiography inspection, hydro-pressure testing at specified bar, and QA release.',
  },
  {
    num: 12,
    name: 'Surface Finishing & Painting/Packing (Color Work & Coating)',
    dept: 'store',
    defaultEmployee: 'Dispatch Supervisor, Store Manager',
    defaultAssignees: [
      { id: 'EMP-011', name: 'Dispatch Supervisor', role: 'Packing Head', department: 'Logistics' },
      { id: 'EMP-007', name: 'Store Manager', role: 'Material Sign-off', department: 'Store' },
    ],
    startPct: 0.84,
    endPct: 0.89,
    defaultStatus: 'pending',
    defaultProgress: 0,
    description: 'Shot blasting (Sa 2.5), primer and epoxy coating painting, wooden crating and packing.',
  },
  {
    num: 13,
    name: 'Dispatch Clearance & Logistics Transit',
    dept: 'project',
    defaultEmployee: 'Bhavin Shah, Amit Sharma',
    defaultAssignees: [
      { id: 'EMP-003', name: 'Bhavin Shah', role: 'Project Manager', department: 'Project' },
      { id: 'EMP-002', name: 'Amit Sharma', role: 'Commercial Invoicing', department: 'Accounts' },
    ],
    startPct: 0.89,
    endPct: 0.93,
    defaultStatus: 'pending',
    defaultProgress: 0,
    description: 'Customer dispatch clearance (MDCC), e-way bill generation and trailer dispatch.',
  },
  {
    num: 14,
    name: 'Site Delivery & Mechanical Erection',
    dept: 'maintenance',
    defaultEmployee: 'Site Engineer, Service Manager',
    defaultAssignees: [
      { id: 'EMP-012', name: 'Site Engineer', role: 'Erection Lead', department: 'Site' },
      { id: 'EMP-013', name: 'Service Manager', role: 'Field Coordinator', department: 'Site' },
    ],
    startPct: 0.93,
    endPct: 0.96,
    defaultStatus: 'pending',
    defaultProgress: 0,
    description: 'Site receiving, crane rigging, positioning on foundation civil pedestals and bolting.',
  },
  {
    num: 15,
    name: 'Commissioning & Trial Run Tests',
    dept: 'maintenance',
    defaultEmployee: 'Service Manager, Site Engineer',
    defaultAssignees: [
      { id: 'EMP-013', name: 'Service Manager', role: 'Commissioning Lead', department: 'Site' },
      { id: 'EMP-012', name: 'Site Engineer', role: 'Instrumentation Support', department: 'Site' },
    ],
    startPct: 0.96,
    endPct: 0.99,
    defaultStatus: 'pending',
    defaultProgress: 0,
    description: 'Cold dry run, hot wet trial, instrumentation calibration, and safety interlocks check.',
  },
  {
    num: 16,
    name: 'Final Handover & Project Sign-off',
    dept: 'project',
    defaultEmployee: 'Bhavin Shah, Pravin Patel',
    defaultAssignees: [
      { id: 'EMP-003', name: 'Bhavin Shah', role: 'Project Manager', department: 'Project' },
      { id: 'EMP-001', name: 'Pravin Patel', role: 'Commercial Sign-off', department: 'CRM' },
    ],
    startPct: 0.99,
    endPct: 1.0,
    defaultStatus: 'pending',
    defaultProgress: 0,
    description: 'Customer joint inspection certificate, operation manual handover and commercial sign-off.',
  },
];

export function create16PlanningStagesForProject(prj: {
  id: string;
  projectNumber?: string;
  jobNumber: string;
  startDate?: string;
  deliveryDate?: string;
  projectManager?: string;
  salesOrderNumber?: string;
}): ProjectPlanningStage[] {
  const startStr = prj.startDate || new Date().toISOString().split('T')[0];
  const startDate = new Date(startStr);

  let targetDelivery = prj.deliveryDate;
  if (!targetDelivery) {
    const d = new Date(startDate.getTime() + 60 * 24 * 60 * 60 * 1000);
    targetDelivery = d.toISOString().split('T')[0];
  }
  const deliveryDate = new Date(targetDelivery);

  const totalDays = Math.max(16, Math.round((deliveryDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

  const addDays = (base: Date, days: number): string => {
    const d = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  };

  return STANDARD_16_STAGES.map((stg) => {
    const plannedStart = addDays(startDate, Math.floor(stg.startPct * totalDays));
    const plannedEnd = addDays(
      startDate,
      Math.max(Math.floor(stg.endPct * totalDays), Math.floor(stg.startPct * totalDays) + 1)
    );

    const isCompleted = stg.defaultStatus === 'completed';
    const isInProgress = stg.defaultStatus === 'in_progress';

    const assignees = [...stg.defaultAssignees];
    if (stg.dept === 'project' && prj.projectManager) {
      if (!assignees.some((a) => a.name?.toLowerCase() === prj.projectManager!?.toLowerCase())) {
        assignees.unshift({ id: 'EMP-PM', name: prj.projectManager, role: 'Assigned PM', department: 'Project' });
      }
    }

    const employeeNames = assignees.map((a) => a.name).join(', ') || stg.defaultEmployee;
    const employeeIds = assignees.map((a) => a.id);

    return {
      id: `STG-${prj.id}-${String(stg.num).padStart(2, '0')}`,
      stageNumber: stg.num,
      stageName: stg.name,
      projectId: prj.id,
      jobNumber: prj.jobNumber,
      plannedStart,
      plannedEnd,
      actualStart: isCompleted || isInProgress ? plannedStart : undefined,
      actualEnd: isCompleted ? plannedEnd : undefined,
      responsibleDepartment: stg.dept,
      responsibleEmployee: employeeNames,
      assignedEmployeeIds: employeeIds,
      assignedEmployees: assignees,
      status: stg.defaultStatus,
      progressPercent: stg.defaultProgress,
      remarks: stg.description,
      deliverables: `${stg.name} documentation & sign-off`,
    };
  });
}

/**
 * Re-numbers stages sequentially 1..N after addition, deletion, or re-ordering
 */
export function renumberPlanningStages(stages: ProjectPlanningStage[]): ProjectPlanningStage[] {
  return stages.map((stg, idx) => ({
    ...stg,
    stageNumber: idx + 1,
  }));
}

/**
 * Moves a stage up or down in the sequence
 */
export function movePlanningStage(
  stages: ProjectPlanningStage[],
  index: number,
  direction: 'up' | 'down'
): ProjectPlanningStage[] {
  if (direction === 'up' && index <= 0) return stages;
  if (direction === 'down' && index >= stages.length - 1) return stages;

  const targetIdx = direction === 'up' ? index - 1 : index + 1;
  const newStages = [...stages];
  const [removed] = newStages.splice(index, 1);
  newStages.splice(targetIdx, 0, removed);

  return renumberPlanningStages(newStages);
}

/**
 * Deduplicates planning stages for a project or across all projects.
 * Ensures that each stage number (1..16) or name appears only once per project.
 */
export function deduplicatePlanningStages(stages: ProjectPlanningStage[]): ProjectPlanningStage[] {
  if (!Array.isArray(stages)) return [];
  const map = new Map<string, ProjectPlanningStage>();

  const normalizeProjectKey = (stg: any): string => {
    const raw = String(stg.projectId || stg.project_id || stg.jobNumber || stg.job_number || '').trim();
    const digits = raw.replace(/^(PRJ|JOB|PROJECT)-/i, '').trim().toLowerCase();
    return digits || raw.toLowerCase() || 'default_prj';
  };

  const cleanStageName = (name: any): string => {
    return String(name || '')
      .toLowerCase()
      .replace(/^stage\s*\d+\s*:\s*/i, '')
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 25);
  };

  for (const rawStg of stages) {
    if (!rawStg) continue;
    const stg = { ...rawStg };
    // Normalize field names across frontend & backend DRF
    stg.stageName = stg.stageName || (stg as any).name || '';
    stg.stageNumber = Number(stg.stageNumber || (stg as any).stage_number || (stg as any).num || 0);
    stg.progressPercent = Number(stg.progressPercent ?? (stg as any).progress ?? 0);
    stg.responsibleDepartment = stg.responsibleDepartment || (stg as any).department || 'production';
    stg.responsibleEmployee = stg.responsibleEmployee || (stg as any).assignedEmployeeName || (stg as any).assigned_employee_name || '';
    stg.plannedStart = stg.plannedStart || (stg as any).startDate || (stg as any).start_date || '';
    stg.plannedEnd = stg.plannedEnd || (stg as any).endDate || (stg as any).end_date || '';
    stg.remarks = stg.remarks || (stg as any).description || '';

    const prjKey = normalizeProjectKey(stg);
    const stageNum = stg.stageNumber;
    const nameKey = cleanStageName(stg.stageName);

    // Primary unique key: by stage number if valid (1..16), or fallback to name
    const primaryKey = stageNum > 0 ? `${prjKey}__num_${stageNum}` : `${prjKey}__name_${nameKey}`;

    if (!map.has(primaryKey)) {
      map.set(primaryKey, stg);
    } else {
      const existing = map.get(primaryKey)!;
      const isStgBetter =
        (stg.progressPercent || 0) > (existing.progressPercent || 0) ||
        stg.status === 'completed' ||
        (stg.assignedEmployees?.length || 0) > (existing.assignedEmployees?.length || 0);
      if (isStgBetter) {
        map.set(primaryKey, { ...existing, ...stg });
      }
    }
  }

  // Secondary deduplication: ensure no duplicate stageName for the same project
  const byNameMap = new Map<string, ProjectPlanningStage>();
  for (const stg of map.values()) {
    const prjKey = normalizeProjectKey(stg);
    const nameKey = cleanStageName(stg.stageName);
    const secondaryKey = nameKey ? `${prjKey}__name_${nameKey}` : `${prjKey}__id_${stg.id}`;

    if (!byNameMap.has(secondaryKey)) {
      byNameMap.set(secondaryKey, stg);
    } else {
      const existing = byNameMap.get(secondaryKey)!;
      const isStgBetter =
        (stg.progressPercent || 0) > (existing.progressPercent || 0) ||
        stg.status === 'completed';
      if (isStgBetter) {
        byNameMap.set(secondaryKey, { ...existing, ...stg });
      }
    }
  }

  return Array.from(byNameMap.values()).sort((a, b) => (a.stageNumber || 0) - (b.stageNumber || 0));
}

export function createDefaultMilestonesForProject(prj: {
  id: string;
  projectNumber: string;
  jobNumber: string;
  startDate?: string;
  deliveryDate?: string;
  projectManager?: string;
}): ProjectMilestone[] {
  const startStr = prj.startDate || new Date().toISOString().split('T')[0];
  const startDate = new Date(startStr);
  const deliveryDate = new Date(prj.deliveryDate || new Date(startDate.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const totalDays = Math.max(16, Math.round((deliveryDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

  const addDays = (base: Date, days: number): string => {
    const d = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  };

  const msTemplates = [
    { name: 'Customer PO & Project Kickoff', pct: 0.0, owner: 'Pravin Patel', status: 'achieved' as const, remarks: 'Order finalized' },
    { name: 'Design CAD & BOM Sign-off', pct: 0.22, owner: 'Dharmesh Joshi', status: 'pending' as const, remarks: 'GA Drawing approved' },
    { name: 'Raw Material Receipt in Store', pct: 0.52, owner: 'Store Manager', status: 'pending' as const, remarks: 'Plates & bought-out items inwarded' },
    { name: 'Fabrication & Hydro Test Clearance', pct: 0.82, owner: prj.projectManager || 'Bhavin Shah', status: 'pending' as const, remarks: 'Shop floor QC approved' },
    { name: 'Dispatch & Site Delivery', pct: 0.93, owner: prj.projectManager || 'Bhavin Shah', status: 'pending' as const, remarks: 'Flagged off with permit' },
    { name: 'Site Commissioning & Handover', pct: 1.0, owner: 'Service Manager', status: 'pending' as const, remarks: 'Completion certificate signed' },
  ];

  return msTemplates.map((m, idx) => ({
    id: `MS-${prj.id}-${String(idx + 1).padStart(2, '0')}`,
    milestoneName: m.name,
    projectId: prj.id,
    projectNumber: prj.projectNumber,
    jobNumber: prj.jobNumber,
    plannedDate: addDays(startDate, Math.floor(m.pct * totalDays)),
    actualDate: m.status === 'achieved' ? addDays(startDate, 0) : undefined,
    owner: m.owner,
    status: m.status,
    remarks: m.remarks,
  }));
}

export function createDefaultDepartmentAssignments(prj: {
  id: string;
  projectNumber: string;
  jobNumber: string;
  startDate?: string;
  deliveryDate?: string;
  projectManager?: string;
}): DepartmentAssignment[] {
  return [];
}

/**
 * Automatically converts all 16 Project Planning Stages into corresponding Project Tasks
 * with sequential prerequisite dependencies (Stage N depends on Stage N-1), assignees,
 * departments, dates, and percentage completed.
 */
export function convertPlanningStagesToTasks(
  stages: ProjectPlanningStage[],
  prj: { id: string; projectNumber?: string; jobNumber: string; deliveryDate?: string; startDate?: string }
): ProjectTask[] {
  // Sort stages by stageNumber
  const sorted = [...stages].sort((a, b) => (a.stageNumber || 0) - (b.stageNumber || 0));

  return sorted.map((stg, idx) => {
    const taskId = `TSK-${stg.id}`;
    const prevStage = idx > 0 ? sorted[idx - 1] : null;
    const depTaskId = prevStage ? `TSK-${prevStage.id}` : undefined;

    const taskStatus: TaskStatus =
      stg.status === 'completed'
        ? 'completed'
        : stg.status === 'in_progress'
        ? 'in_progress'
        : stg.status === 'delayed'
        ? 'waiting'
        : 'pending';

    const assignees =
      stg.assignedEmployees && stg.assignedEmployees.length > 0
        ? stg.assignedEmployees.map((a) => a.name).join(', ')
        : stg.responsibleEmployee || 'Unassigned';

    return {
      id: taskId,
      taskNumber: `TSK-${String(stg.stageNumber || idx + 1).padStart(2, '0')}`,
      projectId: prj.id,
      projectNumber: prj.projectNumber || prj.id,
      jobNumber: prj.jobNumber,
      taskName: stg.stageName,
      description: stg.remarks || stg.deliverables || `${stg.stageName} execution step for ${prj.jobNumber}`,
      department: stg.responsibleDepartment,
      assignedTo: assignees,
      priority: (stg.stageNumber || idx + 1) <= 4 ? 'high' : (stg.stageNumber || idx + 1) <= 10 ? 'urgent' : 'medium',
      startDate: stg.plannedStart || prj.startDate || new Date().toISOString().split('T')[0],
      dueDate: stg.plannedEnd || prj.deliveryDate || new Date().toISOString().split('T')[0],
      estimatedHours: 40,
      actualHours: Math.round(((stg.progressPercent || 0) / 100) * 40),
      status: taskStatus,
      completionPercent: stg.progressPercent ?? (stg.status === 'completed' ? 100 : 0),
      dependentTaskId: depTaskId,
      remarks: stg.deliverables,
    };
  });
}

