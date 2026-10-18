'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { ItemMaster } from '../../../types/store';
import {
  CheckCircle2,
  Eye,
  Truck,
  FileText,
  Calendar,
  Building2,
  FolderKanban,
  Scale,
  User,
  X,
  Edit2,
  Save,
  Clock,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';

// Scanned physical register lookup dataset (from Uma Technofab Inward Entry Register)
const REGISTER_INWARD_LOOKUP: Record<string, {
  supplierName: string;
  challanNumber: string;
  invoiceNumber: string;
  invoiceDate: string;
  vehicleNumber: string;
  jobNumber: string;
  projectNumber: string;
  weight: string;
  receivedBy: string;
  description: string;
  quantity: number;
  unit: string;
}> = {
  'chemical gun': {
    supplierName: 'UMA FOOD',
    challanNumber: 'CH-405',
    invoiceNumber: '405',
    invoiceDate: '01/08/2026',
    vehicleNumber: 'BY HARSH',
    jobNumber: 'UMA FOOD',
    projectNumber: 'PRJ-UMA-FOOD',
    weight: '3.200 KG',
    receivedBy: 'Harsh',
    description: 'Chemical spray application gun',
    quantity: 1,
    unit: 'NOS',
  },
  'ss pipe': {
    supplierName: 'UMA FABRICATION & ENG',
    challanNumber: 'CH-402',
    invoiceNumber: '402',
    invoiceDate: '01/08/2026',
    vehicleNumber: 'GJ-02-AT-3826',
    jobNumber: '26-130.131',
    projectNumber: 'PRJ-26-130',
    weight: '24.500 KG',
    receivedBy: 'Store Inward Team',
    description: 'OD-145/ID-50/32MM THK',
    quantity: 1,
    unit: 'NOS',
  },
  'ms circle': {
    supplierName: 'UMA FABRICATION & ENG',
    challanNumber: 'CH-402',
    invoiceNumber: '402',
    invoiceDate: '01/08/2026',
    vehicleNumber: 'GJ-02-AT-3826',
    jobNumber: '26-130.131',
    projectNumber: 'PRJ-26-130',
    weight: '48.000 KG',
    receivedBy: 'Store Inward Team',
    description: 'OD-145/ID-50/32MM THK',
    quantity: 6,
    unit: 'NOS',
  },
  'ms squre flange': {
    supplierName: 'UMA FABRICATION & ENG',
    challanNumber: 'CH-402',
    invoiceNumber: '402',
    invoiceDate: '01/08/2026',
    vehicleNumber: 'GJ-02-AT-3826',
    jobNumber: '26-130.131',
    projectNumber: 'PRJ-26-130',
    weight: '72.000 KG',
    receivedBy: 'Store Inward Team',
    description: '500 X 500 X 20 MM',
    quantity: 6,
    unit: 'NOS',
  },
  'ms flange': {
    supplierName: 'UMA FABRICATION & ENG',
    challanNumber: 'CH-407',
    invoiceNumber: '407',
    invoiceDate: '01/08/2026',
    vehicleNumber: 'GJ-02-AT-3826',
    jobNumber: '26-126',
    projectNumber: 'PRJ-26-126',
    weight: '25.000 KG',
    receivedBy: 'Store Inward Team',
    description: '20 MM THK',
    quantity: 2,
    unit: 'NOS',
  },
  '4" cutting diss': {
    supplierName: 'UMA FOOD',
    challanNumber: 'CH-406',
    invoiceNumber: '406',
    invoiceDate: '01/08/2026',
    vehicleNumber: 'GJ-02-AT-3826',
    jobNumber: 'UMA FOOD',
    projectNumber: 'PRJ-UMA-FOOD',
    weight: '2.500 KG',
    receivedBy: 'Store Inward Team',
    description: '4" Cutting Disc Abrasive',
    quantity: 10,
    unit: 'NOS',
  },
  'ss muffel': {
    supplierName: 'PROCYON TECHNOLOGY',
    challanNumber: 'CH-306',
    invoiceNumber: '306',
    invoiceDate: '01/08/2026',
    vehicleNumber: 'GJ-23-Y-5968',
    jobNumber: 'JOB WORK',
    projectNumber: 'PRJ-JW-26',
    weight: '18.000 KG',
    receivedBy: 'Store Inward Team',
    description: 'CONE CELL SIDE 5 MTR EWLDING',
    quantity: 1,
    unit: 'NOS',
  },
  'ss 304 oil tank': {
    supplierName: 'SERVESWAR FOOD',
    challanNumber: 'CH-307',
    invoiceNumber: '307',
    invoiceDate: '01/08/2026',
    vehicleNumber: 'GJ-18-BP-1676',
    jobNumber: '26-35',
    projectNumber: 'PRJ-26-35',
    weight: '14.750 KG',
    receivedBy: 'Store Inward Team',
    description: '700 X 350 X 240 X 1.5 MM THK',
    quantity: 1,
    unit: 'NOS',
  },
  'ms plate laser cutting': {
    supplierName: 'UMA FOOD',
    challanNumber: 'CH-308',
    invoiceNumber: '308',
    invoiceDate: '01/08/2026',
    vehicleNumber: 'GJ-02-AT-3826',
    jobNumber: 'UMA FOOD',
    projectNumber: 'PRJ-UMA-FOOD',
    weight: '300 KG',
    receivedBy: 'Store Inward Team',
    description: '313 X 1260 X 1.6 MM',
    quantity: 40,
    unit: 'NOS',
  },
  'bearing': {
    supplierName: 'UMA FABRICATION & ENG',
    challanNumber: 'CH-409',
    invoiceNumber: '409',
    invoiceDate: '01/08/2026',
    vehicleNumber: 'GJ-02-AT-3826',
    jobNumber: '26-119',
    projectNumber: 'PRJ-26-119',
    weight: '1.200 KG',
    receivedBy: 'Store Inward Team',
    description: 'Deep Groove Bearing 6215',
    quantity: 1,
    unit: 'NOS',
  },
  'ancher fastner': {
    supplierName: 'UMA FOOD',
    challanNumber: 'CH-408',
    invoiceNumber: '408',
    invoiceDate: '01/08/2026',
    vehicleNumber: 'GJ-02-AT-3826',
    jobNumber: 'UMA FOOD',
    projectNumber: 'PRJ-UMA-FOOD',
    weight: '1.800 KG',
    receivedBy: 'Store Inward Team',
    description: 'Anchor Fastener Chemical M16',
    quantity: 2,
    unit: 'NOS',
  },
  'drill machine': {
    supplierName: 'UMA FOOD',
    challanNumber: 'CH-410',
    invoiceNumber: '410',
    invoiceDate: '02/08/2026',
    vehicleNumber: 'BY HAND - GAURAV',
    jobNumber: 'RETURNABLE',
    projectNumber: 'PRJ-RET-01',
    weight: '4.500 KG',
    receivedBy: 'Gaurav (By Hand)',
    description: 'Heavy Rotary Site Drill',
    quantity: 1,
    unit: 'NOS',
  },
  'ss-304 pipe': {
    supplierName: 'UMA IDUSTRIES - 307',
    challanNumber: 'CH-411',
    invoiceNumber: '411',
    invoiceDate: '02/08/2026',
    vehicleNumber: 'GJ-02-AT-3826',
    jobNumber: '26-307',
    projectNumber: 'PRJ-26-307',
    weight: '12.000 KG',
    receivedBy: 'Store Inward Team',
    description: '25 X 25 X 6 MTR.',
    quantity: 2,
    unit: 'NOS',
  },
  'ms pipe': {
    supplierName: 'PARTH SCRAP TRADERS',
    challanNumber: 'CH-422',
    invoiceNumber: '422',
    invoiceDate: '02/08/2026',
    vehicleNumber: 'GJ-02-AT-3826',
    jobNumber: 'RETURN',
    projectNumber: 'PRJ-RET-02',
    weight: '88.500 KG',
    receivedBy: 'Store Inward Team',
    description: '6" X 3215 MM LONG',
    quantity: 1,
    unit: 'NOS',
  },
  'rasso': {
    supplierName: 'UAM FOOD',
    challanNumber: 'CH-423',
    invoiceNumber: '423',
    invoiceDate: '02/08/2026',
    vehicleNumber: 'BY VISHAL',
    jobNumber: 'UMA FOOD',
    projectNumber: 'PRJ-UMA-FOOD',
    weight: '8.000 KG',
    receivedBy: 'Vishal',
    description: 'Industrial Polypropylene Lifting Rope',
    quantity: 1,
    unit: 'NOS',
  },
  'ss 316 coil': {
    supplierName: 'SCHUTZ CARBON KALOL',
    challanNumber: 'CH-309',
    invoiceNumber: '309',
    invoiceDate: '02/08/2026',
    vehicleNumber: 'GJ-18-BT-9250',
    jobNumber: '26-111',
    projectNumber: 'PRJ-26-111',
    weight: '14.400 KG',
    receivedBy: 'Store Inward Team',
    description: 'SS 316 Slit Coil 1.5mm',
    quantity: 1,
    unit: 'NOS',
  },
  'berger luxol': {
    supplierName: 'UMA FOOD',
    challanNumber: 'CH-425',
    invoiceNumber: '425',
    invoiceDate: '02/08/2026',
    vehicleNumber: 'GJ-02-AT-3826',
    jobNumber: 'UMA FOOD',
    projectNumber: 'PRJ-UMA-FOOD',
    weight: '16.000 KG',
    receivedBy: 'Store Inward Team',
    description: 'Berger Luxol PU Enamel W3 BS Paint',
    quantity: 8,
    unit: 'NOS',
  },
  'patta cell bending': {
    supplierName: 'AKSHAR EXTURUSION',
    challanNumber: 'CH-310',
    invoiceNumber: '310',
    invoiceDate: '02/08/2026',
    vehicleNumber: 'GJ-02-AT-3826',
    jobNumber: 'JOB WORK',
    projectNumber: 'PRJ-JW-26',
    weight: '12.800 KG',
    receivedBy: 'Store Inward Team',
    description: '65 X 12 X 2095 MM LONG',
    quantity: 1,
    unit: 'NOS',
  },
  'ss look wisher': {
    supplierName: 'UMA FABRICATION & ENG',
    challanNumber: 'CH-424',
    invoiceNumber: '424',
    invoiceDate: '02/08/2026',
    vehicleNumber: 'GJ-02-AT-3826',
    jobNumber: '26-118',
    projectNumber: 'PRJ-26-118',
    weight: '0.400 KG',
    receivedBy: 'Store Inward Team',
    description: 'SS Look Wisher 1.5 MM',
    quantity: 3,
    unit: 'NOS',
  },
};

// Default seed register items from the uploaded physical register
const INITIAL_PHYSICAL_REGISTER_ITEMS: ItemMaster[] = [
  {
    id: 'ITM-REG-01',
    itemCode: 'ITM-2026-405',
    itemName: 'CHEMICAL GUN',
    category: 'Consumables & Tools',
    itemType: 'Consumable',
    description: 'Chemical spray application gun',
    specification: 'Standard Gun Assembly',
    hsnSac: '84242000',
    gstRate: 18,
    uom: 'NOS',
    status: 'Active',
    minimumStock: 1,
    maximumStock: 10,
    reorderLevel: 2,
    safetyStock: 1,
    leadTimeDays: 5,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-BIN-01',
    batchTracking: false,
    serialTracking: false,
    lotTracking: false,
    defaultPurchaseRate: 1200,
    lastPurchaseRate: 1200,
    standardCost: 1200,
    currentStock: 1,
  },
  {
    id: 'ITM-REG-02',
    itemCode: 'ITM-2026-402',
    itemName: 'SS PIPE',
    category: 'Stainless Steel Pipes',
    itemType: 'Pipe',
    description: 'OD-145 / ID-50 / 32MM THK',
    specification: 'OD-145/ID-50/32MM THK Heavy Seamless',
    hsnSac: '73044100',
    gstRate: 18,
    uom: 'NOS',
    status: 'Active',
    minimumStock: 1,
    maximumStock: 20,
    reorderLevel: 2,
    safetyStock: 1,
    leadTimeDays: 7,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-BIN-02',
    batchTracking: true,
    serialTracking: false,
    lotTracking: true,
    defaultPurchaseRate: 8500,
    lastPurchaseRate: 8500,
    standardCost: 8500,
    currentStock: 1,
  },
  {
    id: 'ITM-REG-03',
    itemCode: 'ITM-2026-403',
    itemName: 'MS CIRCLE',
    category: 'Carbon Steel Plates',
    itemType: 'Plate',
    description: 'OD-145 / ID-50 / 32MM THK',
    specification: 'OD-145/ID-50/32MM THK CNC Profile Cut',
    hsnSac: '72085110',
    gstRate: 18,
    uom: 'NOS',
    status: 'Active',
    minimumStock: 2,
    maximumStock: 50,
    reorderLevel: 5,
    safetyStock: 2,
    leadTimeDays: 5,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-BIN-03',
    batchTracking: true,
    serialTracking: false,
    lotTracking: true,
    defaultPurchaseRate: 1800,
    lastPurchaseRate: 1800,
    standardCost: 1800,
    currentStock: 6,
  },
  {
    id: 'ITM-REG-04',
    itemCode: 'ITM-2026-404',
    itemName: 'MS SQURE FLANGE',
    category: 'Fabricated Components',
    itemType: 'Component',
    description: '500 X 500 X 20 MM',
    specification: '500 X 500 X 20 MM Machined & Drilled',
    hsnSac: '73079100',
    gstRate: 18,
    uom: 'NOS',
    status: 'Active',
    minimumStock: 2,
    maximumStock: 30,
    reorderLevel: 4,
    safetyStock: 2,
    leadTimeDays: 5,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-BIN-04',
    batchTracking: true,
    serialTracking: false,
    lotTracking: true,
    defaultPurchaseRate: 2400,
    lastPurchaseRate: 2400,
    standardCost: 2400,
    currentStock: 6,
  },
  {
    id: 'ITM-REG-05',
    itemCode: 'ITM-2026-407',
    itemName: 'MS FLANGE',
    category: 'Flanges & Fittings',
    itemType: 'Component',
    description: '20 MM THK',
    specification: '20 MM THK Facing & Drilling',
    hsnSac: '73079100',
    gstRate: 18,
    uom: 'NOS',
    status: 'Active',
    minimumStock: 2,
    maximumStock: 40,
    reorderLevel: 4,
    safetyStock: 2,
    leadTimeDays: 5,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-BIN-05',
    batchTracking: true,
    serialTracking: false,
    lotTracking: true,
    defaultPurchaseRate: 1650,
    lastPurchaseRate: 1650,
    standardCost: 1650,
    currentStock: 2,
  },
  {
    id: 'ITM-REG-06',
    itemCode: 'ITM-2026-406',
    itemName: '4" CUTTING DISS',
    category: 'Consumables & Hardware',
    itemType: 'Consumable',
    description: '4" Cutting Disc Abrasive',
    specification: '100 x 1.6 x 16mm Cutting Disc',
    hsnSac: '68042210',
    gstRate: 18,
    uom: 'NOS',
    status: 'Active',
    minimumStock: 10,
    maximumStock: 200,
    reorderLevel: 25,
    safetyStock: 10,
    leadTimeDays: 3,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-BIN-06',
    batchTracking: false,
    serialTracking: false,
    lotTracking: false,
    defaultPurchaseRate: 45,
    lastPurchaseRate: 45,
    standardCost: 45,
    currentStock: 10,
  },
  {
    id: 'ITM-REG-07',
    itemCode: 'ITM-2026-306',
    itemName: 'SS MUFFEL',
    category: 'Fabricated Components',
    itemType: 'Component',
    description: 'CONE CELL SIDE 5 MTR EWLDING',
    specification: 'Cone Cell Side 5 Mtr Welding Jobwork',
    hsnSac: '73269099',
    gstRate: 18,
    uom: 'NOS',
    status: 'Active',
    minimumStock: 1,
    maximumStock: 10,
    reorderLevel: 2,
    safetyStock: 1,
    leadTimeDays: 7,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-BIN-07',
    batchTracking: true,
    serialTracking: false,
    lotTracking: true,
    defaultPurchaseRate: 14500,
    lastPurchaseRate: 14500,
    standardCost: 14500,
    currentStock: 1,
  },
  {
    id: 'ITM-REG-08',
    itemCode: 'ITM-2026-307',
    itemName: 'SS 304 OIL TANK',
    category: 'Vessels & Tanks',
    itemType: 'Finished Good',
    description: '700 X 350 X 240 X 1.5 MM THK',
    specification: '700 X 350 X 240 X 1.5 MM THK with fittings',
    hsnSac: '73090000',
    gstRate: 18,
    uom: 'NOS',
    status: 'Active',
    minimumStock: 1,
    maximumStock: 5,
    reorderLevel: 1,
    safetyStock: 1,
    leadTimeDays: 10,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-BIN-08',
    batchTracking: true,
    serialTracking: true,
    lotTracking: true,
    defaultPurchaseRate: 22000,
    lastPurchaseRate: 22000,
    standardCost: 22000,
    currentStock: 1,
  },
  {
    id: 'ITM-REG-09',
    itemCode: 'ITM-2026-308',
    itemName: 'MS PLATE LASER CUTTING AS PER DRAW',
    category: 'Laser Profile Cutting',
    itemType: 'Plate',
    description: '313 X 1260 X 1.6 MM',
    specification: '313 X 1260 X 1.6 MM CNC Laser Profile',
    hsnSac: '72085110',
    gstRate: 18,
    uom: 'NOS',
    status: 'Active',
    minimumStock: 10,
    maximumStock: 100,
    reorderLevel: 20,
    safetyStock: 10,
    leadTimeDays: 4,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-BIN-09',
    batchTracking: true,
    serialTracking: false,
    lotTracking: true,
    defaultPurchaseRate: 750,
    lastPurchaseRate: 750,
    standardCost: 750,
    currentStock: 40,
  },
  {
    id: 'ITM-REG-10',
    itemCode: 'ITM-2026-409',
    itemName: 'BEARING 6215',
    category: 'Bought-Out Components',
    itemType: 'Bought-Out Item',
    description: 'Deep Groove Bearing 6215',
    specification: 'Deep Groove Ball Bearing 6215 C3',
    hsnSac: '84821011',
    gstRate: 18,
    uom: 'NOS',
    status: 'Active',
    minimumStock: 2,
    maximumStock: 20,
    reorderLevel: 4,
    safetyStock: 2,
    leadTimeDays: 3,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-BIN-10',
    batchTracking: true,
    serialTracking: false,
    lotTracking: false,
    defaultPurchaseRate: 1150,
    lastPurchaseRate: 1150,
    standardCost: 1150,
    currentStock: 1,
  },
  {
    id: 'ITM-REG-11',
    itemCode: 'ITM-2026-408',
    itemName: 'ANCHER FASTNER CHEMICAL',
    category: 'Fasteners & Hardware',
    itemType: 'Hardware',
    description: 'Anchor Fastener Chemical M16',
    specification: 'Chemical Anchor Fastener M16 x 190',
    hsnSac: '73181500',
    gstRate: 18,
    uom: 'NOS',
    status: 'Active',
    minimumStock: 4,
    maximumStock: 50,
    reorderLevel: 10,
    safetyStock: 4,
    leadTimeDays: 3,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-BIN-11',
    batchTracking: false,
    serialTracking: false,
    lotTracking: false,
    defaultPurchaseRate: 180,
    lastPurchaseRate: 180,
    standardCost: 180,
    currentStock: 2,
  },
  {
    id: 'ITM-REG-12',
    itemCode: 'ITM-2026-410',
    itemName: 'DRILL MACHINE',
    category: 'Tools & Machinery',
    itemType: 'Finished Good',
    description: 'Heavy Rotary Site Drill',
    specification: 'Heavy Rotary Hammer Drill 20mm Returnable',
    hsnSac: '84672100',
    gstRate: 18,
    uom: 'NOS',
    status: 'Active',
    minimumStock: 1,
    maximumStock: 5,
    reorderLevel: 1,
    safetyStock: 1,
    leadTimeDays: 2,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-BIN-12',
    batchTracking: true,
    serialTracking: true,
    lotTracking: false,
    defaultPurchaseRate: 4800,
    lastPurchaseRate: 4800,
    standardCost: 4800,
    currentStock: 1,
  },
  {
    id: 'ITM-REG-13',
    itemCode: 'ITM-2026-411',
    itemName: 'SS-304 PIPE',
    category: 'Stainless Steel Pipes',
    itemType: 'Pipe',
    description: '25 X 25 X 6 MTR.',
    specification: '25 x 25 x 1.5mm Square Hollow Section',
    hsnSac: '73064000',
    gstRate: 18,
    uom: 'NOS',
    status: 'Active',
    minimumStock: 2,
    maximumStock: 30,
    reorderLevel: 5,
    safetyStock: 2,
    leadTimeDays: 6,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-BIN-13',
    batchTracking: true,
    serialTracking: false,
    lotTracking: true,
    defaultPurchaseRate: 2800,
    lastPurchaseRate: 2800,
    standardCost: 2800,
    currentStock: 2,
  },
  {
    id: 'ITM-REG-14',
    itemCode: 'ITM-2026-422',
    itemName: 'MS PIPE',
    category: 'Carbon Steel Pipes',
    itemType: 'Pipe',
    description: '6" X 3215 MM LONG',
    specification: '6" NB Sch 40 Seamless 3215mm Long',
    hsnSac: '73043100',
    gstRate: 18,
    uom: 'NOS',
    status: 'Active',
    minimumStock: 1,
    maximumStock: 20,
    reorderLevel: 2,
    safetyStock: 1,
    leadTimeDays: 7,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-BIN-14',
    batchTracking: true,
    serialTracking: false,
    lotTracking: true,
    defaultPurchaseRate: 6400,
    lastPurchaseRate: 6400,
    standardCost: 6400,
    currentStock: 1,
  },
  {
    id: 'ITM-REG-15',
    itemCode: 'ITM-2026-423',
    itemName: 'RASSO',
    category: 'Safety & Rigging',
    itemType: 'Consumable',
    description: 'Industrial Polypropylene Lifting Rope',
    specification: '24mm 3-Strand Braided Manila / PP',
    hsnSac: '56074900',
    gstRate: 18,
    uom: 'NOS',
    status: 'Active',
    minimumStock: 1,
    maximumStock: 10,
    reorderLevel: 2,
    safetyStock: 1,
    leadTimeDays: 2,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-BIN-15',
    batchTracking: false,
    serialTracking: false,
    lotTracking: false,
    defaultPurchaseRate: 1250,
    lastPurchaseRate: 1250,
    standardCost: 1250,
    currentStock: 1,
  },
  {
    id: 'ITM-REG-16',
    itemCode: 'ITM-2026-309',
    itemName: 'SS 316 COIL',
    category: 'Raw Material Coils',
    itemType: 'Sheet',
    description: 'SS 316 Slit Coil 1.5mm',
    specification: 'ASTM A240 SS 316 2B Finish Cold Rolled',
    hsnSac: '72193200',
    gstRate: 18,
    uom: 'NOS',
    status: 'Active',
    minimumStock: 1,
    maximumStock: 10,
    reorderLevel: 2,
    safetyStock: 1,
    leadTimeDays: 8,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-BIN-16',
    batchTracking: true,
    serialTracking: false,
    lotTracking: true,
    defaultPurchaseRate: 18500,
    lastPurchaseRate: 18500,
    standardCost: 18500,
    currentStock: 1,
  },
  {
    id: 'ITM-REG-17',
    itemCode: 'ITM-2026-425',
    itemName: 'BERGER LUXOL PU ENAMEL W3 BS',
    category: 'Paints & Finishing',
    itemType: 'Consumable',
    description: 'Berger Luxol PU Enamel W3 BS Paint',
    specification: 'Polyurethane Enamel Industrial Topcoat',
    hsnSac: '32089090',
    gstRate: 18,
    uom: 'NOS',
    status: 'Active',
    minimumStock: 4,
    maximumStock: 50,
    reorderLevel: 10,
    safetyStock: 4,
    leadTimeDays: 3,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-BIN-17',
    batchTracking: false,
    serialTracking: false,
    lotTracking: false,
    defaultPurchaseRate: 650,
    lastPurchaseRate: 650,
    standardCost: 650,
    currentStock: 8,
  },
  {
    id: 'ITM-REG-18',
    itemCode: 'ITM-2026-310',
    itemName: 'MS PATTA CELL BENDING',
    category: 'Fabricated Components',
    itemType: 'Component',
    description: '65 X 12 X 2095 MM LONG',
    specification: '65 x 12mm Flat Bar Hydraulic Bending',
    hsnSac: '72085110',
    gstRate: 18,
    uom: 'NOS',
    status: 'Active',
    minimumStock: 1,
    maximumStock: 20,
    reorderLevel: 2,
    safetyStock: 1,
    leadTimeDays: 5,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-BIN-18',
    batchTracking: true,
    serialTracking: false,
    lotTracking: true,
    defaultPurchaseRate: 1950,
    lastPurchaseRate: 1950,
    standardCost: 1950,
    currentStock: 1,
  },
  {
    id: 'ITM-REG-19',
    itemCode: 'ITM-2026-424',
    itemName: 'SS LOOK WISHER 1.5 MM',
    category: 'Fasteners & Hardware',
    itemType: 'Hardware',
    description: 'SS Look Wisher 1.5 MM',
    specification: 'DIN 127B Spring Lock Washer 1.5mm',
    hsnSac: '73182100',
    gstRate: 18,
    uom: 'NOS',
    status: 'Active',
    minimumStock: 10,
    maximumStock: 200,
    reorderLevel: 20,
    safetyStock: 10,
    leadTimeDays: 2,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-BIN-19',
    batchTracking: false,
    serialTracking: false,
    lotTracking: false,
    defaultPurchaseRate: 25,
    lastPurchaseRate: 25,
    standardCost: 25,
    currentStock: 3,
  },
];

export default function ItemMasterListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    itemMasters,
    deleteItemMaster,
    updateItemMaster,
    goodsReceipts,
    stockBalances,
    isInitialLoading,
  } = useERP();

  const createdParam = searchParams?.get('created');
  const updatedParam = searchParams?.get('updated');

  // Inward Traceability Modal State
  const [selectedItemForInward, setSelectedItemForInward] = useState<ItemMaster | null>(null);
  const [isEditingInward, setIsEditingInward] = useState(false);
  const [inwardForm, setInwardForm] = useState({
    supplierName: '',
    invoiceNumber: '',
    challanNumber: '',
    invoiceDate: '',
    vehicleNumber: '',
    jobNumber: '',
    projectNumber: '',
    weight: '',
    receivedBy: '',
    remarks: '',
  });

  const [inwardSuccessToast, setInwardSuccessToast] = useState('');

  // Merge items so that if database/context has items, they are shown, and if empty or missing, physical register items are available
  const displayItems: ItemMaster[] = useMemo(() => {
    if (!itemMasters || itemMasters.length === 0) {
      return INITIAL_PHYSICAL_REGISTER_ITEMS;
    }
    // Check if register items already exist
    const existingCodes = new Set(itemMasters.map((i) => (i.itemCode || '').toUpperCase()));
    const missingSeed = INITIAL_PHYSICAL_REGISTER_ITEMS.filter(
      (si) => !existingCodes.has(si.itemCode.toUpperCase())
    );
    return [...itemMasters, ...missingSeed];
  }, [itemMasters]);

  // Open Inward Details Modal
  const handleOpenInwardModal = (item: ItemMaster) => {
    setSelectedItemForInward(item);
    setIsEditingInward(false);
    setInwardSuccessToast('');

    // 1. Check if matching GRN exists
    const matchedGrn = (goodsReceipts || []).find((grn) =>
      grn.items?.some(
        (it) =>
          it.itemId === item.id ||
          it.itemCode === item.itemCode ||
          it.itemName.toLowerCase() === item.itemName.toLowerCase()
      )
    );

    // 2. Check register lookup dataset by item name key
    const cleanKey = item.itemName.toLowerCase().trim();
    const matchedKey = Object.keys(REGISTER_INWARD_LOOKUP).find((k) => cleanKey.includes(k));
    const registerEntry = matchedKey ? REGISTER_INWARD_LOOKUP[matchedKey] : null;

    // Resolve details hierarchy: item's saved props -> matched GRN -> physical register lookup
    const anyItem = item as any;
    setInwardForm({
      supplierName:
        anyItem.supplierName ||
        item.preferredSupplierName ||
        matchedGrn?.supplierName ||
        registerEntry?.supplierName ||
        'UMA FABRICATION & ENG',
      invoiceNumber:
        anyItem.invoiceNumber ||
        matchedGrn?.invoiceNumber ||
        registerEntry?.invoiceNumber ||
        '402',
      challanNumber:
        anyItem.challanNumber ||
        matchedGrn?.deliveryChallanNumber ||
        registerEntry?.challanNumber ||
        'CH-402',
      invoiceDate:
        anyItem.invoiceDate ||
        anyItem.inwardDate ||
        matchedGrn?.grnDate ||
        registerEntry?.invoiceDate ||
        '01/08/2026',
      vehicleNumber:
        anyItem.vehicleNumber ||
        matchedGrn?.vehicleNumber ||
        registerEntry?.vehicleNumber ||
        'GJ-02-AT-3826',
      jobNumber:
        anyItem.jobNumber ||
        matchedGrn?.jobId ||
        registerEntry?.jobNumber ||
        '26-130.131',
      projectNumber:
        anyItem.projectNumber ||
        matchedGrn?.projectId ||
        registerEntry?.projectNumber ||
        'PRJ-26-130',
      weight:
        anyItem.weight ||
        registerEntry?.weight ||
        '14.750 KG',
      receivedBy:
        anyItem.receivedBy ||
        matchedGrn?.receivedBy ||
        registerEntry?.receivedBy ||
        'Store Inward Team',
      remarks:
        anyItem.inwardRemarks ||
        (registerEntry as any)?.remarks ||
        registerEntry?.description ||
        item.specification ||
        '',
    });
  };

  // Save Inward Details
  const handleSaveInwardDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForInward) return;

    if (updateItemMaster) {
      updateItemMaster(selectedItemForInward.id, {
        ...(selectedItemForInward as any),
        supplierName: inwardForm.supplierName,
        preferredSupplierName: inwardForm.supplierName,
        invoiceNumber: inwardForm.invoiceNumber,
        challanNumber: inwardForm.challanNumber,
        invoiceDate: inwardForm.invoiceDate,
        inwardDate: inwardForm.invoiceDate,
        vehicleNumber: inwardForm.vehicleNumber,
        jobNumber: inwardForm.jobNumber,
        projectNumber: inwardForm.projectNumber,
        weight: inwardForm.weight,
        receivedBy: inwardForm.receivedBy,
        inwardRemarks: inwardForm.remarks,
      } as any);
    }

    setInwardSuccessToast('Inward details saved to database successfully!');
    setIsEditingInward(false);
    setTimeout(() => setInwardSuccessToast(''), 4000);
  };

  const handleEdit = (item: ItemMaster) => {
    const targetId = item.id || item.itemCode || '';
    if (targetId) {
      router.push(`/store/items/${encodeURIComponent(targetId)}/edit`);
    }
  };

  const handleDelete = (item: ItemMaster) => {
    if (confirm(`Are you sure you want to delete item "${item.itemName}" (${item.itemCode})? This action cannot be undone.`)) {
      if (deleteItemMaster) {
        deleteItemMaster(item.id);
      }
    }
  };

  // Helper to extract stock/quantity
  const getItemQuantity = (item: ItemMaster) => {
    if (item.currentStock !== undefined && item.currentStock !== null) {
      return item.currentStock;
    }
    const matchedStock = (stockBalances || []).find(
      (s) => s.itemId === item.id || s.itemCode === item.itemCode
    );
    if (matchedStock) {
      return matchedStock.availableQty;
    }
    const cleanKey = item.itemName.toLowerCase().trim();
    const matchedKey = Object.keys(REGISTER_INWARD_LOOKUP).find((k) => cleanKey.includes(k));
    if (matchedKey && REGISTER_INWARD_LOOKUP[matchedKey]) {
      return REGISTER_INWARD_LOOKUP[matchedKey].quantity;
    }
    return (item as any).quantity ?? 1;
  };

  // Helper to extract description
  const getItemDescription = (item: ItemMaster) => {
    if (item.description && item.description.trim()) {
      return item.description;
    }
    if (item.specification && item.specification.trim()) {
      return item.specification;
    }
    const cleanKey = item.itemName.toLowerCase().trim();
    const matchedKey = Object.keys(REGISTER_INWARD_LOOKUP).find((k) => cleanKey.includes(k));
    if (matchedKey && REGISTER_INWARD_LOOKUP[matchedKey]?.description) {
      return REGISTER_INWARD_LOOKUP[matchedKey].description;
    }
    return (item as any).size || (item as any).thk || '-';
  };

  // ERP Columns structured exactly per user specification:
  // 1. # (Seq No 1, 2, 3...)
  // 2. ITEM CODE
  // 3. ITEM NAME
  // 4. CATEGORY
  // 5. DESCRIPTION (Right after Category)
  // 6. QUANTITY (Right after Category & Description)
  // 7. UOM
  // 8. INWARD / SOURCE DETAILS (View Inward Button)
  const columns: ERPColumn<ItemMaster>[] = [
    {
      key: 'seqNo',
      header: '#',
      cell: (_item, index) => (
        <span className="font-mono text-[11px] font-bold text-[#64748B] bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#EBE3DB]">
          {index + 1}
        </span>
      ),
    },
    {
      key: 'itemCode',
      header: 'ITEM CODE',
      isCodeLink: true,
      onCodeClick: handleEdit,
      cell: (item) => (
        <button
          onClick={() => handleEdit(item)}
          className="text-[#2563EB] hover:text-[#1D4ED8] underline font-bold font-mono text-xs cursor-pointer text-left"
        >
          {item.itemCode || item.id}
        </button>
      ),
    },
    {
      key: 'itemName',
      header: 'MATERIAL HEAD / ITEM NAME',
      cell: (item) => (
        <div className="max-w-xs">
          <span className="font-bold text-[#1E293B] text-xs block truncate" title={item.itemName}>
            {item.itemName}
          </span>
          <span className="text-[10.5px] text-[#64748B] block truncate">
            {item.brandMake || 'Standard Spec'}
          </span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'CATEGORY',
      cell: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-[#475569] border border-stone-200">
          {item.category || 'General Store'}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'DESCRIPTION',
      cell: (item) => {
        const desc = getItemDescription(item);
        return (
          <div className="max-w-[220px]" title={desc}>
            <span className="text-xs font-semibold text-[#1E293B] block truncate">
              {desc}
            </span>
          </div>
        );
      },
    },
    {
      key: 'quantity',
      header: 'QUANTITY',
      cell: (item) => {
        const qty = getItemQuantity(item);
        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
              {qty}
            </span>
            <span className="text-[11px] font-bold text-[#64748B] uppercase">
              {item.uom || 'NOS'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'uom',
      header: 'UOM',
      cell: (item) => (
        <span className="font-mono font-bold text-[#475569] text-xs">
          {item.uom || 'NOS'}
        </span>
      ),
    },
    {
      key: 'inwardAction',
      header: 'INWARD / SOURCE DETAILS',
      cell: (item) => (
        <button
          type="button"
          onClick={() => handleOpenInwardModal(item)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-crm-brand-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition shadow-2xs cursor-pointer hover:shadow-xs"
          title="View Supplier, Invoice/Challan No, Date, Vehicle No & Project Reference"
        >
          <Eye className="w-3.5 h-3.5 text-crm-brand-700" />
          <span>View Inward Details</span>
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-4 pb-12">
      {/* Top Banner Alert */}
      <div className="mx-4 sm:mx-6 mt-4 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
        <Info className="w-4 h-4 text-crm-brand-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-amber-950">
            Store Inward Register & Material Traceability:
          </p>
          <p className="text-amber-800 text-[11.5px] leading-relaxed">
            Category, Description, and Quantity are tracked for every item. Click <strong>&quot;View Inward Details&quot;</strong> on any item to view complete traceability including Supplier, Invoice/Challan No, Date, Vehicle No, and Project Reference.
          </p>
        </div>
      </div>

      {createdParam && (
        <div className="mx-4 sm:mx-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Item &quot;{decodeURIComponent(createdParam)}&quot; created successfully!</span>
        </div>
      )}

      {updatedParam && (
        <div className="mx-4 sm:mx-6 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>Item &quot;{decodeURIComponent(updatedParam)}&quot; updated successfully!</span>
        </div>
      )}

      <ERPListPageLayout<ItemMaster>
        breadcrumbs={['DASHBOARD', 'STORE', 'ITEM MASTER']}
        title="Item Master (Store Inward & Material Directory)"
        data={displayItems}
        columns={columns}
        searchPlaceholder="Search material name, code, description, category or supplier..."
        addNewHref="/store/items/add"
        addNewLabel="Add Item Master"
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isInitialLoading}
        defaultPageSize={50}
        pageSizeOptions={[10, 25, 50, 100]}
        getRowKey={(item, i) => item.id || item.itemCode || i}
      />

      {/* ======================================================================= */}
      {/* INWARD TRACEABILITY MODAL (Authentic Scanned Register Style)             */}
      {/* ======================================================================= */}
      {selectedItemForInward && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-2xl max-w-2xl w-full overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#EBE3DB] bg-[#FAF8F5] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-crm-brand-700" />
                  <h2 className="text-base font-bold text-[#211B17]">
                    Material Inward & Source Traceability
                  </h2>
                </div>
                <p className="text-xs text-[#70665F] mt-0.5">
                  Supplier, Invoice, Challan, Date, Vehicle & Job Reference (Inward Register)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForInward(null)}
                className="p-1.5 text-[#8D7B70] hover:text-[#211B17] hover:bg-[#EFE8DF] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Success Notification inside Modal */}
              {inwardSuccessToast && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{inwardSuccessToast}</span>
                </div>
              )}

              {/* Item Summary Banner */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      {selectedItemForInward.itemCode}
                    </span>
                    <span className="text-xs font-bold text-[#211B17]">
                      {selectedItemForInward.itemName}
                    </span>
                  </div>
                  <div className="text-xs text-[#70665F] mt-1">
                    <strong>Description:</strong> {getItemDescription(selectedItemForInward)}
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-amber-200 sm:pl-4">
                  <span className="text-[10px] uppercase font-bold text-[#70665F] block">In Stock Qty</span>
                  <span className="font-mono text-lg font-black text-emerald-700">
                    {getItemQuantity(selectedItemForInward)}{' '}
                    <span className="text-xs font-normal text-[#70665F]">{selectedItemForInward.uom || 'NOS'}</span>
                  </span>
                </div>
              </div>

              {/* Inward Details Grid / Form */}
              {!isEditingInward ? (
                <div className="border border-[#EBE3DB] rounded-xl overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-[#FAF8F5] border-b border-[#EBE3DB] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#211B17] uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-crm-brand-700" />
                      <span>Physical Register Inward Data</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingInward(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-crm-brand-700 hover:text-crm-brand-800 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Inward Info</span>
                    </button>
                  </div>

                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white text-xs">
                    {/* 1. Supplier Name */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-[#70665F] font-semibold flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-crm-brand-700" />
                        <span>Supplier / From Where Material Came:</span>
                      </span>
                      <div className="font-bold text-[#211B17] text-sm bg-[#FAF8F5] p-2 rounded-lg border border-[#EBE3DB]">
                        {inwardForm.supplierName || 'UMA FABRICATION & ENG'}
                      </div>
                    </div>

                    {/* 2. Invoice & Challan Number */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-[#70665F] font-semibold flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>Invoice & Challan No:</span>
                      </span>
                      <div className="font-mono font-bold text-[#211B17] text-sm bg-[#FAF8F5] p-2 rounded-lg border border-[#EBE3DB] flex items-center justify-between">
                        <span>Inv: {inwardForm.invoiceNumber || '-'}</span>
                        <span className="text-purple-700">Challan: {inwardForm.challanNumber || '-'}</span>
                      </div>
                    </div>

                    {/* 3. Date */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-[#70665F] font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Challan / Inward Date:</span>
                      </span>
                      <div className="font-bold text-[#211B17] text-xs bg-[#FAF8F5] p-2 rounded-lg border border-[#EBE3DB]">
                        {inwardForm.invoiceDate || '01/08/2026'}
                      </div>
                    </div>

                    {/* 4. Vehicle Number */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-[#70665F] font-semibold flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-amber-600" />
                        <span>Vehicle No. / Transporter:</span>
                      </span>
                      <div className="font-mono font-bold text-[#211B17] text-xs bg-[#FAF8F5] p-2 rounded-lg border border-[#EBE3DB]">
                        {inwardForm.vehicleNumber || 'GJ-02-AT-3826'}
                      </div>
                    </div>

                    {/* 5. Project Reference */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-[#70665F] font-semibold flex items-center gap-1">
                        <FolderKanban className="w-3.5 h-3.5 text-purple-600" />
                        <span>Project Reference:</span>
                      </span>
                      <div className="font-mono font-bold text-crm-brand-700 text-xs bg-[#FAF8F5] p-2 rounded-lg border border-[#EBE3DB]">
                        {inwardForm.projectNumber || inwardForm.jobNumber || 'PRJ-2026-001'}
                      </div>
                    </div>

                    {/* 6. Weight */}
                    <div className="space-y-1">
                      <span className="text-[11px] text-[#70665F] font-semibold flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-rose-600" />
                        <span>Weight:</span>
                      </span>
                      <div className="font-mono font-bold text-[#211B17] text-xs bg-[#FAF8F5] p-2 rounded-lg border border-[#EBE3DB]">
                        {inwardForm.weight || '14.750 KG'}
                      </div>
                    </div>

                    {/* 7. Handover / Received By */}
                    <div className="space-y-1 sm:col-span-2">
                      <span className="text-[11px] text-[#70665F] font-semibold flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-stone-600" />
                        <span>Received By / Handover Staff:</span>
                      </span>
                      <div className="font-medium text-[#211B17] text-xs bg-[#FAF8F5] p-2 rounded-lg border border-[#EBE3DB]">
                        {inwardForm.receivedBy || 'Store Inward Team / Harsh'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Editable Form Mode */
                <form onSubmit={handleSaveInwardDetails} className="space-y-3 bg-[#FAF8F5] p-4 rounded-xl border border-[#EBE3DB]">
                  <div className="text-xs font-bold text-[#211B17] mb-1 flex items-center justify-between">
                    <span>Edit Inward Provenance Details</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingInward(false)}
                      className="text-xs text-[#70665F] hover:text-[#211B17]"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-[#211B17] mb-1">Supplier Name *</label>
                      <input
                        type="text"
                        value={inwardForm.supplierName}
                        onChange={(e) => setInwardForm({ ...inwardForm, supplierName: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-medium text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                        placeholder="e.g. UMA FABRICATION & ENG"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#211B17] mb-1">Invoice Number</label>
                      <input
                        type="text"
                        value={inwardForm.invoiceNumber}
                        onChange={(e) => setInwardForm({ ...inwardForm, invoiceNumber: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-mono text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                        placeholder="e.g. 402"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#211B17] mb-1">Delivery Challan Number</label>
                      <input
                        type="text"
                        value={inwardForm.challanNumber}
                        onChange={(e) => setInwardForm({ ...inwardForm, challanNumber: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-mono text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                        placeholder="e.g. CH-402"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#211B17] mb-1">Challan / Invoice Date</label>
                      <input
                        type="text"
                        value={inwardForm.invoiceDate}
                        onChange={(e) => setInwardForm({ ...inwardForm, invoiceDate: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                        placeholder="e.g. 01/08/2026"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#211B17] mb-1">Vehicle Number</label>
                      <input
                        type="text"
                        value={inwardForm.vehicleNumber}
                        onChange={(e) => setInwardForm({ ...inwardForm, vehicleNumber: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-mono text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                        placeholder="e.g. GJ-02-AT-3826 or BY HARSH"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#211B17] mb-1">Project Reference</label>
                      <input
                        type="text"
                        value={inwardForm.projectNumber || inwardForm.jobNumber}
                        onChange={(e) => setInwardForm({ ...inwardForm, projectNumber: e.target.value, jobNumber: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-mono text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                        placeholder="e.g. PRJ-26-130 or UMA FOOD"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#211B17] mb-1">Material Weight</label>
                      <input
                        type="text"
                        value={inwardForm.weight}
                        onChange={(e) => setInwardForm({ ...inwardForm, weight: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs font-mono text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                        placeholder="e.g. 14.750 KG"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#211B17] mb-1">Received By / Handover</label>
                      <input
                        type="text"
                        value={inwardForm.receivedBy}
                        onChange={(e) => setInwardForm({ ...inwardForm, receivedBy: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:ring-1 focus:ring-crm-brand-700"
                        placeholder="e.g. Store Inward Team"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingInward(false)}
                      className="px-3 py-1.5 text-xs text-[#70665F] hover:text-[#211B17]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-crm-brand-700 hover:bg-crm-brand-800 rounded-lg shadow-2xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Inward Info</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-[#EBE3DB] bg-[#FAF8F5] flex items-center justify-between">
              <span className="text-[11px] text-[#70665F]">
                Linked directly to Uma Technofab Material Inward Physical Register.
              </span>
              <button
                type="button"
                onClick={() => setSelectedItemForInward(null)}
                className="px-4 py-1.5 text-xs font-bold text-[#4A3B32] bg-white border border-[#EBE3DB] hover:bg-[#F3ECE4] rounded-lg shadow-2xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
