'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useERP } from '../../context/ERPContext';
import {
  Search,
  Bell,
  UserCheck,
  ShieldCheck,
  ChevronDown,
  Clock,
  History,
  CheckCircle2,
  AlertTriangle,
  Menu,
  Sparkles,
  LogOut,
  User,
  Plus,
  Compass,
  Cpu,
  Layers,
  Volume2,
  VolumeX,
  Volume1,
  ExternalLink,
  Check,
  Package,
  Factory,
  ShoppingBag,
  Truck,
  Receipt,
} from 'lucide-react';
import { formatDateTime } from '../../lib/utils';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import {
  isSoundEnabled,
  setSoundEnabled,
  isVoiceEnabled,
  setVoiceEnabled,
  testNotificationSound,
} from '../../lib/notificationAudio';

export function Topbar() {
  const router = useRouter();
  const {
    currentUser,
    setCurrentUser,
    availableEmployees,
    setIsSearchOpen,
    openJobModal,
    salesOrders,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    sidebarCollapsed,
    setSidebarCollapsed,
    logout,
  } = useERP();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [soundActive, setSoundActive] = useState(true);
  const [voiceActive, setVoiceActive] = useState(true);

  useEffect(() => {
    setSoundActive(isSoundEnabled());
    setVoiceActive(isVoiceEnabled());
  }, []);

  const toggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
  };

  const toggleVoice = () => {
    const next = !voiceActive;
    setVoiceActive(next);
    setVoiceEnabled(next);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotifClick = (notif: any) => {
    markNotificationRead(notif.id);
    setShowNotificationMenu(false);
    if (notif.linkUrl) {
      router.push(notif.linkUrl);
    }
  };

  return (
    <header className="h-16 bg-[var(--crm-bg-app,#FCFAF7)] border-b border-[var(--crm-border-default,#EDE5DC)] px-4 sm:px-6 flex items-center justify-between gap-4 z-20 sticky top-0 flex-shrink-0 transition-all">
      {/* Left: Mobile Toggle & Global Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 rounded-xl text-[#6E5D53] hover:bg-[#F3EDE4] sm:hidden transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Button Trigger (Ctrl+K) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2.5 px-4 py-2 w-full bg-[#FAF7F2] hover:bg-white border border-[#E5DDD0] rounded-full text-xs text-[#8C7D72] transition-all text-left group shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-crm-brand-700/20"
        >
          <Search className="w-3.5 h-3.5 text-[#8C7D72] group-hover:text-crm-brand-700 transition-colors" />
          <span className="flex-1 truncate text-xs font-medium">Search all pages, modules, jobs, leads, stock, PO...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold text-[#75401F] bg-[#FAF0E6] border border-[#E5DDD0] rounded-md shadow-2xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Controls: + New Lead + Notifications + User Avatar */}
      <div className="flex items-center gap-3">
        {/* Theme & Color Switcher */}
        <ThemeSwitcher />

        {/* Quick Action: + New Lead */}
        <Link
          href="/crm/leads/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-crm-brand-700 hover:bg-crm-brand-600 text-white text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Lead</span>
        </Link>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu);
              setShowRoleMenu(false);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-xl text-[#6E5D53] hover:bg-[#F3EDE4] relative border border-[#E5DDD0] transition cursor-pointer"
            title="System Notifications"
          >
            <Bell className="w-4 h-4 text-[#6E5D53]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D9383A] text-white font-black rounded-full text-[9px] flex items-center justify-center shadow-xs animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#EDE5DC] overflow-hidden z-50 text-xs animate-in fade-in duration-150">
              {/* Header */}
              <div className="p-3.5 bg-[#FAF7F2] border-b border-[#EDE5DC] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-crm-brand-700" />
                  <span className="font-bold text-[#211B17]">
                    Notifications {unreadCount > 0 ? `(${unreadCount} new)` : `(${notifications.length})`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-crm-brand-700 hover:underline font-bold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {/* Sound & Voice Settings Bar */}
              <div className="px-3.5 py-2 bg-[#F6F1EA] border-b border-[#EDE5DC] flex items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Sound Toggle */}
                  <button
                    type="button"
                    onClick={toggleSound}
                    className={`flex items-center gap-1.5 font-bold px-2 py-1 rounded-lg transition cursor-pointer ${
                      soundActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-500'
                    }`}
                    title={soundActive ? 'Sound Chime is ON' : 'Sound Chime is OFF'}
                  >
                    {soundActive ? <Volume2 className="w-3.5 h-3.5 text-emerald-700" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{soundActive ? 'Chime ON' : 'Chime OFF'}</span>
                  </button>

                  {/* Voice Toggle */}
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className={`flex items-center gap-1.5 font-bold px-2 py-1 rounded-lg transition cursor-pointer ${
                      voiceActive ? 'bg-purple-100 text-purple-800 border border-purple-300' : 'bg-slate-200 text-slate-500'
                    }`}
                    title={voiceActive ? 'Voice Alert is ON' : 'Voice Alert is OFF'}
                  >
                    <Volume1 className="w-3.5 h-3.5 text-purple-700" />
                    <span>{voiceActive ? 'Voice ON' : 'Voice OFF'}</span>
                  </button>
                </div>

                {/* Test Sound Button */}
                <button
                  type="button"
                  onClick={testNotificationSound}
                  className="px-2.5 py-1 bg-white border border-[#D5C7B8] hover:bg-[#FAF7F2] text-slate-700 font-bold rounded-lg text-[10px] transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Test Sound & Voice"
                >
                  <Volume2 className="w-3 h-3 text-[#75401F]" />
                  <span>Test</span>
                </button>
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-[#EDE5DC]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Bell className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-xs">No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 6).map((notif) => {
                    const cleanTitle = (notif.title || '')
                      .replace(/^[\s\p{Emoji}\u200d\uFE0F✓✕⚠️🚨🚀📦⚙️🛍️📝📋✅❌♻️🚛📄💰💸🔊]+/gu, '')
                      .trim();
                    const titleLower = (notif.title || '').toLowerCase();
                    const deptLower = (notif.department || '').toLowerCase();

                    let badgeColor = 'bg-crm-brand-50 text-crm-brand-700 border-crm-brand-200/80';
                    let IconComp = Bell;

                    if (deptLower === 'store' || titleLower.includes('material') || titleLower.includes('stock') || titleLower.includes('grn')) {
                      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
                      IconComp = Package;
                    } else if (deptLower === 'production' || titleLower.includes('production') || titleLower.includes('work order') || titleLower.includes('job')) {
                      badgeColor = 'bg-sky-50 text-sky-700 border-sky-200/80';
                      IconComp = Factory;
                    } else if (deptLower === 'design' || titleLower.includes('design') || titleLower.includes('bom') || titleLower.includes('engineering')) {
                      badgeColor = 'bg-purple-50 text-purple-700 border-purple-200/80';
                      IconComp = Compass;
                    } else if (deptLower === 'purchase' || titleLower.includes('po ') || titleLower.includes('pr ') || titleLower.includes('purchase')) {
                      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200/80';
                      IconComp = ShoppingBag;
                    } else if (deptLower === 'dispatch' || titleLower.includes('dispatch') || titleLower.includes('challan')) {
                      badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
                      IconComp = Truck;
                    } else if (deptLower === 'accounts' || titleLower.includes('invoice') || titleLower.includes('payment') || titleLower.includes('receipt')) {
                      badgeColor = 'bg-teal-50 text-teal-700 border-teal-200/80';
                      IconComp = Receipt;
                    } else if (notif.type === 'alert' || notif.type === 'warning') {
                      badgeColor = 'bg-rose-50 text-rose-700 border-rose-200/80';
                      IconComp = AlertTriangle;
                    } else if (notif.type === 'success') {
                      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
                      IconComp = CheckCircle2;
                    }

                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className={`p-3.5 hover:bg-[#FAF7F2] cursor-pointer transition flex items-start gap-3 ${
                          !notif.isRead ? 'bg-[#FCF5ED]' : 'bg-white'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-2xs ${badgeColor}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`font-bold truncate text-xs ${!notif.isRead ? 'text-[#211B17]' : 'text-slate-700'}`}>
                              {cleanTitle || notif.title}
                            </span>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-crm-brand-700 flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                            {notif.message}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono pt-0.5">
                            {formatDateTime(notif.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer: View All Link */}
              <div className="p-2.5 bg-[#FAF7F2] border-t border-[#EDE5DC] text-center">
                <Link
                  href="/notifications"
                  onClick={() => setShowNotificationMenu(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-crm-brand-700 hover:text-crm-brand-800 transition"
                >
                  <span>View All Notifications ({notifications.length})</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown (Matching Screenshot: JD Durgesh Jadav Admin) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowRoleMenu(false);
              setShowNotificationMenu(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#F3EDE4] transition cursor-pointer"
          >
            <div
              suppressHydrationWarning
              className="w-8 h-8 rounded-full bg-gradient-to-br from-crm-brand-700 to-crm-brand-500 text-white font-bold text-xs flex items-center justify-center shadow-xs uppercase"
            >
              {((currentUser.firstName?.[0] || currentUser.username?.[0] || 'U') + (currentUser.lastName?.[0] || ''))}
            </div>
            <div className="text-left hidden md:block">
              <div suppressHydrationWarning className="font-bold text-[#211B17] text-xs leading-tight">
                {currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username || 'Admin User'}
              </div>
              <div suppressHydrationWarning className="text-[10px] text-crm-brand-600 leading-tight font-bold">
                {currentUser.roleName || currentUser.role || 'Admin'}
              </div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-bg-surface rounded-2xl shadow-xl border border-border py-2 z-50 text-xs animate-in fade-in duration-150">
              <div className="px-4 py-2.5 border-b border-border">
                <div className="font-bold text-text-primary">{currentUser.firstName} {currentUser.lastName}</div>
                <div className="text-text-muted text-[11px] truncate">{currentUser.email}</div>
                <div className="text-primary font-bold font-mono text-[10px] mt-0.5 uppercase">{currentUser.roleName}</div>
              </div>
              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-text-secondary hover:bg-primary-light transition"
                >
                  <User className="w-4 h-4 text-text-muted" />
                  <span>My Profile</span>
                </Link>
                <Link
                  href="/settings/company"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-text-secondary hover:bg-primary-light transition"
                >
                  <ShieldCheck className="w-4 h-4 text-text-muted" />
                  <span>Company Settings</span>
                </Link>
              </div>
              <div className="border-t border-border pt-1">
                <Link
                  href="/login"
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="flex items-center gap-2.5 px-4 py-2 text-danger hover:bg-danger-bg transition font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
