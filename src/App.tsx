/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  School,
  Users,
  CreditCard,
  Award,
  BookOpen,
  Calendar,
  DollarSign,
  Smartphone,
  Warehouse,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Volume2,
  VolumeX,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  HeartPulse,
  Layers,
  Sparkles,
  UserPlus,
  Upload,
  Radio,
  FileText,
  Package,
  Truck,
  Building2,
  Lock,
  ArrowRightLeft,
  Key,
  FileCheck,
  Menu,
  X,
  Sun,
  Moon,
  Zap,
  Check,
  LogOut,
  Receipt,
} from 'lucide-react';
import { SchoolPlatformDashboard } from './components/SchoolPlatformDashboard';

import {
  Learner,
  GradeLevel,
  VoteHead,
  BursaryRecord,
  DarajaMpesaPayment,
  SMSBroadcast,
  PayrollEmployee,
  AssetItem,
  TimetableSlot,
  CBCLevel,
  DisciplineIncident,
  AuthUser,
  UserRole,
  TeacherStaffRecord,
  SecurityAuditLog,
  FuelFleetVehicle,
  BusRoute,
  FuelLogEntry,
  VehicleMaintenanceRecord,
  StudentTransportBooking,
  KemisTransferRecord,
  KiambuSchoolRecord,
  MoeCapitationDisbursement,
  MoeTransferApproval,
  MoeSchoolMajorApproval,
} from './types/school';

import {
  ALL_GRADES,
  ALL_LEARNING_AREAS,
  INITIAL_LEARNERS,
  INITIAL_BURSARIES,
  INITIAL_DARAJA_PAYMENTS,
  INITIAL_PAYROLL,
  INITIAL_ASSETS,
  INITIAL_TIMETABLE_SLOTS,
  INITIAL_SMS_BROADCASTS,
  INITIAL_TEACHERS,
  INITIAL_FLEET_VEHICLES,
  INITIAL_BUS_ROUTES,
  INITIAL_FUEL_LOGS,
  INITIAL_MAINTENANCE_RECORDS,
  INITIAL_TRANSPORT_BOOKINGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_KEMIS_TRANSFERS,
} from './data/mockSchoolData';

import {
  SYSTEM_USERS,
  ROLE_CONFIGS,
  hasPermission,
  isTabAccessible,
} from './data/mockUsers';

import { exportToExcel } from './utils/excelExport';
import { LearnerAdmissionModal } from './components/LearnerAdmissionModal';
import { BulkCBCMarksheetManager } from './components/BulkCBCMarksheetManager';
import { DarajaMpesaSync } from './components/DarajaMpesaSync';
import { VoteheadAndBursaryLedger } from './components/VoteheadAndBursaryLedger';
import { BulkSMSGateway } from './components/BulkSMSGateway';
import { PayrollAndStatutory } from './components/PayrollAndStatutory';
import { TimetableEngine } from './components/TimetableEngine';
import { AssetAndFacilityManagement } from './components/AssetAndFacilityManagement';
import { ExamAndGradeAnalytics } from './components/ExamAndGradeAnalytics';
import { DigitalPortfoliosAndCoCurricular } from './components/DigitalPortfoliosAndCoCurricular';
import { KitchenInventory } from './components/KitchenInventory';
import { TextbookStationeryPlatform } from './components/TextbookStationeryPlatform';
import { ExcelFeeBatchManager } from './components/ExcelFeeBatchManager';
import { RoleSwitcher } from './components/RoleSwitcher';
import { RolePermissionModal } from './components/RolePermissionModal';
import { ParentPortalView } from './components/ParentPortalView';
import { UnauthorizedAccessGuard } from './components/UnauthorizedAccessGuard';
import { AuthModal } from './components/AuthModal';
import { TeacherManagementModule } from './components/TeacherManagementModule';
import { DataPrivacyAndAuditModule } from './components/DataPrivacyAndAuditModule';
import { FuelAndFleetLogistics } from './components/FuelAndFleetLogistics';
import { KemisNemisSyncEngine } from './components/KemisNemisSyncEngine';
import { ClassRenameModal } from './components/ClassRenameModal';
import { TeacherTpadModule } from './components/TeacherTpadModule';
import { FeeReminderSmsModal } from './components/FeeReminderSmsModal';
import { MinistryOfEducationOversightModule } from './components/MinistryOfEducationOversightModule';
import { SchoolMoeComplianceReturnsModule } from './components/SchoolMoeComplianceReturnsModule';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrintPreviewProvider, usePrintPreview } from './context/PrintPreviewContext';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { LoginPage } from './components/LoginPage';
import { UserManagementModule } from './components/UserManagementModule';
import { FirebaseStatusBanner } from './components/FirebaseStatusBanner';
import { FileUploadZone } from './components/FileUploadZone';
import {
  KIAMBU_COUNTY_SCHOOLS,
  INITIAL_MOE_DISBURSEMENTS,
  INITIAL_MOE_TRANSFERS,
  INITIAL_MOE_MAJOR_APPROVALS,
  INITIAL_MOE_STATUTORY_REPORTS,
} from './data/mockMoeData';
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
} from './data/mockExecutiveAuditData';

// Audio feedback chime helper
const playSound = (type: 'success' | 'click' | 'error') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'click') {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else {
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // AudioContext blocked or not supported
  }
};

function SchoolApp() {
  const {
    currentUser: authUser,
    loading: authLoading,
    logout,
    inactivityWarning,
    resetInactivityTimer,
    logAuditAction: firebaseLogAudit,
  } = useAuth();
  const { openPrintPreview } = usePrintPreview();
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);

  type ActiveTab =
    | 'dashboard'
    | 'moe-oversight'
    | 'parent-portal'
    | 'teachers'
    | 'kemis'
    | 'fleet'
    | 'admissions'
    | 'cbc'
    | 'daraja'
    | 'voteheads'
    | 'sms'
    | 'payroll'
    | 'timetable'
    | 'analytics'
    | 'portfolios'
    | 'assets'
    | 'kitchen-inventory'
    | 'textbooks-stationery'
    | 'fees'
    | 'report-card'
    | 'tpad'
    | 'school-moe-returns'
    | 'user-management'
    | 'audit-logs';

  const SCHOOL_SIDEBAR_GROUPS = [
    {
      name: 'Daily',
      items: [
        { id: 'dashboard' as const, label: 'Overview', icon: School },
        { id: 'timetable' as const, label: 'Timetabling', icon: Calendar },
        { id: 'sms' as const, label: 'Bulk SMS Gateway', icon: Radio },
      ],
    },
    {
      name: 'Learning',
      items: [
        { id: 'cbc' as const, label: 'CBC Tracking', icon: Award },
        { id: 'admissions' as const, label: 'Grade 1-9 Registry', icon: Users },
        { id: 'analytics' as const, label: 'KNEC Analytics', icon: Award },
        { id: 'portfolios' as const, label: 'Health & Portfolios', icon: HeartPulse },
        { id: 'report-card' as const, label: 'Report Cards', icon: Printer },
      ],
    },
    {
      name: 'Money',
      items: [
        { id: 'fees' as const, label: 'Fee Ledger', icon: CreditCard },
        { id: 'daraja' as const, label: 'M-Pesa Daraja Sync', icon: Smartphone },
        { id: 'voteheads' as const, label: 'Voteheads & Bursaries', icon: Layers },
        { id: 'payroll' as const, label: 'Payroll & KRA/SHA', icon: DollarSign },
      ],
    },
    {
      name: 'Operations',
      items: [
        { id: 'user-management' as const, label: 'User Management', icon: Users },
        { id: 'teachers' as const, label: 'Teachers & Faculty', icon: UserCheck },
        { id: 'fleet' as const, label: 'Fleet & Fuel Logistics', icon: Truck },
        { id: 'assets' as const, label: 'Assets & Facilities', icon: Package },
        { id: 'kitchen-inventory' as const, label: 'Kitchen Stores', icon: Warehouse },
        { id: 'textbooks-stationery' as const, label: 'Books & Stationery', icon: BookOpen },
        { id: 'audit-logs' as const, label: 'Security & Audit Ledger', icon: Lock },
      ],
    },
  ];

  // Strongly lock authenticated user to their immutable RFC4122 v4 UUID
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    const savedUuid = localStorage.getItem('limuru_auth_user_uuid');
    if (savedUuid) {
      const match = SYSTEM_USERS.find((u) => u.uuid === savedUuid);
      if (match) return match;
    }
    const defaultUser = SYSTEM_USERS[0]; // Dr. Anthony K. Macharia (Chief Principal)
    return defaultUser;
  });

  // Keep currentUser in sync with real authenticated user profile
  useEffect(() => {
    if (authUser) {
      const mappedRole: UserRole =
        authUser.role === 'headteacher'
          ? 'principal'
          : authUser.role === 'deputy'
          ? 'principal'
          : authUser.role === 'bursar'
          ? 'bursar'
          : authUser.role === 'teacher'
          ? 'teacher'
          : authUser.role === 'moe_official'
          ? 'moe_director'
          : 'parent';

      const updatedUser: AuthUser = {
        id: authUser.uid,
        uuid: authUser.uid,
        name: authUser.fullName,
        role: mappedRole,
        title:
          authUser.role === 'headteacher'
            ? 'Chief Principal & Accounting Officer'
            : authUser.role === 'deputy'
            ? 'Deputy Principal'
            : authUser.role === 'bursar'
            ? 'Head of Accounts & School Bursar'
            : authUser.role === 'teacher'
            ? 'Subject Teacher & Educator'
            : authUser.role === 'moe_official'
            ? 'County Director of Education / QASO Inspector'
            : 'Parent / Guardian',
        department:
          authUser.department ||
          (authUser.role === 'headteacher'
            ? 'Administration & Institutional Governance'
            : authUser.role === 'bursar'
            ? 'Finance & MoE Votehead Accounting'
            : authUser.role === 'moe_official'
            ? 'Ministry of Education · Kiambu Directorate'
            : 'Academics & Faculty'),
        email: authUser.email,
        phone: authUser.phone || '+254 722 401 928',
        avatarInitials:
          authUser.fullName
            .split(' ')
            .filter(Boolean)
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'LM',
        assignedGrade: authUser.assignedGrade as GradeLevel | undefined,
        assignedStream: authUser.assignedStream,
      };

      setCurrentUser(updatedUser);
      localStorage.setItem('limuru_auth_user_uuid', authUser.uid);
      localStorage.setItem('limuru_model_current_user', JSON.stringify(updatedUser));

      if (mappedRole === 'moe_director') {
        setActiveTab('moe-oversight');
      } else if (mappedRole === 'parent') {
        setActiveTab('parent-portal');
      } else if (!isTabAccessible(mappedRole, activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [authUser]);

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (currentUser.role === 'moe_director') return 'moe-oversight';
    return currentUser.role === 'parent' ? 'parent-portal' : 'dashboard';
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPiiDecrypted, setIsPiiDecrypted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('limuru_school_theme') === 'dark';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const marksheetFileInputRef = useRef<HTMLInputElement>(null);
  const feeExcelFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('limuru_school_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3500);
  };

  const handleSimulateDarajaPush = () => {
    const owing = learners.filter((s) => s.fees.balance > 0);
    const candidate = owing.length > 0
      ? owing[Math.floor(Math.random() * owing.length)]
      : learners[Math.floor(Math.random() * learners.length)];

    const amounts = [2000, 3500, 5000, 6500, 8000];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    const voteheads = [
      'Tuition & CBC Learning Materials',
      'School Feeding Program',
      'PTA & Infrastructure Levy',
      'Co-Curricular & Sports',
    ] as const;
    const votehead = voteheads[Math.floor(Math.random() * voteheads.length)];

    const simulatedPayment: DarajaMpesaPayment = {
      transId: `MP${Math.floor(100000 + Math.random() * 900000)}`,
      billRefNumber: candidate.admissionNo,
      transAmount: amount,
      msisdn: candidate.guardianPhone || '254712345678',
      firstName: candidate.guardianName.split(' ')[0] || 'Guardian',
      middleName: '',
      lastName: candidate.guardianName.split(' ')[1] || '',
      transTime: new Date().toISOString(),
      matchedLearnerId: candidate.id,
      matchedLearnerName: candidate.name,
      allocatedVotehead: votehead as any,
      receiptNumber: `REC-${Date.now().toString().slice(-5)}`,
      status: 'Confirmed',
    };

    handleProcessDarajaPayment(simulatedPayment);
    showToast(`Simulated live M-Pesa push: KES ${amount.toLocaleString()} received from ${simulatedPayment.firstName} for ${candidate.name} (${candidate.admissionNo}).`);
  };

  const handleUpdateLearnerUpi = (learnerId: string, newUpi: string) => {
    setLearners((prev) =>
      prev.map((s) => (s.id === learnerId ? { ...s, nemisUpi: newUpi } : s))
    );
    showToast(`Updated NEMIS UPI to ${newUpi}. Mapped in local register.`);
    if (soundEnabled) playSound('success');
  };

  const handleSendSmsReminder = (learner: Learner, customMessage?: string) => {
    const msg = customMessage || `Jambo ${learner.guardianName}, fee balance for ${learner.name} is KES ${learner.fees.balance.toLocaleString()}. Pay via Paybill 522123, Acc: ${learner.admissionNo}. Limuru Model School.`;
    const newSms: SMSBroadcast = {
      id: `sms_${Date.now()}`,
      type: 'Fee Reminder',
      message: msg,
      recipientsCount: 1,
      targetGrade: learner.grade,
      timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      deliveryRate: 100,
      status: 'Delivered',
    };
    setSmsBroadcasts((prev) => [newSms, ...prev]);
    showToast(`Fee reminder SMS dispatched to ${learner.guardianPhone}.`);
    if (soundEnabled) playSound('click');
  };

  const handleMarksheetFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      showToast(`Marksheet "${file.name}" selected. Opening CBC Marksheet engine...`);
      setIsBulkMarksheetOpen(true);
      if (soundEnabled) playSound('success');
    }
  };

  const handleFeeExcelFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      showToast(`Fee batch sheet "${file.name}" selected. Opening Excel Fee Batch engine...`);
      setIsExcelFeeModalOpen(true);
      if (soundEnabled) playSound('success');
    }
  };

  const handleSelectUser = (user: AuthUser) => {
    setCurrentUser(user);
    localStorage.setItem('limuru_model_current_user', JSON.stringify(user));
    localStorage.setItem('limuru_auth_user_uuid', user.uuid);
    if (user.role === 'moe_director') {
      setActiveTab('moe-oversight');
    } else if (user.role === 'parent') {
      setActiveTab('parent-portal');
    } else if (activeTab === 'parent-portal' || activeTab === 'moe-oversight') {
      setActiveTab('dashboard');
    } else if (!isTabAccessible(user.role, activeTab)) {
      setActiveTab('dashboard');
    }
    if (soundEnabled) playSound('click');
  };

  // Core Data States with localStorage persistence
  const [learners, setLearners] = useState<Learner[]>(() => {
    const saved = localStorage.getItem('limuru_model_learners');
    return saved ? JSON.parse(saved) : INITIAL_LEARNERS;
  });

  const [teachers, setTeachers] = useState<TeacherStaffRecord[]>(() => {
    const saved = localStorage.getItem('limuru_model_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [fleetVehicles, setFleetVehicles] = useState<FuelFleetVehicle[]>(() => {
    const saved = localStorage.getItem('limuru_model_fleet');
    return saved ? JSON.parse(saved) : INITIAL_FLEET_VEHICLES;
  });

  const [busRoutes, setBusRoutes] = useState<BusRoute[]>(() => {
    return INITIAL_BUS_ROUTES;
  });

  const [fuelLogs, setFuelLogs] = useState<FuelLogEntry[]>(() => {
    const saved = localStorage.getItem('limuru_model_fuel_logs');
    return saved ? JSON.parse(saved) : INITIAL_FUEL_LOGS;
  });

  const [maintenanceRecords, setMaintenanceRecords] = useState<VehicleMaintenanceRecord[]>(() => {
    const saved = localStorage.getItem('limuru_model_maintenance');
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_RECORDS;
  });

  const [transportBookings, setTransportBookings] = useState<StudentTransportBooking[]>(() => {
    return INITIAL_TRANSPORT_BOOKINGS;
  });

  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>(() => {
    const saved = localStorage.getItem('limuru_model_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [kemisTransfers, setKemisTransfers] = useState<KemisTransferRecord[]>(() => {
    const saved = localStorage.getItem('limuru_model_kemis_transfers');
    return saved ? JSON.parse(saved) : INITIAL_KEMIS_TRANSFERS;
  });

  const [bursaries, setBursaries] = useState<BursaryRecord[]>(() => {
    const saved = localStorage.getItem('limuru_model_bursaries');
    return saved ? JSON.parse(saved) : INITIAL_BURSARIES;
  });

  const [darajaPayments, setDarajaPayments] = useState<DarajaMpesaPayment[]>(() => {
    const saved = localStorage.getItem('limuru_model_daraja');
    return saved ? JSON.parse(saved) : INITIAL_DARAJA_PAYMENTS;
  });

  const [payrollEmployees, setPayrollEmployees] = useState<PayrollEmployee[]>(() => {
    const saved = localStorage.getItem('limuru_model_payroll');
    return saved ? JSON.parse(saved) : INITIAL_PAYROLL;
  });

  const [assets, setAssets] = useState<AssetItem[]>(() => {
    const saved = localStorage.getItem('limuru_model_assets');
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem('limuru_model_timetable');
    return saved ? JSON.parse(saved) : INITIAL_TIMETABLE_SLOTS;
  });

  const [smsBroadcasts, setSmsBroadcasts] = useState<SMSBroadcast[]>(() => {
    const saved = localStorage.getItem('limuru_model_sms');
    return saved ? JSON.parse(saved) : INITIAL_SMS_BROADCASTS;
  });

  // Ministry of Education County Oversight & Statutory States
  const [moeSchools, setMoeSchools] = useState<KiambuSchoolRecord[]>(() => {
    const saved = localStorage.getItem('limuru_moe_schools');
    return saved ? JSON.parse(saved) : KIAMBU_COUNTY_SCHOOLS;
  });

  const [moeDisbursements, setMoeDisbursements] = useState<MoeCapitationDisbursement[]>(() => {
    const saved = localStorage.getItem('limuru_moe_disbursements');
    return saved ? JSON.parse(saved) : INITIAL_MOE_DISBURSEMENTS;
  });

  const [moeTransfers, setMoeTransfers] = useState<MoeTransferApproval[]>(() => {
    const saved = localStorage.getItem('limuru_moe_transfers');
    return saved ? JSON.parse(saved) : INITIAL_MOE_TRANSFERS;
  });

  const [moeMajorApprovals, setMoeMajorApprovals] = useState<MoeSchoolMajorApproval[]>(() => {
    const saved = localStorage.getItem('limuru_moe_major_approvals');
    return saved ? JSON.parse(saved) : INITIAL_MOE_MAJOR_APPROVALS;
  });

  // Modal Visibility States
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [isBulkMarksheetOpen, setIsBulkMarksheetOpen] = useState(false);
  const [isExcelFeeModalOpen, setIsExcelFeeModalOpen] = useState(false);
  const [isClassRenameModalOpen, setIsClassRenameModalOpen] = useState(false);
  const [selectedFeeReminderLearner, setSelectedFeeReminderLearner] = useState<Learner | null>(null);
  const [smsInitialDraft, setSmsInitialDraft] = useState<{
    targetGroup?: 'All Grades' | 'Fee Defaulters' | GradeLevel;
    messageText?: string;
    messageType?: SMSBroadcast['type'];
    targetStudentName?: string;
  } | null>(null);

  // Bank Fee Payment Edit & Receipt Upload States
  const [editingFeeLearner, setEditingFeeLearner] = useState<Learner | null>(null);
  const [editFeePaidAmount, setEditFeePaidAmount] = useState<number>(0);
  const [editFeeBankRef, setEditFeeBankRef] = useState<string>('');
  const [editFeePaymentMethod, setEditFeePaymentMethod] = useState<string>('Bank Deposit Slip');

  // Filters & Selected records
  const [selectedStudentId, setSelectedStudentId] = useState<string>(learners[0]?.id || 'std_g7_01');
  const [admissionsGradeFilter, setAdmissionsGradeFilter] = useState<GradeLevel | 'All'>('All');
  const [admissionsSearch, setAdmissionsSearch] = useState<string>('');
  const [cbcGradeFilter, setCbcGradeFilter] = useState<GradeLevel | 'All'>('All');
  const [cbcSubjectFilter, setCbcSubjectFilter] = useState<string>('mat');
  const [feeStatusFilter, setFeeStatusFilter] = useState<'All' | 'Defaulter' | 'Partial' | 'Cleared'>('All');
  const [feeSearchQuery, setFeeSearchQuery] = useState<string>('');

  // Audit Logger Helper
  const handleLogAudit = (
    action: SecurityAuditLog['action'],
    resource: string,
    details: string,
    sensitivity: SecurityAuditLog['sensitivityLevel'] = 'General'
  ) => {
    const newLog: SecurityAuditLog = {
      id: 'aud_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      targetResource: resource,
      details,
      ipAddress: '197.232.88.14 (Limuru Admin LAN)',
      sensitivityLevel: sensitivity,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    firebaseLogAudit(action, `[${resource}] ${details}`).catch(() => {});
  };

  // Toggle PII Decrypt with mandatory audit log
  const handleTogglePiiDecrypt = () => {
    const willDecrypt = !isPiiDecrypted;
    setIsPiiDecrypted(willDecrypt);
    handleLogAudit(
      willDecrypt ? 'PII_DECRYPT_VIEW' : 'PII_ENCRYPT_TOGGLE',
      'Parent & Learner PII Ledger (Phones & National IDs)',
      willDecrypt
        ? 'Administrator accessed unmasked guardian phone numbers and national ID credentials.'
        : 'Re-enabled AES-256 at-rest PII masking and pseudonymization.',
      willDecrypt ? 'Restricted' : 'General'
    );
    if (soundEnabled) playSound(willDecrypt ? 'click' : 'success');
  };

  const handleUpdateLearnerKemisStatus = (
    studentId: string,
    status: 'Verified' | 'Pending Sync' | 'Flagged'
  ) => {
    setLearners((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, kemisStatus: status } : s))
    );
  };

  const handleAddTeacher = (newTeacher: TeacherStaffRecord) => {
    setTeachers((prev) => [newTeacher, ...prev]);
    if (soundEnabled) playSound('success');
  };

  const handleAddFuelLog = (newLog: FuelLogEntry) => {
    setFuelLogs((prev) => [newLog, ...prev]);
    // update vehicle odometer
    setFleetVehicles((prev) =>
      prev.map((v) =>
        v.id === newLog.vehicleId
          ? {
              ...v,
              currentOdometerKm: Math.max(v.currentOdometerKm, newLog.endOdometerKm),
            }
          : v
      )
    );
    if (soundEnabled) playSound('success');
  };

  const handleAddMaintenance = (newRec: VehicleMaintenanceRecord) => {
    setMaintenanceRecords((prev) => [newRec, ...prev]);
    if (soundEnabled) playSound('success');
  };

  const handleAddTransfer = (newTrf: KemisTransferRecord) => {
    setKemisTransfers((prev) => [newTrf, ...prev]);
    if (soundEnabled) playSound('success');
  };

  const handleLoginSuccess = (user: AuthUser, isNewSignup?: boolean) => {
    handleSelectUser(user);
    handleLogAudit(
      isNewSignup ? 'AUTH_SIGNUP' : 'AUTH_LOGIN',
      `User Authentication: ${user.name} (${user.role})`,
      isNewSignup
        ? `New account registered as ${user.role} with email ${user.email}.`
        : `Signed in successfully via email/TSC credential.`
    );
    if (soundEnabled) playSound('success');
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('limuru_model_learners', JSON.stringify(learners));
  }, [learners]);

  useEffect(() => {
    localStorage.setItem('limuru_model_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('limuru_model_fleet', JSON.stringify(fleetVehicles));
  }, [fleetVehicles]);

  useEffect(() => {
    localStorage.setItem('limuru_model_fuel_logs', JSON.stringify(fuelLogs));
  }, [fuelLogs]);

  useEffect(() => {
    localStorage.setItem('limuru_model_maintenance', JSON.stringify(maintenanceRecords));
  }, [maintenanceRecords]);

  useEffect(() => {
    localStorage.setItem('limuru_model_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('limuru_model_kemis_transfers', JSON.stringify(kemisTransfers));
  }, [kemisTransfers]);

  useEffect(() => {
    localStorage.setItem('limuru_model_bursaries', JSON.stringify(bursaries));
  }, [bursaries]);

  useEffect(() => {
    localStorage.setItem('limuru_model_daraja', JSON.stringify(darajaPayments));
  }, [darajaPayments]);

  useEffect(() => {
    localStorage.setItem('limuru_model_sms', JSON.stringify(smsBroadcasts));
  }, [smsBroadcasts]);

  useEffect(() => {
    localStorage.setItem('limuru_moe_schools', JSON.stringify(moeSchools));
  }, [moeSchools]);

  useEffect(() => {
    localStorage.setItem('limuru_moe_disbursements', JSON.stringify(moeDisbursements));
  }, [moeDisbursements]);

  useEffect(() => {
    localStorage.setItem('limuru_moe_transfers', JSON.stringify(moeTransfers));
  }, [moeTransfers]);

  useEffect(() => {
    localStorage.setItem('limuru_moe_major_approvals', JSON.stringify(moeMajorApprovals));
  }, [moeMajorApprovals]);

  // Ministry of Education County Action Handlers
  const handleApproveMoeTransfer = (transferId: string, remarks: string) => {
    const digitalStamp = `MOE-CDE-KBU-TRANS-${Math.floor(100000 + Math.random() * 900000)}`;
    setMoeTransfers((prev) =>
      prev.map((t) => {
        if (t.id !== transferId) return t;
        return {
          ...t,
          status: 'Approved by Ministry',
          cdeApprovalRef: digitalStamp,
          rejectionReason: undefined,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
      })
    );
    handleLogAudit(
      'MOE_TRANSFER_DECISION',
      `MoE Transfer Approval (${transferId})`,
      `Approved inter-school transfer clearance with digital stamp ${digitalStamp}. Officer note: ${remarks}`,
      'Restricted'
    );
    if (soundEnabled) playSound('success');
  };

  const handleRejectMoeTransfer = (transferId: string, reason: string) => {
    setMoeTransfers((prev) =>
      prev.map((t) => {
        if (t.id !== transferId) return t;
        return {
          ...t,
          status: 'Rejected - Stream Capacity Exceeded',
          rejectionReason: reason,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
      })
    );
    handleLogAudit(
      'MOE_TRANSFER_DECISION',
      `MoE Transfer Rejection (${transferId})`,
      `Declined student transfer clearance. Reason: ${reason}`,
      'Restricted'
    );
    if (soundEnabled) playSound('click');
  };

  const handleApproveMoeDisbursement = (disbursementId: string, ifmisVoucher: string) => {
    setMoeDisbursements((prev) =>
      prev.map((d) => {
        if (d.id !== disbursementId) return d;
        return {
          ...d,
          status: 'Approved & Disbursed',
          ifmisVoucher,
          disbursementDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
      })
    );
    handleLogAudit(
      'MOE_CAPITATION_DISBURSE',
      `MoE Capitation Disbursement (${disbursementId})`,
      `Authorized Treasury IFMIS warrant ${ifmisVoucher} for Kiambu County school capitation grant disbursement.`,
      'Restricted'
    );
    if (soundEnabled) playSound('success');
  };

  const handleApproveMoeMajorRequest = (requestId: string, approvedBy: string) => {
    setMoeMajorApprovals((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;
        return {
          ...req,
          status: 'Approved',
          approvedBy,
          approvalDate: new Date().toISOString().replace('T', ' ').substring(0, 10),
        };
      })
    );
    handleLogAudit(
      'MOE_SCHOOL_APPROVAL',
      `MoE Institutional Accreditation (${requestId})`,
      `Approved major institutional charter request by ${approvedBy}. Gazetted in County Education Board.`,
      'Restricted'
    );
    if (soundEnabled) playSound('success');
  };

  // Current selected student for report cards
  const currentStudent = useMemo(() => {
    return learners.find((s) => s.id === selectedStudentId) || learners[0];
  }, [learners, selectedStudentId]);

  // Aggregated System Metrics
  const summaryMetrics = useMemo(() => {
    const totalStudents = learners.length;
    const totalFeesExpected = learners.reduce((acc, s) => acc + s.fees.totalTermFee, 0);
    const totalFeesPaid = learners.reduce((acc, s) => acc + s.fees.paidAmount, 0);
    const totalFeesBalance = learners.reduce((acc, s) => acc + s.fees.balance, 0);
    const feeCollectionRate = Math.round((totalFeesPaid / (totalFeesExpected || 1)) * 100);

    const clearedCount = learners.filter((s) => s.fees.status === 'Cleared').length;
    const partialCount = learners.filter((s) => s.fees.status === 'Partial').length;
    const defaulterCount = learners.filter((s) => s.fees.status === 'Defaulter').length;
    const totalBursaries = bursaries.reduce((sum, b) => sum + b.amount, 0);

    let eeCount = 0;
    let meCount = 0;
    let aeCount = 0;
    let beCount = 0;
    let totalScores = 0;

    learners.forEach((std) => {
      Object.values(std.assessments).forEach((ass) => {
        totalScores++;
        if (ass.level === 'EE') eeCount++;
        else if (ass.level === 'ME') meCount++;
        else if (ass.level === 'AE') aeCount++;
        else beCount++;
      });
    });

    const cbcMasteryIndex = totalScores > 0 ? Math.round(((eeCount + meCount) / totalScores) * 100) : 89;

    return {
      totalStudents,
      totalFeesExpected,
      totalFeesPaid,
      totalFeesBalance,
      feeCollectionRate,
      clearedCount,
      partialCount,
      defaulterCount,
      totalBursaries,
      cbcMasteryIndex,
      eeCount,
      meCount,
      aeCount,
      beCount,
    };
  }, [learners, bursaries]);

  // Add Learner
  const handleAddLearner = (newLearner: Learner) => {
    setLearners((prev) => [newLearner, ...prev]);
    if (soundEnabled) playSound('success');
  };

  const handleAddBulkLearners = (newLearners: Learner[]) => {
    setLearners((prev) => [...newLearners, ...prev]);
    if (soundEnabled) playSound('success');
  };

  // CBC Marksheet bulk update
  const handleApplyMarks = (
    subjectId: string,
    updates: { studentId: string; summativeScore: number; formative: CBCLevel; remarks: string }[]
  ) => {
    setLearners((prev) =>
      prev.map((s) => {
        const update = updates.find((u) => u.studentId === s.id);
        if (!update) return s;
        return {
          ...s,
          assessments: {
            ...s.assessments,
            [subjectId]: {
              formative: update.formative,
              summativeScore: update.summativeScore,
              level: update.formative,
              remarks: update.remarks,
            },
          },
        };
      })
    );
    if (soundEnabled) playSound('success');
  };

  // Daraja M-Pesa Payment Handshake
  const handleProcessDarajaPayment = (payment: DarajaMpesaPayment) => {
    setDarajaPayments((prev) => [payment, ...prev]);

    // Credit student ledger and allocate to votehead
    setLearners((prev) =>
      prev.map((s) => {
        if (s.id !== payment.matchedLearnerId) return s;
        const newPaid = s.fees.paidAmount + payment.transAmount;
        const newBal = Math.max(0, s.fees.totalTermFee - newPaid);
        const newStatus: 'Cleared' | 'Partial' | 'Defaulter' =
          newBal === 0 ? 'Cleared' : newBal > s.fees.totalTermFee * 0.4 ? 'Defaulter' : 'Partial';

        // Update votehead
        const vh = payment.allocatedVotehead;
        const currentVh = s.fees.voteheadBreakdown[vh] || { allocated: 5000, paid: 0 };
        const updatedVh = {
          ...s.fees.voteheadBreakdown,
          [vh]: { ...currentVh, paid: currentVh.paid + payment.transAmount },
        };

        return {
          ...s,
          fees: {
            ...s.fees,
            paidAmount: newPaid,
            balance: newBal,
            status: newStatus,
            voteheadBreakdown: updatedVh,
          },
        };
      })
    );

    // Also auto-dispatch confirmation SMS
    const confirmationSms: SMSBroadcast = {
      id: `sms_${Date.now()}`,
      type: 'Fee Reminder',
      message: `Confirmed Ksh ${payment.transAmount.toLocaleString()}.00 received via Paybill 522123 (${payment.transId}) for ${payment.matchedLearnerName} (${payment.billRefNumber}). Receipt: ${payment.receiptNumber}. Limuru Model School.`,
      recipientsCount: 1,
      targetGrade: 'All Grades',
      timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      deliveryRate: 100,
      status: 'Delivered',
    };
    setSmsBroadcasts((prev) => [confirmationSms, ...prev]);

    if (soundEnabled) playSound('success');
  };

  // Add Bursary Record
  const handleAddBursary = (bursary: BursaryRecord) => {
    setBursaries((prev) => [bursary, ...prev]);
    // Credit student
    setLearners((prev) =>
      prev.map((s) => {
        if (s.id !== bursary.learnerId) return s;
        const newPaid = s.fees.paidAmount + bursary.amount;
        const newBal = Math.max(0, s.fees.totalTermFee - newPaid);
        const newStatus: 'Cleared' | 'Partial' | 'Defaulter' =
          newBal === 0 ? 'Cleared' : newBal > s.fees.totalTermFee * 0.4 ? 'Defaulter' : 'Partial';

        return {
          ...s,
          fees: {
            ...s.fees,
            paidAmount: newPaid,
            balance: newBal,
            status: newStatus,
            bursaryApplied: s.fees.bursaryApplied + bursary.amount,
          },
        };
      })
    );
    if (soundEnabled) playSound('success');
  };

  // Bulk Excel Fee Payments apply
  const handleApplyBatchFeePayments = (
    updates: { studentId: string; amountPaid: number; receiptNumber: string }[]
  ) => {
    setLearners((prev) =>
      prev.map((s) => {
        const update = updates.find((u) => u.studentId === s.id);
        if (!update) return s;
        const newPaid = s.fees.paidAmount + update.amountPaid;
        const newBal = Math.max(0, s.fees.totalTermFee - newPaid);
        const newStatus: 'Cleared' | 'Partial' | 'Defaulter' =
          newBal === 0 ? 'Cleared' : newBal > s.fees.totalTermFee * 0.4 ? 'Defaulter' : 'Partial';
        return {
          ...s,
          fees: {
            ...s.fees,
            paidAmount: newPaid,
            balance: newBal,
            status: newStatus,
          },
        };
      })
    );
    if (soundEnabled) playSound('success');
  };

  // Bank Fee Payment Edit & Direct Clearance Handshake
  const handleSaveFeeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeeLearner) return;

    const newPaid = Number(editFeePaidAmount) || 0;
    const newBal = Math.max(0, editingFeeLearner.fees.totalTermFee - newPaid);
    const newStatus: 'Cleared' | 'Partial' | 'Defaulter' =
      newBal === 0 ? 'Cleared' : newBal > editingFeeLearner.fees.totalTermFee * 0.4 ? 'Defaulter' : 'Partial';

    setLearners((prev) =>
      prev.map((s) => {
        if (s.id !== editingFeeLearner.id) return s;
        return {
          ...s,
          fees: {
            ...s.fees,
            paidAmount: newPaid,
            balance: newBal,
            status: newStatus,
          },
        };
      })
    );

    handleLogAudit(
      'FEE_LEDGER_EXPORT' as any,
      `Fee Ledger Record: ${editingFeeLearner.name} (${editingFeeLearner.admissionNo})`,
      `Accountant edited fees: Paid set to KES ${newPaid.toLocaleString()}, outstanding balance KES ${newBal.toLocaleString()}. Method: ${editFeePaymentMethod}, Slip Ref: ${editFeeBankRef || 'N/A'}.`,
      'Restricted'
    );

    setToastNotification(`Fee payment record updated for ${editingFeeLearner.name}. New balance: KES ${newBal.toLocaleString()}`);
    if (soundEnabled) playSound('success');
    setEditingFeeLearner(null);
  };

  // Add Discipline / Guidance Incident
  const handleAddDisciplineIncident = (studentId: string, incident: DisciplineIncident) => {
    setLearners((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, disciplineIncidents: [incident, ...s.disciplineIncidents] } : s))
    );
    if (soundEnabled) playSound('click');
  };

  // Handle Renaming Stream / Class across entire institution
  const handleRenameStream = (oldStreamName: string, newStreamName: string, grade: GradeLevel) => {
    setLearners((prev) =>
      prev.map((s) => {
        if (s.stream === oldStreamName || (s.grade === grade && s.stream.trim().toLowerCase() === oldStreamName.trim().toLowerCase())) {
          return { ...s, stream: newStreamName };
        }
        return s;
      })
    );
    setTeachers((prev) =>
      prev.map((t) => {
        if (t.assignedStream === oldStreamName) {
          return { ...t, assignedStream: newStreamName };
        }
        return t;
      })
    );
    if (soundEnabled) playSound('success');
  };

  const handleAddNewStream = (grade: GradeLevel, streamName: string) => {
    if (soundEnabled) playSound('success');
  };

  // User UUID & Role Scoping
  // Class Masters / Teachers scoped to their assigned stream or grade
  // Parents scoped strictly to their child (linkedLearnerId)
  const scopedLearners = useMemo(() => {
    if (currentUser.role === 'parent' && currentUser.linkedLearnerId) {
      const match = learners.filter((s) => s.id === currentUser.linkedLearnerId);
      return match.length > 0 ? match : learners.slice(0, 1);
    }
    if (currentUser.role === 'class_master' || currentUser.role === 'class_teacher') {
      const teacherStream = currentUser.assignedStream?.toLowerCase();
      const teacherGrade = currentUser.assignedGrade;
      const matched = learners.filter((s) => {
        if (teacherStream && s.stream.toLowerCase() === teacherStream) return true;
        if (teacherGrade && s.grade === teacherGrade) return true;
        return false;
      });
      return matched.length > 0 ? matched : learners;
    }
    return learners;
  }, [learners, currentUser]);

  // Filtered Learners for Admissions Table
  const filteredAdmissionsLearners = scopedLearners.filter((s) => {
    if (admissionsGradeFilter !== 'All' && s.grade !== admissionsGradeFilter) return false;
    if (admissionsSearch) {
      const q = admissionsSearch.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.nemisUpi.toLowerCase().includes(q) ||
        s.stream.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Learners for CBC Table
  const filteredCbcStudents = scopedLearners.filter((s) => {
    if (cbcGradeFilter !== 'All' && s.grade !== cbcGradeFilter) return false;
    return true;
  });

  // SIGN-IN GATE: Must appear BEFORE any dashboard content is rendered
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 flex flex-col items-center justify-center text-white p-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-5 shadow-2xl animate-pulse">
          <School className="w-8 h-8 text-emerald-400" />
        </div>
        <div className="flex items-center gap-3 text-emerald-200 font-semibold text-sm">
          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying Firebase Authentication & Firestore Credentials...</span>
        </div>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          Limuru Model Comprehensive School · Center No: 20401823
        </p>
      </div>
    );
  }

  if (!authUser) {
    return <LoginPage />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} flex flex-col font-sans selection:bg-emerald-600 selection:text-white transition-colors duration-150`}>
      {/* 14-Minute Inactivity Warning Banner */}
      {inactivityWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9990] max-w-lg w-full px-4 animate-in fade-in slide-in-from-top-4">
          <div className="bg-amber-500 text-slate-950 p-4 rounded-xl shadow-2xl border-2 border-amber-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-slate-950 shrink-0 animate-bounce" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider">Session Inactivity Warning</p>
                <p className="text-xs font-medium">You will be logged out in 60 seconds due to inactivity.</p>
              </div>
            </div>
            <button
              onClick={resetInactivityTimer}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shrink-0 transition-colors shadow-sm"
            >
              Keep Session Active
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Inputs for Header Actions */}
      <input
        type="file"
        ref={marksheetFileInputRef}
        className="hidden"
        accept=".xlsx,.xls,.csv"
        onChange={handleMarksheetFileSelected}
      />
      <input
        type="file"
        ref={feeExcelFileInputRef}
        className="hidden"
        accept=".xlsx,.xls,.csv"
        onChange={handleFeeExcelFileSelected}
      />

      {/* Floating Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900/95 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium leading-snug">{toastNotification}</span>
          <button
            onClick={() => setToastNotification(null)}
            className="ml-auto text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Firebase & Storage Status Banner */}
      <FirebaseStatusBanner />

      {/* =========================================================================
          TOP INSTITUTIONAL HEADER & BRANDING
          ========================================================================= */}
      <header className="no-print sticky top-0 z-40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border-b border-emerald-800 shadow-md text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Left Insignia Badge & Mobile Hamburger Menu */}
            <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
              {/* Mobile Menu Hamburger (for non-MoE roles on smaller screens) */}
              {currentUser.role !== 'moe_director' && activeTab !== 'moe-oversight' && (
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  title="Toggle Navigation Menu"
                  className="lg:hidden p-2 text-white bg-emerald-800/80 hover:bg-emerald-700 rounded-lg transition-colors border border-emerald-600/60 flex items-center justify-center"
                >
                  {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
              )}

              {currentUser.role === 'moe_director' ? (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center font-bold shadow-xs">
                    <span className="text-xl">🇰🇪</span>
                  </div>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-400 text-slate-950 font-mono uppercase tracking-wide">
                    GOV.KE
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold shadow-xs">
                    <School className="w-6 h-6 text-emerald-300" />
                  </div>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-400 text-slate-950 font-mono uppercase tracking-wide">
                    CBC HUB
                  </span>
                </div>
              )}
            </div>

            {/* CENTERED MAJESTIC PROMINENT HEADING FOR MOE AND SCHOOL */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
              {currentUser.role === 'moe_director' ? (
                <>
                  <div className="flex items-center justify-center gap-2.5 flex-wrap">
                    <span className="text-xl sm:text-2xl drop-shadow-sm">🇰🇪</span>
                    <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-wider text-white uppercase drop-shadow-sm">
                      REPUBLIC OF KENYA · MINISTRY OF EDUCATION
                    </h1>
                    <span className="text-xl sm:text-2xl drop-shadow-sm">🇰🇪</span>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-400 text-slate-950 font-mono tracking-normal uppercase shadow-xs">
                      State Oversight
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-amber-200/90 tracking-wide mt-1">
                    State Department for Basic Education · Kiambu County & National Oversight Directorate
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2.5 flex-wrap">
                    <School className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
                    <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-white uppercase drop-shadow-sm">
                      LIMURU MODEL COMPREHENSIVE SCHOOL
                    </h1>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-400 text-slate-950 font-mono tracking-normal uppercase shadow-xs">
                      Center 20401823
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-emerald-200/90 tracking-wide mt-1">
                    Ministry of Education · Kiambu County · Grade 1 to 9 CBC & Senior Secondary Hub
                  </p>
                </>
              )}
            </div>

            {/* Quick Action Buttons & Controls */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              {/* Sound Chime Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Audio Chime Enabled' : 'Audio Muted'}
                className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800/60 rounded-lg transition-colors border border-emerald-700/50"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </button>

              {/* Light / Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800/60 rounded-lg transition-colors border border-emerald-700/50"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-emerald-200" />}
              </button>



              {/* 5 School Specific Action Buttons (For non-MoE roles) */}
              {currentUser.role !== 'moe_director' && (
                <>
                  {/* Action 1: Admit Learner */}
                  {hasPermission(currentUser.role, 'manage_admissions') && (
                    <button
                      onClick={() => {
                        setIsAdmissionModalOpen(true);
                        if (soundEnabled) playSound('click');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      title="Admit new learner (Grades 1-9)"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Admit Learner</span>
                    </button>
                  )}

                  {/* Action 2: Rename Classes */}
                  <button
                    onClick={() => {
                      setIsClassRenameModalOpen(true);
                      if (soundEnabled) playSound('click');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-200 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/40 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    title="Configure and rename school classes and streams"
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-300" />
                    <span>Rename Classes</span>
                  </button>

                  {/* Action 3: Upload Marksheet */}
                  {hasPermission(currentUser.role, 'manage_cbc_marks') && (
                    <button
                      onClick={() => {
                        marksheetFileInputRef.current?.click();
                      }}
                      className="hidden sm:flex px-3 py-1.5 text-xs font-semibold text-sky-100 bg-sky-900/80 hover:bg-sky-800 border border-sky-600/50 rounded-lg shadow-xs transition-colors items-center gap-1.5"
                      title="Upload CBC Marksheet file"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Marksheet</span>
                    </button>
                  )}

                  {/* Action 4: Add Fees via Excel */}
                  {hasPermission(currentUser.role, 'manage_fees') && (
                    <button
                      onClick={() => {
                        feeExcelFileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-teal-100 bg-teal-800/80 hover:bg-teal-700 border border-teal-500/50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      title="Upload batch fee collections via Excel/CSV"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Add Fees via Excel</span>
                    </button>
                  )}

                  {/* Action 5: Daraja API Gateway (Settings) */}
                  <button
                    onClick={() => {
                      setActiveTab('daraja');
                      if (soundEnabled) playSound('click');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-200 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    title="Configure Safaricom Daraja API credentials in Settings"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Daraja API Gateway</span>
                  </button>
                </>
              )}

              {/* RBAC Persona Switcher Dropdown */}
              <RoleSwitcher
                currentUser={currentUser}
                onSelectUser={handleSelectUser}
                onOpenPermissionMatrix={() => setIsPermissionModalOpen(true)}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
              />

              {/* Authenticated User Status & Prominent Sign Out */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-emerald-800">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-white leading-tight">
                    {authUser.fullName}
                  </div>
                  <div className="text-[10px] text-emerald-300 font-mono capitalize">
                    {authUser.role === 'headteacher' ? 'Head Teacher' : authUser.role === 'moe_official' ? 'Ministry Official' : authUser.role}
                  </div>
                </div>
                <button
                  onClick={() => setIsSignOutConfirmOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                  title="Sign Out / Logout of Limuru CBC System"
                >
                  <LogOut className="w-3.5 h-3.5 text-white" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Term Kicker Info Strip with Strongly Locked User UUID Badge */}
      <div className="no-print bg-slate-900 text-slate-300 py-1.5 px-4 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {currentUser.role === 'moe_director' ? (
            <>
              <div className="flex items-center gap-3">
                <span className="font-bold text-amber-400">Republic of Kenya · Ministry of Education</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Kiambu County Directorate (Headquarters Hub)</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Basic Education Act No. 14 of 2013 Statutory Compliance</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[11px] flex-wrap">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 border border-amber-500/40 text-[10px] text-amber-300 font-mono">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>UUID: <strong className="text-white">{currentUser.uuid}</strong></span>
                  <span className="px-1 py-0.2 rounded bg-amber-950 text-amber-400 text-[9px] font-bold uppercase tracking-wider">Locked</span>
                </div>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Approved Schools: <strong className="text-white tabular-nums">{moeSchools.length}</strong></span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Security: <strong className="text-amber-400 font-mono">TLS 1.3 PKI Seal</strong></span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-emerald-400">Limuru Model Comprehensive School</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>MoE Academic Year 2026 · Term 1 (Week 7 of 13)</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Kiambu County / Limuru Sub-County</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[11px] flex-wrap">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 border border-emerald-500/40 text-[10px] text-emerald-300 font-mono">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>UUID: <strong className="text-white">{currentUser.uuid}</strong></span>
                  <span className="px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">Locked</span>
                </div>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Enrolled: <strong className="text-white tabular-nums">{learners.length} Learners</strong></span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Efficiency: <strong className="text-emerald-400 tabular-nums">{summaryMetrics.feeCollectionRate}%</strong></span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* =========================================================================
          MAIN APPLICATION VIEWPORT
          ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile Drawer (Collapses behind Menu button on phones) */}
        {isMobileMenuOpen && currentUser.role !== 'moe_director' && activeTab !== 'moe-oversight' && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div
              className={`relative w-72 max-w-[85vw] h-full ${
                isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white text-slate-800 border-slate-200'
              } border-r shadow-2xl p-5 flex flex-col overflow-y-auto z-10 space-y-6`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <School className="w-5 h-5 text-emerald-500" />
                  <span className="font-bold text-sm">School Platform</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {SCHOOL_SIDEBAR_GROUPS.map((group) => {
                  const accessibleItems = group.items.filter((item) => isTabAccessible(currentUser.role, item.id));
                  if (accessibleItems.length === 0) return null;
                  return (
                    <div key={group.name} className="space-y-1.5">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5">
                        {group.name}
                      </h4>
                      <div className="space-y-1">
                        {accessibleItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveTab(item.id as ActiveTab);
                                setIsMobileMenuOpen(false);
                                if (soundEnabled) playSound('click');
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                isActive
                                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                  : isDarkMode
                                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                  : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className="truncate">{item.label}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* RBAC UNAUTHORIZED SHIELD */}
        {!isTabAccessible(currentUser.role, activeTab) ? (
          <UnauthorizedAccessGuard
            currentUser={currentUser}
            attemptedModule={activeTab}
            onGoBack={() => setActiveTab(currentUser.role === 'parent' ? 'parent-portal' : 'dashboard')}
            onSelectUser={handleSelectUser}
          />
        ) : (
          <div className="flex gap-6 items-start">
            {/* Desktop Left Sidebar: Grouped into Daily, Learning, Money, Operations, Government */}
            {currentUser.role !== 'moe_director' && activeTab !== 'moe-oversight' && (
              <aside className={`hidden lg:flex flex-col w-64 shrink-0 rounded-2xl border p-4 shadow-xs sticky top-24 transition-colors ${
                isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <div className="space-y-5">
                  {SCHOOL_SIDEBAR_GROUPS.map((group) => {
                    const accessibleItems = group.items.filter((item) => isTabAccessible(currentUser.role, item.id));
                    if (accessibleItems.length === 0) return null;
                    return (
                      <div key={group.name} className="space-y-1.5">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5">
                          {group.name}
                        </h4>
                        <div className="space-y-0.5">
                          {accessibleItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  setActiveTab(item.id as ActiveTab);
                                  if (soundEnabled) playSound('click');
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                  isActive
                                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                    : isDarkMode
                                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                  <span className="truncate">{item.label}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </aside>
            )}

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* VIEW 0: DEDICATED PARENT PORTAL */}
              {activeTab === 'parent-portal' && (
                <ParentPortalView
                  currentUser={currentUser}
                  learners={learners}
                  timetableSlots={timetableSlots}
                  smsBroadcasts={smsBroadcasts}
                  onProcessPayment={handleProcessDarajaPayment}
                  onViewReportCard={(studentId) => {
                    setSelectedStudentId(studentId);
                    setActiveTab('report-card');
                  }}
                />
              )}

              {/* VIEW 1: OVERVIEW DASHBOARD */}
              {activeTab === 'dashboard' && (
                <SchoolPlatformDashboard
                  currentUser={currentUser}
                  isDarkMode={isDarkMode}
                  learners={learners}
                  darajaPayments={darajaPayments}
                  smsBroadcasts={smsBroadcasts}
                  onOpenAdmitModal={() => {
                    setIsAdmissionModalOpen(true);
                    if (soundEnabled) playSound('click');
                  }}
                  onOpenClassRenameModal={() => {
                    setIsClassRenameModalOpen(true);
                    if (soundEnabled) playSound('click');
                  }}
                  onOpenUploadMarksheet={() => marksheetFileInputRef.current?.click()}
                  onOpenAddFeesExcel={() => feeExcelFileInputRef.current?.click()}
                  onProcessPayment={handleProcessDarajaPayment}
                  onSimulatePush={handleSimulateDarajaPush}
                  onUpdateLearnerUpi={handleUpdateLearnerUpi}
                  onSendSmsReminder={handleSendSmsReminder}
                  onSelectTab={(tab) => {
                    setActiveTab(tab);
                    if (soundEnabled) playSound('click');
                  }}
                  onLogAudit={handleLogAudit}
                />
              )}

        {/* VIEW 2: ADMISSIONS & NEMIS ENROLLMENT (GRADES 1-9) */}
        {activeTab === 'admissions' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Learner Admission & NEMIS/KEMIS Registry (Grades 1 to 9)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Limuru Model Comprehensive School · Unique Personal Identifier (UPI) & Birth Certificate validation
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    exportToExcel(
                      'Limuru_Model_Master_Learner_Registry_Grades_1_to_9',
                      learners,
                      [
                        { header: 'Admission No', key: 'admissionNo' },
                        { header: 'Full Name', key: 'name' },
                        { header: 'Gender', key: 'gender' },
                        { header: 'Grade', key: 'grade' },
                        { header: 'Stream', key: 'stream' },
                        { header: 'NEMIS UPI', key: 'nemisUpi' },
                        { header: 'Birth Certificate No', key: 'birthCertNo' },
                        { header: 'Guardian Name', key: 'guardianName' },
                        { header: 'Guardian Phone', key: 'guardianPhone' },
                        { header: 'Term Fee (KES)', key: (s) => s.fees.totalTermFee },
                        { header: 'Paid Amount (KES)', key: (s) => s.fees.paidAmount },
                        { header: 'Balance (KES)', key: (s) => s.fees.balance },
                        { header: 'Fee Status', key: (s) => s.fees.status },
                      ]
                    );
                  }}
                  className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  Export Registry (.csv)
                </button>

                <button
                  onClick={() => setIsAdmissionModalOpen(true)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Admit New Learner
                </button>
              </div>
            </div>

            {/* Filter toolbar */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-slate-700 mr-1">Filter Grade:</span>
                <button
                  onClick={() => setAdmissionsGradeFilter('All')}
                  className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                    admissionsGradeFilter === 'All' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Grades
                </button>
                {ALL_GRADES.map((g) => (
                  <button
                    key={g}
                    onClick={() => setAdmissionsGradeFilter(g)}
                    className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                      admissionsGradeFilter === g ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <div className="relative min-w-56">
                <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, admission no, UPI..."
                  value={admissionsSearch}
                  onChange={(e) => setAdmissionsSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold">
                <span>Showing {filteredAdmissionsLearners.length} Registered Learners</span>
                <span className="text-emerald-700">All synced with KEMIS & NEMIS</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Admission No</th>
                      <th className="p-3">Learner Full Name</th>
                      <th className="p-3">Grade & Stream</th>
                      <th className="p-3">NEMIS UPI</th>
                      <th className="p-3">Birth Certificate</th>
                      <th className="p-3">Guardian Mobile</th>
                      <th className="p-3 text-right">Fee Balance</th>
                      <th className="p-3 text-center">NEMIS Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAdmissionsLearners.map((std) => (
                      <tr key={std.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">{std.admissionNo}</td>
                        <td className="p-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            {std.photoUrl ? (
                              <img
                                src={std.photoUrl}
                                alt={std.name}
                                className="w-8 h-8 rounded-full object-cover border border-emerald-400/60 shrink-0 shadow-xs"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                                {std.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-900">{std.name}</div>
                              <span className="block text-[11px] text-slate-500 font-normal">{std.gender} · DOB: {std.dob}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-medium text-slate-700">{std.grade} ({std.stream})</td>
                        <td className="p-3 font-mono text-slate-600">{std.nemisUpi}</td>
                        <td className="p-3 font-mono text-slate-500">{std.birthCertNo}</td>
                        <td className="p-3 font-mono text-slate-600">{std.guardianPhone}</td>
                        <td className="p-3 text-right font-mono font-bold tabular-nums">
                          {std.fees.balance === 0 ? (
                            <span className="text-emerald-700">Cleared</span>
                          ) : (
                            <span className="text-rose-600">KES {std.fees.balance.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {std.kemisStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedStudentId(std.id);
                              setActiveTab('report-card');
                            }}
                            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
                          >
                            Report Card
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: CBC CURRICULUM TRACKING */}
        {activeTab === 'cbc' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  MoE CBC Curriculum Assessment Tracker (Grades 1 to 9)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Continuous Assessment Tests (CAT), formative projects & summative performance levels
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBulkMarksheetOpen(true)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Bulk Upload Marksheet via Excel
                </button>
              </div>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-slate-700">Grade:</span>
                <button
                  onClick={() => setCbcGradeFilter('All')}
                  className={`px-2.5 py-1 rounded font-semibold ${
                    cbcGradeFilter === 'All' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  All
                </button>
                {ALL_GRADES.map((g) => (
                  <button
                    key={g}
                    onClick={() => setCbcGradeFilter(g)}
                    className={`px-2.5 py-1 rounded font-semibold ${
                      cbcGradeFilter === g ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <div>
                <span className="font-semibold text-slate-700 mr-2">Learning Area:</span>
                <select
                  value={cbcSubjectFilter}
                  onChange={(e) => setCbcSubjectFilter(e.target.value)}
                  className="border border-slate-300 rounded px-3 py-1.5 font-bold text-emerald-800 text-xs"
                >
                  {ALL_LEARNING_AREAS.map((subj) => (
                    <option key={subj.id} value={subj.id}>
                      {subj.name} ({subj.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assessment Entry & Rubric Matrix */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Showing {filteredCbcStudents.length} Learners ({cbcGradeFilter})
                </span>
                <div className="flex items-center gap-3 font-semibold text-[11px]">
                  <span className="text-emerald-700">EE: Exceeding (80-100%)</span>
                  <span className="text-sky-700">ME: Meeting (65-79%)</span>
                  <span className="text-amber-700">AE: Approaching (50-64%)</span>
                  <span className="text-rose-700">BE: Below (&lt;50%)</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Learner & Admission</th>
                      <th className="p-3">Grade & Stream</th>
                      <th className="p-3 text-center">Summative Mark (%)</th>
                      <th className="p-3 text-center">CBC Rubric Level</th>
                      <th className="p-3">Educator Rubric Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCbcStudents.map((std) => {
                      const ass = std.assessments[cbcSubjectFilter] || {
                        formative: 'ME',
                        summativeScore: 72,
                        level: 'ME',
                        remarks: 'Demonstrating consistent curriculum progress.',
                      };
                      return (
                        <tr key={std.id} className="hover:bg-slate-50">
                          <td className="p-3">
                            <strong className="text-slate-900 block">{std.name}</strong>
                            <span className="text-[11px] text-slate-500 font-mono">{std.admissionNo} · {std.nemisUpi}</span>
                          </td>
                          <td className="p-3 text-slate-700 font-medium">{std.stream}</td>
                          <td className="p-3 text-center font-bold text-slate-900 tabular-nums">
                            {ass.summativeScore}%
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                ass.level === 'EE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ass.level === 'ME'
                                  ? 'bg-sky-100 text-sky-800'
                                  : ass.level === 'AE'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {ass.level} · {ass.level === 'EE' ? 'Exceeding' : ass.level === 'ME' ? 'Meeting' : ass.level === 'AE' ? 'Approaching' : 'Below'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 truncate max-w-sm">{ass.remarks}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: SAFARICOM DARAJA M-PESA SYNC */}
        {activeTab === 'daraja' && (
          <DarajaMpesaSync
            students={learners}
            payments={darajaPayments}
            onProcessPayment={handleProcessDarajaPayment}
          />
        )}

        {/* VIEW 5: VOTE HEADS & CAPITATION/BURSARIES */}
        {activeTab === 'voteheads' && (
          <VoteheadAndBursaryLedger
            students={learners}
            bursaries={bursaries}
            onAddBursary={handleAddBursary}
          />
        )}

        {/* VIEW 6: BULK SMS GATEWAY */}
        {activeTab === 'sms' && (
          <BulkSMSGateway
            students={learners}
            broadcasts={smsBroadcasts}
            onSendBroadcast={(b) => setSmsBroadcasts((prev) => [b, ...prev])}
            initialDraft={smsInitialDraft}
            onClearInitialDraft={() => setSmsInitialDraft(null)}
          />
        )}

        {/* VIEW 7: PAYROLL & STATUTORY (KRA, SHA, NSSF) */}
        {activeTab === 'payroll' && (
          <PayrollAndStatutory employees={payrollEmployees} />
        )}

        {/* VIEW 8: TIMETABLING ENGINE */}
        {activeTab === 'timetable' && (
          <TimetableEngine initialSlots={timetableSlots} />
        )}

        {/* VIEW 9: EXAM & GRADE ANALYTICS */}
        {activeTab === 'analytics' && (
          <ExamAndGradeAnalytics students={learners} />
        )}

        {/* VIEW 10: DIGITAL PORTFOLIOS & HEALTH/DISCIPLINE */}
        {activeTab === 'portfolios' && (
          <DigitalPortfoliosAndCoCurricular
            students={learners}
            onAddDisciplineIncident={handleAddDisciplineIncident}
          />
        )}

        {/* VIEW 11: ASSETS & FACILITIES */}
        {activeTab === 'assets' && (
          <AssetAndFacilityManagement assets={assets} />
        )}

        {/* VIEW 12: KITCHEN FOODSTOCK STORES */}
        {activeTab === 'kitchen-inventory' && (
          <KitchenInventory />
        )}

        {/* VIEW 13: TEXTBOOKS & STATIONERY */}
        {activeTab === 'textbooks-stationery' && (
          <TextbookStationeryPlatform
            students={learners.map((s) => ({
              id: s.id,
              name: s.name,
              nemisUpi: s.nemisUpi,
              grade: s.grade,
              stream: s.stream,
            }))}
          />
        )}

        {/* VIEW 14: FEE LEDGER & EXCEL RECONCILIATION */}
        {activeTab === 'fees' && (() => {
          const defaulters = learners.filter((s) => s.fees.status === 'Defaulter');
          const partials = learners.filter((s) => s.fees.status === 'Partial');
          const cleared = learners.filter((s) => s.fees.status === 'Cleared');
          const totalArrears = learners.reduce((acc, s) => acc + s.fees.balance, 0);

          const displayedFeeLearners = learners.filter((s) => {
            if (feeStatusFilter !== 'All' && s.fees.status !== feeStatusFilter) return false;
            if (feeSearchQuery.trim()) {
              const q = feeSearchQuery.toLowerCase();
              return (
                s.name.toLowerCase().includes(q) ||
                s.admissionNo.toLowerCase().includes(q) ||
                s.stream.toLowerCase().includes(q) ||
                s.guardianPhone.toLowerCase().includes(q) ||
                s.guardianName.toLowerCase().includes(q)
              );
            }
            return true;
          });

          const handleBulkRemindAllDefaulters = () => {
            setSmsInitialDraft({
              targetGroup: 'Fee Defaulters',
              messageType: 'Fee Reminder',
              messageText: `Dear Parent/Guardian, Limuru Model School kindly reminds you to settle outstanding Term 1 school fees via Safaricom Paybill 522123 (Account: Learner Adm No). Early clearance facilitates uninterrupted learning. Inquiries: 0722000000. Thank you.`,
              targetStudentName: `${defaulters.length + partials.length} Defaulters & Partial Accounts`,
            });
            setActiveTab('sms');
            if (soundEnabled) playSound('click');
          };

          return (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Limuru Model School Fee Ledger & Excel Accounting
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Reconciliation with Safaricom Paybill 522123, NG-CDF Bursaries, automated SMS fee reminders, and Excel upload
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsExcelFeeModalOpen(true)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Add Fees via Excel (.csv)
                  </button>
                </div>
              </div>

              {/* Arrears Alert Banner */}
              {(defaulters.length > 0 || partials.length > 0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-200/70 border border-amber-300 text-amber-800 flex items-center justify-center font-bold shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-800" />
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm font-bold block">
                        Fee Arrears Action Needed: {defaulters.length} Defaulters & {partials.length} Partial Balances
                      </strong>
                      <span className="text-[11px] text-amber-800">
                        Total Arrears: <strong className="font-mono font-bold">KES {totalArrears.toLocaleString()}</strong> · Send direct SMS reminders with pre-filled payment details to guardian phones.
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleBulkRemindAllDefaulters}
                    className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    Bulk SMS Remind All Defaulters ({defaulters.length + partials.length})
                  </button>
                </div>
              )}

              {/* Filter Tabs & Search Bar */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
                  {(
                    [
                      { id: 'All', label: 'All Learners', count: learners.length },
                      { id: 'Defaulter', label: 'Defaulters Only', count: defaulters.length },
                      { id: 'Partial', label: 'Partial Balances', count: partials.length },
                      { id: 'Cleared', label: 'Cleared', count: cleared.length },
                    ] as const
                  ).map((filter) => {
                    const isSelected = feeStatusFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => {
                          setFeeStatusFilter(filter.id);
                          if (soundEnabled) playSound('click');
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {filter.label}
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {filter.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by student, adm, phone..."
                    value={feeSearchQuery}
                    onChange={(e) => setFeeSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-md text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Fee Ledger Table */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                      <tr>
                        <th className="p-3">Admission No</th>
                        <th className="p-3">Learner Name</th>
                        <th className="p-3">Grade & Stream</th>
                        <th className="p-3">Guardian Mobile</th>
                        <th className="p-3 text-right">Term Fee</th>
                        <th className="p-3 text-right">Bursary Applied</th>
                        <th className="p-3 text-right">Total Paid</th>
                        <th className="p-3 text-right">Outstanding Bal</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-right">Actions & Receipts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedFeeLearners.map((s) => {
                        const hasArrears = s.fees.status === 'Defaulter' || s.fees.status === 'Partial';

                        return (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-slate-900">{s.admissionNo}</td>
                            <td className="p-3 font-semibold text-slate-900">{s.name}</td>
                            <td className="p-3 text-slate-700">{s.stream}</td>
                            <td className="p-3 font-mono text-slate-600">{s.guardianPhone}</td>
                            <td className="p-3 text-right tabular-nums text-slate-700">
                              KES {s.fees.totalTermFee.toLocaleString()}
                            </td>
                            <td className="p-3 text-right tabular-nums font-bold text-sky-700">
                              KES {s.fees.bursaryApplied.toLocaleString()}
                            </td>
                            <td className="p-3 text-right tabular-nums font-bold text-emerald-800">
                              KES {s.fees.paidAmount.toLocaleString()}
                            </td>
                            <td className="p-3 text-right tabular-nums font-bold">
                              {s.fees.balance === 0 ? (
                                <span className="text-emerald-700">KES 0</span>
                              ) : (
                                <span className="text-rose-600">KES {s.fees.balance.toLocaleString()}</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  s.fees.status === 'Cleared'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : s.fees.status === 'Partial'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {s.fees.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                <button
                                  onClick={() => {
                                    setEditingFeeLearner(s);
                                    setEditFeePaidAmount(s.fees.paidAmount);
                                    setEditFeePaymentMethod('Bank Deposit Slip');
                                    setEditFeeBankRef('');
                                    if (soundEnabled) playSound('click');
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-300 transition-colors shadow-2xs"
                                  title={`Edit fee record or upload bank deposit slip for ${s.name}`}
                                >
                                  <Receipt className="w-3.5 h-3.5 text-teal-700" />
                                  Edit / Bank Slip
                                </button>
                                {hasArrears ? (
                                  <button
                                    onClick={() => {
                                      setSelectedFeeReminderLearner(s);
                                      if (soundEnabled) playSound('click');
                                    }}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors shrink-0"
                                    title={`Send fee arrears reminder SMS to ${s.guardianName} (${s.guardianPhone})`}
                                  >
                                    <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
                                    SMS Reminder
                                  </button>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Cleared
                                  </span>
                                )}
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
          );
        })()}

        {/* VIEW 15: OFFICIAL MOE PRINT-READY REPORT CARDS */}
        {activeTab === 'report-card' && (
          <div className="space-y-6">
            <div className="no-print bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700">Select Learner Report:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="text-xs bg-white border border-slate-300 rounded px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {learners.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.grade} - {s.stream}) · {s.admissionNo}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  openPrintPreview({
                    title: `CBC LEARNER ASSESSMENT & COMPETENCY PROGRESS REPORT · ${currentStudent.grade.toUpperCase()}`,
                    subtitle: `Official Kenya Ministry of Education Assessment Return · Academic Year 2026 Term 1`,
                    documentNumber: `REP-${currentStudent.admissionNo.replace(/[^a-zA-Z0-9]/g, '')}`,
                    category: 'Academic Report',
                    orientation: 'portrait',
                    showSignatures: true,
                    showOfficialStamp: true,
                    content: (
                      <div className="space-y-4">
                        {/* Biodata */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded border border-slate-300 text-xs">
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Learner Name:</span>
                            <strong className="text-slate-900">{currentStudent.name}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Admission Number:</span>
                            <strong className="font-mono text-slate-900">{currentStudent.admissionNo}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">NEMIS UPI:</span>
                            <strong className="font-mono text-slate-900">{currentStudent.nemisUpi}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Grade & Stream:</span>
                            <strong className="text-slate-900">{currentStudent.grade} ({currentStudent.stream})</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Gender:</span>
                            <strong className="text-slate-900">{currentStudent.gender}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Date of Birth:</span>
                            <strong className="text-slate-900">{currentStudent.dob}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Attendance:</span>
                            <strong className="text-emerald-700">{currentStudent.attendancePercent}%</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Fee Status:</span>
                            <strong className={currentStudent.fees.balance === 0 ? 'text-emerald-700' : 'text-rose-700'}>
                              {currentStudent.fees.status} (KES {currentStudent.fees.balance.toLocaleString()})
                            </strong>
                          </div>
                        </div>

                        {/* Learning Areas Table */}
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-1.5 pb-1 border-b border-slate-300">
                            1. Core Learning Areas Performance Evaluation (KICD Guidelines)
                          </div>
                          <table className="w-full text-left text-xs border border-slate-300">
                            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[10px] uppercase">
                              <tr>
                                <th className="p-2 border-r border-slate-300">Learning Area</th>
                                <th className="p-2 text-center border-r border-slate-300">Summative Mark</th>
                                <th className="p-2 text-center border-r border-slate-300">Performance Level</th>
                                <th className="p-2">Educator Remarks & Rubric Notes</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {ALL_LEARNING_AREAS.slice(0, 7).map((subj) => {
                                const ass = currentStudent.assessments[subj.id] || {
                                  formative: 'ME',
                                  summativeScore: 78,
                                  level: 'ME',
                                  remarks: 'Demonstrates good competence.',
                                };
                                return (
                                  <tr key={subj.id}>
                                    <td className="p-2 font-medium border-r border-slate-200 text-slate-900">{subj.name}</td>
                                    <td className="p-2 text-center font-mono font-bold border-r border-slate-200 tabular-nums">
                                      {ass.summativeScore}%
                                    </td>
                                    <td className="p-2 text-center font-bold border-r border-slate-200">
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                          ass.level === 'EE'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : ass.level === 'ME'
                                            ? 'bg-sky-100 text-sky-800'
                                            : ass.level === 'AE'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-rose-100 text-rose-800'
                                        }`}
                                      >
                                        {ass.level} ({ass.level === 'EE' ? 'Exceeding' : ass.level === 'ME' ? 'Meeting' : ass.level === 'AE' ? 'Approaching' : 'Below'})
                                      </span>
                                    </td>
                                    <td className="p-2 text-slate-600 text-[11px]">{ass.remarks}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Core Competencies & Values */}
                        <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                            <div className="font-bold text-slate-800 uppercase text-[10px] mb-2">
                              Core CBC Competencies Rating (1-5)
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div>Communication: <strong>{currentStudent.competencies.communication}/5</strong></div>
                              <div>Critical Thinking: <strong>{currentStudent.competencies.criticalThinking}/5</strong></div>
                              <div>Digital Literacy: <strong>{currentStudent.competencies.digitalLiteracy}/5</strong></div>
                              <div>Citizenship: <strong>{currentStudent.competencies.citizenship}/5</strong></div>
                              <div>Creativity: <strong>{currentStudent.competencies.creativity}/5</strong></div>
                              <div>Self-Efficacy: <strong>{currentStudent.competencies.selfEfficacy}/5</strong></div>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between">
                            <div>
                              <div className="font-bold text-slate-800 uppercase text-[10px] mb-1">
                                Values & Character Assessment
                              </div>
                              <p className="text-[11px] text-slate-700 italic">"{currentStudent.valuesNotes}"</p>
                            </div>
                            <div className="text-[10px] font-semibold text-slate-500 pt-2 border-t border-slate-200">
                              Discipline Record: {currentStudent.disciplineIncidents.length === 0 ? 'Exemplary Conduct (0 Incidents)' : `${currentStudent.disciplineIncidents.length} Logged Incidents`}
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  });
                }}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Official MoE Report Card (Preview)
              </button>
            </div>

            {/* Print Container */}
            <div className="print-card bg-white p-8 sm:p-10 rounded-lg border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6">
              <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
                <div className="text-xs uppercase tracking-widest text-slate-600 font-bold">
                  Republic of Kenya · Ministry of Education
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  State Department for Basic Education · Kenya National Examinations Council (KNEC)
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase mt-2">
                  Limuru Model Comprehensive School
                </h1>
                <div className="text-xs text-slate-600">
                  NEMIS Code: <strong>20401823</strong> · Sub-County: Limuru · Kiambu County
                </div>
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider pt-2">
                  CBC Learner Assessment & KPSEA/KJSEA Competency Progress Report
                </div>
                <div className="text-xs text-slate-500">
                  Academic Year: <strong>2026</strong> · Term: <strong>Term 1</strong>
                </div>
              </div>

              {/* Biodata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Learner Full Name:</span>
                  <strong className="text-slate-900 text-sm">{currentStudent.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Admission Number:</span>
                  <strong className="font-mono text-slate-900">{currentStudent.admissionNo}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">NEMIS UPI:</span>
                  <strong className="font-mono text-slate-900">{currentStudent.nemisUpi}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Grade & Stream:</span>
                  <strong className="text-slate-900">{currentStudent.grade} ({currentStudent.stream})</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Gender:</span>
                  <strong className="text-slate-900">{currentStudent.gender}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Date of Birth:</span>
                  <strong className="text-slate-900">{currentStudent.dob}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Term Attendance:</span>
                  <strong className="text-emerald-700 font-bold">{currentStudent.attendancePercent}%</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Fee Account Balance:</span>
                  <strong className={`font-semibold ${currentStudent.fees.balance === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    KES {currentStudent.fees.balance.toLocaleString()} ({currentStudent.fees.status})
                  </strong>
                </div>
              </div>

              {/* Subjects Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-300 pb-1">
                  1. Core Learning Areas Performance Evaluation (KICD Guidelines)
                </h3>
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">Learning Area</th>
                      <th className="p-2 text-center border-r border-slate-300">Summative Mark</th>
                      <th className="p-2 text-center border-r border-slate-300">Performance Level</th>
                      <th className="p-2">Educator Remarks & Rubric Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {ALL_LEARNING_AREAS.slice(0, 7).map((subj) => {
                      const ass = currentStudent.assessments[subj.id] || {
                        formative: 'ME',
                        summativeScore: 78,
                        level: 'ME',
                        remarks: 'Demonstrates good competence.',
                      };
                      return (
                        <tr key={subj.id}>
                          <td className="p-2 font-medium border-r border-slate-300">{subj.name}</td>
                          <td className="p-2 text-center font-mono font-bold border-r border-slate-300 tabular-nums">
                            {ass.summativeScore}%
                          </td>
                          <td className="p-2 text-center font-bold border-r border-slate-300">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] ${
                                ass.level === 'EE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ass.level === 'ME'
                                  ? 'bg-sky-100 text-sky-800'
                                  : ass.level === 'AE'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {ass.level} ({ass.level === 'EE' ? 'Exceeding' : ass.level === 'ME' ? 'Meeting' : ass.level === 'AE' ? 'Approaching' : 'Below'})
                            </span>
                          </td>
                          <td className="p-2 text-slate-700 text-[11px]">{ass.remarks}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-xs">
                <div>
                  <div className="h-8 border-b border-dashed border-slate-400"></div>
                  <span className="block mt-1 font-bold text-slate-800">Class Teacher</span>
                </div>
                <div className="text-right">
                  <div className="h-8 border-b border-dashed border-slate-400 flex items-end justify-end">
                    <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-widest border border-emerald-700 px-2 py-0.5 rounded mr-2">
                      Official School Stamp
                    </span>
                  </div>
                  <span className="block mt-1 font-bold text-slate-800">Headteacher & Accounting Officer</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 16: TEACHER TPAD 2.0 CONNECTED TO CLASS STUDENT PERFORMANCE */}
        {activeTab === 'tpad' && (
          <TeacherTpadModule
            currentUser={currentUser}
            teachers={teachers}
            learners={learners}
            onLogAudit={handleLogAudit}
          />
        )}

        {/* VIEW 17: TEACHER & PEDAGOGICAL STAFF DIRECTORY */}
        {activeTab === 'teachers' && (
          <TeacherManagementModule
            currentUser={currentUser}
            teachers={teachers}
            onAddTeacher={handleAddTeacher}
            onLogAudit={handleLogAudit}
          />
        )}

        {/* VIEW 18: KEMIS / NEMIS API SYNCHRONIZER & TRANSFERS */}
        {activeTab === 'kemis' && (
          <KemisNemisSyncEngine
            currentUser={currentUser}
            learners={learners}
            transfers={kemisTransfers}
            onUpdateLearnerKemisStatus={handleUpdateLearnerKemisStatus}
            onAddTransfer={handleAddTransfer}
            onLogAudit={handleLogAudit}
          />
        )}

        {/* VIEW 19: FUEL & FLEET LOGISTICS */}
        {activeTab === 'fleet' && (
          <FuelAndFleetLogistics
            currentUser={currentUser}
            vehicles={fleetVehicles}
            routes={busRoutes}
            fuelLogs={fuelLogs}
            maintenanceRecords={maintenanceRecords}
            transportBookings={transportBookings}
            onAddFuelLog={handleAddFuelLog}
            onAddMaintenance={handleAddMaintenance}
            onLogAudit={handleLogAudit}
          />
        )}

        {/* VIEW 20: DATA ENCRYPTION, PII ANONYMIZATION & SECURITY AUDIT */}
        {activeTab === 'audit-logs' && (
          <DataPrivacyAndAuditModule
            currentUser={currentUser}
            learners={learners}
            auditLogs={auditLogs}
            isPiiDecrypted={isPiiDecrypted}
            onTogglePiiDecrypt={handleTogglePiiDecrypt}
            onAddAuditLog={(log) =>
              handleLogAudit(
                log.action,
                log.targetResource,
                log.details,
                log.sensitivityLevel
              )
            }
          />
        )}

        {/* VIEW 21: MINISTRY OF EDUCATION COUNTY OVERSIGHT & STATUTORY APPROVALS */}
        {activeTab === 'moe-oversight' && (
          <MinistryOfEducationOversightModule
            currentUser={currentUser}
            schools={moeSchools}
            disbursements={moeDisbursements}
            transfers={moeTransfers}
            majorApprovals={moeMajorApprovals}
            limuruLearners={learners}
            onApproveTransfer={handleApproveMoeTransfer}
            onRejectTransfer={handleRejectMoeTransfer}
            onApproveDisbursement={handleApproveMoeDisbursement}
            onApproveMajorRequest={handleApproveMoeMajorRequest}
            onLogAudit={handleLogAudit}
          />
        )}

        {/* VIEW 22: SCHOOL-SIDE MOE STATUTORY RETURNS & AUDIT UPLOADS */}
        {activeTab === 'school-moe-returns' && (
          <SchoolMoeComplianceReturnsModule
            currentUser={currentUser}
            statutoryReports={INITIAL_MOE_STATUTORY_REPORTS}
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
            onUpdateStatutoryReport={(up) => {
              handleLogAudit('MOE_COMPLIANCE_EDIT', `Report ${up.officialRefNumber}`, `Updated ${up.reportName}`);
            }}
            onUpdateSuffixAudit={(up) => {
              handleLogAudit('MOE_COMPLIANCE_EDIT', `Suffix ${up.suffixCode}`, `Updated suffix audit`);
            }}
            onUpdateKnecMapping={(up) => {
              handleLogAudit('MOE_COMPLIANCE_EDIT', `KNEC ${up.nemisUpi}`, `Updated KNEC mapping`);
            }}
            onUpdateTeacherWorkload={(up) => {
              handleLogAudit('MOE_COMPLIANCE_EDIT', `Teacher ${up.tscNumber}`, `Updated workload`);
            }}
            onUpdateStemLab={(up) => {
              handleLogAudit('MOE_COMPLIANCE_EDIT', `STEM Lab ${up.centerCode}`, `Updated lab audit`);
            }}
            onUpdateSanitation={(up) => {
              handleLogAudit('MOE_COMPLIANCE_EDIT', `Sanitation ${up.centerCode}`, `Updated sanitation`);
            }}
            onUpdateCapitationReconciliation={(up) => {
              handleLogAudit('MOE_COMPLIANCE_EDIT', `Capitation ${up.centerCode}`, `Updated capitation`);
            }}
            onUpdateUniformReturn={(up) => {
              handleLogAudit('MOE_COMPLIANCE_EDIT', `Uniform ${up.centerCode}`, `Updated uniform disclosure`);
            }}
            onUpdateSneReturn={(up) => {
              handleLogAudit('MOE_COMPLIANCE_EDIT', `SNE ${up.nemisUpi}`, `Updated SNE`);
            }}
            onUpdateSafetyReturn={(up) => {
              handleLogAudit('MOE_COMPLIANCE_EDIT', `Safety ${up.centerCode}`, `Updated safety cert`);
            }}
            onUpdateTransitionReturn={(up) => {
              handleLogAudit('MOE_COMPLIANCE_EDIT', `Transition ${up.nemisUpi}`, `Updated transition status`);
            }}
            onLogAudit={handleLogAudit}
          />
        )}

        {/* VIEW 23: USER MANAGEMENT MODULE (HEAD TEACHER ONLY) */}
        {activeTab === 'user-management' && (
          <UserManagementModule />
        )}
            </div>
          </div>
        )}
      </main>

  {/* =========================================================================
      GLOBAL MODALS (ADMISSION, BULK MARKSHEET, EXCEL FEE BATCH, RBAC MATRIX, AUTH)
      ========================================================================= */}
  {isAdmissionModalOpen && (
    <LearnerAdmissionModal
      onAddLearner={handleAddLearner}
      onAddBulkLearners={handleAddBulkLearners}
      onClose={() => setIsAdmissionModalOpen(false)}
      existingCount={learners.length}
      existingLearners={learners}
    />
  )}

  {isBulkMarksheetOpen && (
    <BulkCBCMarksheetManager
      students={learners}
      onApplyMarks={handleApplyMarks}
      onClose={() => setIsBulkMarksheetOpen(false)}
    />
  )}

  {isExcelFeeModalOpen && (
    <ExcelFeeBatchManager
      students={learners.map((s) => ({
        id: s.id,
        name: s.name,
        nemisUpi: s.nemisUpi,
        grade: s.grade,
        stream: s.stream,
        fees: s.fees,
      }))}
      onApplyBatchPayments={handleApplyBatchFeePayments}
      onClose={() => setIsExcelFeeModalOpen(false)}
    />
  )}

  {/* Role-Based Access Control Permissions Matrix & Security Audit Modal */}
  {isPermissionModalOpen && (
    <RolePermissionModal
      isOpen={isPermissionModalOpen}
      onClose={() => setIsPermissionModalOpen(false)}
      currentUser={currentUser}
      onSelectUser={handleSelectUser}
    />
  )}

  {/* Authentication Sign In / Sign Up Modal */}
  {isAuthModalOpen && (
    <AuthModal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      onLoginSuccess={handleLoginSuccess}
      currentRole={currentUser.role}
    />
  )}

  {/* Class & Stream Nomenclature / Rename Manager Modal */}
  {isClassRenameModalOpen && (
    <ClassRenameModal
      isOpen={isClassRenameModalOpen}
      onClose={() => setIsClassRenameModalOpen(false)}
      learners={learners}
      teachers={teachers}
      onRenameStream={handleRenameStream}
      onAddNewStream={handleAddNewStream}
      onLogAudit={handleLogAudit}
    />
  )}

  {/* Send Fee Arrears SMS Reminder Modal */}
  {selectedFeeReminderLearner && (
    <FeeReminderSmsModal
      isOpen={!!selectedFeeReminderLearner}
      onClose={() => setSelectedFeeReminderLearner(null)}
      learner={selectedFeeReminderLearner}
      onSendInstantReminder={(b) => setSmsBroadcasts((prev) => [b, ...prev])}
      onOpenInBulkGateway={(draft) => {
        setSmsInitialDraft(draft);
        setActiveTab('sms');
        if (soundEnabled) playSound('click');
      }}
      onLogAudit={handleLogAudit}
    />
  )}

  {/* Bank Fee Payment Edit & Slip Upload Modal */}
  {editingFeeLearner && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Bank Fee Payment Adjustment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {editingFeeLearner.name} · Adm: {editingFeeLearner.admissionNo} · {editingFeeLearner.grade}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditingFeeLearner(null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveFeeEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
            <div>
              <span className="text-slate-500 block">Total Term Fee:</span>
              <strong className="text-slate-900 dark:text-white font-mono text-sm">
                KES {editingFeeLearner.fees.totalTermFee.toLocaleString()}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Bursary Applied:</span>
              <strong className="text-sky-700 dark:text-sky-400 font-mono text-sm">
                KES {editingFeeLearner.fees.bursaryApplied.toLocaleString()}
              </strong>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Adjust Total Paid Amount (KES)
            </label>
            <input
              type="number"
              min="0"
              max={editingFeeLearner.fees.totalTermFee}
              value={editFeePaidAmount}
              onChange={(e) => setEditFeePaidAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Calculated Balance:{' '}
              <strong className="font-mono text-rose-600">
                KES {Math.max(0, editingFeeLearner.fees.totalTermFee - Number(editFeePaidAmount)).toLocaleString()}
              </strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Channel
              </label>
              <select
                value={editFeePaymentMethod}
                onChange={(e) => setEditFeePaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Bank Deposit Slip">Bank Deposit Slip (KCB/Equity/Co-op)</option>
                <option value="Bank EFT / RTGS">Bank EFT / RTGS Transfer</option>
                <option value="Bankers Cheque">Bankers Cheque</option>
                <option value="M-Pesa Direct Till">M-Pesa Direct Till / Paybill</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bank Reference / Slip No.
              </label>
              <input
                type="text"
                placeholder="e.g. KCB-DEP-84920"
                value={editFeeBankRef}
                onChange={(e) => setEditFeeBankRef(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Upload Deposit Slip / Bank Receipt */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <FileUploadZone
              linkedRecordId={editingFeeLearner.id}
              category="fee_receipt"
              label="Attach Bank Deposit Slip / Bank Receipt"
              helperText="Upload verified payment proof (PNG, JPG, PDF up to 5MB). Persisted securely."
              expectedType="image_or_pdf"
              onUploadSuccess={() => {
                handleLogAudit(
                  'FEE_LEDGER_EXPORT' as any,
                  `Bank Slip: ${editingFeeLearner.name}`,
                  `Attached verified bank slip for ${editingFeeLearner.admissionNo}`,
                  'Restricted'
                );
              }}
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setEditingFeeLearner(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-sm"
            >
              Save Fee Record & Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

      {/* Universal Print Preview Modal for All Reports */}
      <PrintPreviewModal />

      {/* Sign Out Confirmation Modal */}
      {isSignOutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-4">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sign Out Confirmation</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              Are you sure you want to end your authenticated session as <strong className="text-slate-900 dark:text-white">{authUser?.fullName}</strong>?
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setIsSignOutConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsSignOutConfirmOpen(false);
                  await logout();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiet Institutional Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Limuru Model Comprehensive School Portal · Integrated with MoE NEMIS, KEMIS & Safaricom Daraja 2.0
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>P.O. Box 240-00217, Limuru</span>
            <span aria-hidden="true">·</span>
            <span>Academic Year 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PrintPreviewProvider>
        <SchoolApp />
      </PrintPreviewProvider>
    </AuthProvider>
  );
}

