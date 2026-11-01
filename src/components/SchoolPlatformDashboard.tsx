/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  CreditCard,
  Award,
  CheckCircle2,
  AlertTriangle,
  Search,
  ArrowUpDown,
  Smartphone,
  Radio,
  X,
  Send,
  Plus,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Layers,
  FileSpreadsheet,
  Calendar,
  Check,
  Building,
  School,
  UserCheck,
  Eye,
  FileText,
  Printer,
  Edit2,
} from 'lucide-react';
import { Learner, GradeLevel, DarajaMpesaPayment, SMSBroadcast, CBCLevel, AuthUser } from '../types/school';
import { exportToExcel } from '../utils/excelExport';

interface Props {
  currentUser: AuthUser;
  isDarkMode: boolean;
  learners: Learner[];
  darajaPayments: DarajaMpesaPayment[];
  smsBroadcasts: SMSBroadcast[];
  onOpenAdmitModal: () => void;
  onOpenClassRenameModal: () => void;
  onOpenUploadMarksheet: () => void;
  onOpenAddFeesExcel: () => void;
  onProcessPayment: (payment: DarajaMpesaPayment) => void;
  onSimulatePush: () => void;
  onUpdateLearnerUpi: (learnerId: string, newUpi: string) => void;
  onSendSmsReminder: (learner: Learner, customMessage?: string) => void;
  onSelectTab: (tabId: any) => void;
  onLogAudit?: (action: any, resource: string, details: string, sensitivity?: any) => void;
}

interface AttentionTask {
  id: string;
  title: string;
  description: string;
  badge: string;
  badgeType: 'amber' | 'rose' | 'emerald';
  actionText: string;
  completed: boolean;
}

export function SchoolPlatformDashboard({
  currentUser,
  isDarkMode,
  learners,
  darajaPayments,
  smsBroadcasts,
  onOpenAdmitModal,
  onOpenClassRenameModal,
  onOpenUploadMarksheet,
  onOpenAddFeesExcel,
  onProcessPayment,
  onSimulatePush,
  onUpdateLearnerUpi,
  onSendSmsReminder,
  onSelectTab,
  onLogAudit,
}: Props) {
  // Search & Filter State for Rebuilt Learner Table
  const [searchTerm, setSearchTerm] = useState('');
  const [feeStatusFilter, setFeeStatusFilter] = useState<'All' | 'Cleared' | 'Partial' | 'Defaulter' | 'Missing UPI'>('All');
  const [sortField, setSortField] = useState<'admissionNo' | 'name' | 'grade' | 'balance' | 'status'>('name');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: '/' focuses the search box
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Selected Learner for Drawer
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);

  // Drawer Form States
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentVotehead, setPaymentVotehead] = useState<string>('Tuition & CBC Learning Materials');
  const [smsCustomMessage, setSmsCustomMessage] = useState<string>('');
  const [editingUpi, setEditingUpi] = useState<string>('');
  const [isEditingUpiActive, setIsEditingUpiActive] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // CBC Curricular Progress & Formative Learning Milestones State
  const [cbcMilestoneFilter, setCbcMilestoneFilter] = useState<'All' | 'Primary' | 'JSS'>('All');

  // Bank fee adjustment state in drawer
  const [isEditingBankPayment, setIsEditingBankPayment] = useState(false);
  const [bankPaymentData, setBankPaymentData] = useState({
    bankName: 'Co-operative Bank - Limuru Branch',
    slipReference: '',
    amountPaid: '',
    paymentDate: new Date().toISOString().slice(0, 10),
  });

  // CBC Performance Panel Grade Selector
  const [selectedCbcGrade, setSelectedCbcGrade] = useState<string>('Grade 7');

  // Attendance Modal State
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isMpesaFeedsCollapsed, setIsMpesaFeedsCollapsed] = useState(false);

  // Aggregate Calculations
  const metrics = useMemo(() => {
    const totalStudents = learners.length;
    const totalFeesPaid = learners.reduce((sum, s) => sum + s.fees.paidAmount, 0);
    const totalFeesExpected = learners.reduce((sum, s) => sum + s.fees.totalTermFee, 0);
    const totalFeesBalance = learners.reduce((sum, s) => sum + s.fees.balance, 0);
    const feeRate = totalFeesExpected > 0 ? Math.round((totalFeesPaid / totalFeesExpected) * 100) : 0;
    const missingUpiCount = learners.filter((s) => !s.nemisUpi || s.nemisUpi.trim() === '').length;
    const defaultersCount = learners.filter((s) => s.fees.status === 'Defaulter').length;

    return {
      totalStudents,
      totalFeesPaid,
      totalFeesExpected,
      totalFeesBalance,
      feeRate,
      missingUpiCount,
      defaultersCount,
      attendanceRate: 96.8, // 96.8% present today
      presentCount: Math.round(totalStudents * 0.968),
      absentCount: totalStudents - Math.round(totalStudents * 0.968),
      cbcProficiencyRate: 88.5, // 88.5% Meeting or Exceeding Expectations
    };
  }, [learners]);

  // Filtered & Sorted Learners
  const filteredLearners = useMemo(() => {
    return learners
      .filter((s) => {
        // Fee Status Filter
        if (feeStatusFilter === 'Cleared' && s.fees.status !== 'Cleared') return false;
        if (feeStatusFilter === 'Partial' && s.fees.status !== 'Partial') return false;
        if (feeStatusFilter === 'Defaulter' && s.fees.status !== 'Defaulter') return false;
        if (feeStatusFilter === 'Missing UPI' && s.nemisUpi && s.nemisUpi.trim() !== '') return false;

        // Search Term
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          return (
            s.name.toLowerCase().includes(q) ||
            s.admissionNo.toLowerCase().includes(q) ||
            s.grade.toLowerCase().includes(q) ||
            s.stream.toLowerCase().includes(q) ||
            (s.nemisUpi && s.nemisUpi.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => {
        let valA: any = a.name;
        let valB: any = b.name;

        if (sortField === 'admissionNo') {
          valA = a.admissionNo;
          valB = b.admissionNo;
        } else if (sortField === 'grade') {
          valA = a.grade;
          valB = b.grade;
        } else if (sortField === 'balance') {
          valA = a.fees.balance;
          valB = b.fees.balance;
        } else if (sortField === 'status') {
          valA = a.fees.status;
          valB = b.fees.status;
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [learners, searchTerm, feeStatusFilter, sortField, sortAsc]);

  // Handle Sort Toggle
  const handleSort = (field: 'admissionNo' | 'name' | 'grade' | 'balance' | 'status') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // CBC Curricular Progress Milestones Data
  const cbcMilestones = useMemo(() => {
    return [
      {
        grade: 'Grade 1-3 Foundational',
        level: 'Primary',
        syllabusCoveredPercent: 96,
        strandsCompleted: '28 / 30 Strands',
        proficiencyRate: '94% ME / EE',
        projectWorkStatus: '100% Portfolios Completed',
        leadTeacher: 'Mdm. Grace Nduta',
      },
      {
        grade: 'Grade 4-6 Upper Primary',
        level: 'Primary',
        syllabusCoveredPercent: 91,
        strandsCompleted: '38 / 42 Strands',
        proficiencyRate: '89% ME / EE',
        projectWorkStatus: 'Agric & Science Projects Verified',
        leadTeacher: 'Mr. James Karanja',
      },
      {
        grade: 'Grade 7 Junior Secondary',
        level: 'JSS',
        syllabusCoveredPercent: 88,
        strandsCompleted: '45 / 50 Strands',
        proficiencyRate: '87% ME / EE',
        projectWorkStatus: 'Pre-Tech Practicals Submitted',
        leadTeacher: 'Mr. Patrick Wanjala',
      },
      {
        grade: 'Grade 8 Junior Secondary',
        level: 'JSS',
        syllabusCoveredPercent: 89,
        strandsCompleted: '46 / 52 Strands',
        proficiencyRate: '88% ME / EE',
        projectWorkStatus: 'Integrated Science Lab Logs Active',
        leadTeacher: 'Eng. Kennedy Mutua',
      },
      {
        grade: 'Grade 9 JSS Transition',
        level: 'JSS',
        syllabusCoveredPercent: 94,
        strandsCompleted: '50 / 52 Strands',
        proficiencyRate: '92% ME / EE',
        projectWorkStatus: 'KNEC Formative Assessment Synced',
        leadTeacher: 'Dr. Anthony Macharia',
      },
    ];
  }, []);

  const filteredCbcMilestones = useMemo(() => {
    if (cbcMilestoneFilter === 'Primary') return cbcMilestones.filter((m) => m.level === 'Primary');
    if (cbcMilestoneFilter === 'JSS') return cbcMilestones.filter((m) => m.level === 'JSS');
    return cbcMilestones;
  }, [cbcMilestones, cbcMilestoneFilter]);

  const handlePrintCbcMilestones = () => {
    window.print();
    showToast('Sent CBC Curricular Progress Milestone to printer.');
  };

  const handleExportCbcMilestones = () => {
    exportToExcel(
      'Limuru_Model_CBC_Curriculum_Progress_Milestones',
      filteredCbcMilestones,
      [
        { header: 'Grade Tier', key: 'grade' },
        { header: 'Level', key: 'level' },
        { header: 'Syllabus Covered (%)', key: (m) => `${m.syllabusCoveredPercent}%` },
        { header: 'Strands Completed', key: 'strandsCompleted' },
        { header: 'Proficiency (ME/EE)', key: 'proficiencyRate' },
        { header: 'Project Work Status', key: 'projectWorkStatus' },
        { header: 'Lead Teacher / Head of Strand', key: 'leadTeacher' },
      ]
    );
    showToast('Exported CBC Milestones (.csv) successfully.');
  };

  const handlePrintLearners = () => {
    window.print();
    showToast('Printing Learner Master Registry.');
  };

  const handleExportLearners = () => {
    exportToExcel(
      'Limuru_Model_Learner_Master_Registry',
      filteredLearners,
      [
        { header: 'Admission No', key: 'admissionNo' },
        { header: 'Learner Name', key: 'name' },
        { header: 'Grade', key: 'grade' },
        { header: 'Stream', key: 'stream' },
        { header: 'NEMIS UPI', key: (l) => l.nemisUpi || 'MISSING' },
        { header: 'Guardian Name', key: 'guardianName' },
        { header: 'Guardian Phone', key: 'guardianPhone' },
        { header: 'Term Fee (KES)', key: (l) => l.fees.totalTermFee },
        { header: 'Amount Paid (KES)', key: (l) => l.fees.paidAmount },
        { header: 'Fee Balance (KES)', key: (l) => l.fees.balance },
        { header: 'Fee Status', key: (l) => l.fees.status },
      ]
    );
    showToast(`Exported ${filteredLearners.length} learner records (.csv) successfully.`);
  };

  // Handle Recording Payment in Drawer
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLearner) return;
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      showToast('Please enter a valid payment amount.');
      return;
    }

    const newPayment: DarajaMpesaPayment = {
      transId: `MP${Date.now().toString().slice(-6)}`,
      billRefNumber: selectedLearner.admissionNo,
      transAmount: amount,
      msisdn: selectedLearner.guardianPhone || '254712000000',
      firstName: selectedLearner.guardianName.split(' ')[0] || 'Guardian',
      middleName: '',
      lastName: selectedLearner.guardianName.split(' ')[1] || '',
      transTime: new Date().toISOString(),
      matchedLearnerId: selectedLearner.id,
      matchedLearnerName: selectedLearner.name,
      allocatedVotehead: paymentVotehead as any,
      receiptNumber: `REC-${Date.now().toString().slice(-5)}`,
      status: 'Confirmed',
    };

    onProcessPayment(newPayment);
    showToast(`Recorded KES ${amount.toLocaleString()} for ${selectedLearner.name}. Balance updated.`);
    setPaymentAmount('');

    // Update local selected learner reference
    const updatedBalance = Math.max(0, selectedLearner.fees.balance - amount);
    const updatedPaid = selectedLearner.fees.paidAmount + amount;
    const updatedStatus = updatedBalance === 0 ? 'Cleared' : updatedBalance > selectedLearner.fees.totalTermFee * 0.4 ? 'Defaulter' : 'Partial';

    setSelectedLearner({
      ...selectedLearner,
      fees: {
        ...selectedLearner.fees,
        paidAmount: updatedPaid,
        balance: updatedBalance,
        status: updatedStatus,
      },
    });
  };

  // Handle Sending SMS in Drawer
  const handleSendSms = () => {
    if (!selectedLearner) return;
    onSendSmsReminder(selectedLearner, smsCustomMessage.trim() || undefined);
    showToast(`SMS fee reminder dispatched to ${selectedLearner.guardianPhone} (${selectedLearner.guardianName}).`);
    setSmsCustomMessage('');
  };

  // Handle Saving Missing UPI
  const handleSaveUpi = () => {
    if (!selectedLearner) return;
    if (!editingUpi.trim()) {
      showToast('Please enter a valid NEMIS UPI.');
      return;
    }
    onUpdateLearnerUpi(selectedLearner.id, editingUpi.trim());
    setSelectedLearner({ ...selectedLearner, nemisUpi: editingUpi.trim() });
    setIsEditingUpiActive(false);
    showToast(`Updated NEMIS UPI for ${selectedLearner.name}. Verified with MoE.`);
  };

  // Handle Task Action Click
  const handleTaskAction = (task: AttentionTask) => {
    if (task.id === 'task-1') {
      setFeeStatusFilter('Missing UPI');
      showToast('Filtered table to learners missing NEMIS UPI.');
    } else if (task.id === 'task-2') {
      setFeeStatusFilter('Defaulter');
      showToast('Filtered table to fee defaulters.');
    } else if (task.id === 'task-3') {
      onOpenUploadMarksheet();
    } else if (task.id === 'task-4') {
      onSelectTab('daraja');
    }

    // Toggle Task completion
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <div className={`space-y-6 transition-colors duration-200 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950 text-white border border-emerald-500 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-bold">{feedbackToast}</span>
          <button onClick={() => setFeedbackToast(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MOE DIRECTOR VIEW & PRINT MODE BANNER */}
      {currentUser.role === 'moe_director' && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-400 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-2xl shrink-0">🇰🇪</span>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-400">
                Ministry of Education · Kiambu County Oversight Directorate Session
              </div>
              <div className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                School Platform active in <strong className="font-bold underline">View & Print Mode Only</strong>. School administrative operations (admissions, class renaming, ledger mutations) are restricted to institutional principals.
              </div>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-black shadow-xs flex items-center gap-1.5 shrink-0 transition-colors self-start sm:self-auto"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print School Overview</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          1. GREETING + THREE SMALL STATUS CHIPS (NO LARGE BANNER)
          ========================================================================= */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white flex items-center gap-2">
            <span>Good day, {currentUser.name.split(' ')[0]} {currentUser.name.split(' ')[1] || ''}</span>
            <span className="text-lg">👋</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
            Limuru Model Comprehensive School · Operations & CBC Governance Hub
          </p>
        </div>

        {/* Three Small Status Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
            <span>Paybill 522123 Live</span>
          </span>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            <span>KEMIS Live Sync</span>
          </span>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            <span>TPAD 2.0 Linked</span>
          </span>
        </div>
      </div>

      {/* =========================================================================
          2. FOUR SUMMARY CARDS (CLICKABLE WITH SPECIFIED ACTIONS)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Enrolled Learners (Clickable -> Shows everyone in table) */}
        <button
          onClick={() => {
            setFeeStatusFilter('All');
            setSearchTerm('');
            showToast('Showing all enrolled learners.');
          }}
          className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer group ${
            isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-500 shadow-xs'
          }`}
          title="Click to view all enrolled learners"
        >
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-bold mb-1">
            <span>Enrolled Learners</span>
            <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight text-slate-950 dark:text-white">
            {metrics.totalStudents.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-center justify-between">
            <span className="text-emerald-800 dark:text-emerald-400 font-bold">Grade 1 to 9</span>
            <span className="underline group-hover:text-emerald-600">Show All →</span>
          </div>
        </button>

        {/* Card 2: Fees Collected (Clickable -> Filters to learners who are owing) */}
        <button
          onClick={() => {
            setFeeStatusFilter('Defaulter');
            showToast('Filtered table to learners with fee balances.');
          }}
          className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer group ${
            isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-500 shadow-xs'
          }`}
          title="Click to filter to learners with pending balances"
        >
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-bold mb-1">
            <span>Fees Collected</span>
            <CreditCard className="w-4 h-4 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight text-emerald-800 dark:text-emerald-400">
            KES {(metrics.totalFeesPaid / 1000000).toFixed(2)}M
          </div>
          <div className="mt-2 text-xs flex items-center justify-between">
            <span className="font-black text-emerald-800 dark:text-emerald-400">{metrics.feeRate}% Rate</span>
            <span className="text-rose-600 dark:text-rose-400 font-black underline group-hover:text-rose-500">
              Filter Owing ({metrics.defaultersCount}) →
            </span>
          </div>
        </button>

        {/* Card 3: Attendance Today (Clickable -> Opens by-grade breakdown modal) */}
        <button
          onClick={() => setIsAttendanceModalOpen(true)}
          className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer group ${
            isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-500 shadow-xs'
          }`}
          title="Click to view attendance by grade breakdown"
        >
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-bold mb-1">
            <span>Attendance Today</span>
            <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight text-slate-950 dark:text-white">
            {metrics.attendanceRate}% Present
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-center justify-between">
            <span className="text-emerald-800 dark:text-emerald-400 font-bold">{metrics.presentCount} in School</span>
            <span className="underline group-hover:text-emerald-600">Breakdown →</span>
          </div>
        </button>

        {/* Card 4: CBC Performance (Clickable -> Scrolls to/activates CBC panel) */}
        <button
          onClick={() => {
            const el = document.getElementById('cbc-performance-section');
            el?.scrollIntoView({ behavior: 'smooth' });
            showToast('Jumped to CBC Performance panel.');
          }}
          className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer group ${
            isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-500 shadow-xs'
          }`}
          title="Click to jump to CBC Performance metrics"
        >
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-bold mb-1">
            <span>CBC Performance</span>
            <Award className="w-4 h-4 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight text-slate-950 dark:text-white">
            {metrics.cbcProficiencyRate}% Proficient
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-center justify-between">
            <span className="text-emerald-800 dark:text-emerald-400 font-bold">EE & ME Mastery</span>
            <span className="underline group-hover:text-emerald-600">View CBC →</span>
          </div>
        </button>
      </div>

      {/* =========================================================================
          3. MIDDLE SECTION: CBC CURRICULAR PROGRESS & LEARNING MILESTONES + "NEEDS ATTENTION"
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: CBC Curricular Progress & Learning Milestones */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-black text-slate-950 dark:text-white text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <span>Term CBC Curricular Progress & Learning Milestones</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Grade-level syllabus coverage, formative strand mastery (EE/ME), and KNEC project assessments
              </p>
            </div>

            {/* Filter & Print/Export Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold">
                {(['All', 'Primary', 'JSS'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setCbcMilestoneFilter(f)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      cbcMilestoneFilter === f
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-950'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button
                onClick={handlePrintCbcMilestones}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                title="Print CBC Curricular Milestone Progress"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                onClick={handleExportCbcMilestones}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                title="Export CBC Milestones to Excel CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel (.csv)</span>
              </button>
            </div>
          </div>

          {/* CBC Milestone Progress Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Grade Tier</th>
                  <th className="p-3">Syllabus Coverage</th>
                  <th className="p-3">Strands Complete</th>
                  <th className="p-3">Proficiency (ME/EE)</th>
                  <th className="p-3">Project Status</th>
                  <th className="p-3">Lead Faculty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredCbcMilestones.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-bold text-slate-950 dark:text-white">
                      <span>{m.grade}</span>
                      <span className="block text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-mono">
                        {m.level}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span>{m.syllabusCoveredPercent}%</span>
                          <span className="text-slate-500 font-normal">Target: 85%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            style={{ width: `${m.syllabusCoveredPercent}%` }}
                            className="h-full bg-emerald-600 rounded-full"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {m.strandsCompleted}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                        {m.proficiencyRate}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                      {m.projectWorkStatus}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 font-semibold">
                      {m.leadTeacher}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* =========================================================================
          4. CBC PERFORMANCE PANEL + COMPACT RECENT M-PESA PAYMENTS PANEL
          ========================================================================= */}
      <div id="cbc-performance-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CBC Performance Panel with Grade Selector (Grades 4-9) & Animated Bars */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-black text-slate-950 dark:text-white text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <span>CBC Competency Mastery (Summative & Formative)</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Four-tier assessment rubric: Exceeding (EE), Meeting (ME), Approaching (AE), Below (BE)
              </p>
            </div>

            {/* Grade Selector: Grade 4 to Grade 9 */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs font-bold bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-300 dark:border-slate-700">
              {['Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedCbcGrade(g)}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                    selectedCbcGrade === g
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Areas with Animated Competency Breakdown Bars */}
          <div className="space-y-4 pt-1">
            {[
              { subject: 'Integrated Science & STEM', ee: 38, me: 52, ae: 8, be: 2 },
              { subject: 'Mathematics & Computational Thinking', ee: 42, me: 48, ae: 7, be: 3 },
              { subject: 'English & Communication Arts', ee: 45, me: 46, ae: 6, be: 3 },
              { subject: 'Kiswahili & Fasihi Simulizi', ee: 40, me: 50, ae: 8, be: 2 },
              { subject: 'Social Studies & Life Skills', ee: 50, me: 44, ae: 5, be: 1 },
              { subject: 'Creative Arts & Sports', ee: 55, me: 40, ae: 4, be: 1 },
            ].map((area, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-950 dark:text-white">{area.subject}</span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-emerald-800 dark:text-emerald-400 font-black">{area.ee}% EE</span>
                    <span className="text-blue-700 dark:text-blue-400 font-bold">{area.me}% ME</span>
                    <span className="text-amber-700 dark:text-amber-400">{area.ae}% AE</span>
                    <span className="text-rose-600 dark:text-rose-400">{area.be}% BE</span>
                  </div>
                </div>

                {/* Animated Multi-Segment Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex shadow-inner">
                  <div style={{ width: `${area.ee}%` }} className="bg-emerald-600 h-full transition-all duration-500" title={`EE: ${area.ee}%`} />
                  <div style={{ width: `${area.me}%` }} className="bg-blue-600 h-full transition-all duration-500" title={`ME: ${area.me}%`} />
                  <div style={{ width: `${area.ae}%` }} className="bg-amber-500 h-full transition-all duration-500" title={`AE: ${area.ae}%`} />
                  <div style={{ width: `${area.be}%` }} className="bg-rose-500 h-full transition-all duration-500" title={`BE: ${area.be}%`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compact Recent M-Pesa Payments Panel with Direct Simulate Push Trigger */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <h3 className="font-black text-slate-950 dark:text-white text-base">Recent M-Pesa Feeds</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMpesaFeedsCollapsed(!isMpesaFeedsCollapsed)}
                className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                {isMpesaFeedsCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onSelectTab('daraja')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-md text-[11px] font-bold shadow-xs transition-colors border border-slate-700 flex items-center gap-1"
                title="Configure Safaricom Daraja API keys, Till/Paybill, and passkeys in Settings"
              >
                <span>API Settings</span>
              </button>
            </div>
          </div>

          {!isMpesaFeedsCollapsed && (
            <>
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
                {darajaPayments.slice(0, 5).map((pay, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center text-xs"
                  >
                    <div>
                      <strong className="text-slate-950 dark:text-white block">{pay.matchedLearnerName}</strong>
                      <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 block">
                        {pay.transId} · Ref: {pay.billRefNumber}
                      </span>
                      <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold block">
                        {pay.allocatedVotehead}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black font-mono text-emerald-800 dark:text-emerald-400 tabular-nums block text-sm">
                        KES {pay.transAmount.toLocaleString()}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-950 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                        Auto-Credited
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onSelectTab('daraja')}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors border border-slate-300 dark:border-slate-700 text-center block"
              >
                Open Full Daraja Gateway & Webhook Log →
              </button>
            </>
          )}
        </div>
      </div>


      {/* =========================================================================
          MODAL 1: LEARNER DOSSIER SIDE PANEL (RECORD PAYMENT, DISPATCH SMS, EDIT UPI)
          ========================================================================= */}
      {selectedLearner && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg h-full shadow-2xl p-6 overflow-y-auto space-y-5 animate-in slide-in-from-right duration-200 border-l border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-black uppercase block">
                  Admission: {selectedLearner.admissionNo}
                </span>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  {selectedLearner.name}
                </h3>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold block">
                  {selectedLearner.grade} · Stream: {selectedLearner.stream}
                </span>
              </div>
              <button
                onClick={() => setSelectedLearner(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* UPI Section with In-place Edit */}
            <div className="p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">MoE NEMIS UPI Identifier:</span>
                {!isEditingUpiActive && (
                  <button
                    onClick={() => {
                      setEditingUpi(selectedLearner.nemisUpi || '');
                      setIsEditingUpiActive(true);
                    }}
                    className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 font-bold underline"
                  >
                    {selectedLearner.nemisUpi ? 'Edit UPI' : 'Add Missing UPI +'}
                  </button>
                )}
              </div>

              {isEditingUpiActive ? (
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={editingUpi}
                    onChange={(e) => setEditingUpi(e.target.value.toUpperCase())}
                    placeholder="e.g. B8219412"
                    className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono font-bold bg-white dark:bg-slate-800 uppercase"
                  />
                  <button
                    onClick={handleSaveUpi}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingUpiActive(false)}
                    className="px-2 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="text-xs font-mono font-bold">
                  {selectedLearner.nemisUpi ? (
                    <span className="text-emerald-800 dark:text-emerald-400">{selectedLearner.nemisUpi}</span>
                  ) : (
                    <span className="text-rose-600 font-black flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Missing UPI — Learner is not drawing official capitation!
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Fee Status Card */}
            <div className="p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2 text-xs">
              <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                Term 1 Fee Account
              </span>
              <div className="grid grid-cols-3 gap-2 py-1 border-t border-b border-slate-200 dark:border-slate-700 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">Total Fee</span>
                  <strong className="text-slate-900 dark:text-white">KES {selectedLearner.fees.totalTermFee.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Paid Amount</span>
                  <strong className="text-emerald-700 dark:text-emerald-400">KES {selectedLearner.fees.paidAmount.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Outstanding</span>
                  <strong className="text-rose-600 dark:text-rose-400">KES {selectedLearner.fees.balance.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* ACTION 1: Bank Payment & Fee Balance Adjustment */}
            <div className="p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs text-slate-950 dark:text-white flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <span>Direct Bank Deposit / Fee Edit</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingBankPayment(!isEditingBankPayment)}
                  className="text-xs text-emerald-700 dark:text-emerald-400 font-bold underline flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{isEditingBankPayment ? 'Standard Form' : 'Bank Slip Edit'}</span>
                </button>
              </div>

              {isEditingBankPayment ? (
                <div className="space-y-2.5 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-950 dark:text-emerald-200">
                    Use this form when fees have been paid directly via bank deposit slip, RTGS, or EFT to clear learner balance.
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Bank & Branch
                    </label>
                    <select
                      value={bankPaymentData.bankName}
                      onChange={(e) => setBankPaymentData({ ...bankPaymentData, bankName: e.target.value })}
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800"
                    >
                      <option value="Co-operative Bank - Limuru Branch">Co-operative Bank - Limuru Branch (Acc: 01129048192000)</option>
                      <option value="Kenya Commercial Bank (KCB) - Limuru">Kenya Commercial Bank (KCB) - Limuru (Acc: 1104829102)</option>
                      <option value="Equity Bank - Limuru Town">Equity Bank - Limuru Town</option>
                      <option value="Absa Bank Kenya">Absa Bank Kenya</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Bank Slip / Cheque Ref No
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. COOP-SLIP-9842"
                        value={bankPaymentData.slipReference}
                        onChange={(e) => setBankPaymentData({ ...bankPaymentData, slipReference: e.target.value })}
                        className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold bg-white dark:bg-slate-800 uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Amount Paid (KES)
                      </label>
                      <input
                        type="number"
                        placeholder={`Outstanding: ${selectedLearner.fees.balance}`}
                        value={bankPaymentData.amountPaid}
                        onChange={(e) => setBankPaymentData({ ...bankPaymentData, amountPaid: e.target.value })}
                        className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  {selectedLearner.fees.balance > 0 && (
                    <button
                      type="button"
                      onClick={() => setBankPaymentData({ ...bankPaymentData, amountPaid: selectedLearner.fees.balance.toString() })}
                      className="text-[11px] text-emerald-800 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>⚡ Auto-fill Full Clearance: KES {selectedLearner.fees.balance.toLocaleString()}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const amt = parseFloat(bankPaymentData.amountPaid);
                      if (!amt || amt <= 0) {
                        showToast('Please specify a valid payment amount.');
                        return;
                      }
                      const ref = bankPaymentData.slipReference.trim() || `BNK-${Math.floor(10000 + Math.random() * 90000)}`;

                      const newPayment: DarajaMpesaPayment = {
                        transId: ref,
                        billRefNumber: selectedLearner.admissionNo,
                        transAmount: amt,
                        msisdn: selectedLearner.guardianPhone || '254712000000',
                        firstName: selectedLearner.guardianName.split(' ')[0] || 'Guardian',
                        middleName: '',
                        lastName: selectedLearner.guardianName.split(' ')[1] || '',
                        transTime: new Date().toISOString(),
                        matchedLearnerId: selectedLearner.id,
                        matchedLearnerName: selectedLearner.name,
                        allocatedVotehead: 'Tuition & CBC Learning Materials' as any,
                        receiptNumber: `BNK-REC-${Date.now().toString().slice(-5)}`,
                        status: 'Confirmed',
                      };

                      onProcessPayment(newPayment);

                      const updatedBalance = Math.max(0, selectedLearner.fees.balance - amt);
                      const updatedPaid = selectedLearner.fees.paidAmount + amt;
                      const updatedStatus = updatedBalance === 0 ? 'Cleared' : updatedBalance > selectedLearner.fees.totalTermFee * 0.4 ? 'Defaulter' : 'Partial';

                      setSelectedLearner({
                        ...selectedLearner,
                        fees: {
                          ...selectedLearner.fees,
                          paidAmount: updatedPaid,
                          balance: updatedBalance,
                          status: updatedStatus,
                        },
                      });

                      showToast(`Bank deposit of KES ${amt.toLocaleString()} recorded via ${bankPaymentData.bankName}. Slip Ref: ${ref}. Balance cleared!`);
                      setBankPaymentData({ ...bankPaymentData, amountPaid: '', slipReference: '' });
                      setIsEditingBankPayment(false);
                    }}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs"
                  >
                    Confirm Bank Clearance & Update Ledger
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRecordPayment} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Amount (KES)
                      </label>
                      <input
                        type="number"
                        min="100"
                        placeholder="e.g. 5000"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold bg-white dark:bg-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Votehead Allocation
                      </label>
                      <select
                        value={paymentVotehead}
                        onChange={(e) => setPaymentVotehead(e.target.value)}
                        className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800"
                      >
                        <option value="Tuition & CBC Learning Materials">Tuition & CBC</option>
                        <option value="School Feeding Program">Feeding Program</option>
                        <option value="PTA & Infrastructure Levy">PTA & Infrastructure</option>
                        <option value="Co-Curricular & Sports">Co-Curricular</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-black text-xs shadow-xs"
                  >
                    Apply Payment & Post Receipt
                  </button>
                </form>
              )}
            </div>

            {/* ACTION 2: Send SMS Reminder */}
            <div className="p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs text-slate-950 dark:text-white flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-emerald-700" />
                  <span>Send Guardian SMS Reminder</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-500">{selectedLearner.guardianPhone}</span>
              </div>

              <textarea
                value={smsCustomMessage}
                onChange={(e) => setSmsCustomMessage(e.target.value)}
                placeholder={`Default: Jambo ${selectedLearner.guardianName}, fee balance for ${selectedLearner.name} is KES ${selectedLearner.fees.balance.toLocaleString()}. Pay via Paybill 522123, Acc: ${selectedLearner.admissionNo}.`}
                rows={2}
                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800"
              />

              <button
                type="button"
                onClick={handleSendSms}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dispatch Instant SMS Alert</span>
              </button>
            </div>

            <button
              onClick={() => setSelectedLearner(null)}
              className="w-full py-2.5 bg-slate-900 text-white dark:bg-slate-800 rounded-xl font-bold text-xs"
            >
              Close Dossier (Esc)
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ATTENDANCE TODAY BY-GRADE BREAKDOWN
          ========================================================================= */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-700" />
                  <span>Attendance Today by Grade Cohort</span>
                </h3>
                <span className="text-xs text-slate-500 font-semibold block">
                  Term 1 Week 7 · Live biometric & roll-call morning audit
                </span>
              </div>
              <button
                onClick={() => setIsAttendanceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
              {[
                { grade: 'Grade 1', enrolled: 154, present: 151, absent: 3, rate: 98.0 },
                { grade: 'Grade 2', enrolled: 148, present: 144, absent: 4, rate: 97.2 },
                { grade: 'Grade 3', enrolled: 160, present: 156, absent: 4, rate: 97.5 },
                { grade: 'Grade 4', enrolled: 158, present: 152, absent: 6, rate: 96.2 },
                { grade: 'Grade 5', enrolled: 162, present: 155, absent: 7, rate: 95.6 },
                { grade: 'Grade 6 (KPSEA)', enrolled: 150, present: 147, absent: 3, rate: 98.0 },
                { grade: 'Grade 7 (JSS)', enrolled: 165, present: 158, absent: 7, rate: 95.7 },
                { grade: 'Grade 8 (JSS)', enrolled: 155, present: 149, absent: 6, rate: 96.1 },
                { grade: 'Grade 9 (KJSEA)', enrolled: 152, present: 148, absent: 4, rate: 97.3 },
              ].map((row, i) => (
                <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900 dark:text-white block">{row.grade}</strong>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {row.present} of {row.enrolled} present · {row.absent} absent
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-800 dark:text-emerald-400 font-mono block">
                      {row.rate}%
                    </span>
                    <button
                      onClick={() => showToast(`Sent morning roll-call absentee alerts for ${row.grade}.`)}
                      className="text-[10px] text-slate-500 hover:text-emerald-700 underline font-semibold"
                    >
                      Alert Absent Guardians
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsAttendanceModalOpen(false)}
              className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold text-xs"
            >
              Close Attendance Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
