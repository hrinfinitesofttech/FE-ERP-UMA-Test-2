'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { RequestForQuotation, RFQItem, Supplier } from '../../../types/purchase';
import { toast } from '../../../context/ToastContext';
import { printContent } from '@/lib/printUtils';
import {
  FileText,
  Plus,
  Printer,
  Share2,
  Mail,
  Send,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  Phone,
  MessageSquare,
  Building,
  Package,
  ArrowRight,
  Sparkles,
  Layers,
  Calendar,
  AlertTriangle,
  FolderKanban,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/apiClient';

export default function PurchaseRequestsPage() {
  const router = useRouter();
  const {
    rfqs = [],
    addRFQ,
    updateRFQ,
    deleteRFQ,
    suppliers = [],
    purchaseRequisitions = [],
    materialRequirements = [],
    boms = [],
    itemMasters = [],
    projectJobs: projects = [],
    currentUser,
    isInitialLoading,
  } = useERP();

  // Modals state
  const [selectedRequest, setSelectedRequest] = useState<RequestForQuotation | null>(null);
  const [isViewLetterOpen, setIsViewLetterOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Email Modal State (Matching CRM Send Email Quotation)
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTargetRequest, setEmailTargetRequest] = useState<RequestForQuotation | null>(null);
  const [targetEmail, setTargetEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Success Toast
  const showToast = (msg: string) => {
    toast.success(msg);
  };

  // ---------------------------------------------------------------------------
  // AVAILABLE ITEMS STRUCTURE & AUTO-DETECT HELPERS
  // ---------------------------------------------------------------------------
  interface AvailableItemOption {
    key: string;
    source: 'requisition' | 'requirement' | 'bom' | 'master';
    itemCode: string;
    itemName: string;
    specification?: string;
    category: string;
    quantity: number;
    unitOfMeasure: string;
    prNumber?: string;
    projectRef?: string;
    label: string;
  }

  // Helper to extract all required items for a selected project from PRs, shortages, and BOMs
  const getProjectRequiredItems = (projId: string): AvailableItemOption[] => {
    if (!projId) return [];

    const cleanProjId = projId.trim().toLowerCase();
    const matchedProject = projects.find(
      (p) =>
        (p.projectNumber && p.projectNumber.toLowerCase() === cleanProjId) ||
        (p.id && p.id.toLowerCase() === cleanProjId) ||
        (p.jobNumber && p.jobNumber.toLowerCase() === cleanProjId) ||
        (p.projectName && p.projectName.toLowerCase() === cleanProjId)
    );

    const targetTokens = [
      cleanProjId,
      matchedProject?.id?.toLowerCase(),
      matchedProject?.projectNumber?.toLowerCase(),
      matchedProject?.jobNumber?.toLowerCase(),
      matchedProject?.projectName?.toLowerCase(),
    ].filter(Boolean) as string[];

    const isProjectMatch = (val?: string) => {
      if (!val) return false;
      const v = val.toLowerCase().trim();
      return targetTokens.some((t) => v === t || v.includes(t) || t.includes(v));
    };

    const results: AvailableItemOption[] = [];
    const seenItemKeys = new Set<string>();

    const getDedupeKey = (code: string, name: string, spec: string) => {
      const cleanCode = code ? code.toLowerCase().trim() : '';
      if (cleanCode && cleanCode !== '-') return cleanCode;
      const cleanName = name ? name.toLowerCase().trim() : '';
      const cleanSpec = spec ? spec.toLowerCase().trim() : '';
      return `${cleanName}___${cleanSpec}`;
    };

    // 1. From purchaseRequisitions (Material Requisition / Bom shortage PRs - Highest priority)
    (purchaseRequisitions || []).forEach((pr) => {
      const prMatches =
        isProjectMatch(pr.projectId) ||
        isProjectMatch(pr.jobId) ||
        isProjectMatch(pr.jobNumber) ||
        isProjectMatch(pr.bomId);

      if (prMatches && Array.isArray(pr.items)) {
        pr.items.forEach((it, idx) => {
          const itemCode = it.itemCode || '';
          const itemName = it.itemName || it.materialName || 'Engineering Component';
          const spec = it.specification || '';
          const dKey = getDedupeKey(itemCode, itemName, spec);
          if (dKey && !seenItemKeys.has(dKey)) {
            seenItemKeys.add(dKey);
            results.push({
              key: `pr-${pr.id || pr.prNumber}-${it.id || idx}-${itemCode || itemName}`,
              source: 'requisition',
              itemCode,
              itemName,
              specification: spec,
              category: it.category || 'Fabricated',
              quantity: Number(it.requiredQuantity ?? it.quantity ?? 1),
              unitOfMeasure: (it.unitOfMeasure || it.unit || 'NOS').toUpperCase(),
              prNumber: pr.prNumber,
              projectRef: pr.projectId || pr.jobId || projId,
              label: `[PR: ${pr.prNumber || 'REQ'}] ${itemCode ? `${itemCode} - ` : ''}${itemName} (${it.requiredQuantity ?? it.quantity ?? 1} ${it.unitOfMeasure || 'NOS'})`,
            });
          }
        });
      }
    });

    // 2. From materialRequirements (MRP shortages - only if not already in results)
    (materialRequirements || []).forEach((mr, idx) => {
      const mrMatches =
        isProjectMatch(mr.projectId) ||
        isProjectMatch(mr.jobId) ||
        isProjectMatch(mr.jobNumber);

      if (mrMatches) {
        const itemCode = mr.itemCode || mr.partNumber || '';
        const itemName = mr.itemName || mr.materialName || 'Engineering Component';
        const spec = mr.specification || '';
        const dKey = getDedupeKey(itemCode, itemName, spec);
        if (dKey && !seenItemKeys.has(dKey)) {
          seenItemKeys.add(dKey);
          results.push({
            key: `mr-${mr.id || idx}-${itemCode || itemName}`,
            source: 'requirement',
            itemCode,
            itemName,
            specification: spec,
            category: mr.category || 'Raw Material',
            quantity: Number(mr.requiredQuantity ?? mr.shortageQuantity ?? 1),
            unitOfMeasure: (mr.unitOfMeasure || mr.unit || 'NOS').toUpperCase(),
            projectRef: mr.projectId || mr.jobId || projId,
            label: `[Required] ${itemCode ? `${itemCode} - ` : ''}${itemName} (${mr.requiredQuantity ?? mr.shortageQuantity ?? 1} ${mr.unitOfMeasure || 'NOS'})`,
          });
        }
      }
    });

    // 3. From boms (Approved Bill of Materials - only if not already in results)
    (boms || []).forEach((b) => {
      const bomMatches =
        isProjectMatch(b.projectId) ||
        isProjectMatch(b.jobNumber) ||
        isProjectMatch(b.bomNumber);

      if (bomMatches && Array.isArray(b.items)) {
        b.items.forEach((it: any, idx: number) => {
          const itemCode = it.partNumber || it.itemCode || '';
          const itemName = it.itemName || 'Engineering Component';
          const spec = it.specification || it.description || '';
          const dKey = getDedupeKey(itemCode, itemName, spec);
          if (dKey && !seenItemKeys.has(dKey)) {
            seenItemKeys.add(dKey);
            results.push({
              key: `bom-${b.id}-${it.id || idx}-${itemCode || itemName}`,
              source: 'bom',
              itemCode,
              itemName,
              specification: spec,
              category: it.category || it.itemType || 'Fabricated',
              quantity: Number(it.quantity ?? it.qty ?? 1),
              unitOfMeasure: (it.unit || it.unitOfMeasure || 'NOS').toUpperCase(),
              projectRef: b.projectId || b.jobNumber || projId,
              label: `[BOM] ${itemCode ? `${itemCode} - ` : ''}${itemName} (${it.quantity ?? it.qty ?? 1} ${it.unit || 'NOS'})`,
            });
          }
        });
      }
    });

    return results;
  };

  // ---------------------------------------------------------------------------
  // DEFAULT STANDARD TERMS (with Headlines matching Quotations format)
  // ---------------------------------------------------------------------------
  const defaultTerms = [
    'Delivery: Material strictly along with Delivery Challan, Tax Invoice & Test Certificate (TC).',
    'Documentation: Please submit your challan & invoices in duplicate and in English only.',
    'Rate Validity: No revision in rate shall be accepted without written confirmation.',
    'Freight & Packaging: No packing, forwarding, delivery charges will be allowed unless authorized in writing.',
    'Rejection: Rejected material must be lifted within one week from the date of rejection (GRN).',
  ];

  // Helper for today's formatted date (e.g. 18.10.2026)
  const getTodayFormattedDate = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Blank Form State Generator (No hardcoded values, everything blank until selected)
  const getEmptyFormData = (customRfqNo?: string) => {
    const yr = new Date().getFullYear();
    const nextReqNo =
      customRfqNo ||
      `${Math.floor(200 + rfqs.length * 5 + 1)}-${yr.toString().slice(-2)}/${(yr + 1).toString().slice(-2)}`;

    return {
      rfqNumber: nextReqNo,
      rfqDate: getTodayFormattedDate(),
      selectedProjectId: '',
      selectedSupplierId: '',
      vendorName: '',
      vendorAddress: '',
      vendorMobile: '',
      vendorEmail: '',
      vendorGstin: '',
      buyer: 'Uma Technofab.',
      surcharges: 'NIL',
      taxes: 'AS APPLICABLE.',
      shipTo: 'LOCAL',
      deliveryLocation: 'RAJPUR',
      pageNo: 'PAGE NO: 1 OF 1',
      subject: '',
      specialNote: '',
      terms: [...defaultTerms],
      items: [
        {
          id: `item-${Date.now()}-1`,
          selectedItemKey: '',
          groupTitle: '',
          itemName: '',
          dimensions: '',
          specification: '',
          thk: '',
          quantity: '' as any,
          unitOfMeasure: 'NOS',
          rate: 0,
          amount: 0,
        },
      ],
    };
  };

  const [formData, setFormData] = useState<any>(getEmptyFormData);

  // Available options for current selected project
  const currentProjectItems = useMemo(
    () => getProjectRequiredItems(formData.selectedProjectId),
    [formData.selectedProjectId, purchaseRequisitions, materialRequirements, boms, projects]
  );

  // All requisitions items across projects
  const allRequisitionItems = useMemo(() => {
    const list: (AvailableItemOption & { projectRef: string })[] = [];
    const seen = new Set<string>();
    (purchaseRequisitions || []).forEach((pr) => {
      (pr.items || []).forEach((it, idx) => {
        const itemCode = it.itemCode || '';
        const itemName = it.itemName || 'Component';
        const pRef = pr.projectId || pr.jobId || 'PR';
        const dKey = `${pRef}___${itemCode ? itemCode.toLowerCase().trim() : itemName.toLowerCase().trim()}`;
        if (!seen.has(dKey)) {
          seen.add(dKey);
          list.push({
            key: `all-pr-${pr.id}-${it.id || idx}`,
            source: 'requisition',
            itemCode,
            itemName,
            specification: it.specification || '',
            category: it.category || 'Fabricated',
            quantity: Number(it.requiredQuantity ?? it.quantity ?? 1),
            unitOfMeasure: (it.unitOfMeasure || it.unit || 'NOS').toUpperCase(),
            prNumber: pr.prNumber,
            projectRef: pRef,
            label: `[${pRef}] ${itemCode ? `${itemCode} - ` : ''}${itemName}`,
          });
        }
      });
    });
    return list;
  }, [purchaseRequisitions]);

  // Master catalog options
  const masterItemOptions = useMemo(() => {
    return (itemMasters || []).map((m: any) => ({
      key: `master-${m.id || m.itemCode}`,
      source: 'master' as const,
      itemCode: m.itemCode || '',
      itemName: m.itemName || 'Master Item',
      specification: m.specification || m.description || '',
      category: m.category || 'Raw Material',
      quantity: 1,
      unitOfMeasure: (m.uom || m.unit || m.unitOfMeasure || 'NOS').toUpperCase(),
      label: `${m.itemCode ? `${m.itemCode} - ` : ''}${m.itemName}${m.category ? ` (${m.category})` : ''}`,
    }));
  }, [itemMasters]);

  // Handle Project Selection in Form (Auto-fill required items into lines)
  const handleProjectSelect = (projId: string) => {
    if (!projId) {
      setFormData((prev: any) => ({
        ...prev,
        selectedProjectId: '',
      }));
      return;
    }

    const matchedProject = projects.find(
      (p) => p.projectNumber === projId || p.id === projId || p.jobNumber === projId
    );
    const projLabel = matchedProject?.projectNumber || projId;
    const projItems = getProjectRequiredItems(projId);

    setFormData((prev: any) => {
      if (projItems.length > 0) {
        const newItems = projItems.map((pItm, idx) => ({
          id: `item-${Date.now()}-${idx + 1}`,
          selectedItemKey: pItm.key,
          groupTitle: pItm.category || 'Fabricated',
          itemName: pItm.itemName,
          dimensions: pItm.specification || '',
          specification: pItm.specification || '',
          thk: '',
          quantity: pItm.quantity || 1,
          unitOfMeasure: (pItm.unitOfMeasure || 'NOS').toUpperCase(),
          rate: 0,
          amount: 0,
        }));

        const itemSummary = projItems
          .map((i) => i.itemName)
          .slice(0, 3)
          .join(', ');
        const autoSubject =
          !prev.subject || prev.subject.startsWith('REQUIRE FOR')
            ? `REQUIRE FOR ${itemSummary.toUpperCase()} - ${projLabel}`
            : prev.subject;

        return {
          ...prev,
          selectedProjectId: projId,
          subject: autoSubject,
          items: newItems,
        };
      }

      return {
        ...prev,
        selectedProjectId: projId,
      };
    });

    if (projItems.length > 0) {
      toast.success(`Loaded ${projItems.length} required item(s) for project ${projLabel}`);
    } else {
      toast.info(`Project ${projLabel} selected. You can select items from Master or add custom items.`);
    }
  };

  // Handle Item Dropdown Selection in any Line
  const handleSelectItemForLine = (lineId: string, selectedKey: string) => {
    if (!selectedKey) {
      setFormData((prev: any) => ({
        ...prev,
        items: prev.items.map((itm: any) =>
          itm.id === lineId ? { ...itm, selectedItemKey: '' } : itm
        ),
      }));
      return;
    }

    const allAvailable = [
      ...currentProjectItems,
      ...allRequisitionItems,
      ...masterItemOptions,
    ];
    const picked = allAvailable.find((opt) => opt.key === selectedKey);
    if (!picked) return;

    setFormData((prev: any) => ({
      ...prev,
      items: prev.items.map((itm: any) => {
        if (itm.id !== lineId) return itm;
        return {
          ...itm,
          selectedItemKey: selectedKey,
          groupTitle: picked.category || itm.groupTitle || 'Fabricated',
          itemName: picked.itemName,
          dimensions: picked.specification || itm.dimensions || '',
          specification: picked.specification || itm.specification || '',
          quantity: picked.quantity || itm.quantity || 1,
          unitOfMeasure: (picked.unitOfMeasure || itm.unitOfMeasure || 'NOS').toUpperCase(),
        };
      }),
    }));
  };

  // Reload all project required items into the lines
  const handleReloadProjectItems = () => {
    if (!formData.selectedProjectId) {
      toast.warning('Please select a Linked Project Reference first.');
      return;
    }
    const projItems = getProjectRequiredItems(formData.selectedProjectId);
    if (projItems.length === 0) {
      toast.info('No requisition items found for this project.');
      return;
    }
    const newItems = projItems.map((pItm, idx) => ({
      id: `item-${Date.now()}-${idx + 1}`,
      selectedItemKey: pItm.key,
      groupTitle: pItm.category || 'Fabricated',
      itemName: pItm.itemName,
      dimensions: pItm.specification || '',
      specification: pItm.specification || '',
      thk: '',
      quantity: pItm.quantity || 1,
      unitOfMeasure: (pItm.unitOfMeasure || 'NOS').toUpperCase(),
      rate: 0,
      amount: 0,
    }));
    setFormData((prev: any) => ({
      ...prev,
      items: newItems,
    }));
    toast.success(`Reloaded ${projItems.length} item(s) from project requisition.`);
  };

  // Handle Supplier Selection in Form (Auto-fill vendor details)
  const handleSupplierSelect = (suppId: string) => {
    if (!suppId) {
      setFormData((prev: any) => ({
        ...prev,
        selectedSupplierId: '',
        vendorName: '',
        vendorAddress: '',
        vendorMobile: '',
        vendorEmail: '',
        vendorGstin: '',
      }));
      return;
    }

    const supp = suppliers.find((s) => s.id === suppId || s.vendorCode === suppId);
    if (supp) {
      const fullAddr =
        [supp.address, supp.city, supp.state ? `${supp.state} - ${supp.pinCode || ''}` : ''].filter(Boolean).join('\n') ||
        (supp.addresses && supp.addresses[0]?.addressLine) ||
        '';

      setFormData((prev: any) => ({
        ...prev,
        selectedSupplierId: supp.id,
        vendorName: (supp.supplierName || supp.name || '').toUpperCase(),
        vendorAddress: fullAddr,
        vendorMobile: supp.mobile || supp.phone || (supp.contacts && supp.contacts[0]?.phone) || '',
        vendorEmail: supp.email || (supp.contacts && supp.contacts[0]?.email) || '',
        vendorGstin: supp.gstin || '',
      }));
    }
  };

  // Open Create Modal (resets all fields to blank and auto-fetches current date)
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData(getEmptyFormData());
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (req: RequestForQuotation) => {
    setEditingId(req.id);
    setFormData({
      rfqNumber: req.rfqNumber || '',
      rfqDate: req.rfqDate || getTodayFormattedDate(),
      selectedProjectId: req.projectId || '',
      selectedSupplierId: req.supplierId || '',
      vendorName: req.supplierName || '',
      vendorAddress: req.supplierAddress || '',
      vendorMobile: req.supplierMobile || '',
      vendorEmail: req.supplierEmail || '',
      vendorGstin: req.supplierGstin || '',
      buyer: req.buyer || 'Uma Technofab.',
      surcharges: req.surcharges || 'NIL',
      taxes: req.taxes || 'AS APPLICABLE.',
      shipTo: req.shipTo || 'LOCAL',
      deliveryLocation: req.deliveryLocation || 'RAJPUR',
      pageNo: req.pageNo || 'PAGE NO: 1 OF 1',
      subject: req.subject || '',
      specialNote: req.specialNote || '',
      terms: req.terms && req.terms.length > 0 ? [...req.terms] : [...defaultTerms],
      items:
        req.items && req.items.length > 0
          ? req.items.map((itm, idx) => ({
              id: itm.id || `item-${idx + 1}`,
              selectedItemKey: (itm as any).selectedItemKey || '',
              groupTitle: itm.groupTitle || '',
              itemName: itm.itemName || itm.description || itm.materialName || '',
              dimensions: itm.dimensions || itm.size || itm.specification || '',
              specification: itm.specification || '',
              thk: itm.thk || '',
              quantity: itm.quantity !== undefined ? itm.quantity : (itm.requiredQuantity || ''),
              unitOfMeasure: itm.unitOfMeasure || itm.unit || 'NOS',
              rate: Number(itm.rate || 0),
              amount: Number(itm.amount || 0),
            }))
          : [
              {
                id: `item-${Date.now()}-1`,
                selectedItemKey: '',
                groupTitle: '',
                itemName: '',
                dimensions: '',
                specification: '',
                thk: '',
                quantity: '' as any,
                unitOfMeasure: 'NOS',
                rate: 0,
                amount: 0,
              },
            ],
    });
    setIsFormModalOpen(true);
  };

  // Add Item Line
  const handleAddItem = () => {
    const nextIdx = formData.items.length + 1;
    setFormData((prev: any) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `item-${Date.now()}-${nextIdx}`,
          selectedItemKey: '',
          groupTitle: prev.items[prev.items.length - 1]?.groupTitle || '',
          itemName: '',
          dimensions: '',
          specification: '',
          thk: '',
          quantity: '',
          unitOfMeasure: 'NOS',
          rate: 0,
          amount: 0,
        },
      ],
    }));
  };

  // Remove Item Line
  const handleRemoveItem = (id: string) => {
    if (formData.items.length <= 1) {
      toast.warning('At least one material item is required.');
      return;
    }
    setFormData((prev: any) => ({
      ...prev,
      items: prev.items.filter((itm: any) => itm.id !== id),
    }));
  };

  // Update Item field
  const handleItemFieldChange = (id: string, field: string, val: any) => {
    setFormData((prev: any) => ({
      ...prev,
      items: prev.items.map((itm: any) => (itm.id === id ? { ...itm, [field]: val } : itm)),
    }));
  };

  // Terms and conditions handlers (Matching Quotations Headline format)
  const handleAddTerm = () => {
    setFormData((prev: any) => ({
      ...prev,
      terms: [...prev.terms, ''],
    }));
  };

  const handleRemoveTerm = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      terms: prev.terms.filter((_: any, idx: number) => idx !== index),
    }));
  };

  const handleTermChange = (index: number, val: string) => {
    setFormData((prev: any) => {
      const updated = [...prev.terms];
      updated[index] = val;
      return { ...prev, terms: updated };
    });
  };

  // Submit Save Create / Edit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendorName.trim()) {
      toast.warning('Please enter Vendor / Supplier Name or select from Supplier Master.');
      return;
    }
    const validItems = formData.items.filter((itm: any) => itm.itemName?.trim() || itm.groupTitle?.trim());
    if (validItems.length === 0) {
      toast.warning('Please enter at least one material description.');
      return;
    }

    const payload: RequestForQuotation = {
      id: editingId || `REQ-${Date.now()}`,
      rfqNumber: formData.rfqNumber.trim() || `REQ-${Date.now().toString().slice(-4)}`,
      rfqDate: formData.rfqDate,
      projectId: formData.selectedProjectId || '',
      supplierId: formData.selectedSupplierId || '',
      supplierName: formData.vendorName.trim(),
      supplierAddress: formData.vendorAddress.trim(),
      supplierMobile: formData.vendorMobile.trim(),
      supplierEmail: formData.vendorEmail.trim(),
      supplierGstin: formData.vendorGstin.trim(),
      buyer: formData.buyer,
      surcharges: formData.surcharges,
      taxes: formData.taxes,
      shipTo: formData.shipTo,
      deliveryLocation: formData.deliveryLocation,
      pageNo: formData.pageNo,
      subject: formData.subject.trim(),
      specialNote: formData.specialNote.trim(),
      terms: formData.terms.filter((t: string) => t && t.trim()),
      termsAndConditions: formData.terms.filter((t: string) => t && t.trim()).join('\n'),
      signatory: 'For, UMA TECHNOFAB.',
      status: 'Sent to Suppliers',
      items: validItems.map((itm: any, idx: number) => ({
        id: itm.id || `item-${idx + 1}`,
        rfqId: editingId || `REQ-${Date.now()}`,
        groupTitle: itm.groupTitle || '',
        itemName: itm.itemName || `Item ${idx + 1}`,
        description: itm.itemName || '',
        dimensions: itm.dimensions || '',
        specification: itm.specification || '',
        thk: itm.thk || '',
        quantity: Number(itm.quantity) || 1,
        requiredQuantity: Number(itm.quantity) || 1,
        unitOfMeasure: itm.unitOfMeasure || 'KG',
        rate: Number(itm.rate) || 0,
        amount: Number(itm.amount) || 0,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      updateRFQ(editingId, payload);
      showToast(`Purchase Request ${payload.rfqNumber} updated successfully!`);
    } else {
      addRFQ(payload as any);
      showToast(`Purchase Request ${payload.rfqNumber} generated successfully!`);
    }

    setIsFormModalOpen(false);
  };

  // Open Letterhead View
  const handleOpenLetterView = (req: RequestForQuotation) => {
    setSelectedRequest(req);
    setIsViewLetterOpen(true);
  };

  // Delete Request
  const handleDeleteRequest = (req: RequestForQuotation) => {
    toast.confirm({
      title: 'Delete Purchase Request',
      message: `Are you sure you want to delete Purchase Request "${req.rfqNumber}"${req.supplierName ? ` for ${req.supplierName}` : ''}? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: () => {
        deleteRFQ(req.id);
        toast.success(`Purchase Request ${req.rfqNumber} deleted.`);
      },
    });
  };

  // Helper to resolve contact details (name, phone, email, address) for any request
  const resolveVendorDetails = (req: RequestForQuotation) => {
    let supp: Supplier | undefined;

    // 1. Match by supplierId or vendorCode
    if (req.supplierId) {
      supp = suppliers.find(
        (s) =>
          String(s.id).toLowerCase() === String(req.supplierId).toLowerCase() ||
          String(s.vendorCode || '').toLowerCase() === String(req.supplierId).toLowerCase()
      );
    }

    // 2. Match by supplierName if not a generic placeholder
    if (!supp && req.supplierName && req.supplierName.trim().length > 1) {
      const q = req.supplierName.toLowerCase().trim();
      if (q !== 'vendor' && q !== 'supplier' && q !== 'undefined' && q !== 'null') {
        supp = suppliers.find(
          (s) =>
            s.supplierName?.toLowerCase().trim() === q ||
            s.name?.toLowerCase().trim() === q
        );
      }
    }

    // 3. Match from invitedSuppliers array
    if (!supp && (req as any).invitedSuppliers && Array.isArray((req as any).invitedSuppliers) && (req as any).invitedSuppliers.length > 0) {
      const firstId = (req as any).invitedSuppliers[0];
      supp = suppliers.find((s) => s.id === firstId || s.vendorCode === firstId);
    }

    // NOTE: NEVER default to suppliers[0]! If no vendor is matched, leave supp undefined.

    const firstContact = supp?.contacts && supp.contacts.length > 0 ? supp.contacts[0] : null;
    const firstAddr = supp?.addresses && supp.addresses.length > 0 ? supp.addresses[0] : null;

    // Vendor Name: Priority to explicit supplierName on req, then matched master, then placeholder
    const rawReqName = (req.supplierName || (req as any).vendorName || '').trim();
    const vendorName = rawReqName && rawReqName.toLowerCase() !== 'vendor' && rawReqName.toLowerCase() !== 'supplier'
      ? rawReqName.toUpperCase()
      : (supp?.supplierName || supp?.name || 'NO SUPPLIER ASSIGNED').toUpperCase();

    const contactPerson =
      (req as any).contactPerson ||
      firstContact?.contactPerson ||
      supp?.contactPerson ||
      '';

    const rawPhone =
      req.supplierMobile ||
      (req as any).vendorMobile ||
      firstContact?.phone ||
      supp?.mobile ||
      supp?.phone ||
      '';

    const email =
      req.supplierEmail ||
      (req as any).vendorEmail ||
      firstContact?.email ||
      supp?.email ||
      '';

    const address =
      req.supplierAddress ||
      (req as any).vendorAddress ||
      supp?.address ||
      (firstAddr ? firstAddr.addressLine : '') ||
      '';

    const gstin =
      req.supplierGstin ||
      (req as any).vendorGstin ||
      supp?.gstin ||
      '';

    return { vendorName, contactPerson, phone: rawPhone, email, address, gstin, supp };
  };

  // Send WhatsApp Inquiry
  const handleSendWhatsApp = (req: RequestForQuotation) => {
    const { vendorName, phone } = resolveVendorDetails(req);
    let cleanPhone = (phone || '').replace(/[^0-9]/g, '');

    // Strip leading zeroes
    while (cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.slice(1);
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error(`Phone number not found in database for ${vendorName}. Please add in Vendor Master.`);
      return;
    }

    // Format phone with country code: 91 for India if 10 digits
    let finalPhone = cleanPhone;
    if (cleanPhone.length === 10) {
      finalPhone = `91${cleanPhone}`;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
      finalPhone = `91${cleanPhone.slice(1)}`;
    } else if (cleanPhone.startsWith('91')) {
      finalPhone = cleanPhone;
    }

    // Build comprehensive, professional inquiry message
    const itemsText = (req.items || [])
      .map((itm, idx) => {
        const spec = itm.dimensions || itm.specification;
        const desc = itm.itemName || 'Material Item';
        const qty = Number(itm.quantity || itm.requiredQuantity || 1).toLocaleString();
        const uom = itm.unitOfMeasure || 'NOS';
        return `*${idx + 1}.* ${desc}${spec ? ` [${spec}]` : ''} - *Qty:* ${qty} ${uom}`;
      })
      .join('\n');

    const message =
      `*OFFICIAL PURCHASE INQUIRY (REQUIRE)*\n` +
      `*UMA TECHNOFAB*\n` +
      `---------------------------------------\n` +
      `*Req No:* ${req.rfqNumber}\n` +
      `*Date:* ${req.rfqDate}\n` +
      `*Project Ref:* ${req.projectId || 'General'}\n` +
      `*To Vendor:* ${vendorName}\n` +
      `*Subject:* ${req.subject || 'Material Purchase Requirement'}\n` +
      `---------------------------------------\n` +
      `*REQUIRED MATERIAL ITEMS:*\n` +
      itemsText +
      `\n---------------------------------------\n` +
      (req.specialNote ? `*Instructions:* ${req.specialNote}\n\n` : '') +
      `Please provide your best quotation, rate per kg/unit, delivery schedule and Test Certificate (TC) availability at the earliest.\n\n` +
      `*Thanking you,*\n` +
      `Purchase & Procurement Department\n` +
      `*UMA TECHNOFAB*\n` +
      `Kadi - Mehsana Highway, Rajpur, Gujarat\n` +
      `Email: info@umatechnofab.com`;

    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${finalPhone}?text=${encodedMsg}`, '_blank');
    toast.success(`Opening WhatsApp for ${vendorName} (${finalPhone})...`);
  };

  // Open Official Purchase Inquiry (REQUIRE) Send Email Modal (matching CRM Send Email Quotation)
  const handleOpenEmailModal = (req: RequestForQuotation) => {
    setEmailTargetRequest(req);
    const { email } = resolveVendorDetails(req);
    setTargetEmail(email || '');
    setShowEmailModal(true);
  };

  // Backward compatibility alias for buttons
  const handleSendEmail = (req: RequestForQuotation) => {
    handleOpenEmailModal(req);
  };

  // Dispatch Official Purchase Inquiry Email (Backend API + Mail Client)
  const handleDispatchEmailInquiry = async (customEmail?: string) => {
    if (!emailTargetRequest) return;
    const recipient = String(customEmail || targetEmail).trim();
    if (!recipient) {
      toast.error('Please provide a valid recipient email address.');
      return;
    }

    const { vendorName } = resolveVendorDetails(emailTargetRequest);
    setIsSendingEmail(true);

    try {
      // 1. Dispatch via backend API endpoint if available
      if (emailTargetRequest.id) {
        api.purchase.rfqs.sendEmail(emailTargetRequest.id, recipient).catch((err) =>
          console.warn('Backend RFQ sendEmail API notice:', err)
        );
      }

      // 2. Open email client with formatted official Purchase Inquiry Letter
      const subject = encodeURIComponent(
        `Official Purchase Inquiry: ${emailTargetRequest.rfqNumber} - ${emailTargetRequest.subject || 'Material Requirement'} - UMA TECHNOFAB`
      );

      const itemsText = (emailTargetRequest.items || [])
        .map((itm, idx) => {
          const spec = itm.dimensions || itm.specification;
          const desc = itm.itemName || 'Material Item';
          const qty = Number(itm.quantity || itm.requiredQuantity || 1).toLocaleString();
          const uom = itm.unitOfMeasure || 'NOS';
          return `  [${idx + 1}] ${desc}${spec ? ` (${spec})` : ''} - Qty: ${qty} ${uom}`;
        })
        .join('\n');

      const body = encodeURIComponent(
        `Dear ${vendorName},\n\n` +
        `Please find our official material purchase inquiry (REQUIRE) details below from UMA TECHNOFAB:\n\n` +
        `DOCUMENT DETAILS:\n` +
        `==================================================\n` +
        `Requisition No : ${emailTargetRequest.rfqNumber}\n` +
        `Date           : ${emailTargetRequest.rfqDate}\n` +
        `Project Ref    : ${emailTargetRequest.projectId || 'General'}\n` +
        `Subject        : ${emailTargetRequest.subject || 'Material Requirement'}\n` +
        `Delivery Site  : ${emailTargetRequest.deliveryLocation || 'Rajpur, Mehsana'}\n` +
        `==================================================\n\n` +
        `REQUIRED MATERIAL ITEMS:\n` +
        itemsText +
        `\n\n` +
        (emailTargetRequest.specialNote ? `SPECIAL NOTE / INSTRUCTIONS:\n${emailTargetRequest.specialNote}\n\n` : '') +
        `TERMS & CONDITIONS:\n` +
        `1. Please submit your quotation / rate per kg or unit with tax details.\n` +
        `2. Material strictly along with Delivery Challan, Tax Invoice & Test Certificate (TC).\n` +
        `3. Delivery lead time must be clearly mentioned.\n\n` +
        `Thanking you we remain,\n\n` +
        `Purchase & Procurement Team\n` +
        `UMA TECHNOFAB\n` +
        `Manufacturers of Dairy, Chemical, Food & Pharma Machinery\n` +
        `Kadi - Mehsana Highway, Rajpur, Dist. Mehsana, Gujarat - 382715\n` +
        `Email: info@umatechnofab.com\n`
      );

      window.open(`mailto:${recipient}?subject=${subject}&body=${body}`, '_blank');
      toast.success(`Official Purchase Inquiry ${emailTargetRequest.rfqNumber} email dispatched to ${recipient}!`);
      setShowEmailModal(false);
    } catch (err: any) {
      console.error('Failed to send RFQ email:', err);
      toast.error(err?.message || 'Failed to dispatch RFQ email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Print Letterhead Action
  const handlePrint = () => {
    printContent('printable-rfq-letter', {
      title: selectedRequest ? `RFQ_${selectedRequest.rfqNumber}` : 'Purchase_Requirement_RFQ',
    });
  };

  // Table Columns
  const columns: ERPColumn<RequestForQuotation>[] = [
    {
      key: 'rfqNumber',
      header: 'REQ. NO',
      isCodeLink: true,
      onCodeClick: handleOpenLetterView,
      cell: (r) => (
        <button
          type="button"
          onClick={() => handleOpenLetterView(r)}
          className="text-amber-800 hover:text-amber-950 font-mono font-bold text-xs underline cursor-pointer text-left"
        >
          {r.rfqNumber}
        </button>
      ),
    },
    {
      key: 'rfqDate',
      header: 'DATE',
      cell: (r) => (
        <span className="font-mono text-xs text-[#211B17] font-semibold">
          {r.rfqDate}
        </span>
      ),
    },
    {
      key: 'project',
      header: 'PROJECT REFERENCE',
      cell: (r) => (
        <span className="font-mono font-bold text-xs text-crm-brand-700">
          {r.projectId || 'General'}
        </span>
      ),
    },
    {
      key: 'supplierName',
      header: 'SUPPLIER / VENDOR',
      cell: (r) => {
        const { vendorName, phone, email, contactPerson } = resolveVendorDetails(r);
        return (
          <div className="space-y-0.5">
            <span className="font-bold text-xs text-[#211B17] block uppercase">{vendorName}</span>
            {contactPerson && contactPerson !== 'Contact Person' && (
              <span className="text-[10px] text-gray-500 font-medium block">Attn: {contactPerson}</span>
            )}
            <div className="flex flex-col text-[11px] text-[#70665F]">
              {phone ? (
                <button
                  type="button"
                  onClick={() => handleSendWhatsApp(r)}
                  title="Click to Send WhatsApp"
                  className="font-mono text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer text-left"
                >
                  <Phone className="w-3 h-3 text-emerald-600 inline shrink-0" />
                  <span>{phone}</span>
                </button>
              ) : (
                <span className="font-mono text-slate-400">No contact phone</span>
              )}
              {email ? (
                <button
                  type="button"
                  onClick={() => handleSendEmail(r)}
                  title="Click to Send Email"
                  className="text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1 truncate max-w-[180px] cursor-pointer text-left"
                >
                  <Mail className="w-3 h-3 text-blue-600 inline shrink-0" />
                  <span>{email}</span>
                </button>
              ) : (
                <span className="font-mono text-slate-400 text-[10px]">No email specified</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'subject',
      header: 'SUBJECT / REQUIREMENT',
      cell: (r) => (
        <div className="max-w-xs">
          <span className="font-semibold text-xs text-[#211B17] block truncate">
            {r.subject || 'Material Purchase Requirement'}
          </span>
          <span className="text-[11px] text-amber-700 font-medium block">
            {r.items?.length || 0} item lines requested
          </span>
        </div>
      ),
    },
    {
      key: 'totalWeight',
      header: 'TOTAL QTY',
      cell: (r) => {
        const total = (r.items || []).reduce((acc, itm) => acc + Number(itm.quantity || itm.requiredQuantity || 0), 0);
        const uom = r.items?.[0]?.unitOfMeasure || 'KG';
        return (
          <span className="font-mono font-bold text-xs text-[#211B17]">
            {total.toLocaleString()} {uom}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: (r) => (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          {r.status || 'Sent to Suppliers'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      cell: (r) => (
        <div className="flex items-center gap-1.5 justify-end">
          <button
            type="button"
            onClick={() => handleOpenLetterView(r)}
            title="View & Print Official REQUIRE Letter"
            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleSendWhatsApp(r)}
            title="Send Inquiry via WhatsApp"
            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleSendEmail(r)}
            title="Send Inquiry via Email"
            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEditModal(r)}
            title="Edit Purchase Request"
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteRequest(r)}
            title="Delete Request"
            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Helper metrics
  const totalRequestsCount = rfqs.length;
  const totalItemLines = rfqs.reduce((sum, r) => sum + (r.items?.length || 0), 0);

  return (
    <div className="space-y-4">

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider block">
              Total Purchase Requests
            </span>
            <span className="text-2xl font-black text-[#211B17] font-mono mt-0.5 block">
              {totalRequestsCount}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">Inquiries sent to vendors</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider block">
              Total Material Lines
            </span>
            <span className="text-2xl font-black text-[#211B17] font-mono mt-0.5 block">
              {totalItemLines}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">Plates, Coils, Bought-out</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#70665F] uppercase tracking-wider block">
              Registered Suppliers
            </span>
            <span className="text-2xl font-black text-[#211B17] font-mono mt-0.5 block">
              {suppliers.length}
            </span>
            <span className="text-[11px] text-blue-700 font-medium">Active vendors in directory</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center border border-blue-200">
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main List Layout */}
      <ERPListPageLayout<RequestForQuotation>
        breadcrumbs={['DASHBOARD', 'PURCHASE', 'PURCHASE REQUESTS (REQUIRE / RFQ)']}
        data={rfqs}
        columns={columns}
        searchPlaceholder="Search requisition no, supplier, project or subject..."
        addNewLabel="+ Create Purchase Request"
        onAddNew={handleOpenCreateModal}
        isLoading={isInitialLoading}
      />

      {/* ===================================================================== */}
      {/* MODAL 1: CREATE / EDIT PURCHASE REQUEST FORM */}
      {/* ===================================================================== */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-[#EBE3DB] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#211B17] text-sm">
                    {editingId ? 'Edit Purchase Request' : 'Create New Purchase Request (REQUIRE)'}
                  </h3>
                  <p className="text-[11px] text-[#70665F]">
                    Generates official inquiry letter matching Uma Technofab format
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white text-[#70665F] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitForm} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Row 1: Project & Quick Select Supplier */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] space-y-3">
                <h4 className="font-bold text-[#211B17] text-xs flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-700" />
                  <span>Project & Supplier / Vendor Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Linked Project Reference */}
                  <div>
                    <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                      Linked Project Reference:
                    </label>
                    <select
                      value={formData.selectedProjectId}
                      onChange={(e) => handleProjectSelect(e.target.value)}
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs text-[#211B17] font-semibold focus:outline-none focus:border-amber-600 font-mono"
                    >
                      <option value="">-- Select Project Reference --</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.projectNumber || p.id}>
                          {p.projectNumber || p.id} - {p.projectName} {p.customerName ? `(${p.customerName})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Supplier from Master */}
                  <div>
                    <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                      Select Supplier from Master:
                    </label>
                    <select
                      value={formData.selectedSupplierId}
                      onChange={(e) => handleSupplierSelect(e.target.value)}
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs text-[#211B17] font-semibold focus:outline-none focus:border-amber-600"
                    >
                      <option value="">-- Select Supplier (Custom / Manually) --</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.supplierName || s.name} ({s.vendorCode || s.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Auto-filled / Editable Vendor Information */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-[#EBE3DB]">
                  <div>
                    <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                      Vendor / Company Name *:
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.vendorName}
                      onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                      placeholder="e.g. CALICO METAL."
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#211B17] focus:outline-none focus:border-amber-600 uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                      Vendor Mobile No (WhatsApp) *:
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.vendorMobile}
                      onChange={(e) => setFormData({ ...formData, vendorMobile: e.target.value })}
                      placeholder="e.g. 9099911191"
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-[#211B17] focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                      Vendor GSTIN:
                    </label>
                    <input
                      type="text"
                      value={formData.vendorGstin}
                      onChange={(e) => setFormData({ ...formData, vendorGstin: e.target.value })}
                      placeholder="e.g. 24AABCC1234F1Z5"
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#211B17] focus:outline-none focus:border-amber-600 uppercase"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                      Vendor Full Address:
                    </label>
                    <textarea
                      rows={2}
                      value={formData.vendorAddress}
                      onChange={(e) => setFormData({ ...formData, vendorAddress: e.target.value })}
                      placeholder="Street, Estate, City, State"
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                      Vendor Email (Optional):
                    </label>
                    <input
                      type="email"
                      value={formData.vendorEmail}
                      onChange={(e) => setFormData({ ...formData, vendorEmail: e.target.value })}
                      placeholder="sales@vendor.com"
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2.5 py-1.5 text-xs text-[#211B17] focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                {/* Document Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-[#EBE3DB]">
                  <div>
                    <label className="text-[10px] font-bold text-[#70665F] block mb-1">REQ. NO:</label>
                    <input
                      type="text"
                      value={formData.rfqNumber}
                      onChange={(e) => setFormData({ ...formData, rfqNumber: e.target.value })}
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1 text-xs font-mono font-bold text-amber-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#70665F] block mb-1">DATE:</label>
                    <input
                      type="text"
                      value={formData.rfqDate}
                      onChange={(e) => setFormData({ ...formData, rfqDate: e.target.value })}
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1 text-xs font-mono font-bold text-[#211B17]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#70665F] block mb-1">DELIVERY LOCATION:</label>
                    <input
                      type="text"
                      value={formData.deliveryLocation}
                      onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1 text-xs font-bold text-[#211B17]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#70665F] block mb-1">TAXES:</label>
                    <input
                      type="text"
                      value={formData.taxes}
                      onChange={(e) => setFormData({ ...formData, taxes: e.target.value })}
                      className="w-full bg-white border border-[#EBE3DB] rounded-lg px-2 py-1 text-xs font-bold text-[#211B17]"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Subject */}
              <div>
                <label className="text-[10px] font-bold text-[#70665F] block mb-1 uppercase tracking-wider">
                  Subject Line *:
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. REQUIRE FOR SS 316 L HR PLATE & COIL JINDAL MAKE"
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs font-bold text-[#211B17] focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Row 3: Material Requirement Items Builder */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-[#211B17] text-xs flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-amber-700" />
                      <span>Material Lines to Quote ({formData.items.length})</span>
                    </h4>
                    <p className="text-[11px] text-[#70665F]">
                      Select items from project requirement dropdown or customize description, quantity, and UOM
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentProjectItems.length > 0 && (
                      <button
                        type="button"
                        onClick={handleReloadProjectItems}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs transition cursor-pointer shadow-2xs active:scale-95"
                        title="Reload all items from project requisition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Auto-fill All ({currentProjectItems.length} items)</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition cursor-pointer shadow-2xs active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-700" />
                      <span>Add Material Line</span>
                    </button>
                  </div>
                </div>

                {/* Project requirement status banner if project is selected */}
                {formData.selectedProjectId && (
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      <span className="font-semibold text-amber-950">
                        {currentProjectItems.length > 0 ? (
                          <>
                            <strong className="font-bold font-mono text-amber-900">{currentProjectItems.length} required item(s)</strong> found for project <span className="font-mono font-bold text-amber-900">{formData.selectedProjectId}</span>.
                          </>
                        ) : (
                          <>
                            No requisition items recorded for project <span className="font-mono font-bold text-amber-900">{formData.selectedProjectId}</span>. You can select items from Master Catalog below.
                          </>
                        )}
                      </span>
                    </div>
                    {currentProjectItems.length > 0 && (
                      <span className="text-[11px] text-amber-800 font-medium">
                        Items auto-populated in table below
                      </span>
                    )}
                  </div>
                )}

                <div className="border border-[#EBE3DB] rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[850px]">
                    <thead className="bg-[#FAF7F2] text-[10px] font-bold text-[#70665F] uppercase border-b border-[#EBE3DB]">
                      <tr>
                        <th className="p-2 w-8 text-center">SR.</th>
                        <th className="p-2 w-52">SELECT ITEM (DROPDOWN)</th>
                        <th className="p-2 w-44">GROUP / CATEGORY TITLE</th>
                        <th className="p-2">DESCRIPTION OF ITEM(S)</th>
                        <th className="p-2 w-24 text-center">QTY</th>
                        <th className="p-2 w-20 text-center">UOM</th>
                        <th className="p-2 w-8 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE3DB] bg-white">
                      {formData.items.map((itm: any, idx: number) => (
                        <tr key={itm.id} className="hover:bg-[#FAF7F2]/50">
                          <td className="p-2 text-center font-mono font-bold text-[#70665F]">
                            {idx + 1}
                          </td>
                          <td className="p-1.5">
                            <select
                              value={itm.selectedItemKey || ''}
                              onChange={(e) => handleSelectItemForLine(itm.id, e.target.value)}
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-2 py-1.5 text-xs font-semibold text-[#211B17] focus:outline-none focus:border-amber-600 truncate"
                              title="Select item from project requisition or master catalog"
                            >
                              <option value="">-- Choose Item / Requisition --</option>
                              {currentProjectItems.length > 0 && (
                                <optgroup label={`📋 Project Required Items (${currentProjectItems.length})`}>
                                  {currentProjectItems.map((pItm) => (
                                    <option key={pItm.key} value={pItm.key}>
                                      {pItm.itemCode ? `${pItm.itemCode} - ` : ''}{pItm.itemName} (Req: {pItm.quantity} {pItm.unitOfMeasure})
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                              {allRequisitionItems.length > 0 && (
                                <optgroup label={`📑 Other Project Requisitions (${allRequisitionItems.length})`}>
                                  {allRequisitionItems.map((aItm) => (
                                    <option key={aItm.key} value={aItm.key}>
                                      [{aItm.projectRef}] {aItm.itemCode ? `${aItm.itemCode} - ` : ''}{aItm.itemName} ({aItm.quantity} {aItm.unitOfMeasure})
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                              {masterItemOptions.length > 0 && (
                                <optgroup label={`📦 Master Catalog (${masterItemOptions.length})`}>
                                  {masterItemOptions.map((m) => (
                                    <option key={m.key} value={m.key}>
                                      {m.label}
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                            </select>
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={itm.groupTitle || ''}
                              onChange={(e) => handleItemFieldChange(itm.id, 'groupTitle', e.target.value)}
                              placeholder="❖ Fabricated / SS 316 L"
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-600"
                            />
                          </td>
                          <td className="p-1.5">
                            <textarea
                              rows={2}
                              required
                              value={itm.itemName}
                              onChange={(e) => handleItemFieldChange(itm.id, 'itemName', e.target.value)}
                              placeholder="e.g. tank box 7865X4548 SIZE"
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-2 py-1.5 text-xs font-bold text-[#211B17] focus:outline-none focus:border-amber-600"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              required
                              value={itm.quantity}
                              onChange={(e) => handleItemFieldChange(itm.id, 'quantity', e.target.value)}
                              placeholder="e.g. 2"
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-center text-amber-900 focus:outline-none focus:border-amber-600"
                            />
                          </td>
                          <td className="p-1.5">
                            <select
                              value={(itm.unitOfMeasure || 'NOS').toUpperCase()}
                              onChange={(e) => handleItemFieldChange(itm.id, 'unitOfMeasure', e.target.value)}
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-1 py-1.5 text-xs font-bold text-center text-[#211B17]"
                            >
                              <option value="NOS">NOS</option>
                              <option value="KG">KG</option>
                              <option value="MTR">MTR</option>
                              <option value="SET">SET</option>
                              <option value="TON">TON</option>
                              <option value="PKT">PKT</option>
                              <option value="PCS">PCS</option>
                              <option value="LOT">LOT</option>
                              <option value="PAIR">PAIR</option>
                              <option value="BAG">BAG</option>
                              <option value="LTR">LTR</option>
                              {itm.unitOfMeasure &&
                                !['NOS', 'KG', 'MTR', 'SET', 'TON', 'PKT', 'PCS', 'LOT', 'PAIR', 'BAG', 'LTR'].includes(
                                  itm.unitOfMeasure.toUpperCase()
                                ) && (
                                  <option value={itm.unitOfMeasure.toUpperCase()}>
                                    {itm.unitOfMeasure.toUpperCase()}
                                  </option>
                                )}
                            </select>
                          </td>
                          <td className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(itm.id)}
                              className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer transition"
                              title="Remove item line"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Row 4: Special Note & Signatory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#EBE3DB]">
                <div>
                  <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                    Special Note / Instruction:
                  </label>
                  <textarea
                    rows={3}
                    value={formData.specialNote}
                    onChange={(e) => setFormData({ ...formData, specialNote: e.target.value })}
                    placeholder="e.g. REQUIRE TC&#10;SEND A BEST RATE"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-2.5 py-1.5 text-xs font-bold text-amber-950"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                    Signatory Authority:
                  </label>
                  <div className="p-3 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl space-y-1">
                    <span className="text-xs font-bold text-[#211B17] block">Thanking you we remain.</span>
                    <span className="text-xs font-extrabold text-amber-900 block">For, UMA TECHNOFAB.</span>
                    <span className="text-[11px] text-[#70665F] block">Authorized Purchase Representative</span>
                  </div>
                </div>
              </div>

              {/* Row 5: Terms & Conditions with Headlines (Matching Quotation structure) */}
              <div className="space-y-2.5 pt-3 border-t border-[#EBE3DB]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#211B17] text-xs flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-700" />
                      <span>Terms & Conditions</span>
                    </h4>
                    <p className="text-[11px] text-[#70665F]">
                      Official terms printed at the bottom of the purchase inquiry letter
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTerm}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-700" />
                    <span>+ Add Term Line</span>
                  </button>
                </div>

                <div className="space-y-2 bg-[#FAF7F2] p-3 rounded-xl border border-[#EBE3DB]">
                  {formData.terms.map((term: string, tIdx: number) => (
                    <div key={tIdx} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#70665F] w-6 shrink-0 font-mono text-center">
                        {tIdx + 1}.
                      </span>
                      <input
                        type="text"
                        value={term}
                        onChange={(e) => handleTermChange(tIdx, e.target.value)}
                        placeholder="e.g. Delivery: Material strictly along with Test Certificate & Challan"
                        className="w-full px-3 py-1.5 bg-white border border-[#EBE3DB] rounded-lg text-xs text-[#211B17] focus:outline-none focus:border-amber-600 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTerm(tIdx)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg transition shrink-0 cursor-pointer"
                        title="Remove Term"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {formData.terms.length === 0 && (
                    <div className="text-center py-2 text-xs text-[#70665F]">
                      No terms added. Click &quot;+ Add Term Line&quot; to add custom terms.
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Submit Footer */}
              <div className="border-t border-[#EBE3DB] pt-3 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#EBE3DB] text-[#70665F] font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs transition flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{editingId ? 'Update Purchase Request' : 'Generate & Save Purchase Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: OFFICIAL REQUIRE LETTERHEAD PRINT & VIEW MODAL */}
      {/* ===================================================================== */}
      {isViewLetterOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:static print:inset-auto print:p-0 print:bg-white print:overflow-visible print:block print:z-auto">
          <div className="bg-white rounded-2xl border border-[#EBE3DB] shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden my-auto animate-in zoom-in-95 duration-200 print:static print:max-h-none print:overflow-visible print:border-none print:shadow-none print:transform-none print:animate-none print:w-full print:m-0 print:block">
            {/* Modal Top Action Bar (Hidden during print) */}
            <div className="px-5 py-3 bg-[#FAF7F2] border-b border-[#EBE3DB] flex items-center justify-between shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                  {selectedRequest.rfqNumber}
                </span>
                <span className="text-xs font-semibold text-[#70665F]">
                  Official Purchase Inquiry Letter (REQUIRE)
                </span>
                {selectedRequest.projectId && (
                  <span className="text-xs font-bold text-crm-brand-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                    Project: {selectedRequest.projectId}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSendWhatsApp(selectedRequest)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-2xs cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendEmail(selectedRequest)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-2xs cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Letter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsViewLetterOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white text-[#70665F] transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Letter Content Container (Formatted strictly as Uma Technofab reference sheet) */}
            <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100 flex justify-center print:p-0 print:overflow-visible print:bg-white print:block">
              <div id="printable-rfq-letter" className="bg-white text-black p-6 sm:p-8 border-2 border-slate-900 max-w-3xl w-full mx-auto shadow-lg font-sans text-xs print:p-2 print:border-2 print:border-black print:shadow-none print:max-w-full print:w-full">
                {/* 1. Official Header */}
                <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-900 text-white font-black text-xl flex items-center justify-center rounded print:border print:border-black">
                      U
                    </div>
                    <div>
                      <h1 className="text-xl font-black tracking-wider text-slate-900">
                        UMA TECHNOFAB
                      </h1>
                      <p className="text-[10px] text-slate-700 font-semibold uppercase">
                        Manufacturers of Dairy, Chemical, Food & Pharma Machinery
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-slate-700 font-mono">
                    <div>Kadi - Mehsana Highway, Rajpur</div>
                    <div>Dist. Mehsana, Gujarat - 382715</div>
                    <div>Email: info@umatechnofab.com</div>
                  </div>
                </div>

                {/* 2. Document Title: REQUIRE */}
                <div className="text-center py-1 border-b-2 border-slate-900 bg-slate-50 font-black tracking-wider text-sm uppercase">
                  REQUIRE
                </div>

                {/* 3. Address & Document Details Grid */}
                {(() => {
                  const vendorInfo = resolveVendorDetails(selectedRequest);
                  const displayVendorName = vendorInfo.vendorName;
                  const displayAddress = vendorInfo.address || selectedRequest.supplierAddress || '';
                  const displayPhone = vendorInfo.phone || selectedRequest.supplierMobile;
                  const displayGstin = vendorInfo.gstin || selectedRequest.supplierGstin;
                  const displayContactPerson = vendorInfo.contactPerson;
                  const displayEmail = vendorInfo.email;
                  return (
                    <div className="grid grid-cols-2 border-b-2 border-slate-900 text-xs">
                      {/* Left: TO Address */}
                      <div className="p-2.5 border-r-2 border-slate-900 space-y-0.5">
                        <span className="font-bold text-[11px] block text-slate-900">TO,</span>
                        <span className="font-black text-xs block uppercase text-slate-900 tracking-wide">{displayVendorName}</span>
                        {displayContactPerson && displayContactPerson !== 'Contact Person' && (
                          <span className="text-[10px] font-semibold text-slate-700 block">Attn: {displayContactPerson}</span>
                        )}
                        <p className="text-[11px] whitespace-pre-line text-slate-800">
                          {displayAddress}
                        </p>
                        <p className="font-bold text-[11px] pt-1 text-slate-900">
                          MOB:- {displayPhone}
                        </p>
                        {displayEmail && (
                          <p className="text-[10px] text-slate-700 font-semibold">
                            EMAIL: {displayEmail}
                          </p>
                        )}
                        {displayGstin && (
                          <p className="font-mono text-[10px] text-slate-700">
                            GSTIN: {displayGstin}
                          </p>
                        )}
                      </div>

                  {/* Right: Metadata Grid Table */}
                  <div className="divide-y divide-slate-900 text-[11px]">
                    <div className="grid grid-cols-2 divide-x divide-slate-900">
                      <div className="p-1 font-bold">DATE: {selectedRequest.rfqDate}</div>
                      <div className="p-1 font-bold text-right">{selectedRequest.pageNo || 'PAGE NO: 1 OF 1'}</div>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-slate-900">
                      <div className="p-1 font-bold">REQ.NO: {selectedRequest.rfqNumber}</div>
                      <div className="p-1 font-bold">
                        PROJECT: <span className="font-mono">{selectedRequest.projectId || 'General'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-slate-900">
                      <div className="p-1 font-bold">BUYER: {selectedRequest.buyer || 'Uma Technofab.'}</div>
                      <div className="p-1 font-bold">TAXES: {selectedRequest.taxes || 'AS APPLICABLE.'}</div>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-slate-900">
                      <div className="p-1 font-bold">SHIP TO: {selectedRequest.shipTo || 'LOCAL'}</div>
                      <div className="p-1 font-bold">DELIVERY: {selectedRequest.deliveryLocation || 'RAJPUR'}</div>
                    </div>
                    <div className="p-1 font-bold col-span-2">
                      G.S.T.NO: 24AAEFU9027H1Z3
                    </div>
                  </div>
                </div>
              );
            })()}

                {/* 4. Subject Line */}
                <div className="p-2 border-b-2 border-slate-900 font-black text-xs uppercase bg-slate-50">
                  {selectedRequest.subject || 'Sub:- REQUIRE FOR MATERIAL PURCHASE INQUIRY'}
                </div>

                {/* 5. Material Table */}
                <div className="border-b-2 border-slate-900">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-900 text-[11px] font-bold text-center bg-slate-50">
                        <th className="p-1.5 w-10 border-r-2 border-slate-900">Sr.<br />No.</th>
                        <th className="p-1.5 border-r-2 border-slate-900 text-left">Description of item(s)</th>
                        <th className="p-1.5 w-24 border-r-2 border-slate-900">QTY.</th>
                        <th className="p-1.5 w-24 border-r-2 border-slate-900">Rate .Per<br />/Kg</th>
                        <th className="p-1.5 w-24">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 text-xs">
                      {selectedRequest.items?.map((item, idx) => {
                        // Strip duplicate dimension / specification from itemName if already present
                        const rawName = (item.itemName || '').trim();
                        const spec = (item.dimensions || item.specification || '').trim();
                        let cleanName = rawName;
                        if (spec && rawName.toLowerCase().includes(spec.toLowerCase())) {
                          cleanName = rawName
                            .replace(new RegExp(`\\n?\\s*${spec.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}`, 'gi'), '')
                            .trim();
                        }

                        return (
                          <tr key={item.id || idx} className="align-top">
                            <td className="p-2 text-center font-bold border-r-2 border-slate-900">
                              {idx + 1}
                            </td>
                            <td className="p-2 border-r-2 border-slate-900">
                              {item.groupTitle && (
                                <div className="font-black text-xs mb-1 uppercase tracking-tight flex items-center gap-1 text-slate-900">
                                  <span>◆</span>
                                  <span>{item.groupTitle}</span>
                                </div>
                              )}
                              <div className="font-bold uppercase text-[11px] pl-2 whitespace-pre-line text-slate-900">
                                [{idx + 1}] {cleanName || rawName}
                              </div>
                              {spec && (
                                <div className="text-[11px] pl-6 text-slate-800 whitespace-pre-line font-medium mt-0.5">
                                  {spec}
                                </div>
                              )}
                            </td>
                            <td className="p-2 text-center font-bold border-r-2 border-slate-900 whitespace-nowrap">
                              {Number(item.quantity || item.requiredQuantity).toLocaleString()} {item.unitOfMeasure || 'KG'}
                            </td>
                            <td className="p-2 text-center font-mono border-r-2 border-slate-900">
                              {item.rate && Number(item.rate) > 0 ? `₹ ${item.rate}` : ''}
                            </td>
                            <td className="p-2 text-right font-mono">
                              {item.amount && Number(item.amount) > 0 ? `₹ ${item.amount}` : ''}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Special Note Box inside Table */}
                      {selectedRequest.specialNote && (
                        <tr className="border-t-2 border-slate-900">
                          <td className="p-2 border-r-2 border-slate-900"></td>
                          <td className="p-2.5 border-r-2 border-slate-900 font-bold text-xs uppercase tracking-tight whitespace-pre-line text-slate-900">
                            {selectedRequest.specialNote}
                          </td>
                          <td className="p-2 border-r-2 border-slate-900"></td>
                          <td className="p-2 border-r-2 border-slate-900"></td>
                          <td className="p-2"></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 6. Terms & Conditions and Signature Grid */}
                <div className="grid grid-cols-12 text-[10px] leading-tight border-b-2 border-slate-900">
                  {/* Left 8 columns: Terms with Headlines */}
                  <div className="col-span-8 p-3 border-r-2 border-slate-900 space-y-1 bg-white">
                    <span className="font-black text-[11px] underline block uppercase tracking-wider text-slate-900">
                      TERMS & CONDITIONS
                    </span>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-900 text-[10px]">
                      {(selectedRequest.terms && selectedRequest.terms.length > 0
                        ? selectedRequest.terms
                        : defaultTerms
                      ).map((term, tIdx) => {
                        const colonIdx = term.indexOf(':');
                        const hasHeadline = colonIdx !== -1 && colonIdx < 30;
                        const headline = hasHeadline ? term.slice(0, colonIdx + 1) : '';
                        const desc = hasHeadline ? term.slice(colonIdx + 1) : term;

                        return (
                          <li key={tIdx} className="leading-tight">
                            {hasHeadline ? (
                              <>
                                <strong className="font-black text-slate-900">{headline}</strong>
                                <span>{desc}</span>
                              </>
                            ) : (
                              <span>{term}</span>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  </div>

                  {/* Right 4 columns: Authorized Signature */}
                  <div className="col-span-4 p-3 flex flex-col justify-between text-center bg-white min-h-[140px]">
                    <div className="font-bold text-xs pt-1 text-slate-900">
                      Thanking you we remain.
                    </div>
                    <div className="pb-1">
                      <div className="font-black text-xs uppercase tracking-wider text-slate-900">
                        FOR,
                      </div>
                      <div className="font-black text-sm uppercase tracking-wide mt-0.5 text-slate-900">
                        UMA TECHNOFAB.
                      </div>
                      <div className="text-[10px] text-slate-600 mt-6">
                        Authorized Signatory
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="text-[9px] text-slate-500 text-center pt-3 font-mono print:pt-2">
                  This is a computer generated purchase request letter from UMA TECHNOFAB Enterprise ERP.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Purchase Inquiry (REQUIRE / RFQ) Send Email Modal (Matching CRM Send Email Quotation Design) */}
      {showEmailModal && emailTargetRequest && (() => {
        const { vendorName, email: resolvedVendorEmail, supp } = resolveVendorDetails(emailTargetRequest);
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#2C241F] rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-[#E7DED5]">
              <div className="flex items-center justify-between border-b border-[#E7DED5] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#211B17] dark:text-white">
                      Send Official Purchase Inquiry Letter (REQUIRE)
                    </h3>
                    <p className="text-[11px] text-[#70665F]">
                      Dispatches formal Purchase Inquiry with attached official RFQ letter PDF.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="text-[#70665F] hover:text-[#211B17] text-lg font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDispatchEmailInquiry(targetEmail);
                }}
                className="space-y-4 text-xs"
              >
                <div className="p-3 bg-[#FAF7F2] dark:bg-[#1f1915] rounded-xl border border-[#E7DED5] space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#70665F]">Supplier / Vendor:</span>
                    <strong className="text-[#211B17] dark:text-white font-bold uppercase">{vendorName}</strong>
                  </div>
                  {/* Select / Switch Supplier from Master */}
                  <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-[#E7DED5]/60">
                    <span className="text-[#70665F]">Select / Change Vendor:</span>
                    <select
                      value={supp?.id || emailTargetRequest.supplierId || ''}
                      onChange={(e) => {
                        const newSupp = suppliers.find((s) => s.id === e.target.value);
                        if (newSupp) {
                          const newEmail = newSupp.email || (newSupp.contacts && newSupp.contacts[0]?.email) || '';
                          setTargetEmail(newEmail);
                          setEmailTargetRequest({
                            ...emailTargetRequest,
                            supplierId: newSupp.id,
                            supplierName: newSupp.supplierName || newSupp.name,
                            supplierEmail: newEmail,
                            supplierMobile: newSupp.mobile || newSupp.phone || '',
                            supplierAddress: newSupp.address || '',
                            supplierGstin: newSupp.gstin || '',
                          });
                        }
                      }}
                      className="bg-white dark:bg-[#2C241F] border border-[#E7DED5] rounded px-2 py-1 text-xs text-[#211B17] dark:text-white font-semibold cursor-pointer max-w-[260px]"
                    >
                      <option value="">-- Choose Vendor from Master --</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.supplierName || s.name} ({s.email || 'No email'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#70665F]">Inquiry Reference:</span>
                    <span className="font-mono font-bold text-emerald-700">{emailTargetRequest.rfqNumber}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#70665F]">Project / Job:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{emailTargetRequest.projectId || 'General'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#70665F]">Total Items:</span>
                    <strong className="font-mono text-slate-800 dark:text-slate-200">{emailTargetRequest.items?.length || 0} Required Line Items</strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#70665F]">PDF Attachment:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">Official_Purchase_Inquiry_{emailTargetRequest.rfqNumber}.pdf</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1 flex items-center justify-between">
                    <span>Recipient Supplier / Vendor Email ID <span className="text-rose-500">*</span></span>
                    {resolvedVendorEmail && targetEmail === resolvedVendorEmail && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                        ✓ Auto-populated from Vendor Master ({vendorName})
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#70665F] absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={targetEmail}
                      onChange={(e) => setTargetEmail(e.target.value)}
                      placeholder="Enter supplier email address"
                      className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] dark:bg-[#1f1915] border border-[#E7DED5] rounded-lg font-mono text-sm font-semibold text-[#211B17] dark:text-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <p className="text-[10px] text-[#70665F] mt-1">
                    The official Purchase Inquiry letter and required material specifications will be dispatched to this email address.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#E7DED5]">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    disabled={isSendingEmail}
                    className="px-4 py-2 border border-[#E7DED5] rounded-lg font-semibold text-[#544B45] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingEmail || !targetEmail.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    {isSendingEmail ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Official Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        <span>Send Official Purchase Inquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
