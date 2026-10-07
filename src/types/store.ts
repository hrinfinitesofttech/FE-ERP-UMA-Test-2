export type ItemType =
  | 'Raw Material'
  | 'Sheet'
  | 'Pipe'
  | 'Tube'
  | 'Plate'
  | 'Component'
  | 'Bought-Out Item'
  | 'Consumable'
  | 'Hardware'
  | 'Electrical'
  | 'Pneumatic'
  | 'Finished Good'
  | 'Semi Finished'
  | 'Scrap';

export type WarehouseType =
  | 'Main Store'
  | 'Raw Material Store'
  | 'Component Store'
  | 'Finished Goods Store'
  | 'Scrap Store'
  | 'Consumable Store';

export type GRNStatus =
  | 'Draft'
  | 'Received'
  | 'Inspection Pending'
  | 'Partially Accepted'
  | 'Accepted'
  | 'Rejected'
  | 'Closed';

export type QCResult = 'Pass' | 'Fail' | 'Conditional Approval';

export type ReservationStatus =
  | 'Pending'
  | 'Reserved'
  | 'Partially Reserved'
  | 'Released'
  | 'Consumed'
  | 'Cancelled';

export type IssueStatus =
  | 'Draft'
  | 'Requested'
  | 'Approved'
  | 'Partially Issued'
  | 'Fully Issued'
  | 'Cancelled';

export type ReturnCondition = 'Usable' | 'Damaged' | 'Scrap' | 'Reusable';

export type TransferStatus =
  | 'Draft'
  | 'Requested'
  | 'Approved'
  | 'In Transit'
  | 'Completed'
  | 'Cancelled';

export type ScrapStatus =
  | 'Identified'
  | 'Approved'
  | 'Moved to Scrap'
  | 'Disposed'
  | 'Sold';

export type LedgerTransactionType =
  | 'Opening Stock'
  | 'GRN'
  | 'Quality Acceptance'
  | 'Stock Transfer'
  | 'Material Issue'
  | 'Material Return'
  | 'Stock Adjustment'
  | 'Scrap'
  | 'Purchase Return';

export interface ItemMaster {
  id: string;
  itemCode: string;
  itemName: string;
  itemType: ItemType;
  category: string;
  subCategory?: string;
  description: string;
  specification: string;
  drawingNumber?: string;
  brandMake?: string;
  hsnSac: string;
  gstRate: number;
  uom: string;
  alternateUom?: string;
  barcode?: string;
  status: 'Active' | 'Inactive';
  // Inventory Control
  minimumStock: number;
  maximumStock: number;
  reorderLevel: number;
  safetyStock: number;
  leadTimeDays: number;
  defaultWarehouseId: string;
  defaultLocationBin: string;
  batchTracking: boolean;
  serialTracking: boolean;
  lotTracking: boolean;
  // Costing
  preferredSupplierId?: string;
  preferredSupplierName?: string;
  defaultPurchaseRate: number;
  lastPurchaseRate: number;
  standardCost: number;
  currentStock?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemCategory {
  id: string;
  categoryCode: string;
  categoryName: string;
  parentCategory?: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface UOMMaster {
  id: string;
  uomCode: string;
  uomName: string;
  baseUom: string;
  alternateUom?: string;
  conversionFactor: number; // e.g. 1 Box = 10 Nos => conversionFactor = 10
  description?: string;
}

export interface Warehouse {
  id: string;
  warehouseCode: string;
  warehouseName: string;
  warehouseType: WarehouseType;
  address: string;
  managerName: string;
  contactPhone: string;
  contactEmail: string;
  status: 'Active' | 'Inactive';
  totalBinsCount?: number;
}

export interface WarehouseLocation {
  id: string;
  warehouseId: string;
  warehouseName: string;
  zone: string;
  rack: string;
  shelf: string;
  bin: string;
  locationCode: string; // e.g. W1-ZA-R1-S2-B04
  capacityQty: number;
  status: 'Occupied' | 'Available' | 'Full' | 'Maintenance';
}

export interface OpeningStock {
  id: string;
  entryDate: string;
  warehouseId: string;
  warehouseName: string;
  locationCode: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  batchLot?: string;
  serialNumber?: string;
  quantity: number;
  uom: string;
  rate: number;
  totalValue: number;
  reference: string;
  remarks: string;
  createdBy: string;
}

export interface GRNItem {
  id: string;
  grnId: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  poQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  shortQuantity: number;
  uom: string;
  unitPrice: number;
  totalAmount: number;
  batchLot?: string;
  serialNumber?: string;
  locationCode: string;
  remarks?: string;
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string;
  grnDate: string;
  supplierId: string;
  supplierName: string;
  poId: string;
  poNumber: string;
  projectId: string;
  jobId: string;
  deliveryChallanNumber: string;
  invoiceNumber: string;
  warehouseId: string;
  warehouseName: string;
  receivedBy: string;
  vehicleNumber: string;
  transporterName: string;
  status: GRNStatus;
  items: GRNItem[];
  totalReceivedValue: number;
  remarks?: string;
  createdAt?: string;
}

export interface QCInspection {
  id: string;
  inspectionNumber: string;
  inspectionDate: string;
  grnId: string;
  grnNumber: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  jobId: string;
  supplierName: string;
  requiredSpecification: string;
  actualSpecification: string;
  inspectionParameters: string;
  sampleQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  rejectionReason?: string;
  qcResult: QCResult;
  inspectorName: string;
  remarks?: string;
}

export interface StockBalance {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  category: string;
  categoryName?: string;
  warehouseId: string;
  warehouseName: string;
  locationCode: string;
  batchLot?: string;
  serialNumber?: string;
  availableQty: number;
  currentQuantity?: number;
  uom?: string;
  reservedQty: number;
  allocatedQty: number;
  inTransitQty: number;
  damagedQty: number;
  rejectedQty: number;
  usableQty: number; // Formula: availableQty - reservedQty
  averageRate: number;
  averageUnitCost?: number;
  stockValue: number; // Formula: usableQty * averageRate
  totalValue?: number;
  lastUpdatedDate: string;
}

export interface StockReservation {
  id: string;
  reservationNumber: string;
  projectId: string;
  jobId: string;
  bomId: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  requiredQuantity: number;
  reservedQuantity: number;
  warehouseId: string;
  warehouseName: string;
  locationCode: string;
  requiredDate: string;
  reservedBy: string;
  status: ReservationStatus;
  createdAt?: string;
}

export interface MaterialIssueItem {
  id: string;
  issueId: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  requiredQuantity: number;
  reservedQuantity: number;
  issuedQuantity: number;
  uom: string;
  unitPrice: number;
  totalCost: number;
  batchLot?: string;
  locationCode: string;
  remarks?: string;
}

export interface MaterialIssue {
  id: string;
  issueNumber: string;
  issueDate: string;
  projectId: string;
  jobId: string;
  workOrderNumber: string;
  bomNumber: string;
  bomRevision: string;
  productionStage: string;
  requestedBy: string;
  issuedBy: string;
  warehouseId: string;
  warehouseName: string;
  status: IssueStatus;
  items: MaterialIssueItem[];
  totalIssueValue: number;
  remarks?: string;
  createdAt?: string;
}

export interface MaterialReturnItem {
  id: string;
  returnId: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  issuedQuantity: number;
  usedQuantity: number;
  returnQuantity: number;
  uom: string;
  condition: ReturnCondition;
  unitPrice: number;
  totalReturnValue: number;
  locationCode: string;
  remarks?: string;
}

export interface MaterialReturn {
  id: string;
  returnNumber: string;
  returnDate: string;
  projectId: string;
  jobId: string;
  workOrderNumber: string;
  materialIssueNumber: string;
  warehouseId: string;
  warehouseName: string;
  returnedBy: string;
  receivedBy: string;
  items: MaterialReturnItem[];
  totalReturnValue: number;
  remarks?: string;
  createdAt?: string;
}

export interface StockTransferItem {
  id: string;
  transferId: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  uom: string;
  batchLot?: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  transferDate: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  fromLocationCode: string;
  toWarehouseId: string;
  toWarehouseName: string;
  toLocationCode: string;
  reason: string;
  requestedBy: string;
  approvedBy?: string;
  status: TransferStatus;
  items: StockTransferItem[];
  createdAt?: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  adjustmentDate: string;
  warehouseId: string;
  warehouseName: string;
  locationCode: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  systemQuantity: number;
  physicalQuantity: number;
  differenceQuantity: number;
  unitPrice: number;
  adjustmentValue: number;
  reason: 'Physical Count Difference' | 'Damaged Stock' | 'Missing Stock' | 'Data Correction' | 'Opening Balance Correction' | 'Other';
  remarks: string;
  approvedBy: string;
  createdAt?: string;
}

export interface ScrapEntry {
  id: string;
  scrapNumber: string;
  entryDate: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  uom: string;
  source: 'Purchase Rejection' | 'Production Scrap' | 'Damaged Material' | 'Quality Rejection' | 'Expired Material' | 'Other';
  jobId?: string;
  reason: string;
  warehouseId: string;
  warehouseName: string;
  scrapLocation: string;
  estimatedValue: number;
  disposalStatus: ScrapStatus;
  remarks?: string;
  createdBy: string;
  createdAt?: string;
}

export interface PhysicalStockCountItem {
  id: string;
  countId: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  systemQuantity: number;
  physicalQuantity: number;
  differenceQuantity: number;
  varianceValue: number;
  reason?: string;
}

export interface PhysicalStockCount {
  id: string;
  countNumber: string;
  countDate: string;
  warehouseId: string;
  warehouseName: string;
  counterName: string;
  status: 'Draft' | 'InProgress' | 'Completed' | 'Approved' | 'Adjusted';
  items: PhysicalStockCountItem[];
  totalVarianceValue: number;
  approvedBy?: string;
  remarks?: string;
}

export interface StockLedgerEntry {
  id: string;
  entryDate: string;
  transactionType: LedgerTransactionType;
  transactionNumber: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  warehouseId: string;
  warehouseName: string;
  locationCode: string;
  jobId?: string;
  openingQty: number;
  inQty: number;
  outQty: number;
  closingQty: number;
  rate: number;
  transactionValue: number;
  userName: string;
  remarks?: string;
}
