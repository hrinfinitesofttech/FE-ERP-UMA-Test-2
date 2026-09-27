'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useERP } from '../../context/ERPContext';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  FileSpreadsheet,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils'; // Included just in case

export default function LoginPage() {
  const router = useRouter();
  const { login } = useERP();
  const [username, setUsername] = useState('rajesh.admin');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const success = login(username, password);
      if (success) {
        router.push('/');
      } else {
        setError('Invalid credentials or inactive account. Choose a quick test account below.');
        setLoading(false);
      }
    }, 350);
  };

  const handleQuickSelect = (u: string) => {
    setUsername(u);
    setPassword('admin123');
  };

  return (
    <div className="w-full flex flex-col p-4 py-8 sm:p-6 lg:p-10 relative overflow-x-hidden overflow-y-auto bg-[#FAF7F2]">
      {/* Dynamic Ambient Background Glows - Warm light theme */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#F1DFC9]/40 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#E7DED5]/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 opacity-30 pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(#d5cac0 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      {/* Main Container Card: Split-Screen Architecture */}
      <div className="my-auto mx-auto relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden border border-[#E7DED5] bg-white shadow-2xl shadow-[#75401F]/5 grid grid-cols-1 lg:grid-cols-12 lg:min-h-[620px]">
        
        {/* LEFT COLUMN: Industrial Brand & Capabilities Showcase */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-12 flex flex-col justify-between bg-gradient-to-br from-[#FAF3EA] via-[#F8EDE0] to-[#EFE8DE] border-b lg:border-b-0 lg:border-r border-[#E7DED5] relative">
          
          <div className="absolute inset-0 opacity-20 pointer-events-none"
               style={{ backgroundImage: 'linear-gradient(to right, #e7ded5 1px, transparent 1px), linear-gradient(to bottom, #e7ded5 1px, transparent 1px)', backgroundSize: '32px 32px' }}
          />

          {/* Top Lockup */}
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E7DED5] flex items-center justify-center text-[#211B17] font-black text-2xl shadow-sm">
                U
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-black tracking-wider text-[#211B17]">UMA TECHNO FAB</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FAF0E6] text-[#9C6538] border border-[#E7DED5] text-[10px] font-mono font-bold uppercase mt-1 sm:mt-0">
                    MTO ERP
                  </span>
                </div>
                <p className="text-xs text-[#70665F] font-medium">Make-to-Order Manufacturing</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#211B17] tracking-tight leading-snug">
                Precision Manufacturing <br />
                <span className="text-[#9C6538]">
                  Enterprise System
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-[#6F6156] leading-relaxed max-w-md">
                End-to-end CRM, Multi-Revision Engg Quotations, PO processing, & 360° Traceability.
              </p>
            </div>

            {/* Value Proposition Showcase Cards */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/60 border border-[#E7DED5] shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center text-[#0369A1] flex-shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#211B17]">360° MTO Job Traceability</h4>
                  <p className="text-[11px] text-[#70665F]">Real-time status Lead → PO → Job.</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/60 border border-[#E7DED5] shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#B45309] flex-shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#211B17]">Multi-Revision Quotes</h4>
                  <p className="text-[11px] text-[#70665F]">Complete version history & BOM pricing.</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/60 border border-[#E7DED5] shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-[#E0F5EB] border border-[#A7F3D0] flex items-center justify-center text-[#169B62] flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#211B17]">Granular Role-Based Logic</h4>
                  <p className="text-[11px] text-[#70665F]">Strict privilege separation & logging.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Security Note */}
          <div className="relative z-10 pt-6 mt-6 border-t border-[#E7DED5] flex items-center justify-between text-[11px] text-[#8D827A] flex-wrap gap-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-[#169B62]" /> 256-Bit Encrypted Session
            </span>
            <span className="font-mono">v1.0.0 Enterprise</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Authentication & Persona Switcher */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Header */}
            <div className="space-y-1 mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9C6538] font-mono flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Secure Workspace
              </span>
              <h2 className="text-2xl font-black text-[#211B17] tracking-tight">Sign In to ERP</h2>
              <p className="text-xs text-[#70665F]">Enter employee credentials or select a test role.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 bg-[#FCE8E8] border border-[#F8B4B4] rounded-2xl text-[#D9383A] text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#211B17] mb-1.5">
                  Username or Employee Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8D827A]" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. rajesh.admin"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E7DED5] rounded-xl text-xs text-[#211B17] placeholder:text-[#8D827A] focus:outline-none focus:ring-2 focus:ring-[#9C6538]/20 focus:border-[#75401F] transition shadow-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#211B17]">Password</label>
                  <a href="/forgot-password" className="text-[#9C6538] hover:text-[#75401F] hover:underline text-[11px] font-bold transition">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8D827A]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E7DED5] rounded-xl text-xs text-[#211B17] placeholder:text-[#8D827A] focus:outline-none focus:ring-2 focus:ring-[#9C6538]/20 focus:border-[#75401F] transition shadow-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#70665F] font-medium text-xs select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#E7DED5] text-[#9C6538] focus:ring-[#9C6538] w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Remember my session</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#211B17] hover:bg-[#3E2723] text-white rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-[#211B17]/20 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick RBAC Persona Switcher */}
          <div className="pt-6 mt-6 border-t border-[#E7DED5] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8D827A] font-mono whitespace-nowrap">
                ⚡ Quick Personas
              </span>
              <span className="text-[10px] text-[#169B62] font-bold whitespace-nowrap">Auto-fills roles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Persona 1: Super Admin */}
              <button
                type="button"
                onClick={() => handleQuickSelect('rajesh.admin')}
                className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer w-full ${
                  username === 'rajesh.admin'
                    ? 'bg-[#FAF0E6] border-[#D5CAC0] ring-1 ring-[#D5CAC0]'
                    : 'bg-white border-[#E7DED5] hover:bg-[#FAF7F2] hover:border-[#D5CAC0]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#FDE68A]/50 border border-[#FDE68A] text-[#B45309] font-bold text-xs flex items-center justify-center flex-shrink-0 font-mono">
                  RP
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-[#211B17] text-xs block truncate">Rajesh Patel</span>
                  <span className="text-[9px] font-mono text-[#B45309] font-bold block uppercase truncate">Super Admin</span>
                </div>
              </button>

              {/* Persona 2: CRM Manager */}
              <button
                type="button"
                onClick={() => handleQuickSelect('pravin.crm')}
                className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer w-full ${
                  username === 'pravin.crm'
                    ? 'bg-[#FAF0E6] border-[#D5CAC0] ring-1 ring-[#D5CAC0]'
                    : 'bg-white border-[#E7DED5] hover:bg-[#FAF7F2] hover:border-[#D5CAC0]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] font-bold text-xs flex items-center justify-center flex-shrink-0 font-mono">
                  PP
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-[#211B17] text-xs block truncate">Pravin Patel</span>
                  <span className="text-[9px] font-mono text-[#0369A1] font-bold block uppercase truncate">CRM Manager</span>
                </div>
              </button>

              {/* Persona 3: Admin Family */}
              <button
                type="button"
                onClick={() => handleQuickSelect('ketan.admin')}
                className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer w-full ${
                  username === 'ketan.admin'
                    ? 'bg-[#FAF0E6] border-[#D5CAC0] ring-1 ring-[#D5CAC0]'
                    : 'bg-white border-[#E7DED5] hover:bg-[#FAF7F2] hover:border-[#D5CAC0]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#F3E8FF] border border-[#E9D5FF] text-[#7E22CE] font-bold text-xs flex items-center justify-center flex-shrink-0 font-mono">
                  KP
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-[#211B17] text-xs block truncate">Ketan Patel</span>
                  <span className="text-[9px] font-mono text-[#7E22CE] font-bold block uppercase truncate">Admin (Family)</span>
                </div>
              </button>

              {/* Persona 4: Sales Engineer */}
              <button
                type="button"
                onClick={() => handleQuickSelect('amit.sales')}
                className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer w-full ${
                  username === 'amit.sales'
                    ? 'bg-[#FAF0E6] border-[#D5CAC0] ring-1 ring-[#D5CAC0]'
                    : 'bg-white border-[#E7DED5] hover:bg-[#FAF7F2] hover:border-[#D5CAC0]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] font-bold text-xs flex items-center justify-center flex-shrink-0 font-mono">
                  AS
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-[#211B17] text-xs block truncate">Amit Sharma</span>
                  <span className="text-[9px] font-mono text-[#15803D] font-bold block uppercase truncate">Sales Engineer</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
