/**
 * Universal Descending Sorter for UMA Techno Fab ERP
 * Ensures latest created / last entered records appear at the top (ORDER BY 1 DESC).
 */

function extractDocCode(item: Record<string, any>): string {
  // 1. Primary entity business code (NEVER shadowed by secondary foreign keys like customerPoNumber)
  const primary = (
    item.projectNumber || item.project_number ||
    item.jobNumber || item.job_number ||
    item.planningNumber || item.planNumber || item.plan_number ||
    item.salesOrderNumber || item.sales_order_number || item.soNumber || item.so_number ||
    item.quotationNumber || item.quotation_number || item.quoteNumber || item.quote_number ||
    item.leadNo || item.lead_no || item.leadNumber || item.lead_number ||
    item.issueNumber || item.issue_number ||
    item.prNumber || item.pr_number || item.requisitionNumber || item.requisition_number ||
    item.poNumber || item.po_number ||
    item.grnNumber || item.grn_number ||
    item.inspectionNumber || item.inspection_number ||
    item.workOrderNumber || item.work_order_number || item.productionEntryNumber || item.production_entry_number ||
    item.taskNumber || item.task_number ||
    item.changeRequestNo || item.change_request_no ||
    item.rfqNumber || item.rfq_number ||
    item.invoiceNumber || item.invoice_number ||
    item.receiptNumber || item.receipt_number ||
    item.paymentNumber || item.payment_number ||
    item.expenseNumber || item.expense_number ||
    item.requestNumber || item.request_number ||
    item.breakdownNumber || item.breakdown_number ||
    item.customerCode || item.customer_code ||
    item.supplierCode || item.vendorCode || item.vendor_code ||
    item.itemCode || item.item_code ||
    item.assetCode || item.asset_code ||
    item.leaveNumber || item.loanNumber ||
    item.bugNo || item.ticketNo ||
    ''
  );
  if (primary) return String(primary).trim();

  // 2. Primary ID fallback if it looks like a business code or numeric ID
  const idStr = String(item.id || '').trim();
  if (idStr && !idStr.startsWith('http')) {
    return idStr;
  }

  // 3. Foreign key reference only if no primary code exists
  const fallback = item.customerPoNumber || item.customer_po_number || '';
  return String(fallback).trim();
}

function extractSequenceValue(code: string): number {
  if (!code) return 0;
  const nums = (code.match(/\d+/g) || []).map(Number);
  if (nums.length === 0) return 0;
  if (nums.length >= 2) {
    // If format like "PRJ-2026-0013" -> year 2026 * 1000000 + sequence 13
    return nums[0] * 1000000 + nums[nums.length - 1];
  }
  return nums[0];
}

function getTimestamp(item: Record<string, any>): number {
  const ts = item.createdAt || item.created_at || item.timestamp || item.created_time || item.dateTime || item.datetime || item.updatedAt || item.updated_at;
  if (ts) {
    const t = new Date(ts).getTime();
    if (!isNaN(t)) return t;
  }
  return NaN;
}

function getDate(item: Record<string, any>): number {
  const dt = item.startDate || item.start_date ||
             item.createdDate || item.created_date ||
             item.issueDate || item.issue_date ||
             item.requisitionDate || item.request_date ||
             item.prDate || item.date ||
             item.entryDate || item.entry_date ||
             item.invoiceDate || item.soDate || item.poDate ||
             item.quotationDate || item.quoteDate ||
             item.deliveryDate || item.delivery_date || item.target_delivery_date;
  if (dt) {
    const t = new Date(dt).getTime();
    if (!isNaN(t)) return t;
  }
  return NaN;
}

export function sortByLatestDesc<T extends Record<string, any>>(list: T[]): T[] {
  if (!Array.isArray(list) || list.length <= 1) return list ? [...list] : [];

  return [...list].sort((a, b) => {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;

    // 1. High precision timestamp (createdAt, created_at, etc.) if BOTH have it
    const tA = getTimestamp(a);
    const tB = getTimestamp(b);
    const hasTA = !isNaN(tA);
    const hasTB = !isNaN(tB);

    if (hasTA && hasTB && tA !== tB) {
      return tB - tA; // Newest timestamp first
    }

    // 2. Date field comparison (startDate, createdDate, date, etc.)
    const dtA = getDate(a);
    const dtB = getDate(b);
    const hasDtA = !isNaN(dtA);
    const hasDtB = !isNaN(dtB);

    if (hasDtA && hasDtB && dtA !== dtB) {
      // Check if dates are on different days (ignore small timezone jitter)
      const dayA = new Date(dtA).toISOString().slice(0, 10);
      const dayB = new Date(dtB).toISOString().slice(0, 10);
      if (dayA !== dayB) {
        return dtB - dtA; // Latest date first
      }
    }

    // 3. Business Document sequence number comparison (e.g. PRJ-2026-0013 > PRJ-2026-0010)
    // In ERPs, document codes are sequentially incremented with every new record.
    const codeA = extractDocCode(a);
    const codeB = extractDocCode(b);
    const seqA = extractSequenceValue(codeA);
    const seqB = extractSequenceValue(codeB);

    if (seqA > 0 && seqB > 0 && seqA !== seqB) {
      return seqB - seqA; // Highest sequence number first (e.g. 13 before 10 before 1)
    }

    // 4. Timestamp tie-breaker if one had timestamp and one didn't
    if (hasTA && !hasTB) return -1;
    if (!hasTA && hasTB) return 1;

    // 5. Stable fallback: retain array insertion order
    return 0;
  });
}
