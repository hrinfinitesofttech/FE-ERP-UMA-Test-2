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
  INITIAL_BANK_TRANSACTIONS,
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
  getNextDocNumber: (docType: NumberingSetting['docType']) => string;

  // Master Entities
  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id' | 'employeeCount'>) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;

  roles: Role[];
  addRole: (role: Omit<Role, 'id'>) => void;
  updateRole: (id: string, role: Partial<Role>) => void;

  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;

  // CRM Entities
  leads: Lead[];
  addLead: (leadData: Omit<Lead, 'id' | 'leadNo' | 'createdDate'>) => Lead;
  updateLead: (id: string, leadData: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  convertLeadToCustomer: (leadId: string) => { customer: Customer; enquiry?: Enquiry; opportunity?: Opportunity };

  customers: Customer[];
  addCustomer: (custData: Omit<Customer, 'id' | 'customerCode' | 'createdDate'>) => Customer;
  updateCustomer: (id: string, custData: Partial<Customer>) => void;

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

  exhibitions: Exhibition[];
  addExhibition: (expoData: Omit<Exhibition, 'id'>) => Exhibition;

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

  // Module 4: Purchase Management Entities
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  supplierContacts: SupplierContact[];
  addSupplierContact: (contact: Omit<SupplierContact, 'id'>) => void;
  materialRequirements: MaterialRequirement[];
  addMaterialRequirement: (mrp: Omit<MaterialRequirement, 'id'>) => void;
  purchaseRequisitions: PurchaseRequisition[];
  addPurchaseRequisition: (pr: Omit<PurchaseRequisition, 'id' | 'prDate'>) => void;
  approvePurchaseRequisition: (id: string, approvedBy: string) => void;
  rfqs: RequestForQuotation[];
  addRFQ: (rfq: Omit<RequestForQuotation, 'id' | 'rfqDate'>) => void;
  supplierQuotations: SupplierQuotation[];
  addSupplierQuotation: (sq: Omit<SupplierQuotation, 'id'>) => void;
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
  purchaseInvoices: PurchaseInvoice[];
  addPurchaseInvoice: (inv: Omit<PurchaseInvoice, 'id' | 'invoiceNumber' | 'createdAt'>) => void;
  postPurchaseInvoice: (id: string) => void;
  creditNotes: CreditNote[];
  addCreditNote: (cn: Omit<CreditNote, 'id' | 'creditNoteNumber'>) => void;
  debitNotes: DebitNote[];
  addDebitNote: (dn: Omit<DebitNote, 'id' | 'debitNoteNumber'>) => void;
  customerReceipts: CustomerReceipt[];
  addCustomerReceipt: (rec: Omit<CustomerReceipt, 'id' | 'receiptNumber'>) => void;
  supplierPayments: SupplierPayment[];
  addSupplierPayment: (pay: Omit<SupplierPayment, 'id' | 'paymentNumber'>) => void;
  journalEntries: JournalEntry[];
  addJournalEntry: (jv: Omit<JournalEntry, 'id' | 'journalNumber'>) => void;
  contraEntries: ContraEntry[];
  addContraEntry: (contra: Omit<ContraEntry, 'id' | 'contraNumber'>) => void;
  expenseEntries: ExpenseEntry[];
  addExpenseEntry: (exp: Omit<ExpenseEntry, 'id' | 'expenseNumber'>) => void;
  approveExpenseEntry: (id: string, approvedBy: string) => void;
  bankAccounts: BankAccount[];
  addBankAccount: (bank: Omit<BankAccount, 'id' | 'currentBalance'>) => void;
  bankTransactions: BankTransaction[];
  bankReconciliations: BankReconciliation[];
  reconcileBankTransaction: (transactionId: string, matchedErpDocNumber: string) => void;
  fixedAssets: FixedAsset[];
  addFixedAsset: (asset: Omit<FixedAsset, 'id'>) => void;
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
  updateEmployeeDocumentStatus: (id: string, status: 'Verified' | 'Pending' | 'Rejected', verifiedBy?: string, remarks?: string) => void;
  employeeOnboardings: EmployeeOnboardingItem[];
  addEmployeeOnboarding: (onb: Omit<EmployeeOnboardingItem, 'id'>) => void;
  updateEmployeeOnboardingStatus: (id: string, status: EmployeeOnboardingItem['status']) => void;
  employeeTransfers: EmployeeTransferItem[];
  addEmployeeTransfer: (trn: Omit<EmployeeTransferItem, 'id'>) => void;
  employeePromotions: EmployeePromotionItem[];
  addEmployeePromotion: (prm: Omit<EmployeePromotionItem, 'id'>) => void;
  employeeExits: EmployeeExitItem[];
  addEmployeeExit: (exit: Omit<EmployeeExitItem, 'id'>) => void;
  updateEmployeeExitClearance: (id: string, clearanceType: 'dept' | 'asset' | 'hr' | 'accounts', status: boolean) => void;
  fullAndFinalSettlements: FullAndFinalSettlementItem[];
  addFullAndFinalSettlement: (fnf: Omit<FullAndFinalSettlementItem, 'id'>) => void;
  updateFinalSettlementStatus: (id: string, status: FullAndFinalSettlementItem['paymentStatus'], voucherNo?: string) => void;
  shiftMasters: ShiftMaster[];
  addShiftMaster: (shift: Omit<ShiftMaster, 'id'>) => void;
  updateShiftMaster: (id: string, shift: Partial<ShiftMaster>) => void;
  shiftRosters: ShiftRosterItem[];
  addShiftRoster: (roster: Omit<ShiftRosterItem, 'id'>) => void;
  holidays: HolidayItem[];
  addHoliday: (holiday: Omit<HolidayItem, 'id'>) => void;
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
  updateWFHRequestStatus: (id: string, status: LeaveApprovalStatus) => void;
  missedPunchRequests: MissedPunchRequest[];
  addMissedPunchRequest: (req: Omit<MissedPunchRequest, 'id' | 'requestNumber' | 'status'>) => void;
  updateMissedPunchStatus: (id: string, status: LeaveApprovalStatus) => void;
  attendanceRegularizations: AttendanceRegularization[];
  addAttendanceRegularization: (reg: Omit<AttendanceRegularization, 'id' | 'regularizationNo' | 'status'>) => void;
  updateAttendanceRegularizationStatus: (id: string, status: LeaveApprovalStatus) => void;
  overtimeRecords: OvertimeRecord[];
  addOvertimeRecord: (ot: Omit<OvertimeRecord, 'id' | 'overtimeNo' | 'status'>) => void;
  updateOvertimeStatus: (id: string, status: OvertimeRecord['status']) => void;
  earlyCheckoutRequests: EarlyCheckoutRequest[];
  addEarlyCheckoutRequest: (req: Omit<EarlyCheckoutRequest, 'id' | 'requestNumber' | 'status'>) => void;
  updateEarlyCheckoutStatus: (id: string, status: LeaveApprovalStatus) => void;
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
  addEmployeeAppraisal: (app: Omit<EmployeeAppraisal, 'id' | 'appraisalNumber' | 'status'>) => void;
  updateAppraisalStatus: (id: string, status: EmployeeAppraisal['status']) => void;
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
  sendNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;

  // Module 11: Testing, Security & Production Deployment
  testCases: TestCaseItem[];
  updateTestCaseStatus: (id: string, status: TestCaseItem['status'], remarks?: string) => void;
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
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
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
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>(INITIAL_ENQUIRIES);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_OPPORTUNITIES);
  const [followUps, setFollowUps] = useState<FollowUp[]>(INITIAL_FOLLOWUPS);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>(INITIAL_VISITS);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>(INITIAL_EXHIBITIONS);
  const [quotations, setQuotations] = useState<Quotation[]>(INITIAL_QUOTATIONS);
  const [customerPOs, setCustomerPOs] = useState<CustomerPO[]>(INITIAL_CUSTOMER_POS);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(INITIAL_SALES_ORDERS);
  const [projectJobs, setProjectJobs] = useState<ProjectJobMaster[]>(INITIAL_PROJECT_JOBS);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>(MOCK_PROJECT_TASKS);
  const [projectPlanningStages, setProjectPlanningStages] = useState<ProjectPlanningStage[]>(MOCK_PLANNING_STAGES);
  const [departmentAssignments, setDepartmentAssignments] = useState<DepartmentAssignment[]>(MOCK_DEPARTMENT_ASSIGNMENTS);
  const [projectMilestones, setProjectMilestones] = useState<ProjectMilestone[]>(MOCK_MILESTONES);
  const [projectIssues, setProjectIssues] = useState<ProjectIssue[]>(MOCK_PROJECT_ISSUES);
  const [projectDelays, setProjectDelays] = useState<ProjectDelay[]>(MOCK_PROJECT_DELAYS);
  const [changeRequests, setChangeRequests] = useState<CustomerChangeRequest[]>(MOCK_CHANGE_REQUESTS);
  const [projectDocuments, setProjectDocuments] = useState<ProjectDocument[]>(MOCK_PROJECT_DOCUMENTS);
  const [projectCosts, setProjectCosts] = useState<ProjectCostItem[]>(MOCK_PROJECT_COSTS);
  const [projectComments, setProjectComments] = useState<ProjectComment[]>(MOCK_PROJECT_COMMENTS);
  const [projectApprovals, setProjectApprovals] = useState<ProjectApproval[]>(MOCK_PROJECT_APPROVALS);
  const [projectActivities, setProjectActivities] = useState<ProjectActivityLog[]>(MOCK_PROJECT_ACTIVITIES);

  // Module 3: Designer & Engineering Management States
  const [designJobs, setDesignJobs] = useState<DesignJob[]>(INITIAL_DESIGN_JOBS);
  const [customerRequirements, setCustomerRequirements] = useState<CustomerRequirement[]>(MOCK_CUSTOMER_REQUIREMENTS);
  const [designTasks, setDesignTasks] = useState<DesignTask[]>(MOCK_DESIGN_TASKS);
  const [drawings2D, setDrawings2D] = useState<Drawing2D[]>(MOCK_2D_DRAWINGS);
  const [designs3D, setDesigns3D] = useState<Design3DModel[]>(MOCK_3D_MODELS);
  const [assemblyDrawings, setAssemblyDrawings] = useState<AssemblyDrawing[]>(MOCK_ASSEMBLY_DRAWINGS);
  const [partDrawings, setPartDrawings] = useState<PartDrawing[]>(MOCK_PART_DRAWINGS);
  const [boms, setBoms] = useState<BOMHeader[]>(MOCK_BOM_HEADERS);
  const [bomRevisions, setBomRevisions] = useState<BOMRevision[]>(MOCK_BOM_REVISIONS);
  const [designRevisions, setDesignRevisions] = useState<DesignRevisionLog[]>(MOCK_DESIGN_REVISIONS);
  const [designReviews, setDesignReviews] = useState<DesignReviewChecklist[]>(MOCK_DESIGN_REVIEWS);
  const [technicalDocuments, setTechnicalDocuments] = useState<TechnicalDocumentItem[]>(MOCK_TECHNICAL_DOCUMENTS);

  // Module 4: Purchase Management States
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [supplierContacts, setSupplierContacts] = useState<SupplierContact[]>(MOCK_SUPPLIER_CONTACTS);
  const [materialRequirements, setMaterialRequirements] = useState<MaterialRequirement[]>(MOCK_MATERIAL_REQUIREMENTS);
  const [purchaseRequisitions, setPurchaseRequisitions] = useState<PurchaseRequisition[]>(MOCK_PURCHASE_REQUISITIONS);
  const [rfqs, setRfqs] = useState<RequestForQuotation[]>(MOCK_RFQS);
  const [supplierQuotations, setSupplierQuotations] = useState<SupplierQuotation[]>(MOCK_SUPPLIER_QUOTATIONS);
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
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceiptNote[]>(INITIAL_GOODS_RECEIPTS);
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
  const [manufacturingJobs, setManufacturingJobs] = useState<ManufacturingJob[]>(INITIAL_MANUFACTURING_JOBS);
  const [productionPlans, setProductionPlans] = useState<ProductionPlan[]>(INITIAL_PRODUCTION_PLANS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(INITIAL_PRODUCTION_ORDERS);
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
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(INITIAL_BANK_TRANSACTIONS);
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
        ['financialYears', setFinancialYears],
        ['chartOfAccounts', setChartOfAccounts],
        ['salesInvoices', setSalesInvoices],
        ['purchaseInvoices', setPurchaseInvoices],
        ['customerReceipts', setCustomerReceipts],
        ['supplierPayments', setSupplierPayments],
      ];

      let hasCached = false;
      for (const [key, setter] of cacheEntries) {
        const item = localStorage.getItem('UMA_ERP_' + key);
        if (item) {
          try {
            const data = JSON.parse(item);
            if (Array.isArray(data) && data.length > 0) {
              setter(data);
              hasCached = true;
            }
          } catch (_) {}
        }
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
          api.hr.designations(),
          api.hr.shifts(),
          api.hr.attendance(),
          api.hr.leaves.list(),
          api.hr.payroll.list(),
          api.accounting.financialYears(),
          api.accounting.chartOfAccounts(),
          api.accounting.salesInvoices.list(),
          api.accounting.purchaseInvoices.list(),
          api.accounting.receipts(),
          api.accounting.payments(),
          api.integration.approvals.list(),
          api.integration.alerts.list(),
          api.auth.me(),
        ]);

        if (!isMounted) return;

        function val<T>(res: PromiseSettledResult<any>): T | null {
          return res.status === 'fulfilled' && res.value !== undefined ? (res.value as T) : null;
        }

        function applyLive<T>(res: T[] | null, setter: React.Dispatch<React.SetStateAction<T[]>>, cacheKey?: string) {
          if (res && Array.isArray(res) && res.length > 0) {
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
        applyLive<Quotation>(val(results[5]), setQuotations, 'quotations');
        applyLive<CustomerPO>(val(results[6]), setCustomerPOs, 'customerPOs');
        applyLive<SalesOrder>(val(results[7]), setSalesOrders, 'salesOrders');
        applyLive<Employee>(val(results[8]), setEmployees, 'employees');
        applyLive<Department>(val(results[9]), setDepartments, 'departments');
        applyLive<Role>(val(results[10]), setRoles, 'roles');
        applyLive<ProjectJobMaster>(val(results[11]), setProjectJobs, 'projectJobs');
        applyLive<ProjectTask>(val(results[12]), setProjectTasks, 'projectTasks');
        applyLive<ProjectMilestone>(val(results[13]), setProjectMilestones, 'projectMilestones');
        applyLive<ProjectPlanningStage>(val(results[14]), setProjectPlanningStages, 'projectPlanningStages');
        applyLive<DesignJob>(val(results[15]), setDesignJobs, 'designJobs');
        applyLive<Drawing2D>(val(results[16]), setDrawings2D, 'drawings2D');
        applyLive<Design3DModel>(val(results[17]), setDesigns3D, 'designs3D');
        applyLive<BOMHeader>(val(results[18]), setBoms, 'boms');
        applyLive<Supplier>(val(results[19]), setSuppliers, 'suppliers');
        applyLive<PurchaseRequisition>(val(results[20]), setPurchaseRequisitions, 'purchaseRequisitions');
        applyLive<PurchaseOrder>(val(results[21]), setPurchaseOrders, 'purchaseOrders');
        applyLive<ItemMaster>(val(results[22]), setItemMasters, 'itemMasters');
        applyLive<ItemCategory>(val(results[23]), setItemCategories, 'itemCategories');
        applyLive<UOMMaster>(val(results[24]), setUoms, 'uoms');
        applyLive<Warehouse>(val(results[25]), setWarehouses, 'warehouses');
        applyLive<GoodsReceiptNote>(val(results[26]), setGoodsReceipts, 'goodsReceipts');
        applyLive<StockBalance>(val(results[27]), setStockBalances, 'stockBalances');
        applyLive<MaterialIssue>(val(results[28]), setMaterialIssues, 'materialIssues');
        applyLive<MaterialReturn>(val(results[29]), setMaterialReturns, 'materialReturns');
        applyLive<ManufacturingJob>(val(results[30]), setManufacturingJobs, 'manufacturingJobs');
        applyLive<WorkCenter>(val(results[31]), setWorkCenters, 'workCenters');

        const woRes = val<WorkOrder[]>(results[32]);
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

        applyLive<FinishedGoodsItem>(val(results[33]), setFinishedGoods, 'finishedGoods');
        applyLive<InternalAsset>(val(results[34]), setInternalAssets, 'internalAssets');
        applyLive<CustomerMachine>(val(results[35]), setCustomerMachines, 'customerMachines');
        applyLive<ServiceRequest>(val(results[36]), setServiceRequests, 'serviceRequests');
        applyLive<BreakdownRecord>(val(results[37]), setBreakdowns, 'breakdowns');
        applyLive<ServiceVisit>(val(results[38]), setServiceVisits, 'serviceVisits');
        applyLive<Designation>(val(results[39]), setDesignations, 'designations');
        applyLive<ShiftMaster>(val(results[40]), setShiftMasters, 'shifts');
        applyLive<AttendanceRecord>(val(results[41]), setAttendanceRecords, 'attendance');
        applyLive<LeaveRequest>(val(results[42]), setLeaveRequests, 'leaves');
        applyLive<PayrollRecord>(val(results[43]), setPayrollRecords, 'payroll');
        applyLive<FinancialYear>(val(results[44]), setFinancialYears, 'financialYears');
        applyLive<ChartOfAccount>(val(results[45]), setChartOfAccounts, 'chartOfAccounts');
        const siRes = val<any[]>(results[46]);
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

        const piRes = val<any[]>(results[47]);
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
        applyLive<CustomerReceipt>(val(results[48]), setCustomerReceipts, 'customerReceipts');
        applyLive<SupplierPayment>(val(results[49]), setSupplierPayments, 'supplierPayments');
        applyLive<ApprovalItem>(val(results[50]), setCentralApprovals, 'approvals');
        applyLive<ERPAlertItem>(val(results[51]), setCentralAlerts, 'alerts');

        const meRes = val<any>(results[52]);
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

      // 2. SYNC WITH CUSTOMER REQUIREMENTS SHEET
      setCustomerRequirements((prev) => {
        const existing = prev.find(
          (r) => r.projectId === prj.id || r.jobNumber === prj.jobNumber
        );
        if (!existing) {
          const reqNo = `REQ-2026-${String(prev.length + 1).padStart(3, '0')}`;
          const newReq: CustomerRequirement = {
            id: reqNo,
            designJobId: currentDesignJobId || `DES-2026-000${prev.length + 1}`,
            projectId: prj.id,
            jobNumber: prj.jobNumber,
            customerName: prj.customerName,
            contactPerson: prj.customerName,
            contactMobile: '+91 98250 00000',
            machineName: prj.productName,
            machineType: 'Custom MTO Equipment',
            model: `MOD-${prj.jobNumber.slice(-4)}`,
            quantity: prj.quantity,
            capacity: prj.specification || 'As per Customer PO',
            application: 'Industrial Manufacturing',
            productionRequirement: 'Standard Operating Capacity',
            dimensions: 'As per GA Drawing',
            material: 'SS 316L / SS 304',
            powerRequirement: '15 HP / 3-Phase 415V',
            speed: 'As per gear ratio',
            output: 'Continuous batch',
            automationLevel: 'Semi-Automatic PLC',
            controlSystem: 'Flameproof Control Panel',
            safetyRequirements: 'Emergency stop, PRV, rupture disc',
            specialRequirements: 'Hydro-tested at 8 bar',
            status: 'approved',
          };
          return [newReq, ...prev];
        }
        return prev;
      });

      // 3. SYNC WITH PRODUCTION MODULE (manufacturingJobs)
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

      // 4. SYNC WITH DESIGN PLANNING TASKS (designTasks)
      if (designStage?.assignedEmployees && designStage.assignedEmployees.length > 0) {
        setDesignTasks((prev) => {
          const hasTasks = prev.some((t) => t.projectId === prj.id || t.jobNumber === prj.jobNumber);
          if (hasTasks) return prev;

          const newTasks: DesignTask[] = (designStage.assignedEmployees || []).map((emp, idx) => {
            const taskTitles = [
              '3D Mechanical Modeling & CAD Layout',
              '2D GA (General Arrangement) Drawings',
              'Engineering BOM & Technical Specs',
              'Fabrication & Nozzle Detail Drawings',
            ];
            const taskTitle = taskTitles[idx % taskTitles.length];
            return {
              id: `DSK-${prj.jobNumber.slice(-4)}-${idx + 1}`,
              designJobId: currentDesignJobId || `DES-${prj.jobNumber.slice(-4)}`,
              projectId: prj.id,
              jobNumber: prj.jobNumber,
              taskName: `${taskTitle} - ${prj.productName}`,
              customerName: prj.customerName,
              machineName: prj.productName,
              designer: emp.name,
              startDate: designStage.plannedStart || prj.startDate,
              targetDate: designStage.plannedEnd || prj.deliveryDate,
              dueDate: designStage.plannedEnd || prj.deliveryDate,
              priority: (prj.priority as any) || 'high',
              estimatedHours: 24,
              actualHours: 0,
              progressPercent: designStage.status === 'completed' ? 100 : designStage.status === 'in_progress' ? 40 : 0,
              status: designStage.status === 'completed' ? 'completed' : designStage.status === 'in_progress' ? 'in_progress' : 'pending',
              remarks: `Assigned in Project Planning for ${prj.projectNumber}`,
            };
          });
          return [...newTasks, ...prev];
        });
      }

      // 5. SYNC WITH PRODUCTION WORK ORDERS (workOrders)
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
    if (!numConfig) {
      return `${docType?.toUpperCase()}-${Date.now().toString().slice(-4)}`;
    }
    const nextNum = numConfig.currentNumber + 1;
    setNumbering((prev) =>
      prev.map((n) => (n.docType === docType ? { ...n, currentNumber: nextNum } : n))
    );
    const padded = String(nextNum).padStart(numConfig.digitCount, '0');
    return `${numConfig.prefix}${padded}${numConfig.suffix || ''}`;
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
    setNotifications((prev) => [newNotif, ...prev]);
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
    setCompany((prev) => ({ ...prev, ...data }));
    logAction('UPDATE', 'Company Settings', 'Company Profile', 'COMP-01', 'Updated company profile information');
    api.company.update(data).catch((err) => console.warn('Failed to update company:', err));
  };

  const updateNumbering = (id: string, data: Partial<NumberingSetting>) => {
    setNumbering((prev) => prev.map((n) => (n.id === id ? { ...n, ...data } : n)));
    logAction('UPDATE', 'Settings', 'Numbering Series', id, 'Updated numbering series pattern');
    api.patch(`/numbering/${id}/`, data).catch((err) => console.warn('Failed to update numbering:', err));
  };

  // Department CRUD
  const addDepartment = (dept: Omit<Department, 'id' | 'employeeCount'>) => {
    const newDept: Department = {
      ...dept,
      id: `dept-${dept.code?.toLowerCase()}`,
      employeeCount: 0,
    };
    setDepartments((prev) => [...prev, newDept]);
    logAction('CREATE', 'Department Management', 'Add Department', newDept.id, `Created department ${newDept.name}`);
    api.departments.create(newDept).catch((err) => console.warn('Failed to add department:', err));
  };

  const updateDepartment = (id: string, dept: Partial<Department>) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...dept } : d)));
    logAction('UPDATE', 'Department Management', 'Edit Department', id, `Updated department info`);
    api.departments.update(id, dept).catch((err) => console.warn('Failed to update department:', err));
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

  // Employee CRUD
  const addEmployee = (emp: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...emp,
      id: `EMP-${String(employees.length + 1).padStart(3, '0')}`,
    };
    setEmployees((prev) => [...prev, newEmp]);
    logAction('CREATE', 'User Management', 'Add Employee', newEmp.id, `Created employee ${newEmp.firstName} ${newEmp.lastName}`);
    api.employees.create(newEmp).catch((err) => console.warn('Failed to add employee:', err));
  };

  const updateEmployee = (id: string, emp: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...emp } : e)));
    logAction('UPDATE', 'User Management', 'Edit Employee', id, `Updated employee ${id}`);
    api.employees.update(id, emp).catch((err) => console.warn('Failed to update employee:', err));
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
    setLeads((prev) => [newLead, ...prev]);
    logAction('CREATE', 'CRM', 'Leads', leadNo, `New Lead for ${newLead.companyName} (${newLead.productName})`);
    sendNotification({
      title: 'New Lead Registered',
      message: `${newLead.leadNo}: ${newLead.companyName} requires ${newLead.productName}.`,
      type: 'info',
      department: 'crm',
      linkUrl: `/crm/leads/${newLead.id}`,
      priority: newLead.priority === 'urgent' ? 'high' : 'normal',
    });
    // Sync to PythonAnywhere Backend
    api.crm.leads.create(newLead).then((res) => {
      if (res && res.id) {
        setLeads((prev) => prev.map((l) => (l.id === leadNo ? { ...l, ...res } : l)));
      }
    }).catch((err) => console.warn('Failed to sync lead to backend:', err));
    return newLead;
  };

  const updateLead = (id: string, leadData: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...leadData } : l)));
    logAction('UPDATE', 'CRM', 'Leads', id, `Updated lead ${id}`);
    api.crm.leads.update(id, leadData).catch((err) => console.warn('Failed to update lead on backend:', err));
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
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
    setFollowUps((prev) => [newFlw, ...prev]);
    logAction('CREATE', 'CRM', 'Follow-ups', flwNo, `Scheduled follow-up for ${newFlw.leadOrCustomerName}`);
    api.post('/followups/', newFlw).then((res) => { if (res && res.id) setFollowUps((prev) => prev.map((f) => f.id === flwNo ? { ...f, ...res } : f)); }).catch((err) => console.warn('Failed to sync follow-up:', err));
    return newFlw;
  };

  const completeFollowUp = (id: string, notes: string, nextDate?: string) => {
    setFollowUps((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: 'completed', completedNotes: notes, nextFollowUpDate: nextDate } : f
      )
    );
    logAction('UPDATE', 'CRM', 'Follow-ups', id, `Completed follow-up: ${notes}`);
    api.post(`/followups/${id}/complete/`, { notes, nextDate }).catch((err) => console.warn('Failed to complete follow-up:', err));
  };

  const addSiteVisit = (visitData: Omit<SiteVisit, 'id' | 'visitNo'>): SiteVisit => {
    const visitNo = getNextDocNumber('visit');
    const newVisit: SiteVisit = {
      ...visitData,
      id: visitNo,
      visitNo,
    };
    setSiteVisits((prev) => [newVisit, ...prev]);
    logAction('CREATE', 'CRM', 'Visits', visitNo, `Logged site visit to ${newVisit.customerName}`);
    api.post('/visits/', newVisit).then((res) => { if (res && res.id) setSiteVisits((prev) => prev.map((v) => v.id === visitNo ? { ...v, ...res } : v)); }).catch((err) => console.warn('Failed to sync visit:', err));
    return newVisit;
  };

  const addExhibition = (expoData: Omit<Exhibition, 'id'>): Exhibition => {
    const newExpo: Exhibition = {
      ...expoData,
      id: `EXPO-2026-${String(exhibitions.length + 1).padStart(2, '0')}`,
    };
    setExhibitions((prev) => [...prev, newExpo]);
    logAction('CREATE', 'CRM', 'Exhibitions', newExpo.id, `Created exhibition entry ${newExpo.expoName}`);
    api.post('/exhibitions/', newExpo).catch((err) => console.warn('Failed to sync exhibition:', err));
    return newExpo;
  };

  // Quotations & Multi-Revision Engine
  const addQuotation = (quoData: Omit<Quotation, 'id' | 'quotationNumber'>): Quotation => {
    const quoNo = getNextDocNumber('quotation');
    const newQuo: Quotation = {
      ...quoData,
      id: quoNo,
      quotationNumber: quoNo,
    };
    setQuotations((prev) => [newQuo, ...prev]);
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
      if (res && res.id) {
        setQuotations((prev) => prev.map((q) => (q.id === quoNo ? { ...q, ...res } : q)));
      }
    }).catch((err) => console.warn('Failed to sync quotation to backend:', err));
    return newQuo;
  };

  const addQuotationRevision = (quotationId: string, revision: QuotationRevision) => {
    setQuotations((prev) =>
      prev.map((q) => {
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
      })
    );
    logAction('UPDATE', 'CRM', 'Quotation Revision', quotationId, `Created revision ${revision.revisionNumber}`);
    api.crm.quotations.addRevision(quotationId, revision).catch((err) => console.warn('Failed to sync quotation revision:', err));
  };

  const updateQuotationStatus = (quotationId: string, revisionNumber: string, status: QuotationRevision['status']) => {
    setQuotations((prev) =>
      prev.map((q) => {
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
      })
    );
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
    setCustomerPOs((prev) => [newPO, ...prev]);
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
        setCustomerPOs((prev) => prev.map((p) => (p.id === poId ? { ...p, ...res } : p)));
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

    setSalesOrders((prev) => [newSO, ...prev]);
    setCustomerPOs((prev) => prev.map((p) => (p.id === poId ? { ...p, status: 'sales_order_created', salesOrderId: soNo } : p)));
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
        setSalesOrders((prev) => prev.map((s) => (s.id === soNo ? { ...s, ...res } : s)));
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
    setSalesOrders((prev) => [newSO, ...prev]);
    logAction('CREATE', 'CRM', 'Sales Orders', soNo, `Created Sales Order ${soNo}`);
    const soPayload = {
      ...newSO,
      targetDeliveryDate: newSO.deliveryDate || '2026-12-31',
      grandTotal: Number(newSO.orderValue || 0),
      totalAmount: Number(newSO.orderValue || 0),
    };
    api.crm.salesOrders.create(soPayload).then((res) => {
      if (res && res.id) {
        setSalesOrders((prev) => prev.map((s) => (s.id === soNo ? { ...s, ...res } : s)));
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
    setProjectJobs((prev) => [newProject, ...prev]);

    // Update Sales Order with Project Link
    setSalesOrders((prev) =>
      prev.map((s) => (s.id === salesOrderId ? { ...s, status: 'project_created', projectId: prjNo, jobNumber: jobNo } : s))
    );

    const prjPayload = {
      ...newProject,
      targetDeliveryDate: newProject.deliveryDate || '2026-12-31',
      projectManagerName: newProject.projectManager || 'Bhavin Shah',
      currentStatus: newProject.status || 'planning',
    };
    api.projects.create(prjPayload).then((res) => {
      if (res && res.id) {
        setProjectJobs((prev) => prev.map((p) => (p.id === prjNo ? { ...p, ...res } : p)));
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
    setProjectJobs((prev) => prev.map((p) => (p.id === id ? { ...p, ...prj } : p)));
    logAction('UPDATE', 'Project Management', 'Projects', id, `Updated project details for ${id}`);
  };

  const logProjectActivity = (projectId: string, jobNumber: string, action: string, details: string) => {
    const now = new Date();
    const newAct: ProjectActivityLog = {
      id: `ACT-${Date.now()}`,
      projectId,
      jobNumber,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      userRole: currentUser.roleName,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].slice(0, 5),
      action,
      details,
    };
    setProjectActivities((prev) => [newAct, ...prev]);
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
      return updated;
    });
  };

  const addPlanningStage = (stageData: Omit<ProjectPlanningStage, 'id'>): ProjectPlanningStage => {
    const newStage: ProjectPlanningStage = {
      ...stageData,
      id: `STG-${stageData.projectId}-${Date.now().toString().slice(-4)}`,
    };
    setProjectPlanningStages((prev) => [...prev, newStage]);
    logProjectActivity(stageData.projectId, stageData.jobNumber, 'Stage Added', `Added planning stage: ${stageData.stageName}`);
    api.post('/planning-stages/', {
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
        setProjectPlanningStages((prev) => prev.map((s) => (s.id === newStage.id ? { ...s, id: res.id } : s)));
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
      return updated;
    });
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
      return [...otherStages, ...renumbered];
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
    setProjectPlanningStages((prev) => [
      ...prev.filter((s) => s.projectId !== projectId && s.jobNumber !== prj.jobNumber),
      ...newStages,
    ]);

    const avgProgress = Math.round(
      newStages.reduce((sum, s) => sum + (s.progressPercent || 0), 0) / newStages.length
    );
    setProjectJobs((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, progressPercent: avgProgress } : p))
    );

    logProjectActivity(prj.id, prj.jobNumber, 'Planning Matrix Generated', 'Generated full 16-stage MTO execution plan');
    return newStages;
  };

  const assignDepartment = (data: Omit<DepartmentAssignment, 'id'>): DepartmentAssignment => {
    const newDA: DepartmentAssignment = {
      ...data,
      id: `DA-${Date.now()}`,
    };
    setDepartmentAssignments((prev) => [newDA, ...prev]);
    logProjectActivity(data.projectId, data.jobNumber, 'Department Assigned', `Assigned ${data.department} dept (Manager: ${data.manager})`);
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
    setProjectIssues((prev) => [newIssue, ...prev]);
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
    setProjectIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, resolution, status: 'resolved' } : i))
    );
  };

  const addProjectDelay = (data: Omit<ProjectDelay, 'id' | 'delayNo'>): ProjectDelay => {
    const delNo = `DEL-2026-${String(projectDelays.length + 1).padStart(3, '0')}`;
    const newDelay: ProjectDelay = {
      ...data,
      id: delNo,
      delayNo: delNo,
    };
    setProjectDelays((prev) => [newDelay, ...prev]);

    // Also update project expected delivery date
    setProjectJobs((prev) =>
      prev.map((p) => (p.id === data.projectId ? { ...p, expectedDeliveryDate: data.expectedDeliveryDate } : p))
    );

    logProjectActivity(data.projectId, data.jobNumber, 'Project Delay Logged', `${data.delayReason} (+${data.delayDays} days delay)`);
    api.post('/project-delays/', newDelay).catch((err) => console.warn('Failed to add project delay:', err));
    return newDelay;
  };

  const addCustomerChangeRequest = (data: Omit<CustomerChangeRequest, 'id' | 'changeRequestNo' | 'requestDate' | 'approvalStatus'>): CustomerChangeRequest => {
    const crNo = `CR-2026-${String(changeRequests.length + 1).padStart(3, '0')}`;
    const newCR: CustomerChangeRequest = {
      ...data,
      id: crNo,
      changeRequestNo: crNo,
      requestDate: new Date().toISOString().split('T')[0],
      approvalStatus: 'requested',
    };
    setChangeRequests((prev) => [newCR, ...prev]);
    logProjectActivity(data.projectId, data.jobNumber, 'Customer Change Requested', `CR ${crNo} submitted by ${data.requestedBy}`);
    sendNotification({
      title: 'Customer Change Request Received',
      message: `${crNo} submitted for ${data.jobNumber} (Cost Impact: ₹${data.costImpact})`,
      type: 'approval_request',
      department: 'project',
      linkUrl: '/projects/change-requests',
      priority: 'high',
    });
    return newCR;
  };

  const approveChangeRequest = (id: string, status: 'approved' | 'rejected') => {
    setChangeRequests((prev) =>
      prev.map((cr) =>
        cr.id === id
          ? {
              ...cr,
              approvalStatus: status === 'approved' ? 'approved' : 'rejected',
              approvedBy: `${currentUser.firstName} ${currentUser.lastName}`,
              approvedDate: new Date().toISOString().split('T')[0],
            }
          : cr
      )
    );
  };

  const addProjectDocument = (data: Omit<ProjectDocument, 'id' | 'uploadDate'>): ProjectDocument => {
    const newDoc: ProjectDocument = {
      ...data,
      id: `DOC-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
    };
    setProjectDocuments((prev) => [newDoc, ...prev]);
    logProjectActivity(data.projectId, data.jobNumber, 'Document Uploaded', `${data.documentName} (${data.version})`);
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
    const id = `DES-${new Date().getFullYear()}-${String(designJobs.length + 1).padStart(4, '0')}`;
    const newJob: DesignJob = {
      ...data,
      id,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setDesignJobs((prev) => [newJob, ...prev]);
    logAction('CREATE', 'Designer', 'Design Jobs', id, `Created design job ${newJob.designJobNumber} for project ${data.projectId}`);
    const jobPayload = {
      ...newJob,
      designJobNumber: newJob.designJobNumber || id,
      targetCompletionDate: (newJob as any).targetCompletionDate || (newJob as any).deliveryDate || '2026-12-31',
    };
    api.designer.jobs.create(jobPayload).then((res) => {
      if (res && res.id) {
        setDesignJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...res } : j)));
      }
    }).catch((err) => console.warn('Failed to sync design job to backend:', err));
  };

  const updateDesignJob = (id: string, updates: Partial<DesignJob>) => {
    setDesignJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
    logAction('UPDATE', 'Designer', 'Design Jobs', id, `Updated design job ${id}`);
    api.designer.jobs.update(id, updates).catch((err) => console.warn('Failed to update design job on backend:', err));
  };

  const addCustomerRequirement = (data: Omit<CustomerRequirement, 'id'>) => {
    const id = `REQ-${new Date().getFullYear()}-${String(customerRequirements.length + 1).padStart(3, '0')}`;
    const newReq: CustomerRequirement = { ...data, id };
    setCustomerRequirements((prev) => [newReq, ...prev]);
    logAction('CREATE', 'Designer', 'Customer Requirements', id, `Added technical requirement sheet for ${data.jobNumber}`);
    api.post('/customer-requirements/', newReq).catch((err) => console.warn('Failed to add customer requirement:', err));
  };

  const approveCustomerRequirement = (id: string, approvedBy: string) => {
    setCustomerRequirements((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'approved',
              approvedBy,
              approvalDate: new Date().toISOString().split('T')[0],
            }
          : r
      )
    );
    logAction('APPROVE', 'Designer', 'Customer Requirements', id, `Approved technical requirement sheet by ${approvedBy}`);
    api.patch(`/customer-requirements/${id}/`, { status: 'approved', approvedBy }).catch((err) => console.warn('Failed to approve requirement:', err));
  };

  const addDesignTask = (data: Omit<DesignTask, 'id'>) => {
    const id = `DTASK-${Date.now().toString().slice(-5)}`;
    const newTask: DesignTask = { ...data, id };
    setDesignTasks((prev) => [newTask, ...prev]);
    logAction('CREATE', 'Designer', 'Design Tasks', id, `Created design task ${data.taskName}`);
  };

  const updateDesignTask = (id: string, updates: Partial<DesignTask>) => {
    setDesignTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const addDrawing2D = (data: Omit<Drawing2D, 'id' | 'createdDate'>) => {
    const id = `DRW2D-${Date.now().toString().slice(-5)}`;
    const newDrw: Drawing2D = { ...data, id, createdDate: new Date().toISOString().split('T')[0] };
    setDrawings2D((prev) => [newDrw, ...prev]);
    logAction('CREATE', 'Designer', '2D Drawings', id, `Uploaded 2D Drawing ${data.drawingNumber}`);
    api.post('/drawings-2d/', newDrw).catch((err) => console.warn('Failed to add 2D drawing:', err));
  };

  const addDesign3D = (data: Omit<Design3DModel, 'id' | 'uploadedDate'>) => {
    const id = `MOD3D-${Date.now().toString().slice(-5)}`;
    const newMod: Design3DModel = { ...data, id, uploadedDate: new Date().toISOString().split('T')[0] };
    setDesigns3D((prev) => [newMod, ...prev]);
    logAction('CREATE', 'Designer', '3D Models', id, `Uploaded 3D Model ${data.modelName}`);
    api.post('/models-3d/', newMod).catch((err) => console.warn('Failed to add 3D model:', err));
  };

  const addAssemblyDrawing = (data: Omit<AssemblyDrawing, 'id'>) => {
    const id = `ASM-${Date.now().toString().slice(-5)}`;
    const newAsm: AssemblyDrawing = { ...data, id };
    setAssemblyDrawings((prev) => [newAsm, ...prev]);
    logAction('CREATE', 'Designer', 'Assembly Drawings', id, `Uploaded Assembly Drawing ${data.assemblyNumber}`);
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
    setTechnicalDocuments((prev) => [newDoc, ...prev]);
    logAction('CREATE', 'Designer', 'Technical Documents', id, `Uploaded Technical Document ${data.documentName}`);
    api.post('/technical-documents/', newDoc).catch((err) => console.warn('Failed to add tech doc:', err));
  };

  const releaseDesignToManufacturing = (designJobId: string, releasedBy: string) => {
    const desJob = designJobs.find((j) => j.id === designJobId);
    if (!desJob) return;

    setDesignJobs((prev) =>
      prev.map((j) =>
        j.id === designJobId
          ? { ...j, status: 'released_to_production', remarks: `Released to shop floor by ${releasedBy}` }
          : j
      )
    );

    setBoms((prev) =>
      prev.map((b) => (b.projectId === desJob.projectId || b.jobNumber === desJob.jobNumber ? { ...b, status: 'released_to_production' } : b))
    );

    updateJobStatus(desJob.jobNumber, 'step-3', 'completed');
    updateJobStatus(desJob.jobNumber, 'step-4', 'in_progress');

    logAction('APPROVE', 'Designer', 'Design Release', designJobId, `Design Job ${desJob.designJobNumber} (${desJob.jobNumber}) released to Purchase, Store & Production departments by ${releasedBy}`);

    sendNotification({
      title: `🚀 Design Released for Manufacturing: ${desJob.jobNumber}`,
      message: `Design Job ${desJob.designJobNumber} (${desJob.productName}) approved and released to production by ${releasedBy}. Material planning can now begin.`,
      type: 'success',
      department: 'project',
      priority: 'high',
      linkUrl: `/designer/jobs`,
    });
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

  const addSupplierContact = (data: Omit<SupplierContact, 'id'>) => {
    const id = `SCON-${Date.now().toString().slice(-5)}`;
    const newCon: SupplierContact = { ...data, id };
    setSupplierContacts((prev) => [newCon, ...prev]);
    api.post('/supplier-contacts/', newCon).catch((err) => console.warn('Failed to add supplier contact:', err));
  };

  const addMaterialRequirement = (data: Omit<MaterialRequirement, 'id'>) => {
    const id = `MRP-${Date.now().toString().slice(-5)}`;
    const newMrp: MaterialRequirement = { ...data, id };
    setMaterialRequirements((prev) => [newMrp, ...prev]);
  };

  const addPurchaseRequisition = (data: Omit<PurchaseRequisition, 'id' | 'prDate'>) => {
    const prNumber = `PR-${new Date().getFullYear()}-${String(purchaseRequisitions.length + 1).padStart(3, '0')}`;
    const newPr: PurchaseRequisition = {
      ...data,
      id: prNumber,
      prNumber,
      prDate: new Date().toISOString().split('T')[0],
    };
    setPurchaseRequisitions((prev) => [newPr, ...prev]);
    logAction('CREATE', 'Purchase', 'Purchase Requisition', newPr.id, `Created PR ${newPr.prNumber} for job ${data.jobNumber}`);
    const prPayload = {
      ...newPr,
      prNumber: newPr.prNumber || prNumber,
      requiredByDate: (newPr as any).requiredByDate || (newPr as any).requiredDate || '2026-12-31',
      items: newPr.items || [],
      status: newPr.status || 'pending_approval',
    };
    api.purchase.requisitions.create(prPayload).then((res) => {
      if (res && res.id) {
        setPurchaseRequisitions((prev) => prev.map((p) => (p.id === prNumber ? { ...p, ...res } : p)));
      }
    }).catch((err) => console.warn('Failed to sync PR to backend:', err));
  };

  const approvePurchaseRequisition = (id: string, approvedBy: string) => {
    setPurchaseRequisitions((prev) =>
      prev.map((pr) =>
        pr.id === id
          ? {
              ...pr,
              status: 'approved',
              approvedBy,
              approvedDate: new Date().toISOString().split('T')[0],
            }
          : pr
      )
    );
    logAction('APPROVE', 'Purchase', 'Purchase Requisition', id, `Approved PR by ${approvedBy}`);
  };

  const addRFQ = (data: Omit<RequestForQuotation, 'id' | 'rfqDate'>) => {
    const rfqNumber = `RFQ-${new Date().getFullYear()}-${String(rfqs.length + 1).padStart(3, '0')}`;
    const newRfq: RequestForQuotation = {
      ...data,
      id: rfqNumber,
      rfqNumber,
      rfqDate: new Date().toISOString().split('T')[0],
    };
    setRfqs((prev) => [newRfq, ...prev]);
    logAction('CREATE', 'Purchase', 'RFQ', newRfq.id, `Generated RFQ ${newRfq.rfqNumber} to suppliers`);
    api.post('/rfqs/', newRfq).catch((err) => console.warn('Failed to add RFQ:', err));
  };

  const addSupplierQuotation = (data: Omit<SupplierQuotation, 'id'>) => {
    const id = `SQ-${Date.now().toString().slice(-5)}`;
    const newSq: SupplierQuotation = { ...data, id };
    setSupplierQuotations((prev) => [newSq, ...prev]);
    logAction('CREATE', 'Purchase', 'Supplier Quotations', id, `Recorded Quotation ${data.supplierQuotationNumber} from ${data.supplierName}`);
    api.post('/supplier-quotations/', newSq).catch((err) => console.warn('Failed to add supplier quotation:', err));
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
    const id = `ITEM-${String(itemMasters.length + 1).padStart(3, '0')}`;
    const newItem: ItemMaster = { ...data, id, createdAt: new Date().toISOString().split('T')[0] };
    setItemMasters((prev) => [newItem, ...prev]);
    logAction('CREATE', 'Store', 'Item Master', id, `Added Item ${data.itemCode} - ${data.itemName}`);
    // Sync to PythonAnywhere backend
    api.store.items.create(newItem).then((res) => {
      if (res && res.id) {
        setItemMasters((prev) => prev.map((item) => (item.id === id ? { ...item, ...res } : item)));
      }
    }).catch((err) => console.warn('Failed to sync item to backend:', err));
  };

  const updateItemMaster = (id: string, updates: Partial<ItemMaster>) => {
    setItemMasters((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    logAction('UPDATE', 'Store', 'Item Master', id, `Updated item ${id}`);
    // Sync to PythonAnywhere backend
    api.store.items.update(id, updates).catch((err) => console.warn('Failed to update item on backend:', err));
  };

  const addItemCategory = (data: Omit<ItemCategory, 'id'>) => {
    const id = `CAT-${String(itemCategories.length + 1).padStart(3, '0')}`;
    const newCat: ItemCategory = { ...data, id };
    setItemCategories((prev) => [...prev, newCat]);
    logAction('CREATE', 'Store', 'Categories', id, `Added Category ${data.categoryName}`);
    api.post('/item-categories/', newCat).catch((err) => console.warn('Failed to add category:', err));
  };

  const addUOM = (data: Omit<UOMMaster, 'id'>) => {
    const id = `UOM-${String(uoms.length + 1).padStart(3, '0')}`;
    const newUom: UOMMaster = { ...data, id };
    setUoms((prev) => [...prev, newUom]);
    logAction('CREATE', 'Store', 'UOM Master', id, `Added UOM ${data.uomCode}`);
    api.post('/uoms/', newUom).catch((err) => console.warn('Failed to add UOM:', err));
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
    setGoodsReceipts((prev) => [newGrn, ...prev]);

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
      grnNumber: newGrn.grnNumber || grnNumber,
      receiptDate: (newGrn as any).receiptDate || newGrn.createdAt || new Date().toISOString().split('T')[0],
      items: newGrn.items || [],
      status: (newGrn as any).status || 'received',
    };
    api.store.grns.create(grnPayload).then((res) => {
      if (res && res.id) {
        setGoodsReceipts((prev) => prev.map((g) => (g.id === grnNumber ? { ...g, ...res } : g)));
      }
    }).catch((err) => console.warn('Failed to sync GRN to backend:', err));
  };

  const addQCInspection = (data: Omit<QCInspection, 'id' | 'inspectionNumber'>) => {
    const inspectionNumber = `QC-${new Date().getFullYear()}-${String(qcInspections.length + 1).padStart(4, '0')}`;
    const newQc: QCInspection = { ...data, id: inspectionNumber, inspectionNumber };
    setQcInspections((prev) => [newQc, ...prev]);
    api.post('/qc-inspections/', newQc).catch((err) => console.warn('Failed to add QC inspection:', err));
  };

  const approveQCInspection = (id: string, inspectorName: string, qcResult: 'Pass' | 'Fail' | 'Conditional Approval', acceptedQty: number, rejectedQty: number) => {
    const targetQc = qcInspections.find((q) => q.id === id);
    if (!targetQc) return;

    setQcInspections((prev) =>
      prev.map((q) => (q.id === id ? { ...q, qcResult, acceptedQuantity: acceptedQty, rejectedQuantity: rejectedQty, inspectorName } : q))
    );

    setGoodsReceipts((prev) =>
      prev.map((g) => (g.id === targetQc.grnId ? { ...g, status: qcResult === 'Pass' ? 'Accepted' : qcResult === 'Fail' ? 'Rejected' : 'Partially Accepted' } : g))
    );

    logAction('APPROVE', 'Store', 'QC Inspection', id, `QC Inspection ${targetQc.inspectionNumber} set to ${qcResult} by ${inspectorName}`);
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
    setStockTransfers((prev) => [newTrn, ...prev]);
    logAction('CREATE', 'Store', 'Stock Transfer', newTrn.id, `Transferred items from ${data.fromWarehouseName} to ${data.toWarehouseName}`);
  };

  const addStockAdjustment = (data: Omit<StockAdjustment, 'id' | 'adjustmentNumber' | 'createdAt'>) => {
    const adjustmentNumber = `ADJ-${new Date().getFullYear()}-${String(stockAdjustments.length + 1).padStart(4, '0')}`;
    const newAdj: StockAdjustment = {
      ...data,
      id: adjustmentNumber,
      adjustmentNumber,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setStockAdjustments((prev) => [newAdj, ...prev]);
    logAction('CREATE', 'Store', 'Stock Adjustment', newAdj.id, `Adjusted stock for ${data.itemName}: diff ${data.differenceQuantity}`);
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
    setManufacturingJobs((prev) => [newJob, ...prev]);
    logAction('CREATE', 'Production', 'Manufacturing Jobs', newJob.id, `Created manufacturing job ${newJob.jobNumber}`);
    api.post('/manufacturing-jobs/', newJob).catch((err) => console.warn('Failed to add mfg job:', err));
  };

  const updateManufacturingJob = (id: string, updates: Partial<ManufacturingJob>) => {
    setManufacturingJobs((prev) => prev.map((j) => (j.id === id || j.jobNumber === id ? { ...j, ...updates } : j)));
  };

  const addProductionPlan = (data: Omit<ProductionPlan, 'id' | 'createdAt'>) => {
    const planNumber = `PLAN-${new Date().getFullYear()}-${String(productionPlans.length + 1).padStart(3, '0')}`;
    const newPlan: ProductionPlan = {
      ...data,
      id: planNumber,
      planNumber,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProductionPlans((prev) => [newPlan, ...prev]);
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
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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
    setCreditNotes((prev) => [newCN, ...prev]);
    logAction('CREATE', 'Accounting', 'Credit Notes', newCN.id, `Issued Credit Note ${newCN.creditNoteNumber} for ₹${newCN.totalAmount?.toLocaleString()}`);
  };

  const addDebitNote = (dn: Omit<DebitNote, 'id' | 'debitNoteNumber'>) => {
    const debitNoteNumber = `DN-2026-${String(debitNotes.length + 1).padStart(3, '0')}`;
    const newDN: DebitNote = { ...dn, id: debitNoteNumber, debitNoteNumber };
    setDebitNotes((prev) => [newDN, ...prev]);
    logAction('CREATE', 'Accounting', 'Debit Notes', newDN.id, `Issued Debit Note ${newDN.debitNoteNumber} for ₹${newDN.totalAmount?.toLocaleString()}`);
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
    setJournalEntries((prev) => [newJV, ...prev]);
    logAction('CREATE', 'Accounting', 'Journal Entries', newJV.id, `Created JV ${newJV.journalNumber}: Debit ₹${newJV.totalDebit?.toLocaleString()} = Credit ₹${newJV.totalCredit?.toLocaleString()}`);
    api.post('/journal-entries/', newJV).catch((err) => console.warn('Failed to add journal entry:', err));
  };

  const addContraEntry = (contra: Omit<ContraEntry, 'id' | 'contraNumber'>) => {
    const contraNumber = `CNT-2026-${String(contraEntries.length + 1).padStart(3, '0')}`;
    const newContra: ContraEntry = { ...contra, id: contraNumber, contraNumber };
    setContraEntries((prev) => [newContra, ...prev]);
    logAction('CREATE', 'Accounting', 'Contra Entries', newContra.id, `Created Contra ${newContra.contraNumber} for ₹${newContra.amount?.toLocaleString()}`);
  };

  const addExpenseEntry = (exp: Omit<ExpenseEntry, 'id' | 'expenseNumber'>) => {
    const expenseNumber = `EXP-2026-${String(expenseEntries.length + 1).padStart(4, '0')}`;
    const newExp: ExpenseEntry = { ...exp, id: expenseNumber, expenseNumber };
    setExpenseEntries((prev) => [newExp, ...prev]);
    logAction('CREATE', 'Accounting', 'Expense Entries', newExp.id, `Logged Expense ${newExp.expenseNumber} for ₹${(newExp.grandTotal || newExp.totalAmount || newExp.amount || 0)?.toLocaleString()}`);
  };

  const approveExpenseEntry = (id: string, approvedBy: string) => {
    setExpenseEntries((prev) => prev.map((exp) => (exp.id === id || exp.expenseNumber === id ? { ...exp, status: 'Approved', approvedBy } : exp)));
    logAction('APPROVE', 'Accounting', 'Expense Entries', id, `Approved Expense Entry ${id} by ${approvedBy}`);
  };

  const addBankAccount = (bank: Omit<BankAccount, 'id' | 'currentBalance'>) => {
    const id = `BANK-${String(bankAccounts.length + 1).padStart(2, '0')}`;
    const newBank: BankAccount = { ...bank, id, currentBalance: bank.openingBalance };
    setBankAccounts((prev) => [...prev, newBank]);
    logAction('CREATE', 'Accounting', 'Cash & Bank', id, `Added Bank Account ${bank.bankName} - ${bank.accountNumber}`);
  };

  const reconcileBankTransaction = (transactionId: string, matchedErpDocNumber: string) => {
    setBankTransactions((prev) => prev.map((tx) => (tx.id === transactionId ? { ...tx, isReconciled: true, matchedErpDocNumber, reconciliationStatus: 'Reconciled' } : tx)));
    logAction('UPDATE', 'Accounting', 'Bank Reconciliation', transactionId, `Reconciled bank transaction ${transactionId} with ERP Doc ${matchedErpDocNumber}`);
  };

  const addFixedAsset = (asset: Omit<FixedAsset, 'id'>) => {
    const id = `AST-${String(fixedAssets.length + 1).padStart(3, '0')}`;
    const newAsset: FixedAsset = { ...asset, id };
    setFixedAssets((prev) => [...prev, newAsset]);
    logAction('CREATE', 'Accounting', 'Fixed Assets', id, `Registered Fixed Asset ${asset.assetCode} - ${asset.assetName}`);
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
  };

  const addServicePartReturn = (ret: Omit<ServicePartReturn, 'id' | 'returnNumber'>) => {
    const retNo = `SPR-2026-00${servicePartReturns.length + 1}`;
    const newRet: ServicePartReturn = { ...ret, id: retNo, returnNumber: retNo };
    setServicePartReturns((prev) => [newRet, ...prev]);
    logAction('CREATE', 'maintenance', 'parts-return', retNo, `Created service part return ${retNo}`);
  };

  const addServiceReport = (rep: Omit<ServiceReport, 'id' | 'reportNumber'>) => {
    const repNo = `SREP-2026-00${serviceReports.length + 1}`;
    const newRep: ServiceReport = { ...rep, id: repNo, reportNumber: repNo };
    setServiceReports((prev) => [newRep, ...prev]);
    logAction('CREATE', 'maintenance', 'service-reports', repNo, `Created service report ${repNo}`);
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
  const [designations, setDesignations] = useState<Designation[]>(mockDesignations);
  const [employeeDocuments, setEmployeeDocuments] = useState<EmployeeDocumentItem[]>(mockEmployeeDocuments);
  const [employeeOnboardings, setEmployeeOnboardings] = useState<EmployeeOnboardingItem[]>(mockEmployeeOnboardings);
  const [employeeTransfers, setEmployeeTransfers] = useState<EmployeeTransferItem[]>(mockEmployeeTransfers);
  const [employeePromotions, setEmployeePromotions] = useState<EmployeePromotionItem[]>(mockEmployeePromotions);
  const [employeeExits, setEmployeeExits] = useState<EmployeeExitItem[]>(mockEmployeeExits);
  const [fullAndFinalSettlements, setFullAndFinalSettlements] = useState<FullAndFinalSettlementItem[]>(mockFullAndFinalSettlements);
  const [shiftMasters, setShiftMasters] = useState<ShiftMaster[]>(mockShifts);
  const [shiftRosters, setShiftRosters] = useState<ShiftRosterItem[]>(mockShiftRosters);
  const [holidays, setHolidays] = useState<HolidayItem[]>(mockHolidays);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(mockLeaveTypes);
  const [leaveBalances] = useState<LeaveBalance[]>(mockLeaveBalances);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
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
    const newId = `DESG-0${designations.length + 1}`;
    const newDesg = { ...desg, id: newId };
    setDesignations((prev) => [...prev, newDesg]);
    logAction('CREATE', 'hr', 'designations', newId, `Created Designation ${desg.designationName}`);
    api.post('/designations/', newDesg).catch((err) => console.warn('Failed to add designation:', err));
  };
  const updateDesignation = (id: string, desg: Partial<Designation>) => {
    setDesignations((prev) => prev.map((d) => (d.id === id ? { ...d, ...desg } : d)));
    logAction('UPDATE', 'hr', 'designations', id, `Updated Designation`);
  };

  const addEmployeeDocument = (doc: Omit<EmployeeDocumentItem, 'id'>) => {
    const newId = `DOC-${100 + employeeDocuments.length + 1}`;
    const newDoc = { ...doc, id: newId };
    setEmployeeDocuments((prev) => [newDoc, ...prev]);
    logAction('CREATE', 'hr', 'employee-documents', newId, `Uploaded document for ${doc.employeeName}`);
    api.post('/employee-documents/', newDoc).catch((err) => console.warn('Failed to add document:', err));
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
    const newOnb = { ...onb, id: newId };
    setEmployeeOnboardings((prev) => [newOnb, ...prev]);
    logAction('CREATE', 'hr', 'employee-onboarding', newId, `Created onboarding for ${onb.candidateName}`);
  };
  const updateEmployeeOnboardingStatus = (id: string, status: EmployeeOnboardingItem['status']) => {
    setEmployeeOnboardings((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    logAction('UPDATE', 'hr', 'employee-onboarding', id, `Updated onboarding status to ${status}`);
  };

  const addEmployeeTransfer = (trn: Omit<EmployeeTransferItem, 'id'>) => {
    const newId = `TRN-2026-0${employeeTransfers.length + 1}`;
    const newTrn = { ...trn, id: newId };
    setEmployeeTransfers((prev) => [newTrn, ...prev]);
    logAction('CREATE', 'hr', 'employee-transfers', newId, `Transferred ${trn.employeeName} to ${trn.toDepartment}`);
  };

  const addEmployeePromotion = (prm: Omit<EmployeePromotionItem, 'id'>) => {
    const newId = `PRM-2026-0${employeePromotions.length + 1}`;
    const newPrm = { ...prm, id: newId };
    setEmployeePromotions((prev) => [newPrm, ...prev]);
    logAction('CREATE', 'hr', 'employee-promotions', newId, `Promoted ${prm.employeeName} to ${prm.newDesignation}`);
  };

  const addEmployeeExit = (exit: Omit<EmployeeExitItem, 'id'>) => {
    const newId = `EXIT-2026-0${employeeExits.length + 1}`;
    const newExit = { ...exit, id: newId };
    setEmployeeExits((prev) => [newExit, ...prev]);
    logAction('CREATE', 'hr', 'resignation-exit', newId, `Logged exit for ${exit.employeeName}`);
  };
  const updateEmployeeExitClearance = (id: string, clearanceType: 'dept' | 'asset' | 'hr' | 'accounts', status: boolean) => {
    setEmployeeExits((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const updated = { ...e };
          if (clearanceType === 'dept') updated.departmentClearance = status;
          if (clearanceType === 'asset') updated.assetReturnClearance = status;
          if (clearanceType === 'hr') updated.hrClearance = status;
          if (clearanceType === 'accounts') updated.accountsClearance = status;
          if (updated.departmentClearance && updated.assetReturnClearance && updated.hrClearance && updated.accountsClearance) {
            updated.status = 'Cleared';
          }
          return updated;
        }
        return e;
      })
    );
    logAction('UPDATE', 'hr', 'resignation-exit', id, `Updated clearance (${clearanceType}) to ${status}`);
  };

  const addFullAndFinalSettlement = (fnf: Omit<FullAndFinalSettlementItem, 'id'>) => {
    const newId = `FNF-2026-0${fullAndFinalSettlements.length + 1}`;
    const newFnf = { ...fnf, id: newId };
    setFullAndFinalSettlements((prev) => [newFnf, ...prev]);
    logAction('CREATE', 'hr', 'full-final-settlement', newId, `Calculated F&F settlement for ${fnf.employeeName}`);
  };
  const updateFinalSettlementStatus = (id: string, status: FullAndFinalSettlementItem['paymentStatus'], voucherNo?: string) => {
    setFullAndFinalSettlements((prev) =>
      prev.map((f) => (f.id === id ? { ...f, paymentStatus: status, ...(voucherNo ? { accountingVoucherNo: voucherNo } : {}) } : f))
    );
    logAction('UPDATE', 'hr', 'full-final-settlement', id, `Updated F&F payment status to ${status}`);
  };

  const addShiftMaster = (shift: Omit<ShiftMaster, 'id'>) => {
    const newId = `SHIFT-0${shiftMasters.length + 1}`;
    const newShift = { ...shift, id: newId };
    setShiftMasters((prev) => [...prev, newShift]);
    logAction('CREATE', 'hr', 'shift-management', newId, `Created Shift ${shift.shiftName}`);
    api.post('/shifts/', newShift).catch((err) => console.warn('Failed to add shift:', err));
  };
  const updateShiftMaster = (id: string, shift: Partial<ShiftMaster>) => {
    setShiftMasters((prev) => prev.map((s) => (s.id === id ? { ...s, ...shift } : s)));
    logAction('UPDATE', 'hr', 'shift-management', id, `Updated Shift ${id}`);
  };

  const addShiftRoster = (roster: Omit<ShiftRosterItem, 'id'>) => {
    const newId = `RST-${1000 + shiftRosters.length + 1}`;
    const newRoster = { ...roster, id: newId };
    setShiftRosters((prev) => [newRoster, ...prev]);
    logAction('CREATE', 'hr', 'shift-roster', newId, `Assigned shift ${roster.shiftName} to ${roster.employeeName}`);
  };

  const addHoliday = (holiday: Omit<HolidayItem, 'id'>) => {
    const newId = `HOL-2026-0${holidays.length + 1}`;
    const newHol = { ...holiday, id: newId };
    setHolidays((prev) => [...prev, newHol]);
    logAction('CREATE', 'hr', 'holiday-calendar', newId, `Added Holiday ${holiday.holidayName}`);
  };

  const markAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    const newId = `ATT-2026-${1000 + attendanceRecords.length + 1}`;
    const newRecord = { ...record, id: newId };
    setAttendanceRecords((prev) => [newRecord, ...prev]);
    logAction('CREATE', 'hr', 'attendance', newId, `Marked attendance ${record.status} for ${record.employeeName}`);
  };
  const updateAttendanceRecord = (id: string, record: Partial<AttendanceRecord>) => {
    setAttendanceRecords((prev) => prev.map((a) => (a.id === id ? { ...a, ...record } : a)));
    logAction('UPDATE', 'hr', 'attendance', id, `Updated attendance record ${id}`);
  };

  const addLeaveType = (lt: Omit<LeaveType, 'id'>) => {
    const newId = `LT-0${leaveTypes.length + 1}`;
    const newLt = { ...lt, id: newId };
    setLeaveTypes((prev) => [...prev, newLt]);
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
    setLeaveRequests((prev) => [newReq, ...prev]);
    logAction('CREATE', 'hr', 'leave-management', lNo, `Applied for leave ${req.leaveName} by ${req.employeeName}`);
    api.hr.leaves.create(newReq).catch((err) => console.warn('Failed to add leave request:', err));
  };
  const updateLeaveRequestStatus = (id: string, status: LeaveApprovalStatus, approvedBy?: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) =>
        l.id === id || l.leaveNumber === id
          ? { ...l, status, approvedBy: approvedBy || 'HR / Manager', approvedDate: new Date().toISOString().split('T')[0] }
          : l
      )
    );
    logAction('UPDATE', 'hr', 'leave-approvals', id, `Leave request status updated to ${status}`);
    api.patch(`/leave-requests/${id}/`, { status, approvedBy }).catch((err) => console.warn('Failed to update leave request:', err));
  };

  const addWFHRequest = (req: Omit<WFHRequest, 'id' | 'wfhNumber' | 'status'>) => {
    const wNo = `WFH-2026-0${wfhRequests.length + 1}`;
    const newReq: WFHRequest = { ...req, id: wNo, wfhNumber: wNo, status: 'Pending' };
    setWFHRequests((prev) => [newReq, ...prev]);
    logAction('CREATE', 'hr', 'wfh-remote', wNo, `Applied for WFH by ${req.employeeName}`);
    api.post('/wfh-requests/', newReq).catch((err) => console.warn('Failed to add WFH request:', err));
  };
  const updateWFHRequestStatus = (id: string, status: LeaveApprovalStatus) => {
    setWFHRequests((prev) => prev.map((w) => (w.id === id || w.wfhNumber === id ? { ...w, status } : w)));
    logAction('UPDATE', 'hr', 'wfh-remote', id, `WFH request status updated to ${status}`);
  };

  const addMissedPunchRequest = (req: Omit<MissedPunchRequest, 'id' | 'requestNumber' | 'status'>) => {
    const rNo = `MP-2026-0${missedPunchRequests.length + 1}`;
    const newReq: MissedPunchRequest = { ...req, id: rNo, requestNumber: rNo, status: 'Pending' };
    setMissedPunchRequests((prev) => [newReq, ...prev]);
    logAction('CREATE', 'hr', 'missed-punch', rNo, `Submitted Missed Punch request for ${req.employeeName}`);
    api.post('/missed-punches/', newReq).catch((err) => console.warn('Failed to add missed punch:', err));
  };
  const updateMissedPunchStatus = (id: string, status: LeaveApprovalStatus) => {
    setMissedPunchRequests((prev) => prev.map((m) => (m.id === id || m.requestNumber === id ? { ...m, status } : m)));
    logAction('UPDATE', 'hr', 'missed-punch', id, `Missed punch status updated to ${status}`);
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
    setOvertimeRecords((prev) => [newOt, ...prev]);
    logAction('CREATE', 'hr', 'overtime', otNo, `Logged overtime ${ot.overtimeHours} hrs for ${ot.employeeName}`);
    api.post('/overtime-records/', newOt).catch((err) => console.warn('Failed to add overtime record:', err));
  };
  const updateOvertimeStatus = (id: string, status: OvertimeRecord['status']) => {
    setOvertimeRecords((prev) => prev.map((o) => (o.id === id || o.overtimeNo === id ? { ...o, status } : o)));
    logAction('UPDATE', 'hr', 'overtime', id, `Updated overtime status to ${status}`);
  };

  const addEarlyCheckoutRequest = (req: Omit<EarlyCheckoutRequest, 'id' | 'requestNumber' | 'status'>) => {
    const rNo = `ECO-2026-0${earlyCheckoutRequests.length + 1}`;
    const newReq: EarlyCheckoutRequest = { ...req, id: rNo, requestNumber: rNo, status: 'Pending' };
    setEarlyCheckoutRequests((prev) => [newReq, ...prev]);
    logAction('CREATE', 'hr', 'early-checkout', rNo, `Early checkout request for ${req.employeeName}`);
  };
  const updateEarlyCheckoutStatus = (id: string, status: LeaveApprovalStatus) => {
    setEarlyCheckoutRequests((prev) => prev.map((e) => (e.id === id || e.requestNumber === id ? { ...e, status } : e)));
    logAction('UPDATE', 'hr', 'early-checkout', id, `Updated early checkout status to ${status}`);
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

  const addEmployeeAppraisal = (app: Omit<EmployeeAppraisal, 'id' | 'appraisalNumber' | 'status'>) => {
    const aNo = `APR-2026-0${employeeAppraisals.length + 1}`;
    const newApp: EmployeeAppraisal = { ...app, id: aNo, appraisalNumber: aNo, status: 'Self Review Pending' };
    setEmployeeAppraisals((prev) => [newApp, ...prev]);
    logAction('CREATE', 'hr', 'appraisals', aNo, `Initiated Appraisal ${aNo} for ${app.employeeName}`);
  };
  const updateAppraisalStatus = (id: string, status: EmployeeAppraisal['status']) => {
    setEmployeeAppraisals((prev) => prev.map((a) => (a.id === id || a.appraisalNumber === id ? { ...a, status } : a)));
    logAction('UPDATE', 'hr', 'appraisals', id, `Updated appraisal status to ${status}`);
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
        availableEmployees: employees,
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
        getNextDocNumber,
        departments,
        addDepartment,
        updateDepartment,
        roles,
        addRole,
        updateRole,
        employees,
        addEmployee,
        updateEmployee,
        leads,
        addLead,
        updateLead,
        deleteLead,
        convertLeadToCustomer,
        customers,
        addCustomer,
        updateCustomer,
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
        exhibitions,
        addExhibition,
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
        suppliers,
        addSupplier,
        updateSupplier,
        supplierContacts,
        addSupplierContact,
        materialRequirements,
        addMaterialRequirement,
        purchaseRequisitions,
        addPurchaseRequisition,
        approvePurchaseRequisition,
        rfqs,
        addRFQ,
        supplierQuotations,
        addSupplierQuotation,
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
        purchaseInvoices,
        addPurchaseInvoice,
        postPurchaseInvoice,
        creditNotes,
        addCreditNote,
        debitNotes,
        addDebitNote,
        customerReceipts,
        addCustomerReceipt,
        supplierPayments,
        addSupplierPayment,
        journalEntries,
        addJournalEntry,
        contraEntries,
        addContraEntry,
        expenseEntries,
        addExpenseEntry,
        approveExpenseEntry,
        bankAccounts,
        addBankAccount,
        bankTransactions,
        bankReconciliations,
        reconcileBankTransaction,
        fixedAssets,
        addFixedAsset,
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
        updateEmployeeDocumentStatus,
        employeeOnboardings,
        addEmployeeOnboarding,
        updateEmployeeOnboardingStatus,
        employeeTransfers,
        addEmployeeTransfer,
        employeePromotions,
        addEmployeePromotion,
        employeeExits,
        addEmployeeExit,
        updateEmployeeExitClearance,
        fullAndFinalSettlements,
        addFullAndFinalSettlement,
        updateFinalSettlementStatus,
        shiftMasters,
        addShiftMaster,
        updateShiftMaster,
        shiftRosters,
        addShiftRoster,
        holidays,
        addHoliday,
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
        missedPunchRequests,
        addMissedPunchRequest,
        updateMissedPunchStatus,
        attendanceRegularizations,
        addAttendanceRegularization,
        updateAttendanceRegularizationStatus,
        overtimeRecords,
        addOvertimeRecord,
        updateOvertimeStatus,
        earlyCheckoutRequests,
        addEarlyCheckoutRequest,
        updateEarlyCheckoutStatus,
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
        sendNotification,

        testCases,
        updateTestCaseStatus,
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
