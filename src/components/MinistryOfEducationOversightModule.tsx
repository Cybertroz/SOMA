/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  ArrowRightLeft,
  Users,
  Search,
  Filter,
  Download,
  Printer,
  X,
  ExternalLink,
  Award,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  Radio,
  Check,
  Building,
  School,
  Key,
  KeyRound,
  Settings,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  TrendingUp,
  MapPin,
  Send,
  Eye,
  Bookmark,
  Share2,
  HelpCircle,
  Clock,
  ChevronDown,
  Globe,
  FileSpreadsheet,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  AuthUser,
  KiambuSchoolRecord,
  MoeCapitationDisbursement,
  MoeTransferApproval,
  MoeSchoolMajorApproval,
  Learner,
  MoeStatutoryReport,
  MoeSigningOfficer,
  InstitutionalSuffixAudit,
  KnecLearnerMappingRecord,
  TeacherWorkloadMatchingReturn,
  StemLabFacilityReturn,
  SanitationRatioReturn,
  CapitationReconciliationReturn,
  UniformCostControlReturn,
  SneAssessmentReturn,
  ComprehensiveSafetyReturn,
  SeniorTransitionComplianceReturn,
  PriorityActionItem,
} from '../types/school';
import {
  INITIAL_MOE_STATUTORY_REPORTS,
  INITIAL_MOE_SIGNING_OFFICERS,
} from '../data/mockMoeData';
import {
  INITIAL_SUFFIX_AUDITS,
  INITIAL_KNEC_MAPPINGS,
  INITIAL_TEACHER_WORKLOADS,
  INITIAL_STEM_LAB_AUDITS,
  INITIAL_SANITATION_AUDITS,
  INITIAL_CAPITATION_RECONCILIATIONS,
  INITIAL_UNIFORM_COST_RETURNS,
  INITIAL_SNE_RETURNS,
  INITIAL_SAFETY_RETURNS,
  INITIAL_TRANSITION_RETURNS,
  INITIAL_PRIORITY_ACTION_ITEMS,
} from '../data/mockExecutiveAuditData';
import { exportToExcel } from '../utils/excelExport';
import { MoeStatutoryReportsView } from './MoeStatutoryReportsView';
import { MoeSigningSettingsView } from './MoeSigningSettingsView';
import { MoeExecutiveDirectiveAuditsView } from './MoeExecutiveDirectiveAuditsView';

interface Props {
  currentUser: AuthUser;
  schools: KiambuSchoolRecord[];
  disbursements: MoeCapitationDisbursement[];
  transfers: MoeTransferApproval[];
  majorApprovals: MoeSchoolMajorApproval[];
  limuruLearners: Learner[];
  onApproveTransfer: (transferId: string, reviewedBy: string) => void;
  onRejectTransfer: (transferId: string, reason: string) => void;
  onApproveDisbursement: (disbursementId: string, approverName: string) => void;
  onApproveMajorRequest: (requestId: string, approverName: string) => void;
  onLogAudit: (action: any, resource: string, details: string, sensitivity?: any) => void;
}

// Translations Dictionary for Kiswahili & English
const TRANSLATIONS = {
  en: {
    overviewTitle: 'MOE Overview',
    stateOversight: 'State Oversight',
    lastSynced: 'Last synced: Today at 08:42 AM (NEMIS Live Sync)',
    exportBtn: 'Export Excel/PDF',
    printSummary: 'Print Summary',
    signKeyRequired: 'Security Sign Key Required',
    signKeyActive: 'PKI Key Authenticated',
    alertStripText: 'transfers need your approval before Friday',
    reviewBtn: 'Review',
    totalSchools: 'Total Schools',
    enrolledLearners: 'Enrolled Learners',
    vsLastTerm: 'vs last term',
    capitationDisbursed: 'Capitation Disbursed',
    expectedAmt: 'expected',
    pendingApprovals: 'Pending Approvals',
    actionRequired: 'Action required',
    sidebarSchools: 'Schools',
    sidebarFinance: 'Finance',
    sidebarCompliance: 'Compliance',
    sidebarAdmin: 'Admin',
    menuCountySchools: 'County Schools & Executions',
    menuSubCountyMap: 'Map of Sub-Counties',
    menuDirectives: 'Directives Tracking',
    menuCapitation: 'Capitation & Warrants',
    menuAuditBudgets: 'Audit Reports & Budgets',
    menuReconciliations: 'Capitation Reconciliations',
    menuTransfers: 'Transfer Authorizations',
    menuStatutory: 'Statutory MoE Reports',
    menuGapAudits: 'Executive Gap Audits',
    menuExamReadiness: 'Exam Readiness',
    menuSigningSettings: 'Signing Settings & Passkeys',
    menuAuditLedger: 'Security & Audit Ledger',
    filterAll: 'All',
    filterPublic: 'Public',
    filterPrivate: 'Private',
    filterSne: 'SNE',
    filterNeedsReview: 'Needs Review',
    saveThisView: 'Save this view',
    searchPlaceholder: 'Search 12 schools by name, center code, or principal...',
    thSchool: 'School Name & Code',
    thSubCounty: 'Sub-County',
    thCategory: 'Category',
    thLearners: 'Learners',
    thCapitation: 'Capitation',
    thCompliance: 'Compliance',
    thStatus: 'Status',
    thActions: 'Actions',
    btnFreeze: 'Freeze',
    btnDetails: 'Details',
    freezeConfirmTitle: 'Confirm Institutional Freeze',
    freezeWarning: 'Freezing this institution halts capitation disbursements, KEMIS transfers, and national examination portal access under Section 43 of Basic Education Act.',
    cancel: 'Cancel',
    confirmFreeze: 'Confirm Operational Freeze',
    schoolDrawerTitle: 'School Institutional Dossier',
    capitationTimeline: 'Four-Step Capitation Disbursement Timeline',
    step1: '1. Enrollment Verified',
    step2: '2. Warrant Issued',
    step3: '3. IFMIS Released',
    step4: '4. School Receipt Confirmed',
    waiting: 'waiting',
    done: 'done',
    privateNote: 'Private Academy: Does not receive public FPE/FDSE capitation grants, but remains subject to mandatory KEMIS registration, teacher TPAD returns, and KNEC assessment oversight.',
    tasksTitle: 'My Tasks & Pending Actions',
    directiveRemind: 'Remind',
    directiveReminded: 'Reminder sent',
    daysLeft: 'days left',
    missingDetails: 'missing details',
  },
  sw: {
    overviewTitle: 'Tathmini ya Wizara ya Elimu (MOE)',
    stateOversight: 'Usimamizi wa Serikali',
    lastSynced: 'Ilisasishwa: Leo saa 08:42 Asubuhi (NEMIS Moja kwa Moja)',
    exportBtn: 'Pakua Excel/PDF',
    printSummary: 'Chapisha Muhtasari',
    signKeyRequired: 'Ufunguo wa Sahihi Unahitajika',
    signKeyActive: 'Sahihi ya PKI Imethibitishwa',
    alertStripText: 'uhamisho unahitaji idhini yako kabla ya Ijumaa',
    reviewBtn: 'Kagua',
    totalSchools: 'Jumla ya Shule',
    enrolledLearners: 'Wanafunzi Waliosajiliwa',
    vsLastTerm: 'ikilinganishwa na muhula uliopita',
    capitationDisbursed: 'Fedha za Capitation Zilizotolewa',
    expectedAmt: 'inayotarajiwa',
    pendingApprovals: 'Idhini Zinazosubiri',
    actionRequired: 'Hatua inahitajika',
    sidebarSchools: 'Shule',
    sidebarFinance: 'Fedha',
    sidebarCompliance: 'Utiifu wa Sheria',
    sidebarAdmin: 'Utawala',
    menuCountySchools: 'Shule za Kaunti & Utekelezaji',
    menuSubCountyMap: 'Ramani ya Kaunti Ndogo',
    menuDirectives: 'Ufuatiliaji wa Maagizo',
    menuCapitation: 'Capitation & Hati za Hazina',
    menuAuditBudgets: 'Ripoti za Ukaguzi na Bajeti',
    menuReconciliations: 'Ulinganifu wa Capitation',
    menuTransfers: 'Idhini za Uhamisho',
    menuStatutory: 'Ripoti za Kisheria za MoE',
    menuGapAudits: 'Ukaguzi wa Maagizo Maalumu',
    menuExamReadiness: 'Utayari wa Mitihani ya Kitaifa',
    menuSigningSettings: 'Mipangilio ya Sahihi & Nywila',
    menuAuditLedger: 'Usalama na Kumbukumbu ya PKI',
    filterAll: 'Zote',
    filterPublic: 'Za Umma',
    filterPrivate: 'Binafsi',
    filterSne: 'Mahitaji Maalumu (SNE)',
    filterNeedsReview: 'Inahitaji Ukaguzi',
    saveThisView: 'Hifadhi Mtazamo Huu',
    searchPlaceholder: 'Tafuta shule 12 kwa jina, nambari ya kituo...',
    thSchool: 'Jina la Shule & Nambari',
    thSubCounty: 'Kaunti Ndogo',
    thCategory: 'Kategoria',
    thLearners: 'Wanafunzi',
    thCapitation: 'Capitation',
    thCompliance: 'Kiwango cha Utiifu',
    thStatus: 'Hali',
    thActions: 'Vitendo',
    btnFreeze: 'Sitisha',
    btnDetails: 'Maelezo',
    freezeConfirmTitle: 'Thibitisha Kusitisha Huduma za Shule',
    freezeWarning: 'Kusitisha taasisi hii kutazuia malipo ya capitation, uhamisho wa KEMIS, na ufikiaji wa mitihani ya KNEC chini ya Sheria ya Elimu ya Msingi.',
    cancel: 'Ghairi',
    confirmFreeze: 'Thibitisha Kusitisha',
    schoolDrawerTitle: 'Wasifu Kamili wa Shule',
    capitationTimeline: 'Mchakato wa Hatua 4 wa Utoaji wa Capitation',
    step1: '1. Usajili Umethibitishwa',
    step2: '2. Hati Imetolewa',
    step3: '3. IFMIS Imetolewa',
    step4: '4. Risiti ya Shule Imethibitishwa',
    waiting: 'inasubiri',
    done: 'imekamilika',
    privateNote: 'Shule ya Binafsi: Haipokei ruzuku ya umma ya FPE/FDSE, lakini inalazimika kuwasilisha ripoti za KEMIS, TPAD, na kusajili wanafunzi kwenye KNEC.',
    tasksTitle: 'Majukumu Yangu & Hatua Zinazohitajika',
    directiveRemind: 'Kumbusha',
    directiveReminded: 'Kikumbusho kimetumwa',
    daysLeft: 'siku zimesalia',
    missingDetails: 'maelezo yanayokosekana',
  },
};

export function MinistryOfEducationOversightModule({
  currentUser,
  schools: initialSchools,
  disbursements,
  transfers,
  majorApprovals,
  limuruLearners,
  onApproveTransfer,
  onRejectTransfer,
  onApproveDisbursement,
  onApproveMajorRequest,
  onLogAudit,
}: Props) {
  // Language State
  const [lang, setLang] = useState<'en' | 'sw'>('en');
  const t = TRANSLATIONS[lang];

  // Dark Mode Toggle
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('limuru_moe_theme') === 'dark';
  });

  // "View As" Role Switcher State
  const [viewAsRole, setViewAsRole] = useState<
    'CDE' | 'SCDE' | 'DQASO' | 'DSA'
  >('CDE');

  // Sign Key Gate Modal / State
  const [isSignKeyUnlocked, setIsSignKeyUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('limuru_moe_signkey_unlocked') === 'true';
  });
  const [isSignKeyModalOpen, setIsSignKeyModalOpen] = useState(false);
  const [signKeyInput, setSignKeyInput] = useState('');
  const [signKeyError, setSignKeyError] = useState('');

  // Active Sidebar Navigation Tab
  type SidebarTab =
    | 'schools'
    | 'subcounty-map'
    | 'directives'
    | 'capitation'
    | 'audit-budgets'
    | 'reconciliations'
    | 'transfers'
    | 'statutory-reports'
    | 'executive-audits'
    | 'exams'
    | 'signing-settings'
    | 'security';

  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('schools');

  // Schools State & Freeze Mechanism
  const [schools, setSchools] = useState<KiambuSchoolRecord[]>(() => {
    const saved = localStorage.getItem('limuru_moe_schools_registry');
    return saved ? JSON.parse(saved) : initialSchools;
  });

  const [schoolSearch, setSchoolSearch] = useState('');
  const [schoolCategoryFilter, setSchoolCategoryFilter] = useState<
    'All' | 'Public' | 'Private' | 'SNE' | 'Needs Review'
  >('All');
  const [selectedSubCountyFilter, setSelectedSubCountyFilter] = useState<string>('All');

  // Freeze Modal State
  const [schoolToFreeze, setSchoolToFreeze] = useState<KiambuSchoolRecord | null>(null);

  // School Detail Drawer State
  const [selectedSchoolForDrawer, setSelectedSchoolForDrawer] = useState<KiambuSchoolRecord | null>(null);

  // Saved Views State (LocalStorage)
  const [savedViews, setSavedViews] = useState<{ id: string; name: string; filter: string; search: string }[]>(() => {
    const s = localStorage.getItem('limuru_moe_saved_views');
    return s
      ? JSON.parse(s)
      : [
          { id: 'v1', name: 'Public Gaps', filter: 'Needs Review', search: '' },
          { id: 'v2', name: 'Limuru Hub', filter: 'All', search: 'Limuru' },
        ];
  });

  // Transfer Inline Review Panel State
  const [isTransferPanelOpen, setIsTransferPanelOpen] = useState(false);
  const [rejectingTransferId, setRejectingTransferId] = useState<string | null>(null);
  const [rejectionComment, setRejectionComment] = useState('');

  // My Tasks Bell Dropdown State
  const [isTasksOpen, setIsTasksOpen] = useState(false);

  // Directives State
  const [directives, setDirectives] = useState([
    {
      id: 'dir_01',
      title: 'Executive Order on Suffix Separation (_PS / _JS)',
      mandate: 'Presidency Directive No. 04 of 2026',
      dueDate: '2026-11-15',
      acknowledgedCount: 10,
      totalCount: 12,
      reminded: false,
    },
    {
      id: 'dir_02',
      title: 'Zero-Rejection Senior Secondary (100% Transition)',
      mandate: 'Basic Education Circular Ref. 19/2026',
      dueDate: '2026-11-20',
      acknowledgedCount: 9,
      totalCount: 12,
      reminded: false,
    },
    {
      id: 'dir_03',
      title: 'Compulsory Uniform Price Cap (KES 3,500 Ceiling)',
      mandate: 'National Education Board Gazettement',
      dueDate: '2026-11-30',
      acknowledgedCount: 11,
      totalCount: 12,
      reminded: false,
    },
    {
      id: 'dir_04',
      title: 'Dormitory Outward-Opening Panic Bolts Audit',
      mandate: 'Safety Standards Manual Notice 2026',
      dueDate: '2026-11-10',
      acknowledgedCount: 8,
      totalCount: 12,
      reminded: false,
    },
  ]);

  // Exam Readiness State (KPSEA & KJSEA)
  const [examReadiness, setExamReadiness] = useState([
    {
      schoolName: 'Juja Progressive Junior Academy',
      centerCode: '20409540',
      subCounty: 'Juja',
      kpseaCandidates: 82,
      kjseaCandidates: 74,
      registeredPercent: 84,
      missingDetailsCount: 25,
      daysToExam: 42,
    },
    {
      schoolName: 'Thika Road Model Primary & JSS',
      centerCode: '20403310',
      subCounty: 'Thika',
      kpseaCandidates: 220,
      kjseaCandidates: 198,
      registeredPercent: 88,
      missingDetailsCount: 50,
      daysToExam: 42,
    },
    {
      schoolName: 'Ruiru Central Comprehensive School',
      centerCode: '20405204',
      subCounty: 'Ruiru',
      kpseaCandidates: 154,
      kjseaCandidates: 139,
      registeredPercent: 91,
      missingDetailsCount: 26,
      daysToExam: 42,
    },
    {
      schoolName: 'Kiambu Township Primary & JSS',
      centerCode: '20401105',
      subCounty: 'Kiambu Municipality',
      kpseaCandidates: 182,
      kjseaCandidates: 165,
      registeredPercent: 96,
      missingDetailsCount: 14,
      daysToExam: 42,
    },
    {
      schoolName: 'Limuru Model Comprehensive School',
      centerCode: '20401823',
      subCounty: 'Limuru',
      kpseaCandidates: 124,
      kjseaCandidates: 118,
      registeredPercent: 100,
      missingDetailsCount: 0,
      daysToExam: 42,
    },
    {
      schoolName: 'Alliance Model Junior Secondary School',
      centerCode: '20400812',
      subCounty: 'Kikuyu',
      kpseaCandidates: 0,
      kjseaCandidates: 210,
      registeredPercent: 100,
      missingDetailsCount: 0,
      daysToExam: 42,
    },
  ]);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keyboard shortcut: Escape dismisses drawers/modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedSchoolForDrawer(null);
        setIsTransferPanelOpen(null as any);
        setSchoolToFreeze(null);
        setIsTasksOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Theme persistence
  useEffect(() => {
    localStorage.setItem('limuru_moe_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Pending Transfers count
  const pendingTransfers = useMemo(
    () => transfers.filter((t) => t.status === 'Pending CDE Approval'),
    [transfers]
  );
  const pendingTransfersCount = pendingTransfers.length;

  // Key Totals
  const totalCountyEnrolled = useMemo(
    () => schools.reduce((sum, s) => sum + s.enrolledLearners, 0),
    [schools]
  );
  const totalCapitationAllocated = useMemo(
    () => disbursements.reduce((sum, d) => sum + d.totalAmountDisbursed, 0),
    [disbursements]
  );
  const expectedCapitation = 50800000; // Expected KES 50.8M
  const capitationPercentage = Math.min(
    100,
    Math.round((totalCapitationAllocated / expectedCapitation) * 100)
  );

  // Sub-County Map Data (12 Sub-Counties in Kiambu)
  const subCountiesMapData = [
    { name: 'Limuru', schoolsCount: 3, learners: 1404, status: 'Optimal' },
    { name: 'Kikuyu', schoolsCount: 2, learners: 1510, status: 'Optimal' },
    { name: 'Kiambu Municipality', schoolsCount: 1, learners: 1120, status: 'Optimal' },
    { name: 'Thika', schoolsCount: 1, learners: 1450, status: 'Needs Review' },
    { name: 'Ruiru', schoolsCount: 1, learners: 960, status: 'Optimal' },
    { name: 'Juja', schoolsCount: 1, learners: 480, status: 'Needs Review' },
    { name: 'Lari', schoolsCount: 1, learners: 310, status: 'SNE Priority' },
    { name: 'Kabete', schoolsCount: 1, learners: 730, status: 'Optimal' },
    { name: 'Gatundu South', schoolsCount: 1, learners: 415, status: 'Optimal' },
    { name: 'Gatundu North', schoolsCount: 0, learners: 0, status: 'Under Census' },
    { name: 'Githunguri', schoolsCount: 0, learners: 0, status: 'Under Census' },
    { name: 'Kiambaa', schoolsCount: 0, learners: 0, status: 'Under Census' },
  ];

  // Schools Table Filtering
  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      // Sub-county filter
      if (selectedSubCountyFilter !== 'All' && s.subCounty !== selectedSubCountyFilter) {
        return false;
      }
      // Category / Status Filter
      if (schoolCategoryFilter === 'Public' && !s.category.includes('Public')) return false;
      if (schoolCategoryFilter === 'Private' && !s.category.includes('Private')) return false;
      if (schoolCategoryFilter === 'SNE' && !s.category.includes('SNE')) return false;
      if (schoolCategoryFilter === 'Needs Review') {
        const isLowCompliance = s.complianceScore < 95;
        const hasUnverified = s.enrolledLearners !== s.verifiedKemisHeadcount;
        const isProvisional = s.accreditationStatus.includes('Provisional') || s.accreditationStatus.includes('Inspection');
        if (!isLowCompliance && !hasUnverified && !isProvisional) return false;
      }
      // Search
      if (schoolSearch) {
        const q = schoolSearch.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.centerCode.toLowerCase().includes(q) ||
          s.principalName.toLowerCase().includes(q) ||
          s.subCounty.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [schools, schoolSearch, schoolCategoryFilter, selectedSubCountyFilter]);

  // Handle Freezing a School
  const handleExecuteFreeze = () => {
    if (!schoolToFreeze) return;
    const updated = schools.map((s) =>
      s.id === schoolToFreeze.id
        ? {
            ...s,
            accreditationStatus: 'Operations Frozen (MoE Mandate)' as any,
            complianceScore: 60,
          }
        : s
    );
    setSchools(updated);
    localStorage.setItem('limuru_moe_schools_registry', JSON.stringify(updated));
    showToast(`Operations frozen for ${schoolToFreeze.name}. SCDE gazetted.`);
    onLogAudit(
      'MOE_SCHOOL_APPROVAL',
      `School Freeze (${schoolToFreeze.centerCode})`,
      `Statutory freeze placed on ${schoolToFreeze.name} by ${currentUser.name}. Capitation and transfers blocked.`,
      'Restricted'
    );
    setSchoolToFreeze(null);
  };

  // Sign Key Unlock Handler
  const handleUnlockSignKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (signKeyInput === '4921' || signKeyInput === 'admin' || signKeyInput.length >= 4) {
      setIsSignKeyUnlocked(true);
      sessionStorage.setItem('limuru_moe_signkey_unlocked', 'true');
      setIsSignKeyModalOpen(false);
      setSignKeyError('');
      showToast('PKI Sign Key validated. Full executive oversight unlocked.');
    } else {
      setSignKeyError('Invalid PIN. Use default official demo PIN: 4921');
    }
  };

  // Handle Save View
  const handleSaveCurrentView = () => {
    const name = prompt('Enter a label for this saved view:', `${schoolCategoryFilter} - ${schoolSearch || 'All'}`);
    if (name) {
      const newView = {
        id: `view_${Date.now()}`,
        name,
        filter: schoolCategoryFilter,
        search: schoolSearch,
      };
      const updated = [newView, ...savedViews];
      setSavedViews(updated);
      localStorage.setItem('limuru_moe_saved_views', JSON.stringify(updated));
      showToast(`Saved view "${name}" to browser.`);
    }
  };

  return (
    <div
      className={`min-h-[85vh] rounded-2xl transition-colors duration-200 ${
        isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950 text-white border border-emerald-500 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          1. SHORT "MOE OVERVIEW" TITLE BAR (NO HERO BANNER, DUPLICATES REMOVED)
          ========================================================================= */}
      <div className={`p-4 sm:p-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
      }`}>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-emerald-900 dark:text-emerald-400 flex items-center gap-2">
              <span>{t.overviewTitle}</span>
              <span className="text-base">🇰🇪</span>
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] font-black rounded-full bg-amber-400 text-slate-950 font-mono uppercase shadow-2xs">
              {t.stateOversight}
            </span>
            {/* "View As" Persona Badge */}
            <span className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">View As:</span>
              <select
                value={viewAsRole}
                onChange={(e) => {
                  setViewAsRole(e.target.value as any);
                  showToast(`Switched active view to ${e.target.value}`);
                }}
                className="bg-transparent font-black text-emerald-800 dark:text-emerald-400 focus:outline-hidden cursor-pointer"
              >
                <option value="CDE">CDE (County Director)</option>
                <option value="SCDE">SCDE (Limuru Sub-County)</option>
                <option value="DQASO">DQASO (Quality Assurance)</option>
                <option value="DSA">DSA (School Auditor)</option>
              </select>
            </span>
          </div>

          {/* Last Synced Note Under Title */}
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>{t.lastSynced}</span>
          </p>
        </div>

        {/* Top Bar Actions: Tasks Bell, Sign Key, Lang Toggle, Dark Mode, Export, Print */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sign Key Authentication Gate Button */}
          <button
            onClick={() => setIsSignKeyModalOpen(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
              isSignKeyUnlocked
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse'
            }`}
            title="Sovereign Ministry Signing Key Status"
          >
            {isSignKeyUnlocked ? <Lock className="w-3.5 h-3.5 text-emerald-600" /> : <Key className="w-3.5 h-3.5 text-amber-600" />}
            <span>{isSignKeyUnlocked ? t.signKeyActive : t.signKeyRequired}</span>
          </button>

          {/* My Tasks Bell with Counter Badge */}
          <div className="relative">
            <button
              onClick={() => setIsTasksOpen(!isTasksOpen)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 relative transition-colors"
              title="My Tasks & Directives"
            >
              <Bell className="w-4 h-4" />
              {pendingTransfersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {pendingTransfersCount}
                </span>
              )}
            </button>

            {/* My Tasks Dropdown Menu */}
            {isTasksOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{t.tasksTitle}</span>
                  <button onClick={() => setIsTasksOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                    <div>
                      <strong className="text-amber-900 dark:text-amber-300 block">{pendingTransfersCount} Pending Transfers</strong>
                      <span className="text-[11px] text-amber-700 dark:text-amber-400">Due before Friday</span>
                    </div>
                    <button
                      onClick={() => {
                        setIsTasksOpen(false);
                        setIsTransferPanelOpen(true);
                      }}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-md shadow-xs"
                    >
                      {t.reviewBtn}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200 block">4 Directives Awaiting</strong>
                      <span className="text-[11px] text-slate-500">2 schools with pending acknowledgment</span>
                    </div>
                    <button
                      onClick={() => {
                        setIsTasksOpen(false);
                        setActiveSidebarTab('directives');
                      }}
                      className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-semibold text-[11px] rounded-md"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Kiswahili / English Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'sw' : 'en')}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
            title="Toggle Kiswahili / English"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{lang === 'en' ? 'SW' : 'EN'}</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Export Excel / PDF Button */}
          <button
            onClick={() => {
              exportToExcel(
                'Kiambu_County_MOE_Statutory_Oversight_Export',
                schools,
                [
                  { header: 'Center Code', key: 'centerCode' },
                  { header: 'School Name', key: 'name' },
                  { header: 'Sub-County', key: 'subCounty' },
                  { header: 'Category', key: 'category' },
                  { header: 'Enrolled Learners', key: 'enrolledLearners' },
                  { header: 'Verified KEMIS', key: 'verifiedKemisHeadcount' },
                  { header: 'Term 1 Capitation (KES)', key: 'fpeFdjseCapitationTerm1' },
                  { header: 'Disbursement Status', key: 'disbursementStatus' },
                  { header: 'Compliance Score (%)', key: 'complianceScore' },
                  { header: 'Accreditation', key: 'accreditationStatus' },
                ]
              );
              showToast('Exported Kiambu County Master Registry to Excel.');
            }}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportBtn}</span>
          </button>

          {/* Print Summary Button */}
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.printSummary}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. ALERT STRIP AT THE TOP
          ========================================================================= */}
      {pendingTransfersCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2.5 shadow-xs flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
            <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" />
            <span>
              <strong>{pendingTransfersCount} {t.alertStripText}</strong>
            </span>
          </div>
          <button
            onClick={() => setIsTransferPanelOpen(true)}
            className="px-3 py-1 bg-slate-950 hover:bg-slate-800 text-white rounded-md text-xs font-bold shadow-xs transition-colors"
          >
            {t.reviewBtn} →
          </button>
        </div>
      )}

      {/* =========================================================================
          3. KPI CARDS WITH CONTEXT (TRENDS, PROGRESS BARS, CLICKABLE PENDING)
          ========================================================================= */}
      <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Schools */}
        <div className={`p-4 rounded-xl border shadow-xs transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-bold mb-1">
            <span>{t.totalSchools}</span>
            <Building2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black tabular-nums tracking-tight text-slate-950 dark:text-white">
            {schools.length} Institutions
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-center justify-between">
            <span className="text-emerald-800 dark:text-emerald-400 font-bold">
              {schools.filter((s) => s.category.includes('Public')).length} Public · {schools.filter((s) => s.category.includes('Private')).length} Private
            </span>
            <span className="font-bold">1 SNE</span>
          </div>
        </div>

        {/* KPI 2: Enrolled Learners with Trend */}
        <div className={`p-4 rounded-xl border shadow-xs transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-bold mb-1">
            <span>{t.enrolledLearners}</span>
            <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black tabular-nums tracking-tight text-slate-950 dark:text-white">
            {totalCountyEnrolled.toLocaleString()}
          </div>
          <div className="mt-2 text-xs flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-black">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>▲ 4.2% {t.vsLastTerm}</span>
            <span className="text-slate-600 dark:text-slate-400 font-semibold">· 100% KEMIS</span>
          </div>
        </div>

        {/* KPI 3: Capitation with Progress Bar */}
        <div className={`p-4 rounded-xl border shadow-xs transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-bold mb-1">
            <span>{t.capitationDisbursed}</span>
            <DollarSign className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black tabular-nums tracking-tight text-emerald-800 dark:text-emerald-400">
            KES {(totalCapitationAllocated / 1000000).toFixed(1)}M
          </div>
          <div className="mt-2 space-y-1">
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${capitationPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
              <span className="font-black text-emerald-800 dark:text-emerald-400">{capitationPercentage}%</span>
              <span>of KES 50.8M {t.expectedAmt}</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Pending Approvals (Big 2, Gold Border, Clickable) */}
        <button
          onClick={() => setIsTransferPanelOpen(true)}
          className={`p-4 rounded-xl border-2 shadow-xs text-left transition-all hover:scale-[1.02] cursor-pointer group ${
            isDarkMode
              ? 'bg-slate-900 border-amber-500/80 hover:border-amber-400'
              : 'bg-amber-50/70 border-amber-400 hover:border-amber-500'
          }`}
          title="Click to review pending transfer authorizations"
        >
          <div className="flex items-center justify-between text-amber-900 dark:text-amber-300 text-xs font-bold mb-1">
            <span>{t.pendingApprovals}</span>
            <ArrowRightLeft className="w-4 h-4 text-amber-700 dark:text-amber-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="text-3xl font-black tabular-nums tracking-tight text-amber-900 dark:text-amber-300">
            {pendingTransfersCount}
          </div>
          <div className="mt-2 text-xs text-amber-800 dark:text-amber-300 font-bold flex items-center justify-between">
            <span>{t.actionRequired}</span>
            <span className="underline text-[11px] font-semibold">Open Panel →</span>
          </div>
        </button>
      </div>

      {/* =========================================================================
          4. MAIN CONTAINER: GROUPED LEFT SIDEBAR + CONTENT VIEW
          ========================================================================= */}
      <div className="px-4 sm:px-5 pb-8 flex flex-col md:flex-row gap-5">
        {/* LEFT SIDEBAR (GROUPED INTO SCHOOLS, FINANCE, COMPLIANCE, ADMIN) */}
        <aside className={`w-full md:w-64 shrink-0 rounded-2xl border p-2 flex md:flex-col overflow-x-auto md:overflow-visible gap-1 self-start ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          {/* GROUP 1: SCHOOLS */}
          <div className="hidden md:block px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-black">
            {t.sidebarSchools}
          </div>
          <button
            onClick={() => setActiveSidebarTab('schools')}
            className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
              activeSidebarTab === 'schools'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950'
            }`}
          >
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>{t.menuCountySchools}</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold">
              {schools.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSidebarTab('subcounty-map')}
            className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSidebarTab === 'subcounty-map'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>{t.menuSubCountyMap}</span>
          </button>

          <button
            onClick={() => setActiveSidebarTab('directives')}
            className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
              activeSidebarTab === 'directives'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950'
            }`}
          >
            <span className="flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-600" />
              <span>{t.menuDirectives}</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold">
              4
            </span>
          </button>

          {/* GROUP 2: FINANCE */}
          <div className="hidden md:block px-3 pt-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-black border-t border-slate-100 dark:border-slate-800 mt-1">
            {t.sidebarFinance}
          </div>
          <button
            onClick={() => setActiveSidebarTab('capitation')}
            className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSidebarTab === 'capitation'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>{t.menuCapitation}</span>
          </button>

          <button
            onClick={() => setActiveSidebarTab('statutory-reports')}
            className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSidebarTab === 'statutory-reports'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950'
            }`}
          >
            <FileText className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <span>{t.menuAuditBudgets}</span>
          </button>

          {/* GROUP 3: COMPLIANCE */}
          <div className="hidden md:block px-3 pt-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-black border-t border-slate-100 dark:border-slate-800 mt-1">
            {t.sidebarCompliance}
          </div>
          <button
            onClick={() => setActiveSidebarTab('transfers')}
            className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
              activeSidebarTab === 'transfers'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950'
            }`}
          >
            <span className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-amber-600" />
              <span>{t.menuTransfers}</span>
            </span>
            {pendingTransfersCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                {pendingTransfersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSidebarTab('executive-audits')}
            className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSidebarTab === 'executive-audits'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>{t.menuGapAudits}</span>
          </button>

          <button
            onClick={() => setActiveSidebarTab('exams')}
            className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSidebarTab === 'exams'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950'
            }`}
          >
            <Award className="w-4 h-4 text-purple-600" />
            <span>{t.menuExamReadiness}</span>
          </button>

          {/* GROUP 4: ADMIN */}
          <div className="hidden md:block px-3 pt-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-black border-t border-slate-100 dark:border-slate-800 mt-1">
            {t.sidebarAdmin}
          </div>
          <button
            onClick={() => setActiveSidebarTab('signing-settings')}
            className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSidebarTab === 'signing-settings'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950'
            }`}
          >
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span>{t.menuSigningSettings}</span>
          </button>

          <button
            onClick={() => setActiveSidebarTab('security')}
            className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSidebarTab === 'security'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{t.menuAuditLedger}</span>
          </button>
        </aside>

        {/* RIGHT CONTENT WORKSPACE */}
        <div className="flex-1 min-w-0">
          {/* TAB 1: COUNTY SCHOOLS TABLE */}
          {activeSidebarTab === 'schools' && (
            <div className="space-y-4">
              {/* Filter Strip & Saved Views */}
              <div className={`p-4 rounded-xl border flex flex-col lg:flex-row items-center justify-between gap-3 text-xs ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                {/* Search */}
                <div className="relative w-full lg:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500 dark:text-slate-400" />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={schoolSearch}
                    onChange={(e) => setSchoolSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                  />
                </div>

                {/* Filter Chips: All, Public, Private, SNE, Needs Review */}
                <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
                  {(['All', 'Public', 'Private', 'SNE', 'Needs Review'] as const).map((chip) => {
                    const isActive = schoolCategoryFilter === chip;
                    return (
                      <button
                        key={chip}
                        onClick={() => setSchoolCategoryFilter(chip)}
                        className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all border ${
                          isActive
                            ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {chip === 'All' && t.filterAll}
                        {chip === 'Public' && t.filterPublic}
                        {chip === 'Private' && t.filterPrivate}
                        {chip === 'SNE' && t.filterSne}
                        {chip === 'Needs Review' && t.filterNeedsReview}
                      </button>
                    );
                  })}

                  {/* Save This View Button */}
                  <button
                    onClick={handleSaveCurrentView}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold flex items-center gap-1 shadow-2xs"
                    title="Bookmark filter & search"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{t.saveThisView}</span>
                  </button>
                </div>
              </div>

              {/* Saved Views Chips */}
              {savedViews.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto text-xs py-1">
                  <span className="text-slate-600 dark:text-slate-400 text-[11px] font-mono uppercase font-black">Saved Views:</span>
                  {savedViews.map((sv) => (
                    <button
                      key={sv.id}
                      onClick={() => {
                        setSchoolCategoryFilter(sv.filter as any);
                        setSchoolSearch(sv.search);
                        showToast(`Applied saved view: ${sv.name}`);
                      }}
                      className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-emerald-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 font-bold text-[11px] flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>{sv.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Schools Table (High Contrast, Tabular Sans-Serif, Clickable Row) */}
              <div className={`rounded-xl border shadow-xs overflow-hidden ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b font-black ${
                      isDarkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-900 border-slate-300'
                    }`}>
                      <tr>
                        <th className="p-3.5">{t.thSchool}</th>
                        <th className="p-3.5">{t.thSubCounty}</th>
                        <th className="p-3.5">{t.thCategory}</th>
                        <th className="p-3.5 text-right">{t.thLearners}</th>
                        <th className="p-3.5 text-right">{t.thCapitation}</th>
                        <th className="p-3.5 text-center">{t.thCompliance}</th>
                        <th className="p-3.5">{t.thStatus}</th>
                        <th className="p-3.5 text-right">{t.thActions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {filteredSchools.map((school) => {
                        const isFrozen = school.accreditationStatus.includes('Frozen');
                        const needsReview = school.complianceScore < 95;

                        return (
                          <tr
                            key={school.id}
                            tabIndex={0}
                            onClick={() => setSelectedSchoolForDrawer(school)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setSelectedSchoolForDrawer(school);
                            }}
                            className={`transition-colors cursor-pointer ${
                              isDarkMode ? 'hover:bg-slate-800/70' : 'hover:bg-slate-50/90'
                            }`}
                          >
                            <td className="p-3.5 font-bold">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-slate-950 dark:text-white">{school.name}</span>
                                {needsReview && (
                                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" title="Needs Review" />
                                )}
                              </div>
                              <span className="block font-mono text-[11px] text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
                                Code: <strong className="text-slate-900 dark:text-slate-200">{school.centerCode}</strong> · Head: <strong className="text-slate-900 dark:text-slate-200">{school.principalName}</strong>
                              </span>
                            </td>

                            <td className="p-3.5 text-slate-900 dark:text-slate-200 font-bold">
                              {school.subCounty}
                            </td>

                            <td className="p-3.5">
                              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border shadow-2xs inline-block ${
                                school.category.includes('Public')
                                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700'
                                  : school.category.includes('SNE')
                                  ? 'bg-purple-100 text-purple-950 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-700'
                                  : 'bg-blue-100 text-blue-950 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700'
                              }`}>
                                {school.category}
                              </span>
                            </td>

                            <td className="p-3.5 text-right font-mono tabular-nums font-black text-sm text-slate-950 dark:text-white">
                              {school.enrolledLearners.toLocaleString()}
                            </td>

                            <td className="p-3.5 text-right font-mono tabular-nums font-black text-xs text-emerald-800 dark:text-emerald-400">
                              {school.fpeFdjseCapitationTerm1 > 0 ? (
                                `KES ${(school.fpeFdjseCapitationTerm1 / 1000).toFixed(0)}k`
                              ) : (
                                <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">Private (KES 0)</span>
                              )}
                            </td>

                            <td className="p-3.5 text-center">
                              <span className={`font-mono font-black text-xs px-2 py-0.5 rounded border ${
                                school.complianceScore >= 95
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                  : 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                              }`}>
                                {school.complianceScore}%
                              </span>
                            </td>

                            <td className="p-3.5">
                              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border shadow-2xs inline-block ${
                                isFrozen
                                  ? 'bg-rose-700 text-white border-rose-800 font-black'
                                  : school.accreditationStatus.includes('Accredited')
                                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700'
                                  : 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700'
                              }`}>
                                {school.accreditationStatus}
                              </span>
                            </td>

                            <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedSchoolForDrawer(school)}
                                  className="px-2.5 py-1 rounded-md text-xs font-bold text-emerald-900 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 dark:bg-slate-800 dark:text-emerald-300 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                                >
                                  {t.btnDetails}
                                </button>
                                <button
                                  onClick={() => setSchoolToFreeze(school)}
                                  className="px-2.5 py-1 rounded-md text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
                                  title="Freeze institutional operations"
                                >
                                  {t.btnFreeze}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE SUB-COUNTY MAP */}
          {activeSidebarTab === 'subcounty-map' && (
            <div className={`p-6 rounded-2xl border space-y-6 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span>Interactive Map of Kiambu County Sub-Counties</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Click any sub-county to filter schools and inspect regional capitation distribution.
                  </p>
                </div>
                {selectedSubCountyFilter !== 'All' && (
                  <button
                    onClick={() => setSelectedSubCountyFilter('All')}
                    className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg text-xs font-bold hover:bg-slate-300"
                  >
                    Reset Filter ({selectedSubCountyFilter})
                  </button>
                )}
              </div>

              {/* Sub-Counties Grid Visual Map */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {subCountiesMapData.map((sc) => {
                  const isSelected = selectedSubCountyFilter === sc.name;
                  return (
                    <button
                      key={sc.name}
                      onClick={() => {
                        setSelectedSubCountyFilter(isSelected ? 'All' : sc.name);
                        setActiveSidebarTab('schools');
                        showToast(`Filtered schools by ${sc.name} Sub-County`);
                      }}
                      className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500 shadow-xs'
                          : isDarkMode
                          ? 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                          : 'border-slate-300 bg-white hover:border-emerald-500 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-sm text-slate-950 dark:text-white">{sc.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          sc.status === 'Needs Review'
                            ? 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
                            : 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                        }`}>
                          {sc.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-0.5 font-mono">
                        <div>Institutions: <strong className="text-slate-950 dark:text-white font-bold">{sc.schoolsCount}</strong></div>
                        <div>Learners: <strong className="text-slate-950 dark:text-white font-bold">{sc.learners.toLocaleString()}</strong></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: DIRECTIVES TRACKING */}
          {activeSidebarTab === 'directives' && (
            <div className={`p-6 rounded-2xl border space-y-5 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div>
                <h2 className="text-lg font-black text-slate-950 dark:text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-amber-600" />
                  <span>Executive Directives & Compliance Acknowledgment Tracking</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  Monitor school acknowledgments for presidential and basic education statutory decrees.
                </p>
              </div>

              <div className="space-y-4">
                {directives.map((dir) => {
                  const ackPercent = Math.round((dir.acknowledgedCount / dir.totalCount) * 100);
                  return (
                    <div
                      key={dir.id}
                      className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase font-black block">
                          {dir.mandate}
                        </span>
                        <h3 className="text-sm font-black text-slate-950 dark:text-white">{dir.title}</h3>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-3">
                          <span>Due Date: <strong className="text-slate-900 dark:text-slate-200">{dir.dueDate}</strong></span>
                          <span>·</span>
                          <span>Acknowledged: <strong className="text-emerald-800 dark:text-emerald-400">{dir.acknowledgedCount} of {dir.totalCount} schools</strong></span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full max-w-md bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all"
                            style={{ width: `${ackPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="shrink-0">
                        <button
                          onClick={() => {
                            setDirectives((prev) =>
                              prev.map((d) => (d.id === dir.id ? { ...d, reminded: true } : d))
                            );
                            showToast(`Reminders sent to ${dir.totalCount - dir.acknowledgedCount} unacknowledged schools.`);
                          }}
                          className={`px-4 py-2 rounded-lg text-xs font-black transition-all shadow-xs flex items-center gap-1.5 ${
                            dir.reminded
                              ? 'bg-emerald-100 text-emerald-950 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
                              : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                          }`}
                        >
                          {dir.reminded ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                          <span>{dir.reminded ? t.directiveReminded : `${t.directiveRemind} (${dir.totalCount - dir.acknowledgedCount})`}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: EXAM READINESS (KPSEA & KJSEA) */}
          {activeSidebarTab === 'exams' && (
            <div className={`p-6 rounded-2xl border space-y-5 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div>
                <h2 className="text-lg font-black text-slate-950 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span>National Assessment Readiness (KPSEA Grade 6 & KJSEA Grade 9)</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  Candidate registration verification. Schools with biggest gaps are listed first.
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-300 dark:border-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b font-black ${
                    isDarkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-900 border-slate-300'
                  }`}>
                    <tr>
                      <th className="p-3">School Name</th>
                      <th className="p-3">KPSEA (G6)</th>
                      <th className="p-3">KJSEA (G9)</th>
                      <th className="p-3">Registration Progress</th>
                      <th className="p-3">Missing Details</th>
                      <th className="p-3 text-right">Days to Exam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {examReadiness.map((er) => (
                      <tr key={er.centerCode} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-black text-slate-950 dark:text-white">{er.schoolName}</td>
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-200">{er.kpseaCandidates}</td>
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-200">{er.kjseaCandidates}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-purple-600 h-full rounded-full"
                                style={{ width: `${er.registeredPercent}%` }}
                              />
                            </div>
                            <span className="font-black text-purple-800 dark:text-purple-400">{er.registeredPercent}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          {er.missingDetailsCount > 0 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-950 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-700">
                              {er.missingDetailsCount} {t.missingDetails}
                            </span>
                          ) : (
                            <span className="text-emerald-700 dark:text-emerald-400 font-black">100% Complete</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono font-black text-slate-950 dark:text-white">
                          {er.daysToExam} {t.daysLeft}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: STATUTORY MOE REPORTS VIEW */}
          {activeSidebarTab === 'statutory-reports' && (
            <MoeStatutoryReportsView
              currentUser={currentUser}
              reports={INITIAL_MOE_STATUTORY_REPORTS}
              schools={schools}
              onEndorseReport={(id, officer) => {
                showToast(`Report ${id} endorsed by ${officer}`);
                onLogAudit('MOE_COMPLIANCE_EDIT', `Report ${id}`, `Endorsed by ${officer}`);
              }}
              onLogAudit={onLogAudit}
            />
          )}

          {/* TAB 6: EXECUTIVE GAP AUDITS */}
          {activeSidebarTab === 'executive-audits' && (
            <MoeExecutiveDirectiveAuditsView
              currentUser={currentUser}
              suffixAudits={INITIAL_SUFFIX_AUDITS}
              knecMappings={INITIAL_KNEC_MAPPINGS}
              teacherWorkloads={INITIAL_TEACHER_WORKLOADS}
              stemLabAudits={INITIAL_STEM_LAB_AUDITS}
              sanitationAudits={INITIAL_SANITATION_AUDITS}
              capitationReconciliations={INITIAL_CAPITATION_RECONCILIATIONS}
              uniformReturns={INITIAL_UNIFORM_COST_RETURNS}
              sneReturns={INITIAL_SNE_RETURNS}
              safetyReturns={INITIAL_SAFETY_RETURNS}
              transitionReturns={INITIAL_TRANSITION_RETURNS}
              priorityItems={INITIAL_PRIORITY_ACTION_ITEMS}
              onUploadExcelReturn={(cat, count) => {
                showToast(`Uploaded ${count} return records in category: ${cat}`);
              }}
              onLogAudit={onLogAudit}
            />
          )}

          {/* TAB 7: SIGNING SETTINGS & PASSKEYS */}
          {activeSidebarTab === 'signing-settings' && (
            <MoeSigningSettingsView
              currentUser={currentUser}
              officers={INITIAL_MOE_SIGNING_OFFICERS}
              onAddOfficer={(newOff: MoeSigningOfficer) => {
                showToast(`Added signing officer ${newOff.name}`);
              }}
              onUpdateOfficerPin={(id: string, pin: string) => {
                showToast(`Updated officer PIN credentials`);
              }}
              onToggleOfficerStatus={(id: string) => {
                showToast(`Toggled officer authorization status`);
              }}
              onLogAudit={onLogAudit}
            />
          )}

          {/* TAB 8: CAPITATION & WARRANTS */}
          {activeSidebarTab === 'capitation' && (
            <div className={`p-6 rounded-2xl border space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <h2 className="text-lg font-black text-slate-950 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <span>Treasury IFMIS Capitation Warrants & Disbursements</span>
              </h2>
              <div className="overflow-x-auto rounded-xl border border-slate-300 dark:border-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b font-black ${
                    isDarkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-900 border-slate-300'
                  }`}>
                    <tr>
                      <th className="p-3">Warrant Tranche</th>
                      <th className="p-3">Institution</th>
                      <th className="p-3">Eligible Students</th>
                      <th className="p-3">Disbursed (KES)</th>
                      <th className="p-3">Treasury IFMIS Ref</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {disbursements.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-black text-emerald-800 dark:text-emerald-400">{d.trancheNumber}</td>
                        <td className="p-3 font-black text-slate-950 dark:text-white">{d.schoolName}</td>
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-200">{d.totalEligibleStudents}</td>
                        <td className="p-3 font-mono font-black text-emerald-800 dark:text-emerald-400">KES {d.totalAmountDisbursed.toLocaleString()}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 font-bold">{d.treasuryVoucherRef}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold border bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700">
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: TRANSFERS VIEW */}
          {activeSidebarTab === 'transfers' && (
            <div className={`p-6 rounded-2xl border space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-950 dark:text-white flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-amber-600" />
                  <span>Transfer Authorizations & Ministry Clearance Returns</span>
                </h2>
                <button
                  onClick={() => setIsTransferPanelOpen(true)}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-lg shadow-xs transition-colors"
                >
                  Open Inline Review ({pendingTransfersCount})
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-300 dark:border-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b font-black ${
                    isDarkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-900 border-slate-300'
                  }`}>
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">NEMIS UPI</th>
                      <th className="p-3">From School</th>
                      <th className="p-3">To School</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {transfers.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-black text-slate-950 dark:text-white">{t.studentName}</td>
                        <td className="p-3 font-mono font-black text-emerald-800 dark:text-emerald-400">{t.nemisUpi}</td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{t.fromSchoolName}</td>
                        <td className="p-3 font-bold text-slate-950 dark:text-white">{t.toSchoolName}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400 font-semibold">{t.reason}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                            t.status.includes('Approved')
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700'
                              : 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: SECURITY AUDIT LEDGER */}
          {activeSidebarTab === 'security' && (
            <div className={`p-6 rounded-2xl border space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>PKI Digital Cryptographic Seal & Security Audit Ledger</span>
              </h2>
              <p className="text-xs text-slate-500">
                All statutory approvals are stamped with SHA-256 hashes and logged for compliance with Kenya Data Protection Act 2019.
              </p>
              <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-xl space-y-1">
                <div>[2026-10-26 08:42:01 EAT] PKI Node Kiambu Directorate: Online (SHA256: 9f86d081884c7d65)</div>
                <div>[2026-10-26 08:42:15 EAT] NEMIS UPI Hash Sync: 100% verified against National Registrar</div>
                <div>[2026-10-26 08:42:22 EAT] IFMIS Warrant Seal Validated: 4,425,620 KES cleared for Limuru Model</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: INLINE TRANSFER APPROVAL PANEL (REVIEW BUTTON & PENDING CARD)
          ========================================================================= */}
      {isTransferPanelOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-slate-950" />
                <h3 className="font-bold text-sm">Transfer Authorizations ({pendingTransfers.length} Pending)</h3>
              </div>
              <button onClick={() => setIsTransferPanelOpen(false)} className="text-slate-900 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {pendingTransfers.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <span>All transfers have been processed and signed.</span>
                </div>
              ) : (
                pendingTransfers.map((tr) => (
                  <div
                    key={tr.id}
                    className="p-4 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-black text-slate-950 dark:text-white text-sm">{tr.studentName}</h4>
                        <span className="font-mono text-[11px] text-emerald-800 dark:text-emerald-400 font-bold block">
                          {tr.nemisUpi} · {tr.grade}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold border bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700">
                        Pending Decision
                      </span>
                    </div>

                    <div className="text-slate-800 dark:text-slate-200 space-y-1 text-xs">
                      <div><strong className="text-slate-950 dark:text-white">From:</strong> {tr.fromSchoolName}</div>
                      <div><strong className="text-slate-950 dark:text-white">To:</strong> {tr.toSchoolName}</div>
                      <div><strong className="text-slate-950 dark:text-white">Reason:</strong> {tr.reason}</div>
                    </div>

                    {rejectingTransferId === tr.id ? (
                      <div className="pt-2 space-y-2 border-t border-slate-300 dark:border-slate-700">
                        <label className="block text-xs font-black text-rose-700 dark:text-rose-400">
                          Rejection Reason (Required):
                        </label>
                        <textarea
                          value={rejectionComment}
                          onChange={(e) => setRejectionComment(e.target.value)}
                          placeholder="e.g. Incomplete clearance certificate or school capacity reached..."
                          className="w-full p-2.5 border border-rose-300 dark:border-rose-700 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setRejectingTransferId(null);
                              setRejectionComment('');
                            }}
                            className="px-3 py-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            disabled={!rejectionComment.trim()}
                            onClick={() => {
                              onRejectTransfer(tr.id, rejectionComment);
                              showToast(`Rejected transfer for ${tr.studentName}.`);
                              setRejectingTransferId(null);
                              setRejectionComment('');
                            }}
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg font-black text-xs shadow-xs"
                          >
                            Confirm Rejection
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => setRejectingTransferId(tr.id)}
                          className="px-3 py-1.5 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-400 rounded-lg font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          Reject with Comment
                        </button>
                        <button
                          onClick={() => {
                            onApproveTransfer(tr.id, currentUser.name);
                            showToast(`Approved transfer for ${tr.studentName}. Stamped on NEMIS.`);
                          }}
                          className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-black text-xs shadow-xs"
                        >
                          Approve Immediately
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: SCHOOL DETAIL DRAWER (ROW CLICK OR ENTER KEY)
          ========================================================================= */}
      {selectedSchoolForDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto space-y-5 animate-in slide-in-from-right duration-200 border-l border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-black uppercase block">
                  Center Code: {selectedSchoolForDrawer.centerCode}
                </span>
                <h3 className="text-base font-black text-slate-950 dark:text-white">
                  {selectedSchoolForDrawer.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSchoolForDrawer(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* School Profile */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-bold">Sub-County:</span>
                <span className="font-bold text-slate-950 dark:text-white">{selectedSchoolForDrawer.subCounty}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-bold">Category:</span>
                <span className="font-black text-slate-950 dark:text-white">{selectedSchoolForDrawer.category}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-bold">Enrolled Learners:</span>
                <span className="font-black font-mono text-slate-950 dark:text-white">{selectedSchoolForDrawer.enrolledLearners.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-bold">Principal:</span>
                <span className="font-bold text-slate-950 dark:text-white">{selectedSchoolForDrawer.principalName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-bold">Accreditation:</span>
                <span className="font-black text-emerald-800 dark:text-emerald-400">{selectedSchoolForDrawer.accreditationStatus}</span>
              </div>
            </div>

            {/* Private School Capitation Note */}
            {selectedSchoolForDrawer.category.includes('Private') && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-300 font-medium">
                {t.privateNote}
              </div>
            )}

            {/* "Needs Review" Flag Reasons */}
            {selectedSchoolForDrawer.complianceScore < 95 && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs text-rose-950 dark:text-rose-300 space-y-1">
                <strong className="block font-black text-rose-900 dark:text-rose-200">Flagged for Directorate Audit:</strong>
                <div>• Compliance index is below 95% ({selectedSchoolForDrawer.complianceScore}% recorded).</div>
                <div>• Capitation receipt reconciliation pending SCDE stamp.</div>
              </div>
            )}

            {/* 4-Step Capitation Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="font-black text-xs text-slate-950 dark:text-slate-100 uppercase tracking-wider">
                {t.capitationTimeline}
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{t.step1}</span>
                  <span className="font-black text-emerald-800 dark:text-emerald-400">{t.done} ✓</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{t.step2}</span>
                  <span className="font-black text-emerald-800 dark:text-emerald-400">{t.done} ✓</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{t.step3}</span>
                  <span className="font-black text-emerald-800 dark:text-emerald-400">{t.done} ✓</span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded-lg border ${
                  selectedSchoolForDrawer.complianceScore < 95
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-950 dark:text-amber-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-400'
                }`}>
                  <span className="font-bold">{t.step4}</span>
                  <span className="font-black">
                    {selectedSchoolForDrawer.complianceScore < 95 ? `${t.waiting} ⏳` : `${t.done} ✓`}
                  </span>
                </div>
              </div>
            </div>

            {/* Drawer Close Button */}
            <button
              onClick={() => setSelectedSchoolForDrawer(null)}
              className="w-full py-2.5 bg-slate-900 text-white dark:bg-slate-800 rounded-xl font-bold text-xs mt-4"
            >
              Close Dossier (Esc)
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: FREEZE INSTITUTION CONFIRMATION DIALOG (RED BUTTON)
          ========================================================================= */}
      {schoolToFreeze && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border-2 border-rose-500 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {t.freezeConfirmTitle}
                </h3>
                <span className="text-xs text-rose-700 font-bold block">{schoolToFreeze.name}</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {t.freezeWarning}
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSchoolToFreeze(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleExecuteFreeze}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black shadow-md"
              >
                {t.confirmFreeze}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: SIGN KEY ENTRY / PASSKEY AUTHENTICATION GATE
          ========================================================================= */}
      {isSignKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 text-amber-700 mx-auto flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-black text-base text-slate-950 dark:text-white">
                Ministry Signing Key Required
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                Enter your authorized 4-digit PIN or passkey to unlock executive oversight functions.
              </p>
              <span className="text-[11px] text-emerald-800 dark:text-emerald-400 font-mono font-bold block mt-1">
                Demo Hint: Default Signing PIN is 4921
              </span>
            </div>

            <form onSubmit={handleUnlockSignKey} className="space-y-3">
              <input
                type="password"
                maxLength={6}
                value={signKeyInput}
                onChange={(e) => setSignKeyInput(e.target.value)}
                placeholder="Enter PIN (e.g. 4921)"
                className="w-full text-center tracking-widest text-lg font-mono font-black py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                autoFocus
              />

              {signKeyError && (
                <span className="text-xs text-rose-600 font-bold block">{signKeyError}</span>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSignKeyModalOpen(false)}
                  className="flex-1 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-xs"
                >
                  Authenticate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
