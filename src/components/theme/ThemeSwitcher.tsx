'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './ClientThemeProvider';
import {
  Palette,
  Type,
  Layers,
  Sliders,
  Check,
  Sparkles,
  Moon,
  Sun,
  RotateCcw,
  X,
  Eye,
  CheckCircle2,
  Square,
  Circle,
  ShieldCheck,
  Truck,
  Package,
  FileText,
  Save,
  ArrowRight,
  Sparkle,
  SlidersHorizontal,
} from 'lucide-react';
import { toast } from '@/context/ToastContext';
import {
  CardRadiusOption,
  CardBorderWidthOption,
  CardShadowOption,
  CardSurfaceOption,
  InputStyleOption,
  ButtonVariantOption,
} from '@/lib/theme-tokens';

type StudioTab = 'themes' | 'typography' | 'cards' | 'forms';

export function ThemeSwitcher() {
  const {
    currentThemeId,
    currentTheme,
    setTheme,
    designConfig,
    updateDesignConfig,
    applyRecommendedDesign,
    applyDesignPreset,
    resetToDefaults,
    availableThemes,
    availableFonts,
    signaturePresets,
    isDark,
    mounted,
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<StudioTab>('themes');
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

  const handleApplyRecommended = () => {
    applyRecommendedDesign();
    toast.success(`Applied recommended design styling for ${currentTheme.name}!`);
  };

  const handleResetDefaults = () => {
    resetToDefaults();
    toast.success('Reset UI theme, typography & card styling to Uma default!');
  };

  return (
    <div className="relative">
      {/* Theme Trigger Button in Topbar */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--crm-border-default,#EDE5DC)] bg-[var(--crm-surface-card,#FFFFFF)] hover:bg-[var(--crm-surface-subtle,#FAF7F2)] text-[var(--crm-text-secondary,#6E5D53)] hover:text-[var(--crm-text-primary,#211B17)] transition-all cursor-pointer shadow-2xs group"
        title="Open Theme & Design Studio"
        aria-label="Open Theme & Design Studio"
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
          {displayName} Studio
        </span>
      </button>

      {/* FULL DESIGN STUDIO MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div
            ref={panelRef}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-[#E7DED5] dark:border-slate-800 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-150"
          >
            {/* STUDIO HEADER */}
            <div className="bg-[#211B17] text-white p-4 sm:p-5 flex items-center justify-between border-b border-black">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black tracking-widest uppercase text-amber-400">
                    UMA TECHNO FAB ENTERPRISE DESIGN ENGINE
                  </div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                    <span>Theme, Font &amp; Card Design Studio</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold">
                      Global Live Customizer
                    </span>
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Reset to factory Uma default"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset Defaults</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 1-CLICK SIGNATURE DESIGN PRESETS QUICK-SELECT */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-orange-500/10 dark:from-amber-950/40 dark:to-orange-950/40 border-b border-amber-200/80 dark:border-amber-900/50 p-2.5 sm:px-4 flex items-center justify-between gap-3 overflow-x-auto">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-950 dark:text-amber-200">
                  1-Click Signature Presets:
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto py-0.5">
                {signaturePresets.map((preset) => {
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        applyDesignPreset(preset.id);
                        toast.success(`Applied ${preset.name} Preset!`);
                      }}
                      className="px-2.5 py-1 rounded-xl border border-amber-300 dark:border-amber-800 bg-white/90 dark:bg-slate-800 text-[11px] font-black text-slate-800 dark:text-slate-100 hover:bg-amber-600 hover:text-white hover:border-amber-600 transition shadow-2xs whitespace-nowrap flex items-center gap-1.5 cursor-pointer group"
                      title={preset.subtitle}
                    >
                      <span>{preset.name}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 group-hover:bg-white group-hover:text-amber-700 font-bold">
                        {preset.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* NAVIGATION TABS */}
            <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('themes')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'themes'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>1. Color Themes ({availableThemes.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('typography')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'typography'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>2. Fonts &amp; Colors ({designConfig.fontFamily})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cards')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'cards'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>3. Card Thickness &amp; Radius</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('forms')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'forms'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>4. Form Inputs &amp; Controls</span>
              </button>
            </div>

            {/* STUDIO BODY: SPLIT VIEW (CONTROLS ON LEFT, LIVE PREVIEW ON RIGHT) */}
            <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto">
              {/* LEFT COLUMN: ACTIVE TAB CONTROLS (7 Cols) */}
              <div className="md:col-span-7 p-4 sm:p-5 border-r border-slate-200 dark:border-slate-800 space-y-4">
                {/* ============================================================ */}
                {/* TAB 1: COLOR THEMES                                          */}
                {/* ============================================================ */}
                {activeTab === 'themes' && (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          Curated Palette Selection
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Select a theme to transform the entire ERP palette
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyRecommended}
                        className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Auto-Pair Recommended Font</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {availableThemes.map((th) => {
                        const isSelected = currentThemeId === th.id;
                        return (
                          <div
                            key={th.id}
                            onClick={() => setTheme(th.id)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                              isSelected
                                ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/20 shadow-md ring-2 ring-amber-500/30'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-850 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-black text-xs text-slate-900 dark:text-white">
                                {th.name}
                              </span>
                              {isSelected ? (
                                <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </span>
                              ) : th.isDark ? (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-sky-300 font-bold flex items-center gap-0.5">
                                  <Moon className="w-2.5 h-2.5" /> Dark
                                </span>
                              ) : null}
                            </div>

                            {/* Color Swatches */}
                            <div className="flex items-center gap-1.5 mb-2">
                              <span
                                className="w-6 h-6 rounded-lg border border-black/10 shadow-xs"
                                style={{ backgroundColor: th.palette.primary }}
                                title="Primary"
                              />
                              <span
                                className="w-5 h-5 rounded-lg border border-black/10 shadow-xs"
                                style={{ backgroundColor: th.palette.accent }}
                                title="Accent"
                              />
                              <span
                                className="w-5 h-5 rounded-lg border border-slate-300 dark:border-slate-700 shadow-2xs"
                                style={{ backgroundColor: th.palette.bg }}
                                title="Canvas"
                              />
                              <span
                                className="w-5 h-5 rounded-lg border border-slate-300 dark:border-slate-700 shadow-2xs"
                                style={{ backgroundColor: th.palette.card }}
                                title="Card Surface"
                              />
                            </div>

                            <p className="text-[10.5px] text-slate-500 line-clamp-1">
                              {th.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ============================================================ */}
                {/* TAB 2: TYPOGRAPHY & FONT SELECTION                           */}
                {/* ============================================================ */}
                {activeTab === 'typography' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Google Font Family Selection
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Choose from high-legibility typographic systems crafted for industrial &amp; financial ERPs
                      </p>
                    </div>

                    <div className="space-y-2">
                      {availableFonts.map((f) => {
                        const isSelected = designConfig.fontFamily === f.id;
                        return (
                          <div
                            key={f.id}
                            onClick={() => updateDesignConfig({ fontFamily: f.id })}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'border-amber-600 bg-amber-50/60 dark:bg-amber-950/20 shadow-xs ring-1 ring-amber-500/30'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-850'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className="text-sm font-black text-slate-900 dark:text-white"
                                  style={{ fontFamily: f.fontFamily }}
                                >
                                  {f.name}
                                </span>
                                <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                                  {f.category}
                                </span>
                              </div>
                              <p
                                className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1"
                                style={{ fontFamily: f.fontFamily }}
                              >
                                "The quick brown fox jumps over the lazy dog • ₹ 1,48,500.00"
                              </p>
                            </div>

                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center flex-shrink-0 ml-3 shadow-xs">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Custom Text Color Pickers */}
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        Custom Heading &amp; Text Colors (Optional Overrides)
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-500 font-bold text-[11px] mb-1">
                            Heading Font Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={designConfig.headingColor || '#211B17'}
                              onChange={(e) => updateDesignConfig({ headingColor: e.target.value })}
                              className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0"
                            />
                            <input
                              type="text"
                              placeholder="Default Theme"
                              value={designConfig.headingColor}
                              onChange={(e) => updateDesignConfig({ headingColor: e.target.value })}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-500 font-bold text-[11px] mb-1">
                            Body Text Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={designConfig.textColor || '#211B17'}
                              onChange={(e) => updateDesignConfig({ textColor: e.target.value })}
                              className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0"
                            />
                            <input
                              type="text"
                              placeholder="Default Theme"
                              value={designConfig.textColor}
                              onChange={(e) => updateDesignConfig({ textColor: e.target.value })}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => updateDesignConfig({ headingColor: '', textColor: '' })}
                          className="text-[11px] text-amber-700 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                        >
                          Clear Color Overrides (Use Theme Defaults)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================================ */}
                {/* TAB 3: CARD DESIGN, BORDER & THICKNESS                       */}
                {/* ============================================================ */}
                {activeTab === 'cards' && (
                  <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Global Card Geometries &amp; Borders
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Adjust how dashboard cards, KPI widgets, and table containers look across all pages
                      </p>
                    </div>

                    {/* Corner Radius */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">
                        Card Corner Radius (વળાંક):
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'sharp', label: 'Sharp (6px)', desc: 'Industrial structure' },
                          { id: 'rounded', label: 'Balanced (12px)', desc: 'Standard clean' },
                          { id: 'smooth', label: 'Smooth (18px)', desc: 'Modern pebble' },
                          { id: 'pill', label: 'Pill (26px)', desc: 'Soft luxury curves' },
                        ].map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => updateDesignConfig({ cardRadius: r.id as CardRadiusOption })}
                            className={`p-2.5 rounded-xl border font-bold text-center transition cursor-pointer ${
                              designConfig.cardRadius === r.id
                                ? 'border-amber-600 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 ring-2 ring-amber-500/20'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50'
                            }`}
                          >
                            <div>{r.label}</div>
                            <div className="text-[9.5px] font-normal text-slate-400 mt-0.5">{r.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Border Thickness */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">
                        Card Border Thickness (બોર્ડર જાડાઈ):
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: '0', label: '0px (Borderless)', desc: 'Pure depth elevation' },
                          { id: '1', label: '1px (Hairline)', desc: 'Subtle luxury edge' },
                          { id: '2', label: '2px (Crisp Outline)', desc: 'Strong clear borders' },
                          { id: '3', label: '3px (Heavy Panel)', desc: 'Heavy industrial feel' },
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => updateDesignConfig({ cardBorderWidth: b.id as CardBorderWidthOption })}
                            className={`p-2.5 rounded-xl border font-bold text-center transition cursor-pointer ${
                              designConfig.cardBorderWidth === b.id
                                ? 'border-amber-600 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 ring-2 ring-amber-500/20'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50'
                            }`}
                          >
                            <div>{b.label}</div>
                            <div className="text-[9.5px] font-normal text-slate-400 mt-0.5">{b.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Shadow & Elevation */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">
                        Elevation / Shadow Depth (શેડો લુક):
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'flat', label: 'Flat (No Shadow)', desc: 'Minimalist flat' },
                          { id: 'soft', label: 'Ambient Soft', desc: 'Diffuse multi-layer' },
                          { id: 'depth', label: '3D Depth', desc: 'Raised studio depth' },
                          { id: 'glow', label: 'Theme Glow', desc: 'Color accent rim' },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => updateDesignConfig({ cardShadow: s.id as CardShadowOption })}
                            className={`p-2.5 rounded-xl border font-bold text-center transition cursor-pointer ${
                              designConfig.cardShadow === s.id
                                ? 'border-amber-600 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 ring-2 ring-amber-500/20'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50'
                            }`}
                          >
                            <div>{s.label}</div>
                            <div className="text-[9.5px] font-normal text-slate-400 mt-0.5">{s.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Surface Texture */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">
                        Card Surface Material (સપાટી ટેક્સચર):
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'solid', label: 'Crisp Solid White', desc: 'Opaque pure background' },
                          { id: 'subtle', label: 'Warm Tinted Canvas', desc: 'Soft 2% canvas tint' },
                          { id: 'glass', label: 'Glassmorphism', desc: 'Translucent frosted blur' },
                        ].map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => updateDesignConfig({ cardSurface: c.id as CardSurfaceOption })}
                            className={`p-2.5 rounded-xl border font-bold text-center transition cursor-pointer ${
                              designConfig.cardSurface === c.id
                                ? 'border-amber-600 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 ring-2 ring-amber-500/20'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50'
                            }`}
                          >
                            <div>{c.label}</div>
                            <div className="text-[9.5px] font-normal text-slate-400 mt-0.5">{c.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Card Background & Border Color Controls */}
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
                          <span>Custom Card Background &amp; Border Color</span>
                        </span>
                        {(designConfig.customCardBg || designConfig.customCardBorder) && (
                          <button
                            type="button"
                            onClick={() => updateDesignConfig({ customCardBg: '', customCardBorder: '' })}
                            className="text-[10px] text-amber-700 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                          >
                            Reset Colors
                          </button>
                        )}
                      </div>

                      {/* Card Background Color */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
                          Card Background Color (કાર્ડ બેકગ્રાઉન્ડ કલર):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={designConfig.customCardBg || '#FFFFFF'}
                            onChange={(e) => updateDesignConfig({ customCardBg: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0 flex-shrink-0"
                            title="Choose Custom Card Background"
                          />
                          <input
                            type="text"
                            placeholder="Default White (#FFFFFF)"
                            value={designConfig.customCardBg || ''}
                            onChange={(e) => updateDesignConfig({ customCardBg: e.target.value })}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono"
                          />
                        </div>
                        {/* Quick Swatches */}
                        <div className="flex items-center gap-1.5 pt-1">
                          {[
                            { name: 'Pure White', color: '#FFFFFF' },
                            { name: 'Warm Cream', color: '#FAF7F2' },
                            { name: 'Slate Mist', color: '#F8FAFC' },
                            { name: 'Ice Cyan', color: '#F0F9FF' },
                            { name: 'Midnight Dark', color: '#0F172A' },
                          ].map((sw) => (
                            <button
                              key={sw.color}
                              type="button"
                              onClick={() => updateDesignConfig({ customCardBg: sw.color })}
                              className="px-2 py-0.5 rounded-md border text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                              style={{
                                backgroundColor: sw.color,
                                color: sw.color === '#0F172A' ? '#FFF' : '#334155',
                                borderColor: designConfig.customCardBg === sw.color ? '#D97706' : '#CBD5E1',
                              }}
                            >
                              <span className="w-2 h-2 rounded-full border border-black/20" style={{ backgroundColor: sw.color }} />
                              <span>{sw.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Card Border Color */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <label className="block text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
                          Card Border Outline Color (કાર્ડ બોર્ડર કલર):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={designConfig.customCardBorder || '#E7DED5'}
                            onChange={(e) => updateDesignConfig({ customCardBorder: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0 flex-shrink-0"
                            title="Choose Custom Border Color"
                          />
                          <input
                            type="text"
                            placeholder="Default Border (#E7DED5)"
                            value={designConfig.customCardBorder || ''}
                            onChange={(e) => updateDesignConfig({ customCardBorder: e.target.value })}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono"
                          />
                        </div>
                        {/* Quick Swatches */}
                        <div className="flex items-center gap-1.5 pt-1">
                          {[
                            { name: 'Warm Terracotta', color: '#E7DED5' },
                            { name: 'Slate Gray', color: '#CBD5E1' },
                            { name: 'Steel Blue', color: '#94A3B8' },
                            { name: 'Cyan Neon', color: '#38BDF8' },
                            { name: 'Dark Border', color: '#334155' },
                          ].map((sw) => (
                            <button
                              key={sw.color}
                              type="button"
                              onClick={() => updateDesignConfig({ customCardBorder: sw.color })}
                              className="px-2 py-0.5 rounded-md border text-[10px] font-bold transition flex items-center gap-1 cursor-pointer bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                              style={{
                                borderColor: designConfig.customCardBorder === sw.color ? '#D97706' : '#CBD5E1',
                              }}
                            >
                              <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: sw.color }} />
                              <span>{sw.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Header Gradient Switch */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                            Topbar Header Gradient
                          </div>
                          <div className="text-[10.5px] text-slate-400">
                            Apply vibrant two-tone dynamic theme gradient to top headers
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateDesignConfig({ headerGradient: !designConfig.headerGradient })}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                            designConfig.headerGradient
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{designConfig.headerGradient ? 'Active Gradient' : 'Standard Clean'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================================ */}
                {/* TAB 4: FORM INPUTS & BUTTON CONTROLS                         */}
                {/* ============================================================ */}
                {activeTab === 'forms' && (
                  <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Global Form Inputs &amp; Controls
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Customize text boxes, select dropdowns, and button shapes across all production &amp; accounting forms
                      </p>
                    </div>

                    {/* Input Style */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">
                        Input Box Style (ટેક્સ્ટ બોક્સ આકાર):
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { id: 'box', label: 'Modern Box (6px)', desc: 'Structured rectangular corners' },
                          { id: 'rounded', label: 'Smooth Rounded (12px)', desc: 'Balanced standard input' },
                          { id: 'pill', label: 'Capsule Pill (Full)', desc: 'High-tech pill shape' },
                          { id: 'underline', label: 'Minimal Underline', desc: 'Clean border-bottom style' },
                        ].map((i) => (
                          <button
                            key={i.id}
                            type="button"
                            onClick={() => updateDesignConfig({ inputStyle: i.id as InputStyleOption })}
                            className={`p-3 rounded-xl border font-bold text-left transition cursor-pointer ${
                              designConfig.inputStyle === i.id
                                ? 'border-amber-600 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 ring-2 ring-amber-500/20'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{i.label}</span>
                              {designConfig.inputStyle === i.id && (
                                <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />
                              )}
                            </div>
                            <div className="text-[10px] font-normal text-slate-400 mt-1">{i.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Button Style */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">
                        Button Appearance Variant (બટન સ્ટાઇલ):
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { id: 'gradient', label: 'Solid Gradient', desc: 'Vibrant theme gradient' },
                          { id: 'solid', label: 'Crisp Solid Color', desc: 'Pure solid high-contrast' },
                          { id: 'soft', label: 'Soft Tinted', desc: 'Gentle pastel background' },
                          { id: 'glass', label: 'Glass Outline', desc: 'Subtle frosted border' },
                        ].map((bv) => (
                          <button
                            key={bv.id}
                            type="button"
                            onClick={() => updateDesignConfig({ buttonVariant: bv.id as ButtonVariantOption })}
                            className={`p-3 rounded-xl border font-bold text-left transition cursor-pointer ${
                              designConfig.buttonVariant === bv.id
                                ? 'border-amber-600 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 ring-2 ring-amber-500/20'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{bv.label}</span>
                              {designConfig.buttonVariant === bv.id && (
                                <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />
                              )}
                            </div>
                            <div className="text-[10px] font-normal text-slate-400 mt-1">{bv.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: REAL-TIME LIVE PREVIEW PLAYGROUND (5 Cols) */}
              <div className="md:col-span-5 p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-950/60 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-600" />
                      <span>Live Design Preview</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
                      ● Active Real-time
                    </span>
                  </div>

                  {/* PREVIEW CONTAINER CARD */}
                  <div
                    className={`p-4 sm:p-5 transition-all space-y-4 border ${
                      !designConfig.customCardBg ? 'bg-white dark:bg-slate-850' : ''
                    } ${
                      designConfig.cardRadius === 'sharp'
                        ? 'rounded-md'
                        : designConfig.cardRadius === 'rounded'
                        ? 'rounded-xl'
                        : designConfig.cardRadius === 'pill'
                        ? 'rounded-3xl'
                        : 'rounded-2xl'
                    } ${
                      designConfig.cardBorderWidth === '0'
                        ? 'border-transparent'
                        : designConfig.cardBorderWidth === '2'
                        ? 'border-2'
                        : designConfig.cardBorderWidth === '3'
                        ? 'border-3'
                        : 'border'
                    } ${
                      !designConfig.customCardBorder
                        ? designConfig.cardBorderWidth === '2'
                          ? 'border-slate-300 dark:border-slate-700'
                          : designConfig.cardBorderWidth === '3'
                          ? 'border-slate-400 dark:border-slate-600'
                          : 'border-slate-200 dark:border-slate-800'
                        : ''
                    } ${
                      designConfig.cardShadow === 'flat'
                        ? 'shadow-none'
                        : designConfig.cardShadow === 'depth'
                        ? 'shadow-xl'
                        : designConfig.cardShadow === 'glow'
                        ? 'shadow-[0_0_20px_rgba(217,119,6,0.25)]'
                        : 'shadow-md'
                    }`}
                    style={{
                      backgroundColor: designConfig.customCardBg || undefined,
                      borderColor: designConfig.customCardBorder || undefined,
                    }}
                  >
                    {/* Card Header (Dynamic Header Gradient) */}
                    <div
                      className={`flex items-center justify-between transition-all ${
                        designConfig.headerGradient
                          ? 'p-3.5 -mx-4 -mt-4 sm:-mx-5 sm:-mt-5 rounded-t-xl text-white shadow-xs'
                          : 'border-b border-slate-100 dark:border-slate-800 pb-3'
                      }`}
                      style={
                        designConfig.headerGradient
                          ? {
                              background: `linear-gradient(135deg, ${currentTheme.palette.primary}, ${currentTheme.palette.accent})`,
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs ${
                            designConfig.headerGradient ? 'bg-white/20 backdrop-blur-xs' : ''
                          }`}
                          style={
                            !designConfig.headerGradient
                              ? { backgroundColor: currentTheme.palette.primary }
                              : undefined
                          }
                        >
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <div
                            className={`font-black text-sm ${
                              designConfig.headerGradient
                                ? 'text-white'
                                : 'text-slate-900 dark:text-white'
                            }`}
                            style={{
                              fontFamily: designConfig.fontFamily,
                              color: !designConfig.headerGradient
                                ? designConfig.headingColor || undefined
                                : '#FFFFFF',
                            }}
                          >
                            Delivery Challan #547
                          </div>
                          <div
                            className={`text-[10.5px] ${
                              designConfig.headerGradient ? 'text-white/80' : 'text-slate-400'
                            }`}
                          >
                            UMA Food • Vehicle GJ-02.AT.3826
                          </div>
                        </div>
                      </div>

                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={
                          designConfig.headerGradient
                            ? {
                                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                color: '#FFFFFF',
                              }
                            : {
                                backgroundColor: `${currentTheme.palette.primary}20`,
                                color: currentTheme.palette.primary,
                              }
                        }
                      >
                        In Transit
                      </span>
                    </div>

                    {/* Card Metric */}
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Consignment Value (GST E-Way Bill)
                      </div>
                      <div
                        className="text-xl font-black text-slate-900 dark:text-white"
                        style={{
                          fontFamily: designConfig.fontFamily,
                          color: designConfig.headingColor || undefined,
                        }}
                      >
                        ₹ 14,85,000.00
                      </div>
                    </div>

                    {/* Form Controls Sample */}
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <label className="block font-bold text-[11px] text-slate-600 dark:text-slate-300 mb-1">
                          Sample Input Box
                        </label>
                        <input
                          type="text"
                          readOnly
                          value="UMA TECHNOFAB / Kadi Plant"
                          className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold focus:outline-none ${
                            designConfig.inputStyle === 'pill'
                              ? 'rounded-full px-4'
                              : designConfig.inputStyle === 'box'
                              ? 'rounded-md'
                              : designConfig.inputStyle === 'underline'
                              ? 'rounded-none border-t-0 border-x-0 border-b-2 bg-transparent px-1'
                              : 'rounded-xl'
                          }`}
                        />
                      </div>

                      {/* Action Buttons Sample */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          className={`flex-1 py-2 px-3 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                            designConfig.inputStyle === 'pill' ? 'rounded-full' : 'rounded-xl'
                          }`}
                          style={{
                            background:
                              designConfig.buttonVariant === 'gradient'
                                ? `linear-gradient(135deg, ${currentTheme.palette.primary}, ${currentTheme.palette.accent})`
                                : currentTheme.palette.primary,
                          }}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Generate Invoice</span>
                        </button>
                        <button
                          type="button"
                          className={`py-2 px-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition ${
                            designConfig.inputStyle === 'pill' ? 'rounded-full' : 'rounded-xl'
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Note */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-3 rounded-2xl flex items-start gap-2.5 text-amber-900 dark:text-amber-200 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    તમે અહીં જે પણ બદલાવ કરશો તે સમગ્ર ERP ની અંદર તમામ પેજીસ (પેકિંગ, ડિસ્પેચ, એકાઉન્ટિંગ, સ્ટોર, HR) પર એકસાથે ગ્લોબલ લાગુ થશે.
                  </p>
                </div>
              </div>
            </div>

            {/* STUDIO FOOTER */}
            <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Active Font: <strong>{designConfig.fontFamily}</strong></span>
                <span>•</span>
                <span>Radius: <strong>{designConfig.cardRadius}</strong></span>
                <span>•</span>
                <span>Border: <strong>{designConfig.cardBorderWidth}px</strong></span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Apply &amp; Close Studio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeSwitcher;
