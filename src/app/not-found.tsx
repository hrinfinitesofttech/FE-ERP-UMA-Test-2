import Link from 'next/link';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="bg-[color:var(--crm-bg-app)] text-[color:var(--crm-text-primary)] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center mb-4 shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black text-[color:var(--crm-text-primary)] tracking-tight">404 - Page Not Found</h1>
      <p className="text-sm text-[color:var(--crm-text-secondary)] max-w-md mt-2">
        The requested page could not be located on the Uma Techno Fab ERP system.
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[color:var(--crm-text-primary)] hover:bg-[#171B25] text-white font-bold text-xs shadow-md shadow-[#0F172A]/20 transition"
        >
          <Home className="w-4 h-4" />
          Executive Command Center
        </Link>
        <Link
          href="/designer/jobs"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-[color:var(--crm-surface-subtle)] text-[color:var(--crm-brand-700)] font-bold text-xs border border-[color:var(--crm-border-default)] transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Designer Portal
        </Link>
      </div>
    </div>
  );
}
