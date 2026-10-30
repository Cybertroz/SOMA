/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Building,
  School,
  DollarSign,
  Award,
  Layers,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Check,
  X,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import {
  AuthUser,
  SchoolBranch,
  PayrollEmployee,
  UserRole,
  GradeLevel,
} from '../types/school';
import { AppUserRole, UserProfile } from '../types/auth';
import { ROLE_CONFIGS, SYSTEM_USERS } from '../data/mockUsers';
import { exportToExcel } from '../utils/excelExport';
import { db, isConfiguredWithRealFirebase, getSecondaryAuthInstance } from '../lib/firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

interface Props {
  currentUser: AuthUser;
  payrollEmployees: PayrollEmployee[];
  onAddPayrollEmployee: (emp: PayrollEmployee) => void;
  onUpdatePayrollEmployee?: (emp: PayrollEmployee) => void;
  onLogAudit?: (action: any, resource: string, details: string, sensitivity?: any) => void;
}

// Initial registered school branches
export const INITIAL_BRANCHES: SchoolBranch[] = [
  {
    id: 'br-01',
    branchName: 'Limuru Model Comprehensive School (Main Campus)',
    branchCode: '20401823-MAIN',
    parentSchoolId: 'sch-limuru-01',
    parentSchoolName: 'Limuru Model Comprehensive School',
    location: {
      county: 'Kiambu',
      subCounty: 'Limuru',
      ward: 'Limuru Central',
      address: 'Along Nakuru-Nairobi Highway, P.O. Box 240-00217 Limuru',
    },
    contact: {
      phone: '+254 722 100 200',
      email: 'main@limurumodel.sc.ke',
      postalAddress: 'P.O. Box 240-00217, Limuru',
    },
    headOfBranch: {
      name: 'Dr. Anthony K. Macharia',
      tscNo: 'TSC-294018',
      phone: '+254 722 401 928',
      email: 'principal@limurumodel.sc.ke',
    },
    capacity: 1200,
    currentEnrollment: 842,
    establishedYear: 1988,
    status: 'Active',
  },
  {
    id: 'br-02',
    branchName: 'Limuru Model Junior Secondary (Rironi Campus)',
    branchCode: '20401823-RIR',
    parentSchoolId: 'sch-limuru-01',
    parentSchoolName: 'Limuru Model Comprehensive School',
    location: {
      county: 'Kiambu',
      subCounty: 'Limuru',
      ward: 'Rironi',
      address: 'Rironi Trading Centre, off A104 Highway',
    },
    contact: {
      phone: '+254 723 300 400',
      email: 'rironi@limurumodel.sc.ke',
      postalAddress: 'P.O. Box 240-00217, Limuru',
    },
    headOfBranch: {
      name: 'Mdm. Grace Nduta Kimani',
      tscNo: 'TSC-382910',
      phone: '+254 723 300 400',
      email: 'deputy@limurumodel.sc.ke',
    },
    capacity: 450,
    currentEnrollment: 310,
    establishedYear: 2024,
    status: 'Active',
  },
  {
    id: 'br-03',
    branchName: 'Limuru Model Primary Annex (Kamandura Branch)',
    branchCode: '20401823-KAM',
    parentSchoolId: 'sch-limuru-01',
    parentSchoolName: 'Limuru Model Comprehensive School',
    location: {
      county: 'Kiambu',
      subCounty: 'Limuru',
      ward: 'Ndeiya',
      address: 'Kamandura Junction, Mai Mahiu Road',
    },
    contact: {
      phone: '+254 724 555 666',
      email: 'kamandura@limurumodel.sc.ke',
      postalAddress: 'P.O. Box 240-00217, Limuru',
    },
    headOfBranch: {
      name: 'Mr. James Karanja',
      tscNo: 'TSC-410294',
      phone: '+254 724 555 666',
      email: 'jkaranja@limurumodel.sc.ke',
    },
    capacity: 350,
    currentEnrollment: 240,
    establishedYear: 2025,
    status: 'Active',
  },
];

// Initial institutional role permissions config with granular CRUD & Approve
export interface GranularRolePermission {
  role: string;
  level: 'MOE' | 'County' | 'School' | 'Branch';
  description: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  accessibleSections: string[];
}

export const INITIAL_ROLE_MATRIX: Record<string, GranularRolePermission> = {
  admin: {
    role: 'System Administrator',
    level: 'School',
    description: 'Full administrative access across institution and branches.',
    canView: true,
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    accessibleSections: ['All Sections', 'Branch Control', 'Security Matrix', 'Payroll'],
  },
  headteacher: {
    role: 'Chief Principal / Head Teacher',
    level: 'School',
    description: 'Executive authority, accounting officer, final approvals & KEMIS reporting.',
    canView: true,
    canAdd: true,
    canEdit: true,
    canDelete: false,
    canApprove: true,
    accessibleSections: ['All Operations', 'Finances', 'Staff Appraisals', 'KEMIS Sync'],
  },
  teacher: {
    role: 'Subject & Class Teacher',
    level: 'Branch',
    description: 'Class attendance, CBC formative assessments, portfolios, timetable & lesson plans.',
    canView: true,
    canAdd: true,
    canEdit: true,
    canDelete: false,
    canApprove: false,
    accessibleSections: ['CBC Marksheets', 'Learner Registry', 'Portfolios', 'Timetable'],
  },
  accountant: {
    role: 'Bursar / Accountant',
    level: 'Branch',
    description: 'Fee collection, M-Pesa Daraja reconciliation, voteheads, payroll disbursement.',
    canView: true,
    canAdd: true,
    canEdit: true,
    canDelete: false,
    canApprove: false,
    accessibleSections: ['Fee Ledger', 'M-Pesa Daraja', 'Voteheads', 'Payroll & Statutory'],
  },
  nurse: {
    role: 'School Registered Nurse',
    level: 'Branch',
    description: 'Dispensary clinical triage, sickness logs, hospital referrals & vaccine cards.',
    canView: true,
    canAdd: true,
    canEdit: true,
    canDelete: false,
    canApprove: false,
    accessibleSections: ['Health & Clinical', 'Sickness Records', 'Hospital Referrals'],
  },
};

export const SchoolAdministrationModule: React.FC<Props> = ({
  currentUser,
  payrollEmployees,
  onAddPayrollEmployee,
  onLogAudit,
}) => {
  const [adminTab, setAdminTab] = useState<'add-schools' | 'add-users' | 'user-levels-roles'>('add-schools');

  // School Branches State (persisted)
  const [branches, setBranches] = useState<SchoolBranch[]>(() => {
    const saved = localStorage.getItem('limuru_school_branches');
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });

  // Role Permissions Matrix State (persisted)
  const [roleMatrix, setRoleMatrix] = useState<Record<string, GranularRolePermission>>(() => {
    const saved = localStorage.getItem('limuru_role_matrix');
    return saved ? JSON.parse(saved) : INITIAL_ROLE_MATRIX;
  });

  // Users List State
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');

  // Add Branch Modal State
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState(false);
  const [branchForm, setBranchForm] = useState({
    branchName: '',
    branchCode: '',
    ward: 'Limuru Central',
    address: '',
    phone: '+254 7',
    email: '',
    headName: '',
    headTsc: '',
    headPhone: '+254 7',
    capacity: 400,
  });

  // Add User Modal State (Linked to School/Branch, Payroll, TPAD)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    password: 'Password@2026',
    role: 'teacher' as AppUserRole,
    phone: '+254 7',
    department: 'Instructional Faculty',
    branchId: 'br-01',
    // Payroll integration fields
    monthlySalaryKes: 55000,
    designation: 'JSS Subject Teacher',
    bankName: 'Kenya Commercial Bank (KCB)',
    bankAccountNo: '',
    employmentStatus: 'Permanent & Pensionable' as PayrollEmployee['employmentStatus'],
    kraPin: 'A009182930M',
    shaNo: 'SHA-849201',
    // TPAD fields
    tscNo: '',
    assignedGrade: 'Grade 7',
    assignedStream: '7 Amboseli',
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Sync branches to localStorage & Firestore
  useEffect(() => {
    localStorage.setItem('limuru_school_branches', JSON.stringify(branches));
  }, [branches]);

  // Sync role matrix to localStorage
  useEffect(() => {
    localStorage.setItem('limuru_role_matrix', JSON.stringify(roleMatrix));
  }, [roleMatrix]);

  // Load registered users from Firestore or fallback
  useEffect(() => {
    setLoadingUsers(true);
    if (db && isConfiguredWithRealFirebase()) {
      getDocs(collection(db, 'users'))
        .then((snap) => {
          if (!snap.empty) {
            const list: UserProfile[] = [];
            snap.forEach((d) => list.push(d.data() as UserProfile));
            setUsersList(list);
          } else {
            setUsersList(SYSTEM_USERS.map((u) => ({
              uid: u.id,
              fullName: u.name,
              email: u.email,
              role: (u.role === 'principal' ? 'headteacher' : u.role as any),
              active: true,
              createdAt: '2026-01-05',
              department: u.department,
              phone: u.phone,
              assignedGrade: u.assignedGrade,
              assignedStream: u.assignedStream,
            })));
          }
        })
        .catch(() => {
          // Fallback
          setUsersList(SYSTEM_USERS.map((u) => ({
            uid: u.id,
            fullName: u.name,
            email: u.email,
            role: (u.role === 'principal' ? 'headteacher' : u.role as any),
            active: true,
            createdAt: '2026-01-05',
            department: u.department,
            phone: u.phone,
          })));
        })
        .finally(() => setLoadingUsers(false));
    } else {
      setUsersList(SYSTEM_USERS.map((u) => ({
        uid: u.id,
        fullName: u.name,
        email: u.email,
        role: (u.role === 'principal' ? 'headteacher' : u.role as any),
        active: true,
        createdAt: '2026-01-05',
        department: u.department,
        phone: u.phone,
      })));
      setLoadingUsers(false);
    }
  }, []);

  // Handle Create School Branch
  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.branchName.trim()) return;

    const newBranch: SchoolBranch = {
      id: `br-${Date.now()}`,
      branchName: branchForm.branchName.trim(),
      branchCode: branchForm.branchCode.trim() || `20401823-B${branches.length + 1}`,
      parentSchoolId: 'sch-limuru-01',
      parentSchoolName: 'Limuru Model Comprehensive School',
      location: {
        county: 'Kiambu',
        subCounty: 'Limuru',
        ward: branchForm.ward,
        address: branchForm.address.trim() || 'Limuru Sub-County, Kiambu',
      },
      contact: {
        phone: branchForm.phone,
        email: branchForm.email || `branch${branches.length + 1}@limurumodel.sc.ke`,
        postalAddress: 'P.O. Box 240-00217, Limuru',
      },
      headOfBranch: {
        name: branchForm.headName.trim() || 'Branch Lead Teacher',
        tscNo: branchForm.headTsc.trim() || 'TSC-PENDING',
        phone: branchForm.headPhone,
        email: branchForm.email || 'lead@limurumodel.sc.ke',
      },
      capacity: Number(branchForm.capacity) || 300,
      currentEnrollment: 0,
      establishedYear: 2026,
      status: 'Active',
    };

    setBranches([...branches, newBranch]);
    showToast(`Registered new branch: ${newBranch.branchName}`);
    setIsAddBranchModalOpen(false);

    if (onLogAudit) {
      onLogAudit(
        'SCHOOL_BRANCH_REGISTER' as any,
        `Branch: ${newBranch.branchName}`,
        `Registered branch ${newBranch.branchCode} linked to Limuru Model Comprehensive School.`,
        'Restricted'
      );
    }
  };

  // Handle Add User (Linking to Branch, Payroll & TPAD)
  const handleCreateUserWithIntegrations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.fullName.trim() || !userForm.email.trim()) return;

    const selectedBranch = branches.find((b) => b.id === userForm.branchId) || branches[0];
    const generatedUid = `usr_${Date.now()}`;

    // 1. Create User Profile
    const newUserProfile: UserProfile = {
      uid: generatedUid,
      fullName: userForm.fullName.trim(),
      email: userForm.email.trim().toLowerCase(),
      role: userForm.role,
      active: true,
      createdAt: new Date().toISOString(),
      department: userForm.department,
      phone: userForm.phone,
      assignedGrade: userForm.role === 'teacher' ? userForm.assignedGrade : undefined,
      assignedStream: userForm.role === 'teacher' ? userForm.assignedStream : undefined,
    };

    setUsersList((prev) => [newUserProfile, ...prev]);

    // 2. Link to Payroll (Create PayrollEmployee Record)
    const newPayrollRecord: PayrollEmployee = {
      id: `emp_${Date.now()}`,
      tscOrIdNo: userForm.tscNo || `EMP-${Date.now().toString().slice(-4)}`,
      tscStaffNo: userForm.tscNo || `EMP-${Date.now().toString().slice(-4)}`,
      name: userForm.fullName.trim(),
      fullName: userForm.fullName.trim(),
      role: userForm.designation,
      designation: userForm.designation,
      cadre: 'TSC Permanent' as const,
      department: userForm.department as any,
      employmentStatus: userForm.employmentStatus,
      basicSalary: Number(userForm.monthlySalaryKes) || 45000,
      houseAllowance: 12000,
      commuterAllowance: 4000,
      hardshipAllowance: 0,
      grossPay: (Number(userForm.monthlySalaryKes) || 45000) + 16000,
      grossSalary: (Number(userForm.monthlySalaryKes) || 45000) + 16000,
      paye: Math.round(((Number(userForm.monthlySalaryKes) || 45000) + 16000) * 0.15),
      payeDeduction: Math.round(((Number(userForm.monthlySalaryKes) || 45000) + 16000) * 0.15),
      nssf: 1080,
      nssfDeduction: 1080,
      shaNhif: Math.round(((Number(userForm.monthlySalaryKes) || 45000) + 16000) * 0.0275),
      nhifShaDeduction: Math.round(((Number(userForm.monthlySalaryKes) || 45000) + 16000) * 0.0275),
      housingLevy: Math.round(((Number(userForm.monthlySalaryKes) || 45000) + 16000) * 0.015),
      housingLevyDeduction: Math.round(((Number(userForm.monthlySalaryKes) || 45000) + 16000) * 0.015),
      netPay: Math.round(((Number(userForm.monthlySalaryKes) || 45000) + 16000) * 0.75),
      netSalary: Math.round(((Number(userForm.monthlySalaryKes) || 45000) + 16000) * 0.75),
      bankName: userForm.bankName,
      bankAccountNo: userForm.bankAccountNo || '1102938475',
      kraPin: userForm.kraPin,
      month: '2026-10',
      status: 'Approved' as const,
      lastAppraisalScore: userForm.role === 'teacher' ? 84.5 : undefined,
      lastPaymentDate: '2026-10-25',
    };

    onAddPayrollEmployee(newPayrollRecord);

    // Save to Firestore if connected
    if (db && isConfiguredWithRealFirebase()) {
      setDoc(doc(db, 'users', generatedUid), newUserProfile, { merge: true }).catch(() => {});
      setDoc(doc(db, 'payrollEmployees', newPayrollRecord.id), newPayrollRecord, { merge: true }).catch(() => {});
    }

    showToast(`User created & linked to ${selectedBranch.branchName} and Payroll records!`);
    setIsAddUserModalOpen(false);

    if (onLogAudit) {
      onLogAudit(
        'USER_ADMIN_ADD' as any,
        `User: ${userForm.fullName} (${userForm.role})`,
        `Created staff account linked to ${selectedBranch.branchName}, Payroll (${userForm.bankName}), and TPAD.`,
        'Restricted'
      );
    }
  };

  // Toggle Permission Matrix Flag
  const handleTogglePermission = (
    roleKey: string,
    permissionKey: 'canView' | 'canAdd' | 'canEdit' | 'canDelete' | 'canApprove'
  ) => {
    const updated = {
      ...roleMatrix,
      [roleKey]: {
        ...roleMatrix[roleKey],
        [permissionKey]: !roleMatrix[roleKey][permissionKey],
      },
    };
    setRoleMatrix(updated);
    showToast(`Updated ${permissionKey} permission for ${roleMatrix[roleKey].role}.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950 text-emerald-100 border border-emerald-500 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Module Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-emerald-800" />
            <h2 className="text-lg font-bold text-slate-900">
              Institutional Administration & Multi-Campus Governance
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Register parent schools and multi-site branches, link staff to payroll and TPAD appraisals, and enforce granular role-level permission matrices.
          </p>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setAdminTab('add-schools')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
              adminTab === 'add-schools'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>Add Schools & Branches</span>
          </button>

          <button
            onClick={() => setAdminTab('add-users')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
              adminTab === 'add-users'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Add Users & Payroll Link</span>
          </button>

          <button
            onClick={() => setAdminTab('user-levels-roles')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
              adminTab === 'user-levels-roles'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>User Levels & Roles</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SUB-SECTION 1: ADD SCHOOLS & MULTI-BRANCH CAMPUSES
          ========================================================================= */}
      {adminTab === 'add-schools' && (
        <div className="space-y-5">
          {/* Parent School Overview Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 rounded-xl shadow-xs border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-mono text-[10px] font-bold uppercase">
                Parent Institution · Center No: 20401823
              </span>
              <h3 className="text-xl font-bold mt-1.5">Limuru Model Comprehensive School</h3>
              <p className="text-xs text-emerald-200 mt-1">
                Parent Hub School with 3 registered operational campuses in Kiambu County. All branch academic, fee, and TPAD returns consolidate under this charter.
              </p>
            </div>

            <button
              onClick={() => setIsAddBranchModalOpen(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors self-start md:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Register New School Branch</span>
            </button>
          </div>

          {/* Branches Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {branch.branchCode}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1.5">{branch.branchName}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {branch.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{branch.location.ward} Ward, {branch.location.county} County</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Head: <strong className="text-slate-800">{branch.headOfBranch.name}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{branch.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-[11px] text-slate-500">{branch.contact.email}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Enrollment: <strong className="text-slate-900">{branch.currentEnrollment}</strong> / {branch.capacity}
                  </span>
                  <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, (branch.currentEnrollment / branch.capacity) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-SECTION 2: ADD USERS LINKED TO BRANCH, PAYROLL & TPAD
          ========================================================================= */}
      {adminTab === 'add-users' && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700">Filter Branch:</span>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
              >
                <option value="All">All Campuses & Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.branchName}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Employee & Link to Payroll/TPAD</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold">
              <span>Institution & Branch Staff Directory ({usersList.length})</span>
              <span className="text-emerald-800 font-semibold">Consolidated with Payroll & KEMIS</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Staff Name</th>
                    <th className="p-3">Role & Level</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Email & Contact</th>
                    <th className="p-3">Payroll Integration</th>
                    <th className="p-3">TPAD Appraisal</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((usr) => {
                    const matchedPayroll = payrollEmployees.find(
                      (p) => (p.fullName || p.name || '').toLowerCase().includes(usr.fullName.toLowerCase().split(' ')[0])
                    );

                    return (
                      <tr key={usr.uid} className="hover:bg-slate-50">
                        <td className="p-3">
                          <strong className="text-slate-900 font-bold block">{usr.fullName}</strong>
                          <span className="font-mono text-[11px] text-slate-400">UID: {usr.uid.slice(0, 12)}...</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 capitalize">
                            {usr.role}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 font-medium">{usr.department || 'Staff'}</td>
                        <td className="p-3">
                          <div className="font-mono text-slate-800">{usr.email}</div>
                          <span className="font-mono text-slate-500 text-[11px]">{usr.phone || 'N/A'}</span>
                        </td>
                        <td className="p-3">
                          {matchedPayroll ? (
                            <div className="text-emerald-800 font-bold font-mono">
                              KES {matchedPayroll.basicSalary.toLocaleString()} / mo
                              <span className="block text-[10px] text-slate-500 font-normal">
                                {(matchedPayroll.bankName || 'KCB Bank').split(' ')[0]} ({(matchedPayroll.bankAccountNo || '1234567890').slice(-4)})
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Linked via Payroll Module</span>
                          )}
                        </td>
                        <td className="p-3">
                          {usr.role === 'teacher' || usr.role === 'headteacher' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active TPAD
                            </span>
                          ) : (
                            <span className="text-slate-400">N/A (Non-Teaching)</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-950">
                            Active
                          </span>
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

      {/* =========================================================================
          SUB-SECTION 3: USER LEVELS & ROLES (GRANULAR PERMISSION MATRIX)
          ========================================================================= */}
      {adminTab === 'user-levels-roles' && (
        <div className="space-y-5">
          {/* User Levels Explanatory Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { level: 'Level 1: MOE Oversight', scope: 'Ministry of Education & State Department', desc: 'County-wide audits, statutory reports, and policy directives.' },
              { level: 'Level 2: County Directorate', scope: 'Kiambu County Education Office', desc: 'Capitation distribution, teacher transfers, and QA standards.' },
              { level: 'Level 3: School Executive', scope: 'Parent Institution (Limuru Model)', desc: 'Executive leadership, BoM approvals, and unified finance.' },
              { level: 'Level 4: Campus / Branch', scope: 'Satellite Campuses (Rironi, Kamandura)', desc: 'Daily attendance, lesson observation, and local records.' },
            ].map((lvl, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {lvl.level}
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-1">{lvl.scope}</h4>
                <p className="text-[11px] text-slate-500 leading-snug">{lvl.desc}</p>
              </div>
            ))}
          </div>

          {/* Granular Role Permissions Matrix Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold">
              <span>Role Permissions Matrix (View, Add, Edit, Delete, Approve)</span>
              <span className="text-slate-500 font-normal">Click any permission cell to toggle operational authority</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Role Designation</th>
                    <th className="p-3">Authority Level</th>
                    <th className="p-3 text-center">View</th>
                    <th className="p-3 text-center">Add (Create)</th>
                    <th className="p-3 text-center">Edit (Update)</th>
                    <th className="p-3 text-center">Delete (Remove)</th>
                    <th className="p-3 text-center">Approve</th>
                    <th className="p-3">Accessible Functional Sections</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(roleMatrix).map(([key, config]) => (
                    <tr key={key} className="hover:bg-slate-50">
                      <td className="p-3">
                        <strong className="text-slate-900 font-bold block">{config.role}</strong>
                        <span className="text-[11px] text-slate-500">{config.description}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          {config.level}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleTogglePermission(key, 'canView')}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold transition-colors ${
                            config.canView ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {config.canView ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleTogglePermission(key, 'canAdd')}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold transition-colors ${
                            config.canAdd ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {config.canAdd ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleTogglePermission(key, 'canEdit')}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold transition-colors ${
                            config.canEdit ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {config.canEdit ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleTogglePermission(key, 'canDelete')}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold transition-colors ${
                            config.canDelete ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {config.canDelete ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleTogglePermission(key, 'canApprove')}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold transition-colors ${
                            config.canApprove ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {config.canApprove ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          {config.accessibleSections.map((sec, sIdx) => (
                            <span key={sIdx} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                              {sec}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ADD SCHOOL BRANCH
          ========================================================================= */}
      {isAddBranchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-emerald-800" />
                <h3 className="text-sm font-bold text-slate-900">Register New School Branch / Campus</h3>
              </div>
              <button onClick={() => setIsAddBranchModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Branch Campus Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Limuru Model Junior School (Ndeiya Campus)"
                  value={branchForm.branchName}
                  onChange={(e) => setBranchForm({ ...branchForm, branchName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Branch Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 20401823-NDE"
                    value={branchForm.branchCode}
                    onChange={(e) => setBranchForm({ ...branchForm, branchCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ward Location</label>
                  <input
                    type="text"
                    value={branchForm.ward}
                    onChange={(e) => setBranchForm({ ...branchForm, ward: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Branch Head / Lead Teacher</label>
                  <input
                    type="text"
                    placeholder="e.g. Mdm. Mary Wambui"
                    value={branchForm.headName}
                    onChange={(e) => setBranchForm({ ...branchForm, headName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Head TSC Number</label>
                  <input
                    type="text"
                    placeholder="e.g. TSC-491028"
                    value={branchForm.headTsc}
                    onChange={(e) => setBranchForm({ ...branchForm, headTsc: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Branch Contact Phone</label>
                  <input
                    type="text"
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Learner Capacity</label>
                  <input
                    type="number"
                    value={branchForm.capacity}
                    onChange={(e) => setBranchForm({ ...branchForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddBranchModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg text-xs shadow-xs"
                >
                  Register Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ADD USER WITH PAYROLL & TPAD INTEGRATIONS
          ========================================================================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-800" />
                <h3 className="text-sm font-bold text-slate-900">Add Staff Member & Connect Payroll/TPAD</h3>
              </div>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUserWithIntegrations} className="space-y-4 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. Samuel Kamau Kariuki"
                    value={userForm.fullName}
                    onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Institutional Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. skamau@limurumodel.sc.ke"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Role Designation</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="teacher">Teacher</option>
                    <option value="headteacher">Head Teacher / Principal</option>
                    <option value="deputy">Deputy Principal</option>
                    <option value="bursar">Bursar / Accountant</option>
                    <option value="nurse">School Nurse</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Campus / Branch</label>
                  <select
                    value={userForm.branchId}
                    onChange={(e) => setUserForm({ ...userForm, branchId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.branchName.split('(')[0]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* PAYROLL INTEGRATION SECTION */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs border-b border-slate-200 pb-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-800" />
                  <span>Payroll & Statutory Integration (Salary, Bank, Status)</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Monthly Basic Salary (KES)</label>
                    <input
                      type="number"
                      required
                      value={userForm.monthlySalaryKes}
                      onChange={(e) => setUserForm({ ...userForm, monthlySalaryKes: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Employment Status</label>
                    <select
                      value={userForm.employmentStatus}
                      onChange={(e) => setUserForm({ ...userForm, employmentStatus: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                    >
                      <option value="Permanent & Pensionable">Permanent & Pensionable (TSC/BoM)</option>
                      <option value="Contract">Contractual (Term-to-Term)</option>
                      <option value="Probationary">Probationary Period</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Bank Name</label>
                    <select
                      value={userForm.bankName}
                      onChange={(e) => setUserForm({ ...userForm, bankName: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                    >
                      <option value="Kenya Commercial Bank (KCB)">Kenya Commercial Bank (KCB)</option>
                      <option value="Equity Bank Kenya">Equity Bank Kenya</option>
                      <option value="Co-operative Bank">Co-operative Bank</option>
                      <option value="NCBA Bank">NCBA Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Bank Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 1102938475"
                      value={userForm.bankAccountNo}
                      onChange={(e) => setUserForm({ ...userForm, bankAccountNo: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* TEACHER TPAD INTEGRATION (Appears if role is teacher) */}
              {(userForm.role === 'teacher' || userForm.role === 'deputy' || userForm.role === 'headteacher') && (
                <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-xs border-b border-emerald-200 pb-1.5">
                    <Award className="w-4 h-4 text-emerald-800" />
                    <span>Teacher Performance Appraisal & Development (TPAD) Link</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">TSC Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. TSC-591028"
                        value={userForm.tscNo}
                        onChange={(e) => setUserForm({ ...userForm, tscNo: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-emerald-300 rounded text-xs font-mono font-bold bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Assigned Grade</label>
                      <select
                        value={userForm.assignedGrade}
                        onChange={(e) => setUserForm({ ...userForm, assignedGrade: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-emerald-300 rounded text-xs bg-white"
                      >
                        <option value="Grade 7">Grade 7 JSS</option>
                        <option value="Grade 8">Grade 8 JSS</option>
                        <option value="Grade 9">Grade 9 JSS</option>
                        <option value="Grade 6">Grade 6 Primary</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Class Stream</label>
                      <input
                        type="text"
                        value={userForm.assignedStream}
                        onChange={(e) => setUserForm({ ...userForm, assignedStream: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-emerald-300 rounded text-xs bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg text-xs shadow-xs"
                >
                  Create & Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
