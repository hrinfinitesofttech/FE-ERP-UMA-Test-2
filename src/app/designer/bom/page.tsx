'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import { BOMHeader, BOMItem, BOMItemType, ProcurementType } from '../../../types/designer';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Lock,
  Unlock,
  CheckCircle2,
  DollarSign,
  Download,
  Layers,
  X,
  PlusCircle,
  Trash2,
  Package,
  Boxes,
  Check,
  Edit2,
  ArrowLeft,
  Building2,
  Eye,
  FolderKanban,
  Briefcase,
  Calendar,
  ChevronRight,
  Filter,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

interface NewBOMFormItem {
  id: string;
  partNumber: string; // BOM Code (બી એમ નો કોડ નંબર)
  description: string; // DISCRIPTION
  pCode: string; // P. (C, B, OC, P, M)
  thk: string; // THK
  size: string; // SIZE
  mat: string; // MAT
  quantity: number; // QTY
  remarks?: string; // REMARK
  unit?: string;
  estimatedRate?: number;
  material?: string;
  specification?: string;
  procurement?: 'PURCHASE' | 'FABRICATE';
  item_type?: 'RAW_MATERIAL' | 'FABRICATED' | 'BOUGHT_OUT' | 'CONSUMABLE' | 'HARDWARE' | 'ELECTRICAL';
}

const renderPBadge = (code?: string) => {
  const c = (code || 'C').toUpperCase();
  if (c === 'C') {
    return (
      <span className="px-2 py-0.5 rounded font-mono font-black text-[11px] bg-blue-100 text-blue-900 border border-blue-300" title="C = CUTTING LASER & PLASMA">
        C
      </span>
    );
  }
  if (c === 'B') {
    return (
      <span className="px-2 py-0.5 rounded font-mono font-black text-[11px] bg-purple-100 text-purple-900 border border-purple-300" title="B = BENDING">
        B
      </span>
    );
  }
  if (c === 'OC') {
    return (
      <span className="px-2 py-0.5 rounded font-mono font-black text-[11px] bg-amber-100 text-amber-900 border border-amber-300" title="OC = OTHER CUTTING">
        OC
      </span>
    );
  }
  if (c === 'P') {
    return (
      <span className="px-2 py-0.5 rounded font-mono font-black text-[11px] bg-emerald-100 text-emerald-900 border border-emerald-300" title="P = PURCHASE & STORE">
        P
      </span>
    );
  }
  if (c === 'M') {
    return (
      <span className="px-2 py-0.5 rounded font-mono font-black text-[11px] bg-rose-100 text-rose-900 border border-rose-300" title="M = MACHINING">
        M
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-100 text-slate-800 border border-slate-300">
      {c}
    </span>
  );
};

export default function MasterBOMPage() {
  const [mounted, setMounted] = useState(false);
  const { boms, addBOM, updateBOM, designJobs, projectJobs, itemMasters, currentUser } = useERP();

  // View state: 'projects' = Main Projects BOM List; 'detail' = Single Project BOM Detail
  const [viewMode, setViewMode] = useState<'projects' | 'detail'>('projects');

  // Currently active selected BOM ID or Job Number
  const [selectedJobNumber, setSelectedJobNumber] = useState<string>('');

  // Search & Filters for Projects List
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState<'all' | 'draft' | 'approved'>('all');

  // Search & Filters for BOM Items Table
  const [searchQuery, setSearchQuery] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState('all');

  // Modals state
  const [isCreateBOMModalOpen, setIsCreateBOMModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Toast notification
  const [successToast, setSuccessToast] = useState('');

  const initialUrlCheckedRef = React.useRef(false);

  useEffect(() => {
    setMounted(true);
    // Check URL parameters for direct job or project navigation only on initial mount
    if (typeof window !== 'undefined' && !initialUrlCheckedRef.current) {
      initialUrlCheckedRef.current = true;
      const params = new URLSearchParams(window.location.search);
      const urlJob = params.get('job') || params.get('project');
      if (urlJob) {
        setSelectedJobNumber(urlJob);
        setViewMode('detail');
      } else {
        const saved = localStorage.getItem('UMA_ERP_activeBOMJob');
        if (saved) {
          setSelectedJobNumber(saved);
        } else if (boms.length > 0) {
          setSelectedJobNumber(boms[0].id || boms[0].bomNumber || boms[0].jobNumber);
        }
      }
    }
  }, [boms]);

  // Persist active selection
  useEffect(() => {
    if (selectedJobNumber && typeof window !== 'undefined') {
      localStorage.setItem('UMA_ERP_activeBOMJob', selectedJobNumber);
    }
  }, [selectedJobNumber]);

  // Active BOM computation
  const activeBOM: BOMHeader | undefined = useMemo(() => {
    if (!boms || boms.length === 0) return undefined;
    return (
      boms.find(
        (b) =>
          b.id === selectedJobNumber ||
          b.jobNumber === selectedJobNumber ||
          b.bomNumber === selectedJobNumber ||
          b.projectId === selectedJobNumber ||
          (b as any).bom_name === selectedJobNumber ||
          (b as any).bomName === selectedJobNumber
      ) || boms[0]
    );
  }, [boms, selectedJobNumber]);

  // Matching Project for active BOM
  const activeProject: any = useMemo(() => {
    if (!activeBOM) return undefined;
    return (
      (projectJobs || []).find(
        (p) =>
          p.jobNumber === activeBOM.jobNumber ||
          p.projectNumber === activeBOM.projectId ||
          p.id === activeBOM.projectId
      ) ||
      (designJobs || []).find(
        (d) =>
          d.jobNumber === activeBOM.jobNumber ||
          d.projectNumber === activeBOM.projectId ||
          d.id === activeBOM.projectId
      )
    );
  }, [activeBOM, projectJobs, designJobs]);

  // ---------------------------------------------------------------------------
  // EXPORT BOM TO EXCEL (CSV) FUNCTIONALITY
  // ---------------------------------------------------------------------------
  const exportBOMToExcel = (bomToExport?: BOMHeader, project?: any) => {
    const targetBOM = bomToExport || activeBOM;
    if (!targetBOM) {
      alert('No BOM found to export.');
      return;
    }

    const targetProj =
      project ||
      (projectJobs || []).find(
        (p) =>
          p.jobNumber === targetBOM.jobNumber ||
          p.projectNumber === targetBOM.projectId ||
          p.id === targetBOM.projectId
      ) ||
      (designJobs || []).find(
        (d) =>
          d.jobNumber === targetBOM.jobNumber ||
          d.projectNumber === targetBOM.projectId ||
          d.id === targetBOM.projectId
      );

    const projectName =
      targetProj?.productName ||
      targetProj?.projectName ||
      targetBOM.machineName ||
      targetBOM.bomName ||
      'Industrial Equipment';
    const customerName = targetProj?.customerName || '';
    const projNumber = targetProj?.projectNumber || targetBOM.projectId || 'PRJ-2026';
    const jobNumber = targetProj?.jobNumber || targetBOM.jobNumber || 'JOB-2026';
    const bomNumber = targetBOM.bomNumber || 'BOM-001';
    const version = targetBOM.revisionNumber || targetBOM.version || 'V1';
    const status = targetBOM.approvalStatus || (targetBOM.isLocked ? 'APPROVED & LOCKED' : 'DRAFT');

    const csvRows: string[][] = [
      ['UMA TECHNO FAB PRIVATE LIMITED'],
      ['Production Report (JOB CARD / BOM) - Doc No: F-PRO 04'],
      ['PROCESS CODES: C = CUTTING LASER & PLASMA | B = BENDING | OC = OTHER CUTTING | P = PURCHASE & STORE | M = MACHINING'],
      [''],
      ['Project Number:', projNumber, 'Job Name:', projectName],
      ['Party Name:', customerName, 'Job Number:', jobNumber],
      ['BOM Number:', bomNumber, 'Version / Revision:', version],
      ['Approval Status:', status.toUpperCase(), 'Export Date:', new Date().toLocaleDateString('en-IN')],
      [''],
      [
        'SR. NO',
        'BOM CODE',
        'DISCRIPTION',
        'P.',
        'THK',
        'SIZE',
        'MAT',
        'QTY',
        'REMARK',
      ],
    ];

    const itemsList = targetBOM.items || [];
    itemsList.forEach((itm, idx) => {
      const partRef = itm.partNumber || (itm as any).part_number || `UTF-26-${idx + 1}`;
      const desc = itm.description || itm.itemName || (itm as any).material || '';
      const pCode = itm.pCode || (itm.procurement === 'PURCHASE' ? 'P' : 'C');
      const thk = itm.thk || itm.thickness || '';
      const size = itm.size || itm.specification || '';
      const mat = itm.mat || itm.materialGrade || itm.material || 'SS 316';
      const qty = Number(itm.quantity ?? (itm as any).qty ?? 1);
      const remark = itm.remarks || '';

      csvRows.push([
        String(idx + 1),
        `"${partRef.replace(/"/g, '""')}"`,
        `"${desc.replace(/"/g, '""')}"`,
        `"${pCode.replace(/"/g, '""')}"`,
        `"${thk.replace(/"/g, '""')}"`,
        `"${size.replace(/"/g, '""')}"`,
        `"${mat.replace(/"/g, '""')}"`,
        String(qty),
        `"${remark.replace(/"/g, '""')}"`,
      ]);
    });

    const csvContent = '\uFEFF' + csvRows.map((r) => r.join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BOM_${projNumber}_${bomNumber}_${version}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSuccessToast(`BOM ${bomNumber} successfully downloaded as Excel/CSV!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // ---------------------------------------------------------------------------
  // NEW PROJECT BOM FORM STATE (Project-First Architecture)
  // ---------------------------------------------------------------------------
  const [createSelectedProjectId, setCreateSelectedProjectId] = useState<string>('');
  const [createProjectName, setCreateProjectName] = useState<string>('');
  const [createCustomerName, setCreateCustomerName] = useState<string>('');
  const [createJobNumber, setCreateJobNumber] = useState<string>('');
  const [createBomName, setCreateBomName] = useState<string>('');
  const [createVersion, setCreateVersion] = useState<string>('V1');
  const [createProductQuantity, setCreateProductQuantity] = useState<number>(1);

  // Dynamic material lines inside Create BOM Modal (starts with a clean blank line)
  const [createMaterialLines, setCreateMaterialLines] = useState<NewBOMFormItem[]>([
    {
      id: 'init-1',
      partNumber: '',
      description: '',
      pCode: 'C',
      thk: '',
      size: '',
      mat: '',
      quantity: 1,
      remarks: '',
    },
  ]);

  // When opening Create Modal, default to clean selection or provided project
  const handleOpenCreateModal = (defaultProjId?: string) => {
    const targetProjId = defaultProjId || (projectJobs[0]?.id || projectJobs[0]?.projectNumber || '');
    setCreateSelectedProjectId(targetProjId);

    const targetProj: any = targetProjId
      ? (projectJobs || []).find((p) => p.id === targetProjId || p.projectNumber === targetProjId) ||
        (designJobs || []).find((d) => d.id === targetProjId || d.projectNumber === targetProjId)
      : null;

    if (targetProj) {
      setCreateProjectName(targetProj.productName || targetProj.projectName || '');
      setCreateCustomerName(targetProj.customerName || '');
      setCreateJobNumber(targetProj.jobNumber || '');
      setCreateBomName(`BOM - ${targetProj.productName || targetProj.projectName || 'Equipment'}`);
    } else {
      setCreateProjectName('');
      setCreateCustomerName('');
      setCreateJobNumber('');
      setCreateBomName('');
    }

    setCreateVersion('V1');
    setCreateProductQuantity(1);
    setCreateMaterialLines([
      {
        id: `line-${Date.now()}-1`,
        partNumber: '',
        description: '',
        pCode: 'C',
        thk: '',
        size: '',
        mat: '',
        quantity: 1,
        remarks: '',
      },
    ]);
    setIsCreateBOMModalOpen(true);
  };

  // Change project in Create Modal
  const handleSelectCreateProject = (projId: string) => {
    setCreateSelectedProjectId(projId);
    if (!projId) {
      setCreateProjectName('');
      setCreateCustomerName('');
      setCreateJobNumber('');
      setCreateBomName('');
      return;
    }

    const targetProj: any =
      (projectJobs || []).find((p) => p.id === projId || p.projectNumber === projId) ||
      (designJobs || []).find((d) => d.id === projId || d.projectNumber === projId);

    if (targetProj) {
      setCreateProjectName(targetProj.productName || targetProj.projectName || '');
      setCreateCustomerName(targetProj.customerName || '');
      setCreateJobNumber(targetProj.jobNumber || '');
      setCreateBomName(`BOM - ${targetProj.productName || targetProj.projectName || 'Equipment'}`);
    }
  };

  // Add line inside Create Modal
  const handleAddCreateMaterialLine = () => {
    const nextNum = createMaterialLines.length + 1;
    const newLine: NewBOMFormItem = {
      id: `line-${Date.now()}-${nextNum}`,
      partNumber: '',
      description: '',
      pCode: 'C',
      thk: '',
      size: '',
      mat: '',
      quantity: 1,
      remarks: '',
    };
    setCreateMaterialLines([...createMaterialLines, newLine]);
  };

  // Remove line inside Create Modal
  const handleRemoveCreateMaterialLine = (lineId: string) => {
    if (createMaterialLines.length <= 1) {
      setCreateMaterialLines([
        {
          id: `line-${Date.now()}-1`,
          partNumber: '',
          description: '',
          pCode: 'C',
          thk: '',
          size: '',
          mat: '',
          quantity: 1,
          remarks: '',
        },
      ]);
      return;
    }
    setCreateMaterialLines(createMaterialLines.filter((l) => l.id !== lineId));
  };

  // Update line inside Create Modal
  const handleUpdateCreateLine = (lineId: string, field: keyof NewBOMFormItem, val: any) => {
    setCreateMaterialLines((prev) =>
      prev.map((line) => {
        if (line.id !== lineId) return line;
        return { ...line, [field]: val };
      })
    );
  };

  // Submit Create New BOM
  const handleSubmitNewBOM = (e: React.FormEvent) => {
    e.preventDefault();

    if (!createSelectedProjectId && !createProjectName.trim()) {
      alert('Please select a Target Project.');
      return;
    }

    if (createMaterialLines.length === 0) {
      alert('Please add at least one material line item to the BOM.');
      return;
    }

    const jobNo = createJobNumber.trim() || `JOB-2026-${Date.now().toString().slice(-4)}`;
    const bomNo = `BOM-${jobNo}`;

    // Convert form lines to BOMItems matching shopfloor card
    const finalItems: BOMItem[] = createMaterialLines.map((line, idx) => {
      const qty = Number(line.quantity) || 1;

      return {
        id: `bi-${Date.now()}-${idx + 1}`,
        itemNo: idx + 1,
        partNumber: line.partNumber || `UTF-26-${idx + 1}`,
        itemName: line.description || 'Component Item',
        description: line.description || '',
        specification: line.size || '',
        pCode: line.pCode || 'C',
        thk: line.thk || '',
        size: line.size || '',
        mat: line.mat || 'SS 316',
        material: line.mat || 'SS 316',
        quantity: qty,
        unit: 'NOS',
        remarks: line.remarks || '',
        procurement: (line.pCode === 'P' ? 'PURCHASE' : 'FABRICATE') as any,
        procurementType: (line.pCode === 'P' ? 'Purchase' : 'In-House') as any,
        itemType: (line.pCode === 'P' ? 'Bought-Out' : 'Fabricated') as any,
        estimatedRate: 0,
        totalEstimatedAmount: 0,
      };
    });

    const newBOMHeader: Omit<BOMHeader, 'id'> = {
      bomNumber: bomNo,
      projectId: createSelectedProjectId || createJobNumber,
      jobNumber: jobNo,
      product: createProjectName,
      machineName: createProjectName,
      bomName: createBomName.trim() || `Master BOM - ${createProjectName}`,
      version: createVersion.trim() || 'V1',
      revision: createVersion.trim() || 'V1',
      revisionNumber: createVersion.trim() || 'V1',
      quantity: Number(createProductQuantity) || 1,
      approvalStatus: 'draft',
      isLocked: false,
      preparedBy: `${currentUser?.firstName || 'Dharmesh'} ${currentUser?.lastName || 'Joshi'}`.trim(),
      items: finalItems,
    };

    addBOM(newBOMHeader);

    setIsCreateBOMModalOpen(false);
    setSelectedJobNumber(bomNo);
    setViewMode('projects'); // Redirect to Master Bill of Materials (BOM) List

    // Clean up URL query parameters so the view stays on the Projects Master BOM List
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      window.history.replaceState({}, '', window.location.pathname);
    }

    setSuccessToast(
      `Master BOM "${bomNo}" for Project "${createProjectName}" successfully created with ${finalItems.length} components! Redirected to Master BOM List.`
    );
    setTimeout(() => setSuccessToast(''), 5000);
  };

  // ---------------------------------------------------------------------------
  // SINGLE MATERIAL LINE MODAL (ADD / EDIT)
  // ---------------------------------------------------------------------------
  const [partNumber, setPartNumber] = useState('');
  const [description, setDescription] = useState('');
  const [pCode, setPCode] = useState<string>('C');
  const [thk, setThk] = useState('');
  const [size, setSize] = useState('');
  const [mat, setMat] = useState('SS 316');
  const [quantity, setQuantity] = useState(1);
  const [remarks, setRemarks] = useState('');

  const handleOpenAddItem = () => {
    if (!activeBOM || activeBOM.isLocked) return;
    const nextIdx = (activeBOM.items?.length || 0) + 1;
    setEditingItemId(null);
    setPartNumber(`UTF-${(activeBOM.jobNumber || '26').replace(/\D/g, '').slice(-2) || '26'}-${nextIdx.toString().padStart(2, '0')}`);
    setDescription('');
    setPCode('C');
    setThk('');
    setSize('');
    setMat('SS 316');
    setQuantity(1);
    setRemarks('');
    setIsAddItemModalOpen(true);
  };

  const handleOpenEditItem = (item: BOMItem) => {
    if (!activeBOM || activeBOM.isLocked) return;
    setEditingItemId(item.id);
    setPartNumber(item.partNumber || (item as any).part_number || '');
    setDescription(item.description || item.itemName || (item as any).material || '');
    setPCode(item.pCode || (item.procurement === 'PURCHASE' ? 'P' : 'C'));
    setThk(item.thk || item.thickness || '');
    setSize(item.size || item.specification || '');
    setMat(item.mat || item.materialGrade || item.material || 'SS 316');
    setQuantity(Number(item.quantity ?? (item as any).qty ?? 1));
    setRemarks(item.remarks || '');
    setIsAddItemModalOpen(true);
  };

  const handleSaveItemModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBOM) return;

    const qty = Number(quantity) || 1;

    if (editingItemId) {
      const updatedItems = activeBOM.items.map((i) =>
        i.id === editingItemId
          ? {
              ...i,
              partNumber,
              itemName: description,
              description,
              pCode,
              thk,
              size,
              mat,
              material: mat,
              specification: size,
              quantity: qty,
              remarks,
              procurement: (pCode === 'P' ? 'PURCHASE' : 'FABRICATE') as any,
              procurementType: (pCode === 'P' ? 'Purchase' : 'In-House') as any,
              itemType: (pCode === 'P' ? 'Bought-Out' : 'Fabricated') as any,
            }
          : i
      );

      updateBOM(activeBOM.id, {
        items: updatedItems,
        totalItemsCount: updatedItems.length,
      });

      setIsAddItemModalOpen(false);
      setEditingItemId(null);
      setSuccessToast(`BOM Component "${description || partNumber}" updated successfully!`);
      setTimeout(() => setSuccessToast(''), 4000);
      return;
    }

    // Add new line item
    const newNo = (activeBOM.items || []).length + 1;
    const newItem: BOMItem = {
      id: `bi-${Date.now()}`,
      itemNo: newNo,
      partNumber: partNumber || `UTF-${newNo.toString().padStart(2, '0')}`,
      itemName: description || 'Component Item',
      description,
      pCode,
      thk,
      size,
      mat,
      material: mat,
      specification: size,
      quantity: qty,
      unit: 'NOS',
      remarks,
      procurement: (pCode === 'P' ? 'PURCHASE' : 'FABRICATE') as any,
      procurementType: (pCode === 'P' ? 'Purchase' : 'In-House') as any,
      itemType: (pCode === 'P' ? 'Bought-Out' : 'Fabricated') as any,
      estimatedRate: 0,
      totalEstimatedAmount: 0,
    };

    const updatedItems = [...(activeBOM.items || []), newItem];

    updateBOM(activeBOM.id, {
      items: updatedItems,
      totalItemsCount: updatedItems.length,
    });

    setIsAddItemModalOpen(false);
    setSuccessToast(`Added Component "${description || partNumber}" to BOM ${activeBOM.bomNumber}!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!activeBOM || activeBOM.isLocked) return;
    const itemToDelete = activeBOM.items.find((i) => i.id === itemId);
    if (!confirm(`Are you sure you want to remove "${itemToDelete?.itemName || 'this item'}" from the BOM?`)) {
      return;
    }
    const updatedItems = activeBOM.items.filter((i) => i.id !== itemId);
    const newTotal = updatedItems.reduce(
      (s, i) => s + (i.totalEstimatedAmount || (Number(i.quantity || 1) * Number(i.estimatedRate || 0))),
      0
    );
    updateBOM(activeBOM.id, {
      items: updatedItems,
      totalItemsCount: updatedItems.length,
      estimatedTotalCost: newTotal,
    });
    setSuccessToast(`Item removed from BOM ${activeBOM.bomNumber}!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleLockBOM = () => {
    if (!activeBOM) return;
    updateBOM(activeBOM.id, {
      approvalStatus: 'approved',
      isLocked: true,
      approvedBy: `${currentUser?.firstName || 'Dharmesh'} ${currentUser?.lastName || 'Joshi'}`.trim(),
    });
    setSuccessToast(`Master BOM ${activeBOM.bomNumber} approved and locked for production!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // ---------------------------------------------------------------------------
  // FILTERED BOM ITEMS FOR ACTIVE BOM
  // ---------------------------------------------------------------------------
  const filteredBOMItems = useMemo(() => {
    if (!activeBOM) return [];
    return (activeBOM.items || []).filter((item) => {
      const q = searchQuery?.toLowerCase().trim() || '';
      const matchSearch =
        !q ||
        (item.partNumber && item.partNumber.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.itemName && item.itemName.toLowerCase().includes(q)) ||
        (item.pCode && item.pCode.toLowerCase().includes(q)) ||
        (item.thk && item.thk.toLowerCase().includes(q)) ||
        (item.size && item.size.toLowerCase().includes(q)) ||
        (item.mat && item.mat.toLowerCase().includes(q)) ||
        (item.material && item.material.toLowerCase().includes(q)) ||
        (item.remarks && item.remarks.toLowerCase().includes(q));

      if (!matchSearch) return false;
      if (itemTypeFilter === 'all') return true;

      const pCode = (item.pCode || (item.procurement === 'PURCHASE' ? 'P' : 'C')).toUpperCase();
      return pCode === itemTypeFilter.toUpperCase();
    });
  }, [activeBOM, searchQuery, itemTypeFilter]);

  const totalBOMCost = useMemo(() => {
    if (!activeBOM) return 0;
    return (activeBOM.items || []).reduce((acc, itm) => {
      const q = Number(itm.quantity ?? (itm as any).qty ?? 1);
      const r = Number(itm.estimatedRate ?? (itm as any).rate ?? 0);
      return acc + (itm.totalEstimatedAmount ?? q * r);
    }, 0);
  }, [activeBOM]);

  // ---------------------------------------------------------------------------
  // PROJECTS DIRECTORY DATA COMPUTATION
  // ---------------------------------------------------------------------------
  const projectsWithBOM = useMemo(() => {
    // Collect all projects from projectJobs and designJobs
    const projectMap = new Map<string, any>();

    // 1. First add known projects from projectJobs
    (projectJobs || []).forEach((p) => {
      projectMap.set(p.jobNumber || p.projectNumber || p.id, {
        id: p.id,
        projectNumber: p.projectNumber,
        projectName: p.productName || p.projectName || 'Project Equipment',
        customerName: p.customerName || '',
        jobNumber: p.jobNumber,
        orderValue: p.orderValue || 0,
        status: p.status,
      });
    });

    // 2. Supplement from designJobs
    (designJobs || []).forEach((d) => {
      const key = d.jobNumber || d.projectNumber || d.id;
      if (!projectMap.has(key)) {
        projectMap.set(key, {
          id: d.id,
          projectNumber: d.projectNumber,
          projectName: d.productName,
          customerName: d.customerName,
          jobNumber: d.jobNumber,
          orderValue: 0,
          status: d.status,
        });
      }
    });

    // 3. Map each BOM to its project info
    const directoryList = boms.map((b) => {
      const matched: any =
        projectMap.get(b.jobNumber) ||
        projectMap.get(b.projectId) ||
        (projectJobs || []).find(
          (p) => p.jobNumber === b.jobNumber || p.projectNumber === b.projectId
        ) ||
        (designJobs || []).find(
          (d) => d.jobNumber === b.jobNumber || d.projectNumber === b.projectId
        );

      const items = b.items || [];
      const cost = items.reduce((acc, itm) => {
        const q = Number(itm.quantity ?? (itm as any).qty ?? 1);
        const r = Number(itm.estimatedRate ?? (itm as any).rate ?? 0);
        return acc + (itm.totalEstimatedAmount ?? q * r);
      }, 0);

      return {
        bom: b,
        projectNumber: matched?.projectNumber || b.projectId || 'PRJ-2026',
        projectName: matched?.projectName || matched?.productName || b.machineName || b.bomName || 'Equipment',
        customerName: matched?.customerName || '',
        jobNumber: matched?.jobNumber || b.jobNumber || 'JOB-2026',
        itemsCount: items.length,
        totalCost: cost,
        isLocked: b.isLocked,
        status: b.approvalStatus || (b.isLocked ? 'approved' : 'draft'),
      };
    });

    // Filter by search & status
    return directoryList.filter((item) => {
      const q = projectSearchQuery.toLowerCase();
      const matchQuery =
        !q ||
        item.projectNumber.toLowerCase().includes(q) ||
        item.projectName.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.jobNumber.toLowerCase().includes(q) ||
        item.bom.bomNumber.toLowerCase().includes(q);

      if (!matchQuery) return false;
      if (projectStatusFilter === 'all') return true;
      if (projectStatusFilter === 'approved') return item.isLocked || item.status === 'approved';
      if (projectStatusFilter === 'draft') return !item.isLocked && item.status !== 'approved';
      return true;
    });
  }, [boms, projectJobs, designJobs, projectSearchQuery, projectStatusFilter]);

  const handleExportAllProjects = () => {
    const csv = [
      'BOM Number,Version,Project Number,Project / Equipment,Customer,Job Number,Components,Estimated Cost,Status',
      ...projectsWithBOM.map(
        (p) =>
          `"${p.bom.bomNumber}","${p.bom.revisionNumber || p.bom.version || 'V1'}","${p.projectNumber}","${p.projectName}","${p.customerName}","${p.jobNumber}","${p.itemsCount}","${p.totalCost}","${p.isLocked || p.status === 'approved' ? 'LOCKED' : 'DRAFT'}"`
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Projects_BOM_Directory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const projectBOMColumns: ERPColumn<(typeof projectsWithBOM)[0]>[] = [
    {
      key: 'bomNumber',
      header: 'MASTER BOM # / VER',
      isCodeLink: true,
      onCodeClick: (item) => {
        setSelectedJobNumber(item.bom.id || item.bom.bomNumber || item.bom.jobNumber);
        setViewMode('detail');
      },
      cell: (item) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-xs">
            {item.bom.bomNumber}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            v{item.bom.revisionNumber || item.bom.version || '1'}
          </span>
        </div>
      ),
    },
    {
      key: 'projectName',
      header: 'PROJECT & EQUIPMENT',
      cell: (item) => (
        <div className="min-w-[180px]">
          <span className="font-bold text-slate-800 text-xs block truncate max-w-xs" title={item.projectName}>
            {item.projectName}
          </span>
          <span className="text-[11px] text-purple-700 font-mono font-semibold">{item.projectNumber}</span>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'CUSTOMER & JOB REF',
      cell: (item) => (
        <div className="min-w-[150px]">
          <span className="font-semibold text-slate-800 text-xs block">{item.customerName || 'Standard Client'}</span>
          <span className="text-[10px] text-slate-500 font-mono">
            Job: <strong className="text-slate-700">{item.jobNumber}</strong>
          </span>
        </div>
      ),
    },
    {
      key: 'itemsCount',
      header: 'COMPONENTS',
      cell: (item) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-200 whitespace-nowrap">
          {item.itemsCount} Items
        </span>
      ),
    },
    {
      key: 'totalCost',
      header: 'ESTIMATED TOTAL COST',
      cell: (item) => (
        <span className="font-mono font-bold text-emerald-700 text-xs whitespace-nowrap">
          ₹ {item.totalCost.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: (item) => (
        <div className="whitespace-nowrap">
          {item.isLocked || item.status === 'approved' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>LOCKED</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>DRAFT</span>
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      cell: (item) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <button
            type="button"
            onClick={() => {
              setSelectedJobNumber(item.bom.id || item.bom.bomNumber || item.bom.jobNumber);
              setViewMode('detail');
            }}
            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-2xs cursor-pointer"
            title="Open BOM Details for this Project"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" />
            <span>Open BOM</span>
          </button>
          <button
            type="button"
            onClick={() => exportBOMToExcel(item.bom, item)}
            className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition border border-transparent hover:border-emerald-200 cursor-pointer"
            title="Download BOM to Excel/CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  if (!mounted) {
    return (
      <div className="p-8 text-center text-sm font-semibold text-[#70665F]">
        Loading Master Bill of Materials (BOM)...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-150">
      {/* ======================================================================= */}
      {/* 1. TOP HEADER & NAVIGATION BAR                                           */}
      {/* ======================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#EBE3DB]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[10px] font-bold">
              MODULE 3.8
            </span>
            <span className="text-xs text-[#70665F] font-bold">Designer & Engineering</span>
          </div>
          <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-amber-600" />
            <span>Master Bill of Materials (BOM)</span>
          </h1>
          <p className="text-xs text-[#70665F] mt-0.5">
            Project-Centric Material Specifications, Part Hierarchy & Production Procurement Routing
          </p>
        </div>

        {/* View Switcher & Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle between Projects Directory and BOM Items View */}
          <div className="flex items-center bg-[#FAF7F2] p-1 rounded-xl border border-[#EBE3DB]">
            <button
              onClick={() => setViewMode('projects')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'projects'
                  ? 'bg-white text-[#211B17] shadow-xs border border-[#EBE3DB]'
                  : 'text-[#70665F] hover:text-[#211B17]'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5 text-amber-600" />
              <span>Projects Directory ({projectsWithBOM.length})</span>
            </button>

            {activeBOM && (
              <button
                onClick={() => setViewMode('detail')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'detail'
                    ? 'bg-white text-[#211B17] shadow-xs border border-[#EBE3DB]'
                    : 'text-[#70665F] hover:text-[#211B17]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>BOM Items ({activeBOM.items?.length || 0})</span>
              </button>
            )}
          </div>

          {/* Create New Project BOM Button */}
          <button
            onClick={() => handleOpenCreateModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-amber-600/25 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project BOM</span>
          </button>

          {/* Export Active / General BOM to Excel */}
          {activeBOM && (
            <button
              onClick={() => exportBOMToExcel(activeBOM, activeProject)}
              title="Download Master BOM as formatted Excel/CSV file"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-emerald-800 border border-emerald-300 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export BOM Excel</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-2 shadow-xs animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 2. VIEW MODE A: MAIN PROJECTS BOM DIRECTORY (PROJECT-FIRST VIEW)        */}
      {/* ======================================================================= */}
      {viewMode === 'projects' && (
        <div className="space-y-4">
          {/* Status Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status:</span>
              {[
                { id: 'all', label: 'All Projects' },
                { id: 'approved', label: 'Approved & Locked' },
                { id: 'draft', label: 'Draft BOMs' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setProjectStatusFilter(st.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    projectStatusFilter === st.id
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{projectsWithBOM.length}</span> Project BOMs
            </div>
          </div>

          {/* ERPListPageLayout for Projects Master BOM Directory */}
          <ERPListPageLayout<(typeof projectsWithBOM)[0]>
            breadcrumbs={['DASHBOARD', 'DESIGNER & ENGINEERING', 'MASTER BOM']}
            title="Projects Master BOM Directory"
            columns={projectBOMColumns}
            data={projectsWithBOM}
            searchPlaceholder="Search project name, number, customer, job #, BOM #..."
            addNewLabel="New Project BOM"
            onAddNew={() => handleOpenCreateModal()}
            onExport={handleExportAllProjects}
          />
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. VIEW MODE B: SINGLE PROJECT BOM ITEMS DETAIL VIEW                   */}
      {/* ======================================================================= */}
      {viewMode === 'detail' && activeBOM && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Back Button & Project Context Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('projects')}
                className="px-3 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#211B17] font-bold text-xs border border-[#EBE3DB] flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                title="Return to Projects List"
              >
                <ArrowLeft className="w-4 h-4 text-amber-700" />
                <span>← All Projects List</span>
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-800">
                    {activeProject?.projectNumber || activeBOM.projectId || 'PRJ-2026'}
                  </span>
                  <span className="text-[#70665F]">•</span>
                  <span className="font-bold text-xs text-[#211B17]">
                    Job: {activeProject?.jobNumber || activeBOM.jobNumber}
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-[#211B17] tracking-tight">
                  {activeProject?.productName || activeProject?.projectName || activeBOM.machineName || activeBOM.bomName}
                </h2>
                <p className="text-[11px] text-[#70665F]">
                  Customer: <span className="font-semibold text-[#3E2723]">{activeProject?.customerName || 'N/A'}</span>
                </p>
              </div>
            </div>

            {/* Quick Switch Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right hidden md:block">
                <span className="text-[10px] text-[#70665F] font-bold uppercase block">Switch Project BOM:</span>
              </div>
              <select
                value={selectedJobNumber}
                onChange={(e) => setSelectedJobNumber(e.target.value)}
                className="bg-white border border-[#EBE3DB] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-[#211B17] focus:outline-none focus:border-amber-500 shadow-2xs cursor-pointer"
              >
                {boms.map((b) => {
                  const mProj =
                    (projectJobs || []).find((p) => p.jobNumber === b.jobNumber || p.projectNumber === b.projectId) ||
                    (designJobs || []).find((d) => d.jobNumber === b.jobNumber || d.projectNumber === b.projectId);
                  const pName = mProj?.productName || b.machineName || b.bomName || b.bomNumber;
                  const optVal = b.id || b.bomNumber || b.jobNumber;
                  return (
                    <option key={b.id || b.bomNumber} value={optVal}>
                      {b.bomNumber} — {pName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* BOM Summary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-[#EBE3DB] shadow-sm">
            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EBE3DB]">
              <span className="text-[10px] text-[#70665F] block font-bold uppercase tracking-wider">
                MASTER BOM NUMBER
              </span>
              <span className="font-mono text-lg font-black text-[#211B17]">
                {activeBOM.bomNumber}
              </span>
              <span className="text-[11px] text-amber-800 block font-mono font-semibold">
                Version: {activeBOM.revisionNumber || activeBOM.version || 'V1'}
              </span>
            </div>

            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EBE3DB]">
              <span className="text-[10px] text-[#70665F] block font-bold uppercase tracking-wider">
                TOTAL BOM COMPONENTS
              </span>
              <span className="font-mono text-xl font-black text-[#211B17]">
                {activeBOM.items?.length || 0} Items
              </span>
              <span className="text-[10px] text-[#70665F] block">
                Itemized Bill of Materials
              </span>
            </div>

            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EBE3DB]">
              <span className="text-[10px] text-[#70665F] block font-bold uppercase tracking-wider">
                ESTIMATED TOTAL BOM COST
              </span>
              <span className="font-mono text-xl font-black text-emerald-700">
                ₹ {totalBOMCost.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#70665F] block">
                Calculated for Production
              </span>
            </div>

            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EBE3DB] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#70665F] block font-bold uppercase tracking-wider">
                  APPROVAL STATUS
                </span>
                <span className="font-bold text-xs uppercase text-amber-700">
                  {activeBOM.approvalStatus || (activeBOM.isLocked ? 'approved' : 'draft')}
                </span>
                <span className="text-[10px] text-[#70665F] block">
                  By: {activeBOM.approvedBy || 'Engineering Lead'}
                </span>
              </div>
              {activeBOM.isLocked ? (
                <Lock className="w-6 h-6 text-emerald-600" />
              ) : (
                <Unlock className="w-6 h-6 text-amber-600" />
              )}
            </div>
          </div>

          {/* BOM Material Table Control Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#EBE3DB] shadow-xs">
            {/* Search Input */}
            <div className="flex-1 w-full relative">
              <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Material, Part #, Item Name, Specification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] placeholder-[#70665F] focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Process (P.) Filter & Add Material Line Button */}
            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
              <select
                value={itemTypeFilter}
                onChange={(e) => setItemTypeFilter(e.target.value)}
                className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs font-semibold text-[#211B17] focus:outline-none"
              >
                <option value="all">All Processes (P.)</option>
                <option value="C">C - Cutting Laser & Plasma</option>
                <option value="B">B - Bending</option>
                <option value="OC">OC - Other Cutting</option>
                <option value="P">P - Purchase & Store</option>
                <option value="M">M - Machining</option>
              </select>

              {!activeBOM.isLocked && (
                <button
                  onClick={handleOpenAddItem}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Material Line</span>
                </button>
              )}

              {/* Approve & Lock BOM button */}
              {!activeBOM.isLocked ? (
                <button
                  onClick={handleLockBOM}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Approve & Lock BOM</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    updateBOM(activeBOM.id, { isLocked: false, approvalStatus: 'draft' });
                    setSuccessToast(`BOM ${activeBOM.bomNumber} unlocked for editing.`);
                    setTimeout(() => setSuccessToast(''), 3000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Locked (Click to Unlock)</span>
                </button>
              )}
            </div>
          </div>

          {/* UMA TECHNO FAB Production Job Card Header & Process Legend */}
          <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 border border-amber-200 rounded-2xl p-3 px-4 mb-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="font-mono font-extrabold text-[10px] bg-amber-900 text-amber-50 px-2 py-0.5 rounded">
                DOC NO: F-PRO 04
              </span>
              <span className="font-extrabold text-[#211B17] uppercase tracking-wide text-xs">
                PRODUCTION REPORT (JOB CARD)
              </span>
            </div>
            {/* Process Legend */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
              <span className="text-[#70665F] font-bold uppercase mr-1">PROCESS LEGEND:</span>
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 font-mono">
                <strong>C</strong>: Cutting Laser & Plasma
              </span>
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 px-2 py-0.5 rounded border border-blue-300 font-mono">
                <strong>B</strong>: Bending
              </span>
              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-900 px-2 py-0.5 rounded border border-orange-300 font-mono">
                <strong>OC</strong>: Other Cutting
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300 font-mono">
                <strong>P</strong>: Purchase & Store
              </span>
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 px-2 py-0.5 rounded border border-purple-300 font-mono">
                <strong>M</strong>: Machining
              </span>
            </div>
          </div>

          {/* Material Items Table (Exact Job Card Columns) */}
          <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#EBE3DB] text-[10px] font-bold text-[#70665F] uppercase tracking-wider">
                    <th className="p-3 text-center w-12">SR. NO</th>
                    <th className="p-3 w-28">BOM CODE</th>
                    <th className="p-3">DISCRIPTION</th>
                    <th className="p-3 text-center w-16">P.</th>
                    <th className="p-3 text-center w-24">THK</th>
                    <th className="p-3">SIZE</th>
                    <th className="p-3 text-center w-24">MAT</th>
                    <th className="p-3 text-center w-16">QTY</th>
                    <th className="p-3">REMARK</th>
                    <th className="p-3 text-center w-28">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE3DB]">
                  {filteredBOMItems.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-[#70665F]">
                        <p className="font-semibold text-sm">No BOM items found.</p>
                        {!activeBOM.isLocked && (
                          <button
                            onClick={handleOpenAddItem}
                            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold text-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add First Material Component</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredBOMItems.map((item, idx) => {
                      const qty = Number(item.quantity ?? (item as any).qty ?? 1);
                      const currentPCode = item.pCode || (item.procurement === 'PURCHASE' ? 'P' : 'C');
                      const desc = item.description || item.itemName || item.material || (item as any).part_name || '-';
                      const thk = item.thk || (item as any).thickness || '-';
                      const size = item.size || item.specification || '-';
                      const mat = item.mat || (item as any).material || 'SS 316';
                      const remark = item.remarks || '-';

                      return (
                        <tr key={item.id || idx} className="hover:bg-[#FAF7F2]/80 transition">
                          {/* SR. NO */}
                          <td className="p-3 text-center font-mono text-[#70665F] font-bold">
                            {idx + 1}
                          </td>

                          {/* BOM CODE */}
                          <td className="p-3 font-mono font-bold text-amber-900">
                            {item.partNumber || `PRT-${idx + 1}`}
                          </td>

                          {/* DISCRIPTION */}
                          <td className="p-3">
                            <span className="font-bold text-[#211B17] block">
                              {desc}
                            </span>
                          </td>

                          {/* P. */}
                          <td className="p-3 text-center">
                            {renderPBadge(currentPCode)}
                          </td>

                          {/* THK */}
                          <td className="p-3 text-center font-mono font-bold text-[#211B17]">
                            <span className="px-2 py-0.5 rounded bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px]">
                              {thk}
                            </span>
                          </td>

                          {/* SIZE */}
                          <td className="p-3 font-mono text-xs text-[#211B17]">
                            {size}
                          </td>

                          {/* MAT */}
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-100 text-slate-800 border border-slate-200">
                              {mat}
                            </span>
                          </td>

                          {/* QTY */}
                          <td className="p-3 text-center font-mono font-black text-xs text-[#211B17]">
                            {qty}
                          </td>

                          {/* REMARK */}
                          <td className="p-3 text-[#70665F] text-xs">
                            {remark}
                          </td>

                          {/* Actions: Edit, Download (Excel), Delete */}
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* Edit Button */}
                              {!activeBOM.isLocked ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditItem(item)}
                                  title="Edit this line item"
                                  className="p-1.5 rounded-lg text-amber-700 hover:text-amber-900 hover:bg-amber-100 transition cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              ) : null}

                              {/* Download / Export Excel Option */}
                              <button
                                type="button"
                                onClick={() => exportBOMToExcel(activeBOM, activeProject)}
                                title="Download this BOM to Excel/CSV (Job Card Format)"
                                className="p-1.5 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 transition cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              {!activeBOM.isLocked ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(item.id)}
                                  title="Remove this line item"
                                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              ) : null}
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
        </div>
      )}

      {/* ======================================================================= */}
      {/* 4. MODAL: CREATE NEW PROJECT MASTER BOM (PROJECT-FIRST FLOW)           */}
      {/* ======================================================================= */}
      {isCreateBOMModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsCreateBOMModalOpen(false)}
        >
          <div
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl p-6 text-xs max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#EBE3DB] pb-3 shrink-0">
              <div>
                <h3 className="text-lg font-black text-[#211B17] flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-amber-600" />
                  <span>Create New Project Master BOM</span>
                </h3>
                <p className="text-[11px] text-[#70665F] mt-0.5">
                  Select Project, Define Master BOM Details & Add Required Material Component Lines
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateBOMModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#FAF7F2] text-[#70665F] hover:text-[#211B17] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitNewBOM} className="flex-1 overflow-y-auto space-y-4 py-3">
              {/* Step 1: Select Project */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3DB] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#211B17] text-xs flex items-center gap-1.5">
                    <FolderKanban className="w-4 h-4 text-amber-700" />
                    <span>Step 1: Select Target Project</span>
                  </span>
                  <span className="text-[10px] text-amber-800 font-semibold font-mono">Required</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                    Choose From Registered ERP Projects:
                  </label>
                  <select
                    value={createSelectedProjectId}
                    onChange={(e) => handleSelectCreateProject(e.target.value)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs font-bold text-[#211B17] focus:outline-none focus:border-amber-500"
                    required
                  >
                    <option value="">-- Select Project / Equipment --</option>
                    {(projectJobs || []).map((pj) => (
                      <option key={pj.id} value={pj.id}>
                        {pj.projectNumber} — {pj.customerName} [{pj.jobNumber}] {pj.productName}
                      </option>
                    ))}
                    {(designJobs || []).map((dj) => (
                      <option key={dj.id} value={dj.id}>
                        {dj.projectNumber} — {dj.customerName} [{dj.jobNumber}] {dj.productName}
                      </option>
                    ))}
                  </select>
                </div>

                {createProjectName && (
                  <div className="p-3 bg-white border border-[#EBE3DB] rounded-xl text-xs flex items-center justify-between flex-wrap gap-2 text-[#70665F]">
                    <div>
                      <span className="font-bold text-[#211B17] text-sm block">{createProjectName}</span>
                      <span>Customer: <strong>{createCustomerName || 'N/A'}</strong></span>
                      {createJobNumber && <span className="ml-3 font-mono">Job: <strong>{createJobNumber}</strong></span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Material Component Lines */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-[#211B17] text-xs flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-amber-700" />
                      <span>Step 2: Add BOM Required Materials & Components ({createMaterialLines.length})</span>
                    </h4>
                    <p className="text-[11px] text-[#70665F]">
                      Define all raw material plates, bought-out items, and sub-assemblies for this project
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCreateMaterialLine}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-700" />
                    <span>Add Material Line</span>
                  </button>
                </div>

                {/* Material Lines Form Table (Job Card Columns) */}
                <div className="border border-[#EBE3DB] rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead className="bg-[#FAF7F2] text-[10px] font-bold text-[#70665F] uppercase border-b border-[#EBE3DB]">
                      <tr>
                        <th className="p-2 w-10 text-center">SR. NO</th>
                        <th className="p-2">DISCRIPTION</th>
                        <th className="p-2 w-24 text-center">P.</th>
                        <th className="p-2 w-24 text-center">THK</th>
                        <th className="p-2 w-32">SIZE</th>
                        <th className="p-2 w-24 text-center">MAT</th>
                        <th className="p-2 w-16 text-center">QTY</th>
                        <th className="p-2 w-28">REMARK</th>
                        <th className="p-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE3DB] bg-white">
                      {createMaterialLines.map((line, idx) => (
                        <tr key={line.id} className="hover:bg-[#FAF7F2]/50">
                          {/* SR. NO */}
                          <td className="p-2 text-center font-mono font-bold text-[#70665F]">
                            {idx + 1}
                          </td>

                          {/* DISCRIPTION */}
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={line.description || line.material}
                              onChange={(e) => {
                                handleUpdateCreateLine(line.id, 'description', e.target.value);
                                handleUpdateCreateLine(line.id, 'material', e.target.value);
                              }}
                              placeholder="e.g. TANK SHELL, TOP CONE..."
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-2 py-1 text-xs text-[#211B17] font-semibold focus:outline-none focus:border-amber-500"
                              required
                            />
                          </td>

                          {/* P. (Process Code) */}
                          <td className="p-1.5">
                            <select
                              value={line.pCode || 'C'}
                              onChange={(e: any) => handleUpdateCreateLine(line.id, 'pCode', e.target.value)}
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-1.5 py-1 text-[11px] font-mono font-bold text-[#211B17] focus:outline-none focus:border-amber-500"
                            >
                              <option value="C">C (Cutting)</option>
                              <option value="B">B (Bending)</option>
                              <option value="OC">OC (Other Cutting)</option>
                              <option value="P">P (Purchase)</option>
                              <option value="M">M (Machining)</option>
                            </select>
                          </td>

                          {/* THK */}
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={line.thk}
                              onChange={(e) => handleUpdateCreateLine(line.id, 'thk', e.target.value)}
                              placeholder="5, 4 THK, 8"
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-2 py-1 text-xs font-mono text-center text-[#211B17] focus:outline-none focus:border-amber-500"
                            />
                          </td>

                          {/* SIZE */}
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={line.size}
                              onChange={(e) => handleUpdateCreateLine(line.id, 'size', e.target.value)}
                              placeholder="7868 X 5500 LG"
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-2 py-1 text-xs font-mono text-[#211B17] focus:outline-none focus:border-amber-500"
                            />
                          </td>

                          {/* MAT */}
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={line.mat}
                              onChange={(e) => handleUpdateCreateLine(line.id, 'mat', e.target.value)}
                              placeholder="SS 316, M.S"
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-2 py-1 text-xs font-mono font-bold text-center text-slate-800 focus:outline-none focus:border-amber-500"
                            />
                          </td>

                          {/* QTY */}
                          <td className="p-1.5">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={line.quantity}
                              onChange={(e) => handleUpdateCreateLine(line.id, 'quantity', Number(e.target.value))}
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-1.5 py-1 text-xs font-mono font-bold text-center text-[#211B17] focus:outline-none focus:border-amber-500"
                              required
                            />
                          </td>

                          {/* REMARK */}
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={line.remarks}
                              onChange={(e) => handleUpdateCreateLine(line.id, 'remarks', e.target.value)}
                              placeholder="Optional remark"
                              className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-2 py-1 text-xs text-[#211B17] focus:outline-none focus:border-amber-500"
                            />
                          </td>

                          {/* Remove Line */}
                          <td className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveCreateMaterialLine(line.id)}
                              className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <button
                    type="button"
                    onClick={handleAddCreateMaterialLine}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold text-xs hover:bg-amber-100 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-700" />
                    <span>Add Material Line</span>
                  </button>

                  <div className="text-right">
                    <span className="text-[10px] text-amber-800 font-bold uppercase block">Total Job Card Items:</span>
                    <span className="font-mono text-base font-black text-amber-950">
                      {createMaterialLines.length} Components
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer / Submit */}
              <div className="border-t border-[#EBE3DB] pt-3 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateBOMModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#EBE3DB] text-[#70665F] font-bold text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:brightness-110 text-white font-extrabold text-xs shadow-md shadow-amber-600/30 transition flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save & Create Project BOM</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 5. MODAL: ADD / EDIT SINGLE MATERIAL ITEM                               */}
      {/* ======================================================================= */}
      {isAddItemModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsAddItemModalOpen(false)}
        >
          <div
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl space-y-4 p-6 text-xs max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-extrabold text-[#211B17] flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-600" />
                <span>{editingItemId ? 'Edit Material Line Item' : 'Add Material Component to BOM'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddItemModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#FAF7F2] text-[#70665F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItemModal} className="space-y-3.5">
              {/* Row 1: BOM Code & Process (P.) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                    BOM CODE / NUMBER (નંબર / પાર્ટ કોડ):
                  </label>
                  <input
                    type="text"
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    placeholder="e.g. UTF-26-01 or PRT-01"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-900 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                    P. (PROCESS CODE):
                  </label>
                  <select
                    value={pCode}
                    onChange={(e: any) => setPCode(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-2.5 py-2 text-xs font-mono font-bold text-[#211B17] focus:outline-none focus:border-amber-500"
                  >
                    <option value="C">C - Cutting Laser & Plasma</option>
                    <option value="B">B - Bending</option>
                    <option value="OC">OC - Other Cutting</option>
                    <option value="P">P - Purchase & Store</option>
                    <option value="M">M - Machining</option>
                  </select>
                </div>
              </div>

              {/* Row 2: DISCRIPTION */}
              <div>
                <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                  DISCRIPTION (ડિસ્ક્રિપ્શન / પાર્ટ નામ):
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. TANK SHELL, TOP CONE, BASE PLATE, FLANGE, PIPE..."
                  className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs font-bold text-[#211B17] focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Row 3: THK, SIZE, MAT */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                    THK (જાડાઈ / જાડાઈ શિડ્યુલ):
                  </label>
                  <input
                    type="text"
                    value={thk}
                    onChange={(e) => setThk(e.target.value)}
                    placeholder="e.g. 5, 4 THK, 8, 14, SCH 10, STD"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#211B17] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                    SIZE (સાઈઝ / ડાયમેન્શન):
                  </label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="e.g. 7868 X 5500 LG, 600 DIA, OD 2540 MM"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs font-mono text-[#211B17] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                    MAT (મટીરીયલ ગ્રેડ):
                  </label>
                  <input
                    type="text"
                    value={mat}
                    onChange={(e) => setMat(e.target.value)}
                    placeholder="e.g. SS 316, SS CLD, M.S, SS 304"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#211B17] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Row 4: QTY & REMARK */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                    QTY (જથ્થો):
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs font-mono font-black text-[#211B17] focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-[#70665F] block mb-1">
                    REMARK (રિમાર્ક / વધારાની નોંધ):
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Optional remark or notes"
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-[#EBE3DB] pt-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#EBE3DB] text-[#70665F] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold text-xs shadow-xs"
                >
                  {editingItemId ? 'Update Component' : 'Add Component Line'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
