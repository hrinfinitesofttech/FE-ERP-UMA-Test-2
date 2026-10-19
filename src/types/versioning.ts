/**
 * Multi-Level Versioning & Audit Trail Type System
 * Inspired by Google Sheets (Cell-level history) and Figma (Milestone visual diffs)
 * Designed for UMA ERP Enterprise Records (Quotation, PO, Production Plan, Store Items)
 */

import { UserRole } from './erp';

// Level 1: Macro - Document / Record Version
export interface DocumentVersionMetadata {
  id: string;
  versionNumber: string; // e.g., 'v1.0', 'Rev-01', 'v2.0'
  versionIndex: number;  // 1, 2, 3 for sequence
  label?: string;        // e.g. "Approved by Director", "Post-Negotiation Discount"
  createdAt: string;     // ISO 8601
  createdBy: {
    userId: string;
    userName: string;
    role?: UserRole | string;
    department?: string;
  };
  isMilestone: boolean;  // true for major releases / approvals
  status: string;        // e.g., 'draft' | 'approved' | 'sent'
  notes?: string;
  changeSummary?: {
    totalChanges: number;
    fieldsChanged: number;
    itemsAdded: number;
    itemsRemoved: number;
    itemsModified: number;
  };
}

// Level 2: Meso - Table / Line Item Diff
export type ItemDiffType = 'ADDED' | 'REMOVED' | 'MODIFIED' | 'UNCHANGED';

export interface LineItemDiff<T = Record<string, any>> {
  id: string;
  keyIdentifier: string; // e.g. Product Name or Item ID
  diffType: ItemDiffType;
  oldItem?: T;
  newItem?: T;
  fieldChanges?: FieldDiff[];
}

// Level 3: Micro - Single Field / Attribute Diff
export interface FieldDiff {
  path: string;           // e.g. "grandTotal" or "items[0].rate"
  fieldLabel: string;     // Human-readable: "Grand Total (₹)"
  category?: 'financial' | 'schedule' | 'specifications' | 'terms' | 'general';
  oldValue: any;
  newValue: any;
  type: 'STRING' | 'NUMBER' | 'CURRENCY' | 'DATE' | 'STATUS' | 'BOOLEAN';
}

// Complete Comparison Result between Version A and Version B
export interface VersionComparisonResult {
  sourceVersion: DocumentVersionMetadata;
  targetVersion: DocumentVersionMetadata;
  macroDiff: {
    statusChanged: boolean;
    oldStatus: string;
    newStatus: string;
    financialDifference?: {
      oldAmount: number;
      newAmount: number;
      diffAmount: number;
      percentageChange: number;
    };
  };
  fieldDiffs: FieldDiff[];
  lineItemDiffs: {
    tableName: string;
    tableLabel: string;
    items: LineItemDiff[];
    summary: {
      added: number;
      removed: number;
      modified: number;
      unchanged: number;
    };
  }[];
  timestamp: string;
}

// Level 4: Nano - Single Field History (Google Sheets "Show Edit History" pattern)
export interface SingleFieldHistoryEntry {
  id: string;
  fieldPath: string;
  oldValue: any;
  newValue: any;
  changedAt: string;
  changedBy: {
    userId: string;
    userName: string;
    role?: string;
  };
  versionNumber: string;
  reason?: string;
}
