export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'requirement_received'
  | 'quotation_pending'
  | 'quotation_sent'
  | 'negotiation'
  | 'won'
  | 'lost'
  | 'on_hold';

export type LeadSource =
  | 'website'
  | 'phone'
  | 'whatsapp'
  | 'email'
  | 'exhibition'
  | 'referral'
  | 'existing_customer'
  | 'social_media'
  | 'other';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface CompanySetting {
  id?: string;
  companyName: string;
  tagline: string;
  logoUrl?: string;
  address?: string;
  registeredAddress?: string;
  registrationNumber?: string;
  tan?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  phone?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  accountsEmail?: string;
  email?: string;
  website?: string;
  gstin?: string;
  pan?: string;
  cin?: string;
  financialYear?: string;
  fiscalYearStart?: string;
  fiscalYearEnd?: string;
  currency?: string;
  currencySymbol?: string;
  timezone?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankIfscCode?: string;
  bankBranch?: string;
  lutNumber?: string;
  isLUTActive?: boolean;
}

export interface NumberingSetting {
  id: string;
  module: string;
  docType: 'lead' | 'quotation' | 'customer_po' | 'sales_order' | 'project' | 'job' | 'enquiry' | 'opportunity' | 'visit' | 'invoice';
  prefix: string;
  suffix?: string;
  currentNumber: number;
  digitCount: number; // e.g. 4 for 0001
  samplePreview: string;
}

export interface Employee {
  id: string; // e.g. EMP-001
  firstName: string;
  lastName: string;
  name?: string;
  profilePhoto?: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  mobile: string;
  phone?: string;
  email: string;
  address: string;
  departmentId: string;
  departmentName: string;
  department?: string;
  designation: string;
  roleId: string;
  roleName: string;
  role?: string;
  reportingManagerId?: string;
  reportingManagerName?: string;
  joiningDate: string;
  joinedDate?: string;
  employmentType: 'full_time' | 'contract' | 'probation';
  status: 'active' | 'inactive' | 'suspended' | string;
  lastLogin?: string;
  username: string;
  password?: string;
  isFamilyMember?: boolean;
}

export interface Department {
  id: string; // e.g. DEPT-CRM
  code: string;
  name: string;
  departmentName?: string;
  managerId: string;
  managerName: string;
  description: string;
  status: 'active' | 'inactive' | string;
  employeeCount: number;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  departmentId?: string;
  permissions: {
    module: string;
    page: string;
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
    reject: boolean;
    assign: boolean;
    export: boolean;
    print: boolean;
  }[];
}

export interface Lead {
  id: string; // e.g. LEAD-2026-0001
  leadNo: string;
  companyName: string;
  industry: string;
  website?: string;
  gstin?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  contactPerson: string;
  designation: string;
  mobile: string;
  altMobile?: string;
  email: string;
  whatsapp?: string;
  productName: string;
  machineType: string;
  quantity: number;
  capacity?: string;
  application?: string;
  requirementDescription: string;
  expectedDelivery: string;
  budget: number;
  priority: PriorityLevel;
  source: LeadSource;
  assignedSalesPersonId: string;
  assignedSalesPersonName: string;
  status: LeadStatus;
  nextFollowUpDate?: string;
  remarks?: string;
  createdDate: string;
  convertedCustomerId?: string;
  convertedEnquiryId?: string;
  convertedOpportunityId?: string;
  attachments?: { name: string; size: string; date: string }[];
}

export interface Activity {
  id: string;
  entityType: 'lead' | 'customer' | 'opportunity' | 'quotation' | 'sales_order';
  entityId: string;
  title: string;
  description: string;
  performedBy: string;
  performedAt: string;
  type: 'note' | 'call' | 'whatsapp' | 'email' | 'meeting' | 'visit' | 'status_change' | 'document';
}

export interface FollowUp {
  id: string; // e.g. FLW-2026-0001
  followUpNo: string;
  leadOrCustomerId: string;
  leadOrCustomerName: string;
  entityType: 'lead' | 'customer' | 'opportunity';
  type: 'call' | 'whatsapp' | 'email' | 'meeting' | 'visit';
  assignedToId: string;
  assignedToName: string;
  date: string;
  time: string;
  priority: PriorityLevel;
  purpose: string;
  notes: string;
  nextFollowUpDate?: string;
  status: 'pending' | 'completed' | 'rescheduled' | 'cancelled';
  completedNotes?: string;
}

export interface SiteVisit {
  id: string; // e.g. VST-2026-0001
  visitNo: string;
  customerId: string;
  customerName: string;
  contactPerson: string;
  contactMobile: string;
  visitDate: string;
  location: string;
  employeeId: string;
  employeeName: string;
  purpose: string;
  discussionNotes: string;
  requirementDetails: string;
  outcome: 'positive' | 'follow_up_required' | 'quotation_required' | 'not_interested' | 'order_expected';
  nextAction: string;
  nextFollowUpDate?: string;
}

export interface Exhibition {
  id: string;
  expoName: string;
  organizer: string;
  location: string;
  startDate: string;
  endDate: string;
  stallNumber: string;
  contactPerson: string;
  budget: number;
  assignedTeam: string[];
  productsDisplayed: string;
  notes: string;
  totalContacts: number;
  qualifiedLeads: number;
  quotationsSent: number;
  convertedCustomers: number;
}

export interface Enquiry {
  id: string; // e.g. ENQ-2026-0001
  enquiryNo: string;
  leadId?: string;
  customerId: string;
  customerName: string;
  enquiryDate: string;
  requirement: string;
  machineProduct: string;
  quantity: number;
  specification: string;
  expectedDelivery: string;
  assignedPersonId: string;
  assignedPersonName: string;
  status: 'new' | 'under_review' | 'requirement_pending' | 'technical_review' | 'quotation_ready' | 'converted' | 'closed';
  quotationId?: string;
}

export interface Customer {
  id: string; // e.g. CUST-2026-0001
  customerCode: string;
  customerType: 'company' | 'individual';
  companyName: string;
  industry: string;
  gstin: string;
  pan: string;
  website?: string;
  contactPerson: string;
  designation: string;
  mobile: string;
  email: string;
  whatsapp?: string;
  billingAddress: string;
  shippingAddress: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  paymentTerms: string;
  creditLimit: number;
  currency: string;
  category: 'platinum' | 'gold' | 'silver' | 'standard';
  assignedSalesPerson: string;
  createdDate: string;
}

export interface Contact {
  id: string;
  customerId: string;
  customerName: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  mobile: string;
  whatsapp?: string;
  isPrimary: boolean;
}

export interface Opportunity {
  id: string; // e.g. OPP-2026-0001
  opportunityNo: string;
  leadId?: string;
  customerId: string;
  customerName: string;
  machineProduct: string;
  estimatedValue: number;
  expectedClosingDate: string;
  salesPersonId: string;
  salesPersonName: string;
  probability: number; // 0 to 100%
  stage: 'qualification' | 'requirement' | 'technical_discussion' | 'quotation' | 'negotiation' | 'customer_approval' | 'won' | 'lost';
  remarks?: string;
  quotationId?: string;
}

export interface QuotationItem {
  id: string;
  productName: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  discountPercent: number;
  taxPercent: number;
  amount: number;
}

export interface QuotationRevision {
  revisionNumber: string; // 'Rev-00', 'Rev-01', 'Rev-02'
  date: string;
  preparedBy: string;
  approvedBy?: string;
  items: QuotationItem[];
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  technicalSpecs: string;
  scopeOfSupply: string;
  exclusions: string;
  paymentTerms: string;
  deliveryTime: string;
  warranty: string;
  termsAndConditions: string;
  notes?: string;
  status: 'draft' | 'internal_review' | 'approved' | 'sent' | 'negotiation' | 'accepted' | 'rejected' | 'expired';
}

export interface Quotation {
  id: string; // e.g. QT-2026-0001
  quotationNumber: string;
  currentRevision: string; // e.g. 'Rev-01'
  date: string;
  validUntil: string;
  customerId: string;
  customerName: string;
  contactPerson: string;
  contactEmail: string;
  contactMobile: string;
  leadId?: string;
  enquiryId?: string;
  opportunityId?: string;
  revisions: QuotationRevision[];
  latestSummary: {
    grandTotal: number;
    status: QuotationRevision['status'];
    machineProduct: string;
  };
}

export interface CustomerPO {
  id: string; // e.g. CPO-2026-0001
  poNumber: string; // e.g. PO/ABC/2026/89
  poDate: string;
  customerId: string;
  customerName: string;
  quotationId: string;
  quotationNumber: string;
  salesOrderId?: string;
  poAmount: number;
  paymentTerms: string;
  deliveryDate: string;
  status: 'received' | 'verified' | 'sales_order_created' | 'converted_to_so' | 'cancelled' | string;
  attachmentUrl?: string;
  remarks?: string;
}

export interface SalesOrderItem {
  id: string;
  productName: string;
  specification: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface SalesOrder {
  id: string; // e.g. SO-2026-0001
  salesOrderNumber: string;
  customerId: string;
  customerName: string;
  customerPoId: string;
  customerPoNumber: string;
  quotationId: string;
  quotationNumber: string;
  orderDate: string;
  deliveryDate: string;
  items: SalesOrderItem[];
  orderValue: number;
  paymentTerms: string;
  assignedProjectManager: string;
  status: 'draft' | 'confirmed' | 'project_created' | 'in_production' | 'completed' | 'cancelled';
  projectId?: string;
  jobNumber?: string;
}

export type ProjectStatus =
  | 'draft'
  | 'planning'
  | 'design'
  | 'material_planning'
  | 'purchase'
  | 'production'
  | 'qc'
  | 'ready_for_dispatch'
  | 'dispatched'
  | 'installation'
  | 'completed'
  | 'on_hold'
  | 'cancelled';

export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'waiting' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ProjectTask {
  id: string; // e.g. TSK-2026-0001
  taskNumber: string;
  projectId: string;
  projectNumber: string;
  jobNumber: string;
  taskName: string;
  description: string;
  department: string;
  assignedTo: string;
  priority: TaskPriority;
  startDate: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  status: TaskStatus;
  completionPercent: number;
  dependentTaskId?: string;
  remarks?: string;
}

export interface PlanningStageAssignee {
  id: string;
  name: string;
  role?: string;
  department?: string;
}

export interface ProjectPlanningStage {
  id: string;
  stageNumber: number;
  stageName: string;
  projectId: string;
  jobNumber: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  responsibleDepartment: string;
  responsibleEmployee: string;
  assignedEmployeeIds?: string[];
  assignedEmployees?: PlanningStageAssignee[];
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progressPercent: number;
  remarks?: string;
  completedBy?: string;
  completedAt?: string;
  deliverables?: string;
}

export interface DepartmentAssignment {
  id: string;
  projectId: string;
  projectNumber: string;
  jobNumber: string;
  department: string;
  manager: string;
  assignedEmployee: string;
  responsibility: string;
  startDate: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  priority: TaskPriority;
  remarks?: string;
}

export interface ProjectMilestone {
  id: string;
  milestoneName: string;
  projectId: string;
  projectNumber: string;
  jobNumber: string;
  plannedDate: string;
  actualDate?: string;
  owner: string;
  status: 'pending' | 'achieved' | 'delayed';
  remarks?: string;
}

export type IssueType =
  | 'Design Issue'
  | 'Material Issue'
  | 'Purchase Delay'
  | 'Production Issue'
  | 'Quality Issue'
  | 'Customer Change'
  | 'Supplier Delay'
  | 'Machine Issue'
  | 'Documentation Issue'
  | 'Other';

export interface ProjectIssue {
  id: string;
  issueNo: string;
  projectId: string;
  projectNumber: string;
  jobNumber: string;
  department: string;
  issueType: IssueType;
  description: string;
  priority: TaskPriority;
  reportedBy: string;
  assignedTo: string;
  reportedDate: string;
  dueDate: string;
  resolution?: string;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
}

export type DelayReason =
  | 'Customer Approval'
  | 'Design Delay'
  | 'Material Delay'
  | 'Supplier Delay'
  | 'Production Delay'
  | 'Quality Issue'
  | 'Machine Breakdown'
  | 'Resource Issue'
  | 'Other';

export interface ProjectDelay {
  id: string;
  delayNo: string;
  projectId: string;
  projectNumber: string;
  jobNumber: string;
  delayReason: DelayReason;
  department: string;
  taskName: string;
  startDate: string;
  delayDays: number;
  responsiblePerson: string;
  impact: string;
  correctiveAction: string;
  status: 'open' | 'mitigated' | 'resolved';
  originalDeliveryDate: string;
  expectedDeliveryDate: string;
}

export interface CustomerChangeRequest {
  id: string;
  changeRequestNo: string;
  projectId: string;
  projectNumber: string;
  jobNumber: string;
  customerName: string;
  requestedBy: string;
  requestDate: string;
  changeDescription: string;
  reason: string;
  designImpact: string;
  materialImpact: string;
  costImpact: number;
  timelineImpactDays: number;
  approvalStatus: 'requested' | 'under_review' | 'approved' | 'rejected' | 'implemented';
  approvedBy?: string;
  approvedDate?: string;
}

export interface ProjectDocument {
  id: string;
  documentName: string;
  type: string;
  version: string;
  uploadedBy: string;
  uploadDate: string;
  department: string;
  relatedRecord: string;
  description: string;
  fileSize?: string;
  fileUrl?: string;
  projectId: string;
  jobNumber: string;
}

export type CostCategory =
  | 'Material'
  | 'Purchase'
  | 'Labour'
  | 'Production'
  | 'Machine'
  | 'Transport'
  | 'Installation'
  | 'Service'
  | 'Other';

export interface ProjectCostItem {
  id: string;
  projectId: string;
  jobNumber: string;
  category: CostCategory;
  description: string;
  estimatedCost: number;
  actualCost: number;
  difference: number;
  updatedBy: string;
  updatedAt: string;
}

export interface ProjectComment {
  id: string;
  projectId: string;
  jobNumber: string;
  authorName: string;
  authorRole: string;
  date: string;
  time: string;
  text: string;
  attachments?: string[];
  resolved: boolean;
  replies?: {
    id: string;
    authorName: string;
    date: string;
    text: string;
  }[];
}

export interface ProjectApproval {
  id: string;
  projectId: string;
  jobNumber: string;
  approvalType: 'Project Creation' | 'Project Plan' | 'Design Completion' | 'Major Change Request' | 'Project Completion';
  requestedBy: string;
  requestedDate: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned_for_correction';
  approvedBy?: string;
  approvalDate?: string;
  comments?: string;
}

export interface ProjectActivityLog {
  id: string;
  projectId: string;
  jobNumber: string;
  userName: string;
  userRole: string;
  date: string;
  time: string;
  action: string;
  details: string;
}

export interface ProjectJobMaster {
  id: string; // e.g. PRJ-2026-001
  projectId?: string;
  projectNumber: string;
  projectCode?: string;
  projectName?: string;
  jobId?: string;
  jobCode?: string;
  jobNumber: string; // e.g. JOB-2026-001
  salesOrderId: string;
  salesOrderNumber: string;
  customerPoNumber: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerContact?: string;
  contactEmail?: string;
  contactMobile?: string;
  productName: string;
  machineModel?: string;
  specification: string;
  capacity?: string;
  application?: string;
  scopeOfSupply?: string;
  quantity: number;
  unit: string;
  orderValue: number;
  totalOrderValue?: number;
  estimatedCost?: number;
  estimatedHours?: number;
  actualCost?: number;
  actualHours?: number;
  paymentTerms?: string;
  priority: TaskPriority;
  startDate: string;
  deliveryDate: string;
  expectedDeliveryDate?: string;
  projectManager: string;
  status: ProjectStatus;
  progressPercent: number;
  currentStage?: string;
  isPlanningSaved?: boolean;
  is_planning_saved?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
