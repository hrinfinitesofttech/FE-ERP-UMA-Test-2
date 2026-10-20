'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import { ERPListPageLayout, ERPColumn } from '../../../components/ui/ERPListPageLayout';
import { FollowUp } from '../../../types/crm';
import { formatDate } from '../../../lib/utils';
import {
  PhoneCall,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  Plus,
  X,
  AlertCircle,
  Calendar,
  ExternalLink,
  Send,
  Building,
  Filter,
  Search,
  Phone,
  FileCheck2,
  ClipboardList,
  User,
  Pencil,
  CalendarDays,
  List,
} from 'lucide-react';
import { ERPCalendarView, CalendarEventItem } from '../../../components/ui/ERPCalendarView';
import { ERPDatePicker } from '../../../components/ui/ERPDatePicker';

export default function FollowUpsPage() {
  const router = useRouter();
  const {
    followUps,
    completeFollowUp,
    addFollowUp,
    customers,
    leads,
    enquiries,
    quotations,
    employees,
    availableEmployees,
  } = useERP();

  const [viewType, setViewType] = useState<'list' | 'calendar'>('list');
  const [viewFilter, setViewFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('today');
  const [entityFilter, setEntityFilter] = useState<'all' | 'lead' | 'enquiry' | 'quotation' | 'customer'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [completeModalId, setCompleteModalId] = useState<string | null>(null);

  // Completion modal form state
  const [completionNotes, setCompletionNotes] = useState('');
  const [outcome, setOutcome] = useState('connected');
  const todayStr = new Date().toISOString().split('T')[0];
  const [scheduleNext, setScheduleNext] = useState(true);
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [completeError, setCompleteError] = useState('');

  // Counts
  const todayCount = followUps.filter((f) => f.date === todayStr && f.status === 'pending').length;
  const overdueCount = followUps.filter((f) => f.date < todayStr && f.status === 'pending').length;
  const upcomingCount = followUps.filter((f) => f.date > todayStr && f.status === 'pending').length;
  const completedCount = followUps.filter((f) => f.status === 'completed').length;
  const allCount = followUps.length;

  // Add Follow-up form state
  const allStaff = availableEmployees && availableEmployees.length > 0 ? availableEmployees : employees || [];
  const [targetType, setTargetType] = useState<'lead' | 'enquiry' | 'quotation' | 'customer'>('lead');
  const [targetId, setTargetId] = useState(leads[0]?.id || '');
  const [followUpType, setFollowUpType] = useState<'call' | 'whatsapp' | 'email' | 'meeting' | 'visit'>('call');
  const [scheduledDate, setScheduledDate] = useState(todayStr);
  const [scheduledTime, setScheduledTime] = useState('11:00');
  const [purpose, setPurpose] = useState('');
  const [productItem, setProductItem] = useState('');
  const [interestStatus, setInterestStatus] = useState<'interested' | 'not_interested' | 'in_discussion'>('interested');
  const [notes, setNotes] = useState('');
  const [addNextFollowUpDate, setAddNextFollowUpDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [assignedToId, setAssignedToId] = useState(allStaff[0]?.id || 'EMP-001');
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  // Helper to sync product/item from enquiry when selecting entity
  const handleEntitySelection = (type: 'lead' | 'enquiry' | 'quotation' | 'customer', id: string) => {
    setTargetType(type);
    setTargetId(id);

    if (type === 'enquiry') {
      const enq = enquiries.find((e) => e.id === id || e.enquiryNo === id);
      if (enq) {
        setProductItem(enq.machineProduct || '');
        setPurpose(`Inquiry follow-up for ${enq.machineProduct}`);
      }
    } else if (type === 'lead') {
      const lead = leads.find((l) => l.id === id || l.leadNo === id);
      const enq = enquiries.find((e) => e.leadId === id || (lead && e.customerName === lead.companyName));
      if (enq) {
        setProductItem(enq.machineProduct || '');
      } else if (lead?.productName || lead?.machineType) {
        const prod = lead.productName || lead.machineType || '';
        setProductItem(prod);
        setPurpose(`Discussion regarding ${prod}`);
      } else if (lead) {
        setPurpose(`Discussion with ${lead.contactPerson || lead.companyName}`);
      }
    }
  };

  // Preset next date helper
  const setQuickNextDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setNextFollowUpDate(d.toISOString().split('T')[0]);
  };

  // Helper to resolve entity mobile for WhatsApp click-to-chat
  const getEntityMobile = (f: FollowUp): string => {
    if (f.entityType === 'lead' || (!f.entityType && f.leadOrCustomerId?.startsWith('LEAD'))) {
      const l = leads.find((x) => x.id === f.leadOrCustomerId || x.leadNo === f.leadOrCustomerId);
      if (l) return l.whatsapp || l.mobile || '';
    }
    if (f.entityType === 'customer' || (!f.entityType && f.leadOrCustomerId?.startsWith('CUST'))) {
      const c = customers.find((x) => x.id === f.leadOrCustomerId || x.customerCode === f.leadOrCustomerId);
      if (c) return c.whatsapp || c.mobile || '';
    }
    if (f.entityType === 'enquiry' || f.enquiryId) {
      const e = enquiries.find((x) => x.id === f.enquiryId || x.enquiryNo === f.enquiryId || x.id === f.leadOrCustomerId);
      if (e) return e.contactMobile || '';
    }
    if (f.entityType === 'quotation' || f.quotationId) {
      const q = quotations.find((x) => x.id === f.quotationId || x.quotationNumber === f.quotationId || x.id === f.leadOrCustomerId);
      if (q) return q.contactMobile || '';
    }
    return '';
  };

  // Helper to resolve link URL for the entity
  const getEntityLink = (f: FollowUp): string | null => {
    if (f.entityType === 'lead') {
      const l = leads.find((x) => x.id === f.leadOrCustomerId || x.leadNo === f.leadOrCustomerId);
      return l ? `/crm/leads/${encodeURIComponent(l.id)}` : `/crm/leads`;
    }
    if (f.entityType === 'enquiry' || f.enquiryId) {
      return `/crm/enquiries`;
    }
    if (f.entityType === 'quotation' || f.quotationId) {
      const q = quotations.find((x) => x.id === f.quotationId || x.id === f.leadOrCustomerId);
      return q ? `/crm/quotations/${q.id}` : `/crm/quotations`;
    }
    if (f.entityType === 'customer') {
      return `/crm/customers`;
    }
    return null;
  };

  const filteredFollowUps = useMemo(() => {
    return followUps.filter((f) => {
      // 1. Status / Date View filter
      if (viewFilter === 'today' && (f.date !== todayStr || f.status !== 'pending')) return false;
      if (viewFilter === 'upcoming' && (f.date <= todayStr || f.status !== 'pending')) return false;
      if (viewFilter === 'overdue' && (f.date >= todayStr || f.status !== 'pending')) return false;
      if (viewFilter === 'completed' && f.status !== 'completed') return false;

      // 2. Entity Filter
      if (entityFilter !== 'all') {
        const ent = f.entityType || 'lead';
        if (ent !== entityFilter) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNo = (f.followUpNo || f.id || '').toLowerCase().includes(q);
        const matchesName = (f.leadOrCustomerName || '').toLowerCase().includes(q);
        const matchesPurpose = (f.purpose || '').toLowerCase().includes(q);
        const matchesAssign = (f.assignedToName || '').toLowerCase().includes(q);
        if (!matchesNo && !matchesName && !matchesPurpose && !matchesAssign) return false;
      }

      return true;
    });
  }, [followUps, viewFilter, entityFilter, searchQuery, todayStr]);

  const followUpCalendarEvents: CalendarEventItem[] = useMemo(() => {
    return followUps.map((f) => {
      const isCompleted = f.status === 'completed';
      const isOverdue = !isCompleted && f.date < todayStr;
      const isToday = !isCompleted && f.date === todayStr;

      const badgeColor = isCompleted
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
        : isOverdue
        ? 'bg-rose-50 text-rose-800 border-rose-200'
        : isToday
        ? 'bg-amber-50 text-amber-900 border-amber-200'
        : 'bg-blue-50 text-blue-800 border-blue-200';

      const dotColor = isCompleted
        ? 'bg-emerald-500'
        : isOverdue
        ? 'bg-rose-500'
        : isToday
        ? 'bg-amber-500'
        : 'bg-blue-500';

      const typeLabel = (f.type || 'call').toUpperCase();

      return {
        id: f.id,
        title: `${typeLabel}: ${f.leadOrCustomerName || 'Client'}`,
        date: f.date || '',
        time: f.time,
        category: f.type || 'call',
        badgeColor,
        dotColor,
        description: f.purpose || (f as any).discussionSummary || `Follow-up with ${f.leadOrCustomerName}`,
        location: (f as any).location,
        person: f.assignedToName,
        status: isCompleted ? 'Completed' : isOverdue ? 'Overdue' : isToday ? 'Due Today' : 'Scheduled',
        raw: f,
      };
    });
  }, [followUps, todayStr]);

  const handleComplete = (id: string) => {
    if (!completionNotes.trim()) {
      setCompleteError('Discussion outcome / summary is required.');
      return;
    }
    if (scheduleNext && nextFollowUpDate && nextFollowUpDate < todayStr) {
      setCompleteError('Next follow-up date cannot be in the past.');
      return;
    }

    const currentF = followUps.find((f) => f.id === id);
    completeFollowUp(id, completionNotes.trim(), scheduleNext ? nextFollowUpDate : undefined);

    // If next follow-up requested, also schedule it explicitly if needed
    if (scheduleNext && currentF) {
      const assignedStaff = allStaff.find((s) => s.id === currentF.assignedToId);
      const assignedName = assignedStaff
        ? assignedStaff.name || `${assignedStaff.firstName || ''} ${assignedStaff.lastName || ''}`.trim()
        : currentF.assignedToName;

      addFollowUp({
        leadOrCustomerId: currentF.leadOrCustomerId,
        leadOrCustomerName: currentF.leadOrCustomerName,
        entityType: currentF.entityType || 'lead',
        enquiryId: currentF.enquiryId,
        quotationId: currentF.quotationId,
        type: currentF.type,
        assignedToId: currentF.assignedToId,
        assignedToName: assignedName,
        date: nextFollowUpDate,
        time: '11:00 AM',
        priority: currentF.priority || 'medium',
        purpose: `Follow-up after ${outcome.replace('_', ' ')}: ${completionNotes.trim().slice(0, 50)}...`,
        notes: `Previous outcome: ${outcome}. Notes: ${completionNotes.trim()}`,
        status: 'pending',
      });
    }

    setCompleteModalId(null);
    setCompletionNotes('');
    setCompleteError('');
  };

  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!purpose.trim()) {
      errs.purpose = 'Discussion purpose is required.';
    }

    if (!scheduledDate) {
      errs.scheduledDate = 'Scheduled date is required.';
    } else if (scheduledDate < todayStr) {
      errs.scheduledDate = 'Follow-up date cannot be in the past.';
    }

    if (Object.keys(errs).length > 0) {
      setAddErrors(errs);
      return;
    }

    let targetName = 'Client';
    let customerId: string | undefined;
    let leadId: string | undefined;
    let enquiryId: string | undefined;
    let quotationId: string | undefined;

    if (targetType === 'lead') {
      const selectedLead = leads.find((l) => l.id === targetId) || leads[0];
      targetName = selectedLead ? `${selectedLead.companyName} (${selectedLead.contactPerson})` : 'New Lead';
      leadId = selectedLead?.id;
    } else if (targetType === 'enquiry') {
      const selectedEnq = enquiries.find((en) => en.id === targetId) || enquiries[0];
      targetName = selectedEnq ? `${selectedEnq.customerName} - ${selectedEnq.enquiryNo || selectedEnq.machineProduct}` : 'Technical Inquiry';
      enquiryId = selectedEnq?.id;
    } else if (targetType === 'quotation') {
      const selectedQuot = quotations.find((q) => q.id === targetId) || quotations[0];
      targetName = selectedQuot ? `${selectedQuot.customerName} (${selectedQuot.quotationNumber})` : 'Formal Quotation';
      quotationId = selectedQuot?.id;
    } else {
      const selectedCust = customers.find((c) => c.id === targetId) || customers[0];
      targetName = selectedCust ? `${selectedCust.companyName} (${selectedCust.contactPerson})` : 'Customer';
      customerId = selectedCust?.id;
    }

    const assignedStaff = allStaff.find((s) => s.id === assignedToId);
    const assignedName = assignedStaff
      ? assignedStaff.name || `${assignedStaff.firstName || ''} ${assignedStaff.lastName || ''}`.trim()
      : 'Sales Team';

    const entityRecordId = (targetType === 'lead' ? leadId : targetType === 'enquiry' ? enquiryId : targetType === 'quotation' ? quotationId : customerId) || 'ID-001';

    let timeDisplay = scheduledTime || '11:00 AM';
    if (scheduledTime && scheduledTime.includes(':')) {
      const [h, m] = scheduledTime.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      timeDisplay = `${hour12}:${m} ${ampm}`;
    }

    const newFollowUpItem: FollowUp = {
      id: `FU-${Date.now()}`,
      followUpNo: `FLW-2026-${Math.floor(100 + Math.random() * 900)}`,
      leadOrCustomerId: entityRecordId,
      leadOrCustomerName: targetName,
      entityType: targetType,
      enquiryId,
      quotationId,
      type: followUpType,
      assignedToId,
      assignedToName: assignedName,
      date: scheduledDate,
      time: timeDisplay,
      priority: 'medium',
      purpose: purpose.trim(),
      notes: notes.trim(),
      interestStatus,
      productItem: productItem.trim() || undefined,
      nextFollowUpDate: addNextFollowUpDate || undefined,
      status: 'pending',
    };

    addFollowUp(newFollowUpItem);
    setShowAddModal(false);
    setPurpose('');
    setProductItem('');
    setNotes('');
    setAddErrors({});
  };

  const handleExportCSV = () => {
    const csv = [
      'Follow-up #,Account/Entity,Type,Channel,Date,Time,Purpose,Remarks,Assigned Engineer,Status,Outcome',
      ...filteredFollowUps.map((f) => {
        return `"${f.followUpNo || f.id}","${f.leadOrCustomerName || ''}","${f.entityType || 'lead'}","${f.type}","${f.date}","${f.time}","${f.purpose || ''}","${f.notes || ''}","${f.assignedToName || ''}","${f.status}","${f.outcome || ''}"`;
      }),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FollowUps_Register_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const columns: ERPColumn<FollowUp>[] = [
    {
      key: 'followUpNo',
      header: 'FOLLOW-UP #',
      isCodeLink: true,
      onCodeClick: (f) => {
        if (f.status === 'pending') {
          setCompleteModalId(f.id);
          setCompletionNotes('');
          setOutcome('connected');
          setCompleteError('');
        }
      },
      cell: (f) => (
        <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-xs whitespace-nowrap inline-block">
          {f.followUpNo || f.id}
        </span>
      ),
    },
    {
      key: 'leadOrCustomerName',
      header: 'LINKED ACCOUNT / ENTITY',
      cell: (f) => {
        const link = getEntityLink(f);
        const badgeColor =
          f.entityType === 'quotation'
            ? 'bg-purple-100 text-purple-800 border-purple-200'
            : f.entityType === 'enquiry'
            ? 'bg-amber-100 text-amber-800 border-amber-200'
            : f.entityType === 'customer'
            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
            : 'bg-blue-100 text-blue-800 border-blue-200';

        return (
          <div className="space-y-0.5 min-w-[180px]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] uppercase font-bold border ${badgeColor}`}>
                {f.entityType || 'lead'}
              </span>
              {link ? (
                <Link
                  href={link}
                  className="font-bold text-slate-800 hover:text-purple-700 flex items-center gap-1 text-xs"
                >
                  <span className="truncate max-w-[150px]">{f.leadOrCustomerName}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              ) : (
                <span className="font-bold text-slate-800 text-xs truncate max-w-[150px]">{f.leadOrCustomerName}</span>
              )}
            </div>
            {f.quotationId && (
              <span className="text-[10px] text-purple-700 font-mono block">Linked Quote: {f.quotationId}</span>
            )}
            {f.enquiryId && (
              <span className="text-[10px] text-amber-700 font-mono block">Linked RFQ: {f.enquiryId}</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'CHANNEL',
      cell: (f) => (
        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
          {f.type}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'SCHEDULED DATE & TIME',
      cell: (f) => (
        <div className="font-mono text-xs whitespace-nowrap">
          <span className="font-semibold block text-slate-800">{formatDate(f.date)}</span>
          <span className="text-[10px] text-slate-500">{f.time}</span>
        </div>
      ),
    },
    {
      key: 'purpose',
      header: 'PURPOSE, ITEM & REMARKS',
      cell: (f) => (
        <div className="max-w-xs space-y-1">
          <span className="font-semibold text-slate-800 block truncate text-xs">{f.purpose}</span>
          {f.productItem && (
            <span className="inline-block px-1.5 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[9px] font-bold">
              Item: {f.productItem}
            </span>
          )}
          {f.notes && (
            <span className="text-[10px] text-slate-500 block truncate">{f.notes}</span>
          )}
          {f.nextFollowUpDate && (
            <div className="text-[10px] text-purple-700 font-mono flex items-center gap-1 font-semibold">
              <Calendar className="w-3 h-3 text-purple-600" />
              <span>Next: {formatDate(f.nextFollowUpDate)}</span>
            </div>
          )}
          {f.outcome && (
            <span className="mt-0.5 inline-block px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold">
              Outcome: {f.outcome.replace('_', ' ')}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'assignedToName',
      header: 'ASSIGNED ENGINEER',
      cell: (f) => <span className="font-medium text-slate-700 text-xs whitespace-nowrap">{f.assignedToName}</span>,
    },
    {
      key: 'status',
      header: 'STATUS & INTEREST',
      cell: (f) => (
        <div className="space-y-1 whitespace-nowrap">
          <span
            className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase inline-block ${
              f.status === 'completed'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : f.date < todayStr
                ? 'bg-rose-100 text-rose-800 border border-rose-200 font-bold'
                : 'bg-amber-100 text-amber-800 border border-amber-200 font-bold'
            }`}
          >
            {f.status === 'pending' && f.date < todayStr ? 'Overdue' : f.status}
          </span>
          {f.interestStatus && (
            <div>
              <span
                className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold uppercase inline-block border ${
                  f.interestStatus === 'interested'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : f.interestStatus === 'not_interested'
                    ? 'bg-slate-100 text-slate-600 border-slate-300'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {f.interestStatus === 'interested'
                  ? 'Interested'
                  : f.interestStatus === 'not_interested'
                  ? 'Not Interested'
                  : 'In Discussion'}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      cell: (f) => {
        const mobile = getEntityMobile(f);
        const cleanMobile = mobile.replace(/\D/g, '');

        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {cleanMobile && (
              <a
                href={`https://wa.me/91${cleanMobile.slice(-10)}?text=${encodeURIComponent(
                  `Hello from UMA Techno Fab Pvt. Ltd. Regarding your requirement: "${f.purpose}". How can we assist you today?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                title={`Chat with customer on WhatsApp (+91 ${cleanMobile.slice(-10)})`}
                className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Edit / Add Discussion Button */}
            <button
              onClick={() => router.push(`/crm/follow-ups/new?id=${encodeURIComponent(f.id)}&step=2`)}
              title="Edit / Add Discussion Notes"
              className="p-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            {f.status === 'pending' ? (
              <button
                onClick={() => {
                  setCompleteModalId(f.id);
                  setCompletionNotes('');
                  setOutcome('connected');
                  setCompleteError('');
                }}
                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Done</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-500 font-mono">Completed</span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Date / Status & Entity Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-xs">
        {/* Date / Status Views */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setViewFilter('today')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition text-xs cursor-pointer ${
              viewFilter === 'today' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Today</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${viewFilter === 'today' ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-900'}`}>
              {todayCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewFilter('upcoming')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition text-xs cursor-pointer ${
              viewFilter === 'upcoming' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Upcoming</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${viewFilter === 'upcoming' ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-900'}`}>
              {upcomingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition text-xs cursor-pointer ${
              viewFilter === 'overdue' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Overdue</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${viewFilter === 'overdue' ? 'bg-white/25 text-white' : 'bg-rose-100 text-rose-900'}`}>
              {overdueCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewFilter('completed')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition text-xs cursor-pointer ${
              viewFilter === 'completed' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Completed</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${viewFilter === 'completed' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-900'}`}>
              {completedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition text-xs cursor-pointer ${
              viewFilter === 'all' ? 'bg-[#7C3AED] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>All Records</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${viewFilter === 'all' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-900'}`}>
              {allCount}
            </span>
          </button>
        </div>

        {/* View Switcher & Entity Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Entity Type Filter Bar */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5">Target:</span>
            {(['all', 'lead', 'enquiry', 'quotation', 'customer'] as const).map((ent) => (
              <button
                key={ent}
                type="button"
                onClick={() => setEntityFilter(ent)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold capitalize transition cursor-pointer ${
                  entityFilter === ent ? 'bg-white text-[#7C3AED] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {ent === 'all' ? 'All' : ent}
              </button>
            ))}
          </div>

          {/* List vs Calendar Toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-100">
            <button
              type="button"
              onClick={() => setViewType('list')}
              className={`p-1.5 rounded-md transition cursor-pointer ${viewType === 'list' ? 'bg-white text-[#7C3AED] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewType('calendar')}
              className={`p-1.5 rounded-md transition cursor-pointer ${viewType === 'calendar' ? 'bg-white text-[#7C3AED] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              title="Interactive Calendar View"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewType === 'calendar' ? (
        <ERPCalendarView
          events={followUpCalendarEvents}
          title="CRM Follow-Up & Communication Calendar"
          subtitle="Interactive schedule of customer calls, site meetings, WhatsApp follow-ups, and quotation reviews."
          onAddEvent={() => router.push('/crm/follow-ups/new')}
          onSelectEvent={(ev) => {
            if (ev.raw) {
              setCompleteModalId(ev.raw.id);
              setCompletionNotes('');
              setOutcome('connected');
              setCompleteError('');
            }
          }}
          addEventLabel="+ Schedule Follow-up"
          categories={[
            { key: 'call', label: 'Phone Call', color: 'bg-amber-500' },
            { key: 'whatsapp', label: 'WhatsApp', color: 'bg-emerald-500' },
            { key: 'meeting', label: 'Meeting', color: 'bg-blue-500' },
            { key: 'visit', label: 'Site Visit', color: 'bg-purple-500' },
            { key: 'email', label: 'Email', color: 'bg-sky-500' },
          ]}
        />
      ) : (
        <ERPListPageLayout<FollowUp>
          breadcrumbs={['DASHBOARD', 'CRM & SALES', 'FOLLOW-UPS']}
          columns={columns}
          data={filteredFollowUps}
          addNewLabel="+ Schedule Follow-up"
          onAddNew={() => router.push('/crm/follow-ups/new')}
          onExport={() => {
          const csv = [
            ['Follow-up No', 'Entity Type', 'Target', 'Assigned To', 'Due Date', 'Status', 'Outcome', 'Notes'].join(','),
            ...filteredFollowUps.map(f => [
              f.followUpNo || f.id,
              f.entityType,
              `"${(f.leadOrCustomerName || '').replace(/"/g, '""')}"`,
              `"${(f.assignedToName || '').replace(/"/g, '""')}"`,
              f.date || '',
              f.status || '',
              f.outcome || '',
              `"${(f.notes || '').replace(/"/g, '""')}"`
            ].join(','))
          ].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `crm_follow_ups_${new Date().toISOString().slice(0, 10)}.csv`;
          a.click();
        }}
        searchPlaceholder="Search follow-ups, clients, assignee, notes..."
      />
      )}

      {/* COMPLETION & LOG INTERACTION MODAL */}
      {completeModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Log Interaction & Complete Follow-up
              </h3>
              <button onClick={() => setCompleteModalId(null)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {completeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{completeError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Interaction Outcome *</label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-xs font-semibold"
                >
                  <option value="connected">Connected & Discussed</option>
                  <option value="callback_requested">Callback Requested</option>
                  <option value="busy">Client Busy / Try Later</option>
                  <option value="no_response">No Response / Unreachable</option>
                  <option value="interested">High Interest / Quote Requested</option>
                  <option value="negotiation">Commercial Negotiation Ongoing</option>
                  <option value="not_interested">Not Interested / Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Discussion Summary / Customer Response *</label>
                <textarea
                  rows={3}
                  required
                  value={completionNotes}
                  onChange={(e) => {
                    setCompletionNotes(e.target.value);
                    if (completeError) setCompleteError('');
                  }}
                  placeholder="Customer agreed on delivery timeline, requested revised commercial terms..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 border-t border-[#EBE3DB] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 font-semibold text-[#544B45] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleNext}
                      onChange={(e) => setScheduleNext(e.target.checked)}
                      className="rounded text-crm-brand-700"
                    />
                    <span>Schedule Next Follow-up</span>
                  </label>
                  {scheduleNext && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setQuickNextDate(2)}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[#544B45] text-[10px] font-bold"
                      >
                        +2 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickNextDate(7)}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[#544B45] text-[10px] font-bold"
                      >
                        +7 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickNextDate(15)}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[#544B45] text-[10px] font-bold"
                      >
                        +15 Days
                      </button>
                    </div>
                  )}
                </div>

                {scheduleNext && (
                  <div>
                    <label className="block text-[#70665F] text-[11px] mb-1">Next Follow-up Due Date</label>
                    <ERPDatePicker
                      minDate={todayStr}
                      value={nextFollowUpDate}
                      onChange={(val) => {
                        setNextFollowUpDate(val);
                        if (completeError) setCompleteError('');
                      }}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompleteModalId(null)}
                  className="px-4 py-2 border rounded-lg font-semibold text-[#544B45]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleComplete(completeModalId)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Save & Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
