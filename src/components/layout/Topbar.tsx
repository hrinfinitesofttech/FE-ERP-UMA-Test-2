'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { formatDateTime } from '../../lib/utils';

export function Topbar() {
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="h-16 bg-[#FCFAF7] border-b border-[#EDE5DC] px-4 sm:px-6 flex items-center justify-between gap-4 z-20 sticky top-0 flex-shrink-0 transition-all">
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
          className="flex items-center gap-2.5 px-4 py-2 w-full bg-[#FAF7F2] hover:bg-white border border-[#E5DDD0] rounded-full text-xs text-[#8C7D72] transition-all text-left group shadow-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-crm-brand-600"
        >
          <Search className="w-3.5 h-3.5 text-[#8C7D72] group-hover:text-[#3E2723] transition-colors" />
          <span className="flex-1 truncate text-xs">Search jobs, customers, products...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold text-[#8C7D72] bg-white border border-[#E5DDD0] rounded-md shadow-xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Controls: + New Lead + Notifications + User Avatar */}
      <div className="flex items-center gap-3">
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
          >
            <Bell className="w-4 h-4 text-[#6E5D53]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D9383A] text-white font-black rounded-full text-[9px] flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-bg-surface rounded-2xl shadow-xl border border-border overflow-hidden z-50 text-xs animate-in fade-in duration-150">
              <div className="p-3.5 bg-bg-app border-b border-border flex items-center justify-between">
                <span className="font-bold text-text-primary">System Notifications ({unreadCount})</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-primary hover:underline font-bold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {notifications.slice(0, 5).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    className={`p-3.5 hover:bg-primary-light/50 cursor-pointer transition flex items-start gap-3 ${
                      !notif.isRead ? 'bg-primary-light/30' : ''
                    }`}
                  >
                    <div className="mt-0.5">
                      {notif.type === 'alert' || notif.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-accent flex-shrink-0" />
                      ) : notif.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      ) : (
                        <Bell className="w-4 h-4 text-info flex-shrink-0" />
                      )}
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <div className="font-bold text-text-primary">{notif.title}</div>
                      <div className="text-text-secondary text-[11px] leading-relaxed">{notif.message}</div>
                      <div className="text-[10px] text-text-muted font-mono pt-0.5">{formatDateTime(notif.timestamp)}</div>
                    </div>
                  </div>
                ))}
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-crm-brand-700 to-crm-brand-500 text-white font-bold text-xs flex items-center justify-center shadow-xs uppercase">
              {((currentUser.firstName?.[0] || currentUser.username?.[0] || 'U') + (currentUser.lastName?.[0] || ''))}
            </div>
            <div className="text-left hidden md:block">
              <div className="font-bold text-[#211B17] text-xs leading-tight">
                {currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username || 'Admin User'}
              </div>
              <div className="text-[10px] text-crm-brand-600 leading-tight font-bold">
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
