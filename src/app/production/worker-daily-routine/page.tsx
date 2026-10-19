'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { WorkerMaster, WorkerDailyRoutineEntry } from '../../../types/production';
import { formatDate } from '../../../lib/utils';
import {
  ClipboardList,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Search,
  Filter,
  Plus,
  Save,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Factory,
  FileSpreadsheet,
  AlertCircle,
  Send,
  HelpCircle,
  ExternalLink,
  CheckSquare,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';

// Default worker master list pre-seeded with all workers from the user's physical sheet + shopfloor trades up to ~100
const INITIAL_WORKER_MASTER: WorkerMaster[] = [
  { id: 'WRK-001', slNo: 1, workerName: 'AJAY YADAV', trade: 'Fitter / Bending', defaultShift: 'General', isActive: true },
  { id: 'WRK-002', slNo: 2, workerName: 'DHIRENDRA', trade: 'Fabricator', defaultShift: 'General', isActive: true },
  { id: 'WRK-003', slNo: 3, workerName: 'YAKUB KHAN', trade: 'Fitter', defaultShift: 'General', isActive: true },
  { id: 'WRK-004', slNo: 4, workerName: 'SURESH THAKOR', trade: 'Pipe Fabricator', defaultShift: 'General', isActive: true },
  { id: 'WRK-005', slNo: 5, workerName: 'KANU BHAI DAMOR', trade: 'Plasma / Cutting', defaultShift: 'General', isActive: true },
  { id: 'WRK-006', slNo: 6, workerName: 'KALUBHAI', trade: 'Plate Bending & Rolling', defaultShift: 'General', isActive: true },
  { id: 'WRK-007', slNo: 7, workerName: 'DHIRAJ', trade: 'Argon Welder', defaultShift: 'General', isActive: true },
  { id: 'WRK-008', slNo: 8, workerName: 'GOLU', trade: 'Helper / Grinder', defaultShift: 'General', isActive: true },
  { id: 'WRK-009', slNo: 9, workerName: 'MOHAN', trade: 'Angle Cutting & Bending', defaultShift: 'General', isActive: true },
  { id: 'WRK-010', slNo: 10, workerName: 'LAXMAN PATEL', trade: 'Laser / Bending', defaultShift: 'General', isActive: true },
  { id: 'WRK-011', slNo: 11, workerName: 'BALDEV JI RAVAR', trade: 'Grinder / Helper', defaultShift: 'General', isActive: true },
  { id: 'WRK-012', slNo: 12, workerName: 'JIGO DARBAR', trade: 'Glass Blasting / Grinding', defaultShift: 'General', isActive: true },
  { id: 'WRK-013', slNo: 13, workerName: 'ABHISHEK', trade: 'Patti Cutting & Grinding', defaultShift: 'General', isActive: true },
  { id: 'WRK-014', slNo: 14, workerName: 'CHANDAN', trade: 'Pipe Cutting & Fitting', defaultShift: 'General', isActive: true },
  { id: 'WRK-015', slNo: 15, workerName: 'NARESH PLASMA', trade: 'CNC Plasma Operator', defaultShift: 'General', isActive: true },
  { id: 'WRK-016', slNo: 16, workerName: 'GOLU / CHANDAN-2', trade: 'Welder', defaultShift: 'General', isActive: true },
  { id: 'WRK-017', slNo: 17, workerName: 'DHIRU BHAI', trade: 'Pin / Lathe Machining', defaultShift: 'General', isActive: true },
  { id: 'WRK-018', slNo: 18, workerName: 'BHARAT BHAI', trade: 'Helper / Material Shifting', defaultShift: 'General', isActive: true },
  { id: 'WRK-019', slNo: 19, workerName: 'RAHUL SINGH', trade: 'M.S. Arc Welder', defaultShift: 'General', isActive: true },
  { id: 'WRK-020', slNo: 20, workerName: 'UMA KANT', trade: 'Grinding / Bolting', defaultShift: 'General', isActive: true },
  { id: 'WRK-021', slNo: 21, workerName: 'VIKASH WELDER', trade: 'TIG / Argon Welder', defaultShift: 'General', isActive: true },
  { id: 'WRK-022', slNo: 22, workerName: 'SOMA BHAI', trade: 'SS Plant Helper / Housekeeping', defaultShift: 'General', isActive: true },
  { id: 'WRK-023', slNo: 23, workerName: 'PRAKASH SOLANKI', trade: 'Structural Fitter', defaultShift: 'General', isActive: true },
  { id: 'WRK-024', slNo: 24, workerName: 'MUKESH BARIYA', trade: 'Hydraulic Press Operator', defaultShift: 'General', isActive: true },
  { id: 'WRK-025', slNo: 25, workerName: 'VINOD PANCHAL', trade: 'Gas Cutter', defaultShift: 'General', isActive: true },
  { id: 'WRK-026', slNo: 26, workerName: 'SANJAY VAGHELA', trade: 'MIG Welder', defaultShift: 'General', isActive: true },
  { id: 'WRK-027', slNo: 27, workerName: 'RAMESH NAYAK', trade: 'Flange Fitter', defaultShift: 'General', isActive: true },
  { id: 'WRK-028', slNo: 28, workerName: 'HARESH PARMAR', trade: 'Surface Grinder', defaultShift: 'General', isActive: true },
  { id: 'WRK-029', slNo: 29, workerName: 'ALPESH RATHOD', trade: 'Crane Operator', defaultShift: 'General', isActive: true },
  { id: 'WRK-030', slNo: 30, workerName: 'JAGDISH PRAJAPATI', trade: 'Plate Marker', defaultShift: 'General', isActive: true },
];

// Sample default work descriptions from the photo for initial display
const SAMPLE_PREFILLED_ROUTINES: Record<string, string> = {
  'WRK-001': 'UTF-26-138 ગ્લાસ ટાંકી ટોપિંગ, એંગલ - 4 Nos બેન્ડીંગ M.S. જીબી ૨૦ S.S. 304 રોલ બેન્ડીંગ - 1 Nos.',
  'WRK-002': 'Absent',
  'WRK-003': 'Absent',
  'WRK-004': '23-293 ગ્લાસ બિડિંગ, 26-127 સપોર્ટિંગ, 2 નંગ પાઇપ કટીંગ, 40x40 ની 2 નંગ પાઇપ કટીંગ...',
  'WRK-005': '26-101 50x50 ની ડ્રોઇંગ પાઇપ કટીંગ, 6 નંગ પાઇપમાં હોલિંગ, 2 નંગ રિંગ બનાવ્યા, 35 નંગ પાઇપ કટીંગ...',
  'WRK-006': 'સ્ટીલ કાર્બન રોલ - 2 Nos બેન્ડીંગ રોલિંગ - 1 નંગ મોડલ રોલિંગ પાટા રોલિંગ.',
  'WRK-007': 'સ્ટીલ કાર્બન રોલ - 2 Nos વેલ્ડિંગ આર્ગોન, બોટમ મોડલ પટ્ટી માં આર્ગોન વેલ્ડિંગ.',
  'WRK-008': 'બીમાર હોવાથી 1 વાગે ઘરે ગયો. એપ્લિકેશન સબમિટ કરી.',
  'WRK-009': '26-128 100x50 ની એંગલ કટીંગ, 2 નંગ બેન્ડીંગ, 26-136 100x200 I બીમનાં સપોર્ટ કટીંગ અને હોલિંગ...',
  'WRK-010': '26-101 2 નંગ સીલી નાં બેન્ડીંગ (લેસર કટીંગ) 2 નંગ સ્ટેન્ડ બનાવ્યા, 26-138 ચેનલ કટીંગ કામ ચાલુ.',
  'WRK-011': 'Absent',
  'WRK-012': '25-49 ગ્લાસ બિડિંગ ચાર કટકામાં ગ્લાસ બિડિંગ ઓકે કર્યું, હોપરમાં ગ્લાસ બિડિંગ ઓકે...',
  'WRK-013': '25-49 પાયાની પટ્ટી કટીંગ કરી રોલિંગ કરી, પાયા ફિટિંગ કામ ચાલુ.',
  'WRK-014': '26-116 પ્લેટ કટીંગ કરી બ્રેકેટ બનાવ્યા, 26-45 સપોર્ટનું માર્કિંગ, ગ્રાઇન્ડિંગ અને કટીંગ.',
  'WRK-015': 'Absent',
  'WRK-016': '26-75 શિફ્ટિંગ 1 નંગ વેલ્ડિંગ પૂરું, 1 વાગે રજા ઉપર બીમાર હોવાથી.',
  'WRK-017': '26-116 6 નંગ પીન બનાવી ખોટા કર્યા, 26-10 ભુસ માં ખોલ્યા, 1 વાગે ઘરે ગયા.',
  'WRK-018': 'પ્લાન્ટ માં હેલ્પર તરીકે રો મટિરિયલ શિફ્ટિંગ અને સફાઈ કામ કર્યું.',
  'WRK-019': 'UTF-26-180, 181 - M.S. બોક્સ - 6 Nos આર્ક વેલ્ડિંગ. UTF-26-135 રોલ માં બહારથી વેલ્ડિંગ.',
  'WRK-020': 'UTF-26-138 બોટમ 3mm પટ્ટી માં ગ્રાઇન્ડિંગ, UTF-26-129 ગ્રાઇન્ડિંગ અને બોલ્ટિંગ.',
  'WRK-021': '26-130 1 નંગ ડિશ 10 ઇંચ માં વેલ્ડિંગ, 2 ડિશ માં 4 નંગ કનેક્શન વેલ્ડિંગ. 26-136 આર્ગોન વેલ્ડિંગ.',
  'WRK-022': 'SS પ્લાન્ટ માં હેલ્પર, સાફ સફાઈ કરી, ડીલ મો.',
};

// Quick chips in Gujarati for rapid supervisor entry
const GUJARATI_QUICK_CHIPS = [
  'ગ્લાસ ટાંકી ટોપિંગ એંગલ બેન્ડીંગ (4 Nos)',
  'પાઇપ કટીંગ અને ગ્રાઇન્ડિંગ',
  'પ્લેટ કટીંગ અને બેન્ડીંગ કામ પૂરું',
  'સીમ વેલ્ડિંગ અને જોઈન્ટ ટાંકા',
  'આર્ગોન વેલ્ડિંગ (Argon Welding Done)',
  'નોઝલ અને ફ્લેંજ ફિટમેન્ટ કમ્પ્લીટ',
  'હાઇડ્રો અને એનડીટી ટેસ્ટ ક્લિયર',
  'SS પ્લાન્ટ માં હેલ્પર, સાફ સફાઈ',
  'બીમાર હોવાથી 1 વાગે ઘરે ગયો',
  'ઓવરટાઇમ 2 કલાક કર્યો (2 Hrs OT)',
];

export default function WorkerDailyRoutinePage() {
  const { projectJobs } = useERP();

  // Current Date Selection (Defaults to Today or 2026-08-26 for demo matching photo)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Supervisor Name
  const [supervisorName, setSupervisorName] = useState<string>('Mahesh Parmar (Production Supervisor)');

  // Master Workers List
  const [workers, setWorkers] = useState<WorkerMaster[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('UMA_ERP_workerMasterList');
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return INITIAL_WORKER_MASTER;
  });

  // Daily Routines Map: Date -> Record<WorkerId, WorkerDailyRoutineEntry>
  const [dailyRoutines, setDailyRoutines] = useState<Record<string, Record<string, WorkerDailyRoutineEntry>>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('UMA_ERP_workerDailyRoutines');
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }

    // Default initialization with user's photo records for today
    const today = new Date().toISOString().split('T')[0];
    const initialToday: Record<string, WorkerDailyRoutineEntry> = {};
    INITIAL_WORKER_MASTER.forEach((w) => {
      const sampleText = SAMPLE_PREFILLED_ROUTINES[w.id];
      const isAbsent = sampleText === 'Absent';
      initialToday[w.id] = {
        id: `RUT-${today}-${w.id}`,
        date: today,
        workerId: w.id,
        slNo: w.slNo,
        workerName: w.workerName,
        trade: w.trade,
        shiftStatus: isAbsent ? 'Absent' : 'Present',
        shiftType: 'General',
        workDetails: sampleText || (isAbsent ? 'Absent' : ''),
        isVerified: !isAbsent,
        supervisorName: 'Mahesh Parmar',
        updatedAt: new Date().toISOString(),
      };
    });

    return { [today]: initialToday };
  });

  // Save to LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('UMA_ERP_workerMasterList', JSON.stringify(workers));
      } catch (_) {}
    }
  }, [workers]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('UMA_ERP_workerDailyRoutines', JSON.stringify(dailyRoutines));
      } catch (_) {}
    }
  }, [dailyRoutines]);

  // Current Day's Entries Map
  const currentDayEntries = useMemo(() => {
    return dailyRoutines[selectedDate] || {};
  }, [dailyRoutines, selectedDate]);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Present' | 'Absent' | 'Half Day'>('all');
  const [tradeFilter, setTradeFilter] = useState('all');

  // Add Worker Modal
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerTrade, setNewWorkerTrade] = useState('Fitter');

  // Print Mode State
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Ensure entries exist for the selected date
  const getOrCreateEntry = (worker: WorkerMaster): WorkerDailyRoutineEntry => {
    if (currentDayEntries[worker.id]) {
      return currentDayEntries[worker.id];
    }
    return {
      id: `RUT-${selectedDate}-${worker.id}`,
      date: selectedDate,
      workerId: worker.id,
      slNo: worker.slNo,
      workerName: worker.workerName,
      trade: worker.trade,
      shiftStatus: 'Present',
      shiftType: 'General',
      workDetails: '',
      isVerified: false,
      supervisorName,
      updatedAt: new Date().toISOString(),
    };
  };

  // Update routine field
  const handleUpdateRoutine = (
    workerId: string,
    field: keyof WorkerDailyRoutineEntry,
    value: any
  ) => {
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return;

    const existing = getOrCreateEntry(worker);
    const updated: WorkerDailyRoutineEntry = {
      ...existing,
      [field]: value,
      updatedAt: new Date().toISOString(),
    };

    // If shiftStatus is set to Absent, auto-set workDetails to 'Absent'
    if (field === 'shiftStatus' && value === 'Absent') {
      updated.workDetails = 'Absent';
      updated.isVerified = false;
    } else if (field === 'shiftStatus' && value === 'Present' && updated.workDetails === 'Absent') {
      updated.workDetails = '';
    }

    setDailyRoutines((prev) => ({
      ...prev,
      [selectedDate]: {
        ...(prev[selectedDate] || {}),
        [workerId]: updated,
      },
    }));
  };

  // Quick Absent One-Click
  const handleToggleAbsent = (workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return;
    const current = getOrCreateEntry(worker);
    const newStatus = current.shiftStatus === 'Absent' ? 'Present' : 'Absent';
    handleUpdateRoutine(workerId, 'shiftStatus', newStatus);
  };

  // Toggle Verification Checkmark
  const handleToggleVerify = (workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return;
    const current = getOrCreateEntry(worker);
    handleUpdateRoutine(workerId, 'isVerified', !current.isVerified);
  };

  // Append Quick Chip text to a worker's workDetails
  const handleAppendChip = (workerId: string, chipText: string) => {
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return;
    const current = getOrCreateEntry(worker);
    const prevText = current.workDetails === 'Absent' ? '' : current.workDetails;
    const newText = prevText ? `${prevText}, ${chipText}` : chipText;
    handleUpdateRoutine(workerId, 'workDetails', newText);
    if (current.shiftStatus === 'Absent') {
      handleUpdateRoutine(workerId, 'shiftStatus', 'Present');
    }
  };

  // Bulk Actions
  const handleMarkAllPresent = () => {
    const updatedMap = { ...(dailyRoutines[selectedDate] || {}) };
    workers.forEach((w) => {
      const entry = updatedMap[w.id] || getOrCreateEntry(w);
      if (entry.shiftStatus === 'Absent') {
        updatedMap[w.id] = {
          ...entry,
          shiftStatus: 'Present',
          workDetails: entry.workDetails === 'Absent' ? '' : entry.workDetails,
          updatedAt: new Date().toISOString(),
        };
      }
    });
    setDailyRoutines((prev) => ({ ...prev, [selectedDate]: updatedMap }));
    showToast('All workers marked Present for this date.');
  };

  const handleVerifyAll = () => {
    const updatedMap = { ...(dailyRoutines[selectedDate] || {}) };
    workers.forEach((w) => {
      const entry = updatedMap[w.id] || getOrCreateEntry(w);
      updatedMap[w.id] = { ...entry, isVerified: true, updatedAt: new Date().toISOString() };
    });
    setDailyRoutines((prev) => ({ ...prev, [selectedDate]: updatedMap }));
    showToast('All daily entries marked Verified (✓).');
  };

  // Add Worker Submit
  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim()) return;

    const newWorker: WorkerMaster = {
      id: `WRK-${String(workers.length + 1).padStart(3, '0')}`,
      slNo: workers.length + 1,
      workerName: newWorkerName.trim().toUpperCase(),
      trade: newWorkerTrade,
      defaultShift: 'General',
      isActive: true,
    };

    setWorkers((prev) => [...prev, newWorker]);
    setNewWorkerName('');
    setShowAddWorkerModal(false);
    showToast(`Worker ${newWorker.workerName} added successfully.`);
  };

  // Date Navigation
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Filtered Workers for Display
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      const entry = currentDayEntries[w.id] || { shiftStatus: 'Present', workDetails: '' };

      if (statusFilter !== 'all' && entry.shiftStatus !== statusFilter) return false;
      if (tradeFilter !== 'all' && !w.trade.toLowerCase().includes(tradeFilter.toLowerCase())) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = w.workerName.toLowerCase().includes(q);
        const matchTrade = w.trade.toLowerCase().includes(q);
        const matchWork = (entry.workDetails || '').toLowerCase().includes(q);
        const matchSl = String(w.slNo) === q;
        if (!matchName && !matchTrade && !matchWork && !matchSl) return false;
      }

      return true;
    });
  }, [workers, currentDayEntries, statusFilter, tradeFilter, searchTerm]);

  // Summary Metrics for the Selected Date
  const dayMetrics = useMemo(() => {
    let present = 0;
    let absent = 0;
    let halfDay = 0;
    let verified = 0;
    let filledWork = 0;

    workers.forEach((w) => {
      const entry = currentDayEntries[w.id] || { shiftStatus: 'Present', workDetails: '', isVerified: false };
      if (entry.shiftStatus === 'Absent') absent++;
      else if (entry.shiftStatus === 'Half Day') {
        halfDay++;
        if (entry.workDetails && entry.workDetails !== 'Absent') filledWork++;
      } else {
        present++;
        if (entry.workDetails && entry.workDetails !== 'Absent') filledWork++;
      }
      if (entry.isVerified) verified++;
    });

    return {
      total: workers.length,
      present,
      absent,
      halfDay,
      verified,
      filledWork,
    };
  }, [workers, currentDayEntries]);

  // Format Date for Display (e.g., 26/08/2026)
  const formattedDisplayDate = useMemo(() => {
    if (!selectedDate) return '';
    const parts = selectedDate.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return selectedDate;
  }, [selectedDate]);

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#211B17] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[#EBE3DB]/20 text-xs animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-0.5">
            DASHBOARD / PRODUCTION &amp; SHOP FLOOR / WORKER DAILY ROUTINE
          </div>
          <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-amber-600" />
            <span>Worker Profile Daily Routine (વર્કર ડેઇલી રૂટીન)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300 font-mono">
              ~100 Workers
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily shopfloor labor diary. Supervisor logs each worker's daily assigned work, attendance, job numbers, and output details date-wise.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white border border-[#EBE3DB] hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Print Routine Sheet matching physical form"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Sheet (પ્રિન્ટ)</span>
          </button>
          <button
            onClick={() => setShowAddWorkerModal(true)}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Worker</span>
          </button>
          <Link
            href="/production/supervisor-tasks"
            className="px-3.5 py-2 bg-[#211B17] text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs hover:bg-black"
          >
            <Factory className="w-3.5 h-3.5 text-amber-400" />
            <span>Supervisor Tasks</span>
          </Link>
        </div>
      </div>

      {/* DATE CONTROLLER & SHEET HEADER (Matching exact handwriting format: DATE: 26/8/26) */}
      <div className="bg-[#211B17] text-white p-4 rounded-2xl shadow-md border border-[#EBE3DB]/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Sheet Title */}
          <div>
            <div className="text-[10px] uppercase tracking-widest text-amber-400 font-mono font-bold">
              SHOPFLOOR DAILY OPERATIONS RECORD
            </div>
            <div className="text-xl font-black tracking-wider uppercase text-white font-mono mt-0.5">
              WORK PROFILE DAILY ROUTINE
            </div>
            <div className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
              <span>Supervisor:</span>
              <strong className="text-amber-300 font-semibold">{supervisorName}</strong>
            </div>
          </div>

          {/* Date Selector Navigation Bar */}
          <div className="flex flex-wrap items-center gap-2 bg-white/10 p-2 rounded-xl border border-white/15">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Previous Day"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-white text-slate-900 rounded-lg font-mono font-black text-sm shadow-inner">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>DATE: {formattedDisplayDate}</span>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1 bg-white/20 text-white text-xs font-mono font-semibold rounded-lg border border-white/20 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />

            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Next Day"
            >
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-2.5 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-[#211B17] rounded-lg transition cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Workers</span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-[#211B17]">{dayMetrics.total}</div>
          <div className="text-[11px] text-slate-500">On Roll Workers</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Present (હાજર)</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{dayMetrics.present}</div>
          <div className="text-[11px] text-slate-500">Working on Shopfloor</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Absent (ગેરહાજર)</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">{dayMetrics.absent}</div>
          <div className="text-[11px] text-slate-500">Marked Absent Today</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Work Logged</span>
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700">
            {dayMetrics.filledWork}{' '}
            <span className="text-sm font-semibold text-slate-400">/ {dayMetrics.present}</span>
          </div>
          <div className="text-[11px] text-slate-500">Detailed Tasks Written</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Verified (✓)</span>
            <CheckSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700">
            {dayMetrics.verified}{' '}
            <span className="text-sm font-semibold text-slate-400">/ {dayMetrics.total}</span>
          </div>
          <div className="text-[11px] text-slate-500">Supervisor Checked</div>
        </div>
      </div>

      {/* QUICK BULK ACTIONS & SEARCH / FILTER BAR */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Worker Name, Job No (e.g. 26-138)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-[#211B17]"
            />
          </div>

          {/* Quick Bulk Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>
            <button
              type="button"
              onClick={handleVerifyAll}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Verify All (✓)</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Workers ({workers.length})</option>
              <option value="Present">Present (હાજર) ({dayMetrics.present})</option>
              <option value="Absent">Absent (ગેરહાજર) ({dayMetrics.absent})</option>
              <option value="Half Day">Half Day ({dayMetrics.halfDay})</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Trade / Category:</span>
            <select
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Trades</option>
              <option value="Fitter">Fitter / Fabricator</option>
              <option value="Welder">Welder (Argon/MIG/Arc)</option>
              <option value="Plasma">Plasma / Laser / Cutting</option>
              <option value="Rolling">Plate Bending & Rolling</option>
              <option value="Grinder">Grinding / Finishing</option>
              <option value="Helper">Helper / Shifting</option>
            </select>
          </div>

          {/* Quick preset chips to quickly click & paste */}
          <div className="hidden lg:flex items-center gap-1 ml-auto overflow-x-auto max-w-xl py-0.5">
            <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">Gujarati Quick Words:</span>
            {GUJARATI_QUICK_CHIPS.slice(0, 3).map((chip, cIdx) => (
              <span
                key={cIdx}
                className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[10px] font-medium whitespace-nowrap cursor-default"
                title="Use inside worker work details row"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN TABLE: EXACT MATCH WITH PHYSICAL SHEET "WORK PROFILE DAILY ROUTINE"   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border-2 border-slate-800 shadow-md overflow-hidden print:border-black print:rounded-none">
        {/* Printable Sheet Header (visible in print mode or standard) */}
        <div className="hidden print:block p-4 border-b-2 border-black text-center">
          <h2 className="text-xl font-black uppercase tracking-wider font-mono">
            UMA ENGINEERING — WORK PROFILE DAILY ROUTINE
          </h2>
          <div className="flex justify-between items-center text-xs font-mono font-bold mt-2">
            <span>SUPERVISOR: {supervisorName}</span>
            <span>DATE: {formattedDisplayDate}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-800 text-slate-900 font-black uppercase text-xs tracking-wider">
                <th className="py-2.5 px-3 w-14 text-center border-r border-slate-300">
                  SL NO.
                </th>
                <th className="py-2.5 px-3.5 min-w-[200px] border-r border-slate-300">
                  NAME (કારીગરનું નામ)
                </th>
                <th className="py-2.5 px-2 w-12 text-center border-r border-slate-300" title="Trade / Type">
                  T
                </th>
                <th className="py-2.5 px-2 w-14 text-center border-r border-slate-300" title="Shift / Status">
                  S
                </th>
                <th className="py-2.5 px-4 min-w-[420px] border-r border-slate-300">
                  WORKER (ડેઇલી રૂટીન કાર્ય વર્ણન / Job Details)
                </th>
                <th className="py-2.5 px-3 w-20 text-center print:hidden">
                  VERIFIED (✓)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-sm">No workers found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try clearing your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredWorkers.map((worker) => {
                  const entry = getOrCreateEntry(worker);
                  const isAbsent = entry.shiftStatus === 'Absent';
                  const isHalfDay = entry.shiftStatus === 'Half Day';
                  const isVerified = entry.isVerified;

                  return (
                    <tr
                      key={worker.id}
                      className={`hover:bg-amber-50/40 transition group border-b border-slate-300 ${
                        isAbsent ? 'bg-rose-50/30' : isVerified ? 'bg-emerald-50/15' : ''
                      }`}
                    >
                      {/* 1. SL NO. (Serial Number) */}
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 border-r border-slate-300 align-top">
                        <div className="flex items-center justify-center gap-1">
                          {/* Checked Checkmark icon on left edge just like handwriting on sheet */}
                          {isVerified ? (
                            <span className="text-emerald-700 font-bold text-sm">✓</span>
                          ) : (
                            <span className="text-slate-300 text-xs">•</span>
                          )}
                          <span>{worker.slNo}</span>
                        </div>
                      </td>

                      {/* 2. NAME (Worker Name + Trade Badge) */}
                      <td className="py-2.5 px-3.5 border-r border-slate-300 align-top">
                        <div className="space-y-0.5">
                          <span
                            className={`font-black tracking-wide block text-xs ${
                              isAbsent ? 'text-rose-900 line-through opacity-80' : 'text-slate-900'
                            }`}
                          >
                            {worker.workerName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            {worker.trade}
                          </span>
                        </div>
                      </td>

                      {/* 3. T (Trade / Type Code) */}
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-600 border-r border-slate-300 align-top">
                        <span
                          className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] border border-slate-200"
                          title={worker.trade}
                        >
                          {worker.trade.slice(0, 3).toUpperCase()}
                        </span>
                      </td>

                      {/* 4. S (Shift / Status: P / A / HD) */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-300 align-top font-mono">
                        <button
                          type="button"
                          onClick={() => handleToggleAbsent(worker.id)}
                          className={`w-8 h-7 rounded font-black text-xs transition cursor-pointer border flex items-center justify-center mx-auto active:scale-95 ${
                            isAbsent
                              ? 'bg-rose-600 text-white border-rose-700'
                              : isHalfDay
                              ? 'bg-amber-500 text-white border-amber-600'
                              : 'bg-emerald-600 text-white border-emerald-700'
                          }`}
                          title={`Click to toggle: currently ${entry.shiftStatus}`}
                        >
                          {isAbsent ? 'A' : isHalfDay ? 'HD' : 'P'}
                        </button>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          {isAbsent ? 'ગેરહાજર' : isHalfDay ? 'અડધો' : 'હાજર'}
                        </span>
                      </td>

                      {/* 5. WORKER (Work Profile / Routine Job Description) */}
                      <td className="py-2.5 px-4 border-r border-slate-300 align-top">
                        {isAbsent ? (
                          <div className="flex items-center justify-between py-1 px-3 bg-rose-50 border border-rose-200 rounded-lg">
                            <span className="font-serif italic font-bold text-rose-700 text-sm tracking-wide">
                              Absent
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleAbsent(worker.id)}
                              className="text-[10px] text-blue-700 hover:underline font-semibold cursor-pointer"
                            >
                              Mark Present instead
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {/* Text Input / Textarea for detailed work */}
                            <textarea
                              rows={2}
                              value={entry.workDetails}
                              onChange={(e) =>
                                handleUpdateRoutine(worker.id, 'workDetails', e.target.value)
                              }
                              placeholder="દા.ત. UTF-26-138 4 Nos એંગલ કટીંગ, બેન્ડીંગ કામ પૂરું..."
                              className="w-full px-2.5 py-1.5 bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 transition resize-y"
                            />

                            {/* Gujarati Fast Chip Suggestions for this Worker */}
                            <div className="flex flex-wrap items-center gap-1 print:hidden">
                              <span className="text-[9.5px] text-slate-400 font-semibold mr-0.5">
                                + ક્વિક ટેક્સ્ટ:
                              </span>
                              {GUJARATI_QUICK_CHIPS.slice(0, 4).map((chip, chIdx) => (
                                <button
                                  key={chIdx}
                                  type="button"
                                  onClick={() => handleAppendChip(worker.id, chip)}
                                  className="px-1.5 py-0.2 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-900 border border-slate-200 rounded text-[9.5px] transition cursor-pointer"
                                >
                                  {chip}
                                </button>
                              ))}

                              {/* Quick One-Click Absent button inside row */}
                              <button
                                type="button"
                                onClick={() => handleToggleAbsent(worker.id)}
                                className="px-1.5 py-0.2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[9.5px] font-bold transition cursor-pointer ml-auto"
                              >
                                ✕ Absent કરો
                              </button>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 6. VERIFIED (Supervisor Checkmark ✓) */}
                      <td className="py-2.5 px-3 text-center align-top print:hidden">
                        <button
                          type="button"
                          onClick={() => handleToggleVerify(worker.id)}
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center mx-auto transition cursor-pointer active:scale-90 ${
                            isVerified
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-400 border-slate-300'
                          }`}
                          title={isVerified ? 'Verified by Supervisor' : 'Click to verify'}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <span className="text-[9.5px] text-slate-400 block mt-1 font-mono">
                          {isVerified ? 'Checked' : 'Check'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="p-3.5 bg-slate-100 border-t-2 border-slate-800 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Showing <strong>{filteredWorkers.length}</strong> of <strong>{workers.length}</strong> workers on register for DATE: <strong>{formattedDisplayDate}</strong>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Auto-saved in ERP database • Supervisor Signature: __________________
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW WORKER                                                     */}
      {/* ========================================================================= */}
      {showAddWorkerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#EBE3DB] w-full max-w-md overflow-hidden">
            <div className="bg-[#211B17] text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span>Add New Shopfloor Worker (નવો વર્કર ઉમેરો)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddWorkerModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWorker} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Worker Full Name (કારીગરનું પૂરું નામ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PRAKASH PARMAR"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold uppercase focus:ring-2 focus:ring-amber-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Trade / Skill (કામનો પ્રકાર / ટ્રેડ)
                </label>
                <select
                  value={newWorkerTrade}
                  onChange={(e) => setNewWorkerTrade(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-amber-500 text-slate-900"
                >
                  <option value="Fitter">Fitter / Fabricator (ફિટર)</option>
                  <option value="TIG / Argon Welder">TIG / Argon Welder (આર્ગોન વેલ્ડર)</option>
                  <option value="MIG / Arc Welder">MIG / Arc Welder (વેલ્ડર)</option>
                  <option value="Plasma / Cutting">Plasma / Laser Cutter (કટીંગ)</option>
                  <option value="Plate Bending & Rolling">Plate Bending &amp; Rolling (રોલિંગ)</option>
                  <option value="Lathe / Machinist">Lathe / Machinist (ટર્નર/મશીનિસ્ટ)</option>
                  <option value="Surface Grinder">Surface Grinder (ગ્રાઇન્ડર)</option>
                  <option value="Helper / Shifting">Helper / Housekeeping (હેલ્પર)</option>
                  <option value="Crane Operator">Crane Operator (ક્રેન ઓપરેટર)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddWorkerModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
