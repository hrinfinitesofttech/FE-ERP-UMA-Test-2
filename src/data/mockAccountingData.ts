import {
  FinancialYear,
  AccountGroup,
  ChartOfAccount,
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
  FixedAsset,
  JobCostingSummary,
  ReceivableAging,
  PayableAging,
} from '../types/accounting';

export const INITIAL_FINANCIAL_YEARS: FinancialYear[] = [];
export const INITIAL_ACCOUNT_GROUPS: AccountGroup[] = [];
export const INITIAL_CHART_OF_ACCOUNTS: ChartOfAccount[] = [];
export const INITIAL_TAX_MASTERS: TaxMaster[] = [];
export const INITIAL_TDS_MASTERS: TDSMaster[] = [];
export const INITIAL_COST_CENTERS: CostCenter[] = [];
export const INITIAL_SALES_INVOICES: SalesInvoice[] = [];
export const INITIAL_PURCHASE_INVOICES: PurchaseInvoice[] = [];
export const INITIAL_CREDIT_NOTES: CreditNote[] = [];
export const INITIAL_DEBIT_NOTES: DebitNote[] = [];
export const INITIAL_CUSTOMER_RECEIPTS: CustomerReceipt[] = [];
export const INITIAL_SUPPLIER_PAYMENTS: SupplierPayment[] = [];
export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [];
export const INITIAL_CONTRA_ENTRIES: ContraEntry[] = [];
export const INITIAL_EXPENSE_ENTRIES: ExpenseEntry[] = [];
export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'BANK-01',
    accountName: 'HDFC Current Account - Operations',
    accountType: 'Current',
    bankName: 'HDFC Bank',
    accountNumber: '50200098765432',
    ifscCode: 'HDFC0000123',
    branch: 'Alkapuri, Vadodara',
    branchName: 'Alkapuri, Vadodara',
    glAccountCode: '1010',
    openingBalance: 12000000,
    currentBalance: 14500000,
    status: 'Active',
    isActive: true,
  },
  {
    id: 'BANK-02',
    accountName: 'SBI Cash Credit / Working Capital A/c',
    accountType: 'Cash_Credit',
    bankName: 'State Bank of India',
    accountNumber: '334455667788',
    ifscCode: 'SBIN0001234',
    branch: 'GIDC Makarpura, Vadodara',
    branchName: 'GIDC Makarpura, Vadodara',
    glAccountCode: '1020',
    openingBalance: 5000000,
    currentBalance: 8200000,
    status: 'Active',
    isActive: true,
  },
  {
    id: 'BANK-03',
    accountName: 'ICICI Project Escrow & FX Account',
    accountType: 'Current',
    bankName: 'ICICI Bank',
    accountNumber: '002405001234',
    ifscCode: 'ICIC0000024',
    branch: 'Sayajigunj, Vadodara',
    branchName: 'Sayajigunj, Vadodara',
    glAccountCode: '1030',
    openingBalance: 3000000,
    currentBalance: 3500000,
    status: 'Active',
    isActive: true,
  },
  {
    id: 'BANK-04',
    accountName: 'Factory Petty Cash Register',
    accountType: 'Cash',
    bankName: 'Main Factory Cash Vault',
    accountNumber: 'CASH-VAULT-01',
    ifscCode: 'N/A',
    branch: 'Maneja Plant',
    branchName: 'Maneja Plant',
    glAccountCode: '1000',
    openingBalance: 200000,
    currentBalance: 350000,
    status: 'Active',
    isActive: true,
  },
];
export const INITIAL_BANK_TRANSACTIONS: BankTransaction[] = [];
export const INITIAL_FIXED_ASSETS: FixedAsset[] = [];
export const INITIAL_JOB_COSTINGS: JobCostingSummary[] = [];
export const INITIAL_RECEIVABLE_AGING: ReceivableAging[] = [];
export const INITIAL_PAYABLE_AGING: PayableAging[] = [];

