import type { QuotationItem } from '../types/crm';

const n = (v: any) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

/** Taxable value of one line: quantity x rate less discount. */
export const itemBase = (it: Pick<QuotationItem, 'quantity' | 'rate' | 'discountPercent'>) =>
  n(it.quantity) * n(it.rate) * (1 - n(it.discountPercent) / 100);

/** Line total including GST (rounded to the rupee). Same formula the server uses. */
export const itemAmount = (it: Pick<QuotationItem, 'quantity' | 'rate' | 'discountPercent' | 'taxPercent'>) =>
  Math.round(itemBase(it) * (1 + n(it.taxPercent) / 100));

export function computeQuotationTotals(items: QuotationItem[]) {
  let sub = 0;
  let tax = 0;
  items.forEach((it) => {
    const base = itemBase(it);
    sub += base;
    tax += base * (n(it.taxPercent) / 100);
  });
  return { subTotal: Math.round(sub), taxAmount: Math.round(tax), grandTotal: Math.round(sub + tax) };
}

/** Unit rate that gives `total` (incl. GST) for the line. Used when the user types the total amount. */
export function rateFromTotal(it: Pick<QuotationItem, 'quantity' | 'discountPercent' | 'taxPercent'>, total: number) {
  const factor = n(it.quantity) * (1 - n(it.discountPercent) / 100) * (1 + n(it.taxPercent) / 100);
  if (factor <= 0) return 0;
  return Math.round((n(total) / factor) * 10000) / 10000;
}

/** Why a set of items cannot be saved, or '' when it can. */
export function validateQuotationItems(items: QuotationItem[]): string {
  for (const [i, it] of items.entries()) {
    const label = it.productName || `Item ${i + 1}`;
    if (!(n(it.quantity) > 0)) return `${label}: quantity must be greater than zero.`;
    if (!(n(it.rate) > 0)) return `${label}: Unit Rate (price) is mandatory.`;
    if (n(it.discountPercent) < 0 || n(it.discountPercent) > 100) return `${label}: discount must be between 0 and 100.`;
    if (n(it.taxPercent) < 0) return `${label}: GST cannot be negative.`;
  }
  return '';
}

/** A revision can be edited only while it is still being prepared. */
export const isRevisionEditable = (status?: string) => ['draft', 'internal_review'].includes(String(status || 'draft'));
