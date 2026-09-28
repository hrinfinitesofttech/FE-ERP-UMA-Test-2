/**
 * UMA Techno Fab Private Limited - ERP API Client
 * Connects Next.js frontend to Django REST Framework backend on PythonAnywhere.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://umaERP.pythonanywhere.com/api';

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

// Auto-authentication helper
async function getOrRefreshToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  let token = localStorage.getItem('access_token');
  if (token) return token;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '123456' }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.access) {
        localStorage.setItem('access_token', data.access);
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
        return data.access;
      }
    }
  } catch (err) {
    console.warn('Auto-authentication failed:', err);
  }
  return null;
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  let token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (!token && typeof window !== 'undefined') {
    token = await getOrRefreshToken();
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If 401, attempt token refresh/re-login once and retry
  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    const newToken = await getOrRefreshToken();
    if (newToken) {
      response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    }
  }

  if (!response.ok) {
    let errData: any;
    try {
      errData = await response.json();
    } catch {
      errData = await response.text();
    }
    throw new ApiError(response.status, `API Error: ${response.status} ${response.statusText}`, errData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const json = await response.json();
  // Unwrap paginated results if applicable
  if (json && typeof json === 'object' && Array.isArray(json.results)) {
    return json.results as T;
  }
  return json;
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
      create: (data: any) => request<any>('/sales-orders/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/sales-orders/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    },
  },

  // Project Management
  projects: {
    list: () => request<any[]>('/projects/'),
    get: (id: string) => request<any>(`/projects/${id}/`),
    create: (data: any) => request<any>('/projects/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/projects/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/projects/${id}/`, { method: 'DELETE' }),
    planningStages: (projectId?: string) =>
      request<any[]>(projectId ? `/planning-stages/?projectId=${projectId}` : '/planning-stages/'),
    milestones: (projectId?: string) =>
      request<any[]>(projectId ? `/project-milestones/?projectId=${projectId}` : '/project-milestones/'),
    tasks: (projectId?: string) =>
      request<any[]>(projectId ? `/project-tasks/?projectId=${projectId}` : '/project-tasks/'),
    createTask: (data: any) => request<any>('/project-tasks/', { method: 'POST', body: JSON.stringify(data) }),
    updateTask: (id: string, data: any) => request<any>(`/project-tasks/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteTask: (id: string) => request<any>(`/project-tasks/${id}/`, { method: 'DELETE' }),
  },

  // Design & Engineering
  designer: {
    jobs: {
      list: () => request<any[]>('/design-jobs/'),
      create: (data: any) => request<any>('/design-jobs/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/design-jobs/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      releaseToProduction: (id: string) =>
        request<any>(`/design-jobs/${id}/release-to-production/`, { method: 'POST' }),
    },
    drawings2d: () => request<any[]>('/drawings-2d/'),
    models3d: () => request<any[]>('/models-3d/'),
    boms: {
      list: () => request<any[]>('/boms/'),
      create: (data: any) => request<any>('/boms/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/boms/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    },
  },

  // Purchase Management
  purchase: {
    suppliers: {
      list: () => request<any[]>('/suppliers/'),
      create: (data: any) => request<any>('/suppliers/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/suppliers/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<any>(`/suppliers/${id}/`, { method: 'DELETE' }),
    },
    requisitions: {
      list: () => request<any[]>('/purchase-requisitions/'),
      create: (data: any) => request<any>('/purchase-requisitions/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/purchase-requisitions/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      convertToRfq: (id: string) => request<any>(`/purchase-requisitions/${id}/convert-to-rfq/`, { method: 'POST' }),
    },
    rfqs: () => request<any[]>('/rfqs/'),
    supplierQuotations: () => request<any[]>('/supplier-quotations/'),
    orders: {
      list: () => request<any[]>('/purchase-orders/'),
      create: (data: any) => request<any>('/purchase-orders/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/purchase-orders/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
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
    materialIssues: () => request<any[]>('/material-issues/'),
    materialReturns: () => request<any[]>('/material-returns/'),
    stockLedger: () => request<any[]>('/stock-ledger/'),
    scrap: () => request<any[]>('/scrap/'),
  },

  // Production Execution
  production: {
    jobs: () => request<any[]>('/manufacturing-jobs/'),
    workCenters: () => request<any[]>('/work-centers/'),
    routingOperations: () => request<any[]>('/routing-operations/'),
    workOrders: {
      list: () => request<any[]>('/work-orders/'),
      create: (data: any) => request<any>('/work-orders/', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<any>(`/work-orders/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
      release: (id: string, data?: any) => request<any>(`/work-orders/${id}/release/`, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
    },
    entries: () => request<any[]>('/production-entries/'),
    wip: () => request<any[]>('/wip-records/'),
    finishedGoods: {
      list: () => request<any[]>('/finished-goods/'),
      qcPass: (id: string) => request<any>(`/finished-goods/${id}/qc-pass/`, { method: 'POST' }),
    },
  },

  // Plant Maintenance & Field Service
  maintenance: {
    internalAssets: () => request<any[]>('/internal-assets/'),
    customerMachines: () => request<any[]>('/customer-machines/'),
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
  },

  // Accounting & Finance
  accounting: {
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
