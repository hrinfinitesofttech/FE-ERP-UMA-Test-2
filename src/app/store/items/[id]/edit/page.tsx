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

  const decodedId = decodeURIComponent(String(itemId || '')).trim();
  const currentItem = itemMasters.find(
    (item) =>
      item.id === decodedId ||
      item.itemCode === decodedId ||
      item.id?.toLowerCase() === decodedId.toLowerCase() ||
      item.itemCode?.toLowerCase() === decodedId.toLowerCase()
  );

  const [formData, setFormData] = useState({
    itemCode: '',
    itemName: '',
    itemType: '',
    category: '',
    description: '',
    currentStock: 0,
    specification: '',
    brandMake: '',
    hsnSac: '',
    gstRate: 18,
    uom: '',
    currency: '₹ Indian rupee',
    status: 'Active' as const,
    minimumStock: 0,
    maximumStock: 0,
    reorderLevel: 0,
    safetyStock: 0,
    leadTimeDays: 0,
    defaultWarehouseId: '',
    defaultLocationBin: '',
    batchTracking: false,
    serialTracking: false,
    lotTracking: false,
    defaultPurchaseRate: 0,
    standardCost: 0,
  });

  useEffect(() => {
    if (currentItem) {
      const anyItem = currentItem as any;
      setFormData({
        itemCode: currentItem.itemCode || currentItem.id || '',
        itemName: currentItem.itemName || anyItem.item_name || '',
        itemType: (currentItem.itemType || anyItem.item_type || '') as any,
        category: currentItem.category || '',
        description: currentItem.description || '',
        currentStock: currentItem.currentStock ?? (anyItem.current_stock ?? 0),
        specification: currentItem.specification || '',
        brandMake: currentItem.brandMake || anyItem.brand_make || '',
        hsnSac: currentItem.hsnSac || anyItem.hsn_sac || '',
        gstRate: currentItem.gstRate !== undefined ? Number(currentItem.gstRate) : (anyItem.gst_rate !== undefined ? Number(anyItem.gst_rate) : 18),
        uom: currentItem.uom || '',
        currency: anyItem.currency || '₹ Indian rupee',
        status: (currentItem.status as any) || 'Active',
        minimumStock: currentItem.minimumStock !== undefined ? Number(currentItem.minimumStock) : (anyItem.minimum_stock !== undefined ? Number(anyItem.minimum_stock) : 0),
        maximumStock: currentItem.maximumStock !== undefined ? Number(currentItem.maximumStock) : (anyItem.maximum_stock !== undefined ? Number(anyItem.maximum_stock) : 0),
        reorderLevel: currentItem.reorderLevel !== undefined ? Number(currentItem.reorderLevel) : (anyItem.reorder_level !== undefined ? Number(anyItem.reorder_level) : 0),
        safetyStock: currentItem.safetyStock !== undefined ? Number(currentItem.safetyStock) : (anyItem.safety_stock !== undefined ? Number(anyItem.safety_stock) : 0),
        leadTimeDays: currentItem.leadTimeDays !== undefined ? Number(currentItem.leadTimeDays) : (anyItem.lead_time_days !== undefined ? Number(anyItem.lead_time_days) : 0),
        defaultWarehouseId: currentItem.defaultWarehouseId || anyItem.warehouse_id || anyItem.default_warehouse_id || (warehouses[0]?.id || ''),
        defaultLocationBin: currentItem.defaultLocationBin || anyItem.location_bin || anyItem.default_location_bin || '',
        batchTracking: currentItem.batchTracking ?? (anyItem.batch_tracking ?? false),
        serialTracking: currentItem.serialTracking ?? (anyItem.serial_tracking ?? false),
        lotTracking: currentItem.lotTracking ?? (anyItem.lot_tracking ?? false),
        defaultPurchaseRate: currentItem.defaultPurchaseRate !== undefined ? Number(currentItem.defaultPurchaseRate) : (anyItem.purchase_rate !== undefined ? Number(anyItem.purchase_rate) : (anyItem.unit_cost !== undefined ? Number(anyItem.unit_cost) : 0)),
        standardCost: currentItem.standardCost !== undefined ? Number(currentItem.standardCost) : (anyItem.standard_cost !== undefined ? Number(anyItem.standard_cost) : (anyItem.unit_cost !== undefined ? Number(anyItem.unit_cost) : 0)),
      });
    }
  }, [currentItem, warehouses]);

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
