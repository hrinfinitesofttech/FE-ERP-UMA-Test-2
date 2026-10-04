'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Drawing2D } from '@/types/designer';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  Maximize2,
  Printer,
  Sliders,
  Settings2,
  FileText,
  Info,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface CADBlueprintViewerModalProps {
  drawing: Drawing2D;
  onClose: () => void;
}

export default function CADBlueprintViewerModal({
  drawing,
  onClose,
}: CADBlueprintViewerModalProps) {
  const [activeTab, setActiveTab] = useState<'blueprint' | 'nozzles' | 'specs'>('blueprint');
  const [theme, setTheme] = useState<'blueprint' | 'dark' | 'paper'>('blueprint');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showNozzles, setShowNozzles] = useState(true);
  const [showInternals, setShowInternals] = useState(true);
  const [showWelds, setShowWelds] = useState(true);
  const [showCenterlines, setShowCenterlines] = useState(true);

  const drawingNum = drawing.drawingNumber || drawing.id || 'DWG-2026-001';
  const drawingTitle = drawing.drawingTitle || (drawing as any).title || 'Pressure Vessel General Arrangement';
  const jobRef = drawing.jobNumber || 'JOB-2026-0065';
  const rev = drawing.revisionNumber || drawing.revision || 'REV-00';
  const scale = drawing.scale || '1:15';
  const sheet = drawing.sheetSize || 'A1';
  const format = drawing.fileFormat || 'DWG';
  const drawnBy = drawing.drawnBy || 'Dharmesh Joshi';
  const checkedBy = drawing.checkedBy || 'Ketan Patel';
  const approvedBy = drawing.approvedBy || 'Rajesh Patel';

  // Palette settings based on CAD theme
  const getThemeStyles = () => {
    switch (theme) {
      case 'blueprint':
        return {
          bg: '#07162C',
          grid: '#0E2E5C',
          vesselStroke: '#38BDF8',
          vesselFill: 'rgba(14, 165, 233, 0.08)',
          dimensionColor: '#F59E0B',
          nozzleColor: '#34D399',
          centerlineColor: '#EF4444',
          internalColor: '#A78BFA',
          weldColor: '#F43F5E',
          textColor: '#E2E8F0',
          titleBlockBg: '#091E3A',
          titleBlockBorder: '#1E3A8A',
        };
      case 'dark':
        return {
          bg: '#111827',
          grid: '#1F2937',
          vesselStroke: '#F3F4F6',
          vesselFill: 'rgba(255, 255, 255, 0.05)',
          dimensionColor: '#FBBF24',
          nozzleColor: '#10B981',
          centerlineColor: '#EC4899',
          internalColor: '#60A5FA',
          weldColor: '#F87171',
          textColor: '#F9FAFB',
          titleBlockBg: '#1F2937',
          titleBlockBorder: '#374151',
        };
      case 'paper':
      default:
        return {
          bg: '#F8FAFC',
          grid: '#E2E8F0',
          vesselStroke: '#0F172A',
          vesselFill: 'rgba(15, 23, 42, 0.04)',
          dimensionColor: '#B45309',
          nozzleColor: '#047857',
          centerlineColor: '#DC2626',
          internalColor: '#6D28D9',
          weldColor: '#BE123C',
          textColor: '#0F172A',
          titleBlockBg: '#FFFFFF',
          titleBlockBorder: '#CBD5E1',
        };
    }
  };

  const currentTheme = getThemeStyles();

  const handleDownload = () => {
    alert(`Downloading AutoCAD Vector Blueprint: ${drawingNum}.${format.toLowerCase()} (${drawing.fileSize || '4.8 MB'})`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#E7DED5] rounded-3xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]"
      >
        {/* Modal Top Navigation Bar */}
        <div className="bg-[#FAF7F2] border-b border-[#E7DED5] px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF0E6] border border-[#E7DED5] flex items-center justify-center text-[#75401F] shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-[#0E91B2] bg-[#E0F2FE] px-2 py-0.5 rounded text-xs border border-[#BAE6FD]">
                  {drawingNum}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#FAF0E6] text-[#75401F] font-mono text-[11px] font-bold border border-[#E7DED5]">
                  {rev}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#169B62] bg-[#DCFCE7] px-2 py-0.5 rounded border border-[#BBF7D0]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  ASME Sec VIII Div 1
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#211B17] mt-0.5 truncate max-w-md">
                {drawingTitle}
              </h2>
            </div>
          </div>

          {/* Controls: Tabs & Themes & Close */}
          <div className="flex items-center gap-2">
            {/* View Mode Tabs */}
            <div className="bg-white p-1 rounded-xl border border-[#E7DED5] flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('blueprint')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  activeTab === 'blueprint'
                    ? 'bg-[#3E2723] text-white shadow-xs'
                    : 'text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]'
                }`}
              >
                📐 CAD Blueprint
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('nozzles')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  activeTab === 'nozzles'
                    ? 'bg-[#3E2723] text-white shadow-xs'
                    : 'text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]'
                }`}
              >
                📋 Nozzle Schedule
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  activeTab === 'specs'
                    ? 'bg-[#3E2723] text-white shadow-xs'
                    : 'text-[#70665F] hover:text-[#211B17] hover:bg-[#FAF7F2]'
                }`}
              >
                ⚙️ Design Specs
              </button>
            </div>

            {/* Theme Selector (only in blueprint view) */}
            {activeTab === 'blueprint' && (
              <div className="hidden md:flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E7DED5] text-xs">
                <button
                  type="button"
                  onClick={() => setTheme('blueprint')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                    theme === 'blueprint' ? 'bg-[#0E2E5C] text-cyan-200' : 'text-[#70665F]'
                  }`}
                  title="Navy Blueprint Theme"
                >
                  Blueprint
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                    theme === 'dark' ? 'bg-slate-900 text-amber-300' : 'text-[#70665F]'
                  }`}
                  title="AutoCAD Dark Theme"
                >
                  CAD Dark
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('paper')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                    theme === 'paper' ? 'bg-slate-200 text-slate-900' : 'text-[#70665F]'
                  }`}
                  title="White Drafting Paper"
                >
                  Drafting
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#70665F] hover:text-[#211B17] hover:bg-white border border-transparent hover:border-[#E7DED5] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden p-4 sm:p-6 bg-[#FAF7F2] flex flex-col">
          {activeTab === 'blueprint' && (
            <div className="flex-1 flex flex-col rounded-2xl border border-[#E7DED5] shadow-inner overflow-hidden relative min-h-[480px]">
              {/* CAD Canvas Top Floating Bar */}
              <div
                className="px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b z-20 backdrop-blur-md"
                style={{
                  backgroundColor: theme === 'paper' ? '#FFFFFF' : 'rgba(15, 23, 42, 0.85)',
                  borderColor: theme === 'paper' ? '#E2E8F0' : '#1E293B',
                  color: currentTheme.textColor,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] opacity-80">
                    SCALE {scale} • SHEET {sheet} ({format}) • UNITS: MM
                  </span>
                  <span className="hidden sm:inline-block font-mono text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    ACTIVE 2D VECTOR VIEWPORT
                  </span>
                </div>

                {/* Layer Toggles & Zoom Toolbar */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-lg border border-white/10 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setShowDimensions(!showDimensions)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                        showDimensions ? 'bg-amber-500/30 text-amber-300 font-bold' : 'opacity-50'
                      }`}
                      title="Toggle Dimension Lines"
                    >
                      Dim
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNozzles(!showNozzles)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                        showNozzles ? 'bg-emerald-500/30 text-emerald-300 font-bold' : 'opacity-50'
                      }`}
                      title="Toggle Nozzle Callouts"
                    >
                      Nozzles
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInternals(!showInternals)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                        showInternals ? 'bg-purple-500/30 text-purple-300 font-bold' : 'opacity-50'
                      }`}
                      title="Toggle Internal Agitator/Coils"
                    >
                      Internals
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowWelds(!showWelds)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                        showWelds ? 'bg-rose-500/30 text-rose-300 font-bold' : 'opacity-50'
                      }`}
                      title="Toggle Weld Seams"
                    >
                      Welds
                    </button>
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-lg border border-white/10">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
                      className="p-1 hover:bg-white/10 rounded transition text-current"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-[10px] px-1 font-bold">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
                      className="p-1 hover:bg-white/10 rounded transition text-current"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(1)}
                      className="p-1 hover:bg-white/10 rounded transition text-current"
                      title="Reset View"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Blueprint Viewport (SVG Technical Vector Drawing) */}
              <div
                className="flex-1 overflow-auto relative flex items-center justify-center p-4 transition-colors duration-300 cursor-crosshair select-none"
                style={{ backgroundColor: currentTheme.bg }}
              >
                {/* CAD Grid Background */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-40"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${currentTheme.grid} 1px, transparent 1px), linear-gradient(to bottom, ${currentTheme.grid} 1px, transparent 1px)`,
                    backgroundSize: '28px 28px',
                  }}
                />

                {/* Sub-grid fine lines */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-15"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${currentTheme.grid} 0.5px, transparent 0.5px), linear-gradient(to bottom, ${currentTheme.grid} 0.5px, transparent 0.5px)`,
                    backgroundSize: '7px 7px',
                  }}
                />

                {/* Technical Engineering Drawing SVG Container */}
                <div
                  className="relative transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                >
                  <svg
                    width="880"
                    height="460"
                    viewBox="0 0 880 460"
                    className="overflow-visible"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <marker
                        id="arrowhead-amber"
                        markerWidth="7"
                        markerHeight="7"
                        refX="6"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon points="0 0, 7 3.5, 0 7" fill={currentTheme.dimensionColor} />
                      </marker>
                      <marker
                        id="arrowhead-cyan"
                        markerWidth="6"
                        markerHeight="6"
                        refX="5"
                        refY="3"
                        orient="auto"
                      >
                        <polygon points="0 0, 6 3, 0 6" fill={currentTheme.nozzleColor} />
                      </marker>
                    </defs>

                    {/* ================= 1. CENTERLINES ================= */}
                    {showCenterlines && (
                      <g stroke={currentTheme.centerlineColor} strokeWidth="1" strokeDasharray="8,4,2,4" opacity="0.6">
                        {/* Vertical Main Vessel Centerline */}
                        <line x1="330" y1="20" x2="330" y2="440" />
                        {/* Horizontal Nozzle Centerlines */}
                        <line x1="160" y1="110" x2="500" y2="110" />
                        <line x1="160" y1="210" x2="500" y2="210" />
                        <line x1="160" y1="310" x2="500" y2="310" />
                        {/* Plan View Centerlines */}
                        <line x1="710" y1="70" x2="710" y2="250" />
                        <line x1="620" y1="160" x2="800" y2="160" />
                      </g>
                    )}

                    {/* ================= 2. MAIN VESSEL SHELL & HEADS ================= */}
                    <g stroke={currentTheme.vesselStroke} strokeWidth="2.5" fill={currentTheme.vesselFill}>
                      {/* Top Torispherical / Ellipsoidal Head */}
                      <path d="M 230 110 C 230 45, 430 45, 430 110" fill={currentTheme.vesselFill} />
                      {/* Cylindrical Shell Body */}
                      <rect x="230" y="110" width="200" height="220" />
                      {/* Bottom 2:1 Semi-Ellipsoidal Head */}
                      <path d="M 230 330 C 230 395, 430 395, 430 330" fill={currentTheme.vesselFill} />

                      {/* Double Wall / Dimple Cooling Jacket Profile (Outer layer) */}
                      <path
                        d="M 218 140 L 218 310 C 218 365, 442 365, 442 310 L 442 140"
                        stroke={currentTheme.vesselStroke}
                        strokeWidth="1.5"
                        strokeDasharray="5,3"
                        fill="none"
                        opacity="0.7"
                      />
                    </g>

                    {/* ================= 3. STRUCTURAL SUPPORT LEGS ================= */}
                    <g stroke={currentTheme.vesselStroke} strokeWidth="2" fill={currentTheme.vesselFill}>
                      {/* Left Leg */}
                      <path d="M 240 310 L 210 420 L 235 420 L 255 330 Z" />
                      {/* Left Foot Base Plate & Gusset */}
                      <rect x="195" y="420" width="55" height="10" rx="2" fill={currentTheme.vesselStroke} />
                      <circle cx="205" cy="425" r="2.5" fill={currentTheme.bg} />
                      <circle cx="240" cy="425" r="2.5" fill={currentTheme.bg} />

                      {/* Right Leg */}
                      <path d="M 420 310 L 450 420 L 425 420 L 405 330 Z" />
                      {/* Right Foot Base Plate & Gusset */}
                      <rect x="410" y="420" width="55" height="10" rx="2" fill={currentTheme.vesselStroke} />
                      <circle cx="420" cy="425" r="2.5" fill={currentTheme.bg} />
                      <circle cx="455" cy="425" r="2.5" fill={currentTheme.bg} />
                    </g>

                    {/* ================= 4. INTERNAL AGITATOR & BAFFLES ================= */}
                    {showInternals && (
                      <g stroke={currentTheme.internalColor} strokeWidth="1.5" fill="none">
                        {/* Agitator Motor Gearbox on top */}
                        <rect x="310" y="8" width="40" height="35" rx="3" fill={currentTheme.internalColor} fillOpacity="0.2" />
                        <line x1="330" y1="43" x2="330" y2="350" strokeWidth="3" stroke={currentTheme.internalColor} />

                        {/* Top Impeller Hydrofoil Blades */}
                        <path d="M 270 200 L 330 205 L 390 200" strokeWidth="3" stroke={currentTheme.internalColor} />
                        <polygon points="265,190 275,210 260,210" fill={currentTheme.internalColor} />
                        <polygon points="395,190 385,210 400,210" fill={currentTheme.internalColor} />

                        {/* Bottom Turbine Impeller */}
                        <path d="M 260 295 L 330 300 L 400 295" strokeWidth="3.5" stroke={currentTheme.internalColor} />
                        <rect x="250" y="288" width="18" height="18" fill={currentTheme.internalColor} fillOpacity="0.3" />
                        <rect x="392" y="288" width="18" height="18" fill={currentTheme.internalColor} fillOpacity="0.3" />

                        {/* Wall Baffles */}
                        <line x1="238" y1="130" x2="238" y2="320" strokeWidth="2" strokeDasharray="3,3" />
                        <line x1="422" y1="130" x2="422" y2="320" strokeWidth="2" strokeDasharray="3,3" />
                      </g>
                    )}

                    {/* ================= 5. NOZZLES, FLANGES & MANWAYS ================= */}
                    <g stroke={currentTheme.nozzleColor} strokeWidth="2" fill="none">
                      {/* Top Manway M1 (20" NB Flanged Davit) */}
                      <rect x="255" y="44" width="30" height="18" fill={currentTheme.vesselFill} />
                      <rect x="250" y="40" width="40" height="5" rx="1" fill={currentTheme.nozzleColor} />

                      {/* Top Process Inlet N1 (4" NB 150# ANSI) */}
                      <rect x="370" y="48" width="22" height="18" fill={currentTheme.vesselFill} />
                      <rect x="365" y="44" width="32" height="5" rx="1" fill={currentTheme.nozzleColor} />

                      {/* Top Vapor / Vent N2 (6" NB) */}
                      <rect x="400" y="70" width="18" height="16" transform="rotate(35, 400, 70)" />
                      <rect x="396" y="66" width="26" height="5" rx="1" fill={currentTheme.nozzleColor} transform="rotate(35, 400, 70)" />

                      {/* Side Sight Glass SG1 */}
                      <rect x="210" y="160" width="20" height="16" fill={currentTheme.vesselFill} />
                      <circle cx="210" cy="168" r="6" stroke={currentTheme.nozzleColor} strokeWidth="2" fill="none" />

                      {/* Side Temp Sensor Probe TI-101 */}
                      <rect x="430" y="240" width="24" height="14" fill={currentTheme.vesselFill} />
                      <line x1="440" y1="247" x2="475" y2="247" strokeWidth="2" stroke={currentTheme.nozzleColor} />

                      {/* Bottom Drain Outlet N5 (3" NB with Flush Valve Flange) */}
                      <rect x="318" y="378" width="24" height="24" fill={currentTheme.vesselFill} />
                      <rect x="310" y="402" width="40" height="6" rx="1" fill={currentTheme.nozzleColor} />
                    </g>

                    {/* ================= 6. NOZZLE CALLOUT LABELS ================= */}
                    {showNozzles && (
                      <g fontSize="10" fontFamily="monospace" fontWeight="bold" fill={currentTheme.nozzleColor}>
                        {/* M1 Leader */}
                        <line x1="270" y1="40" x2="220" y2="18" stroke={currentTheme.nozzleColor} strokeWidth="1" markerEnd="url(#arrowhead-cyan)" />
                        <text x="140" y="15">M1: 20&quot; MANWAY</text>

                        {/* N1 Leader */}
                        <line x1="380" y1="44" x2="440" y2="20" stroke={currentTheme.nozzleColor} strokeWidth="1" />
                        <text x="445" y="20">N1: 4&quot; PROCESS FEED (150#)</text>

                        {/* N2 Leader */}
                        <line x1="415" y1="75" x2="475" y2="65" stroke={currentTheme.nozzleColor} strokeWidth="1" />
                        <text x="480" y="68">N2: 6&quot; VAPOR OUTLET</text>

                        {/* SG1 Leader */}
                        <line x1="210" y1="168" x2="150" y2="168" stroke={currentTheme.nozzleColor} strokeWidth="1" />
                        <text x="70" y="172">SG1: SIGHT GLASS</text>

                        {/* TI-101 Leader */}
                        <line x1="454" y1="247" x2="500" y2="247" stroke={currentTheme.nozzleColor} strokeWidth="1" />
                        <text x="505" y="250">TI-101: THERMOWELL (1.5&quot;)</text>

                        {/* N5 Bottom Drain Leader */}
                        <line x1="350" y1="405" x2="400" y2="435" stroke={currentTheme.nozzleColor} strokeWidth="1" />
                        <text x="405" y="438">N5: 3&quot; FLUSH BOTTOM DRAIN</text>
                      </g>
                    )}

                    {/* ================= 7. WELD SEAM CALLOUTS ================= */}
                    {showWelds && (
                      <g stroke={currentTheme.weldColor} strokeWidth="1" fill={currentTheme.weldColor}>
                        {/* W-01 Top Head-to-Shell Circumferential Seam */}
                        <line x1="230" y1="110" x2="430" y2="110" strokeWidth="1.5" strokeDasharray="3,2" />
                        <circle cx="230" cy="110" r="3" />
                        <text x="145" y="113" fontSize="9" fontFamily="monospace" fontWeight="bold">W-01 (100% RT)</text>

                        {/* W-02 Bottom Head-to-Shell Circumferential Seam */}
                        <line x1="230" y1="330" x2="430" y2="330" strokeWidth="1.5" strokeDasharray="3,2" />
                        <circle cx="430" cy="330" r="3" />
                        <text x="440" y="333" fontSize="9" fontFamily="monospace" fontWeight="bold">W-02 (100% RT)</text>
                      </g>
                    )}

                    {/* ================= 8. DIMENSION LINES & ARROWS ================= */}
                    {showDimensions && (
                      <g stroke={currentTheme.dimensionColor} strokeWidth="1" fill={currentTheme.dimensionColor} fontSize="9" fontFamily="monospace" fontWeight="bold">
                        {/* Diameter Dimension (Top) */}
                        <line x1="230" y1="75" x2="430" y2="75" markerStart="url(#arrowhead-amber)" markerEnd="url(#arrowhead-amber)" />
                        <line x1="230" y1="70" x2="230" y2="110" strokeDasharray="2,2" />
                        <line x1="430" y1="70" x2="430" y2="110" strokeDasharray="2,2" />
                        <text x="300" y="70" textAnchor="middle">Ø 1,800 mm ID</text>

                        {/* Shell Height Dimension (Left) */}
                        <line x1="200" y1="110" x2="200" y2="330" markerStart="url(#arrowhead-amber)" markerEnd="url(#arrowhead-amber)" />
                        <line x1="200" y1="110" x2="230" y2="110" strokeDasharray="2,2" />
                        <line x1="200" y1="330" x2="230" y2="330" strokeDasharray="2,2" />
                        <text x="190" y="225" textAnchor="middle" transform="rotate(-90 190 225)">SHELL: 2,200 mm</text>

                        {/* Overall Height (Right) */}
                        <line x1="490" y1="45" x2="490" y2="425" markerStart="url(#arrowhead-amber)" markerEnd="url(#arrowhead-amber)" />
                        <line x1="430" y1="45" x2="500" y2="45" strokeDasharray="2,2" />
                        <line x1="465" y1="425" x2="500" y2="425" strokeDasharray="2,2" />
                        <text x="510" y="240" textAnchor="middle" transform="rotate(90 510 240)">OAL: 3,850 mm</text>

                        {/* Thickness Callouts */}
                        <text x="245" y="220" fontSize="8" fill={currentTheme.dimensionColor}>THK: 12 mm SS316L</text>
                      </g>
                    )}

                    {/* ================= 9. SECTION / PLAN VIEW (NOZZLE ORIENTATION DIAL) ================= */}
                    <g transform="translate(620, 40)">
                      <rect x="0" y="0" width="180" height="180" rx="8" fill={currentTheme.titleBlockBg} stroke={currentTheme.titleBlockBorder} strokeWidth="1" />
                      <text x="10" y="18" fontSize="9" fontFamily="monospace" fontWeight="bold" fill={currentTheme.textColor}>
                        PLAN: NOZZLE ORIENTATION
                      </text>

                      {/* 360 Degree Dial Circle */}
                      <circle cx="90" cy="100" r="50" stroke={currentTheme.vesselStroke} strokeWidth="1.5" fill="none" />
                      <circle cx="90" cy="100" r="4" fill={currentTheme.centerlineColor} />

                      {/* Crosshairs */}
                      <line x1="90" y1="42" x2="90" y2="158" stroke={currentTheme.centerlineColor} strokeDasharray="4,2" />
                      <line x1="32" y1="100" x2="148" y2="100" stroke={currentTheme.centerlineColor} strokeDasharray="4,2" />

                      {/* Orientation Degree Labels */}
                      <text x="90" y="40" fontSize="8" fontFamily="monospace" textAnchor="middle" fill={currentTheme.textColor}>0° (NORTH)</text>
                      <text x="155" y="103" fontSize="8" fontFamily="monospace" fill={currentTheme.textColor}>90°</text>
                      <text x="90" y="168" fontSize="8" fontFamily="monospace" textAnchor="middle" fill={currentTheme.textColor}>180°</text>
                      <text x="12" y="103" fontSize="8" fontFamily="monospace" fill={currentTheme.textColor}>270°</text>

                      {/* Nozzle Positions on Circle */}
                      {/* N1 at 0 deg */}
                      <circle cx="90" cy="50" r="4" fill={currentTheme.nozzleColor} />
                      <text x="98" y="54" fontSize="8" fontFamily="monospace" fontWeight="bold" fill={currentTheme.nozzleColor}>N1</text>

                      {/* M1 at 45 deg */}
                      <circle cx="125" cy="65" r="5" fill={currentTheme.nozzleColor} />
                      <text x="133" y="68" fontSize="8" fontFamily="monospace" fontWeight="bold" fill={currentTheme.nozzleColor}>M1</text>

                      {/* N2 at 180 deg */}
                      <circle cx="90" cy="150" r="4" fill={currentTheme.nozzleColor} />
                      <text x="98" y="154" fontSize="8" fontFamily="monospace" fontWeight="bold" fill={currentTheme.nozzleColor}>N2</text>

                      {/* TI-101 at 270 deg */}
                      <circle cx="40" cy="100" r="3" fill={currentTheme.nozzleColor} />
                      <text x="24" y="94" fontSize="8" fontFamily="monospace" fontWeight="bold" fill={currentTheme.nozzleColor}>TI</text>
                    </g>
                  </svg>
                </div>

                {/* ================= 10. PROFESSIONAL TITLE BLOCK (ISO Standard Corner) ================= */}
                <div
                  className="absolute bottom-3 right-3 rounded-xl border p-3.5 text-left font-mono text-[10px] shadow-2xl z-20 backdrop-blur-md min-w-[260px] max-w-xs"
                  style={{
                    backgroundColor: currentTheme.titleBlockBg,
                    borderColor: currentTheme.titleBlockBorder,
                    color: currentTheme.textColor,
                  }}
                >
                  <div className="flex items-center justify-between border-b pb-1.5 mb-1.5 border-white/10">
                    <span className="font-extrabold tracking-wider text-[#E89234]">UMA TECHNO FAB ERP</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      ISO 9001:2015
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="opacity-70">DRAWING NO:</span>
                      <strong className="text-[#38BDF8] font-bold">{drawingNum}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">JOB REF:</span>
                      <strong className="text-amber-400">{jobRef}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">EQUIPMENT:</span>
                      <span className="font-bold truncate max-w-[140px]">{drawingTitle}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-[9px]">
                      <div>SCALE: <strong className="text-current">{scale}</strong></div>
                      <div>SHEET: <strong className="text-current">{sheet}</strong></div>
                      <div>REV: <strong className="text-current">{rev}</strong></div>
                      <div>MOC: <strong className="text-current">SS 316L</strong></div>
                    </div>
                    <div className="pt-1 border-t border-white/10 text-[8.5px] opacity-75 flex justify-between">
                      <span>DRN: {drawnBy}</span>
                      <span>CHK: {checkedBy}</span>
                      <span>APP: {approvedBy}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NOZZLE SCHEDULE & PIPING DETAILS */}
          {activeTab === 'nozzles' && (
            <div className="flex-1 overflow-auto bg-white rounded-2xl border border-[#E7DED5] p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E7DED5] pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#211B17] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#8C5229]" />
                    Nozzle Schedule & Connection Matrix
                  </h3>
                  <p className="text-xs text-[#70665F]">
                    Fabrication nozzle schedule for {drawingTitle} ({drawingNum})
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-[#169B62] bg-[#DCFCE7] px-3 py-1 rounded-full border border-[#BBF7D0]">
                  6 Flanged Connections
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAF7F2] text-[10px] font-bold text-[#70665F] uppercase tracking-wider border-b border-[#E7DED5]">
                      <th className="py-2.5 px-3">MARK</th>
                      <th className="py-2.5 px-3">SIZE & RATING</th>
                      <th className="py-2.5 px-3">SERVICE / FUNCTION</th>
                      <th className="py-2.5 px-3">FLANGE FACING</th>
                      <th className="py-2.5 px-3">ORIENTATION</th>
                      <th className="py-2.5 px-3">ELEVATION (EL)</th>
                      <th className="py-2.5 px-3">MATERIAL (MOC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE8DE] text-[#211B17] font-medium">
                    <tr className="hover:bg-[#FAF7F2]">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0E91B2]">N1</td>
                      <td className="py-2.5 px-3 font-mono">4&quot; NB 150# ANSI B16.5</td>
                      <td className="py-2.5 px-3 font-bold text-[#211B17]">Process Feed Inlet</td>
                      <td className="py-2.5 px-3">Raised Face (RF)</td>
                      <td className="py-2.5 px-3 font-mono">0° (North)</td>
                      <td className="py-2.5 px-3 font-mono">+3,850 mm</td>
                      <td className="py-2.5 px-3 font-mono text-[#15803D]">SS 316L</td>
                    </tr>
                    <tr className="hover:bg-[#FAF7F2]">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0E91B2]">N2</td>
                      <td className="py-2.5 px-3 font-mono">6&quot; NB 150# ANSI B16.5</td>
                      <td className="py-2.5 px-3 font-bold text-[#211B17]">Vapor Outlet / Condenser Reflux</td>
                      <td className="py-2.5 px-3">Raised Face (RF)</td>
                      <td className="py-2.5 px-3 font-mono">180° (South)</td>
                      <td className="py-2.5 px-3 font-mono">+3,800 mm</td>
                      <td className="py-2.5 px-3 font-mono text-[#15803D]">SS 316L</td>
                    </tr>
                    <tr className="hover:bg-[#FAF7F2]">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0E91B2]">N3</td>
                      <td className="py-2.5 px-3 font-mono">2&quot; NB 150# ANSI B16.5</td>
                      <td className="py-2.5 px-3 font-bold text-[#211B17]">Nitrogen Blanketing / Relief</td>
                      <td className="py-2.5 px-3">Raised Face (RF)</td>
                      <td className="py-2.5 px-3 font-mono">90° (East)</td>
                      <td className="py-2.5 px-3 font-mono">+3,750 mm</td>
                      <td className="py-2.5 px-3 font-mono text-[#15803D]">SS 316L</td>
                    </tr>
                    <tr className="hover:bg-[#FAF7F2]">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0E91B2]">N4</td>
                      <td className="py-2.5 px-3 font-mono">1.5&quot; NB 150# ANSI B16.5</td>
                      <td className="py-2.5 px-3 font-bold text-[#211B17]">TI-101 Thermowell Sensor</td>
                      <td className="py-2.5 px-3">Raised Face (RF)</td>
                      <td className="py-2.5 px-3 font-mono">270° (West)</td>
                      <td className="py-2.5 px-3 font-mono">+1,400 mm</td>
                      <td className="py-2.5 px-3 font-mono text-[#15803D]">SS 316L</td>
                    </tr>
                    <tr className="hover:bg-[#FAF7F2]">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0E91B2]">N5</td>
                      <td className="py-2.5 px-3 font-mono">3&quot; NB 150# ANSI B16.5</td>
                      <td className="py-2.5 px-3 font-bold text-[#211B17]">Bottom Drain Flush Valve</td>
                      <td className="py-2.5 px-3">Raised Face (RF)</td>
                      <td className="py-2.5 px-3 font-mono">Center Centerline</td>
                      <td className="py-2.5 px-3 font-mono">+120 mm</td>
                      <td className="py-2.5 px-3 font-mono text-[#15803D]">SS 316L</td>
                    </tr>
                    <tr className="hover:bg-[#FAF7F2]">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0E91B2]">M1</td>
                      <td className="py-2.5 px-3 font-mono">20&quot; NB Davit Arm Manway</td>
                      <td className="py-2.5 px-3 font-bold text-[#211B17]">Inspection & Catalyst Loading</td>
                      <td className="py-2.5 px-3">Full Face O-Ring</td>
                      <td className="py-2.5 px-3 font-mono">45° (North-East)</td>
                      <td className="py-2.5 px-3 font-mono">+3,900 mm</td>
                      <td className="py-2.5 px-3 font-mono text-[#15803D]">SS 316L</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ASME DESIGN SPECIFICATIONS & CODE DATA */}
          {activeTab === 'specs' && (
            <div className="flex-1 overflow-auto bg-white rounded-2xl border border-[#E7DED5] p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E7DED5] pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#211B17] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#169B62]" />
                    Design Parameters & Quality Verification Sheet
                  </h3>
                  <p className="text-xs text-[#70665F]">
                    Manufacturing Quality Plan & Code Compliance Data
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-[#8C5229] bg-[#FAF0E6] px-3 py-1 rounded-full border border-[#E7DED5]">
                  Job: {jobRef}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E7DED5] space-y-2">
                  <span className="text-[10px] font-bold text-[#70665F] uppercase block tracking-wider">
                    PRESSURE & TEMPERATURE
                  </span>
                  <div className="flex justify-between font-mono">
                    <span className="text-[#70665F]">Design Internal Press:</span>
                    <strong className="text-[#211B17]">6.50 Bar (g)</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-[#70665F]">Hydraulic Test Press:</span>
                    <strong className="text-emerald-600">9.75 Bar (g) (1.5x)</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-[#70665F]">Design Temp Range:</span>
                    <strong className="text-[#211B17]">-10°C to +180°C</strong>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E7DED5] space-y-2">
                  <span className="text-[10px] font-bold text-[#70665F] uppercase block tracking-wider">
                    METALLURGY & CORROSION
                  </span>
                  <div className="flex justify-between font-mono">
                    <span className="text-[#70665F]">Shell & Head MOC:</span>
                    <strong className="text-[#0E91B2]">ASTM A240 Gr. 316L</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-[#70665F]">Jacket / Support MOC:</span>
                    <strong className="text-[#211B17]">IS 2062 E250BR / CS</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-[#70665F]">Corrosion Allowance:</span>
                    <strong className="text-[#211B17]">1.50 mm (Shell)</strong>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E7DED5] space-y-2">
                  <span className="text-[10px] font-bold text-[#70665F] uppercase block tracking-wider">
                    NDE & TESTING CODES
                  </span>
                  <div className="flex justify-between font-mono">
                    <span className="text-[#70665F]">Design Standard:</span>
                    <strong className="text-[#169B62]">ASME Sec VIII Div 1</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-[#70665F]">Radiography (RT):</span>
                    <strong className="text-[#211B17]">100% Spot Radiography</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-[#70665F]">DPI / Ultrasonic:</span>
                    <strong className="text-[#211B17]">100% Nozzle Weld Seams</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="bg-white border-t border-[#E7DED5] px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[#70665F]">
              Job Reference: <strong className="text-[#211B17]">{jobRef}</strong>
            </span>
            <span className="text-[#70665F]">•</span>
            <Link
              href={`/designer/bom?job=${jobRef}`}
              className="font-bold text-[#75401F] hover:underline inline-flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#75401F]" />
              <span>Open Master BOM</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EFE9] text-[#211B17] border border-[#E7DED5] font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-[#70665F]" />
              <span>Print A1 Blueprint</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-[#3E2723] hover:bg-[#2C1810] text-white font-bold flex items-center gap-2 transition cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Download {format} File ({drawing.fileSize || '4.8 MB'})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
