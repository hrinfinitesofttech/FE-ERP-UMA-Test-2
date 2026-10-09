/**
 * UMA Techno Fab Private Limited - ERP API Client
 * Connects Next.js frontend to Django REST Framework backend on PythonAnywhere.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://erpuma.pythonanywhere.com/api';

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

// Auto-authentication helper with Inflight Deduplication & Fast Failure Cooldown
let inflightAuthPromise: Promise<string | null> | null = null;
let lastAuthFailureTime = 0;
const AUTH_FAILURE_COOLDOWN_MS = 30000; // 30s cooldown on login failure to prevent hammering backend

async function getOrRefreshToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('access_token');
  if (token) return token;

  // Don't hammer backend repeatedly if recent attempt failed
  if (Date.now() - lastAuthFailureTime < AUTH_FAILURE_COOLDOWN_MS) {
    return null;
  }

  // Deduplicate concurrent authentication requests
  if (inflightAuthPromise) {
    return inflightAuthPromise;
  }

  inflightAuthPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.access) {
          localStorage.setItem('access_token', data.access);
          if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
          return data.access;
        }
      } else {
        lastAuthFailureTime = Date.now();
      }
    } catch (err) {
      console.warn('Auto-authentication failed:', err);
      lastAuthFailureTime = Date.now();
    } finally {
      inflightAuthPromise = null;
    }
    return null;
  })();

  return inflightAuthPromise;
}

function normalizePayload(endpoint: string, body: any, method = 'POST'): any {
  if (!body || typeof body !== 'object') return body;
  const d = { ...body };
  const ep = endpoint.toLowerCase();
  const nowStr = new Date().toISOString().split('T')[0];
  const isPatchOrPut = method === 'PATCH' || method === 'PUT';

  // Only assign fallback ID for POST (creation) requests, NEVER for PATCH/PUT updates!
  if (!isPatchOrPut) {
    d.id = d.id || d.salesOrderNumber || d.sales_order_number || d.code || d.departmentCode || d.department_code || d.leadNumber || d.leadNo || d.customerCode || d.enquiryNo || d.opportunityNo || d.quotationNumber || d.poNumber || d.soNumber || d.job_number || d.designJobNumber || d.bomNumber || d.supplierCode || d.vendorCode || d.requisitionNumber || d.rfqNumber || d.itemCode || d.warehouseCode || d.grnNumber || d.inspectionNumber || d.issueNumber || d.transferNumber || d.workCenterCode || d.planNumber || d.workOrderNumber || d.assetCode || d.requestNumber || d.designationCode || d.leaveNumber || d.loanNumber || d.invoiceNumber || d.receiptNumber || d.paymentNumber || d.expenseNumber || `DOC-${Date.now().toString().slice(-6)}`;
  }

  // Organization & Employees
  if (ep.includes('/departments')) {
    d.code = d.code || d.departmentCode || d.department_code || d.id || 'DEPT';
    d.name = d.name || d.departmentName || d.code;
  } else if (ep.includes('/roles')) {
    d.id = d.id || d.code || d.roleCode || `ROLE-${Date.now().toString().slice(-4)}`;
    d.role_code = d.role_code || d.roleCode || d.code || d.id;
    d.name = d.name || 'Role';
    d.department = d.department || 'Production';
  } else if (ep.includes('/employees')) {
    d.username = d.username || (d.email ? d.email.split('@')[0] : (d.employeeId || d.id || `emp_${Date.now()}`));
    d.employee_id = d.employee_id || d.employeeId || d.id || `EMP-${Date.now().toString().slice(-4)}`;
    d.first_name = d.first_name || d.firstName || 'First';
    d.last_name = d.last_name || d.lastName || 'Last';
    d.email = d.email || `${d.username}@umaerp.com`;
  }
  // CRM
  else if (ep.includes('/leads')) {
    d.lead_no = d.lead_no || d.leadNo || d.id;
    d.leadNo = d.lead_no;
    d.company_name = d.company_name || d.companyName || 'Prospect Co';
    d.companyName = d.company_name;
    d.contact_person = d.contact_person || d.contactPerson || 'Contact';
    d.contactPerson = d.contact_person;
    d.product_name = d.product_name || d.productName || d.requirementDescription || 'Equipment';
    d.productName = d.product_name;
    d.mobile = d.mobile || d.phone || '9999999999';
    d.alt_mobile = d.alt_mobile || d.altMobile || '';
    d.machine_type = d.machine_type || d.machineType || '';
    d.requirement_description = d.requirement_description || d.requirementDescription || '';
    d.expected_delivery = d.expected_delivery || d.expectedDelivery || null;
    d.next_follow_up_date = d.next_follow_up_date || d.nextFollowUpDate || null;
    d.assigned_sales_person_id = d.assigned_sales_person_id || d.assignedSalesPersonId || '';
    d.assigned_sales_person_name = d.assigned_sales_person_name || d.assignedSalesPersonName || '';
    d.created_date = d.created_date || d.createdDate || nowStr;
  } else if (ep.includes('/customers')) {
    d.companyName = d.companyName || d.company_name || d.name || '';
    d.contactPerson = d.contactPerson || d.contact_person || d.name || '';
    d.mobile = d.mobile || d.phone || '';
  } else if (ep.includes('/enquiries')) {
    d.customerId = d.customerId || d.customer_id || '';
    d.customerName = d.customerName || d.customer_name || '';
    d.requirement = d.requirement || d.title || d.specification || '';
    d.machineProduct = d.machineProduct || d.productName || '';
    d.date = d.date || d.enquiryDate || nowStr;
  } else if (ep.includes('/opportunities')) {
    d.customerId = d.customerId || d.customer_id || '';
    d.customerName = d.customerName || d.customer_name || '';
    d.machineProduct = d.machineProduct || d.productName || d.title || '';
    d.expectedValue = d.expectedValue || d.estimatedValue || 0;
  } else if (ep.includes('/sales-orders')) {
    if (d.salesOrderNumber || d.sales_order_number || d.soNumber) {
      d.sales_order_number = d.sales_order_number || d.salesOrderNumber || d.soNumber;
      d.salesOrderNumber = d.sales_order_number;
    }
    if (!isPatchOrPut && !d.id && d.sales_order_number) {
      d.id = d.sales_order_number;
    }
    if (d.deliveryDate && !d.target_delivery_date) {
      d.target_delivery_date = d.deliveryDate;
    }
    if (d.orderValue !== undefined && d.grand_total === undefined) {
      d.grand_total = Number(d.orderValue);
      d.total_amount = Number(d.orderValue);
    }
  } else if (ep.includes('/customer-pos')) {
    if (d.poNumber || d.po_number) {
      d.po_number = d.po_number || d.poNumber;
      d.poNumber = d.po_number;
    }
    if (!isPatchOrPut && !d.id && d.po_number) {
      d.id = d.po_number;
    }
    if (d.poAmount !== undefined && d.po_value === undefined) {
      d.po_value = Number(d.poAmount);
    }
  }
  // Projects
  else if (ep.includes('/projects')) {
    d.customerId = d.customerId || d.customer_id || '';
    d.customer_id = d.customerId;
    const resolvedCustName = d.customerName || d.customer_name || d.client_name || d.clientName || '';
    if (resolvedCustName && resolvedCustName !== 'Customer') {
      d.customerName = resolvedCustName;
      d.customer_name = resolvedCustName;
    } else {
      d.customerName = d.customerName || d.customer_name || 'Customer';
      d.customer_name = d.customerName;
    }
    const resolvedProdName = d.productName || d.product_name || d.title || d.machineProduct || d.machine_product || '';
    if (resolvedProdName && resolvedProdName !== 'Project Work') {
      d.productName = resolvedProdName;
      d.product_name = resolvedProdName;
    } else {
      d.productName = d.productName || d.product_name || d.title || 'Process Equipment';
      d.product_name = d.productName;
    }
    d.startDate = d.startDate || d.start_date || nowStr;
    d.start_date = d.startDate;
    d.targetDeliveryDate = d.targetDeliveryDate || d.target_delivery_date || d.deliveryDate || d.delivery_date || nowStr;
    d.target_delivery_date = d.targetDeliveryDate;
    if (d.projectNumber || d.project_number) {
      d.projectNumber = d.projectNumber || d.project_number;
      d.project_number = d.projectNumber;
    }
    if (d.jobNumber || d.job_number) {
      d.jobNumber = d.jobNumber || d.job_number;
      d.job_number = d.jobNumber;
    }
    if (d.salesOrderId || d.sales_order_id) {
      d.salesOrderId = d.salesOrderId || d.sales_order_id;
      d.sales_order_id = d.salesOrderId;
    }
    if (d.salesOrderNumber || d.sales_order_number) {
      d.salesOrderNumber = d.salesOrderNumber || d.sales_order_number;
      d.sales_order_number = d.salesOrderNumber;
    }
    if (d.customerPoNumber || d.customer_po_number) {
      d.customerPoNumber = d.customerPoNumber || d.customer_po_number;
      d.customer_po_number = d.customerPoNumber;
    }
  }
  // Purchase
  else if (ep.includes('/suppliers')) {
    d.vendorCode = d.vendorCode || d.supplierCode || d.code || d.id || '';
    d.contactPerson = d.contactPerson || d.contact_person || d.name || 'Vendor Rep';
    d.mobile = d.mobile || d.phone || '9999999999';
  } else if (ep.includes('/rfqs')) {
    const due = new Date();
    due.setDate(due.getDate() + 7);
    d.dueDate = d.dueDate || d.due_date || due.toISOString().split('T')[0];
    d.rfqNumber = d.rfqNumber || d.rfq_number || d.id || `RFQ-2026-${Date.now().toString().slice(-4)}`;
    d.rfq_number = d.rfqNumber;
    d.rfqDate = d.rfqDate || d.date || nowStr;
    d.date = d.rfqDate;
  } else if (ep.includes('/supplier-quotations')) {
    d.quotationNumber = d.quotationNumber || d.quotation_number || d.id || `SQ-2026-${Date.now().toString().slice(-4)}`;
    d.quotation_number = d.quotationNumber;
    d.supplierId = d.supplierId || d.supplier_id || '';
    d.supplier_id = d.supplierId;
    d.supplierName = d.supplierName || d.supplier_name || 'Supplier';
    d.supplier_name = d.supplierName;
    d.date = d.date || d.quotationDate || nowStr;
    d.quotationDate = d.quotationDate || d.date || nowStr;
    d.valid_until = d.valid_until || d.validityDate || d.validUntil || nowStr;
    d.validityDate = d.validityDate || d.valid_until || d.validUntil || nowStr;
    d.validUntil = d.validUntil || d.valid_until || d.validityDate || nowStr;
  } else if (ep.includes('/purchase-orders')) {
    const deliv = new Date();
    deliv.setDate(deliv.getDate() + 14);
    d.poNumber = d.poNumber || d.po_number || d.id || `PO-2026-${Date.now().toString().slice(-4)}`;
    d.po_number = d.poNumber;
    d.supplierId = d.supplierId || d.supplier_id || '';
    d.supplier_id = d.supplierId;
    d.supplierName = d.supplierName || d.supplier_name || 'Supplier';
    d.supplier_name = d.supplierName;
    d.deliveryDate = d.deliveryDate || d.delivery_date || deliv.toISOString().split('T')[0];
    d.preparedBy = d.preparedBy || d.prepared_by || 'Purchase Officer';
    d.date = d.date || d.poDate || nowStr;
  } else if (ep.includes('/purchase-returns')) {
    d.returnNumber = d.returnNumber || d.return_number || d.id || `PRT-2026-${Date.now().toString().slice(-4)}`;
    d.return_number = d.returnNumber;
    d.supplierId = d.supplierId || d.supplier_id || '';
    d.supplier_name = d.supplierName || d.supplier_name || 'Supplier';
    d.reason = d.reason || 'Quality Rejection';
    d.date = d.date || d.returnDate || nowStr;
  }
  // Store
  else if (ep.includes('/grns')) {
    d.grnNumber = d.grnNumber || d.grn_number || d.id || `GRN-2026-${Date.now().toString().slice(-4)}`;
    d.grn_number = d.grnNumber;
    d.id = d.id || d.grnNumber;
    d.date = d.date || d.grnDate || d.receiptDate || nowStr;
    d.po_id = d.po_id || d.poId || '';
    d.po_number = d.po_number || d.poNumber || '';
    d.supplier_id = d.supplier_id || d.supplierId || '';
    d.supplier_name = d.supplier_name || d.supplierName || 'Supplier';
    d.challan_number = d.challan_number || d.deliveryChallanNumber || d.challanNumber || '';
    d.invoice_number = d.invoice_number || d.invoiceNumber || '';
    d.vehicle_number = d.vehicle_number || d.vehicleNumber || '';
    d.warehouse_id = d.warehouse_id || d.warehouseId || '';
    d.received_by = d.received_by || d.receivedBy || 'Store Officer';
    d.items = d.items || [];
  } else if (ep.includes('/warehouses')) {
    d.warehouseCode = d.warehouseCode || d.warehouse_code || d.code || d.id || 'WH-001';
    d.warehouse_code = d.warehouseCode;
    d.name = d.name || 'Main Warehouse';
  } else if (ep.includes('/qc-inspections')) {
    d.grnId = d.grnId || d.grn_id || 'GRN-001';
    d.grnNumber = d.grnNumber || d.grn_number || 'GRN-2026-0001';
    d.date = d.date || d.inspectionDate || nowStr;
  } else if (ep.includes('/material-issues')) {
    d.id = d.id || d.issueNumber || d.issue_number || `ISS-2026-${Date.now().toString().slice(-4)}`;
    d.issue_number = d.issue_number || d.issueNumber || d.id;
    d.issueNumber = d.issue_number;
    d.issue_date = d.issue_date || d.issueDate || d.date || nowStr;
    d.issueDate = d.issue_date;
    d.project_id = d.project_id || d.projectId || 'PRJ-2026-0001';
    d.projectId = d.project_id;
    d.job_number = d.job_number || d.jobId || d.jobNumber || '';
    d.jobId = d.job_number;
    d.work_order_id = d.work_order_id || d.workOrderNumber || d.workOrderId || '';
    d.workOrderNumber = d.work_order_id;
    d.bom_number = d.bom_number || d.bomNumber || '';
    d.bomNumber = d.bom_number;
    d.bom_revision = d.bom_revision || d.bomRevision || 'Rev-01';
    d.bomRevision = d.bom_revision;
    d.production_stage = d.production_stage || d.productionStage || 'Shell & Dish End Cutting / Rolling';
    d.productionStage = d.production_stage;
    d.department = d.department || 'Production';
    d.issued_to = d.issued_to || d.requestedBy || 'Bhavin Shah (Production Head)';
    d.requestedBy = d.issued_to;
    d.issued_by = d.issued_by || d.issuedBy || 'Hitesh Rawal (Store Incharge)';
    d.issuedBy = d.issued_by;
    d.warehouse_id = d.warehouse_id || d.warehouseId || 'WH-001';
    d.warehouseId = d.warehouse_id;
    d.warehouse_name = d.warehouse_name || d.warehouseName || 'Main Raw Material Warehouse';
    d.warehouseName = d.warehouse_name;
    d.total_issue_value = Number(d.total_issue_value ?? d.totalIssueValue ?? 0);
    d.totalIssueValue = d.total_issue_value;
    d.notes = d.notes || d.remarks || '';
    d.remarks = d.notes;
    d.status = d.status || 'Fully Issued';
    d.items = d.items || [];
  } else if (ep.includes('/material-returns')) {
    d.id = d.id || d.returnNumber || d.return_number || `RET-2026-${Date.now().toString().slice(-4)}`;
    d.return_number = d.return_number || d.returnNumber || d.id;
    d.returnNumber = d.return_number;
    d.return_date = d.return_date || d.returnDate || d.date || nowStr;
    d.returnDate = d.return_date;
    d.project_id = d.project_id || d.projectId || 'PRJ-2026-0001';
    d.projectId = d.project_id;
    d.job_number = d.job_number || d.jobId || d.jobNumber || '';
    d.jobId = d.job_number;
    d.work_order_number = d.work_order_number || d.workOrderNumber || '';
    d.workOrderNumber = d.work_order_number;
    d.material_issue_number = d.material_issue_number || d.materialIssueNumber || '';
    d.materialIssueNumber = d.material_issue_number;
    d.department = d.department || 'Production';
    d.returned_by = d.returned_by || d.returnedBy || 'Shop Floor Supervisor';
    d.returnedBy = d.returned_by;
    d.received_by = d.received_by || d.receivedBy || 'Hitesh Rawal (Store Incharge)';
    d.receivedBy = d.received_by;
    d.warehouse_id = d.warehouse_id || d.warehouseId || 'WH-001';
    d.warehouseId = d.warehouse_id;
    d.warehouse_name = d.warehouse_name || d.warehouseName || 'Main Raw Material Warehouse';
    d.warehouseName = d.warehouse_name;
    d.total_return_value = Number(d.total_return_value ?? d.totalReturnValue ?? 0);
    d.totalReturnValue = d.total_return_value;
    d.notes = d.notes || d.remarks || '';
    d.remarks = d.notes;
    d.status = d.status || 'Completed';
    d.items = d.items || [];
  }
  // Production
  else if (ep.includes('/work-centers')) {
    d.workCenterCode = d.workCenterCode || d.center_code || d.code || d.id || 'WC-001';
    d.workCenterName = d.workCenterName || d.name || 'Work Center';
  } else if (ep.includes('/production-plans')) {
    d.planNumber = d.planNumber || d.plan_number || d.id || `PP-2026-${Date.now().toString().slice(-4)}`;
    d.plan_number = d.planNumber;
  }
  // Maintenance
  else if (ep.includes('/internal-assets')) {
    d.assetName = d.assetName || d.name || 'Industrial Asset';
    d.assetCode = d.assetCode || d.asset_code || d.code || d.id || 'AST-001';
  } else if (ep.includes('/service-requests')) {
    d.requestNumber = d.requestNumber || d.request_number || d.id || `SR-2026-${Date.now().toString().slice(-4)}`;
    d.request_number = d.requestNumber;
    d.requestDate = d.requestDate || d.date || nowStr;
    d.customerName = d.customerName || d.client_name || d.assetName || 'Client';
  } else if (ep.includes('/pm-plans')) {
    d.planNumber = d.planNumber || d.plan_number || d.id || `PM-2026-${Date.now().toString().slice(-4)}`;
    d.plan_number = d.planNumber;
    d.startDate = d.startDate || nowStr;
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + 30);
    d.nextDueDate = d.nextDueDate || nextDue.toISOString().split('T')[0];
  }
  // HR
  else if (ep.includes('/designations')) {
    d.designationCode = d.designationCode || d.code || d.id || 'DES-001';
    d.designationName = d.designationName || d.name || 'Designation';
  } else if (ep.includes('/leave-requests')) {
    d.id = d.id || d.leaveNumber || `LV-${Date.now().toString().slice(-4)}`;
    d.leaveNumber = d.id;
    d.employeeId = d.employeeId || d.employee_id || 'EMP-001';
    d.department = d.department || 'General';
    d.leaveName = d.leaveName || d.leaveType || 'Casual Leave';
    d.appliedDate = d.appliedDate || d.date || nowStr;
    d.fromDate = d.fromDate || d.startDate || nowStr;
    d.toDate = d.toDate || d.endDate || nowStr;
    d.reason = d.reason || 'Personal / Sick Leave';
  } else if (ep.includes('/advance-loans') || ep.includes('/employee-advances')) {
    d.id = d.id || d.loanNumber || `ADV-${Date.now().toString().slice(-4)}`;
    d.loanNumber = d.id;
    d.employeeId = d.employeeId || d.employee_id || 'EMP-001';
    d.department = d.department || 'General';
    d.disbursementDate = d.disbursementDate || nowStr;
  } else if (ep.includes('/employee-onboardings')) {
    d.id = d.id || `ONB-${Date.now().toString().slice(-4)}`;
    d.designation = d.designation || d.position || 'Staff';
    d.department = d.department || 'Production';
    d.joiningDate = d.joiningDate || d.joining_date || nowStr;
  } else if (ep.includes('/employee-exits')) {
    d.id = d.id || `EXIT-${Date.now().toString().slice(-4)}`;
    d.employeeId = d.employeeId || d.employee_id || 'EMP-001';
    d.department = d.department || 'General';
    d.designation = d.designation || 'Staff';
    d.reason = d.reason || 'Career Growth / Personal';
    d.lastWorkingDate = d.lastWorkingDate || d.resignationDate || nowStr;
  }
  // Accounting
  else if (ep.includes('/sales-invoices')) {
    const due = new Date();
    due.setDate(due.getDate() + 30);
    d.invoiceNumber = d.invoiceNumber || d.invoice_number || d.id || `INV-2026-${Date.now().toString().slice(-4)}`;
    d.invoice_number = d.invoiceNumber;
    d.invoiceDate = d.invoiceDate || d.date || nowStr;
    d.date = d.invoiceDate;
    d.dueDate = d.dueDate || due.toISOString().split('T')[0];
    d.customerId = d.customerId || d.customer_id || '';
    d.customerName = d.customerName || d.customer_name || '';
  } else if (ep.includes('/purchase-invoices')) {
    const due = new Date();
    due.setDate(due.getDate() + 30);
    d.invoiceNumber = d.invoiceNumber || d.invoice_number || d.id || `PINV-2026-${Date.now().toString().slice(-4)}`;
    d.invoice_number = d.invoiceNumber;
    d.invoiceDate = d.invoiceDate || d.date || nowStr;
    d.date = d.invoiceDate;
    d.dueDate = d.dueDate || due.toISOString().split('T')[0];
    d.supplierId = d.supplierId || d.supplier_id || '';
    d.supplierName = d.supplierName || d.supplier_name || '';
  } else if (ep.includes('/customer-receipts')) {
    d.receiptNumber = d.receiptNumber || d.receipt_number || d.id || `REC-2026-${Date.now().toString().slice(-4)}`;
    d.receipt_number = d.receiptNumber;
    d.receiptDate = d.receiptDate || d.date || nowStr;
    d.date = d.receiptDate;
    d.customerId = d.customerId || d.customer_id || '';
    d.customerName = d.customerName || d.customer_name || '';
  } else if (ep.includes('/supplier-payments')) {
    d.paymentNumber = d.paymentNumber || d.payment_number || d.id || `PAY-2026-${Date.now().toString().slice(-4)}`;
    d.payment_number = d.paymentNumber;
    d.paymentDate = d.paymentDate || d.date || nowStr;
    d.date = d.paymentDate;
    d.supplierId = d.supplierId || d.supplier_id || '';
    d.supplierName = d.supplierName || d.supplier_name || '';
  } else if (ep.includes('/expense-entries') || ep.includes('/expenses')) {
    d.expenseNumber = d.expenseNumber || d.expense_number || d.id || `EXP-2026-${Date.now().toString().slice(-4)}`;
    d.expense_number = d.expenseNumber;
    d.expenseDate = d.expenseDate || d.date || nowStr;
    d.date = d.expenseDate;
    d.category = d.category || 'General';
  }
  // Production Module Normalization
  else if (ep.includes('/production-schedules')) {
    d.scheduleNumber = d.scheduleNumber || d.schedule_number || d.id || `SCH-2026-${Date.now().toString().slice(-4)}`;
    d.schedule_number = d.scheduleNumber;
    d.job_number = d.jobNumber || d.job_number || d.jobId || '';
    d.work_order_number = d.workOrderNumber || d.work_order_number || d.woNum || '';
    d.operation_name = d.operationName || d.operation_name || d.opName || 'Operation';
    d.work_center_code = d.workCenterCode || d.work_center_code || d.wcCode || '';
    d.work_center_name = d.workCenterName || d.work_center_name || '';
    d.assigned_operator = d.assignedOperator || d.assigned_operator || d.operator || '';
  } else if (ep.includes('/production-entries')) {
    d.productionEntryNumber = d.productionEntryNumber || d.production_entry_number || d.id || `PENTRY-2026-${Date.now().toString().slice(-4)}`;
    d.production_entry_number = d.productionEntryNumber;
    d.entry_date = d.entryDate || d.entry_date || nowStr;
    d.job_number = d.jobNumber || d.job_number || d.jobId || '';
    d.work_order_number = d.workOrderNumber || d.work_order_number || '';
    d.operation_name = d.operationName || d.operation_name || 'Production Operation';
    d.operator_name = d.operatorName || d.operator_name || d.operator || 'Operator';
    d.produced_quantity = d.producedQuantity !== undefined ? d.producedQuantity : (d.produced_quantity || 0);
    d.rejected_quantity = d.rejectedQuantity !== undefined ? d.rejectedQuantity : (d.rejected_quantity || 0);
    d.rework_quantity = d.reworkQuantity !== undefined ? d.reworkQuantity : (d.rework_quantity || 0);
    d.scrap_quantity = d.scrapQuantity !== undefined ? d.scrapQuantity : (d.scrap_quantity || 0);
    d.good_quantity = d.goodQuantity !== undefined ? d.goodQuantity : Math.max(0, Number(d.produced_quantity) - Number(d.rejected_quantity) - Number(d.scrap_quantity));
  } else if (ep.includes('/rework-orders')) {
    d.reworkNumber = d.reworkNumber || d.rework_number || d.id || `RWK-2026-${Date.now().toString().slice(-4)}`;
    d.rework_number = d.reworkNumber;
    d.job_number = d.jobNumber || d.job_number || d.jobId || '';
    d.work_order_number = d.workOrderNumber || d.work_order_number || '';
    d.item_code = d.itemCode || d.item_code || 'ITEM-001';
    d.item_name = d.itemName || d.item_name || 'Component';
    d.start_date = d.startDate || d.start_date || nowStr;
    d.assigned_operator = d.assignedOperator || d.assigned_operator || d.operator || '';
    d.rework_instructions = d.reworkInstructions || d.rework_instructions || d.instructions || '';
  } else if (ep.includes('/production-scraps')) {
    d.scrapNumber = d.scrapNumber || d.scrap_number || d.id || `PSCRAP-2026-${Date.now().toString().slice(-4)}`;
    d.scrap_number = d.scrapNumber;
    d.entry_date = d.entryDate || d.entry_date || nowStr;
    d.job_number = d.jobNumber || d.job_number || d.jobId || '';
    d.work_order_number = d.workOrderNumber || d.work_order_number || '';
    d.material_code = d.materialCode || d.material_code || 'SCRAP-001';
    d.material_name = d.materialName || d.material_name || 'Scrap Material';
    d.scrap_type = d.scrapType || d.scrap_type || 'Cutting Scrap';
    d.operator_name = d.operatorName || d.operator_name || d.operator || '';
  } else if (ep.includes('/routing-operations')) {
    d.id = d.id || `OP-${(d.operationNumber || d.sequence || 1) * 10}`;
    d.operation_number = d.operationNumber !== undefined ? d.operationNumber : (d.operation_number || 10);
    d.operation_name = d.operationName || d.operation_name || 'Routing Operation';
    d.sequence = d.sequence !== undefined ? d.sequence : (d.sequence_number || 1);
    d.work_center_code = d.workCenterCode || d.work_center_code || '';
    d.work_center_name = d.workCenterName || d.work_center_name || '';
    d.machine_name = d.machineName || d.machine_name || '';
    d.department = d.department || 'Production';
    d.planned_setup_minutes = d.plannedSetupMinutes !== undefined ? d.plannedSetupMinutes : (d.planned_setup_minutes || 0);
    d.planned_processing_minutes = d.plannedProcessingMinutes !== undefined ? d.plannedProcessingMinutes : (d.planned_processing_minutes || 0);
    d.total_planned_minutes = d.totalPlannedMinutes !== undefined ? d.totalPlannedMinutes : (Number(d.planned_setup_minutes) + Number(d.planned_processing_minutes));
    d.assigned_operator = d.assignedOperator || d.assigned_operator || '';
    d.qc_required = d.qcRequired !== undefined ? d.qcRequired : (d.qc_required !== undefined ? d.qc_required : true);
    d.instructions = d.instructions || '';
    d.status = d.status || 'Ready';
  } else if (ep.includes('/production-holds')) {
    d.holdNumber = d.holdNumber || d.hold_number || d.id || `HLD-2026-${Date.now().toString().slice(-4)}`;
    d.hold_number = d.holdNumber;
    d.job_number = d.jobNumber || d.job_number || d.jobId || '';
    d.work_order_number = d.workOrderNumber || d.work_order_number || '';
    d.operation_name = d.operationName || d.operation_name || 'Fitting & Assembly';
    d.reason = d.reason || 'Material Shortage';
    d.description = d.description || '';
    d.start_date = d.startDate || d.start_date || nowStr;
    d.expected_resume_date = d.expectedResumeDate || d.expected_resume_date || null;
    d.approved_by = d.approvedBy || d.approved_by || 'Production Manager';
    d.status = d.status || 'Active Hold';
  } else if (ep.includes('/material-issues')) {
    d.issueNumber = d.issueNumber || d.issue_number || d.id || `ISS-2026-${Date.now().toString().slice(-4)}`;
    d.issue_number = d.issueNumber;
    d.job_number = d.jobNumber || d.job_number || d.jobId || '';
    d.work_order_id = d.workOrderNumber || d.work_order_id || d.workOrderId || '';
    d.issued_to = d.issuedTo || d.issued_to || d.requestedBy || 'Production Head';
    d.issue_date = d.issueDate || d.issue_date || nowStr;
  }
  return d;
}

// High-performance API cache & request deduplication store
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const memoryCache = new Map<string, CacheEntry<any>>();
const inflightRequests = new Map<string, Promise<any>>();

// Cache TTL: 30 seconds fresh, 5 minutes stale-while-revalidate
const FRESH_TTL_MS = 30 * 1000;
const STALE_TTL_MS = 5 * 60 * 1000;

export function invalidateApiCache(endpointPrefix?: string) {
  if (!endpointPrefix) {
    memoryCache.clear();
    return;
  }
  const prefix = endpointPrefix.toLowerCase();
  for (const key of memoryCache.keys()) {
    if (key.toLowerCase().includes(prefix)) {
      memoryCache.delete(key);
    }
  }
  if (typeof window !== 'undefined') {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('UMA_CACHE_') && key.toLowerCase().includes(prefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (_) {}
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const cacheKey = `GET:${endpoint}`;

  // 1. Invalidate cache on mutations (POST, PUT, PATCH, DELETE)
  if (method !== 'GET') {
    const basePrefix = endpoint.split('/')[1] || endpoint;
    invalidateApiCache(basePrefix);
  }

  // 2. High-speed cache lookup for GET requests
  if (method === 'GET' && !options.headers) {
    // Check in-memory cache first (instant 0ms)
    const memCached = memoryCache.get(cacheKey);
    const now = Date.now();

    if (memCached) {
      const age = now - memCached.timestamp;
      if (age < FRESH_TTL_MS) {
        return memCached.data as T;
      }
      // If stale but within 5 mins, return cached instantly and revalidate in background
      if (age < STALE_TTL_MS) {
        // Trigger background revalidation
        fetchNetworkRequest<T>(url, endpoint, options, cacheKey).catch(() => {});
        return memCached.data as T;
      }
    }

    // Check localStorage fallback for offline/cold-start instant recovery (instant 0ms)
    if (typeof window !== 'undefined') {
      try {
        const localRaw = localStorage.getItem(`UMA_CACHE_${cacheKey}`);
        if (localRaw) {
          const parsed = JSON.parse(localRaw) as CacheEntry<T>;
          if (parsed && parsed.data !== undefined) {
            memoryCache.set(cacheKey, parsed);
            // If stale, trigger background revalidation silently
            if (now - parsed.timestamp >= FRESH_TTL_MS) {
              fetchNetworkRequest<T>(url, endpoint, options, cacheKey).catch(() => {});
            }
            return parsed.data;
          }
        }
      } catch (_) {}
    }

    // Inflight Request Deduplication: avoid duplicate network requests for same endpoint
    if (inflightRequests.has(cacheKey)) {
      return inflightRequests.get(cacheKey)! as Promise<T>;
    }
  }

  // 3. Execute network request
  const fetchPromise = fetchNetworkRequest<T>(url, endpoint, options, method === 'GET' ? cacheKey : undefined);

  if (method === 'GET') {
    inflightRequests.set(cacheKey, fetchPromise);
    fetchPromise
      .finally(() => inflightRequests.delete(cacheKey))
      .catch(() => {});
  }

  return fetchPromise;
}

async function fetchNetworkRequest<T>(
  url: string,
  endpoint: string,
  options: RequestInit,
  cacheKey?: string
): Promise<T> {
  let token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!token && typeof window !== 'undefined') {
    // For non-GET requests (mutations), await authentication token
    if (options.method && options.method !== 'GET') {
      token = await getOrRefreshToken();
    } else {
      // For GET requests, trigger background login without blocking data fetch
      getOrRefreshToken().catch(() => {});
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let body = options.body;
  if (body && typeof body === 'string' && (options.method === 'POST' || options.method === 'PATCH' || options.method === 'PUT')) {
    try {
      const parsed = JSON.parse(body);
      const normalized = normalizePayload(endpoint, parsed, (options.method || 'GET').toUpperCase());
      body = JSON.stringify(normalized);
    } catch (_) {}
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      body,
      headers,
    });
  } catch (netErr: any) {
    // Network failure (Django backend offline, connection refused, CORS, network down)
    console.warn(`[apiClient] Network request failed for ${url}:`, netErr?.message || netErr);

    // If cached data exists in localStorage, return it as offline recovery
    if (cacheKey && typeof window !== 'undefined') {
      try {
        const localRaw = localStorage.getItem(`UMA_CACHE_${cacheKey}`);
        if (localRaw) {
          const parsed = JSON.parse(localRaw) as CacheEntry<T>;
          if (parsed && parsed.data !== undefined) {
            return parsed.data;
          }
        }
      } catch (_) {}
    }

    // For GET list endpoints, return empty array fallback to prevent UI crash when backend is offline
    const method = (options.method || 'GET').toUpperCase();
    if (method === 'GET' && (endpoint.endsWith('/') || endpoint.includes('list'))) {
      return [] as unknown as T;
    }

    throw new ApiError(
      0,
      `Backend unreachable at ${url}. Please ensure Django server is running (python manage.py runserver 8000).`,
      netErr
    );
  }

  // If 401, attempt token refresh/re-login once and retry
  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    const newToken = await getOrRefreshToken();
    if (newToken) {
      try {
        response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
      } catch (_) {}
    }
  }

  if (!response.ok) {
    let errData: any;
    try {
      const text = await response.text();
      try {
        errData = JSON.parse(text);
      } catch {
        errData = text;
      }
    } catch {
      errData = 'Unknown error';
    }
    throw new ApiError(response.status, `API Error: ${response.status} ${response.statusText}`, errData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  let resultData: any;
  try {
    const json = await response.json();
    resultData = (json && typeof json === 'object' && Array.isArray(json.results)) ? json.results : json;
  } catch (err) {
    console.warn(`Failed to parse JSON response from ${endpoint}:`, err);
    resultData = {} as T;
  }

  // Store in cache for GET requests
  if (cacheKey && typeof window !== 'undefined') {
    const entry: CacheEntry<T> = { data: resultData as T, timestamp: Date.now() };
    memoryCache.set(cacheKey, entry);
    try {
      localStorage.setItem(`UMA_CACHE_${cacheKey}`, JSON.stringify(entry));
    } catch (_) {}
  }

  return resultData as T;
}

export const api = {
  // Generic HTTP verbs
  get: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T = any>(endpoint: string, data?: any) =>
    request<T>(endpoint, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  put: <T = any>(endpoint: string, data?: any) =>
    request<T>(endpoint, { method: 'PUT', body: data ? JSON.stringify(data) : undefined }),
  patch: <T = any>(endpoint: string, data?: any) =>
    request<T>(endpoint, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
  delete: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
  invalidateCache: invalidateApiCache,

  // Authentication
  auth: {
    login: (credentials: { username?: string; email?: string; password: string }) =>
      request<{ access: string; refresh: string; user: any }>('/auth/login/', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    me: () => request<any>('/auth/me/'),
    changePassword: (data: { oldPassword: string; newPassword: string }) =>
      request<{ message: string }>('/auth/change-password/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Company Settings & Auto Numbering
  company: {
    get: () => request<any>('/company/'),
    update: (data: any) =>
      request<any>('/company/', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
  numbering: {
    list: () => request<any[]>('/numbering/'),
    nextNumber: (docType: string) =>
      request<{ nextNumber: string; prefix: string; currentNumber: number }>(
        `/numbering/next-number/?docType=${docType}`
      ),
  },

  // Organization
  departments: {
    list: () => request<any[]>('/departments/'),
    create: (data: any) => request<any>('/departments/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/departments/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/departments/${id}/`, { method: 'DELETE' }),
  },
  roles: {
    list: () => request<any[]>('/roles/'),
    create: (data: any) => request<any>('/roles/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/roles/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/roles/${id}/`, { method: 'DELETE' }),
  },
  employees: {
    list: () => request<any[]>('/employees/'),
    create: (data: any) => request<any>('/employees/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/employees/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/employees/${id}/`, { method: 'DELETE' }),
    resetPassword: (id: string, password: string) =>
      request<any>(`/employees/${id}/reset-password/`, { method: 'POST', body: JSON.stringify({ password }) }),
  },

  // CRM
  crm: {
    leads: {
      list: () => request<any[]>('/leads/'),
      get: (id: string) => request<any>(`/leads/${id}/`),
      create: (data: any) => request<any>('/leads/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/leads/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/leads/${id}/`, { method: 'DELETE' }),
      convert: (id: string) => request<any>(`/leads/${id}/convert/`, { method: 'POST' }),
    },
    customers: {
      list: () => request<any[]>('/customers/'),
      get: (id: string) => request<any>(`/customers/${id}/`),
      create: (data: any) => request<any>('/customers/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/customers/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/customers/${id}/`, { method: 'DELETE' }),
    },
    contacts: {
      list: () => request<any[]>('/contacts/'),
      create: (data: any) => request<any>('/contacts/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/contacts/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/contacts/${id}/`, { method: 'DELETE' }),
    },
    enquiries: {
      list: () => request<any[]>('/enquiries/'),
      create: (data: any) => request<any>('/enquiries/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/enquiries/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    },
    opportunities: {
      list: () => request<any[]>('/opportunities/'),
      create: (data: any) => request<any>('/opportunities/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/opportunities/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    },
    quotations: {
      list: () => request<any[]>('/quotations/'),
      create: (data: any) => request<any>('/quotations/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/quotations/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      addRevision: (id: string, data: any) => request<any>(`/quotations/${id}/add-revision/`, { method: 'POST', body: JSON.stringify(data) }),
      updateStatus: (id: string, data: { revisionNumber: string; status: string }) =>
        request<any>(`/quotations/${id}/update-status/`, { method: 'POST', body: JSON.stringify(data) }),
    },
    customerPos: {
      list: () => request<any[]>('/customer-pos/'),
      create: (data: any) => request<any>('/customer-pos/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/customer-pos/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      convertToSo: (id: string) => request<any>(`/customer-pos/${id}/convert-to-so/`, { method: 'POST' }),
    },
    salesOrders: {
      list: () => request<any[]>('/sales-orders/'),
      get: (id: string) => request<any>(`/sales-orders/${id}/`),
      create: (data: any) => request<any>('/sales-orders/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/sales-orders/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/sales-orders/${id}/`, { method: 'DELETE' }),
    },
    followUps: {
      list: async () => {
        try {
          return await request<any[]>('/followups/');
        } catch {
          return await request<any[]>('/crm/followups/');
        }
      },
      get: async (id: string) => {
        try {
          return await request<any>(`/followups/${id}/`);
        } catch {
          return await request<any>(`/crm/followups/${id}/`);
        }
      },
      create: async (data: any) => {
        try {
          return await request<any>('/followups/', { method: 'POST', body: JSON.stringify(data) });
        } catch {
          return await request<any>('/crm/followups/', { method: 'POST', body: JSON.stringify(data) });
        }
      },
      update: async (id: string, data: any) => {
        try {
          return await request<any>(`/followups/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
        } catch {
          return await request<any>(`/crm/followups/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
        }
      },
      delete: async (id: string) => {
        try {
          return await request<any>(`/followups/${id}/`, { method: 'DELETE' });
        } catch {
          return await request<any>(`/crm/followups/${id}/`, { method: 'DELETE' });
        }
      },
      complete: async (id: string, data: { notes?: string; nextDate?: string }) => {
        try {
          return await request<any>(`/followups/${id}/complete/`, { method: 'POST', body: JSON.stringify(data) });
        } catch {
          return await request<any>(`/crm/followups/${id}/complete/`, { method: 'POST', body: JSON.stringify(data) });
        }
      },
    },
    siteVisits: {
      list: async () => {
        try {
          return await request<any[]>('/visits/');
        } catch {
          return await request<any[]>('/crm/visits/');
        }
      },
      create: async (data: any) => {
        const payload = {
          ...data,
          id: data.id || data.visitNo,
          visit_no: data.visitNo || data.id,
          customer_id: data.customerId || '',
          customer_name: data.customerName || '',
          contact_person: data.contactPerson || '',
          contact_mobile: data.contactMobile || '',
          visit_date: data.visitDate || '',
          location: data.location || '',
          employee_id: data.employeeId || '',
          employee_name: data.employeeName || '',
          purpose: data.purpose || '',
          discussion_notes: data.discussionNotes || data.discussionSummary || '',
          requirement_details: data.requirementDetails || '',
          outcome: data.outcome || 'positive',
          next_action: data.nextAction || '',
          next_follow_up_date: data.nextFollowUpDate || '',
        };
        try {
          return await request<any>('/visits/', { method: 'POST', body: JSON.stringify(payload) });
        } catch {
          return await request<any>('/crm/visits/', { method: 'POST', body: JSON.stringify(payload) });
        }
      },
      update: async (id: string, data: any) => {
        const payload = {
          ...data,
          visit_no: data.visitNo || data.id || id,
          customer_id: data.customerId,
          customer_name: data.customerName,
          contact_person: data.contactPerson,
          contact_mobile: data.contactMobile,
          visit_date: data.visitDate,
          location: data.location,
          employee_id: data.employeeId,
          employee_name: data.employeeName,
          purpose: data.purpose,
          discussion_notes: data.discussionNotes || data.discussionSummary,
          requirement_details: data.requirementDetails,
          outcome: data.outcome,
          next_action: data.nextAction,
          next_follow_up_date: data.nextFollowUpDate,
        };
        try {
          return await request<any>(`/visits/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
        } catch {
          return await request<any>(`/crm/visits/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
        }
      },
      delete: async (id: string) => {
        try {
          return await request<any>(`/visits/${id}/`, { method: 'DELETE' });
        } catch {
          return await request<any>(`/crm/visits/${id}/`, { method: 'DELETE' });
        }
      },
    },
    exhibitions: {
      list: async () => {
        try {
          return await request<any[]>('/exhibitions/');
        } catch {
          return await request<any[]>('/crm/exhibitions/');
        }
      },
      create: async (data: any) => {
        const payload = {
          ...data,
          id: data.id || `EXPO-2026-${Date.now().toString().slice(-4)}`,
          expo_name: data.expoName || data.expo_name || 'Exhibition',
          organizer: data.organizer || '',
          location: data.location || '',
          start_date: data.startDate || data.start_date || '',
          end_date: data.endDate || data.end_date || '',
          stall_number: data.stallNumber || data.stall_number || '',
          contact_person: data.contactPerson || data.contact_person || '',
          budget: Number(data.budget) || 0,
          assigned_team: Array.isArray(data.assignedTeam) ? data.assignedTeam : (Array.isArray(data.assigned_team) ? data.assigned_team : []),
          products_displayed: data.productsDisplayed || data.products_displayed || '',
          notes: data.notes || '',
          total_contacts: Number(data.totalContacts) || Number(data.total_contacts) || 0,
          qualified_leads: Number(data.qualifiedLeads) || Number(data.qualified_leads) || 0,
          quotations_sent: Number(data.quotationsSent) || Number(data.quotations_sent) || 0,
          converted_customers: Number(data.convertedCustomers) || Number(data.converted_customers) || 0,
        };
        try {
          return await request<any>('/exhibitions/', { method: 'POST', body: JSON.stringify(payload) });
        } catch {
          return await request<any>('/crm/exhibitions/', { method: 'POST', body: JSON.stringify(payload) });
        }
      },
      update: async (id: string, data: any) => {
        const payload = {
          ...data,
          expo_name: data.expoName,
          start_date: data.startDate,
          end_date: data.endDate,
          stall_number: data.stallNumber,
          contact_person: data.contactPerson,
          budget: Number(data.budget),
          assigned_team: data.assignedTeam,
          products_displayed: data.productsDisplayed,
          total_contacts: Number(data.totalContacts),
          qualified_leads: Number(data.qualifiedLeads),
          quotations_sent: Number(data.quotationsSent),
          converted_customers: Number(data.convertedCustomers),
        };
        try {
          return await request<any>(`/exhibitions/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
        } catch {
          return await request<any>(`/crm/exhibitions/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
        }
      },
      delete: async (id: string) => {
        try {
          return await request<any>(`/exhibitions/${id}/`, { method: 'DELETE' });
        } catch {
          return await request<any>(`/crm/exhibitions/${id}/`, { method: 'DELETE' });
        }
      },
    },
  },

  // Project Management
  projects: {
    dashboardSummary: () => request<any>('/projects/dashboard-summary/'),
    list: () => request<any[]>('/projects/'),
    get: (id: string) => request<any>(`/projects/${id}/`),
    create: (data: any) => request<any>('/projects/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/projects/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/projects/${id}/`, { method: 'DELETE' }),
    planningStages: (projectId?: string) =>
      request<any[]>(projectId ? `/planning-stages/?projectId=${projectId}` : '/planning-stages/'),
    createPlanningStage: (data: any) =>
      request<any>('/planning-stages/', { method: 'POST', body: JSON.stringify(data) }),
    updatePlanningStage: (id: string, data: any) =>
      request<any>(`/planning-stages/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    deletePlanningStage: (id: string) =>
      request<any>(`/planning-stages/${id}/`, { method: 'DELETE' }),
    generatePlanningStages: (projectId: string) =>
      request<any>(`/projects/${projectId}/generate-stages/`, { method: 'POST' }),
    milestones: (projectId?: string) =>
      request<any[]>(projectId ? `/project-milestones/?projectId=${projectId}` : '/project-milestones/'),
    tasks: (projectId?: string) =>
      request<any[]>(projectId ? `/project-tasks/?projectId=${projectId}` : '/project-tasks/'),
    createTask: (data: any) => request<any>('/project-tasks/', { method: 'POST', body: JSON.stringify(data) }),
    updateTask: (id: string, data: any) => request<any>(`/project-tasks/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteTask: (id: string) => request<any>(`/project-tasks/${id}/`, { method: 'DELETE' }),
    departmentAssignments: (projectId?: string) =>
      request<any[]>(projectId ? `/department-assignments/?projectId=${projectId}` : '/department-assignments/'),
    createDepartmentAssignment: (data: any) =>
      request<any>('/department-assignments/', { method: 'POST', body: JSON.stringify(data) }),
    updateDepartmentAssignment: (id: string, data: any) =>
      request<any>(`/department-assignments/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteDepartmentAssignment: (id: string) =>
      request<any>(`/department-assignments/${id}/`, { method: 'DELETE' }),
    documents: (projectId?: string) =>
      request<any[]>(projectId ? `/project-documents/?projectId=${projectId}` : '/project-documents/'),
    createDocument: (data: any) =>
      request<any>('/project-documents/', { method: 'POST', body: JSON.stringify(data) }),
    deleteDocument: (id: string) =>
      request<any>(`/project-documents/${id}/`, { method: 'DELETE' }),
    changeRequests: (projectId?: string) =>
      request<any[]>(projectId ? `/change-requests/?projectId=${projectId}` : '/change-requests/'),
    createChangeRequest: (data: any) =>
      request<any>('/change-requests/', { method: 'POST', body: JSON.stringify(data) }),
    updateChangeRequest: (id: string, data: any) =>
      request<any>(`/change-requests/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteChangeRequest: (id: string) =>
      request<any>(`/change-requests/${id}/`, { method: 'DELETE' }),
  },

  // Design & Engineering
  designer: {
    jobs: {
      list: () => request<any[]>('/designer/jobs/'),
      create: (data: any) => request<any>('/designer/jobs/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/designer/jobs/${encodeURIComponent(id)}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      releaseToProduction: (id: string, data?: any) =>
        request<any>(`/designer/jobs/${encodeURIComponent(id)}/release-to-production/`, { method: 'POST', body: JSON.stringify(data || {}) }),
      revokeRelease: (id: string, data?: any) =>
        request<any>(`/designer/jobs/${encodeURIComponent(id)}/revoke-release/`, { method: 'POST', body: JSON.stringify(data || {}) }),
      approve: (id: string, data?: any) =>
        request<any>(`/designer/jobs/${encodeURIComponent(id)}/approve/`, { method: 'POST', body: JSON.stringify(data || {}) }),
      disapprove: (id: string, data?: any) =>
        request<any>(`/designer/jobs/${encodeURIComponent(id)}/disapprove/`, { method: 'POST', body: JSON.stringify(data || {}) }),
    },
    requirements: {
      list: () => request<any[]>('/designer/requirements/'),
      get: (id: string) => request<any>(`/designer/requirements/${id}/`),
      create: (data: any) => request<any>('/designer/requirements/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/designer/requirements/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/designer/requirements/${id}/`, { method: 'DELETE' }),
    },
    tasks: {
      list: async () => {
        try {
          return await request<any[]>('/designer/tasks/');
        } catch {
          try {
            return await request<any[]>('/designer/design-tasks/');
          } catch {
            return [];
          }
        }
      },
      get: async (id: string) => {
        try {
          return await request<any>(`/designer/tasks/${id}/`);
        } catch {
          try {
            return await request<any>(`/designer/design-tasks/${id}/`);
          } catch {
            return null;
          }
        }
      },
      create: async (data: any) => {
        try {
          return await request<any>('/designer/tasks/', { method: 'POST', body: JSON.stringify(data) });
        } catch {
          return await request<any>('/designer/design-tasks/', { method: 'POST', body: JSON.stringify(data) });
        }
      },
      update: async (id: string, data: any) => {
        try {
          return await request<any>(`/designer/tasks/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
        } catch {
          return await request<any>(`/designer/design-tasks/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
        }
      },
      delete: async (id: string) => {
        try {
          return await request<any>(`/designer/tasks/${id}/`, { method: 'DELETE' });
        } catch {
          return await request<any>(`/designer/design-tasks/${id}/`, { method: 'DELETE' });
        }
      },
    },
    drawings2d: () => request<any[]>('/designer/drawings-2d/'),
    models3d: () => request<any[]>('/designer/models-3d/'),
    boms: {
      list: () => request<any[]>('/designer/boms/'),
      create: (data: any) => request<any>('/designer/boms/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/designer/boms/${encodeURIComponent(id)}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    },
    technicalDocuments: {
      list: async () => {
        try {
          return await request<any[]>('/designer/technical-documents/');
        } catch {
          try {
            return await request<any[]>('/technical-documents/');
          } catch {
            return [];
          }
        }
      },
      get: async (id: string) => {
        try {
          return await request<any>(`/designer/technical-documents/${id}/`);
        } catch {
          try {
            return await request<any>(`/technical-documents/${id}/`);
          } catch {
            return null;
          }
        }
      },
      create: async (data: any) => {
        try {
          return await request<any>('/designer/technical-documents/', { method: 'POST', body: JSON.stringify(data) });
        } catch {
          return await request<any>('/technical-documents/', { method: 'POST', body: JSON.stringify(data) });
        }
      },
      update: async (id: string, data: any) => {
        try {
          return await request<any>(`/designer/technical-documents/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
        } catch {
          return await request<any>(`/technical-documents/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
        }
      },
      delete: async (id: string) => {
        try {
          return await request<any>(`/designer/technical-documents/${id}/`, { method: 'DELETE' });
        } catch {
          return await request<any>(`/technical-documents/${id}/`, { method: 'DELETE' });
        }
      },
    },
  },

  // Purchase Management
  purchase: {
    mrp: {
      list: () => request<any[]>('/material-requirements/'),
      get: (id: string) => request<any>(`/material-requirements/${id}/`),
      create: (data: any) => request<any>('/material-requirements/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/material-requirements/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/material-requirements/${id}/`, { method: 'DELETE' }),
    },
    suppliers: {
      list: () => request<any[]>('/suppliers/'),
      create: (data: any) => request<any>('/suppliers/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/suppliers/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/suppliers/${id}/`, { method: 'DELETE' }),
    },
    requisitions: {
      list: () => request<any[]>('/purchase-requisitions/'),
      get: (id: string) => request<any>(`/purchase-requisitions/${id}/`),
      create: (data: any) => request<any>('/purchase-requisitions/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/purchase-requisitions/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/purchase-requisitions/${id}/`, { method: 'DELETE' }),
      convertToRfq: (id: string) => request<any>(`/purchase-requisitions/${id}/convert-to-rfq/`, { method: 'POST' }),
    },
    rfqs: {
      list: () => request<any[]>('/rfqs/'),
      get: (id: string) => request<any>(`/rfqs/${id}/`),
      create: (data: any) => request<any>('/rfqs/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/rfqs/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/rfqs/${id}/`, { method: 'DELETE' }),
    },
    supplierQuotations: {
      list: () => request<any[]>('/supplier-quotations/'),
      get: (id: string) => request<any>(`/supplier-quotations/${id}/`),
      create: (data: any) => request<any>('/supplier-quotations/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/supplier-quotations/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/supplier-quotations/${id}/`, { method: 'DELETE' }),
    },
    quotationComparisons: {
      list: () => request<any[]>('/quotation-comparisons/'),
      create: (data: any) => request<any>('/quotation-comparisons/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/quotation-comparisons/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    },
    orders: {
      list: () => request<any[]>('/purchase-orders/'),
      get: (id: string) => request<any>(`/purchase-orders/${id}/`),
      create: (data: any) => request<any>('/purchase-orders/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/purchase-orders/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/purchase-orders/${id}/`, { method: 'DELETE' }),
    },
    returns: () => request<any[]>('/purchase-returns/'),
  },

  // Store & Inventory
  store: {
    items: {
      list: () => request<any[]>('/items/'),
      create: (data: any) => request<any>('/items/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/items/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/items/${id}/`, { method: 'DELETE' }),
    },
    categories: () => request<any[]>('/item-categories/'),
    uoms: () => request<any[]>('/uoms/'),
    warehouses: {
      list: () => request<any[]>('/warehouses/'),
      create: (data: any) => request<any>('/warehouses/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/warehouses/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    },
    grns: {
      list: () => request<any[]>('/grns/'),
      create: (data: any) => request<any>('/grns/', { method: 'POST', body: JSON.stringify(data) }),
    },
    qcInspections: () => request<any[]>('/qc-inspections/'),
    stock: () => request<any[]>('/stock/'),
    materialIssues: {
      list: () => request<any[]>('/material-issues/'),
      create: (data: any) => request<any>('/material-issues/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/material-issues/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/material-issues/${id}/`, { method: 'DELETE' }),
    },
    materialReturns: {
      list: () => request<any[]>('/material-returns/'),
      create: (data: any) => request<any>('/material-returns/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/material-returns/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/material-returns/${id}/`, { method: 'DELETE' }),
    },
    transfers: () => request<any[]>('/stock-transfers/'),
    adjustments: () => request<any[]>('/stock-adjustments/'),
    stockLedger: () => request<any[]>('/stock-ledger/'),
    scrap: () => request<any[]>('/scrap/'),
  },

  // Production Execution
  production: {
    dashboardStats: () => request<any>('/production/dashboard-stats/'),
    jobs: () => request<any[]>('/manufacturing-jobs/'),
    workCenters: {
      list: () => request<any[]>('/work-centers/'),
      create: (data: any) => request<any>('/work-centers/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/work-centers/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/work-centers/${id}/`, { method: 'DELETE' }),
    },
    routingOperations: {
      list: () => request<any[]>('/routing-operations/'),
      create: (data: any) => request<any>('/routing-operations/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/routing-operations/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/routing-operations/${id}/`, { method: 'DELETE' }),
    },
    workOrders: {
      list: () => request<any[]>('/work-orders/'),
      create: (data: any) => request<any>('/work-orders/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/work-orders/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      release: (id: string, data?: any) => request<any>(`/work-orders/${id}/release/`, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
    },
    orders: {
      list: () => request<any[]>('/production-orders/'),
      get: (id: string) => request<any>(`/production-orders/${id}/`),
      create: (data: any) => request<any>('/production-orders/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/production-orders/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/production-orders/${id}/`, { method: 'DELETE' }),
    },
    schedules: {
      list: () => request<any[]>('/production-schedules/'),
      create: (data: any) => request<any>('/production-schedules/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/production-schedules/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/production-schedules/${id}/`, { method: 'DELETE' }),
    },
    entries: {
      list: () => request<any[]>('/production-entries/'),
      create: (data: any) => request<any>('/production-entries/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/production-entries/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/production-entries/${id}/`, { method: 'DELETE' }),
    },
    wip: {
      list: () => request<any[]>('/wip-records/'),
      create: (data: any) => request<any>('/wip-records/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/wip-records/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/wip-records/${id}/`, { method: 'DELETE' }),
    },
    holds: {
      list: () => request<any[]>('/production-holds/'),
      create: (data: any) => request<any>('/production-holds/', { method: 'POST', body: JSON.stringify(data) }),
      resume: (id: string, resumeDate?: string) =>
        request<any>(`/production-holds/${id}/resume/`, { method: 'POST', body: JSON.stringify({ resume_date: resumeDate || new Date().toISOString().split('T')[0] }) }),
      update: (id: string, data: any) => request<any>(`/production-holds/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/production-holds/${id}/`, { method: 'DELETE' }),
    },
    reworkOrders: {
      list: () => request<any[]>('/rework-orders/'),
      create: (data: any) => request<any>('/rework-orders/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/rework-orders/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/rework-orders/${id}/`, { method: 'DELETE' }),
    },
    scraps: {
      list: () => request<any[]>('/production-scraps/'),
      create: (data: any) => request<any>('/production-scraps/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/production-scraps/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/production-scraps/${id}/`, { method: 'DELETE' }),
    },
    finishedGoods: {
      list: () => request<any[]>('/finished-goods/'),
      create: (data: any) => request<any>('/finished-goods/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/finished-goods/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/finished-goods/${id}/`, { method: 'DELETE' }),
      qcPass: (id: string) => request<any>(`/finished-goods/${id}/qc-pass/`, { method: 'POST' }),
    },
    completions: {
      list: () => request<any[]>('/production-completions/'),
      create: (data: any) => request<any>('/production-completions/', { method: 'POST', body: JSON.stringify(data) }),
      get: (id: string) => request<any>(`/production-completions/${id}/`),
    },
    materialRequests: {
      list: () => request<any[]>('/production-material-requests/'),
      create: (data: any) => request<any>('/production-material-requests/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/production-material-requests/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/production-material-requests/${id}/`, { method: 'DELETE' }),
    },
    dispatch: {
      list: () => request<any[]>('/dispatch-orders/'),
      create: (data: any) => request<any>('/dispatch-orders/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/dispatch-orders/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/dispatch-orders/${id}/`, { method: 'DELETE' }),
      markDispatched: (id: string) => request<any>(`/dispatch-orders/${id}/mark-dispatched/`, { method: 'POST' }),
      markDelivered: (id: string) => request<any>(`/dispatch-orders/${id}/mark-delivered/`, { method: 'POST' }),
    },
    packingOrders: {
      list: () => request<any[]>('/packing-orders/'),
      get: (id: string) => request<any>(`/packing-orders/${id}/`),
      create: (data: any) => request<any>('/packing-orders/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/packing-orders/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/packing-orders/${id}/`, { method: 'DELETE' }),
      markInspected: (id: string) => request<any>(`/packing-orders/${id}/mark-inspected/`, { method: 'POST' }),
    },
  },

  // Plant Maintenance & Field Service
  maintenance: {
    internalAssets: () => request<any[]>('/internal-assets/'),
    customerMachines: () => request<any[]>('/customer-machines/'),
    installations: {
      list: () => request<any[]>('/installations/'),
      get: (id: string) => request<any>(`/installations/${id}/`),
      create: (data: any) => request<any>('/installations/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/installations/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/installations/${id}/`, { method: 'DELETE' }),
    },
    serviceRequests: {
      list: () => request<any[]>('/service-requests/'),
      create: (data: any) => request<any>('/service-requests/', { method: 'POST', body: JSON.stringify(data) }),
      assign: (id: string, data: { technicianId: string; technicianName: string }) =>
        request<any>(`/service-requests/${id}/assign/`, { method: 'POST', body: JSON.stringify(data) }),
      resolve: (id: string) => request<any>(`/service-requests/${id}/resolve/`, { method: 'POST' }),
    },
    breakdowns: () => request<any[]>('/breakdowns/'),
    pmPlans: () => request<any[]>('/pm-plans/'),
    serviceVisits: () => request<any[]>('/service-visits/'),
    amcContracts: () => request<any[]>('/amc-contracts/'),
    serviceWorkOrders: {
      list: () => request<any[]>('/service-work-orders/'),
      create: (data: any) => request<any>('/service-work-orders/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/service-work-orders/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    },
    servicePartIssues: {
      list: () => request<any[]>('/service-part-issues/'),
      create: (data: any) => request<any>('/service-part-issues/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/service-part-issues/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    },
    servicePartReturns: {
      list: () => request<any[]>('/service-part-returns/'),
      create: (data: any) => request<any>('/service-part-returns/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/service-part-returns/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    },
    serviceReports: {
      list: () => request<any[]>('/service-reports/'),
      create: (data: any) => request<any>('/service-reports/', { method: 'POST', body: JSON.stringify(data) }),
      get: (id: string) => request<any>(`/service-reports/${id}/`),
    },
    warrantyRecords: () => request<any[]>('/warranty-records/'),
    serviceContracts: () => request<any[]>('/service-contracts/'),
    downtimeRecords: () => request<any[]>('/downtime-records/'),
  },

  // HR & Payroll
  hr: {
    designations: () => request<any[]>('/designations/'),
    shifts: () => request<any[]>('/shifts/'),
    attendance: () => request<any[]>('/attendance-records/'),
    leaves: {
      list: () => request<any[]>('/leave-requests/'),
      create: (data: any) => request<any>('/leave-requests/', { method: 'POST', body: JSON.stringify(data) }),
      approve: (id: string, approvedBy?: string) =>
        request<any>(`/leave-requests/${id}/approve/`, { method: 'POST', body: JSON.stringify({ approvedBy }) }),
    },
    salaryStructures: () => request<any[]>('/salary-structures/'),
    payroll: {
      list: () => request<any[]>('/payroll-records/'),
      generate: (monthYear: string, financialYear: string) =>
        request<any[]>('/payroll-records/generate-monthly-payroll/', {
          method: 'POST',
          body: JSON.stringify({ monthYear, financialYear }),
        }),
    },
    onboardings: {
      list: () => request<any[]>('/employee-onboardings/'),
      create: (data: any) => request<any>('/employee-onboardings/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/employee-onboardings/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/employee-onboardings/${id}/`, { method: 'DELETE' }),
      complete: (id: string) => request<any>(`/employee-onboardings/${id}/complete_onboarding/`, { method: 'POST' }),
    },
    transfers: {
      list: () => request<any[]>('/employee-transfers/'),
      create: (data: any) => request<any>('/employee-transfers/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/employee-transfers/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/employee-transfers/${id}/`, { method: 'DELETE' }),
    },
    promotions: {
      list: () => request<any[]>('/employee-promotions/'),
      create: (data: any) => request<any>('/employee-promotions/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/employee-promotions/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/employee-promotions/${id}/`, { method: 'DELETE' }),
    },
    exits: {
      list: () => request<any[]>('/employee-exits/'),
      create: (data: any) => request<any>('/employee-exits/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/employee-exits/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/employee-exits/${id}/`, { method: 'DELETE' }),
    },
    holidays: {
      list: () => request<any[]>('/holidays/'),
      create: (data: any) => request<any>('/holidays/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/holidays/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/holidays/${id}/`, { method: 'DELETE' }),
    },
    wfhRequests: {
      list: () => request<any[]>('/wfh-requests/'),
      create: (data: any) => request<any>('/wfh-requests/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/wfh-requests/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/wfh-requests/${id}/`, { method: 'DELETE' }),
      approve: (id: string) => request<any>(`/wfh-requests/${id}/approve/`, { method: 'POST' }),
      reject: (id: string) => request<any>(`/wfh-requests/${id}/reject/`, { method: 'POST' }),
    },
    missedPunches: {
      list: () => request<any[]>('/missed-punches/'),
      create: (data: any) => request<any>('/missed-punches/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/missed-punches/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/missed-punches/${id}/`, { method: 'DELETE' }),
      approve: (id: string) => request<any>(`/missed-punches/${id}/approve/`, { method: 'POST' }),
      reject: (id: string) => request<any>(`/missed-punches/${id}/reject/`, { method: 'POST' }),
    },
    overtimeRecords: {
      list: () => request<any[]>('/overtime-records/'),
      create: (data: any) => request<any>('/overtime-records/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/overtime-records/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/overtime-records/${id}/`, { method: 'DELETE' }),
      approve: (id: string) => request<any>(`/overtime-records/${id}/approve_overtime/`, { method: 'POST' }),
      reject: (id: string) => request<any>(`/overtime-records/${id}/reject_overtime/`, { method: 'POST' }),
    },
    earlyCheckouts: {
      list: () => request<any[]>('/early-checkouts/'),
      create: (data: any) => request<any>('/early-checkouts/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/early-checkouts/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/early-checkouts/${id}/`, { method: 'DELETE' }),
      approve: (id: string) => request<any>(`/early-checkouts/${id}/approve/`, { method: 'POST' }),
      reject: (id: string) => request<any>(`/early-checkouts/${id}/reject/`, { method: 'POST' }),
    },
    appraisals: {
      list: () => request<any[]>('/employee-appraisals/'),
      create: (data: any) => request<any>('/employee-appraisals/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/employee-appraisals/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/employee-appraisals/${id}/`, { method: 'DELETE' }),
      approve: (id: string) => request<any>(`/employee-appraisals/${id}/approve/`, { method: 'POST' }),
      reject: (id: string) => request<any>(`/employee-appraisals/${id}/reject/`, { method: 'POST' }),
    },
  },

  // Accounting & Finance
  accounting: {
    dashboardMetrics: () => request<any>('/accounting/dashboard-metrics/'),
    financialYears: () => request<any[]>('/financial-years/'),
    chartOfAccounts: () => request<any[]>('/chart-of-accounts/'),
    taxes: () => request<any[]>('/taxes/'),
    costCenters: () => request<any[]>('/cost-centers/'),
    salesInvoices: {
      list: () => request<any[]>('/sales-invoices/'),
      create: (data: any) => request<any>('/sales-invoices/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/sales-invoices/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      approve: (id: string) => request<any>(`/sales-invoices/${id}/`, { method: 'PATCH', body: JSON.stringify({ status: 'Approved' }) }),
      recordPayment: (id: string, data: { amount: number; paymentMode?: string; referenceNumber?: string }) =>
        request<any>(`/sales-invoices/${id}/record-payment/`, { method: 'POST', body: JSON.stringify(data) }),
    },
    purchaseInvoices: {
      list: () => request<any[]>('/purchase-invoices/'),
      create: (data: any) => request<any>('/purchase-invoices/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/purchase-invoices/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      post: (id: string) => request<any>(`/purchase-invoices/${id}/`, { method: 'PATCH', body: JSON.stringify({ status: 'Posted' }) }),
      recordPayment: (id: string, data: { amount: number; paymentMode?: string; referenceNumber?: string }) =>
        request<any>(`/purchase-invoices/${id}/record-payment/`, { method: 'POST', body: JSON.stringify(data) }),
    },
    receipts: () => request<any[]>('/customer-receipts/'),
    payments: () => request<any[]>('/supplier-payments/'),
    journalEntries: {
      list: () => request<any[]>('/journal-entries/'),
      create: (data: any) => request<any>('/journal-entries/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/journal-entries/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/journal-entries/${id}/`, { method: 'DELETE' }),
    },
    jobCostings: () => request<any[]>('/job-costings/'),
    creditNotes: {
      list: () => request<any[]>('/credit-notes/'),
      create: (data: any) => request<any>('/credit-notes/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/credit-notes/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/credit-notes/${id}/`, { method: 'DELETE' }),
    },
    debitNotes: {
      list: () => request<any[]>('/debit-notes/'),
      create: (data: any) => request<any>('/debit-notes/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/debit-notes/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/debit-notes/${id}/`, { method: 'DELETE' }),
    },
    contraEntries: {
      list: () => request<any[]>('/contra-entries/'),
      create: (data: any) => request<any>('/contra-entries/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/contra-entries/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/contra-entries/${id}/`, { method: 'DELETE' }),
    },
    bankAccounts: {
      list: () => request<any[]>('/bank-accounts/'),
      create: (data: any) => request<any>('/bank-accounts/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/bank-accounts/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/bank-accounts/${id}/`, { method: 'DELETE' }),
    },
    expenses: {
      list: () => request<any[]>('/expenses/'),
      create: (data: any) => request<any>('/expenses/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/expenses/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/expenses/${id}/`, { method: 'DELETE' }),
      approve: (id: string, approvedBy?: string) =>
        request<any>(`/expenses/${id}/approve/`, { method: 'POST', body: JSON.stringify({ approved_by: approvedBy || 'Super Admin' }) }),
    },
    fixedAssets: {
      list: () => request<any[]>('/fixed-assets/'),
      create: (data: any) => request<any>('/fixed-assets/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/fixed-assets/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/fixed-assets/${id}/`, { method: 'DELETE' }),
    },
  },

  // 360° Traceability & Central Approvals
  integration: {
    job360: (jobNumber: string) => request<any>(`/job-360/${jobNumber}/`),
    approvals: {
      list: () => request<any[]>('/approvals/'),
      approve: (id: string) => request<any>(`/approvals/${id}/approve/`, { method: 'POST' }),
      reject: (id: string) => request<any>(`/approvals/${id}/reject/`, { method: 'POST' }),
    },
    alerts: {
      list: () => request<any[]>('/alerts/'),
      markRead: (id: string) => request<any>(`/alerts/${id}/mark-read/`, { method: 'POST' }),
    },
  },
};

export default api;
