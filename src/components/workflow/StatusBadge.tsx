import React from 'react';
import { cn } from '../../lib/utils';
import { JobStatus } from '../../types/erp';

interface StatusBadgeProps {
  status: JobStatus | 'completed' | 'in_progress' | 'pending' | 'delayed' | 'urgent' | 'high' | 'medium' | 'low' | 'approved' | 'rejected' | 'draft' | 'won' | 'lost' | 'new' | 'contacted' | 'converted';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
      case 'approved':
      case 'won':
      case 'converted':
        return {
          label: status === 'won' ? 'WON (ORDER BOOKED)' : status === 'converted' ? 'CONVERTED' : 'COMPLETED / APPROVED',
          bg: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]',
          dot: 'bg-[#15803D]',
        };
      case 'production':
      case 'in_progress':
        return {
          label: 'IN PRODUCTION',
          bg: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
          dot: 'bg-[#0284C7] animate-pulse',
        };
      case 'qc':
        return {
          label: 'QUALITY INSPECTION',
          bg: 'bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]',
          dot: 'bg-[#9333EA]',
        };
      case 'design':
      case 'material_planning':
        return {
          label: status === 'design' ? 'DESIGN RELEASE' : 'MATERIAL PLANNING',
          bg: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
          dot: 'bg-[#D97706]',
        };
      case 'purchase':
        return {
          label: 'PURCHASE & STORE',
          bg: 'bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA]',
          dot: 'bg-[#EA580C]',
        };
      case 'ready_for_dispatch':
      case 'dispatched':
        return {
          label: status === 'dispatched' ? 'DISPATCHED' : 'READY FOR DISPATCH',
          bg: 'bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]',
          dot: 'bg-[#0D9488]',
        };
      case 'delayed':
      case 'rejected':
      case 'lost':
        return {
          label: status === 'lost' ? 'LOST' : status === 'rejected' ? 'REJECTED' : 'DELAYED',
          bg: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]',
          dot: 'bg-[#DC2626]',
        };
      case 'urgent':
        return {
          label: 'URGENT PRIORITY',
          bg: 'bg-[#991B1B] text-[#211B17] border-[#7F1D1D] shadow-xs',
          dot: 'bg-white animate-ping',
        };
      case 'high':
        return {
          label: 'HIGH PRIORITY',
          bg: 'bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA]',
          dot: 'bg-[#EA580C]',
        };
      case 'new':
      case 'contacted':
        return {
          label: status === 'new' ? 'NEW LEAD' : 'CONTACTED',
          bg: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
          dot: 'bg-[#0284C7]',
        };
      case 'draft':
      case 'planning':
      case 'pending':
      default: {
        const raw = status ? String(status) : 'planning';
        return {
          label: raw.replace(/_/g, ' ').toUpperCase(),
          bg: 'bg-[#F3ECE4] text-[#70665F] border-[#E7DED5]',
          dot: 'bg-[#8D827A]',
        };
      }
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border uppercase tracking-wider',
        config.bg,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', config.dot)} />
      <span>{config.label}</span>
    </span>
  );
}
