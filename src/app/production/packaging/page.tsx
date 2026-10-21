'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import {
  PackagingSlipDoc,
  PackagingItem,
  PackagingBox,
  PackagingItemCategory,
  ProductionCompletion,
} from '../../../types/production';
import { formatDate } from '../../../lib/utils';
import { toast } from '@/context/ToastContext';
import { printContent } from '@/lib/printUtils';
import { api } from '@/lib/apiClient';
import {
  Package,
  Box,
  Plus,
  Search,
  Printer,
  Eye,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Truck,
  Building,
  Calendar,
  Layers,
  Sparkles,
  Save,
  Check,
  FileText,
  RotateCcw,
  Wrench,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';

const CATEGORY_COLORS: Record<PackagingItemCategory, { bg: string; text: string; border: string }> = {
  'Main Equipment': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  'Fasteners & Hardware': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  'Foundation Hardware': { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
  'Gaskets & Seals': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  'Pipe Fittings & Clamps': { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  'Spares & Consumables': { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  'Electrical & Sensors': { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  'Documentation & Manuals': { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200' },
  'Other Accessories': { bg: 'bg-stone-50', text: 'text-stone-800', border: 'border-stone-200' },
};

// Initial sample packaging slips
const INITIAL_PACKAGING_SLIPS: PackagingSlipDoc[] = [
  {
    id: 'PKG-2026-001',
    packingSlipNo: 'PKG-2026-001',
    date: '2026-06-25',
    projectId: 'PRJ-2026-0001',
    projectNumber: 'PRJ-2026-0001',
    projectName: '50KL Chemical Storage Tank',
    jobId: 'JOB-2026-001',
    jobNumber: 'UTF-26-101',
    qcInspectionNumber: 'QC-2026-001 (F - QAS - 02)',
    customerId: 'CUST-001',
    customerName: 'Ananth Chem',
    customerAddress: 'Plot 102/B, GIDC Chemical Zone, Jhagadia, Dist. Bharuch, Gujarat - 393110',
    destinationCity: 'Jhagadia',
    productName: 'SS304 Chemical Storage Tank 50KL',
    packageType: 'Heavy Duty Wooden Crate & Hardware Box',
    packageDimensions: '4800 x 2400 x 2600 mm',
    totalPackages: 2,
    totalGrossWeightKg: 1845,
    totalNetWeightKg: 1680,
    packedBy: 'Ramesh Patel (Packing Supervisor)',
    verifiedBy: 'Hardik Vaghela (QC Lead)',
    status: 'Ready for Dispatch',
    deliveryChallanNo: '548',
    remarks: 'Main tank bolted onto wooden skid. Loose nuts, bolts & gaskets packed in Box 2.',
    boxes: [
      {
        id: 'BOX-1',
        boxNumber: 'Package 1 of 2',
        packageType: 'Heavy Wooden Skid / Crate',
        dimensions: '4800 x 2400 x 2600 mm',
        grossWeightKg: 1780,
        netWeightKg: 1650,
        handlingInstructions: 'Handle with Crane Only. Center of Gravity marked.',
      },
      {
        id: 'BOX-2',
        boxNumber: 'Package 2 of 2',
        packageType: 'Reinforced Corrugated Box',
        dimensions: '600 x 450 x 350 mm',
        grossWeightKg: 65,
        netWeightKg: 30,
        handlingInstructions: 'Hardware & Accessories. Keep Dry.',
      },
    ],
    items: [
      {
        id: 'ITEM-1',
        srNo: 1,
        category: 'Main Equipment',
        particulars: 'SS304 Chemical Storage Tank 50KL (Main Body with Top/Bottom Dished Ends)',
        quantity: 1,
        unit: 'Nos',
        boxNo: 'Package 1 of 2',
        itemWeightKg: 1650,
        notes: 'Hydro tested at 1.5 Bar (0 Leakage)',
        isVerified: true,
      },
      {
        id: 'ITEM-2',
        srNo: 2,
        category: 'Fasteners & Hardware',
        particulars: 'M16 x 65mm Hex Head Bolts with Hex Nuts & Double Washers (SS304)',
        quantity: 48,
        unit: 'Nos',
        boxNo: 'Package 2 of 2',
        itemWeightKg: 14.5,
        notes: 'For manhole and nozzle flange fitment',
        isVerified: true,
      },
      {
        id: 'ITEM-3',
        srNo: 3,
        category: 'Foundation Hardware',
        particulars: 'M24 Foundation J-Bolts with Double Nuts (Length 450mm, MS Galvanized)',
        quantity: 8,
        unit: 'Nos',
        boxNo: 'Package 2 of 2',
        itemWeightKg: 18.0,
        notes: 'Civil foundation anchor kit',
        isVerified: true,
      },
      {
        id: 'ITEM-4',
        srNo: 4,
        category: 'Gaskets & Seals',
        particulars: '100 NB Neoprene Full-Face Flange Gaskets (3mm Thick, 150#)',
        quantity: 6,
        unit: 'Nos',
        boxNo: 'Package 2 of 2',
        itemWeightKg: 1.2,
        notes: 'Acid resistant grade',
        isVerified: true,
      },
      {
        id: 'ITEM-5',
        srNo: 5,
        category: 'Documentation & Manuals',
        particulars: 'Operation & Maintenance Manual, Hydro Test Certificate & Material TC',
        quantity: 1,
        unit: 'Sets',
        boxNo: 'Package 2 of 2',
        itemWeightKg: 0.8,
        notes: 'Sealed in waterproof plastic pouch',
        isVerified: true,
      },
    ],
    createdAt: '2026-06-25T11:00:00Z',
  },
];

function PackagingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { projectJobs, productionCompletions, customers } = useERP();

  // Packaging list stored in state & synced to localStorage / API
  const [packagingSlips, setPackagingSlips] = useState<PackagingSlipDoc[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('UMA_ERP_packagingSlips');
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return INITIAL_PACKAGING_SLIPS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('UMA_ERP_packagingSlips', JSON.stringify(packagingSlips));
      } catch (_) {}
    }
  }, [packagingSlips]);

  // Load from backend packing orders if available
  useEffect(() => {
    if (api && api.get) {
      api.get('/packing-orders/')
        .then((res: any) => {
          const data = (res as any)?.data || res;
          if (Array.isArray(data) && data.length > 0) {
            // Merge with local packaging slips
            const mapped: PackagingSlipDoc[] = data.map((po: any) => ({
              id: po.id || po.packing_number,
              packingSlipNo: po.packing_number || po.id,
              date: po.packing_date || new Date().toISOString().split('T')[0],
              projectId: po.project_id,
              projectNumber: po.project_number,
              jobNumber: po.job_number,
              qcInspectionNumber: po.qc_inspection_number,
              customerId: po.customer_id,
              customerName: po.customer_name || 'Customer',
              productName: po.product_name || 'Industrial Equipment',
              specification: po.specification,
              packageType: po.package_type || 'Wooden Crate',
              packageDimensions: po.package_dimensions,
              totalPackages: (po.boxes && po.boxes.length) || 1,
              totalGrossWeightKg: parseFloat(po.gross_weight_kg) || 0,
              totalNetWeightKg: parseFloat(po.net_weight_kg) || 0,
              packedBy: po.packed_by || 'Supervisor',
              verifiedBy: po.verified_by,
              status: po.status || 'Packed',
              boxes: po.boxes || [{ id: 'B-1', boxNumber: 'Package 1', packageType: po.package_type || 'Crate' }],
              items: po.items || [],
              remarks: po.remarks,
              createdAt: po.created_at,
            }));
            setPackagingSlips((prev) => {
              const ids = new Set(mapped.map((m) => m.id));
              const localUnsynced = prev.filter((p) => !ids.has(p.id));
              return [...mapped, ...localUnsynced];
            });
          }
        })
        .catch(() => {
          // Fallback to local storage
        });
    }
  }, []);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PackagingSlipDoc['status']>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [viewingSlip, setViewingSlip] = useState<PackagingSlipDoc | null>(null);
  const [editingSlipId, setEditingSlipId] = useState<string | null>(null);

  // Form State
  const [formSlipNo, setFormSlipNo] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formProjectId, setFormProjectId] = useState('');
  const [formProjectNumber, setFormProjectNumber] = useState('');
  const [formJobNumber, setFormJobNumber] = useState('');
  const [formQcReportNo, setFormQcReportNo] = useState('');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formCustomerAddress, setFormCustomerAddress] = useState('');
  const [formDestinationCity, setFormDestinationCity] = useState('');
  const [formProductName, setFormProductName] = useState('');
  const [formPackedBy, setFormPackedBy] = useState('Ramesh Patel (Packing Supervisor)');
  const [formVerifiedBy, setFormVerifiedBy] = useState('Hardik Vaghela (QC Inspector)');
  const [formStatus, setFormStatus] = useState<PackagingSlipDoc['status']>('Packed & Verified');
  const [formRemarks, setFormRemarks] = useState('');

  // Packages / Boxes State
  const [formBoxes, setFormBoxes] = useState<PackagingBox[]>([
    {
      id: 'BOX-1',
      boxNumber: 'Package 1 of 2',
      packageType: 'Heavy Wooden Skid / Crate',
      dimensions: '3000 x 1800 x 2000 mm',
      grossWeightKg: 1200,
      netWeightKg: 1050,
      handlingInstructions: 'Handle with Crane Only',
    },
    {
      id: 'BOX-2',
      boxNumber: 'Package 2 of 2',
      packageType: 'Reinforced Corrugated Box',
      dimensions: '600 x 400 x 300 mm',
      grossWeightKg: 45,
      netWeightKg: 20,
      handlingInstructions: 'Nuts, Bolts & Loose Spares (Keep Dry)',
    },
  ]);

  // Items State (Main Equipment + Extra Items / Fasteners / Accessories)
  const [formItems, setFormItems] = useState<PackagingItem[]>([
    {
      id: 'ITEM-1',
      srNo: 1,
      category: 'Main Equipment',
      particulars: 'Industrial Equipment Main Assembly',
      quantity: 1,
      unit: 'Nos',
      boxNo: 'Package 1 of 2',
      itemWeightKg: 1050,
      notes: 'QC Cleared as per inspection sheet',
      isVerified: true,
    },
    {
      id: 'ITEM-2',
      srNo: 2,
      category: 'Fasteners & Hardware',
      particulars: 'M16 x 65mm Hex Head Bolts with Nuts & Double Washers (Grade 8.8)',
      quantity: 32,
      unit: 'Nos',
      boxNo: 'Package 2 of 2',
      itemWeightKg: 10,
      notes: 'Extra assembly hardware',
      isVerified: true,
    },
  ]);

  // Next Slip No Generator
  const generateNextSlipNo = () => {
    const nums = packagingSlips
      .map((s) => {
        const match = s.packingSlipNo?.match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 1;
    return `PKG-2026-${String(max + 1).padStart(3, '0')}`;
  };

  // Check URL parameters (from QC Completion: /production/packaging?fromQC=...&project=...&customer=...)
  useEffect(() => {
    const fromQC = searchParams?.get('fromQC');
    const cust = searchParams?.get('customer');
    const item = searchParams?.get('item');
    const job = searchParams?.get('job');
    const prj = searchParams?.get('project');

    if (fromQC || cust || item || job) {
      setEditingSlipId(null);
      setFormSlipNo(generateNextSlipNo());
      setFormDate(new Date().toISOString().split('T')[0]);
      if (fromQC) setFormQcReportNo(decodeURIComponent(fromQC));
      if (cust) setFormCustomerName(decodeURIComponent(cust));
      if (job) setFormJobNumber(decodeURIComponent(job));
      if (prj) setFormProjectNumber(decodeURIComponent(prj));
      if (item) {
        const decodedItem = decodeURIComponent(item);
        setFormProductName(decodedItem);
        setFormItems([
          {
            id: 'ITEM-1',
            srNo: 1,
            category: 'Main Equipment',
            particulars: `${decodedItem} (Main Fabrication Assembly)`,
            quantity: 1,
            unit: 'Nos',
            boxNo: 'Package 1 of 2',
            itemWeightKg: 850,
            notes: `Cleared in QC: ${decodeURIComponent(fromQC || 'F - QAS - 02')}`,
            isVerified: true,
          },
          {
            id: 'ITEM-2',
            srNo: 2,
            category: 'Fasteners & Hardware',
            particulars: 'M16 x 60mm Hex Bolts with Nuts & Spring Washers (Grade 8.8)',
            quantity: 32,
            unit: 'Nos',
            boxNo: 'Package 2 of 2',
            itemWeightKg: 9.5,
            notes: 'Extra nuts and bolts for erection at site',
            isVerified: true,
          },
          {
            id: 'ITEM-3',
            srNo: 3,
            category: 'Gaskets & Seals',
            particulars: 'Full-Face Flange Gaskets (Compressed Asbestos Fiber / Neoprene)',
            quantity: 4,
            unit: 'Nos',
            boxNo: 'Package 2 of 2',
            itemWeightKg: 1.0,
            notes: 'Interconnecting nozzle joints',
            isVerified: true,
          },
          {
            id: 'ITEM-4',
            srNo: 4,
            category: 'Documentation & Manuals',
            particulars: 'O&M Manual, Inspection Test Certificate & Packing Slip Copy',
            quantity: 1,
            unit: 'Sets',
            boxNo: 'Package 2 of 2',
            itemWeightKg: 0.5,
            notes: 'In waterproof envelope inside Box 2',
            isVerified: true,
          },
        ]);
      }
      setShowModal(true);
      toast.success(`Pre-filled from QC Inspection: ${cust || 'Project'}`);
    }
  }, [searchParams]);

  // Handler: Selecting a Project to auto-fill
  const handleSelectProject = (projectId: string) => {
    setFormProjectId(projectId);
    const prj = projectJobs.find((p) => p.id === projectId || p.projectNumber === projectId);
    if (prj) {
      setFormProjectNumber(prj.projectNumber || prj.id);
      setFormJobNumber(prj.jobNumber || '');
      setFormCustomerName(prj.customerName || '');
      setFormProductName(prj.productName || '');
      setFormCustomerId(prj.customerId || '');
      // Find customer address if available
      const cObj = customers.find((c) => c.id === prj.customerId || c.companyName === prj.customerName);
      if (cObj) {
        setFormCustomerAddress(cObj.shippingAddress || cObj.billingAddress || `${cObj.city}, Gujarat`);
        setFormDestinationCity(cObj.city || '');
      }

      // Add main item
      setFormItems((prev) => {
        const withoutMain = prev.filter((i) => i.category !== 'Main Equipment');
        return [
          {
            id: 'ITEM-1',
            srNo: 1,
            category: 'Main Equipment',
            particulars: `${prj.productName} (Main Project Equipment)`,
            quantity: prj.quantity || 1,
            unit: prj.unit || 'Nos',
            boxNo: 'Package 1 of 2',
            itemWeightKg: 1200,
            notes: `Project: ${prj.projectNumber}`,
            isVerified: true,
          },
          ...withoutMain.map((item, idx) => ({ ...item, srNo: idx + 2 })),
        ];
      });
      toast.info(`Loaded project details for ${prj.projectNumber}`);
    }
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingSlipId(null);
    setFormSlipNo(generateNextSlipNo());
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormProjectId('');
    setFormProjectNumber('');
    setFormJobNumber('');
    setFormQcReportNo('');
    setFormCustomerName('');
    setFormCustomerAddress('');
    setFormDestinationCity('');
    setFormProductName('');
    setFormRemarks('');
    setFormStatus('Packed & Verified');

    setFormBoxes([
      {
        id: `BOX-${Date.now()}-1`,
        boxNumber: 'Package 1 of 2',
        packageType: 'Heavy Duty Wooden Crate / Skid',
        dimensions: '3200 x 2000 x 2200 mm',
        grossWeightKg: 1400,
        netWeightKg: 1250,
        handlingInstructions: 'Handle with Crane Only. Center of Gravity Marked.',
      },
      {
        id: `BOX-${Date.now()}-2`,
        boxNumber: 'Package 2 of 2',
        packageType: 'Corrugated Carton / Wooden Box',
        dimensions: '600 x 400 x 350 mm',
        grossWeightKg: 45,
        netWeightKg: 25,
        handlingInstructions: 'Nuts, Bolts & Spare Accessories (Keep Dry)',
      },
    ]);

    setFormItems([
      {
        id: `ITM-${Date.now()}-1`,
        srNo: 1,
        category: 'Main Equipment',
        particulars: 'Fabricated Equipment Main Assembly',
        quantity: 1,
        unit: 'Nos',
        boxNo: 'Package 1 of 2',
        itemWeightKg: 1250,
        notes: 'Final QC Passed',
        isVerified: true,
      },
      {
        id: `ITM-${Date.now()}-2`,
        srNo: 2,
        category: 'Fasteners & Hardware',
        particulars: 'M16 x 65mm Hex Head Bolts with Nuts & Double Washers (Grade 8.8)',
        quantity: 48,
        unit: 'Nos',
        boxNo: 'Package 2 of 2',
        itemWeightKg: 15,
        notes: 'Packed in canvas bag inside Box 2',
        isVerified: true,
      },
      {
        id: `ITM-${Date.now()}-3`,
        srNo: 3,
        category: 'Foundation Hardware',
        particulars: 'M24 Foundation Anchor J-Bolts with Nuts & Washers',
        quantity: 8,
        unit: 'Nos',
        boxNo: 'Package 2 of 2',
        itemWeightKg: 16,
        notes: 'Base foundation anchors',
        isVerified: true,
      },
    ]);

    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (slip: PackagingSlipDoc) => {
    setEditingSlipId(slip.id);
    setFormSlipNo(slip.packingSlipNo);
    setFormDate(slip.date);
    setFormProjectId(slip.projectId || '');
    setFormProjectNumber(slip.projectNumber || '');
    setFormJobNumber(slip.jobNumber || '');
    setFormQcReportNo(slip.qcInspectionNumber || '');
    setFormCustomerId(slip.customerId || '');
    setFormCustomerName(slip.customerName);
    setFormCustomerAddress(slip.customerAddress || '');
    setFormDestinationCity(slip.destinationCity || '');
    setFormProductName(slip.productName);
    setFormPackedBy(slip.packedBy || 'Supervisor');
    setFormVerifiedBy(slip.verifiedBy || '');
    setFormStatus(slip.status);
    setFormRemarks(slip.remarks || '');
    setFormBoxes(slip.boxes || []);
    setFormItems(slip.items || []);
    setShowModal(true);
  };

  // Quick Preset Add for extra items (Nuts, Bolts, Gaskets, etc.)
  const handleAddPresetItem = (preset: {
    category: PackagingItemCategory;
    particulars: string;
    quantity: number | string;
    unit: string;
    boxNo?: string;
    itemWeightKg?: number;
    notes?: string;
  }) => {
    const newItem: PackagingItem = {
      id: `ITM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      srNo: formItems.length + 1,
      category: preset.category,
      particulars: preset.particulars,
      quantity: preset.quantity,
      unit: preset.unit,
      boxNo: preset.boxNo || (formBoxes[1]?.boxNumber || formBoxes[0]?.boxNumber || 'Box 2'),
      itemWeightKg: preset.itemWeightKg || 0,
      notes: preset.notes || '',
      isVerified: true,
    };
    setFormItems((prev) => [...prev, newItem]);
    toast.success(`Added item: ${preset.particulars.slice(0, 30)}...`);
  };

  // Add Custom Item
  const handleAddCustomItem = () => {
    const newItem: PackagingItem = {
      id: `ITM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      srNo: formItems.length + 1,
      category: 'Fasteners & Hardware',
      particulars: '',
      quantity: 1,
      unit: 'Nos',
      boxNo: formBoxes[1]?.boxNumber || formBoxes[0]?.boxNumber || 'Package 2',
      itemWeightKg: 0,
      notes: '',
      isVerified: true,
    };
    setFormItems((prev) => [...prev, newItem]);
  };

  // Update item field
  const handleUpdateItem = (id: string, field: keyof PackagingItem, val: any) => {
    setFormItems((prev) =>
      prev.map((itm) => (itm.id === id ? { ...itm, [field]: val } : itm))
    );
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    setFormItems((prev) => {
      const filtered = prev.filter((i) => i.id !== id);
      return filtered.map((item, idx) => ({ ...item, srNo: idx + 1 }));
    });
  };

  // Add Box
  const handleAddBox = () => {
    const count = formBoxes.length + 1;
    const newBox: PackagingBox = {
      id: `BOX-${Date.now()}-${count}`,
      boxNumber: `Package ${count} of ${count}`,
      packageType: 'Wooden Box / Carton',
      dimensions: '800 x 600 x 500 mm',
      grossWeightKg: 50,
      netWeightKg: 30,
      handlingInstructions: 'Handle with Care',
    };
    // Update existing box numbers e.g. "Package 1 of 3"
    setFormBoxes((prev) => {
      const updated = prev.map((b, idx) => ({
        ...b,
        boxNumber: `Package ${idx + 1} of ${count}`,
      }));
      return [...updated, newBox];
    });
  };

  // Update Box field
  const handleUpdateBox = (id: string, field: keyof PackagingBox, val: any) => {
    setFormBoxes((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: val } : b))
    );
  };

  // Remove Box
  const handleRemoveBox = (id: string) => {
    if (formBoxes.length <= 1) {
      toast.warning('At least 1 package / box is required.');
      return;
    }
    setFormBoxes((prev) => {
      const filtered = prev.filter((b) => b.id !== id);
      const count = filtered.length;
      return filtered.map((b, idx) => ({
        ...b,
        boxNumber: `Package ${idx + 1} of ${count}`,
      }));
    });
  };

  // Calculate Totals
  const totalGrossWeight = useMemo(() => {
    return formBoxes.reduce((acc, b) => acc + (parseFloat(String(b.grossWeightKg)) || 0), 0);
  }, [formBoxes]);

  const totalNetWeight = useMemo(() => {
    return formBoxes.reduce((acc, b) => acc + (parseFloat(String(b.netWeightKg)) || 0), 0);
  }, [formBoxes]);

  // Save Packaging Slip
  const handleSavePackaging = () => {
    if (!formCustomerName.trim()) {
      toast.error('Please enter or select a customer name.');
      return;
    }
    if (!formProductName.trim()) {
      toast.error('Please enter equipment / product name.');
      return;
    }
    if (formItems.length === 0) {
      toast.error('Please add at least one item to the package.');
      return;
    }

    const payload: PackagingSlipDoc = {
      id: editingSlipId || formSlipNo || generateNextSlipNo(),
      packingSlipNo: formSlipNo || generateNextSlipNo(),
      date: formDate,
      projectId: formProjectId,
      projectNumber: formProjectNumber,
      jobNumber: formJobNumber,
      qcInspectionNumber: formQcReportNo,
      customerId: formCustomerId,
      customerName: formCustomerName,
      customerAddress: formCustomerAddress,
      destinationCity: formDestinationCity,
      productName: formProductName,
      packageType: formBoxes.map((b) => b.packageType).join(' + ') || 'Wooden Crate',
      packageDimensions: formBoxes[0]?.dimensions || '',
      totalPackages: formBoxes.length,
      totalGrossWeightKg: totalGrossWeight,
      totalNetWeightKg: totalNetWeight,
      packedBy: formPackedBy,
      verifiedBy: formVerifiedBy,
      status: formStatus,
      boxes: formBoxes,
      items: formItems,
      remarks: formRemarks,
      createdAt: editingSlipId
        ? packagingSlips.find((p) => p.id === editingSlipId)?.createdAt
        : new Date().toISOString(),
    };

    setPackagingSlips((prev) => {
      const exists = prev.some((p) => p.id === payload.id);
      if (exists) {
        return prev.map((p) => (p.id === payload.id ? payload : p));
      }
      return [payload, ...prev];
    });

    // Also sync to backend API if available
    if (api && api.post) {
      api.post('/packing-orders/', {
        id: payload.id,
        packing_number: payload.packingSlipNo,
        packing_date: payload.date,
        customer_id: payload.customerId,
        customer_name: payload.customerName,
        project_id: payload.projectId,
        project_number: payload.projectNumber,
        job_number: payload.jobNumber,
        qc_inspection_number: payload.qcInspectionNumber,
        product_name: payload.productName,
        package_type: payload.packageType,
        package_dimensions: payload.packageDimensions,
        gross_weight_kg: payload.totalGrossWeightKg,
        net_weight_kg: payload.totalNetWeightKg,
        packed_by: payload.packedBy,
        verified_by: payload.verifiedBy,
        status: payload.status,
        boxes: payload.boxes,
        items: payload.items,
        remarks: payload.remarks,
      }).catch(() => {});
    }

    setShowModal(false);
    toast.success(editingSlipId ? 'Packaging Slip updated successfully!' : 'Packaging Slip created successfully!');
  };

  // Delete Packaging Slip
  const handleDeleteSlip = (id: string) => {
    if (confirm('Are you sure you want to delete this Packaging Slip?')) {
      setPackagingSlips((prev) => prev.filter((p) => p.id !== id));
      toast.info('Packaging slip deleted.');
    }
  };

  // 1-Click Action: "Generate Delivery Challan" (ડિલિવરી ચલણ બનાવો)
  const handleProceedToChallan = (slip: PackagingSlipDoc) => {
    // Encode items into JSON so Delivery Challan page loads all items (main equipment + nuts & bolts + spares)
    const challanItems = slip.items.map((itm, idx) => ({
      srNo: idx + 1,
      particulars: `${itm.particulars} [${itm.boxNo || 'Box'}]`,
      quantity: String(itm.quantity),
      unitOrAmount: `${itm.quantity} ${itm.unit}`,
      notes: itm.notes || itm.category,
    }));

    const queryParams = new URLSearchParams({
      fromPacking: slip.packingSlipNo,
      customer: slip.customerName || '',
      item: slip.productName || '',
      job: slip.jobNumber || '',
      project: slip.projectNumber || '',
      boxes: String(slip.totalPackages || 1),
      weight: `${slip.totalGrossWeightKg} Kg`,
      itemsJson: JSON.stringify(challanItems),
    });

    router.push(`/production/dispatch?${queryParams.toString()}`);
  };

  // Filtered List
  const filteredSlips = useMemo(() => {
    return packagingSlips.filter((s) => {
      const matchSearch =
        s.packingSlipNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.productName && s.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.projectNumber && s.projectNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.jobNumber && s.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [packagingSlips, searchTerm, statusFilter]);

  // KPIs
  const stats = useMemo(() => {
    const total = packagingSlips.length;
    const inProgress = packagingSlips.filter((s) => s.status === 'Packing in Progress' || s.status === 'Draft').length;
    const ready = packagingSlips.filter((s) => s.status === 'Packed & Verified' || s.status === 'Ready for Dispatch').length;
    const dispatched = packagingSlips.filter((s) => s.status === 'Dispatched').length;
    return { total, inProgress, ready, dispatched };
  }, [packagingSlips]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#8D7B70]">
        <div className="flex items-center gap-2">
          <Link href="/production/dashboard" className="hover:text-[#3E2723] transition-colors">
            Production & Shop Floor
          </Link>
          <span>/</span>
          <Link href="/production/completion" className="hover:text-[#3E2723] transition-colors">
            Completion & QC Clearance
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#3E2723]">Dispatch & Packaging</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/production/completion"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5DCD3] bg-white text-[#5D4E43] hover:bg-[#F8F5F1] transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>← Previous: QC Clearance</span>
          </Link>
          <Link
            href="/production/dispatch"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 font-semibold hover:bg-amber-100 transition-all"
          >
            <Truck className="w-3.5 h-3.5 text-amber-700" />
            <span>Next: Delivery Challan →</span>
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5DCD3] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-900 shadow-sm">
              <Package className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  MODULE 6.6
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-[#3E2723]">
                  Dispatch & Packaging (પેકેજિંગ અને ડિસ્પેચ)
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-[#7D6B5E] mt-0.5">
                Add completed equipment, extra hardware, nuts, bolts, accessories and spares to packages before issuing Delivery Challan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3E2723] hover:bg-[#2E1D19] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#3E2723]/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>New Packaging Order</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-[#E5DCD3] bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#7D6B5E]">Total Packing Orders</span>
            <Package className="w-4 h-4 text-[#8D7B70]" />
          </div>
          <div className="text-2xl font-bold text-[#3E2723] mt-2">{stats.total}</div>
          <div className="text-[11px] text-[#8D7B70] mt-1">Across all completed projects</div>
        </div>

        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-900">Packing in Progress</span>
            <Box className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-2">{stats.inProgress}</div>
          <div className="text-[11px] text-blue-700 mt-1">Active crates / box assembly</div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-900">Packed & Verified</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-emerald-900 mt-2">{stats.ready}</div>
          <div className="text-[11px] text-emerald-700 mt-1">Ready for Delivery Challan</div>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-900">Dispatched to Site</span>
            <Truck className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-bold text-amber-900 mt-2">{stats.dispatched}</div>
          <div className="text-[11px] text-amber-700 mt-1">Challan issued & loaded</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-[#E5DCD3] bg-white">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8D7B70] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Slip #, Project #, Job #, Customer, Equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5DCD3] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 focus:border-[#3E2723]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs">
          {(['ALL', 'Draft', 'Packing in Progress', 'Packed & Verified', 'Ready for Dispatch', 'Dispatched'] as const).map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? 'bg-[#3E2723] text-white shadow-sm'
                    : 'bg-[#F8F5F1] text-[#7D6B5E] hover:bg-[#EFE8DF]'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-[#E5DCD3] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E5DCD3] text-[#7D6B5E] font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Packing Slip #</th>
                <th className="py-3 px-4">Project & Job</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Equipment & Packed Items</th>
                <th className="py-3 px-4">Packages / Gross Wt</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DCD3]">
              {filteredSlips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#8D7B70]">
                    <Package className="w-10 h-10 mx-auto text-[#B5A496] mb-2 opacity-60" />
                    <p className="font-semibold text-sm text-[#5D4E43]">No Packaging Orders Found</p>
                    <p className="text-xs text-[#8D7B70] mt-1">
                      Click &quot;New Packaging Order&quot; or transfer a completed project from QC Clearance.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSlips.map((slip) => {
                  const extraItemsCount = slip.items ? slip.items.filter((i) => i.category !== 'Main Equipment').length : 0;
                  return (
                    <tr key={slip.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#3E2723]">
                        <div>{slip.packingSlipNo}</div>
                        <div className="text-[11px] font-normal text-[#8D7B70]">{formatDate(slip.date)}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#3E2723]">{slip.projectNumber || 'Standard Job'}</div>
                        <div className="text-[11px] text-[#7D6B5E] font-mono">{slip.jobNumber || '-'}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#3E2723]">{slip.customerName}</div>
                        <div className="text-[11px] text-[#8D7B70]">{slip.destinationCity || 'Gujarat'}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-[#3E2723] line-clamp-1">{slip.productName}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-medium">
                            1 Main Eqpt
                          </span>
                          {extraItemsCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium">
                              +{extraItemsCount} Hardware / Nuts & Bolts
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#3E2723]">
                          {slip.totalPackages} {slip.totalPackages === 1 ? 'Package' : 'Packages'}
                        </div>
                        <div className="text-[11px] text-[#7D6B5E]">{slip.totalGrossWeightKg} Kg Gross Wt</div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            slip.status === 'Dispatched'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : slip.status === 'Ready for Dispatch' || slip.status === 'Packed & Verified'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {slip.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingSlip(slip)}
                            title="View & Print Packing Slip"
                            className="p-1.5 rounded-lg border border-[#E5DCD3] hover:bg-[#F3ECE4] text-[#5D4E43] transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleProceedToChallan(slip)}
                            title="Generate Delivery Challan (ડિલિવરી ચલણ બનાવો)"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-sm"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Challan</span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(slip)}
                            title="Edit"
                            className="p-1.5 rounded-lg border border-[#E5DCD3] hover:bg-[#F3ECE4] text-[#5D4E43] transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteSlip(slip.id)}
                            title="Delete"
                            className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: NEW / EDIT PACKAGING ORDER                                         */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E5DCD3] w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5DCD3] bg-[#FAF7F2]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-900">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#3E2723]">
                    {editingSlipId ? 'Edit Packaging Slip' : 'New Packaging Slip & Item Checklist'}
                  </h2>
                  <p className="text-xs text-[#7D6B5E]">
                    Package equipment and add extra hardware, loose items, nuts &amp; bolts before Delivery Challan.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-[#8D7B70] hover:bg-[#EFE8DF] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Top Section: Link Project & Details */}
              <div className="p-4 rounded-xl border border-[#E5DCD3] bg-[#FAF7F2]/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7D6B5E]">
                    <Layers className="w-3.5 h-3.5 text-amber-800" />
                    <span>Project & Customer Information</span>
                  </div>
                  {projectJobs.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#8D7B70]">Auto-fill from Project:</span>
                      <select
                        onChange={(e) => handleSelectProject(e.target.value)}
                        value={formProjectId}
                        className="px-2.5 py-1 rounded-lg border border-[#E5DCD3] text-xs font-semibold bg-white text-[#3E2723]"
                      >
                        <option value="">-- Select Completed Project --</option>
                        {projectJobs.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.projectNumber || p.id} - {p.customerName} ({p.productName})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[#5D4E43] mb-1">Packing Slip #</label>
                    <input
                      type="text"
                      value={formSlipNo}
                      onChange={(e) => setFormSlipNo(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#E5DCD3] font-mono font-bold bg-white"
                      placeholder="PKG-2026-001"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#5D4E43] mb-1">Date</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#E5DCD3] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#5D4E43] mb-1">Project Number</label>
                    <input
                      type="text"
                      value={formProjectNumber}
                      onChange={(e) => setFormProjectNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#E5DCD3] font-mono bg-white"
                      placeholder="PRJ-2026-0001"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#5D4E43] mb-1">Job Number</label>
                    <input
                      type="text"
                      value={formJobNumber}
                      onChange={(e) => setFormJobNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#E5DCD3] font-mono bg-white"
                      placeholder="UTF-26-101"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#5D4E43] mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={formCustomerName}
                      onChange={(e) => setFormCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#E5DCD3] bg-white font-medium"
                      placeholder="e.g. Ananth Chem"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#5D4E43] mb-1">Destination City</label>
                    <input
                      type="text"
                      value={formDestinationCity}
                      onChange={(e) => setFormDestinationCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#E5DCD3] bg-white"
                      placeholder="e.g. Jhagadia / Kadi"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#5D4E43] mb-1">Equipment / Product Name *</label>
                    <input
                      type="text"
                      value={formProductName}
                      onChange={(e) => setFormProductName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#E5DCD3] bg-white font-medium"
                      placeholder="e.g. SS304 Chemical Storage Tank 50KL"
                    />
                  </div>
                </div>
              </div>

              {/* Package Boxes / Crates Configuration */}
              <div className="p-4 rounded-xl border border-[#E5DCD3] bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#7D6B5E] flex items-center gap-1.5">
                      <Box className="w-3.5 h-3.5 text-amber-800" />
                      <span>Packages / Boxes Breakdown ({formBoxes.length} Packages)</span>
                    </h3>
                    <p className="text-[11px] text-[#8D7B70]">
                      Specify crate or box types, dimensions, and weights for transportation.
                    </p>
                  </div>
                  <button
                    onClick={handleAddBox}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 font-semibold text-xs hover:bg-amber-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Package / Crate</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formBoxes.map((box, idx) => (
                    <div
                      key={box.id}
                      className="p-3 rounded-lg border border-[#E5DCD3] bg-[#FAF7F2]/50 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs items-center"
                    >
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-semibold text-[#7D6B5E] mb-0.5">Package Number</label>
                        <input
                          type="text"
                          value={box.boxNumber}
                          onChange={(e) => handleUpdateBox(box.id, 'boxNumber', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-[#E5DCD3] font-semibold bg-white"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-semibold text-[#7D6B5E] mb-0.5">Package Type</label>
                        <select
                          value={box.packageType}
                          onChange={(e) => handleUpdateBox(box.id, 'packageType', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-[#E5DCD3] bg-white"
                        >
                          <option value="Heavy Duty Wooden Crate">Heavy Duty Wooden Crate</option>
                          <option value="Heavy Wooden Skid">Heavy Wooden Skid</option>
                          <option value="Reinforced Corrugated Box">Reinforced Corrugated Box</option>
                          <option value="Wooden Box / Carton">Wooden Box / Carton</option>
                          <option value="Steel Frame / Skid">Steel Frame / Skid</option>
                          <option value="Gunny Bag / Bundle">Gunny Bag / Bundle</option>
                          <option value="Loose / Direct On Truck">Loose / Direct On Truck</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-semibold text-[#7D6B5E] mb-0.5">Dimensions (L x W x H)</label>
                        <input
                          type="text"
                          value={box.dimensions || ''}
                          onChange={(e) => handleUpdateBox(box.id, 'dimensions', e.target.value)}
                          placeholder="e.g. 120 x 80 x 90 cm"
                          className="w-full px-2.5 py-1.5 rounded border border-[#E5DCD3] bg-white font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-[#7D6B5E] mb-0.5">Gross Wt (Kg)</label>
                        <input
                          type="number"
                          value={box.grossWeightKg || 0}
                          onChange={(e) => handleUpdateBox(box.id, 'grossWeightKg', parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 rounded border border-[#E5DCD3] bg-white font-semibold"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                        {formBoxes.length > 1 && (
                          <button
                            onClick={() => handleRemoveBox(box.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Remove Box"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 px-1 text-xs font-semibold text-[#5D4E43]">
                  <span>Total Packages: {formBoxes.length}</span>
                  <span className="text-amber-900 font-bold">Total Gross Weight: {totalGrossWeight} Kg</span>
                </div>
              </div>

              {/* Items Section: Main Equipment + Extra Nuts, Bolts, Accessories */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/20 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-amber-800" />
                      <span>Items Packed (Main Equipment + Extra Nuts, Bolts &amp; Spares)</span>
                    </h3>
                    <p className="text-[11px] text-[#7D6B5E]">
                      નટ-બોલ્ટ, ગાસ્કેટ, ફાઉન્ડેશન બોલ્ટ્સ અને સ્પેર પાર્ટ્સ પેકેજિંગમાં ઉમેરો.
                    </p>
                  </div>
                  <button
                    onClick={handleAddCustomItem}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3E2723] hover:bg-[#2E1D19] text-white text-xs font-semibold transition-colors shadow-sm self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Custom Item</span>
                  </button>
                </div>

                {/* Quick Add Presets for Nuts, Bolts, Spares */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#7D6B5E] block">
                    ⚡ 1-Click Quick Add Extra Hardware Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() =>
                        handleAddPresetItem({
                          category: 'Fasteners & Hardware',
                          particulars: 'M16 x 65mm Hex Head Bolts with Hex Nuts & Washers (Grade 8.8 / SS304)',
                          quantity: 48,
                          unit: 'Nos',
                          itemWeightKg: 14.5,
                          notes: 'Extra erection hardware',
                        })
                      }
                      className="px-2.5 py-1 rounded-lg border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 font-medium text-xs transition-colors flex items-center gap-1"
                    >
                      <span>🔩 + M16 Nut &amp; Bolt Set (48 Nos)</span>
                    </button>

                    <button
                      onClick={() =>
                        handleAddPresetItem({
                          category: 'Fasteners & Hardware',
                          particulars: 'M20 x 75mm Hex Head Bolts with Double Nuts & Washers (Grade 8.8)',
                          quantity: 24,
                          unit: 'Nos',
                          itemWeightKg: 12.0,
                          notes: 'Flange coupling bolts',
                        })
                      }
                      className="px-2.5 py-1 rounded-lg border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 font-medium text-xs transition-colors flex items-center gap-1"
                    >
                      <span>🔩 + M20 Nut &amp; Bolt Set (24 Nos)</span>
                    </button>

                    <button
                      onClick={() =>
                        handleAddPresetItem({
                          category: 'Foundation Hardware',
                          particulars: 'M24 Foundation Anchor J-Bolts with Double Nuts (Length 450mm, MS Galv.)',
                          quantity: 8,
                          unit: 'Nos',
                          itemWeightKg: 18.0,
                          notes: 'Civil base anchor bolts',
                        })
                      }
                      className="px-2.5 py-1 rounded-lg border border-orange-300 bg-white hover:bg-orange-50 text-orange-900 font-medium text-xs transition-colors flex items-center gap-1"
                    >
                      <span>⚓ + Foundation J-Bolts (8 Nos)</span>
                    </button>

                    <button
                      onClick={() =>
                        handleAddPresetItem({
                          category: 'Gaskets & Seals',
                          particulars: 'Full-Face Flange Gaskets (CAF / Neoprene Acid Resistant)',
                          quantity: 8,
                          unit: 'Nos',
                          itemWeightKg: 1.5,
                          notes: 'Connecting pipe nozzles',
                        })
                      }
                      className="px-2.5 py-1 rounded-lg border border-purple-300 bg-white hover:bg-purple-50 text-purple-900 font-medium text-xs transition-colors flex items-center gap-1"
                    >
                      <span>⭕ + Flange Gaskets (8 Nos)</span>
                    </button>

                    <button
                      onClick={() =>
                        handleAddPresetItem({
                          category: 'Documentation & Manuals',
                          particulars: 'Operation & Maintenance Manual, Hydro Test Report & TC Certificate',
                          quantity: 1,
                          unit: 'Sets',
                          itemWeightKg: 0.5,
                          notes: 'Sealed waterproof envelope',
                        })
                      }
                      className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-medium text-xs transition-colors flex items-center gap-1"
                    >
                      <span>📄 + O&amp;M Manual &amp; TC Report</span>
                    </button>

                    <button
                      onClick={() =>
                        handleAddPresetItem({
                          category: 'Spares & Consumables',
                          particulars: 'Spare Mechanical Seal Kit / Teflon O-Rings',
                          quantity: 1,
                          unit: 'Sets',
                          itemWeightKg: 2.0,
                          notes: 'Commissioning spare parts',
                        })
                      }
                      className="px-2.5 py-1 rounded-lg border border-cyan-300 bg-white hover:bg-cyan-50 text-cyan-900 font-medium text-xs transition-colors flex items-center gap-1"
                    >
                      <span>⚙️ + Spare Seal Kit</span>
                    </button>
                  </div>
                </div>

                {/* Items List Table */}
                <div className="overflow-x-auto rounded-lg border border-[#E5DCD3] bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAF7F2] border-b border-[#E5DCD3] text-[#7D6B5E] font-semibold text-[10px] uppercase">
                        <th className="py-2.5 px-3 w-8">#</th>
                        <th className="py-2.5 px-3 w-40">Category</th>
                        <th className="py-2.5 px-3">Item Description / Particulars *</th>
                        <th className="py-2.5 px-3 w-20">Qty</th>
                        <th className="py-2.5 px-3 w-20">Unit</th>
                        <th className="py-2.5 px-3 w-32">Box Assigned</th>
                        <th className="py-2.5 px-3 w-20">Wt (Kg)</th>
                        <th className="py-2.5 px-3 w-8 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DCD3]">
                      {formItems.map((item, idx) => {
                        const catStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Other Accessories'];
                        return (
                          <tr key={item.id} className="hover:bg-[#FAF7F2]/50">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#8D7B70]">{idx + 1}</td>

                            <td className="py-2.5 px-3">
                              <select
                                value={item.category}
                                onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value)}
                                className={`w-full px-2 py-1 rounded border text-[11px] font-semibold ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                              >
                                <option value="Main Equipment">Main Equipment</option>
                                <option value="Fasteners & Hardware">Fasteners &amp; Hardware</option>
                                <option value="Foundation Hardware">Foundation Hardware</option>
                                <option value="Gaskets & Seals">Gaskets &amp; Seals</option>
                                <option value="Pipe Fittings & Clamps">Pipe Fittings &amp; Clamps</option>
                                <option value="Spares & Consumables">Spares &amp; Consumables</option>
                                <option value="Electrical & Sensors">Electrical &amp; Sensors</option>
                                <option value="Documentation & Manuals">Documentation &amp; Manuals</option>
                                <option value="Other Accessories">Other Accessories</option>
                              </select>
                            </td>

                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={item.particulars}
                                onChange={(e) => handleUpdateItem(item.id, 'particulars', e.target.value)}
                                placeholder="e.g. M16 Bolts with Nuts & Washers (Grade 8.8)"
                                className="w-full px-2.5 py-1.5 rounded border border-[#E5DCD3] font-medium"
                              />
                            </td>

                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                                className="w-full px-2 py-1.5 rounded border border-[#E5DCD3] font-bold"
                              />
                            </td>

                            <td className="py-2.5 px-3">
                              <select
                                value={item.unit}
                                onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                                className="w-full px-2 py-1.5 rounded border border-[#E5DCD3]"
                              >
                                <option value="Nos">Nos</option>
                                <option value="Sets">Sets</option>
                                <option value="Kg">Kg</option>
                                <option value="Packets">Packets</option>
                                <option value="Bags">Bags</option>
                                <option value="Pairs">Pairs</option>
                              </select>
                            </td>

                            <td className="py-2.5 px-3">
                              <select
                                value={item.boxNo || ''}
                                onChange={(e) => handleUpdateItem(item.id, 'boxNo', e.target.value)}
                                className="w-full px-2 py-1.5 rounded border border-[#E5DCD3] text-[11px]"
                              >
                                {formBoxes.map((b) => (
                                  <option key={b.id} value={b.boxNumber}>
                                    {b.boxNumber}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                value={item.itemWeightKg || 0}
                                onChange={(e) => handleUpdateItem(item.id, 'itemWeightKg', parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1.5 rounded border border-[#E5DCD3]"
                              />
                            </td>

                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status and Sign-offs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#5D4E43] mb-1">Packing Supervisor</label>
                  <input
                    type="text"
                    value={formPackedBy}
                    onChange={(e) => setFormPackedBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5DCD3]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5D4E43] mb-1">Quality Inspection Verification</label>
                  <input
                    type="text"
                    value={formVerifiedBy}
                    onChange={(e) => setFormVerifiedBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5DCD3]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5D4E43] mb-1">Packaging Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5DCD3] font-semibold bg-white"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Packing in Progress">Packing in Progress</option>
                    <option value="Packed & Verified">Packed &amp; Verified</option>
                    <option value="Ready for Dispatch">Ready for Dispatch</option>
                    <option value="Dispatched">Dispatched</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-[#5D4E43] mb-1">Packaging &amp; Handling Remarks</label>
                  <input
                    type="text"
                    value={formRemarks}
                    onChange={(e) => setFormRemarks(e.target.value)}
                    placeholder="e.g. Center of gravity marked. Loose hardware packed in Box 2. Handle with crane."
                    className="w-full px-3 py-2 rounded-lg border border-[#E5DCD3]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-[#E5DCD3] bg-[#FAF7F2]">
              <div className="text-xs text-[#7D6B5E]">
                {formItems.length} items packed across {formBoxes.length} packages ({totalGrossWeight} Kg Gross)
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5DCD3] bg-white text-[#5D4E43] font-medium text-xs hover:bg-[#F8F5F1] transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSavePackaging}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3E2723] hover:bg-[#2E1D19] text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Packaging Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW & PRINT PACKING SLIP                                          */}
      {/* ========================================================================= */}
      {viewingSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E5DCD3] w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
            {/* View Header with Print Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5DCD3] bg-[#FAF7F2]">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-800" />
                <h3 className="text-base font-bold text-[#3E2723]">
                  Packing Slip / Packing List: {viewingSlip.packingSlipNo}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => printContent('printable-packing-slip', { title: `Packing_Slip_${viewingSlip.packingSlipNo}` })}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3E2723] text-white text-xs font-semibold shadow-sm hover:bg-[#2E1D19] transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Packing List</span>
                </button>

                <button
                  onClick={() => handleProceedToChallan(viewingSlip)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold shadow-sm hover:bg-amber-700 transition-colors"
                >
                  <Truck className="w-4 h-4" />
                  <span>Create Delivery Challan</span>
                </button>

                <button
                  onClick={() => setViewingSlip(null)}
                  className="p-2 text-[#8D7B70] hover:bg-[#EFE8DF] rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Packing Slip Area */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#F5F2EB]/50">
              <div
                id="printable-packing-slip"
                className="bg-white p-8 rounded-xl border border-stone-300 shadow-sm space-y-6 max-w-3xl mx-auto font-sans text-stone-900"
              >
                {/* Letterhead */}
                <div className="border-b-2 border-stone-800 pb-4 text-center space-y-1">
                  <div className="text-2xl font-black tracking-wider text-stone-900">UMA TECHNO FAB</div>
                  <div className="text-xs font-medium text-stone-600">
                    Manufacturers of Heavy Industrial Equipment, Pressure Vessels, Reaction Tanks &amp; Turnkey Projects
                  </div>
                  <div className="text-[11px] text-stone-500">
                    S.No. 1040/3, Village : Rajpur, Nr. Sandvik Tube, Ta-Kadi, Dist-Mehsana, Gujarat - 382721 | Mo.: 98250 98367
                  </div>
                  <div className="text-[11px] font-mono font-semibold text-stone-700">
                    GSTIN: 24AAEFU9027H1Z3
                  </div>
                  <div className="pt-2">
                    <span className="inline-block px-4 py-1 rounded-full border border-stone-900 font-bold text-xs uppercase tracking-widest bg-stone-100">
                      OFFICIAL PACKING LIST / PACKAGING SLIP
                    </span>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs border border-stone-300 p-3 rounded-lg bg-stone-50/50">
                  <div>
                    <div className="font-bold text-stone-900">
                      Packing Slip No: <span className="font-mono">{viewingSlip.packingSlipNo}</span>
                    </div>
                    <div className="text-stone-600">Date: {formatDate(viewingSlip.date)}</div>
                    <div className="text-stone-600">
                      Project No: <span className="font-mono font-semibold">{viewingSlip.projectNumber || '-'}</span>
                    </div>
                    <div className="text-stone-600">
                      Job No: <span className="font-mono">{viewingSlip.jobNumber || '-'}</span>
                    </div>
                    {viewingSlip.qcInspectionNumber && (
                      <div className="text-stone-600">QC Clearance: {viewingSlip.qcInspectionNumber}</div>
                    )}
                  </div>

                  <div>
                    <div className="font-bold text-stone-900">Customer (Consignee):</div>
                    <div className="text-stone-800 font-semibold">{viewingSlip.customerName}</div>
                    <div className="text-stone-600 text-[11px]">{viewingSlip.customerAddress || 'Gujarat, India'}</div>
                    <div className="text-stone-600">
                      Destination: <span className="font-semibold">{viewingSlip.destinationCity || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Packages Breakdown */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-800 border-b border-stone-300 pb-1">
                    1. Packages &amp; Containers Summary ({viewingSlip.boxes?.length || 1} Total Packages)
                  </div>
                  <table className="w-full text-left text-xs border border-stone-300">
                    <thead className="bg-stone-100 border-b border-stone-300">
                      <tr>
                        <th className="p-2 border-r border-stone-300">Pkg #</th>
                        <th className="p-2 border-r border-stone-300">Container Type</th>
                        <th className="p-2 border-r border-stone-300">Dimensions</th>
                        <th className="p-2 border-r border-stone-300 text-right">Gross Wt</th>
                        <th className="p-2">Handling Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {viewingSlip.boxes?.map((b) => (
                        <tr key={b.id}>
                          <td className="p-2 font-semibold border-r border-stone-300">{b.boxNumber}</td>
                          <td className="p-2 border-r border-stone-300">{b.packageType}</td>
                          <td className="p-2 border-r border-stone-300 font-mono">{b.dimensions || '-'}</td>
                          <td className="p-2 border-r border-stone-300 text-right font-bold">{b.grossWeightKg} Kg</td>
                          <td className="p-2 text-stone-600 text-[11px]">{b.handlingInstructions || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-stone-50 font-bold border-t border-stone-300">
                      <tr>
                        <td colSpan={3} className="p-2 text-right border-r border-stone-300">
                          Total Gross Weight:
                        </td>
                        <td className="p-2 text-right">{viewingSlip.totalGrossWeightKg} Kg</td>
                        <td className="p-2"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Itemized Packing Checklist */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-800 border-b border-stone-300 pb-1">
                    2. Itemized Packing Checklist (Main Equipment + Extra Hardware &amp; Accessories)
                  </div>
                  <table className="w-full text-left text-xs border border-stone-300">
                    <thead className="bg-stone-100 border-b border-stone-300">
                      <tr>
                        <th className="p-2 border-r border-stone-300 w-8">Sr</th>
                        <th className="p-2 border-r border-stone-300 w-32">Category</th>
                        <th className="p-2 border-r border-stone-300">Description of Items &amp; Specifications</th>
                        <th className="p-2 border-r border-stone-300 w-20 text-center">Qty</th>
                        <th className="p-2 border-r border-stone-300 w-28">Packed In</th>
                        <th className="p-2 w-16 text-center">Check</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {viewingSlip.items?.map((itm, idx) => (
                        <tr key={itm.id}>
                          <td className="p-2 font-mono border-r border-stone-300 text-stone-600">{idx + 1}</td>
                          <td className="p-2 border-r border-stone-300 font-medium text-[11px]">{itm.category}</td>
                          <td className="p-2 border-r border-stone-300">
                            <div className="font-semibold text-stone-900">{itm.particulars}</div>
                            {itm.notes && <div className="text-[10px] text-stone-500">{itm.notes}</div>}
                          </td>
                          <td className="p-2 border-r border-stone-300 text-center font-bold">
                            {itm.quantity} {itm.unit}
                          </td>
                          <td className="p-2 border-r border-stone-300 text-[11px] font-mono">{itm.boxNo || '-'}</td>
                          <td className="p-2 text-center text-stone-800">
                            <span className="inline-block w-4 h-4 rounded border border-stone-600 text-center text-xs font-bold leading-3">
                              ✓
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Remarks & Handling */}
                {viewingSlip.remarks && (
                  <div className="text-xs p-3 rounded-lg border border-stone-200 bg-stone-50">
                    <span className="font-bold">Special Remarks: </span>
                    <span className="text-stone-700">{viewingSlip.remarks}</span>
                  </div>
                )}

                {/* Signatures */}
                <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs border-t border-stone-300">
                  <div>
                    <div className="h-10"></div>
                    <div className="border-t border-stone-400 pt-1 font-bold text-stone-800">
                      {viewingSlip.packedBy || 'Packing Supervisor'}
                    </div>
                    <div className="text-[11px] text-stone-500">Packed By (Store/Shop Floor)</div>
                  </div>

                  <div>
                    <div className="h-10"></div>
                    <div className="border-t border-stone-400 pt-1 font-bold text-stone-800">
                      {viewingSlip.verifiedBy || 'QC Inspector'}
                    </div>
                    <div className="text-[11px] text-stone-500">Inspected &amp; Verified By</div>
                  </div>

                  <div>
                    <div className="h-10"></div>
                    <div className="border-t border-stone-400 pt-1 font-bold text-stone-800">
                      For, UMA TECHNOFAB
                    </div>
                    <div className="text-[11px] text-stone-500">Authorized Signatory</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PackagingPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[#8D7B70]">Loading Packaging &amp; Dispatch...</div>}>
      <PackagingPageContent />
    </Suspense>
  );
}
