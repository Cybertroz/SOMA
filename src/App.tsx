/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
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
} from 'lucide-react';

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
import {
  KIAMBU_COUNTY_SCHOOLS,
  INITIAL_MOE_DISBURSEMENTS,
  INITIAL_MOE_TRANSFERS,
  INITIAL_MOE_MAJOR_APPROVALS,
} from './data/mockMoeData';

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

export default function App() {
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
    | 'audit-logs';

  // Authenticated Persona state with localStorage persistence
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    const saved = localStorage.getItem('limuru_model_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return SYSTEM_USERS[0]; // Dr. Anthony K. Macharia (Chief Principal)
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (currentUser.role === 'moe_director') return 'moe-oversight';
    return currentUser.role === 'parent' ? 'parent-portal' : 'dashboard';
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPiiDecrypted, setIsPiiDecrypted] = useState(false);

  const handleSelectUser = (user: AuthUser) => {
    setCurrentUser(user);
    localStorage.setItem('limuru_model_current_user', JSON.stringify(user));
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

  // Filtered Learners for Admissions Table
  const filteredAdmissionsLearners = learners.filter((s) => {
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
  const filteredCbcStudents = learners.filter((s) => {
    if (cbcGradeFilter !== 'All' && s.grade !== cbcGradeFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* =========================================================================
          TOP INSTITUTIONAL HEADER & BRANDING
          ========================================================================= */}
      <header className="no-print sticky top-0 z-40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border-b border-emerald-800 shadow-md text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            {/* Wordmark Brand */}
            {currentUser.role === 'moe_director' ? (
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center font-bold shadow-xs">
                  <span className="text-xl">🇰🇪</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black tracking-tight text-white uppercase whitespace-nowrap">
                      Ministry of Education
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-400 text-slate-950 font-mono">
                      State Oversight
                    </span>
                  </div>
                  <span className="text-xs text-amber-200/90 whitespace-nowrap">
                    Republic of Kenya · State Department for Basic Education · Kiambu County Directorate
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold shadow-xs">
                  <School className="w-6 h-6 text-emerald-300" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
                    Limuru Model Comprehensive School
                  </span>
                  <span className="text-xs text-emerald-200/90 whitespace-nowrap">
                    MoE Center: 20401823 · Kiambu County · Grade 1 to 9 CBC & NEMIS Integrated
                  </span>
                </div>
              </div>
            )}

            {/* Quick Action Buttons & Role Switcher */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Audio Chime Enabled' : 'Audio Muted'}
                className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800/60 rounded-md transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </button>

              {/* Show MoE quick button for Principal or other roles that have access */}
              {currentUser.role !== 'moe_director' && isTabAccessible(currentUser.role, 'moe-oversight') && (
                <button
                  onClick={() => {
                    setActiveTab('moe-oversight');
                    if (soundEnabled) playSound('click');
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md shadow-xs transition-colors flex items-center gap-1.5 border ${
                    activeTab === 'moe-oversight'
                      ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300/40'
                      : 'bg-amber-950/80 text-amber-200 border-amber-500/50 hover:bg-amber-900'
                  }`}
                  title="Ministry of Education Kiambu County Oversight & Statutory Approvals"
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>MoE County Portal</span>
                </button>
              )}

              {/* School Specific Actions - ONLY for non-MoE roles */}
              {currentUser.role !== 'moe_director' && (
                <>
                  {/* Rename Classes & Streams Option */}
                  <button
                    onClick={() => {
                      setIsClassRenameModalOpen(true);
                      if (soundEnabled) playSound('click');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-200 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
                    title="Configure and rename school classes and streams"
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-300" />
                    Rename Classes
                  </button>

                  {/* Admit Learner - only for roles with manage_admissions (Principal) */}
                  {hasPermission(currentUser.role, 'manage_admissions') && (
                    <button
                      onClick={() => {
                        setIsAdmissionModalOpen(true);
                        if (soundEnabled) playSound('click');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/50 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Admit Learner
                    </button>
                  )}

                  {/* Upload Marksheet - for Principal, Teacher, Class Master */}
                  {hasPermission(currentUser.role, 'manage_cbc_marks') && (
                    <button
                      onClick={() => {
                        setIsBulkMarksheetOpen(true);
                        if (soundEnabled) playSound('click');
                      }}
                      className="hidden sm:flex px-3 py-1.5 text-xs font-semibold text-sky-100 bg-sky-900/70 hover:bg-sky-800 border border-sky-600/50 rounded-md shadow-xs transition-colors items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      Upload Marksheet
                    </button>
                  )}

                  {/* Add Fees via Excel - only for Bursar and Principal */}
                  {hasPermission(currentUser.role, 'manage_fees') && (
                    <button
                      onClick={() => {
                        setIsExcelFeeModalOpen(true);
                        if (soundEnabled) playSound('click');
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 border border-teal-400/50 rounded-md shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Add Fees via Excel
                    </button>
                  )}
                </>
              )}

              {/* RBAC Persona Switcher Dropdown */}
              <RoleSwitcher
                currentUser={currentUser}
                onSelectUser={handleSelectUser}
                onOpenPermissionMatrix={() => setIsPermissionModalOpen(true)}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
              />
            </div>
          </div>
        </div>

        {/* Global Primary Navigation Bar (Role-Filtered) */}
        <div className="border-t border-emerald-800/60 bg-emerald-950/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8 overflow-x-auto flex items-center justify-between gap-1 py-1.5">
          <div className="flex items-center gap-1">
            {[
              { id: 'dashboard', label: 'Overview', icon: School },
              { id: 'moe-oversight', label: '🇰🇪 MoE County Oversight', icon: Building2 },
              { id: 'parent-portal', label: 'Parent Portal', icon: Sparkles },
              { id: 'teachers', label: 'Teachers & Faculty', icon: UserCheck },
              { id: 'kemis', label: 'KEMIS / NEMIS Sync', icon: Building2 },
              { id: 'fleet', label: 'Fleet & Fuel Logistics', icon: Truck },
              { id: 'admissions', label: 'Admissions (G1-9)', icon: Users },
              { id: 'cbc', label: 'CBC Tracking', icon: Award },
              { id: 'daraja', label: 'M-Pesa Daraja Sync', icon: Smartphone },
              { id: 'voteheads', label: 'Voteheads & Bursaries', icon: Layers },
              { id: 'sms', label: 'Bulk SMS Gateway', icon: Radio },
              { id: 'payroll', label: 'Payroll & KRA/SHA', icon: DollarSign },
              { id: 'timetable', label: 'Timetabling', icon: Calendar },
              { id: 'analytics', label: 'KNEC Analytics', icon: Award },
              { id: 'portfolios', label: 'Health & Portfolios', icon: HeartPulse },
              { id: 'assets', label: 'Assets & Facilities', icon: Package },
              { id: 'kitchen-inventory', label: 'Kitchen Stores', icon: Warehouse },
              { id: 'textbooks-stationery', label: 'Books & Stationery', icon: BookOpen },
              { id: 'fees', label: 'Fee Ledger', icon: CreditCard },
              { id: 'report-card', label: 'Report Cards', icon: Printer },
              { id: 'tpad', label: 'Teacher TPAD', icon: ShieldCheck },
              { id: 'audit-logs', label: 'Security & Audit Logs', icon: Lock },
            ]
              .filter((item) => isTabAccessible(currentUser.role, item.id))
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as ActiveTab);
                      if (soundEnabled) playSound('click');
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                        : 'text-emerald-100/80 hover:text-white hover:bg-emerald-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                );
              })}
          </div>

          {/* Quick RBAC Audit trigger in nav */}
          <button
            onClick={() => setIsPermissionModalOpen(true)}
            className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-800 px-2.5 py-1 rounded hover:bg-white border border-transparent hover:border-slate-200 shrink-0 font-medium transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>RBAC Matrix</span>
          </button>
        </div>
      </header>

      {/* Term Kicker Info Strip */}
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
              <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                <span>County Approved Schools: <strong className="text-white tabular-nums">{moeSchools.length} Institutions</strong></span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>NEMIS Headcount: <strong className="text-emerald-400 tabular-nums">100% Validated</strong></span>
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
              <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                <span>Enrolled: <strong className="text-white tabular-nums">{learners.length} Learners</strong></span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Fee Efficiency: <strong className="text-emerald-400 tabular-nums">{summaryMetrics.feeCollectionRate}%</strong></span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Bursaries: <strong className="text-emerald-400 tabular-nums">KES {summaryMetrics.totalBursaries.toLocaleString()}</strong></span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* =========================================================================
          MAIN APPLICATION VIEWPORT
          ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* RBAC UNAUTHORIZED SHIELD */}
        {!isTabAccessible(currentUser.role, activeTab) ? (
          <UnauthorizedAccessGuard
            currentUser={currentUser}
            attemptedModule={activeTab}
            onGoBack={() => setActiveTab(currentUser.role === 'parent' ? 'parent-portal' : 'dashboard')}
            onSelectUser={handleSelectUser}
          />
        ) : (
          <>
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
              <div className="space-y-6">
                {/* Persona Operational Guidance Bar */}
                {currentUser.role !== 'principal' && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>Operating as {currentUser.title}</span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {currentUser.role.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          {ROLE_CONFIGS[currentUser.role].shortDescription}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsPermissionModalOpen(true)}
                      className="px-3 py-1.5 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold transition-colors"
                    >
                      Audit RBAC Privileges
                    </button>
                  </div>
                )}
            {/* Top 4 KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2 text-xs font-medium">
                  <span>Grade 1 to 9 Enrollment</span>
                  <Users className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-2xl font-bold text-slate-900 tabular-nums">
                  {summaryMetrics.totalStudents} Learners
                </div>
                <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                  <span className="text-emerald-700 font-semibold">Lower & Upper Pri + JSS</span>
                  <span className="text-slate-400">100% NEMIS UPI</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2 text-xs font-medium">
                  <span>Term 1 Fee Collections</span>
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-2xl font-bold text-slate-900 tabular-nums">
                  KES {summaryMetrics.totalFeesPaid.toLocaleString()}
                </div>
                <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                  <span>Rate: <strong className="text-emerald-700 tabular-nums">{summaryMetrics.feeCollectionRate}%</strong></span>
                  <span className="text-rose-600 tabular-nums">Bal: KES {summaryMetrics.totalFeesBalance.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2 text-xs font-medium">
                  <span>NG-CDF & Capitation Grants</span>
                  <Layers className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-2xl font-bold text-slate-900 tabular-nums">
                  KES {summaryMetrics.totalBursaries.toLocaleString()}
                </div>
                <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                  <span className="text-emerald-700 font-semibold">Limuru CDF Active</span>
                  <span className="text-slate-500">· {bursaries.length} Grants</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2 text-xs font-medium">
                  <span>CBC Curriculum Mastery</span>
                  <Award className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-2xl font-bold text-slate-900 tabular-nums">
                  {summaryMetrics.cbcMasteryIndex}% Proficient
                </div>
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="text-emerald-700 font-semibold tabular-nums">{summaryMetrics.eeCount} EE</span>
                  <span>·</span>
                  <span className="text-sky-700 font-semibold tabular-nums">{summaryMetrics.meCount} ME</span>
                  <span>·</span>
                  <span className="text-amber-700 font-semibold tabular-nums">{summaryMetrics.aeCount} AE</span>
                </div>
              </div>
            </div>

            {/* Quick Action Hero Banner */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl p-6 shadow-md border border-emerald-800/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-900/90 text-emerald-300 border border-emerald-700/60 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Ministry of Education CBC Academic & Financial Command Center
                  </span>
                  <span className="text-slate-400 text-xs">·</span>
                  <span className="text-xs font-semibold text-emerald-200">
                    Term 1 Week 7 · Kiambu Sub-County
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Limuru Model Comprehensive School — Operations & Academic Governance
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Real-time administration connecting continuous CBC student competency assessments directly to teacher TPAD 2.0 appraisals, automated Safaricom Paybill 522123 fee reconciliation, and live MoE KEMIS capitation auditing.
                </p>

                {/* Live System Operational Chips */}
                <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700">
                    Safaricom Daraja: <strong className="text-emerald-400">Paybill 522123 Live</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700">
                    KEMIS Handshake: <strong className="text-emerald-400">Civil Registry Active</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700">
                    Teacher TPAD 2.0: <strong className="text-emerald-400">Class Performance Linked</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={() => setIsClassRenameModalOpen(true)}
                  className="px-4 py-2 bg-amber-600/90 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-2 transition-colors border border-amber-400/40"
                >
                  <Layers className="w-4 h-4" />
                  Rename Classes & Streams
                </button>
                <button
                  onClick={() => setActiveTab('admissions')}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Grade 1-9 Registry
                </button>
                <button
                  onClick={() => setActiveTab('tpad')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  TPAD Appraisals
                </button>
              </div>
            </div>

            {/* Dashboard 2-Column Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Enrolled Cohort Snapshot */}
              <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Enrolled Learners (Grade 1 - 9)</h3>
                    <p className="text-xs text-slate-500">NEMIS Unique Personal Identifiers & Fee Statuses</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('admissions')}
                    className="text-xs text-emerald-700 font-semibold hover:underline"
                  >
                    View All {learners.length} Learners →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-3">Admission No</th>
                        <th className="p-3">Learner Name</th>
                        <th className="p-3">Grade & Stream</th>
                        <th className="p-3">NEMIS UPI</th>
                        <th className="p-3 text-right">Fee Balance</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {learners.slice(0, 6).map((std) => (
                        <tr key={std.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-medium text-slate-600">{std.admissionNo}</td>
                          <td className="p-3 font-semibold text-slate-900">{std.name}</td>
                          <td className="p-3 text-slate-700">{std.grade} ({std.stream})</td>
                          <td className="p-3 font-mono text-slate-500">{std.nemisUpi}</td>
                          <td className="p-3 text-right font-mono font-bold tabular-nums">
                            {std.fees.balance === 0 ? (
                              <span className="text-emerald-700">Cleared</span>
                            ) : (
                              <span className="text-rose-600">KES {std.fees.balance.toLocaleString()}</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                std.fees.status === 'Cleared'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : std.fees.status === 'Partial'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {std.fees.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Col: M-Pesa & SMS Quick Feed */}
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-700" />
                      <h4 className="text-sm font-semibold text-slate-900">Recent M-Pesa Push</h4>
                    </div>
                    <button
                      onClick={() => setActiveTab('daraja')}
                      className="text-xs text-emerald-700 font-semibold hover:underline"
                    >
                      Daraja Sync →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {darajaPayments.slice(0, 3).map((p, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-100 text-xs flex justify-between items-center">
                        <div>
                          <strong className="text-slate-800 block">{p.matchedLearnerName}</strong>
                          <span className="text-[11px] text-slate-500 font-mono">{p.transId} · {p.billRefNumber}</span>
                        </div>
                        <div className="text-right">
                          <strong className="text-emerald-700 font-bold tabular-nums block">
                            KES {p.transAmount.toLocaleString()}
                          </strong>
                          <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                            Auto-Credited
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-emerald-700" />
                      <h4 className="text-sm font-semibold text-slate-900">Latest SMS Broadcast</h4>
                    </div>
                    <button
                      onClick={() => setActiveTab('sms')}
                      className="text-xs text-emerald-700 font-semibold hover:underline"
                    >
                      Open Gateway →
                    </button>
                  </div>
                  {smsBroadcasts[0] && (
                    <div className="text-xs space-y-1">
                      <span className="font-bold text-slate-800">{smsBroadcasts[0].type}</span>
                      <p className="text-slate-600 line-clamp-3 text-[11px] leading-relaxed">
                        &quot;{smsBroadcasts[0].message}&quot;
                      </p>
                      <div className="text-[10px] text-slate-400 pt-1 flex justify-between">
                        <span>{smsBroadcasts[0].recipientsCount} Guardians</span>
                        <span className="text-emerald-700 font-bold">{smsBroadcasts[0].deliveryRate}% Delivered</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
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
                          {std.name}
                          <span className="block text-[11px] text-slate-500 font-normal">{std.gender} · DOB: {std.dob}</span>
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
                        <th className="p-3 text-right">SMS Reminder Action</th>
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
                              {hasArrears ? (
                                <button
                                  onClick={() => {
                                    setSelectedFeeReminderLearner(s);
                                    if (soundEnabled) playSound('click');
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors shrink-0"
                                  title={`Send fee arrears reminder SMS to ${s.guardianName} (${s.guardianPhone})`}
                                >
                                  <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
                                  Send SMS Reminder
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Cleared
                                </span>
                              )}
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
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Official MoE Report Card
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
      </>
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
