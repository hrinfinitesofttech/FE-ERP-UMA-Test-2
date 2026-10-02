export type SupplierType =
  | 'Manufacturer'
  | 'Trader / Distributor'
  | 'Importer'
  | 'Fabricator'
  | 'Service Provider'
  | 'Raw Material'
  | 'Bought-out Items'
  | 'Subcontractor'
  | 'Standard Components'
  | 'Services';

export type SupplierStatus =
  | 'active'
  | 'blacklisted'
  | 'pending_verification'
  | 'Approved'
  | 'Pending Verification'
  | 'Blacklisted';

export type PRStatus =
  | 'draft'
  | 'submitted'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'partially_ordered'
  | 'fully_ordered'
  | 'closed'
  | 'cancelled'
  | 'Draft'
  | 'Submitted'
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Converted to RFQ';

export type RFQStatus =
  | 'draft'
  | 'sent'
  | 'partially_responded'
  | 'fully_responded'
  | 'closed'
  | 'cancelled'
  | 'Draft'
  | 'Sent to Suppliers'
  | 'Quotation Received'
  | 'Closed';

export type POStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'sent_to_supplier'
  | 'acknowledged'
  | 'partially_received'
  | 'fully_received'
  | 'closed'
  | 'cancelled'
  | 'Draft'
  | 'Submitted'
  | 'Pending Approval'
  | 'Approved'
  | 'Ordered'
  | 'Partially Received'
  | 'Completed'
  | 'Cancelled';

export type ReturnReason =
  | 'Damaged Material'
  | 'Wrong Material'
  | 'Wrong Quantity'
  | 'Quality Rejection'
  | 'Specification Mismatch'
  | 'Excess Material'
  | 'QC Inspection Failure - Dimensional Out of Tolerance'
  | 'Other';

export interface SupplierDocument {
  id: string;
  name?: string;
  type?: string;
  url?: string;
  documentType?: string;
  documentName?: string;
  fileUrl?: string;
  uploadDate: string;
}

export interface Supplier {
  id: string;
  supplierCode?: string;
  vendorCode: string;
  supplierName?: string;
  name: string;
  category: string;
  supplierType?: SupplierType;
  contactPerson: string;
  mobile?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pinCode?: string;
  country: string;
  gstin: string;
  pan?: string;
  panNumber: string;
  msmeStatus?: boolean;
  msmeRegistered: boolean;
  msmeNumber: string;
  paymentTerms: string;
  creditDays?: number;
  creditPeriodDays?: number;
  bankName: string;
  bankAccountNumber: string;
  ifscCode: string;
  bankDetails?: string;
  defaultDeliveryDays?: number;
  rating?: number;
  performanceRating: number;
  status: SupplierStatus;
  notes?: string;
  documents?: SupplierDocument[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierContact {
  id: string;
  supplierId: string;
  supplierName: string;
  contactName?: string;
  name: string;
  designation: string;
  department: string;
  mobile?: string;
  phone: string;
  email: string;
  isPrimary?: boolean;
  isPrimaryContact?: boolean;
  notes?: string;
  createdAt?: string;
}

export interface MaterialRequirement {
  id: string;
  projectId: string;
  jobId: string;
  jobNumber?: string;
  customerName?: string;
  designJobId?: string;
  bomId: string;
  bomNumber?: string;
  bomRevision: string;
  partNumber: string;
  itemCode: string;
  itemName: string;
  materialName?: string;
  specification: string;
  category: string;
  requiredQuantity: number;
  unitOfMeasure: string;
  unit?: string;
  availableStock: number;
  reservedStock?: number;
  onOrderQuantity: number;
  alreadyOrderedQuantity?: number;
  shortageQuantity: number;
  requiredDate?: string;
  requiredByDate: string;
  procurementType?: 'Purchase' | 'Stock' | 'Manufacture' | 'Fabrication';
  procurementStatus: string;
  drawingNumber?: string;
  status?: 'shortage' | 'sufficient' | 'ordered' | 'pr_created' | string;
}

export interface PRItem {
  id: string;
  prId?: string;
  itemCode: string;
  itemName: string;
  materialName?: string;
  specification: string;
  category: string;
  quantity?: number;
  requiredQuantity: number;
  unitOfMeasure: string;
  unit?: string;
  estimatedUnitPrice: number;
  estimatedTotalPrice: number;
  requiredDate?: string;
  requiredByDate?: string;
  preferredBrand?: string;
  drawingNumber?: string;
  bomReference?: string;
  remarks?: string;
}

export interface PurchaseRequisition {
  id: string;
  prNumber: string;
  prDate?: string;
  requisitionDate: string;
  projectId: string;
  jobId: string;
  jobNumber?: string;
  customerName?: string;
  bomId?: string;
  bomNumber?: string;
  bomRevision?: string;
  requestedBy: string;
  department: string;
  requiredDate?: string;
  requiredByDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'Low' | 'Medium' | 'High' | 'Urgent';
  reason?: string;
  remarks?: string;
  status: PRStatus;
  approvedBy?: string;
  approvedDate?: string;
  items: PRItem[];
  totalItems: number;
  estimatedCost: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RFQItem {
  id: string;
  rfqId?: string;
  itemCode: string;
  itemName?: string;
  materialName?: string;
  specification: string;
  category?: string;
  quantity?: number;
  requiredQuantity?: number;
  unitOfMeasure?: string;
  unit?: string;
  targetPrice?: number;
  drawingNumber?: string;
}

export interface RequestForQuotation {
  id: string;
  rfqNumber: string;
  rfqDate: string;
  dueDate: string;
  requiredDeliveryDate?: string;
  prId?: string;
  prNumber: string;
  projectId: string;
  jobId: string;
  jobNumber?: string;
  bomRevision?: string;
  buyer?: string;
  issuedBy?: string;
  supplierIds?: string[];
  supplierNames?: string[];
  invitedSuppliers: {
    supplierId: string;
    supplierName: string;
    email?: string;
    quotationReceived?: boolean;
  }[];
  termsAndConditions?: string;
  status: RFQStatus;
  sentDate?: string;
  followUpDate?: string;
  items: RFQItem[];
  createdAt?: string;
  updatedAt?: string;
}

export type RequestForQuotations = RequestForQuotation;

export interface SupplierQuotationItem {
  id: string;
  quotationId?: string;
  itemCode: string;
  itemName: string;
  materialName?: string;
  specification: string;
  category?: string;
  quantity?: number;
  quotedQuantity?: number;
  unitOfMeasure?: string;
  unit?: string;
  unitPrice: number;
  totalPrice: number;
  discountPercent?: number;
  discountPercentage?: number;
  taxPercent?: number;
  gstPercentage?: number;
  netPrice: number;
  brandMake?: string;
  deliveryDays?: number;
  leadTimeDays?: number;
  warrantyMonths?: number;
  technicalCompliant?: boolean;
  remarks?: string;
}

export interface SupplierQuotation {
  id: string;
  supplierQuotationNumber?: string;
  quotationNumber: string;
  supplierQuotationRef: string;
  rfqId?: string;
  supplierId: string;
  supplierName: string;
  rfqNumber: string;
  prNumber?: string;
  projectId?: string;
  jobId?: string;
  jobNumber?: string;
  quotationDate: string;
  validUntil?: string;
  validityDate?: string;
  currency?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  deliveryTimeDays?: number;
  leadTimeDays: number;
  freightCharges?: number;
  packingCharges?: number;
  otherCharges?: number;
  gstTaxRate?: number;
  subtotal?: number;
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  technicalStatus: string;
  status: 'submitted' | 'under_review' | 'selected' | 'rejected' | 'Submitted' | string;
  recordedBy?: string;
  items: SupplierQuotationItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface QuotationComparison {
  id: string;
  comparisonNumber: string;
  rfqId?: string;
  rfqNumber: string;
  projectId?: string;
  jobId: string;
  jobNumber?: string;
  comparisonDate: string;
  preparedBy: string;
  selectedSupplierId?: string;
  selectedSupplierName?: string;
  recommendedSupplierId?: string;
  recommendedSupplierName: string;
  selectionReason?: string;
  buyerReason: string;
  commercialRemarks?: string;
  technicalRemarks?: string;
  status: string;
  approvalStatus?: 'draft' | 'pending_approval' | 'approved' | 'rejected' | string;
  approvedBy?: string;
  suppliersEvaluated: {
    supplierId: string;
    supplierName: string;
    grandTotal: number;
    deliveryTerms?: string;
    paymentTerms?: string;
  }[];
  items: {
    id: string;
    itemCode: string;
    itemName: string;
    requiredQuantity: number;
    unitOfMeasure: string;
    supplierRates: Record<string, number>;
    lowestSupplierId: string;
  }[];
}

export interface POItem {
  id: string;
  poId?: string;
  itemCode: string;
  itemName: string;
  materialName?: string;
  description?: string;
  specification: string;
  category?: string;
  quantity?: number;
  orderedQuantity?: number;
  receivedQuantity?: number;
  unitOfMeasure?: string;
  unit?: string;
  rate?: number;
  unitPrice?: number;
  totalPrice?: number;
  discount?: number;
  tax?: number;
  gstPercentage?: number;
  netPrice: number;
  netAmount?: number;
  hsnCode: string;
  drawingNumber?: string;
  deliveryDate?: string;
  brandMake?: string;
  remarks?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  revisionNumber: number;
  activeRevision?: string;
  poDate: string;
  supplierId: string;
  supplierName: string;
  supplierGstin?: string;
  supplierContact?: string;
  projectId?: string;
  jobId: string;
  jobNumber?: string;
  customerName?: string;
  quotationId?: string;
  prNumber?: string;
  rfqNumber?: string;
  supplierQuotationNumber?: string;
  bomNumber?: string;
  bomRevision?: string;
  buyer?: string;
  createdBy: string;
  expectedDeliveryDate: string;
  requiredDeliveryDate?: string;
  status: POStatus;
  approvalTier?: string;
  specialInstructions?: string;
  subtotal?: number;
  subTotal: number;
  taxTotal: number;
  discountTotal?: number;
  freightCharges: number;
  freight?: number;
  packing?: number;
  otherCharges?: number;
  gstAmount?: number;
  grandTotal: number;
  paymentTerms?: string;
  deliveryTerms?: string;
  dispatchMode?: string;
  currency?: string;
  warranty?: string;
  billingAddress?: string;
  deliveryAddress?: string;
  items: POItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PORevision {
  id: string;
  poId: string;
  poNumber: string;
  revisionNumber: string | number;
  revisedDate?: string;
  revisionDate: string;
  revisedBy: string;
  reason?: string;
  reasonForRevision: string;
  previousGrandTotal?: number;
  revisedGrandTotal: number;
  newGrandTotal?: number;
}

export interface PurchaseFollowUp {
  id: string;
  poId?: string;
  poNumber: string;
  supplierId?: string;
  supplierName: string;
  jobId?: string;
  jobNumber?: string;
  itemName?: string;
  orderedQty?: number;
  receivedQty?: number;
  pendingQty?: number;
  expectedDelivery?: string;
  actualDelivery?: string;
  followUpDate: string;
  contactedPerson: string;
  communicationChannel: string;
  followUpPerson?: string;
  followUpBy: string;
  mode?: 'Call' | 'Email' | 'WhatsApp' | 'Internal Reminder' | string;
  remarks: string;
  supplierCommitmentDate: string;
  delayRisk: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  nextFollowUpDate?: string;
  delayDays?: number;
  status?: 'on_schedule' | 'delayed' | 'critical' | string;
  createdAt?: string;
}

export interface PurchaseReturnItem {
  id: string;
  returnId?: string;
  itemCode: string;
  itemName?: string;
  materialName?: string;
  specification?: string;
  unitOfMeasure?: string;
  unit?: string;
  quantity?: number;
  returnedQuantity?: number;
  rate?: number;
  unitPrice?: number;
  amount?: number;
  totalRefundPrice: number;
  rejectionReason?: string;
}

export interface PurchaseReturn {
  id: string;
  returnNumber: string;
  debitNoteNumber: string;
  poId?: string;
  poNumber: string;
  grnNumber?: string;
  supplierId: string;
  supplierName: string;
  jobId?: string;
  jobNumber?: string;
  returnDate: string;
  reason?: ReturnReason;
  reasonForReturn?: string;
  returnType?: 'Replacement' | 'Credit Note' | string;
  actionRequested: string;
  totalReturnAmount: number;
  status: 'initiated' | 'dispatched' | 'credit_note_received' | 'completed' | 'Debit Note Issued' | string;
  items: PurchaseReturnItem[];
  createdBy?: string;
  createdAt?: string;
}
