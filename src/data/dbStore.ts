import {
  CompanySetting,
  NumberingSetting,
  Department,
  Role,
  Employee,
  Customer,
  Lead,
  FollowUp,
  SiteVisit,
  Exhibition,
  Enquiry,
  Opportunity,
  Quotation,
  CustomerPO,
  SalesOrder,
  ProjectJobMaster,
} from '../types/crm';
import { DesignJob } from '../types/designer';
import { Supplier } from '../types/purchase';

export const INITIAL_COMPANY: CompanySetting = {
  id: 'COMP-001',
  companyName: 'UMA Techno Fab Private Limited',
  tagline: 'Precision Engineering & Make-To-Order Manufacturing ERP',
  registrationNumber: 'U29100GJ2015PTC082914',
  gstin: '24AAACU8892M1Z8',
  pan: 'AAACU8892M',
  tan: 'AHMU01928C',
  cin: 'U29100GJ2015PTC082914',
  registeredAddress: 'Plot No. 48/A, Phase-II, GIDC Industrial Estate, Vatva',
  city: 'Ahmedabad',
  state: 'Gujarat',
  country: 'India',
  pincode: '382445',
  contactPerson: 'Rajesh Patel',
  contactEmail: 'contact@umatechnofab.com',
  contactPhone: '+91 79 2589 1234',
  accountsEmail: 'accounts@umatechnofab.com',
  website: 'https://www.umatechnofab.com',
  fiscalYearStart: '2026-04-01',
  fiscalYearEnd: '2027-03-31',
  bankName: 'HDFC Bank Ltd',
  bankAccountNumber: '50200012345678',
  bankBranch: 'Vatva Industrial Area, Ahmedabad',
  bankIfscCode: 'HDFC0000256',
  lutNumber: 'AD240326001928L',
  currency: 'INR',
  currencySymbol: '₹',
  isLUTActive: true,
};

export const INITIAL_NUMBERING: NumberingSetting[] = [
  {
    id: 'NUM-001',
    module: 'CRM & Sales',
    docType: 'lead',
    prefix: 'LEAD-2026-',
    currentNumber: 100,
    digitCount: 4,
    samplePreview: 'LEAD-2026-0101',
  },
  {
    id: 'NUM-002',
    module: 'CRM & Sales',
    docType: 'enquiry',
    prefix: 'ENQ-2026-',
    currentNumber: 60,
    digitCount: 4,
    samplePreview: 'ENQ-2026-0061',
  },
  {
    id: 'NUM-003',
    module: 'CRM & Sales',
    docType: 'opportunity',
    prefix: 'OPP-2026-',
    currentNumber: 40,
    digitCount: 4,
    samplePreview: 'OPP-2026-0041',
  },
  {
    id: 'NUM-004',
    module: 'CRM & Sales',
    docType: 'quotation',
    prefix: 'QT-2026-',
    currentNumber: 130,
    digitCount: 4,
    samplePreview: 'QT-2026-0131',
  },
  {
    id: 'NUM-005',
    module: 'CRM & Sales',
    docType: 'customer_po',
    prefix: 'CPO-2026-',
    currentNumber: 80,
    digitCount: 4,
    samplePreview: 'CPO-2026-0081',
  },
  {
    id: 'NUM-006',
    module: 'CRM & Sales',
    docType: 'sales_order',
    prefix: 'SO-2026-',
    currentNumber: 70,
    digitCount: 4,
    samplePreview: 'SO-2026-0071',
  },
  {
    id: 'NUM-007',
    module: 'Project Management',
    docType: 'project',
    prefix: 'PRJ-2026-',
    currentNumber: 40,
    digitCount: 4,
    samplePreview: 'PRJ-2026-0041',
  },
  {
    id: 'NUM-008',
    module: 'Production & Shopfloor',
    docType: 'job',
    prefix: 'JOB-2026-',
    currentNumber: 50,
    digitCount: 4,
    samplePreview: 'JOB-2026-0051',
  },
  {
    id: 'NUM-009',
    module: 'CRM & Sales',
    docType: 'visit',
    prefix: 'VST-2026-',
    currentNumber: 30,
    digitCount: 4,
    samplePreview: 'VST-2026-0031',
  },
  {
    id: 'NUM-010',
    module: 'Accounting & Finance',
    docType: 'invoice',
    prefix: 'INV-2026-',
    currentNumber: 110,
    digitCount: 4,
    samplePreview: 'INV-2026-0111',
  },
];

export const INITIAL_DEPARTMENTS: Department[] = [];
export const INITIAL_ROLES: Role[] = [];
export const INITIAL_EMPLOYEES: Employee[] = [];
export const INITIAL_CUSTOMERS: Customer[] = [];
export const INITIAL_LEADS: Lead[] = [];
export const INITIAL_FOLLOWUPS: FollowUp[] = [];
export const INITIAL_VISITS: SiteVisit[] = [];
export const INITIAL_EXHIBITIONS: Exhibition[] = [];
export const INITIAL_ENQUIRIES: Enquiry[] = [];
export const INITIAL_OPPORTUNITIES: Opportunity[] = [];
export const INITIAL_QUOTATIONS: Quotation[] = [];
export const INITIAL_CUSTOMER_POS: CustomerPO[] = [];
export const INITIAL_SALES_ORDERS: SalesOrder[] = [];
export const INITIAL_PROJECT_JOBS: ProjectJobMaster[] = [];
export const INITIAL_DESIGN_JOBS: DesignJob[] = [];
export const INITIAL_SUPPLIERS: Supplier[] = [];
