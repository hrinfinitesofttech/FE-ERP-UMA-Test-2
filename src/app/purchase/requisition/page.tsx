'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import {
  ERPFormSection,
  ERPFormGrid,
  ERPInput,
  ERPSelect,
} from '../../../components/ui/ERPFormLayout';
import { PurchaseRequisition, PRItem } from '../../../types/purchase';
import { formatDate } from '../../../lib/utils';
import { toast } from '../../../context/ToastContext';
import {
  Eye,
  CheckCircle2,
  AlertTriangle,
  X,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Package,
  FileText,
  Layers,
  FolderKanban,
} from 'lucide-react';

interface RequisitionLineItemRow {
  id: string;
  seqNo: number;
  itemCode: string;
  itemName: string;
  specification: string;
  category: string;
  unitOfMeasure: string;
  requiredQuantity: number;
  requiredByDate: string;
  prId: string;
  prNumber: string;
  projectId: string;
  customerName?: string;
  requisitionDate: string;
  priority: string;
  status: string;
  requestedBy: string;
  department?: string;
  parentPR: PurchaseRequisition;
}

export default function PurchaseRequisitionPage() {
  const {
    purchaseRequisitions,
    addPurchaseRequisition,
    approvePurchaseRequisition,
    projectJobs = [],
    currentUser,
    isInitialLoading,
  } = useERP();

  const projects = projectJobs;

  // Tab View Mode: 'items' (Default Item-wise list) or 'dossiers' (PR header list)
  const [viewMode, setViewMode] = useState<'items' | 'dossiers'>('items');

  const [viewPR, setViewPR] = useState<PurchaseRequisition | null>(null);
  const [selectedLineItem, setSelectedLineItem] = useState<RequisitionLineItemRow | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [approvedPrModal, setApprovedPrModal] = useState<PurchaseRequisition | null>(null);

  const handleViewItem = (row: RequisitionLineItemRow) => {
    setViewPR(row.parentPR);
    setSelectedLineItem(row);
  };

  const handleViewPR = (pr: PurchaseRequisition) => {
    setViewPR(pr);
    setSelectedLineItem(null);
  };

  const handleCloseModal = () => {
    setViewPR(null);
    setSelectedLineItem(null);
  };

  // Form State for Create PR Modal
  const [newProjectId, setNewProjectId] = useState(
    projects[0]?.projectNumber || projects[0]?.id || projectJobs[0]?.jobNumber || ''
  );
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('High');
  const [newRequiredDate, setNewRequiredDate] = useState('2026-10-15');
  const [newRemarks, setNewRemarks] = useState('');

  const [itemsList, setItemsList] = useState<Partial<PRItem>[]>([
    {
      itemCode: 'ITM-2026-001',
      itemName: 'SS 304 Plate 10mm',
      specification: 'ASTM A240 Gr. 304',
      category: 'Raw Material',
      unitOfMeasure: 'Kg',
      requiredQuantity: 500,
      requiredByDate: '2026-10-25',
    },
  ]);

  // Flatten Purchase Requisitions into Item-wise rows for purchase visibility
  const allRequisitionItems = useMemo<RequisitionLineItemRow[]>(() => {
    const list: RequisitionLineItemRow[] = [];
    let count = 1;
    purchaseRequisitions.forEach((pr) => {
      (pr.items || []).forEach((item, idx) => {
        list.push({
          id: item.id || `${pr.id}-item-${idx}`,
          seqNo: count++,
          itemCode: item.itemCode || '-',
          itemName: item.itemName || 'Engineering Component',
          specification: item.specification || '',
          category: item.category || 'Raw Material',
          unitOfMeasure: item.unitOfMeasure || 'NOS',
          requiredQuantity: item.requiredQuantity || 1,
          requiredByDate: item.requiredByDate || pr.requiredByDate || '',
          prId: pr.id,
          prNumber: pr.prNumber,
          projectId: pr.projectId || pr.jobId || 'PRJ-2026-0001',
          customerName: pr.customerName,
          requisitionDate: pr.requisitionDate,
          priority: pr.priority || 'Medium',
          status: pr.status || 'Submitted',
          requestedBy: pr.requestedBy,
          department: pr.department,
          parentPR: pr,
        });
      });
    });
    return list;
  }, [purchaseRequisitions]);

  // Determine items to show in the modal (only selected line item if opened from item view)
  const displayedModalItems = useMemo(() => {
    if (!viewPR) return [];
    if (selectedLineItem) {
      const filtered = (viewPR.items || []).filter(
        (item, idx) =>
          (item.id && item.id === selectedLineItem.id) ||
          (item.itemCode && item.itemCode === selectedLineItem.itemCode) ||
          `${viewPR.id}-item-${idx}` === selectedLineItem.id ||
          (item.itemName === selectedLineItem.itemName && item.specification === selectedLineItem.specification)
      );
      if (filtered.length > 0) return filtered;
      return [
        {
          id: selectedLineItem.id,
          itemCode: selectedLineItem.itemCode,
          itemName: selectedLineItem.itemName,
          specification: selectedLineItem.specification,
          category: selectedLineItem.category,
          unitOfMeasure: selectedLineItem.unitOfMeasure,
          requiredQuantity: selectedLineItem.requiredQuantity,
          estimatedUnitPrice: 0,
          estimatedTotalPrice: 0,
        },
      ];
    }
    return viewPR.items || [];
  }, [viewPR, selectedLineItem]);

  const handleAddItemRow = () => {
    setItemsList((prev) => [
      ...prev,
      {
        itemCode: '',
        itemName: '',
        specification: '',
        category: 'Raw Material',
        unitOfMeasure: 'Kg',
        requiredQuantity: 100,
        requiredByDate: newRequiredDate,
      },
    ]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setItemsList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: keyof PRItem, val: any) => {
    setItemsList((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemsList.length === 0) {
      toast.warning('Please add at least one line item.');
      return;
    }

    const selectedProj = projects.find(
      (p) => p.projectNumber === newProjectId || p.id === newProjectId
    );
    const selectedJob = projectJobs.find(
      (j) => j.id === newProjectId || j.jobNumber === newProjectId
    );
    const projCode =
      selectedProj?.projectNumber ||
      selectedProj?.id ||
      selectedJob?.projectId ||
      newProjectId ||
      'PRJ-2026-0001';

    const validItems: PRItem[] = itemsList.map((item, idx) => ({
      id: `PR-ITEM-${Date.now()}-${idx}`,
      prId: '',
      itemCode: item.itemCode || `ITM-${idx + 1}`,
      itemName: item.itemName || 'Specified Material',
      specification: item.specification || '',
      category: item.category || 'Raw Material',
      unitOfMeasure: item.unitOfMeasure || 'Kg',
      requiredQuantity: Number(item.requiredQuantity) || 1,
      estimatedUnitPrice: 0,
      estimatedTotalPrice: 0,
      requiredByDate: item.requiredByDate || newRequiredDate,
      status: 'Pending',
    }));

    addPurchaseRequisition({
      prNumber: `PR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      projectId: projCode,
      jobId: projCode,
      jobNumber: projCode,
      customerName: selectedProj?.customerName || selectedJob?.customerName || 'Client Project',
      requisitionDate: new Date().toISOString().split('T')[0],
      requiredByDate: newRequiredDate,
      requestedBy: currentUser
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : 'Fabrication Head',
      department: 'Purchase & Stores',
      priority: newPriority,
      status: 'Submitted',
      items: validItems,
      totalItems: validItems.length,
      estimatedCost: 0,
      remarks: newRemarks,
    });

    setShowCreateModal(false);
  };

  // 1. Columns for ITEM-WISE LIST (Default View)
  const itemColumns: ERPColumn<RequisitionLineItemRow>[] = [
    {
      key: 'seqNo',
      header: '#',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-[#70665F]">
          #{row.seqNo}
        </span>
      ),
    },
    {
      key: 'itemName',
      header: 'ITEM NAME & SPECIFICATION',
      cell: (row) => (
        <div>
          <span className="font-bold text-xs text-[#1E293B] block">{row.itemName}</span>
          {row.specification && (
            <span className="text-[11px] text-[#64748B] block">{row.specification}</span>
          )}
        </div>
      ),
    },
    {
      key: 'itemCode',
      header: 'ITEM CODE',
      cell: (row) => (
        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-mono text-xs font-bold">
          {row.itemCode}
        </span>
      ),
    },
    {
      key: 'projectId',
      header: 'PROJECT REFERENCE',
      cell: (row) => (
        <div>
          <span className="font-bold font-mono text-xs text-crm-brand-700 block">
            {row.projectId}
          </span>
          <span className="text-[11px] text-[#64748B] block truncate max-w-[160px]">
            {row.customerName || 'Engineering Project'}
          </span>
        </div>
      ),
    },
    {
      key: 'requiredQuantity',
      header: 'REQUIRED QTY',
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full inline-block">
          {row.requiredQuantity} {row.unitOfMeasure}
        </span>
      ),
    },
    {
      key: 'prNumber',
      header: 'PR NUMBER',
      isCodeLink: true,
      onCodeClick: (row) => handleViewItem(row),
      cell: (row) => (
        <button
          type="button"
          onClick={() => handleViewItem(row)}
          className="text-[#2563EB] hover:text-[#1D4ED8] underline font-bold font-mono text-xs cursor-pointer text-left"
        >
          {row.prNumber}
        </button>
      ),
    },
    {
      key: 'requisitionDate',
      header: 'REQ DATE',
      cell: (row) => (
        <div className="text-xs font-mono text-[#475569]">
          <div>{formatDate(row.requisitionDate)}</div>
          {row.requiredByDate && (
            <div className="text-[10px] text-[#94A3B8]">Need: {formatDate(row.requiredByDate)}</div>
          )}
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'PRIORITY',
      cell: (row) => {
        const p = (row.priority || 'medium').toLowerCase();
        const colors: Record<string, string> = {
          urgent: 'bg-rose-100 text-rose-800 border-rose-200',
          high: 'bg-amber-100 text-amber-800 border-amber-200',
          medium: 'bg-blue-100 text-blue-800 border-blue-200',
          low: 'bg-slate-100 text-slate-800 border-slate-200',
        };
        return (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize ${
              colors[p] || colors.medium
            }`}
          >
            {row.priority}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: (row) => {
        const s = (row.status || '').toLowerCase();
        if (s === 'approved') {
          return (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Approved
            </span>
          );
        }
        if (s.includes('rfq')) {
          return (
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
              Converted to RFQ
            </span>
          );
        }
        return (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            {row.status || 'Submitted'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'ACTION',
      cell: (row) => (
        <button
          type="button"
          onClick={() => handleViewItem(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-[#E2E8F0] text-[#1E293B] hover:bg-[#F8FAFC] transition shadow-2xs cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-purple-600" />
          <span>View Details</span>
        </button>
      ),
    },
  ];

  // 2. Columns for DOSSIER-WISE LIST (Grouped View)
  const dossierColumns: ERPColumn<PurchaseRequisition>[] = [
    {
      key: 'prNumber',
      header: 'PR NUMBER',
      isCodeLink: true,
      onCodeClick: (pr) => handleViewPR(pr),
      cell: (pr) => (
        <button
          type="button"
          onClick={() => handleViewPR(pr)}
          className="text-[#2563EB] hover:text-[#1D4ED8] underline font-bold font-mono text-xs cursor-pointer text-left"
        >
          {pr.prNumber}
        </button>
      ),
    },
    {
      key: 'project',
      header: 'PROJECT REFERENCE',
      cell: (pr) => (
        <div>
          <span className="font-bold font-mono text-[#1E293B] block">{pr.projectId || pr.jobId}</span>
          <span className="text-[11px] text-[#64748B]">{pr.customerName || 'Engineering Project'}</span>
        </div>
      ),
    },
    {
      key: 'requisitionDate',
      header: 'REQ DATE',
      cell: (pr) => (
        <span className="font-mono text-[#475569] text-xs">
          {formatDate(pr.requisitionDate)}
        </span>
      ),
    },
    {
      key: 'priority',
      header: 'PRIORITY',
      cell: (pr) => {
        const p = (pr.priority || 'medium').toLowerCase();
        const colors: Record<string, string> = {
          urgent: 'bg-rose-100 text-rose-800 border-rose-200',
          high: 'bg-amber-100 text-amber-800 border-amber-200',
          medium: 'bg-blue-100 text-blue-800 border-blue-200',
          low: 'bg-slate-100 text-slate-800 border-slate-200',
        };
        return (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize ${
              colors[p] || colors.medium
            }`}
          >
            {pr.priority}
          </span>
        );
      },
    },
    {
      key: 'requestedBy',
      header: 'REQUESTED BY',
      cell: (pr) => (
        <div>
          <span className="text-[#334155] font-semibold block">{pr.requestedBy}</span>
          <span className="text-[10px] text-[#64748B]">{pr.department}</span>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'ITEMS COUNT',
      cell: (pr) => (
        <span className="font-mono font-bold text-[#475569] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs">
          {pr.totalItems || pr.items?.length || 0} Items
        </span>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: (pr) => {
        const s = (pr.status || '').toLowerCase();
        if (s === 'approved') {
          return (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Approved
            </span>
          );
        }
        if (s.includes('rfq')) {
          return (
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
              Converted to RFQ
            </span>
          );
        }
        return (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            {pr.status || 'Submitted'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col space-y-4">
      {/* 1. VIEW MODE SWITCHER TABS & ACTION */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#EBE3DB] shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('items')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'items'
                ? 'bg-crm-brand-700 text-white shadow-xs'
                : 'bg-[#FAF7F2] text-[#70665F] hover:text-[#211B17] hover:bg-[#F3ECE4] border border-[#EBE3DB]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Requisition Items (Item-Wise)</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                viewMode === 'items' ? 'bg-white/20 text-white' : 'bg-[#E5DCD3] text-[#211B17]'
              }`}
            >
              {allRequisitionItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('dossiers')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'dossiers'
                ? 'bg-crm-brand-700 text-white shadow-xs'
                : 'bg-[#FAF7F2] text-[#70665F] hover:text-[#211B17] hover:bg-[#F3ECE4] border border-[#EBE3DB]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Requisition Dossiers (PR-Wise)</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                viewMode === 'dossiers' ? 'bg-white/20 text-white' : 'bg-[#E5DCD3] text-[#211B17]'
              }`}
            >
              {purchaseRequisitions.length}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Create Requisition</span>
        </button>
      </div>

      {/* 2. MAIN TABLE RENDERING */}
      {viewMode === 'items' ? (
        <ERPListPageLayout<RequisitionLineItemRow>
          breadcrumbs={['DASHBOARD', 'PROCUREMENT', 'REQUISITION ITEMS']}
          data={allRequisitionItems}
          columns={itemColumns}
          searchPlaceholder="Search Item Name, Code, Project Reference or PR #..."
          onAddNew={() => setShowCreateModal(true)}
          addNewLabel="Create Purchase Requisition"
          onView={(row) => handleViewItem(row)}
          isLoading={isInitialLoading}
          defaultPageSize={50}
          pageSizeOptions={[10, 25, 50, 100]}
          getRowKey={(row, i) => row.id || `${row.prNumber}-${i}`}
        />
      ) : (
        <ERPListPageLayout<PurchaseRequisition>
          breadcrumbs={['DASHBOARD', 'PROCUREMENT', 'PURCHASE REQUISITION']}
          data={purchaseRequisitions}
          columns={dossierColumns}
          searchPlaceholder="Search PR #, project reference or requester..."
          onAddNew={() => setShowCreateModal(true)}
          addNewLabel="Create Purchase Requisition"
          onView={(pr) => handleViewPR(pr)}
          isLoading={isInitialLoading}
          defaultPageSize={50}
          pageSizeOptions={[10, 25, 50, 100]}
          getRowKey={(pr, i) => pr.id || pr.prNumber || i}
        />
      )}

      {/* 3. VIEW PR DOSSIER MODAL */}
      {viewPR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl max-w-3xl w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#7C3AED] uppercase">
                  {selectedLineItem ? 'Item Requisition Details' : 'Requisition Dossier'}
                </span>
                <h3 className="text-base font-bold text-[#1E293B]">
                  {viewPR.prNumber} {selectedLineItem ? `• ${selectedLineItem.itemName}` : ''}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-[#94A3B8] hover:text-[#1E293B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#F8FAFC] rounded-xl text-xs">
              <div>
                <span className="text-[#64748B] block text-[10.5px]">Project Reference:</span>
                <span className="font-bold font-mono text-[#1E293B]">{viewPR.projectId || viewPR.jobId}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10.5px]">Requisition Date:</span>
                <span className="font-semibold text-[#1E293B]">{formatDate(viewPR.requisitionDate)}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10.5px]">Required By:</span>
                <span className="font-semibold text-[#1E293B]">{formatDate(viewPR.requiredByDate)}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10.5px]">Requested By:</span>
                <span className="font-semibold text-[#1E293B]">{viewPR.requestedBy}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-[#1E293B] uppercase">
                  {selectedLineItem ? 'Selected Requisition Item' : 'Requisitioned Line Items'}
                </h4>
                {selectedLineItem && (
                  <button
                    type="button"
                    onClick={() => setSelectedLineItem(null)}
                    className="text-[11px] font-semibold text-[#7C3AED] hover:underline cursor-pointer"
                  >
                    View All PR Items ({viewPR.items?.length || 0})
                  </button>
                )}
              </div>
              <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-[#64748B] uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2 px-3">Item Code</th>
                      <th className="py-2 px-3">Item Name & Spec</th>
                      <th className="py-2 px-3 text-right">Required Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {displayedModalItems.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#7C3AED]">{item.itemCode}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-[#1E293B] block">{item.itemName}</span>
                          <span className="text-[10.5px] text-[#64748B]">{item.specification}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                          {item.requiredQuantity} {item.unitOfMeasure}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                {viewPR.status === 'Submitted' && (
                  <button
                    type="button"
                    onClick={() => {
                      approvePurchaseRequisition(
                        viewPR.id,
                        `${currentUser?.firstName || 'Admin'} ${currentUser?.lastName || ''}`
                      );
                      setViewPR({ ...viewPR, status: 'Approved' });
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition"
                  >
                    Approve PR & Release to RFQ
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-xs font-semibold bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. CREATE MANUAL PR MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="text-sm font-bold text-[#1E293B] uppercase">Create Manual Purchase Requisition</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-[#94A3B8] hover:text-[#1E293B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <ERPFormSection number="1." title="Requisition Header" defaultExpanded={true}>
                <ERPFormGrid>
                  <ERPSelect
                    label="Project Reference *"
                    required
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    options={
                      projects.length > 0
                        ? projects.map((p) => ({
                            label: `${p.projectNumber || p.id} - ${p.projectName} (${p.customerName || 'Client'})`,
                            value: p.projectNumber || p.id,
                          }))
                        : projectJobs.map((j) => ({
                            label: `${j.jobNumber} - ${j.productName}`,
                            value: j.jobNumber || j.id,
                          }))
                    }
                  />

                  <ERPSelect
                    label="Priority Level"
                    required
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    options={[
                      { label: 'High Priority', value: 'High' },
                      { label: 'Urgent / Critical', value: 'Urgent' },
                      { label: 'Medium Regular', value: 'Medium' },
                      { label: 'Low', value: 'Low' },
                    ]}
                  />

                  <ERPInput
                    label="Required By Date"
                    type="date"
                    required
                    value={newRequiredDate}
                    onChange={(e) => setNewRequiredDate(e.target.value)}
                  />

                  <ERPInput
                    label="Internal Remarks"
                    value={newRemarks}
                    onChange={(e) => setNewRemarks(e.target.value)}
                    placeholder="e.g. Urgent requisition for site delivery"
                  />
                </ERPFormGrid>
              </ERPFormSection>

              <ERPFormSection
                number="2."
                title={`Line Items (${itemsList.length})`}
                defaultExpanded={true}
                badge={
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#7C3AED] hover:text-[#6D28D9] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Material Item
                  </button>
                }
              >
                <div className="space-y-3">
                  {itemsList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#475569]">Item #{idx + 1}</span>
                        {itemsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <ERPInput
                          label="Item Name"
                          required
                          value={item.itemName || ''}
                          onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                          placeholder="Material Name"
                        />
                        <ERPInput
                          label="Specification"
                          value={item.specification || ''}
                          onChange={(e) => handleItemChange(idx, 'specification', e.target.value)}
                          placeholder="Grade / Dimensions"
                        />
                        <ERPInput
                          label="Quantity"
                          type="number"
                          required
                          value={item.requiredQuantity || ''}
                          onChange={(e) => handleItemChange(idx, 'requiredQuantity', Number(e.target.value))}
                        />
                        <ERPInput
                          label="Unit of Measure"
                          value={item.unitOfMeasure || 'NOS'}
                          onChange={(e) => handleItemChange(idx, 'unitOfMeasure', e.target.value)}
                          placeholder="e.g. NOS, KG, MTR"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ERPFormSection>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg transition shadow-xs cursor-pointer"
                >
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
