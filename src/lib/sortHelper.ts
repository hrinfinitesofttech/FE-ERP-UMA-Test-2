/**
 * Universal Descending Sorter for UMA Techno Fab ERP
 * Ensures latest created / last entered records appear at the top (ORDER BY 1 DESC).
 */
export function sortByLatestDesc<T extends Record<string, any>>(list: T[]): T[] {
  if (!Array.isArray(list) || list.length <= 1) return list ? [...list] : [];

  return [...list].sort((a, b) => {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;

    // 1. High precision timestamp (createdAt, created_at, timestamp, etc.)
    const timeA_raw = a.createdAt || a.created_at || a.timestamp || a.created_time;
    const timeB_raw = b.createdAt || b.created_at || b.timestamp || b.created_time;
    if (timeA_raw && timeB_raw && timeA_raw !== timeB_raw) {
      const tA = new Date(timeA_raw).getTime();
      const tB = new Date(timeB_raw).getTime();
      if (!isNaN(tA) && !isNaN(tB) && tA !== tB) {
        return tB - tA; // Newest timestamp first
      }
    }

    // 2. Document Code / Unique ID extraction
    const codeA = String(
      a.issueNumber || a.issue_number ||
      a.prNumber || a.pr_number ||
      a.poNumber || a.po_number ||
      a.soNumber || a.salesOrderNumber || a.sales_order_number ||
      a.quotationNumber || a.quotation_number ||
      a.customerPoNumber || a.customer_po_number ||
      a.projectNumber || a.jobNumber || a.job_number ||
      a.leadNo || a.lead_no ||
      a.customerCode || a.customer_code ||
      a.supplierCode || a.vendorCode || a.vendor_code ||
      a.itemCode || a.item_code ||
      a.grnNumber || a.grn_number ||
      a.inspectionNumber || a.inspection_number ||
      a.workOrderNumber || a.work_order_number ||
      a.productionEntryNumber || a.production_entry_number ||
      a.planNumber || a.plan_number ||
      a.rfqNumber || a.rfq_number ||
      a.invoiceNumber || a.invoice_number ||
      a.receiptNumber || a.receipt_number ||
      a.paymentNumber || a.payment_number ||
      a.expenseNumber || a.expense_number ||
      a.requestNumber || a.request_number ||
      a.breakdownNumber || a.breakdown_number ||
      a.assetCode || a.asset_code ||
      a.leaveNumber || a.loanNumber ||
      a.bugNo || a.ticketNo ||
      a.id || ''
    ).trim();

    const codeB = String(
      b.issueNumber || b.issue_number ||
      b.prNumber || b.pr_number ||
      b.poNumber || b.po_number ||
      b.soNumber || b.salesOrderNumber || b.sales_order_number ||
      b.quotationNumber || b.quotation_number ||
      b.customerPoNumber || b.customer_po_number ||
      b.projectNumber || b.jobNumber || b.job_number ||
      b.leadNo || b.lead_no ||
      b.customerCode || b.customer_code ||
      b.supplierCode || b.vendorCode || b.vendor_code ||
      b.itemCode || b.item_code ||
      b.grnNumber || b.grn_number ||
      b.inspectionNumber || b.inspection_number ||
      b.workOrderNumber || b.work_order_number ||
      b.productionEntryNumber || b.production_entry_number ||
      b.planNumber || b.plan_number ||
      b.rfqNumber || b.rfq_number ||
      b.invoiceNumber || b.invoice_number ||
      b.receiptNumber || b.receipt_number ||
      b.paymentNumber || b.payment_number ||
      b.expenseNumber || b.expense_number ||
      b.requestNumber || b.request_number ||
      b.breakdownNumber || b.breakdown_number ||
      b.assetCode || b.asset_code ||
      b.leaveNumber || b.loanNumber ||
      b.bugNo || b.ticketNo ||
      b.id || ''
    ).trim();

    // 3. Date field comparison (if dates are distinctly on different days)
    const dateA = a.createdDate || a.created_date || a.issueDate || a.issue_date || 
                  a.requisitionDate || a.request_date || a.prDate || a.date || 
                  a.entryDate || a.entry_date || a.invoiceDate || a.soDate || a.poDate;
    const dateB = b.createdDate || b.created_date || b.issueDate || b.issue_date || 
                  b.requisitionDate || b.request_date || b.prDate || b.date || 
                  b.entryDate || b.entry_date || b.invoiceDate || b.soDate || b.poDate;
    if (dateA && dateB && dateA !== dateB) {
      const dtA = new Date(dateA).getTime();
      const dtB = new Date(dateB).getTime();
      if (!isNaN(dtA) && !isNaN(dtB) && dtA !== dtB) {
        const dayA = String(dateA).slice(0, 10);
        const dayB = String(dateB).slice(0, 10);
        if (dayA !== dayB) {
          return dtB - dtA; // Latest date first
        }
      }
    }

    // 4. Numeric sequence inside ID / Document number
    // E.g. "PR-2026-0005" -> 5, "PR-2026-0012" -> 12
    const numsA = (codeA.match(/\d+/g) || []).map(Number);
    const numsB = (codeB.match(/\d+/g) || []).map(Number);
    if (numsA.length > 0 && numsB.length > 0) {
      const lastA = numsA[numsA.length - 1];
      const lastB = numsB[numsB.length - 1];
      if (lastA !== lastB) {
        return lastB - lastA; // Higher sequence number first (DESC)
      }
    }

    // 5. Fallback alphanumeric natural descending
    return codeB.localeCompare(codeA, undefined, { numeric: true, sensitivity: 'base' });
  });
}
