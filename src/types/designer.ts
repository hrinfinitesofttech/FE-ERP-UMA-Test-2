export type DesignJobStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'review'
  | 'revision_required'
  | 'approved'
  | 'disapproved'
  | 'rejected'
  | 'bom_pending'
  | 'bom_approved'
  | 'released_to_production'
  | 'on_hold'
  | 'cancelled';

export type RequirementStatus = 'draft' | 'under_review' | 'clarification_required' | 'approved' | 'rejected';

export type DrawingStatus = 'draft' | 'under_review' | 'revision_required' | 'approved' | 'released';

export type PartClassification = 'purchased' | 'manufactured' | 'standard' | 'fabricated';

export type BOMItemType =
  | 'Raw Material'
  | 'Bought-Out'
  | 'Fabricated'
  | 'Consumable'
  | 'Standard Component'
  | 'Electrical'
  | 'Hardware'
  | 'Sub-Assembly'
  | 'RAW_MATERIAL'
  | 'FABRICATED'
  | 'BOUGHT_OUT'
  | 'CONSUMABLE'
  | 'HARDWARE'
  | 'ELECTRICAL';

export type ProcurementType =
  | 'Purchase'
  | 'Stock'
  | 'Manufacture'
  | 'Fabricate'
  | 'In-House'
  | 'Outsourced'
  | 'PURCHASE'
  | 'FABRICATE';

export type RevisionReason =
  | 'Customer Change'
  | 'Technical Correction'
  | 'Manufacturing Requirement'
  | 'Material Availability'
  | 'Cost Optimization'
  | 'Design Improvement'
  | 'Error Correction';

export interface DesignJob {
  id: string; // e.g. DES-2026-0001
  designJobNumber: string;
  projectId: string;
  projectNumber: string;
  jobNumber: string;
  customerId: string;
  customerName: string;
  customerPoNumber: string;
  salesOrderNumber: string;
  productName: string;
  machineType?: string;
  quantity: number;
  deliveryDate: string;
  designManager: string;
  assignedDesigner: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requiredDate: string;
  status: DesignJobStatus;
  remarks?: string;
  activeRevision: string; // e.g. 'REV-01'
  approvedBy?: string;
  approvedDate?: string;
  disapprovedBy?: string;
  disapprovedDate?: string;
  rejectionReason?: string;
  approvalNotes?: string;
  createdDate: string;
}

export interface CustomerRequirement {
  id: string; // e.g. REQ-2026-001
  designJobId: string;
  projectId: string;
  jobNumber: string;
  customerName: string;
  contactPerson: string;
  contactMobile: string;

  // Machine specs
  machineName: string;
  machineType: string;
  model: string;
  quantity: number;
  capacity: string;
  application: string;
  productionRequirement: string;

  // Technical specs
  dimensions: string;
  material: string;
  powerRequirement: string;
  speed: string;
  output: string;
  automationLevel: string;
  controlSystem: string;
  safetyRequirements: string;
  specialRequirements: string;

  // Documents
  customerDrawingUrl?: string;
  referenceImageUrl?: string;

  // Notes & Workflow
  customerNotes?: string;
  designerNotes?: string;
  engineeringNotes?: string;
  status: RequirementStatus;
  reviewedBy?: string;
  approvedBy?: string;
  approvedDate?: string;
  clarificationComments?: string[];
}

export interface DesignTask {
  id: string; // e.g. DSK-2026-001
  designJobId: string;
  projectId: string;
  jobNumber: string;
  taskName: string; // e.g. 'Concept Design', '3D Design', '2D Drawing', 'BOM Prep'
  customerName: string;
  machineName: string;
  designer: string;
  startDate: string;
  targetDate: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours: number;
  actualHours: number;
  progressPercent: number;
  status: 'pending' | 'in_progress' | 'waiting' | 'review' | 'completed';
  remarks?: string;
  attachments?: string[];
}

export interface Drawing2D {
  id: string; // e.g. DWG-2D-001
  drawingNumber: string;
  projectId: string;
  jobNumber: string;
  designJobId?: string;
  machineName?: string;
  partOrAssembly?: string;
  drawingTitle: string;
  category?: 'GA' | 'Fabrication' | 'P&ID' | 'Electrical' | 'Layout' | string;
  revision?: string; // e.g. 'REV-01'
  revisionNumber?: string;
  designer?: string;
  drawnBy?: string;
  checker?: string;
  checkedBy?: string;
  approvedBy?: string;
  status?: DrawingStatus;
  approvalStatus?: string;
  createdDate?: string;
  approvedDate?: string;
  fileFormat: 'DWG' | 'DXF' | 'PDF' | 'PNG/JPG' | string;
  fileUrl?: string;
  fileSize?: string;
  sheetSize?: 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | string;
  scale?: string;
  isLatest?: boolean;
}

export interface Design3DModel {
  id: string; // e.g. CAD-3D-001
  designNumber?: string;
  modelNumber?: string;
  projectId: string;
  jobNumber: string;
  designJobId?: string;
  machineName?: string;
  assemblyName?: string;
  modelName?: string;
  modelTitle?: string;
  revision?: string;
  version?: string;
  designer?: string;
  modeledBy?: string;
  status?: 'draft' | 'under_review' | 'approved';
  approvalStatus?: string;
  software?: 'SolidWorks' | 'AutoCAD 3D' | 'Inventor' | 'Creo' | string;
  fileFormat: 'STEP' | 'IGES' | 'SLDPRT' | 'SLDASM' | 'PDF' | string;
  fileUrl?: string;
  fileSize?: string;
  totalWeightKg?: number;
  centerOfGravity?: string;
  interferenceCheckPassed?: boolean;
  description?: string;
  uploadedBy?: string;
  uploadedDate?: string;
}

export interface AssemblyDrawing {
  id: string;
  assemblyNumber: string;
  projectId: string;
  jobNumber: string;
  designJobId?: string;
  machineName?: string;
  assemblyName?: string;
  assemblyTitle?: string;
  subAssemblyCode?: string;
  parentAssemblyNumber?: string;
  drawingNumber?: string;
  revision?: string;
  revisionNumber?: string;
  designer?: string;
  drawnBy?: string;
  checker?: string;
  approvedBy?: string;
  approvalStatus?: 'draft' | 'under_review' | 'approved';
  linkedBOMId?: string;
  linkedBOMItemId?: string;
  subAssembliesCount?: number;
  partsCount?: number;
  fileFormat?: string;
  fileSize?: string;
  fileUrl?: string;
}

export interface PartDrawing {
  id: string;
  partNumber: string;
  partName: string;
  projectId: string;
  jobNumber: string;
  designJobId?: string;
  material?: string;
  materialGrade?: string;
  rawMaterialSpec?: string;
  finishRequirement?: string;
  tolerances?: string;
  heatTreatment?: string;
  thickness?: string;
  dimensions?: string;
  manufacturingProcess?: string;
  drawingNumber?: string;
  revision?: string;
  revisionNumber?: string;
  quantity?: number;
  designer?: string;
  drawnBy?: string;
  classification: PartClassification;
  status?: 'draft' | 'approved' | 'released';
  fileFormat?: string;
  fileSize?: string;
  fileUrl?: string;
}

export interface BOMItem {
  id: string;
  itemNo: number; // 1, 2, 3...
  partNumber: string;
  itemName: string;
  description: string;
  itemType: BOMItemType;
  material: string;
  specification: string;
  quantity: number;
  unit: string;
  makeBrand?: string;
  procurementType: ProcurementType;
  procurement?: 'PURCHASE' | 'FABRICATE';
  item_type?: 'RAW_MATERIAL' | 'FABRICATED' | 'BOUGHT_OUT' | 'CONSUMABLE' | 'HARDWARE' | 'ELECTRICAL';
  estimatedRate: number;
  totalEstimatedAmount: number;
  parentItemId?: string; // For Multi-level hierarchy
  remarks?: string;
}

export interface BOMHeader {
  id: string; // e.g. BOM-JOB-2026-001
  bomNumber: string;
  projectId: string;
  jobNumber: string;
  designJobId?: string;
  machineName?: string;
  bomName?: string;
  bom_name?: string;
  product?: string | number;
  version?: string;
  quantity?: number;
  revision?: string; // 'REV-00', 'REV-01'
  revisionNumber?: string;
  preparedBy?: string;
  checkedBy?: string;
  approvedBy?: string;
  approvedDate?: string;
  status: 'draft' | 'under_review' | 'approved' | 'released_to_production';
  approvalStatus?: 'draft' | 'under_review' | 'approved' | 'released' | 'released_to_production';
  isLocked?: boolean;
  totalItemCount: number;
  totalItemsCount?: number;
  estimatedTotalCost?: number;
  totalEstimatedCost: number;
  createdDate?: string;
  updatedDate?: string;
  items: BOMItem[];
}

export interface BOMRevision {
  id: string;
  bomId: string;
  bomNumber: string;
  jobNumber: string;
  revisionNumber: string; // e.g. 'REV-01'
  reason: RevisionReason;
  changedBy: string;
  changedDate: string;
  approvalStatus: 'approved' | 'pending' | 'rejected';
  approvedBy?: string;
  changedItemsSummary: {
    itemNo: number;
    partNumber: string;
    oldQty: number;
    newQty: number;
    changeType: 'added' | 'removed' | 'modified';
  }[];
}

export interface DesignRevisionLog {
  id: string;
  revisionNumber: string; // e.g. 'REV-02'
  designJobId: string;
  projectId: string;
  jobNumber: string;
  reason: RevisionReason;
  description: string;
  changedDrawingNumbers: string[];
  changedBOMId: string;

  // Impact analysis
  materialImpact: string; // e.g. 'Replaced 8mm plate with 10mm plate'
  costImpactAmount: number; // estimated diff
  productionImpact: string; // e.g. 'Requires re-bending'
  timelineImpactDays: number;
  purchaseImpact: string; // e.g. 'Cancel PO #154, re-issue for 10mm'

  createdBy: string;
  createdDate: string;
  reviewedBy?: string;
  approvedBy?: string;
  approvedDate?: string;
  isReleased: boolean;
}

export interface DesignReviewChecklist {
  id: string;
  designJobId: string;
  jobNumber: string;
  reviewerName: string;
  reviewerRole: string;
  reviewDate: string;

  customerRequirementCheck: boolean;
  drawingsDimensionCheck: boolean;
  materialSpecificationCheck: boolean;
  bomQuantityCheck: boolean;
  manufacturingFeasibilityCheck: boolean;
  safetyComplianceCheck: boolean;

  result: 'approved' | 'revision_required' | 'rejected';
  mandatoryComments?: string;
}

export interface TechnicalDocumentItem {
  id: string;
  documentName: string;
  category:
    | 'Customer Drawing'
    | 'Design Drawing'
    | 'Assembly Drawing'
    | 'Part Drawing'
    | 'Specification'
    | 'Datasheet'
    | 'Manual'
    | 'Calculation'
    | 'BOM'
    | 'Inspection Document'
    | 'Certificate'
    | 'Other';
  version: string;
  revision: string;
  projectId: string;
  jobNumber: string;
  uploadedBy: string;
  uploadDate: string;
  accessPermission: 'public' | 'designer_only' | 'management_only';
  fileSize?: string;
  fileUrl?: string;
}
