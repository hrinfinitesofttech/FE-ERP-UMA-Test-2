export type ManufacturingJobStatus =
  | 'Pending'
  | 'Planning'
  | 'Material Pending'
  | 'Ready for Production'
  | 'In Production'
  | 'WIP'
  | 'QC Pending'
  | 'Completed'
  | 'On Hold'
  | 'Cancelled';

export type WorkOrderStatus =
  | 'Draft'
  | 'Planned'
  | 'Material Pending'
  | 'Ready'
  | 'Released'
  | 'In Progress'
  | 'On Hold'
  | 'Completed'
  | 'Cancelled';

export type ProductionOrderStatus =
  | 'Draft'
  | 'Scheduled'
  | 'In Progress'
  | 'Operation Completed'
  | 'QC Pending'
  | 'Completed'
  | 'On Hold';

export type WorkCenterMachineStatus =
  | 'Available'
  | 'Running'
  | 'Idle'
  | 'Maintenance'
  | 'Breakdown'
  | 'Not Available';

export type OperationStatus =
  | 'Pending'
  | 'Ready'
  | 'In Progress'
  | 'Completed'
  | 'QC Pending'
  | 'Rework'
  | 'Hold';

export type ReworkStatus =
  | 'Open'
  | 'Assigned'
  | 'In Progress'
  | 'Completed'
  | 'QC Pending'
  | 'Closed';

export type FinishedGoodsStatus =
  | 'Production Complete'
  | 'QC Pending'
  | 'QC Passed'
  | 'QC Failed'
  | 'Ready for Dispatch'
  | 'Dispatched';

export type ProductionScrapType =
  | 'Cutting Scrap'
  | 'Welding Scrap'
  | 'Machining Scrap'
  | 'Damaged Material'
  | 'Rejected Component'
  | 'Other';

export type ProductionHoldReason =
  | 'Material Shortage'
  | 'Design Change'
  | 'Customer Change'
  | 'Machine Breakdown'
  | 'Quality Issue'
  | 'Manpower Issue'
  | 'Supplier Delay'
  | 'Other';

export interface ManufacturingJob {
  id: string;
  jobNumber: string;
  projectId: string;
  projectNumber: string;
  customerId: string;
  customerName: string;
  salesOrderId: string;
  salesOrderNumber: string;
  customerPoNumber: string;
  productName: string;
  specification: string;
  quantity: number;
  unit: string;
  designId?: string;
  designRevision: string;
  bomId?: string;
  bomRevision: string;
  projectManager: string;
  productionManager: string;
  plannedStartDate: string;
  plannedCompletionDate: string;
  actualStartDate?: string;
  actualCompletionDate?: string;
  productionProgress: number; // 0 to 100%
  status: ManufacturingJobStatus;
  createdAt?: string;
}

export interface ProductionPlan {
  id: string;
  planNumber: string;
  jobId: string;
  jobNumber: string;
  projectId: string;
  productName: string;
  requiredQuantity: number;
  bomId: string;
  bomRevision: string;
  materialAvailabilityStatus: 'Fully Available' | 'Partially Available' | 'Material Shortage';
  plannedStartDate: string;
  plannedCompletionDate: string;
  assignedWorkCenters: string[];
  plannedManpowerCount: number;
  productionManager: string;
  status: 'Draft' | 'Approved' | 'Released' | 'Completed';
  createdAt?: string;
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  jobId: string;
  jobNumber: string;
  projectId: string;
  customerId: string;
  customerName: string;
  salesOrderNumber: string;
  designRevision: string;
  bomRevision: string;
  productName: string;
  productionQuantity: number;
  uom: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  productionManager: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: WorkOrderStatus;
  remarks?: string;
  createdAt?: string;
}

export interface ProductionOrder {
  id: string;
  productionOrderNumber: string;
  workOrderId: string;
  workOrderNumber: string;
  jobId: string;
  jobNumber: string;
  productName: string;
  quantity: number;
  bomRevision: string;
  designRevision: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  productionManager: string;
  status: ProductionOrderStatus;
  createdAt?: string;
}

export interface RoutingOperation {
  id: string;
  operationNumber: number;
  operationName: string;
  sequence: number;
  workCenterCode: string;
  workCenterName: string;
  machineName: string;
  department: string;
  plannedSetupMinutes: number;
  plannedProcessingMinutes: number;
  totalPlannedMinutes: number;
  assignedOperator: string;
  qcRequired: boolean;
  instructions: string;
  status: OperationStatus;
}

export interface WorkCenter {
  id: string;
  workCenterCode: string;
  workCenterName: string;
  department: string;
  machineName: string;
  machineNumber: string;
  location: string;
  capacityPerDayHours: number;
  availableHours: number;
  efficiencyPercent: number;
  supervisorName: string;
  status: WorkCenterMachineStatus;
}

export interface ProductionScheduleItem {
  id: string;
  scheduleNumber: string;
  jobId: string;
  jobNumber: string;
  workOrderNumber: string;
  operationName: string;
  workCenterCode: string;
  workCenterName: string;
  machineName: string;
  assignedOperator: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  delayHours: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Delayed' | 'Conflict';
}

export interface MRPItemRequirement {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  category: string;
  uom: string;
  requiredQuantity: number;
  availableStockQty: number;
  reservedStockQty: number;
  openPoQty: number;
  netRequirementQty: number; // Formula: Required - (Available - Reserved) - OpenPO
  materialStatus: 'Available' | 'Reserved' | 'Purchase Required' | 'Material Shortage';
  unitCost: number;
  totalCost: number;
  jobId: string;
  jobNumber: string;
}

export interface MaterialAvailabilityCheck {
  jobId: string;
  jobNumber: string;
  overallStatus: 'Fully Available' | 'Partially Available' | 'Material Shortage';
  totalRequiredItems: number;
  availableItemsCount: number;
  shortageItemsCount: number;
  items: {
    itemId: string;
    itemCode: string;
    itemName: string;
    requiredQty: number;
    availableQty: number;
    reservedQty: number;
    orderedQty: number;
    receivedQty: number;
    shortageQty: number;
    status: 'Available' | 'Shortage' | 'Ordered';
  }[];
}

export interface ProductionEntry {
  id: string;
  productionEntryNumber: string;
  entryDate: string;
  jobId: string;
  jobNumber: string;
  workOrderNumber: string;
  productionOrderNumber: string;
  operationName: string;
  workCenterName: string;
  machineName: string;
  operatorName: string;
  startTime: string;
  endTime: string;
  plannedQuantity: number;
  producedQuantity: number;
  rejectedQuantity: number;
  reworkQuantity: number;
  scrapQuantity: number;
  goodQuantity: number; // Formula: producedQuantity - rejectedQuantity - scrapQuantity
  downtimeMinutes: number;
  downtimeReason?: string;
  remarks?: string;
  createdBy: string;
}

export interface OperationProgress {
  id: string;
  jobId: string;
  jobNumber: string;
  operationNumber: number;
  operationName: string;
  plannedQuantity: number;
  completedQuantity: number;
  rejectedQuantity: number;
  reworkQuantity: number;
  status: OperationStatus;
  workCenterName: string;
}

export interface WIPRecord {
  id: string;
  jobId: string;
  jobNumber: string;
  workOrderNumber: string;
  productionOrderNumber: string;
  currentOperationName: string;
  completedOperationsCount: number;
  totalOperationsCount: number;
  wipQuantity: number;
  uom: string;
  location: string;
  responsibleDepartment: string;
  startDate: string;
  expectedCompletionDate: string;
  delayDays: number;
  status: 'In Progress' | 'Delayed' | 'On Hold' | 'QC Pending';
}

export interface ProductionHold {
  id: string;
  holdNumber: string;
  jobId: string;
  jobNumber: string;
  workOrderNumber: string;
  operationName: string;
  reason: ProductionHoldReason;
  description: string;
  startDate: string;
  expectedResumeDate: string;
  approvedBy: string;
  resumeDate?: string;
  status: 'Active Hold' | 'Resumed' | 'Cancelled';
  remarks?: string;
}

export interface ReworkOrder {
  id: string;
  reworkNumber: string;
  jobId: string;
  jobNumber: string;
  workOrderNumber: string;
  productionEntryNumber: string;
  operationName: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  uom: string;
  reason: 'Welding Defect' | 'Dimension Error' | 'Assembly Error' | 'Quality Failure' | 'Customer Requirement' | 'Design Change' | 'Other';
  responsibleDepartment: string;
  reworkInstructions: string;
  assignedOperator: string;
  startDate: string;
  completionDate?: string;
  status: ReworkStatus;
}

export interface ProductionScrap {
  id: string;
  scrapNumber: string;
  entryDate: string;
  jobId: string;
  jobNumber: string;
  workOrderNumber: string;
  productionOrderNumber: string;
  operationName: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  uom: string;
  reason: string;
  scrapType: ProductionScrapType;
  operatorName: string;
  estimatedValue: number;
  remarks?: string;
}

export interface ProductionCompletion {
  id: string;
  completionNumber: string;
  completionDate: string;
  jobId: string;
  jobNumber: string;
  workOrderNumber: string;
  productName: string;
  completedQuantity: number;
  rejectedQuantity: number;
  reworkQuantity: number;
  scrapQuantity: number;
  completedBy: string;
  qcStatus: 'Pending' | 'Passed' | 'Failed';
  remarks?: string;
  // Detailed Quality Clearance Fields
  hydroTestPressure?: string | number;
  hydroHoldingDuration?: string;
  hydroTestStatus?: 'Passed' | 'Failed' | 'Waived';
  dpTestJoints?: string;
  dpTestStatus?: 'Accepted' | 'Defects Found' | 'Waived';
  dimensionReportNo?: string;
  dimensionStatus?: 'Within Tolerance' | 'Within ASME Tolerance (±2mm)' | 'Deviation Approved' | string;
  qcInspectorName?: string;
  certificateNumber?: string;
  equipmentSerialNumber?: string;
}

export interface FinishedGoodsItem {
  id: string;
  finishedGoodsNumber: string;
  jobId: string;
  jobNumber: string;
  workOrderNumber: string;
  productionOrderNumber: string;
  productName: string;
  specification: string;
  quantity: number;
  uom: string;
  serialNumber?: string;
  batchNumber?: string;
  warehouseId: string;
  warehouseName: string;
  locationBin: string;
  completionDate: string;
  qcStatus: 'QC Pending' | 'QC Passed' | 'QC Failed';
  status: FinishedGoodsStatus;
  createdAt?: string;
}

export interface ProductionCostSummary {
  jobId: string;
  jobNumber: string;
  productName: string;
  bomEstimatedCost: number;
  materialIssuedCost: number;
  materialReturnedCost: number;
  netMaterialCost: number;
  plannedLabourHours: number;
  actualLabourHours: number;
  labourCost: number;
  plannedMachineHours: number;
  actualMachineHours: number;
  machineCost: number;
  subcontractingCost: number;
  reworkCost: number;
  scrapCost: number;
  totalEstimatedCost: number;
  totalActualCost: number;
  costVariance: number; // Formula: totalActualCost - totalEstimatedCost
}

export type DispatchStatus =
  | 'Ready for Dispatch'
  | 'Vehicle Loading'
  | 'In Transit'
  | 'Delivered to Site'
  | 'Handover Complete';

export interface DispatchOrder {
  id: string;
  dispatchNumber: string;
  dispatchDate: string;
  jobId: string;
  jobNumber: string;
  workOrderNumber: string;
  finishedGoodsNumber?: string;
  customerId: string;
  customerName: string;
  customerAddress?: string;
  destinationCity?: string;
  productName: string;
  specification?: string;
  quantity: number;
  uom: string;
  serialNumber?: string;
  batchNumber?: string;
  weightMT?: number;
  transporterName: string;
  vehicleNumber: string;
  lrNumber?: string;
  driverName?: string;
  driverMobile?: string;
  eWayBillNumber?: string;
  invoiceNumber?: string;
  packagingType?: string;
  dispatchType?: string;
  qcClearanceBy?: string;
  dispatchedBy?: string;
  status: DispatchStatus;
  remarks?: string;
  createdAt?: string;
}

