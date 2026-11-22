'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '../../context/ERPContext';
import {
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Workflow,
  Boxes,
  Factory,
  Users2,
  Receipt,
  ScanSearch,
} from 'lucide-react';
import { CompanyLogo } from '@/components/common/CompanyLogo';

const MODULES = [
  { icon: Workflow, label: 'CRM & Sales' },
  { icon: ScanSearch, label: 'Design & BOM' },
  { icon: Boxes, label: 'Purchase & Store' },
  { icon: Factory, label: 'Production' },
  { icon: Users2, label: 'HR & Attendance' },
  { icon: Receipt, label: 'Accounting' },
];

/** Line-art pressure vessel on a blueprint grid — pure SVG, no assets. */
function VesselIllustration() {
  return (
    <svg
      viewBox="0 0 420 260"
      className="w-full h-auto max-w-[420px]"
      fill="none"
      role="img"
      aria-label="Pressure vessel technical drawing"
    >
      <defs>
        <linearGradient id="vesselFill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3B68F0" stopOpacity="0.05" />
          <stop offset="0.5" stopColor="#93B4FD" stopOpacity="0.22" />
          <stop offset="1" stopColor="#3B68F0" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* centre line */}
      <line x1="30" y1="130" x2="390" y2="130" stroke="#93B4FD" strokeOpacity="0.35" strokeDasharray="10 4 2 4" />
      {/* shell */}
      <path
        d="M95 80 H325 A38 50 0 0 1 325 180 H95 A38 50 0 0 1 95 80 Z"
        fill="url(#vesselFill)"
        stroke="#DBE6FE"
        strokeWidth="1.6"
      />
      {/* weld seams */}
      <line x1="150" y1="80" x2="150" y2="180" stroke="#F37A20" strokeWidth="1.6" strokeDasharray="3 3" />
      <line x1="270" y1="80" x2="270" y2="180" stroke="#F37A20" strokeWidth="1.6" strokeDasharray="3 3" />
      {/* nozzles */}
      <rect x="196" y="56" width="28" height="24" stroke="#DBE6FE" strokeWidth="1.4" />
      <line x1="190" y1="56" x2="230" y2="56" stroke="#DBE6FE" strokeWidth="1.8" />
      <rect x="330" y="104" width="46" height="22" stroke="#DBE6FE" strokeWidth="1.4" transform="rotate(0)" />
      {/* saddles */}
      <path d="M120 180 V208 H170 V183" stroke="#DBE6FE" strokeWidth="1.4" />
      <path d="M255 183 V208 H305 V180" stroke="#DBE6FE" strokeWidth="1.4" />
      <line x1="100" y1="208" x2="190" y2="208" stroke="#DBE6FE" strokeWidth="1.8" />
      <line x1="235" y1="208" x2="325" y2="208" stroke="#DBE6FE" strokeWidth="1.8" />
      {/* dimension line */}
      <line x1="57" y1="228" x2="363" y2="228" stroke="#93B4FD" strokeOpacity="0.6" />
      <line x1="57" y1="222" x2="57" y2="234" stroke="#93B4FD" strokeOpacity="0.6" />
      <line x1="363" y1="222" x2="363" y2="234" stroke="#93B4FD" strokeOpacity="0.6" />
      <text x="210" y="246" textAnchor="middle" fill="#93B4FD" fontSize="10" fontFamily="monospace" opacity="0.8">
        MAKE-TO-ORDER · FABRICATED IN VADODARA
      </text>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { loginWithBackend, isAuthenticated, isAuthReady } = useERP();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already signed in → straight to dashboard
  useEffect(() => {
    if (isAuthReady && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthReady, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
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
      const res = await loginWithBackend(cleanUser, cleanPass);
      if (res.success) {
        router.push('/');
        return;
      }
      setError(res.error || 'Invalid username or password. Please verify your credentials.');
      setLoading(false);
    } catch (err: any) {
      console.warn('Backend login attempt encountered error:', err);
      setError(err?.data?.error || err?.message || 'Authentication service error. Please try again.');
      setLoading(false);
    }
  };

  const inputBase =
    'w-full h-12 pl-11 bg-white border border-[color:var(--crm-border-strong)] rounded-xl text-sm text-[color:var(--crm-text-primary)] placeholder:text-[color:var(--crm-text-tertiary)] outline-none transition focus:border-[color:var(--crm-brand-600)] focus:ring-4 focus:ring-[color:var(--crm-brand-600)]/15 disabled:opacity-60';

  return (
    <div className="w-full min-h-screen overflow-y-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] bg-[color:var(--crm-bg-app)]">
      {/* ───────── BRAND PANEL ───────── */}
      <aside className="relative overflow-hidden text-white bg-[#0B1533] px-6 py-8 sm:px-10 lg:px-14 lg:py-12 flex flex-col justify-between">
        {/* blueprint grid */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #93B4FD 1px, transparent 1px), linear-gradient(to bottom, #93B4FD 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at 30% 40%, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 30% 40%, black 30%, transparent 75%)',
          }}
        />
        <div aria-hidden className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-[#2A4FD6]/30 blur-[120px]" />
        <div aria-hidden className="absolute -bottom-40 -right-24 w-[420px] h-[420px] rounded-full bg-[#F37A20]/15 blur-[130px]" />

        {/* top: logo */}
        <div className="relative z-10 flex items-center gap-3">
          <CompanyLogo size="md" variant="badge" className="!rounded-xl !p-1.5 bg-white shadow-lg" />
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-[0.14em]">UMA TECHNO FAB</div>
            <div className="text-[11px] font-medium text-[#93B4FD]">Manufacturing ERP</div>
          </div>
        </div>

        {/* middle: headline + illustration (desktop only) */}
        <div className="relative z-10 hidden lg:flex flex-col gap-8 my-10">
          <div className="space-y-4 max-w-md">
            <span className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-[#F37A20]">
              <span className="w-6 h-px bg-[#F37A20]" /> Enquiry → Dispatch
            </span>
            <h1 className="text-4xl xl:text-[44px] font-extrabold leading-[1.1] tracking-tight">
              Every job, every weld,
              <br />
              <span className="text-[#93B4FD]">one connected workspace.</span>
            </h1>
            <p className="text-sm leading-relaxed text-[#B8C7E8]">
              From customer enquiry and BOM costing to shop-floor tracking, stores and invoicing — with full 360° job traceability.
            </p>
          </div>
          <VesselIllustration />
        </div>

        {/* bottom: modules */}
        <div className="relative z-10 hidden lg:block">
          <ul className="grid grid-cols-3 gap-2.5">
            {MODULES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-[12px] font-medium text-[#DBE6FE]"
              >
                <Icon className="w-4 h-4 text-[#93B4FD] shrink-0" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* mobile: one-line tagline */}
        <p className="relative z-10 lg:hidden mt-5 text-sm text-[#B8C7E8]">
          Every job, every weld — one connected workspace.
        </p>
      </aside>

      {/* ───────── FORM PANEL ───────── */}
      <main className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h2 className="text-[28px] font-extrabold tracking-tight text-[color:var(--crm-text-primary)]">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-[color:var(--crm-text-secondary)]">
              Sign in with your employee credentials to continue.
            </p>
          </div>

          <div aria-live="assertive">
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#F8B4B4] bg-[#FCE8E8] p-3.5 text-[13px] text-[#B42323]"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
                <span className="font-medium leading-snug">{error}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="login-username" className="block mb-1.5 text-[13px] font-semibold text-[color:var(--crm-text-primary)]">
                Username, email or employee ID
              </label>
              <div className="relative">
                <User className="w-[18px] h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--crm-text-tertiary)]" aria-hidden />
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. hardik.daki"
                  autoComplete="username"
                  autoFocus
                  disabled={loading}
                  className={`${inputBase} pr-4`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-[13px] font-semibold text-[color:var(--crm-text-primary)]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[12px] font-semibold text-[color:var(--crm-brand-600)] hover:text-[color:var(--crm-brand-800)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-[18px] h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--crm-text-tertiary)]" aria-hidden />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e) => setCapsOn(e.getModifierState('CapsLock'))}
                  onBlur={() => setCapsOn(false)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className={`${inputBase} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[color:var(--crm-text-tertiary)] hover:text-[color:var(--crm-text-primary)] hover:bg-[color:var(--crm-surface-subtle)] transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
              {capsOn && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-[#B45309]">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden /> Caps Lock is on
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full h-12 rounded-xl bg-[color:var(--crm-brand-700)] hover:bg-[color:var(--crm-brand-800)] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#1F3FB0]/25 transition active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--crm-brand-600)]/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" aria-hidden /> Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-5 border-t border-[color:var(--crm-border-default)] space-y-1.5">
            <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[color:var(--crm-text-secondary)]">
              <ShieldCheck className="w-3.5 h-3.5 text-[color:var(--crm-status-success)]" aria-hidden />
              Authorized personnel only
            </p>
            <p className="text-[11px] leading-relaxed text-[color:var(--crm-text-tertiary)]">
              UMA Techno Fab Private Limited · Makarpura Industrial Estate, Vadodara, Gujarat. Access attempts are monitored and logged.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
