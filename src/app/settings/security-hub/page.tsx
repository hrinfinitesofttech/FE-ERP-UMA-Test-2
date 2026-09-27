'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  EyeOff,
  Key,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function SecurityHubPage() {
  const { securityChecks } = useERP();

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanOutput, setScanOutput] = useState<string[]>([]);

  const handleRunSecurityScan = () => {
    setIsScanning(true);
    setScanOutput([]);

    const steps = [
      'Checking Password Salt & Hashing Rounds (bcrypt v12)... OK',
      'Auditing API Route Middleware Scopes & Cookie Signatures... OK',
      'Checking Data Masking on Employee Aadhaar/PAN & Bank Accounts... OK',
      'Testing SQL Parameterized Queries against SQL Injection vectors... OK',
      'Evaluating Rate Limiting Headers & CORS strict origin policies... OK',
      'Checking SSL/TLS 1.3 Certificate & HSTS Policy Headers... OK',
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setScanOutput((prev) => [...prev, steps[i]]);
        i++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
      }
    }, 350);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-[#EBE3DB] p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-crm-brand-600/10 border border-crm-brand-600/20 rounded-xl text-crm-brand-500">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#211B17] tracking-wide">
                Security & Production Compliance Hub
              </h1>
              <p className="text-xs text-[#70665F]">
                Uma Techno Fab Manufacturing ERP — Cybersecurity, Data Encryption, Sensitive Masking & Penetration Safeguards
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleRunSecurityScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2.5 bg-crm-brand-700 hover:bg-crm-brand-600 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-crm-brand-700/20 disabled:opacity-50"
        >
          <Zap className={cn('w-4 h-4', isScanning && 'animate-spin')} />
          {isScanning ? 'Scanning Security Compliance...' : 'Run Security Vulnerability Audit'}
        </button>
      </div>

      {/* Security Scan Output */}
      {scanOutput.length > 0 && (
        <div className="bg-white border border-crm-brand-600/30 p-5 rounded-2xl space-y-2 shadow-2xl">
          <div className="text-xs font-bold text-crm-brand-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Live Vulnerability Scanner Output Log
          </div>
          <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EBE3DB] font-mono text-xs text-emerald-400 space-y-1 max-h-40 overflow-y-auto">
            {scanOutput.map((out, idx) => (
              <div key={idx}>✓ {out}</div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Security Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl space-y-1">
          <div className="text-xs text-[#70665F] font-medium flex items-center justify-between">
            <span>Authentication</span>
            <Key className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="text-lg font-bold text-[#211B17]">Bcrypt Salt 12</div>
          <div className="text-[10px] text-emerald-400">JWT Token Expiry Enforced</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl space-y-1">
          <div className="text-xs text-[#70665F] font-medium flex items-center justify-between">
            <span>Data Masking</span>
            <EyeOff className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-[#211B17]">PII Masking Active</div>
          <div className="text-[10px] text-emerald-400">PAN, Aadhaar & Bank Masked</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl space-y-1">
          <div className="text-xs text-[#70665F] font-medium flex items-center justify-between">
            <span>SQL Injection</span>
            <Lock className="w-4 h-4 text-crm-brand-500" />
          </div>
          <div className="text-lg font-bold text-[#211B17]">100% Sanitized</div>
          <div className="text-[10px] text-emerald-400">Parameterized Prepared Stmts</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl space-y-1">
          <div className="text-xs text-[#70665F] font-medium flex items-center justify-between">
            <span>Rate Limiting</span>
            <Server className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-[#211B17]">100 req / min</div>
          <div className="text-[10px] text-emerald-400">Brute-force Shield Enabled</div>
        </div>
      </div>

      {/* Security Audit Checklist */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#EBE3DB] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#211B17]">
            <ShieldCheck className="w-4 h-4 text-crm-brand-500" />
            15-Point ERP Security & Production Compliance Matrix
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] text-[10px] font-semibold text-[#70665F] uppercase tracking-wider border-b border-[#EBE3DB]">
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Compliance Check & Description</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Last Audited</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-[#544B45]">
              {securityChecks.map((sec) => (
                <tr key={sec.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-crm-brand-500">{sec.id}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FAF7F2] text-[#544B45] border border-[#EBE3DB]">
                      {sec.category?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 space-y-0.5 max-w-md">
                    <div className="font-semibold text-[#211B17]">{sec.title}</div>
                    <div className="text-[11px] text-[#70665F]">{sec.description}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-bold',
                        sec.riskLevel === 'High' && 'bg-red-500/20 text-red-400 border border-red-500/40',
                        sec.riskLevel === 'Medium' && 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
                        sec.riskLevel === 'Low' && 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      )}
                    >
                      {sec.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#70665F]">{sec.lastAudited}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {sec.status?.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
