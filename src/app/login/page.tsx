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
  KeyRound,
} from 'lucide-react';
import { cn } from '../../lib/utils';

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
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 py-8 sm:p-6 lg:p-10 relative overflow-x-hidden overflow-y-auto bg-[#FAF7F2]">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#F1DFC9]/40 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#E7DED5]/40 rounded-full blur-[140px] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#d5cac0 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      {/* Main Container Card: Split-Screen Enterprise Architecture */}
      <div className="relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden border border-[#E7DED5] bg-white shadow-2xl shadow-[#75401F]/5 grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* LEFT COLUMN: Industrial Brand & Capabilities Showcase */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-12 flex flex-col justify-between bg-gradient-to-br from-[#FAF3EA] via-[#F8EDE0] to-[#EFE8DE] border-b lg:border-b-0 lg:border-r border-[#E7DED5] relative">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #e7ded5 1px, transparent 1px), linear-gradient(to bottom, #e7ded5 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* Top Brand Lockup */}
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E7DED5] flex items-center justify-center text-[#211B17] font-black text-2xl shadow-sm">
                U
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-black tracking-wider text-[#211B17]">UMA TECHNO FAB</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FAF0E6] text-[#9C6538] border border-[#E7DED5] text-[10px] font-mono font-bold uppercase">
                    MTO ERP
                  </span>
                </div>
                <p className="text-xs text-[#70665F] font-medium">Make-to-Order Manufacturing ERP</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#211B17] tracking-tight leading-snug">
                Precision Manufacturing <br />
                <span className="text-[#9C6538]">Enterprise Workspace</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#6F6156] leading-relaxed max-w-md">
                End-to-end CRM pipeline, engineering BOM quotations, shop floor tracking, inventory, & 360° traceability.
              </p>
            </div>

            {/* Value Proposition Showcase Cards */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/70 border border-[#E7DED5] shadow-xs backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center text-[#0369A1] shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#211B17]">360° MTO Job Traceability</h4>
                  <p className="text-[11px] text-[#70665F]">Real-time operational tracking from Enquiry to Dispatch.</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/70 border border-[#E7DED5] shadow-xs backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#B45309] shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#211B17]">Multi-Revision Costing & BOM</h4>
                  <p className="text-[11px] text-[#70665F]">Version-controlled engineering drawings and itemized estimates.</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/70 border border-[#E7DED5] shadow-xs backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-[#E0F5EB] border border-[#A7F3D0] flex items-center justify-center text-[#169B62] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#211B17]">Strict Role-Based Authorization</h4>
                  <p className="text-[11px] text-[#70665F]">Granular 9-core department scoping & immutable audit logs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Security Note */}
          <div className="relative z-10 pt-6 mt-6 border-t border-[#E7DED5] flex items-center justify-between text-[11px] text-[#8D827A] flex-wrap gap-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-[#169B62]" /> 256-Bit TLS Encrypted Gateway
            </span>
            <span className="font-mono">v2.4.0 Enterprise</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Enterprise Authentication Portal */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Header */}
            <div className="space-y-1 mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9C6538] font-mono flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Secure Workspace
              </span>
              <h2 className="text-2xl font-black text-[#211B17] tracking-tight">Sign In to ERP</h2>
              <p className="text-xs text-[#70665F]">
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

            {/* Quick One-Click Credentials */}
            <div className="mb-5 p-3 rounded-2xl bg-[#FAF0E6]/80 border border-[#E7DED5] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#75401F]">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" /> Quick Test Accounts
                </span>
                <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded-full border border-[#E7DED5] text-[#9C6538]">
                  Pass: Admin@123456
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setUsername('durgesh.jadav');
                    setPassword('Admin@123456');
                    setError('');
                  }}
                  className="text-left px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#E7DED5] text-[11px] transition shadow-2xs cursor-pointer group"
                >
                  <p className="font-bold text-[#211B17] group-hover:text-[#9C6538] leading-tight">Durgesh Jadav</p>
                  <p className="text-[10px] text-[#70665F] truncate">MD & Super Admin</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUsername('hardik.daki');
                    setPassword('Admin@123456');
                    setError('');
                  }}
                  className="text-left px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#E7DED5] text-[11px] transition shadow-2xs cursor-pointer group"
                >
                  <p className="font-bold text-[#211B17] group-hover:text-[#9C6538] leading-tight">Hardik Daki</p>
                  <p className="text-[10px] text-[#70665F] truncate">Super Admin</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUsername('admin');
                    setPassword('Admin@123456');
                    setError('');
                  }}
                  className="text-left px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#E7DED5] text-[11px] transition shadow-2xs cursor-pointer group"
                >
                  <p className="font-bold text-[#211B17] group-hover:text-[#9C6538] leading-tight">System Admin</p>
                  <p className="text-[10px] text-[#70665F] truncate">Full Access</p>
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#211B17] mb-1.5">
                  Username, Corporate Email, or Employee ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8D827A]" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. hardik.daki or admin@umatechnofab.com"
                    required
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E7DED5] rounded-xl text-xs text-[#211B17] placeholder:text-[#8D827A] focus:outline-none focus:ring-2 focus:ring-[#9C6538]/20 focus:border-[#75401F] transition shadow-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#211B17]">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-[#9C6538] hover:text-[#75401F] hover:underline text-[11px] font-bold transition"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8D827A]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your secure password"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#FAF7F2] border border-[#E7DED5] rounded-xl text-xs text-[#211B17] placeholder:text-[#8D827A] focus:outline-none focus:ring-2 focus:ring-[#9C6538]/20 focus:border-[#75401F] transition shadow-xs font-mono"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D827A] hover:text-[#211B17] p-1 cursor-pointer transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-[#9C6538]" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                  <span>Remember this terminal session</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#211B17] hover:bg-[#3E2723] text-white rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-[#211B17]/20 disabled:opacity-50 active:scale-[0.99] cursor-pointer mt-2"
              >
                <span>{loading ? 'Authenticating Credentials...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Corporate IT Support Footer */}
          <div className="pt-6 mt-6 border-t border-[#E7DED5] text-[11px] text-[#70665F] space-y-2">
            <div className="flex items-center gap-2 text-[#544B45] font-semibold">
              <Building2 className="w-3.5 h-3.5 text-[#9C6538]" />
              <span>UMA Techno Fab Private Limited</span>
            </div>
            <p className="text-[10px] text-[#8D827A] leading-relaxed">
              Makarpura Industrial Estate, Vadodara, Gujarat. Authorized personnel only. Unauthorized access attempts are monitored and logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
