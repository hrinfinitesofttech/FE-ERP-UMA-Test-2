'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { api } from '../../../lib/apiClient';
import { WorkerMaster, WorkerDailyRoutineEntry } from '../../../types/production';
import { formatDate } from '../../../lib/utils';
import { printContent } from '../../../lib/printUtils';
import { ERPDatePicker } from '../../../components/ui/ERPDatePicker';
import {
  ClipboardList,
  Calendar,
  CalendarRange,
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
  Download,
  UserCheck,
  UserX,
  X,
  CheckSquare,
  ChevronDown,
  Layers,
  CheckCheck,
  RefreshCw,
  Loader2,
  MoreVertical,
} from 'lucide-react';

// Global quick presets toolbar
const WORK_QUICK_PRESETS = [
  'Angle cutting & bending',
  'Pipe cutting and grinding',
  'Plate cutting & bending complete',
  'Seam welding and tacking',
  'TIG / Argon welding complete',
  'Nozzle & flange fitment complete',
  'Dish end welding & beveling',
  'Hydro / NDT test support',
  'Shopfloor shifting & cleaning',
  '2 Hours Overtime completed',
];

// Open job number suggestions (dynamically merged with ERP Context jobs)
const COMMON_OPEN_JOBS = [
  'UTF-26-138',
  'UTF-26-116',
  'UTF-26-180',
  'UTF-26-135',
  '26-101',
  '26-127',
  '26-128',
  '26-130',
  '26-136',
  '25-49',
  '23-293',
  'GEN-SHOP',
];

export default function WorkerDailyRoutinePage() {
  const { projectJobs } = useERP();

  // Active Tab: 'daily' | 'monthly'
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');

  // Current Date Selection (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Monthly View Selection (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // Supervisor Name
  const [supervisorName, setSupervisorName] = useState<string>('Mahesh Parmar (Production Supervisor)');

  // Selected Worker ID for Preset insertion & Keyboard focus
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');

  // API Loading & Saving status
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [savingWorkerId, setSavingWorkerId] = useState<string | null>(null);
  const [savedWorkerIds, setSavedWorkerIds] = useState<Record<string, boolean>>({});

  // Master Workers List (100% from API / Database)
  const [workers, setWorkers] = useState<WorkerMaster[]>([]);

  // Daily Routines Map: Date -> Record<WorkerId, WorkerDailyRoutineEntry> (100% from API / Database)
  const [dailyRoutines, setDailyRoutines] = useState<Record<string, Record<string, WorkerDailyRoutineEntry>>>({});

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Present' | 'Absent' | 'Half Day' | 'Weekly Off' | 'unlogged' | 'unverified' | 'verified'>('all');
  const [tradeFilter, setTradeFilter] = useState('all');

  // Modals state
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerTrade, setNewWorkerTrade] = useState('Fitter / Fabricator');
  const [editingWorker, setEditingWorker] = useState<WorkerMaster | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Debounce ref for syncing updates to API
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<Record<string, WorkerDailyRoutineEntry>>({});

  // 1. FETCH WORKERS MASTER FROM API (Database)
  const fetchWorkers = useCallback(async () => {
    try {
      const data = await api.production.workers.list({ isActive: true });
      if (Array.isArray(data)) {
        setWorkers(data);
        if (data.length > 0 && !selectedWorkerId) {
          setSelectedWorkerId(data[0].id);
        }
      }
    } catch (err: any) {
      console.error('Failed to load workers from API:', err);
      showToast('Could not fetch workers from database', 'error');
    }
  }, [selectedWorkerId]);

  // 2. FETCH DAILY ROUTINES FOR SELECTED DATE FROM API (Database)
  const fetchRoutinesForDate = useCallback(async (dateToFetch: string) => {
    try {
      setIsRefreshing(true);
      const data = await api.production.workerRoutines.list({ date: dateToFetch });
      if (Array.isArray(data)) {
        const dateMap: Record<string, WorkerDailyRoutineEntry> = {};
        const savedMap: Record<string, boolean> = {};
        data.forEach((item: any) => {
          let wId = item.workerId || item.worker_id_code || item.worker || '';
          if (wId && wId.includes('WRK-')) {
            const m = wId.match(/WRK-\d+/);
            if (m) wId = m[0];
          } else if (item.id && item.id.includes('WRK-')) {
            const m = item.id.match(/WRK-\d+/);
            if (m) wId = m[0];
          }

          if (wId) {
            const hasDetails = (item.workDetails && item.workDetails.trim() !== '') || (item.work_details && item.work_details.trim() !== '');
            const hasJob = Boolean(item.jobNo || item.job_no || item.jobOrProjectNo);
            dateMap[wId] = {
              id: item.id || `RUT-${dateToFetch}-${wId}`,
              date: item.date || dateToFetch,
              workerId: wId,
              slNo: item.slNo || item.sl_no || 1,
              workerName: item.workerName || item.worker_name || '',
              trade: item.trade || '',
              shiftStatus: item.shiftStatus || item.shift_status || 'Present',
              shiftType: item.shiftType || item.shift_type || 'General',
              jobOrProjectNo: item.jobNo || item.job_no || item.jobOrProjectNo || '',
              workDetails: item.workDetails || item.work_details || '',
              quantityNos: item.quantityNos || item.quantity_nos || '',
              hoursWorked: item.hoursWorked || item.hours_worked || 8,
              overtimeHours: item.overtimeHours || item.overtime_hours || 0,
              isVerified: Boolean(item.isVerified || item.is_verified),
              supervisorName: item.supervisorName || item.supervisor_name || 'Mahesh Parmar',
              updatedAt: item.updatedAt || item.updated_at || '',
            };
            if (hasDetails || hasJob || Boolean(item.isVerified || item.is_verified)) {
              savedMap[wId] = true;
            }
          }
        });

        setDailyRoutines((prev) => ({
          ...prev,
          [dateToFetch]: dateMap,
        }));
        setSavedWorkerIds((prev) => ({ ...prev, ...savedMap }));
      }
    } catch (err: any) {
      console.error('Failed to load daily routines from API:', err);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  // 3. FETCH MONTHLY ATTENDANCE FOR MONTHLY GRID FROM API (Database)
  const fetchRoutinesForMonth = useCallback(async (monthToFetch: string) => {
    try {
      setIsRefreshing(true);
      const data = await api.production.workerRoutines.list({ month: monthToFetch });
      if (Array.isArray(data)) {
        setDailyRoutines((prev) => {
          const updated = { ...prev };
          data.forEach((item: any) => {
            const d = item.date;
            const wId = item.workerId || item.worker_id_code || item.worker;
            if (d && wId) {
              if (!updated[d]) updated[d] = {};
              updated[d][wId] = {
                id: item.id,
                date: d,
                workerId: wId,
                slNo: item.slNo || item.sl_no || 1,
                workerName: item.workerName || item.worker_name || '',
                trade: item.trade || '',
                shiftStatus: item.shiftStatus || item.shift_status || 'Present',
                shiftType: item.shiftType || item.shift_type || 'General',
                jobOrProjectNo: item.jobNo || item.job_no || '',
                workDetails: item.workDetails || item.work_details || '',
                quantityNos: item.quantityNos || item.quantity_nos || '',
                isVerified: Boolean(item.isVerified || item.is_verified),
              };
            }
          });
          return updated;
        });
      }
    } catch (err: any) {
      console.error('Failed to load monthly routines from API:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // Load Date Routines when selectedDate changes
  useEffect(() => {
    if (activeTab === 'daily') {
      fetchRoutinesForDate(selectedDate);
    }
  }, [selectedDate, activeTab, fetchRoutinesForDate]);

  // Load Month Routines when selectedMonth changes
  useEffect(() => {
    if (activeTab === 'monthly') {
      fetchRoutinesForMonth(selectedMonth);
    }
  }, [selectedMonth, activeTab, fetchRoutinesForMonth]);

  // Available job numbers (merge ERP jobs + common open jobs)
  const availableJobNumbers = useMemo(() => {
    const set = new Set<string>(COMMON_OPEN_JOBS);
    if (projectJobs && Array.isArray(projectJobs)) {
      projectJobs.forEach((j: any) => {
        if (j.jobNumber) set.add(j.jobNumber);
        if (j.jobNo) set.add(j.jobNo);
      });
    }
    return Array.from(set);
  }, [projectJobs]);

  // Current Day's Entries Map
  const currentDayEntries = useMemo(() => {
    return dailyRoutines[selectedDate] || {};
  }, [dailyRoutines, selectedDate]);

  // Ensure entry helper
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
      jobOrProjectNo: '',
      workDetails: '',
      quantityNos: '',
      isVerified: false,
      supervisorName,
      updatedAt: new Date().toISOString(),
    };
  };

  // Flush pending updates to Database API
  const flushUpdatesToApi = useCallback(async () => {
    const entriesToSave = Object.values(pendingUpdatesRef.current);
    if (entriesToSave.length === 0) return;

    setSaveStatus('saving');
    try {
      await api.production.workerRoutines.bulkUpsert(entriesToSave);
      pendingUpdatesRef.current = {};
      setSaveStatus('saved');
    } catch (err: any) {
      console.error('Failed to sync routine update to database:', err);
      setSaveStatus('error');
      showToast('Error saving to database. Retrying...', 'error');
    }
  }, []);

  // Update routine field with instant UI response + debounced API save
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

    // If shiftStatus is set to Absent or Weekly Off, clear/lock work
    if (field === 'shiftStatus') {
      if (value === 'Absent') {
        updated.workDetails = 'Absent';
        updated.jobOrProjectNo = '';
        updated.isVerified = false;
      } else if (value === 'Weekly Off') {
        updated.workDetails = 'Weekly Off';
        updated.jobOrProjectNo = '';
        updated.isVerified = false;
      } else if (value === 'Present' || value === 'Half Day') {
        if (updated.workDetails === 'Absent' || updated.workDetails === 'Weekly Off') {
          updated.workDetails = '';
        }
      }
    }

    // 1. Instant optimistic UI update
    setDailyRoutines((prev) => ({
      ...prev,
      [selectedDate]: {
        ...(prev[selectedDate] || {}),
        [workerId]: updated,
      },
    }));

    // Mark as unsaved for this worker so the button shows "Save"
    setSavedWorkerIds((prev) => ({ ...prev, [workerId]: false }));

    // 2. Queue for database save
    pendingUpdatesRef.current[workerId] = updated;
    setSaveStatus('saving');

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      flushUpdatesToApi();
    }, 600);
  };

  // Bulk: Mark All Present in Database
  const handleMarkAllPresent = async () => {
    setSaveStatus('saving');
    try {
      await api.production.workerRoutines.markAllPresent(selectedDate);
      await fetchRoutinesForDate(selectedDate);
      setSaveStatus('saved');
      showToast('All workers marked Present in database.');
    } catch (err: any) {
      console.error('Error marking all present:', err);
      setSaveStatus('error');
      showToast('Failed to mark all present in database', 'error');
    }
  };

  // Bulk: Verify Completed Rows in Database
  const handleVerifyCompletedRows = async () => {
    const updatedMap = { ...(dailyRoutines[selectedDate] || {}) };
    const toUpdate: WorkerDailyRoutineEntry[] = [];

    workers.forEach((w) => {
      const entry = updatedMap[w.id] || getOrCreateEntry(w);
      const hasWork = entry.workDetails && entry.workDetails.trim() !== '' && entry.workDetails !== 'Absent' && entry.workDetails !== 'Weekly Off';
      if (entry.shiftStatus !== 'Absent' && entry.shiftStatus !== 'Weekly Off' && hasWork && !entry.isVerified) {
        const verifiedEntry: WorkerDailyRoutineEntry = {
          ...entry,
          isVerified: true,
          updatedAt: new Date().toISOString(),
        };
        updatedMap[w.id] = verifiedEntry;
        toUpdate.push(verifiedEntry);
      }
    });

    if (toUpdate.length === 0) {
      showToast('All filled rows are already verified.');
      return;
    }

    setDailyRoutines((prev) => ({ ...prev, [selectedDate]: updatedMap }));
    setSaveStatus('saving');

    try {
      await api.production.workerRoutines.bulkUpsert(toUpdate);
      setSaveStatus('saved');
      showToast(`Verified ${toUpdate.length} completed rows in database.`);
    } catch (err: any) {
      setSaveStatus('error');
      showToast('Failed to verify rows in database', 'error');
    }
  };

  // Save specific worker's row immediately to database API
  const handleSaveRow = async (workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return;

    const entry = getOrCreateEntry(worker);
    setSavingWorkerId(workerId);
    setSaveStatus('saving');

    try {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      delete pendingUpdatesRef.current[workerId];

      await api.production.workerRoutines.bulkUpsert([entry]);
      setSaveStatus('saved');
      setSavedWorkerIds((prev) => ({ ...prev, [workerId]: true }));
      showToast(`Saved successfully for ${worker.workerName}`, 'success');
    } catch (err: any) {
      console.error('Failed to save worker routine row:', err);
      setSaveStatus('error');
      showToast(`Failed to save data for ${worker.workerName}`, 'error');
    } finally {
      setSavingWorkerId(null);
    }
  };

  // Save all worker rows immediately to database API
  const handleSaveAll = async () => {
    const entriesToSave = workers.map((w) => getOrCreateEntry(w));
    if (entriesToSave.length === 0) return;

    setSaveStatus('saving');
    try {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      pendingUpdatesRef.current = {};

      await api.production.workerRoutines.bulkUpsert(entriesToSave);
      setSaveStatus('saved');
      const allSaved: Record<string, boolean> = {};
      workers.forEach((w) => {
        allSaved[w.id] = true;
      });
      setSavedWorkerIds((prev) => ({ ...prev, ...allSaved }));
      showToast(`All ${entriesToSave.length} worker routine records saved to database!`, 'success');
    } catch (err: any) {
      console.error('Failed to save all routines to database:', err);
      setSaveStatus('error');
      showToast('Failed to save all records to database', 'error');
    }
  };

  // DELETE a specific Worker Daily Routine entry from Database
  const handleDeleteRoutineEntry = async (workerId: string) => {
    const entry = currentDayEntries[workerId];
    if (!entry || !entry.id) return;

    if (!confirm('Are you sure you want to reset and clear this routine record from the database?')) {
      return;
    }

    try {
      await api.production.workerRoutines.delete(entry.id);
      setDailyRoutines((prev) => {
        const dateMap = { ...(prev[selectedDate] || {}) };
        delete dateMap[workerId];
        return { ...prev, [selectedDate]: dateMap };
      });
      showToast('Routine entry cleared from database.');
    } catch (err: any) {
      console.error('Failed to delete routine entry:', err);
      showToast('Failed to clear routine from database', 'error');
    }
  };

  // Insert Preset Chip into active or selected worker
  const handleApplyPreset = (presetText: string) => {
    if (!selectedWorkerId) {
      showToast('Click a worker row first to apply this preset.');
      return;
    }
    const worker = workers.find((w) => w.id === selectedWorkerId);
    if (!worker) return;

    const entry = getOrCreateEntry(worker);
    if (entry.shiftStatus === 'Absent' || entry.shiftStatus === 'Weekly Off') {
      handleUpdateRoutine(selectedWorkerId, 'shiftStatus', 'Present');
    }

    const currentText = (entry.workDetails === 'Absent' || entry.workDetails === 'Weekly Off') ? '' : (entry.workDetails || '');
    const newText = currentText ? `${currentText}, ${presetText}` : presetText;
    handleUpdateRoutine(selectedWorkerId, 'workDetails', newText);
    showToast(`Added to ${worker.workerName}`);
  };

  // CREATE New Worker in Database via API
  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim()) return;

    try {
      const created = await api.production.workers.create({
        workerName: newWorkerName.trim().toUpperCase(),
        trade: newWorkerTrade,
        defaultShift: 'General',
        isActive: true,
      });

      setWorkers((prev) => [...prev, created]);
      setNewWorkerName('');
      setShowAddWorkerModal(false);
      showToast(`Worker ${created.workerName} created in database.`);
    } catch (err: any) {
      console.error('Failed to create worker in database:', err);
      showToast('Failed to save worker to database', 'error');
    }
  };

  // UPDATE Existing Worker in Database via API
  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;

    try {
      const updated = await api.production.workers.update(editingWorker.id, {
        workerName: editingWorker.workerName,
        trade: editingWorker.trade,
        defaultShift: editingWorker.defaultShift,
      });

      setWorkers((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
      setEditingWorker(null);
      showToast(`Worker ${updated.workerName} updated in database.`);
    } catch (err: any) {
      console.error('Failed to update worker in database:', err);
      showToast('Failed to update worker in database', 'error');
    }
  };

  // DELETE Worker from Master in Database via API
  const handleDeleteWorker = async (workerId: string, workerName: string) => {
    if (!confirm(`Are you sure you want to permanently delete worker "${workerName}" from the database?`)) {
      return;
    }

    try {
      await api.production.workers.delete(workerId);
      setWorkers((prev) => prev.filter((w) => w.id !== workerId));
      showToast(`Worker "${workerName}" removed from database.`);
    } catch (err: any) {
      console.error('Failed to delete worker:', err);
      showToast('Failed to delete worker from database', 'error');
    }
  };

  // Export Daily Log to CSV
  const handleExportCSV = () => {
    const headers = ['SL No', 'Worker Name', 'Trade', 'Status', 'Job No', 'Work Details', 'Qty/Hours', 'Verified', 'Date'];
    const rows = workers.map((w) => {
      const entry = getOrCreateEntry(w);
      return [
        w.slNo,
        `"${w.workerName}"`,
        `"${w.trade}"`,
        entry.shiftStatus,
        `"${entry.jobOrProjectNo || ''}"`,
        `"${(entry.workDetails || '').replace(/"/g, '""')}"`,
        `"${entry.quantityNos || ''}"`,
        entry.isVerified ? 'YES' : 'NO',
        selectedDate,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Worker_Daily_Routine_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Daily routine exported to CSV.');
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

  // Filtered Workers
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      const entry = currentDayEntries[w.id] || { shiftStatus: 'Present', workDetails: '', isVerified: false, jobOrProjectNo: '' };
      const hasWork = entry.workDetails && entry.workDetails.trim() !== '' && entry.workDetails !== 'Absent' && entry.workDetails !== 'Weekly Off';

      if (statusFilter === 'Present' && entry.shiftStatus !== 'Present') return false;
      if (statusFilter === 'Absent' && entry.shiftStatus !== 'Absent') return false;
      if (statusFilter === 'Half Day' && entry.shiftStatus !== 'Half Day') return false;
      if (statusFilter === 'Weekly Off' && entry.shiftStatus !== 'Weekly Off') return false;
      if (statusFilter === 'unlogged' && (entry.shiftStatus === 'Absent' || entry.shiftStatus === 'Weekly Off' || hasWork)) return false;
      if (statusFilter === 'unverified' && (entry.isVerified || entry.shiftStatus === 'Absent' || entry.shiftStatus === 'Weekly Off')) return false;
      if (statusFilter === 'verified' && !entry.isVerified) return false;

      if (tradeFilter !== 'all' && !w.trade.toLowerCase().includes(tradeFilter.toLowerCase())) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = w.workerName.toLowerCase().includes(q);
        const matchTrade = w.trade.toLowerCase().includes(q);
        const matchWork = (entry.workDetails || '').toLowerCase().includes(q);
        const matchJob = (entry.jobOrProjectNo || '').toLowerCase().includes(q);
        const matchSl = String(w.slNo) === q;
        if (!matchName && !matchTrade && !matchWork && !matchJob && !matchSl) return false;
      }

      return true;
    });
  }, [workers, currentDayEntries, statusFilter, tradeFilter, searchTerm]);

  // Day Metrics for Unified Summary Strip
  const dayMetrics = useMemo(() => {
    let present = 0;
    let absent = 0;
    let halfDay = 0;
    let weeklyOff = 0;
    let verified = 0;
    let filledWork = 0;

    workers.forEach((w) => {
      const entry = currentDayEntries[w.id] || { shiftStatus: 'Present', workDetails: '', isVerified: false };
      const hasWork = entry.workDetails && entry.workDetails.trim() !== '' && entry.workDetails !== 'Absent' && entry.workDetails !== 'Weekly Off';

      if (entry.shiftStatus === 'Absent') absent++;
      else if (entry.shiftStatus === 'Weekly Off') weeklyOff++;
      else if (entry.shiftStatus === 'Half Day') {
        halfDay++;
        if (hasWork) filledWork++;
      } else {
        present++;
        if (hasWork) filledWork++;
      }
      if (entry.isVerified) verified++;
    });

    const activeWorking = present + halfDay;
    const workNotLogged = Math.max(0, activeWorking - filledWork);
    const notVerified = Math.max(0, activeWorking - verified);

    return {
      total: workers.length,
      present,
      absent,
      halfDay,
      weeklyOff,
      activeWorking,
      filledWork,
      workNotLogged,
      verified,
      notVerified,
      progressPercent: activeWorking > 0 ? Math.round((verified / activeWorking) * 100) : 0,
    };
  }, [workers, currentDayEntries]);

  // Format Date for Display (DD/MM/YYYY)
  const formattedDisplayDate = useMemo(() => {
    if (!selectedDate) return '';
    const parts = selectedDate.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return selectedDate;
  }, [selectedDate]);

  // Days in selected month for Monthly Grid
  const daysInMonthList = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${dayStr}`;
      const d = new Date(year, month - 1, day);
      const isSunday = d.getDay() === 0;
      return { day, dateStr, isSunday };
    });
  }, [selectedMonth]);

  // Active worker name for quick preset banner
  const activeWorkerName = useMemo(() => {
    return workers.find((w) => w.id === selectedWorkerId)?.workerName || 'Select a row';
  }, [workers, selectedWorkerId]);

  return (
    <div className="space-y-3 pb-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 border text-xs animate-in slide-in-from-top-2 duration-150 ${
            toastType === 'error'
              ? 'bg-rose-900 border-rose-500/40'
              : 'bg-[#211B17] border-amber-500/40'
          }`}
        >
          {toastType === 'error' ? (
            <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER & NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        <div>
          <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
            DASHBOARD / PRODUCTION &amp; SHOPFLOOR / DAILY WORK ROUTING
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-amber-600" />
            <span>Daily Work Routine &amp; Attendance</span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>LIVE DATABASE: {workers.length} Workers</span>
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Directly synced to backend database API. Complete Create, Read, Update, and Delete capabilities for shopfloor operations.
          </p>
        </div>

        {/* Action Buttons & Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => {
              fetchWorkers();
              if (activeTab === 'daily') fetchRoutinesForDate(selectedDate);
              else fetchRoutinesForMonth(selectedMonth);
              showToast('Data refreshed from database.');
            }}
            disabled={isRefreshing}
            className="p-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
            title="Refresh from Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
          </button>

          {/* View Mode Tabs */}
          <div className="flex items-center p-1 bg-slate-200/70 rounded-xl border border-slate-300/60">
            <button
              type="button"
              onClick={() => setActiveTab('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'daily'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 text-amber-600" />
              <span>Daily Log</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5 text-blue-600" />
              <span>Monthly Attendance Grid</span>
            </button>
          </div>

          <button
            onClick={() => printContent('printable-worker-routine-sheet', { title: `Worker_Daily_Routine_${formattedDisplayDate}` })}
            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Print Physical Daily Sheet"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Print Sheet</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Export</span>
          </button>

          <button
            onClick={() => setShowAddWorkerModal(true)}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Worker</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DATE CONTROLLER & SHEET HEADER STRIP                                  */}
      {/* ========================================================================= */}
      <div className="bg-[#211B17] text-white px-4 py-2.5 rounded-2xl shadow-md border border-[#EBE3DB]/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 border border-amber-400/30 rounded-xl">
            <Factory className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-amber-400 font-mono font-bold">
              SHOPFLOOR DAILY OPERATIONS RECORD (API / DB)
            </div>
            <div className="text-sm font-black tracking-wider uppercase text-white font-mono">
              WORK PROFILE DAILY ROUTINE
            </div>
            <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
              <span>Supervisor:</span>
              <strong className="text-amber-300">{supervisorName}</strong>
            </div>
          </div>
        </div>

        {/* Date Selector Navigation Bar */}
        {activeTab === 'daily' ? (
          <div className="flex flex-wrap items-center gap-1.5 bg-white/10 p-1.5 rounded-xl border border-white/15">
            <button
              onClick={handlePrevDay}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Previous Day"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white text-slate-900 rounded-lg font-mono font-black text-xs shadow-inner">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>DATE: {formattedDisplayDate}</span>
            </div>

            <div className="w-32">
              <ERPDatePicker
                value={selectedDate}
                onChange={(val) => val && setSelectedDate(val)}
                size="sm"
                buttonClassName="bg-white/20 text-white border-white/20 hover:bg-white/30 text-xs py-1"
              />
            </div>

            <button
              onClick={handleNextDay}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Next Day"
            >
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-2 py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-[#211B17] rounded-lg transition cursor-pointer"
            >
              Today
            </button>
          </div>
        ) : (
          /* Monthly Selector */
          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-xl border border-white/15">
            <CalendarRange className="w-4 h-4 text-amber-400 ml-1" />
            <span className="text-xs font-semibold text-slate-200">Month:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded-lg font-mono"
            />
          </div>
        )}
      </div>

      {activeTab === 'daily' ? (
        <>
          {/* ========================================================================= */}
          {/* 2. REPLACED 5 BULKY CARDS WITH 1 SLEEK UNIFIED SUMMARY & FILTER STRIP     */}
          {/* ========================================================================= */}
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
            {/* Left: Overall Attendance Summary & Mini Progress */}
            <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
              <div>
                <div className="text-slate-800 font-extrabold text-sm flex items-center gap-1.5">
                  <span className="text-emerald-700 font-black">{dayMetrics.activeWorking} of {dayMetrics.total}</span>
                  <span className="text-slate-500 font-medium">Present today</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${dayMetrics.progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold font-mono">
                    {dayMetrics.verified}/{dayMetrics.activeWorking} Verified ({dayMetrics.progressPercent}%)
                  </span>
                </div>
              </div>

              <div className="h-7 w-px bg-slate-200 hidden sm:block" />

              {/* Middle: Interactive Filter Buttons with Count Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
                    statusFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>All</span>
                  <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px] font-mono">
                    {dayMetrics.total}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter(statusFilter === 'Absent' ? 'all' : 'Absent')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1 border ${
                    statusFilter === 'Absent'
                      ? 'bg-rose-600 text-white border-rose-700'
                      : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                  }`}
                  title="Click to filter Absent workers"
                >
                  <UserX className="w-3 h-3" />
                  <span>Absent</span>
                  <span className="px-1.5 py-0.2 bg-rose-200 text-rose-900 rounded-full text-[10px] font-mono font-black">
                    {dayMetrics.absent}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter(statusFilter === 'unlogged' ? 'all' : 'unlogged')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1 border ${
                    statusFilter === 'unlogged'
                      ? 'bg-amber-600 text-white border-amber-700'
                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                  title="Click to filter Present workers with no work details logged"
                >
                  <AlertCircle className="w-3 h-3" />
                  <span>Work Not Logged</span>
                  <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-full text-[10px] font-mono font-black">
                    {dayMetrics.workNotLogged}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter(statusFilter === 'unverified' ? 'all' : 'unverified')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1 border ${
                    statusFilter === 'unverified'
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                  }`}
                  title="Click to filter rows needing supervisor verification"
                >
                  <Clock className="w-3 h-3" />
                  <span>Needs Verification</span>
                  <span className="px-1.5 py-0.2 bg-blue-200 text-blue-900 rounded-full text-[10px] font-mono font-black">
                    {dayMetrics.notVerified}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter(statusFilter === 'verified' ? 'all' : 'verified')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1 border ${
                    statusFilter === 'verified'
                      ? 'bg-emerald-700 text-white border-emerald-800'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                  title="Click to filter verified rows"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Verified</span>
                  <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-900 rounded-full text-[10px] font-mono font-black">
                    {dayMetrics.verified}
                  </span>
                </button>
              </div>
            </div>

            {/* Right: Cloud Auto-Save Status & Quick Smart Bulk Actions */}
            <div className="flex items-center gap-2.5 ml-auto">
              {/* Saving Indicator */}
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                {saveStatus === 'saving' ? (
                  <>
                    <Loader2 className="w-3 h-3 text-amber-600 animate-spin" />
                    <span className="text-amber-600 font-mono">Syncing to DB...</span>
                  </>
                ) : saveStatus === 'error' ? (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-rose-600 font-mono">Save error</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-700 font-mono">Database Synced</span>
                  </>
                )}
              </div>

              <div className="h-5 w-px bg-slate-200" />

              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-300 font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1"
                title="Mark all workers Present in database"
              >
                <UserCheck className="w-3 h-3 text-emerald-600" />
                <span>Mark All Present</span>
              </button>

              <button
                type="button"
                onClick={handleVerifyCompletedRows}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
                title="Verify completed rows in database (skips rows with no work details)"
              >
                <Check className="w-3 h-3" />
                <span>Verify Completed Rows</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAll}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
                title="Save all worker rows to database"
              >
                <Save className="w-3 h-3" />
                <span>Save All</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddWorkerModal(true)}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
                title="Add New Worker to Database"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Worker</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. SEARCH BAR + SINGLE GLOBAL QUICK PRESETS BAR                           */}
          {/* ========================================================================= */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center gap-3 text-xs">
            {/* Search Input */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search worker, trade, or Job No..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Trade Selector */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-slate-500 font-bold text-[11px]">Trade:</span>
              <select
                value={tradeFilter}
                onChange={(e) => setTradeFilter(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">All Trades</option>
                <option value="Fitter">Fitter / Fabricator</option>
                <option value="Welder">Welder (Argon/MIG/Arc)</option>
                <option value="Plasma">Plasma / Laser / Cutting</option>
                <option value="Rolling">Plate Bending & Rolling</option>
                <option value="Grinder">Grinder / Finishing</option>
                <option value="Helper">Helper / Shifting</option>
              </select>
            </div>

            {/* Single Horizontal Presets Toolbar (Replaces repeated chips in every row!) */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full py-0.5 border-t md:border-t-0 md:border-l border-slate-200 pl-0 md:pl-3">
              <div className="flex items-center gap-1 text-[10px] text-amber-900 font-bold whitespace-nowrap bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300/80">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Preset for:</span>
                <span className="font-mono text-slate-900 max-w-[90px] truncate" title={activeWorkerName}>
                  {activeWorkerName}
                </span>
              </div>
              {WORK_QUICK_PRESETS.map((preset, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2 py-0.5 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-300 hover:border-amber-300 rounded text-[11px] font-medium whitespace-nowrap transition cursor-pointer shrink-0 shadow-2xs"
                  title={`Click to append to ${activeWorkerName}`}
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. HIGH-DENSITY COMPACT WORKER ROUTINE TABLE (HEIGHT ~52px PER ROW)       */}
          {/* ========================================================================= */}
          <div id="printable-worker-routine-sheet" className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden print:border-black print:rounded-none">
            {/* Printable Sheet Header */}
            <div className="hidden print:block p-4 border-b-2 border-black text-center">
              <h2 className="text-xl font-black uppercase tracking-wider font-mono">
                UMA ENGINEERING — WORK PROFILE DAILY ROUTINE
              </h2>
              <div className="flex justify-between items-center text-xs font-mono font-bold mt-2">
                <span>SUPERVISOR: {supervisorName}</span>
                <span>DATE: {formattedDisplayDate}</span>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-extrabold uppercase text-[11px] tracking-wider whitespace-nowrap">
                    <th className="py-2 px-2.5 w-12 text-center border-r border-slate-200">
                      SL #
                    </th>
                    <th className="py-2 px-3 w-56 border-r border-slate-200">
                      WORKER &amp; TRADE
                    </th>
                    <th className="py-2 px-2 w-36 text-center border-r border-slate-200" title="Attendance Status (P / H / A / WO)">
                      ATTENDANCE
                    </th>
                    <th className="py-2 px-2.5 w-32 border-r border-slate-200">
                      JOB NO.
                    </th>
                    <th className="py-2 px-3 min-w-[340px] border-r border-slate-200">
                      DAILY WORK ROUTINE / OPERATION DETAILS
                    </th>
                    <th className="py-2 px-2.5 w-24 text-center border-r border-slate-200">
                      QTY / HRS
                    </th>
                    <th className="py-2 px-2 w-24 text-center print:hidden border-r border-slate-200">
                      STATUS
                    </th>
                    <th className="py-2 px-2 min-w-[155px] w-44 text-center print:hidden">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <Loader2 className="w-7 h-7 mx-auto mb-2 text-amber-600 animate-spin" />
                        <p className="font-semibold text-sm">Loading workers from database...</p>
                      </td>
                    </tr>
                  ) : filteredWorkers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="max-w-md mx-auto space-y-3">
                          <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <Users className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800 text-sm">
                              {workers.length === 0 ? 'No Workers in Database Yet' : 'No Matching Worker Records'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {workers.length === 0
                                ? 'All mock data has been removed. Click below to add your real shopfloor workers.'
                                : 'Try clearing your search query or trade filters.'}
                            </p>
                          </div>
                          {workers.length === 0 ? (
                            <button
                              type="button"
                              onClick={() => setShowAddWorkerModal(true)}
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                              <span>+ Add Your First Worker</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setTradeFilter('all');
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition inline-flex items-center gap-1"
                            >
                              Clear Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredWorkers.map((worker) => {
                      const entry = getOrCreateEntry(worker);
                      const isAbsent = entry.shiftStatus === 'Absent';
                      const isWeeklyOff = entry.shiftStatus === 'Weekly Off';
                      const isHalfDay = entry.shiftStatus === 'Half Day';
                      const isVerified = entry.isVerified;
                      const hasWork = entry.workDetails && entry.workDetails.trim() !== '' && !isAbsent && !isWeeklyOff;
                      const isSelected = selectedWorkerId === worker.id;

                      // Colored Left Edge status:
                      // Green = Verified, Amber = Work logged but not verified, Red = Absent, Slate = Work not logged
                      let statusBorderColor = 'border-l-4 border-l-slate-300';
                      if (isAbsent) statusBorderColor = 'border-l-4 border-l-rose-500 bg-rose-50/20';
                      else if (isWeeklyOff) statusBorderColor = 'border-l-4 border-l-slate-400 bg-slate-50/40';
                      else if (isVerified) statusBorderColor = 'border-l-4 border-l-emerald-500 bg-emerald-50/15';
                      else if (hasWork) statusBorderColor = 'border-l-4 border-l-amber-500';

                      return (
                        <tr
                          key={worker.id}
                          onClick={() => setSelectedWorkerId(worker.id)}
                          className={`transition group border-b border-slate-200 hover:bg-amber-50/30 ${statusBorderColor} ${
                            isSelected ? 'ring-1 ring-amber-400/80 bg-amber-50/20' : ''
                          }`}
                        >
                          {/* 1. SL NO */}
                          <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-700 border-r border-slate-200 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              {isVerified ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <span className="text-slate-300 text-xs font-mono">•</span>
                              )}
                              <span>{worker.slNo}</span>
                            </div>
                          </td>

                          {/* 2. WORKER & TRADE */}
                          <td className="py-1.5 px-3 border-r border-slate-200">
                            <div className="flex items-center justify-between gap-1.5">
                              <span
                                className={`font-black text-xs tracking-tight truncate ${
                                  isAbsent ? 'text-rose-900 line-through opacity-70' : 'text-slate-900'
                                }`}
                                title={worker.workerName}
                              >
                                {worker.workerName}
                              </span>
                              <span
                                className="px-1.5 py-0.2 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9.5px] font-medium shrink-0 max-w-[105px] truncate"
                                title={worker.trade}
                              >
                                {worker.trade}
                              </span>
                            </div>
                          </td>

                          {/* 3. ATTENDANCE (Compact P / H / A / WO Segmented Control) */}
                          <td className="py-1 px-1.5 text-center border-r border-slate-200 whitespace-nowrap">
                            <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-0.5 shadow-2xs">
                              {/* P (Present) */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateRoutine(worker.id, 'shiftStatus', 'Present');
                                }}
                                className={`px-2 py-0.5 text-[11px] font-black rounded transition cursor-pointer ${
                                  entry.shiftStatus === 'Present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-emerald-700'
                                }`}
                                title="Mark Present (Saved to DB)"
                              >
                                P
                              </button>

                              {/* H (Half Day) */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateRoutine(worker.id, 'shiftStatus', 'Half Day');
                                }}
                                className={`px-2 py-0.5 text-[11px] font-black rounded transition cursor-pointer ${
                                  entry.shiftStatus === 'Half Day'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-amber-700'
                                }`}
                                title="Mark Half Day - 4 Hours (Saved to DB)"
                              >
                                H
                              </button>

                              {/* A (Absent) */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateRoutine(worker.id, 'shiftStatus', 'Absent');
                                }}
                                className={`px-2 py-0.5 text-[11px] font-black rounded transition cursor-pointer ${
                                  isAbsent
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-rose-700'
                                }`}
                                title="Mark Absent (Saved to DB)"
                              >
                                A
                              </button>

                              {/* WO (Weekly Off) */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateRoutine(worker.id, 'shiftStatus', 'Weekly Off');
                                }}
                                className={`px-1.5 py-0.5 text-[10px] font-black rounded transition cursor-pointer ${
                                  isWeeklyOff
                                    ? 'bg-slate-700 text-white shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                                title="Mark Weekly Off (Saved to DB)"
                              >
                                Off
                              </button>
                            </div>
                          </td>

                          {/* 4. JOB NO (Separate searchable field!) */}
                          <td className="py-1 px-1.5 border-r border-slate-200">
                            {isAbsent || isWeeklyOff ? (
                              <span className="text-[11px] text-slate-400 font-mono italic block text-center">
                                —
                              </span>
                            ) : (
                              <div className="relative">
                                <input
                                  type="text"
                                  list="job-numbers-datalist"
                                  value={entry.jobOrProjectNo || ''}
                                  placeholder="e.g. 26-138"
                                  onChange={(e) =>
                                    handleUpdateRoutine(worker.id, 'jobOrProjectNo', e.target.value.toUpperCase())
                                  }
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 uppercase"
                                />
                              </div>
                            )}
                          </td>

                          {/* 5. DAILY ROUTINE WORK DETAILS (Streamlined single-line input) */}
                          <td className="py-1 px-2 border-r border-slate-200">
                            {isAbsent ? (
                              <div className="flex items-center justify-between py-0.5 px-2 bg-rose-50 border border-rose-200 rounded text-rose-700">
                                <span className="font-bold italic text-xs">Absent (Leave / Off)</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateRoutine(worker.id, 'shiftStatus', 'Present');
                                  }}
                                  className="text-[10px] font-bold text-blue-700 hover:underline cursor-pointer"
                                >
                                  Mark Present
                                </button>
                              </div>
                            ) : isWeeklyOff ? (
                              <div className="flex items-center justify-between py-0.5 px-2 bg-slate-100 border border-slate-200 rounded text-slate-600">
                                <span className="font-bold italic text-xs">Weekly Off (Sunday / Holiday)</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateRoutine(worker.id, 'shiftStatus', 'Present');
                                  }}
                                  className="text-[10px] font-bold text-blue-700 hover:underline cursor-pointer"
                                >
                                  Mark Present
                                </button>
                              </div>
                            ) : (
                              <input
                                type="text"
                                value={entry.workDetails || ''}
                                placeholder="Describe assigned work (e.g. Angle cutting, 4 Nos bending, weld assembly)..."
                                onChange={(e) =>
                                  handleUpdateRoutine(worker.id, 'workDetails', e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const nextIdx = filteredWorkers.findIndex((w) => w.id === worker.id) + 1;
                                    if (nextIdx < filteredWorkers.length) {
                                      setSelectedWorkerId(filteredWorkers[nextIdx].id);
                                    }
                                  }
                                }}
                                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                              />
                            )}
                          </td>

                          {/* 6. QTY / HOURS */}
                          <td className="py-1 px-1.5 border-r border-slate-200 text-center">
                            {isAbsent || isWeeklyOff ? (
                              <span className="text-[11px] text-slate-400 font-mono italic block">
                                —
                              </span>
                            ) : (
                              <input
                                type="text"
                                value={entry.quantityNos || ''}
                                placeholder="4 Nos"
                                onChange={(e) =>
                                  handleUpdateRoutine(worker.id, 'quantityNos', e.target.value)
                                }
                                className="w-full px-1.5 py-1 text-center bg-white border border-slate-300 rounded font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                            )}
                          </td>

                          {/* 7. VERIFICATION TOGGLE */}
                          <td className="py-1 px-2 text-center print:hidden border-r border-slate-200">
                            {isAbsent || isWeeklyOff ? (
                              <span className="text-[10px] text-slate-400 font-medium italic">
                                N/A
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateRoutine(worker.id, 'isVerified', !entry.isVerified);
                                }}
                                className={`px-2 py-0.5 rounded-md font-bold text-[10.5px] transition cursor-pointer flex items-center justify-center gap-1 mx-auto border ${
                                  isVerified
                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                                    : hasWork
                                    ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                                    : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                }`}
                                title={isVerified ? 'Verified by Supervisor' : 'Click to Verify this completed row'}
                              >
                                {isVerified ? (
                                  <>
                                    <Check className="w-3 h-3 stroke-[2.5]" />
                                    <span>Verified</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>Verify</span>
                                  </>
                                )}
                              </button>
                            )}
                          </td>

                          {/* 8. ROW ACTIONS (Save / Saved / Edit / Reset / Delete Worker) */}
                          <td className="py-1 px-2 text-center print:hidden">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Save / Saved button requested by user */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveRow(worker.id);
                                }}
                                disabled={savingWorkerId === worker.id}
                                className={`px-3 py-1 rounded font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs whitespace-nowrap border ${
                                  savedWorkerIds[worker.id]
                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-100 hover:bg-emerald-700'
                                    : savingWorkerId === worker.id
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-wait'
                                    : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border-emerald-700'
                                }`}
                                title={savedWorkerIds[worker.id] ? `Data saved for ${worker.workerName}` : `Save ${worker.workerName}'s routine to database`}
                              >
                                {savingWorkerId === worker.id ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                                    <span>Saving...</span>
                                  </>
                                ) : savedWorkerIds[worker.id] ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 stroke-[2.5] shrink-0 text-white" />
                                    <span>Saved</span>
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-3.5 h-3.5 shrink-0" />
                                    <span>Save</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingWorker(worker);
                                }}
                                className="p-1 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded transition"
                                title="Edit Worker Details in Database"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRoutineEntry(worker.id);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded transition"
                                title="Reset / Clear today's routine for this worker"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteWorker(worker.id, worker.workerName);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded transition"
                                title="Delete Worker from Master"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Datalist for autocomplete Job Numbers */}
            <datalist id="job-numbers-datalist">
              {availableJobNumbers.map((job, jIdx) => (
                <option key={jIdx} value={job} />
              ))}
            </datalist>

            {/* Table Footer */}
            <div className="bg-slate-100 px-4 py-2 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600 font-semibold">
              <div className="flex items-center gap-4">
                <span>Showing <strong>{filteredWorkers.length}</strong> of {workers.length} workers</span>
                <span className="hidden sm:inline text-slate-400">|</span>
                <span className="hidden sm:inline">
                  Keyboard Tip: Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">Enter</kbd> to jump to the next worker.
                </span>
              </div>
              <div className="font-mono text-emerald-800 font-bold">
                Daily Verified: {dayMetrics.verified} / {dayMetrics.activeWorking}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ========================================================================= */
        /* 5. MONTHLY ATTENDANCE GRID TAB (WORKER × DAY MATRIX - 100% FROM API)     */
        /* ========================================================================= */
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-blue-600" />
                <span>Monthly Attendance &amp; Activity Matrix ({selectedMonth})</span>
              </h2>
              <p className="text-xs text-slate-500">
                Data loaded live from backend database. Click any day cell to instantly view or edit that specific date’s daily work routine.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-3 h-3 rounded bg-emerald-600 inline-block" />
                <span>P = Present</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
                <span>H = Half Day</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-3 h-3 rounded bg-rose-600 inline-block" />
                <span>A = Absent</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-3 h-3 rounded bg-slate-400 inline-block" />
                <span>Off = Weekly Off</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-2 px-2 w-10 text-center border-r border-slate-200">#</th>
                  <th className="py-2 px-3 min-w-[170px] border-r border-slate-200">WORKER</th>
                  {daysInMonthList.map(({ day, isSunday }) => (
                    <th
                      key={day}
                      className={`py-1.5 px-1 w-7 text-center border-r border-slate-200 font-mono ${
                        isSunday ? 'bg-amber-100/60 text-amber-900' : ''
                      }`}
                    >
                      {day}
                    </th>
                  ))}
                  <th className="py-2 px-2 w-12 text-center text-emerald-800 font-black border-r border-slate-200">P</th>
                  <th className="py-2 px-2 w-12 text-center text-rose-800 font-black border-r border-slate-200">A</th>
                  <th className="py-2 px-2 w-12 text-center text-amber-800 font-black">H</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {workers.map((worker) => {
                  let monthP = 0;
                  let monthA = 0;
                  let monthH = 0;

                  return (
                    <tr key={worker.id} className="hover:bg-amber-50/20 transition">
                      <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200">
                        {worker.slNo}
                      </td>
                      <td className="py-1.5 px-3 border-r border-slate-200 whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-xs">{worker.workerName}</div>
                        <div className="text-[9.5px] text-slate-400 font-mono">{worker.trade}</div>
                      </td>

                      {/* Days in Month */}
                      {daysInMonthList.map(({ day, dateStr, isSunday }) => {
                        const dayEntry = dailyRoutines[dateStr]?.[worker.id];
                        let status = dayEntry?.shiftStatus;
                        if (!status && isSunday) status = 'Weekly Off';

                        let badgeColor = 'text-slate-300';
                        let symbol = '—';

                        if (status === 'Present') {
                          symbol = 'P';
                          badgeColor = 'bg-emerald-600 text-white font-bold';
                          monthP++;
                        } else if (status === 'Absent') {
                          symbol = 'A';
                          badgeColor = 'bg-rose-600 text-white font-bold';
                          monthA++;
                        } else if (status === 'Half Day') {
                          symbol = 'H';
                          badgeColor = 'bg-amber-500 text-white font-bold';
                          monthH++;
                        } else if (status === 'Weekly Off') {
                          symbol = 'O';
                          badgeColor = 'bg-slate-200 text-slate-600 font-bold';
                        }

                        return (
                          <td
                            key={day}
                            onClick={() => {
                              setSelectedDate(dateStr);
                              setActiveTab('daily');
                            }}
                            className={`py-1 px-0.5 text-center border-r border-slate-200 cursor-pointer hover:ring-2 hover:ring-amber-500 hover:z-10 transition ${
                              isSunday ? 'bg-amber-50/40' : ''
                            }`}
                            title={`Date: ${dateStr} - Status: ${status || 'Not logged'}. Click to view daily log.`}
                          >
                            <span className={`inline-block w-5 h-5 leading-5 rounded text-[10px] font-mono ${badgeColor}`}>
                              {symbol}
                            </span>
                          </td>
                        );
                      })}

                      {/* Totals */}
                      <td className="py-1 px-1.5 text-center font-mono font-black text-emerald-700 bg-emerald-50/50 border-r border-slate-200">
                        {monthP}
                      </td>
                      <td className="py-1 px-1.5 text-center font-mono font-black text-rose-700 bg-rose-50/50 border-r border-slate-200">
                        {monthA}
                      </td>
                      <td className="py-1 px-1.5 text-center font-mono font-black text-amber-700 bg-amber-50/50">
                        {monthH}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD WORKER MODAL (Saves to Database via API)                              */}
      {/* ========================================================================= */}
      {showAddWorkerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <Plus className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Add New Worker</h3>
                  <p className="text-xs text-slate-500">Persists directly to database</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddWorkerModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWorker} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Worker Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIKRAM CHAUHAN"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trade / Skill Category</label>
                <select
                  value={newWorkerTrade}
                  onChange={(e) => setNewWorkerTrade(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Fitter / Fabricator">Fitter / Fabricator</option>
                  <option value="TIG / Argon Welder">TIG / Argon Welder</option>
                  <option value="MIG / Arc Welder">MIG / Arc Welder</option>
                  <option value="Plate Bending & Rolling">Plate Bending & Rolling</option>
                  <option value="CNC Plasma Operator">CNC Plasma Operator</option>
                  <option value="Gas Cutter">Gas Cutter</option>
                  <option value="Lathe / Pin Machinist">Lathe / Pin Machinist</option>
                  <option value="Surface Grinder">Surface Grinder</option>
                  <option value="Shopfloor Helper">Shopfloor Helper</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddWorkerModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT WORKER MODAL (Updates in Database via API)                           */}
      {/* ========================================================================= */}
      {editingWorker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <Edit2 className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Edit Worker Details</h3>
                  <p className="text-xs text-slate-500">Update worker in database</p>
                </div>
              </div>
              <button
                onClick={() => setEditingWorker(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateWorker} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Worker Name *</label>
                <input
                  type="text"
                  required
                  value={editingWorker.workerName}
                  onChange={(e) => setEditingWorker({ ...editingWorker, workerName: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trade / Skill Category</label>
                <input
                  type="text"
                  required
                  value={editingWorker.trade}
                  onChange={(e) => setEditingWorker({ ...editingWorker, trade: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingWorker(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  Update in Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
