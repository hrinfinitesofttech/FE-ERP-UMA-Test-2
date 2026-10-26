'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import {
  ERPFormSection,
  ERPFormGrid,
  ERPInput,
  ERPSelect,
} from '../../../components/ui/ERPFormLayout';
import { SiteVisit } from '../../../types/crm';
import { formatDate } from '../../../lib/utils';
import { MapPin, X, Save, Eye, CheckCircle2 } from 'lucide-react';
import { toast } from '@/context/ToastContext';

export default function VisitsPage() {
  const router = useRouter();
  const { siteVisits, addSiteVisit, updateSiteVisit, deleteSiteVisit, leads, employees, isInitialLoading } = useERP();

  const [showModal, setShowModal] = useState(false);
  const [viewingVisit, setViewingVisit] = useState<SiteVisit | null>(null);
  const [editingVisit, setEditingVisit] = useState<SiteVisit | null>(null);

  const [leadId, setLeadId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [discussionNotes, setDiscussionNotes] = useState('');
  const [requirementDetails, setRequirementDetails] = useState('');
  const [outcome, setOutcome] = useState<SiteVisit['outcome']>('positive');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedLead = leads.find((l) => l.id === leadId);
    const emp = employees[0];

    addSiteVisit({
      leadId: leadId || undefined,
      customerId: selectedLead?.id || '',
      customerName: selectedLead?.companyName || '',
      contactPerson: selectedLead?.contactPerson || '',
      contactMobile: selectedLead?.mobile || '',
      visitDate: new Date().toISOString().split('T')[0],
      location: selectedLead?.address || selectedLead?.city || '',
      employeeId: emp?.id || '',
      employeeName: emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : '',
      purpose,
      discussionNotes,
      requirementDetails,
      outcome,
      nextAction: '',
    });

    setLeadId('');
    setPurpose('');
    setDiscussionNotes('');
    setRequirementDetails('');
    setOutcome('positive');
    setShowModal(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVisit) return;
    updateSiteVisit(editingVisit.id, { ...editingVisit });
    setEditingVisit(null);
  };

  const getOutcomeBadge = (out: SiteVisit['outcome'], status?: string) => {
    if (status === 'scheduled') {
      return (
        <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full whitespace-nowrap inline-flex items-center gap-1.5 select-none shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Scheduled Visit
        </span>
      );
    }
    switch (out) {
      case 'positive':
        return (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full whitespace-nowrap inline-flex items-center select-none">
            Positive Progress
          </span>
        );
      case 'order_expected':
        return (
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full whitespace-nowrap inline-flex items-center select-none">
            Order Expected
          </span>
        );
      case 'quotation_required':
        return (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full whitespace-nowrap inline-flex items-center select-none">
            Quotation Required
          </span>
        );
      case 'follow_up_required':
        return (
          <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full whitespace-nowrap inline-flex items-center select-none">
            Follow-Up Required
          </span>
        );
      case 'not_interested':
        return (
          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full whitespace-nowrap inline-flex items-center select-none">
            Not Interested
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap inline-flex items-center select-none">
            {out}
          </span>
        );
    }
  };

  const columns: ERPColumn<SiteVisit>[] = [
    {
      key: 'visitNo',
      header: 'VISIT #',
      isCodeLink: true,
      onCodeClick: (v) => setViewingVisit(v),
      cell: (v) => (
        <button
          onClick={() => setViewingVisit(v)}
          className="text-[#2563EB] hover:text-[#1D4ED8] underline font-bold font-mono text-xs cursor-pointer text-left whitespace-nowrap"
        >
          {v.visitNo}
        </button>
      ),
    },
    {
      key: 'customer',
      header: 'CUSTOMER & CONTACT',
      cell: (v) => (
        <div>
          <span className="font-semibold text-[#1E293B] block">{v.customerName}</span>
          <span className="text-[11px] text-[#64748B]">
            {v.contactPerson} {v.contactMobile ? `• ${v.contactMobile}` : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'dateLocation',
      header: 'VISIT DATE & LOCATION',
      cell: (v) => (
        <div>
          <span className="font-mono font-bold text-[#334155] block">{formatDate(v.visitDate)}</span>
          <span className="text-[11px] text-[#64748B]">{v.location}</span>
        </div>
      ),
    },
    {
      key: 'purpose',
      header: 'PURPOSE & OBSERVATIONS',
      cell: (v) => (
        <div className="max-w-xs">
          <span className="font-semibold text-[#334155] block truncate">{v.purpose}</span>
          <span className="text-[11px] text-[#64748B] block truncate">{v.discussionNotes}</span>
        </div>
      ),
    },
    {
      key: 'engineer',
      header: 'VISITING ENGINEER',
      cell: (v) => <span className="font-semibold text-[#334155] whitespace-nowrap">{v.employeeName}</span>,
    },
    {
      key: 'outcome',
      header: 'STATUS / OUTCOME',
      cell: (v) => (
        <div className="flex items-center gap-2 flex-wrap">
          {getOutcomeBadge(v.outcome, v.status)}
          {v.status === 'scheduled' && (
            <button
              onClick={() => router.push(`/crm/visits/new?id=${encodeURIComponent(v.id)}&step=2`)}
              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10.5px] font-bold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
              title="Fill Slide 2 Visit Report"
            >
              <span>Fill Report (Slide 2) →</span>
            </button>
          )}
        </div>
      ),
    },
    {
      key: 'nextAction',
      header: 'NEXT ACTION',
      cell: (v) => (
        <div>
          <span className="text-[11px] text-[#334155] block">{v.nextAction || 'N/A'}</span>
          {v.nextFollowUpDate && (
            <span className="text-[10px] text-[#64748B] font-mono block">
              Follow-up: {formatDate(v.nextFollowUpDate)}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-4">
      <ERPListPageLayout<SiteVisit>
        breadcrumbs={['DASHBOARD', 'CRM', 'SITE VISITS']}
        data={siteVisits}
        columns={columns}
        searchPlaceholder="Search visits by customer, location, engineer or notes..."
        onAddNew={() => router.push('/crm/visits/new')}
        addNewLabel="+ Schedule Site Visit"
        onView={(v) => setViewingVisit(v)}
        onEdit={(v) => router.push(`/crm/visits/new?id=${encodeURIComponent(v.id)}${v.status === 'scheduled' ? '&step=2' : ''}`)}
        onDelete={(v) => {
          toast.confirm({
            title: 'Delete Site Visit Report',
            message: `Are you sure you want to delete visit report "${v.visitNo}"?`,
            confirmText: 'Yes, Delete',
            cancelText: 'Cancel',
            variant: 'danger',
            onConfirm: () => {
              deleteSiteVisit(v.id);
              toast.success(`Visit report "${v.visitNo}" deleted`);
            },
          });



        }}
        isLoading={isInitialLoading}
        defaultPageSize={50}
        pageSizeOptions={[10, 25, 50, 100]}
        getRowKey={(v, i) => v.id || v.visitNo || i}
      />

      {/* VIEW DETAILS MODAL */}
      {viewingVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED]">
                  Site Visit Record
                </span>
                <h3 className="text-base font-bold text-[#1E293B]">{viewingVisit.visitNo}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingVisit(null)}
                className="text-[#94A3B8] hover:text-[#1E293B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F8FAFC] rounded-xl space-y-1">
                <span className="text-[#64748B] block text-[11px]">Customer & Contact:</span>
                <p className="font-bold text-[#1E293B] text-sm">{viewingVisit.customerName}</p>
                <p className="text-[#475569]">
                  {viewingVisit.contactPerson} • {viewingVisit.contactMobile || 'No Phone'}
                </p>
                <p className="text-[#64748B]">{viewingVisit.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 border border-[#E2E8F0] rounded-lg">
                  <span className="text-[#64748B] text-[10.5px] block">Visit Date:</span>
                  <span className="font-semibold text-[#1E293B]">{formatDate(viewingVisit.visitDate)}</span>
                </div>
                <div className="p-2.5 border border-[#E2E8F0] rounded-lg">
                  <span className="text-[#64748B] text-[10.5px] block">Engineer:</span>
                  <span className="font-semibold text-[#1E293B]">{viewingVisit.employeeName}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-[#475569] block mb-1">Purpose:</span>
                <p className="p-2.5 bg-[#F8FAFC] rounded-lg text-[#334155]">{viewingVisit.purpose}</p>
              </div>

              {viewingVisit.discussionNotes && (
                <div>
                  <span className="font-bold text-[#475569] block mb-1">Discussion Minutes:</span>
                  <p className="p-2.5 bg-[#F8FAFC] rounded-lg text-[#334155] whitespace-pre-wrap">
                    {viewingVisit.discussionNotes}
                  </p>
                </div>
              )}

              {viewingVisit.requirementDetails && (
                <div>
                  <span className="font-bold text-[#475569] block mb-1">Technical Requirement:</span>
                  <p className="p-2.5 bg-[#F8FAFC] rounded-lg text-[#334155] whitespace-pre-wrap">
                    {viewingVisit.requirementDetails}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] flex justify-between items-center gap-2">
              {viewingVisit.status === 'scheduled' ? (
                <button
                  type="button"
                  onClick={() => {
                    const id = viewingVisit.id;
                    setViewingVisit(null);
                    router.push(`/crm/visits/new?id=${encodeURIComponent(id)}&step=2`);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Fill Slide 2 Visit Report</span>
                </button>
              ) : <div />}
              <button
                type="button"
                onClick={() => setViewingVisit(null)}
                className="px-4 py-2 text-xs font-semibold bg-[#7C3AED] text-white rounded-lg shadow-xs"
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
