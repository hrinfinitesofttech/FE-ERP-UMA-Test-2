import {
  WorkCenter,
  RoutingOperation,
  WorkOrder,
  ProductionOrder,
  ProductionScheduleItem,
  MRPItemRequirement,
  ProductionEntry,
  WIPRecord,
  ProductionHold,
  ReworkOrder,
  ProductionScrap,
  FinishedGoodsItem,
  ProductionCostSummary,
  ManufacturingJob,
  ProductionPlan,
} from '../types/production';

export const INITIAL_WORK_CENTERS: WorkCenter[] = [];
export const INITIAL_ROUTING_OPERATIONS: RoutingOperation[] = [];
export const INITIAL_WORK_ORDERS: WorkOrder[] = [];
export const INITIAL_PRODUCTION_ORDERS: ProductionOrder[] = [];
export const INITIAL_PRODUCTION_SCHEDULES: ProductionScheduleItem[] = [];
export const INITIAL_MRP_REQUIREMENTS: MRPItemRequirement[] = [];
export const INITIAL_PRODUCTION_ENTRIES: ProductionEntry[] = [];
export const INITIAL_WIP_RECORDS: WIPRecord[] = [];
export const INITIAL_PRODUCTION_HOLDS: ProductionHold[] = [];
export const INITIAL_REWORK_ORDERS: ReworkOrder[] = [];
export const INITIAL_PRODUCTION_SCRAPS: ProductionScrap[] = [];
export const INITIAL_FINISHED_GOODS: FinishedGoodsItem[] = [];
export const INITIAL_PRODUCTION_COSTS: ProductionCostSummary[] = [];
export const INITIAL_MANUFACTURING_JOBS: ManufacturingJob[] = [];
export const INITIAL_PRODUCTION_PLANS: ProductionPlan[] = [];
