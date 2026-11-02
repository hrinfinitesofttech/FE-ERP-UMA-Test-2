export interface Job360Header {
  jobId: string;
  jobNumber: string;
  projectNumber: string;
  customerName: string;
  salesOrderNumber: string;
  customerPoNumber: string;
  productName: string;
  machineModel: string;
  projectManager: string;
  jobStatus: 'New' | 'Design_Pending' | 'Design_Approved' | 'Material_Planning' | 'Purchase_Pending' | 'Material_Available' | 'Production_Planning' | 'In_Production' | 'QC_Pending' | 'Ready_for_Dispatch' | 'Dispatched' | 'Installation' | 'Completed' | 'Closed' | string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  plannedDeliveryDate: string;
  actualDeliveryDate?: string;
  overallProgressPercent: number;
  totalJobValue: number;
  totalJobCost: number;
  profitAmount: number;
  marginPercent: number;
}

export interface Job360TabCRM {
  leadNumber: string;
  leadSource: string;
  enquiryDate: string;
  followUpCount: number;
  lastFollowUpDate: string;
  quotationNumber: string;
  quotationValue: number;
  quotationStatus: string;
  customerPoNumber: string;
  customerPoDate: string;
  salesOrderNumber: string;
  salesOrderDate: string;
  salesOrderValue: number;
}

export interface Job360TabProject {
  projectId: string;
  projectNumber: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  milestonesCount: number;
  milestonesCompleted: number;
  timelineDays: number;
  daysRemaining: number;
  openIssuesCount: number;
  delaysCount: number;
  departmentAssignments: { department: string; head: string; status: string }[];
}

export interface Job360TabDesign {
  designJobNumber: string;
  requirementsSummary: string;
  designRevision: string;
  cadFilesCount: number;
  designStatus: string;
  approvedBy: string;
  approvalDate: string;
  bomNumber: string;
  bomRevision: string;
  bomItemsCount: number;
  bomApproved: boolean;
  documentsCount: number;
}

export interface Job360TabPurchase {
  totalPrsCount: number;
  totalRfqsCount: number;
  totalPosCount: number;
  totalPurchaseValue: number;
  pendingPurchaseValue: number;
  deliveredPurchaseValue: number;
  items: {
    itemCode: string;
    description: string;
    requiredQty: number;
    orderedQty: number;
    receivedQty: number;
    poNumber: string;
    supplierName: string;
    status: string;
  }[];
}

export interface Job360TabStore {
  requiredItemsCount: number;
  availableItemsCount: number;
  reservedStockValue: number;
  materialReceivedCount: number;
  materialIssuedCount: number;
  materialReturnedCount: number;
  scrapGeneratedCost: number;
  stockShortageItemsCount: number;
  issuedValue?: number;
  materials: {
    itemCode: string;
    itemName: string;
    requiredQty: number;
    availableStock: number;
    reservedQty: number;
    issuedQty: number;
    status: 'Available' | 'Reserved' | 'Shortage' | 'Issued';
  }[];
}

export interface Job360TabProduction {
  productionOrderId: string;
  workOrderNumber: string;
  targetQuantity: number;
  completedQuantity: number;
  reworkQuantity: number;
  scrapQuantity: number;
  wipQuantity: number;
  workCenterName: string;
  operatorName: string;
  startDate: string;
  estimatedEndDate: string;
  status: string;
  operations: { operationName: string; workCenter: string; status: string; progress: number }[];
}

export interface Job360TabQuality {
  incomingQcPassCount: number;
  incomingQcFailCount: number;
  inProcessQcPassCount: number;
  inProcessQcFailCount: number;
  finalQcStatus: 'Passed' | 'Pending' | 'Failed';
  inspectorName: string;
  inspectionDate: string;
  rejectedQuantity: number;
  reworkHours: number;
  qcCertificateNumber: string;
}

export interface Job360TabDispatch {
  packingListNumber: string;
  dispatchNoteNumber: string;
  dispatchDate: string;
  transporterName: string;
  vehicleNumber: string;
  lrNumber: string;
  deliveryStatus: 'Pending' | 'In Transit' | 'Delivered';
  installationDate?: string;
  commissioningDate?: string;
  installedByTech?: string;
  customerSignOff: boolean;
}

export interface Job360TabAccounts {
  salesInvoiceNumber: string;
  invoiceDate: string;
  invoiceValue: number;
  gstAmount: number;
  grandTotal: number;
  receivedAmount: number;
  outstandingBalance: number;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Unpaid';
  totalActualCost: number;
  grossMarginAmount: number;
  grossMarginPercent: number;
}

export interface Job360TabService {
  warrantyStatus: 'Active' | 'Expired' | 'Under AMC';
  warrantyEndDate: string;
  amcContractNumber?: string;
  amcEndDate?: string;
  serviceRequestsCount: number;
  breakdownEventsCount: number;
  serviceVisitsCount: number;
  lastServiceDate?: string;
}

export interface Job360DocumentItem {
  id: string;
  documentType: string;
  fileName: string;
  fileSize: string;
  version: string;
  uploadedBy: string;
  uploadDate: string;
  approvalStatus: 'Approved' | 'Pending' | 'Draft';
  confidential: boolean;
}

export interface Job360ActivityItem {
  id: string;
  timestamp: string;
  module: string;
  user: string;
  action: string;
  description: string;
}

export interface Job360Full {
  header: Job360Header;
  crm: Job360TabCRM;
  project: Job360TabProject;
  design: Job360TabDesign;
  purchase: Job360TabPurchase;
  store: Job360TabStore;
  production: Job360TabProduction;
  quality: Job360TabQuality;
  dispatch: Job360TabDispatch;
  accounts: Job360TabAccounts;
  service: Job360TabService;
  documents: Job360DocumentItem[];
  timeline: Job360ActivityItem[];
}

export interface ApprovalItem {
  id: string;
  category: 'CRM' | 'Quotation' | 'Sales Order' | 'Project' | 'Design' | 'BOM' | 'Purchase Requisition' | 'Supplier Quotation' | 'Purchase Order' | 'Stock Adjustment' | 'Material Issue' | 'Production Hold' | 'QC' | 'Invoice' | 'Payment' | 'Leave' | 'Overtime' | 'Payroll' | 'Service';
  title: string;
  recordNumber: string;
  requesterName: string;
  requesterRole: string;
  requestDate: string;
  amount?: number;
  relatedJobNumber: string;
  remarks: string;
  urgency: 'Normal' | 'High' | 'Critical';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Changes_Requested';
}

export interface ERPAlertItem {
  id: string;
  module: 'CRM' | 'Project' | 'Design' | 'Purchase' | 'Store' | 'Production' | 'Accounts' | 'HR' | 'Maintenance';
  severity: 'Info' | 'Warning' | 'Critical';
  title: string;
  description: string;
  targetUrl: string;
  timestamp: string;
  actionRequired: string;
  isRead: boolean;
}

export interface JobProfitabilityEntry {
  jobNumber: string;
  customerName: string;
  machineModel: string;
  salesValue: number;
  materialCost: number;
  labourCost: number;
  machineCost: number;
  purchaseCost: number;
  subcontractCost: number;
  otherCost: number;
  totalCost: number;
  grossProfit: number;
  marginPercent: number;
  status: string;
}

export interface Customer360Summary {
  customerId: string;
  customerCode: string;
  customerName: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  gstNumber: string;
  creditLimit: number;
  activeJobsCount: number;
  totalOrderValue: number;
  totalInvoiced: number;
  outstandingReceivable: number;
  openTicketsCount: number;
}

export interface Supplier360Summary {
  supplierId: string;
  supplierCode: string;
  supplierName: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  rating: number;
  activePosCount: number;
  totalPurchasedValue: number;
  totalPaid: number;
  outstandingPayable: number;
  onTimeDeliveryPercent: number;
}

export interface Item360Summary {
  itemId: string;
  itemCode: string;
  itemName: string;
  category: string;
  uom: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderLevel: number;
  unitCost: number;
  totalValuation: number;
  primaryWarehouse: string;
  primarySupplier: string;
}

export interface Employee360Summary {
  employeeId: string;
  employeeCode: string;
  name: string;
  department: string;
  designation: string;
  joiningDate: string;
  currentSalaryCTC: number;
  attendancePercent: number;
  leaveBalance: number;
  assignedJobsCount: number;
  performanceScore: number;
  status: string;
}
