'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#070B14]">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-crm-brand-700/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-3xl overflow-hidden border border-[#EBE3DB] bg-white backdrop-blur-2xl shadow-2xl p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-crm-brand-700 to-crm-brand-600 flex items-center justify-center text-[#211B17] font-black text-xl mx-auto shadow-lg shadow-crm-brand-600/30">
            U
          </div>
          <h2 className="text-xl font-extrabold text-[#211B17] tracking-tight">Reset ERP Password</h2>
          <p className="text-xs text-[#70665F]">
            Enter your employee email address to receive secure OTP and reset instructions.
          </p>
        </div>

        {submitted ? (
          <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-[#211B17]">Reset Link Dispatched</h4>
            <p className="text-xs text-[#544B45]">
              We have sent password recovery instructions to <strong className="text-emerald-300">{email}</strong>.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-crm-brand-500 hover:text-crm-brand- pt-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#544B45] mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#70665F]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rajesh@umatechnofab.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#EBE3DB]/80 rounded-xl text-xs text-[#211B17] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-crm-brand-600/30 focus:border-crm-brand-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-crm-brand-700 to-crm-brand-700 hover:from-crm-brand-600 hover:to-crm-brand-600 text-[#211B17] rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-crm-brand-700/30 cursor-pointer"
            >
              <Send className="w-4 h-4" /> Send Recovery Link
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#70665F] hover:text-[#211B17] transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
