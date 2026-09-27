import {
  ItemCategory,
  UOMMaster,
  Warehouse,
  WarehouseLocation,
  ItemMaster,
  OpeningStock,
  GoodsReceiptNote,
  QCInspection,
  StockBalance,
  StockReservation,
  MaterialIssue,
  MaterialReturn,
  StockTransfer,
  StockAdjustment,
  ScrapEntry,
  PhysicalStockCount,
  StockLedgerEntry,
} from '../types/store';

export const INITIAL_ITEM_CATEGORIES: ItemCategory[] = [];
export const INITIAL_UOMS: UOMMaster[] = [];
export const INITIAL_WAREHOUSES: Warehouse[] = [];
export const INITIAL_WAREHOUSE_LOCATIONS: WarehouseLocation[] = [];
export const INITIAL_ITEM_MASTERS: ItemMaster[] = [];
export const INITIAL_OPENING_STOCKS: OpeningStock[] = [];
export const INITIAL_GOODS_RECEIPTS: GoodsReceiptNote[] = [];
export const INITIAL_QC_INSPECTIONS: QCInspection[] = [];
export const INITIAL_STOCK_BALANCES: StockBalance[] = [];
export const INITIAL_STOCK_RESERVATIONS: StockReservation[] = [];
export const INITIAL_MATERIAL_ISSUES: MaterialIssue[] = [];
export const INITIAL_MATERIAL_RETURNS: MaterialReturn[] = [];
export const INITIAL_STOCK_TRANSFERS: StockTransfer[] = [];
export const INITIAL_STOCK_ADJUSTMENTS: StockAdjustment[] = [];
export const INITIAL_SCRAP_ENTRIES: ScrapEntry[] = [];
export const INITIAL_PHYSICAL_COUNTS: PhysicalStockCount[] = [];
export const INITIAL_STOCK_LEDGERS: StockLedgerEntry[] = [];
