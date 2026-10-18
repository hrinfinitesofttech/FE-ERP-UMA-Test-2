'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useERP } from '../../../../../context/ERPContext';
import {
  ERPFormLayout,
  ERPFormSection,
  ERPFormGrid,
  ERPInput,
  ERPSelect,
  ERPCheckbox,
} from '../../../../../components/ui/ERPFormLayout';
import { ItemMaster } from '../../../../../types/store';

export default function EditItemMasterPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params?.id as string;

  const { itemMasters, updateItemMaster, itemCategories, uoms, warehouses } = useERP();

  const currentItem = itemMasters.find(
    (item) => item.id === itemId || item.itemCode === itemId
  );

  const [formData, setFormData] = useState({
    itemCode: '',
    itemName: '',
    itemType: 'Plate',
    category: 'Stainless Steel Plates & Sheets',
    description: '',
    currentStock: 1,
    specification: '',
    brandMake: '',
    hsnSac: '72193200',
    gstRate: 18,
    uom: 'Kg',
    currency: '₹ Indian rupee',
    status: 'Active' as const,
    minimumStock: 500,
    maximumStock: 10000,
    reorderLevel: 2000,
    safetyStock: 400,
    leadTimeDays: 10,
    defaultWarehouseId: 'WH-001',
    defaultLocationBin: 'W1-ZA-R1-S1-B01',
    batchTracking: true,
    serialTracking: false,
    lotTracking: true,
    defaultPurchaseRate: 350,
    standardCost: 350,
  });

  useEffect(() => {
    if (currentItem) {
      setFormData({
        itemCode: currentItem.itemCode || currentItem.id,
        itemName: currentItem.itemName || '',
        itemType: (currentItem.itemType as any) || 'Plate',
        category: currentItem.category || 'Stainless Steel Plates & Sheets',
        description: currentItem.description || '',
        currentStock: currentItem.currentStock ?? 1,
        specification: currentItem.specification || '',
        brandMake: currentItem.brandMake || '',
        hsnSac: currentItem.hsnSac || '72193200',
        gstRate: currentItem.gstRate || 18,
        uom: currentItem.uom || 'Kg',
        currency: '₹ Indian rupee',
        status: (currentItem.status as any) || 'Active',
        minimumStock: currentItem.minimumStock || 0,
        maximumStock: currentItem.maximumStock || 0,
        reorderLevel: currentItem.reorderLevel || 0,
        safetyStock: currentItem.safetyStock || 0,
        leadTimeDays: currentItem.leadTimeDays || 10,
        defaultWarehouseId: currentItem.defaultWarehouseId || 'WH-001',
        defaultLocationBin: currentItem.defaultLocationBin || '',
        batchTracking: currentItem.batchTracking ?? true,
        serialTracking: currentItem.serialTracking ?? false,
        lotTracking: currentItem.lotTracking ?? true,
        defaultPurchaseRate: currentItem.defaultPurchaseRate || 0,
        standardCost: currentItem.standardCost || 0,
      });
    }
  }, [currentItem]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorSummary, setErrorSummary] = useState('');

  const validate = () => {
    const errs: Record<string, string> = {};
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

    if (!currentItem) {
      setErrorSummary('Item record not found.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (updateItemMaster) {
        updateItemMaster(currentItem.id, {
          itemName: formData.itemName.trim(),
          itemType: formData.itemType as any,
          category: formData.category,
          description: formData.description,
          currentStock: Number(formData.currentStock) || 0,
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
          standardCost: Number(formData.standardCost) || 0,
        });
      }

      setTimeout(() => {
        router.push('/store/items?updated=' + encodeURIComponent(formData.itemName));
      }, 300);
    } catch (err: any) {
      console.error(err);
      setErrorSummary(err?.message || 'Failed to update item master.');
      setIsSubmitting(false);
    }
  };

  if (!currentItem) {
    return (
      <div className="p-8 text-center bg-[#F8FAFC] min-h-screen">
        <p className="text-sm font-semibold text-[#64748B]">Item record not found.</p>
        <button
          onClick={() => router.push('/store/items')}
          className="mt-3 px-4 py-2 bg-[#7C3AED] text-white text-xs font-bold rounded-lg"
        >
          Back to Item Master
        </button>
      </div>
    );
  }

  return (
    <ERPFormLayout
      breadcrumbs={['DASHBOARD', 'STORE', 'ITEM MASTER', 'UPDATE']}
      actionTitle="UPDATE"
      backHref="/store/items"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Update Item Master"
      errorSummary={errorSummary}
    >
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
            ]}
          />

          <ERPInput
            label="Item Code"
            value={formData.itemCode}
            disabled
          />

          <ERPInput
            label="Item Name"
            required
            value={formData.itemName}
            onChange={(e) => {
              setFormData({ ...formData, itemName: e.target.value });
              if (errors.itemName) setErrors({ ...errors, itemName: '' });
            }}
            placeholder="Item Name"
            error={errors.itemName}
          />

          <ERPInput
            label="Description (પરિમાણ / સાઇઝ / સ્પેસિફિકેશન)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g. OD-145/ID-50/32MM THK or 500 X 500 X 20 MM"
          />

          <ERPInput
            label="Stock Quantity (કોન્ટીટી)"
            type="number"
            value={formData.currentStock}
            onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
            placeholder="Quantity"
          />

          <ERPInput
            label="Technical Specification"
            value={formData.specification}
            onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
            placeholder="Specification"
          />

          <ERPInput
            label="Brand / Make"
            value={formData.brandMake}
            onChange={(e) => setFormData({ ...formData, brandMake: e.target.value })}
            placeholder="Brand"
          />

          <ERPInput
            label="HSN / SAC Code"
            value={formData.hsnSac}
            onChange={(e) => setFormData({ ...formData, hsnSac: e.target.value })}
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
          />
        </ERPFormGrid>
      </ERPFormSection>

      <ERPFormSection
        number="2."
        title="Inventory Planning & Stock Thresholds"
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
          />
        </ERPFormGrid>
      </ERPFormSection>

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
