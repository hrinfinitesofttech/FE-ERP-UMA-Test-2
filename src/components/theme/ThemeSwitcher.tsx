'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './ClientThemeProvider';
import { Palette, Check, Sparkles, Moon, Sun, RotateCcw, X } from 'lucide-react';

export function ThemeSwitcher() {
  const { currentThemeId, currentTheme, setTheme, availableThemes, isDark, mounted } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const activeColor = mounted ? currentTheme.palette.primary : '#75401F';
  const displayName = mounted ? currentTheme.name.split(' ')[0] : 'Theme';

  return (
    <div className="relative">
      {/* Theme Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--crm-border-default,#EDE5DC)] bg-[var(--crm-surface-card,#FFFFFF)] hover:bg-[var(--crm-surface-subtle,#FAF7F2)] text-[var(--crm-text-secondary,#6E5D53)] hover:text-[var(--crm-text-primary,#211B17)] transition-all cursor-pointer shadow-2xs group"
        title="Change UI Theme & Colors"
        aria-label="Change UI Theme & Colors"
      >
        <div className="relative flex items-center justify-center">
          <Palette className="w-4 h-4 text-crm-brand-700 group-hover:rotate-12 transition-transform" />
          {/* Active color dot */}
          <span
            suppressHydrationWarning
            className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-slate-900 shadow-2xs transition-colors"
            style={{ backgroundColor: activeColor }}
          />
        </div>
        <span
          suppressHydrationWarning
          className="text-xs font-bold hidden sm:inline text-[var(--crm-text-primary,#211B17)]"
        >
          {displayName}
        </span>
      </button>

      {/* Theme Picker Dropdown Popover */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--crm-surface-card,#FFFFFF)] rounded-2xl shadow-2xl border border-[var(--crm-border-default,#EDE5DC)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="p-3.5 bg-[var(--crm-surface-subtle,#FAF7F2)] border-b border-[var(--crm-border-default,#EDE5DC)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-crm-brand-700 text-white flex items-center justify-center shadow-2xs">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-[var(--crm-text-primary,#211B17)]">Theme & Color Palette</h3>
                <p className="text-[10px] text-[var(--crm-text-secondary,#70665F)]">Choose your ERP visual experience</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Theme Grid */}
          <div className="p-3 max-h-96 overflow-y-auto space-y-2">
            {availableThemes.map((theme) => {
              const isSelected = currentThemeId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    setTheme(theme.id);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer group ${
                    isSelected
                      ? 'border-crm-brand-700 bg-crm-brand-50/50 shadow-xs ring-1 ring-crm-brand-700/30'
                      : 'border-[var(--crm-border-default,#EDE5DC)] bg-[var(--crm-surface-card,#FFFFFF)] hover:bg-[var(--crm-surface-subtle,#FCFAF7)] hover:border-[var(--crm-border-strong,#D5CAC0)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Visual Color Swatches preview */}
                    <div className="flex items-center -space-x-1 flex-shrink-0">
                      <span
                        className="w-5 h-5 rounded-full border border-white dark:border-slate-800 shadow-xs"
                        style={{ backgroundColor: theme.palette.primary }}
                        title="Primary Color"
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white dark:border-slate-800 shadow-xs"
                        style={{ backgroundColor: theme.palette.accent }}
                        title="Accent Color"
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shadow-2xs"
                        style={{ backgroundColor: theme.palette.bg }}
                        title="Canvas Background"
                      />
                    </div>

                    {/* Theme Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[var(--crm-text-primary,#211B17)] truncate">
                          {theme.name}
                        </span>
                        {theme.isDark && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-slate-800 text-sky-300">
                            <Moon className="w-2.5 h-2.5" /> Dark
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--crm-text-secondary,#70665F)] truncate">{theme.description}</p>
                    </div>
                  </div>

                  {/* Active Indicator Checkmark */}
                  <div className="flex-shrink-0 ml-2">
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-crm-brand-700 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 group-hover:border-slate-400 transition" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Reset & Tip */}
          <div className="p-3 bg-[var(--crm-surface-subtle,#FAF7F2)] border-t border-[var(--crm-border-default,#EDE5DC)] flex items-center justify-between text-[11px]">
            <span className="text-[var(--crm-text-secondary,#8D827A)] flex items-center gap-1 text-[10px]">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Saves instantly to your browser
            </span>
            <button
              type="button"
              onClick={() => setTheme('warmIndustrial')}
              className="inline-flex items-center gap-1 text-crm-brand-700 hover:text-crm-brand-900 dark:text-sky-400 dark:hover:text-sky-300 font-bold cursor-pointer transition text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
