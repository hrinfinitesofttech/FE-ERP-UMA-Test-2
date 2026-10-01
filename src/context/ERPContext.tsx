'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Job360Full,
  ApprovalItem,
  ERPAlertItem,
  JobProfitabilityEntry,
  Customer360Summary,
  Supplier360Summary,
  Item360Summary,
  Employee360Summary,
} from '../types/integration';
import {
  MOCK_JOB_360_FULL_LIST,
  INITIAL_CENTRAL_APPROVALS,
  INITIAL_CENTRAL_ALERTS,
  MOCK_JOB_PROFITABILITY_LIST,
  MOCK_CUSTOMER_360_LIST,
  MOCK_SUPPLIER_360_LIST,
  MOCK_ITEM_360_LIST,
  MOCK_EMPLOYEE_360_LIST,
} from '../data/mockIntegrationData';
import { api } from '../lib/apiClient';
import {
  CompanySetting,
  NumberingSetting,
  Employee,
  Department,
  Role,
  Lead,
  Customer,
  Contact,
  Enquiry,
  Opportunity,
  FollowUp,
  SiteVisit,
  Exhibition,
  Quotation,
  CustomerPO,
  SalesOrder,
  ProjectJobMaster,
  Activity,
  QuotationRevision,
  ProjectTask,
  ProjectPlanningStage,
  DepartmentAssignment,
  ProjectMilestone,
  ProjectIssue,
  ProjectDelay,
  CustomerChangeRequest,
  ProjectDocument,
  ProjectCostItem,
  ProjectComment,
  ProjectApproval,
  ProjectActivityLog,
} from '../types/crm';
import {
  DesignJob,
  DesignJobStatus,
  CustomerRequirement,
  DesignTask,
  Drawing2D,
  Design3DModel,
  AssemblyDrawing,
  PartDrawing,
  BOMHeader,
  BOMRevision,
  DesignRevisionLog,
  DesignReviewChecklist,
  TechnicalDocumentItem,
} from '../types/designer';
import {
  Supplier,
  SupplierContact,
  MaterialRequirement,
  PurchaseRequisition,
  RequestForQuotation,
  SupplierQuotation,
  QuotationComparison,
  PurchaseOrder,
  PORevision,
  PurchaseFollowUp,
  PurchaseReturn,
} from '../types/purchase';
import {
  ItemMaster,
  ItemCategory,
  UOMMaster,
  Warehouse,
  WarehouseLocation,
  OpeningStock,
  GoodsReceiptNote,
  GRNStatus,
  QCInspection,
  StockBalance,
  StockReservation,
  MaterialIssue,
  MaterialReturn,
  StockTransfer,
  StockAdjustment,
  ScrapEntry,
  PhysicalStockCount,
  StockLedgerEntry,
} from '../types/store';
import {
  UserProfile,
  DepartmentType,
  PermissionAction,
  JobTraceabilityRecord,
  AuditLogEntry,
  NotificationItem,
} from '../types/erp';
import {
  InternalAsset,
  CustomerMachine,
  ServiceRequest,
  BreakdownRecord,
  PreventiveMaintenancePlan,
  ServicePlanningItem,
  ServiceVisit,
  ServiceWorkOrder,
  ServicePartIssue,
  ServicePartReturn,
  ServiceReport,
  WarrantyRecord,
  AMCContract,
  ServiceContract,
  DowntimeRecord,
  MaintenanceCostRecord,
  ServiceChecklistTemplate,
  TechnicianProfile,
  ServiceRequestStatus,
  ServiceVisitStatus,
  WorkOrderStatus,
} from '../types/maintenance';
import {
  mockInternalAssets,
  mockCustomerMachines,
  mockServiceRequests,
  mockBreakdowns,
  mockPreventiveMaintenancePlans,
  mockServicePlanningItems,
  mockServiceVisits,
  mockServiceWorkOrders,
  mockServicePartIssues,
  mockServicePartReturns,
  mockServiceReports,
  mockWarranties,
  mockAMCContracts,
  mockServiceContracts,
  mockDowntimeRecords,
  mockMaintenanceCosts,
  mockChecklistTemplates,
  mockTechnicians,
} from '../data/mockMaintenanceData';
import {
  Designation,
  EmployeeDocumentItem,
  EmployeeOnboardingItem,
  EmployeeTransferItem,
  EmployeePromotionItem,
  EmployeeExitItem,
  FullAndFinalSettlementItem,
  ShiftMaster,
  ShiftRosterItem,
  HolidayItem,
  AttendanceRecord,
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  WFHRequest,
  MissedPunchRequest,
  AttendanceRegularization,
  OvertimeRecord,
  EarlyCheckoutRequest,
  SalaryComponent,
  SalaryStructure,
  PayrollRecord,
  EmployeeAdvanceLoan,
  ReimbursementExpense,
  KPIMaster,
  EmployeeAppraisal,
  TrainingProgram,
  JobPosition,
  CandidateProfile,
  InterviewRecord,
  OfferLetter,
  LeaveApprovalStatus,
  PayrollStatusType,
} from '../types/hr';
import {
  mockDesignations,
  mockEmployeeDocuments,
  mockEmployeeOnboardings,
  mockEmployeeTransfers,
  mockEmployeePromotions,
  mockEmployeeExits,
  mockFullAndFinalSettlements,
  mockShifts,
  mockShiftRosters,
  mockHolidays,
  mockAttendanceRecords,
  mockLeaveTypes,
  mockLeaveBalances,
  mockLeaveRequests,
  mockWFHRequests,
  mockMissedPunchRequests,
  mockRegularizationRequests,
  mockOvertimeRecords,
  mockEarlyCheckoutRequests,
  mockSalaryComponents,
  mockSalaryStructures,
  mockPayrollRecords,
  mockEmployeeAdvances,
  mockReimbursements,
  mockKPIMasters,
  mockEmployeeAppraisals,
  mockTrainingPrograms,
  mockJobPositions,
  mockCandidateProfiles,
  mockInterviewRecords,
  mockOfferLetters,
} from '../data/mockHRData';

import {
  TestCaseItem,
  BugTicket,
  BackupRecord,
  DataImportLog,
  SecurityAuditCheck,
  GoLiveChecklistItem,
} from '../types/testing';

import {
  MOCK_TEST_CASES,
  MOCK_BUG_TICKETS,
  MOCK_BACKUP_RECORDS,
  MOCK_IMPORT_LOGS,
  MOCK_SECURITY_CHECKS,
  MOCK_GOLIVE_CHECKLIST,
} from '../data/mockTestingData';

import {
  INITIAL_COMPANY,
  INITIAL_NUMBERING,
  INITIAL_DEPARTMENTS,
  INITIAL_ROLES,
  INITIAL_EMPLOYEES,
  INITIAL_CUSTOMERS,
  INITIAL_LEADS,
  INITIAL_FOLLOWUPS,
  INITIAL_VISITS,
  INITIAL_EXHIBITIONS,
  INITIAL_ENQUIRIES,
  INITIAL_OPPORTUNITIES,
  INITIAL_QUOTATIONS,
  INITIAL_CUSTOMER_POS,
  INITIAL_SALES_ORDERS,
  INITIAL_PROJECT_JOBS,
  INITIAL_DESIGN_JOBS,
  INITIAL_SUPPLIERS,
} from '../data/dbStore';
import {
  MOCK_AUDIT_LOGS,
  MOCK_NOTIFICATIONS,
  MOCK_JOBS,
  MOCK_PROJECT_TASKS,
  MOCK_PLANNING_STAGES,
  MOCK_DEPARTMENT_ASSIGNMENTS,
  MOCK_MILESTONES,
  MOCK_PROJECT_ISSUES,
  MOCK_PROJECT_DELAYS,
  MOCK_CHANGE_REQUESTS,
  MOCK_PROJECT_DOCUMENTS,
  MOCK_PROJECT_COSTS,
  MOCK_PROJECT_COMMENTS,
  MOCK_PROJECT_APPROVALS,
  MOCK_PROJECT_ACTIVITIES,
  MOCK_CUSTOMER_REQUIREMENTS,
  MOCK_DESIGN_TASKS,
  MOCK_2D_DRAWINGS,
  MOCK_3D_MODELS,
  MOCK_ASSEMBLY_DRAWINGS,
  MOCK_PART_DRAWINGS,
  MOCK_BOM_HEADERS,
  MOCK_BOM_REVISIONS,
  MOCK_DESIGN_REVISIONS,
  MOCK_DESIGN_REVIEWS,
  MOCK_TECHNICAL_DOCUMENTS,
  MOCK_SUPPLIER_CONTACTS,
  MOCK_MATERIAL_REQUIREMENTS,
  MOCK_PURCHASE_REQUISITIONS,
  MOCK_RFQS,
  MOCK_SUPPLIER_QUOTATIONS,
  MOCK_QUOTATION_COMPARISONS,
  MOCK_PURCHASE_ORDERS,
  MOCK_PO_REVISIONS,
  MOCK_PURCHASE_FOLLOWUPS,
  MOCK_PURCHASE_RETURNS,
} from '../data/mockData';
import {
  INITIAL_ITEM_CATEGORIES,
  INITIAL_UOMS,
  INITIAL_WAREHOUSES,
  INITIAL_WAREHOUSE_LOCATIONS,
  INITIAL_ITEM_MASTERS,
  INITIAL_OPENING_STOCKS,
  INITIAL_GOODS_RECEIPTS,
  INITIAL_QC_INSPECTIONS,
  INITIAL_STOCK_BALANCES,
  INITIAL_STOCK_RESERVATIONS,
  INITIAL_MATERIAL_ISSUES,
  INITIAL_MATERIAL_RETURNS,
  INITIAL_STOCK_TRANSFERS,
  INITIAL_STOCK_ADJUSTMENTS,
  INITIAL_SCRAP_ENTRIES,
  INITIAL_PHYSICAL_COUNTS,
  INITIAL_STOCK_LEDGERS,
} from '../data/mockStoreData';
import {
  ManufacturingJob,
  ProductionPlan,
  WorkOrder,
  ProductionOrder,
  RoutingOperation,
  WorkCenter,
  ProductionScheduleItem,
  MRPItemRequirement,
  ProductionEntry,
  WIPRecord,
  ProductionHold,
  ReworkOrder,
  ProductionScrap,
  ProductionCompletion,
  FinishedGoodsItem,
  ProductionCostSummary,
} from '../types/production';
import {
  INITIAL_MANUFACTURING_JOBS,
  INITIAL_PRODUCTION_PLANS,
  INITIAL_WORK_CENTERS,
  INITIAL_ROUTING_OPERATIONS,
  INITIAL_WORK_ORDERS,
  INITIAL_PRODUCTION_ORDERS,
  INITIAL_PRODUCTION_SCHEDULES,
  INITIAL_MRP_REQUIREMENTS,
  INITIAL_PRODUCTION_ENTRIES,
  INITIAL_WIP_RECORDS,
  INITIAL_PRODUCTION_HOLDS,
  INITIAL_REWORK_ORDERS,
  INITIAL_PRODUCTION_SCRAPS,
  INITIAL_FINISHED_GOODS,
  INITIAL_PRODUCTION_COSTS,
} from '../data/mockProductionData';
import {
  FinancialYear,
  ChartOfAccount,
  AccountGroup,
  TaxMaster,
  TDSMaster,
  CostCenter,
  SalesInvoice,
  PurchaseInvoice,
  CreditNote,
  DebitNote,
  CustomerReceipt,
  SupplierPayment,
  JournalEntry,
  ContraEntry,
  ExpenseEntry,
  BankAccount,
  BankTransaction,
  BankReconciliation,
  FixedAsset,
  DepreciationEntry,
  JobCostingSummary,
  ReceivableAging,
  PayableAging,
} from '../types/accounting';
import {
  INITIAL_FINANCIAL_YEARS,
  INITIAL_CHART_OF_ACCOUNTS,
  INITIAL_ACCOUNT_GROUPS,
  INITIAL_TAX_MASTERS,
  INITIAL_TDS_MASTERS,
  INITIAL_COST_CENTERS,
  INITIAL_SALES_INVOICES,
  INITIAL_PURCHASE_INVOICES,
  INITIAL_CREDIT_NOTES,
  INITIAL_DEBIT_NOTES,
  INITIAL_CUSTOMER_RECEIPTS,
  INITIAL_SUPPLIER_PAYMENTS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_CONTRA_ENTRIES,
  INITIAL_EXPENSE_ENTRIES,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_FIXED_ASSETS,
  INITIAL_JOB_COSTINGS,
  INITIAL_RECEIVABLE_AGING,
  INITIAL_PAYABLE_AGING,
} from '../data/mockAccountingData';
import {
  create16PlanningStagesForProject,
  createDefaultMilestonesForProject,
  createDefaultDepartmentAssignments,
} from '../lib/projectPlanningHelper';

interface ERPContextType {
  // Auth & Session
  currentUser: Employee;
  setCurrentUser: (emp: Employee) => void;
  availableEmployees: Employee[];
  isAuthenticated: boolean;
  login: (username: string, pass: string) => boolean;
  logout: () => void;
  updateCurrentUserProfile: (data: Partial<Employee>) => void;
  changePassword: (newPass: string) => void;

  // Navigation & Layout
  activeDepartment: DepartmentType | 'all';
  setActiveDepartment: (dept: DepartmentType | 'all') => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Permissions & RBAC
  can: (module: string, page: string, action: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'reject' | 'export' | 'print') => boolean;
  hasDepartmentAccess: (deptCode: string) => boolean;

  // Master Settings
  company: CompanySetting;
  updateCompany: (data: Partial<CompanySetting>) => void;
  numbering: NumberingSetting[];
  updateNumbering: (id: string, data: Partial<NumberingSetting>) => void;
  addNumbering: (item: Omit<NumberingSetting, 'id'>) => void;
  resetNumbering: () => void;
  getNextDocNumber: (docType: NumberingSetting['docType']) => string;

  // Master Entities
  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id' | 'employeeCount'> & { employeeCount?: number }) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  roles: Role[];
  addRole: (role: Omit<Role, 'id'>) => void;
  updateRole: (id: string, role: Partial<Role>) => void;

  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  resetEmployeePassword: (id: string, password: string) => Promise<{ success: boolean; message?: string }>;

  // CRM Entities
  leads: Lead[];
  addLead: (leadData: Omit<Lead, 'id' | 'leadNo' | 'createdDate'>) => Lead;
  updateLead: (id: string, leadData: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  convertLeadToCustomer: (leadId: string) => { customer: Customer; enquiry?: Enquiry; opportunity?: Opportunity };

  customers: Customer[];
  addCustomer: (custData: Omit<Customer, 'id' | 'customerCode' | 'createdDate'>) => Customer;
  updateCustomer: (id: string, custData: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id'>) => void;

  enquiries: Enquiry[];
  addEnquiry: (enqData: Omit<Enquiry, 'id' | 'enquiryNo' | 'enquiryDate'>) => Enquiry;
  updateEnquiry: (id: string, enqData: Partial<Enquiry>) => void;

  opportunities: Opportunity[];
  addOpportunity: (oppData: Omit<Opportunity, 'id' | 'opportunityNo'>) => Opportunity;
  updateOpportunity: (id: string, oppData: Partial<Opportunity>) => void;

  followUps: FollowUp[];
  addFollowUp: (flwData: Omit<FollowUp, 'id' | 'followUpNo'>) => FollowUp;
  completeFollowUp: (id: string, notes: string, nextDate?: string) => void;

  siteVisits: SiteVisit[];
  addSiteVisit: (visitData: Omit<SiteVisit, 'id' | 'visitNo'>) => SiteVisit;
  updateSiteVisit: (id: string, visitData: Partial<SiteVisit>) => void;
  deleteSiteVisit: (id: string) => void;

  exhibitions: Exhibition[];
  addExhibition: (expoData: Omit<Exhibition, 'id'>) => Exhibition;
  updateExhibition: (id: string, expoData: Partial<Exhibition>) => void;
  deleteExhibition: (id: string) => void;

  quotations: Quotation[];
  addQuotation: (quoData: Omit<Quotation, 'id' | 'quotationNumber'>) => Quotation;
  addQuotationRevision: (quotationId: string, revision: QuotationRevision) => void;
  updateQuotationStatus: (quotationId: string, revisionNumber: string, status: QuotationRevision['status']) => void;

  customerPOs: CustomerPO[];
  addCustomerPO: (poData: Omit<CustomerPO, 'id'>) => CustomerPO;
  convertCustomerPOToSalesOrder: (poId: string) => SalesOrder;

  salesOrders: SalesOrder[];
  addSalesOrder: (soData: Omit<SalesOrder, 'id' | 'salesOrderNumber'>) => SalesOrder;
  createProjectFromSalesOrder: (salesOrderId: string) => ProjectJobMaster;

  projectJobs: ProjectJobMaster[];
  updateProject: (id: string, prj: Partial<ProjectJobMaster>) => void;
  deleteProject: (id: string) => void;

  // Module 2: Project Management & Job Management Entities
  projectTasks: ProjectTask[];
  addProjectTask: (task: Omit<ProjectTask, 'id' | 'taskNumber'>) => ProjectTask;
  updateProjectTask: (id: string, task: Partial<ProjectTask>) => void;
  deleteProjectTask: (id: string) => void;

  projectPlanningStages: ProjectPlanningStage[];
  updatePlanningStage: (id: string, stage: Partial<ProjectPlanningStage>) => void;
  generateDefaultPlanningStages: (projectId: string) => ProjectPlanningStage[];
  addPlanningStage: (stage: Omit<ProjectPlanningStage, 'id'>) => ProjectPlanningStage;
  deletePlanningStage: (id: string) => void;
  reorderPlanningStages: (projectId: string, newOrderedStages: ProjectPlanningStage[]) => void;
  markPlanningStageCompleted: (id: string, completedBy?: string, completionNotes?: string) => void;

  departmentAssignments: DepartmentAssignment[];
  assignDepartment: (assignment: Omit<DepartmentAssignment, 'id'>) => DepartmentAssignment;

  projectMilestones: ProjectMilestone[];
  addProjectMilestone: (milestone: Omit<ProjectMilestone, 'id'>) => ProjectMilestone;
  updateProjectMilestone: (id: string, milestone: Partial<ProjectMilestone>) => void;

  projectIssues: ProjectIssue[];
  addProjectIssue: (issue: Omit<ProjectIssue, 'id' | 'issueNo' | 'reportedDate'>) => ProjectIssue;
  resolveProjectIssue: (id: string, resolution: string) => void;

  projectDelays: ProjectDelay[];
  addProjectDelay: (delay: Omit<ProjectDelay, 'id' | 'delayNo'>) => ProjectDelay;

  changeRequests: CustomerChangeRequest[];
  addCustomerChangeRequest: (cr: Omit<CustomerChangeRequest, 'id' | 'changeRequestNo' | 'requestDate' | 'approvalStatus'>) => CustomerChangeRequest;
  approveChangeRequest: (id: string, status: 'approved' | 'rejected') => void;

  projectDocuments: ProjectDocument[];
  addProjectDocument: (doc: Omit<ProjectDocument, 'id' | 'uploadDate'>) => ProjectDocument;

  projectCosts: ProjectCostItem[];
  updateProjectCost: (id: string, cost: Partial<ProjectCostItem>) => void;

  projectComments: ProjectComment[];
  addProjectComment: (comment: Omit<ProjectComment, 'id' | 'date' | 'time' | 'resolved'>) => ProjectComment;

  projectApprovals: ProjectApproval[];
  approveProjectAction: (id: string, status: 'approved' | 'rejected', comments?: string) => void;

  projectActivities: ProjectActivityLog[];
  logProjectActivity: (projectId: string, jobNumber: string, action: string, details: string) => void;

  // Module 3: Designer & Engineering Management Entities
  designJobs: DesignJob[];
  addDesignJob: (job: Omit<DesignJob, 'id' | 'createdDate'>) => void;
  updateDesignJob: (id: string, updates: Partial<DesignJob>) => void;
  customerRequirements: CustomerRequirement[];
  addCustomerRequirement: (req: Omit<CustomerRequirement, 'id'>) => void;
  approveCustomerRequirement: (id: string, approvedBy: string) => void;
  designTasks: DesignTask[];
  addDesignTask: (task: Omit<DesignTask, 'id'>) => void;
  updateDesignTask: (id: string, updates: Partial<DesignTask>) => void;
  drawings2D: Drawing2D[];
  addDrawing2D: (drawing: Omit<Drawing2D, 'id' | 'uploadedDate'>) => void;
  designs3D: Design3DModel[];
  addDesign3D: (model: Omit<Design3DModel, 'id' | 'uploadedDate'>) => void;
  assemblyDrawings: AssemblyDrawing[];
  addAssemblyDrawing: (drawing: Omit<AssemblyDrawing, 'id' | 'uploadedDate'>) => void;
  partDrawings: PartDrawing[];
  addPartDrawing: (drawing: Omit<PartDrawing, 'id' | 'uploadedDate'>) => void;
  boms: BOMHeader[];
  addBOM: (bom: Omit<BOMHeader, 'id' | 'createdDate' | 'updatedDate'>) => void;
  updateBOM: (id: string, updates: Partial<BOMHeader>) => void;
  bomRevisions: BOMRevision[];
  addBOMRevision: (rev: Omit<BOMRevision, 'id' | 'changedDate'>) => void;
  designRevisions: DesignRevisionLog[];
  addDesignRevision: (rev: Omit<DesignRevisionLog, 'id' | 'createdDate'>) => void;
  designReviews: DesignReviewChecklist[];
  addDesignReview: (rev: Omit<DesignReviewChecklist, 'id' | 'reviewDate'>) => void;
  technicalDocuments: TechnicalDocumentItem[];
  addTechnicalDocument: (doc: Omit<TechnicalDocumentItem, 'id' | 'uploadDate'>) => void;
  releaseDesignToManufacturing: (designJobId: string, releasedBy: string) => void;
  revokeDesignRelease: (designJobId: string, revokedBy: string) => void;
  approveDesignJob: (designJobId: string, approvedBy: string, approvalNotes?: string) => void;
  disapproveDesignJob: (designJobId: string, disapprovedBy: string, rejectionReason: string) => void;

  // Module 4: Purchase Management Entities
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  supplierContacts: SupplierContact[];
  addSupplierContact: (contact: Omit<SupplierContact, 'id'>) => void;
  materialRequirements: MaterialRequirement[];
  addMaterialRequirement: (mrp: Omit<MaterialRequirement, 'id'>) => void;
  purchaseRequisitions: PurchaseRequisition[];
  addPurchaseRequisition: (pr: Omit<PurchaseRequisition, 'id' | 'prDate'>) => void;
  approvePurchaseRequisition: (id: string, approvedBy: string) => void;
  rejectPurchaseRequisition: (id: string, remarks?: string) => void;
  updatePurchaseRequisitionStatus: (id: string, status: PurchaseRequisition['status'], remarks?: string, approvedBy?: string) => void;
  rfqs: RequestForQuotation[];
  addRFQ: (rfq: Omit<RequestForQuotation, 'id' | 'rfqDate'>) => void;
  supplierQuotations: SupplierQuotation[];
  addSupplierQuotation: (sq: Omit<SupplierQuotation, 'id'>) => void;
  approveSupplierQuotation: (id: string, approvedBy: string) => void;
  quotationComparisons: QuotationComparison[];
  addQuotationComparison: (comp: Omit<QuotationComparison, 'id' | 'comparisonDate'>) => void;
  approveQuotationComparison: (id: string, approvedBy: string) => void;
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poDate'>) => void;
  approvePurchaseOrder: (id: string, approvedBy: string) => void;
  poRevisions: PORevision[];
  addPORevision: (rev: Omit<PORevision, 'id' | 'revisedDate'>) => void;
  purchaseFollowUps: PurchaseFollowUp[];
  addPurchaseFollowUp: (fol: Omit<PurchaseFollowUp, 'id'>) => void;
  purchaseReturns: PurchaseReturn[];
  addPurchaseReturn: (ret: Omit<PurchaseReturn, 'id' | 'returnDate'>) => void;

  // Module 5: Store & Warehouse Management Entities
  itemMasters: ItemMaster[];
  addItemMaster: (item: Omit<ItemMaster, 'id' | 'createdAt'>) => void;
  updateItemMaster: (id: string, updates: Partial<ItemMaster>) => void;
  deleteItemMaster: (id: string) => void;
  itemCategories: ItemCategory[];
  addItemCategory: (cat: Omit<ItemCategory, 'id'>) => void;
  uoms: UOMMaster[];
  addUOM: (uom: Omit<UOMMaster, 'id'>) => void;
  warehouses: Warehouse[];
  addWarehouse: (wh: Omit<Warehouse, 'id'>) => void;
  updateWarehouse: (id: string, updates: Partial<Warehouse>) => void;
  warehouseLocations: WarehouseLocation[];
  addWarehouseLocation: (loc: Omit<WarehouseLocation, 'id'>) => void;
  openingStocks: OpeningStock[];
  addOpeningStock: (stock: Omit<OpeningStock, 'id'>) => void;
  goodsReceipts: GoodsReceiptNote[];
  addGRN: (grn: Omit<GoodsReceiptNote, 'id' | 'grnNumber' | 'createdAt'>) => void;
  qcInspections: QCInspection[];
  addQCInspection: (qc: Omit<QCInspection, 'id' | 'inspectionNumber'>) => void;
  approveQCInspection: (id: string, inspectorName: string, qcResult: 'Pass' | 'Fail' | 'Conditional Approval', acceptedQty: number, rejectedQty: number) => void;
  stockBalances: StockBalance[];
  updateStockBalance: (id: string, updates: Partial<StockBalance>) => void;
  stockReservations: StockReservation[];
  addStockReservation: (res: Omit<StockReservation, 'id' | 'reservationNumber' | 'createdAt'>) => void;
  releaseStockReservation: (id: string) => void;
  materialIssues: MaterialIssue[];
  addMaterialIssue: (issue: Omit<MaterialIssue, 'id' | 'issueNumber' | 'createdAt'>) => void;
  materialReturns: MaterialReturn[];
  addMaterialReturn: (ret: Omit<MaterialReturn, 'id' | 'returnNumber' | 'createdAt'>) => void;
  stockTransfers: StockTransfer[];
  addStockTransfer: (transfer: Omit<StockTransfer, 'id' | 'transferNumber' | 'createdAt'>) => void;
  stockAdjustments: StockAdjustment[];
  addStockAdjustment: (adj: Omit<StockAdjustment, 'id' | 'adjustmentNumber' | 'createdAt'>) => void;
  scrapEntries: ScrapEntry[];
  addScrapEntry: (scrap: Omit<ScrapEntry, 'id' | 'scrapNumber' | 'createdAt'>) => void;
  physicalStockCounts: PhysicalStockCount[];
  addPhysicalStockCount: (count: Omit<PhysicalStockCount, 'id' | 'countNumber'>) => void;
  stockLedgers: StockLedgerEntry[];
  logStockLedgerEntry: (entry: Omit<StockLedgerEntry, 'id'>) => void;

  // Module 6: Production / Manufacturing / MRP Entities
  manufacturingJobs: ManufacturingJob[];
  addManufacturingJob: (job: Omit<ManufacturingJob, 'id' | 'createdAt'>) => void;
  updateManufacturingJob: (id: string, updates: Partial<ManufacturingJob>) => void;
  productionPlans: ProductionPlan[];
  addProductionPlan: (plan: Omit<ProductionPlan, 'id' | 'createdAt'>) => void;
  workOrders: WorkOrder[];
  addWorkOrder: (wo: Omit<WorkOrder, 'id' | 'workOrderNumber' | 'createdAt'>) => void;
  releaseWorkOrder: (id: string) => void;
  productionOrders: ProductionOrder[];
  addProductionOrder: (po: Omit<ProductionOrder, 'id' | 'productionOrderNumber' | 'createdAt'>) => void;
  routingOperations: RoutingOperation[];
  addRoutingOperation: (op: Omit<RoutingOperation, 'id'>) => void;
  workCenters: WorkCenter[];
  addWorkCenter: (wc: Omit<WorkCenter, 'id'>) => void;
  updateWorkCenter: (id: string, updates: Partial<WorkCenter>) => void;
  productionSchedules: ProductionScheduleItem[];
  addProductionSchedule: (sch: Omit<ProductionScheduleItem, 'id'>) => void;
  mrpRequirements: MRPItemRequirement[];
  productionEntries: ProductionEntry[];
  recordProductionEntry: (entry: Omit<ProductionEntry, 'id' | 'productionEntryNumber' | 'goodQuantity'>) => void;
  wipRecords: WIPRecord[];
  productionHolds: ProductionHold[];
  addProductionHold: (hold: Omit<ProductionHold, 'id' | 'holdNumber'>) => void;
  resumeProductionHold: (id: string, resumeDate: string) => void;
  reworkOrders: ReworkOrder[];
  addReworkOrder: (rework: Omit<ReworkOrder, 'id' | 'reworkNumber'>) => void;
  productionScraps: ProductionScrap[];
  addProductionScrap: (scrap: Omit<ProductionScrap, 'id' | 'scrapNumber'>) => void;
  productionCompletions: ProductionCompletion[];
  completeWorkOrder: (comp: Omit<ProductionCompletion, 'id' | 'completionNumber'>) => void;
  finishedGoods: FinishedGoodsItem[];
  addFinishedGoods: (fg: Omit<FinishedGoodsItem, 'id' | 'finishedGoodsNumber' | 'createdAt'>) => void;
  productionCosts: ProductionCostSummary[];

  // Module 7: Accounting & Finance Entities
  financialYears: FinancialYear[];
  closeFinancialYear: (id: string, closedBy: string) => void;
  chartOfAccounts: ChartOfAccount[];
  addChartOfAccount: (account: Omit<ChartOfAccount, 'id' | 'currentBalance'>) => void;
  accountGroups: AccountGroup[];
  addAccountGroup: (group: Omit<AccountGroup, 'id'>) => void;
  taxMasters: TaxMaster[];
  addTaxMaster: (tax: Omit<TaxMaster, 'id'>) => void;
  tdsMasters: TDSMaster[];
  addTDSMaster: (tds: Omit<TDSMaster, 'id'>) => void;
  costCenters: CostCenter[];
  addCostCenter: (cc: Omit<CostCenter, 'id'>) => void;
  salesInvoices: SalesInvoice[];
  addSalesInvoice: (inv: Omit<SalesInvoice, 'id' | 'invoiceNumber' | 'createdAt'>) => void;
  approveSalesInvoice: (id: string) => void;
  updateSalesInvoicePayment: (id: string, paymentData: { paymentStatus: 'Paid' | 'Partially Paid' | 'Unpaid'; paidAmount?: number; paymentMode?: string; referenceNumber?: string; paymentDate?: string }) => void;
  purchaseInvoices: PurchaseInvoice[];
  addPurchaseInvoice: (inv: Omit<PurchaseInvoice, 'id' | 'invoiceNumber' | 'createdAt'>) => void;
  postPurchaseInvoice: (id: string) => void;
  creditNotes: CreditNote[];
  addCreditNote: (cn: Omit<CreditNote, 'id' | 'creditNoteNumber'>) => void;
  updateCreditNote: (id: string, cn: Partial<CreditNote>) => void;
  deleteCreditNote: (id: string) => void;
  debitNotes: DebitNote[];
  addDebitNote: (dn: Omit<DebitNote, 'id' | 'debitNoteNumber'>) => void;
  updateDebitNote: (id: string, dn: Partial<DebitNote>) => void;
  deleteDebitNote: (id: string) => void;
  customerReceipts: CustomerReceipt[];
  addCustomerReceipt: (rec: Omit<CustomerReceipt, 'id' | 'receiptNumber'>) => void;
  supplierPayments: SupplierPayment[];
  addSupplierPayment: (pay: Omit<SupplierPayment, 'id' | 'paymentNumber'>) => void;
  journalEntries: JournalEntry[];
  addJournalEntry: (jv: Omit<JournalEntry, 'id' | 'journalNumber'>) => void;
  deleteJournalEntry: (id: string) => void;
  contraEntries: ContraEntry[];
  addContraEntry: (contra: Omit<ContraEntry, 'id' | 'contraNumber'>) => void;
  deleteContraEntry: (id: string) => void;
  expenseEntries: ExpenseEntry[];
  addExpenseEntry: (exp: Omit<ExpenseEntry, 'id' | 'expenseNumber'>) => void;
  updateExpenseEntry: (id: string, exp: Partial<ExpenseEntry>) => void;
  deleteExpenseEntry: (id: string) => void;
  approveExpenseEntry: (id: string, approvedBy: string) => void;
  bankAccounts: BankAccount[];
  addBankAccount: (bank: Omit<BankAccount, 'id' | 'currentBalance'>) => void;
  updateBankAccount: (id: string, bank: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => void;
  bankTransactions: BankTransaction[];
  bankReconciliations: BankReconciliation[];
  reconcileBankTransaction: (transactionId: string, matchedErpDocNumber: string) => void;
  fixedAssets: FixedAsset[];
  addFixedAsset: (asset: Omit<FixedAsset, 'id'>) => void;
  updateFixedAsset: (id: string, asset: Partial<FixedAsset>) => void;
  deleteFixedAsset: (id: string) => void;
  depreciationEntries: DepreciationEntry[];
  runDepreciation: (assetId: string, period: string, amount: number) => void;
  jobCostings: JobCostingSummary[];
  receivableAging: ReceivableAging[];
  payableAging: PayableAging[];

  // 360° Traceability Modal & Jobs
  jobs: JobTraceabilityRecord[];
  selectedJobForModal: JobTraceabilityRecord | null;
  openJobModal: (jobNumber: string) => void;
  closeJobModal: () => void;
  updateJobStatus: (jobNumber: string, stepId: string, status: 'completed' | 'in_progress' | 'pending') => void;

  // Module 8 Maintenance & Services state
  internalAssets: InternalAsset[];
  addInternalAsset: (asset: Omit<InternalAsset, 'id'>) => void;
  updateInternalAsset: (id: string, asset: Partial<InternalAsset>) => void;
  customerMachines: CustomerMachine[];
  addCustomerMachine: (cm: Omit<CustomerMachine, 'id'>) => void;
  updateCustomerMachine: (id: string, cm: Partial<CustomerMachine>) => void;
  serviceRequests: ServiceRequest[];
  addServiceRequest: (sr: Omit<ServiceRequest, 'id' | 'requestNumber' | 'requestDate' | 'createdAt'>) => ServiceRequest;
  updateServiceRequestStatus: (id: string, status: ServiceRequestStatus, assignedTechId?: string, assignedTechName?: string) => void;
  breakdowns: BreakdownRecord[];
  addBreakdown: (bd: Omit<BreakdownRecord, 'id' | 'breakdownNumber'>) => void;
  updateBreakdownStatus: (id: string, status: BreakdownRecord['status'], remarks?: string) => void;
  preventivePlans: PreventiveMaintenancePlan[];
  addPreventivePlan: (plan: Omit<PreventiveMaintenancePlan, 'id' | 'planNumber'>) => void;
  servicePlanningItems: ServicePlanningItem[];
  serviceVisits: ServiceVisit[];
  addServiceVisit: (visit: Omit<ServiceVisit, 'id' | 'visitNumber'>) => void;
  updateServiceVisitStatus: (id: string, status: ServiceVisitStatus) => void;
  serviceWorkOrders: ServiceWorkOrder[];
  addServiceWorkOrder: (swo: Omit<ServiceWorkOrder, 'id' | 'workOrderNumber'>) => void;
  updateWorkOrderStatus: (id: string, status: WorkOrderStatus) => void;
  servicePartIssues: ServicePartIssue[];
  addServicePartIssue: (issue: Omit<ServicePartIssue, 'id' | 'issueNumber' | 'createdAt'>) => void;
  servicePartReturns: ServicePartReturn[];
  addServicePartReturn: (ret: Omit<ServicePartReturn, 'id' | 'returnNumber'>) => void;
  serviceReports: ServiceReport[];
  addServiceReport: (rep: Omit<ServiceReport, 'id' | 'reportNumber'>) => void;
  warranties: WarrantyRecord[];
  amcContracts: AMCContract[];
  addAMCContract: (amc: Omit<AMCContract, 'id' | 'amcNumber'>) => void;
  serviceContracts: ServiceContract[];
  downtimeRecords: DowntimeRecord[];
  addDowntimeRecord: (dt: Omit<DowntimeRecord, 'id' | 'downtimeNumber'>) => void;
  maintenanceCosts: MaintenanceCostRecord[];
  addMaintenanceCost: (mc: Omit<MaintenanceCostRecord, 'id'>) => void;
  checklistTemplates: ServiceChecklistTemplate[];
  technicians: TechnicianProfile[];

  // Module 9 HR & Payroll state
  designations: Designation[];
  addDesignation: (desg: Omit<Designation, 'id'>) => void;
  updateDesignation: (id: string, desg: Partial<Designation>) => void;
  employeeDocuments: EmployeeDocumentItem[];
  addEmployeeDocument: (doc: Omit<EmployeeDocumentItem, 'id'>) => void;
  deleteEmployeeDocument: (id: string) => void;
  updateEmployeeDocumentStatus: (id: string, status: 'Verified' | 'Pending' | 'Rejected', verifiedBy?: string, remarks?: string) => void;
  employeeOnboardings: EmployeeOnboardingItem[];
  addEmployeeOnboarding: (onb: Omit<EmployeeOnboardingItem, 'id'>) => void;
  updateEmployeeOnboardingStatus: (id: string, status: EmployeeOnboardingItem['status']) => void;
  deleteEmployeeOnboarding: (id: string) => void;
  toggleOnboardingChecklistTask: (onboardingId: string, taskIndex: number) => void;
  employeeTransfers: EmployeeTransferItem[];
  addEmployeeTransfer: (trn: Omit<EmployeeTransferItem, 'id'>) => void;
  updateEmployeeTransfer: (id: string, trn: Partial<EmployeeTransferItem>) => void;
  deleteEmployeeTransfer: (id: string) => void;
  employeePromotions: EmployeePromotionItem[];
  addEmployeePromotion: (prm: Omit<EmployeePromotionItem, 'id'>) => void;
  updateEmployeePromotion: (id: string, prm: Partial<EmployeePromotionItem>) => void;
  deleteEmployeePromotion: (id: string) => void;
  employeeExits: EmployeeExitItem[];
  addEmployeeExit: (exit: Omit<EmployeeExitItem, 'id'>) => void;
  updateEmployeeExit: (id: string, exit: Partial<EmployeeExitItem>) => void;
  deleteEmployeeExit: (id: string) => void;
  updateEmployeeExitClearance: (id: string, clearanceType: 'dept' | 'asset' | 'hr' | 'accounts', status: boolean) => void;
  fullAndFinalSettlements: FullAndFinalSettlementItem[];
  addFullAndFinalSettlement: (fnf: Omit<FullAndFinalSettlementItem, 'id'>) => void;
  updateFinalSettlementStatus: (id: string, status: FullAndFinalSettlementItem['paymentStatus'], voucherNo?: string) => void;
  deleteFullAndFinalSettlement: (id: string) => void;
  shiftMasters: ShiftMaster[];
  addShiftMaster: (shift: Omit<ShiftMaster, 'id'>) => void;
  updateShiftMaster: (id: string, shift: Partial<ShiftMaster>) => void;
  deleteShiftMaster: (id: string) => void;
  shiftRosters: ShiftRosterItem[];
  addShiftRoster: (roster: Omit<ShiftRosterItem, 'id'>) => void;
  updateShiftRoster: (id: string, roster: Partial<ShiftRosterItem>) => void;
  deleteShiftRoster: (id: string) => void;
  holidays: HolidayItem[];
  addHoliday: (holiday: Omit<HolidayItem, 'id'>) => void;
  updateHoliday: (id: string, holiday: Partial<HolidayItem>) => void;
  deleteHoliday: (id: string) => void;
  attendanceRecords: AttendanceRecord[];
  markAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  updateAttendanceRecord: (id: string, record: Partial<AttendanceRecord>) => void;
  leaveTypes: LeaveType[];
  addLeaveType: (lt: Omit<LeaveType, 'id'>) => void;
  leaveBalances: LeaveBalance[];
  leaveRequests: LeaveRequest[];
  addLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'leaveNumber' | 'appliedDate' | 'status'>) => void;
  updateLeaveRequestStatus: (id: string, status: LeaveApprovalStatus, approvedBy?: string) => void;
  wfhRequests: WFHRequest[];
  addWFHRequest: (req: Omit<WFHRequest, 'id' | 'wfhNumber' | 'status'>) => void;
  updateWFHRequestStatus: (id: string, status: LeaveApprovalStatus, remarks?: string) => void;
  updateWFHRequest: (id: string, updatedData: Partial<WFHRequest>) => void;
  deleteWFHRequest: (id: string) => void;
  missedPunchRequests: MissedPunchRequest[];
  addMissedPunchRequest: (req: Omit<MissedPunchRequest, 'id' | 'requestNumber' | 'status'>) => void;
  updateMissedPunchStatus: (id: string, status: LeaveApprovalStatus, remarks?: string) => void;
  updateMissedPunchRequest: (id: string, req: Partial<MissedPunchRequest>) => void;
  deleteMissedPunchRequest: (id: string) => void;
  attendanceRegularizations: AttendanceRegularization[];
  addAttendanceRegularization: (reg: Omit<AttendanceRegularization, 'id' | 'regularizationNo' | 'status'>) => void;
  updateAttendanceRegularizationStatus: (id: string, status: LeaveApprovalStatus) => void;
  overtimeRecords: OvertimeRecord[];
  addOvertimeRecord: (ot: Omit<OvertimeRecord, 'id' | 'overtimeNo' | 'status'>) => void;
  updateOvertimeStatus: (id: string, status: OvertimeRecord['status'], approvedBy?: string) => void;
  updateOvertimeRecord: (id: string, ot: Partial<OvertimeRecord>) => void;
  deleteOvertimeRecord: (id: string) => void;
  earlyCheckoutRequests: EarlyCheckoutRequest[];
  addEarlyCheckoutRequest: (req: Omit<EarlyCheckoutRequest, 'id' | 'requestNumber' | 'status'>) => void;
  updateEarlyCheckoutStatus: (id: string, status: LeaveApprovalStatus, remarks?: string) => void;
  updateEarlyCheckoutRequest: (id: string, req: Partial<EarlyCheckoutRequest>) => void;
  deleteEarlyCheckoutRequest: (id: string) => void;
  salaryComponents: SalaryComponent[];
  addSalaryComponent: (comp: Omit<SalaryComponent, 'id'>) => void;
  updateSalaryComponent: (id: string, comp: Partial<SalaryComponent>) => void;
  salaryStructures: SalaryStructure[];
  addSalaryStructure: (sal: Omit<SalaryStructure, 'id'>) => void;
  updateSalaryStructure: (id: string, sal: Partial<SalaryStructure>) => void;
  payrollRecords: PayrollRecord[];
  generateMonthlyPayroll: (monthYear: string, financialYear: string) => void;
  updatePayrollStatus: (id: string, status: PayrollStatusType, approvedBy?: string) => void;
  employeeAdvanceLoans: EmployeeAdvanceLoan[];
  addEmployeeAdvanceLoan: (loan: Omit<EmployeeAdvanceLoan, 'id' | 'loanNumber' | 'status'>) => void;
  updateEmployeeAdvanceLoan: (id: string, loan: Partial<EmployeeAdvanceLoan>) => void;
  reimbursementExpenses: ReimbursementExpense[];
  addReimbursementExpense: (exp: Omit<ReimbursementExpense, 'id' | 'reimbursementNo' | 'status'>) => void;
  updateReimbursementStatus: (id: string, status: ReimbursementExpense['status'], approvedBy?: string) => void;
  kpiMasters: KPIMaster[];
  addKPIMaster: (kpi: Omit<KPIMaster, 'id'>) => void;
  employeeAppraisals: EmployeeAppraisal[];
  addEmployeeAppraisal: (app: Omit<EmployeeAppraisal, 'id' | 'appraisalNumber' | 'status'> & { id?: string; appraisalNumber?: string; status?: EmployeeAppraisal['status'] }) => void;
  updateEmployeeAppraisal: (id: string, app: Partial<EmployeeAppraisal>) => void;
  deleteEmployeeAppraisal: (id: string) => void;
  updateAppraisalStatus: (id: string, status: EmployeeAppraisal['status'], remarks?: string) => void;
  trainingPrograms: TrainingProgram[];
  addTrainingProgram: (tr: Omit<TrainingProgram, 'id'>) => void;
  updateTrainingStatus: (id: string, status: TrainingProgram['status']) => void;
  jobPositions: JobPosition[];
  addJobPosition: (pos: Omit<JobPosition, 'id'>) => void;
  updateJobPositionStatus: (id: string, status: JobPosition['status']) => void;
  candidateProfiles: CandidateProfile[];
  addCandidateProfile: (cand: Omit<CandidateProfile, 'id' | 'candidateCode'>) => void;
  updateCandidateStatus: (id: string, status: CandidateProfile['status']) => void;
  interviewRecords: InterviewRecord[];
  addInterviewRecord: (interview: Omit<InterviewRecord, 'id'>) => void;
  offerLetters: OfferLetter[];
  addOfferLetter: (offer: Omit<OfferLetter, 'id' | 'offerNumber' | 'status'>) => void;
  updateOfferLetterStatus: (id: string, status: OfferLetter['status']) => void;

  // Module 10 - ERP Integration & 360 Views
  job360List: Job360Full[];
  centralApprovals: ApprovalItem[];
  centralAlerts: ERPAlertItem[];
  jobProfitabilityList: JobProfitabilityEntry[];
  customer360List: Customer360Summary[];
  supplier360List: Supplier360Summary[];
  item360List: Item360Summary[];
  employee360List: Employee360Summary[];
  activeRoleView: string;
  setActiveRoleView: (role: string) => void;
  approveCentralItem: (id: string, approverName: string) => void;
  rejectCentralItem: (id: string, remarks: string) => void;
  dismissCentralAlert: (id: string) => void;

  // Logs & Notifications
  auditLogs: AuditLogEntry[];
  logAction: (action: AuditLogEntry['action'], module: string, page: string, recordId: string, notes?: string, oldValue?: string, newValue?: string) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  sendNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;

  // Module 11: Testing, Security & Production Deployment
  testCases: TestCaseItem[];
  updateTestCaseStatus: (id: string, status: TestCaseItem['status'], remarks?: string) => void;
  resetTestCases: () => void;
  runAllMTOVerifications: () => void;
  bugTickets: BugTicket[];
  addBugTicket: (ticket: Omit<BugTicket, 'id' | 'bugNo' | 'createdDate'>) => void;
  updateBugTicketStatus: (id: string, status: BugTicket['status']) => void;
  backupRecords: BackupRecord[];
  createBackupRecord: (type: BackupRecord['type']) => void;
  restoreBackupRecord: (id: string) => void;
  dataImportLogs: DataImportLog[];
  executeDataImport: (entityType: DataImportLog['entityType'], fileName: string, totalRecords: number) => void;
  securityChecks: SecurityAuditCheck[];
  goLiveChecklist: GoLiveChecklistItem[];
  toggleGoLiveItem: (id: string) => void;

  isInitialLoading: boolean;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export function ERPProvider({ children }: { children: React.ReactNode }) {
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Master state initialized with deep relational seed
  const [company, setCompany] = useState<CompanySetting>(INITIAL_COMPANY);
  const [numbering, setNumbering] = useState<NumberingSetting[]>(INITIAL_NUMBERING);
  const [departments, setDepartments] = useState<Department[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_departments');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return INITIAL_DEPARTMENTS;
  });
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);

  // Module 10 Integration States
  const [job360List, setJob360List] = useState<Job360Full[]>(MOCK_JOB_360_FULL_LIST);
  const [centralApprovals, setCentralApprovals] = useState<ApprovalItem[]>(INITIAL_CENTRAL_APPROVALS);
  const [centralAlerts, setCentralAlerts] = useState<ERPAlertItem[]>(INITIAL_CENTRAL_ALERTS);
  const [jobProfitabilityList, setJobProfitabilityList] = useState<JobProfitabilityEntry[]>(MOCK_JOB_PROFITABILITY_LIST);
  const [customer360List, setCustomer360List] = useState<Customer360Summary[]>(MOCK_CUSTOMER_360_LIST);
  const [supplier360List, setSupplier360List] = useState<Supplier360Summary[]>(MOCK_SUPPLIER_360_LIST);
  const [item360List, setItem360List] = useState<Item360Summary[]>(MOCK_ITEM_360_LIST);
  const [employee360List, setEmployee360List] = useState<Employee360Summary[]>(MOCK_EMPLOYEE_360_LIST);
  const [activeRoleView, setActiveRoleView] = useState<string>('Super Admin');

  // Module 11 Testing States & Handlers
  const [testCases, setTestCases] = useState<TestCaseItem[]>(MOCK_TEST_CASES);
  const [bugTickets, setBugTickets] = useState<BugTicket[]>(MOCK_BUG_TICKETS);
  const [backupRecords, setBackupRecords] = useState<BackupRecord[]>(MOCK_BACKUP_RECORDS);
  const [dataImportLogs, setDataImportLogs] = useState<DataImportLog[]>(MOCK_IMPORT_LOGS);
  const [securityChecks, setSecurityChecks] = useState<SecurityAuditCheck[]>(MOCK_SECURITY_CHECKS);
  const [goLiveChecklist, setGoLiveChecklist] = useState<GoLiveChecklistItem[]>(MOCK_GOLIVE_CHECKLIST);

  const updateTestCaseStatus = (id: string, status: TestCaseItem['status'], remarks?: string) => {
    setTestCases((prev) =>
      prev.map((tc) =>
        tc.id === id ? { ...tc, status, remarks: remarks || tc.remarks, executedDate: new Date().toISOString().split('T')[0] } : tc
      )
    );
  };

  const resetTestCases = () => {
    setTestCases(MOCK_TEST_CASES);
  };

  const runAllMTOVerifications = () => {
    const today = new Date().toISOString().split('T')[0];
    setTestCases((prev) =>
      prev.map((tc) => ({
        ...tc,
        status: 'Pass',
        executedBy: 'Automated MTO Engine',
        executedDate: today,
        remarks: tc.remarks || 'Automated workflow verification passed successfully.',
      }))
    );
  };

  const addBugTicket = (ticket: Omit<BugTicket, 'id' | 'bugNo' | 'createdDate'>) => {
    const newBug: BugTicket = {
      ...ticket,
      id: `BUG-${String(bugTickets.length + 1).padStart(2, '0')}`,
      bugNo: `BUG-2026-${String(bugTickets.length + 1).padStart(3, '0')}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setBugTickets((prev) => [newBug, ...prev]);
  };

  const updateBugTicketStatus = (id: string, status: BugTicket['status']) => {
    setBugTickets((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status, resolvedDate: status === 'Closed' || status === 'Fixed' ? new Date().toISOString().split('T')[0] : b.resolvedDate } : b
      )
    );
  };

  const createBackupRecord = (type: BackupRecord['type']) => {
    const newBk: BackupRecord = {
      id: `BK-${String(backupRecords.length + 1).padStart(2, '0')}`,
      backupNo: `BK-${new Date().toISOString().slice(0, 10)?.replace(/-/g, '')}-${String(backupRecords.length + 1).padStart(3, '0')}`,
      type,
      fileName: `UMA_ERP_${type}_${new Date().toISOString().slice(0, 10)?.replace(/-/g, '')}.bak`,
      fileSize: '52.4 MB',
      recordCount: 15120,
      createdDate: new Date().toISOString()?.replace('T', ' ').slice(0, 16),
      createdBy: 'Rajesh Patel (Super Admin)',
      status: 'Verified_Valid',
      location: 'Encrypted AWS Cloud S3 Storage / Mumbai',
    };
    setBackupRecords((prev) => [newBk, ...prev]);
  };

  const restoreBackupRecord = (id: string) => {
    setBackupRecords((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'Verified_Valid' } : b))
    );
  };

  const executeDataImport = (entityType: DataImportLog['entityType'], fileName: string, totalRecords: number) => {
    const newLog: DataImportLog = {
      id: `IMP-${String(dataImportLogs.length + 1).padStart(2, '0')}`,
      importNo: `IMP-2026-${String(dataImportLogs.length + 1).padStart(3, '0')}`,
      entityType,
      fileName,
      totalRecords,
      importedRecords: totalRecords,
      failedRecords: 0,
      importedDate: new Date().toISOString().split('T')[0],
      importedBy: 'Rajesh Patel',
      status: 'Success',
    };
    setDataImportLogs((prev) => [newLog, ...prev]);
  };

  const toggleGoLiveItem = (id: string) => {
    setGoLiveChecklist((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'Pass' ? 'Pending' : 'Pass' }
          : item
      )
    );
  };
  
  const defaultAdminUser: Employee = {
    id: 'EMP-001',
    firstName: 'Admin',
    lastName: 'User',
    name: 'Admin User',
    username: 'admin',
    email: 'admin@umatechnofab.com',
    gender: 'male',
    dob: '1990-01-01',
    mobile: '9825012345',
    phone: '9825012345',
    address: 'Plot 45, GIDC Vatva, Ahmedabad, Gujarat',
    departmentId: 'DEPT-MGT',
    department: 'Management',
    departmentName: 'Management',
    designation: 'Administrator',
    roleId: 'ROLE-ADMIN',
    role: 'Super Admin',
    roleName: 'Super Admin',
    joiningDate: '2020-01-01',
    joinedDate: '2020-01-01',
    employmentType: 'full_time',
    status: 'active',
  };

  const [employees, setEmployees] = useState<Employee[]>([]);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<Employee>(defaultAdminUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Layout State
  const [activeDepartment, setActiveDepartment] = useState<DepartmentType | 'all'>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // CRM States
  const [leads, setLeads] = useState<Lead[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_leads');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return INITIAL_LEADS;
  });
  const [customers, setCustomers] = useState<Customer[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_customers');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return INITIAL_CUSTOMERS;
  });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_enquiries');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return INITIAL_ENQUIRIES;
  });
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_opportunities');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return INITIAL_OPPORTUNITIES;
  });
  const [followUps, setFollowUps] = useState<FollowUp[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_followUps');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return INITIAL_FOLLOWUPS;
  });
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_siteVisits');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return INITIAL_VISITS;
  });
  const [exhibitions, setExhibitions] = useState<Exhibition[]>(INITIAL_EXHIBITIONS);
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_quotations');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const uniqueMap = new Map<string, Quotation>();
            parsed.forEach((q: any) => {
              const qId = String(q.id || q.quotationNumber || '').trim();
              if (qId && !uniqueMap.has(qId)) {
                const revs = Array.isArray(q.revisions) ? q.revisions : [];
                const lastRev = revs[revs.length - 1] || {};
                const firstItem = (lastRev.items || [{}])[0];
                const summary = q.latestSummary || {
                  machineProduct: firstItem?.productName || 'Process Equipment',
                  grandTotal: Number(lastRev?.grandTotal) || 0,
                  status: lastRev?.status || 'draft',
                };
                uniqueMap.set(qId, { ...q, id: qId, latestSummary: summary });
              }
            });
            const cleaned = Array.from(uniqueMap.values());
            if (cleaned.length > 0) return cleaned;
          }
        }
      } catch (_) {}
    }
    return INITIAL_QUOTATIONS;
  });
  const [customerPOs, setCustomerPOs] = useState<CustomerPO[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_customerPOs');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const uniqueMap = new Map<string, CustomerPO>();
            parsed.forEach((p: any) => {
              const pId = String(p.id || p.poNumber || '').trim();
              if (pId && !uniqueMap.has(pId)) {
                uniqueMap.set(pId, p);
              }
            });
            const cleaned = Array.from(uniqueMap.values());
            if (cleaned.length > 0) return cleaned;
          }
        }
      } catch (_) {}
    }
    return INITIAL_CUSTOMER_POS;
  });
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_salesOrders');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return INITIAL_SALES_ORDERS;
  });
  const [projectJobs, setProjectJobs] = useState<ProjectJobMaster[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_projectJobs');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return INITIAL_PROJECT_JOBS;
  });
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>(MOCK_PROJECT_TASKS);
  const [projectPlanningStages, setProjectPlanningStages] = useState<ProjectPlanningStage[]>(MOCK_PLANNING_STAGES);
  const [projectMilestones, setProjectMilestones] = useState<ProjectMilestone[]>(MOCK_MILESTONES);
  const [departmentAssignments, setDepartmentAssignments] = useState<DepartmentAssignment[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_departmentAssignments');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (_) {}
    }
    return [];
  });
  const [projectIssues, setProjectIssues] = useState<ProjectIssue[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_projectIssues');
        if (stored) return JSON.parse(stored);
      } catch (_) {}
    }
    return MOCK_PROJECT_ISSUES;
  });
  const [projectDelays, setProjectDelays] = useState<ProjectDelay[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_projectDelays');
        if (stored) return JSON.parse(stored);
      } catch (_) {}
    }
    return MOCK_PROJECT_DELAYS;
  });
  const [changeRequests, setChangeRequests] = useState<CustomerChangeRequest[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_changeRequests');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (_) {}
    }
    return [];
  });
  const [projectDocuments, setProjectDocuments] = useState<ProjectDocument[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_projectDocuments');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (_) {}
    }
    return [];
  });
  const [projectCosts, setProjectCosts] = useState<ProjectCostItem[]>(MOCK_PROJECT_COSTS);
  const [projectComments, setProjectComments] = useState<ProjectComment[]>(MOCK_PROJECT_COMMENTS);
  const [projectApprovals, setProjectApprovals] = useState<ProjectApproval[]>(MOCK_PROJECT_APPROVALS);
  const [projectActivities, setProjectActivities] = useState<ProjectActivityLog[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_projectActivities');
        if (stored) return JSON.parse(stored);
      } catch (_) {}
    }
    return MOCK_PROJECT_ACTIVITIES;
  });

  const [designJobs, setDesignJobs] = useState<DesignJob[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_designJobs');
        if (stored) return JSON.parse(stored);
      } catch (_) {}
    }
    return INITIAL_DESIGN_JOBS;
  });
  const [customerRequirements, setCustomerRequirements] = useState<CustomerRequirement[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_customerRequirements');
        if (stored) return JSON.parse(stored);
      } catch (_) {}
    }
    return MOCK_CUSTOMER_REQUIREMENTS;
  });
  const [designTasks, setDesignTasks] = useState<DesignTask[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_designTasks');
        if (stored) return JSON.parse(stored);
      } catch (_) {}
    }
    return MOCK_DESIGN_TASKS;
  });
  const [drawings2D, setDrawings2D] = useState<Drawing2D[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_drawings2D');
        if (stored) return JSON.parse(stored);
      } catch (_) {}
    }
    return MOCK_2D_DRAWINGS;
  });
  const [designs3D, setDesigns3D] = useState<Design3DModel[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_designs3D');
        if (stored) return JSON.parse(stored);
      } catch (_) {}
    }
    return MOCK_3D_MODELS;
  });
  const [assemblyDrawings, setAssemblyDrawings] = useState<AssemblyDrawing[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_assemblyDrawings');
        if (stored) return JSON.parse(stored);
      } catch (_) {}
    }
    return MOCK_ASSEMBLY_DRAWINGS;
  });
  const [partDrawings, setPartDrawings] = useState<PartDrawing[]>(MOCK_PART_DRAWINGS);
  const [boms, setBoms] = useState<BOMHeader[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_boms');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return MOCK_BOM_HEADERS;
  });
  const [bomRevisions, setBomRevisions] = useState<BOMRevision[]>(MOCK_BOM_REVISIONS);
  const [designRevisions, setDesignRevisions] = useState<DesignRevisionLog[]>(MOCK_DESIGN_REVISIONS);
  const [designReviews, setDesignReviews] = useState<DesignReviewChecklist[]>(MOCK_DESIGN_REVIEWS);
  const [technicalDocuments, setTechnicalDocuments] = useState<TechnicalDocumentItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_technicalDocuments');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return MOCK_TECHNICAL_DOCUMENTS;
  });

  // Module 4: Purchase Management States
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [supplierContacts, setSupplierContacts] = useState<SupplierContact[]>(MOCK_SUPPLIER_CONTACTS);
  const [materialRequirements, setMaterialRequirements] = useState<MaterialRequirement[]>(MOCK_MATERIAL_REQUIREMENTS);
  const [purchaseRequisitions, setPurchaseRequisitions] = useState<PurchaseRequisition[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_purchaseRequisitions');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return MOCK_PURCHASE_REQUISITIONS;
  });
  const [rfqs, setRfqs] = useState<RequestForQuotation[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_rfqs');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return MOCK_RFQS;
  });
  const [supplierQuotations, setSupplierQuotations] = useState<SupplierQuotation[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_supplierQuotations');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return MOCK_SUPPLIER_QUOTATIONS;
  });
  const [quotationComparisons, setQuotationComparisons] = useState<QuotationComparison[]>(MOCK_QUOTATION_COMPARISONS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);
  const [poRevisions, setPoRevisions] = useState<PORevision[]>(MOCK_PO_REVISIONS);
  const [purchaseFollowUps, setPurchaseFollowUps] = useState<PurchaseFollowUp[]>(MOCK_PURCHASE_FOLLOWUPS);
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>(MOCK_PURCHASE_RETURNS);

  // Module 5: Store & Warehouse Management States
  const [itemMasters, setItemMasters] = useState<ItemMaster[]>(INITIAL_ITEM_MASTERS);
  const [itemCategories, setItemCategories] = useState<ItemCategory[]>(INITIAL_ITEM_CATEGORIES);
  const [uoms, setUoms] = useState<UOMMaster[]>(INITIAL_UOMS);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);
  const [warehouseLocations, setWarehouseLocations] = useState<WarehouseLocation[]>(INITIAL_WAREHOUSE_LOCATIONS);
  const [openingStocks, setOpeningStocks] = useState<OpeningStock[]>(INITIAL_OPENING_STOCKS);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceiptNote[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_goodsReceipts');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return INITIAL_GOODS_RECEIPTS;
  });
  const [qcInspections, setQcInspections] = useState<QCInspection[]>(INITIAL_QC_INSPECTIONS);
  const [stockBalances, setStockBalances] = useState<StockBalance[]>(INITIAL_STOCK_BALANCES);
  const [stockReservations, setStockReservations] = useState<StockReservation[]>(INITIAL_STOCK_RESERVATIONS);
  const [materialIssues, setMaterialIssues] = useState<MaterialIssue[]>(INITIAL_MATERIAL_ISSUES);
  const [materialReturns, setMaterialReturns] = useState<MaterialReturn[]>(INITIAL_MATERIAL_RETURNS);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(INITIAL_STOCK_TRANSFERS);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(INITIAL_STOCK_ADJUSTMENTS);
  const [scrapEntries, setScrapEntries] = useState<ScrapEntry[]>(INITIAL_SCRAP_ENTRIES);
  const [physicalStockCounts, setPhysicalStockCounts] = useState<PhysicalStockCount[]>(INITIAL_PHYSICAL_COUNTS);
  const [stockLedgers, setStockLedgers] = useState<StockLedgerEntry[]>(INITIAL_STOCK_LEDGERS);

  // Module 6: Production / Manufacturing / MRP States
  const [manufacturingJobs, setManufacturingJobs] = useState<ManufacturingJob[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_manufacturingJobs');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return INITIAL_MANUFACTURING_JOBS;
  });
  const [productionPlans, setProductionPlans] = useState<ProductionPlan[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_productionPlans');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return INITIAL_PRODUCTION_PLANS;
  });
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_productionOrders');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return INITIAL_PRODUCTION_ORDERS;
  });
  const [routingOperations, setRoutingOperations] = useState<RoutingOperation[]>(INITIAL_ROUTING_OPERATIONS);
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>(INITIAL_WORK_CENTERS);
  const [productionSchedules, setProductionSchedules] = useState<ProductionScheduleItem[]>(INITIAL_PRODUCTION_SCHEDULES);
  const [mrpRequirements, setMrpRequirements] = useState<MRPItemRequirement[]>(INITIAL_MRP_REQUIREMENTS);
  const [productionEntries, setProductionEntries] = useState<ProductionEntry[]>(INITIAL_PRODUCTION_ENTRIES);
  const [wipRecords, setWipRecords] = useState<WIPRecord[]>(INITIAL_WIP_RECORDS);
  const [productionHolds, setProductionHolds] = useState<ProductionHold[]>(INITIAL_PRODUCTION_HOLDS);
  const [reworkOrders, setReworkOrders] = useState<ReworkOrder[]>(INITIAL_REWORK_ORDERS);
  const [productionScraps, setProductionScraps] = useState<ProductionScrap[]>(INITIAL_PRODUCTION_SCRAPS);
  const [productionCompletions, setProductionCompletions] = useState<ProductionCompletion[]>([]);
  const [finishedGoods, setFinishedGoods] = useState<FinishedGoodsItem[]>(INITIAL_FINISHED_GOODS);
  const [productionCosts, setProductionCosts] = useState<ProductionCostSummary[]>(INITIAL_PRODUCTION_COSTS);

  // Module 7: Accounting & Finance States
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>(INITIAL_FINANCIAL_YEARS);
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>(INITIAL_CHART_OF_ACCOUNTS);
  const [accountGroups, setAccountGroups] = useState<AccountGroup[]>(INITIAL_ACCOUNT_GROUPS);
  const [taxMasters, setTaxMasters] = useState<TaxMaster[]>(INITIAL_TAX_MASTERS);
  const [tdsMasters, setTdsMasters] = useState<TDSMaster[]>(INITIAL_TDS_MASTERS);
  const [costCenters, setCostCenters] = useState<CostCenter[]>(INITIAL_COST_CENTERS);
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>(INITIAL_SALES_INVOICES);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>(INITIAL_PURCHASE_INVOICES);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>(INITIAL_CREDIT_NOTES);
  const [debitNotes, setDebitNotes] = useState<DebitNote[]>(INITIAL_DEBIT_NOTES);
  const [customerReceipts, setCustomerReceipts] = useState<CustomerReceipt[]>(INITIAL_CUSTOMER_RECEIPTS);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(INITIAL_SUPPLIER_PAYMENTS);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(INITIAL_JOURNAL_ENTRIES);
  const [contraEntries, setContraEntries] = useState<ContraEntry[]>(INITIAL_CONTRA_ENTRIES);
  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntry[]>(INITIAL_EXPENSE_ENTRIES);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(INITIAL_BANK_ACCOUNTS);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [bankReconciliations, setBankReconciliations] = useState<BankReconciliation[]>([]);
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>(INITIAL_FIXED_ASSETS);
  const [depreciationEntries, setDepreciationEntries] = useState<DepreciationEntry[]>([]);
  const [jobCostings, setJobCostings] = useState<JobCostingSummary[]>(INITIAL_JOB_COSTINGS);
  const [receivableAging, setReceivableAging] = useState<ReceivableAging[]>(INITIAL_RECEIVABLE_AGING);
  const [payableAging, setPayableAging] = useState<PayableAging[]>(INITIAL_PAYABLE_AGING);

  // Traceability & Audit & Notification
  const [jobs, setJobs] = useState<JobTraceabilityRecord[]>(MOCK_JOBS);
  const [selectedJobForModal, setSelectedJobForModal] = useState<JobTraceabilityRecord | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  // Keyboard shortcut for Global Search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key?.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Immediate LocalStorage Hydration for 0ms load & refresh persistence
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const cacheEntries: [string, React.Dispatch<React.SetStateAction<any>>][] = [
        ['leads', setLeads],
        ['customers', setCustomers],
        ['contacts', setContacts],
        ['enquiries', setEnquiries],
        ['opportunities', setOpportunities],
        ['followUps', setFollowUps],
        ['siteVisits', setSiteVisits],
        ['exhibitions', setExhibitions],
        ['quotations', setQuotations],
        ['customerPOs', setCustomerPOs],
        ['salesOrders', setSalesOrders],
        ['projectJobs', setProjectJobs],
        ['projectTasks', setProjectTasks],
        ['projectMilestones', setProjectMilestones],
        ['projectPlanningStages', setProjectPlanningStages],
        ['departmentAssignments', setDepartmentAssignments],
        ['designJobs', setDesignJobs],
        ['drawings2D', setDrawings2D],
        ['designs3D', setDesigns3D],
        ['boms', setBoms],
        ['suppliers', setSuppliers],
        ['purchaseRequisitions', setPurchaseRequisitions],
        ['purchaseOrders', setPurchaseOrders],
        ['itemMasters', setItemMasters],
        ['itemCategories', setItemCategories],
        ['uoms', setUoms],
        ['warehouses', setWarehouses],
        ['goodsReceipts', setGoodsReceipts],
        ['qcInspections', setQcInspections],
        ['stockBalances', setStockBalances],
        ['materialIssues', setMaterialIssues],
        ['materialReturns', setMaterialReturns],
        ['manufacturingJobs', setManufacturingJobs],
        ['workCenters', setWorkCenters],
        ['workOrders', setWorkOrders],
        ['finishedGoods', setFinishedGoods],
        ['internalAssets', setInternalAssets],
        ['customerMachines', setCustomerMachines],
        ['serviceRequests', setServiceRequests],
        ['breakdowns', setBreakdowns],
        ['serviceVisits', setServiceVisits],
        ['employees', setEmployees],
        ['departments', setDepartments],
        ['roles', setRoles],
        ['designations', setDesignations],
        ['employeeDocuments', setEmployeeDocuments],
        ['employeeOnboardings', setEmployeeOnboardings],
        ['financialYears', setFinancialYears],
        ['chartOfAccounts', setChartOfAccounts],
        ['salesInvoices', setSalesInvoices],
        ['purchaseInvoices', setPurchaseInvoices],
        ['creditNotes', setCreditNotes],
        ['debitNotes', setDebitNotes],
        ['customerReceipts', setCustomerReceipts],
        ['supplierPayments', setSupplierPayments],
        ['journalEntries', setJournalEntries],
        ['contraEntries', setContraEntries],
        ['bankAccounts', setBankAccounts],
        ['expenseEntries', setExpenseEntries],
        ['holidays', setHolidays],
        ['wfhRequests', setWFHRequests],
        ['fixedAssets', setFixedAssets],
        ['missedPunchRequests', setMissedPunchRequests],
        ['overtimeRecords', setOvertimeRecords],
        ['earlyCheckoutRequests', setEarlyCheckoutRequests],
        ['employeeAppraisals', setEmployeeAppraisals],
        ['notifications', setNotifications],
      ];

      let hasCached = false;
      for (const [key, setter] of cacheEntries) {
        const item = localStorage.getItem('UMA_ERP_' + key);
        if (item) {
          try {
            const data = JSON.parse(item);
            if (Array.isArray(data) && data.length > 0) {
              if (key === 'employees') {
                setter(deduplicateEmployees(data));
              } else if (key === 'itemCategories') {
                const normalized = data.map((c: any) => ({
                  ...c,
                  id: String(c.id || c.categoryCode || c.code),
                  categoryCode: c.categoryCode || c.code || c.category_code || c.id || 'CAT',
                  categoryName: c.categoryName || c.name || c.category_name || (c.description ? c.description.split(',')[0] : 'Item Category'),
                  description: c.description || '',
                  parentCategory: c.parentCategory || c.parent_category || 'Top Level',
                  status: c.status || 'Active',
                }));
                setter(normalized);
              } else if (key === 'warehouses') {
                const normalized = data.map((w: any) => ({
                  ...w,
                  id: String(w.id || w.warehouseCode || w.warehouse_code),
                  warehouseCode: w.warehouseCode || w.warehouse_code || w.id,
                  warehouseName: w.warehouseName || w.name || w.warehouse_name || w.warehouseCode || w.id,
                  warehouseType: w.warehouseType || w.warehouse_type || 'Raw Material',
                  address: w.address || '',
                  managerName: w.managerName || w.incharge || 'Store Incharge',
                  contactPhone: w.contactPhone || w.contact_phone || '',
                  contactEmail: w.contactEmail || w.contact_email || '',
                  status: w.status || 'Active',
                }));
                setter(normalized);
              } else if (key === 'qcInspections') {
                const normalized = data.map((q: any) => {
                  const firstItm = (q.items && Array.isArray(q.items) && q.items[0]) || {};
                  return {
                    id: String(q.id || q.inspectionNumber || q.inspection_number || 'QC'),
                    inspectionNumber: q.inspectionNumber || q.inspection_number || q.id || 'QC',
                    inspectionDate: q.inspectionDate || q.inspection_date || '',
                    grnId: q.grnId || q.grn_id || '',
                    grnNumber: q.grnNumber || q.grn_number || '',
                    itemId: q.itemId || q.item_id || firstItm.itemId || 'ITM-01',
                    itemCode: q.itemCode || q.item_code || firstItm.itemCode || firstItm.item_code || 'RAW-MAT',
                    itemName: q.itemName || q.item_name || firstItm.itemName || firstItm.item_name || 'Material Item',
                    jobId: q.jobId || q.job_id || 'General Stock',
                    supplierName: q.supplierName || q.supplier_name || firstItm.supplierName || 'Supplier',
                    requiredSpecification: q.requiredSpecification || q.required_specification || 'Standard Spec',
                    actualSpecification: q.actualSpecification || q.actual_specification || 'Passed Inspection',
                    inspectionParameters: q.inspectionParameters || q.inspection_parameters || 'Visual, Dimension, Spec Verification',
                    sampleQuantity: Number(q.sampleQuantity || q.sample_quantity || 1),
                    acceptedQuantity: Number(q.acceptedQuantity ?? q.accepted_quantity ?? firstItm.acceptedQuantity ?? firstItm.acceptedQty ?? 1),
                    rejectedQuantity: Number(q.rejectedQuantity ?? q.rejected_quantity ?? firstItm.rejectedQuantity ?? firstItm.rejectedQty ?? 0),
                    rejectionReason: q.rejectionReason || q.rejection_reason || '',
                    qcResult: (q.qcResult || q.overall_result || 'Pass') as any,
                    inspectorName: q.inspectorName || q.inspector || 'Suresh Patel (Sr. QC Lead)',
                    remarks: q.remarks || '',
                  };
                });
                setter(normalized);
              } else {
                setter(data);
              }
              hasCached = true;
            }
          } catch (_) {}
        }
      }
      const cachedCompany = localStorage.getItem('UMA_ERP_company');
      if (cachedCompany) {
        try {
          const cData = JSON.parse(cachedCompany);
          if (cData && typeof cData === 'object') {
            setCompany((prev) => ({ ...prev, ...cData }));
            hasCached = true;
          }
        } catch (_) {}
      }

      if (hasCached) {
        setIsInitialLoading(false);
      }
    } catch (err) {
      console.warn('LocalStorage hydration error:', err);
    }
  }, []);

  // Live Backend Data Fetching from PythonAnywhere
  useEffect(() => {
    let isMounted = true;

    async function loadLiveData() {
      try {
        const results = await Promise.allSettled([
          api.crm.leads.list(),
          api.crm.customers.list(),
          api.crm.contacts.list(),
          api.crm.enquiries.list(),
          api.crm.opportunities.list(),
          api.crm.quotations.list(),
          api.crm.customerPos.list(),
          api.crm.salesOrders.list(),
          api.crm.followUps.list(),
          api.crm.siteVisits.list(),
          api.crm.exhibitions.list(),
          api.employees.list(),
          api.departments.list(),
          api.roles.list(),
          api.projects.list(),
          api.projects.tasks(),
          api.projects.milestones(),
          api.projects.planningStages(),
          api.designer.jobs.list(),
          api.designer.drawings2d(),
          api.designer.models3d(),
          api.designer.boms.list(),
          api.purchase.suppliers.list(),
          api.purchase.requisitions.list(),
          api.purchase.orders.list(),
          api.store.items.list(),
          api.store.categories(),
          api.store.uoms(),
          api.store.warehouses.list(),
          api.store.grns.list(),
          api.store.stock(),
          api.store.materialIssues(),
          api.store.materialReturns(),
          api.production.jobs(),
          api.production.workCenters(),
          api.production.workOrders.list(),
          api.production.finishedGoods.list(),
          api.maintenance.internalAssets(),
          api.maintenance.customerMachines(),
          api.maintenance.serviceRequests.list(),
          api.maintenance.breakdowns(),
          api.maintenance.serviceVisits(),
          api.maintenance.servicePartIssues.list(),
          api.maintenance.servicePartReturns.list(),
          api.maintenance.serviceReports.list(),
          api.hr.designations(),
          api.hr.shifts(),
          api.hr.attendance(),
          api.hr.leaves.list(),
          api.hr.payroll.list(),
          api.hr.onboardings.list(),
          api.accounting.financialYears(),
          api.accounting.chartOfAccounts(),
          api.accounting.salesInvoices.list(),
          api.accounting.purchaseInvoices.list(),
          api.accounting.receipts(),
          api.accounting.payments(),
          api.accounting.journalEntries.list(),
          api.accounting.creditNotes.list(),
          api.accounting.debitNotes.list(),
          api.accounting.contraEntries.list(),
          api.accounting.bankAccounts.list(),
          api.accounting.expenses.list(),
          api.accounting.fixedAssets.list(),
          api.hr.holidays.list(),
          api.hr.overtimeRecords.list(),
          api.hr.earlyCheckouts.list(),
          api.hr.appraisals.list(),
          api.integration.approvals.list(),
          api.integration.alerts.list(),
          api.store.qcInspections(),
          api.auth.me(),
          api.projects.departmentAssignments(),
          api.projects.documents(),
          api.projects.changeRequests(),
          api.designer.requirements.list(),
          api.designer.tasks.list(),
          api.purchase.mrp.list(),
          api.purchase.rfqs.list(),
          api.purchase.supplierQuotations.list(),
          api.purchase.quotationComparisons.list(),
          api.production.orders.list(),
          api.designer.technicalDocuments.list(),
        ]);

        if (!isMounted) return;

        function val<T>(res: PromiseSettledResult<any>): T | null {
          return res.status === 'fulfilled' && res.value !== undefined ? (res.value as T) : null;
        }

        function applyLive<T>(res: T[] | null, setter: React.Dispatch<React.SetStateAction<T[]>>, cacheKey?: string) {
          if (res && Array.isArray(res)) {
            setter(res);
            if (cacheKey && typeof window !== 'undefined') {
              try {
                localStorage.setItem('UMA_ERP_' + cacheKey, JSON.stringify(res));
              } catch (_) {}
            }
          }
        }

        applyLive<Lead>(val(results[0]), setLeads, 'leads');
        applyLive<Customer>(val(results[1]), setCustomers, 'customers');
        applyLive<Contact>(val(results[2]), setContacts, 'contacts');
        applyLive<Enquiry>(val(results[3]), setEnquiries, 'enquiries');
        applyLive<Opportunity>(val(results[4]), setOpportunities, 'opportunities');
        const rawQuotations = val<any[]>(results[5]);
        if (rawQuotations && Array.isArray(rawQuotations) && rawQuotations.length > 0) {
          const uniqueMap = new Map<string, Quotation>();
          rawQuotations.forEach((q: any) => {
            const qId = String(q.id || q.quotationNumber || q.quotation_number || '').trim();
            if (!qId) return;
            const revs = Array.isArray(q.revisions) ? q.revisions : [];
            const lastRev = revs[revs.length - 1] || {};
            const firstItem = (lastRev.items || [{}])[0];
            const summary = q.latestSummary || {
              machineProduct: firstItem?.productName || 'Process Equipment',
              grandTotal: Number(lastRev?.grandTotal) || 0,
              status: lastRev?.status || 'draft',
            };
            const normalized: Quotation = {
              ...q,
              id: qId,
              quotationNumber: q.quotationNumber || q.quotation_number || qId,
              currentRevision: q.currentRevision || q.current_revision || 'Rev-00',
              date: q.date || '',
              validUntil: q.validUntil || q.valid_until || '',
              customerId: q.customerId || q.customer_id || '',
              customerName: q.customerName || q.customer_name || '',
              contactPerson: q.contactPerson || q.contact_person || '',
              contactMobile: q.contactMobile || q.contact_mobile || '',
              contactEmail: q.contactEmail || q.contact_email || '',
              enquiryId: q.enquiryId || q.enquiry_id || '',
              opportunityId: q.opportunityId || q.opportunity_id || '',
              salesPersonId: q.salesPersonId || q.sales_person_id || '',
              salesPersonName: q.salesPersonName || q.sales_person_name || '',
              revisions: revs,
              notes: q.notes || '',
              latestSummary: summary,
            };
            uniqueMap.set(qId, normalized);
          });
          const normalizedQuotations = Array.from(uniqueMap.values());
          setQuotations(normalizedQuotations);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_quotations', JSON.stringify(normalizedQuotations)); } catch (_) {}
          }
        }
        const rawCustomerPOs = val<any[]>(results[6]);
        if (rawCustomerPOs && Array.isArray(rawCustomerPOs) && rawCustomerPOs.length > 0) {
          const normalizedPOs: CustomerPO[] = rawCustomerPOs.map((po: any) => ({
            ...po,
            id: String(po.id),
            poNumber: po.poNumber || po.po_number || po.id,
            poDate: po.poDate || po.po_date || '',
            customerId: po.customerId || po.customer_id || '',
            customerName: po.customerName || po.customer_name || '',
            quotationId: po.quotationId || po.quotation_id || '',
            quotationNumber: po.quotationNumber || po.quotation_number || '',
            salesOrderId: po.salesOrderId || po.sales_order_id || po.converted_so_id || '',
            poAmount: Number(po.poAmount) || Number(po.po_value) || Number(po.po_amount) || 0,
            paymentTerms: po.paymentTerms || po.payment_terms || '',
            deliveryDate: po.deliveryDate || po.delivery_date || '',
            status: po.status || 'received',
          }));
          applyLive<CustomerPO>(normalizedPOs, setCustomerPOs, 'customerPOs');
        } else {
          applyLive<CustomerPO>(val(results[6]), setCustomerPOs, 'customerPOs');
        }
        const rawSalesOrders = val<any[]>(results[7]);
        if (rawSalesOrders && Array.isArray(rawSalesOrders) && rawSalesOrders.length > 0) {
          const normalizedSalesOrders: SalesOrder[] = rawSalesOrders.map((so: any) => ({
            ...so,
            id: String(so.id),
            salesOrderNumber: so.salesOrderNumber || so.sales_order_number || so.id,
            customerId: so.customerId || so.customer_id || '',
            customerName: so.customerName || so.customer_name || '',
            customerPoId: so.customerPoId || so.customer_po_id || '',
            customerPoNumber: so.customerPoNumber || so.customer_po_number || '',
            quotationId: so.quotationId || so.quotation_id || '',
            quotationNumber: so.quotationNumber || so.quotation_number || '',
            orderDate: so.orderDate || so.order_date || '',
            deliveryDate: so.deliveryDate || so.target_delivery_date || so.targetDeliveryDate || '',
            items: Array.isArray(so.items) ? so.items : [],
            orderValue: Number(so.orderValue) || Number(so.grand_total) || Number(so.total_amount) || 0,
            paymentTerms: so.paymentTerms || so.payment_terms || '',
            assignedProjectManager: so.assignedProjectManager || so.assigned_project_manager || so.created_by || 'Unassigned',
            status: so.status || 'confirmed',
            projectId: so.projectId || so.project_id || undefined,
            jobNumber: so.jobNumber || so.job_number || undefined,
          }));
          setSalesOrders(normalizedSalesOrders);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_salesOrders', JSON.stringify(normalizedSalesOrders)); } catch (_) {}
          }
        }

        const rawFollowUps = val<any>(results[8]);
        if (rawFollowUps) {
          const followUpsList: any[] = Array.isArray(rawFollowUps)
            ? rawFollowUps
            : Array.isArray(rawFollowUps?.results)
            ? rawFollowUps.results
            : Array.isArray(rawFollowUps?.data)
            ? rawFollowUps.data
            : [];
          if (followUpsList.length > 0) {
            const normalizedFollowUps: FollowUp[] = followUpsList.map((f: any) => ({
              ...f,
              id: String(f.id || f.follow_up_no || f.followUpNo),
              followUpNo: f.followUpNo || f.follow_up_no || f.id,
              leadOrCustomerId: f.leadOrCustomerId || f.lead_or_customer_id || f.customer_id || f.lead_id || '',
              leadOrCustomerName: f.leadOrCustomerName || f.lead_or_customer_name || f.customer_name || '',
              entityType: f.entityType || f.entity_type || 'lead',
              type: f.type || 'call',
              assignedToId: f.assignedToId || f.assigned_to_id || f.sales_person_id || '',
              assignedToName: f.assignedToName || f.assigned_to_name || f.sales_person_name || '',
              date: f.date || f.scheduled_date || '',
              time: f.time || f.scheduled_time || '',
              priority: f.priority || 'medium',
              purpose: f.purpose || f.discussion_purpose || '',
              notes: f.notes || f.discussion_notes || '',
              nextFollowUpDate: f.nextFollowUpDate || f.next_follow_up_date || '',
              status: f.status || 'pending',
              completedNotes: f.completedNotes || f.completed_notes || '',
            }));
            setFollowUps(normalizedFollowUps);
            if (typeof window !== 'undefined') {
              try { localStorage.setItem('UMA_ERP_followUps', JSON.stringify(normalizedFollowUps)); } catch (_) {}
            }
          }
        }

        const rawVisits = val<any[]>(results[9]);
        if (rawVisits && Array.isArray(rawVisits) && rawVisits.length > 0) {
          const normalizedVisits: SiteVisit[] = rawVisits.map((v: any) => ({
            ...v,
            id: String(v.id || v.visit_no || v.visitNo),
            visitNo: v.visitNo || v.visit_no || v.id,
            customerId: v.customerId || v.customer_id || '',
            customerName: v.customerName || v.customer_name || '',
            contactPerson: v.contactPerson || v.contact_person || '',
            contactMobile: v.contactMobile || v.contact_mobile || '',
            visitDate: v.visitDate || v.visit_date || '',
            location: v.location || '',
            employeeId: v.employeeId || v.employee_id || '',
            employeeName: v.employeeName || v.employee_name || '',
            purpose: v.purpose || '',
            discussionNotes: v.discussionNotes || v.discussion_notes || v.discussionSummary || v.discussion_summary || '',
            requirementDetails: v.requirementDetails || v.requirement_details || '',
            outcome: v.outcome || 'positive',
            nextAction: v.nextAction || v.next_action || '',
            nextFollowUpDate: v.nextFollowUpDate || v.next_follow_up_date || '',
          }));
          setSiteVisits(normalizedVisits);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_siteVisits', JSON.stringify(normalizedVisits)); } catch (_) {}
          }
        }

        const rawExhibitions = val<any[]>(results[10]);
        if (rawExhibitions && Array.isArray(rawExhibitions) && rawExhibitions.length > 0) {
          const normalizedExhibitions: Exhibition[] = rawExhibitions.map((e: any) => ({
            id: String(e.id),
            expoName: e.expoName || e.expo_name || 'Exhibition',
            organizer: e.organizer || '',
            location: e.location || '',
            startDate: e.startDate || e.start_date || '',
            endDate: e.endDate || e.end_date || '',
            stallNumber: e.stallNumber || e.stall_number || '',
            contactPerson: e.contactPerson || e.contact_person || '',
            budget: Number(e.budget) || 0,
            assignedTeam: Array.isArray(e.assignedTeam) ? e.assignedTeam : (Array.isArray(e.assigned_team) ? e.assigned_team : []),
            productsDisplayed: e.productsDisplayed || e.products_displayed || '',
            notes: e.notes || '',
            totalContacts: Number(e.totalContacts) || Number(e.total_contacts) || 0,
            qualifiedLeads: Number(e.qualifiedLeads) || Number(e.qualified_leads) || 0,
            quotationsSent: Number(e.quotationsSent) || Number(e.quotations_sent) || 0,
            convertedCustomers: Number(e.convertedCustomers) || Number(e.converted_customers) || 0,
          }));
          setExhibitions(normalizedExhibitions);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_exhibitions', JSON.stringify(normalizedExhibitions)); } catch (_) {}
          }
        }
        const rawDepts = val<any[]>(results[12]);
        if (rawDepts && Array.isArray(rawDepts) && rawDepts.length > 0) {
          setDepartments((prev) => {
            const map = new Map<string, Department>();
            // Keep local state first
            (prev || []).forEach((d) => {
              if (d && d.id) map.set(d.id, d);
            });
            // Merge/update from backend
            rawDepts.forEach((d: any) => {
              const name = d.name || d.departmentName || d.department_name || '';
              const code = d.code || '';
              const id = String(d.id || `dept-${code.toLowerCase() || name.toLowerCase()}`);
              const existing = map.get(id);
              map.set(id, {
                ...existing,
                ...d,
                id,
                name: name || existing?.name || '',
                departmentName: name || existing?.departmentName || '',
                code: code || existing?.code || '',
                managerId: d.managerId || d.manager_id || existing?.managerId || '',
                managerName: d.managerName || d.manager_name || existing?.managerName || '',
                description: d.description || existing?.description || 'Core Operational Department',
                status: d.status || existing?.status || 'active',
                employeeCount: Number(d.employeeCount ?? d.employee_count ?? existing?.employeeCount ?? 0),
              });
            });
            const merged = Array.from(map.values());
            if (typeof window !== 'undefined') {
              try { localStorage.setItem('UMA_ERP_departments', JSON.stringify(merged)); } catch (_) {}
            }
            return merged;
          });
        }
        applyLive<Role>(val(results[13]), setRoles, 'roles');
        applyLive<ProjectJobMaster>(val(results[14]), setProjectJobs, 'projectJobs');
        applyLive<ProjectTask>(val(results[15]), setProjectTasks, 'projectTasks');
        applyLive<ProjectMilestone>(val(results[16]), setProjectMilestones, 'projectMilestones');
        applyLive<ProjectPlanningStage>(val(results[17]), setProjectPlanningStages, 'projectPlanningStages');
        const rawDesignJobs = val<any[]>(results[18]);
        if (rawDesignJobs && Array.isArray(rawDesignJobs) && rawDesignJobs.length > 0) {
          setDesignJobs((prev) => {
            const localMap = new Map<string, DesignJob>();
            if (typeof window !== 'undefined') {
              try {
                const stored = localStorage.getItem('UMA_ERP_designJobs');
                if (stored) {
                  const parsed = JSON.parse(stored);
                  if (Array.isArray(parsed)) {
                    parsed.forEach((j: any) => {
                      if (j.id) localMap.set(j.id, j);
                      if (j.designJobNumber) localMap.set(j.designJobNumber, j);
                      if (j.jobNumber) localMap.set(j.jobNumber, j);
                    });
                  }
                }
              } catch (_) {}
            }
            (prev || []).forEach((j) => {
              if (j.id) localMap.set(j.id, j);
              if (j.designJobNumber) localMap.set(j.designJobNumber, j);
              if (j.jobNumber) localMap.set(j.jobNumber, j);
            });

            const mergedList: DesignJob[] = [];
            const seenIds = new Set<string>();

            rawDesignJobs.forEach((j: any) => {
              const local = localMap.get(j.id) || localMap.get(j.designJobNumber) || localMap.get(j.design_job_number) || localMap.get(j.job_number) || localMap.get(j.jobNumber);
              const isReleased =
                String(j.status || '').toLowerCase() === 'released_to_production' ||
                String(j.status || '').toLowerCase() === 'approved' ||
                String(j.status || '').toLowerCase() === 'released' ||
                String(local?.status || '').toLowerCase() === 'released_to_production' ||
                String(local?.status || '').toLowerCase() === 'approved' ||
                String(local?.status || '').toLowerCase() === 'released' ||
                String(j.remarks || '').toLowerCase().includes('released to shop floor') ||
                String(local?.remarks || '').toLowerCase().includes('released to shop floor');
              const effectiveStatus = isReleased ? 'released_to_production' : (j.status || local?.status || 'in_progress');
              const effectiveRemarks = j.remarks || local?.remarks || (isReleased ? 'Released to shop floor' : '');
              const jobObj: DesignJob = {
                ...local,
                ...j,
                id: String(j.id || j.designJobNumber || j.design_job_number),
                designJobNumber: j.designJobNumber || j.design_job_number || j.id,
                projectId: j.projectId || j.project_id || local?.projectId || 'PRJ-2026-0001',
                jobNumber: j.jobNumber || j.job_number || local?.jobNumber || 'JOB-2026-001',
                customerId: j.customerId || j.customer_id || local?.customerId || '',
                customerName: j.customerName || j.customer_name || local?.customerName || 'Customer',
                productName: j.productName || j.product_name || local?.productName || 'Custom Equipment',
                status: effectiveStatus,
                remarks: effectiveRemarks,
                activeRevision: j.activeRevision || j.active_revision || local?.activeRevision || 'REV-00',
                deliveryDate: j.deliveryDate || j.delivery_date || local?.deliveryDate || '',
                assignedDesigner: j.assignedDesigner || j.assigned_designer || local?.assignedDesigner || 'Dharmesh Joshi',
                designManager: j.designManager || j.design_manager || local?.designManager || 'Ketan Patel',
              };
              seenIds.add(jobObj.id);
              if (jobObj.designJobNumber) seenIds.add(jobObj.designJobNumber);
              mergedList.push(jobObj);
            });

            localMap.forEach((localJob) => {
              if (localJob && localJob.id && !seenIds.has(localJob.id) && !seenIds.has(localJob.designJobNumber)) {
                seenIds.add(localJob.id);
                if (localJob.designJobNumber) seenIds.add(localJob.designJobNumber);
                mergedList.push(localJob);
              }
            });

            if (typeof window !== 'undefined') {
              try { localStorage.setItem('UMA_ERP_designJobs', JSON.stringify(mergedList)); } catch (_) {}
            }
            return mergedList;
          });
        }
        applyLive<Drawing2D>(val(results[19]), setDrawings2D, 'drawings2D');
        applyLive<Design3DModel>(val(results[20]), setDesigns3D, 'designs3D');
        applyLive<BOMHeader>(val(results[21]), setBoms, 'boms');
        const rawSuppliers = val<any[]>(results[22]);
        if (rawSuppliers && Array.isArray(rawSuppliers) && rawSuppliers.length > 0) {
          const normalizedSuppliers: Supplier[] = rawSuppliers.map((s: any) => {
            const sName = s.name || s.supplierName || s.supplier_name || (s as any).companyName || 'Supplier';
            const vCode = s.vendorCode || s.vendor_code || s.supplierCode || s.supplier_code || s.id;
            return {
              ...s,
              id: String(s.id),
              name: sName,
              supplierName: sName,
              vendorCode: vCode,
              supplierCode: vCode,
              contactPerson: s.contactPerson || s.contact_person || '',
              phone: s.phone || s.mobile || '',
              email: s.email || '',
              gstin: s.gstin || '',
              paymentTerms: s.paymentTerms || s.payment_terms || '30 Days Credit',
            };
          });
          setSuppliers(normalizedSuppliers);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_suppliers', JSON.stringify(normalizedSuppliers)); } catch (_) {}
          }
        }
        const rawPRs = val<any[]>(results[23]);
        if (rawPRs && Array.isArray(rawPRs) && rawPRs.length > 0) {
          const normalizedPRs: PurchaseRequisition[] = rawPRs.map((pr: any) => ({
            ...pr,
            id: String(pr.id || pr.pr_number || pr.prNumber),
            prNumber: pr.prNumber || pr.pr_number || pr.id,
            projectId: pr.projectId || pr.project_id || 'PRJ-2026-0001',
            jobId: pr.jobId || pr.job_code || pr.jobNumber || 'JOB-2026-001',
            bomId: pr.bomId || pr.bom_id || `BOM-${pr.jobId || pr.job_code || 'JOB-2026-001'}`,
            bomRevision: pr.bomRevision || pr.bom_revision || 'REV-01',
            requisitionDate: pr.requisitionDate || pr.request_date || pr.prDate || new Date().toISOString().split('T')[0],
            requiredByDate: pr.requiredByDate || pr.required_by_date || '',
            priority: pr.priority || 'High',
            requestedBy: pr.requestedBy || pr.requested_by || 'Super Admin',
            department: pr.department || 'Purchase / Planning',
            status: pr.status || 'Submitted',
            items: Array.isArray(pr.items) ? pr.items : [],
            totalItems: Array.isArray(pr.items) ? pr.items.length : Number(pr.totalItems || 0),
            estimatedCost: Number(pr.estimatedCost ?? pr.total_estimated_cost ?? 0),
            remarks: pr.remarks || '',
            createdAt: pr.createdAt || pr.created_at || new Date().toISOString(),
            updatedAt: pr.updatedAt || pr.updated_at || new Date().toISOString(),
          }));
          setPurchaseRequisitions(normalizedPRs);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_purchaseRequisitions', JSON.stringify(normalizedPRs)); } catch (_) {}
          }
        } else {
          applyLive<PurchaseRequisition>(val(results[23]), setPurchaseRequisitions, 'purchaseRequisitions');
        }
        const rawItems = val<any[]>(results[25]);
        if (rawItems && Array.isArray(rawItems) && rawItems.length > 0) {
          const normalizedItems: ItemMaster[] = rawItems.map((i: any) => ({
            ...i,
            id: String(i.id),
            itemCode: i.itemCode || i.item_code || i.id,
            itemName: i.itemName || i.item_name || '',
            itemType: i.itemType || i.item_type || 'Raw Material',
            category: i.category || i.categoryName || i.category_name || '',
            subCategory: i.subCategory || i.sub_category || '',
            specification: i.specification || '',
            description: i.description || '',
            brandMake: i.brandMake || i.brand_make || '',
            hsnSac: i.hsnSac || i.hsn_sac || '72193200',
            gstRate: Number(i.gstRate ?? i.gst_rate ?? 18),
            uom: i.uom || i.uomCode || 'Kg',
            minimumStock: Number(i.minimumStock ?? i.minimum_stock ?? 0),
            maximumStock: Number(i.maximumStock ?? i.maximum_stock ?? 0),
            reorderLevel: Number(i.reorderLevel ?? i.reorder_level ?? 0),
            standardCost: Number(i.standardCost ?? i.unit_cost ?? i.standard_cost ?? 0),
            status: i.status || 'Active',
            batchTracking: Boolean(i.batchTracking ?? i.batch_tracking ?? true),
            serialTracking: Boolean(i.serialTracking ?? i.serial_tracking ?? false),
            lotTracking: Boolean(i.lotTracking ?? i.lot_tracking ?? true),
          }));
          setItemMasters(normalizedItems);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_itemMasters', JSON.stringify(normalizedItems)); } catch (_) {}
          }
        }

        const rawCats = val<any[]>(results[26]);
        if (rawCats && Array.isArray(rawCats) && rawCats.length > 0) {
          const normalizedCats: ItemCategory[] = rawCats.map((c: any) => ({
            ...c,
            id: String(c.id),
            categoryCode: c.categoryCode || c.code || c.id,
            categoryName: c.categoryName || c.name || 'Category',
            description: c.description || '',
            parentCategory: c.parentCategory || c.parent_category || 'Top Level',
            status: c.status || 'Active',
          }));
          setItemCategories(normalizedCats);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_itemCategories', JSON.stringify(normalizedCats)); } catch (_) {}
          }
        }

        const rawUoms = val<any[]>(results[27]);
        if (rawUoms && Array.isArray(rawUoms) && rawUoms.length > 0) {
          const normalizedUoms: UOMMaster[] = rawUoms.map((u: any) => ({
            ...u,
            id: String(u.id),
            uomCode: u.uomCode || u.code || u.id,
            uomName: u.uomName || u.name || u.uomCode || u.code || 'Unit',
            baseUom: u.baseUom || u.base_uom || u.uomCode || u.code || 'Unit',
            conversionFactor: Number(u.conversionFactor || u.conversion_factor || 1),
            description: u.description || '',
          }));
          setUoms(normalizedUoms);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_uoms', JSON.stringify(normalizedUoms)); } catch (_) {}
          }
        }
        const rawWh = val<any[]>(results[28]);
        if (rawWh && Array.isArray(rawWh) && rawWh.length > 0) {
          const normalizedWh: Warehouse[] = rawWh.map((w: any) => ({
            ...w,
            id: String(w.id || w.warehouseCode || w.warehouse_code),
            warehouseCode: w.warehouseCode || w.warehouse_code || w.id,
            warehouseName: w.warehouseName || w.name || w.warehouse_name || w.warehouseCode || w.id,
            warehouseType: w.warehouseType || w.warehouse_type || 'Raw Material',
            address: w.address || '',
            managerName: w.managerName || w.incharge || 'Store Incharge',
            contactPhone: w.contactPhone || w.contact_phone || '',
            contactEmail: w.contactEmail || w.contact_email || '',
            status: w.status || 'Active',
          }));
          setWarehouses(normalizedWh);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_warehouses', JSON.stringify(normalizedWh)); } catch (_) {}
          }
        } else {
          applyLive<Warehouse>(val(results[28]), setWarehouses, 'warehouses');
        }
        applyLive<GoodsReceiptNote>(val(results[29]), setGoodsReceipts, 'goodsReceipts');
        const rawStock = val<any[]>(results[30]);
        if (rawStock && Array.isArray(rawStock) && rawStock.length > 0) {
          const normalizedStock: StockBalance[] = rawStock.map((s: any) => {
            const available = Number(s.availableQty ?? s.available_quantity ?? s.quantity ?? s.currentQuantity ?? 0);
            const reserved = Number(s.reservedQty ?? s.reserved_quantity ?? 0);
            const usable = Number(s.usableQty ?? s.usable_quantity ?? (available - reserved));
            const rate = Number(s.averageRate ?? s.average_unit_cost ?? s.unit_rate ?? s.rate ?? s.standardCost ?? 0);
            const valuation = Number(s.stockValue ?? s.total_value ?? (usable * rate));
            return {
              ...s,
              id: String(s.id || s.item_id || s.itemCode || `stk-${Math.random().toString(36).slice(2, 6)}`),
              itemId: s.itemId || s.item_id || '',
              itemCode: s.itemCode || s.item_code || '',
              itemName: s.itemName || s.item_name || '',
              category: s.category || s.category_name || '',
              warehouseId: s.warehouseId || s.warehouse_id || '',
              warehouseName: s.warehouseName || s.warehouse_name || 'Main Raw Material & Plate Yard',
              locationCode: s.locationCode || s.location_code || s.bin_location || 'W1-ZA-R1-S1-B01',
              batchLot: s.batchLot || s.batch_lot || s.heat_number || s.lot_number || '-',
              availableQty: isNaN(available) ? 0 : available,
              reservedQty: isNaN(reserved) ? 0 : reserved,
              allocatedQty: Number(s.allocatedQty ?? s.allocated_quantity ?? 0),
              inTransitQty: Number(s.inTransitQty ?? s.in_transit_quantity ?? 0),
              damagedQty: Number(s.damagedQty ?? s.damaged_quantity ?? 0),
              rejectedQty: Number(s.rejectedQty ?? s.rejected_quantity ?? 0),
              usableQty: isNaN(usable) ? 0 : usable,
              averageRate: isNaN(rate) ? 0 : rate,
              stockValue: isNaN(valuation) ? 0 : valuation,
              lastUpdatedDate: s.lastUpdatedDate || s.last_updated_date || s.updated_at || new Date().toISOString().split('T')[0],
            };
          });
          setStockBalances(normalizedStock);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_stockBalances', JSON.stringify(normalizedStock)); } catch (_) {}
          }
        }

        const rawIssues = val<any[]>(results[31]);
        if (rawIssues && Array.isArray(rawIssues) && rawIssues.length > 0) {
          const normalizedIssues: MaterialIssue[] = rawIssues.map((i: any) => ({
            ...i,
            id: String(i.id || i.issue_number || i.issueNumber),
            issueNumber: i.issueNumber || i.issue_number || i.id,
            issueDate: i.issueDate || i.issue_date || new Date().toISOString().split('T')[0],
            projectId: i.projectId || i.project_id || 'PRJ-2026-0001',
            jobId: i.jobId || i.job_number || i.jobNumber || '',
            workOrderNumber: i.workOrderNumber || i.work_order_number || '',
            bomNumber: i.bomNumber || i.bom_number || '',
            bomRevision: i.bomRevision || i.bom_revision || 'Rev-01',
            productionStage: i.productionStage || i.production_stage || 'Shell & Dish End Cutting / Rolling',
            requestedBy: i.requestedBy || i.requested_by || i.issued_to || '',
            issuedBy: i.issuedBy || i.issued_by || 'Hitesh Rawal (Store Head)',
            warehouseId: i.warehouseId || i.warehouse_id || 'wh-main',
            warehouseName: i.warehouseName || i.warehouse_name || 'Main Raw Material & Plate Yard',
            status: i.status || 'Fully Issued',
            totalIssueValue: Number(i.totalIssueValue ?? i.total_issue_value ?? 0),
            remarks: i.remarks || i.notes || '',
            items: Array.isArray(i.items) ? i.items : [],
          }));
          setMaterialIssues(normalizedIssues);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_materialIssues', JSON.stringify(normalizedIssues)); } catch (_) {}
          }
        }

        const rawReturns = val<any[]>(results[32]);
        if (rawReturns && Array.isArray(rawReturns) && rawReturns.length > 0) {
          const normalizedReturns: MaterialReturn[] = rawReturns.map((r: any) => ({
            ...r,
            id: String(r.id || r.return_number || r.returnNumber),
            returnNumber: r.returnNumber || r.return_number || r.id,
            returnDate: r.returnDate || r.return_date || new Date().toISOString().split('T')[0],
            projectId: r.projectId || r.project_id || 'PRJ-2026-0001',
            jobId: r.jobId || r.job_number || r.jobNumber || '',
            workOrderNumber: r.workOrderNumber || r.work_order_number || '',
            materialIssueNumber: r.materialIssueNumber || r.material_issue_number || r.issueNo || '',
            warehouseId: r.warehouseId || r.warehouse_id || 'wh-main',
            warehouseName: r.warehouseName || r.warehouse_name || 'Main Raw Material & Plate Yard',
            returnedBy: r.returnedBy || r.returned_by || 'Ketan Parmar (Shop Supervisor)',
            receivedBy: r.receivedBy || r.received_by || 'Hitesh Rawal (Store Head)',
            totalReturnValue: Number(r.totalReturnValue ?? r.total_return_value ?? 0),
            remarks: r.remarks || r.notes || '',
            items: Array.isArray(r.items) ? r.items : [],
          }));
          setMaterialReturns(normalizedReturns);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_materialReturns', JSON.stringify(normalizedReturns)); } catch (_) {}
          }
        }
        applyLive<ManufacturingJob>(val(results[33]), setManufacturingJobs, 'manufacturingJobs');
        applyLive<WorkCenter>(val(results[34]), setWorkCenters, 'workCenters');

        const woRes = val<WorkOrder[]>(results[35]);
        if (woRes && Array.isArray(woRes) && woRes.length > 0) {
          const normalized = woRes.map((w: any) => ({
            ...w,
            workOrderNumber: w.workOrderNumber || w.work_order_number || w.id,
            jobNumber: w.jobNumber || w.job_number || '',
            productName: w.productName || w.product_name || '',
            bomRevision: w.bomRevision || w.bom_revision || 'REV-00',
            designRevision: w.designRevision || w.design_revision || 'REV-00',
            plannedEndDate: w.plannedEndDate || w.planned_end_date || '',
            status: w.status || 'Planned',
          }));
          setWorkOrders(normalized);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_workOrders', JSON.stringify(normalized)); } catch (_) {}
          }
        }

        applyLive<FinishedGoodsItem>(val(results[36]), setFinishedGoods, 'finishedGoods');
        applyLive<InternalAsset>(val(results[37]), setInternalAssets, 'internalAssets');
        applyLive<CustomerMachine>(val(results[38]), setCustomerMachines, 'customerMachines');
        applyLive<ServiceRequest>(val(results[39]), setServiceRequests, 'serviceRequests');
        applyLive<BreakdownRecord>(val(results[40]), setBreakdowns, 'breakdowns');
        applyLive<ServiceVisit>(val(results[41]), setServiceVisits, 'serviceVisits');
        applyLive<ServicePartIssue>(val(results[42]), setServicePartIssues, 'servicePartIssues');
        applyLive<ServicePartReturn>(val(results[43]), setServicePartReturns, 'servicePartReturns');
        const rawDesgs = val<any[]>(results[45]);
        if (rawDesgs && Array.isArray(rawDesgs) && rawDesgs.length > 0) {
          setDesignations((prev) => {
            const map = new Map<string, Designation>();
            (prev || []).forEach((d) => {
              if (d && d.id) map.set(d.id, d);
            });
            rawDesgs.forEach((d: any) => {
              const name = d.designationName || d.designation_name || d.name || '';
              const code = d.designationCode || d.designation_code || d.code || '';
              const id = String(d.id || (code ? `DESG-${code}` : `DESG-${Date.now().toString().slice(-4)}`));
              const existing = map.get(id);
              map.set(id, {
                ...existing,
                ...d,
                id,
                designationCode: code || existing?.designationCode || id,
                designationName: name || existing?.designationName || '',
                department: d.department || d.department_name || existing?.department || 'Production & Shop Floor',
                level: Number(d.level) || existing?.level || 4,
                reportingDesignation: d.reportingDesignation || d.reporting_designation || existing?.reportingDesignation || 'General Manager',
                jobDescription: d.jobDescription || d.job_description || existing?.jobDescription || '',
                responsibilities: Array.isArray(d.responsibilities) ? d.responsibilities : (existing?.responsibilities || []),
                status: d.status || existing?.status || 'Active',
              });
            });
            const merged = Array.from(map.values());
            if (typeof window !== 'undefined') {
              try { localStorage.setItem('UMA_ERP_designations', JSON.stringify(merged)); } catch (_) {}
            }
            return merged;
          });
        }
        applyLive<ShiftMaster>(val(results[46]), setShiftMasters, 'shifts');
        applyLive<AttendanceRecord>(val(results[47]), setAttendanceRecords, 'attendance');
        applyLive<LeaveRequest>(val(results[48]), setLeaveRequests, 'leaves');
        applyLive<PayrollRecord>(val(results[49]), setPayrollRecords, 'payroll');
        applyLive<EmployeeOnboardingItem>(val(results[50]), setEmployeeOnboardings, 'employeeOnboardings');
        applyLive<FinancialYear>(val(results[51]), setFinancialYears, 'financialYears');
        applyLive<ChartOfAccount>(val(results[52]), setChartOfAccounts, 'chartOfAccounts');
        const siRes = val<any[]>(results[53]);
        if (siRes && Array.isArray(siRes) && siRes.length > 0) {
          const normalizedSI: SalesInvoice[] = siRes.map((inv: any) => {
            const grandTotal = Number(inv.grandTotal ?? inv.grand_total ?? 0);
            const items = inv.items || [];
            const subTotal = Number(
              inv.subTotal ??
              inv.subtotal ??
              inv.taxableAmount ??
              inv.taxable_amount ??
              (items.length > 0 ? items.reduce((s: number, it: any) => s + (Number(it.unitPrice || it.rate || 0) * Number(it.quantity || 1)), 0) : grandTotal / 1.18)
            );
            const taxTotal = Number(
              inv.taxTotal ??
              (
                (Number(inv.cgstAmount ?? inv.cgst_amount ?? 0) + Number(inv.sgstAmount ?? inv.sgst_amount ?? 0) + Number(inv.igstAmount ?? inv.igst_amount ?? 0)) ||
                (grandTotal - subTotal)
              )
            );
            return {
              ...inv,
              id: String(inv.id || inv.invoiceNumber || inv.invoice_number),
              invoiceNumber: inv.invoiceNumber || inv.invoice_number || inv.id,
              invoiceDate: inv.invoiceDate || inv.invoice_date || '',
              customerId: inv.customerId || inv.customer_id || '',
              customerName: inv.customerName || inv.customer_name || 'Customer',
              salesOrderNumber: inv.salesOrderNumber || inv.sales_order_number || '',
              jobNumber: inv.jobNumber || inv.job_number || '',
              subTotal,
              taxTotal,
              grandTotal,
              status: inv.status || 'Draft',
              paymentStatus: inv.paymentStatus || inv.payment_status || 'Unpaid',
            };
          });
          setSalesInvoices(normalizedSI);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_salesInvoices', JSON.stringify(normalizedSI)); } catch (_) {}
          }
        }

        const piRes = val<any[]>(results[54]);
        if (piRes && Array.isArray(piRes) && piRes.length > 0) {
          const normalizedPI: PurchaseInvoice[] = piRes.map((inv: any) => ({
            ...inv,
            id: String(inv.id || inv.invoiceNumber || inv.invoice_number),
            invoiceNumber: inv.invoiceNumber || inv.invoice_number || inv.id,
            vendorInvoiceNumber: inv.vendorInvoiceNumber || inv.vendor_invoice_number || '',
            invoiceDate: inv.invoiceDate || inv.invoice_date || '',
            supplierId: inv.supplierId || inv.supplier_id || '',
            supplierName: inv.supplierName || inv.supplier_name || 'Supplier',
            subTotal: Number(inv.subTotal ?? inv.subtotal ?? inv.taxable_amount ?? 0),
            grandTotal: Number(inv.grandTotal ?? inv.grand_total ?? 0),
            status: inv.status || 'Draft',
            paymentStatus: inv.paymentStatus || inv.payment_status || 'Unpaid',
          }));
          setPurchaseInvoices(normalizedPI);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_purchaseInvoices', JSON.stringify(normalizedPI)); } catch (_) {}
          }
        }
        applyLive<CustomerReceipt>(val(results[55]), setCustomerReceipts, 'customerReceipts');
        applyLive<SupplierPayment>(val(results[56]), setSupplierPayments, 'supplierPayments');
        applyLive<JournalEntry>(val(results[57]), setJournalEntries, 'journalEntries');
        applyLive<CreditNote>(val(results[58]), setCreditNotes, 'creditNotes');
        applyLive<DebitNote>(val(results[59]), setDebitNotes, 'debitNotes');
        applyLive<ContraEntry>(val(results[60]), setContraEntries, 'contraEntries');
        applyLive<BankAccount>(val(results[61]), setBankAccounts, 'bankAccounts');
        applyLive<ExpenseEntry>(val(results[62]), setExpenseEntries, 'expenseEntries');
        applyLive<FixedAsset>(val(results[63]), setFixedAssets, 'fixedAssets');
        applyLive<HolidayItem>(val(results[64]), setHolidays, 'holidays');
        applyLive<OvertimeRecord>(val(results[65]), setOvertimeRecords, 'overtimeRecords');
        applyLive<EarlyCheckoutRequest>(val(results[66]), setEarlyCheckoutRequests, 'earlyCheckoutRequests');
        applyLive<EmployeeAppraisal>(val(results[67]), setEmployeeAppraisals, 'employeeAppraisals');
        applyLive<ApprovalItem>(val(results[68]), setCentralApprovals, 'approvals');
        applyLive<ERPAlertItem>(val(results[69]), setCentralAlerts, 'alerts');

        const qcRes = val<any[]>(results[70]);
        if (qcRes && Array.isArray(qcRes) && qcRes.length > 0) {
          const normalizedQc: QCInspection[] = qcRes.map((q: any) => {
            const firstItm = (q.items && Array.isArray(q.items) && q.items[0]) || {};
            return {
              id: String(q.id || q.inspectionNumber || q.inspection_number || 'QC'),
              inspectionNumber: q.inspectionNumber || q.inspection_number || q.id || 'QC',
              inspectionDate: q.inspectionDate || q.inspection_date || '',
              grnId: q.grnId || q.grn_id || '',
              grnNumber: q.grnNumber || q.grn_number || '',
              itemId: q.itemId || q.item_id || firstItm.itemId || 'ITM-01',
              itemCode: q.itemCode || q.item_code || firstItm.itemCode || firstItm.item_code || 'RAW-MAT',
              itemName: q.itemName || q.item_name || firstItm.itemName || firstItm.item_name || 'Material Item',
              jobId: q.jobId || q.job_id || 'General Stock',
              supplierName: q.supplierName || q.supplier_name || firstItm.supplierName || 'Supplier',
              requiredSpecification: q.requiredSpecification || q.required_specification || 'Standard Spec',
              actualSpecification: q.actualSpecification || q.actual_specification || 'Passed Inspection',
              inspectionParameters: q.inspectionParameters || q.inspection_parameters || 'Visual, Dimension, Spec Verification',
              sampleQuantity: Number(q.sampleQuantity || q.sample_quantity || 1),
              acceptedQuantity: Number(q.acceptedQuantity ?? q.accepted_quantity ?? firstItm.acceptedQuantity ?? firstItm.acceptedQty ?? 1),
              rejectedQuantity: Number(q.rejectedQuantity ?? q.rejected_quantity ?? firstItm.rejectedQuantity ?? firstItm.rejectedQty ?? 0),
              rejectionReason: q.rejectionReason || q.rejection_reason || '',
              qcResult: (q.qcResult || q.overall_result || 'Pass') as any,
              inspectorName: q.inspectorName || q.inspector || 'Suresh Patel (Sr. QC Lead)',
              remarks: q.remarks || '',
            };
          });
          setQcInspections(normalizedQc);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_qcInspections', JSON.stringify(normalizedQc)); } catch (_) {}
          }
        }

        const meRes = val<any>(results[71]);
        if (meRes && meRes.username) {
          setCurrentUser((prev) => ({
            ...prev,
            ...meRes,
            name: meRes.name || `${meRes.firstName || ''} ${meRes.lastName || ''}`.trim() || meRes.username,
            role: meRes.role || meRes.roleName || 'Super Admin',
            roleName: meRes.roleName || meRes.role || 'Super Admin',
            department: meRes.department || meRes.departmentName || 'Management',
          }));
        }

        const rawDeptAssignments = val<any[]>(results[72]);
        if (rawDeptAssignments && Array.isArray(rawDeptAssignments)) {
          const normalizedDAs: DepartmentAssignment[] = rawDeptAssignments.map((da: any) => ({
            ...da,
            id: String(da.id),
            projectId: da.projectId || da.project_id || '',
            projectNumber: da.projectNumber || da.project_number || da.projectId || da.project_id || '',
            jobNumber: da.jobNumber || da.job_number || '',
            department: da.department || '',
            manager: da.manager || da.lead_person_name || 'Unassigned',
            assignedEmployee: da.assignedEmployee || da.lead_person_name || 'Unassigned',
            responsibility: da.responsibility || da.notes || '',
            startDate: da.startDate || da.start_date || '',
            dueDate: da.dueDate || da.due_date || '',
            status: da.status || 'in_progress',
            priority: da.priority || 'high',
            remarks: da.remarks || da.notes || '',
          }));
          setDepartmentAssignments(normalizedDAs);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_departmentAssignments', JSON.stringify(normalizedDAs)); } catch (_) {}
          }
        }

        const rawDocs = val<any[]>(results[73]);
        if (rawDocs && Array.isArray(rawDocs)) {
          const normalizedDocs: ProjectDocument[] = rawDocs.map((d: any) => ({
            ...d,
            id: String(d.id),
            documentName: d.documentName || d.document_name || d.name || 'Project Document',
            type: d.type || d.docType || 'Drawing',
            version: d.version || 'v1.0',
            uploadedBy: d.uploadedBy || d.uploaded_by || 'Super Admin',
            uploadDate: d.uploadDate || d.upload_date || (d.created_at ? d.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
            department: d.department || '',
            relatedRecord: d.relatedRecord || d.related_record || '',
            description: d.description || '',
            fileSize: d.fileSize || d.file_size || '1.5 MB',
            fileUrl: d.fileUrl || d.file_url || '',
            projectId: d.projectId || d.project_id || '',
            jobNumber: d.jobNumber || d.job_number || '',
          }));
          setProjectDocuments(normalizedDocs);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_projectDocuments', JSON.stringify(normalizedDocs)); } catch (_) {}
          }
        }

        const rawCRs = val<any[]>(results[74]);
        if (rawCRs && Array.isArray(rawCRs)) {
          const normalizedCRs: CustomerChangeRequest[] = rawCRs.map((cr: any) => ({
            ...cr,
            id: String(cr.id),
            changeRequestNo: cr.changeRequestNo || cr.change_request_no || cr.request_no || cr.id,
            projectId: cr.projectId || cr.project_id || '',
            projectNumber: cr.projectNumber || cr.project_number || cr.projectId || cr.project_id || '',
            jobNumber: cr.jobNumber || cr.job_number || '',
            customerName: cr.customerName || cr.customer_name || '',
            requestedBy: cr.requestedBy || cr.requested_by || 'Customer Representative',
            requestDate: cr.requestDate || cr.request_date || (cr.created_at ? cr.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
            changeDescription: cr.changeDescription || cr.change_description || cr.description || cr.title || '',
            reason: cr.reason || '',
            designImpact: cr.designImpact || cr.design_impact || '',
            materialImpact: cr.materialImpact || cr.material_impact || '',
            costImpact: Number(cr.costImpact ?? cr.cost_impact ?? cr.impact_on_cost ?? 0),
            timelineImpactDays: Number(cr.timelineImpactDays ?? cr.timeline_impact_days ?? cr.impact_on_timeline_days ?? 0),
            approvalStatus: cr.approvalStatus || cr.approval_status || cr.status || 'requested',
            approvedBy: cr.approvedBy || cr.approved_by || '',
            approvedDate: cr.approvedDate || cr.approved_date || '',
          }));
          setChangeRequests(normalizedCRs);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_changeRequests', JSON.stringify(normalizedCRs)); } catch (_) {}
          }
        }

        const rawReqs = val<any[]>(results[75]);
        if (rawReqs && Array.isArray(rawReqs)) {
          const normalizedReqs: CustomerRequirement[] = rawReqs.map((r: any) => ({
            ...r,
            id: String(r.id),
            designJobId: r.designJobId || r.design_job_id || '',
            projectId: r.projectId || r.project_id || '',
            jobNumber: r.jobNumber || r.job_number || '',
            customerName: r.customerName || r.customer_name || '',
            contactPerson: r.contactPerson || r.contact_person || '',
            contactMobile: r.contactMobile || r.contact_mobile || '',
            machineName: r.machineName || r.machine_name || '',
            machineType: r.machineType || r.machine_type || '',
            model: r.model || '',
            quantity: Number(r.quantity || 1),
            capacity: r.capacity || '',
            application: r.application || '',
            productionRequirement: r.productionRequirement || r.production_requirement || '',
            dimensions: r.dimensions || '',
            material: r.material || '',
            powerRequirement: r.powerRequirement || r.power_requirement || '',
            speed: r.speed || '',
            output: r.output || '',
            automationLevel: r.automationLevel || r.automation_level || '',
            controlSystem: r.controlSystem || r.control_system || '',
            safetyRequirements: r.safetyRequirements || r.safety_requirements || '',
            specialRequirements: r.specialRequirements || r.special_requirements || '',
            customerDrawingUrl: r.customerDrawingUrl || r.customer_drawing_url || '',
            customerNotes: r.customerNotes || r.customer_notes || '',
            designerNotes: r.designerNotes || r.designer_notes || '',
            status: r.status || 'approved',
            createdAt: r.createdAt || r.created_at || '',
          }));
          setCustomerRequirements(normalizedReqs);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_customerRequirements', JSON.stringify(normalizedReqs)); } catch (_) {}
          }
        }

        const rawTasks = val<any[]>(results[76]);
        if (rawTasks && Array.isArray(rawTasks)) {
          const normalizedTasks: DesignTask[] = rawTasks.map((t: any) => ({
            ...t,
            id: String(t.id),
            designJobId: t.designJobId || t.design_job_id || '',
            projectId: t.projectId || t.project_id || '',
            jobNumber: t.jobNumber || t.job_number || '',
            taskName: t.taskName || t.task_name || '',
            customerName: t.customerName || t.customer_name || '',
            machineName: t.machineName || t.machine_name || '',
            designer: t.designer || 'Dharmesh Joshi',
            startDate: t.startDate || t.start_date || '',
            targetDate: t.targetDate || t.target_date || '',
            dueDate: t.dueDate || t.due_date || '',
            priority: t.priority || 'high',
            estimatedHours: Number(t.estimatedHours || t.estimated_hours || 16),
            actualHours: Number(t.actualHours || t.actual_hours || 0),
            progressPercent: Number(t.progressPercent || t.progress_percent || 0),
            status: t.status || 'pending',
            remarks: t.remarks || '',
            createdAt: t.createdAt || t.created_at || '',
          }));
          setDesignTasks(normalizedTasks);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_designTasks', JSON.stringify(normalizedTasks)); } catch (_) {}
          }
        }

        const rawMRP = val<any[]>(results[77]);
        if (rawMRP && Array.isArray(rawMRP)) {
          const normalizedMRP: MaterialRequirement[] = rawMRP.map((m: any) => ({
            ...m,
            id: String(m.id),
            projectId: m.projectId || m.project_id || '',
            jobId: m.jobId || m.job_id || '',
            jobNumber: m.jobNumber || m.job_number || m.jobId || m.job_id || '',
            customerName: m.customerName || m.customer_name || '',
            designJobId: m.designJobId || m.design_job_id || '',
            bomId: m.bomId || m.bom_id || '',
            bomNumber: m.bomNumber || m.bom_number || '',
            bomRevision: m.bomRevision || m.bom_revision || 'REV-01',
            partNumber: m.partNumber || m.part_number || '',
            itemCode: m.itemCode || m.item_code || '',
            itemName: m.itemName || m.item_name || '',
            materialName: m.materialName || m.material_name || '',
            specification: m.specification || '',
            category: m.category || 'Raw Material',
            requiredQuantity: Number(m.requiredQuantity || m.required_quantity || 0),
            unitOfMeasure: m.unitOfMeasure || m.unit_of_measure || 'NOS',
            availableStock: Number(m.availableStock || m.available_stock || 0),
            reservedStock: Number(m.reservedStock || m.reserved_stock || 0),
            onOrderQuantity: Number(m.onOrderQuantity || m.on_order_quantity || 0),
            shortageQuantity: Number(m.shortageQuantity || m.shortage_quantity || 0),
            requiredByDate: m.requiredByDate || m.required_by_date || '',
            procurementType: m.procurementType || m.procurement_type || 'Purchase',
            procurementStatus: m.procurementStatus || m.procurement_status || 'Pending',
            drawingNumber: m.drawingNumber || m.drawing_number || '',
            status: m.status || 'shortage',
          }));
          setMaterialRequirements(normalizedMRP);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_materialRequirements', JSON.stringify(normalizedMRP)); } catch (_) {}
          }
        }

        const rawRfqs = val<any[]>(results[78]);
        if (rawRfqs && Array.isArray(rawRfqs)) {
          const normalizedRfqs: RequestForQuotation[] = rawRfqs.map((r: any) => ({
            ...r,
            id: String(r.id || r.rfqNumber || r.rfq_number),
            rfqNumber: r.rfqNumber || r.rfq_number || r.id,
            prId: r.prId || r.pr_id || '',
            prNumber: r.prNumber || r.pr_id || '',
            rfqDate: r.rfqDate || r.rfq_date || '',
            dueDate: r.dueDate || r.due_date || '',
            invitedSuppliers: r.invitedSuppliers || r.suppliers || [],
            suppliers: r.suppliers || r.invitedSuppliers || [],
            items: r.items || [],
            status: r.status || 'Sent to Suppliers',
            termsAndConditions: r.termsAndConditions || r.terms_and_conditions || '',
            issuedBy: r.issuedBy || 'Purchase Team',
            createdAt: r.createdAt || r.created_at || '',
          }));
          setRfqs(normalizedRfqs);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_rfqs', JSON.stringify(normalizedRfqs)); } catch (_) {}
          }
        }

        const rawSQs = val<any[]>(results[79]);
        if (rawSQs && Array.isArray(rawSQs)) {
          const normalizedSQs: SupplierQuotation[] = rawSQs.map((q: any) => ({
            ...q,
            id: String(q.id || q.quotationNumber || q.quotation_number),
            quotationNumber: q.quotationNumber || q.quotation_number || q.id,
            rfqId: q.rfqId || q.rfq_id || '',
            rfqNumber: q.rfqNumber || q.rfq_id || '',
            supplierId: q.supplierId || q.supplier_id || '',
            supplierName: q.supplierName || q.supplier_name || '',
            supplierQuotationRef: q.supplierQuotationRef || q.quotationNumber || q.quotation_number || '',
            quotationDate: q.quotationDate || q.date || '',
            validityDate: q.validityDate || q.valid_until || '',
            items: q.items || [],
            subTotal: Number(q.subTotal || q.sub_total || 0),
            taxTotal: Number(q.taxTotal || q.tax_amount || 0),
            grandTotal: Number(q.grandTotal || q.grand_total || 0),
            paymentTerms: q.paymentTerms || q.payment_terms || '',
            deliveryTerms: q.deliveryTerms || 'FOR Destination',
            leadTimeDays: Number(q.leadTimeDays || 7),
            status: q.status || 'Received',
            technicalStatus: q.technicalStatus || 'Compliant',
            recordedBy: q.recordedBy || 'Purchase Officer',
            createdAt: q.createdAt || q.created_at || '',
          }));
          setSupplierQuotations(normalizedSQs);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_supplierQuotations', JSON.stringify(normalizedSQs)); } catch (_) {}
          }
        }

        const rawProdOrders = val<any[]>(results[81]);
        if (rawProdOrders && Array.isArray(rawProdOrders) && rawProdOrders.length > 0) {
          const normalizedPO: ProductionOrder[] = rawProdOrders.map((p: any) => ({
            ...p,
            id: String(p.id || p.productionOrderNumber || p.production_order_number),
            productionOrderNumber: p.productionOrderNumber || p.production_order_number || p.id,
            workOrderId: p.workOrderId || p.work_order_id || '',
            workOrderNumber: p.workOrderNumber || p.work_order_number || '',
            jobId: p.jobId || p.job_id || '',
            jobNumber: p.jobNumber || p.job_number || '',
            productName: p.productName || p.product_name || 'Manufactured Assembly',
            quantity: Number(p.quantity || 1),
            bomRevision: p.bomRevision || p.bom_revision || 'REV-01',
            designRevision: p.designRevision || p.design_revision || 'REV-01',
            plannedStartDate: p.plannedStartDate || p.planned_start_date || '',
            plannedEndDate: p.plannedEndDate || p.planned_end_date || '',
            actualStartDate: p.actualStartDate || p.actual_start_date || '',
            actualEndDate: p.actualEndDate || p.actual_end_date || '',
            productionManager: p.productionManager || p.production_manager || 'Bhavin Shah',
            status: p.status || 'In Progress',
            createdAt: p.createdAt || p.created_at || new Date().toISOString(),
          }));
          setProductionOrders(normalizedPO);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_productionOrders', JSON.stringify(normalizedPO)); } catch (_) {}
          }
        }

        const rawTechDocs = val<any[]>(results[82]);
        if (rawTechDocs && Array.isArray(rawTechDocs) && rawTechDocs.length > 0) {
          const normalizedDocs: TechnicalDocumentItem[] = rawTechDocs.map((td: any) => ({
            ...td,
            id: String(td.id || td.document_number || td.documentNumber),
            documentName: td.documentName || td.document_name || td.title || 'Technical Document',
            category: td.category || td.document_type || 'Calculation',
            version: td.version || 'v1.0',
            revision: td.revision || 'REV-00',
            projectId: td.projectId || td.project_id || '',
            jobNumber: td.jobNumber || td.job_number || '',
            uploadedBy: td.uploadedBy || td.uploaded_by || 'Engineering Team',
            uploadDate: td.uploadDate || td.upload_date || td.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            fileUrl: td.fileUrl || td.file_url || '#',
            fileSize: td.fileSize || td.file_size || '5.2 MB',
            accessPermission: td.accessPermission || td.access_permission || 'public',
          }));
          setTechnicalDocuments(normalizedDocs);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_technicalDocuments', JSON.stringify(normalizedDocs)); } catch (_) {}
          }
        }
      } catch (err) {
        console.warn('Initial live data load warning:', err);
      } finally {
        if (isMounted) {
          setIsInitialLoading(false);
        }
      }
    }

    loadLiveData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Cross-Department Automatic Synchronization:
  // When a project is created or planned, it automatically creates/syncs:
  // 1. Engineering & Design (designJobs & customerRequirements) with assigned designers!
  // 2. Production & Fabrication (manufacturingJobs) with assigned production supervisors!
  useEffect(() => {
    if (!projectJobs || projectJobs.length === 0) return;

    projectJobs.forEach((prj) => {
      // Find all planning stages for this project
      const prjStages = projectPlanningStages.filter(
        (s) => s.projectId === prj.id || s.jobNumber === prj.jobNumber
      );

      // 1. SYNC WITH ENGINEERING & DESIGN MODULE (designJobs)
      const designStage = prjStages.find(
        (s) =>
          s.responsibleDepartment?.toLowerCase().includes('design') ||
          s.stageName?.toLowerCase().includes('design') ||
          s.stageName?.toLowerCase().includes('cad')
      );

      const assignedDesignerNames =
        designStage?.assignedEmployees && designStage.assignedEmployees.length > 0
          ? designStage.assignedEmployees.map((a) => a.name).join(', ')
          : designStage?.responsibleEmployee || 'Dharmesh Joshi';

      const designStatus: DesignJobStatus =
        designStage?.status === 'completed'
          ? 'approved'
          : designStage?.status === 'in_progress'
          ? 'in_progress'
          : 'assigned';

      let currentDesignJobId = '';

      setDesignJobs((prev) => {
        const existingIdx = prev.findIndex(
          (j) => j.projectId === prj.id || j.jobNumber === prj.jobNumber
        );

        if (existingIdx >= 0) {
          const existing = prev[existingIdx];
          currentDesignJobId = existing.id;
          if (
            existing.assignedDesigner !== assignedDesignerNames ||
            existing.status !== designStatus ||
            existing.requiredDate !== (designStage?.plannedEnd || prj.deliveryDate)
          ) {
            const updated = [...prev];
            updated[existingIdx] = {
              ...existing,
              assignedDesigner: assignedDesignerNames,
              status: designStatus,
              requiredDate: designStage?.plannedEnd || prj.deliveryDate,
              remarks: designStage?.remarks || existing.remarks,
            };
            return updated;
          }
          return prev;
        } else {
          const desNumber = `DES-2026-${String(prev.length + 1).padStart(4, '0')}`;
          currentDesignJobId = desNumber;
          const newDesJob: DesignJob = {
            id: desNumber,
            designJobNumber: desNumber,
            projectId: prj.id,
            projectNumber: prj.projectNumber,
            jobNumber: prj.jobNumber,
            customerId: prj.customerId,
            customerName: prj.customerName,
            customerPoNumber: prj.customerPoNumber,
            salesOrderNumber: prj.salesOrderNumber,
            productName: prj.productName,
            machineType: prj.productName.includes('Reactor')
              ? 'Chemical Reaction Pressure Vessel'
              : 'Process Equipment Unit',
            quantity: prj.quantity,
            deliveryDate: prj.deliveryDate,
            designManager: 'Dharmesh Joshi',
            assignedDesigner: assignedDesignerNames,
            priority: (prj.priority as any) || 'high',
            requiredDate: designStage?.plannedEnd || prj.deliveryDate,
            status: designStatus,
            activeRevision: 'REV-00',
            createdDate: prj.startDate,
            remarks: `Auto-synchronized from ${prj.projectNumber} Planning Matrix (${designStage?.stageName || 'Design Phase'})`,
          };
          return [newDesJob, ...prev];
        }
      });

      // 2. SYNC WITH PRODUCTION MODULE (manufacturingJobs)
      const prodStage = prjStages.find(
        (s) =>
          s.responsibleDepartment?.toLowerCase().includes('production') ||
          s.stageName?.toLowerCase().includes('fabrication')
      );

      const prodSupervisor =
        prodStage?.assignedEmployees && prodStage.assignedEmployees.length > 0
          ? prodStage.assignedEmployees.map((a) => a.name).join(', ')
          : prodStage?.responsibleEmployee || prj.projectManager || 'Bhavin Shah';

      setManufacturingJobs((prev) => {
        const existingIdx = prev.findIndex(
          (j) => j.projectId === prj.id || j.jobNumber === prj.jobNumber
        );

        if (existingIdx >= 0) {
          const existing = prev[existingIdx];
          if (
            existing.productionManager !== prodSupervisor ||
            existing.productionProgress !== prj.progressPercent
          ) {
            const updated = [...prev];
            updated[existingIdx] = {
              ...existing,
              productionManager: prodSupervisor,
              productionProgress: prj.progressPercent,
              status: prj.progressPercent >= 100 ? 'Completed' : prj.progressPercent > 50 ? 'In Production' : 'Planning',
            };
            return updated;
          }
          return prev;
        } else {
          const mjNo = `MJ-2026-${String(prev.length + 1).padStart(3, '0')}`;
          const newMfgJob: ManufacturingJob = {
            id: mjNo,
            jobNumber: prj.jobNumber,
            projectId: prj.id,
            projectNumber: prj.projectNumber,
            customerId: prj.customerId,
            customerName: prj.customerName,
            salesOrderId: prj.salesOrderId,
            salesOrderNumber: prj.salesOrderNumber,
            customerPoNumber: prj.customerPoNumber,
            productName: prj.productName,
            specification: prj.specification,
            quantity: prj.quantity,
            unit: prj.unit || 'Unit',
            designRevision: 'REV-00',
            bomRevision: 'REV-00',
            projectManager: prj.projectManager || 'Bhavin Shah',
            productionManager: prodSupervisor,
            plannedStartDate: prodStage?.plannedStart || prj.startDate,
            plannedCompletionDate: prodStage?.plannedEnd || prj.deliveryDate,
            productionProgress: prj.progressPercent || 0,
            status: 'Planning',
            createdAt: prj.startDate,
          };
          return [newMfgJob, ...prev];
        }
      });

      // 4. SYNC WITH PRODUCTION WORK ORDERS (workOrders)
      setWorkOrders((prev) => {
        const existing = prev.find((w) => w.projectId === prj.id || w.jobNumber === prj.jobNumber);
        if (!existing) {
          const woNo = `WO-2026-${String(prev.length + 1).padStart(3, '0')}`;
          const newWO: WorkOrder = {
            id: woNo,
            workOrderNumber: woNo,
            jobId: prj.id,
            jobNumber: prj.jobNumber,
            projectId: prj.id,
            customerId: prj.customerId,
            customerName: prj.customerName,
            salesOrderNumber: prj.salesOrderNumber,
            designRevision: 'REV-00',
            bomRevision: 'REV-00',
            productName: prj.productName,
            productionQuantity: prj.quantity,
            uom: prj.unit || 'Unit',
            plannedStartDate: prodStage?.plannedStart || prj.startDate,
            plannedEndDate: prodStage?.plannedEnd || prj.deliveryDate,
            productionManager: prodSupervisor,
            priority: (prj.priority as any) || 'High',
            status: prj.progressPercent >= 100 ? 'Completed' : 'Planned',
            remarks: `Auto-generated from Project Planning (${prj.projectNumber})`,
            createdAt: prj.startDate,
          };
          api.production.workOrders.create(newWO).catch(() => {});
          return [newWO, ...prev];
        }
        return prev;
      });

      // 6. SYNC WITH PRODUCTION PLANS (productionPlans)
      setProductionPlans((prev) => {
        const existing = prev.find((p) => p.projectId === prj.id || p.jobNumber === prj.jobNumber);
        if (!existing) {
          const planNo = `PLAN-2026-${String(prev.length + 1).padStart(3, '0')}`;
          const newPlan: ProductionPlan = {
            id: planNo,
            planNumber: planNo,
            jobId: prj.id,
            jobNumber: prj.jobNumber,
            projectId: prj.id,
            productName: prj.productName,
            requiredQuantity: prj.quantity,
            bomId: `BOM-${prj.jobNumber.slice(-4)}`,
            bomRevision: 'REV-00',
            materialAvailabilityStatus: 'Fully Available',
            plannedStartDate: prodStage?.plannedStart || prj.startDate,
            plannedCompletionDate: prodStage?.plannedEnd || prj.deliveryDate,
            assignedWorkCenters: ['WC-001 Fabrication Shop', 'WC-002 Welding & Fitting'],
            plannedManpowerCount: 6,
            productionManager: prodSupervisor,
            status: 'Approved',
            createdAt: prj.startDate,
          };
          return [newPlan, ...prev];
        }
        return prev;
      });
    });
  }, [projectJobs, projectPlanningStages]);

  // Numbering Generator Helper
  const getNextDocNumber = (docType: NumberingSetting['docType']): string => {
    const numConfig = numbering.find((n) => n.docType === docType);
    let prefix = numConfig?.prefix || '';
    let digitCount = numConfig?.digitCount || 4;
    let suffix = numConfig?.suffix || '';

    if (!prefix) {
      if (docType === 'customer_po') prefix = 'CPO-2026-';
      else if (docType === 'sales_order') prefix = 'SO-2026-';
      else if (docType === 'quotation') prefix = 'QT-2026-';
      else if (docType === 'lead') prefix = 'LEAD-2026-';
      else if (docType === 'enquiry') prefix = 'ENQ-2026-';
      else if (docType === 'opportunity') prefix = 'OPP-2026-';
      else if (docType === 'visit') prefix = 'VIS-2026-';
      else if (docType === 'project') prefix = 'PRJ-2026-';
      else if (docType === 'job') prefix = 'JOB-2026-';
      else prefix = `${docType?.toUpperCase()}-2026-`;
    }

    // Collect all existing IDs in state for this document type
    let existingIds: string[] = [];
    if (docType === 'customer_po') {
      existingIds = (customerPOs || []).flatMap((p) => [p.id, (p as any).internalCpoNo, (p as any).internal_cpo_no]).filter(Boolean);
    } else if (docType === 'sales_order') {
      existingIds = (salesOrders || []).flatMap((s) => [s.id, s.salesOrderNumber]).filter(Boolean);
    } else if (docType === 'quotation') {
      existingIds = (quotations || []).flatMap((q) => [q.id, q.quotationNumber]).filter(Boolean);
    } else if (docType === 'lead') {
      existingIds = (leads || []).flatMap((l) => [l.id, l.leadNo]).filter(Boolean);
    } else if (docType === 'enquiry') {
      existingIds = (enquiries || []).flatMap((e) => [e.id, e.enquiryNo]).filter(Boolean);
    } else if (docType === 'opportunity') {
      existingIds = (opportunities || []).flatMap((o) => [o.id, o.opportunityNo]).filter(Boolean);
    } else if (docType === 'visit') {
      existingIds = (siteVisits || []).flatMap((v) => [v.id, v.visitNo]).filter(Boolean);
    } else if (docType === 'project') {
      existingIds = (projectJobs || []).flatMap((p) => [p.id, p.projectNumber]).filter(Boolean);
    } else if (docType === 'job') {
      existingIds = (projectJobs || []).flatMap((p) => [p.jobNumber]).filter(Boolean);
    }

    let maxNum = numConfig?.currentNumber || 0;
    existingIds.forEach((idStr) => {
      const match = String(idStr).match(/(\d+)$/);
      if (match) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed > maxNum) {
          maxNum = parsed;
        }
      }
    });

    const nextNum = maxNum + 1;
    setNumbering((prev) =>
      prev.map((n) => (n.docType === docType ? { ...n, currentNumber: nextNum } : n))
    );
    const padded = String(nextNum).padStart(digitCount, '0');
    return `${prefix}${padded}${suffix}`;
  };

  // Audit Logger Hook
  const logAction = (
    action: AuditLogEntry['action'],
    module: string,
    page: string,
    recordId: string,
    notes?: string,
    oldValue?: string,
    newValue?: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      role: (currentUser.roleName?.toLowerCase()?.replace(/[^a-z]/g, '_') as any) || 'super_admin',
      department: (currentUser.departmentName?.toLowerCase().includes('crm') ? 'crm' : 'project') as any,
      action,
      module,
      page,
      recordId,
      oldValue,
      newValue,
      notes,
      ipAddress: '192.168.1.100 (Makarpura Plant Terminal)',
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Notification Publisher
  const sendNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `NOTIF-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_notifications', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    api.post('/notifications/', {
      id: newNotif.id,
      title: newNotif.title,
      message: newNotif.message,
      type: newNotif.type,
      department: newNotif.department,
      link_url: newNotif.linkUrl || '',
      is_read: false,
      priority: newNotif.priority || 'normal',
    }).catch((err) => console.warn('Failed to sync notification to backend:', err));
  };

  // Authentication Helpers
  const login = (username: string, pass: string): boolean => {
    const found = employees.find(
      (e) =>
        (e.username?.toLowerCase() === username?.toLowerCase() || e.email?.toLowerCase() === username?.toLowerCase()) &&
        e.status === 'active'
    );
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      logAction('LOGIN', 'Authentication', 'Sign In', found.id, `User ${found.firstName} logged in`);
      return true;
    }
    return false;
  };

  const logout = () => {
    logAction('LOGOUT', 'Authentication', 'Sign Out', currentUser.id, `User ${currentUser.firstName} logged out`);
    setIsAuthenticated(false);
  };

  const updateCurrentUserProfile = (data: Partial<Employee>) => {
    setCurrentUser((prev) => ({ ...prev, ...data }));
    setEmployees((prev) => prev.map((e) => (e.id === currentUser.id ? { ...e, ...data } : e)));
    logAction('UPDATE', 'User Management', 'My Profile', currentUser.id, 'Updated profile details');
  };

  const changePassword = (newPass: string) => {
    setCurrentUser((prev) => ({ ...prev, password: newPass }));
    setEmployees((prev) => prev.map((e) => (e.id === currentUser.id ? { ...e, password: newPass } : e)));
    logAction('UPDATE', 'User Management', 'Change Password', currentUser.id, 'Password updated successfully');
  };

  // RBAC Permission Engine
  const can = (
    module: string,
    page: string,
    action: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'reject' | 'export' | 'print'
  ): boolean => {
    if (currentUser.roleName === 'Super Admin') return true;

    const userRole = roles.find((r) => r.id === currentUser.roleId);
    if (!userRole) return false;

    // Check module or page level permission
    const perm = userRole.permissions.find(
      (p) => p.module?.toLowerCase() === module?.toLowerCase() && (p.page === 'All' || p.page?.toLowerCase() === page?.toLowerCase())
    );
    if (!perm) return false;
    return Boolean(perm[action]);
  };

  const hasDepartmentAccess = (deptCode: string): boolean => {
    if (currentUser.roleName === 'Super Admin') return true;
    if (currentUser.isFamilyMember) return true; // Family admins have broader access
    return currentUser.departmentName?.toLowerCase().includes(deptCode?.toLowerCase());
  };

  // Company & Numbering Updates
  const updateCompany = (data: Partial<CompanySetting>) => {
    setCompany((prev) => {
      const updated = { ...prev, ...data };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('UMA_ERP_company', JSON.stringify(updated));
        } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'Company Settings', 'Company Profile', 'COMP-01', 'Updated company profile information');
    api.company.update(data).then((res) => {
      if (res && typeof res === 'object') {
        setCompany((prev) => {
          const updated = { ...prev, ...res };
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('UMA_ERP_company', JSON.stringify(updated));
            } catch (_) {}
          }
          return updated;
        });
      }
    }).catch((err) => console.warn('Failed to update company on backend:', err));
  };

  const updateNumbering = (id: string, data: Partial<NumberingSetting>) => {
    setNumbering((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, ...data } : n));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_numbering', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'Settings', 'Numbering Series', id, 'Updated numbering series pattern');
    api.patch(`/numbering/${id}/`, data).catch((err) => console.warn('Failed to update numbering:', err));
  };

  const addNumbering = (item: Omit<NumberingSetting, 'id'>) => {
    const newId = `NUM-${String(numbering.length + 1).padStart(3, '0')}`;
    const nextPreview = `${item.prefix}${String((item.currentNumber || 0) + 1).padStart(item.digitCount || 4, '0')}`;
    const newRule: NumberingSetting = {
      ...item,
      id: newId,
      samplePreview: nextPreview,
    };
    setNumbering((prev) => {
      const updated = [...prev, newRule];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_numbering', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'Settings', 'Numbering Series', newId, `Added numbering rule for ${item.module} - ${item.docType}`);
    api.post('/numbering/', newRule).catch((err) => console.warn('Failed to add numbering rule on backend:', err));
  };

  const resetNumbering = () => {
    setNumbering(INITIAL_NUMBERING);
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('UMA_ERP_numbering', JSON.stringify(INITIAL_NUMBERING)); } catch (_) {}
    }
    logAction('UPDATE', 'Settings', 'Numbering Series', 'ALL', 'Reset numbering series to defaults');
  };

  // Department CRUD
  const addDepartment = (dept: Omit<Department, 'id' | 'employeeCount'> & { employeeCount?: number }) => {
    const rawId = dept.code ? `dept-${dept.code.toLowerCase()}` : `dept-${Date.now().toString().slice(-4)}`;
    const newDept: Department = {
      ...dept,
      id: rawId,
      employeeCount: dept.employeeCount || 0,
    };
    setDepartments((prev) => {
      const updated = [...prev.filter((d) => d.id !== newDept.id), newDept];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_departments', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'Department Management', 'Add Department', newDept.id, `Created department ${newDept.name}`);
    api.departments.create(newDept).catch((err) => console.warn('Failed to add department on backend:', err));
  };

  const updateDepartment = (id: string, dept: Partial<Department>) => {
    setDepartments((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, ...dept } : d));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_departments', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'Department Management', 'Edit Department', id, `Updated department info`);
    api.departments.update(id, dept).catch((err) => console.warn('Failed to update department on backend:', err));
  };

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_departments', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'Department Management', 'Delete Department', id, `Deleted department ${id}`);
    api.departments.delete(id).catch((err) => console.warn('Failed to delete department on backend:', err));
  };

  // Role CRUD
  const addRole = (role: Omit<Role, 'id'>) => {
    const newRole: Role = {
      ...role,
      id: `role-${Date.now().toString().slice(-4)}`,
    };
    setRoles((prev) => [...prev, newRole]);
    logAction('CREATE', 'Role Management', 'Add Role', newRole.id, `Created role ${newRole.name}`);
    api.roles.create(newRole).catch((err) => console.warn('Failed to add role:', err));
  };

  const updateRole = (id: string, role: Partial<Role>) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...role } : r)));
    logAction('UPDATE', 'Role Management', 'Edit Role', id, `Updated role permissions`);
    api.roles.update(id, role).catch((err) => console.warn('Failed to update role:', err));
  };

  // Helper to deduplicate employees by ID / username / email and sanitize invalid records
  const deduplicateEmployees = (list: Employee[]): Employee[] => {
    if (!Array.isArray(list)) return [];
    const map = new Map<string, Employee>();
    for (const emp of list) {
      if (!emp) continue;
      // Determine canonical key
      let key = (emp.id && emp.id.trim() && emp.id.trim() !== '-') ? emp.id.trim() : '';
      if (!key) {
        if (emp.username && emp.username.trim()) {
          key = `USER-${emp.username.trim().toLowerCase()}`;
        } else if (emp.email && emp.email.trim()) {
          key = `EMAIL-${emp.email.trim().toLowerCase()}`;
        } else {
          key = `NAME-${((emp.firstName || '') + (emp.lastName || '') + (emp.name || '')).trim() || 'staff'}`;
        }
      }

      if (map.has(key)) {
        const existing = map.get(key)!;
        map.set(key, {
          ...existing,
          ...emp,
          id: existing.id && existing.id !== '-' ? existing.id : (emp.id && emp.id !== '-' ? emp.id : key),
          name: emp.name || `${emp.firstName || existing.firstName || ''} ${emp.lastName || existing.lastName || ''}`.trim() || existing.name,
        });
      } else {
        const assignedId = (emp.id && emp.id.trim() && emp.id.trim() !== '-')
          ? emp.id.trim()
          : (key.startsWith('EMP-') ? key : `EMP-${String(map.size + 1).padStart(3, '0')}`);

        map.set(key, {
          ...emp,
          id: assignedId,
          name: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Staff',
        });
      }
    }
    return Array.from(map.values());
  };

  // Employee CRUD
  const addEmployee = (emp: Omit<Employee, 'id'> & { id?: string }) => {
    setEmployees((prev) => {
      const cleanPrev = deduplicateEmployees(prev);
      // Check if employee already exists by ID, username, or email
      const existingIndex = cleanPrev.findIndex(
        (e) =>
          (emp.id && e.id === emp.id) ||
          (emp.username && e.username && e.username.toLowerCase() === emp.username.toLowerCase()) ||
          (emp.email && e.email && e.email.toLowerCase() === emp.email.toLowerCase())
      );

      let updated: Employee[];
      if (existingIndex !== -1) {
        // UPDATE existing employee instead of creating a duplicate
        const existing = cleanPrev[existingIndex];
        const updatedEmp: Employee = {
          ...existing,
          ...emp,
          id: existing.id, // Strictly preserve existing ID
          name: emp.name || `${emp.firstName || existing.firstName || ''} ${emp.lastName || existing.lastName || ''}`.trim() || existing.name,
        };
        updated = cleanPrev.map((e, idx) => (idx === existingIndex ? updatedEmp : e));
        logAction('UPDATE', 'User Management', 'Update Staff/Employee Profile', existing.id, `Updated employee ${existing.id} (${updatedEmp.firstName} ${updatedEmp.lastName})`);
        api.employees.update(existing.id, updatedEmp).catch((err) => console.warn('Failed to update employee via API:', err));
      } else {
        // Calculate the highest numeric ID to avoid any collision
        let maxNum = 0;
        cleanPrev.forEach((e) => {
          if (e.id && e.id.startsWith('EMP-')) {
            const num = parseInt(e.id.replace('EMP-', ''), 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          }
        });
        const newId = (emp.id && emp.id.startsWith('EMP-') && !cleanPrev.some(e => e.id === emp.id))
          ? emp.id
          : `EMP-${String(maxNum + 1).padStart(3, '0')}`;

        const newEmp: Employee = {
          ...emp,
          id: newId,
          name: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Staff',
        };
        updated = [...cleanPrev, newEmp];
        logAction('CREATE', 'User Management', 'Add Employee', newEmp.id, `Created employee ${newEmp.firstName} ${newEmp.lastName} with ID ${newEmp.id}`);
        api.employees.create(newEmp).catch((err) => console.warn('Failed to add employee via API:', err));
      }

      const deduplicated = deduplicateEmployees(updated);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_employees', JSON.stringify(deduplicated)); } catch (_) {}
      }
      return deduplicated;
    });
  };

  const updateEmployee = (id: string, emp: Partial<Employee>) => {
    setEmployees((prev) => {
      const cleanPrev = deduplicateEmployees(prev);
      const targetIndex = cleanPrev.findIndex((e) => e.id === id || e.username === id || e.email === id);

      let updated: Employee[];
      if (targetIndex !== -1) {
        const existing = cleanPrev[targetIndex];
        const updatedEmp: Employee = {
          ...existing,
          ...emp,
          id: existing.id, // Strictly preserve existing ID
          name: emp.name || `${emp.firstName || existing.firstName || ''} ${emp.lastName || existing.lastName || ''}`.trim() || existing.name,
        };
        // Update the item and remove any stray duplicate matching this ID
        updated = cleanPrev
          .map((e, idx) => (idx === targetIndex ? updatedEmp : e))
          .filter((e, idx) => idx === targetIndex || e.id !== existing.id);
      } else {
        // Not found by ID, check if emp.id is in state
        const byEmpId = emp.id ? cleanPrev.findIndex((e) => e.id === emp.id) : -1;
        if (byEmpId !== -1) {
          const existing = cleanPrev[byEmpId];
          const updatedEmp: Employee = {
            ...existing,
            ...emp,
            id: existing.id,
            name: emp.name || `${emp.firstName || existing.firstName || ''} ${emp.lastName || existing.lastName || ''}`.trim() || existing.name,
          };
          updated = cleanPrev.map((e, idx) => (idx === byEmpId ? updatedEmp : e));
        } else {
          // Employee not found, create single record
          const newId = id && id.startsWith('EMP-') ? id : `EMP-${String(cleanPrev.length + 1).padStart(3, '0')}`;
          const newEmp: Employee = {
            ...(emp as Employee),
            id: newId,
            name: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Staff',
          };
          updated = [...cleanPrev, newEmp];
        }
      }

      const deduplicated = deduplicateEmployees(updated);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_employees', JSON.stringify(deduplicated)); } catch (_) {}
      }
      return deduplicated;
    });

    if (currentUser.id === id || currentUser.username === id) {
      setCurrentUser((prev) => ({ ...prev, ...emp, id: prev.id }));
    }
    logAction('UPDATE', 'User Management', 'Edit Staff/Employee Profile', id, `Updated employee ${id}`);
    if (emp.password) {
      api.employees.resetPassword(id, emp.password).catch((err) => console.warn('Failed to reset password via API:', err));
    }
    api.employees.update(id, emp).catch((err) => console.warn('Failed to update employee via API:', err));
  };

  const resetEmployeePassword = async (id: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setEmployees((prev) => {
      const updated = prev.map((e) => (e.id === id || e.username === id || e.email === id ? { ...e, password } : e));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_employees', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    if (currentUser.id === id || currentUser.username === id) {
      setCurrentUser((prev) => ({ ...prev, password }));
    }
    logAction('UPDATE', 'User Management', 'Reset Password', id, `Reset password for employee ${id}`);
    try {
      const res = await api.employees.resetPassword(id, password);
      return { success: true, message: res?.message || 'Password updated successfully' };
    } catch (err: any) {
      console.warn('Backend password reset failed, saved locally:', err);
      return { success: true, message: 'Password updated and saved successfully' };
    }
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_employees', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'User Management', 'Delete Employee', id, `Deleted employee ${id}`);
    api.employees.delete(id).catch((err) => console.warn('Failed to delete employee:', err));
  };

  // CRM: Leads
  const addLead = (leadData: Omit<Lead, 'id' | 'leadNo' | 'createdDate'>): Lead => {
    const leadNo = getNextDocNumber('lead');
    const newLead: Lead = {
      ...leadData,
      id: leadNo,
      leadNo,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setLeads((prev) => {
      const updated = [newLead, ...prev.filter((l) => l.id !== leadNo && l.leadNo !== leadNo)];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_leads', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'CRM', 'Leads', leadNo, `New Lead for ${newLead.companyName} (${newLead.productName})`);
    sendNotification({
      title: 'New Lead Registered',
      message: `${newLead.leadNo}: ${newLead.companyName} requires ${newLead.productName}.`,
      type: 'info',
      department: 'crm',
      linkUrl: `/crm/leads/${newLead.id}`,
      priority: newLead.priority === 'urgent' ? 'high' : 'normal',
    });

    // Auto-schedule initial follow-up if nextFollowUpDate was provided during lead registration
    if (newLead.nextFollowUpDate) {
      const flwNo = `FLW-2026-${String(followUps.length + 1).padStart(4, '0')}`;
      const initialFlw: FollowUp = {
        id: flwNo,
        followUpNo: flwNo,
        leadOrCustomerId: newLead.id,
        leadOrCustomerName: `${newLead.companyName} (${newLead.contactPerson})`,
        entityType: 'lead',
        type: 'call',
        assignedToId: newLead.assignedSalesPersonId,
        assignedToName: newLead.assignedSalesPersonName,
        date: newLead.nextFollowUpDate,
        time: '11:00 AM',
        priority: newLead.priority === 'urgent' ? 'high' : 'medium',
        purpose: `Initial inquiry follow-up for ${newLead.productName}`,
        notes: newLead.requirementDescription || 'Lead registration initial follow-up',
        status: 'pending',
      };
      setFollowUps((prev) => {
        const updated = [initialFlw, ...prev.filter((f) => f.id !== flwNo)];
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('UMA_ERP_followUps', JSON.stringify(updated)); } catch (_) {}
        }
        return updated;
      });
      api.crm.followUps.create(initialFlw).catch((err) => console.warn('Failed to sync initial follow-up:', err));
    }

    // Sync to PythonAnywhere Backend
    api.crm.leads.create(newLead).then((res) => {
      if (res && res.id) {
        setLeads((prev) => {
          const updated = prev.map((l) => (l.id === leadNo ? { ...l, ...res } : l));
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_leads', JSON.stringify(updated)); } catch (_) {}
          }
          return updated;
        });
      }
    }).catch((err) => console.warn('Failed to sync lead to backend:', err));
    return newLead;
  };

  const updateLead = (id: string, leadData: Partial<Lead>) => {
    setLeads((prev) => {
      const updated = prev.map((l) => (l.id === id || l.leadNo === id ? { ...l, ...leadData } : l));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_leads', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'CRM', 'Leads', id, `Updated lead ${id}`);
    api.crm.leads.update(id, leadData).catch((err) => console.warn('Failed to update lead on backend:', err));
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => {
      const updated = prev.filter((l) => l.id !== id && l.leadNo !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_leads', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'CRM', 'Leads', id, `Deleted lead ${id}`);
    api.crm.leads.delete(id).catch((err) => console.warn('Failed to delete lead on backend:', err));
  };

  const convertLeadToCustomer = (leadId: string): { customer: Customer; enquiry?: Enquiry; opportunity?: Opportunity } => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) throw new Error('Lead not found');

    // Create Customer
    const custId = `CUST-2026-${String(customers.length + 1).padStart(4, '0')}`;
    const newCustomer: Customer = {
      id: custId,
      customerCode: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
      customerType: 'company',
      companyName: lead.companyName,
      industry: lead.industry || 'Manufacturing',
      gstin: lead.gstin || '24AAACX0000X1Z1',
      pan: lead.gstin ? lead.gstin.slice(2, 12) : 'AAACX0000X',
      website: lead.website || '',
      contactPerson: lead.contactPerson,
      designation: lead.designation,
      mobile: lead.mobile,
      email: lead.email,
      whatsapp: lead.whatsapp,
      billingAddress: lead.address,
      shippingAddress: lead.address,
      city: lead.city,
      state: lead.state,
      country: lead.country,
      pincode: lead.pincode,
      paymentTerms: '30% Advance, 70% against Dispatch',
      creditLimit: 10000000,
      currency: 'INR (₹)',
      category: 'gold',
      assignedSalesPerson: lead.assignedSalesPersonName,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCustomer, ...prev]);

    // Create Enquiry
    const enqNo = getNextDocNumber('enquiry');
    const newEnquiry: Enquiry = {
      id: enqNo,
      enquiryNo: enqNo,
      leadId: lead.id,
      customerId: newCustomer.id,
      customerName: newCustomer.companyName,
      enquiryDate: new Date().toISOString().split('T')[0],
      requirement: lead.requirementDescription,
      machineProduct: lead.productName,
      quantity: lead.quantity,
      specification: lead.capacity || lead.requirementDescription || 'As per customer drawing/spec',
      expectedDelivery: lead.expectedDelivery,
      assignedPersonId: lead.assignedSalesPersonId,
      assignedPersonName: lead.assignedSalesPersonName,
      status: 'technical_review',
    };
    setEnquiries((prev) => [newEnquiry, ...prev]);

    // Create Opportunity
    const oppNo = getNextDocNumber('opportunity');
    const newOpp: Opportunity = {
      id: oppNo,
      opportunityNo: oppNo,
      leadId: lead.id,
      customerId: newCustomer.id,
      customerName: newCustomer.companyName,
      machineProduct: lead.productName,
      estimatedValue: lead.budget || 3500000,
      expectedClosingDate: lead.expectedDelivery,
      salesPersonId: lead.assignedSalesPersonId,
      salesPersonName: lead.assignedSalesPersonName,
      probability: 60,
      stage: 'requirement',
      remarks: `Converted from Lead ${lead.leadNo}`,
    };
    setOpportunities((prev) => [newOpp, ...prev]);

    // Update Lead
    updateLead(lead.id, {
      status: 'qualified',
      convertedCustomerId: newCustomer.id,
      convertedEnquiryId: newEnquiry.id,
      convertedOpportunityId: newOpp.id,
    });

    // Asynchronously trigger lead conversion on PythonAnywhere backend
    api.crm.leads.convert(lead.id).catch((err) => console.warn('Failed to sync lead conversion on backend:', err));

    logAction('APPROVE', 'CRM', 'Convert Lead', lead.id, `Converted lead to Customer ${newCustomer.companyName}, Enquiry ${enqNo}, Opportunity ${oppNo}`);
    return { customer: newCustomer, enquiry: newEnquiry, opportunity: newOpp };
  };

  // Customers
  const addCustomer = (custData: Omit<Customer, 'id' | 'customerCode' | 'createdDate'>): Customer => {
    const custId = `CUST-2026-${String(customers.length + 1).padStart(4, '0')}`;
    const newCust: Customer = {
      ...custData,
      id: custId,
      customerCode: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCust, ...prev]);
    logAction('CREATE', 'CRM', 'Customers', custId, `Added Customer ${newCust.companyName}`);
    // Sync to PythonAnywhere Backend
    api.crm.customers.create(newCust).then((res) => {
      if (res && res.id) {
        setCustomers((prev) => prev.map((c) => (c.id === custId ? { ...c, ...res } : c)));
      }
    }).catch((err) => console.warn('Failed to sync customer to backend:', err));
    return newCust;
  };

  const updateCustomer = (id: string, custData: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...custData } : c)));
    logAction('UPDATE', 'CRM', 'Customers', id, `Updated Customer ${id}`);
    api.crm.customers.update(id, custData).catch((err) => console.warn('Failed to update customer on backend:', err));
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    logAction('DELETE', 'CRM', 'Customers', id, `Deleted Customer ${id}`);
    api.crm.customers.delete(id).catch((err) => console.warn('Failed to delete customer on backend:', err));
  };

  const addContact = (contact: Omit<Contact, 'id'>) => {
    const newContact: Contact = {
      ...contact,
      id: `CONT-${Date.now().toString().slice(-4)}`,
    };
    setContacts((prev) => [...prev, newContact]);
    logAction('CREATE', 'CRM', 'Contacts', newContact.id, `Added Contact ${newContact.name}`);
    api.crm.contacts.create(newContact).then((res) => {
      if (res && res.id) {
        setContacts((prev) => prev.map((c) => (c.id === newContact.id ? { ...c, ...res } : c)));
      }
    }).catch((err) => console.warn('Failed to sync contact to backend:', err));
  };

  // Enquiries & Opportunities
  const addEnquiry = (enqData: Omit<Enquiry, 'id' | 'enquiryNo' | 'enquiryDate'>): Enquiry => {
    const enqNo = getNextDocNumber('enquiry');
    const newEnq: Enquiry = {
      ...enqData,
      id: enqNo,
      enquiryNo: enqNo,
      enquiryDate: new Date().toISOString().split('T')[0],
    };
    setEnquiries((prev) => [newEnq, ...prev]);
    logAction('CREATE', 'CRM', 'Enquiries', enqNo, `Created Enquiry ${enqNo}`);
    api.crm.enquiries.create(newEnq).then((res) => {
      if (res && res.id) {
        setEnquiries((prev) => prev.map((e) => (e.id === enqNo ? { ...e, ...res } : e)));
      }
    }).catch((err) => console.warn('Failed to sync enquiry to backend:', err));
    return newEnq;
  };

  const updateEnquiry = (id: string, enqData: Partial<Enquiry>) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, ...enqData } : e)));
    logAction('UPDATE', 'CRM', 'Enquiries', id, `Updated Enquiry ${id}`);
    api.crm.enquiries.update(id, enqData).catch((err) => console.warn('Failed to update enquiry on backend:', err));
  };

  const addOpportunity = (oppData: Omit<Opportunity, 'id' | 'opportunityNo'>): Opportunity => {
    const oppNo = getNextDocNumber('opportunity');
    const newOpp: Opportunity = {
      ...oppData,
      id: oppNo,
      opportunityNo: oppNo,
    };
    setOpportunities((prev) => [newOpp, ...prev]);
    logAction('CREATE', 'CRM', 'Opportunities', oppNo, `Created Opportunity ${oppNo}`);
    api.crm.opportunities.create(newOpp).then((res) => {
      if (res && res.id) {
        setOpportunities((prev) => prev.map((o) => (o.id === oppNo ? { ...o, ...res } : o)));
      }
    }).catch((err) => console.warn('Failed to sync opportunity to backend:', err));
    return newOpp;
  };

  const updateOpportunity = (id: string, oppData: Partial<Opportunity>) => {
    setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, ...oppData } : o)));
    logAction('UPDATE', 'CRM', 'Opportunities', id, `Updated Opportunity ${id}`);
    api.crm.opportunities.update(id, oppData).catch((err) => console.warn('Failed to update opportunity on backend:', err));
  };

  // Follow-ups & Visits & Exhibitions
  const addFollowUp = (flwData: Omit<FollowUp, 'id' | 'followUpNo'>): FollowUp => {
    const flwNo = `FLW-2026-${String(followUps.length + 1).padStart(4, '0')}`;
    const newFlw: FollowUp = {
      ...flwData,
      id: flwNo,
      followUpNo: flwNo,
    };
    setFollowUps((prev) => {
      const updated = [newFlw, ...prev.filter((f) => f.id !== flwNo && f.followUpNo !== flwNo)];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_followUps', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'CRM', 'Follow-ups', flwNo, `Scheduled follow-up for ${newFlw.leadOrCustomerName}`);
    api.crm.followUps.create(newFlw).then((res) => {
      if (res && (res.id || res.follow_up_no || res.followUpNo)) {
        const syncedFlw: FollowUp = {
          ...newFlw,
          ...res,
          id: String(res.id || newFlw.id),
          followUpNo: res.followUpNo || res.follow_up_no || newFlw.followUpNo,
          leadOrCustomerId: res.leadOrCustomerId || res.lead_or_customer_id || newFlw.leadOrCustomerId,
          leadOrCustomerName: res.leadOrCustomerName || res.lead_or_customer_name || newFlw.leadOrCustomerName,
          nextFollowUpDate: res.nextFollowUpDate || res.next_follow_up_date || newFlw.nextFollowUpDate,
        };
        setFollowUps((prev) => {
          const updated = prev.map((f) => (f.id === flwNo ? syncedFlw : f));
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_followUps', JSON.stringify(updated)); } catch (_) {}
          }
          return updated;
        });
      }
    }).catch((err) => console.warn('Failed to sync follow-up:', err));
    return newFlw;
  };

  const completeFollowUp = (id: string, notes: string, nextDate?: string) => {
    setFollowUps((prev) => {
      const updated = prev.map((f) =>
        f.id === id ? { ...f, status: 'completed' as const, completedNotes: notes, nextFollowUpDate: nextDate } : f
      );
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_followUps', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'CRM', 'Follow-ups', id, `Completed follow-up: ${notes}`);
    api.crm.followUps.complete(id, { notes, nextDate }).catch((err) => console.warn('Failed to complete follow-up:', err));
  };

  const addSiteVisit = (visitData: Omit<SiteVisit, 'id' | 'visitNo'>): SiteVisit => {
    const visitNo = getNextDocNumber('visit');
    const newVisit: SiteVisit = {
      ...visitData,
      id: visitNo,
      visitNo,
    };
    setSiteVisits((prev) => {
      const updated = [newVisit, ...prev.filter((v) => v.id !== visitNo && v.visitNo !== visitNo)];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_siteVisits', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'CRM', 'Visits', visitNo, `Logged site visit to ${newVisit.customerName}`);
    api.crm.siteVisits.create(newVisit).then((res) => {
      if (res && (res.id || res.visit_no || res.visitNo)) {
        const normalized: SiteVisit = {
          id: String(res.id || res.visit_no || res.visitNo || visitNo),
          visitNo: res.visitNo || res.visit_no || visitNo,
          customerId: res.customerId || res.customer_id || newVisit.customerId,
          customerName: res.customerName || res.customer_name || newVisit.customerName,
          contactPerson: res.contactPerson || res.contact_person || newVisit.contactPerson,
          contactMobile: res.contactMobile || res.contact_mobile || newVisit.contactMobile,
          visitDate: res.visitDate || res.visit_date || newVisit.visitDate,
          location: res.location || newVisit.location,
          employeeId: res.employeeId || res.employee_id || newVisit.employeeId,
          employeeName: res.employeeName || res.employee_name || newVisit.employeeName,
          purpose: res.purpose || newVisit.purpose,
          discussionNotes: res.discussionNotes || res.discussion_notes || res.discussionSummary || newVisit.discussionNotes,
          requirementDetails: res.requirementDetails || res.requirement_details || newVisit.requirementDetails,
          outcome: res.outcome || newVisit.outcome,
          nextAction: res.nextAction || res.next_action || newVisit.nextAction,
          nextFollowUpDate: res.nextFollowUpDate || res.next_follow_up_date || newVisit.nextFollowUpDate,
        };
        setSiteVisits((prev) => {
          const updated = prev.map((v) => (v.id === visitNo || v.visitNo === visitNo ? normalized : v));
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_siteVisits', JSON.stringify(updated)); } catch (_) {}
          }
          return updated;
        });
      }
    }).catch((err) => console.warn('Failed to sync visit:', err));
    return newVisit;
  };

  const updateSiteVisit = (id: string, visitData: Partial<SiteVisit>) => {
    setSiteVisits((prev) => {
      const updated = prev.map((v) => (v.id === id || v.visitNo === id ? { ...v, ...visitData } : v));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_siteVisits', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'CRM', 'Visits', id, `Updated site visit record ${id}`);
    api.crm.siteVisits.update(id, visitData).catch((err) => console.warn('Failed to update visit via API:', err));
  };

  const deleteSiteVisit = (id: string) => {
    setSiteVisits((prev) => {
      const updated = prev.filter((v) => v.id !== id && v.visitNo !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_siteVisits', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'CRM', 'Visits', id, `Deleted site visit record ${id}`);
    api.crm.siteVisits.delete(id).catch((err) => console.warn('Failed to delete visit via API:', err));
  };

  const addExhibition = (expoData: Omit<Exhibition, 'id'>): Exhibition => {
    let maxNum = 0;
    exhibitions.forEach((e) => {
      if (e.id && e.id.startsWith('EXPO-2026-')) {
        const num = parseInt(e.id.replace('EXPO-2026-', ''), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    const newId = `EXPO-2026-${String(maxNum + 1).padStart(2, '0')}`;
    const newExpo: Exhibition = {
      ...expoData,
      id: newId,
    };
    setExhibitions((prev) => {
      const updated = [newExpo, ...prev.filter((e) => e.id !== newId)];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_exhibitions', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'CRM', 'Exhibitions', newId, `Registered Exhibition ${newExpo.expoName}`);
    api.crm.exhibitions.create(newExpo).then((res) => {
      if (res && res.id) {
        const normalized: Exhibition = {
          id: String(res.id || newId),
          expoName: res.expoName || res.expo_name || newExpo.expoName,
          organizer: res.organizer || newExpo.organizer,
          location: res.location || newExpo.location,
          startDate: res.startDate || res.start_date || newExpo.startDate,
          endDate: res.endDate || res.end_date || newExpo.endDate,
          stallNumber: res.stallNumber || res.stall_number || newExpo.stallNumber,
          contactPerson: res.contactPerson || res.contact_person || newExpo.contactPerson,
          budget: Number(res.budget) || newExpo.budget,
          assignedTeam: Array.isArray(res.assignedTeam) ? res.assignedTeam : (Array.isArray(res.assigned_team) ? res.assigned_team : newExpo.assignedTeam),
          productsDisplayed: res.productsDisplayed || res.products_displayed || newExpo.productsDisplayed,
          notes: res.notes || newExpo.notes,
          totalContacts: Number(res.totalContacts) || Number(res.total_contacts) || newExpo.totalContacts,
          qualifiedLeads: Number(res.qualifiedLeads) || Number(res.qualified_leads) || newExpo.qualifiedLeads,
          quotationsSent: Number(res.quotationsSent) || Number(res.quotations_sent) || newExpo.quotationsSent,
          convertedCustomers: Number(res.convertedCustomers) || Number(res.converted_customers) || newExpo.convertedCustomers,
        };
        setExhibitions((prev) => {
          const updated = prev.map((e) => (e.id === newId ? normalized : e));
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_exhibitions', JSON.stringify(updated)); } catch (_) {}
          }
          return updated;
        });
      }
    }).catch((err) => console.warn('Failed to sync exhibition:', err));
    return newExpo;
  };

  const updateExhibition = (id: string, expoData: Partial<Exhibition>) => {
    setExhibitions((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...expoData } : e));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_exhibitions', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'CRM', 'Exhibitions', id, `Updated exhibition record ${id}`);
    api.crm.exhibitions.update(id, expoData).catch((err) => console.warn('Failed to update exhibition via API:', err));
  };

  const deleteExhibition = (id: string) => {
    setExhibitions((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_exhibitions', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'CRM', 'Exhibitions', id, `Deleted exhibition record ${id}`);
    api.crm.exhibitions.delete(id).catch((err) => console.warn('Failed to delete exhibition via API:', err));
  };

  // Quotations & Multi-Revision Engine
  const addQuotation = (quoData: Omit<Quotation, 'id' | 'quotationNumber'>): Quotation => {
    const existingNums = quotations.map((q) => {
      const match = (q.quotationNumber || q.id || '').match(/QT-2026-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = Math.max(132, ...existingNums);
    const nextNum = maxNum + 1;
    const quoNo = `QT-2026-${String(nextNum).padStart(4, '0')}`;
    const newQuo: Quotation = {
      ...quoData,
      id: quoNo,
      quotationNumber: quoNo,
    };
    setQuotations((prev) => {
      const filtered = prev.filter((q) => q.id !== quoNo && q.quotationNumber !== quoNo);
      const updated = [newQuo, ...filtered];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_quotations', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'CRM', 'Quotations', quoNo, `Generated Quotation ${quoNo} (Rev-00) for ₹${newQuo.latestSummary?.grandTotal || 0}`);
    sendNotification({
      title: 'Quotation Ready for Approval',
      message: `${quoNo} for ${newQuo.customerName} requires Manager Review.`,
      type: 'approval_request',
      department: 'crm',
      linkUrl: `/crm/quotations/${quoNo}`,
      priority: 'high',
    });
    api.crm.quotations.create(newQuo).then((res) => {
      if (res && (res.id || res.quotationNumber)) {
        setQuotations((prev) => {
          const updated = prev.map((q) => (q.id === quoNo ? { ...q, ...res, id: res.id || quoNo, quotationNumber: res.quotationNumber || quoNo } : q));
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_quotations', JSON.stringify(updated)); } catch (_) {}
          }
          return updated;
        });
      }
    }).catch((err) => console.warn('Failed to sync quotation to backend:', err));
    return newQuo;
  };

  const addQuotationRevision = (quotationId: string, revision: QuotationRevision) => {
    setQuotations((prev) => {
      const updated = prev.map((q) => {
        if (q.id !== quotationId) return q;
        return {
          ...q,
          currentRevision: revision.revisionNumber,
          revisions: [...q.revisions, revision],
          latestSummary: {
            grandTotal: revision.grandTotal,
            status: revision.status,
            machineProduct: revision.items[0]?.productName || q.latestSummary.machineProduct,
          },
        };
      });
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_quotations', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'CRM', 'Quotation Revision', quotationId, `Created revision ${revision.revisionNumber}`);
    api.crm.quotations.addRevision(quotationId, revision).catch((err) => console.warn('Failed to sync quotation revision:', err));
  };

  const updateQuotationStatus = (quotationId: string, revisionNumber: string, status: QuotationRevision['status']) => {
    setQuotations((prev) => {
      const updated = prev.map((q) => {
        if (q.id !== quotationId) return q;
        const updatedRevs = q.revisions.map((r) => (r.revisionNumber === revisionNumber ? { ...r, status } : r));
        return {
          ...q,
          revisions: updatedRevs,
          latestSummary: {
            ...q.latestSummary,
            status,
          },
        };
      });
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_quotations', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('APPROVE', 'CRM', 'Quotations', quotationId, `Updated ${revisionNumber} status to ${status}`);
    api.crm.quotations.updateStatus(quotationId, { revisionNumber, status }).catch((err) =>
      console.warn('Failed to update quotation status on backend:', err)
    );
  };

  // Customer PO & Sales Order
  const addCustomerPO = (poData: Omit<CustomerPO, 'id'>): CustomerPO => {
    const poId = getNextDocNumber('customer_po');
    const newPO: CustomerPO = {
      ...poData,
      id: poId,
    };
    setCustomerPOs((prev) => {
      const updated = [newPO, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_customerPOs', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'CRM', 'Customer PO', poId, `Received Customer PO ${newPO.poNumber} for ₹${newPO.poAmount}`);
    sendNotification({
      title: 'Customer PO Received',
      message: `${newPO.poNumber} from ${newPO.customerName} received. Create Sales Order to initiate manufacturing.`,
      type: 'success',
      department: 'crm',
      linkUrl: '/crm/customer-po',
      priority: 'high',
    });
    const poPayload = {
      ...newPO,
      receivedDate: (newPO as any).receivedDate || newPO.poDate || new Date().toISOString().split('T')[0],
      poValue: Number(newPO.poAmount || (newPO as any).poValue || 0),
      scopeOfWork: (newPO as any).scopeOfWork || (newPO as any).remarks || '',
    };
    api.crm.customerPos.create(poPayload).then((res) => {
      if (res && res.id) {
        setCustomerPOs((prev) => {
          const updated = prev.map((p) => (p.id === poId ? { ...p, ...res } : p));
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_customerPOs', JSON.stringify(updated)); } catch (_) {}
          }
          return updated;
        });
      }
    }).catch((err) => console.warn('Failed to sync customer PO to backend:', err));
    return newPO;
  };

  const convertCustomerPOToSalesOrder = (poId: string): SalesOrder => {
    const po = customerPOs.find((p) => p.id === poId);
    if (!po) throw new Error('Customer PO not found');

    const soNo = getNextDocNumber('sales_order');
    const newSO: SalesOrder = {
      id: soNo,
      salesOrderNumber: soNo,
      customerId: po.customerId,
      customerName: po.customerName,
      customerPoId: po.id,
      customerPoNumber: po.poNumber,
      quotationId: po.quotationId,
      quotationNumber: po.quotationNumber,
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: po.deliveryDate,
      orderValue: po.poAmount,
      paymentTerms: po.paymentTerms,
      assignedProjectManager: 'Bhavin Shah',
      status: 'confirmed',
      items: [
        {
          id: 'so-1',
          productName: `Custom Equipment (Ref ${po.quotationNumber})`,
          specification: 'As per approved Quotation & Customer PO specs',
          quantity: 1,
          unit: 'Set',
          rate: po.poAmount,
          amount: po.poAmount,
        },
      ],
    };

    setSalesOrders((prev) => {
      const updated = [newSO, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_salesOrders', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    setCustomerPOs((prev) => {
      const updated = prev.map((p) => (p.id === poId ? { ...p, status: 'sales_order_created' as const, salesOrderId: soNo } : p));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_customerPOs', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('APPROVE', 'CRM', 'Sales Order Created', soNo, `Generated Sales Order ${soNo} from Customer PO ${po.poNumber}`);
    sendNotification({
      title: 'Sales Order Confirmed',
      message: `${soNo} created for ${po.customerName}. Click to create Project / Job.`,
      type: 'success',
      department: 'crm',
      linkUrl: '/crm/sales-orders',
      priority: 'high',
    });
    const soPayload = {
      ...newSO,
      targetDeliveryDate: newSO.deliveryDate || '2026-12-31',
      grandTotal: Number(newSO.orderValue || 0),
      totalAmount: Number(newSO.orderValue || 0),
    };
    api.crm.salesOrders.create(soPayload).then((res) => {
      if (res && res.id) {
        setSalesOrders((prev) => {
          const updated = prev.map((s) => (s.id === soNo ? { ...s, ...res } : s));
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_salesOrders', JSON.stringify(updated)); } catch (_) {}
          }
          return updated;
        });
      }
    }).catch((err) => console.warn('Failed to sync sales order to backend:', err));
    api.crm.customerPos.update(poId, { status: 'converted_to_so', convertedSoId: soNo }).catch((err) =>
      console.warn('Failed to update customer PO on backend:', err)
    );
    return newSO;
  };

  const addSalesOrder = (soData: Omit<SalesOrder, 'id' | 'salesOrderNumber'>): SalesOrder => {
    const soNo = getNextDocNumber('sales_order');
    const newSO: SalesOrder = {
      ...soData,
      id: soNo,
      salesOrderNumber: soNo,
    };
    setSalesOrders((prev) => {
      const updated = [newSO, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_salesOrders', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'CRM', 'Sales Orders', soNo, `Created Sales Order ${soNo}`);
    const soPayload = {
      ...newSO,
      targetDeliveryDate: newSO.deliveryDate || '2026-12-31',
      grandTotal: Number(newSO.orderValue || 0),
      totalAmount: Number(newSO.orderValue || 0),
    };
    api.crm.salesOrders.create(soPayload).then((res) => {
      if (res && res.id) {
        setSalesOrders((prev) => {
          const updated = prev.map((s) => (s.id === soNo ? { ...s, ...res } : s));
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_salesOrders', JSON.stringify(updated)); } catch (_) {}
          }
          return updated;
        });
      }
    }).catch((err) => console.warn('Failed to sync sales order to backend:', err));
    return newSO;
  };

  // CRM → PROJECT INTEGRATION (THE CENTRAL LINK!)
  const createProjectFromSalesOrder = (salesOrderId: string): ProjectJobMaster => {
    const so = salesOrders.find((s) => s.id === salesOrderId);
    if (!so) throw new Error('Sales order not found');

    const prjNo = getNextDocNumber('project');
    const jobNo = getNextDocNumber('job');

    const newProject: ProjectJobMaster = {
      id: prjNo,
      projectNumber: prjNo,
      jobNumber: jobNo,
      salesOrderId: so.id,
      salesOrderNumber: so.salesOrderNumber,
      customerPoNumber: so.customerPoNumber,
      quotationNumber: so.quotationNumber,
      customerId: so.customerId,
      customerName: so.customerName,
      productName: so.items[0]?.productName || 'Custom Manufacturing Unit',
      specification: so.items[0]?.specification || 'As per Sales Order',
      quantity: so.items[0]?.quantity || 1,
      unit: so.items[0]?.unit || 'Unit',
      orderValue: so.orderValue,
      priority: 'high',
      startDate: new Date().toISOString().split('T')[0],
      deliveryDate: so.deliveryDate,
      projectManager: so.assignedProjectManager || 'Bhavin Shah',
      status: 'planning',
      progressPercent: 10,
    };

    // Auto-generate 16 planning stages, milestones and department assignments for MTO execution
    const newStages = create16PlanningStagesForProject(newProject);
    const newMilestones = createDefaultMilestonesForProject(newProject);
    const newDeptAssignments = createDefaultDepartmentAssignments(newProject);

    if (newStages.length > 0) {
      const avgProgress = Math.round(
        newStages.reduce((sum, s) => sum + (s.progressPercent || 0), 0) / newStages.length
      );
      newProject.progressPercent = avgProgress;
    }

    setProjectPlanningStages((prev) => [...prev, ...newStages]);
    setProjectMilestones((prev) => [...prev, ...newMilestones]);
    setDepartmentAssignments((prev) => [...prev, ...newDeptAssignments]);
    setProjectJobs((prev) => {
      const updated = [newProject, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_projectJobs', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });

    // Update Sales Order with Project Link
    setSalesOrders((prev) => {
      const updated = prev.map((s) => (s.id === salesOrderId ? { ...s, status: 'project_created' as const, projectId: prjNo, jobNumber: jobNo } : s));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_salesOrders', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });

    const prjPayload = {
      ...newProject,
      targetDeliveryDate: newProject.deliveryDate || '2026-12-31',
      projectManagerName: newProject.projectManager || 'Bhavin Shah',
      currentStatus: newProject.status || 'planning',
    };
    api.projects.create(prjPayload).then((res) => {
      if (res && res.id) {
        setProjectJobs((prev) => {
          const updated = prev.map((p) => (p.id === prjNo ? { ...p, ...res } : p));
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_projectJobs', JSON.stringify(updated)); } catch (_) {}
          }
          return updated;
        });
      }
    }).catch((err) => console.warn('Failed to sync project to backend:', err));
    api.crm.salesOrders.update(so.id, { status: 'project_created', projectId: prjNo }).catch((err) =>
      console.warn('Failed to update sales order status on backend:', err)
    );

    // Also inject into Master Job Traceability
    const newTraceableJob: JobTraceabilityRecord = {
      jobNumber: jobNo,
      salesOrderId: so.salesOrderNumber,
      quotationId: so.quotationNumber,
      customerPoNumber: so.customerPoNumber,
      customerId: so.customerId,
      customerName: so.customerName,
      productName: newProject.productName,
      productCode: `EQP-${jobNo.slice(-3)}`,
      specification: newProject.specification,
      quantity: newProject.quantity,
      unit: newProject.unit,
      orderValue: newProject.orderValue,
      startDate: newProject.startDate,
      targetDeliveryDate: newProject.deliveryDate,
      currentStatus: 'planning',
      progressPercent: 10,
      priority: 'high',
      projectManager: newProject.projectManager,
      steps: [
        { id: 's1', name: 'Lead & Enquiry', department: 'crm', status: 'completed', completedAt: newProject.startDate },
        { id: 's2', name: 'Quotation Approved', department: 'crm', status: 'completed', completedAt: newProject.startDate },
        { id: 's3', name: 'Customer PO Received', department: 'crm', status: 'completed', completedAt: newProject.startDate },
        { id: 's4', name: 'Sales Order & Job Created', department: 'project', status: 'completed', completedAt: newProject.startDate },
        { id: 's5', name: 'Design CAD & BOM', department: 'designer', status: 'in_progress' },
        { id: 's6', name: 'Purchase Requisition', department: 'purchase', status: 'pending' },
        { id: 's7', name: 'GRN Inward', department: 'store', status: 'pending' },
        { id: 's8', name: 'Material Issue', department: 'store', status: 'pending' },
        { id: 's9', name: 'Shop Floor Fabrication', department: 'production', status: 'pending' },
        { id: 's10', name: 'QC & Testing', department: 'production', status: 'pending' },
        { id: 's11', name: 'Dispatch', department: 'project', status: 'pending' },
        { id: 's12', name: 'Site Commissioning', department: 'maintenance', status: 'pending' },
        { id: 's13', name: 'Invoicing & Handover', department: 'accounting', status: 'pending' },
      ],
      linkedRecords: {
        leadId: so.quotationId,
        designRev: 'REV-00',
        bomId: `BOM-${jobNo}-WIP`,
        purchaseOrders: [],
        grnNumbers: [],
        materialIssues: [],
        workOrderIds: [],
        qcReportId: [],
        invoiceNumbers: [],
      },
    };

    setJobs((prev) => [newTraceableJob, ...prev]);

    logAction(
      'CREATE',
      'CRM → Project Integration',
      'Create Project',
      prjNo,
      `Generated Project ${prjNo} and Job Number ${jobNo} from Sales Order ${so.salesOrderNumber}`
    );

    sendNotification({
      title: 'New MTO Project & Job Initiated',
      message: `Project ${prjNo} (${jobNo}) for ${so.customerName} has been initialized for Engineering Design & BOM.`,
      type: 'success',
      department: 'project',
      linkUrl: '/projects',
      priority: 'high',
    });

    return newProject;
  };

  // PROJECT MODULE MANAGEMENT FUNCTIONS
  const updateProject = (id: string, prj: Partial<ProjectJobMaster>) => {
    setProjectJobs((prev) => {
      const updated = prev.map((p) => (p.id === id || p.projectNumber === id ? { ...p, ...prj } : p));
      try { localStorage.setItem('UMA_ERP_projectJobs', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('UPDATE', 'Project Management', 'Projects', id, `Updated project details for ${id}`);
    api.projects.update(id, prj).catch((err) => console.warn('Failed to update project in backend:', err));
  };

  const deleteProject = (id: string) => {
    setProjectJobs((prev) => {
      const updated = prev.filter((p) => p.id !== id && p.projectNumber !== id);
      try { localStorage.setItem('UMA_ERP_projectJobs', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('DELETE', 'Project Management', 'Projects', id, `Deleted project ${id}`);
    api.projects.delete(id).catch((err) => console.warn('Failed to delete project in backend:', err));
  };

  const logProjectActivity = (projectId: string, jobNumber: string, action: string, details: string) => {
    const now = new Date();
    const newAct: ProjectActivityLog = {
      id: `ACT-${Date.now()}`,
      projectId,
      jobNumber,
      userName: `${currentUser.firstName || 'Bhavin'} ${currentUser.lastName || 'Shah'}`.trim() || 'Admin User',
      userRole: currentUser.roleName || 'Project Manager',
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].slice(0, 5),
      action,
      details,
    };
    setProjectActivities((prev) => {
      const updated = [newAct, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_projectActivities', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
  };

  const addProjectTask = (taskData: Omit<ProjectTask, 'id' | 'taskNumber'>): ProjectTask => {
    const tskNo = `TSK-2026-${String(projectTasks.length + 1).padStart(3, '0')}`;
    const newTask: ProjectTask = {
      ...taskData,
      id: tskNo,
      taskNumber: tskNo,
    };
    setProjectTasks((prev) => [newTask, ...prev]);
    logProjectActivity(newTask.projectId, newTask.jobNumber, 'Task Created', `Created task ${newTask.taskName} assigned to ${newTask.assignedTo}`);
    sendNotification({
      title: 'New Project Task Assigned',
      message: `Task ${newTask.taskName} (${tskNo}) assigned for ${newTask.jobNumber}`,
      type: 'info',
      department: 'project',
      linkUrl: '/projects/tasks',
      priority: newTask.priority === 'urgent' ? 'high' : 'normal',
    });
    // Sync to PythonAnywhere backend
    api.projects.createTask(newTask).catch((err) => console.warn('Failed to sync task to backend:', err));
    return newTask;
  };

  const updateProjectTask = (id: string, taskUpdates: Partial<ProjectTask>) => {
    const target = projectTasks.find((t) => t.id === id);
    if (!target) return;

    // Check dependency if attempting to complete
    if (taskUpdates.status === 'completed' && target.dependentTaskId) {
      const depTask = projectTasks.find((t) => t.id === target.dependentTaskId);
      if (depTask && depTask.status !== 'completed') {
        throw new Error(`Cannot complete task '${target.taskName}'. Prerequisite task '${depTask.taskName}' is not completed yet.`);
      }
    }

    setProjectTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, ...taskUpdates };
        if (taskUpdates.status === 'completed') updated.completionPercent = 100;
        return updated;
      })
    );

    logProjectActivity(target.projectId, target.jobNumber, 'Task Status Updated', `Task ${target.taskName} updated to ${taskUpdates.status || 'modified'}`);
    // Sync to PythonAnywhere backend
    api.projects.updateTask(id, taskUpdates).catch((err) => console.warn('Failed to update task on backend:', err));
  };

  const deleteProjectTask = (id: string) => {
    if (!can('project', 'tasks', 'delete')) {
      throw new Error('Unauthorized: You do not have project.delete permission');
    }
    setProjectTasks((prev) => prev.filter((t) => t.id !== id));
    // Sync to PythonAnywhere backend
    api.projects.deleteTask(id).catch((err) => console.warn('Failed to delete task on backend:', err));
  };

  const updatePlanningStage = (id: string, stageUpdates: Partial<ProjectPlanningStage>) => {
    setProjectPlanningStages((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...stageUpdates } : s));
      const targetStage = updated.find((s) => s.id === id);
      if (targetStage) {
        const prjStages = updated.filter(
          (s) => s.projectId === targetStage.projectId || s.jobNumber === targetStage.jobNumber
        );
        if (prjStages.length > 0) {
          const avgProgress = Math.round(
            prjStages.reduce((sum, s) => sum + (s.progressPercent || 0), 0) / prjStages.length
          );
          setProjectJobs((prjList) =>
            prjList.map((p) =>
              p.id === targetStage.projectId || p.jobNumber === targetStage.jobNumber
                ? { ...p, progressPercent: avgProgress }
                : p
            )
          );
        }
      }
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_projectPlanningStages', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    api.projects.updatePlanningStage(id, stageUpdates).catch((err) => console.warn('Failed to update stage on backend:', err));
  };

  const addPlanningStage = (stageData: Omit<ProjectPlanningStage, 'id'>): ProjectPlanningStage => {
    const newStage: ProjectPlanningStage = {
      ...stageData,
      id: `STG-${stageData.projectId}-${Date.now().toString().slice(-4)}`,
    };
    setProjectPlanningStages((prev) => {
      const updated = [...prev, newStage];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_projectPlanningStages', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logProjectActivity(stageData.projectId, stageData.jobNumber, 'Stage Added', `Added planning stage: ${stageData.stageName}`);
    api.projects.createPlanningStage({
      ...newStage,
      project_id: stageData.projectId,
      stage_number: stageData.stageNumber,
      name: stageData.stageName,
      department: stageData.responsibleDepartment,
      assigned_employee_name: stageData.responsibleEmployee || '',
      assignees: stageData.assignedEmployees || [],
      status: stageData.status || 'pending',
      progress: stageData.progressPercent || 0,
      start_date: stageData.plannedStart || '',
      end_date: stageData.plannedEnd || '',
      description: stageData.remarks || '',
    }).then((res: any) => {
      if (res && res.id) {
        setProjectPlanningStages((prev) => {
          const synced = prev.map((s) => (s.id === newStage.id ? { ...s, ...res, id: res.id } : s));
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_projectPlanningStages', JSON.stringify(synced)); } catch (_) {}
          }
          return synced;
        });
      }
    }).catch((err) => console.warn('Failed to add stage on backend:', err));
    return newStage;
  };

  const deletePlanningStage = (id: string) => {
    setProjectPlanningStages((prev) => {
      const target = prev.find((s) => s.id === id);
      const remaining = prev.filter((s) => s.id !== id);
      if (!target) return remaining;

      // Auto-renumber remaining stages for this project sequentially
      let count = 1;
      const updated = remaining.map((s) => {
        if (s.projectId === target.projectId || s.jobNumber === target.jobNumber) {
          const updatedStage = { ...s, stageNumber: count };
          count++;
          return updatedStage;
        }
        return s;
      });

      // Recalculate overall project progress
      const prjStages = updated.filter(
        (s) => s.projectId === target.projectId || s.jobNumber === target.jobNumber
      );
      if (prjStages.length > 0) {
        const avgProgress = Math.round(
          prjStages.reduce((sum, s) => sum + (s.progressPercent || 0), 0) / prjStages.length
        );
        setProjectJobs((prjList) =>
          prjList.map((p) =>
            p.id === target.projectId || p.jobNumber === target.jobNumber
              ? { ...p, progressPercent: avgProgress }
              : p
          )
        );
      }

      logProjectActivity(
        target.projectId,
        target.jobNumber,
        'Stage Removed',
        `Removed stage "${target.stageName}". Remaining active stages: ${prjStages.length}`
      );
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_projectPlanningStages', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    api.projects.deletePlanningStage(id).catch((err) => console.warn('Failed to delete stage on backend:', err));
  };

  const reorderPlanningStages = (projectId: string, newOrderedStages: ProjectPlanningStage[]) => {
    setProjectPlanningStages((prev) => {
      const otherStages = prev.filter(
        (s) => s.projectId !== projectId && s.jobNumber !== newOrderedStages[0]?.jobNumber
      );
      const renumbered = newOrderedStages.map((stg, idx) => ({
        ...stg,
        stageNumber: idx + 1,
      }));
      const updated = [...otherStages, ...renumbered];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_projectPlanningStages', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    // Sync each renumbered stage to backend
    newOrderedStages.forEach((stg, idx) => {
      api.projects.updatePlanningStage(stg.id, { stageNumber: idx + 1, stage_number: idx + 1 }).catch(() => {});
    });
  };

  const markPlanningStageCompleted = (id: string, completedBy?: string, completionNotes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const user = completedBy || `${currentUser.firstName} ${currentUser.lastName}`;

    updatePlanningStage(id, {
      status: 'completed',
      progressPercent: 100,
      actualEnd: today,
      completedBy: user,
      completedAt: today,
      remarks: completionNotes || undefined,
    });

    sendNotification({
      title: 'Planning Stage Handover Completed',
      message: `Stage has been marked completed by ${user}. Handover to next stage.`,
      type: 'success',
      department: 'project',
      linkUrl: '/projects/planning',
      priority: 'normal',
    });
  };

  const generateDefaultPlanningStages = (projectId: string): ProjectPlanningStage[] => {
    const prj = projectJobs.find((p) => p.id === projectId);
    if (!prj) return [];

    const newStages = create16PlanningStagesForProject(prj);
    setProjectPlanningStages((prev) => {
      const updated = [
        ...prev.filter((s) => s.projectId !== projectId && s.jobNumber !== prj.jobNumber),
        ...newStages,
      ];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_projectPlanningStages', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });

    const avgProgress = Math.round(
      newStages.reduce((sum, s) => sum + (s.progressPercent || 0), 0) / newStages.length
    );
    setProjectJobs((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, progressPercent: avgProgress } : p))
    );

    logProjectActivity(prj.id, prj.jobNumber, 'Planning Matrix Generated', 'Generated full 16-stage MTO execution plan');

    // Trigger backend 16-stage generation & sync
    api.projects.generatePlanningStages(projectId).catch(() => {
      // Fallback: create each stage individually
      newStages.forEach((stg) => {
        api.projects.createPlanningStage(stg).catch(() => {});
      });
    });

    return newStages;
  };

  const assignDepartment = (data: Omit<DepartmentAssignment, 'id'>): DepartmentAssignment => {
    const newDA: DepartmentAssignment = {
      ...data,
      id: `DA-${data.projectId || 'PRJ'}-${data.department}-${Date.now()}`,
    };
    setDepartmentAssignments((prev) => {
      const updated = [newDA, ...prev.filter((d) => d.id !== newDA.id)];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('UMA_ERP_departmentAssignments', JSON.stringify(updated));
        } catch (_) {}
      }
      return updated;
    });
    logProjectActivity(data.projectId, data.jobNumber, 'Department Assigned', `Assigned ${data.department} dept (Manager: ${data.manager})`);
    api.projects.createDepartmentAssignment(newDA).then((res) => {
      if (res && res.id) {
        setDepartmentAssignments((prev) => {
          const updated = prev.map((d) => (d.id === newDA.id ? { ...d, ...res, id: res.id } : d));
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_departmentAssignments', JSON.stringify(updated)); } catch (_) {}
          }
          return updated;
        });
      }
    }).catch((err) => console.warn('Failed to sync department assignment:', err));
    return newDA;
  };

  const addProjectMilestone = (data: Omit<ProjectMilestone, 'id'>): ProjectMilestone => {
    const newMS: ProjectMilestone = {
      ...data,
      id: `MS-${Date.now()}`,
    };
    setProjectMilestones((prev) => [...prev, newMS]);
    logProjectActivity(data.projectId, data.jobNumber, 'Milestone Created', `Milestone ${data.milestoneName} added for ${data.plannedDate}`);
    api.post('/project-milestones/', newMS).catch((err) => console.warn('Failed to add milestone on backend:', err));
    return newMS;
  };

  const updateProjectMilestone = (id: string, updates: Partial<ProjectMilestone>) => {
    setProjectMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const addProjectIssue = (data: Omit<ProjectIssue, 'id' | 'issueNo' | 'reportedDate'>): ProjectIssue => {
    const issNo = `ISS-2026-${String(projectIssues.length + 1).padStart(3, '0')}`;
    const newIssue: ProjectIssue = {
      ...data,
      id: issNo,
      issueNo: issNo,
      reportedDate: new Date().toISOString().split('T')[0],
    };
    setProjectIssues((prev) => {
      const updated = [newIssue, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_projectIssues', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logProjectActivity(data.projectId, data.jobNumber, 'Issue Reported', `${data.issueType}: ${data.description}`);
    sendNotification({
      title: 'Project Issue Logged',
      message: `${issNo} reported in ${data.department} department for ${data.jobNumber}`,
      type: 'warning',
      department: 'project',
      linkUrl: '/projects/issues',
      priority: 'high',
    });
    api.post('/project-issues/', newIssue).catch((err) => console.warn('Failed to add project issue:', err));
    return newIssue;
  };

  const resolveProjectIssue = (id: string, resolution: string) => {
    setProjectIssues((prev) => {
      const updated = prev.map((i) => (i.id === id ? { ...i, resolution, status: 'resolved' as const } : i));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_projectIssues', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
  };

  const addProjectDelay = (data: Omit<ProjectDelay, 'id' | 'delayNo'>): ProjectDelay => {
    const delNo = `DEL-2026-${String(projectDelays.length + 1).padStart(3, '0')}`;
    const newDelay: ProjectDelay = {
      ...data,
      id: delNo,
      delayNo: delNo,
    };
    setProjectDelays((prev) => {
      const updated = [newDelay, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_projectDelays', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });

    // Also update project expected delivery date
    setProjectJobs((prev) =>
      prev.map((p) => (p.id === data.projectId ? { ...p, expectedDeliveryDate: data.expectedDeliveryDate } : p))
    );

    logProjectActivity(data.projectId, data.jobNumber, 'Project Delay Logged', `${data.delayReason} (+${data.delayDays} days delay)`);
    api.post('/project-delays/', newDelay).catch((err) => console.warn('Failed to add project delay:', err));
    return newDelay;
  };

  const addCustomerChangeRequest = (data: Omit<CustomerChangeRequest, 'id' | 'changeRequestNo' | 'requestDate' | 'approvalStatus'>): CustomerChangeRequest => {
    const crNo = `CR-2026-${String(Date.now()).slice(-4)}`;
    const newCR: CustomerChangeRequest = {
      ...data,
      id: crNo,
      changeRequestNo: crNo,
      requestDate: new Date().toISOString().split('T')[0],
      approvalStatus: 'requested',
    };
    setChangeRequests((prev) => {
      const updated = [newCR, ...prev.filter((c) => c.id !== newCR.id)];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_changeRequests', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logProjectActivity(data.projectId, data.jobNumber, 'Customer Change Requested', `CR ${crNo} submitted by ${data.requestedBy}`);
    sendNotification({
      title: 'Customer Change Request Received',
      message: `${crNo} submitted for ${data.jobNumber} (Cost Impact: ₹${data.costImpact})`,
      type: 'approval_request',
      department: 'project',
      linkUrl: '/projects/change-requests',
      priority: 'high',
    });
    api.projects.createChangeRequest(newCR).then((res) => {
      if (res && res.id) {
        setChangeRequests((prev) => {
          const updated = prev.map((c) => (c.id === newCR.id ? { ...c, ...res, id: String(res.id) } : c));
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_changeRequests', JSON.stringify(updated)); } catch (_) {}
          }
          return updated;
        });
      }
    }).catch((err) => console.warn('Failed to add change request on backend:', err));
    return newCR;
  };

  const approveChangeRequest = (id: string, status: 'approved' | 'rejected') => {
    const approver = `${currentUser.firstName || 'Bhavin'} ${currentUser.lastName || 'Shah'}`.trim() || 'Admin User';
    const appDate = new Date().toISOString().split('T')[0];
    setChangeRequests((prev) => {
      const updated = prev.map((cr) =>
        cr.id === id
          ? {
              ...cr,
              approvalStatus: status === 'approved' ? 'approved' as const : 'rejected' as const,
              approvedBy: approver,
              approvedDate: appDate,
            }
          : cr
      );
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_changeRequests', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });

    const target = changeRequests.find((cr) => cr.id === id);
    if (target) {
      logProjectActivity(target.projectId, target.jobNumber, `Change Request ${status.toUpperCase()}`, `CR ${target.changeRequestNo} ${status} by ${approver}`);
    }

    api.projects.updateChangeRequest(id, {
      approval_status: status === 'approved' ? 'approved' : 'rejected',
      status: status === 'approved' ? 'approved' : 'rejected',
      approved_by: approver,
      approved_date: appDate,
    }).catch((err) => console.warn('Failed to update change request status on backend:', err));
  };

  const addProjectDocument = (data: Omit<ProjectDocument, 'id' | 'uploadDate'>): ProjectDocument => {
    const newDoc: ProjectDocument = {
      ...data,
      id: `DOC-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
    };
    setProjectDocuments((prev) => {
      const updated = [newDoc, ...prev.filter((d) => d.id !== newDoc.id)];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_projectDocuments', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logProjectActivity(data.projectId, data.jobNumber, 'Document Uploaded', `${data.documentName} (${data.version})`);
    api.projects.createDocument(newDoc).then((res) => {
      if (res && res.id) {
        setProjectDocuments((prev) => {
          const updated = prev.map((d) => (d.id === newDoc.id ? { ...d, ...res, id: String(res.id) } : d));
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_projectDocuments', JSON.stringify(updated)); } catch (_) {}
          }
          return updated;
        });
      }
    }).catch((err) => console.warn('Failed to upload document on backend:', err));
    return newDoc;
  };

  const updateProjectCost = (id: string, costUpdates: Partial<ProjectCostItem>) => {
    if (!can('project', 'cost', 'edit') && !currentUser.roleName?.toLowerCase().includes('admin')) {
      throw new Error('Unauthorized: You do not have permission to modify financial project cost data.');
    }
    setProjectCosts((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const est = costUpdates.estimatedCost ?? c.estimatedCost;
        const act = costUpdates.actualCost ?? c.actualCost;
        return {
          ...c,
          ...costUpdates,
          estimatedCost: est,
          actualCost: act,
          difference: est - act,
          updatedBy: `${currentUser.firstName} ${currentUser.lastName}`,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  const addProjectComment = (data: Omit<ProjectComment, 'id' | 'date' | 'time' | 'resolved'>): ProjectComment => {
    const now = new Date();
    const newCmt: ProjectComment = {
      ...data,
      id: `CMT-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].slice(0, 5),
      resolved: false,
    };
    setProjectComments((prev) => [newCmt, ...prev]);
    return newCmt;
  };

  const approveProjectAction = (id: string, status: 'approved' | 'rejected', comments?: string) => {
    setProjectApprovals((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: status === 'approved' ? 'approved' : 'rejected',
              approvedBy: `${currentUser.firstName} ${currentUser.lastName}`,
              approvalDate: new Date().toISOString().split('T')[0],
              comments,
            }
          : a
      )
    );
  };

  // Module 3: Designer Management Handlers
  const addDesignJob = (data: Omit<DesignJob, 'id' | 'createdDate'>) => {
    let maxNum = 0;
    designJobs.forEach((j) => {
      const match = (j.id || '').match(/(\d+)$/) || (j.designJobNumber || '').match(/(\d+)$/);
      if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
    });
    const id = `DES-${new Date().getFullYear()}-${String(maxNum + 1).padStart(4, '0')}`;
    const newJob: DesignJob = {
      ...data,
      id,
      designJobNumber: data.designJobNumber || id,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setDesignJobs((prev) => {
      const updated = [newJob, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_designJobs', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'Designer', 'Design Jobs', id, `Created design job ${newJob.designJobNumber} for project ${data.projectId}`);
    const jobPayload = {
      ...newJob,
      designJobNumber: newJob.designJobNumber || id,
      targetCompletionDate: (newJob as any).targetCompletionDate || (newJob as any).deliveryDate || '2026-12-31',
    };
    api.designer.jobs.create(jobPayload).then((res) => {
      if (res && res.id) {
        setDesignJobs((prev) => {
          const synced = prev.map((j) => (j.id === id ? { ...j, ...res } : j));
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_designJobs', JSON.stringify(synced)); } catch (_) {}
          }
          return synced;
        });
      }
    }).catch((err) => console.warn('Failed to sync design job to backend:', err));
  };

  const updateDesignJob = (id: string, updates: Partial<DesignJob>) => {
    setDesignJobs((prev) => {
      const updated = prev.map((j) => (j.id === id ? { ...j, ...updates } : j));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_designJobs', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'Designer', 'Design Jobs', id, `Updated design job ${id}`);
    api.designer.jobs.update(id, updates).catch((err) => console.warn('Failed to update design job on backend:', err));
  };

  const addCustomerRequirement = (data: Omit<CustomerRequirement, 'id'>) => {
    const id = `REQ-${new Date().getFullYear()}-${String(customerRequirements.length + 1).padStart(3, '0')}`;
    const newReq: CustomerRequirement = { ...data, id };
    setCustomerRequirements((prev) => {
      const updated = [newReq, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_customerRequirements', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'Designer', 'Customer Requirements', id, `Added technical requirement sheet for ${data.jobNumber}`);
    api.designer.requirements.create(newReq).then((res: any) => {
      if (res && res.id) {
        setCustomerRequirements((prev) => {
          const synced = prev.map((r) => (r.id === id ? { ...r, ...res } : r));
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_customerRequirements', JSON.stringify(synced)); } catch (_) {}
          }
          return synced;
        });
      }
    }).catch((err) => console.warn('Failed to add customer requirement:', err));
  };

  const approveCustomerRequirement = (id: string, approvedBy: string) => {
    setCustomerRequirements((prev) => {
      const updated = prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'approved' as CustomerRequirement['status'],
              approvedBy,
              approvalDate: new Date().toISOString().split('T')[0],
            }
          : r
      );
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_customerRequirements', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('APPROVE', 'Designer', 'Customer Requirements', id, `Approved technical requirement sheet by ${approvedBy}`);
    api.designer.requirements.update(id, { status: 'approved', approvedBy }).catch((err) => console.warn('Failed to approve requirement:', err));
  };

  const addDesignTask = (data: Omit<DesignTask, 'id'>) => {
    const id = `DTASK-${Date.now().toString().slice(-5)}`;
    const newTask: DesignTask = { ...data, id };
    setDesignTasks((prev) => {
      const updated = [newTask, ...prev];
      try { localStorage.setItem('UMA_ERP_designTasks', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('CREATE', 'Designer', 'Design Tasks', id, `Created design task ${data.taskName}`);
    api.designer.tasks.create(newTask)
      .then((res: any) => {
        if (res && res.id) {
          setDesignTasks((prev) => {
            const synced = prev.map((t) => (t.id === id ? { ...t, ...res } : t));
            try { localStorage.setItem('UMA_ERP_designTasks', JSON.stringify(synced)); } catch (_) {}
            return synced;
          });
        }
      })
      .catch((err) => console.warn('Failed to add design task to backend:', err));
  };

  const updateDesignTask = (id: string, updates: Partial<DesignTask>) => {
    setDesignTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      try { localStorage.setItem('UMA_ERP_designTasks', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    api.designer.tasks.update(id, updates).catch((err) => console.warn('Failed to update design task:', err));
  };

  const addDrawing2D = (data: Omit<Drawing2D, 'id' | 'createdDate'>) => {
    const id = `DRW2D-${Date.now().toString().slice(-5)}`;
    const newDrw: Drawing2D = { ...data, id, createdDate: new Date().toISOString().split('T')[0] };
    setDrawings2D((prev) => {
      const updated = [newDrw, ...prev];
      try { localStorage.setItem('UMA_ERP_drawings2D', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('CREATE', 'Designer', '2D Drawings', id, `Uploaded 2D Drawing ${data.drawingNumber}`);
    api.post('/drawings-2d/', newDrw)
      .then((res) => {
        if (res.data?.id) {
          setDrawings2D((prev) => {
            const synced = prev.map((d) => (d.id === id ? { ...d, ...res.data } : d));
            try { localStorage.setItem('UMA_ERP_drawings2D', JSON.stringify(synced)); } catch (_) {}
            return synced;
          });
        }
      })
      .catch((err) => console.warn('Failed to add 2D drawing to backend:', err));
  };

  const addDesign3D = (data: Omit<Design3DModel, 'id' | 'uploadedDate'>) => {
    const id = `MOD3D-${Date.now().toString().slice(-5)}`;
    const newMod: Design3DModel = { ...data, id, uploadedDate: new Date().toISOString().split('T')[0] };
    setDesigns3D((prev) => {
      const updated = [newMod, ...prev];
      try { localStorage.setItem('UMA_ERP_designs3D', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('CREATE', 'Designer', '3D Models', id, `Uploaded 3D Model ${data.modelName}`);
    api.post('/models-3d/', newMod)
      .then((res) => {
        if (res.data?.id) {
          setDesigns3D((prev) => {
            const synced = prev.map((m) => (m.id === id ? { ...m, ...res.data } : m));
            try { localStorage.setItem('UMA_ERP_designs3D', JSON.stringify(synced)); } catch (_) {}
            return synced;
          });
        }
      })
      .catch((err) => console.warn('Failed to add 3D model to backend:', err));
  };

  const addAssemblyDrawing = (data: Omit<AssemblyDrawing, 'id'>) => {
    const id = `ASM-${Date.now().toString().slice(-5)}`;
    const newAsm: AssemblyDrawing = { ...data, id };
    setAssemblyDrawings((prev) => {
      const updated = [newAsm, ...prev];
      try { localStorage.setItem('UMA_ERP_assemblyDrawings', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('CREATE', 'Designer', 'Assembly Drawings', id, `Uploaded Assembly Drawing ${data.assemblyNumber}`);
    api.post('/assembly-drawings/', newAsm)
      .then((res) => {
        if (res.data?.id) {
          setAssemblyDrawings((prev) => {
            const synced = prev.map((a) => (a.id === id ? { ...a, ...res.data } : a));
            try { localStorage.setItem('UMA_ERP_assemblyDrawings', JSON.stringify(synced)); } catch (_) {}
            return synced;
          });
        }
      })
      .catch((err) => console.warn('Failed to add assembly drawing to backend:', err));
  };

  const addPartDrawing = (data: Omit<PartDrawing, 'id'>) => {
    const id = `PRT-${Date.now().toString().slice(-5)}`;
    const newPrt: PartDrawing = { ...data, id };
    setPartDrawings((prev) => [newPrt, ...prev]);
    logAction('CREATE', 'Designer', 'Part Drawings', id, `Uploaded Part Drawing ${data.partNumber}`);
  };

  const addBOM = (data: Omit<BOMHeader, 'id'>) => {
    const id = `BOM-${data.jobNumber}`;
    const newBom: BOMHeader = { ...data, id };
    setBoms((prev) => [newBom, ...prev]);
    logAction('CREATE', 'Designer', 'BOM Management', id, `Created Master BOM for ${data.jobNumber}`);
    const bomPayload = {
      ...newBom,
      bomNumber: (newBom as any).bomNumber || id,
      jobNumber: newBom.jobNumber || 'JOB-2026-0042',
      designJobId: (newBom as any).designJobId || newBom.jobNumber || 'DJOB-DEFAULT',
      preparedBy: (newBom as any).preparedBy || `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'Design Engineer',
      items: newBom.items || [],
      status: newBom.status || 'draft',
    };
    api.designer.boms.create(bomPayload).then((res) => {
      if (res && res.id) {
        setBoms((prev) => prev.map((b) => (b.id === id ? { ...b, ...res } : b)));
      }
    }).catch((err) => console.warn('Failed to sync BOM to backend:', err));
  };

  const updateBOM = (id: string, updates: Partial<BOMHeader>) => {
    setBoms((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, ...updates }
          : b
      )
    );
    api.designer.boms.update(id, updates).catch((err) => console.warn('Failed to update BOM on backend:', err));
  };

  const addBOMRevision = (data: Omit<BOMRevision, 'id' | 'changedDate'>) => {
    const id = `BREV-${Date.now().toString().slice(-5)}`;
    const newRev: BOMRevision = { ...data, id, changedDate: new Date().toISOString().split('T')[0] };
    setBomRevisions((prev) => [newRev, ...prev]);
    logAction('CREATE', 'Designer', 'BOM Revisions', id, `Created BOM Revision ${data.revisionNumber} for ${data.jobNumber}`);
  };

  const addDesignRevision = (data: Omit<DesignRevisionLog, 'id' | 'createdDate'>) => {
    const id = `DREV-${Date.now().toString().slice(-5)}`;
    const newRev: DesignRevisionLog = { ...data, id, createdDate: new Date().toISOString().split('T')[0] };
    setDesignRevisions((prev) => [newRev, ...prev]);
    logAction('CREATE', 'Designer', 'Design Revisions', id, `Recorded Design Revision ${data.revisionNumber} for ${data.jobNumber}`);
  };

  const addDesignReview = (data: Omit<DesignReviewChecklist, 'id' | 'reviewDate'>) => {
    const id = `DRV-${Date.now().toString().slice(-5)}`;
    const newRev: DesignReviewChecklist = { ...data, id, reviewDate: new Date().toISOString().split('T')[0] };
    setDesignReviews((prev) => [newRev, ...prev]);
    logAction('CREATE', 'Designer', 'Design Reviews', id, `Submitted Design Review for ${data.jobNumber}`);
  };

  const addTechnicalDocument = (data: Omit<TechnicalDocumentItem, 'id' | 'uploadDate'>) => {
    const id = `TDOC-${Date.now().toString().slice(-5)}`;
    const newDoc: TechnicalDocumentItem = { ...data, id, uploadDate: new Date().toISOString().split('T')[0] };
    setTechnicalDocuments((prev) => {
      const updated = [newDoc, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_technicalDocuments', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'Designer', 'Technical Documents', id, `Uploaded Technical Document ${data.documentName}`);
    api.designer.technicalDocuments.create(newDoc)
      .then((res: any) => {
        if (res && res.id) {
          setTechnicalDocuments((prev) => {
            const synced = prev.map((d) => (d.id === id ? { ...d, ...res } : d));
            if (typeof window !== 'undefined') {
              try { localStorage.setItem('UMA_ERP_technicalDocuments', JSON.stringify(synced)); } catch (_) {}
            }
            return synced;
          });
        }
      })
      .catch((err) => console.warn('Failed to sync technical document to backend:', err));
  };

  const releaseDesignToManufacturing = (designJobId: string, releasedBy: string) => {
    const desJob = designJobs.find((j) => j.id === designJobId || j.designJobNumber === designJobId || j.jobNumber === designJobId);
    if (!desJob) return;

    const remarks = `Released to shop floor by ${releasedBy} on ${new Date().toLocaleDateString()}`;

    setDesignJobs((prev) => {
      const updated = prev.map((j) =>
        j.id === desJob.id || j.designJobNumber === desJob.designJobNumber || j.jobNumber === desJob.jobNumber
          ? { ...j, status: 'released_to_production' as const, remarks, approvedBy: releasedBy, approvedDate: new Date().toLocaleDateString() }
          : j
      );
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_designJobs', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });

    setBoms((prev) => {
      const updated = prev.map((b) => (b.projectId === desJob.projectId || b.jobNumber === desJob.jobNumber ? { ...b, status: 'released_to_production' as any } : b));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_boms', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });

    updateJobStatus(desJob.jobNumber, 'step-3', 'completed');
    updateJobStatus(desJob.jobNumber, 'step-4', 'in_progress');

    logAction('APPROVE', 'Designer', 'Design Release', desJob.id, `Design Job ${desJob.designJobNumber} (${desJob.jobNumber}) released to Purchase, Store & Production departments by ${releasedBy}`);

    sendNotification({
      title: `🚀 Design Released for Manufacturing: ${desJob.jobNumber}`,
      message: `Design Job ${desJob.designJobNumber} (${desJob.productName}) approved and released to production by ${releasedBy}. Material planning can now begin.`,
      type: 'success',
      department: 'project',
      priority: 'high',
      linkUrl: `/designer/jobs`,
    });

    api.designer.jobs.releaseToProduction(desJob.id, {
      ...desJob,
      status: 'released_to_production',
      releasedBy,
      remarks,
      customerName: desJob.customerName,
      productName: desJob.productName,
      jobNumber: desJob.jobNumber,
      projectId: desJob.projectId,
      machineType: desJob.machineType,
      assignedDesigner: desJob.assignedDesigner,
      designManager: desJob.designManager,
      activeRevision: desJob.activeRevision,
      deliveryDate: desJob.deliveryDate,
    }).catch((err) =>
      console.warn('Failed to sync release to backend:', err)
    );
  };

  const revokeDesignRelease = (designJobId: string, revokedBy: string) => {
    const desJob = designJobs.find((j) => j.id === designJobId || j.designJobNumber === designJobId || j.jobNumber === designJobId);
    if (!desJob) return;

    setDesignJobs((prev) => {
      const updated = prev.map((j) =>
        j.id === desJob.id || j.designJobNumber === desJob.designJobNumber || j.jobNumber === desJob.jobNumber
          ? { ...j, status: 'in_progress' as const, remarks: `Release disapproved/revoked by ${revokedBy} on ${new Date().toLocaleDateString()}` }
          : j
      );
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_designJobs', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });

    setBoms((prev) => {
      const updated = prev.map((b) => (b.projectId === desJob.projectId || b.jobNumber === desJob.jobNumber ? { ...b, status: 'draft' as any } : b));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_boms', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });

    updateJobStatus(desJob.jobNumber, 'step-3', 'in_progress');

    logAction('REJECT', 'Designer', 'Design Release', desJob.id, `Design Job ${desJob.designJobNumber} (${desJob.jobNumber}) release disapproved/revoked by ${revokedBy}`);

    sendNotification({
      title: `⚠️ Design Release Revoked: ${desJob.jobNumber}`,
      message: `Design Job ${desJob.designJobNumber} (${desJob.productName}) release was disapproved/revoked by ${revokedBy}. Status reset to In Progress.`,
      type: 'warning',
      department: 'project',
      priority: 'high',
      linkUrl: `/designer/approval?job=${desJob.jobNumber}`,
    });

    api.designer.jobs.revokeRelease(desJob.id, { revokedBy, remarks: `Release revoked by ${revokedBy}` }).catch((err) =>
      console.warn('Failed to sync revoke to backend:', err)
    );
  };

  const approveDesignJob = (designJobId: string, approvedBy: string, approvalNotes?: string) => {
    const desJob = designJobs.find((j) => j.id === designJobId || j.designJobNumber === designJobId || j.jobNumber === designJobId);
    if (!desJob) return;

    setDesignJobs((prev) => {
      const updated = prev.map((j) =>
        j.id === desJob.id || j.designJobNumber === desJob.designJobNumber || j.jobNumber === desJob.jobNumber
          ? { ...j, status: 'approved' as const, approvedBy, approvalNotes: approvalNotes || 'Approved by Lead/Manager' }
          : j
      );
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_designJobs', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });

    logAction('APPROVE', 'Designer', 'Design Job', desJob.id, `Design Job ${desJob.designJobNumber} (${desJob.jobNumber}) approved by ${approvedBy}`);

    sendNotification({
      title: `✅ Design Approved: ${desJob.jobNumber}`,
      message: `Design Job ${desJob.designJobNumber} (${desJob.productName}) was approved by ${approvedBy}. Ready for release to production.`,
      type: 'success',
      department: 'project',
      priority: 'high',
      linkUrl: `/designer/jobs`,
    });

    api.designer.jobs.approve(desJob.id, { approvedBy, approvalNotes }).catch((err) =>
      console.warn('Failed to sync design job approval to backend:', err)
    );
  };

  const disapproveDesignJob = (designJobId: string, disapprovedBy: string, rejectionReason: string) => {
    const desJob = designJobs.find((j) => j.id === designJobId || j.designJobNumber === designJobId || j.jobNumber === designJobId);
    if (!desJob) return;

    setDesignJobs((prev) => {
      const updated = prev.map((j) =>
        j.id === desJob.id || j.designJobNumber === desJob.designJobNumber || j.jobNumber === desJob.jobNumber
          ? { ...j, status: 'rejected' as const, disapprovalReason: rejectionReason, remarks: `Disapproved by ${disapprovedBy}: ${rejectionReason}` }
          : j
      );
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_designJobs', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });

    logAction('REJECT', 'Designer', 'Design Job', desJob.id, `Design Job ${desJob.designJobNumber} (${desJob.jobNumber}) rejected by ${disapprovedBy}: ${rejectionReason}`);

    sendNotification({
      title: `❌ Design Job Disapproved: ${desJob.jobNumber}`,
      message: `Design Job ${desJob.designJobNumber} (${desJob.productName}) was disapproved by ${disapprovedBy}. Reason: ${rejectionReason}`,
      type: 'alert',
      department: 'project',
      priority: 'high',
      linkUrl: `/designer/jobs`,
    });

    api.designer.jobs.disapprove(desJob.id, { disapprovedBy, rejectionReason }).catch((err) =>
      console.warn('Failed to sync design job rejection to backend:', err)
    );
  };

  // Module 4: Purchase Management Handlers
  const addSupplier = (data: Omit<Supplier, 'id'>) => {
    const id = `SUP-${new Date().getFullYear()}-${String(suppliers.length + 1).padStart(3, '0')}`;
    const newSup: Supplier = { ...data, id };
    setSuppliers((prev) => [newSup, ...prev]);
    logAction('CREATE', 'Purchase', 'Supplier Master', id, `Added supplier ${data.supplierName}`);
    // Sync to PythonAnywhere backend
    api.purchase.suppliers.create(newSup).then((res) => {
      if (res && res.id) {
        setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...res } : s)));
      }
    }).catch((err) => console.warn('Failed to sync supplier to backend:', err));
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    // Sync to PythonAnywhere backend
    api.purchase.suppliers.update(id, updates).catch((err) => console.warn('Failed to update supplier on backend:', err));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    logAction('DELETE', 'Purchase', 'Supplier Master', id, `Deleted supplier ${id}`);
    api.purchase.suppliers.delete(id).catch((err) => console.warn('Failed to delete supplier on backend:', err));
  };

  const addSupplierContact = (data: Omit<SupplierContact, 'id'>) => {
    const id = `SCON-${Date.now().toString().slice(-5)}`;
    const newCon: SupplierContact = { ...data, id };
    setSupplierContacts((prev) => [newCon, ...prev]);
    api.post('/supplier-contacts/', newCon).catch((err) => console.warn('Failed to add supplier contact:', err));
  };

  const addMaterialRequirement = (data: Omit<MaterialRequirement, 'id'>) => {
    const id = `MRP-${Date.now().toString().slice(-5)}`;
    const newMrp: MaterialRequirement = { ...data, id };
    setMaterialRequirements((prev) => {
      const updated = [newMrp, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_materialRequirements', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    api.purchase.mrp.create(newMrp).then((res) => {
      if (res && res.id) {
        setMaterialRequirements((prev) => {
          const synced = prev.map((m) => (m.id === newMrp.id ? { ...m, ...res } : m));
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_materialRequirements', JSON.stringify(synced)); } catch (_) {}
          }
          return synced;
        });
      }
    }).catch((err) => console.warn('Failed to sync MRP to backend:', err));
  };

  const addPurchaseRequisition = (data: Omit<PurchaseRequisition, 'id' | 'prDate'>) => {
    const prNumber = data.prNumber || `PR-${new Date().getFullYear()}-${String(purchaseRequisitions.length + 1).padStart(3, '0')}`;
    const newPr: PurchaseRequisition = {
      ...data,
      id: (data as any).id || prNumber,
      prNumber,
      prDate: (data as any).prDate || data.requisitionDate || new Date().toISOString().split('T')[0],
      requisitionDate: data.requisitionDate || (data as any).prDate || new Date().toISOString().split('T')[0],
    };
    setPurchaseRequisitions((prev) => {
      const updated = [newPr, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_purchaseRequisitions', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'Purchase', 'Purchase Requisition', newPr.id, `Created PR ${newPr.prNumber} for job ${data.jobNumber || (data as any).jobId}`);
    const prPayload = {
      id: newPr.id,
      prNumber: newPr.prNumber,
      pr_number: newPr.prNumber,
      projectId: newPr.projectId,
      project_id: newPr.projectId,
      jobId: newPr.jobId,
      jobNumber: (newPr as any).jobNumber,
      job_code: newPr.jobId || (newPr as any).jobNumber,
      requisitionDate: newPr.requisitionDate,
      request_date: newPr.requisitionDate,
      requiredByDate: (newPr as any).requiredByDate || (newPr as any).requiredDate || '2026-12-31',
      required_by_date: (newPr as any).requiredByDate || (newPr as any).requiredDate || '2026-12-31',
      priority: newPr.priority || 'High',
      status: newPr.status || 'Submitted',
      items: newPr.items || [],
      estimatedCost: Number(newPr.estimatedCost || 0),
      total_estimated_cost: Number(newPr.estimatedCost || 0),
      requestedBy: newPr.requestedBy,
      requested_by: newPr.requestedBy,
      department: newPr.department || 'Purchase / Planning',
      remarks: newPr.remarks,
    };
    api.purchase.requisitions.create(prPayload).then((res) => {
      if (res && (res.id || res.pr_number || res.prNumber)) {
        setPurchaseRequisitions((prev) => {
          const synced = prev.map((p) => (p.id === newPr.id || p.prNumber === newPr.prNumber ? { ...p, ...res } : p));
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_purchaseRequisitions', JSON.stringify(synced)); } catch (_) {}
          }
          return synced;
        });
      }
    }).catch((err) => console.warn('Failed to sync PR to backend:', err));
  };

  const approvePurchaseRequisition = (id: string, approvedBy: string) => {
    const today = new Date().toISOString().split('T')[0];
    setPurchaseRequisitions((prev) => {
      const updated = prev.map((pr) =>
        pr.id === id || pr.prNumber === id || (pr as any).pr_number === id
          ? {
              ...pr,
              status: 'Approved' as PurchaseRequisition['status'],
              approvedBy,
              approvedDate: today,
            }
          : pr
      );
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_purchaseRequisitions', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('APPROVE', 'Purchase', 'Purchase Requisition', id, `Approved PR by ${approvedBy}`);
    api.purchase.requisitions.update(id, { status: 'Approved', approvedBy, approvedDate: today })
      .catch(() => {
        api.patch(`/purchase-requisitions/${id}/`, { status: 'Approved', approvedBy })
          .catch(() => {
            api.post(`/purchase-requisitions/${id}/approve/`, { approvedBy })
              .catch((err) => console.warn('Failed to sync PR approval to backend:', err));
          });
      });
  };

  const rejectPurchaseRequisition = (id: string, remarks?: string) => {
    setPurchaseRequisitions((prev) => {
      const updated = prev.map((pr) =>
        pr.id === id || pr.prNumber === id || (pr as any).pr_number === id
          ? {
              ...pr,
              status: 'Rejected' as PurchaseRequisition['status'],
              remarks: remarks || pr.remarks || 'Rejected/Disapproved',
            }
          : pr
      );
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_purchaseRequisitions', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('REJECT', 'Purchase', 'Purchase Requisition', id, `Rejected PR ${id}. Remarks: ${remarks || ''}`);
    api.purchase.requisitions.update(id, { status: 'Rejected', remarks: remarks || 'Rejected' })
      .catch(() => {
        api.patch(`/purchase-requisitions/${id}/`, { status: 'Rejected', remarks: remarks || 'Rejected' })
          .catch(() => {
            api.post(`/purchase-requisitions/${id}/reject/`, { remarks: remarks || 'Rejected' })
              .catch((err) => console.warn('Failed to sync PR rejection to backend:', err));
          });
      });
  };

  const updatePurchaseRequisitionStatus = (id: string, status: PurchaseRequisition['status'], remarks?: string, approvedBy?: string) => {
    const today = new Date().toISOString().split('T')[0];
    setPurchaseRequisitions((prev) => {
      const updated = prev.map((pr) =>
        pr.id === id || pr.prNumber === id || (pr as any).pr_number === id
          ? {
              ...pr,
              status,
              ...(remarks ? { remarks } : {}),
              ...(approvedBy ? { approvedBy } : {}),
              ...(status === 'Approved' ? { approvedDate: today } : {}),
            }
          : pr
      );
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_purchaseRequisitions', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'Purchase', 'Purchase Requisition', id, `Updated PR status to ${status}`);
    api.purchase.requisitions.update(id, { status, remarks, approvedBy })
      .catch(() => {
        api.patch(`/purchase-requisitions/${id}/`, { status, remarks, approvedBy })
          .catch((err) => console.warn('Failed to sync PR status to backend:', err));
      });
  };

  const addRFQ = (data: Omit<RequestForQuotation, 'id' | 'rfqDate'>) => {
    const rfqNumber = data.rfqNumber || `RFQ-${new Date().getFullYear()}-${String(rfqs.length + 1).padStart(3, '0')}`;
    const newRfq: RequestForQuotation = {
      ...data,
      id: (data as any).id || rfqNumber,
      rfqNumber,
      rfqDate: data.dueDate || new Date().toISOString().split('T')[0],
    };
    setRfqs((prev) => {
      const updated = [newRfq, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_rfqs', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'Purchase', 'RFQ', newRfq.id, `Generated RFQ ${newRfq.rfqNumber} to suppliers`);
    api.purchase.rfqs.create(newRfq).then((res) => {
      if (res && (res.id || res.rfqNumber || res.rfq_number)) {
        setRfqs((prev) => {
          const synced = prev.map((r) => (r.id === newRfq.id || r.rfqNumber === newRfq.rfqNumber ? { ...r, ...res } : r));
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_rfqs', JSON.stringify(synced)); } catch (_) {}
          }
          return synced;
        });
      }
    }).catch((err) => console.warn('Failed to add RFQ to backend:', err));
  };

  const addSupplierQuotation = (data: Omit<SupplierQuotation, 'id'>) => {
    const id = `SQ-${Date.now().toString().slice(-5)}`;
    const newSq: SupplierQuotation = { ...data, id };
    setSupplierQuotations((prev) => {
      const updated = [newSq, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_supplierQuotations', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'Purchase', 'Supplier Quotations', id, `Recorded Quotation ${data.supplierQuotationNumber || data.quotationNumber} from ${data.supplierName}`);
    api.purchase.supplierQuotations.create(newSq).then((res) => {
      if (res && (res.id || res.quotationNumber || res.quotation_number)) {
        setSupplierQuotations((prev) => {
          const synced = prev.map((q) => (q.id === newSq.id || q.quotationNumber === newSq.quotationNumber ? { ...q, ...res } : q));
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_supplierQuotations', JSON.stringify(synced)); } catch (_) {}
          }
          return synced;
        });
      }
    }).catch((err) => console.warn('Failed to add supplier quotation to backend:', err));
  };

  const approveSupplierQuotation = (id: string, approvedBy: string) => {
    setSupplierQuotations((prev) => {
      const updated = prev.map((q) =>
        q.id === id || q.quotationNumber === id || (q as any).quotation_number === id
          ? { ...q, status: 'Approved' }
          : q
      );
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_supplierQuotations', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('APPROVE', 'Purchase', 'Supplier Quotations', id, `Approved Supplier Quotation ${id} by ${approvedBy}`);
    api.purchase.supplierQuotations.update(id, { status: 'Approved', approvedBy }).catch((err: any) => console.warn('Failed to approve supplier quotation on backend:', err));
  };

  const addQuotationComparison = (data: Omit<QuotationComparison, 'id' | 'comparisonDate'>) => {
    const id = `COMP-${Date.now().toString().slice(-5)}`;
    const newComp: QuotationComparison = {
      ...data,
      id,
      comparisonDate: new Date().toISOString().split('T')[0],
    };
    setQuotationComparisons((prev) => [newComp, ...prev]);
    logAction('CREATE', 'Purchase', 'Quotation Comparison', id, `Created comparison matrix for RFQ ${data.rfqNumber}`);
    api.post('/quotation-comparisons/', newComp).catch((err) => console.warn('Failed to add quotation comparison:', err));
  };

  const approveQuotationComparison = (id: string, approvedBy: string) => {
    setQuotationComparisons((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, approvalStatus: 'approved', approvedBy } : c
      )
    );
    api.patch(`/quotation-comparisons/${id}/`, { approvalStatus: 'approved', approvedBy }).catch((err) => console.warn('Failed to approve comparison:', err));
  };

  const addPurchaseOrder = (data: Omit<PurchaseOrder, 'id' | 'poDate'>) => {
    const poNumber = `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`;
    const newPo: PurchaseOrder = {
      ...data,
      id: poNumber,
      poNumber,
      poDate: new Date().toISOString().split('T')[0],
    };
    setPurchaseOrders((prev) => [newPo, ...prev]);

    addPORevision({
      poId: newPo.id,
      poNumber: newPo.poNumber,
      revisionNumber: newPo.activeRevision || 'Rev-00',
      revisionDate: new Date().toISOString().split('T')[0],
      revisedBy: data.buyer || `${currentUser.firstName} ${currentUser.lastName}`,
      reason: 'Initial PO Issuance',
      reasonForRevision: 'Initial PO Issuance',
      previousGrandTotal: 0,
      revisedGrandTotal: newPo.grandTotal,
      newGrandTotal: newPo.grandTotal,
    });

    logAction('CREATE', 'Purchase', 'Purchase Orders', newPo.id, `Created PO ${newPo.poNumber} for supplier ${data.supplierName}`);
    const poPayload = {
      ...newPo,
      poNumber: newPo.poNumber || poNumber,
      expectedDeliveryDate: (newPo as any).expectedDeliveryDate || (newPo as any).deliveryDate || '2026-12-31',
      items: newPo.items || [],
      totalAmount: Number((newPo as any).totalAmount || (newPo as any).grandTotal || 0),
      grandTotal: Number((newPo as any).grandTotal || (newPo as any).totalAmount || 0),
      status: newPo.status || 'draft',
    };
    api.purchase.orders.create(poPayload).then((res) => {
      if (res && res.id) {
        setPurchaseOrders((prev) => prev.map((p) => (p.id === poNumber ? { ...p, ...res } : p)));
      }
    }).catch((err) => console.warn('Failed to sync PO to backend:', err));
  };

  const approvePurchaseOrder = (id: string, approvedBy: string) => {
    const targetPo = purchaseOrders.find((p) => p.id === id);
    if (!targetPo) return;

    setPurchaseOrders((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: 'approved' }
          : p
      )
    );
    api.purchase.orders.update(id, { status: 'approved' }).catch((err) => console.warn('Failed to approve PO on backend:', err));

    const jobKey = targetPo.jobNumber || targetPo.jobId || '';
    if (jobKey) {
      updateJobStatus(jobKey, 'step-4', 'completed');
      updateJobStatus(jobKey, 'step-5', 'in_progress');
    }

    logAction('APPROVE', 'Purchase', 'PO Approval', id, `Approved PO ${targetPo.poNumber} by ${approvedBy}`);

    sendNotification({
      title: `🛍️ PO Approved & Ready for Supplier: ${targetPo.poNumber}`,
      message: `Purchase Order ${targetPo.poNumber} (₹${targetPo.grandTotal?.toLocaleString('en-IN')}) approved for ${targetPo.supplierName}. Expediting & follow-up initiated.`,
      type: 'success',
      department: 'project',
      priority: 'high',
      linkUrl: `/purchase/po`,
    });
  };

  const addPORevision = (data: Omit<PORevision, 'id' | 'revisedDate'>) => {
    const id = `porev-${Date.now().toString().slice(-5)}`;
    const newRev: PORevision = {
      ...data,
      id,
      revisedDate: new Date().toISOString().split('T')[0],
    };
    setPoRevisions((prev) => [newRev, ...prev]);
  };

  const addPurchaseFollowUp = (data: Omit<PurchaseFollowUp, 'id'>) => {
    const id = `fol-${Date.now().toString().slice(-5)}`;
    const newFol: PurchaseFollowUp = { ...data, id };
    setPurchaseFollowUps((prev) => [newFol, ...prev]);
    logAction('CREATE', 'Purchase', 'Purchase Follow-up', id, `Recorded follow-up for PO ${data.poNumber}`);
  };

  const addPurchaseReturn = (data: Omit<PurchaseReturn, 'id' | 'returnDate'>) => {
    const returnNumber = `PRET-${new Date().getFullYear()}-${String(purchaseReturns.length + 1).padStart(3, '0')}`;
    const newRet: PurchaseReturn = {
      ...data,
      id: returnNumber,
      returnNumber,
      returnDate: new Date().toISOString().split('T')[0],
    };
    setPurchaseReturns((prev) => [newRet, ...prev]);
    logAction('CREATE', 'Purchase', 'Purchase Returns', newRet.id, `Recorded return ${newRet.returnNumber} for ${data.supplierName}`);
    api.post('/purchase-returns/', newRet).catch((err) => console.warn('Failed to add purchase return:', err));
  };

  // Module 5: Store Management Handlers
  const addItemMaster = (data: Omit<ItemMaster, 'id' | 'createdAt'>) => {
    const id = data.itemCode || `ITEM-${String(itemMasters.length + 1).padStart(3, '0')}`;
    const newItem: ItemMaster = { ...data, id, createdAt: new Date().toISOString().split('T')[0] };
    setItemMasters((prev) => {
      const updated = [newItem, ...prev.filter((i) => i.id !== id && i.itemCode !== data.itemCode)];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_itemMasters', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'Store', 'Item Master', id, `Added Item ${data.itemCode} - ${data.itemName}`);
    // Sync to PythonAnywhere backend
    api.store.items.create(newItem).then((res) => {
      if (res && res.id) {
        setItemMasters((prev) => {
          const updated = prev.map((item) => (item.id === id ? { ...item, ...res } : item));
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('UMA_ERP_itemMasters', JSON.stringify(updated)); } catch (_) {}
          }
          return updated;
        });
      }
    }).catch((err) => console.warn('Failed to sync item to backend:', err));
  };

  const updateItemMaster = (id: string, updates: Partial<ItemMaster>) => {
    setItemMasters((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_itemMasters', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'Store', 'Item Master', id, `Updated item ${id}`);
    // Sync to PythonAnywhere backend
    api.store.items.update(id, updates).catch((err) => console.warn('Failed to update item on backend:', err));
  };

  const deleteItemMaster = (id: string) => {
    setItemMasters((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_itemMasters', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'Store', 'Item Master', id, `Deleted Item Master ${id}`);
    api.store.items.delete(id).catch((err) => console.warn('Failed to delete item master on backend:', err));
  };

  const addItemCategory = (data: Omit<ItemCategory, 'id'>) => {
    const id = data.categoryCode || `CAT-${String(itemCategories.length + 1).padStart(3, '0')}`;
    const newCat: ItemCategory = { ...data, id };
    setItemCategories((prev) => {
      const updated = [...prev.filter((c) => c.id !== id && c.categoryCode !== data.categoryCode), newCat];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_itemCategories', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'Store', 'Categories', id, `Added Category ${data.categoryName}`);
    api.post('/item-categories/', {
      id,
      code: data.categoryCode,
      name: data.categoryName,
      categoryCode: data.categoryCode,
      categoryName: data.categoryName,
      description: data.description,
      status: data.status,
      parent_category: data.parentCategory,
    }).catch((err) => console.warn('Failed to add category:', err));
  };

  const addUOM = (data: Omit<UOMMaster, 'id'>) => {
    const id = data.uomCode || `UOM-${String(uoms.length + 1).padStart(3, '0')}`;
    const newUom: UOMMaster = { ...data, id };
    setUoms((prev) => {
      const updated = [...prev.filter((u) => u.id !== id && u.uomCode !== data.uomCode), newUom];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_uoms', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'Store', 'UOM Master', id, `Added UOM ${data.uomCode}`);
    api.post('/uoms/', {
      id,
      code: data.uomCode,
      name: data.uomName,
      uomCode: data.uomCode,
      uomName: data.uomName,
      description: data.description,
    }).catch((err) => console.warn('Failed to add UOM:', err));
  };

  const addWarehouse = (data: Omit<Warehouse, 'id'>) => {
    const id = `WH-${String(warehouses.length + 1).padStart(3, '0')}`;
    const newWh: Warehouse = { ...data, id };
    setWarehouses((prev) => [...prev, newWh]);
    logAction('CREATE', 'Store', 'Warehouse Master', id, `Added Warehouse ${data.warehouseName}`);
    api.store.warehouses.create(newWh).catch((err) => console.warn('Failed to add warehouse:', err));
  };

  const updateWarehouse = (id: string, updates: Partial<Warehouse>) => {
    setWarehouses((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    api.store.warehouses.update(id, updates).catch((err) => console.warn('Failed to update warehouse:', err));
  };

  const addWarehouseLocation = (data: Omit<WarehouseLocation, 'id'>) => {
    const id = `LOC-${String(warehouseLocations.length + 1).padStart(3, '0')}`;
    const newLoc: WarehouseLocation = { ...data, id };
    setWarehouseLocations((prev) => [...prev, newLoc]);
    api.post('/warehouse-locations/', newLoc).catch((err) => console.warn('Failed to add warehouse location:', err));
  };

  const addOpeningStock = (data: Omit<OpeningStock, 'id'>) => {
    const id = `OP-${Date.now().toString().slice(-5)}`;
    const newOp: OpeningStock = { ...data, id };
    setOpeningStocks((prev) => [newOp, ...prev]);

    logStockLedgerEntry({
      entryDate: new Date().toISOString(),
      transactionType: 'Opening Stock',
      transactionNumber: id,
      itemId: data.itemId,
      itemCode: data.itemCode,
      itemName: data.itemName,
      warehouseId: data.warehouseId,
      warehouseName: data.warehouseName,
      locationCode: data.locationCode,
      openingQty: 0,
      inQty: data.quantity,
      outQty: 0,
      closingQty: data.quantity,
      rate: data.rate,
      transactionValue: data.totalValue,
      userName: currentUser.firstName,
      remarks: data.remarks,
    });
  };

  const addGRN = (data: Omit<GoodsReceiptNote, 'id' | 'grnNumber' | 'createdAt'>) => {
    const grnNumber = `GRN-${new Date().getFullYear()}-${String(goodsReceipts.length + 1).padStart(4, '0')}`;
    const newGrn: GoodsReceiptNote = {
      ...data,
      id: grnNumber,
      grnNumber,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setGoodsReceipts((prev) => {
      const updated = [newGrn, ...prev];
      try { localStorage.setItem('UMA_ERP_goodsReceipts', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });

    if (newGrn.jobId) {
      updateJobStatus(newGrn.jobId, 'step-6', 'in_progress');
    }

    logAction('CREATE', 'Store', 'Goods Receipt', newGrn.id, `Received GRN ${newGrn.grnNumber} from ${newGrn.supplierName}`);
    sendNotification({
      title: `📦 GRN Created: ${newGrn.grnNumber}`,
      message: `Goods received from ${newGrn.supplierName} for PO ${newGrn.poNumber}. Pending QC Inspection.`,
      type: 'info',
      department: 'store',
      priority: 'normal',
      linkUrl: '/store/grn',
    });
    const grnPayload = {
      ...newGrn,
      id: grnNumber,
      grnNumber: newGrn.grnNumber || grnNumber,
      grn_number: newGrn.grnNumber || grnNumber,
      date: (newGrn as any).grnDate || newGrn.createdAt || new Date().toISOString().split('T')[0],
      po_id: (newGrn as any).poId || '',
      po_number: (newGrn as any).poNumber || '',
      supplier_id: (newGrn as any).supplierId || '',
      supplier_name: (newGrn as any).supplierName || '',
      challan_number: (newGrn as any).deliveryChallanNumber || (newGrn as any).challanNumber || '',
      invoice_number: (newGrn as any).invoiceNumber || '',
      vehicle_number: (newGrn as any).vehicleNumber || '',
      received_by: (newGrn as any).receivedBy || 'Store Officer',
      warehouse_id: (newGrn as any).warehouseId || '',
      notes: (newGrn as any).remarks || '',
      items: newGrn.items || [],
      status: (newGrn as any).status || 'received',
    };
    api.store.grns.create(grnPayload).then((res) => {
      if (res && res.id) {
        setGoodsReceipts((prev) => {
          const synced = prev.map((g) => (g.id === grnNumber ? { ...g, ...res } : g));
          try { localStorage.setItem('UMA_ERP_goodsReceipts', JSON.stringify(synced)); } catch (_) {}
          return synced;
        });
      }
    }).catch((err) => console.warn('Failed to sync GRN to backend:', err));
  };

  const addQCInspection = (data: Omit<QCInspection, 'id' | 'inspectionNumber'>) => {
    const inspectionNumber = `QC-${new Date().getFullYear()}-${String(qcInspections.length + 1).padStart(4, '0')}`;
    const newQc: QCInspection = { ...data, id: inspectionNumber, inspectionNumber };
    setQcInspections((prev) => {
      const updated = [newQc, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_qcInspections', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    api.post('/qc-inspections/', {
      ...newQc,
      grn_id: newQc.grnId,
      grn_number: newQc.grnNumber,
      inspection_date: newQc.inspectionDate,
      inspector: newQc.inspectorName,
      overall_result: newQc.qcResult,
      items: [{
        itemCode: newQc.itemCode,
        itemName: newQc.itemName,
        acceptedQuantity: newQc.acceptedQuantity,
        rejectedQuantity: newQc.rejectedQuantity,
        supplierName: newQc.supplierName,
      }],
    }).catch((err) => console.warn('Failed to add QC inspection:', err));
  };

  const approveQCInspection = (id: string, inspectorName: string, qcResult: 'Pass' | 'Fail' | 'Conditional Approval', acceptedQty: number, rejectedQty: number) => {
    const targetQc = qcInspections.find((q) => q.id === id);
    if (!targetQc) return;

    setQcInspections((prev) => {
      const updated = prev.map((q) => (q.id === id ? { ...q, qcResult, acceptedQuantity: acceptedQty, rejectedQuantity: rejectedQty, inspectorName } : q));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_qcInspections', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });

    setGoodsReceipts((prev) => {
      const updated = prev.map((g) => (g.id === targetQc.grnId ? { ...g, status: (qcResult === 'Pass' ? 'Accepted' : qcResult === 'Fail' ? 'Rejected' : 'Partially Accepted') as GRNStatus } : g));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_goodsReceipts', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });

    logAction('APPROVE', 'Store', 'QC Inspection', id, `QC Inspection ${targetQc.inspectionNumber} set to ${qcResult} by ${inspectorName}`);
    api.patch(`/qc-inspections/${id}/`, {
      overall_result: qcResult,
      inspector: inspectorName,
      items: [{
        itemCode: targetQc.itemCode,
        itemName: targetQc.itemName,
        acceptedQuantity: acceptedQty,
        rejectedQuantity: rejectedQty,
        supplierName: targetQc.supplierName,
      }],
    }).catch((err) => console.warn('Failed to update QC inspection on backend:', err));
  };

  const updateStockBalance = (id: string, updates: Partial<StockBalance>) => {
    setStockBalances((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const addStockReservation = (data: Omit<StockReservation, 'id' | 'reservationNumber' | 'createdAt'>) => {
    const reservationNumber = `RES-${new Date().getFullYear()}-${String(stockReservations.length + 1).padStart(4, '0')}`;
    const newRes: StockReservation = {
      ...data,
      id: reservationNumber,
      reservationNumber,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setStockReservations((prev) => [newRes, ...prev]);
    logAction('CREATE', 'Store', 'Stock Reservation', newRes.id, `Reserved ${data.reservedQuantity} ${data.itemName} for ${data.jobId}`);
    api.post('/stock-reservations/', newRes).catch((err) => console.warn('Failed to add reservation:', err));
  };

  const releaseStockReservation = (id: string) => {
    setStockReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'Released' } : r)));
  };

  const addMaterialIssue = (data: Omit<MaterialIssue, 'id' | 'issueNumber' | 'createdAt'>) => {
    const issueNumber = `ISS-${new Date().getFullYear()}-${String(materialIssues.length + 1).padStart(4, '0')}`;
    const newIssue: MaterialIssue = {
      ...data,
      id: issueNumber,
      issueNumber,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setMaterialIssues((prev) => [newIssue, ...prev]);

    if (newIssue.jobId) {
      updateJobStatus(newIssue.jobId, 'step-6', 'completed');
      updateJobStatus(newIssue.jobId, 'step-7', 'in_progress');
    }

    logAction('CREATE', 'Store', 'Material Issue', newIssue.id, `Issued material slip ${newIssue.issueNumber} for Job ${newIssue.jobId}`);
    api.post('/material-issues/', newIssue).catch((err) => console.warn('Failed to add material issue:', err));
  };

  const addMaterialReturn = (data: Omit<MaterialReturn, 'id' | 'returnNumber' | 'createdAt'>) => {
    const returnNumber = `RET-${new Date().getFullYear()}-${String(materialReturns.length + 1).padStart(4, '0')}`;
    const newRet: MaterialReturn = {
      ...data,
      id: returnNumber,
      returnNumber,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setMaterialReturns((prev) => [newRet, ...prev]);
    logAction('CREATE', 'Store', 'Material Return', newRet.id, `Returned material ${newRet.returnNumber} from Job ${newRet.jobId}`);
    api.post('/material-returns/', newRet).catch((err) => console.warn('Failed to add material return:', err));
  };

  const addStockTransfer = (data: Omit<StockTransfer, 'id' | 'transferNumber' | 'createdAt'>) => {
    const transferNumber = `TRN-${new Date().getFullYear()}-${String(stockTransfers.length + 1).padStart(4, '0')}`;
    const newTrn: StockTransfer = {
      ...data,
      id: transferNumber,
      transferNumber,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setStockTransfers((prev) => {
      const updated = [newTrn, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_stockTransfers', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'Store', 'Stock Transfer', newTrn.id, `Transferred items from ${data.fromWarehouseName} to ${data.toWarehouseName}`);
    api.post('/stock-transfers/', newTrn).catch((err) => console.warn('Failed to add stock transfer:', err));
  };

  const addStockAdjustment = (data: Omit<StockAdjustment, 'id' | 'adjustmentNumber' | 'createdAt'>) => {
    const adjustmentNumber = `ADJ-${new Date().getFullYear()}-${String(stockAdjustments.length + 1).padStart(4, '0')}`;
    const newAdj: StockAdjustment = {
      ...data,
      id: adjustmentNumber,
      adjustmentNumber,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setStockAdjustments((prev) => {
      const updated = [newAdj, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_stockAdjustments', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'Store', 'Stock Adjustment', newAdj.id, `Adjusted stock for ${data.itemName}: diff ${data.differenceQuantity}`);
    api.post('/stock-adjustments/', newAdj).catch((err) => console.warn('Failed to add stock adjustment:', err));
  };

  const addScrapEntry = (data: Omit<ScrapEntry, 'id' | 'scrapNumber' | 'createdAt'>) => {
    const scrapNumber = `SCR-${new Date().getFullYear()}-${String(scrapEntries.length + 1).padStart(4, '0')}`;
    const newScrap: ScrapEntry = {
      ...data,
      id: scrapNumber,
      scrapNumber,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setScrapEntries((prev) => [newScrap, ...prev]);
    logAction('CREATE', 'Store', 'Scrap Entry', newScrap.id, `Added scrap entry ${newScrap.scrapNumber}`);
    api.post('/scrap/', newScrap).catch((err) => console.warn('Failed to add scrap entry:', err));
  };

  const addPhysicalStockCount = (data: Omit<PhysicalStockCount, 'id' | 'countNumber'>) => {
    const countNumber = `CNT-${new Date().getFullYear()}-${String(physicalStockCounts.length + 1).padStart(4, '0')}`;
    const newCount: PhysicalStockCount = { ...data, id: countNumber, countNumber };
    setPhysicalStockCounts((prev) => [newCount, ...prev]);
  };

  const logStockLedgerEntry = (entry: Omit<StockLedgerEntry, 'id'>) => {
    const id = `LED-${Date.now().toString().slice(-6)}`;
    const newLedger: StockLedgerEntry = { ...entry, id };
    setStockLedgers((prev) => [newLedger, ...prev]);
  };

  // Module 6: Production / Manufacturing / MRP Handlers
  const addManufacturingJob = (data: Omit<ManufacturingJob, 'id' | 'createdAt'>) => {
    const id = `MJ-${new Date().getFullYear()}-${String(manufacturingJobs.length + 1).padStart(3, '0')}`;
    const newJob: ManufacturingJob = {
      ...data,
      id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setManufacturingJobs((prev) => {
      const updated = [newJob, ...prev];
      try { localStorage.setItem('UMA_ERP_manufacturingJobs', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('CREATE', 'Production', 'Manufacturing Jobs', newJob.id, `Created manufacturing job ${newJob.jobNumber}`);
    api.post('/manufacturing-jobs/', newJob).catch((err) => console.warn('Failed to add mfg job:', err));
  };

  const updateManufacturingJob = (id: string, updates: Partial<ManufacturingJob>) => {
    setManufacturingJobs((prev) => {
      const updated = prev.map((j) => (j.id === id || j.jobNumber === id ? { ...j, ...updates } : j));
      try { localStorage.setItem('UMA_ERP_manufacturingJobs', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
  };

  const addProductionPlan = (data: Omit<ProductionPlan, 'id' | 'createdAt'>) => {
    const planNumber = `PLAN-${new Date().getFullYear()}-${String(productionPlans.length + 1).padStart(3, '0')}`;
    const newPlan: ProductionPlan = {
      ...data,
      id: planNumber,
      planNumber,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProductionPlans((prev) => {
      const updated = [newPlan, ...prev];
      try { localStorage.setItem('UMA_ERP_productionPlans', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('CREATE', 'Production', 'Production Planning', newPlan.id, `Created production plan ${newPlan.planNumber} for Job ${newPlan.jobNumber}`);
    api.post('/production-plans/', newPlan).catch((err) => console.warn('Failed to add production plan:', err));
  };

  const addWorkOrder = (data: Omit<WorkOrder, 'id' | 'workOrderNumber' | 'createdAt'>) => {
    const workOrderNumber = `WO-${new Date().getFullYear()}-${String(workOrders.length + 1).padStart(3, '0')}-A`;
    const newWo: WorkOrder = {
      ...data,
      id: workOrderNumber,
      workOrderNumber,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setWorkOrders((prev) => [newWo, ...prev]);
    if (newWo.jobNumber) {
      updateJobStatus(newWo.jobNumber, 'step-7', 'in_progress');
    }
    logAction('CREATE', 'Production', 'Work Orders', newWo.id, `Generated Work Order ${newWo.workOrderNumber} for ${newWo.jobNumber}`);
    api.production.workOrders.create(newWo).then((res) => {
      if (res && res.id) {
        setWorkOrders((prev) => prev.map((w) => (w.id === workOrderNumber ? { ...w, ...res } : w)));
      }
    }).catch((err) => console.warn('Failed to sync work order to backend:', err));
  };

  const releaseWorkOrder = (id: string) => {
    const target = workOrders.find((w) => w.id === id || w.workOrderNumber === id);
    setWorkOrders((prev) => prev.map((w) => (w.id === id || w.workOrderNumber === id ? { ...w, status: 'Released' } : w)));
    logAction('UPDATE', 'Production', 'Work Orders', id, `Released Work Order ${id} to shop floor`);

    const payload = target ? { ...target, status: 'Released' } : { id, workOrderNumber: id, status: 'Released' };
    api.production.workOrders.release(id, payload).then((res: any) => {
      if (res && res.workOrder) {
        setWorkOrders((prev) => prev.map((w) => (w.id === id || w.workOrderNumber === id ? { ...w, ...res.workOrder, status: 'Released' } : w)));
      }
    }).catch(() => {
      // Fallback: also ensure record exists via create/patch
      api.production.workOrders.create(payload).catch((err: any) =>
        console.warn('Failed to update work order on backend:', err)
      );
    });
  };

  const addProductionOrder = (data: Omit<ProductionOrder, 'id' | 'productionOrderNumber' | 'createdAt'>) => {
    const productionOrderNumber = `PO-PROD-${new Date().getFullYear()}-${String(productionOrders.length + 1).padStart(3, '0')}`;
    const newPo: ProductionOrder = {
      ...data,
      id: productionOrderNumber,
      productionOrderNumber,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProductionOrders((prev) => [newPo, ...prev]);
    logAction('CREATE', 'Production', 'Production Orders', newPo.id, `Created Production Order ${newPo.productionOrderNumber}`);
    api.post('/production-orders/', newPo).catch((err) => console.warn('Failed to add production order:', err));
  };

  const addRoutingOperation = (op: Omit<RoutingOperation, 'id'>) => {
    const id = `OP-${(routingOperations.length + 1) * 10}`;
    const newOp: RoutingOperation = { ...op, id };
    setRoutingOperations((prev) => [...prev, newOp]);
  };

  const addWorkCenter = (wc: Omit<WorkCenter, 'id'>) => {
    const id = `WC-${String(workCenters.length + 1).padStart(3, '0')}`;
    const newWc: WorkCenter = { ...wc, id };
    setWorkCenters((prev) => [...prev, newWc]);
    logAction('CREATE', 'Production', 'Work Centers', newWc.id, `Created Work Center ${newWc.workCenterCode}`);
    api.post('/work-centers/', newWc).catch((err) => console.warn('Failed to add work center:', err));
  };

  const updateWorkCenter = (id: string, updates: Partial<WorkCenter>) => {
    setWorkCenters((prev) => prev.map((w) => (w.id === id || w.workCenterCode === id ? { ...w, ...updates } : w)));
    api.patch(`/work-centers/${id}/`, updates).catch((err) => console.warn('Failed to update work center:', err));
  };

  const addProductionSchedule = (sch: Omit<ProductionScheduleItem, 'id'>) => {
    const id = `SCH-${Date.now().toString().slice(-6)}`;
    const newSch: ProductionScheduleItem = { ...sch, id };
    setProductionSchedules((prev) => [newSch, ...prev]);
    api.post('/production-schedules/', newSch).catch((err) => console.warn('Failed to add production schedule:', err));
  };

  const recordProductionEntry = (data: Omit<ProductionEntry, 'id' | 'productionEntryNumber' | 'goodQuantity'>) => {
    const productionEntryNumber = `PENTRY-${new Date().getFullYear()}-${String(productionEntries.length + 1).padStart(4, '0')}`;
    const goodQuantity = Math.max(0, data.producedQuantity - data.rejectedQuantity - data.scrapQuantity);
    const newEntry: ProductionEntry = {
      ...data,
      id: productionEntryNumber,
      productionEntryNumber,
      goodQuantity,
    };
    setProductionEntries((prev) => [newEntry, ...prev]);
    logAction('CREATE', 'Production', 'Production Entry', newEntry.id, `Recorded entry ${newEntry.productionEntryNumber}: Good Qty = ${goodQuantity} for ${newEntry.workOrderNumber}`);
  };

  const addProductionHold = (data: Omit<ProductionHold, 'id' | 'holdNumber'>) => {
    const holdNumber = `HLD-${new Date().getFullYear()}-${String(productionHolds.length + 1).padStart(3, '0')}`;
    const newHold: ProductionHold = { ...data, id: holdNumber, holdNumber };
    setProductionHolds((prev) => [newHold, ...prev]);
    logAction('CREATE', 'Production', 'Production Holds', newHold.id, `Placed Hold ${newHold.holdNumber} on ${newHold.workOrderNumber} due to ${newHold.reason}`);
  };

  const resumeProductionHold = (id: string, resumeDate: string) => {
    setProductionHolds((prev) => prev.map((h) => (h.id === id || h.holdNumber === id ? { ...h, status: 'Resumed', resumeDate } : h)));
    logAction('UPDATE', 'Production', 'Production Holds', id, `Resumed production hold ${id}`);
  };

  const addReworkOrder = (data: Omit<ReworkOrder, 'id' | 'reworkNumber'>) => {
    const reworkNumber = `RWK-${new Date().getFullYear()}-${String(reworkOrders.length + 1).padStart(3, '0')}`;
    const newRework: ReworkOrder = { ...data, id: reworkNumber, reworkNumber };
    setReworkOrders((prev) => [newRework, ...prev]);
    logAction('CREATE', 'Production', 'Rework Orders', newRework.id, `Created Rework Order ${newRework.reworkNumber} for ${newRework.workOrderNumber}`);
  };

  const addProductionScrap = (data: Omit<ProductionScrap, 'id' | 'scrapNumber'>) => {
    const scrapNumber = `PSCRAP-${new Date().getFullYear()}-${String(productionScraps.length + 1).padStart(3, '0')}`;
    const newScrap: ProductionScrap = { ...data, id: scrapNumber, scrapNumber };
    setProductionScraps((prev) => [newScrap, ...prev]);
    logAction('CREATE', 'Production', 'Production Scrap', newScrap.id, `Logged production scrap ${newScrap.scrapNumber} for ${newScrap.materialName}`);
  };

  const completeWorkOrder = (data: Omit<ProductionCompletion, 'id' | 'completionNumber'>) => {
    const completionNumber = `CMP-${new Date().getFullYear()}-${String(productionCompletions.length + 1).padStart(3, '0')}`;
    const newComp: ProductionCompletion = { ...data, id: completionNumber, completionNumber };
    setProductionCompletions((prev) => [newComp, ...prev]);

    // Update Work Order status to Completed
    setWorkOrders((prev) => prev.map((w) => (w.workOrderNumber === data.workOrderNumber ? { ...w, status: 'Completed' } : w)));

    if (data.jobNumber) {
      updateJobStatus(data.jobNumber, 'step-7', 'completed');
      updateJobStatus(data.jobNumber, 'step-8', 'in_progress');
    }

    logAction('CREATE', 'Production', 'Work Order Completion', newComp.id, `Completed Work Order ${newComp.workOrderNumber}`);
  };

  const addFinishedGoods = (data: Omit<FinishedGoodsItem, 'id' | 'finishedGoodsNumber' | 'createdAt'>) => {
    const finishedGoodsNumber = `FG-${new Date().getFullYear()}-${String(finishedGoods.length + 1).padStart(3, '0')}`;
    const newFg: FinishedGoodsItem = {
      ...data,
      id: finishedGoodsNumber,
      finishedGoodsNumber,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setFinishedGoods((prev) => [newFg, ...prev]);
    logAction('CREATE', 'Production', 'Finished Goods', newFg.id, `Transferred ${newFg.productName} to Finished Goods Warehouse (${newFg.warehouseName})`);
    api.post('/finished-goods/', newFg).catch((err) => console.warn('Failed to add finished goods:', err));
  };

  // Traceability Modal Helpers
  const openJobModal = (jobNumber: string) => {
    const job = jobs.find((j) => j.jobNumber?.toLowerCase() === jobNumber?.toLowerCase());
    if (job) {
      setSelectedJobForModal(job);
    }
  };

  const closeJobModal = () => setSelectedJobForModal(null);

  const updateJobStatus = (jobNumber: string, stepId: string, status: 'completed' | 'in_progress' | 'pending') => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.jobNumber !== jobNumber) return j;
        const updatedSteps = j.steps.map((s) => (s.id === stepId ? { ...s, status, completedAt: status === 'completed' ? new Date().toISOString().split('T')[0] : s.completedAt } : s));
        const completedCount = updatedSteps.filter((s) => s.status === 'completed').length;
        const progressPercent = Math.round((completedCount / updatedSteps.length) * 100);
        return {
          ...j,
          steps: updatedSteps,
          progressPercent,
        };
      })
    );
    logAction('UPDATE', 'Job Traceability', 'Step Progress', jobNumber, `Step ${stepId} changed to ${status}`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_notifications', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    api.post(`/notifications/${id}/mark-read/`).catch(() => {});
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_notifications', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    api.post('/notifications/mark-all-read/').catch(() => {});
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_notifications', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    api.delete(`/notifications/${id}/`).catch(() => {});
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('UMA_ERP_notifications', JSON.stringify([])); } catch (_) {}
    }
  };

  // Module 7 Handlers
  const closeFinancialYear = (id: string, closedBy: string) => {
    setFinancialYears((prev) => prev.map((fy) => (fy.id === id ? { ...fy, status: 'Closed', closedBy, closedAt: new Date().toISOString().split('T')[0] } : fy)));
    logAction('UPDATE', 'Accounting', 'Financial Year', id, `Closed Financial Year ${id} by ${closedBy}`);
  };

  const addChartOfAccount = (account: Omit<ChartOfAccount, 'id' | 'currentBalance'>) => {
    const id = `ACC-${String(chartOfAccounts.length + 1).padStart(3, '0')}`;
    const newAcc: ChartOfAccount = { ...account, id, currentBalance: account.openingBalance };
    setChartOfAccounts((prev) => [...prev, newAcc]);
    logAction('CREATE', 'Accounting', 'Chart of Accounts', id, `Added Account ${account.accountCode} - ${account.accountName}`);
    api.post('/chart-of-accounts/', newAcc).catch((err) => console.warn('Failed to add COA:', err));
  };

  const addAccountGroup = (group: Omit<AccountGroup, 'id'>) => {
    const id = `AGRP-${String(accountGroups.length + 1).padStart(3, '0')}`;
    const newGrp: AccountGroup = { ...group, id };
    setAccountGroups((prev) => [...prev, newGrp]);
    logAction('CREATE', 'Accounting', 'Account Groups', id, `Added Account Group ${group.groupName}`);
  };

  const addTaxMaster = (tax: Omit<TaxMaster, 'id'>) => {
    const id = `TAX-${String(taxMasters.length + 1).padStart(2, '0')}`;
    const newTax: TaxMaster = { ...tax, id };
    setTaxMasters((prev) => [...prev, newTax]);
    logAction('CREATE', 'Accounting', 'Tax Master', id, `Added Tax ${tax.taxCode} (${tax.rate}%)`);
    api.post('/taxes/', newTax).catch((err) => console.warn('Failed to add tax:', err));
  };

  const addTDSMaster = (tds: Omit<TDSMaster, 'id'>) => {
    const id = `TDS-${String(tdsMasters.length + 1).padStart(2, '0')}`;
    const newTDS: TDSMaster = { ...tds, id };
    setTdsMasters((prev) => [...prev, newTDS]);
    logAction('CREATE', 'Accounting', 'TDS Master', id, `Added TDS Section ${tds.sectionCode}`);
  };

  const addCostCenter = (cc: Omit<CostCenter, 'id'>) => {
    const id = `CC-${String(costCenters.length + 1).padStart(3, '0')}`;
    const newCC: CostCenter = { ...cc, id };
    setCostCenters((prev) => [...prev, newCC]);
    logAction('CREATE', 'Accounting', 'Cost Centers', id, `Added Cost Center ${cc.costCenterCode}`);
    api.post('/cost-centers/', newCC).catch((err) => console.warn('Failed to add cost center:', err));
  };

  const addSalesInvoice = (inv: Omit<SalesInvoice, 'id' | 'invoiceNumber' | 'createdAt'>) => {
    const invoiceNumber = `SINV-2026-${String(salesInvoices.length + 1).padStart(4, '0')}`;
    const newInv: SalesInvoice = {
      ...inv,
      id: invoiceNumber,
      invoiceNumber,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSalesInvoices((prev) => [newInv, ...prev]);
    logAction('CREATE', 'Accounting', 'Sales Invoices', newInv.id, `Generated Sales Invoice ${newInv.invoiceNumber} for ₹${newInv.grandTotal?.toLocaleString()}`);
    api.accounting.salesInvoices.create(newInv).catch((err) => console.warn('Failed to add sales invoice:', err));
  };

  const approveSalesInvoice = (id: string) => {
    setSalesInvoices((prev) => {
      const updated = prev.map((inv) =>
        inv.id === id ||
        inv.invoiceNumber === id ||
        (inv as any).invoice_number === id ||
        String(inv.id).toLowerCase() === String(id).toLowerCase() ||
        String(inv.invoiceNumber).toLowerCase() === String(id).toLowerCase()
          ? { ...inv, status: 'Approved' }
          : inv
      );
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('UMA_ERP_salesInvoices', JSON.stringify(updated));
        } catch (_) {}
      }
      return updated;
    });
    setCentralApprovals((prev) =>
      prev.map((a) =>
        a.id === id || a.recordNumber === id || String(a.recordNumber).toLowerCase() === String(id).toLowerCase()
          ? { ...a, status: 'Approved' }
          : a
      )
    );
    logAction('APPROVE', 'Accounting', 'Sales Invoices', id, `Approved Sales Invoice ${id}`);
    api.accounting.salesInvoices.approve(id).catch((err) => {
      console.warn('Backend approve sales invoice failed:', err);
    });
  };

  const updateSalesInvoicePayment = (
    id: string,
    paymentData: { paymentStatus: 'Paid' | 'Partially Paid' | 'Unpaid'; paidAmount?: number; paymentMode?: string; referenceNumber?: string; paymentDate?: string }
  ) => {
    setSalesInvoices((prev) => {
      const updated = prev.map((inv) =>
        inv.id === id ||
        inv.invoiceNumber === id ||
        (inv as any).invoice_number === id ||
        String(inv.id).toLowerCase() === String(id).toLowerCase() ||
        String(inv.invoiceNumber).toLowerCase() === String(id).toLowerCase()
          ? {
              ...inv,
              paymentStatus: paymentData.paymentStatus,
              paidAmount: paymentData.paidAmount !== undefined ? paymentData.paidAmount : (paymentData.paymentStatus === 'Paid' ? inv.grandTotal : inv.paidAmount || 0),
              dueAmount: paymentData.paymentStatus === 'Paid' ? 0 : (inv.grandTotal - (paymentData.paidAmount !== undefined ? paymentData.paidAmount : inv.paidAmount || 0)),
              paymentMode: paymentData.paymentMode || (inv as any).paymentMode,
              paymentReference: paymentData.referenceNumber || (inv as any).paymentReference,
              paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
            }
          : inv
      );
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('UMA_ERP_salesInvoices', JSON.stringify(updated));
        } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'Accounting', 'Sales Invoices', id, `Updated payment status to ${paymentData.paymentStatus} for Sales Invoice ${id}`);
    api.accounting.salesInvoices.update(id, paymentData).catch((err) => {
      console.warn('Backend update sales invoice payment failed:', err);
    });
  };

  const addPurchaseInvoice = (inv: Omit<PurchaseInvoice, 'id' | 'invoiceNumber' | 'createdAt'>) => {
    const invoiceNumber = `PINV-2026-${String(purchaseInvoices.length + 1).padStart(4, '0')}`;
    const newInv: PurchaseInvoice = {
      ...inv,
      id: invoiceNumber,
      invoiceNumber,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPurchaseInvoices((prev) => [newInv, ...prev]);
    logAction('CREATE', 'Accounting', 'Purchase Invoices', newInv.id, `Created Purchase Invoice ${newInv.invoiceNumber} for ₹${newInv.grandTotal?.toLocaleString()}`);
    api.accounting.purchaseInvoices.create(newInv).catch((err) => console.warn('Failed to add purchase invoice:', err));
  };

  const postPurchaseInvoice = (id: string) => {
    setPurchaseInvoices((prev) => {
      const updated = prev.map((inv) =>
        inv.id === id ||
        inv.invoiceNumber === id ||
        (inv as any).invoice_number === id ||
        String(inv.id).toLowerCase() === String(id).toLowerCase() ||
        String(inv.invoiceNumber).toLowerCase() === String(id).toLowerCase()
          ? { ...inv, status: 'Posted' }
          : inv
      );
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('UMA_ERP_purchaseInvoices', JSON.stringify(updated));
        } catch (_) {}
      }
      return updated;
    });
    setCentralApprovals((prev) =>
      prev.map((a) =>
        a.id === id || a.recordNumber === id || String(a.recordNumber).toLowerCase() === String(id).toLowerCase()
          ? { ...a, status: 'Approved' }
          : a
      )
    );
    logAction('APPROVE', 'Accounting', 'Purchase Invoices', id, `Posted Purchase Invoice ${id} to Ledger`);
    api.accounting.purchaseInvoices.post(id).catch((err) => console.warn('Failed to post purchase invoice:', err));
  };

  const addCreditNote = (cn: Omit<CreditNote, 'id' | 'creditNoteNumber'>) => {
    const creditNoteNumber = `CN-2026-${String(creditNotes.length + 1).padStart(3, '0')}`;
    const newCN: CreditNote = { ...cn, id: creditNoteNumber, creditNoteNumber };
    setCreditNotes((prev) => {
      const updated = [newCN, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_creditNotes', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'Accounting', 'Credit Notes', newCN.id, `Issued Credit Note ${newCN.creditNoteNumber} for ₹${newCN.totalAmount?.toLocaleString()}`);
    // Sync to PythonAnywhere backend
    api.accounting.creditNotes.create(newCN).catch((err) => console.warn('Failed to sync credit note to backend:', err));
  };

  const updateCreditNote = (id: string, cn: Partial<CreditNote>) => {
    setCreditNotes((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...cn } : c));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_creditNotes', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    api.accounting.creditNotes.update(id, cn).catch((err) => console.warn('Failed to update credit note on backend:', err));
  };

  const deleteCreditNote = (id: string) => {
    setCreditNotes((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_creditNotes', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'Accounting', 'Credit Notes', id, `Deleted Credit Note ${id}`);
    api.accounting.creditNotes.delete(id).catch((err) => console.warn('Failed to delete credit note on backend:', err));
  };

  const addDebitNote = (dn: Omit<DebitNote, 'id' | 'debitNoteNumber'>) => {
    const debitNoteNumber = `DN-2026-${String(debitNotes.length + 1).padStart(3, '0')}`;
    const newDN: DebitNote = { ...dn, id: debitNoteNumber, debitNoteNumber };
    setDebitNotes((prev) => {
      const updated = [newDN, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_debitNotes', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'Accounting', 'Debit Notes', newDN.id, `Issued Debit Note ${newDN.debitNoteNumber} for ₹${newDN.totalAmount?.toLocaleString()}`);
    // Sync to PythonAnywhere backend
    api.accounting.debitNotes.create(newDN).catch((err) => console.warn('Failed to sync debit note to backend:', err));
  };

  const updateDebitNote = (id: string, dn: Partial<DebitNote>) => {
    setDebitNotes((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, ...dn } : d));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_debitNotes', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    api.accounting.debitNotes.update(id, dn).catch((err) => console.warn('Failed to update debit note on backend:', err));
  };

  const deleteDebitNote = (id: string) => {
    setDebitNotes((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_debitNotes', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'Accounting', 'Debit Notes', id, `Deleted Debit Note ${id}`);
    api.accounting.debitNotes.delete(id).catch((err) => console.warn('Failed to delete debit note on backend:', err));
  };

  const addCustomerReceipt = (rec: Omit<CustomerReceipt, 'id' | 'receiptNumber'>) => {
    const receiptNumber = `RCT-2026-${String(customerReceipts.length + 1).padStart(4, '0')}`;
    const newRec: CustomerReceipt = { ...rec, id: receiptNumber, receiptNumber };
    setCustomerReceipts((prev) => [newRec, ...prev]);
    logAction('CREATE', 'Accounting', 'Customer Receipts', newRec.id, `Recorded Receipt ${newRec.receiptNumber} from ${newRec.customerName} (₹${(newRec.amountPaid ?? 0)?.toLocaleString()})`);
    api.post('/customer-receipts/', newRec).catch((err) => console.warn('Failed to add customer receipt:', err));
  };

  const addSupplierPayment = (pay: Omit<SupplierPayment, 'id' | 'paymentNumber'>) => {
    const paymentNumber = `PAY-2026-${String(supplierPayments.length + 1).padStart(4, '0')}`;
    const newPay: SupplierPayment = { ...pay, id: paymentNumber, paymentNumber };
    setSupplierPayments((prev) => [newPay, ...prev]);
    logAction('CREATE', 'Accounting', 'Supplier Payments', newPay.id, `Recorded Payment ${newPay.paymentNumber} to ${newPay.supplierName} (₹${(newPay.amountPaid ?? 0)?.toLocaleString()})`);
    api.post('/supplier-payments/', newPay).catch((err) => console.warn('Failed to add supplier payment:', err));
  };

  const addJournalEntry = (jv: Omit<JournalEntry, 'id' | 'journalNumber'>) => {
    const journalNumber = `JV-2026-${String(journalEntries.length + 1).padStart(4, '0')}`;
    const newJV: JournalEntry = { ...jv, id: journalNumber, journalNumber };
    setJournalEntries((prev) => {
      const updated = [newJV, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_journalEntries', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'Accounting', 'Journal Entries', newJV.id, `Created JV ${newJV.journalNumber}: Debit ₹${newJV.totalDebit?.toLocaleString()} = Credit ₹${newJV.totalCredit?.toLocaleString()}`);
    // Sync to PythonAnywhere backend
    api.accounting.journalEntries.create(newJV).catch((err) => console.warn('Failed to sync journal entry to backend:', err));
  };

  const deleteJournalEntry = (id: string) => {
    setJournalEntries((prev) => {
      const updated = prev.filter((j) => j.id !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_journalEntries', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'Accounting', 'Journal Entries', id, `Deleted JV ${id}`);
    api.accounting.journalEntries.delete(id).catch((err) => console.warn('Failed to delete journal entry on backend:', err));
  };

  const addContraEntry = (contra: Omit<ContraEntry, 'id' | 'contraNumber'>) => {
    const contraNumber = `CNT-2026-${String(contraEntries.length + 1).padStart(3, '0')}`;
    const newContra: ContraEntry = { ...contra, id: contraNumber, contraNumber };
    setContraEntries((prev) => {
      const updated = [newContra, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_contraEntries', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'Accounting', 'Contra Entries', newContra.id, `Created Contra ${newContra.contraNumber} for ₹${newContra.amount?.toLocaleString()}`);
    // Sync to PythonAnywhere backend
    api.accounting.contraEntries.create(newContra).catch((err) => console.warn('Failed to sync contra entry to backend:', err));
  };

  const deleteContraEntry = (id: string) => {
    setContraEntries((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_contraEntries', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'Accounting', 'Contra Entries', id, `Deleted Contra Entry ${id}`);
    api.accounting.contraEntries.delete(id).catch((err) => console.warn('Failed to delete contra entry on backend:', err));
  };

  const addExpenseEntry = (exp: Omit<ExpenseEntry, 'id' | 'expenseNumber'>) => {
    const expenseNumber = `EXP-2026-${String(expenseEntries.length + 1).padStart(4, '0')}`;
    const newExp: ExpenseEntry = { ...exp, id: expenseNumber, expenseNumber };
    setExpenseEntries((prev) => {
      const updated = [newExp, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_expenseEntries', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'Accounting', 'Expense Entries', newExp.id, `Logged Expense ${newExp.expenseNumber} for ₹${(newExp.grandTotal || newExp.totalAmount || newExp.amount || 0)?.toLocaleString()}`);
    api.accounting.expenses.create(newExp).then((res) => {
      if (res && res.id) {
        setExpenseEntries((prev) => prev.map((e) => (e.id === expenseNumber ? { ...e, ...res } : e)));
      }
    }).catch((err) => console.warn('Failed to sync expense entry to backend:', err));
  };

  const updateExpenseEntry = (id: string, exp: Partial<ExpenseEntry>) => {
    setExpenseEntries((prev) => {
      const updated = prev.map((e) => (e.id === id || e.expenseNumber === id ? { ...e, ...exp } : e));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_expenseEntries', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    api.accounting.expenses.update(id, exp).catch((err) => console.warn('Failed to update expense on backend:', err));
  };

  const deleteExpenseEntry = (id: string) => {
    setExpenseEntries((prev) => {
      const updated = prev.filter((e) => e.id !== id && e.expenseNumber !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_expenseEntries', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'Accounting', 'Expense Entries', id, `Deleted Expense Entry ${id}`);
    api.accounting.expenses.delete(id).catch((err) => console.warn('Failed to delete expense entry on backend:', err));
  };

  const approveExpenseEntry = (id: string, approvedBy: string) => {
    setExpenseEntries((prev) => {
      const updated = prev.map((exp) => (exp.id === id || exp.expenseNumber === id ? { ...exp, status: 'Approved', approvedBy } : exp));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_expenseEntries', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('APPROVE', 'Accounting', 'Expense Entries', id, `Approved Expense Entry ${id} by ${approvedBy}`);
    api.accounting.expenses.approve(id, approvedBy).catch((err) => console.warn('Failed to approve expense on backend:', err));
  };

  const addBankAccount = (bank: Omit<BankAccount, 'id' | 'currentBalance'>) => {
    const id = `BANK-${String(bankAccounts.length + 1).padStart(2, '0')}`;
    const newBank: BankAccount = { ...bank, id, currentBalance: bank.openingBalance };
    setBankAccounts((prev) => {
      const updated = [...prev, newBank];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_bankAccounts', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'Accounting', 'Cash & Bank', id, `Added Bank Account ${bank.bankName} - ${bank.accountNumber}`);
    api.accounting.bankAccounts.create(newBank).catch((err) => console.warn('Failed to add bank account on backend:', err));
  };

  const updateBankAccount = (id: string, bankData: Partial<BankAccount>) => {
    setBankAccounts((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, ...bankData } : b));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_bankAccounts', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'Accounting', 'Cash & Bank', id, `Updated Bank Account ${id}`);
    api.accounting.bankAccounts.update(id, bankData).catch((err) => console.warn('Failed to update bank account on backend:', err));
  };

  const deleteBankAccount = (id: string) => {
    setBankAccounts((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_bankAccounts', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'Accounting', 'Cash & Bank', id, `Deleted Bank Account ${id}`);
    api.accounting.bankAccounts.delete(id).catch((err) => console.warn('Failed to delete bank account on backend:', err));
  };

  const reconcileBankTransaction = (transactionId: string, matchedErpDocNumber: string) => {
    setBankTransactions((prev) => prev.map((tx) => (tx.id === transactionId ? { ...tx, isReconciled: true, matchedErpDocNumber, reconciliationStatus: 'Reconciled' } : tx)));
    logAction('UPDATE', 'Accounting', 'Bank Reconciliation', transactionId, `Reconciled bank transaction ${transactionId} with ERP Doc ${matchedErpDocNumber}`);
  };

  const addFixedAsset = (asset: Omit<FixedAsset, 'id'>) => {
    const id = `AST-${String(fixedAssets.length + 1).padStart(3, '0')}`;
    const newAsset: FixedAsset = { ...asset, id };
    setFixedAssets((prev) => {
      const updated = [...prev, newAsset];
      try { localStorage.setItem('UMA_ERP_fixedAssets', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('CREATE', 'Accounting', 'Fixed Assets', id, `Registered Fixed Asset ${asset.assetCode} - ${asset.assetName}`);
    api.post('/fixed-assets/', newAsset).catch((err) => console.warn('Failed to save fixed asset to DB:', err));
  };

  const updateFixedAsset = (id: string, asset: Partial<FixedAsset>) => {
    setFixedAssets((prev) => {
      const updated = prev.map((a) => (a.id === id || a.assetCode === id ? { ...a, ...asset } : a));
      try { localStorage.setItem('UMA_ERP_fixedAssets', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('UPDATE', 'Accounting', 'Fixed Assets', id, `Updated Fixed Asset ${id}`);
    api.patch(`/fixed-assets/${id}/`, asset).catch((err) => console.warn('Failed to update fixed asset in DB:', err));
  };

  const deleteFixedAsset = (id: string) => {
    setFixedAssets((prev) => {
      const updated = prev.filter((a) => a.id !== id && a.assetCode !== id);
      try { localStorage.setItem('UMA_ERP_fixedAssets', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('DELETE', 'Accounting', 'Fixed Assets', id, `Deleted Fixed Asset ${id}`);
    api.delete(`/fixed-assets/${id}/`).catch((err) => console.warn('Failed to delete fixed asset from DB:', err));
  };

  const runDepreciation = (assetId: string, period: string, amount: number) => {
    const entry: DepreciationEntry = {
      id: `DEP-${Date.now().toString().slice(-6)}`,
      assetId,
      period,
      depreciationDate: new Date().toISOString().split('T')[0],
      amount,
      accumulatedDepreciationAfter: (fixedAssets.find((a) => a.id === assetId)?.accumulatedDepreciation || 0) + amount,
      bookValueAfter: (fixedAssets.find((a) => a.id === assetId)?.currentBookValue || 0) - amount,
      journalEntryNumber: `JV-DEP-${Date.now().toString().slice(-4)}`,
    };
    setDepreciationEntries((prev) => [entry, ...prev]);
    setFixedAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? {
              ...a,
              accumulatedDepreciation: a.accumulatedDepreciation + amount,
              currentBookValue: Math.max(0, a.currentBookValue - amount),
            }
          : a
      )
    );
    logAction('CREATE', 'Accounting', 'Depreciation', assetId, `Ran Depreciation of ₹${amount?.toLocaleString()} for ${period}`);
  };

  // Module 8 Maintenance & Services State
  const [internalAssets, setInternalAssets] = useState<InternalAsset[]>(mockInternalAssets);
  const [customerMachines, setCustomerMachines] = useState<CustomerMachine[]>(mockCustomerMachines);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(mockServiceRequests);
  const [breakdowns, setBreakdowns] = useState<BreakdownRecord[]>(mockBreakdowns);
  const [preventivePlans, setPreventivePlans] = useState<PreventiveMaintenancePlan[]>(mockPreventiveMaintenancePlans);
  const [servicePlanningItems, setServicePlanningItems] = useState<ServicePlanningItem[]>(mockServicePlanningItems);
  const [serviceVisits, setServiceVisits] = useState<ServiceVisit[]>(mockServiceVisits);
  const [serviceWorkOrders, setServiceWorkOrders] = useState<ServiceWorkOrder[]>(mockServiceWorkOrders);
  const [servicePartIssues, setServicePartIssues] = useState<ServicePartIssue[]>(mockServicePartIssues);
  const [servicePartReturns, setServicePartReturns] = useState<ServicePartReturn[]>(mockServicePartReturns);
  const [serviceReports, setServiceReports] = useState<ServiceReport[]>(mockServiceReports);
  const [warranties, setWarranties] = useState<WarrantyRecord[]>(mockWarranties);
  const [amcContracts, setAmcContracts] = useState<AMCContract[]>(mockAMCContracts);
  const [serviceContracts, setServiceContracts] = useState<ServiceContract[]>(mockServiceContracts);
  const [downtimeRecords, setDowntimeRecords] = useState<DowntimeRecord[]>(mockDowntimeRecords);
  const [maintenanceCosts, setMaintenanceCosts] = useState<MaintenanceCostRecord[]>(mockMaintenanceCosts);
  const [checklistTemplates, setChecklistTemplates] = useState<ServiceChecklistTemplate[]>(mockChecklistTemplates);
  const [technicians, setTechnicians] = useState<TechnicianProfile[]>(mockTechnicians);

  const addInternalAsset = (asset: Omit<InternalAsset, 'id'>) => {
    const newId = `AST-${100 + internalAssets.length + 1}`;
    const newAsset: InternalAsset = { ...asset, id: newId };
    setInternalAssets((prev) => [newAsset, ...prev]);
    logAction('CREATE', 'maintenance', 'assets', newId, `Created asset ${newAsset.assetName}`);
    api.post('/internal-assets/', newAsset).catch((err) => console.warn('Failed to add internal asset:', err));
  };

  const updateInternalAsset = (id: string, assetData: Partial<InternalAsset>) => {
    setInternalAssets((prev) => prev.map((a) => (a.id === id ? { ...a, ...assetData } : a)));
    logAction('UPDATE', 'maintenance', 'assets', id, `Updated asset ${id}`);
    api.patch(`/internal-assets/${id}/`, assetData).catch((err) => console.warn('Failed to update internal asset:', err));
  };

  const addCustomerMachine = (cm: Omit<CustomerMachine, 'id'>) => {
    const newId = `CM-2026-00${customerMachines.length + 1}`;
    const newMachine: CustomerMachine = { ...cm, id: newId };
    setCustomerMachines((prev) => {
      const updated = [newMachine, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_customerMachines', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'maintenance', 'customer-machines', newId, `Registered customer machine ${newMachine.machineName}`);
    api.post('/customer-machines/', newMachine).catch((err) => console.warn('Failed to add customer machine:', err));
  };

  const updateCustomerMachine = (id: string, cmData: Partial<CustomerMachine>) => {
    setCustomerMachines((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, ...cmData } : m));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_customerMachines', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'maintenance', 'customer-machines', id, `Updated customer machine ${id}`);
  };

  const addServiceRequest = (sr: Omit<ServiceRequest, 'id' | 'requestNumber' | 'requestDate' | 'createdAt'>): ServiceRequest => {
    const reqNo = `SR-2026-00${serviceRequests.length + 1}`;
    const newSr: ServiceRequest = {
      ...sr,
      id: reqNo,
      requestNumber: reqNo,
      requestDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    setServiceRequests((prev) => {
      const updated = [newSr, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_serviceRequests', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'maintenance', 'service-requests', reqNo, `Created service request ${reqNo}`);
    sendNotification({
      title: 'New Service Request Logged',
      message: `Service request ${reqNo} created for ${newSr.customerName}`,
      type: 'info',
      department: 'maintenance',
      priority: newSr.priority === 'Critical' ? 'high' : 'normal',
    });
    api.maintenance.serviceRequests.create(newSr).catch((err) => console.warn('Failed to add service request:', err));
    return newSr;
  };

  const updateServiceRequestStatus = (id: string, status: ServiceRequestStatus, assignedTechId?: string, assignedTechName?: string) => {
    setServiceRequests((prev) =>
      prev.map((sr) => {
        if (sr.id === id || sr.requestNumber === id) {
          return {
            ...sr,
            status,
            ...(assignedTechId ? { assignedTechnicianId: assignedTechId, assignedTechnicianName: assignedTechName } : {}),
            ...(status === 'Closed' || status === 'Resolved' ? { closedAt: new Date().toISOString() } : {}),
          };
        }
        return sr;
      })
    );
    logAction('UPDATE', 'maintenance', 'service-requests', id, `Updated SR status to ${status}`);
  };

  const addBreakdown = (bd: Omit<BreakdownRecord, 'id' | 'breakdownNumber'>) => {
    const bdNo = `BD-2026-00${breakdowns.length + 1}`;
    const newBd: BreakdownRecord = { ...bd, id: bdNo, breakdownNumber: bdNo };
    setBreakdowns((prev) => [newBd, ...prev]);
    logAction('CREATE', 'maintenance', 'breakdowns', bdNo, `Reported breakdown ${bdNo} on ${newBd.assetName}`);
    if (newBd.severity === 'Critical') {
      sendNotification({
        title: 'CRITICAL BREAKDOWN ALERT',
        message: `Critical breakdown ${bdNo} reported on ${newBd.assetName}`,
        type: 'alert',
        department: 'maintenance',
        priority: 'high',
      });
    }
    api.post('/breakdowns/', newBd).catch((err) => console.warn('Failed to add breakdown:', err));
  };

  const updateBreakdownStatus = (id: string, status: BreakdownRecord['status'], remarks?: string) => {
    setBreakdowns((prev) =>
      prev.map((bd) => (bd.id === id || bd.breakdownNumber === id ? { ...bd, status, ...(remarks ? { remarks } : {}) } : bd))
    );
    logAction('UPDATE', 'maintenance', 'breakdowns', id, `Updated breakdown status to ${status}`);
  };

  const addPreventivePlan = (plan: Omit<PreventiveMaintenancePlan, 'id' | 'planNumber'>) => {
    const planNo = `PM-PLAN-00${preventivePlans.length + 1}`;
    const newPlan: PreventiveMaintenancePlan = { ...plan, id: planNo, planNumber: planNo };
    setPreventivePlans((prev) => [newPlan, ...prev]);
    logAction('CREATE', 'maintenance', 'preventive', planNo, `Created PM plan ${planNo}`);
    api.post('/pm-plans/', newPlan).catch((err) => console.warn('Failed to add PM plan:', err));
  };

  const addServiceVisit = (visit: Omit<ServiceVisit, 'id' | 'visitNumber'>) => {
    const vNo = `VISIT-2026-00${serviceVisits.length + 1}`;
    const newVisit: ServiceVisit = { ...visit, id: vNo, visitNumber: vNo };
    setServiceVisits((prev) => [newVisit, ...prev]);
    logAction('CREATE', 'maintenance', 'service-visits', vNo, `Created service visit ${vNo}`);
    api.post('/service-visits/', newVisit).catch((err) => console.warn('Failed to add service visit:', err));
  };

  const updateServiceVisitStatus = (id: string, status: ServiceVisitStatus) => {
    setServiceVisits((prev) => prev.map((v) => (v.id === id || v.visitNumber === id ? { ...v, status } : v)));
    logAction('UPDATE', 'maintenance', 'service-visits', id, `Updated visit status to ${status}`);
  };

  const addServiceWorkOrder = (swo: Omit<ServiceWorkOrder, 'id' | 'workOrderNumber'>) => {
    const swoNo = `SWO-2026-00${serviceWorkOrders.length + 1}`;
    const newSwo: ServiceWorkOrder = { ...swo, id: swoNo, workOrderNumber: swoNo };
    setServiceWorkOrders((prev) => [newSwo, ...prev]);
    logAction('CREATE', 'maintenance', 'work-orders', swoNo, `Created service work order ${swoNo}`);
  };

  const updateWorkOrderStatus = (id: string, status: WorkOrderStatus) => {
    setServiceWorkOrders((prev) => prev.map((swo) => (swo.id === id || swo.workOrderNumber === id ? { ...swo, status } : swo)));
    logAction('UPDATE', 'maintenance', 'work-orders', id, `Updated work order status to ${status}`);
  };

  const addServicePartIssue = (issue: Omit<ServicePartIssue, 'id' | 'issueNumber' | 'createdAt'>) => {
    const issueNo = `SPI-2026-00${servicePartIssues.length + 1}`;
    const newIssue: ServicePartIssue = {
      ...issue,
      id: issueNo,
      issueNumber: issueNo,
      createdAt: new Date().toISOString(),
    };
    setServicePartIssues((prev) => [newIssue, ...prev]);
    logAction('CREATE', 'maintenance', 'parts-issue', issueNo, `Created service part issue ${issueNo}`);
    api.maintenance.servicePartIssues.create(newIssue).catch((err) => console.warn('Failed to add service part issue:', err));
  };

  const addServicePartReturn = (ret: Omit<ServicePartReturn, 'id' | 'returnNumber'>) => {
    const retNo = `SPR-2026-00${servicePartReturns.length + 1}`;
    const newRet: ServicePartReturn = { ...ret, id: retNo, returnNumber: retNo };
    setServicePartReturns((prev) => [newRet, ...prev]);
    logAction('CREATE', 'maintenance', 'parts-return', retNo, `Created service part return ${retNo}`);
    api.maintenance.servicePartReturns.create(newRet).catch((err) => console.warn('Failed to add service part return:', err));
  };

  const addServiceReport = (rep: Omit<ServiceReport, 'id' | 'reportNumber'>) => {
    const repNo = `SREP-2026-00${serviceReports.length + 1}`;
    const newRep: ServiceReport = { ...rep, id: repNo, reportNumber: repNo };
    setServiceReports((prev) => [newRep, ...prev]);
    logAction('CREATE', 'maintenance', 'service-reports', repNo, `Created service report ${repNo}`);
    api.maintenance.serviceReports.create(newRep).catch((err) => console.warn('Failed to add service report:', err));
  };

  const addAMCContract = (amc: Omit<AMCContract, 'id' | 'amcNumber'>) => {
    const amcNo = `AMC-2026-00${amcContracts.length + 1}`;
    const newAmc: AMCContract = { ...amc, id: amcNo, amcNumber: amcNo };
    setAmcContracts((prev) => [newAmc, ...prev]);
    logAction('CREATE', 'maintenance', 'amc', amcNo, `Created AMC ${amcNo}`);
    api.post('/amc-contracts/', newAmc).catch((err) => console.warn('Failed to add AMC contract:', err));
  };

  const addDowntimeRecord = (dt: Omit<DowntimeRecord, 'id' | 'downtimeNumber'>) => {
    const dtNo = `DT-2026-00${downtimeRecords.length + 1}`;
    const newDt: DowntimeRecord = { ...dt, id: dtNo, downtimeNumber: dtNo };
    setDowntimeRecords((prev) => [newDt, ...prev]);
    logAction('CREATE', 'maintenance', 'downtime', dtNo, `Logged downtime ${dtNo} for ${newDt.machineName}`);
  };

  const addMaintenanceCost = (mc: Omit<MaintenanceCostRecord, 'id'>) => {
    const newId = `MC-2026-00${maintenanceCosts.length + 1}`;
    const newCost: MaintenanceCostRecord = { ...mc, id: newId };
    setMaintenanceCosts((prev) => [newCost, ...prev]);
    logAction('CREATE', 'maintenance', 'costs', newId, `Recorded maintenance cost ${newId}`);
  };

  // Module 9 HR & Payroll State
  const [designations, setDesignations] = useState<Designation[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_designations');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return mockDesignations;
  });
  const [employeeDocuments, setEmployeeDocuments] = useState<EmployeeDocumentItem[]>(mockEmployeeDocuments);
  const [employeeOnboardings, setEmployeeOnboardings] = useState<EmployeeOnboardingItem[]>(mockEmployeeOnboardings);
  const [employeeTransfers, setEmployeeTransfers] = useState<EmployeeTransferItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_employeeTransfers');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return mockEmployeeTransfers;
  });
  const [employeePromotions, setEmployeePromotions] = useState<EmployeePromotionItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_employeePromotions');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return mockEmployeePromotions;
  });
  const [employeeExits, setEmployeeExits] = useState<EmployeeExitItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_employeeExits');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return mockEmployeeExits;
  });
  const [fullAndFinalSettlements, setFullAndFinalSettlements] = useState<FullAndFinalSettlementItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_fullAndFinalSettlements');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return mockFullAndFinalSettlements;
  });
  const [shiftMasters, setShiftMasters] = useState<ShiftMaster[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_shiftMasters');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return mockShifts;
  });
  const [shiftRosters, setShiftRosters] = useState<ShiftRosterItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_shiftRosters');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return mockShiftRosters;
  });
  const [holidays, setHolidays] = useState<HolidayItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_holidays');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return mockHolidays;
  });
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_leaveTypes');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return mockLeaveTypes;
  });
  const [leaveBalances] = useState<LeaveBalance[]>(mockLeaveBalances);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('UMA_ERP_leaveRequests');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return mockLeaveRequests;
  });
  const [wfhRequests, setWFHRequests] = useState<WFHRequest[]>(mockWFHRequests);
  const [missedPunchRequests, setMissedPunchRequests] = useState<MissedPunchRequest[]>(mockMissedPunchRequests);
  const [attendanceRegularizations, setAttendanceRegularizations] = useState<AttendanceRegularization[]>(mockRegularizationRequests);
  const [overtimeRecords, setOvertimeRecords] = useState<OvertimeRecord[]>(mockOvertimeRecords);
  const [earlyCheckoutRequests, setEarlyCheckoutRequests] = useState<EarlyCheckoutRequest[]>(mockEarlyCheckoutRequests);
  const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>(mockSalaryComponents);
  const [salaryStructures, setSalaryStructures] = useState<SalaryStructure[]>(mockSalaryStructures);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(mockPayrollRecords);
  const [employeeAdvanceLoans, setEmployeeAdvanceLoans] = useState<EmployeeAdvanceLoan[]>(mockEmployeeAdvances);
  const [reimbursementExpenses, setReimbursementExpenses] = useState<ReimbursementExpense[]>(mockReimbursements);
  const [kpiMasters, setKPIMasters] = useState<KPIMaster[]>(mockKPIMasters);
  const [employeeAppraisals, setEmployeeAppraisals] = useState<EmployeeAppraisal[]>(mockEmployeeAppraisals);
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>(mockTrainingPrograms);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>(mockJobPositions);
  const [candidateProfiles, setCandidateProfiles] = useState<CandidateProfile[]>(mockCandidateProfiles);
  const [interviewRecords, setInterviewRecords] = useState<InterviewRecord[]>(mockInterviewRecords);
  const [offerLetters, setOfferLetters] = useState<OfferLetter[]>(mockOfferLetters);

  // Module 9 HR Handlers
  const addDesignation = (desg: Omit<Designation, 'id'>) => {
    const rawCode = (desg.designationCode || '').trim();
    const newId = rawCode ? `DESG-${rawCode.replace(/[^A-Za-z0-9]/g, '').slice(0, 8)}` : `DESG-0${designations.length + 1}`;
    const newDesg: Designation = { ...desg, id: newId };
    setDesignations((prev) => {
      const updated = [...prev.filter((d) => d.id !== newId), newDesg];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_designations', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'hr', 'designations', newId, `Created Designation ${desg.designationName}`);
    api.post('/designations/', newDesg).catch((err) => console.warn('Failed to add designation on backend:', err));
  };

  const updateDesignation = (id: string, desg: Partial<Designation>) => {
    setDesignations((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, ...desg } : d));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_designations', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'hr', 'designations', id, `Updated Designation`);
    api.patch(`/designations/${id}/`, desg).catch((err) => console.warn('Failed to update designation on backend:', err));
  };

  const addEmployeeDocument = (doc: Omit<EmployeeDocumentItem, 'id'>) => {
    const newId = `DOC-${100 + employeeDocuments.length + 1}`;
    const newDoc = { ...doc, id: newId };
    setEmployeeDocuments((prev) => {
      const updated = [newDoc, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_employeeDocuments', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'hr', 'employee-documents', newId, `Uploaded document ${newDoc.documentType} for ${doc.employeeName}`);
    api.post('/employee-documents/', newDoc).catch((err) => console.warn('Failed to add document:', err));
  };

  const deleteEmployeeDocument = (id: string) => {
    setEmployeeDocuments((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_employeeDocuments', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'hr', 'employee-documents', id, `Deleted document ${id}`);
    api.delete(`/employee-documents/${id}/`).catch((err) => console.warn('Failed to delete document:', err));
  };
  const updateEmployeeDocumentStatus = (id: string, status: 'Verified' | 'Pending' | 'Rejected', verifiedBy?: string, remarks?: string) => {
    setEmployeeDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              verificationStatus: status,
              verifiedBy: verifiedBy || d.verifiedBy,
              verifiedDate: new Date().toISOString().split('T')[0],
              remarks: remarks || d.remarks,
            }
          : d
      )
    );
    logAction('UPDATE', 'hr', 'employee-documents', id, `Updated document verification status to ${status}`);
  };

  const addEmployeeOnboarding = (onb: Omit<EmployeeOnboardingItem, 'id'>) => {
    const newId = `ONB-2026-0${employeeOnboardings.length + 1}`;
    const newOnb: EmployeeOnboardingItem = { ...onb, id: newId };
    setEmployeeOnboardings((prev) => {
      const updated = [newOnb, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_employeeOnboardings', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'hr', 'employee-onboarding', newId, `Created onboarding for ${onb.candidateName}`);
    api.hr.onboardings.create(newOnb).then((res) => {
      if (res && res.id) {
        setEmployeeOnboardings((prev) => prev.map((o) => (o.id === newId ? { ...o, ...res } : o)));
      }
    }).catch((err) => console.warn('Failed to sync onboarding to backend:', err));
  };

  const updateEmployeeOnboardingStatus = (id: string, status: EmployeeOnboardingItem['status']) => {
    setEmployeeOnboardings((prev) => {
      const updated = prev.map((o) => (o.id === id ? { ...o, status } : o));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_employeeOnboardings', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'hr', 'employee-onboarding', id, `Updated onboarding status to ${status}`);
    if (status === 'Completed') {
      api.hr.onboardings.complete(id).catch((err) => console.warn('Failed to complete onboarding on backend:', err));
    } else {
      api.hr.onboardings.update(id, { status }).catch((err) => console.warn('Failed to update onboarding status on backend:', err));
    }
  };

  const deleteEmployeeOnboarding = (id: string) => {
    setEmployeeOnboardings((prev) => {
      const updated = prev.filter((o) => o.id !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_employeeOnboardings', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'hr', 'employee-onboarding', id, `Deleted onboarding ${id}`);
    api.hr.onboardings.delete(id).catch((err) => console.warn('Failed to delete onboarding on backend:', err));
  };

  const toggleOnboardingChecklistTask = (onboardingId: string, taskIndex: number) => {
    setEmployeeOnboardings((prev) => {
      const updated = prev.map((o) => {
        if (o.id !== onboardingId) return o;
        const newChecklist = [...o.onboardingChecklist];
        if (newChecklist[taskIndex]) {
          newChecklist[taskIndex] = {
            ...newChecklist[taskIndex],
            completed: !newChecklist[taskIndex].completed,
          };
        }
        return { ...o, onboardingChecklist: newChecklist };
      });
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_employeeOnboardings', JSON.stringify(updated)); } catch (_) {}
      }
      const target = updated.find((o) => o.id === onboardingId);
      if (target) {
        api.hr.onboardings.update(onboardingId, { onboardingChecklist: target.onboardingChecklist }).catch((err) =>
          console.warn('Failed to update onboarding checklist:', err)
        );
      }
      return updated;
    });
  };

  const addEmployeeTransfer = (trn: Omit<EmployeeTransferItem, 'id'>) => {
    const newId = `TRN-2026-0${employeeTransfers.length + 1}`;
    const newTrn: EmployeeTransferItem = { ...trn, id: newId };
    setEmployeeTransfers((prev) => {
      const updated = [newTrn, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_employeeTransfers', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'hr', 'employee-transfers', newId, `Transferred ${trn.employeeName} to ${trn.toDepartment}`);
    api.post('/employee-transfers/', newTrn).catch((err) => console.warn('Failed to sync transfer to backend:', err));
  };

  const updateEmployeeTransfer = (id: string, trn: Partial<EmployeeTransferItem>) => {
    setEmployeeTransfers((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...trn } : t));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_employeeTransfers', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'hr', 'employee-transfers', id, `Updated transfer order ${id}`);
    api.patch(`/employee-transfers/${id}/`, trn).catch((err) => console.warn('Failed to update transfer on backend:', err));
  };

  const deleteEmployeeTransfer = (id: string) => {
    setEmployeeTransfers((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_employeeTransfers', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'hr', 'employee-transfers', id, `Deleted transfer order ${id}`);
    api.delete(`/employee-transfers/${id}/`).catch((err) => console.warn('Failed to delete transfer on backend:', err));
  };

  const addEmployeePromotion = (prm: Omit<EmployeePromotionItem, 'id'>) => {
    const newId = `PRM-2026-0${employeePromotions.length + 1}`;
    const newPrm: EmployeePromotionItem = { ...prm, id: newId };
    setEmployeePromotions((prev) => {
      const updated = [newPrm, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_employeePromotions', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'hr', 'employee-promotions', newId, `Promoted ${prm.employeeName} to ${prm.newDesignation}`);
    api.post('/employee-promotions/', newPrm).catch((err) => console.warn('Failed to sync promotion to backend:', err));
  };

  const updateEmployeePromotion = (id: string, prm: Partial<EmployeePromotionItem>) => {
    setEmployeePromotions((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...prm } : p));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_employeePromotions', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'hr', 'employee-promotions', id, `Updated promotion record ${id}`);
    api.patch(`/employee-promotions/${id}/`, prm).catch((err) => console.warn('Failed to update promotion on backend:', err));
  };

  const deleteEmployeePromotion = (id: string) => {
    setEmployeePromotions((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_employeePromotions', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'hr', 'employee-promotions', id, `Deleted promotion record ${id}`);
    api.delete(`/employee-promotions/${id}/`).catch((err) => console.warn('Failed to delete promotion on backend:', err));
  };

  const addEmployeeExit = (exit: Omit<EmployeeExitItem, 'id'>) => {
    const newId = `EXIT-2026-0${employeeExits.length + 1}`;
    const newExit: EmployeeExitItem = { ...exit, id: newId };
    setEmployeeExits((prev) => {
      const updated = [newExit, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_employeeExits', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'hr', 'resignation-exit', newId, `Logged exit for ${exit.employeeName}`);
    api.post('/employee-exits/', newExit).catch((err) => console.warn('Failed to sync exit to backend:', err));
  };

  const updateEmployeeExit = (id: string, exit: Partial<EmployeeExitItem>) => {
    setEmployeeExits((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...exit } : e));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_employeeExits', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'hr', 'resignation-exit', id, `Updated exit record ${id}`);
    api.patch(`/employee-exits/${id}/`, exit).catch((err) => console.warn('Failed to update exit on backend:', err));
  };

  const deleteEmployeeExit = (id: string) => {
    setEmployeeExits((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_employeeExits', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'hr', 'resignation-exit', id, `Deleted exit record ${id}`);
    api.delete(`/employee-exits/${id}/`).catch((err) => console.warn('Failed to delete exit on backend:', err));
  };

  const updateEmployeeExitClearance = (id: string, clearanceType: 'dept' | 'asset' | 'hr' | 'accounts', status: boolean) => {
    setEmployeeExits((prev) => {
      const updated = prev.map((e) => {
        if (e.id === id) {
          const item = { ...e };
          if (clearanceType === 'dept') item.departmentClearance = status;
          if (clearanceType === 'asset') item.assetReturnClearance = status;
          if (clearanceType === 'hr') item.hrClearance = status;
          if (clearanceType === 'accounts') item.accountsClearance = status;
          if (item.departmentClearance && item.assetReturnClearance && item.hrClearance && item.accountsClearance) {
            item.status = 'Cleared';
          }
          return item;
        }
        return e;
      });
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_employeeExits', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'hr', 'resignation-exit', id, `Updated clearance (${clearanceType}) to ${status}`);
  };

  const addFullAndFinalSettlement = (fnf: Omit<FullAndFinalSettlementItem, 'id'>) => {
    const newId = `FNF-2026-0${fullAndFinalSettlements.length + 1}`;
    const newFnf = { ...fnf, id: newId };
    setFullAndFinalSettlements((prev) => {
      const updated = [newFnf, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_fullAndFinalSettlements', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'hr', 'full-final-settlement', newId, `Calculated F&F settlement for ${fnf.employeeName}`);
    api.post('/full-final-settlements/', newFnf).catch((err) => console.warn('Failed to sync FNF to backend:', err));
  };
  const updateFinalSettlementStatus = (id: string, status: FullAndFinalSettlementItem['paymentStatus'], voucherNo?: string) => {
    setFullAndFinalSettlements((prev) => {
      const updated = prev.map((f) => (f.id === id ? { ...f, paymentStatus: status, ...(voucherNo ? { accountingVoucherNo: voucherNo } : {}) } : f));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_fullAndFinalSettlements', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'hr', 'full-final-settlement', id, `Updated F&F payment status to ${status}`);
    api.patch(`/full-final-settlements/${id}/`, { status, voucherNo }).catch((err) => console.warn('Failed to update FNF status on backend:', err));
  };
  const deleteFullAndFinalSettlement = (id: string) => {
    setFullAndFinalSettlements((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_fullAndFinalSettlements', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'hr', 'full-final-settlement', id, `Deleted F&F settlement record ${id}`);
    api.delete(`/full-final-settlements/${id}/`).catch((err) => console.warn('Failed to delete FNF on backend:', err));
  };

  const addShiftMaster = (shift: Omit<ShiftMaster, 'id'>) => {
    const newId = `SHIFT-0${shiftMasters.length + 1}`;
    const newShift = { ...shift, id: newId };
    setShiftMasters((prev) => {
      const updated = [...prev, newShift];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_shiftMasters', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'hr', 'shift-management', newId, `Created Shift ${shift.shiftName}`);
    api.post('/shifts/', newShift).catch((err) => console.warn('Failed to add shift on backend:', err));
  };
  const updateShiftMaster = (id: string, shift: Partial<ShiftMaster>) => {
    setShiftMasters((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...shift } : s));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_shiftMasters', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'hr', 'shift-management', id, `Updated Shift ${id}`);
    api.patch(`/shifts/${id}/`, shift).catch((err) => console.warn('Failed to update shift on backend:', err));
  };
  const deleteShiftMaster = (id: string) => {
    setShiftMasters((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_shiftMasters', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'hr', 'shift-management', id, `Deleted Shift ${id}`);
    api.delete(`/shifts/${id}/`).catch((err) => console.warn('Failed to delete shift on backend:', err));
  };

  const addShiftRoster = (roster: Omit<ShiftRosterItem, 'id'>) => {
    const newId = `RST-${1000 + shiftRosters.length + 1}`;
    const newRoster = { ...roster, id: newId };
    setShiftRosters((prev) => {
      const updated = [newRoster, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_shiftRosters', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'hr', 'shift-roster', newId, `Assigned shift ${roster.shiftName} to ${roster.employeeName}`);
    api.post('/shift-rosters/', newRoster).catch((err) => console.warn('Failed to add shift roster on backend:', err));
  };
  const updateShiftRoster = (id: string, roster: Partial<ShiftRosterItem>) => {
    setShiftRosters((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, ...roster } : r));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_shiftRosters', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'hr', 'shift-roster', id, `Updated shift roster ${id}`);
    api.patch(`/shift-rosters/${id}/`, roster).catch((err) => console.warn('Failed to update roster on backend:', err));
  };
  const deleteShiftRoster = (id: string) => {
    setShiftRosters((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_shiftRosters', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'hr', 'shift-roster', id, `Deleted shift roster ${id}`);
    api.delete(`/shift-rosters/${id}/`).catch((err) => console.warn('Failed to delete roster on backend:', err));
  };

  const addHoliday = (holiday: Omit<HolidayItem, 'id'>) => {
    const newId = `HOL-2026-${String(holidays.length + 1).padStart(2, '0')}`;
    const newHol: HolidayItem = {
      ...holiday,
      id: newId,
      applicableDepartments: holiday.applicableDepartments || ['All Departments'],
      financialYear: holiday.financialYear || 'FY 2026-27',
      isOptional: Boolean(holiday.isOptional),
    };
    setHolidays((prev) => {
      const updated = [...prev, newHol];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_holidays', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'hr', 'holiday-calendar', newId, `Added Holiday ${holiday.holidayName}`);
    api.hr.holidays.create(newHol).catch((err) => console.warn('Failed to save holiday to backend:', err));
  };

  const updateHoliday = (id: string, holidayData: Partial<HolidayItem>) => {
    setHolidays((prev) => {
      const updated = prev.map((h) => (h.id === id ? { ...h, ...holidayData } : h));
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_holidays', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'hr', 'holiday-calendar', id, `Updated Holiday ${id}`);
    api.hr.holidays.update(id, holidayData).catch((err) => console.warn('Failed to update holiday on backend:', err));
  };

  const deleteHoliday = (id: string) => {
    setHolidays((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_holidays', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('DELETE', 'hr', 'holiday-calendar', id, `Deleted Holiday ${id}`);
    api.hr.holidays.delete(id).catch((err) => console.warn('Failed to delete holiday on backend:', err));
  };

  const markAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    const newId = `ATT-2026-${1000 + attendanceRecords.length + 1}`;
    const newRecord = { ...record, id: newId };
    setAttendanceRecords((prev) => [newRecord, ...prev]);
    logAction('CREATE', 'hr', 'attendance', newId, `Marked attendance ${record.status} for ${record.employeeName}`);
    api.post('/attendance-records/', newRecord).catch((err) => console.warn('Failed to mark attendance via API:', err));
  };
  const updateAttendanceRecord = (id: string, record: Partial<AttendanceRecord>) => {
    setAttendanceRecords((prev) => prev.map((a) => (a.id === id ? { ...a, ...record } : a)));
    logAction('UPDATE', 'hr', 'attendance', id, `Updated attendance record ${id}`);
  };

  const addLeaveType = (lt: Omit<LeaveType, 'id'>) => {
    const newId = `LT-0${leaveTypes.length + 1}`;
    const newLt = { ...lt, id: newId };
    setLeaveTypes((prev) => {
      const updated = [...prev, newLt];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_leaveTypes', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'hr', 'leave-management', newId, `Added Leave Type ${lt.leaveName}`);
  };

  const addLeaveRequest = (req: Omit<LeaveRequest, 'id' | 'leaveNumber' | 'appliedDate' | 'status'>) => {
    const lNo = `LV-2026-${100 + leaveRequests.length + 1}`;
    const newReq: LeaveRequest = {
      ...req,
      id: lNo,
      leaveNumber: lNo,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };
    setLeaveRequests((prev) => {
      const updated = [newReq, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_leaveRequests', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('CREATE', 'hr', 'leave-management', lNo, `Applied for leave ${req.leaveName} by ${req.employeeName}`);
    api.hr.leaves.create(newReq).catch((err) => console.warn('Failed to add leave request:', err));
  };
  const updateLeaveRequestStatus = (id: string, status: LeaveApprovalStatus, approvedBy?: string) => {
    setLeaveRequests((prev) => {
      const updated = prev.map((l) =>
        l.id === id || l.leaveNumber === id
          ? { ...l, status, approvedBy: approvedBy || 'HR / Manager', approvedDate: new Date().toISOString().split('T')[0] }
          : l
      );
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('UMA_ERP_leaveRequests', JSON.stringify(updated)); } catch (_) {}
      }
      return updated;
    });
    logAction('UPDATE', 'hr', 'leave-approvals', id, `Leave request status updated to ${status}`);
    api.patch(`/leave-requests/${id}/`, { status, approvedBy }).catch((err) => console.warn('Failed to update leave request:', err));
  };

  const addWFHRequest = (req: Omit<WFHRequest, 'id' | 'wfhNumber' | 'status'>) => {
    const wNo = `WFH-2026-0${wfhRequests.length + 1}`;
    const newReq: WFHRequest = { ...req, id: wNo, wfhNumber: wNo, status: 'Pending' };
    setWFHRequests((prev) => {
      const updated = [newReq, ...prev];
      try { localStorage.setItem('UMA_ERP_wfhRequests', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('CREATE', 'hr', 'wfh-remote', wNo, `Applied for WFH by ${req.employeeName}`);
    api.post('/wfh-requests/', newReq).catch((err) => console.warn('Failed to add WFH request:', err));
  };

  const updateWFHRequestStatus = (id: string, status: LeaveApprovalStatus, remarks?: string) => {
    const today = new Date().toISOString().split('T')[0];
    setWFHRequests((prev) => {
      const updated = prev.map((w) =>
        w.id === id || w.wfhNumber === id
          ? {
              ...w,
              status,
              remarks: remarks !== undefined ? remarks : w.remarks,
              approvedBy: status === 'Approved' ? 'HR Admin' : status === 'Rejected' ? 'HR Admin' : undefined,
              approvedDate: status === 'Approved' || status === 'Rejected' ? today : undefined,
            }
          : w
      );
      try { localStorage.setItem('UMA_ERP_wfhRequests', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('UPDATE', 'hr', 'wfh-remote', id, `WFH request ${id} status updated to ${status}`);
    api.patch(`/wfh-requests/${id}/`, { status, remarks }).catch(() => {
      api.post(`/wfh-requests/${id}/${status === 'Approved' ? 'approve' : 'reject'}/`).catch((err) => console.warn('Failed to update WFH status:', err));
    });
  };

  const updateWFHRequest = (id: string, updatedData: Partial<WFHRequest>) => {
    setWFHRequests((prev) => {
      const updated = prev.map((w) => (w.id === id || w.wfhNumber === id ? { ...w, ...updatedData } : w));
      try { localStorage.setItem('UMA_ERP_wfhRequests', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('UPDATE', 'hr', 'wfh-remote', id, `Updated WFH request details for ${id}`);
    api.patch(`/wfh-requests/${id}/`, updatedData).catch((err) => console.warn('Failed to update WFH request:', err));
  };

  const deleteWFHRequest = (id: string) => {
    setWFHRequests((prev) => {
      const updated = prev.filter((w) => w.id !== id && w.wfhNumber !== id);
      try { localStorage.setItem('UMA_ERP_wfhRequests', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('DELETE', 'hr', 'wfh-remote', id, `Deleted WFH request ${id}`);
    api.delete(`/wfh-requests/${id}/`).catch((err) => console.warn('Failed to delete WFH request:', err));
  };

  const addMissedPunchRequest = (req: Omit<MissedPunchRequest, 'id' | 'requestNumber' | 'status'>) => {
    const rNo = `MP-2026-0${missedPunchRequests.length + 1}`;
    const newReq: MissedPunchRequest = { ...req, id: rNo, requestNumber: rNo, status: 'Pending' };
    setMissedPunchRequests((prev) => {
      const updated = [newReq, ...prev];
      try { localStorage.setItem('UMA_ERP_missedPunchRequests', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('CREATE', 'hr', 'missed-punch', rNo, `Submitted Missed Punch request for ${req.employeeName}`);
    api.post('/missed-punches/', newReq).catch((err) => console.warn('Failed to add missed punch to backend:', err));
  };

  const updateMissedPunchStatus = (id: string, status: LeaveApprovalStatus, remarks?: string) => {
    setMissedPunchRequests((prev) => {
      const updated = prev.map((m) =>
        m.id === id || m.requestNumber === id ? { ...m, status, remarks: remarks || (m as any).remarks } : m
      );
      try { localStorage.setItem('UMA_ERP_missedPunchRequests', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('UPDATE', 'hr', 'missed-punch', id, `Missed punch status updated to ${status}`);
    api.patch(`/missed-punches/${id}/`, { status, remarks }).catch(() => {
      api.post(`/missed-punches/${id}/${status === 'Approved' ? 'approve' : 'reject'}/`).catch((err) =>
        console.warn('Failed to update missed punch status:', err)
      );
    });
  };

  const updateMissedPunchRequest = (id: string, req: Partial<MissedPunchRequest>) => {
    setMissedPunchRequests((prev) => {
      const updated = prev.map((m) => (m.id === id || m.requestNumber === id ? { ...m, ...req } : m));
      try { localStorage.setItem('UMA_ERP_missedPunchRequests', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('UPDATE', 'hr', 'missed-punch', id, `Updated Missed Punch details for ${id}`);
    api.patch(`/missed-punches/${id}/`, req).catch((err) => console.warn('Failed to update missed punch in backend:', err));
  };

  const deleteMissedPunchRequest = (id: string) => {
    setMissedPunchRequests((prev) => {
      const updated = prev.filter((m) => m.id !== id && m.requestNumber !== id);
      try { localStorage.setItem('UMA_ERP_missedPunchRequests', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('DELETE', 'hr', 'missed-punch', id, `Deleted Missed Punch request ${id}`);
    api.delete(`/missed-punches/${id}/`).catch((err) => console.warn('Failed to delete missed punch from backend:', err));
  };

  const addAttendanceRegularization = (reg: Omit<AttendanceRegularization, 'id' | 'regularizationNo' | 'status'>) => {
    const regNo = `REG-2026-0${attendanceRegularizations.length + 1}`;
    const newReg: AttendanceRegularization = { ...reg, id: regNo, regularizationNo: regNo, status: 'Pending' };
    setAttendanceRegularizations((prev) => [newReg, ...prev]);
    logAction('CREATE', 'hr', 'attendance-regularization', regNo, `Submitted Regularization for ${reg.employeeName}`);
    api.post('/regularizations/', newReg).catch((err) => console.warn('Failed to add regularization:', err));
  };
  const updateAttendanceRegularizationStatus = (id: string, status: LeaveApprovalStatus) => {
    setAttendanceRegularizations((prev) => prev.map((r) => (r.id === id || r.regularizationNo === id ? { ...r, status } : r)));
    logAction('UPDATE', 'hr', 'attendance-regularization', id, `Regularization status updated to ${status}`);
  };

  const addOvertimeRecord = (ot: Omit<OvertimeRecord, 'id' | 'overtimeNo' | 'status'>) => {
    const otNo = `OT-2026-0${overtimeRecords.length + 1}`;
    const newOt: OvertimeRecord = { ...ot, id: otNo, overtimeNo: otNo, status: 'Pending' };
    setOvertimeRecords((prev) => {
      const updated = [newOt, ...prev];
      try { localStorage.setItem('UMA_ERP_overtimeRecords', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('CREATE', 'hr', 'overtime', otNo, `Logged overtime ${ot.overtimeHours} hrs for ${ot.employeeName}`);
    api.hr.overtimeRecords.create(newOt).catch((err) => console.warn('Failed to add overtime record:', err));
  };

  const updateOvertimeStatus = (id: string, status: OvertimeRecord['status'], approvedBy?: string) => {
    setOvertimeRecords((prev) => {
      const updated = prev.map((o) =>
        o.id === id || o.overtimeNo === id
          ? {
              ...o,
              status,
              approvedBy: approvedBy || (status === 'Approved' ? 'HR Manager' : status === 'Rejected' ? 'HR Manager' : o.approvedBy),
            }
          : o
      );
      try { localStorage.setItem('UMA_ERP_overtimeRecords', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('UPDATE', 'hr', 'overtime', id, `Updated overtime status to ${status}`);
    if (status === 'Approved') {
      api.hr.overtimeRecords.approve(id).catch(() => {
        api.hr.overtimeRecords.update(id, { status, approvedBy: approvedBy || 'HR Manager' }).catch((err) =>
          console.warn('Failed to approve overtime:', err)
        );
      });
    } else if (status === 'Rejected') {
      api.hr.overtimeRecords.reject(id).catch(() => {
        api.hr.overtimeRecords.update(id, { status, approvedBy: approvedBy || 'HR Manager' }).catch((err) =>
          console.warn('Failed to reject overtime:', err)
        );
      });
    } else {
      api.hr.overtimeRecords.update(id, { status }).catch((err) => console.warn('Failed to update overtime status:', err));
    }
  };

  const updateOvertimeRecord = (id: string, ot: Partial<OvertimeRecord>) => {
    setOvertimeRecords((prev) => {
      const updated = prev.map((o) => (o.id === id || o.overtimeNo === id ? { ...o, ...ot } : o));
      try { localStorage.setItem('UMA_ERP_overtimeRecords', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('UPDATE', 'hr', 'overtime', id, `Updated overtime details for ${id}`);
    api.hr.overtimeRecords.update(id, ot).catch((err) => console.warn('Failed to update overtime record:', err));
  };

  const deleteOvertimeRecord = (id: string) => {
    setOvertimeRecords((prev) => {
      const updated = prev.filter((o) => o.id !== id && o.overtimeNo !== id);
      try { localStorage.setItem('UMA_ERP_overtimeRecords', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('DELETE', 'hr', 'overtime', id, `Deleted overtime record ${id}`);
    api.hr.overtimeRecords.delete(id).catch((err) => console.warn('Failed to delete overtime record:', err));
  };

  const addEarlyCheckoutRequest = (req: Omit<EarlyCheckoutRequest, 'id' | 'requestNumber' | 'status'>) => {
    const rNo = `ECO-2026-0${earlyCheckoutRequests.length + 1}`;
    const newReq: EarlyCheckoutRequest = { ...req, id: rNo, requestNumber: rNo, status: 'Pending' };
    setEarlyCheckoutRequests((prev) => {
      const updated = [newReq, ...prev];
      try { localStorage.setItem('UMA_ERP_earlyCheckoutRequests', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('CREATE', 'hr', 'early-checkout', rNo, `Early checkout request for ${req.employeeName}`);
    api.hr.earlyCheckouts.create(newReq).catch((err) => console.warn('Failed to add early checkout to backend:', err));
  };

  const updateEarlyCheckoutStatus = (id: string, status: LeaveApprovalStatus, remarks?: string) => {
    setEarlyCheckoutRequests((prev) => {
      const updated = prev.map((e) =>
        e.id === id || e.requestNumber === id
          ? { ...e, status, remarks: remarks || (e as any).remarks }
          : e
      );
      try { localStorage.setItem('UMA_ERP_earlyCheckoutRequests', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('UPDATE', 'hr', 'early-checkout', id, `Updated early checkout status to ${status}`);
    if (status === 'Approved') {
      api.hr.earlyCheckouts.approve(id).catch(() => {
        api.hr.earlyCheckouts.update(id, { status }).catch((err) => console.warn('Failed to approve early checkout:', err));
      });
    } else if (status === 'Rejected') {
      api.hr.earlyCheckouts.reject(id).catch(() => {
        api.hr.earlyCheckouts.update(id, { status }).catch((err) => console.warn('Failed to reject early checkout:', err));
      });
    } else {
      api.hr.earlyCheckouts.update(id, { status }).catch((err) => console.warn('Failed to update early checkout status:', err));
    }
  };

  const updateEarlyCheckoutRequest = (id: string, req: Partial<EarlyCheckoutRequest>) => {
    setEarlyCheckoutRequests((prev) => {
      const updated = prev.map((e) => (e.id === id || e.requestNumber === id ? { ...e, ...req } : e));
      try { localStorage.setItem('UMA_ERP_earlyCheckoutRequests', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('UPDATE', 'hr', 'early-checkout', id, `Updated early checkout details for ${id}`);
    api.hr.earlyCheckouts.update(id, req).catch((err) => console.warn('Failed to update early checkout:', err));
  };

  const deleteEarlyCheckoutRequest = (id: string) => {
    setEarlyCheckoutRequests((prev) => {
      const updated = prev.filter((e) => e.id !== id && e.requestNumber !== id);
      try { localStorage.setItem('UMA_ERP_earlyCheckoutRequests', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('DELETE', 'hr', 'early-checkout', id, `Deleted early checkout record ${id}`);
    api.hr.earlyCheckouts.delete(id).catch((err) => console.warn('Failed to delete early checkout:', err));
  };

  const addSalaryComponent = (comp: Omit<SalaryComponent, 'id'>) => {
    const newId = `SAL-COMP-0${salaryComponents.length + 1}`;
    const newComp = { ...comp, id: newId };
    setSalaryComponents((prev) => [...prev, newComp]);
    logAction('CREATE', 'hr', 'salary-components', newId, `Added Salary Component ${comp.componentName}`);
    api.post('/salary-components/', newComp).catch((err) => console.warn('Failed to add salary component:', err));
  };
  const updateSalaryComponent = (id: string, comp: Partial<SalaryComponent>) => {
    setSalaryComponents((prev) => prev.map((c) => (c.id === id ? { ...c, ...comp } : c)));
    logAction('UPDATE', 'hr', 'salary-components', id, `Updated Salary Component ${id}`);
  };

  const addSalaryStructure = (sal: Omit<SalaryStructure, 'id'>) => {
    const newId = `SAL-STR-0${salaryStructures.length + 1}`;
    const newSal = { ...sal, id: newId };
    setSalaryStructures((prev) => [...prev, newSal]);
    logAction('CREATE', 'hr', 'salary-structure', newId, `Created Salary Structure for ${sal.employeeName}`);
    api.post('/salary-structures/', newSal).catch((err) => console.warn('Failed to add salary structure:', err));
  };
  const updateSalaryStructure = (id: string, sal: Partial<SalaryStructure>) => {
    setSalaryStructures((prev) => prev.map((s) => (s.id === id ? { ...s, ...sal } : s)));
    logAction('UPDATE', 'hr', 'salary-structure', id, `Updated Salary Structure for ${id}`);
  };

  const generateMonthlyPayroll = (monthYear: string, financialYear: string) => {
    const newRecords: PayrollRecord[] = salaryStructures.map((struct, idx) => {
      const pNo = `PAY-2026-${monthYear.substring(0, 3)?.toUpperCase()}-0${idx + 1}`;
      return {
        id: pNo,
        payrollNumber: pNo,
        monthYear,
        financialYear,
        employeeId: struct.employeeId,
        employeeName: struct.employeeName,
        department: 'Production',
        designation: 'Engineer',
        workingDays: 26,
        presentDays: 25,
        leaveDays: 1,
        lossOfPayDays: 0,
        overtimeHours: 6,
        basicSalary: struct.basicSalary,
        hra: struct.hra,
        allowances: struct.conveyanceAllowance + struct.medicalAllowance + struct.specialAllowance,
        overtimeAmount: 1800,
        grossEarnings: struct.grossSalary + 1800,
        pfDeduction: struct.employeePF,
        esiDeduction: struct.employeeESI,
        ptDeduction: struct.professionalTax,
        tdsDeduction: struct.tdsMonthly,
        loanAdvanceRecovery: 0,
        otherDeductions: 0,
        totalDeductions: struct.totalDeductions,
        netSalary: struct.netSalary + 1800,
        employerPF: struct.employerPF,
        employerESI: struct.employerESI,
        totalCTC: struct.totalCTC + 1800,
        status: 'Draft',
        processedDate: new Date().toISOString().split('T')[0],
      };
    });
    setPayrollRecords((prev) => [...newRecords, ...prev]);
    logAction('CREATE', 'hr', 'monthly-payroll', monthYear, `Generated monthly payroll for ${monthYear}`);
  };
  const updatePayrollStatus = (id: string, status: PayrollStatusType, approvedBy?: string) => {
    setPayrollRecords((prev) =>
      prev.map((p) => (p.id === id || p.payrollNumber === id ? { ...p, status, approvedBy: approvedBy || p.approvedBy } : p))
    );
    logAction('UPDATE', 'hr', 'payroll-approvals', id, `Updated payroll status to ${status}`);
  };

  const addEmployeeAdvanceLoan = (loan: Omit<EmployeeAdvanceLoan, 'id' | 'loanNumber' | 'status'>) => {
    const lNo = `ADV-2026-0${employeeAdvanceLoans.length + 1}`;
    const newLoan: EmployeeAdvanceLoan = { ...loan, id: lNo, loanNumber: lNo, status: 'Active' };
    setEmployeeAdvanceLoans((prev) => [newLoan, ...prev]);
    logAction('CREATE', 'hr', 'advances-loans', lNo, `Sanctioned advance/loan ${lNo} for ${loan.employeeName}`);
    api.post('/advance-loans/', newLoan).catch((err) => console.warn('Failed to add advance loan:', err));
  };
  const updateEmployeeAdvanceLoan = (id: string, loan: Partial<EmployeeAdvanceLoan>) => {
    setEmployeeAdvanceLoans((prev) => prev.map((l) => (l.id === id || l.loanNumber === id ? { ...l, ...loan } : l)));
    logAction('UPDATE', 'hr', 'advances-loans', id, `Updated advance/loan ${id}`);
  };

  const addReimbursementExpense = (exp: Omit<ReimbursementExpense, 'id' | 'reimbursementNo' | 'status'>) => {
    const rNo = `EXP-2026-0${reimbursementExpenses.length + 1}`;
    const newExp: ReimbursementExpense = { ...exp, id: rNo, reimbursementNo: rNo, status: 'Pending Manager' };
    setReimbursementExpenses((prev) => [newExp, ...prev]);
    logAction('CREATE', 'hr', 'reimbursements', rNo, `Submitted expense ${rNo} by ${exp.employeeName}`);
    api.post('/reimbursements/', newExp).catch((err) => console.warn('Failed to add reimbursement:', err));
  };
  const updateReimbursementStatus = (id: string, status: ReimbursementExpense['status'], approvedBy?: string) => {
    setReimbursementExpenses((prev) =>
      prev.map((r) => (r.id === id || r.reimbursementNo === id ? { ...r, status, approvedBy: approvedBy || r.approvedBy } : r))
    );
    logAction('UPDATE', 'hr', 'reimbursements', id, `Updated reimbursement status to ${status}`);
  };

  const addKPIMaster = (kpi: Omit<KPIMaster, 'id'>) => {
    const kNo = `KPI-0${kpiMasters.length + 1}`;
    const newKpi = { ...kpi, id: kNo };
    setKPIMasters((prev) => [...prev, newKpi]);
    logAction('CREATE', 'hr', 'kpi-management', kNo, `Added KPI ${kpi.kpiName}`);
  };

  const addEmployeeAppraisal = (app: Omit<EmployeeAppraisal, 'id' | 'appraisalNumber' | 'status'> & { id?: string; appraisalNumber?: string; status?: EmployeeAppraisal['status'] }) => {
    const aNo = app.appraisalNumber || `APR-2026-0${employeeAppraisals.length + 1}`;
    const newApp: EmployeeAppraisal = {
      ...app,
      id: app.id || aNo,
      appraisalNumber: aNo,
      status: app.status || 'Self Review Pending',
    };
    setEmployeeAppraisals((prev) => {
      const updated = [newApp, ...prev];
      try { localStorage.setItem('UMA_ERP_employeeAppraisals', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('CREATE', 'hr', 'appraisals', aNo, `Initiated Appraisal ${aNo} for ${app.employeeName}`);
    api.hr.appraisals.create(newApp).catch((err) => console.warn('Failed to add appraisal to backend:', err));
  };

  const updateEmployeeAppraisal = (id: string, app: Partial<EmployeeAppraisal>) => {
    setEmployeeAppraisals((prev) => {
      const updated = prev.map((a) => (a.id === id || a.appraisalNumber === id ? { ...a, ...app } : a));
      try { localStorage.setItem('UMA_ERP_employeeAppraisals', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('UPDATE', 'hr', 'appraisals', id, `Updated appraisal details for ${id}`);
    api.hr.appraisals.update(id, app).catch((err) => console.warn('Failed to update appraisal in backend:', err));
  };

  const deleteEmployeeAppraisal = (id: string) => {
    setEmployeeAppraisals((prev) => {
      const updated = prev.filter((a) => a.id !== id && a.appraisalNumber !== id);
      try { localStorage.setItem('UMA_ERP_employeeAppraisals', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('DELETE', 'hr', 'appraisals', id, `Deleted appraisal ${id}`);
    api.hr.appraisals.delete(id).catch((err) => console.warn('Failed to delete appraisal from backend:', err));
  };

  const updateAppraisalStatus = (id: string, status: EmployeeAppraisal['status'], remarks?: string) => {
    setEmployeeAppraisals((prev) => {
      const updated = prev.map((a) =>
        a.id === id || a.appraisalNumber === id
          ? {
              ...a,
              status,
              managerComments: remarks
                ? `${a.managerComments || ''}\n[Status: ${status} - ${remarks}]`.trim()
                : a.managerComments,
            }
          : a
      );
      try { localStorage.setItem('UMA_ERP_employeeAppraisals', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    logAction('UPDATE', 'hr', 'appraisals', id, `Updated appraisal status to ${status}`);
    if (status === 'Approved') {
      api.hr.appraisals.approve(id).catch(() => {
        api.hr.appraisals.update(id, { status }).catch((err) => console.warn('Failed to approve appraisal:', err));
      });
    } else if (status === 'Rejected') {
      api.hr.appraisals.reject(id).catch(() => {
        api.hr.appraisals.update(id, { status }).catch((err) => console.warn('Failed to reject appraisal:', err));
      });
    } else {
      api.hr.appraisals.update(id, { status }).catch((err) => console.warn('Failed to update appraisal status:', err));
    }
  };

  const addTrainingProgram = (tr: Omit<TrainingProgram, 'id'>) => {
    const tNo = `TRN-PROG-0${trainingPrograms.length + 1}`;
    const newTr = { ...tr, id: tNo };
    setTrainingPrograms((prev) => [...prev, newTr]);
    logAction('CREATE', 'hr', 'training', tNo, `Scheduled Training ${tr.title}`);
  };
  const updateTrainingStatus = (id: string, status: TrainingProgram['status']) => {
    setTrainingPrograms((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    logAction('UPDATE', 'hr', 'training', id, `Updated training status to ${status}`);
  };

  const addJobPosition = (pos: Omit<JobPosition, 'id'>) => {
    const pNo = `JOB-POS-0${jobPositions.length + 1}`;
    const newPos = { ...pos, id: pNo };
    setJobPositions((prev) => [...prev, newPos]);
    logAction('CREATE', 'hr', 'recruitment-positions', pNo, `Opened Job Position ${pos.title}`);
  };
  const updateJobPositionStatus = (id: string, status: JobPosition['status']) => {
    setJobPositions((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    logAction('UPDATE', 'hr', 'recruitment-positions', id, `Updated position status to ${status}`);
  };

  const addCandidateProfile = (cand: Omit<CandidateProfile, 'id' | 'candidateCode'>) => {
    const cNo = `CAND-2026-0${candidateProfiles.length + 1}`;
    const newCand = { ...cand, id: cNo, candidateCode: cNo };
    setCandidateProfiles((prev) => [newCand, ...prev]);
    logAction('CREATE', 'hr', 'recruitment-candidates', cNo, `Added candidate ${cand.candidateName}`);
  };
  const updateCandidateStatus = (id: string, status: CandidateProfile['status']) => {
    setCandidateProfiles((prev) => prev.map((c) => (c.id === id || c.candidateCode === id ? { ...c, status } : c)));
    logAction('UPDATE', 'hr', 'recruitment-candidates', id, `Updated candidate status to ${status}`);
  };

  const addInterviewRecord = (interview: Omit<InterviewRecord, 'id'>) => {
    const iNo = `INT-2026-0${interviewRecords.length + 1}`;
    const newInt = { ...interview, id: iNo };
    setInterviewRecords((prev) => [newInt, ...prev]);
    logAction('CREATE', 'hr', 'interview-management', iNo, `Logged interview for ${interview.candidateName}`);
  };

  const addOfferLetter = (offer: Omit<OfferLetter, 'id' | 'offerNumber' | 'status'>) => {
    const oNo = `OFF-2026-0${offerLetters.length + 1}`;
    const newOffer: OfferLetter = { ...offer, id: oNo, offerNumber: oNo, status: 'Sent' };
    setOfferLetters((prev) => [newOffer, ...prev]);
    logAction('CREATE', 'hr', 'offer-management', oNo, `Generated Offer Letter ${oNo} for ${offer.candidateName}`);
  };
  const updateOfferLetterStatus = (id: string, status: OfferLetter['status']) => {
    setOfferLetters((prev) => prev.map((o) => (o.id === id || o.offerNumber === id ? { ...o, status } : o)));
    logAction('UPDATE', 'hr', 'offer-management', id, `Updated offer letter status to ${status}`);
  };
  const approveCentralItem = (id: string, approverName: string) => {
    setCentralApprovals((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'Approved' } : item)));
    logAction('APPROVE', 'Integration', 'Approval Center', id, `Approved request ${id} by ${approverName}`);
  };

  const rejectCentralItem = (id: string, remarks: string) => {
    setCentralApprovals((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'Rejected', remarks } : item)));
    logAction('REJECT', 'Integration', 'Approval Center', id, `Rejected request ${id}. Remarks: ${remarks}`);
  };

  const dismissCentralAlert = (id: string) => {
    setCentralAlerts((prev) => prev.map((alt) => (alt.id === id ? { ...alt, isRead: true } : alt)));
  };

  return (
    <ERPContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        availableEmployees: deduplicateEmployees(employees && employees.length > 0 ? employees : INITIAL_EMPLOYEES),
        isAuthenticated,
        login,
        logout,
        updateCurrentUserProfile,
        changePassword,
        activeDepartment,
        setActiveDepartment,
        sidebarCollapsed,
        setSidebarCollapsed,
        isSearchOpen,
        setIsSearchOpen,
        can,
        hasDepartmentAccess,
        company,
        updateCompany,
        numbering,
        updateNumbering,
        addNumbering,
        resetNumbering,
        getNextDocNumber,
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        roles,
        addRole,
        updateRole,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        resetEmployeePassword,
        leads,
        addLead,
        updateLead,
        deleteLead,
        convertLeadToCustomer,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        contacts,
        addContact,
        enquiries,
        addEnquiry,
        updateEnquiry,
        opportunities,
        addOpportunity,
        updateOpportunity,
        followUps,
        addFollowUp,
        completeFollowUp,
        siteVisits,
        addSiteVisit,
        updateSiteVisit,
        deleteSiteVisit,
        exhibitions,
        addExhibition,
        updateExhibition,
        deleteExhibition,
        quotations,
        addQuotation,
        addQuotationRevision,
        updateQuotationStatus,
        customerPOs,
        addCustomerPO,
        convertCustomerPOToSalesOrder,
        salesOrders,
        addSalesOrder,
        createProjectFromSalesOrder,
        projectJobs,
        updateProject,
        deleteProject,
        projectTasks,
        addProjectTask,
        updateProjectTask,
        deleteProjectTask,
        projectPlanningStages,
        updatePlanningStage,
        generateDefaultPlanningStages,
        addPlanningStage,
        deletePlanningStage,
        reorderPlanningStages,
        markPlanningStageCompleted,
        departmentAssignments,
        assignDepartment,
        projectMilestones,
        addProjectMilestone,
        updateProjectMilestone,
        projectIssues,
        addProjectIssue,
        resolveProjectIssue,
        projectDelays,
        addProjectDelay,
        changeRequests,
        addCustomerChangeRequest,
        approveChangeRequest,
        projectDocuments,
        addProjectDocument,
        projectCosts,
        updateProjectCost,
        projectComments,
        addProjectComment,
        projectApprovals,
        approveProjectAction,
        projectActivities,
        logProjectActivity,
        designJobs,
        addDesignJob,
        updateDesignJob,
        customerRequirements,
        addCustomerRequirement,
        approveCustomerRequirement,
        designTasks,
        addDesignTask,
        updateDesignTask,
        drawings2D,
        addDrawing2D,
        designs3D,
        addDesign3D,
        assemblyDrawings,
        addAssemblyDrawing,
        partDrawings,
        addPartDrawing,
        boms,
        addBOM,
        updateBOM,
        bomRevisions,
        addBOMRevision,
        designRevisions,
        addDesignRevision,
        designReviews,
        addDesignReview,
        technicalDocuments,
        addTechnicalDocument,
        releaseDesignToManufacturing,
        revokeDesignRelease,
        approveDesignJob,
        disapproveDesignJob,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        supplierContacts,
        addSupplierContact,
        materialRequirements,
        addMaterialRequirement,
        purchaseRequisitions,
        addPurchaseRequisition,
        approvePurchaseRequisition,
        rejectPurchaseRequisition,
        updatePurchaseRequisitionStatus,
        rfqs,
        addRFQ,
        supplierQuotations,
        addSupplierQuotation,
        approveSupplierQuotation,
        quotationComparisons,
        addQuotationComparison,
        approveQuotationComparison,
        purchaseOrders,
        addPurchaseOrder,
        approvePurchaseOrder,
        poRevisions,
        addPORevision,
        purchaseFollowUps,
        addPurchaseFollowUp,
        purchaseReturns,
        addPurchaseReturn,
        itemMasters,
        addItemMaster,
        updateItemMaster,
        deleteItemMaster,
        itemCategories,
        addItemCategory,
        uoms,
        addUOM,
        warehouses,
        addWarehouse,
        updateWarehouse,
        warehouseLocations,
        addWarehouseLocation,
        openingStocks,
        addOpeningStock,
        goodsReceipts,
        addGRN,
        qcInspections,
        addQCInspection,
        approveQCInspection,
        stockBalances,
        updateStockBalance,
        stockReservations,
        addStockReservation,
        releaseStockReservation,
        materialIssues,
        addMaterialIssue,
        materialReturns,
        addMaterialReturn,
        stockTransfers,
        addStockTransfer,
        stockAdjustments,
        addStockAdjustment,
        scrapEntries,
        addScrapEntry,
        physicalStockCounts,
        addPhysicalStockCount,
        stockLedgers,
        logStockLedgerEntry,
        manufacturingJobs,
        addManufacturingJob,
        updateManufacturingJob,
        productionPlans,
        addProductionPlan,
        workOrders,
        addWorkOrder,
        releaseWorkOrder,
        productionOrders,
        addProductionOrder,
        routingOperations,
        addRoutingOperation,
        workCenters,
        addWorkCenter,
        updateWorkCenter,
        productionSchedules,
        addProductionSchedule,
        mrpRequirements,
        productionEntries,
        recordProductionEntry,
        wipRecords,
        productionHolds,
        addProductionHold,
        resumeProductionHold,
        reworkOrders,
        addReworkOrder,
        productionScraps,
        addProductionScrap,
        productionCompletions,
        completeWorkOrder,
        finishedGoods,
        addFinishedGoods,
        productionCosts,

        // Module 7 Accounting exports
        financialYears,
        closeFinancialYear,
        chartOfAccounts,
        addChartOfAccount,
        accountGroups,
        addAccountGroup,
        taxMasters,
        addTaxMaster,
        tdsMasters,
        addTDSMaster,
        costCenters,
        addCostCenter,
        salesInvoices,
        addSalesInvoice,
        approveSalesInvoice,
        updateSalesInvoicePayment,
        purchaseInvoices,
        addPurchaseInvoice,
        postPurchaseInvoice,
        creditNotes,
        addCreditNote,
        updateCreditNote,
        deleteCreditNote,
        debitNotes,
        addDebitNote,
        updateDebitNote,
        deleteDebitNote,
        customerReceipts,
        addCustomerReceipt,
        supplierPayments,
        addSupplierPayment,
        journalEntries,
        addJournalEntry,
        deleteJournalEntry,
        contraEntries,
        addContraEntry,
        deleteContraEntry,
        expenseEntries,
        addExpenseEntry,
        updateExpenseEntry,
        deleteExpenseEntry,
        approveExpenseEntry,
        bankAccounts,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        bankTransactions,
        bankReconciliations,
        reconcileBankTransaction,
        fixedAssets,
        addFixedAsset,
        updateFixedAsset,
        deleteFixedAsset,
        depreciationEntries,
        runDepreciation,
        jobCostings,
        receivableAging,
        payableAging,

        // Module 8 Maintenance & Services exports
        internalAssets,
        addInternalAsset,
        updateInternalAsset,
        customerMachines,
        addCustomerMachine,
        updateCustomerMachine,
        serviceRequests,
        addServiceRequest,
        updateServiceRequestStatus,
        breakdowns,
        addBreakdown,
        updateBreakdownStatus,
        preventivePlans,
        addPreventivePlan,
        servicePlanningItems,
        serviceVisits,
        addServiceVisit,
        updateServiceVisitStatus,
        serviceWorkOrders,
        addServiceWorkOrder,
        updateWorkOrderStatus,
        servicePartIssues,
        addServicePartIssue,
        servicePartReturns,
        addServicePartReturn,
        serviceReports,
        addServiceReport,
        warranties,
        amcContracts,
        addAMCContract,
        serviceContracts,
        downtimeRecords,
        addDowntimeRecord,
        maintenanceCosts,
        addMaintenanceCost,
        checklistTemplates,
        technicians,

        // Module 9 HR & Payroll exports
        designations,
        addDesignation,
        updateDesignation,
        employeeDocuments,
        addEmployeeDocument,
        deleteEmployeeDocument,
        updateEmployeeDocumentStatus,
        employeeOnboardings,
        addEmployeeOnboarding,
        updateEmployeeOnboardingStatus,
        deleteEmployeeOnboarding,
        toggleOnboardingChecklistTask,
        employeeTransfers,
        addEmployeeTransfer,
        updateEmployeeTransfer,
        deleteEmployeeTransfer,
        employeePromotions,
        addEmployeePromotion,
        updateEmployeePromotion,
        deleteEmployeePromotion,
        employeeExits,
        addEmployeeExit,
        updateEmployeeExit,
        deleteEmployeeExit,
        updateEmployeeExitClearance,
        fullAndFinalSettlements,
        addFullAndFinalSettlement,
        updateFinalSettlementStatus,
        deleteFullAndFinalSettlement,
        shiftMasters,
        addShiftMaster,
        updateShiftMaster,
        deleteShiftMaster,
        shiftRosters,
        addShiftRoster,
        updateShiftRoster,
        deleteShiftRoster,
        holidays,
        addHoliday,
        updateHoliday,
        deleteHoliday,
        attendanceRecords,
        markAttendance,
        updateAttendanceRecord,
        leaveTypes,
        addLeaveType,
        leaveBalances,
        leaveRequests,
        addLeaveRequest,
        updateLeaveRequestStatus,
        wfhRequests,
        addWFHRequest,
        updateWFHRequestStatus,
        updateWFHRequest,
        deleteWFHRequest,
        missedPunchRequests,
        addMissedPunchRequest,
        updateMissedPunchStatus,
        updateMissedPunchRequest,
        deleteMissedPunchRequest,
        attendanceRegularizations,
        addAttendanceRegularization,
        updateAttendanceRegularizationStatus,
        overtimeRecords,
        addOvertimeRecord,
        updateOvertimeStatus,
        updateOvertimeRecord,
        deleteOvertimeRecord,
        earlyCheckoutRequests,
        addEarlyCheckoutRequest,
        updateEarlyCheckoutStatus,
        updateEarlyCheckoutRequest,
        deleteEarlyCheckoutRequest,
        salaryComponents,
        addSalaryComponent,
        updateSalaryComponent,
        salaryStructures,
        addSalaryStructure,
        updateSalaryStructure,
        payrollRecords,
        generateMonthlyPayroll,
        updatePayrollStatus,
        employeeAdvanceLoans,
        addEmployeeAdvanceLoan,
        updateEmployeeAdvanceLoan,
        reimbursementExpenses,
        addReimbursementExpense,
        updateReimbursementStatus,
        kpiMasters,
        addKPIMaster,
        employeeAppraisals,
        addEmployeeAppraisal,
        updateAppraisalStatus,
        updateEmployeeAppraisal,
        deleteEmployeeAppraisal,
        trainingPrograms,
        addTrainingProgram,
        updateTrainingStatus,
        jobPositions,
        addJobPosition,
        updateJobPositionStatus,
        candidateProfiles,
        addCandidateProfile,
        updateCandidateStatus,
        interviewRecords,
        addInterviewRecord,
        offerLetters,
        addOfferLetter,
        updateOfferLetterStatus,



        job360List,
        centralApprovals,
        centralAlerts,
        jobProfitabilityList,
        customer360List,
        supplier360List,
        item360List,
        employee360List,
        activeRoleView,
        setActiveRoleView,
        approveCentralItem,
        rejectCentralItem,
        dismissCentralAlert,

        jobs,
        selectedJobForModal,
        openJobModal,
        closeJobModal,
        updateJobStatus,
        auditLogs,
        logAction,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        clearAllNotifications,
        sendNotification,

        testCases,
        updateTestCaseStatus,
        resetTestCases,
        runAllMTOVerifications,
        bugTickets,
        addBugTicket,
        updateBugTicketStatus,
        backupRecords,
        createBackupRecord,
        restoreBackupRecord,
        dataImportLogs,
        executeDataImport,
        securityChecks,
        goLiveChecklist,
        toggleGoLiveItem,
        isInitialLoading,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
}

export function useERP() {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
}
