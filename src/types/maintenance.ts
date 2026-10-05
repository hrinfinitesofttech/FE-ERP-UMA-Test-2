export type MaintenanceAssetStatus =
  | 'Active'
  | 'Under Maintenance'
  | 'Breakdown'
  | 'Idle'
  | 'Retired'
  | 'Scrapped';

export type MaintenanceAssetType =
  | 'Machine'
  | 'Equipment'
  | 'Utility'
  | 'Vehicle'
  | 'Tool'
  | 'Infrastructure';

export type CriticalityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type PMFrequency =
  | 'Daily'
  | 'Weekly'
  | 'Monthly'
  | 'Quarterly'
  | 'Half-Yearly'
  | 'Yearly'
  | 'Meter-Based'
  | 'Custom';

export type ServiceRequestOrigin =
  | 'Customer'
  | 'CRM'
  | 'Phone'
  | 'Email'
  | 'Website'
  | 'WhatsApp'
  | 'Internal Employee'
  | 'Preventive Maintenance'
  | 'Breakdown Alert';

export type ServiceRequestStatus =
  | 'New'
  | 'Assigned'
  | 'Scheduled'
  | 'In Progress'
  | 'Waiting for Parts'
  | 'Waiting for Customer'
  | 'Resolved'
  | 'Closed'
  | 'Cancelled';

export type ServiceVisitStatus =
  | 'Scheduled'
  | 'Started'
  | 'Completed'
  | 'Rescheduled'
  | 'Cancelled';

export type WorkOrderStatus =
  | 'Draft'
  | 'Pending'
  | 'Approved'
  | 'Assigned'
  | 'In Progress'
  | 'Waiting for Parts'
  | 'Completed'
  | 'Closed';

export type AMCStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Active'
  | 'Expiring Soon'
  | 'Expired'
  | 'Cancelled'
  | 'Renewed';

export interface InternalAsset {
  id: string;
  assetCode: string;
  assetName: string;
  assetType: MaintenanceAssetType;
  category: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseSupplier: string;
  purchaseInvoice: string;
  purchaseCost: number;
  installationDate: string;
  location: string;
  department: string;
  responsiblePerson: string;
  warrantyStart: string;
  warrantyEnd: string;
  amcStatus: 'Active' | 'None' | 'Expired';
  amcStart?: string;
  amcEnd?: string;
  maintenanceFrequency: PMFrequency;
  criticality: CriticalityLevel;
  status: MaintenanceAssetStatus;
  documents: string[];
}

export interface CustomerMachine {
  id: string;
  customerMachineId: string;
  machineCode?: string;
  customerId: string;
  customerName: string;
  projectId?: string;
  projectName?: string;
  jobId?: string;
  jobNumber?: string;
  salesOrderId?: string;
  customerPo?: string;
  dispatchNumber?: string;
  installationNumber?: string;
  machineName: string;
  machineModel: string;
  serialNumber: string;
  manufacturingDate: string;
  installationDate: string;
  commissioningDate: string;
  warrantyStart: string;
  warrantyEnd: string;
  amcStart?: string;
  amcEnd?: string;
  machineLocation: string;
  customerContact: string;
  contactPhone: string;
  contactEmail: string;
  serviceEngineer: string;
  status:
    | 'Installed & Operational'
    | 'Under Maintenance'
    | 'Breakdown'
    | 'Decommissioned'
    | 'In Warranty'
    | 'Under AMC';
  documents: string[];
}

export interface ServiceRequest {
  id: string;
  requestNumber: string;
  requestDate: string;
  origin: ServiceRequestOrigin;
  customerId: string;
  customerName: string;
  customerMachineId: string;
  machineName: string;
  serialNumber: string;
  jobNumber?: string;
  contactPerson: string;
  mobile: string;
  email: string;
  complaintType: string;
  description: string;
  problemDescription?: string;
  priority: CriticalityLevel;
  warrantyStatus: 'Under Warranty' | 'Out of Warranty' | 'N/A';
  amcStatus: 'Active AMC' | 'No AMC' | 'Expired';
  preferredVisitDate: string;
  location: string;
  attachments: string[];
  assignedDepartment: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  status: ServiceRequestStatus;
  createdAt: string;
  closedAt?: string;
}

export interface SparePartUsedItem {
  itemCode: string;
  itemName: string;
  quantity: number;
  unitCost: number;
}

export interface BreakdownRecord {
  id: string;
  breakdownNumber: string;
  assetType: 'Internal Asset' | 'Customer Machine';
  assetId: string;
  assetName: string;
  serialNumber: string;
  customerId?: string;
  customerName?: string;
  jobNumber?: string;
  breakdownDate: string;
  breakdownTime: string;
  reportedBy: string;
  problem: string;
  severity: CriticalityLevel;
  initialDiagnosis: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  responseTimeMinutes: number;
  resolutionTimeMinutes: number;
  rootCause: string;
  correctiveAction: string;
  sparePartsUsed: SparePartUsedItem[];
  downtimeHours: number;
  status: 'Reported' | 'Technician Assigned' | 'Diagnosis' | 'In Repair' | 'Testing' | 'Closed';
  remarks: string;
}

export interface ChecklistItem {
  parameter: string;
  expectedValue: string;
  actualValue?: string;
  passFail?: 'Pass' | 'Fail' | 'N/A';
  remarks?: string;
  photo?: string;
}

export interface PreventiveMaintenancePlan {
  id: string;
  planNumber: string;
  assetId: string;
  assetName: string;
  customerMachineId?: string;
  customerName?: string;
  maintenanceType: string;
  frequency: PMFrequency;
  startDate: string;
  nextDueDate: string;
  checklist: ChecklistItem[];
  responsibleTechnicianId: string;
  responsibleTechnicianName: string;
  estimatedDurationHours: number;
  requiredSpareParts: Array<{ itemCode: string; itemName: string; qty: number }>;
  instructions: string;
  status: 'Active' | 'Scheduled' | 'In Progress' | 'Overdue' | 'Completed' | 'Paused';
}

export interface ServicePlanningItem {
  id: string;
  serviceRequestId: string;
  requestNumber: string;
  customerName: string;
  machineName: string;
  problem: string;
  location: string;
  requiredSkills: string[];
  requiredParts: Array<{ itemCode: string; itemName: string; qty: number }>;
  travelRequirement: boolean;
  visitDate: string;
  expectedDurationHours: number;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  vehicleRequired: boolean;
  serviceType: 'Preventive' | 'Breakdown' | 'Installation' | 'Warranty Service' | 'Paid Service';
  priority: CriticalityLevel;
}

export interface ServiceVisit {
  id: string;
  visitNumber: string;
  serviceRequestId: string;
  requestNumber: string;
  customerId: string;
  customerName: string;
  machineName: string;
  serialNumber: string;
  technicianId: string;
  technicianName: string;
  visitDate: string;
  startTime: string;
  endTime: string;
  travelTimeHours: number;
  customerContact: string;
  problem: string;
  diagnosis: string;
  workPerformed: string;
  partsUsed: SparePartUsedItem[];
  labourHours: number;
  status: ServiceVisitStatus;
  customerRemarks: string;
  customerSignature: boolean;
  attachments: string[];
}

export interface ServiceWorkOrder {
  id: string;
  workOrderNumber: string;
  serviceRequestId: string;
  requestNumber: string;
  customerId: string;
  customerName: string;
  customerMachineId: string;
  machineName: string;
  technicianId: string;
  technicianName: string;
  problem: string;
  scopeOfWork: string;
  requiredParts: Array<{ itemCode: string; itemName: string; requestedQty: number; rate: number }>;
  labourHours: number;
  estimatedCost: number;
  actualCost: number;
  approvalRequired: boolean;
  approvedBy?: string;
  status: WorkOrderStatus;
}

export interface ServicePartIssueItem {
  itemCode: string;
  itemName: string;
  requiredQty: number;
  issuedQty: number;
  rate: number;
  warehouse: string;
  location: string;
  batchSerial?: string;
}

export interface ServicePartIssue {
  id: string;
  issueNumber: string;
  workOrderNumber: string;
  serviceRequestId: string;
  customerName: string;
  machineName: string;
  technicianId: string;
  technicianName: string;
  items: ServicePartIssueItem[];
  status: 'Requested' | 'Approved' | 'Issued' | 'Partially Issued' | 'Rejected';
  remarks: string;
  createdAt: string;
}

export interface ServicePartReturnItem {
  itemCode: string;
  itemName: string;
  issuedQty: number;
  usedQty: number;
  returnQty: number;
  condition: 'Good' | 'Damaged' | 'Scrap';
  warehouse: string;
  location: string;
}

export interface ServicePartReturn {
  id: string;
  returnNumber: string;
  workOrderNumber: string;
  originalIssueNumber: string;
  items: ServicePartReturnItem[];
  returnedBy: string;
  receivedBy: string;
  returnDate: string;
  status: 'Pending Store Acceptance' | 'Accepted to Store' | 'Rejected';
}

export interface ServiceReport {
  id: string;
  reportNumber: string;
  serviceRequestId: string;
  visitNumber: string;
  customerId: string;
  customerName: string;
  machineName: string;
  serialNumber: string;
  technicianId: string;
  technicianName: string;
  visitDate: string;
  complaint: string;
  diagnosis: string;
  workPerformed: string;
  partsUsed: Array<{ itemCode: string; itemName: string; qty: number; amount: number }>;
  labourHours: number;
  labourCharge: number;
  partsTotal: number;
  travelCharge: number;
  grandTotal: number;
  machineStatus: 'Operational' | 'Requires Further Action' | 'Replaced' | 'Decommissioned';
  recommendations: string;
  nextServiceDate?: string;
  customerRemarks: string;
  customerNameSignatory: string;
  customerSignature: boolean;
  technicianSignature: boolean;
  attachments: string[];
}

export interface WarrantyRecord {
  id: string;
  customerMachineId: string;
  serialNumber: string;
  customerId: string;
  customerName: string;
  machineName: string;
  warrantyStart: string;
  warrantyEnd: string;
  warrantyType: 'Standard 1 Year' | 'Extended 2 Year' | 'Comprehensive 3 Year' | 'Custom';
  coveredItems: string[];
  exclusions: string[];
  terms: string;
  status: 'Under Warranty' | 'Warranty Expired' | 'Voided';
}

export interface AMCContract {
  id: string;
  amcNumber: string;
  customerId: string;
  customerName: string;
  customerMachineId: string;
  machineName: string;
  serialNumber: string;
  contractStart: string;
  contractEnd: string;
  contractValue: number;
  billingFrequency: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly' | 'One-Time';
  totalVisitsIncluded: number;
  visitsCompleted: number;
  preventiveVisits: number;
  breakdownSupport: boolean;
  partsIncluded: boolean;
  labourIncluded: boolean;
  responseTimeHours: number;
  termsAndConditions: string;
  assignedTechnicianId: string;
  assignedTechnicianName: string;
  status: AMCStatus;
}

export interface ServiceContract {
  id: string;
  contractNumber: string;
  contractType:
    | 'Warranty'
    | 'AMC'
    | 'Paid Service'
    | 'Labour Contract'
    | 'Comprehensive AMC'
    | 'Non-Comprehensive AMC'
    | 'Custom';
  customerName: string;
  machineName: string;
  serialNumber: string;
  contractValue: number;
  startDate: string;
  endDate: string;
  billingTerms: string;
  includedServices: string[];
  excludedServices: string[];
  slaHours: number;
  status: 'Active' | 'Pending' | 'Expired';
}

export interface DowntimeRecord {
  id: string;
  downtimeNumber: string;
  machineId: string;
  machineName: string;
  workCenter: string;
  jobId?: string;
  jobNumber?: string;
  productionOrderNumber?: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  reason:
    | 'Machine Breakdown'
    | 'Maintenance'
    | 'Electrical'
    | 'Mechanical'
    | 'Material Waiting'
    | 'Operator Issue'
    | 'Other';
  breakdownNumber?: string;
  maintenanceType?: string;
  technicianName?: string;
  remarks: string;
}

export interface MaintenanceCostRecord {
  id: string;
  costReference: string;
  referenceType: 'Service Request' | 'Breakdown' | 'Preventive Maintenance' | 'Internal Asset';
  machineId: string;
  machineName: string;
  serialNumber: string;
  partsCost: number;
  labourCost: number;
  externalVendorCost: number;
  travelTransportCost: number;
  totalCost: number;
  estimatedCost: number;
  variance: number;
  isChargeable: boolean;
  billingInvoiceNumber?: string;
  status: 'Recorded' | 'Billed' | 'Internal Cost Overhead';
}

export interface ServiceChecklistTemplate {
  id: string;
  name: string;
  machineType: string;
  category: string;
  items: Array<{
    id: string;
    parameter: string;
    expectedValue: string;
    actualValue?: string;
    passFail?: 'Pass' | 'Fail' | 'N/A';
    remarks?: string;
    photo?: string;
  }>;
}

export interface TechnicianProfile {
  id?: string;
  technicianName?: string;
  skillLevel?: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  skills: string[];
  currentWorkloadCount: number;
  activeJobs: string[];
  totalCompletedVisits: number;
  rating: number;
  availability: 'Available' | 'On Service Visit' | 'On Leave' | 'Busy';
  phone: string;
  location: string;
}
