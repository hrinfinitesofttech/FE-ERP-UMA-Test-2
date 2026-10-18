'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../../context/ERPContext';
import {
  ERPFormLayout,
  ERPFormSection,
  ERPFormGrid,
  ERPInput,
  ERPSelect,
  ERPCheckbox,
} from '../../../../components/ui/ERPFormLayout';
import { ItemMaster } from '../../../../types/store';

export default function CreateItemMasterPage() {
  const router = useRouter();
  const { addItemMaster, itemCategories, uoms, warehouses } = useERP();

  const initialCode = `ITM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const [formData, setFormData] = useState({
    itemCode: initialCode,
    itemName: '',
    itemType: 'Plate',
    category: itemCategories[0]?.categoryName || 'Stainless Steel Plates & Sheets',
    description: '',
    currentStock: 1,
    specification: '',
    brandMake: 'Jindal / SAIL',
    hsnSac: '72193200',
    gstRate: 18,
    uom: uoms[0]?.uomCode || 'Kg',
    currency: '₹ Indian rupee',
    status: 'Active' as const,
    minimumStock: 500,
    maximumStock: 10000,
    reorderLevel: 2000,
    safetyStock: 400,
    leadTimeDays: 10,
    defaultWarehouseId: warehouses[0]?.warehouseCode || 'WH-001',
    defaultLocationBin: 'W1-ZA-R1-S1-B01',
    batchTracking: true,
    serialTracking: false,
    lotTracking: true,
    defaultPurchaseRate: 350,
    lastPurchaseRate: 350,
    standardCost: 350,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorSummary, setErrorSummary] = useState('');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.itemCode.trim()) {
      errs.itemCode = 'Item Code is required.';
    }
    if (!formData.itemName.trim()) {
      errs.itemName = 'Item Name is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorSummary('');
    if (!validate()) {
      setErrorSummary('Please resolve all highlighted fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      addItemMaster({
        itemCode: formData.itemCode.trim(),
        itemName: formData.itemName.trim(),
        itemType: formData.itemType as any,
        category: formData.category,
        description: formData.description || formData.itemName,
        specification: formData.specification,
        brandMake: formData.brandMake,
        hsnSac: formData.hsnSac,
        gstRate: Number(formData.gstRate) || 18,
        uom: formData.uom,
        status: formData.status,
        minimumStock: Number(formData.minimumStock) || 0,
        maximumStock: Number(formData.maximumStock) || 0,
        reorderLevel: Number(formData.reorderLevel) || 0,
        safetyStock: Number(formData.safetyStock) || 0,
        leadTimeDays: Number(formData.leadTimeDays) || 0,
        defaultWarehouseId: formData.defaultWarehouseId,
        defaultLocationBin: formData.defaultLocationBin,
        batchTracking: formData.batchTracking,
        serialTracking: formData.serialTracking,
        lotTracking: formData.lotTracking,
        defaultPurchaseRate: Number(formData.defaultPurchaseRate) || 0,
        lastPurchaseRate: Number(formData.defaultPurchaseRate) || 0,
        standardCost: Number(formData.standardCost) || 0,
        currentStock: Number(formData.currentStock) || 0,
      });

      setTimeout(() => {
        router.push('/store/items?created=' + encodeURIComponent(formData.itemName));
      }, 300);
    } catch (err: any) {
      console.error(err);
      setErrorSummary(err?.message || 'Failed to save item master.');
      setIsSubmitting(false);
    }
  };

  return (
    <ERPFormLayout
      breadcrumbs={['DASHBOARD', 'STORE', 'ITEM MASTER', 'CREATE']}
      actionTitle="CREATE"
      backHref="/store/items"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Save Item Master"
      errorSummary={errorSummary}
    >
      {/* 1. Item Details (4-Column Grid) */}
      <ERPFormSection number="1." title="Item Details" defaultExpanded={true}>
        <ERPFormGrid>
          <ERPSelect
            label="Category"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={[
              ...itemCategories.map((c) => ({
                label: c.categoryName,
                value: c.categoryName,
              })),
              { label: 'Stainless Steel Plates & Sheets', value: 'Stainless Steel Plates & Sheets' },
              { label: 'Carbon Steel Heavy Plates', value: 'Carbon Steel Heavy Plates' },
              { label: 'Industrial Fasteners & Bolts', value: 'Industrial Fasteners & Bolts' },
            ]}
          />

          <ERPSelect
            label="Unit of Measurement (UOM)"
            required
            value={formData.uom}
            onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
            options={[
              ...uoms.map((u) => ({
                label: `${u.uomCode} - ${u.uomName}`,
                value: u.uomCode,
              })),
              { label: 'Kg - Kilogram', value: 'Kg' },
              { label: 'Nos - Numbers', value: 'Nos' },
              { label: 'Mtr - Meter', value: 'Mtr' },
              { label: 'Set - Set', value: 'Set' },
            ]}
          />

          <ERPInput
            label="Item Code"
            value={formData.itemCode}
            disabled
            placeholder="Auto-generated"
          />

          <ERPInput
            label="Item Name"
            required
            value={formData.itemName}
            onChange={(e) => {
              setFormData({ ...formData, itemName: e.target.value });
              if (errors.itemName) setErrors({ ...errors, itemName: '' });
            }}
            placeholder="e.g. SS PIPE or MS CIRCLE"
            error={errors.itemName}
          />

          <ERPInput
            label="Description (Dimensions / Size / Specification)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g. OD-145/ID-50/32MM THK or 500 X 500 X 20 MM"
          />

          <ERPInput
            label="Stock Quantity"
            type="number"
            value={formData.currentStock}
            onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
            placeholder="Available Quantity"
          />

          <ERPInput
            label="Technical Specification"
            value={formData.specification}
            onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
            placeholder="e.g. ASTM A240 Gr. 304 / 2B Finish"
          />

          <ERPInput
            label="Brand / Make"
            value={formData.brandMake}
            onChange={(e) => setFormData({ ...formData, brandMake: e.target.value })}
            placeholder="e.g. Jindal Stainless / SAIL"
          />

          <ERPInput
            label="HSN / SAC Code"
            value={formData.hsnSac}
            onChange={(e) => setFormData({ ...formData, hsnSac: e.target.value })}
            placeholder="e.g. 72193200"
          />

          <ERPSelect
            label="GST Rate %"
            value={formData.gstRate}
            onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
            options={[
              { label: '18% GST Standard', value: 18 },
              { label: '12% GST', value: 12 },
              { label: '28% GST High', value: 28 },
              { label: '5% GST Low', value: 5 },
              { label: '0% Nil / Exempted', value: 0 },
            ]}
          />

          <ERPInput
            label="Default Purchase Rate (₹)"
            type="number"
            value={formData.defaultPurchaseRate}
            onChange={(e) => setFormData({ ...formData, defaultPurchaseRate: Number(e.target.value) })}
            placeholder="Purchase Price"
          />
        </ERPFormGrid>
      </ERPFormSection>

      {/* 2. Inventory Planning & Stock Thresholds */}
      <ERPFormSection
        number="2."
        title="Inventory Planning & Stock Thresholds"
        subtitle="Reorder levels and warehousing"
        isCollapsible={true}
        defaultExpanded={true}
      >
        <ERPFormGrid>
          <ERPInput
            label="Minimum Stock Level"
            type="number"
            value={formData.minimumStock}
            onChange={(e) => setFormData({ ...formData, minimumStock: Number(e.target.value) })}
          />

          <ERPInput
            label="Maximum Stock Level"
            type="number"
            value={formData.maximumStock}
            onChange={(e) => setFormData({ ...formData, maximumStock: Number(e.target.value) })}
          />

          <ERPInput
            label="Safety Stock Buffer"
            type="number"
            value={formData.safetyStock}
            onChange={(e) => setFormData({ ...formData, safetyStock: Number(e.target.value) })}
          />

          <ERPInput
            label="Lead Time (Days)"
            type="number"
            value={formData.leadTimeDays}
            onChange={(e) => setFormData({ ...formData, leadTimeDays: Number(e.target.value) })}
          />

          <ERPSelect
            label="Default Warehouse"
            value={formData.defaultWarehouseId}
            onChange={(e) => setFormData({ ...formData, defaultWarehouseId: e.target.value })}
            options={[
              ...warehouses.map((w) => ({
                label: `${w.warehouseName} (${w.warehouseCode})`,
                value: w.warehouseCode,
              })),
              { label: 'Central Raw Material Store (WH-001)', value: 'WH-001' },
              { label: 'Finished Goods Bay (WH-002)', value: 'WH-002' },
            ]}
          />

          <ERPInput
            label="Default Rack / Bin Location"
            value={formData.defaultLocationBin}
            onChange={(e) => setFormData({ ...formData, defaultLocationBin: e.target.value })}
            placeholder="e.g. W1-ZA-R1-S1-B01"
          />
        </ERPFormGrid>
      </ERPFormSection>

      {/* 3. Tracking & Quality Parameters */}
      <ERPFormSection
        number="3."
        title="Quality & Tracking Parameters"
        isCollapsible={true}
        defaultExpanded={true}
      >
        <div className="flex flex-wrap items-center gap-8 py-2">
          <ERPCheckbox
            label="Batch / Heat Number Tracking Required"
            checked={formData.batchTracking}
            onChange={(checked) => setFormData({ ...formData, batchTracking: checked })}
          />

          <ERPCheckbox
            label="Lot Number Tracking"
            checked={formData.lotTracking}
            onChange={(checked) => setFormData({ ...formData, lotTracking: checked })}
          />

          <ERPCheckbox
            label="Serial Number Unique Tracking"
            checked={formData.serialTracking}
            onChange={(checked) => setFormData({ ...formData, serialTracking: checked })}
          />
        </div>
      </ERPFormSection>
    </ERPFormLayout>
  );
}
