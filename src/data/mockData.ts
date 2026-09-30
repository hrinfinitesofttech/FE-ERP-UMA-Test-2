import { UserProfile, DepartmentType, JobTraceabilityRecord, AuditLogEntry, NotificationItem } from '../types/erp';
import {
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

export const MOCK_USERS: UserProfile[] = [];
export const MOCK_DEPARTMENTS: { id: DepartmentType; name: string; icon: string; description: string; count: number }[] = [];
export const MOCK_JOBS: JobTraceabilityRecord[] = [];
export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [];
export const MOCK_NOTIFICATIONS: NotificationItem[] = [];
export const MOCK_PROJECT_TASKS: ProjectTask[] = [];
export const MOCK_PLANNING_STAGES: ProjectPlanningStage[] = [];
export const MOCK_DEPARTMENT_ASSIGNMENTS: DepartmentAssignment[] = [];
export const MOCK_MILESTONES: ProjectMilestone[] = [];
export const MOCK_PROJECT_ISSUES: ProjectIssue[] = [];
export const MOCK_PROJECT_DELAYS: ProjectDelay[] = [];
export const MOCK_CHANGE_REQUESTS: CustomerChangeRequest[] = [];
export const MOCK_PROJECT_DOCUMENTS: ProjectDocument[] = [];
export const MOCK_PROJECT_COSTS: ProjectCostItem[] = [];
export const MOCK_PROJECT_COMMENTS: ProjectComment[] = [];
export const MOCK_PROJECT_APPROVALS: ProjectApproval[] = [];
export const MOCK_PROJECT_ACTIVITIES: ProjectActivityLog[] = [];
export const MOCK_CUSTOMER_REQUIREMENTS: CustomerRequirement[] = [];
export const MOCK_DESIGN_TASKS: DesignTask[] = [];
export const MOCK_2D_DRAWINGS: Drawing2D[] = [];
export const MOCK_3D_MODELS: Design3DModel[] = [];
export const MOCK_ASSEMBLY_DRAWINGS: AssemblyDrawing[] = [];
export const MOCK_PART_DRAWINGS: PartDrawing[] = [];
export const MOCK_BOM_HEADERS: BOMHeader[] = [];
export const MOCK_BOM_REVISIONS: BOMRevision[] = [];
export const MOCK_DESIGN_REVISIONS: DesignRevisionLog[] = [];
export const MOCK_DESIGN_REVIEWS: DesignReviewChecklist[] = [];
export const MOCK_TECHNICAL_DOCUMENTS: TechnicalDocumentItem[] = [];
export const MOCK_SUPPLIER_CONTACTS: SupplierContact[] = [];
export const MOCK_MATERIAL_REQUIREMENTS: MaterialRequirement[] = [];
export const MOCK_PURCHASE_REQUISITIONS: PurchaseRequisition[] = [];
export const MOCK_RFQS: RequestForQuotation[] = [];
export const MOCK_SUPPLIER_QUOTATIONS: SupplierQuotation[] = [];
export const MOCK_QUOTATION_COMPARISONS: QuotationComparison[] = [];
export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [];
export const MOCK_PO_REVISIONS: PORevision[] = [];
export const MOCK_PURCHASE_FOLLOWUPS: PurchaseFollowUp[] = [];
export const MOCK_PURCHASE_RETURNS: PurchaseReturn[] = [];
