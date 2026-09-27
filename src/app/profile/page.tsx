'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { User, Lock, Mail, Phone, MapPin, Building, Shield, CheckCircle2, Camera } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, updateCurrentUserProfile, changePassword } = useERP();
  const [mobile, setMobile] = useState(currentUser.mobile);
  const [address, setAddress] = useState(currentUser.address);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [savedMsg, setSavedMsg] = useState('');
  const [passMsg, setPassMsg] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({ mobile, address });
    setSavedMsg('Profile information updated successfully.');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setPassMsg('Error: Passwords do not match.');
      return;
    }
    if (newPass.length < 6) {
      setPassMsg('Error: Password must be at least 6 characters.');
      return;
    }
    changePassword(newPass);
    setNewPass('');
    setConfirmPass('');
    setPassMsg('Password successfully changed.');
    setTimeout(() => setPassMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-xs pb-10">
      {/* Top Header */}
      <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="relative group">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-crm-brand-700 to-indigo-700 text-[#211B17] font-black text-2xl flex items-center justify-center shadow-lg shadow-crm-brand-600/30">
            {currentUser.firstName.slice(0, 1)}{currentUser.lastName.slice(0, 1)}
          </div>
          <button
            title="Change Profile Photo"
            className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white text-white border-2 border-white dark:border-[#EBE3DB] shadow-md hover:bg-crm-brand-700 transition"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#211B17]">
              {currentUser.firstName} {currentUser.lastName}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono font-bold text-[10px] border border-amber-300">
              {currentUser.roleName?.toUpperCase()}
            </span>
          </div>
          <p className="text-[#70665F]">{currentUser.designation} • {currentUser.departmentName}</p>
          <div className="flex items-center justify-center sm:justify-start gap-4 text-[#70665F] text-[11px] pt-1">
            <span>Employee ID: <strong className="font-mono text-slate-700 dark:text-[#544B45]">{currentUser.id}</strong></span>
            <span>Username: <strong className="font-mono text-slate-700 dark:text-[#544B45]">{currentUser.username}</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Details Edit Form */}
        <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-[#EBE3DB]">
            <User className="w-4 h-4 text-crm-brand-700" />
            Contact & Residential Details
          </h3>

          {savedMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{savedMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-3">
            <div>
              <label className="block text-[#70665F] font-semibold mb-1">Corporate Email (Read Only)</label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full px-3 py-2 bg-slate-100 dark:bg-[#FAF7F2]/50 border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-[#70665F] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Mobile Contact</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Residential Address</label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold transition shadow-sm"
            >
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-[#EBE3DB]">
            <Lock className="w-4 h-4 text-amber-600" />
            Security & Change Password
          </h3>

          {passMsg && (
            <div className={`p-2.5 rounded-lg flex items-center gap-2 ${passMsg.startsWith('Error') ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>
              <span>{passMsg}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">New Password</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Min 6 characters"
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Re-type new password"
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-[#FAF7F2] dark:bg-[#FAF7F2] hover:bg-white text-[#211B17] rounded-lg font-bold transition shadow-sm"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
