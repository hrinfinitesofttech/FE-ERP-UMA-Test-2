'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { CompanyLogo } from '@/components/common/CompanyLogo';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithBackend, isAuthenticated, isAuthReady } = useERP();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If user is already authenticated, redirect straight to workspace/dashboard
  useEffect(() => {
    if (isAuthReady && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthReady, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setError('Please enter your username, email, or employee ID.');
      return;
    }

    if (!cleanPass) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      // Direct Backend Authentication with JWT issuance
      const res = await loginWithBackend(cleanUser, cleanPass);
      if (res.success) {
        router.push('/');
        return;
      }

      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      setError('Invalid username or password. Please verify your credentials.');
      setLoading(false);
    } catch (err: any) {
      console.warn('Backend login attempt encountered error:', err);
      const msg = err?.data?.error || err?.message || 'Authentication service error. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 py-8 sm:p-6 lg:p-10 relative overflow-x-hidden overflow-y-auto bg-[color:var(--crm-bg-app)]">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#E3EAF8]/40 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#E2E7EF]/40 rounded-full blur-[140px] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#CBD3E0 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      {/* Main Container Card: Split-Screen Enterprise Architecture */}
      <div className="relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden border border-[color:var(--crm-border-default)] bg-white shadow-2xl shadow-[#1F3FB0]/5 grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* LEFT COLUMN: Industrial Brand & Capabilities Showcase */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-12 flex flex-col justify-between bg-gradient-to-br from-[color:var(--crm-brand-50)] via-[#EDF1FA] to-[#DFE4EE] border-b lg:border-b-0 lg:border-r border-[color:var(--crm-border-default)] relative">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #E2E7EF 1px, transparent 1px), linear-gradient(to bottom, #E2E7EF 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* Top Brand Lockup */}
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <CompanyLogo size="lg" variant="badge" className="p-2 bg-white shadow-md border border-[color:var(--crm-border-default)] rounded-2xl" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-black tracking-wider text-[#1F3FB0]">UMA TECHNO FAB</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F1F4FA] text-[#F37A20] border border-[color:var(--crm-border-default)] text-[10px] font-mono font-bold uppercase">
                    MTO ERP
                  </span>
                </div>
                <p className="text-xs text-[color:var(--crm-text-secondary)] font-medium">Precision Make-to-Order Manufacturing</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[color:var(--crm-text-primary)] tracking-tight leading-snug">
                Precision Manufacturing <br />
                <span className="text-[color:var(--crm-brand-600)]">Enterprise Workspace</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#4D5A78] leading-relaxed max-w-md">
                End-to-end CRM pipeline, engineering BOM quotations, shop floor tracking, inventory, & 360° traceability.
              </p>
            </div>

            {/* Value Proposition Showcase Cards */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/70 border border-[color:var(--crm-border-default)] shadow-xs backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center text-[#0369A1] shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[color:var(--crm-text-primary)]">360° MTO Job Traceability</h4>
                  <p className="text-[11px] text-[color:var(--crm-text-secondary)]">Real-time operational tracking from Enquiry to Dispatch.</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/70 border border-[color:var(--crm-border-default)] shadow-xs backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#B45309] shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[color:var(--crm-text-primary)]">Multi-Revision Costing & BOM</h4>
                  <p className="text-[11px] text-[color:var(--crm-text-secondary)]">Version-controlled engineering drawings and itemized estimates.</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/70 border border-[color:var(--crm-border-default)] shadow-xs backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-[#E0F5EB] border border-[#A7F3D0] flex items-center justify-center text-[#169B62] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[color:var(--crm-text-primary)]">Strict Role-Based Authorization</h4>
                  <p className="text-[11px] text-[color:var(--crm-text-secondary)]">Granular 9-core department scoping & immutable audit logs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Security Note */}
          <div className="relative z-10 pt-6 mt-6 border-t border-[color:var(--crm-border-default)] flex items-center justify-between text-[11px] text-[color:var(--crm-text-tertiary)] flex-wrap gap-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-[#169B62]" /> 256-Bit TLS Encrypted Gateway
            </span>
            <span className="font-mono">v2.4.0 Enterprise</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Enterprise Authentication Portal */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Mobile Brand Header */}
            <div className="lg:hidden flex items-center gap-3 mb-6 pb-4 border-b border-[color:var(--crm-border-default)]">
              <CompanyLogo size="md" variant="badge" className="p-1.5 bg-[color:var(--crm-bg-app)]" />
              <div className="leading-tight">
                <h3 className="font-extrabold text-[#1F3FB0] text-xs">UMA TECHNO FAB</h3>
                <p className="text-[10px] text-[#F37A20] font-semibold">Manufacturing ERP</p>
              </div>
            </div>

            {/* Header */}
            <div className="space-y-1 mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--crm-brand-600)] font-mono flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Secure Workspace
              </span>
              <h2 className="text-2xl font-black text-[color:var(--crm-text-primary)] tracking-tight">Sign In to ERP</h2>
              <p className="text-xs text-[color:var(--crm-text-secondary)]">
                Enter your authorized employee username, corporate email, or employee ID.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 bg-[#FCE8E8] border border-[#F8B4B4] rounded-2xl text-[#D9383A] text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[color:var(--crm-text-primary)] mb-1.5">
                  Username, Corporate Email, or Employee ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--crm-text-tertiary)]" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. hardik.daki or admin@umatechnofab.com"
                    required
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-2.5 bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl text-xs text-[color:var(--crm-text-primary)] placeholder:text-[color:var(--crm-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#2A4FD6]/20 focus:border-[color:var(--crm-brand-700)] transition shadow-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[color:var(--crm-text-primary)]">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-[color:var(--crm-brand-600)] hover:text-[color:var(--crm-brand-700)] hover:underline text-[11px] font-bold transition"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--crm-text-tertiary)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your secure password"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 bg-[color:var(--crm-bg-app)] border border-[color:var(--crm-border-default)] rounded-xl text-xs text-[color:var(--crm-text-primary)] placeholder:text-[color:var(--crm-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#2A4FD6]/20 focus:border-[color:var(--crm-brand-700)] transition shadow-xs font-mono"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--crm-text-tertiary)] hover:text-[color:var(--crm-text-primary)] p-1 cursor-pointer transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-[color:var(--crm-brand-600)]" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[color:var(--crm-text-secondary)] font-medium text-xs select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[color:var(--crm-border-default)] text-[color:var(--crm-brand-600)] focus:ring-[color:var(--crm-brand-600)] w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Remember this terminal session</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[color:var(--crm-text-primary)] hover:bg-[color:var(--crm-text-primary)] text-white rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-[#0F172A]/20 disabled:opacity-50 active:scale-[0.99] cursor-pointer mt-2"
              >
                <span>{loading ? 'Authenticating Credentials...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Corporate IT Support Footer */}
          <div className="pt-6 mt-6 border-t border-[color:var(--crm-border-default)] text-[11px] text-[color:var(--crm-text-secondary)] space-y-2">
            <div className="flex items-center gap-2 text-[color:var(--crm-text-secondary)] font-semibold">
              <Building2 className="w-3.5 h-3.5 text-[color:var(--crm-brand-600)]" />
              <span>UMA Techno Fab Private Limited</span>
            </div>
            <p className="text-[10px] text-[color:var(--crm-text-tertiary)] leading-relaxed">
              Makarpura Industrial Estate, Vadodara, Gujarat. Authorized personnel only. Unauthorized access attempts are monitored and logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
