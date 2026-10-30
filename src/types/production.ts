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

export interface InProcessInspectionRow {
  processName: string; // 'Cutting' | 'Grinding' | 'Bending' | 'Taking' | 'Welding' | 'Final Grinding' | 'Sand Blasting' | 'Painting'
  parameters: string; // 'Length, Width & Thickness' | 'Finishing' | 'ID , OD' | 'Dimensions' | 'Leakage' | 'Corazon' | 'Color Shade'
  testingMethod: string; // 'Measure Tape & Vernier Caliper' | 'Visual' | 'Measure Tape & Gauge' | 'DP Test & X Ray & Hydraulic test (As Per customer Req.)'
  requirements: string; // 'As Per dwg. 5THK x 7860 x 5500...'
  actual: string; // 'OK' | 'No Req' | 'Deviation'
  remarks?: string;
}

export interface InspectionReportDoc {
  docNo: string; // 'F - QAS - 02'
  reportTitle: string; // 'In process cum final inspection report'
  companyName: string; // 'UMA TECHNO FAB'
  customerName: string;
  item: string;
  workOrderOrJobNo: string;
  qty: string;
  date: string;
  inspectionRows: InProcessInspectionRow[];
  inspectionBy: string;
  inspectionDate?: string;
  finalStatus: 'Approved' | 'Rejected' | 'Accepted with Concession';
}

export interface ProductionCompletion {
  id: string;
  completionNumber: string;
  completionDate: string;
  jobId: string;
  jobNumber: string;
  workOrderNumber: string;
  productName: string;
  customerName?: string;
  completedQuantity: number;
  rejectedQuantity: number;
  reworkQuantity: number;
  scrapQuantity: number;
  completedBy: string;
  qcStatus: 'Pending' | 'Passed' | 'Failed';
  remarks?: string;
  // Detailed Quality Clearance Fields (Doc No. F - QAS - 02)
  docNo?: string;
  inspectionReport?: InspectionReportDoc;
  inspectionRows?: InProcessInspectionRow[];
  inspectionBy?: string;
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
  customerName?: string;
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
  projectId?: string;
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

// ==========================================
// WORK PROFILE DAILY ROUTINE
// ==========================================
export interface WorkerMaster {
  id: string;
  slNo: number;
  workerName: string;
  trade: string; // T: 'Fitter' | 'Welder' | 'Helper' | 'Gas Cutter' | 'Machinist' | 'Grinder' | 'Plasma' | 'Rolling' | string;
  defaultShift?: string; // S: 'General' | 'Day' | 'Night'
  phone?: string;
  isActive: boolean;
}

export interface WorkerDailyRoutineEntry {
  id: string;
  date: string; // YYYY-MM-DD
  workerId: string;
  slNo: number;
  workerName: string;
  trade: string; // T
  shiftStatus: 'Present' | 'Absent' | 'Half Day' | 'Weekly Off'; // S
  shiftType?: 'General' | 'Shift 1' | 'Shift 2' | 'Night';
  jobOrProjectNo?: string; // e.g. 'UTF-26-138'
  workDetails: string; // WORKER column in physical sheet
  quantityNos?: string; // e.g. '4 Nos'
  hoursWorked?: number;
  overtimeHours?: number;
  remarks?: string;
  isVerified?: boolean; // ✓ tickmark by supervisor
  supervisorName?: string;
  updatedAt?: string;
}

// ==========================================
// DELIVERY CHALLAN (MATCHING PHYSICAL SLIP)
// ==========================================
export interface DeliveryChallanItem {
  srNo: number;
  particulars: string; // e.g. "Burger Luxol PU Enamel. W-305 / 05 Drum."
  quantity: string | number; // e.g. "20"
  unitOrAmount: string; // e.g. "4 Ltr" or "Unit" or "NOS"
  notes?: string;
}

export interface DeliveryChallanDoc {
  id: string;
  challanNo: string; // e.g. "547"
  date: string; // e.g. "26.06.2026"
  copyNumber?: string | number; // Top-right circled indicator, e.g. "1" (Original)

  // Consignor Header Details (Pre-printed on physical slip)
  companyName: string; // "UMA TECHNOFAB"
  companyLogoText: string; // "UMA TECHNO FAB"
  companyTagline: string; // "All Industrial Equipments. Tranki Projects..."
  companyPhones: string; // "Mo. : 98250 98367 / 99250 11676"
  companyAddress: string; // "S.No. 1040/3, Village : Rajpur, Nr. Sandvik Tube, Ta-Kadi, Dist-Mehsana. Pin Code - 382721"
  gstin: string; // "GSTIN No. : 24AAEFU9027H1Z3"
  jurisdiction: string; // "Subject to KALOL (N.G) Jurisdiction"

  // Consignee (Buyer) Details
  customerName: string; // "M/s. UMA Food"
  customerAddress: string; // "Address: ..."
  destinationCity?: string;

  // Project / Job Reference (linked from QC & Production)
  projectId?: string;
  jobNumber?: string;
  workOrderNumber?: string;
  qcReportNo?: string; // e.g. "QC-2026-001 (F - QAS - 02)"

  // Transport details (annotated in body / logistics)
  vehicleNumber?: string; // e.g. "GJ-02.AT.3826"
  transporterName?: string;
  lrNumber?: string;
  driverName?: string;
  driverMobile?: string;
  eWayBillNumber?: string;

  // Line Items & Totals
  items: DeliveryChallanItem[];
  totalQuantity: string; // e.g. "20 Ltr"
  totalAmount?: string;

  // Footer Signoffs
  department?: string; // "Department: -"
  receiverSign?: string; // "Receiver Signature & Date"
  authorizedSignatory?: string; // "For, UMA Technofab"

  status: 'Draft' | 'Issued' | 'In Transit' | 'Delivered' | 'Acknowledged';
  remarks?: string;
  createdAt?: string;
}

// ==========================================
// DISPATCH & PACKAGING (PACKING SLIP & CHECKLIST)
// ==========================================
export type PackagingItemCategory =
  | 'Main Equipment'
  | 'Fasteners & Hardware' // Nuts, Bolts, Washers, Studs
  | 'Foundation Hardware' // Foundation J-Bolts, Anchor Fasteners
  | 'Gaskets & Seals' // Flange Gaskets, O-Rings, Seals
  | 'Pipe Fittings & Clamps'
  | 'Spares & Consumables'
  | 'Electrical & Sensors'
  | 'Documentation & Manuals' // O&M Manual, TC, Warranty
  | 'Other Accessories';

export interface PackagingItem {
  id: string;
  srNo: number;
  category: PackagingItemCategory;
  particulars: string; // e.g. "M16 x 65mm Hex Head Bolts with Nuts & Double Washers (Grade 8.8)"
  quantity: string | number;
  unit: string; // "Nos", "Sets", "Kg", "Bags", "Packets", "Rolls", "Pairs"
  boxNo?: string; // e.g. "Box 1/2", "Box 2/2", "Wooden Crate"
  itemWeightKg?: number | string;
  notes?: string;
  isVerified?: boolean;
}

export interface PackagingBox {
  id: string;
  boxNumber: string; // e.g. "Box 1 of 2", "Crate A"
  packageType: string; // "Wooden Box" | "Wooden Crate" | "Corrugated Box" | "Pallet / Skid" | "Steel Frame" | "Gunny Bag" | "Loose / Open"
  dimensions?: string; // e.g. "120 x 80 x 90 cm"
  grossWeightKg?: number | string;
  netWeightKg?: number | string;
  handlingInstructions?: string; // "This Side Up", "Fragile", "Handle with Crane", "Keep Dry"
}

export interface PackagingSlipDoc {
  id: string;
  packingSlipNo: string; // e.g. "PKG-2026-001"
  date: string;
  projectId?: string;
  projectNumber?: string;
  projectName?: string;
  jobId?: string;
  jobNumber?: string;
  workOrderNumber?: string;
  qcInspectionNumber?: string;
  customerId: string;
  customerName: string;
  customerAddress?: string;
  destinationCity?: string;
  productName: string;
  specification?: string;
  packageType: string;
  packageDimensions?: string;
  totalQuantity?: number | string;
  uom?: string;
  totalPackages: number;
  totalGrossWeightKg: number;
  totalNetWeightKg: number;
  packedBy: string;
  verifiedBy?: string;
  status: 'Draft' | 'Packing in Progress' | 'Packed & Verified' | 'Ready for Dispatch' | 'Dispatched';
  boxes: PackagingBox[];
  items: PackagingItem[];
  deliveryChallanId?: string;
  deliveryChallanNo?: string;
  remarks?: string;
  createdAt?: string;
}


