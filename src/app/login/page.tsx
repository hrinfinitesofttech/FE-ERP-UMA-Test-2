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
  Factory,
  ShoppingCart,
  Boxes,
  TrendingUp,
  Calculator,
} from 'lucide-react';
import { CompanyLogo } from '@/components/common/CompanyLogo';

const REMEMBER_KEY = 'uma_erp_remembered_username';

const MODULES = [
  { icon: Factory, label: 'Production' },
  { icon: ShoppingCart, label: 'Purchase' },
  { icon: Boxes, label: 'Inventory' },
  { icon: TrendingUp, label: 'Sales' },
  { icon: Calculator, label: 'Accounting' },
];

/**
 * Background: drop a factory photo at /public/login-bg.jpg and it is used automatically.
 * Until then the soft blueprint gradient below shows.
 */
const BG_IMAGE =
  "url('/login-bg.jpg'), radial-gradient(ellipse at 20% 30%, #DBE6FE 0%, #EEF3FD 45%, #F7F9FD 100%)";

/** Line-art process plant (tank, columns, conveyor) for the card header. */
function PlantIllustration() {
  const s = '#1B3489';
  return (
    <svg viewBox="0 0 440 150" className="w-full h-auto" fill="none" role="img" aria-label="Process plant illustration">
      <g stroke={s} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
        {/* ground */}
        <line x1="10" y1="138" x2="430" y2="138" strokeOpacity="0.4" />
        {/* left machine */}
        <rect x="22" y="92" width="52" height="46" rx="3" fill="#EFF4FF" />
        <rect x="30" y="100" width="18" height="14" />
        <circle cx="62" cy="108" r="6" />
        {/* tank 1 */}
        <path d="M96 138 V82 a24 10 0 0 1 48 0 V138" fill="#EFF4FF" />
        <ellipse cx="120" cy="82" rx="24" ry="8" />
        <line x1="96" y1="104" x2="144" y2="104" />
        <line x1="120" y1="62" x2="120" y2="74" />
        {/* scaffold frame */}
        <path d="M168 138 V70 M300 138 V70 M168 70 H300 M168 100 H300 M168 138 H300" />
        <path d="M168 100 L234 70 M234 100 L300 70" strokeOpacity="0.5" />
        {/* tall tank */}
        <path d="M206 70 V30 a28 11 0 0 1 56 0 V70" fill="#DBE6FE" />
        <ellipse cx="234" cy="30" rx="28" ry="9" />
        <path d="M222 30 V12 H246 V30" />
        <line x1="206" y1="50" x2="262" y2="50" />
        {/* cone hopper */}
        <path d="M206 70 H262 L248 92 H220 Z" fill="#EFF4FF" />
        {/* conveyor */}
        <path d="M300 112 L396 70" strokeWidth="6" strokeOpacity="0.18" />
        <path d="M300 106 L396 64 M300 118 L396 76" />
        {/* right machines */}
        <rect x="370" y="96" width="40" height="42" rx="3" fill="#EFF4FF" />
        <rect x="380" y="104" width="20" height="10" />
        <rect x="336" y="116" width="26" height="22" rx="2" fill="#EFF4FF" />
        {/* pipes */}
        <path d="M144 94 H168 M262 52 H282 V70" />
      </g>
      <g fill="#F37A20">
        <circle cx="234" cy="30" r="2.4" />
        <circle cx="120" cy="82" r="2.4" />
      </g>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { loginWithBackend, isAuthenticated, isAuthReady } = useERP();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Restore remembered username (username only — never the password)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setUsername(saved);
        setRememberMe(true);
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

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
        try {
          if (rememberMe) localStorage.setItem(REMEMBER_KEY, cleanUser);
          else localStorage.removeItem(REMEMBER_KEY);
        } catch {
          /* ignore */
        }
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
    'w-full h-[52px] pl-12 bg-white border border-[#D5DCEA] rounded-xl text-[15px] text-[color:var(--crm-text-primary)] placeholder:text-[#8A96AD] outline-none transition focus:border-[color:var(--crm-brand-600)] focus:ring-4 focus:ring-[color:var(--crm-brand-600)]/15 disabled:opacity-60';

  return (
    <div
      className="relative w-full min-h-screen overflow-y-auto bg-cover bg-center"
      style={{ backgroundImage: BG_IMAGE }}
    >
      {/* readability wash: light on the left, clear on the right */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/45 to-transparent pointer-events-none"
      />
      {/* faint blueprint grid (visible mostly when no photo) */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #1F3FB0 1px, transparent 1px), linear-gradient(to bottom, #1F3FB0 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_480px] xl:grid-cols-[minmax(0,1fr)_520px] gap-8 lg:gap-12 px-5 sm:px-10 lg:pl-14 lg:pr-12 pt-8 pb-28 lg:pb-32">
        {/* ───────── LEFT: BRAND ───────── */}
        <section className="flex flex-col gap-7 lg:gap-9 order-2 lg:order-1 lg:pt-2">
          <div className="flex items-center gap-4">
            <CompanyLogo size="lg" variant="badge" className="!rounded-2xl !p-2.5 bg-white shadow-md" />
            <p className="text-[12px] sm:text-[13px] font-semibold text-[#1B3489] leading-snug">
              Engineering <span className="text-[#F37A20]">•</span> Manufacturing{' '}
              <span className="text-[#F37A20]">•</span> Turnkey Solutions
            </p>
          </div>

          <div className="space-y-5 max-w-[640px]">
            <h1 className="inline-block rounded-xl bg-[#0F2A6B] px-5 py-3 text-[26px] sm:text-4xl xl:text-[44px] font-extrabold tracking-tight text-white leading-none shadow-lg shadow-[#0F2A6B]/25">
              UMA TECHNO FAB ERP
            </h1>
            <div>
              <p className="text-xl sm:text-2xl xl:text-[28px] font-bold text-[#0F1F4D] leading-tight">
                Smart Manufacturing. Smarter Management.
              </p>
              <div className="mt-2 h-[3px] w-40 rounded-full bg-gradient-to-r from-[#F37A20] to-transparent" />
            </div>
            <p className="text-[15px] sm:text-base font-medium leading-relaxed text-[#1F2D55] max-w-md">
              Integrated ERP for Food, Pharma &amp; Chemical Machinery Manufacturing
            </p>
          </div>

          <ul className="flex flex-wrap gap-3 mt-auto lg:mt-4">
            {MODULES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="w-[92px] sm:w-[104px] flex flex-col items-center gap-2 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 px-2 py-3.5 shadow-sm"
              >
                <Icon className="w-7 h-7 text-[#1F3FB0]" strokeWidth={1.8} aria-hidden />
                <span className="text-[12px] sm:text-[13px] font-semibold text-[#0F1F4D]">{label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ───────── RIGHT: LOGIN CARD ───────── */}
        <main className="order-1 lg:order-2 flex items-start lg:items-center justify-center">
          <div className="w-full max-w-[460px] lg:max-w-none rounded-[28px] bg-white/95 backdrop-blur-xl shadow-2xl shadow-[#0F2A6B]/20 border border-white px-6 sm:px-9 py-8 sm:py-9">
            <div className="px-2 -mt-1 mb-2 opacity-90">
              <PlantIllustration />
            </div>

            <div className="text-center mb-7">
              <h2 className="text-[30px] sm:text-[34px] font-extrabold tracking-tight text-[#0F1F4D]">Welcome Back</h2>
              <p className="mt-1.5 text-sm sm:text-[15px] font-medium text-[#33405F]">
                Sign in to your UMA TECHNO FAB ERP account
              </p>
              <div className="mx-auto mt-3 h-[3px] w-28 rounded-full bg-gradient-to-r from-transparent via-[#F37A20] to-transparent" />
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

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="login-username" className="sr-only">
                  Username, email or employee ID
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#0F2A6B]" fill="currentColor" aria-hidden />
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    autoComplete="username"
                    autoFocus
                    disabled={loading}
                    className={`${inputBase} pr-4`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#0F2A6B]" fill="currentColor" aria-hidden />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={(e) => setCapsOn(e.getModifierState('CapsLock'))}
                    onBlur={() => setCapsOn(false)}
                    placeholder="Password"
                    autoComplete="current-password"
                    disabled={loading}
                    className={`${inputBase} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[#0F2A6B] hover:bg-[#EFF4FF] transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {capsOn && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-[#B45309]">
                    <AlertCircle className="w-3.5 h-3.5" aria-hidden /> Caps Lock is on
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none text-sm font-medium text-[#0F1F4D]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-[18px] h-[18px] rounded border-[#B8C2D8] accent-[#1F3FB0] cursor-pointer"
                  />
                  Remember Me
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-[color:var(--crm-brand-600)] hover:text-[color:var(--crm-brand-800)] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full h-[54px] mt-1 rounded-xl bg-gradient-to-r from-[#1D5FD8] to-[#14307F] hover:from-[#1A55C2] hover:to-[#10286B] text-white text-base font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-[#1F3FB0]/30 transition active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--crm-brand-600)]/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin motion-reduce:animate-none" aria-hidden /> Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 flex items-center gap-3 text-[13px] font-bold tracking-wide text-[#0F2A6B]">
              <span className="flex-1 h-px bg-[#D5DCEA]" />
              UMA TECHNO FAB ERP
              <span className="flex-1 h-px bg-[#D5DCEA]" />
            </div>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-[#6B7790]">
              Authorized personnel only. Access attempts are monitored and logged.
            </p>
          </div>
        </main>
      </div>

      {/* ───────── BOTTOM BRAND BAND ───────── */}
      <div aria-hidden={false} className="absolute bottom-0 left-0 right-0 z-20 h-20 sm:h-24 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 bg-[#0F2A6B]"
          style={{ clipPath: 'polygon(0 38%, 62% 100%, 62% 100%, 100% 100%, 100% 100%, 0 100%)' }}
        />
        <div
          className="absolute inset-0 bg-[#F37A20]"
          style={{ clipPath: 'polygon(0 18%, 0 38%, 62% 100%, 56% 100%)' }}
        />
        <div className="absolute left-5 sm:left-10 lg:left-14 bottom-4 sm:bottom-5 flex items-center gap-3 sm:gap-4 text-white">
          <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" aria-hidden />
          <span className="text-sm sm:text-xl font-semibold tracking-wide">
            Precision <span className="text-[#F37A20]">•</span> Quality <span className="text-[#F37A20]">•</span> Innovation
          </span>
        </div>
      </div>
    </div>
  );
}
