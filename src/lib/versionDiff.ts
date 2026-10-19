/**
 * Multi-Level Version Diff Engine
 * Computes deep differences between ERP records across Macro, Meso (Tables), and Micro (Fields) levels.
 */

import {
  DocumentVersionMetadata,
  FieldDiff,
  LineItemDiff,
  VersionComparisonResult,
} from '@/types/versioning';

export interface FieldMapping {
  key: string;
  label: string;
  type: 'STRING' | 'NUMBER' | 'CURRENCY' | 'DATE' | 'STATUS' | 'BOOLEAN';
  category?: 'financial' | 'schedule' | 'specifications' | 'terms' | 'general';
}

export const COMMON_FIELD_MAPPINGS: Record<string, FieldMapping> = {
  grandTotal: { key: 'grandTotal', label: 'Grand Total', type: 'CURRENCY', category: 'financial' },
  subTotal: { key: 'subTotal', label: 'Sub Total', type: 'CURRENCY', category: 'financial' },
  taxAmount: { key: 'taxAmount', label: 'Tax Amount', type: 'CURRENCY', category: 'financial' },
  discountAmount: { key: 'discountAmount', label: 'Discount Amount', type: 'CURRENCY', category: 'financial' },
  poAmount: { key: 'poAmount', label: 'PO Amount', type: 'CURRENCY', category: 'financial' },
  deliveryTime: { key: 'deliveryTime', label: 'Delivery Schedule / Lead Time', type: 'STRING', category: 'schedule' },
  deliveryDate: { key: 'deliveryDate', label: 'Delivery Date', type: 'DATE', category: 'schedule' },
  paymentTerms: { key: 'paymentTerms', label: 'Payment Terms', type: 'STRING', category: 'terms' },
  warranty: { key: 'warranty', label: 'Warranty Period', type: 'STRING', category: 'terms' },
  status: { key: 'status', label: 'Document Status', type: 'STATUS', category: 'general' },
  technicalSpecs: { key: 'technicalSpecs', label: 'Technical Specifications', type: 'STRING', category: 'specifications' },
  scopeOfSupply: { key: 'scopeOfSupply', label: 'Scope of Supply', type: 'STRING', category: 'specifications' },
  termsAndConditions: { key: 'termsAndConditions', label: 'Terms & Conditions', type: 'STRING', category: 'terms' },
  remarks: { key: 'remarks', label: 'Notes / Remarks', type: 'STRING', category: 'general' },
};

export const LINE_ITEM_FIELD_MAPPINGS: Record<string, FieldMapping> = {
  productName: { key: 'productName', label: 'Item / Product Name', type: 'STRING' },
  description: { key: 'description', label: 'Description', type: 'STRING' },
  quantity: { key: 'quantity', label: 'Quantity', type: 'NUMBER' },
  unit: { key: 'unit', label: 'Unit (UOM)', type: 'STRING' },
  rate: { key: 'rate', label: 'Unit Rate', type: 'CURRENCY' },
  amount: { key: 'amount', label: 'Total Amount', type: 'CURRENCY' },
  taxPercent: { key: 'taxPercent', label: 'GST / Tax %', type: 'NUMBER' },
  discountPercent: { key: 'discountPercent', label: 'Discount %', type: 'NUMBER' },
};

/**
 * Compare two version snapshots and generate a multi-level diff
 */
export function compareRevisions<T extends Record<string, any>>(
  versionA: { meta: DocumentVersionMetadata; data: T },
  versionB: { meta: DocumentVersionMetadata; data: T },
  options?: {
    customFieldMappings?: Record<string, FieldMapping>;
    itemsKey?: string; // key in data containing items array (e.g. 'items')
    itemIdentityKey?: string; // key to match items (e.g. 'id' or 'productName')
  }
): VersionComparisonResult {
  const fieldMap = { ...COMMON_FIELD_MAPPINGS, ...(options?.customFieldMappings || {}) };
  const itemsKey = options?.itemsKey || 'items';
  const itemIdentityKey = options?.itemIdentityKey || 'id';

  const dataA = versionA.data || ({} as T);
  const dataB = versionB.data || ({} as T);

  // 1. Micro-Level Field Diffs
  const fieldDiffs: FieldDiff[] = [];

  for (const [key, mapping] of Object.entries(fieldMap)) {
    if (key === itemsKey) continue;

    const valA = dataA[key];
    const valB = dataB[key];

    // Check if field was modified
    if (isValuesDifferent(valA, valB)) {
      fieldDiffs.push({
        path: key,
        fieldLabel: mapping.label,
        category: mapping.category,
        oldValue: valA !== undefined ? valA : null,
        newValue: valB !== undefined ? valB : null,
        type: mapping.type,
      });
    }
  }

  // 2. Meso-Level Table / Line Item Diffs
  const listA: any[] = Array.isArray(dataA[itemsKey]) ? dataA[itemsKey] : [];
  const listB: any[] = Array.isArray(dataB[itemsKey]) ? dataB[itemsKey] : [];

  const lineItemDiffs = compareLineItemList(listA, listB, itemIdentityKey);

  // 3. Macro-Level Financial & Status Summary
  const amountA = Number(dataA.grandTotal ?? dataA.poAmount ?? dataA.subTotal ?? 0);
  const amountB = Number(dataB.grandTotal ?? dataB.poAmount ?? dataB.subTotal ?? 0);
  const diffAmount = amountB - amountA;
  const percentageChange = amountA > 0 ? (diffAmount / amountA) * 100 : 0;

  return {
    sourceVersion: versionA.meta,
    targetVersion: versionB.meta,
    macroDiff: {
      statusChanged: dataA.status !== dataB.status,
      oldStatus: dataA.status || 'unknown',
      newStatus: dataB.status || 'unknown',
      financialDifference: {
        oldAmount: amountA,
        newAmount: amountB,
        diffAmount,
        percentageChange,
      },
    },
    fieldDiffs,
    lineItemDiffs: [
      {
        tableName: itemsKey,
        tableLabel: 'Line Items & Bill of Materials',
        items: lineItemDiffs.items,
        summary: lineItemDiffs.summary,
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

/**
 * Compare two arrays of line items
 */
function compareLineItemList(
  listA: any[],
  listB: any[],
  identityKey: string
): { items: LineItemDiff[]; summary: { added: number; removed: number; modified: number; unchanged: number } } {
  const result: LineItemDiff[] = [];
  const mapA = new Map<string, any>();
  const mapB = new Map<string, any>();

  const getKey = (item: any, fallbackIdx: number) => {
    return String(item[identityKey] || item.productName || item.itemName || `item-${fallbackIdx}`);
  };

  listA.forEach((item, idx) => mapA.set(getKey(item, idx), item));
  listB.forEach((item, idx) => mapB.set(getKey(item, idx), item));

  let added = 0;
  let removed = 0;
  let modified = 0;
  let unchanged = 0;

  // Process items in B
  listB.forEach((itemB, idx) => {
    const key = getKey(itemB, idx);
    const itemA = mapA.get(key);

    if (!itemA) {
      added++;
      result.push({
        id: key,
        keyIdentifier: itemB.productName || itemB.itemName || key,
        diffType: 'ADDED',
        newItem: itemB,
      });
    } else {
      // Both exist: check field level differences
      const fieldChanges: FieldDiff[] = [];
      for (const [fKey, fMap] of Object.entries(LINE_ITEM_FIELD_MAPPINGS)) {
        if (isValuesDifferent(itemA[fKey], itemB[fKey])) {
          fieldChanges.push({
            path: `items[${key}].${fKey}`,
            fieldLabel: fMap.label,
            oldValue: itemA[fKey] ?? null,
            newValue: itemB[fKey] ?? null,
            type: fMap.type,
          });
        }
      }

      if (fieldChanges.length > 0) {
        modified++;
        result.push({
          id: key,
          keyIdentifier: itemB.productName || itemB.itemName || key,
          diffType: 'MODIFIED',
          oldItem: itemA,
          newItem: itemB,
          fieldChanges,
        });
      } else {
        unchanged++;
        result.push({
          id: key,
          keyIdentifier: itemB.productName || itemB.itemName || key,
          diffType: 'UNCHANGED',
          oldItem: itemA,
          newItem: itemB,
        });
      }
    }
  });

  // Check for removed items (in A but not in B)
  listA.forEach((itemA, idx) => {
    const key = getKey(itemA, idx);
    if (!mapB.has(key)) {
      removed++;
      result.push({
        id: key,
        keyIdentifier: itemA.productName || itemA.itemName || key,
        diffType: 'REMOVED',
        oldItem: itemA,
      });
    }
  });

  return {
    items: result,
    summary: { added, removed, modified, unchanged },
  };
}

function isValuesDifferent(a: any, b: any): boolean {
  if (a === undefined && b === undefined) return false;
  if (a === null && b === null) return false;
  if (a === '' && (b === undefined || b === null)) return false;
  if (b === '' && (a === undefined || a === null)) return false;

  // Numeric compare with zero equivalence
  if (typeof a === 'number' || typeof b === 'number') {
    return Number(a || 0) !== Number(b || 0);
  }

  // String compare
  if (typeof a === 'string' && typeof b === 'string') {
    return a.trim() !== b.trim();
  }

  return JSON.stringify(a) !== JSON.stringify(b);
}
