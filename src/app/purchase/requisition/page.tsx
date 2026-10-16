'use client';

import React, { useState } from 'react';
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
import { formatCurrency, formatDate } from '../../../lib/utils';
import {
  Eye,
  CheckCircle2,
  AlertTriangle,
  X,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function PurchaseRequisitionPage() {
  const { purchaseRequisitions, addPurchaseRequisition, approvePurchaseRequisition, projectJobs, currentUser, isInitialLoading } = useERP();

  const [viewPR, setViewPR] = useState<PurchaseRequisition | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [approvedPrModal, setApprovedPrModal] = useState<PurchaseRequisition | null>(null);

  // Form State for Create PR Modal
  const [newJobId, setNewJobId] = useState(projectJobs[0]?.id || projectJobs[0]?.jobNumber || '');
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
      estimatedUnitPrice: 350,
      estimatedTotalPrice: 175000,
      requiredByDate: '2026-10-25',
    },
  ]);

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
        estimatedUnitPrice: 250,
        estimatedTotalPrice: 25000,
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
      if (field === 'requiredQuantity' || field === 'estimatedUnitPrice') {
        const qty = Number(updated[idx].requiredQuantity) || 0;
        const price = Number(updated[idx].estimatedUnitPrice) || 0;
        updated[idx].estimatedTotalPrice = qty * price;
      }
      return updated;
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemsList.length === 0) {
      alert('Please add at least one line item.');
      return;
    }

    const selectedJob = projectJobs.find((j) => j.id === newJobId || j.jobNumber === newJobId);
    const totalEst = itemsList.reduce((acc, itm) => acc + (itm.estimatedTotalPrice || 0), 0);

    const validItems: PRItem[] = itemsList.map((item, idx) => ({
      id: `PR-ITEM-${Date.now()}-${idx}`,
      prId: '',
      itemCode: item.itemCode || `ITM-${idx + 1}`,
      itemName: item.itemName || 'Specified Material',
      specification: item.specification || '',
      category: item.category || 'Raw Material',
      unitOfMeasure: item.unitOfMeasure || 'Kg',
      requiredQuantity: Number(item.requiredQuantity) || 1,
      estimatedUnitPrice: Number(item.estimatedUnitPrice) || 100,
      estimatedTotalPrice: Number(item.estimatedTotalPrice) || 100,
      requiredByDate: item.requiredByDate || newRequiredDate,
      status: 'Pending',
    }));

    addPurchaseRequisition({
      prNumber: `PR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      projectId: selectedJob?.projectId || selectedJob?.id || 'PROJ-UMA-2026',
      jobId: selectedJob?.jobNumber || newJobId || 'JOB-2026-01',
      requisitionDate: new Date().toISOString().split('T')[0],
      requiredByDate: newRequiredDate,
      requestedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Fabrication Head',
      department: 'Purchase & Stores',
      priority: newPriority,
      status: 'Submitted',
      items: validItems,
      totalItems: validItems.length,
      estimatedCost: totalEst,
      remarks: newRemarks,
    });

    setShowCreateModal(false);
  };

  const columns: ERPColumn<PurchaseRequisition>[] = [
    {
      key: 'prNumber',
      header: 'PR NUMBER',
      isCodeLink: true,
      onCodeClick: (pr) => setViewPR(pr),
      cell: (pr) => (
        <button
          onClick={() => setViewPR(pr)}
          className="text-[#2563EB] hover:text-[#1D4ED8] underline font-bold font-mono text-xs cursor-pointer text-left"
        >
          {pr.prNumber}
        </button>
      ),
    },
    {
      key: 'job',
      header: 'PROJECT & JOB REFERENCE',
      cell: (pr) => (
        <div>
          <span className="font-bold text-[#1E293B] block">{pr.jobId}</span>
          <span className="text-[11px] text-[#64748B]">{pr.projectId}</span>
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
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize ${colors[p] || colors.medium}`}>
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
      header: 'ITEMS',
      cell: (pr) => (
        <span className="font-mono font-bold text-[#475569]">
          {pr.totalItems || pr.items?.length || 0}
        </span>
      ),
    },
    {
      key: 'estimatedCost',
      header: 'ESTIMATED COST',
      cell: (pr) => (
        <span className="font-mono font-bold text-[#1E293B]">
          {formatCurrency(pr.estimatedCost || 0)}
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
      <ERPListPageLayout<PurchaseRequisition>
        breadcrumbs={['DASHBOARD', 'PROCUREMENT', 'PURCHASE REQUISITION']}
        data={purchaseRequisitions}
        columns={columns}
        searchPlaceholder="Search PR #, job reference or requester..."
        onAddNew={() => setShowCreateModal(true)}
        addNewLabel="Create Purchase Requisition"
        onView={(pr) => setViewPR(pr)}
        isLoading={isInitialLoading}
        defaultPageSize={50}
        pageSizeOptions={[10, 25, 50, 100]}
        getRowKey={(pr, i) => pr.id || pr.prNumber || i}
      />

      {/* VIEW PR MODAL */}
      {viewPR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl max-w-3xl w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#7C3AED] uppercase">Requisition Dossier</span>
                <h3 className="text-base font-bold text-[#1E293B]">{viewPR.prNumber}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewPR(null)}
                className="text-[#94A3B8] hover:text-[#1E293B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#F8FAFC] rounded-xl text-xs">
              <div>
                <span className="text-[#64748B] block text-[10.5px]">Job Reference:</span>
                <span className="font-bold text-[#1E293B]">{viewPR.jobId}</span>
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
              <h4 className="text-xs font-bold text-[#1E293B] uppercase mb-2">Requisitioned Line Items</h4>
              <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-[#64748B] uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2 px-3">Item Code</th>
                      <th className="py-2 px-3">Item Name & Spec</th>
                      <th className="py-2 px-3 text-right">Qty</th>
                      <th className="py-2 px-3 text-right">Est Rate</th>
                      <th className="py-2 px-3 text-right">Total Est</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {viewPR.items.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#7C3AED]">{item.itemCode}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-[#1E293B] block">{item.itemName}</span>
                          <span className="text-[10.5px] text-[#64748B]">{item.specification}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#1E293B]">
                          {item.requiredQuantity} {item.unitOfMeasure}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#64748B]">
                          ₹{item.estimatedUnitPrice}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                          ₹{item.estimatedTotalPrice?.toLocaleString('en-IN')}
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
                    onClick={() => {
                      approvePurchaseRequisition(viewPR.id, `${currentUser?.firstName || 'Admin'} ${currentUser?.lastName || ''}`);
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
                onClick={() => setViewPR(null)}
                className="px-4 py-2 text-xs font-semibold bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MANUAL PR MODAL */}
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
                    label="Project Job Reference"
                    required
                    value={newJobId}
                    onChange={(e) => setNewJobId(e.target.value)}
                    options={projectJobs.map((j) => ({
                      label: `${j.jobNumber} - ${j.productName}`,
                      value: j.id,
                    }))}
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
                title="Requisition Line Items"
                rightAction={
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Line Item</span>
                  </button>
                }
              >
                <div className="space-y-3">
                  {itemsList.map((item, idx) => (
                    <div key={idx} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#64748B]">Item #{idx + 1}</span>
                        {itemsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded"
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
                          label="Est. Rate (₹)"
                          type="number"
                          value={item.estimatedUnitPrice || ''}
                          onChange={(e) => handleItemChange(idx, 'estimatedUnitPrice', Number(e.target.value))}
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
