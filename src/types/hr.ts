export type EmploymentType =
  | 'Full Time Permanent'
  | 'Probation'
  | 'Contract'
  | 'Trainee / Apprentice'
  | 'Third Party / Outsource';

export type EmploymentStatus =
  | 'Active'
  | 'Probation'
  | 'Notice Period'
  | 'Resigned'
  | 'Terminated'
  | 'Retired'
  | 'Absconding';

export type AttendanceStatusType =
  | 'Present'
  | 'Absent'
  | 'Half Day'
  | 'First Half'
  | 'Second Half'
  | 'First Half Leave'
  | 'Second Half Leave'
  | 'Late'
  | 'Early Checkout'
  | 'WFH'
  | 'On Leave'
  | 'Holiday'
  | 'Weekly Off'
  | 'Missed Punch';

export type LeaveApprovalStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export type PayrollStatusType =
  | 'Draft'
  | 'Calculating'
  | 'Pending Approval'
  | 'Approved'
  | 'Locked'
  | 'Posted to Accounting';

export interface Designation {
  id: string;
  designationCode: string;
  designationName: string;
  department: string;
  level: number; // 1 to 7
  reportingDesignation?: string;
  jobDescription: string;
  responsibilities: string[];
  status: 'Active' | 'Inactive';
}

export interface EmployeeDocumentItem {
  id: string;
  employeeId: string;
  employeeName: string;
  documentType:
    | 'Aadhaar'
    | 'PAN'
    | 'Resume'
    | 'Educational Degree'
    | 'Previous Experience Certificate'
    | 'Joining Letter'
    | 'Appointment Letter'
    | 'Bank Passbook'
    | 'Medical Fitness';
  documentNumber: string;
  issueDate?: string;
  expiryDate?: string;
  fileUrl: string;
  verificationStatus: 'Verified' | 'Pending' | 'Rejected';
  verifiedBy?: string;
  verifiedDate?: string;
  remarks?: string;
}

export interface EmployeeOnboardingItem {
  id: string;
  candidateId?: string;
  candidateName: string;
  email: string;
  mobile: string;
  joiningDate: string;
  department: string;
  designation: string;
  reportingManager: string;
  shift: string;
  salaryStructureId: string;
  offeredCTC: number;
  onboardingChecklist: Array<{ task: string; completed: boolean; assignedTo: string }>;
  status: 'In Progress' | 'Completed' | 'Pending Documents';
}

export interface EmployeeTransferItem {
  id: string;
  employeeId: string;
  employeeName: string;
  effectiveDate: string;
  fromDepartment: string;
  toDepartment: string;
  fromDesignation: string;
  toDesignation: string;
  fromLocation: string;
  toLocation: string;
  reason: string;
  approvedBy: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export interface EmployeePromotionItem {
  id: string;
  employeeId: string;
  employeeName: string;
  effectiveDate: string;
  oldDesignation: string;
  newDesignation: string;
  oldGrade: string;
  newGrade: string;
  oldCTC: number;
  newCTC: number;
  incrementPercentage: number;
  approvedBy: string;
  status: 'Approved' | 'Pending';
}

export interface EmployeeExitItem {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  resignationDate: string;
  lastWorkingDate: string;
  noticePeriodDays: number;
  reason: string;
  exitInterviewNotes?: string;
  departmentClearance: boolean;
  assetReturnClearance: boolean;
  hrClearance: boolean;
  accountsClearance: boolean;
  status: 'Resigned' | 'Notice Period' | 'Cleared' | 'Settlement Done';
}

export interface FullAndFinalSettlementItem {
  id: string;
  employeeId: string;
  employeeName: string;
  exitId: string;
  lastWorkingDate: string;
  pendingSalaryDays: number;
  pendingSalaryAmount: number;
  leaveEncashmentDays: number;
  leaveEncashmentAmount: number;
  bonusIncentive: number;
  overtimeAmount: number;
  reimbursementsAmount: number;
  advanceRecovery: number;
  loanRecovery: number;
  noticePeriodRecovery: number;
  otherDeductions: number;
  netFinalPayable: number;
  settlementDate: string;
  paymentStatus: 'Pending Accounting Clearance' | 'Paid' | 'Hold';
  accountingVoucherNo?: string;
}

export interface ShiftMaster {
  id: string;
  shiftName: string;
  startTime: string; // e.g. "09:00"
  endTime: string; // e.g. "18:00"
  gracePeriodMinutes: number; // e.g. 15
  breakDurationMinutes: number; // e.g. 60
  lateRule: string;
  earlyCheckoutRule: string;
  overtimeRule: string;
  weeklyOff: 'Sunday' | 'Saturday & Sunday' | 'Rotating';
  status: 'Active' | 'Inactive';
}

export interface ShiftRosterItem {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  shiftId: string;
  shiftName: string;
  assignedBy: string;
}

export interface HolidayItem {
  id: string;
  holidayName: string;
  date?: string;
  holidayDate?: string;
  holidayType: 'Public Holiday' | 'Company Holiday' | 'Festival' | 'Optional Holiday' | string;
  location?: string;
  applicableDepartments: string[];
  isOptional: boolean;
  financialYear?: string;
  description?: string;
  status?: 'Active' | 'Inactive' | string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  shiftName: string;
  checkIn?: string;
  checkOut?: string;
  totalHours: number;
  lateMinutes: number;
  earlyCheckoutMinutes: number;
  overtimeHours: number;
  status: AttendanceStatusType;
  source: 'Biometric System' | 'Mobile App GPS' | 'Manual Log' | 'Regularization';
  remarks?: string;
}

export interface LeaveType {
  id: string;
  leaveCode: string;
  leaveName: string; // e.g., Casual Leave, Sick Leave, Earned Leave
  annualQuota: number;
  monthlyAccrual: number;
  carryForwardAllowed: boolean;
  maxConsecutiveDays: number;
  halfDayAllowed: boolean;
  attachmentRequired: boolean;
  status: 'Active' | 'Inactive';
}

export interface LeaveBalance {
  employeeId: string;
  leaveTypeId: string;
  leaveName: string;
  totalQuota: number;
  usedDays: number;
  pendingDays: number;
  availableBalance: number;
}

export interface LeaveRequest {
  id: string;
  leaveNumber: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveTypeId: string;
  leaveName: string;
  fromDate: string;
  toDate: string;
  numberOfDays: number;
  isHalfDay: boolean;
  halfDayType?: 'First Half' | 'Second Half' | 'Half Day' | 'Full Day';
  reason: string;
  attachmentUrl?: string;
  reportingManager: string;
  status: LeaveApprovalStatus;
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
}

export interface WFHRequest {
  id: string;
  wfhNumber: string;
  employeeId: string;
  employeeName: string;
  department: string;
  fromDate: string;
  toDate: string;
  numberOfDays: number;
  reason: string;
  workDescription: string;
  reportingManager: string;
  status: LeaveApprovalStatus;
  remarks?: string;
  approvedBy?: string;
  approvedDate?: string;
}

export interface MissedPunchRequest {
  id: string;
  requestNumber: string;
  employeeId: string;
  employeeName: string;
  date: string;
  missingPunchType: 'Check-In' | 'Check-Out' | 'Both';
  requestedTime: string;
  reason: string;
  reportingManager: string;
  status: LeaveApprovalStatus;
}

export interface AttendanceRegularization {
  id: string;
  regularizationNo: string;
  employeeId: string;
  employeeName: string;
  date: string;
  originalStatus: AttendanceStatusType;
  requestedStatus: AttendanceStatusType;
  originalCheckIn?: string;
  originalCheckOut?: string;
  correctedCheckIn: string;
  correctedCheckOut: string;
  reason: string;
  status: LeaveApprovalStatus;
}

export interface OvertimeRecord {
  id: string;
  overtimeNo: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  regularHours: number;
  overtimeHours: number;
  reason: string;
  overtimeRateMultiplier: number; // e.g. 1.5 or 2.0
  overtimeAmount: number;
  approvedBy: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Processed in Payroll';
}

export interface EarlyCheckoutRequest {
  id: string;
  requestNumber: string;
  employeeId: string;
  employeeName: string;
  date: string;
  shiftName: string;
  expectedCheckout: string;
  requestedCheckout: string;
  reason: string;
  status: LeaveApprovalStatus;
}

export interface SalaryComponent {
  id: string;
  componentCode: string;
  componentName: string;
  componentType: 'Earning' | 'Deduction' | 'Employer Contribution';
  calculationType: 'Fixed Amount' | 'Percentage of Basic' | 'Formula';
  percentageOrFormula?: string; // e.g., "50% of Basic"
  isTaxable: boolean;
  isStatutory: boolean; // PF, ESI, PT, TDS
  status: 'Active' | 'Inactive';
}

export interface SalaryStructure {
  id: string;
  structureName: string;
  employeeId: string;
  employeeName: string;
  effectiveFrom: string;
  basicSalary: number;
  hra: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  grossSalary: number;
  employeePF: number;
  employeeESI: number;
  professionalTax: number;
  tdsMonthly: number;
  totalDeductions: number;
  netSalary: number;
  employerPF: number;
  employerESI: number;
  totalCTC: number;
  status: 'Active' | 'Revised' | 'Archived';
}

export interface PayrollRecord {
  id: string;
  payrollNumber: string;
  monthYear: string; // e.g. "September 2026"
  financialYear: string; // "2026-2027"
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  workingDays: number;
  presentDays: number;
  leaveDays: number;
  lossOfPayDays: number;
  overtimeHours: number;
  basicSalary: number;
  hra: number;
  allowances: number;
  overtimeAmount: number;
  grossEarnings: number;
  pfDeduction: number;
  esiDeduction: number;
  ptDeduction: number;
  tdsDeduction: number;
  loanAdvanceRecovery: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  employerPF: number;
  employerESI: number;
  totalCTC: number;
  status: PayrollStatusType;
  processedDate: string;
  approvedBy?: string;
  accountingVoucherRef?: string;
}

export interface EmployeeAdvanceLoan {
  id: string;
  loanNumber: string;
  employeeId: string;
  employeeName: string;
  department: string;
  loanType: 'Short Term Advance' | 'Emergency Loan' | 'Festival Advance' | 'Vehicle Loan';
  sanctionedAmount: number;
  disbursementDate: string;
  reason: string;
  emiAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  outstandingBalance: number;
  recoveryStartMonth: string;
  status: 'Active' | 'Fully Recovered' | 'Pending Approval';
}

export interface ReimbursementExpense {
  id: string;
  reimbursementNo: string;
  employeeId: string;
  employeeName: string;
  department: string;
  expenseDate: string;
  category: 'Travel / Conveyance' | 'Client Entertainment' | 'Tooling & Site Purchase' | 'Medical' | 'Mobile Bill';
  amount: number;
  description: string;
  receiptUrl?: string;
  projectId?: string;
  jobNumber?: string;
  status: 'Pending Manager' | 'Approved' | 'Paid via Payroll' | 'Paid via Accounts' | 'Rejected';
  approvedBy?: string;
}

export interface KPIMaster {
  id: string;
  kpiCode: string;
  kpiName: string;
  department: string;
  measurementUnit: string;
  targetValue: number;
  weightagePercent: number;
  description: string;
}

export interface EmployeeAppraisal {
  id: string;
  appraisalNumber: string;
  employeeId: string;
  employeeName: string;
  department: string;
  cyclePeriod: string; // e.g. "FY 2025-26 Annual"
  kpiScore: number; // 1 to 5
  selfRating: number;
  managerRating: number;
  finalScore: number; // 1 to 5
  managerComments: string;
  promotionRecommended: boolean;
  recommendedIncrementPct: number;
  status: 'Self Review Pending' | 'Manager Review Pending' | 'HR Approved' | 'Completed';
}

export interface TrainingProgram {
  id: string;
  trainingCode: string;
  title: string;
  department: string;
  trainerName: string;
  trainingDate: string;
  durationHours: number;
  trainingType: 'Safety & ISO' | 'CNC Machine Operation' | 'Hydraulic Assembly' | 'Quality Audit' | 'ERP Training';
  totalParticipants: number;
  costPerParticipant: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface JobPosition {
  id: string;
  positionCode: string;
  title: string;
  department: string;
  designation: string;
  vacancies: number;
  experienceRequired: string;
  salaryMin: number;
  salaryMax: number;
  jobDescription: string;
  status: 'Open' | 'Closed' | 'On Hold';
}

export interface CandidateProfile {
  id: string;
  candidateCode: string;
  candidateName: string;
  email: string;
  mobile: string;
  appliedPosition: string;
  department: string;
  experienceYears: number;
  noticePeriodDays: number;
  currentCTC: number;
  expectedCTC: number;
  resumeUrl: string;
  status: 'Applied' | 'Shortlisted' | 'Interview Scheduled' | 'Offered' | 'Joined' | 'Rejected';
}

export interface InterviewRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  position: string;
  interviewRound: 'Round 1 Technical' | 'Round 2 Managerial' | 'Round 3 HR & Commercial';
  interviewerName: string;
  interviewDate: string;
  technicalScore: number; // 1-10
  communicationScore: number; // 1-10
  result: 'Pass' | 'Fail' | 'Hold';
  remarks: string;
}

export interface OfferLetter {
  id: string;
  offerNumber: string;
  candidateId: string;
  candidateName: string;
  position: string;
  offeredDesignation: string;
  offeredCTC: number;
  joiningDate: string;
  validUntil: string;
  status: 'Sent' | 'Accepted' | 'Declined';
}
