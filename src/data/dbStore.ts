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

export const INITIAL_NUMBERING: NumberingSetting[] = [];
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
