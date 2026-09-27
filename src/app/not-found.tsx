'use client';

import Link from 'next/link';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-[#FAF7F2] text-[#211B17] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center mb-4 shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black text-[#211B17] tracking-tight">404 - Page Not Found</h1>
      <p className="text-sm text-[#70665F] max-w-md mt-2">
        The requested page could not be located on the Uma Techno Fab ERP system.
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3E2723] hover:bg-[#2C1810] text-white font-bold text-xs shadow-md shadow-[#3E2723]/20 transition"
        >
          <Home className="w-4 h-4" />
          Executive Command Center
        </Link>
        <Link
          href="/designer/dashboard"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-[#F3ECE4] text-[#75401F] font-bold text-xs border border-[#E7DED5] transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Designer Portal
        </Link>
      </div>
    </div>
  );
}
